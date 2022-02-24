    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadVar $password
    loadVar $letter
    loadvar $self_command
    loadVar $command
    loadVar $stardock
    loadVar $MAP~stardock
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 
    loadvar $SWITCHBOARD~self_command 

# ============================== START UNLOCK (unlock) Sub ==============================
:unlock
    setVar $unlock_attempt 0
    gosub  :player~currentPrompt
    setVar $validPrompts "Citadel"
    gosub :checkStartingPrompt
    send "'{" $SWITCHBOARD~bot_name "} - Unlock ship initiated*ryy"
    setTextlineTrigger unlock_menu :unlock_menu "Game Server"
    setTextLineTrigger enter_game :enter_game "==-- Trade Wars 2002 --=="
:unlock_tryagain
    setDelayTrigger unlock_ansiMenu :unlock_ansiMenu 2000
    pause
:unlock_ansiMenu
    if ($unlock_attempt < 10)
        add $unlock_attempt 1
        send "#"
        goto :unlock_tryagain
    end
    DISCONNECT
    goto :wait_for_command
:unlock_menu
    gosub :killthetriggers
    send $letter & "*"
    waitOn "module now loading."
    send "**"
    waitOn "Enter your choice:"
:enter_game   
    gosub :killthetriggers
    send "t***"
    waitOn "Password?"
    send $password & "* * * c"
    waitOn "Citadel command (?=help)"
    send "'{" $SWITCHBOARD~bot_name "} - Ship has been unlocked!*"
goto :wait_for_command
# ============================== END UNLOCK (UNLOCK) Sub ==============================

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
