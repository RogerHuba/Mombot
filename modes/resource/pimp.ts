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
	gosub :bot~helpfile

	setVar $BOT~script_title "product pimp"
	gosub :BOT~banner


		
:pimp

	window prodpimp 400 150 "product pimp stats" ONTOP
	gosub :player~quikstats
	setVar $starting_location $player~current_prompt
	getRnd $random 1 100000
	if ($starting_location <> "Citadel") and ($starting_location <> "Planet")
		setVar $switchboard~message "You must run product pimp from a Citadel prompt.*"
		gosub :switchboard~switchboard
		halt
	end
	setVar $bot~user_command_line $bot~user_command_line&" "
	isNumber $test $bot~parm1
	
	getWordPos $bot~user_command_line $pos #34
	if ($pos > 0)
		getText " "&$bot~user_command_line&" " $targetPlanet " "&#34 #34&" "
		if ($targetPlanet <> "")
			setVar $pimp_planet_name $targetPlanet
			stripText $bot~user_command_line " "&#34&$targetPlanet&#34&" "
		else
			setVar $pimp_planet_name "M()M Pimp "&$random
		end
	else
		setVar $pimp_planet_name "M()M Pimp "&$random
	end

	setVar $bot~user_command_line " "&$bot~user_command_line&" "
	getWordPos $bot~user_command_line $pos " f "
	if ($pos > 0)
		setVar $emptyFuel TRUE
	else
		setVar $emptyFuel false
	end
	getWordPos $bot~user_command_line $pos " o "
	if ($pos > 0)
		setVar $emptyOrganics TRUE
	else
		setVar $emptyOrganics false
	end
	getWordPos $bot~user_command_line $pos " e "
	if ($pos > 0)
		setVar $emptyEquipment TRUE
	else
		setVar $emptyEquipment false
	end
	if (($emptyOrganics = false) AND ($emptyEquipment = false) AND ($emptyFuel = false))
		setVar $switchboard~message "Please pick [f]uel, [o]rganics and/or [e]quipment to harvest.  pimp {"&#34&"planet name"&#34&"} {f} {o} {e} *"
		gosub :switchboard~switchboard
		halt
	end
	
	
	setVar $om_sdloc $map~stardock
	setVar $totalPlanets 0
	setVar $stripables 0

	gosub :player~quikstats
	setVar $starting_location $player~current_prompt

	if ($starting_location = "Citadel")
		send "q"
		gosub :planet~getplanetinfo
		send "c"
		waitfor "Citadel command"
	elseif ($starting_location = "Planet")
		gosub :planet~getplanetinfo
		send " q l " $planet~planet "* "
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


	if ($player~photons > 0)
		setVar $switchboard~message "You can't have photons while running pimp.  That doesn't make any sense at all.*"
		gosub :switchboard~switchboard
		halt
	end
:inac
	killalltriggers
:myinfo
    if ($player~unlimitedGame = false)
		if ($player~turns < $bot~bot_turn_limit)
			setVar $switchboard~message "I have too few turns to pimp product, script halting.*"
			gosub :switchboard~switchboard
			halt
		end
    end
    if (($player~credits + $target_cash) < 1000000)
		setVar $switchboard~message "I have too little cash on hand, script halting.*"
		gosub :switchboard~switchboard
		halt
    end

:myplanetInfo
    if ($starting_location = "Citadel")
        send "q"
        gosub :planet~getplanetinfo
        send "c"
        waitfor "Citadel command"
    elseif ($starting_location = "Planet")
        gosub :planet~getplanetinfo
    end

    SetVar $totalfuel $planet~planetfuel
	SetVar $totalorg $planet~planetorg
	SetVar $totalequ $planet~planetequip
    if ($starting_location = "Citadel")
		send "q"
    end

    #Empty Holds to Planet
    send "m * * * T * L 1*T*L2*T*L3*S*L1*Q j y"

    seteventtrigger discod1 	:discod     	"CONNECTION LOST"
    seteventtrigger	discod2		:discod     	"Connections have been temporarily disabled."
    waitfor "Command [TL"



