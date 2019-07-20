loadVar $bot~user_command_line
loadVar $bot~parm1
loadVar $bot~parm2
loadVar $bot~parm3
loadVar $bot~parm4
loadVar $bot~parm5
loadVar $bot~parm6
loadVar $bot~parm7
loadVar $bot~parm8
loadVar $switchboard~bot_name


:start
	gosub :player~quikstats
	setVar $location $player~current_prompt
	if ($location <> "Command") and ($location <> "Citadel")
       		send "'{" $switchboard~bot_name "} - T-warp Saveme must be run from the Command or Citadel Prompt*"
        	halt
	end
:type
	if ($location = "Command")
		setVar $type "TWarp"
		setVar $sector $player~current_sector
	elseif ($location = "Citadel")
		setVar $type "BWarp"
		send "qd"
		waitFor "Planet #"
		getWord CURRENTLINE $planet~planet 2
		stripText $planet~planet "#"
		send " t n l 1* t n l 2* t n l 3* s n l 1* s n l 2* s n l 3* t n t 1* c s* "
		setVar $sector $player~current_sector
	end

        # Load and reset variable.
        setVar $tsaveme_scrub $bot~parm1

        # Specified scrub? 
        isNumber $number $tsaveme_scrub
        if ($number < 1) OR ($tsaveme_scrub = "") OR ($tsaveme_scrub = "0")
                SetVar $scrub $sector
        else
                SetVar $scrub $tsaveme_scrub
        end

	send "'{" $switchboard~bot_name "} - " $type " Saveme Active - Awaiting Distress Call. Returns to: " & $scrub & "*"
	
:main
	setTextLineTrigger trigger :trigger "=saveme"
	pause

:trigger
	cutText CURRENTLINE $spoof 1 1
	if ($spoof <> "R")
		goto :main
	end
	getText CURRENTLINE $line "R" "=saveme"
	cutText $line $player~corpy 2 6
	stripText $line $player~corpy
	stripText $line "R"
	stripText $line "=saveme"
	stripText $line " "
	setVar $savesec $line
	setVar $pos1 5
:pos_loop
	cutText $player~corpy $blank_ck $pos1 1
	if ($blank_ck = " ")
		cutText $player~corpy $player~corpy 1 $pos1
		subtract $pos1 1
		setVar $check2 1
		goto :pos_loop
	end
	if ($check2 = 1)
		cutText $player~corpy $player~corpy 1 $pos1

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
        getword $current_line $player~corpy_figs $ftr_word
        stripText $player~corpy_figs "."
        stripText $player~corpy_figs ","

	send $player~corpy_figs "*qzn"
	send "wy" $player~corpy "*y*zn"
	send "tfyt" $player~corpy_figs "*qzn"
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
	send "'{" $switchboard~bot_name "} - " $type " Saveme - Can't Get Lock! - Fig and Call Save!*"
	goto :main
	
# -=-=-=-=-=- ending -=-=-=-=-=-=--=
:go2
        send " w * * z q n z q n "
	gosub :player~quikstats
        if ($type = "BWarp")
              setTextLineTrigger not_at_home :exit_completely "That planet is not in this sector."
              send " l " & $planet~planet & "*"
              waitfor "Landing sequence engaged..."
              send " t n l 1* t n l 2* t n l 3* s n l 1* s n l 2* s n l 3* t n t 1* c s* "
		if ($player~current_sector = $sector)
			send "'{" $switchboard~bot_name "} - " $type " Saveme - Arrived at Return Sector. Ready for another save.*"
		end
              goto :main
        else
		if ($tsaveme_scrub = $player~current_sector)
			send "'{" $switchboard~bot_name "} - " $type " Saveme - Arrived at Scrub Sector.*"
			send "'{" $switchboard~bot_name "} - " $type " Saveme - Please Exit/Enter to Remove Limpet.*"
		end
		send "'{" $switchboard~bot_name "} - " $type " Saveme - Powering Down...*"
		send "**"
		halt
        end
halt

:exit_completely
send "'{" $switchboard~bot_name "} - " $type " Saveme - Arrived at Scrub Sector.*"
send "'{" $switchboard~bot_name "} - " $type " Saveme - Please Exit/Enter to Remove Limpet.*"
send "'{" $switchboard~bot_name "} - Saveme - Powering Down...*"
send "**"
halt


