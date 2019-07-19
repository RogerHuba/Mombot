	reqRecording
	logging off
	gosub :BOT~loadVars
	setVar $BOT~command "wander"
	loadVar $BOT~bot_turn_limit
	loadVar $MAP~stardock
	loadvar $bot~subspace

	setVar $BOT~help[1]   $BOT~tab&"wander {file | sector param} {share}"
	setVar $BOT~help[2]   $BOT~tab&"     Warps around the universe, attempting to be turn efficient."
	setVar $BOT~help[3]   $BOT~tab&"     Turn efficiency goes away when it's an unlimited turn game."
	setVar $BOT~help[4]   $BOT~tab&"     Requires twarp.                "
	setVar $BOT~help[5]   $BOT~tab&"                     "
	setVar $BOT~help[6]   $BOT~tab&"             file - path to target file"
	setVar $BOT~help[7]   $BOT~tab&"     sector param - Will target sectors marked with sector param. "
	setVar $BOT~help[8]   $BOT~tab&"                     "
	setVar $BOT~help[9]   $BOT~tab&"                    Using UNFIGGED as param will target all sectors "
	setVar $BOT~help[10]  $BOT~tab&"                    where FIGSEC is not true. "
	setVar $BOT~help[11]  $BOT~tab&"          {share} - reports figged sectors over subspace"
	
	gosub :bot~helpfile

	setVar $BOT~script_title "Wanderer"
	gosub :BOT~banner

	setVar $PLAYER~save TRUE


	gosub :PLAYER~quikstats
	gosub :player~getInfo

	getSectorParameter SECTORS "FIGSEC" $isFigged

	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Citadel") and ($startingLocation <> "Planet") and ($startingLocation <> "Command"))
		setVar $SWITCHBOARD~message "Wanderer must be started from command, planet, or citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
	end
	if ($startingLocation = "Citadel")
		send "q "
	end
	if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
		send "m*** t*l2*t*l3*s*l1*s*l2*s*l3*t*t1* q q * * "
	end

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
	getWord CURRENTLINE $maxFigAttack 5
	multiply $offodd $maxFigAttack
	divide $offodd 12
	gosub :PLAYER~quikstats

	setvar $total_turns 0
	setvar $total_gridded 0
	setvar $archived ""

	if (($PLAYER~ORE_HOLDS < $PLAYER~TOTAL_HOLDS) AND ($player~ore_holds < 100))
		setVar $SWITCHBOARD~message "You need to fill all your holds with fuel. This is going to be a long drive.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($PLAYER~$TWARP_TYPE = "No")
		setVar $SWITCHBOARD~message "You really should use a twarp capable ship for wandering.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if (($MAP~stardock = 0) OR ($MAP~stardock = ""))
		setVar $SWITCHBOARD~message "Stardock is not defined.  Please define stardock variable in the bot.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($isFigged = "")
		setVar $SWITCHBOARD~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($player~PHOTONS > 0)
		setVar $SWITCHBOARD~message "Can not run with photons on your ship.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	getwordpos " "&$bot~user_command_line&" " $pos " share "
	if ($pos > 0)
		setvar $share true
	else
		setvar $share false
	end

	getWord $bot~user_command_line $bot~parm1 1 "EMPTY"
	if (($bot~parm1 = "auto") OR ($bot~parm1 = "EMPTY"))
	
	else
		setVar $gridTargets TRUE
		setVar $target $bot~parm1
		uppercase $target
		fileexists $test $target
		if ($test = FALSE)
			setvar $i 1
			setvar $targetSectors 0 
			setarray $targetSectors SECTORS
			if ($target = "UNFIGGED")
				setvar $unfigged true
				setvar $target "FIGSEC"
			end
			while ($i <= SECTORS) 
				getSectorParameter $i $target $isTarget
				if ($unfigged = true)
					if ($isTarget <> true)
						add $targetSectors 1
						setvar $targetSectors[$targetSectors] $i
					end
				else
					if ($isTarget = true)
						add $targetSectors 1
						setvar $targetSectors[$targetSectors] $i
					end 
				end
				add $i 1
			end
			if ($targetSectors <= 0)
				setVar $SWITCHBOARD~message " Grid target file or sector parameter: ["&$target&"] does not exist, shutting down..*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		else
			readToArray $target $targetSectors
		end
	end

	gosub :findAllTargetSectors

	while (true)
		setVar $tried_paths " "
		:try_again
			setVar $tried 0
			setvar $loop_limit 100
			setvar $loop 0
		:get_new_random_path
			replaceText $database "  " " "
			getRnd $random 1 $databaseCount
			getWord $database $destination $random
			getWordPos $tried_paths $pos " "&$destination&" "
			if (($destination <> 0) AND ($pos > 0))
				add $loop 1
				if ($loop > $loop_limit)
					goto :stop_gridder
				end
				goto :get_new_random_path
			end
		setvar $stripped_database $database
		replaceText $stripped_database " " ""
		if (($destination = 0) and ($stripped_database <> ""))
			goto :get_new_random_path
		end
		if ($gridtargets = true)
			#if gridding targets, check to see if someone already gridded the target
			if ($destination <> "0")
				getSectorParameter $destination "FIGSEC" $isFigged
				if ($isFigged = true)
					setVar $temp " "&$destination&" "
					replaceText $database $temp " "
					subtract $databasecount 1	
					goto :get_new_random_path
				end
			end
		end
		if (($stripped_database = "") or ($destination = "0"))
			if ($gridTargets = true)
				gosub :findAllTargetSectors
			else
				:stop_gridder 
				setVar $SWITCHBOARD~message " Database Cleared - Wandered everywhere I could go...*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		else
			:try_to_skip_ahead
			gosub :getCourses
			if ($valid)
				setVar $j 3
				setVar $closestFiggedSector 0	
				while ($j <= $courseLength)
					getSectorParameter $COURSE[$j] "FIGSEC" $isFigged
					if (($COURSE[$j] <= 10) OR ($COURSE[$j] = $map~stardock))
						setvar $isFigged TRUE
					end
					if ($isFigged = TRUE)
						setVar $closestFiggedSector $COURSE[$j]
						setVar $index $j
						if ($j = $courseLength)
							setVar $PLAYER~warpto $closestFiggedSector
							gosub :player~twarp
							gosub  :player~currentPrompt
							if ($PLAYER~twarpSuccess = TRUE)
								setVar $j $index
								add $total_turns $player~turns_per_warp
							else
								setSectorParameter $closestFiggedSector "FIGSEC" FALSE
								setVar $j 3
							end
							goto :mowfromhere
						end
					else
						if ($j = 3)
							goto :mowfromhere
						end
						if ($closestFiggedSector > 0)
							setVar $PLAYER~warpto $closestFiggedSector
							gosub :player~twarp
							gosub  :player~currentPrompt
							if ($PLAYER~twarpSuccess = TRUE)
								setVar $j ($index + 1)
								add $total_turns $player~turns_per_warp
								setvar $twarp_from $player~current_sector
								setvar $twarp_to $closestFiggedSector
								gosub :window
							else
								setSectorParameter $closestFiggedSector "FIGSEC" FALSE
								setVar $j 3
							end
							goto :mowfromhere
						end
					end
					add $j 1	
				end
				setVar $j 3
				:mowfromhere
				setvar $figged_sectors " "
				while ($j <= $courseLength)
					getSectorParameter $COURSE[$j] "FIGSEC" $isFigged
					if (($isFigged = TRUE) AND (($tried <= 5) OR ($player~ore_holds > 100)))
						add $tried 1
						if ($share = true) and ($figged_sectors <> " ")
							send "'<"&$bot~subspace&">[Figged:"&$figged_sectors&"]<"&$bot~subspace&">* "
						end
						goto :try_to_skip_ahead
					end
					send "za"&$maxFigAttack&"* z * "
					send "s*"
					waitFor "Relative Density Scan"
					waitFor "Command ["
					if ((SECTOR.DENSITY[$course[$j]] >= 505) and (($player~unlimitedgame <> true) or (($PLAYER~unlimitedGame = TRUE) and (sector.explored[$course[$j]] <> "YES"))))
						send "szh*  "
						waitFor "Long Range Scan"						
						add $total_turns 1
					end
					if ((SECTOR.PLANETCOUNT[$COURSE[$j]] > 0) and ($course[$j] > 10) and ($course[$j] <> $map~stardock))
						setVar $SWITCHBOARD~message "Planet in my path in sector "&$COURSE[$j]&".  Wandering somewhere else..*"
						gosub :SWITCHBOARD~switchboard
						send "cv"&$COURSE[$j]&"*q"
						waiton "will now be avoided in future navigation calculation"
						goto :abort
					end
					if (SECTOR.FIGS.QUANTITY[$COURSE[$j]] >= ($offodd*2))
						setVar $SWITCHBOARD~message "Too many fighters for me to take on in sector "&$COURSE[$j]&". Wandering somewhere else..*"
						gosub :SWITCHBOARD~switchboard
						send "cv"&$COURSE[$j]&"*q"
						waiton "will now be avoided in future navigation calculation"
						goto :abort
					end
					setVar $result "m  "&$COURSE[$j]&"* "
					setVar $figsToDrop 1
					add $total_turns $player~turns_per_warp
					if (($COURSE[$j] > 10) AND ($COURSE[$j] <> $MAP~STARDOCK))
						setVar $result $result&"za"&$maxFigAttack&"* z * "	
					end
					if (($COURSE[$j] > 10) AND ($COURSE[$j] <> $MAP~STARDOCK) AND ($j > 2))
						setVar $result $result&"f "&$figsToDrop&"* c d *"
						getSectorParameter $COURSE[$j] "FIGSEC" $isFigged
						if ($isfigged <> true)
							add $total_gridded 1
							setSectorParameter $COURSE[$j] "FIGSEC" TRUE
							setvar $figged_sectors $figged_sectors&" "&$course[$j]&" "

							gosub :window
						end
						setVar $temp " "&$COURSE[$j]&" "
						getWordPos $database $pos $temp
						if ($pos > 0)
							replaceText $database $temp " "
							subtract $databasecount 1	
						end
					end
					setVar $result $result&"**   "
					send $result
					send "s*"
					waitFor "Relative Density Scan"
					gosub :PLAYER~quikstats
					if ($PLAYER~unlimitedGame <> TRUE)
						if ($PLAYER~turns <= $bot~bot_turn_limit)
							setVar $SWITCHBOARD~message "Reached the bot's turn limit.  Stopping my wandering for now.*"
							gosub :SWITCHBOARD~switchboard
							setvar $switchboard~message "Total sectors gridded: "&$total_gridded&"   Total turns used: "&$total_turns&"*"
							gosub :SWITCHBOARD~switchboard
							gosub :window
							halt
						end
					end
					if ($PLAYER~$TWARP_TYPE = "No")
						goto :callSaveMe
					end
					if (($PLAYER~TOTAL_HOLDS <> $PLAYER~ORE_HOLDS) AND (($player~ore_holds < 100) OR ($player~unlimited_game = TRUE)) AND ((PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = TRUE) AND (PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = FALSE) AND (PORT.CLASS[$PLAYER~CURRENT_SECTOR] > 0) AND (PORT.CLASS[$PLAYER~CURRENT_SECTOR] < 9)))
						send "pt****   "
						add $total_turns 1
						gosub :PLAYER~quikstats
					end
					setVar $i 1
					setVar $holo FALSE
					while (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$i] > 0)
						if (SECTOR.DENSITY[SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$i]] >= 505)
							setVar $holo TRUE
						end
						add $i 1
					end
					if ($holo = TRUE)
						send "szh*  "
						waitFor "Long Range Scan"
						add $total_turns 1
					end
					add $j 1	
				end
			else

				setvar $tried_paths $tried_paths&" "&$destination&" "
				goto :try_again
			end
			:abort
			if ($share = true) and ($figged_sectors <> " ")
				send "'<"&$bot~subspace&">[Figged:"&$figged_sectors&"]<"&$bot~subspace&">* "
			end
			setVar $temp " "&$destination&" "
			replaceText $database $temp " "
			subtract $databasecount 1	
		end
	end

	halt





