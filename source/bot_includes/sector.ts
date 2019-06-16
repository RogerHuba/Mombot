:getSectorData
	setVar $ENDLINE     "_ENDLINE_"
	setVar $STARTLINE   "_STARTLINE_"
	
	 killalltriggers
	if ($PLAYER~startingLocation = "Citadel")
		send "s* "
	else
		if ($player~fedspace = true)
			send "*"
		else
			send "** "
		end
	end
	setVar $sectorData ""
	:sectorsline_cit_kill
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
		getWordPos $sectorData $beaconPos "[0m[35mBeacon  [1;33m:"
		if ($beaconPos > 0)
		   setVar $containsBeacon TRUE
				else
					setVar $containsBeacon FALSE
				end
		goSub :getTraders
		goSub :getEmptyShips
		goSub :getFakeTraders
return

:getTraders
	getWordPos $sectorData $posTrader "[0m[33mTraders [1m:"
	if ($posTrader > 0)
		getText $sectorData $traderData "[0m[33mTraders [1m:" "[0m[1;32mWarps to Sector(s) "   
		setVar $traderData $STARTLINE&$traderData
		getText $traderData $temp $STARTLINE $ENDLINE 
		setVar $realTraderCount 0
		setVar $corpieCount 0
		setVar $defenderShips 0
		while ($temp <> "")
			getLength $STARTLINE&$temp&$ENDLINE $length
			cutText $traderData $traderData ($length+1) 9999 
			stripText $temp $STARTLINE
			stripText $temp $ENDLINE
			stripText $temp "[0m          "
			stripText $temp "[0m[33mTraders [1m:"
			setVar $j 1
			setVar $isFound FALSE
			#only check for fed safe if you are in fed sector
			if (($player~current_sector <= 10) or ($player~current_sector = STARDOCK))
				while (($j < $player~ranksLength) AND ($isFound = FALSE))
					getWordPos $temp $pos $player~ranks[$j]    
					if ($pos > 0)
						getLength $player~ranks[$j] $length
						cutText $temp $temp ($pos+$length+1) 9999
						if ($j <= 10)
							setVar $player~traders[($realTraderCount+1)][2] TRUE
						else
							setVar $player~traders[($realTraderCount+1)][2] FALSE
						end
						setVar $isFound TRUE
					end
					add $j 1
				end
			else
				setVar $player~traders[($realTraderCount+1)][2] FALSE
			end
			getWordPos $temp $pos "[0;32m w/"
			getWordPos $temp $pos2 "[0;35m[[31mOwned by[35m]"
			getWordPos $temp $pos3 #27&"[0m      "&#27&"[32m     in "&#27
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
				setVar $player~traders[($realTraderCount+1)] $temp
				setVar $player~traders[($realTraderCount+1)][1] $tempCorp
				if ($tempCorp = $player~CORP)
					add $corpieCount 1
				end
				add $realTraderCount 1
			end
			#for defender recognition once ansi ships are in array in bot
			if (($pos3 > 0) AND ($tempCorp <> $player~CORP) AND ($player~override <> TRUE))
				getText $temp $shipname "(" ")"
				#getText $shipname $shipname "m"&#27 #27&"["
				if ($shipname = "")
					getText $shipname $shipname "(" ")"
					#getText $shipname&"ENDOFSHIP" $shipname "m"&#27&"[" "ENDOFSHIP"
				end
				getText $shipname&"ENDOFSHIP" $shipname "m" "ENDOFSHIP"
				setVar $isFound FALSE
				setVar $s 1
				setVar $isDefender FALSE
				replacetext $shipname ";" "m"
				striptext $shipname "30m"
				striptext $shipname "31m"
				striptext $shipname "32m"
				striptext $shipname "33m"
				striptext $shipname "34m"
				striptext $shipname "35m"
				striptext $shipname "36m"
				striptext $shipname "37m"
				striptext $shipname "38m"
				striptext $shipname "39m"
				striptext $shipname "40m"
				striptext $shipname "41m"
				striptext $shipname "42m"
				striptext $shipname "43m"
				striptext $shipname "44m"
				striptext $shipname "45m"
				striptext $shipname "46m"
				striptext $shipname "47m"
				striptext $shipname "[0;30;47m"
				striptext $shipname "[32;40m"
				striptext $shipname "[0;"
				striptext $shipname "[1;"
				striptext $shipname "[0m"
				striptext $shipname "[1m"
				striptext $shipname #13
				striptext $shipname #27
				striptext $shipname ""
				striptext $shipname "["

				while (($isFound = FALSE) AND ($s < $ship~shipCounter))
					striptext $ship~shipList[$s] "["
					getwordpos $shipname $pos $ship~shipList[$s]
					if ($pos > 0)
						#echo "*["&$shipname&"*][*"&$ship~shipList[$s]&"]*"
						setVar $isFound TRUE
						setVar $isDefender $ship~shipList[$s][8]
					end
					add $s 1
				end
				setVar $player~traders[($realTraderCount)][3] $shipname
				if ($isDefender = TRUE)
					setVar $player~traders[($realTraderCount)][1] 100000
					#echo "*Adding defender ship:"&$shipname&"*"
					add $defenderShips 1
				end
			end
			getText $traderData $temp $STARTLINE $ENDLINE   
		end 
	else
		setVar $realTraderCount 0
		setVar $corpieCount 0
		setVar $defenderShips 0
	end
