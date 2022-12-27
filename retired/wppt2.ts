	reqrecording

	gosub :BOT~loadVars

	loadVar $GAME~GENESIS_COST
	loadVar $GAME~ATOMIC_COST
	loadvar $game~HOLO_COST
	loadVar $MAP~STARDOCK 
	loadvar $bot~folder
	loadvar $game~MAX_PLANETS_PER_SECTOR
	loadvar $planet~planet_file
	loadVar $BOT~botIsDeaf
	loadVar $BOT~silent_running
	loadvar $game~steal_factor
	loadVar $game~port_max
	loadVar $game~ptradesetting
	loadvar $bot~$MCIC_FILE


	setVar $setVarPlanetType1 "Striking Distance"
	setVar $setVarPlanetType2 "Creeper"
	setVar $setVarPlanetType3 "Greenhouse"
	setVar $setVarPlanetType4 "Endless Night"
	setVar $setVarPlanetType5 "Final Frontier"


	setVar $BOT~command "wppt2"

	setVar $BOT~help[1]   $BOT~tab&"World Port-Pair-Trade "
	setVar $BOT~help[2]   $BOT~tab&" - wppt2  "
	gosub :bot~helpfile

	setvar $player~save true


	# Trading Min Fuel - we'll stop using a port when we get here
	setVar $tradingMinFuel 40

	# try and grab fuel at this
	setVar $minOre 120
	

	goto :Starting
	

:GoGo

	if (($player~current_sector = $map~stardock) or (($player~scan_type <> "Holo") and ($player~credits > $game~holo_cost)))
		gosub :refurb
		getRnd $mowIntoSector 11 SECTORS
		gosub :mowIntoSector
		gosub :player~quikstats
	end
	while (TRUE)
		if (($player~unlimitedGame = FALSE) AND ($player~turns <= $bot~bot_turn_limit))
			goto :endSST
		end
		if (($player~genesis <= 0) and ($player~credits > $CASH_TO_HOLD_ONTO))
			gosub :refurb
			if ($twarp_refurb_success <> true)
				getRnd $mowIntoSector 11 SECTORS
				gosub :mowIntoSector
			end
		end
		setvar $needNewPortPair true
		gosub :findPPTPorts
		setVar $busted FALSE

		if ($player~fuel_holds > 0) and (PORT.BUYFUEL[$port1] <> true) and (PORT.BUYFUEL[$port2] <> true)
			send "j y "
		end
		if ($player~organic_holds > 0) and (PORT.BUYORG[$port1] <> true) and (PORT.BUYORG[$port2] <> true)
			send "j y "
		end
		if ($player~equipment_holds > 0) and (PORT.BUYEQUIP[$port1] <> true) and (PORT.BUYEQUIP[$port2] <> true)
			send "j y "
		end
		gosub :player~quikstats

		setvar $fueltrade false
		setvar $orgtrade false
		setvar $equiptrade false

		if ((PORT.BUYFUEL[$port1] <> PORT.BUYFUEL[$port2]))
			setvar $fuelAtPort[$port1] PORT.FUEL[$port1]
			setvar $fuelAtPort[$port2] PORT.FUEL[$port2]
			setvar $fueltrade true
		end
		if ((PORT.BUYORG[$port1] <> PORT.BUYORG[$port2]))
			setvar $orgAtPort[$port1] PORT.ORG[$port1]
			setvar $orgAtPort[$port2] PORT.ORG[$port2]
			setvar $orgtrade true
		end
		if ((PORT.BUYEQUIP[$port1] <> PORT.BUYEQUIP[$port2]))
			setvar $equipAtPort[$port1] PORT.EQUIP[$port1]
			setvar $equipAtPort[$port2] PORT.EQUIP[$port2]
			setvar $equiptrade true
			if (($fueltrade = true) and ($orgtrade = true))
				setvar $fueltrade false
			end
		end
		setvar $portempty false
		setvar $current_sector $port2
		while ($portempty <> true)
			if (($player~unlimitedGame = FALSE) AND ($player~turns <= $bot~bot_turn_limit))
				goto :endSST
			end

			if ($current_sector = $port1)
				setvar $port_sector $port1
				gosub :ppt
				setvar $port_sector $port2
				gosub :ppt_move
			else
				setvar $port_sector $port2
				gosub :ppt
				setvar $port_sector $port1
				gosub :ppt_move
			end
			if (($fueltrade = true) and (($fuelAtPort[$port1] < $player~total_holds) or ($fuelAtPort[$port2] < $player~total_holds)))
				setvar $portempty true
			end
			if (($orgtrade = true) and (($orgAtPort[$port1] < $player~total_holds) or ($orgAtPort[$port2] < $player~total_holds)))
				setvar $portempty true
			end
			if (($equiptrade = true) and (($equipAtPort[$port1] < $player~total_holds) or ($equipAtPort[$port2] < $player~total_holds)))
				setvar $portempty true
			end

		end
		setvar $usedPorts[$port1] true
		setvar $usedPorts[$port2] true
		send "#"
		gosub :player~quikstats
		loadVar $bot~alarm_list
		if (($alarm_active) AND ($bot~alarm_list <> ""))
			loadVar $bot~who_is_online
			lowercase $bot~alarm_list
			lowercase $bot~who_is_online
			getWordPos $bot~alarm_list $pos ","
			if ($pos > 0)
				splitText $bot~alarm_list $alarm ","
			else
				setArray $alarm 1
				setVar $alarm[1] $bot~alarm_list
				setVar $alarm 1
			end
			setVar $i 1
			while ($i <= $alarm)
				getWordPos $bot~who_is_online $pos " "&$alarm[$i]&" "
				if ($pos > 0)
					send "'Alarm triggered by "&$alarm[$i]&", contingency plan engaged.*"
					send "'"&$bot~bot_name&" x x*"
					halt
				end
				add $i 1
			end
		end
		if (($dropCashAtBase = TRUE) AND ($player~credits > $dropCashLimit))
			gosub :dropCashAtBase
		end
	end
	goto :endSST



:moveIntoSector
	setVar $result ""
	setVar $dropFigs TRUE
	setVar $result $result&"m "&$moveIntoSector&"*"
	if (($moveIntoSector > 10) AND ($moveIntoSector <> $map~stardock))
		if ($player~fighters > $ship~ship_max_attack)
			setVar $result $result&"za"&$ship~ship_max_attack&"* * "
		else
			setVar $result $result&"za"&$player~fighters&"* * "
		end
	end
	if (($dropFigs = TRUE) AND ($moveIntoSector > 10) AND ($moveIntoSector <> $map~stardock) AND ($j > 2))
		setVar $FIG_DROP 1
		if ($x100)
			if ($player~fighters > 1000)
				setVar $FIG_DROP 100
				setvar $player~fighters ($player~fighters - 100)
			end
		elseif ($x1000)
			if ($player~fighters > 10000)
				setVar $FIG_DROP 1000
				setvar $player~fighters ($player~fighters - 1000)
			end
		end
		getRnd $coin 1 100
		if ($coin < 50)
			setVar $result $result&"f  z  "&$FIG_DROP&"* z  c  d  *  "
		else
			setVar $result $result&"f  z  "&$FIG_DROP&"* z  c  o  *  "
		end
	end
	if ($DROPLIMPS)
		setVar $result $result&"  H  2  Z  3*  Z C  *  "
	end
	if ($DROPARMIDS)
		setVar $Result $result&"  H  1  Z  3*  Z C  *  "
	end
	send $result
	#waitOn "["&$moveIntoSector&"]"
	#if (($dropFigs) AND ($moveIntoSector > 10) AND ($moveIntoSector <> $map~stardock) AND ($j > 2))
	#	waitOn "<Drop/Take Fighters>"
	#end
	send "  s*sh"
	waitOn "Long Range Scan"
	goSub :SECTOR~getAutoSectorData
	if ($sector~sectortargetfound)
		goSub :combat~fastAttack
		gosub :player~quikstats
		if ((($player~current_sector = 1) or ($player~current_sector = $map~stardock)) and ($furb = true))
			if ($player~isFound)
				load "scripts\"&$bot~mombot_directory&"\commands\general\refurb.cts"
				setEventTrigger		1		:refurbended	"SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\general\refurb.cts"
				pause
				:refurbended
				setvar $sector~passive false
				goSub :SECTOR~getSectorData
				goSub :combat~fastAttack
			end
		end
	elseif ($sector~holotargetfound)
		goSub :combat~passiveHolokill
		gosub :switchboard~switchboard
	end
	return

