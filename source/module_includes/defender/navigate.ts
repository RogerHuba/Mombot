:navigate_away
	
	#########################################################################
	# need to navigate away from photon sector (to avoid invasion attempts) #
	# but only a couple sectors away to conserve fuel                       #
	# if it can navigate to potential next grid target, that would be ideal #
	#  - need to set cannon to correct damage                               #
    #########################################################################

		gosub :player~quikstats
		setVar $bottom 1
		setVar $top 1
		setArray $checked SECTORS
		setVar $que[1] $player~current_sector
		setVar $checked[$player~current_sector] 1
		setvar $a 1
		while (SECTOR.WARPS[$player~current_sector][$a] > 0)
			setVar $checked[SECTOR.WARPS[$player~current_sector][$a]] 1	
			add $a 1
		end
		:try_again
		while ($bottom <= $top)
			# Now, pull out the next sector in the queue, and make it our focus
			setVar $focus $que[$bottom]
			getsectorparameter $focus "FIGSEC" $isFigged
			getsectorparameter $focus "LIMPSEC" $isLimped
			getsectorparameter $focus "BUBBLE" $isBubble
			getsectorparameter $focus "MSLSEC" $isMsl

			setVar $i 1
			if ($islimped = true)
				setvar $issecure true
				while (SECTOR.WARPSIN[$focus][$i] > 0)
					setVar $tempAdj SECTOR.WARPSIN[$focus][$i]
					getSectorParameter $tempAdj "FIGSEC" $isSecureFigged
					if ($isSecureFigged <> true)
						setvar $issecure false
					end
					add $i 1
				end
			else
				setvar $issecure false
			end

			if (((($issecure = true) and ($securePwarp = true)) or ($securePwarp = false)) and ($isFigged = true) and ($isBubble <> true) and ($isMsl <> true) and ($focus <> $player~current_sector))
				setVar $nearfig $focus
				goto :pwarp_away
			end
			# That wasn't it, so let's add all the adjacents to the queue for future testing.
			setVar $a 1
			while (SECTOR.WARPS[$focus][$a] > 0)
				setVar $adjacent SECTOR.WARPS[$focus][$a]
				# But only add them if they haven't been added previously
				if ($checked[$adjacent] = 0)
					# Okay, this one hasn't been checked, so tag it and que it.
					setVar $checked[$adjacent] 1
					add $top 1
					setVar $que[$top] $adjacent
				end
				add $a 1
			end
			# The adjacents of $focus were all queued, now on to the next one.
			add $bottom 1
		end	
		setVar $SWITCHBOARD~message "Can't find a route to any safe sectors, heading back to start sector.*"
		gosub :SWITCHBOARD~switchboard
		gosub :head_home
		halt


:pwarp_away
	send "p" $nearfig "*y"
	SetTextLineTrigger homelock :foton_home_lock "Locating beam pinpointed"
	setTextLineTrigger nohomelock :foton_no_home_lock "Your own fighters must be"
	setTextLineTrigger home_now :foton_home_lock "You are already in that sector!"
	pause

	:foton_no_home_lock
		killtrigger homelock
		killtrigger nohomelock
		killtrigger home_now
		setSectorParameter $nearfig "FIGSEC" false
		goto :try_again

        :foton_home_lock
		killtrigger homelock
		killtrigger nohomelock
		killtrigger home_now
return



###################################################################################################
# need to get more photons, but don't want to catch an enemy limpet on the way back to the planet #
# so we need to make sure the planet we leave from has limpets, or is our bubble                  #
###################################################################################################

