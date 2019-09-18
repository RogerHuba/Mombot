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
						send "'{" $switchboard~bot_name "} Not enough fuel on planet "&$psst_Planet1 &". Halting Script.*"
						goto :endSST
					:pwarpYesShip1
						killAllTriggers
						gosub :player~quikstats
						setVar $ship1NeedsPort FALSE
						setVar $ship1Sector $focus
						gosub :getSSTPortInfo
						setVar $ship1TotalHolds $player~total_holds
						setVar $ship1Equipment $player~equipment_holds
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
						getWord CURRENTLINE $planet~planet1Fuel[$p1chk] 6
						stripText $planet~planet1Fuel[$p1chk] ","
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
					send "'{" $switchboard~bot_name "} No Ports Within Transport Range*"
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
						send "'{" $switchboard~bot_name "} Not enough fuel on planet "&$psst_Planet2&". Halting Script.*"
						goto :endSST
					:pwarpYesShip2
						killAllTriggers
						gosub :player~quikstats
						setVar $ship2NeedsPort FALSE
						setVar $ship2Sector $focus
						gosub :getSSTPortInfo
						setVar $ship2TotalHolds $player~total_holds
						setVar $ship2Equipment $player~equipment_holds
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
						getWord CURRENTLINE $planet~planet2Fuel[$p2chk] 6
						stripText $planet~planet2Fuel[$p2chk] ","
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
		setVar $maxSteal ($player~experience / $game~steal_factor - 1)
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
				add $player~experience $stake
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



