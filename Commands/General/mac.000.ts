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


# ============================== SINGLE MACRO (MAC) ==============================
:mac
    setVar $nmac 1
    goto :go_macro
:nmac
    setVar $nmac $parm1
:go_macro
    isNumber $number $nmac
    if ($number <> TRUE)
        send "'{" $SWITCHBOARD~bot_name "} - Invalid Macro Count*"
        goto :wait_for_command
    end
    if ($nmac <= 0)
        send "'{" $SWITCHBOARD~bot_name "} - Invalid Macro Count*"
        goto :wait_for_command
    end
    gosub :macroProtections
    setVar $i 0
    while ($i < $nmac)
        send $user_command_line
        add $i 1
    end
    if ($nmac > 1)
        send "'{" $SWITCHBOARD~bot_name "} - Numbered Macro - " $nmac " Cycles Complete*"
    else
        send "'{" $SWITCHBOARD~bot_name "} - Macro Complete*"
    end
    goto :wait_for_command
# ============================== END MACROS (MAC/NMAC) SUB ==============================
:macroProtections
    stripText $user_command_line $SWITCHBOARD~bot_name
    StripText $user_command_line " mac "
    replaceText $user_command_line "^m" "*"
    replaceText $user_command_line #42 "*"
    getWordPos $user_command_line $pos "`"
    getWordPos $user_command_line $pos2 "'"
    getWordPos $user_command_line $pos3 "="
    if (($pos > 0) OR ($pos2 > 0) OR ($pos3 > 0))
        send "'{" $SWITCHBOARD~bot_name "} - No talking with the bot :P*"
        goto :wait_for_command
    end
    setVar $cbyCheck $user_command_line
    lowercase $cbyCheck
    getWordPos $cbyCheck $posc "c"
    getWordPos $cbyCheck $posb "b"
    getWordPos $cbyCheck $posy "y"
    gosub :PLAYER~current_prompt
    if (($PLAYER~CURRENT_PROMPT = "Computer") AND ($posb > 0) AND ($posy > 0))
        send "'{" $SWITCHBOARD~bot_name "} - Self Destruct Protection Activated*"
        goto :wait_for_command
    end
    if (($PLAYER~CURRENT_PROMPT = "����������") AND ($posy > 0))
        send "'{" $SWITCHBOARD~bot_name "} - Self Destruct Protection Activated*"
        goto :wait_for_command
    end

    getLength $cbyCheck $length
    setVar $i 1
    while ($i <= $length)
        if (($posc > 0) AND ($posb > $posc) AND ($posy > $posb))
            send "'{" $SWITCHBOARD~bot_name "} - Self Destruct Protection Activated*"
            goto :wait_for_command
        end
        if ($foundC = FALSE)
            getWordPos $cbyCheck $pos "c"
            if ($pos = 1)
                setVar $foundC TRUE
            end
        elseif ($foundB = FALSE)
            getWordPos $cbyCheck $pos "b"
            if ($pos = 1)
                setVar $foundB TRUE
            end
        elseif ($foundY = FALSE)
            getWordPos $cbyCheck $pos "y"
            if ($pos = 1)
                setVar $foundY TRUE
            end
        end
        if ($foundC AND $foundB AND $foundY)
            send "'{" $SWITCHBOARD~bot_name "} - Self Destruct Protection Activated*"
            goto :wait_for_command
        end
        if ($testLength > 1)
            cutText $cbyCheck $cbyCheck 2 9999
        end
        add $i 1
    end
return
# ============================== END MULTIPLE MACRO (NMAC) SUB ==============================


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
