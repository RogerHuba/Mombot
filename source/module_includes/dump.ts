:dump
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Planet") AND ($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
		setVar $SWITCHBOARD~message "Planet Dumper must be started from Command, Planet, or Citadel prompt*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($startingLocation = "Citadel")
		send "q "
	end
	if (($startingLocation = "Citadel") OR ($startingLocation = "Planet"))
		gosub :PLANET~getPlanetInfo
		setVar $startingPlanet $PLANET~PLANET
		send "q "
	end
	
	isNumber $test $BOT~parm2
	if (($test = FALSE) AND ($BOT~parm2 <> "all"))
		setVar $SWITCHBOARD~message "Invalid planet. Please enter a planet number or 'all'.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	getWordPos " "&$BOT~user_command_line&" " $pos " f "
	if ($pos > 0)
		setVar $emptyFuel TRUE
	else
		setVar $emptyFuel FALSE
	end
	getWordPos " "&$BOT~user_command_line&" " $pos " o "
	if ($pos > 0)
		setVar $emptyOrganics TRUE
	else
		setVar $emptyOrganics FALSE
	end
	getWordPos " "&$BOT~user_command_line&" " $pos " e "
	if ($pos > 0)
		setVar $emptyEquipment TRUE
	else
		setVar $emptyEquipment FALSE
	end
	
	getWordPos " "&$BOT~user_command_line&" " $pos " c1 "
	if ($pos > 0)
		setVar $emptyFuelColonists TRUE
	end
	getWordPos " "&$BOT~user_command_line&" " $pos " c2 "
	if ($pos > 0)
		setVar $emptyOrganicColonists TRUE
	end
	getWordPos " "&$BOT~user_command_line&" " $pos " c3 "
	if ($pos > 0)
		setVar $emptyEquipmentColonists TRUE
	end
	getWordPos " "&$BOT~user_command_line&" " $pos " fc "
	if ($pos > 0)
		setVar $emptyFuelColonists TRUE
	end
	getWordPos " "&$BOT~user_command_line&" " $pos " oc "
	if ($pos > 0)
		setVar $emptyOrganicColonists TRUE
	end
	getWordPos " "&$BOT~user_command_line&" " $pos " ec "
	if ($pos > 0)
		setVar $emptyEquipmentColonists TRUE
	end
	getWordPos " "&$BOT~user_command_line&" " $pos " turbo "
	if ($pos > 0)
		setVar $turbo TRUE
	else
		setVar $turbo FALSE
	end

	getWordPos " "&$BOT~user_command_line&" " $pos " silent "
	if ($pos > 0)
		setVar $SWITCHBOARD~self_command TRUE
	end
	
	send "jy* * "
	gosub :PLAYER~quikstats

	setVar $total_holds $PLAYER~TOTAL_HOLDS

	if (SECTOR.PLANETCOUNT[$PLAYER~CURRENT_SECTOR] <= 0)
		setVar $SWITCHBOARD~message "This script must be run with at least one planets in the sector*"
		gosub :SWITCHBOARD~switchboard
		if (($startingLocation = "Citadel") OR ($startingLocation = "Planet"))
			send "l "&$startingPlanet&"* "
		end
		if ($startingLocation = "Citadel")
			send "c "
		end
		halt
	end
	gosub :countPlanets

:startUpMessage
	if ($BOT~parm2 <> "all")
		setVar $planetCount 1
		setVar $planets[1] $BOT~parm2
	end
	setVar $SWITCHBOARD~message "Planet Dumper Powering Up!*"
	gosub :SWITCHBOARD~switchboard
	
:startFilling
	setVar $i 1
	setVar $countFuel 0
	setVar $countOrganics 0
	setVar $countEquipment 0
	setVar $countColonists 0

	while ($i <= $planetCount)
			gosub :PLAYER~quikstats
			send "l "&$planets[$i]&"*   "
			gosub :PLANET~getPlanetInfo
			send " q "

			if ($emptyFuel)
				setVar $amount_to_strip $PLANET~PLANET_FUEL
				setVar $category 1
				setVar $type "t"
				gosub :stripCategory
				add $countFuel $count
			end
			if ($emptyOrganics)
				setVar $amount_to_strip $PLANET~PLANET_ORGANICS
				setVar $category 2
				setVar $type "t"
				gosub :stripCategory
				add $countOrganics $count
			end
			if ($emptyEquipment)
				setVar $amount_to_strip $PLANET~PLANET_EQUIPMENT
				setVar $category 3
				setVar $type "t"
				gosub :stripCategory
				add $countEquipment $count
			end
			if ($emptyFuelColonists)
				setVar $amount_to_strip $PLANET~PLANET_FUEL_COLONISTS
				setVar $category 1
				setVar $type "s"
				gosub :stripCategory
				add $countColonists $count
			end
			if ($emptyOrganicColonists)
				setVar $amount_to_strip $PLANET~PLANET_ORGANICS_COLONISTS
				setVar $category 2
				setVar $type "s"
				gosub :stripCategory
				add $countColonists $count
			end
			if ($emptyEquipmentColonists)
				setVar $amount_to_strip $PLANET~PLANET_EQUIPMENT_COLONISTS
				setVar $category 3
				setVar $type "s"
				gosub :stripCategory
				add $countColonists $count
			end

			:doneWithThisPlanet         
		add $i 1
	end
	:lookUpPlanetStats2
		gosub :PLAYER~quikstats
		if (($startingLocation = "Citadel") OR ($startingLocation = "Planet"))
			send "l "&$startingPlanet&"* "
		end
		if ($startingLocation = "Citadel")
			send "c "
		end
		gosub :endReport
		send "/"
		waitOn #179
		setVar $SWITCHBOARD~message "Planet Dumper Shutting Down*"
		gosub :SWITCHBOARD~switchboard
