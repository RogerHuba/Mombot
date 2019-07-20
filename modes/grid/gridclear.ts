	logging off
	loadVar $switchboard~bot_name
	loadVar $player~unlimitedGame
	loadVar $bot_turn_limit
	loadVar $bot~user_command_line
	loadVar $bot~parm1
	loadVar $bot~parm2
	loadVar $bot~parm3
	loadVar $bot~parm4
	loadVar $bot~parm5
	loadVar $bot~parm6
	loadVar $bot~parm7
	loadVar $bot~parm8
	loadVar $stardock
	loadVar $backdoor
	loadvar $LIMPET_COST
	loadvar $ARMID_COST
	loadVar $LIMPET_REMOVAL_COST
	loadvar $password
	setVar $grid_limpets 3
	setVar $grid_armids 3
	
	getSectorParameter SECTORS "FIGSEC" $isFigged
	getSectorParameter SECTORS "MINESEC" $isArmided
	getSectorParameter SECTORS "LIMPSEC" $isLimped
	if (($stardock = 0) OR ($stardock = ""))
		send "'{" $switchboard~bot_name "} - Stardock is not defined.  Please define stardock variable in the bot.*"
		halt
	end
	if ($isFigged = "")
		send "'{" $switchboard~bot_name "} - It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		halt
	end
	if ($isArmided = "")
		send "'{" $switchboard~bot_name "} - It appears no armid data is available.  Run an armid grid checker that uses the sector parameter MINESEC. (Try armids command)*"
		halt
	end
	if ($isLimped = "")
		send "'{" $switchboard~bot_name "} - It appears no limpet data is available.  Run a limpet grid checker that uses the sector parameter LIMPSEC. (Try limps command)*"
		halt
	end

	gosub :player~quikstats
	if ($player~current_prompt <> "Citadel")
		send "'{" $switchboard~bot_name "} - Must must start mine sweeper from citadel prompt.*"
		halt
	end

	gosub :getInfo
	setVar $homesector $player~current_sector
    	
	killalltriggers	
	goSub :checkAvoidedSectors
	send "q"
	gosub :planet~getplanetinfo	
	send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*c"
	
	gosub :checkShip
	while (TRUE)
		gosub :player~quikstats
		if (($player~limpets < $grid_limpets) OR ($player~armids < $grid_armids))
			if ($refurb)
				gosub :attemptRefurb
			else
				send "'{" $switchboard~bot_name "} -  Need to buy more mines before this script can continue.*"
				halt
			end
		end
		gosub :findNextTarget
		gosub :clearSector
	end
	halt
:checkShip
	killAllTriggers 
	send "c;q"
	waitFor "Offensive Odds:"
	getWordPos CURRENTLINE $pos "Offensive"
	cutText CURRENTLINE $oddline $pos 99
	getText $oddline $offodd "Odds:" ":1"
	stripText $offodd " "
	stripText $offodd "."
	waitFor "Mine Max:"
	getText CURRENTLINE $maxMines "Mine Max:" "B"
	stripText $maxMines " "
	waitFor "Figs Per Attack:"
	getWord CURRENTLINE $figs 5
	multiply $offodd $figs
	divide $offodd 12
	gosub :player~quikstats
return


