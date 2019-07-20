	logging off

	loadVar $steal_factor
	loadVar $unlimitedGame
	loadVar $bot_turn_limit
	loadVar $user_command_line
	loadVar $parm1
	loadVar $parm2
	loadVar $parm3
	loadVar $parm4
	loadVar $parm5
	loadVar $parm6
	loadVar $parm7
	loadVar $parm8
	loadVar $bot_name	
	loadVar $stardock
	loadVar $rylos
	loadVar $alpha_centauri
	setVar $CASH_TO_HOLD_ONTO 1000000

if ($parm1 = "help")
        send "'*{" $bot_name "} - wssm [ship2] {max cash before dropoff} - Planet SSM.*"
        send "  - wssm CLEAR_BUSTS - Clears bot's bust file.*"
        send "  - wssm off - Stops World SSM**"
	halt
end		
	
	setVar $BUST_FILE "MOM_"&GAMENAME&"_Busts.txt"
	setVar $FIG_FILE "MOM_"&GAMENAME&"_Fighter_Grid.txt"
	setVar $FIG_COUNT_FILE "MOM_"&GAMENAME&"_Fighter_Grid_Count.cnt"

	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	isNumber $isParamOneNumber   $parm1
	isNumber $isParamTwoNumber   $parm2
	isNumber $isParamThreeNumber $parm3

	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
		send "'{" $bot_name "} - World SSM must be run from command or citadel prompt*"
		halt
	end
	gosub :getShipStats

	lowerCase $parm1
	if ($parm1 = "clear_busts")
		delete $BUST_FILE
		send "'{" $bot_name "} - Bust file for this bot has been cleared.*"
		halt
	elseif ($isParamOneNumber = TRUE) 
		setVar $psst_Ship2 $parm1
		if ($isParamTwoNumber = TRUE)
			setVar $dropCashLimit $parm2
		end
	else
		send "'{" $bot_name "} - Please use wssm [ship2#] format.*"
		halt
	end
	if ($EXPERIENCE < 500)
		send "'{" $bot_name "} - You do not have enough experience to run WorldSSM.*"
		halt
	end
	if ($CREDITS < 500000)
		send "'{" $bot_name "} - You must have at least 500,000 credits on hand to run WorldSSM.*"
		halt
	end
	cutText $ALIGNMENT $neg_ck 1 1

	stripText $ALIGNMENT "-"
	if ($ALIGNMENT < 100) and ($neg_ck = "-")
		send "'{" $bot_name "} - Need -100 Alignment Minimum to run World SSM.*"
		halt
	elseif ($neg_ck <> "-")
		send "'{" $bot_name "} - Need -100 Alignment Minimum to run World SSM.*"
		halt
	end
	getWordPos " "&$user_command_line&" " $pos " f "
	if ($pos > 0)
		setVar $refurbFighters TRUE
	else
		setVar $refurbFighters FALSE
	end

	getWordPos " "&$user_command_line&" " $pos " s "
	if ($pos > 0)
		setVar $refurbShields TRUE
	else
		setVar $refurbShields FALSE
	end
	
	setVar $portaverage 1
	send "jy*"
	setVar $cashDeposited 0
	goSub :quikstats
	setvar $startcash $CREDITS
	setArray $bustedPorts SECTORS
	setVar $psst_Ship1 $SHIP_NUMBER
	setVar $startingLocation $CURRENT_PROMPT
	if ($startingLocation = "Citadel")
	        send "q"
                gosub :getPlanetInfo
                send "q* "
		setVar $cashDropPlanet $PLANET
                setVar $cashDropSector $CURRENT_SECTOR
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

	if (($psst_Ship2 <= 0) OR ($steal_factor <= 0))
		send "'This module should be run from the MOM Bot.*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	setVar $startingSector $current_Sector
	setVar $inShip1 TRUE
	setvar $p1chk 3
	setvar $p2chk 3
	if ($RYLOS > 10)
		setVar $refurbPort $RYLOS
	elseif ($ALPHA_CENTAURI > 10)
		setVar $refurbPort $ALPHA_CENTAURI
	else
		setVar $refurbPort 1
	end
	
	setArray $bustedPorts SECTORS
	fileExists $exists $BUST_FILE
	if ($exists)
		send "'{" $bot_name "} Reading Busts from file..*"
		gosub :readBustsFromFile
	else
		send "'{" $bot_name "} No bust file, starting clean..*"
	end
	send "'{" $bot_name "} World SSM Powering Up!*"
	send "c;q"
	waitOn "Transport Range:"
	getWord CURRENTLINE $transportRange1 6
	getWord CURRENTLINE $maxHolds1 3
	setVar $minRefurb (($maxHolds1*75)/100)
	
	setVar $ship1Sector $current_Sector
	setVar $ship1NeedsPort TRUE
	setVar $i 1
	setVar $yes TRUE
	setVar $busted FALSE
	setArray $equipAtPort SECTORS
	setArray $fuelAtPort SECTORS
	window cash 300 170 "World SSM" ONTOP
	gosub :displayCredits
	while (TRUE)
		if (($unlimitedGame = FALSE) AND ($TURNS <= $bot_turn_limit))
			goto :endSSM
		end
		gosub :findSSMPorts
		setVar $busted FALSE
		while ($busted = FALSE)
			if (($unlimitedGame = FALSE) AND ($TURNS <= $bot_turn_limit))
				goto :endSSM
			end
			gosub :steal
		end
		if ($ship1TotalHolds < $minRefurb)
			gosub :refurb
		end
		if (($dropCashAtBase = TRUE) AND ($CREDITS > $dropCashLimit))
			gosub :dropCashAtBase
		end
	end
	goto :endSSM


