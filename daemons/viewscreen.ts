systemscript
	gosub :BOT~loadVars
	loadVar $MAP~home_sector
	setVar $BOT~help[1] $BOT~tab&"Information screen for self use only.  "
	gosub :bot~helpfile
	setVar $BOT~command "viewscreen"

	setVar $BOT~script_title "Viewscreen"
	gosub :BOT~banner

	setvar $version "2.0.1 12/09/05"
:setup
gosub :getTime
loadvar $MH_LoginName
if ($MH_LoginName = 0) OR ($MH_LoginName = "")
	if (LOGINNAME = "")
		setvar $MH_LoginName "ME"
	else
		setvar $MH_LoginName LOGINNAME
		savevar $MH_LoginName
	end
end
loadvar $bot~folder
setvar $startDate $year & $month & $day
setvar $logFileName $bot~folder&"/"&$year & $month & $day & ".comms"



setvar $count 1
setvar $comstring ""
setVar $comsize 1000
setVar $figsize 5
setvar $comm_line_length 70
setVar $comm_window_size 10
setVar $comm_window_start_index 1
setArray $coms $comsize
setArray $figs $figsize
setArray $stats 26
setVar $isOdd FALSE
setVar $window_content ""
saveVar $window_content
setVar $old_output ""

if ($logFileName <> "")
	fileExists $exists $logFileName
	if ($exists)
		readToArray $logFileName $chatlog
		setVar $i ($comsize-1)
		setVar $index $chatlog
		while (($i >= 1) AND ($index >= 1))
			setVar $line $chatlog[$index]
			getlength $line $length
			if ($length > 15)
				cuttext $line $line 14 9999
				getlength $line $length
				setVar $line_length $comm_line_length
				if ($length > $comm_line_length)
					cuttext $line $line1 1 $line_length
					cuttext $line $line2 ($line_length+1) ($line_length*2)
					subtract $i 1
					setvar $line $line1
					getlength $line $length
					setVar $ignore TRUE
					gosub :formatLine
					setVar $coms[($comsize-$i)] $line
					if ($line2 <> "")
						if ($i >= 1)
							setVar $line "+         "&$line2
							getlength $line $length
							setVar $ignore TRUE
							gosub :formatLine
							setVar $coms[($comsize-$i+1)] $line
						end
					end
				else
					setVar $ignore TRUE
					getlength $line $length
					gosub :formatLine
					setVar $coms[($comsize-$i)] $line
				end
			end
			subtract $i 1
			subtract $index 1
		end
	end
end
setArray $chatlog 1

#setVar $i $comsize
#while ($i > 0)
#    setvar $coms[$i][1] 1
#    subtract $i 1
#end
# ======================     START PREFERENCES MENU SUBROUTINE    ==========================
:chatMenu
setVar $BOT~botIsDeaf FALSE
saveVar $BOT~botIsDeaf
gosub :buildComString

setvar $i 1
while ($i <= $figsize)
	setVar $figs[$i] ""
	add $i 1
end
:start
getDeafClients $BOT~botIsDeaf
if ($BOT~botIsDeaf = true)
	gosub :refreshChatMenu
end
:start_no_refresh
setvar $comtype ""
gosub :killchattriggers
settextlinetrigger lookForP :lookForCom "P "
settextlinetrigger lookForR :lookForCom "R "
settextlinetrigger lookForF :lookForCom "F "
settextlinetrigger lookForSelfR :lookForCom "'"
settextlinetrigger lookForSelfF :lookForCom "`"
settextlinetrigger lookForSelfMul :lookForCom "S: "
settextlinetrigger figHit :figHitProcess "of your fighters in sector"
settextlinetrigger offFigHit :figHitProcess "Your fighters in sector"
#settextlinetrigger entered :figHitProcess "Deployed Fighters Report Sector"

setdelaytrigger    silentdelay :checksilent 900000
#setTextLineTrigger enter :enterProcess "Deployed Fighters Report Sector "
#settextlinetrigger limpet :limpetProcess "Limpet mine in "

getDeafClients $BOT~botIsDeaf
if ($BOT~botIsDeaf = true)
	setDelayTrigger delay :refresh 500 
