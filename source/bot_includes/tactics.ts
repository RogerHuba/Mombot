
:bwarp
	send "b"
	setTextTrigger noBwarp  :noBwarp  "Would you like to place a subspace order for one? "
	setTextTrigger yesBwarp :yesBwarp "Beam to what sector? (U="
	setTextTrigger IGBwarp  :bwarpPhotoned "Your ship was hit by a Photon and has been disabled"
	pause
	:noBwarp
		killtrigger yesBwarp
		killtrigger IGBwarp
		killtrigger noBwarp
		send "*"
		setVar $SWITCHBOARD~message "No Bwarp installed on this planet*"
		gosub :SWITCHBOARD~switchboard
		return
	:yesBwarp
		killtrigger yesBwarp
		killtrigger IGBwarp
		killtrigger noBwarp
		send $player~warpto&"*"
		setTextTrigger bwarp_lock :bwarp_no_range "This planetary transporter does not have the range."
		setTextTrigger no_bwrp_lock :no_bwarp_lock "Do you want to make this transport blind?"
		setTextTrigger bwarp_ready :bwarp_lock "All Systems Ready, shall we engage?"
		setTextLineTrigger no_bwarpfuel :bwarpNoFuel "This planet does not have enough Fuel Ore to transport you."
		pause
	:bwarp_no_range
		killtrigger bwarp_lock
		killtrigger no_bwrp_lock
		killtrigger bwarp_ready
		killtrigger no_bwarpfuel
		setVar $SWITCHBOARD~message "Not enough range on this planet's transporter.*"
		gosub :SWITCHBOARD~switchboard
		return
	:no_bwarp_lock
		killtrigger bwarp_lock
		killtrigger no_bwrp_lock
		killtrigger bwarp_ready
		killtrigger no_bwarpfuel
		send "* "
		setVar $player~target $player~warpto
		setSectorParameter $player~target "FIGSEC" FALSE
		setVar $SWITCHBOARD~message "No fighter down at that destination, aborting*"
		gosub :SWITCHBOARD~switchboard
		return
	:bwarp_lock
		killtrigger bwarp_lock
		killtrigger no_bwrp_lock
		killtrigger bwarp_ready
		killtrigger no_bwarpfuel
		send "y     * "
		setVar $player~target $player~warpto
		setSectorParameter $player~target "FIGSEC" TRUE
		setVar $SWITCHBOARD~message "B-warp completed.*"
		gosub :SWITCHBOARD~switchboard
		return
	:bwarpNoFuel
		killtrigger bwarp_lock
		killtrigger no_bwrp_lock
		killtrigger bwarp_ready
		killtrigger no_bwarpfuel
		setVar $SWITCHBOARD~message "Not enough fuel on the planet to make the transport!*"
		gosub :SWITCHBOARD~switchboard
		return
	:bwarpPhotoned
		killtrigger yesBwarp
		killtrigger IGBwarp
		killtrigger noBwarp
		setVar $SWITCHBOARD~message "I have been photoned and can not B-warp!*"
		gosub :SWITCHBOARD~switchboard
		return

# ======================    START INTERNAL TWARP SUBROUTINE     ==========================
:twarp
	setVar $player~twarpSuccess FALSE
	setVar $original 9999999
	setVar $player~target 0
	if ($player~current_sector = $player~warpto)
		setVar $player~msg "Already in that sector!"
		goto :twarpDone
	elseif (($player~warpto <= 0) OR ($player~warpto > SECTORS))
		setVar $player~msg "Destination sector is out of range!"
		goto :twarpDone
	end
	if ($player~twarp_type = "No")
		setVar $player~msg "No T-warp drive on this ship!"
		goto :twarpDone
	end
	# check adj's for Dock.. if present, then we don't need a jump sector.
	setVar $WeAreAdjDock FALSE
	if (($player~warpto = $MAP~stardock) OR ($player~warpto <= 10))
		setVar $player~target $player~warpto
		setVar $a 1
		setVar $START_SECTOR $player~current_sector
		while ($a <= SECTOR.WARPCOUNT[$START_SECTOR])
			setVar $adj_start SECTOR.WARPS[$START_SECTOR][$a]
			if ($adj_start = $player~target)
				setVar $WeAreAdjDock TRUE
			end
			add $a 1
		end
	end
	setVar $RED_adj 0
	if (($player~alignment < 1000) AND ($WeAreAdjDock = FALSE) AND (($player~warpto = $MAP~stardock) OR ($player~warpto <= 10)))
		setVar $player~target $player~warpto
		gosub :FindJumpSector
		if ($RED_adj <> 0)
			setVar $original $player~warpto
			setVar $player~warpto $RED_adj
		else
			waitfor "Command [TL="
			setVar $player~msg "Cannot Find Jump Sector Adjacent Sector " & $player~target & "."
			goto :twarpDone
		end
	end
	if ($RED_adj <> 0)
		goto :twarp_lock
	end
	if ($player~startingLocation = "Citadel")
		send "q t*t1* q q * c u y q mz" $player~warpto "*"
	elseif ($player~startingLocation = "Planet")
		send "t*t1* q q * c u y q mz" $player~warpto "*"
	else
		send "q q q n n 0 * c u y q mz" $player~warpto "*"
	end
	setTextTrigger      there      :adj_warp       "You are already in that sector!"
	setTextLineTrigger  adj_warp   :adj_warp       "Sector  : "&$player~warpto&" "
	setTextTrigger      locking    :locking        "Do you want to engage the TransWarp drive?"
	setTextTrigger      igd        :twarpIgd       "An Interdictor Generator in this sector holds you fast!"
	setTextTrigger      noturns    :twarpPhotoned  "Your ship was hit by a Photon and has been disabled"
	setTextTrigger      noroute    :twarpNoRoute   "Do you really want to warp there? (Y/N)"
	setTextLineTrigger no_fuel     :twarpNoFuel "You do not have enough Fuel Ore"
	pause
	:adj_warp   
		gosub :killtwarptriggers
		send "z*"
		goto :twarp_adj
	:locking
		gosub :killtwarptriggers
		send "y"
		setTextLineTrigger twarp_lock :twarp_lock "TransWarp Locked"
		setTextLineTrigger no_twrp_lock :no_twarp_lock "No locating beam found"
		setTextLineTrigger twarp_adj :twarp_adj "<Set NavPoint>"
		setTextLineTrigger no_fuel :twarpNoFuel "You do not have enough Fuel Ore"
		pause
	:twarpNoFuel
		gosub :killtwarptriggers
		setVar $player~msg "Not enough fuel for T-warp."
		goto :twarpDone
	:twarp_adj
		gosub :killtwarptriggers
		send "z* "
		setVar $player~msg "That sector is next door, just plain warping."
		setVar $player~twarpSuccess TRUE
		goto :twarpDone
	:twarpNoRoute
		gosub :killtwarptriggers
		send "n* z* "
		setVar $player~msg "No route available to that sector!"
		goto :twarpDone
	:no_twarp_lock
		gosub :killtwarptriggers
		send "n* z* "
		setVar $player~target $player~warpto
		setSectorParameter $player~target "FIGSEC" FALSE
		setVar $player~msg "No fighters at T-warp point!"
		goto :twarpDone
	:twarpIgd
		gosub :killtwarptriggers
		setVar $player~msg "My ship is being held by Interdictor!"
		goto :twarpDone
	:twarpPhotoned
		gosub :killtwarptriggers
		setVar $player~msg "I have been photoned and can not T-warp!"
		goto :twarpDone
	:twarp_lock
		gosub :killtwarptriggers
		setVar $player~target $player~warpto
		setSectorParameter $player~target "FIGSEC" TRUE
		send "y   *     "
		setVar $player~msg "T-warp completed."
		setVar $player~twarpSuccess TRUE
	:twarpDone
	if (($player~twarpSuccess = TRUE) AND (($original = $MAP~stardock) OR ($original <= 10)))
		send "* m "&$original&"*  za9999* * "
	end
