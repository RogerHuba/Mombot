reqRecording
logging off
# Load Game Vars
	loadVar $bot_name
	loadVar $unlimitedGame
	loadVar $bot_turn_limit
	loadVar $stardock
	loadVar $backdoor
	loadVar $user_command_line
	loadVar $parm1
	loadVar $parm2
	loadVar $parm3
	loadVar $parm4
	loadVar $parm5
	loadVar $parm6
	loadVar $parm7
	loadVar $parm8

	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"PIMP - Makes planets and strips them of product "
	setVar $BOT~help[2] $BOT~tab&"   "
	setVar $BOT~help[3] $BOT~tab&"pimp {"&#34&"planet name"&#34&"} {f} {o} {e}"
	setVar $BOT~help[4] $BOT~tab&"      "
	setVar $BOT~help[5] $BOT~tab&"[planet name] - creates planet with this name (default"
	setVar $BOT~help[6] $BOT~tab&"                is random name)"
	setVar $BOT~help[7] $BOT~tab&"          [f] - fuel"
	setVar $BOT~help[8] $BOT~tab&"          [o] - organics"
	setVar $BOT~help[9] $BOT~tab&"          [e] - equipment"
	gosub :BOT~help_file

	setVar $BOT~script_title "Product Pimp"
	gosub :BOT~banner


		
:pimp
	window prodpimp 400 150 "Product Pimp Stats" ONTOP
	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	getRnd $random 1 100000
	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "You must run Product Pimp from a Citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $user_command_line $user_command_line&" "
	isNumber $test $parm1
	if ($test)
		setVar $SWITCHBOARD~message "Invalid arguments for Product Pimp*"
		gosub :SWITCHBOARD~switchboard
		halt
	else
		getWordPos $parm1 $pos #34
		if ($pos > 0)
			getText $user_command_line $targetPlanet " "&#34 #34&" "
			if ($targetPlanet <> "")
				setVar $om_planetname $targetPlanet
				stripText $user_command_line " "&#34&$targetPlanet&#34&" "
			else
				setVar $om_planetname "M()M Pimp "&$random
			end
		else
			setVar $om_planetname "M()M Pimp "&$random
		end
	end
	setVar $user_command_line " "&$user_command_line&" "
	getWordPos $user_command_line $pos " f "
	if ($pos > 0)
		setVar $emptyFuel TRUE
	else
		setVar $emptyFuel FALSE
	end
	getWordPos $user_command_line $pos " o "
	if ($pos > 0)
		setVar $emptyOrganics TRUE
	else
		setVar $emptyOrganics FALSE
	end
	getWordPos $user_command_line $pos " e "
	if ($pos > 0)
		setVar $emptyEquipment TRUE
	else
		setVar $emptyEquipment FALSE
	end
	if (($emptyOrganics = FALSE) AND ($emptyEquipment = FALSE) AND ($emptyFuel = FALSE))
		setVar $SWITCHBOARD~message "Please pick [f]uel, [o]rganics and/or [e]quipment to harvest.  pimp {"&#34&"planet name"&#34&"} {f} {o} {e} *"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	
	
	setVar $om_sdloc $stardock
	setVar $totalPlanets 0
	setVar $stripables 0

gosub :quikstats
setVar $startingLocation $CURRENT_PROMPT

if ($startingLocation = "Citadel")
    send "Q"
    gosub :getPlanetInfo
    send "C"
    waitfor "Citadel command"
elseif ($startingLocation = "Planet")
    gosub :getPlanetInfo
    send "Q"
    send "L " & $planet & "* "
end

