
# Mind Over Matter Planet Drop
# Author: Mind Dagger

	logging off
	setVar $FIG_FILE 		"_MOM_" & GAMENAME & ".figs"
	setVar $LIMP_FILE 		"_MOM_" & GAMENAME & ".limps"
	setVar $ARMID_FILE 		"_MOM_" & GAMENAME & ".armids"
	setVar $START_FIG_HIT "Deployed Fighters Report Sector "
	setVar $END_FIG_HIT   ":"
        setVar $ALIEN_ANSI    #27 & "[1;36m" & #27 & "["
        setVar $START_FIG_HIT_OWNER ":"
	setVar $END_FIG_HIT_OWNER "'s"
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
	fileExists $doesHelpFileExist "scripts\MOMBot\Help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\MOMBot\Help\"&$command&".txt" "- "&$command&" [on/off]{delay}{drop type}{trigger}{return}{kill}" 
		write "scripts\MOMBot\Help\"&$command&".txt" "    - [delay]     = delay before dropping in milliseconds       " 
		write "scripts\MOMBot\Help\"&$command&".txt" "    - [drop type] = [d]irect, [a]djacent, [da] direct, then adjacent, or [s]urround" 
		write "scripts\MOMBot\Help\"&$command&".txt" "    - [delay]     = delay before dropping in milliseconds       " 
		write "scripts\MOMBot\Help\"&$command&".txt" "    - [trigger]   = [f]igs, [fm] figs/mines, [m]ines, [uf] No-Fig Mines" 
		write "scripts\MOMBot\Help\"&$command&".txt" "    - [return]    = will return planet home after 10 seconds" 
		write "scripts\MOMBot\Help\"&$command&".txt" "    - [kill]      = checks sector for enemy, and kills if possible" 
		send "'{" $bot_name "} - Writing help file for "&$command&" in Help directory.*"
	end
	getWord $user_command_line $parm1 1
	getWord $user_command_line $parm2 2
	getWord $user_command_line $parm3 3
	getWord $user_command_line $parm4 4
	getWord $user_command_line $parm5 5
	getWord $user_command_line $parm6 6
	getWord $user_command_line $parm7 7
	getWord $user_command_line $parm8 8
	getSectorParameter SECTORS "FIGSEC" $isFigged
	if ($isFigged = "")
		send "'{" $bot_name "} - It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		halt
	end
	
	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	setVar $script_ver "Mind Over Matter Bot P-drop"
	if ($startingLocation <> "Citadel")
		send "'{" $bot_name "} - This script must be run from the Citadel Prompt*"
		setVar $mode "General"
	        halt
	end
	if ($parm1 <> "on")
		send "'{" $bot_name "} - Please use [on/off] {delay} {drop type} {trigger type} {kill} {return}*"
		halt
	end
	setVar $user_command_line $user_command_line&" "
	isNumber $test $parm2
	if ($test)
		setVar $dropDelay $parm2
	else
		setVar $dropDelay 0
	end
	getWordPos $user_command_line $pos " d "
	if ($pos > 0)
		setVar $dropDescription "Direct"
	else
		getWordPos $user_command_line $pos " a "
		if ($pos > 0)
			setVar $dropDescription "Adjacent"
		else
			getWordPos $user_command_line $pos " da "
			if ($pos > 0)
				setVar $dropDescription "Direct, then Adjacent"
			else
				getWordPos $user_command_line $pos " s "
				if ($pos > 0)
					setVar $dropDescription "Surround"
				else
					getWordPos $user_command_line $pos " ad "
					if ($pos > 0)
						setVar $dropDescription "Adjacent, then Direct"
					else
						setVar $dropDescription "Direct"
					end
				end
			end
		end
	end
	getWordPos $user_command_line $pos " f "
	if ($pos > 0)
		setVar $triggerDescription "Fighters"
	else
		getWordPos $user_command_line $pos " fm "
		if ($pos > 0)
			setVar $triggerDescription "Fighters and Mines"
		else
			getWordPos $user_command_line $pos " m "
			if ($pos > 0)
				setVar $triggerDescription "Mines"
			else
				getWordPos $user_command_line $pos " uf "
				if ($pos > 0)
					setVar $triggerDescription "Unfigged Mines"
				else
					setVar $triggerDescription "Fighters and Mines"
				end
			end
		end
	end
	getWordPos $user_command_line $pos "return"
	if ($pos > 0)
		setVar $returnHome TRUE
		setVar $returnHomeDelay 10
	else
		setVar $returnHome FALSE
		setVar $returnHomeDelay 0
	end

	getWordPos $user_command_line $pos "kill"
	if ($pos > 0)
		setVar $attackOnSight TRUE
	else
		setVar $attackOnSight FALSE
	end
	setVar $randomAttack TRUE

	gosub :quikstats
	if ($CORPORATION > 0)
		gosub :getCorpies
	end
	gosub :getName
	setVar $script_ver "Planet Drop"
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
	setVar $dropSector 0 
	setVar $ENDLINE "_ENDLINE_"
	setVar $STARTLINE "_STARTLINE_"
	cutText CURRENTLINE $location 1 7
	if ($location <> "Citadel")
	        echo ansi_12 "**This script must be run from the Citadel Prompt"
	        halt
	end
	send "c;q"
	waitFor "Figs Per Attack:"
	getWord CURRENTLINE $maxFigAttack 5

	
	

	gosub :planetStats
	
	setVar $message "'*  {"&$bot_name&"} - Planet Dropper Currently Running On Planet "&$planet&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*        Drop Type: "&$dropDescription&" On "&$triggerDescription
	if ($targetingPerson)
		setVar $message $message&"*        Targeting: (Player) "&$target
	else
		setVar $message $message&"*        Targeting: Everyone"
	end
	if ($prelockActive)
		if ($prelockReleaseTime > 0)
			setVar $message $message&"*         Pre-Lock: Enabled With "&$prelockReleaseTime&" Second Release"
		else
			setVar $message $message&"*         Pre-Lock: Enabled With Manual Release Only"
		end
	end
	if ($dropDelay > 0)
		setVar $message $message&"*       Drop Delay: "&$dropDelay&" ms"
	end
	if ($attackOnSight)
		setVar $message $message&"*        Auto Kill: Enabled With "&$planetFighters&" Fighters"
	end
	if ($returnHome)
		setVar $message $message&"*      Return Home: Enabled With "&$returnHomeDelay&" Second Delay"
	end
	if ($randomAttack)
		setVar $message $message&"*   Attack Pattern: Random"
	elseif ($firstAttack)
		setVar $message $message&"*   Attack Pattern: First Available Target"
	elseif ($secondAttack)
		setVar $message $message&"*   Attack Pattern: Second Available Target"
	elseif ($thirdAttack)
		setVar $message $message&"*   Attack Pattern: Third Available Target"
	elseif ($fourthAttack)
		setVar $message $message&"*   Attack Pattern: Fourth Available Target"
	elseif ($fifthAttack)
		setVar $message $message&"*   Attack Pattern: Fifth Available Target"
	elseif ($sixthAttack)
		setVar $message $message&"*   Attack Pattern: Sixth Available Target"
	else
		setVar $message $message&"*   Attack Pattern: Last Available Target"
	end
	setVar $message $message&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"	
	send $message
	gosub :quikstats
	setVar $homeSector $CURRENT_SECTOR
	:startTargeting
		killAllTriggers
		if (($returnHome = TRUE) AND ($isManual <> TRUE) AND ($CURRENT_SECTOR <> $homeSector))
			setVar $timeInMilli (($returnHomeDelay * 1000)+100)			
			echo ANSI_6 "*    [" ANSI_14 "Returning Home In " ANSI_15 $returnHomeDelay ANSI_14 " Seconds" ANSI_6 "]*" ANSI_7
			setDelayTrigger homeDelay :goHome $timeInMilli
		end
		setTextLineTrigger manual :manualPwarp "Planetary TransWarp Drive Engaged!"
		if (($triggerDescription = "Fighters and Mines") OR ($triggerDescription = "Mines") OR ($triggerDescription = "Unfigged Mines"))
			if ($targetingPerson = FALSE)
				setTextTrigger limp :attackSectorLimpet "Limpet mine in "
			end
			setTextTrigger armid :attackSectorMine "Your mines in "
		end
		if (($triggerDescription = "Fighters and Mines") OR ($triggerDescription = "Fighters"))
			setTextTrigger fig :attackSectorFighter "Deployed Fighters "
		end
		setTextLineTrigger warn :keepAlive "INACTIVITY WARNING:"
		setTextTrigger pause :pausing "Planet command (?="
		setTextTrigger pause2 :pausing "Computer command ["
		setTextTrigger pause3 :pausing "Corporate command ["
		setTextTrigger pause4 :pausing "Transfer To or From the Treasury (T/F)"
		setTextTrigger pause5 :pausing "Qcannon Control Type :"
		setTextTrigger pause6 :pausing "Beam to what sector? (U=Upgrade"
		setTextOutTrigger redoSettings :doSettings "%" 
		#setTextLineTrigger scriptcheck :answer "script?"
    		#setTextLineTrigger scriptcheck2 :answer "Script?"
    		setVar $isManual FALSE
		if ($attackOnSight)
			setTextLineTrigger warps :scan "warps into the sector."
			setTextLineTrigger lifts :scan "lifts off from"
		end
		pause
			
		:scan
			killAllTriggers
			goSub :checkForVictims
			goto :startTargeting
		
		:keepAlive
			killAllTriggers
			gosub :warning
			goto :startTargeting
	
		:pausing
			killAllTriggers
			echo ANSI_6 "*[" ANSI_14 $script_ver " paused. To restart, re-enter Citadel Prompt" ANSI_6 "]*" ANSI_7
			setTextTrigger restart :restarting "Citadel command ("
			pause
			:restarting
				killAllTriggers
				echo ANSI_6 "*[" ANSI_14 $script_ver " restarted" ANSI_6 "]*" ANSI_7
				goSub :getSectorLocation
				goto :startTargeting
	
		:answer
			killalltriggers
 			gosub :authenticate
			if ($auth_result = "true")
				killAllTriggers
				send $message
				waitOn "Sub-space comm-link terminated"
			end
			goto :startTargeting
		
		:goHome
			killAllTriggers
			send "p " $homeSector "*y"
		
		:manualPwarp
				killAllTriggers
				if ($attackOnSight)
					goSub :checkForVictims
				end
				setVar $isManual TRUE
				goSub :getSectorLocation
				goto :startTargeting
		:attackSectorMine
			gosub :validateMineHit
			if ($isValid <> TRUE)
				goto :startTargeting
			end
			goto :getDropSector
			
		:attackSectorLimpet
			gosub :validateLimpetHit
			if ($isValid <> TRUE)
				goto :startTargeting
			end
			goto :getDropSector
		
		:attackSectorFighter
			gosub :validateFighterHit
			if ($isValid <> TRUE)
				goto :startTargeting
			end
			
		:getDropSector
			if ($dropDescription = "Direct")
				send "p " $dropSector "* y "
				if ($attackOnSight)
					goSub :checkForVictims
				end	
				goSub :getSectorLocation
				if ($CURRENT_SECTOR <> $dropSector)
					setSectorParameter $dropSector "FIGSEC" FALSE
				end
			elseif ($dropDescription = "Adjacent")			
				gosub :findAdjacent
				goSub :attemptDrop
				goSub :getSectorLocation
				if ($attackOnSight)
					goSub :checkForVictims
				end
			elseif ($dropDescription = "Adjacent, then Direct")			
				gosub :findAdjacent
				goSub :attemptDrop
				send "p " $dropSector "* y "
				goSub :getSectorLocation
				if ($attackOnSight)
					goSub :checkForVictims
				end
			elseif ($dropDescription = "Surround")
				gosub :attemptSurroundDrop
				gosub :getSectorLocation
				if ($attackOnSight)
					goSub :checkForVictims
				end
			else
				if ($dropSector <> $CURRENT_SECTOR)
					send "p " $dropSector "*y"
					setTextTrigger pwarpNotOk :pwarpTryAdjacent "You do not have any fighters in Sector "
					setTextTrigger pwarpOk :pwarpDone " Planetary TransWarp Drive Engaged! "
					pause

					:pwarpDone
						killAllTriggers
						setVar $CURRENT_SECTOR $dropSector
						if ($attackOnSight)
							goSub :checkForVictims
						end
						goto :startTargeting
				else
					if ($attackOnSight)
						goSub :checkForVictims
					end	
					goto :startTargeting
				end
				:pwarpTryAdjacent
					killAllTriggers
					setSectorParameter $dropSector "FIGSEC" FALSE
					gosub :findAdjacent
					gosub :attemptDrop
					goto :startTargeting
			
			end
		goto :startTargeting
	

