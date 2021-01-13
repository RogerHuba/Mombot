:hunt
	loadvar $PLAYER~surroundFigs 
	if ($PLAYER~surroundFigs <= 0)
		setvar $PLAYER~surroundFigs 1
	end
	setvar $player~surroundPassive true
	setVar $PLAYER~onlyAliens TRUE
	setVar $PLAYER~cappingAliens TRUE
	setVar $PLAYER~defenderCapping true
	setVar $PLAYER~surroundAvoidShieldedOnly TRUE


	setVar $lastTarget ""
	setVar $thisTarget ""

	gosub :validateFighterHit
	gosub :main~check_for_target_change
	gosub :attackandmoveship
	if ($targetsFound = true)
		return
	end
	gosub :main~check_for_target_change
	gosub :dosurround
	gosub :main~check_for_target_change
	gosub :attackandmoveship
	gosub :main~check_for_target_change
return

:validateFighterHit
	:go_to_drop_sector
		killAllTriggers
		if ($photon~sector = 0)
			setvar $photon~sector $player~current_sector
		end
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
			gosub :attackandmoveship
			if ($targetsFound = true)
				return
			end
			gosub :check_surrounding_sectors
			return
		:pwarpConfirmed
			killalltriggers
			gosub :player~quikstats
			gosub :dosurround
			gosub :attackandmoveship
			if ($targetsFound = true)
				return
			end
			gosub :check_surrounding_sectors
return

:check_surrounding_sectors
	gosub :player~quikstats
	setVar $index 1
	setVar $checkSector SECTOR.WARPSIN[$player~current_sector][$index]
	while ($checkSector > 0)
		setvar $pwarp~destination $checksector
		gosub :pwarp~run
		gosub :attackandmoveship
		if ($targetsFound = true)
			return
		end
		add $index 1
		setVar $checkSector SECTOR.WARPSIN[$player~current_sector][$index]
	end
return

:findAdjacent
	getSectorParameter $photon~sector "FIGSEC" $isFigged
	setVar $i 1
	setVar $checkSector SECTOR.WARPSIN[$photon~sector][$i]
	setArray $targetSectors 7
	setVar $targetCount 0
	while ($checkSector > 0)
		add $targetCount 1
		setVar $targetSectors[$targetCount] $checkSector
		add $i 1
		setVar $checkSector SECTOR.WARPSIN[$photon~sector][$i]
	end
	if ($targetCount <= 0)
		setvar $switchboard~message " No Targets..*"
		gosub :bot~echo 
		setVar $targetSectors[1] $player~current_sector
	end

return
:attemptDrop
	setvar $p 1
	while ($p <= $targetCount)
		setVar $pwarp~destination $targetSectors[$p]
		gosub :pwarp~run
		gosub :player~quikstats
		if ($player~current_sector = $pwarp~destination)
			return
		end
		add $p 1
	end
	
return


