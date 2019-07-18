	logging off
	reqRecording
	goto :load_script
	

:load_script
	loadVar $SWITCHBOARD~bot_name
	loadVar $avoidedSectorsUgrid
	loadVar $PLAYER~unlimitedGame
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
	loadVar $MAP~stardock
	loadVar $MAP~home_sector
	loadVar $MAP~backdoor
	loadvar $LIMPET_COST
	loadvar $ARMID_COST
	loadVar $LIMPET_REMOVAL_COST
	loadvar $password
	loadVar $alarm_list
	setVar $PLAYER~surroundLimp 3
	setVar $PLAYER~surroundMine 3
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
	setVar $PLAYER~surroundFigs 1
	setVar $attackretreat FALSE
	
	
	getSectorParameter SECTORS "FIGSEC" $isFigged
	getSectorParameter SECTORS "MINESEC" $isArmided
	getSectorParameter SECTORS "LIMPSEC" $isLimped
	if ($parm1 = "help")
		delete "scripts\mombot\help\"&$command&".txt"
	end
	fileExists $doesHelpFileExist "scripts\mombot\help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\mombot\help\"&$command&".txt" "- sgrid {figs} {armids} {limpets} {min_unfigged} {safety} {planets} {warp} {norefurb}" 
		write "scripts\mombot\help\"&$command&".txt" "  Surround gridder. Visits all targeted sectors and surrounds     " 
		write "scripts\mombot\help\"&$command&".txt" "  them before twarping back.                                      " 
		write "scripts\mombot\help\"&$command&".txt" "   - [figs]        = Number of fighters to drop                   " 
		write "scripts\mombot\help\"&$command&".txt" "                         - Default: 1                             " 
		write "scripts\mombot\help\"&$command&".txt" "   - [armids]      = Number of armid mines to drop                " 
		write "scripts\mombot\help\"&$command&".txt" "                         - Default: 3                             " 
		write "scripts\mombot\help\"&$command&".txt" "   - [limps]       = Number of limpet mines to drop               " 
		write "scripts\mombot\help\"&$command&".txt" "                         - Default: 3                             " 
		write "scripts\mombot\help\"&$command&".txt" "   - [min_unfigged]= Minimum unfigged sectors needed to surround  " 
		write "scripts\mombot\help\"&$command&".txt" "                         - Default: 3                             " 
		write "scripts\mombot\help\"&$command&".txt" "   - [safety]      = 'ultra', 'safe', and 'none'                  " 
		write "scripts\mombot\help\"&$command&".txt" "              none = Will surround all figged sectors             " 
		write "scripts\mombot\help\"&$command&".txt" "              safe = Will surround sectors that have corp limps   " 
		write "scripts\mombot\help\"&$command&".txt" "             ultra = Like safe, but needs friendly armids too     " 
		write "scripts\mombot\help\"&$command&".txt" "                         - Default: none                          " 
		write "scripts\mombot\help\"&$command&".txt" "   - [planets]     = 'all', 'shielded'                            " 
		write "scripts\mombot\help\"&$command&".txt" "               all = Avoid all planets in target sectors          " 
		write "scripts\mombot\help\"&$command&".txt" "          shielded = Avoid only shielded planets in target sectors" 
		write "scripts\mombot\help\"&$command&".txt" "                         - Default: all                           " 
		write "scripts\mombot\help\"&$command&".txt" "   - [warp]        = 'twarp' or 'bwarp'                           " 
		write "scripts\mombot\help\"&$command&".txt" "                         - Default: twarp                         " 
		write "scripts\mombot\help\"&$command&".txt" "   - [norefurb]    = Turns off auto refurbing of mines at Stardock" 
		write "scripts\mombot\help\"&$command&".txt" "   - [restart]     = Automatically restarts gridding when finished" 
		send "'{" $SWITCHBOARD~bot_name "} - Writing help file for this command in Help directory.*"
	end
	if ($parm1 = "help")
		halt
	end
	getWord $user_command_line $parm1 1 "EMPTY"
	getWord $user_command_line $parm2 2 "EMPTY"
	getWord $user_command_line $parm3 3 "EMPTY"
	getWord $user_command_line $parm4 4 "EMPTY"
	isNumber $test $parm1
	if ($test)
		setVar $PLAYER~surroundFigs $parm1
	else
		setVar $PLAYER~surroundFigs 1
	end
	isNumber $test $parm2
	if ($test)
		setVar $PLAYER~surroundMine $parm2
	else
		setVar $PLAYER~surroundMine 3
	end
	isNumber $test $parm3
	if ($test)
		setVar $PLAYER~surroundLimp $parm3
	else
		setVar $PLAYER~surroundLimp 3
	end
	isNumber $test $parm4
	if ($test)
		setVar $min_unfigged $parm4
	else
		setVar $min_unfigged 4
	end
	
	getWordPos $user_command_line $pos "avoid" 
	if ($pos > 0)
		setVar $grid_avoid TRUE
	else
		setVar $grid_avoid FALSE
	end
	getWordPos $user_command_line $pos "alarm" 
	if ($pos > 0)
		setVar $alarm_active TRUE
	else
		setVar $alarm_active FALSE
	end
	getWordPos $user_command_line $pos "norefurb" 
	if ($pos > 0)
		setVar $refurb FALSE
	else
		setVar $refurb TRUE
	end
	getWordPos $user_command_line $pos "restart" 
	if ($pos > 0)
		setVar $restart TRUE
	else
		setVar $restart FALSE
	end
	getWordPos $user_command_line $pos "bwarp" 
	if ($pos > 0)
		setVar $grid_warp "bwarp"
	else
		setVar $grid_warp "twarp"
	end	
	getWordPos $user_command_line $pos "shield" 
	if ($pos > 0)
		setVar $PLAYER~surroundAvoidShieldedOnly TRUE
		setVar $PLAYER~surroundAvoidAllPlanets FALSE
	else
		setVar $PLAYER~surroundAvoidAllPlanets TRUE
		setVar $PLAYER~surroundAvoidShieldedOnly FALSE
	end
	
	getWordPos $user_command_line $pos "clear" 
	if ($pos > 0)
		setVar $avoidedSectorsUgrid ""
	end
	
			setVar $ultraSafeLimpet FALSE
			setVar $ultraSafeArmid FALSE
	
	getWordPos $user_command_line $pos "passive" 
	if ($pos > 0)
                setvar $PLAYER~surroundOverwrite FALSE
                setVar $PLAYER~surroundPassive   TRUE
                setVar $PLAYER~surroundNormal    FALSE
	else
                setvar $PLAYER~surroundOverwrite FALSE
                setVar $PLAYER~surroundPassive   FALSE
                setVar $PLAYER~surroundNormal    TRUE
	end
	

	if (($MAP~stardock = 0) OR ($MAP~stardock = ""))
		send "'{" $SWITCHBOARD~bot_name "} - Stardock is not defined.  Please define stardock variable in the bot.*"
		halt
	end
	if ($isFigged = "")
		send "'{" $SWITCHBOARD~bot_name "} - It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		halt
	end
	if ($isArmided = "")
		send "'{" $SWITCHBOARD~bot_name "} - It appears no armid data is available.  Run an armid grid checker that uses the sector parameter MINESEC. (Try armids command)*"
		halt
	end
	if ($isLimped = "")
		send "'{" $SWITCHBOARD~bot_name "} - It appears no limpet data is available.  Run a limpet grid checker that uses the sector parameter LIMPSEC. (Try limps command)*"
		halt
	end
	if ($alarm_active)
		send "'"&$SWITCHBOARD~bot_name&" online*"
	end
	gosub :PLAYER~quikstats
	if ($PLAYER~current_prompt <> "Citadel")
		send "'{" $SWITCHBOARD~bot_name "} - Must start gridder from citadel prompt.*"
		halt
	end
	if ($PHOTONS > 0)
		send "'{" $SWITCHBOARD~bot_name "} - You should not use a ship with photons to grid.*"
		halt
	end


