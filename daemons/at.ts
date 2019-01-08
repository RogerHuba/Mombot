systemscript


	gosub :BOT~loadVars
	setVar $BOT~help[1]  $BOT~tab&"Does bot command at certain time "
	setVar $BOT~help[2]  $BOT~tab&"      "
	setVar $BOT~help[3]  $BOT~tab&"  at [time] [bot command]"
	setVar $BOT~help[4]  $BOT~tab&"         "
	setVar $BOT~help[5]  $BOT~tab&"  Options: "
	setVar $BOT~help[6]  $BOT~tab&"            {time} - time to do command each day"
	setVar $BOT~help[7]  $BOT~tab&"     {bot command} - bot command to run, parameters and all"
	setVar $BOT~help[8]  $BOT~tab&"               "
	setVar $BOT~help[9]  $BOT~tab&"                     example: 5:30:00 PM"
	setVar $BOT~help[10] $BOT~tab&"     The time is on your machine, not the game server"
	gosub :BOT~help_file


	loadVar $bot~bot_name
	loadVar $bot~parm1
	loadVar $bot~user_command_line

	getLength $bot~parm1 $length
	getWordPos $bot~user_command_line $pos $bot~parm1
	
	
	if (($bot~parm2 <> "pm") and ($bot~parm2 <> "am"))
		send "'{"&$bot~bot_name&"} - Time must be entered in system format.*"
		halt
	end

	cutText $bot~user_command_line $bot_command ($pos + $length + 3) 9999


	setvar $switchboard~message "At "&$bot~parm1&" "&$bot~parm2&", I will be running this command: "&$bot_command&"*"
	gosub :switchboard~switchboard

	:settimer
	uppercase $bot~parm2
	setEventTrigger delay :continue "TIME HIT" $bot~parm1&" "&$bot~parm2
	pause
	:continue
	send "'"&$bot~bot_name&" "&$bot_command&"*"
	goto :settimer

halt 

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"