    gosub :BOT~loadVars

    setVar $BOT~help[1]  $BOT~tab&"   Lands on a planet.          "
    setVar $BOT~help[2]  $BOT~tab&"               "
    setVar $BOT~help[3]  $BOT~tab&"    land {planet#}  "
    setVar $BOT~help[4]  $BOT~tab&"        "
    gosub :BOT~help_file


# ============================== LAND (LAND) ==============================

    gosub :PLAYER~quikstats
    setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $bot~validPrompts "Command Citadel Planet"
    gosub :bot~checkstartingprompt
    isNumber $number $bot~parm1
    loadVar $planet~planet
    if ($planet~planet <> "0")
        setvar $last_planet_landed $planet~planet
    end
    if ($number = TRUE)
        if (($bot~parm1 = 0) AND ($planet~planet = 0))
            setvar $switchboard~message "Incorrect Planet number*"
			gosub :switchboard~switchboard
            halt
        elseif ($bot~parm1 > 0)
            setVar $planet~planet $bot~parm1
        else
        end
    else
        setVar $SWITCHBOARD~message "Planet number entered is not a number*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
        if ($player~current_prompt <> "Command")
            send "q q * "
        end
        gosub :PLANET~landingSub
    if ($planet~sucessfulCitadel = true)
        setVar $SWITCHBOARD~message "In Cit - Planet "&$planet~planet&"*"
        gosub :SWITCHBOARD~switchboard
    elseif ($planet~sucessfulPlanet = true)
        setVar $SWITCHBOARD~message "At Planet Prompt - No Cit*"
        gosub :SWITCHBOARD~switchboard
    else
        if (($last_planet_landed <> "0") and ($last_planet_landed <> $planet~planet))
            setvar $planet~planet $last_planet_landed
            gosub :planet~landingsub
            if ($planet~sucessfulCitadel)
                setVar $SWITCHBOARD~message "In Cit - Relanded on planet "&$planet~planet&"*"
                gosub :SWITCHBOARD~switchboard
            elseif ($planet~sucessfulPlanet)
                setVar $SWITCHBOARD~message "Relanded to planet prompt on planet "&$planet~planet&"- No Cit*"
                gosub :SWITCHBOARD~switchboard
            end
        end
    end
    halt
# ============================== END LAND (LAND) SUB ==============================









# includes:
include "source\module_includes\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet\landingsub\planet"
