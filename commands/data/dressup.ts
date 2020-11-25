	gosub :BOT~loadVars

setvar $switchboard~message "Adding costumes..*"
gosub :switchboard~switchboard

AddQuickText "Werewolf" "Mind Dagger"
AddQuickText "Minotaur" "Hammer"

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
