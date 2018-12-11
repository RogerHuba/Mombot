	reqRecording
	logging off
	gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&"Farms sectors marked with BUBBLE parameters.  "
	setVar $BOT~help[2]  $BOT~tab&"       "
	setVar $BOT~help[3]  $BOT~tab&"Farm Options: "
	setVar $BOT~help[4]  $BOT~tab&"         [fig] - will strip fighters off planets"
	setVar $BOT~help[5]  $BOT~tab&"           [f] - will strip fuel off planets"
	setVar $BOT~help[6]  $BOT~tab&"           [o] - will strip organics off planets"
	setVar $BOT~help[7]  $BOT~tab&"           [e] - will strip equipment off planets"
	setVar $BOT~help[8]  $BOT~tab&"        [cash] - will grab cash off planets"
	setVar $BOT~help[9]  $BOT~tab&"     [reverse] - travels farm sectors in reverse"
	setVar $BOT~help[10] $BOT~tab&"        [warp] - will warp planets to sell product"
	setVar $BOT~help[11] $BOT~tab&"      [shield] - will ensure 200 Shields on shielded planets"
	setVar $BOT~help[12] $BOT~tab&"        [colo] - will colonize planets with avaliable fuel"
	setVar $BOT~help[13] $BOT~tab&"        [coln] - will balance colonists on planets"
	setVar $BOT~help[14] $BOT~tab&"     [upgrade] - will upgrade all planets "
	setVar $BOT~help[15] $BOT~tab&"        [port] - will create and upgrade ports"
	setVar $BOT~help[16] $BOT~tab&"       [build] - will create and upgrade planets and port"
	setVar $BOT~help[17] $BOT~tab&"[destroyports] - will destroy all non-class 3 ports during build"
	setVar $BOT~help[18] $BOT~tab&"   [oneplanet] - only pops planet where none exist during build"
	setVar $BOT~help[19] $BOT~tab&"     [nostrip] - won't attempt to strip during build"
	setVar $BOT~help[20] $BOT~tab&"   [noupgrade] - won't attempt to upgrade during build"
	setVar $BOT~help[21] $BOT~tab&"     [defense] - set cannons"
	setVar $BOT~help[22] $BOT~tab&"      [amtrak] - uses amtrak sectors as farm sectors"
	setVar $BOT~help[23] $BOT~tab&"  [allplanets] - uses tl sectors as farm sectors"
	setVar $BOT~help[24] $BOT~tab&"     [movefig] - moves all fighters form planet to sector"
	setVar $BOT~help[25] $BOT~tab&"         [off] - turns off farming script"
	setVar $BOT~help[26] $BOT~tab&"       "
	setVar $BOT~help[27] $BOT~tab&"Data Options:"
	setVar $BOT~help[28] $BOT~tab&"  {set} or {setdoor) plus [sector number]"
	setVar $BOT~help[29] $BOT~tab&"               - Marks sector as a Bubble Sector / Door"
	setVar $BOT~help[30] $BOT~tab&"  {remove} plus [sector number]"
	setVar $BOT~help[31] $BOT~tab&"               - Removes marked sector"
	gosub :BOT~help_file

	

	setvar $portname "Mind ()ver Matter"
 	setvar $planetnamedoor "DOOR GUN"
 	setvar $planetnamebubble "FARM"
 	setvar $name_the_planet "Mind ()ver Matter"
 	setVar $j 1
 	setvar $status_message "Initializing"
    setVar $version "3.0.0"
	
	setVar $BOT~script_title "M()M Bubble Farmer"
		
    if ($parm1 = "off")
		setVar $SWITCHBOARD~message "Shutting down "&$BOT~script_title&".*"
		gosub :SWITCHBOARD~switchboard
    	halt
    end

	getWordPos $user_command_line $pos "silent"
	if ($pos > 0)
		setVar $silent TRUE
	else
		setVar $silent FALSE
	end

	getWordPos $user_command_line $pos "amtrak"
	if ($pos > 0)
		setVar $amtrak TRUE
	else
		setVar $amtrak FALSE
	end

	getWordPos $user_command_line $pos "allplanets"
	if ($pos > 0)
		setVar $allplanets TRUE
	else
		setVar $allplanets FALSE
	end

	getWordPos $user_command_line $pos "fig"
	if ($pos > 0)
	        setVar $strip TRUE
		setVar $get_figs TRUE
	else
		setVar $get_figs FALSE
	end
	
    getWordPos $user_command_line $pos "reverse"
	if ($pos > 0)
		setVar $reverse TRUE
	else
		setVar $reverse FALSE
	end

    getWordPos $user_command_line $pos "one"
	if ($pos > 0)
		setVar $one_per_sector TRUE
	else
		setVar $one_per_Sector FALSE
	end

    getWordPos $user_command_line $pos "nostrip"
	if ($pos > 0)
		setVar $nostrip TRUE
	else
		setVar $nostrip FALSE
	end

    getWordPos $user_command_line $pos "noupgrade"
	if ($pos > 0)
		setVar $noupgrade TRUE
	else
		setVar $noupgrade FALSE
	end

    getWordPos $user_command_line $pos "movefig"
	if ($pos > 0)
		setVar $movefig TRUE
	else
		setVar $movefig FALSE
	end

    getWordPos $user_command_line $pos "defense"
	if ($pos > 0)
		setVar $defense TRUE
	else
		setVar $defense FALSE
	end

	getWordPos " "&$user_command_line&" " $pos " f "
	if ($pos > 0)
       	setVar $strip TRUE
		setVar $get_fuel TRUE
	else
		setVar $get_fuel FALSE
	end

	getWordPos " "&$user_command_line&" " $pos " o "
	if ($pos > 0)
	    setVar $strip TRUE
		setVar $get_org TRUE
	else
		setVar $get_org FALSE
	end

	getWordPos " "&$user_command_line&" " $pos " e "
	if ($pos > 0)
	    setVar $strip TRUE
		setVar $get_equip TRUE
	else
		setVar $get_equip FALSE
	end

	getWordPos $user_command_line $pos "upgrade"
	if ($pos > 0)
		setVar $upgrade TRUE
	else
		setVar $upgrade FALSE
	end

    getWordPos $user_command_line $pos "port"
	if ($pos > 0)
		setVar $strip TRUE
		setVar $port TRUE
	else
		setVar $port FALSE
	end

	getWordPos $user_command_line $pos "coln"
	if ($pos > 0)
		setVar $colo TRUE
	else
		setVar $colo FALSE
	end
	getWordPos $user_command_line $pos "build"
	if ($pos > 0)
		setVar $build TRUE
	else
		setVar $build FALSE
	end
	getWordPos $user_command_line $pos "destroyports"
	if ($pos > 0)
		setVar $destroyports TRUE
	else
		setVar $destroyports FALSE
	end

    getWordPos $user_command_line $pos "cash"
	if ($pos > 0)
		setVar $cash TRUE
	else
		setVar $cash FALSE
	end

	getWordPos $user_command_line $pos "merch"
	if ($pos > 0)
		setVar $merch TRUE
	else
		setVar $merch FALSE
	end

	getWordPos $user_command_line $pos "cim"
	if ($pos > 0)
		setVar $skipcim TRUE
	else
		setVar $skipcim FALSE
	end

	getWordPos $user_command_line $pos "shield"
	if ($pos > 0)
		setVar $shield TRUE
	else
		setVar $shield FALSE
	end

	getWordPos $user_command_line $pos "warp"
	if ($pos > 0)
		setVar $warp TRUE
		if ($skipcim <> TRUE)
			send "^rq"
			waitFor ": ENDINTERROG"
		end
	else
		setVar $warp FALSE
	end

    getWordPos $user_command_line $pos "colo"
	if ($pos > 0)
		setVar $colonize TRUE
	else
		setVar $colonize FALSE
	end

    getWordPos $user_command_line $pos "clear"
	if ($pos > 0)
		setVar $IDX 11
		setVar $perc 0
		while ($IDX <= SECTORS)
			setSectorParameter $IDX "BUBBLE" FALSE
			add $IDX 1
			setVar $percTest (($IDX * 100) / SECTORS)
			if ($percTest > $perc)
				setVar $perc (($IDX * 100) / SECTORS)
				echo "*"
				echo #27 "["&($perc / 2)&"C"
				echo ANSI_14 "�" ANSI_15 " " $perc "%" #27 & "[1A   "
			end
		end
		setVar $SWITCHBOARD~message "Bot Farming Sectors Have Been Cleared.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	getWordPos $user_command_line $pos "list"
	if ($pos > 0)
	   setVar $IDX 11
	   send "'*{" $SWITCHBOARD~bot_name "} - Bubble Sectors: *"
	   while ($IDX <= SECTORS)
	        getsectorparameter $IDX "BUBBLE" $test
	        if ($test = TRUE)
	             send $IDX & "*"
            end
            add $IDX 1
        end
       send "*"
       halt
    end

	getWordPos $user_command_line $pos "set"
	if ($pos > 0)
		isNumber $test $parm2
		if ($test)
			if (($parm2 > 10) AND ($parm2 <= SECTORS) AND ($parm2 <> STARDOCK))
				setSectorParameter $parm2 "BUBBLE" TRUE
		        setVar $SWITCHBOARD~message "" & $parm2 & " Sector added as FARM Sector.*"
				gosub :SWITCHBOARD~switchboard
			end
		else
            setVar $SWITCHBOARD~message "Sector to add not Valid.*"
			gosub :SWITCHBOARD~switchboard
        end
	    halt
	end

	getWordPos $user_command_line $pos "setdoor"
	if ($pos > 0)
		isNumber $test $parm2
		if ($test)
			if (($parm2 > 10) AND ($parm2 <= SECTORS) AND ($parm2 <> STARDOCK))
				setSectorParameter $parm2 "DOOR" TRUE
		        setSectorParameter $parm2 "BUBBLE" TRUE
		        setVar $SWITCHBOARD~message "" & $parm2 & " Sector added as DOOR Sector Parameters.*"
				gosub :SWITCHBOARD~switchboard
			end
		else
			setVar $SWITCHBOARD~message "Sector to add not Valid.*"
			gosub :SWITCHBOARD~switchboard
		end
		halt
	end

	getWordPos $user_command_line $pos "remove"
	if ($pos > 0)
		isNumber $test $parm2
		if ($test)
			if (($parm2 > 10) AND ($parm2 <= SECTORS) AND ($parm2 <> STARDOCK))
				setSectorParameter $parm2 "BUBBLE" FALSE
		        setVar $SWITCHBOARD~message "" & $parm2 & " Sector removed from FARM Sector Parameters.*"
				gosub :SWITCHBOARD~switchboard
			end
		else
            setVar $SWITCHBOARD~message "Sector to remove not Valid.*"
			gosub :SWITCHBOARD~switchboard
        end
	    halt
	end

	gosub :BOT~banner

    if (($get_figs = FALSE) and ($strip = FALSE) and ($warp = FALSE) and ($port = FALSE) and ($upgrade = FALSE) and ($colo = FALSE) and ($cash = FALSE) and ($shield = FALSE) and ($build = FALSE) and ($colonize = FALSE) and ($colo = FALSE) and ($parm1 <> "0") and ($defense = FALSE))
	    setVar $SWITCHBOARD~message "Whats the point?*"
		gosub :SWITCHBOARD~switchboard
	    halt
    elseif ($parm1 = "0")
    	halt
    end



	setVar $i 1
	setArray $planets 3000
	gosub :PLAYER~quikstats
	setvar $home $PLAYER~CURRENT_SECTOR
	if ($PLAYER~PLANET_SCANNER = "No")
		setVar $SWITCHBOARD~message "Planet Farmer must be run with a planet scanner.*"
		gosub :SWITCHBOARD~switchboard
		halt
	elseif ($PLAYER~CURRENT_PROMPT <> "Citadel")
		setVar $SWITCHBOARD~message "Planet Farmer must be run from the Citadel Prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	
	gosub :PLANET~loadplanetInfo

    send "q"
	gosub :PLANET~getPlanetInfo
	send "c"
	gosub :SHIP~getShipStats

	setVar $planetToFill $PLANET~PLANET
	setVar $planetToFillFuel $PLANET~PLANET_FUEL
	setVar $planetToFillOrganics $PLANET~PLANET_ORGANICS
	setVar $planetToFillEquipment $PLANET~PLANET_EQUIPMENT
	setVar $planetToFillFuelColonists $PLANET~PLANET_FUEL_COLONISTS
	setVar $planetToFillOrganicsColonists $PLANET~PLANET_ORGANICS_COLONISTS
	setVar $planetToFillEquipmentColonists $PLANET~PLANET_EQUIPMENT_COLONISTS

    Window Farm_Script 330 424 ("M()M Farmer - " & GAMENAME) ONTOP
    gosub :setWindow

    if ($allplanets)
    	gosub :get_tl_list
    end
