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
    setVar $empty $player~total_holds
    send "*"
    setTextLineTrigger buyfirstoffer :buyfirstoffer "We'll sell them for"
    pause

    :buyfirstoffer
        getWord CURRENTLINE $offer 5
        striptext $offer ","

        gosub :swathoff
        if ($swathoff = 0)
            send "L " & $planet~planet & "* "
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
        getWord CURRENTLINE $player~credits 3
        stripText $player~credits ","
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
	setVar $player~turns_needed 0
	setVar $player~turns_allowed $player~turns
	subtract $player~turns_allowed 1

	# --- calculate how much fuel we can buy
	if ($buydown_fuelrounds > 0)
		setVar $fuelrounds 0
		setVar $planet~planetfuelroom $planet~planet_FUEL_MAX
		subtract $planet~planetfuelroom $planet~planet_FUEL
		setVar $maxfueltobuy $fuelselling
		if ($fuelselling > $planet~planetfuelroom)
			setVar $maxfueltobuy $planet~planetfuelroom
		end
		setVar $maxfuelrounds $maxfueltobuy
		divide $maxfuelrounds $player~total_holds
		if ($maxfuelrounds > $player~turns_allowed)
			setVar $maxfuelrounds $player~turns_allowed
		end
		if ($maxfuelrounds > $buydown_fuelrounds)
			setVar $maxfuelrounds $buydown_fuelrounds
		end
		if ($maxfuelrounds > 0)
			setVar $fuelrounds $maxfuelrounds
		end
		add $player~turns_needed $fuelrounds
		subtract $player~turns_allowed $fuelrounds
	end
    	# --- calculate how much org we can buy
	if ($buydown_orgrounds > 0)
		setVar $orgrounds 0
    	setVar $planet~planetorgroom $planet~planet_ORGANICS_MAX
    	subtract $planet~planetorgroom $planet~planet_ORGANICS
    	setVar $maxorgtobuy $orgselling
    	if ($orgselling > $planet~planetorgroom)
        	setVar $maxorgtobuy $planet~planetorgroom
    	end
    	setVar $maxorgrounds $maxorgtobuy
    	divide $maxorgrounds $player~total_holds
    	if ($maxorgrounds > $player~turns_allowed)
        	setVar $maxorgrounds $player~turns_allowed
    	end
    	if ($maxorgrounds > $buydown_orgrounds)
    		setVar $maxorgrounds $buydown_orgrounds
    	end
    	if ($maxorgrounds > 0)
        	setVar $orgrounds $maxorgrounds
    	end
		add $player~turns_needed $orgrounds
    	subtract $player~turns_allowed $orgrounds
	end
   	# --- calculate how much equip we can buy
   	if ($buydown_equiprounds > 0)
		setVar $equiprounds 0
    	setVar $planet~planetequiproom $planet~planet_EQUIPMENT_MAX
    	subtract $planet~planetequiproom $planet~planet_EQUIPMENT
    	setVar $maxequiptobuy $equipselling
    	if ($equipselling > $planet~planetequiproom)
        	setVar $maxequiptobuy $planet~planetequiproom
    	end
    	setVar $maxequiprounds $maxequiptobuy
    	divide $maxequiprounds $player~total_holds
    	if ($maxequiprounds > $player~turns_allowed)
		setVar $maxequiprounds $player~turns_allowed
    	end
    	if ($maxequiprounds > $buydown_equiprounds)
    		setVar $maxequiprounds $buydown_equiprounds
    	end
    	if ($maxequiprounds > 0)
        	setVar $equiprounds $maxequiprounds
    	end
		add $player~turns_needed $equiprounds
    	subtract $player~turns_allowed $equiprounds
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
		send "'*{" $bot~bot_name "}*Buying down using " & $buydown_mode & "*" $fuelrounds & " rounds of fuel*" $orgrounds & " rounds of org*" $equiprounds & " rounds of equip**"
		setVar $fuelroundsleft $fuelrounds
		setVar $orgroundsleft $orgrounds
		setVar $equiproundsleft $equiprounds
		setVar $fuel_creds_needed 0
		setVar $org_creds_needed 0
		setVar $equip_creds_needed 0

		# determine how much this will all cost, and get credits from citadel if needed
		if ($fuelrounds > 0)
			setVar $fuel_creds_needed $fuelrounds
			multiply $fuel_creds_needed $player~total_holds
			multiply $fuel_creds_needed 30
			if ($buydown_mode = "Worst Price")
				multiply $fuel_creds_needed 3
				divide $fuel_creds_needed 2
			end
		end
		if ($orgrounds > 0)
    		setVar $org_creds_needed $orgrounds
    		multiply $org_creds_needed $player~total_holds
    		multiply $org_creds_needed 60
    		if ($buydown_mode = "Worst Price")
        		multiply $org_creds_needed 3
        		divide $org_creds_needed 2
    		end
		end
		if ($equiprounds > 0)
    		setVar $equip_creds_needed $equiprounds
    		multiply $equip_creds_needed $player~total_holds
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
		setVar $startingCredits $player~credits
		if ($total_creds_needed > $player~credits)
    		setVar $cashonhand $planet~citadel_credits
    		add $cashonhand $player~credits
    		if ($cashonhand > $total_creds_needed)
        		send "C"
        		send "T T " & $player~credits & "* "
        		send "T F " & $total_creds_needed & "* "
        		setVar $player~credits $total_creds_needed
        		setvar $switchboard~message "Withdrew funds from the Treasury to complete the buydown*"
        		gosub :switchboard~switchboard
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
		setVar $init_credits $player~credits

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
		send "L " & $planet~planet & "* t n l 3* "
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
       	send "0* L " & $planet~planet & "* t n l 2* "
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
       	send "0* 0* L " & $planet~planet & "* t n l 1* "
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

	gosub :player~quikstats

	setVar $player~credits_Spent ($init_credits - $player~credits)

	gosub :clearAdjacent

	if ($startingLocation = "Planet")
		send "L  Z" & #8 & #8 & $planet~planet & "*  "
	end

	if (($player~credits > $startingCredits) AND ($startingLocation = "Citadel"))
		send "T T " & ($player~credits-$startingCredits) & "* "
		setvar $switchboard~message "I put back extra funds taken for buydown.*"
		gosub :switchboard~switchboard
   	end


	setvar $switchboard~message $output&"   *"
	if ($player~unlimitedGame)
		setvar $switchboard~message $switchboard~message&" - spent " & $player~credits_spent & " credits - unlimited turns left.*"
	else
		setvar $switchboard~message $switchboard~message&" - spent " & $player~credits_spent & " credits - " & $player~turns & " turns left.*"
	end
	if ($SWITCHBOARD~self_command <> TRUE)
		setVar $SWITCHBOARD~self_command 2
	end
	gosub :switchboard~switchboard
	setVar $exit_message "Normal Exit"

	goto :buydownExit
