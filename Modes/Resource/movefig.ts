logging off
loadVar $bot_name
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
loadVar $stardock
loadVar $command
	gosub :BOT~loadVars

	setVar $parm1 $BOT~parm1
	setVar $parm2 $BOT~parm2
	setVar $parm3 $BOT~parm3
	setVar $parm4 $BOT~parm4
	setVar $parm5 $BOT~parm5
	setVar $parm6 $BOT~parm6
	setVar $parm7 $BOT~parm7
	setVar $parm8 $BOT~parm8
	setVar $user_command_line $BOT~user_command_line
	loadVar $SWITCHBOARD~bot_name


# ======================     START FIGMOVE  (FIGMOVE) SUBROUTINE    ==========================
:figmove
:movefig
	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	setvar $total_moved 0
	getWord $user_command_line $parm1 1
	getWord $user_command_line $parm2 2



	if (($parm2 = "p") OR ($parm2 = "s"))
		setVar $moveToSector $parm2
		isNumber $test $parm1
		if (($test) OR ($parm1 = "all"))
			if ($test)
				setVar $move $parm1
			end
		else
			setvar $move 0
		end
	elseif (($parm1 = "p") OR ($parm1 = "s"))
		setVar $moveToSector $parm1
		isNumber $test $parm2
		if (($test) or ($parm2 = "all"))
			if ($test)
				setVar $move $parm2
			end
		else
			setvar $move 0
		end
	else
		setVar $SWITCHBOARD~message "Please use movefig [p/s] [fighter amount]*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	getWordPos $user_command_line $pos " all"
	setVar $allPlanets FALSE
	if (($pos > 0) AND ($moveToSector = "s"))
		setVar $allPlanets TRUE
	end
	if ($startingLocation = "Citadel")
		send "q"
	elseif ($startingLocation <> "Planet")
		setVar $SWITCHBOARD~message "You must start this script from a planet!* "
		gosub :SWITCHBOARD~switchboard
		halt
	end
	send "mnl*"
	gosub :quikstats
	gosub :getPlanetInfo
	setVar $sector_figs 0
	send "q  q  z  n  **   "
	waiton "Warps to Sector(s) :"
	waiton "Command [TL"
	gosub :quikstats
	
	if ($allPlanets)
		gosub :countPlanets
	else
		setVar $planetCount 1
		setVar $planets[1] $PLANET
	end
	setVar $figOwner SECTOR.FIGS.OWNER[$current_sector]
	setVar $figQuant SECTOR.FIGS.QUANTITY[$current_Sector]

	setVar $sector_figs $figQuant
	setVar $starting_planet $PLANET

	if ($figQuant <> 0) AND (($figOwner <> "belong to your Corp") AND ($figOwner <> "yours"))
		send "l " & $PLANET & "*"
		waitOn "Planet command (?=help) [D]"
		if ($startingLocation = "Citadel")
			send "c"
			waiton "Citadel command"
		end
		setVar $SWITCHBOARD~message "Friendly Fighters Not Present!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	setvar $planet_figs_room $PLANET_FIGHTERS_MAX
	subtract $planet_figs_room $PLANET_FIGHTERS

	gosub :getShipStats

	setVar $i 1
	while ($i <= $planetCount)
		#gosub :quikstats
		if ($allPlanets)
			setVar $move 0
		end
		send "l " $planets[$i] "*"
		waitOn "Planet command (?=help) [D]"
		gosub :getPlanetInfo

		:start
			killalltriggers
			if ($moveToSector = "s")
				if ($move = 0)
					setvar $move ($PLANET_FIGHTERS-$SHIP_FIGHTERS_MAX)
					setvar $total_moved 0
				end
				setvar $end_figs $sector_figs
				add $end_figs $move
				if ($move > $PLANET_FIGHTERS)
					setVar $SWITCHBOARD~message "Not Enough Figs on Planet*"
					gosub :SWITCHBOARD~switchboard
					if ($startingLocation = "Citadel")
			   			send "c "
					end
					halt
				end
				while ($total_moved < $move)
		        		add $sector_figs $SHIP_FIGHTERS_MAX
					if ($sector_figs > $end_figs)
						setvar $sector_figs $end_figs
					end
					send "m  n  t  *  q  f z " $sector_figs "*  z c d  *  l " $planets[$i] "*  "
					add $total_moved $SHIP_FIGHTERS_MAX
		    	end
		    	send "q q * "
			end
			if ($moveToSector = "p")
				if ($move = 0)
					setvar $move $sector_figs
					subtract $move 500
				end
				setvar $end_figs $move
				if ($planet_figs_room < $move)
					setvar $move $planet_figs_room
				end
				send "m n l * "
				while ($move > $SHIP_FIGHTERS_MAX)
					subtract $sector_figs $SHIP_FIGHTERS_MAX
					send "q f z " $sector_figs "* z c d  *  l " $planets[$i] "* m n l * "
					subtract $move $SHIP_FIGHTERS_MAX
				end
				subtract $sector_figs $move
				if ($sector_Figs <> 0)
					send "q  f  z " $sector_figs "*  z  c  d  * l " $planets[$i] "*  m  n  l  * "
				else
					send "q  f  z * l " $planets[$i] "*  m  n  l * "
				end
				#send "q  f z " $sector_figs "* z c d * l " $planets[$i] "* "
			end
			add $i 1
	end
		gosub :quikstats
		if ($CURRENT_PROMPT = "Planet")
			send "m*  *  **  q q * * "
		end
		setVar $PLANET $starting_planet
		gosub :landingSub

		setVar $SWITCHBOARD~message "fighters moved*"
		gosub :SWITCHBOARD~switchboard
		halt
