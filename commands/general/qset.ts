    gosub :BOT~loadVars

    setVar $BOT~help[1]  $BOT~tab&"qset - sets quasar cannon"
    setVar $BOT~help[2]  $BOT~tab&"         "
    setVar $BOT~help[3]  $BOT~tab&"Options: "
    setVar $BOT~help[4]  $BOT~tab&"    qset {s} [amount] - sets sector cannon to amount"
    setVar $BOT~help[5]  $BOT~tab&"    qset {a} [amount] - sets atmos cannon to amount"
    setVar $BOT~help[6]  $BOT~tab&"        qset [amount] - sets both cannons to amount"
    gosub :bot~helpfile

    loadvar $game~mbbs

:qset
:q
    getWord $bot~user_command_line $bot~parm1 1
    getWord $bot~user_command_line $bot~parm2 2
    gosub  :player~currentPrompt
    setVar $PROMPT~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $PROMPT~validPrompts "Planet Citadel"
    gosub :PROMPT~checkStartingPrompt
    setVar $totalDamage 0
    ## if the first param is not a number, assume they want to set only one cannon ##
    isNumber $number $bot~parm1
    if ($number <> true)
        setVar $cannonType $bot~parm1
        setVar $cannonDamage $bot~parm2
    else
        setvar $cannonType "both"
        setvar $cannonDamage $bot~parm1
    end
    gosub :doQsetProtections
    if ($PROMPT~startingLocation = "Citadel")
        send "q"
    end
    gosub :PLANET~getPlanetInfo
    if ($planet~citadel < 3)
        setvar $switchboard~message "Planet number "&$planet~planet&" does not have a quasar cannon.*"
        gosub :switchboard~switchboard
        if (($planet~citadel > 0) AND ($PROMPT~startingLocation = "Citadel"))
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
    halt
:doQsetProtections
    isNumber $number $bot~parm2
    if ($number <> TRUE)
        setVar $SWITCHBOARD~message "Cannon Damage Entered is not a number!*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
    if (($bot~parm1 <> "a") and ($bot~parm1 <> "s") and ($cannonType <> "both"))
        setVar $SWITCHBOARD~message "Please use qset [a/s] [damage]!*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
return


:set_sector_cannon
    setVar $percentToSet (((3*$cannonDamage)*100)/$planet~planet_FUEL)
    if (((($planet~planet_FUEL * $percentToSet) / 100)/3) < $cannonDamage)
        add $percentToSet 1
    end
    if ($percentToSet > 100)
        setVar $percentToSet 100
    end
    setvar $totalDamage ((($planet~planet_FUEL * $percentToSet) / 100)/3)
    send "l s "&$percentToSet&"* "
    setVar $damageType "Sector"
    setVar $switchboard~message "Quasar Cannon on planet "&$planet~planet&" is set to "&$totalDamage&". ("&$damageType&")*"
    gosub :switchboard~switchboard
return

:set_atmos_cannon
    if ($game~mbbs)
        setVar $percentToSet ((($cannonDamage/2)*100)/$planet~planet_FUEL)
        if (((($planet~planet_FUEL * $percentToSet) / 100)*2) < $cannonDamage)
            add $percentToSet 1
        end
    else
        setVar $percentToSet (((2*$cannonDamage)*100)/$planet~planet_FUEL)
        if (((($planet~planet_FUEL * $percentToSet) / 100)/2) < $cannonDamage)
            add $percentToSet 1
        end
    end
    if ($percentToSet > 100)
        setVar $percentToSet 100
    end
    if ($game~mbbs)
        setvar $totalDamage ((($planet~planet_FUEL * $percentToSet) / 100)*2)
    else
        setvar $totalDamage ((($planet~planet_FUEL * $percentToSet) / 100)/2)             
    end
    send "l a "&$percentToSet&"* "
    setVar $damageType "Atmosphere"
    setVar $switchboard~message "Quasar Cannon on planet "&$planet~planet&" is set to "&$totalDamage&". ("&$damageType&")*"
    gosub :switchboard~switchboard
return






#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player\currentprompt\player"
include "source\module_includes\prompt"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\switchboard"
