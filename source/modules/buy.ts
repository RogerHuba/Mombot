	goto	:_Start_
# ======================     START BUYING SUBROUTINES     =================
#=================================QUIKSTATS================================================
# ===========================  START SWATH DISABLING SUBROUTINE  =================
:swathoff
    if ($swathoff = FALSE)
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
:quikstats
	setVar $CURRENT_PROMPT       "Undefined"
	setVar $PSYCHIC_PROBE        "NO"
	setVar $PLANET_SCANNER       "NO"
	setVar $SCAN_TYPE            "NONE"
	setVar $CURRENT_SECTOR       0
	setVar $TURNS                0
	setVar $CREDITS              0
	setVar $FIGHTERS             0
	setVar $SHIELDS              0
	setVar $TOTAL_HOLDS          0
	setVar $ORE_HOLDS            0
	setVar $ORGANIC_HOLDS        0
	setVar $EQUIPMENT_HOLDS      0
	setVar $COLONIST_HOLDS       0
	setVar $PHOTONS              0
	setVar $ARMIDS               0
	setVar $LIMPETS              0
	setVar $GENESIS              0
	setVar $TWARP_TYPE           0
	setVar $CLOAKS               0
	setVar $BEACONS              0
	setVar $ATOMIC               0
	setVar $CORBO                0
	setVar $EPROBES              0
	setVar $MINE_DISRUPTORS      0
	setVar $ALIGNMENT            0
	setVar $EXPERIENCE           0
	setVar $CORP                 0
	setVar $SHIP_NUMBER          0
	setVar $TURNS_PER_WARP       0
	setVar $COMMAND_PROMPT       "Command"
	setVar $COMPUTER_PROMPT      "Computer"
	setVar $CITADEL_PROMPT       "Citadel"
	setVar $PLANET_PROMPT        "Planet"
	setVar $CORPORATE_PROMPT     "Corporate"
	setVar $STARDOCK_PROMPT      "<Stardock>"
	setVar $HARDWARE_PROMPT      "<Hardware"
	setVar $SHIPYARD_PROMPT      "<Shipyard>"
	setVar $TERRA_PROMPT         "Terra"
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
	setTextTrigger		prompt3         	:terraPrompts		"Do you wish to (L)eave or (T)ake Colonists?"
	setTextTrigger		prompt4         	:terraPrompts		"How many groups of Colonists do you want to take ("

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
				getWord $stats $TURNS  			($current_word + 1)
			elseif ($wordy = "Creds")
				getWord $stats $CREDITS  		($current_word + 1)
			elseif ($wordy = "Figs")
				getWord $stats $FIGHTERS   		($current_word + 1)
			elseif ($wordy = "Shlds")
				getWord $stats $SHIELDS  		($current_word + 1)
			elseif ($wordy = "Hlds")
				getWord $stats $TOTAL_HOLDS  		($current_word + 1)
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
				getWord $stats $PSYCHIC_PROBE 	($current_word + 1)
			elseif ($wordy = "PlScn")
				getWord $stats $PLANET_SCANNER  	($current_word + 1)
			elseif ($wordy = "LRS")
				getWord $stats $SCAN_TYPE    		($current_word + 1)
			elseif ($wordy = "Aln")
				getWord $stats $ALIGNMENT    		($current_word + 1)
			elseif ($wordy = "Exp")
				getWord $stats $EXPERIENCE    	($current_word + 1)
			elseif ($wordy = "Corp")
				getWord $stats $CORP   			($current_word + 1)
			elseif ($wordy = "Ship")
				getWord $stats $SHIP_NUMBER   	($current_word + 1)
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
    setTextLineTrigger buyfirstoffer :buyfirstoffer "We'll sell them for"
    pause

    :buyfirstoffer
        getWord CURRENTLINE $offer 5
        striptext $offer ","

        gosub :swathoff
        if ($swathoff = 0)
            send "L " & $PLANET & "* "
		if ($startingLocation = "Citadel")
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
        waitOn "How many holds of"
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
        waitOn " Sect "
    end
    return

