	gosub :BOT~loadVars


	setVar $BOT~help[1]   $BOT~tab&"CITFILL - Citadel Base Refill Mode"
	setVar $BOT~help[2]   $BOT~tab&"          Refills any corpie above a planet who attacks/is "
	setVar $BOT~help[3]   $BOT~tab&"         attacked or deploys fighters."
	setVar $BOT~help[4]   $BOT~tab&"         "
	setVar $BOT~help[5]   $BOT~tab&"          citfill [on/off] {number figs to attempt per try} "
	gosub :bot~helpfile


 

		setVar $ranksLength 	47
		setArray $TRADERS 	200
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
		setVar $lastTarget 	""


:FigMe
	killalltriggers
	gosub :player~quikstats
	setVar $startingLocation $player~CURRENT_PROMPT
	if ($bot~parm1 <> "on")
        	send "'{" $bot~bot_name "} - Please use - citfill [on/off]*"
		halt
	else
		if ($startingLocation <> "Citadel")
			send "'{" $bot~bot_name "} - This mode must be run from the Citadel Prompt*"
			setVar $mode "General"
			halt
		end
		isNumber $test $bot~parm2
		if ($test <= 0)
			setVar $bot~parm2 0
		end
		if ($bot~parm2 <= 0)
			setVar $figsToRefill 9999
		else
			setVar $figsToRefill $bot~parm2
		end

		getwordpos " "&$bot~user_command_line&" " $pos " auto "
		if ($pos > 0)
			setvar $auto true
		else
			setvar $auto false
		end
		:start_cit_fill
			send "'{" $bot~bot_name "} - Citadel Ship Re-Filler :: Powering Up!*"

		:warning_cit_fill
			send "\"
			waitFor "Online Auto Flee"
			getWord CURRENTLINE $fleetest 5
			if ($fleetest = "enabled.")
				send "\"
			end

			send "q m***"
			gosub :planet~getPlanetInfo
			send "c "

			send "'{" $bot~bot_name "} - Citadel Ship Re-Filler :: Running on Planet " $planet~planet " :: " $planet~planet_FIGHTERS " Fighters available on surface.*"
			send "'{" $bot~bot_name "} - Citadel Ship Re-Filler now active! Script will re-fig an ally in the sector over planet " & $planet~planet & ".*"
			send "'{" $bot~bot_name "} - Citadel Ship Re-Filler will attempt to refill "&$figsToRefill&" fighters at a time.*"
			if ($auto = true)
				send "'{" $bot~bot_name "} - Doing auto refill every five minutes.*"
			end
	end
	goto :reloadfigme


:settriggers
	killalltriggers
	setTextLineTrigger 1 :reloadFigMe "launches a wave of fighters"
	setTextLineTrigger 2 :reloadFigMe "deploys some fighters"
	if ($auto = true)
		setdelaytrigger 3 :reloadFigMe 300000
	end
	setTextTrigger 		pause 	:pausing 		"Planet command (?="
	setTextTrigger 		pause2 	:pausing 		"Computer command ["
	setTextTrigger 		pause3 	:pausing 		"Corporate command ["
	pause

:pausing
	killAllTriggers
	echo ANSI_6 "*[" ANSI_14 "Citadel Filler paused. To restart, re-enter citadel prompt" ANSI_6 "]*" ANSI_7
	setTextTrigger restart :restarting "Citadel command ("
	pause
:restarting
	killAllTriggers
	echo ANSI_6 "*[" ANSI_14 "Citadel Filler restarted" ANSI_6 "]*" ANSI_7
	goto :settriggers


:reloadFigMe
killalltriggers
# Kaboom launches a wave of fighters at the blarg
# Kaboom deploys some fighters.
	getWord CURRENTLINE $test 1
	setVar $whoDidIt " "&CURRENTLINE&" "
	lowercase $whoDidIt
	if ($test = "F") or ($test = "R") or ($test = "P") or ($test = "'") or ($test = "`")
		goto :settriggers
	end
	goSub :getSectorData
	setVar $targetString ""
	if ($realTraderCount > 0)
		setVar $c 1
		setVar $isFound FALSE
		while (($c <= $realTraderCount) AND ($isFound <> TRUE))
			if ($TRADERS[$c][1] = $player~CORP)
				lowercase $TRADERS[$c]
				getWordPos $whoDidIt $pos " "&$TRADERS[$c]&" "
				getWordPos $whoDidIt $pos2 " "&$TRADERS[$c]&". "
				if ((($pos > 0) OR ($pos2 > 0)) or ($auto = true))
					setVar $targetString $targetString&"y "
					setVar $isFound TRUE
				else
					setVar $targetString $targetString&"* "
				end
			end
			add $c 1
		end

	else
		echo ANSI_12 "*No corpie to refurb.*" ANSI_7
		goto :settriggers
	end 
	setVar $reloadNow "f "&$targetString&" * z"&$figsToRefill&"* "

	setvar $refillstring "q t "&$reloadNow&" * l " & $planet~planet & "* m * * *  "
	send "q "&$refillstring&$refillstring&$refillstring&"c "
	gosub :player~quikstats
	goto :settriggers

:getTraders
	getWordPos $sectorData $posTrader "[0m[33mTraders [1m:"
	if ($posTrader > 0)
		getText $sectorData $traderData "[0m[33mTraders [1m:" "[0m[1;32mWarps to Sector(s) [33m:"
		setVar $traderData $STARTLINE&$traderData
		getText $traderData $temp $STARTLINE $ENDLINE 
		setVar $realTraderCount 0
		setVar $player~corpieCount 0
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
				lowercase $temp
				setVar $TRADERS[($realTraderCount+1)] $temp
				setVar $TRADERS[($realTraderCount+1)][1] $tempCorp
				#echo "*" $traders[($realTraderCount+1)] "   " $traders[($realTraderCount+1)][1] "   " $traders[($realTraderCount+1)][2] "*"
				add $realTraderCount 1
				if ($tempCorp = $player~corp)
					add $player~corpieCount 1
				end
			end
			getText $traderData $temp $STARTLINE $ENDLINE 	
		end
	else
		setVar $realTraderCount 0
		setVar $player~corpieCount 0
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
				cutText $temp $temp $pos2 9999
				stripText $temp "[0;35m[[31mOwned by[35m] "
				getWordPos $temp $pos3 ",[0;32m w/"
				cutText $temp $temp 0 $pos3
				getWordPos $temp $pos4 "[34m[[1;36m"
				striptext $temp "[1;33m,"
				if ($pos4 > 0)
					cuttext $temp $temp $pos4 9999
					striptext $temp "[34m[[1;36m"
					striptext $temp "[0;34m]"
				end
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
	killalltriggers
	if ($startingLocation = "Citadel")
		send "s* "
	else
		send "** "
	end
	setVar $sectorData ""
	
	:sectorsline_cit_kill
		killTrigger getLine
		setVar $line CURRENTANSILINE
		setVar $line $STARTLINE&$line&$ENDLINE
		setVar $sectorData $sectorData&$line
		getWordPos $line $pos "Warps to Sector(s) "
		if ($pos > 0)
			goto :gotSectorData
		else
			setTextLineTrigger getLine :sectorsline_cit_kill
		end
		pause

	:gotSectorData
		killalltriggers
		goSub :getTraders
		goSub :getEmptyShips
		goSub :getFakeTraders
return

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
