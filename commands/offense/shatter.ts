	gosub :BOT~loadVars

	setVar $BOT~help[1]   $BOT~tab&"- shatter [photonbot] {planet}" 
	setVar $BOT~help[2]   $BOT~tab&"    Attempts to land, drop shields below 200, and  " 
	setVar $BOT~help[3]   $BOT~tab&"    photon enemy planet in sector." 
	setVar $BOT~help[4]   $BOT~tab&"    [photonbot]               "
	setVar $BOT~help[5]   $BOT~tab&"       - Person on planet who has a photon   " 
	setVar $BOT~help[6]   $BOT~tab&"    {planet}                         " 
	setVar $BOT~help[7]   $BOT~tab&"       - Optional planet number to attack if none supplied"  
	setVar $BOT~help[8]   $BOT~tab&"         defaults to first in list.    " 
	setVar $BOT~help[9]   $BOT~tab&"         Assumes you have enought fighters.    " 
	setVar $BOT~help[10]   $BOT~tab&"        Would be quicker if we could switch ships   " 
	
	
	gosub :bot~helpfile
	
	gosub :player~quikstats
	setVar $startingLocation $player~CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		setvar $switchboard~message "Must start from Citadel*"
        gosub :SWITCHBOARD~switchboard
		halt
	end
    
    if ($bot~parm1 = "")
        setvar $switchboard~message "Must supply a photon bot*"
        gosub :SWITCHBOARD~switchboard
		halt
    end
    setVar $photonBot $bot~parm1

    if ($bot~parm2 <> "")
        isNumber $test $bot~parm2
        if ($test)
            setVar $victimPlanet $bot~parm2
        else
            setVar $victimPlanet 0
        end
    end
    send "'Victimplanet:" $victimPlanet "*"
	gosub :SHIP~getShipStats
	if ($ship~SHIP_OFFENSIVE_ODDS = 0)
		setvar $switchboard~message "We didn't get offensive odds - aborting.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
    send "q"
	gosub :planet~getPlanetInfo
	send "c "
	
	setVar $originSector $PLAYER~CURRENT_SECTOR
	setVar $adjacentSector 0
	setVar $targetplanet 0
	setVar $ourplanet $planet~planet
	goSub :findAdjacent

	if ($adjacentSector = 0)
		setvar $switchboard~message "We don't have an adjacent sector to shoot from.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

    send "'" $photonBot " qss*"
    setVar $confirmedPlanet 0
    setVar $confirmedPhoton 0
    
    settextLineTrigger photonBotName :photonBotName "{" & $photonBot & "}"
    setDelayTrigger photonBotNameTimeout :photonBotNameTimeout 3000
    pause
        :photonBotNameTimeout
        killalltriggers
            setvar $switchboard~message "Couldn't find friendly bot - exiting*"
            gosub :SWITCHBOARD~switchboard
            halt
        :photonBotName
        killalltriggers

    setTextLineTrigger qssPlanetLine :qssPlanetLine "Sector   :"
    setTextLineTrigger qssPhotonsLine :qssPhotonsLine "Photons  :"
    setTextTrigger qssDone :qssDone "Bot Mode :General"
    pause
    :qssPlanetLine
        cuttext CURRENTLINE $planetID 62 4
        if ($planetID = $planet~planet)
            setVar $confirmedPlanet 1
        end
        pause
    :qssPhotonsLine
        killalltriggers
        cuttext CURRENTLINE $qssPhotons 23 3
		stripText $qssPhotons " "
        if ($qssPhotons > 0)
            setVar $confirmedPhoton 1
        end

	:qssDone
		if ($confirmedPlanet = 1) and ($confirmedPhoton = 1)
			setvar $switchboard~message "Photon Bot has photons, attacking from planet " & $planet~planet & ".*"
			gosub :SWITCHBOARD~switchboard

		else
			setvar $switchboard~message "Photon Bot has no photons or isn't in same sector.*"
			gosub :SWITCHBOARD~switchboard
			 
			halt
		end

	setVar $attack100Amount 0
	#$ship~SHIP_OFFENSIVE_ODDS
	#$ship~SHIP_FIGHTERS_MAX
