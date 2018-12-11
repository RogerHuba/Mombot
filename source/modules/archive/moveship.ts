logging off
	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"Moves empty ships from one sector to another."
	setVar $BOT~help[2] $BOT~tab&"                "
	setVar $BOT~help[3] $BOT~tab&"moveship [sector] {back} "
	setVar $BOT~help[4] $BOT~tab&"                  "
	setVar $BOT~help[4] $BOT~tab&"[sector] - target sector"
	setVar $BOT~help[4] $BOT~tab&"[back]   - will grab ships from target sector and bring"
	setVar $BOT~help[4] $BOT~tab&"           them back to current sector   "
	setVar $BOT~help[4] $BOT~tab&"                          "
	setVar $BOT~help[4] $BOT~tab&"           Can use either planet or SXX port in        "
	setVar $BOT~help[4] $BOT~tab&"           starting sector for fuel."
	gosub :BOT~help_file

	setVar $BOT~script_title "Ship Mover"
	gosub :BOT~banner


# ============================== START Move Ship (moveship) Sub ==============================
:moveship
:shipmove

	killalltriggers
	gosub :PLAYER~quikstats
	if ($PLAYER~TWARP_TYPE = "No")
		setVar $SWITCHBOARD~message "You need a Transwarp drive to run moveship.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $startSector $PLAYER~CURRENT_SECTOR
	isNumber $test $parm1
	if ($test)
		if ($parm1 > 0)
			setVar $moveSector $parm1
		else
			setVar $SWITCHBOARD~message "Invalid move sector entered*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
	else
		setVar $SWITCHBOARD~message "Invalid move sector entered*"
		gosub :SWITCHBOARD~switchboard
		halt
	end


	getWordPos $user_command_line $pos "back"
	if ($pos > 0)
		setVar $back TRUE
	else
		setVar $back FALSE
	end

	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	send "** "
	setVar $fuelInSector FALSE
	if (($startingLocation <> "Citadel") AND ($startingSector <> "Planet"))
		if ($startingLocation = "Command")
			if ((PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = TRUE) AND (PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = FALSE))
				if ($CREDITS < 50000)
					setVar $SWITCHBOARD~message "Need at least 50,000 credits to use port as fuel source*"
					gosub :SWITCHBOARD~switchboard
				end
				setVar $fuelInSector TRUE
			else
				setVar $i 1
				setVar $isFound false
				while (SECTOR.WARPS[$PLAYER~CURRENT_Sector][$i] > 0)
					if (SECTOR.WARPS[$PLAYER~CURRENT_Sector][$i] = $moveSector)
						setVar $isFound TRUE
					end
					add $i 1
				end
				if ($isFound = FALSE)
					setVar $SWITCHBOARD~message "No fuel port in sector, cannot run from Command Prompt*"
					gosub :SWITCHBOARD~switchboard
					halt
				end
			end
		else
			setVar $SWITCHBOARD~message "Must be in Command, Citadel or Planet prompt to run*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
	end

	if ($startingLocation = "Citadel")
		send "sq "
	end

	setVar $shipCount 0
	if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
		gosub $PLANET~PLANET~GETPLANETINFO
		send "q "
	end
	send "*"
	gosub :PLAYER~quikstats
	setVar $figcnt SECTOR.FIGS.QUANTITY[$startSector]
	setVar $figowner SECTOR.FIGS.OWNER[$startSector]
	if (($figcnt = 0) OR (($figOwner <> "belong to your Corp") AND ($figOwner <> "yours")))
		setVar $SWITCHBOARD~message "No friendly fighters deployed in current sector!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $SWITCHBOARD~message "Ship Mover starting up!  Starting ship scan..*"
	gosub :SWITCHBOARD~switchboard
	if ($back = TRUE)
		if ($startingLocation <> "Command")
			send "l "&$PLANET~PLANET&"* t * t 1* q "
		else
			if ($fuelInSector)
				send " p t * * 0 * * 0 * * 0 * * "
			end
		end
		setVar $PLAYER~CURRENT_SECTOR $startSector
		setVar $warpto $moveSector
		gosub :twarpto
		if ($twarpSuccess = FALSE)
			setVar $SWITCHBOARD~message "Can not make it to move sector, shutting down*"
			gosub :SWITCHBOARD~switchboard
			setVar $SWITCHBOARD~message "Not all ships were moved*"
			gosub :SWITCHBOARD~switchboard
			if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
				gosub :landingSub
			end
			halt
		end
	end
	:tryshipscan
		send "|wnq*@|"
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
		if ($back = TRUE)
			gosub :PLAYER~quikstats
			setVar $warpto $startSector
			gosub :twarpto
			if ($twarpSuccess = FALSE)
				setVar $SWITCHBOARD~message "Can not make it back home, shutting down*"
				gosub :SWITCHBOARD~switchboard
				if ($i >= $shipCount)
					setVar $SWITCHBOARD~message "All ships were moved*"
					gosub :SWITCHBOARD~switchboard
				else
					setVar $SWITCHBOARD~message "Not all ships were moved*"
					gosub :SWITCHBOARD~switchboard
				end
				gosub :landingSub
				halt
			end
		end
		setVar $SWITCHBOARD~message "Found "&$shipCount&" empty ships to move.*"
		gosub :SWITCHBOARD~switchboard
		setVar $i 1
		while ($i <= $shipCount)
			if ($theShips[$i] > 0)
				gosub :PLAYER~quikstats
				if ($startingLocation <> "Command")
					send "l "&$PLANET~PLANET&"* t * t 1* q "
				else
					if ($fuelInSector)
						send " p t * * 0 * * 0 * * 0 * * "
					end
				end
				if ($back = FALSE)
					send "w n "&$theShips[$i]&"* "
					setVar $PLAYER~CURRENT_SECTOR $startSector
					setVar $warpto $moveSector
					gosub :twarpto
					if ($twarpSuccess = FALSE)
						setVar $SWITCHBOARD~message "Can not make it to move sector, shutting down*"
						gosub :SWITCHBOARD~switchboard
						setVar $SWITCHBOARD~message "Not all ships were moved*"
						gosub :SWITCHBOARD~switchboard
						if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
							gosub :landingSub
						end
						halt
					end
					send "w  "
					setVar $PLAYER~CURRENT_SECTOR $moveSector
					setVar $warpto $startSector
					gosub :twarpto
					if ($twarpSuccess = FALSE)
						setVar $SWITCHBOARD~message "Can not make it back home, shutting down*"
						gosub :SWITCHBOARD~switchboard
						if ($i >= $shipCount)
							setVar $SWITCHBOARD~message "All ships were moved*"
							gosub :SWITCHBOARD~switchboard
						else
							setVar $SWITCHBOARD~message "Not all ships were moved*"
							gosub :SWITCHBOARD~switchboard
						end
						gosub :landingSub
						halt
					end
				else
					setVar $PLAYER~CURRENT_SECTOR $startSector
					setVar $warpto $moveSector
					gosub :twarpto
					if ($twarpSuccess = FALSE)
						setVar $SWITCHBOARD~message "Can not make it to move sector, shutting down*"
						gosub :SWITCHBOARD~switchboard
						setVar $SWITCHBOARD~message "Not all ships were moved*"
						gosub :SWITCHBOARD~switchboard
						if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
							gosub :landingSub
						end
						halt
					end
					send "w n "&$theShips[$i]&"* "
					setVar $PLAYER~CURRENT_SECTOR $moveSector
					setVar $warpto $startSector
					gosub :twarpto
					if ($twarpSuccess = FALSE)
						setVar $SWITCHBOARD~message "Can not make it back home, shutting down*"
						gosub :SWITCHBOARD~switchboard
						if ($i >= $shipCount)
							setVar $SWITCHBOARD~message "All ships were moved*"
							gosub :SWITCHBOARD~switchboard
						else
							setVar $SWITCHBOARD~message "Not all ships were moved*"
							gosub :SWITCHBOARD~switchboard
						end
						gosub :landingSub
						halt
					end
					send "w  "
				end
			end
			add $i 1
		end
		if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
			gosub :landingSub
		end
		setVar $SWITCHBOARD~message "All ships moved successfully.*"
		gosub :SWITCHBOARD~switchboard

