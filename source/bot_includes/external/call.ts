:run
:call
	setVar $BOT~command "call"
	if ($capture)
		setvar $bot~parm1 ""
		setVar $BOT~user_command_line " call  "
	elseif ($kill)
		setvar $bot~parm1 ""
		setVar $BOT~user_command_line " call  "
	else
		setVar $BOT~user_command_line " call"
	end
	setvar $bot~parm2 ""
	setvar $bot~parm3 ""
	setvar $bot~parm4 ""
	setvar $bot~parm5 ""
	setvar $bot~parm6 ""
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	savevar $bot~parm1
	savevar $bot~parm2
	savevar $bot~parm3
	savevar $bot~parm4
	savevar $bot~parm5
	savevar $bot~parm6
	load "scripts\mombot\commands\defense\call.cts"
	setEventTrigger        callend1        :callend1 "SCRIPT STOPPED" "scripts\mombot\commands\defense\call.cts"
	pause
	:callend1


	gosub :player~quikstats
	if ($player~current_prompt <> "Citadel")
		setvar $switchboard~message "Not on planet even after call saveme.  I'm in real trouble.  Will try again in 15 seconds.*"
		gosub :switchboard~switchboard

		killalltriggers
		setDelayTrigger	   1 :call	15000
		pause
	end
	
	if ($starting_ship_type <> $player~ship_type)
		setvar $switchboard~message "Looks like I've been podded after saveme!  Heading back home, and shutting down.*"
		gosub :switchboard~switchboard
		send "p"&$map~home_sector&"* y "
		halt
	end

	gosub :planet~getplanetinfo
	if ($starting_planet <> $planet~planet)
		setvar $switchboard~message "Looks like I'm on a different planet than I started with.  Make sure the other one is picked up.  Will continue on my defender mission, though.*"
		gosub :switchboard~switchboard

		setvar $starting_planet $planet~planet		
	end

return