:readBustsFromFile
	setVar $read_count 1
	read $BUST_FILE $temp $read_count
	while ($temp <> "EOF")
		getWord $temp $bustLocation 1
		getWord $temp $bustDate 2
		setVar $bustedPorts[$bustLocation] TRUE
		add $read_count 1
		read $BUST_FILE $temp $read_count
	end
return

:moveIntoSector
	setVar $result ""
	setVar $dropFigs TRUE		
	setVar $result $result&"m "&$moveIntoSector&"*"
	if (($moveIntoSector > 10) AND ($moveIntoSector <> $STARDOCK))
		setVar $result $result&"za"&$SHIP_MAX_ATTACK&"* * "	
	end
	if (($dropFigs = TRUE) AND ($moveIntoSector > 10) AND ($moveIntoSector <> $STARDOCK) AND ($j > 2))
		setVar $result $result&"f 1 * c d "
	end
	send $result
	waitOn "["&$moveIntoSector&"]"
	if (($dropFigs) AND ($moveIntoSector > 10) AND ($moveIntoSector <> $STARDOCK) AND ($j > 2))
		waitOn "<Drop/Take Fighters>"
	end
	send "sh"
	waitOn "Long Range Scan"
	waitOn "["&$moveIntoSector&"]"
			
return

:findSSMPorts
	
	while ($ship1NeedsPort = TRUE)
		if ($inShip1 <> TRUE)
			goSub :transport
		end
		setVar $destination 0
		while ($destination = 0)
			gosub :getRandomCourse
			gosub :quikstats
		end
		setVar $j 3
		while (($j <= $courseLength) AND ($ship1NeedsPort = TRUE))
			setVar $moveIntoSector $COURSE[$j]
			gosub :moveIntoSector
			#setDelayTrigger delay :okkeepgoing 500
			#pause
			#:okkeepgoing
			if ((PORT.BUYEQUIP[$moveIntoSector] = TRUE) AND ($bustedPorts[$moveIntoSector] <> TRUE))
				setVar $k 1
				setVar $isFound FALSE
				while ((SECTOR.WARPS[$COURSE[$j]][$k] > 0) AND ($isFound = FALSE))
					setVar $checkingNeighbor SECTOR.WARPS[$COURSE[$j]][$k]
					getDistance $distance $checkingNeighbor $COURSE[$j]
					if ($distance <= 0)
						send "^f"&$checkingNeighbor&"*"&$COURSE[$j]&"*q"
						waitOn "ENDINTERROG"
						getDistance $distance $checkingNeighbor $COURSE[$j]
					end
					if ((PORT.BUYEQUIP[$checkingNeighbor] = TRUE) AND ($bustedPorts[$checkingNeighbor] <> TRUE) AND ($distance = 1))
						
						setVar $testSector $COURSE[$j]
						gosub :getSSMPortInfo
						setVar $moveIntoSector $checkingNeighbor
						gosub :moveIntoSector
						setVar $ship1NeedsPort FALSE
						setVar $ship1Sector $COURSE[$j]
						setVar $ship2Sector $checkingNeighbor
						gosub :quikstats
						setVar $testSector $checkingNeighbor
						gosub :getSSMPortInfo
						setVar $ship1TotalHolds $TOTAL_HOLDS
						setVar $ship1Equipment $EQUIPMENT_HOLDS
						gosub :displayCredits	
						setVar $isFound TRUE		
					end
					add $k 1
				end		
			end	
			#else
			#	setVar $k 1
			#	setVar $isFound FALSE
			#	while ((SECTOR.WARPS[$COURSE[$j]][$k] > 0) AND ($isFound = FALSE))
			#		setVar $checkingNeighbor SECTOR.WARPS[$COURSE[$j]][$k]
			#		if ((PORT.BUYEQUIP[$checkingNeighbor] = TRUE) AND ($bustedPorts[$checkingNeighbor] <> TRUE) AND ($checkingNeighbor <> $ship2Sector))
			#			setVar $moveIntoSector $checkingNeighbor
			#			gosub :moveIntoSector
			#			setVar $ship1NeedsPort FALSE
			#			setVar $ship1Sector $checkingNeighbor
			#			gosub :quikstats
			#			setVar $testSector $checkingNeighbor
			#			gosub :getSSMPortInfo
			#			setVar $ship1TotalHolds $TOTAL_HOLDS
			#			setVar $ship1Equipment $EQUIPMENT_HOLDS
			#			gosub :displayCredits	
			#			setVar $isFound TRUE		
			#		end
			#		add $k 1
			#	end
			#end 
			add $j 1	
		end
			
	end			
