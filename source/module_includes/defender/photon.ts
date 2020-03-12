:photon
	gosub :killtriggers
	setvar $success false
	setVar $adjsec 0
	setVar $i 1
	while (SECTOR.WARPSIN[$sector][$i] > 0)
		setVar $tempAdj SECTOR.WARPSIN[$sector][$i]
		getSectorParameter $tempAdj "FIGSEC" $isFigged
		if ($isFigged)
			setVar $adjsec $tempAdj
			if ($adjacentphoton = true)
				goto :fire_photon
			else
				if ($density = true)
					send "p" $adjsec "*  y  "
					gosub :densityDrop
				else
					send "p" $adjsec "*  y  p" $sector "*  y  "
				end
				return
			end
		end
		add $i 1
	end
	if ($adjsec <= 0)
		echo ANSI_12 "No Adjacent fig found*" ANSI_7
		return
	end

:fire_photon
	send "p" $adjsec "*  y  c  p  y  " $sector "**qp" $sector "*  y  "
	setTextLineTrigger	1	:photon_missed	      "That is not an adjacent sector"
	setTextLineTrigger	2	:photon_gotem	      "Photon Missile launched into sector"
	setTextLineTrigger	3	:photon_fed 	      "The Feds do not permit Photon Torpedos"
	setTextLineTrigger  4   :photon_none          "You do not have any Photon Missiles!"
	setTextLineTrigger  5   :photon_gotem         "Photon Wave Duration"
	setTextLineTrigger  6   :photon_overheated    "The missile tubes will overheat, Captain!  We better wait awhile."
	pause

:photon_fed
	gosub :killtriggers
	setvar $switchboard~message "Can't fire photon into fed space!*"
	gosub :switchboard~switchboard
	return

:photon_missed
	gosub :killtriggers
	setvar $switchboard~message "Didn't make it to sector "&$adjsec&". Resetting!*"
	gosub :switchboard~switchboard
	setSectorParameter $adjsec "FIGSEC" FALSE
	return

:photon_overheated
	gosub :killtriggers
	setvar $switchboard~message "Photon overheated.  Have to wait before firing again.*"
	gosub :switchboard~switchboard
	return

:photon_none
	gosub :killtriggers
	setvar $switchboard~message "Ran out of photons.  Need to buy more..*"
	gosub :switchboard~switchboard
	return


:photon_gotem
	gosub :killtriggers
	setvar $switchboard~message "Photon Fired - Sector => " & $sector & "!*"
	gosub :switchboard~switchboard
	gosub :player~quikstats
	setvar $success true
	###################################
	# if direct drop worked, do htorp #
	###################################
	if ($player~current_sector = $sector)
		gosub :htorp
	end
	if ($density = true)
		gosub :densityDrop
	end
	return

:killtriggers
	killtrigger 1
	killtrigger 2
	killtrigger 3
	killtrigger 4
	killtrigger 5
	killtrigger 6
return


:fighter_spoof
	setvar $found false
	getWord CURRENTLINE $spoof_test 1
	getWord CURRENTANSILINE $ansi_spoof_test 1
	getWordPos $ansi_spoof_test $ansi_spoof_pos #27 & "[1;33m"
	if ($spoof_test <> "Deployed") OR ($ansi_spoof_pos <= 0)
	     return
	end

	#############################
	# Torp only on sector entry #
	#############################

	getwordpos CURRENTLINE $posretreat " retreated."
	getwordpos CURRENTLINE $posdestroyed " DESTROYED "
	getWordPos CURRENTLINE $pos "entered sector."
	setvar $retreatfighter false
	if (($pos < 1) and ($posretreat < 1) and ($posdestroyed < 1))
		return
	else
		if (($posretreat > 0) or ($posdestroyed > 0))
			setvar $retreatfighter true
		end
	end

	###############################################
	#  Check for alien hits - if the game has any #
	###############################################

	if ($game~hasAliens = true)
		getText CURRENTANSILINE $alien_check ": " "'s"
		getWordPos $alien_check $pos #27 & "[1;36m" & #27 & "["
		if ($pos > 0)
		     return
		end
	end

	# Get the sector number
	getWord CURRENTLINE $sector 5
	stripText $sector ":"
	isNumber $result $sector
	if ($result < 1)
		return
	end
	if (($sector > SECTORS) OR ($sector <= 10))
		 return
	end

	############################################################################################
	# saving fighter line to look up ship for quasar hits                                      #
	# the idea is to set the sector cannon to kill the type of ship that is hitting grid last. #
	############################################################################################

	setvar $killing~last_fighter_attack CURRENTLINE
	setvar $found true
return

:limpet_spoof
	setvar $found false
	cutText CURRENTLINE&"      " $ck 1 6
	if ($ck <> "Limpet")
		goto :processing
	end
	getWord CURRENTLINE $sector 4
	setvar $found true
return

:armid_spoof
	setvar $found false
	cutText CURRENTLINE&"    " $ck 1 4
	if ($ck <> "Your")
		goto :processing
	end
	getWord CURRENTLINE $sector 4
	setvar $found true
return

:densityDrop

	waitfor "Citadel command"
	
	setVar $BOT~command "density"
	setVar $BOT~user_command_line " density photon "
	setVar $BOT~parm1 "photon"
	setVar $BOT~parm2 ""
	saveVar $BOT~parm1
	saveVar $BOT~parm2
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\mombot\modes\offense\density.cts"
	setEventTrigger        densityended        :densityended "SCRIPT STOPPED" "scripts\mombot\modes\offense\density.cts"
	setdelaytrigger        densitytime        :densitytime  120000
	pause
	:densitytime
		killalltriggers
		stop "scripts\mombot\modes\offense\density.cts"
		gosub :player~quikstats
		gosub :planet~landingsub
	:densityended
		killalltriggers
return


:retreatphoton
	send "p" $sector "*  y  "
	gosub :htorp
return

:htorp
	gosub :htorp~run
return