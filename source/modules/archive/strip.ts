# MD Planet Stripper
	reqRecording
	logging off
	gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&"Strips planets of resources and places them on starting planet.  "
	setVar $BOT~help[2]  $BOT~tab&" "
	setVar $BOT~help[3]  $BOT~tab&"Options:"
	setVar $BOT~help[4]  $BOT~tab&"[planet# | all] - Planet number or all to strip all planets in sector."
	setVar $BOT~help[5]  $BOT~tab&"            {f} - Strip fuel ore"
	setVar $BOT~help[6]  $BOT~tab&"            {o} - Strip organics"
	setVar $BOT~help[7]  $BOT~tab&"            {e} - Strip equipment"
	setVar $BOT~help[8]  $BOT~tab&"           {fc} - Strip fuel ore colonists"
	setVar $BOT~help[9]  $BOT~tab&"           {oc} - Strip organic colonists"
	setVar $BOT~help[10] $BOT~tab&"           {ec} - Strip equipment colonists"
	setVar $BOT~help[11] $BOT~tab&"          {fig} - Strip fighters"
	gosub :bot~helpfile


	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Planet"))
		setVar $SWITCHBOARD~message "Planet Stripper must be started from Citadel or Planet prompt*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	isNumber $test $parm1
	if (($test = FALSE) AND ($parm1 <> "all"))
		setVar $SWITCHBOARD~message "Invalid planet. Please enter a planet number or 'all'.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	getWordPos " "&$user_command_line&" " $pos " f "
	if ($pos > 0)
		setVar $emptyFuel TRUE
	else
		setVar $emptyFuel FALSE
	end
	getWordPos " "&$user_command_line&" " $pos " o "
	if ($pos > 0)
		setVar $emptyOrganics TRUE
	else
		setVar $emptyOrganics FALSE
	end
	getWordPos " "&$user_command_line&" " $pos " e "
	if ($pos > 0)
		setVar $emptyEquipment TRUE
	else
		setVar $emptyEquipment FALSE
	end
	
	getWordPos " "&$user_command_line&" " $pos " c1 "
	if ($pos > 0)
		setVar $emptyFuelColonists TRUE
	else
		setVar $emptyFuelColonists FALSE
	end
	getWordPos " "&$user_command_line&" " $pos " c2 "
	if ($pos > 0)
		setVar $emptyOrganicColonists TRUE
	else
		setVar $emptyOrganicColonists FALSE
	end
	getWordPos " "&$user_command_line&" " $pos " c3 "
	if ($pos > 0)
		setVar $emptyEquipmentColonists TRUE
	else
		setVar $emptyEquipmentColonists FALSE
	end
	getWordPos " "&$user_command_line&" " $pos " fc "
	if ($pos > 0)
		setVar $emptyFuelColonists TRUE
	else
		setVar $emptyFuelColonists FALSE
	end
	getWordPos " "&$user_command_line&" " $pos " oc "
	if ($pos > 0)
		setVar $emptyOrganicColonists TRUE
	else
		setVar $emptyOrganicColonists FALSE
	end
	getWordPos " "&$user_command_line&" " $pos " ec "
	if ($pos > 0)
		setVar $emptyEquipmentColonists TRUE
	else
		setVar $emptyEquipmentColonists FALSE
	end

	getWordPos " "&$user_command_line&" " $pos " fig "
	if ($pos > 0)
		setVar $emptyFighters TRUE
	else
		setVar $emptyFighters FALSE
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
	if ($parm1 <> "all")
		setVar $planetCount 1
		setVar $planets[1] $parm1
	end
	setVar $SWITCHBOARD~message "Planet Stripper Powering Up!  Filling Planet "&$planetToFill&"*"
	gosub :SWITCHBOARD~switchboard
	
