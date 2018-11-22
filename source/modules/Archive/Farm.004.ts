	reqRecording
	logging off
	loadVar $bot_name
	loadVar $unlimitedGame
	loadVar $ptradesetting
	loadVar $bot_turn_limit
	loadVar $user_command_line
	loadVar $parm1
	loadVar $parm2
	loadVar $parm3
	loadVar $parm4
	loadVar $parm5
	loadVar $parm6
	loadVar $parm7
	loadVar $parm8
	loadVar $command

	fileExists $doesHelpFileExist "scripts\MOMBot\Help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\MOMBot\Help\"&$command&".txt" "- farm {set} {clear} {list}                                 " 
		write "scripts\MOMBot\Help\"&$command&".txt" "    Visits sectors in list and farms the planets there.     " 
		write "scripts\MOMBot\Help\"&$command&".txt" "       - default will visit all planets on the tl list       " 
		write "scripts\MOMBot\Help\"&$command&".txt" "                                                            " 
		write "scripts\MOMBot\Help\"&$command&".txt" "    [set] {sector1} {sector2} {...} {sectorx}               "
		write "scripts\MOMBot\Help\"&$command&".txt" "       - set puts sectors in the order you enter into a file" 
		write "scripts\MOMBot\Help\"&$command&".txt" "    [clear]                                                 " 
		write "scripts\MOMBot\Help\"&$command&".txt" "       - clear deletes the farm file                        " 
		write "scripts\MOMBot\Help\"&$command&".txt" "    [list]                                                  " 
		write "scripts\MOMBot\Help\"&$command&".txt" "       - show lists of all sectors in the farm file in order" 
		send "'{" $bot_name "} - Writing help file for this command in Help directory.*"
	end
	setVar $FARMER_FILE "_"&GAMENAME&"_FARMER.list"

	getWordPos $user_command_line $pos "silent" 
	if ($pos > 0)
		setVar $silent TRUE
	else
		setVar $silent FALSE
	end
	getWordPos $parm1 $pos "clear" 
	if ($pos > 0)
		delete $FARMER_FILE
		send "'{" $bot_name "} - Bot Farming File has been deleted.*"
		halt
	end
	getWordPos $parm1 $pos "list" 
	if ($pos > 0)
		fileExists $test $FARMER_FILE
		if ($test)
			readToArray $FARMER_FILE $sector 
			setVar $i 1
			setVar $list_output ""
			while ($i < $sector)
				setVar $list_output $list_output&$sector[$i]&","
				add $i 1
			end
			setVar $list_output $list_output&$sector[$i]
			send "'*{" $bot_name "} - Farming List (In traveling order) *"&$list_output&"**"
		else
			send "'{" $bot_name "} - No Farming File to list from.*"
		end
		halt
	end
	getWordPos $parm1 $pos "set"
	if ($pos > 0)
		setVar $i 2
		getWord $user_command_line $check $i "%%%"
		while ($check <> "%%%")
			isNumber $test $check
			if ($test)
				if ($check > 0) AND ($check <= SECTORS)
					write $FARMER_FILE $check
				end
			end
			add $i 1
			getWord $user_command_line $check $i "%%%"
		end
		send "'{" $bot_name "} - "&($i-2)&" Sectors added to Bot Farming File.*"
		halt
	end
	setVar $i 1
	setArray $planets 3000
	gosub :quikstats
	if ($PLANET_SCANNER = "No")
	        send "'{" $bot_name "} - Planet Farmer must be run with a planet scanner.*" 
		halt
	end
	if ($CURRENT_PROMPT <> "Citadel")
	        send "'{" $bot_name "} - Planet Farmer must be run from the Citadel Prompt.*" 
		halt
	end
	fileExists $test $FARMER_FILE
	if ($test)
		send "'{" $bot_name "} - Loading Planet List From Farming File...*"
		readToArray $FARMER_FILE $sector 
	else
		setVar $sector SECTORS
		setArray $sector SECTORS
		send "'{" $bot_name "} - No Farming File, Loading Planet List...*"
		gosub :get_tl_list
	end

	send "'{" $bot_name "} - Planet List Loaded, starting the farming!*"	
	gosub :quikstats
	setvar $home $CURRENT_SECTOR
	gosub :planet_info

:start
	killalltriggers
	goto :move_the_planet

:get_tl_list
	setVar $sectorCount 0
	killalltriggers
	gosub :setConnectionTriggers
	setTextLineTrigger sectorGrabber :sector_planet_line "Class "
	setTextLineTrigger sectorbeDone :sector_done "======   ============"
	send "xlq"
	pause
	:sector_planet_line
		killalltriggers
		add $sectorCount 1
		getWord CURRENTLINE $testsector 1
		setVar $sector[$sectorCount] $testsector
		gosub :setConnectionTriggers
		setTextLineTrigger getLine2 :sector_planet_line "Class"
		setTextLineTrigger getEnd :sector_done "======   ============"
		pause
	:sector_done
	send "@"
	setVar $sector $sectorCount
	gosub :setConnectionTriggers
	waitOn "Average Interval Lag:"

return


	
:quikstats

        # ============================ START QUIKSTAT VARIABLES ==========================
                setVar $CURRENT_PROMPT          "Undefined"
                setVar $PSYCHIC_PROBE           "NO"
                setVar $PLANET_SCANNER          "NO"
                setVar $SCAN_TYPE               "NONE"
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

     	setVar $CURRENT_PROMPT 		"Undefined"
	killtrigger noprompt
	killtrigger prompt1
	killtrigger prompt2
	killtrigger prompt3
	killtrigger prompt4
	killtrigger statlinetrig
	killtrigger getLine2
	gosub :setConnectionTriggers
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

