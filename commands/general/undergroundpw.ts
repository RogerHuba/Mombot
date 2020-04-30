	gosub :BOT~loadVars


	setVar $BOT~help[1]  $BOT~tab&"password "
	setVar $BOT~help[2]  $BOT~tab&"  Sends ansi password"
	setVar $BOT~help[3]  $BOT~tab&"      "
	gosub :bot~helpfile

	send  "test" 

	echo "1*"
	send #1
	echo "2*"
    send #2
	echo "3*"
    send #3
	echo "4*"
    send #4
	echo "5*"
    send #5
	echo "6*"
    send #6
	echo "7*"
    send #7
	echo "11*"
    send #11

halt
	
#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"

