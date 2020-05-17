:hunt
	setvar $starting_sector_cannon $planet~SECTOR_CANNON
	setvar $starting_atmos_cannon $planet~ATMOSPHERE_CANNON
	setvar $sector_total ((($planet~planet_FUEL * $starting_sector_cannon) / 100)/3)

	loadvar $PLAYER~surroundFigs 
	if ($PLAYER~surroundFigs <= 0)
		setvar $PLAYER~surroundFigs 1
	end
	setvar $player~surroundPassive true
	setVar $PLAYER~onlyAliens TRUE
	setVar $PLAYER~cappingAliens TRUE
	setVar $PLAYER~defenderCapping TRUE
	setVar $PLAYER~surroundAvoidShieldedOnly TRUE


	setVar $lastTarget ""
	setVar $thisTarget ""

	gosub :validateFighterHit
	gosub :main~check_for_target_change
	gosub :attackandmoveship
	gosub :main~check_for_target_change
	gosub :dosurround
	gosub :main~check_for_target_change
	gosub :attackandmoveship
	gosub :main~check_for_target_change

	setVar $percentToSet (((3*$sector_total)*100)/$planet~planet_FUEL)
	if (((($planet~planet_FUEL * $percentToSet) / 100)/3) < $cannonDamage)
		add $percentToSet 1
	end
	if ($percentToSet > 100)
		setVar $percentToSet 100
	end

	send " *ls"&$percentToSet&"* la"&$starting_atmos_cannon&"*"  

return

:validateFighterHit
	:go_to_drop_sector
		killAllTriggers
		if ($photon~sector <> $player~current_sector)
			send "*ls0* la0*  p " $photon~sector "*y"
			setTextLineTrigger pwarpNotOk :pwarpTryAdjacent "You do not have any fighters in Sector "
			setTextLineTrigger pwarpOk :pwarpConfirmed " Planetary TransWarp Drive Engaged! "
			setTextLineTrigger pwarpOk2 :pwarpConfirmed "You are already in that sector!"
			pause
			
			:pwarpDone
				killAllTriggers
		end
		:pwarpTryAdjacent
			killAllTriggers
			setSectorParameter $photon~sector "FIGSEC" FALSE
			gosub :findAdjacent
			gosub :attemptDrop
			gosub :dosurround
			setvar $pwarp~destination $photon~sector
			gosub :pwarp~run
			setVar $index 1
			setVar $checkSector SECTOR.WARPS[$photon~sector][$index]
			while ($checkSector > 0)
				setvar $pwarp~destination $checksector
				gosub :pwarp~run
				gosub :attackandmoveship
				add $index 1
				setVar $checkSector SECTOR.WARPS[$photon~sector][$index]
			end
			return
		:pwarpConfirmed
			killalltriggers
			gosub :player~quikstats
			gosub :dosurround
			gosub :attackandmoveship
			if ($photon~sector <= 0)
				setvar $photon~sector $player~current_sector
			end
			setVar $index 1
			setVar $checkSector SECTOR.WARPS[$photon~sector][$index]
			while ($checkSector > 0)
				setvar $pwarp~destination $checksector
				gosub :pwarp~run
				gosub :attackandmoveship
				add $index 1
				setVar $checkSector SECTOR.WARPS[$photon~sector][$index]
			end
return
:findAdjacent
	getSectorParameter $photon~sector "FIGSEC" $isFigged
	setVar $i 1
	setVar $checkSector SECTOR.WARPS[$photon~sector][$i]
	setArray $targetSectors 6
	setVar $targetCount 0
	while ($checkSector > 0)
		add $targetCount 1
		setVar $targetSectors[$targetCount] $checkSector
		add $i 1
		setVar $checkSector SECTOR.WARPS[$photon~sector][$i]
	end
	if ($targetCount <= 0)
		setvar $switchboard~message " No Targets..*"
		gosub :bot~echo 
		setVar $targetSectors[1] $CURRENT_LOCATION
	end

return
:attemptDrop
	
	if ($targetCount > 0)
		getRnd $randomTarget 1 $targetCount
		setVar $gotoSector $targetSectors[$randomTarget]
		setvar $pwarp~destination $gotoSector
		gosub :pwarp~run
	end
	
return


:dosurround
	if ($player~surroundPassive = true)
		gosub :dscan~run		
	end
	send "q "
	gosub :PLANET~getPlanetInfo
	send "q "
	gosub :grid~surround
	send "l "&$planet~planet&"* m*** c "
	setVar $SWITCHBOARD~message "Surrounded sector "&$PLAYER~CURRENT_SECTOR&".*"
	gosub :SWITCHBOARD~switchboard
	setvar $switchboard~message "* " & ANSI_14 & $PLAYER~surroundOutput & "*" & ANSI_7
	gosub :bot~echo

