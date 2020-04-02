	logging off
	reqRecording
	gosub :BOT~loadVars
	

:load_script
	loadVar $avoidedSectorsUgrid
	loadVar $PLAYER~unlimitedGame
	loadVar $bot_turn_limit
	loadVar $MAP~stardock
	loadVar $MAP~home_sector
	loadVar $MAP~backdoor
	loadvar $game~LIMPET_COST
	loadvar $game~ARMID_COST
	loadVar $game~LIMPET_REMOVAL_COST
	loadvar $bot~password
	loadVar $bot~alarm_list
	setVar $PLAYER~surroundLimp 3
	setVar $PLAYER~surroundMine 3
	setVar $refurb TRUE
	setVar $imlimped FALSE
	setArray $move SECTORS
	setVar $checkedForInfo ""
	setVar $PLAYER~surroundFigs 1
	setVar $attackretreat FALSE
	
	
	getSectorParameter SECTORS "FIGSEC" $isFigged
	getSectorParameter SECTORS "MINESEC" $isArmided
	getSectorParameter SECTORS "LIMPSEC" $isLimped


	setVar $BOT~help[1]  $BOT~tab&"- sgrid {figs} {armids} {limpets} {min_unfigged} {safety} {planets} {warp} {norefurb}" 
	setVar $BOT~help[2]  $BOT~tab&"  Surround gridder. Visits all targeted sectors and surrounds     " 
	setVar $BOT~help[3]  $BOT~tab&"  them before twarping back.                                      " 
	setVar $BOT~help[4]  $BOT~tab&"   - [figs]        = Number of fighters to drop                   " 
	setVar $BOT~help[5]  $BOT~tab&"                         - Default: 1                             " 
	setVar $BOT~help[6]  $BOT~tab&"   - [armids]      = Number of armid mines to drop                " 
	setVar $BOT~help[7]  $BOT~tab&"                         - Default: 3                             " 
	setVar $BOT~help[8]  $BOT~tab&"   - [limps]       = Number of limpet mines to drop               " 
	setVar $BOT~help[9]  $BOT~tab&"                         - Default: 3                             " 
	setVar $BOT~help[10] $BOT~tab&"   - [min_unfigged]= Minimum unfigged sectors needed to surround  " 
	setVar $BOT~help[11] $BOT~tab&"                         - Default: 3                             " 
	setVar $BOT~help[12] $BOT~tab&"   - [safety]      = 'ultra', 'safe', and 'none'                  " 
	setVar $BOT~help[13] $BOT~tab&"              none = Will surround all figged sectors             " 
	setVar $BOT~help[14] $BOT~tab&"              safe = Will surround sectors that have corp limps   " 
	setVar $BOT~help[15] $BOT~tab&"             ultra = Like safe, but needs friendly armids too     " 
	setVar $BOT~help[16] $BOT~tab&"                         - Default: none                          " 
	setVar $BOT~help[17] $BOT~tab&"   - [planets]     = 'all', 'shielded'                            " 
	setVar $BOT~help[18] $BOT~tab&"               all = Avoid all planets in target sectors          " 
	setVar $BOT~help[19] $BOT~tab&"          shielded = Avoid only shielded planets in target sectors" 
	setVar $BOT~help[20] $BOT~tab&"                         - Default: all                           " 
	setVar $BOT~help[21] $BOT~tab&"   - [warp]        = 'twarp' or 'bwarp'                           " 
	setVar $BOT~help[22] $BOT~tab&"                         - Default: twarp                         " 
	setVar $BOT~help[23] $BOT~tab&"   - [norefurb]    = Turns off auto refurbing of mines at Stardock" 
	setVar $BOT~help[24] $BOT~tab&"   - [restart]     = Automatically restarts gridding when finished" 
	gosub :bot~helpfile

	getWord $bot~user_command_line $bot~parm1 1 "EMPTY"
	getWord $bot~user_command_line $bot~parm2 2 "EMPTY"
	getWord $bot~user_command_line $bot~parm3 3 "EMPTY"
	getWord $bot~user_command_line $bot~parm4 4 "EMPTY"
	isNumber $test $bot~parm1
	if ($test)
		setVar $PLAYER~surroundFigs $bot~parm1
	else
		setVar $PLAYER~surroundFigs 1
	end
	isNumber $test $bot~parm2
	if ($test)
		setVar $PLAYER~surroundMine $bot~parm2
	else
		setVar $PLAYER~surroundMine 3
	end
	isNumber $test $bot~parm3
	if ($test)
		setVar $PLAYER~surroundLimp $bot~parm3
	else
		setVar $PLAYER~surroundLimp 3
	end
	isNumber $test $bot~parm4
	if ($test)
		setVar $min_unfigged $bot~parm4
	else
		setVar $min_unfigged 4
	end
	
	getWordPos $bot~user_command_line $pos "avoid" 
	if ($pos > 0)
		setVar $grid_avoid TRUE
	else
		setVar $grid_avoid FALSE
	end
	getWordPos $bot~user_command_line $pos "alarm" 
	if ($pos > 0)
		setVar $alarm_active TRUE
	else
		setVar $alarm_active FALSE
	end
	getWordPos $bot~user_command_line $pos "norefurb" 
	if ($pos > 0)
		setVar $refurb FALSE
	else
		setVar $refurb TRUE
	end
	getWordPos $bot~user_command_line $pos "restart" 
	if ($pos > 0)
		setVar $restart TRUE
	else
		setVar $restart FALSE
	end
	getWordPos $bot~user_command_line $pos "bwarp" 
	if ($pos > 0)
		setVar $grid_warp "bwarp"
	else
		setVar $grid_warp "twarp"
	end	
	getWordPos $bot~user_command_line $pos "shield" 
	if ($pos > 0)
		setVar $PLAYER~surroundAvoidShieldedOnly TRUE
		setVar $PLAYER~surroundAvoidAllPlanets FALSE
	else
		setVar $PLAYER~surroundAvoidAllPlanets TRUE
		setVar $PLAYER~surroundAvoidShieldedOnly FALSE
	end
	
	getWordPos $bot~user_command_line $pos "clear" 
	if ($pos > 0)
		setVar $avoidedSectorsUgrid ""
	end
	
			setVar $ultraSafeLimpet FALSE
			setVar $ultraSafeArmid FALSE
	
	getWordPos $bot~user_command_line $pos "passive" 
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
	if ($alarm_active)
		send "'"&$SWITCHBOARD~bot_name&" online*"
	end
	gosub :PLAYER~quikstats
	if ($PLAYER~current_prompt <> "Citadel")
		setvar $switchboard~message "Must start gridder from citadel prompt.*"
		gosub :switchboard~switchboard
		halt
	end
	if ($player~photons > 0)
		setvar $switchboard~message "You should not use a ship with photons to grid.*"
		gosub :switchboard~switchboard
		halt
	end