return

:getRandomCourse
#Does Random Course Calculation
	killalltriggers
	setArray $COURSE 80
	setVar $sectors ""
	setTextLineTrigger sectorlinetrig :sectorsline " > "
	getRnd $destination 11 SECTORS
	send "^f*"&$destination&"**q"
	pause

:getCourse
#Does Specific Course Calculation
	killalltriggers
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
	getWordPos $line $pos " "&$destination&" "
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

:steal
	if (($bustedPorts[$ship1Sector] <= 0) AND ($bustedPorts[$ship2Sector] <= 0))
		setVar $maxSteal ($EXPERIENCE / $steal_factor - 1)
		setVar $send ""
				if ($ship1Equipment > 0)
					# sell off existing equipment
					setVar $send $send & "p t * * 0* 0* "
					setVar $ship1Equipment 0
					add $equipAtPort[$ship1Sector] $ship1Equipment
				end
				# steal as much as we are able to on this ship
				if ($ship1TotalHolds < $maxSteal)
					setVar $steal $ship1TotalHolds
				else
					setVar $steal $maxSteal
				end
 	 
				while ($equipAtPort[$ship1Sector] < ($steal + 20))
					setVar $upgrade ($steal - $equipAtPort[$ship1Sector])
					divide $upgrade 10
					add $upgrade 4
					setVar $send $send & "o 3" & $upgrade & "* * "
					add $equipAtPort[$ship1Sector] ($upgrade * 10)
				end
 				setVar $send $send & "p r * s z 3 " & $steal & "* <    "
				setVar $ship1Equipment $steal    
			
			setVar $TURNS ($TURNS-2)
    
    			#if ($inShip1)
			#	setVar $LastSteal $ship1Sector
			#else
			#	setVar $LastSteal $ship2Sector
			#end
			#add $curClock 1
	end
  
			# calculate experience gain or hold loss
			setVar $stake ($steal - 1) / 11      
    
			waitOn "(R)ob this port, (S)teal product"
			setTextLineTrigger success :success "Success!"
			setTextLineTrigger busted :busted "Suddenly you're Busted!"
			setTextLineTrigger portMaxxed :busted "There aren't that many holds of Equipment at this port!"
			setTextLineTrigger fakeBust :busted "Do you want instructions (Y/N) [N]?"
			pause
    
			:success
				add $EXPERIENCE $stake
				if ($inShip1)
					setVar $ship2Equipment 1
				else
					setVar $ship1Equipment 1
				end
				goto :continue
    
			:busted
    				# calculate holds lost and flag this sector as busted
				if ($inShip1)
					subtract $ship2TotalHolds $stake
					setVar $bustedPorts[$ship2Sector] TRUE
					setVar $ship2Equipment 0
    				else
					subtract $ship1TotalHolds $stake
					setVar $bustedPorts[$ship1Sector] TRUE
					setVar $ship1Equipment 0
				end
				add $numberbusted 1
				setVar $busted 1
				gosub :transport
				if ($inShip1)
					setVar $ship1NeedsPort TRUE
				else
					setVar $ship2NeedsPort TRUE
				end
				send "c"
				waitOn "<Computer activated>"
				send "tq"
				setTextLineTrigger AM :getBustStamp " AM "
				setTextLineTrigger PM :getBustStamp " PM "
				pause
    			:getBustStamp
				killtrigger AM
				killtrigger PM
				killalltriggers
				if ($inShip1)
					if ($BUST_FILE <> "") and ($BUST_FILE <> "0")
						write $BUST_FILE $ship1Sector&"  "&CURRENTLINE
					end
    				else
					if ($BUST_FILE <> "") and ($BUST_FILE <> "0")
						write $BUST_FILE $ship2Sector&"  "&CURRENTLINE
					end
				end
				
    				waitOn "<Computer deactivated>"
					
			:continue
				killTrigger success
				killTrigger fakeBust
				killTrigger busted
				killTrigger portMaxxed
				subtract $curClock 1
				add $curResult 1
    
				if ($curResult > 2)
					setVar $curResult 1
				end
