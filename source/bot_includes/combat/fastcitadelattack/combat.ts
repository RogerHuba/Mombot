:fastCitadelAttack
	if ($SHIP~SHIP_MAX_ATTACK <= 0)
		gosub :ship~getshipstats
	end
	setVar $refurbString "l "&$PLANET~PLANET&"* m * * * "
	setVar $attackString ""
	setVar $targetString  "a z "
	setVar $targetShotgun "a z z y z"&$SHIP~SHIP_MAX_ATTACK&"* * a z z * y z"&$SHIP~SHIP_MAX_ATTACK&"* * a z z * * y z"&$SHIP_MAX_ATTACK&"* * "
	setVar $player~isFound FALSE
	if ($player~fighters > 0)
		if ($player~fedspace <> true)
			getWordPos $SECTOR~sectorData $beaconPos "[0m[35mBeacon  [1;33m:"
			if ($beaconPos > 0)
				setVar $targetString $targetString&"*"
			end
		end
	else
		gosub :player~quikstats
		if ($player~fighters <= 0)
			send "'{" $SWITCHBOARD~bot_name "} - Out of fighters, shutting down "&$BOT~command&".*"
			halt
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
			if (($player~fedspace = true) AND $player~traders[$c][2] = TRUE)
				setVar $targetString $targetString&"* "
			elseif (($player~traders[$c][1] = $player~CORP) OR ($player~traders[$c][1] = 100000))
				setVar $targetString $targetString&"* "	
			elseif (($player~targetingCorp = TRUE) AND ($player~traders[$c][1] <> $target))
				setVar $targetString $targetString&"* "
			elseif (($player~targetingPerson = TRUE) AND ($player~traders[$c] <> $target))
				setVar $targetString $targetString&"* "
			else
				setVar $player~isFound TRUE
				setVar $targetString $targetString&"z y z"
				
			end
			add $c 1
		end
	
	else
		echo ANSI_12 "*You have no targets.*" ANSI_7
		return
	end
	if ($player~isFound = TRUE)
		setVar $player~thisKillTarget ""
		setVar $player~lastKillTarget ""
		if ($player~smart)
			setVar $attackString ""
			send "q "
			setVar $count 8
			while ($count > 0)
				if ($player~shotgun)
					send $attackString $attackString&"q "&$targetShotgun&$refurbString
				else
					if ($player~doubletap)
						send $attackString $attackString&"q "&$targetString&$SHIP~SHIP_MAX_ATTACK&"* * "&$targetString&$SHIP~SHIP_MAX_ATTACK&"* * "&$refurbString
					else
						send $attackString $attackString&"q "&$targetString&$SHIP~SHIP_MAX_ATTACK&"* * "&$refurbString
					end
				end
				setTextTrigger	foundkilltarget  :foundkilltarget	 "(Y/N) [N]? Y"
				setTextLineTrigger noktarget	:nokilltargets "Do you want instructions (Y/N) [N]?"
				pause
				:foundkilltarget
					killalltriggers
					setVar $kill_ship_info CURRENTLINE
					setVar $player~thisKillTarget CURRENTANSILINE
					getWordPos $player~thisKillTarget $pos "[0;33m([1;36m"
					cutText $player~thisKillTarget $player~thisKillTarget 1 $pos
					getWordPos $player~thisKillTarget $pos "'s "
					while ($pos > 0)
						cutText $player~thisKillTarget $player~thisKillTarget ($pos+3) 9999
						getWordPos $player~thisKillTarget $pos "'s "
					end
					getText $player~thisKillTarget $player~thisKillTarget #27&"[0m"&#27 #27&"["
					getText $player~thisKillTarget&"/\ENDOFSHIPTAG/\" $player~thisKillTarget "m" "/\ENDOFSHIPTAG/\"
					getWordPos $player~traders[($c-1)][1] $pos $player~thisKillTarget
					if ((($player~lastKillTarget <> "") AND ($player~thisKillTarget <> $player~lastKillTarget)))
						echo "*Target has changed, time to rescan..*"
						send " c "
						goto :doneKill
					end
					setVar $player~lastKillTarget $player~thisKillTarget
				:nokilltargets
					killalltriggers
								
				subtract $count 1
			end
			send " c "		
		else
			setVar $attackString ""
			setVar $count 8
			while ($count > 0)
				if ($player~shotgun)
					setVar $attackString $attackString&"q "&$targetShotgun&$refurbString
				else
					if ($player~doubletap)
						setVar $attackString $attackString&"q "&$targetString&$SHIP~SHIP_MAX_ATTACK&"* * "&$targetString&$SHIP~SHIP_MAX_ATTACK&"* * "&$refurbString
					else
						setVar $attackString $attackString&"q "&$targetString&$SHIP~SHIP_MAX_ATTACK&"* * "&$refurbString
					end
				end
				subtract $count 1			
			end
			send "q "&$attackString&" c "
		end
	else	
		echo ANSI_12 "*You have no valid targets.*" ANSI_7
		return
	end
	:doneKill
return