#==================================   END BUY DOWN (BUY) SUB  ========================================

:_Start_
	gosub :BOT~loadVars
		
	setVar $BOT~help[1]  $BOT~tab&"BUY - Buy Product from port in Sector or Fighters and/or"
	setVar $BOT~help[2]  $BOT~tab&"      shields from Rylos or Alpha"
	setVar $BOT~help[3]  $BOT~tab&"      "
	setVar $BOT~help[4]  $BOT~tab&"  - buy [product] {mode} {cycles}"
	setVar $BOT~help[5]  $BOT~tab&"  - [product] = [f]uel or [o]rg or [e]quip"
	setVar $BOT~help[6]  $BOT~tab&"  - [mode]    = [b]est or [s]peed or [w]orst - default is speed"
	setVar $BOT~help[7]  $BOT~tab&"  - [cycles]  = number of cycles             - default is max" 
	setVar $BOT~help[8]  $BOT~tab&"  - [override] = allows product buydowns with less than 200 holds" 
	setVar $BOT~help[9]  $BOT~tab&"     "
	setVar $BOT~help[10] $BOT~tab&"  - buy [hardware] {amount}"
	setVar $BOT~help[11] $BOT~tab&"  - [hardware]= [fig]hters or [sh]ields or [m]ines"
	setVar $BOT~help[12] $BOT~tab&"  - [amount]  = number to purchase, default is maximum"
	setVar $BOT~help[13] $BOT~tab&"    "
	setVar $BOT~help[14] $BOT~tab&"  - Originally written by Cherokee. "
	gosub :BOT~help_file

	loadVar $game~port_max
# ============================== START HAGGLE VARIABLES ============================
	setVar $overhagglemultiple 	147
	setVar $cyclebuffer 		1
	setVar $cyclebufferlimit 	20