:attemptRefurb
	setVar $limpetCashNeeded ((($maxMines-$player~limpets)*$LIMPET_COST)+$LIMPET_REMOVAL_COST)
	setVar $armidCashNeeded ((($maxMines-$player~armids)*$ARMID_COST))
	setVar $cashNeeded ($limpetCashNeeded+$armidCashNeeded)
	if ($cashNeeded > $player~credits)
		send "D" 
		waitOn "Citadel treasury contains "
		getWord CURRENTLINE $planet~CITADELCash 4
		stripText $planet~CITADELCash ","
		if ($planet~CITADELCash < $cashNeeded)
			send "'{" & $switchboard~bot_name & "} - Not enough cash for mine refurbs in treasury or on hand.*"	
			halt
		end
		send "t f "&($cashNeeded-$player~credits)&"* "
	end
	# check adj's for Dock.. if present, then we don't need a jump sector.
	setVar $i 1
	setVar $START_SECTOR CURRENT_SECTOR
	setVar $WeAreAdjDock FALSE
	while ($i <= SECTOR.WARPCOUNT[$START_SECTOR])
		setVar $adj_start SECTOR.WARPS[$START_SECTOR][$i]
		if ($adj_start = $stardock)
			setVar $WeAreAdjDock TRUE
		end
		add $i 1
	end

	if (($player~alignment < 1000) AND ($WeAreAdjDock = FALSE))
		setVar $RED_adj 0
		gosub :player~findjumpsector
		if ($RED_adj <> 0)
			send ("'{"&$switchboard~bot_name&"} - Jump Sector Found - Using Sector "&$RED_adj&"**")
		else
			waitfor "Command [TL="
			send "'{" & $switchboard~bot_name & "} - Cannot Find Jump Sector Adjacent Dock**"
			halt
		end
	end

	if ($player~alignment >= 1000)
		if ($WeAreAdjDock)
			send "^F" & $stardock & "*" & $START_SECTOR & "*Q/ "
		else
			send "^F" & $START_SECTOR & "*" & $stardock & "*F" & $stardock & "*" & $START_SECTOR & "*Q/ "
		end
	else
		if ($WeAreAdjDock)
			send "^F" & $stardock & "*" & $START_SECTOR & "*Q/ "
		else
			send "^F" & $START_SECTOR & "*" & $RED_adj & "*F" & $stardock & "*" & $START_SECTOR & "*Q/ "
		end
	end
	setTextLineTrigger noJoy :noJoy "*** Error - No route within"
	setTextTrigger cont :cont "(?="
	pause

	:noJoy
		killAllTriggers
		send "'{" $switchboard~bot_name "} - Cannot Find Path to StarDock!**"
		halt
	:cont
		killAllTriggers
		setDelayTrigger Latency_Delay		:Latency_Delay 500
		pause

		:Latency_Delay

		Echo "**" & ANSI_14 & "Please Stand By" & ANSI_15 & " - Calculating Distances...**"
		if (($player~alignment >= 1000) OR ($WeAreAdjDock))
			getdistance $dist1 $START_SECTOR $stardock
		else
			getdistance $dist1 $START_SECTOR $RED_adj
		end

		if ($dist1 <= 0)
			send "'{" $switchboard~bot_name "} " & $TagLineB & " - Insufficient Warp Data Plotting Course to Dock**"
			halt
		end

		getdistance $dist2 $stardock $START_SECTOR
		if ($dist2 <= 0)
			send "'{" $switchboard~bot_name "} " & $TagLineB & " - Insufficient Warp Data Plotting Return Course From Dock**"
			halt
		end

		setVar $ore_req (($dist1 + $dist2) * 3)

		if ($player~ore_holds < $ore_req)
			send "'{" $switchboard~bot_name "} - Not Enough ORE In Holds To Make Round Trip**"
			halt
		end

		if ($player~twarp_type = "No")
			send "'{" $switchboard~bot_name "} - Must Have Twarp 1 or 2**"
			halt
		end

		if ($player~unlimitedGame = 0)
			gosub :TurnsRequired
			if ($player~turnsRequired > $player~turns)
				send "'{" $switchboard~bot_name "} - Not Enough Turns. " & ANSI_12 & $player~turnsRequired & ANSI_15 & ", Required**"
				halt
			elseif ($player~turnsRequired <= $player~turns)
				setVar $tmp ($player~turns - $player~turnsRequired)
				if ($tmp <= $bot_turn_limit)
					send "'{" $switchboard~bot_name "} - Proceeding Will Leave Fewer Than " & $bot_turn_limit & " Turns!**"
					halt
				end
			end
		end
	
	send " C R " & $stardock & "*Q "
	setTextLineTrigger itsalive :itsalive "Items     Status  Trading % of max OnBoard"
	setTextLineTrigger nosoupforme :nosoupforme "I have no information about a port in that sector"
	pause
	:nosoupforme
		killAllTriggers
		send "'{" $switchboard~bot_name "} " & $TagLineB & " - StarDock appears to have been Blown Up!**"
		halt
	:itsalive
		killAllTriggers
		waitfor "(?="
		setVar $msg ""
		if (($player~alignment >= 1000) AND ($WeAreAdjDock = FALSE))
			setVar $TwarpTo $stardock
			gosub :DoTwarp
		elseif (($WeAreAdjDock = FALSE) AND ($RED_adj <> 0))
			setVar $TwarpTo $RED_adj
			gosub :DoTwarp
		else
			send " m " & $stardock & "*  *  P  S G Y G Q "
		end
		if ($msg = "")
			waitfor "You leave the Galactic Bank."
		else
			send "'{" $switchboard~bot_name "} - Unknown Problem Detected. Check TA!**"
			halt
		end
		gosub :player~quikstats

		setVar $_Limps "Max"
		setVar $_Mines "Max"
		gosub :DoPurchases
		send "Q Q Q Q Z N M " & $START_SECTOR & "* Y  Y  Y  * L Z" & #8 & $planet~planet & "* p  s  s * * c *"
		gosub :player~quikstats
		if ($player~current_sector = $stardock)
			send "'{" $switchboard~bot_name "} - Twarp Error, Should be Hiding on Dock!**"
			halt
		end
	

return

:checkAvoidedSectors
	setVar $avoidedSectors ""	
	:readAvoidedList
		setTextLineTrigger getLine1 :getAvoids
		send "cxq"
		pause
	:keepCountingAvoids
		killAllTriggers
		setTextLineTrigger getLine :getAvoids
		pause
	:getAvoids
		killAllTriggers
		setVar $workingText CURRENTLINE
		getWordPos $workingText $pos "<Computer deactivated>"
		if ($pos > 0)
			goto :doneAvoids
		end
		getWordPos $workingText $pos "Computer"
		if ($pos > 0)
			goto :keepCountingAvoids
		end
		if (CURRENTLINE = "")
			goto :KeepCountingAvoids
		end
		getWordPos $workingText $pos "<List Avoided Sectors>"
		if ($pos > 0)
			goto :keepCountingAvoids
		end
		getWordPos $workingText $pos "No Sectors are currently being avoided."
		if ($pos > 0)
			goto :doneAvoids
		end
		getWordPos $workingText $pos "Citadel"
		if ($pos > 0)
			goto :keepCountingAvoids
		end
		setVar $workingText $workingText&" +++"
		getWord $workingText $avoid 1
		getWordPos $workingText $pos $avoid
		
		while ($avoid <> "+++")
			setVar $avoidedSectors $avoidedSectors&" "&$avoid&" "
			getLength $avoid $length 
			getLength $workingText $checkLength
			cutText $workingText $workingText ($pos+$length) 9999	
			getWord $workingText $avoid 1
			getWordPos $workingText $pos $avoid
			
		end
		goto :keepCountingAvoids
		
	:doneAvoids
