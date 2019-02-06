#Author: Mind Dagger

:init
# ============================ START SECTOR DATA VARIABLES ==========================
    setArray $player~traders   50
    setArray $player~faketraders   50
    setArray $player~emptyships   100
    setVar $player~rankslength     46
    setArray $player~ranks     $player~rankslength
    setVar $player~ranks[1]    "36mCivilian"
    setVar $player~ranks[2]    "36mPrivate 1st Class"
    setVar $player~ranks[3]    "36mPrivate"
    setVar $player~ranks[4]    "36mLance Corporal"
    setVar $player~ranks[5]    "36mCorporal"
    setVar $player~ranks[6]    "36mStaff Sergeant"
    setVar $player~ranks[7]    "36mGunnery Sergeant"
    setVar $player~ranks[8]    "36m1st Sergeant"
    setVar $player~ranks[9]    "36mSergeant Major"
    setVar $player~ranks[10]   "36mSergeant"
    setVar $player~ranks[11]   "31mAnnoyance"
    setVar $player~ranks[12]   "31mNuisance 3rd Class"
    setVar $player~ranks[13]   "31mNuisance 2nd Class"
    setVar $player~ranks[14]   "31mNuisance 1st Class"
    setVar $player~ranks[15]   "31mMenace 3rd Class"
    setVar $player~ranks[16]   "31mMenace 2nd Class"
    setVar $player~ranks[17]   "31mMenace 1st Class"
    setVar $player~ranks[18]   "31mSmuggler 3rd Class"
    setVar $player~ranks[19]   "31mSmuggler 2nd Class"
    setVar $player~ranks[20]   "31mSmuggler 1st Class"
    setVar $player~ranks[21]   "31mSmuggler Savant"
    setVar $player~ranks[22]   "31mRobber"
    setVar $player~ranks[23]   "31mTerrorist"
    setVar $player~ranks[24]   "31mInfamous Pirate"
    setVar $player~ranks[25]   "31mNotorious Pirate"
    setVar $player~ranks[26]   "31mDread Pirate"
    setVar $player~ranks[27]   "31mPirate"
    setVar $player~ranks[28]   "31mGalactic Scourge"
    setVar $player~ranks[29]   "31mEnemy of the State"
    setVar $player~ranks[30]   "31mEnemy of the People"
    setVar $player~ranks[31]   "31mEnemy of Humankind"
    setVar $player~ranks[32]   "31mHeinous Overlord"
    setVar $player~ranks[33]   "31mPrime Evil"
    setVar $player~ranks[34]   "36mChief Warrant Officer"
    setVar $player~ranks[35]   "36mWarrant Officer"
    setVar $player~ranks[36]   "36mEnsign"
    setVar $player~ranks[37]   "36mLieutenant J.G."
    setVar $player~ranks[38]   "36mLieutenant Commander"
    setVar $player~ranks[39]   "36mLieutenant"
    setVar $player~ranks[40]   "36mCommander"
    setVar $player~ranks[41]   "36mCaptain"
    setVar $player~ranks[42]   "36mCommodore"
    setVar $player~ranks[43]   "36mRear Admiral"
    setVar $player~ranks[44]   "36mVice Admiral"
    setVar $player~ranks[45]   "36mFleet Admiral"
    setVar $player~ranks[46]   "36mAdmiral"
    setVar $player~lasttarget  ""

# ============================ END SECTOR DATA VARIABLES ==========================
return




:fastCitadelAttack
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
			return
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


:fastAttack
    setVar $targetString  "a"
    setVar $player~isFound FALSE
    setVar $targetShotgun "a z z y z"&$SHIP~SHIP_MAX_ATTACK&"* * a z z * y z"&$SHIP~SHIP_MAX_ATTACK&"* * a z z * * y z"&$SHIP_MAX_ATTACK&"* * "
    :checkingFigs
        if ($player~fighters <= 0)
            gosub :player~quikstats
            if ($player~fighters <= 0)
                echo ANSI_12 "*You have no fighters.*" ANSI_7
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
            else
                setVar $player~isFound TRUE
                setVar $targetString $targetString&"zy z"
            end
            add $c 1
        end
    else
        echo "*You have no targets.*" 
        #gosub :SWITCHBOARD~switchboard
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
        echo "*You have no valid targets.*" 
        #gosub :SWITCHBOARD~switchboard
        goto :stoppingPoint
    end
    send $attackString&"* "
    #gosub :player~quikstats
    :stoppingPoint