:planet_info
	send "qd"
	gosub :setConnectionTriggers
	waitOn "Planet #"
	getWord CURRENTLINE $planetToFill 2
	stripText $planetToFill "#"
	send "snl1*snl2*snl3*tnl1*tnl2*tnl3*  q  j  y  l "  $planetToFill "*  c"
	return

:move_the_planet
	setVar $i 1
	
:inac
:tryAgain
	while ($i <= $sector)
		while (($sector[$i] <= 0) AND ($i <= $sector))
			add $i 1
			if ($i > $sector)
				goto :end
			end
		end
		
		send "p "&$sector[$i]&"  *ys* "
		gosub :setConnectionTriggers
		settextlinetrigger warp_it :warp_it "All Systems Ready, shall we engage?"
		settextlinetrigger no_warp :no_warp "You do not have any fighters in Sector"
		setTextLineTrigger alreadythere :warp_it "You are already in that sector!"
		pause
		:no_warp
			killalltriggers
			add $i 1
			goto :tryAgain
		:warp_it
			killalltriggers
			gosub :count_planets
			gosub :stripallplanets
			if ($silent <> TRUE)
				send "'{" $bot_name "} - Done farming sector " $sector[$i] ".*"
			end
			send "q"
			gosub :getPlanetInfo
			send "c"
			add $i 1
			if (($planetorg > ($planetorgmax-1000)) AND ($planetequip > ($planetequipmax - 1000)))
				setVar $planetIsFull TRUE
				goto :end
			end 
	end
	goto :end
:count_planets
	gosub :quikstats
	send "q  q  q  z  n  *|l"
	gosub :setConnectionTriggers
	waitOn "Registry# and Planet Name"
	setVar $planetCount 0
	killalltriggers
	gosub :setConnectionTriggers
	setTextLineTrigger planetGrabber :planetline "   <"
	setTextLineTrigger beDone :done "Land on which planet "
	setTextLineTrigger noplanets :done "You can create one with a Genesis Torpedo."
	send "q* |"
	pause
	:planetline
		killalltriggers
		setVar $line CURRENTLINE
		replacetext $line "<" " "
		replacetext $line ">" " "
		striptext $line ","
		add $planetCount 1
		getWord $line $planets[$planetCount] 1
		gosub :setConnectionTriggers
		setTextLineTrigger getLine2 :planetline "   <"
		setTextLineTrigger getEnd :done "Land on which planet "
		pause
	:done
	killalltriggers
return

:stripallplanets
setVar $j 1
	send "q q * * jy * "
	while ($j <= $planetCount)
		if ($planetToFill <> $planets[$j])
			:tryFuel
				killAllTriggers
				#if ($emptyFuel)
					send "l j " & #8 & #8 & $planets[$j]&"* * "
					setTextTrigger noplanet :doneWithThisPlanet "That planet is not in this sector."				
					setTextTrigger planethere :continueFuel "Planet command (?=help)"
					pause
					:continueFuel
					killalltriggers
					send "tnt1*q l "&$planetToFill&"* tnl1*q "
					gosub :setConnectionTriggers
					setTextTrigger fuelSuccess :tryFuel "You load the "				
					setTextTrigger fuelEmpty :emptyFuel "There aren't that many "
					setTextTrigger fuelFull :emptyFuel "They don't have room for that many "
					pause
				#end
			:emptyFuel
				send "l "&$planets[$j]&"* tnl1*q jy "
				send "@"
				waitOn "Average Interval Lag:"
			:tryOrganics
				killAllTriggers
				#if ($emptyOrganics)
					send "l "&$planets[$j]&"* tnt2*q l "&$planetToFill&"* tnl2*q "
					gosub :setConnectionTriggers
					setTextTrigger success :tryOrganics "You load the "
					setTextTrigger emptyEmpty :emptyOrganics "There aren't that many "
					setTextTrigger fullFill :emptyOrganics "They don't have room for that many "
					pause
				#end
			:emptyOrganics
				send "l "&$planets[$j]&"* tnl2*q jy "
				send "@"
				waitOn "Average Interval Lag:"
			:tryEquipment
				killAllTriggers
				#if ($emptyEquipment)
					send "l "&$planets[$j]&"* tnt3*q l "&$planetToFill&"* tnl3*q "
					gosub :setConnectionTriggers
					setTextTrigger success :tryEquipment "You load the "
					setTextTrigger emptyEmpty :emptyEquipment "There aren't that many "
					setTextTrigger fullFill :emptyEquipment "They don't have room for that many "
					pause
				#end
			:emptyEquipment
				send "l "&$planets[$j]&"* tnl3*q jy "
				send "@"
				waitOn "Average Interval Lag:"

			:tryFuelColonists
				killAllTriggers
				if ($emptyFuelColonists)
					send "l "&$planets[$j]&"* snt1*q l "&$planetToFill&"* snl"&$coloType&"*q "
					gosub :setConnectionTriggers
					setTextTrigger success :tryFuelColonists "The Colonists disembark to "
					setTextTrigger emptyEmpty :switchFuel "There isn't room on the planet"
					setTextTrigger fullFill :tryOrganicColonists "They don't have room for that many "
					setTextTrigger empty :tryOrganicColonists  "There aren't that many on the planet!"
					pause
					:switchFuel
						killAllTriggers
						add $coloType 1
						if ($coloType >= 4)
							goto :doneWithThisPlanet
						end
						goto :tryFuelColonists
				end
			:tryOrganicColonists
				killAllTriggers
				if ($emptyOrganicColonists)
					send "l "&$planets[$j]&"* snt2*q l "&$planetToFill&"* snl"&$coloType&"*q "
					gosub :setConnectionTriggers
					setTextTrigger success :tryOrganicColonists "The Colonists disembark to "
					setTextTrigger emptyEmpty :switchOrganics "There isn't room on the planet"
					setTextTrigger fullFill :tryEquipmentColonists "They don't have room for that many "
					setTextTrigger empty :tryEquipmentColonists "There aren't that many on the planet!"
					pause
					:switchOrganics
						killAllTriggers
						add $coloType 1
						if ($coloType >= 4)
							goto :doneWithThisPlanet
						end
						goto :tryOrganicColonists
				end
			:tryEquipmentColonists
				killAllTriggers
				if ($emptyEquipmentColonists)
					send "l "&$planets[$j]&"* snt3*q l "&$planetToFill&"* snl"&$coloType&"*q "
					gosub :setConnectionTriggers
					setTextTrigger success :tryEquipmentColonists "The Colonists disembark to "
					setTextTrigger emptyEmpty :switchEquipment "There isn't room on the planet"
					setTextTrigger fullFill :tryFighters "They don't have room for that many "
					setTextTrigger empty :tryFighters "There aren't that many on the planet!"
					pause
					:switchEquipment
						killAllTriggers
						add $coloType 1
						if ($coloType >= 4)
							goto :doneWithThisPlanet
						end
						goto :tryFighters
				end
				
			:tryFighters
				killAllTriggers
					send "l "&$planets[$j]&"* m***q l "&$planetToFill&"* m*l* q "
					gosub :setConnectionTriggers
					WaitOn "Do you wish to (L)eave or (T)ake Fighters? [T]"
					waitOn " Max) ["
					getWord CURRENTLINE $figsToGrab 9
					stripText $figsToGrab "("
					if ($figsToGrab < 100)
						goto :doneWithThisPlanet	
					end
				goto :tryFighters
			:doneWithThisPlanet
			killAllTriggers
		end
			
		add $j 1
	end
	send "l "&$planetToFill&"* c"