return


:delayTrigger
	setDelayTrigger delayUntilSaveMe :callSaveMe 1000
return

:callSaveMe
	killAllTriggers
	send "*"
	waitFor "(?="
	getWord CURRENTLINE $prompt 1
	if ($prompt = "Citadel")
		echo "**Had to halt script, check ship to see if it is valid.**"
		goto :pauseGridder
	end
	if ($prompt = "Computer") or ($prompt = "Corporate") or ($prompt = "NavPoint")
		send "q"
		waitFor "Command [TL"
	end	
	gosub :player~quikstats
    	setVar $figstodeploy 1
	gosub :deployfigs 
	setVar $savetarget $player~current_sector
	if ($savetarget < 10)
		setVar $savetarget "0000" & $savetarget
	elseif ($savetarget < 100)
		setVar $savetarget "000" & $savetarget
	elseif ($savetarget < 1000)
		setVar $savetarget "00" & $savetarget
	elseif ($savetarget < 10000)
		setVar $savetarget "0" & $savetarget
	end

	send "'" & $savetarget & "=saveme*"
	send "'pickup " & $player~current_sector  & " ::*"


:waitforhelp
    setTextLineTrigger friendlytwarp :friendlytwarp "appears in a brilliant flash of warp energies!"
    setTextLineTrigger friendlyplanet :friendlyplanet "Saveme script activated - Planet "
    setTextLineTrigger towlocked :towlocked "locks a tractor beam on your ship."
    setDelayTrigger timeout :timeout 30000
    pause

    :timeout
        killalltriggers
        send "'30 seconds after save call, script halted.*"
        goto :pauseGridder

    :friendlytwarp
        killalltriggers
        setVar $figstodeploy "ALL"
        gosub :deployfigs
        goto :waitforhelp

    :friendlyplanet
        killalltriggers
        getText CURRENTLINE $planet~planet "Saveme script activated - Planet " " to "
        send "L " & $planet~planet & "* C 'I landed on planet " & $planet~planet & "*"
        goto :pauseGridder

    :towlocked
        killalltriggers
        setVar $figstodeploy 1
        gosub :deployfigs
        send "'Tow locked, get us out of here!*"
        goto :pauseGridder


:deployfigs
    if ($figstodeploy = 0)
        setVar $figstodeploy 1
    end
    if (($player~current_sector  < 11) or ($player~current_sector  = $stardock))
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
        goto :pauseGridder

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



:findNextTarget
	getNearestWarps $nearest $player~current_sector
	setVar $checked ""
	setVar $i 1
	while ($i <= $nearest)
		setVar $focus $nearest[$i]
		setVar $checked $checked&" "&$player~current_sector&" "

		getWordPos $avoidedSectors $pos " "&$focus&" "
		getSectorParameter $focus "FIGSEC" $isFigged
		getSectorParameter $focus "MINESEC" $isArmided
		getSectorParameter $focus "LIMPSEC" $isLimped
		if ((($isLimped <= 0) OR ($isArmided <= 0)) AND ($pos <= 0))
			getDistance $distanceThere $player~current_sector $focus
			getDistance $distanceBack $focus $player~current_sector
			if ($distanceThere < 0)
				send "^f"&$player~current_sector&"*"&$focus&"*q"
				waitOn "ENDINTERROG"
				getDistance $distanceThere $player~current_sector $focus
			end
			if ($distanceBack < 0)
				send "^f"&$focus&"*"&$player~current_sector&"*q"
				waitOn "ENDINTERROG"
				getDistance $distanceBack $focus $player~current_sector
			end
			if ($distanceThere > 20)
				send "'{" $switchboard~bot_name "} - Next fighter is over 20 hops away, stopping mine sweeper.*"
				halt
			end
			killAllTriggers
			send "p "&$focus&"*y"
			setTextLineTrigger pwarpNoShip1 :pwarpNoShip1 "You do not have any fighters in Sector "
			setTextLineTrigger pwarpYesShip1 :pwarpYesShip1 " Planetary TransWarp Drive Engaged! "
			setTextLineTrigger pwarpNoFuel1 :pwarpNoFuel1 "You do not have enough Fuel Ore on this planet to make the jump."
			setTextLineTrigger pwarpYesShip2 :pwarpYesShip1 "You are already in that sector!"
			pause
			:pwarpNoFuel1
				killalltriggers
				send "'{" $switchboard~bot_name "} - Not enough fuel on planet "&$planet~planet&". Stopping mine sweeper.*"
				halt
			:pwarpYesShip1
				killAllTriggers
				setVar $avoidedSectors $avoidedSectors&" "&$focus&" "
				gosub :player~quikstats
				return 
			:pwarpNoShip1
				killAllTriggers	
		end
		add $i 1
	end	
	send "'{" $switchboard~bot_name "} - All sectors possible swept. Halting mine sweeper.*"
	gosub :goHome
return

