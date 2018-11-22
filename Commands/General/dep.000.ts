    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadVar $password
    loadVar $letter
    loadvar $self_command
    loadVar $command
    loadVar $stardock
    loadVar $MAP~stardock
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 
    loadvar $SWITCHBOARD~self_command 
    setVar $PLAYER_CASH_MAX     999999999
    setVar $PLANET~CITADEL_CASH_MAX    999999999999999


## ============================== START WITHDRAW (WITH) ==============================
# ============================== START DEPOSIT (DEP) ==============================
:dep
:d
    gosub :bankProtections
    if ($parm1 <= 0)
        setVar $cashToTransfer $PLAYER~CREDITS
    else
        setVar $cashToTransfer $parm1
    end
    send "D"
    waitOn "Citadel treasury contains "
    getWord CURRENTLINE $PLANET~CITADELCash 4
    stripText $PLANET~CITADELCash ","
    if (($cashToTranfer+$PLANET~CITADELCash) >= $PLANET~CITADEL_CASH_MAX)
        setVar $SWITCHBOARD~message "Citadel has too much cash to do transfer (how sad for you)*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
    send "t t "&$cashToTransfer&"* "
    waiton "credits, and the Treasury"
    setVar $SWITCHBOARD~message $cashToTransfer &" credits deposited into citadel.*"
    gosub :SWITCHBOARD~switchboard
goto :wait_for_command
# ============================== END DEPOSIT (DEP) ==============================


:bankProtections
    gosub :PLAYER~quikstats
    setVar $validPrompts "Citadel"
    gosub :checkStartingPrompt
    if ($parm1 = "ss")
        setVar $parm1 ""
    end
    isNumber $test $parm1 
    if ($test = FALSE)
        setVar $SWITCHBOARD~message "Cash entered is not a number, try again.*" 
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command  
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
