# requires destination to be defined #

:mow
	setVar $BOT~command "mow"
	setVar $BOT~user_command_line " mow "&$destination&" 1"
	setVar $BOT~parm1 $startingSector
	saveVar $BOT~parm1
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\mombot\modes\grid\mow.cts"
	setEventTrigger		mowended		:mowended "SCRIPT STOPPED" "scripts\mombot\modes\grid\mow.cts"
	pause
	:mowended
return