:start
	killalltriggers
	if ($reverse)
             setVar $farmSector SECTORS
    else
             setVar $farmSector 11
    end

:inac
:tryAgain
	while ($farmSector <= SECTORS)
		if ($amtrak)
			getSectorParameter $farmSector "AMTRAK" $BUBBLE
		elseif ($allplanets)
			getWordPos $tl_planets $pos " "&$farmSector&" "
			if ($pos > 0)
				setVar $BUBBLE TRUE
			else
				setVar $BUBBLE FALSE
			end
		else
			getSectorParameter $farmSector "BUBBLE" $BUBBLE
		end
		 if ($BUBBLE = TRUE)
		        goto :move_the_planet
		 else
		        if ($reverse)
		             subtract $farmSector 1
		        else
		             add $farmSector 1
		        end
		        goto :tryAgain
		 end

		:move_the_planet
            send "p "& $farmSector &"  *ys* "
	        settextlinetrigger warp_it :warp_it "All Systems Ready, shall we engage?"
	        settextlinetrigger no_warp :no_warp "You do not have any fighters in Sector"
	        setTextLineTrigger alreadythere :warp_it "You are already in that sector!"
	        pause

		:no_warp
			killalltriggers
			if ($reverse)
                 subtract $farmSector 1
            else
                 add $farmSector 1
            end
			goto :tryAgain

		:warp_it
			killalltriggers
			if ($WARP)
			      send "tt"
			      waitfor "How much to transfer?"
			      send $PLAYER~CREDITS&"*"
			      waitfor "Citadel treasury contains"
			end

			send "q"
			gosub :PLANET~getPlanetInfo
			setVar $planetToFillFuel $PLANET~PLANET_FUEL
			setVar $planetToFillOrganics $PLANET~PLANET_ORGANICS
			setVar $planetToFillEquipment $PLANET~PLANET_EQUIPMENT
			setVar $planetToFillFuelColonists $PLANET~PLANET_FUEL_COLONISTS
			setVar $planetToFillOrganicsColonists $PLANET~PLANET_ORGANICS_COLONISTS
			setVar $planetToFillEquipmentColonists $PLANET~PLANET_EQUIPMENT_COLONISTS
			gosub :count_planets
	        send "qq* "
	        if ($build = TRUE)
	    		gosub :buildplanets
	        end
			gosub :count_planets
	        if (($port) OR ($build))
                gosub :check_ports
	        end
	        if (($strip) or ($colo) or ($upgrade) or ($cash) or ($warp) or ($shield) or ($colonize) or ($figs) or ($defense))
				gosub :stripallplanets
	        end
	        if ($silent <> TRUE)
                setVar $SWITCHBOARD~message "Completed All Farming/Building/Port Actions Sector: "&$farmSector&".*"
				gosub :SWITCHBOARD~switchboard
            end
            send "qq* l " & #8 & $planetToFill & "* "
			gosub :PLANET~getPlanetInfo
			send "c"
			if ($reverse)
                 subtract $farmSector 1
            else
                 add $farmSector 1
            end
			if (($PLANET~PLANET_ORGANICS > ($PLANET~PLANET_ORGANICS_MAX-1000)) AND ($PLANET~PLANET_EQUIPMENT > ($PLANET~PLANET_EQUIPMENT_MAX - 1000)))
		        setVar $planetIsFull TRUE
				goto :end
            end
	end
	goto :end

