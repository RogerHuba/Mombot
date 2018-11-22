# MD Planet Stripper
	reqRecording
	logging off
	loadVar $bot_name
	loadVar $unlimitedGame
	loadVar $ptradesetting
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

        # ============================ START QUIKSTAT VARIABLES ==========================
                setVar $CURRENT_PROMPT          "Undefined"
                setVar $PSYCHIC_PROBE           "No"
                setVar $PLANET_SCANNER          "No"
                setVar $SCAN_TYPE               "None"
                setVar $CURRENT_SECTOR          0
                setVar $TURNS                   0
                setVar $CREDITS                 0
                setVar $FIGHTERS                0
                setVar $SHIELDS                 0
                setVar $TOTAL_HOLDS             0
                setVar $ORE_HOLDS               0
                setVar $ORGANIC_HOLDS           0
                setVar $EQUIPMENT_HOLDS         0
                setVar $COLONIST_HOLDS          0
                setVar $PHOTONS                 0
                setVar $ARMIDS                  0
                setVar $LIMPETS                 0
                setVar $GENESIS                 0
                setVar $TWARP_TYPE              0
                setVar $CLOAKS                  0
                setVar $BEACONS                 0
                setVar $ATOMIC                  0
                setVar $CORBO                   0
                setVar $EPROBES                 0
                setVar $MINE_DISRUPTORS         0
                setVar $ALIGNMENT               0
                setVar $EXPERIENCE              0
                setVar $CORP                    0
                setVar $SHIP_NUMBER             0
                setVar $TURNS_PER_WARP          0
                setVar $COMMAND_PROMPT          "Command"
                setVar $COMPUTER_PROMPT         "Computer"
                setVar $CITADEL_PROMPT          "Citadel"
                setVar $PLANET_PROMPT           "Planet"
                setVar $CORPORATE_PROMPT        "Corporate"
                setVar $STARDOCK_PROMPT         "<Stardock>"
                setVar $HARDWARE_PROMPT         "<Hardware"
                setVar $SHIPYARD_PROMPT         "<Shipyard>"
                setVar $TERRA_PROMPT            "Terra"
        # ============================ END QUIKSTAT VARIABLES ==========================

	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Planet"))
		send "'{" $bot_name "} - Planet Stripper must be started from Citadel or Planet prompt*"
		halt
	end
	isNumber $test $parm1
	if (($test = FALSE) AND ($parm1 <> "all"))
		send "'{" $bot_name "} - Invalid planet. Please enter a planet number or 'all'.*"
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
	gosub :getPlanetInfo
	send "q ** "
        gosub :quikstats

	if (SECTOR.PLANETCOUNT[$CURRENT_SECTOR] <= 1)
		send "'{" $bot_name "} - This script must be run with at least two planets in the sector*"
		send "l "&$planet&"* "
		if ($startingLocation = "Citadel")
			send "c "
		end
		halt
	end
	gosub :countPlanets