:findAllTargetSectors
	setVar $targetSectorCount 11
	setVar $databaseCount 0
	setVar $database ""
	setVar $adjacentDatabase ""

	echo ANSI_14 "* Loading target sectors..*" ANSI_7
	setVar $perc 0
	if ($gridTargets)
		setVar $m 1
		while ($m <= $targetSectors)
			setVar $destination $targetSectors[$m]
			getSectorParameter $destination "FIGSEC"  $isFigged
			if ($isFigged = "")
				setVar $isFigged FALSE
			end
			#gosub :getCourses

			stripText $destination " "
			if (($isFigged <= 0) and ($destination > 10) and ($destination <> $map~stardock))
				setVar $database $database&" "&$destination&" "
				setVar $isFound TRUE
				add $databaseCount 1
			end
			setVar $percTest (($m * 100) / $targetSectors)
			if ($percTest > $perc)
				setVar $perc (($m * 100) / $targetSectors)
				echo "*"
				echo #27 "["&($perc / 2)&"C"
				echo ANSI_14 "°" ANSI_15 " " $perc "%" #27 & "[1A   "
			end
			add $m 1
		end

	else
		while ($targetSectorCount <= SECTORS)
			getSectorParameter $targetSectorCount "FIGSEC"  $isFigged
			if ($isFigged = "")
				setVar $isFigged FALSE
			end
			if (($isFigged <= 0) AND ($targetSectorCount <> $MAP~stardock))
				setVar $database $database&" "&$targetSectorCount&" "
				setVar $isFound TRUE
				add $databaseCount 1
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
	setVar $SWITCHBOARD~message " "&$databaseCount&" target sectors without fighters found.*"
	gosub :SWITCHBOARD~switchboard
	if ($databaseCount <= 0)
		setVar $SWITCHBOARD~message " Wandered everywhere I could go... Refresh fighters and update warp data to verify..*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