return

:fastCapture
    setVar $player~isFound FALSE
    setVar $targetIsAlien FALSE
    setVar $stillShields FALSE
    setVar $refurbString "l "&$PLANET~PLANET&"* m * * * q "
    :checkingFigs
        if ($player~fighters <= 0)
            gosub :player~quikstats
            if ($player~fighters <= 0)
                setVar $SWITCHBOARD~message "No fighters on ship.*" 
                gosub :SWITCHBOARD~switchboard
                goto :capstoppingPoint
            else
                goto :checkingFigs
            end
        end
        if ($player~startingLocation = "Citadel")
            setVar $targetString "q q * a "
        else
            setVar $targetString "a "
        end
    if (($SECTOR~realTraderCount > $SECTOR~corpieCount) AND ($player~onlyAliens <> TRUE) and ($player~empty_ships_only <> true))
        if ($player~fedspace <> true)
            getWordPos $SECTOR~sectorData $beaconPos "[0m[35mBeacon  [1;33m:"
            if ($beaconPos > 0)
                setVar $targetString $targetString&"*"
            end
        end
        setVar $i 0
        while ($i < ($SECTOR~emptyShipCount + $SECTOR~fakeTraderCount))
            setVar $targetString $targetString&"* "
            add $i 1
        end
        setVar $c 1
        while (($c <= $SECTOR~realTraderCount) AND ($player~isFound = FALSE))
            if (($player~fedspace = true) AND $player~traders[$c][2] = TRUE)
                setVar $targetString $targetString&"* "
            elseif ($player~traders[$c][1] = $player~CORP)
                setVar $targetString $targetString&"* "
            elseif (($player~targetingCorp = TRUE) AND ($player~traders[$c][1] <> $target))
                setVar $targetString $targetString&"* "
            elseif (($player~targetingPerson = TRUE) AND ($player~traders[$c] <> $target))
                setVar $targetString $targetString&"* "
            else
                setVar $player~isFound TRUE
                setVar $targetString $targetString&"zy z"
            end
            add $c 1
        end
    end
    if ((($SECTOR~fakeTraderCount > 0) AND ($player~cappingAliens = TRUE)) AND ($player~isFound <> TRUE) and ($player~empty_ships_only <> true))
        if ($player~fedspace <> true)
            getWordPos $SECTOR~sectorData $beaconPos "[0m[35mBeacon  [1;33m:"
            if ($beaconPos > 0)
                setVar $targetString $targetString&"*"
            end
        end
        setVar $a 1
        while (($a <= $SECTOR~fakeTraderCount) AND ($player~isFound = FALSE))
            getWordPos $player~faketraders[$a] $pos "Zyrain"
            getWordPos $player~faketraders[$a] $pos2 "Clausewitz"
            getWordPos $player~faketraders[$a] $pos3 "Nelson"
            if (($pos <= 0) AND ($pos2 <= 0) AND ($pos3 <= 0))
                setVar $i 0
                setVar $player~isFound TRUE
                setVar $targetIsAlien TRUE
                setVar $targetString $targetString&"zy z"
            else
                setVar $targetString $targetString&"* "
            end
            add $a 1
        end
    end
    if (($player~isFound = FALSE) AND ($SECTOR~emptyShipCount > 0) AND ($player~current_sector > 10) AND ($player~current_sector <> $MAP~STARDOCK))
        if ($player~fedspace <> true)
            getWordPos $SECTOR~sectorData $beaconPos "[0m[35mBeacon  [1;33m:"
            if ($beaconPos > 0)
                setVar $targetString $targetString&"*"
            end
        end
        setVar $c 1
        setVar $player~isFound FALSE
        while (($c <= $SECTOR~emptyShipCount) AND ($player~isFound = FALSE))
            if (($player~emptyships[$c] = $player~CORP) OR ($player~emptyships[$c] = $player~TRADER_NAME))
                setVar $targetString $targetString&"* " 
            else
                setVar $player~isFound TRUE
                setVar $targetString $targetString&"zy z"
            end
            add $c 1
        end
    end
    if ($player~isFound = FALSE)
        echo "*You have no targets.*" 
        #gosub :SWITCHBOARD~switchboard
        goto :capstoppingPoint
    else
        setVar $attackString ""
        :cap_ship
            #get own offensive odds
            setVar $unmanned false
            setVar $own_odds $SHIP~SHIP_OFFENSIVE_ODDS
            setVar $cap_points 0
            setVar $max_figs 0
            setVar $cap_shield_points 0
            setVar $ship_fighters 0
            setVar $player~lasttarget ""
            setvar $firstLoop true
        while ($player~fighters > 0)
            killalltriggers
            setVar $stillShields FALSE
            setVar $isSameTarget FALSE
            :cgoahead
                killtrigger checkcaptarget
                setTextTrigger  foundcaptarget  :foundcaptarget  "(Y/N) [N]? Y"
                setTextTrigger checkcaptarget :checkcaptarget "Yes"
                setTextLineTrigger noctarget    :nocappingtargets "Do you want instructions (Y/N) [N]?"
                send $targetString
                pause
                pause
            :checkcaptarget
                getwordpos CURRENTANSILINE $pos "36mYes"
                if ($pos > 0)
                    goto :foundcaptarget

                else
                    setTextTrigger checkcaptarget :checkcaptarget "Yes"
                    pause
                    pause
                end

            :foundcaptarget
                killtrigger noctarget
                killtrigger foundcaptarget
                killtrigger checkcaptarget
                setVar $cap_ship_info CURRENTLINE
                setVar $thisTarget CURRENTANSILINE
                getWord $cap_ship_info $attack_prompt 1
                if ($attack_prompt <> "Attack")
                    return
                end
                getWordPos $thisTarget $pos "[0;33m([1;36m"
                cutText $thisTarget $thisTarget 1 $pos
                if ($pos > 0)
                    setvar $thistarget $cap_ship_info
                    setvar $temp $thistarget
                    getwordpos $temp $pos " ("
                    # get to the last " (" in the string #
                    setvar $end_of_line_pos 0
                    while ($pos > 0)
                        setvar $targetpos $pos
                        cutText $temp $possibletarget 1 $pos
                        replacetext $temp $possibletarget ""
                        getwordpos $temp $pos " ("
                        if ($pos > 0)
                            add $end_of_line_pos ($targetpos+2)
                        end
                    end
                    if ($end_of_line_pos <= 0)
                        #stupid ansi ship names possibly, just look for (Yes
                        getwordpos $thistarget $end_of_line_pos " (Y"
                        # get to the last " (Y" in the string #
                        #should probably do a while loop here to get to end of string, but not worth it right now
                    end                
                    cutText $thistarget $thistarget 1 $end_of_line_pos
                        
                end
                if (($thisTarget = $player~lasttarget) and ($firstLoop <> true))
                    setVar $isSameTarget TRUE
                elseif ($player~lasttarget = "")
                    setVar $player~lasttarget $thisTarget
                    setvar $firstLoop false
                else
                    goto :nocappingtargets
                end
                if ($isSameTarget)
                    goto :send_attack
                end
            :ship_type
                setVar $type_count 0
                setVar $is_ship 0
                while ($type_count < $SHIP~shipcounter)
                    add $type_count 1
                    getWordPos $cap_ship_info $is_ship $SHIP~shipList[$type_count]
                    getWordPos $cap_ship_info $unman "'s unmanned"
                    if ($unman > 0)
                        setVar $unmanned true
                    else
                        setVar $unmanned false
                    end
                    if (($is_ship > 0) AND ($SHIP~shipList[$type_count] <> "0"))
                        getWord $SHIP~ship[$SHIP~shipList[$type_count]] $player~shields 1
                        getWord $SHIP~ship[$SHIP~shipList[$type_count]] $defodds 2
                        goto :send_attack
                    end
                end
                setVar $player~shields 10000
                setVar $defodds 5
                goto :send_attack
                setVar $SWITCHBOARD~message "Unknown ship type, cannot calculate attack, you must do it manually.*" 
                gosub :SWITCHBOARD~switchboard
                send "* "
                return
            :send_attack
                killtrigger foundcaptarget
                killtrigger noctarget
                killtrigger combat
                killtrigger cap_it
                killtrigger notarget
                killtrigger notarget2
                killtrigger nocombat
                killtrigger theyattacked

                getText $cap_ship_info $ship_fighters $SHIP~shipList[$type_count] "(Y/N)"
                if ($ship_fighters = "")
                    getText $cap_ship_info $ship_fighters " (" ") (Y/N)"
                end
                getText $ship_fighters $ship_fighters "-" ")"
                stripText $ship_fighters ","
                setVar $ship_shield_percent 0
                setVar $shieldpoints 0
                setTextLineTrigger combat :combat_scan "Combat scanners show enemy shields at"
                setTextTrigger nocombat :cap_it "How many fighters do you wish to use"
                setTextLineTrigger notarget :nocappingtargets "Do you want instructions (Y/N) [N]?"
                setTextLineTrigger notarget2 :nocappingtargets "'s unmanned"
                setTextLineTrigger theyattacked :theyattacked "Shipboard Computers "
                pause
                pause

            :combat_scan
                getWord CURRENTLINE $shieldperc 7
                stripText $shieldperc "%"
                setVar $shieldPoints (($player~shields * $shieldperc) / 100)
                setVar $stillShields TRUE
                pause
                pause
            :theyattacked
                setVar $ship_fighters 1
            :cap_it
                killtrigger combat_scan
                killtrigger cap_it
                killtrigger notarget
                killtrigger theyattacked
                getWord CURRENTLINE $max_figs 11
                stripText $max_figs ","
                stripText $max_figs ")"
                if ($ship_fighters = "")
                    setVar $ship_fighters 1
                end
                setVar $cap_points (($shieldPoints + $ship_fighters) * $defodds)
                if ((($player~defenderCapping = TRUE) AND ($unmanned <> true)) AND ($targetIsAlien = TRUE))
                    if ($stillShields = TRUE)
                        if ($ship_fighters > 1000)
                             setVar $cap_points (($shieldPoints / $own_odds) + ($cap_points/100))
                        else
                            setVar $cap_points ($shieldPoints / $own_odds)
                        end
                    else
                        setVar $cap_points 1
                    end
                else
                    setVar $cap_points (($cap_points / $own_odds) - ($cap_points/100))
                end
                setVar $cap_points (($cap_points * 95) / 100)
                if ($unmanned = true)
                    divide $cap_points 2
                end
                if ($cap_points <= 0)
                    setVar $cap_points 1
                elseif ($cap_points > $max_figs)
                    setVar $cap_points $max_figs
                end
                setVar $sendAttack $cap_points&"*"
                if ($player~startingLocation = "Citadel")
                    setVar $sendAttack $sendAttack&$refurbString
                end
                send $sendAttack
                if ($cap_points = 1)
					send $targetString&$sendAttack
					setVar $player~fighters ($player~fighters-$cap_points)
					send $targetString&$sendAttack
					setVar $player~fighters ($player~fighters-$cap_points)
					send $targetString&$sendAttack
					setVar $player~fighters ($player~fighters-$cap_points)
					send $targetString&$sendAttack
					setVar $player~fighters ($player~fighters-$cap_points)
					send $targetString&$sendAttack
					setVar $player~fighters ($player~fighters-$cap_points)
					send $targetString&$sendAttack
					setVar $player~fighters ($player~fighters-$cap_points)
					send $targetString&$sendAttack
					setVar $player~fighters ($player~fighters-$cap_points)
					send $targetString&$sendAttack
					setVar $player~fighters ($player~fighters-$cap_points)
					send $targetString&$sendAttack
					setVar $player~fighters ($player~fighters-$cap_points)
					send $targetString&$sendAttack                
					setVar $player~fighters ($player~fighters-$cap_points)
					gosub :player~quikstats
                end
                setVar $player~fighters ($player~fighters-$cap_points)
        :keepcapping
        end
    end
    goto :capStoppingPoint
    :nocappingtargets
        killtrigger noctarget
        killtrigger foundcaptarget
        killtrigger combat_scan
        killtrigger cap_it
        killtrigger notarget
        killtrigger notarget2
        killtrigger theyattacked
        send "* "
    :capStoppingPoint
