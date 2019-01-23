    gosub :BOT~loadVars


    setVar $BOT~help[1]  $BOT~tab&"getnear {port amount} "
    setVar $BOT~help[2]  $BOT~tab&"  Finds ports nearby with amounts of product."
	setVar $BOT~help[3]  $BOT~tab&"        default is port max for game settings"
    gosub :BOT~help_file

gosub :player~quikstats
setVar $CNT 0
setVar $BUYER 0
setVar $B 0
setVar $SELLER 0
setVar $S 0
loadVar $GAME~port_max
loadvar $switchboard~BOT_NAME
loadVar $bot~parm1
setvar $game~port_max $GAME~port_max
setvar $bot~bot_name $switchboard~BOT_NAME
setvar $bot~parm1 $bot~parm1

if ($game~PORT_MAX = 0)
	send "'{" & $bot~bot_name & "} Unable To Determine Port Max From CFG File*"
	waitfor "Message sent on sub-space channel"
	halt
end

isnumber $tst $bot~parm1
if ($tst = 0)
	setVar $bot~parm1 $game~port_max
else
	if ($bot~parm1 > $game~port_max)
		setVar $bot~parm1 $game~port_max
	end
	if ($bot~parm1 < 1)
		setVar $bot~parm1 $game~port_max
	end
end

send "'{" & $bot~bot_name & "} Searching For Ports BUYERS & SELLERS ...*"
waitfor "Message sent on sub-space channel"

getNearestWarps $LOOKUP $player~current_sector
setVar $IDX 1
while ($IDX <= $LOOKUP)
	setVar $Focus $LOOKUP[$IDX]
	if (PORT.EXISTS[$Focus])
		if (PORT.CLASS[$Focus] = 2) OR (PORT.CLASS[$Focus] = 3) OR (PORT.CLASS[$Focus] = 4) OR (PORT.CLASS[$Focus] = 8)
			if (PORT.EQUIP[$Focus] >= $bot~parm1)
				getSectorParameter $Focus "FIGSEC" $FIG
				if ($FIG <> "0")
					getDistance $DIST $player~current_sector $FOCUS
					if ($DIST = "-1")
						setVar $DIST 0
					end
					if ($DIST < 10)
						setVar $DIST (" " & $DIST)
					end
					add $B 1
					gosub :FORMAT
					setVar $BUYER[$B] $STR
					add $CNT 1
				end
			end
		end
		if (PORT.CLASS[$Focus] = 1) OR (PORT.CLASS[$Focus] = 5) OR (PORT.CLASS[$Focus] = 6) OR (PORT.CLASS[$Focus] = 7)
			if (PORT.EQUIP[$Focus] >= $bot~parm1)
				getSectorParameter $Focus "FIGSEC" $FIG
				if ($FIG <> "0")
					getDistance $DIST $player~current_sector $FOCUS
					if ($DIST = "-1")
						setVar $DIST 0
					end
					if ($DIST < 10)
						setVar $DIST (" " & $DIST)
					end
					add $S 1
					gosub :FORMAT
					setVar $SELLER[$S] $STR
					add $CNT 1
				end
			end
		end
	end
	if ($CNT >= 100)
		goto :_END_
	end
	add $IDX 1
end
:_END_
setVar $idx 1
send "'*"
waiton "Type sub-space message"
send "{" & $bot~bot_name & "} GETNEAREST CASHING PORT : " & $CNT & " Found >= "&$bot~parm1&" units*"
getlength "{" & $bot~bot_name & "}" $LEN
setVar $PAD ""
setVar $i 1
while ($i <= $LEN)
	setVar $PAD ($PAD & "-")
	add $i 1
end
send $PAD & "-----------------------------------*"

if ($b <> 0)
	send "BUYERS*"
	while ($idx <= $b)
		send $BUYER[$idx] & "*"
		add $idx 1
	end
end
send "    *"
if ($s <> 0)
	setVar $idx 1
	send "SELLERS*"
	while ($idx <= $s)
		send $SELLER[$idx] & "*"
		add $idx 1
	end
end
send "*"
waiton "Sub-space comm-link terminated"

halt

:FORMAT
	setVar $NUM $FOCUS
	gosub :PAD
	setVar $STR ($PAD & $FOCUS & ", " & $DIST & " hops")
	if (PORT.CLASS[$Focus] = 1)
		setvar $STR ($STR & " BBS")
	elseif (PORT.CLASS[$Focus] = 2)
		setvar $STR ($STR & " BSB")
	elseif (PORT.CLASS[$Focus] = 3)
		setvar $STR ($STR & " SBB")
	elseif (PORT.CLASS[$Focus] = 4)
		setvar $STR ($STR & " SSB")
	elseif (PORT.CLASS[$Focus] = 5)
		setvar $STR ($STR & " SBS")
	elseif (PORT.CLASS[$Focus] = 6)
		setvar $STR ($STR & " BSS")
	elseif (PORT.CLASS[$Focus] = 7)
		setvar $STR ($STR & " SSS")
	elseif (PORT.CLASS[$Focus] = 8)
		setvar $STR ($STR & " BBB")
	end

	setVar $NUM PORT.FUEL[$FOCUS]
	gosub :PAD
	setVar $STR ($STR & " " & $PAD & $NUM & " (" & port.percentfuel[$FOCUS] & "%)")
	if (port.percentfuel[$FOCUS] < 10)
		setVar $STR ($STR & "  ")
	elseif (port.percentfuel[$FOCUS] < 100)
		setVar $STR ($STR & " ")
	end

	setVar $NUM PORT.ORG[$FOCUS]
	gosub :PAD
	setVar $STR ($STR & $PAD & $NUM & " (" & port.percentorg[$FOCUS] & "%)")
	if (port.percentorg[$FOCUS] < 10)
		setVar $STR ($STR & "  ")
	elseif (port.percentorg[$FOCUS] < 100)
		setVar $STR ($STR & " ")
	end

	setVar $NUM PORT.EQUIP[$FOCUS]
	gosub :PAD
	setVar $STR ($STR & " " & $PAD & $NUM & " (" & port.percentequip[$FOCUS] & "%)")
	return


:PAD
	setVar $PAD ""
	getLength $NUM $LEN
	setVar $PAD_i 1
	while ($PAD_i <= (5 - $LEN))
		setVar $PAD ($PAD & " ")
		add $PAD_i 1
	end
	return

# includes:
include "source\bot_includes\player"
include "source\bot_includes\sector"
include "source\bot_includes\ship"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
include "source\module_includes\bot"
