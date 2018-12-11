	logging off
	loadVar $user_command_line
	loadVar $parm1
	loadVar $parm2
	loadVar $parm3
	loadVar $parm4
	loadVar $parm5
	loadVar $parm6
	loadVar $parm7
	loadVar $parm8
	loadVar $unlimitedGame
	loadVar $bot_turn_limit
	loadVar $bot_name
	

	
	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		send "'{" $bot_name "} - You must run Pay At The Pump command from a Citadel prompt.*"
     		halt
	end
	send "q"
	waitOn "Planet command (?"
	gosub :getPlanetInfo
	send "c"
	if ($CITADEL < 4)
		send "'{" $bot_name "} - You must run Pay At The Pump from at least a level 4 planet.*"
     		halt
	end
	if (($CITADELCREDITS + $CREDITS) < 5000000)
		send "'{" $bot_name "} - You must have at least 5 million credits in the citadel or on hand for patp.*"
     		halt
	end
	lowerCase $parm1
	setVar $minimumFuel $parm1
	isNumber $number $minimumFuel
	if ($number <> 1)
		send "'{" $bot_name "} - Minimum Port Fuel entered is not a number!*"
		halt
	end
	if ($minimumFuel <  0)
		send "'{" $bot_name "} - Minimum Port Fuel must be greater than or equal to 0.*"
		halt
	end
	getWordPos $user_command_line $pos "reverse"
	if ($pos > 0)
		setVar $reverse TRUE
	else
		setVar $reverse FALSE
	end
	getWordPos $user_command_line $pos "destroyports"
	if ($pos > 0)
		setVar $destroyPorts TRUE
	else
		setVar $destroyPorts FALSE
	end
	getWordPos $user_command_line $pos "upgrade"
	if ($pos > 0)
		setVar $upgrade TRUE
	else
		setVar $upgrade FALSE
	end
	getWordPos $user_command_line $pos "nofuel"
	if ($pos > 0)
		setVar $noFuelBuy TRUE
	else
		setVar $noFuelBuy FALSE
	end
	getWordPos $user_command_line $pos "half"
	if ($pos > 0)
		setVar $buyHalf TRUE
	else
		setVar $buyHalf FALSE
	end
	getWordPos $user_command_line $pos "turbo"
	if ($pos > 0)
		setVar $turbo TRUE
	else
		setVar $turbo FALSE
	end
	getWordPos $user_command_line $pos "avoidbusts"
	if ($pos > 0)
		setVar $avoidBusts TRUE
	else
		setVar $avoidBusts FALSE
	end
	getWordPos $user_command_line $pos "skipcim"
	if ($pos > 0)
		setVar $skipcim TRUE
	else
		setVar $skipcim FALSE
	end
	gosub :quikstats
	send "qsnl1*tnl1*tnl2*tnl3*"
	waitOn "Planet command (?"
	gosub :getPlanetInfo
	
	send "qjy l "&$planet&"* c"
	send "c;q"
	waitFor "Figs Per Attack:"
	getWord CURRENTLINE $maxFigAttack 5
	if ($reverse)
		setVar $sectorCount SECTORS
	else
		setVar $sectorCount 11
	end
	setVar $totalHolds 0 
	setVar $spentCredits 0 
	setVar $startingSector $CURRENT_SECTOR
	if ($skipcim = FALSE)
		send "'{" $bot_name "} PATP Downloading Current Port CIM Data - Comms Off*"
		send "^rq"
		killalltriggers
		SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
		SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
		waitFor ": ENDINTERROG"
		send "'{" $bot_name "} PATP CIM Port Data Complete - Comms Back On*"
	end
	setVar $isDone FALSE
	setVar $turnsTooLow FALSE
	:inac
	killalltriggers
	while ($isDone <> TRUE)
		getWordPos $avoidedSectors $pos " "&$sectorCount&" "
		getSectorParameter $sectorCount "FIGSEC" $isFigged
		getSectorParameter $sectorCount "BUSTED" $isBusted
		if (($isFigged = TRUE) AND ($isBusted <> TRUE) AND ($pos <= 0) AND (PORT.EXISTS[$sectorCount] = TRUE) AND (PORT.FUEL[$sectorCount] >= $minimumFuel) AND (PORT.BUYFUEL[$sectorCount] = FALSE))  
			send "c r "&$sectorCount&"*q "
			waitOn "What sector is the port in? ["&$CURRENT_SECTOR&"] "&$sectorCount
	
			killalltriggers
			SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
			SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
			setTextLineTrigger crchecknothere   :tryagain "I have no information about a port in that sector."
			setTextLineTrigger crneverbeenthere :checkPort "You have never visted sector"
			setTextLineTrigger crclass0         :tryagain  "A  Cargo holds     :"
			waitOn " Items     Status  Trading % of max OnBoard"
			killalltriggers
			SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
			SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
			setTextLineTrigger getFuel :fuelBefore "Fuel Ore"
			pause
			:fuelBefore
				killalltriggers
				getWord CURRENTLINE $totalPortFuel 4
				if ($totalPortFuel < $minimumFuel)
					goto :tryagain
				end
			:checkPort
				killalltriggers
			if (($avoidBusts) AND ($isBusted = TRUE))

			else
				killAllTriggers
				send "p"&$sectorCount&"*y"
				SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
				SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
				setTextLineTrigger warped :emptyPort "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
				setTextLineTrigger same :emptyPort "You are already in that sector!"
				setTextLineTrigger didnotwarp :tryAgain "Your own fighters must be in the destination to make a safe jump."
				pause
	
				:emptyPort
				killAllTriggers
				if ($noFuelBuy = FALSE)
					gosub :quikstats
					send "q"
					waitOn "Planet command (?"
					gosub :getPlanetInfo
					send "c"
					if ($upgrade)
						setVar $total_creds_needed (300*7000)
						if ($total_creds_needed > $CREDITS)
							setVar $cashonhand $citadelcredits
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
					else
						send "q q *"
					end
					if ($buyHalf)
						divide $totalPortFuel 2
					end
					if (($planetFuelMax-$planetFuel) < $totalPortFuel)
						setVar $turnsToEmpty (($planetFuelMax-$planetFuel)/$TOTAL_HOLDS)
						setVar $isDone TRUE
					else
						setVar $turnsToEmpty ($totalPortFuel/$TOTAL_HOLDS)
					end
					setVar $total_creds_needed ($turnsToEmpty*$TOTAL_HOLDS*35)
					if ($CREDITS < $total_creds_needed)
						gosub :getFuelCash
					end
					if ($CREDITS < $total_creds_needed)
						gosub :landOnPlanetEnterCitadel
						goto :donePATP
					end
					setVar $creditsBefore $CREDITS
					if (($unlimitedGame = FALSE) AND (($turns-$turnsToEmpty) <= $bot_turn_limit))
						setVar $turnsTooLow TRUE
						gosub :landOnPlanetEnterCitadel
						goto :donePATP
					end
					while ($turnsToEmpty > 1)
						setVar $creditsBefore $CREDITS
						if ($turbo)
							send "P T * * l j"&#8&$planet&"*   t  n  l 1*  q * "
						else
							send "P T * * l j"&#8&$planet&"*   t  n  l 1*  q * /"
						end
						subtract $turnsToEmpty 1
						add $totalHolds $TOTAL_HOLDS
						if ($turbo <> TRUE)
							killalltriggers
							SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
							SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
							waitOn "³Creds"
						end
					end
					killtrigger discod1
					killtrigger discod2
					SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
					SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."

					if ($buyHalf)
						send "'{" $bot_name "} Port half emptied in sector "&$sectorCount&".*"
						waitOn "{"&$bot_name&"} Port half emptied in sector "&$sectorCount&"."
					else
						send "'{" $bot_name "} Port emptied in sector "&$sectorCount&".*"
						waitOn "{"&$bot_name&"} Port emptied in sector "&$sectorCount&"."
					end
					gosub :quikstats
					if ((($TURNS < 50) AND ($unlimitedGame = FALSE)))
						gosub :landOnPlanetEnterCitadel
						goto :donePATP
					end
					add $spentCredits ($creditsBefore - $CREDITS)
				else
					send "q q *"
				end
				if ($destroyPorts)
					:keepDestroying
						killalltriggers
						gosub :quikstats
					if ($FIGHTERS > $maxFigAttack)
						send "p"
						setTextTrigger portAlreadyGone :doneDestroying "Captain! Are you sure you want to port here?"
						setTextTrigger portHere :continueDestroy "<A> Attack this Port"
						SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
						SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
						pause
						:continueDestroy
						killalltriggers
						send " a y "&$maxFigAttack&"*l "&$planet&"* m * * * q "
						SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
						SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
						setTextTrigger notDestroyed :keepDestroying "Incoming laser barrage from"
						setTextTrigger DestoryedPort :doneDestroying "You destroyed the Star Port!"
						pause
						:doneDestroying
							killalltriggers
							send "*"
							SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
							SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
							send "'{" $bot_name "} Port destroyed in sector "&$sectorCount&".*"
							waitOn "{"&$bot_name&"} Port destroyed in sector "&$sectorCount&"."
					end
				end
				send "c r*q "
				gosub :landOnPlanetEnterCitadel
			end
		end
		if (($CREDITS + $citadelcredits) < 1000000)
			setVar $isDone TRUE
		end
		:tryAgain
		if ($reverse)
			subtract $sectorCount 1
			if ($sectorCount < 11)
				setVar $isDone TRUE
			end
		else
			add $sectorCount 1
			if ($sectorCount > SECTORS)
				setVar $isDone TRUE
			end

		end
		if (($turns < 50) AND ($unlimitedGame <> TRUE))
			setVar $isDone TRUE
		end
	end
	:donePATP
	send "p"&$startingSector&"*y"
	setVar $formattedSpentCredits ""
	getLength $spentCredits $length
	while ($length > 3)
		cutText $spentCredits $snippet $length-2 9999
		cutText $spentCredits $spentCredits 1 $length-3
		getLength $spentCredits $length
		setVar $formattedSpentCredits ","&$snippet&$formattedSpentCredits
	end
	setVar $formattedSpentCredits $spentCredits&$formattedSpentCredits
	
	setVar $formattedHolds ""
	getLength $totalHolds $length
	while ($length > 3)
		cutText $totalHolds $snippet $length-2 9999
		cutText $totalHolds $totalHolds 1 $length-3
		getLength $totalHolds $length
		setVar $formattedHolds ","&$snippet&$formattedHolds
	end
	setVar $formattedHolds $totalHolds&$formattedHolds
	
	send "'*{" $bot_name "} Pay At The Pump - Completion Report {" $bot_name "}*  "&$formattedHolds&" total holds of fuel ore purchased.*  Credits spent: "&$formattedSpentCredits&" credits*"	
	if (($credits+$citadelcredits) < 1000000)
		send "  Credits are below 1,000,000.*"
	end
	if ($turnsTooLow)
		send "  Low on turns! (Turns: "&$TURNS&")*"			
	end
	if ($planetFuel >= ($planetFuelMax-2000))
		send "  Planet "&$planet&" is full.*"
	end
	if ($sectorCount >= SECTORS)
		send "  All ports meeting search criteria used up.*"
	end
	send  "{" $bot_name "} Pay At The Pump - Completion Report {" $bot_name "}**"
	halt

