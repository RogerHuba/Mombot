:balance
	if ($TLPlanets[$data~farmSector] > $game~MAX_PLANETS_PER_SECTOR)
		setVar $j 1
		setvar $planet~planets_to_move ($TLPlanets[$data~farmSector] - $game~MAX_PLANETS_PER_SECTOR)
		setvar $planet~planets_moved 0 
		while ($j <= $planet~planetCount)
			if ($planet~planetToFill <> $planet~planets[$j])
				send "l " & #8 & $planet~planets[$j] & "* "
				gosub :PLANET~getPlanetInfo
				if (($planet~planet_FUEL >= 5000) and ($planet~CITADEL >= 4))
					setvar $k 11
					while ($k <= SECTORS)
						getSectorParameter $k $bot~parameter $isTargettedSector
						if (($isTargettedSector = true) and ($TLPlanets[$k] < $game~MAX_PLANETS_PER_SECTOR))
							killtrigger 1
							killtrigger 2
							killtrigger 3
							send "c p "& $k &"  *ys* "
							settextlinetrigger 1 :warp_it_balance "All Systems Ready, shall we engage?"
							settextlinetrigger 2 :no_warp_balance "You do not have any fighters in Sector"
							setTextLineTrigger 3 :warp_it_balance "You are already in that sector!"
							pause			

							:warp_it_balance
								setvar $TLPlanets[$k] ($TLPlanets[$k] + 1)
								setvar $TLPlanets[$data~farmSector] ($TLPlanets[$data~farmSector] - 1)
								setvar $player~startinglocation "Citadel"
								setVar $PLAYER~warpto $data~farmSector
								gosub :player~quikstats
								gosub :player~twarp
								gosub  :player~currentPrompt
								if ($PLAYER~twarpSuccess <> TRUE)
									setvar $switchboard~message "Twarp failed during planet balancing. "&$player~msg&" Halting!*"
									gosub :switchboard~switchboard
									halt
								end
								add $planet~planets_moved 1
								if ($planet~planets_moved >= $planet~planets_to_move)
									goto :done_moving_planets
								end

							:no_warp_balance					
								killtrigger 1
								killtrigger 2
								killtrigger 3
								goto :done_moving_this_planet
						end
						add $k 1
					end
				end
				:done_moving_this_planet
				send "qq* "
			end
			add $j 1
		end
	end
return

:count
	send "qq*  |l"
	waitOn "Registry# and Planet Name"
	setVar $planet~planetCount 0
	killalltriggers
	setTextLineTrigger planetGrabber :planetline "   <"
	setTextLineTrigger beDone :done "Land on which planet "
	setTextLineTrigger noplanets :done "You can create one with a Genesis Torpedo."
	send "* |"
	pause
	:planetline
		killalltriggers
		getWordPos CURRENTLINE $pos "<<<< SHIELDED"
		if ($pos <= 0)
			setVar $line CURRENTLINE
			replacetext $line "<" " "
			replacetext $line ">" " "
			striptext $line ","
			add $planet~planetCount 1
			getWord $line $planet~planets[$planet~planetCount] 1
		end
		setTextLineTrigger getLine2 :planetline "   <"
		setTextLineTrigger getend :done "Land on which planet "
		pause
	:done
		killalltriggers
return



:build
	killalltriggers
	setTextLineTrigger port_blown1 :buildplanetsend "<=-DANGER-=>  Scanners indicate massive debris and heavy"
	setTextLineTrigger port_here1 :buildnext "Class"
	setTextLineTrigger needs_port1 :buildnext "Warps to Sector(s)"
	send "qqzn*"
	pause

:buildnext
	killalltriggers
	setVar $doneWithPlanets FALSE
	setVar $tempPlanetCount ($planet~planetCount)
	loadVar $GAME~MAX_PLANETS_PER_SECTOR
	setVar $planet~planetsPerSector2 $GAME~MAX_PLANETS_PER_SECTOR
	subtract $tempPlanetCount 1
	send "qqzn * l " & #8 & $planet~planetToFill & "*mnt* qq* "
	setvar $planet~planetsPerSector2 ($planet~planetsPerSector2 - $tempPlanetCount)
	if (($tempPlanetCount > 0) AND ($one_per_sector = TRUE))
		setvar $status_message "Already a planet in this sector."
		gosub :setWindow
		goto :buildplanetsend
	end
	if ($planet~planetsPerSector2 <= 0)
		goto :buildplanetsend
	end
	setvar $status_message "Building planets in sector "&$PLAYER~CURRENT_SECTOR&"*    (Needs "&$planet~planetsPerSector2&" planet(s))"
	gosub :setWindow

:LetsGoAgain
	gosub :PLAYER~quikstats
	if (($PLAYER~ATOMIC < 1) OR ($PLAYER~GENESIS < 1))
			gosub :get_dets
	end
	send "u y"
	setTextLineTrigger NoOverLoad	:NoOverload "What do you want to name this planet?"
	setTextLineTrigger Yikes		:Yikes      "I'm sorry, but not enough free matter exists."
	setTExtLineTrigger NeedGenTs	:NeedGenTs  "You don't have any Genesis Torpedoes to launch!"
	setTextTrigger     OverLoad 	:Overload   "Do you wish to abort?"
	pause

:NeedGenTs
	killAllTriggers
	send " Q "
	setVar $SWITCHBOARD~message "Cannot pop a planet - out of genesis torpedoes.*"
	gosub :SWITCHBOARD~switchboard
	goto :buildplanetsend

:Yikes
	killAllTriggers
	setVar $SWITCHBOARD~message "Bad news - game maximum planets reached.*"
	gosub :SWITCHBOARD~switchboard
	goto :buildplanetsend

:Overload
	killTrigger Overload
	send "n"
	pause

