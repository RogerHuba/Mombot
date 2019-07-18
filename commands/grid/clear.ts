	gosub :BOT~loadVars
	loadvar $player~surroundlimp
	loadvar $player~surroundmine
	
	setVar $BOT~help[1]  $BOT~tab&"clear - clear all enemy armids and limpets from sector "
	gosub :BOT~help_file
    
    setVar $SWITCHBOARD~bot_name $bot~bot_name
    setVar $SWITCHBOARD~self_command $self_command

    goto :modules~clear

# includes:
include "source\module_includes\bot"
include "source\module_includes\modules"
