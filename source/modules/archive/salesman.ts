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

		
:merchant
	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		send "'{" $bot_name "} - You must run Travelling Salesman command from a Citadel prompt.*"
     		halt
	end
	
	setVar $buyFuel TRUE
	
	getWordPos $user_command_line $pos "cim"
	if ($pos > 0)
		setVar $skipcim TRUE
	else
		setVar $skipcim FALSE
	end
	getWordPos $user_command_line $pos "hold"
	if ($pos > 0)
		setVar $planetNegotiate FALSE
	else
		setVar $planetNegotiate TRUE
	end

	getWordPos $user_command_line $pos "upgradefuel"
	if ($pos > 0)
		setVar $upgrade_fuel TRUE
	else
		setVar $upgrade_fuel FALSE
	end

	setVar $minimumFuel $parm1
	isNumber $number $minimumFuel
	if ($number <> 1)
		send "'{" $bot_name "} - Minimum Port Product entered is not a number!*"
		halt
	end
	if ($minimumFuel <= 0)
		send "'{" $bot_name "} - Minimum Port Product must be greater than 0.*"
		halt
	end



:merchant
	killalltriggers
	setArray $checkedPorts SECTORS
	setArray $que SECTORS
	setArray $checked SECTORS
	send "q"
	waitOn "Planet command (?"
	gosub :getPlanetInfo
	send "c"
	if ($citadel < 4)
		send "'{" $bot_name "} - You must run Travelling Salesman from at least a level 4 planet.*"
     		halt
	end
	gosub :quikstats
	setVar $sectorCount 10
	setVar $totalHolds 0 
	setVar $spentCredits 0 
	setVar $startingSector $CURRENT_SECTOR
	setVar $sellingOrg TRUE
	setVar $sellingEquip TRUE
	if ($skipcim = FALSE)
		send "'{" $bot_name "} - Travelling Salesman Downloading Current Port CIM Data - Comms Off*"
		send "^rq"
		gosub :setConnectionTriggers
		waitFor ": ENDINTERROG"
		send "'{" $bot_name "} - Travelling Salesman CIM Port Data Complete - Comms Back On*"
	end
	while (TRUE)
		:inac
		if (($unlimitedGame = FALSE) AND ($TURNS <= $bot_turn_limit))
			send "'{" $bot_name "} - Turns too low to continue.*"
			goto :doneMerchant
		end
		setVar $bottom 1
		setVar $top 1
		setArray $checked SECTORS
		setVar $que[1] $CURRENT_SECTOR
		setVar $checked[$CURRENT_SECTOR] 1
		:tryAgain2
		while ($bottom <= $top)
			# Now, pull out the next sector in the que, and make it our focus
			setVar $focus $que[$bottom]
			getSectorParameter $focus "BUSTED" $isBusted
			# If this sector is our xxB, we're done!
			if (($checkedPorts[$focus] <> TRUE) AND (PORT.EXISTS[$focus]) AND (PORT.CLASS[$focus] > 0) AND (((PORT.FUEL[$focus] >= $minimumFuel) AND (PORT.BUYFUEL[$focus] = FALSE)) OR (PORT.ORG[$focus] >= $minimumFuel) OR (PORT.EQUIP[$focus] >= $minimumFuel)) AND ($isBusted <> TRUE))
				# fig found 0 hops
				setVar $NearFig $focus
				setVar $checkedPorts[$NearFig] TRUE
				goto :continueOn2
			else
				setVar $nearfig 0
			end
			# That wasn't it, so let's add all the adjacents to the que for future testing.
			setVar $a 1
			while (SECTOR.WARPS[$focus][$a] > 0)
				setVar $adjacent SECTOR.WARPS[$focus][$a]
				# But only add them if they haven't been added previously
				if ($checked[$adjacent] = 0)
					# Okay, this one hasn't been checked, so tag it and que it.
					setVar $checked[$adjacent] 1
					add $top 1
					setVar $que[$top] $adjacent
				end
				add $a 1
			end
			# The adjacents of $focus were all queued, now on to the next one.
			add $bottom 1
		end	
		send "'{" $bot_name "} Can't find a route to any other ports.*"
     		goto :doneMerchant
		:continueOn2
			if ($NearFig > 0)
				killAllTriggers
				gosub :setConnectionTriggers
				send "p"&$NearFig&"*y"
				setTextLineTrigger warped :emptyPort2 "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
				setTextLineTrigger same :emptyPort2 "You are already in that sector!"
				setTextLineTrigger didnotwarp :noFigAtLocation "Your own fighters must be in the destination to make a safe jump."
				setTextLineTrigger notEnoughFuel :doneNoFuel2 "You do not have enough Fuel Ore on this planet to make the jump."
				pause			
				:emptyPort2
					setSectorParameter $NearFig "FIGSEC" TRUE



				if (($upgrade_fuel) AND (PORT.BUYFUEL[$NearFig] = FALSE))
					killAllTriggers
					gosub :quikstats
					send "q"
					waitOn "Planet command (?"
					gosub :getPlanetInfo
					send "c"
					setVar $total_creds_needed (300*7000)
					if ($total_creds_needed > $CREDITS)
						setVar $cashonhand $citadel_credits
						add $cashonhand $CREDITS
						if ($cashonhand > $total_creds_needed)
						        send "T T " & $CREDITS & "* "
				        		send "T F " & $total_creds_needed & "* "
				        		setVar $CREDITS $total_creds_needed
		    				end
					end
					send "q q *O 1"
					waitOn ", 0 to quit)"
					getWord CURRENTLINE $upgradeAmount 9
					stripText $upgradeAmount "("
					send $upgradeAmount&"* * *CR*Q"
					waitOn "What sector is the port in? ["&$CURRENT_SECTOR&"]"
					setTextLineTrigger getFuel2 :fuelDuring "Fuel Ore"
					pause
					:fuelDuring
						killalltriggers
						getWord CURRENTLINE $totalPortFuel 4
						SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
						SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
						waitOn "<Computer deactivated>"
					gosub :quikstats
					gosub :landOnPlanetEnterCitadel
				end

				if ($planetNegotiate = TRUE)
					killAllTriggers
					setVar $_ck_pnego_fueltosell "-1"
					if ($planetorg >= 500)
						setVar $_ck_pnego_orgtosell "max"
					else
						setVar $_ck_pnego_orgtosell "-1"
					end
					if ($planetequip >= 500)
						setVar  $_ck_pnego_equiptosell "max"
					else
						setVar  $_ck_pnego_equiptosell "-1"
					end
					gosub :planetNeg
				else	
					killAllTriggers
					gosub :quikstats
					send "q"
					waitOn "Planet command (?"
					gosub :getPlanetInfo
					send "c"
	
					send "q q *cr*q"
					waitOn "Fuel Ore"
					getWord CURRENTLINE $totalPortFuel 4
					waitOn "Organics"
					getWord CURRENTLINE $totalPortOrganics 3
					waitOn "Equipment"
						getWord CURRENTLINE $totalPortEquipment 3		
					
					waitOn "<Computer deactivated>"
					if ((PORT.BUYORG[$NearFig] = TRUE) AND ($sellingOrg))
						if ($planetOrg < $totalPortOrganics)
							setVar $turnsSellingProduct (($planetOrg/$TOTAL_HOLDS)-1)
						else
							setVar $turnsSellingProduct (($totalPortOrganics/$TOTAL_HOLDS))
						end
						if (($unlimitedGame = FALSE) AND (($TURNS - $turnsSellingProduct) <= $bot_turn_limit))
							send "'{" $bot_name "} - Turns too low to continue.*"
							send "l "&$planet&"* c "
							goto :doneMerchant
						end
						send "l "&$planet&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
							
						while ($turnsSellingProduct > 0)
							send "l " $planet "*  t  *  * 2*  q P * *"
							gosub :startHaggle
							send "0 * 0 *  /"
							if ($ni <> TRUE)
								subtract $turnsSellingProduct 1
								add $totalOrganicHolds $TOTAL_HOLDS
							end
							waitOn "³Turns"
						end
					end
					if ((PORT.BUYEQUIP[$NearFig] = TRUE) AND ($sellingEquip))
						if ($planetEquip < $totalPortEquipment)
							setVar $turnsSellingProduct (($planetEquip/$TOTAL_HOLDS)-1)
						else
							setVar $turnsSellingProduct (($totalPortEquipment/$TOTAL_HOLDS))
						end
						send "l "&$planet&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
						while ($turnsSellingProduct > 0)
							
							while ($turnsSellingProduct > 0)
								send "l " $planet "*  t  *  * 3*  q P * *"
								gosub :startHaggle
								send "0 * 0 *  /"
								if ($ni <> TRUE)
									subtract $turnsSellingProduct 1
									add $totalEquipmentHolds $TOTAL_HOLDS
								end
								waitOn "³Turns"
							end
						end
					end
					if ($planetNegotiate <> TRUE)
						gosub :landOnPlanetEnterCitadel
					end
					gosub :quikstats
				end
					if (PORT.BUYEQUIP[$NearFig] = FALSE)
						setVar $buyobject "e"
						setVar $buytype "b"
						gosub :buy
						gosub :quikstats
					end
					if (PORT.BUYORG[$NearFig] = FALSE)
						setVar $buyobject "o"
						setVar $buytype "b"
						gosub :buy
						gosub :quikstats
					end
					if (PORT.BUYFUEL[$NearFig] = FALSE)
						setVar $buyobject "f"
						setVar $buytype "s"
						gosub :buy
						gosub :quikstats
					end
										
				send "#"
				gosub :setConnectionTriggers
				waitOn "                            Who's Playing"
				send "cr*q"
				gosub :quikstats
			end	
		end
		:doneMerchant
			send "p"&$startingSector&"*y"
			send "'{" $bot_name "} - Travelling Salesman completed.*"
			halt