:NoOverload
	killAllTriggers
	getWord CURRENTLINE $planet~planet_type 11
	lowercase $planet~planet_type
	striptext $planet~planet_type ")"
	#echo $planet~planet_type&"*"

	setVar $i 1
	setVar $foundPlanet FALSE
	setVar $isAKeeper FALSE
	while (($i <= $planet~planetcounter) AND ($foundPlanet = FALSE))
		lowercase $planet~planetList[$i]
		lowercase $planet~planet_type
		getWordPos $planet~planetList[$i] $pos $planet~planet_type
		if ($pos > 0)
			setVar $isAKeeper $planet~planetList[$i][7]
			setVar $foundPlanet TRUE
		end
		add $i 1
	end
	if ($isAKeeper = TRUE)
		getRnd $planet~planet_pointer 1 1000
		setVar $first_part $planet~planet_names[$planet~planet_pointer]
		getWord $first_part $first_half 1
		getRnd $planet~planet_pointer 1 1000
		setVar $second_part $planet~planet_names[$planet~planet_pointer]
		getRnd $flip_a_coin 1 2
		getWord $second_part $last_half $flip_a_coin
		if (($last_half = "")  OR ($last_half = "0"))
			getWord $second_part $last_half 1
		end
		setVar $planet~planetLabel $first_half&" "&$last_half
		setVar $name_the_planet $planet~planetLabel

	else
		getRnd $PTag 100000 999999
		setVar $planet~planetLabel "["&$PTag&"]"&"M()M Planet Farm "&"["&$PTag&"]"
	end
	send $planet~planetLabel & "*"

#=------------------------ Planet's Been Popped ---------------------------------------
	killtrigger makingitcorp
	killtrigger letsgo
	setTextTrigger MakingItCorp     :MakingItCorp "Should this be a (C)orporate planet or (P)ersonal planet? "
	setTextTrigger LetsGo		:LetsGo       "Command [TL="
	pause

:MakingItCorp
	send "c"
	pause

:LetsGo
	killtrigger makingitcorp
	if ($planet~planetLabel <> $name_the_planet)
		send "|l|"
		setTextLineTrigger Plisted		:Plisted "-----------------------------------------------"
		setTextTrigger Landed			:Landed "Planet command (?="
		pause

		:Plisted
				waitfor "> " & $planet~planetLabel
				getText CURRENTLINE $landing "<" ">"
				striptext $landing " "
				send $planet~planetToFill & "*"
				pause
		:Landed
		killtrigger plisted
		if ($nostrip = FALSE)
			# add in code to strip the plant if there is product
				setVar $BOT~command "mover"
				setVar $BOT~user_command_line "strip "&$landing&" f o e turbo silent"
				setVar $BOT~parm1 "strip"
				saveVar $BOT~parm1
				setVar $BOT~parm2 $landing
				saveVar $BOT~parm2
				saveVar $BOT~command
				saveVar $BOT~user_command_line
				load "scripts\"&$bot~mombot_directory&"\modes\resource\mover.cts"
				setEventTrigger		stripended		:stripendedbuild "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\mover.cts"
				pause
				:stripendedbuild
		end
				:blow_planet_dud
				killAllTriggers
				send "qq*l"&$landing&"*"
				waitOn "Planet command (?="
				send "  z  d  y  "
				setTextLineTrigger NoDets	:NoDets "You do not have any Atomic Detonators!"
				setTextTrigger KaBoom		:KaBoom "Command [TL="
				pause

		:NoDets
				killTrigger kaboom
				setVar $SWITCHBOARD~message "Out Of Atomic Dets*"
				gosub :SWITCHBOARD~switchboard
				gosub :get_dets
				goto :blow_planet_dud

		:KaBoom
				killtrigger nodets
				goto :LetsGoAgain
	else
		killAllTriggers
		subtract $planet~planetsPerSector2 1
		if (($planet~planetsPerSector2 <= 0) OR ($one_per_sector = TRUE))
			 goto :buildplanetsend
		else
			goto :LetsGoAgain
		end
	end

:buildplanetsend
	killalltriggers
	return

:end
	killalltriggers
	if ($merch)
		gosub :merch
	end
	send "p " & $home & "  *ys* "
	setVar $SWITCHBOARD~message "Farming run is complete.*"
	gosub :SWITCHBOARD~switchboard
	gosub :PLAYER~quikstats
	if ($PLAYER~CURRENT_SECTOR <> $home)
		setVar $SWITCHBOARD~message "Could not make it back to starting sector!*"
	end
return

:colonize
	if (($planet~planet_FUEL_COLONISTS < ($planet~planet_FUEL_COLONISTS_MAX-1000)) OR ($planet~planet_ORGANICS_COLONISTS < ($planet~planet_ORGANICS_COLONISTS_MAX-1000)) OR ($planet~planet_EQUIPMENT_COLONISTS < ($planet~planet_EQUIPMENT_COLONISTS_MAX-1000)))
		killalltriggers
		setvar $status_message "Colonizing Planet"
		gosub :setWindow
		send "qq* l " & #8 & $planet~planetToFill & "*m n t * q l " & #8 & $planet~planets[$j] & "* c"
		waitfor "Planet command (?"
		setVar $BOT~command "colo"
		setVar $BOT~user_command_line " s 50 silent "
		setVar $BOT~parm1 "s"
		setVar $BOT~parm2 "50"
		saveVar $BOT~parm1
		saveVar $BOT~parm2
		saveVar $BOT~command
		saveVar $BOT~user_command_line
		load "scripts\"&$bot~mombot_directory&"\modes\resource\colo.cts"
		setEventTrigger		coloended		:coloended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\colo.cts"
		pause
		:coloended
			send "qq* "
	end
	send "l " & #8 & $planet~planets[$j] & "* "
	gosub :PLANET~getPlanetInfo
	lowercase $planet~planet_CLASS
return

