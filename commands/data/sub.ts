	gosub :BOT~loadVars
	setVar $BOT~help[1]  $BOT~tab&"sub {original text} {replace text} "
	setVar $BOT~help[2]  $BOT~tab&"      "
	setVar $BOT~help[3]  $BOT~tab&"  Will replace game text for this bot. "
	setVar $BOT~help[4]  $BOT~tab&"         "
	gosub :bot~helpfile



	if ($bot~parm1 = "clear")
		clearQuickText
	else
		addQuickText $bot~parm1 $bot~parm2
		setvar $switchboard~message "All instances of "&$bot~parm1&" will show up as "&$bot~parm2&" for this bot.*"
		gosub :switchboard~switchboard
	end




	halt

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