:startFilling
	setVar $i 1
	setVar $countFuel 0
	setVar $countOrganics 0
	setVar $countEquipment 0
	setVar $countColonists 0
	setVar $coloType 1
	:lookUpPlanetStats
		send "l "&$planetToFill&"*"
		killAllTriggers
		setTextLineTrigger wrongPlanet :badPlanet "That planet is not in this sector."
		setTextLineTrigger badPlanet :badPlanet "Invalid registry number, landing aborted."
		setTextLineTrigger goodPlanet :goodPlanet "Claimed by:"
		pause
	:badPlanet
		killAllTriggers
		send "q*"
		setVar $SWITCHBOARD~message "Planet #"&$planetToFill&" is not valid for this sector*"
		gosub :SWITCHBOARD~switchboard
		halt	
	:goodPlanet
		killAllTriggers
		waiton "Fuel Ore"
		getWord CURRENTLINE $currentFuelColos 3
		stripText $currentFuelColos ","
		setVar $currentFuel $PLANET~PLANET_FUEL
		waiton "Organics"
		getWord CURRENTLINE $currentOrganicColos 2
		stripText $currentOrganicColos ","
		setVar $currentOrganics $PLANET~PLANET_ORGANICS
		waiton "Equipment"
		getWord CURRENTLINE $currentEquipmentColos 2
		stripText $currentEquipmentColos ","
		setVar $currentEquipment $PLANET~PLANET_EQUIPMENT
		if ($emptyFighters)
			send "m*l* "
		end
		send " q "

	while ($i <= $planetCount)
		if ($planetToFill <> $planets[$i])
			send "l "&$planets[$i]&"*  "
			gosub :PLANET~getPlanetInfo
			send " q "
			setVar $currentFuelColos $PLANET~PLANET_FUEL_COLONISTS
			setVar $currentFuel $PLANET~PLANET_FUEL
			setVar $currentOrganicColos $PLANET~PLANET_ORGANICS_COLONISTS
			setVar $currentOrganics $PLANET~PLANET_ORGANICS
			setVar $currentEquipmentColos $PLANET~PLANET_EQUIPMENT_COLONISTS
			setVar $currentEquipment $PLANET~PLANET_EQUIPMENT

			:tryFuel
				setVar $PLAYER~TURNS ($PLAYER~TURNS-1)
				killAllTriggers
				if ($PLAYER~TURNS <= $BOT~bot_turn_limit)
					:lookUpPlanetStats2
				end
				if ($emptyFuel)
					if (($total_holds > $currentFuel) AND ($currentFuel > 0))
						setVar $get $currentFuel
					else
						if ($currentFuel <= 0)
							setVar $get 0
						else
							setVar $get $total_holds
						end
					end
					add $countFuel $get
					setVar $currentFuel ($currentFuel - $get)
					if ($get <= 0)
						goto :tryOrganics
					end
					send "l j"&#8&$planets[$i]&"* jt*jt1"&$get&"* x q l j"&#8&$planetToFill&"* jt*jl1* x q "
					setTextTrigger fuelSuccess :tryFuel "You load the "				
					setTextTrigger fuelEmpty :tryOrganics "There aren't that many "
					setTextTrigger fuelFull :emptyFuel "They don't have room for that many "
					pause
				end
			:emptyFuel
				send "jy "
			:tryOrganics
				setVar $PLAYER~TURNS ($PLAYER~TURNS-1)
				killAllTriggers
				if ($PLAYER~TURNS <= $BOT~bot_turn_limit)
					:lookUpPlanetStats2
				end
				if ($emptyOrganics)
					if (($total_holds > $currentOrganics) AND ($currentOrganics > 0))
						setVar $get $currentOrganics
					else
						if ($currentOrganics <= 0)
							setVar $get 0
						else
							setVar $get $total_holds
						end
					end
					add $countOrganics $get
					setVar $currentOrganics ($currentOrganics - $get)
					if ($get <= 0)
						goto :tryEquipment
					end
					send "l j"&#8&$planets[$i]&"* jt*jt2"&$get&"* x q l j"&#8&$planetToFill&"* jt*jl2* x q "
					setTextTrigger success :tryOrganics "You load the "
					setTextTrigger emptyEmpty :tryEquipment "There aren't that many "
					setTextTrigger fullFill :emptyOrganics "They don't have room for that many "
					pause
				end
			:emptyOrganics
				send "jy "
			:tryEquipment
				setVar $PLAYER~TURNS ($PLAYER~TURNS-1)
				killAllTriggers
				if ($PLAYER~TURNS <= $BOT~bot_turn_limit)
					:lookUpPlanetStats2
				end
				if ($emptyEquipment)
					if (($total_holds > $currentEquipment) AND ($currentEquipment > 0))
						setVar $get $currentEquipment
					else
						if ($currentEquipment <= 0)
							setVar $get 0
						else
							setVar $get $total_holds
						end
					end
					add $countEquipment $get
					setVar $currentEquipment ($currentEquipment - $get)
					if ($get <= 0)
						goto :tryFuelColonists
					end
					send "l j"&#8&$planets[$i]&"* jt*jt3"&$get&"* x q l j"&#8&$planetToFill&"* jt*jl3* x q "
					setTextTrigger success :tryEquipment "You load the "
					setTextTrigger emptyEmpty :tryFuelColonists "There aren't that many "
					setTextTrigger fullFill :emptyEquipment "They don't have room for that many "
					pause
				end
			:emptyEquipment
				send "jy "
			:tryFuelColonists
				setVar $PLAYER~TURNS ($PLAYER~TURNS-1)
				killAllTriggers
				if ($PLAYER~TURNS <= $BOT~bot_turn_limit)
					:lookUpPlanetStats2
				end
				if ($emptyFuelColonists)
					if (($total_holds > $currentFuelColos) AND ($currentFuelColos > 0))
						setVar $get $currentFuelColos
					else
						if ($currentFuelColos <= 0)
							setVar $get 0
						else
							setVar $get $total_holds
						end
					end
					add $countColonists $get
					setVar $currentFuelColos ($currentFuelColos - $get)
					if ($get <= 0)
						goto :tryOrganicColonists
					end
					send "l j"&#8&$planets[$i]&"* js*jt1"&$get&"* x q l j"&#8&$planetToFill&"* js*jl"&$coloType&"* x q "
					setTextTrigger success :tryFuelColonists "The Colonists disembark to "
					setTextTrigger emptyEmpty :switchFuel "There isn't room on the planet"
					setTextTrigger fullFill :tryOrganicColonists "They don't have room for that many "
					setTextTrigger empty :emptyFColonists  "There aren't that many on the planet!"
					pause
					:switchFuel
						killAllTriggers
						add $coloType 1
						if ($coloType >= 4)
							goto :doneWithThisPlanet
						end
						goto :tryFuelColonists
				end
			:emptyFColonists
				send "jy "
			:tryOrganicColonists
				setVar $PLAYER~TURNS ($PLAYER~TURNS-1)
				killAllTriggers
				if ($PLAYER~TURNS <= $BOT~bot_turn_limit)
					:lookUpPlanetStats2
				end
				if ($emptyOrganicColonists)
					if (($total_holds > $currentOrganicColos) AND ($currentOrganicColos > 0))
						setVar $get $currentOrganicColos
					else
						if ($currentOrganicColos <= 0)
							setVar $get 0
						else
							setVar $get $total_holds
						end
					end
					add $countColonists $get
					setVar $currentOrganicColos ($currentOrganicColos - $get)
					if ($get <= 0)
						goto :tryEquipmentColonists
					end
					send "l j"&#8&$planets[$i]&"* js*jt2* x q l j"&#8&$planetToFill&"* js*jl"&$coloType&"* x q "
					setTextTrigger success :tryOrganicColonists "The Colonists disembark to "
					setTextTrigger emptyEmpty :switchOrganics "There isn't room on the planet"
					setTextTrigger fullFill :tryEquipmentColonists "They don't have room for that many "
					setTextTrigger empty :emptyOColonists "There aren't that many on the planet!"
					pause
					:switchOrganics
						killAllTriggers
						add $coloType 1
						if ($coloType >= 4)
							goto :doneWithThisPlanet
						end
						goto :tryOrganicColonists
				end
			:emptyOColonists
				send "jy "
			:tryEquipmentColonists
				setVar $PLAYER~TURNS ($PLAYER~TURNS-1)
				killAllTriggers
				if ($PLAYER~TURNS <= $BOT~bot_turn_limit)
					:lookUpPlanetStats2
				end
				if ($emptyEquipmentColonists)
					if (($total_holds > $currentEquipmentColos) AND ($currentEquipmentColos > 0))
						setVar $get $currentEquipmentColos
					else
						if ($currentEquipmentColos <= 0)
							setVar $get 0
						else
							setVar $get $total_holds
						end
					end
					add $countColonists $get
					setVar $currentEquipmentColos ($currentEquipmentColos - $get)
					if ($get <= 0)
						goto :tryFighters
					end
					send "l j"&#8&$planets[$i]&"* js*jt3* x q l j"&#8&$planetToFill&"* js*jl"&$coloType&"* x q "
					setTextTrigger success :tryEquipmentColonists "The Colonists disembark to "
					setTextTrigger emptyEmpty :switchEquipment "There isn't room on the planet"
					setTextTrigger fullFill :tryFighters "They don't have room for that many "
					setTextTrigger empty :emptyEquipmentColonists "There aren't that many on the planet!"
					pause
					:switchEquipment
						killAllTriggers
						add $coloType 1
						if ($coloType >= 4)
							goto :doneWithThisPlanet
						end
						goto :tryFighters
				end
			:emptyEquipmentColonists
				send "jy "
			:tryFighters
					killAllTriggers
					if ($emptyFighters)
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
		send "l "&$planetToFill&"*"
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
		waiton "Fuel Ore"
		getWord CURRENTLINE $newFuelColos 3
		stripText $newFuelColos ","
		getWord CURRENTLINE $newFuel 6
		stripText $newFuel ","
		waiton "Organics"
		getWord CURRENTLINE $newOrganicColos 2
		stripText $newOrganicColos ","
		getWord CURRENTLINE $newOrganics 5
		stripText $newOrganics ","
		waiton "Equipment"
		getWord CURRENTLINE $newEquipmentColos 2
		stripText $newEquipmentColos ","
		getWord CURRENTLINE $newEquipment 5
		stripText $newEquipment ","
		
		send "q "
	send "l "&$planetToFill&"*m* * * c * "
	gosub :endReport
	send "/"
	waitOn #179
	setVar $SWITCHBOARD~message "Planet Stripper Shutting Down*"
	gosub :SWITCHBOARD~switchboard
	halt

