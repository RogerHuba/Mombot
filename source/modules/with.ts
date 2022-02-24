    gosub :BOT~loadVars


    setVar $BOT~help[1]  $BOT~tab&"with {cash to withdrawl} "
    setVar $BOT~help[2]  $BOT~tab&"  Withdrawls cash from citadel treasury.
	setVar $BOT~help[3]  $BOT~tab&"        default is max credits possible"
    gosub :bot~helpfile

    setVar $PLAYER_CASH_MAX     999999999
    setVar $PLANET~CITADEL_CASH_MAX    999999999999999


## ============================== START WITHDRAW (WITH) ==============================
:with
:w
    gosub :bankProtections
    if ($parm1 > $PLAYER_CASH_MAX)
        setVar $SWITCHBOARD~message "Can't withdraw more than 1 bil at a time*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
    if ($parm1 <= 0)
        setVar $cashToTransfer $PLAYER_CASH_MAX
    else
        setVar $cashToTransfer $parm1
    end
    send "D" 
    waitOn "Citadel treasury contains "
    getWord CURRENTLINE $PLANET~CITADELCash 4
    stripText $PLANET~CITADELCash ","
    if (($PLAYER~CREDITS+$cashToTransfer) > $PLAYER_CASH_MAX)
        setVar $cashToTransfer ($PLAYER_CASH_MAX-$PLAYER~CREDITS)
    end
    if ($PLANET~CITADELCash < $cashToTransfer)
        setVar $cashToTransfer $PLANET~CITADELCash
    end
    send "t f "&$cashToTransfer&"* "
    waiton "credits, and the Treasury"
    setVar $SWITCHBOARD~message $cashToTransfer &" credits taken from citadel.*"
    gosub :SWITCHBOARD~switchboard
goto :wait_for_command
# ============================== END WITHDRAW (WITH) ==============================
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
        gosub  :player~currentPrompt
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
