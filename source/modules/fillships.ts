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
loadVar $rylos
loadVar $alpha_centauri
loadVar $command

fileExists $doesHelpFileExist "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt"
if ($doesHelpFileExist <> TRUE)
	write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "- "&$command&"                                              " 
	write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "                                                            " 
	write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    Fills all empty ships with fighters from sector.        " 
	write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "                                                            " 

	send "'{" $bot_name "} - Writing help file for this command in Help directory.*"
end
# ============================== START Move Ship (moveship) Sub ==============================
:emptyships
	killalltriggers
	gosub :quikstats
	setVar $startShip $SHIP_NUMBER
	setVar $startingLocation $CURRENT_PROMPT
	setVar $total_figs 0
	send "** "
	setVar $fuelInSector FALSE
	if (($startingLocation <> "Citadel") AND ($startingSector <> "Planet") AND ($startingLocation <> "Command"))
		send "'{" $bot_name "} - Must be in Command, Citadel or Planet prompt to run*"
		halt
	end

	if ($startingLocation = "Citadel")
		send "q "
	end
	setVar $shipCount 0
	if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
		gosub :getPlanetInfo
		send "q "
	end
	send "'{" $bot_name "} - Ship Filler starting up!  Starting ship scan..*"
	:tryshipscan
		send "wnq*@"
		setTextLineTrigger statlinetrig :shipline "-----------------------------------------------------------------------------"
		setTextLineTrigger towalreadyon :continuetowon "You shut off your Tractor Beam."
		pause
		:continuetowon
			killtrigger statlinetrig
			goto :tryshipscan

	:shipline
		killtrigger towalreadyon
		setVar $line CURRENTLINE
		getWordPos $line $pos "Average Interval Lag:"
		getWord $line $temp 1
		isNumber $result $temp
		if (($result = TRUE))
			if ($temp > 0)
				add $shipCount 1
				setVar $theShips[$shipCount] $temp
			end
		end
		if ($pos > 0)
			goto :gotShips
		else
			setTextLineTrigger getLine :shipline
			pause
		end


	:gotShips
		send "'{" $bot_name "} - Found "&$shipCount&" empty ships to strip.*"
		setVar $i 1
		while ($i <= $shipCount)
			if ($theShips[$i] > 0)
				send "x "&$theShips[$i]&"*   *   "
				gosub :quikstats
				gosub :do_topoff
			end
			add $i 1
		end
		send "x "&$startShip&"*  *   "
		if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
			gosub :landingSub
		end
		send "'{" $bot_name "} - Done filling empty ships.*"
		
halt
# ============================== END Move Ship (moveship) Sub ==============================

:do_topoff
	:do_topoff_again
		killalltriggers
		send " F"
		waitOn "Your ship can support up to"
		getWord CURRENTLINE $ftrs_to_leave 10
		stripText $ftrs_to_leave ","
		stripText $ftrs_to_leave " "
		if ($ftrs_to_leave < 1)
			setVar $ftrs_to_leave 1
		end
		send " " & $ftrs_to_leave & " * C D"
		setTextLineTrigger topoff_success :topoff_success "Done. You have "
		setTextLineTrigger topoff_failure1 :do_topoff_again "You don't have that many fighters available."
		setTextLineTrigger topoff_failure2 :do_topoff_again "Too many fighters in your fleet!  You are limited to"
		pause
	:topoff_success
return

#========================== START LANDING SUB ===============================================
:landingSub
        send "l" $PLANET "*z  n  z  n  *  "
	setVar $sucessfulCitadel FALSE
	setVar $sucessfulPlanet FALSE
	setTextLineTrigger noplanet :noplanet "There isn't a planet in this sector."
	setTextLineTrigger no_land :no_land "since it couldn't possibly stand"
	setTextLineTrigger planet :planet "Planet #"
	setTextLineTrigger wrongone :wrong_num "That planet is not in this sector."
	pause

:noplanet
	killtrigger no_land
	killtrigger planet
	killtrigger wrongone
	send "'{" $bot_name "} - No Planet in Sector!*"
	return

:no_land
	killtrigger noplanet
	killtrigger planet
	killtrigger wrongone
	send "'{" $bot_name "} - This ship cannot land!*"
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
	setTextTrigger wrong_num :wrong_num "That planet is not in this sector."
	setTextTrigger planet :planet_prompt "Planet command"
	pause

:wrong_num
	killtrigger planet
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
	killtrigger in_cit
	killtrigger nocitallowed
	killtrigger build_cit
	killtrigger citnotbuiltyet
	setVar $sucessfulCitadel TRUE
	setVar $startingLocation "Citadel"
return
#============================== END LANDING SUB =============================================