setVar $target $planet
setvar $target_cash $citadelcredits
SetVar $totalfuel $planetfuel
SetVar $totalorg $planetorg
SetVar $totalequ $planetequip
SetVar $totalfuelmax $planetfuelmax
SetVar $totalorgmax $planetorgmax
SetVar $totalequmax $planetequipmax
setVar $om_redsector $backdoor
:inac
killalltriggers
:myinfo
    if ($unlimitedGame = FALSE)
		if ($turns < $bot_turn_limit)
			setVar $SWITCHBOARD~message "I have too few turns to pimp product, Script halting.*"
			gosub :SWITCHBOARD~switchboard
			HALT
		end
    end
    if (($credits + $target_cash) < 1000000)
		setVar $SWITCHBOARD~message "I have too little cash on hand, Script halting.*"
		gosub :SWITCHBOARD~switchboard
		HALT
    end

:myplanetInfo
    if ($startingLocation = "Citadel")
        send "Q"
        gosub :getPlanetInfo
        send "C"
        waitfor "Citadel command"
    elseif ($startingLocation = "Planet")
        gosub :getPlanetInfo
    end

    SetVar $totalfuel $planetfuel
	SetVar $totalorg $planetorg
	SetVar $totalequ $planetequip
    if ($startingLocation = "Citadel")
		send "Q"
    end

    #Empty Holds to Planet
    send "m * * * T * L 1*T*L2*T*L3*S*L1*Q j y"

    SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
    SetEventTrigger	Discod2		:Discod     	"Connections have been temporarily disabled."
    WaitFor "Command [TL"



:makePlanet
	killalltriggers
    	gosub :setWindows
        gosub :quikstats
	if (($credits < 1000000) AND (($genesis <= 0) OR ($atomic <= 0)))
		setVar $cashonhand $target_cash
		add $cashonhand $CREDITS
		send "l j"&#8&$target&"* c "
		if ($cashonhand > 5000000)
			send "T T " & $CREDITS & "* "
        		send "T F " & 5000000 & "* "
        		setVar $CREDITS 5000000
		elseif ($cashonhand > 1000000)
			send "T T " & $CREDITS & "* "
        		send "T F " & $cashonhand & "* "
        		setVar $CREDITS $cashonhand
		else
			setVar $SWITCHBOARD~message "I have too little cash on hand, Script halting.*"
			gosub :SWITCHBOARD~switchboard
	       	HALT
		end
		SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
		SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
		setTextLineTrigger getcash :gotcash "credits, and the Treasury has "
		pause
		:gotcash
 			getWord CURRENTLINE $target_cash 9
			striptext $target_cash ","
		send "qqq* * "
		gosub :quikstats
	end
	if ($fighters < 1000)
        	setVar $SWITCHBOARD~message "I have too few fighters on hand, less than 1000.  Script halting.*"
			gosub :SWITCHBOARD~switchboard
        	HALT
	end
	if ($unlimitedGame = FALSE)
		if ($turns < $turn_limit)
			setVar $SWITCHBOARD~message "I have too few turns to pimp product, Script halting.*"
			gosub :SWITCHBOARD~switchboard
			HALT
		end
	end
	if (($genesis > 0) AND ($atomic > 0))
		send "u y * " & #8 & #8 & $om_planetname&"* p q * "
		gosub :setWindows
		add $totalPlanets 1
		killalltriggers
		SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
		SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
        	setTextTrigger builtPlanet :findPlanet "For building this planet"
		pause
	else
		gosub :restock
		goto :makePlanet
	end