# ============================== END HAGGLE VARIABLES ============================
	gosub :player~quikstats
	setVar $startingLocation $player~current_prompt
	if (($startingLocation <> "Citadel") and ($startingLocation <> "Planet"))
		setvar $switchboard~message "Must start at Citadel or Planet Prompt for Buy Down*"
		gosub :switchboard~switchboard
		halt
	end

	if ($bot~parm1 = "sh")
		if ($startingLocation <> "Citadel")
			setvar $switchboard~message "Shield Buyer must be run from the Citadel"
			gosub :switchboard~switchboard
			halt
		end
		goto :shield_start
	end
	if ($bot~parm1 = "fig")
		if ($startingLocation <> "Citadel")
			setvar $switchboard~message "Fighter Buyer must be run from the Citadel"
			gosub :switchboard~switchboard
		halt
		end
		goto :fighter_start
	end

	if ($player~total_holds < 200)
		getWordPos $bot~user_command_line $pos "override"
		if ($pos = 0)
			setVar $exit_message "This ship has less than 200 holds, cannot buydown without override.*"
			goto :buydownExit
		end
	end

	setVar $output ""
	setVar $equiprounds 0
	setVar $orgrounds 0
	setVar $fuelrounds 0
	isNumber $isNumber2 $bot~parm2
	isNumber $isNumber3 $bot~parm3
	if ($isNumber2)
		if ($bot~parm2 > 0)
			setVar $buydownRoundsFromParam $bot~parm2
		else
			setVar $buydownRoundsFromParam 999999
		end
	elseif ($isNumber3)
		if ($bot~parm3 > 0)
			setVar $buydownRoundsFromParam $bot~parm3
		else
			setVar $buydownRoundsFromParam 999999
		end
	else
		setVar $buydownRoundsFromParam 999999
	end
	if ($bot~parm2 = "w")
       		setVar $buydown_mode 3
	elseif ($bot~parm2 = "b")
	        setVar $buydown_mode 2
	else
   		setVar $buydown_mode 1
	end
	if ($bot~parm1 = "e")
        setVar $buydown_equiprounds $buydownRoundsFromParam
		setVar $buydown_orgrounds 0
		setVar $buydown_fuelrounds 0
	elseif ($bot~parm1 = "o")
	        setVar $buydown_equiprounds 0
		setVar $buydown_orgrounds $buydownRoundsFromParam
		setVar $buydown_fuelrounds 0
	elseif ($bot~parm1 = "f")
        setVar $buydown_equiprounds 0
		setVar $buydown_orgrounds 0
		setVar $buydown_fuelrounds $buydownRoundsFromParam
	else
		setvar $switchboard~message "Please use format buy [type] {speed} {#cycles} {override}*"
		gosub :switchboard~switchboard
		halt
	end

	if ($startingLocation = "Citadel")
		send "Q  "
	end

	if (($player~ore_holds + $player~organic_holds + $player~equipment_holds + $player~colonist_holds) <> 0)
		setVar $MAC ""
		if ($player~ore_holds <> 0)
			setVar $MAC "  T N L 1* "
		end
		if ($player~organic_holds <> 0)
			setVar $MAC ($MAC & " T N L 2* ")
		end
		if ($player~equipment_holds <> 0)
			setVar $MAC ($MAC & " T N L 3* ")
		end
		if ($player~colonist_holds <> 0)
			setVar $MAC ($MAC & " S N L 1* ")
		end
		if ($MAC <> "")
			send $MAC
			gosub :player~quikstats
			if (($player~ore_holds + $player~organic_holds + $player~equipment_holds + $player~colonist_holds) <> 0)
				setvar $switchboard~message "Holds Not Empty*"
				gosub :switchboard~switchboard
				halt
			end
		end
	end

	gosub :planet~getplanetinfo

	if ($startingLocation = "Citadel")
		send "C s* "
	else
		send "Q D"
	end
	waiton "Warps to Sector(s) :"

	gosub :player~getinfo
	gosub :voidAdjacent
	gosub :getportinfo

	if ($validPortFound <> TRUE)
		setVar $exit_message "No valid port found"
       	if ($startingLocation <> "Citadel")
			gosub :planet~landingsub
		end
		gosub :clearAdjacent
		goto :buydownExit
	end

	if ($startingLocation = "Citadel")
		send "Q"
	else
		send "L " & $planet~planet & "* "
	end

    waiton "Planet command (?="
	Goto :Initiate_Buy_Down

:buydownExit
	setvar $switchboard~message "Buy down exiting --- " & $exit_message & "*"
	gosub :switchboard~switchboard
	halt


