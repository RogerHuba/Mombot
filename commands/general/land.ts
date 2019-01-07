    gosub :BOT~loadVars

    setVar $BOT~help[1]  $BOT~tab&"   Lands on a planet.          "
    setVar $BOT~help[2]  $BOT~tab&"               "
    setVar $BOT~help[3]  $BOT~tab&"    land {planet#}  "
    setVar $BOT~help[4]  $BOT~tab&"        "
    gosub :BOT~help_file


# ============================== LAND (LAND) ==============================

    gosub :PLAYER~quikstats
    setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $validPrompts "Command Citadel Planet"
    gosub :checkStartingPrompt
    isNumber $number $bot~parm1
    loadVar $PLANET~PLANET
    if ($planet~planet <> "0")
        setvar $last_planet_landed $planet~planet
    end
    if ($number = TRUE)
        if (($bot~parm1 = 0) AND ($PLANET~PLANET = 0))
            send "'{" $SWITCHBOARD~bot_name "} - Incorrect Planet number*"
            goto :wait_for_command
        elseif ($bot~parm1 > 0)
            setVar $PLANET~PLANET $bot~parm1
        else
        end
    else
        setVar $SWITCHBOARD~message "Planet number entered is not a number*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
        if ($player~current_prompt <> "Command")
            send "q q * "
        end
        gosub :PLANET~landingSub
    if ($PLANET~sucessfulCitadel = true)
        setVar $SWITCHBOARD~message "In Cit - Planet "&$PLANET~PLANET&"*"
        gosub :SWITCHBOARD~switchboard
    elseif ($PLANET~sucessfulPlanet = true)
        setVar $SWITCHBOARD~message "At Planet Prompt - No Cit*"
        gosub :SWITCHBOARD~switchboard
    else
        if (($last_planet_landed <> "0") and ($last_planet_landed <> $planet~planet))
            setvar $planet~planet $last_planet_landed
            gosub :planet~landingsub
            if ($PLANET~sucessfulCitadel)
                setVar $SWITCHBOARD~message "In Cit - Relanded on planet "&$PLANET~PLANET&"*"
                gosub :SWITCHBOARD~switchboard
            elseif ($PLANET~sucessfulPlanet)
                setVar $SWITCHBOARD~message "Relanded to planet prompt on planet "&$PLANET~PLANET&"- No Cit*"
                gosub :SWITCHBOARD~switchboard
            end
        end
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
include "source\bot_includes\ship"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
include "source\module_includes\bot"