end
setTextOutTrigger open :process_command "_"
getDeafClients $BOT~botIsDeaf
if ($BOT~botIsDeaf = true)
	setTextOutTrigger talk2 :process_down "d"
	setTextOutTrigger talk3 :process_down "D"
	setTextOutTrigger talk4 :process_up "u"
	setTextOutTrigger talk5 :process_up "U"
	settextouttrigger ignore :process_ss "'"
	settextouttrigger ignore2 :process_fed "`"

	setTextOutTrigger talk7 :toggle_mute_me "+"
	setTextOutTrigger talk6 :start_no_refresh ""
end
pause


:process_ss
	processOut "'"
	settextouttrigger ignore :process_ss "'"
	pause

:process_fed
	processOut "`"
	settextouttrigger ignore2 :process_fed "`"
	pause
:process_up
	gosub :killchattriggers
	getDeafClients $BOT~botIsDeaf
	if ($BOT~botIsDeaf)
		if ($comm_window_start_index < ($comsize-$comm_window_size))
			add $comm_window_start_index $comm_window_size
			if ($comm_window_start_index > ($comsize-$comm_window_size))
				setVar $comm_window_start_index ($comsize-$comm_window_size)
			end
		end
	end
	goto :start

:process_down
	gosub :killchattriggers
	if ($BOT~botIsDeaf)
		if ($comm_window_start_index > 1)
			subtract $comm_window_start_index $comm_window_size
			if ($comm_window_start_index < 1)
				setVar $comm_window_start_index 1
			end
		end
	end
	goto :start

:process_command
	gosub :killchattriggers
	getDeafClients $BOT~botIsDeaf
	if ($BOT~botIsDeaf)
		setDeafClients false
		echo #27&"[255D"&#27&"[255B"&#27&"[K"	
		echo "*"&ansi_5&"Viewscreen shutting down..*"&ansi_15&CURRENTANSILINE
	else
		setDeafClients true
		setVar $comm_window_start_index 1
		setvar $old_output ""
		gosub :refreshChatMenu
	end           
	getDeafClients $BOT~botIsDeaf
	saveVar $BOT~botIsDeaf  
	goto :start

:toggle_battle_screen
	gosub :killchattriggers
	getDeafClients $BOT~botIsDeaf
	if ($BOT~botIsDeaf)
		if ($battle_screen = true)
			setvar $battle_screen false
		else
			setvar $battle_screen true
		end
		goto :start
	end
:toggle_mute_me
	gosub :killchattriggers
	getDeafClients $BOT~botIsDeaf
	if ($BOT~botIsDeaf)
		if ($ignoreme = true)
			setvar $ignoreme false
		else
			setvar $ignoreme true
		end
		goto :start
	end

:doneChat
	setDeafClients false
	echo #27 "[30D                        " #27 "[30D"
	echo CURRENTANSILINE
	setVar $botIsDeaf FALSE
	saveVar $botIsDeaf
	halt
return

:refresh
	getDeafClients $BOT~botIsDeaf
	if ($BOT~botIsDeaf)
		gosub :refreshChatMenu
		setDelayTrigger delay :refresh 500
	end
	pause







:lookForCom
gosub :killchattriggers
setvar $line CURRENTLINE
cuttext $line $checkCom 1 2
cutText $line $firstChar 1 1
getword $checkCom $checkCom 1
if ($firstChar = "'") OR ($firstChar = "`") OR ($checkCom = "P") OR ($checkCom = "R") OR ($checkCom = "F") OR ($checkCom = "S:")
	if ($checkCom = "P")
		getword $line $checkCorpScan 2
		if ($checkCorpScan = "indicates")
			goto :start
		end
	end
	getlength $line $length
	setvar $isme false
	if ($length > 4)
		if ($firstChar = "'")
			cuttext $line $line 2 9999
			setVar $line "R ME     "&$line
			setvar $isme true
		end
		if ($firstChar = "`")
			cuttext $line $line 2 9999
			setVar $line "F ME     "&$line
			setvar $isme true
		end
		if ($checkCom = "S:")
			cuttext $line $line 4 9999
			setVar $line "R ME     "&$line
			setvar $isme true
		end
		gosub :addCom2Window
	end
	goto :start
else
	goto :start
end

