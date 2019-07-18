    gosub :BOT~loadVars

    setVar $BOT~help[1]  $BOT~tab&"topoff - fill up ship with fighters from sector "
    gosub :BOT~help_file

#============================== START TOPOFF (TOPOFF) ==============================
:topoff
    killalltriggers
    gosub  :player~currentPrompt
    setVar $PROMPT~startingLocation $PLAYER~current_prompt
    setVar $PROMPT~validPrompts "Citadel Command"
    gosub :PROMPT~checkStartingPrompt
    if ($PROMPT~startingLocation = "Citadel")
        send " q "
        gosub :PLANET~getPlanetInfo
        send " q "
    end
    if ($bot~parm1 <> "o") AND ($bot~parm1 <> "t") AND ($bot~parm1 <> "d")
        setVar $type "d"
        isNumber $test CURRENTSECTOR
        if ($test = TRUE)
            if ((CURRENTSECTOR > 0) AND (CURRENTSECTOR <= SECTORS))
                setVar $type SECTOR.FIGS.TYPE[CURRENTSECTOR]
                if ($type = "Offensive")
                    setVar $type "o"
                elseif ($type = "Defensive")
                    setVar $type "d"
                elseif ($type = "Toll")
                    setVar $type "t"
                else
                    setVar $type "d"
                end
            end
        end
        setVar $bot~parm1 $type
    end
    setVar $to_drop $bot~parm1
    gosub :do_topoff
    if ($PROMPT~startingLocation = "Citadel")
        gosub :PLANET~landingSub
    end
    setVar $SWITCHBOARD~message "TopOff complete Left "&$ftrs_to_leave&" fighters.*"
    gosub :SWITCHBOARD~switchboard
    halt
:do_topoff
    :do_topoff_again
        killalltriggers
        send " F"
        waitOn "Your ship can support up to"
        getWord CURRENTLINE $ftrs_to_leave 10
        stripText $ftrs_to_leave ","
        stripText $ftrs_to_leave " "
        if ($ftrs_to_leave < 1)
            setVar $ftrs_to_leave 1
        end
        send " " & $ftrs_to_leave & " * C " & $to_drop
        setTextLineTrigger topoff_success :topoff_success "Done. You have "
        setTextLineTrigger topoff_failure1 :do_topoff_again "You don't have that many fighters available."
        setTextLineTrigger topoff_failure2 :do_topoff_again "Too many fighters in your fleet!  You are limited to"
        pause
    :topoff_success
return
#============================== END TOPOFF (TOPOFF) ==============================






# includes:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\player\currentprompt"
include "source\module_includes\prompt"
include "source\bot_includes\planet"
include "source\bot_includes\switchboard"
