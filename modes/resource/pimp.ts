reqRecording
gosub :BOT~loadVars
loadvar $map~backdoor


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
	gosub :player~quikstats
	setVar $startingLocation $player~current_prompt
	getRnd $random 1 100000
	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "You must run Product Pimp from a Citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $bot~user_command_line $bot~user_command_line&" "
	isNumber $test $bot~parm1
	if ($test)
		setVar $SWITCHBOARD~message "Invalid arguments for Product Pimp*"
		gosub :SWITCHBOARD~switchboard
		halt
	else
		getWordPos $bot~parm1 $pos #34
		if ($pos > 0)
			getText $bot~user_command_line $targetPlanet " "&#34 #34&" "
			if ($targetPlanet <> "")
				setVar $om_planetname $targetPlanet
				stripText $bot~user_command_line " "&#34&$targetPlanet&#34&" "
			else
				setVar $om_planetname "M()M Pimp "&$random
			end
		else
			setVar $om_planetname "M()M Pimp "&$random
		end
	end
	setVar $bot~user_command_line " "&$bot~user_command_line&" "
	getWordPos $bot~user_command_line $pos " f "
	if ($pos > 0)
		setVar $emptyFuel TRUE
	else
		setVar $emptyFuel FALSE
	end
	getWordPos $bot~user_command_line $pos " o "
	if ($pos > 0)
		setVar $emptyOrganics TRUE
	else
		setVar $emptyOrganics FALSE
	end
	getWordPos $bot~user_command_line $pos " e "
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
	
	
	setVar $om_sdloc $map~stardock
	setVar $totalPlanets 0
	setVar $stripables 0

gosub :player~quikstats
setVar $startingLocation $player~current_prompt

if ($startingLocation = "Citadel")
    send "Q"
    gosub :planet~getplanetinfo
    send "C"
    waitfor "Citadel command"
elseif ($startingLocation = "Planet")
    gosub :planet~getplanetinfo
    send "Q"
    send "L " & $planet~planet & "* "
end

setVar $target $planet~planet
setvar $target_cash $planet~citadelcredits
SetVar $totalfuel $planet~planetfuel
SetVar $totalorg $planet~planetorg
SetVar $totalequ $planet~planetequip
SetVar $totalfuelmax $planet~planetfuelmax
SetVar $totalorgmax $planet~planetorgmax
SetVar $totalequmax $planet~planetequipmax
setVar $om_redsector $map~backdoor
:inac
killalltriggers
:myinfo
    if ($player~unlimitedGame = FALSE)
		if ($player~turns < $bot~bot_turn_limit)
			setVar $SWITCHBOARD~message "I have too few turns to pimp product, Script halting.*"
			gosub :SWITCHBOARD~switchboard
			HALT
		end
    end
    if (($player~credits + $target_cash) < 1000000)
		setVar $SWITCHBOARD~message "I have too little cash on hand, Script halting.*"
		gosub :SWITCHBOARD~switchboard
		HALT
    end

