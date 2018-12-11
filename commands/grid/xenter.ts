logging off
        gosub :BOT~loadVars
    setVar $parm1 $BOT~parm1
    setVar $parm2 $BOT~parm2
    setVar $parm3 $BOT~parm3
    setVar $parm4 $BOT~parm4
    setVar $parm5 $BOT~parm5
    setVar $parm6 $BOT~parm6
    setVar $parm7 $BOT~parm7
    setVar $parm8 $BOT~parm8
    setVar $user_command_line $BOT~user_command_line
    loadVar $BOT~password
    loadVar $BOT~silent_running
    loadvar $BOT~letter


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
        send "c "
    end
:exit_xenter
    setVar $i 1
    while ($i <= $parm1)
    if ($startingLocation = "Command")
        send "q y * "
    else
        send "r   y   * * "
    end
    settexttrigger 1 :pickgame "Selection (? for menu)"
    settexttrigger 2 :enter_choice "Enter your choice:"
    pause
    :enter_choice

    killalltriggers
    if ($startingLocation = "Command")
        send " t* * *" $BOT~password "*    *    *       za9999*   z*   /"
    else
        send " t* * *" $BOT~password "*    *    *    m * * *  c       q    q  *     *       za9999*   z*   l j" & #8 & $PLANET~PLANET & "* c  /"
    end
        killalltriggers
        waitOn #179
        if (($PLAYER~CURRENT_SECTOR > 10) and ($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK))
            if ($refill = TRUE)
                gosub :PLAYER~topoff
            else
                if ($i = $parm1)
            if ($startingLocation = "Command")
            send "f z1* z c d * "
            end
                end
            end
        end
        add $i 1
    end
    :doneExitEnter

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

    :pickgame
    killalltriggers
    send $BOT~letter&"  *  "
    waiton "[Pause]"
    send " * "
    goto :enter_choice
# ============================== END EXIT ENTER SUB ==============================  

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\map"
