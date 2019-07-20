logging off
	gosub :BOT~loadVars



# ============================== START EXIT ENTER SUB ==============================    
:exit
:xenter
    killalltriggers
    gosub :PLAYER~quikstats
    isNumber $test $parm1
    if ($test = FALSE)
        setVar $parm1 1
    else
        if ($parm1 <= 0)
            setVar $parm1 1
        end
    end
    getWordPos $user_command_line $pos "fill"
    if ($pos > 0)
        setVar $refill TRUE
    else
        setVar $refill FALSE
    end
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    setVar $BOT~validPrompts "Command Citadel"
    gosub :BOT~checkStartingPrompt
    if ($startingLocation = "Citadel")
        send "q m n t *"
        gosub :PLANET~getPlanetInfo
        send "q "
    end
:exit_xenter
    setVar $i 1
    while ($i <= $parm1)
        send "q y * t* * *" $BOT~password "*    *    *       za9999*   z*   /"
        waitOn #179
        if (($PLAYER~CURRENT_SECTOR > 10) and ($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK))
            if ($refill = TRUE)
                gosub :PLAYER~topoff
            else
                if ($i = $parm1)
                    send "f z1* z c d * "
                end
            end
        end
        add $i 1
    end
    :doneExitEnter
    if ($startingLocation = "Citadel")
        send "l j" & #8 & $PLANET~PLANET & "*  m * * * c "
    end
    killalltriggers
    gosub :PLAYER~quikstats
    if ($parm1 > 1)
        setVar $SWITCHBOARD~message "Exit Enter - " & $parm1 & " times completed.*"
    else
        setVar $SWITCHBOARD~message "Exit Enter.*"
    end
    if ($BOT~silent_running <> TRUE)
        setVar $SWITCHBOARD~self_command FALSE
    end
    gosub :SWITCHBOARD~switchboard
    halt
# ============================== END EXIT ENTER SUB ==============================  

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\map"