:count_planets
	send "qq*  |l"
	waitOn "Registry# and Planet Name"
	setVar $planetCount 0
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
			add $planetCount 1
			getWord $line $planets[$planetCount] 1
		end
		setTextLineTrigger getLine2 :planetline "   <"
		setTextLineTrigger getend :done "Land on which planet "
		pause
	:done
         killalltriggers
         return

:get_tl_list
	setVar $sectorCount 0
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
		setVar $tl_planets $tl_planets&" "&$testsector
		setTextLineTrigger getLine2 :sector_planet_line "Class"
		setTextLineTrigger getEnd :sector_done "======   ============"
		pause
	:sector_done
	send "@"
	waitOn "Average Interval Lag:"

return

:stripallplanets
 	setVar $j 1
	send "qq* "
	if ((($upgrade) OR ($build)) AND ($noupgrade = FALSE))
         if ($planetCount > 1)
         	gosub :upgrade_planets
    	end
    end
	while ($j <= $planetCount)
		if ($planetToFill <> $planets[$j])
                        send "l " & #8 & $planets[$j] & "* "
		        		gosub :PLANET~getPlanetInfo
                        setVar $PLANET_FUEL $PLANET~PLANET_FUEL
                        setVar $PLANET_ORGANICS $PLANET~PLANET_ORGANICS
                        setVar $PLANET_EQUIPMENT $PLANET~PLANET_EQUIPMENT
                        setVar $PLANET_FUEL_COLONISTS $PLANET~PLANET_FUEL_COLONISTS
                        setVar $PLANET_ORGANICS_COLONISTS $PLANET~PLANET_ORGANICS_COLONISTS
                        setVar $PLANET_EQUIPMENT_COLONISTS $PLANET~PLANET_EQUIPMENT_COLONISTS
                        setVar $PLANET_CLASS $PLANET~PLANET_CLASS_NAME
                        setVar $PLANET_CITADEL_CREDITS $PLANET~CITADEL_CREDITS
                        setVar $PLANET_CITADEL $PLANET~CITADEL
                        setVar $PLANET_SHIELD_POWER $PLANET~SHIELD_POWER
                        lowercase $PLANET_CLASS

						setVar $i 1
						setVar $foundPlanet FALSE
						while (($i < $PLANET~planetcounter) AND ($foundPlanet = FALSE))
							lowercase $PLANET~planetList[$i]
							lowercase $PLANET_CLASS
							getWordPos $PLANET~planetList[$i] $pos $PLANET_CLASS
							if ($pos > 0)
								setVar $PLANET_FUEL_COLONISTS_MAX $PLANET~planetList[$i][1]
								setVar $PLANET_ORGANICS_COLONISTS_MAX $PLANET~planetList[$i][2]
								setVar $PLANET_EQUIPMENT_COLONISTS_MAX $PLANET~planetList[$i][3]
								setVar $PLANET_FUEL_COLONISTS_MIN (($PLANET~planetList[$i][1]*95)/100)
								setVar $PLANET_ORGANICS_COLONISTS_MIN (($PLANET~planetList[$i][2]*95)/100)
								setVar $PLANET_EQUIPMENT_COLONISTS_MIN (($PLANET~planetList[$i][3]*95)/100)
								setVar $foundPlanet TRUE
							end
							if ($foundPlanet = FALSE)
								add $i 1
							end
						end
						if ($foundPlanet = FALSE)
							setVar $SWITCHBOARD~message "[" & $PLANET_CLASS & "] Planet Class Not Recognized Sector: " & $PLAYER~CURRENT_SECTOR & "["&$PLANET~planetList[$i]&"]*"
							goto :doneWithThisPlanet
						end
                        if ($colonize)
							if (($PLANET_FUEL_COLONISTS < ($PLANET_FUEL_COLONISTS_MAX-1000)) OR ($PLANET_ORGANICS_COLONISTS < ($PLANET_ORGANICS_COLONISTS_MAX-1000)) OR ($PLANET_EQUIPMENT_COLONISTS < ($PLANET_EQUIPMENT_COLONISTS_MAX-1000)))
								gosub :colonize
							end
							send "l " & #8 & $planets[$j] & "* "
							gosub :PLANET~getPlanetInfo
							setVar $PLANET_FUEL $PLANET~PLANET_FUEL
							setVar $PLANET_ORGANICS $PLANET~PLANET_ORGANICS
							setVar $PLANET_EQUIPMENT $PLANET~PLANET_EQUIPMENT
							setVar $PLANET_FUEL_COLONISTS $PLANET~PLANET_FUEL_COLONISTS
							setVar $PLANET_ORGANICS_COLONISTS $PLANET~PLANET_ORGANICS_COLONISTS
							setVar $PLANET_EQUIPMENT_COLONISTS $PLANET~PLANET_EQUIPMENT_COLONISTS
							setVar $PLANET_CLASS $PLANET~PLANET_CLASS_NAME
							setVar $PLANET_CITADEL_CREDITS $PLANET~CITADEL_CREDITS
							setVar $PLANET_CITADEL $PLANET~CITADEL
							setVar $PLANET_SHIELD_POWER $PLANET~SHIELD_POWER
							lowercase $PLANET_CLASS
                        end
                        if ($defense)
	                        if ($PLANET_CITADEL >= 3)
								send "cls10*la20*q "                        	
	                        end
	                    end
	                    if ($movefig = TRUE)
							send "'"&$SWITCHBOARD~bot_name&" movefig s*"
							setEventTrigger		movefigended		:movefigended "SCRIPT STOPPED" "scripts\MomBot\Modes\Resource\movefig.cts"
							pause
							:movefigended	                    
	                    end

						#AUTOMATICALLY ADJUST COLOS
                        if ($PLANET_FUEL_COLONISTS > $PLANET_FUEL_COLONISTS_MAX)
                        	setVar $extra_colos ($PLANET_FUEL_COLONISTS-$PLANET_FUEL_COLONISTS_MAX)
                        	if ($PLANET_ORGANICS_COLONISTS < $PLANET_ORGANICS_COLONISTS_MAX)
                        		setVar $colos_needed ($PLANET_ORGANICS_COLONISTS_MAX-$PLANET_ORGANICS_COLONISTS)
                        		if ($colos_needed >= $extra_colos)
                        			setVar $colos_to_move $extra_colos
                        		else
                        			setVar $colos_to_move $colos_needed
                        		end
                        		setVar $PLANET_FUEL_COLONISTS ($PLANET_FUEL_COLONISTS-$colos_to_move)
                        		send "p*1"&$colos_to_move&"*2"
                        		waitOn "The Colonists drop what"
                        	end
                        	if ($PLANET_EQUIPMENT_COLONISTS < $PLANET_EQUIPMENT_COLONISTS_MAX)
                        		setVar $colos_needed ($PLANET_EQUIPMENT_COLONISTS_MAX-$PLANET_EQUIPMENT_COLONISTS)
                        		if ($colos_needed >= $extra_colos)
                        			setVar $colos_to_move $extra_colos
                        		else
                        			setVar $colos_to_move $colos_needed
                        		end
                        		setVar $PLANET_FUEL_COLONISTS ($PLANET_FUEL_COLONISTS-$colos_to_move)
                        		send "p*1"&$colos_to_move&"*3"
                        		waitOn "The Colonists drop what"
                        	end
                        end
                        if ($PLANET_ORGANICS_COLONISTS > $PLANET_ORGANICS_COLONISTS_MAX)
                        	setVar $extra_colos ($PLANET_ORGANICS_COLONISTS-$PLANET_ORGANICS_COLONISTS_MAX)
                        	if ($PLANET_FUEL_COLONISTS < $PLANET_FUEL_COLONISTS_MAX)
                        		setVar $colos_needed ($PLANET_FUEL_COLONISTS_MAX-$PLANET_FUEL_COLONISTS)
                        		if ($colos_needed >= $extra_colos)
                        			setVar $colos_to_move $extra_colos
                        		else
                        			setVar $colos_to_move $colos_needed
                        		end
                        		setVar $PLANET_ORGANICS_COLONISTS ($PLANET_ORGANICS_COLONISTS-$colos_to_move)
                        		send "p*2"&$colos_to_move&"*1"
                        		waitOn "The Colonists drop what"
                        	end
                        	if ($PLANET_EQUIPMENT_COLONISTS < $PLANET_EQUIPMENT_COLONISTS_MAX)
                        		setVar $colos_needed ($PLANET_EQUIPMENT_COLONISTS_MAX-$PLANET_EQUIPMENT_COLONISTS)
                        		if ($colos_needed >= $extra_colos)
                        			setVar $colos_to_move $extra_colos
                        		else
                        			setVar $colos_to_move $colos_needed
                        		end
                        		setVar $PLANET_ORGANICS_COLONISTS ($PLANET_ORGANICS_COLONISTS-$colos_to_move)
                        		send "p*2"&$colos_to_move&"*3"
                        		waitOn "The Colonists drop what"
                        	end
                        end
                        if ($PLANET_EQUIPMENT_COLONISTS > $PLANET_EQUIPMENT_COLONISTS_MAX)
                        	setVar $extra_colos ($PLANET_EQUIPMENT_COLONISTS-$PLANET_EQUIPMENT_COLONISTS_MAX)
                        	if ($PLANET_ORGANICS_COLONISTS < $PLANET_ORGANICS_COLONISTS_MAX)
                        		setVar $colos_needed ($PLANET_ORGANICS_COLONISTS_MAX-$PLANET_ORGANICS_COLONISTS)
                        		if ($colos_needed >= $extra_colos)
                        			setVar $colos_to_move $extra_colos
                        		else
                        			setVar $colos_to_move $colos_needed
                        		end
                        		setVar $PLANET_EQUIPMENT_COLONISTS ($PLANET_EQUIPMENT_COLONISTS-$colos_to_move)
                        		send "p*3"&$colos_to_move&"*2"
                        		waitOn "The Colonists drop what"
                        	end
                        	if ($PLANET_FUEL_COLONISTS < $PLANET_FUEL_COLONISTS_MAX)
                        		setVar $colos_needed ($PLANET_FUEL_COLONISTS_MAX-$PLANET_FUEL_COLONISTS)
                        		if ($colos_needed >= $extra_colos)
                        			setVar $colos_to_move $extra_colos
                        		else
                        			setVar $colos_to_move $colos_needed
                        		end
                        		setVar $PLANET_EQUIPMENT_COLONISTS ($PLANET_EQUIPMENT_COLONISTS-$colos_to_move)
                        		send "p*3"&$colos_to_move&"*1"
                        		waitOn "The Colonists drop what"
                        	end
                        end

                        send "qq* l " & #8 & $planets[$j] & "* c "
		        		gosub :setWindow
                        if (($PLANET_CITADEL_CREDITS > 0) and ($cash))
							if ($PLANET_CITADEL_CREDITS > 999999999) or (($PLANET_CITADEL_CREDITS +  $PLAYER~CREDITS) > 999999999)
							    setVar $PLANET_CITADEL_CREDITS (999999999 - $PLAYER~CREDITS)
							else
						        setVar $PLANET_CITADEL_CREDITS ($PLANET_CITADEL_CREDITS + $PLAYER~CREDITS)
							end
							send "t f " & $PLANET_CITADEL_CREDITS & "* qq* l " & #8 & $planetToFill & "* c t t " & $citadelCash & "* qq* "
                        end
                        if (($shield) and ($PLANET_CITADEL > 4) and ($PLANET_SHIELD_POWER < 200))
                            if ($PLAYER~SHIELDS < 2000)
                                    send "qq* l " & #8 & $planetToFill & "*"
                                    gosub :PLANET~getPlanetInfo
                                    if ($PLANET~SHIELD_POWER < 200)
                                          setVar $shield FALSE
                                          send "qq* "
                                    else
                                          send "cgf200*qq* "
                                    end
                            else
                                   send "l " & #8 & $planets[$j] & "* c gt200*"
                            end
                        end
                        if (($warp = TRUE) and ($PLANET_CITADEL > 3) and ($PLANET_FUEL > 5000) and (($PLANET_ORGANICS > 5000) or ($PLANET_EQUIPMENT > 5000)))
							send "qq* l " & #8 & $planets[$j] & "* c "
							gosub :merch
							send "d"
							waitOn "Citadel treasury contains "
							getWord CURRENTLINE $citadelCash 4
							stripText $citadelCash ","
							if ($citadelCash > 0)
								if ($citadelCash > 999999999) or (($citadelCash +  $PLAYER~CREDITS) > 999999999)
									setVar $citadelCash (999999999 - $PLAYER~CREDITS)
								else
									setVar $citadelCash ($citadelCash + $PLAYER~CREDITS)
								end
								send "t f " & $citadelCash & "* qq* l " & #8 & $planetToFill & "* c t t " & $citadelCash & "* "
							end
                        end
                        send "qq* * "

						if ($strip)
							send "l " & #8 & $planetToFill & "* c "
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
							send "'"&$SWITCHBOARD~bot_name&" strip "&$planets[$j]&" "&$options&" turbo*"
							setEventTrigger		stripended		:stripended "SCRIPT STOPPED" "scripts\MomBot\Modes\Resource\strip.cts"
							pause
							:stripended
							send "q q * "
						end
                        :try_colo
                        if ($colo)
                        setVar $cyclebuffer 0
                        setVar $cyclebufferlimit 30
						send "qq* jy* l " & #8 & $planets[$j] & "*  "
						while ($PLANET_FUEL_COLONISTS > $PLANET_FUEL_COLONISTS_MAX)
							setvar $status_message "Stripping Fuel Colonists"
							killalltriggers
							setVar $moveColo "fuel"
							if ($PLANET_FUEL_COLONISTS < $PLAYER~TOTAL_HOLDS)
								setVar $holds_to_grab $PLANET_FUEL_COLONISTS
							else
								setVar $holds_to_grab $PLAYER~TOTAL_HOLDS
							end
							add $cyclebuffer 1
							if ($cyclebuffer >= $cyclebufferlimit)
								setVar $cyclebuffer 1
								gosub :PLAYER~quikstats
								send "qq* l " & #8 & $planets[$j] & "*  snt1"&$holds_to_grab&"*  q l " & #8 & $planetToFill & "*  snl1*"
								setTextTrigger no_room :no_room1 "on the planet"
								setTextTrigger is_room :is_room1 "The Colonists disembark to begin their new life."
								pause

								:no_room1
								       killalltriggers
								       setVar $moveColo "org"
								       send "snl2*"
								       setTextTrigger no_room :no_room2 "on the planet"
								       setTextTrigger is_room :is_room1 "The Colonists disembark to begin their new life."
								       pause

								:no_room2
								       killalltriggers
								       setVar $moveColo "equip"
								       send "snl3*"
								       setTextTrigger no_room :no_room3 "on the planet"
								       setTextTrigger is_room :is_room1 "The Colonists disembark to begin their new life."
								       pause

								:no_room3
								        setVar $moveColo "JETT"

								:is_room1
									killalltriggers
									gosub :setWindow

							else
								send "qq* l " & #8 & $planets[$j] & "*  snt1"&$holds_to_grab&"*  q l " & #8 & $planetToFill & "*  snl1*"
							end
							subtract $PLANET_FUEL_COLONISTS $PLAYER~TOTAL_HOLDS
							if ($moveColo = "fuel")
							  		subtract $planetToFillFuelColonists $PLAYER~TOTAL_HOLDS
							elseif ($moveColo = "org")
							      subtract $planetToFillOrganicsColonists $PLAYER~TOTAL_HOLDS
							elseif ($moveColo = "equip")
							      subtract $planetToFillEquipmentColonists $PLAYER~TOTAL_HOLDS
							end
							send "q j y * "
						end

                        setVar $cyclebuffer 0
						while ($PLANET_FUEL_COLONISTS < $PLANET_FUEL_COLONISTS_MIN)
							setvar $status_message "Adding Fuel Colonists"
							killalltriggers
 							setVar $moveColo "fuel"
 							setVar $type 1						   
							if ($planetToFillFuelColonists >= $PLAYER~TOTAL_HOLDS)
									setVar $moveColo "fuel"
									setVar $type 1
							elseif ($planetToFillOrganicsColonists >= $PLAYER~TOTAL_HOLDS)
									setVar $moveColo "org"
							  		setVar $type 2
							elseif ($planetToFillOrganicsColonists >= $PLAYER~TOTAL_HOLDS)
							      setVar $moveColo "equip"
							      setVar $type 3
							else
							      setvar $PLANET_FUEL_COLONISTS $PLANET_FUEL_COLONISTS_MIN
							end
							add $cyclebuffer 1
							if ($cyclebuffer >= $cyclebufferlimit)
								setVar $cyclebuffer 1
								gosub :PLAYER~quikstats
	                            send "q q* l " & #8 & $planetToFill & "*  snt1*"
	                            setTextTrigger grab_colos :grab_colos_fuel "The Colonists file aboard your ship, eager to head out."
								setTextTrigger no_colos   :no_colos_fuel1   "There aren't that many on the planet!"
								pause

								:no_colos_fuel1
								       killalltriggers
								       setVar $moveColo "org"
								       send "snt2*"
								       setTextTrigger grab_colos :grab_colos_fuel "The Colonists file aboard your ship, eager to head out."
								       setTextTrigger no_colos   :no_colos_fuel2   "There aren't that many on the planet!"
								       pause

								:no_colos_fuel2
								       killalltriggers
								       setVar $moveColo "equip"
								       send "snt3*"
								       setTextTrigger grab_colos :grab_colos_fuel "The Colonists file aboard your ship, eager to head out."
								       setTextTrigger no_colos   :no_colos_fuel3   "There aren't that many on the planet!"
								       pause

								:grab_colos_fuel
								      killalltriggers
								      send "q q* l " & #8 & $planets[$j] & "*  snl1*"
								      setTextTrigger no_room :no_colos_fuel3 "on the planet"
								      setTextTrigger is_room :is_room_fuel "The Colonists disembark to begin their new life."
								      pause

								:no_colos_fuel3
								      killalltriggers
								      setVar $moveColo "JETT"
								      setvar $PLANET_FUEL_COLONISTS $PLANET_FUEL_COLONISTS_MIN

								:is_room_fuel
									killalltriggers
									gosub :setWindow
							else
								send "q q* l " & #8 & $planetToFill & "*  snt"&$type&"* q q* l " & #8 & $planets[$j] & "*  snl1*"
							end
							add $PLANET_FUEL_COLONISTS $PLAYER~TOTAL_HOLDS                                               
							if ($moveColo = "fuel")
							  		subtract $planetToFillFuelColonists $PLAYER~TOTAL_HOLDS
							elseif ($moveColo = "org")
							      subtract $planetToFillOrganicsColonists $PLAYER~TOTAL_HOLDS
							elseif ($moveColo = "equip")
							      subtract $planetToFillEquipmentColonists $PLAYER~TOTAL_HOLDS
							end
							send "q j y * "
						end

                        setVar $cyclebuffer 0
						while ($PLANET_ORGANICS_COLONISTS > $PLANET_ORGANICS_COLONISTS_MAX)
						    setvar $status_message "Stripping Organic Colonists"
						    killalltriggers
						    setVar $moveColo "fuel"
							if ($PLANET_ORGANICS_COLONISTS < $PLAYER~TOTAL_HOLDS)
								setVar $holds_to_grab $PLANET_ORGANICS_COLONISTS
							else
								setVar $holds_to_grab $PLAYER~TOTAL_HOLDS
							end
						    
							add $cyclebuffer 1
							if ($cyclebuffer >= $cyclebufferlimit)
								setVar $cyclebuffer 1
								gosub :PLAYER~quikstats
								send "qq*  l " & #8 & $planets[$j] & "*  snt2"&$holds_to_grab&"*  q l  " & #8 & #8 & $planetToFill & "*  snl1*"
							    setTextTrigger no_room :no_room4 "on the planet"
							    setTextTrigger is_room :is_room2 "The Colonists disembark to begin their new life."
							    pause

							    :no_room4
							           killalltriggers
							           setVar $moveColo "org"
							           send "snl2*"
							           setTextTrigger no_room :no_room5 "on the planet"
							           setTextTrigger is_room :is_room2 "The Colonists disembark to begin their new life."
							           pause

							    :no_room5
							           killalltriggers
							           setVar $moveColo "equip"
							           send "snl3*"
							           setTextTrigger no_room :no_room6 "on the planet"
							           setTextTrigger is_room :is_room2 "The Colonists disembark to begin their new life."
							           pause

							    :no_room6
							           setVar $moveColo "JETT"

							    :is_room2
							           killalltriggers
									gosub :setWindow
							else
								send "qq*  l " & #8 & $planets[$j] & "*  snt2"&$holds_to_grab&"*  q l  " & #8 & #8 & $planetToFill & "*  snl1*"
							end
							subtract $PLANET_ORGANICS_COLONISTS $PLAYER~TOTAL_HOLDS
							if ($moveColo = "fuel")
							  		subtract $planetToFillFuelColonists $PLAYER~TOTAL_HOLDS
							elseif ($moveColo = "org")
							      subtract $planetToFillOrganicsColonists $PLAYER~TOTAL_HOLDS
							elseif ($moveColo = "equip")
							      subtract $planetToFillEquipmentColonists $PLAYER~TOTAL_HOLDS
							end
							send "q  j  y  *  l  " & #8 & #8 & $planets[$j] & "*  "
						end

                        setVar $cyclebuffer 0
						while ($PLANET_ORGANICS_COLONISTS < $PLANET_ORGANICS_COLONISTS_MIN)
						    setvar $status_message "Adding Organic Colonists"
						    killalltriggers
 							setVar $moveColo "fuel"
 							setVar $type 1						   
							if ($planetToFillFuelColonists >= $PLAYER~TOTAL_HOLDS)
									setVar $moveColo "fuel"
									setVar $type 1
							elseif ($planetToFillOrganicsColonists >= $PLAYER~TOTAL_HOLDS)
									setVar $moveColo "org"
							  		setVar $type 2
							elseif ($planetToFillOrganicsColonists >= $PLAYER~TOTAL_HOLDS)
							      setVar $moveColo "equip"
							      setVar $type 3
							else
							      setvar $PLANET_ORGANICS_COLONISTS $PLANET_ORGANICS_COLONISTS_MIN
							end

							add $cyclebuffer 1
							if ($cyclebuffer >= $cyclebufferlimit)
								setVar $cyclebuffer 1
								gosub :PLAYER~quikstats
								send "q* l " & #8 & $planetToFill & "* snt1*"
							    setTextTrigger grab_colos :grab_colos_org "The Colonists file aboard your ship, eager to head out."
							    setTextTrigger no_colos   :no_colos_org1   "There aren't that many on the planet!"
							    pause

							    :no_colos_org1
							           killalltriggers
							           setVar $moveColo "org"
							           send "snt2*"
							           setTextTrigger grab_colos :grab_colos_org "The Colonists file aboard your ship, eager to head out."
							           setTextTrigger no_colos   :no_colos_org2   "There aren't that many on the planet!"
							           pause

							    :no_colos_org2
							           killalltriggers
							           setVar $moveColo "equip"
							           send "snt3*"
							           setTextTrigger grab_colos :grab_colos_org "The Colonists file aboard your ship, eager to head out."
							           setTextTrigger no_colos   :no_colos_org3   "There aren't that many on the planet!"
							           pause

							    :grab_colos_org
							          killalltriggers
							          send "q* l " & #8 & $planets[$j] & "*  snl2*"
							          setTextTrigger no_room :no_colos_org3 "on the planet"
							          setTextTrigger is_room :is_room_org "The Colonists disembark to begin their new life."
							          pause

							    :no_colos_org3
							          killalltriggers
							          setVar $moveColo "JETT"
							          setvar $PLANET_ORGANICS_COLONISTS $PLANET_ORGANICS_COLONISTS_MIN

							    :is_room_org
									killalltriggers
									gosub :setWindow
							else
								send "q* l " & #8 & $planetToFill & "* snt"&$type&"* q* l " & #8 & $planets[$j] & "*  snl2*"
							end
							if ($moveColo = "fuel")
							  		subtract $planetToFillFuelColonists $PLAYER~TOTAL_HOLDS
							elseif ($moveColo = "org")
							      subtract $planetToFillOrganicsColonists $PLAYER~TOTAL_HOLDS
							elseif ($moveColo = "equip")
							      subtract $planetToFillEquipmentColonists $PLAYER~TOTAL_HOLDS
							end
							add $PLANET_ORGANICS_COLONISTS $PLAYER~TOTAL_HOLDS
							send "q j y * "
						end

                        setVar $cyclebuffer 0
                       while ($PLANET_EQUIPMENT_COLONISTS > $PLANET_EQUIPMENT_COLONISTS_MAX)
                            setvar $status_message "Stripping Equipment Colonists"
                            setVar $moveColo "fuel"
							if ($PLANET_EQUIPMENT_COLONISTS < $PLAYER~TOTAL_HOLDS)
								setVar $holds_to_grab $PLANET_EQUIPMENT_COLONISTS
							else
								setVar $holds_to_grab $PLAYER~TOTAL_HOLDS
							end
                            killalltriggers
                            
							add $cyclebuffer 1
							if ($cyclebuffer >= $cyclebufferlimit)
								setVar $cyclebuffer 1
								gosub :PLAYER~quikstats
                                send "q* l " & #8 & $planets[$j] & "*  snt3"&$holds_to_grab&"*  ql " & #8 & $planetToFill & "*  snl1*"
                                setTextTrigger no_room :no_room7 "on the planet"
                                setTextTrigger is_room :is_room3 "The Colonists disembark to begin their new life."
                                pause

                                :no_room7
                                       killalltriggers
                                       setVar $moveColo "org"
                                       send "snl2*"
                                       setTextTrigger no_room :no_room8 "on the planet"
                                       setTextTrigger is_room :is_room3 "The Colonists disembark to begin their new life."
                                       pause

                                :no_room8
                                       killalltriggers
                                       setVar $moveColo "equip"
                                       send "snl3*"
                                       setTextTrigger no_room :no_room9 "on the planet"
                                       setTextTrigger is_room :is_room3 "The Colonists disembark to begin their new life."
                                       pause

                                :no_room9
                                       setVar $moveColo "JETT"

                                :is_room3
									killalltriggers
									gosub :setWindow
							else
								send "q* l " & #8 & $planets[$j] & "*  snt3"&$holds_to_grab&"*  ql " & #8 & $planetToFill & "*  snl1*"
							end
							subtract $PLANET_EQUIPMENT_COLONISTS $PLAYER~TOTAL_HOLDS                                               
							if ($moveColo = "fuel")
							  		subtract $planetToFillFuelColonists $PLAYER~TOTAL_HOLDS
							elseif ($moveColo = "org")
							      subtract $planetToFillOrganicsColonists $PLAYER~TOTAL_HOLDS
							elseif ($moveColo = "equip")
							      subtract $planetToFillEquipmentColonists $PLAYER~TOTAL_HOLDS
							end
							send "qj y * l " & #8 & $planets[$j] & "*  "
                       end

                        setVar $cyclebuffer 0
                       while ($PLANET_EQUIPMENT_COLONISTS < $PLANET_EQUIPMENT_COLONISTS_MIN)
                            setvar $status_message "Adding Equipment Colonists"
                            killalltriggers
 							setVar $moveColo "fuel"
 							setVar $type 1						   
							if ($planetToFillFuelColonists >= $PLAYER~TOTAL_HOLDS)
									setVar $moveColo "fuel"
									setVar $type 1
							elseif ($planetToFillOrganicsColonists >= $PLAYER~TOTAL_HOLDS)
									setVar $moveColo "org"
							  		setVar $type 2
							elseif ($planetToFillOrganicsColonists >= $PLAYER~TOTAL_HOLDS)
							      setVar $moveColo "equip"
							      setVar $type 3
							else
							      setvar $PLANET_EQUIPMENT_COLONISTS $PLANET_EQUIPMENT_COLONISTS_MIN
							end
                           
							add $cyclebuffer 1
							if ($cyclebuffer >= $cyclebufferlimit)
								setVar $cyclebuffer 1
								gosub :PLAYER~quikstats
								send "q* l " & #8 & $planetToFill & "*  snt1*"
                                setTextTrigger grab_colos :grab_colos_equip "The Colonists file aboard your ship, eager to head out."
                                setTextTrigger no_colos   :no_colos_equip1   "There aren't that many on the planet!"
                                pause

                                :no_colos_equip1
                                       killalltriggers
                                       setVar $moveColo "org"
                                       send "snt2*"
                                       setTextTrigger grab_colos :grab_colos_equip "The Colonists file aboard your ship, eager to head out."
                                       setTextTrigger no_colos   :no_colos_equip2   "There aren't that many on the planet!"
                                       pause

                                :no_colos_equip2
                                       killalltriggers
                                       setVar $moveColo "equip"
                                       send "snt3*"
                                       setTextTrigger grab_colos :grab_colos_equip "The Colonists file aboard your ship, eager to head out."
                                       setTextTrigger no_colos   :no_colos_equip3   "There aren't that many on the planet!"
                                       pause

                                :grab_colos_equip
                                      killalltriggers
                                      send "ql " & #8 & $planets[$j] & "*  snl3*"
                                      setTextTrigger no_room :no_colos_equip3 "on the planet"
                                      setTextTrigger is_room :is_room_equip "The Colonists disembark to begin their new life."
                                      pause

                                :no_colos_equip3
                                      killalltriggers
                                      setVar $moveColo "JETT"
                                      setvar $PLANET_EQUIPMENT_COLONISTS $PLANET_EQUIPMENT_COLONISTS_MIN

                                :is_room_equip
                                      killalltriggers
									gosub :setWindow
							else
								send "q* l " & #8 & $planetToFill & "*  s * t"&$type&"* ql " & #8 & $planets[$j] & "*  s * l3* "
							end
							add $PLANET_EQUIPMENT_COLONISTS $PLAYER~TOTAL_HOLDS
							if ($moveColo = "fuel")
							  		subtract $planetToFillFuelColonists $PLAYER~TOTAL_HOLDS
							elseif ($moveColo = "org")
							      subtract $planetToFillOrganicsColonists $PLAYER~TOTAL_HOLDS
							elseif ($moveColo = "equip")
							      subtract $planetToFillEquipmentColonists $PLAYER~TOTAL_HOLDS
							end
						end
					end
					send "q* jy* "
					:doneWithThisPlanet
						killAllTriggers
		end
                add $j 1
	end
	send "qq* l " & #8 & $planetToFill & "*  c"