:Initiate_Buy_Down
	setVar $turns_needed 0
	setVar $turns_allowed $TURNS
	subtract $turns_allowed 1

	# --- calculate how much fuel we can buy
	if ($buydown_fuelrounds > 0)
		setVar $fuelrounds 0
		setVar $planetfuelroom $PLANET_FUEL_MAX
		subtract $planetfuelroom $PLANET_FUEL
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
    	setVar $planetorgroom $PLANET_ORGANICS_MAX
    	subtract $planetorgroom $PLANET_ORGANICS
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
    	setVar $planetequiproom $PLANET_EQUIPMENT_MAX
    	subtract $planetequiproom $PLANET_EQUIPMENT
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
       	if ($startingLocation = "Citadel")
			send "C "
       	else
    		send "q "
		end
       	setVar $exit_message "Nothing to buy"
		gosub :clearAdjacent
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
		send "'*{" $bot_name "}*Buying down using " & $buydown_mode & "*" $fuelrounds & " rounds of fuel*" $orgrounds & " rounds of org*" $equiprounds & " rounds of equip**"
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
    		setVar $cashonhand $CITADEL_CREDITS
    		add $cashonhand $CREDITS
    		if ($cashonhand > $total_creds_needed)
        		send "C"
        		send "T T " & $CREDITS & "* "
        		send "T F " & $total_creds_needed & "* "
        		setVar $CREDITS $total_creds_needed
        		send "'{" $bot_name "} - Withdrew funds from the Treasury to complete the buydown*"
        		send "Q"
    		else
	    		if ($startingLocation = "Citadel")
					send "C "
				else
					send "q "
				end
				setVar $exit_message "Not enough cash onhand"
				gosub :clearAdjacent
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
		send "L " & $PLANET & "* t n l 3* "
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
       	send "0* L " & $PLANET & "* t n l 2* "
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
       	send "0* 0* L " & $PLANET & "* t n l 1* "
       	subtract $fuelroundsleft 1
       	goto :buydownfuel
   	end
   	if ($fuelrounds > 0)
       	if ($buydown_mode = "Worst Price")
			setVar $output $output & " - Fuel Ore overhaggled at " & $overhagglemultiple & "*"
       	end
   	end

:buydownFinish

	if ($startingLocation = "Citadel")
		send "C "
		waitfor "<Enter Citadel>"
	else
		send "Q "
		waitfor "Command [TL="
	end

	gosub :quikstats

	setVar $credits_Spent ($init_credits - $CREDITS)

	gosub :clearAdjacent

	if ($startingLocation = "Planet")
		send "L  Z" & #8 & #8 & $PLANET & "*  "
	end

	if (($CREDITS > $startingCredits) AND ($startingLocation = "Citadel"))
		send "T T " & ($CREDITS-$startingCredits) & "* "
		send "'{" $bot_name "} - I put back extra funds taken for buydown.*"
   	end
	send "'*{" $bot_name "}*"
	if ($output <> "")
		send $output
	end
	if ($unlimitedGame)
		send " - spent " & $credits_spent & " credits - unlimited turns left.*"
	else
		send " - spent " & $credits_spent & " credits - " & $TURNS & " turns left.*"
	end
	send "*  "
	setVar $exit_message "Normal Exit"

	goto :buydownExit
#==================================   END BUY DOWN (BUY) SUB  ========================================

:_Start_
	logging off
	loadVar $bot_name
	loadVar $unlimitedGame
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
	loadVar $stardock
	loadVar $backdoor
	loadvar $LIMPET_COST
	loadvar $ARMID_COST
	loadVar $LIMPET_REMOVAL_COST
	loadvar $password
	loadVar $port_max
	loadvar $RYLOS
	loadvar $ALPHA_CENTAURI
# ============================== START HAGGLE VARIABLES ============================
	setVar $overhagglemultiple 	147
	setVar $cyclebuffer 		1
	setVar $cyclebufferlimit 	20
