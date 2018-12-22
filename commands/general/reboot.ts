    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadVar $command
    loadvar $self_command
    loadVar $stardock
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 

    gosub :killthetriggers
    listActiveScripts $scripts
    setVar $i 1
    setVar $found FALSE
    setVar $rebooted FALSE
    setVar $SWITCHBOARD~message "Rebooting Mombot..*"
    gosub :SWITCHBOARD~switchboard
    while ($i <= $scripts)
        getWordPos "<><><>"&$scripts[$i] $pos "<><><>__mom_bot"
        if ($pos > 0)
            stop $scripts[$i]
            if ($found = FALSE)
                setVar $boot_this $scripts[$i]
                setVar $found TRUE
            end
        end
        add $i 1
    end
    if ($FOUND = FALSE)
        setVar $SWITCHBOARD~message "No mombot script found to reboot.*"
        gosub :SWITCHBOARD~switchboard
    end
    load "scripts\mombot\"&$boot_this
    halt


:wait_for_command
halt

:killthetriggers
    killalltriggers
return

# includes:
include "source\bot_includes\switchboard"