# ======================     END FIGMOVE  (FIGMOVE) SUBROUTINE    ==========================

#========================== START LANDING SUB ===============================================
:landingSub
        send "l" $PLANET "*z  n  z  n  *  "
	setVar $sucessfulCitadel FALSE
	setVar $sucessfulPlanet FALSE
	setTextLineTrigger noplanet :noplanet "There isn't a planet in this sector."
	setTextLineTrigger no_land :no_land "since it couldn't possibly stand"
	setTextLineTrigger planet :planet "Planet #"
	setTextLineTrigger wrongone :wrong_num "That planet is not in this sector."
	pause

:noplanet
	killtrigger no_land
	killtrigger planet
	killtrigger wrongone
	setVar $SWITCHBOARD~message "No Planet in Sector!*"
	gosub :SWITCHBOARD~switchboard
	return

:no_land
	killtrigger noplanet
	killtrigger planet
	killtrigger wrongone
	setVar $SWITCHBOARD~message "This ship cannot land!*"
	gosub :SWITCHBOARD~switchboard
	return

:planet
	getWord CURRENTLINE $pnum_ck 2
	stripText $pnum_ck "#"
	if ($pnum_ck <> $PLANET)
		killtrigger no_land
		killtrigger wrongone
		killtrigger no_planet
		send "q"
		goto :wrong_num
	end
	killtrigger noplanet
	killtrigger no_land
	killtrigger wrongone
	setTextTrigger wrong_num :wrong_num "That planet is not in this sector."
	setTextTrigger planet :planet_prompt "Planet command"
	pause

:wrong_num
	killtrigger planet
	send "**'{" $bot_name "} - Incorrect Planet Number*"
	return

:planet_prompt
	killtrigger wrong_num
	setVar $currentBotPlanet $planet
	saveVar $currentBotPlanet 
	send "m* * * c"
	setTextTrigger build_cit :build_cit "Do you wish to construct one?"
	setTextTrigger in_cit :in_cit "Citadel command"
	setTextTrigger nocitallowed :build_cit "Citadels are not allowed in FedSpace."
	setTextTrigger citnotbuiltyet :build_cit "Be patient, your Citadel is not yet finished."
	pause

:build_cit
	killtrigger in_cit
	killtrigger nocitallowed
	killtrigger build_cit
	killtrigger citnotbuiltyet
	setVar $sucessfulPlanet TRUE
	send "n*"
	setVar $startingLocation "Planet"
	return

:in_cit
	killtrigger in_cit
	killtrigger nocitallowed
	killtrigger build_cit
	killtrigger citnotbuiltyet
	setVar $sucessfulCitadel TRUE
	setVar $startingLocation "Citadel"
return
#============================== END LANDING SUB =============================================

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

#=================================QUIKSTATS================================================
:quikstats
	setVar $CURRENT_PROMPT 		"Undefined"
	killtrigger noprompt
	killtrigger prompt
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

# ==============================  START PLANET INFO SUBROUTINE  =================
:getPlanetInfo
	send "*"
	setTextLineTrigger planetInfo :planetInfo "Planet #"
	pause

	:planetinfo
		setVar $CITADEL 0
		setVar $SECTOR_CANNON 0
		setVar $ATMOSPHERE_CANNON 0
		setVar $CITADEL_CREDITS 0
		getWord CURRENTLINE $PLANET 2
		stripText $PLANET "#"
		getWord CURRENTLINE $current_sector 5
		stripText $current_sector ":"
		waitOn "2 Build 1   Product    Amount     Amount     Maximum"

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
	killtrigger getshipoffence
	killtrigger getshipfighters
	killtrigger getshipmines
return

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"

