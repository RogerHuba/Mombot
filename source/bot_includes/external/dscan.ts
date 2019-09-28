:run
:dscan
	setVar $BOT~command "dscan"
	setVar $BOT~user_command_line " dscan silent"
	setVar $BOT~parm1 "silent"
	saveVar $BOT~parm1
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\mombot\commands\data\dscan.cts"
	setEventTrigger		dscandone		:dscandone "SCRIPT STOPPED" "scripts\mombot\commands\data\dscan.cts"
	pause
	:dscandone
return