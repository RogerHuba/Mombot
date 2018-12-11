	loadVar $bot_name
	loadVar $user_command_line
	loadVar $parm1
	loadVar $parm2
	loadVar $parm3
	loadVar $parm4
	loadVar $parm5
	loadVar $parm6
	loadVar $parm7
	loadVar $parm8
	loadVar $command
	setVar $planet 0
	saveVar $planet
gosub :variables
goto :start_script
:inac
	gosub :quikstats
:execute
	goSub :getSectorData
	goSub :fastAttack
	goto :execute

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
	gosub :setConnectionTriggers
	send #145&"/"
	pause

	:allPrompts
		getWord CURRENTLINE $CURRENT_PROMPT 1
		stripText $CURRENT_PROMPT #145
		stripText $CURRENT_PROMPT #8
		setTextLineTrigger 	prompt		:allPrompts	 	#145 & #8
		gosub :setConnectionTriggers
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
			gosub :setConnectionTriggers
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


:getSectorData

	killalltriggers
	setVar $sectorData ""
	setTextLineTrigger sectorStart :sectorsline "Sector  :"
	setDelayTrigger timer :wait 3000
	gosub :setConnectionTriggers
	send "*"
	pause

	:sectorsline
		killAllTriggers
		setVar $line CURRENTANSILINE
		setVar $line $STARTLINE&$line&$ENDLINE
		setVar $sectorData $sectorData&$line
		getWordPos $line $pos "Warps to Sector(s) "
		if ($pos > 0)
			goto :gotSectorData
		else
			gosub :setConnectionTriggers
			setTextLineTrigger getLine :sectorsline
			setDelayTrigger timer :wait 3000
		end
		pause

	:gotSectorData
		killAllTriggers
		gosub :setConnectionTriggers
		goSub :getTraders
		goSub :getEmptyShips	
		goSub :getFakeTraders
return

:getTraders

	killAllTriggers
	getWordPos $sectorData $posTrader "[0m[33mTraders [1m:"
	if ($posTrader > 0)
		getText $sectorData $traderData "[0m[33mTraders [1m:" "[0m[1;32mWarps to Sector(s) [33m:"
		setVar $traderData $STARTLINE&$traderData
		getText $traderData $temp $STARTLINE $ENDLINE 
		setVar $realTraderCount 0
		while ($temp <> "")
			getLength $STARTLINE&$temp&$ENDLINE $length
			cutText $traderData $traderData ($length+1) 9999 
			stripText $temp $STARTLINE
			stripText $temp $ENDLINE
			stripText $temp "[0m          "
			stripText $temp "[0m[33mTraders [1m:"
			getWordPos $temp $pos "[0;32m w/"
			getWordPos $temp $pos2 "[0;35m[[31mOwned by[35m]"
			
			if (($pos > 0) AND ($pos2 <= 0))
				
				setVar $j 1
				setVar $isFound FALSE
				while (($j < $ranksLength) AND ($isFound = FALSE))
					getWordPos $temp $pos $ranks[$j]	
					if ($pos > 0)
						getLength $ranks[$j] $length
						cutText $temp $temp ($pos+$length+1) 9999
						if ($j <= 10)
							if (($targetingPerson = TRUE) AND ($j = 9))
								setVar $TRADERS[($realTraderCount+1)][2] FALSE
							else
								setVar $TRADERS[($realTraderCount+1)][2] TRUE
							end
						else
							setVar $TRADERS[($realTraderCount+1)][2] FALSE
						end
						setVar $isFound TRUE
					end
					add $j 1
				end
				getWordPos $temp $pos "[[1;36m"
				if ($pos > 0)
					getText $temp $tempCorp "[[1;36m" "[0;34m]"
					stripText $tempCorp ""
				else
					setVar $tempCorp 99999
				end	
				replaceText $temp "[0;34m" "[34m"
				getWordPos $temp $pos "[34m"
				cutText $temp $temp 1 $pos
				stripText $temp ""
				setVar $TRADERS[($realTraderCount+1)] $temp
				setVar $TRADERS[($realTraderCount+1)][1] $tempCorp
				add $realTraderCount 1
			end
			getText $traderData $temp $STARTLINE $ENDLINE 	
		end	
	else
		setVar $realTraderCount 0
	end

return

