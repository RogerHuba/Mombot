	logging off
	reqRecording
	gosub :BOT~loadVars

:load_script
	loadVar $bot~bot_name
	loadVar $bot~command
	setvar $SWITCHBOARD~bot_name $bot~bot_name
	loadVar $avoidedSectorsUgrid
	loadVar $player~unlimitedGame
	loadVar $bot~bot_turn_limit
	loadVar $map~stardock
	loadVar $map~home_sector
	loadVar $map~backdoor
	loadvar $game~limpet_cost
	loadvar $game~armid_cost
	loadVar $game~limpet_removal_cost
	loadvar $bot~password
	setVar $grid_limpets 3
	setVar $grid_armids 3
	setVar $refurb TRUE
	loadvar $bot~command
	setvar $folder "scripts/"&$bot~mombot_directory&"/games/"&GAMENAME
	setVar $GRIDDER_FILE 		$folder&"/gridder.targets"
	setVar $MASTER_EDGE_FILE 	$folder&"/edge_sectors.targets"
	setVar $UNEXPLORED_FILE     $folder&"/unexplored.targets"
	setVar $imlimped FALSE
	setArray $move SECTORS
	setVar $checkedForInfo ""
	setVar $grid_figs 1
	setVar $attackretreat FALSE
	
	getSectorParameter SECTORS "FIGSEC" $isFigged
	getSectorParameter SECTORS "MINESEC" $isArmided
	getSectorParameter SECTORS "LIMPSEC" $isLimped

	setVar $BOT~help[1] $BOT~tab&"ugrid [targeting] {figs} {armids} {limpets} {safety} {planets} {warp} {refurb} {scrub} {avoid) {aggressive} {clear} {ship2:#} "
	setVar $BOT~help[2] $BOT~tab&"                "
	setVar $BOT~help[3] $BOT~tab&"Ultimate gridder. Visits all targeted sectors. "
	setVar $BOT~help[4] $BOT~tab&"Grid defender "
	setVar $BOT~help[5] $BOT~tab&"   - [targeting]   = How target list is generated.  Must be either "
	setVar $BOT~help[6] $BOT~tab&"                     a filename to pull list from or 'auto' which  "
	setVar $BOT~help[7] $BOT~tab&"                     will autogenerate list of targets. "
	setVar $BOT~help[8] $BOT~tab&"      "
	setVar $BOT~help[9] $BOT~tab&"   - [figs]        = Number of fighters to drop     "
	setVar $BOT~help[10] $BOT~tab&"                         - Default: 1 "
	setVar $BOT~help[11] $BOT~tab&"   - [armids]      = Number of armid mines to drop  "
	setVar $BOT~help[12] $BOT~tab&"                         - Default: 3 "
	setVar $BOT~help[13] $BOT~tab&"   - [limps]       = Number of limpet mines to drop  "
	setVar $BOT~help[14] $BOT~tab&"                         - Default: 3  "
	setVar $BOT~help[15] $BOT~tab&"   - [exist]       = Overwrite grid  "
	setVar $BOT~help[16] $BOT~tab&"   - [safety]      = 'ultra', 'safe', and 'none'  "
	setVar $BOT~help[17] $BOT~tab&"              none = Will land adjacent to all non-figged sectors  "
	setVar $BOT~help[18] $BOT~tab&"              safe = Only will land to sectors with friendly limps "
	setVar $BOT~help[19] $BOT~tab&"             ultra = Like safe, but needs friendly armids too  "
	setVar $BOT~help[20] $BOT~tab&"                         - Default: ultra   "
	setVar $BOT~help[21] $BOT~tab&"   - [planets]     = 'all', 'shielded', 'none' "
	setVar $BOT~help[22] $BOT~tab&"               all = Avoid all planets in target sectors "
	setVar $BOT~help[23] $BOT~tab&"          shielded = Avoid only shielded planets in target sectors "
	setVar $BOT~help[24] $BOT~tab&"                         - Default: all  "
	setVar $BOT~help[25] $BOT~tab&"   - [warp]        = 'twarp' or 'bwarp' "
	setVar $BOT~help[26] $BOT~tab&"                         - Default: twarp  "
	setVar $BOT~help[27] $BOT~tab&"   - [norefurb]    = Turns off auto refurbing of mines at Stardock "
	setVar $BOT~help[28] $BOT~tab&"   - [scrub]       = Will scrub at dock when catching a limpet     "
	setVar $BOT~help[29] $BOT~tab&"   - [avoid]       = Avoid sectors with enemy limpets   "
	setVar $BOT~help[30] $BOT~tab&"   - [aggressive]  = Won't avoid big fighter groups    "
	setVar $BOT~help[31] $BOT~tab&"   - [passive]     = Avoids hitting player fighters or mines.      "
	setVar $BOT~help[32] $BOT~tab&"   - [clear]       = Clears internal list of avoided sectors.      "
	setVar $BOT~help[33] $BOT~tab&"   - [ship2:#]     = Second xport ship number     "
	setVar $BOT~help[34] $BOT~tab&"   - [orphan]      = targets only orphan sectors   "
	gosub :bot~helpfile

	getWord $bot~user_command_line $bot~parm1 1 "EMPTY"
	if (($bot~parm1 = "auto") OR ($bot~parm1 = "EMPTY"))
	
	else
		setVar $gridTargets TRUE
	        setVar $targetFile $bot~parm1
		fileexists $test $targetFile
		if ($test = FALSE)
		      send "'{" $bot~bot_name "} - Grid target file: [" $targetFile "] does not exist, shutting down..*"
		      halt
                else
		      readToArray $targetFile $targetSectors
		end
	end
	getWord $bot~user_command_line $bot~parm2 2 "EMPTY"
	getWord $bot~user_command_line $bot~parm3 3 "EMPTY"
	getWord $bot~user_command_line $bot~parm4 4 "EMPTY"
	isNumber $test $bot~parm2
	if ($test)
		setVar $grid_figs $bot~parm2
	end
	isNumber $test $bot~parm3
	if ($test)
		setVar $grid_armids $bot~parm3
	end
	isNumber $test $bot~parm4
	if ($test)
		setVar $grid_limpets $bot~parm4
	end
	getWordPos $bot~user_command_line $pos "aggressive" 
	if ($pos > 0)
		setVar $attackretreat TRUE
	else
		setVar $attackretreat FALSE
	end
	getWordPos $bot~user_command_line $pos "orphan" 
	if ($pos > 0)
		setVar $targetOrphans TRUE
	else
		setVar $targetOrphans FALSE
	end

	getWordPos $bot~user_command_line $pos "avoid" 
	if ($pos > 0)
		setVar $grid_avoid TRUE
	else
		setVar $grid_avoid FALSE
	end
	getWordPos $bot~user_command_line $pos "scrub" 
	if ($pos > 0)
		setVar $autoclean TRUE
	else
		setVar $autoclean FALSE
	end
	getWordPos $bot~user_command_line $pos "norefurb" 
	if ($pos > 0)
		setVar $refurb FALSE
	else
		setVar $refurb TRUE
	end
	getWordPos $bot~user_command_line $pos "bwarp" 
	if ($pos > 0)
		setVar $grid_warp "bwarp"
	else
		setVar $grid_warp "twarp"
	end	
	getWordPos $bot~user_command_line $pos "retreat" 
	if ($pos > 0)
		setVar $retreat true
	else
		setVar $retreat false
	end	
	getWordPos $bot~user_command_line $pos "shield" 
	if ($pos > 0)
		setVar $avoidShieldedOnly TRUE
	else
		setVar $avoidShieldedOnly FALSE
	end
	getWordPos $bot~user_command_line $pos "exist" 
	if ($pos > 0)
		setVar $gridExistingOnly TRUE
	else
		setVar $gridExistingOnly FALSE
	end

	getWordPos $bot~user_command_line $pos "clear" 
	if ($pos > 0)
		setVar $avoidedSectorsUgrid ""
	end
	
	getWordPos $bot~user_command_line $pos "ship2:" 
	if ($pos > 0)
		getText " "&$bot~user_command_line&" " $ship2 "ship2:" " "
		setVar $xport_grid TRUE
	end


	getWordPos $bot~user_command_line $pos "none" 
	if ($pos > 0)
		setVar $ultraSafeLimpet FALSE
		setVar $ultraSafeArmid FALSE
	else
		getWordPos $bot~user_command_line $pos "safe" 
		if ($pos > 0)
			setVar $ultraSafeLimpet TRUE
			setVar $ultraSafeArmid FALSE
		else
			setVar $ultraSafeLimpet TRUE
			setVar $ultraSafeArmid TRUE
		end
	end
	
	getWordPos $bot~user_command_line $pos "passive" 
	if ($pos > 0)
		setVar $passive TRUE
		setVar $avoid TRUE
	else
		setVar $passive FALSE
	end
	