:merch
	setVar $BOT~command "merch"
	if ($half = true)
		loadvar $game~port_max
		setvar $half_port_max $game~port_max
		divide $half_port_max 2
		setVar $bot~user_command_line " merch "&$half_port_max&" o e buyfuel skipcim half silent"
	else
		setVar $bot~user_command_line " merch 10000 o e skipcim buyfuel silent"
	end
	setVar $bot~parm1 "10000"
	saveVar $bot~parm1
	saveVar $BOT~command
	saveVar $bot~user_command_line
	load "scripts\"&$bot~mombot_directory&"\modes\cashing\merch.cts"
	setEventTrigger		merchended		:merchended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\cashing\merch.cts"
	pause
	:merchended
return

:pwarp
	send "p "& $player~warpto &"  *ys* "
	settextlinetrigger 1 :warp_its "All Systems Ready, shall we engage?"
	settextlinetrigger 2 :no_warps "You do not have any fighters in Sector"
	setTextLineTrigger 3 :warp_its "You are already in that sector!"
	pause

	:no_warps
		killtrigger 1
		killtrigger 2
		killtrigger 3
		setVar $success FALSE
	return
	:warp_its
		killtrigger 1
		killtrigger 2
		killtrigger 3
		setVar $success TRUE
	return

:neg
	gosub :land_on_farm_planet
	setVar $BOT~command "neg"
	if ($half = true)
		setVar $bot~user_command_line " neg o e half silent"
	else
		setVar $bot~user_command_line " neg o e silent"
	end

	setVar $bot~parm1 "o"
	saveVar $bot~parm1
	setVar $bot~parm2 "e"
	saveVar $bot~parm2
	saveVar $BOT~command
	saveVar $bot~user_command_line
	load "scripts\"&$bot~mombot_directory&"\commands\cashing\neg.cts"
	setEventTrigger		negended		:negended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\cashing\neg.cts"
	pause
	:negended
return


:strip
	gosub :land_on_farm_planet
	setVar $options ""
	if ($get_fuel)
		setVar $options $options&" f "
	end
	if ($get_org)
		setVar $options $options&" o "
	end
	if ($get_equip)
		setVar $options $options&" e "
	end
	if ($get_figs)
		setVar $options $options&" fig "
	end
	setvar $status_message "Stripping planet product ("&$options&")"
	gosub :setWindow
	killalltriggers
	setVar $BOT~command "mover"
	setVar $BOT~user_command_line "strip "&$planet~planets[$j]&" "&$options&" silent turbo*"
	setVar $BOT~parm1 "strip"
	saveVar $BOT~parm1
	setVar $BOT~parm2 $planet~planets[$j]
	saveVar $BOT~parm2
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\"&$bot~mombot_directory&"\modes\resource\mover.cts"
	setEventTrigger		stripended		:stripended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\mover.cts"
	pause
	:stripended
	send "q "
	gosub :planet~getplanetinfo
	gosub :fillplanetstats
	send "q * "
end
return

:colo
	send "qq* jy* l " & #8 & $planet~planetToFill & "*  "
	gosub :planet~getplanetinfo
	gosub :fillplanetstats

	setVar $cyclebuffer 0
	setVar $cyclebufferlimit 20
	send "qq* jy* l " & #8 & $planet~planets[$j] & "*  "
	gosub :planet~getplanetinfo

	#remove fuel colos
	setVar $COLOS $planet~planet_FUEL_COLONISTS
	setVar $COLOS_MAX $planet~planet_FUEL_COLONISTS_MAX
	setvar $status_message "Stripping Fuel Colonists"
	setVar $moveColo "fuel"
	setVar $type 1
	gosub :remove_colos

	#add fuel colos
	setVar $COLOS $planet~planet_FUEL_COLONISTS
	setVar $COLOS_MIN $planet~planet_FUEL_COLONISTS_MIN
	setVar $type 1
	setVar $moveColo "fuel"
	setvar $status_message "Adding Fuel Colonists"
	gosub :add_colos

	#remove org colos
	setVar $COLOS $planet~planet_ORGANICS_COLONISTS
	setVar $COLOS_MAX $planet~planet_ORGANICS_COLONISTS_MAX
	setvar $status_message "Stripping Organics Colonists"
	setVar $moveColo "org"
	setVar $type 2
	gosub :remove_colos

	#add org colos
	setVar $COLOS $planet~planet_ORGANICS_COLONISTS
	setVar $COLOS_MIN $planet~planet_ORGANICS_COLONISTS_MIN
	setVar $type 2
	setVar $moveColo "org"
	setvar $status_message "Adding Organics Colonists"
	gosub :add_colos

	#remove equip colos
	setVar $COLOS $planet~planet_EQUIPMENT_COLONISTS
	setVar $COLOS_MAX $planet~planet_EQUIPMENT_COLONISTS_MAX
	setvar $status_message "Stripping Equip Colonists"
	setVar $moveColo "equip"
	setVar $type 3
	gosub :remove_colos

	#add equip colos
	setVar $COLOS $planet~planet_EQUIPMENT_COLONISTS
	setVar $COLOS_MIN $planet~planet_EQUIPMENT_COLONISTS_MIN
	setVar $type 3
	setVar $moveColo "equip"
	setvar $status_message "Adding Equip Colonists"
	gosub :add_colos
return

:land_on_farm_planet
	if ($planet~CITADEL > 0)
		send "qq* l " & #8 & $planet~planets[$j] & "* c "
	else
		send "qq* l " & #8 & $planet~planets[$j] & "*"							
	end
return

:add_shields
	if ($PLAYER~SHIELDS < 2000)
			send "qq* l " & #8 & $planet~planetToFill & "*"
			gosub :PLANET~getPlanetInfo
			gosub :fillplanetstats
			if ($planet~SHIELD_POWER < 200)
					setVar $shield FALSE
					send "qq* "
			else
					send "cgf200*qq* "
			end
	else
			send "qq* l " & #8 & $planet~planets[$j] & "* c gt200*"
	end
