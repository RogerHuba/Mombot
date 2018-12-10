	loadvar $bot_name
	loadvar $parm1

	
	gosub :quikstats
	setVar $Location $CURRENT_PROMPT
	setVar $array_cnt 0
	setVar $planet 0

	if ($CURRENT_PROMPT = "Citadel")
		if ($parm1 <> 0)
			#get currnet planet number
			send "Q"
			gosub :GetPlanetNumber
			send "  Q  "
			setVar $LandOn $parm1
			gosub :Land_OnPlanet
			if ($LANDED)
				send " D"
				gosub :start
			else
				send " Q  Q  Q  Z  N  *  L Z"&#8&$Planet&"*  *  J  C  *  "
				send "'{" $bot_name "} PScan - Problem landing on Planet #"&$parm1&".*"
				halt
			end
			send " Q  Q  Q  Z  N  *  "
			setVar $LandOn $Planet
			gosub :Land_OnPlanet
			if ($LANDED = 0)
				send "'{" $bot_name "} PScan - Problem relanding on starting Planet #"&$planet&".*"
				halt
			else
				gosub :SpitItOut
				send " C '{" $bot_name "} PScan - Back In Citadel on Planet #"&$planet&".*"
				halt
			end
		else
			send " Q D"
			waitfor "Planet command"
			gosub :start
			gosub :SpitItOut
			send " C  '{" $bot_name "} PScan - Back In Citadel.*"
			halt
		end
	elseif ($CURRENT_PROMPT = "Planet")
		if ($parm1 <> 0)
			#get currnet planet number
			gosub :GetPlanetNumber
			send "  Q  "
			setVar $LandOn $parm1
			gosub :Land_OnPlanet
			if ($LANDED)
				send " D"
				gosub :start
			else
				send " Q  Q  Q  Z  N  *  L Z"&#8&$Planet&"*  *  J  C  *  "
				send "'{" $bot_name "} PScan - Problem landing on Planet #"&$parm1&".*"
				halt
			end
			send " Q  Q  Q  Z  N  *  "
			setVar $LandOn $Planet
			gosub :Land_OnPlanet
			if ($LANDED = 0)
				send "'{" $bot_name "} PScan - Problem relanding on starting Planet #"&$planet&".*"
				halt
			else
				gosub :SpitItOut
				send "'{" $bot_name "} PScan - Back on Planet #"&$planet&" (Planet Command Prompt).*"
				halt
			end
		else
			send "D"
			waitfor "Planet command"
			gosub :start
			gosub :SpitItOut
			send "'{" $bot_name "} PScan - At Planet Prompt.*"
			halt
		end
	elseif ($CURRENT_PROMPT = "Command")
		if ($parm1 = 0)
			send "'{" $bot_name "} PScan - If Starting From Sector Please Specify Planet Number.*"
			halt
		end
		setVar $LandOn $parm1
		gosub :Land_OnPlanet
		if ($LANDED)
			send " D"
			gosub :start
		else
			send " Q  Q  Q  Z  N  * "
			send "'{" $bot_name "} PScan - Problem landing on Planet #"&$parm1&".*"
			halt
		end
		send " Q  Q  Q  Z  N  *  "
		gosub :SpitItOut
		send "'{" $bot_name "} PScan - Back At Command Prompt.*"
	else
		send "'{" & $bot_name & "} PScan - Please Start from Command, Citadel, or Planet Prompt*"
	end
	halt

