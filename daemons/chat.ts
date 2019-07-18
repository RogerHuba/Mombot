systemscript
    	gosub :BOT~loadVars
	setVar $parm1 $BOT~parm1
	setVar $parm2 $BOT~parm2
	setVar $parm3 $BOT~parm3
	setVar $parm4 $BOT~parm4
	setVar $parm5 $BOT~parm5
	setVar $parm6 $BOT~parm6
	setVar $parm7 $BOT~parm7
	setVar $parm8 $BOT~parm8
	setVar $user_command_line $BOT~user_command_line


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