return
:killtwarptriggers
	killtrigger there
	killtrigger adj_warp
	killtrigger locking
	killtrigger igd
	killtrigger noturns
	killtrigger noroute
	killtrigger twarp_lock
	killtrigger no_twrp_lock
	killtrigger twarp_adj
	killtrigger no_fuel
return
# ======================    END INTERNAL TWARP SUBROUTINE     ==========================



	:getCourse
		setArray $player~mowCourse 80
		setVar $sectors ""
		if ($player~starting_point <= 0)
			setVar $player~starting_point ""
		end
		setTextLineTrigger sectorlinetrig :sectorsline " > "
		send "^f"&$player~starting_point&"*"&$player~destination&"**q"
		pause
	:sectorsline
		killtrigger sectorlinetrig
		killtrigger sectorlinetrig2
		killtrigger sectorlinetrig3
		killtrigger sectorlinetrig4
		killtrigger donePath
		killtrigger donePath2
		setVar $line CURRENTLINE
		replacetext $line ">" " "
		striptext $line "("
		striptext $line ")"
		setVar $line $line&" "
		getWordPos $line $pos "So what's the point?"
		getWordPos $line $pos2 ": ENDINTERROG"
		getWordPos $line $pos3 " No route within "
		if (($pos > 0) OR ($pos2 > 0) OR ($pos3 > 0))
			goto :noPath
		end
		getWordPos $line $pos " sector "
		getWordPos $line $pos2 "TO"
		if (($pos <= 0) AND ($pos2 <= 0))
			setVar $sectors $sectors & " " & $line
		end
		getWordPos $line $pos " "&$player~destination&" "
		getWordPos $line $pos2 "("&$player~destination&")"
		getWordPos $line $pos3 "TO"
		if ((($pos > 0) OR ($pos2 > 0)) AND ($pos3 <= 0))
			goto :gotSectors
		else
			setTextLineTrigger sectorlinetrig :sectorsline " > "
			setTextLineTrigger sectorlinetrig2 :sectorsline " "&$player~destination&" "
			setTextLineTrigger sectorlinetrig3 :sectorsline " "&$player~destination
			setTextLineTrigger sectorlinetrig4 :sectorsline "("&$player~destination&")"
			setTextLineTrigger donePath :sectorsline "So what's the point?"
			setTextLineTrigger donePath2 :sectorsline ": ENDINTERROG"
		end
		pause
	:gotSectors
		setVar $sectors $sectors&" :::"
		setVar $player~courseLength 0
		setVar $player~index 1
		:keepGoing
		getWord $sectors $player~mowCourse[$player~index] $player~index
		while ($player~mowCourse[$player~index] <> ":::")
			add $player~courseLength 1
			add $player~index 1
			getWord $sectors $player~mowCourse[$player~index] $player~index
		end
		return
	:noPath

		send "q '{" $SWITCHBOARD~bot_name "} - No path to that sector, cannot mow!*"
		return

