	gosub :BOT~loadVars


	setVar $BOT~help[1]  $BOT~tab&"password "
	setVar $BOT~help[2]  $BOT~tab&"  Sends ansi password"
	setVar $BOT~help[3]  $BOT~tab&"      "
	gosub :bot~helpfile

    send "test" #13
 
halt
	
#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"

