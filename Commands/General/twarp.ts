    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadVar $MAP~stardock
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 

# ======================     START TWARP SUBROUTINES     =================
:twarp
:t
    setVar $warpto_p ""
    gosub :PLAYER~quikstats
    setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $validPrompts "Command <Underground> Do How Corporate Citadel Planet Computer Terra <StarDock> <FedPolice> <Tavern> <Libram <Galactic <Hardware <Shipyards>"
    gosub :checkStartingPrompt
    if ($PLAYER~TWARP_TYPE = "No")
        setVar $SWITCHBOARD~message "This ship does not have a transwarp drive!*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
    gosub :travelProtections
    gosub :PLAYER~twarp
    if ($PLAYER~twarpSuccess = FALSE)
        if (($PLAYER~startingLocation = "Citadel") OR ($PLAYER~startingLocation = "Planet"))
            if ($PLANET~PLANET <> 0)
                gosub :PLAYER~current_prompt
                if ($PLAYER~CURRENT_PROMPT = "Command")
                    gosub :PLANET~landingSub
                end
            end
            goto :wait_for_command
        end
        if (($PLAYER~startingLocation = "<StarDock>") OR ($PLAYER~startingLocation = "<FedPolice") OR ($PLAYER~startingLocation = "<Tavern>") OR ($PLAYER~startingLocation = "<Libram") OR ($PLAYER~startingLocation = "<Galact") OR ($PLAYER~startingLocation = "<Hardware") OR ($PLAYER~startingLocation = "<Shipyards>"))
            send "p z s h *"
            goto :wait_for_command
        end
        setVar $SWITCHBOARD~message $PLAYER~msg&"*"
        gosub :SWITCHBOARD~switchboard
    else
        if ($parm2 = "p")
            send $warpto_p
        elseif (($warpto_p <> 0) AND ($warpto_p <> ""))
            setVar $PLANET~PLANET $warpto_p
            gosub :PLANET~landingSub
        end
        setVar $target $PLAYER~warpto
        gosub :addFigToData
        setVar $SWITCHBOARD~message $PLAYER~msg&"*"
        gosub :SWITCHBOARD~switchboard
    end
    goto :wait_for_command
# ======================     END TWARP SUBROUTINES     ==========================
:travelProtections
    isNumber $test $parm1
    if ($test = FALSE)
        setVar $SWITCHBOARD~message "Sector must be entered as a number*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    else
        if ($parm2 = "p")
            setVar $warpto_p "p z t *"
            if ($parm1 = $MAP~stardock)
                setVar $warpto_p "p z s h *"
            end
        else
            isNumber $test $parm2
            if ($test = FALSE)
                setVar $warpto_p ""
            else
                setVar $warpto_p $parm2
            end
        end
        setVar $PLAYER~warpto $parm1
        if ($PLAYER~CURRENT_SECTOR = $PLAYER~warpto)
            setVar $SWITCHBOARD~message "Already in that sector!*"
            gosub :SWITCHBOARD~switchboard
            goto :wait_for_command
        elseif (($PLAYER~warpto <= 0) OR ($PLAYER~warpto > SECTORS))
            setVar $SWITCHBOARD~message "Destination sector is out of range!*"
            gosub :SWITCHBOARD~switchboard
            goto :wait_for_command
        end
    end
return


:wait_for_command
halt


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
include "source\bot_includes\player"
include "source\bot_includes\sector"
include "source\bot_includes\map"
include "source\bot_includes\ship"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