:findPPTPorts

	while ($needNewPortPair = TRUE)
		:tryNewRouteShip1
		setVar $destination 0
		while ($destination = 0)
			send "  sh"
			gosub :getRandomCourse
			gosub :player~quikstats
		end
		setVar $j 3
		while (($j <= $courseLength) AND ($needNewPortPair = TRUE))
			setVar $moveIntoSector $COURSE[$j]
			setVar $containsShieldedPlanet FALSE
			setVar $p 1
			#echo "**["&$moveintosector&"]**["&$sectors&"]*"
			while ($p <= SECTOR.PLANETCOUNT[$moveIntoSector])
				getWord SECTOR.PLANETS[$moveIntoSector][$p] $test 1
				if ($test = "<<<<")
					setVar $containsShieldedPlanet TRUE
				end
				add $p 1
			end
        		if ($containsShieldedPlanet)
				echo "*Avoiding shielded planet*"
				goto :tryNewRouteShip1
			end
			setVar $figOwner  SECTOR.FIGS.OWNER[$moveIntoSector]
			setVar $mineOwner SECTOR.MINES.OWNER[$moveIntoSector]
			setVar $limpOwner SECTOR.LIMPETS.OWNER[$moveIntoSector]
			setVar $figCount  SECTOR.FIGS.QUANTITY[$moveIntoSector]
			if (($figCount > $safeFighterLevel) AND (($figOwner <> "belong to your Corp") AND ($figOwner <> "yours")))
				echo "*Avoiding too many enemy fighters*"
				goto :tryNewRouteShip1
			end
			gosub :moveIntoSector

			setvar $current_port_class PORT.CLASS[$COURSE[$j]]
			setvar $port1 $COURSE[$j]

			setvar $sector $COURSE[$j]
			setvar $isUsedUp $usedPorts[$sector] 
			if ((PORT.BUYFUEL[$sector]) and ($isUsedUp <> true) and (PORT.FUEL[$sector] > 1000) and ($player~genesis > 0) and ($nomoo <> true))
				send "* cr*q"
				waitOn "What sector is the port in? ["
				if (PORT.FUEL[$sector] > 1000)
					gosub :createAndSell
				end
				setvar $usedPorts[$sector] true
			else
				if ($nomoo <> true)
					setVar $k 1
					setVar $isFound FALSE
					while ((SECTOR.WARPS[$sector][$k] > 0) AND ($isFound = FALSE))
						setVar $checkingNeighbor SECTOR.WARPS[$sector][$k]
						getSectorParameter $checkingNeighbor "BUSTED" $isBusted
						setVar $containsShieldedPlanet FALSE
						setVar $p 1
						while ($p <= SECTOR.PLANETCOUNT[$checkingNeighbor])
							getWord SECTOR.PLANETS[$checkingNeighbor][$p] $test 1
							if ($test = "<<<<")
								setVar $containsShieldedPlanet TRUE
							end
							add $p 1
						end
						setVar $figOwner  SECTOR.FIGS.OWNER[$checkingNeighbor]
						setVar $mineOwner SECTOR.MINES.OWNER[$checkingNeighbor]
						setVar $limpOwner SECTOR.LIMPETS.OWNER[$checkingNeighbor]
						setVar $figCount  SECTOR.FIGS.QUANTITY[$checkingNeighbor]
						if (($figCount > $safeFighterLevel) AND (($figOwner <> "belong to your Corp") AND ($figOwner <> "yours")))
							echo "*Avoiding too many enemy fighters*"
							goto :tryNewRouteShip1
						end
						if ((PORT.BUYFUEL[$checkingNeighbor]) and ($isUsedUp <> true) and (PORT.FUEL[$checkingNeighbor] > 1000) and ($player~genesis > 0))
							setVar $moveIntoSector $checkingNeighbor
							gosub :moveIntoSector
							send "* cr*q"
							waitOn "What sector is the port in? ["
							gosub :createAndSell
							goto :tryNewRouteShip1
						end
						add $k 1
					end
				end


			end
			:checkagainport
			setvar $isUsedUp $usedPorts[$sector] 
			if (($current_port_class > 0) and ($current_port_class < 7) and ($isUsedUp <> true))
				send "* cr*q"
				waitOn "What sector is the port in? ["
				if ((PORT.FUEL[$sector] < $player~total_holds) or (PORT.ORG[$sector] < $player~total_holds) or (PORT.EQUIP[$sector] < $player~total_holds))
					setvar $usedPorts[$sector] true
					goto :checkagainport
				end
				setVar $k 1
				setVar $isFound FALSE
				while ((SECTOR.WARPS[$sector][$k] > 0) AND ($isFound = FALSE))
					setVar $checkingNeighbor SECTOR.WARPS[$sector][$k]
					getSectorParameter $checkingNeighbor "BUSTED" $isBusted
					setVar $containsShieldedPlanet FALSE
					setVar $p 1
					while ($p <= SECTOR.PLANETCOUNT[$checkingNeighbor])
						getWord SECTOR.PLANETS[$checkingNeighbor][$p] $test 1
						if ($test = "<<<<")
							setVar $containsShieldedPlanet TRUE
						end
						add $p 1
					end
					setVar $figOwner  SECTOR.FIGS.OWNER[$checkingNeighbor]
					setVar $mineOwner SECTOR.MINES.OWNER[$checkingNeighbor]
					setVar $limpOwner SECTOR.LIMPETS.OWNER[$checkingNeighbor]
					setVar $figCount  SECTOR.FIGS.QUANTITY[$checkingNeighbor]
					setvar $neighbor_port_class PORT.CLASS[$checkingNeighbor]

					getDistance $distance $checkingNeighbor $port1
					if ($distance <= 0)
						send "^f" & $checkingNeighbor & "*" & $port1 & "*q"
						waitOn "ENDINTERROG"
						getDistance $distance $checkingNeighbor $port1
					end

					setvar $pair_found false
					if ($current_port_class = 1)
						if (($neighbor_port_class >= 2) and ($neighbor_port_class <= 4))
							setvar $pair_found true
						end 
					end
					if ($current_port_class = 2)
						if (($neighbor_port_class = 1) or ($neighbor_port_class = 3) or ($neighbor_port_class = 5))
							setvar $pair_found true
						end 
					end
					if ($current_port_class = 3)
						if (($neighbor_port_class = 1) or ($neighbor_port_class = 2) or ($neighbor_port_class = 6))
							setvar $pair_found true
						end 
					end
					if ($current_port_class = 4)
						if (($neighbor_port_class = 1) or ($neighbor_port_class = 5) or ($neighbor_port_class = 6))
							setvar $pair_found true
						end 
					end
					if ($current_port_class = 5)
						if (($neighbor_port_class = 2) or ($neighbor_port_class = 4) or ($neighbor_port_class = 6))
							setvar $pair_found true
						end 
					end
					if ($current_port_class = 6)
						if (($neighbor_port_class = 3) or ($neighbor_port_class = 4) or ($neighbor_port_class = 5))
							setvar $pair_found true
						end 
					end

					if (($pair_found = true) and ($distance = 1) AND ($isBusted <> TRUE) AND ($containsShieldedPlanet = FALSE) AND (($figCount <= $safeFighterLevel) AND (($figOwner = "belong to your Corp") OR ($figOwner = "yours"))))
						setVar $moveIntoSector $checkingNeighbor
						gosub :moveIntoSector
						send "* cr*q"
						waitOn "What sector is the port in? ["
						setVar $needNewPortPair FALSE
						setVar $port2 $checkingNeighbor
						setVar $isFound TRUE
					end
					add $k 1
				end
			end
			add $j 1
		end
	end
