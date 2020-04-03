	reqrecording

	gosub :BOT~loadVars

	loadVar $GAME~GENESIS_COST
	loadVar $GAME~ATOMIC_COST
	loadVar $MAP~STARDOCK 
	loadvar $bot~folder
	loadvar $game~MAX_PLANETS_PER_SECTOR
	loadvar $planet~planet_file
	loadVar $BOT~botIsDeaf
	loadVar $BOT~silent_running
	loadvar $game~steal_factor

	setVar $BOT~command "wppt2"

	setVar $BOT~help[1]   $BOT~tab&"World Port-Pair-Trade "
	setVar $BOT~help[2]   $BOT~tab&" - wppt2  "
	gosub :bot~helpfile

	setvar $player~save true

	goto :Starting
	

:GoGo
	window cash 300 170 ("World PPT - " & GAMENAME) ONTOP
	gosub :displayCredits
	while (TRUE)
		if (($player~unlimitedGame = FALSE) AND ($player~turns <= $bot~bot_turn_limit))
			goto :endSST
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
		setVar $result $result&"f  z  "&$FIG_DROP&"* z  c  d  *  "
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
	waiton "Warps to Sector(s) :"
	return

:findPPTPorts

	while ($needNewPortPair = TRUE)
		:tryNewRouteShip1
		setVar $destination 0
		while ($destination = 0)
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
			setvar $isUsedUp $usedPorts[$COURSE[$j]] 

			if (($current_port_class > 0) and ($current_port_class < 7) and ($isUsedUp <> true))
				send "* cr*q"
				waitOn "What sector is the port in? ["

				setVar $k 1
				setVar $isFound FALSE
				while ((SECTOR.WARPS[$COURSE[$j]][$k] > 0) AND ($isFound = FALSE))
					setVar $checkingNeighbor SECTOR.WARPS[$COURSE[$j]][$k]
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
					if ($dist1 = "-1")
						send "cf" & $checkingNeighbor & "*" & $port1 & "*q"
						waitOn "What is the starting sector"
						waitOn "Command [TL="
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
		killAllTriggers
		if ($FURBING <> $map~stardock)
			send "p ty"
		else
			send "p s g y g q s p"
		end
		waitOn "A  Cargo holds     :"
		getWord CURRENTLINE $holdsprice 5
		getWord CURRENTLINE $holdsToBuy 10
		setVar $beforeFurbCredits $player~credits
		setVar $player~credits ($player~credits-($holdsprice * $holdsToBuy))
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
		end
		if ($FURBING <> $map~stardock)
			send "a "&$holdsToBuy&"* y b "&$figsToBuy&"* c "&$player~shieldsToBuy&"* q q q z n * "
		elseif (($FURBING = $map~stardock) AND (($DROPLIMPS) OR ($DROPARMIDS)) AND ($player~credits > ($CASH_TO_HOLD_ONTO + 2000000)))
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
			send "/"
			waitfor #179 & "Figs"
			getText CURRENTLINE $player~credits (#179 & "Creds") (#179 & "Figs")
			striptext $player~credits " "
			stripText $player~credits ","
			send " Q Q "
		else
			send "a "&$holdsToBuy&"* y b "&$figsToBuy&"* c "&$player~shieldsToBuy&"* q q q z n * "
		end

		setVar $spentCredits ($spentCredits+($beforeFurbCredits-$player~credits))
		setVar $player~fightersPurchased ($player~fightersPurchased+$figsToBuy)
		setVar $player~shieldsPurchased ($player~shieldsPurchased+$player~shieldsToBuy)
	else
		send "'Something bad happened on mow, I am probably in big trouble. [Temp error message until saveme implemented]*"
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
			gosub :displayCredits
		else
			send "'Something bad happened on mow, I am probably in big trouble. [Temp error message until saveme implemented]*"
		end
	end
return
:displayCredits
	
	setVar $formattedDepositedCredits ""
	setVar $spentCredits2 $cashDeposited
	getLength $spentCredits2 $length
	while ($length > 3)
		cutText $spentCredits2 $snippet $length-2 9999
		cutText $spentCredits2 $spentCredits2 1 $length-3
		getLength $spentCredits2 $length
		setVar $formattedDepositedCredits ","&$snippet&$formattedDepositedCredits
	end
	setVar $formattedDepositedCredits $spentCredits2&$formattedDepositedCredits

	setVar $formattedOnHandCredits ""
	setVar $spentCredits2 $player~credits
	getLength $spentCredits2 $length
	while ($length > 3)
		cutText $spentCredits2 $snippet $length-2 9999
		cutText $spentCredits2 $spentCredits2 1 $length-3
		getLength $spentCredits2 $length
		setVar $formattedOnHandCredits ","&$snippet&$formattedOnHandCredits
	end
	setVar $formattedOnHandCredits $spentCredits2&$formattedOnHandCredits

	setVar $formattedSpentCredits ""
	setVar $spentCredits2 $spentCredits
	getLength $spentCredits2 $length
	while ($length > 3)
		cutText $spentCredits2 $snippet $length-2 9999
		cutText $spentCredits2 $spentCredits2 1 $length-3
		getLength $spentCredits2 $length
		setVar $formattedSpentCredits ","&$snippet&$formattedSpentCredits
	end
	setVar $formattedSpentCredits $spentCredits2&$formattedSpentCredits

	setVar $formattedFighters ""
	setVar $spentCredits2 $player~fightersPurchased
	getLength $spentCredits2 $length
	while ($length > 3)
		cutText $spentCredits2 $snippet $length-2 9999
		cutText $spentCredits2 $spentCredits2 1 $length-3
		getLength $spentCredits2 $length
		setVar $formattedFighters ","&$snippet&$formattedFighters
	end
	setVar $formattedFighters $spentCredits2&$formattedFighters

	setVar $formattedShields ""
	setVar $spentCredits2 $player~shieldsPurchased
	getLength $spentCredits2 $length
	while ($length > 3)
		cutText $spentCredits2 $snippet $length-2 9999
		cutText $spentCredits2 $spentCredits2 1 $length-3
		getLength $spentCredits2 $length
		setVar $formattedShields ","&$snippet&$formattedShields
	end
	setVar $formattedShields $spentCredits2&$formattedShields

	add $portaverage $cashDeposited
	add $portaverage $player~credits
	add $portaverage $spentCredits
	subtract $portaverage $startcash
	if ($numberbusted = 0)
		setvar $numberbusted 1
	end
	divide $portaverage $numberbusted

	setVar $formattedPortAverage ""
	setVar $spentCredits2 $portaverage
	getLength $spentCredits2 $length
	while ($length > 3)
		cutText $spentCredits2 $snippet $length-2 9999
		cutText $spentCredits2 $spentCredits2 1 $length-3
		getLength $spentCredits2 $length
		setVar $formattedPortAverage ","&$snippet&$formattedPortAverage
	end
	setVar $formattedPortAverage $spentCredits2&$formattedPortAverage

	setvar $window_content "*    Cash Deposited: "&$formattedDepositedCredits&"*  Busted xxB Ports: "&$numberbusted&"*  Credits per Port: "&$formattedPortAverage&"*   Fighters bought: "&$formattedFighters&"*    Shields bought: "&$formattedShields&"*"

	setWindowContents cash $window_content
	replacetext $window_content "*" "[][]"
	savevar $window_content

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
	setVar $CASH_TO_HOLD_ONTO 1000000




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


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\planet\getplanetinfo\planet"
