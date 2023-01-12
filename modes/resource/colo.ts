	logging off
	gosub :BOT~loadVars
	setVar $BOT~script_title "Colonizer"
	setVar $BOT~script_version "2.0.0"

	setVar $BOT~help[1]  $BOT~tab&" colo {s|r|m|t|e} {sector|cycles|min_colos|delay} {p} {b} {f} {c:#}"
	setVar $BOT~help[2]  $BOT~tab&"    "
	setVar $BOT~help[3]  $BOT~tab&"     Gets colos from Terra  "
	setVar $BOT~help[4]  $BOT~tab&"    "
	setVar $BOT~help[5]  $BOT~tab&"       {s} - Speed  - Define [cycles] to grab colos (default max)(no fuse protection)"
	setVar $BOT~help[6]  $BOT~tab&"       {r} - Red - Define [sector] close to terra."
	setVar $BOT~help[7]  $BOT~tab&"       {e} - Express  - Express Warp Colonizing (no protections)"
	setVar $BOT~help[8]  $BOT~tab&"       {m} - Milk - Defind [min colos] before grab (default 0)"
	setVar $BOT~help[9]  $BOT~tab&"       {t} - Timed - Define [delay] time to wait each cycle (default 15 seconds)"
	setVar $BOT~help[10] $BOT~tab&"   {2ship} - 2 Ship - Define [2nd ship] for colonization."
	setVar $BOT~help[11] $BOT~tab&"       {p} - Ports for fuel to colonize"
	setVar $BOT~help[12] $BOT~tab&" {buyfuel} - If [p] selected, will buy full hold and drop extra on planet"
	setVar $BOT~help[13] $BOT~tab&"       {b} - Bwarp"
	setVar $BOT~help[14] $BOT~tab&"       {f} - Fuel every 2nd trip (NOTE: [S]speed [B]warp Mode Only)"
	setVar $BOT~help[15] $BOT~tab&"     {c:#} - Camo holds (example: c:3 adds 3 holds extra fuel)"
	setVar $BOT~help[16] $BOT~tab&"     {all} - Will attempt to fill all planets owned by you in the sector."
	setVar $BOT~help[17] $BOT~tab&"          Examples: "
	setVar $BOT~help[18] $BOT~tab&"               >colo r 7363 "
	setVar $BOT~help[19] $BOT~tab&"               >colo s b "
	setVar $BOT~help[20] $BOT~tab&"               >colo m 25 b"
	setVar $BOT~help[21] $BOT~tab&"               >colo s b f"
	setVar $BOT~help[22] $BOT~tab&"               >colo e"

   # TODO: Add logic to recognize when product colos are more than 1/2 full.
   # TODO: Add an overfill command
   # TODO: Add in a safe option to check for twarp / bwarp
   # TODO: Add in option to check for major fig / shield loss if express

	gosub :bot~helpfile
	gosub :BOT~banner

	gosub :PLAYER~quikstats
	setVar $ship1 $PLAYER~SHIP_NUMBER
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Citadel") and ($startingLocation <> "Planet"))
		setVar $SWITCHBOARD~message "You must run Colonizer command from Citadel or Planet prompt.*"
		gosub :SWITCHBOARD~switchboard
		HALT
	end

	getWord $bot~user_command_line $bot~parm2 2

	getWordPos " "&$bot~user_command_line&" " $pos " s "
	if ($pos > 0)
		setVar $speed_colo TRUE
	end

	getWordPos " "&$bot~user_command_line&" " $pos " r "
	if ($pos > 0)
		setVar $red_colo TRUE
		setVar $twarp TRUE
		isNumber $test $bot~parm2
		if (($test) and ($bot~parm2 <= SECTORS) and ($bot~parm2 > 0))
			setVar $red_jump_sector $bot~parm2
		else
			setVar $SWITCHBOARD~message "For Red Colonizer, second parameter muse be jump point to Terra!.*"
			gosub :SWITCHBOARD~switchboard
			HALT
		end
	end

	getWordPos " "&$bot~user_command_line&" " $pos " m "
	if ($pos > 0)
		setVar $milk_colo TRUE
		isNumber $test $bot~parm2
		if ($test)
			setVar $min_colo $bot~parm2
		else
			setVar $SWITCHBOARD~message "For Milker Colonizer, second parameter bust be min colos to pick up!*"
			gosub :SWITCHBOARD~switchboard
			HALT
		end
	end

	getWordPos " "&$bot~user_command_line&" " $pos " t "
	if ($pos > 0)
		setVar $timed_colo TRUE
		isNumber $test $bot~parm2
		if ($test)
			setVar $delay $bot~parm2
		else
			setVar $SWITCHBOARD~message "For Timer Colonizer, second parameter bust be the delay for pickup in seconds!!*"
			gosub :SWITCHBOARD~switchboard
			HALT
		end
	end

	getWordPos " "&$bot~user_command_line&" " $pos " e "
	if ($pos > 0)
		setVar $express_colo TRUE
	end

	getWordPos " "&$bot~user_command_line&" " $pos " 2ship "
	if ($pos > 0)
		setVar $2ship_colo TRUE
		isNumber $test $bot~parm2
		if (($test) and ($bot~parm2 > 0))
			setVar $ship2 $bot~parm2
		else
			setVar $SWITCHBOARD~message "For 2 Ship Colonizer, second parameter bust be the second ship.!*"
			gosub :SWITCHBOARD~switchboard
			HALT
		end
	end

	getWordPos " "&$bot~user_command_line&" " $pos " b "
	if ($pos > 0)
		setVar $Bwarp TRUE
		setVar $Twarp FALSE
		getWordPos " "&$bot~user_command_line&" " $pos " f "
		if ($pos > 0)
			setVar $doubleOre TRUE
			setVar $doubleOreGet TRUE
		else
			setVar $doubleOre FALSE
		end
	else
		setVar $Twarp TRUE
		setVar $Bwarp FALSE
	end

	getWordPos " "&$bot~user_command_line&" " $pos " c:"
	if ($pos > 0)
		getText " "&$bot~user_command_line&" " $camo_holds "c:" " "
		isNumber $test $camo_holds
		if ($test)
			setVar $camoHolds TRUE
		else
			send "'{" $SWITCHBOARD~bot_name "} - Invalid camo holds entered*"
		end
	else
		setVar $camoHolds FALSE
	end

	if (($speed_colo = FALSE) AND ($milk_colo = FALSE) AND ($timed_colo = FALSE) AND ($red_colo = FALSE) AND ($express_colo = FALSE) AND ($2ship_colo = FALSE))
		setVar $SWITCHBOARD~message "Please use Colonizer options of [s]peed, [m]ilk, [r]ed, [t]imed, [e]xpress, or [2ship]*"
		gosub :SWITCHBOARD~switchboard
		HALT
	end

	getWordPos " "&$bot~user_command_line&" " $pos " all "
	if ($pos > 0)
		setVar $all_planets TRUE
	end

	getWordPos " "&$bot~user_command_line&" " $pos " p "
	if ($pos > 0)
		setVar $source_port TRUE
		getWordPos " "&$bot~user_command_line&" " $pos " buyfuel "
		if ($pos > 0)
			setVar $allore TRUE
		else
			setVar $allore FALSE
		end
	end

	if (($source_port) and (PORT.EXISTS[CURRENTSECTOR] = 0))
		setVar $SWITCHBOARD~message "No port here to buy fuel ore.*"
		gosub :SWITCHBOARD~switchboard
		HALT
	end

	if (($source_port) and (PORT.BUYFUEL[CURRENTSECTOR] = 1))
		setVar $SWITCHBOARD~message "Port must sell fuel to use Port for Colonizing.*"
		gosub :SWITCHBOARD~switchboard
		HALT
	end

	if (($PLAYER~alignment < 1000) AND (($red_colo = FALSE) and ($express_colo = FALSE) and ($2ship_colo = FALSE)))
		setVar $SWITCHBOARD~message "Alignment is to low to colo for Direct Warp Colonizing.*"
		gosub :SWITCHBOARD~switchboard
		HALT
	elseif ($PLAYER~TWARP_TYPE <> "1") and ($PLAYER~TWARP_TYPE <> "2")
		setVar $SWITCHBOARD~message "Must have Type 1 or 2 Twarp for Colonizer*"
		gosub :SWITCHBOARD~switchboard
		HALT
	end

	if ($startingLocation = "Citadel")
		send "Q"
	end

	gosub :PLANET~getPlanetNumber
	setVar $planet $PLANET~PLANET
	send " t n l 1* t n l 2* t n l 3* s n l 1* s n l 2* s n l 3* q c u y q f 1* cd"
	gosub :SHIP~getShipStats

