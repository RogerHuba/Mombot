:checkForVictims
	getWord CURRENTLINE $test 1
	if (($test = "P") OR ($test = "F") OR ($test = "R") OR ($test = ">"))
		echo ANSI_14 "*spoof attempt!*"
		return
	end	

:scan_for_targets
	killalltriggers
	setvar $error false
	gosub :player~quikstats
	setvar $player~startinglocation $player~current_prompt
	if ($player~startinglocation <> "Citadel")
		#########################################
		# Something has gone wrong, call saveme #
		#########################################
		gosub :callsaveme
	end
	gosub :sector~getSectorData
	setvar $planet_count SECTOR.PLANETCOUNT[$player~current_sector]
	if (($planet_count = 1) and ($overide = false))
		setvar $one_planet true
		setvar $player~override true
	else
		setvar $player~override false
	end
	if (($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips)) and (SECTOR.PLANETCOUNT[$player~current_sector] = 1))
		if ($player~fighters < 1000)
			setvar $error true
			setvar $switchboard~message "We don't have enough fighters - time to get out of here.*"
			gosub :switchboard~switchboard
			return
		end
		if ($capture = true)
			gosub :combat~fastCapture
			send " l " $PLANET~PLANET " * n n * j m * * * j c  *  "
			gosub :player~quikstats
		else
			gosub :combat~fastCitadelAttack
		end
		goto :scan_for_targets
	elseif ((($sector~emptyShipCount > $sector~myShipCount) AND ($capEmptyShips = TRUE)) and (SECTOR.PLANETCOUNT[$player~current_sector] = 1))
		if ($player~fighters < 1000)
			setvar $error true
			setvar $switchboard~message "We don't have enough fighters - time to get out of here.*"
			gosub :switchboard~switchboard
			return
		end
		gosub :combat~fastCapture
		send " l " $PLANET~PLANET " * n n * j m * * * j c  *  "
		gosub :player~quikstats
		goto :scan_for_targets
	end
return

:set_the_cannon
	getText $last_fighter_attack $ship_type "'s "  " entered sector."

	##############################################################
	# don't bother setting unless the ship gridding is different #
	##############################################################

	if ($last_ship_type = $ship_type)
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
				send "l s "&$percentToSet&"* "
			end
			setvar $cannon_damage ((($PLANET~PLANET_FUEL * $percentToSet) / 100)/3)
			setvar $switchboard~message "Sector cannon set to "&$cannon_damage&" damage.*"
			gosub :switchboard~switchboard
			return
		end
		add $i 1
	end
return

:slingshot
	setvar $combat~slingshot true
:doHoloKill
	gosub :player~quikstats
	setvar $before_holo_kill_sector $player~current_sector
	if ($capture)
		gosub :combat~holocap		
	else
		gosub :combat~holokill
	end
	if ($player~current_sector <> $before_holo_kill_sector)
		setVar $PLAYER~WARPTO $before_holo_kill_sector
		gosub :PLAYER~twarp
		if (($PLAYER~twarpSuccess = FALSE) and ($player~msg <> "Already in that sector!"))
			setvar $switchboard~message "Could not make it back to starting sector after holokill. - ["&$player~msg&"]*"
			gosub :switchboard~switchboard

			#########################################
			# Something has gone wrong, call saveme #
			#########################################
			gosub :callsaveme
			halt
		else 
			gosub :switchboard~switchboard
			send " l " $PLANET~PLANET " * n n * j m * * * j c  *  "
		end
	end
return


:killtriggers
	killalltriggers
return

:callsaveme
	if ($capture)
		setvar $call~capture true
	else
		setvar $call~kill true
	end
	gosub :call~run
return