:getEmptyShips
	killAllTriggers
	getWordPos $sectorData $posShips "[0m[33mShips   [1m:"
	if ($posShips > 0)
		getText $sectorData $shipData "[0m[33mShips   [1m:" "[0m[1;32mWarps to Sector(s) [33m:"
		setVar $shipData $STARTLINE&$shipData
		getText $shipData $temp $STARTLINE $ENDLINE 
		setVar $emptyShipCount 0
		while ($temp <> "")
			getLength $STARTLINE&$temp&$ENDLINE $length
			cutText $shipData $shipData ($length+1) 9999 
			stripText $temp $STARTLINE
			stripText $temp "  "
			stripText $temp $ENDLINE
			getWordPos $temp $pos2 "[0;35m[[31mOwned by[35m]"
			if ($pos2 > 0)
				setVar $EMPTYSHIPS[($emptyShipCount+1)] $temp
				add $emptyShipCount 1
			end
			getText $shipData $temp $STARTLINE $ENDLINE 
		end
	else
		setVar $emptyShipCount 0
	end
						
return
:getFakeTraders
	killAllTriggers
	getWordPos $sectorData $posShips "[0m[33mShips   [1m:"
	getWordPos $sectorData $posTraders "[0m[33mTraders [1m:"
	
	if ($posTraders > 0)
		getText $sectorData $fakeData "[1;32mSector  [33m:" "[0m[33mTraders [1m:"
		setVar $fakeData $STARTLINE&$fakeData
		getText $fakeData $temp $STARTLINE $ENDLINE 
		setVar $fakeTraderCount 0
		while ($temp <> "")
			getLength $STARTLINE&$temp&$ENDLINE $length
			cutText $fakeData $fakeData ($length+1) 9999 
			stripText $temp $STARTLINE
			stripText $temp "  "
			stripText $temp $ENDLINE
			getWordPos $temp $pos "33m,[0;32m w/ "
			getWordPos $temp $pos2 "[33m, [0;32mwith"
			getWordPos $temp $pos3 "[0;35m[[31mOwned by[35m]"
			if ((($pos > 0) OR ($pos2 > 0)) AND ($pos3 <= 0))
				setVar $FAKETRADERS[($fakeTraderCount+1)] $temp
				add $fakeTraderCount 1
			end
			getText $fakeData $temp $STARTLINE $ENDLINE 
			
		end
		
	elseif ($posShips > 0)
		getText $sectorData $fakeData "[1;32mSector  [33m:" "[0m[33mShips   [1m:"
		setVar $fakeData $STARTLINE&$fakeData
		getText $fakeData $temp $STARTLINE $ENDLINE 
		setVar $fakeTraderCount 0
		while ($temp <> "")
			getLength $STARTLINE&$temp&$ENDLINE $length
			cutText $fakeData $fakeData ($length+1) 9999 
			stripText $temp $STARTLINE
			stripText $temp "  "
			stripText $temp $ENDLINE
			getWordPos $temp $pos "33m,[0;32m w/ "
			getWordPos $temp $pos2 "[33m, [0;32mwith"
			getWordPos $temp $pos3 "[0;35m[[31mOwned by[35m]"
			if ((($pos > 0) OR ($pos2 > 0)) AND ($pos3 <= 0))
				setVar $FAKETRADERS[($fakeTraderCount+1)] $temp
				add $fakeTraderCount 1
			end
			getText $fakeData $temp $STARTLINE $ENDLINE 
			
		end
	else
		getText $sectorData $fakeData "[1;32mSector  [33m:" "[0m[1;32mWarps to Sector(s) [33m:"
		setVar $fakeData $STARTLINE&$fakeData
		getText $fakeData $temp $STARTLINE $ENDLINE 
		setVar $fakeTraderCount 0
		while ($temp <> "")
			getLength $STARTLINE&$temp&$ENDLINE $length
			cutText $fakeData $fakeData ($length+1) 9999 
			stripText $temp $STARTLINE
			stripText $temp "  "
			stripText $temp $ENDLINE
			getWordPos $temp $pos "33m,[0;32m w/ "
			getWordPos $temp $pos2 "[33m, [0;32mwith"
			getWordPos $temp $pos3 "[0;35m[[31mOwned by[35m]"
			if ((($pos > 0) OR ($pos2 > 0)) AND ($pos3 <= 0))
				setVar $FAKETRADERS[($fakeTraderCount+1)] $temp
				add $fakeTraderCount 1
			end
			getText $fakeData $temp $STARTLINE $ENDLINE 
			
		end
		
	end
	
	
						
return