if (($map~stardock = 0) OR ($map~stardock = ""))
		setvar $switchboard~message "Stardock is not defined.  Please define stardock variable in the bot.*"
		gosub :switchboard~switchboard
		halt
	end
	if ($isFigged = "")
		setvar $switchboard~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		gosub :switchboard~switchboard
		halt
	end
	if ($isArmided = "")
		setvar $switchboard~message "It appears no armid data is available.  Run an armid grid checker that uses the sector parameter MINESEC. (Try armids command)*"
		gosub :switchboard~switchboard
		halt
	end
	if ($isLimped = "")
		setvar $switchboard~message "It appears no limpet data is available.  Run a limpet grid checker that uses the sector parameter LIMPSEC. (Try limps command)*"
		gosub :switchboard~switchboard
		halt
	end
	if ($player~photons > 0)
	       setvar $switchboard~message "Can not run with photons on your ship.*"
		gosub :switchboard~switchboard
               halt
	end

	gosub :player~quikstats
	if ($player~current_prompt <> "Citadel")
		setvar $switchboard~message "Must start gridder from citadel prompt.*"
		gosub :switchboard~switchboard
		halt
	end
	if ($player~photons > 0)
		setvar $switchboard~message "You should not use a ship with photons to grid.*"
		gosub :switchboard~switchboard
		halt
	end

	if ($player~twarp_type = "No")
		setvar $switchboard~message "Must Have Twarp 1 or 2**"
		gosub :switchboard~switchboard
		halt
	end

	setvar $script_ver "Ultimate Gridder"
	setVar $BOT~script_title $script_ver
	gosub :BOT~banner


killalltriggers
goSub :checkAvoidedSectors

:checkForTargets
	send "q"
	gosub :planet~getplanetinfo
	send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*q"
	setvar $switchboard~message "Clearing messages for possible exit/enter later*"
	gosub :switchboard~switchboard
	gosub :xenter
	gosub :xenter
	gosub :xenter
	send "y1"&$player~current_sector&"** "
	gosub :landOnPlanetEnterCitadel
	setVar $limpetBefore $player~limpets
	setVar $limpetAfter $limpetBefore
	setVar $armidBefore $player~armids
	setVar $armidAfter $armidBefore

	setvar $switchboard~message "M()M Unlimited Gridder Powering Up!*"
	gosub :switchboard~switchboard

	waitFor "(?="
	window gridder 300 170 ("M()M Unlimited Gridder - " & GAMENAME) ONTOP
	setvar $window_content "      Starting up!*"
	gosub :setwindow

	setVar $homesec $player~current_sector


:checkShip
	killAllTriggers
	gosub :player~quikstats
	send "c;"
	waitFor "Offensive Odds:"
	getWordPos CURRENTLINE $pos "Offensive"
	cutText CURRENTLINE $oddline $pos 99
	getText $oddline $offodd "Odds:" ":1"
	stripText $offodd " "
	stripText $offodd "."
	waitFor "Mine Max:"
	getText CURRENTLINE $maxMines "Mine Max:" "B"
	stripText $maxMines " "
	waitFor "Figs Per Attack:"
	getWord CURRENTLINE $figs 5
	multiply $offodd $figs
	divide $offodd 12
	setVar $max_figs $player~fighters
	gosub :player~quikstats
	setVar $ship1 $player~ship_number
	setVar $next_ship "2"
	send "q"
:restart
	send "q"
	gosub :planet~getplanetinfo
	send "c "
	gosub :findAllTargetSectors
	gosub :assemble_mac
	gosub :assemble_return_mac
	gosub :assemble_attack_mac
	gosub :assemble_land_mac
:select_boomsec
	killAllTriggers
	gosub :player~quikstats
	gosub :assemble_return_mac
	if (($player~TWARP = "No") OR ($player~current_sector <> $homesec))
			goto :callSaveMe
		end
	if ($player~fighters < $max_figs)
		echo ANSI_12 "*Not enough fighters to safely continue.*" ANSI_7
		halt
	end
	setVar $limpetAfter $player~limpets
	setVar $armidAfter $player~armids
	if ($boomsec > 0)
		if (($limpetBefore > $limpetAfter) AND ($isLimped = FALSE))
			setVar $limpetBefore $player~limpets
			setVar $limpetAfter $limpetBefore
			setSectorParameter $player~current_sector "LIMPSEC" TRUE
		elseif (($limpetBefore = $limpetAfter) AND ($isLimped = FALSE))
			setVar $imlimped TRUE
		end
		if (($armidBefore > $armidAfter) AND ($isArmided = FALSE))
			setVar $armidBefore $player~armids
			setVar $armidAfter $armidBefore
			setSectorParameter $player~current_sector "MINESEC" TRUE
		end
	end
	if ($player~TWARP = "No")
		goto :callSaveMe
	end

	if ((($player~limpets < $grid_limpets) OR ($player~armids < $grid_armids)) OR (($imlimped = TRUE) AND ($autoClean = TRUE)))
		if ($refurb)
			setvar $window_content "    Auto Refurbing.. *"
			gosub :setwindow
			gosub :attempt_refurb
		else
			echo ANSI_12 "*You must stock up on mines before continuing." ANSI_7
			halt
		end
		gosub :player~quikstats
		setVar $limpetBefore $player~limpets
		setVar $limpetAfter $limpetBefore
		setVar $armidBefore $player~armids
		setVar $armidAfter $armidBefore
	end
