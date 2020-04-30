	gosub :BOT~loadVars


	setVar $BOT~help[1]  $BOT~tab&"password "
	setVar $BOT~help[2]  $BOT~tab&"  Sends ansi password"
	setVar $BOT~help[3]  $BOT~tab&"      "
	gosub :bot~helpfile

	send  "test" 

	echo "19*"
    send #19
	echo "20*"
    send #20
	echo "21*"
    send #21
	echo "22*"
    send #22
	echo "23*"
    send #23
	echo "24*"
    send #24
	echo "25*"
    send #25
	echo "26*"
    send #26
	echo "27*"
    send #27
	echo "28*"
    send #28
	echo "29*"
    send #29
	echo "30*"
    send #30
	echo "31*"
    send #31
 
halt
	
#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"