:start_script
	gosub :BOT~loadVars
	loadVar $game~steal_factor
	loadVar $player~unlimitedGame
	loadVar $map~rylos
	loadVar $map~alpha_centauri
	loadVar $map~stardock
	loadvar $bot~folder


	setVar $BOT~help[1]  $BOT~tab&"              Planet SST              "
	setVar $BOT~help[2]  $BOT~tab&"  psst [ship2] [planet1] [planet2] {furb:x} {buyfuel} "
	setVar $BOT~help[3]  $BOT~tab&"       "
	setVar $BOT~help[4]  $BOT~tab&"        "
	setVar $BOT~help[5]  $BOT~tab&"Options:"
	setVar $BOT~help[6]  $BOT~tab&"     [furb:x]  Use furbing bot where x is bot name"
	setVar $BOT~help[7]  $BOT~tab&"    [buyfuel]  buy fuel while cashing"
	gosub :bot~helpfile

	setVar $BOT~script_title "Planet SST"
	gosub :BOT~banner

	setVar $BUST_FILE $bot~folder&"/busts.cfg"
	
	gosub :player~quikstats
	setVar $startingLocation $player~current_prompt
	isNumber $isParamOneNumber   $bot~parm1 
	isNumber $isParamTwoNumber   $bot~parm2
	isNumber $isParamThreeNumber $bot~parm3

	if ($startingLocation <> "Command")
		send "'{" $switchboard~bot_name "} - Planet SST must be run from command prompt*"
		halt
	end
	setVar $furb FALSE
	getWordPos $bot~user_command_line $pos "furb:"
	if ($pos > 0)
		setVar $furb TRUE
		getText " "&$bot~user_command_line&" " $furb_bot "furb:" " "
	end

	setVar $buyfuel FALSE
	getWordPos $bot~user_command_line $pos "buyfuel"
	if ($pos > 0)
		setVar $buyfuel TRUE
	end

	lowerCase $bot~parm1
	if ($bot~parm1 = "clear_busts")
		delete $BUST_FILE
		setVar $i 1
		while ($i <= SECTORS)
			setSectorParameter $i "BUSTED" FALSE
			add $i 1
		end
		send "'{" $switchboard~bot_name "} - Bust file for this bot has been cleared.*"
		halt
	elseif (($isParamOneNumber = TRUE) AND ($isParamTwoNumber = TRUE) AND ($isParamThreeNumber = TRUE))
		setVar $psst_Ship2 $bot~parm1
		setVar $psst_Planet1 $bot~parm2
		setVar $psst_Planet2 $bot~parm3
	else
		send "'{" $switchboard~bot_name "} - Please use psst [ship2#] [planet1#] [planet2#] format.*"
		halt
	end

	setVar $portaverage 1
	send "jy*"
	setVar $cashDeposited 0
	goSub :player~quikstats
	setvar $startcash $player~credits
	setArray $planet~planet1Fuel 3
	setArray $planet~planet2Fuel 3
	setVar $psst_Ship1 $player~ship_number
	
	if ($psst_Ship2 <= 0) OR ($psst_Planet1 <= 0) OR ($psst_Planet2 <= 0) OR ($game~steal_factor <= 0)
		send "'This module should be run from the MOM Bot.*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	setVar $startingSector $player~current_sector
	setVar $inShip1 TRUE
	setvar $p1chk 3
	setvar $p2chk 3
	if ($map~RYLOS > 10)
		setVar $refurbPort $map~RYLOS
	elseif ($map~ALPHA_CENTAURI > 10)
		setVar $refurbPort $map~ALPHA_CENTAURI
	elseif ($furb)
		send "'{" $switchboard~bot_name "} - This bot has no locations of Class 0 ports in its database.  Furbing only option enabled.*"
	else
		send "'{" $switchboard~bot_name "} - This bot has no locations of Class 0 ports in its database and furbing not enabled.  Cannot continue with Planet SST.*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	if (SECTOR.PLANETCOUNT[$startingSector] <= 1)
		send "'{" $switchboard~bot_name "} - Planet SST must be run with at least two movable planets in the sector*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	if (SECTOR.SHIPCOUNT[$startingSector] < 1)
		send "'{" $switchboard~bot_name "} - Planet SST must be run with at least one empty ship in the sector*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	gosub :checkSSTPlanets
	gosub :checkSSTShips
	if ($foundPlanet1 <> TRUE)
		send "'{" $switchboard~bot_name "} - Planet #1 entered for Planet SST was not valid for this sector.*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	if ($foundPlanet2 <> TRUE)
		send "'{" $switchboard~bot_name "} - Planet #2 entered for Planet SST was not valid for this sector.*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	if ($foundShip2 <> TRUE)
		send "'{" $switchboard~bot_name "} - Ship #2 entered for Planet SST was not valid for this sector.*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	send "'{" $switchboard~bot_name "} Planet SST Powering Up!*"
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
	send "'{" $switchboard~bot_name "} Minimum transport range of these two ships is "&$transportRange&".*"
	
	setVar $ship1Sector $player~current_sector
	setVar $ship2Sector $player~current_sector
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
			if (($player~unlimitedGame = FALSE) AND ($player~turns <= $bot_turn_limit))
				goto :endSST
			end
			gosub :steal
		end
		if (($ship1TotalHolds < $minRefurb) OR ($ship2TotalHolds < $minRefurb))
			gosub :refurb
		end
		if (($planet~planet1Fuel[1] < 100000) and ($planet~planet1Fuel[2] < 100000) and ($planet~planet1Fuel[3] < 100000))
			goto :endSST
		elseif (($planet~planet2Fuel[1] < 100000) and ($planet~planet2Fuel[2] < 100000) and ($planet~planet2Fuel[3] < 100000))
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
	setTextLineTrigger other :shipline " "&$player~current_sector&" "
	setTextLineTrigger noShips :shipDone "You do not own any other ships in this sector!"
	pause
	
	:shipline
		killalltriggers
		add $shipCount 1
		getWord CURRENTLINE $tempID 1
		if ($tempID = $psst_Ship2)
			setVar $foundShip2 TRUE
		end
		setTextLineTrigger other :shipline " "&$player~current_sector&" "
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
 				setVar $equipAtPort[$focus] ($player~total_holds + 50)
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
			if ($buyfuel = true)
				gosub :PLAYER~quikstats
				send "q"
				waitOn "Planet command (?"
				gosub :PLANET~getPlanetInfo
				send "c"
			end
			if ((($buyfuel = true) AND ((PORT.BUYFUEL[$focus] = FALSE) and (port.exists[$focus] = true))) and ($planet~planetfuel < ($planet~planetfuelmax-65000)))
					setVar $total_creds_needed (300*7000)
					if ($total_creds_needed > $PLAYER~CREDITS)
						setVar $cashonhand $planet~CITADEL_CREDITS
						add $cashonhand $PLAYER~CREDITS
						if ($cashonhand > $total_creds_needed)
								send "T T " & $PLAYER~CREDITS & "* "
								send "T F " & $total_creds_needed & "* "
								setVar $PLAYER~CREDITS $total_creds_needed
							end
					end
					send "q q *O 1"
					waitOn ", 0 to quit)"
					getWord CURRENTLINE $upgradeAmount 9
					stripText $upgradeAmount "("
					send $upgradeAmount&"* * *CR*Q"
					waitOn "What sector is the port in? ["&$PLAYER~CURRENT_SECTOR&"]"
					setTextLineTrigger getFuel2 :fuelDuring "Fuel Ore"
					pause
					:fuelDuring
						killalltriggers
						getWord CURRENTLINE $totalPortFuel 4
						waitOn "<Computer deactivated>"
					gosub :PLAYER~quikstats
					gosub :PLANET~landOnPlanetEnterCitadel
					gosub :PLAYER~quikstats

			end
		:gotallportinfo
			killAllTriggers			

  return