return

:getRandomCourse
#Does Random Course Calculation
	killalltriggers
	setArray $COURSE 80
	setVar $courseLength 0
	setVar $sectors ""
	setTextLineTrigger sectorlinetrig :sectorsline " > "
	getRnd $destination 11 SECTORS
	send "^f*"&$destination&"**q"
	pause

:getCourse
#Does Specific Course Calculation
	killalltriggers
	setVar $courseLength 0
	setArray $COURSE 80
	setVar $sectors ""
	setTextLineTrigger sectorlinetrig :sectorsline " > "
	send "^f*"&$destination&"**q"
	pause


:sectorsline
	killAllTriggers
	setVar $line CURRENTLINE
	replacetext $line ">" " "
	striptext $line "("
	striptext $line ")"
	setVar $line $line&" "
	getWordPos $line $pos "So what's the point?"
	getWordPos $line $pos2 ": ENDINTERROG"
	getWordPos $line $pos3 "*** Error - No route within"
	if (($pos > 0) OR ($pos2 > 0) OR ($pos3 > 0))
		goto :noPath
	end
	getWordPos $line $pos " sector "
	getWordPos $line $pos2 "TO"
	if (($pos <= 0) AND ($pos2 <= 0))
		setVar $sectors $sectors & " " & $line
	end
	getWordPos $line&" " $pos " "&$destination&" "
	getWordPos $line $pos2 "("&$destination&")"
	getWordPos $line $pos3 "TO"
	if ((($pos > 0) OR ($pos2 > 0)) AND ($pos3 <= 0))
		goto :gotSectors
	else
		setTextLineTrigger sectorlinetrig :sectorsline " > "
		setTextLineTrigger sectorlinetrig2 :sectorsline " "&$destination&" "
		setTextLineTrigger sectorlinetrig3 :sectorsline " "&$destination
		setTextLineTrigger sectorlinetrig4 :sectorsline "("&$destination&")"
		setTextLineTrigger donePath :sectorsline "So what's the point?"
		setTextLineTrigger donePath2 :sectorsline ": ENDINTERROG"
	end
	pause

:gotSectors
	killAllTriggers
	setVar $sectors $sectors&" :::"
	setVar $courseLength 0
	setVar $index 1
	:keepGoing
	getWord $sectors $COURSE[$index] $index
	while ($COURSE[$index] <> ":::")
		add $courseLength 1
		add $index 1
		getWord $sectors $COURSE[$index] $index
	end

:noPath
	if ($courseLength <= 0)
		setVar $destination 0
	end
	killAllTriggers
	return



:ppt
	setvar $send ""
	if (($player~ore_holds > 0) and (PORT.BUYFUEL[$port_sector])) or (($player~organic_holds > 0) and (PORT.BUYORG[$port_sector])) or (($player~equipment_holds > 0) and (PORT.BUYEQUIP[$port_sector]))
		setVar $send $send & "p t * * "
		setvar $player~ore_holds 0
		setvar $player~organic_holds 0
		setvar $player~equipment_holds 0
	else
		setvar $send $send & "j y p t "
	end
	if ($fueltrade <> true) and (PORT.BUYFUEL[$port_sector] <> true)
		setVar $send $send & "0 * "	
	else
		if ($fueltrade = true) and (PORT.BUYFUEL[$port_sector] <> true)
			setVar $send $send & "* * "
		end
		if (PORT.BUYFUEL[$port_sector] <> true)
			setvar $player~ore_holds $player~total_holds
		end
		subtract $fuelAtPort[$port_sector] $player~total_holds
	end
	if ($orgtrade <> true) and (PORT.BUYORG[$port_sector] <> true)
		setVar $send $send & "0 * "	
	else
		if ($orgtrade = true) and (PORT.BUYORG[$port_sector] <> true)
			setVar $send $send & "* * "
		end
		if (PORT.BUYORG[$port_sector] <> true)
			setvar $player~organic_holds $player~total_holds
		end
		subtract $orgAtPort[$port_sector] $player~total_holds
	end
	if ($equiptrade <> true) and (PORT.BUYEQUIP[$port_sector] <> true)
		setVar $send $send & "0 * "	
	else
		if ($equiptrade = true) and (PORT.BUYEQUIP[$port_sector] <> true)
			setVar $send $send & "* * "
		end
		if (PORT.BUYEQUIP[$port_sector] <> true)
			setvar $player~equipment_holds $player~total_holds
		end
		subtract $equipAtPort[$port_sector] $player~total_holds
	end
	setVar $send $send & "* * "
return

:ppt_move
	setVar $send $send&"m "&$port_sector&"* "
	if (($port_sector > 10) AND ($port_sector <> $map~stardock))
		if ($player~fighters > $ship~ship_max_attack)
			setVar $send $send&"za"&$ship~ship_max_attack&"* * "
		else
			setVar $send $send&"za"&$player~fighters&"* * "
		end
	end
	send $send
	waitOn "["&$port_sector&"]"
	setvar $current_sector $port_sector
return

:getSSTPortInfo
	
	send "* cr*q"
	waitOn "What sector is the port in? ["
	:portInfo
		killtrigger 1
		killtrigger 2
		setTextLineTrigger 1 :getPortEquip "Equipment  Buying"
		setTextLineTrigger 2  :noEquipHere "I have no information about a port in that sector."
		pause

		:noEquipHere
			killalltriggers
			setVar $equipBuy 0
			setVar $equipPerc 0
			goto :gotAllPortInfo

		:getPortEquip
			killAllTriggers
			getWord CURRENTLINE $equipBuy 3
			getWord CURRENTLINE $equipPerc 4
			stripText $equipPerc "%"
			setVar $x 10000
			if ($equipPerc = 0)
 				setVar $equipAtPort[$TestSector] ($player~total_holds + 50)
			else
				divide $x $equipPerc
				multiply $x $equipBuy
				divide $x 100
				subtract $x 1
				subtract $x $equipBuy

				if ($x < 0)
					setVar $equipAtPort[$TestSector] 0
				else
       	 				setVar $equipAtPort[$TestSector] $x
				end
			end
		:gotallportinfo
			killtrigger 1
			killtrigger 2

  return

