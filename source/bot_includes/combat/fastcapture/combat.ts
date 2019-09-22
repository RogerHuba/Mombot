
:fastCapture
	setVar $player~isFound FALSE
	setVar $targetIsAlien FALSE
	setVar $stillShields FALSE

	loadvar $ship~SHIP_MAX_ATTACK
	loadvar $SHIP~SHIP_OFFENSIVE_ODDS

	if ($SHIP~SHIP_MAX_ATTACK <= 0)
		gosub :ship~getshipstats
	end

	if ((currentsector = stardock) or (currentsector <= 10))
		setvar $player~fedspace true
	end

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
			send "q q * "
		end
		setVar $targetString "a "
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
			#echo "*"&$player~traders[$c]&"[]"&$player~traders[$c][1]&"[]"&$player~traders[$c][2]&"*"
			if (($player~fedspace = true) AND ($player~traders[$c][2] = TRUE))
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
	if (($player~isFound = FALSE) AND ($SECTOR~emptyShipCount > 0))
		if ($player~fedspace <> true)
			getWordPos $SECTOR~sectorData $beaconPos "[0m[35mBeacon  [1;33m:"
			if ($beaconPos > 0)
				setVar $targetString $targetString&"*"
			end
		end
		setVar $c 1
		setVar $player~isFound FALSE
		while (($c <= $SECTOR~emptyShipCount) AND (($player~isFound = FALSE) or ($player~fedspace <> true)))
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
					killalltriggers
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
							add $end_of_line_pos ($targetpos+1)
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
				#echo "*["&$thistarget&"]*"
				#echo "*["&$player~lasttarget&"]*"
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
					echo "*["&$cap_ship_info&"]*"
					echo "*["&$SHIP~shipList[$type_count]&"]*"
					getWordPos $cap_ship_info $is_ship $SHIP~shipList[$type_count]
					getWordPos $cap_ship_info $unman "'s unmanned "
					getwordpos $cap_ship_info $unman2 "s' unmanned "
					if (($unman > 0) or ($unman2 > 0))
						setVar $unmanned true
						#echo "*[unmanned]*"
					else
						#echo "*[manned]*"
						setVar $unmanned false
					end
					if (($is_ship > 0) AND ($SHIP~shipList[$type_count] <> "0"))
						getWord $SHIP~ship[$SHIP~shipList[$type_count]] $player~shields 1
						getWord $SHIP~ship[$SHIP~shipList[$type_count]] $defodds 2
						goto :send_attack
					end
				end

				#  if you don't know the ship, just guess weakest with most shield.  Probably blow it up, but better than doing nothing #
				setVar $SWITCHBOARD~message "Unknown ship type, cannot calculate attack.  I'm going to guess.*" 
				gosub :SWITCHBOARD~switchboard
				setvar $shieldpoints 16000
				setVar $defodds 5
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
				echo "*They attacked me, switching to 1 fighter attacks.*"
				setVar $ship_fighters 1
			:cap_it
				killtrigger combat_scan
				killtrigger cap_it
				killtrigger notarget
				killtrigger theyattacked
				getWord CURRENTLINE $max_figs 11 $ship~SHIP_MAX_ATTACK
				stripText $max_figs ","
				stripText $max_figs ")"
				if ($ship_fighters = "")
					setVar $ship_fighters 1
				end
				#echo "*["&$defodds&"]*"
				
				setVar $cap_points (($shieldPoints + $ship_fighters) * $defodds)
				#echo "*Cap Points: ["&$cap_points&"]*"
				if ((($player~defenderCapping = TRUE) AND ($unmanned <> true)) AND ($targetIsAlien = TRUE))
					if ($stillShields = TRUE)
						if ($ship_fighters > 1000)
							 setVar $cap_points (($shieldPoints / $own_odds) + ($cap_points/100))
						else
							setVar $cap_points ($shieldPoints+1)
						end
					else
						setVar $cap_points 1
					end
				else
					#echo "*["&$own_odds&"]*"
					setVar $cap_points ($cap_points / $own_odds)
				end
				if ($unmanned = true)
					setvar $cap_points ($cap_points/2)
				end
				setVar $cap_points (($cap_points * 80) / 100)
				if ($cap_points <= 0)
					setVar $cap_points 1
				elseif ($cap_points > $max_figs)
					setVar $cap_points $max_figs
				end
				setVar $sendAttack "z"&$cap_points&"*  "
				if ($player~startingLocation = "Citadel")
					setvar $sendAttack $sendAttack&$refurbString
				end
				#echo "*["&$sendAttack&"]*"
				send $sendAttack
#				if ($cap_points = 1)
#					setvar $i 1
#					setvar $burst ""
#					while ($i <= 3)
#						setvar $burst $burst&" "&$targetString&$sendAttack
#						setVar $player~fighters ($player~fighters-$cap_points)
#						add $i 1
#					end
#					send $burst
#					setdelaytrigger littleslower :donelittleslower 100
#					pause
#					:donelittleslower
#					gosub :player~quikstats
#				end
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
	killalltriggers
return
