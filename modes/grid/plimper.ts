setVar $LIMIT 100
setVar $TAGLINE "'[PLIMP] "
setVar $VERSION "1.1a"
gosub :player~quikstats
if (STARDOCK < 1)
	send $TAGLINE & "StarDock Not Known*"
	waitfor "Message sent on sub-space channel"
	halt
end
if ($player~current_prompt <> "Citadel")
	send $TAGLINE & "Start In Citadel*"
	waitfor "Message sent on sub-space channel"
	halt
end
if ($TWARP_TYPE = "No")
	send $TAGLINE & "Must Have TWARP DRIVE*"
	waitfor "Message sent on sub-space channel"
	halt
end

send $TAGLINE & "Trader Vics Limpet Tracker Avoidance Script Powering Up!*"
waiton "Message sent on sub-space channel"
waiton "elp"
if ($ALIGNMENT < 1000)
	send $TAGLINE & "Blue check failed, this script loads limps from sd.*"
	waitfor "Message sent on sub-space channel"
	halt
end

loadVar $bot~user_command_line
loadVar $switchboard~bot_name


setvar $TEMP (" " & $bot~user_command_line & " ")
getwordPos $TEMP $pos "saveme"
if ($pos <> 0)
	stop "_ck_saveme.cts"
	stop "_ck_saveme.cts"
	stop "_ck_saveme.cts"
	load "_ck_saveme.cts"
	waiton "CK Advanced Saveme v. 3.0.0 - Running from planet"
end

setVar $MAC ""
if ($ORE_HOLDS <> 0)
	setVar $MAC ($MAC & " T N L 1* ")
end
if ($ORGANIC_HOLDS <> 0)
	setVar $MAC ($MAC & " T N L 2* ")
end
if ($EQUIPMENT_HOLDS <> 0)
	setVar $MAC ($MAC & " T N L 3* ")
end

send "tf5000000* q" & $MAC & " t n t 1* dc"
waiton "Planet #"
getWord CURRENTLINE $PLANET 2
stripText $PLANET " "
stripText $PLANET "#"
waiton "<Enter Citadel>"

gosub :MSGS_OFF
send "sn*"
waiton "Sector  :"
waiton "Warps to Sector(s) :"
gosub :MSGS_ON
setVar $figOwner SECTOR.FIGS.OWNER[$player~current_sector]
if (($figOwner <> "belong to your Corp") AND ($figOwner <> "yours"))
	send $TAGLINE & "*No Fighter Present In Current Sector*"
	waitfor "Message sent on sub-space channel"
	halt
end
if (SECTOR.LIMPETS.OWNER[$player~current_sector] <> "yours")
	setVar $DROP $LIMPETS
	add $DROP SECTOR.LIMPETS.QUANTITY[$player~current_sector]

	if ($DROP > 250)
		setVar $DROP 250
	end

	send " Q Q H 2 Z " & $DROP & "* Z P * L " & $PLANET & "* C "
end
send $TAGLINE & "Blue check passed, alignment entered as " & $alignment & "*"
waitfor "Message sent on sub-space channel"
send $TAGLINE & "Version "&$VERSION&" - Script activated!*"
waitfor "Message sent on sub-space channel"
send $TAGLINE & "As long as there is cash in cit i will keep sector loaded with personal limps.*"
waitfor "Message sent on sub-space channel"


:reload_limps
	gosub :player~quikstats
	if ($TOTAL_HOLDS <> $ORE_HOLDS)
		Echo $TAGLINE & "Planet Short On Gas*"
		waitfor "Message sent on sub-space channel"
		halt
	end
	send " C R " & STARDOCK & "*Q "
	setTextLineTrigger	itsalive 	:itsalive		"Items     Status  Trading % of max OnBoard"
	setTextLineTrigger	nosoupforme	:nosoupforme	"I have no information about a port in that sector"
	setDelayTrigger		WeHaveAProb	:WeHaveAProb	3000
	pause
	:WeHaveAProb
		killAllTriggers
		waitfor "Citadel command"
		Echo "*Unexpected Problem. Halting.*"
		halt
	:nosoupforme
		killAllTriggers
		waitfor "Citadel command"
		Echo "*Dock Is gone*"
		halt
	:itsalive
		killAllTriggers
		waitfor "Citadel command"

	send "Q Q M " & STARDOCK & "* Y"
	waiton "Federation beacon acknowledged,"
	send "y    p s g y g q h "
	waitfor "<Hardware Emporium>"
	send "l"
	waitfor "How many mines do you want"
	gettext CURRENTLINE $buylimps "(Max" ")"
	send $buylimps "*q q  "
	send "m " & $player~current_sector & "* y y * l " $planet "* c "
	waitfor "Citadel command"

	gosub :player~quikstats

	if ($player~current_prompt <> "Citadel")
		send $TAGLINE & "*Not In Citadel. Something's Wrong*"
		waitfor "Message sent on sub-space channel"
		halt
	end

	if ($LIMPETS < 10)
		send $TAGLINE & "Furb Failed. Halting*"
		waitfor "Message sent on sub-space channel"
		halt
	end

    if ($player~fighters < 100)
    	send $TAGLINE & "Ship Fighters Below 100. Kinda Dangerous*"
    	waitfor "Message sent on sub-space channel"
    	halt
    end

	if ($CREDITS > 50000)
		send "tt" & ($CREDITS - 50000) & "*"
		waiton "How much to transfer?"
	end

