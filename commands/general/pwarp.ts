    gosub :BOT~loadVars
    setVar $parm1 $BOT~parm1
    setVar $parm2 $BOT~parm2
    setVar $parm3 $BOT~parm3
    setVar $parm4 $BOT~parm4
    setVar $parm5 $BOT~parm5
    setVar $parm6 $BOT~parm6
    setVar $parm7 $BOT~parm7
    setVar $parm8 $BOT~parm8
    setVar $user_command_line $BOT~user_command_line


    setVar $BOT~help[1]  $BOT~tab&"pwarp - planet warps to sector "
    setVar $BOT~help[2]  $BOT~tab&"         "
    setVar $BOT~help[3]  $BOT~tab&"Options: "
    setVar $BOT~help[4]  $BOT~tab&"    p [sector] - normal planet warp"
    setVar $BOT~help[5]  $BOT~tab&"    p planet {planet id} - planet warp to last known "
    setVar $BOT~help[6]  $BOT~tab&"                           location of the planet id"
    gosub :BOT~help_file

# ======================     START PWARP SUBROUTINES     =================
:pwarp
:p
    gosub :killthetriggers
    setvar $player~save true
    if ($parm1 <> $PLAYER~CURRENT_SECTOR)
        gosub :PLAYER~current_prompt
    else
        gosub :PLAYER~quikstats
    end
    setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $validPrompts "Citadel"
    gosub :checkStartingPrompt
    isNumber $test $parm1
    if (($test = FALSE) OR ($parm1 = "0"))
        setVar $SWITCHBOARD~message "Sector must be entered as a number between 11-"&SECTORS&"*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    else    
        if (($parm1 > SECTORS) OR ($parm1 < 11))    
            setVar $SWITCHBOARD~message "Sector must be entered as a number between 11-"&SECTORS&"*"  
            gosub :SWITCHBOARD~switchboard
            goto :wait_for_command
        else
            setVar $PLAYER~warpto $parm1
            if ($PLAYER~CURRENT_SECTOR = $PLAYER~warpto)
                setVar $SWITCHBOARD~message "Already in that sector!*"
                gosub :SWITCHBOARD~switchboard
                goto :wait_for_command
            end
        end
    end
    
    getWordPos " "&$user_command_line&" " $pos " scan "
    if ($pos > 0)
        setVar $scan TRUE
    else
        setVar $scan FALSE
    end

    gosub :pwarpto
    goto :wait_for_command
:pwarpto
    if ($scan)
        send "q *c p" $PLAYER~warpto "*ys"
    else
        send "q *c p" $PLAYER~warpto "*y"
    end
    waitOn "Planet #"
    getWord CURRENTLINE $PLANET~PLANET 2
    stripText $PLANET~PLANET "#"
    saveVar $PLANET~PLANET

    setTextLineTrigger pwarp_lock       :pwarp_lock     "Locating beam pinpointed"
    setTextLineTrigger no_pwarp_lock    :no_pwarp_lock  "Your own fighters must be"
    setTextLineTrigger already      :already    "You are already in that sector!"
    setTextLineTrigger no_ore       :no_ore     "You do not have enough Fuel Ore"
    setTextLineTrigger No_pwarp     :noPwarp    "This Citadel does not have a Planetary TransWarp"
    setTextLineTrigger wrong_number     :wrong_number   "Invalid Sector number,"
    pause
    :wrong_number
        gosub :killthetriggers
        setVar $SWITCHBOARD~message "Not a valid sector to pwarp to!*"
        gosub :SWITCHBOARD~switchboard
        return
        
    :noPwarp
        gosub :killthetriggers
        setVar $SWITCHBOARD~message "Planet Does Not Have A Planetary TransWarp Drive!*"
        gosub :SWITCHBOARD~switchboard
        return
    :no_pwarp_lock
        gosub :killthetriggers
        setVar $target $PLAYER~warpto
        gosub :removeFigFromData
        setVar $SWITCHBOARD~message "No fighter down at that location!*"
        gosub :SWITCHBOARD~switchboard
        return
    :no_ore
        gosub :killthetriggers
        setVar $SWITCHBOARD~message "Not enough fuel for that pwarp.*"
        gosub :SWITCHBOARD~switchboard
        return
    :pwarp_lock
        gosub :killthetriggers
        waitOn "Planet is now in sector"
        setVar $SWITCHBOARD~message "Planet #"&$PLANET~PLANET&" moved to sector "&$PLAYER~warpto&".*"
        gosub :SWITCHBOARD~switchboard
        setVar $target $PLAYER~warpto
        loadVar $PLANET~PLANET
        isNumber $test $PLANET~PLANET
        if ($test)
            if (($PLANET~PLANET <> ".") and ($PLANET~PLANET > 0))
                setSectorParameter $PLANET~PLANET "PSECTOR" $target
            end
        end
        gosub :addFigToData
        return
    :already
        gosub :killthetriggers
        setVar $SWITCHBOARD~message "Planet already in that sector!.*"
        gosub :SWITCHBOARD~switchboard
return
# ======================     END PWARP SUBROUTINES     ==========================



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
        gosub :PLAYER~current_prompt
    end
    getWordPos " "&$validPrompts&" " $pos $PLAYER~CURRENT_PROMPT
    if ($pos <= 0)
        setVar $SWITCHBOARD~message "Invalid starting prompt: ["&$PLAYER~CURRENT_PROMPT&"]. Valid prompt(s) for this command: ["&$validPrompts&"]*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
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
