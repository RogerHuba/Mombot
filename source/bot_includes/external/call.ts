:run
:holo
	setVar $BOT~command "call"
	setVar $BOT~user_command_line " call"
	setvar $bot~parm1 ""
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
return