:findplanet
	KillAllTriggers
        #Find the planet we just created
        send "L"
	SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
	SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
        setTextLineTrigger GetPlanetNum :GetPlanetNum "> "&$om_planetname
        Pause
	Pause

        :GetPlanetNum
        setVar $line CURRENTLINE
        striptext $line "<"
	getWord $line $planetNum 1
        stripText $PlanetNum ">"
        send $PlanetNum "*"
        #check ore

	gosub :getPlanetInfo

	IF ((($PLANETFUEL < $TOTAL_HOLDS) OR ($emptyFuel = FALSE)) AND (($PLANETORG < $TOTAL_HOLDS) OR ($emptyOrganics = FALSE)) AND (($PLANETEQUIP< $TOTAL_HOLDS) OR ($emptyEquipment = FALSE)))
		#Blow it up :D
        	If (($fuelcolos = "0") and ($orgcolos = "0") and ($equipcolos = "0"))
        	    killalltriggers
		    send "Z D Y "
	  	    SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
		    SetEventTrigger	Discod2		:Discod     	"Connections have been temporarily disabled."
        	    setTextTrigger 6 :nodets "You do not have any Atomic Detonators!"
        	    setTextTrigger 7 :makePlanet "Command [TL="
        	    pause
        	end
        End
	add $stripables 1
        send "* "
	killalltriggers
	SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
	SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
	WaitFor "Planet command"
	:tryFuel
		killAllTriggers
		SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
		SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
		if ($emptyFuel)
			send "tnt1*q l j"&#8&$target&"* tnl1*q l j"&#8&$planetNum&"* "
			setTextTrigger fuelSuccess :fuelSuccess "You load the "
			setTextTrigger fuelEmpty :fuelEmpty "There aren't that many "
			setTextTrigger fuelFull :fullplanet "They don't have room for that many "
			pause
		else
                        goto :fuelEmpty
                end

	:fuelSuccess
                add $totalFuel $total_holds
                gosub :setWindows
		goto :tryFuel
	:fuelEmpty
		killalltriggers
	:tryOrganics
		killAllTriggers
		if ($emptyOrganics)
			send "tnt2*q l j"&#8&$target&"* tnl2*q l j"&#8&$planetNum&"* "
			SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
			SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
			setTextTrigger success :orgSuccess "You load the "
			setTextTrigger orgEmpty :tryEquipment "There aren't that many "
			setTextTrigger fullFill :fullplanet "They don't have room for that many "
			pause
		else
		        goto :orgEmpty
                end

	:orgSuccess
                add $totalOrg $total_holds
                gosub :setWindows
		goto :tryOrganics
	:orgEmpty
		killalltriggers
	:tryEquipment
		killAllTriggers
		if ($emptyEquipment)
			SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
			SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
			send "tnt3*q l j"&#8&$target&"* tnl3*q l j"&#8&$planetNum&"* "
			setTextTrigger success :equSuccess "You load the "
			setTextTrigger emptyEmpty :emptyPlanet "There aren't that many "
			setTextTrigger fullFill :fullplanet "They don't have room for that many "
			pause
		else
		        goto :equEmpty
                end
	:equSuccess
                add $totalEqu $total_holds
                gosub :setWindows
		goto :tryEquipment
	:equEmpty
		killalltriggers
		goto :emptyPlanet

	:fullPlanet
		killalltriggers
		send "qqqqqq* l j"&#8&$target&"* "
		if ($startingLocation = "Citadel")
			send "c "
		end
		setVar $SWITCHBOARD~message " Planet " & $target & " is full, stopping.*"
		gosub :SWITCHBOARD~switchboard
		halt

	:emptyPlanet
		killalltriggers
		send "@"
		SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
		SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
		WaitFor "Average Interval Lag:"
	         send "Q"
		WaitFor "Command [TL"
		goto :findplanet

:nodets
	send "QQ"
	IF ($ALIGNMENT < 1000)
		setVar $SWITCHBOARD~message "Alignment less than 1000, can't refurb genesis torps and atomic dets*"
		gosub :SWITCHBOARD~switchboard
		HALT
	End

	gosub :restock
	goto  :findplanet
 
:restock
KillAllTriggers
SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
SetTextLineTrigger sdyes :sdyes "Commerce report for Stargate Alpha I:"
SetTextLineTrigger sdno1  :sdno  "You have never visted sector"
SetTextLineTrigger sdno2  :sdno  "I have no information about a port in that sector."
setDelayTrigger sdno3 :sdno 10000
#had to add WaitFors b/c AllKeys was bypassing display
send "C"
WaitFor "<Computer activated>"
send "R"
WaitFor "What sector is the port"
send $om_sdloc "*"