:FindJumpSector
	setVar $i 1
	setVar $RED_adj 0
	send "q t*t1* q*"
	while (SECTOR.WARPSIN[$player~target][$i] > 0)
		setVar $RED_adj SECTOR.WARPSIN[$player~target][$i]
		if ($RED_adj > 10)
			send "m " & $RED_adj & "* y"
			setTextTrigger TwarpBlind           :TwarpBlind "Do you want to make this jump blind? "
			setTextTrigger TwarpLocked          :TwarpLocked "All Systems Ready, shall we engage? "
			setTextLineTrigger TwarpVoided      :TwarpVoided "Danger Warning Overridden"
			setTextLineTrigger TwarpAdj         :TwarpAdj "<Set NavPoint>"
			pause
			:TwarpAdj
				killtrigger TwarpBlind
				killtrigger TwarpLocked
				killtrigger TwarpVoided
				killtrigger TwarpAdj
				send " * "
				return

			:TwarpVoided
				killtrigger TwarpBlind
				killtrigger TwarpLocked
				killtrigger TwarpVoided
				killtrigger TwarpAdj
				send " N N "
				goto :TryingNextAdj

			:TwarpLocked
				killtrigger TwarpBlind
				killtrigger TwarpLocked
				killtrigger TwarpVoided
				killtrigger TwarpAdj
				goto :SectorLocked

			:TwarpBlind
				killtrigger TwarpBlind
				killtrigger TwarpLocked
				killtrigger TwarpVoided
				killtrigger TwarpAdj
				send " N "
		end
		:TryingNextAdj
				add $i 1
	end

	:NoAdjsFound
		setVar $RED_adj 0
		return

	:SectorLocked
		if ($player~target = $MAP~stardock)
			setVar $MAP~backdoor $RED_adj
			saveVar $MAP~backdoor
		end
return

:mow
		
		if ($PROMPT~startingLocation = "Citadel")
			send "q"
			gosub :PLANET~getPlanetInfo
			send "c "
		end
		if ($PROMPT~startingLocation = "Command")
			gosub :SHIP~getShipStats
			setVar $mow_SHIP_MAX_ATTACK $SHIP~SHIP_MAX_ATTACK
		elseif ($SHIP~SHIP_MAX_ATTACK <= 0)
			setVar $mow_SHIP_MAX_ATTACK 99991111
		else
			setVar $mow_SHIP_MAX_ATTACK $SHIP~SHIP_MAX_ATTACK
		end
		setVar $player~destination $BOT~parm1
		isNumber $number $player~destination
		if ($number <> 1)
			send "'{" $SWITCHBOARD~bot_name "} - Sector entered is not a number, cannot mow!*"
			return
		elseif (($player~destination <= 0) OR ($player~destination > SECTORS))
			send "'{" $SWITCHBOARD~bot_name "} - Sector entered is not valid, cannot mow!*"
			return
		end
		setVar $player~destination ($BOT~parm1+0)
		getWordPos " "&$BOT~user_command_line&" " $pos "kill"
		if ($pos > 0)
			setVar $player~mow_kill TRUE
		else
			setVar $player~mow_kill FALSE
		end
		getWordPos " "&$BOT~user_command_line&" " $pos "saveme"
		if ($pos > 0)
			setVar $player~mow_saveme TRUE
		else
			setVar $player~mow_saveme FALSE
		end
		getWordPos " "&$BOT~user_command_line&" " $pos " p "
		if ($pos > 0)
			setVar $player~are_we_docking TRUE
		else
			setVar $player~are_we_docking FALSE
		end
		setVar $player~figsToDrop $BOT~parm2
		isNumber $number $player~figsToDrop
		if ($number <> TRUE)
			setVar $player~figsToDrop 0
		else
			if ($player~figsToDrop > 50000)
				send "'{" $SWITCHBOARD~bot_name "} - Cannot drop more than 50,000 fighters per sector!*"
				return
			elseif ($player~figsToDrop > $player~fighters)
				send "'{" $SWITCHBOARD~bot_name "} - Fighters to drop cannot exceed total ship fighters.*"
				return
			end
		end
		if ($mow_SHIP_MAX_ATTACK > $player~fighters)
			setVar $mow_SHIP_MAX_ATTACK 9999
		end
		if ($player~current_sector <> CURRENTSECTOR)
			setVar $player~current_sector 0
		end
		gosub :getCourse
		setVar $j 2
		setVar $result "q q q * "
		while ($j <= $player~courseLength)
			if ($player~mowCourse[$j] <> $player~current_sector)
				setVar $result $result&"m  "&$player~mowCourse[$j]&"*   "
				if (($player~mowCourse[$j] > 10) AND ($player~mowCourse[$j] <> $MAP~stardock))
					setVar $result $result&"za  "&$mow_SHIP_MAX_ATTACK&"* *  "
				end
				if (($player~figsToDrop > 0) AND ($player~mowCourse[$j] > 10) AND ($player~mowCourse[$j] <> $MAP~stardock) AND ($j > 2))
					setVar $result $result&"f "&$player~figsToDrop&" * c d "
					setVar $player~target $player~mowCourse[$j]
					gosub :player~addFigToData
				end
				if (($j >= $player~courseLength) AND ($player~mow_saveme = TRUE) AND ($player~figsToDrop = 0))
					setVar $result $result&"f 1 * c d "
					setVar $player~target $player~mowCourse[$j]
					gosub :player~addFigToData
				end
				if (($called = FALSE) AND ($player~mow_saveme = TRUE) AND ($j >= ($player~courseLength-2)))
					setVar $result $result&"'"&$player~destination&"=saveme*  "
					setVar $called TRUE
				end
			end
			add $j 1
		end
		setVar $docking_instructions ""
		if ($player~are_we_docking)
			setVar $docking_instructions " p z t *"
			if ($player~destination = $MAP~stardock)
				setVar $docking_instructions " p z s g y g q h *"
			end
			setVar $result $result & $docking_instructions
		elseif (($player~mow_saveme = TRUE) AND ($player~startingLocation = "Citadel"))
			setVar $i 0
			while ($i < 8)
				add $i 1
				#setVar $result $result&"l j" & #8 & $PLANET~PLANET & "*  *  "
				setVar $result $result&"l j" & #8 & $PLANET~PLANET & "*  *  j  c  *  *  "
			end
		end
		send $result
		gosub :player~quikstats
		if (($player~current_prompt = "Command") AND ($player~mow_kill = TRUE))
			setVar $player~startingLocation "Command"
			goSub :SECTOR~getSectorData
			goSub :combat~fastAttack
		elseif ($player~current_prompt = "Planet")
			send "m * * * c "
			if ($player~mow_kill = FALSE)
				send "s* "
			else
				setVar $player~startingLocation "Citadel"
				gosub :combat~scanit_cit_kill
			end
		elseif ($player~are_we_docking = FALSE)
			send "*"
		end
