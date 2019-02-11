	logging off
	gosub :BOT~loadVars

	setvar $switchboard~message "Starting to look for stardock to port at.*"
	gosub :switchboard~switchboard
	
:itsnotthere
	send "*"
	killtrigger 1
	killtrigger 2
	setTextLineTrigger 1 :itsthere "Ports   : Stargate Alpha I, Class 9 (Special) (StarDock)"
	setTextLineTrigger 2 :itsnotthere "Warps to Sector(s) :"
	pause

:itsthere
	killtrigger 2
	send "ps s"
halt


#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\switchboard"


