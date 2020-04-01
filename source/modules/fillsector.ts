loadVar $bot_name
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
loadVar $command
loadVar $PLANET
setVar $total 0
setVar $desired 0
gosub :quikstats~quikstats
setVar $startingLocation $quikstats~CURRENT_PROMPT
if ($startingLocation <> "Citadel")
        send "'{" $bot_name "} - Must start at Citadel.*"
        halt
end
if ($planet <= 0)
        send "'{" $bot_name "} - Unknown planet number. Display planet to bot so it can know the planet number.*"
        halt
end
isNumber $isNumber $parm1
if ($isNumber)
	if ($parm1 > 0)
		setVar $buyLimited TRUE
		setVar $desired $parm1
	end
end
setVar $continue TRUE
while (($continue = TRUE))
	send "'"&$bot_name&" w*"
	waitOn " credits taken from citadel."
	gosub :quikstats~quikstats
	if ($quikstats~CREDITS < 1000)
	        send "'{" $bot_name "} - Credits are under 1000.*"
	        setVar $continue FALSE
	else
		send "'"&$bot_name&" buy fig "&($desired-$total)&"*"
		waitOn " Fighters added on planet "&$PLANET&"."
		getWord CURRENTLINE $added 3
		add $total $added
		send "'"&$bot_name&" movefig s*"
		waitOn "'{"&$bot_name&"} - fighters moved"
	end
	if (($buyLimited = TRUE) AND ($total >= $desired))
		setVar $continue FALSE
	end
end
send "'"&$bot_name&" d*"
waitOn " credits deposited into citadel."
send "'{" $bot_name "} - "&$total&" fighters purchased and added to sector.*"
halt

include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\"&$bot~mombot_directory&"\botIncludes\quikstats"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\"&$bot~mombot_directory&"\botIncludes\planetinfo"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\"&$bot~mombot_directory&"\botIncludes\pwarp"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\"&$bot~mombot_directory&"\botIncludes\shipstats"