return

:warp_and_sell
	gosub :land_on_farm_planet
	gosub :merch
	send "d"
	waitOn "Citadel treasury contains "
	getWord CURRENTLINE $planet~CITADELCash 4
	stripText $planet~CITADELCash ","
	if ($planet~CITADELCash > 0)
		if ($planet~CITADELCash > 999999999) or (($planet~CITADELCash +  $PLAYER~CREDITS) > 999999999)
			setVar $planet~CITADELCash (999999999 - $PLAYER~CREDITS)
		else
			setVar $planet~CITADELCash ($planet~CITADELCash + $PLAYER~CREDITS)
		end
		send "t f " & $planet~CITADELCash & "* qq* l " & #8 & $planet~planetToFill & "* c t t " & $planet~CITADELCash & "* "
	end
return

:set_defense
	if ($planet~CITADEL >= 3)
		send "cls0*la100*q "                        	
	end
return

:barricade
	if (($planet~planet_FUEL > 10000) AND ($planet~CITADEL >= 4))
		send "c  "
		setVar $player~warpto $home
		gosub :pwarp
		send "q  "
		if ($success = TRUE)
			setVar $planets~movefig TRUE
		else
			setVar $planets~movefig FALSE
		end
	else
		setVar $planets~movefig FALSE
	end
return

:movefig
	setVar $BOT~user_command_line "s silent"
	saveVar $BOT~user_command_line
	setEventTrigger		movefigended		:movefigended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
	load "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
	pause
	:movefigended	                    
return

:armageddon
	setVar $BOT~user_command_line "s silent"
	saveVar $BOT~user_command_line
	setEventTrigger		1		:movefigarmended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
	load "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
	pause
	:movefigarmended	                    

	gosub :PLAYER~quikstats
	if ($PLAYER~CURRENT_PROMPT = "Citadel")
		send "q "
	end
	

	:blow_it_again
		if ($PLAYER~ATOMIC < 1)
			gosub :get_dets
			send "l " & #8 & $planet~planets[$j] & "*"
		end
		killtrigger 1
		killtrigger 2
		send "zay"&$PLAYER~FIGHTERS&"**dy"
		send "  z  d  y  "
		setTextLineTrigger 1	:no_deteonators "You do not have any Atomic Detonators!"
		setTextTrigger 2		:pop "Command [TL="
		pause

	:no_deteonators
		killTrigger 2
		setVar $SWITCHBOARD~message "Out Of Atomic Dets*"
		gosub :SWITCHBOARD~switchboard
		gosub :get_dets
		goto :blow_it_again

	:pop
		killtrigger 1
		killtrigger 2

	goto :doneWithThisPlanet
return

