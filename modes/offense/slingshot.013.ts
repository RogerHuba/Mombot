	setVar $ranksLength 47
	setArray $ranks $ranksLength
	setVar $ranks[1] "36mCivilian"
	setVar $ranks[2] "36mPrivate 1st Class"
	setVar $ranks[3] "36mPrivate"
	setVar $ranks[4] "36mLance Corporal"
	setVar $ranks[5] "36mCorporal"
	setVar $ranks[6] "36mStaff Sergeant"
	setVar $ranks[7] "36mGunnery Sergeant"
	setVar $ranks[8] "36m1st Sergeant"
	setVar $ranks[9] "36mSergeant Major"
	setVar $ranks[10] "36mSergeant"
	setVar $ranks[11] "31mAnnoyance"
	setVar $ranks[12] "31mNuisance 3rd Class"
	setVar $ranks[13] "31mNuisance 2nd Class"
	setVar $ranks[14] "31mNuisance 1st Class"
	setVar $ranks[15] "31mMenace 3rd Class"
	setVar $ranks[16] "31mMenace 2nd Class"
	setVar $ranks[17] "31mMenace 1st Class"
	setVar $ranks[18] "31mSmuggler 3rd Class"
	setVar $ranks[19] "31mSmuggler 2nd Class"
	setVar $ranks[20] "31mSmuggler 1st Class"
	setVar $ranks[21] "31mSmuggler Savant"
	setVar $ranks[22] "31mRobber"
	setVar $ranks[23] "31mTerrorist"
	setVar $ranks[24] "31mInfamous Pirate"
	setVar $ranks[25] "31mNotorious Pirate"
	setVar $ranks[26] "31mDread Pirate"
	setVar $ranks[27] "31mPirate"
	setVar $ranks[28] "31mGalactic Scourge"
	setVar $ranks[29] "31mEnemy of the State"
	setVar $ranks[30] "31mEnemy of the People"
	setVar $ranks[31] "31mEnemy of Humankind"
	setVar $ranks[32] "31mHeinous Overlord"
	setVar $ranks[33] "31mPrime Evil"
	setVar $ranks[34] "36mChief Warrant Officer"
	setVar $ranks[35] "36mWarrant Officer"
	setVar $ranks[36] "36mEnsign"
	setVar $ranks[37] "36mLieutenant J.G."
	setVar $ranks[38] "36mLieutenant Commander"
	setVar $ranks[39] "36mLieutenant"
	setVar $ranks[40] "36mCommander"
	setVar $ranks[41] "36mCaptain"
	setVar $ranks[42] "36mCommodore"
	setVar $ranks[43] "36mRear Admiral"
	setVar $ranks[44] "36mVice Admiral"
	setVar $ranks[45] "36mFleet Admiral"	
	setVar $ranks[46] "36mAdmiral"
	setVar $ENDLINE "_ENDLINE_"
	setVar $STARTLINE "_STARTLINE_"	
	setVar $fig_hit_test_front ": "
	setVar $fig_hit_test_back "'s"
	setVar $alien_ansi #27 & "[1;36m" & #27 & "["
	setVar $mid_attack_mac "* y  Q Q m "
	setVar $front_attack_mac "p "
	gosub :quikstats
	setVar $startingSector $CURRENT_SECTOR
		:getplanetnum
			send "qDC "
			waitOn "Planet #"
			getWord CURRENTLINE $planet 2
			stripText $planet "#"
			gosub :checkShip
			setVar $enter_attack_mac "*    *  n z a " & $maxFigAttack & "* z a " & $maxFigAttack & "*     z  *"
			setVar $deploy_fig_mac "  f  z  1*  z  c *  d  * "
			send "'Slingshot pulled back and ready!*"
		:startTargetingAdjacent
			killAllTriggers
			setTextTrigger limp :attackSectorLimpetAdjacent "Limpet mine in "
			setTextTrigger armid :attackSectorMineAdjacent "Your mines in "
			setTextTrigger fig :attackSectorFighterAdjacent "Deployed Fighters "
			pause
		:attackSectorMineAdjacent
			getText CURRENTANSILINE $alien_check $fig_hit_test_front $fig_hit_test_back
			getWordPos $alien_check $apos $alien_ansi
			if ($apos > 0)
				goto :startTargetingAdjacent
			end
			getWord CURRENTLINE $dropSector 4
			goto :getDropSectorAdjacent
		:attackSectorLimpetAdjacent
			getWord CURRENTLINE $dropSector 4
			goto :getDropSectorAdjacent
		:attackSectorFighterAdjacent
			getText CURRENTANSILINE $alien_check $fig_hit_test_front $fig_hit_test_back
			getWordPos $alien_check $apos $alien_ansi
			if ($apos > 0)
				goto :startTargetingAdjacent
			end
			getWord CURRENTLINE $dropSector 5
			
		:getDropSectorAdjacent
			stripText $dropSector ":"
			send $front_attack_mac&SECTOR.WARPS[$dropSector][1]&$mid_attack_mac&$dropSector&$enter_attack_mac&"'"&$dropSector&"=saveme*"&$deploy_fig_mac 
			setVar $i 0
			while ($i < 10)
				add $i 1
				send "l  j" & #8 & $planet & "*  *  "
			end
			gosub :getSectorLocation
			if (($CURRENT_SECTOR <> $dropSector))
				if ($CURRENT_SECTOR = $startingSector)
					send "'No fig at pwarp location, no attempt made. Restart when ready.*"
				elseif ($CURRENT_SECTOR = SECTOR.WARPS[$dropSector][1])
					send "'Possible SPLATTER on a planet, check for pod.*"
				else
					send "'Didn't make it, not sure what happened. Check ship and restart*"
				end
				halt
			end
			send "m * * * c "
			killalltriggers
			gosub :checkForVictimsFromCitadel
		halt


