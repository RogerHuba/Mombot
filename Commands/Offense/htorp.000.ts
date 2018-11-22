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

#===============================START HTORP (HTORP) =================================
:htorp
    gosub :killthetriggers
    gosub :PLAYER~quikstats
    if ($PLAYER~SCAN_TYPE <> "Holo")
        send "'{" $SWITCHBOARD~bot_name "} - You can not run htorp without a holographic scanner.*"
        goto :wait_for_command
    end
    setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
    if ($PLAYER~startingLocation = "Command")
    
    elseif ($PLAYER~startingLocation = "Citadel")
        send "q "
        gosub :PLANET~getPlanetInfo
    else
        echo "*Wrong prompt for htorp.*"
        goto :wait_for_command
    end
    if ($PLAYER~startingLocation = "Citadel")
        send "q szh* l " & $PLANET~PLANET & "* c "
    else
        send "szh* "
    end
    setTextLineTrigger checkForHolo :continueCheckHolo "Select (H)olo Scan or (D)ensity Scan or (Q)uit?"
    setTextLineTrigger checkForDens :photonedhtorp "Relative Density Scan"  
    pause
    :continueCheckHolo
        setTextTrigger htorpsector :continuehtorpsector "[" & $PLAYER~CURRENT_SECTOR & "]"
        pause
    :continuehtorpsector
    if ($PLAYER~PHOTONS <= 0)
        echo ANSI_14 & "*No Photons on hand.**" & ANSI_7
        goto :wait_for_command
    end
    setVar $i 1
    while (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$i] > 0)
        setVar $adj_sec SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$i]
        if (SECTOR.TRADERCOUNT[$ADJ_SEC] > 0)
            setVar $targetInSector FALSE
            setVar $corpMemberInSector FALSE
            setVar $j 1
            while (SECTOR.TRADERS[$ADJ_SEC][$j] <> 0)
                setVar $tempTarget SECTOR.TRADERS[$ADJ_SEC][$j]
                getLength $tempTarget $targetLength
                if ($targetLength >= 4)
                    cutText $tempTarget $targetCorp ($targetLength-4) 999
                    getText $targetCorp $targetCorp "[" "]"
                    if ($targetCorp <> $PLAYER~CORP)
                        setVar $targetInSector TRUE
                    end
                    if ($targetCorp = $PLAYER~CORP)
                        setVar $corpMemberInSector TRUE
                    end
                end
                add $j 1
            end
            if (($targetInSector = TRUE) AND ($corpMemberInSector = FALSE))
                send "c p y " $ADJ_SEC "* *q"
                send "'{" $SWITCHBOARD~bot_name "} - Photon fired into sector " & $ADJ_SEC & "!*"
                goto :wait_for_command
            end
        end
        add $i 1
    end
    if ($PLAYER~startingLocation = "Citadel")
        setTextTrigger waitforcit :continuewaitforcit "Citadel command (?=help)"
        pause
        :continuewaitforcit
    end
    echo ANSI_14 & "*No valid targets**" & ANSI_7
    goto :wait_for_command
:photonedHtorp
    send "'{" $SWITCHBOARD~bot_name "} - You have no holographic scanner, perhaps you were photoned?*"
goto :wait_for_command
#========================== END HTORP SUB ==============================================

:wait_for_command
halt

:killthetriggers
    killalltriggers
return

# includes:
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"