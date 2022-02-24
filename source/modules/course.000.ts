    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $self_command
    loadVar $stardock
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 
    loadvar $SWITCHBOARD~self_command 


# =============================== START COURSE DISPLAY ===============================
:course
    gosub :killthetriggers
    gosub :PLAYER~quikstats
    isNumber $test $parm1
    if (($parm1 = "0") OR ($parm1 = "") OR ($test = FALSE))
        setVar $SWITCHBOARD~message "Sectors entered not valid.*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
    isNumber $test $parm2
    if (($test = FALSE) OR ($parm2 = "0"))
        setVar $destination $parm1
        setVar $start $PLAYER~CURRENT_SECTOR
    else
        if ($parm2 > 0)
            setVar $start $parm1
            setVar $destination $parm2
        else
            setVar $SWITCHBOARD~message "Sectors entered not valid.*"
            gosub :SWITCHBOARD~switchboard
            goto :wait_for_command
        end
    end
    send "^f"&$start&"*"&$destination&"*q "
    waitOn ": ENDINTERROG"
    getCourse $course $start $destination   
    setVar $i 1
    setVar $directions ""
    while ($i <= $course)
        getSectorParameter $course[$i] "FIGSEC" $isFigged
        if ($isFigged)
            setVar $directions $directions&"["&$course[$i]&"]"
        else
            setVar $directions $directions&$course[$i]  
        end
        if ($i <> $course)
            setVar $directions $directions&" > "
        end
        add $i 1
    end
    setVar $SWITCHBOARD~message "Path from "&$start&" to "&$destination&": "&$directions&"*"
    gosub :SWITCHBOARD~switchboard
    goto :wait_for_command
#================================== END COURSE DISPLAY ==============================

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
