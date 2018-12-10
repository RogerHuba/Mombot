	logging off
	reqRecording
#Ender Passive Grid, version 1.0
#This is to be used in games where hitting enemy figs is NOT an option. But gridding is to be done all the same.
loadVar $bot_name
loadVar $user_command_line
loadVar $parm1
loadVar $parm2
loadVar $parm3
loadVar $parm4
loadVar $parm5
loadVar $parm6
loadVar $parm7
loadVar $parm8
loadVar $stardock
loadVar $rylos
loadVar $alpha_centauri
loadVar $home_sector

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
                setVar $STARDOCK_PROMPT         "<Stardock>"
                setVar $HARDWARE_PROMPT         "<Hardware"
                setVar $SHIPYARD_PROMPT         "<Shipyard>"
                setVar $TERRA_PROMPT            "Terra"
        # ============================ END QUIKSTAT VARIABLES ==========================

getWord $user_command_line $parm1 1
getWord $user_command_line $parm2 2
getWord $user_command_line $parm3 3
getWord $user_command_line $parm4 4
getWord $user_command_line $parm5 5
getWord $user_command_line $parm6 6
getWord $user_command_line $parm7 7
getWord $user_command_line $parm8 8


	if ($parm1 = "help")
	        send "'*{" $bot_name "} passgrid - passgrid [limpets] [mines] **"
		halt
	end
	
	setArray $warp 7
	setArray $warpCount 7
	setArray $density 7
	setArray $weight 7
	setArray $anom 7
	setArray $explored 7

	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
		send "'{" $bot_name "} - Passive gridder must be run from Command or Citadel prompt.*"
		halt	
	end
	if (($SCAN_TYPE <> "Holo") AND ($SCAN_TYPE <> "Dens"))
		send "'{" $bot_name "} - Must have at least Density scanner to run passive gridder.*"
		halt
	end
	getWordPos " "&$user_command_line&" " $pos " f "
	if ($pos > 0)
		setVar $deployfigs TRUE
	else
		setVar $deployfigs FALSE
	end
	getWordPos " "&$user_command_line&" " $pos " l "
	if ($pos > 0)
		setVar $deploylimpets TRUE
	else
		setVar $deploylimpets FALSE
	end
	getWordPos " "&$user_command_line&" " $pos " m "
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



  		if ($SCAN_TYPE = "Holo") and ($holo = 1)
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
			if (($mines > 0) AND ($ARMIDS >= $mines))
				setVar $attack $attack&"h1 z"&$mines&"* c"
			end
		end
		if ($deploylimpets)
			if (($limps > 0) AND ($LIMPETS >= $limps))
				setVar $attack $attack&"h2 z"&$limps&"* c"
			end
		end
		send $attack
		#waitFor "]:["&$warp[$bestWarp]&"]"
	  	gosub :quikstats
		if ($CURRENT_SECTOR <> $warp[$bestWarp])
			send "'{" $bot_name "} - Did not make it to target sector!*"
			halt
		end
		
goto :sub_Scan
	
:back
   	setVar $checkWarp $thisWarp
	if ($checkWarp = $thisWarp)
     		add $counter 1
	end

	if ($counter = 2)
	    	send "'{" $bot_name "} - Passive grid stopping. Either in dead end, or no safe options.*"
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