:makePlanet
	killalltriggers
	gosub :set_windows
	gosub :player~quikstats
	if (($player~credits < 1000000) AND (($player~genesis <= 0) OR ($player~atomic <= 0)))
		setVar $cashonhand $target_cash
		add $cashonhand $player~credits
		send "l j" #8 $target "* c "
		if ($cashonhand > 5000000)
			send "T T " $player~credits "* "
			send "T F " 5000000 "* "
			setVar $player~credits 5000000
		elseif ($cashonhand > 1000000)
			send "T T " $player~credits "* "
			send "T F " $cashonhand "* "
			setVar $player~credits $cashonhand
		else
			setVar $switchboard~message "I have too little cash on hand, script halting.*"
			gosub :switchboard~switchboard
			halt
		end
		seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
		seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
		setTextLineTrigger getcash :gotcash "credits, and the Treasury has "
		pause
		:gotcash
			getWord CURRENTLINE $target_cash 9
			striptext $target_cash ","
			send "qqq* * "
			gosub :player~quikstats
	end
	if ($player~fighters < 1000)
		setVar $switchboard~message "I have too few fighters on hand, less than 1000. Script halting.*"
		gosub :switchboard~switchboard
		halt
	end
	if ($player~unlimitedGame = false)
		if ($player~turns < $bot~bot_turn_limit)
			setVar $switchboard~message "I have too few turns to pimp product. Script halting.*"
			gosub :switchboard~switchboard
			halt
		end
	end
	if (($player~genesis > 0) AND ($player~atomic > 0))
		send "u y * " #8 #8 $pimp_planet_name "* p q * "
		gosub :set_windows
		add $totalPlanets 1
		killalltriggers
		seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
		seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
		settexttrigger builtPlanet :findPlanet "For building this planet"
		pause
	else
		gosub :restock
		goto :makePlanet
	end


:findplanet
	killalltriggers
	#Find the planet we just created
	send "L"
	seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
	seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
	setTextLineTrigger GetPlanetNum :get_planet_num "> "&$pimp_planet_name
	pause
	pause

:get_planet_num
	setVar $line CURRENTLINE
	striptext $line "<"
	getWord $line $planet~planetNum 1
	stripText $planet~planetNum ">"
	send $planet~planetNum "*"
	#check ore

	gosub :planet~getplanetinfo

	if ((($planet~planetFUEL < $player~total_holds) OR ($emptyFuel = false)) AND (($planet~planetORG < $player~total_holds) OR ($emptyOrganics = false)) AND (($planet~planetEQUIP< $player~total_holds) OR ($emptyEquipment = false)))
		#Blow it up :D
		if (($fuelcolos = "0") and ($orgcolos = "0") and ($equipcolos = "0"))
			killalltriggers
			send "z d y "
			seteventtrigger discod1 	:discod     	"CONNECTION LOST"
			seteventtrigger	discod2		:discod     	"Connections have been temporarily disabled."
			settexttrigger 6 :nodets "You do not have any Atomic Detonators!"
			settexttrigger 7 :makePlanet "Command [TL="
			pause
		end
	end
	add $stripables 1
	send "* "
	killalltriggers
	seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
	seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
	waitfor "Planet command"
	:tryFuel
		killalltriggers
		seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
		seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
		if ($emptyFuel)
			send "t*t1*q l j" #8 $target "* t*l1*q l j" #8 $planet~planetNum "* "
			settexttrigger fuelSuccess :fuelSuccess "You load the "
			settexttrigger fuelEmpty :fuelEmpty "There aren't that many "
			settexttrigger fuelFull :fullplanet "They don't have room for that many "
			pause
		else
			goto :fuelEmpty
		end

	:fuelSuccess
		add $totalFuel $player~total_holds
		gosub :set_windows
		goto :tryFuel
	:fuelEmpty
		killalltriggers
	:tryOrganics
		killalltriggers
		if ($emptyOrganics)
			send "t*t2*q l j" #8 $target "* t*l2*q l j" #8 $planet~planetNum "* "
			seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
			seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
			settexttrigger success :orgSuccess "You load the "
			settexttrigger orgEmpty :tryEquipment "There aren't that many "
			settexttrigger fullFill :fullplanet "They don't have room for that many "
			pause
		else
			goto :orgEmpty
		end

	:orgSuccess
		add $totalOrg $player~total_holds
		gosub :set_windows
		goto :tryOrganics
	:orgEmpty
		killalltriggers
	:tryEquipment
		killalltriggers
		if ($emptyEquipment)
			seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
			seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
			send "t*t3*q l j" #8 $target "* t*l3*q l j" #8 $planet~planetNum "* "
			settexttrigger success :equSuccess "You load the "
			settexttrigger emptyEmpty :emptyPlanet "There aren't that many "
			settexttrigger fullFill :fullplanet "They don't have room for that many "
			pause
		else
			goto :equEmpty
		end
	:equSuccess
		add $totalEqu $player~total_holds
		gosub :set_windows
		goto :tryEquipment
	:equEmpty
		killalltriggers
		goto :emptyPlanet

	:fullPlanet
		killalltriggers
		send "qqqqqq* l j"&#8&$target&"* "
		if ($starting_location = "Citadel")
			send "c "
		end
		setVar $switchboard~message " Planet " & $target & " is full, stopping.*"
		gosub :switchboard~switchboard
		halt

	:emptyPlanet
		killalltriggers
		send "@"
		seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
		seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
		waitfor "Average Interval Lag:"
		send "Q"
		waitfor "Command [TL"
		goto :findplanet