:dosurround
	if ($main~saveme = true)
		send "ey"
		gosub :ship~getshipstats
	end
	send "q q "
	gosub :player~quikstats
	gosub :grid~surround
	send "l "&$planet~planet&"* m*** c "
	if ($main~saveme = true)
		send "ey"
		gosub :ship~getshipstats
	end
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
		while (($SECTOR~fakeTraderCount > $SECTOR~federalCount) or ($SECTOR~realTraderCount > $SECTOR~corpieCount))
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
				if ($main~saveme = true)
					send "ey"
					gosub :ship~getshipstats
				end
				goSub :combat~fastCapture

			end
		end
		gosub :PLAYER~currentprompt
		if ($player~current_prompt = "Command")
			gosub :PLANET~landingSub		
		end
		setvar $isBubble $main~friendly_sectors[$focus]
		if (($sector~containsBeacon = true) and ($isBubble <> true))
			send "q q a y * * * * * * * l "&$planet~planet&"* m*** c "
		else
			send "q m*** c "
		end
		gosub :PLAYER~quikstats
		if ($player~photons <= 0)
			if ($main~saveme = true)
				send "ey"
				gosub :ship~getshipstats
			end
		end
		setVar $startingSector $PLAYER~CURRENT_SECTOR
		if (($PLAYER~SHIELDS < $SHIP~SHIP_SHIELD_MAX) and ($planet~planet_shields > 360))
			setVar $player~shields_needed ($SHIP~SHIP_SHIELD_MAX - $PLAYER~SHIELDS)
			setVar $planet~planet_shields_to_take ($player~shields_needed/10)
			send "gf"&$planet~planet_shields_to_take&"*"
		end

		if ($targetsFound = TRUE)

			send "s*  "
			waiton "Warps to Sector(s) : "
			setVar $figowner SECTOR.FIGS.OWNER[$player~current_sector]
			setVar $figCount SECTOR.FIGS.QUANTITY[$player~current_sector]

			if (($figcount <= 0) or (($figOwner <> "belong to your Corp") AND ($figOwner <> "yours")))
				gosub :xenter~run
			end		
			setVar $emptyShips SECTOR.SHIPCOUNT[currentsector]
			if ($emptyShips > 0)
				loadVar $MAP~stardock
				if ($main~saveme = true)
					send "ey"
				end
				if ($filterships <> "")
					setVar $BOT~user_command_line " moveship "&$map~home_sector&" "&#34&$filterships&#34&" silent"
					setVar $BOT~parm1 $MAP~home_sector
					gosub :domoveship
				end
				if ($emptyships > 0)
					if ($sell)
						setVar $BOT~user_command_line " moveship "&$MAP~stardock&" sell dep silent"
						setVar $BOT~parm1 $MAP~stardock
					else
						if ($player~alignment > 1000)
								setVar $BOT~user_command_line " moveship "&$MAP~stardock&" sell dep silent"
								setVar $BOT~parm1 $MAP~stardock
						else
								setVar $BOT~user_command_line " moveship "&$map~home_sector&" silent "
								setVar $BOT~parm1 $map~home_sector
						end
					end
					gosub :domoveship
				end
				if ($emptyships > 0)
					gosub :player~quikstats
					if ($player~alignment > 1000)
							setVar $BOT~user_command_line " moveship "&$MAP~stardock&" sell dep silent"
							setVar $BOT~parm1 $MAP~stardock
					else
							setVar $BOT~user_command_line " moveship "&$map~home_sector&" silent "
							setVar $BOT~parm1 $map~home_sector
					end
					gosub :domoveship
				end
				gosub :PLAYER~currentprompt
				if ($player~current_prompt = "Command")
					gosub :PLANET~landingSub
				end
				if ($main~saveme = true)
					send "ey"
				end
			end
		end
return

:getCourse
	killalltriggers
	setArray $COURSE 80
	setVar $sectors ""
	setTextLineTrigger sectorlinetrig :sectorsline " > "
	send "^f*"&$destination&"**q"
	pause


:sectorsline
	killAllTriggers
	setVar $line CURRENTLINE
	replacetext $line ">" " "
	striptext $line "("
	striptext $line ")"
	setVar $line $line&" "
	getWordPos $line $pos "So what's the point?"
	getWordPos $line $pos2 ": ENDINTERROG"
	if (($pos > 0) OR ($pos2 > 0))
		goto :noPath
	end
	getWordPos $line $pos " sector "
	getWordPos $line $pos2 "TO"
	if (($pos <= 0) AND ($pos2 <= 0))
		setVar $sectors $sectors & " " & $line
	end
	getWordPos $line $pos " "&$destination&" "
	getWordPos $line $pos2 "("&$destination&")"
	getWordPos $line $pos3 "TO"
	if ((($pos > 0) OR ($pos2 > 0)) AND ($pos3 <= 0))
		goto :gotSectors
	else
		setTextLineTrigger sectorlinetrig :sectorsline " > "
		setTextLineTrigger sectorlinetrig2 :sectorsline " "&$destination&" "
		setTextLineTrigger sectorlinetrig3 :sectorsline " "&$destination
		setTextLineTrigger sectorlinetrig4 :sectorsline "("&$destination&")"
		setTextLineTrigger donePath :sectorsline "So what's the point?"
		setTextLineTrigger donePath2 :sectorsline ": ENDINTERROG"
	end
	pause

