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
	echo "12*"
    send #12
	echo "14*"
    send #14
	echo "15*"
    send #15
	echo "16*"
    send #16
	echo "17*"
    send #17
	echo "18*"
    send #18
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

