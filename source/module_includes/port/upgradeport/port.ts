#============================== MAX PORT ==============================
:upgradeport
:max
	killalltriggers
	gosub :PLAYER~quikstats
	setVar $bot~startingLocation $PLAYER~CURRENT_PROMPT
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	setVar $bot~validPrompts "Citadel Command"
	gosub :bot~checkStartingPrompt

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

	getWordPos " "&$bot~user_command_line&" " $pos " a "
	if ($pos > 0)
		setVar $doFuel TRUE
		setVar $doOrg TRUE
		setVar $doEqu TRUE
	end

	getWordPos " "&$bot~user_command_line&" " $pos " b "
	if ($pos > 0)
		if (PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = 1)
			setVar $doFuel TRUE
		end
		if (PORT.BUYORG[$PLAYER~CURRENT_SECTOR] = 1)
			setVar $doOrg TRUE
		end
		if (PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR] = 1)
			setVar $doEqu TRUE
		end
		
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
	setvar $class PORT.CLASS[$PLAYER~CURRENT_SECTOR] 
	if (($class = "0") or ($class = "9"))
		setvar $switchboard~message "Can't upgrade a class "&$class&" port.*"
		gosub :switchboard~switchboard
		halt
	end
	setvar $under_construction (PORT.BUILDTIME[$PLAYER~CURRENT_SECTOR] > 0)
	if ($under_construction = true)
		setvar $switchboard~message "Can't upgrade a port that's under construction.*"
		gosub :switchboard~switchboard
		halt
	end

	if (($doFuel <> TRUE) and ($doOrg <> TRUE) and ($doEqu <> TRUE))
		setvar $switchboard~message "Must choose f, o, e, a(ll) or b(uy prods) to upgrade.*"
		gosub :switchboard~switchboard
		halt
	end

	setVar $total_creds_needed 0
	if ($startingLocation = "Planet") OR ($startingLocation = "Citadel")
		if ($startingLocation = "Citadel")
			send "q"
		end
		gosub :player~quikstats
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
				setVar $totalFuelUpgradeNeeded  (($game~port_max - (($portFuel*100)/$portFuelPercent))/10)+1
				setVar $totalOrgUpgradeNeeded   (($game~port_max - (($portOrg*100)/$portOrgPercent))/10)+1
				setVar $totalEquipUpgradeNeeded (($game~port_max - (($portEquip*100)/$portEquipPercent))/10)+1
				setVar $total_creds_needed 0
				if ($doFuel = true)
					add $total_creds_needed (300*$totalFuelUpgradeNeeded)
				end
				if ($doOrg = true)
					add $total_creds_needed (500*$totalOrgUpgradeNeeded)
				end
				if ($doEqu = true)
					add $total_creds_needed (1000*$totalEquipUpgradeNeeded)
				end
				
				if ($total_creds_needed > $PLAYER~CREDITS)
					setVar $cashonhand $PLANET~CITADEL_CREDITS
					add $cashonhand $PLAYER~CREDITS
					if ($cashonhand > $total_creds_needed)
						send "T T " & $PLAYER~CREDITS & "* "
						send "T F " & $total_creds_needed & "* "
						setVar $PLAYER~CREDITS $total_creds_needed
						setvar $switchboard~message "Withdrew funds from the Treasury to complete the port max*"
						gosub :switchboard~switchboard
					else
						setvar $switchboard~message "Not enough money onhand or in citadel to do this upgrade.*"
						gosub :switchboard~switchboard
						halt
					end
				end
			end
			send "q q"
		else
			send "q"
		end
	end
	setVar $wrong FALSE
	if ($doFuel = true)
		setVar $product 1
		setVar $noExpAmount 9
		gosub :doMaxPort
		setSectorParameter CURRENTSECTOR "UPGRADEF" TRUE
	end
	if ($doOrg = true)
		setVar $product 2
		setVar $noExpAmount 4
		gosub :doMaxPort
		setSectorParameter CURRENTSECTOR "UPGRADEO" TRUE
	end
	if ($doEqu = true)
		setVar $product 3
		setVar $noExpAmount 3
		gosub :doMaxPort
		setSectorParameter CURRENTSECTOR "UPGRADEE" TRUE
	end
	if (($startingLocation = "Citadel") OR ($startingLocation = "Planet"))
		gosub :PLANET~landingSub
	end
	if ($wrong = true)
		setvar $switchboard~message "No valid port here.*"
		gosub :switchboard~switchboard
	end
	setvar $switchboard~message "Port upgrade complete in sector "&currentsector&".*"
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
    if ($no_exp = true)
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

include "source\module_includes\bot\checkstartingprompt\bot"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\planet\landingsub\planet"