# ============================== QUICKSTATS ==============================
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
# ============================== END QUICKSTATS SUB==============================

# ============================== END QUICKSTATS SUB==============================
# ==============================  START PLANET INFO SUBROUTINE  =================
:getPlanetInfo
    killalltriggers
    send "*"
    gosub :setConnectionTriggers
    setTextLineTrigger planetInfo :planetInfo "Planet #"
    pause

    :planetinfo
        killalltriggers
        setVar $citadel 0
        setVar $sCannon 0
        setVar $aCannon 0
        setVar $citadel_credits 0
        getWord CURRENTLINE $planet 2
        stripText $planet "#"
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
            getWord CURRENTLINE $planet_fuel 6
            getWord CURRENTLINE $planet_fuel_max 8
            stripText $planetfuel ","
            stripText $planetfuelmax ","
            stripText $planet_fuel ","
            stripText $planet_fuel_max ","
            goto :getPlanetStuff

        :orgstart
            killalltriggers
            getWord CURRENTLINE $planetorg 5
            getWord CURRENTLINE $planetorgmax 7
            getWord CURRENTLINE $planet_organics 5
            getWord CURRENTLINE $planet_organics_max 7
            stripText $planetorg ","
            stripText $planetorgmax ","
            stripText $planet_organics_max ","
            stripText $planet_organics ","
            goto :getPlanetStuff

        :equipstart
            killalltriggers
            getWord CURRENTLINE $planetequip 5
            getWord CURRENTLINE $planetequipmax 7
            getWord CURRENTLINE $planet_equipment 5
            getWord CURRENTLINE $planet_equipment_max 7
            stripText $planetequip ","
            stripText $planetequipmax ","
            stripText $planet_equipment ","
            stripText $planet_equipment_max ","
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
            getWord CURRENTLINE $citadel_credits 9
            striptext $citadel_credits ","
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

:checkAvoidedSectors
	setVar $avoidedSectors ""	
	:readAvoidedList
		setTextLineTrigger getLine1 :getAvoids
		gosub :setConnectionTriggers
		send "cxq"
		pause
	:keepCountingAvoids
		killAllTriggers
		gosub :setConnectionTriggers
		setTextLineTrigger getLine :getAvoids
		pause
	:getAvoids
		killAllTriggers
		setVar $workingText CURRENTLINE
		getWordPos $workingText $pos "<Computer deactivated>"
		if ($pos > 0)
			goto :doneAvoids
		end
		getWordPos $workingText $pos "Computer"
		if ($pos > 0)
			goto :keepCountingAvoids
		end
		if (CURRENTLINE = "")
			goto :KeepCountingAvoids
		end
		getWordPos $workingText $pos "<List Avoided Sectors>"
		if ($pos > 0)
			goto :keepCountingAvoids
		end
		getWordPos $workingText $pos "No Sectors are currently being avoided."
		if ($pos > 0)
			goto :doneAvoids
		end
		getWordPos $workingText $pos "Citadel"
		if ($pos > 0)
			goto :keepCountingAvoids
		end
		setVar $workingText $workingText&" +++"
		getWord $workingText $avoid 1
		getWordPos $workingText $pos $avoid
		
		while ($avoid <> "+++")
			setVar $avoidedSectors $avoidedSectors&" "&$avoid&" "
			getLength $avoid $length 
			getLength $workingText $checkLength
			cutText $workingText $workingText ($pos+$length) 9999	
			getWord $workingText $avoid 1
			getWordPos $workingText $pos $avoid
			
		end
		goto :keepCountingAvoids
		
	:doneAvoids
return

# ============================== START PLANET NEGOTIATION =======================
:planetNeg
# CREDITS
# -------
# Written by Cherokee



# ----- INIT VARS -----
setVar $output_file  GAMENAME & ".nego"
setVar $selldelay 0
setVar $oreMCIC "-90"
setVar $orgMCIC "-75"
setVar $equMCIC "-65"
setVar $version "3.0.0"
	
:verifyprompt
    if (($startingLocation <> "Citadel") and ($startingLocation <> "Planet "))
        setVar $exit_message "Must start at Citadel or Planet Prompt for Planet Nego"
        goto :exitneg
    end


# ----- PTRADE SETTING-----
setVar $_ck_ptradesetting $ptradesetting

if ($startingLocation = "Citadel")
    send "Q"
elseif ($startingLocation = "Planet ")
    setVar $startingLocation "Planet"
end
gosub :getPlanetInfo
send "Q"
gosub :getInfo
send "*"


send "|CR" & $current_sector & "*Q|"

setTextLineTrigger foundport :foundport "Items     Status  Trading % of max OnBoard"
setTextLineTrigger noport :noport "I have no information about a port in that sector."
setTextLineTrigger noport2 :noport "You have never visted sector"
setTextLineTrigger noport3 :noport "credits / next hold"
pause

:noport
    killalltriggers
    gosub :negotiateLand
    setVar $exit_message "No port to sell to"
    goto :exitneg

:foundport
    killalltriggers
    gosub :setConnectionTriggers
    setTextLineTrigger portinfo1 :portinfo1 "Fuel Ore "
    setTextLineTrigger portinfo2 :portinfo2 "Organics"
    setTextLineTrigger portinfo3 :portinfo3 "Equipment"
    setTextLineTrigger gotCR :gotCR "Computer command [TL="
    pause

    :portinfo1
        killalltriggers
        getWord CURRENTLINE $current_sector.orebuying 3
        getWord CURRENTLINE $current_sector.oretrading 4
        getWord CURRENTLINE $current_sector.orepercent 5
        striptext $current_sector.orepercent "%"
        goto :foundport
    :portinfo2
        killalltriggers
        getWord CURRENTLINE $current_sector.orgbuying 2
        getWord CURRENTLINE $current_sector.orgtrading 3
        getWord CURRENTLINE $current_sector.orgpercent 4
        striptext $current_sector.orgpercent "%"
        goto :foundport
    :portinfo3
        killalltriggers
        getWord CURRENTLINE $current_sector.equbuying 2
        getWord CURRENTLINE $current_sector.equtrading 3
        getWord CURRENTLINE $current_sector.equpercent 4
        striptext $current_sector.equpercent "%"
        goto :foundport
    :gotCR


