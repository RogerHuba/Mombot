logging off

gosub :BOT~loadVars
loadVar $MAP~STARDOCK
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
	send "'"&$switchboard~bot_name&" w*"
	waitOn " credits taken from citadel."
	gosub :player~quikstats
	if ($player~CREDITS < 1000)
			setvar $switchboard~message "Credits are under 1000.*"
			gosub :switchboard~switchboard
			setVar $continue FALSE
	else
		setvar $bot~command "buy"
		setVar $BOT~user_command_line " buy fig "&($desired-$total)
		setVar $BOT~parm1 "fig"
		saveVar $BOT~parm1
		setVar $BOT~parm2 ($desired-$total)
		saveVar $BOT~parm2
		saveVar $BOT~command
		saveVar $BOT~user_command_line
		waitOn " Fighters added on planet "&$planet~planet&"."
		getWord CURRENTLINE $added 3
		add $total $added

		setvar $bot~command "movefig"
		setVar $BOT~user_command_line " movefig s "
		setVar $BOT~parm1 "s"
		saveVar $BOT~parm1
		setVar $BOT~parm2 ""
		saveVar $BOT~parm2
		saveVar $BOT~command
		saveVar $BOT~user_command_line
		load "scripts\mombot\modes\resource\movefig.cts"
		setEventTrigger		moveended		:moveended "SCRIPT STOPPED" "scripts\mombot\modes\resource\movefig.cts"
		pause
		:moveended
	end
	if (($buyLimited = TRUE) AND ($total >= $desired))
		setVar $continue FALSE
	end
end
setvar $bot~command "dep"
setVar $BOT~user_command_line " dep "
setVar $BOT~parm1 ""
saveVar $BOT~parm1
saveVar $BOT~command
saveVar $BOT~user_command_line
load "scripts\mombot\commands\general\dep.cts"
setEventTrigger		depended		:depended "SCRIPT STOPPED" "scripts\mombot\commands\general\dep.cts"
pause
:depended
	setvar $switchboard~message $total&" fighters purchased and added to sector.*"
	gosub :switchboard~switchboard
	halt

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\bot_includes\player\quikstats\player"
