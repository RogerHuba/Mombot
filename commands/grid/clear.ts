	gosub :BOT~loadVars
	loadvar $player~surroundlimp
	loadvar $player~surroundmine
	
	setVar $BOT~help[1]  $BOT~tab&"clear - clear all enemy armids and limpets from sector "
	gosub :BOT~help_file
    
    setVar $SWITCHBOARD~bot_name $bot~bot_name
    setVar $SWITCHBOARD~self_command $self_command

    gosub :PLAYER~QUIKSTATS
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    setVar $PROMPT~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $PROMPT~validPrompts "Command Citadel"
    gosub :PROMPT~checkStartingPrompt

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
        halt
    end
    if (($PLAYER~ARMIDS <= 0) AND (($armidOwner <> "belong to your Corp") AND ($armidOwner <> "yours")))
        setVar $SWITCHBOARD~message "Need armids to clear this sector*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
    if ((($limpetOwner = "belong to your Corp") or ($limpetOwner = "yours")) and (($armidOwner = "belong to your Corp") or ($armidOwner = "yours")))
        setVar $SWITCHBOARD~message "Current Sector Already Clear of Enemy Mines!*"
        gosub :SWITCHBOARD~switchboard
        halt
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
        
    halt
    :clear_sector_attemptClearingMines
        setVar $i 0
        while ($i < 10)
            gosub :clear_sector_xenter
            add $i 1
        end
        gosub :clear_sector_deployEquipment
        return
    :clear_sector_xenter
        send "q y n * t* * *" $password "*    *    *       za9999*   z*   "
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

# includes:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\sector"
include "source\bot_includes\map"
include "source\bot_includes\ship"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