RETURN

:upgrade_planets
    setvar $status_message "Upgrading Planet(s)"
    gosub :setWindow
    killalltriggers
	send "'"&$SWITCHBOARD~bot_name&" massupgrade*"
	setEventTrigger		upgradeended		:upgradeended "SCRIPT STOPPED" "scripts\MomBot\Modes\Resource\massupgrade.cts"
	pause
	:upgradeended
return

:buildplanets
    killalltriggers
    setTextLineTrigger port_blown1 :buildplanetsend "<=-DANGER-=>  Scanners indicate massive debris and heavy"
    setTextLineTrigger port_here1 :buildnext "Class"
    setTextLineTrigger needs_port1 :buildnext "Warps to Sector(s)"
    send "qqzn*"
    pause

:buildnext
    killalltriggers
    setVar $doneWithPlanets FALSE
    setVar $tempPlanetCount ($planetCount)
    setVar $planetsPerSector2 $GAME~MAX_PLANETS_PER_SECTOR
    subtract $tempPlanetCount 1
    send "qqzn * l " & #8 & $planetToFill & "*mnt* qq* "
    subtract $planetsPerSector2 $tempPlanetCount
    if (($tempPlanetCount > 0) AND ($one_per_sector = TRUE))
		setvar $status_message "Already a planet in this sector."
	    gosub :setWindow
        goto :buildplanetsend
    end
	if (($planetsPerSector2 <= 0) AND ($one_per_sector = FALSE))
        goto :buildplanetsend
    end
	setvar $status_message "Building planets in sector "&$PLAYER~CURRENT_SECTOR&"*    (Needs "&$planetsPerSector2&" planet(s))"
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
	getWord CURRENTLINE $planet_type 11
	lowercase $planet_type
	striptext $planet_type ")"
	echo $planet_type&"*"

	setVar $i 1
	setVar $foundPlanet FALSE
	setVar $isAKeeper FALSE
	while (($i < $PLANET~planetcounter) AND ($foundPlanet = FALSE))
		lowercase $PLANET~planetList[$i]
		lowercase $planet_type
		getWordPos $PLANET~planetList[$i] $pos $planet_type
		if ($pos > 0)
			setVar $isAKeeper $PLANET~planetList[$i][4]
			setVar $foundPlanet TRUE
		end
		add $i 1
	end
	if ($isAKeeper = TRUE)
		setVar $PlanetLabel $name_the_planet
    else
		getRnd $PTag 100000 999999
		setVar $PlanetLabel "["&$PTag&"]"&"M()M Planet Farm "&"["&$PTag&"]"
	end
	send $PlanetLabel & "*"