setDelayTrigger justasec :justasec 500
gosub :setConnectionTriggers
pause
:justasec


:initinfo
    if ($turns <= 0)
        gosub :negotiateLand
        setVar $exit_message "I have no turns to negotiate this planet"
        goto :exitneg
    end
    if ($credits > 900000000)
        gosub :negotiateLand
        setVar $exit_message "I have too much cash on hand"
        goto :exitneg
    end

    setVar $fueltosell $planetfuel
    if ($fueltosell > $planetfuel)
        setVar $fueltosell $planetfuel
    end

    if ($_ck_pnego_fueltosell = "-1")
	 setVar $fueltosell 0
    end
					
    setVar $orgtosell $planetorg
    if ($orgtosell > $planetorg)
        setVar $orgtosell $planetorg
    end

    if ($_ck_pnego_orgtosell = "-1")
	 setVar $orgtosell 0
    end

    setVar $equiptosell $planetequip
    if ($equiptosell > $planetequip)
        setVar $equiptosell $planetequip
    end

    if ($_ck_pnego_equiptosell = "-1")
	 setVar $equiptosell 0
    end

            killalltriggers
            # determine if the sale can proceed, based on units desired to sell and what port is buying
            if (($current_sector.orebuying <> "Buying") or ($current_sector.orepercent < 15))
                setVar $fueltosell 0
            end
            if (($current_sector.orgbuying <> "Buying") or ($current_sector.orgpercent < 15))
                setVar $orgtosell 0
            end
            if (($current_sector.equbuying <> "Buying") or ($current_sector.equpercent < 15))
                setVar $equiptosell 0
            end


:selloff
    if (($fueltosell <> 0) or ($orgtosell <> 0) or ($equiptosell <> 0))
        setVar $ore_sell_failures 0
        setVar $org_sell_failures 0
        setVar $equ_sell_failures 0
        setVar $oreselloutput ""
        setVar $orgselloutput ""
        setVar $equselloutput ""
        setVar $oreprofit 0
        setVar $orgprofit 0
        setVar $equprofit 0
        # turning comms off
        send "|"
        gosub :sell
        gosub :negotiateLand
        if ($startingLocation = "Citadel")
            # deposit profits in treasury
            if ($oreprofit <> 0)
                send "TT" & $oreprofit & "*"
                subtract $credits $oreprofit
            end
            if ($orgprofit <> 0)
                send "TT" & $orgprofit & "*"
                subtract $credits $orgprofit
            end
            if ($equprofit <> 0)
                send "TT" & $equprofit & "*"
                subtract $credits $equprofit
            end
        end

        # turning comms back on
        send "|"


        # send script output

        setVar $generalOutput "*Sector " & $CURRENT_SECTOR  & "*"
        write $output_file $generalOutput

        if ($oreselloutput <> "")
            send $oreselloutput
            write $output_file $oreselloutput
        end
        if ($orgselloutput <> "")
            send $orgselloutput
            write $output_file $orgselloutput
        end
        if ($equselloutput <> "")
            send $equselloutput
            write $output_file $equselloutput
        end
        setVar $exit_message "Done with port"
        goto :exitneg
    else
        gosub :negotiateLand
        setVar $exit_message "Nothing to sell"
        goto :exitneg
    end





:sell
    :resell
        if ($turns <= 0)
            send "'I'm out of turns*"
            return
        end
        setVar $thisorefailed 0
        setVar $thisorgfailed 0
        setVar $thisequfailed 0
        send "PN" & $planet & "*"
        subtract $turns 1
            :getpercts
		gosub :setConnectionTriggers
                setTextLineTrigger orepct :orepct "Fuel Ore   Buying"
                setTextLineTrigger orgpct :orgpct "Organics   Buying"
                setTextLineTrigger equpct :equpct "Equipment  Buying"
                setTextLineTrigger gotpercts :gotpercts "Registry# and Planet Name"
                pause

                :orepct
                    killalltriggers
                    getWord CURRENTLINE $current_sector.oretrading 4
                    getWord CURRENTLINE $current_sector.orepercent 5
                    striptext $current_sector.orepercent "%"
                    if ($current_sector.orepercent < 100)
                        add $current_sector.orepercent 1
                    end
                    goto :getpercts

                :orgpct
                    killalltriggers
                    getWord CURRENTLINE $current_sector.orgtrading 3
                    getWord CURRENTLINE $current_sector.orgpercent 4
                    striptext $current_sector.orgpercent "%"
                    if ($current_sector.orgpercent < 100)
                        add $current_sector.orgpercent 1
                    end
                    goto :getpercts

                :equpct
                    killalltriggers
                    getWord CURRENTLINE $current_sector.equtrading 3
                    getWord CURRENTLINE $current_sector.equpercent 4
                    striptext $current_sector.equpercent "%"
                    if ($current_sector.equpercent < 100)
                        add $current_sector.equpercent 1
                    end
                    goto :getpercts

                :gotpercts

            :sellproduct
		gosub :setConnectionTriggers
                setTextTrigger sellfuel :sellfuel "How many units of Fuel Ore"
                setTextTrigger sellorg :sellorg "How many units of Organics"
                setTextTrigger sellequ :sellequ "How many units of Equipment"
                setTextTrigger donewithport :donewithport "Command [TL="
                pause

            :sellfuel
                killalltriggers
                if (($current_sector.orepercent >= 15) and ($fueltosell > 0))
                    if ($fueltosell > $current_sector.oretrading)
                        setVar $fueltosell $current_sector.oretrading
                    end
                    setVar $prodtosell "ore"
                    setVar $portbuying $fueltosell
                    gosub :sellhaggle
                    if ($currenthaggle = "succeeded")
                        setVar $orehaggle "succeeded"
                        setVar $fueltosell 0
                        subtract $oreMCIC 1
                    else
                        setVar $orehaggle "failed"
                    end
                else
                    send "0*"
                end
                goto :sellproduct

            :sellorg
                killalltriggers
                if (($current_sector.orgpercent >= 15) and ($orgtosell > 0))
                    if ($orgtosell > $current_sector.orgtrading)
                        setVar $orgtosell $current_sector.orgtrading
                    end
                    setVar $prodtosell "org"
                    setVar $portbuying $orgtosell
                    gosub :sellhaggle
                    if ($currenthaggle = "succeeded")
                        setVar $orghaggle "succeeded"
                        setVar $orgtosell 0
                        subtract $orgMCIC 1
                    else
                        setVar $orghaggle "failed"
                    end
                else
                    send "0*"
                end
                goto :sellproduct

            :sellequ
                killalltriggers
                if (($current_sector.equpercent >= 15) and ($equiptosell > 0))
                    if ($equiptosell > $current_sector.equtrading)
                        setVar $equiptosell $current_sector.equtrading
                    end
                    setVar $prodtosell "equ"
                    setVar $portbuying $equiptosell
                    gosub :sellhaggle
                    if ($currenthaggle = "succeeded")
                        setVar $equhaggle "succeeded"
                        setVar $equiptosell 0
                        subtract $equMCIC 1
                    else
                        setVar $equhaggle "failed"
                    end
                else
                    send "0*"
                end
                goto :sellproduct

            :donewithport
                killalltriggers
                if (($ore_sell_failures > 4) or ($org_sell_failures > 4) or ($equ_sell_failures > 4))
                    setVar $selloutput $selloutput & "Multiple Haggle Failures - Please cut and paste this haggling session and email to Cherokee*"
                    return
                elseif (($fueltosell = 0) and ($orgtosell = 0) and ($equiptosell = 0))
                    return
                else
                    goto :resell
                end




