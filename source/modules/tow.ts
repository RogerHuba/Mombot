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


  # ============================== START TOW (TOW) ==============================
:tow
    gosub :PLAYER~quikstats
    setVar $validPrompts "Command"
    gosub :checkStartingPrompt
    isNumber $test $parm1
    if ($test = FALSE)
        setVar $SWITCHBOARD~message "Ship to tow must be entered as a number*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    elseif ($parm1 < 1)
        setVar $SWITCHBOARD~message "Ship to tow must be entered as a number*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    else
        setVar $shipToTow $parm1
    end
    :towCheck
            gosub :killthetriggers
            send "w"
            SetTextTrigger towOffContinue   :towCheck "You shut off your Tractor Beam."
                SetTextTrigger towOff           :towContinue "Do you wish to tow a manned ship? (Y/N)"
                pause
        :towContinue
                gosub :killthetriggers
                send "*"
                SetTextTrigger towNoGo          :towNoGo "You do not own any other ships in this sector!"
                SetTextTrigger towReady         :towOff "Choose which ship to tow (Q=Quit)"
                pause
    :towOff
        gosub :killthetriggers
        send $shipToTow & "*"
                setTextTrigger towNoGo2           :towNoGo2 "Command [TL="
            setTextTrigger Tow_PassWord   :Tow_PassWord "Enter the password for"
            setTextLineTrigger waitOnTow      :goodTow "You lock your Tractor Beam on "
            pause
    :Tow_PassWord
        gosub :killthetriggers
        send "*"
        setVar $SWITCHBOARD~message "That ship has a PassWord Set.*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    :towNoGo
                gosub :killthetriggers
        setVar $SWITCHBOARD~message "There are no ships in the sector I can tow.*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    :towNoGo2
                gosub :killthetriggers
        setVar $SWITCHBOARD~message "That ship number is not in the sector.*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    :goodTow
        gosub :killthetriggers
        setVar $SWITCHBOARD~message "Tow locked onto ship number " & $shipToTow & "*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
# ============================== END TOW (TOW) ==============================

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