return
		halt

:clearScreen
	echo #27 & "[2J"
	return

:stripCategory
	setVar $PLAYER~TURNS ($PLAYER~TURNS-1)
	setVar $count 0 
	setVar $loop 0
	:again
		killtrigger success
		killtrigger empty
		killtrigger full
		killtrigger success_colos
		killtrigger empty_colos

		if ($PLAYER~TURNS <= $BOT~bot_turn_limit)
			goto :lookUpPlanetStats2
		end
		if (($PLAYER~total_holds > $amount_to_strip) AND ($amount_to_strip > 0))
			setVar $get $amount_to_strip
		else
			if ($amount_to_strip <= 0)
				setVar $get 0
			else
				setVar $get $PLAYER~total_holds
			end
		end
		add $count $get
		setVar $amount_to_strip ($amount_to_strip - $get)
		if ($get <= 0)
			goto :done
		end
		setVar $macro "l j"&#8&$planets[$i]&"* j"&$type&"* jt"&$category&$get&"* x q jy"

		

		if (($turbo = FALSE) OR (($turbo = TRUE) AND ($loop >= 20)))
			if ($turbo)
				send "/"
				waitOn " Sect "
			end
			send $macro
			setVar $loop 0
			setTextTrigger success       :again    "Are you sure you want to jettison all cargo? (Y/N)"             
			setTextTrigger empty         :done     "There aren't that many "
			pause
		else
			send $macro
		end
		if ($turbo)
			add $loop 1
			goto :again
		end
	:empty
		send "jy "
	:done
		killtrigger success
		killtrigger empty
		killtrigger full
		killtrigger success_colos
		killtrigger empty_colos
return


:countPlanets

	setVar $planetCount 0
	killalltriggers
	setTextLineTrigger planetGrabber :planetline "   <"
	setTextLineTrigger beDone :done "Land on which planet "
	send "lq*"
	pause
	:planetline
		killalltriggers
		getWordPos CURRENTLINE $pos "<<<< SHIELDED"
		if ($pos <= 0)
			setVar $line CURRENTLINE
			replacetext $line "<" " "
			replacetext $line ">" " "
			striptext $line ","
			add $planetCount 1
			getWord $line $planets[$planetCount] 1
		end
		setTextLineTrigger getLine2 :planetline "   <"
		setTextLineTrigger getEnd :done "Land on which planet "
		pause
	:done
return



:endReport
	setVar $formattedCountFuel ""
	getLength $countFuel $length
	while ($length > 3)
		cutText $countFuel $snippet $length-2 9999
		cutText $countFuel $countFuel 1 $length-3
		getLength $countFuel $length
		setVar $formattedCountFuel ","&$snippet&$formattedCountFuel
	end
	setVar $formattedCountFuel $countFuel&$formattedCountFuel
	
	setVar $formattedCountOrganics ""
	getLength $countOrganics $length
	while ($length > 3)
		cutText $countOrganics $snippet $length-2 9999
		cutText $countOrganics $countOrganics 1 $length-3
		getLength $countOrganics $length
		setVar $formattedCountOrganics ","&$snippet&$formattedCountOrganics
	end
	setVar $formattedCountOrganics $countOrganics&$formattedCountOrganics
	
	setVar $formattedCountEquipment ""
	getLength $countEquipment $length
	while ($length > 3)
		cutText $countEquipment $snippet $length-2 9999
		cutText $countEquipment $countEquipment 1 $length-3
		getLength $countEquipment $length
		setVar $formattedCountEquipment ","&$snippet&$formattedCountEquipment
	end
	setVar $formattedCountEquipment $countEquipment&$formattedCountEquipment
	
	setVar $formattedCountColonists ""
	getLength $countColonists $length
	while ($length > 3)
		cutText $countColonists $snippet $length-2 9999
		cutText $countColonists $countColonists 1 $length-3
		getLength $countColonists $length
		setVar $formattedCountColonists ","&$snippet&$formattedCountColonists
	end
	setVar $formattedCountColonists $countColonists&$formattedCountColonists
	
	setVar $SWITCHBOARD~message "Planet Dumper - Completion Report*"    
	if ($emptyFuel)
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  Fuel Ore Jettisoned: "&$formattedCountFuel&" Holds*"
	end
	if ($emptyOrganics)
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  Organics Jettisoned: "&$formattedCountOrganics&" Holds*"
	end
	if ($emptyEquipment)
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  Equipment Jettisoned: "&$formattedCountEquipment&" Holds*"
	end
	if ($emptyFuelColonists OR $emptyOrganicColonists OR $emptyEquipmentColonists)
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  Colonists Jettisoned: "&$formattedCountColonists&" Holds*"
	end
	if ($emptyFighters)
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  All possible fighters stripped and placed on planet*"
	end
	if ($PLAYER~unlimitedGame <> TRUE)
		if ($PLAYER~TURNS <= $BOT~bot_turn_limit)
			setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  Turns too low to continue. (Turn limit: "&$BOT~bot_turn_limit&"*"
		end
	end
	if ($SWITCHBOARD~self_command <> TRUE)
		setVar $SWITCHBOARD~self_command 2
	end
	gosub :SWITCHBOARD~switchboard
return

