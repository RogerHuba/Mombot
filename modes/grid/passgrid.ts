	logging off
	reqRecording
#Ender Passive Grid, version 1.0
#This is to be used in games where hitting enemy figs is NOT an option. But gridding is to be done all the same.
loadVar $switchboard~bot_name
loadVar $bot~user_command_line
loadVar $bot~parm1
loadVar $bot~parm2
loadVar $bot~parm3
loadVar $bot~parm4
loadVar $bot~parm5
loadVar $bot~parm6
loadVar $bot~parm7
loadVar $bot~parm8
loadVar $stardock
loadVar $rylos
loadVar $alpha_centauri
loadVar $home_sector

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
                setVar $COMMAND_PROMPT          "Command"
                setVar $COMPUTER_PROMPT         "Computer"
                setVar $planet~CITADEL_PROMPT          "Citadel"
                setVar $planet~planet_PROMPT           "Planet"
                setVar $player~corpORATE_PROMPT        "Corporate"
                setVar $STARDOCK_PROMPT         "<Stardock>"
                setVar $HARDWARE_PROMPT         "<Hardware"
                setVar $SHIPYARD_PROMPT         "<Shipyard>"
                setVar $TERRA_PROMPT            "Terra"
        # ============================ END QUIKSTAT VARIABLES ==========================

getWord $bot~user_command_line $bot~parm1 1
getWord $bot~user_command_line $bot~parm2 2
getWord $bot~user_command_line $bot~parm3 3
getWord $bot~user_command_line $bot~parm4 4
getWord $bot~user_command_line $bot~parm5 5
getWord $bot~user_command_line $bot~parm6 6
getWord $bot~user_command_line $bot~parm7 7
getWord $bot~user_command_line $bot~parm8 8


	if ($bot~parm1 = "help")
	        send "'*{" $switchboard~bot_name "} passgrid - passgrid [limpets] [mines] **"
		halt
	end
	
	setArray $warp 7
	setArray $warpCount 7
	setArray $density 7
	setArray $weight 7
	setArray $anom 7
	setArray $explored 7

	gosub :player~quikstats
	setVar $startingLocation $player~current_prompt
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
		send "'{" $switchboard~bot_name "} - Passive gridder must be run from Command or Citadel prompt.*"
		halt	
	end
	if (($player~scan_type <> "Holo") AND ($player~scan_type <> "Dens"))
		send "'{" $switchboard~bot_name "} - Must have at least Density scanner to run passive gridder.*"
		halt
	end
	getWordPos " "&$bot~user_command_line&" " $pos " f "
	if ($pos > 0)
		setVar $deployfigs TRUE
	else
		setVar $deployfigs FALSE
	end
	getWordPos " "&$bot~user_command_line&" " $pos " l "
	if ($pos > 0)
		setVar $deploylimpets TRUE
	else
		setVar $deploylimpets FALSE
	end
	getWordPos " "&$bot~user_command_line&" " $pos " m "
	if ($pos > 0)
		setVar $deploymines TRUE
	else
		setVar $deploymines FALSE
	end
	send "qqq* "
:start
	setVar $counter 0