:player~quikstats

        # ============================ START QUIKSTAT VARIABLES ==========================
                setVar $player~current_prompt          "Undefined"
                setVar $player~psychic_probe           "No"
                setVar $player~planet_scanner          "No"
                setVar $player~scan_type               "None"
                setVar $player~current_sector          0
                setVar $player~turns                   0
                setVar $player~credits                 0
                setVar $player~fighters                0
                setVar $player~shields                 0
                setVar $player~total_holds             0
                setVar $player~ore_holds               0
                setVar $player~organic_holds           0
                setVar $player~equipment_holds         0
                setVar $player~colonist_holds          0
                setVar $player~photons                 0
                setVar $player~armids                  0
                setVar $player~limpets                 0
                setVar $player~genesis                 0
                setVar $player~twarp_type              0
                setVar $player~cloaks                  0
                setVar $player~beacons                 0
                setVar $player~atomic                  0
                setVar $player~corbo                   0
                setVar $player~eprobes                 0
                setVar $player~mine_disruptors         0
                setVar $player~alignment               0
                setVar $player~experience              0
                setVar $player~corp                    0
                setVar $player~ship_number             0
                setVar $player~turns_PER_WARP          0
        # ============================ END QUIKSTAT VARIABLES ==========================

     	setVar $player~current_prompt 		"Undefined"
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
		getWord CURRENTLINE $player~current_prompt 1
		stripText $player~current_prompt #145
		stripText $player~current_prompt #8
		#getWord currentansiline $checkPrompt 1
		#getWord currentline $tempPrompt 1
		#getWordPos $checkPrompt $pos "[35m"
		#if ($pos > 0)
		#	setVar $player~current_prompt $tempPrompt
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
				getWord $stats $player~current_sector   	($current_word + 1)
			elseif ($wordy = "Turns")
				getWord $stats $player~turns  			($current_word + 1)
			elseif ($wordy = "Creds")
				getWord $stats $player~credits  		($current_word + 1)
			elseif ($wordy = "Figs")
				getWord $stats $player~fighters   		($current_word + 1)
			elseif ($wordy = "Shlds")
				getWord $stats $player~shields  		($current_word + 1)
			elseif ($wordy = "Hlds")
				getWord $stats $player~total_holds   		($current_word + 1)
			elseif ($wordy = "Ore")
				getWord $stats $player~ore_holds    		($current_word + 1)
			elseif ($wordy = "Org")
				getWord $stats $player~organic_holds    	($current_word + 1)
			elseif ($wordy = "Equ")
				getWord $stats $player~equipment_holds    	($current_word + 1)
			elseif ($wordy = "Col")
				getWord $stats $player~colonist_holds    	($current_word + 1)
			elseif ($wordy = "Phot")
				getWord $stats $player~photons   		($current_word + 1)
			elseif ($wordy = "Armd")
				getWord $stats $player~armids   		($current_word + 1)
			elseif ($wordy = "Lmpt")
				getWord $stats $player~limpets   		($current_word + 1)
			elseif ($wordy = "GTorp")
				getWord $stats $player~genesis  		($current_word + 1)
			elseif ($wordy = "TWarp")
				getWord $stats $player~twarp_type  		($current_word + 1)
			elseif ($wordy = "Clks")
				getWord $stats $player~cloaks   		($current_word + 1)
			elseif ($wordy = "Beacns")
				getWord $stats $player~beacons 		($current_word + 1)
			elseif ($wordy = "AtmDt")
				getWord $stats $player~atomic  		($current_word + 1)
			elseif ($wordy = "Corbo")
				getWord $stats $player~corbo   		($current_word + 1)
			elseif ($wordy = "EPrb")
				getWord $stats $player~eprobes   		($current_word + 1)
			elseif ($wordy = "MDis")
				getWord $stats $player~mine_disruptors   	($current_word + 1)
			elseif ($wordy = "PsPrb")
				getWord $stats $player~psychic_probe  		($current_word + 1)
			elseif ($wordy = "PlScn")
				getWord $stats $player~planet_scanner  	($current_word + 1)
			elseif ($wordy = "LRS")
				getWord $stats $player~scan_type    		($current_word + 1)
			elseif ($wordy = "Aln")
				getWord $stats $player~alignment    		($current_word + 1)
			elseif ($wordy = "Exp")
				getWord $stats $player~experience    		($current_word + 1)
			elseif ($wordy = "Corp")
				getWord $stats $player~corp   			($current_word + 1)
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
# ============================== END QUICKSTATS SUB==============================

