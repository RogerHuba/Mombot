	gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&"xenter - exit/enter to clear sector of enemy mines/fighters "
	gosub :bot~helpfile

# ============================== START EXIT ENTER SUB ==============================    
goto :modules~xenter
goto :bot~wait_for_command

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\modules\xenter\modules"
include "source\module_includes\bot\wait_for_command\bot"
