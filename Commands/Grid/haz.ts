	loadVar $bot_name

	gosub :quikstats

	if ($CURRENT_PROMPT <> "Command")
		send "'{" $bot_name "} Start From Command Prompt!*"
		halt
	end
	if ($GENESIS < 10)
		send "'{" $bot_name "} Not Enough Gen Torps!*"
		halt
	end
	if ($ATOMIC < 10)
		send "'{" $bot_name "} Not Enough Atomic Dets!*"
		halt
	end
	if ($CURRENT_SECTOR = 1)
		send "'{" $bot_name "} The intense traffic in sector 1 prohibits planetary construction.*"
		halt
	end

	if ($CURRENT_SECTOR <> STARDOCK)
		setVar $BUFFER ($SHIELDS + $FIGHTERS)
		if ($BUFFER < 5500)
			send "'{" $bot_name "} Not Enough Shields/Fighters***"
			halt
		end
	end

	setVar $START_FIGS		$FIGHTERS
	setVar $START_SHIELDS	$SHIELDS
	setVar $i 1

	getRnd $ID 1000 9999

	setVar $ID ("M()M Haz Maker [" & $ID & "]")

	while ($i <= 10)
    	send "   u   y "
		setTextLineTrigger NoOverLoad	:NoOverload "What do you want to name this planet?"
		setTextLineTrigger Yikes		:Yikes "I'm sorry, but not enough free matter exists."
		setTextTrigger OverLoad 		:Overload "Do you wish to abort?"
		pause
		:Yikes
			killAllTriggers
			send "'{" $bot_name "}  Game Maximum Planets Reached.*"
			send " ** "
			halt
		:Overload
			killTrigger Overload
			send " n "
			pause
		:NoOverload
			killAllTriggers
			send $ID & "*  j  c   "

		add $i 1
	end

	setArray $Registry	10
	setVar $i 1

	send " L"
	waitfor "--------------------------------------------------"
	setTextTrigger		DoneDrawing	:DoneDrawing	"Land on which planet <Q to abort>"
	:Loop
	setTextLineTrigger	Line		:Line			("> " & $ID)
	pause
	:Line
		getText CURRENTLINE $STR "<" ">"
		stripText $STR " "
		setVar $Registry[$i] $STR
		add $i 1
		setTextLineTrigger	Line		:Line			("> " & $ID)
		pause
	:DoneDrawing
		killAllTriggers
		send "*   "
		setVar $i 1
		while ($i <= 10)
			send "  L Z" & #8 & $Registry[$i] & "*   z  d  y  *   "
			add $i 1
		end
	send "  **  "
	gosub :quikstats

    send "'{" $bot_name "} " & SECTOR.NAVHAZ[$CURRENT_SECTOR] & "% Haz Created (Lost " & ($START_FIGS - $FIGHTERS) & " Figs, " & ($START_SHIELDS - $SHIELDS) & " Shields)*"
	halt

:quikstats
	setVar $CURRENT_PROMPT 		"Undefined"
	killtrigger noprompt
	killtrigger prompt1
	killtrigger prompt2
	killtrigger prompt3
	killtrigger prompt4
	killtrigger statlinetrig
	killtrigger getLine2
	setTextTrigger 		prompt1 		:allPrompts 		"(?="
	setTextLineTrigger 	prompt2 		:secondaryPrompts 	"(?)"
	setTextLineTrigger 	statlinetrig 	:statStart 			#179
	setTextTrigger		prompt3         :terraPrompts		"Do you wish to (L)eave or (T)ake Colonists?"
	setTextTrigger		prompt4         :terraPrompts		"How many groups of Colonists do you want to take ("
	send "^Q/"
	pause

	:allPrompts
		getWord currentansiline $checkPrompt 1
		getWord currentline $tempPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $CURRENT_PROMPT $tempPrompt
		end
		setTextLineTrigger prompt1 :allPrompts "(?="
		pause
	:secondaryPrompts
		getWord currentansiline $checkPrompt 1
		getWord currentline $tempPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $CURRENT_PROMPT $tempPrompt
		end
		setTextLineTrigger prompt2 :secondaryPrompts "(?)"
		pause
	:terraPrompts
		killtrigger prompt3
		killtrigger prompt4
		getWord currentansiline $checkPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $CURRENT_PROMPT "Terra"
		end
		setTextTrigger		prompt3         :terraPrompts		"Do you wish to (L)eave or (T)ake Colonists?"
		setTextTrigger		prompt4         :terraPrompts		"How many groups of Colonists do you want to take ("
		pause

	:statStart
		killtrigger prompt1
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
				getWord $stats $TURNS  				($current_word + 1)
			elseif ($wordy = "Creds")
				getWord $stats $CREDITS  			($current_word + 1)
			elseif ($wordy = "Figs")
				getWord $stats $FIGHTERS   			($current_word + 1)
			elseif ($wordy = "Shlds")
				getWord $stats $SHIELDS  			($current_word + 1)
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
				getWord $stats $PHOTONS   			($current_word + 1)
			elseif ($wordy = "Armd")
				getWord $stats $ARMIDS   			($current_word + 1)
			elseif ($wordy = "Lmpt")
				getWord $stats $LIMPETS   			($current_word + 1)
			elseif ($wordy = "GTorp")
				getWord $stats $GENESIS  			($current_word + 1)
			elseif ($wordy = "TWarp")
				getWord $stats $TWARP_TYPE  		($current_word + 1)
			elseif ($wordy = "Clks")
				getWord $stats $CLOAKS   			($current_word + 1)
			elseif ($wordy = "Beacns")
				getWord $stats $BEACONS 			($current_word + 1)
			elseif ($wordy = "AtmDt")
				getWord $stats $ATOMIC  			($current_word + 1)
			elseif ($wordy = "Corbo")
				getWord $stats $CORBO   			($current_word + 1)
			elseif ($wordy = "EPrb")
				getWord $stats $EPROBES   			($current_word + 1)
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
				getWord $stats $CORP   				($current_word + 1)
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
