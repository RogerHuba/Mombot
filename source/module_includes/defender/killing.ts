:checkForVictims
	gosub :killtriggers
	getWord CURRENTLINE $test 1
	if (($test = "P") OR ($test = "F") OR ($test = "R") OR ($test = ">"))
		echo ANSI_14 "*spoof attempt!*"
		return
	end	
:scanit_again
	gosub :killtriggers
	gosub :player~quikstats
	setvar $player~startingLocation $player~current_prompt
	gosub :sector~getSectorData
	setvar $capemptyships true
	if ($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips))
		goSub :player~fastCitadelAttack
		goto :scanit_again
	elseif (($sector~emptyShipCount > $sector~myShipCount) AND ($capEmptyShips = TRUE))
		gosub :player~fastCapture
		goto :scanit_again
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
			return
		end
		add $i 1
	end
return

:killtriggers
	killalltriggers
return