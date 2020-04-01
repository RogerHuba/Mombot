logging off

gosub :BOT~loadVars
loadVar $MAP~STARDOCK
loadVar $MAP~home_Sector
loadVar $planet~planet
setVar $total 0
setVar $desired 0
gosub :player~quikstats
setVar $startingLocation $player~CURRENT_PROMPT

if ($startingLocation <> "Citadel")
		setvar $switchboard~message "Must start at Citadel.*"
		gosub :switchboard~switchboard
		halt
end
if ($planet~planet <= 0)
		setvar $switchboard~message "Unknown planet number. Display planet to bot so it can know the planet number.*"
		gosub :switchboard~switchboard
		halt
end
isNumber $isNumber $bot~parm1
if ($isNumber)
	if ($bot~parm1 > 0)
		setVar $buyLimited TRUE
		setVar $desired $bot~parm1
	end
end
setVar $continue TRUE
while (($continue = TRUE))
		send "p" $bot~parm1 "* y "
		gosub :player~quikstats
		setVar $BOT~user_command_line " movefig p "
		setVar $BOT~parm1 "p"
		gosub :move

		send "p" $map~home_sector "* y "
		gosub :player~quikstats
		setVar $BOT~user_command_line " movefig s "
		setVar $BOT~parm1 "s"
		gosub :move

end

:move

		setvar $bot~command "movefig"
		saveVar $BOT~parm1
		setVar $BOT~parm2 ""
		saveVar $BOT~parm2
		saveVar $BOT~command
		saveVar $BOT~user_command_line
		load "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
		setEventTrigger		moveended		:moveended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
		pause
		:moveended
return

	halt

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