return

:getSSMPortInfo
	send "* cr*q"
	waitOn "What sector is the port in? ["
	:portInfo
		setTextLineTrigger getPortEquip :getPortEquip "Equipment  Buying"
		setTextLineTrigger noPortEquip  :noEquipHere "I have no information about a port in that sector."
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
 				setVar $equipAtPort[$TestSector] ($TOTAL_HOLDS + 50)
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
			killAllTriggers			

  return

:refurb
	setVar $mowIntoSector $refurbPort
	gosub :mowIntoSector
	gosub :quikstats
	if ($CURRENT_SECTOR = $refurbPort)
		killAllTriggers
		send "p ty"
		#waitOn "You have "
		#getWord CURRENTLINE $CREDITS 3
		#striptext $CREDITS ","
		waitOn "A  Cargo holds     :"
		getWord CURRENTLINE $holdsprice 5
		getWord CURRENTLINE $holdsToBuy 10
		setVar $beforeFurbCredits $CREDITS
		setVar $CREDITS ($CREDITS-($holdsprice * $holdsToBuy))
		if ($CREDITS > $CASH_TO_HOLD_ONTO)
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
				getWord CURRENTLINE $shieldsToBuy 9
			else
				setVar $shieldsToBuy 0
			end
			if ($figsToBuy > 0)
				if (($figprice * $figsToBuy) > ($CREDITS-$CASH_TO_HOLD_ONTO))
					setVar $figsToBuy (($CREDITS-$CASH_TO_HOLD_ONTO)/$figprice)
				end
				setVar $CREDITS ($CREDITS-($figprice * $figsToBuy))
			end
			if ($shieldsToBuy > 0)
				if (($shieldprice * $shieldsToBuy) > ($CREDITS-$CASH_TO_HOLD_ONTO))
					setVar $shieldsToBuy (($CREDITS-$CASH_TO_HOLD_ONTO)/$shieldprice)
				end
				setVar $CREDITS ($CREDITS-($shieldprice * $shieldsToBuy))
			end
		else
			setVar $figsToBuy 0
			setVar $shieldsToBuy 0
		end
		send "a "&$holdsToBuy&"* y b "&$figsToBuy&"* c "&$shieldsToBuy&"* q q q * "
		setVar $spentCredits ($spentCredits+($beforeFurbCredits-$CREDITS))
		setVar $fightersPurchased ($fightersPurchased+$figsToBuy)
		setVar $shieldsPurchased ($shieldsPurchased+$shieldsToBuy)
	else
		send "'Something bad happened on mow, I am probably in big trouble. [Temp error message until saveme implemented]*"
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
			setVar $result $result&"za"&$SHIP_MAX_ATTACK&"* * "	
		end
		if (($dropFigs = TRUE) AND ($COURSE[$j] > 10) AND ($COURSE[$j] <> STARDOCK) AND ($j > 2))
			setVar $result $result&"f 1 * c t "
		end
		add $j 1	
	end
	send $result