:end
	killAllTriggers
	echo ANSI_6 "*[" ANSI_14 $script_ver " Shutting Down" ANSI_6 "]*" ANSI_7
	halt

:attemptSurroundDrop
	setVar $i 1
	setVar $checkSector SECTOR.WARPS[$dropSector][$i]
	setVar $isFound FALSE
	while (($checkSector > 0) AND ($isFound = FALSE))
		getSectorParameter $checkSector "FIGSEC" $isFigged
		if ($isFigged <> TRUE)
			setVar $retreatSector $checkSector
			setVar $isFound TRUE
		else
			add $i 1
			setVar $checkSector SECTOR.WARPS[$sector][$i]
		end
	end
	
	if ($isFound)
		setVar $i 2
		setVar $checkSector SECTOR.WARPS[$retreatSector][$i]
		setVar $isFound FALSE
		setVar $targets ""
		setVar $targetCount 0
		while (($checkSector > 0) AND ($targetCount <= 0))
			getSectorParameter $checkSector "FIGSEC" $isFigged
			if (($isFigged = TRUE) AND ($checkSector <> $dropSector))
				setVar $targets $targets&" "&$checkSector&" "
				add $targetCount 1
			end
			setVar $checkSector SECTOR.WARPS[$retreatSector][$i]
			add $i 1
		end
		if ($targetCount > 0)
			setVar $gotoSector $targets
			gosub :dopwarp
		else
			echo "** No Adjacent Fig Next To Possible Retreat Sector **"
		end		
	else
		echo "** No Possible Retreat Sector **"
	end		
