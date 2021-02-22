:checkForVictims
	getWord CURRENTLINE $test 1
	setvar $error false
	if (($test = "P") OR ($test = "F") OR ($test = "R") OR ($test = ">"))
		echo ANSI_14 "*spoof attempt!*"
		return
	end	

:scan_for_targets

	killalltriggers
	if ($nokill = true)
		return
	end
	if ($photon~is_all_keys)
		send "c n 9 * q "
	end
	setvar $photon~is_all_keys false

	if ($switch)
		setvar $combat~switch true
		setvar $SHIP~SHIP_MAX_ATTACK $switch_ship_max_attack
		setvar $SHIP~SHIP_OFFENSIVE_ODDS $switch_ship_offensive_odds
	else
		setvar $combat~switch false
	end
	setvar $error false
	setvar $player~startinglocation $player~current_prompt
	if ($player~startingLocation <> "Citadel")
		gosub :player~quikstats
		setvar $player~startinglocation $player~current_prompt
	end
	if ($player~startinglocation <> "Citadel")
		#########################################
		# Something has gone wrong, call saveme #
		#########################################
		gosub :navigate~call
	end
	if ($navigate~starting_ship_type <> $player~ship_type)
		setvar $switchboard~message "I've been podded, but I am still on the planet.  Switching into ship on planet if possible.*"
		gosub :switchboard~switchboard
		gosub :switchships
		gosub :ship~getshipstats
		gosub :player~quikstats
		setvar $navigate~starting_ship_type $player~ship_type
		setvar $navigate~starting_ship_max_attack $ship~SHIP_MAX_ATTACK 
		setvar $navigate~starting_ship_offensive_odds $SHIP~SHIP_OFFENSIVE_ODDS 
		setvar $switch false
		#####################################################################
		# setting switch to false so we don't switch into a pod by accident #
		#####################################################################
	end

	gosub :sector~getSectorData
	setvar $planet_count SECTOR.PLANETCOUNT[$player~current_sector]
	if (($planet_count = 1) and ($overide = false))
		setvar $one_planet true
		setvar $player~override true
	else
		setvar $player~override false
	end
	savevar $ship~SHIP_MAX_ATTACK
	savevar $SHIP~SHIP_OFFENSIVE_ODDS
	setvar $capEmptyShips true
	if (($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips)))
		if ($switch)
			gosub :switchships
			setvar $SHIP~SHIP_MAX_ATTACK $switch_ship_max_attack
			setvar $SHIP~SHIP_OFFENSIVE_ODDS $switch_ship_offensive_odds
		end
		if ($capture = true)
			gosub :combat~fastCapture
			send " l " $PLANET~PLANET " * n n * j m * * * j c *  "
			gosub :player~quikstats
		else
			gosub :combat~fastCitadelAttack
		end
		if ($switch)
			gosub :switchships
			setvar $player~ship_type $navigate~starting_ship_type 
			setvar $ship~SHIP_MAX_ATTACK $navigate~starting_ship_max_attack
			setvar $ship~SHIP_OFFENSIVE_ODDS $navigate~starting_ship_offensive_odds 
		end
		if ($error)
			return
		end
		goto :scan_for_targets
	elseif ((($sector~emptyShipCount > $sector~myShipCount) AND ($capEmptyShips = TRUE)))
		if ($switch)
			gosub :switchships
			setvar $SHIP~SHIP_MAX_ATTACK $switch_ship_max_attack
			setvar $SHIP~SHIP_OFFENSIVE_ODDS $switch_ship_offensive_odds
		end
		gosub :combat~fastCapture
		send " l " $PLANET~PLANET " * n n * j m * * * j c  *  "
		if ($switch)
			gosub :switchships
			setvar $player~ship_type $navigate~starting_ship_type 
			setvar $ship~SHIP_MAX_ATTACK $navigate~starting_ship_max_attack
			setvar $ship~SHIP_OFFENSIVE_ODDS $navigate~starting_ship_offensive_odds 
		end

		setvar $switchboard~message "I just attempted to capture some empty ships in sector "&$player~current_sector&".  Someone might want to come clean them up.*"
		gosub :switchboard~switchboard

		goto :scan_for_targets
	end
	
	#########################################################
	# some weird code to kill beacons outside of our bubble #
	#########################################################

	if (($sector~containsBeacon = true) and ($main~friendly_sectors[$player~current_sector] <> true))
		send "q q a y * * * * * * * * * * * * l " $PLANET~PLANET " * n n * j m * * * j c  *  "
	end

return

:set_the_cannon
	loadGlobal $bot~last_fighter_attack
	loadGlobal $bot~ansi_last_fighter_attack
	setvar $alien false
	if ($game~hasAliens = true)
		getText $bot~ansi_last_fighter_attack $alien_check ": " "'s"
		getWordPos $alien_check $pos #27 & "[1;36m" & #27 & "["
		if ($pos > 0)
			setvar $alien true
			setvar $ship_type $last_ship_type
		end
	end
	if ($alien <> true)
		getText $bot~last_fighter_attack&" entered sector." $ship_type "'s "  " entered sector."
	end

	##############################################################
	# don't bother setting unless the ship gridding is different #
	##############################################################

	if ($last_ship_type = $ship_type)
		gosub :setcannons
		return
	end

	####################################################
	# checking to see if ship is in stored ship array  #
	# if not, it will set quasar to what is was before #
	####################################################

	setvar $i 1
	while ($i < $ship~shipcounter)
		getwordpos $ship~shipList[$i] $pos $ship_type
		if ($pos > 0)
			setvar $last_ship_type $ship_type

			setvar $switchboard~message "Setting cannon to kill "&$ship_type&" ship.*"
			gosub :switchboard~switchboard
				
			##############################################################################
			# grabbing attacking ship's max fighters +max shields + 10000 damage to offset fuel usage #
			##############################################################################
	
			setVar $quasar_damage ($ship~shipList[$i][5]+$ship~shipList[$i][1]+10000)
			gosub :setcannons
			gosub :switchboard~switchboard
			return
		end
		add $i 1
	end
