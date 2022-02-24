
gosub :BOT~loadVars


setVar $BOT~help[1]  $BOT~tab&"    Blocked Port Finder"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&"    mineports [controlport] [1/2/3/4/5/6/7/8/all]"
setVar $BOT~help[4]  $BOT~tab&"           {checklog} "
setVar $BOT~help[5]  $BOT~tab&" Options:"
setVar $BOT~help[6]  $BOT~tab&"    [controlport] - Port that is alive, not class 0"
setVar $BOT~help[6]  $BOT~tab&"    [1/2/3/4/5/6/7/8/all] : Classes"  
setVar $BOT~help[7]  $BOT~tab&"     >mineports 1234 3 4   "
setVar $BOT~help[8]  $BOT~tab&"      Control: 1234 targeting SBB SSB"
setVar $BOT~help[9]  $BOT~tab&"    {checklog} - Check logs for blown reports "
setVar $BOT~help[10] $BOT~tab&"    "
setVar $BOT~help[11] $BOT~tab&"    Control port is the port it checks data against."
setVar $BOT~help[12] $BOT~tab&"    Must be checked in CIM, not manually, else "
setVar $BOT~help[13] $BOT~tab&"    datetime compare will fail."
setVar $BOT~help[14] $BOT~tab&"    "
setVar $BOT~help[15] $BOT~tab&"    Excludes blown and figged ports"
setVar $BOT~help[16] $BOT~tab&"    Reports to mineports.txt"
setVar $BOT~help[17] $BOT~tab&"    1: BBS, 2: BSB 3: SBB 4: SSB 5: SBS"
setVar $BOT~help[18] $BOT~tab&"    6: BSS, 7: SSS 8: BBB"

gosub :bot~helpfile

setVar $BOT~script_title "Finds Blocked Ports - Filters by Class"
gosub :BOT~banner

getWordPos $bot~user_command_line $pos "checklog"

if ($pos)
	setVar $SWITCHBOARD~message "Checking logs to mark blown ports...*"
	gosub :switchboard~switchboard
	gosub :player~quikstats
        setVar $location $player~current_prompt
        if ($location <> "Command")
               setVar $SWITCHBOARD~message "Pelase start at command prompt!*"
			gosub :switchboard~switchboard
               halt
        end

	goSub :dologsdownload
	halt
end

isNumber $test $bot~parm1
IF ($test)
	
	setVar $controlport $bot~parm1
	setVar $SWITCHBOARD~message "Control port will be:" & $controlport & ".*"
	gosub :switchboard~switchboard
else
	
	setVar $SWITCHBOARD~message "Control port should be a port currently reporting.*"
	gosub :switchboard~switchboard
	halt
end

gosub :player~quikstats
if ($PLAYER~CURRENT_PROMPT = "Command")
	send "vctq"
	setTextLineTrigger getv1 :getv1 "This game has been running for"
	pause
	:getv1
		killalltriggers
		getWord CURRENTLINE $days 7
		add $days 1

	waitfor "<Computer activated>"
	setVar $add12 0
	setTextLineTrigger getam :getam " AM "
	setTextLineTrigger getpm :getpm " PM "
	pause
	:getpm
		killalltriggers
		setVar $add12 1
	:getam 
		killalltriggers

	getWord CURRENTLINE $wholeTime 1
	replaceText $wholeTime ":" " "
	getWord $wholeTime $thehour 1
	if ($add12 = 1)
		add $thehour 12
	end
	setVar $portgonet $days & $thehour
else
	setVar $SWITCHBOARD~message "Please run from command prompt so we can determine game time for blkd stamp.*"
	gosub :switchboard~switchboard
		halt
end

setVar $maxClasses 1
getWordPos $bot~user_command_line $pos "all"
if ($pos > 0)
	setVar $allports 1
else
	# don't ask, to tired and sick to redo below 
	if ($bot~parm2 = "")
		setVar $bot~parm2 0
	end
	if ($bot~parm3 = "")
		setVar $bot~parm3 0
	end
	if ($bot~parm4 = "")
		setVar $bot~parm4 0
	end
	if ($bot~parm5 = "")
		setVar $bot~parm5 0
	end
	if ($bot~parm6 = "")
		setVar $bot~parm6 0
	end
	if ($bot~parm7 = "")
		setVar $bot~parm7 0
	end
	if ($bot~parm8 = "")
		setVar $bot~parm8 0
	end
	if ($bot~parm9 = "")
		setVar $bot~parm9 0
	end

	if (($bot~parm2 > 0) and ($bot~parm2 < 9))
		setVar $lookfor[1] $bot~parm2
		setVar $lookmsg "Looking for port Class: " & $lookfor[1]
		if (($bot~parm3 > 0) and ($bot~parm3 < 9))
			setVar $lookfor[2] $bot~parm3
			setVar $lookmsg $lookmsg & ", " & $lookfor[2]
			setVar $maxClasses 2
			if (($bot~parm4 > 0) and ($bot~parm4 < 9))
				setVar $lookfor[3] $bot~parm4
				setVar $lookmsg $lookmsg & ", " & $lookfor[3]
				setVar $maxClasses 3
				if (($bot~parm5 > 0) and ($bot~parm5 < 9))
					setVar $lookfor[4] $bot~parm5
					setVar $lookmsg $lookmsg & ", " & $lookfor[4]
					setVar $maxClasses 4
					if (($bot~parm6 > 0) and ($bot~parm6 < 9))
						setVar $lookfor[5] $bot~parm6
						setVar $lookmsg $lookmsg & ", " & $lookfor[5]
						setVar $maxClasses 5
						if (($bot~parm7 > 0) and ($bot~parm7 < 9))
							setVar $lookfor[6] $bot~parm7
							setVar $lookmsg $lookmsg & ", " & $lookfor[6]
							setVar $maxClasses 6
							if (($bot~parm8 > 0) and ($bot~parm8 < 9))
								setVar $lookfor[7] $bot~parm8
								setVar $lookmsg $lookmsg & ", " & $lookfor[7]
								setVar $maxClasses 7
								if (($bot~parm9 > 0) and ($bot~parm9 < 9))
									setVar $lookfor[8] $bot~parm9
									setVar $lookmsg $lookmsg & ", " & $lookfor[8]
									setVar $maxClasses 8
								end
							end
						end
					end
				end
			end
		end
	else
		setVar $SWITCHBOARD~message "Please specify at least one class to hunt for.*"
		gosub :switchboard~switchboard
		halt

	end
	
	

