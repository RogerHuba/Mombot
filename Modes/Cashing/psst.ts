	logging off
	goto :start_script

:findSSTPorts
	
	if ($ship1NeedsPort)
		if ($inShip1 <> TRUE)
			goSub :transport
		end
		getNearestWarps $nearest $ship1Sector
		setVar $i 1
		while ($i <= $nearest)
			setVar $focus $nearest[$i]
			getSectorParameter $focus "BUSTED" $isBusted
			getSectorParameter $focus "FIGSEC" $isFigged
			if (($isFigged = TRUE) AND ($isBusted <> TRUE) AND ((PORT.EXISTS[$focus] = TRUE) AND (PORT.EQUIP[$focus] > 0) AND (PORT.BUYEQUIP[$focus] = TRUE)) AND ($focus <> $ship2Sector) AND ($focus <> $ship1Sector))
				# found a fig
				getDistance $distanceThere $ship2Sector $focus
				getDistance $distanceBack $focus $ship2Sector
				if ($distanceThere < 0)
					send "^f"&$ship2Sector&"*"&$focus&"*q"
					waitOn "ENDINTERROG"
					getDistance $distanceThere $ship2Sector $focus
				end
				if ($distanceBack < 0)
					send "^f"&$focus&"*"&$ship2Sector&"*q"
					waitOn "ENDINTERROG"
					getDistance $distanceBack $focus $ship2Sector
				end
				if ($distanceThere > $transportRange)
					setVar $NearFig 0
					echo ANSI_15 "*No Ports Within Transport Range" ANSI_7
					goto :continueOnShip1   
				elseif ($distanceBack > $transportRange)
					goto :cantTransportShip1
				else
					killAllTriggers
					send "l "&$psst_Planet1 &"* c p "&$focus&"*y"
					setTextLineTrigger pwarpNoShip1 :pwarpNoShip1 "You do not have any fighters in Sector "
					setTextLineTrigger pwarpYesShip1 :pwarpYesShip1 " Planetary TransWarp Drive Engaged! "
					setTextLineTrigger pwarpNoFuel1 :pwarpNoFuel1 "You do not have enough Fuel Ore on this planet to make the jump."
					pause
					:pwarpNoFuel1
						send "'{" $bot_name "} Not enough fuel on planet "&$psst_Planet1 &". Halting Script.*"
						goto :endSST
					:pwarpYesShip1
						killAllTriggers
						gosub :quikstats
						setVar $ship1NeedsPort FALSE
						setVar $ship1Sector $focus
						gosub :getSSTPortInfo
						setVar $ship1TotalHolds $TOTAL_HOLDS
						setVar $ship1Equipment $EQUIPMENT_HOLDS
						gosub :displayCredits
						send "q *q *"
						if ($p1chk=1)
							setvar $p1chk 2
						elseif ($p1chk=2)
							setvar $p1chk 3
						elseif ($p1chk=3)
							setvar $p1chk 1
						end
						waitOn "Fuel Ore"
						getWord CURRENTLINE $planet1Fuel[$p1chk] 6
						stripText $planet1Fuel[$p1chk] ","
						goto :continueOnShip1   
					:pwarpNoShip1
						killAllTriggers	
						gosub :displayCredits
						send "q q "
				end

			end
			:cantTransportShip1
				add $i 1
		end
		:continueOnShip1
	end
	

	if ($ship2NeedsPort)
		if ($inShip1)
			goSub :transport
		end
		getNearestWarps $nearest $ship2Sector
		setVar $i 1
		while ($i <= $nearest)
			setVar $focus $nearest[$i]
			getSectorParameter $focus "BUSTED" $isBusted
			getSectorParameter $focus "FIGSEC" $isFigged
			if (($isFigged = TRUE) AND ($isBusted <> TRUE) AND ((PORT.EXISTS[$focus] = TRUE) AND (PORT.EQUIP[$focus] > 0) AND (PORT.BUYEQUIP[$focus] = TRUE)) AND ($focus <> $ship1Sector) AND ($focus <> $ship2Sector))
				getDistance $distanceThere $ship1Sector $focus
				getDistance $distanceBack $focus $ship1Sector
				if ($distanceThere < 0)
					send "^f"&$ship1Sector&"*"&$focus&"*q"
					waitOn "ENDINTERROG"
					getDistance $distanceThere $ship1Sector $focus
				end
				if ($distanceBack < 0)
					send "^f"&$focus&"*"&$ship1Sector&"*q"
					waitOn "ENDINTERROG"
					getDistance $distanceBack $focus $ship1Sector
				end
				if ($distanceThere > $transportRange)
					setVar $NearFig 0
					send "'{" $bot_name "} No Ports Within Transport Range*"
					goto :endSST  
				elseif ($distanceBack > $transportRange)
					goto :cantTransport
				else
					killAllTriggers
					send "l "&$psst_Planet2&"* c p "&$focus&"*y"
					setTextLineTrigger pwarpNoShip2 :pwarpNoShip2 "You do not have any fighters in Sector "
					setTextLineTrigger pwarpYesShip2 :pwarpYesShip2 " Planetary TransWarp Drive Engaged! "
					setTextLineTrigger pwarpNoFuel2 :pwarpNoFuel2 "You do not have enough Fuel Ore on this planet to make the jump."
					pause
					:pwarpNoFuel2
						send "'{" $bot_name "} Not enough fuel on planet "&$psst_Planet2&". Halting Script.*"
						goto :endSST
					:pwarpYesShip2
						killAllTriggers
						gosub :quikstats
						setVar $ship2NeedsPort FALSE
						setVar $ship2Sector $focus
						gosub :getSSTPortInfo
						setVar $ship2TotalHolds $TOTAL_HOLDS
						setVar $ship2Equipment $EQUIPMENT_HOLDS
						gosub :displayCredits
						send "q *q *"
						if ($p2chk=1)
							setvar $p2chk 2
						elseif ($p2chk=2)
							setvar $p2chk 3
						elseif ($p2chk=3)
							setvar $p2chk 1
						end
						waitOn "Fuel Ore"
						getWord CURRENTLINE $planet2Fuel[$p2chk] 6
						stripText $planet2Fuel[$p2chk] ","
						goto :continueOnShip2   
					:pwarpNoShip2
						killAllTriggers
						gosub :displayCredits
						send "q q "
				end

			end	
			:cantTransport
				add $i 1
		end	
		:continueOnShip2
			
	end
		
				