# ============================== QUICKSTATS ==============================
:player~quikstats
    	setVar $player~current_prompt 		"Undefined"
	killtrigger noprompt
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
		getWord CURRENTLINE $player~current_prompt 1
		stripText $player~current_prompt #145
		stripText $player~current_prompt #8
		#getWord currentansiline $checkPrompt 1
		#getWord currentline $tempPrompt 1
		#getWordPos $checkPrompt $pos "[35m"
		#if ($pos > 0)
		#	setVar $player~current_prompt $tempPrompt
		#end
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

		setVar $current_word 0
		while ($wordy <> "@@@")
			if ($wordy = "Sect")
				getWord $stats $player~current_sector   	($current_word + 1)
			elseif ($wordy = "Turns")
				getWord $stats $player~turns  			($current_word + 1)
			elseif ($wordy = "Creds")
				getWord $stats $player~credits  		($current_word + 1)
			elseif ($wordy = "Figs")
				getWord $stats $player~fighters   		($current_word + 1)
			elseif ($wordy = "Shlds")
				getWord $stats $player~shields  		($current_word + 1)
			elseif ($wordy = "Hlds")
				getWord $stats $player~total_holds   		($current_word + 1)
			elseif ($wordy = "Ore")
				getWord $stats $player~ore_holds    		($current_word + 1)
			elseif ($wordy = "Org")
				getWord $stats $player~organic_holds    	($current_word + 1)
			elseif ($wordy = "Equ")
				getWord $stats $player~equipment_holds    	($current_word + 1)
			elseif ($wordy = "Col")
				getWord $stats $player~colonist_holds    	($current_word + 1)
			elseif ($wordy = "Phot")
				getWord $stats $player~photons   		($current_word + 1)
			elseif ($wordy = "Armd")
				getWord $stats $player~armids   		($current_word + 1)
			elseif ($wordy = "Lmpt")
				getWord $stats $player~limpets   		($current_word + 1)
			elseif ($wordy = "GTorp")
				getWord $stats $player~genesis  		($current_word + 1)
			elseif ($wordy = "TWarp")
				getWord $stats $player~twarp_type  		($current_word + 1)
			elseif ($wordy = "Clks")
				getWord $stats $player~cloaks   		($current_word + 1)
			elseif ($wordy = "Beacns")
				getWord $stats $player~beacons 		($current_word + 1)
			elseif ($wordy = "AtmDt")
				getWord $stats $player~atomic  		($current_word + 1)
			elseif ($wordy = "Corbo")
				getWord $stats $player~corbo   		($current_word + 1)
			elseif ($wordy = "EPrb")
				getWord $stats $player~eprobes   		($current_word + 1)
			elseif ($wordy = "MDis")
				getWord $stats $player~mine_disruptors   	($current_word + 1)
			elseif ($wordy = "PsPrb")
				getWord $stats $player~psychic_probe  		($current_word + 1)
			elseif ($wordy = "PlScn")
				getWord $stats $player~planet_scanner  	($current_word + 1)
			elseif ($wordy = "LRS")
				getWord $stats $player~scan_type    		($current_word + 1)
			elseif ($wordy = "Aln")
				getWord $stats $player~alignment    		($current_word + 1)
			elseif ($wordy = "Exp")
				getWord $stats $player~experience    		($current_word + 1)
			elseif ($wordy = "Corp")
				getWord $stats $player~corp   			($current_word + 1)
			elseif ($wordy = "Ship")
				getWord $stats $player~ship_number   		($current_word + 1)
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

:clearSector
	setVar $beforeSector $player~current_sector
	setVar $beforeLimpets $player~limpets
	setVar $beforeArmids  $player~armids
	setVar $placedLimpet FALSE
	setVar $placedArmid FALSE
	send "q q ** "
	waitOn "Warps to Sector(s) :"
	setVar $limpetOwner SECTOR.LIMPETS.OWNER[$player~current_sector]
	setVar $armidOwner SECTOR.MINES.OWNER[$player~current_sector]
	gosub :deployEquipment
	while (($placedLimpet = FALSE) OR ($placedArmid = FALSE))
		gosub :attemptClearingMines
	end
	send "l "&$planet~planet&"* m * * * c "
	setVar $limpetedSectors[$player~current_sector] TRUE
	setVar $player~armidsectors[$player~current_sector] TRUE

return

:attemptClearingMines
	setVar $i 0
	while ($i < 10)
		gosub :xenter
		add $i 1
	end
	gosub :deployEquipment
return


:xenter
	send "q y * t* * *" $password "*    *    *       za9999*   z*   "
return

:deployEquipment
	
	send "h  1  z " & $grid_limpets & "*  z c  *  h  2  z " & $grid_armids & "*  z c  *   "
	gosub :player~quikstats
	if ($beforeSector <> $player~current_sector)
		gosub :callSaveMe
	end
	if (($beforeLimpets > $player~limpets) OR ($player~limpets < 3) OR (($limpetOwner = "belong to your Corp") OR (($limpetOwner = "yours"))))
		setVar $placedLimpet TRUE
	end
	if (($beforeArmids > $player~armids) OR ($player~armids < 3) OR (($armidOwner = "belong to your Corp") OR (($armidOwner = "yours"))))
		setVar $placedArmid TRUE
	end
	
return