# ******************************************************************************************
	:express_colonizer
		if (($express_colo) or ($2ship_colo))
			if ($all_planets)
				gosub :PLANET~countPlanets
			else
				setVar $planet~planets[1] $planet~planet
				setVar $planet~planetCount 1
			end
			gosub :PLAYER~getInfo
			gosub :SHIP~getShipStats
			setVar $PLAYER~destination 1
			gosub :player~getCourse
			setVar $j 2
			setVar $result "q * "
			if ($2ship_colo)
				setVar $result $result&"w n "&$ship2&"*"
			end
			while ($j <= $PLAYER~courseLength)
				if ($PLAYER~mowCourse[$j] <> $PLAYER~CURRENT_SECTOR)
					setVar $result $result&"m  "&$PLAYER~mowCourse[$j]&"*  "
					if (($PLAYER~mowCourse[$j] > 10) AND ($PLAYER~mowCourse[$j] <> $MAP~stardock))
						setVar $result $result&"za  "&$SHIP~SHIP_MAX_ATTACK&"* *  "
					end
			end
				add $j 1
			end
			setVar $to_mow $result

			setVar $PLAYER~starting_point 1
			setVar $PLAYER~destination $PLAYER~CURRENT_SECTOR
			gosub :player~getCourse
			setVar $j 2
			setVar $result ""
			while ($j <= $PLAYER~courseLength)
				if ($PLAYER~mowCourse[$j] <> $PLAYER~starting_point)
					setVar $result $result&"m    "&$PLAYER~mowCourse[$j]&"*             "
					if (($PLAYER~mowCourse[$j] > 10) AND ($PLAYER~mowCourse[$j] <> $MAP~stardock))
						setVar $result $result&"za  "&$SHIP~SHIP_MAX_ATTACK&"* *           "
					end
				end
			add $j 1
			end
			setVar $from_mow $result
			setVar $i 1
			while ($i <= $planet~planetCount)
				setVar $colo_prod 1
				while ($colo_prod < 4)
					setVar $planet~planet $planet~planets[$i]
					if ($2ship_colo)
						setVar $coloBurst $to_mow&"    l 1 * * *  x  "&$ship2&"* *   l 1 * * * w n  "&$ship1&"*"&$from_mow&" l "&$planet~planet&"* s * * "&$colo_prod&"* "&"q x "&$ship1&"* * l "&$planet~planet&"* s * * "&$colo_prod&"*"
					else
						setVar $coloBurst $to_mow&"    l 1* * * "&$from_mow&" l "&$planet~planet&"* s * * "&$colo_prod&"*"
					end

					send $coloBurst
					setTextLineTrigger 33 :morespeed "The Colonists disembark"
					setTextLineTrigger 34 :next_item_speed "There isn't room on the planet"
					setTextLineTrigger 35 :donespeed "There aren't that many on Terra!"
					pause

					:donespeed
						killtrigger 33
						killtrigger 34
						if ($startingLocation = "Citadel")
							send "c "
						end
						setVar $SWITCHBOARD~message "Terra is empty. Colonizer shutting down.*"
						gosub :SWITCHBOARD~switchboard
						halt
					:next_item_speed
						killtrigger 33
						killtrigger 35
						#CHANGE ITEM TO NEXT
						add $colo_prod 1
						if ($colo_prod >= 4)
							setVar $SWITCHBOARD~message "Planet "&$planet~planet&" is full of colonists, no more can be added.*"
							gosub :SWITCHBOARD~switchboard
						end
					:morespeed
						killtrigger 33
						killtrigger 34
						killtrigger 35

				end
				add $i 1
			end
			HALT
		end