#=------------------------ Planet's Been Popped ---------------------------------------
	setTextTrigger MakingItCorp     :MakingItCorp "Should this be a (C)orporate planet or (P)ersonal planet? "
	setTextTrigger LetsGo		:LetsGo       "Command [TL="
	pause

:MakingItCorp
	killTrigger MakingItCorp
	send "c"
	pause

:LetsGo
	killAllTriggers
	if ($PlanetLabel <> $name_the_planet)
		send "|l|"
		setTextLineTrigger Plisted		:Plisted "-----------------------------------------------"
		setTextTrigger Landed			:Landed "Planet command (?="
		pause

		:Plisted
				killTrigger PListed
				waitfor "> " & $PlanetLabel
				getText CURRENTLINE $landing "<" ">"
				striptext $landing " "
				send $planetToFill & "*"
				pause

		if ($nostrip = FALSE}
			# add in code to strip the plant if there is product
			:Landed
		        killAllTriggers
				send "'"&$SWITCHBOARD~bot_name&" strip "&$landing&" f o e silent*"
				setEventTrigger		stripended		:stripended "SCRIPT STOPPED" "scripts\MomBot\Modes\Resource\strip.cts"
				pause
				:stripended
		end
				send "qq*l"&$landing&"*"
				waitOn "Planet command (?="
		        killAllTriggers
				send "  z  d  y  "
				setTextLineTrigger NoDets	:NoDets "You do not have any Atomic Detonators!"
				setTextTrigger KaBoom		:KaBoom "Command [TL="
				pause

		:NoDets
				killTrigger NoDets
				setVar $SWITCHBOARD~message "Out Of Atomic Dets*"
		        gosub :get_dets

		:KaBoom
				killAllTriggers
				goto :LetsGoAgain
    else
 		killAllTriggers
    	subtract $planetsPerSector2 1
		if (($planetsPerSector2 <= 0) AND ($one_per_sector = FALSE))
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
    halt

