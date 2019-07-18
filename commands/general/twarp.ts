    gosub :BOT~loadVars

    setVar $BOT~help[1]  $BOT~tab&"twarp - transwarps to sector as quickly "
    setVar $BOT~help[2]  $BOT~tab&"        and safely as possible.   "
    setVar $BOT~help[3]  $BOT~tab&"Options: "
    setVar $BOT~help[4]  $BOT~tab&"    t [sector] - normal transwarp"
    setVar $BOT~help[5]  $BOT~tab&"    t [sector] {planet id} - transwarp, then land"
    setVar $BOT~help[6]  $BOT~tab&"    t [sector] {p} - transwarp, then port"
    setVar $BOT~help[7]  $BOT~tab&"    t planet {planet id} - transwarp to last known "
    setVar $BOT~help[8]  $BOT~tab&"                           location of the planet id"
    gosub :BOT~help_file


# ======================     START TWARP SUBROUTINES     =================
:twarp
:t
    setVar $warpto_p ""
    setvar $player~save true
    gosub :PLAYER~quikstats
    setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $bot~validPrompts "Command <Underground> Do How Corporate Citadel Planet Computer Terra <StarDock> <FedPolice> <Tavern> <Libram <Galactic <Hardware <Shipyards>"
    gosub :bot~checkstartingprompt
    if ($PLAYER~TWARP_TYPE = "No")
        setVar $SWITCHBOARD~message "This ship does not have a transwarp drive!*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
    gosub :travelProtections
    gosub :tactics~twarp
    if ($PLAYER~twarpSuccess = FALSE)
        if (($PLAYER~startingLocation = "Citadel") OR ($PLAYER~startingLocation = "Planet"))
            if ($planet~planet <> 0)
                gosub  :player~currentPrompt
                if ($PLAYER~CURRENT_PROMPT = "Command")
                    gosub :PLANET~landingSub
                end
            end
            halt
        end
        if (($PLAYER~startingLocation = "<StarDock>") OR ($PLAYER~startingLocation = "<FedPolice") OR ($PLAYER~startingLocation = "<Tavern>") OR ($PLAYER~startingLocation = "<Libram") OR ($PLAYER~startingLocation = "<Galact") OR ($PLAYER~startingLocation = "<Hardware") OR ($PLAYER~startingLocation = "<Shipyards>"))
            send "p z s h *"
            halt
        end
        setVar $SWITCHBOARD~message $PLAYER~msg&"*"
        gosub :SWITCHBOARD~switchboard
    else
        if ($bot~parm2 = "p")
            send $warpto_p
        elseif (($warpto_p <> 0) AND ($warpto_p <> ""))
            setVar $planet~planet $warpto_p
            gosub :PLANET~landingSub
        end
        setVar $bot~target $PLAYER~warpto
        gosub :bot~addfigtodata
        setVar $SWITCHBOARD~message $PLAYER~msg&"*"
        gosub :SWITCHBOARD~switchboard
    end
    halt
# ======================     END TWARP SUBROUTINES     ==========================
:travelProtections
    isNumber $test $bot~parm1
    if ($test = FALSE)
        setVar $SWITCHBOARD~message "Sector must be entered as a number*"
        gosub :SWITCHBOARD~switchboard
        halt
    else
        if ($bot~parm2 = "p")
            setVar $warpto_p "p z t *"
            if ($bot~parm1 = $MAP~stardock)
                setVar $warpto_p "p z s h *"
            end
        else
            isNumber $test $bot~parm2
            if ($test = FALSE)
                setVar $warpto_p ""
            else
                setVar $warpto_p $bot~parm2
            end
        end
        setVar $PLAYER~warpto $bot~parm1
        if ($PLAYER~CURRENT_SECTOR = $PLAYER~warpto)
            setVar $SWITCHBOARD~message "Already in that sector!*"
            gosub :SWITCHBOARD~switchboard
            halt
        elseif (($PLAYER~warpto <= 0) OR ($PLAYER~warpto > SECTORS))
            setVar $SWITCHBOARD~message "Destination sector is out of range!*"
            gosub :SWITCHBOARD~switchboard
            halt
        end
    end
return








# includes:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\player\quikstats"
include "source\bot_includes\switchboard"
include "source\bot_includes\tactics"
include "source\bot_includes\planet"
include "source\bot_includes\player\currentprompt"
include "source\bot_includes\map"
