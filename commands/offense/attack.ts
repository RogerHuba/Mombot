logging off
     gosub :BOT~loadVars
     loadvar $SHIP~cap_file


#HELP FILE
     setVar $BOT~help[1]  $BOT~tab&"cap   "
     setVar $BOT~help[2]  $BOT~tab&"    Captures enemy ships and attempts to not destroy them.   "
     gosub :BOT~help_file

	gosub :combat~init 

#============================== START AUTO CAPTURE =======================================
:autoCap
:cap
    gosub :PLAYER~quikstats
    setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
    if ($PLAYER~startingLocation <> "Command")
        if ($PLAYER~startingLocation = "Citadel")
            if ($BOT~mode <> "Citcap")
                fileExists $SHIP~cap_file_chk $SHIP~cap_file
                if ($SHIP~cap_file_chk <> TRUE)
                    gosub :SHIP~getShipCapStats
                end
                setVar $BOT~user_command_line "citcap on"
                goto :USER_INTERFACE~runUserCommandLine
            else
                setVar $BOT~user_command_line "citcap off"
                goto :USER_INTERFACE~runUserCommandLine
            end
        end
        setVar $SWITCHBOARD~message "Wrong prompt for auto capture.*"
        gosub :SWITCHBOARD~switchboard
        goto :BOT~wait_for_command
    end
    getWordPos $BOT~user_command_line $pos "alien"
    if ($pos > 0)
        setVar $PLAYER~onlyAliens TRUE
    else
        setVar $PLAYER~onlyAliens FALSE
    end
    fileExists $SHIP~cap_file_chk $SHIP~cap_file
    if ($SHIP~cap_file_chk <> TRUE)
        gosub :SHIP~getShipCapStats
    end
    loadVar $SHIP~SHIP_MAX_ATTACK
    loadVar $SHIP~SHIP_FIGHTERS_MAX
    loadVar $SHIP~SHIP_OFFENSIVE_ODDS
    if ($SHIP~SHIP_OFFENSIVE_ODDS <= 0)
        gosub :SHIP~getShipStats
    end
    setVar $lastTarget ""
    setVar $thisTarget ""
    goSub :SECTOR~getSectorData
    goSub :combat~fastCapture
    goto :BOT~wait_for_command

#================================ END AUTO CAPTURE ===================================

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\ship"
include "source\bot_includes\combat"
include "source\bot_includes\player"
include "source\bot_includes\player\quikstats"
include "source\bot_includes\bot\user_interface"
include "source\bot_includes\switchboard"
include "source\bot_includes\sector"
