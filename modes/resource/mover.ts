# MD Planet Resource
	reqRecording
	logging off
	gosub :BOT~loadVars
	setVar $BOT~command "mover"
	loadVar $BOT~bot_turn_limit

	setVar $BOT~help[1]  $BOT~tab&"mover [strip|dump] [planet#|all] {f} {o} {e} {fc} {oc} {ec} {fig} {turbo}"
	setVar $BOT~help[2]  $BOT~tab&"        "
	setVar $BOT~help[3]  $BOT~tab&"Script for changing planetary resources."
	setVar $BOT~help[4]  $BOT~tab&"            "
	setVar $BOT~help[5]  $BOT~tab&"Options:"
	setVar $BOT~help[6]  $BOT~tab&"  [strip] - strips resources from one planet to another"
	setVar $BOT~help[7]  $BOT~tab&"   [dump] - jettisons resources from planets"
	setVar $BOT~help[8]  $BOT~tab&"  [#|all] - Planet number or all to strip all planets in sector."
	setVar $BOT~help[9]  $BOT~tab&"      {f} - fuel ore"
	setVar $BOT~help[10] $BOT~tab&"      {o} - organics"
	setVar $BOT~help[11] $BOT~tab&"      {e} - equipment"
	setVar $BOT~help[12] $BOT~tab&"     {fc} - fuel ore colonists"
	setVar $BOT~help[13] $BOT~tab&"     {oc} - organic colonists"
	setVar $BOT~help[14] $BOT~tab&"     {ec} - equipment colonists"
	setVar $BOT~help[15] $BOT~tab&"    {fig} - fighters (strip only)"
	setVar $BOT~help[16] $BOT~tab&"  {turbo} - Does all in a macro burst"
	gosub :bot~helpfile

	if ($BOT~parm1 = "strip")
		gosub :strip~strip
	elseif ($BOT~parm1 = "dump")
		gosub :dump~dump
	else
		setVar $SWITCHBOARD~message "Must choose strip or dump in order to run resource script.*"
		gosub :SWITCHBOARD~switchboard
	end
	halt

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\strip"
include "source\module_includes\dump"
