	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"dressup {original text} {new text}"
	setVar $BOT~help[2] $BOT~tab&"    displays all busted sectors on subspace"
	gosub :bot~helpfile

setvar $switchboard~message "Adding costumes..*"
gosub :switchboard~switchboard

AddQuickText("Werewolf","Mind Dagger")

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