:voidAdjacent
	SetVar $i 1
	send "  C  "
	While (SECTOR.WARPS[$player~current_sector][$i] <> 0)
		setVar $focus SECTOR.WARPS[$player~current_sector][$i]
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
	while (SECTOR.WARPS[$player~current_sector][$i] <> 0)
		setVar $Focus SECTOR.WARPS[$player~current_sector][$i]
		if ($Focus <> 0)
			send "V0*YN" & $Focus & "*"
		end
		add $i 1
	end
	send "   Q"
	waiton "<Computer deactivated>"
	return

:fighter_start
	setVar $buys FALSE
 	setVar $canBuy 0
 	setVar $amountToBuy $bot~parm2
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
	gosub :planet~getplanetinfo
	send " c "
	gosub :ship~getshipstats
	setvar $home $player~current_sector
	if (($player~current_sector = $map~alpha_centauri) OR ($player~current_sector = $map~rylos))
		if (PORT.CLASS[$player~current_sector] = 0)
			goto :fighter_already
		end
	end

	:fighter_Sub_FighterBuy
		if ($map~alpha_centauri > 0)
			setvar $switchboard~message "Warping Planet to Alpha Centauri*"
			gosub :switchboard~switchboard
			send "p"&$map~alpha_centauri&"*y"
			settextlinetrigger warpit :fighter_warpit "All Systems Ready, shall we engage?"
			settextlinetrigger nowarp :fighter_nowarp "You do not have any fighters in Sector"
			setTextLineTrigger nowarp2 :fighter_already "You are already in that sector!"
			pause
		else
			setvar $switchboard~message "Alpha Centauri is not defined for this bot*"
			gosub :switchboard~switchboard
			goto :fighter_nowarp
		end

	:fighter_warpit
		send "y "
	:fighter_already
		killAllTriggers
		send " s* "
		gosub :player~quikstats
		if (PORT.CLASS[$player~current_sector] = 0)
			setvar $buys TRUE
			send "q m*l* q z* "
			goto :fighter_arrived
		else
			setvar $switchboard~message "Sector "&$map~alpha_centauri&" has no class 0 port in it!*"
			gosub :switchboard~switchboard
			goto :fighter_nowarp
		end
	:fighter_nofig
		setvar $switchboard~message "No Fighter at Alpha Centauri*"
		gosub :switchboard~switchboard
	:fighter_nowarp
		if ($map~alpha_centauri > 0)
			setSectorParameter $map~alpha_centauri "FIGSEC" FALSE
		end
		killAllTriggers
		setvar $switchboard~message "Trying Rylos*"
		gosub :switchboard~switchboard
		if ($map~rylos > 0)
			send "p"&$map~rylos&"*y"
			settextlinetrigger warpit :fighter_warpit "All Systems Ready, shall we engage?"
			settextlinetrigger nowarp :fighter_nowarp2 "You do not have any fighters in Sector"
			setTextLineTrigger nowarp2 :fighter_already "You are already in that sector!"
			pause
		else
			setvar $switchboard~message "Rylos is not defined for this bot.*"
			gosub :switchboard~switchboard
			goto :fighter_end
		end
	:fighter_checkit
		killAllTriggers
		send "s* "
		gosub :player~quikstats
		if (PORT.CLASS[$player~current_sector] = 0)
			goto :fighter_arrived
		else
			setvar $switchboard~message "Sector "&$map~rylos&" has no class 0 port in it!*"
			gosub :switchboard~switchboard
			goto :fighter_end
		end
	:fighter_nowarp2
		killAllTriggers
		if ($map~rylos > 0)
			setSectorParameter $map~rylos "FIGSEC" FALSE
		end
		setvar $switchboard~message "No fighter at either class 0!*"
		gosub :switchboard~switchboard
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
			send "q  z* * l "&$planet~planet&"* c"
			setvar $switchboard~message ""&$totalFigsPurchased&" Fighters added on planet "&$planet~planet&".*"
			gosub :switchboard~switchboard
			goto :fighter_end
		end

	:fighter_arrived2
		send "l " $planet~planet "*  mnl*"
		setTextTrigger maxpfighters :fighter_MaxPfighters "You can't put more than"
		setTextTrigger fightersuccess :fighter_arrived "Done!"
		pause

	:fighter_MaxPfighters
		killAllTriggers
		send "c"
		setvar $buys TRUE
		setvar $switchboard~message "Fighters maxxed out on planet "&$planet~planet&".*"
		gosub :switchboard~switchboard

	:fighter_end
		if ($buys = FALSE)
			setvar $switchboard~message "No fighters able to be purchased*"
			gosub :switchboard~switchboard
		else
			gosub :player~quikstats
			if ($home <> $player~current_sector)
				setvar $switchboard~message "Buy down exiting.  Heading Back to Start Sector*"
				gosub :switchboard~switchboard
				send "p "  $home "* y q m * * * c "
			else
				send "q m* * * c '{" $bot~bot_name "} - Buy down exiting.*"
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
	gosub :planet~getplanetinfo
	send "c"
	setvar $home $player~current_sector
	if ($player~current_sector = $map~alpha_centauri)
		if (PORT.CLASS[$player~current_sector] = 0)
			goto :shield_arrived
		else
			setvar $switchboard~message "Sector "&$map~alpha_centauri&" has no class 0 port in it!*"
			gosub :switchboard~switchboard
			goto :shield_nowarp
		end
	end
	killAllTriggers
	:shield_Sub_ShieldBuy
		if ($player~current_sector = $map~alpha_centauri)
			if (PORT.CLASS[$player~current_sector] = 0)
				goto :shield_arrived
			end
		elseif ($map~alpha_centauri > 0)
			setvar $switchboard~message "Warping Planet to ALPHA*"
			gosub :switchboard~switchboard
			send "p"&$map~alpha_centauri&"*y"
			settextlinetrigger warpit :shield_warpit "All Systems Ready, shall we engage?"
			settextlinetrigger nowarp :shield_nofig "You do not have any fighters in Sector"
			pause
		else
			setvar $switchboard~message "Alpha Centauri is not defined for this bot*"
			gosub :switchboard~switchboard
			goto :shield_nowarp
		end

	:shield_warpit
		killAllTriggers
		send "y  s*"
		gosub :player~quikstats
		if (PORT.CLASS[$player~current_sector] = 0)
			setvar $buys TRUE
			send "q q* "
			goto :shield_arrived
		else
			setvar $switchboard~message "Sector "&$map~alpha_centauri&" has no class 0 port in it!*"
			gosub :switchboard~switchboard
		end

	:shield_nofig
		killAllTriggers
		if ($map~alpha_centauri > 0)
			setSectorParameter $map~alpha_centauri "FIGSEC" FALSE
		end
		setvar $switchboard~message "No Fighter at Alpha Centauri*"
		gosub :switchboard~switchboard
	:shield_nowarp
		killtrigger warpit
		setvar $switchboard~message "Trying Rylos*"
		gosub :switchboard~switchboard
		if ($map~rylos > 0)
			send "p"&$map~rylos&"*y"
			settextlinetrigger warpit :shield_warpit "All Systems Ready, shall we engage?"
			settextlinetrigger nowarp :shield_nowarp2 "You do not have any fighters in Sector"
			settextlinetrigger nowarp2 :shield_checkit "You are already in that sector!"
			pause
		else
			setvar $switchboard~message "Rylos is not defined for this bot*"
			gosub :switchboard~switchboard
			goto :shield_end
		end
	:shield_checkit
		killAllTriggers
		send "s* "
		gosub :player~quikstats
		if (PORT.CLASS[$player~current_sector] = 0)
			goto :shield_arrived
		else
			setvar $switchboard~message "Sector "&$map~rylos&" has no class 0 port in it!*"
			gosub :switchboard~switchboard
			goto :shield_end
		end

	:shield_nowarp2
		killAllTriggers
		if ($map~rylos > 0)
			setSectorParameter $map~rylos "FIGSEC" FALSE
		end
		setvar $switchboard~message "No Fighter at either Class 0!*"
		gosub :switchboard~switchboard
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
			send "q l "&$planet~planet&"* c"
			setvar $switchboard~message "Shields maxxed out on planet "&$planet~planet&".*"
			gosub :switchboard~switchboard
			goto :shield_end
		end

	:shield_arrived2
		send "L " $planet~planet "*  cgt"
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
		setvar $switchboard~message "Shields maxxed out on planet "&$planet~planet&".*"
		gosub :switchboard~switchboard
		goto :shield_end

	:shield_end
		if ($buys = FALSE)
			setvar $switchboard~message "No shields able to be purchased*"
			gosub :switchboard~switchboard
		else
			gosub :player~quikstats
			if ($home <> $player~current_sector)
				setvar $switchboard~message "Buy down exiting.  Heading Back to Start Sector*"
				gosub :switchboard~switchboard
				send "p "  $home "*  y"
			else
				setvar $switchboard~message "Buy down exiting.*"
				gosub :switchboard~switchboard
			end
		end
		halt

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



#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"

