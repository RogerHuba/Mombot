	gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&"xenter - exit/enter to clear sector of enemy mines/fighters "
	gosub :BOT~help_file

# ============================== START EXIT ENTER SUB ==============================    
goto :modules~xenter

#INCLUDES:
include "source\module_includes\bot"
include "source\module_includes\modules"
include "source\bot_includes\player"
include "source\bot_includes\tactics"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"