return	
:end
killalltriggers
send "p "&$home&"  *ys* "
if ($planetIsFull)
	send "'{" $bot_name "} - Farming Planet is full.  Ready to sell off the product!*"
else
	send "'{" $bot_name "} - Farming run is complete.*"
end
gosub :quikstats
if ($CURRENT_SECTOR <> $home)
	send "'{" $bot_name "} - Could not make it back to starting sector!*"
end
halt

# ============================== BUY DOWN ==============================
:buy
	KillAllTriggers
	:verifyprompt
	
	
	setVar $output ""
	setVar $equiprounds 0
	setVar $orgrounds 0
	setVar $fuelrounds 0
	setVar $buydownRoundsFromParam 999999
	setVar $buydown_mode 1
	setVar $buydown_equiprounds 0
	setVar $buydown_orgrounds 0
	setVar $buydown_fuelrounds $buydownRoundsFromParam
	send "Q"
	send "t n l 1* t n l 2* t n l 3* s n l1*"
	gosub :setConnectionTriggers
	waitfor "How many groups of Colonists do you want to leave"
	gosub :getPlanetinfo
	send "C s* "
	gosub :getInfo
	if ($TOTAL_HOLDS <> $EMPTY_HOLDS)
		#gosub :endCNsettings
		if ($location <> "Citadel")
			send "L " & $planetToFill & "* "
		end
		setVar $exit_message "Planet full, cannot empty ship holds"
		goto :buydownExit
	end
	gosub :getPortInfo
	if ($location = "Citadel")
		send "Q"
	else
		send "L " & $planetToFill & "* "
	end
	setDelayTrigger initpause :initpause 500
	gosub :setConnectionTriggers
	pause

:initpause