:nodets
	send "QQ* "
	gosub :restock
	goto  :findplanet
 
:restock
	killalltriggers
	setvar $planet~planet $target
	gosub :player~quikstats
	send "d"
	setTextLineTrigger 	figprompt 	:figprompt 		"Fighters:"
	setTextLineTrigger 	nofigprompt :nofigprompt	"Warps to Sector(s) :"
	pause
	:nofigprompt
		killalltriggers
		setVar $switchboard~message "No fighters here to twarp back to.*"
		gosub :switchboard~switchboard
		halt
	:figprompt
		killalltriggers
		getword CURRENTLINE $chkpers 3
		if ($chkpers <> "(yours)")
			getword CURRENTLINE $whichcorp 6
			if ($whichcorp <> "Corp)")
				setVar $switchboard~message "No fighters here to twarp back to.*"
				gosub :switchboard~switchboard
				halt
			end
		end
		send " L Z" & #8 & $PLANET~PLANET & "* p  s  s * * c *"

		# check adj's for Dock.. if present, then we don't need a jump sector.
		setVar $i 1
		setVar $START_SECTOR currentsector
		setVar $WeAreAdjDock FALSE
		while ($i <= SECTOR.WARPCOUNT[$START_SECTOR])
			setVar $adj_start SECTOR.WARPSIN[$START_SECTOR][$i]
			if ($adj_start = $MAP~stardock)
				setVar $WeAreAdjDock TRUE
			end
			add $i 1
		end

		if ((currentalignment < 1000) AND ($WeAreAdjDock = FALSE))
			setVar $player~RED_adj 0
			setvar $player~target $map~stardock
			gosub :player~FindJumpSector
			if ($player~RED_adj = 0)
				waitfor "Command [TL="
				setvar $switchboard~message "Cannot Find Jump Sector Adjacent Dock*"
				gosub :switchboard~switchboard
				send "*"
				send " L Z" & #8 & $PLANET~PLANET & "* p  s  s * * c *"
				return
			end
		end

		if ((currentalignment >= 1000) OR ($WeAreAdjDock))
			getdistance $dist1 $START_SECTOR $MAP~stardock
			getdistance $dist2 $MAP~stardock $START_SECTOR
		else
			getdistance $dist1 $START_SECTOR $player~RED_adj
			getdistance $dist2 $player~RED_adj $START_SECTOR
		end
		if (($dist1 < 0) or $dist2 < 0)
			if (currentalignment >= 1000)
				if ($WeAreAdjDock)
					send "^F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
				else
					send "^F" & $START_SECTOR & "*" & $MAP~stardock & "*F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
				end
			else
				if ($WeAreAdjDock)
					send "^F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
				else
					send "^F" & $START_SECTOR & "*" & $player~RED_adj & "*F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
				end
			end
			setTextLineTrigger noJoy :noJoy "*** Error - No route within"
			setTextTrigger cont :cont "(?="
			pause

			:noJoy
				killAllTriggers
				setvar $switchboard~message "Cannot Find Path to StarDock!*"
				gosub :switchboard~switchboard
				send "*"
				send " L Z" & #8 & $PLANET~PLANET & "* p  s  s * * c *"
				return
			:cont
				killAllTriggers
				setDelayTrigger Latency_Delay		:Latency_Delay 500
				pause

				:Latency_Delay

				Echo "**" & ANSI_14 & "Please Stand By" & ANSI_15 & " - Calculating Distances...**"
				if ((currentalignment >= 1000) OR ($WeAreAdjDock))
					getdistance $dist1 $START_SECTOR $MAP~stardock
				else
					getdistance $dist1 $START_SECTOR $player~RED_adj
				end
		end
			if ($dist1 <= 0)
				setvar $switchboard~message "Insufficient Warp Data Plotting Course to Dock*"
				gosub :switchboard~switchboard
				send "*"
				send " L Z" & #8 & $PLANET~PLANET & "* p  s  s * * c *"
				return
			end

			getdistance $dist2 $MAP~stardock $START_SECTOR
			if ($dist2 <= 0)
				setvar $switchboard~message "Insufficient Warp Data Plotting Return Course From Dock*"
				gosub :switchboard~switchboard
				send "*"
				send " L Z" & #8 & $PLANET~PLANET & "* p  s  s * * c *"
				return
			end

			setVar $ore_req (($dist1 + $dist2) * 3)

			if ($PLAYER~ORE_HOLDS < $ore_req)
				send "q  t*l2* t*l3* t*t1* c "
				gosub :player~quikstats
				if ($PLAYER~ORE_HOLDS < $ore_req)
					setvar $switchboard~message "Not Enough ORE In Holds To Make Round Trip.  Needs "&$ore_req&".*"
					gosub :switchboard~switchboard
					send "*"
					send " L Z" & #8 & $PLANET~PLANET & "* p  s  s * * c *"
					halt

				end
			end

			if ($PLAYER~TWARP_TYPE = "No")
				setvar $switchboard~message "Must Have Twarp 1 or 2*"
				gosub :switchboard~switchboard
				send "*"
				send " L Z" & #8 & $PLANET~PLANET & "* p  s  s * * c *"
				halt
			end

			if ($PLAYER~unlimitedGame = 0)
				gosub :TurnsRequired
				if ($turnsRequired > currentturns)
					setvar $switchboard~message "Not Enough Turns. "&$turnsRequired&", Required*"
					gosub :switchboard~switchboard
					send "*"
					send " L Z" & #8 & $PLANET~PLANET & "* p  s  s * * c *"
					return
				elseif ($turnsRequired <= currentturns)
					setVar $tmp (currentturns - $turnsRequired)
					if ($tmp <= $bot~bot_turn_limit)
						setvar $switchboard~message "Proceeding Will Leave Fewer Than " & $bot~bot_turn_limit & " Turns!*"
						gosub :switchboard~switchboard
						send "*"
						send " L Z" & #8 & $PLANET~PLANET & "* p  s  s * * c *"
						return
					end
				end
			end

		send " C R " & $MAP~stardock & "*"
		setTextLineTrigger itsalive :itsalive "Items     Status  Trading % of max OnBoard"
		setTextLineTrigger nosoupforme :nosoupforme "I have no information about a port in that sector"
		pause
		:nosoupforme
			killAllTriggers
			setvar $switchboard~message "StarDock appears to have been Blown Up!*"
			gosub :switchboard~switchboard
			send "q*"
			send " L Z" & #8 & $PLANET~PLANET & "* p  s  s * * c *"
			return
		:itsalive
			killAllTriggers
			waitfor "(?="
			setVar $msg ""
			if ((currentalignment >= 1000) AND ($WeAreAdjDock = FALSE))
				setVar $warpto $MAP~stardock
				gosub :DoTwarp
			elseif (($WeAreAdjDock = FALSE) AND ($player~RED_adj <> 0))
				setVar $warpto $player~RED_adj
				gosub :DoTwarp
			else
				send "q q q *  m " & $MAP~stardock & "*  *  P  S G Y G Q "
			end
			if ($msg = "")
				waitfor "You leave the Galactic Bank."
			else
				setvar $switchboard~message "Unknown Problem Detected. Check TA!*"
				gosub :switchboard~switchboard
				send "*"
				halt
			end
			gosub :PLAYER~quikstats