:refurb
	setvar $refurbPort $map~stardock

	setvar $twarp_refurb_success false
	if (($player~twarp_type <> "No") and ($player~current_sector <> $map~stardock))

		gosub :twarprefurb
		gosub :player~quikstats

	end
	if ($twarp_refurb_success <> true)
		if ($FURBING <> 0)
			setVar $mowIntoSector $FURBING
			setVar $refurbPort $FURBING
		else
			setVar $mowIntoSector $refurbPort
		end
		if ($ultraSafe)
			:trySafeMowAgainRefurb
				gosub :safemowIntoSector
				if ($isSafe = FALSE)
					goto :trySafeMowAgainRefurb
				end
		else
			gosub :mowIntoSector
		end
		gosub :player~quikstats
		if ($player~current_sector = $refurbPort)
			if ($FURBING <> $map~stardock)
				send "p ty"
			else
				send "p s g y g q "
			end
		end
	end

	if ($player~current_sector = $refurbPort)
		killAllTriggers
		send " s p"
		waitOn "A  Cargo holds     :"
		getWord CURRENTLINE $holdsprice 5
		getWord CURRENTLINE $holdsToBuy 10
		setVar $beforeFurbCredits $player~credits
		if ($player~credits > $CASH_TO_HOLD_ONTO)
			if ($refurbFighters)
				waitOn "B  Fighters        :"
				getWord CURRENTLINE $figprice 4
				getWord CURRENTLINE $figsToBuy 8
			else
				setVar $figsToBuy 0
			end
			if ($refurbShields)
				waitOn "C  Shield Points   :"
				getWord CURRENTLINE $shieldprice 5
				getWord CURRENTLINE $player~shieldsToBuy 9
			else
				setVar $player~shieldsToBuy 0
			end
			if ($holdsToBuy > 0)
				if (($holdsprice * $holdsToBuy) > ($player~credits-$CASH_TO_HOLD_ONTO))
					setVar $holdsToBuy (($player~credits-$CASH_TO_HOLD_ONTO)/$holdsprice)
				end
				setVar $player~credits ($player~credits-($holdsprice * $holdsToBuy))
			end
			if ($figsToBuy > 0)
				if (($figprice * $figsToBuy) > ($player~credits-$CASH_TO_HOLD_ONTO))
					setVar $figsToBuy (($player~credits-$CASH_TO_HOLD_ONTO)/$figprice)
				end
				setVar $player~credits ($player~credits-($figprice * $figsToBuy))
			end
			if ($player~shieldsToBuy > 0)
				if (($shieldprice * $player~shieldsToBuy) > ($player~credits-$CASH_TO_HOLD_ONTO))
					setVar $player~shieldsToBuy (($player~credits-$CASH_TO_HOLD_ONTO)/$shieldprice)
				end
				setVar $player~credits ($player~credits-($shieldprice * $player~shieldsToBuy))
			end
		else
			setVar $figsToBuy 0
			setVar $player~shieldsToBuy 0
			setvar $holdsToBuy 0
		end
			send "a "&$holdsToBuy&"* y b "&$figsToBuy&"* c "&$player~shieldsToBuy&"* q q h "
			waitfor "<Hardware Emporium>"
			if ($DROPLIMPS)
				send "L"
				waitfor "How many mines do you want"
				getText CURRENTLINE $Buy "(Max" ") ["
				striptext $buy " "
				send $buy & "*"
				waitfor "<Hardware Emporium>"
			end
			if ($DROPARMIDS)
				send "M"
				waitfor "How many mines do you want"
				getText CURRENTLINE $Buy "(Max" ") ["
				striptext $buy " "
				send $buy & "*"
				waitfor "<Hardware Emporium>"
			end
			send "r h T"
			waitfor "How many Genesis Torpedoes do you want"
			getText CURRENTLINE $Buy "(Max" ") ["
			striptext $buy " "
			send $buy & "*"
			waitfor "<Hardware Emporium>"

			send "/"
			waitfor #179 & "Figs"
			getText CURRENTLINE $player~credits (#179 & "Creds") (#179 & "Figs")
			striptext $player~credits " "
			stripText $player~credits ","

		setVar $spentCredits ($spentCredits+($beforeFurbCredits-$player~credits))
		setVar $player~fightersPurchased ($player~fightersPurchased+$figsToBuy)
		setVar $player~shieldsPurchased ($player~shieldsPurchased+$player~shieldsToBuy)
	else
		send "'Something bad happened on refurb, I am probably in big trouble. [Temp error message until saveme implemented]*"
	end
	if ($twarp_refurb_success = true)
		send "Q Q Q Q Z N M " & $START_SECTOR & "* Y  Y  Y  * *"
		gosub :PLAYER~quikstats
		if (player~current_sector = $MAP~stardock)
			setvar $switchboard~message "Twarp Error, Should be Hiding on Dock!*"
			gosub :switchboard~switchboard
			send "*"
			halt
		end
	else
		setvar $twarp_refurb_success false
		send " Q Q "
	end	
return

:safemowIntoSector
	setVar $isSafe TRUE
	setVar $destination $mowIntoSector
	gosub :getCourse
	setVar $j 2
	setVar $result ""
	while (($j <= $courseLength) AND ($isSafe))
		setVar $nextSafeSector $Course[$j]
		send "sdsh"
		waitOn "Long Range Scan"
		waiton "Warps to Sector(s) :"
		#gosub :player~quikstats
		setVar $minesafe TRUE
		setVar $figsSafe  ((SECTOR.FIGS.QUANTITY[$nextSafeSector] <= 0) OR (((SECTOR.FIGS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.FIGS.OWNER[$nextSafeSector] = "belong to your Corp"))))
		setVar $planet~planetSafe ((SECTOR.PLANETCOUNT[$nextSafeSector] <= 0) OR (($nextSafeSector = $map~stardock) OR ($nextSafeSector <= 10)))
		setVar $navHazSafe TRUE
		setVar $densitySafe TRUE
		setVar $player~limpetsafe TRUE
		if ($densitySafe OR ($player~limpetsSafe AND $figsSafe AND $minesSafe AND $navHazSafe AND $planet~planetSafe))
			setVar $result ($result & "m "&$Course[$j]&"* ")
			if (($COURSE[$j] > 10) AND ($COURSE[$j] <> STARDOCK))
				setVar $result ($result & "za"&$ship~ship_max_attack&"* * ")
			end
		else
			setVar $result ($result & "c v"&$nextSafeSector&"*q ")
			setVar $isSafe FALSE
			send $result
			return
		end
		if (($Course[$j] > 10) AND ($Course[$j] <> STARDOCK) AND ($j > 2))
			setVar $result ($result & "f z 1* z c d * ")
			setSectorParameter $Course[$j] "FIGSEC" TRUE
	       	if ($DROPLIMPS)
				setVar $result $result&"  H  2  Z  3*  Z C  *  "
			end
			if ($DROPARMIDS)
				setVar $Result $result&"  H  1  Z  3*  Z C  *  "
			end
		end
		setVar $result ($result & "  /")
		send $result
		waitfor (#179 & "Turns")
		add $j 1
	end
return

:mowIntoSector
	setVar $destination $mowIntoSector
	gosub :getCourse
	setVar $j 2
	setVar $result ""
	while ($j <= $courseLength)
		setVar $result $result&"m"&$COURSE[$j]&"* "
		if (($COURSE[$j] > 10) AND ($COURSE[$j] <> STARDOCK))
			setVar $result $result&"za"&$ship~ship_max_attack&"* * "
		end
		if (($dropFigs = TRUE) AND ($COURSE[$j] > 10) AND ($COURSE[$j] <> STARDOCK) AND ($j > 2))
			setVar $FIG_DROP 1
			if ($x100)
				if ($player~fighters > 1000)
					setVar $FIG_DROP 100
					setvar $player~fighters ($player~fighters - 100)
				end
			elseif ($x1000)
				if ($player~fighters > 10000)
					setVar $FIG_DROP 1000
					setvar $player~fighters ($player~fighters - 1000)
				end
			end
			setVar $result $result&"f  z  "&$FIG_DROP&"* z  c  d  *  "
			setSectorParameter $Course[$j] "FIGSEC" TRUE
		end

       	if ($DROPLIMPS)
			setVar $result $result&"  H  2  Z  3*  Z C  *  "
			setSectorParameter $Course[$j] "LIMPSEC" TRUE
		end
		if ($DROPARMIDS)
			setVar $Result $result&"  H  1  Z  3*  Z C  *  "
			setSectorParameter $Course[$j] "MINESEC" TRUE
		end

		add $j 1
	end
	send $result
return
:dropCashAtBase
	if ($player~credits > $dropCashLimit)
		setVar $mowIntoSector $cashDropSector
		if ($ultraSafe)
			:trySafeMowAgain
				gosub :safemowIntoSector
				if ($isSafe = FALSE)
					goto :trySafeMowAgain
				end
		else
			gosub :mowIntoSector
		end
		gosub :player~quikstats
		if ($player~current_sector = $cashDropSector)
			send "l "&$cashDropPlanet &"* c t t "&($player~credits-1000000)&"* qq* "
			#send "l "&$cashDropPlanet &"* m n l "&($player~fighters/2)&"*  c t t "&($player~credits-1000000)&"* qq* "
			add $cashDeposited ($player~credits-1000000)
			setVar $player~credits 1000000
		else
			send "'Something bad happened on mow, I am probably in big trouble. [Temp error message until saveme implemented]*"
		end
	end
return


:endSST
	killalltriggers
	send "q q q q  * * * "
	setvar $switchboard~message "World SST has completed, make sure you pick up the bot and its ships.*"
	gosub :switchboard~switchboard
	halt




:Starting
	loadVar $game~steal_factor
	loadVar $player~unlimitedGame
	loadVar $bot~bot_turn_limit
	loadVar $bot~user_command_line
	loadVar $bot~parm1
	loadVar $bot~parm2
	loadVar $bot~parm3
	loadVar $bot~parm4
	loadVar $bot~parm5
	loadVar $bot~parm6
	loadVar $bot~parm7
	loadVar $bot~parm8
	loadVar $bot~bot_name
	loadVar $map~stardock
	loadVar $map~rylos
	loadVar $map~alpha_centauri
	loadVar $bot~subspace
	loadVar $bot~safe_ship




	gosub :player~quikstats
	
	setVar $DROPLIMPS (" " & $bot~user_command_line & " ")
	lowercase $DROPLIMPS
	getWordPos $DROPLIMPS $pos " limp "
	if ($pos = 0)
		setVar $DROPLIMPS FALSE
	else
		setVar $DROPLIMPS TRUE
	end

	setVar $DROPARMIDS (" " & $bot~user_command_line & " ")
	lowercase $DROPARMIDS
	getWordPos $DROPARMIDS $pos " armid "
	if ($pos = 0)
		setVar $DROPARMIDS FALSE
	else
		setVar $DROPARMIDS TRUE
	end

	setVar $x100 (" " & $bot~user_command_line & " ")
	lowercase $x100
	getWordPos $x100 $pos " x100 "
	if ($pos = 0)
		setVar $x100 FALSE
	else
		setVar $x100 TRUE
	end

	setVar $x1000 (" " & $bot~user_command_line & " ")
	lowercase $x1000
	getWordPos $x1000 $pos " x1000 "
	if ($pos = 0)
		setVar $x1000 FALSE
	else
		setVar $x1000 TRUE
		setvar $x100 FALSE
	end


	setVar $startingLocation $player~current_prompt

	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
		setvar $switchboard~message "World SST must be run from command or citadel prompt*"
		gosub :switchboard~switchboard
		halt
	end
	gosub :ship~getshipstats


	setVar $CASH_TO_HOLD_ONTO (10000+($GAME~GENESIS_COST*$ship~SHIP_GENESIS_MAX)+$game~holo_cost)

	getWordPos " "&$bot~user_command_line&" " $pos " f "
	if ($pos > 0)
		setVar $refurbFighters TRUE
	else
		setVar $refurbFighters FALSE
	end

	getWordPos " "&$bot~user_command_line&" " $pos " s "
	if ($pos > 0)
		setVar $refurbShields TRUE
	else
		setVar $refurbShields FALSE
	end
	setVar $safeFighterLevel 5000
	getWordPos " "&$bot~user_command_line&" " $pos " safe "
	if ($pos > 0)
		setVar $ultrasafe TRUE
		setVar $safeFighterLevel 100
	else
		setVar $ultrasafe FALSE
	end

	getWordPos " "&$bot~user_command_line&" " $pos " passive "
	if ($pos > 0)
		setVar $passive TRUE
		setVar $safeFighterLevel 0
	else
		setVar $passive FALSE
	end

	getWordPos " "&$bot~user_command_line&" " $pos " nomoo "
	if ($pos > 0)
		setVar $nomoo TRUE
	else
		setVar $nomoo FALSE
	end

	setVar $FURBING $map~stardock

	setVar $Temp ("  " & $bot~user_command_line & "  ")
	getwordpos $Temp $pos " alpha "
	if (($pos <> 0) AND ($map~alpha_centauri <> 0))
		setVar $FURBING $map~alpha_centauri
	end
	getWordpos $Temp $pos " rylos "
	if (($pos <> 0) AND ($map~rylos <> 0))
		setVar $FURBING $map~rylos
	end
	getWordPos $Temp $pos " dock "
	if (($pos <> 0) AND ($map~stardock <> 0))
		setVar $FURBING $map~stardock
	end

	getWordPos $Temp $pos " terra "
	if (($pos <> 0) AND ($map~stardock <> 0))
		setVar $FURBING 1
	end

	setVar $portaverage 1
	setVar $cashDeposited 0
	goSub :player~quikstats
	setvar $startcash $player~credits
	setArray $usedPorts SECTORS
	setArray $equipAtPort SECTORS
	setArray $orgAtPort SECTORS
	setArray $fuelAtPort SECTORS
	setVar $psst_Ship1 $player~ship_number
	setVar $startingLocation $player~current_prompt
	if ($startingLocation = "Citadel")
	        send "q"
                gosub :planet~getplanetinfo
                send "q* "
		setVar $cashDropPlanet $planet~planet
                setVar $cashDropSector $player~current_sector
 	else
		setVar $cashDropPlanet 0
		setVar $cashDropSector 0
	end
	if ($dropCashLimit <= 10000000)
		setVar $dropCashLimit 10000000
	end
	if (($cashDropSector = 0) OR ($cashDropPlanet = 0))
		setVar $dropCashAtBase FALSE
	else
		setVar $dropCashAtBase TRUE
	end

	setVar $alarm_check (" " & $bot~user_command_line & " ")
	lowercase $alarm_check
	getWordPos $alarm_check $pos " alarm "
	if ($pos = 0)
		setVar $alarm_active FALSE
	else
		setVar $alarm_active TRUE
		if ($bot~safe_ship <= 0)
			send "'You can't run alarm without safe ship variable set.*"
			halt
		end
		if (($bot~safe_ship = $psst_ship1) OR ($bot~safe_ship = $psst_ship2))
			send "'You can't run alarm and use your safe ship to WSST.*"
			halt
		end
	end

	setVar $startingSector $player~current_sector

	setvar $switchboard~message "World PPT Powering Up!*"
	gosub :switchboard~switchboard
goto :GoGo



:createAndSell
	goSub :createPlanetsSub

	if ($inMakePlanet = 1)
		return
	end
	:portStartTrade
	
	setVar $tradePlanet $shipBlastPlanet
	setVar $tradeOre 0
	setVar $tradeOrg 0
	setVar $tradeEquip 0
	gosub :planetTrade

	if ($inMakePlanet = 12)
		goto :endMakingPlanets
	end 
	 :sellDonePort
	send "cr*q"
	waitfor "<Computer deactivated>"
return

:createPlanetsSub

	
		
		## Planet Creation
		:startPlanetCreation
		
		setVar $planet~planetToBang 0
		setVar $planet~planetsInSector 0
		setVar $planet~planets 0
		setVar $planet~planeti 1

		setVar $planet~planetsCreated 0
		send "lq*"
		setVar $startLogging 0

		:checkPlanetsInSector
			setTextLineTrigger checkPlanetsInSectorNoPlanet :checkPlanetsInSectorNoPlanet "There isn't a planet in this sector."
			setTextLineTrigger checkPlanetsInSectorStart :checkPlanetsInSectorStart "-----------------------------------------------"
			setTextLineTrigger checkPlanetsInSectorPlanet :checkPlanetsInSectorPlanet "<"
			setTextTrigger checkPlanetsInSectorFinish :checkPlanetsInSectorFinish "Land on which planet"
			
			settextlinetrigger noplanetscanner :checkPlanetsInSectorPlanetnoscanner "Planet #"
			setTextTrigger checkPlanetsInSectorFinishnoscanner :checkPlanetsInSectorFinish "Blasting off from "

			pause
			:checkPlanetsInSectorStart
				killAllTriggers
	
				setVar $startLogging 1
				goto :checkPlanetsInSector
			:checkPlanetsInSectorNoPlanet
				killAllTriggers
				goto :checkPlaneysFinishWait
			:checkPlanetsInSectorPlanetnoscanner
				getWord CURRENTLINE $cPlanetNum 2
				stripText $cPlanetNum "#"

			:checkPlanetsInSectorPlanet
				killAllTriggers 
		
				if ($startLogging = 1)
			
			
					getWord CURRENTLINE $cPlanetNum 1

					if ($cPlanetNum = "Land")
						goto :checkPlanetsInSectorFinish
					elseif ($cPlanetNum = "<")
						getWord CURRENTLINE $cPlanetNum 2
						stripText $cPlanetNum ">"
					else
						stripText $cPlanetNum ">"
						stripText $cPlanetNum "<"
					end
					add $planet~planetsInSector 1
	
					setVar $planet~planets[$planet~planeti] $cPlanetNum
					add $planet~planeti 1
				end
				
				goto :checkPlanetsInSector

			:checkPlanetsInSectorFinish
				killAllTriggers
				

		:checkPlaneysFinishWait
		waitfor "Command ["

		setVar $inMakePlanet 0
		setVar $go 1
		#while ($planet~planetsInSector < $planet~planetsInSectorReq)
		while ($go = 1)
			:startMakingPlanets
			
			if ($planet~planetsInSector > 0)
				setVar $planet~planets 0
				setVar $planet~planeti 1

				#Update Planet Numbers
				send "lq*"
				setVar $startLogging 0
				:updatePlanetsInSector
				setTextLineTrigger updatePlanetsInSectorNoPlanet :updatePlanetsInSectorNoPlanet "There isn't a planet in this sector."
				setTextLineTrigger updatePlanetsInSectorStart :updatePlanetsInSectorStart "-----------------------------------------------"
				setTextLineTrigger updatePlanetsInSectorPlanet :updatePlanetsInSectorPlanet "<"
				setTextTrigger updatePlanetsInSectorFinish :updatePlanetsInSectorFinish "Land on which planet"
				setTextTrigger updatePlanetsInSectorFinish2 :updatePlanetsInSectorFinish "Blasting off from "

				settextlinetrigger updatePlanetsInSectorPlanetnoscanner :updatePlanetsInSectorPlanetnoscanner "Planet #"
				pause
				:updatePlanetsInSectorStart
					killAllTriggers
					setVar $startLogging 1
					goto :updatePlanetsInSector
				:updatePlanetsInSectorNoPlanet
					killAllTriggers
					goto :updatePlanetsFinishWait
				:updatePlanetsInSectorPlanetnoscanner
					getWord CURRENTLINE $cPlanetNum 2
					stripText $cPlanetNum "#"
				:updatePlanetsInSectorPlanet
					killAllTriggers 
					
					if ($startLogging = 1)
			
						getWord CURRENTLINE $cPlanetNum 1
						if ($cPlanetNum = "Land")
							goto :updatePlanetsInSectorFinish
						elseif ($cPlanetNum = "<")
							getWord CURRENTLINE $cPlanetNum 2
							stripText $cPlanetNum ">"
						else
							stripText $cPlanetNum ">"
							stripText $cPlanetNum "<"
						end
						#add $planet~planetsInSector 1
						setVar $planet~planets[$planet~planeti] $cPlanetNum
						add $planet~planeti 1
					end
					goto :updatePlanetsInSector

				:updatePlanetsInSectorFinish
					killAllTriggers
			end
			
			
			:updatePlanetsFinishWait
			setVar $goodPlanet 0
			send "uyn.*p"
			:buildPlanet
			setTextLineTrigger buildPlanet1 :buildPlanet1 "You don't have any Genesis Torpedoes to launch!"
			setTextLineTrigger buildPlanet2 :buildPlanet2 "For building this planet you receive"
			
			pause

			:buildPlanet1
				killAllTriggers
				send "*"
				gosub :player~quikstats
				setvar $startsector $player~current_sector
				if (($player~genesis <= 0) and ($player~credits > $CASH_TO_HOLD_ONTO))
					gosub :refurb
					if ($twarp_refurb_success <> true)
						setvar $mowIntoSector $startsector
						gosub :mowIntoSector
					end
				else
					return
				end		
				goto :updatePlanetsFinishWait
				
			:buildPlanet2
				killAllTriggers
				add $stat_torps 1

			:makePlanet
						
			setTextLineTrigger makePlanet1 :makePlanet1 $setVarPlanetType1
			setTextLineTrigger makePlanet2 :makePlanet2 $setVarPlanetType2
			setTextLineTrigger makePlanet3 :makePlanet3 $setVarPlanetType3
			setTextLineTrigger makePlanet4 :makePlanet4 $setVarPlanetType4
			setTextLineTrigger makePlanet5 :makePlanet5 $setVarPlanetType5
			#setTextLineTrigger markGoodPlanet :markGoodPlanet "hat do you want to name this planet?"
			setTextLineTrigger makePlanetDone :makePlanetDone "Should this be a (C)orporate planet or (P)ersonal planet?"
			pause
			
			:makePlanet1
			:makePlanet2
			:makePlanet3
			:makePlanet4
			:makePlanet5
			#:markGoodPlanet
		
				killAllTriggers
				setVar $goodPlanet 1
				goto :makePlanetDone
			:makePlanetDone 
				killAllTriggers
			add $planet~planetsInSector 1
		
			if ($goodPlanet = 1)
				setVar $inMakePlanet 1
				send "lq*"
				setVar $planet~planetCheck 0
				setVar $planet~planetChecki 1
				setVar $newPlanet 0
				setVar $startLogging 0

			
				:goodPlanetCheck
				setTextLineTrigger goodPlanetCheckPlanet :goodPlanetCheckPlanet "<"
				setTextTrigger goodPlanetCheckFinish :goodPlanetCheckFinish "Land on which planet"
				setTextLineTrigger goodPlanetCheckstart :goodPlanetCheckstart "-----------------------------------------------"
				setTextTrigger goodPlanetCheckFinish2 :goodPlanetCheckFinish "Blasting off from "

				settextlinetrigger goodPlanetCheckstartnoscanner :goodPlanetCheckPlanetnoscanner "Planet #"
				pause
				:goodPlanetCheckstart
					killAllTriggers
					setVar $startLogging 1
					goto :goodPlanetCheck
				:goodPlanetCheckPlanetnoscanner
					getWord CURRENTLINE $cPlanetNum 2
					stripText $cPlanetNum "#"
				:goodPlanetCheckPlanet
					killAllTriggers 
					if ($startLogging = 1)

			
						getWord CURRENTLINE $cPlanetNum 1
						if ($cPlanetNum = "Land")
							goto :goodPlanetCheckFinish
						elseif ($cPlanetNum = "<")
							getWord CURRENTLINE $cPlanetNum 2
							stripText $cPlanetNum ">"
						else
							stripText $cPlanetNum ">"
							stripText $cPlanetNum "<"
						end
						
						setVar $planet~planetCheck[$planet~planetChecki] $cPlanetNum
						add $planet~planetChecki 1
		
					end
					
					goto :goodPlanetCheck
				:goodPlanetCheckFinish
					killAllTriggers
			#loop through and see which planet isn't in the existing list

				setVar $i 1
				while ($i < $planet~planetChecki)
					setVar $y 1
					setVar $found 0
					
					while ($y < $planet~planetsInSector)
						
						if ($planet~planetCheck[$i] = $planet~planets[$y])
							setVar $found 1
						end 
						add $y 1
					end
					if ($found = 0)
						setVar $newPlanet $planet~planetCheck[$i]
					end 
					add $i 1
				end
				
				if ($newPlanet > 0)
					setVar $shipBlastPlanet $newPlanet
				else
					setVar $newPlanet $shipBlastPlanet
				end
				
		
			
				gosub :portStartTrade
				setVar $fuelPerc PORT.PERCENTFUEL[$player~current_sector]
	
				if ($fuelPerc < $tradingMinFuel)

					return
				end

			end
			:endMakingPlanets
			

			setVar $planet~planetsCreated 1
		end

		
return

:planetTrade
	
	if ($useEp = TRUE)
		goSub :planetTrade_ep
	else
		goSub :planetTrade_ck
	end

return

:planetTrade_ck
###
# requires: tradePlanet
# requires: amount? or 0 for all
	gosub :player~quikstats
	
	
	setvar $_ck_pnego_current_sector $player~CURRENT_SECTOR
	saveVar $_ck_pnego_current_sector 

if ($unlimited = 1)
	setVar $PLAYER~TURNS 999
end
	setvar $_ck_pnego_turns $player~TURNS
	saveVar $_ck_pnego_turns 

	stripText $player~credits ","
	setvar $_ck_pnego_credits $player~credits
	saveVar $_ck_pnego_credits 
	
	stripText $player~EXPERIENCE ","
	setvar $_ck_pnego_exp $player~EXPERIENCE
	saveVar $_ck_pnego_exp 

	:tradePlanetLandAgain

	send "l" $tradePlanet "*"
	
	setvar $_ck_pnego_planet $tradePlanet
	saveVar $_ck_pnego_planet 

	setTextLineTrigger tradePlanetLand1 :tradePlanetLand1 "That planet is not in this sector."
	setTextLineTrigger tradePlanetLand2 :tradePlanetLand2 "ding sequence engaged"
	pause
	:tradePlanetLand1
		killAllTriggers
		send "q*"
		waitfor "Command ["
		setVar $newPlanetMade 0
		goSub :reCheckPlanets
		if ($newPlanetMade = 0)
			setVar $tradePlanet $planet~planets[$planet~planetsInSectorReq]
		else
			setVar $tradePlanet $newPlanetMade
		end
		goto :tradePlanetLandAgain
	:tradePlanetLand2
		killAllTriggers
	Waitfor "-------  ---------  ---------  ---------  ---------  ---------  ---------"
	if ($player~ore_holds < $minOre)
		send "tnt1*"
		waitfor "free cargo holds."
		send "d"
		Waitfor "-------  ---------  ---------  ---------  ---------  ---------  ---------"
	end


	setTextLineTrigger tradePlanetLand3 :tradePlanetLand3 "Fuel Ore"
	setTextLineTrigger tradePlanetLand4 :tradePlanetLand4 "Organics"
	setTextLineTrigger tradePlanetLand5 :tradePlanetLand5 "Equipment"
	setTextTrigger tradePlanetLand6 :tradePlanetLand6 "Planet command ("
	pause
		:tradePlanetLand3
			killTrigger :tradePlanetLand3
			getWord CURRENTLINE $availOre 6
			striptext $availOre ","
			setvar $_ck_pnego_planetfuel $availOre
			saveVar $_ck_pnego_planetfuel 
			if ($availOre = 0)
				setVar $tradeOre "-1"
			end
		
			pause
		:tradePlanetLand4
			killTrigger :tradePlanetLand4
			getWord CURRENTLINE $availOrg 5
			striptext $availOrg ","
			setvar $_ck_pnego_planetorg $availOrg
			saveVar $_ck_pnego_planetorg 
			if ($availOrg = 0)
				setVar $tradeOrg "-1"
			end
			pause
		:tradePlanetLand5
			killTrigger :tradePlanetLand5
			getWord CURRENTLINE $availEquip 5
			striptext $availEquip ","
			setvar $_ck_pnego_planetequip $availEquip
			saveVar $_ck_pnego_planetequip 
			if ($availEquip = 0)
				setVar $tradeEquip "-1"
			end
			pause
		:tradePlanetLand6
			killAllTriggers
			if ($tradeOre = 0)
				setVar $tradeOre $availOre
			end
			if ($tradeOrg = 0)
				setVar $tradeOrg $availOrg
			end
			if ($tradeEquip = 0)
				setVar $tradeEquip $availEquip
			end
			
			setVar $planet~_ck_pnego_fueltosell $tradeOre
			setVar $planet~_ck_pnego_orgtosell $tradeOrg
			setVar $planet~_ck_pnego_equiptosell $tradeEquip
			
			
		

		
		gosub :player~quikstats
		setVar $precredits $player~credits
		stripText $precredits ","


		gosub :planet~planetNeg
		#setvar $switchboard~message $planet~exit_message&"*"
		#gosub :switchboard~switchboard
			
			
		gosub :player~quikstats
		stripText $player~credits ","
		setVar $player~creditsNow $player~credits
		if ($player~creditsNow = $precredits)
			echo "*################*##############"
			echo "*#### NEG FAILED, SELLING AT COST!"
			echo "*###############################"

	
	
			send "q p n" $tradePlanet "* * * l" $tradePlanet "* "
			gosub :player~quikstats
			stripText $player~credits ","
			setVar $player~creditsNow $player~credits
		end
		subtract $player~creditsNow $_ck_pnego_credits
		add $stat_dollarsgross $player~creditsNow
		
		send "q"

return


:twarprefurb

	# check adj's for Dock.. if present, then we don't need a jump sector.
	setVar $i 1
	setVar $START_SECTOR $player~current_sector
	setVar $WeAreAdjDock FALSE
	while ($i <= SECTOR.WARPCOUNT[$START_SECTOR])
		setVar $adj_start SECTOR.WARPS[$START_SECTOR][$i]
		if ($adj_start = $MAP~stardock)
			setVar $WeAreAdjDock TRUE
		end
		add $i 1
	end

	if ((currentalignment < 1000) AND ($WeAreAdjDock = FALSE))
		setVar $RED_adj 0
		gosub :FindJumpSector
		if ($RED_adj = 0)
			waitfor "Command [TL="
			setvar $switchboard~message "Cannot Find Jump Sector Adjacent Dock*"
			gosub :switchboard~switchboard
			send "*"
			halt
		end
	end

	if (currentalignment >= 1000)
		if ($WeAreAdjDock)
			send "^F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
		else
			send "^F" & $START_SECTOR & "*" & $MAP~stardock & "*F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
		end
	else
		if ($WeAreAdjDock)
			send "^F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
		else
			send "^F" & $START_SECTOR & "*" & $RED_adj & "*F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
		end
	end
	setTextLineTrigger noJoy :noJoy "*** Error - No route within"
	setTextTrigger cont :cont "(?="
	pause

	:noJoy
		killAllTriggers
		setvar $switchboard~message "Cannot Find Path to StarDock!*"
		gosub :switchboard~switchboard
		send "*"
		halt
	:cont
		killAllTriggers
		setDelayTrigger Latency_Delay		:Latency_Delay 500
		pause

		:Latency_Delay

		Echo "**" & ANSI_14 & "Please Stand By" & ANSI_15 & " - Calculating Distances...**"
		if ((currentalignment >= 1000) OR ($WeAreAdjDock))
			getdistance $dist1 $START_SECTOR $MAP~stardock
		else
			getdistance $dist1 $START_SECTOR $RED_adj
		end

		if ($dist1 <= 0)
			setvar $switchboard~message "Insufficient Warp Data Plotting Course to Dock*"
			gosub :switchboard~switchboard
			send "*"
			halt
		end

		getdistance $dist2 $MAP~stardock $START_SECTOR
		if ($dist2 <= 0)
			setvar $switchboard~message "Insufficient Warp Data Plotting Return Course From Dock*"
			gosub :switchboard~switchboard
			send "*"
			halt
		end

		setVar $ore_req (($dist1 + $dist2) * 3)

		if ($PLAYER~ORE_HOLDS < $ore_req)
			setvar $switchboard~message "Not Enough ORE In Holds To Make Round Trip.  Needs "&$ore_req&".*"
			gosub :switchboard~switchboard
			send "*"
			gosub :getsomefuel
		end

		if ($PLAYER~TWARP_TYPE = "No")
			setvar $switchboard~message "Must Have Twarp 1 or 2*"
			gosub :switchboard~switchboard
			send "*"
			halt
		end

		if ($PLAYER~unlimitedGame = 0)
			gosub :TurnsRequired
			if ($turnsRequired > currentturns)
				setvar $switchboard~message "Not Enough Turns. "&$turnsRequired&", Required*"
				gosub :switchboard~switchboard
				send "*"
				halt
			elseif ($turnsRequired <= currentturns)
				setVar $tmp (currentturns - $turnsRequired)
				if ($tmp <= $bot~bot_turn_limit)
					setvar $switchboard~message "Proceeding Will Leave Fewer Than " & $bot~bot_turn_limit & " Turns!*"
					gosub :switchboard~switchboard
					send "*"
					halt
				end
			end
		end

	send " C R " & $MAP~stardock & "*Q "
	setTextLineTrigger itsalive :itsalive "Items     Status  Trading % of max OnBoard"
	setTextLineTrigger nosoupforme :nosoupforme "I have no information about a port in that sector"
	pause
	:nosoupforme
		killAllTriggers
		setvar $switchboard~message "StarDock appears to have been Blown Up!*"
		gosub :switchboard~switchboard
		send "*"
		halt
	:itsalive
		killAllTriggers
		waitfor "(?="
		setVar $msg ""
		if ((currentalignment >= 1000) AND ($WeAreAdjDock = FALSE))
			setVar $warpto $MAP~stardock
			gosub :DoTwarp
		elseif (($WeAreAdjDock = FALSE) AND ($RED_adj <> 0))
			setVar $warpto $RED_adj
			gosub :DoTwarp
		else
			send "q q *  m " & $MAP~stardock & "*  *  P  S G Y G Q "
		end
		if ($msg = "")
			waitfor "You leave the Galactic Bank."
		else
			setvar $switchboard~message "Unknown Problem Detected. Check TA!*"
			gosub :switchboard~switchboard
			send "*"
			halt
		end
		gosub :PLAYER~quikstats


return


:getsomefuel
	gosub :player~quikstats
	setVar $bottom 1
	setVar $top 1
	setArray $checked SECTORS
	setVar $que[1] $player~current_sector
	setVar $checked[$player~current_sector] 1
	setvar $a 1
	:try_again
	while ($bottom <= $top)
		# Now, pull out the next sector in the queue, and make it our focus
		setVar $focus $que[$bottom]
		getsectorparameter $focus "FIGSEC" $isFigged

		if ((PORT.BUYFUEL[$focus] <> true) and (PORT.FUEL[$focus] > $player~total_holds))
			setVar $mowintosector $focus
			gosub :mowIntoSector
			if (((PORT.BUYORG[$focus]) and ($player~organic_holds > 0)) OR ((PORT.BUYEQUIP[$focus]) and ($player~equipment_holds > 0)))
				send "p t * * * * * * "
			else
				send "j y p t * * 0 * 0 * "
			end
			return
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
	setVar $SWITCHBOARD~message "Can't find a route to fuel.  Halting*"
	gosub :SWITCHBOARD~switchboard
	halt

return



:DoTwarp
	setVar $msg ""
	if ($warpto > 0)
		send "q q * * mz" & $warpto "*"
		setTextTrigger there        :adj_warp "You are already in that sector!"
		setTextLineTrigger adj_warp :adj_warp "Sector  : " & $warpto & " "
		setTextTrigger locking      :locking "Do you want to engage the TransWarp drive?"
		setTextTrigger igd          :twarpIgd "An Interdictor Generator in this sector holds you fast!"
		setTextTrigger noturns      :twarpPhotoned "Your ship was hit by a Photon and has been disabled"
		setTextTrigger noroute      :twarpNoRoute "Do you really want to warp there? (Y/N)"
		pause
		:adj_warp
			killAllTriggers
			send "z*"
			goto :twarp_adj
		:locking
			killAllTriggers
			send "y"
			setTextLineTrigger twarp_lock 		:twarp_lock "TransWarp Locked"
			setTextLineTrigger no_twrp_lock 	:no_twarp_lock "No locating beam found"
			setTextLineTrigger twarp_adj 		:twarp_adj "<Set NavPoint>"
			setTextLineTrigger no_fuel 		:itwarpNoFuel "You do not have enough Fuel Ore"
			pause
		:twarpNoFuel
			killAllTriggers
			setVar $msg "Not enough fuel for T-warp."
			goto :twarpDone

		:twarp_adj
			killAllTriggers
			send " * p s"
			goto :twarpDone

		:twarpNoRoute
			killAllTriggers
			send "n* z* "
			setVar $msg "No route available!"
			goto :twarpDone

		:no_twarp_lock
			killAllTriggers
			send "n*zn"
			send "l " & #8 & $PLANET~PLANET "*c"
			setSectorParameter $warpto "FIGSEC" FALSE
			setvar $msg "no twarp lock"
			return

		:twarpIgd
			killAllTriggers
			setVar $msg "My ship is being held by Interdictor!"
			goto :twarpDone

		:twarpPhotoned
			killAllTriggers
			setVar $msg "I have been photoned and can not T-warp!"
			goto :twarpDone

		:twarp_lock
			KillAlltriggers
			if (currentalignment >= 1000)
				setVar $str "y * * p s g y g q " 
				send $str
			else
				setVar $str "y  *  *  m " & $MAP~stardock & " *  *  p s g y g q "
				send $str
			end
			setvar $twarp_refurb_success true
		:twarpDone
			if ($msg <> "")
				setvar $switchboard~message "Twarp Error - " & $msg & "*"
				gosub :switchboard~switchboard
				send "*"
			end
	end
	return

:bwarp

	killAllTriggers
	send "b" $warpto "*"
	setTextTrigger go :go5 "TransWarp Locked"
	setTextTrigger no :no5 "No locating beam found"
	goSub :delayTrigger
	pause

:no5
	killAllTriggers
	send "n "
	waitfor "Transporter shutting down."
	return

:go5
	killAllTriggers
	send "y z * "
	return

:FindJumpSector
	setVar $i 1
	setVar $RED_adj 0
	send "qq*"
	while (SECTOR.WARPSIN[$MAP~stardock][$i] > 0)
		setVar $RED_adj SECTOR.WARPSIN[$MAP~stardock][$i]
		send "m " & $RED_adj & "* y"
		setTextTrigger TwarpBlind 			:TwarpBlind "Do you want to make this jump blind? "
		setTextTrigger TwarpLocked			:TwarpLocked "All Systems Ready, shall we engage? "
		setTextLineTrigger TwarpVoided			:TwarpVoided "Danger Warning Overridden"
		setTextLineTrigger TwarpAdj			:TwarpAdj "<Set NavPoint>"
		pause
		:TwarpAdj
		killAllTriggers
		send " * "
		return

		:TwarpVoided
		killAllTriggers
		send " N N "
		goto :TryingNextAdj

		:TwarpLocked
		killAllTriggers
		send " N "

		goto :SectorLocked

		:TwarpBlind
		killAllTriggers
		send " N "

		:TryingNextAdj
    	add $i 1
	end

	:NoAdjsFound
		setVar $RED_adj 0
		return

	:SectorLocked
		return


:TurnsRequired
	send "i"
	setTextLineTrigger TurnsRequired_TPW	:TurnsRequired_TPW "Turns to Warp  : "
	pause

	:TurnsRequired_TPW
	killAllTriggers
	getWord CURRENTLINE $turnsRequired_TPW 5

	if ($RED_adj > 0)
		# twarp to jmp sector, then into SD sect, then twarp home
		setVar $turnsRequired_temp ($turnsRequired_TPW * 3)
		if ($_Tow > 0)
			# 2 Turns for exporting into other ship and back again
			add $turnsRequired_temp_temp 2
			# 3 Turns for initial Port then x into other ship, port & shop, then x and report
			#   b4 heading home
			add $turnsRequired_temp 3
		else
			add $turnsRequired_temp 1
		end
	else
		setVar $turnsRequired_temp ($turnsRequired_TPW * 2)
		# 1 Turn to port at dock
		add $turnsRequired_temp 1
	end

	setVar $turnsRequired $turnsRequired_temp
	return


:callSaveMe
	send "q q q q * '"&$SWITCHBOARD~bot_name&" call*"
	halt

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\sector\getautosectordata\sector"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastcitadelattack\combat"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\combat\passiveHolokill\combat"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\planet\planetneg\planet"