:setWindow
	#gosub :PLAYER~quikstats
	setVar $msg "* Status: " & $status_message
	setVar $msg $msg & "* Home Sector:   " & $home
	setVar $msg $msg & "* Current Sector " & $PLAYER~CURRENT_SECTOR
	if ($PLAYER~TURNS > 0)
	        setVar $msg $msg & "* Turns: " & $PLAYER~TURNS
	end
	setVar $msg $msg & "* Farm Planet: " & $planetToFill
	setVar $msg $msg & "* ----------------"
	setVar $msg $msg & "* Fuel: " & $planetToFillFuel
	setVar $msg $msg & "* Organics: " & $planetToFillOrganics
	setVar $msg $msg & "* Equipment: " & $planetToFillEquipment
	setVar $msg $msg & "* Fuel Colonists: " & $planetToFillFuelColonists
	setVar $msg $msg & "* Organics Colonists: " & $planetToFillOrganicsColonists
	setVar $msg $msg & "* Equipment Colonists: " & $planetToFillEquipmentColonists
	setVar $msg $msg & "** Target Planet: " & $planets[$j]
	setVar $msg $msg & "* ----------------"
	setVar $msg $msg & "* Fuel: " & $PLANET_FUEL
	setVar $msg $msg & "* Organics: " & $PLANET_ORGANICS
	setVar $msg $msg & "* Equipment: " & $PLANET_EQUIPMENT
	setVar $msg $msg & "* Fuel Colonists: " & $PLANET_FUEL_COLONISTS
	setVar $msg $msg & "* Organics Colonists: " & $PLANET_ORGANICS_COLONISTS
	setVar $msg $msg & "* Equipment Colonists: " & $PLANET_EQUIPMENT_COLONISTS
	setVar $msg $msg & "* Min / Max Fuel Colo: " & $PLANET_FUEL_COLONISTS_MIN & " / " & $PLANET_FUEL_COLONISTS_MAX
	setVar $msg $msg & "* Min / Max Organics Colo: " & $PLANET_ORGANICS_COLONISTS_MIN & " / " & $PLANET_ORGANICS_COLONISTS_MAX
	setVar $msg $msg & "* Min / Max Equipment Colo: " & $PLANET_EQUIPMENT_COLONISTS_MIN & " / " & $PLANET_EQUIPMENT_COLONISTS_MAX
	setVar $msg $msg & "** Credits: " & $PLAYER~CREDITS
	setWindowContents Farm_Script $msg & $msg1