return

:steal
	if (($isBusted1 <> TRUE) AND ($isBusted2 <> TRUE))
		setVar $maxSteal ($EXPERIENCE / $steal_factor - 1)
		setVar $send ""
			if ($inShip1)
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
 				#setVar $send $send & "p r * s z 3 " & $steal & "* x    "
				setVar $send $send & "p r* s   z3  " & $steal & "*  x    "
				setVar $ship1Equipment $steal
				send $send & $psst_Ship2 & "*  * "
				setVar $inShip1 FALSE
				setVar $LastSteal $ship1Sector
			else
				if ($ship2Equipment > 0)
					# sell off existing equipment
					setVar $send $send & "p t * * 0* 0* "
      					setVar $ship2Equipment 0
					add $equipAtPort[$ship2Sector] $ship2Equipment
				end
				# steal as much as we are able to on this ship
				if ($ship2TotalHolds < $maxSteal)
					setVar $steal $ship2TotalHolds
				else
					setVar $steal $maxSteal
				end
 	 
				while ($equipAtPort[$ship2Sector] < ($steal + 20))
					setVar $upgrade ($steal - $equipAtPort[$ship2Sector])
					divide $upgrade 10
					add $upgrade 4
					setVar $send $send & "o 3" & $upgrade & "* * "
					add $equipAtPort[$ship2Sector] ($upgrade * 10)
				end
 				setVar $send $send & "p r* s   z3  " & $steal & "*  x    "
				setVar $ship2Equipment $steal
    				send $send & $psst_Ship1 & "*  * "
				setVar $inShip1 TRUE
				setVar $LastSteal $ship2Sector

			end
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
				killalltriggers
				return
    
			:busted
    				# calculate holds lost and flag this sector as busted
				if ($inShip1)
					subtract $ship2TotalHolds $stake
					setVar $lastBustSector $ship2Sector
					setVar $ship2Equipment 0
    				else
					subtract $ship1TotalHolds $stake
					setVar $lastBustSector $ship1Sector
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
				send "'<"&$subspace&">[Busted:"&$lastBustSector&"]<"&$subspace&">* c"
				setSectorParameter $lastBustSector "BUSTED" TRUE
				saveVar $lastBustSector
				waitOn "<Computer activated>"
				send "tq"
				setTextLineTrigger AM :getBustStamp " AM "
				setTextLineTrigger PM :getBustStamp " PM "
				pause
    			:getBustStamp
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
				
return


