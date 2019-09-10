:strip
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Planet"))
		setVar $SWITCHBOARD~message "Planet Stripper must be started from Citadel or Planet prompt*"
		gosub :SWITCHBOARD~switchboard
		halt
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

	getWordPos " "&$BOT~user_command_line&" " $pos " fig "
	if ($pos > 0)
		setVar $emptyFighters TRUE
	else
		setVar $emptyFighters FALSE
	end

	getWordPos " "&$BOT~user_command_line&" " $pos " sh"
	if ($pos > 0)
		setVar $emptyShields TRUE
	else
		setVar $emptyShields FALSE
	end
	getWordPos " "&$BOT~user_command_line&" " $pos " silent "
	if ($pos > 0)
		setVar $SWITCHBOARD~self_command TRUE
	end
	
	if ($startingLocation = "Citadel")
		send "q "
	end
	gosub :PLANET~getPlanetInfo
	send "q ** jy "
	gosub :PLAYER~quikstats

	setVar $total_holds $PLAYER~TOTAL_HOLDS

	if (SECTOR.PLANETCOUNT[$PLAYER~CURRENT_SECTOR] <= 1)
		setVar $SWITCHBOARD~message "This script must be run with at least two planets in the sector*"
		gosub :SWITCHBOARD~switchboard
		send "l "&$PLANET~planet&"* "
		if ($startingLocation = "Citadel")
			send "c "
		end
		halt
	end
	gosub :countPlanets

:startUpMessage
	setVar $planetToFill $PLANET~PLANET
	if ($BOT~parm2 <> "all")
		setVar $planetCount 1
		setVar $planets[1] $BOT~parm2
	end
	setVar $SWITCHBOARD~message "Planet Stripper Powering Up!  Filling Planet "&$planetToFill&"*"
	gosub :SWITCHBOARD~switchboard
	
:startFilling
	setVar $i 1
	setVar $countFuel 0
	setVar $countOrganics 0
	setVar $countEquipment 0
	setVar $countColonists 0
	:lookUpPlanetStats
		send "l "&$planetToFill&"*"
		killtrigger wrongPlanet
		killtrigger badPlanet
		killtrigger goodPlanet
		setTextLineTrigger wrongPlanet :badPlanet "That planet is not in this sector."
		setTextLineTrigger badPlanet :badPlanet "Invalid registry number, landing aborted."
		setTextLineTrigger goodPlanet :goodPlanet "Claimed by:"
		pause
	:badPlanet
		killtrigger wrongPlanet
		killtrigger badPlanet
		killtrigger goodPlanet
		send "q*"
		setVar $SWITCHBOARD~message "Planet #"&$planetToFill&" is not valid for this sector*"
		gosub :SWITCHBOARD~switchboard
		halt    
	:goodPlanet
		killtrigger wrongPlanet
		killtrigger badPlanet
		if ($emptyFighters)
			send "m*l* "
		end
		send " q "

	while ($i <= $planetCount)
		if ($planetToFill <> $planets[$i])
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

			:tryFighters
				if ($emptyFighters)
					killtrigger success
					killtrigger emptyEmpty
					killtrigger fullFill
					killtrigger empty
					send "l j"&#8&$planets[$i]&"* jm ** *x q l j"&#8&$planetToFill&"* jm*jl*x q "
					setTextTrigger success :tryFighters "The Fighters join your battle force."
					setTextTrigger emptyEmpty :doneWithThisPlanet "There isn't room on the planet"
					setTextTrigger fullFill :doneWithThisPlanet "They don't have room for that many "
					setTextTrigger empty :doneWithThisPlanet "How many Fighters do you want to take (0 Max) [0]"
					pause
				end
				:doneWithThisPlanet         
		end
		add $i 1
	end
	:lookUpPlanetStats2
		gosub :PLAYER~quikstats
		send "l "&$planetToFill&"*jm ** * "
		killAllTriggers
		setTextLineTrigger wrongPlanet :badPlanet2 "That planet is not in this sector."
		setTextLineTrigger badPlanet :badPlanet2 "Invalid registry number, landing aborted."
		setTextLineTrigger goodPlanet :goodPlanet2 "Claimed by:"
		pause
	:badPlanet2
		killAllTriggers
		send "q*"
		setVar $SWITCHBOARD~message "Planet #"&$planetToFill&" is not valid for this sector*"
		gosub :SWITCHBOARD~switchboard
		halt    
	:goodPlanet2
		killAllTriggers
		send "q "
		send "l "&$planetToFill&"*m* * * c * "
		gosub :endReport
		send "/"
		waitOn #179
		setVar $SWITCHBOARD~message "Planet Stripper Shutting Down*"
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
		setVar $macro "l j"&#8&$planets[$i]&"* j"&$type&"* jt"&$category&$get&"* x q l j"&#8&$planetToFill&"* j"&$type&"* jl"&$category&"* x q "

		

		if (($turbo = FALSE) OR (($turbo = TRUE) AND ($loop >= 20)))
			if ($turbo)
				send "/"
				waitOn " Sect "
			end
			send $macro
			setVar $loop 0
			setTextTrigger success       :again    "You load the "              
			setTextTrigger empty         :done     "There aren't that many "
			setTextTrigger full          :empty    "They don't have room for that many "
			setTextTrigger success_colos :again    "The Colonists disembark to "
			setTextTrigger empty_colos   :switch    "There isn't room on the planet"
			pause
			:switch
			add $category 1
			if ($category >= 4)
				goto :again
			end         
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
	
	setVar $SWITCHBOARD~message "Planet Stripper - Completion Report*"  
	if ($emptyFuel)
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  Fuel Ore  Moved: "&$formattedCountFuel&" Holds*"
	end
	if ($emptyOrganics)
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  Organics  Moved: "&$formattedCountOrganics&" Holds*"
	end
	if ($emptyEquipment)
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  Equipment Moved: "&$formattedCountEquipment&" Holds*"
	end
	if ($emptyFuelColonists OR $emptyOrganicColonists OR $emptyEquipmentColonists)
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  Colonists Moved: "&$formattedCountColonists&" Holds*"
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

include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