return
# ======================     END MOW SUBROUTINES     ==========================

:topoff
	:do_topoff_again
		killtrigger topoff_success
		killtrigger topoff_failure1
		killtrigger topoff_failure2
		send " F"
		waitOn "Your ship can support up to"
		getWord CURRENTLINE $ftrs_to_leave 10
		stripText $ftrs_to_leave ","
		stripText $ftrs_to_leave " "
		if ($ftrs_to_leave < 1)
			setVar $ftrs_to_leave 1
		end
		send " " & $ftrs_to_leave & " * c d"
		setTextLineTrigger topoff_success :topoff_success "Done. You have "
		setTextLineTrigger topoff_failure1 :do_topoff_again "You don't have that many fighters available."
		setTextLineTrigger topoff_failure2 :do_topoff_again "Too many fighters in your fleet!  You are limited to"
		pause
	:topoff_success
		killtrigger topoff_failure1
		killtrigger topoff_failure2
return

# ====================================== START BUY COMMAND ==============================================
:buy

	#required params:
	#$overrided - true/false
	#$player~buytype - 1/2/3
	#$player~buyobject - e/o/f


# ============================== START HAGGLE VARIABLES ============================
	setVar $overhagglemultiple 	147
	setVar $cyclebuffer 		1
	setVar $cyclebufferlimit 	20
# ============================== END HAGGLE VARIABLES ============================


	send "@"
	waitOn "Average Interval Lag:"
	gosub :player~quikstats
	setVar $player~startingLocation $player~current_prompt
	
	setVar $player~output ""
	setVar $equiprounds 0
	setVar $orgrounds 0
	setVar $fuelrounds 0
	if ($buydownRoundsFromParam <= 0)
		setVar $buydownRoundsFromParam 999999
	end   
	if ($player~buytype = "w")
			setVar $buydown_mode 3
	elseif ($player~buytype = "b")
			setVar $buydown_mode 2
	else 
		setVar $buydown_mode 1
	end
	if ($player~buyobject = "e")
		setVar $player~buydown_equiprounds $buydownRoundsFromParam
		setVar $player~buydown_orgrounds 0
		setVar $player~buydown_fuelrounds 0
	elseif ($player~buyobject = "o")
		setVar $player~buydown_equiprounds 0
		setVar $player~buydown_orgrounds $buydownRoundsFromParam
		setVar $player~buydown_fuelrounds 0
	elseif ($player~buyobject = "f")
		setVar $player~buydown_equiprounds 0
		setVar $player~buydown_orgrounds 0
		setVar $player~buydown_fuelrounds $buydownRoundsFromParam
	else
		setVar $SWITCHBOARD~message "Please use format buy [type] {speed} {#cycles} {override}*"
		gosub :SWITCHBOARD~switchboard
		return
	end

	if ($player~startingLocation = "Citadel")
		send "Q"
	end
	send "t n l 1* t n l 2* t n l 3* s n l1*"
	waitOn "How many groups of Colonists do you want to leave"
	gosub :PLANET~getPlanetinfo
	if ($player~startingLocation = "Citadel")
		send "C s* "
	else
		send "Q D"
	end
	gosub :player~getinfo
	if ($player~total_holds <> $player~empty_holds)
		if ($player~startingLocation <> "Citadel")
			gosub :PLANET~landingSub
		end
		setVar $SWITCHBOARD~message "Planet full, cannot empty ship holds*"
		gosub :SWITCHBOARD~switchboard
		goto :buydownExit
	end
	gosub :voidAdjacent
	gosub :getPortInfo
	if ($validPortFound <> TRUE)
		echo "*No valid port found*"
		if ($player~startingLocation <> "Citadel")
			gosub :PLANET~landingSub
		end
		gosub :clearAdjacent
		goto :buydownExit   
	end
	if ($player~startingLocation = "Citadel")
		send "Q"
	else
		send "L " & $PLANET~PLANET & "* "
	end
	setDelayTrigger initpause :initpause 500
	pause

:initpause


