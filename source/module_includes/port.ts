
#============================== MAX PORT ==============================
:upgrade_port
:max
    killalltriggers
    gosub :PLAYER~quikstats
    setVar $PROMPT~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    setVar $PROMPT~validPrompts "Citadel Command"
    gosub :PROMPT~checkStartingPrompt

    getWordPos " "&$bot~user_command_line&" " $pos " f "
    if ($pos > 0)
        setVar $doFuel TRUE
    end
    getWordPos " "&$bot~user_command_line&" " $pos " o "
    if ($pos > 0)
        setVar $doOrg TRUE
    end
    getWordPos " "&$bot~user_command_line&" " $pos " e "
    if ($pos > 0)
        setVar $doEqu TRUE
    end
    getWordPos " "&$bot~user_command_line&" " $pos " noexp "
    if ($pos > 0)
        setVar $no_exp TRUE
    else
        setVar $no_exp FALSE
    end
    if ($startinglocation = "Command")
        send "** "
        waitOn "Warps to Sector(s)"
    else
        send "s* "
        waitOn "Warps to Sector(s)"
    end
    if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] <> TRUE)
        setvar $switchboard~message "No port in sector!*"
        gosub :switchboard~switchboard
        halt
    end


    if (($doFuel <> TRUE) and ($doOrg <> TRUE) and ($doEqu <> TRUE))
        if (PORT.BUYFUEL[$player~current_sector] = FALSE)
            setvar $dofuel true
        end
        if (PORT.BUYORG[$player~current_sector] = TRUE)
            setvar $doorg true
        end
        if (PORT.BUYEQUIP[$player~current_sector] = TRUE)
            setvar $doequ true
        end
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
                            setvar $switchboard~message "Withdrew funds from the Treasury to complete the port max*"
                            gosub :switchboard~switchboard
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
        setvar $switchboard~message "No valid port here.*"
        gosub :switchboard~switchboard
    end
    setvar $switchboard~message "Port upgrade complete.*"
    gosub :switchboard~switchboard
return
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




:build_port
    killalltriggers
    gosub :PLAYER~quikstats
    setVar $PROMPT~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    setVar $PROMPT~validPrompts "Citadel Command"
    gosub :PROMPT~checkStartingPrompt

    if ($startinglocation = "Command")
        send "** "
        waitOn "Warps to Sector(s)"
    else
        send "q"
        gosub :PLANET~getPlanetInfo
        send "m*** cs* "
        gosub :PLAYER~quikstats
    end
    if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = TRUE)
        setvar $switchboard~message "Already a port in sector!*"
        gosub :switchboard~switchboard
        halt
    end


    if (($bot~user_command_line = "") OR ($bot~user_command_line = "0"))
        setvar $port_name "Mind ()ver Matter"
    else
        setvar $port_name $bot~user_command_line
    end
    killalltriggers

    if ($startinglocation = "Citadel")
        if ($PLAYER~CREDITS < 50000)
                send "T F 50000*"
        end
    end
    gosub :PLAYER~quikstats
    if ($PLAYER~CREDITS < 50000)
            setVar $SWITCHBOARD~message "Not Enough Credits to Make Ports*"
            gosub :switchboard~switchboard
            halt
    end
    send "q q q z n * o3y" $port_name "*"
    killtrigger 1
    killtrigger 2
    setvar $fail false
    settextlinetrigger 1 :too_many "Sorry... All of the StarPort Licenses have been granted."
    settextlinetrigger 2 :build_success "For building this Starport, you receive"
    pause
    :too_many
        setvar $switchboard~message "Too many ports in the universe!*"
        gosub :switchboard~switchboard
        setvar $fail true
    :build_success
        if ($fail = false)
            setvar $switchboard~message "Port successfully created!*"
            gosub :switchboard~switchboard
        end
    killtrigger 1
    killtrigger 2
    if ($startinglocation = "Citadel")
        send "l " & #8 & $PLANET~PLANET & "*  c  s* "
   end

return


:destroy_port
    gosub :PLAYER~quikstats
    setVar $PROMPT~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    setVar $PROMPT~validPrompts "Citadel Command"
    gosub :PROMPT~checkStartingPrompt

    if ($startinglocation = "Command")
        send "** "
        waitOn "Warps to Sector(s)"
    else
        if ($planet~planet = "0")
            send "q"
            gosub :PLANET~getPlanetInfo
            send "m*** cs* "
            gosub :PLAYER~quikstats
        end
    end
    if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] <> TRUE)
        setvar $switchboard~message "No port in sector!*"
        gosub :switchboard~switchboard
        halt
    end
    gosub :SHIP~getShipStats

    if (PORT.EXISTS[$player~current_sector] = TRUE)
        :keepDestroying
        killtrigger 1
        killtrigger 2
        killtrigger 3
        killtrigger 4
        gosub :PLAYER~quikstats
        if ($PLAYER~FIGHTERS >= $SHIP~SHIP_MAX_ATTACK)
            if ($startinglocation = "Citadel")
                send "q q q * *  "
            end
            send "p"
            setTextTrigger 1 :portAlreadyGone "Captain! Are you sure you want to port here?"
            setTextTrigger 2 :continueDestroy "<A> Attack this Port"
            pause
            :continueDestroy
            killtrigger 1
            killtrigger 2
            killtrigger 3
            killtrigger 4
            send " a y "&$SHIP~SHIP_MAX_ATTACK&"** "
            if ($startinglocation = "Citadel")
                send "l "&$planet~planet&"* m * * * q "
            end
            setTextTrigger 1 :keepDestroying "Incoming laser barrage from"
            setTextTrigger 2 :doneDestroying "You destroyed the Star Port!"
            pause
            :doneDestroying
            :portAlreadyGone
                send "*   "
                if ($startinglocation = "Citadel")
                    send "l "&$planet~planet&"* c s*  "
                end
                killtrigger 1
                killtrigger 2
                killtrigger 3
                killtrigger 4

        else
            setVar $SWITCHBOARD~message "Not enough fighters.  Better reload before the you blow up this port.*"
            gosub :SWITCHBOARD~switchboard
            halt
        end
    end
halt


:CommaSize
    If ($CashAmount < 1000)
        #do nothing
    ElseIf ($CashAmount < 1000000)
        getLength $CashAmount $len
        SetVar $len ($len - 3)
        cutText $CashAmount $tmp 1 $len
        cutText $CashAMount $tmp1 ($len + 1) 999
        SetVar $tmp $tmp & "," & $tmp1
        SetVar $CashAmount $tmp
    ElseIf ($CashAmount <= 999999999)
        getLength $CashAmount $len
        SetVar $len ($len - 6)
        cutText $CashAmount $tmp 1 $len
        SetVar $tmp $tmp & ","
        cutText $CashAmount $tmp1 ($len + 1) 3
        SetVar $tmp $tmp & $tmp1 & ","
        cutText $CashAmount $tmp1 ($len + 4) 999
        SetVar $tmp $tmp & $tmp1
        SetVar $CashAmount $tmp
    end
return