killalltriggers
goSub :checkAvoidedSectors

:checkForTargets
	send "q"
	gosub :PLANET~getPlanetInfo
	send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*q"
	send "'{" $SWITCHBOARD~bot_name "} - Clearing messages for possible exit/enter later*"
	gosub :xenter
	gosub :xenter
	gosub :xenter
	gosub :landOnPlanetEnterCitadel
	setVar $limpetBefore $PLAYER~LIMPETS
	setVar $limpetAfter $limpetBefore
	setVar $armidBefore $PLAYER~ARMIDS
	setVar $armidAfter $armidBefore

	send "'{" $SWITCHBOARD~bot_name "} - M()M Surround Gridder Powering Up!*"
	waitFor "(?="
	window gridder 500 270 ("M()M Surround Gridder - " & GAMENAME) ONTOP
	setWindowContents gridder "      Starting up!*"

	setVar $homesec $PLAYER~CURRENT_SECTOR


:checkShip
	killAllTriggers
	gosub :PLAYER~quikstats
	gosub :SHIP~getShipStats
:restart
	send "q"
	gosub :PLANET~getPlanetInfo
	send "c "
	gosub :findAllTargetSectors
	gosub :assemble_mac
	gosub :assemble_return_mac
	gosub :assemble_attack_mac
	gosub :assemble_land_mac