:adjust_colonist_levels
	#AUTOMATICALLY ADJUST COLOS
	if ($planet~planet_FUEL_COLONISTS > $planet~planet_FUEL_COLONISTS_MAX)
		setVar $extra_colos ($planet~planet_FUEL_COLONISTS-$planet~planet_FUEL_COLONISTS_MAX)
		if ($planet~planet_ORGANICS_COLONISTS < $planet~planet_ORGANICS_COLONISTS_MAX)
			setVar $colos_needed ($planet~planet_ORGANICS_COLONISTS_MAX-$planet~planet_ORGANICS_COLONISTS)
			if ($colos_needed >= $extra_colos)
				setVar $colos_to_move $extra_colos
			else
				setVar $colos_to_move $colos_needed
			end
			setVar $extra_colos ($extra_colos - $colos_to_move)
			setVar $planet~planet_ORGANICS_COLONISTS ($planet~planet_ORGANICS_COLONISTS+$colos_to_move)
			setVar $planet~planet_FUEL_COLONISTS ($planet~planet_FUEL_COLONISTS-$colos_to_move)
			if ($colos_to_move > 0)
				send "p*1"&$colos_to_move&"*2"
				gosub :waiton
			end
		end
		if ($planet~planet_EQUIPMENT_COLONISTS < $planet~planet_EQUIPMENT_COLONISTS_MAX)
			setVar $colos_needed ($planet~planet_EQUIPMENT_COLONISTS_MAX-$planet~planet_EQUIPMENT_COLONISTS)
			if ($colos_needed >= $extra_colos)
				setVar $colos_to_move $extra_colos
			else
				setVar $colos_to_move $colos_needed
			end
			setVar $extra_colos ($extra_colos - $colos_to_move)
			setVar $planet~planet_EQUIPMENT_COLONISTS ($planet~planet_EQUIPMENT_COLONISTS+$colos_to_move)
			setVar $planet~planet_FUEL_COLONISTS ($planet~planet_FUEL_COLONISTS-$colos_to_move)
			if ($colos_to_move > 0)
				send "p*1"&$colos_to_move&"*3"
				gosub :waiton
			end
		end
	end
	if ($planet~planet_ORGANICS_COLONISTS > $planet~planet_ORGANICS_COLONISTS_MAX)
		setVar $extra_colos ($planet~planet_ORGANICS_COLONISTS-$planet~planet_ORGANICS_COLONISTS_MAX)
		if ($planet~planet_FUEL_COLONISTS < $planet~planet_FUEL_COLONISTS_MAX)
			setVar $colos_needed ($planet~planet_FUEL_COLONISTS_MAX-$planet~planet_FUEL_COLONISTS)
			if ($colos_needed >= $extra_colos)
				setVar $colos_to_move $extra_colos
			else
				setVar $colos_to_move $colos_needed
			end
			setVar $extra_colos ($extra_colos - $colos_to_move)
			setVar $planet~planet_FUEL_COLONISTS ($planet~planet_FUEL_COLONISTS+$colos_to_move)
			setVar $planet~planet_ORGANICS_COLONISTS ($planet~planet_ORGANICS_COLONISTS-$colos_to_move)
			if ($colos_to_move > 0)
				send "p*2"&$colos_to_move&"*1"
				gosub :waiton
			end
		end
		if ($planet~planet_EQUIPMENT_COLONISTS < $planet~planet_EQUIPMENT_COLONISTS_MAX)
			setVar $colos_needed ($planet~planet_EQUIPMENT_COLONISTS_MAX-$planet~planet_EQUIPMENT_COLONISTS)
			if ($colos_needed >= $extra_colos)
				setVar $colos_to_move $extra_colos
			else
				setVar $colos_to_move $colos_needed
			end
			setVar $extra_colos ($extra_colos - $colos_to_move)
			setVar $planet~planet_EQUIPMENT_COLONISTS ($planet~planet_EQUIPMENT_COLONISTS+$colos_to_move)
			setVar $planet~planet_ORGANICS_COLONISTS ($planet~planet_ORGANICS_COLONISTS-$colos_to_move)
			if ($colos_to_move > 0)
				send "p*2"&$colos_to_move&"*3"
				gosub :waiton
			end
		end
	end
	if ($planet~planet_EQUIPMENT_COLONISTS > $planet~planet_EQUIPMENT_COLONISTS_MAX)
		setVar $extra_colos ($planet~planet_EQUIPMENT_COLONISTS-$planet~planet_EQUIPMENT_COLONISTS_MAX)
		if ($planet~planet_ORGANICS_COLONISTS < $planet~planet_ORGANICS_COLONISTS_MAX)
			setVar $colos_needed ($planet~planet_ORGANICS_COLONISTS_MAX-$planet~planet_ORGANICS_COLONISTS)
			if ($colos_needed >= $extra_colos)
				setVar $colos_to_move $extra_colos
			else
				setVar $colos_to_move $colos_needed
			end
			setVar $extra_colos ($extra_colos - $colos_to_move)
			setVar $planet~planet_ORGANICS_COLONISTS ($planet~planet_ORGANICS_COLONISTS+$colos_to_move)
			setVar $planet~planet_EQUIPMENT_COLONISTS ($planet~planet_EQUIPMENT_COLONISTS-$colos_to_move)
			if ($colos_to_move > 0)
				send "p*3"&$colos_to_move&"*2"
				gosub :waiton
			end
		end
		if ($planet~planet_FUEL_COLONISTS < $planet~planet_FUEL_COLONISTS_MAX)
			setVar $colos_needed ($planet~planet_FUEL_COLONISTS_MAX-$planet~planet_FUEL_COLONISTS)
			if ($colos_needed >= $extra_colos)
				setVar $colos_to_move $extra_colos
			else
				setVar $colos_to_move $colos_needed
			end
			setVar $extra_colos ($extra_colos - $colos_to_move)
			setVar $planet~planet_FUEL_COLONISTS ($planet~planet_FUEL_COLONISTS+$colos_to_move)
			setVar $planet~planet_EQUIPMENT_COLONISTS ($planet~planet_EQUIPMENT_COLONISTS-$colos_to_move)
			if ($colos_to_move > 0)
				send "p*3"&$colos_to_move&"*1"
				gosub :waiton
			end
		end
	end

	send "qq* l " & #8 & $planet~planets[$j] & "*"
return

:grab_treasury
	while ($planet~CITADEL_CREDITS > 0)
		if ($planet~CITADEL_CREDITS > 999999999) or (($planet~CITADEL_CREDITS +  $PLAYER~CREDITS) > 999999999)
			setVar $amount_of_cash_to_transfer (999999999 - $PLAYER~CREDITS)
		else
			setVar $amount_of_cash_to_transfer ($planet~CITADEL_CREDITS)
		end
		setvar $planet~CITADEL_CREDITS ($planet~CITADEL_CREDITS - $amount_of_cash_to_transfer)
		send "t f " & $amount_of_cash_to_transfer & "* qq* l " & #8 & $planet~planetToFill & "* c t t " & $amount_of_cash_to_transfer & "* qq* l " & #8 & $planet~planets[$j] & "* c "
	end
	send "qq* "
return

:upgrade_planets
	setvar $status_message "Upgrading Planet(s)"
	gosub :setWindow
	killalltriggers
	setVar $BOT~command "massupgrade"
	setVar $BOT~user_command_line "massupgrade silent *"
	setVar $BOT~parm1 ""
	saveVar $BOT~parm1
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\"&$bot~mombot_directory&"\modes\resource\massupgrade.cts"
	setEventTrigger		upgradeended		:upgradeended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\massupgrade.cts"
	pause
	:upgradeended
return

:upgrade
	if ($planet~planetCount > 1)
		send "l " & #8 & $planet~planetToFill & "*"
		gosub :PLANET~getPlanetInfo
		gosub :fillplanetstats
		send " c " 
		gosub :upgrade_planets
		send "q"
		gosub :PLANET~getPlanetInfo
		gosub :fillplanetstats
		send "q* "
	end
return