send "'" $ship~SHIP_OFFENSIVE_ODDS " " $ship~SHIP_FIGHTERS_MAX "*"
	
	setPrecision 1
	setVar $figsFor100 ((100 * 20)/$ship~SHIP_OFFENSIVE_ODDS)
	send "'we need to kill 100:" $figsFor100 "*"
	setVar $figsFor100 ($figsFor100 * 10)
	setPrecision 0
	#round it
	setVar $figsFor100 $figsFor100 * 1
	
	if ($figsFor100 > $ship~SHIP_MAX_ATTACK)
		setVar $figsFor100 $ship~SHIP_MAX_ATTACK
	end
	setVar $attack100Amount $figsFor100
	send "'we need to kill 100:" $figsFor100 "*"

	if ($victimPlanet = 0)
		goSub :getTargetPlanet
	else
		setVar $targetplanet $victimPlanet
	end
	
	goSub :showTime
	
	halt
	:countPlanetsScan
		send "s* "
		setVar $planetsShieldLoc1 0
		setVar $planetsShieldLoc2 0
		setVar $planetsPresent 0
		setVar $planetsCountStart 0
		:countPlanetsKeepGoing
		setTextLineTrigger countPlanetsStart :countPlanetsStart "Sector  :"
		setTextLineTrigger countPlanetUnsh1 :countPlanetUnsh1 "Planets : ("
		setTextLineTrigger countPlanetShield1 :countPlanetShield1 "Planets : <<<<"
		setTextLineTrigger countPlanetUnsh2 :countPlanetUnsh2 "          ("
		setTextLineTrigger countPlanetShield2 :countPlanetShield2 "          <<<<"
		setTextLineTrigger countPlanetsEnd :countPlanetsEnd "Warps to Sector(s) :"
		pause
		:countPlanetsStart
			killalltriggers
			setVar $planetsCountStart 1
			goto :countPlanetsKeepGoing
		:countPlanetUnsh1
		:countPlanetUnsh2
			killalltriggers
			if ($planetsCountStart = 1)
				add $planetsPresent 1
			end
			goto :countPlanetsKeepGoing
			
		:countPlanetShield1
		:countPlanetShield2
			killalltriggers
			
			if ($planetsCountStart = 1)
				add $planetsPresent 1
				if ($planetsShieldLoc1 = 0)
					setVar $planetsShieldLoc1 $planetsPresent
				elseif ($planetsShieldLoc2 = 0)
					setVar $planetsShieldLoc2 $planetsPresent
				end
			end
			goto :countPlanetsKeepGoing
			
		:countPlanetsEnd 
			killalltriggers

			send "'Found " $planetsPresent "*"
	return


	:findAdjacent
			getSectorParameter $originSector "FIGSEC" $currentFigged
			setVar $adjacentSector 0
			setVar $i 1
			while ($i <= SECTOR.WARPINCOUNT[$originSector])
				setVar $chkSector SECTOR.WARPSIN[$originSector][$i]
				getSectorParameter $chkSector "FIGSEC" $isFigged
				if ($isFigged = 1)
					setVar $adjacentSector $chkSector
					return
				end
				add $i 1
			end


	return


	:getTargetPlanet
	# determine planet we want to shatter
	#	Do a planet count - get planet numbers, determine target, get plnet count again to confirm
		goSub :countPlanetsScan
		setVar $initialPlanets $planetsPresent

		setVar $planetLocStart 0
		setVar $planetsi 0


		send "q q l" $planet~planet "*mnt*c"
		:moreplist
		setTextLineTrigger plistStart :plistStart "Registry# and Planet Name"
		setTextLineTrigger plistCount :plistCount "> "
		setTextLineTrigger plistEnd :plistEnd "Land on which planet "
		pause
		:plistStart
			killalltriggers
			setVar $planetLocStart 1
			goto :moreplist
		:plistCount
			killalltriggers
			if ($planetLocStart = 1)
				add $planetsi 1
				getWord CURRENTLINE $cPlanetNum 1
				if ($cPlanetNum = "Land")
					setVar $planetLocStart 0
					goto :plistEnd
				elseif ($cPlanetNum = "<")
					getWord CURRENTLINE $cPlanetNum 2
					stripText $cPlanetNum ">"
				else
					stripText $cPlanetNum ">"
					stripText $cPlanetNum "<"
				end
				if ($planetsi = $planetsShieldLoc1)
					setVar $planetsShieldNum1 $cPlanetNum
				elseif ($planetsi = $planetsShieldLoc2)
					setVar $planetsShieldNum2 $cPlanetNum
				end
			end
			goto :moreplist

		:plistEnd
			killalltriggers

		goSub :countPlanetsScan
		if ($initialPlanets = $planetsPresent)
			
			if ($planetsShieldNum1 <> $planet~planet) and ($planetsShieldNum1 <> 0)
				setVar $targetplanet $planetsShieldNum1
			elseif ($planetsShieldNum2 <> $planet~planet) and ($planetsShieldNum2 <> 0)
				setVar $targetplanet $planetsShieldNum2
			else
				setvar $switchboard~message "Count not determine attack planet (Debug: shielded1: " & $planetsShieldNum1 & " Shielded2: " & $planetsShieldNum2 & " ).*"
				gosub :SWITCHBOARD~switchboard
					
				halt
			end
		else
			setvar $switchboard~message "Sector planet count changed during process.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		send "'targetplanet: " $targetplanet " shielded1: " $planetsShieldNum1 " Shielded2: " $planetsShieldNum2 " firstCount: " $initialPlanets " 2nd: " $planetsPresent " *"
		
	return

	:showTime

		setVar $shieldsLeft 999999

		setVar $attackString "qm * * * q l j"&#8&$targetplanet&"*z *  @"
		# we may as well knock off 100 shields right away
		setVar $attackString $attackString & "z a" & $attack100Amount & "*"
		# Then let's bug out and land - hopefully
		setVar $attackString $attackString & "* * q q q q r * l j"&#8&$ourplanet&"* j c * ^q "
		send $attackString 

		goSub :firstLandAction
		
		send "'Shields Left" $shieldsLeft "*"
		gosub :player~quikstats
		while ($shieldsLeft > 200)
			
			setVar $attackString "qm * * * q l j"&#8&$targetplanet&"*z *  @"

			setVar $shieldsToKill ($shieldsLeft - 100)
			setPrecision 1
			setVar $attackAmount ((($shieldsToKill * 20)/$ship~SHIP_OFFENSIVE_ODDS) * 10)
			setPrecision 0
			setVar $attackAmount $attackAmount * 1
			if ($attackAmount > $ship~SHIP_MAX_ATTACK)
				# multi wave - calculate based on no q-cannon as we can't calc that 
				# so send all waves, and re-evaulate shield situation
				if ($attackAmount > $ship~SHIP_FIGHTERS_MAX)
					# we can't use more than we have..
					setVar $attackAmount $ship~SHIP_FIGHTERS_MAX
				end
				setVar $figsReq $attackAmount
				while ($figsReq > 0)
					setVar $attackString $attackString & "z a" & $ship~SHIP_MAX_ATTACK & "** * "
					setVar $figsReq ($figsReq - $ship~SHIP_MAX_ATTACK)
					if ($figsReq <= $ship~SHIP_MAX_ATTACK)
						setVar $attackString $attackString & "z a" & $figsReq & "** * "
						setVar $figsReq 0
					end
				end
			else
				setVar $attackString $attackString & "z a" & $attackAmount & "*"
			end
			setVar $attackString $attackString & "* * q q q q r * l j"&#8&$ourplanet&"* j c * ^q "
			send $attackString 

			goSub :firstLandAction
			send "'Shields Left" $shieldsLeft "*"
			gosub :player~quikstats
		end
		
		goSub :doPhotonAndReturn
		
		setvar $switchboard~message "We have shattered their shields and ruined their day!*"
		gosub :SWITCHBOARD~switchboard
		halt
	return

	:doPhotonAndReturn
		send "p" $adjacentSector "*y"
		send "'" $photonBot " mac cpy" $originSector "^Mq*"
		setTextLineTrigger firedPhoton :firedPhoton "just launched a Photon Torpedo!"
		setDelayTrigger firePhotonWait :firePhotonWait 3000
		pause
		:firePhotonWait
			setvar $switchboard~message "Did not detect photon fire! Halting... *"
			gosub :SWITCHBOARD~switchboard
			halt
		:firedPhoton
			killalltriggers
			send "p" $originSector "*y"
	return


	:firstLandAction
		setTextLineTrigger  poddedFirst         :poddedFirst        "You rush to an escape pod and abandon ship"
		setTextTrigger 		hasnoShields 		:hasnoShields 		"You have to destroy the fighters defending the planet to land." 
		setTextTrigger 		madePastCannon 		:madePastCannon 		"You have to destroy the Planetary Shields defending the planet to land." 
		setTextTrigger  	blockedLanding		:blockedLanding	"Do you want instructions (Y/N)"
		setTextLineTrigger      noPlanetToShatter         :noPlanetToShatter       "Invalid registry number, landing aborted."
		setTextLineTrigger	InvadedOops		:InvadedOops		"Item    Colonists  Colonists    Daily     Planet      Ship      Planet"
		setTextLineTrigger	shipCanNotLand			:shipCanNotLand		"since it couldn't possibly stand the stress of landing."
		setTextLineTrigger      intervalLag               :intervalLag         "Average Interval Lag:"
		pause
		:poddedFirst 
			killalltriggers
			gosub :callsaveme
			setvar $switchboard~message "We may have died attempting shatter - send help!*"
			gosub :SWITCHBOARD~switchboard
			halt
		:madePastCannon 
			killalltriggers
			setTextLineTrigger fireAtShields :fireAtShields "You destroyed "
			pause
			:fireAtShields
				# at this point we can die again
			goSub :secondLandAction
			return
		:intervalLag
			# if we get here without a "You have to destroy" or other message - we dead.
			setvar $switchboard~message "We may have died attempting shatter - send help!*"
			gosub :SWITCHBOARD~switchboard
			halt
		:hasnoShields
			setVar $shieldsLeft 0
			goSub :secondLandAction

			return
		:blockedLanding
			setvar $switchboard~message "Defender is blocking planet landing - Shatter aborted!*"
			gosub :SWITCHBOARD~switchboard
			halt
		:noPlanetToShatter
			setvar $switchboard~message "Planet no longer in sector*"
			gosub :SWITCHBOARD~switchboard
			halt
		:InvadedOops
		:shipCanNotLand
			killalltriggers
			setvar $switchboard~message "Planet had no defenses - Continuing with mission.*"
			gosub :SWITCHBOARD~switchboard
			setVar $shieldsLeft 0
			
			return


	return
	:secondLandAction

		killalltriggers
		:moreShields
		setTextLineTrigger planetShieldsCount :planetShieldsCount " / Shields "
		setTextLineTrigger planetShielsAllDestroyed :planetShielsAllDestroyed  "You have to destroy the fighters defending the planet to land."
		setTextLineTrigger planetRetreat :planetRetreat "You turn tail and retreat from this planet."
		setTextLineTrigger	InvadedOops2		:InvadedOops2		"  Item    Colonists  Colonists    Daily     Planet      Ship      Planet"
		setTextLineTrigger	shipCanNotLand2			:shipCanNotLand2	"since it couldn't possibly stand the stress of landing."
		setTextLineTrigger      intervalLag2               :intervalLag2         ": ENDINTERROG"
		pause
		:planetShieldsCount
			killalltriggers
			getWord CURRENTLINE $shieldsLeft 5
			goto :moreShields
		:planetShielsAllDestroyed
			# if we got here we just bounced off figs
			killalltriggers
			setVar $shieldsLeft 0
			goto :moreShields
		:InvadedOops2
			# just landed on planet
			killalltriggers
			setVar $shieldsLeft 0
			return
		:planetRetreat
			killalltriggers
			return
		:shipCanNotLand2
			# no figs or defenses
			killalltriggers
			setVar $shieldsLeft 0
			return
		:intervalLag2
			killalltriggers
			setvar $switchboard~message "Looks like we died - still firing if on planet*"
			gosub :SWITCHBOARD~switchboard
			setVar $shieldsLeft 0
			gosub :player~quikstats
			if ($player~CURRENT_PROMPT <> "Citadel")
			
				halt
			end
			return
	return

:callsaveme
	send "'"&CURRENTSECTOR&"=saveme*q q q q * '"&$switchboard~bot_name&" call*"
return
#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipstats\ship"
