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
			setvar $isBubble $main~friendly_sectors[$focus]
			getsectorparameter $focus "MSLSEC" $isMsl
			getsectorparameter $focus "ALIENS" $isAlienSpace

			setVar $i 1
			if ($islimped = true)
				setvar $issecure true
				while (SECTOR.WARPSIN[$focus][$i] > 0)
					setVar $tempAdj SECTOR.WARPSIN[$focus][$i]
					getSectorParameter $tempAdj "FIGSEC" $isSecureFigged
					getsectorparameter $tempAdj "MSLSEC" $isSecureMsl
					if (($isSecureFigged <> true) OR ($isSecureMsl = true))
						setvar $issecure false
					end
					add $i 1
				end
			else
				setvar $issecure false
			end

			if (((($issecure = true) and ($securePwarp = true)) or ($securePwarp = false)) and ($isFigged = true) and ($isBubble <> true) and ($isMsl <> true) and ($isAlienSpace <> true) and ($focus <> $player~current_sector))
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
	SetTextLineTrigger homelock :foton_home_lock "Planetary TransWarp Drive Engaged!"
	setTextLineTrigger nohomelock :foton_no_home_lock "Your own fighters must be"
	setTextLineTrigger home_now :foton_home_lock "You are already in that sector!"
	settextlinetrigger pwarp_rdy :hit_y "All Systems Ready, shall we engage?"
	pause

	:foton_no_home_lock
		killtrigger homelock
		killtrigger nohomelock
		killtrigger home_now
		killtrigger pwarp_rdy
		setSectorParameter $nearfig "FIGSEC" false
		goto :try_again

		:hit_y
			send "y "
        :foton_home_lock
			killtrigger homelock
			killtrigger nohomelock
			killtrigger home_now
			killtrigger pwarp_rdy
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
		:try_again_limp
		while ($bottom <= $top)
			# Now, pull out the next sector in the queue, and make it our focus
			setVar $focus $que[$bottom]
			getsectorparameter $focus "FIGSEC" $isFigged
			getsectorparameter $focus "LIMPSEC" $isLimped
			
			###############################################################
			# if it's our bubble, the assumption is the sectors are clean #
			###############################################################
			setvar $isBubble $main~friendly_sectors[$focus]
			getsectorparameter $focus "MSLSEC" $isMsl
			getsectorparameter $focus "ALIENS" $isAlienSpace


			###########################################################################
			# Make sure limp sector is surrounded by our fighters and not next to MSL #
			###########################################################################
			setvar $issecure true
			while ((SECTOR.WARPSIN[$focus][$i] > 0) and ($issecure = true))
				setVar $tempAdj SECTOR.WARPSIN[$focus][$i]
				getSectorParameter $tempAdj "FIGSEC" $isSecureFigged
				getsectorparameter $tempAdj "MSLSEC" $isSecureMsl
				if (($isSecureFigged <> true) OR ($isSecureMsl = true))
					setvar $issecure false
				end
				add $i 1
			end
			if ((((($isFigged = true) and ($isLimped = true)) and ($issecure = true) and ($isAlienSpace <> true) and ($isMsl <> true)) or ($isBubble = true)) and (sector.navhaz[$focus] <= 0))
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
					goto :try_again_limp
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
	###################################################
	# Don't run if you are in a bubble or farm sector #
	###################################################
	if ($main~friendly_sectors[$player~current_sector] = true)
		return
	end
	gosub :sector~getSectorData
	setvar $planet_count SECTOR.PLANETCOUNT[$player~current_sector]
	if ((($sector~realTraderCount = $sector~corpieCount) and (SECTOR.PLANETCOUNT[$player~current_sector] = 1)) or ($player~current_sector = $map~home_sector))
		#############################################
		# do nothing if there is no enemy in sector #
		#############################################

		if (((SECTOR.LIMPETS.QUANTITY[$player~current_sector] <= 0) or (SECTOR.MINES.QUANTITY[$player~current_sector] <= 0)) and ($player~limpets > 0) and ($restock~deploymines = true))
			gosub :main~doMines
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
			setvar $switchboard~message "It appears there are no planets in sector with me.  Calling saveme.*"
			gosub :switchboard~switchboard
			gosub :call
		end

		######################################################################
		# Only run from shielded planets - might want to make this an option #
		######################################################################
		if ($shieldedPlanetCount <= 1)
			return
		end

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
			gosub :call
		end
		if ($starting_ship_type <> $player~ship_type)
			setvar $switchboard~message "I've been podded, but I am still on the planet.  Heading home and halting..*"
			gosub :switchboard~switchboard
			send "p"&$map~home_sector&"* y "
			halt
		end
	end

return


:callsaveme
	gosub :call
	gosub :killing~scan_for_targets
	gosub :runaway_if_needed
return


:call
:callagain
	setVar $BOT~command "call"
	setvar $bot~parm1 ""
	setVar $BOT~user_command_line " call  "
	setvar $bot~parm2 ""
	setvar $bot~parm3 ""
	setvar $bot~parm4 ""
	setvar $bot~parm5 ""
	setvar $bot~parm6 ""
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	savevar $bot~parm1
	savevar $bot~parm2
	savevar $bot~parm3
	savevar $bot~parm4
	savevar $bot~parm5
	savevar $bot~parm6
	load "scripts\"&$bot~mombot_directory&"\commands\defense\call.cts"
	setEventTrigger        callend1        :callend1 "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\defense\call.cts"
	pause
	:callend1


	gosub :player~quikstats
	if ($player~current_prompt <> "Citadel")
		setvar $switchboard~message "Not on planet even after call saveme.  I'm in real trouble.  Will try again in 15 seconds.*"
		gosub :switchboard~switchboard

		killalltriggers
		setDelayTrigger	   1 :callagain	15000
		pause
	end
	
	if ($starting_ship_type <> $player~ship_type)
		setvar $switchboard~message "Looks like I've been podded after saveme!  Heading back home, and shutting down.*"
		gosub :switchboard~switchboard
		send "p"&$map~home_sector&"* y "
		halt
	end

	gosub :planet~getplanetinfo
	if ($starting_planet <> $planet~planet)
		setvar $switchboard~message "Looks like I'm on a different planet than I started with.  Make sure the other one is picked up.  Will continue on my defender mission, though.*"
		gosub :switchboard~switchboard

		setvar $starting_planet $planet~planet		
	end
return