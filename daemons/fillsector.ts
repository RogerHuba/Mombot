
logging off
		gosub :BOT~loadVars
	setVar $parm1 $BOT~parm1
	setVar $parm2 $BOT~parm2
	setVar $parm3 $BOT~parm3
	setVar $parm4 $BOT~parm4
	setVar $parm5 $BOT~parm5
	setVar $parm6 $BOT~parm6
	setVar $parm7 $BOT~parm7
	setVar $parm8 $BOT~parm8
	loadVar $MAP~STARDOCK
	setVar $user_command_line $BOT~user_command_line
loadVar $PLANET~PLANET
setVar $total 0
setVar $desired 0
gosub :player~quikstats
setVar $startingLocation $player~CURRENT_PROMPT
if ($startingLocation <> "Citadel")
        send "'{" $switchboard~bot_name "} - Must start at Citadel.*"
        halt
end
if ($planet~planet <= 0)
        send "'{" $switchboard~bot_name "} - Unknown planet number. Display planet to bot so it can know the planet number.*"
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
	send "'"&$switchboard~bot_name&" w*"
	waitOn " credits taken from citadel."
	gosub :player~quikstats
	if ($player~CREDITS < 1000)
	        send "'{" $switchboard~bot_name "} - Credits are under 1000.*"
	        setVar $continue FALSE
	else
		send "'"&$switchboard~bot_name&" buy fig "&($desired-$total)&"*"
		waitOn " Fighters added on planet "&$planet~PLANET&"."
		getWord CURRENTLINE $added 3
		add $total $added
		send "'"&$switchboard~bot_name&" movefig s*"
		waitOn "'{"&$switchboard~bot_name&"} - fighters moved"
	end
	if (($buyLimited = TRUE) AND ($total >= $desired))
		setVar $continue FALSE
	end
end
send "'"&$switchboard~bot_name&" d*"
waitOn " credits deposited into citadel."
send "'{" $switchboard~bot_name "} - "&$total&" fighters purchased and added to sector.*"
halt

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\map"
include "source\bot_includes\planet"
include "source\bot_includes\player"
include "source\bot_includes\player\quikstats"
include "source\bot_includes\switchboard"