:fastAttack
	setVar $attackString ""
	setVar $targetString  "a z "
	setVar $targetShotgunString "a z z y z"&$SHIP_MAX_ATTACK&"* * a z z * y z"&$SHIP_MAX_ATTACK&"* * a z z * * y z"&$SHIP_MAX_ATTACK&"* * "
	setVar $isFound FALSE
	getWordPos $sectorData $beaconPos "[0m[35mBeacon  [1;33m:"
	if ($FIGHTERS <= 0)
		if ($refurbString <> "")
			gosub :setConnectionTriggers
			send $refurbString
			waitOn "B  Fighters        :"
			getWord CURRENTLINE $figsToBuy 8
			waitOn "C  Shield Points   :"
			getWord CURRENTLINE $shieldsToBuy 9
			send "b "&$figsToBuy&"* c "&$shieldsToBuy&"* q q q * "
		end
		gosub :quikstats
		if ($FIGHTERS <= 0)
			send $refurbString
			echo ANSI_12 "*You have no fighters.*" ANSI_7
			halt
		end
	end
	if ((($CURRENT_SECTOR > 10) AND ($CURRENT_SECTOR <> STARDOCK)) AND ($beaconPos > 0))
		setVar $targetString $targetString&"* "
	end
	if (($emptyShipCount + $fakeTraderCount + $realTraderCount) > 0)
		setVar $i 0
		while ($i < ($emptyShipCount + $fakeTraderCount))
			setVar $targetString $targetString&"* "
			add $i 1
		end
		setVar $c 1
		while (($c <= $realTraderCount) AND ($isFound = FALSE))
			if ((($CURRENT_SECTOR <= 10) OR ($CURRENT_SECTOR = STARDOCK)) AND $TRADERS[$c][2] = TRUE)
				setVar $targetString $targetString&"* "
			elseif ($TRADERS[$c][1] = $CORP)
				setVar $targetString $targetString&"* "	
			elseif (($targetingCorp = TRUE) AND ($TRADERS[$c][1] <> $target))
				setVar $targetString $targetString&"* "
			elseif (($targetingPerson = TRUE) AND ($TRADERS[$c] <> $target))
				setVar $targetString $targetString&"* "
			else
				setVar $isFound TRUE
				setVar $targetString $targetString&"z y z"
				
			end
			add $c 1
		end
	
	else
		echo ANSI_12 "*You have no targets.*" ANSI_7
		return
	end
	if ($isFound = TRUE)
		setVar $attackString ""
		setVar $killString ""
		setVar $count 8
		while (($count > 0) AND ($fighters > 0))
			if ($fighters > $SHIP_MAX_ATTACK)
				setVar $attack_amount $SHIP_MAX_ATTACK
				setVar $fighters ($fighters-$SHIP_MAX_ATTACK)
			else
				setVar $attack_amount $fighters
				setVar $fighters 0
			end
			if ($shotgun)
				setVar $attackString $targetShotgunString
			else
				if ($doubletap)
					setVar $attackString $targetString&$attack_amount&"* * "&$targetString&$attack_amount&"* * "
				else
					setVar $attackString $targetString&$attack_amount&"* * "
				end
			end

			subtract $count 1
			if ($refurbString <> "")
				setVar $killString $killString&$attackString&$refurbString&"b "&$attack_amount&"* q q q * "
			else
				setVar $killString $killString&$attackString&$attackString
			end
		end
		send $killString
		gosub :quikstats
		if ($FIGHTERS < $SHIP_FIGHTERS_MAX)
			if ($CURRENT_SECTOR = STARDOCK)
				send "p ss ys *p"
			elseif (($CURRENT_SECTOR = 1) OR (PORT.CLASS[$CURRENT_SECTOR] = 0))
				send "p ty"
			else
				echo "*No known class 0 or 9 port here to refurb at.*"
			end
			gosub :setConnectionTriggers
			waitOn "B  Fighters        :"
			getWord CURRENTLINE $figsToBuy 8
			waitOn "C  Shield Points   :"
			getWord CURRENTLINE $shieldsToBuy 9
			send "b "&$figsToBuy&"* c "&$shieldsToBuy&"* q q q * "
		end
	else
		echo ANSI_12 "*You have no valid targets.*" ANSI_7
		return
	end
return