Pause
Pause

:sdno
	send "q"
	setVar $SWITCHBOARD~message "SD is not in that sector, or never been visited!! Product Pimp shutting down in starting sector.*"
	gosub :SWITCHBOARD~switchboard
	HALT

:sdyes
	send "QL " & $target & "* T * T 1 * M * * * Q"
	WaitFor "Command [TL"

if ($om_redsector <> 0) and ($ALIGN < 1000)
        if ($unlimitedGame)
		setVar $SWITCHBOARD~message "Running Product Pimp with unlimited turns and "&$credits&" credits left*"
		gosub :SWITCHBOARD~switchboard
	else
		setVar $SWITCHBOARD~message "Running Product Pimp with "&$turns&" turns and "&$credits&" credits left*"
		gosub :SWITCHBOARD~switchboard
	end
	KillAlltriggers
	SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
	SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
	SetTextTrigger nofig :nofig "Do you want to make this jump blind?"
	SetTextTrigger ready1 :ready1 "Locating beam pinpointed,"
        SetTextTrigger nofuel2 :nofuel "You do not have enough Fuel Ore to make the jump"	
	send "m" $om_redsector "*y"
	Pause
        Pause
End
setVar $SWITCHBOARD~message "Running Product Pimp with "&$turns&" turns and "&$credits&" credits left*"
gosub :SWITCHBOARD~switchboard
SetTextTrigger nofig :nofig "Do you want to make this jump blind?"
SetTextTrigger ready2 :ready2 "All Systems Ready, shall we engage?"
SetTextTrigger nofuel1 :nofuel "You do not have enough Fuel Ore to make the jump"	
send "nsy"
Pause
Pause

:nofig
KillAlltriggers
send "n"
setVar $SWITCHBOARD~message "No fig at target sector. Shutting Down*"
gosub :SWITCHBOARD~switchboard
HALT

:nofuel
KillAlltriggers
setVar $SWITCHBOARD~message "No fuel for twarp. Shutting Down*"
gosub :SWITCHBOARD~switchboard
HALT

:ready1
KillAlltriggers
SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
SetTextTrigger limpet :limpet "ort official runs up"
SetTextTrigger buytorps :buytorps "<StarDock> Where to?"
send "YNS P S"
Pause
Pause

:ready2
KillAllTriggers
SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
SetTextTrigger limpet :limpet "ort official runs up"
SetTextTrigger buytorps :buytorps "<StarDock> Where to?"
send "Y PS"
Pause
Pause

:limpet
send "Y"
Pause

:buytorps
KillAlltriggers
SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
SetTextTrigger torps :torps "How many Genesis Torpedoes do you want"
SetTextTrigger dets  :dets  "How many Atomic Detonators do you want"
send "HT"
Pause
Pause

:torps 
GetWord CURRENTLINE $numtorps 9
StripText $numtorps ")"
send $numtorps & "*"
send "A"
Pause

:dets 
GetWord CURRENTLINE $numdets 9
StripText $numdets ")"
send $numdets & "*"
send "Q Q M " & $current_sector & " * Y"
SetTextTrigger nofig :nofig "Do you want to make this jump blind?"
SetTextTrigger ready3 :ready3 "Locating beam pinpointed,"
SetTextTrigger nofuel :nofuel "You do not have enough Fuel Ore to make the jump"
Pause
Pause

:ready3
send "Y"
WaitFor "Command [TL"
send "l "&$target&"* t n l 1* q q * j y * "
Return


:planetfull
    setVar $SWITCHBOARD~message "Planet is full. Script Halting.*"
	gosub :SWITCHBOARD~switchboard
    send "QQ*"


:finish
    halt



# ==============================  START PLANET INFO SUBROUTINE  =================
:getPlanetInfo
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
	    SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
	    SetEventTrigger	Discod2		:Discod     	"Connections have been temporarily disabled."
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