:buytorps
	killalltriggers
	seteventtrigger 	discod1 	:discod     	"CONNECTION LOST"
	seteventtrigger		discod2		:discod     	"Connections have been temporarily disabled."
	settexttrigger torps :torps "How many Genesis Torpedoes do you want"
	settexttrigger dets  :dets  "How many Atomic Detonators do you want"
	send "HT"
	pause
	pause

:torps 
	GetWord CURRENTLINE $numtorps 9
	StripText $numtorps ")"
	send $numtorps & "*"
	send "A"
	pause

:dets 
	GetWord CURRENTLINE $numdets 9
	StripText $numdets ")"
	send $numdets & "*"
	send "Q Q M " & $player~current_sector & " * Y Y "
	settexttrigger nofig :nofig "Do you want to make this jump blind?"
	settexttrigger ready3 :ready3 "All Systems Ready, shall we engage?"
	settexttrigger nofuel :nofuel "You do not have enough Fuel Ore to make the jump"
	pause
	pause

:ready3
	
	waitfor "Command [TL"
	send "l "&$target&"* t n l 1* q q * j y * "
	Return


:planetfull
    setVar $switchboard~message "Planet is full. script halting.*"
	gosub :switchboard~switchboard
    send "QQ*"


:finish
    halt


:DoTwarp
	setVar $msg ""
	if ($warpto > 0)
		send "q q q * * mz" & $warpto "*"
		setTextTrigger there        :adj_warp "You are already in that sector!"
		setTextLineTrigger adj_warp :adj_warp "Sector  : " & $warpto & " "
		setTextTrigger locking      :locking "Do you want to engage the TransWarp drive?"
		setTextTrigger igd          :twarpIgd "An Interdictor Generator in this sector holds you fast!"
		setTextTrigger noturns      :twarpPhotoned "Your ship was hit by a Photon and has been disabled"
		setTextTrigger noroute      :twarpNoRoute "Do you really want to warp there? (Y/N)"
		pause
		:adj_warp
			killAllTriggers
			send "z*"
			goto :twarp_adj
		:locking
			killAllTriggers
			send "y"
			setTextLineTrigger twarp_lock 		:twarp_lock "TransWarp Locked"
			setTextLineTrigger no_twrp_lock 	:no_twarp_lock "No locating beam found"
			setTextLineTrigger twarp_adj 		:twarp_adj "<Set NavPoint>"
			setTextLineTrigger no_fuel 		:itwarpNoFuel "You do not have enough Fuel Ore"
			pause
		:twarpNoFuel
			killAllTriggers
			setVar $msg "Not enough fuel for T-warp."
			goto :twarpDone

		:twarp_adj
			killAllTriggers
			send " * p s"
			goto :twarpDone

		:twarpNoRoute
			killAllTriggers
			send "n* z* "
			setVar $msg "No route available!"
			goto :twarpDone

		:no_twarp_lock
			killAllTriggers
			send "n*zn"
			send "l " & #8 & $PLANET~PLANET "*c"
			setSectorParameter $warpto "FIGSEC" FALSE
			setvar $msg "no twarp lock"
			return

		:twarpIgd
			killAllTriggers
			setVar $msg "My ship is being held by Interdictor!"
			goto :twarpDone

		:twarpPhotoned
			killAllTriggers
			setVar $msg "I have been photoned and can not T-warp!"
			goto :twarpDone

		:twarp_lock
			KillAlltriggers
			if (currentalignment >= 1000)
				setVar $str "y * * p s g y g q " 
				send $str
			else
				setVar $str "y  *  *  m " & $MAP~stardock & " *  *  p s g y g q "
				send $str
			end
		:twarpDone
			if ($msg <> "")
				setvar $switchboard~message "Twarp Error - " & $msg & "*"
				gosub :switchboard~switchboard
				send "*"
			end
	end
	return