killalltriggers
goSub :checkAvoidedSectors

:checkForTargets
	send "q"
	gosub :PLANET~getPlanetInfo
	send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*q"
	setvar $switchboard~message "Clearing messages for possible exit/enter later*"
	gosub :switchboard~switchboard
	gosub :xenter
	gosub :xenter
	gosub :xenter
	gosub :landOnPlanetEnterCitadel
	setVar $limpetBefore $PLAYER~LIMPETS
	setVar $limpetAfter $limpetBefore
	setVar $armidBefore $PLAYER~ARMIDS
	setVar $armidAfter $armidBefore

	setvar $switchboard~message "M()M Surround Gridder Powering Up!*"
	gosub :switchboard~switchboard

	window gridder 500 270 ("M()M Surround Gridder - " & GAMENAME) ONTOP
	setvar $window_content "      Starting up!*"
	gosub :setwindow
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
				setvar $switchboard~message "Scrubbed at dock and pwarped home..*"
				gosub :switchboard~switchboard

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
				setvar $window_content "    Auto Refurbing.. *"
				gosub :setwindow
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
	getWord $database $player~warpto $random
	gosub :update_box
	if ($player~warpto = 0)
		if ($restart)
			goto :restart
		else
			goto :shutdown
		end
	end

:clearit
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


:hittingsec
	killalltriggers
	setVar $PLAYER~CURRENT_SECTOR $player~warpto
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
	setvar $window_content "*      Targets left to hit:"&$databaseCount&"**"&$PLAYER~surroundOutput
	gosub :setwindow
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
	setvar $switchboard~message ""&$databaseCount&" target sectors found.*"
	gosub :switchboard~switchboard
	if ($databaseCount <= 0)
		setvar $switchboard~message "Visited every sector possible. Refresh fighters and update warp data to verify..*"
		gosub :switchboard~switchboard
			gosub :attempt_refurb
			gosub :PLAYER~quikstats
			send "p "&$MAP~home_sector&"* y "
			gosub :PLAYER~quikstats
			setvar $switchboard~message "Scrubbed at dock and pwarped home..*"
			gosub :switchboard~switchboard

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
	setTextTrigger cont :cont "(?="
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

	send " C R " & $map~stardock & "*Q "
	setTextLineTrigger itsalive :itsalive "Items     Status  Trading % of max OnBoard"
	setTextLineTrigger nosoupforme :nosoupforme "I have no information about a port in that sector"
	pause
	:nosoupforme
		killAllTriggers
		send "'{" $bot~bot_name "} " & $TagLineB & " - StarDock appears to have been Blown Up!**"
		halt
	:itsalive
		killAllTriggers
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



:TurnsRequired
	send "i"
	setTextLineTrigger TurnsRequired_TPW	:TurnsRequired_TPW "Turns to Warp  : "
	pause

	:TurnsRequired_TPW
	killAllTriggers
	getWord CURRENTLINE $PLAYER~TURNSRequired_TPW 5

	if ($player~RED_adj > 0)
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

:setwindow
	setWindowContents gridder $window_content
	replacetext $window_content "*" "[][]"
	savevar $window_content
return
#INCLUDES:
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\grid\surround\grid"
include "source\bot_includes\player\findjumpsector\player"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\loadvars\bot"

