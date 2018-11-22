systemscript
    gosub :BOT~loadVars
    setVar $BOT~command "chat"
    setVar $BOT~help[1] $BOT~tab&"Chat helper to send chat as a macro to avoid problems with scripts."
    gosub :BOT~help_file

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
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