:DoTwarp
	setVar $msg ""
	if ($TwarpTo > 0)
		send "q q mz" & $TwarpTo " * "
		setTextTrigger there        :adj_warp "You are already in that sector!"
		setTextLineTrigger adj_warp :adj_warp "Sector  : " & $TwarpTo & " "
		setTextTrigger locking      :locking "Do you want to engage the TransWarp drive?"
		setTextTrigger igd          :twarpIgd "An Interdictor Generator in this sector holds you fast!"
		setTextTrigger noturns      :twarpPhotoned "Your ship was hit by a Photon and has been disabled"
		setTextTrigger noroute      :twarpNoRoute "Do you really want to warp there? (Y/N)"
		pause
		:adj_warp
			killAllTriggers
			send "z*"
			goto :twarp_adj
		:locking
			killAllTriggers
			send "y"
			setTextLineTrigger twarp_lock 		:twarp_lock "TransWarp Locked"
			setTextLineTrigger no_twrp_lock 	:no_twarp_lock "No locating beam found"
			setTextLineTrigger twarp_adj 		:twarp_adj "<Set NavPoint>"
			setTextLineTrigger no_fuel 			:twarpNoFuel "You do not have enough Fuel Ore"
			pause
		:twarpNoFuel
			killAllTriggers
			setVar $msg "Not enough fuel for T-warp."
			goto :twarpDone

		:twarp_adj
			killAllTriggers
			send " * p s"
			goto :twarpDone

		:twarpNoRoute
			killAllTriggers
			send "n* z* "
			setVar $msg "No route available!"
			goto :twarpDone

		:no_twarp_lock
			killAllTriggers
			send "n* z* "
			setVar $msg "No fighter Deployed, cannot Twarp"
			goto :twarpDone

		:twarpIgd
			killAllTriggers
			setVar $msg "My ship is being held by Interdictor!"
			goto :twarpDone

		:twarpPhotoned
			killAllTriggers
			setVar $msg "I have been photoned and can not T-warp!"
			goto :twarpDone

		:twarp_lock
			KillAlltriggers
			if ($player~alignment >= 1000)
				send "y * * p s g y g q "
			else
				send "y  *  *  m " & $STARDOCK & " *  *  p s g y g q "
			end
		:twarpDone
			if ($msg <> "")
				send "'{" $switchboard~bot_name "} Twarp Error - " & $msg & "**"
			end
	end
	return