:myplanetInfo
    if ($startingLocation = "Citadel")
        send "Q"
        gosub :planet~getplanetinfo
        send "C"
        waitfor "Citadel command"
    elseif ($startingLocation = "Planet")
        gosub :planet~getplanetinfo
    end

    SetVar $totalfuel $planet~planetfuel
	SetVar $totalorg $planet~planetorg
	SetVar $totalequ $planet~planetequip
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
        gosub :player~quikstats
	if (($player~credits < 1000000) AND (($player~genesis <= 0) OR ($player~atomic <= 0)))
		setVar $cashonhand $target_cash
		add $cashonhand $player~credits
		send "l j"&#8&$target&"* c "
		if ($cashonhand > 5000000)
			send "T T " & $player~credits & "* "
        		send "T F " & 5000000 & "* "
        		setVar $player~credits 5000000
		elseif ($cashonhand > 1000000)
			send "T T " & $player~credits & "* "
        		send "T F " & $cashonhand & "* "
        		setVar $player~credits $cashonhand
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
		gosub :player~quikstats
	end
	if ($player~fighters < 1000)
        	setVar $SWITCHBOARD~message "I have too few fighters on hand, less than 1000.  Script halting.*"
			gosub :SWITCHBOARD~switchboard
        	HALT
	end
	if ($player~unlimitedGame = FALSE)
		if ($player~turns < $turn_limit)
			setVar $SWITCHBOARD~message "I have too few turns to pimp product, Script halting.*"
			gosub :SWITCHBOARD~switchboard
			HALT
		end
	end
	if (($player~genesis > 0) AND ($player~atomic > 0))
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
	getWord $line $planet~planetNum 1
        stripText $planet~planetNum ">"
        send $planet~planetNum "*"
        #check ore

	gosub :planet~getplanetinfo

	IF ((($planet~planetFUEL < $player~total_holds) OR ($emptyFuel = FALSE)) AND (($planet~planetORG < $player~total_holds) OR ($emptyOrganics = FALSE)) AND (($planet~planetEQUIP< $player~total_holds) OR ($emptyEquipment = FALSE)))
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
			send "tnt1*q l j"&#8&$target&"* tnl1*q l j"&#8&$planet~planetNum&"* "
			setTextTrigger fuelSuccess :fuelSuccess "You load the "
			setTextTrigger fuelEmpty :fuelEmpty "There aren't that many "
			setTextTrigger fuelFull :fullplanet "They don't have room for that many "
			pause
		else
                        goto :fuelEmpty
                end

	:fuelSuccess
                add $totalFuel $player~total_holds
                gosub :setWindows
		goto :tryFuel
	:fuelEmpty
		killalltriggers
	:tryOrganics
		killAllTriggers
		if ($emptyOrganics)
			send "tnt2*q l j"&#8&$target&"* tnl2*q l j"&#8&$planet~planetNum&"* "
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
                add $totalOrg $player~total_holds
                gosub :setWindows
		goto :tryOrganics
	:orgEmpty
		killalltriggers
	:tryEquipment
		killAllTriggers
		if ($emptyEquipment)
			SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
			SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
			send "tnt3*q l j"&#8&$target&"* tnl3*q l j"&#8&$planet~planetNum&"* "
			setTextTrigger success :equSuccess "You load the "
			setTextTrigger emptyEmpty :emptyPlanet "There aren't that many "
			setTextTrigger fullFill :fullplanet "They don't have room for that many "
			pause
		else
		        goto :equEmpty
                end
	:equSuccess
                add $totalEqu $player~total_holds
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
	IF ($player~alignment < 1000)
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

if ($om_redsector <> 0) and ($player~alignment < 1000)
        if ($player~unlimitedGame)
		setVar $SWITCHBOARD~message "Running Product Pimp with unlimited turns and "&$player~credits&" credits left*"
		gosub :SWITCHBOARD~switchboard
	else
		setVar $SWITCHBOARD~message "Running Product Pimp with "&$player~turns&" turns and "&$player~credits&" credits left*"
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
setVar $SWITCHBOARD~message "Running Product Pimp with "&$player~turns&" turns and "&$player~credits&" credits left*"
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
send "Q Q M " & $player~current_sector & " * Y"
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







:setWindows
	if ($player~unlimitedGame)
		setVar $window_content "Planet fuel:  "&$totalfuel&" out of "&$totalfuelmax&"*Planet Org:   "&$totalorg&" out of "&$totalorgmax&"*Planet Equip: "&$totalEqu&" out of "&$totalequmax&"*Cash:         "&$player~credits&"   Genesis Torps:  "&$player~genesis&"*Fighters:     "&$player~fighters&"   Atomic Dets:    "&$player~atomic&"*Turns:     Unlimited*"&$stripables&" out of "&$totalPlanets&" planets have had product on them.*"
	else
		setVar $window_content "Planet fuel:  "&$totalfuel&" out of "&$totalfuelmax&"*Planet Org:   "&$totalorg&" out of "&$totalorgmax&"*Planet Equip: "&$totalEqu&" out of "&$totalequmax&"*Cash:         "&$player~credits&"   Genesis Torps:  "&$player~genesis&"*Fighters:     "&$player~fighters&"   Atomic Dets:    "&$player~atomic&"*Turns:        "&$player~turns&"*"&$stripables&" out of "&$totalPlanets&" planets have had product on them.*"
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
		gosub :player~quikstats
		if ($player~current_prompt = "Command")
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
		elseif ($player~current_prompt = "Planet")
	   		send ("  q q q q q  * * '" & $TagLineB & " Attempting to Reach Correct Prompt...*")
			setTextLineTrigger	EMQ_COMPLETE		:EMQ_DELAY "Attempting to Reach Correct Prompt..."
			setDelayTrigger 	EMQ_DELAY		:EMQ_DELAY 3000
			pause
			
			
		elseif ($player~current_prompt = "Citadel")
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
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet\getplanetinfo\planet"
