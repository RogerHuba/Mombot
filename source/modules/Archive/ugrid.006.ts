	logging off
	reqRecording
	goto :load_script
	
	# ============================== QUICKSTATS ==============================
#=================================QUIKSTATS================================================
:quikstats
    setVar $CURRENT_PROMPT      "Undefined"
    killtrigger noprompt
    killtrigger prompt
    killtrigger statlinetrig
    killtrigger getLine2
    setTextLineTrigger  prompt      :allPrompts     #145 & #8
    setTextLineTrigger  statlinetrig    :statStart      #179
    send #145&"/"
    pause
    :allPrompts
        getWord CURRENTLINE $CURRENT_PROMPT 1
        setVar $FULL_CURRENT_PROMPT CURRENTLINE
        stripText $FULL_CURRENT_PROMPT #145
        stripText $FULL_CURRENT_PROMPT #8
        stripText $CURRENT_PROMPT #145
        stripText $CURRENT_PROMPT #8
        setTextLineTrigger  prompt      :allPrompts     #145 & #8
        pause
    :statStart
        killtrigger prompt
        setVar $stats ""
        setVar $wordy ""
    :statsline
        killtrigger statlinetrig
        killtrigger getLine2
        setVar $line2 CURRENTLINE
        replacetext $line2 #179 " "
        striptext $line2 ","
        setVar $stats $stats & $line2
        getWordPos $line2 $pos "Ship"
        if ($pos > 0)
            goto :gotStats
        else
            setTextLineTrigger getLine2 :statsline
            pause
        end
    :gotStats
        setVar $stats $stats & " @@@"
        setVar $current_word 0
        while ($wordy <> "@@@")
            if ($wordy = "Sect")
                getWord $stats $CURRENT_SECTOR      ($current_word + 1)
            elseif ($wordy = "Turns")
                getWord $stats $TURNS           ($current_word + 1)
            elseif ($wordy = "Creds")
                getWord $stats $CREDITS         ($current_word + 1)
            elseif ($wordy = "Figs")
                getWord $stats $FIGHTERS        ($current_word + 1)
            elseif ($wordy = "Shlds")
                getWord $stats $SHIELDS         ($current_word + 1)
            elseif ($wordy = "Hlds")
                getWord $stats $TOTAL_HOLDS         ($current_word + 1)
            elseif ($wordy = "Ore")
                getWord $stats $ORE_HOLDS           ($current_word + 1)
            elseif ($wordy = "Org")
                getWord $stats $ORGANIC_HOLDS       ($current_word + 1)
            elseif ($wordy = "Equ")
                getWord $stats $EQUIPMENT_HOLDS     ($current_word + 1)
            elseif ($wordy = "Col")
                getWord $stats $COLONIST_HOLDS      ($current_word + 1)
            elseif ($wordy = "Phot")
                getWord $stats $PHOTONS         ($current_word + 1)
            elseif ($wordy = "Armd")
                getWord $stats $ARMIDS          ($current_word + 1)
            elseif ($wordy = "Lmpt")
                getWord $stats $LIMPETS         ($current_word + 1)
            elseif ($wordy = "GTorp")
                getWord $stats $GENESIS         ($current_word + 1)
            elseif ($wordy = "TWarp")
                getWord $stats $TWARP_TYPE          ($current_word + 1)
            elseif ($wordy = "Clks")
                getWord $stats $CLOAKS          ($current_word + 1)
            elseif ($wordy = "Beacns")
                getWord $stats $BEACONS         ($current_word + 1)
            elseif ($wordy = "AtmDt")
                getWord $stats $ATOMIC          ($current_word + 1)
            elseif ($wordy = "Corbo")
                getWord $stats $CORBO           ($current_word + 1)
            elseif ($wordy = "EPrb")
                getWord $stats $EPROBES         ($current_word + 1)
            elseif ($wordy = "MDis")
                getWord $stats $MINE_DISRUPTORS     ($current_word + 1)
            elseif ($wordy = "PsPrb")
                getWord $stats $PSYCHIC_PROBE       ($current_word + 1)
            elseif ($wordy = "PlScn")
                getWord $stats $PLANET_SCANNER      ($current_word + 1)
            elseif ($wordy = "LRS")
                getWord $stats $SCAN_TYPE           ($current_word + 1)
            elseif ($wordy = "Aln")
                getWord $stats $ALIGNMENT           ($current_word + 1)
            elseif ($wordy = "Exp")
                getWord $stats $EXPERIENCE          ($current_word + 1)
            elseif ($wordy = "Corp")
                getWord $stats $CORP            ($current_word + 1)
            elseif ($wordy = "Ship")
                getWord $stats $SHIP_NUMBER         ($current_word + 1)
            end
            add $current_word 1
            getWord $stats $wordy $current_word
        end
    :doneQuikstats
    killtrigger statlinetrig
    killtrigger getLine2