return
        





:check_ports
	killalltriggers
	send "q  q  q  z  n  *"
	setTextLineTrigger port_blown :port_blown "<=-DANGER-=>  Scanners indicate massive debris and heavy"
	setTextLineTrigger port_here :port_here "Class"
	setTextLineTrigger needs_port :build_port "Warps to Sector(s)"
	pause

	:port_here
	    killalltriggers
		setTextLineTrigger port_building :port_blown "(Under Construction - "
		waitOn "Warps to Sector(s)"
		killalltriggers

		if ((PORT.CLASS[$PLAYER~CURRENT_SECTOR] <> 3) AND ($destroyports = TRUE))
			send "l  " & #8 & #8 & $PLANET~PLANET & "*  m n t *  c  "
			waitfor "Citadel command"
			gosub :PLAYER~quikstats
			if ($PLAYER~FIGHTERS < $SHIP~SHIP_MAX_ATTACK)
			    setVar $SWITCHBOARD~message "Not Enough Fighters to Blow Port.*"
			    gosub :SWITCHBOARD~switchboard
			end
		elseif ($port)
			if (PORT.BUILDTIME[$PLAYER~CURRENT_SECTOR] > 0)
			    goto :under_construction
			end
			send "q  q  q  z  n  * o 1"
			waitfor "to quit)"
			getTExt CURRENTLINE $BUY "? (" "max"
			striptext $buy " "
			striptext $buy ","
			send $buy & "* *  "
			waitfor "Command"
			send "o 2"
			waitfor "to quit)"
			getTExt CURRENTLINE $BUY "? (" "max"
			striptext $buy " "
			striptext $buy ","
			send $buy & "* *  "
			waitfor "Command"
			send "o 3"
			waitfor "to quit)"
			getTExt CURRENTLINE $BUY "? (" "max"
			striptext $buy " "
			striptext $buy ","
			send $buy & "* * l "&$PLANET~planet&"* c "
			send "s"
			waitfor "Citadel command (?=h"
	    end
	    goto  :end_check_ports

