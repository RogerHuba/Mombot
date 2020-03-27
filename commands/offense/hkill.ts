	logging off
	gosub :BOT~loadVars
	 gosub :combat~init 

	setVar $BOT~help[1] $BOT~tab&"hkill {surround} "
	setVar $BOT~help[2] $BOT~tab&"  - Holoscans and then kills if enemy in adjacent sector."
	gosub :bot~helpfile

	loadvar $player~surround_before_hkill

	getWordPos $bot~user_command_line $pos "surround"
	if ($pos > 0)
		setVar $player~surround_before_hkill TRUE
	else
		if ($player~surround_before_hkill <> true)
			setVar $player~surround_before_hkill FALSE
		end
	end


	setVar $player~CIT FALSE
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~current_prompt
	setVar $BOT~validPrompts "Citadel Command"
	gosub :BOT~checkStartingPrompt
	gosub :combat~holo_kill
	if ($SWITCHBOARD~message <> "")
		gosub :SWITCHBOARD~switchboard
	end
	halt


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\combat\holokill\combat"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\sector\getautosectordata\sector"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\checkstartingprompt\bot"
