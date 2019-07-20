loadVar $bot_name
loadVar $user_command_line
loadVar $bot_turn_limit
loadVar $parm1
loadVar $parm2
send "'{" $bot_name "} - Scanning BUSTED SectorParameter ...*"
waiton "Message sent on sub-space channel"
setVar $IDX 11
setVar $COUNT 0
setVar $COLUMN 1
setVar $STRING "      "
while ($IDX <= SECTORS)
	getsectorparameter $IDX "BUSTED" $BUS
	isnumber $tst $BUS
	if ($tst = 0)
		setVar $BUS 0
	end
	if ($BUS <> 0)
		add $COUNT 1
		gosub :PAD
		if ($COLUMN <= 10)
			setVar $STRING ($STRING & " " & $PAD & $IDX)
			add $COLUMN 1
		else
			setVar $STRING ($STRING & "*       " & $PAD & $IDX)
			setVar $COLUMN 1
		end
	end
	add $IDX 1
end
send "'*"
waiton "Type sub-space message"
send "{" $bot_name "} - "&$COUNT&" Busts Found In DataBase*"
if ($COUNT <> 0)
	send $STRING & "*"
end
send "*"
waiton "Sub-space comm-link terminated"
halt

:PAD
setVar $PAD ""
getlength $IDX $LEN
setVar $PAD_i 1
while ($PAD_i <= (5 - $LEN))
	setVar $PAD ($PAD & " ")
	add $PAD_i 1
end
return