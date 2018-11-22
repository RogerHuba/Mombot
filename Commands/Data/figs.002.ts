	logging off
	gosub :BOT~loadVars
	loadVar $BOT~CK_FIG_FILE
	loadVar $BOT~FIG_FILE
	loadVar $BOT~FIG_COUNT_FILE 

		
	setVar $BOT~help[1] $BOT~tab&"Refreshes Deployed Fighter List"
	setVar $BOT~help[2] $BOT~tab&"  - Will show difference since last command was run."
	gosub :BOT~help_file

	setVar $BOT~script_title "Fighter Report"
	gosub :BOT~banner

#================================ REFRESH FIGHTERS ===============================================
:figs
	gosub :current_prompt
	setVar $startingLocation $CURRENT_PROMPT
	if ($startingLocation = "Command")
	        goto :start_figs
	elseif ($startingLocation = "Citadel")
		send "q"
		gosub :getPlanetInfo
		send "q"
	elseif ($startingLocation = "Planet")
		send "d"
		gosub :getPlanetInfo
		send "q"
	else
		send "'{" $switchboard~bot_name "} - Unknown Prompt*"
		halt
	end


:start_figs
	gosub :turnOffAnsi
	send "'{" $switchboard~bot_name "} Loading current fighter locations. . .*"
	getSectorParameter 2 "FIG_COUNTR" $previousCount
	getSectorParameter 2 "FUEL_COUNT" $previousFuelCount
	getSectorParameter 2 "ORG_COUNT" $previousOrgCount
	getSectorParameter 2 "EQU_COUNT" $previousEquipCount
	getSectorParameter 2 "EQS_COUNT" $previousEquipSellCount
	if ($previousCount = "")
               setVar $previousCount 0
        end
	if ($previousFuelCount = "")
               setVar $previousFuelCount 0
        end
	if ($previousOrgCount = "")
               setVar $previousOrgCount 0
        end
	if ($previousEquipCount = "")
               setVar $previousEquipCount 0
        end
	if ($previousEquipSellCount = "")
               setVar $previousEquipSellCount 0
        end
	gosub :refreshFighters
	gosub :turnOnAnsi
	if ($count <> 0)
		setVar $percent  (($count * 100) / SECTORS)
		setVar $1percent (($1scount * 100) / $count)
		setVar $2percent (($2scount * 100) / $count)
		setVar $3percent (($3scount * 100) / $count)
		setVar $4percent (($4scount * 100) / $count)
		setVar $5percent (($5scount * 100) / $count)
		setVar $6percent (($6scount * 100) / $count)
		setVar $?percent (($?scount * 100) / $count)
	end
	setVar $gridChange $count-$previousCount
	if ($gridChange > 0)
		setVar $gridChange "+"&$gridChange
	end
	setVar $gridFuelChange $upgradedFuelCount-$previousFuelCount
	if ($gridFuelChange > 0)
		setVar $gridFuelChange "+"&$gridFuelChange
	end
	setVar $gridOrgChange $upgradedOrgCount-$previousOrgCount
	if ($gridOrgChange > 0)
		setVar $gridOrgChange "+"&$gridOrgChange
	end
	setVar $gridEquipChange $upgradedEquipCount-$previousEquipCount
	if ($gridEquipChange > 0)
		setVar $gridEquipChange "+"&$gridEquipChange
	end
	setVar $gridEquipSellChange $upgradedEquipSellCount-$previousEquipSellCount
	if ($gridEquipSellChange > 0)
		setVar $gridEquipSellChange "+"&$gridEquipSellChange
	end
	setVar $inputVariable $1scount
	gosub :formatNumberForSpaces
	setVar $1scountformatted $outputVariable
	setVar $inputVariable $2scount
	gosub :formatNumberForSpaces
	setVar $2scountformatted $outputVariable
	setVar $inputVariable $3scount
	gosub :formatNumberForSpaces
	setVar $3scountformatted $outputVariable
	setVar $inputVariable $4scount
	gosub :formatNumberForSpaces
	setVar $4scountformatted $outputVariable
	setVar $inputVariable $5scount
	gosub :formatNumberForSpaces
	setVar $5scountformatted $outputVariable
	setVar $inputVariable $6scount
	gosub :formatNumberForSpaces
	setVar $6scountformatted $outputVariable

	setVar $inputVariable $1percent
	gosub :formatPercentageForSpaces
	setVar $1percentformatted $outputVariable
	setVar $inputVariable $2percent
	gosub :formatPercentageForSpaces
	setVar $2percentformatted $outputVariable
	setVar $inputVariable $3percent
	gosub :formatPercentageForSpaces
	setVar $3percentformatted $outputVariable
	setVar $inputVariable $4percent
	gosub :formatPercentageForSpaces
	setVar $4percentformatted $outputVariable
	setVar $inputVariable $5percent
	gosub :formatPercentageForSpaces
	setVar $5percentformatted $outputVariable
	setVar $inputVariable $6percent
	gosub :formatPercentageForSpaces
	setVar $6percentformatted $outputVariable

	setVar $figsGridded TRUE
	if (($startingLocation = "Citadel") OR ($startingLocation = "Planet"))
		gosub :landingsub
	end

	send "'*{"&$switchboard~bot_name&"}*          - Fighter Grid Report -*          - "&$count&" sectors, "&$personalCount&" personal. ("&$percent&"%) ("&$gridChange&" Change)*          - T: "&$tollCount&"  O: "&$offCount&"  D:"&$defCount&"*          - DE: "&$1sCountformatted&""&$1percentformatted&" 2S: "&$2sCountformatted&""&$2percentformatted&" 3S: "&$3sCountformatted&""&$3percentformatted&"*          - 4S: "&$4sCountformatted&""&$4percentformatted&" 5S: "&$5sCountformatted&""&$5percentformatted&" 6S: "&$6sCountformatted&""&$6percentformatted&"*          - Upgraded Sxx: "&$upgradedFuelCount&" ("&$gridFuelChange&" Change)*          - Upgraded xBx: "&$upgradedOrgCount&" ("&$gridOrgChange&" Change)*          - Upgraded xxB: "&$upgradedEquipCount&" ("&$gridEquipChange&" Change)*          - Upgraded xxS: "&$upgradedEquipSellCount&" ("&$gridEquipSellChange&" Change)**"
