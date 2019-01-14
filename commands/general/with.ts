    gosub :BOT~loadVars


    setVar $BOT~help[1]  $BOT~tab&"with {cash to withdrawl} "
    setVar $BOT~help[2]  $BOT~tab&"  Withdrawls cash from citadel treasury."
	setVar $BOT~help[3]  $BOT~tab&"        default is max credits possible"
    gosub :BOT~help_file

    setVar $PLAYER_CASH_MAX     999999999
    setVar $planet~citadel_CASH_MAX    999999999999999


## ============================== START WITHDRAW (WITH) ==============================
:with
:w
    gosub :bankProtections
    if ($bot~parm1 > $PLAYER_CASH_MAX)
        setVar $SWITCHBOARD~message "Can't withdraw more than 1 bil at a time*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
    if ($bot~parm1 <= 0)
        setVar $cashToTransfer $PLAYER_CASH_MAX
    else
        setVar $cashToTransfer $bot~parm1
    end
    send "D" 
    waitOn "Citadel treasury contains "
    getWord CURRENTLINE $planet~citadelCash 4
    stripText $planet~citadelCash ","
    if (($PLAYER~CREDITS+$cashToTransfer) > $PLAYER_CASH_MAX)
        setVar $cashToTransfer ($PLAYER_CASH_MAX-$PLAYER~CREDITS)
    end
    if ($planet~citadelCash < $cashToTransfer)
        setVar $cashToTransfer $planet~citadelCash
    end
    send "t f "&$cashToTransfer&"* "
    waiton "credits, and the Treasury"
    setvar $map~value $cashtotransfer
    gosub :map~commas
    setvar $cashtotransfer $map~value
    setVar $SWITCHBOARD~message $cashToTransfer &" credits taken from citadel.*"
    gosub :SWITCHBOARD~switchboard
halt
# ============================== END WITHDRAW (WITH) ==============================
:bankProtections
    gosub :PLAYER~quikstats
    setVar $validPrompts "Citadel"
    gosub :bot~checkstartingprompt
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






# includes:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\sector"
include "source\bot_includes\map"
include "source\bot_includes\ship"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