# ============================  START PLAYER INFO SUBROUTINE  =================
:getInfo
	setVar $player~photons 0
	setVar $player~scan_type "None"
	setVar $player~twarp_type 0
	setVar $player~corpstring "[0]"
	send "I"
	waitfor "<Info>"
	:waitForInfo
		setTextLineTrigger getTraderName :getTraderName "Trader Name    :"
        	setTextLineTrigger getExpAndAlign :getExpAndAlign "Rank and Exp"
        	setTextLineTrigger getCorp :getCorp "Corp           #"
        	setTextLineTrigger getShipType :getShipType "Ship Info      :"
        	setTextLineTrigger getTPW :getTPW "Turns to Warp  :"
        	setTextLineTrigger getSect :getSect "Current Sector :"
        	setTextLineTrigger getTurns :getTurns "Turns left"
        	setTextLineTrigger getHolds :getHolds "Total Holds"
        	setTextLineTrigger getFighters :getFighters "Fighters       :"
        	setTextLineTrigger getShields :getShields "Shield points  :"
        	setTextLineTrigger getPhotons :getPhotons "Photon Missiles:"
        	setTextLineTrigger getScanType :getScanType "LongRange Scan :"
        	setTextLineTrigger getTwarpType1 :getTwarpType1 "  (Type 1 Jump):"
        	setTextLineTrigger getTwarpType2 :getTwarpType2 "  (Type 2 Jump):"
        	setTextLineTrigger getCredits :getCredits "Credits"
        	setTextTrigger getInfoDone :getInfoDone "Command [TL="
        	setTextTrigger getInfoDone2 :getInfoDone "Citadel command"
        	pause
	:getTraderName
	        setVar $player~trader_name CURRENTLINE
	        stripText $player~trader_name "Trader Name    : "
	        stripText $player~trader_name "3rd Class "
	        stripText $player~trader_name "2nd Class "
	        stripText $player~trader_name "1st Class "
	        stripText $player~trader_name "Nuisance "
	        stripText $player~trader_name "Menace "
	        stripText $player~trader_name "Smuggler Savant "
	        stripText $player~trader_name "Smuggler "
	        stripText $player~trader_name "Robber "
	        stripText $player~trader_name "Private "
	        stripText $player~trader_name "Lance Corporal "
	        stripText $player~trader_name "Corporal "
	        stripText $player~trader_name "Staff Sergeant "
	        stripText $player~trader_name "Gunnery Sergeant "
	        stripText $player~trader_name "1st Sergeant "
	        stripText $player~trader_name "Sergeant Major "
	        stripText $player~trader_name "Sergeant "
	        stripText $player~trader_name "Chief Warrant Officer "
	        stripText $player~trader_name "Warrant Officer "
	        stripText $player~trader_name "Terrorist "
	        stripText $player~trader_name "Infamous Pirate "
	        stripText $player~trader_name "Notorious Pirate "
	        stripText $player~trader_name "Dread Pirate "
	        stripText $player~trader_name "Pirate "
	        stripText $player~trader_name "Galactic Scourge "
	        stripText $player~trader_name "Enemy of the State "
	        stripText $player~trader_name "Enemy of the People "
	        stripText $player~trader_name "Enemy of Humankind "
	        stripText $player~trader_name "Heinous Overlord "
	        stripText $player~trader_name "Prime Evil "
	        stripText $player~trader_name "Ensign "
	        stripText $player~trader_name "Lieutenant J.G. "
	        stripText $player~trader_name "Lieutenant Commander "
	        stripText $player~trader_name "Lieutenant "
	        stripText $player~trader_name "Commander "
	        stripText $player~trader_name "Captain "
	        stripText $player~trader_name "Commodore "
	        stripText $player~trader_name "Rear Admiral "
	        stripText $player~trader_name "Vice Admiral "
	        stripText $player~trader_name "Fleet Admiral "
	        stripText $player~trader_name "Admiral "
	        stripText $player~trader_name "Civilian "
	        stripText $player~trader_name "Annoyance "
		pause
	:getExpAndAlign
        	getWord CURRENTLINE $player~experience 5
        	getWord CURRENTLINE $player~alignment 7
        	stripText $player~experience ","
        	stripText $player~alignment ","
        	stripText $player~alignment "Alignment="
        	pause
	:getCorp
        	getWord CURRENTLINE $player~corp 3
	        stripText $player~corp ","
	        setVar $player~corpstring "[" & $player~corp & "]"
	        pause
	:getShipType
	        getWordPos CURRENTLINE $shiptypeend "Ported="
	        subtract $shiptypeend 18
	        cutText CURRENTLINE $SHIP_TYPE 18 $shiptypeend
	        pause
	:getTPW
	        getWord CURRENTLINE $player~turns_PER_WARP 5
	        pause
	:getSect
	        getWord CURRENTLINE $player~current_sector 4
	        pause
	:getTurns
	        getWord CURRENTLINE $player~turns 4
	        if ($player~turns = "Unlimited")
	            setVar $player~turns 65000
		    setVar $player~unlimitedGame TRUE
	        end
		saveVar $player~unlimitedGame
	        pause
	:getHolds
	        setVar $line CURRENTLINE
	        getWord $line $player~total_holds 4
	        getWordPos $line $textpos "Ore="
	        if ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $player~ore_holds 1
	            stripText $player~ore_holds "Ore="
	        else
	            setVar $player~ore_holds 0
	        end
	        getWordPos $line $textpos "Organics="
	        if ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $player~organic_holds 1
	            stripText $player~organic_holds "Organics="
	        else
	            setVar $player~organic_holds 0
	        end
	        getWordPos $line $textpos "Equipment="
	        if ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $player~equipment_holds 1
	            stripText $player~equipment_holds "Equipment="
	        else
	            setVar $player~equipment_holds 0
	        end
		getWordPos $line $textpos "Colonists="
		if ($textpos <> 0)
			cutText CURRENTLINE $temp $textpos 100
			getWord $temp $player~colonist_holds 1
        		stripText $player~colonist_holds "Colonists="
        	else
        		setVar $player~colonist_holds 0
        	end
	        getWordPos $line $textpos "Empty="
	        if ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $EMPTY_HOLDS 1
	            stripText $EMPTY_HOLDS "Empty="
	        else
	            setVar $EMPTY_HOLDS 0
	        end
	        pause
	:getFighters
	        getWord CURRENTLINE $player~fighters 3
	        stripText $player~fighters ","
	        pause
	:getShields
	        getWord CURRENTLINE $player~shields 4
	        stripText $player~shields ","
	        pause
	:getPhotons
	        getWord CURRENTLINE $player~photons 3
	        pause
	:getScanType	
	        getWord CURRENTLINE $player~scan_type 4
	        pause
	:getTwarpType1
	        getWord CURRENTLINE $TWARP_1_RANGE 4
	        setVar $player~twarp_type 1
	        pause
	:getTwarpType2
	        getWord CURRENTLINE $TWARP_2_RANGE 4
	        setVar $player~twarp_type 2
	        pause
	:getCredits
	        getWord CURRENTLINE $player~credits 3
	        stripText $player~credits ","
	        pause
	:getInfoDone
	        killtrigger getInfoDone
	        killtrigger getInfoDone2
		killtrigger getTraderName
        	killtrigger getExpAndAlign
        	killtrigger getCorp
        	killtrigger getShipType
        	killtrigger getTPW
        	killtrigger getSect
        	killtrigger getTurns
        	killtrigger getHolds
        	killtrigger getFighters
        	killtrigger getShields
        	killtrigger getPhotons
        	killtrigger getScanType
        	killtrigger getTwarpType1
        	killtrigger getTwarpType2
        	killtrigger getCredits
        	
return
# ==============================  END PLAYER INFO SUBROUTINE  =================

:pauseGridder
	killAllTriggers
	echo ANSI_6 "*[" ANSI_14 "M()M Limpet Gridder Options" ANSI_6 "]*" ANSI_7
	echo ANSI_6 "  [" ANSI_14 "-" ANSI_6 "]" ANSI_15 " Change Gridder Settings*"
	echo ANSI_6 "  [" ANSI_14 "+" ANSI_6 "]" ANSI_15 " Continue Gridding*"
	echo ANSI_6 "[" ANSI_14 "M()M Limpet Gridder paused..." ANSI_6 "]*" ANSI_7
	setTextOutTrigger pausegridder :restartingPause "+"
	setTextOutTrigger pausegridder2 :start_menu "-"
	pause
	:restartingPause
	killAllTriggers
	send "* "
	waitfor "(?="
	getWord CURRENTLINE $location 1
	if ($location = "Citadel")
		echo ANSI_6 "*[" ANSI_14 "M()M Unlimited Gridder restarted" ANSI_6 "]*" ANSI_7
		goto :restart
	else
		echo ANSI_6 "*[" ANSI_14 "M()M Unlimited Gridder not at citadel prompt, cannot restart" ANSI_6 "]*" ANSI_7
		goto :pauseGridder
	end


# ==============================  START PLANET INFO SUBROUTINE  =================
:planet~getplanetinfo
	send "*"
	setTextLineTrigger planetInfo :planetInfo "Planet #"
	pause

	:planetinfo
		setVar $planet~CITADEL 0
		setVar $planet~SECTOR_CANNON 0
		setVar $planet~ATMOSPHERE_CANNON 0
		setVar $planet~CITADEL_CREDITS 0
		getWord CURRENTLINE $planet~planet 2
		stripText $planet~planet "#"
