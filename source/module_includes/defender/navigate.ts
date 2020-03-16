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
					getSectorParameter $tempAdj "FIGSEC" $isFigged
					if ($isFigged <> true)
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
				send "s* "
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
