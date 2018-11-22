	reqrecording
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
	loadvar $LIMPET_COST
	loadvar $ARMID_COST
	loadVar $LIMPET_REMOVAL_COST
	loadvar $password
	setVar $grid_limpets 1
	setVar $grid_armids 4
	setVar $refurb FALSE
	setVar $LongJumpLimit	5
	setVar $VERSION 	"1.0.5"
	getSectorParameter SECTORS "FIGSEC" $isFigged
	getSectorParameter SECTORS "MINESEC" $isArmided
	getSectorParameter SECTORS "LIMPSEC" $isLimped
	if (($stardock = 0) OR ($stardock = ""))
		send "'{" & $bot_name & "} - Stardock is not defined.  Please define stardock variable in the bot.*"
		halt
	end
	if ($isFigged = "")
		send "'{" & $bot_name & "} - It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		halt
	end
	if ($isArmided = "")
		send "'{" & $bot_name & "} - It appears no armid data is available.  Run an armid grid checker that uses the sector parameter MINESEC. (Try armids command)*"
		halt
	end
	if ($isLimped = "")
		send "'{" & $bot_name & "} - It appears no limpet data is available.  Run a limpet grid checker that uses the sector parameter LIMPSEC. (Try limps command)*"
		halt
	end

	gosub :quikstats
	if ($current_prompt <> "Citadel")
		send "'{" & $bot_name & "} - Must must start mine sweeper from citadel prompt.*"
		halt
	end

	if ($photons <> 0)
		send "'{" & $bot_name & "} - Cannot Have Fotons!*"
		halt
	end

	setVar $TEMP (" " & $user_command_line & " ")
	lowercase $TEMP

	getWordPos $TEMP $pos " furb "
	if ($pos = 0)
		setVar $REFURB FALSE
	else
		setVar $REFURB TRUE
	end

	getWordPos $TEMP $pos " disr "
	if ($pos = 0)
		setVar $DISR FALSE
	else
		setVar $DISR TRUE
	end

	getWordPos $TEMP $pos " fast "
	if ($pos = 0)
		setVar $FAST FALSE
	else
		setVar $FAST TRUE
	end

	getWordPos $TEMP $pos " nonsafe "
	if ($pos = 0)
		setVar $NONSAFE FALSE
	else
		if ($FAST)
			setVar $NONSAFE FALSE
		else
			setVar $NONSAFE TRUE
		end
	end

	getWordPos $TEMP $pos " border "
	if ($pos = 0)
		setVar $BORDER FALSE
	else
		setVar $BORDER TRUE
	end

	getWordPos $TEMP $pos " l:"
	if ($pos = 0)
		setVar $grid_limpets 1
	else
		getText $TEMP $grid_limpets " l:" " "
		isNumber $tst $grid_limpets
		if ($tst = 0)
			setVar $grid_limpets 1
		else
			if ($grid_limpets > 250)
				setVar $grid_limpets 250
			elseif ($grid_limpets < 1)
				setVar $grid_limpets 1
			end
		end
	end

	getWordPos $TEMP $pos " a:"
	if ($pos = 0)
		setVar $grid_armids 0
	else
		getText $TEMP $grid_armids " a:" " "
		isNumber $tst $grid_armids
		if ($tst = 0)
			setVar $grid_armids 0
		else
			if ($grid_armids > 250)
				setVar $grid_armids 250
			elseif ($grid_armids < 0)
				setVar $grid_armids 0
			end
		end
	end

	gosub :getInfo
	setVar $homesector $CURRENT_SECTOR

	killalltriggers
	goSub :checkAvoidedSectors
	send "q"
	gosub :getPlanetInfo

	if ($grid_limpets = 0) AND ($grid_armids = 0)
		send "'{" $bot_name "} - Nothing To Do!*"
		halt
	end

	if (($ORGANIC_HOLDS + $EQUIPMENT_HOLDS + $COLONIST_HOLDS) <> 0)
		setVar $MAC ""
		if ($ORGANIC_HOLDS <> 0)
			setVar $MAC ($MAC & " T  N  L 2* ")
		end
		if ($EQUIPMENT_HOLDS <> 0)
			setVar $MAC ($MAC & " T  N  L 3* ")
		end
		if ($COLONIST_HOLDS <> 0)
			setVar $MAC ($MAC & " S  N  L 1* ")
		end
		if ($MAC <> "")
			send $MAC & " t  n  t  1*  m  n t *  c"
			gosub :quikstats
			if (($ORGANIC_HOLDS + $EQUIPMENT_HOLDS + $COLONIST_HOLDS) <> 0)
				send "'{" & $bot_name & "} - Holds Not Empty*"
				halt
			end
		end
	else
		send $MAC & " t  n  t  1*  m  n t *  c"
	end

	gosub :checkShip

	setVar $Temp "{" & $bot_name & "}"
	getLength $TEMP $Len
	setVar $S ""
	setVar $i 1
	while ($i <= $Len)
		setVar $S ($S & " ")
		add $i 1
	end
	send "'*"
	waitfor "Type sub-space message"
	send "{" $bot_name "} - Mind ()ver Matter MineSweeper v"&$VERSION&" Loading*"
	if ($REFURB)
		send $S & " - Furbing Mines/Disruptors*"
	end
	if ($DISR)
		send $S & " - Disrupting Enemy Mines*"
	end
	if ($FAST)
		send $S & " - FAST Sector-Clear Technology!*"
	end
	if ($NONSAFE)
		send $S & " - SAFE Sector-Clear Technology!*"
	end
	if ($BORDER)
		send $S & " - Targeting Hostile Sectors!*"
	else
		send $S & " - Targeting Safe Sectors!*"
	end
	send $S & " - Deploying: " & $grid_armids & " Armids, " & $grid_limpets & " Limpets*"
	send "*"

	while (TRUE)
		gosub :quikstats
		if (($LIMPETS < $grid_limpets) OR ($ARMIDS < $grid_armids) OR (($MINE_DISRUPTORS = 0) AND ($DISR)))
			if ($refurb)
				gosub :attemptRefurb
			else
				send "'{" & $bot_name & "} -  Need to buy more mines before this script can continue.*"
				halt
			end
		end
		gosub :findNextTarget
		gosub :quikstats
		send "  sz*    "
		Waiton "Warps to Sector(s) :"
		setVar $HAZ_Before SECTOR.NAVHAZ[$CURRENT_SECTOR]
		setVar $PLANETS_Before SECTOR.PLANETCOUNT[$CURRENT_SECTOR]
		if (SECTOR.TRADERCOUNT[$CURRENT_SECTOR] <> 0)
			send "'{" & $bot_name & "} -  Trader Is In Sector. Halting!*"
			waiton "Message sent on sub-space channel"
			send "'" & $bot_name & " pwarp " & $homesector & "*"
			waiton "Message sent on sub-space channel"
			halt
		end
		if ($DISR)
			gosub :DisRupt
		end
		gosub :clearSector
		gosub :quikstats
		send "  sz*    "
		Waiton "Warps to Sector(s) :"
		setVar $HAZ_After SECTOR.NAVHAZ[$CURRENT_SECTOR]
		setVar $PLANETS_After SECTOR.PLANETCOUNT[$CURRENT_SECTOR]
		if (SECTOR.TRADERCOUNT[$CURRENT_SECTOR] <> 0)
			send "'{" & $bot_name & "} -  Trader Is In Sector. Halting!*"
			waiton "Message sent on sub-space channel"
			send "'" & $bot_name & " pwarp " & $homesector & "*"
			waiton "Message sent on sub-space channel"
			halt
		end
		if ($HAZ_Before <> $HAZ_After)
			send "'{" & $bot_name & "} -  NavHAZ Changed. Halting!*"
			waiton "Message sent on sub-space channel"
			send "'" & $bot_name & " holo*"
			waiton "Sub-space comm-link terminated"
			send "'" & $bot_name & " pwarp " & $homesector & "*"
			waiton "Message sent on sub-space channel"
			halt
		end
		if ($PLANETS_After <> $PLANETS_Before)
			send "'{" & $bot_name & "} -  New Planet in Sector. Halting!*"
			waiton "Message sent on sub-space channel"
			send "'" & $bot_name & " pwarp " & $homesector & "*"
			waiton "Message sent on sub-space channel"
			halt
		end
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
	gosub :quikstats
