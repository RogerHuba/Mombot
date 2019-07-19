	gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&"xenter - exit/enter to clear sector of enemy mines/fighters "
	gosub :bot~helpfile

# ============================== START EXIT ENTER SUB ==============================    
goto :modules~xenter

#INCLUDES:
include "source\module_includes\bot"
include "source\module_includes\modules"
