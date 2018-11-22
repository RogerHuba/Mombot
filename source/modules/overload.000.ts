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

		
# =============================== START OVERLOAD =====================================
:overload

	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	if (($startingLocation <> "Command") AND ($startingLocation <> "Citadel"))
		send "'{" $bot_name "} - Must start at Citadel or Command Prompt for overload check*"
		halt
	end
	if ($parm1 = "under")
		setVar $showUnderload TRUE
	else
		setVar $showUnderload FALSE
	end
:start_overload
	if ($MAX_PLANETS_PER_SECTOR <= 0)
		if ($startingLocation = "Citadel")
			send "q"
			gosub :getPlanetInfo
			send "q"
		end
		:getPPS
			send "V"
			setTextLineTrigger pps :pps "The Maximum number of Planets per sector:"
			pause

			:pps
				getWord CURRENTLINE $pps 8
				stripText $pps ","
			:grabPlanets
				setVar $sector_list " "
				setVar $sector_list_length 0
				if ($startingLocation = "Citadel")
					send "L " & $PLANET & "* C XLQCYQ"
				else
					send "TLQCYQ"
				end
	else
		setVar $pps $MAX_PLANETS_PER_SECTOR
		:grabPlanetsNoV
			setVar $sector_list " "
			setVar $sector_list_length 0
			if ($startingLocation = "Citadel")
				send "XLQCYQ"
			else
				send "TLQCYQ"
			end
	end

	waitOn "Corporate Planet Scan"

:getCorpPlanetList
        setTextLineTrigger getCorpPlanet :getCorpPlanet "Class"
        setTextLineTrigger corpPlanetsDone :corpPlanetsDone "======   ============  ==== ==== ==== ===== ===== ===== ========== =========="
        setTextLineTrigger corpPlanetsDone2 :corpPlanetsDone "No Planets claimed"
        pause

:getCorpPlanet
	gosub :getthisplanet
        setTextLineTrigger getCorpPlanet :getCorpPlanet "Class"
	pause
:corpPlanetsDone
        killtrigger getCorpPlanet
	killtrigger corpPlanetsDone
	killtrigger corpPlanetsDone2
	waitOn "Personal Planet Scan"

:getPersPlanetList
        setTextLineTrigger getPersPlanet :getPersPlanet "Class"
        setTextLineTrigger persPlanetsDone :persPlanetsDone "======   ============  ==== ==== ==== ===== ===== ===== ========== =========="
        setTextLineTrigger persPlanetsDone2 :persPlanetsDone "No Planets claimed"
        pause

:getPersPlanet
        gosub :getthisplanet
        setTextLineTrigger getPersPlanet :getPersPlanet "Class"
        pause

:persPlanetsDone
        killtrigger getPersPlanet
        killtrigger persPlanetsDone
        killtrigger persPlanetsDone2

:calculate
        setVar $overloads 0
        :compareOuterLoop
            if ($sector_list_length > 0)
                getWord $sector_list $currentDataSector 1
                setVar $planets_this_sector 1
                setVar $compare_index 1
                :compareInnerLoop
                    if ($compare_index < $sector_list_length)
                        add $compare_index 1
                        getWord $sector_list $compare_sector $compare_index
                        if ($currentDataSector = $compare_sector)
                            add $planets_this_sector 1
                        end
                        goto :compareInnerLoop
                    else
                        if ($planets_this_sector > $pps)
                            send "'{" $bot_name "} - OVERLOAD: " & $planets_this_sector & " planets found in sector " & $currentDataSector & "*"
                            add $overloads 1
                        elseif ((($planets_this_sector > 1) OR ($pps <= 1)) AND ($planets_this_sector < $pps) AND ($showUnderload = TRUE))
                            send "'{" $bot_name "} - " & $planets_this_sector & " planets found in sector " & $currentDataSector & ". Sector needs " &($pps-$planets_this_sector)&" planets to be full.*"
                        end
                        setVar $replace_sector $currentDataSector & " "
                        replaceText $sector_list $replace_sector ""
                        subtract $sector_list_length $planets_this_sector
                        goto :compareOuterLoop
                    end
            else
                send "'{" $bot_name "} - " & $overloads & " Overloads Found*"
                halt
            end


:getthisplanet
	setVar $line CURRENTLINE
	cutText $line $goodline 41 5
	if ($goodline = "Class")
		getWord $line $sector 1
		setVar $sector_list $sector_list & $sector & " "
		add $sector_list_length 1
	end
return
# ======================================= END OVERLOAD =========================================

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

#==================================== START CURRENT PROMPT =====================================
:current_prompt
	setTextTrigger 	prompt		:allPromptsCatch	 	#145 & #8
	setDelayTrigger prompt_delay	:verifyDelay		 	5000
	send #145
	pause

	:allPromptsCatch
		killtrigger prompt_delay
		getWord CURRENTLINE $CURRENT_PROMPT 1
		if ($CURRENT_PROMPT = 0)
			getWord CURRENTANSILINE $CURRENT_PROMPT 1
		end
		stripText $CURRENT_PROMPT #145
		stripText $CURRENT_PROMPT #8
return


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