# ============================== END HAGGLE VARIABLES ============================
	getWord $user_command_line $parm1 1
	getWord $user_command_line $parm2 2
	getWord $user_command_line $parm3 3
	getWord $user_command_line $parm4 4
	getWord $user_command_line $parm5 5
	getWord $user_command_line $parm6 6
	getWord $user_command_line $parm7 7
	getWord $user_command_line $parm8 8
	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	if (($startingLocation <> "Citadel") and ($startingLocation <> "Planet"))
		send "'{" $bot_name "} - Must start at Citadel or Planet Prompt for Buy Down*"
		halt
	end

	if ($parm1 = "sh")
		if ($startingLocation <> "Citadel")
			send "'{" $bot_name "} - Shield Buyer must be run from the Citadel"
			halt
		end
		goto :shield_start
	end
	if ($parm1 = "fig")
		if ($startingLocation <> "Citadel")
			send "'{" $bot_name "} - Fighter Buyer must be run from the Citadel"
			halt
		end
		goto :fighter_start
	end

	if ($TOTAL_HOLDS < 200)
		getWordPos $user_command_line $pos "override"
		if ($pos = 0)
			setVar $exit_message "This ship has less than 200 holds, cannot buydown without override.*"
			goto :buydownExit
		end
	end

	setVar $output ""
	setVar $equiprounds 0
	setVar $orgrounds 0
	setVar $fuelrounds 0
	isNumber $isNumber2 $parm2
	isNumber $isNumber3 $parm3
	if ($isNumber2)
		if ($parm2 > 0)
			setVar $buydownRoundsFromParam $parm2
		else
			setVar $buydownRoundsFromParam 999999
		end
	elseif ($isNumber3)
		if ($parm3 > 0)
			setVar $buydownRoundsFromParam $parm3
		else
			setVar $buydownRoundsFromParam 999999
		end
	else
		setVar $buydownRoundsFromParam 999999
	end
	if ($parm2 = "w")
       		setVar $buydown_mode 3
	elseif ($parm2 = "b")
	        setVar $buydown_mode 2
	else
   		setVar $buydown_mode 1
	end
	if ($parm1 = "e")
        setVar $buydown_equiprounds $buydownRoundsFromParam
		setVar $buydown_orgrounds 0
		setVar $buydown_fuelrounds 0
	elseif ($parm1 = "o")
	        setVar $buydown_equiprounds 0
		setVar $buydown_orgrounds $buydownRoundsFromParam
		setVar $buydown_fuelrounds 0
	elseif ($parm1 = "f")
        setVar $buydown_equiprounds 0
		setVar $buydown_orgrounds 0
		setVar $buydown_fuelrounds $buydownRoundsFromParam
	else
		send "'{" $bot_name "} - Please use format buy [type] {speed} {#cycles} {override}*"
		halt
	end

	if ($startingLocation = "Citadel")
		send "Q  "
	end

	if (($ORE_HOLDS + $ORGANIC_HOLDS + $EQUIPMENT_HOLDS + $COLONIST_HOLDS) <> 0)
		setVar $MAC ""
		if ($ORE_HOLDS <> 0)
			setVar $MAC "  T N L 1* "
		end
		if ($ORGANIC_HOLDS <> 0)
			setVar $MAC ($MAC & " T N L 2* ")
		end
		if ($EQUIPMENT_HOLDS <> 0)
			setVar $MAC ($MAC & " T N L 3* ")
		end
		if ($COLONIST_HOLDS <> 0)
			setVar $MAC ($MAC & " S N L 1* ")
		end
		if ($MAC <> "")
			send $MAC
			gosub :quikstats
			if (($ORE_HOLDS + $ORGANIC_HOLDS + $EQUIPMENT_HOLDS + $COLONIST_HOLDS) <> 0)
				send "'{" $bot_name "} - Holds Not Empty*"
				halt
			end
		end
	end

	gosub :getPlanetinfo

	if ($startingLocation = "Citadel")
		send "C s* "
	else
		send "Q D"
	end
	waiton "Warps to Sector(s) :"

	gosub :getinfo
	gosub :voidAdjacent
	gosub :getPortInfo

	if ($validPortFound <> TRUE)
		setVar $exit_message "No valid port found"
       	if ($startingLocation <> "Citadel")
			gosub :landingSub
		end
		gosub :clearAdjacent
		goto :buydownExit
	end

	if ($startingLocation = "Citadel")
		send "Q"
	else
		send "L " & $PLANET & "* "
	end

    waiton "Planet command (?="
	Goto :Initiate_Buy_Down

:buydownExit
	send "'{" $bot_name "} - Buy down exiting --- " & $exit_message & "*"
	halt