:quikstats
    setVar $CURRENT_PROMPT      "Undefined"
    killtrigger noprompt
    killtrigger prompt
    killtrigger statlinetrig
    killtrigger getLine2
    setTextLineTrigger  prompt      :allPrompts     #145 & #8
    setTextLineTrigger  statlinetrig    :statStart      #179
    send #145&"/"
    pause
    :allPrompts
        getWord CURRENTLINE $CURRENT_PROMPT 1
        setVar $FULL_CURRENT_PROMPT CURRENTLINE
        stripText $FULL_CURRENT_PROMPT #145
        stripText $FULL_CURRENT_PROMPT #8
        stripText $CURRENT_PROMPT #145
        stripText $CURRENT_PROMPT #8
        setTextLineTrigger  prompt      :allPrompts     #145 & #8
        pause
    :statStart
        killtrigger prompt
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
                getWord $stats $CURRENT_SECTOR      ($current_word + 1)
            elseif ($wordy = "Turns")
                getWord $stats $TURNS           ($current_word + 1)
                if ($unlimitedGame = TRUE)
                    setVar $TURNS 65000
                end
            elseif ($wordy = "Creds")
                getWord $stats $CREDITS         ($current_word + 1)
            elseif ($wordy = "Figs")
                getWord $stats $FIGHTERS        ($current_word + 1)
            elseif ($wordy = "Shlds")
                getWord $stats $SHIELDS         ($current_word + 1)
            elseif ($wordy = "Hlds")
                getWord $stats $TOTAL_HOLDS         ($current_word + 1)
            elseif ($wordy = "Ore")
                getWord $stats $ORE_HOLDS           ($current_word + 1)
            elseif ($wordy = "Org")
                getWord $stats $ORGANIC_HOLDS       ($current_word + 1)
            elseif ($wordy = "Equ")
                getWord $stats $EQUIPMENT_HOLDS     ($current_word + 1)
            elseif ($wordy = "Col")
                getWord $stats $COLONIST_HOLDS      ($current_word + 1)
            elseif ($wordy = "Phot")
                getWord $stats $PHOTONS         ($current_word + 1)
            elseif ($wordy = "Armd")
                getWord $stats $ARMIDS          ($current_word + 1)
            elseif ($wordy = "Lmpt")
                getWord $stats $LIMPETS         ($current_word + 1)
            elseif ($wordy = "GTorp")
                getWord $stats $GENESIS         ($current_word + 1)
            elseif ($wordy = "TWarp")
                getWord $stats $TWARP_TYPE          ($current_word + 1)
            elseif ($wordy = "Clks")
                getWord $stats $CLOAKS          ($current_word + 1)
            elseif ($wordy = "Beacns")
                getWord $stats $BEACONS         ($current_word + 1)
            elseif ($wordy = "AtmDt")
                getWord $stats $ATOMIC          ($current_word + 1)
            elseif ($wordy = "Corbo")
                getWord $stats $CORBO           ($current_word + 1)
            elseif ($wordy = "EPrb")
                getWord $stats $EPROBES         ($current_word + 1)
            elseif ($wordy = "MDis")
                getWord $stats $MINE_DISRUPTORS     ($current_word + 1)
            elseif ($wordy = "PsPrb")
                getWord $stats $PSYCHIC_PROBE       ($current_word + 1)
            elseif ($wordy = "PlScn")
                getWord $stats $PLANET_SCANNER      ($current_word + 1)
            elseif ($wordy = "LRS")
                getWord $stats $SCAN_TYPE           ($current_word + 1)
            elseif ($wordy = "Aln")
                getWord $stats $ALIGNMENT           ($current_word + 1)
            elseif ($wordy = "Exp")
                getWord $stats $EXPERIENCE          ($current_word + 1)
            elseif ($wordy = "Corp")
                getWord $stats $CORP            ($current_word + 1)
            elseif ($wordy = "Ship")
                getWord $stats $SHIP_NUMBER         ($current_word + 1)
            end
            add $current_word 1
            getWord $stats $wordy $current_word
        end
    :doneQuikstats
    killtrigger statlinetrig
    killtrigger getLine2
    saveVar $unlimitedGame
    saveVar $CREDITS
    saveVar $FIGHTERS
    saveVar $SHIELDS
    saveVar $TOTAL_HOLDS
    saveVar $ORE_HOLDS
    saveVar $ORGANIC_HOLDS
    saveVar $EQUIPMENT_HOLDS
    saveVar $COLONIST_HOLDS
    saveVar $PHOTONS
    saveVar $ARMIDS
    saveVar $LIMPETS
    saveVar $GENESIS
    saveVar $TWARP_TYPE
    saveVar $CLOAKS
    saveVar $BEACONS
    saveVar $ATOMIC
    saveVar $CORBO
    saveVar $EPROBES
    saveVar $MINE_DISRUPTORS
    saveVar $PSYCHIC_PROBE
    saveVar $PLANET_SCANNER
    saveVar $SCAN_TYPE
    saveVar $ALIGNMENT
    saveVar $EXPERIENCE
    saveVar $SHIP_NUMBER
    saveVar $TRADER_NAME
