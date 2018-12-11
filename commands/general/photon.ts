	logging off
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


	setVar $BOT~help[1] $BOT~tab&"Fires photon into adjacent sector.  "
	gosub :BOT~help_file
	setVar $target $parm1 
	isNumber $isNumber $target 
	if ($isNumber <> TRUE)
		setVar $SWITCHBOARD~message "Sector entered is not a number.  Halting.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if (($target <= 0) OR ($target > SECTORS))
		setVar $SWITCHBOARD~message "Sector is out of bounds.  Halting.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	gosub :PLAYER~quikstats
	if ($PLAYER~PHOTONS <= 0)
		setVar $SWITCHBOARD~message "You don't have any photons!  Halting.*"
		gosub :SWITCHBOARD~switchboard
		halt		
	end
	if (($PLAYER~CURRENT_PROMPT <> "Citadel") AND ($PLAYER~CURRENT_PROMPT <> "Command"))
		setVar $SWITCHBOARD~message "Photon must be run from command or citadel prompt.  Halting.*"
		gosub :SWITCHBOARD~switchboard
		halt		
	end
:shoot1
	send "c  p  y  " $target "**  q*"
	killtrigger shot
	killtrigger missed
	setTextTrigger shot :shot1 "Photon Missile launched into sector "&$target
	setTextTrigger missed :missed1 "<Computer deactivated>"
	pause

:missed1
	killtrigger shot
	setVar $SWITCHBOARD~message "Photon not fired.  Is the sector adjacent?*"
	gosub :SWITCHBOARD~switchboard
	halt

:shot1
	setVar $SWITCHBOARD~message "Photon fired -> Sector "&$target&"*"
	gosub :SWITCHBOARD~switchboard
	halt


#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
