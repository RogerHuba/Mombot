    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $self_command
    loadVar $command
    loadVar $stardock
    loadVar $MAP~stardock
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 
    loadvar $SWITCHBOARD~self_command 

# ======================     START BWARP SUBROUTINES     =================
:Bwarp
:b
    gosub :killthetriggers
    if ($parm1 <> $PLAYER~CURRENT_SECTOR)
        gosub :PLAYER~current_prompt
    else
        gosub :PLAYER~quikstats
    end
    setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $validPrompts "Citadel"
    gosub :checkStartingPrompt
    gosub :travelProtections
    gosub :PLAYER~bwarp
    goto :wait_for_command
# ======================     END BWARP SUBROUTINES     ==========================


:travelProtections
    isNumber $test $parm1
    if ($test = FALSE)
        setVar $SWITCHBOARD~message "Sector must be entered as a number*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    else
        if ($parm2 = "p")
            setVar $warpto_p "p z t *"
            if ($parm1 = $MAP~stardock)
                setVar $warpto_p "p z s h *"
            end
        else
            isNumber $test $parm2
            if ($test = FALSE)
                setVar $warpto_p ""
            else
                setVar $warpto_p $parm2
            end
        end
        setVar $PLAYER~warpto $parm1
        if ($PLAYER~CURRENT_SECTOR = $PLAYER~warpto)
            setVar $SWITCHBOARD~message "Already in that sector!*"
            gosub :SWITCHBOARD~switchboard
            goto :wait_for_command
        elseif (($PLAYER~warpto <= 0) OR ($PLAYER~warpto > SECTORS))
            setVar $SWITCHBOARD~message "Destination sector is out of range!*"
            gosub :SWITCHBOARD~switchboard
            goto :wait_for_command
        end
    end
return


:wait_for_command
halt

:killthetriggers
    killalltriggers
return

:removeFigFromData
    getSectorParameter $target "FIGSEC" $check
    if ($check = TRUE)
        getSectorParameter 2 "FIG_COUNT" $figCount
        setSectorParameter 2 "FIG_COUNT" ($figCount-1)
    end
    setSectorParameter $target "FIGSEC" FALSE
return
:addFigToData
    setSectorParameter $target "FIGSEC" TRUE
return

:checkStartingPrompt
    if ($PLAYER~CURRENT_PROMPT = "0")
        gosub :PLAYER~current_prompt
    end
    getWordPos " "&$validPrompts&" " $pos $PLAYER~CURRENT_PROMPT
    if ($pos <= 0)
        setVar $SWITCHBOARD~message "Invalid starting prompt: ["&$PLAYER~CURRENT_PROMPT&"]. Valid prompt(s) for this command: ["&$validPrompts&"]*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
return

# includes:
include "source\bot_includes\player"
include "source\bot_includes\sector"
include "source\bot_includes\map"
include "source\bot_includes\ship"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