:select_boomsec
	killAllTriggers
	send "#"
	gosub :PLAYER~quikstats
	if (($PLAYER~TWARP = "No") OR ($PLAYER~CURRENT_SECTOR <> $homesec))
			goto :callSaveMe
		end
	if ($PLAYER~FIGHTERS < $max_figs)
		echo ANSI_12 "*Not enough fighters to safely continue.*" ANSI_7
		halt
	end
	loadVar $alarm_list
	if (($alarm_active) AND ($alarm_list <> ""))
		loadVar $who_is_online
		lowercase $alarm_list
		lowercase $who_is_online
		getWordPos $alarm_list $pos ","
		if ($pos > 0)
			setArray $alarm 50
			setVar $count 0
			while ($pos > 0)
				add $count 1
				cutText $alarm_list $name 0 $pos 
				setVar $alarm[$count] $name
				cutText $alarm_list $alarm_list $pos+1 9999 
				getWordPos $alarm_list $pos ","
			end
			setVar $alarm $count

		else
			setArray $alarm 1
			setVar $alarm[1] $alarm_list
			setVar $alarm 1
		end
		setVar $i 1
		while ($i <= $alarm)
			getWordPos $who_is_online $pos " "&$alarm[$i]&" "
			if ($pos > 0)
				send "'Alarm triggered by "&$alarm[$i]&", contingency plan engaged.  Attempting to clean ship and move planet home.*"
				:shutdown
				gosub :attempt_refurb
				gosub :PLAYER~quikstats
				send "p "&$MAP~home_sector&"* y "
				gosub :PLAYER~quikstats
				send "'{" $SWITCHBOARD~bot_name "} - Scrubbed at dock and pwarped home..*"

				halt
			end
			add $i 1
		end
	end

	setVar $limpetAfter $PLAYER~LIMPETS
	setVar $armidAfter $PLAYER~ARMIDS

	if (($SHIP~SHIP_MINES_MAX > $PLAYER~surroundLimp) AND ($SHIP~SHIP_MINES_MAX > $PLAYER~surroundMine))
		if ((($PLAYER~LIMPETS < $PLAYER~surroundLimp) OR ($PLAYER~ARMIDS < $PLAYER~surroundMine)))
			if ($refurb)
				setWindowContents gridder "    Auto Refurbing.. *"
				gosub :attempt_refurb
			else
				echo ANSI_12 "*You must stock up on mines before continuing." ANSI_7
				halt
			end
			gosub :PLAYER~quikstats
			setVar $limpetBefore $PLAYER~LIMPETS
			setVar $limpetAfter $limpetBefore
			setVar $armidBefore $PLAYER~ARMIDS
			setVar $armidAfter $armidBefore
		end
	end
:continueOn
	getRnd $random 1 $databaseCount
	getWord $database $warpto $random
	gosub :update_box
	if ($warpto = 0)
		if ($restart)
			goto :restart
		else
			goto :shutdown
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
	killalltriggers
	setVar $PLAYER~CURRENT_SECTOR $warpto
	gosub :grid~surround
	send "m      " $homesec "* y   y    *  *  "
	send $land_mac
	getWordPos $PLAYER~surroundOutput $pos "planet"
	if ($pos > 0)
		setVar $SWITCHBOARD~message $PLAYER~surroundOutput 
		if ($SWITCHBOARD~self_command <> TRUE)
	        setVar $SWITCHBOARD~self_command 2
	    end
	    gosub :SWITCHBOARD~switchboard
	end
    gosub :update_box
	goto :select_boomsec