:build_port
        killalltriggers
        send "l " & #8 & $planetToFill & "*  m n t *  c "
        waitfor "Citadel command (?"
        if ($PLAYER~CREDITS < 50000)
                send "T F 50000*"
                gosub :PLAYER~quikstats
                if ($PLAYER~CREDITS < 50000)
                        setVar $SWITCHBOARD~message "Not Enough Credits to Make Ports*"
                        send "qq* l " & #8 & $PLANET~PLANET & "*  c  *"
                end
        end
        send "q q q z n * o3y" $portname "* l " & #8 & $PLANET~PLANET & "*  c  *"
        goto :end_check_ports

:port_blown
        killalltriggers
        send "qq* l " & #8 & $PLANET~PLANET & "*  c  *"
        goto :end_check_ports

:under_construction
        killalltriggers
        setVar $SWITCHBOARD~message "Port at " & $PLAYER~CURRENT_SECTOR & " is Under Construction. " & PORT.BUILDTIME[$PLAYER~CURRENT_SECTOR] & " More Days*"
        gosub :SWITCHBOARD~switchboard
        send "l " & #8 & $PLANET~PLANET & "*  m n t *  c "
        goto :end_check_ports

:end_check_ports
        killalltriggers
        return

:get_dets
	setVar $JUMP 0
	if ($MAP~STARDOCK = 0)
		setVar $SWITCHBOARD~message "Stardock Not Known To TWX.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
    send "qq* jy* l " & $planetToFill & "* tnt1*mnt*c"
    waitFor "Citadel command ("
    setVar $creditsNeeded (($SHIP~SHIP_GENESIS_MAX*$GAME~GENESIS_COST)+($SHIP~SHIP_GENESIS_MAX*$GAME~ATOMIC_COST))
    if ($PLAYER~CREDITS < $creditsNeeded)
    	setVar $withdraw ($creditsNeeded-$PLAYER~CREDITS)
		send "T F "&$withdraw&"*"
		gosub :PLAYER~quikstats
		if ($PLAYER~CREDITS < $creditsNeeded)
		        setVar $SWITCHBOARD~message "Not Enough Credits to Make Ports*"
		        gosub :SWITCHBOARD~switchboard
		        send "qq* l " & #8 & $PLANET~PLANET & "*  c  *"
		        goto :end
		end
    end
    send "qq*"
    WAITFOR "Command [TL="

	send " C R " & $MAP~STARDOCK & "*Q "
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
	if (($PLAYER~ALIGNMENT < 1000) AND ($PLAYER~ORE_HOLDS > 0))
		setVar $adj 1
		while (SECTOR.WARPSIN[$MAP~STARDOCK][$adj] <> 0)
			setVar $JUMP SECTOR.WARPSIN[$MAP~STARDOCK][$adj]
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
		getDistance $Dist1 $PLAYER~CURRENT_SECTOR $MAP~STARDOCK
		if ($Dist1 = "-1")
			send "cf" & $PLAYER~CURRENT_SECTOR & "*" & $MAP~STARDOCK & "*q"
			waitOn "What is the starting sector"
			waitOn "Command [TL="
			getDistance $Dist1 $PLAYER~CURRENT_SECTOR $MAP~STARDOCK
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
	getDistance $Dist2 $MAP~STARDOCK $PLAYER~CURRENT_SECTOR
	if ($Dist2 = "-1")
		send "cf" & $MAP~STARDOCK & "*" & $PLAYER~CURRENT_SECTOR & "*q"
		waitOn "What is the starting sector"
		waitOn "Command [TL="
		getDistance $Dist2 $MAP~STARDOCK $PLAYER~CURRENT_SECTOR
	end

	setVar $ORE_REQ (($Dist1 + $Dist2) * 3)

	if (($PLAYER~TWARP_TYPE = "No") OR ($PLAYER~ORE_HOLDS < $ORE_REQ) OR (($PLAYER~ALIGNMENT < 1000) AND ($JUMP = 0)))
		if ($JUMP <> 0)
			send "  N  "
		end
	else
		SetVar $MOW FALSE
	end

	if ($MOW)
	else
		if ($JUMP = 0)
			send (" M " & $MAP~STARDOCK & "* Y Y * P S G Y G Q H ")
		else
			send (" Y  *  M " & $MAP~STARDOCK & "* P S G Y G Q H ")
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
			Echo "**" & ANSI_14 & "Return Trip Failed.*"
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
		Echo "*" & ANSI_14 & "Return Trip Failed.*"
				gosub :SWITCHBOARD~switchboard
		halt
	end
	return


	
:colonize
    killalltriggers
    setvar $status_message "Colonizing Planet"
    gosub :setWindow
    send "qq* l " & #8 & $planetToFill & "*m n t * q l " & #8 & $planets[$j] & "* c"
    waitfor "Planet command (?"
    send "'" & $SWITCHBOARD~bot_name & " colo s 50*"
	setEventTrigger		coloended		:coloended "SCRIPT STOPPED" "scripts\MomBot\Modes\Resource\colo.cts"
	pause
	:coloended
         send "qq* "
return

:merch
	send "'"&$SWITCHBOARD~bot_name&" merch 10000 o e skipcim*"
	setEventTrigger		merchended		:merchended "SCRIPT STOPPED" "scripts\MomBot\Modes\Cashing\merch.cts"
	pause
	:merchended
return

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"

