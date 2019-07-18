loadVar $bot_name
loadVar $parm1
loadVar $user_command_line
loadVar $bot_turn_limit
loadVar $parm2
loadVar $parm3
loadVar $parm4
loadVar $parm5

:Mover
	KillAllTriggers
	setVar $StuffMoved ""
	setVar $rounds 0
	gosub :quikstats
	setVar $StartLocation $CURRENT_PROMPT
	IF (($StartLocation <> "Citadel") and ($StartLocation <> "Planet"))
        	send "'{" $bot_name "} - Mover must be run from Citadel or Planet prompt.*"
		HALT
	END
	IF ($parm1 = "f")
		setVar $StuffMoved "Fuel"
	ELSEIF ($parm1 = "o")
		setVar $StuffMoved "Organics"
	ELSEIF ($parm1 = "e")
		setVar $StuffMoved "Equipment"
	ELSEIF ($parm1 = "fc")
		setVar $StuffMoved "Fuel Colonists"
	ELSEIF ($parm1 = "oc")
		setVar $StuffMoved "Organic Colonists"
	ELSEIF ($parm1 = "ec")
		setVar $StuffMoved "Equipment Colonists"
	ELSE
		send "'{" $bot_name "} - Please use move [f/o/e/fc/oc/ec/] [planet] [rounds] format*"
		HALT
	END
	isNumber $test $parm2
	IF ($test = FALSE)
		send "'{" $bot_name "} - Mover Planet Parameter in-valid*"
		HALT
	END
	isNumber $test $parm3
	IF ($test = FALSE)
		send "'{" $bot_name "} - Mover Rounds Parameter in-valid*"
		HALT
	ELSEIF ($parm3 <= 0)
		send "'{" $bot_name "} - Must choose more than 0 rounds to move*"
		HALT
	END
	IF ($StartLocation = "Citadel")
		send "q"
	END
	gosub :getPlanetInfo

:StartMover
	IF ($StuffMoved = "Fighters")
		goto :MoveFighters
	ELSEIF (($StuffMoved = "Fuel") or ($StuffMoved = "Fuel Colonists"))
		setVar $stuff 1
	ELSEIF (($StuffMoved = "Organics") or ($StuffMoved = "Organic Colonists"))
		setVar $stuff 2
	ELSEIF (($StuffMoved = "Equipment") or ($StuffMoved = "Equipment Colonists"))
		setVar $stuff 3
	END
	getWordPos $user_command_line $pos "c"
	IF ($pos > 0)
		send "q  j  y l "&$PLANET&" *  "
		goto :MoveColonists
	else
		send "q  j  y l "&$PLANET&" *  "
		goto :MoveProduct
	END

:MoveProduct
	IF ($rounds <= $parm3)
		send "t  n  t  "&$stuff&"*  q  l "&$parm2&"*  t  n  l "&$stuff&"*  q  l "&$PLANET&"*  "
		add $rounds 1
		goto :MoveProduct
	ELSEIF ($rounds < 1)
		goto :MoveDone
	END

:MoveColonists
	IF ($rounds <= $parm3)
		send "s  n  t  "&$stuff&"*  q  l "&$parm2&"*  s  n  l "&$stuff&"*  q  l "&$PLANET&"*  "
		add $rounds 1
		goto :MoveColonists
	ELSEIF ($rounds < 1)
		goto :MoveDone
	END

:MoveFighters
	IF ($rounds <= $parm3)
		send "m  n  *  *  q  l  "&$parm2&"*  m  n  l  *  q  l  "&$PLANET&"*  "
		add $rounds 1
		goto :MoveFighters
	ELSEIF ($rounds < 1)
		goto :MoveDone
	END