return

:attemptDrop
	
	if ($targetCount > 0)
		getRnd $randomTarget 1 $targetCount
		if ($dropDelay > 0)
			killAllTriggers
			setDelayTrigger delay :planetDrop $dropDelay
			pause
		end
		:planetDrop
			setVar $gotoSector $targetSectors[$randomTarget]
			gosub :dopwarp
	end
	
return

:dopwarp
	:planetDrop
		killAllTriggers
		send "p " $gotoSector "*y"
		setTextLineTrigger pwarpNo :pwarpNo "You do not have any fighters in Sector "
		setTextLineTrigger pwarpYes :pwarpYes " Planetary TransWarp Drive Engaged! "
		setTextLineTrigger pwarpAlreadyThere :pwarpFinished "You are already in that sector!"
		pause
	:pwarpNo
		killAllTriggers
		setVar $targetSectors[$randomTarget] 0
		setSectorParameter $gotoSector "FIGSEC" FALSE
		setVar $i 1
		while ($i <= $targetCount)
			if ($targetSectors[$i] > 0)
				setVar $randomTarget $i
				goto :planetDrop
			end
			add $i 1
		end
		goto :pwarpFinished
	:pwarpYes
		killAllTriggers
	:pwarpFinished		
		goSub :getSectorLocation