return
	# ============================== END QUICKSTATS SUB==============================

:load_script
	loadVar $bot_name
	loadVar $avoidedSectorsUgrid
	loadVar $unlimitedGame
	loadVar $bot_turn_limit
	loadVar $user_command_line
	loadVar $parm1
	loadVar $parm2
	loadVar $parm3
	loadVar $parm4
	loadVar $parm5
	loadVar $parm6
	loadVar $parm7
	loadVar $parm8
	loadVar $stardock
	loadVar $home_sector
	loadVar $backdoor
	loadvar $LIMPET_COST
	loadvar $ARMID_COST
	loadVar $LIMPET_REMOVAL_COST
	loadvar $password
	setVar $grid_limpets 3
	setVar $grid_armids 3
	setVar $refurb TRUE
	loadVar $FIG_FILE 		
	loadVar $LIMP_FILE 		
	loadVar $ARMID_FILE 
	loadvar $command
	setVar $GRIDDER_FILE 		"_MOM"&GAMENAME&"_GRIDDER_TARGETS.txt"
	setVar $MASTER_EDGE_FILE 	"_MOM_" & GAMENAME & "_EdgeMasterList.sectors"
	setVar $UNEXPLORED_FILE         "_MOM_UNEXPLORED_" & GAMENAME & ".sectors"
	setVar $imlimped FALSE
	setArray $move SECTORS
	setVar $checkedForInfo ""
	setVar $grid_figs 1
	setVar $attackretreat FALSE
	
	getSectorParameter SECTORS "FIGSEC" $isFigged
	getSectorParameter SECTORS "MINESEC" $isArmided
	getSectorParameter SECTORS "LIMPSEC" $isLimped
	fileExists $doesHelpFileExist "scripts\MOMBot\Help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\MOMBot\Help\"&$command&".txt" "- ugrid [targeting] {figs} {armids} {limpets} {safety} {planets} {warp} {refurb} {scrub} {avoid) {aggressive} {clear} {noansi} {ship2:#)" 
		write "scripts\MOMBot\Help\"&$command&".txt" "  Ultimate gridder. Visits all targeted sectors. " 
		write "scripts\MOMBot\Help\"&$command&".txt" "                                                            " 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - [targeting]   = How target list is generated.  Must be either" 
		write "scripts\MOMBot\Help\"&$command&".txt" "                     a filename to pull list from or 'auto' which "
		write "scripts\MOMBot\Help\"&$command&".txt" "                     will autogenerate list of targets.           " 
		write "scripts\MOMBot\Help\"&$command&".txt" "                                                                  " 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - [figs]        = Number of fighters to drop                   " 
		write "scripts\MOMBot\Help\"&$command&".txt" "                         - Default: 1                             " 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - [armids]      = Number of armid mines to drop                " 
		write "scripts\MOMBot\Help\"&$command&".txt" "                         - Default: 3                             " 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - [limps]       = Number of limpet mines to drop               " 
		write "scripts\MOMBot\Help\"&$command&".txt" "                         - Default: 3                             " 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - [exist]       = Overwrite grid               " 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - [safety]      = 'ultra', 'safe', and 'none'                  " 
		write "scripts\MOMBot\Help\"&$command&".txt" "              none = Will land adjacent to all non-figged sectors " 
		write "scripts\MOMBot\Help\"&$command&".txt" "              safe = Only will land to sectors with friendly limps" 
		write "scripts\MOMBot\Help\"&$command&".txt" "             ultra = Like safe, but needs friendly armids too     " 
		write "scripts\MOMBot\Help\"&$command&".txt" "                         - Default: ultra                         " 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - [planets]     = 'all', 'shielded', 'none'                    " 
		write "scripts\MOMBot\Help\"&$command&".txt" "               all = Avoid all planets in target sectors          " 
		write "scripts\MOMBot\Help\"&$command&".txt" "          shielded = Avoid only shielded planets in target sectors" 
		write "scripts\MOMBot\Help\"&$command&".txt" "                         - Default: all                           " 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - [warp]        = 'twarp' or 'bwarp'                           " 
		write "scripts\MOMBot\Help\"&$command&".txt" "                         - Default: twarp                         " 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - [norefurb]    = Turns off auto refurbing of mines at Stardock" 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - [scrub]       = Will scrub at dock when catching a limpet    " 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - [avoid]       = Avoid sectors with enemy limpets             " 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - [aggressive]  = Won't avoid big fighter groups               " 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - [passive]     = Avoids hitting player fighters or mines.     " 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - [clear]       = Clears internal list of avoided sectors.     " 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - [ship2:#]     = Second xport ship number     " 
		send "'{" $bot_name "} - Writing help file for this command in Help directory.*"
	end

	getWord $user_command_line $parm1 1 "EMPTY"
	if (($parm1 = "auto") OR ($parm1 = "EMPTY"))
	
	else
		setVar $gridTargets TRUE
	        setVar $targetFile $parm1
		fileexists $test $targetFile
		if ($test = FALSE)
		      send "'{" $bot_name "} - Grid target file: [" $targetFile "] does not exist, shutting down..*"
		      halt
                else
		      readToArray $targetFile $targetSectors
		end
	end
	getWord $user_command_line $parm2 2 "EMPTY"
	getWord $user_command_line $parm3 3 "EMPTY"
	getWord $user_command_line $parm4 4 "EMPTY"
	isNumber $test $parm2
	if ($test)
		setVar $grid_figs $parm2
	end
	isNumber $test $parm3
	if ($test)
		setVar $grid_armids $parm3
	end
	isNumber $test $parm4
	if ($test)
		setVar $grid_limpets $parm4
	end
	getWordPos $user_command_line $pos "aggressive" 
	if ($pos > 0)
		setVar $attackretreat TRUE
	else
		setVar $attackretreat FALSE
	end

	getWordPos $user_command_line $pos "noansi" 
	if ($pos > 0)
		setVar $noansi TRUE
	else
		setVar $noansi FALSE
	end

	getWordPos $user_command_line $pos "avoid" 
	if ($pos > 0)
		setVar $grid_avoid TRUE
	else
		setVar $grid_avoid FALSE
	end
	getWordPos $user_command_line $pos "scrub" 
	if ($pos > 0)
		setVar $autoclean TRUE
	else
		setVar $autoclean FALSE
	end
	getWordPos $user_command_line $pos "norefurb" 
	if ($pos > 0)
		setVar $refurb FALSE
	else
		setVar $refurb TRUE
	end
	getWordPos $user_command_line $pos "bwarp" 
	if ($pos > 0)
		setVar $grid_warp "bwarp"
	else
		setVar $grid_warp "twarp"
	end	
	getWordPos $user_command_line $pos "shield" 
	if ($pos > 0)
		setVar $avoidShieldedOnly TRUE
	else
		setVar $avoidShieldedOnly FALSE
	end
	getWordPos $user_command_line $pos "exist" 
	if ($pos > 0)
		setVar $gridExistingOnly TRUE
	else
		setVar $gridExistingOnly FALSE
	end

	getWordPos $user_command_line $pos "clear" 
	if ($pos > 0)
		setVar $avoidedSectorsUgrid ""
	end
	
	getWordPos $user_command_line $pos "ship2:" 
	if ($pos > 0)
		getText " "&$user_command_line&" " $ship2 "ship2:" " "
		setVar $xport_grid TRUE
	end


	getWordPos $user_command_line $pos "none" 
	if ($pos > 0)
		setVar $ultraSafeLimpet FALSE
		setVar $ultraSafeArmid FALSE
	else
		getWordPos $user_command_line $pos "safe" 
		if ($pos > 0)
			setVar $ultraSafeLimpet TRUE
			setVar $ultraSafeArmid FALSE
		else
			setVar $ultraSafeLimpet TRUE
			setVar $ultraSafeArmid TRUE
		end
	end
	
	getWordPos $user_command_line $pos "passive" 
	if ($pos > 0)
		setVar $passive TRUE
		setVar $avoid TRUE
	else
		setVar $passive FALSE
	end
	

if (($stardock = 0) OR ($stardock = ""))
		send "'{" $bot_name "} - Stardock is not defined.  Please define stardock variable in the bot.*"
		halt
	end
	if ($isFigged = "")
		send "'{" $bot_name "} - It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		halt
	end
	if ($isArmided = "")
		send "'{" $bot_name "} - It appears no armid data is available.  Run an armid grid checker that uses the sector parameter MINESEC. (Try armids command)*"
		halt
	end
	if ($isLimped = "")
		send "'{" $bot_name "} - It appears no limpet data is available.  Run a limpet grid checker that uses the sector parameter LIMPSEC. (Try limps command)*"
		halt
	end
	if ($PHOTONS > 0)
	       send "'Can not run with photons on your ship.*"
               halt
	end

	gosub :quikstats
	if ($current_prompt <> "Citadel")
		send "'{" $bot_name "} - Must start gridder from citadel prompt.*"
		halt
	end
	if ($PHOTONS > 0)
		send "'{" $bot_name "} - You should not use a ship with photons to grid.*"
		halt
	end

killalltriggers
goSub :checkAvoidedSectors

:checkForTargets
	send "q"
	gosub :getPlanetInfo
	send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*q"
	send "'{" $bot_name "} - Clearing messages for possible exit/enter later*"
	gosub :xenter
	gosub :xenter
	gosub :xenter
	gosub :landOnPlanetEnterCitadel
	setVar $limpetBefore $LIMPETS
	setVar $limpetAfter $limpetBefore
	setVar $armidBefore $ARMIDS
	setVar $armidAfter $armidBefore

	send "'{" $bot_name "} - M()M Unlimited Gridder Powering Up!*"
	waitFor "(?="
	window gridder 300 170 ("M()M Unlimited Gridder - " & GAMENAME) ONTOP
	setWindowContents gridder "      Starting up!*"

	setVar $homesec $CURRENT_SECTOR


:checkShip
	killAllTriggers
	gosub :quikstats
	send "c;q"
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
	setVar $max_figs $FIGHTERS
	gosub :quikstats
	setVar $ship1 $ship_number
	setVar $next_ship "2"
:restart
	send "q"
	gosub :getPlanetInfo
	send "c "
	gosub :findAllTargetSectors
	gosub :assemble_mac
	gosub :assemble_return_mac
	gosub :assemble_attack_mac
	gosub :assemble_land_mac
:select_boomsec
	killAllTriggers
	gosub :quikstats
	gosub :assemble_return_mac
	if (($TWARP = "No") OR ($CURRENT_SECTOR <> $homesec))
			goto :callSaveMe
		end
	if ($FIGHTERS < $max_figs)
		echo ANSI_12 "*Not enough fighters to safely continue.*" ANSI_7
		halt
	end
	setVar $limpetAfter $LIMPETS
	setVar $armidAfter $ARMIDS
	if ($boomsec > 0)
		if (($limpetBefore > $limpetAfter) AND ($isLimped = FALSE))
			setVar $limpetBefore $LIMPETS
			setVar $limpetAfter $limpetBefore
			setSectorParameter $CURRENT_SECTOR "LIMPSEC" TRUE
		elseif (($limpetBefore = $limpetAfter) AND ($isLimped = FALSE))
			setVar $imlimped TRUE
		end
		if (($armidBefore > $armidAfter) AND ($isArmided = FALSE))
			setVar $armidBefore $ARMIDS
			setVar $armidAfter $armidBefore
			setSectorParameter $CURRENT_SECTOR "MINESEC" TRUE
		end
	end
	if ($TWARP = "No")
		goto :callSaveMe
	end

	if ((($LIMPETS < $grid_limpets) OR ($ARMIDS < $grid_armids)) OR (($imlimped = TRUE) AND ($autoClean = TRUE)))
		if ($refurb)
			setWindowContents gridder "    Auto Refurbing.. *"
			gosub :attempt_refurb
		else
			echo ANSI_12 "*You must stock up on mines before continuing." ANSI_7
			halt
		end
		gosub :quikstats
		setVar $limpetBefore $LIMPETS
		setVar $limpetAfter $limpetBefore
		setVar $armidBefore $ARMIDS
		setVar $armidAfter $armidBefore
	end
:continueOn
	getRnd $random 1 $databaseCount
	getWord $database $warpto $random
	setWindowContents gridder "*      Targets left to hit:"&$databaseCount&"*"
	
	if ($warpto = 0)
		send "'{" $bot_name "} - Database Cleared - Recalculating and Restarting...*"
		waitOn "Message sent on sub-space"
		goto :restart
	else
		getDistance $distance $move[$warpto] $warpto
		if ($distance <= 0)
			send "^f"&$move[$warpto]&"*"&$warpto&"*q"
			waitOn "ENDINTERROG"
			getDistance $distance $move[$warpto] $warpto
		end
		
	end

:clearit
	KillAllTriggers
	replaceText $database " "&$warpto&" " " "
	subtract $databaseCount 1
	setVar $furbing FALSE
	if ($grid_warp = "twarp")
		gosub :doTwarp
	elseif ($grid_warp = "bwarp")
		gosub :bwarp
	else
		halt
	end


:hittingsec
	KillAllTriggers
	setVar $boomsec $move[$warpto]
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
	#gosub :quikstats
	#if (($TWARP = "No") OR ($CURRENT_SECTOR <> $warpto))
	#	goto :callSaveMe
	#end
    if ($gridExistingOnly)
		send $mac&$return_mac
	#	gosub :quikstats
	#	if (($TWARP = "No") OR ($CURRENT_SECTOR <> $homesec))
	#		goto :callSaveMe
	#	end
		send $land_mac
		goto :select_boomsec
	end
	send "sdszh*  "
	waitFor "Relative Density Scan"
	waitFor "Long Range Scan"
	waitFor "[" & $warpto & "]"
	getDistance $distance $warpto $boomsec
	getDistance $distanceback $boomsec $warpto 
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
				#gosub :quikstats
				#if (($TWARP = "No") OR ($CURRENT_SECTOR <> $homesec))
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
				#gosub :quikstats
				#if (($TWARP = "No") OR ($CURRENT_SECTOR <> $homesec))
				#	goto :callSaveMe
				#end
				send $land_mac
				setVar $avoidedSectorsUgrid $avoidedSectorsUgrid&" "&$boomsec&" "
				saveVar $avoidedSectorsUgrid
				send "'{" $bot_name "} - Probable Enemy Limpet Detected - Sector " $boomsec ".*"
				goto :select_boomsec
			end
		end
		if ((SECTOR.anomaly[$boomsec] = TRUE) and ($isLimped = FALSE))
			setVar $imlimped TRUE
		end
		
		send "m"
		gosub :return_triggers
		#if ((SECTOR.MINES.QUANTITY[$boomsec] > 0) AND (($mineOwner <> "yours") AND ($mineOwner <> "belong to your Corp")))
		#	send $boomsec & $attack_mac & "* " & $mac & $return_mac
        #else
			setVar $entire_macro $boomsec&$attack_mac&$mac&$return_mac
			if ($noansi = TRUE)
				replaceText $entire_macro " " ""
			end
			send $entire_macro
        #end
        send $land_mac
		if (($grid_figs > 0) AND (SECTOR.FIGS.QUANTITY[$boomsec] < ($offodd*2)))
			setSectorParameter $boomsec "FIGSEC" TRUE
		end
        #gosub :quikstats
		#if (($TWARP = "No") OR ($CURRENT_SECTOR <> $homesec))
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
		gosub :quikstats
		if (($TWARP = "No") OR ($CURRENT_SECTOR <> $homesec))
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
					#echo SECTOR.WARPSIN[$destination][$i] "*"
					
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
	send "'{" $bot_name "} - "&$databaseCount&" target sectors found.*"
	if ($databaseCount <= 0)
		send "'{" $bot_name "} - Visited every sector possible. Refresh fighters and update warp data to verify..*"
		if ($refurb)
			gosub :attempt_refurb
			gosub :quikstats
			send "p "&$home_sector&"* y "
			gosub :quikstats
			send "'{" $bot_name "} - Scrubbed at dock and pwarped home..*"

		end
		halt
	end
return


#-=-=-=-=-=- assemble macro -=-=-=-=-=-=-=-=-
:assemble_mac
        setVar $mac ""
	if ($gridExistingOnly)
		if ($grid_figs > 0)
			setVar $mac "f " & $grid_figs & "*cd"
		end
		if (($grid_armids > 0) AND ($ARMIDS > 0))
			setVar $mac $mac & "h1 z" & $grid_armids & "*zc*"
		end
		if (($grid_limpets > 0) AND ($LIMPETS > 0))
			setVar $mac $mac & "h2 z" & $grid_limpets & "*zc*"
		end
	else
		if ($grid_figs > 0)
			setVar $mac "f " & $grid_figs & "*cd"
		end
		if (($grid_armids > 0) AND ($ARMIDS > 0))
			setVar $mac $mac & "h1 z" & $grid_armids & "*zc*"
		end
		if (($grid_limpets > 0) AND ($LIMPETS > 0))
			setVar $mac $mac & "h2 z" & $grid_limpets & "*zc*"
		end
	end
return

:assemble_attack_mac
        setVar $attack_mac "* za" & $figs & "* jr * "
return

:assemble_return_mac
	setVar $return_mac ""
	if ($xport_grid)
		if ($ship_number = $ship1)
			setVar $xport_ship $ship2
		else
			setVar $xport_ship $ship1
		end
		setVar $return_mac "x   "&$xport_ship&"*  *  "
	end
	setVar $return_mac $return_mac&$homesec & "* y y * * "

return

:assemble_land_mac
	setVar $land_mac "l j" & #8 & #8 & #8 & #8 & #8 & $planet & "*  * j m  * * *  t * t 1* c * "
	#setVar $land_mac "l " & $planet & "*  m  * * *  t * t 1*  c  "
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
	send "l " $planet "* c"
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
	send "q y * t* * *" $password "*    *    *       za"&$figs&"*   z*   f z 1*  z c d *  "
return



#GETCOURSE SUB ###################################################################################################
:getCourses
	killalltriggers
	setVar $originalDestination $destination
	send "f*"&$destination&"*"
	getCourse $course $current_sector $destination
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


# ==============================  START PLANET INFO SUBROUTINE  =================
:getPlanetInfo
	send "*"
	setTextLineTrigger planetInfo :planetInfo "Planet #"
	pause

	:planetinfo
		setVar $CITADEL 0
		setVar $SECTOR_CANNON 0
		setVar $ATMOSPHERE_CANNON 0
		setVar $CITADEL_CREDITS 0
		getWord CURRENTLINE $PLANET 2
		stripText $PLANET "#"
		getWord CURRENTLINE $current_sector 5
		stripText $current_sector ":"
		waitOn "2 Build 1   Product    Amount     Amount     Maximum"

        :getPlanetStuff
		setTextLineTrigger fuelstart :fuelstart "Fuel Ore"
		setTextLineTrigger orgstart :orgstart "Organics"
		setTextLineTrigger equipstart :equipstart "Equipment"
		setTextLineTrigger figstart :figstart "Fighters        N/A"
		setTextLineTrigger citadelstart :citadelstart "Planet has a level"
		setTextLineTrigger cannon :cannonstart ", AtmosLvl="
		setTextTrigger planetInfoDone :planetInfoDone "Planet command (?=help)"
		pause

        :fuelstart
		getWord CURRENTLINE $PLANET_FUEL 6
		getWord CURRENTLINE $PLANET_FUEL_MAX 8
		stripText $PLANET_FUEL ","
		stripText $PLANET_FUEL_MAX ","
		pause

        :orgstart
		getWord CURRENTLINE $PLANET_ORGANICS 5
		getWord CURRENTLINE $PLANET_ORGANICS_MAX 7
		stripText $PLANET_ORGANICS ","
		stripText $PLANET_ORGANICS_MAX ","
		pause

        :equipstart
		getWord CURRENTLINE $PLANET_EQUIPMENT 5
		getWord CURRENTLINE $PLANET_EQUIPMENT_MAX 7
		stripText $PLANET_EQUIPMENT ","
		stripText $PLANET_EQUIPMENT_MAX ","
		pause

        :figstart
		getWord CURRENTLINE $PLANET_FIGHTERS 5
		getWord CURRENTLINE $PLANET_FIGHTERS_MAX 7
		stripText $PLANET_FIGHTERS ","
		stripText $PLANET_FIGHTERS_MAX ","
		pause

        :citadelstart
		getWord CURRENTLINE $CITADEL 5
		getWord CURRENTLINE $CITADEL_CREDITS 9
		striptext $CITADEL_CREDITS ","
		pause

	:cannonstart
		getWord CURRENTLINE $ATMOSPHERE_CANNON 5
		getWord CURRENTLINE $SECTOR_CANNON 6
		stripText $SECTOR_CANNON "SectLvl="
		striptext $SECTOR_CANNON "%"
		stripText $ATMOSPHERE_CANNON "AtmosLvl="
		striptext $ATMOSPHERE_CANNON "%"
		striptext $ATMOSPHERE_CANNON ","
		pause
	:planetInfoDone
		killtrigger citadelstart
		killtrigger cannon

return
# ==============================  END PLANET INFO SUBROUTINE  =================


:attemptRefurb
:attempt_Refurb
	setVar $limpetCashNeeded ((($maxMines-$LIMPETS)*$LIMPET_COST)+$LIMPET_REMOVAL_COST)
	setVar $armidCashNeeded ((($maxMines-$ARMIDS)*$ARMID_COST))
	setVar $cashNeeded ($limpetCashNeeded+$armidCashNeeded)
	setVar $furbing TRUE
	if ($cashNeeded > $CREDITS)
		send "D" 
		waitOn "Citadel treasury contains "
		getWord CURRENTLINE $citadelCash 4
		stripText $citadelCash ","
		if ($citadelCash < $cashNeeded)
			send "'{" & $bot_name & "} - Not enough cash for mine refurbs in treasury or on hand.*"	
			halt
		end
		send "t f "&($cashNeeded-$CREDITS)&"* "
	end
	# check adj's for Dock.. if present, then we don't need a jump sector.
	setVar $i 1
	setVar $START_SECTOR $CURRENT_SECTOR
	setVar $WeAreAdjDock FALSE
	while ($i <= SECTOR.WARPCOUNT[$START_SECTOR])
		setVar $adj_start SECTOR.WARPS[$START_SECTOR][$i]
		if ($adj_start = $stardock)
			setVar $WeAreAdjDock TRUE
		end
		add $i 1
	end

	if (($ALIGNMENT < 1000) AND ($WeAreAdjDock = FALSE))
		setVar $RED_adj 0
		gosub :FindJumpSector
		if ($RED_adj <> 0)
			send ("'{"&$bot_name&"} - Jump Sector Found - Using Sector "&$RED_adj&"**")
		else
			waitfor "Command [TL="
			send "'{" & $bot_name & "} - Cannot Find Jump Sector Adjacent Dock**"
			halt
		end
	end

	if ($ALIGNMENT >= 1000)
		if ($WeAreAdjDock)
			send "^F" & $stardock & "*" & $START_SECTOR & "*Q/ "
		else
			send "^F" & $START_SECTOR & "*" & $stardock & "*F" & $stardock & "*" & $START_SECTOR & "*Q/ "
		end
	else
		if ($WeAreAdjDock)
			send "^F" & $stardock & "*" & $START_SECTOR & "*Q/ "
		else
			send "^F" & $START_SECTOR & "*" & $RED_adj & "*F" & $stardock & "*" & $START_SECTOR & "*Q/ "
		end
	end
	setTextLineTrigger noJoy :noJoy "*** Error - No route within"
	setTextTrigger cont :cont "(?="
	pause

	:noJoy
		killAllTriggers
		send "'{" $bot_name "} - Cannot Find Path to StarDock!**"
		halt
	:cont
		killAllTriggers
		setDelayTrigger Latency_Delay		:Latency_Delay 500
		pause

		:Latency_Delay

		Echo "**" & ANSI_14 & "Please Stand By" & ANSI_15 & " - Calculating Distances...**"
		if (($ALIGNMENT >= 1000) OR ($WeAreAdjDock))
			getdistance $dist1 $START_SECTOR $stardock
		else
			getdistance $dist1 $START_SECTOR $RED_adj
		end

		if ($dist1 <= 0)
			send "'{" $bot_name "} " & $TagLineB & " - Insufficient Warp Data Plotting Course to Dock**"
			halt
		end

		getdistance $dist2 $stardock $START_SECTOR
		if ($dist2 <= 0)
			send "'{" $bot_name "} " & $TagLineB & " - Insufficient Warp Data Plotting Return Course From Dock**"
			halt
		end

		setVar $ore_req (($dist1 + $dist2) * 3)

		if ($ORE_HOLDS < $ore_req)
			send "'{" $bot_name "} - Not Enough ORE In Holds To Make Round Trip**"
			halt
		end

		if ($TWARP_TYPE = "No")
			send "'{" $bot_name "} - Must Have Twarp 1 or 2**"
			halt
		end

		if ($unlimitedGame = 0)
			gosub :TurnsRequired
			if ($TurnsRequired > $TURNS)
				send "'{" $bot_name "} - Not Enough Turns. " & ANSI_12 & $TurnsRequired & ANSI_15 & ", Required**"
				halt
			elseif ($TurnsRequired <= $TURNS)
				setVar $tmp ($TURNS - $TurnsRequired)
				if ($tmp <= $bot_turn_limit)
					send "'{" $bot_name "} - Proceeding Will Leave Fewer Than " & $bot_turn_limit & " Turns!**"
					halt
				end
			end
		end

	send " C R " & $stardock & "*Q "
	setTextLineTrigger itsalive :itsalive "Items     Status  Trading % of max OnBoard"
	setTextLineTrigger nosoupforme :nosoupforme "I have no information about a port in that sector"
	pause
	:nosoupforme
		killAllTriggers
		send "'{" $bot_name "} " & $TagLineB & " - StarDock appears to have been Blown Up!**"
		halt
	:itsalive
		killAllTriggers
		waitfor "(?="
		setVar $msg ""
		if (($ALIGNMENT >= 1000) AND ($WeAreAdjDock = FALSE))
			setVar $warpto $stardock
			gosub :DoTwarp
		elseif (($WeAreAdjDock = FALSE) AND ($RED_adj <> 0))
			setVar $warpto $RED_adj
			gosub :DoTwarp
		else
			send " m " & $stardock & "*  *  P  S G Y G Q "
		end
		if ($msg = "")
			waitfor "You leave the Galactic Bank."
		else
			send "'{" $bot_name "} - Unknown Problem Detected. Check TA!**"
			halt
		end
		gosub :quikstats

		setVar $_Limps "Max"
		setVar $_Mines "Max"
		gosub :DoPurchases
		send "Q Q Q Q Z N M " & $START_SECTOR & "* Y  Y  Y  * L Z" & #8 & $planet & "* p  s  s * * c *"
		gosub :quikstats
		if ($CURRENT_SECTOR = $stardock)
			send "'{" $bot_name "} - Twarp Error, Should be Hiding on Dock!**"
			halt
		end
		send "q tnt1* c "
	

return

:DoTwarp
	setVar $msg ""
	if ($warpto > 0)
		send "q q * * mz" & $warpto "*"
		setTextTrigger there        :adj_warp "You are already in that sector!"
		setTextLineTrigger adj_warp :adj_warp "Sector  : " & $warpto & " "
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
			send "l " & #8 & $PLANET "*c"
			setSectorParameter $warpto "FIGSEC" FALSE
			setVar $temp " "&$warpto&" "
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
			goto :twarpDone

		:twarp_lock
			KillAlltriggers
			if ($ALIGNMENT >= 1000)
				if ($furbing)
					setVar $str "y * * p s g y g q " 
				else
					setVar $str "y * *  " 
				end
				send $str
			else
				if ($furbing)
					setVar $str "y  *  *  m " & $STARDOCK & " *  *  p s g y g q "
				else
					setVar $str "y * *  " 
				end
				send $str
			end
		:twarpDone
			if ($msg <> "")
				send "'{" $bot_name "} Twarp Error - " & $msg & "**"
			end
	end
	return

:bwarp

	killAllTriggers
	send "b" $warpto "*"
	setTextTrigger go :go5 "TransWarp Locked"
	setTextTrigger no :no5 "No locating beam found"
	goSub :delayTrigger
	pause

:no5
	killAllTriggers
	send "n "
	waitfor "Transporter shutting down."
	setVar $FIGHTER_GRID[$warpto] 0
	goto :select_boomsec

:go5
	killAllTriggers
	send "y z * "
	return

:FindJumpSector
	setVar $i 1
	setVar $RED_adj 0
	send "qq*"
	while (SECTOR.WARPSIN[$stardock][$i] > 0)
		setVar $RED_adj SECTOR.WARPSIN[$stardock][$i]
		send "m " & $RED_adj & "* y"
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
		setVar $RED_adj 0
		return

	:SectorLocked
		return


:TurnsRequired
	send "i"
	setTextLineTrigger TurnsRequired_TPW	:TurnsRequired_TPW "Turns to Warp  : "
	pause

	:TurnsRequired_TPW
	killAllTriggers
	getWord CURRENTLINE $TurnsRequired_TPW 5

	if ($RED_adj > 0)
		# twarp to jmp sector, then into SD sect, then twarp home
		setVar $TurnsRequired_temp ($TurnsRequired_TPW * 3)
		if ($_Tow > 0)
			# 2 Turns for exporting into other ship and back again
			add $TurnsRequired_temp 2
			# 3 Turns for initial Port then x into other ship, port & shop, then x and report
			#   b4 heading home
			add $TurnsRequired_temp 3
		else
			add $TurnsRequired_temp 1
		end
	else
		setVar $TurnsRequired_temp ($TurnsRequired_TPW * 2)
		# 1 Turn to port at dock
		add $TurnsRequired_temp 1
	end

	setVar $TurnsRequired $TurnsRequired_temp
	return


:callSaveMe
	send "q q q q * '"&$bot_name&" call*"
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

