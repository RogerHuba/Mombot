gosub :quikstats
setVar $CNT 0
setVar $BUYER 0
setVar $B 0
setVar $SELLER 0
setVar $S 0
loadVar $GAME~port_max
loadvar $switchboard~BOT_NAME
loadVar $bot~parm1
setvar $port_max $GAME~port_max
setvar $bot_name $switchboard~BOT_NAME
setvar $parm1 $bot~parm1

if ($PORT_MAX = 0)
	send "'{" & $BOT_NAME & "} Unable To Determine Port Max From CFG File*"
	waitfor "Message sent on sub-space channel"
	halt
end

isnumber $tst $parm1
if ($tst = 0)
	setVar $parm1 $PORT_MAX
else
	if ($parm1 > $PORT_MAX)
		setVar $parm1 $PORT_MAX
	end
	if ($parm1 < 1)
		setVar $parm1 $PORT_MAX
	end
end

send "'{" & $BOT_NAME & "} Searching For Ports BUYERS & SELLERS ...*"
waitfor "Message sent on sub-space channel"

getNearestWarps $LOOKUP $CURRENT_SECTOR
setVar $IDX 1
while ($IDX <= $LOOKUP)
	setVar $Focus $LOOKUP[$IDX]
	if (PORT.EXISTS[$Focus])
		if (PORT.CLASS[$Focus] = 2) OR (PORT.CLASS[$Focus] = 3) OR (PORT.CLASS[$Focus] = 4) OR (PORT.CLASS[$Focus] = 8)
			if (PORT.EQUIP[$Focus] >= $parm1)
				getSectorParameter $Focus "FIGSEC" $FIG
				if ($FIG <> "0")
					getDistance $DIST $CURRENT_SECTOR $FOCUS
					if ($DIST = "-1")
						setVar $DIST 0
					end
					if ($DIST < 10)
						setVar $DIST (" " & $DIST)
					end
					add $B 1
					gosub :FORMAT
					setVar $BUYER[$B] $STR
					add $CNT 1
				end
			end
		end
		if (PORT.CLASS[$Focus] = 1) OR (PORT.CLASS[$Focus] = 5) OR (PORT.CLASS[$Focus] = 6) OR (PORT.CLASS[$Focus] = 7)
			if (PORT.EQUIP[$Focus] >= $parm1)
				getSectorParameter $Focus "FIGSEC" $FIG
				if ($FIG <> "0")
					getDistance $DIST $CURRENT_SECTOR $FOCUS
					if ($DIST = "-1")
						setVar $DIST 0
					end
					if ($DIST < 10)
						setVar $DIST (" " & $DIST)
					end
					add $S 1
					gosub :FORMAT
					setVar $SELLER[$S] $STR
					add $CNT 1
				end
			end
		end
	end
	if ($CNT >= 100)
		goto :_END_
	end
	add $IDX 1
end
:_END_
setVar $idx 1
send "'*"
waiton "Type sub-space message"
send "{" & $BOT_NAME & "} GETNEAREST CASHING PORT : " & $CNT & " Found >= "&$parm1&" units*"
getlength "{" & $BOT_NAME & "}" $LEN
setVar $PAD ""
setVar $i 1
while ($i <= $LEN)
	setVar $PAD ($PAD & "-")
	add $i 1
end
send $PAD & "-----------------------------------*"

if ($b <> 0)
	send "BUYERS*"
	while ($idx <= $b)
		send $BUYER[$idx] & "*"
		add $idx 1
	end
end
send "    *"
if ($s <> 0)
	setVar $idx 1
	send "SELLERS*"
	while ($idx <= $s)
		send $SELLER[$idx] & "*"
		add $idx 1
	end
end
send "*"
waiton "Sub-space comm-link terminated"

halt

:FORMAT
	setVar $NUM $FOCUS
	gosub :PAD
	setVar $STR ($PAD & $FOCUS & ", " & $DIST & " hops")
	if (PORT.CLASS[$Focus] = 1)
		setvar $STR ($STR & " BBS")
	elseif (PORT.CLASS[$Focus] = 2)
		setvar $STR ($STR & " BSB")
	elseif (PORT.CLASS[$Focus] = 3)
		setvar $STR ($STR & " SBB")
	elseif (PORT.CLASS[$Focus] = 4)
		setvar $STR ($STR & " SSB")
	elseif (PORT.CLASS[$Focus] = 5)
		setvar $STR ($STR & " SBS")
	elseif (PORT.CLASS[$Focus] = 6)
		setvar $STR ($STR & " BSS")
	elseif (PORT.CLASS[$Focus] = 7)
		setvar $STR ($STR & " SSS")
	elseif (PORT.CLASS[$Focus] = 8)
		setvar $STR ($STR & " BBB")
	end

	setVar $NUM PORT.FUEL[$FOCUS]
	gosub :PAD
	setVar $STR ($STR & " " & $PAD & $NUM & " (" & port.percentfuel[$FOCUS] & "%)")
	if (port.percentfuel[$FOCUS] < 10)
		setVar $STR ($STR & "  ")
	elseif (port.percentfuel[$FOCUS] < 100)
		setVar $STR ($STR & " ")
	end

	setVar $NUM PORT.ORG[$FOCUS]
	gosub :PAD
	setVar $STR ($STR & $PAD & $NUM & " (" & port.percentorg[$FOCUS] & "%)")
	if (port.percentorg[$FOCUS] < 10)
		setVar $STR ($STR & "  ")
	elseif (port.percentorg[$FOCUS] < 100)
		setVar $STR ($STR & " ")
	end

	setVar $NUM PORT.EQUIP[$FOCUS]
	gosub :PAD
	setVar $STR ($STR & " " & $PAD & $NUM & " (" & port.percentequip[$FOCUS] & "%)")
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
				if ($UNLIM)
					setVar $TURNS 65536
				end
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


:PAD
	setVar $PAD ""
	getLength $NUM $LEN
	setVar $PAD_i 1
	while ($PAD_i <= (5 - $LEN))
		setVar $PAD ($PAD & " ")
		add $PAD_i 1
	end
	return