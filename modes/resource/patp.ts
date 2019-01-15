	gosub :BOT~loadVars
	loadVar $PLAYER~unlimitedGame


	setVar $BOT~help[1]  $BOT~tab&"              PATP - Pay At The Pump               "
	setVar $BOT~help[2]  $BOT~tab&"  patp {sector param} {min port fuel} {f} {o} {e} {b} {w}"
	setVar $BOT~help[3]  $BOT~tab&"       {upgrade} {buyhalf} {docim} {destroyports}"
	setVar $BOT~help[4]  $BOT~tab&"        "
	setVar $BOT~help[5]  $BOT~tab&"Options:"
	setVar $BOT~help[6]  $BOT~tab&"    [min port fuel]  minimum fuel a port must have to visit it"
	setVar $BOT~help[7]  $BOT~tab&"                       - default is 1000"
	setVar $BOT~help[8]  $BOT~tab&"    [sector param]   will visit only sector params = true (1) "
	setVar $BOT~help[9]  $BOT~tab&"                       - if blank, all valid sector will be visited "
	setVar $BOT~help[10] $BOT~tab&"    [f]              buys fuel"
	setVar $BOT~help[11] $BOT~tab&"    [o]              buys organics"
	setVar $BOT~help[12] $BOT~tab&"    [e]              buys equipment"
	setVar $BOT~help[13] $BOT~tab&"    [b]              haggles at best price"
	setVar $BOT~help[14] $BOT~tab&"    [w]              haggles at worst price"
	setVar $BOT~help[15] $BOT~tab&"    [upgrade]        upgrades fuel in each port"
	setVar $BOT~help[16] $BOT~tab&"    [buyhalf]        empties ports halfway"
	setVar $BOT~help[17] $BOT~tab&"    [docim]          does cim check before patp"
	setVar $BOT~help[18] $BOT~tab&"    [destroyports]   destroys every port it drains if you "
	setVar $BOT~help[19] $BOT~tab&"                     have enough fighters"
	gosub :BOT~help_file

	setVar $BOT~script_title "Pay At The Pump"
	gosub :BOT~banner


  
   setVar $bot~bot_name $SWITCHBOARD~bot_name

	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "You must run Pay At The Pump command from a Citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
     	halt
	end
	send "q"
	waitOn "Planet command (?"
	gosub :PLANET~getPlanetInfo
	send "c"
	if ($PLANET~CITADEL < 4)
		setVar $SWITCHBOARD~message "You must run Pay At The Pump from at least a level 4 planet.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if (($PLANET~citadel_credits + $PLAYER~CREDITS) < 5000000)
		setVar $SWITCHBOARD~message "You must have at least 5 million credits in the citadel or on hand for patp.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	setvar $parameter ""
	setVar $minimumFuel $bot~parm1
	isNumber $number $minimumFuel
	if ($number <> true)
		setvar $parameter $bot~parm1
		uppercase $parameter
		setVar $minimumFuel $bot~parm2
		isNumber $number $minimumFuel
		if ($number <> true)
			setvar $minimumfuel 1000
		end
	end
	if ($minimumFuel <= 0)
		setvar $switchboard~message "Minimum Port Product must be greater than 0.*"
		gosub :switchboard~switchboard
		halt
	end


	getWordPos $bot~user_command_line $pos "destroyports"
	if ($pos > 0)
		setVar $destroyPorts TRUE
	else
		setVar $destroyPorts FALSE
	end
	getWordPos $bot~user_command_line $pos "upgrade"
	if ($pos > 0)
		setVar $upgrade TRUE
	else
		setVar $upgrade FALSE
	end
	getWordPos $bot~user_command_line $pos "half"
	if ($pos > 0)
		setVar $buyHalf TRUE
	else
		setVar $buyHalf FALSE
	end
	getWordPos " "&$bot~user_command_line&" " $pos " b "
	if ($pos > 0)
		setVar $best TRUE
	else
		setVar $best FALSE
	end
	getWordPos " "&$bot~user_command_line&" " $pos " w "
	if ($pos > 0)
		setVar $worst TRUE
	else
		setVar $worst FALSE
	end
	getWordPos " "&$bot~user_command_line&" " $pos " f "
	if ($pos > 0)
		setVar $buy_fuel TRUE
	else
		setVar $buy_fuel FALSE
	end
	getWordPos " "&$bot~user_command_line&" " $pos " o "
	if ($pos > 0)
		setVar $buy_equipment TRUE
	else
		setVar $buy_equipment FALSE
	end
	getWordPos " "&$bot~user_command_line&" " $pos " e "
	if ($pos > 0)
		setVar $buy_equipment TRUE
	else
		setVar $buy_equipment FALSE
	end

	if (($buy_fuel <> true) and ($buy_equipment <> true) and ($buy_equipment <> true))
		setvar $switchboard~message "Must pick f, o, or e to buy with pay at the pump.  We no longer only fill up on gas!*"
		gosub :switchboard~switchboard
		halt
	end
	getWordPos $bot~user_command_line $pos "docim"
	if ($pos > 0)
		setVar $docim TRUE
	else
		setVar $docim FALSE
	end

	gosub :PLAYER~quikstats
	send "qsnl1*tnl1*tnl2*tnl3*"
	waitOn "Planet command (?"
	gosub :PLANET~getPlanetInfo
	
	send "qjy l "&$PLANET~planet&"* c"
	send "c;q"
	waitFor "Figs Per Attack:"
	getWord CURRENTLINE $SHIP~maxFigAttack 5

	setVar $totalFuelHolds 0 
	setVar $totalOrgHolds 0 
	setVar $totalEquipHolds 0 
	setVar $spentCredits 0 
	setVar $startingSector $PLAYER~CURRENT_SECTOR

	setArray $checkedPorts SECTORS
	setArray $que SECTORS
	setArray $checked SECTORS

	if ($docim = TRUE)
		setVar $SWITCHBOARD~message "PATP Downloading Current Port CIM Data - Comms Off*"
		gosub :SWITCHBOARD~switchboard
		send "^rq"
		killalltriggers
		waitFor ": ENDINTERROG"
		setVar $SWITCHBOARD~message "PATP CIM Port Data Complete - Comms Back On*"
		gosub :SWITCHBOARD~switchboard
	end
	setVar $isDone FALSE
	setVar $turnsTooLow FALSE
	:inac
	killalltriggers
	while ($isDone <> TRUE)
		loadVar $BOT~botIsDeaf
		loadVar $BOT~silent_running
		:inac
		if (($PLAYER~unlimitedGame = FALSE) AND ($PLAYER~TURNS <= $BOT~bot_turn_limit))
			setVar $SWITCHBOARD~message "Turns too low to continue.*"
			gosub :SWITCHBOARD~switchboard
			goto :donePATP
		end
		setVar $bottom 1
		setVar $top 1
		setArray $checked SECTORS
		setVar $que[1] $PLAYER~CURRENT_SECTOR
		setVar $checked[$PLAYER~CURRENT_SECTOR] 1
		:tryAgain2
		while ($bottom <= $top)
			# Now, pull out the next sector in the que, and make it our focus
			setVar $focus $que[$bottom]
			getSectorParameter $focus "BUSTED" $isBusted
			# If this sector is our Sxx, we're done!
			if ($parameter <> "")
				getsectorparameter $focus $parameter $isTargetSector
			else
				setVar $isTargetSector TRUE
			end
			if ($docim = FALSE)
				if (($checkedPorts[$focus] <> TRUE) AND (PORT.EXISTS[$focus] = TRUE) AND (PORT.CLASS[$focus] > 0) AND (SECTOR.EXPLORED[$focus] = "YES") AND (((($buy_fuel = true) and (PORT.FUEL[$focus] >= $minimumFuel) AND (PORT.BUYFUEL[$focus] = FALSE)) or (($buy_equipment = true) and (PORT.ORG[$focus] >= $minimumFuel) AND (PORT.BUYORG[$focus] = FALSE)) or (($buy_equipment = true) and (PORT.EQUIP[$focus] >= $minimumFuel) AND (PORT.BUYEQUIP[$focus] = FALSE)))  AND ($isBusted <> TRUE) AND ($isTargetSector = TRUE)))
					send "cr"&$focus&"*q"
					gosub :PLAYER~quikstats
				end
			end
			if (($checkedPorts[$focus] <> TRUE) AND (PORT.EXISTS[$focus] = TRUE) AND (PORT.CLASS[$focus] > 0) AND (((($buy_fuel = true) and (PORT.FUEL[$focus] >= $minimumFuel) AND (PORT.BUYFUEL[$focus] = FALSE)) or (($buy_equipment = true) and (PORT.ORG[$focus] >= $minimumFuel) AND (PORT.BUYORG[$focus] = FALSE)) or (($buy_equipment = true) and (PORT.EQUIP[$focus] >= $minimumFuel) AND (PORT.BUYEQUIP[$focus] = FALSE))) AND ($isBusted <> TRUE) AND ($isTargetSector = TRUE)))
				# fig found 0 hops
				setVar $NearFig $focus
				setVar $checkedPorts[$NearFig] TRUE
				setVar $totalPortFuel PORT.FUEL[$focus]
				setVar $totalPortEquip PORT.ORG[$focus]
				setVar $totalPortEquip PORT.EQUIP[$focus]
				goto :continueOn2
			else
				setVar $nearfig 0
			end
			# That wasn't it, so let's add all the adjacents to the que for future testing.
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
		setVar $SWITCHBOARD~message "Can't find a route to any other ports.*"
		gosub :SWITCHBOARD~switchboard
		goto :donePATP
		:continueOn2
			if ($NearFig > 0)
				killAllTriggers
				send "p"&$NearFig&"*y"
				setTextLineTrigger warped :emptyPort2 "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
				setTextLineTrigger same :emptyPort2 "You are already in that sector!"
				setTextLineTrigger didnotwarp :noFigAtLocation "Your own fighters must be in the destination to make a safe jump."
				setTextLineTrigger notEnoughFuel :doneNoFuel2 "You do not have enough Fuel Ore on this planet to make the jump."
				pause			
				:emptyPort2
					setSectorParameter $NearFig "FIGSEC" TRUE



				if ($upgrade)
					killAllTriggers

					if ($buy_fuel = true)
						gosub :PLAYER~quikstats
						send "q"
						waitOn "Planet command (?"
						gosub :PLANET~getPlanetInfo
						send "c"
						setVar $total_creds_needed (300*7000)
						if ($total_creds_needed > $PLAYER~CREDITS)
							setVar $cashonhand $PLANET~citadel_credits
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
					end

					if ($buy_organics = true)
						gosub :PLAYER~quikstats
						send "q"
						waitOn "Planet command (?"
						gosub :PLANET~getPlanetInfo
						send "c"
						setVar $total_creds_needed (525*7000)
						if ($total_creds_needed > $PLAYER~CREDITS)
							setVar $cashonhand $PLANET~citadel_credits
							add $cashonhand $PLAYER~CREDITS
							if ($cashonhand > $total_creds_needed)
							        send "T T " & $PLAYER~CREDITS & "* "
					        		send "T F " & $total_creds_needed & "* "
					        		setVar $PLAYER~CREDITS $total_creds_needed
			    				end
						end
						send "q q *O 2"
						waitOn ", 0 to quit)"
						getWord CURRENTLINE $upgradeAmount 9
						stripText $upgradeAmount "("
						send $upgradeAmount&"* * *CR*Q"
						waitOn "What sector is the port in? ["&$PLAYER~CURRENT_SECTOR&"]"
						setTextLineTrigger getOrg2 :orgDuring "Organics"
						pause
						:orgDuring
							killalltriggers
							getWord CURRENTLINE $totalPortOrg 4
							waitOn "<Computer deactivated>"
						gosub :PLAYER~quikstats
						gosub :PLANET~landOnPlanetEnterCitadel
					end

					if ($buy_equipment = true)
						gosub :PLAYER~quikstats
						send "q"
						waitOn "Planet command (?"
						gosub :PLANET~getPlanetInfo
						send "c"
						setVar $total_creds_needed (925*7000)
						if ($total_creds_needed > $PLAYER~CREDITS)
							setVar $cashonhand $PLANET~citadel_credits
							add $cashonhand $PLAYER~CREDITS
							if ($cashonhand > $total_creds_needed)
							        send "T T " & $PLAYER~CREDITS & "* "
					        		send "T F " & $total_creds_needed & "* "
					        		setVar $PLAYER~CREDITS $total_creds_needed
			    				end
						end
						send "q q *O 3"
						waitOn ", 0 to quit)"
						getWord CURRENTLINE $upgradeAmount 9
						stripText $upgradeAmount "("
						send $upgradeAmount&"* * *CR*Q"
						waitOn "What sector is the port in? ["&$PLAYER~CURRENT_SECTOR&"]"
						setTextLineTrigger getFuel2 :equipDuring "Equipment"
						pause
						:equipDuring
							killalltriggers
							getWord CURRENTLINE $totalPortEquip 4
							waitOn "<Computer deactivated>"
						gosub :PLAYER~quikstats
						gosub :PLANET~landOnPlanetEnterCitadel
					end
				end
				if ($buyHalf)
					divide $totalPortFuel 2
					divide $totalPortEquip 2
					divide $totalPortEquip 2
				end

				if ($buy_fuel = true)
					if (($PLANET~planet_fuel_max-$PLANET~planet_fuel) < $totalPortFuel)
						setVar $turnsToEmpty (($PLANET~planet_fuel_max-$PLANET~planet_fuel)/$PLAYER~TOTAL_HOLDS)
						add $totalFuelHolds ($PLANET~planet_fuel_max-$PLANET~planet_fuel)
						setVar $isDone TRUE
					else
						setVar $turnsToEmpty ($totalPortFuel/$PLAYER~TOTAL_HOLDS)
						add $totalFuelHolds $totalPortFuel
					end
					setVar $PLAYER~buyobject "f"
					if ($best = true)
						setVar $PLAYER~buytype "b"
					elseif ($worst = true)
						setVar $PLAYER~buytype "w"
					else
						setVar $PLAYER~buytype "s"
					end
					setVar $PLAYER~buydownRoundsFromParam $turnsToEmpty
					gosub :PLAYER~buy
					gosub :PLAYER~quikstats
					send "c r*q "
					
					add $spentCredits $PLAYER~credits_spent

					if ($PLAYER~exit_message <> "Normal Exit")
						setVar $SWITCHBOARD~message $PLAYER~exit_message&"*"
						gosub :SWITCHBOARD~switchboard
						goto :donePATP
					end
					if (($PLAYER~unlimitedGame = FALSE) AND (($PLAYER~turns-$turnsToEmpty) <= $BOT~bot_turn_limit))
						setVar $turnsTooLow TRUE
						goto :donePATP
					end
				end


				if ($buy_organics = true)
					if (($planet~planet_equipment_max-$planet~planet_equipment) < $totalPortEquip)
						setVar $turnsToEmpty (($planet~planet_equipment_max-$planet~planet_equipment)/$PLAYER~TOTAL_HOLDS)
						add $totalOrgHolds ($planet~planet_equipment_max-$planet~planet_equipment)
						setVar $isDone TRUE
					else
						setVar $turnsToEmpty ($totalPortEquip/$PLAYER~TOTAL_HOLDS)
						add $totalOrgHolds $totalPortEquip
					end
					setVar $PLAYER~buyobject "o"
					if ($best = true)
						setVar $PLAYER~buytype "b"
					elseif ($worst = true)
						setVar $PLAYER~buytype "w"
					else
						setVar $PLAYER~buytype "s"
					end
					setVar $PLAYER~buydownRoundsFromParam $turnsToEmpty
					gosub :PLAYER~buy
					gosub :PLAYER~quikstats
					send "c r*q "
					
					add $spentCredits $PLAYER~credits_spent

					if ($PLAYER~exit_message <> "Normal Exit")
						setVar $SWITCHBOARD~message $PLAYER~exit_message&"*"
						gosub :SWITCHBOARD~switchboard
						goto :donePATP
					end
					if (($PLAYER~unlimitedGame = FALSE) AND (($PLAYER~turns-$turnsToEmpty) <= $BOT~bot_turn_limit))
						setVar $turnsTooLow TRUE
						goto :donePATP
					end
				end

				if ($buy_equipment = true)
					if (($planet~planet_equipment_max-$planet~planet_equipment) < $totalPortEquip)
						setVar $turnsToEmpty (($planet~planet_equipment_max-$planet~planet_equipment)/$PLAYER~TOTAL_HOLDS)
						add $totalEquipHolds ($planet~planet_equipment_max-$planet~planet_equipment)
						setVar $isDone TRUE
					else
						setVar $turnsToEmpty ($totalPortEquip/$PLAYER~TOTAL_HOLDS)
						add $totalEquipHolds $totalPortEquip
					end
					setVar $PLAYER~buyobject "e"
					if ($best = true)
						setVar $PLAYER~buytype "b"
					elseif ($worst = true)
						setVar $PLAYER~buytype "w"
					else
						setVar $PLAYER~buytype "s"
					end
					setVar $PLAYER~buydownRoundsFromParam $turnsToEmpty
					gosub :PLAYER~buy
					gosub :PLAYER~quikstats
					send "c r*q "
					
					add $spentCredits $PLAYER~credits_spent
	
					if ($PLAYER~exit_message <> "Normal Exit")
						setVar $SWITCHBOARD~message $PLAYER~exit_message&"*"
						gosub :SWITCHBOARD~switchboard
						goto :donePATP
					end
					if (($PLAYER~unlimitedGame = FALSE) AND (($PLAYER~turns-$turnsToEmpty) <= $BOT~bot_turn_limit))
						setVar $turnsTooLow TRUE
						goto :donePATP
					end
				end

				if ($buyHalf)
					setVar $SWITCHBOARD~message "Port half emptied in sector "&$NearFig&".*"
					gosub :SWITCHBOARD~switchboard
				else
					setVar $SWITCHBOARD~message "Port emptied in sector "&$NearFig&".*"
					gosub :SWITCHBOARD~switchboard
				end
				gosub :PLAYER~quikstats
				if ((($PLAYER~TURNS < 50) AND ($PLAYER~unlimitedGame = FALSE)))
					goto :donePATP
				end
				if ($destroyPorts)
					send "q q "
					:keepDestroying
						killalltriggers
						gosub :PLAYER~quikstats
					if ($PLAYER~FIGHTERS > $SHIP~maxFigAttack)
						send "p"
						setTextTrigger portAlreadyGone :doneDestroying "Captain! Are you sure you want to port here?"
						setTextTrigger portHere :continueDestroy "<A> Attack this Port"
						pause
						:continueDestroy
						killalltriggers
						send " a y "&$SHIP~maxFigAttack&"*l "&$PLANET~planet&"* m * * * q "
						setTextTrigger notDestroyed :keepDestroying "Incoming laser barrage from"
						setTextTrigger DestoryedPort :doneDestroying "You destroyed the Star Port!"
						pause
						:doneDestroying
							killalltriggers
							send "*"
							setVar $SWITCHBOARD~message "Port destroyed in sector "&$player~current_sector&".*"
							gosub :SWITCHBOARD~switchboard
							gosub :PLAYER~quikstats
					end
					send "c r*q "
					gosub :landOnPlanetEnterCitadel
				end
			end
			if (($PLAYER~CREDITS + $PLANET~citadel_credits) < 1000000)
				setVar $isDone TRUE
			end
			:tryAgain
			if (($PLAYER~turns < 50) AND ($PLAYER~unlimitedGame <> TRUE))
				setVar $isDone TRUE
			end
	end
	:donePATP
	send "p"&$startingSector&"*y"
	setVar $formattedSpentCredits ""
	getLength $spentCredits $length
	while ($length > 3)
		cutText $spentCredits $snippet $length-2 9999
		cutText $spentCredits $spentCredits 1 $length-3
		getLength $spentCredits $length
		setVar $formattedSpentCredits ","&$snippet&$formattedSpentCredits
	end
	setVar $formattedSpentCredits $spentCredits&$formattedSpentCredits
	
	setVar $formattedFuelHolds ""
	getLength $totalFuelHolds $length
	while ($length > 3)
		cutText $totalFuelHolds $snippet $length-2 9999
		cutText $totalFuelHolds $totalFuelHolds 1 $length-3
		getLength $totalFuelHolds $length
		setVar $formattedFuelHolds ","&$snippet&$formattedFuelHolds
	end
	setVar $formattedFuelHolds $totalFuelHolds&$formattedFuelHolds
	
	setVar $formattedOrgHolds ""
	getLength $totalOrgHolds $length
	while ($length > 3)
		cutText $totalOrgHolds $snippet $length-2 9999
		cutText $totalOrgHolds $totalOrgHolds 1 $length-3
		getLength $totalOrgHolds $length
		setVar $formattedOrgHolds ","&$snippet&$formattedOrgHolds
	end
	setVar $formattedOrgHolds $totalOrgHolds&$formattedOrgHolds
	
	setVar $formattedEquipHolds ""
	getLength $totalEquipHolds $length
	while ($length > 3)
		cutText $totalEquipHolds $snippet $length-2 9999
		cutText $totalEquipHolds $totalEquipHolds 1 $length-3
		getLength $totalEquipHolds $length
		setVar $formattedEquipHolds ","&$snippet&$formattedEquipHolds
	end
	setVar $formattedEquipHolds $totalEquipHolds&$formattedEquipHolds

	

	setvar $message "'*{"&$SWITCHBOARD~bot_name&"} Pay At The Pump - Completion Report {"&$SWITCHBOARD~bot_name&"}*"
	if ($buy_fuel = true)
		setvar $message $message&$formattedFuelHolds&" total holds of fuel ore purchased.*"
	end
	if ($buy_organics = true)
		setvar $message $message&$formattedOrgHolds&" total holds of organics purchased.*"
	end
	if ($buy_equipment = true)
		setvar $message $message&$formattedEquipHolds&" total holds of equipment purchased.*"
	end
	setvar $message $message&"Credits spent: "&$formattedSpentCredits&" credits*"	
	
	if (($PLAYER~credits+$PLANET~citadel_credits) < 1000000)
		setvar $message $message&"  Credits are below 1,000,000.*"
	end
	if ($turnsTooLow)
		setvar $message $message&"  Low on turns! (Turns: "&$PLAYER~TURNS&")*"			
	end
	if ($PLANET~PLANET_fuel >= ($PLANET~PLANET_fuel_max-2000))
		setvar $message $message&"  Planet "&$PLANET~PLANET&" is full.*"
	end
	setvar $message $message&"{"&$SWITCHBOARD~bot_name&"} Pay At The Pump - Completion Report {"&$SWITCHBOARD~bot_name&"}**"
	send $message
	halt





:noFigAtLocation
	setSectorParameter $NearFig "FIGSEC" FALSE
	goto :tryAgain2


#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"