:figHitProcess
gosub :killchattriggers
setvar $line CURRENTLINE
getword $line $spoofCheck 1
if ($spoofCheck = "P") OR ($spoofCheck = "F") OR ($spoofCheck = "R") OR ($spoofCheck = ">")
	goto :start
else
	gosub :addFig2Window
	goto :start
end


:enterProcess
setvar $line CURRENTLINE
echo "**[][]"  CURRENTLINE "[][]**"
gosub :killchattriggers
getword $line $spoofCheck 1
if ($spoofCheck = "P") OR ($spoofCheck = "F") OR ($spoofCheck = "R") OR ($spoofCheck = ">")
	goto :start
else
	gosub :addEntry2Window
	goto :start
end

:limpetProcess
gosub :killchattriggers
setvar $line CURRENTLINE
getword $line $spoofCheck 1
if ($spoofCheck = "P") OR ($spoofCheck = "F") OR ($spoofCheck = "R") OR ($spoofCheck = ">")
	goto :start
else
	#getword CURRENTLINE $sector 4
	#getdistance $distance $sector CURRENTSECTOR
	#setvar $line " Hops: " & $distance & " " & $line
	gosub :addFig2Window
	goto :start
end

:addCom2Window
gosub :getTime
if ($startDate <> $year & $month & $day)
	setvar $startDate $year & $month & $day
	setvar $logFileName $bot~folder&"/"&$year & $month & $day & ".comms"
end
write $logFileName $hour & ":" & $minute & ":" & $second & ":" & $msec & "  " &$line
getlength $line $length
setvar $numline 1
setvar $line " " & $line
if (($isme = true) and ($ignoreme = true))
	# ignore self chat if ignore me is set. #
else
	if ($length > ($comm_line_length+1))
		cuttext $line $line1 1 ($comm_line_length)
		cuttext $line $line2 ($comm_line_length+1) 200
		setvar $line $line1&"* "&$line2
		setvar $numline 2

		setVar $line $line1
		getlength $line $length
		gosub :formatLine
		if ($line2 <> "")
			setVar $line "+         "&$line2
			getlength $line $length
			gosub :formatLine
		end
	else
		gosub :formatLine
	end
end
return

:addFig2Window
	gosub :getTime
	setVar $time " "&$hour & ":" & $minute & ":" & $second & ":" & $msec & "  "
	if ($isOdd)
		setVar $isOdd FALSE
		setVar $time ANSI_4&$time&ANSI_11
	else
		setVar $isOdd TRUE
		setVar $time ANSI_12&$time&ANSI_11
	end
	gettext " "&$line $attacker " " " destroyed "
	gettext " "&$line $howmany " destroyed " " of your fighters in sector "
	gettext $line&"[end][end]" $attacked " in sector " "[end][end]"
	replaceText $line $attacker&" " ANSI_11&$attacker&" "&ANSI_2
	replaceText $line " "&$howmany&" " ANSI_6&" "&$howmany&" "&ANSI_2
	replaceText $line $attacked ANSI_6&$attacked&ANSI_2
	isNumber $isNumber $attacked
	if ($isNumber)
		if (($attacked > 10)  AND ($attacked <= SECTORS))
			getdistance $distance $attacked CURRENTSECTOR
			if ($MAP~home_sector > 0)
				getdistance $distance_home $attacked $MAP~home_sector
			end
			setVar $hops ""
			if ($distance > 0)
				setvar $hops ANSI_2&" ("&ANSI_15&$distance & " hops away"&ANSI_2&")" 
				if ($MAP~home_sector > 0)
					setVar $hops $hops&" ("&ANSI_15&$distance_home & " from home"&ANSI_2&")"
				end
			end
			setvar $line  $time&$line&$hops
			gosub :buildFigString
		end
	end
return


:addEntry2Window
	gosub :getTime
	setVar $time " "&$hour & ":" & $minute & ":" & $second & ":" & $msec & "  "
	if ($isOdd)
		setVar $isOdd FALSE
		setVar $time ANSI_4&$time&ANSI_11
	else
		setVar $isOdd TRUE
		setVar $time ANSI_12&$time&ANSI_11
	end
	getWord CURRENTLINE $attacked 5
	replaceText $attacked ":" ""
	replaceText $line $attacked ANSI_6&$attacked&ANSI_2
	replaceText $line "Deployed Fighters Report Sector" ANSI_2&"Deployed Fighters Report Sector"&ANSI_2
