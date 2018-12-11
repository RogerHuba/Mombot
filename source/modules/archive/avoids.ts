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
	setVar $AVOIDS		" "
	setVar $Temp		""
	setVar $Void_CNT	0
	gosub :quikstats

	if ($CURRENT_PROMPT = "Command") OR ($CURRENT_PROMPT = "Citadel")
		if ($parm1 = "clear")
			isNumber $tst $parm2
			if ($tst)
				if ($parm2 = 0)
					send "cv0*yyq"
					send "'{" $bot_name "} - All Avoids Cleared*"
					halt
				else
					send "cv0*yn" & $parm2 & "*q"
					setTextLineTrigger	Cleared		:Cleared	"has been cleared and will be used in future plots."
					setTextLineTrigger	NoClear		:NoClear	"Invalid sector number"
					pause
					:NoClear
					killAllTriggers
					send "'{" $bot_name "} - Invalid sector number*"
					halt
					:Cleared
					killAllTriggers
					getWord CURRENTLINE $Parm2 1
					isNumber $tst $Parm2
					if ($tst = 0)
						setVar $Parm2 0
					end
					send "'{" $bot_name "} - "&$Parm2&" has been cleared and will be used in future plots.*"
					halt
				end
			else
				send "'{" $bot_name "} - Syntax Error*"
				halt
			end
		elseif ($parm1 = "set")
			isnumber $tst $parm2
			if ($tst)
            	if ($parm2 > 0) and ($parm2 <= sectors)
            		send "cv"&$parm2&"*q"
					setTextLineTrigger		Setted		:Setted		"will now be avoided in future navigation calculations."
					setTextTrigger			NotSet		:NotSet		"Do you wish to clear some avoids?"
					pause
					:NotSet
					killAllTriggers
					send "nq"
					send "'{" $bot_name "} - "&$Parm2&" Is Not a Valid Sector Number*"
					halt
					:Setted
					killAllTriggers
					getWord CURRENTLINE	$Parm2 2
					isNumber $tst $Parm2
					if ($tst = 0)
						setVar $Parm2 0
					end
					send "'{" $bot_name "} - "&$Parm2&" will now be avoided in future navigation calculations.*"
					halt
				end
			else
				send "'{" $bot_name "} - Syntax Error*"
				halt
			end
		end
		send "cxq"
	else
		send "'{" $bot_name "} - Must be started from the Command or Citadel Prompt*"
		halt
	end
	waitfor "<List Avoided Sectors>"
	setTextLineTrigger		NoAvoid	:NoAvoid	"No Sectors are currently being avoided."
	setTextLineTrigger		Done	:Done		"Computer command"
	setTextLineTrigger		Line	:Line
	pause
	:Line
    	if ((CURRENTLINE <> "") AND (CURRENTLINE <> "0"))
			setVar $Temp (" " & CURRENTLINE & " +++ ")
			While ($Temp <> "+++")
				getWord $Temp $Avoided 1
				isNumber $tst $Avoided
				if ($tst <> 0)
					setVar $AVOIDS ($AVOIDS & $Avoided & " ")
					replacetext $Temp (" " & $Avoided & " ") ""
					add $Void_CNT 1
				else
					setVar $Temp "+++"
				end
			end
		end
		setTextLineTrigger		Line	:Line
		pause
	:NoAvoid
		killAlltriggers
		send "'{" $bot_name "} - No Sectors are currently being avoided.*"
		halt
	:Done
		killAllTriggers
		send "'*{" $bot_name "} - " & $Void_CNT & " Avoids Found:*"
		send "  *"
		send $AVOIDS & "**"
		waitfor "Sub-space comm-link terminated"
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