# ============================== QUICKSTATS ==============================
:quikstats
	

	killtrigger noprompt
	killtrigger prompt1
	killtrigger prompt2
	killtrigger prompt3
	killtrigger prompt4
	killtrigger statlinetrig
	killtrigger getLine2
	setTextLineTrigger 	prompt		:allPrompts	 	#145 & #8
	setTextLineTrigger 	statlinetrig 	:statStart 		#179
	send #145&"/"
	pause

	:allPrompts
		getWord CURRENTLINE $CURRENT_PROMPT 1
		stripText $CURRENT_PROMPT #145
		stripText $CURRENT_PROMPT #8
		#getWord currentansiline $checkPrompt 1
		#getWord currentline $tempPrompt 1
		#getWordPos $checkPrompt $pos "[35m"
		#if ($pos > 0)
		#	setVar $CURRENT_PROMPT $tempPrompt
		#end
		setTextLineTrigger 	prompt		:allPrompts	 	#145 & #8
		pause

	:statStart
		killtrigger prompt
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


:start_script
	#Version 1.1
	setVar $BUST_FILE "MOM_"&GAMENAME&"_Busts.txt"
	setVar $FIG_FILE "MOM_"&GAMENAME&"_Fighter_Grid.txt"
	setVar $FIG_COUNT_FILE "MOM_"&GAMENAME&"_Fighter_Grid_Count.cnt"
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
	loadVar $rylos
	loadVar $alpha_centauri
	loadVar $stardock
	loadVar $subspace
	
	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	isNumber $isParamOneNumber   $parm1 
	isNumber $isParamTwoNumber   $parm2
	isNumber $isParamThreeNumber $parm3

	if ($startingLocation <> "Command")
		send "'{" $bot_name "} - Planet SST must be run from command prompt*"
		halt
	end
	setVar $furb FALSE
	getWordPos $user_command_line $pos "furb:"
	if ($pos > 0)
		setVar $furb TRUE
		getText " "&$user_command_line&" " $furb_bot "furb:" " "
	end

	lowerCase $parm1
	if ($parm1 = "clear_busts")
		delete $BUST_FILE
		setVar $i 1
		while ($i <= SECTORS)
			setSectorParameter $i "BUSTED" FALSE
			add $i 1
		end
		send "'{" $bot_name "} - Bust file for this bot has been cleared.*"
		halt
	elseif (($isParamOneNumber = TRUE) AND ($isParamTwoNumber = TRUE) AND ($isParamThreeNumber = TRUE))
		setVar $psst_Ship2 $parm1
		setVar $psst_Planet1 $parm2
		setVar $psst_Planet2 $parm3
	else
		send "'{" $bot_name "} - Please use psst [ship2#] [planet1#] [planet2#] format.*"
		halt
	end

	setVar $portaverage 1
	send "jy*"
	setVar $cashDeposited 0
	goSub :quikstats
	setvar $startcash $CREDITS
	setArray $planet1Fuel 3
	setArray $planet2Fuel 3
	setVar $psst_Ship1 $SHIP_NUMBER
	
	if ($psst_Ship2 <= 0) OR ($psst_Planet1 <= 0) OR ($psst_Planet2 <= 0) OR ($steal_factor <= 0)
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
	elseif ($furb)
		send "'{" $bot_name "} - This bot has no locations of Class 0 ports in its database.  Furbing only option enabled.*"
	else
		send "'{" $bot_name "} - This bot has no locations of Class 0 ports in its database and furbing not enabled.  Cannot continue with Planet SST.*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	if (SECTOR.PLANETCOUNT[$startingSector] <= 1)
		send "'{" $bot_name "} - Planet SST must be run with at least two movable planets in the sector*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	if (SECTOR.SHIPCOUNT[$startingSector] < 1)
		send "'{" $bot_name "} - Planet SST must be run with at least one empty ship in the sector*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	gosub :checkSSTPlanets
	gosub :checkSSTShips
	if ($foundPlanet1 <> TRUE)
		send "'{" $bot_name "} - Planet #1 entered for Planet SST was not valid for this sector.*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	if ($foundPlanet2 <> TRUE)
		send "'{" $bot_name "} - Planet #2 entered for Planet SST was not valid for this sector.*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	if ($foundShip2 <> TRUE)
		send "'{" $bot_name "} - Ship #2 entered for Planet SST was not valid for this sector.*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	send "'{" $bot_name "} Planet SST Powering Up!*"
	send "c;q"
	waitOn "Transport Range:"
	getWord CURRENTLINE $transportRange1 6
	getWord CURRENTLINE $maxHolds1 3
	gosub :transport
	send "c;q"
	waitOn "Transport Range:"
	getWord CURRENTLINE $transportRange2 6
	getWord CURRENTLINE $maxHolds2 3
	gosub :transport
	if ($transportRange1 <= $transportRange2)
		setVar $transportRange $transportRange1
	else
		setVar $transportRange $transportRange2
	end
	if ($maxHolds1 >= $maxHolds2)
		setVar $minRefurb (($maxHolds1*75)/100)
	else
		setVar $minRefurb (($maxHolds2*75)/100)
	end
	send "'{" $bot_name "} Minimum transport range of these two ships is "&$transportRange&".*"
	
	setVar $ship1Sector $current_Sector
	setVar $ship2Sector $current_Sector
	setVar $ship1NeedsPort TRUE
	setVar $ship2NeedsPort TRUE
	setVar $i 1
	setVar $yes TRUE
	setVar $busted FALSE
	setArray $equipAtPort SECTORS
	setArray $fuelAtPort SECTORS
	window cash 300 150 "Planet SST" ONTOP
	gosub :displayCredits
	while (TRUE)
		gosub :findSSTPorts
		setVar $busted FALSE
		getSectorParameter $ship1Sector "BUSTED" $isBusted1
		getSectorParameter $ship2Sector "BUSTED" $isBusted2
		while ($busted = FALSE)
			if (($unlimitedGame = FALSE) AND ($TURNS <= $bot_turn_limit))
				goto :endSST
			end
			gosub :steal
		end
		if (($ship1TotalHolds < $minRefurb) OR ($ship2TotalHolds < $minRefurb))
			gosub :refurb
		end
		if (($planet1Fuel[1] < 100000) and ($planet1Fuel[2] < 100000) and ($planet1Fuel[3] < 100000))
			goto :endSST
		elseif (($planet2Fuel[1] < 100000) and ($planet2Fuel[2] < 100000) and ($planet2Fuel[3] < 100000))
			goto :endSST
		end
	end
	goto :endSST