:remove_colos
	setVar $cyclebuffer 0
	while ($COLOS > $COLOS_MAX)
		killtrigger no_room
		killtrigger is_room
		if ($COLOS < $player~total_holds)
			setVar $holds_to_grab $COLOS
		else
			setVar $holds_to_grab $player~total_holds
		end
		add $cyclebuffer 1
		if ($cyclebuffer >= $cyclebufferlimit)
			setVar $cyclebuffer 1
			gosub :PLAYER~quikstats
			send "qq* l " & #8 & $planet~planets[$j] & "*  s * t "&$type&$holds_to_grab&"*  q l " & #8 & $planet~planetToFill & "*  s*l1*"
			setTextTrigger no_room :no_room1 "on the planet"
			setTextTrigger is_room :is_room1 "The Colonists disembark to begin their new life."
			pause

			:no_room1
				   killtrigger no_room
				   killtrigger is_room
				   killtrigger nocolos
				   setVar $moveColo "org"
				   send "snl2*"
				   setTextTrigger no_room :no_room2 "on the planet"
				   setTextTrigger is_room :is_room1 "The Colonists disembark to begin their new life."
				   settexttrigger nocolos :no_room3 "How many groups of Colonists do you want to leave ([0] on board)"
				   pause

			:no_room2
				   killtrigger no_room
				   killtrigger is_room
				   killtrigger nocolos
				   setVar $moveColo "equip"
				   send "snl3*"
				   setTextTrigger no_room :no_room3 "on the planet"
				   setTextTrigger is_room :is_room1 "The Colonists disembark to begin their new life."
				   settexttrigger nocolos :no_room3 "How many groups of Colonists do you want to leave ([0] on board)"
				   pause

			:no_room3
					setVar $moveColo "NO ROOM - EMPTY FULL PLANET"

			:is_room1
				killtrigger no_room
				killtrigger is_room

		else
			send "qq* l " & #8 & $planet~planets[$j] & "*  s * t "&$type&$holds_to_grab&"*  q l " & #8 & $planet~planetToFill & "*  s*l1*  s*l2*  s*l3*  "
		end
		subtract $COLOS $player~total_holds
		if ($moveColo = "fuel")
			if (($planet~planet_fuel_colonists - $player~total_holds) > 0)
				subtract $planet~planet_FUEL_COLONISTS $player~total_holds
				add $planet~planetToFillFuelColonists $player~total_holds
			end
		elseif ($moveColo = "org")
			if (($planet~planet_organics_colonists - $player~total_holds) > 0)
				subtract $planet~planet_ORGANICS_COLONISTS $player~total_holds
				add $planet~planetToFillOrganicsColonists $player~total_holds
			end
		elseif ($moveColo = "equip")
			if (($planet~planet_equipment_colonists - $player~total_holds) > 0)
				subtract $planet~planet_EQUIPMENT_COLONISTS $player~total_holds
				add $planet~planetToFillEquipmentColonists $player~total_holds
			end
		end
		gosub :setWindow
	end
return
	

:add_colos

	setVar $cyclebuffer 0
	while (($COLOS < $COLOS_MIN) and (($planet~planetToFillFuelColonists >= $player~total_holds) or ($planet~planetToFillOrganicsColonists >= $player~total_holds) or ($planet~planetToFillEquipmentColonists >= $player~total_holds)))
		killtrigger grab_colos
		killtrigger no_colos
		add $cyclebuffer 1
		if ($cyclebuffer >= $cyclebufferlimit)
			setVar $cyclebuffer 1
			gosub :PLAYER~quikstats
			send "q q* l " & #8 & $planet~planetToFill & "*  snt1*"
			killtrigger grab_colos
			killtrigger no_colos
			setTextTrigger grab_colos :grab_colos_fuel "The Colonists file aboard your ship, eager to head out."
			setTextTrigger no_colos   :no_colos_fuel1  "There aren't that many on the planet!"
			pause

			:no_colos_fuel1
				killtrigger grab_colos
				killtrigger no_colos
				setVar $moveColo "org"
				send "snt2*"
				setTextTrigger grab_colos :grab_colos_fuel "The Colonists file aboard your ship, eager to head out."
				setTextTrigger no_colos   :no_colos_fuel2   "There aren't that many on the planet!"
				pause

			:no_colos_fuel2
				killtrigger grab_colos
				killtrigger no_colos
				setVar $moveColo "equip"
				send "snt3*"
				setTextTrigger grab_colos :grab_colos_fuel "The Colonists file aboard your ship, eager to head out."
				setTextTrigger no_colos   :no_colos_fuel3   "There aren't that many on the planet!"
				pause

			:grab_colos_fuel
				killtrigger grab_colos
				killtrigger no_colos
				send "q q* l " & #8 & $planet~planets[$j] & "*  snl"&$type&"*"
				setTextTrigger no_colos :no_colos_fuel3 "on the planet"
				setTextTrigger grab_colos :is_room_fuel "The Colonists disembark to begin their new life."
				pause

			:no_colos_fuel3
				killtrigger grab_colos
				killtrigger no_colos
				setVar $moveColo "JETT"
				setvar $COLOS $COLOS_MIN

			:is_room_fuel
				killtrigger grab_colos
				killtrigger no_colos
		else
			send "q q* l " & #8 & $planet~planetToFill & "*  s * t 1* s * t 2* s * t3* q q* l " & #8 & $planet~planets[$j] & "*  s * l "&$type&"*  "
		end
		add $COLOS $player~total_holds                                               
		if ($moveColo = "fuel")
			if ($planet~planetToFillFuelColonists - $player~total_holds > 0)
				add $planet~planet_FUEL_COLONISTS $player~total_holds
				subtract $planet~planetToFillFuelColonists $player~total_holds
			elseif ($planet~planetToFillOrganicsColonists - $player~total_holds > 0)
				add $planet~planet_EQUIPMENT_COLONISTS $player~total_holds
				subtract $planet~planetToFillOrganicsColonists $player~total_holds
			elseif ($planet~planetToFillEquipmentColonists - $player~total_holds > 0)
				add $planet~planet_EQUIPMENT_COLONISTS $player~total_holds
				subtract $planet~planetToFillEquipmentColonists $player~total_holds
			end
		elseif ($moveColo = "org")
			if ($planet~planetToFillOrganicsColonists - $player~total_holds > 0)
				add $planet~planet_ORGANICS_COLONISTS $player~total_holds
				subtract $planet~planetToFillOrganicsColonists $player~total_holds
			elseif ($planet~planetToFillFuelColonists - $player~total_holds > 0)
				add $planet~planet_ORGANICS_COLONISTS $player~total_holds
				subtract $planet~planetToFillFuelColonists $player~total_holds
			elseif ($planet~planetToFillEquipmentColonists - $player~total_holds > 0)
				add $planet~planet_EQUIPMENT_COLONISTS $player~total_holds
				subtract $planet~planetToFillEquipmentColonists $player~total_holds
			end
		elseif ($moveColo = "equip")
			if ($planet~planetToFillEquipmentColonists - $player~total_holds > 0)
				subtract $planet~planetToFillEquipmentColonists $player~total_holds
			elseif ($planet~planetToFillOrganicsColonists - $player~total_holds > 0)
				subtract $planet~planetToFillOrganicsColonists $player~total_holds
			elseif ($planet~planetToFillFuelColonists - $player~total_holds > 0)
				subtract $planet~planetToFillFuelColonists $player~total_holds
			end
			add $planet~planet_EQUIPMENT_COLONISTS $player~total_holds
		end
		gosub :setWindow
	end


