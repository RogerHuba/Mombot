	gosub :BOT~loadVars


	setVar $BOT~help[1]  $BOT~tab&"password "
	setVar $BOT~help[2]  $BOT~tab&"  Sends ansi password"
	setVar $BOT~help[3]  $BOT~tab&"      "
	gosub :bot~helpfile

	send  "test" 

	send #1
    send #2
    send #3
    send #4
    send #5
    send #6
    send #7
    send #11
    send #12
    send #14
    send #15
    send #16
    send #17
    send #18
    send #19
    send #20
    send #21
    send #22
    send #23
    send #24
    send #25
    send #26
    send #27
    send #28
    send #29
    send #30
    send #31
 
halt
	
#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"