:getinputs
	setVar $player~turns_needed 0
		setVar $player~turns_allowed $player~turns
		subtract $player~turns_allowed 1

	# --- calculate how much fuel we can buy
	if ($player~buydown_fuelrounds > 0)
		setVar $fuelrounds 0
		setVar $planetfuelroom $PLANET~PLANET_FUEL_MAX
		subtract $planetfuelroom $PLANET~PLANET_FUEL
		setVar $maxfueltobuy $fuelselling
		if ($fuelselling > $planetfuelroom)
			setVar $maxfueltobuy $planetfuelroom
		end
		setVar $maxfuelrounds $maxfueltobuy
		divide $maxfuelrounds $player~total_holds
		if ($maxfuelrounds > $player~turns_allowed)
			setVar $maxfuelrounds $player~turns_allowed
		end
		if ($maxfuelrounds > $player~buydown_fuelrounds)
				setVar $maxfuelrounds $player~buydown_fuelrounds
		end
		if ($maxfuelrounds > 0)
			setVar $fuelrounds $maxfuelrounds
		end
		add $player~turns_needed $fuelrounds
		subtract $player~turns_allowed $fuelrounds
	end
		# --- calculate how much org we can buy
		if ($player~buydown_orgrounds > 0)
		setVar $orgrounds 0
			setVar $planetorgroom $PLANET~PLANET_ORGANICS_MAX
			subtract $planetorgroom $PLANET~PLANET_ORGANICS
			setVar $maxorgtobuy $orgselling
			if ($orgselling > $planetorgroom)
				setVar $maxorgtobuy $planetorgroom
			end
			setVar $maxorgrounds $maxorgtobuy
			divide $maxorgrounds $player~total_holds
			if ($maxorgrounds > $player~turns_allowed)
				setVar $maxorgrounds $player~turns_allowed
			end
			if ($maxorgrounds > $player~buydown_orgrounds)
				setVar $maxorgrounds $player~buydown_orgrounds
			end
			if ($maxorgrounds > 0)
				setVar $orgrounds $maxorgrounds
			end
		add $player~turns_needed $orgrounds
			subtract $player~turns_allowed $orgrounds
		end 
		# --- calculate how much equip we can buy
		if ($player~buydown_equiprounds > 0)
		setVar $equiprounds 0
			setVar $planetequiproom $PLANET~PLANET_EQUIPMENT_MAX
			subtract $planetequiproom $PLANET~PLANET_EQUIPMENT
			setVar $maxequiptobuy $equipselling
			if ($equipselling > $planetequiproom)
				setVar $maxequiptobuy $planetequiproom
			end
			setVar $maxequiprounds $maxequiptobuy
			divide $maxequiprounds $player~total_holds
			if ($maxequiprounds > $player~turns_allowed)
			setVar $maxequiprounds $player~turns_allowed
			end
			if ($maxequiprounds > $player~buydown_equiprounds)
				setVar $maxequiprounds $player~buydown_equiprounds
			end
			if ($maxequiprounds > 0)
				setVar $equiprounds $maxequiprounds
			end
		add $player~turns_needed $equiprounds
			subtract $player~turns_allowed $equiprounds
		end
		if (($fuelrounds = 0) and ($orgrounds = 0) and ($equiprounds = 0))
			if ($player~startingLocation = "Citadel")
					send "C "
			else
				send "q "
		end
			echo "*Nothing to buy*"
		gosub :clearAdjacent
			goto :buydownExit
		end

		:getMode
			if ($buydown_mode = 1)
				setVar $buydown_mode "Speedbuy"
			elseif ($buydown_mode = 2)
				setVar $buydown_mode "Best Price"
			elseif ($buydown_mode = 3)
				setVar $buydown_mode "Worst Price"
			end
			setVar $fuelroundsleft $fuelrounds
			setVar $orgroundsleft $orgrounds
			setVar $equiproundsleft $equiprounds
		setVar $fuel_creds_needed 0
		setVar $org_creds_needed 0
		setVar $equip_creds_needed 0

		# determine how much this will all cost, and get credits from citadel if needed
			if ($fuelrounds > 0)
					setVar $fuel_creds_needed $fuelrounds
					multiply $fuel_creds_needed $player~total_holds
					multiply $fuel_creds_needed 30
					if ($buydown_mode = "Worst Price")
						multiply $fuel_creds_needed 3
						divide $fuel_creds_needed 2
					end
			end
	if ($orgrounds > 0)
			setVar $org_creds_needed $orgrounds
			multiply $org_creds_needed $player~total_holds
			multiply $org_creds_needed 60
			if ($buydown_mode = "Worst Price")
				multiply $org_creds_needed 3
				divide $org_creds_needed 2
			end
	end
	if ($equiprounds > 0)
			setVar $equip_creds_needed $equiprounds
			multiply $equip_creds_needed $player~total_holds
			multiply $equip_creds_needed 100
			if ($buydown_mode = "Worst Price")
				multiply $equip_creds_needed 3
				divide $equip_creds_needed 2
			end
	end
	setVar $total_creds_needed 0
	add $total_creds_needed $fuel_creds_needed
	add $total_creds_needed $org_creds_needed
	add $total_creds_needed $equip_creds_needed
	setVar $startingCredits $player~credits
	if ($total_creds_needed > $player~credits)
			setVar $cashonhand $PLANET~CITADEL_CREDITS
			add $cashonhand $player~credits
			if ($cashonhand > $total_creds_needed)
				send "C"
				send "T T " & $player~credits & "* "
				send "T F " & $total_creds_needed & "* "
				setVar $player~credits $total_creds_needed
				send "Q"
			else
				if ($player~startingLocation = "Citadel")
						send "C "
				else
					send "q "
			end
				setVar $player~exit_message "Not enough cash onhand"
			gosub :clearAdjacent
				goto :buydownExit
			end
	end
	setVar $init_credits $player~credits

:buydownequip
	if ($equiproundsleft > 0)
			send "Q P T  "
			if ($fuelselling > 0)
					send "0* "
			end
			if ($orgselling > 0)
					send "0*"
			end
			gosub :choosehaggle
			send "L " & $PLANET~PLANET & "* t n l 3* "
			subtract $equiproundsleft 1
			goto :buydownequip
		end
		if ($equiprounds > 0)
			if ($buydown_mode = "Worst Price")
					setVar $player~output $player~output & " - Equipment overhaggled at " & $overhagglemultiple & "*"
			end
		end