:startUpMessage
	setVar $planetToFill $PLANET
	if ($parm1 <> "all")
		setVar $planetCount 1
		setVar $planets[1] $parm1
	end
	send "'{" $bot_name "} - Planet Stripper Powering Up!  Filling Planet "&$planetToFill&"*"
	
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
		send "'{" $bot_name "} - Planet #"&$planetToFill&" is not valid for this sector*"
		halt	
	:goodPlanet
		killAllTriggers
		waiton "Fuel Ore"
		getWord CURRENTLINE $currentFuelColos 3
		stripText $currentFuelColos ","
		setVar $currentFuel $planet_fuel
		waiton "Organics"
		getWord CURRENTLINE $currentOrganicColos 2
		stripText $currentOrganicColos ","
		setVar $currentOrganics $planet_organics
		waiton "Equipment"
		getWord CURRENTLINE $currentEquipmentColos 2
		stripText $currentEquipmentColos ","
		setVar $currentEquipment $planet_equipment
		send "m*l* q "

	while ($i <= $planetCount)
		if ($planetToFill <> $planets[$i])
			:tryFuel
				setVar $TURNS ($TURNS-1)
				killAllTriggers
				if ($TURNS <= $bot_turn_limit)
					:lookUpPlanetStats2
				end
				if ($emptyFuel)
					send "l j"&#8&$planets[$i]&"* jt*jt1* x q l j"&#8&$planetToFill&"* jt*jl1* x q "
					setTextTrigger fuelSuccess :tryFuel "You load the "				
					setTextTrigger fuelEmpty :tryOrganics "There aren't that many "
					setTextTrigger fuelFull :emptyFuel "They don't have room for that many "
					pause
				end
			:emptyFuel
				send "jy "
			:tryOrganics
				setVar $TURNS ($TURNS-1)
				killAllTriggers
				if ($TURNS <= $bot_turn_limit)
					:lookUpPlanetStats2
				end
				if ($emptyOrganics)
					send "l j"&#8&$planets[$i]&"* jt*jt2* x q l j"&#8&$planetToFill&"* jt*jl2* x q "
					setTextTrigger success :tryOrganics "You load the "
					setTextTrigger emptyEmpty :tryEquipment "There aren't that many "
					setTextTrigger fullFill :emptyOrganics "They don't have room for that many "
					pause
				end
			:emptyOrganics
				send "jy "
			:tryEquipment
				setVar $TURNS ($TURNS-1)
				killAllTriggers
				if ($TURNS <= $bot_turn_limit)
					:lookUpPlanetStats2
				end
				if ($emptyEquipment)
					send "l j"&#8&$planets[$i]&"* jt*jt3* x q l j"&#8&$planetToFill&"* jt*jl3* x q "
					setTextTrigger success :tryEquipment "You load the "
					setTextTrigger emptyEmpty :tryFuelColonists "There aren't that many "
					setTextTrigger fullFill :emptyEquipment "They don't have room for that many "
					pause
				end
			:emptyEquipment
				send "jy "
			:tryFuelColonists
				setVar $TURNS ($TURNS-1)
				killAllTriggers
				if ($TURNS <= $bot_turn_limit)
					:lookUpPlanetStats2
				end
				if ($emptyFuelColonists)
					send "l j"&#8&$planets[$i]&"* js*jt1* x q l j"&#8&$planetToFill&"* js*jl"&$coloType&"* x q "
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
				setVar $TURNS ($TURNS-1)
				killAllTriggers
				if ($TURNS <= $bot_turn_limit)
					:lookUpPlanetStats2
				end
				if ($emptyOrganicColonists)
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
				setVar $TURNS ($TURNS-1)
				killAllTriggers
				if ($TURNS <= $bot_turn_limit)
					:lookUpPlanetStats2
				end
				if ($emptyEquipmentColonists)
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
					send "l j"&#8&$planets[$i]&"* jm ** *x q l j"&#8&$planetToFill&"* jm*jl*x q "
					setTextTrigger success :tryFighters "The Fighters join your battle force."
					setTextTrigger emptyEmpty :doneWithThisPlanet "There isn't room on the planet"
					setTextTrigger fullFill :doneWithThisPlanet "They don't have room for that many "
					setTextTrigger empty :doneWithThisPlanet "How many Fighters do you want to take (0 Max) [0]"
					pause

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
		send "'{" $bot_name "} - Planet #"&$planetToFill&" is not valid for this sector*"
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
	send "'{" $bot_name "} - Planet Stripper Shutting Down*"
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
		getWordPos CURRENTLINE $pos "<<<< ("
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

:quikstats


     	setVar $CURRENT_PROMPT 		"Undefined"
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
				if ($unlimitedGame)
					setVar $TURNS 65000
				end
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