return

:attackandmoveship
		gosub :PLAYER~currentprompt
		setvar $startingLocation $player~current_prompt
		if ($player~current_prompt = "Command")
			gosub :PLANET~landingSub		
			gosub :PLAYER~currentprompt
		end
		setVar $SECTOR~federalCount 0
		setvar $SECTOR~fakeTraderCount 1
		setVar $targetsFound FALSE
		while ($SECTOR~fakeTraderCount > $SECTOR~federalCount)
			gosub :PLAYER~currentprompt
			setvar $player~startingLocation $player~current_prompt
			if ($player~current_prompt = "Command")
				gosub :PLANET~landingSub		
				gosub :PLAYER~currentprompt
				setvar $player~startingLocation $player~current_prompt
			end
			goSub :SECTOR~getSectorData			
			if ($SECTOR~realTraderCount > $SECTOR~corpieCount)
				setvar $targetsFound true
				gosub :combat~fastCitadelAttack
				send "'Just attacked (and hopefully killed) a trader in my sector! Sector "&$player~current_sector&".*"
			end
			if ($SECTOR~fakeTraderCount > $SECTOR~federalCount)
				setVar $targetsFound TRUE
				goSub :combat~fastCapture
			end
		end
		gosub :PLAYER~currentprompt
		if ($player~current_prompt = "Command")
			gosub :PLANET~landingSub
		end
		send "q m*** c "
		gosub :PLAYER~quikstats
		setVar $startingSector $PLAYER~CURRENT_SECTOR
		if (($PLAYER~SHIELDS < $SHIP~SHIP_SHIELD_MAX) and ($planet~planet_shields > 360))
			setVar $player~shields_needed ($SHIP~SHIP_SHIELD_MAX - $PLAYER~SHIELDS)
			setVar $planet~planet_shields_to_take ($player~shields_needed/10)
			send "gf"&$planet~planet_shields_to_take&"*"
		end

		if ($targetsFound = TRUE)

			send "s*  "
			waiton "Warps to Sector(s) : "
			setVar $figowner SECTOR.FIGS.OWNER[currentsector]
			setVar $figCount SECTOR.FIGS.QUANTITY[currentsector]

			if (($figcount <= 0) or (($figOwner <> "belong to your Corp") AND ($figOwner <> "yours")))
				gosub :xenter~run
			end		
			setVar $emptyShips SECTOR.SHIPCOUNT[currentsector]
			if ($emptyShips > 0)
				loadVar $MAP~stardock
				if ($filterships <> "")
					setVar $BOT~user_command_line " moveship h silent "&#34&$filterships&#34
					setVar $BOT~parm1 $MAP~home_sector
					gosub :moveship~run
					send "s*  "
					gosub :player~quikstats
					setVar $emptyShips SECTOR.SHIPCOUNT[currentsector]
				end
				if ($emptyships > 0)
					if ($sell)
						if ($home = true)
							setVar $BOT~user_command_line " moveship "&$homesector&" silent"
							setVar $BOT~parm1 $homesector
						else
							setVar $BOT~user_command_line " moveship "&$MAP~stardock&" sell dep silent"
							setVar $BOT~parm1 $MAP~stardock
						end
					else
							setVar $BOT~user_command_line " moveship "&$homesector&" silent"
							setVar $BOT~parm1 $homesector
					end
					gosub :moveship~run
					if ($startingSector <> $player~current_sector)
						setvar $switchboard~message "Can't twarp back to the planet!  Probably sector fig killed by an alien.*"
						gosub :switchboard~switchboard
						halt
					end
				end
				gosub :PLAYER~currentprompt
				if ($player~current_prompt = "Command")
					gosub :PLANET~landingSub
				end
			end
		end
return




#INCLUDES:
include "source\bot_includes\player\currentprompt\player"
include "source\bot_includes\grid\surround\grid"
include "source\bot_includes\planet\landingsub\planet"
include "source\bot_includes\planet\landonplanetentercitadel\planet"
include "source\bot_includes\player\buy\player"
include "source\bot_includes\external\dscan"
include "source\bot_includes\external\moveship"
include "source\bot_includes\external\xenter"
include "source\bot_includes\external\mow"
include "source\bot_includes\external\max"
include "source\bot_includes\external\pwarp"
include "source\bot_includes\external\scrub"
