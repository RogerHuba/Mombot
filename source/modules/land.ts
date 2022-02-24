    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $self_command
    loadVar $stardock
    loadVar $MAP~stardock
    loadVar $safe_ship
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 
    loadvar $SWITCHBOARD~self_command 


# ============================== LAND (LAND) ==============================

    gosub :PLAYER~quikstats
    setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $validPrompts "Command"
    gosub :checkStartingPrompt
    isNumber $number $parm1
    loadVar $PLANET~PLANET
    if ($number = TRUE)
        if (($parm1 = 0) AND ($PLANET~PLANET = 0))
            send "'{" $SWITCHBOARD~bot_name "} - Incorrect Planet number*"
            goto :wait_for_command
        elseif ($parm1 > 0)
            setVar $PLANET~PLANET $parm1
        else
        end
    else
        setVar $SWITCHBOARD~message "Planet number entered is not a number*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
        gosub :PLANET~landingSub
    if ($PLANET~sucessfulCitadel)
        setVar $SWITCHBOARD~message "In Cit - Planet "&$PLANET~PLANET&"*"
        gosub :SWITCHBOARD~switchboard
    elseif ($PLANET~sucessfulPlanet)
        setVar $SWITCHBOARD~message "At Planet Prompt - No Cit*"
        gosub :SWITCHBOARD~switchboard
    end
    goto :wait_for_command
# ============================== END LAND (LAND) SUB ==============================


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
include "source\bot_includes\ship"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
