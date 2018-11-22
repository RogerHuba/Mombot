#  	Relaoder Version 1.6
#					fixed landign on relog
setVar $VERSION "v1.6"
Gosub :_START_

:settriggers
	killalltriggers
	setTextLineTrigger 1 :sub_reload "Shipboard Computers"
	setTextLineTrigger 2 :landed		"{"&$bot_name&"} - In Cit - Planet"
	pause
:landed
	killalltriggers
	send " q  q  q  q  q  z  n  ** "
	waiton "Warps to Sector(s) :"
	waiton "Command [TL"
	gosub :quikstats
	if ($CURRENT_PROMPT <> "Command")
		send "'{" $bot_name "} - Unable to get to Command Prompt. Halting!*"
		halt
	end
	goto :settriggers
:sub_reload
	killalltriggers
	getWord CURRENTANSILINE $ck 1
	getWord CURRENTLINE $ck2 4
	getWord CURRENTLINE $ck3 5
	getWord CURRENTLINE $ck4 6
	getWord CURRENTLINE $ck5 7
	if ($ck <> "[K[1A[1;33mShipboard")
		goto :Settriggers
	end
	setVar $reloaderline CURRENTLINE
	GetWordPos $reloaderLine $reloaderCheck "destroyed"
	if ($reloaderCheck = 0)
		echo "Found no damage*"
		goto :Settriggers
	end
	While ($reloaderCheck <> 0)
		SetVar $PreviousreloaderLine $reloaderLine
		CutText $PreviousreloaderLine $reloaderLine ($reloaderCheck + 10) 999
		GetWordPos $reloaderLine $reloaderCheck "destroyed"
	end
	GetWordPos $PreviousreloaderLine $reloaderCheck "destroyed"
	CutText $PreviousreloaderLine $PreviousreloaderLine $reloaderCheck 9999
	getText $PreviousreloaderLine $FigDamage "destroyed" "fighters."
	stripText $FigDamage "shield points and"
	getWord $FigDamage $Shield_pnts 1
	getWord $FigDamage $Fig_pnts 2
	if ($shield_pnts > 0)
		add $loss $shield_pnts
	end
	if ($fig_pnts > 0)
		add $loss $fig_pnts
	end
	if ($loss >= $threshold)
		goto :reload
	else
		goto :settriggers
	end

:reload
	killalltriggers
	send "l " $PLANET "*  z  n  z  n  *  m  n  t  *  * "
	setVar $loss 0
	gosub :quikstats
	if ($FIGHTERS < $threshold)
		if ($startingLocation = "Citadel")
			send "c"
		end
		send "'{" $bot_name "} - Planet Too Low On Fighters. Reloader Shutting Down*"
		waitfor "Message sent on sub-space channel"
		halt
	end
	setTextLineTrigger 1 :sub_reload "Shipboard Computers"
	send "q"
	pause


:_START_
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
loadVar $unlimitedGame

# ============================== RELOADER (RELOAD) ==============================
:reloader
	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	if ($startingLocation <> "Citadel") and ($startingLocation <> "Planet")
		send "'{" $bot_name "} - Must start at planet or cit prompt*"
		halt
	end
	if ($parm1 = "on")

	else
		send "'{" $bot_name "} - Please select (on/off) for reloader*"
		halt
	end
	if ($startingLocation = "Citadel")
		send "q"
	end
	gosub :getPlanetInfo
	send "\"
	setTextLineTrigger flee_off :flee_off "Online Auto Flee is disabled."
	setTextLineTrigger flee_on :flee_on "Online Auto Flee is enabled."
	pause

:flee_on
	killtrigger flee_off
	send "\"

:flee_off
	killtrigger flee_on
	isNumber $number $parm2
	if ($number = 0) or ($parm2 = 0)
		setVar $threshold $FIGHTERS
		divide $threshold 2
	else
			setVar $threshold $parm2
	end
	send "'{" $bot_name "} - Reloader "&$VERSION&" Active - Using Planet " $PLANET " - " $threshold " fig threshold*"
	waitfor "Message sent on sub-space channel"
	send "q"
	waiton "Command"
	return
# ============================== RELOADER (RELOAD) ==============================

:quikstats
# ============================ START QUIKSTAT VARIABLES ==========================
	setVar $CURRENT_PROMPT          "Undefined"
	setVar $PSYCHIC_PROBE           "NO"
	setVar $PLANET_SCANNER          "NO"
	setVar $SCAN_TYPE               "NONE"
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



#Author: Mind Dagger
#Gets all planet information from planet prompt.
#Needs: Start from Planet prompt



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
	
setVar $currentBotPlanet $PLANET
saveVar $currentBotPlanet
return
# ==============================  END PLANET INFO SUBROUTINE  =================