return
:dropCashAtBase
	if ($CREDITS > $dropCashLimit)
		setVar $mowIntoSector $cashDropSector
		gosub :mowIntoSector
		gosub :quikstats
		if ($CURRENT_SECTOR = $cashDropSector)
			send "l "&$cashDropPlanet &"* c t t "&($CREDITS-1000000)&"* qq* "
			add $cashDeposited ($CREDITS-1000000)
			setVar $CREDITS 1000000
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
	setVar $spentCredits2 $CREDITS
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
	setVar $spentCredits2 $fightersPurchased
	getLength $spentCredits2 $length
	while ($length > 3)
		cutText $spentCredits2 $snippet $length-2 9999
		cutText $spentCredits2 $spentCredits2 1 $length-3
		getLength $spentCredits2 $length
		setVar $formattedFighters ","&$snippet&$formattedFighters
	end
	setVar $formattedFighters $spentCredits2&$formattedFighters

	setVar $formattedShields ""
	setVar $spentCredits2 $shieldsPurchased
	getLength $spentCredits2 $length
	while ($length > 3)
		cutText $spentCredits2 $snippet $length-2 9999
		cutText $spentCredits2 $spentCredits2 1 $length-3
		getLength $spentCredits2 $length
		setVar $formattedShields ","&$snippet&$formattedShields
	end
	setVar $formattedShields $spentCredits2&$formattedShields

	add $portaverage $cashDeposited
	add $portaverage $CREDITS
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

	setWindowContents cash "    Cash Deposited: "&$formattedDepositedCredits&"*      Cash On Hand: "&$formattedOnHandCredits&"*  Busted xxB Ports: "&$numberbusted&"*  Credits per Port: "&$formattedPortAverage&"*   Fighters bought: "&$formattedFighters&"*    Shields bought: "&$formattedShields&"*        Experience: "&$EXPERIENCE&"*             Turns: "&$TURNS&"*"


return

:endSSM
	killalltriggers
	send "q q q q  * * * "
	send "'{" $bot_name "} - World SSM has completed, make sure you pick up the bot and its ships.*"
	halt

:quikstats
	setVar $CURRENT_PROMPT 		"Undefined"
	killtrigger noprompt
	killtrigger prompt1
	killtrigger prompt2
	killtrigger prompt3
	killtrigger prompt4
	killtrigger statlinetrig
	killtrigger getLine2
	setTextTrigger 		prompt1 	:allPrompts 		"(?="
	setTextLineTrigger 	prompt2 	:secondaryPrompts 	"(?)"
	setTextLineTrigger 	statlinetrig 	:statStart 		#179
	setTextTrigger		prompt3         :terraPrompts		"Do you wish to (L)eave or (T)ake Colonists?"
	setTextTrigger		prompt4         :terraPrompts		"How many groups of Colonists do you want to take ("
