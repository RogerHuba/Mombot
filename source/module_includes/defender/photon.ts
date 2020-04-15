:photon
	killalltriggers
	setvar $success false
	setVar $adjsec 0
	loadGlobal $bot~last_hit
	if ($bot~last_hit > 0)
		setvar $sector $bot~last_hit
	end
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
					send "c n 9 * q "
					setvar $photon~is_all_keys false
					gosub :densityDrop
				else
					send "p" $adjsec "*  y   p" $sector "*  y  "
				end
				return
			end
		end
		add $i 1
	end
	setvar $switchboard~message "No Adjacent fig found!*"
	gosub :switchboard~switchboard
return
:fire_adjacent
	killalltriggers
	if ($adjacentphoton = true)
		send " c  p  y  " $sector "**qp" $sector "*  y  "
		goto :triggers
	else
		if ($density = true)
			send "c n 9 * q "
			setvar $photon~is_all_keys false
			gosub :densityDrop
		else
			send " p" $sector "*  y  "
		end
		return
	end
	
:fire_photon
	###############################
	# always try to drop directly #
	###############################
	send "p" $adjsec "*  y  c  p  y  " $sector "**qp" $sector "*  y  c n 9 * q "
	setvar $photon~is_all_keys false

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
	loadGlobal $bot~ansi_last_fighter_attack
	loadGlobal $bot~last_fighter_attack
	getWord $bot~last_fighter_attack $spoof_test 1
	getWord $bot~ansi_last_fighter_attack $ansi_spoof_test 1
	getWordPos $ansi_spoof_test $ansi_spoof_pos #27 & "[1;33m"
	setvar $spoof false
	if ($spoof_test <> "Deployed") OR ($ansi_spoof_pos <= 0)
		setvar $spoof true
		return
	end

	############################################################################################
	# saving fighter line to look up ship for quasar hits                                      #
	# the idea is to set the sector cannon to kill the type of ship that is hitting grid last. #
	############################################################################################

	#############################
	# Torp only on sector entry #
	#############################

	# Get the sector number
	getWord $bot~last_fighter_attack $sector 5
	stripText $sector ":"
	isNumber $result $sector
	if ($result < 1)
		return
	end
	if (($sector > SECTORS) OR ($sector <= 10))
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
		getText $bot~ansi_last_fighter_attack $alien_check ": " "'s"
		getWordPos $alien_check $pos #27 & "[1;36m" & #27 & "["
		if ($pos > 0)
			setvar $alien true
			return
		end
	end

	setvar $found true
return

:limpet_spoof
	setvar $found false
	setvar $adjacent false
	loadGlobal $bot~last_limpet_attack
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
	loadGlobal $bot~last_armid_attack
	loadGlobal $bot~ansi_last_armid_attack
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
return

:densityDrop

	waitfor "Citadel command"
	
	setVar $BOT~command "density"
	setVar $BOT~user_command_line " density photon attack:"&$sector&" density:2 "
	setVar $BOT~parm1 "photon"
	setVar $BOT~parm2 ""
	saveVar $BOT~parm1
	saveVar $BOT~parm2
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\"&$bot~mombot_directory&"\modes\offense\density.cts"
	setEventTrigger        densityended        :densityended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\offense\density.cts"
	setdelaytrigger        densitytime        :densitytime  120000
	pause
	:densitytime
		killtrigger densityended
		stop "scripts\"&$bot~mombot_directory&"\modes\offense\density.cts"
	:densityended
		killtrigger densitytime
		gosub :player~quikstats
		if ($player~current_prompt <> "Citadel")
			send " q q q * l " $PLANET~PLANET " * n n * j m * * * j c  *  "
			gosub :player~quikstats
			if ($player~current_prompt <> "Citadel")		
				setvar $switchboard~message "Not at correct prompt after density!  Maybe planet is gone?  Check please!*"
				gosub :switchboard~switchboard
				gosub :navigate~callsaveme
			end
		end
return


:retreatphoton
	send "p" $sector "*  y  "
	gosub :htorp
return

:htorp
	gosub :htorp~run
return