:getSectorLocation
	killalltriggers
	send "/"
	waitOn "Sect "
	getWord CURRENTLINE $CURRENT_SECTOR 2
	replacetext $CURRENT_sECTOR #179&"Turns" ""
return

:checkShip
	killAllTriggers 
	send "c;q"
	waitFor "Figs Per Attack:"
	getWord CURRENTLINE $maxFigAttack 5
return

:callSaveMe
	killAllTriggers
	send "*"
	waitFor "(?="
	getWord CURRENTLINE $prompt 1
	if ($prompt = "Citadel")
		echo "**Had to halt script, check ship to see if it is valid.**"
		halt
	end
	if ($prompt = "Computer") or ($prompt = "Corporate") or ($prompt = "NavPoint")
		send "q"
		waitFor "Command [TL"
	end	
	gosub :getSectorLocation
    	setVar $figstodeploy 1
	gosub :deployfigs 
	send "'" & $CURRENT_SECTOR & "=saveme*"
	send "'pickup " & $CURRENT_SECTOR  & " ::*"


:waitforhelp
    setTextLineTrigger friendlytwarp :friendlytwarp "appears in a brilliant flash of warp energies!"
    setTextLineTrigger friendlyplanet :friendlyplanet "Saveme script activated - Planet "
    setTextLineTrigger towlocked :towlocked "locks a tractor beam on your ship."
    setDelayTrigger timeout :timeout 30000
    pause

    :timeout
        killalltriggers
        send "'30 seconds after save call, script halted.*"
        halt

    :friendlytwarp
        killalltriggers
        setVar $figstodeploy "ALL"
        gosub :deployfigs
        goto :waitforhelp

    :friendlyplanet
        killalltriggers
        getText CURRENTLINE $planet "Saveme script activated - Planet " " to "
        send "L " & $planet & "* C 'I landed on planet " & $planet & "*"
        halt

    :towlocked
        killalltriggers
        setVar $figstodeploy 1
        gosub :deployfigs
        send "'Tow locked, get us out of here!*"
        halt


:deployfigs
    if ($figstodeploy = 0)
        setVar $figstodeploy 1
    end
    if (($CURRENT_SECTOR  < 11) or ($CURRENT_SECTOR  = STARDOCK))
        send "'Can't deploy figs in fed*"
        return
    end
    send "F"
    setTextLineTrigger nocontrol :nocontrol "These fighters are not under your control."
    setTextLineTrigger abletodeploy :abletodeploy "fighters available."
    pause

    :nocontrol
        killalltriggers
        send "'We don't control the figs in this sector!*"
        halt

    :abletodeploy
        killalltriggers
        getWord CURRENTLINE $figsavailable 3
        striptext $figsavailable ","
        if ($figstodeploy = "ALL")
            setVar $figstodeploy $figsavailable
        end
        if ($figsavailable = 0)
            send "0* ZC D* 'I have no figs to deploy!*"
        else
            send $figstodeploy & "* ZC D* '" & $figstodeploy & " figs deployed*"
        end
return

:checkForVictimsFromCitadel
	gosub :getSectorData
	if ($corpieCount < $realTraderCount)
		goSub :fastCitadelAttack
		goto :checkForVictimsFromCitadel
	end
return

