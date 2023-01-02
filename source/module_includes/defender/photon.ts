:photon
	killalltriggers
	setvar $success false
	setVar $adjsec 0
	loadVar $bot~last_hit
	if (($bot~last_hit > 0) and ($density <> true))
		setvar $sector $bot~last_hit
	end

	setVar $adjsec $main~attack_sectors[$sector]

	if ($adjsec > 0)
		if ($adjacentphoton = true)
			goto :fire_photon
		else
			if ($density = true)
				send "p" $adjsec "*  y  "
				if ($mode~allkeys = true)
					send "c n 9 * q "
					setvar $photon~is_all_keys false
				end
				gosub :densityDrop
			else
				send "p" $adjsec "*  y   p" $sector "*  y  "
			end
			return
		end
	end
return
:fire_adjacent
	killalltriggers
	setvar $success false
	if ($adjacentphoton = true)
		send " c  p  y  " $sector "**qp" $sector "*  y  "
		goto :triggers
	else
		if ($density = true)
			if ($mode~allkeys = true)
				send "c n 9 * q "
				setvar $photon~is_all_keys false
			end
			gosub :densityDrop
		else
			send " p" $sector "*  y  "
		end
		return
	end
	
:fire_photon
	setvar $success false
	###############################
	# always try to drop directly #
	###############################
	if ($mode~allkeys = true)
		send "p" $adjsec "*  y  c  p  y  " $sector "**qp" $sector "*  y  c n 9 * q "
		setvar $photon~is_all_keys false
	else
		send "p " $adjsec "*  y  c  p  y  " $sector "* * q p " $sector "*  y  "
	end
	:triggers
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
	if ($adjsec > 0)
		setvar $switchboard~message "Didn't make it to sector "&$adjsec&". Resetting!*"
		gosub :switchboard~switchboard
		setSectorParameter $adjsec "FIGSEC" FALSE
	end
	return

:photon_overheated
	gosub :killtriggers
	setvar $switchboard~message "Photon overheated.  Have to wait before firing again.*"
	gosub :switchboard~switchboard
	return

:photon_none
	setvar $player~photons 0
	gosub :killtriggers
	setvar $switchboard~message "Ran out of photons.  Need to buy more..*"
	gosub :switchboard~switchboard
	return


:photon_gotem
	gosub :killtriggers
	if ($shooting_count > 1)
		setvar $photon_shot $shooting_count
		send "  c  "
		while ($photon_shot > 1)
			################################
			# this only runs on multishoot #
			################################
			send " p  y  " $sector "**"
			subtract $photon_shot 1
		end
		send "q  "
	end

	setvar $switchboard~message "Photon fired - sector => " & $sector & "!*"
	if ($shooting_count > 1)
		setvar $switchboard~message $shooting_count&" photons fired - sector => " & $sector & "!*"
	end
	gosub :switchboard~switchboard
	gosub :player~quikstats
	setvar $success true
	add $shot 1
	###################################
	# if direct drop worked, do htorp #
	###################################
	if ($player~current_sector = $sector)
		###########################################################################################
		# if you make it to direct drop, mulch them.  Could be dangerous for corbo traps, though. #
		###########################################################################################
		send "q q a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n l "&$planet~planet&"*  m  *** q z n a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n  l "&$planet~planet&"*  m  *** q z n a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n  l "&$planet~planet&"*  m  *** c  "

		#######################################
		# then holo torp in case they retreat #
		#######################################
		gosub :htorp
	else
		###################################################
		# don't do density if you are in sector with them #
		###################################################
		if ($density = true)
			gosub :densityDrop
		end
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
	setvar $adjacent false
	setvar $surround false
	setvar $spoof false

	#########################################################
	# attempting to limit spoof test for speed purposes     #
	# leaving the lines here in case they work better later #
	#########################################################

	#loadVar $bot~ansi_last_fighter_attack
	#getWord $bot~ansi_last_fighter_attack $ansi_spoof_test 1
	#getWordPos $ansi_spoof_test $ansi_spoof_pos #27 & "[1;33m"
	#if ($spoof_test <> "Deployed") OR ($ansi_spoof_pos <= 0)
	
	loadVar $bot~last_fighter_attack
	getWord $bot~last_fighter_attack $spoof_test 1
	if ($spoof_test <> "Deployed")
		setvar $spoof true
		return
	end

	#############################
	# Torp only on sector entry #
	#############################

	# Get the sector number
	getWord $bot~last_fighter_attack $sector 5
	stripText $sector ":"
	isNumber $isANumber $sector
	if (($isANumber <> true) OR ($sector > SECTORS) OR ($sector <= 10))
		 return
	end