:getShipStats
	send "c;q"
	setTextLineTrigger	getshipoffense		:shipoffenseodds	"Offensive Odds: "
	setTextLineTrigger	getshipfighters 	:shipmaxfigsperattack	" TransWarp Drive:   "
	setTextLineTrigger	getshipmines 		:shipmaxmines		" Mine Max:  "
	gosub :setConnectionTriggers
	pause
	
	:shipoffenseodds
		getWordPos CURRENTANSILINE $pos "[0;31m:[1;36m1"
		if ($pos > 0)
			getText CURRENTANSILINE $SHIP_OFFENSIVE_ODDS "Offensive Odds[1;33m:[36m " "[0;31m:[1;36m1"
			stripText $SHIP_OFFENSIVE_ODDS "."
			stripText $SHIP_OFFENSIVE_ODDS " "
			gettext CURRENTANSILINE $SHIP_FIGHTERS_MAX "Max Fighters[1;33m:[36m" "[0;32m Offensive Odds"
			stripText $SHIP_FIGHTERS_MAX ","
			stripText $SHIP_FIGHTERS_MAX " "
		end
		pause
	:shipmaxmines
		getText CURRENTLINE $SHIP_MINES_MAX "Mine Max:" "Beacon Max:"
		stripText $SHIP_MINES_MAX " "
		pause
	
	:shipmaxfigsperattack
		getWordPos CURRENTANSILINE $pos "[0m[32m Max Figs Per Attack[1;33m:[36m"
		if ($pos > 0)
			getText CURRENTANSILINE $SHIP_MAX_ATTACK "[0m[32m Max Figs Per Attack[1;33m:[36m" "[0;32mTransWarp"
			striptext $SHIP_MAX_ATTACK " "
		end	
return

# ==============================  START PLANET INFO SUBROUTINE  =================
:getPlanetInfo
	send "*"
	setTextLineTrigger planetInfo :planetInfo "Planet #"
	pause

	:planetinfo
		killalltriggers
		setVar $CITADEL 0
		setVar $SECTOR_CANNON 0
		setVar $ATMOSPHERE_CANNON 0
		setVar $CITADEL_CREDITS 0
		getWord CURRENTLINE $PLANET 2
		stripText $PLANET "#"
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

:start_script
	:cit_kill
	killalltriggers
	gosub :quikstats	
	setVar $startingLocation $CURRENT_PROMPT
	setVar $targetingPerson FALSE
	setVar $targetingCorp FALSE
	setVar $target ""
	if ($parm1 <> "on")
        	send "'{" $bot_name "} - Please use - dockkill [on/off]*"
		halt
	else
		if ($startingLocation <> "Command") AND ($startingLocation <> "<StarDock>")
			send "'{" $bot_name "} - Stardock Killer must be run from the Command or StarDock Prompt*"
			halt
		end
		isNumber $test $parm2
		if ($test)
			if ($parm2 > 0)
				setVar $targetingCorp TRUE
				setVar $target $parm2
			end
		else
			getWordPos $parm2 $pos #34
			if ($pos > 0)	
				setVar $user_command_line $user_command_line&" "
				getText $user_command_line $target " "&#34 #34&" "
				if ($target <> "")
					setVar $targetingPerson TRUE
					lowercase $target
					stripText $user_command_line " "&#34&$target&#34&" "
				else
					setVar $targetingPerson FALSE
				end
			end
		end
		getWordPos $user_command_line $pos "dt"
		if ($pos > 0)
			setVar $doubletap TRUE
		else
			setVar $doubletap FALSE
		end
		getWordPos $user_command_line $pos "sg"
		if ($pos > 0)
			setVar $shotgun TRUE
		else
			setVar $shotgun FALSE
		end
		:start_cit_kill
	end		

:start

	if ($startingLocation = "<StarDock>")
		send "q "
	end
	gosub :getShipStats

:warning
	if ($CURRENT_SECTOR = STARDOCK)
		setVar $refurbString "p s s p "
	elseif (($CURRENT_SECTOR = 1) OR (PORT.CLASS[$CURRENT_SECTOR] = 0))
		setVar $refurbString "p t "
	else
		setVar $refurbString ""
		echo "*No known class 0 or 9 port here to refurb at.*"
	end
	if ($refurbString <> "")
		if ($CURRENT_SECTOR = STARDOCK)
			send "p ss ys *p"
		elseif (($CURRENT_SECTOR = 1) OR (PORT.CLASS[$CURRENT_SECTOR] = 0))
			send "p ty"
		else
			echo "*No known class 0 or 9 port here to refurb at.*"
		end
		gosub :setConnectionTriggers
		waitOn "B  Fighters        :"
		getWord CURRENTLINE $figsToBuy 8
		waitOn "C  Shield Points   :"
		getWord CURRENTLINE $shieldsToBuy 9
		if ($CURRENT_SECTOR = STARDOCK)
			setVar $leavestring "b "&$figsToBuy&"* c "&$shieldsToBuy&"* q q q "
		else
			setVar $leavestring "b "&$figsToBuy&"* c "&$shieldsToBuy&"* q "
		end
		send $leavestring
	end
	send "'{" $bot_name "} - StarDock Killer :: Powering Up!*"
	if ($targetingPerson)
		send "'{" $bot_name "} - StarDock Killer Targeting "&$target&" running in sector "&$current_sector&".*"
	elseif ($targetingCorp)
		send "'{" $bot_name "} - StarDock Killer Targeting Corp "&$target&" running in sector "&$current_sector&".*"
	else
		send "'{" $bot_name "} - StarDock Killer running in sector "&$current_sector&".*"
	end
	if ($shotgun)
		send "'{" $bot_name "} - Shotgun mode enabled.*"
	elseif ($doubletap)
		send "'{" $bot_name "} - Doubletap mode enabled.*"
	end
	#send "q "

	goto :execute

