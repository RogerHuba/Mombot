logging off
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


# ============================== START PLANET LIST (PLIST)  ==============================
:plist
    gosub :killthetriggers
    setVar $PLANET~PLANET 0
    gosub :PLAYER~quikstats
    setVar $planetOutput ""
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    setVar $PROMPT~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $PROMPT~validPrompts "Citadel Command"
    gosub :PROMPT~checkStartingPrompt

:Planet_Listing_Start
    if ($startingLocation = "Citadel")
        send "S* Q"
        gosub :PLANET~getPlanetInfo
        send "Q"
    else
        send "** "
    end
    if ((SECTOR.PLANETCOUNT[$PLAYER~CURRENT_SECTOR] <= 1) AND ($PLANET_SCANNER = "No"))
                setVar $SWITCHBOARD~message "Must be more than one planet in sector if bot doesn't have planet scanner*"
        gosub :SWITCHBOARD~switchboard
        if ($startingLocation = "Citadel")
            gosub :PLANET~landingSub
        end
        goto :wait_for_command
    end
        send "L"
    setTextTrigger beginscan :Planet_Listing_beginscan "Atmospheric maneuvering system engaged"
    pause
:Planet_Listing_beginscan
    gosub :killthetriggers
    setTextLineTrigger nothing2do :Planet_Listing_nothing2do "You can create one with a Genesis Torpedo"
    setTextTrigger pscandone :Planet_Listing_pscandone "Land on which planet"
    setTextLineTrigger line_trig :Planet_Listing_parse_scan_line
    pause
:Planet_Listing_nothing2do
    gosub :killthetriggers
    waitOn "(?="
        setVar $SWITCHBOARD~message "No Planets In Sector!*"
    gosub :SWITCHBOARD~switchboard
    goto :wait_for_command
:Planet_Listing_parse_scan_line
    killTrigger line_trig
    setVar $s CURRENTLINE
    if (($s = "") OR ($s = 0))
        setVar $s "          "
    end
    replaceText $s "        Level" "Lvl"
    replaceText $s "-----------------------------------------------" "-------------------------------------------"
    replaceText $s "        Citadel" "Citadel"
    replaceText $s "l Fighters Q" "l  Figs Q"
    getLength $s $length
    if ($length > 70)
        cutText $s $s 1 70
    end
    setVar $planetOutput $planetOutput&$s&"*"
    gosub :killthetriggers
    goto :Planet_Listing_beginscan
:Planet_Listing_pscandone
    setVar $strlocal ""
    gosub :killthetriggers
    setVar $idx 1
    if (($PLANET~PLANET <> 0) AND ($PLAYER~CURRENT_SECTOR <> 1))
        send $PLANET~PLANET & "* c "
        setVar $SWITCHBOARD~message "On Planet #" & $PLANET~PLANET & "*"
    else
        send " * "
        setVar $SWITCHBOARD~message ""
    end
    waitOn "(?="
    send "'*"
    waitOn "Comm-link open on sub-space band"
    send $planetOutput
    send "**"
    waitOn "Sub-space comm-link terminated"
    gosub :SWITCHBOARD~switchboard
    goto :wait_for_command
# ============================== END PLANET LIST (PLIST) Sub ==============================

:killthetriggers
    killalltriggers
return

:wait_for_command
halt



# includes:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
