		gosub :BOT~loadVars
	setVar $parm1 $BOT~parm1
	setVar $parm2 $BOT~parm2
	setVar $parm3 $BOT~parm3
	setVar $parm4 $BOT~parm4
	setVar $parm5 $BOT~parm5
	setVar $parm6 $BOT~parm6
	setVar $parm7 $BOT~parm7
	setVar $parm8 $BOT~parm8
	loadVar $MAP~STARDOCK
	setVar $user_command_line $BOT~user_command_line


	setVar $BOT~help[1] $BOT~tab&"Kill all colos on a planet if possible with fighters"
	gosub :BOT~help_file

	setVar $BOT~script_title "Kill Colos"
	gosub :BOT~banner

	setVar $PLAYER~save TRUE
	gosub :PLAYER~quikstats

	if (($PLAYER~CURRENT_PROMPT <> "Planet") AND ($PLAYER~CURRENT_PROMPT <> "Citadel"))
		setVar $SWITCHBOARD~message "Must start from planet or citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($PLAYER~CURRENT_PROMPT = "Citadel")
		send "q "
	end

	setVar $number_of_colos 1
	while (($PLAYER~FIGHTERS > 0) AND ($number_of_colos > 0))
		send "zay"&$PLAYER~FIGHTERS&"*** m* * * "
		waiton "Remember that your fighters will be used up after a few thousand firings."
		waiton "Colonists on it."
		getText CURRENTLINE $number_of_colos " has " " Colonists on it."
		replacetext $number_of_colos "," ""
		gosub :PLAYER~quikstats
	end

	if ($number_of_colos > 0)
		setVar $SWITCHBOARD~message "Killed all colos possible, but some still exist.*"
	else
		setVar $SWITCHBOARD~message "Completed killing all colonists on planet.*"
	end
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