# ******************************************************************************************

# ******************************************************************************************
	:red_colonizer
		if (($colo_type = "r") and ($twarp))
			if ($all_planets)
				gosub :PLANET~countPlanets
				HALT
			else
				setVar $planet~planets[1] $planet~planet
				setVar $planet~planetCount 1
			end
			gosub :PLAYER~getInfo
			gosub :SHIP~getShipStats

			setVar $PLAYER~starting_point $red_jump_sector
			setVar $PLAYER~destination 1
			gosub :player~getCourse
			setVar $j 2
			setVar $result ""
			while ($j <= $PLAYER~courseLength)
				if ($PLAYER~mowCourse[$j] <> $red_jump_sector)
					setVar $result $result&"m    "&$PLAYER~mowCourse[$j]&"*               "
					if (($PLAYER~mowCourse[$j] > 10) AND ($PLAYER~mowCourse[$j] <> $MAP~stardock))
						setVar $result $result&"za  "&$SHIP~SHIP_MAX_ATTACK&"* *             "
					end
				end
				add $j 1
			end
			setVar $to_mow $result
			setvar $no_twarp false

			if ($PLAYER~CURRENT_SECTOR <> $red_jump_sector)
				send "cf"&$PLAYER~CURRENT_SECTOR&"*"&$red_jump_sector&"*q"
				waitfor "The shortest path"
				getword CURRENTLINE $colo_hops1 4
				striptext $colo_hops1 "("
				setVar $colo_fuel1 ($colo_hops1 * 3)
			else
				#already as close to terra as possible
				setvar $colo_fuel1 0
				setvar $colo_hops1 0
				setvar $no_twarp true
			end
		if (($colo_type = "r") and ($bwarp))
			send "cf"&$red_jump_sector&"*1*q"
			waitfor "The shortest path"
			getword CURRENTLINE $colo_hops1 4
			striptext $colo_hops1 "("
			setVar $colo_fuel1 ($colo_hops1 * 3)
		end
		send "cf1*"&$PLAYER~CURRENT_SECTOR&"*q"
		waitfor "The shortest path"
		getword CURRENTLINE $colo_hops2 4
		striptext $colo_hops2 "("
		setVar $colo_fuel2 ($colo_hops2 * 3)
		if ($colo_hops1 > $planet~planet_TRANSPORT)
			setVar $SWITCHBOARD~message "B-Warp on planet not upgraded enough for B-warp Colo*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		if ($doubleOre = TRUE)
			
			setvar $colo_fuel ($colo_fuel2 * 2)
		else
			setvar $colo_fuel $colo_fuel2
		end
		setvar $colo_get ($mcol_holds - $colo_fuel1)
		setVar $PLAYER~TURNSPerCycle (1+$PLAYER~TURNS_PER_WARP+1+1)