:refurb
	if ($furb)
		gosub :player~quikstats
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
		gosub :player~quikstats
		if ($inShip1)
			if ($player~credits > 5000000)
				send "l "&$psst_Planet1 &"* c t t "&($player~credits-5000000)&"* p "&$ship1Sector&"*y"
				add $cashDeposited ($player~credits-5000000)
				setVar $player~credits 5000000
			else
				send "l "&$psst_Planet1 &"* c p "&$ship1Sector&"*y"
			end
		else
			if ($player~credits > 5000000)
				send "l "&$psst_Planet2&"* c t t "&($player~credits-5000000)&"* p "&$ship2Sector&"*y"
				add $cashDeposited ($player~credits-5000000)
				setVar $player~credits 5000000
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
			send "'{" $switchboard~bot_name "} Not enough fuel on planet. Halting Script.*"
			setVar $mode "General"
			saveVar $mode
			halt
		
		:pwarpNoRefurbFig
			killAllTriggers
			send "'{" $switchboard~bot_name "} No fighter down at refurb port in sector " &$refurbPort& ".*"
			if ($refurbPort = $map~RYLOS)
				if ($map~ALPHA_CENTAURI > 10)
					setVar $refurbPort $map~ALPHA_CENTAURI
					send "qq"
					goto :refurb
				end
			end
			goto :endSST
		:pwarpYesRefurb
			killAllTriggers
			send "q q p ty"
			waitOn "You have "
			getWord CURRENTLINE $player~credits 3
			striptext $player~credits ","
			waitOn "A  Cargo holds     :"
			getWord CURRENTLINE $holdsToBuy 10
			send "a "&$holdsToBuy&"* y q q q * "
		if ($inShip1)
			if ($player~credits > 5000000)
				send "l "&$psst_Planet1 &"* c t t "&($player~credits-5000000)&"* p "&$ship1Sector&"*y"
				add $cashDeposited ($player~credits-5000000)
				setVar $player~credits 5000000
			else
				send "l "&$psst_Planet1 &"* c p "&$ship1Sector&"*y"
			end
		else
			if ($player~credits > 5000000)
				send "l "&$psst_Planet2&"* c t t "&($player~credits-5000000)&"* p "&$ship2Sector&"*y"
				add $cashDeposited ($player~credits-5000000)
				setVar $player~credits 5000000
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
			send "'{" $switchboard~bot_name "} Not enough fuel on planet. Can't make it back home. Resuming bot control.*"
			setVar $mode "General"
			saveVar $mode
			halt
		
		:pwarpBackNoRefurbFig
			killAllTriggers
			send "'{" $switchboard~bot_name "} No fighter down coming back from refurb port, halting.*"
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
	setVar $spentCredits $player~credits
	getLength $spentCredits $length
	while ($length > 3)
		cutText $spentCredits $snippet $length-2 9999
		cutText $spentCredits $spentCredits 1 $length-3
		getLength $spentCredits $length
		setVar $formattedOnHandCredits ","&$snippet&$formattedOnHandCredits
	end
	setVar $formattedOnHandCredits $spentCredits&$formattedOnHandCredits
	add $portaverage $cashDeposited
	add $portaverage $player~credits
	subtract $portaverage $startcash
	if ($numberbusted = 0)
		setvar $numberbusted 1
	end
	divide $portaverage $numberbusted
	setWindowContents cash "    Cash Deposited: "&$formattedDepositedCredits&"*      Cash On Hand: "&$formattedOnHandCredits&"*  Busted xxB Ports: "&$numberbusted&"*     Planet 1 Fuel: "&$planet~planet1Fuel[1]&"*     Planet 2 Fuel: "&$planet~planet2Fuel[1]&"*  Credits per Port: "&$portaverage&"*        Experience: "&$player~experience&"*"


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
			send "'{" $switchboard~bot_name "} Ship #" $psst_Ship2 " is in use or not owned by you.*"
		else
			send "'{" $switchboard~bot_name "} Ship #" $psst_Ship1 " is in use or not owned by you.*"
		end
		goto :endSST
		halt
	:outOfRange
		if ($inShip1)
			send "'{" $switchboard~bot_name "} Ship #" $psst_Ship2 " is out of transporter range.*"
		else
			send "'{" $switchboard~bot_name "} Ship #" $psst_Ship1 " is out of transporter range.*"
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
	
	if (($planet~planet1Fuel[1] < 100000) and ($planet~planet1Fuel[2] < 100000) and ($planet~planet1Fuel[3] < 100000))
		send "'{" $switchboard~bot_name "} - Planet(s) low on fuel, stopping script.  Put total of "&$formattedDepositedCredits&" credits in treasury.*"
	elseif (($planet~planet2Fuel[1] < 100000) and ($planet~planet2Fuel[2] < 100000) and ($planet~planet2Fuel[3] < 100000))
		send "'{" $switchboard~bot_name "} - Planet(s) low on fuel, stopping script.  Put total of "&$formattedDepositedCredits&" credits in treasury.*"
	elseif (($player~unlimitedGame = FALSE) AND ($player~turns <= $bot_turn_limit))
		send "'{" $switchboard~bot_name "} - Too low turns to continue Planet SST.*"
	else	
		send "'{" $switchboard~bot_name "} - All known xxB ports in the grid are used up.  Put total of "&$formattedDepositedCredits&" credits in treasury.*"
	end
	send "'{" $switchboard~bot_name "} - Check to make sure both planets and ships made it back to safe sector.*"
	halt

include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\planet\landonplanetentercitadel\planet"