return

:get_tl_list
	setVar $sectorCount 0
	setarray $TLPlanets sectors
	killalltriggers
	setTextLineTrigger sectorGrabber :sector_planet_line "Class "
	setTextLineTrigger sectorbeDone :sector_done "======   ============"
	setVar $tl_planets " "
	if ($personal = TRUE)
		send "cyq"
	else
		send "xlq"
	end
	pause
	:sector_planet_line
		killalltriggers
		getWord CURRENTLINE $testsector 1
		setvar $TLPlanetCount $TLPlanets[$testsector]
		setvar $TLPlanets[$testsector] ($TLPlanetCount + 1)
		setVar $tl_planets $tl_planets&" "&$testsector
		setTextLineTrigger getLine2 :sector_planet_line "Class"
		setTextLineTrigger getEnd :sector_done "======   ============"
		pause
	:sector_done
	send "@"
	waitOn "Average Interval Lag:"

return

:checkForFarmTarget
	setvar $isFarmTarget false
	setvar $isFarmFound false
	getSectorParameter $focus $bot~parameter $isFarmTarget
	if ($where_planets = true)
		if ($TLPlanets[$focus] <= 0)
			goto :not_farm_sector
		end
	end
	#########################################################################
	# If farm target is true, we need to check if other options are as well #
	#########################################################################
	if ($isFarmTarget = true)
		if ($balance)
			if ($TLPlanets[$focus] > $game~MAX_PLANETS_PER_SECTOR)
				setvar $isFarmFound true
			end
		else
			if ($amtrak)
				getSectorParameter $focus "AMTRAK" $BUBBLE
			elseif ($allplanets)
				getWordPos $tl_planets $pos " "&$focus&" "
				if ($pos > 0)
					setVar $isFarmFound TRUE
				end
			else
				setvar $isFarmFound true
			end
		end
	end
	:not_farm_sector

return

