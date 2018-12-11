    loadVar $MAP~stardock
    loadVar $PLAYER~unlimitedGame        
    gosub :BOT~loadVars
    

    setVar $i $bot~parm1
    isNumber $test $i
    if ($test <> TRUE)
        setVar $i currentsector
    end
    if (($i > SECTORS) OR ($i < 1))
        setVar $i currentsector
    end
    setVar $MAP~displaySector $i
    gosub :MAP~displaySector
    setVar $SWITCHBOARD~message "  *"&$MAP~output
    if ($SWITCHBOARD~self_command <> TRUE)
        setVar $SWITCHBOARD~self_command 2
    end
    listSectorParameters $i $parms
    setvar $j 1
    setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  *"
    while ($j <= $parms)
        getSectorParameter $i $parms[$j] $check
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&"    "&$parms[$j]&": "&$check&"*"
        add $j 1
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
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\sector"
include "source\bot_includes\map"
include "source\bot_includes\ship"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