# ==============================  START PLANET INFO SUBROUTINE  =================
:getPlanetInfo
	send "*"
	setTextLineTrigger planetInfo :planetInfo "Planet #"
	pause

	:planetinfo
		setVar $CITADEL 0
		setVar $SECTOR_CANNON 0
		setVar $ATMOSPHERE_CANNON 0
		setVar $CITADEL_CREDITS 0
		getWord CURRENTLINE $PLANET 2
		stripText $PLANET "#"
		waitOn "2 Build 1   Product    Amount     Amount     Maximum"

        :getPlanetStuff
		setTextLineTrigger fuelstart :fuelstart "Fuel Ore"
		setTextLineTrigger orgstart :orgstart "Organics"
		setTextLineTrigger equipstart :equipstart "Equipment"
		setTextLineTrigger figstart :figstart "Fighters        N/A"
		setTextLineTrigger citadelstart :citadelstart "Planet has a level"
		setTextLineTrigger cannon :cannonstart ", AtmosLvl="
		setTextTrigger planetInfoDone :planetInfoDone "Planet command (?=help)"
		pause

        :fuelstart
		getWord CURRENTLINE $PLANET_FUEL 6
		getWord CURRENTLINE $PLANET_FUEL_MAX 8
		stripText $PLANET_FUEL ","
		stripText $PLANET_FUEL_MAX ","
		pause

        :orgstart
		getWord CURRENTLINE $PLANET_ORGANICS 5
		getWord CURRENTLINE $PLANET_ORGANICS_MAX 7
		stripText $PLANET_ORGANICS ","
		stripText $PLANET_ORGANICS_MAX ","
		pause

        :equipstart
		getWord CURRENTLINE $PLANET_EQUIPMENT 5
		getWord CURRENTLINE $PLANET_EQUIPMENT_MAX 7
		stripText $PLANET_EQUIPMENT ","
		stripText $PLANET_EQUIPMENT_MAX ","
		pause

        :figstart
		getWord CURRENTLINE $PLANET_FIGHTERS 5
		getWord CURRENTLINE $PLANET_FIGHTERS_MAX 7
		stripText $PLANET_FIGHTERS ","
		stripText $PLANET_FIGHTERS_MAX ","
		pause

        :citadelstart
		getWord CURRENTLINE $CITADEL 5
		getWord CURRENTLINE $CITADEL_CREDITS 9
		striptext $CITADEL_CREDITS ","
		pause

	:cannonstart
		getWord CURRENTLINE $ATMOSPHERE_CANNON 5
		getWord CURRENTLINE $SECTOR_CANNON 6
		stripText $SECTOR_CANNON "SectLvl="
		striptext $SECTOR_CANNON "%"
		stripText $ATMOSPHERE_CANNON "AtmosLvl="
		striptext $ATMOSPHERE_CANNON "%"
		striptext $ATMOSPHERE_CANNON ","
		pause
	:planetInfoDone
		killAllTriggers
return
# ==============================  END PLANET INFO SUBROUTINE  =================


# ============================  START PLAYER INFO SUBROUTINE  =================
:getInfo
	send "I"
	waitOn "<Info>"
	:waitOnInfo
        	setTextLineTrigger getTurns :getTurns "Turns left"
			setTextTrigger getInfoDone :getInfoDone "Command [TL="
        	setTextTrigger getInfoDone2 :getInfoDone "Citadel command"
        	pause
	:getTurns
	        getWord CURRENTLINE $TURNS 4
	        if ($TURNS = "Unlimited")
	            setVar $TURNS 65000
		    setVar $unlimitedGame TRUE
	        end
			saveVar $unlimitedGame
	        pause
	:getInfoDone
		killAllTriggers
return
# ==============================  END PLAYER INFO SUBROUTINE  =================
:voidAdjacent
	SetVar $i 1
	send "  C  "
	While (SECTOR.WARPS[$CURRENT_SECTOR][$i] <> 0)
		setVar $focus SECTOR.WARPS[$CURRENT_SECTOR][$i]
		if ($focus <> 0)
			send "V"&$Focus&"*"
		end
		add $i 1
	end
	send "  Q"
	waiton "<Computer deactivated>"
	return