:continueOn
	getRnd $random 1 $databaseCount
	getWord $database $player~warpto $random
	setvar $window_content "*      Targets left to hit:"&$databaseCount&"*"
	gosub :setwindow
	
	if ($player~warpto = 0)
		setvar $switchboard~message "Database Cleared - Recalculating and Restarting...*"
		gosub :switchboard~switchboard
		gosub :player~quikstats
		goto :restart
	else
		getDistance $distance $move[$player~warpto] $player~warpto
		if ($distance <= 0)
			send "^f"&$move[$player~warpto]&"*"&$player~warpto&"*q"
			waitOn "ENDINTERROG"
			getDistance $distance $move[$player~warpto] $player~warpto
		end
		
	end

:clearit
	loadvar $game~PHOTON_DURATION
	KillAllTriggers
	replaceText $database " "&$player~warpto&" " " "
	subtract $databaseCount 1
	setVar $furbing FALSE
	if ($grid_warp = "twarp")
		gosub :doTwarp
	elseif ($grid_warp = "bwarp")
		gosub :bwarp
	else
		halt
	end

	if ($photoned = true)
		setvar $switchboard~message "Waiting for photon to wear off..*"
		gosub :switchboard~switchboard
		setDelayTrigger restart_from_photon :clearit (($game~photon_duration * 60000) + 1000)
		pause
	end


:hittingsec
	KillAllTriggers
	setVar $boomsec $move[$player~warpto]
	getSectorParameter $boomsec "FIGSEC"  $isFigged
	getSectorParameter $boomsec "MINESEC" $isArmided
	getSectorParameter $boomsec "LIMPSEC" $isLimped
	if ($isFigged = "")
		setVar $isFigged FALSE
	end
	if ($isLimped = "")
		setVar $isLimped FALSE
	end
	if ($isArmided = "")
		setVar $isArmided FALSE
	end
	setVar $imlimped FALSE
    if ($gridExistingOnly)
		send $mac&$return_mac
		send $land_mac
		goto :select_boomsec
	end
	send "sd"
	waitFor "Relative Density Scan"
	send "sh"
	waiton "Warps to Sector(s) :"
	waiton "[" & $player~warpto & "]"
	getDistance $distance $player~warpto $boomsec
	getDistance $distanceback $boomsec $player~warpto 
	setVar $containsShieldedPlanet FALSE
	setVar $i 1
	while ($i <= SECTOR.PLANETCOUNT[$boomsec])
		getWord SECTOR.PLANETS[$boomsec][$i] $test 1
		if ($test = "<<<<")
			setVar $containsShieldedPlanet TRUE
		end
		add $i 1
	end
	setVar $figowner SECTOR.FIGS.OWNER[$boomsec]
	setVar $figCount SECTOR.FIGS.QUANTITY[$boomsec]
	getWord $figOwner $alienCheck 1
	lowerCase $alienCheck
	setVar $mineOwner SECTOR.MINES.OWNER[$boomsec]
	setVar $mineCount SECTOR.MINES.QUANTITY[$boomsec]
	if (((($avoidShieldedOnly = TRUE) AND ($containsShieldedPlanet = FALSE)) OR (SECTOR.PLANETCOUNT[$boomsec] <= 0)) and (SECTOR.TRADERCOUNT[$boomsec] <= 0) and ($distance = 1) and ($boomsec > 10) and ($boomsec <> STARDOCK) and ((($attackretreat = TRUE) AND ($distanceback = 1) AND (SECTOR.FIGS.QUANTITY[$boomsec] >= ($offodd*2))) OR (SECTOR.FIGS.QUANTITY[$boomsec] < ($offodd*2))))
		if ($passive = TRUE)
			echo "**" ANSI_14
			echo "[" ANSI_15 "Target Sector: " $boomsec ANSI_14 "]*"
			echo "[" ANSI_15 "Mine Count: " $mineCount ANSI_14 "]*"
			echo "[" ANSI_15 "Mine Owner: " $mineOwner ANSI_14 "]*"
			echo "[" ANSI_15 "Fighter Count: " $figCount ANSI_14 "]*"
			echo "[" ANSI_15 "Fighter Owner: " $figOwner ANSI_14 "]*"
			echo "**" ANSI_7
			if (($passive = TRUE) AND (($mineCount <= 0) OR (($mineCount > 0) AND (($mineOwner <> "yours") AND ($mineOwner <> "belong to your Corp")))) AND ($figOwner <> "belong to your Corp") AND ($figOwner <> "yours") AND ($figOwner <> "Rogue Mercenaries") AND ($alienCheck <> "the") AND ($figowner <> ""))
				echo "**" ANSI_14
				echo "[" ANSI_15 "Passive detection avoiding sector: " $boomsec "]*"
				echo "**" ANSI_7
				send "m      " $homesec "* y   y    *  *  "
				#gosub :player~quikstats
				#if (($player~TWARP = "No") OR ($player~current_sector <> $homesec))
				#	goto :callSaveMe
				#end
				send $land_mac
				setVar $avoidedSectorsUgrid $avoidedSectorsUgrid&" "&$boomsec&" "
				saveVar $avoidedSectorsUgrid
				goto :select_boomsec
			end
		end
		if ($grid_avoid = TRUE)
			if ((SECTOR.ANOMALY[$boomsec] = TRUE) and ($isLimped = FALSE) and ($grid_avoid = TRUE))
				send "m      " $homesec "* y   y    *  *  "
				send $land_mac
				setVar $avoidedSectorsUgrid $avoidedSectorsUgrid&" "&$boomsec&" "
				saveVar $avoidedSectorsUgrid
				send "'{" $bot~bot_name "} - Probable Enemy Limpet Detected - Sector " $boomsec ".*"
				goto :select_boomsec
			end
		end
		if ((SECTOR.anomaly[$boomsec] = TRUE) and ($isLimped = FALSE))
			setVar $imlimped TRUE
		end
		
		send "m"
		gosub :return_triggers
		if (($distanceback = 1) and ($retreat))
			send $boomsec $attack_mac $mac " < * " $return_mac $land_mac
		else
			send $boomsec $attack_mac $mac $return_mac $land_mac
		end
		if (($grid_figs > 0) AND (SECTOR.FIGS.QUANTITY[$boomsec] < ($offodd*2)))
			setSectorParameter $boomsec "FIGSEC" TRUE
		end
        #gosub :player~quikstats
		#if (($player~TWARP = "No") OR ($player~current_sector <> $homesec))
		#	goto :callSaveMe
		#end
		setVar $output ""
		if (SECTOR.PLANETCOUNT[$boomsec] > 0)
			setVar $i 1
			while ($i <= SECTOR.PLANETCOUNT[$boomsec])
				setVar $output $output&"    "&SECTOR.PLANETS[$boomsec][$i]&#13
				add $i 1
			end
			setVar $output "'"&#13&"WARNING - Planet(s) Detected, Not Avoided - Sector "&$boomsec&#13&$output&#13&" "&#13&" "
			send $output
			write $GRIDDER_FILE DATE&"    "&$output
		elseif (SECTOR.SHIPCOUNT[$boomsec] > 0)
			setVar $i 1
			while ($i <= SECTOR.SHIPCOUNT[$boomsec])
				setVar $output $output&"    "&SECTOR.SHIPS[$boomsec][$i]&#13
				add $i 1
			end
			setVar $output "'"&#13&"WARNING - Empty Ship(s) Detected, Not Avoided - Sector "&$boomsec&#13&$output&#13&" "&#13&" "
			send $output
			write $GRIDDER_FILE DATE&"    "&$output
		end
		goto :select_boomsec
	else
		send "m"
		gosub :return_triggers
		send $homesec "* y y  *  "
		gosub :player~quikstats
		if (($player~TWARP = "No") OR ($player~current_sector <> $homesec))
			goto :callSaveMe
		end
		send $land_mac
		setVar $avoidedSectorsUgrid $avoidedSectorsUgrid&" "&$boomsec&" "
		saveVar $avoidedSectorsUgrid
		setVar $output ""
		if (SECTOR.PLANETCOUNT[$boomsec] > 0)
			setVar $i 1
			while ($i <= SECTOR.PLANETCOUNT[$boomsec])
				setVar $output $output&"    "&SECTOR.PLANETS[$boomsec][$i]&#13
				add $i 1
			end
			setVar $i 1
			while ($i <= SECTOR.TRADERCOUNT[$boomsec])
				setVar $output $output&"    "&SECTOR.TRADERS[$boomsec][$i]&#13
				add $i 1
			end
			setVar $output $output&SECTOR.FIGS.QUANTITY[$boomsec]&" figs owned by: "&SECTOR.FIGS.OWNER[$boomsec]&#13
			setVar $output "'"&#13&"WARNING - Planet(s) Detected - Sector "&$boomsec&#13&$output&#13&" "&#13&" "
		elseif (SECTOR.TRADERCOUNT[$boomsec] > 0)
			setVar $i 1
			while ($i <= SECTOR.TRADERCOUNT[$boomsec])
				setVar $output $output&"    "&SECTOR.TRADERS[$boomsec][$i]&#13
				add $i 1
			end
			setVar $output $output&SECTOR.FIGS.QUANTITY[$boomsec]&" figs owned by: "&SECTOR.FIGS.OWNER[$boomsec]&#13
			setVar $output "'"&#13&"WARNING - Trader(s) Detected - Sector "&$boomsec&#13&$output&#13&" "&#13&" "
		elseif ($distance <> 1)
			setVar $output "'WARNING - Sector not Adj (Sector "&$boomsec&")"&#13
		elseif ($boomsec <= 10) or ($boomsec = STARDOCK)
			setVar $output "'WARNING - Fed Sector Adj (Sector "&$boomsec&")"&#13
		elseif (SECTOR.FIGS.QUANTITY[$boomsec] >= ($offodd*2))
			setVar $output "'WARNING - "&SECTOR.FIGS.QUANTITY[$boomsec]&" figs owned by: "&SECTOR.FIGS.OWNER[$boomsec]&" - Sector "&$boomsec&#13
		else
			setVar $output "'WARNING - Unknown Error - "&$boomsec&#13
		end
		send $output
		write $GRIDDER_FILE DATE&"    "&$output
		goto :select_boomsec
	end




