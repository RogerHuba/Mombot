gosub :BOT~loadVars

loadVar $game~port_max
loadvar $MAP~STARDOCK
loadVar $bot~Folder


setVar $BOT~help[1]  $BOT~tab&" Port Report - Refresh Port Info"
setVar $BOT~help[2]  $BOT~tab&""
setVar $BOT~help[3]  $BOT~tab&" pr [param]/[all]"
setVar $BOT~help[4]  $BOT~tab&"  "
setVar $BOT~help[5]  $BOT~tab&" all   - All Ports Known"
setVar $BOT~help[6]  $BOT~tab&" param - All sectors with this param"
setVar $BOT~help[7]  $BOT~tab&" "
setVar $BOT~help[8]  $BOT~tab&" TWGS v2 only - Port Reports SLOW in v1."

gosub :bot~helpfile

setVar $BOT~script_title "Port Report Checker"
gosub :BOT~banner


loadVar $bot~command
getWord $bot~user_command_line $bot~parm1 1


gosub :player~quikstats
setVar $startingLocation $PLAYER~CURRENT_PROMPT
if (($startingLocation <> "Command") and ($startingLocation <> "Citadel"))
	setVar $SWITCHBOARD~message "Start from the command prompt or a citadel prompt.*"
	gosub :SWITCHBOARD~switchboard
	halt
else
	setVar $searchall 0
	if ($bot~parm1 = "all")
		setVar $searchall 1
		setVar $SWITCHBOARD~message "Updating Reports on ALL ports*"
	else
		setVar $searchVar $bot~parm1
        upperCase $searchVar
		setVar $SWITCHBOARD~message "Updating Reports on sectors with Param:" & $searchVar & "*"
	end
    gosub :SWITCHBOARD~switchboard
	goSub :doPortReports
	setVar $SWITCHBOARD~message "Port Reporting Complete.*"
	gosub :SWITCHBOARD~switchboard
	halt
end



:doPortReports
	setVar $sectors SECTORS
	send "c"
	waitfor "<Computer activated>"
	setVar $reportsWanted 200
	setVar $x 11
	setVar $total 0
	setVar $totalFree 0

	:allBlockedNextWave
	setVar $sendCount 0
	setVar $sent 0
    
	while ($x <= $sectors)
		
		if (PORT.EXISTS[$x] = 1)
            setVar $reportit 0
			if ($searchall = 1) 
                setVar $reportit 1
            else
                
                getSectorParameter $x $searchVar $isTrue

		        if (($isTrue <> "0") and ($isTrue <> ""))
                    setVar $reportit 1
                end
            end
            if ($reportit = 1)
                send "r" $x "*"
                add $sendCount 1
                add $total 1
                setVar $sent[$sendCount] $x
            end
		end
		
		if ($sendCount >= $reportsWanted)
			send "#"
			goto :getAllBlockedReports
		end
		add $x 1

	end
	
	:getAllBlockedReports

	setVar $gathered 0
	:allBlockedagain
	if ($x >= $sectors)
		setVar $reportsWanted $sendCount
	end
	if ($gathered = $reportsWanted)
		if ($x >= $sectors)
			goto :allBlockedfinish
		else
			goto :allBlockedNextWave
		end
	end

	setTextLineTrigger allBlockedok :allBlockedok "Commerce report for"
	setTextLineTrigger allBlockednook :allBlockednook "I have no information about a port in that sector"
	setTextLineTrigger allBlockedreallynotok :allBlockedreallynotok "u have never visted sector"
	pause
		:allBlockedok
			killalltriggers
			add $gathered 1
			add $totalFree 1
			setSectorParameter $sent[$gathered] "PORTBLKED" 0
			goto :allBlockedagain
		:allBlockednook
		:allBlockedreallynotok
			add $gathered 1
			setVar $sectorBlocked[$sent[$gathered]] 1
			setSectorParameter $sent[$gathered] "PORTBLKED" 1
			echo "Blocking " $sent[$gathered] " *"
			killalltriggers
			
			goto :allBlockedagain


	:allBlockedfinish
	
	send "q"
return


include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"