:getinputs
    setVar $turns_needed 0
    setVar $turns_allowed $TURNS
    subtract $turns_allowed 1



    # --- calculate how much fuel we can buy
	if ($buydown_fuelrounds > 0)
		setVar $fuelrounds 0
		setVar $planetfuelroom $planetfuelmax
		subtract $planetfuelroom $planetfuel
		setVar $maxfueltobuy $fuelselling
		if ($fuelselling > $planetfuelroom)
			setVar $maxfueltobuy $planetfuelroom
		end
		setVar $maxfuelrounds $maxfueltobuy
		divide $maxfuelrounds $TOTAL_HOLDS
		if ($maxfuelrounds > $turns_allowed)
			setVar $maxfuelrounds $turns_allowed
		end
		if ($maxfuelrounds > $buydown_fuelrounds)
	    		setVar $maxfuelrounds $buydown_fuelrounds
		end
		if ($maxfuelrounds > 0)
			setVar $fuelrounds $maxfuelrounds
		end
		add $turns_needed $fuelrounds
		subtract $turns_allowed $fuelrounds
	end
    # --- calculate how much org we can buy
    if ($buydown_orgrounds > 0)
	setVar $orgrounds 0
	    setVar $planetorgroom $planetorgmax
	    subtract $planetorgroom $planetorg
	    setVar $maxorgtobuy $orgselling
	    if ($orgselling > $planetorgroom)
	        setVar $maxorgtobuy $planetorgroom
	    end
	    setVar $maxorgrounds $maxorgtobuy
	    divide $maxorgrounds $TOTAL_HOLDS
	    if ($maxorgrounds > $turns_allowed)
	        setVar $maxorgrounds $turns_allowed
	    end
	    if ($maxorgrounds > $buydown_orgrounds)
	    	setVar $maxorgrounds $buydown_orgrounds
	    end
	    if ($maxorgrounds > 0)
	        setVar $orgrounds $maxorgrounds
	    end
	
	    add $turns_needed $orgrounds
	    subtract $turns_allowed $orgrounds
    end	
    # --- calculate how much equip we can buy
    if ($buydown_equiprounds > 0)
	setVar $equiprounds 0
	    setVar $planetequiproom $planetequipmax
	    subtract $planetequiproom $planetequip
	    setVar $maxequiptobuy $equipselling
	    if ($equipselling > $planetequiproom)
	        setVar $maxequiptobuy $planetequiproom
	    end
	    setVar $maxequiprounds $maxequiptobuy
	    divide $maxequiprounds $TOTAL_HOLDS
	    if ($maxequiprounds > $turns_allowed)
		setVar $maxequiprounds $turns_allowed
	    end
	    if ($maxequiprounds > $buydown_equiprounds)
	    	setVar $maxequiprounds $buydown_equiprounds
	    end
	    if ($maxequiprounds > 0)
	         setVar $equiprounds $maxequiprounds
	    end
	
	    add $turns_needed $equiprounds
	    subtract $turns_allowed $equiprounds
    end	
    if (($fuelrounds = 0) and ($orgrounds = 0) and ($equiprounds = 0))
        if ($location = "Citadel")
            send "C "
        else
	    send "q "
	end
        setVar $exit_message "Nothing to buy"
	goto :buydownExit
    end

    :getMode
    if ($buydown_mode = 1)
        setVar $buydown_mode "Speedbuy"
    elseif ($buydown_mode = 2)
        setVar $buydown_mode "Best Price"
    elseif ($buydown_mode = 3)
        setVar $buydown_mode "Worst Price"
    end
  
    setVar $fuelroundsleft $fuelrounds
    setVar $orgroundsleft $orgrounds
    setVar $equiproundsleft $equiprounds
	setVar $fuel_creds_needed 0
	setVar $org_creds_needed 0
	setVar $equip_creds_needed 0
            
# determine how much this will all cost, and get credits from citadel if needed
if ($fuelrounds > 0)
    setVar $fuel_creds_needed $fuelrounds
    multiply $fuel_creds_needed $TOTAL_HOLDS
    multiply $fuel_creds_needed 30
    if ($buydown_mode = "Worst Price")
        multiply $fuel_creds_needed 3
        divide $fuel_creds_needed 2
    end
end
if ($orgrounds > 0)
    setVar $org_creds_needed $orgrounds
    multiply $org_creds_needed $TOTAL_HOLDS
    multiply $org_creds_needed 60
    if ($buydown_mode = "Worst Price")
        multiply $org_creds_needed 3
        divide $org_creds_needed 2
    end
end
if ($equiprounds > 0)
    setVar $equip_creds_needed $equiprounds
    multiply $equip_creds_needed $TOTAL_HOLDS
    multiply $equip_creds_needed 100
    if ($buydown_mode = "Worst Price")
        multiply $equip_creds_needed 3
        divide $equip_creds_needed 2
    end
end
setVar $total_creds_needed 0
add $total_creds_needed $fuel_creds_needed
add $total_creds_needed $org_creds_needed
add $total_creds_needed $equip_creds_needed
setVar $startingCredits $CREDITS
if ($total_creds_needed > $CREDITS)
    setVar $cashonhand $citadelcredits
    add $cashonhand $CREDITS
    if ($cashonhand > $total_creds_needed)
        send "C"
        send "T T " & $CREDITS & "* "
        send "T F " & $total_creds_needed & "* "
        setVar $CREDITS $total_creds_needed
        send "Q"
    else
        if ($location = "Citadel")
            send "C "
        else
	    send "q "
	end
        setVar $exit_message "Not enough cash onhand"
        goto :buydownExit
    end
end

setVar $init_credits $CREDITS

:buydownequip
    if ($equiproundsleft > 0)
        send "Q P T  "
        if ($fuelselling > 0)
            send "0* "
        end
        if ($orgselling > 0)
            send "0*"
        end
        gosub :choosehaggle
        send "L " & $planetToFill & "* t n l 3* "
        subtract $equiproundsleft 1
        goto :buydownequip
    end
    if ($equiprounds > 0)
        if ($buydown_mode = "Worst Price")
            setVar $output $output & " - Equipment overhaggled at " & $overhagglemultiple & "*"
        end
    end

:buydownorg
    if ($orgroundsleft > 0)
        send "Q P T  "
        if ($fuelselling > 0)
            send "0*"
        end
        gosub :choosehaggle
        send "0* L " & $planetToFill & "* t n l 2* "
        subtract $orgroundsleft 1
        goto :buydownorg
    end
    if ($orgrounds > 0)
        if ($buydown_mode = "Worst Price")
            setVar $output $output & " - Organics overhaggled at " & $overhagglemultiple & "*"
        end
    end

:buydownfuel
    if ($fuelroundsleft > 0)
        send "Q P T "
        gosub :choosehaggle
        send "0* 0* L " & $planetToFill & "* t n l 1* "
        subtract $fuelroundsleft 1
        goto :buydownfuel
    end
    if ($fuelrounds > 0)
        if ($buydown_mode = "Worst Price")
            setVar $output $output & " - Fuel Ore overhaggled at " & $overhagglemultiple & "*"
        end
    end

