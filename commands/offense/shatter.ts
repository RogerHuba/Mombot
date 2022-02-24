	gosub :BOT~loadVars

	setVar $BOT~help[1]   $BOT~tab&"- shatter [photonbot] {planet} {rbot} {invade} {escape} {l}" 
	setVar $BOT~help[2]   $BOT~tab&"    Attempts to land, drop shields below 200, and  " 
	setVar $BOT~help[3]   $BOT~tab&"    photon enemy planet in sector." 
	setVar $BOT~help[4]   $BOT~tab&"    [photonbot]               "
	setVar $BOT~help[5]   $BOT~tab&"       - Person on planet who has a photon   " 
	setVar $BOT~help[6]   $BOT~tab&"    {planet}                         " 
	setVar $BOT~help[7]   $BOT~tab&"       - Optional planet number to attack if none supplied"  
	setVar $BOT~help[8]   $BOT~tab&"         defaults to first in list.    " 
	setVar $BOT~help[9]   $BOT~tab&"         Assumes you have enought fighters.    " 
	setVar $BOT~help[10]   $BOT~tab&"        Would be quicker if we could switch ships   " 
	setVar $BOT~help[11]   $BOT~tab&"            "
	setVar $BOT~help[11]   $BOT~tab&"   {rbot}   - Callin rbot - retreat of shields and moth person"
	setVar $BOT~help[11]   $BOT~tab&"   {invade} - Continue and invade planet "
	setVar $BOT~help[11]   $BOT~tab&"   {escape} - Warp planet out post invasion"
	setVar $BOT~help[11]   $BOT~tab&"   {l}      - Repeat last command i.e. run command "
	setVar $BOT~help[11]   $BOT~tab&"              somewhere safe. "
	setVar $BOT~help[11]   $BOT~tab&"              >shatter mind invade escape rbot"
	setVar $BOT~help[11]   $BOT~tab&"              Then when in sector"
	setVar $BOT~help[11]   $BOT~tab&"              >shatter l"
	setVar $BOT~help[11]   $BOT~tab&"              it will repeat as per previous command"
	setVar $BOT~help[11]   $BOT~tab&"            "
	setVar $BOT~help[12]   $BOT~tab&"- shatter [firephoton] [sector] "
	setVar $BOT~help[13]   $BOT~tab&"    Used to make photon bot shoot on the second for"
	setVar $BOT~help[14]   $BOT~tab&"    invasion mode"
	

	gosub :bot~helpfile
	gosub :player~quikstats


	setVar $startingLocation $player~CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		setvar $switchboard~message "Must start from Citadel*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
    
	LOADVAR $shatter_photonbot
	LOADVAR $shatter_rbot
	LOADVAR $shatter_planet
	LOADVAR $shatter_invade
	LOADVAR $shatter_escape
	

    if ($bot~parm1 = "")
        setvar $switchboard~message "Must supply a photon bot*"
        gosub :SWITCHBOARD~switchboard
		halt
    end

	if ($bot~parm1 = "firephoton")
        if ($bot~parm2 <> "")
			isNumber $test $bot~parm2
			if ($test)
				if ($startingLocation <> "Citadel")
					if ($startingLocation = "Planet")
						send "c"
					else
						setvar $switchboard~message "Wrong prompt! Send to Citadel: " & $startingLocation & "*"
						gosub :SWITCHBOARD~switchboard
						halt
					end
				end
				setVar $photonSector $bot~parm2
				goSub :fireTimedPhoton
			else
				setvar $switchboard~message "Need a sector to photon*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
	    end
    end

	setVar $doPlanetEscape FALSE
	setVar $doInvasion FALSE

	if ($bot~parm1 = "l")
        setvar $switchboard~message "Replaying last command - hold on!*"
        gosub :SWITCHBOARD~switchboard
		setVar $photonBot $shatter_photonbot
		setVar $victimPlanet $shatter_planet
		setVar $rbot $shatter_rbot
		if ($rbot = "0")
			setVar $rbot ""
		end
		if ($shatter_invade = 1)
			setVar $doInvasion TRUE
		end
		if ($shatter_escape = 1)
			setVar $doPlanetEscape TRUE
		end
		
		
	else
		setVar $photonBot $bot~parm1

		if ($bot~parm2 <> "")
			isNumber $test $bot~parm2
			if ($test)
				setVar $victimPlanet $bot~parm2
			else
				setVar $victimPlanet 0
			end
		end

		setVar $rbot 0
		getWordPos $bot~user_command_line $pos "rbot"
		if ($pos > 0)
			setVar $rbot 1
			replaceText $bot~user_command_line " rbot " " "
			replaceText $bot~user_command_line " rbot" " "
			setvar $switchboard~message "Using rbot to retreat from planet shields and moth pre-shatter.*"
			gosub :SWITCHBOARD~switchboard
			send "'rbot callout*"
			setTextLineTrigger rbotcallout :rbotcallout "Team: rbot Sec"
			setDelayTrigger rbotcallouttimeout :rbotcallouttimeout 5000
				pause
				:rbotcallouttimeout
				killalltriggers
					setvar $switchboard~message "Couldn't find Retreat Bot - exiting*"
					gosub :SWITCHBOARD~switchboard
					halt
				:rbotcallout
				killalltriggers
		end


		if ($player~PHOTONS > 0)
			setvar $switchboard~message "Sorry the other guys carries the photons, not us.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		
		getWordPos $bot~user_command_line $pos "invade"
		if ($pos > 0)
			replaceText $bot~user_command_line " invade " " "
			replaceText $bot~user_command_line " invade" " "
			setVar $doInvasion TRUE
		end
		
		getWordPos $bot~user_command_line $pos "escape"
		if ($pos > 0)
			replaceText $bot~user_command_line " escape " " "
			replaceText $bot~user_command_line " escape" " "
			setVar $doPlanetEscape TRUE
		end


		setVar $shatter_photonbot $photonBot
		if ($victimPlanet > 0)
			setVar $shatter_planet $victimPlanet
		else
			setVar $shatter_planet  ""
		end
		setVar $shatter_rbot $rbot
		if ($doInvasion = TRUE)
			setVar $shatter_invade 1
		else
			setVar $shatter_invade 0
		end
		if ($doPlanetEscape = TRUE)
			setVar $shatter_escape 1
		else
			setVar $shatter_escape 0
		end
    end
	
	SAVEVAR $shatter_photonbot
	SAVEVAR $shatter_rbot
	SAVEVAR $shatter_planet
	SAVEVAR $shatter_invade
	SAVEVAR $shatter_escape
  	
    
    echo "$shatter_photonbot " $shatter_photonbot "*"
	echo "$shatter_rbot " $shatter_rbot "*"
	echo "$shatter_planet " $shatter_planet "*"
	echo "$shatter_invade " $shatter_invade "*"
	echo "$shatter_escape " $shatter_escape "*"
	


    #send "'Victimplanet:" $victimPlanet "*"
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
    setDelayTrigger photonBotNameTimeout :photonBotNameTimeout 5000
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
		stripText $planetID " "
	
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
	
	setPrecision 1
	setVar $figsFor100 ((100 * 20)/$ship~SHIP_OFFENSIVE_ODDS)
	
	setVar $figsFor100 ($figsFor100 * 10)
	setPrecision 0
	#round it
	setVar $figsFor100 $figsFor100 * 1
	
	if ($figsFor100 > $ship~SHIP_MAX_ATTACK)
		setVar $figsFor100 $ship~SHIP_MAX_ATTACK
	end
	setVar $attack100Amount $figsFor100
	#send "'we need to kill 100:" $figsFor100 "*"

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
		setTextLineTrigger countPlanetsEnd2 :countPlanetsEnd2 "Ships   :"
		setTextLineTrigger countPlanetsEnd3 :countPlanetsEnd3 "Traders :"
		
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
		:countPlanetsEnd2
		:countPlanetsEnd3
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
		setVar $planetInvaded 0
		setVar $planetFigsLeft 0
		setVar $shieldsLeft 999999

		setVar $attackString "qm * * * q l j"&#8&$targetplanet&"*z *  @"
		# we may as well knock off 100 shields right away
		setVar $attackString $attackString & "z a" & $attack100Amount & "*"
		# Then let's bug out and land - hopefully
		setVar $attackString $attackString & "* * q q q q r * l j"&#8&$ourplanet&"* j c * ^q "

		if ($rbot = 1)
	# rbot r * l10* * * r l11* * mnt* q 
			setvar $rbotString "r ^M  l "&$targetplanet&"^M ^M  ^M  ^M "
			send "'rbot mac " $rbotString "*"
			setDelayTrigger rbotattack :rbotattack 250
			pause
			:rbotattack 
				killtrigger rbotattack
		end

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
		
		
		send "p" $adjacentSector "*y"
		if ($doInvasion = TRUE)
			send "'" $photonBot " shatter firephoton " $originSector "*"
			goSub :doPhotonAndReturn
			goSub :doInvasion
		else
			send "'" $photonBot " mac cpy" $originSector "^Mq*"
			goSub :doPhotonAndReturn
		end
		
		
		setvar $switchboard~message "We have shattered their shields and ruined their day!*"
		gosub :SWITCHBOARD~switchboard
		halt
	return

	:doInvasion

		
		# Invasions options? to do?
		#  - Warn if we don't have enough figs - i.e. perhaps attack - and flee? or restock
		#  - Post invasion - skip town next door with both planets (i.e. other bot moves one, we move other)
		#  - Post invasion - if successful - move X figs to sector? - DEF if we evict - i.e. offensive figs, they can't take out?
		#  - Post invasion - move to nearest safe sector?
		#  - ZDY option - ZDY with colo kill? i.e. fire everything into colo attack minus X for mines/haz
		#  - Post invasion defend planet? Think easier to move.. 
		
		loadVar $GAME~PHOTON_DURATION
		loadVar $GAME~LATENCY
		loadVar $GAME~DELAYPLANET
		loadVar $GAME~DELAYOTHERATTACK
		loadVar $GAME~DELAYPHOTONLAUNCH
		loadVar $GAME~DELAYPHOTONDELAY
		loadVar $SHIP~SHIP_MAX_ATTACK
		loadVar $SHIP~SHIP_FIGHTERS_MAX
		
		setVar $otherTradersPresent 0
		setVar $otherTradersEvicted 0
		
		setVar $doWeHaveEnoughFigs 0

		send "qdc"
		waitfor "Item    Colonists  Colonists"
		setTextLineTrigger ourPlanetFigs :ourPlanetFigs "Fighters"
		pause
		:ourPlanetFigs
			killalltriggers
			getWord CURRENTLINE $pfigs 5
			getWord CURRENTLINE $sfigs 6
			stripText $pfigs ","
			stripText $sfigs ","
			stripText $pfigs "."
			stripText $sfigs "."
			setVar $ourFigsAvailable ($pfigs + $sfigs)



		# Photon Firing Time - bot talk - shooting - checking planet figs again
		setVar $totalTime (($GAME~LATENCY * 4) + $GAME~DELAYPHOTONLAUNCH + $GAME~DELAYPHOTONDELAY)
		# Planet back
		setVar $totalTime $totalTime + ($GAME~DELAYPLANET + ($GAME~LATENCY * 2))


		##### COMBAT CALCS - JUST DOING EVERYTHING FOR NOW NOT SURE WHAT WE NEED ####

		# How many attack waves per landing action can this ship do.
		#   Using setprecession we conver 4.8 waves into 4 (always rounds down)
		setPrecision 1
		setVar $attackWavesPerAttack $SHIP~SHIP_FIGHTERS_MAX/$SHIP~SHIP_MAX_ATTACK
		setPrecision 0
		setVar $attackWavesPerAttack ($attackWavesPerAttack * 1)

		if ($attackWavesPerAttack < 1)
			setVar $attackWavesPerAttack 1
		end

		setVar $ourFigsUsedPerAttack ($attackWavesPerAttack * $SHIP~SHIP_MAX_ATTACK)
		setPrecision 1
		# Max attacks we have avialable - Round up and fully commit i.e. 4.7 attacks or 4.2 attacks both = 5
		setVar $maxAttacksByOurFigs ($ourFigsAvailable/($attackWavesPerAttack * $SHIP~SHIP_MAX_ATTACK))
		#our odds per attack run
		setVar $ourOddsPerAttackRun (($ship~SHIP_OFFENSIVE_ODDS * ($ourFigsUsedPerAttack))/10)
		
		# what we expect to destroy per run i.e. odds/3 - MIL REACTION FACTOR
		setVar $figReductionPerRun ($ourOddsPerAttackRun/3)
		setPrecision 0

		# ROUNDING
		setVar $maxAttacksByOurFigs (($maxAttacksByOurFigs * 1) + 1)
		setVar $ourOddsPerAttackRun ($ourOddsPerAttackRun * 1)
		setVar $figReductionPerRun ($figReductionPerRun * 1)

		


	
		#### TIMINGS - THIS ALL WORK IN PROGRESS AND MAY BE USELESS
		#  How I calc This
		#    Everytime we have a waitfor equivalent we add a latency
		#    Everytime we do an action - i.e. lift, fake jetisson etc, we had 10 ms (Internal TWGS latency)
		#    When we communicate with another bot for an action, 2 x Latency
		#
		#    - Not sure how much non actions count i.e. sending "******" on attack prompt
		#          - very testible tho - i.e. repeat various macro's and time them


		# Takng Guess at how internal timings work. Roughly 12 actions on the macro
		setVar $timePerAttack (12 + ($attackWavesPerAttack * 2)) * 10
		# Attack Time + first attack
		setVar $totalTime $totalTime + $timePerAttack

		setVar $timeWeHave ($GAME~PHOTON_DURATION * 1000)
		setVar $timeLeft ($timeWeHave - $totalTime)
		setPrecision 1
		setVar $maxAttacksByTime ($timeLeft/$timePerAttack)
		setPrecision 0
		setVar $maxAttacksByTime ($maxAttacksByTime * 1)

		echo " timeWeHave " $timeWeHave "*"
		echo " totalTime " $totalTime "*"
		echo " timeLeft " $timeLeft "*"
		echo " timePerAttack " $timePerAttack "*"
		echo " maxAttacksByTime " $maxAttacksByTime "*"
		echo " shieldsLeft " $shieldsLeft "*"
		echo " planetFigsLeft " $planetFigsLeft "*"
		echo " planetInvaded " $planetInvaded "*"

		#create some macros
		
		# middle attacks - shoot and reload with safety
		setVar $oneAttack "qm * * * q l j"&#8&$targetplanet&"*z *  l j"&#8&$ourplanet&"*z * " 
		
		# do evictions etc
		setVar $lastattack "qm * * * q l j"&#8&$targetplanet&"*z *  l j"&#8&$ourplanet&"*z * "

		# First Attack (i.e. taking out shields when fig quantity unknown) will have backup
		# to land us in our citadel computer prompt. This way if we die/miss their planet
		# we won't accidently evict our own players - maybe lol
		setVar $firstAttack "qm * * * q l j"&#8&$targetplanet&"*z *  l j"&#8&$ourplanet&"*z * c c c "


		setVar $i 1
		while ($i <= $attackWavesPerAttack)
			setVar $oneAttack $oneAttack & "a z " & $SHIP~SHIP_MAX_ATTACK & "*"
			setVar $lastattack $lastattack & "a z " & $SHIP~SHIP_MAX_ATTACK & "*"

			# shields left should be approximately 100 - so we'll guestimate a double attack
			if ($i = 1 and $shieldsLeft > 0)
				setVar $shieldAttack ($attack100Amount * 2)
				setVar $figAttack ($SHIP~SHIP_MAX_ATTACK - ($attack100Amount * 2))
				setVar $firstAttack $firstAttack & "a z " & $shieldAttack& "* * * " & "a z " & $figAttack& "*"
			else
				setVar $firstAttack $firstAttack & "a z " & $SHIP~SHIP_MAX_ATTACK & "*"
			end

			add $i 1
		end

		# attempt planet ownership + evict
		setVar $evict "* * o c * * cvy * * Q "
		
		setVar $firstAttack $firstAttack & $evict & "* * q q q q r * l j"&#8&$ourplanet&"* j c * ^q "
		setVar $oneAttack $oneAttack & "* * q q q r * l j"&#8&$ourplanet&"* j c *  "
		if ($doPlanetEscape = TRUE)
			setVar $planetEscape "c p" $adjacentSector "*y * * Q "
		else
			setVar $planetEscape   "* * q q q q r * l j"&#8&$ourplanet&"* j c * ^q "
		end
		setVar $lastattack $lastattack & $evict & $planetEscape 
		
		# Ok - We are at the "done nothing yet" stage.
		if ($planetInvaded = 1)
			# we must have accidently invaded it on the photon action
			# still run first attack - Will Claim/Evict and if we add logic to do other things
			# such as ZDY etc. It can include that.
			if ($doPlanetEscape = TRUE)
				#means we didn't do this
			end
			send $lastattack
		else
			send $firstAttack
		end
		
		# blocks your attempt to enter orbit.  You will

		
		goSub :firstLandAction

		echo " shieldsLeft " $shieldsLeft "*"
		echo " planetFigsLeft " $planetFigsLeft "*"
		echo " otherTradersPresent " $otherTradersPresent "*"
		echo " otherTradersEvicted " $otherTradersEvicted "*"
		echo " planetInvaded " $planetInvaded "*"

		if ($planetInvaded = 0)
			
			// ADJUST FOR FIRST ATTACK WE JUST DID
			setVar $ourFigsAvailable ($ourFigsAvailable - $ourFigsUsedPerAttack)
			setvar $maxAttacksByOurFigs ($maxAttacksByOurFigs - 1)

			##### COMBAT CALCS - ONCE WE HAVE ENEMY FIGS WE ARE AGAINST
			#convert planet figs to proper odds 100k figs 300k
			setVar $enemyPlanetFigOdds ($planetFigsLeft * 3)

			# Assuming cannons stay off and nothing else changes.
			if ($enemyPlanetFigOdds > $ourFigsAvailable)
				setVar $doWeHaveEnoughFigs 0
			else
				setVar $doWeHaveEnoughFigs 1
			end

			# we are all assuming no cannons - we need to round up
			setPrecision 1
			setVar $minimumAttackRunsRequired ($enemyPlanetFigOdds / $ourOddsPerAttackRun)
			setPrecision 0
			setVar $minimumAttackRunsRequired ($minimumAttackRunsRequired * 1) + 1

			setVar $attacksToDo $minimumAttackRunsRequired
			if ($maxAttacksByTime < $attacksToDo)
				setVar $attacksToDo $maxAttacksByTime
			end

			if ($maxAttacksByOurFigs < $attacksToDo)
				setVar $attacksToDo $maxAttacksByOurFigs
			end

			echo " ourFigsAvailable " $ourFigsAvailable "*"
			echo " attackWavesPerAttack " $attackWavesPerAttack "*"
			echo " maxAttacksByOurFigs " $maxAttacksByOurFigs "*"
			echo " planetFigsLeft " $planetFigsLeft "*"
			echo " enemyPlanetFigOdds " $enemyPlanetFigOdds "*"
			echo " doWeHaveEnoughFigs " $doWeHaveEnoughFigs "*"
			echo " ourOddsPerAttackRun " $ourOddsPerAttackRun "*"
			echo " ourFigsUsedPerAttack " $ourFigsUsedPerAttack "*"
			echo " figReductionPerRun " $figReductionPerRun "*"
			echo " minimumAttackRunsRequired " $minimumAttackRunsRequired "*"

			
			setVar $i 1
			while ($i < $attacksToDo)
				send $oneAttack
				add $i 1
			end

			send $lastattack
		end
		if ($doPlanetEscape = TRUE)
			send "'" $photonBot " p " $adjacentSector "*"
		end

		setvar $switchboard~message "Invasion complete! - How'd we go corpies??*"
		gosub :SWITCHBOARD~switchboard