:rerun
if (SECTOR.LIMPETS.QUANTITY[$player~current_sector] < $LIMIT) OR ($LIMPETS < ($LIMIT + 10))
	send "tf6000000* q t n t 1* m n t * q h 2 z 250* z p * dl " & $PLANET & "* C "
	waiton "Sector  :"
	waiton "Warps to Sector(s) :"
	waiton "Citadel command"
	if (SECTOR.LIMPETS.OWNER[$player~current_sector] <> "yours") OR (SECTOR.LIMPETS.QUANTITY[$player~current_sector] < 1)
		send $TAGLINE & "Unable To Drop Personal Limps*"
		waitfor "Message sent on sub-space channel"
		halt
	end
	send $TAGLINE & SECTOR.LIMPETS.QUANTITY[$player~current_sector] & " mines deployed personal*"
	waitfor "Message sent on sub-space channel"
	goto :reload_limps
end

killAllTriggers
Echo ANSI_15 & "***                    "&ANSI_14&"!!"&ANSI_15&" WAITING FOR LIMP HIT "&ANSI_14&"!!"&"*"
Echo ANSI_7 & "                       Press "&ANSI_14&"@"&ANSI_7&" To Force A Furb**"
setTextLineTrigger	HIT		:HIT	"Limpet mine in " & $player~current_sector & " activated"
setTextOutTrigger	FURBME	:FURBME	"@"
setTextTrigger 		P1 		:Paused "Planet command (?=help) [D]"
setTextTrigger 		P2 		:Paused "] (?=Help)?"
setTextTrigger 		P3 		:Paused "Beam to what sector? (U=Upgrade Q=Quit)"
setTextTrigger 		P4 		:Paused "Transfer To or From the Planetary Shield System (T/F) [T]?"
setTextTrigger 		P5 		:Paused "Qcannon Control Type :"
setTextTrigger 		P6 		:Paused "What level do you want (0-100) ?"
setTextTrigger 		P7 		:Paused "Do you want to change this setting? (Y/N)"
setTextTrigger 		P8 		:Paused "What sector do you want to warp this planet to? (Q to Abort)"
setTextTrigger 		P9 		:Paused "Transfer To or From the Treasury (T/F) [F]?"
setTextTrigger 		P10 	:Paused "[Pause]"
setTextTrigger 		P11 	:Paused "Sub-space radio"
setTextTrigger 		P12 	:Paused "Federation comm-link:"
pause
:Paused
killalltriggers
echo "**" ANSI_11 "Paused. Return to Cidadel Prompt to Restart.**"
setTextLineTrigger	HIT2		:HIT2	"Limpet mine in " & $player~current_sector & " activated"
setDelayTrigger		REMINDER	:PAUSED 180000
waiton "Citadel command (?="
goto :rerun
:HIT2
#this tracks limp hits while script is paused
killAllTriggers
subtract $LIMPETS 1
if (SECTOR.LIMPETS.QUANTITY[$player~current_sector] < $LIMIT) OR ($LIMPETS < ($LIMIT + 10))
	ECHO "***"& ANSI_12 & "                     !!!"&ANSI_15&" LIMPET LIMIT REACHED " &ANSI_12&"!!!***"
end
goto :Paused
:HIT
killAllTriggers
subtract $LIMPETS 1
goto :rerun
:FURBME
killAllTriggers
gosub :player~quikstats
if ($player~current_prompt <> "Citadel")
	send $TAGLINE & "Wrong Prompt. Halting*"
	halt
end
send "sn*"
waiton "Sector  :"
waiton "Warps to Sector(s) :"
goto :rerun

:player~quikstats
	setVar $player~current_prompt 		"Undefined"
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
			setVar $player~current_prompt $tempPrompt
		end
		setTextLineTrigger prompt1 :allPrompts "(?="
		pause
	:secondaryPrompts
		getWord currentansiline $checkPrompt 1
		getWord currentline $tempPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $player~current_prompt $tempPrompt
		end
		setTextLineTrigger prompt2 :secondaryPrompts "(?)"
		pause
	:terraPrompts
		killtrigger prompt3
		killtrigger prompt4
		getWord currentansiline $checkPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $player~current_prompt "Terra"
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
				getWord $stats $player~current_sector   	($current_word + 1)
			elseif ($wordy = "Turns")
				getWord $stats $TURNS  				($current_word + 1)
				if ($UNLIM)
					setVar $TURNS 65536
				end
			elseif ($wordy = "Creds")
				getWord $stats $CREDITS  			($current_word + 1)
			elseif ($wordy = "Figs")
				getWord $stats $player~fighters   			($current_word + 1)
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
				getWord $stats $player~planet_scanner  	($current_word + 1)
			elseif ($wordy = "LRS")
				getWord $stats $SCAN_TYPE    		($current_word + 1)
			elseif ($wordy = "Aln")
				getWord $stats $ALIGNMENT    		($current_word + 1)
			elseif ($wordy = "Exp")
				getWord $stats $EXPERIENCE    		($current_word + 1)
			elseif ($wordy = "Corp")
				getWord $stats $CORP   				($current_word + 1)
			elseif ($wordy = "Ship")
				getWord $stats $player~ship_number   		($current_word + 1)
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

:MSGS_ON
    :ON_AGAIN
    setTextTrigger onMSGS_ON  :onMSGS_ON "Displaying all messages."
    setTextTrigger onMSGS_OFF :onMSGS_OFF "Silencing all messages."
    send "|"
    pause
    :onMSGS_OFF
    killAllTriggers
    goto :ON_AGAIN
    :onMSGS_ON
    killAllTriggers
    setVar $MSGS_ON TRUE
    return

:MSGS_OFF
    :OFF_AGAIN
    setTextTrigger offMSGS_OFF :offMSGS_OFF "Silencing all messages."
    setTextTrigger offMSGS_ON  :offMSGS_ON "Displaying all messages."
    send "|"
    pause
    :offMSGS_ON
    killAllTriggers
    goto :OFF_AGAIN
    :offMSGS_OFF
    setVar $MSGS_ON FALSE
    killAllTriggers
    return
