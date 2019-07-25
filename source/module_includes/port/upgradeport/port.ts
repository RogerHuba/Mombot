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