return

:callSaveMe
	send "'"&CURRENTSECTOR&"=saveme*q q q q * '"&$bot_name&" call*"
halt

:getCourses
	killalltriggers
	setArray $COURSE 80
	setVar $courseLength 0
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
	setVar $courseFighters 0
	setVar $index 1
	setVar $valid FALSE
	setvar $course_print ""
	:keepGoing
	getWord $sectors $COURSE[$index] $index
	while ($COURSE[$index] <> ":::")
		add $courseLength 1
		add $index 1
		getWord $sectors $COURSE[$index] $index

		if ($COURSE[$index] <> ":::")
			getSectorParameter $COURSE[$index] "FIGSEC"  $isFigged
			if ($isFigged) 
				setvar $course_print $course_print&" ["&$course[$index]&"]"			
				add $courseFighters 1
			else
				if (($COURSE[$index] <= 10) OR ($COURSE[$index] = $map~stardock))
					setvar $course_print $course_print&" <"&$course[$index]&">"
					add $courseFighters 1
				else
					setvar $course_print $course_print&" "&$course[$index]
				end
			end
			setVar $valid TRUE
		end
	end
						
:noPath
	killAllTriggers

	if (($gridTargets <> TRUE) AND ($PLAYER~unlimitedGame <> TRUE) AND ($tried <= 0))
		if (($courseLength <= 10) AND (($courseLength - $courseFighters) <= 0)) OR (($courseLength > 10) AND ($player~fuel_ore < 150) AND (($courseLength - $courseFighters) <= 3))
			setVar $valid FALSE
		end
	end
	if (($valid = TRUE) AND ($tried <= 0))
		setVar $window_content $course_print&"[][]Total turns: "&$total_turns&"[][]Total gridded: "&$total_gridded&"[][]"
		savevar $window_content
	end
return


:window
	setVar $c 2
	setvar $course_print ""
	while ($c <= $courseLength)
		getSectorParameter $COURSE[$c] "FIGSEC"  $isFigged
		if ($isFigged) 
			if ($twarp_to = $course[$c])
				setvar $course_print $course_print&" ->["&$course[$c]&"]<-"
			else
				if ($twarp_from = $course[$c])
					setvar $course_print $course_print&" ["&$course[$c]&"]-->"	
				else
					setvar $course_print $course_print&" ["&$course[$c]&"]"	
				end
			end		
		else
			setvar $course_print $course_print&" "&$course[$c]
		end	
		add $c 1
	end
	setVar $window_content $course_print&"[][]Total turns: "&$total_turns&"[][]Total gridded: "&$total_gridded&"[][]"
	savevar $window_content
return

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\currentprompt\player"
