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
    loadVar $silent_running


isNumber $test $parm1
setVar $getAllParamsFromSectors FALSE
if ($test = TRUE)
    if (($parm1 <= 0) OR ($parm1 > SECTORS))
        setVar $SWITCHBOARD~message "If you enter a sector, it must be between 1-"&SECTORS&"*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command      
    end
    if ($SWITCHBOARD~self_command <> TRUE)
        setVar $SWITCHBOARD~self_command 2
    end

    setVar $SWITCHBOARD~message "Parameters set for sector "&$parm1&":*"
    getSectorParameter $parm1 "FIGSEC" $check
    setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  FIGSEC: "&$check&"*"
    getSectorParameter $parm1 "MINDSEC" $check
    setVar $SWITCHBOARD~message $SWITCHBOARD~message&" MINESEC: "&$check&"*"
    getSectorParameter $parm1 "LIMPSEC" $check
    setVar $SWITCHBOARD~message $SWITCHBOARD~message&" LIMPSEC: "&$check&"*"
    getSectorParameter $parm1 "BUSTED" $check
    setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  BUSTED: "&$check&"*"
    getSectorParameter $parm1 "FAKEBUST" $check
    setVar $SWITCHBOARD~message $SWITCHBOARD~message&"FAKEBUST: "&$check&"*"
    getSectorParameter $parm1 "MSLSEC" $check
    setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  MSLSEC: "&$check&"*"
    getSectorParameter $parm1 "PSECTOR" $check
    setVar $SWITCHBOARD~message $SWITCHBOARD~message&" PSECTOR: "&$check&"*"
    gosub :SWITCHBOARD~switchboard
    goto :wait_for_command      
    
else
    setvar $i 1
    setvar $count 0
    uppercase $parm1
    setVar $output "Displaying sectors for "&$parm1&": *"
    if ($parm1 <> "PSECTOR")
        while ($i <= SECTORS)
            getSectorParameter $i $parm1 $check
            if (($check <> "") AND ($check <> "0"))
                setVar $output $output&" ["&$i&"]"
                add $count 1
            end
            add $i 1
        end
    else
        while ($i <= 2000)
            getSectorParameter $i "PSECTOR" $check
            if (($check <> "") AND ($check <> "0"))
                setVar $output $output&" Planet #"&$i&"==>["&$check&"]*"
                add $count 1
            end
            add $i 1
        end        
    end

    if ($SWITCHBOARD~self_command <> TRUE)
        setVar $SWITCHBOARD~self_command 2
    end

    setVar $SWITCHBOARD~message $output&"*Total Count: "&$count&"*"
    gosub :SWITCHBOARD~switchboard
    goto :wait_for_command      

end


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