:buydownorg
		if ($orgroundsleft > 0)
			send "Q P T  "
			if ($fuelselling > 0)
					send "0*"
			end
			gosub :choosehaggle
			send "0* L " & $PLANET~PLANET & "* t n l 2* "
			subtract $orgroundsleft 1
			goto :buydownorg
		end
		if ($orgrounds > 0)
			if ($buydown_mode = "Worst Price")
				setVar $player~output $player~output & " - Organics overhaggled at " & $overhagglemultiple & "*"
			end
		end

:buydownfuel
		if ($fuelroundsleft > 0)
			send "Q P T "
			gosub :choosehaggle
			send "0* 0* L " & $PLANET~PLANET & "* t n l 1* "
			subtract $fuelroundsleft 1
			goto :buydownfuel
		end
		if ($fuelrounds > 0)
			if ($buydown_mode = "Worst Price")
					setVar $player~output $player~output & " - Fuel Ore overhaggled at " & $overhagglemultiple & "*"
			end
		end

:buydownFinish
		if ($player~startingLocation = "Citadel")
			send "C "
		end
		gosub :player~getinfo
		setVar $player~credits_spent $init_credits
		subtract $player~credits_spent $player~credits
		gosub :clearAdjacent
		if ($player~startingLocation = "Planet")
			send "L " & $PLANET~PLANET & "* "
		end
		if ($player~credits > $startingCredits)
			if ($player~startingLocation = "Citadel")
				send "T T " & ($player~credits-$startingCredits) & "* "
			end
		end
		setVar $player~exit_message "Normal Exit"

	:buydownExit
			return

#==================================   END BUY DOWN (BUY) SUB  ========================================

# ======================     START BUYING SUBROUTINES     =================
# ----- SUB :choosehaggle
:choosehaggle
	if ($buydown_mode = "Speedbuy")
		gosub :buynohaggle
	else
		gosub :buyhaggle
	end
	return


