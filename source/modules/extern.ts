    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $self_command
    loadVar $command
    loadVar $stardock
    loadVar $MAP~stardock
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 
    loadvar $SWITCHBOARD~self_command 

:extern
    gosub  :player~currentPrompt
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
        setVar $SWITCHBOARD~message "Wrong prompt for extern check.*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    else
        gosub :get_time_until_extern
            if ($hours_left < 10)
                setVar $hours_left "0"&$hours_left
            end
            if ($minutes_left < 10)
                setVar $minutes_left "0"&$minutes_left
            end
            if ($seconds_left < 10)
                setVar $seconds_left "0"&$seconds_left
            end
        setVar $SWITCHBOARD~message "Time until extern: "&$hours_left&":"&$minutes_left&":"&$seconds_left&"*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command

    end
:get_time_until_extern
    send "ctq "
    waitOn "<Computer>"
    setTextLineTrigger am :am " AM "
    setTextLineTrigger pm :pm " PM "
    pause

    :am
    :pm
        setVar $timeString CURRENTLINE
        getWord $timeString $time 1
        getWord $timeString $ampm 2
        replaceText $timeString ":" " "
        
        getWord $timeString $hours 1
        getWord $timeString $minutes 2
        getWord $timeString $seconds 3

        
        if ($ampm = "PM")
            add $hours 12
        end

        setVar $hours_left ((24-$hours)-1)
        setVar $minutes_left ((60-$minutes)-1)
        setVar $seconds_left (60-$seconds)

return


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
include "source\bot_includes\map"
include "source\bot_includes\ship"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