:get_dets
	setVar $JUMP 0
	if (STARDOCK = 0)
		setVar $SWITCHBOARD~message "Stardock Not Known To TWX.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	send "qq* jy* l " & $planet~planetToFill & "* tnt1*mnt*c"
	waitFor "Citadel command ("
	setVar $player~creditsNeeded (($SHIP~SHIP_GENESIS_MAX*$GAME~GENESIS_COST)+($SHIP~SHIP_GENESIS_MAX*$GAME~ATOMIC_COST))
	if ($PLAYER~CREDITS < $player~creditsNeeded)
		setVar $withdraw ($player~creditsNeeded-$PLAYER~CREDITS)
		send "T F "&$withdraw&"*"
		gosub :PLAYER~quikstats
		if ($PLAYER~CREDITS < $player~creditsNeeded)
				setVar $SWITCHBOARD~message "Not Enough Credits to Make Ports*"
				gosub :SWITCHBOARD~switchboard
				send "qq* l " & #8 & $planet~planet & "*  c  *"
				gosub :planets~end
				halt
		end
	end
	send "qq*"
	WAITFOR "Command [TL="

	send " C R " & STARDOCK & "*Q "
	setTextLineTrigger itsalive	:itsalive	"Items     Status  Trading % of max OnBoard"
	setTextLineTrigger nosoupforme	:nosoupforme	"I have no information about a port in that sector"
	pause

	:nosoupforme
		killAllTriggers
		setVar $SWITCHBOARD~message "StarDock appears to have been Blown Up!*"
		gosub :SWITCHBOARD~switchboard
		halt

	:itsalive
	killAllTriggers
	gosub :PLAYER~quikstats
	if (($PLAYER~ALIGNMENT < 1000) AND ($player~ore_holds > 0))
		setVar $adj 1
		while (SECTOR.WARPSIN[STARDOCK][$adj] <> 0)
			setVar $JUMP SECTOR.WARPSIN[STARDOCK][$adj]
			if ($JUMP <> $PLAYER~CURRENT_SECTOR)
				send "M Z " & $JUMP & "*Y"
				setTextLineTrigger	TwarpVoided		:Next_Jump_Point1	"You have marked sector "&$JUMP&" to be avoided!"
				setTextLineTrigger	TwarpBlind 		:Next_Jump_Point2	"No locating beam found"
				setTextLineTrigger	TwarpLocked		:TwarpLocked		"Locating beam pinpointed, TransWarp"
				setTextLineTrigger	TwarpNoGas		:Next_Jump_Point2	"You do not have enough Fuel Ore to make the jump"
				setTextLineTrigger	TwarpNoGas2		:Next_Jump_Point2	"You do not have enough Fuel Ore to make the jump"
				setTextLineTrigger  TwarpNextDoor   :Next_Jump_Point2   "<Set NavPoint>"
				pause
				:TwarpLocked
					killAllTriggers
					goto :Lock_Initiated
				:Next_Jump_Point1
					killAllTriggers
					send "  NN   "
				:Next_Jump_Point2
					killAllTriggers
					send "  *   "
			end
			add $adj 1
		end
		setVar $JUMP 0
	end
	if ($PLAYER~ALIGNMENT < 1000)
		setVar $SWITCHBOARD~message "Something is wrong and twarp can't be verified.  Halting.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	:Lock_Initiated
	if ($JUMP = 0)
		getDistance $Dist1 $PLAYER~CURRENT_SECTOR STARDOCK
		if ($Dist1 = "-1")
			send "cf" & $PLAYER~CURRENT_SECTOR & "*" & STARDOCK & "*q"
			waitOn "What is the starting sector"
			waitOn "Command [TL="
			getDistance $Dist1 $PLAYER~CURRENT_SECTOR STARDOCK
		end
	else
		getDistance $Dist1 $PLAYER~CURRENT_SECTOR $JUMP
		if ($Dist1 = "-1")
			send "cf" & $PLAYER~CURRENT_SECTOR & "*" & $JUMP & "*q"
			waitOn "What is the starting sector"
			waitOn "Command [TL="
			getDistance $Dist1 $PLAYER~CURRENT_SECTOR $JUMP
		end
	end
	getDistance $Dist2 STARDOCK $PLAYER~CURRENT_SECTOR
	if ($Dist2 = "-1")
		send "cf" & STARDOCK & "*" & $PLAYER~CURRENT_SECTOR & "*q"
		waitOn "What is the starting sector"
		waitOn "Command [TL="
		getDistance $Dist2 STARDOCK $PLAYER~CURRENT_SECTOR
	end

	setVar $ORE_REQ (($Dist1 + $Dist2) * 3)

	if (($PLAYER~TWARP_TYPE = "No") OR ($player~ore_holds < $ORE_REQ) OR (($PLAYER~ALIGNMENT < 1000) AND ($JUMP = 0)))
		if ($JUMP <> 0)
			send "  N  "
		end
	else
		SetVar $MOW FALSE
	end

	if ($MOW)
	else
		if ($JUMP = 0)
			send (" M " & STARDOCK & "* Y Y * P S G Y G Q H ")
		else
			send (" Y  *  M " & STARDOCK & "* P S G Y G Q H ")
		end
	end

	waitfor "<Hardware Emporium>"
	send "A"
	waitfor "How many Atomic Detonators do you want"
	getText CURRENTLINE $BUY "(Max" ") ["
	stripText $BUY " "
	stripText $BUY ","
	send $BUY & "* T "
	waitfor "How many Genesis Torpedoes do you want"
	getText CURRENTLINE $BUY "(Max" ") ["
	stripText $BUY " "
	stripText $BUY ","
	send $BUY & "* Q S P C "
	waitfor "How many shield armor points do you want to buy"
	getText CURRENTLINE $BUY "(Max" ") ["
	stripText $BUY " "
	stripText $BUY ","
	send $BUY & "* "

	if ($MOW)
	else
		send ("Q Q Q  " & $PLAYER~CURRENT_SECTOR & "*Y")
		setTextLineTrigger	TwarpVoided		:TwarpBad1			"You have marked sector "&$PLAYER~CURRENT_SECTOR&" to be avoided!"
		setTextLineTrigger	TwarpBlind 		:TwarpBad2			"No locating beam found"
		setTextLineTrigger	TwarpLocked		:TwarpGood			"Locating beam pinpointed, TransWarp"
		SetTextLineTrigger	TwarpNoGas		:TwarpBad2			"You do not have enough Fuel Ore to make the jump"
		setTextLineTrigger  TwarpNextDoor   :TwarpGood   		"<Set NavPoint>"
		pause
		:TwarpBad1
			killAllTriggers
			send "  NN   "
		:TwarpBad2
			killAllTriggers
			send " *  P S G Y G Q "
			waitfor "You leave the Galactic Bank."
			setVar $SWITCHBOARD~message "Return Trip Failed.*"
			gosub :SWITCHBOARD~switchboard
			halt
		:TwarpGood
			killAllTriggers
			send "  Y  *   J  Y  "
	end
	waitfor "Are you sure you want to jettison all cargo"
	waitfor "Command [TL"
	getText CURRENTLINE $WhereRwe "]:[" "] (?"
	stripText $WhereRwe " "
	if ($WhereRwe <> $PLAYER~CURRENT_SECTOR)
		setVar $SWITCHBOARD~message "Return Trip Failed.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
return

:dump_and_destroy_ports
	setVar $BOT~command "mover"
	setVar $BOT~user_command_line "dump all fc oc ec turbo silent"
	setVar $BOT~parm1 "dump"
	saveVar $BOT~parm1
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\"&$bot~mombot_directory&"\modes\resource\mover.cts"
	setEventTrigger		dumpended		:dumpendedbuild "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\mover.cts"
	pause
	:dumpendedbuild	       

	if (PORT.EXISTS[$data~farmSector] = TRUE)
		if ($PLAYER~FIGHTERS > $SHIP~SHIP_MAX_ATTACK)
			send "p"
			setTextTrigger 1 :portAlreadyGone "Captain! Are you sure you want to port here?"
			setTextTrigger 2 :continueDestroy "<A> Attack this Port"
			pause
			:continueDestroy
			killtrigger 1
			killtrigger 2
			killtrigger 3
			killtrigger 4
			send " a y "&$SHIP~SHIP_MAX_ATTACK&"*l "&$planet~planetToFill&"* m * * * q "
			setTextTrigger 1 :keepDestroying "Incoming laser barrage from"
			setTextTrigger 2 :doneDestroying "You destroyed the Star Port!"
			pause
			:doneDestroying
			:portAlreadyGone
				send "*   "
				killtrigger 1
				killtrigger 2
				killtrigger 3
				killtrigger 4
		else
			setVar $SWITCHBOARD~message "Not enough fighters.  Better reload before the armageddon can continue.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
	end
return