# ----- SUB :buyhaggle
:buyhaggle
	killtrigger buyfirstoffer

	setVar $empty $player~total_holds
	send "*"
	setTextLineTrigger buyfirstoffer :buyfirstoffer "We'll sell them for"
	pause

	:buyfirstoffer
		killtrigger buyprice 
		killtrigger buyfinaloffer 
		killtrigger buynotinterested 
		killtrigger buyexperience 
		killtrigger buyempty 
		killtrigger buyscrewup1 
		killtrigger buyscrewup2 
		killtrigger buyscrewup3 
		killtrigger buyscrewup4 
		killtrigger buyscrewup5 
		killtrigger buyscrewup6 
		killtrigger buyscrewup7 
		killtrigger buyscrewup8 
		killtrigger buyscrewup9 
		killtrigger buyscrewup10 

		getWord CURRENTLINE $offer 5
		striptext $offer ","

		gosub :swathoff
		if ($player~swathoff = 0)
			send "L " & $PLANET~PLANET & "* "
		if ($player~startingLocation = "Citadel")
			send "C "
		end
			setVar $player~exit_message $player~swathoffMessage
			goto :buydownExit
		end


		setVar $counter $offer
		if ($buydown_mode = "Best Price")
			multiply $counter 92
			divide $counter 100
		elseif ($buydown_mode = "Worst Price")
			multiply $counter $overhagglemultiple
			divide $counter 100
		end
		send $counter & "*"
	:buyofferloop
		setTextLineTrigger buyprice :buyprice "We'll sell them for"
		setTextLineTrigger buyfinaloffer :buyfinaloffer "Our final offer"
		setTextLineTrigger buynotinterested :buynotinterested "We're not interested."
		setTextLineTrigger buyexperience :buyexperience "experience point(s)"
		setTextLineTrigger buyempty :buyempty "empty cargo holds"
		setTextLineTrigger buyscrewup1 :buyscrewup "Get real ion-brain, make me a real offer."
		setTextLineTrigger buyscrewup2 :buyscrewup "This is the big leagues Jr.  Make a real offer."
		setTextLineTrigger buyscrewup3 :buyscrewup "My patience grows short with you."
		setTextLineTrigger buyscrewup4 :buyscrewup "I have much better things to do than waste my time.  Try again."
		setTextLineTrigger buyscrewup5 :buyscrewup "HA! HA, ha hahahhah hehehe hhhohhohohohh!  You choke me up!"
		setTextLineTrigger buyscrewup6 :buyscrewup "Quit playing around, you're wasting my time!"
		setTextLineTrigger buyscrewup7 :buyscrewup "Make a real offer or get the "
		setTextLineTrigger buyscrewup8 :buyscrewup "WHAT?!@!? you must be crazy!"
		setTextLineTrigger buyscrewup9 :buyscrewup "So, you think I'm as stupid as you look? Make a real offer."
		setTextLineTrigger buyscrewup10 :buyscrewup "What do you take me for, a fool?  Make a real offer!"
		pause
		pause
	:buyscrewup
		killtrigger buyprice 
		killtrigger buyfinaloffer 
		killtrigger buynotinterested 
		killtrigger buyexperience 
		killtrigger buyempty 
		killtrigger buyscrewup1 
		killtrigger buyscrewup2 
		killtrigger buyscrewup3 
		killtrigger buyscrewup4 
		killtrigger buyscrewup5 
		killtrigger buyscrewup6 
		killtrigger buyscrewup7 
		killtrigger buyscrewup8 
		killtrigger buyscrewup9 
		killtrigger buyscrewup10 
	  
		if ($buydown_mode = "Best Price")
			multiply $counter 102
			divide $counter 100
		elseif ($buydown_mode = "Worst Price")
			subtract $overhagglemultiple 1
			setVar $counter $offer
			multiply $counter $overhagglemultiple
			divide $counter 100
		end
		send $counter & "*"
		goto :buyofferloop
	:buyprice
		killtrigger buyprice 
		killtrigger buyfinaloffer 
		killtrigger buynotinterested 
		killtrigger buyexperience 
		killtrigger buyempty 
		killtrigger buyscrewup1 
		killtrigger buyscrewup2 
		killtrigger buyscrewup3 
		killtrigger buyscrewup4 
		killtrigger buyscrewup5 
		killtrigger buyscrewup6 
		killtrigger buyscrewup7 
		killtrigger buyscrewup8 
		killtrigger buyscrewup9 
		killtrigger buyscrewup10 
		setVar $old_offer $offer
		setVar $old_counter $counter
		getWord CURRENTLINE $offer 5
		striptext $offer ","
		setVar $offer_pct $offer
		multiply $offer_pct 1000
		divide $offer_pct $old_offer
		if ($offer_pct > 990)
			setVar $offer_pct 990
		end
		multiply $counter 1000
		divide $counter $offer_pct
		if ($counter <= $old_counter)
			add $counter 1
		end
		send $counter & "*"
		goto :buyofferloop
	:buyfinaloffer
		killtrigger buyprice 
		killtrigger buyfinaloffer 
		killtrigger buynotinterested 
		killtrigger buyexperience 
		killtrigger buyempty 
		killtrigger buyscrewup1 
		killtrigger buyscrewup2 
		killtrigger buyscrewup3 
		killtrigger buyscrewup4 
		killtrigger buyscrewup5 
		killtrigger buyscrewup6 
		killtrigger buyscrewup7 
		killtrigger buyscrewup8 
		killtrigger buyscrewup9 
		killtrigger buyscrewup10 
		setVar $old_offer $offer
		setVar $old_counter $counter
		getWord CURRENTLINE $offer 5
		striptext $offer ","
		setVar $offer_change $offer
		subtract $offer_change $old_offer
		subtract $offer_change 1
		multiply $offer_change 25
		divide $offer_change 10
		subtract $counter $offer_change
		if ($counter = $old_counter)
			add $counter 1
		end
		add $counter 1
		send $counter & "*"
		goto :buyofferloop
	:buynotinterested
		killtrigger buyprice 
		killtrigger buyfinaloffer 
		killtrigger buynotinterested 
		killtrigger buyexperience 
		killtrigger buyempty 
		killtrigger buyscrewup1 
		killtrigger buyscrewup2 
		killtrigger buyscrewup3 
		killtrigger buyscrewup4 
		killtrigger buyscrewup5 
		killtrigger buyscrewup6 
		killtrigger buyscrewup7 
		killtrigger buyscrewup8 
		killtrigger buyscrewup9 
		killtrigger buyscrewup10 
		send "0* "
		send "0* "
		goto :buyhagglefailed
	:buyexperience
		killtrigger buyprice 
		killtrigger buyfinaloffer 
		killtrigger buynotinterested 
		killtrigger buyexperience 
		killtrigger buyempty 
		killtrigger buyscrewup1 
		killtrigger buyscrewup2 
		killtrigger buyscrewup3 
		killtrigger buyscrewup4 
		killtrigger buyscrewup5 
		killtrigger buyscrewup6 
		killtrigger buyscrewup7 
		killtrigger buyscrewup8 
		killtrigger buyscrewup9 
		killtrigger buyscrewup10 
		getWord CURRENTLINE $exp_bonus 7
		add $exp $exp_bonus
		add $jetbonus $exp_bonus
		goto :buyofferloop
	:buyempty
		killtrigger buyprice 
		killtrigger buyfinaloffer 
		killtrigger buynotinterested 
		killtrigger buyexperience 
		killtrigger buyempty 
		killtrigger buyscrewup1 
		killtrigger buyscrewup2 
		killtrigger buyscrewup3 
		killtrigger buyscrewup4 
		killtrigger buyscrewup5 
		killtrigger buyscrewup6 
		killtrigger buyscrewup7 
		killtrigger buyscrewup8 
		killtrigger buyscrewup9 
		killtrigger buyscrewup10 
		getWord CURRENTLINE $player~credits 3
		stripText $player~credits ","
		setVar $oldempty $empty
		getWord CURRENTLINE $empty 6
		if ($oldempty = $empty)
			goto :buyhagglefailed
		else
			goto :buyhagglesucceeded
		end
	:buyhagglefailed
		setVar $buyhaggle 0
		return
	:buyhagglesucceeded
		setVar $buyhaggle 1
		return


# ----- SUB :buynohaggle
:buynohaggle
	if ($player~swathoff = 0)

		waitOn "How many holds of"
		send "*"
		gosub :swathoff
		send "*"
	else
		send "**"
	end
	setVar $cyclebufferlimit    20
	add $cyclebuffer 1
	if ($cyclebuffer = $cyclebufferlimit)
		setVar $cyclebuffer 1
		send "/"
		waitOn " Sect "
	end
	return





