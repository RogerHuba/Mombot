    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $self_command
    loadVar $stardock
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 
    loadvar $SWITCHBOARD~self_command 
    loadVar $GAME~mbbs
    setvar $mbbs $GAME~mbbs

:qset
:q
    getWord $user_command_line $parm1 1
    getWord $user_command_line $parm2 2
    gosub :doQsetProtections
    gosub :PLAYER~current_prompt
    setVar $PROMPT~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $PROMPT~validPrompts "Planet Citadel"
    gosub :PROMPT~checkStartingPrompt
    setVar $totalDamage 0
        setVar $cannonType $parm1
        setVar $cannonDamage $parm2
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
        if ($cannonType = "s")
            setVar $percentToSet (((3*$cannonDamage)*100)/$PLANET~PLANET_FUEL)
            if (((($PLANET~PLANET_FUEL * $percentToSet) / 100)/3) < $cannonDamage)
                add $percentToSet 1
            end
            if ($percentToSet > 100)
                setVar $percentToSet 100
            end
            add $totalDamage ((($PLANET~PLANET_FUEL * $percentToSet) / 100)/3)
            send "l s "&$percentToSet&"* "
            setVar $damageType "Sector"
        else
            if ($mbbs)
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
            if ($mbbs)
                add $totalDamage ((($PLANET~PLANET_FUEL * $percentToSet) / 100)*2)
            else
                add $totalDamage ((($PLANET~PLANET_FUEL * $percentToSet) / 100)/2)             
            end
            send "l a "&$percentToSet&"* "
            setVar $damageType "Atmosphere"
        end
        if ($PROMPT~startingLocation = "Planet")
            send "q "
        end
        setVar $SWITCHBOARD~message "Quasar Cannon on planet "&$PLANET~PLANET&" is set to "&$totalDamage&". ("&$damageType&")*"
        waiton "What level do you want"
        gosub :SWITCHBOARD~switchboard
    end
    goto :wait_for_command
:doQsetProtections
    isNumber $number $parm2
    if ($number <> TRUE)
        setVar $SWITCHBOARD~message "Cannon Damage Entered is not a number!*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
    if (($parm1 <> "a") and ($parm1 <> "s"))
        setVar $SWITCHBOARD~message "Please use qset [a/s] [damage]!*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
        return

:wait_for_command
halt

:killthetriggers
    killalltriggers
return

# includes:
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