# ******************************************************************************************

		if ($source_port)
			if ($BWARP)
				setvar $fuel_req ($colo_hops1 * 10)
				add $fuel_req $colo_fuel2
			else
				setvar $fuel_req ($colo_fuel1 + $colo_fuel2)
			end
			send "cr*q"
			waitfor "Commerce report for"
			waitfor "Fuel Ore"
			getword CURRENTLINE $fuel_avail 4
			if ($allore = TRUE)
				setvar $max_trips ($fuel_avail/$mcol_holds)
				setvar $portbuy $mcol_holds
			else
				setvar $max_trips ($fuel_avail/$fuel_req)
				setvar $portbuy $fuel_req
			end
			setvar $leave_ore ($portbuy - $colo_fuel2)
			if ($colo_misc > 0)
				if ($colo_misc > $max_trips)
					setVar $colo_misc $max_trips
				end
			else
				setVar $colo_misc $max_trips
			end

			setVar $portBurst "p  t  "&$portbuy&"  *  * "
			
			if ($allore = FALSE)
				if (PORT.BUYORG[CURRENTSECTOR] = 0)
					setVar $portBurst $portBurst&"0*  "
				end
				if (PORT.BUYEQUIP[CURRENTSECTOR] = 0)
					setVar $portBurst $portBurst&"0*  "
				end
			end
		end

	:colo_land
		if ($camoHolds)
			if (($camo_holds + $colo_fuel) >= $player~total_holds)
				setVar $SWITCHBOARD~message "Too many camo holds for this ship.*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
			send " j y l j" #8 #8  $planet~planet  "* n n *  t * t 1 " ($colo_fuel+$camo_holds) "*  "
		else
			if ($doubleOre)
				
				send " j y l j" #8 #8  $planet~planet  "* n n *  "
				if ($doubleOreGet = TRUE)
					setVar $doubleOreGet FALSE
					send "t * t 1 " $colo_fuel "*  "
				else
					setVar $doubleOreGet TRUE
					
				end
			else
				if ($colo_type = "p")
					send " j y " $portBurst " l j" #8 #8  $planet~planet  "* n n *  "
					if ($BWARP)
						send " t  n   l   1   " $leave_ore " *  "
					end
				else
					send " j y l j" #8 #8  $planet~planet  "* n n *  t * t 1 " $colo_fuel "*  "
				end
			end
		end
		if ($BWARP = TRUE)
			send "c "
		else
			send "q "
		end


		if ($PLAYER~PLANET_SCANNER = "No")
			SetVar $Land_mac "  L  T  " & $BOT~parm2 & "*   "
		else
			SetVar $Land_mac "  L  1*  T  " & $BOT~parm2 & "*   "
		end
		if ($colo_type = "m")
		if ($BOT~parm2 < 1)
			setvar $BOT~parm2 1
		end
			setVar $colo_min $colo_misc
			while (TRUE)
				if (($PLAYER~unlimitedGame = FALSE) AND ($PLAYER~TURNS < ($BOT~bot_turn_limit+$PLAYER~TURNSPerCycle)))
					if ($BWARP = FALSE)
						send "l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
					end
					setVar $SWITCHBOARD~message "Too low on turns to continue. Turn limit set to: "&($BOT~bot_turn_limit)&" turns.*"
					gosub :SWITCHBOARD~switchboard
					halt
				end
				if ($BWARP)
					send "b 1*y "
					setTextLineTrigger 36 :noFuel2 "This planet does not have enough Fuel Ore to transport you."
				else
					send "m 1* y y "
					setTextLineTrigger 36 :noFuel2 "<Set NavPoint>"
				end
				setTextLineTrigger 37 :colo_wait "All Systems Ready, shall we engage?"
				pause
				:noFuel2
					killalltriggers
					if ($BWARP = FALSE)
						send "* * l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
					end
					setVar $SWITCHBOARD~message "Colonizer needs more fuel on planet "&$planet~planet&"."
					gosub :SWITCHBOARD~switchboard
					halt

				:colo_wait
					gosub :player~quikstats
					setvar $empty_holds ($player~total_holds - ($player~COLONIST_HOLDS + $player~ore_holds))
					#There are currently 3417042 colonists ready to leave Terra.
					if ($empty_holds <= 0)
						goto :grabbed
					end
					:check_colos
					if ($PLAYER~PLANET_SCANNER = "No")
						send "  l q "
					else
						send "  l  1*q "
					end
					waiton " colonists ready to leave Terra."
					getword currentline $scam_check 1
					if ($scam_check <> "There")
						goto :check_colos
					end
					getword currentline $colos_on_terra 4
					if ($colos_on_terra < $colo_min)
						goto :check_colos
					end
					if ($colos_on_terra > $empty_holds)
						setvar $amount_to_grab $empty_holds
					else
						setvar $amount_to_grab $colos_on_terra
					end
					if ($PLAYER~PLANET_SCANNER = "No")
						SetVar $Land_mac "  L  T"&$amount_to_grab&"*   "
					else
						SetVar $Land_mac "  L  1*  T"&$amount_to_grab&"*   "
					end

					Send $Land_mac
					setTextLineTrigger	Done	:Done		"The Colonists file aboard your ship"
					setTextLineTrigger	None	:Done		"There aren't that many on Terra!"
					settextlinetrigger  none2   :Done       "You return to your ship and leave the planet."
					setTextTrigger		Grabbed	:Grabbed	"([0] empty holds)"
					pause
				:Done
					killAllTriggers
					goto :colo_wait
				:Grabbed
					killAllTriggers

				send " M"& $colo_sector & "* Y "
				setTextLineTrigger	Whoops			:Whoops			"You don't have enough turns left"
				setTextTrigger 		twarp_lock		:twarp_lock 	"All Systems Ready, shall we engage"
				setTextTrigger 		no_twrp_lock	:no_twarp_lock	"Do you want to make this jump blind"
				pause
				:Whoops
					killAlltriggers
					send "  **  "
					setVar $SWITCHBOARD~message "Out Of Turns. At Terra!*"
					gosub :SWITCHBOARD~switchboard
					halt
				:no_twarp_lock
					killAllTriggers
					send " N "
					setVar $SWITCHBOARD~message "Unable To Return Twarp, No Fighter Lock!*"
					gosub :SWITCHBOARD~switchboard
					halt

				:twarp_lock
					killAllTriggers
					send " y * l "&$planet~planet&"* s**"&$colo_prod&"* "

				setTextLineTrigger	33 				:more			"The Colonists disembark"
				setTextLineTrigger	34				:next_item		"There isn't room on the planet"
				pause


				:next_item
				killAllTriggers
				#CHANGE ITEM TO NEXT
				add $colo_prod 1
				#IF PLANET FULL, HALT SCRIPT
				if ($colo_prod >= 4)
					setVar $SWITCHBOARD~message "Planet is full of colonists, no more can be added. Colonizer shutting down.**"
					gosub :SWITCHBOARD~switchboard
					send "l "&$planet~planet&"* "
					if ($startingLocation = "Citadel")
						send "c "
					end
					halt
				end
				send "s**"&$colo_prod&"* "
				:more
				#KEEP RUNNING
				
				if ($BWARP)
					send "t * t 1"&$colo_fuel&"* c "
				else
					send "t * t 1"&$colo_fuel&"* q "
				end
				gosub :PLAYER~quikstats
				killalltriggers
			end
		elseif ($colo_type = "p")
			setVar $colo_cycles $colo_misc
			setVar $i 0
			if ($colo_cycles = 0)
				setVar $keepGoing TRUE
			else
				setVar $keepGoing FALSE
			end
			while (($i < $colo_cycles) OR ($keepGoing))
				if (($PLAYER~unlimitedGame = FALSE) AND ($PLAYER~TURNS < ($BOT~bot_turn_limit+$PLAYER~TURNSPerCycle)))
					if ($BWARP = FALSE)
						send "l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
					end
					setVar $SWITCHBOARD~message "Too low on turns to continue. Turn limit set to: "&($BOT~bot_turn_limit)&" turns.*"
					gosub :SWITCHBOARD~switchboard
					halt
				end
				:colo_speed_port
				killalltriggers


				if ($BWARP = TRUE)
					if ($PLAYER~PLANET_SCANNER = "No")
						setVar $coloBurst "b 1*y    l * * "
					else
						setVar $coloBurst "b 1*y    l 1* * * "
					end
				else
					if ($PLAYER~PLANET_SCANNER = "No")
						setVar $coloBurst "m 1* y y    l * * "
					else
						setVar $coloBurst "m 1* y y    l 1* * * "
					end

				end
				setVar $coloBurst $coloBurst&"m "&$colo_sector&"* y y    * l "&$planet~planet&"* s * * "&$colo_prod&"*"
				
				

				if ($BWARP = TRUE)
					if ($colo_prod < 3)
						setVar $coloBurst $coloBurst&"s * * "&($colo_prod+1)&"* "
					else
						setVar $coloBurst $coloBurst&""
					end

					
					#setVar $coloBurst $coloBurst&"  t * t 1"&$colo_fuel&"* c "
					setVar $coloBurst $coloBurst& "   q   "&$portBurst&"l "&$planet~planet&"*  t  n   l   1   "&$leave_ore&" *  c "
				else
					if ($colo_prod < 3)
						#setVar $coloBurst $coloBurst&"s * * "&($colo_prod+1)&"* t * t 1"&$colo_fuel&"* q q * "
						setVar $coloBurst $coloBurst&"s * * "&($colo_prod+1)&"* q * "&$portBurst 
					else
						#setVar $coloBurst $coloBurst&" t * t 1"&$colo_fuel&"* q "
						setVar $coloBurst $coloBurst&" q * " &$portBurst
					end
				end
				send $coloBurst
				if ($BWARP = TRUE)
					setTextLineTrigger 136 :noFuelPort "This planet does not have enough Fuel Ore to transport you."
				else
					setTextLineTrigger 136 :noFuelPort "<Set NavPoint>"
				end
				setTextLineTrigger 137 :fuelport "All Systems Ready, shall we engage?"
				pause

				:fuelport
				killalltriggers
				waitfor "There are currently"
				getword CURRENTLINE $colo_colos 4

				setTextLineTrigger 133 :moreport "The Colonists disembark"
				setTextLineTrigger 134 :next_item_port "There isn't room on the planet"
				setTextLineTrigger 135 :doneport "There aren't that many on Terra!"
				pause
				:noFuelPort
					killalltriggers
					if ($BWARP <> TRUE)
						send "* * l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
					end
					setVar $SWITCHBOARD~message "Colonizer needs more fuel on planet "&$planet~planet&".*"
					gosub :SWITCHBOARD~switchboard
					halt
				:doneport
					killalltriggers
					setVar $SWITCHBOARD~message "Terra is empty. Colonizer shutting down.*"
					gosub :SWITCHBOARD~switchboard
					if ($BWARP <> TRUE)
						send "l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
					end
					halt
				:next_item_port
					killAllTriggers
					#CHANGE ITEM TO NEXT
					add $colo_prod 1
					#IF PLANET FULL, HALT SCRIPT
					if ($colo_prod >= 4)
						setVar $mode "General"
						saveVar $mode
						setVar $SWITCHBOARD~message "Planet is full of colonists, no more can be added. Colonizer shutting down.*"
						gosub :SWITCHBOARD~switchboard
						send "l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
						halt
					end
				:moreport
					killalltriggers
					add $i 1
					if ($PLAYER~unlimitedGame = FALSE)
						setVar $PLAYER~turns ($PLAYER~turns-$PLAYER~TURNSPerCycle)
					end
			end
		elseif ($colo_type = "s")
			setVar $colo_cycles $colo_misc
			setVar $i 0
			if ($colo_cycles = 0)
				setVar $keepGoing TRUE
			else
				setVar $keepGoing FALSE
			end
			while (($i < $colo_cycles) OR ($keepGoing))
				if (($PLAYER~unlimitedGame = FALSE) AND ($PLAYER~TURNS < ($BOT~bot_turn_limit+$PLAYER~TURNSPerCycle)))
					if ($BWARP = FALSE)
						send "l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
					end
					setVar $SWITCHBOARD~message "Too low on turns to continue. Turn limit set to: "&($BOT~bot_turn_limit)&" turns.*"
					gosub :SWITCHBOARD~switchboard
					halt
				end
				:colo_speed
				killalltriggers


				if ($BWARP = TRUE)
					if ($PLAYER~PLANET_SCANNER = "No")
						setVar $coloBurst "b 1*y    l * * "
					else
						setVar $coloBurst "b 1*y    l 1* * * "
					end
				else
					if ($PLAYER~PLANET_SCANNER = "No")
						setVar $coloBurst "m 1* y y    l * * "
					else
						setVar $coloBurst "m 1* y y    l 1* * * "
					end

				end
				setVar $coloBurst $coloBurst&"m "&$colo_sector&"* y y    * l "&$planet~planet&"* s * * "&$colo_prod&"*"
				if ($BWARP = TRUE)
					if ($colo_prod < 3)
						setVar $coloBurst $coloBurst&"s * * "&($colo_prod+1)&"* "
					else
						setVar $coloBurst $coloBurst&""
					end
					if ($doubleOre = TRUE)
						if ($doubleOreGet = TRUE)
							setVar $doubleOreGet FALSE
							setVar $coloBurst $coloBurst&" t * t 1"&$colo_fuel&"* c "
						else
							setVar $doubleOreGet TRUE
							setVar $coloBurst $coloBurst&" c "
						end
						
					else
						setVar $coloBurst $coloBurst&"  t * t 1"&$colo_fuel&"* c "
					end

				else
					if ($colo_prod < 3)
						setVar $coloBurst $coloBurst&"s * * "&($colo_prod+1)&"* t * t 1"&$colo_fuel&"* q q * "
					else
						setVar $coloBurst $coloBurst&" t * t 1"&$colo_fuel&"* q "
					end
				end
				send $coloBurst
				if ($BWARP = TRUE)
					setTextLineTrigger 36 :noFuel "This planet does not have enough Fuel Ore to transport you."
				else
					setTextLineTrigger 36 :noFuel "<Set NavPoint>"
				end
				setTextLineTrigger 37 :fuel "All Systems Ready, shall we engage?"
				pause

				:fuel
				killalltriggers
				waitfor "There are currently"
				getword CURRENTLINE $colo_colos 4

				setTextLineTrigger 33 :morespeed "The Colonists disembark"
				setTextLineTrigger 34 :next_item_speed "There isn't room on the planet"
				setTextLineTrigger 35 :donespeed "There aren't that many on Terra!"
				pause
				:noFuel
					killalltriggers
					if ($BWARP <> TRUE)
						send "* * l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
					end
					setVar $SWITCHBOARD~message "Colonizer needs more fuel on planet "&$planet~planet&".*"
					gosub :SWITCHBOARD~switchboard
					halt
				:donespeed
					killalltriggers
					setVar $SWITCHBOARD~message "Terra is empty. Colonizer shutting down.*"
					gosub :SWITCHBOARD~switchboard
					if ($BWARP <> TRUE)
						send "l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
					end
					halt
				:next_item_speed
					killAllTriggers
					#CHANGE ITEM TO NEXT
					add $colo_prod 1
					#IF PLANET FULL, HALT SCRIPT
					if ($colo_prod >= 4)
						setVar $mode "General"
						saveVar $mode
						setVar $SWITCHBOARD~message "Planet is full of colonists, no more can be added. Colonizer shutting down.*"
						gosub :SWITCHBOARD~switchboard
						send "l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
						halt
					end
				:morespeed
					killalltriggers
					add $i 1
					if ($PLAYER~unlimitedGame = FALSE)
						setVar $PLAYER~turns ($PLAYER~turns-$PLAYER~TURNSPerCycle)
					end
			end
		elseif ($colo_type = "t")
			setVar $colo_delay $colo_misc
			setVar $i 0
			setvar $colo_Got 0
			setVar $colo_Gotten 0
			setVar $colo_Trips 0
			if ($colo_delay = 0)
				setVar $colo_delay 15
			end
			while ($colo_prod < 4)
				:colo_timed
				killalltriggers
				gosub :PLAYER~quikstats
				if (($PLAYER~unlimitedGame = FALSE) AND ($PLAYER~turns < ($BOT~bot_turn_limit+$PLAYER~TURNSPerCycle)))
					if ($BWARP = FALSE)
						send "l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
					end
					setVar $SWITCHBOARD~message "Too low on turns to continue. Turn limit set to: "&($bot_turn_limit)&" turns.*"
					gosub :SWITCHBOARD~switchboard
					halt
				end

				if ($BWARP)
					if ($PLAYER~PLANET_SCANNER = "No")
						setVar $coloBurst "b 1*y    l * "
					else
						setVar $coloBurst "b 1*y    l 1* * "
					end
				else
					if ($PLAYER~PLANET_SCANNER = "No")
						setVar $coloBurst "m 1* y y    l * "
					else
						setVar $coloBurst "m 1* y y    l 1* * "
					end
				end
				send $coloBurst
				waitfor "There are currently"
				getword CURRENTLINE $colo_colos 4
				if ($colo_colos > $colo_get)
					send $colo_get&"* "
					setVar $colo_got $colo_get
				else
					send $colo_colos&"* "
					setVar $colo_got $colo_colos
				end
				setVar $coloBurst "m "&$colo_sector&"* y y    * l "&$planet~planet&"* s * * "&$colo_prod&"*"
				if ($BWARP)
					if ($colo_prod < 3)
						setVar $coloBurst $coloBurst&"s * * "&($colo_prod+1)&"* t * t 1"&$colo_fuel&"* c "
					else
						setVar $coloBurst $coloBurst&" t * t 1"&$colo_fuel&"* c "
					end
				else
					if ($colo_prod < 3)
						setVar $coloBurst $coloBurst&"s * * "&($colo_prod+1)&"* t * t 1"&$colo_fuel&"* q q * "
					else
						setVar $coloBurst $coloBurst&" t * t 1"&$colo_fuel&"* q "
					end
				end
				send $coloBurst
				if ($BWARP)
					setTextLineTrigger 36 :noFuelTimed "This planet does not have enough Fuel Ore to transport you."
				else
					setTextLineTrigger 36 :noFuelTimed "<Set NavPoint>"
				end
				setTextLineTrigger 37 :fuelTimed "All Systems Ready, shall we engage?"
				pause

				:fuelTimed
				killalltriggers

				setTextLineTrigger 33 :moretimed "The Colonists disembark"
				setTextLineTrigger 34 :next_item_timed "There isn't room on the planet"
				pause
				:noFuelTimed
					killalltriggers
					if ($BWARP <> TRUE)
						send "* * l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
					end
					setVar $SWITCHBOARD~message "Colonizer needs more fuel on planet "&$planet~planet&".*"
					gosub :SWITCHBOARD~switchboard
					halt

				:next_item_timed
					killAllTriggers
					#CHANGE ITEM TO NEXT
					add $colo_prod 1
					#IF PLANET FULL, HALT SCRIPT
					if ($colo_prod >= 4)
						setVar $SWITCHBOARD~message "Planet is full of colonists, no more can be added. Colonizer shutting down.*"
						gosub :SWITCHBOARD~switchboard
						if ($BWARP <> TRUE)
							send "l "&$planet~planet&"* "
							if ($startingLocation = "Citadel")
								send "c "
							end
						end
						halt
					end
				:moretimed
					killalltriggers
					if ($colo_colos < $colo_get)
						add $colo_Gotten $colo_got
						add $colo_Trips 1
						setVar $SWITCHBOARD~message "Cols Grabbed: " & $colo_got & " (" & $colo_Trips & " Trips, Total: " & $colo_Gotten & ")*"
						gosub :SWITCHBOARD~switchboard
						setDelayTrigger 40 :colo_timed ($colo_delay*1000)
						pause
					end
			end
		elseif ($colo_type = "r")
			setVar $jump_sector $colo_misc
			setVar $colo_prod 1
			while (TRUE)
				if (($PLAYER~unlimitedGame = FALSE) AND ($PLAYER~TURNS < ($BOT~bot_turn_limit+$PLAYER~TURNSPerCycle)))
					if ($BWARP = FALSE)
						send "l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
					end
					setVar $SWITCHBOARD~message "Too low on turns to continue. Turn limit set to: "&($BOT~bot_turn_limit)&" turns.*"
					gosub :SWITCHBOARD~switchboard
					halt
				end
				:colo_red
				killalltriggers
				if ($no_twarp = true)
						if ($PLAYER~PLANET_SCANNER = "No")
							setVar $coloBurst $to_mow&"          l * * "
						else
							setVar $coloBurst $to_mow&"          l 1* * * "
						end
				else
					if ($BWARP = TRUE)
						if ($PLAYER~PLANET_SCANNER = "No")
							setVar $coloBurst "b "&$jump_sector&"*y      "&$to_mow&"          l * * "
						else
							setVar $coloBurst "b "&$jump_sector&"*y       "&$to_mow&"          l 1* * * "
						end
					else
						if ($PLAYER~PLANET_SCANNER = "No")
							setVar $coloBurst "m "&$jump_sector&"* y y       "&$to_mow&"        l * * "
						else  
							setVar $coloBurst "m "&$jump_sector&"* y y       "&$to_mow&"        l 1* * * "
						end

					end
				end
				setVar $coloBurst $coloBurst&"m "&$colo_sector&"* y y    * l "&$planet~planet&"* s * * "&$colo_prod&"*"
				if ($BWARP = TRUE)
					if ($colo_prod < 3)
						setVar $coloBurst $coloBurst&"s * * "&($colo_prod+1)&"* t * t 1"&$colo_fuel&"* c "
					else
						setVar $coloBurst $coloBurst&" t * t 1"&$colo_fuel&"* c "
					end
				else
					if ($colo_prod < 3)
						setVar $coloBurst $coloBurst&"s * * "&($colo_prod+1)&"* t * t 1"&$colo_fuel&"* q q * "
					else
						setVar $coloBurst $coloBurst&" t * t 1"&$colo_fuel&"* q "
					end
				end
				send $coloBurst
				if ($BWARP = TRUE)
					setTextLineTrigger 36 :noFuelRed "This planet does not have enough Fuel Ore to transport you."
				else
					setTextLineTrigger 36 :noFuelRed "<Set NavPoint>"
				end
				setTextLineTrigger 37 :fuelRed "All Systems Ready, shall we engage?"
				pause

				:fuelRed
	#			killalltriggers
	#			waitfor "There are currently"
	#			getword CURRENTLINE $colo_colos 4

				setTextLineTrigger 33 :morered "The Colonists disembark"
				setTextLineTrigger 34 :next_item_red "There isn't room on the planet"
				setTextLineTrigger 35 :donered "There aren't that many on Terra!"
				pause
				:noFuelRed
					killalltriggers
					if ($BWARP <> TRUE)
						send "* * l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
					end
					setVar $SWITCHBOARD~message "Colonizer needs more fuel on planet "&$planet~planet&".*"
					gosub :SWITCHBOARD~switchboard
					halt
				:donered
					killalltriggers
					setVar $SWITCHBOARD~message "Terra is empty. Colonizer shutting down.*"
					gosub :SWITCHBOARD~switchboard
					if ($BWARP <> TRUE)
						send "l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
					end
					halt
				:next_item_red
					#CHANGE ITEM TO NEXT
					add $colo_prod 1
					#IF PLANET FULL, HALT SCRIPT
					if ($colo_prod >= 4)
						setVar $mode "General"
						saveVar $mode
						setVar $SWITCHBOARD~message "Planet is full of colonists, no more can be added. Colonizer shutting down.*"
						gosub :SWITCHBOARD~switchboard
						send "l "&$planet~planet&"* "
						if ($startingLocation = "Citadel")
							send "c "
						end
						halt
					end
				:morered
					killalltriggers
					if ($PLAYER~unlimitedGame = FALSE)
						setVar $PLAYER~turns ($PLAYER~turns-$PLAYER~TURNSPerCycle)
					end
			end
		end
	# ======================     END COLO MILKER (colo) SUBROUTINE     ==========================
	halt


	#INCLUDES:
	
	include "source\module_includes\bot\loadvars\bot"
	include "source\module_includes\bot\helpfile\bot"
	include "source\module_includes\bot\banner\bot"

	include "source\bot_includes\player\currentprompt\player"
	include "source\bot_includes\player\getcourse\player"
	include "source\bot_includes\player\quikstats\player"
	include "source\bot_includes\player\getinfo\player"

	include "source\bot_includes\planet\getplanetnumber\planet"
	include "source\bot_includes\planet\countplanets\planet"

	include "source\bot_includes\ship\getshipstats\ship"