:bwarp

	killAllTriggers
	send "b" $warpto "*"
	setTextTrigger go :go5 "TransWarp Locked"
	setTextTrigger no :no5 "No locating beam found"
	goSub :delayTrigger
	pause

:no5
	killAllTriggers
	send "n "
	waitfor "Transporter shutting down."
	return

:go5
	killAllTriggers
	send "y z * "
	return


:TurnsRequired
	send "i"
	setTextLineTrigger TurnsRequired_TPW	:TurnsRequired_TPW "Turns to Warp  : "
	pause

	:TurnsRequired_TPW
	killAllTriggers
	getWord CURRENTLINE $turnsRequired_TPW 5

	if ($player~RED_adj > 0)
		# twarp to jmp sector, then into SD sect, then twarp home
		setVar $turnsRequired_temp ($turnsRequired_TPW * 3)
		if ($_Tow > 0)
			# 2 Turns for exporting into other ship and back again
			add $turnsRequired_temp_temp 2
			# 3 Turns for initial Port then x into other ship, port & shop, then x and report
			#   b4 heading home
			add $turnsRequired_temp 3
		else
			add $turnsRequired_temp 1
		end
	else
		setVar $turnsRequired_temp ($turnsRequired_TPW * 2)
		# 1 Turn to port at dock
		add $turnsRequired_temp 1
	end

	setVar $turnsRequired $turnsRequired_temp
	return