# ----- SUB :getPortInfo -----
:getPortInfo
	if ($player~startingLocation = "Citadel")
	send "S*CR*Q"
	else
		send "*CR*Q"
	end
	setVar $validPortFound FALSE
	setTextLineTrigger foundport :foundport2 "Items     Status  Trading % of max OnBoard"
	setTextLineTrigger noport :noport2 "I have no information about a port in that sector."
	setTextLineTrigger noport2 :noport2 "You have never visted sector"
	setTextLineTrigger noport3 :noport2 "credits / next hold"
	setTextLineTrigger noport4 :noport2 "A  Cargo holds     :"
	pause

	:noport2
	killtrigger foundport
	killtrigger noport
	killtrigger noport2
	killtrigger noport3
	killtrigger noport4
	return

	:foundport2
	killtrigger foundport
	killtrigger noport
	killtrigger noport2
	killtrigger noport3
	killtrigger noport4
	setVar $fuelselling 0
		setVar $orgselling 0
		setVar $equipselling 0
	setVar $validPortFound TRUE
		:getselling
			setTextLineTrigger portfuelinfo :portfuelinfo2 "Fuel Ore   Selling"
			setTextLineTrigger portorginfo :portorginfo2 "Organics   Selling"
			setTextLineTrigger portequipinfo :portequipinfo2 "Equipment  Selling"
			setTextLineTrigger gotallportinfo :gotallportinfo2 "<Computer deactivated>"
			pause

		:portfuelinfo2
			getWord CURRENTLINE $fuelselling 4
			setTextLineTrigger portfuelinfo :portfuelinfo2 "Fuel Ore   Selling"
			pause

		:portorginfo2
			getWord CURRENTLINE $orgselling 3
			setTextLineTrigger portorginfo :portorginfo2 "Organics   Selling"
		pause

		:portequipinfo2
			getWord CURRENTLINE $equipselling 3
			setTextLineTrigger portequipinfo :portequipinfo2 "Equipment  Selling"
		pause

		:gotallportinfo2
			killtrigger portfuelinfo
		killtrigger portorginfo
		killtrigger portequipinfo
		killtrigger gotallportinfo
return

# ======================     END BUYING SUBROUTINES     =================
# =================================== ADJACENT CONTROLS ====================================
:voidadjacent
	getSector $player~current_sector $sectorInfo
	if ($sectorInfo.warp[1] = 0)
		send "'This sector has no warps, maybe you need to scan it first*"
		halt
	else
		setVar $voidsect 0
		:voids
		add $voidsect 1
		if ($voidsect < 7)
			if ($sectorInfo.warp[$voidsect] <> 0)
				send "CV" & $sectorInfo.warp[$voidsect] & "*Q"
			end
			goto :voids
		end

		send "/"
		waitOn " Sect "    
	end
return
:clearadjacent
	getSector $player~current_sector $sectorInfo
	if ($sectorInfo.warp[1] = 0)
		setVar $SWITCHBOARD~message "This sector has no warps, try to scan it first!*"
		gosub :SWITCHBOARD~switchboard
		return
	else
		setVar $voidsect 0
		:clearvoids
		add $voidsect 1
		if ($voidsect < 7)
			if ($sectorInfo.warp[$voidsect] <> 0)
				send "CV0*YN" & $sectorInfo.warp[$voidsect] & "*Q"
			end
			goto :clearvoids
		end

		send "/"
		waitOn " Sect "
	end
return
# =============================== END ADJACENT CONTROLS =============================================

# ===========================  START SWATH DISABLING SUBROUTINE  =================
:swathoff
	if ($player~swathoff = FALSE)
		setTextTrigger swathison :swathison "Command [TL="
		setDelayTrigger swathisoff :swathisoff 2000
		pause

		:swathison
		killtrigger swathisoff
		killtrigger swathison
		setVar $player~swathoffMessage "Detected SWATH Autohaggle"
		setVar $player~swathoff FALSE
		return

		:swathisoff
		killtrigger swathisoff
		killtrigger swathison
		setVar $player~swathoff TRUE
	end
return
# ==========================   END SWATH DISABLING SUBROUTINE  =================

:startHaggle
	setVar $hfactor 5
:units
		killtrigger ptrade
		killtrigger strade
		killtrigger go
		killtrigger done
	gosub :player~setConnectionTriggers
		SetTextTrigger ptrade :bunits "do you want to buy ["
		SetTextTrigger strade :sunits "do you want to sell ["
		setTextLineTrigger go :finishhaggle "Agreed, "
		setTextLineTrigger done :donehaggle "empty cargo holds."
		pause

:finishhaggle
		killtrigger done
		gosub :haggle

:donehaggle
 
return

:bunits
		setVar $multiplier (100 - $hfactor)
		goto :units

:sunits
		setVar $multiplier (100 + $hfactor)
	goto :units

:haggle
		setVar $ni 0
		setVar $midhag "-1"
		setVar $nocred 0
		killtrigger 1
		killtrigger 0
		killtrigger donehaggling
	killtrigger donhag
	killtrigger offerme
		gosub :player~setConnectionTriggers
		setTextTrigger donehag :done_haggle "Command [TL="
		SetTextTrigger donehaggling :done_haggle "empty cargo holds."
		SetTextTrigger offerme :offerme "] ?"
		pause

:offerme
		getWord CURRENTLINE $offer 3
		stripText $offer "["
		stripText $offer "]"
		stripText $offer ","
		stripText $offer "?"
		setVar $orig_offer $offer

:rehaggle
		killtrigger 1
	killtrigger 0
		killtrigger 2
		killtrigger 3
		setVar $offer (($orig_offer * $multiplier) / 100)
		send $offer "*"
		add $midhag 1
		waitFor $offer
		IF ($multiplier > 100)
		   subtract $multiplier 1
		ELSE
		   add $multiplier 1
		END
		gosub :player~setConnectionTriggers
		send "@"
		waiton "Average Interval Lag:"
		setTextTrigger 0 :done_haggle "How many holds of"
		setTextTrigger 1 :rehaggle "Your offer"
		setTextTrigger 2 :donehag "We're not interested."
		setTextTrigger 3 :nocreds "You only have"
		pause

:nocreds
		setVAr $nocred 1
		send "0*0*"
		goto :done_haggle

:donehag
		setVar $ni 1

:done_haggle
		killtrigger donehag
		killtrigger 0
		killtrigger 1
		killtrigger 2
		killtrigger 3
		killtrigger rehaggle
		killtrigger donehaggling
		killtrigger offerme
	killalltriggers
return