return


:getEmptyShips
	getWordPos $sectorData $posShips "[0m[33mShips   [1m:"
	if ($posShips > 0)
		getText $sectorData $shipData "[0m[33mShips   [1m:" "[0m[1;32mWarps to Sector(s) [33m:"
		setVar $shipData $STARTLINE&$shipData
		getText $shipData $temp $STARTLINE $ENDLINE
		setVar $emptyShipCount 0
		setVar $myShipCount 0
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
				setVar $player~emptyships[($emptyShipCount+1)] $temp
				if (($player~emptyships[($emptyShipCount+1)] = $player~CORP) OR ($player~emptyships[($emptyShipCount+1)] = $player~TRADER_NAME))
					add $myShipCount 1
				end
				add $emptyShipCount 1
			end
			getText $shipData $temp $STARTLINE $ENDLINE
		end
	else
		setVar $emptyShipCount 0
		setVar $myShipCount 0
	end
return

:getFakeTraders
	setVar $federalsInSector FALSE
	setvar $federalCount 0
	getWordPos $sectorData $posShips "[0m[33mShips   [1m:"
	getWordPos $sectorData $posTraders "[0m[33mTraders [1m:"
	getWordPos $sectorData $posFederals "[0m[33mFederals[1m:"
	if ($posFederals > 0)
		setVar $federalsInSector TRUE
	end
	if ($posTraders > 0)
		getText $sectorData $fakeData "[1;32mSector  [33m:" "[0m[33mTraders [1m:"
		gosub :grabFakeData
	elseif ($posShips > 0)
		getText $sectorData $fakeData "[1;32mSector  [33m:" "[0m[33mShips   [1m:"
		gosub :grabFakeData
	else
		getText $sectorData $fakeData "[1;32mSector  [33m:" "[0m[1;32mWarps to Sector(s) [33m:"
		gosub :grabFakeData
	end
return
:grabFakeData
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
		getWordPos $temp $pos4 "[0;32mw/ "&#27&"[1;33m"
		getWordPos $temp $pos5 "in[36m "
		if ((($pos4 > 0) OR ($pos > 0) OR ($pos2 > 0)) AND ($pos3 <= 0))
			setVar $PLAYER~FAKETRADERS[($fakeTraderCount+1)] $temp
			getWordPos $temp $posa "Zyrain"
			getWordPos $temp $posb "Clausewitz"
			getWordPos $temp $posc "Nelson"
			if (($posa > 0) or ($posb > 0) or ($posc > 0))
				add $federalCount 1
			end
			add $fakeTraderCount 1
		end
		#for capturing alien ship recognition once ansi ships are in array in bot
		if ($pos5 > 0)
			getText $temp $shipname "[1;31m"  ")"
			#getText $shipname $shipname "m"&#27 #27&"["
			if ($shipname = "")
				getText $temp $shipname "(" ")"&#13
				getText $shipname&"ENDOFSHIP" $shipname "m"&#27&"[" "ENDOFSHIP"
			end
			getText $shipname&"ENDOFSHIP" $shipname "m" "ENDOFSHIP"
		end

		getText $fakeData $temp $STARTLINE $ENDLINE
	end
return
