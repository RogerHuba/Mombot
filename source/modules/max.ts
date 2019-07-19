
    logging off
    gosub :BOT~loadVars

    setVar $BOT~help[1] $BOT~tab&"Upgrades a port product as much as possible.  "
    setVar $BOT~help[2] $BOT~tab&"         "
    setVar $BOT~help[3] $BOT~tab&"Options: "
    setVar $BOT~help[4] $BOT~tab&"{noexp} - Upgrades port without experience increase."
    gosub :bot~helpfile



#============================== MAX PORT ==============================
:maxport
:max
    killalltriggers
    gosub :PLAYER~quikstats
    setVar $bot~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    setVar $bot~validPrompts "Citadel Command Planet"
    gosub :bot~checkStartingPrompt
    if ($parm1 <> "f") AND ($parm1 <> "o") AND ($parm1 <> "e")
        send "'{" $SWITCHBOARD~bot_name "} - maxport [f / o / e] noexp*"
        halt
    end

    getWordPos " "&$user_command_line&" " $pos " f "
    if ($pos > 0)
        setVar $doFuel TRUE
    end
    getWordPos " "&$user_command_line&" " $pos " o "
    if ($pos > 0)
        setVar $doOrg TRUE
    end
    getWordPos " "&$user_command_line&" " $pos " e "
    if ($pos > 0)
        setVar $doEqu TRUE
    end
    getWordPos " "&$user_command_line&" " $pos " noexp "
    if ($pos > 0)
        setVar $no_exp TRUE
    else
        setVar $no_exp FALSE
    end
    setVar $total_creds_needed 0
    if ($startingLocation = "Planet") OR ($startingLocation = "Citadel")
        if ($startingLocation = "Citadel")
            send "q"
        end
        gosub :PLANET~getPlanetInfo
        if ($PLANET~CITADEL > 0)
            send "cs* "
            waitOn "<Enter Citadel>"
            waitOn "Warps to Sector(s)"
            if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR])
                send "cr*q"       
                waitOn "Fuel Ore"
                getWord CURRENTLINE $portFuel 4
                getWord CURRENTLINE $portFuelPercent 5
                stripText $portFuelPercent "%"
                waitOn "Organics"
                getWord CURRENTLINE $portOrg 3
                getWord CURRENTLINE $portOrgPercent 4
                stripText $portOrgPercent "%"
                waitOn "Equipment"
                getWord CURRENTLINE $portEquip 3
                getWord CURRENTLINE $portEquipPercent 4
                stripText $portEquipPercent "%"
                if ($portEquipPercent <= 0)
                    setVar $portEquipPercent 1
                end
                if ($portOrgPercent <= 0)
                    setVar $portOrgPercent 1
                end
                if ($portFuelPercent <= 0)
                    setVar $portFuelPercent 1
                end
                setVar $totalFuelUpgradeNeeded  (($port_max - (($portFuel*100)/$portFuelPercent))/10)+1
                setVar $totalOrgUpgradeNeeded   (($port_max - (($portOrg*100)/$portOrgPercent))/10)+1
                setVar $totalEquipUpgradeNeeded (($port_max - (($portEquip*100)/$portEquipPercent))/10)+1
                setVar $total_creds_needed 0
                if ($doFuel = "f")
                    add $total_creds_needed (300*$totalFuelUpgradeNeeded)
                elseif ($doOrg = "o")
                    add $total_creds_needed (500*$totalOrgUpgradeNeeded)
                else
                    add $total_creds_needed (1000*$totalEquipUpgradeNeeded)
                end
                if ($total_creds_needed > $PLAYER~CREDITS)
                    setVar $cashonhand $PLANET~CITADEL_CREDITS
                    add $cashonhand $PLAYER~CREDITS
                    if ($cashonhand > $total_creds_needed)
                            if ($startingLocation = "Planet")
                            send "C"
                            end
                        send "T T " & $PLAYER~CREDITS & "* "
                            send "T F " & $total_creds_needed & "* "
                            setVar $PLAYER~CREDITS $total_creds_needed
                            send "'{" $SWITCHBOARD~bot_name "} - Withdrew funds from the Treasury to complete the port max*"
                        end
                end
            end
            send "q q"
        else
            send "q"
        end
    end
    setVar $wrong FALSE
    if ($doFuel)
        setVar $product 1
        setVar $noExpAmount 9
        gosub :doMaxPort
    end
    if ($doOrg)
        setVar $product 2
        setVar $noExpAmount 4
        gosub :doMaxPort
    end
    if ($doEqu)
        setVar $product 3
        setVar $noExpAmount 3
        gosub :doMaxPort
    end
    if (($startingLocation = "Citadel") OR ($startingLocation = "Planet"))
        gosub :PLANET~landingSub
    end
    if ($wrong)
        send "'{" $SWITCHBOARD~bot_name "} - No valid port here.*"
    end
    send "'{" $SWITCHBOARD~bot_name "} - Port upgrade complete.*"
    halt
#============================== END MAX PORT SUB ==============================
:doMaxPort
    send "o z" $product "z0* "
    setTextLineTrigger noRealPortHere :wrongPortType "Do you want to initiate construction on this port?"
    setTextLineTrigger construction :wrongPortType "Do you want instructions (Y/N)"
    waitOn ", 0 to quit)"
    killalltriggers
    getWord CURRENTLINE $upgradeAmount 9
    stripText $upgradeAmount "("
    send "o "
    if ($no_exp)
        while ($upgradeAmount > 0)
            if ($upgradeAmount > 3)
                send $product " " $noExpAmount "* "
                subtract $upgradeAmount $noExpAmount
            else
                send $product " " $upgradeAmount "* "
                subtract $upgradeAmount $upgradeAmount
            end
        end
        send "* * "
    else
        send $product " " $upgradeAmount "* * "
    end
    send "CR*Q"
    waitOn "<Computer deactivated>" 
    :doneMaxPort
    killalltriggers
return


:wrongPortType
    setVar $wrong TRUE
    goto :doneMaxPort

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
include "source\module_includes\prompt"