:navigate_to_limp
		gosub :player~quikstats
		setVar $bottom 1
		setVar $top 1
		setArray $checked SECTORS
		setVar $que[1] $player~current_sector
		setVar $checked[$player~current_sector] 0
		:try_again
		while ($bottom <= $top)
			# Now, pull out the next sector in the queue, and make it our focus
			setVar $focus $que[$bottom]
			getsectorparameter $focus "FIGSEC" $isFigged
			getsectorparameter $focus "LIMPSEC" $isLimped
			getsectorparameter $focus "BUBBLE" $isBubble
			getsectorparameter $focus "MSLSEC" $isMsl

			###############################################################
			# if it's our bubble, the assumption is the sectors are clean #
			###############################################################

			if ((((($isFigged = true) and ($isLimped = true)) and ($isMsl <> true)) or ($isBubble = true)) and (sector.navhaz[$focus] <= 0))
				setVar $nearfig $focus
				gosub :pwarp_away
				send "s"
				settexttrigger nomines :nomines "Citadel command (?=help)" 
				settexttrigger mines :mines "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
				pause

				:mines
				send "* "
				:nomines
				killtrigger nomines
				killtrigger mines
				
				if (sector.navhaz[$nearfig] > 0)
					########################################
					# don't restock where there is nav haz #
					########################################
					goto :try_again
				else
					return
				end
			end
			# That wasn't it, so let's add all the adjacents to the queue for future testing.
			setVar $a 1
			while (SECTOR.WARPS[$focus][$a] > 0)
				setVar $adjacent SECTOR.WARPS[$focus][$a]
				# But only add them if they haven't been added previously
				if ($checked[$adjacent] = 0)
					# Okay, this one hasn't been checked, so tag it and que it.
					setVar $checked[$adjacent] 1
					add $top 1
					setVar $que[$top] $adjacent
				end
				add $a 1
			end
			# The adjacents of $focus were all queued, now on to the next one.
			add $bottom 1
		end	
		setVar $SWITCHBOARD~message "Can't find a route to any safe sectors to refurb photons.*"
		gosub :SWITCHBOARD~switchboard
		gosub :head_home
		halt



:head_home
	send "p" $map~home_sector "*y"
	gosub :player~quikstats
	if ($player~current_sector = $map~home_sector)
		setVar $SWITCHBOARD~message "Made it back to home sector.  Shutting down.*"
		gosub :SWITCHBOARD~switchboard
	else
		setVar $SWITCHBOARD~message "Didn't make it back to the home sector!  Something is wrong - please check it out.*"
		gosub :SWITCHBOARD~switchboard
	end
	halt
return

:runaway_if_needed
	if ((($sector~realTraderCount = $sector~corpieCount) and (SECTOR.PLANETCOUNT[$player~current_sector] = 1)) or ($player~current_sector = $map~home_sector))
		#############################################
		# do nothing if there is no enemy in sector #
		#############################################

		if (((SECTOR.LIMPETS.QUANTITY[$player~current_sector] <= 0) or (SECTOR.MINES.QUANTITY[$player~current_sector] <= 0)) and ($player~limpets > 0) and ($restock~deploymines = true))
			gosub :doMines
		end
	else
		setVar $containsShieldedPlanet FALSE
		setVar $shieldedPlanetCount 0
		setVar $i 1
		while ($i <= SECTOR.PLANETCOUNT[$player~current_sector])
			getWord SECTOR.PLANETS[$player~current_sector][$i] $test 1
			if ($test = "<<<<")
				setVar $containsShieldedPlanet TRUE
				add $shieldedPlanetCount 1
			end
			add $i 1
		end
		if (SECTOR.PLANETCOUNT[$player~current_sector] < 1)
			#################################################
			# call saveme if there are no planets in sector #
			#################################################
			gosub :call~run
		end
		################################################
		#  TODO                                        #
		#for logic later to avoid only shielded planets#
	    ################################################

		:runaway_again
		gosub :navigate~navigate_away
		####################################################################
		# after navigating away, check for enemies in sector, just in case #
		####################################################################
		gosub :killing~scan_for_targets
		if (SECTOR.PLANETCOUNT[$player~current_sector] > 1)
			setSectorParameter $player~current_sector "FIGSEC" false
			goto :runaway_again
		end
		gosub :player~quikstats
		if ($player~current_prompt <> "Citadel")
			setvar $switchboard~message "Wrong prompt!  Something has gone wrong during runaway.*"
			gosub :switchboard~switchboard
			gosub :call~run
		end
		gosub :SHIP~getShipStats
		if ($call~starting_max_fighters <> $ship~SHIP_FIGHTERS_MAX)
			setvar $switchboard~message "I've been podded, but I am still on the planet.  Heading home and halting..*"
			gosub :switchboard~switchboard
			send "p"&$map~home_sector&"* y "
			halt
		end
	end

return

:callsaveme
	gosub :call~run
	gosub :killing~scan_for_targets
	gosub :runaway_if_needed
return

