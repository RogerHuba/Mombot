:clear
	gosub :PLAYER~QUIKSTATS
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ((currentsector = $map~stardock) or (currentsector <= 10))
		setVar $SWITCHBOARD~message "Can't clear fedspace.*"
		gosub :SWITCHBOARD~switchboard
		return
	end
	setVar $bot~validPrompts "Command Citadel"
	gosub :bot~checkStartingPrompt

	if ($startingLocation = "Citadel")
		send "q"
		gosub :PLANET~getPlanetInfo
		send "c  s*"
	else
		send "*"
	end
	setVar $beforeLimpets $PLAYER~LIMPETS
	setVar $beforeArmids  $PLAYER~ARMIDS
	setVar $placedLimpet FALSE
	setVar $placedArmid FALSE
	waitOn "Warps to Sector(s) :"
	setVar $limpetOwner SECTOR.LIMPETS.OWNER[$PLAYER~CURRENT_SECTOR]
	setVar $armidOwner SECTOR.MINES.OWNER[$PLAYER~CURRENT_SECTOR]
	if (($PLAYER~LIMPETS <= 0) AND (($limpetOwner <> "belong to your Corp") AND ($limpetOwner <> "yours")))
		setVar $SWITCHBOARD~message "Need limpets to clear this sector*"
		gosub :SWITCHBOARD~switchboard
		return 
	end
	if (($PLAYER~ARMIDS <= 0) AND (($armidOwner <> "belong to your Corp") AND ($armidOwner <> "yours")))
		setVar $SWITCHBOARD~message "Need armids to clear this sector*"
		gosub :SWITCHBOARD~switchboard
		return
	end
	if ((($limpetOwner = "belong to your Corp") or ($limpetOwner = "yours")) and (($armidOwner = "belong to your Corp") or ($armidOwner = "yours")))
		setVar $SWITCHBOARD~message "Current Sector Already Clear of Enemy Mines!*"
		gosub :SWITCHBOARD~switchboard
		return
	end
	setvar $switchboard~message "Clearing Current Sector*"
	gosub :SWITCHBOARD~switchboard
	send "q qq z n *  "
	gosub :clear_sector_deployEquipment
	while (($placedLimpet = FALSE) OR ($placedArmid = FALSE))
		gosub :clear_sector_attemptClearingMines
	end
	if ($startingLocation = "Citadel")
		setVar $SWITCHBOARD~bot_name $bot~bot_name
		gosub :PLANET~landingSub
	end
	setSectorParameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
	setSectorParameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
	setvar $switchboard~message "Sector Cleared*"
	gosub :SWITCHBOARD~switchboard
		
	return
	:clear_sector_attemptClearingMines
		setVar $i 0
		while ($i < 10)
			gosub :clear_sector_xenter
			add $i 1
		end
		gosub :clear_sector_deployEquipment
		return
	:clear_sector_xenter
		send "q y n * t* * *" $bot~password "*    *    *       za9999*   z*   "
		return
	:clear_sector_deployEquipment
		if ($player~surroundmine <= 0)
			setvar $player~surroundmine 1
		end
		if ($player~surroundlimp <= 0)
			setvar $player~surroundlimp 1
		end

		if ($PLAYER~ARMIDS < $player~surroundmine)
			setVar $minesToDeploy $PLAYER~ARMIDS
		else
			setVar $minesToDeploy $player~surroundmine
		end
		if ($PLAYER~LIMPETS < $player~surroundlimp)
			setVar $limpsToDeploy $PLAYER~LIMPETS
		else
			setVar $limpsToDeploy $player~surroundlimp
		end
		setVar $clearMac ""
		if (($armidOwner <> "belong to your Corp") AND ($armidOwner <> "yours"))
			setVar $clearMac $clearMac&"h  1  z " & $minesToDeploy & "*  z c  *  "
		end
		if (($limpetOwner <> "belong to your Corp") AND ($limpetOwner <> "yours"))
			setVar $clearMac $clearMac&"h  2  z " & $limpsToDeploy & "*  z c  *   "
		end
		send $clearMac
		gosub :PLAYER~quikstats
		if (($beforeLimpets > $PLAYER~LIMPETS) OR (($limpetOwner = "belong to your Corp") OR ($limpetOwner = "yours")))
			setVar $placedLimpet TRUE
		end
		if (($beforeArmids > $PLAYER~ARMIDS) OR (($armidOwner = "belong to your Corp") OR ($armidOwner = "yours")))
			setVar $placedArmid TRUE
		end
		return
halt

include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\checkstartingprompt\bot"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\planet\landingsub\planet"