:callSaveMe
	send "q q q q * '"&$SWITCHBOARD~bot_name&" call*"
	halt




:set_windows
	if ($player~unlimitedGame)
		setVar $window_content "Planet fuel:  "&$totalfuel&" out of "&$totalfuelmax&"*Planet Org:   "&$totalorg&" out of "&$totalorgmax&"*Planet Equip: "&$totalEqu&" out of "&$totalequmax&"*Cash:         "&$player~credits&"   Genesis Torps:  "&$player~genesis&"*Fighters:     "&$player~fighters&"   Atomic Dets:    "&$player~atomic&"*Turns:     Unlimited*"&$stripables&" out of "&$totalPlanets&" planets have had product on them.*"
	else
		setVar $window_content "Planet fuel:  "&$totalfuel&" out of "&$totalfuelmax&"*Planet Org:   "&$totalorg&" out of "&$totalorgmax&"*Planet Equip: "&$totalEqu&" out of "&$totalequmax&"*Cash:         "&$player~credits&"   Genesis Torps:  "&$player~genesis&"*Fighters:     "&$player~fighters&"   Atomic Dets:    "&$player~atomic&"*Turns:        "&$player~turns&"*"&$stripables&" out of "&$totalPlanets&" planets have had product on them.*"
	end
	setWindowContents prodpimp $window_content
	replaceText $window_content "*" "[][]"
	saveVar $window_content
return	


:discod
	setVar $TagLine				"[product pimp]"
	setVar $TagLineB			"[product pimp]"
	killalltriggers
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
		killalltriggers
		gosub :player~quikstats
		if ($player~current_prompt = "Command")
			send " L Z" & #8 & $target & "*  *  J  C  *  "
			setTextLineTrigger	NotLanded	:NotLanded		"Are you sure you want to jettison all cargo?"
			setTextLineTrigger	Landed		:Landed			"<Enter Citadel>"
			setDelayTrigger		TestConn	:TestConn		3000
			pause
			:TestConn
				killalltriggers
				if (CONNECTED = false)
					goto :Disco_Test
				else
					send ("'{" &$switchboard~bot_name& "} - " & $TagLineB & " Problem Detected Unable to Land!*")
					halt
				end
			:NotLanded
				killalltriggers
				send ("'{" &$switchboard~bot_name& "} - Boton Unable To Land, Check my TA.*")
				send ("'{" & $switchboard~bot_name & "} "&$TagLineB&" - Unable To Land After Reconnect,Check My TA!**")
				halt
			:Landed
				killalltriggers
				send ("'{" & $switchboard~bot_name & "} "&$TagLineB&" - Restarting!**")
				waitfor "Message sent on sub-space channel"
				goto :inac
		elseif ($player~current_prompt = "Planet")
				send ("  q q q q q  * * '" & $TagLineB & " Attempting to Reach Correct Prompt...*")
			setTextLineTrigger	EMQ_COMPLETE		:EMQ_DELAY "Attempting to Reach Correct Prompt..."
			setDelayTrigger 	EMQ_DELAY		:EMQ_DELAY 3000
			pause
		elseif ($player~current_prompt = "Citadel")
			send ("'{" & $switchboard~bot_name & "} "&$TagLineB&" - Restarting!**")
			waitfor "Message sent on sub-space channel"
				goto :inac
			else
				send (" p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '" & $TagLineB & " Attempting to Reach Correct Prompt...*")
			setTextLineTrigger	EMQ_COMPLETE		:EMQ_DELAY "Attempting to Reach Correct Prompt..."
			setDelayTrigger 	EMQ_DELAY		:EMQ_DELAY 3000
			pause
			:EMQ_DELAY
				killalltriggers
				goto :Disco_Test
		end

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\findjumpsector\player"
include "source\bot_includes\planet\getplanetinfo\planet"
