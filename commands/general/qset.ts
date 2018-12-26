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


    setVar $BOT~help[1]  $BOT~tab&"qset - sets quasar cannon"
    setVar $BOT~help[2]  $BOT~tab&"         "
    setVar $BOT~help[3]  $BOT~tab&"Options: "
    setVar $BOT~help[4]  $BOT~tab&"    qset {s} [amount] - sets sector cannon to amount"
    setVar $BOT~help[5]  $BOT~tab&"    qset {a} [amount] - sets atmos cannon to amount"
    setVar $BOT~help[6]  $BOT~tab&"        qset [amount] - sets both cannons to amount"
    gosub :BOT~help_file

    loadvar $game~mbbs

:qset
:q
    getWord $user_command_line $parm1 1
    getWord $user_command_line $parm2 2
    gosub :PLAYER~current_prompt
    setVar $PROMPT~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $PROMPT~validPrompts "Planet Citadel"
    gosub :PROMPT~checkStartingPrompt
    setVar $totalDamage 0
    ## if the first param is not a number, assume they want to set only one cannon ##
    isNumber $number $parm1
    if ($number <> true)
        setVar $cannonType $parm1
        setVar $cannonDamage $parm2
    else
        setvar $cannonType "both"
        setvar $cannonDamage $parm1
    end
    gosub :doQsetProtections
    if ($PROMPT~startingLocation = "Citadel")
        send "q"
    end
    gosub :PLANET~getPlanetInfo
    if ($PLANET~CITADEL < 3)
        send "'{" $SWITCHBOARD~bot_name "} - Planet number " $PLANET~PLANET " does not have a quasar cannon.*"
        if (($PLANET~CITADEL > 0) AND ($PROMPT~startingLocation = "Citadel"))
            send "c "
        end
    else
        send "c "
        if ($cannonType = "both")
            gosub :set_sector_cannon
            gosub :set_atmos_cannon        
        else        
            if ($cannonType = "s")
                gosub :set_sector_cannon
            else
                gosub :set_atmos_cannon
            end
            if ($PROMPT~startingLocation = "Planet")
                send "q "
            end
        end
    end
    goto :wait_for_command
:doQsetProtections
    isNumber $number $parm2
    if ($number <> TRUE)
        setVar $SWITCHBOARD~message "Cannon Damage Entered is not a number!*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
    if (($parm1 <> "a") and ($parm1 <> "s") and ($cannonType <> "both"))
        setVar $SWITCHBOARD~message "Please use qset [a/s] [damage]!*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
return


:set_sector_cannon
    setVar $percentToSet (((3*$cannonDamage)*100)/$PLANET~PLANET_FUEL)
    if (((($PLANET~PLANET_FUEL * $percentToSet) / 100)/3) < $cannonDamage)
        add $percentToSet 1
    end
    if ($percentToSet > 100)
        setVar $percentToSet 100
    end
    setvar $totalDamage ((($PLANET~PLANET_FUEL * $percentToSet) / 100)/3)
    send "l s "&$percentToSet&"* "
    setVar $damageType "Sector"
    setVar $switchboard~message "Quasar Cannon on planet "&$PLANET~PLANET&" is set to "&$totalDamage&". ("&$damageType&")*"
    gosub :switchboard~switchboard
return

:set_atmos_cannon
    if ($game~mbbs)
        setVar $percentToSet ((($cannonDamage/2)*100)/$PLANET~PLANET_FUEL)
        if (((($PLANET~PLANET_FUEL * $percentToSet) / 100)*2) < $cannonDamage)
            add $percentToSet 1
        end
    else
        setVar $percentToSet (((2*$cannonDamage)*100)/$PLANET~PLANET_FUEL)
        if (((($PLANET~PLANET_FUEL * $percentToSet) / 100)/2) < $cannonDamage)
            add $percentToSet 1
        end
    end
    if ($percentToSet > 100)
        setVar $percentToSet 100
    end
    if ($game~mbbs)
        setvar $totalDamage ((($PLANET~PLANET_FUEL * $percentToSet) / 100)*2)
    else
        setvar $totalDamage ((($PLANET~PLANET_FUEL * $percentToSet) / 100)/2)             
    end
    send "l a "&$percentToSet&"* "
    setVar $damageType "Atmosphere"
    setVar $switchboard~message "Quasar Cannon on planet "&$PLANET~PLANET&" is set to "&$totalDamage&". ("&$damageType&")*"
    gosub :switchboard~switchboard
return


:wait_for_command
halt

:killthetriggers
    killalltriggers
return

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
include "source\module_includes\prompt"