#    isNumber $isNumber $attacked
#    if ($isNumber)
#        if (($attacked > 10)  AND ($attacked <= SECTORS))
#			getdistance $distance $attacked CURRENTSECTOR
#			if ($MAP~home_sector > 0)
#				getdistance $distance_home $attacked $MAP~home_sector
#			end
#			setVar $hops ""
#			if ($distance > 0)
#				setvar $hops ANSI_2&" ("&ANSI_15&$distance & " hops away"&ANSI_2&")" 
#				if ($MAP~home_sector > 0)
#					setVar $hops $hops&" ("&ANSI_15&$distance_home & " from home"&ANSI_2&")"
#				end
#			end
			setvar $line  $time&$line&$hops
			gosub :buildFigString
#    	end
#    end
return


:formatLine
	if ($length > 11)
		cuttext $line $commChar 1 2
		cuttext $line $theName 3 8
		cuttext $line $theRest 10 9999
		setVar $line ANSI_3&$commChar&ANSI_11&$theName&ANSI_14&$theRest
		if ($ignore <> TRUE)
			gosub :buildComString
		end
		setVar $ignore FALSE
	end
return

:buildFigString
setvar $figstring ""
setvar $windowString ""
setVar $i $figsize
while ($i > 0)
	if ($i = 1)
		setvar $figs[1] $line
		#setvar $figs[1][1] $numline
	else
		setvar $figs[$i] $figs[($i-1)]
		#setvar $figs[$i][1] $figs[($i-1)][1]
	end
	subtract $i 1
end

#setvar $count 2
#while (($numline < ($figsize-1)) AND ($count < $figsize))
#    setvar $numline ($numline + $figs[$count][1])
#    add $count 1
#end
while ($count >=1)
	if ($figs[$count] = 0)
		setvar $figs[$count] ""
	end
	setvar $figstring $figstring & $figs[$count] & "*"
	subtract $count 1
end
return

:buildComString
setvar $comstring ""
setvar $windowString ""
setVar $i $comsize
while ($i > 0)
	if ($i = 1)
		setvar $coms[1] $line
		#setvar $coms[1][1] $numline
	else
		setvar $coms[$i] $coms[($i-1)]
		#setvar $coms[$i][1] $coms[($i-1)][1]
	end
	subtract $i 1
end

#setvar $count 2
#while (($numline < ($comsize-1)) AND ($count < $comsize))
#    setvar $numline ($numline + $coms[$count][1])
#    add $count 1
#end
while ($count >=1)
	if ($coms[$count] = 0)
		setvar $coms[$count] ""
	end
	setvar $comstring $comstring & $coms[$count] & "*"
	subtract $count 1
end
return

# ----====[Get the date and time ]====----
# creates a unique number timestamp
# if time/date is 10:50:00am 9/15/05 then output = 20050915105000
# if time/date is 5:33:22pm 9/15/05 then output = 20050915173322
:getTime
getTime $dateTime "yyyymmddhhnnsszzz am/pm"
getword $dateTime $amPMcheck 2
getword $dateTime $finalTime 1
cuttext $finalTime $12check 9 2
if ($amPMcheck = "pm")
	if ($12check <> 12)
		add $finalTime 120000000
	end
end
cuttext $finalTime $year 1 4
cuttext $finalTime $month 5 2
cuttext $finalTime $day 7 2
cuttext $finalTime $hour 9 2
cuttext $finalTime $minute 11 2
cuttext $finalTime $second 13 2
cuttext $finalTime $msec 15 3
# echo ANSI_10 "*" $finalTime
# echo ANSI_10 "**" $month "/" $day "/" $year " - " $hour ":" $minute ":" $second
# echo ANSI_10 "*Date: " DATE " Time: " TIME "*"
return


