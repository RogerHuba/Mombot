    gosub :BOT~loadVars


    setVar $BOT~help[1]  $BOT~tab&"dep {cash to deposit} "
    setVar $BOT~help[2]  $BOT~tab&"  Deposits cash into citadel treasury."
	setVar $BOT~help[3]  $BOT~tab&"        default is max credits possible"
    gosub :bot~helpfile

    setVar $PLAYER_CASH_MAX     999999999
    setVar $PLANET~CITADEL_CASH_MAX    999999999999999


## ============================== START WITHDRAW (WITH) ==============================
# ============================== START DEPOSIT (DEP) ==============================
:dep
:d
    gosub :bankProtections
    if ($bot~parm1 <= 0)
        setVar $cashToTransfer $PLAYER~CREDITS
    else
        setVar $cashToTransfer $bot~parm1
    end
    send "D"
    waitOn "Citadel treasury contains "
    getWord CURRENTLINE $PLANET~CITADELCash 4
    stripText $PLANET~CITADELCash ","
    if (($cashToTranfer+$PLANET~CITADELCash) >= $PLANET~CITADEL_CASH_MAX)
        setVar $SWITCHBOARD~message "Citadel has too much cash to do transfer (how sad for you)*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
    send "t t "&$cashToTransfer&"* "
    waiton "credits, and the Treasury"
    setvar $map~value $cashtotransfer
    gosub :map~commas
    setvar $cashtotransfer $map~value
    setVar $SWITCHBOARD~message $cashToTransfer &" credits deposited into citadel.*"
    gosub :SWITCHBOARD~switchboard
halt
# ============================== END DEPOSIT (DEP) ==============================


:bankProtections
    gosub :PLAYER~quikstats
    setVar $validPrompts "Citadel"
    gosub :checkStartingPrompt
    if ($bot~parm1 = "ss")
        setVar $bot~parm1 ""
    end
    isNumber $test $bot~parm1 
    if ($test = FALSE)
        setVar $SWITCHBOARD~message "Cash entered is not a number, try again.*" 
        gosub :SWITCHBOARD~switchboard
        halt  
    end
return



:checkStartingPrompt
    if ($PLAYER~CURRENT_PROMPT = "0")
        gosub  :player~currentPrompt
    end
    getWordPos " "&$validPrompts&" " $pos $PLAYER~CURRENT_PROMPT
    if ($pos <= 0)
        setVar $SWITCHBOARD~message "Invalid starting prompt: ["&$PLAYER~CURRENT_PROMPT&"]. Valid prompt(s) for this command: ["&$validPrompts&"]*"
        gosub :SWITCHBOARD~switchboard
        halt
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