:clearadjacent
	setVar $i 1
	send "  C  "
	while (SECTOR.WARPS[$CURRENT_SECTOR][$i] <> 0)
		setVar $Focus SECTOR.WARPS[$CURRENT_SECTOR][$i]
		if ($Focus <> 0)
			send "V0*YN" & $Focus & "*"
		end
		add $i 1
	end
	send "   Q"
	waiton "<Computer deactivated>"
	return
:getPortInfo
# ----- SUB :getPortInfo -----
:getPortInfo
	send "C R*Q"
    setVar $validPortFound FALSE
    setTextLineTrigger foundport	:foundport2		"Items     Status  Trading % of max OnBoard"
    setTextLineTrigger noport		:noport2		"I have no information about a port in that sector."
    setTextLineTrigger noport2		:noport2		"You have never visted sector"
    setTextLineTrigger noport3		:noport2		"credits / next hold"
    setTextLineTrigger noport4		:noport2		"A  Cargo holds     :"
    pause

    :noport2
		killAllTriggers
		return

    :foundport2
		killtrigger foundport
		killtrigger noport
		killtrigger noport2
		killtrigger noport3
		setVar $fuelselling 0
        setVar $orgselling 0
        setVar $equipselling 0
		setVar $validPortFound TRUE
        :getselling
            setTextLineTrigger portfuelinfo 	:portfuelinfo2 		"Fuel Ore   Selling"
            setTextLineTrigger portorginfo 		:portorginfo2 		"Organics   Selling"
            setTextLineTrigger portequipinfo 	:portequipinfo2 	"Equipment  Selling"
            setTextLineTrigger gotallportinfo 	:gotallportinfo2 	"<Computer deactivated>"
            pause

        :portfuelinfo2
            getWord CURRENTLINE $fuelselling 4
            setTextLineTrigger portfuelinfo :portfuelinfo2 "Fuel Ore   Selling"
            pause

        :portorginfo2
            getWord CURRENTLINE $orgselling 3
            setTextLineTrigger portorginfo :portorginfo2 "Organics   Selling"
		    pause

        :portequipinfo2
            getWord CURRENTLINE $equipselling 3
            setTextLineTrigger portequipinfo :portequipinfo2 "Equipment  Selling"
		    pause

        :gotallportinfo2
			killAllTriggers
	return

#========================== START LANDING SUB ===============================================
:landingSub
    send "l  z" & #8 & #8 & #8 & $PLANET "*z  n  z  n  *  "
	setVar $sucessfulCitadel FALSE
	setVar $sucessfulPlanet FALSE
	setTextLineTrigger noplanet		:noplanet 	"There isn't a planet in this sector."
	setTextLineTrigger no_land		:no_land 	"since it couldn't possibly stand"
	setTextLineTrigger planet		:planet 	"Planet #"
	setTextLineTrigger wrongone		:wrong_num	"That planet is not in this sector."
	pause

:noplanet
	killalltriggers
	send "'{" $bot_name "} - No Planet in Sector!*"
	return

:no_land
	killalltriggers
	send "'{" $bot_name "} - This ship cannot land!*"
	return

:planet
	killalltriggers
	getWord CURRENTLINE $pnum_ck 2
	stripText $pnum_ck "#"
	if ($pnum_ck <> $PLANET)
		send "q"
		goto :wrong_num
	end
	setTextTrigger wrong_num :wrong_num "That planet is not in this sector."
	setTextTrigger planet :planet_prompt "Planet command"
	pause

:wrong_num
	killalltriggers
	send "**'{" $bot_name "} - Incorrect Planet Number*"
	return

:planet_prompt
	killtrigger wrong_num
	setVar $currentBotPlanet $planet
	saveVar $currentBotPlanet
	send "c"
	setTextTrigger build_cit :build_cit "Do you wish to construct one?"
	setTextTrigger in_cit :in_cit "Citadel command"
	setTextTrigger nocitallowed :build_cit "Citadels are not allowed in FedSpace."
	setTextTrigger citnotbuiltyet :build_cit "Be patient, your Citadel is not yet finished."
	pause