halt
		# STOP - Add to macro L<theirs>L<ours> - if have scanner?
	return

	:doPhotonAndReturn
		
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
			waitfor "Planetary TransWarp Drive Engaged"
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
			killalltriggers
			# if we get here without a "You have to destroy" or other message - we dead.
			setvar $switchboard~message "We may have died attempting shatter - send help!*"
			gosub :SWITCHBOARD~switchboard
			halt
		:hasnoShields
			killalltriggers
			setVar $shieldsLeft 0
			goSub :secondLandAction

			return
		:blockedLanding
			killalltriggers
			setvar $switchboard~message "Defender is blocking planet landing - Shatter aborted!*"
			gosub :SWITCHBOARD~switchboard
			halt
		:noPlanetToShatter
			killalltriggers
			setvar $switchboard~message "Planet no longer in sector*"
			gosub :SWITCHBOARD~switchboard
			halt
		:InvadedOops
			setVar $planetInvaded 1
		:shipCanNotLand
			killalltriggers
			setvar $switchboard~message "Planet had no defenses - Continuing with mission.*"
			gosub :SWITCHBOARD~switchboard
			setVar $shieldsLeft 0
			setVar $planetFigsLeft 0
			
			return


	return
	:secondLandAction
echo "ENTERED SECOND ACTION*"
		killalltriggers
		:moreShields
		setTextLineTrigger planetShieldsCount :planetShieldsCount " / Shields "
		setTextLineTrigger planetFigsCount :planetFigsCount "Fighters: "
		setTextLineTrigger planetShielsAllDestroyed :planetShielsAllDestroyed  "You have to destroy the fighters defending the planet to land."
		setTextLineTrigger planetFigsAllDestroyed :planetFigsAllDestroyed "You destroyed all the fighters, the planet is cleared to invade!"
		setTextLineTrigger planetRetreat :planetRetreat "You turn tail and retreat from this planet."
		setTextLineTrigger	InvadedOops2		:InvadedOops2		"  Item    Colonists  Colonists    Daily     Planet      Ship      Planet"
		setTextLineTrigger	shipCanNotLand2			:shipCanNotLand2	"since it couldn't possibly stand the stress of landing."
		setTextLineTrigger      intervalLag2               :intervalLag2         ": ENDINTERROG"
		setTextLineTrigger otherTraders :otherTraders "Other Traders Here                  Ship Type"
		setTextLineTrigger otherTradersEvicted :otherTradersEvicted "You enter the code into the Citadel computer to start"
		#setTextLineTrigger qcanDamage :qcanDamage "The console reports damages of "
		#setTextLineTrigger figDamage :figDamage "Combat computer reports damages of"

		pause
		:otherTraders
			killalltriggers
			setVar $otherTradersPresent 1
			goto :moreShields
		:otherTradersEvicted
			killalltriggers
			setVar $otherTradersEvicted 1
			goto :moreShields
		:planetFigsCount
			#Fighters: 139355 / 1910079
			killalltriggers
			getWord CURRENTLINE $planetFigsLeft 4
			goto :moreShields
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
		:planetFigsAllDestroyed
			
			# just landed on planet
			killalltriggers
			setVar $planetInvaded 1
			setVar $shieldsLeft 0
			setVar $planetFigsLeft 0
			goto :moreShields
		:planetRetreat
			killalltriggers
			return
		:shipCanNotLand2
			# no figs or defenses
			killalltriggers
			setVar $shieldsLeft 0
			setVar $planetFigsLeft 0
			return
		:intervalLag2
			# unsure what this is for??
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

##### PHOTON BOT FOR INVASIONS

:fireTimedPhoton
	send "c"
	send "  t"
	waitfor ", 2"
	getWord CURRENTLINE $initTime 1
	:Photon_Attack_Timer
		send "  t"
		waitfor ", 2"
		getWord CURRENTLINE $currentTime 1
		waitfor "Computer"
		if ($initTime <> $currentTime)
			send "py" $photonSector "*q"
			setTextLineTrigger	wrong	:foton_wrong	"That is not an adjacent sector"
			setTextLineTrigger	gotem	:foton_gotem	"Photon Missile launched into sector"
			setTextLineTrigger	wrong2	:foton_wrong2	"The Feds do not permit Photon Torpedos"
			pause

		:foton_wrong2
			killalltriggers
			setvar $switchboard~message "Can not shoot into fed, or have planets, so what the?*"
			gosub :SWITCHBOARD~switchboard
			halt
		:foton_wrong
			killalltriggers
			setvar $switchboard~message "Sector not next door - fail!*"
			gosub :SWITCHBOARD~switchboard
			halt
		:foton_gotem
			# we done
			halt
		else
			goto :Photon_Attack_Timer
		end

halt	


#### 
#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipstats\ship"