halt
#=============================== END REFRESH FIGHTERS ============================================

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
	send "'{" $switchboard~bot_name "} - No Planet in Sector!*"
	return

:no_land
	killtrigger noplanet
	killtrigger planet
	killtrigger wrongone
	send "'{" $switchboard~bot_name "} - This ship cannot land!*"
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
	send "**'{" $switchboard~bot_name "} - Incorrect Planet Number*"
	return

:planet_prompt
	killtrigger wrong_num
	setVar $currentBotPlanet $planet
	saveVar $currentBotPlanet 
	send "c"
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


# ============================  START PLAYER INFO SUBROUTINE  =================
:getInfo
	setVar $PHOTONS 0
	setVar $SCAN_TYPE "None"
	setVar $TWARP_TYPE 0
	setVar $corpstring "[0]"
	setVar $igstat 0
	send "I"
	waitOn "<Info>"
	:waitOnInfo
		setTextLineTrigger getTraderName :getTraderName "Trader Name    :"
        	setTextLineTrigger getExpAndAlign :getExpAndAlign "Rank and Exp"
        	setTextLineTrigger getCorp :getCorp "Corp           #"
        	setTextLineTrigger getShipType :getShipType "Ship Info      :"
        	setTextLineTrigger getTPW :getTPW "Turns to Warp  :"
        	setTextLineTrigger getSect :getSect "Current Sector :"
        	setTextLineTrigger getTurns :getTurns "Turns left"
        	setTextLineTrigger getHolds :getHolds "Total Holds"
        	setTextLineTrigger getFighters :getFighters "Fighters       :"
        	setTextLineTrigger getShields :getShields "Shield points  :"
        	setTextLineTrigger getPhotons :getPhotons "Photon Missiles:"
        	setTextLineTrigger getScanType :getScanType "LongRange Scan :"
        	setTextLineTrigger getTwarpType1 :getTwarpType1 "  (Type 1 Jump):"
        	setTextLineTrigger getTwarpType2 :getTwarpType2 "  (Type 2 Jump):"
        	setTextLineTrigger getCredits :getCredits "Credits"
        	setTextLineTrigger checkig :checkig "Interdictor ON :"
		setTextTrigger getInfoDone :getInfoDone "Command [TL="
        	setTextTrigger getInfoDone2 :getInfoDone "Citadel command"
        	pause
	:getTraderName
	        setVar $TRADER_NAME CURRENTLINE
	        stripText $TRADER_NAME "Trader Name    : "
	        stripText $TRADER_NAME "3rd Class "
	        stripText $TRADER_NAME "2nd Class "
	        stripText $TRADER_NAME "1st Class "
	        stripText $TRADER_NAME "Nuisance "
	        stripText $TRADER_NAME "Menace "
	        stripText $TRADER_NAME "Smuggler Savant "
	        stripText $TRADER_NAME "Smuggler "
	        stripText $TRADER_NAME "Robber "
	        stripText $TRADER_NAME "Private "
	        stripText $TRADER_NAME "Lance Corporal "
	        stripText $TRADER_NAME "Corporal "
	        stripText $TRADER_NAME "Staff Sergeant "
	        stripText $TRADER_NAME "Gunnery Sergeant "
	        stripText $TRADER_NAME "1st Sergeant "
	        stripText $TRADER_NAME "Sergeant Major "
	        stripText $TRADER_NAME "Sergeant "
	        stripText $TRADER_NAME "Chief Warrant Officer "
	        stripText $TRADER_NAME "Warrant Officer "
	        stripText $TRADER_NAME "Terrorist "
	        stripText $TRADER_NAME "Infamous Pirate "
	        stripText $TRADER_NAME "Notorious Pirate "
	        stripText $TRADER_NAME "Dread Pirate "
	        stripText $TRADER_NAME "Pirate "
	        stripText $TRADER_NAME "Galactic Scourge "
	        stripText $TRADER_NAME "Enemy of the State "
	        stripText $TRADER_NAME "Enemy of the People "
	        stripText $TRADER_NAME "Enemy of Humankind "
	        stripText $TRADER_NAME "Heinous Overlord "
	        stripText $TRADER_NAME "Prime Evil "
	        stripText $TRADER_NAME "Ensign "
	        stripText $TRADER_NAME "Lieutenant J.G. "
	        stripText $TRADER_NAME "Lieutenant Commander "
	        stripText $TRADER_NAME "Lieutenant "
	        stripText $TRADER_NAME "Commander "
	        stripText $TRADER_NAME "Captain "
	        stripText $TRADER_NAME "Commodore "
	        stripText $TRADER_NAME "Rear Admiral "
	        stripText $TRADER_NAME "Vice Admiral "
	        stripText $TRADER_NAME "Fleet Admiral "
	        stripText $TRADER_NAME "Admiral "
	        stripText $TRADER_NAME "Civilian "
	        stripText $TRADER_NAME "Annoyance "
		pause
	:getExpAndAlign
        	getWord CURRENTLINE $EXPERIENCE 5
        	getWord CURRENTLINE $ALIGNMENT 7
        	stripText $EXPERIENCE ","
        	stripText $ALIGNMENT ","
        	stripText $ALIGNMENT "Alignment="
        	pause
	:getCorp
        	getWord CURRENTLINE $CORP 3
	        stripText $CORP ","
	        setVar $corpstring "[" & $CORP & "]"
	        pause
	:getShipType
	        getWordPos CURRENTLINE $shiptypeend "Ported="
	        subtract $shiptypeend 18
	        cutText CURRENTLINE $SHIP_TYPE 18 $shiptypeend
	        pause
	:getTPW
	        getWord CURRENTLINE $TURNS_PER_WARP 5
	        pause
	:getSect
	        getWord CURRENTLINE $CURRENT_SECTOR 4
	        pause
	:getTurns
	        getWord CURRENTLINE $TURNS 4
	        if ($TURNS = "Unlimited")
	            setVar $TURNS 65000
		    setVar $unlimitedGame TRUE
	        end
		saveVar $unlimitedGame
	        pause
	:getHolds
	        setVar $line CURRENTLINE
	        getWord $line $TOTAL_HOLDS 4
	        getWordPos $line $textpos "Ore="
	        if ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $ORE_HOLDS 1
	            stripText $ORE_HOLDS "Ore="
	        else
	            setVar $ORE_HOLDS 0
	        end
	        getWordPos $line $textpos "Organics="
	        if ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $ORGANIC_HOLDS 1
	            stripText $ORGANIC_HOLDS "Organics="
	        else
	            setVar $ORGANIC_HOLDS 0
	        end
	        getWordPos $line $textpos "Equipment="
	        if ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $EQUIPMENT_HOLDS 1
	            stripText $EQUIPMENT_HOLDS "Equipment="
	        else
	            setVar $EQUIPMENT_HOLDS 0
	        end
		getWordPos $line $textpos "Colonists="
		if ($textpos <> 0)
			cutText CURRENTLINE $temp $textpos 100
			getWord $temp $COLONIST_HOLDS 1
        		stripText $COLONIST_HOLDS "Colonists="
        	else
        		setVar $COLONIST_HOLDS 0
        	end
	        getWordPos $line $textpos "Empty="
	        if ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $EMPTY_HOLDS 1
	            stripText $EMPTY_HOLDS "Empty="
	        else
	            setVar $EMPTY_HOLDS 0
	        end
	        pause
	:getFighters
	        getWord CURRENTLINE $FIGHTERS 3
	        stripText $FIGHTERS ","
	        pause
	:getShields
	        getWord CURRENTLINE $SHIELDS 4
	        stripText $SHIELDS ","
	        pause
	:getPhotons
	        getWord CURRENTLINE $PHOTONS 3
	        pause
	:getScanType
	        getWord CURRENTLINE $SCAN_TYPE 4
	        pause
	:getTwarpType1
	        getWord CURRENTLINE $TWARP_1_RANGE 4
	        setVar $twarp_type 1
	        pause
	:getTwarpType2
	        getWord CURRENTLINE $TWARP_2_RANGE 4
	        setVar $twarp_type 2
	        pause
	:getCredits
	        getWord CURRENTLINE $CREDITS 3
	        stripText $CREDITS ","
	        if ($igstat = 0)
	                setVar $igstat "NO IG"
	        end
	        pause
	:checkig
		getWord CURRENTLINE $igstat 4
		pause

	:getInfoDone
	        killtrigger getInfoDone
	        killtrigger getInfoDone2
		killtrigger getTraderName
        	killtrigger getExpAndAlign
        	killtrigger getCorp
        	killtrigger getShipType
        	killtrigger getTPW
        	killtrigger getSect
        	killtrigger getTurns
        	killtrigger getHolds
        	killtrigger getFighters
        	killtrigger getShields
        	killtrigger getPhotons
        	killtrigger getScanType
        	killtrigger getTwarpType1
        	killtrigger getTwarpType2
        	killtrigger getCredits
        	killtrigger checkig