:getStats
	gosub :loadVars
	
	if ($PLAYER~CURRENT_SECTOR = 0)
		setVar $stats[1] "    Sector : "&CURRENTSECTOR&"*"
	else
		setVar $stats[1] "    Sector : "&$PLAYER~CURRENT_SECTOR&"*"
	end
	if ($planet~planet <> 0)
		setVar $stats[2] "    Planet : "&$planet~planet&"*"
	else
		setVar $stats[2] "    Planet : None*"
	end
	if ($PLAYER~unlimitedGame)
		setVar $stats[3] "     Turns : Unlimited*"
	else
		setVar $stats[3] "     Turns : "&$PLAYER~TURNS&"*"
	end 
	setvar $player~value $player~experience
	gosub :player~commasize
	setVar $stats[4]  "       Exp : "&$player~value&"*"
	setvar $player~value $player~alignment
	gosub :player~commasize
	setVar $stats[5]  "     Align : "&$player~value&"*"
	setvar $player~value $player~credits
	gosub :player~commasize
	setVar $stats[6]  "   Credits : "&$player~value&"*"	
	setVar $stats[7]  "Holds Info : "&$player~total_holds&"*"
	setVar $stats[8] "  Fuel Ore : "&$player~ore_holds&"*"
	setVar $stats[9] "  Organics : "&$player~organic_holds&"*"
	setVar $stats[10] " Equipment : "&$player~equipment_holds&"*"
	setVar $stats[11] " Colonists : "&$player~colonist_holds&"*"
	setVar $empty_holds ($player~total_holds - $player~ore_holds)
	setVar $empty_holds ($empty_holds - $player~organic_holds)
	setVar $empty_holds ($empty_holds - $player~equipment_holds)
	setVar $empty_holds ($empty_holds - $player~colonist_holds)
	
	setVar $stats[12] "     Empty : "&$PLAYER~EMPTY_HOLDS&"*"
	setVar $stats[13] "    Ship # : "&$PLAYER~SHIP_NUMBER&"*"
	setvar $player~value $player~fighters
	gosub :player~commasize
	setVar $stats[14] "  Fighters : "&$player~value&"*"
	setvar $player~value $player~shields
	gosub :player~commasize
	setVar $stats[15] "   Shields : "&$player~value&"*"
	setvar $player~value $ship~ship_fighters_max
	gosub :player~commasize
	setVar $stats[16] "  Max Figs : "&$player~value&"*"
	setvar $player~value $ship~ship_max_attack
	gosub :player~commasize
	setVar $stats[17] "  Max Wave : "&$player~value&"*"
	setVar $stats[18] "Turns/Warp : "&$PLAYER~TURNS_PER_WARP&"*"
	
	cutText $PLAYER~ARMIDS&"    " $player~armids 0 3
	cutText $PLAYER~CLOAKS&"    " $player~cloaks 0 3
	cutText $PLAYER~GENESIS&"    " $player~genesis 0 3
	cutText $PLAYER~MINE_DISRUPTORS&"    " $player~mine_disruptors 0 3
	cutText $PLAYER~EPROBES&"    " $player~eprobes 0 3
	cutText $PLAYER~TWARP_TYPE&"    " $player~twarp_type 0 3
	cutText $PLAYER~SCAN_TYPE&"    " $player~scan_type 0 3

	setVar $stats[19] "   EProbes : "&$player~eprobes&" | Beacons : "&$PLAYER~beacons&"*"
	setVar $stats[20] "   Disrupt : "&$player~mine_disruptors&" | Photons : "&$PLAYER~PHOTONS&"*"
	setVar $stats[21] "    Armids : "&$player~armids&" | Limpets : "&$PLAYER~LIMPETS&"*"
	setVar $stats[22] "   Genesis : "&$player~genesis&" | AtmDets : "&$PLAYER~ATOMIC&"*"
	setvar $player~value $player~corbo
	gosub :player~commasize
	setVar $stats[23] "    Cloaks : "&$player~cloaks&" |  Corbos : "&$player~value&"*"
	setVar $stats[24] "     Twarp : "&$player~twarp_type&" | PlnScan : "&$PLAYER~PLANET_SCANNER&"*"
	setVar $stats[25] "   Scanner : "&$player~scan_type&" | PsiProb : "&$PLAYER~PSYCHIC_PROBE&"*"
	setVar $stats[26] "     *"
return