:buydownFinish
    if ($location = "Citadel")
        send "C "
    else
        send "Q "
    end
    gosub :getInfo
    setVar $credits_spent $init_credits
    subtract $credits_spent $CREDITS
    if ($location = "Planet")
        send "L " & $planetToFill & "* "
    end
    if ($CREDITS > $startingCash)
        if ($location = "Citadel")
		send "T T " & ($CREDITS-$startingCredits) & "* "
	        
	end
	if ($location = "Planet")
		send "Q"
	end
    end
    
    :buydownExit
        
return

#==================================   END BUYDOWN  ========================================



# ----- SUB :getPortInfo -----
:getPortInfo
    send "S*CR*Q"
    gosub :setConnectionTriggers
    setTextLineTrigger foundport :foundport2 "Items     Status  Trading % of max OnBoard"
    setTextLineTrigger noport :noport2 "I have no information about a port in that sector."
    setTextLineTrigger noport2 :noport2 "You have never visted sector"
    setTextLineTrigger noport3 :noport2 "credits / next hold"
    pause

    :noport2
        killalltriggers
        if ($location <> "Citadel")
            send "L " & $planetToFill & "* "
        end
        setVar $exit_message "No port found"
        goto :buydownExit

    :foundport2
        killalltriggers
        setVar $fuelselling 0
        setVar $orgselling 0
        setVar $equipselling 0

        :getselling
            setTextLineTrigger portfuelinfo :portfuelinfo2 "Fuel Ore   Selling"
	    gosub :setConnectionTriggers
            setTextLineTrigger portorginfo :portorginfo2 "Organics   Selling"
            setTextLineTrigger portequipinfo :portequipinfo2 "Equipment  Selling"
            setTextLineTrigger gotallportinfo :gotallportinfo2 "<Computer deactivated>"
            pause

        :portfuelinfo2
            killalltriggers
            getWord CURRENTLINE $fuelselling 4
            goto :getselling

        :portorginfo2
            killalltriggers
            getWord CURRENTLINE $orgselling 3
            goto :getselling

        :portequipinfo2
            killalltriggers
            getWord CURRENTLINE $equipselling 3
            goto :getselling

        :gotallportinfo2
            killalltriggers
            return

# ==============================  START PLANET INFO SUBROUTINE  =================
:getPlanetInfo
    send "*"
    gosub :setConnectionTriggers
    setTextLineTrigger planetInfo :planetInfo "Planet #"
    pause

    :planetinfo
        killalltriggers
        setVar $citadel 0
        setVar $sCannon 0
        setVar $aCannon 0
        setVar $citadelcredits 0
        getWord CURRENTLINE $planetToFill 2
        stripText $planetToFill "#"
        getWord CURRENTLINE $current_sector 5
        stripText $current_sector ":"
        waitfor "2 Build 1   Product    Amount     Amount     Maximum"

        :getPlanetStuff
	    gosub :setConnectionTriggers
            setTextLineTrigger fuelstart :fuelstart "Fuel Ore"
            setTextLineTrigger orgstart :orgstart "Organics"
            setTextLineTrigger equipstart :equipstart "Equipment"
            setTextLineTrigger figstart :figstart "Fighters        N/A"
            setTextLineTrigger citadelstart :citadelstart "Planet has a level"
            setTextLineTrigger cannon :cannonstart ", AtmosLvl="
            setTextTrigger planetInfoDone :planetInfoDone "Planet command (?=help)"
            pause

        :fuelstart
            killalltriggers
            getWord CURRENTLINE $planetfuel 6
            getWord CURRENTLINE $planetfuelmax 8
            stripText $planetfuel ","
            stripText $planetfuelmax ","
            goto :getPlanetStuff

        :orgstart
            killalltriggers
            getWord CURRENTLINE $planetorg 5
            getWord CURRENTLINE $planetorgmax 7
            stripText $planetorg ","
            stripText $planetorgmax ","
            goto :getPlanetStuff

        :equipstart
            killalltriggers
            getWord CURRENTLINE $planetequip 5
            getWord CURRENTLINE $planetequipmax 7
            stripText $planetequip ","
            stripText $planetequipmax ","
            goto :getPlanetStuff

        :figstart
            killalltriggers
            getWord CURRENTLINE $planetfig 5
            getWord CURRENTLINE $planetfigmax 7
            stripText $planetfig ","
            stripText $planetfigmax ","
            goto :getPlanetStuff

        :citadelstart
            killalltriggers
            getWord CURRENTLINE $citadel 5
            getWord CURRENTLINE $citadelcredits 9
            striptext $citadelcredits ","
	    goto :getPlanetStuff

	:cannonstart
            killalltriggers
            getWord CURRENTLINE $aCannon 5
            getWord CURRENTLINE $sCannon 6
            stripText $sCannon "SectLvl="
	    striptext $sCannon "%"
	    stripText $aCannon "AtmosLvl="
	    striptext $aCannon "%"
	    striptext $aCannon ","

    :planetInfoDone
	killalltriggers
return
# ==============================  END PLANET INFO SUBROUTINE  =================

