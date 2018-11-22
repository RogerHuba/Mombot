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


:start
	gosub :quikstats
	setVar $location $CURRENT_PROMPT
	if ($location <> "Command") and ($location <> "Citadel")
       		send "'{" $bot_name "} - T-warp Saveme must be run from the Command or Citadel Prompt*"
        	halt
	end
:type
	if ($location = "Command")
		setVar $type "TWarp"
		setVar $sector $CURRENT_SECTOR
	elseif ($location = "Citadel")
		setVar $type "BWarp"
		send "qd"
		waitFor "Planet #"
		getWord CURRENTLINE $planet 2
		stripText $planet "#"
		send " t n l 1* t n l 2* t n l 3* s n l 1* s n l 2* s n l 3* t n t 1* c s* "
		setVar $sector $CURRENT_SECTOR
	end

        # Load and reset variable.
        setVar $tsaveme_scrub $parm1

        # Specified scrub? 
        isNumber $number $tsaveme_scrub
        if ($number < 1) OR ($tsaveme_scrub = "") OR ($tsaveme_scrub = "0")
                SetVar $scrub $sector
        else
                SetVar $scrub $tsaveme_scrub
        end

	send "'{" $bot_name "} - " $type " Saveme Active - Awaiting Distress Call. Returns to: " & $scrub & "*"
	
:main
	setTextLineTrigger trigger :trigger "=saveme"
	pause

:trigger
	cutText CURRENTLINE $spoof 1 1
	if ($spoof <> "R")
		goto :main
	end
	getText CURRENTLINE $line "R" "=saveme"
	cutText $line $corpy 2 6
	stripText $line $corpy
	stripText $line "R"
	stripText $line "=saveme"
	stripText $line " "
	setVar $savesec $line
	setVar $pos1 5
:pos_loop
	cutText $corpy $blank_ck $pos1 1
	if ($blank_ck = " ")
		cutText $corpy $corpy 1 $pos1
		subtract $pos1 1
		setVar $check2 1
		goto :pos_loop
	end
	if ($check2 = 1)
		cutText $corpy $corpy 1 $pos1

	end
:cut_zero
	stripText $savesec " "
	cutText $savesec $zero_ck 1 1
	if ($zero_ck = 0)
		cutText $savesec  $savesec 2 5
		goto :cut_zero
	end
	
:save_em
	if ($type = "TWarp")
		setVar $twarp_sector $savesec
		setVar $go 1
		goto :twarp
	elseif ($type = "BWarp")
		setVar $bwarp_sector $savesec
		setVar $go 1
		goto :bwarp
	end
:go1
	send "f"
	setTextLineTrigger total_figs :total_figs "fighters available."
	setTextLineTrigger sec_figs :sec_figs "Your ship can support up to"
	pause

:total_figs
	getWord CURRENTLINE $total_figs 3
	stripText $total_figs ","
	pause
	
:sec_figs 
	getWord CURRENTLINE $sec_figs 10
	stripText $sec_figs ","
	if ($total_figs <= 50000)
		send $total_figs "*cdzn"
	else
		send "50000*cd*"
	end
	send "tfyf"
	setTextLineTrigger corpy_figs :corpy_figs "fighters, and"
	pause

:corpy_figs
        setVar $current_line CURRENTLINE

        setVar $key_idx 1
        while ($key_idx <= 20)
            getword $current_line $wordy $key_idx
            if ($wordy = "has")
                 setVar $ftr_word ($key_idx + 1)
                 goto :got_word_num
            end
            add $key_idx 1
        end

        :got_word_num
        getword $current_line $corpy_figs $ftr_word
        stripText $corpy_figs "."
        stripText $corpy_figs ","

	send $corpy_figs "*qzn"
	send "wy" $corpy "*y*zn"
	send "tfyt" $corpy_figs "*qzn"
	send "f"
	if ($sec_figs > 1)
		send $sec_figs
	else
		send "1"
	end
	send "*c d z n "

:go_scrub
	setVar $twarp_sector $scrub
	setVar $go 2
	goto :twarp
	

# -=-=-=-=-=-=-=-twarp subroutine-=-=-=-=-=-=-=-=-=-
:twarp
	send "m" $twarp_sector "*y"
	waitFor "To which Sector"
	setTextLineTrigger twarp_lock :twarp_lock "TransWarp Locked"
	setTextLineTrigger no_twrp_lock :no_twarp_lock "No locating beam found"
	setTextLineTrigger twarp_adj :twarp_adj "<Set NavPoint>"
	setTextLineTrigger no_ore :no_ore "You do not have enough Fuel Ore"
	pause


:no_ore
	send "'OZ " $type " Saveme - No ore!!*"
	halt


:twarp_adj
	send "**"
	killAllTriggers
	if ($go = 1)
		goto :go1
	elseif ($go = 2)
		goto :go2
	end

:twarp_lock
	KillAlltriggers
	send "y*"
	waitFor "Warps to Sector(s)"
	if ($go = 1)
		goto :go1
	elseif ($go = 2)
		goto :go2
	end

:no_twarp_lock
	killAllTriggers
	send "n*"
	send "'OZ " $type " Saveme - Can't Get Lock! - Fig and Call Save!*"
	goto :main

# -=-=-=-=-=-=-=- bwarp subroutine -=-=-=-=-=-=-=-=-=-
:bwarp
	send "b" $bwarp_sector "*"
	setTextLineTrigger beam_lock :beam_lock "TransWarp Locked"
	setTextLineTrigger no_beam_lock :no_beam_lock "No locating beam found"
	pause
:beam_lock
	killAllTriggers
	send "y*"
	waitFor "Warps to Sector(s)"
	if ($go = 1)
		goto :go1
	elseif ($go = 2)
		goto :go2
	end

:no_beam_lock
	killAllTriggers
	send "n*"
	send "'{" $bot_name "} - " $type " Saveme - Can't Get Lock! - Fig and Call Save!*"
	goto :main
	
# -=-=-=-=-=- ending -=-=-=-=-=-=--=
:go2
        send " w * * z q n z q n "
	gosub :quikstats
        if ($type = "BWarp")
              setTextLineTrigger not_at_home :exit_completely "That planet is not in this sector."
              send " l " & $planet & "*"
              waitfor "Landing sequence engaged..."
              send " t n l 1* t n l 2* t n l 3* s n l 1* s n l 2* s n l 3* t n t 1* c s* "
		if ($CURRENT_SECTOR = $sector)
			send "'{" $bot_name "} - " $type " Saveme - Arrived at Return Sector. Ready for another save.*"
		end
              goto :main
        else
		if ($tsaveme_scrub = $CURRENT_SECTOR)
			send "'{" $bot_name "} - " $type " Saveme - Arrived at Scrub Sector.*"
			send "'{" $bot_name "} - " $type " Saveme - Please Exit/Enter to Remove Limpet.*"
		end
		send "'{" $bot_name "} - " $type " Saveme - Powering Down...*"
		send "**"
		halt
        end
halt

:exit_completely
send "'{" $bot_name "} - " $type " Saveme - Arrived at Scrub Sector.*"
send "'{" $bot_name "} - " $type " Saveme - Please Exit/Enter to Remove Limpet.*"
send "'{" $bot_name "} - Saveme - Powering Down...*"
send "**"
halt


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