#-=-=-=-=- Find All Target Sectors -=-=-=-=-=-
:findAllTargetSectors
	setVar $targetSectorCount 1
	setVar $databaseCount 0
	setVar $database ""
	setVar $adjacentDatabase ""

	echo ANSI_14 "* Loading target sectors..*" ANSI_7
	setVar $perc 0
	if ($gridTargets)
		setVar $m 1
		send "^"
		while ($m < $targetSectors)
	        setVar $destination $targetSectors[$m]
			getSectorParameter $destination "FIGSEC"  $isFigged
			if ($isFigged = "")
				setVar $isFigged FALSE
			end
			gosub :getCourses
			getWordPos $avoidedSectorsUgrid $pos " "&$destination&" "
			stripText $destination " "
			if (($pos <= 0) AND (($isFigged <= 0) OR ($gridExistingOnly = TRUE)))
				setVar $i 1
				setVar $isFound FALSE
				while ((SECTOR.WARPSIN[$destination][$i] > 0) AND ($isFound = FALSE))
					setVar $adjinf SECTOR.WARPSIN[$destination][$i]
					getSectorParameter $adjinf "FIGSEC"  $isFigged
					getSectorParameter $adjinf "MINESEC" $isArmided
					getSectorParameter $adjinf "LIMPSEC" $isLimped
					if ($isFigged = "")
						setVar $isFigged FALSE
					end
					if ($isLimped = "")
						setVar $isLimped FALSE
					end
					if ($isArmided = "")
						setVar $isArmided FALSE
					end
					if (($ultraSafeLimpet = TRUE) AND ($isLimped = FALSE))
						#Do Nothing
					elseif (($ultraSafeArmid = TRUE) AND ($isArmided = FALSE))
						#Do Nothing
					else
						getWordPos $adjacentDatabase $pos " "&$destination&" "
						getWordPos $database $pos2 " "&$adjinf&" "
						getWordPos $avoidedSectorsUgrid $pos3 " "&$adjinf&" "
						if (($pos <= 0) AND ($pos3 <= 0) AND ($adjinf > 10) AND ($adjinf <> STARDOCK) AND ($isFigged > 0))
							if (($adjinf <> $destination) AND ($pos2 <= 0))
								setVar $database $database&" "&$adjinf&" "
								setVar $adjacentDatabase $adjacentDatabase&" "&$destination&" "
								setVar $move[$adjinf] $destination
								setVar $isFound TRUE
								add $databaseCount 1
							end
						end
					end
					add $i 1
				end
			end
			setVar $percTest (($m * 100) / SECTORS)
			if ($percTest > $perc)
				setVar $perc (($m * 100) / SECTORS)
				echo "*"
				echo #27 "["&($perc / 2)&"C"
				echo ANSI_14 "°" ANSI_15 " " $perc "%" #27 & "[1A   "
			end
			add $m 1
		end
		send "q "

	elseif ($gridExistingOnly)
		while ($targetSectorCount < SECTORS)
			add $targetSectorCount 1
			getSectorParameter $targetSectorCount "FIGSEC"  $isFigged
			getSectorParameter $targetSectorCount "MINESEC" $isArmided
			getSectorParameter $targetSectorCount "LIMPSEC" $isLimped
			if ($isFigged = "")
				setVar $isFigged FALSE
			end
			if ($isLimped = "")
				setVar $isLimped FALSE
			end
			if ($isArmided = "")
				setVar $isArmided FALSE
			end
			getWordPos $avoidedSectorsUgrid $pos " "&$targetSectorCount&" "
			if (($pos <= 0) AND ($isFigged >= 1))
				if ($grid_limpets > 0)
					if ($isLimped = FALSE)
						setVar $database $database&" "&$targetSectorCount&" "
						setVar $move[$targetSectorCount] $targetSectorCount
						add $databaseCount 1
					end
				end
				if ($grid_armids > 0)
					getWordPos $database $pos2 " "&$targetSectorCount&" "
					if (($pos2 <= 0) AND ($isArmided = FALSE))
						setVar $database $database&" "&$targetSectorCount&" "
						setVar $move[$targetSectorCount] $targetSectorCount
						add $databaseCount 1
					end
				end
				if (($grid_figs > 0) AND ($grid_armids <= 0) AND ($grid_limpets <= 0))
					if ($isFigged >= 1)
						setVar $database $database&" "&$targetSectorCount&" "
						setVar $move[$targetSectorCount] $targetSectorCount
						add $databaseCount 1
					end
				end
			end
			setVar $percTest (($targetSectorCount * 100) / SECTORS)
			if ($percTest > $perc)
				setVar $perc (($targetSectorCount * 100) / SECTORS)
				echo "*"
				echo #27 "["&($perc / 2)&"C"
				echo ANSI_14 "°" ANSI_15 " " $perc "%" #27 & "[1A   "
			end
		end

	elseif ($targetOrphans)
		while ($targetSectorCount < SECTORS)
			getWordPos $avoidedSectorsUgrid $pos " "&$targetSectorCount&" "
			getSectorParameter $targetSectorCount "FIGSEC"  $isFigged
			getSectorParameter $targetSectorCount "MINESEC" $isArmided
			getSectorParameter $targetSectorCount "LIMPSEC" $isLimped
			if ($isFigged = "")
				setVar $isFigged FALSE
			end
			if ($isLimped = "")
				setVar $isLimped FALSE
			end
			if ($isArmided = "")
				setVar $isArmided FALSE
			end
			if (($pos <= 0) AND ($isFigged >= 1))
				if (($ultraSafeLimpet = TRUE) AND ($isLimped = FALSE))
					#Do Nothing
				elseif (($ultraSafeArmid = TRUE) AND ($isArmided = FALSE))
					#Do Nothing
				else
					setVar $i 1
					setVar $isFound FALSE
					while ((SECTOR.WARPS[$targetSectorCount][$i] > 0) AND ($isFound = FALSE))
						setVar $adjinf SECTOR.WARPS[$targetSectorCount][$i]
						getSectorParameter $adjinf "FIGSEC"  $isFigged
						if ($isFigged = "")
							setVar $isFigged FALSE
						end
						getWordPos $adjacentDatabase $pos " "&$adjinf&" "
						getWordPos $database $pos2 " "&$targetSectorCount&" "
						getWordPos $avoidedSectorsUgrid $pos3 " "&$adjinf&" "
						if (($pos <= 0) AND ($pos3 <= 0) AND ($adjinf > 10) AND ($adjinf <> STARDOCK) AND ($isFigged = FALSE))
							if (($adjinf <> $targetSectorCount) AND ($pos2 <= 0))
								setvar $j 1
								while ((SECTOR.WARPS[$adjinf][$j]) > 0)
									getSectorParameter SECTOR.WARPS[$adjinf][$j] "FIGSEC"  $isFigged
									if ($isFigged = "")
										setVar $isFigged FALSE
									end
									if ($isFigged = FALSE)
										goto :not_an_orphan_sector
									end
									add $j 1
								end
								setvar $j 1
								while ((SECTOR.WARPSIN[$adjinf][$j]) > 0)
									getSectorParameter SECTOR.WARPSIN[$adjinf][$j] "FIGSEC"  $isFigged
									if ($isFigged = "")
										setVar $isFigged FALSE
									end
									if ($isFigged = FALSE)
										goto :not_an_orphan_sector
									end
									add $j 1
								end

								setVar $database $database&" "&$targetSectorCount&" "
								setVar $adjacentDatabase $adjacentDatabase&" "&$adjinf&" "
								setVar $move[$targetSectorCount] $adjinf
								setVar $isFound TRUE
								add $databaseCount 1
							end
						end
						:not_an_orphan_sector
						add $i 1
					end


				end
			end
			setVar $percTest (($targetSectorCount * 100) / SECTORS)
			if ($percTest > $perc)
				setVar $perc (($targetSectorCount * 100) / SECTORS)
				echo "*"
				echo #27 "["&($perc / 2)&"C"
				echo ANSI_14 "°" ANSI_15 " " $perc "%" #27 & "[1A   "
			end
			add $targetSectorCount 1
		end
	else	
		while ($targetSectorCount < SECTORS)
			getWordPos $avoidedSectorsUgrid $pos " "&$targetSectorCount&" "
			getSectorParameter $targetSectorCount "FIGSEC"  $isFigged
			getSectorParameter $targetSectorCount "MINESEC" $isArmided
			getSectorParameter $targetSectorCount "LIMPSEC" $isLimped
			if ($isFigged = "")
				setVar $isFigged FALSE
			end
			if ($isLimped = "")
				setVar $isLimped FALSE
			end
			if ($isArmided = "")
				setVar $isArmided FALSE
			end
			if (($pos <= 0) AND ($isFigged >= 1))
				if (($ultraSafeLimpet = TRUE) AND ($isLimped = FALSE))
					#Do Nothing
				elseif (($ultraSafeArmid = TRUE) AND ($isArmided = FALSE))
					#Do Nothing
				else
					setVar $i 1
					setVar $isFound FALSE
					while ((SECTOR.WARPS[$targetSectorCount][$i] > 0) AND ($isFound = FALSE))
						setVar $adjinf SECTOR.WARPS[$targetSectorCount][$i]
						getSectorParameter $adjinf "FIGSEC"  $isFigged
						if ($isFigged = "")
							setVar $isFigged FALSE
						end
	               				getWordPos $adjacentDatabase $pos " "&$adjinf&" "
						getWordPos $database $pos2 " "&$targetSectorCount&" "
						getWordPos $avoidedSectorsUgrid $pos3 " "&$adjinf&" "
						if (($pos <= 0) AND ($pos3 <= 0) AND ($adjinf > 10) AND ($adjinf <> STARDOCK) AND ($isFigged = FALSE))
							if (($adjinf <> $targetSectorCount) AND ($pos2 <= 0))
								setVar $database $database&" "&$targetSectorCount&" "
								setVar $adjacentDatabase $adjacentDatabase&" "&$adjinf&" "
								setVar $move[$targetSectorCount] $adjinf
								setVar $isFound TRUE
								add $databaseCount 1
							end
						end
						add $i 1
					end


				end
			end
			setVar $percTest (($targetSectorCount * 100) / SECTORS)
			if ($percTest > $perc)
				setVar $perc (($targetSectorCount * 100) / SECTORS)
				echo "*"
				echo #27 "["&($perc / 2)&"C"
				echo ANSI_14 "°" ANSI_15 " " $perc "%" #27 & "[1A   "
			end
			add $targetSectorCount 1

		end
	end
	send "'{" $bot~bot_name "} - "&$databaseCount&" target sectors found.*"
	if ($databaseCount <= 0)
		setvar $switchboard~message "Visited every sector possible. Refresh fighters and update warp data to verify..*"
		gosub :switchboard~switchboard

		if ($refurb)
			gosub :attempt_refurb
			gosub :player~quikstats
			if ($map~home_sector <> "0")
				send "p "&$map~home_sector&"* y "
				gosub :player~quikstats
				setvar $switchboard~message "Scrubbed at dock and pwarped home..*"
				gosub :switchboard~switchboard
			else
				setvar $switchboard~message "Home sector not defined, so still in gridding sector.*"
				gosub :switchboard~switchboard
			end
		end
		halt
	end