:loadVars
	loadVar $planet~planet
	loadVar $PLAYER~unlimitedGame
	loadVar $PLAYER~CREDITS
	loadVar $PLAYER~current_sector
	loadVar $PLAYER~TURNS
	loadVar $PLAYER~FIGHTERS
	loadVar $PLAYER~SHIELDS
	loadVar $player~total_holds
	loadVar $player~ore_holds
	loadVar $player~organic_holds
	loadVar $player~equipment_holds
	loadVar $player~colonist_holds
	loadVar $PLAYER~PHOTONS
	loadVar $PLAYER~ARMIDS
	loadVar $PLAYER~LIMPETS
	loadVar $PLAYER~GENESIS
	loadVar $PLAYER~TWARP_TYPE
	loadVar $PLAYER~CLOAKS
	loadVar $PLAYER~BEACONS
	loadVar $PLAYER~ATOMIC
	loadVar $PLAYER~CORBO
	loadVar $PLAYER~EPROBES
	loadVar $PLAYER~MINE_DISRUPTORS
	loadVar $PLAYER~PSYCHIC_PROBE
	loadVar $PLAYER~PLANET_SCANNER
	loadVar $PLAYER~SCAN_TYPE
	loadVar $PLAYER~ALIGNMENT
	loadVar $PLAYER~EXPERIENCE
	loadVar $PLAYER~SHIP_NUMBER
	loadVar $PLAYER~TRADER_NAME
	loadVar $MAP~STARDOCK
	loadVar $MAP~alpha_centauri
	loadVar $MAP~rylos
	loadVar $MAP~backdoor
	loadVar $SHIP~SHIP_FIGHTERS_MAX
	loadvar $SHIP~SHIP_MAX_ATTACK
	loadVar $PLAYER~TURNS_PER_WARP
return