return

:setcannons
	setvar $switchboard~message "" 
	if ($auto = true)

		setVar $percentToSet (((3*$quasar_damage)*100)/$PLANET~PLANET_FUEL)
		if (((($PLANET~PLANET_FUEL * $percentToSet) / 100)/3) < $quasar_damage)
			add $percentToSet 1
		end
		if ($percentToSet > 100)
			setVar $percentToSet 100
		end

		###############################################################
		# don't bother setting if percentage is the same as last time #
		###############################################################

		if ($last_percentage <> $percentToSet)
			setvar $last_percentage $percentToSet
			send "l s " $percentToSet "* "
		end
		setvar $cannon_damage ((($PLANET~PLANET_FUEL * $percentToSet) / 100)/3)
		setvar $switchboard~message "Sector cannon set to "&$cannon_damage&" damage.*"
	end

	#######################################################
	# always set atmos cannon for defense against landers #
	#######################################################
	if ($game~mbbs = true)
		setVar $atmos_percentToSet ((($quasar_damage/2)*100)/$planet~PLANET_FUEL)
		if (((($planet~PLANET_FUEL * $atmos_percentToSet) / 100)*2) < $quasar_damage)
			add $atmos_percentToSet 1
		end
	else
		setVar $atmos_percentToSet (((2*$quasar_damage)*100)/$planet~PLANET_FUEL)
		if (((($planet~PLANET_FUEL * $atmos_percentToSet) / 100)/2) < $quasar_damage)
			add $atmos_percentToSet 1
		end
	end
	############################################################
	# No point using all the fuel if it won't kill them anyway #
	############################################################
	if ($atmos_percentToSet > 100)
		setVar $atmos_percentToSet 1
	end
	if ($last_atmos_percentage <> $atmos_percentToSet)
		if ($game~mbbs = true)
			setvar $cannon_damage ((($planet~planet_FUEL * $atmos_percentToSet) / 100)*2)
		else
			setvar $cannon_damage ((($planet~planet_FUEL * $atmos_percentToSet) / 100)/2)             
		end
		setvar $switchboard~message $switchboard~message&"Atmos cannon set to "&$cannon_damage&" damage.*"
		setvar $last_atmos_percentage $atmos_percentToSet
		send "l a " $atmos_percentToSet "* "
	end

	if ($switchboard~message <> "")
		gosub :switchboard~switchboard
	end
return

:slingshot
	setvar $combat~slingshot true
:doHoloKill
	setvar $holokill_stuck false
	gosub :player~quikstats
	setvar $before_holo_kill_sector $player~current_sector
	if ($switch)
		setvar $combat~switch true
		setvar $SHIP~SHIP_MAX_ATTACK $switch_ship_max_attack
		setvar $SHIP~SHIP_OFFENSIVE_ODDS $switch_ship_offensive_odds
	else
		setvar $combat~switch false
	end
	if ($capture)
		gosub :combat~holocap		
	else
		gosub :combat~holokill
	end
	if (($player~current_sector <> $before_holo_kill_sector) and ($player~current_prompt <> "Citadel"))
		setVar $PLAYER~WARPTO $before_holo_kill_sector
		gosub :PLAYER~twarp
		if (($PLAYER~twarpSuccess = FALSE) and ($player~msg <> "Already in that sector!"))
			setvar $switchboard~message "Could not make it back to starting sector after holokill. - ["&$player~msg&"]*"
			gosub :switchboard~switchboard

			#########################################
			# Something has gone wrong, call saveme #
			#########################################
			gosub :navigate~call
			setvar $holokill_stuck true
		else 
			gosub :switchboard~switchboard
			send " l " $PLANET~PLANET " * n n * j m * * * j c  *  "
		end
	else
		if ($switch)
			setvar $ship~SHIP_MAX_ATTACK $navigate~starting_ship_max_attack
			setvar $ship~SHIP_OFFENSIVE_ODDS $navigate~starting_ship_offensive_odds 
		end
	end
return

:switchships 
	setvar $foundSwitchShip false
	killtrigger 1
	killtrigger 2
	setTextTrigger	1	:switchcheck	"Trade with "
	setTextTrigger	2	:switchdone 	"Citadel treasury contains "
	send " e"
	pause

	:switchcheck
		if ($foundSwitchShip = true)
			send "*"
		else
			getwordpos CURRENTLINE $pos "Trade with "&$main~saveme_user
			if ($pos > 0)
				setvar $foundSwitchShip true
				send "y"
			else
				send "*"
			end		
		end
		setTextTrigger	1	:switchcheck	"Trade with "
		pause
	:switchdone
		killtrigger 1
		killtrigger 2
return

:killtriggers
	killalltriggers
return