# logic for seeing corpies and not firing on personal fighters - needs tweaking #
#	while ($i <= $sentinel~corp_count)
#		getwordpos $bot~last_fighter_attack $pos $sentinel~corp_members[$i]&" "
#		if ($pos > 0)
#			return
#		end
#		add $i 1
#	end

	#########################################
	# ignore fighter hits in current sector #
	#########################################
	if ($sector = $player~current_sector)
		return
	end

	getwordpos $adjacent_sectors $pos " "&$sector&" "
	if ($pos > 0)
		setvar $found true
		setvar $adjacent true
		goto :fire_adjacent
	end


	getwordpos $bot~last_fighter_attack $posretreat " retreated."
	getwordpos $bot~last_fighter_attack $posdestroyed " DESTROYED "
	getWordPos $bot~last_fighter_attack $pos "entered sector."
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
		setvar $alien false
		loadVar $bot~ansi_last_fighter_attack
		getText $bot~ansi_last_fighter_attack $alien_check ": " "'s"
		getWordPos $alien_check $pos #27 & "[1;36m" & #27 & "["
		if ($pos > 0)
			setvar $alien true
			return
		end
	end
#	if ($paranoid = true)
#		getSectorParameter $sector "LIMPSEC" $isLimped
#		if ($isLimped <> true)
#			return
#		end
#	end
	setvar $found true
return

:limpet_spoof
	setvar $found false
	setvar $adjacent false
	loadVar $bot~last_limpet_attack
	cutText $bot~last_limpet_attack&"      " $ck 1 6
	setvar $spoof false
	if ($ck <> "Limpet")
		setvar $spoof true
		return
	end
	getWord $bot~last_limpet_attack $sector 4
	getwordpos $adjacent_sectors $pos " "&$sector&" "
	setvar $found true
	if ($pos > 0)
		setvar $adjacent true
		goto :fire_adjacent
	end
return

:armid_spoof
	setvar $found false
	setvar $adjacent false
	loadVar $bot~last_armid_attack
	loadVar $bot~ansi_last_armid_attack
	cutText $bot~last_armid_attack&"    " $ck 1 4
	setvar $spoof false
	if ($ck <> "Your")
		setvar $spoof true
		return
	end
	if ($game~hasAliens = true)
		#[K[32mYour mines in [1;33m8174[0;32m did [1;33m14[0;32m damage to #[1;36m[33mFerrengi[36m Nik
		setvar $alien false
		getText $bot~ansi_last_armid_attack&"[xx][xx][xx]" $alien_check " damage to " "[xx][xx][xx]"
		getWordPos $alien_check $pos #27 & "[1;36m" & #27 & "["
		if ($pos > 0)
			setvar $alien true
			return
		end
	end
	getWord $bot~last_armid_attack $sector 4
	getwordpos $adjacent_sectors $pos " "&$sector&" "
	setvar $found true
	if ($pos > 0)
		setvar $adjacent true
		goto :fire_adjacent
	end
	if ($paranoid = true)
		getSectorParameter $sector "LIMPSEC" $isLimped
		if ($isLimped <> true)
			return
		end
	end
return

