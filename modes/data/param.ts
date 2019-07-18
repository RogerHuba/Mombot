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
    loadVar $bot~silent_running


isNumber $test $parm1
setVar $getAllParamsFromSectors FALSE
if ($test = TRUE)
    if (($parm1 <= 0) OR ($parm1 > SECTORS))
        setvar $parm1 CURRENTSECTOR
   end
    if ($SWITCHBOARD~self_command <> TRUE) or ($bot~silent_running <> TRUE)
        setVar $SWITCHBOARD~self_command 2
    end
    listSectorParameters $parm1 $parms
    setvar $i 1
    setVar $SWITCHBOARD~message "  *Displaying sector parameters for sector "&$parm1&": *"
	
	# HAMMER - 23/10 - Added this because EP HAGGLE creates so many prams
	# that the BUST / FAKE Bust params weren't showing
	# So probably a bug in TWX...

    getSectorParameter $parm1 "BUSTED" $bustthissec
    if ($bustthissec = TRUE)
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  BUSTED: 1*"
    end
    getSectorParameter $parm1 "FAKEBUST" $fakebust
    if ($fakebust = TRUE)
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  FAKEBUST: 1*"
    end
    while ($i <= $parms)
        getSectorParameter $parm1 $parms[$i] $check
	if ($parms[$i] = "BUSTED")
	elseif ($parms[$i] = "FAKEBUST")
	else
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  "&$parms[$i]&": "&$check&"*"
	end
        add $i 1
    end
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
            getSectorParameter $i "FIGSEC" $isFigged
            if (($check <> "") AND ($check <> "0"))
                if ($isFigged = true)
                    setVar $output $output&" ["&$i&"]"
                else
                    setVar $output $output&" "&$i
                end
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

    if ($SWITCHBOARD~self_command <> TRUE) or ($bot~silent_running <> TRUE)
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
include "source\bot_includes\switchboard"
include "source\bot_includes\player\currentprompt\player"