:update_box
	setWindowContents gridder "*      Targets left to hit:"&$databaseCount&"**"&$PLAYER~surroundOutput
return

#-=-=-=-=- Find All Target Sectors -=-=-=-=-=-
:findAllTargetSectors
	setVar $targetSectorCount 1
	setVar $databaseCount 0
	setVar $database ""
	setVar $adjacentDatabase ""

	echo ANSI_14 "* Loading target sectors..*" ANSI_7
	setVar $perc 0

		while ($targetSectorCount <= SECTORS)
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
					setVar $count 0
					while (SECTOR.WARPS[$targetSectorCount][$i] > 0)
						setVar $test_sector SECTOR.WARPS[$targetSectorCount][$i]
						getSectorParameter $test_sector "FIGSEC"  $isFigged
						if (($isFigged = "") OR ($isFigged = FALSE))
							add $count 1
						end
						add $i 1
					end

					
					if ($count >= $min_unfigged)
						setVar $isFound FALSE
						setVar $i 1
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
									setVar $isFound TRUE
									add $databaseCount 1
								end
							end
							add $i 1
						end
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
	send "'{" $SWITCHBOARD~bot_name "} - "&$databaseCount&" target sectors found.*"
	if ($databaseCount <= 0)
		send "'{" $SWITCHBOARD~bot_name "} - Visited every sector possible. Refresh fighters and update warp data to verify..*"
			gosub :attempt_refurb
			gosub :PLAYER~quikstats
			send "p "&$MAP~home_sector&"* y "
			gosub :PLAYER~quikstats
			send "'{" $SWITCHBOARD~bot_name "} - Scrubbed at dock and pwarped home..*"

		halt
	end
return


#-=-=-=-=-=- assemble macro -=-=-=-=-=-=-=-=-
:assemble_mac
        setVar $mac ""
	if ($gridExistingOnly)
		if ($PLAYER~surroundFigs > 0)
			setVar $mac "f " & $PLAYER~surroundFigs & "*cd"
		end
		if (($PLAYER~surroundMine > 0) AND ($PLAYER~ARMIDS > 0))
			setVar $mac $mac & "h1 z" & $PLAYER~surroundMine & "*zc*"
		end
		if (($PLAYER~surroundLimp > 0) AND ($PLAYER~LIMPETS > 0))
			setVar $mac $mac & "h2 z" & $PLAYER~surroundLimp & "*zc*"
		end
	else
		if ($PLAYER~surroundFigs > 0)
			setVar $mac "f " & $PLAYER~surroundFigs & "*cd"
		end
		if (($PLAYER~surroundMine > 0) AND ($PLAYER~ARMIDS > 0))
			setVar $mac $mac & "h1 z" & $PLAYER~surroundMine & "*zc*"
		end
		if (($PLAYER~surroundLimp > 0) AND ($PLAYER~LIMPETS > 0))
			setVar $mac $mac & "h2 z" & $PLAYER~surroundLimp & "*zc*"
		end
	end
return

:assemble_attack_mac
        setVar $attack_mac "* za" & $figs & "* jr * "
return

:assemble_return_mac
	setVar $return_mac $homesec & "* yy * * "
return