:build_cit
	killtrigger in_cit
	killtrigger nocitallowed
	killtrigger build_cit
	killtrigger citnotbuiltyet
	setVar $sucessfulPlanet TRUE
	send "n*"
	setVar $startingLocation "Planet"
	return

:in_cit
	killAllTriggers
	setVar $sucessfulCitadel TRUE
	setVar $startingLocation "Citadel"
return
#============================== END LANDING SUB =============================================

:fighter_start
	setVar $buys FALSE
 	setVar $canBuy 0
 	setVar $amountToBuy $parm2
 	setVar $buyAll FALSE
	setVar $totalFigsPurchased 0
    isNumber $test $amountToBuy
	if ($test <> TRUE)
		setVar $buyAll TRUE
	else
		if ($amountToBuy <= 0)
			setVar $buyAll TRUE
		end
	end
	send " q "
	gosub :getPlanetInfo
	send " c "
	gosub :getShipStats
	setvar $home $CURRENT_SECTOR
	if (($CURRENT_SECTOR = $ALPHA_CENTAURI) OR ($CURRENT_SECTOR = $RYLOS))
		if (PORT.CLASS[$CURRENT_SECTOR] = 0)
			goto :fighter_already
		end
	end

	:fighter_Sub_FighterBuy
		if ($ALPHA_CENTAURI > 0)
			send "'{" $bot_name "} - Warping Planet to Alpha Centauri*"
			send "p"&$ALPHA_CENTAURI&"*y"
			settextlinetrigger warpit :fighter_warpit "All Systems Ready, shall we engage?"
			settextlinetrigger nowarp :fighter_nowarp "You do not have any fighters in Sector"
			setTextLineTrigger nowarp2 :fighter_already "You are already in that sector!"
			pause
		else
			send "'{" $bot_name "} - Alpha Centauri is not defined for this bot*"
			goto :fighter_nowarp
		end

	:fighter_warpit
		send "y "
	:fighter_already
		killAllTriggers
		send " s* "
		gosub :quikstats
		if (PORT.CLASS[$CURRENT_SECTOR] = 0)
			setvar $buys TRUE
			send "q m*l* q z* "
			goto :fighter_arrived
		else
			send "'{" $bot_name "} - Sector "&$alpha_centauri&" has no class 0 port in it!*"
			goto :fighter_nowarp
		end
	:fighter_nofig
		send "'{" $bot_name "} - No Fighter at Alpha Centauri*"
	:fighter_nowarp
		if ($ALPHA_CENTAURI > 0)
			setSectorParameter $ALPHA_CENTAURI "FIGSEC" FALSE
		end
		killAllTriggers
		send "'{" $bot_name "} - Trying Rylos*"
		if ($RYLOS > 0)
			send "p"&$RYLOS&"*y"
			settextlinetrigger warpit :fighter_warpit "All Systems Ready, shall we engage?"
			settextlinetrigger nowarp :fighter_nowarp2 "You do not have any fighters in Sector"
			setTextLineTrigger nowarp2 :fighter_already "You are already in that sector!"
			pause
		else
			send "'{" $bot_name "} - Rylos is not defined for this bot.*"
			goto :fighter_end
		end
	:fighter_checkit
		killAllTriggers
		send "s* "
		gosub :quikstats
		if (PORT.CLASS[$CURRENT_SECTOR] = 0)
			goto :fighter_arrived
		else
			send "'{" $bot_name "} - Sector "&$rylos&" has no class 0 port in it!*"
			goto :fighter_end
		end
	:fighter_nowarp2
		killAllTriggers
		if ($RYLOS > 0)
			setSectorParameter $RYLOS "FIGSEC" FALSE
		end
		send "'{" $bot_name "} - No fighter at either class 0!*"
		setvar $buys FALSE
		goto :fighter_end

	:fighter_arrived
		killAllTriggers
		send "q q* p t"
		settexttrigger buyfiglimp     :removelimp     "removal? : (Y/N)"
		settexttrigger buyfignolimp   :buythefigs     "credits per fighter"
		pause

		:removelimp
		   send "y"
		   pause
		:buythefigs
		killtrigger buyfiglimp
		getWord CURRENTLINE $canbuy 8
		if (($canbuy > 0) AND ((($buyAll = FALSE) AND ($amountToBuy > 0)) OR ($buyAll = TRUE)))
			setvar $buys TRUE
			if (($buyAll = FALSE) AND ($amountToBuy < $canBuy))
				send "b "&$amountToBuy&"* q"
				add $totalFigsPurchased $amountToBuy
				setVar $amountToBuy 0
			else
			   send "b "&$canbuy&"* q"
			   add $totalFigsPurchased $canbuy
			   setVar $amountToBuy ($amountToBuy-$canBuy)
			end
		else
			send "q  z* * l "&$PLANET&"* c"
			send "'{" $bot_name "} - "&$totalFigsPurchased&" Fighters added on planet "&$planet&".*"
			goto :fighter_end
		end

	:fighter_arrived2
		send "l " $PLANET "*  mnl*"
		setTextTrigger maxpfighters :fighter_MaxPfighters "You can't put more than"
		setTextTrigger fightersuccess :fighter_arrived "Done!"
		pause

	:fighter_MaxPfighters
		killAllTriggers
		send "c"
		setvar $buys TRUE
		send "'{" $bot_name "} - Fighters maxxed out on planet "&$planet&".*"

	:fighter_end
		if ($buys = FALSE)
			send "'{" $bot_name "} - No fighters able to be purchased*"
		else
			gosub :quikstats
			if ($home <> $CURRENT_SECTOR)
				send "'{" $bot_name "} - Buy down exiting.  Heading Back to Start Sector*"
				send "p "  $home "* y q m * * * c "
			else
				send "q m* * * c '{" $bot_name "} - Buy down exiting.*"
			end
		end
		halt

