:hunt
    setvar $total_victims 0
    killalltriggers
    ########################################
    # $sector passed in from defender main #
    ########################################
    setvar $hunt_sector $sector

    ##########################################
	# Grab the nearest figged sector to port #
	##########################################

		setVar $bottom 1
		setVar $top 1
		setArray $checked SECTORS
		setVar $que[1] $hunt_sector
		setVar $checked[$hunt_sector] 1

		:tryAgain2
		while ($bottom <= $top)
			# Now, pull out the next sector in the que, and make it our focus
			setVar $focus $que[$bottom]
			getsectorparameter $focus "figsec" $isGoodSector
            if ($isGoodSector = true)
				setVar $nearfig $focus
				goto :start_the_hunt
			else
				:notit
				setVar $nearfig 0
			end
			# That wasn't it, so let's add all the adjacents to the que for future testing.
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
        setvar $switchboard~message "I can't find a fighter anywhere.  This doesn't seem right.  PR Hunter shutting down..*"
        gosub :switchboard~switchboard
        return
        
        
        :start_the_hunt
            send "p"&$nearfig&"*y  s*  "
            gosub :player~quikstats
            if ($player~current_sector <> $nearfig)
                setvar $switchboard~message "The near fighter I calculated to the gone port is, well, gone.  My data might need to be updated. Going back into normal defender mode.*"
                gosub :switchboard~switchboard
                return
            end
            setvar $hunting_start $nearfig
            setvar $player~current_sector $nearfig
            setvar $PLAYER~destination $hunt_sector
            gosub :player~getCourse
            if ($PLAYER~courseLength <= 0)
                setvar $switchboard~message "Can't find a course to the sector that I was hunting.  Going back to regular defender mode.*"
                gosub :switchboard~switchboard
                return
            end

            setVar $j 3
            setVar $result "q q q * "
            setVar $isSafe TRUE
            while (($j <= $PLAYER~courseLength) AND ($isSafe))
                setVar $nextSafeSector $PLAYER~mowCourse[$j]
                gosub :scan_and_kill_if_possible
                setVar $safeDensityValue 0
                if (PORT.EXISTS[$nextSafeSector] = TRUE)
                    add $safeDensityValue 100
                end
                if ((SECTOR.FIGS.QUANTITY[$nextSafeSector] > 0) AND ((SECTOR.FIGS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.FIGS.OWNER[$nextSafeSector] = "belong to your Corp")))
                    add $safeDensityValue (SECTOR.FIGS.QUANTITY[$nextSafeSector] * 5)
                end
                if ((SECTOR.LIMPETS.QUANTITY[$nextSafeSector] > 0) AND ((SECTOR.LIMPETS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.LIMPETS.OWNER[$nextSafeSector] = "belong to your Corp")) AND (SECTOR.ANOMALY[$nextSafeSector] = TRUE))
                    add $safeDensityValue (SECTOR.LIMPETS.QUANTITY[$nextSafeSector] * 3)
                end
                if ((SECTOR.MINES.QUANTITY[$nextSafeSector] > 0) AND ((SECTOR.MINES.OWNER[$nextSafeSector] = "yours") OR (SECTOR.MINES.OWNER[$nextSafeSector] = "belong to your Corp")))
                    add $safeDensityValue (SECTOR.MINES.QUANTITY[$nextSafeSector] * 2)
                end
                setVar $densitySafe ((SECTOR.DENSITY[$nextSafeSector] <= 0) OR (SECTOR.DENSITY[$nextSafeSector] = $safeDensityValue))
                if ($densitySafe <> TRUE)
                    setVar $minesSafe ((SECTOR.MINES.QUANTITY[$nextSafeSector] <= 0) OR (((SECTOR.MINES.OWNER[$nextSafeSector] = "yours") OR (SECTOR.MINES.OWNER[$nextSafeSector] = "belong to your Corp"))))
                    setVar $figsSafe  ((SECTOR.FIGS.QUANTITY[$nextSafeSector] <= 0) OR (((SECTOR.FIGS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.FIGS.OWNER[$nextSafeSector] = "belong to your Corp"))))
                    setVar $planet~planetSafe ((SECTOR.PLANETCOUNT[$nextSafeSector] <= 0) OR (($nextSafeSector = $MAP~stardock) OR ($nextSafeSector <= 10)))
                    setVar $navHazSafe (SECTOR.NAVHAZ[$nextSafeSector] <= 0)
                    setVar $player~limpetsSafe (SECTOR.ANOMALY[$nextSafeSector] = FALSE) OR ((((SECTOR.LIMPETS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.LIMPETS.OWNER[$nextSafeSector] = "belong to your Corp"))))
                end
                if ($densitySafe OR ($player~limpetsSafe AND $figsSafe AND $minesSafe AND $navHazSafe AND $planet~planetSafe))
                        send "m "&$PLAYER~mowCourse[$j]&"* "
                        setvar $player~current_sector $PLAYER~mowCourse[$j]
                else
                    setvar $switchboard~message "Can't go any further passively.  Heading back.*"
                    gosub :switchboard~switchboard
                    gosub :back_to_hunting_planet
                end
                if (($figsToDrop > 0) AND ($PLAYER~mowCourse[$j] > 10) AND ($PLAYER~mowCourse[$j] <> $MAP~stardock) AND ($j > 2))
                    send "f 1 * c d "
                    setVar $target $PLAYER~mowCourse[$j]
                    gosub :player~addfigtodata
                end
                add $j 1
            end
            gosub :scan_and_kill_if_possible
            gosub :back_to_hunting_planet
            setvar $switchboard~message "Made it all the way to the missing port.  Heading back now.  I found "&$total_victims&" along the way.*"
            gosub :switchboard~switchboard
return

:back_to_hunting_planet
    setvar $player~warpto $hunting_start
    gosub :player~twarp
    if ($player~twarpSuccess <> true)
        setvar $switchboard~message "I can't twarp back! - "&$player~msg&".*"
        gosub :switchboard~switchboard
        gosub :navigate~call
        return
    else
        send " l " $PLANET~PLANET " * n n * j m * * * j c  *  "
    end
    gosub :player~quikstats
    gosub :navigate~runaway_if_needed
    setvar $scrub~seek true
    gosub :scrub~run

return

:scan_and_kill_if_possible
    setvar $before_holo_kill_sector $player~current_sector
    gosub :combat~holokill
    if ($sector~holotargetfound = true)
        add $total_victims 1
    end
    if (($sector~holotargetfound = true) and ($player~current_sector <> $before_holo_kill_sector))
        setVar $PLAYER~WARPTO $before_holo_kill_sector
        gosub :PLAYER~twarp
        if (($PLAYER~twarpSuccess = FALSE) and ($player~msg <> "Already in that sector!"))
            setvar $switchboard~message "Could not make it back to starting sector after holokill. - ["&$player~msg&"]*"
            gosub :navigate~call
        end
    end
    if ($switchboard~message <> "No targets found adjacent.*")
        gosub :switchboard~switchboard
    end
    send "sd"
    gosub :PLAYER~quikstats
return