systemscript
gosub :BOT~loadVars
								

setVar $BOT~help[1] $BOT~tab&"Chat helper to send chat as a macro to avoid problems with scripts."
gosub :bot~helpfile

setVar $BOT~script_title "Chat"
gosub :BOT~banner

:start
killtrigger fed
killtrigger ss
setTextOutTrigger fed :fed "`" 
setTextOutTrigger ss :ss "'" 
pause
	:ss
			getInput $message ANSI_13&"Subspace message:"&ANSI_7
			if ($message <> "")
				send "'"&$message&"*"
			end
			setTextOutTrigger ss :ss "'" 
			pause
	:fed
			getInput $message ANSI_13&"Fed message:"&ANSI_7            
			if ($message <> "")
				send "`"&$message&"*"
			end
			setTextOutTrigger fed :fed "`" 
			pause


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\switchboard"