#		send "'{" $switchboard~bot_name "} - Looking for Planet # " & $planet~planet & "*"
#		HALT
		getWord CURRENTLINE $player~current_sector 5
		stripText $player~current_sector ":"
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
		getWord CURRENTLINE $planet~planet_FUEL 6
		getWord CURRENTLINE $planet~planet_FUEL_MAX 8
		stripText $planet~planet_FUEL ","
		stripText $planet~planet_FUEL_MAX ","
		pause

        :orgstart
		getWord CURRENTLINE $planet~planet_ORGANICS 5
		getWord CURRENTLINE $planet~planet_ORGANICS_MAX 7
		stripText $planet~planet_ORGANICS ","
		stripText $planet~planet_ORGANICS_MAX ","
		pause

        :equipstart
		getWord CURRENTLINE $planet~planet_EQUIPMENT 5
		getWord CURRENTLINE $planet~planet_EQUIPMENT_MAX 7
		stripText $planet~planet_EQUIPMENT ","
		stripText $planet~planet_EQUIPMENT_MAX ","
		pause

        :figstart
		getWord CURRENTLINE $planet~planet_FIGHTERS 5
		getWord CURRENTLINE $planet~planet_FIGHTERS_MAX 7
		stripText $planet~planet_FIGHTERS ","
		stripText $planet~planet_FIGHTERS_MAX ","
		pause

        :citadelstart
		getWord CURRENTLINE $planet~CITADEL 5
		getWord CURRENTLINE $planet~CITADEL_CREDITS 9
		striptext $planet~CITADEL_CREDITS ","
		pause

	:cannonstart
		getWord CURRENTLINE $planet~ATMOSPHERE_CANNON 5
		getWord CURRENTLINE $planet~SECTOR_CANNON 6
		stripText $planet~SECTOR_CANNON "SectLvl="
		striptext $planet~SECTOR_CANNON "%"
		stripText $planet~ATMOSPHERE_CANNON "AtmosLvl="
		striptext $planet~ATMOSPHERE_CANNON "%"
		striptext $planet~ATMOSPHERE_CANNON ","
		pause
	:planetInfoDone
		killtrigger citadelstart
		killtrigger cannon

return
# ==============================  END PLANET INFO SUBROUTINE  =================


:FindJumpSector
	setVar $i 1
	setVar $RED_adj 0

	while (SECTOR.WARPSIN[$stardock][$i] > 0)
		setVar $RED_adj SECTOR.WARPSIN[$stardock][$i]
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
		send " N "

		goto :SectorLocked

		:TwarpBlind
		killAllTriggers
		send " N "

		:TryingNextAdj
    	add $i 1
	end

	:NoAdjsFound
		setVar $RED_adj 0
		return

	:SectorLocked
		return


:TurnsRequired
	send "i"
	setTextLineTrigger TurnsRequired_TPW	:TurnsRequired_TPW "Turns to Warp  : "
	pause

	:TurnsRequired_TPW
	killAllTriggers
	getWord CURRENTLINE $player~turnsRequired_TPW 5

	if ($RED_adj > 0)
		# twarp to jmp sector, then into SD sect, then twarp home
		setVar $player~turnsRequired_temp ($player~turnsRequired_TPW * 3)
		if ($_Tow > 0)
			# 2 Turns for exporting into other ship and back again
			add $player~turnsRequired_temp 2
			# 3 Turns for initial Port then x into other ship, port & shop, then x and report
			#   b4 heading home
			add $player~turnsRequired_temp 3
		else
			add $player~turnsRequired_temp 1
		end
	else
		setVar $player~turnsRequired_temp ($player~turnsRequired_TPW * 2)
		# 1 Turn to port at dock
		add $player~turnsRequired_temp 1
	end

	setVar $player~turnsRequired $player~turnsRequired_temp
	return