return
# ============================== END QUICKSTATS SUB==============================




:setWindows
	if ($unlimitedGame)
		setVar $window_content "Planet fuel:  "&$totalfuel&" out of "&$totalfuelmax&"*Planet Org:   "&$totalorg&" out of "&$totalorgmax&"*Planet Equip: "&$totalEqu&" out of "&$totalequmax&"*Cash:         "&$credits&"   Genesis Torps:  "&$genesis&"*Fighters:     "&$fighters&"   Atomic Dets:    "&$atomic&"*Turns:     Unlimited*"&$stripables&" out of "&$totalPlanets&" planets have had product on them.*"
	else
		setVar $window_content "Planet fuel:  "&$totalfuel&" out of "&$totalfuelmax&"*Planet Org:   "&$totalorg&" out of "&$totalorgmax&"*Planet Equip: "&$totalEqu&" out of "&$totalequmax&"*Cash:         "&$credits&"   Genesis Torps:  "&$genesis&"*Fighters:     "&$fighters&"   Atomic Dets:    "&$atomic&"*Turns:        "&$TURNS&"*"&$stripables&" out of "&$totalPlanets&" planets have had product on them.*"
	end
	setWindowContents prodpimp $window_content
	replaceText $window_content "*" "[][]"
	saveVar $window_content
return	


	:Discod
	   	setVar $TagLine				"[Product Pimp]"
		setVar $TagLineB			"[Product Pimp]"
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
			send " L Z" & #8 & $target & "*  *  J  C  *  "
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
		elseif ($CURRENT_PROMPT = "Planet")
	   		send ("  q q q q q  * * '" & $TagLineB & " Attempting to Reach Correct Prompt...*")
			setTextLineTrigger	EMQ_COMPLETE		:EMQ_DELAY "Attempting to Reach Correct Prompt..."
			setDelayTrigger 	EMQ_DELAY		:EMQ_DELAY 3000
			pause
			
			
		elseif ($CURRENT_PROMPT = "Citadel")
			send ("'{" & $bot_name & "} "&$TagLineB&" - Restarting!**")
			waitfor "Message sent on sub-space channel"
	   		goto :inac
	   	else
	   		send (" p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '" & $TagLineB & " Attempting to Reach Correct Prompt...*")
			setTextLineTrigger	EMQ_COMPLETE		:EMQ_DELAY "Attempting to Reach Correct Prompt..."
			setDelayTrigger 	EMQ_DELAY		:EMQ_DELAY 3000
			pause
			:EMQ_DELAY
				killAllTriggers
				goto :Disco_Test
		end

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