return

:clearScreen
	echo #27 & "[2J"
return

:turnOffAnsi
	send "c n"
	killAllTriggers
	waitOn "(1) ANSI graphics"
	getWord CURRENTLINE $ansiStatus 5
	waitOn "(2) Animation display"
	getWord CURRENTLINE $animationStatus 5
	if ($animationStatus = "On")
		send "2"
	end
	if ($ansiStatus = "On")
		send "1 q q"
	else
		send "q q"
	end
	waitOn "<Computer deactivated>"
return

:turnOnAnsi
	send "c n"
	killAllTriggers
	waitOn "(1) ANSI graphics"
	getWord CURRENTLINE $ansiStatus 5
	if ($ansiStatus = "Off")
		send "1 q q"
	else
		send "q q"
	end
	waitOn "<Computer deactivated>"
return


:planetStats
	send "q "
	gosub :quikstats
	send "*"
	waitOn "Planet #"
	getWord CURRENTLINE $planet 2
	waitOn "Fighters"
	getWord CURRENTLINE $planetFighters 5
	stripText $planet "#"
	send "c"
return

:warning
	send "#"
return

:landOnPlanetEnterCitadel
	send "l " $planet "* c"
	waitOn "<Enter Citadel>"
return

:leaveCitadelAndPlanet	
	send "q q"
	waitOn "Blasting off from"
	waitOn "Command [TL"
