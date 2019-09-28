:run
:xenter
	setVar $BOT~command "xenter"
	setVar $BOT~user_command_line " xenter silent"
	setVar $BOT~parm1 "silent"
	saveVar $BOT~parm1
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\mombot\commands\grid\xenter.cts"
	setEventTrigger		xenterended		:xenterended "SCRIPT STOPPED" "scripts\mombot\commands\grid\xenter.cts"
	pause
	:xenterended
return