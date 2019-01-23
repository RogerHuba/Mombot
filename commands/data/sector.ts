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
    listSectorParameters $i $bot~parms
    setvar $j 1
    setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  *"
    while ($j <= $bot~parms)
        getSectorParameter $i $bot~parms[$j] $check
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&"    "&$bot~parms[$j]&": "&$check&"*"
        add $j 1
    end

    gosub :SWITCHBOARD~switchboard
halt






# includes:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\sector"
include "source\bot_includes\map"
include "source\bot_includes\ship"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