return





:showPrelockOptions
	echo ANSI_6 "*[" ANSI_14 $script_ver " Pre-locked onto sector " $gotoSector ANSI_6 "]*" ANSI_7
	echo ANSI_6 "  [" ANSI_14 "%" ANSI_6 "]" ANSI_15 " Let Go of Pre-Lock*"  ANSI_7
	if ($prelockReleaseTime > 0)
		echo ANSI_6 "[" ANSI_14 "Script will release pre-lock automatically in "&$prelockReleaseTime&" seconds.." ANSI_6 "]*" ANSI_7
	end
return

:showOptions
	echo ANSI_6 "*[" ANSI_14 $script_ver " Options" ANSI_6 "]*" ANSI_7
	echo ANSI_6 "  [" ANSI_14 "%" ANSI_6 "]" ANSI_15 " Change Drop Settings*"
	echo ANSI_6 "[" ANSI_14 $script_ver " waiting for targets.." ANSI_6 "]*" ANSI_7
return



:checkForVictims
	gosub :getSectorData
	if ($corpieCount < $realTraderCount)
		goSub :fastAttack
		goto :checkForVictims
	end
return	

:getTraders

	killAllTriggers
	getWordPos $sectorData $posTrader "[0m[33mTraders [1m:"
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
			getWordPos $temp $pos "[0;32m w/"
			getWordPos $temp $pos2 "[0;35m[[31mOwned by[35m]"
			setVar $j 1
			setVar $isFound FALSE
			while (($j < $ranksLength) AND ($isFound = FALSE))
				getWordPos $temp $pos $ranks[$j]	
				if ($pos > 0)
					getLength $ranks[$j] $length
					cutText $temp $temp ($pos+$length+1) 9999
					#determining fed safe or not: not needed here
					#if ($j <= 10)
					#	if (($targetingPerson = TRUE) AND ($j = 9))
					#		setVar $TRADERS[($realTraderCount+1)][2] FALSE
					#	else
					#		setVar $TRADERS[($realTraderCount+1)][2] TRUE
					#	end
					#else
					#	setVar $TRADERS[($realTraderCount+1)][2] FALSE
					#end
					setVar $isFound TRUE
				end
				add $j 1
			end
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
				if ($TRADERS[($realTraderCount+1)][1] = $CORPORATION)
					add $corpieCount 1
				end
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
			getWordPos $temp $pos "m,[0;32m w/ "
			if ($pos <= 0)
				getWordPos $temp $pos "[0;32mw/ "
			end
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
:getSectorData

	killalltriggers
	setVar $sectorData ""
	setTextLineTrigger sectorStart :sectorsline "Sector  :"
	#setDelayTrigger timer :halt 3000
	send "s* "
	pause
	:sectorsline
		killTrigger getLine
		setVar $line CURRENTANSILINE
		setVar $line $STARTLINE&$line&$ENDLINE
		setVar $sectorData $sectorData&$line
		getWordPos $line $pos "Warps to Sector(s) "
		if ($pos > 0)
			goto :gotSectorData
		else
			setTextLineTrigger getLine :sectorsline
		end
		pause

	:gotSectorData
		killalltriggers
		goSub :getTraders
		goSub :getEmptyShips
		goSub :getFakeTraders
return