return



:holo_kill

:holo_kill_kill_check
        setTextLineTrigger noscan1 :holo_kill_noscanner "Handle which mine type, 1 Armid or 2 Limpet"
        setTextLineTrigger noscan2 :holo_kill_noscanner "You don't have a long range scanner."
        setTextLineTrigger scanned :holo_kill_scandone  "Select (H)olo Scan or (D)ensity Scan or (Q)uit? [D] H"
        if ($player~current_prompt = "Citadel")
               send " qqqz* sh*  l " & $PLANET~PLANET & " * j c * "
               setVar $player~CIT TRUE
        else
               send " sh*"
        end
        pause
:holo_kill_noscanner
        killalltriggers
        setVar $SWITCHBOARD~message "You don't have a HoloScanner!*"
        send " *  "
        return
:holo_kill_scandone
        killalltriggers
        gosub :SHIP~getShipStats

:holo_kill_get_prompt
:holo_kill_get_current_sector
        setVar $hkill_start_sector $player~current_sector
        setVar $killsector 0
        setVar $idx 1
        while ($idx <= SECTOR.WARPCOUNT[$player~current_sector])
                setVar $test_sector SECTOR.WARPS[$player~current_sector][$idx]
                setVar $safePlanets TRUE
        setVar $containsShieldedPlanet FALSE
        if (SECTOR.PLANETCOUNT[$test_sector] > 0)
            setVar $p 1
            while ($p <= SECTOR.PLANETCOUNT[$test_sector])
                getWord SECTOR.PLANETS[$test_sector][$p] $test 1
                if ($test = "<<<<")
                    setVar $containsShieldedPlanet TRUE
                end
                add $p 1
            end
            if ($player~surroundAvoidAllPlanets)
                setVar $safePlanets FALSE
            elseif (($containsShieldedPlanet) AND ($player~surroundAvoidShieldedOnly))
                setVar $safePlanets FALSE
            end
        end
        if (($test_sector <> $MAP~stardock) AND ($test_sector > 10) AND (SECTOR.TRADERCOUNT[$test_sector] > 0) AND ($safePlanets = TRUE))
                       setVar $killsector $test_sector
                       goto :holo_kill_killem
                end
                add $idx 1
        end
        goto :holo_kill_no_targets

