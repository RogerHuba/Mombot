gosub :BOT~loadVars

#HELP FILE
     setVar $BOT~help[1]  $BOT~tab&"extern   "
     setVar $BOT~help[2]  $BOT~tab&"    Says how much time until midnight game time.   "
     gosub :bot~helpfile

:extern
    gosub  :player~currentPrompt
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
        setVar $SWITCHBOARD~message "Wrong prompt for extern check.*"
        gosub :SWITCHBOARD~switchboard
        halt
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
        halt

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



# includes:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\currentprompt\player"