:fastAttack
	setVar $refurbString "l "&$planet&"* m * * * "
	setVar $attackString ""
	setVar $targetString  "q a z "
	setVar $isFound FALSE
	getWordPos $sectorData $beaconPos "[0m[35mBeacon  [1;33m:"
	if ($FIGHTERS > 0)
		if ((($sec > 10) AND ($sec <> STARDOCK)) AND ($beaconPos > 0))
			setVar $targetString $targetString&"* "
		end
	else
		echo ANSI_12 "*You have no fighters.*" ANSI_7
		send "qm***c"
		gosub :getstats
		goto :halt
	end
	if (($emptyShipCount + $fakeTraderCount + $realTraderCount) > 0)
		setVar $i 0
		while ($i < ($emptyShipCount + $fakeTraderCount))
			setVar $targetString $targetString&"* "
			add $i 1
		end
		setVar $c 1
		while (($c <= $realTraderCount) AND ($isFound = FALSE))
			if ((($sec <= 10) OR ($sec = STARDOCK)) AND $TRADERS[$c][2] = TRUE)
				setVar $targetString $targetString&"* "
			elseif ($TRADERS[$c][1] = $CORPORATION)
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
		goto :halt
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
		goto :halt
	end

	send "q "&$attackString&"c "
:halt
return

:findAdjacent
	getSectorParameter $dropSector "FIGSEC" $isFigged
	if (($triggerDescription = "Unfigged Mines") AND ($isFigged = TRUE))
		return
	else
		setVar $i 1
		setVar $checkSector SECTOR.WARPS[$dropSector][$i]
		setArray $targetSectors 6
		setVar $targetCount 0
		while ($checkSector > 0)
			getSectorParameter $checkSector "FIGSEC" $isFigged
			if ($isFigged = TRUE)
				add $targetCount 1
				setVar $targetSectors[$targetCount] $checkSector
			end
			add $i 1
			setVar $checkSector SECTOR.WARPS[$dropSector][$i]
		end
		if ($targetCount <= 0)
			echo "No Targets..*"
			setVar $targetSectors[1] $CURRENT_LOCATION
		end
	end

return

:getDropperStats
	send "c;q"
	waitFor "Figs Per Attack:"
	getWord CURRENTLINE $maxFigAttack 5

	send "q m****c "
	waitOn "Planet #"
	getWord CURRENTLINE $planet 2
	waitOn "Fighters        N/A"
	getWord CURRENTLINE $planetFighters 5
	waitOn "<Enter Citadel>"

	stripText $planet "#"
	SetVar $isManual FALSE
	gosub :getstats
return

:getSectorLocation
	send "/"
	waitOn "Sect "
	getWord CURRENTLINE $temp 2
	stripText $temp "Turns"
	stripText $temp " "
	replacetext $temp #179 ""
	setVar $CURRENT_SECTOR $temp
return



:authenticate
    killalltriggers
    setVar $subLine CURRENTLINE
    setVar $subLine $subLine & "             "
    getWord $subLine $spoof 1
    cutText $subLine $subSender 3 6
    setVar $auth_result "false"
    if ($spoof = "'")
        setVar $auth_result "self"
    elseif ($spoof = "R")
        setVar $thisCorpie 0
        :corpieSubLoop
            add $thisCorpie 1
            if ($thisCorpie <= $corpies)
                if (($subSender = $corpie[$thisCorpie]))
                    setVar $auth_result "true"
                    goto :authDone
                end
                goto :corpieSubLoop
            end
    end
    :authDone
return

