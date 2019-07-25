    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $self_command
    loadVar $stardock
    loadVar $MAP~stardock
    loadVar $safe_ship
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 
    loadvar $SWITCHBOARD~self_command 


   #============================== XPORT (XPORT) ==============================
:x
:xport
    gosub :killthetriggers
    gosub :PLAYER~quikstats

    send "'the xport command thinks the safe ship is:"&$safe_ship&"*"

    if (($PLAYER~unlimitedGame = FALSE) AND ($PLAYER~TURNS = 0))
        send "'{" $SWITCHBOARD~bot_name "} - I don't have any turns left!*"
        goto :wait_for_command
    end
    setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $validPrompts "Citadel Command Planet"
    gosub :checkStartingPrompt
    isNumber $result $parm1
    isNumber $safeship_result $safe_ship
    if ($result < 1)
        send "'{" $SWITCHBOARD~bot_name "} - xport [ship number] [password]*"
        goto :wait_for_command
    end
    if (($parm1 < 1) AND ($safeship_result >= 1))
        if ($safe_ship > 0)
            setVar $parm1 $safe_ship
        else
            send "'{" $SWITCHBOARD~bot_name "} - Safeship parameter not defined correctly.*"
            goto :wait_for_command
        end
    end
    if ($PLAYER~startingLocation = "Citadel")
        if ($PLANET~PLANET = 0)
            send " q "
            gosub :PLANET~getPlanetInfo
            send " q "
        else
            send "qq   "
        end
    elseif ($PLAYER~startingLocation = "Planet")
        if ($PLANET~PLANET = 0)
            gosub :PLANET~getPlanetInfo
        end
        send " q "
    else
        setVar $PLANET~PLANET 0
    end
    setTextLineTrigger bad_ship_trig    :ship_not_available             "That is not an available ship."
    setTextLineTrigger bad_range_trg    :out_of_range           "only has a transport range of"
    setTextLineTrigger cannot_xport     :cannot_xport           "Access denied!"
    setTextTrigger     xport_passw      :xport_password         "Enter the password for"
    setTextLineTrigger xport_good       :xport_good             "Security code accepted, engaging transporter control."
    if ($parm2 = "0")
        send "x   " & $parm1 & "*    "
    else
        send "x  " & $parm1 & "*"
    end
    pause

:ship_not_available
    setVar $SWITCHBOARD~message "That ship is not available.*"
    goto :out_of_xport
:out_of_range
    setVar $SWITCHBOARD~message "That ship is out of range.*"
    goto :out_of_xport
:xport_good
    setVar $SWITCHBOARD~message "Xport complete.*"
    if ($command = "x")
        setVar $safe_ship $PLAYER~SHIP_NUMBER
        saveVar $safe_ship
        echo "*" ANSI_14 "[" ANSI_15 "Safe ship auto-set to last ship: " $PLAYER~SHIP_NUMBER ANSI_14 "]*" ANSI_7
    end
    goto :out_of_xport
:xpass_bad
    setVar $SWITCHBOARD~message "Incorrect ship password!*"
    waitfor "Choose which ship to beam to"
    goto :out_of_xport
:cannot_xport
    setVar $SWITCHBOARD~message "Cannot xport to that ship!*"
    goto :out_of_xport
:xport_password
    gosub :killthetriggers
    setTextLineTrigger xport_ok  :xport_good "Security code accepted, engaging transporter control."
    setTextLineTrigger xpass_bad :xpass_bad "SECURITY BREACH! Invalid Password, unable to link transporters."
    send $parm2 & "*   "
    pause
:out_of_xport
    gosub :killthetriggers
    send "    *    "
    if ((($PLAYER~startingLocation = "Citadel") OR ($PLAYER~startingLocation = "Planet")) AND $PLANET~PLANET <> 0)
        gosub :PLANET~landingSub
    end
    echo "**"
    gosub :SWITCHBOARD~switchboard
    goto :wait_for_command
#============================== END XPORT (XPORT) SUB ==============================


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
include "source\bot_includes\ship"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
