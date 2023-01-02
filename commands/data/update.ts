	logging off
	gosub :BOT~loadVars
	loadvar $bot~LIMP_COUNT_FILE
	loadVar $bot~ARMID_COUNT_FILE
	loadVar $bot~LIMP_FILE
	loadVar $bot~ARMID_FILE

	setVar $BOT~help[1]  $BOT~tab&" update {figs} {limps} {armids} {cim} {warps}"
	setVar $BOT~help[2]  $BOT~tab&"   "
	setVar $BOT~help[3]  $BOT~tab&"     Checks deployment lists and sets sector"
	setVar $BOT~help[4]  $BOT~tab&"     parameters.  Shows differences since last"
	setVar $BOT~help[5]  $BOT~tab&"     update"
	setVar $BOT~help[6]  $BOT~tab&"     "
	setVar $BOT~help[7]  $BOT~tab&"     {figs} - fighter refresh"
	setVar $BOT~help[8]  $BOT~tab&"    {limps} - limpet refresh, including active"
	setVar $BOT~help[9]  $BOT~tab&"   {armids} - armid refresh"
	setVar $BOT~help[10] $BOT~tab&"      {cim} - will refresh port report"
	setVar $BOT~help[11] $BOT~tab&"      - optional: [upgrade level]"
	setVar $BOT~help[12] $BOT~tab&"    {warps} - will refresh warp info"
	setVar $BOT~help[13] $BOT~tab&"                                            "
	setVar $BOT~help[14] $BOT~tab&"     Examples:"
	setVar $BOT~help[15] $BOT~tab&"            >update figs limps armids"
	setVar $BOT~help[16] $BOT~tab&"            >update figs cim warps"
	setVar $BOT~help[17] $BOT~tab&"            >update all"
	setVar $BOT~help[18] $BOT~tab&"            >update cim warps"
	setVar $BOT~help[19] $BOT~tab&"            >figs"
	setVar $BOT~help[20] $BOT~tab&"            >limps"
	setVar $BOT~help[21] $BOT~tab&"            >cim 10000"

	gosub :bot~helpfile

	setVar $BOT~script_title "Update"
	setVar $BOT~script_version "1.0.1"
	gosub :BOT~banner

# ============================== START REFRESH LIMPETS (LIMPS) ==============================
	
	getwordpos " "&$bot~user_command_line&" " $pos " all "
	if ($pos > 0)
		setvar $fighter true
		setvar $limpet true
		setvar $armid true
		setvar $cim true
		setvar $warp true
	end
	
	getwordpos " "&$bot~user_command_line&" " $pos " figs "
	if ($pos > 0)
		setvar $fighter true
	end

	getwordpos " "&$bot~user_command_line&" " $pos " limps "
	if ($pos > 0)
		setvar $limpet true
	end

	getwordpos " "&$bot~user_command_line&" " $pos " armids "
	getwordpos " "&$bot~user_command_line&" " $pos2 "mine"
	if (($pos > 0) or ($pos2 > 0))
		setvar $armid true
		setvar $lift_needed true
	end

	getwordpos " "&$bot~user_command_line&" " $pos " cim "
	if ($pos > 0)
		setvar $cim true
	end

	getwordpos " "&$bot~user_command_line&" " $pos " warps "
	if ($pos > 0)
		setvar $warp true
	end

	if (($fighter <> true) and ($armid <> true) and ($limpet <> true) and ($cim <> true) and ($warp <> true))
		setvar $fighter true
		setvar $limpet true
		setvar $armid true
	end

	gosub  :player~currentPrompt
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation = "Planet") or ($startingLocation = "Citadel")) and (($fighters) or ($limpet) or ($armid))
		setvar $lift_needed true
	end
	
	if ($startingLocation = "Command")

	elseif ($startingLocation = "Citadel") and ($lift_needed)
		send "q"
		gosub :PLANET~getPlanetInfo
		send "q"
	elseif ($startingLocation = "Planet") and ($lift_needed)
		gosub :PLANET~getPlanetInfo
		send "q"
	elseif ($lift_needed)
		setVar $SWITCHBOARD~message "Unknown Prompt*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	gosub :PLAYER~turnOffAnsi

	if ($fighter)
		gosub :fighters~update
	end
	if ($armid)
		gosub :armids~update
	end
	if ($limpet)
		gosub :limpets~update
	end
	if ($lift_needed)
		gosub :PLANET~landingsub
	end
	if ($cim)
		gosub :cim~update
	end
	if ($warp)
		gosub :warps~update
	end

	gosub :PLAYER~turnOnAnsi

	setvar $switchboard~message ""
	if ($fighter)
		gosub :fighters~report
	end
	if ($armid)
		gosub :armids~report
	end
	if ($limpet)
		gosub :limpets~report
	end
	if ($SWITCHBOARD~self_command = FALSE)
		setVar $SWITCHBOARD~self_command 2
	end
		gosub :SWITCHBOARD~switchboard

halt
#===================================== END REFRESH LIMPS ========================================


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\currentprompt\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\player\turnoffansi\player"
include "source\bot_includes\player\turnonansi\player"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\landingsub\planet"
include "source\module_includes\update\limpets"
include "source\module_includes\update\fighters"
include "source\module_includes\update\armids"
include "source\module_includes\update\cim"
include "source\module_includes\update\warps"
include "source\bot_includes\player\formatnumberforspaces\player"
include "source\bot_includes\player\formatpercentagesforspaces\player"

