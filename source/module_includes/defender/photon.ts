:photon
	gosub :killtriggers

	setVar $adjsec 0
	setVar $i 1
	while (SECTOR.WARPSIN[$sector][$i] > 0)
		setVar $tempAdj SECTOR.WARPSIN[$sector][$i]
		getSectorParameter $tempAdj "FIGSEC" $isFigged
		if ($isFigged)
			setVar $adjsec $tempAdj
			goto :fire_photon
		end
		add $i 1
	end
	if ($adjsec <= 0)
		echo ANSI_12 "No Adjacent fig found*" ANSI_7
		return
	end

:fire_photon
	send "p"&$adjsec&"*  y  c  p  y  "&$sector&"**q"
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
	setvar $switchboard~message "Photon Missed! Resetting!*"
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

	getWordPos CURRENTLINE $pos "entered sector."
	if ($pos < 1)
		return
	end

	###############################################
	#  Check for alien hits - if the game has any #
	###############################################

	#if (($game~internalFerrengi = true) or ($game~internalAliens = true))
		getText CURRENTANSILINE $alien_check ": " "'s"
		getWordPos $alien_check $pos #27 & "[1;36m" & #27 & "["
		if ($pos > 0)
		     return
		end
	#end

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