return


#-=-=-=-=-=- assemble macro -=-=-=-=-=-=-=-=-
:assemble_mac
        setVar $mac ""
	if ($gridExistingOnly)
		if ($grid_figs > 0)
			setVar $mac "f " & $grid_figs & "*cd "
		end
		if (($grid_armids > 0) AND ($player~armids > 0))
			setVar $mac $mac & "h1 z" & $grid_armids & "*zc*"
		end
		if (($grid_limpets > 0) AND ($player~limpets > 0))
			setVar $mac $mac & "h2 z" & $grid_limpets & "*zc*"
		end
	else
		if ($grid_figs > 0)
			setVar $mac "f " & $grid_figs & "*cd "
			setVar $mac "f" & $grid_figs & "*cd"
		end
		if (($grid_armids > 0) AND ($player~armids > 0))
			setVar $mac $mac & "h1 z" & $grid_armids & "*zc*"
		end
		if (($grid_limpets > 0) AND ($player~limpets > 0))
			setVar $mac $mac & "h2 z" & $grid_limpets & "*zc*"
		end
	end
return

:assemble_attack_mac
        if ($attackretreat = true)
        	#setVar $attack_mac "* za" & $figs & "* jr * "
        	setVar $attack_mac "*za" & $figs & "*jr*"
        else
        	#setVar $attack_mac "* za" & $figs & "* * "
			setVar $attack_mac "* za " & $figs & "* * "
        end