# ============================  START PLAYER INFO SUBROUTINE  =================
:getInfo
    setVar $PHOTONS 0
    setVar $SCAN_TYPE "None"
    setVar $TWARP_TYPE 0
    setVar $corpstring "[0]"
    send "I"
    waitfor "<Info>"
    :waitForInfo
	gosub :setConnectionTriggers
        setTextLineTrigger getTraderName :getTraderName "Trader Name    :"
        setTextLineTrigger getExpAndAlign :getExpAndAlign "Rank and Exp"
        setTextLineTrigger getCorp :getCorp "Corp           #"
        setTextLineTrigger getShipType :getShipType "Ship Info      :"
        setTextLineTrigger getTPW :getTPW "Turns to Warp  :"
        setTextLineTrigger getSect :getSect "Current Sector :"
        setTextLineTrigger getTurns :getTurns "Turns left"
        setTextLineTrigger getHolds :getHolds "Total Holds"
        setTextLineTrigger getFighters :getFighters "Fighters       :"
        setTextLineTrigger getShields :getShields "Shield points  :"
        setTextLineTrigger getPhotons :getPhotons "Photon Missiles:"
        setTextLineTrigger getScanType :getScanType "LongRange Scan :"
        setTextLineTrigger getTwarpType1 :getTwarpType1 "  (Type 1 Jump):"
        setTextLineTrigger getTwarpType2 :getTwarpType2 "  (Type 2 Jump):"
        setTextLineTrigger getCredits :getCredits "Credits"
        setTextTrigger getInfoDone :getInfoDone "Command [TL="
        setTextTrigger getInfoDone2 :getInfoDone "Citadel command"
        pause
        pause
    :getTraderName
        killAllTriggers
        setVar $TRADER_NAME CURRENTLINE
        stripText $TRADER_NAME "Trader Name    : "
        stripText $TRADER_NAME "3rd Class "
        stripText $TRADER_NAME "2nd Class "
        stripText $TRADER_NAME "1st Class "
        stripText $TRADER_NAME "Nuisance "
        stripText $TRADER_NAME "Menace "
        stripText $TRADER_NAME "Smuggler Savant "
        stripText $TRADER_NAME "Smuggler "
        stripText $TRADER_NAME "Robber "
        stripText $TRADER_NAME "Private "
        stripText $TRADER_NAME "Lance Corporal "
        stripText $TRADER_NAME "Corporal "
        stripText $TRADER_NAME "Staff Sergeant "
        stripText $TRADER_NAME "Gunnery Sergeant "
        stripText $TRADER_NAME "1st Sergeant "
        stripText $TRADER_NAME "Sergeant Major "
        stripText $TRADER_NAME "Sergeant "
        stripText $TRADER_NAME "Chief Warrant Officer "
        stripText $TRADER_NAME "Warrant Officer "
        stripText $TRADER_NAME "Terrorist "
        stripText $TRADER_NAME "Infamous Pirate "
        stripText $TRADER_NAME "Notorious Pirate "
        stripText $TRADER_NAME "Dread Pirate "
        stripText $TRADER_NAME "Pirate "
        stripText $TRADER_NAME "Galactic Scourge "
        stripText $TRADER_NAME "Enemy of the State "
        stripText $TRADER_NAME "Enemy of the People "
        stripText $TRADER_NAME "Enemy of Humankind "
        stripText $TRADER_NAME "Heinous Overlord "
        stripText $TRADER_NAME "Prime Evil "
        stripText $TRADER_NAME "Ensign "
        stripText $TRADER_NAME "Lieutenant J.G. "
        stripText $TRADER_NAME "Lieutenant Commander "
        stripText $TRADER_NAME "Lieutenant "
        stripText $TRADER_NAME "Commander "
        stripText $TRADER_NAME "Captain "
        stripText $TRADER_NAME "Commodore "
        stripText $TRADER_NAME "Rear Admiral "
        stripText $TRADER_NAME "Vice Admiral "
        stripText $TRADER_NAME "Fleet Admiral "
        stripText $TRADER_NAME "Admiral "
        stripText $TRADER_NAME "Civilian "
        stripText $TRADER_NAME "Annoyance "
        goto :waitForInfo
    :getExpAndAlign
        killAllTriggers
        getWord CURRENTLINE $EXPERIENCE 5
        getWord CURRENTLINE $ALIGNMENT 7
        stripText $EXPERIENCE ","
        stripText $ALIGNMENT ","
        stripText $ALIGNMENT "Alignment="
        goto :waitForInfo
    :getCorp
        killAllTriggers
        getWord CURRENTLINE $CORP 3
        stripText $CORP ","
        setVar $corpstring "[" & $CORP & "]"
        goto :waitForInfo
    :getShipType
        killAllTriggers
        getWordPos CURRENTLINE $shiptypeend "Ported="
        subtract $shiptypeend 18
        cutText CURRENTLINE $SHIP_TYPE 18 $shiptypeend
        goto :waitForInfo
    :getTPW
        killAllTriggers
        getWord CURRENTLINE $TURNS_PER_WARP 5
        goto :waitForInfo
    :getSect
        killAllTriggers
        getWord CURRENTLINE $CURRENT_SECTOR 4
        goto :waitForInfo
    :getTurns
        killAllTriggers
        getWord CURRENTLINE $TURNS 4
        if ($TURNS = "Unlimited")
            setVar $TURNS 65000
	    setVar $unlimitedGame TRUE
        end
	saveVar $unlimitedGame
        goto :waitForInfo
    :getHolds
        killAllTriggers
        setVar $line CURRENTLINE
        getWord $line $TOTAL_HOLDS 4
        getWordPos $line $textpos "Ore="
        if ($textpos <> 0)
            cutText CURRENTLINE $temp $textpos 100
            getWord $temp $ORE_HOLDS 1
            stripText $ORE_HOLDS "Ore="
        else
            setVar $ORE_HOLDS 0
        end
        getWordPos $line $textpos "Organics="
        if ($textpos <> 0)
            cutText CURRENTLINE $temp $textpos 100
            getWord $temp $ORGANIC_HOLDS 1
            stripText $ORGANIC_HOLDS "Organics="
        else
            setVar $ORGANIC_HOLDS 0
        end
        getWordPos $line $textpos "Equipment="
        if ($textpos <> 0)
            cutText CURRENTLINE $temp $textpos 100
            getWord $temp $EQUIPMENT_HOLDS 1
            stripText $EQUIPMENT_HOLDS "Equipment="
        else
            setVar $EQUIPMENT_HOLDS 0
        end
        getWordPos $line $textpos "Colonists="
        if ($textpos <> 0)
            cutText CURRENTLINE $temp $textpos 100
            getWord $temp $COLONIST_HOLDS 1
            stripText $COLONIST_HOLDS "Colonists="
        else
            setVar $COLONIST_HOLDS 0
        end
        getWordPos $line $textpos "Empty="
        if ($textpos <> 0)
            cutText CURRENTLINE $temp $textpos 100
            getWord $temp $EMPTY_HOLDS 1
            stripText $EMPTY_HOLDS "Empty="
        else
            setVar $EMPTY_HOLDS 0
        end
        goto :waitForInfo
    :getFighters
        killAllTriggers
        getWord CURRENTLINE $FIGHTERS 3
        stripText $FIGHTERS ","
        goto :waitForInfo
    :getShields
        killAllTriggers
        getWord CURRENTLINE $SHIELDS 4
        stripText $SHIELDS ","
        goto :waitForInfo
    :getPhotons
        killAllTriggers
        getWord CURRENTLINE $PHOTONS 3
        goto :waitForInfo
    :getScanType
        killAllTriggers
        getWord CURRENTLINE $SCAN_TYPE 4
        goto :waitForInfo
    :getTwarpType1
        killAllTriggers
        getWord CURRENTLINE $TWARP_1_RANGE 4
        setVar $twarp_type 1
        goto :waitForInfo
    :getTwarpType2
        killAllTriggers
        getWord CURRENTLINE $TWARP_2_RANGE 4
        setVar $twarp_type 2
        goto :waitForInfo
    :getCredits
        killAllTriggers
        getWord CURRENTLINE $CREDITS 3
        stripText $CREDITS ","
        goto :waitForInfo
    :getInfoDone
        killalltriggers