:DoPurchases
	if ($ShipData_Valid = 0)
		gosub :ParseShipData
	end
	send "h "
	waitfor "<Hardware Emporium>"
	#=============================================== PURCHASE ATOMICS
	if ($_Atomics <> "")
		send "a "
		waitfor "How many Atomic Detonators do you want"
		if ($_Atomics = "Max")
			getText CURRENTLINE $buy "(Max" ")"
			send $buy & "* "
		else
			send $_Atomics & "* "
		end
		waitfor "<Hardware Emporium>"
	end
	#=============================================== PURCHASE BEACONS
	if ($_Beacons <> "")
		send "b "
		waitfor "How many Beacons do you want"
		if ($_Beacons = "Max")
			getText CURRENTLINE $buy "(Max" ")"
			send $buy & "* "
		else
			send $_Beacons & "* "
		end
		waitfor "<Hardware Emporium>"
	end
	#=============================================== PURCHASE CORBO
	if ($_Corbo <> "")
		send "C "
		waitfor "How many Corbomite Transducers do you want"
		if ($_Corbo = "Max")
			getText CURRENTLINE $buy "(Max" ")"
			send $buy & "* "
		else
			send $_Corbo & "* "
		end
		waitfor "<Hardware Emporium>"
	end
	#=============================================== PURCHASE CLOAKS
	if ($_Cloak <> "")
		send "D "
		waitfor "How many Cloaking units do you want"
		if ($_Cloak = "Max")
			getText CURRENTLINE $buy "(Max" ")"
		else
			setVar $buy $_Cloak
		end
		send $buy & "* "
		waitfor "<Hardware Emporium>"
	end
	#=============================================== PURCHASE PROBES
	if ($_Probe  <> "")
		send "E "
		waitfor "How many Probes do you want"
		if ($_Probe  = "Max")
			getText CURRENTLINE $buy "(Max" ")"
			send $buy & "* "
		else
			send $_Probe & "* "
		end
		waitfor "<Hardware Emporium>"
	end
	#=============================================== PURCHASE PSCAN
	if ($_PScan  <> "")
		send "F "
		setTextTrigger canpscan		:canpscan "I can let you have one for"
		setTextTrigger cantpscan	:cantpscan "<Hardware Emporium> So what are you looking for"
		pause
		:canpscan
			killTrigger canpscan
			send "Y"
			pause
		:cantpscan
			killAllTriggers

	end
	#=============================================== PURCHASE LIMPS
	if ($_Limps  <> "")
		send "L "
		waitfor "How many mines do you want"
		if ($_Limps  = "Max")
			getText CURRENTLINE $buy "(Max" ")"
			send $buy & "* "
		else
			send $buy $_Limps & "* "
		end
		waitfor "<Hardware Emporium>"
	end
	#=============================================== PURCHASE ARMIDS
	if ($_Mines  <> "")
		send "M "
		setVar $buy 0
		waitfor "How many mines do you"
		if ($_Mines  = "Max")
			getText CURRENTLINE $buy "(Max" ")"
			send $buy & "* "
		else
			send $_Mines & "* "
		end
		waitfor "<Hardware Emporium>"
	end
	#=============================================== PURCHASE PHOTONS
	if ($_Photon  <> "")
		setTextTrigger canhouse :canhouse "How many Photon Missiles do you want"
		setTextTrigger canthouse :canthouse "<Hardware Emporium> So what are you looking for"
		send "P "
		pause
		:canhouse
			killAllTriggers
			if ($_Photon  = "Max")
				getText CURRENTLINE $buy "(Max" ")"
				send $buy & "* "
			else
				send $_Photon & "* "
			end
			waitfor "<Hardware Emporium>"
		:canthouse
			killAllTriggers
	end
	#=============================================== PURCHASE LRSCAN
	if ($_LRScan  <> "")
		setTextTrigger CanBuyLRScan		:CanBuyLRScan "Which would you like?"
		setTextTrigger CantBuyLRScan	:CantBuyLRScan "<Hardware Emporium> So what are you looking for"
		send "R "
		pause
		:CanBuyLRScan
			killAllTriggers
			send "h"
			waitfor "<Hardware Emporium>"
		:CantBuyLRScan
			killAllTriggers
	end
	#=============================================== PURCHASE DISRUPTORS
	if ($_Disrupt  <> "")
		send "S "
		waitfor "How many Mine Disruptors do you want"
		if ($_Disrupt  = "Max")
			getText CURRENTLINE $buy "(Max" ")"
			send $buy & "* "
		else
			send $_Disrupt & "* "
		end
		waitfor "<Hardware Emporium>"
	end
	#=============================================== PURCHASE GEN TORPS
	if ($_GenTorp  <> "")
		send "T "
		waitfor "How many Genesis Torpedoes do you want"
		if ($_GenTorp  = "Max")
			getText CURRENTLINE $buy "(Max" ")"
		else
			setVar $buy $_GenTorp
		end
		send $buy & "* "
		waitfor "<Hardware Emporium>"
	end
	#=============================================== PURCHASE TWARP DRIVE
	if ($_T2Twarp  <> "")
		send "W "
		setTextTrigger canTwarp :canTwarp "Which would you like? (1/2/U/Quit)"
		setTextTrigger cantTwarp :cantTwarp "<Hardware Emporium> So what are you looking for"
		pause
		:canTwarp
			killTrigger canTwarp
			if ($player~twarp_type = 1)
				send "U "
			else
				send "2 "
			end
			pause
		:cantTwarp
			killAllTriggers
	end
	#=============================================== SHIP YARD
	if (($_Holds <> "") OR ($_Figs <> "") OR ($_Shields <> ""))
		send "q s p "
		waitfor "Which item do you wish to buy?"
		#=============================================== SHIP YARD
		if ($_Holds  = "Max")
			send "?"
			waitfor "A  Cargo holds     : "
			getWord CURRENTLINE $_Holds 10
			isNumber $tst $_Holds
			if ($tst <> 0)
				send "A " & $_Holds & "* y "
			end
		elseif ($_Holds <> "")
			send "A "
			waitfor "How many Cargo Holds do you want installed?"
			send $_Holds & "* y "
		end
 		if ($_Figs = "Max")
			send "B "
			waitfor "How many K-3A fighters do you want to buy"
			getWord CURRENTLINE $_Figs 11
			stripText $_Figs ")"
			send $_Figs & "* "
		elseif ($_Figs <> "")
			send "B "
			waitfor "How many K-3A fighters do you want to buy"
			send $_Figs & "* "
		end
		if ($_Shields = "Max")
			send "C "
			waitfor "How many shield armor points do you want to buy"
			getWord CURRENTLINE $_Shields 12
			stripText $_Shields ")"
			send $_Shields & "*"
		elseif ($_Shields <> "")
			send "C "
			waitfor "How many shield armor points do you want to buy"
			send $_Shields & "*"
		end
	end
	return

