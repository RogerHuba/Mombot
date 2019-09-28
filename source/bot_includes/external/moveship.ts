
# requires $bot~user_command_line and $bot~parm1 to be defined before calling this #
:moveship
	setvar $bot~command "moveship"
	saveVar $BOT~parm1
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\mombot\modes\resource\moveship.cts"
	setEventTrigger		moveshipended		:movehomeshipended "SCRIPT STOPPED" "scripts\mombot\modes\resource\moveship.cts"
	pause
	:movehomeshipended
return