:getName
    send "I"
    waitfor "<Info>"
    :waitForName
        setTextLineTrigger getName :getTraderName "Trader Name    :"
        setTextTrigger getNameDone :getNameDone "Command [TL="
        setTextTrigger getNameDone2 :getNameDone "Citadel command"
        pause

    :getTraderName
        killAllTriggers
        setVar $name CURRENTLINE
        stripText $name "Trader Name    : "
        stripText $name "3rd Class "
        stripText $name "2nd Class "
        stripText $name "1st Class "
        stripText $name "Annoyance "
        stripText $name "Nuisance "
        stripText $name "Menace "
        stripText $name "Smuggler Savant "
        stripText $name "Smuggler "
        stripText $name "Robber "
        stripText $name "Private "
        stripText $name "Lance Corporal "
        stripText $name "Corporal "
        stripText $name "Staff Sergeant "
        stripText $name "Gunnery Sergeant "
        stripText $name "1st Sergeant "
        stripText $name "Sergeant Major "
        stripText $name "Sergeant "
        stripText $name "Chief Warrant Officer "
        stripText $name "Warrant Officer "
        stripText $name "Terrorist "
        stripText $name "Infamous Pirate "
        stripText $name "Notorious Pirate "
        stripText $name "Dread Pirate "
        stripText $name "Pirate "
        stripText $name "Galactic Scourge "
        stripText $name "Enemy of the State "
        stripText $name "Enemy of the People "
        stripText $name "Enemy of Humankind "
        stripText $name "Heinous Overlord "
        stripText $name "Prime Evil "
        stripText $name "Ensign "
        stripText $name "Lieutenant J.G. "
        stripText $name "Lieutenant Commander "
        stripText $name "Lieutenant "
        stripText $name "Commander "
        stripText $name "Captain "
        stripText $name "Commodore "
        stripText $name "Rear Admiral "
        stripText $name "Vice Admiral "
        stripText $name "Fleet Admiral"
        stripText $name "Admiral "
        stripText $name "Civilian "
        goto :waitForName
    :getNameDone
        killalltriggers
return



# ----- SUB :getCorpies
:getCorpies
    setVar $corpies 0
    send "XAQ"
    waitfor " Corp Member Name                   Sector  Fighters Shields Mines  Credits"
    waitfor "------------------------------------------------------------------------------"
    :waitForCorpieName
        setTextLineTrigger getCorpieName :getCorpieName
        pause

    :getCorpieName
        killAllTriggers
        if (CURRENTLINE = "P indicates Trader is on a planet in that sector")
            goto :getCorpieNameDone
        end
        add $corpies 1
        setVar $corpieLine CURRENTLINE
        setVar $corpieLine $corpieLine & "          "
        cutText $corpieLine $corpie[$corpies] 1 6
        goto :waitForCorpieName
    :getCorpieNameDone
        killalltriggers
return

:validateMineHit
	setVar $isValid FALSE
	cutText CURRENTLINE&"    " $ck 1 1
	if ($ck <> "Y")
		return
	end
	getText CURRENTLINE $dropSector "Your mines in " " did"
	getText CURRENTANSILINE $alien_check $START_FIG_HIT_OWNER $END_FIG_HIT_OWNER
	getWordPos CURRENTLINE $pos $START_FIG_HIT_OWNER
	getWordPos $alien_check $apos $ALIEN_ANSI
	if (($apos > 0) OR ($pos = 0))
		return
	end
	if ($targetingPerson)
		getWordPos CURRENTLINE&" " $pos " "&$target&" "
		if ($pos = 0)
			return
		end
	end
	setVar $isValid TRUE
return

:validateLimpetHit
	setVar $isValid FALSE
	cutText CURRENTLINE&" " $radio 1 1
	if ($radio <> "L")
		return
	end
	setVar $isValid TRUE
	getText CURRENTLINE $dropSector "Limpet mine in " " a"
return

:validateFighterHit
	setVar $isValid FALSE
	cutText CURRENTLINE&" " $radio 1 1
	getText CURRENTLINE $dropSector $START_FIG_HIT $END_FIG_HIT
	if ($radio <> "D")
		return
	end
	getText CURRENTANSILINE $alien_check $START_FIG_HIT_OWNER $END_FIG_HIT_OWNER
	getWordPos CURRENTLINE $pos $START_FIG_HIT_OWNER
	getWordPos $alien_check $apos $ALIEN_ANSI
	if (($apos > 0) OR ($pos = 0))
		return
	end
	if ($targetingPerson)
		getWordPos CURRENTLINE $pos " "&$target&"'s "
		if ($pos <= 0)
			return
		end
	end
	setVar $isValid TRUE
return

:quikstats
	setVar $CURRENT_PROMPT 		"Undefined"
	setVar $CORPORATION 0
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
				getWord $stats $CORPORATION		($current_word + 1)
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