halt
# ============================== END Move Ship (moveship) Sub ==============================

#========================== START LANDING SUB ===============================================
:landingSub
        send "l" $PLANET~PLANET "*z  n  z  n  *  "
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
	setVar $SWITCHBOARD~message "No Planet in Sector!*"
	gosub :SWITCHBOARD~switchboard
	return

:no_land
	killtrigger noplanet
	killtrigger planet
	killtrigger wrongone
	setVar $SWITCHBOARD~message "This ship cannot land!*"
	gosub :SWITCHBOARD~switchboard
	return

:planet
	getWord CURRENTLINE $pnum_ck 2
	stripText $pnum_ck "#"
	if ($pnum_ck <> $PLANET~PLANET)
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
	send "**"
	setVar $SWITCHBOARD~message "Incorrect Planet Number*"
	gosub :SWITCHBOARD~switchboard
	return

:planet_prompt
	killtrigger wrong_num
	setVar $currentBotPlanet $PLANET~PLANET
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
:PLAYER~quikstats
	setVar $PLAYER~CURRENT_PROMPT 		"Undefined"
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
		getWord CURRENTLINE $PLAYER~CURRENT_PROMPT 1
		stripText $PLAYER~CURRENT_PROMPT #145
		stripText $PLAYER~CURRENT_PROMPT #8
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

		setVar $PLAYER~CURRENT_word 0
		while ($wordy <> "@@@")
			if ($wordy = "Sect")
				getWord $stats $PLAYER~CURRENT_SECTOR   	($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Turns")
				getWord $stats $TURNS  			($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Creds")
				getWord $stats $CREDITS  		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Figs")
				getWord $stats $FIGHTERS   		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Shlds")
				getWord $stats $SHIELDS  		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Hlds")
				getWord $stats $TOTAL_HOLDS   		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Ore")
				getWord $stats $ORE_HOLDS    		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Org")
				getWord $stats $ORGANIC_HOLDS    	($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Equ")
				getWord $stats $EQUIPMENT_HOLDS    	($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Col")
				getWord $stats $COLONIST_HOLDS    	($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Phot")
				getWord $stats $PHOTONS   		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Armd")
				getWord $stats $ARMIDS   		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Lmpt")
				getWord $stats $LIMPETS   		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "GTorp")
				getWord $stats $GENESIS  		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "TWarp")
				getWord $stats $PLAYER~TWARP_TYPE  		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Clks")
				getWord $stats $CLOAKS   		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Beacns")
				getWord $stats $BEACONS 		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "AtmDt")
				getWord $stats $ATOMIC  		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Corbo")
				getWord $stats $CORBO   		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "EPrb")
				getWord $stats $EPROBES   		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "MDis")
				getWord $stats $MINE_DISRUPTORS   	($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "PsPrb")
				getWord $stats $PSYCHIC_PROBE  		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "PlScn")
				getWord $stats $PLANET~PLANET_SCANNER  	($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "LRS")
				getWord $stats $SCAN_TYPE    		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Aln")
				getWord $stats $ALIGNMENT    		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Exp")
				getWord $stats $EXPERIENCE    		($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Corp")
				getWord $stats $CORP   			($PLAYER~CURRENT_word + 1)
			elseif ($wordy = "Ship")
				getWord $stats $SHIP_NUMBER   		($PLAYER~CURRENT_word + 1)
			end
			add $PLAYER~CURRENT_word 1
			getWord $stats $wordy $PLAYER~CURRENT_word
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
$PLANET~PLANET~GETPLANETINFO
	send "*"
	setTextLineTrigger planetInfo :planetInfo "Planet #"
	pause

	:planetinfo
		setVar $CITADEL 0
		setVar $SECTOR_CANNON 0
		setVar $ATMOSPHERE_CANNON 0
		setVar $CITADEL_CREDITS 0
		getWord CURRENTLINE $PLANET~PLANET 2
		stripText $PLANET~PLANET "#"
		getWord CURRENTLINE $PLAYER~CURRENT_sector 5
		stripText $PLAYER~CURRENT_sector ":"
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
		getWord CURRENTLINE $PLANET~PLANET_FUEL 6
		getWord CURRENTLINE $PLANET~PLANET_FUEL_MAX 8
		stripText $PLANET~PLANET_FUEL ","
		stripText $PLANET~PLANET_FUEL_MAX ","
		pause

        :orgstart
		getWord CURRENTLINE $PLANET~PLANET_ORGANICS 5
		getWord CURRENTLINE $PLANET~PLANET_ORGANICS_MAX 7
		stripText $PLANET~PLANET_ORGANICS ","
		stripText $PLANET~PLANET_ORGANICS_MAX ","
		pause

        :equipstart
		getWord CURRENTLINE $PLANET~PLANET_EQUIPMENT 5
		getWord CURRENTLINE $PLANET~PLANET_EQUIPMENT_MAX 7
		stripText $PLANET~PLANET_EQUIPMENT ","
		stripText $PLANET~PLANET_EQUIPMENT_MAX ","
		pause

        :figstart
		getWord CURRENTLINE $PLANET~PLANET_FIGHTERS 5
		getWord CURRENTLINE $PLANET~PLANET_FIGHTERS_MAX 7
		stripText $PLANET~PLANET_FIGHTERS ","
		stripText $PLANET~PLANET_FIGHTERS_MAX ","
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
	if ($PLAYER~CURRENT_SECTOR = $warpto)
		setVar $msg "Already in that sector!"
		goto :twarpDone
	elseif (($warpto <= 0) OR ($warpto > SECTORS))
		setVar $msg "Destination sector is out of range!"
		goto :twarpDone
	end
	if ($PLAYER~TWARP_TYPE = "No")
		setVar $msg "No T-warp drive on this ship!"
		goto :twarpDone
	end

	# check adj's for Dock.. if present, then we don't need a jump sector.
	setVar $a 1
	setVar $START_SECTOR $PLAYER~CURRENT_SECTOR
	setVar $WeAreAdjDock FALSE
	while ($a <= SECTOR.WARPCOUNT[$START_SECTOR])
		setVar $adj_start SECTOR.WARPS[$START_SECTOR][$a]
		if ($adj_start = $stardock)
			setVar $WeAreAdjDock TRUE
		end
		add $a 1
	end
	setVar $RED_adj 0
	if (($ALIGNMENT < 1000) AND ($WeAreAdjDock = FALSE) AND ($warpto = $stardock))
		gosub :FindJumpSector
		if ($RED_adj <> 0)
			setVar $original $warpto
			setVar $WARPTO $RED_adj
		else
			waitfor "Command [TL="
			send "'{" & $bot_name & "} - Cannot Find Jump Sector Adjacent Dock**"
			halt
		end
	end
	if ($RED_adj <> 0)
		goto :twarp_lock
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
	if (($twarpSuccess = TRUE) AND ($original = $stardock))
		send "* m "&$STARDOCK&"*  za9999* * "
	end

return

:FindJumpSector
	setVar $e 1
	setVar $RED_adj 0
	send "q tnt1* q*"
	while (SECTOR.WARPSIN[$stardock][$e] > 0)
		setVar $RED_adj SECTOR.WARPSIN[$stardock][$e]
		send "m " & $RED_adj & "* y"
		setTextTrigger TwarpBlind 			:TwarpBlind "Do you want to make this jump blind? "
		setTextTrigger TwarpLocked			:TwarpLocked "All Systems Ready, shall we engage? "
		setTextLineTrigger TwarpVoided			:TwarpVoided "Danger Warning Overridden"
		setTextLineTrigger TwarpAdj			:TwarpAdj "<Set NavPoint>"
		pause
		:TwarpAdj
		killAllTriggers
		send " * "
		return

		:TwarpVoided
		killAllTriggers
		send " N N "
		goto :TryingNextAdj

		:TwarpLocked
		killAllTriggers
		goto :SectorLocked

		:TwarpBlind
		killAllTriggers
		send " N "

		:TryingNextAdj
    	add $e 1
	end

	:NoAdjsFound
		setVar $RED_adj 0
		return

	:SectorLocked
		return

# ======================    END INTERNAL TWARP SUBROUTINE     ==========================

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