:gotSectors
	killAllTriggers
	setVar $sectors $sectors&" :::"
	setVar $courseLength 0
	setVar $index 1
	setVar $valid FALSE
	:keepGoing
	getWord $sectors $COURSE[$index] $index
	while ($COURSE[$index] <> ":::")
		add $courseLength 1
		add $index 1
		getWord $sectors $COURSE[$index] $index
		if ($COURSE[$index] <> ":::")
			setvar $checkedPorts[$COURSE[$index]] true
			setVar $valid TRUE
		end
	end
	if ($valid)
		setVar $windowData "Sectors Figged: "&$count&" out of "&SECTORS&"*Current Target: "&$destination&"*"
	else
		setVar $windowData "Sectors Figged: "&$count&" out of "&SECTORS&"*Current Target: "&$destination&"*"
	end
	setWindowContents mowWindow $windowData
						
:noPath
	killAllTriggers
	return

:mow
	gosub :player~quikstats
	if ($ship~SHIP_MAX_ATTACK > $player~fighters)
		setVar $maxFigAttack2 9999
	else
		setvar $maxFigAttack2 $ship~SHIP_MAX_ATTACK
	end

	setVar $result ""		

		setVar $j 4
		setVar $closestFiggedSector 0	
		while ($j <= $courseLength)

			getSectorParameter $COURSE[$j] "FIGSEC" $isFigged
	
			if ($isFigged = 1)
				setVar $closestFiggedSector $COURSE[$j]
				setVar $index $j
			end
			add $j 1	
		end
		if ($closestFiggedSector > 0)
			setVar $PLAYER~warpto $closestFiggedSector
			gosub :player~twarp
			gosub  :player~currentPrompt
			if ($PLAYER~twarpSuccess = TRUE)
				setVar $j ($index + 1)
			else
				setVar $j 3
			end
			goto :mowfromhere
		end
		
	
	setVar $j 3
	:mowfromhere


	setVar $tempj $j
	while ($tempj <= $courseLength)
		setvar $sector $COURSE[$tempj]
		if ($sector <> 1)
			if ((PORT.EXISTS[$sector] = TRUE) AND (PORT.CLASS[$sector] > 0) AND (((PORT.FUEL[$sector] > 0) AND (PORT.BUYFUEL[$sector] = FALSE))))
				setvar $fuelsector $sector
			end
		end
		add $tempj 1	
	end
	
	# main mow routine
		while ($j <= $courseLength)

			setVar $result $result&"m  "&$COURSE[$j]&"* "
			if (($COURSE[$j] > 10) AND ($COURSE[$j] <> STARDOCK))
				setVar $result $result&"za"&$maxFigAttack2&"* z * "	
			end
			if (($COURSE[$j] > 10) AND ($COURSE[$j] <> STARDOCK) AND ($j > 2))
				if ($figsToDrop > 0)
					setVar $result $result&"f "&$figsToDrop&"* c d "
					setSectorParameter $COURSE[$j] "FIGSEC" TRUE
				else
					setVar $result $result&"f "&$figsToDrop&"*"
					setSectorParameter $COURSE[$j] "FIGSEC" FALSE
				end
			end
			setvar $result $result&"zr* "
			if ($course[$j] = $fuelsector)
				setvar $result $result&" p   t   *   *  "
			end
			add $j 1	
		end
		send $result
		send "d* "
return

:domoveship
	gosub :moveship~run
	setvar $switchboard~isSilent false
	send "s*  "
	gosub :player~quikstats
	setVar $emptyShips SECTOR.SHIPCOUNT[$player~current_sector]

	if ($startingSector <> $player~current_sector)
		setvar $switchboard~message "Can't twarp back to the planet!  Probably sector fig killed by an alien.  Doing a mow!*"
		gosub :switchboard~switchboard
		setvar $destination $startingSector
		gosub :getcourse
		gosub :mow
		gosub :player~quikstats
		if ($startingSector <> $player~current_sector)
			setvar $switchboard~message "Mow failed, I need help!*"
			gosub :switchboard~switchboard
		end
	end
return
