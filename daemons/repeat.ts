		gosub :BOT~loadVars


	setVar $BOT~help[1] $BOT~tab&"Repeats bot commands "
	setVar $BOT~help[2] $BOT~tab&"      "
	setVar $BOT~help[3] $BOT~tab&"repeat [delay in seconds] [bot command]"
	setVar $BOT~help[4] $BOT~tab&"         "
	setVar $BOT~help[5] $BOT~tab&"Options: "
	setVar $BOT~help[6] $BOT~tab&"{delay in seconds} - seconds to delay before calling bot command again"
	setVar $BOT~help[7] $BOT~tab&"     {bot command} - bot command to run, parameters and all"
	gosub :BOT~help_file

	setVar $BOT~script_title "Repeater"
	gosub :BOT~banner
	loadVar $bot~bot_name
	loadVar $bot~parm1
	loadVar $bot~user_command_line

	getLength $bot~parm1 $length
	getWordPos $bot~user_command_line $pos $bot~parm1
	
	cutText $bot~user_command_line $bot_command ($pos + $length) 9999
	
	isNumber $test $bot~parm1
	if ($test <> TRUE)
		send "'{"&$bot~bot_name&"} - Must enter time of delay in seconds."
		halt
	end

	setVar $delay ($bot~parm1*1000)
	:continue
	send "'"&$bot~bot_name&" "&$bot_command&"*"
	setDelayTrigger delay :continue $delay
	pause
	

#INCLUDES:
include "source\module_includes\bot"