end

clearallavoids

setVar $ports[1] BBS
setVar $ports[2] BSB
setVar $ports[3] SBB
setVar $ports[4] SSB
setVar $ports[5] SBS
setVar $ports[6] BSS
setVar $ports[7] SSS
setVar $ports[8] BBB



setVar $ctime PORT.UPDATED[$controlport] 


getWord $ctime $controltime1 1
getWord $ctime $controltime2 2

replaceText $controltime2 ":" " "
getWord $controltime2 $controltime3 1

setVar $controlDate $controltime1
setVar $controlHour $controltime3
setVar $target false
setvar $results "BLOCKED PORT REPORT:*Control Time:" & $ctime & "*"
setVar $results $results & $lookmsg & ".*"

setVar $found 0
setVar $i 1
while ($i <= SECTORS)
	setSectorParameter $i "TARGETS" 0
	if (PORT.EXISTS[$i] = TRUE)
		getSectorParameter $i "FIGSEC" $hasFig
		getSectorParameter $i "PORTDEST" $portGone
		getSectorParameter $i "PORTBLKED" $portBlkedAlready

		if (($hasFig <> 1) and ($portGone <> 1))
			goSub :checkPort
			if ((($checksOut = 1) or ($allports = 1)) and (PORT.CLASS[$i] <> 0))
			
				#echo $i " " PORT.UPDATED[$i] "*"
				goSub :checkTime
				if ($target = TRUE)
					#echo "  TARGET:" $i "*"
					#echo $i " " PORT.UPDATED[$i] "*"
					write "port_targets2.txt" $i & " " & $ports[PORT.CLASS[$i]] 
					setvar $results $results& $i & " [" & $ports[PORT.CLASS[$i]]  & "] "
					setSectorParameter $i "TARGETS" 1
					if (($portBlkedAlready = 0) or ($portBlkedAlready = ""))
						setSectorParameter $i "PORTBLKED" 1
						setSectorParameter $i "PORTBLKEDT" $portgonet
					end
					add $found 1
				end
			end
		else
			if (($hasFig = 1) and ($portGone = 0))
				setSectorParameter $i "PORTBLKED" 0
			end
		end
	end

	add $i 1
end

setVar $results $results &"*Total Targets Found:" & $found & "*"

setVar $SWITCHBOARD~message $results & "*"
	gosub :switchboard~switchboard


halt

:checkPort
	setVar $checksOut 0
	
	setVar $y 1
	while ($y <= $maxClasses)
		if (PORT.CLASS[$i] = $lookfor[$y])
			setVar $checksOut 1
			return
		end
		add $y 1
	end
		
return

:checkTime
	setVar $target false

	setVar $ltime PORT.UPDATED[$i] 
	getWord $ltime $ltimeword1 1
	getWord $ltime $ltimeword2 2

	replaceText $ltimeword2 ":" " "
	getWord $ltimeword2 $ltimeword3 1
	
	if ($controlDate <> $ltimeword1)
		if ($ltimeword1 <> "8/18/2019")
			setVar $target true
		end
	else
		if ($controlHour <> $ltimeword3)
			setVar $target true
		end
			
	end

return


:dologsdownload
	send "'Port Destroyed Report starting!*"

	send "cd**"
	waitfor "Displaying the entire histor"

	:doagain
	setTextTrigger ppause :ppause "[Pause]"
	setTextLineTrigger portd :portd "DESTROYED the Star Port in sector "
	setTextTrigger theend :theend "Computer command ["
	pause

		:ppause
			killalltriggers
			send "*"
			goto :doagain
		:portd
			getText CURRENTLINE $port " the Star Port in sector " "!"
			setSectorParameter $port "PORTDEST" 1
			killalltriggers
			goto :doagain
		:theend
			killalltriggers
		send "q"
	send "'Port Destroyed Report complete!*"

	#mad DESTROYED the Star Port in sector 5304!


return


include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