return
# ==============================  END PLAYER INFO SUBROUTINE  =================

# ======================     START BUYING SUBROUTINES     =================
# ----- SUB :choosehaggle
:choosehaggle
    if ($buydown_mode = "Speedbuy")
        gosub :buynohaggle
    else
        gosub :buyhaggle
    end
    return


# ----- SUB :buyhaggle
:buyhaggle
    setVar $empty $TOTAL_HOLDS
    send "*"
    gosub :setConnectionTriggers
    setTextLineTrigger buyfirstoffer :buyfirstoffer "We'll sell them for"
    pause

    :buyfirstoffer
        killalltriggers
        getWord CURRENTLINE $offer 5
        striptext $offer ","

        gosub :swathoff
        if ($swathoff = 0)
            send "L " & $planet & "* "
            if ($location = "Citadel")
                send "C "
            end
            setVar $exit_message $swathOffMessage
            goto :buydownExit
        end


        setVar $counter $offer
        if ($buydown_mode = "Best Price")
            multiply $counter 92
            divide $counter 100
        elseif ($buydown_mode = "Worst Price")
            multiply $counter $overhagglemultiple
            divide $counter 100
        end
        send $counter & "*"
    :buyofferloop
	gosub :setConnectionTriggers
        setTextLineTrigger buyprice :buyprice "We'll sell them for"
        setTextLineTrigger buyfinaloffer :buyfinaloffer "Our final offer"
        setTextLineTrigger buynotinterested :buynotinterested "We're not interested."
        setTextLineTrigger buyexperience :buyexperience "experience point(s)"
        setTextLineTrigger buyempty :buyempty "empty cargo holds"
        setTextLineTrigger buyscrewup1 :buyscrewup "Get real ion-brain, make me a real offer."
        setTextLineTrigger buyscrewup2 :buyscrewup "This is the big leagues Jr.  Make a real offer."
        setTextLineTrigger buyscrewup3 :buyscrewup "My patience grows short with you."
        setTextLineTrigger buyscrewup4 :buyscrewup "I have much better things to do than waste my time.  Try again."
        setTextLineTrigger buyscrewup5 :buyscrewup "HA! HA, ha hahahhah hehehe hhhohhohohohh!  You choke me up!"
        setTextLineTrigger buyscrewup6 :buyscrewup "Quit playing around, you're wasting my time!"
        setTextLineTrigger buyscrewup7 :buyscrewup "Make a real offer or get the "
        setTextLineTrigger buyscrewup8 :buyscrewup "WHAT?!@!? you must be crazy!"
        setTextLineTrigger buyscrewup9 :buyscrewup "So, you think I'm as stupid as you look? Make a real offer."
        setTextLineTrigger buyscrewup10 :buyscrewup "What do you take me for, a fool?  Make a real offer!"
        pause
        pause
    :buyscrewup
        killalltriggers
        if ($buydown_mode = "Best Price")
            multiply $counter 102
            divide $counter 100
        elseif ($buydown_mode = "Worst Price")
            subtract $overhagglemultiple 1
            setVar $counter $offer
            multiply $counter $overhagglemultiple
            divide $counter 100
        end
        send $counter & "*"
        goto :buyofferloop
    :buyprice
        killalltriggers
        setVar $old_offer $offer
        setVar $old_counter $counter
        getWord CURRENTLINE $offer 5
        striptext $offer ","
        setVar $offer_pct $offer
        multiply $offer_pct 1000
        divide $offer_pct $old_offer
        if ($offer_pct > 990)
            setVar $offer_pct 990
        end
        multiply $counter 1000
        divide $counter $offer_pct
        if ($counter <= $old_counter)
            add $counter 1
        end
        send $counter & "*"
        goto :buyofferloop
    :buyfinaloffer
        killalltriggers
        setVar $old_offer $offer
        setVar $old_counter $counter
        getWord CURRENTLINE $offer 5
        striptext $offer ","
        setVar $offer_change $offer
        subtract $offer_change $old_offer
        subtract $offer_change 1
        multiply $offer_change 25
        divide $offer_change 10
        subtract $counter $offer_change
        if ($counter = $old_counter)
            add $counter 1
        end
        add $counter 1
        send $counter & "*"
        goto :buyofferloop
    :buynotinterested
        killalltriggers
        send "0* "
        send "0* "
        goto :buyhagglefailed
    :buyexperience
        killalltriggers
        getWord CURRENTLINE $exp_bonus 7
        add $exp $exp_bonus
        add $jetbonus $exp_bonus
        goto :buyofferloop
    :buyempty
        killalltriggers
        getWord CURRENTLINE $CREDITS 3
        stripText $CREDITS ","
        setVar $oldempty $empty
        getWord CURRENTLINE $empty 6
        if ($oldempty = $empty)
            goto :buyhagglefailed
        else
            goto :buyhagglesucceeded
        end
    :buyhagglefailed
        setVar $buyhaggle 0
        return
    :buyhagglesucceeded
        setVar $buyhaggle 1
        return


