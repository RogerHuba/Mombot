loadVar $bot~command
loadVar $MAP~stardock
gosub :BOT~loadVars
loadVar $PLAYER~unlimitedGame        
loadvar $SWITCHBOARD~bot_name 
loadvar $SWITCHBOARD~self_command 

gosub :search~find
halt

# includes:
include "source\module_includes\bot"
include "source\module_includes\search"
include "source\bot_includes\player"
include "source\bot_includes\sector"
include "source\bot_includes\map"
include "source\bot_includes\ship"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