:MoveDone
        IF ($StartLocation = "Citadel")
                send "c"
        END
	send "'{" $bot_name "} - Moved "&$parm3&" loads of "&$StuffMoved&" from "&$PLANET&" to "&$parm2&".*"
	HALT


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
	sEND #145&"/"
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
		IF ($pos > 0)
			goto :gotStats
		else
			setTextLineTrigger getLine2 :statsline
			pause
		END

	:gotStats
		setVar $stats $stats & " @@@"

		setVar $current_word 0
		while ($wordy <> "@@@")
			IF ($wordy = "Sect")
				getWord $stats $CURRENT_SECTOR   	($current_word + 1)
			ELSEIF ($wordy = "Turns")
				getWord $stats $TURNS  			($current_word + 1)
			ELSEIF ($wordy = "Creds")
				getWord $stats $CREDITS  		($current_word + 1)
			ELSEIF ($wordy = "Figs")
				getWord $stats $FIGHTERS   		($current_word + 1)
			ELSEIF ($wordy = "Shlds")
				getWord $stats $SHIELDS  		($current_word + 1)
			ELSEIF ($wordy = "Hlds")
				getWord $stats $TOTAL_HOLDS   		($current_word + 1)
			ELSEIF ($wordy = "Ore")
				getWord $stats $ORE_HOLDS    		($current_word + 1)
			ELSEIF ($wordy = "Org")
				getWord $stats $ORGANIC_HOLDS    	($current_word + 1)
			ELSEIF ($wordy = "Equ")
				getWord $stats $EQUIPMENT_HOLDS    	($current_word + 1)
			ELSEIF ($wordy = "Col")
				getWord $stats $COLONIST_HOLDS    	($current_word + 1)
			ELSEIF ($wordy = "Phot")
				getWord $stats $PHOTONS   		($current_word + 1)
			ELSEIF ($wordy = "Armd")
				getWord $stats $ARMIDS   		($current_word + 1)
			ELSEIF ($wordy = "Lmpt")
				getWord $stats $LIMPETS   		($current_word + 1)
			ELSEIF ($wordy = "GTorp")
				getWord $stats $GENESIS  		($current_word + 1)
			ELSEIF ($wordy = "TWarp")
				getWord $stats $TWARP_TYPE  		($current_word + 1)
			ELSEIF ($wordy = "Clks")
				getWord $stats $CLOAKS   		($current_word + 1)
			ELSEIF ($wordy = "Beacns")
				getWord $stats $BEACONS 		($current_word + 1)
			ELSEIF ($wordy = "AtmDt")
				getWord $stats $ATOMIC  		($current_word + 1)
			ELSEIF ($wordy = "Corbo")
				getWord $stats $CORBO   		($current_word + 1)
			ELSEIF ($wordy = "EPrb")
				getWord $stats $EPROBES   		($current_word + 1)
			ELSEIF ($wordy = "MDis")
				getWord $stats $MINE_DISRUPTORS   	($current_word + 1)
			ELSEIF ($wordy = "PsPrb")
				getWord $stats $PSYCHIC_PROBE  		($current_word + 1)
			ELSEIF ($wordy = "PlScn")
				getWord $stats $PLANET_SCANNER  	($current_word + 1)
			ELSEIF ($wordy = "LRS")
				getWord $stats $SCAN_TYPE    		($current_word + 1)
			ELSEIF ($wordy = "Aln")
				getWord $stats $ALIGNMENT    		($current_word + 1)
			ELSEIF ($wordy = "Exp")
				getWord $stats $EXPERIENCE    		($current_word + 1)
			ELSEIF ($wordy = "Corp")
				getWord $stats $CORP   			($current_word + 1)
			ELSEIF ($wordy = "Ship")
				getWord $stats $SHIP_NUMBER   		($current_word + 1)
			END
			add $current_word 1
			getWord $stats $wordy $current_word
		END
	:doneQuikstats
		killtrigger prompt1
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger statlinetrig
		killtrigger getLine2