:checkSSTPlanets
	setVar $foundPlanet1 FALSE
	setVar $foundPlanet2 FALSE
	killAllTriggers

	:numberingPlanets
		killalltriggers
		setTextLineTrigger planetGrabber :planetline "   <"
		setTextLineTrigger beDone :done "Land on which planet "
		send "lq*"
		pause
	:planetline
		killalltriggers
		setVar $line CURRENTLINE
		replacetext $line "<" " "
		replacetext $line ">" " "
		striptext $line ","
		getWord $line $temp 1
		if ($temp = $psst_Planet1)
			setVar $foundPlanet1 TRUE
		elseif ($temp = $psst_Planet2)
			setVar $foundPlanet2 TRUE
		end
		setTextLineTrigger getLine2 :planetline "   <"
		setTextLineTrigger getEnd :done "Land on which planet "
		pause
	:done
return


:checkSSTShips
	setVar $foundShip2 FALSE
	killalltriggers
	send "wn*"
	setTextLineTrigger other :shipline " "&$current_Sector&" "
	setTextLineTrigger noShips :shipDone "You do not own any other ships in this sector!"
	pause
	
	:shipline
		killalltriggers
		add $shipCount 1
		getWord CURRENTLINE $tempID 1
		if ($tempID = $psst_Ship2)
			setVar $foundShip2 TRUE
		end
		setTextLineTrigger other :shipline " "&$current_Sector&" "
		setTextLineTrigger noMore :shipDone "Choose which ship to tow "
		pause
	:shipDone
	killalltriggers
		
	
return




:getSSTPortInfo
	send "s* cr*q"
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
 				setVar $equipAtPort[$focus] ($TOTAL_HOLDS + 50)
			else
				divide $x $equipPerc
				multiply $x $equipBuy
				divide $x 100
				subtract $x 1
				subtract $x $equipBuy
     	 
				if ($x < 0)
					setVar $equipAtPort[$focus] 0
				else
       	 				setVar $equipAtPort[$focus] $x
				end
			end
		:gotallportinfo
			killAllTriggers			

  return