:assemble_land_mac
	setVar $land_mac "l j" & #8 & #8 & #8 & #8 & #8 & $PLANET~PLANET & "*  * j m  * * *  t * t 1* c * "
	#setVar $land_mac "l " & $PLANET~PLANET & "*  m  * * *  t * t 1*  c  "
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
	send "l " $PLANET~PLANET "* c"
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
	getCourse $course $PLAYER~CURRENT_SECTOR $destination
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
	setVar $limpetCashNeeded ((($SHIP~SHIP_MINES_MAX-$PLAYER~LIMPETS)*$LIMPET_COST)+$LIMPET_REMOVAL_COST)
	setVar $armidCashNeeded ((($SHIP~SHIP_MINES_MAX-$PLAYER~ARMIDS)*$ARMID_COST))
	setVar $cashNeeded ($limpetCashNeeded+$armidCashNeeded)
	setVar $furbing TRUE
	if ($cashNeeded > $PLAYER~CREDITS)
		send "D" 
		waitOn "Citadel treasury contains "
		getWord CURRENTLINE $citadelCash 4
		stripText $citadelCash ","
		if ($citadelCash < $cashNeeded)
			send "'{" & $SWITCHBOARD~bot_name & "} - Not enough cash for mine refurbs in treasury or on hand.*"	
			halt
		end
		send "t f "&($cashNeeded-$PLAYER~CREDITS)&"* "
	end
	# check adj's for Dock.. if present, then we don't need a jump sector.
	setVar $i 1
	setVar $START_SECTOR $PLAYER~CURRENT_SECTOR
	setVar $WeAreAdjDock FALSE
	while ($i <= SECTOR.WARPCOUNT[$START_SECTOR])
		setVar $adj_start SECTOR.WARPS[$START_SECTOR][$i]
		if ($adj_start = $MAP~stardock)
			setVar $WeAreAdjDock TRUE
		end
		add $i 1
	end

	if (($PLAYER~ALIGNMENT < 1000) AND ($WeAreAdjDock = FALSE))
		setVar $RED_adj 0
		gosub :FindJumpSector
		if ($RED_adj <> 0)
			send ("'{"&$SWITCHBOARD~bot_name&"} - Jump Sector Found - Using Sector "&$RED_adj&"**")
		else
			waitfor "Command [TL="
			send "'{" & $SWITCHBOARD~bot_name & "} - Cannot Find Jump Sector Adjacent Dock**"
			halt
		end
	end

	if ($PLAYER~ALIGNMENT >= 1000)
		if ($WeAreAdjDock)
			send "^F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
		else
			send "^F" & $START_SECTOR & "*" & $MAP~stardock & "*F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
		end
	else
		if ($WeAreAdjDock)
			send "^F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
		else
			send "^F" & $START_SECTOR & "*" & $RED_adj & "*F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
		end
	end
	setTextLineTrigger noJoy :noJoy "*** Error - No route within"
	setTextTrigger cont :cont "(?="
	pause

	:noJoy
		killAllTriggers
		send "'{" $SWITCHBOARD~bot_name "} - Cannot Find Path to StarDock!**"
		halt
	:cont
		killAllTriggers
		setDelayTrigger Latency_Delay		:Latency_Delay 500
		pause

		:Latency_Delay

		Echo "**" & ANSI_14 & "Please Stand By" & ANSI_15 & " - Calculating Distances...**"
		if (($PLAYER~ALIGNMENT >= 1000) OR ($WeAreAdjDock))
			getdistance $dist1 $START_SECTOR $MAP~stardock
		else
			getdistance $dist1 $START_SECTOR $RED_adj
		end

		if ($dist1 <= 0)
			send "'{" $SWITCHBOARD~bot_name "} " & $TagLineB & " - Insufficient Warp Data Plotting Course to Dock**"
			halt
		end

		getdistance $dist2 $MAP~stardock $START_SECTOR
		if ($dist2 <= 0)
			send "'{" $SWITCHBOARD~bot_name "} " & $TagLineB & " - Insufficient Warp Data Plotting Return Course From Dock**"
			halt
		end

		setVar $ore_req (($dist1 + $dist2) * 3)

		if ($PLAYER~ORE_HOLDS < $ore_req)
			send "'{" $SWITCHBOARD~bot_name "} - Not Enough ORE In Holds To Make Round Trip**"
			halt
		end

		if ($PLAYER~TWARP_TYPE = "No")
			send "'{" $SWITCHBOARD~bot_name "} - Must Have Twarp 1 or 2**"
			halt
		end

		if ($PLAYER~unlimitedGame = 0)
			gosub :TurnsRequired
			if ($PLAYER~TURNSRequired > $PLAYER~TURNS)
				send "'{" $SWITCHBOARD~bot_name "} - Not Enough Turns. " & ANSI_12 & $PLAYER~TURNSRequired & ANSI_15 & ", Required**"
				halt
			elseif ($PLAYER~TURNSRequired <= $PLAYER~TURNS)
				setVar $tmp ($PLAYER~TURNS - $PLAYER~TURNSRequired)
				if ($tmp <= $bot_turn_limit)
					send "'{" $SWITCHBOARD~bot_name "} - Proceeding Will Leave Fewer Than " & $bot_turn_limit & " Turns!**"
					halt
				end
			end
		end

	send " C R " & $MAP~stardock & "*Q "
	setTextLineTrigger itsalive :itsalive "Items     Status  Trading % of max OnBoard"
	setTextLineTrigger nosoupforme :nosoupforme "I have no information about a port in that sector"
	pause
	:nosoupforme
		killAllTriggers
		send "'{" $SWITCHBOARD~bot_name "} " & $TagLineB & " - StarDock appears to have been Blown Up!**"
		halt
	:itsalive
		killAllTriggers
		waitfor "(?="
		setVar $msg ""
		if (($PLAYER~ALIGNMENT >= 1000) AND ($WeAreAdjDock = FALSE))
			setVar $warpto $MAP~stardock
			gosub :DoTwarp
		elseif (($WeAreAdjDock = FALSE) AND ($RED_adj <> 0))
			setVar $warpto $RED_adj
			gosub :DoTwarp
		else
			send " m " & $MAP~stardock & "*  *  P  S G Y G Q "
		end
		if ($msg = "")
			waitfor "You leave the Galactic Bank."
		else
			send "'{" $SWITCHBOARD~bot_name "} - Unknown Problem Detected. Check TA!**"
			halt
		end
		gosub :PLAYER~quikstats

		setVar $_Limps "Max"
		setVar $_Mines "Max"
		gosub :DoPurchases
		send "Q Q Q Q Z N M " & $START_SECTOR & "* Y  Y  Y  * L Z" & #8 & $PLANET~PLANET & "* p  s  s * * c *"
		gosub :PLAYER~quikstats
		if ($PLAYER~CURRENT_SECTOR = $MAP~stardock)
			send "'{" $SWITCHBOARD~bot_name "} - Twarp Error, Should be Hiding on Dock!**"
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
			send "l " & #8 & $PLANET~PLANET "*c"
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
			if ($PLAYER~ALIGNMENT >= 1000)
				if ($furbing)
					setVar $str "y * * p s g y g q " 
				else
					setVar $str "y * *  " 
				end
				send $str
			else
				if ($furbing)
					setVar $str "y  *  *  m " & $MAP~stardock & " *  *  p s g y g q "
				else
					setVar $str "y * *  " 
				end
				send $str
			end
		:twarpDone
			if ($msg <> "")
				send "'{" $SWITCHBOARD~bot_name "} Twarp Error - " & $msg & "**"
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
	while (SECTOR.WARPSIN[$MAP~stardock][$i] > 0)
		setVar $RED_adj SECTOR.WARPSIN[$MAP~stardock][$i]
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
	getWord CURRENTLINE $PLAYER~TURNSRequired_TPW 5

	if ($RED_adj > 0)
		# twarp to jmp sector, then into SD sect, then twarp home
		setVar $PLAYER~TURNSRequired_temp ($PLAYER~TURNSRequired_TPW * 3)
		if ($_Tow > 0)
			# 2 Turns for exporting into other ship and back again
			add $PLAYER~TURNSRequired_temp 2
			# 3 Turns for initial Port then x into other ship, port & shop, then x and report
			#   b4 heading home
			add $PLAYER~TURNSRequired_temp 3
		else
			add $PLAYER~TURNSRequired_temp 1
		end
	else
		setVar $PLAYER~TURNSRequired_temp ($PLAYER~TURNSRequired_TPW * 2)
		# 1 Turn to port at dock
		add $PLAYER~TURNSRequired_temp 1
	end

	setVar $PLAYER~TURNSRequired $PLAYER~TURNSRequired_temp
	return


:callSaveMe
	send "q q q q * '"&$SWITCHBOARD~bot_name&" call*"
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

#INCLUDES:
include "source\bot_includes\switchboard"
include "source\bot_includes\player"
include "source\bot_includes\map"
include "source\bot_includes\player\quikstats"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\grid"