:refreshChatMenu
	loadVar $BOT~who_is_online 
	loadVar $window_content
	if ($window_content = "")
		loadvar $switchboard~window_content
		setvar $window_content $switchboard~window_content
	end
	replaceText $BOT~who_is_online "," "*"
	replaceText $window_content "[][]" "*"
	gosub :getStats
	setVar $output #27 & "[2J"
	setVar $output $output&"**"
	if (($BOT~who_is_online <> "0") and ($bot~who_is_online <> ""))
		setvar $i 1
		listActiveScripts $scripts
		setvar $found false
		while ($i <= $scripts)
			getWordPos $scripts[$i] $pos "online.cts"
			if ($pos > 0)
				setVar $found TRUE
			end
			add $i 1
		end
		if ($found = true)
			setVar $output $output&ANSI_15&"---------------------------------------"&ansi_13&" Who's Online? "&ansi_15&"---------------------------------------------*"
			setVar $output $output&ANSI_10&""&ANSI_7&$BOT~who_is_online
		else
			setvar $bot~who_is_online ""
			savevar $bot~who_is_online
		end
	else
		if ($BOT~who_is_online = "0")
			setvar $bot~who_is_online ""
			savevar $bot~who_is_online
		end
	end
	if ($battle_screen = true)
		setVar $output $output&ANSI_15&"---------------------------------------------------------------------------------------------------*"
		gosub :MAP~displayNavigation
		setvar $output $output&$map~map&"*"
	else

		if (($window_content <> "") and ($window_content <> "0"))
			if ($window_content = $previous_window_content)
				add $window_content_time 500
			else
				setvar $window_content_time 0
			end
			if ($window_content_time < 120000)
				setVar $output $output&ANSI_15&"------------------------------------"&ansi_13&" Script Status Window "&ansi_15&"-----------------------------------------*"
				setVar $output $output&ANSI_10&""&ANSI_15&$window_content
				setvar $previous_window_content $window_content
			else
				setvar $window_content ""
				savevar $window_content
				setvar $window_content_time 0
			end
		else
			if ($window_content = "0")
				setvar $window_content ""
				savevar $window_content
			end
		end
		setVar $output $output&ANSI_15&"---------------------------------"&ansi_13&" Communications "&ansi_15&"--------------------------------"&ansi_13&" Stats "&ansi_15&"-----------*"

		setVar $i $figsize
		setVar $j 1
		setvar $fighter_output ""
		setvar $figlines 0
		while ($i >= 1)
			setVar $line $figs[$i]
			if ($line <> "")
				setVar $fighter_output $fighter_output&$line&"*"
				add $figlines 1
			end
			subtract $i 1
		end


		setvar $additional_com_lines 0
		if ($bot~who_is_online = "")
			add $additional_com_lines 3
		end
		if ($window_content = "")
			add $additional_com_lines 5
		end
		setvar $additional_com_lines ($additional_com_lines + ($figsize - $figlines))
		setVar $i ($comm_window_size + $additional_com_lines)
		setVar $j 1
		while ($i >= 0)
			setVar $line $coms[($comm_window_start_index+$i)]
			getWordPos $line $posF "F"
			getWordPos $line $posR "R"
			getWordPos $line $posP "P"
			getWordPos $line $posPlus "+"

			if (($posF > 0) OR ($posR > 0) OR ($posP > 0) OR ($posPlus > 0))
				setVar $line_length ($comm_line_length+23)
			else
				setVar $line_length $comm_line_length
			end
			getlength $line $length
			while ($length <= $line_length)
				setVar $line $line&" "
				getlength $line $length
			end
			replaceText $stats[$j] ":" ANSI_14&":"&ANSI_11
			replaceText $stats[$j] "|" ANSI_5&":"&ANSI_11
			setVar $output $output&$line&" "&ANSI_5&$stats[$j]
			subtract $i 1
			add $j 1
		end
	end
	if ($fighter_output <> "")
		setVar $output $output&ANSI_15&"-----------------------------------------"&ansi_2&" Fighter Hits "&ansi_15&"--------------------------------------------*"&$fighter_output
	else
		setvar $output $output&"*"
	end
	setVar $output $output&ANSI_15&"--------"&ANSI_12&" "&#27&"[35m["&#27&"[32m'"&#27&"[35m]"&ANSI_15&"Sub ("&$BOT~subspace&") "&ansi_15&"----- "&#27&"[35m["&#27&"[32m`"&#27&"[35m]"&ANSI_15&"Fed "&ansi_15&"---- "&#27&"[35mPage ["&#27&"[32mU"&#27&"[35m]p Chat "&ansi_15&"--"&#27&"[35m Page "&#27&"[35m["&#27&"[32mD"&#27&"[35m]own Chat "&ansi_15&"---- "
	loadvar $bot~subspace

	if ($ignoreme = true)
		setvar $output $output&#27&"[35m["&#27&"[32m+"&#27&"[35m]Show Me"&ANSI_15&" ---------*"
	else
		setvar $output $output&#27&"[35m["&#27&"[32m+"&#27&"[35m]Ignore Me"&ANSI_15&" -------*"
	end

	if ($output <> $old_output)
		echo $output
		setVar $old_output $output
	end
return

:checksilent
	:msgs_on_again
	setTextTrigger onMSGS_ON  :onMSGS_ON "Displaying all messages."
	setTextTrigger onMSGS_OFF :onMSGS_OFF "Silencing all messages."
	send "|"
	pause
	:onMSGS_OFF
	killtrigger onMSGS_ON
	SETVAR $was_silent FALSE
	goto :msgs_on_again
	:onMSGS_ON
	killtrigger onMSGS_OFF
	getDeafClients $BOT~botIsDeaf
	if ($BOT~botIsDeaf = TRUE)
		gosub :MENUS~donePrefer
	end
setdelaytrigger    silentdelay :checksilent 900000
pause


:killchattriggers
	killtrigger lookForP
	killtrigger lookForR
	killtrigger lookForF
	killtrigger lookForF2
	killtrigger lookForR2
	killtrigger lookForSelfR
	killtrigger lookForSelfF
	killtrigger open
	killtrigger talk
	killtrigger talk2
	killtrigger talk3
	killtrigger talk4
	killtrigger talk5
	killtrigger talk6
	killtrigger talk7
	killtrigger talk8
	killtrigger silentdelay
	killtrigger figHit
	killtrigger offFigHit
	killtrigger limpet
	killtrigger lookForSelfMul
	killtrigger enter
	killtrigger delay
	killtrigger lookForP
	killtrigger ignore
	killtrigger ignore2
return

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\map\displaynavigation\map"
include "source\bot_includes\player\commasize\player"