:sellhaggle
    gosub :setConnectionTriggers
    setTextLineTrigger sellfirstoffer :sellfirstoffer "We'll buy them for"
    send $portbuying & "*"
    pause

    :sellfirstoffer
        killalltriggers
        getWord CURRENTLINE $offer 5
        striptext $offer ","

        gosub :swathoff
        if ($swathoff = FALSE)
            gosub :negotiateLand
            setVar $exit_message $swathOffMessage
            goto :exitneg
        end


        # ----- CALCULATE the port's "quality" -----
        setVar $perunitinitoffer $offer

        #NEW CODE ADDED TO SUPPORT NON-100% PTRADES
        multiply $perunitinitoffer 100
        divide $perunitinitoffer $_ck_ptradesetting

        # multiply by 100 to increase accuracy of results, we'll need to divide by 100 later
        multiply $perunitinitoffer 100

        # divide by the number of units you are selling
        divide $perunitinitoffer $portbuying

        #initialize portmaxinit
        setVar $portmaxinit $perunitinitoffer

        # return to 10 scale
        divide $perunitinitoffer 10

        if ($prodtosell = "ore")
            # port max init  =(($perunitinitoffer-25.60558)/($percent-11.7248))*(88.2752)+25.60558
            setVar $basevalue 256055800
            setVar $basepercent 11725
            setVar $basepercentinverse 88275
            setVar $percentfrombase $current_sector.orepercent
        elseif ($prodtosell = "org")
            # port max init  =(($perunitinitoffer-50.62764)/($percent-11.28715))*(88.71285)+50.62764
            setVar $basevalue 506276400
            setVar $basepercent 11287
            setVar $basepercentinverse 88713
            setVar $percentfrombase $current_sector.orgpercent
        elseif ($prodtosell = "equ")
            # port max init  =(($perunitinitoffer-90.6281)/($percent-10.98921))*(89.01079)+90.6281
            setVar $basevalue 906281000
            setVar $basepercent 10989
            setVar $basepercentinverse 89010
            setVar $percentfrombase $current_sector.equpercent
        end

        if ($percentfrombase = 100)
            echo "* 100% port*"
            # return to 10 scale
            divide $portmaxinit 10

        elseif ($percentfrombase >= 15)
            # multiply by 100,000 for precision
            multiply $portmaxinit 100000

            # subtract basevalue (in 10,000,000 scale)
            subtract $portmaxinit $basevalue

            # multiply by 1000 for precision
            multiply $percentfrombase 1000

            # subtract equ base percent (1,000 scale)
            subtract $percentfrombase $basepercent

            # calculate PMI/PFB
            divide $portmaxinit $percentfrombase

            # multiply by inverse of equ base percent (1,000 scale)
            multiply $portmaxinit $basepercentinverse

            # add the basevalue (in 10,000,000 scale)
            add $portmaxinit $basevalue

            # return to 10 scale
            divide $portmaxinit 1000000

        elseif ($prodtosell = "ore")
            setVar $portmaxinit 340

        elseif ($prodtosell = "org")
            setVar $portmaxinit 635

        elseif ($prodtosell = "equ")
            setVar $portmaxinit 1063
        end



        # ----- LOOKUP the counteroffer percentage to use at this "quality" port -----

        if ($prodtosell = "ore")
            if ($portmaxinit >= 436)
                setVar $MCIC "-90"
                setVar $multiple "1494"

            elseif ($portmaxinit >= 434)
                setVar $MCIC "-89"
                setVar $multiple "1488"

            elseif ($portmaxinit >= 433)
                setVar $MCIC "-88"
                setVar $multiple "1482"

            elseif ($portmaxinit >= 431)
                setVar $MCIC "-87"
                setVar $multiple "1476"

            elseif ($portmaxinit >= 429)
                setVar $MCIC "-86"
                setVar $multiple "1470"

            elseif ($portmaxinit >= 427)
                setVar $MCIC "-85"
                setVar $multiple "1464"

            elseif ($portmaxinit >= 425)
                setVar $MCIC "-84"
                setVar $multiple "1458"

            elseif ($portmaxinit >= 424)
                setVar $MCIC "-83"
                setVar $multiple "1452"

            elseif ($portmaxinit >= 422)
                setVar $MCIC "-82"
                setVar $multiple "1446"

            elseif ($portmaxinit >= 420)
                setVar $MCIC "-81"
                setVar $multiple "1440"

            elseif ($portmaxinit >= 418)
                setVar $MCIC "-80"
                setVar $multiple "1434"

            elseif ($portmaxinit >= 416)
                setVar $MCIC "-79"
                setVar $multiple "1429"

            elseif ($portmaxinit >= 414)
                setVar $MCIC "-78"
                setVar $multiple "1423"

            elseif ($portmaxinit >= 412)
                setVar $MCIC "-77"
                setVar $multiple "1417"

            elseif ($portmaxinit >= 411)
                setVar $MCIC "-76"
                setVar $multiple "1411"

            elseif ($portmaxinit >= 409)
                setVar $MCIC "-75"
                setVar $multiple "1405"

            elseif ($portmaxinit >= 407)
                setVar $MCIC "-74"
                setVar $multiple "1399"

            elseif ($portmaxinit >= 405)
                setVar $MCIC "-73"
                setVar $multiple "1393"

            elseif ($portmaxinit >= 403)
                setVar $MCIC "-72"
                setVar $multiple "1387"

            elseif ($portmaxinit >= 401)
                setVar $MCIC "-71"
                setVar $multiple "1381"

            elseif ($portmaxinit >= 399)
                setVar $MCIC "-70"
                setVar $multiple "1375"

            elseif ($portmaxinit >= 397)
                setVar $MCIC "-69"
                setVar $multiple "1369"

            elseif ($portmaxinit >= 396)
                setVar $MCIC "-68"
                setVar $multiple "1363"

            elseif ($portmaxinit >= 394)
                setVar $MCIC "-67"
                setVar $multiple "1357"

            elseif ($portmaxinit >= 392)
                setVar $MCIC "-66"
                setVar $multiple "1351"

            elseif ($portmaxinit >= 390)
                setVar $MCIC "-65"
                setVar $multiple "1345"

            elseif ($portmaxinit >= 388)
                setVar $MCIC "-64"
                setVar $multiple "1342"

            elseif ($portmaxinit >= 386)
                setVar $MCIC "-63"
                setVar $multiple "1336"

            elseif ($portmaxinit >= 384)
                setVar $MCIC "-62"
                setVar $multiple "1330"

            elseif ($portmaxinit >= 382)
                setVar $MCIC "-61"
                setVar $multiple "1324"

            elseif ($portmaxinit >= 380)
                setVar $MCIC "-60"
                setVar $multiple "1318"

            elseif ($portmaxinit >= 378)
                setVar $MCIC "-59"
                setVar $multiple "1312"

            elseif ($portmaxinit >= 376)
                setVar $MCIC "-58"
                setVar $multiple "1306"

            elseif ($portmaxinit >= 374)
                setVar $MCIC "-57"
                setVar $multiple "1300"

            elseif ($portmaxinit >= 372)
                setVar $MCIC "-56"
                setVar $multiple "1294"

            elseif ($portmaxinit >= 370)
                setVar $MCIC "-55"
                setVar $multiple "1291"

            elseif ($portmaxinit >= 368)
                setVar $MCIC "-54"
                setVar $multiple "1285"

            elseif ($portmaxinit >= 366)
                setVar $MCIC "-53"
                setVar $multiple "1279"

            elseif ($portmaxinit >= 364)
                setVar $MCIC "-52"
                setVar $multiple "1273"

            elseif ($portmaxinit >= 362)
                setVar $MCIC "-51"
                setVar $multiple "1267"

            elseif ($portmaxinit >= 360)
                setVar $MCIC "-50"
                setVar $multiple "1261"

            elseif ($portmaxinit >= 358)
                setVar $MCIC "-49"
                setVar $multiple "1255"

            elseif ($portmaxinit >= 356)
                setVar $MCIC "-48"
                setVar $multiple "1249"

            elseif ($portmaxinit >= 354)
                setVar $MCIC "-46"
                setVar $multiple "1246"

            elseif ($portmaxinit >= 352)
                setVar $MCIC "-46"
                setVar $multiple "1240"

            elseif ($portmaxinit >= 350)
                setVar $MCIC "-45"
                setVar $multiple "1234"

            elseif ($portmaxinit >= 348)
                setVar $MCIC "-44"
                setVar $multiple "1228"

            elseif ($portmaxinit >= 346)
                setVar $MCIC "-43"
                setVar $multiple "1222"

            elseif ($portmaxinit >= 344)
                setVar $MCIC "-42"
                setVar $multiple "1219"

            elseif ($portmaxinit >= 342)
                setVar $MCIC "-41"
                setVar $multiple "1209"

            elseif ($portmaxinit >= 340)
                setVar $MCIC "-40"
                setVar $multiple "1208"

            else
                setVar $MCIC 0
                setVar $multiple "1208"
            end


        elseif ($prodtosell = "org")
            if ($portmaxinit >= 813)
                setVar $MCIC "-75"
                setVar $multiple "1405"

            elseif ($portmaxinit >= 810)
                setVar $MCIC "-74"
                setVar $multiple 1399

            elseif ($portmaxinit >= 806)
                setVar $MCIC "-73"
                setVar $multiple 1393

            elseif ($portmaxinit >= 802)
                setVar $MCIC "-72"
                setVar $multiple 1387

            elseif ($portmaxinit >= 798)
                setVar $MCIC "-71"
                setVar $multiple 1381

            elseif ($portmaxinit >= 795)
                setVar $MCIC "-70"
                setVar $multiple 1375

            elseif ($portmaxinit >= 791)
                setVar $MCIC "-69"
                setVar $multiple 1369

            elseif ($portmaxinit >= 787)
                setVar $MCIC "-68"
                setVar $multiple 1363

            elseif ($portmaxinit >= 783)
                setVar $MCIC "-67"
                setVar $multiple 1357

            elseif ($portmaxinit >= 779)
                setVar $MCIC "-66"
                setVar $multiple 1351

            elseif ($portmaxinit >= 775)
                setVar $MCIC "-65"
                setVar $multiple 1345

            elseif ($portmaxinit >= 772)
                setVar $MCIC "-64"
                setVar $multiple 1339

            elseif ($portmaxinit >= 768)
                setVar $MCIC "-63"
                setVar $multiple 1336

            elseif ($portmaxinit >= 764)
                setVar $MCIC "-62"
                setVar $multiple 1330

            elseif ($portmaxinit >= 760)
                setVar $MCIC "-61"
                setVar $multiple 1324

            elseif ($portmaxinit >= 756)
                setVar $MCIC "-60"
                setVar $multiple 1318

            elseif ($portmaxinit >= 752)
                setVar $MCIC "-59"
                setVar $multiple 1312

            elseif ($portmaxinit >= 748)
                setVar $MCIC "-58"
                setVar $multiple 1306

            elseif ($portmaxinit >= 744)
                setVar $MCIC "-57"
                setVar $multiple 1300

            elseif ($portmaxinit >= 740)
                setVar $MCIC "-56"
                setVar $multiple 1294

            elseif ($portmaxinit >= 737)
                setVar $MCIC "-55"
                setVar $multiple 1291

            elseif ($portmaxinit >= 733)
                setVar $MCIC "-54"
                setVar $multiple 1285

            elseif ($portmaxinit >= 729)
                setVar $MCIC "-53"
                setVar $multiple 1279

            elseif ($portmaxinit >= 725)
                setVar $MCIC "-52"
                setVar $multiple 1273

            elseif ($portmaxinit >= 721)
                setVar $MCIC "-51"
                setVar $multiple 1267

            elseif ($portmaxinit >= 717)
                setVar $MCIC "-50"
                setVar $multiple 1261

            elseif ($portmaxinit >= 713)
                setVar $MCIC "-49"
                setVar $multiple 1255

            elseif ($portmaxinit >= 709)
                setVar $MCIC "-48"
                setVar $multiple 1252

            elseif ($portmaxinit >= 705)
                setVar $MCIC "-47"
                setVar $multiple 1246

            elseif ($portmaxinit >= 701)
                setVar $MCIC "-46"
                setVar $multiple 1236

            elseif ($portmaxinit >= 697)
                setVar $MCIC "-45"
                setVar $multiple 1233

            elseif ($portmaxinit >= 693)
                setVar $MCIC "-44"
                setVar $multiple 1227

            elseif ($portmaxinit >= 688)
                setVar $MCIC "-43"
                setVar $multiple 1224

            elseif ($portmaxinit >= 684)
                setVar $MCIC "-42"
                setVar $multiple 1214

            elseif ($portmaxinit >= 680)
                setVar $MCIC "-41"
                setVar $multiple 1213

            elseif ($portmaxinit >= 676)
                setVar $MCIC "-40"
                setVar $multiple 1203

            elseif ($portmaxinit >= 672)
                setVar $MCIC "-39"
                setVar $multiple 1200

            elseif ($portmaxinit >= 668)
                setVar $MCIC "-38"
                setVar $multiple 1194

            elseif ($portmaxinit >= 664)
                setVar $MCIC "-37"
                setVar $multiple 1191

            elseif ($portmaxinit >= 660)
                setVar $MCIC "-36"
                setVar $multiple 1181

            elseif ($portmaxinit >= 656)
                setVar $MCIC "-35"
                setVar $multiple 1178

            elseif ($portmaxinit >= 651)
                setVar $MCIC "-34"
                setVar $multiple 1172

            elseif ($portmaxinit >= 647)
                setVar $MCIC "-33"
                setVar $multiple 1166

            elseif ($portmaxinit >= 643)
                setVar $MCIC "-32"
                setVar $multiple 1160

            elseif ($portmaxinit >= 639)
                setVar $MCIC "-31"
                setVar $multiple 1157

            elseif ($portmaxinit >= 635)
                setVar $MCIC "-30"
                setVar $multiple 1154

            else
                setVar $MCIC 0
                setVar $multiple "1154"
            end

        elseif ($prodtosell = "equ")
            if ($portmaxinit >= 1393)
                setVar $MCIC "-65"
                setVar $multiple 1347

            elseif ($portmaxinit >= 1386)
                setVar $MCIC "-64"
                setVar $multiple 1341

            elseif ($portmaxinit >= 1379)
                setVar $MCIC "-63"
                setVar $multiple 1336

            elseif ($portmaxinit >= 1372)
                setVar $MCIC "-62"
                setVar $multiple 1330

            elseif ($portmaxinit >= 1365)
                setVar $MCIC "-61"
                setVar $multiple 1324

            elseif ($portmaxinit >= 1358)
                setVar $MCIC "-60"
                setVar $multiple 1319

            elseif ($portmaxinit >= 1351)
                setVar $MCIC "-59"
                setVar $multiple 1313

            elseif ($portmaxinit >= 1344)
                setVar $MCIC "-58"
                setVar $multiple 1307

            elseif ($portmaxinit >= 1337)
                setVar $MCIC "-57"
                setVar $multiple 1302

            elseif ($portmaxinit >= 1329)
                setVar $MCIC "-56"
                setVar $multiple 1296

            elseif ($portmaxinit >= 1323)
                setVar $MCIC "-55"
                setVar $multiple 1291

            elseif ($portmaxinit >= 1315)
                setVar $MCIC "-54"
                setVar $multiple 1285

            elseif ($portmaxinit >= 1308)
                setVar $MCIC "-53"
                setVar $multiple 1279

            elseif ($portmaxinit >= 1301)
                setVar $MCIC "-52"
                setVar $multiple 1274

            elseif ($portmaxinit >= 1294)
                setVar $MCIC "-51"
                setVar $multiple 1268

            elseif ($portmaxinit >= 1287)
                setVar $MCIC "-50"
                setVar $multiple 1262

            elseif ($portmaxinit >= 1279)
                setVar $MCIC "-49"
                setVar $multiple 1254

            elseif ($portmaxinit >= 1272)
                setVar $MCIC "-48"
                setVar $multiple 1247

            elseif ($portmaxinit >= 1265)
                setVar $MCIC "-47"
                setVar $multiple 1246

            elseif ($portmaxinit >= 1258)
                setVar $MCIC "-46"
                setVar $multiple 1241

            elseif ($portmaxinit >= 1251)
                setVar $MCIC "-45"
                setVar $multiple 1235

            elseif ($portmaxinit >= 1243)
                setVar $MCIC "-44"
                setVar $multiple 1229

            elseif ($portmaxinit >= 1236)
                setVar $MCIC "-43"
                setVar $multiple 1224

            elseif ($portmaxinit >= 1229)
                setVar $MCIC "-42"
                setVar $multiple 1218

            elseif ($portmaxinit >= 1221)
                setVar $MCIC "-41"
                setVar $multiple 1213

            elseif ($portmaxinit >= 1214)
                setVar $MCIC "-40"
                setVar $multiple 1208

            elseif ($portmaxinit >= 1206)
                setVar $MCIC "-39"
                setVar $multiple 1201

            elseif ($portmaxinit >= 1199)
                setVar $MCIC "-38"
                setVar $multiple 1196

            elseif ($portmaxinit >= 1192)
                setVar $MCIC "-37"
                setVar $multiple 1190

            elseif ($portmaxinit >= 1184)
                setVar $MCIC "-36"
                setVar $multiple 1185

            elseif ($portmaxinit >= 1177)
                setVar $MCIC "-35"
                setVar $multiple 1180

            elseif ($portmaxinit >= 1169)
                setVar $MCIC "-34"
                setVar $multiple 1174

            elseif ($portmaxinit >= 1162)
                setVar $MCIC "-33"
                setVar $multiple 1169

            elseif ($portmaxinit >= 1154)
                setVar $MCIC "-32"
                setVar $multiple 1164

            elseif ($portmaxinit >= 1147)
                setVar $MCIC "-31"
                setVar $multiple 1158

            elseif ($portmaxinit >= 1139)
                setVar $MCIC "-30"
                setVar $multiple 1152

            elseif ($portmaxinit >= 1132)
                setVar $MCIC "-29"
                setVar $multiple 1149

            elseif ($portmaxinit >= 1124)
                setVar $MCIC "-28"
                setVar $multiple 1144

            elseif ($portmaxinit >= 1116)
                setVar $MCIC "-27"
                setVar $multiple 1136

            elseif ($portmaxinit >= 1109)
                setVar $MCIC "-26"
                setVar $multiple 1132

            elseif ($portmaxinit >= 1101)
                setVar $MCIC "-25"
                setVar $multiple 1126

            elseif ($portmaxinit >= 1093)
                setVar $MCIC "-24"
                setVar $multiple 1122

            elseif ($portmaxinit >= 1086)
                setVar $MCIC "-23"
                setVar $multiple 1117

            elseif ($portmaxinit >= 1078)
                setVar $MCIC "-22"
                setVar $multiple 1110

            elseif ($portmaxinit >= 1071)
                setVar $MCIC "-21"
                setVar $multiple 1105

            elseif ($portmaxinit >= 1063)
                setVar $MCIC "-20"
                setVar $multiple 1102

            else
                setVar $MCIC "0"
                setVar $multiple 1102

            end
        end

        # has to be done this way because of TWX numeric upper limit of 2.14 billion
        setVar $counter $offer
        divide $counter 10
        multiply $counter $multiple
        divide $counter 100
        send $counter & "*"
        setVar $midhaggles 0
    :sellofferloop
	gosub :setConnectionTriggers
        setTextLineTrigger sellprice :sellprice "We'll buy them for"
        setTextLineTrigger sellfinaloffer :sellfinaloffer "Our final offer"
        # setTextLineTrigger sellnotinterested :sellnotinterested "We're not interested."
        setTextLineTrigger sellexperience :sellexperience "experience point(s)"
        setTextLineTrigger sellyouhave :sellyouhave "You have"

        setTextLineTrigger sellscrewup1 :sellscrewup "Get real ion-brain, make me a real offer."
        setTextLineTrigger sellscrewup2 :sellscrewup "This is the big leagues Jr.  Make a real offer."
        setTextLineTrigger sellscrewup3 :sellscrewup "My patience grows short with you."
        setTextLineTrigger sellscrewup4 :sellscrewup "I have much better things to do than waste my time.  Try again."
        setTextLineTrigger sellscrewup5 :sellscrewup "HA! HA, ha hahahhah hehehe hhhohhohohohh!  You choke me up!"
        setTextLineTrigger sellscrewup6 :sellscrewup "Quit playing around, you're wasting my time!"
        setTextLineTrigger sellscrewup7 :sellscrewup "Make a real offer or get the h"
        setTextLineTrigger sellscrewup8 :sellscrewup "WHAT?!@!? you must be crazy!"
        setTextLineTrigger sellscrewup9 :sellscrewup "So, you think I'm as stupid as you look? Make a real offer."
        setTextLineTrigger sellscrewup10 :sellscrewup "What do you take me for, a fool?  Make a real offer!"
        pause
        pause
    :sellscrewup
        killalltriggers
        multiply $counter 98
        divide $counter 100
        send $counter & "*"
        goto :sellofferloop
    :sellprice
        killalltriggers
        add $midhaggles 1
        setVar $old_offer $offer
        setVar $old_counter $counter
        getWord CURRENTLINE $offer 5
        striptext $offer ","

            # new method
            setVar $offer_change $offer
            subtract $offer_change $old_offer
            if ($MCIC > "-35")
                multiply $offer_change 75
                divide $offer_change 100
                subtract $counter $offer_change
                subtract $counter 25
            elseif ($MCIC > "-55")
                multiply $offer_change 65
                divide $offer_change 100
                subtract $counter $offer_change
                subtract $counter 25
            else
                multiply $offer_change 60
                divide $offer_change 100
                subtract $counter $offer_change
                subtract $counter 10
            end
        send $counter & "*"
        goto :sellofferloop
    :sellfinaloffer
        killalltriggers
        # ore -  51,  54,  56   so...  25000, make sure we get 1 mid
        # org -  94,  99, 102   so...  15000, make sure we get 1 mid...  25,000, make sure we get 2 mids
        # equ - 160, 166, 170   so...  12000, make sure we get 1 mid...  20,000, make sure we get 2 mids
        if (($prodtosell = "ore") and ($MCIC <= "-75") and ($portbuying >= 25000) and ($midhaggles < 1) and ($ore_sell_failures < 2))
            setVar $forcefail 1
            setVar $thisorefailed 1
        elseif (($prodtosell = "org") and ($MCIC <= "-60") and ($portbuying >= 25000) and ($midhaggles < 2) and (($thisorefailed = 1) or ($org_sell_failures < 4)))
            setVar $forcefail 1
            setVar $thisorgfailed 1
        elseif (($prodtosell = "org") and ($MCIC <= "-60") and ($portbuying >= 15000) and ($midhaggles < 1) and (($thisorefailed = 1) or ($org_sell_failures < 2)))
            setVar $forcefail 1
            setVar $thisorgfailed 1
        elseif (($prodtosell = "equ") and ($MCIC <= "-55") and ($portbuying >= 20000) and ($midhaggles < 2) and (($thisorefailed = 1) or ($thisorgfailed = 1) or ($equ_sell_failures < 4)))
            setVar $forcefail 1
            setVar $thisequfailed 1
        elseif (($prodtosell = "equ") and ($MCIC <= "-55") and ($portbuying >= 12000) and ($midhaggles < 1) and (($thisorefailed = 1) or ($thisorgfailed = 1) or ($equ_sell_failures < 2)))
            setVar $forcefail 1
            setVar $thisequfailed 1
        else
            setVar $forcefail 0
        end

        if ($forcefail = 0)
            setVar $old_offer $offer
            setVar $old_counter $counter
            getWord CURRENTLINE $offer 5
            striptext $offer ","
            setVar $offer_change $offer
            subtract $offer_change $old_offer
            if ($prodtosell = "ore")
                multiply $offer_change 30
            elseif ($prodtosell = "org")
                multiply $offer_change 27
            elseif ($prodtosell = "equ")
                multiply $offer_change 25
            end
            divide $offer_change 10
            subtract $counter $offer_change
            subtract $counter 10
            send $counter & "*"
        else
            # fail the haggle on purpose
            send $counter & "*"
        end
        goto :sellofferloop
    :sellnotinterested
        killalltriggers
        goto :sellhagglefailed
    :sellexperience
        killalltriggers
        getWord CURRENTLINE $exp_bonus 7
        add $EXPERIENCE $exp_bonus
        goto :sellofferloop
    :sellyouhave
        killalltriggers
        setVar $oldcredits $CREDITS
        getWord CURRENTLINE $CREDITS 3
        stripText $CREDITS ","
        if ($oldcredits = $CREDITS)
            setVar $currenthaggle "failed"
            goto :sellhagglefailed
        else
            setVar $currenthaggle "succeeded"
            goto :sellhagglesucceeded
        end
    :sellhagglefailed
        if ($prodtosell = "ore")
            add $ore_sell_failures 1
        elseif ($prodtosell = "org")
            add $org_sell_failures 1
        elseif ($prodtosell = "equ")
            add $equ_sell_failures 1
        end
        if ($selldelay > 99)
	    gosub :setConnectionTriggers
            setDelayTrigger selldelay :selldelay $selldelay
            pause
            :selldelay
        end
        return

    :sellhagglesucceeded
        setVar $perunit $counter
        divide $perunit $portbuying

        setVar $selloutput "'"
        setVar $selloutput $selloutput & $portbuying & " " & $prodtosell & " for " & $counter & " cr"
        setVar $selloutput $selloutput & " - "
        if ($prodtosell = "ore")
            setVar $selloutput $selloutput & $ore_sell_failures
        elseif ($prodtosell = "org")
            setVar $selloutput $selloutput & $org_sell_failures
        elseif ($prodtosell = "equ")
            setVar $selloutput $selloutput & $equ_sell_failures
        end
        setVar $selloutput $selloutput & " fails"
        setVar $selloutput $selloutput & " - " & $perunit & "/unit"
        #setVar $selloutput $selloutput & " - PMI " & $portmaxinit
        #setVar $selloutput $selloutput & " - MULT " & $multiple
        setVar $selloutput $selloutput & " - MCIC " & $MCIC
        if ($prodtosell = "ore")
            setVar $selloutput $selloutput & "/-90*"
            setVar $oreselloutput $selloutput
            setVar $oreprofit $counter
        elseif ($prodtosell = "org")
            setVar $selloutput $selloutput & "/-75*"
            setVar $orgselloutput $selloutput
            setVar $orgprofit $counter
        elseif ($prodtosell = "equ")
            setVar $selloutput $selloutput & "/-65*"
            setVar $equselloutput $selloutput
            setVar $equprofit $counter
        end

        if ($selldelay > 99)
 	    gosub :setConnectionTriggers
            setDelayTrigger selldelay :selldelay2 $selldelay
            pause
            pause
            :selldelay2
        end
        return



