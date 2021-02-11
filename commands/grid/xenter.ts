gosub :BOT~loadVars

# ============================== START EXIT ENTER SUB ==============================    
goto :modules~xenter
halt

:bot~wait_for_command
	setVar $BOT~help[1]  $BOT~tab&"xenter - exit/enter to clear sector of enemy mines/fighters "
	gosub :bot~helpfile
halt

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\checkstartingprompt\bot"
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\modules\xenter\modules"
