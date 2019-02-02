	logging off
	gosub :BOT~loadVars
	 gosub :player~init

	setVar $BOT~help[1] $BOT~tab&"hkill {surround} "
	setVar $BOT~help[2] $BOT~tab&"  - Holoscans and then kills if enemy in adjacent sector."
	gosub :BOT~help_file

	loadvar $player~surround_before_hkill

	getWordPos $bot~user_command_line $pos "surround"
	if ($pos > 0)
		setVar $player~surround_before_hkill TRUE
	else
		setVar $player~surround_before_hkill FALSE
	end


	setVar $player~CIT FALSE
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~current_prompt
	setVar $BOT~validPrompts "Citadel Command"
	gosub :BOT~checkStartingPrompt
	gosub :PLAYER~holo_kill
	if ($SWITCHBOARD~message <> "")
		gosub :SWITCHBOARD~switchboard
	end
	halt


#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"

