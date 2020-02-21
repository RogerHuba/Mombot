:fastAttack
	setVar $targetString  "a"
	setVar $player~isFound FALSE
	setVar $targetShotgun "a z z y z"&$SHIP~SHIP_MAX_ATTACK&"* * a z z * y z"&$SHIP~SHIP_MAX_ATTACK&"* * a z z * * y z"&$SHIP~SHIP_MAX_ATTACK&"* * "

	if ($SHIP~SHIP_MAX_ATTACK <= 0)
		gosub :ship~getshipstats
	end

	if ((currentsector = stardock) or (currentsector <= 10))
		setvar $player~fedspace true
	end
	:checkingFigs
		if ($player~fighters <= 0)
			gosub :player~quikstats
			if ($player~fighters <= 0)
				setvar $switchboard~message ANSI_12&"*You have no fighters.*"&ANSI_7
				gosub :bot~echo
				goto :stoppingPoint
			end
		end
		if ($player~fedspace <> true)
			getWordPos $SECTOR~sectorData $beaconPos "[0m[35mBeacon  [1;33m:"
			if ($beaconPos > 0)
				setVar $targetString $targetString&"*"
			end
		end
	if (($SECTOR~emptyShipCount + $SECTOR~fakeTraderCount + $SECTOR~realTraderCount) > 0)
		setVar $i 0
		while ($i < ($SECTOR~emptyShipCount + $SECTOR~fakeTraderCount))
			setVar $targetString $targetString&"* "
			add $i 1
		end
		setVar $c 1
		while (($c <= $SECTOR~realTraderCount) AND ($player~isFound = FALSE))

			if (($player~traders[$c][1]) = ($player~CORP))
				setVar $targetString $targetString&"* "
			elseif (($player~fedspace = true) AND ($player~traders[$c][2] = TRUE))
				setVar $targetString $targetString&"* "
			elseif (($PLAYER~targetingShip <> false) and ($player~traders[$c][3] <> true))
				setVar $targetString $targetString&"* "
			else
				setVar $player~isFound TRUE
				setVar $targetString $targetString&"zy z"
			end
			add $c 1
		end
	else
		setvar $switchboard~message "*You have no targets.*" 
		gosub :bot~echo
		goto :stoppingPoint
	end
	if ($player~isFound = TRUE)
		setVar $attackString ""
		while ($player~fighters > 0)
			if ($player~fighters < $SHIP~SHIP_MAX_ATTACK)
				if ($player~shotgun)
					setVar $attackString $attackString&$targetShotgun&$refurbString
				else
					if ($player~doubletap)
						setVar $attackString $attackString&$targetString&$player~fighters&"* * "&$targetString&$player~fighters&"* * "&$refurbString
					else
						setVar $attackString $attackString&$targetString&$player~fighters&"* * "&$refurbString
					end
				end
				setVar $player~fighters 0
			else
				if ($player~shotgun)
					setVar $attackString $attackString&$targetShotgun&$refurbString
				else
					if ($player~doubletap)
						setVar $attackString $attackString&$targetString&$SHIP~SHIP_MAX_ATTACK&"* * "&$targetString&$SHIP~SHIP_MAX_ATTACK&"* * "&$refurbString
						setVar $player~fighters ($player~fighters - $SHIP~SHIP_MAX_ATTACK)
					else
						setVar $attackString $attackString&$targetString&$SHIP~SHIP_MAX_ATTACK&"* * "&$refurbString
					end
				end
				setVar $player~fighters ($player~fighters - $SHIP~SHIP_MAX_ATTACK)
			end
		end
	else
		setvar $switchboard~message "*You have no valid targets.*" 
		gosub :bot~echo
		goto :stoppingPoint
	end
	send $attackString&"* "
	#gosub :player~quikstats
	:stoppingPoint
return
