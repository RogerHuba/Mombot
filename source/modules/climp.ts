     loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $SWITCHBOARD~self_command
    loadvar $SWITCHBOARD~self_command
    loadVar $MAP~stardock
 loadvar $SWITCHBOARD~bot_name 

# ============================== START PERSONAL LIMP (LIMP) SUB ==============================
:climp
    setvar $limp "c"

:_limp
    gosub :mineProtections
    if ($parm1 > $PLAYER~LIMPETS)
        setVar $parm1 $PLAYER~LIMPETS
    end
:plimp1
    killalltriggers
    if ($PLAYER~LIMPETS <= 0)
        send "'{" $SWITCHBOARD~bot_name "} - Out of limpets!*"
        halt
    end
    if ($PLAYER~startingLocation = "Citadel")
        send "q q z* h2z" $parm1 "* z " $limp " z * * *l " $PLANET~PLANET "* c"
    elseif ($PLAYER~startingLocation = "Command")
        send "z* h2z" $parm1 "* z " $limp " z * *"
    end
    setTextLineTrigger toomanypl :toomany_limp "!  You are limited to "
    setTextLineTrigger plclear :plclear_limp "Done. You have "
    setTextLineTrigger enemypl :noperdown_limp "These mines are not under your control."
    setTextLineTrigger notenough :toomany_limp "You don't have that many mines available."
    pause
:plclear_limp
    killalltriggers
    setVar $isLimped TRUE

    if ($PLAYER~startingLocation = "Citadel")
        waiton "Citadel command (?=help)"
        send "s* "
    elseif ($PLAYER~startingLocation = "Command")
        send "d* "
    end
    setTextLineTrigger perdown :perdown_limp "(Type 2 Limpet) (yours)"
    setTextLineTrigger cordown :cordown_limp "(Type 2 Limpet) (belong to your Corp)"
    setTextLineTrigger noperdown :noperdown_limp "Warps to Sector(s) :"
    pause
:cordown_limp
    killalltriggers
    setVar $SWITCHBOARD~message $parm1&" Corporate Limpets Deployed!*"
    gosub :SWITCHBOARD~switchboard
    goto :done_limp
:perdown_limp
    killalltriggers
    setVar $SWITCHBOARD~message $parm1&" Personal Limpet Deployed!*"
    gosub :SWITCHBOARD~switchboard
    goto :done_limp
:noperdown_limp
    killalltriggers
    setVar $SWITCHBOARD~message "Sector already has enemy limpets present!*"
    gosub :SWITCHBOARD~switchboard
    setVar $isLimped FALSE
    goto :done_limp
:toomany_limp
    setVar $SWITCHBOARD~message "Too many mines in the sector!*"
    gosub :SWITCHBOARD~switchboard
:done_limp
    if ($isLimped)
        setSectorParameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
    else
        setSectorParameter $PLAYER~CURRENT_SECTOR "LIMPSEC" FALSE
    end
    killalltriggers
    halt
# ============================== END PERSONAL LIMP SUB ==============================

:mineProtections
    killalltriggers
    gosub :PLAYER~quikstats
    if (($PLAYER~CURRENT_SECTOR < 10) OR ($PLAYER~CURRENT_SECTOR = $MAP~stardock))
        setVar $SWITCHBOARD~message "Cannot deploy in FedSpace!*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
    setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
    isNumber $test $parm1
    if (($test = FALSE) OR ($parm1 = 0))
        setVar $parm1 1
    end
    setVar $bot~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $bot~validPrompts "Command Citadel"
    gosub :bot~checkStartingPrompt
    if ($PLAYER~startingLocation = "Citadel")
        send "q"
        gosub :PLANET~getPlanetInfo
        send "c"
    end
return


# includes:
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\map"
include "source\module_includes\prompt"