:negotiateLand
    if ($startingLocation = "Citadel")
        send "L " & $planet & "* "
	gosub :getPlanetInfo
	send "c "
    elseif ($startingLocation = "Planet")
        send "L " & $planet & "* "
	gosub :getPlanetInfo
    end
    return


:exitneg
	#send "'Planet Negotiation exiting --- " & $exit_message & "*"
return
# ==============================  END PLANET NEGOTIATION ========================

# ============================  START PLAYER INFO SUBROUTINE  =================
:getInfo
    setVar $PHOTONS 0
    setVar $SCAN_TYPE "None"
    setVar $TWARP_TYPE 0
    setVar $corpstring "[0]"
    send "I"
    gosub :setConnectionTriggers
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

:noFigAtLocation
	setSectorParameter $NearFig "FIGSEC" FALSE
	goto :tryAgain2


# ====================================== START BUY COMMAND ==============================================
:buy

	getWord $user_command_line $parm1 1
	getWord $user_command_line $parm2 2
	getWord $user_command_line $parm3 3
	getWord $user_command_line $parm4 4
	getWord $user_command_line $parm5 5
	getWord $user_command_line $parm6 6
	getWord $user_command_line $parm7 7
	getWord $user_command_line $parm8 8
	send "@"
	waitOn "Average Interval Lag:"
	gosub :quikstats
	getWordPos $user_command_line $pos "override"
	if ($pos > 0)
		setVar $overrided TRUE
	else
		setVar $overrided FALSE
	end
	
	setVar $output ""
	setVar $equiprounds 0
	setVar $orgrounds 0
	setVar $fuelrounds 0
	setVar $buydownRoundsFromParam 999999
	if ($buytype = "w")
       		setVar $buydown_mode 3
	elseif ($buytype = "b")
	        setVar $buydown_mode 2
	else 
   		setVar $buydown_mode 1
	end
	if ($buyobject = "e")
	        setVar $buydown_equiprounds $buydownRoundsFromParam
		setVar $buydown_orgrounds 0
		setVar $buydown_fuelrounds 0
	elseif ($buyobject = "o")
	        setVar $buydown_equiprounds 0
		setVar $buydown_orgrounds $buydownRoundsFromParam
		setVar $buydown_fuelrounds 0
	elseif ($buyobject = "f")
	        setVar $buydown_equiprounds 0
		setVar $buydown_orgrounds 0
		setVar $buydown_fuelrounds $buydownRoundsFromParam
	else
		send "'{" $bot_name "} - Please use format buy [type] {speed} {#cycles} {override}*"
		halt
	end

	if ($startingLocation = "Citadel")
		send "Q"
	end
	send "t n l 1* t n l 2* t n l 3* s n l1*"
	gosub :setConnectionTriggers
	waitOn "How many groups of Colonists do you want to leave"
	gosub :getPlanetinfo
	if ($startingLocation = "Citadel")
		send "C s* "
	else
		send "Q D"
	end
	gosub :getinfo
	if ($TOTAL_HOLDS <> $EMPTY_HOLDS)
		if ($startingLocation <> "Citadel")
			gosub :landingSub
		end
		send "'{" $bot_name "} - Planet full, cannot empty ship holds*"
		goto :buydownExit
	end
	gosub :voidAdjacent
	setVar $startingLocation $startingLocation
	gosub :getPortInfo
	if ($validPortFound <> TRUE)
		echo "*No valid port found*"
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
	gosub :setConnectionTriggers
	setDelayTrigger initpause :initpause 500
	pause

