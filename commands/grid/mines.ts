	gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&"mines - place corporate armids and limpets in sector "
	gosub :bot~helpfile
# ============================== MINES (ARMID AND LIMP) SUB ==============================
:mines

	
	gosub :PLAYER~QUIKSTATS

	if ((currentsector = $map~stardock) OR (currentsector <= 10))
		setVar $SWITCHBOARD~message "Can't deploy into Fed Space!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $bot~startingLocation $PLAYER~CURRENT_PROMPT
	getWord $bot~user_command_line $bot~parm1 1 "NONE"
	if ($bot~parm1 = "NONE")
		setVar $bot~parm1 3
	end
	setVar $bot~validPrompts "Command Citadel"
	gosub :bot~checkStartingPrompt
	if ($bot~startingLocation = "Citadel")
		send "q "
		gosub :PLANET~getPlanetInfo
		send "c "
	end
	setVar $preDeployArmids currentarmids
	setvar $preDeployLimpets currentlimpets
	if ($bot~startingLocation = "Citadel")
		send "s* "
		setVar $start_mac "q q "
		setVar $end_mac "l "&$planet~planet&"* c s* "
	else
		send "** "
		setVar $start_mac ""
		setVar $end_mac "** "
	end
	waitOn "Warps to Sector(s) :"
	setVar $limpetOwner SECTOR.LIMPETS.OWNER[currentsector]
	setVar $armidOwner SECTOR.MINES.OWNER[currentsector]
	if ((currentarmids <= 0) AND (($armidOwner <> "belong to your Corp") AND ($armidOwner <> "yours")))
		setVar $SWITCHBOARD~message "Out of armids!*"
		gosub :SWITCHBOARD~switchboard
		halt
	elseif ($bot~parm1 > currentarmids)
		setVar $bot~parm1 currentarmids
	end
	if ((currentlimpets <= 0) AND (($limpetOwner <> "belong to your Corp") AND ($limpetOwner <> "yours")))
		setVar $SWITCHBOARD~message "Out of limpets!*"
		gosub :SWITCHBOARD~switchboard
		halt
	elseif ($bot~parm1 > currentlimpets)
		setVar $bot~parm1 currentlimpets
	end
	send $start_mac "z n h 2 z " $bot~parm1 "*  zc * * h 1 z " $bot~parm1 "*  z c * * * " $end_mac
	gosub :PLAYER~quikstats
	
	
	if ((($predeployArmids > currentarmids) AND ($predeployLimpets > currentlimpets)) OR (($predeployLimpets = currentlimpets) AND (($limpetOwner = "belong to your Corp") OR ($limpetOwner = "yours")) AND ($predeployArmids = currentarmids) AND (($armidOwner = "belong to your Corp") OR ($armidOwner = "yours"))))
		setVar $SWITCHBOARD~message $bot~parm1&" Armid and Limpet mines deployed into the sector!*"
		gosub :SWITCHBOARD~switchboard
		setSectorParameter currentsector "LIMPSEC" TRUE
		setSectorParameter currentsector "MINESEC" TRUE
	elseif ($predeployArmids > currentarmids)
		setVar $SWITCHBOARD~message $bot~parm1&" Armid mine(s) deployed into the sector!*"
		gosub :SWITCHBOARD~switchboard
		setSectorParameter currentsector "MINESEC" TRUE
	elseif ($predeployLimpets > currentlimpets)
		setVar $SWITCHBOARD~message $bot~parm1&" Limpet mine(s) deployed into the sector!*"
		gosub :SWITCHBOARD~switchboard
		setSectorParameter currentsector "LIMPSEC" TRUE
	end
	if ($predeployArmids < currentarmids)
		setVar $SWITCHBOARD~message (currentarmids-$predeployArmids)&" Armid mines picked up from sector!*"
		gosub :SWITCHBOARD~switchboard
	elseif (($predeployArmids = currentarmids) AND (($armidOwner <> "belong to your Corp") AND ($armidOwner <> "yours")))
		setVar $SWITCHBOARD~message "Enemy armid(s) present in sector, cannot deploy!*"
		gosub :SWITCHBOARD~switchboard
	end
	if ($predeployLimpets < currentlimpets)
		setVar $SWITCHBOARD~message (currentlimpets-$predeployLimpets)&" Limpet mines picked up from sector!*"
		gosub :SWITCHBOARD~switchboard
	elseif (($predeployLimpets = currentlimpets) AND (($limpetOwner <> "belong to your Corp") AND ($limpetOwner <> "yours")))
		setVar $SWITCHBOARD~message "Enemy limpet(s) present in sector, cannot deploy!*"
		gosub :SWITCHBOARD~switchboard
	end
	halt
# ============================== END MINES (ARMID AND LIMP) SUB ==============================

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\checkstartingprompt\bot"
include "source\bot_includes\planet\getplanetinfo\planet"
