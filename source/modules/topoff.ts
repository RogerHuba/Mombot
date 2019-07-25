    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $self_command
    loadVar $stardock
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 
    loadVar $SWITCHBOARD~self_command

#============================== START TOPOFF (TOPOFF) ==============================
:topoff
    gosub :killthetriggers
    gosub  :player~currentPrompt
    setVar $bot~startingLocation $PLAYER~current_prompt
    setVar $bot~validPrompts "Citadel Command"
    gosub :bot~checkStartingPrompt
    if ($bot~startingLocation = "Citadel")
        send " q "
        gosub :PLANET~getPlanetInfo
        send " q "
    end
    if ($parm1 <> "o") AND ($parm1 <> "t") AND ($parm1 <> "d")
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
        setVar $parm1 $type
    end
    setVar $to_drop $parm1
    gosub :do_topoff
    if ($bot~startingLocation = "Citadel")
        gosub :PLANET~landingSub
    end
    setVar $SWITCHBOARD~message "TopOff complete Left "&$ftrs_to_leave&" fighters.*"
    gosub :SWITCHBOARD~switchboard
    goto :wait_for_command
:do_topoff
    :do_topoff_again
        gosub :killthetriggers
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


:wait_for_command
halt

:killthetriggers
    killalltriggers
return

# includes:
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