:initpause


:getinputs
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
        	echo "*Nothing to buy*"
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
      		#send "'*{" $bot_name "}*Buying down using " & $buydown_mode & "*" $fuelrounds & " rounds of fuel*" $orgrounds & " rounds of org*" $equiprounds & " rounds of equip**"
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
        		#send "'{" $bot_name "} - Withdrew funds from the Treasury to complete the buydown*"
        		send "Q"
    		else
        		if ($startingLocation = "Citadel")
            			send "C "
        		else
	    			send "q "
			end
        		setVar $exit_message "Not enough cash onhand"
        		setVar $CURRENT_SECTOR $CURRENT_SECTOR
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
    	end
    	gosub :getinfo
    	setVar $credits_spent $init_credits
    	subtract $credits_spent $CREDITS
    	setVar $bot_name $bot_name
	gosub :clearAdjacent
    	if ($startingLocation = "Planet")
        	send "L " & $PLANET & "* "
    	end
    	if ($CREDITS > $startingCredits)
        	if ($startingLocation = "Citadel")
			send "T T " & ($CREDITS-$startingCredits) & "* "
	        	#send "'{" $bot_name "} - I put back extra funds taken for buydown.*"
		end
		#if ($startingLocation = "Planet")
		#	send "Q"
		#end
    	end
    	setVar $exit_message "Normal Exit"

	:buydownExit
    		return