return

:assemble_return_mac
	setVar $return_mac ""
	if ($xport_grid)
		if ($player~ship_number = $ship1)
			setVar $xport_ship $ship2
		else
			setVar $xport_ship $ship1
		end
		setVar $return_mac "x "&$xport_ship&"*  *  "
	end
	setVar $return_mac $return_mac&$homesec & "* y y * * "
	#setvar $return_mac $return_mac&"n 1 y y "
return

:assemble_land_mac
	setVar $land_mac "l j" & #8 & #8 & #8 & #8 & #8 & $planet~planet & "*  * j m  * * *  t * t 1* c * "
	#setVar $land_mac "l " & $planet~planet & "*  m  * * *  t * t 1*  c  "
return

# -=-=-=-=-=- return triggers -=-=-=-=-=-=-=-
:return_triggers
	setTextTrigger incit :incit "To which Sector"
	setTextTrigger igd :igd "An Interdictor Generator in this sector holds you fast!"
	setTextTrigger noturns :igd "Your ship was hit by a Photon and has been disabled"
	goSub :delayTrigger
	pause
:incit
	killAllTriggers
	return
:igd
	goto :callSaveMe


:landOnPlanetEnterCitadel
	send "l " $planet~planet "* c"
	waitOn "<Enter Citadel>"
	return
:leaveCitadelAndPlanet
	send "q q "
	waitOn "Blasting off from"
	waitOn "Command [TL"
	return

:checkAvoidedSectors
	:readAvoidedList
		setTextLineTrigger getLine1 :getAvoids
		send "cxq"
		pause
	:keepCountingAvoids
		killAllTriggers
		setTextLineTrigger getLine :getAvoids
		pause
	:getAvoids
		killAllTriggers
		setVar $workingText CURRENTLINE
		getWordPos $workingText $pos "<Computer deactivated>"
		if ($pos > 0)
			goto :doneAvoids
		end
		getWordPos $workingText $pos "Computer"
		if ($pos > 0)
			goto :keepCountingAvoids
		end
		if (CURRENTLINE = "")
			goto :KeepCountingAvoids
		end
		getWordPos $workingText $pos "<List Avoided Sectors>"
		if ($pos > 0)
			goto :keepCountingAvoids
		end
		getWordPos $workingText $pos "No Sectors are currently being avoided."
		if ($pos > 0)
			goto :doneAvoids
		end
		getWordPos $workingText $pos "Citadel"
		if ($pos > 0)
			goto :keepCountingAvoids
		end
		setVar $workingText $workingText&" +++"
		getWord $workingText $avoid 1
		getWordPos $workingText $pos $avoid

		while ($avoid <> "+++")
			setVar $avoidedSectorsUgrid $avoidedSectorsUgrid&" "&$avoid&" "
			getLength $avoid $length 
			getLength $workingText $checkLength
			cutText $workingText $workingText ($pos+$length) 9999	
			getWord $workingText $avoid 1
			getWordPos $workingText $pos $avoid

		end
		goto :keepCountingAvoids
	saveVar $avoidedSectorsUgrid
	:doneAvoids
return


:delayTrigger
	setDelayTrigger delayUntilSaveMe :callSaveMe 5000
return

:xenter
	send "q y * t* * *" $bot~password "*    *    *       za"&$figs&"*   z*   f z 1*  z c d *  "
return