# ======================     END FIGHTER BUY (BUY FIG) SUBROUTINE    ==========================
# ======================     START SHIELD BUY (BUY SH) SUBROUTINE    ==========================
:shield_start
	setVar $buys FALSE
	send "gt"
	waitOn "and the Shield System"
	getword CURRENTLINE $current_shields 3
	divide $current_shields 10
	send $current_shields&"*"
	send "q"
	gosub :getPlanetInfo
	send "c"
	setvar $home $CURRENT_SECTOR
	if ($CURRENT_SECTOR = $ALPHA_CENTAURI)
		if (PORT.CLASS[$CURRENT_SECTOR] = 0)
			goto :shield_arrived
		else
			send "'{" $bot_name "} - Sector "&$alpha_centauri&" has no class 0 port in it!*"
			goto :shield_nowarp
		end
	end
	killAllTriggers
	:shield_Sub_ShieldBuy
		if ($CURRENT_SECTOR = $ALPHA_CENTAURI)
			if (PORT.CLASS[$CURRENT_SECTOR] = 0)
				goto :shield_arrived
			end
		elseif ($alpha_centauri > 0)
			send "'{" $bot_name "} - Warping Planet to ALPHA*"
			send "p"&$ALPHA_CENTAURI&"*y"
			settextlinetrigger warpit :shield_warpit "All Systems Ready, shall we engage?"
			settextlinetrigger nowarp :shield_nofig "You do not have any fighters in Sector"
			pause
		else
			send "'{" $bot_name "} - Alpha Centauri is not defined for this bot*"
			goto :shield_nowarp
		end

	:shield_warpit
		killAllTriggers
		send "y  s*"
		gosub :quikstats
		if (PORT.CLASS[$CURRENT_SECTOR] = 0)
			setvar $buys TRUE
			send "q q* "
			goto :shield_arrived
		else
			send "'{" $bot_name "} - Sector "&$alpha_centauri&" has no class 0 port in it!*"
		end

	:shield_nofig
		killAllTriggers
		if ($ALPHA_CENTAURI > 0)
			setSectorParameter $ALPHA_CENTAURI "FIGSEC" FALSE
		end
		send "'{" $bot_name "} - No Fighter at Alpha Centauri*"
	:shield_nowarp
		killtrigger warpit
		send "'{" $bot_name "} - Trying Rylos*"
		if ($rylos > 0)
			send "p"&$RYLOS&"*y"
			settextlinetrigger warpit :shield_warpit "All Systems Ready, shall we engage?"
			settextlinetrigger nowarp :shield_nowarp2 "You do not have any fighters in Sector"
			settextlinetrigger nowarp2 :shield_checkit "You are already in that sector!"
			pause
		else
			send "'{" $bot_name "} - Rylos is not defined for this bot*"
			goto :shield_end
		end
	:shield_checkit
		killAllTriggers
		send "s* "
		gosub :quikstats
		if (PORT.CLASS[$CURRENT_SECTOR] = 0)
			goto :shield_arrived
		else
			send "'{" $bot_name "} - Sector "&$rylos&" has no class 0 port in it!*"
			goto :shield_end
		end

	:shield_nowarp2
		killAllTriggers
		if ($RYLOS > 0)
			setSectorParameter $RYLOS "FIGSEC" FALSE
		end
		send "'{" $bot_name "} - No Fighter at either Class 0!*"
		setvar $buys FALSE
		goto :shield_end

	:shield_arrived
		killAllTriggers
		send "q  q  z  n  p  t  y"
		waitOn "C  Shield Points   :"
		getWord CURRENTLINE $canbuy 9
		if ($canbuy > 0)
			send "c "&$canbuy&"*  q"
		elseif ($canbuy = 0)
			setvar $buys TRUE
			send "q l "&$planet&"* c"
			send "'{" $bot_name "} - Shields maxxed out on planet "&$planet&".*"
			goto :shield_end
		end

	:shield_arrived2
		send "L " $PLANET "*  cgt"
		waitOn "and the Shield System"
		getword CURRENTLINE $current_shields 3
		divide $current_shields 10
		send $current_shields "*"
		setTextTrigger maxpshields :shield_MaxPShields "The planet is limited to"
		setTextTrigger shieldsuccess :shield_arrived "Citadel command"
		pause

	:shield_MaxPShields
		killAllTriggers
		getWord CURRENTLINE $MaxPShields 6
		subtract $MaxPShields $CurPShields
		send "gt" $MaxPShields "*"
		setvar $buys TRUE
		send "'{" $bot_name "} - Shields maxxed out on planet "&$planet&".*"
		goto :shield_end

	:shield_end
		if ($buys = FALSE)
			send "'{" $bot_name "} - No shields able to be purchased*"
		else
			gosub :quikstats
			if ($home <> $CURRENT_SECTOR)
				send "'{" $bot_name "} - Buy down exiting.  Heading Back to Start Sector*"
				send "p "  $home "*  y"
			else
				send "'{" $bot_name "} - Buy down exiting.*"
			end
		end
		halt

