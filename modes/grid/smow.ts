    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $self_command
    loadVar $stardock
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 
    loadvar $SWITCHBOARD~self_command 


:safemow
:smow
    gosub :killthetriggers
    gosub :PLAYER~quikstats
    if ($PLAYER~SCAN_TYPE = "None")
        send "'{" $SWITCHBOARD~bot_name "} - Safe Mow can only be run when you have a long range scanner.*"
            goto :wait_for_command
    end
    setVar $bot~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $bot~validPrompts "Command <Underground> Do How Corporate Citadel Planet Computer Terra <StarDock> <FedPolice> <Tavern> <Libram <Galactic <Hardware <Shipyards>"
    gosub :bot~checkStartingPrompt
    if ($PLAYER~startingLocation = "Command")
        gosub :SHIP~getShipStats
    elseif ($SHIP~SHIP_MAX_ATTACK <= 0)
        setVar $SHIP~SHIP_MAX_ATTACK 99991111
    end
    setVar $PLAYER~destination $parm1
    isNumber $number $PLAYER~destination
    if ($number <> 1)
        send "'{" $SWITCHBOARD~bot_name "} - Sector entered is not a number, cannot mow!*"
        goto :wait_for_command
    elseif (($PLAYER~destination <= 0) OR ($PLAYER~destination > SECTORS))
        send "'{" $SWITCHBOARD~bot_name "} - Sector entered is not valid, cannot mow!*"
        goto :wait_for_command
    end
    if ($parm2 = "p")
        setVar $are_we_docking TRUE
    else
        if ($parm3 = "p")
            setVar $are_we_docking TRUE
        else
            setVar $are_we_docking FALSE
        end
    end
    setVar $figsToDrop $parm2
    isNumber $number $figsToDrop
    if ($number <> 1)
        if ($parm2 <> "p")
            send "'{" $SWITCHBOARD~bot_name "} - Fighters to drop entered is not a number, cannot mow!*"
            goto :wait_for_command
        end
        setVar $figsToDrop 0
    elseif ($figsToDrop > 50000)
        send "'{" $SWITCHBOARD~bot_name "} - Cannot drop more than 50,000 fighters per sector!*"
        goto :wait_for_command
    end
    if ($SHIP~SHIP_MAX_ATTACK > $PLAYER~FIGHTERS)
        setVar $SHIP~SHIP_MAX_ATTACK 9999
    end
    gosub :player~getCourse
    if ($PLAYER~courseLength <= 0)
        halt
    end

    setVar $j 3
    setVar $result "q q q * "
    setVar $isSafe TRUE
    while (($j <= $PLAYER~courseLength) AND ($isSafe))
        setVar $nextSafeSector $PLAYER~mowCourse[$j]
        send "sd"
        gosub :PLAYER~quikstats
                setVar $safeDensityValue 0
                if (PORT.EXISTS[$nextSafeSector] = TRUE)
                    add $safeDensityValue 100
                end
                if ((SECTOR.FIGS.QUANTITY[$nextSafeSector] > 0) AND ((SECTOR.FIGS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.FIGS.OWNER[$nextSafeSector] = "belong to your Corp")))
                    add $safeDensityValue (SECTOR.FIGS.QUANTITY[$nextSafeSector] * 5)
                end
                if ((SECTOR.LIMPETS.QUANTITY[$nextSafeSector] > 0) AND ((SECTOR.LIMPETS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.LIMPETS.OWNER[$nextSafeSector] = "belong to your Corp")) AND (SECTOR.ANOMALY[$nextSafeSector] = TRUE))
                    add $safeDensityValue (SECTOR.LIMPETS.QUANTITY[$nextSafeSector] * 3)
                end
                if ((SECTOR.MINES.QUANTITY[$nextSafeSector] > 0) AND ((SECTOR.MINES.OWNER[$nextSafeSector] = "yours") OR (SECTOR.MINES.OWNER[$nextSafeSector] = "belong to your Corp")))
                    add $safeDensityValue (SECTOR.MINES.QUANTITY[$nextSafeSector] * 2)
                end
                setVar $densitySafe ((SECTOR.DENSITY[$nextSafeSector] <= 0) OR (SECTOR.DENSITY[$nextSafeSector] = $safeDensityValue))
                if ($densitySafe <> TRUE)
                    if ($PLAYER~SCAN_TYPE = "Holo")
                        send "sh"
                        gosub :PLAYER~quikstats
                    end    
                    setVar $minesSafe ((SECTOR.MINES.QUANTITY[$nextSafeSector] <= 0) OR (((SECTOR.MINES.OWNER[$nextSafeSector] = "yours") OR (SECTOR.MINES.OWNER[$nextSafeSector] = "belong to your Corp"))))
                    setVar $figsSafe  ((SECTOR.FIGS.QUANTITY[$nextSafeSector] <= 0) OR (((SECTOR.FIGS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.FIGS.OWNER[$nextSafeSector] = "belong to your Corp"))))
                    setVar $planetSafe ((SECTOR.PLANETCOUNT[$nextSafeSector] <= 0) OR (($nextSafeSector = $MAP~stardock) OR ($nextSafeSector <= 10)))
                    setVar $navHazSafe (SECTOR.NAVHAZ[$nextSafeSector] <= 0)
                    setVar $limpetsSafe (SECTOR.ANOMALY[$nextSafeSector] = FALSE) OR ((((SECTOR.LIMPETS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.LIMPETS.OWNER[$nextSafeSector] = "belong to your Corp"))))
                end
                if ($densitySafe OR ($limpetsSafe AND $figsSafe AND $minesSafe AND $navHazSafe AND $planetSafe))
                        send "m "&$PLAYER~mowCourse[$j]&"* "
                else
                        send "'{" $SWITCHBOARD~bot_name "} - Cannot safely move into sector "&$nextSafeSector&"*"
                        goto :wait_for_command
                end
        if (($figsToDrop > 0) AND ($PLAYER~mowCourse[$j] > 10) AND ($PLAYER~mowCourse[$j] <> $MAP~stardock) AND ($j > 2))
            send "f "&$figsToDrop&" * c d "
            setVar $target $PLAYER~mowCourse[$j]
            gosub :player~addfigtodata
        end
        add $j 1
    end
    setVar $docking_instructions ""
    if ($are_we_docking)
        setVar $docking_instructions " p z t *"
        if ($PLAYER~destination = $MAP~stardock)
            setVar $docking_instructions " p z s g y g q h *"
        end
        send $docking_instructions
    end
    gosub :PLAYER~quikstats
    if ($PLAYER~CURRENT_SECTOR <> $PLAYER~destination)
        send "'{" $SWITCHBOARD~bot_name "} - Safe mow did not reach destination!*"
    else
        send "'{" $SWITCHBOARD~bot_name "} - Safe mow completed.*"
    end
    goto :wait_for_command


:wait_for_command
halt

:killthetriggers
    killalltriggers
return

# includes:
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\checkstartingprompt\bot"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\player\getcourse\player"
include "source\bot_includes\player\addfigtodata\player"