#GETCOURSE SUB ###################################################################################################
:getCourses
	killalltriggers
	setVar $originalDestination $destination
	send "f*"&$destination&"*"
	getCourse $course $player~current_sector $destination
	setVar $index 1
	while ($index <= $course)
		if (($FIGHTER_GRID[$COURSE[$index]] <= 0) AND ($COURSE[$index] <> $originalDestination))
			setVar $destination $COURSE[$index]
                elseif ($COURSE[$index] <> $originalDestination)
		    	setVar $destination $originalDestination
		end
		add $index 1


	end

:noPath
	killAllTriggers
	return

#END GETCOURSE SUB ###################################################################################################




:attemptRefurb
:attempt_Refurb
	setVar $limpetCashNeeded ((($maxMines-$player~limpets)*$game~limpet_cost)+$game~limpet_removal_cost)
	setVar $armidCashNeeded ((($maxMines-$player~armids)*$game~armid_cost))
	setVar $cashNeeded ($limpetCashNeeded+$armidCashNeeded)
	setVar $furbing TRUE
	if ($cashNeeded > $player~credits)
		send "D" 
		waitOn "Citadel treasury contains "
		getWord CURRENTLINE $planet~CITADELCash 4
		stripText $planet~CITADELCash ","
		if ($planet~CITADELCash < $cashNeeded)
			send "'{" & $bot~bot_name & "} - Not enough cash for mine refurbs in treasury or on hand.*"	
			halt
		end
		send "t f "&($cashNeeded-$player~credits)&"* "
	end
	# check adj's for Dock.. if present, then we don't need a jump sector.
	setVar $i 1
	setVar $START_SECTOR $player~current_sector
	setVar $WeAreAdjDock FALSE
	while ($i <= SECTOR.WARPCOUNT[$START_SECTOR])
		setVar $adj_start SECTOR.WARPS[$START_SECTOR][$i]
		if ($adj_start = $map~stardock)
			setVar $WeAreAdjDock TRUE
		end
		add $i 1
	end

	if (($player~alignment < 1000) AND ($WeAreAdjDock = FALSE))
		setVar $player~RED_adj 0
		setvar $player~target $map~stardock
		gosub :player~findjumpsector
		send "n "
		if ($player~RED_adj = 0)
			waitfor "Command [TL="
			send "'{" & $bot~bot_name & "} - Cannot Find Jump Sector Adjacent Dock**"
			halt
		end
	end

	if ($player~alignment >= 1000)
		if ($WeAreAdjDock)
			send "^F" & $map~stardock & "*" & $START_SECTOR & "*Q/ "
		else
			send "^F" & $START_SECTOR & "*" & $map~stardock & "*F" & $map~stardock & "*" & $START_SECTOR & "*Q/ "
		end
	else
		if ($WeAreAdjDock)
			send "^F" & $map~stardock & "*" & $START_SECTOR & "*Q/ "
		else
			send "^F" & $START_SECTOR & "*" & $player~RED_adj & "*F" & $map~stardock & "*" & $START_SECTOR & "*Q/ "
		end
	end
	setTextLineTrigger noJoy :noJoy "*** Error - No route within"
	setTextTrigger cont :cont "ENDINTERROG"
	pause

	:noJoy
		killAllTriggers
		send "'{" $bot~bot_name "} - Cannot Find Path to StarDock!**"
		halt
	:cont
		killAllTriggers
		setDelayTrigger Latency_Delay		:Latency_Delay 500
		pause

		:Latency_Delay

		Echo "**" & ANSI_14 & "Please Stand By" & ANSI_15 & " - Calculating Distances...**"
		if (($player~alignment >= 1000) OR ($WeAreAdjDock))
			getdistance $dist1 $START_SECTOR $map~stardock
		else
			getdistance $dist1 $START_SECTOR $player~RED_adj
		end

		if ($dist1 <= 0)
			send "'{" $bot~bot_name "} " & $TagLineB & " - Insufficient Warp Data Plotting Course to Dock**"
			halt
		end

		getdistance $dist2 $map~stardock $START_SECTOR
		if ($dist2 <= 0)
			send "'{" $bot~bot_name "} " & $TagLineB & " - Insufficient Warp Data Plotting Return Course From Dock**"
			halt
		end

		setVar $ore_req (($dist1 + $dist2) * 3)

		if ($player~ore_holds < $ore_req)
			send "'{" $bot~bot_name "} - Not Enough ORE In Holds To Make Round Trip**"
			halt
		end

		if ($player~twarp_type = "No")
			send "'{" $bot~bot_name "} - Must Have Twarp 1 or 2**"
			halt
		end

		if ($player~unlimitedGame = 0)
			gosub :TurnsRequired
			if ($player~turnsRequired > $player~turns)
				send "'{" $bot~bot_name "} - Not Enough Turns. " & ANSI_12 & $player~turnsRequired & ANSI_15 & ", Required**"
				halt
			elseif ($player~turnsRequired <= $player~turns)
				setVar $tmp ($player~turns - $player~turnsRequired)
				if ($tmp <= $bot~bot_turn_limit)
					send "'{" $bot~bot_name "} - Proceeding Will Leave Fewer Than " & $bot~bot_turn_limit & " Turns!**"
					halt
				end
			end
		end

	send " C R " & $map~stardock & "*"
	setTextLineTrigger itsalive :itsalive "Items     Status  Trading % of max OnBoard"
	setTextLineTrigger nosoupforme :nosoupforme "I have no information about a port in that sector"
	pause
	:nosoupforme
		killAllTriggers
		send "'{" $bot~bot_name "} " & $TagLineB & " - StarDock appears to have been Blown Up!**"
		halt
	:itsalive
		killAllTriggers
		send "q "
		waitfor "(?="
		setVar $msg ""
		if (($player~alignment >= 1000) AND ($WeAreAdjDock = FALSE))
			setVar $player~warpto $map~stardock
			gosub :DoTwarp
		elseif (($WeAreAdjDock = FALSE) AND ($player~RED_adj <> 0))
			setVar $player~warpto $player~RED_adj
			gosub :DoTwarp
		else
			send " m " & $map~stardock & "*  *  P  S G Y G Q "
		end
		if ($msg = "")
			waitfor "You leave the Galactic Bank."
		else
			send "'{" $bot~bot_name "} - Unknown Problem Detected. Check TA!**"
			halt
		end
		gosub :player~quikstats

		setVar $_Limps "Max"
		setVar $_Mines "Max"
		gosub :DoPurchases
		send "Q Q Q Q Z N M " & $START_SECTOR & "* Y  Y  Y  * L Z" & #8 & $planet~planet & "* p  s  s * * c *"
		gosub :player~quikstats
		if ($player~current_sector = $map~stardock)
			send "'{" $bot~bot_name "} - Twarp Error, Should be Hiding on Dock!**"
			halt
		end
		send "q tnt1* c "
	

return

