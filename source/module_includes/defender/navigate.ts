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
		setVar $que[1] $PLAYER~CURRENT_SECTOR
		setVar $checked[$PLAYER~CURRENT_SECTOR] 1
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
			getsectorparameter $focus "BUBBLE" $isBubble
			getsectorparameter $focus "MSLSEC" $isMsl
			if (($isFigged = true) and ($isBubble <> true) and ($isMsl <> true) and ($focus <> $player~current_sector))
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
		setVar $SWITCHBOARD~message "Can't find a route to any safe sectors.*"
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
