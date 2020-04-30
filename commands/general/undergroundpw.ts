	gosub :BOT~loadVars


	setVar $BOT~help[1]  $BOT~tab&"password "
	setVar $BOT~help[2]  $BOT~tab&"  Sends ansi password"
	setVar $BOT~help[3]  $BOT~tab&"      "
	gosub :bot~helpfile

    send #27 "t" #27 "e" #27 "s" #27 "t" #27
 
halt
	
#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"