:DoTwarp
	setVar $msg ""
	setvar $paused false
	setvar $photoned false
	if ($player~warpto > 0)
		send "q t * t 1*  q * * mz" & $player~warpto "*"
		setTextTrigger there        :adj_warp "You are already in that sector!"
		setTextLineTrigger adj_warp :adj_warp "Sector  : " & $player~warpto & " "
		setTextTrigger locking      :locking "Do you want to engage the TransWarp drive?"
		setTextTrigger igd          :twarpIgd "An Interdictor Generator in this sector holds you fast!"
		setTextTrigger noturns      :twarpPhotoned "Your ship was hit by a Photon and has been disabled"
		setTextTrigger noroute      :twarpNoRoute "Do you really want to warp there? (Y/N)"
		pause
		:adj_warp
			killAllTriggers
			send "z*"
			goto :twarp_adj
		:locking
			killAllTriggers
			send "y"
			setTextLineTrigger twarp_lock 		:twarp_lock "TransWarp Locked"
			setTextLineTrigger no_twrp_lock 	:no_twarp_lock "No locating beam found"
			setTextLineTrigger twarp_adj 		:twarp_adj "<Set NavPoint>"
			setTextLineTrigger no_fuel 		:itwarpNoFuel "You do not have enough Fuel Ore"
			pause
		:twarpNoFuel
			killAllTriggers
			setVar $msg "Not enough fuel for T-warp."
			goto :twarpDone

		:twarp_adj
			killAllTriggers
			send " * p s"
			goto :twarpDone

		:twarpNoRoute
			killAllTriggers
			send "n* z* "
			setVar $msg "No route available!"
			goto :twarpDone

		:no_twarp_lock
			killAllTriggers
			send "n*zn"
			send "l " & #8 & $planet~planet "*c"
			setSectorParameter $player~warpto "FIGSEC" FALSE
			setVar $temp " "&$player~warpto&" "
			replaceText $database $temp " "
			subtract $database_count 1
			goto :select_boomsec

		:twarpIgd
			killAllTriggers
			setVar $msg "My ship is being held by Interdictor!"
			goto :twarpDone

		:twarpPhotoned
			killAllTriggers
			setVar $msg "I have been photoned and can not T-warp!"
			send "l " & #8 & $planet~planet "* j c *   "
			setvar $photoned true
			goto :twarpDone

		:itwarpnofuel
			killAllTriggers
			setVar $msg "I have no fuel!"
			send "l " & #8 & $planet~planet "* j c *   "
			goto :twarpDone

		:twarp_lock
			KillAlltriggers
			if ($player~alignment >= 1000)
				if ($furbing)
					setVar $str "y * * p s g y g q " 
				else
					setVar $str "y * *  " 
				end
				send $str
			else
				if ($furbing)
					setVar $str "y  *  *  m " & $map~stardock & " *  *  p s g y g q "
				else
					setVar $str "y * *  " 
				end
				send $str
			end
		:twarpDone
			if ($msg <> "")
				send "'{" $bot~bot_name "} Twarp Error - " & $msg & "**"
				setvar $paused true
			end
	end
	return

:bwarp

	killAllTriggers
	send "b" $player~warpto "*"
	setTextTrigger go :go5 "TransWarp Locked"
	setTextTrigger no :no5 "No locating beam found"
	goSub :delayTrigger
	pause

:no5
	killAllTriggers
	send "n "
	waitfor "Transporter shutting down."
	setVar $FIGHTER_GRID[$player~warpto] 0
	goto :select_boomsec

:go5
	killAllTriggers
	send "y z * "
	return

:FindJumpSector
	setVar $i 1
	setVar $player~RED_adj 0
	send "qq*"
	while (SECTOR.WARPSIN[$map~stardock][$i] > 0)
		setVar $player~RED_adj SECTOR.WARPSIN[$map~stardock][$i]
		send "m " & $player~RED_adj & "* y"
		setTextTrigger TwarpBlind 			:TwarpBlind "Do you want to make this jump blind? "
		setTextTrigger TwarpLocked			:TwarpLocked "All Systems Ready, shall we engage? "
		setTextLineTrigger TwarpVoided			:TwarpVoided "Danger Warning Overridden"
		setTextLineTrigger TwarpAdj			:TwarpAdj "<Set NavPoint>"
		pause
		:TwarpAdj
		killAllTriggers
		send " * "
		return

		:TwarpVoided
		killAllTriggers
		send " N N "
		goto :TryingNextAdj

		:TwarpLocked
		killAllTriggers
		send " N "

		goto :SectorLocked

		:TwarpBlind
		killAllTriggers
		send " N "

		:TryingNextAdj
    	add $i 1
	end

	:NoAdjsFound
		setVar $player~RED_adj 0
		return

	:SectorLocked
		return


:TurnsRequired
	send "i"
	setTextLineTrigger TurnsRequired_TPW	:TurnsRequired_TPW "Turns to Warp  : "
	pause

	:TurnsRequired_TPW
	killAllTriggers
	getWord CURRENTLINE $player~turnsRequired_TPW 5

	if ($player~RED_adj > 0)
		# twarp to jmp sector, then into SD sect, then twarp home
		setVar $player~turnsRequired_temp ($player~turnsRequired_TPW * 3)
		if ($_Tow > 0)
			# 2 Turns for exporting into other ship and back again
			add $player~turnsRequired_temp 2
			# 3 Turns for initial Port then x into other ship, port & shop, then x and report
			#   b4 heading home
			add $player~turnsRequired_temp 3
		else
			add $player~turnsRequired_temp 1
		end
	else
		setVar $player~turnsRequired_temp ($player~turnsRequired_TPW * 2)
		# 1 Turn to port at dock
		add $player~turnsRequired_temp 1
	end

	setVar $player~turnsRequired $player~turnsRequired_temp
	return


:callSaveMe
	send "q q q q * u y n.* c '"&$bot~bot_name&" call*"
	halt

:DoPurchases
	send "h "
	waitfor "<Hardware Emporium>"
	#=============================================== PURCHASE LIMPS
	if ($_Limps  <> "")
		send "L "
		waitfor "How many mines do you want"
		if ($_Limps  = "Max")
			getText CURRENTLINE $buy "(Max" ")"
			send $buy & "* "
		else
			send $buy $_Limps & "* "
		end
		waitfor "<Hardware Emporium>"
	end
	#=============================================== PURCHASE ARMIDS
	if ($_Mines  <> "")
		send "M "
		setVar $buy 0
		waitfor "How many mines do you"
		if ($_Mines  = "Max")
			getText CURRENTLINE $buy "(Max" ")"
			send $buy & "* "
		else
			send $_Mines & "* "
		end
		waitfor "<Hardware Emporium>"
	end
	return
:setwindow
	setWindowContents gridder $window_content
	replacetext $window_content "*" "[][]"
	savevar $window_content
return

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\player\findjumpsector\player"