:getTraders
	getWordPos $sectorData $posTrader "[0m[33mTraders [1m:"
	setArray $TRADERS 1000
	if ($posTrader > 0)
		getText $sectorData $traderData "[0m[33mTraders [1m:" "[0m[1;32mWarps to Sector(s) [33m:"
		setVar $traderData $STARTLINE&$traderData
		getText $traderData $temp $STARTLINE $ENDLINE 
		setVar $realTraderCount 0
		setVar $corpieCount 0
		while ($temp <> "")
			getLength $STARTLINE&$temp&$ENDLINE $length
			cutText $traderData $traderData ($length+1) 9999 
			stripText $temp $STARTLINE
			stripText $temp $ENDLINE
			stripText $temp "[0m          "
			stripText $temp "[0m[33mTraders [1m:"
			setVar $j 1
			setVar $isFound FALSE
			while (($j < $ranksLength) AND ($isFound = FALSE))
				getWordPos $temp $pos $ranks[$j]	
				if ($pos > 0)
					getLength $ranks[$j] $length
					cutText $temp $temp ($pos+$length+1) 9999
					if ($j <= 10)
						setVar $TRADERS[($realTraderCount+1)][2] TRUE
					else
						setVar $TRADERS[($realTraderCount+1)][2] FALSE
					end
					setVar $isFound TRUE
				end
				add $j 1
			end
			getWordPos $temp $pos "[0;32m w/"
			getWordPos $temp $pos2 "[0;35m[[31mOwned by[35m]"
			if (($pos > 0) AND ($pos2 <= 0))
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
				if ($tempCorp = $CORP)
					add $corpieCount 1
				end
			end
			getText $traderData $temp $STARTLINE $ENDLINE 	
		end	
	else
		setVar $realTraderCount 0
	end
return

:getEmptyShips
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
				#setVar $EMPTYSHIPS[($emptyShipCount+1)] $temp
				add $emptyShipCount 1
			end
			getText $shipData $temp $STARTLINE $ENDLINE 
		end
	else
		setVar $emptyShipCount 0
	end
return

:getFakeTraders
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
			if ($pos <= 0)
				getWordPos $temp $pos "[0;32mw/ "
			end
			getWordPos $temp $pos2 "[33m, [0;32mwith"
			getWordPos $temp $pos3 "[0;35m[[31mOwned by[35m]"
			if ((($pos > 0) OR ($pos2 > 0)) AND ($pos3 <= 0))
				#setVar $FAKETRADERS[($fakeTraderCount+1)] $temp
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
				#setVar $FAKETRADERS[($fakeTraderCount+1)] $temp
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
				#setVar $FAKETRADERS[($fakeTraderCount+1)] $temp
				add $fakeTraderCount 1
			end
			getText $fakeData $temp $STARTLINE $ENDLINE 
		end
	end
return



:getSectorData
	killtrigger sectorStart
	killTrigger getLine
	setTextLineTrigger sectorStart :scanningSectorStart "Sector  :"
	send "s* "
	pause
	:scanningSectorStart
		killtrigger sectorStart
		getWord CURRENTLINE $CURRENT_SECTOR 3
		setVar $sectorData ""
	
	:sectorsline_cit_kill
		killTrigger sectorStart
		killTrigger getLine
		setVar $line CURRENTANSILINE
		setVar $line $STARTLINE&$line&$ENDLINE
		setVar $sectorData $sectorData&$line
		getWordPos $line $pos "[0m[1;32mWarps to Sector(s) [33m:"
		if ($pos > 0)
			goto :gotSectorData
		else
			setTextLineTrigger getLine :sectorsline_cit_kill
		end
		pause

	:gotSectorData
		killTrigger getLine
		goSub :getTraders
		goSub :getEmptyShips
		goSub :getFakeTraders
return


:fastCitadelAttack
	setVar $refurbString "l "&$planet&"* m*** "
	setVar $attackString ""
	setVar $targetString  "q az"
	setVar $isFound FALSE
	getWordPos $sectorData $beaconPos "[0m[35mBeacon  [1;33m:"
	gosub :quikstats
	if ($FIGHTERS > 100)
		if ((($CURRENT_SECTOR > 10) AND ($CURRENT_SECTOR <> STARDOCK)) AND ($beaconPos > 0))
			setVar $targetString $targetString&"* "
		end
	else
		echo ANSI_12 "*You don't have enough fighters.*" ANSI_7
		return
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
				setVar $targetString $targetString&"zy z"
				
			end
			add $c 1
		end
	
	else
		echo ANSI_12 "*You have no targets.*" ANSI_7
		return
	end
	if ($isFound = TRUE)
		setVar $attackString ""
		setVar $count 8
		while ($count > 0)
			setVar $attackString $attackString&$targetString&$maxFigAttack&"* "&$refurbString
			subtract $count 1
		end
	else
		echo ANSI_12 "*You have no valid targets.*" ANSI_7
		return
	end
	send "q "&$attackString&"c "
return