return
# ==============================  END PLAYER INFO SUBROUTINE  =================


#==================================== START CURRENT PROMPT =====================================
:current_prompt
	setTextTrigger 	prompt		:allPromptsCatch	 	#145 & #8
	send #145
	pause

	:allPromptsCatch
		getWord CURRENTLINE $CURRENT_PROMPT 1
		if ($CURRENT_PROMPT = 0)
			getWord CURRENTANSILINE $CURRENT_PROMPT 1
		end
		stripText $CURRENT_PROMPT #145
		stripText $CURRENT_PROMPT #8
return

#============================= REFRESH FIGHTER SUBROUTINE =======================================
:refreshFighters
	:readFighterList
		setVar $count 0
		setVar $personalCount 0
		setVar $1sCount 0
		setVar $2sCount 0
		setVar $3sCount 0
		setVar $4sCount 0
		setVar $5sCount 0
		setVar $6sCount 0
		setVar $?sCount 0
		setVar $tollCount 0
		setVar $offCount 0
		setVar $defCount 0
		setVar $fuelCount 0
		setVar $orgCount 0
		setVar $equipCount 0
		setVar $equipSellCount 0
		setVar $upgradedEquipCount 0
		setVar $upgradedEquipSellCount 0
		setVar $upgradedOrgCount 0
		setVar $upgradedFuelCount 0

		send "g"
		setVar $i 1
		setVar $personalOutput " "
		setVar $output " "
		setVar $ckoutput " "
	:keepCounting
		setTextLineTrigger corporate 		:corpCount 	" Corp"
		setTextLineTrigger personal 		:personalCount	"Personal "
		setTextLineTrigger doneCountingFigs	:doneCounting 	"Total"
		setTextLineTrigger doneNoFigs 		:doneCounting 	"No fighters deployed"
		pause
	:personalCount
		add $count 1
		add $personalCount 1
		getWord CURRENTLINE $sector 1
		getWord CURRENTLINE $type 4
		setVar $personalOutput $personalOutput&" "&$sector&"  "
		setTextLineTrigger personal 		:personalCount	"Personal "
		pause

	:corpCount
		add $count 1
		add $corpCount 1
		getWord CURRENTLINE $sector 1
		getWord CURRENTLINE $type 4
		if ($type = "Toll")
			add $tollCount 1
		elseif ($type = "Offensive")
			add $offCount 1
		elseif ($Type = "Defensive")
			add $defCount 1
		end
		while ($i <= $sector)
			getWordPos $personalOutput $pos " "&$i&" "
			if (($sector = $i) OR ($pos > 0))
				setVar $output $output&$i&"*"
				setVar $ckoutput $ckoutput&$i&"  "
				setSectorParameter $i "FIGSEC" TRUE
				if ((PORT.EXISTS[$i] = TRUE))
					setVar $currentEquip (PORT.Equip[$i]*100)
					if (port.percentEquip[$i] <> 0)
						divide $currentEquip port.percentEquip[$i]
					end
					if (PORT.BUYEQUIP[$i] = FALSE)
						if ($currentEquip > 10000)
							add $upgradedEquipSellCount 1
						end
					else
						if ($currentEquip > 10000)
							add $upgradedEquipCount 1
						end
					end
					if (PORT.BUYORG[$i] = TRUE)
						setVar $currentOrg (PORT.Org[$i]*100)
						if (port.percentOrg[$i] <> 0)
							divide $currentOrg port.percentOrg[$i]
						end
						if ($currentOrg > 10000)
							add $upgradedOrgCount 1
						end
					end
					if (PORT.BUYFUEL[$i] = FALSE)
						setVar $currentFuel (PORT.Fuel[$i]*100)
						if (port.percentFuel[$i] <> 0)
							divide $currentFuel port.percentFuel[$i]
						end
						if ($currentFuel > 10000)
							add $upgradedFuelCount 1
						end
					end
				end
				setVar $tempWarpCount SECTOR.WARPINCOUNT[$i]
				setVar $tempWarpCountOut SECTOR.WARPCOUNT[$i]
				if ($tempWarpCount > 0) and ($tempWarpCountOut > 0)
					if ($tempWarpCount = 1)
						add $1sCount 1
					elseif ($tempWarpCount = 2)
						add $2sCount 1
					elseif ($tempWarpCount = 3)
						add $3sCount 1
					elseif ($tempWarpCount = 4)
						add $4sCount 1
					elseif ($tempWarpCount = 5)
						add $5sCount 1
					elseif ($tempWarpCount = 6)
						add $6sCount 1
					end
				else
					add $?scount 1
				end

			else
				setVar $output $output&"0*"
				setVar $ckoutput $ckoutput&"0  "
				setSectorParameter $i "FIGSEC" FALSE
			end
			add $i 1
		end
		setTextLineTrigger corporate 		:corpCount 	" Corp"
		pause		

	:doneCounting
		killalltriggers
		while ($i <= SECTORS)
			getWordPos $personalOutput $pos " "&$i&" "
			if ($pos > 0)
				setVar $ckoutput $ckoutput&$i&"  "
				setVar $output $output&$i&"*"
				setSectorParameter $i "FIGSEC" TRUE
			else
				setVar $ckoutput $ckoutput&"0  "
				setVar $output $output&"0*"
				setSectorParameter $i "FIGSEC" FALSE
			end
			add $i 1
		end
		delete "0"
		delete $bot~FIG_FILE
		delete $bot~CK_FIG_FILE
		write $bot~FIG_FILE $output
		write $bot~FIG_FILE DATE
		write $bot~FIG_FILE TIME
		write $bot~CK_FIG_FILE $ckoutput
		setSectorParameter 2 "FIG_COUNT" $count
		setSectorParameter 2 "FIG_COUNTR" $count
		setSectorParameter 2 "FUEL_COUNT" $upgradedFuelCount
		setSectorParameter 2 "ORG_COUNT" $upgradedOrgCount
		setSectorParameter 2 "EQU_COUNT" $upgradedEquipCount
		setSectorParameter 2 "EQS_COUNT" $upgradedEquipSellCount