:getFuelCash
	send "l " $planet "*   c t f"&$total_creds_needed&"*qq"
	gosub :quikstats
return

:landOnPlanetEnterCitadel
	send "l "&$planet&"*tnl1*tnl2*tnl3*snl1*snl2*snl3*c "
	waitOn "Fuel Ore"
	getWord CURRENTLINE $planetFuel 6
	stripText $planetFuel ","
	send "/@"
	waitOn "Creds"
	getWord CURRENTLINE $credits 4
	stripText $credits "³Figs"
	stripText $credits ","
	waitOn "Average Interval Lag:"
					
return

:quikstats
	setVar $CURRENT_PROMPT 		"Undefined"
	killtrigger noprompt
	killtrigger prompt1
	killtrigger prompt2
	killtrigger prompt3
	killtrigger prompt4
	killtrigger statlinetrig
	killtrigger getLine2
	setTextTrigger 		prompt1 	:allPrompts 		"(?="
	setTextLineTrigger 	prompt2 	:secondaryPrompts 	"(?)"
	setTextLineTrigger 	statlinetrig 	:statStart 		#179
	setTextTrigger		prompt3         :terraPrompts		"Do you wish to (L)eave or (T)ake Colonists?"
	setTextTrigger		prompt4         :terraPrompts		"How many groups of Colonists do you want to take ("
#	setDelayTrigger 	noprompt        :doneQuikstats		 3000
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


# ==============================  START PLANET INFO SUBROUTINE  =================
:getPlanetInfo
    killalltriggers
    send "*"
    setTextLineTrigger planetInfo :planetInfo "Planet #"
    pause

    :planetinfo
        killalltriggers
        setVar $citadel 0
        setVar $sCannon 0
        setVar $aCannon 0
        setVar $citadelcredits 0
        getWord CURRENTLINE $planet 2
        stripText $planet "#"
        getWord CURRENTLINE $current_sector 5
        stripText $current_sector ":"
        waitfor "2 Build 1   Product    Amount     Amount     Maximum"

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

:checkAvoidedSectors
	setVar $avoidedSectors ""	
	:readAvoidedList
		setTextLineTrigger getLine1 :getAvoids
		send "cxq"
		pause
	:keepCountingAvoids
		killAllTriggers
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

	:Discod
	   	setVar $TagLine				"[Pay At The Pump]"
		setVar $TagLineB			"[Pay At The Pump]"
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
				send ("'{" &$bot_name& "} - PATP Unable To Land, Check my TA.*")
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