:clearScreen
	echo #27 & "[2J"
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
	#setVar $countFuel ($newFuel - $currentFuel)
	getLength $countFuel $length
	while ($length > 3)
		cutText $countFuel $snippet $length-2 9999
		cutText $countFuel $countFuel 1 $length-3
		getLength $countFuel $length
		setVar $formattedCountFuel ","&$snippet&$formattedCountFuel
	end
	setVar $formattedCountFuel $countFuel&$formattedCountFuel
	
	setVar $formattedCountOrganics ""
	#setVar $countOrganics ($newOrganics - $currentOrganics)
	getLength $countOrganics $length
	while ($length > 3)
		cutText $countOrganics $snippet $length-2 9999
		cutText $countOrganics $countOrganics 1 $length-3
		getLength $countOrganics $length
		setVar $formattedCountOrganics ","&$snippet&$formattedCountOrganics
	end
	setVar $formattedCountOrganics $countOrganics&$formattedCountOrganics
	
	setVar $formattedCountEquipment ""
	#setVar $countEquipment ($newEquipment - $currentEquipment)
	getLength $countEquipment $length
	while ($length > 3)
		cutText $countEquipment $snippet $length-2 9999
		cutText $countEquipment $countEquipment 1 $length-3
		getLength $countEquipment $length
		setVar $formattedCountEquipment ","&$snippet&$formattedCountEquipment
	end
	setVar $formattedCountEquipment $countEquipment&$formattedCountEquipment
	
	setVar $formattedCountColonists ""
	#setVar $countColonists ($newFuelColos - $currentFuelColos)
	#add $countColonists ($newOrganicColos - $currentOrganicColos)
	#add $countColonists ($newEquipmentColos - $currentEquipmentColos)
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

:nextColoType
	killAllTriggers
	add $coloType 1
	if ($coloType >= 4)
		goto :halt
	end
return

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"