#=================================QUIKSTATS================================================
:quikstats
	setVar $CURRENT_PROMPT 		"Undefined"
	killtrigger noprompt
	killtrigger prompt
	killtrigger prompt1
	killtrigger prompt2
	killtrigger prompt3
	killtrigger prompt4
	killtrigger statlinetrig
	killtrigger getLine2
	setTextLineTrigger 	prompt		:allPrompts	 	#145 & #8
	setTextLineTrigger 	statlinetrig 	:statStart 		#179
	send #145&"/"
	pause

	:allPrompts
		getWord CURRENTLINE $CURRENT_PROMPT 1
		stripText $CURRENT_PROMPT #145
		stripText $CURRENT_PROMPT #8
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
		getWord CURRENTLINE $current_sector 5
		stripText $current_sector ":"
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
		killtrigger citadelstart
		killtrigger cannon

return
# ==============================  END PLANET INFO SUBROUTINE  =================

# ======================    START INTERNAL TWARP SUBROUTINE     ==========================
:twarpto
	setVar $twarpSuccess FALSE
	setVar $original 1
	if ($CURRENT_SECTOR = $warpto)
		setVar $msg "Already in that sector!"
		goto :twarpDone
	elseif (($warpto <= 0) OR ($warpto > SECTORS))
		setVar $msg "Destination sector is out of range!"
		goto :twarpDone
	end
	if (($ALIGNMENT < 1000) AND ($warpto = $stardock) AND ($backdoor > 10) AND ($backdoor <> $current_sector))
		setVar $original $warpto
		setVar $WARPTO $BACKDOOR
	end
	if ($TWARP_TYPE = "No")
		setVar $msg "No T-warp drive on this ship!"
		goto :twarpDone
	end
	if ($startingLocation = "Citadel")
		send "q t*t1* q q * c u y q mz" $warpto "*"
	elseif ($startingLocation = "Planet")
		send "t*t1* q q * c u y q mz" $warpto "*"
	else
		send "q q q * c u y q mz" $warpto "*"
	end
	setTextTrigger there :adj_warp "You are already in that sector!"
	setTextLineTrigger adj_warp :adj_warp "Sector  : "&$warpto&" "
	setTextTrigger locking :locking "Do you want to engage the TransWarp drive?"
	setTextTrigger igd :twarpIgd "An Interdictor Generator in this sector holds you fast!"
	setTextTrigger noturns :twarpPhotoned "Your ship was hit by a Photon and has been disabled"
	setTextTrigger noroute :twarpNoRoute "Do you really want to warp there? (Y/N)"
	pause

	:adj_warp
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		send "z*"
		goto :twarp_adj
	:locking
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		send "y"
		setTextLineTrigger twarp_lock :twarp_lock "TransWarp Locked"
		setTextLineTrigger no_twrp_lock :no_twarp_lock "No locating beam found"
		setTextLineTrigger twarp_adj :twarp_adj "<Set NavPoint>"
		setTextLineTrigger no_fuel :twarpNoFuel "You do not have enough Fuel Ore"
		pause

	:twarpNoFuel
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		killtrigger twarp_lock
		killtrigger no_twrp_lock
		killtrigger twarp_adj
		killtrigger no_fuel
		setVar $msg "Not enough fuel for T-warp."
		goto :twarpDone

	:twarp_adj
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		killtrigger twarp_lock
		killtrigger no_twrp_lock
		killtrigger twarp_adj
		killtrigger no_fuel
		send "z* "
		setVar $msg "That sector is next door, just plain warping."
		setVar $twarpSuccess TRUE
		goto :twarpDone

	:twarpNoRoute
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		killtrigger twarp_lock
		killtrigger no_twrp_lock
		killtrigger twarp_adj
		killtrigger no_fuel
		send "n* z* "
		setVar $msg "No route available to that sector!"
		goto :twarpDone

	:no_twarp_lock
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		killtrigger twarp_lock
		killtrigger no_twrp_lock
		killtrigger twarp_adj
		killtrigger no_fuel
		send "n* z* "
		setSectorParameter $warpto "FIGSEC" FALSE
		setVar $msg "No fighters at T-warp point!"
		goto :twarpDone

	:twarpIgd
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		killtrigger twarp_lock
		killtrigger no_twrp_lock
		killtrigger twarp_adj
		killtrigger no_fuel
		setVar $msg "My ship is being held by Interdictor!"
		goto :twarpDone

	:twarpPhotoned
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		killtrigger twarp_lock
		killtrigger no_twrp_lock
		killtrigger twarp_adj
		killtrigger no_fuel
		setVar $msg "I have been photoned and can not T-warp!"
		goto :twarpDone

	:twarp_lock
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		killtrigger twarp_lock
		killtrigger no_twrp_lock
		killtrigger twarp_adj
		killtrigger no_fuel
		setSectorParameter $warpto "FIGSEC" TRUE
		send "y* "

		setVar $msg "T-warp completed."
		setVar $twarpSuccess TRUE
	:twarpDone
	if (($twarpSuccess = TRUE) AND ($warpto = $BACKDOOR) AND ($original = $stardock))
		send "* m "&$STARDOCK&"*  za9999* * "
	end

return
# ======================    END INTERNAL TWARP SUBROUTINE     ==========================