:densityDrop
	waitfor "Citadel command"
	send "q m * * * q  * * "
	#send "fz 3500* * zcd * "
	setVar $checks 0
	if ($long = true)
		setvar $density_stop_count 120
		setvar $long false
	else
		setvar $density_stop_count 40
	end
	:check_dens
		setVar $mm 0
		setVar $i 1
		send "sz*"
		waiton "Relative Density Scan"

	:dtorp_Start
		killTrigger alldone
		setvar $attack_sector_found false
		setTextLineTrigger getSec :getSec "Sector"
		setTextTrigger allDone :allDone "Command [TL="
		pause

	:getSec
		getText CURRENTLINE $temp "Sector" "==>"
		stripText $temp "("
		stripText $temp ")"
		stripText $temp " "
		setvar $adj[$i] $temp

		getText CURRENTLINE $Dens[$i] "==>" "Warps :"
		stripText $dens[$i] ","
		stripText $dens[$i] " "
		add $i 1
		setTextLineTrigger getSec :getSec "Sector"
		pause
	:allDone
		killTrigger getSec
		if ($checks > $density_stop_count)
			goto :manual_stop
		end
		gosub :firechk

	:letslook
		setVar $w 0

	:sublooky
		add $w 1
		if ($w > $i)
			goto :alldone
		elseif ($density[$w] <> $dens[$w])
			setVar $diff ($density[$w] - $dens[$w])
			if (($diff > 0) and ($diff < 500))
				gosub :do_action
				goto :dtorp_end
			else
				goto :sublooky
			end
		else
			goto :sublooky
		end

	:firechk
		setVar $y 1
		send "sz*"
		waiton "Relative Density Scan"
		add $checks 1
	:looky
		
		killtrigger dtop_dtorp
		killtrigger getsec
		killtrigger alldone
		killtrigger donelook
		killtrigger manual_stop
		setTextLineTrigger getSec :looksec "Sector"
		setTextTrigger donelook :donelook "Command [TL="
		
		pause

	:looksec
		getText CURRENTLINE $temp "Sector" "==>"
		stripText $temp "("
		stripText $temp ")"
		stripText $temp " "
		
		setvar $adjsec[$y] $temp
		getText CURRENTLINE $Density[$y] "==>" "Warps :"
		stripText $density[$y] ","
		stripText $density[$y] " "
		add $y 1
		setTextLineTrigger getSec :looksec "Sector"
		pause

	:donelook
		killtrigger getSec
		return

	:dtorp_end
		killalltriggers
		setvar $switchboard~message "Photon Missle Fired into sector => " & $adj[$w] & "*"
		gosub :switchboard~switchboard
		gosub :player~quikstats
		return
	:do_action
		send " c  p  y  " $adj[$w] "**q   l " $PLANET~PLANET " * n n * j m * * * j c  *  "
		return

	:manual_stop
	:densitywait
		killalltriggers
		send " l " $PLANET~PLANET " * n n * j m * * * j c  *  "
		return


:retreatphoton
	setvar $success false
	send "p" $sector "*  y  "
	setvar $player~current_sector $sector
	gosub :htorp
return

:htorp
	send "q q q * szh* l " & $planet~planet & "* c "
	setTextLineTrigger checkForHolo :continueCheckHolo "Select (H)olo Scan or (D)ensity Scan or (Q)uit?"
	setTextLineTrigger checkForDens :photonedhtorp "Relative Density Scan"  
	pause
	:continueCheckHolo
		setTextTrigger htorpsector :continuehtorpsector "[" & $PLAYER~CURRENT_SECTOR & "]"
		pause
	:continuehtorpsector
	if ($PLAYER~PHOTONS <= 0)
		echo ANSI_14 & "*No Photons on hand.**" & ANSI_7
		return
	end
	setVar $i 1
	while (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$i] > 0)
		setVar $adj_sec SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$i]
		if (SECTOR.TRADERCOUNT[$ADJ_SEC] > 0)
			setVar $targetInSector FALSE
			setVar $player~corpMemberInSector FALSE
			setVar $j 1
			while (SECTOR.TRADERS[$ADJ_SEC][$j] <> 0)
				setVar $tempTarget SECTOR.TRADERS[$ADJ_SEC][$j]
				getLength $tempTarget $targetLength
				if ($targetLength >= 4)
					cutText $tempTarget $targetCorp ($targetLength-4) 999
					getText $targetCorp $targetCorp "[" "]"
					if ($targetCorp <> $PLAYER~CORP)
						setVar $targetInSector TRUE
					end
					if ($targetCorp = $PLAYER~CORP)
						setVar $player~corpMemberInSector TRUE
					end
				end
				add $j 1
			end
			if (($targetInSector = TRUE) AND ($player~corpMemberInSector = FALSE) and ($adj_sec > 10) and ($adj_sec <> $map~stardock))
				send "c p y " $ADJ_SEC "* *q"
				setvar $switchboard~message "Photon fired into sector " & $ADJ_SEC & "!*"
				gosub :switchboard~switchboard
				return
			end
		end
		add $i 1
	end
	if ($PLAYER~startingLocation = "Citadel")
		setTextTrigger waitforcit :continuewaitforcit "Citadel command (?=help)"
		pause
		:continuewaitforcit
	end
	echo ANSI_14 & "*No valid targets**" & ANSI_7
	return

	:photonedHtorp
		setvar $switchboard~message "I have no holographic scanner, perhaps I was photoned?*"
		gosub :switchboard~switchboard
	return

return