:start
		setArray $scan_array 30
		setVar $idx 0
		:continuescan
		setTextTrigger done :done "Planet command"
		setTextLineTrigger line_trig :parse_scan_line
		pause
	:parse_scan_line
		killTrigger line_trig
		setVar $s CURRENTLINE
		if (($s = "") OR ($s = 0))
			setVar $s "          "
		end

		getWordPos $s $pos "Fuel Ore"
		if ($pos <> 0)
			getWord $s $t 7
			getlength $t $len
			setVar $len (11 - $len)
			setVar $i 1
			setVar $u ""
			while ($i<= $len)
				setVar $u ($u & " ")
    			add $i 1
    		end
			replaceText $s ($u&$t) ""
		end
		getWordPos $s $pos "Organics"
		if ($pos <> 0)
			getWord $s $t 6
			getlength $t $len
			setVar $len (11 - $len)
			setVar $i 1
			setVar $u ""
			while ($i<= $len)
				setVar $u ($u & " ")
    			add $i 1
    		end
			replaceText $s ($u&$t) ""
		end
		getWordPos $s $pos "Equipment"
		if ($pos <> 0)
			getWord $s $t 6
			getlength $t $len
			setVar $len (11 - $len)
			setVar $i 1
			setVar $u ""
			while ($i<= $len)
				setVar $u ($u&" ")
    			add $i 1
    		end
			replaceText $s ($u&$t) ""
		end
		getWordPos $s $pos "Fighters "
		if ($pos <> 0)
			getWord $s $t 6
			getlength $t $len
			setVar $len (11 - $len)
			setVar $i 1
			setVar $u ""
			while ($i<= $len)
				setVar $u ($u & " ")
    			add $i 1
    		end
			replaceText $s ($u&$t) ""
		end
		replacetext $s "  Item    Colonists  Colonists    Daily     Planet      Ship      Planet" "Item  Colonists Colonists    Daily     Planet    Planet"
		replaceText $s "           (1000s)   2 Build 1   Product    Amount     Amount     Maximum"  "       (1000s)  2 Build 1   Product    Amount    Maximum"
		replaceText $s " -------  ---------  ---------  ---------  ---------  ---------  ---------" "---  ---------  ---------  ---------  ---------  ---------"
		replaceText $s "Fuel Ore" "Ore"
		replaceText $s "Organics" "Org"
		replaceText $s "Equipment" "Equ "
		replaceText $s "Fighters " "Figs"
		replaceText $s "Military reaction" "Mil-React"

		add $idx 1
		setVar $scan_array[$idx] $s
		killAllTriggers
		goto :continuescan
	:done
		killAllTriggers
	return

:SpitItOut
	setVar $i 1
	send "'*"
	waitFor "Comm-link open on sub-space band"
	while ($i <= $idx)
    	send $scan_array[$i] & "*"
	    add $i 1
	end

	send "*  "
	waitFor "Sub-space comm-link terminated"
	return

:Land_OnPlanet
	setVar $LANDED FALSE
	send ("L"&$LandOn&"*Z  N  Z  N  *  ")
	setTextLineTrigger NoPlanet1	:NoPlanet	"There isn't a planet in this sector."
	setTextLineTrigger NoPlanet2	:NoPlanet	"That planet is not in this sector."
	setTextLineTrigger NotLanded 	:NotLanded	"since it couldn't possibly stand"
	setTextLineTrigger Landed		:Landed		"Planet #"
	pause
	:NoPlanet
		killAllTriggers
		send ("'{" & $bot_name & "} - Planet #" & $LandOn & ", not in Sector!*")
		return
	:NotLanded
		killAllTriggers
		send ("'{" & $bot_name & "} - This ship cannot land!*")
		return
	:Landed
		killAllTriggers
		setVar $LANDED TRUE
		waitfor "<Destroy Planet>"
		waitfor "Planet command"
		return

:GetPlanetNumber
	setTextLineTrigger PlanetNumber		:PlanetNumber	"Planet #"
	setTextLineTrigger Done				:DoneE			"Planet command"
	send " D"
	waitfor "Planet command"
	pause
	:PlanetNumber
		killTrigger PlanetNumber
		getWord CURRENTLINE $Planet 2
		stripText $Planet "#"
		isNumber $tst $Planet
		if ($tst = 0)
			send "'{" $bot_name "} PScan - Unable To Obtain Current Planet Number*"
			send "C"
			halt
		end
	:DoneE
		killAllTriggers
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