:endReport
	setVar $formattedCountFuel ""
	setVar $countFuel ($newFuel - $currentFuel)
	getLength $countFuel $length
	while ($length > 3)
		cutText $countFuel $snippet $length-2 9999
		cutText $countFuel $countFuel 1 $length-3
		getLength $countFuel $length
		setVar $formattedCountFuel ","&$snippet&$formattedCountFuel
	end
	setVar $formattedCountFuel $countFuel&$formattedCountFuel
	
	setVar $formattedCountOrganics ""
	setVar $countOrganics ($newOrganics - $currentOrganics)
	getLength $countOrganics $length
	while ($length > 3)
		cutText $countOrganics $snippet $length-2 9999
		cutText $countOrganics $countOrganics 1 $length-3
		getLength $countOrganics $length
		setVar $formattedCountOrganics ","&$snippet&$formattedCountOrganics
	end
	setVar $formattedCountOrganics $countOrganics&$formattedCountOrganics
	
	setVar $formattedCountEquipment ""
	setVar $countEquipment ($newEquipment - $currentEquipment)
	getLength $countEquipment $length
	while ($length > 3)
		cutText $countEquipment $snippet $length-2 9999
		cutText $countEquipment $countEquipment 1 $length-3
		getLength $countEquipment $length
		setVar $formattedCountEquipment ","&$snippet&$formattedCountEquipment
	end
	setVar $formattedCountEquipment $countEquipment&$formattedCountEquipment
	
	setVar $formattedCountColonists ""
	setVar $countColonists ($newFuelColos - $currentFuelColos)
	add $countColonists ($newOrganicColos - $currentOrganicColos)
	add $countColonists ($newEquipmentColos - $currentEquipmentColos)
	getLength $countColonists $length
	while ($length > 3)
		cutText $countColonists $snippet $length-2 9999
		cutText $countColonists $countColonists 1 $length-3
		getLength $countColonists $length
		setVar $formattedCountColonists ","&$snippet&$formattedCountColonists
	end
	setVar $formattedCountColonists $countColonists&$formattedCountColonists
	
	send "'*{" $bot_name "} - Planet Stripper - Completion Report*"	
	if ($emptyFuel)
		send "  Fuel Ore  Moved: "&$formattedCountFuel&" Holds*"
	end
	if ($emptyOrganics)
		send "  Organics  Moved: "&$formattedCountOrganics&" Holds*"
	end
	if ($emptyEquipment)
		send "  Equipment Moved: "&$formattedCountEquipment&" Holds*"
	end
	if ($emptyFuelColonists OR $emptyOrganicColonists OR $emptyEquipmentColonists)
		send "  Colonists Moved: "&$formattedCountColonists&" Holds*"
	end
	if ($emptyFighters)
		send "  All possible fighters stripped and placed on planet*"
	end
	if ($TURNS <= $bot_turn_limit)
		send "  Turns too low to continue. (Turn limit: "&$bot_turn_limit&"*"
	end
	send  "**"
return

:nextColoType
	killAllTriggers
	add $coloType 1
	if ($coloType >= 4)
		goto :halt
	end
return

# ==============================  START PLANET INFO SUBROUTINE  =================
:getPlanetInfo

	# ============================ START PLANET VARIABLES ==========================
        	setVar $CURRENT_SECTOR		0
        	setVar $PLANET			0
		setVar $PLANET_FUEL		0
		setVar $PLANET_FUEL_MAX		0
		setVar $PLANET_ORGANICS		0	
		setVar $PLANET_ORGANICS_MAX	0
		setVar $PLANET_EQUIPMENT	0
		setVar $PLANET_EQUIPMENT_MAX	0
		setVar $PLANET_FIGHTERS		0
		setVar $PLANET_FIGHTERS_MAX	0
		setVar $CITADEL			0
		setVar $CITADEL_CREDITS		0
		setVar $ATMOSPHERE_CANNON	0
		setVar $SECTOR_CANNON		0
	# ============================  END PLANET VARIABLES ==========================


	send "*"
	setTextLineTrigger planetInfo2 :planetInfo2 "Planet #"
	pause

	:planetinfo2
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