# ======================     END SHIELD BUY (BUY SH) SUBROUTINE    ==========================
:getShipStats
	send "c;q"
	setTextLineTrigger	getshipoffense		:shipoffenseodds	"Offensive Odds: "
	setTextLineTrigger	getshipfighters 	:shipmaxfigsperattack	" TransWarp Drive:   "
	setTextLineTrigger	getshipmines 		:shipmaxmines		" Mine Max:  "
	pause

	:shipoffenseodds
		getWordPos CURRENTANSILINE $pos "[0;31m:[1;36m1"
		if ($pos > 0)
			getText CURRENTANSILINE $SHIP_OFFENSIVE_ODDS "Offensive Odds[1;33m:[36m " "[0;31m:[1;36m1"
			stripText $SHIP_OFFENSIVE_ODDS "."
			stripText $SHIP_OFFENSIVE_ODDS " "
			gettext CURRENTANSILINE $SHIP_FIGHTERS_MAX "Max Fighters[1;33m:[36m" "[0;32m Offensive Odds"
			stripText $SHIP_FIGHTERS_MAX ","
			stripText $SHIP_FIGHTERS_MAX " "
		end
		pause
	:shipmaxmines
		getText CURRENTLINE $SHIP_MINES_MAX "Mine Max:" "Beacon Max:"
		stripText $SHIP_MINES_MAX " "
		pause

	:shipmaxfigsperattack
		getWordPos CURRENTANSILINE $pos "[0m[32m Max Figs Per Attack[1;33m:[36m"
		if ($pos > 0)
			getText CURRENTANSILINE $SHIP_MAX_ATTACK "[0m[32m Max Figs Per Attack[1;33m:[36m" "[0;32mTransWarp"
			striptext $SHIP_MAX_ATTACK " "
		end
		killAllTriggers
	return