:holo_kill_killem
        send "'{" $SWITCHBOARD~bot_name "} - HoloKill - Attacking sector " & $test_sector & ".*"
        setVar $no_str ""
        setVar $no_cnt SECTOR.SHIPCOUNT[$killsector]
        setVar $no_idx 1
        while ($no_idx <= $no_cnt)
            setVar $no_str $no_str & "n"
            add $no_idx 1
        end
        send " c v 0 * y n " & $test_sector & " * q "
        if ($player~cit = true)
            send " qmnt*qqz* "
        end
        send " m z " & $test_sector & " *  *  z  a  99999  *  z  a  99999  *  R  *  f  z  1  *  z  c  d  *   "
        setVar $kill_idx 1
        if ($player~surround_before_hkill = TRUE)
            gosub :player~quikstats
            gosub :surround
            setVar $insurround_before_hkill FALSE
            gosub :player~quikstats
        end
    
        gosub :player~current_prompt
        if ($player~current_prompt <> "Command")
            setVar $SWITCHBOARD~message "Wrong prompt for holokill kill.*"
            return
        end
        goSub :SECTOR~getSectorData
        goSub :fastAttack
    
        send "m " & $hkill_start_sector & " *  *  z  a  99999  *  z  a  99999  *  R  *  f  z  1  *  z  c  d  *   "
        if ($player~CIT = TRUE)
            send " l " & $PLANET~PLANET & " * n n * j m * * * j c  *  "
        end
        gosub :player~quikstats
        if ($player~current_sector <> $hkill_start_sector)
               send "'" & $SWITCHBOARD~bot_name " call*"
        else
            setVar $SWITCHBOARD~message "Attack made and back in original sector!*"
        end
        return
:holo_kill_no_targets
        setVar $SWITCHBOARD~self_command TRUE
        setVar $SWITCHBOARD~message "No Enemies found adjacent!*"
return