:refurb
	if ($furb)
		gosub :quikstats
		setVar $FURB_SHIP ""
		setVar $FURB_HOLDS ""
		if ($inShip1)
			send "'"&$furb_bot&" furb "&$psst_Ship1&" "&$FURB_HOLDS&" "&$FURB_SHIP&" planet:"&$psst_Planet1&"  *"
		else
			send "'"&$furb_bot&" furb "&$psst_Ship2&" "&$FURB_HOLDS&" "&$FURB_SHIP&" planet:"&$psst_Planet2&"  *"
		end

		settexttrigger furb1 :furb1 "- Furb delivered"
		pause

		:furb1
			killtrigger furb1
			killtrigger furb2
			setdelaytrigger furb2 :furb2 4000
			pause

		:furb2
			send "ay9^m *"

		:done
		killtrigger furb1
		killtrigger furb2
		gosub :quikstats
		if ($inShip1)
			if ($CREDITS > 5000000)
				send "l "&$psst_Planet1 &"* c t t "&($CREDITS-5000000)&"* p "&$ship1Sector&"*y"
				add $cashDeposited ($CREDITS-5000000)
				setVar $CREDITS 5000000
			else
				send "l "&$psst_Planet1 &"* c p "&$ship1Sector&"*y"
			end
		else
			if ($CREDITS > 5000000)
				send "l "&$psst_Planet2&"* c t t "&($CREDITS-5000000)&"* p "&$ship2Sector&"*y"
				add $cashDeposited ($CREDITS-5000000)
				setVar $CREDITS 5000000
			else
				send "l "&$psst_Planet2&"* c p "&$ship2Sector&"*y"
			end
		end
		gosub :displayCredits

	else

		if ($inShip1)
			send "l "&$psst_Planet1 &"* c p "&$refurbPort&"*y"
		else
			send "l "&$psst_Planet2&"* c p "&$refurbPort&"*y"
		end
		setTextLineTrigger pwarpNoRefurb :pwarpNoRefurbFig "You do not have any fighters in Sector "
		setTextLineTrigger pwarpYesRefurb :pwarpYesRefurb " Planetary TransWarp Drive Engaged! "
		setTextLineTrigger pwarpNoRefurbFuel :pwarpNoRefurb "You do not have enough Fuel Ore on this planet to make the jump."
		pause
		:pwarpNoRefurb
			killalltriggers
			send "'{" $bot_name "} Not enough fuel on planet. Halting Script.*"
			setVar $mode "General"
			saveVar $mode
			halt
		
		:pwarpNoRefurbFig
			killAllTriggers
			send "'{" $bot_name "} No fighter down at refurb port in sector " &$refurbPort& ".*"
			if ($refurbPort = $RYLOS)
				if ($ALPHA_CENTAURI > 10)
					setVar $refurbPort $ALPHA_CENTAURI
					send "qq"
					goto :refurb
				end
			end
			goto :endSST
		:pwarpYesRefurb
			killAllTriggers
			send "q q p ty"
			waitOn "You have "
			getWord CURRENTLINE $CREDITS 3
			striptext $CREDITS ","
			waitOn "A  Cargo holds     :"
			getWord CURRENTLINE $holdsToBuy 10
			send "a "&$holdsToBuy&"* y q q q * "
		if ($inShip1)
			if ($CREDITS > 5000000)
				send "l "&$psst_Planet1 &"* c t t "&($CREDITS-5000000)&"* p "&$ship1Sector&"*y"
				add $cashDeposited ($CREDITS-5000000)
				setVar $CREDITS 5000000
			else
				send "l "&$psst_Planet1 &"* c p "&$ship1Sector&"*y"
			end
		else
			if ($CREDITS > 5000000)
				send "l "&$psst_Planet2&"* c t t "&($CREDITS-5000000)&"* p "&$ship2Sector&"*y"
				add $cashDeposited ($CREDITS-5000000)
				setVar $CREDITS 5000000
			else
				send "l "&$psst_Planet2&"* c p "&$ship2Sector&"*y"
			end
		end
		gosub :displayCredits
		setTextLineTrigger pwarpNoRefurb :pwarpBackNoRefurbFig "You do not have any fighters in Sector "
		setTextLineTrigger pwarpYesBack :pwarpYesBack " Planetary TransWarp Drive Engaged! "
		setTextLineTrigger pwarpNoRefurbFuel :pwarpBackNoRefurbFuel "You do not have enough Fuel Ore on this planet to make the jump."
		pause
		:pwarpBackNoRefurbFuel
			killalltriggers
			send "'{" $bot_name "} Not enough fuel on planet. Can't make it back home. Resuming bot control.*"
			setVar $mode "General"
			saveVar $mode
			halt
		
		:pwarpBackNoRefurbFig
			killAllTriggers
			send "'{" $bot_name "} No fighter down coming back from refurb port, halting.*"
			goto :endSST
		
		:pwarpYesBack
			killalltriggers
			send "q q "
	end