# -=-=-=-=- quikstats -=-=-=-=-=-=-
:quikstats
	
	setVar $CURRENT_SECTOR 0
	setVar $TURNS 0
	setVar $CREDITS 0
	setVar $FIGHTERS 0
	setVar $SHIELDS 0
	setVar $TOTAL_HOLDS 0
	setVar $ORE_HOLDS 0
	setVar $ORGANIC_HOLDS 0
	setVar $EQUIPMENT_HOLDS 0
	setVar $COLONIST_HOLDS 0
	setVar $PHOTONS 0
	setVar $ARMIDS 0
	setVar $LIMPETS 0
	setVar $GENESIS 0
	setVar $TWARP_TYPE 0
	setVar $CLOAKS 0
	setVar $BEACONS 0
	setVar $ATOMIC 0
	setVar $CORBO 0
	setVar $EPROBES 0
	setVar $MINE_DISRUPTORS 0
	setVar $PSYCHIC_PROBE "NO"
	setVar $PLANET_SCANNER "NO"
	setVar $SCAN_TYPE "NONE"
	setVar $ALIGNMENT 0
	setVar $EXPERIENCE 0
	setVar $CORP 0
	setVar $SHIP_NUMBER 0
	setVar $TURNS_PER_WARP 0

:getstats
	killAllTriggers
	send "/"
	setTextLineTrigger statlinetrig :statStart #179
	pause


	:statStart
		setVar $stats ""
		setVar $wordy ""
	
	:statsline
		killtrigger statlinetrig
		killtrigger getLine2
		killtrigger permenantStatTrig
		setVar $line2 CURRENTLINE
		replacetext $line2 #179 " "
		striptext $line2 ","
		setVar $stats $stats & $line2
		getWordPos $line2 $pos "Ship"
		if ($pos > 0)
			goto :gotStats
		else
			setTextLineTrigger getLine2 :statsline 
		end
		pause

	:gotStats
		setVar $stats $stats & " @@@"
		upperCase $stats
		setVar $current_word 0
		while ($wordy <> "@@@")
			if ($wordy = "SECT")
				getWord $stats $CURRENT_SECTOR   ($current_word + 1)
			elseif ($wordy = "TURNS")
				getWord $stats $TURNS  ($current_word + 1)
			elseif ($wordy = "CREDS")
				getWord $stats $CREDITS  ($current_word + 1)
			elseif ($wordy = "FIGS")
				getWord $stats $FIGHTERS   ($current_word + 1)
			elseif ($wordy = "SHLDS")
				getWord $stats $SHIELDS  ($current_word + 1)
			elseif ($wordy = "HLDS")
				getWord $stats $TOTAL_HOLDS   ($current_word + 1)
			elseif ($wordy = "ORE")
				getWord $stats $ORE_HOLDS    ($current_word + 1)
			elseif ($wordy = "ORG")
				getWord $stats $ORGANIC_HOLDS    ($current_word + 1)
			elseif ($wordy = "EQU")
				getWord $stats $EQUIPMENT_HOLDS    ($current_word + 1)
			elseif ($wordy = "COL")
				getWord $stats $COLONIST_HOLDS    ($current_word + 1)
			elseif ($wordy = "PHOT")
				getWord $stats $PHOTONS   ($current_word + 1)
			elseif ($wordy = "ARMD")
				getWord $stats $ARMIDS   ($current_word + 1)
			elseif ($wordy = "LMPT")
				getWord $stats $LIMPETS   ($current_word + 1)
			elseif ($wordy = "GTORP")
				getWord $stats $GENESIS  ($current_word + 1)
			elseif ($wordy = "TWARP")
				getWord $stats $TWARP_TYPE  ($current_word + 1)
			elseif ($wordy = "CLKS")
				getWord $stats $CLOAKS   ($current_word + 1)
			elseif ($wordy = "BEACNS")
				getWord $stats $BEACONS ($current_word + 1)
			elseif ($wordy = "ATMDT")
				getWord $stats $ATOMIC  ($current_word + 1)
			elseif ($wordy = "CORBO")
				getWord $stats $CORBO   ($current_word + 1)
			elseif ($wordy = "EPRB")
				getWord $stats $EPROBES   ($current_word + 1)
			elseif ($wordy = "MDIS")
				getWord $stats $MINE_DISRUPTORS   ($current_word + 1)
			elseif ($wordy = "PSPRB")
				getWord $stats $PSYCHIC_PROBE  ($current_word + 1)
			elseif ($wordy = "PLSCN")
				getWord $stats $PLANET_SCANNER  ($current_word + 1)
			elseif ($wordy = "LRS")
				getWord $stats $SCAN_TYPE    ($current_word + 1)
			elseif ($wordy = "ALN")
				getWord $stats $ALIGNMENT    ($current_word + 1)
			elseif ($wordy = "EXP")
				getWord $stats $EXPERIENCE    ($current_word + 1)
			elseif ($wordy = "CORP")
				getWord $stats $CORP   ($current_word + 1)
			elseif ($wordy = "SHIP")
				getWord $stats $SHIP   ($current_word + 1)
			end
			add $current_word 1
			getWord $stats $wordy $current_word
		end
return
