    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $self_command
    loadVar $stardock
    loadVar $MAP~stardock
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 
    loadvar $SWITCHBOARD~self_command 


    setVar $i $parm1
    isNumber $test $i
    if ($test <> TRUE)
        setVar $SWITCHBOARD~message "Sector entered is not a number.*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
    if (($i > SECTORS) OR ($i < 1))
        setVar $SWITCHBOARD~message "Sector entered must be between 1 - "&SECTORS&".*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
    setVar $MAP~displaySector $i
    gosub :MAP~displaySector
    setVar $SWITCHBOARD~message $MAP~output
    if ($SWITCHBOARD~self_command <> TRUE)
        setVar $SWITCHBOARD~self_command 2
    end
    gosub :SWITCHBOARD~switchboard
goto :wait_for_command

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

# includes:
include "source\bot_includes\player"
include "source\bot_includes\sector"
include "source\bot_includes\map"
include "source\bot_includes\ship"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