return

:displayCredits

	setVar $formattedDepositedCredits ""
	setVar $spentCredits $cashDeposited
	getLength $spentCredits $length
	while ($length > 3)
		cutText $spentCredits $snippet $length-2 9999
		cutText $spentCredits $spentCredits 1 $length-3
		getLength $spentCredits $length
		setVar $formattedDepositedCredits ","&$snippet&$formattedDepositedCredits
	end
	setVar $formattedDepositedCredits $spentCredits&$formattedDepositedCredits
	
	setVar $formattedOnHandCredits ""
	setVar $spentCredits $CREDITS
	getLength $spentCredits $length
	while ($length > 3)
		cutText $spentCredits $snippet $length-2 9999
		cutText $spentCredits $spentCredits 1 $length-3
		getLength $spentCredits $length
		setVar $formattedOnHandCredits ","&$snippet&$formattedOnHandCredits
	end
	setVar $formattedOnHandCredits $spentCredits&$formattedOnHandCredits
	add $portaverage $cashDeposited
	add $portaverage $CREDITS
	subtract $portaverage $startcash
	if ($numberbusted = 0)
		setvar $numberbusted 1
	end
	divide $portaverage $numberbusted
	setWindowContents cash "    Cash Deposited: "&$formattedDepositedCredits&"*      Cash On Hand: "&$formattedOnHandCredits&"*  Busted xxB Ports: "&$numberbusted&"*     Planet 1 Fuel: "&$planet1Fuel[1]&"*     Planet 2 Fuel: "&$planet2Fuel[1]&"*  Credits per Port: "&$portaverage&"*        Experience: "&$EXPERIENCE&"*"


return
:transport
	
	if ($inShip1)
		send "x     "&$psst_Ship2&"* q * "
	else
		send "x     "&$psst_Ship1&"* q * "
	end
	killAllTriggers
	setTextLineTrigger success :transported "Security code accepted"
	setTextLineTrigger noship :noneAvailable "That is not an available ship."
	setTextLineTrigger range :outOfRange "only has a transport range of"
	pause
	:noneAvailable
		if ($inShip1)
			send "'{" $bot_name "} Ship #" $psst_Ship2 " is in use or not owned by you.*"
		else
			send "'{" $bot_name "} Ship #" $psst_Ship1 " is in use or not owned by you.*"
		end
		goto :endSST
		halt
	:outOfRange
		if ($inShip1)
			send "'{" $bot_name "} Ship #" $psst_Ship2 " is out of transporter range.*"
		else
			send "'{" $bot_name "} Ship #" $psst_Ship1 " is out of transporter range.*"
		end
		goto :endSST
		halt
	:transported
		if ($inShip1)
			setVar $inShip1 FALSE
		else
			setVar $inShip1 TRUE
		end
	killAllTriggers
	
return

:endSST
	send "q q q q  * * * "
	if ($inShip1)
		send "l "&$psst_Planet1 &"* c p "&$startingSector&"*y q q q *"
	else
		send "l "&$psst_Planet2&"* c p "&$startingSector&"*y q q q *"
	end
	
	gosub :transport

	if ($inShip1)
		send "l "&$psst_Planet1 &"* c p "&$startingSector&"*y"
	else
		send "l "&$psst_Planet2&"* c p "&$startingSector&"*y"
	end
	
	if (($planet1Fuel[1] < 100000) and ($planet1Fuel[2] < 100000) and ($planet1Fuel[3] < 100000))
		send "'{" $bot_name "} - Planet(s) low on fuel, stopping script.  Put total of "&$formattedDepositedCredits&" credits in treasury.*"
	elseif (($planet2Fuel[1] < 100000) and ($planet2Fuel[2] < 100000) and ($planet2Fuel[3] < 100000))
		send "'{" $bot_name "} - Planet(s) low on fuel, stopping script.  Put total of "&$formattedDepositedCredits&" credits in treasury.*"
	elseif (($unlimitedGame = FALSE) AND ($TURNS <= $bot_turn_limit))
		send "'{" $bot_name "} - Too low turns to continue Planet SST.*"
	else	
		send "'{" $bot_name "} - All known xxB ports in the grid are used up.  Put total of "&$formattedDepositedCredits&" credits in treasury.*"
	end
	send "'{" $bot_name "} - Check to make sure both planets and ships made it back to safe sector.*"
	halt