#==================================   END BUY DOWN (BUY) SUB  ========================================

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
    killalltriggers
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
    killalltriggers
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





# ----- SUB :getPortInfo -----
:getPortInfo
    if ($startingLocation = "Citadel")
	send "S*CR*Q"
    else
    	send "*CR*Q"
    end
    setVar $validPortFound FALSE
    gosub :setConnectionTriggers
    setTextLineTrigger foundport :foundport2 "Items     Status  Trading % of max OnBoard"
    setTextLineTrigger noport :noport2 "I have no information about a port in that sector."
    setTextLineTrigger noport2 :noport2 "You have never visted sector"
    setTextLineTrigger noport3 :noport2 "credits / next hold"
    setTextLineTrigger noport4 :noport2 "A  Cargo holds     :"
    pause

    :noport2
        killtrigger foundport
	killtrigger noport
	killtrigger noport2
	killtrigger noport3
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
            gosub :setConnectionTriggers
            setTextLineTrigger portfuelinfo :portfuelinfo2 "Fuel Ore   Selling"
            setTextLineTrigger portorginfo :portorginfo2 "Organics   Selling"
            setTextLineTrigger portequipinfo :portequipinfo2 "Equipment  Selling"
            setTextLineTrigger gotallportinfo :gotallportinfo2 "<Computer deactivated>"
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
            killtrigger portfuelinfo
	    killtrigger portorginfo
	    killtrigger portequipinfo
	    killtrigger gotallportinfo