return
# ============================== END REFRESH FIGHTERS (FIGS) SUB ==============================

# ============================== ANSI CONTROLS ==========================================
:turnOffAnsi
	send "c n"
	killalltriggers
	waitOn "(1) ANSI graphics"
	getWord CURRENTLINE $ansiStatus 5
	waitOn "(2) Animation display"
	getWord CURRENTLINE $animationStatus 5
	if ($animationStatus = "On")
		send "2"
	end
	if ($ansiStatus = "On")
		send "1 q q"
	else
		send "q q"
	end
	waitOn "<Computer deactivated>"
	return

:turnOnAnsi
	send "c n"
	killalltriggers
	waitOn "(1) ANSI graphics"
	getWord CURRENTLINE $ansiStatus 5
	if ($ansiStatus = "Off")
		send "1 q q"
	else
		send "q q"
	end
	waitOn "<Computer deactivated>"
	return
# ==================================== END ANSI CONTROLS =====================================

#=============================== FORMATTING FOR SPACES =======================================
:formatNumberForSpaces
	if ($inputVariable < 10)
		setVar $outputVariable "    " & $inputVariable
	elseif ($inputVariable < 100)
		setVar $outputVariable "   " & $inputVariable
	elseif ($inputVariable < 1000)
		setVar $outputVariable "  " & $inputVariable
	elseif ($inputVariable < 10000)
		setVar $outputVariable " " & $inputVariable
	else
		setVar $outputVariable $inputVariable
	end
return

:formatPercentageForSpaces
	if ($inputVariable < 10)
		setVar $outputVariable "  (" & $inputVariable&"%)"
	elseif ($inputVariable < 100)
		setVar $outputVariable " (" & $inputVariable&"%)"
	elseif ($inputVariable < 1000)
		setVar $outputVariable "(" & $inputVariable&"%)"
	else
		setVar $outputVariable $inputVariable
	end
return
#============================= END FORMATTING FOR SPACES =====================================


#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"