:sub_Scan
	send "s"
	setVar $limps 2
	setVar $mines 1
	waitFor "Long Range Scan"
	send "d"
  
  	waitFor "Relative Density Scan"

  	setVar $i 1
  	while ($i <= 7)
	  	setVar $warp[$i] 0
  		setVar $warpCount[$i] 0
  		setVar $density[$i] "-1"
  		setVar $weight[$i] 9999
  		setVar $anom[$i] "No"
  		setVar $explored[$i] 1
  		add $i 1
	end
  	setVar $i 1
  	setTextLineTrigger 1 :getWarp "Sector "
  	setTextTrigger 2 :gotWarps "Command [TL="
  	pause
  	:getWarp
  		setVar $line CURRENTLINE
  		stripText $line "("
  		getWord $line $warp 2
  		getWord $line $density 4
  		getWord $line $warpCount 7
  		getWord $line $anom 13
  		getLength $warp $length
  		cutText $warp $explored $length 1
  		if ($explored = ")")
  		  	setVar $explored 0
  		else
  		  	setVar $explored 1
  		end
  		stripText $warp ")"
  		stripText $density ","
  		setVar $warp[$i] $warp
  		setVar $density[$i] $density
  		setVar $warpCount[$i] $warpCount
  		setVar $anom[$i] $anom
  		setVar $explored[$i] $explored
  		add $i 1
  		setTextLineTrigger 1 :getWarp "Sector "
  		pause
  	:gotWarps
  		killTrigger 1
  		killTrigger 2

	  	setVar $i 1
	  	setVar $bestWarp 1
	  	setVar $holo 0
  	:weightWarp
	  	while ($warp[$i] > 0)
		    	setVar $weight[$i] 0
		    	if ($density[$i] <> 100) and ($density[$i] <> 0)
			      	add $weight[$i] 100
			      	add $weight[$i] $density[$i]
			      	setVar $holo 1
		    	end
		    	if ($anom[$i] <> "No")
      				add $weight[$i] 100
    			end
    			if ($explored[$i] = 1)
    			  	add $weight[$i] 20
    			end
    			if ($warp[$i] = $lastWarp)
    			  	add $weight[$i] 25
    			end

		    	setVar $x 6
		    	subtract $x $warpCount[$i]

		    	getRnd $rand 1 10
		    	add $weight[$i] $rand

		    	if ($weight[$bestWarp] > $weight[$i])
			      	setVar $bestWarp $i
		    	end
		    	echo "Weight of warp "&$i&" is "&$weight[$i]&"."
		    	add $i 1
	  	end



  		if ($player~scan_type = "Holo") and ($holo = 1)
  		  	send "s hzn* "
  		  	waitOn "Select (H)olo Scan or (D)ensity Scan or (Q)uit"
  		  	echo "["&CURRENTSECTOR&"]"
  		  	waitOn "["&CURRENTSECTOR&"]"
  		  	#waitFor "Command [TL="
  		end

		setVar $ADJ_SEC $warp[$bestWarp]
		setVar $figOwner SECTOR.FIGS.OWNER[$ADJ_SEC]
		setVar $mineOwner SECTOR.MINES.OWNER[$ADJ_SEC]
		setVar $limpOwner SECTOR.LIMPETS.OWNER[$ADJ_SEC]

		setVar $isItSafe 0
		if (SECTOR.FIGS.QUANTITY[$ADJ_SEC] > 0)
			if (($figOwner = "belong to your Corp") OR ($figOwner = "yours"))
				setVar $isItSafe 1	
			end
		else
			setVar $isItSafe 1
		end
		#echo "After fighter check:"&SECTOR.FIGS.QUANTITY[$ADJ_SEC]&" -> Is it safe?"&$isItSafe
		if ($isItSafe = 1)
			if (SECTOR.MINES.QUANTITY[$ADJ_SEC] > 0)
				if (($mineOwner = "belong to your Corp") OR ($mineOwner = "yours"))
					setVar $isItSafe 1	
				else
					setVar $isItSafe 0
				end
			else
				setVar $isItSafe 1
			end
		end
		#echo "After armid check:"&SECTOR.MINES.QUANTITY[$ADJ_SEC]&" -> Is it safe?"&$isItSafe
		if ($isItSafe = 1)
			if (SECTOR.LIMPETS.QUANTITY[$ADJ_SEC] > 0)
				if (($limpOwner = "belong to your Corp") OR ($limpOwner = "yours"))
					setVar $isItSafe 1	
				else
					setVar $isItSafe 0
				end
			else
				setVar $isItSafe 1
			end
		end
		#echo "After limpet check:"&SECTOR.LIMPETS.QUANTITY[$ADJ_SEC]&" -> Is it safe?"&$isItSafe
		
		if ($isItSafe = 1)
			setVar $weight[$bestWarp] 0
		end
		
		echo "Weight of warp "&$warp[$bestWarp]&" is "&$weight[$bestWarp]&"."

 	 	if ($weight[$bestWarp] > 100)
			goto :back
	  	end

	  	setVar $attack "m  z"&$warp[$bestWarp]&"* * za999923* jr * "
		setVar $lastWarp $thisWarp
	  	setVar $thisWarp $warp[$bestWarp]
	  	
	  	setVar $attack $attack&"f 1* zcd * "
		
		if ($deploymines)
			if (($mines > 0) AND ($player~armids >= $mines))
				setVar $attack $attack&"h1 z"&$mines&"* c"
			end
		end
		if ($deploylimpets)
			if (($limps > 0) AND ($player~limpets >= $limps))
				setVar $attack $attack&"h2 z"&$limps&"* c"
			end
		end
		send $attack
		#waitFor "]:["&$warp[$bestWarp]&"]"
	  	gosub :player~quikstats
		if ($player~current_sector <> $warp[$bestWarp])
			send "'{" $switchboard~bot_name "} - Did not make it to target sector!*"
			halt
		end
		
goto :sub_Scan
	
:back
   	setVar $checkWarp $thisWarp
	if ($checkWarp = $thisWarp)
     		add $counter 1
	end

	if ($counter = 2)
	    	send "'{" $switchboard~bot_name "} - Passive grid stopping. Either in dead end, or no safe options.*"
	    	HALT
	end
	send "<"
goto :sub_Scan

:haggleTracker
	setTextTrigger noPort :noPort "Corp Menu"
	send "p"
	send "t"
	WaitFor "<Port>"
	setTextTrigger noFuel :noFuel "How many holds of Fuel Ore do you want to buy"
	setTextTrigger noOrg :noOrg "How many holds of Organics do you want to buy"
	setTextTrigger equp :equp "How many holds of Equipment do you want to sell ["
	setTextTrigger buyequp :buyequp "How many holds of Equipment do you want to buy"
	setTextTrigger nosell :nosell "You don't have anything they want"
	setTextTrigger fuelsell :fuelsell "How many holds of Fuel Ore do you want to sell"
	setTextTrigger orgSell :orgSell "How many holds of Organics do you want to sell"
goto :sub_Scan

:noPort
	send "q"
	killAllTriggers
	goto :sub_Scan

:noFuel
	send "0*0*0*"
	killAllTriggers
	goto :sub_Scan

:noOrg
	send "0*0*0*"
	killAllTriggers
	goto :sub_Scan

:equp
	send "10**0*0*"
	killAllTriggers
	goto :sub_Scan

:buyequp
	send "****"
	killAllTriggers
	goto :sub_Scan

:nosell
	killAllTriggers
	goto :sub_Scan

:fuelsell
	send "**0*0*"
	killAllTriggers
	goto :haggleTracker

:orgsell
	send "**0*0*"
	killAllTriggers
	goto :haggleTracker

:player~quikstats



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