return

# ======================     END BUYING SUBROUTINES     =================
# =================================== ADJACENT CONTROLS ====================================
:voidadjacent
    getSector $CURRENT_SECTOR $sectorInfo
    if ($sectorInfo.warp[1] = 0)
        send "'This sector has no warps, maybe you need to scan it first*"
        halt
    else
        setVar $voidsect 0
        :voids
        add $voidsect 1
        if ($voidsect < 7)
            if ($sectorInfo.warp[$voidsect] <> 0)
                send "CV" & $sectorInfo.warp[$voidsect] & "*Q"
            end
            goto :voids
        end

        #send "'{" $bot_name "} - Avoids set on adjacent sectors!*"
        send "/"
	gosub :setConnectionTriggers
        waitOn " Sect "    
    end
return
:clearadjacent
    getSector $CURRENT_SECTOR $sectorInfo
    if ($sectorInfo.warp[1] = 0)
        send "'{" $bot_name "} -This sector has no warps, try to scan it first!*"
        halt
    else
        setVar $voidsect 0
        :clearvoids
        add $voidsect 1
        if ($voidsect < 7)
            if ($sectorInfo.warp[$voidsect] <> 0)
                send "CV0*YN" & $sectorInfo.warp[$voidsect] & "*Q"
            end
            goto :clearvoids
        end

        #send "'{" $bot_name "} - Avoids cleared on adjacent sectors!*"
        send "/"
	gosub :setConnectionTriggers
        waitOn " Sect "
    end
return
# =============================== END ADJACENT CONTROLS =============================================


:landOnPlanetEnterCitadel
	send "l "&$planet&"*tnl1*tnl2*tnl3*snl1*snl2*snl3*c "
	waitOn "Fuel Ore"
	getWord CURRENTLINE $planetFuel 6
	stripText $planetFuel ","
	send "/"
	gosub :setConnectionTriggers
	waitOn "Creds"
	getWord CURRENTLINE $credits 4
	stripText $credits "³Figs"
	stripText $credits ","
return

:getFuelCash
	send "l " $planet "*   c t f"&$total_creds_needed&"*qq"
	gosub :quikstats
return


:landingSub
        send "l" $PLANET "*z  n  z  n  *  "
	setVar $sucessfulCitadel FALSE
	setVar $sucessfulPlanet FALSE
	gosub :setConnectionTriggers
	setTextLineTrigger noplanet :noplanet "There isn't a planet in this sector."
	setTextLineTrigger no_land :no_land "since it couldn't possibly stand"
	setTextLineTrigger planet :planet "Planet #"
	setTextLineTrigger wrongone :wrong_num "That planet is not in this sector."
	pause

:noplanet
	killtrigger no_land
	killtrigger planet
	killtrigger wrongone
	echo "'{" $bot_name "} - No Planet in Sector!*"
	return

:no_land
	killtrigger noplanet
	killtrigger planet
	killtrigger wrongone
	echo "'{" $bot_name "} - This ship cannot land!*"
	return

:planet
	getWord CURRENTLINE $pnum_ck 2
	stripText $pnum_ck "#"
	if ($pnum_ck <> $PLANET)
		killtrigger no_land
		killtrigger wrongone
		killtrigger no_planet
		send "q"
		goto :wrong_num
	end
	killtrigger noplanet
	killtrigger no_land
	killtrigger wrongone
	gosub :setConnectionTriggers
	setTextTrigger wrong_num :wrong_num "That planet is not in this sector."
	setTextTrigger planet :planet_prompt "Planet command"
	pause

:wrong_num
	killtrigger planet
	echo "**'{" $bot_name "} - Incorrect Planet Number*"
	return

:planet_prompt
	killtrigger wrong_num
	setVar $currentBotPlanet $planet
	saveVar $currentBotPlanet 
	send "c"
	gosub :setConnectionTriggers
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
	killtrigger in_cit
	killtrigger nocitallowed
	killtrigger build_cit
	killtrigger citnotbuiltyet
	setVar $sucessfulCitadel TRUE
	setVar $startingLocation "Citadel"
return

:setConnectionTriggers
	killtrigger discod1
	killtrigger discod2
	SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
	SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."

return


	:Discod
	   	setVar $TagLine				"[Traveling Salesman]"
		setVar $TagLineB			"[Traveling Salesman]"
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
			send " L Z" & #8 & $Planet & "*  *  J  C  *  "
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



:startHaggle
killalltriggers
setVar $hfactor 5

:units
        killtrigger ptrade
        killtrigger strade
        killtrigger go
        killtrigger done
        SetTextTrigger ptrade :bunits "do you want to buy ["
        SetTextTrigger strade :sunits "do you want to sell ["
        setTextLineTrigger go :finishhaggle "Agreed, "
        setTextLineTrigger done :donehaggle "empty cargo holds."
        pause

:finishhaggle
        killtrigger done
        gosub :haggle

:donehaggle
 
return

:bunits
        setVar $multiplier (100 - $hfactor)
        goto :units

:sunits
        setVar $multiplier (100 + $hfactor)
	goto :units


:haggle
        setVar $ni 0
        setVar $midhag "-1"
        setVar $nocred 0
        killtrigger 1
        killtrigger 0
        killtrigger donehaggling
	killtrigger donhag
	killtrigger offerme
        setTextTrigger donehag :done_haggle "Command [TL="
        SetTextTrigger donehaggling :done_haggle "empty cargo holds."
        SetTextTrigger offerme :offerme "] ?"
       pause

:offerme
        getWord CURRENTLINE $offer 3
        stripText $offer "["
        stripText $offer "]"
        stripText $offer ","
        stripText $offer "?"
        setVar $orig_offer $offer

:rehaggle
        killtrigger 1
	killtrigger 0
        killtrigger 2
        killtrigger 3
        setVar $offer (($orig_offer * $multiplier) / 100)
        send $offer "*"
        add $midhag 1
        waitFor $offer
        IF ($multiplier > 100)
	       subtract $multiplier 1
        ELSE
	       add $multiplier 1
        END
        gosub :setConnectionTriggers
        send "@"
        waiton "Average Interval Lag:"
        setTextTrigger 0 :done_haggle "How many holds of"
        setTextTrigger 1 :rehaggle "Your offer"
        setTextTrigger 2 :donehag "We're not interested."
        setTextTrigger 3 :nocreds "You only have"
        pause

:nocreds
        setVAr $nocred 1
        send "0*0*"
        goto :done_haggle

:donehag
        setVar $ni 1

:done_haggle
        killtrigger donehag
        killtrigger 0
        killtrigger 1
        killtrigger 2
        killtrigger 3
        killtrigger rehaggle
        killtrigger donehaggling
        killtrigger offerme
	killalltriggers
return