return
# ============================== END QUICKSTATS SUB==============================
# ============================  START PLAYER INFO SUBROUTINE  =================
:getInfo
	setVar $PHOTONS 0
	setVar $SCAN_TYPE "None"
	setVar $TWARP_TYPE 0
	setVar $corpstring "[0]"
	setVar $igstat 0
	sEND "I"
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
#	        IF (($TRADER_NAME <> "bob") and ($TRADER_NAME <> "Bob") and ($TRADER_NAME <> "BOB"))
#                    setVar $OkayToUse FALSE
#               END
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
	        getWordPos CURRENTLINE $shiptypeEND "Ported="
	        subtract $shiptypeEND 18
	        cutText CURRENTLINE $SHIP_TYPE 18 $shiptypeEND
	        pause
	:getTPW
	        getWord CURRENTLINE $TURNS_PER_WARP 5
	        pause
	:getSect
	        getWord CURRENTLINE $CURRENT_SECTOR 4
	        pause
	:getTurns
	        getWord CURRENTLINE $TURNS 4
	        IF ($TURNS = "Unlimited")
	            setVar $TURNS 65000
		    setVar $unlimitedGame TRUE
	        END
		saveVar $unlimitedGame
	        pause
	:getHolds
	        setVar $line CURRENTLINE
	        getWord $line $TOTAL_HOLDS 4
	        getWordPos $line $textpos "Ore="
	        IF ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $ORE_HOLDS 1
	            stripText $ORE_HOLDS "Ore="
	        else
	            setVar $ORE_HOLDS 0
	        END
	        getWordPos $line $textpos "Organics="
	        IF ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $ORGANIC_HOLDS 1
	            stripText $ORGANIC_HOLDS "Organics="
	        else
	            setVar $ORGANIC_HOLDS 0
	        END
	        getWordPos $line $textpos "Equipment="
	        IF ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $EQUIPMENT_HOLDS 1
	            stripText $EQUIPMENT_HOLDS "Equipment="
	        else
	            setVar $EQUIPMENT_HOLDS 0
	        END
		getWordPos $line $textpos "Colonists="
		IF ($textpos <> 0)
			cutText CURRENTLINE $temp $textpos 100
			getWord $temp $COLONIST_HOLDS 1
        		stripText $COLONIST_HOLDS "Colonists="
        	else
        		setVar $COLONIST_HOLDS 0
        	END
	        getWordPos $line $textpos "Empty="
	        IF ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $EMPTY_HOLDS 1
	            stripText $EMPTY_HOLDS "Empty="
	        else
	            setVar $EMPTY_HOLDS 0
	        END
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
	        IF ($igstat = 0)
	                setVar $igstat "NO IG"
	        END
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
		gosub :validation

return
# ==============================  END PLAYER INFO SUBROUTINE  =================

# ==============================  START PLANET INFO SUBROUTINE  =================
:getPlanetInfo
	sEND "*"
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


# ============================== START GET PLANET STATS TRIGGERS==============================
:setPlanetNumber
	getWordPos RAWPACKET $pos "Planet " & #27 & "[1;33m#" & #27 & "[36m"
	IF ($pos > 0)
		getText RAWPACKET $PLANET "Planet " & #27 & "[1;33m#" & #27 & "[36m" #27 & "[0;32m in sector "
	END
	setTextLineTrigger	getPlanetNumber	:setPlanetNumber 	" in sector "
	pause


# =============================== END GET PLANET STATS TRIGGERS===============================

# ============================== START GET SHIP STATS TRIGGERS==============================
:setShipOffensiveOdds
	getWordPos CURRENTANSILINE $pos "[0;31m:[1;36m1"
	IF ($pos > 0)
		getText CURRENTANSILINE $SHIP_OFFENSIVE_ODDS "Offensive Odds[1;33m:[36m " "[0;31m:[1;36m1"
		stripText $SHIP_OFFENSIVE_ODDS "."
		stripText $SHIP_OFFENSIVE_ODDS " "
		gettext CURRENTANSILINE $SHIP_FIGHTERS_MAX "Max Fighters[1;33m:[36m" "[0;32m Offensive Odds"
		stripText $SHIP_FIGHTERS_MAX ","
		stripText $SHIP_FIGHTERS_MAX " "
	END
	setTextLineTrigger	getshipstats	:setShipOffensiveOdds	"Offensive Odds: "
	pause


:setShipMaxFigAttack
	getWordPos CURRENTANSILINE $pos "[0m[32m Max Figs Per Attack[1;33m:[36m"
	IF ($pos > 0)
		getText CURRENTANSILINE $SHIP_MAX_ATTACK "[0m[32m Max Figs Per Attack[1;33m:[36m" "[0;32mTransWarp"
		striptext $SHIP_MAX_ATTACK " "
	END
	setTextLineTrigger	getshipmaxfighters	:setShipMaxFigAttack	" TransWarp Drive:   "
	pause

# ============================== END GET SHIP STATS TRIGGERS==============================