#	setDelayTrigger 	noprompt        :doneQuikstats		 3000
	send "^Q/"
	pause

	:allPrompts
		getWord currentansiline $checkPrompt 1
		getWord currentline $tempPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $CURRENT_PROMPT $tempPrompt
		end
		setTextLineTrigger prompt1 :allPrompts "(?="
		pause
	:secondaryPrompts
		getWord currentansiline $checkPrompt 1
		getWord currentline $tempPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $CURRENT_PROMPT $tempPrompt
		end
		setTextLineTrigger prompt2 :secondaryPrompts "(?)"
		pause
	:terraPrompts
		killtrigger prompt3
		killtrigger prompt4
		getWord currentansiline $checkPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $CURRENT_PROMPT "Terra"
		end
		setTextTrigger		prompt3         :terraPrompts		"Do you wish to (L)eave or (T)ake Colonists?"
		setTextTrigger		prompt4         :terraPrompts		"How many groups of Colonists do you want to take ("
		pause

	:statStart
		killtrigger prompt1
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger noprompt
		setVar $stats ""
		setVar $wordy ""


	:statsline
		killtrigger statlinetrig
		killtrigger getLine2
		setVar $line2 CURRENTLINE
		replacetext $line2 #179 " "
		striptext $line2 ","
		setVar $stats $stats & $line2
		getWordPos $line2 $pos "Ship"
		if ($pos > 0)
			goto :gotStats
		else
			setTextLineTrigger getLine2 :statsline
			pause
		end

	:gotStats
		setVar $stats $stats & " @@@"

		setVar $current_word 0
		while ($wordy <> "@@@")
			if ($wordy = "Sect")
				getWord $stats $CURRENT_SECTOR   	($current_word + 1)
			elseif ($wordy = "Turns")
				getWord $stats $TURNS  			($current_word + 1)
			elseif ($wordy = "Creds")
				getWord $stats $CREDITS  		($current_word + 1)
			elseif ($wordy = "Figs")
				getWord $stats $FIGHTERS   		($current_word + 1)
			elseif ($wordy = "Shlds")
				getWord $stats $SHIELDS  		($current_word + 1)
			elseif ($wordy = "Hlds")
				getWord $stats $TOTAL_HOLDS   		($current_word + 1)
			elseif ($wordy = "Ore")
				getWord $stats $ORE_HOLDS    		($current_word + 1)
			elseif ($wordy = "Org")
				getWord $stats $ORGANIC_HOLDS    	($current_word + 1)
			elseif ($wordy = "Equ")
				getWord $stats $EQUIPMENT_HOLDS    	($current_word + 1)
			elseif ($wordy = "Col")
				getWord $stats $COLONIST_HOLDS    	($current_word + 1)
			elseif ($wordy = "Phot")
				getWord $stats $PHOTONS   		($current_word + 1)
			elseif ($wordy = "Armd")
				getWord $stats $ARMIDS   		($current_word + 1)
			elseif ($wordy = "Lmpt")
				getWord $stats $LIMPETS   		($current_word + 1)
			elseif ($wordy = "GTorp")
				getWord $stats $GENESIS  		($current_word + 1)
			elseif ($wordy = "TWarp")
				getWord $stats $TWARP_TYPE  		($current_word + 1)
			elseif ($wordy = "Clks")
				getWord $stats $CLOAKS   		($current_word + 1)
			elseif ($wordy = "Beacns")
				getWord $stats $BEACONS 		($current_word + 1)
			elseif ($wordy = "AtmDt")
				getWord $stats $ATOMIC  		($current_word + 1)
			elseif ($wordy = "Corbo")
				getWord $stats $CORBO   		($current_word + 1)
			elseif ($wordy = "EPrb")
				getWord $stats $EPROBES   		($current_word + 1)
			elseif ($wordy = "MDis")
				getWord $stats $MINE_DISRUPTORS   	($current_word + 1)
			elseif ($wordy = "PsPrb")
				getWord $stats $PSYCHIC_PROBE  		($current_word + 1)
			elseif ($wordy = "PlScn")
				getWord $stats $PLANET_SCANNER  	($current_word + 1)
			elseif ($wordy = "LRS")
				getWord $stats $SCAN_TYPE    		($current_word + 1)
			elseif ($wordy = "Aln")
				getWord $stats $ALIGNMENT    		($current_word + 1)
			elseif ($wordy = "Exp")
				getWord $stats $EXPERIENCE    		($current_word + 1)
			elseif ($wordy = "Corp")
				getWord $stats $CORP   			($current_word + 1)
			elseif ($wordy = "Ship")
				getWord $stats $SHIP_NUMBER   		($current_word + 1)
			end
			add $current_word 1
			getWord $stats $wordy $current_word
		end
	:doneQuikstats
		killtrigger prompt1
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger statlinetrig
		killtrigger getLine2

return
# ============================== END QUICKSTATS SUB==============================