:variables
	setVar $ranksLength 	47
	setArray $ranks 	$ranksLength
	setVar $ranks[1] 	"36mCivilian"
	setVar $ranks[2] 	"36mPrivate 1st Class"
	setVar $ranks[3] 	"36mPrivate"
	setVar $ranks[4] 	"36mLance Corporal"
	setVar $ranks[5] 	"36mCorporal"
	setVar $ranks[6] 	"36mStaff Sergeant"
	setVar $ranks[7] 	"36mGunnery Sergeant"
	setVar $ranks[8] 	"36m1st Sergeant"
	setVar $ranks[9] 	"36mSergeant Major"
	setVar $ranks[10]	"36mSergeant"
	setVar $ranks[11] 	"31mAnnoyance"
	setVar $ranks[12] 	"31mNuisance 3rd Class"
	setVar $ranks[13] 	"31mNuisance 2nd Class"
	setVar $ranks[14] 	"31mNuisance 1st Class"
	setVar $ranks[15] 	"31mMenace 3rd Class"
	setVar $ranks[16] 	"31mMenace 2nd Class"
	setVar $ranks[17] 	"31mMenace 1st Class"
	setVar $ranks[18] 	"31mSmuggler 3rd Class"
	setVar $ranks[19] 	"31mSmuggler 2nd Class"
	setVar $ranks[20] 	"31mSmuggler 1st Class"
	setVar $ranks[21] 	"31mSmuggler Savant"
	setVar $ranks[22] 	"31mRobber"
	setVar $ranks[23] 	"31mTerrorist"
	setVar $ranks[24] 	"31mInfamous Pirate"
	setVar $ranks[25] 	"31mNotorious Pirate"
	setVar $ranks[26] 	"31mDread Pirate"
	setVar $ranks[27] 	"31mPirate"
	setVar $ranks[28] 	"31mGalactic Scourge"
	setVar $ranks[29] 	"31mEnemy of the State"
	setVar $ranks[30] 	"31mEnemy of the People"
	setVar $ranks[31] 	"31mEnemy of Humankind"
	setVar $ranks[32] 	"31mHeinous Overlord"
	setVar $ranks[33] 	"31mPrime Evil"
	setVar $ranks[34] 	"36mChief Warrant Officer"
	setVar $ranks[35] 	"36mWarrant Officer"
	setVar $ranks[36] 	"36mEnsign"
	setVar $ranks[37] 	"36mLieutenant J.G."
	setVar $ranks[38] 	"36mLieutenant Commander"
	setVar $ranks[39] 	"36mLieutenant"
	setVar $ranks[40] 	"36mCommander"
	setVar $ranks[41] 	"36mCaptain"
	setVar $ranks[42] 	"36mCommodore"
	setVar $ranks[43] 	"36mRear Admiral"
	setVar $ranks[44] 	"36mVice Admiral"
	setVar $ranks[45] 	"36mFleet Admiral"	
	setVar $ranks[46] 	"36mAdmiral"
	setVar $ENDLINE 	"_ENDLINE_"
	setVar $STARTLINE 	"_STARTLINE_"

return

:Discod
	   	setVar $TagLine				"[Stardock Killer]"
		setVar $TagLineB			"[Stardock Killer]"
		killAllTriggers
	   	Echo "**" & ANSI_14 & $TagLineB & ANSI_15 & " Disconnected **"
	   	:Disco_Test
		if (CONNECTED <> TRUE)
			setDelayTrigger		Emancipate_CPU		:Emancipate_CPU 3000
			Echo "**" & ANSI_14 & $TagLineB & ANSI_15 & " Auto Resume Initiated - Awaiting Connection!**"
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
			send ("'{" & $bot_name & "} "&$TagLineB&" - Restarting!**")
		    	waitfor "Message sent on sub-space channel"
			goto :inac
		elseif ($CURRENT_PROMPT = "Citadel")
			send ("'{" & $bot_name & "} "&$TagLineB&" - Restarting!**")
			waitfor "Message sent on sub-space channel"
	   		send "qqqq**"
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

:setConnectionTriggers
	killtrigger discod1
	killtrigger discod2
	SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
	SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."

return