return


:attemptRefurb
	setVar $limpetCashNeeded ((($maxMines-$LIMPETS)*$LIMPET_COST)+$LIMPET_REMOVAL_COST)
	setVar $armidCashNeeded ((($maxMines-$ARMIDS)*$ARMID_COST))
	setVar $cashNeeded ($limpetCashNeeded+$armidCashNeeded)
	if ($cashNeeded > $CREDITS)
		send "D"
		waitOn "Citadel treasury contains "
		getWord CURRENTLINE $citadelCash 4
		stripText $citadelCash ","
		if ($citadelCash < $cashNeeded)
			send "'{" & $bot_name & "} - Not enough cash for mine refurbs in treasury or on hand.*"
			halt
		end
		send "t f "&($cashNeeded-$CREDITS)&"* "
	end
	# check adj's for Dock.. if present, then we don't need a jump sector.
	setVar $i 1
	setVar $START_SECTOR $CURRENT_SECTOR
	setVar $WeAreAdjDock FALSE
	while ($i <= SECTOR.WARPCOUNT[$START_SECTOR])
		setVar $adj_start SECTOR.WARPS[$START_SECTOR][$i]
		if ($adj_start = $stardock)
			setVar $WeAreAdjDock TRUE
		end
		add $i 1
	end

	if (($ALIGNMENT < 1000) AND ($WeAreAdjDock = FALSE))
		setVar $RED_adj 0
		gosub :FindJumpSector
		if ($RED_adj <> 0)
			send ("'{"&$bot_name&"} - Jump Sector Found - Using Sector "&$RED_adj&"**")
		else
			waitfor "Command [TL="
			send "'{" & $bot_name & "} - Cannot Find Jump Sector Adjacent Dock**"
			halt
		end
	end

	if ($ALIGNMENT >= 1000)
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
		send "'{" $bot_name "} - Cannot Find Path to StarDock!**"
		halt
	:cont
		killAllTriggers
		setDelayTrigger Latency_Delay		:Latency_Delay 500
		pause

		:Latency_Delay

		Echo "**" & ANSI_14 & "Please Stand By" & ANSI_15 & " - Calculating Distances...**"
		if (($ALIGNMENT >= 1000) OR ($WeAreAdjDock))
			getdistance $dist1 $START_SECTOR $stardock
		else
			getdistance $dist1 $START_SECTOR $RED_adj
		end

		if ($dist1 <= 0)
			send "'{" $bot_name "} " & $TagLineB & " - Insufficient Warp Data Plotting Course to Dock**"
			halt
		end

		getdistance $dist2 $stardock $START_SECTOR
		if ($dist2 <= 0)
			send "'{" $bot_name "} " & $TagLineB & " - Insufficient Warp Data Plotting Return Course From Dock**"
			halt
		end

		setVar $ore_req (($dist1 + $dist2) * 3)

		if ($ORE_HOLDS < $ore_req)
			send "'{" & $bot_name & "} - Not Enough ORE In Holds To Make Round Trip**"
			halt
		end

		if ($TWARP_TYPE = "No")
			send "'{" & $bot_name & "} - Must Have Twarp 1 or 2**"
			halt
		end

		if ($unlimitedGame = 0)
			gosub :TurnsRequired
			if ($TurnsRequired > $TURNS)
				send "'{" & $bot_name & "} - Not Enough Turns. " & ANSI_12 & $TurnsRequired & ANSI_15 & ", Required**"
				halt
			elseif ($TurnsRequired <= $TURNS)
				setVar $tmp ($TURNS - $TurnsRequired)
				if ($tmp <= $bot_turn_limit)
					send "'{" $bot_name "} - Proceeding Will Leave Fewer Than " & $bot_turn_limit & " Turns!**"
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
		send "'{" $bot_name "} " & $TagLineB & " - StarDock appears to have been Blown Up!**"
		halt
	:itsalive
		killAllTriggers
		waitfor "(?="
		setVar $msg ""
		if (($ALIGNMENT >= 1000) AND ($WeAreAdjDock = FALSE))
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
			send "'{" $bot_name "} - Unknown Problem Detected. Check TA!**"
			halt
		end
		gosub :quikstats

		setVar $_Limps "Max"
		setVar $_Mines "Max"
		gosub :DoPurchases
		send "Q Q Q Q Z N M " & $START_SECTOR & "* Y  Y  Y  * L Z" & #8 & $planet & "* p  s  s * * c *"
		gosub :quikstats
		if ($CURRENT_SECTOR = $stardock)
			send "'{" $bot_name "} - Twarp Error, Should be Hiding on Dock!**"
			halt
		end
		send "q tnt1* c "


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
	gosub :quikstats
    	setVar $figstodeploy 1
	gosub :deployfigs 
	setVar $savetarget $CURRENT_SECTOR
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
        goto :pauseGridder

    :friendlytwarp
        killalltriggers
        setVar $figstodeploy "ALL"
        gosub :deployfigs
        goto :waitforhelp

    :friendlyplanet
        killalltriggers
        getText CURRENTLINE $planet "Saveme script activated - Planet " " to "
        send "L " & $planet & "* C 'I landed on planet " & $planet & "*"
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
    if (($CURRENT_SECTOR  < 11) or ($CURRENT_SECTOR  = $stardock))
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

