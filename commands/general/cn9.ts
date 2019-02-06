	gosub :BOT~loadVars
	loadvar $bot~username
	loadvar $bot~letter
	loadvar $bot~password
	loadvar $BOT~subspace
		
	setVar $BOT~help[1] $BOT~tab&"cn9"
	setVar $BOT~help[2] $BOT~tab&"  - Resets the cn settings in the game to bot desirable settings."
	gosub :BOT~help_file


    gosub :PLAYER~current_prompt
    setVar $BOT~validPrompts "Citadel Command Computer"
    gosub :bot~checkStartingPrompt
    if ($PLAYER~startingLocation = "Computer")
        send "q"
    end
    gosub :player~startCNsettings
    setVar $SWITCHBOARD~message "CN Settings are reset for this bot.*"
    gosub :SWITCHBOARD~switchboard
	halt
    



#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\map"
include "source\bot_includes\bot\connectivity"
