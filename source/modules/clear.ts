    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $self_command
    loadVar $stardock
    loadVar $password
    loadVar $PLANET~PLANET

    killalltriggers
    
    setVar $SWITCHBOARD~bot_name $bot_name
    setVar $SWITCHBOARD~self_command $self_command

    gosub :PLAYER~QUIKSTATS
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    setVar $bot~startingLocation $PLAYER~CURRENT_PROMPT
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
    send "'{" $bot_name "} - Clearing Current Sector*"
    send "q qq z n *  "
    gosub :clear_sector_deployEquipment
    while (($placedLimpet = FALSE) OR ($placedArmid = FALSE))
        gosub :clear_sector_attemptClearingMines
    end
    if ($startingLocation = "Citadel")
        setVar $SWITCHBOARD~bot_name $bot_name
        gosub :PLANET~landingSub
    end
    setSectorParameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
    setSectorParameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
    send "'{" $bot_name "} - Sector Cleared*"
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
        if ($PLAYER~ARMIDS < 3)
            setVar $minesToDeploy $PLAYER~ARMIDS
        else
            setVar $minesToDeploy 3
        end
        if ($PLAYER~LIMPETS < 3)
            setVar $limpsToDeploy $PLAYER~LIMPETS
        else
            setVar $limpsToDeploy 3
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
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