:DisRupt
	if ($MINE_DISRUPTORS = 0)
		return
	end
	setDelayTrigger		Whoa_WuzUp		:Whoa_WuzUp		4000
	setTextLineTrigger	Scan_Complete	:Scan_Complete	"Warps to Sector(s)"
	send (" Q Q S  H* ")
	pause
	:Whoa_WuzUp
		killAllTriggers
		send ("'Unknown Problem Occured, Attempting to reach Command Prompt!*  P D 0* 0* 0* * *** * C  Q  Q  Q  Q  Q  Z  2  2  C  Q  *  Z  *  ***  *  *  ^Q")
		waitfor ": ENDINTERROG"
		gosub :quikstats
		send ("'Unknown Problem Occured, at '"&$CURRENT_PROMPT&"' Prompt!*")
		halt
	:Scan_Complete
		killAllTriggers
		setArray	$ADJ2HiT	6 1
		setVar $idx 1

		while (SECTOR.WARPS[$CURRENT_SECTOR][$idx] > 0)
			setVar $adj SECTOR.WARPS[$CURRENT_SECTOR][$idx]
			if (SECTOR.MINES.QUANTITY[$adj] <> 0)
				if ((SECTOR.MINES.OWNER[$adj] <> "belong to your Corp") AND (SECTOR.MINES.OWNER[$adj] <> "yours"))
					setVar $ADJ2HiT[$idx] $adj
					setVar $ADJ2HiT[$idx][1] SECTOR.MINES.QUANTITY[$adj]
				else
					setVar $ADJ2HiT[$idx][1] 0
				end
			end
        	add $idx 1
		end

	setVar $DisRuptors $MINE_DISRUPTORS
	send " C "
	:Lets_Go_Again
	setVar $idx 1
	setVar $Adj_Hits 0
	while ($idx <= 6)
		if ($ADJ2HiT[$idx][1] <> 0)
			setTextLineTrigger	NoMines		:NoMines	("There were no mines in sector " & $ADJ2HiT[$idx])
			setTextLineTrigger	MinesGone	:MinesGone	("of the mines in sector "&$ADJ2HiT[$idx]&"!")
			setTextLineTrigger	NotAdj		:NotAdj		("That is not an adjacent sector")
			send (" W Y " & $ADJ2HiT[$idx] & "*")
			pause
			:NoMines
				killAllTriggers
				setVar $DisRuptors ($DisRuptors - 1)
				setVar $ADJ2HiT[$idx][1] 0
				goto :Loop_D_Lou
			:NotAdj
				killAllTriggers
				send " Q"
				setVar $ADJ2HiT[$idx][1] 0
				goto :Loop_D_Lou
			:MinesGone
				killAllTriggers
				setVar $Temp CURRENTLINE
				getWordPos $Temp $pos "remain)"
				setVar $DisRuptors ($DisRuptors - 1)
				if ($pos = 0)
            		getWord $Temp $Temp 4
            		isNumber $tst $Temp
            		if ($tst)
						setVar $Total_Mines_Poofed ($Total_Mines_Poofed + $Temp)
					end
					setVar $ADJ2HiT[$idx][1] 0
				else
					getWord $Temp $Temp2 3
					isNumber $tst $Temp2
					if ($tst)
						setVar $Total_Mines_Poofed ($Total_Mines_Poofed + $Temp2)
					end
					getText $Temp $Temp ($ADJ2HiT[$idx] & "! (") " remain)"
					isNumber $tst $Temp
					if ($tst = 0)
						setVar $Temp 0
					end
					setVar $ADJ2HiT[$idx][1] $Temp
					setVar $Adj_Hits ($Adj_Hits + 1)
				end
			:Loop_D_Lou
			if ($DisRuptors < 1)
				setVar $idx 6
			end
		end
    	add $idx 1
	end
	if (($Adj_Hits <> 0) AND ($DisRuptors > 0) AND ($Bursting = 0))
		goto :Lets_Go_Again
	end
	send " Q "
	send (" Q Q Q Z N L Z" & #8 & $Planet & "*  *  J  C  *  * ")
	setTextTrigger		Landed		:Landed		"Citadel command (?"
	setTextLineTrigger	NotLanded	:NotLanded	"Are you sure you want to jettison all cargo"
	pause
	:NotLanded
		killAllTriggers
		send ("'Unknown Problem Occured after StarBurst!*")
		halt
	:Landed
		killAllTriggers
	return


:findNextTarget
	getNearestWarps $nearest $CURRENT_SECTOR
	setVar $checked ""
	setVar $i 1
	while ($i <= $nearest)
		setVar $focus $nearest[$i]
		setVar $checked $checked&" "&$CURRENT_SECTOR&" "

		getWordPos $avoidedSectors $pos " "&$focus&" "
		getSectorParameter $focus "FIGSEC" $isFigged
		getSectorParameter $focus "MINESEC" $isArmided
		getSectorParameter $focus "LIMPSEC" $isLimped
		isNumber $tst $isFigged
		if ($tst = 0)
			setVar $isFigged FALSE
		end
		isNumber $tst $isLimped
		if ($tst = 0)
			setVar $isLimped FALSE
		end
		isNumber $tst $isArmided
		if ($tst = 0)
			setVar $isArmided FALSE
		end

		if ($border = TRUE)
			setVar $p 1
			while (SECTOR.WARPS[$focus][$p] > 0)
				setVar $temp SECTOR.WARPS[$focus][$p]
				getSectorParameter $temp "FIGSEC" $isFigAdjacent
				if ($isFigAdjacent <> TRUE)
					goto :WE_GOT_GAME
				end
				add $p 1
			end
			goto :NEXT_POSS_TARG
		else
			setVar $p 1
			while (SECTOR.WARPS[$focus][$p] > 0)
				setVar $temp SECTOR.WARPS[$focus][$p]
				getSectorParameter $temp "FIGSEC" $isFigAdjacent
				if ($isFigAdjacent <> TRUE)
					goto :NEXT_POSS_TARG
				end
				add $p 1
			end
		end

		:WE_GOT_GAME
		if ((($isLimped <= 0) OR ($isArmided <= 0)) AND ($isFigged > 0) AND ($pos <= 0))
			getDistance $distanceThere $current_sector $focus
			getDistance $distanceBack $focus $current_sector
			if ($distanceThere < 0)
				send "^f"&$current_sector&"*"&$focus&"*q"
				waitOn "ENDINTERROG"
				getDistance $distanceThere $current_sector $focus
			end
			if ($distanceBack < 0)
				send "^f"&$focus&"*"&$current_sector&"*q"
				waitOn "ENDINTERROG"
				getDistance $distanceBack $focus $current_sector
			end
			if (($distanceThere > 30) AND ($LongJumpLimit <> 0))
				send "'{" $bot_name "} - Next fighter is over 30 hops away, stopping mine sweeper.*"
				gosub :goHome
				halt
			else
				subtract $LongJumpLimit 1
			end
			killAllTriggers
			send "p "&$focus&"*y"
			setTextLineTrigger pwarpNoShip1		:pwarpNoShip1 "You do not have any fighters in Sector "
			setTextLineTrigger pwarpYesShip1	:pwarpYesShip1 " Planetary TransWarp Drive Engaged! "
			setTextLineTrigger pwarpNoFuel1		:pwarpNoFuel1 "You do not have enough Fuel Ore on this planet to make the jump."
			setTextLineTrigger pwarpYesShip2	:pwarpYesShip1 "You are already in that sector!"
			pause
			:pwarpNoFuel1
				killalltriggers
				send "'{" $bot_name "} - Not enough fuel on planet "&$planet&". Stopping mine sweeper.*"
				halt
			:pwarpYesShip1
				killAllTriggers
				setVar $avoidedSectors $avoidedSectors&" "&$focus&" "
				gosub :quikstats
				return
			:pwarpNoShip1
				killAllTriggers
		end
		:NEXT_POSS_TARG
		add $i 1
	end
	send "'{" $bot_name "} - All sectors possible swept. Halting mine sweeper.*"
	gosub :goHome
return

:goHome
	gosub :quikstats
	if ($CURRENT_PROMPT = "Citadel")
		send "p" & $homesector & "* y"
		setTextLineTrigger pwarp_lock 		:pwarp_lock 	"Locating beam pinpointed"
		setTextLineTrigger no_pwarp_lock 	:no_pwarp_lock 	"Your own fighters must be"
		setTextLineTrigger already 			:already 		"You are already in that sector!"
		setTextLineTrigger no_ore 			:no_ore 		"You do not have enough Fuel Ore"
		pause
		:no_pwarp_lock
			killAllTriggers
			send "'{" $bot_name "} - No fighter down at that location!*"
			return
		:no_ore
			killAllTriggers
			send "'{" $bot_name "} - Not enough fuel for that pwarp.*"
			return
		:pwarp_lock
			killAllTriggers
			waitOn "Planet is now in sector"
			send "'{" $bot_name "} - Planet returned Home*"
			return
  		:already
			killAllTriggers
			send "'{" $bot_name "} - Planet already in that sector!.*"
			return
	else
		send "'{" $bot_name "} - Cannot Pwarp Home. Wrong Prompt!*"
		halt
	end
	return

# ============================== QUICKSTATS ==============================
:quikstats
    	setVar $CURRENT_PROMPT 		"Undefined"
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
		getWord CURRENTLINE $CURRENT_PROMPT 1
		stripText $CURRENT_PROMPT #145
		stripText $CURRENT_PROMPT #8
		#getWord currentansiline $checkPrompt 1
		#getWord currentline $tempPrompt 1
		#getWordPos $checkPrompt $pos "[35m"
		#if ($pos > 0)
		#	setVar $CURRENT_PROMPT $tempPrompt
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

:clearSector
	setVar  $LAID_ARMID FALSE
	setVar	$LAID_LIMP FALSE
	setVar $beforeSector $CURRENT_SECTOR
	setVar $beforeLimpets $LIMPETS
	setVar $beforeArmids  $ARMIDS
	setVar $placedLimpet FALSE
	setVar $placedArmid FALSE

	send "   sz*    "

	waitOn "Warps to Sector(s) :"
	setVar $limpetOwner SECTOR.LIMPETS.OWNER[$CURRENT_SECTOR]
	setVar $armidOwner SECTOR.MINES.OWNER[$CURRENT_SECTOR]
	if ((($limpetOwner = "belong to your Corp") OR ($limpetOwner = "yours")) AND (($armidOwner = "belong to your Corp") OR ($armidOwner = "yours")))
		setVar $placedLimpet TRUE
		setVar $placedArmid TRUE
	else
		gosub :deployEquipment
	end

	if ($FAST) OR ($NONSAFE)
		while (($placedLimpet = FALSE) OR ($placedArmid = FALSE))
			gosub :attemptClearingMines
		end
		setSectorParameter $CURRENT_SECTOR "MINESEC" TRUE
		setSectorParameter $CURRENT_SECTOR "LIMPSEC" TRUE
	else
		if ($placedArmid)
			setSectorParameter $CURRENT_SECTOR "MINESEC" TRUE
		end
		if ($placedLimpet)
			setSectorParameter $CURRENT_SECTOR "LIMPSEC" TRUE
    	end
	end
	gosub :quikstats
	if ($CURRENT_PROMPT = "Command")
		send "l "&$planet&"* m * * * c "
	end
	return

:xenter
	send "q y * t* * *" $password "*    *    *       za9999*   z*   "
	return

:attemptClearingMines
	killAllTriggers
	setVar $LAID_ARMID FALSE
	setVar $LAID_LIMP FALSE

	if ($FAST)
		setVar $i 0
		send "q  q  q  z   n  *   "
		while ($i <= 3)
			gosub :xenter
			add $i 1
		end
		if ($grid_armids = 0)
			setVar $_ARMIDS_ " "
		else
			setVar $_ARMIDS_ " h 1 z " & $grid_armids & "* z c * "
		end
		if ($grid_limpets = 0)
			setVar $_LIMPS_ " "
		else
			setVar $_LIMPS_ "h 2 z " & $grid_limpets & "* z c * "
		end

		send $_ARMIDS_&$_LIMPS_&" l "&$Planet&"*  c  "
		setTextLineTrigger	LAID_LIMP	:LAID_LIMP	"Limpet mine(s) on board."
		setTextLineTrigger	LAID_ARMID	:LAID_ARMID	"Armid mine(s) on board."
		gosub :quikstats
		waiton "Citadel command"
	else
		send "r y y "
		waiton "==-- Trade Wars 2002 --=="
		waiton "Enter your choice:"
		setTextLineTrigger	LAID_LIMP	:LAID_LIMP	"Limpet mine(s) on board."
		setTextLineTrigger	LAID_ARMID	:LAID_ARMID	"Armid mine(s) on board."
		send "t*   *    *" & PASSWORD & "*    *    *   q  *  *  h 1 z "&$grid_armids&"* z c * h 2 z "&$grid_limpets&"* z c * l "&$Planet&"*  c  "
		waiton "Citadel command"
	end
	if (($LAID_ARMID <> TRUE) AND ($grid_armids > 0)) OR (($LAID_LIMP <> TRUE) AND ($grid_limpets > 0))
		goto :attemptClearingMines
	end
	setVar $placedLimpet TRUE
	setVar $placedArmid TRUE
	return
	:LAID_ARMID
		setVar $LAID_ARMID TRUE
		pause
	:LAID_LIMP
		setVar $LAID_LIMP TRUE
		pause


:deployEquipment
	send "q  q  h  1  z " & $grid_armids & "*  z c  *  h  2  z " & $grid_limpets & "*  z c  *   l " & $planet & "*  c "
	gosub :quikstats
	if ($beforeSector <> $CURRENT_SECTOR)
		gosub :callSaveMe
	end
	if ($CURRENT_PROMPT <> "Citadel")
		Echo "**Unexpected Problem.. Halting**"
		halt
	end
	if (($beforeLimpets > $LIMPETS) OR ($LIMPETS < $grid_limpets) OR (($limpetOwner = "belong to your Corp") OR (($limpetOwner = "yours"))))
		setVar $placedLimpet TRUE
	end
	if (($beforeArmids > $ARMIDS) OR ($ARMIDS < $grid_armids) OR (($armidOwner = "belong to your Corp") OR (($armidOwner = "yours"))))
		setVar $placedArmid TRUE
	end
	return

:DoTwarp
	setVar $msg ""
	if ($TwarpTo > 0)
		send "q q* mz" & $TwarpTo " * "
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
			if ($ALIGNMENT >= 1000)
				send "y * * p s g y g q "
			else
				send "y  *  *  m " & $STARDOCK & " *  *  p s g y g q "
			end
		:twarpDone
			if ($msg <> "")
				send "'{" $bot_name "} Twarp Error - " & $msg & "**"
			end
	end
	return


# ============================  START PLAYER INFO SUBROUTINE  =================
:getInfo
	setVar $PHOTONS 0
	setVar $SCAN_TYPE "None"
	setVar $TWARP_TYPE 0
	setVar $corpstring "[0]"
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
	        setVar $TRADER_NAME CURRENTLINE
	        stripText $TRADER_NAME "Trader Name    : "
	        stripText $TRADER_NAME "3rd Class "
	        stripText $TRADER_NAME "2nd Class "
	        stripText $TRADER_NAME "1st Class "
	        stripText $TRADER_NAME "Nuisance "
	        stripText $TRADER_NAME "Menace "
	        stripText $TRADER_NAME "Smuggler Savant "
	        stripText $TRADER_NAME "Smuggler "
	        stripText $TRADER_NAME "Robber "
	        stripText $TRADER_NAME "Private "
	        stripText $TRADER_NAME "Lance Corporal "
	        stripText $TRADER_NAME "Corporal "
	        stripText $TRADER_NAME "Staff Sergeant "
	        stripText $TRADER_NAME "Gunnery Sergeant "
	        stripText $TRADER_NAME "1st Sergeant "
	        stripText $TRADER_NAME "Sergeant Major "
	        stripText $TRADER_NAME "Sergeant "
	        stripText $TRADER_NAME "Chief Warrant Officer "
	        stripText $TRADER_NAME "Warrant Officer "
	        stripText $TRADER_NAME "Terrorist "
	        stripText $TRADER_NAME "Infamous Pirate "
	        stripText $TRADER_NAME "Notorious Pirate "
	        stripText $TRADER_NAME "Dread Pirate "
	        stripText $TRADER_NAME "Pirate "
	        stripText $TRADER_NAME "Galactic Scourge "
	        stripText $TRADER_NAME "Enemy of the State "
	        stripText $TRADER_NAME "Enemy of the People "
	        stripText $TRADER_NAME "Enemy of Humankind "
	        stripText $TRADER_NAME "Heinous Overlord "
	        stripText $TRADER_NAME "Prime Evil "
	        stripText $TRADER_NAME "Ensign "
	        stripText $TRADER_NAME "Lieutenant J.G. "
	        stripText $TRADER_NAME "Lieutenant Commander "
	        stripText $TRADER_NAME "Lieutenant "
	        stripText $TRADER_NAME "Commander "
	        stripText $TRADER_NAME "Captain "
	        stripText $TRADER_NAME "Commodore "
	        stripText $TRADER_NAME "Rear Admiral "
	        stripText $TRADER_NAME "Vice Admiral "
	        stripText $TRADER_NAME "Fleet Admiral "
	        stripText $TRADER_NAME "Admiral "
	        stripText $TRADER_NAME "Civilian "
	        stripText $TRADER_NAME "Annoyance "
		pause
	:getExpAndAlign
        	getWord CURRENTLINE $EXPERIENCE 5
        	getWord CURRENTLINE $ALIGNMENT 7
        	stripText $EXPERIENCE ","
        	stripText $ALIGNMENT ","
        	stripText $ALIGNMENT "Alignment="
        	pause
	:getCorp
        	getWord CURRENTLINE $CORP 3
	        stripText $CORP ","
	        setVar $corpstring "[" & $CORP & "]"
	        pause
	:getShipType
	        getWordPos CURRENTLINE $shiptypeend "Ported="
	        subtract $shiptypeend 18
	        cutText CURRENTLINE $SHIP_TYPE 18 $shiptypeend
	        pause
	:getTPW
	        getWord CURRENTLINE $TURNS_PER_WARP 5
	        pause
	:getSect
	        getWord CURRENTLINE $CURRENT_SECTOR 4
	        pause
	:getTurns
	        getWord CURRENTLINE $TURNS 4
	        if ($TURNS = "Unlimited")
	            setVar $TURNS 65000
		    setVar $unlimitedGame TRUE
	        end
		saveVar $unlimitedGame
	        pause
	:getHolds
	        setVar $line CURRENTLINE
	        getWord $line $TOTAL_HOLDS 4
	        getWordPos $line $textpos "Ore="
	        if ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $ORE_HOLDS 1
	            stripText $ORE_HOLDS "Ore="
	        else
	            setVar $ORE_HOLDS 0
	        end
	        getWordPos $line $textpos "Organics="
	        if ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $ORGANIC_HOLDS 1
	            stripText $ORGANIC_HOLDS "Organics="
	        else
	            setVar $ORGANIC_HOLDS 0
	        end
	        getWordPos $line $textpos "Equipment="
	        if ($textpos <> 0)
	            cutText CURRENTLINE $temp $textpos 100
	            getWord $temp $EQUIPMENT_HOLDS 1
	            stripText $EQUIPMENT_HOLDS "Equipment="
	        else
	            setVar $EQUIPMENT_HOLDS 0
	        end
		getWordPos $line $textpos "Colonists="
		if ($textpos <> 0)
			cutText CURRENTLINE $temp $textpos 100
			getWord $temp $COLONIST_HOLDS 1
        		stripText $COLONIST_HOLDS "Colonists="
        	else
        		setVar $COLONIST_HOLDS 0
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
	        getWord CURRENTLINE $FIGHTERS 3
	        stripText $FIGHTERS ","
	        pause
	:getShields
	        getWord CURRENTLINE $SHIELDS 4
	        stripText $SHIELDS ","
	        pause
	:getPhotons
	        getWord CURRENTLINE $PHOTONS 3
	        pause
	:getScanType	
	        getWord CURRENTLINE $SCAN_TYPE 4
	        pause
	:getTwarpType1
	        getWord CURRENTLINE $TWARP_1_RANGE 4
	        setVar $twarp_type 1
	        pause
	:getTwarpType2
	        getWord CURRENTLINE $TWARP_2_RANGE 4
	        setVar $twarp_type 2
	        pause
	:getCredits
	        getWord CURRENTLINE $CREDITS 3
	        stripText $CREDITS ","
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
:getPlanetInfo
	send "*"
	setTextLineTrigger planetInfo :planetInfo "Planet #"
	pause

	:planetinfo
		setVar $CITADEL 0
		setVar $SECTOR_CANNON 0
		setVar $ATMOSPHERE_CANNON 0
		setVar $CITADEL_CREDITS 0
		getWord CURRENTLINE $PLANET 2
		stripText $PLANET "#"
#		send "'{" $bot_name "} - Looking for Planet # " & $PLANET & "*"
#		HALT
		getWord CURRENTLINE $current_sector 5
		stripText $current_sector ":"
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


:FindJumpSector
	setVar $i 1
	setVar $RED_adj 0
	send "qq*"
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
	getWord CURRENTLINE $TurnsRequired_TPW 5

	if ($RED_adj > 0)
		# twarp to jmp sector, then into SD sect, then twarp home
		setVar $TurnsRequired_temp ($TurnsRequired_TPW * 3)
		if ($_Tow > 0)
			# 2 Turns for exporting into other ship and back again
			add $TurnsRequired_temp 2
			# 3 Turns for initial Port then x into other ship, port & shop, then x and report
			#   b4 heading home
			add $TurnsRequired_temp 3
		else
			add $TurnsRequired_temp 1
		end
	else
		setVar $TurnsRequired_temp ($TurnsRequired_TPW * 2)
		# 1 Turn to port at dock
		add $TurnsRequired_temp 1
	end

	setVar $TurnsRequired $TurnsRequired_temp
	return


:DoPurchases
	send "h "
	waitfor "<Hardware Emporium>"
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
	#=============================================== PURCHASE ARMIDS
	send "s"
	waitfor "How many Mine Disruptors"
	gettext CURRENTLINE $buy "(Max" ")"
	send $buy & "* "
	waitfor "<Hardware Emporium>"
	return