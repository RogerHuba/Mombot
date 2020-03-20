# requires $pe~destination to be defined #

:run
:pe
	setVar $BOT~command "pe"
	setVar $BOT~user_command_line " pe "&$destination&" "
	setVar $BOT~parm1 $destination
	setVar $BOT~parm2 ""
	setVar $BOT~parm3 ""
	setVar $BOT~parm4 ""
	setVar $BOT~parm5 ""
	setVar $BOT~parm6 ""
	saveVar $BOT~parm1
	saveVar $BOT~parm2 
	saveVar $BOT~parm3 
	saveVar $BOT~parm4 
	saveVar $BOT~parm5 
	saveVar $BOT~parm6 
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\mombot\commands\offense\pe.cts"
	setEventTrigger		peended		:peended "SCRIPT STOPPED" "scripts\mombot\commands\offense\pe.cts"
	pause
	:peended
return