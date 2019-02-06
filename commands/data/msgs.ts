gosub :BOT~loadVars

#HELP FILE
     setVar $BOT~help[1]  $BOT~tab&"msgs {d}  "
     setVar $BOT~help[2]  $BOT~tab&"   Options: "
     setVar $BOT~help[3]  $BOT~tab&"        d - Deletes messages in inbox "
     gosub :BOT~help_file


gosub :player~quikstats
if ($player~current_prompt <> "Command") and ($player~current_prompt <> "Citadel")
	setvar $switchboard~message "MSGS Must be run from Command or Citadel Prompts*"
	halt
end
if ($bot~parm1 = "d")
	send "c m a * q :y"
	waiton "Delete messages?"
	setTextLineTrigger	DELETED	:DELETED	"Deleted"
	setTextTrigger		NADDA	:NADDA		"elp)"
	pause

	:DELETED
	killAllTriggers
	setVar $TEMP CURRENTLINE
	# This is crazy. Including $TEMP (untouched) in the SS msg somehow
	# included hidden ansi chars and cause the sent text to backspace
	# and erase all text and even cancel the ss msg. So, I had to recreate
	# the Deleted msgs, msg. to get it to work. sheesh
	gettext $TEMP $one "Deleted" "of"
	stripText $one " "
	getText $TEMP $two "of" "messages"
	stripText $two " "
	waiton "elp)"
	send "'"
	waiton "[<ENTER> for multiple lines]"
	send ("{" & $bot~bot_name & "} - Deleted "&$one&" of "&$two&" messages*")
	waiton "Message sent on sub-space channel"
	:NADDA
	killalltriggers
	halt
else
	send "cm"
	waiton "<Read messages>"
	setTextTrigger	1	:Pause	"[Pause]"
	setTextTrigger	2	:Pause	"[Press Space or Enter to continue]"
	setTextTrigger	3	:Fini	"Computer command ["
	pause
	:Pause
	killTrigger 1
	killTrigger 2
	setTextTrigger	1	:Pause	"[Pause]"
	setTextTrigger	2	:Pause	"[Press Space or Enter to continue]"
	send "*"
	pause
	:fini
	killAllTriggers
	send "q"
end
halt


#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"


