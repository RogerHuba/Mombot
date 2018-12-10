loadVar $user_command_line
loadVar $parm1
loadVar $bot_name
setVar $games $parm1
setVar $gamestoplay $games
setVar $games_played 0
gosub :quikstats
if ((STARDOCK = "") OR (STARDOCK = 0))
	send "'{" $bot_name "} - Tri-Conn - StarDock's Not In TWX DBase!"
	halt
end
if ($CURRENT_SECTOR <> STARDOCK)
	send "'{" $bot_name "} - Tri-Conn Must Be Started at StarDock!"
	halt
end
setVar $INITCREDITS $CREDITS
setVar $prompt $CURRENT_PROMPT
IF (($parm1 = "") or ($parm1 = "0"))
        setVar $towin "YES"
END
IF ($CURRENT_PROMPT = "<Tavern>")
	Goto :Start
ELSEIF ($CURRENT_PROMPT = "<StarDock>")
	send "t"
	Goto :Start
ELSEIF ($CURRENT_PROMPT = "Command")
	#Added Scrub Buffer
	send "psgygqt"
	Goto :Start
ELSE
        send "'{" $bot_name "} - Unknown Prompt.*"
        HALT
END

:start
#send "g"
        send "gny"

:nextRound
        killTrigger 1
        killTrigger 2
        killTrigger 3
        killtrigger 4
        setTextTrigger 1 :done "Play again?"
        setTextLineTrigger 2 :round "Round "
        setTextLineTrigger 3 :won "C o n g r a t u l a t i o n s ! ! ! !"
        setTextLineTrigger 4 :nocred "You ain't got the creds"
        pause

:round
        send "231"
        goto :nextRound

:done
        add $games_played 1
        subtract $games 1
        IF (($games = 0) and ($towin <> "YES"))
                gosub :quikstats
                subtract $CREDITS $INITCREDITS
                send "'{" $bot_name "} - Tri-Conn Played Winning " $CREDITS " in " $games_played " Games.*n"
                goto :end
        END
        send "y"
        goto :nextRound

:won
        subtract $games 1
        add $games_played 1
        IF (($games = 0) and ($towin <> "YES"))
                gosub :quikstats
                subtract $CREDITS $INITCREDITS
                send "'{" $bot_name "} - Tri-Conn Played Winning " $CREDITS " in " $games_played " Games.*n"
                goto :end
        END
        IF ($towin = "YES")
                 gosub :quikstats
                 subtract $CREDITS $INITCREDITS
                 send "'{" $bot_name "} - Tri-Conn Won.  I won " $CREDITS " by playing " $games_played " Games.*"
                 goto :end
        END
        goto :start

:nocred
        gosub :quikstats
        subtract $CREDITS $INITCREDITS
        send "'{" $bot_name "} - Out of Credits.  Tri-Conn Games played Winning " $CREDITS " in " $games_played " Games.*n"

:end
        if ($prompt = "Command")
                send "qqqzn"
        elseif ($prompt = "<StarDock>")
                send "q"
        else
        END
        HALT
        
:quikstats

        # ============================ START QUIKSTAT VARIABLES ==========================
                setVar $CURRENT_PROMPT          "Undefined"
                setVar $PSYCHIC_PROBE           "No"
                setVar $PLANET_SCANNER          "No"
                setVar $SCAN_TYPE               "None"
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
                setVar $STARDOCK_PROMPT         "<StarDock>"
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
# ============================== END QUICKSTATS SUB==============================