# ==============================  START PLANET INFO SUBROUTINE  =================
:getPlanetInfo
	send "*"
	setTextLineTrigger planetInfo :planetInfo "Planet #"
	pause

	:planetinfo
		killalltriggers
		setVar $CITADEL 0
		setVar $SECTOR_CANNON 0
		setVar $ATMOSPHERE_CANNON 0
		setVar $CITADEL_CREDITS 0
		getWord CURRENTLINE $PLANET 2
		stripText $PLANET "#"
		getWord CURRENTLINE $CURRENT_SECTOR 5
		stripText $CURRENT_SECTOR ":"
		waitfor "2 Build 1   Product    Amount     Amount     Maximum"

        :getPlanetStuff
		setTextLineTrigger fuelstart :fuelstart "Fuel Ore"
		setTextLineTrigger orgstart :orgstart "Organics"
		setTextLineTrigger equipstart :equipstart "Equipment"
		setTextLineTrigger figstart :figstart "Fighters        N/A"
		setTextLineTrigger citadelstart :citadelstart "Planet has a level"
		setTextLineTrigger cannon :cannonstart ", AtmosLvl="
		setTextTrigger planetInfoDone :planetInfoDone "Planet command (?=help)"
		pause

        :fuelstart
		getWord CURRENTLINE $PLANET_FUEL 6
		getWord CURRENTLINE $PLANET_FUEL_MAX 8
		stripText $PLANET_FUEL ","
		stripText $PLANET_FUEL_MAX ","
		pause

        :orgstart
		getWord CURRENTLINE $PLANET_ORGANICS 5
		getWord CURRENTLINE $PLANET_ORGANICS_MAX 7
		stripText $PLANET_ORGANICS ","
		stripText $PLANET_ORGANICS_MAX ","
		pause

        :equipstart
		getWord CURRENTLINE $PLANET_EQUIPMENT 5
		getWord CURRENTLINE $PLANET_EQUIPMENT_MAX 7
		stripText $PLANET_EQUIPMENT ","
		stripText $PLANET_EQUIPMENT_MAX ","
		pause

        :figstart
		getWord CURRENTLINE $PLANET_FIGHTERS 5
		getWord CURRENTLINE $PLANET_FIGHTERS_MAX 7
		stripText $PLANET_FIGHTERS ","
		stripText $PLANET_FIGHTERS_MAX ","
		pause

        :citadelstart
		getWord CURRENTLINE $CITADEL 5
		getWord CURRENTLINE $CITADEL_CREDITS 9
		striptext $CITADEL_CREDITS ","
		pause

	:cannonstart
		getWord CURRENTLINE $ATMOSPHERE_CANNON 5
		getWord CURRENTLINE $SECTOR_CANNON 6
		stripText $SECTOR_CANNON "SectLvl="
		striptext $SECTOR_CANNON "%"
		stripText $ATMOSPHERE_CANNON "AtmosLvl="
		striptext $ATMOSPHERE_CANNON "%"
		striptext $ATMOSPHERE_CANNON ","
		pause
	:planetInfoDone
		killtrigger citadelstart
		killtrigger cannon
	
return
# ==============================  END PLANET INFO SUBROUTINE  =================

:getShipStats
	send "c;q"
	setTextLineTrigger	getshipoffense		:shipoffenseodds	"Offensive Odds: "
	setTextLineTrigger	getshipfighters 	:shipmaxfigsperattack	" TransWarp Drive:   "
	setTextLineTrigger	getshipmines 		:shipmaxmines		" Mine Max:  "
	pause
	
	:shipoffenseodds
		getWordPos CURRENTANSILINE $pos "[0;31m:[1;36m1"
		if ($pos > 0)
			getText CURRENTANSILINE $SHIP_OFFENSIVE_ODDS "Offensive Odds[1;33m:[36m " "[0;31m:[1;36m1"
			stripText $SHIP_OFFENSIVE_ODDS "."
			stripText $SHIP_OFFENSIVE_ODDS " "
			gettext CURRENTANSILINE $SHIP_FIGHTERS_MAX "Max Fighters[1;33m:[36m" "[0;32m Offensive Odds"
			stripText $SHIP_FIGHTERS_MAX ","
			stripText $SHIP_FIGHTERS_MAX " "
		end
		pause
	:shipmaxmines
		getText CURRENTLINE $SHIP_MINES_MAX "Mine Max:" "Beacon Max:"
		stripText $SHIP_MINES_MAX " "
		pause
	
	:shipmaxfigsperattack
		getWordPos CURRENTANSILINE $pos "[0m[32m Max Figs Per Attack[1;33m:[36m"
		if ($pos > 0)
			getText CURRENTANSILINE $SHIP_MAX_ATTACK "[0m[32m Max Figs Per Attack[1;33m:[36m" "[0;32mTransWarp"
			striptext $SHIP_MAX_ATTACK " "
		end	
return