# ----- SUB :buynohaggle
:buynohaggle

    if ($swathoff = 0)

        waitfor "How many holds of"
        send "*"
        gosub :swathoff
        send "*"
    else
        send "**"
    end
    add $cyclebuffer 1
    if ($cyclebuffer = $cyclebufferlimit)
        setVar $cyclebuffer 1
        send "/"
        waitfor " Sect "
    end
    return
# ===========================  START SWATH DISABLING SUBROUTINE  =================
:swathoff
    if ($swathoff = FALSE)
	gosub :setConnectionTriggers
        setTextTrigger swathison :swathison "Command [TL="
        setDelayTrigger swathisoff :swathisoff 2000
        pause

        :swathison
        killalltriggers
        setVar $swathOffMessage "Detected SWATH Autohaggle"
        setVar $swathoff FALSE
        return

        :swathisoff
        killalltriggers
        setVar $swathoff TRUE
    end
return
# ==========================   END SWATH DISABLING SUBROUTINE  =================


	:Discod
	   	setVar $TagLine				"[Farmer]"
		setVar $TagLineB			"[Farmer]"
		killAllTriggers
	   	Echo "**" & ANSI_14 & $TagLineB & ANSI_15 & " Disconnected **"
	   	:Disco_Test
		if (CONNECTED <> TRUE)
			setDelayTrigger		Emancipate_CPU		:Emancipate_CPU 3000
			Echo "**" & ANSI_14 & $TagLineB & ANSI_15 & " Auto Land & Resume Initiated - Awaiting Connection!**"
			pause
			:Emancipate_CPU
			goto :Disco_Test
		end
		waitfor "(?="
		setDelayTrigger		WaitingABit		:WaitingABit	3000
		Echo "**" & ANSI_14 & $TagLineB & ANSI_15 & " Connected - Waiting For Command Prompt!**"
		pause
		:WaitingABit
		killAllTriggers
		gosub :quikstats
		if ($CURRENT_PROMPT = "Command")
			send " L Z" & #8 & $planetToFill & "*  *  J  C  *  "
			setTextLineTrigger	NotLanded	:NotLanded		"Are you sure you want to jettison all cargo?"
			setTextLineTrigger	Landed		:Landed			"<Enter Citadel>"
			setDelayTrigger		TestConn	:TestConn		3000
			pause
			:TestConn
				killAllTriggers
				if (CONNECTED = FALSE)
					goto :Disco_Test
				else
					send ("'{" &$bot_name& "} - " & $TagLineB & " Problem Detected Unable to Land!*")
					halt
				end
			:NotLanded
				killAllTriggers
				send ("'{" &$bot_name& "} - Boton Unable To Land, Check my TA.*")
				send ("'{" & $bot_name & "} "&$TagLineB&" - Unable To Land After Reconnect,Check My TA!**")
				halt
			:Landed
				killAllTriggers
				send ("'{" & $bot_name & "} "&$TagLineB&" - Restarting!**")
		    	waitfor "Message sent on sub-space channel"
				goto :inac
		elseif ($CURRENT_PROMPT = "Citadel")
			send ("'{" & $bot_name & "} "&$TagLineB&" - Restarting!**")
			waitfor "Message sent on sub-space channel"
	   		goto :inac
	   	else
	   		send (" p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '" & $TagLineB & "Attempting to Reach Correct Prompt...*")
			setTextLineTrigger	EMQ_COMPLETE		:EMQ_DELAY "Attempting to Reach Correct Prompt..."
			setDelayTrigger 	EMQ_DELAY		:EMQ_DELAY 3000
			pause
			:EMQ_DELAY
				killAllTriggers
				goto :Disco_Test
		end

:setConnectionTriggers
	killtrigger discod1
	killtrigger discod2
	SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
	SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."

return

