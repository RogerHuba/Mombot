	reqrecording
	logging off
	gosub :BOT~loadVars
	loadVar $MAP~STARDOCK
	
	loadvar $GAME~LIMPET_COST
	loadvar $GAME~ARMID_COST
	loadVar $GAME~LIMPET_REMOVAL_COST
	loadvar $game~DISRUPTOR_COST
	loadvar $bot~password
	setVar $LIMPET_COST $GAME~LIMPET_COST
	setVar $LIMPET_REMOVAL_COST $GAME~LIMPET_REMOVAL_COST
	setVar $ARMID_COST $GAME~ARMID_COST
	setVar $grid_limpets 1
	setVar $grid_armids 4
	setVar $refurb FALSE
	setVar $LongJumpLimit	5
	setVar $VERSION 	"1.0.5"
	getSectorParameter SECTORS "FIGSEC" $isFigged
	getSectorParameter SECTORS "MINESEC" $isArmided
	getSectorParameter SECTORS "LIMPSEC" $isLimped


	setvar $player~save true
	gosub :combat~init 

	setVar $BOT~help[1]  $BOT~tab&"Visits sectors in list and clears limps and armids."
	setVar $BOT~help[2]  $BOT~tab&"         "
	setVar $BOT~help[3]  $BOT~tab&"[furb]    - Will Attempt to buy Mines and/or Disruptors"
	setVar $BOT~help[4]  $BOT~tab&"[disr]    - Will HoloScan and attempt to disrupt all mines"
	setVar $BOT~help[5]  $BOT~tab&"[border]  - Only will put mines on the edge of your grid,"
	setVar $BOT~help[6]  $BOT~tab&"            otherwise it will only target 'safe' sectors. "
	setVar $BOT~help[7]  $BOT~tab&"[safe]    - Will do repeated Exit/Enters until all Enemy"
	setVar $BOT~help[8]  $BOT~tab&"            mines are gone slow but safe"
	setVar $BOT~help[9]  $BOT~tab&"[fast]    - Will do a rapid fire of exit enters, this isn't"
	setVar $BOT~help[10] $BOT~tab&"            safe as you'll will be sitting in sector."
	setVar $BOT~help[11] $BOT~tab&"[A:1]     - Specify Number of Armid Mines to Deploy"
	setVar $BOT~help[12] $BOT~tab&"[L:1]     - Specify Number of Limpet Mines to Deploy"
	setVar $BOT~help[13] $BOT~tab&"[ps]      - Do passive surround to grid safely"
	setVar $BOT~help[14] $BOT~tab&"            Limps, Armids, Fig, and planet avoidance "
	setVar $BOT~help[15] $BOT~tab&"            controlled by bot surround menu"
	setVar $BOT~help[16] $BOT~tab&"[bwarp]   - bwarp clearing"
	setVar $BOT~help[17] $BOT~tab&"[reckless]- bwarp recklessly, with no safeties"
	gosub :bot~helpfile

	setVar $BOT~script_title "Mine Sweeper"
	gosub :BOT~banner


	if (($MAP~stardock = 0) OR ($MAP~stardock = ""))
		setVar $SWITCHBOARD~message "Stardock is not defined.  Please define stardock variable in the bot.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($isFigged = "")
		setVar $SWITCHBOARD~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($isArmided = "")
		setVar $SWITCHBOARD~message "It appears no armid data is available.  Run an armid grid checker that uses the sector parameter MINESEC. (Try armids command)*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($isLimped = "")
		setVar $SWITCHBOARD~message "It appears no limpet data is available.  Run a limpet grid checker that uses the sector parameter LIMPSEC. (Try limps command)*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $PLAYER~save TRUE
	gosub :PLAYER~quikstats
	if ($PLAYER~current_prompt <> "Citadel")
		setVar $SWITCHBOARD~message "Must must start mine sweeper from citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($player~photons <> 0)
		setVar $SWITCHBOARD~message "Cannot Have Fotons!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	setVar $TEMP (" " & $bot~user_command_line & " ")
	lowercase $TEMP

	getWordPos $TEMP $pos " furb "
	if ($pos = 0)
		setVar $REFURB FALSE
	else
		setVar $REFURB TRUE
	end

	getWordPos $TEMP $pos " bwarp "
	if ($pos = 0)
		setVar $bwarp FALSE
	else
		setVar $bwarp TRUE
	end

	getWordPos $TEMP $pos " reckless "
	if ($pos = 0)
		setVar $reckless FALSE
	else
		setVar $reckless TRUE
	end

	getWordPos $TEMP $pos " ps "
	if ($pos = 0)
		setVar $passive_surround FALSE
	else
		setVar $passive_surround TRUE
	end

	getWordPos $TEMP $pos " ps "
	if ($pos = 0)
		setVar $passive_surround FALSE
	else
		setVar $passive_surround TRUE
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

	getWordPos $TEMP $pos "safe "
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

	getWordPos $TEMP $pos " cannon:"
	if ($pos = 0)
		setVar $cannon false
	else
		setvar $cannon true
		getText $TEMP $cannonDamage " cannon:" " "
		isNumber $tst $cannonDamage
		if ($tst = 0)
			setVar $cannonDamage 450000
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

	gosub :PLAYER~getInfo
	setVar $homesector $PLAYER~CURRENT_SECTOR

	gosub :ship~getshipstats

	killalltriggers
	goSub :checkAvoidedSectors
	send "q"
	gosub :PLANET~getPlanetInfo
	if (($bwarp = true) and ($planet~planet_TRANSPORT < 1))
		setVar $SWITCHBOARD~message "Planet does not have a transporter!  Can not do bwarp clearing.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($grid_limpets = 0) AND ($grid_armids = 0)
		setVar $SWITCHBOARD~message "Nothing To Do!*"
		gosub :SWITCHBOARD~switchboard
				halt
	end

	if (($player~organic_holds + $player~equipment_holds + $player~colonist_holds) <> 0)
		setVar $MAC ""
		if ($player~organic_holds <> 0)
			setVar $MAC ($MAC & " T  N  L 2* ")
		end
		if ($player~equipment_holds <> 0)
			setVar $MAC ($MAC & " T  N  L 3* ")
		end
		if ($player~colonist_holds <> 0)
			setVar $MAC ($MAC & " S  N  L 1* ")
		end
		if ($MAC <> "")
			send $MAC & " t  n  t  1*  m  n t *  c"
			gosub :PLAYER~quikstats
			if (($player~organic_holds + $player~equipment_holds + $player~colonist_holds) <> 0)
				setVar $SWITCHBOARD~message "Holds Not Empty*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		end
	else
		send $MAC & " t  n  t  1*  m  n t *  c"
	end

	gosub :checkShip

	setVar $Temp "{" & $switchboard~bot_name & "}"
	getLength $TEMP $Len
	setVar $S ""
	setVar $i 1
	while ($i <= $Len)
		setVar $S ($S & " ")
		add $i 1
	end
	send "'*"
	waitfor "Type sub-space message"
	send "{" $switchboard~bot_name "} - Mind ()ver Matter MineSweeper v"&$VERSION&" Loading*"
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
	if ($passive_surround)
		send $S & " - Doing passive surround if possible!*"
	end
	send $S & " - Deploying: " & $grid_armids & " Armids, " & $grid_limpets & " Limpets*"
	send "*"
		
	while (TRUE)
		gosub :PLAYER~quikstats
		if (($PLAYER~LIMPETS < $grid_limpets) OR ($PLAYER~ARMIDS < $grid_armids) OR (($PLAYER~MINE_DISRUPTORS = 0) AND ($DISR)))
			if ($refurb)
				gosub :attemptRefurb
				gosub :PLAYER~quikstats
				if (($PLAYER~LIMPETS < $grid_limpets) OR ($PLAYER~ARMIDS < $grid_armids) OR (($PLAYER~MINE_DISRUPTORS = 0) AND ($DISR)))
					setVar $SWITCHBOARD~message "Need to buy more mines before this script can continue.*"
					gosub :SWITCHBOARD~switchboard
					halt
				end
			else
				setVar $SWITCHBOARD~message "Need to buy more mines before this script can continue.*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		end
		gosub :findNextTarget
		send "  sz*    "
		Waiton "Warps to Sector(s) :"
		gosub :PLAYER~quikstats
		setVar $HAZ_Before SECTOR.NAVHAZ[$PLAYER~CURRENT_SECTOR]
		setVar $planet~planetS_Before SECTOR.PLANETCOUNT[$PLAYER~CURRENT_SECTOR]
		if ($planet~planetS_Before = 0)
			setvar $planet~planetS_Before 1
		end
		if (SECTOR.TRADERCOUNT[$PLAYER~CURRENT_SECTOR] <> 0)
			gosub :killthem
		end
		if ($DISR)
			gosub :DisRupt
		end
		gosub :clearSector
		send "  sz*    "
		Waiton "Warps to Sector(s) :"
		gosub :PLAYER~quikstats
		setVar $HAZ_After SECTOR.NAVHAZ[$PLAYER~CURRENT_SECTOR]
		setVar $planet~planetS_After SECTOR.PLANETCOUNT[$PLAYER~CURRENT_SECTOR]
		if (SECTOR.TRADERCOUNT[$PLAYER~CURRENT_SECTOR] <> 0)
			gosub :killthem
		end
		if ($HAZ_Before <> $HAZ_After)
			setvar $switchboard~message "NavHAZ Changed. Halting!*"
			gosub :switchboard~switchboard
			send "'" & $switchboard~bot_name & " holo*"
			waiton "Sub-space comm-link terminated"
			send "p" $homesector "*y "
			halt
		end
		if ($planet~planetS_After > $planet~planetS_Before)
			setvar $switchboard~message "New Planet in Sector. Halting!*"
			gosub :switchboard~switchboard
			send "p" $homesector "*y "
			halt
		end
		if ($passive_surround)
			setvar $PLAYER~surroundOverwrite FALSE
			setVar $PLAYER~surroundPassive   TRUE
			savevar $PLAYER~surroundOverwrite
			savevar $PLAYER~surroundPassive

			loadvar $PLAYER~surroundFigs
			loadvar $PLAYER~surroundMine
			loadvar $PLAYER~surroundLimp
			loadVar $PLAYER~surroundAvoidAllPlanets 
			loadVar $PLAYER~surroundAvoidShieldedOnly
			
			send "q q szh* s*/ "


			gosub :grid~surround
			setVar $land_mac "l j" & #8 & #8 & #8 & #8 & #8 & $planet~planet & "*  * j m  * * *  t * t 1* c * "
			send $land_mac

			getWordPos $PLAYER~surroundOutput $pos "planet"
			if ($pos > 0)
				setVar $SWITCHBOARD~message $PLAYER~surroundOutput 
				if ($SWITCHBOARD~self_command <> TRUE)
					setVar $SWITCHBOARD~self_command 2
				end
				gosub :SWITCHBOARD~switchboard
			end
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
	gosub :PLAYER~quikstats
return


:attemptRefurb
	setVar $limpetCashNeeded ((($maxMines-$PLAYER~LIMPETS)*$LIMPET_COST)+$LIMPET_REMOVAL_COST)
	setVar $armidCashNeeded ((($maxMines-$PLAYER~ARMIDS)*$ARMID_COST))
	setVar $disrCashNeeded (((50-$PLAYER~MINE_DISRUPTORS)*$game~DISRUPTOR_COST))
	setVar $cashNeeded ($limpetCashNeeded+$armidCashNeeded+$disrCashNeeded)
	if ($cashNeeded > $PLAYER~CREDITS)
		send "D"
		waitOn "Citadel treasury contains "
		getWord CURRENTLINE $planet~CITADELCash 4
		stripText $planet~CITADELCash ","
		if ($planet~CITADELCash < $cashNeeded)
			setVar $SWITCHBOARD~message "Not enough cash for mine refurbs in treasury or on hand.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		send "t f "&($cashNeeded-$PLAYER~CREDITS)&"* "
	end
	# check adj's for Dock.. if present, then we don't need a jump sector.
	setVar $i 1
	setVar $START_SECTOR $PLAYER~CURRENT_SECTOR
	setVar $WeAreAdjDock FALSE
	while ($i <= SECTOR.WARPCOUNT[$START_SECTOR])
		setVar $adj_start SECTOR.WARPS[$START_SECTOR][$i]
		if ($adj_start = $MAP~stardock)
			setVar $WeAreAdjDock TRUE
		end
		add $i 1
	end

	if (($PLAYER~ALIGNMENT  < 1000) AND ($WeAreAdjDock = FALSE))
		setVar $RED_adj 0
		gosub :player~findjumpsector
		if ($RED_adj = 0)
			waitfor "Command [TL="
			setVar $SWITCHBOARD~message "Cannot Find Jump Sector Adjacent Dock**"
			gosub :SWITCHBOARD~switchboard
			send "*"
			halt
		end
	end

	if ($PLAYER~ALIGNMENT  >= 1000)
		if ($WeAreAdjDock)
			send "^F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
		else
			send "^F" & $START_SECTOR & "*" & $MAP~stardock & "*F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
		end
	else
		if ($WeAreAdjDock)
			send "^F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
		else
			send "^F" & $START_SECTOR & "*" & $RED_adj & "*F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
		end
	end
	setTextLineTrigger noJoy :noJoy "*** Error - No route within"
	setTextTrigger cont :cont "(?="
	pause

	:noJoy
		killAllTriggers
		setVar $SWITCHBOARD~message "Cannot Find Path to StarDock!**"
		gosub :SWITCHBOARD~switchboard
				halt
	:cont
		killAllTriggers
		setDelayTrigger Latency_Delay		:Latency_Delay 500
		pause

		:Latency_Delay

		if (($PLAYER~ALIGNMENT  >= 1000) OR ($WeAreAdjDock))
			getdistance $dist1 $START_SECTOR $MAP~stardock
		else
			getdistance $dist1 $START_SECTOR $RED_adj
		end

		if ($dist1 <= 0)
			setVar $SWITCHBOARD~message "Insufficient Warp Data Plotting Course to Dock**"
			gosub :SWITCHBOARD~switchboard
			halt
		end

		getdistance $dist2 $MAP~stardock $START_SECTOR
		if ($dist2 <= 0)
			setVar $SWITCHBOARD~message "Insufficient Warp Data Plotting Return Course From Dock**"
			gosub :SWITCHBOARD~switchboard
			halt
		end

		setVar $ore_req (($dist1 + $dist2) * 3)

		if ($player~ore_holds < $ore_req)
			setVar $SWITCHBOARD~message "Not Enough ORE In Holds To Make Round Trip**"
			gosub :SWITCHBOARD~switchboard
			halt
		end

		if ($player~twarp_type = "No")
			setVar $SWITCHBOARD~message "Must Have Twarp 1 or 2**"
			gosub :SWITCHBOARD~switchboard
			halt
		end

		if ($PLAYER~unlimitedGame = 0)
			gosub :TurnsRequired
			if ($player~turnsRequired > $player~TURNS)
				setVar $SWITCHBOARD~message "Not Enough Turns. " & ANSI_12 & $player~turnsRequired & ANSI_15 & ", Required**"
				gosub :SWITCHBOARD~switchboard
				halt
			elseif ($player~turnsRequired <= $player~TURNS)
				setVar $tmp ($PLAYER~TURNS - $player~turnsRequired)
				if ($tmp <= $BOT~bot_turn_limit)
					setVar $SWITCHBOARD~message "Proceeding Will Leave Fewer Than " & $BOT~bot_turn_limit & " Turns!**"
					gosub :SWITCHBOARD~switchboard
					halt
				end
			end
		end

	send " C R " & $MAP~stardock & "*Q "
	setTextLineTrigger itsalive :itsalive "Items     Status  Trading % of max OnBoard"
	setTextLineTrigger nosoupforme :nosoupforme "I have no information about a port in that sector"
	pause
	:nosoupforme
		killAllTriggers
		setVar $SWITCHBOARD~message "StarDock appears to have been Blown Up!*"
		gosub :SWITCHBOARD~switchboard
		send "*"
		halt
	:itsalive
		killAllTriggers
		waitfor "(?="
		setVar $msg ""
		if (($PLAYER~ALIGNMENT  >= 1000) AND ($WeAreAdjDock = FALSE))
			setVar $TwarpTo $MAP~stardock
			gosub :DoTwarp
		elseif (($WeAreAdjDock = FALSE) AND ($RED_adj <> 0))
			setVar $TwarpTo $RED_adj
			gosub :DoTwarp
		else
			send " m " & $MAP~stardock & "*  *  P  S G Y G Q "
		end
		if ($msg = "")
			waitfor "You leave the Galactic Bank."
		else
			if (($photoned = true) and ($PLAYER~unlimitedGame = true))
				loadvar $game~PHOTON_DURATION
				send "L Z" & #8 & $planet~planet  & "*  c * "
				setvar $switchboard~message "Waiting for photon to wear off..*"	
				gosub :switchboard~switchboard	 
				setDelayTrigger restart_from_photon :attemptRefurb (($game~photon_duration * 60000) + 1000)
				pause

			else
				if ($photoned = true)
					setVar $SWITCHBOARD~message "I've been photoned, so not getting turns until the top of the hour.*"
				else
					setVar $SWITCHBOARD~message "Unknown Problem Detected. Check TA!*"
				end
				gosub :SWITCHBOARD~switchboard
				halt
			end
		end
		gosub :PLAYER~quikstats

		setVar $_Limps "Max"
		setVar $_Mines "Max"
		gosub :DoPurchases
		send "Q Q Q Q Z N M " & $START_SECTOR & "* Y  Y  Y  * L Z" & #8 & $planet~planet  & "* p  s  s * * c *"
		gosub :PLAYER~quikstats
		if ($PLAYER~CURRENT_SECTOR = $MAP~stardock)
			setVar $SWITCHBOARD~message "Twarp Error, Should be Hiding on Dock!*"
			gosub :SWITCHBOARD~switchboard
			send "*"
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
		setVar $SWITCHBOARD~message "Had to halt script, check ship to see if it is valid.*"
		gosub :SWITCHBOARD~switchboard
		goto :pauseGridder
	end
	if ($prompt = "Computer") or ($prompt = "Corporate") or ($prompt = "NavPoint")
		send "q"
		waitFor "Command [TL"
	end	
	gosub :PLAYER~quikstats
    	setVar $figstodeploy 1
	gosub :deployfigs 
	setVar $savetarget $PLAYER~CURRENT_SECTOR
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
	send "'pickup " & $PLAYER~CURRENT_SECTOR  & " ::*"
		

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
        getText CURRENTLINE $planet~planet  "Saveme script activated - Planet " " to "
        send "L " & $planet~planet  & "* C 'I landed on planet " & $planet~planet  & "*"
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
    if (($PLAYER~CURRENT_SECTOR  < 11) or ($PLAYER~CURRENT_SECTOR  = $MAP~stardock))
        setVar $SWITCHBOARD~message "Can't deploy figs in fed*"
		gosub :SWITCHBOARD~switchboard
		return
    end
    send "F"
    setTextLineTrigger nocontrol :nocontrol "These fighters are not under your control."
    setTextLineTrigger abletodeploy :abletodeploy "fighters available."
    pause

    :nocontrol
        killalltriggers
        setVar $SWITCHBOARD~message "We don't control the figs in this sector!*"
		gosub :SWITCHBOARD~switchboard
		goto :pauseGridder

    :abletodeploy
        killalltriggers
        getWord CURRENTLINE $figsavailable 3
        striptext $figsavailable ","
        if ($figstodeploy = "ALL")
            setVar $figstodeploy $figsavailable
        end
        if ($figsavailable = 0)
            send "0* ZC D* "
            setVar $SWITCHBOARD~message "I have no figs to deploy!*"
            gosub :SWITCHBOARD~switchboard
        else
            send $figstodeploy & "* ZC D* '" & $figstodeploy & " figs deployed*"
        end
return

:DisRupt
	if ($PLAYER~MINE_DISRUPTORS = 0)
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
		setVar $land_mac "l j" & #8 & #8 & #8 & #8 & #8 & $planet~planet & "*  * j m  * * *  t * t 1* c * "
		send $land_mac

		gosub :PLAYER~quikstats
		if ($player~current_prompt = "Citadel")
			loadvar $game~PHOTON_DURATION
			if (($photoned = true) and ($PLAYER~unlimitedGame = true))
				loadvar $game~PHOTON_DURATION
				send "L Z" & #8 & $planet~planet  & "*  c * "
				setvar $switchboard~message "Waiting for photon to wear off..*"	
				gosub :switchboard~switchboard	 
				setDelayTrigger restart_from_photon2 :DisRupt (($game~photon_duration * 60000) + 1000)
				pause
			end
		end
		setvar $switchboard~message "Unknown Problem Occured, at "&$PLAYER~CURRENT_PROMPT&" Prompt!*"
		gosub :switchboard~switchboard
		halt
	:Scan_Complete
		killAllTriggers
		setArray	$ADJ2HiT	6 1
		setVar $idx 1

		while (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$idx] > 0)
			setVar $adj SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$idx]
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

	setVar $DisRuptors $PLAYER~MINE_DISRUPTORS
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
	send (" Q Q Q Z N L Z" & #8 & $planet~planet  & "*  *  J  C  *  * ")
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
	getNearestWarps $nearest $PLAYER~CURRENT_SECTOR
	setVar $checked ""
	setVar $i 1
	while ($i <= $nearest)

		setVar $focus $nearest[$i]
		#echo "***[CHECKING FOR NEXT SECTOR " $FOCUS "]***"
		setVar $checked $checked&" "&$PLAYER~CURRENT_SECTOR&" "

		getWordPos $avoidedSectors $pos " "&$focus&" "
		getSectorParameter $focus "FIGSEC" $isFigged
		getSectorParameter $focus "MINESEC" $isArmided
		getSectorParameter $focus "LIMPSEC" $isLimped

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
		if ((($isLimped <> true) OR ($isArmided <> true)) AND ($isFigged = true) AND ($pos <= 0))
			getDistance $distanceThere $PLAYER~CURRENT_SECTOR $focus
			getDistance $distanceBack $focus $PLAYER~CURRENT_SECTOR
			if ($distanceThere < 0)
				send "^f"&$PLAYER~CURRENT_SECTOR&"*"&$focus&"*q"
				waitOn "ENDINTERROG"
				getDistance $distanceThere $PLAYER~CURRENT_SECTOR $focus
			end
			if ($distanceBack < 0)
				send "^f"&$focus&"*"&$PLAYER~CURRENT_SECTOR&"*q"
				waitOn "ENDINTERROG"
				getDistance $distanceBack $focus $PLAYER~CURRENT_SECTOR
			end
			if (($distanceThere > 30) AND ($LongJumpLimit <> 0))
				setVar $SWITCHBOARD~message "Next fighter is over 30 hops away, stopping mine sweeper.*"
				gosub :SWITCHBOARD~switchboard
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
				setVar $SWITCHBOARD~message "Not enough fuel on planet "&$planet~planet&". Stopping mine sweeper.*"
				gosub :SWITCHBOARD~switchboard
				halt
			:pwarpYesShip1
				killAllTriggers
				setVar $avoidedSectors $avoidedSectors&" "&$focus&" "
				gosub :PLAYER~quikstats
				return
			:pwarpNoShip1
				killAllTriggers
		end
		:NEXT_POSS_TARG
		add $i 1
	end
	setVar $SWITCHBOARD~message "All sectors possible swept. Halting mine sweeper.*"
		gosub :SWITCHBOARD~switchboard
			gosub :goHome
return

:goHome
	gosub :PLAYER~quikstats
	if ($PLAYER~CURRENT_PROMPT = "Citadel")
		send "p" & $homesector & "* y"
		setTextLineTrigger pwarp_lock 		:pwarp_lock 	"Locating beam pinpointed"
		setTextLineTrigger no_pwarp_lock 	:no_pwarp_lock 	"Your own fighters must be"
		setTextLineTrigger already 			:already 		"You are already in that sector!"
		setTextLineTrigger no_ore 			:no_ore 		"You do not have enough Fuel Ore"
		pause
		:no_pwarp_lock
			killAllTriggers
			setVar $SWITCHBOARD~message "No fighter down at that location!*"
		gosub :SWITCHBOARD~switchboard
					return
		:no_ore
			killAllTriggers
			setVar $SWITCHBOARD~message "Not enough fuel for that pwarp.*"
		gosub :SWITCHBOARD~switchboard
					return
		:pwarp_lock
			killAllTriggers
			waitOn "Planet is now in sector"
			setVar $SWITCHBOARD~message "Planet returned Home*"
		gosub :SWITCHBOARD~switchboard
					return
  		:already
			killAllTriggers
			setVar $SWITCHBOARD~message "Planet already in that sector!.*"
		gosub :SWITCHBOARD~switchboard
					return
	else
		setVar $SWITCHBOARD~message "Cannot Pwarp Home. Wrong Prompt!*"
		gosub :SWITCHBOARD~switchboard
				halt
	end
	return


:clearSector

	if ($cannon = true)
		send "q"
		killalltriggers
		gosub :PLANET~getPlanetInfo
		setVar $percentToSet (((3*$cannonDamage)*100)/$planet~planet_FUEL)
		if (((($planet~planet_FUEL * $percentToSet) / 100)/3) < $cannonDamage)
			add $percentToSet 1
		end
		if ($percentToSet > 100)
			setVar $percentToSet 100
		end

		send "c *ls"&$percentToSet&"*  "  
	end


	setVar  $LAID_ARMID FALSE
	setVar	$LAID_LIMP FALSE
	setVar $beforeSector $PLAYER~CURRENT_SECTOR
	setVar $beforeLimpets $PLAYER~LIMPETS
	setVar $beforeArmids  $PLAYER~ARMIDS
	setVar $placedLimpet FALSE
	setVar $placedArmid FALSE

	send "   sz*    "

	waitOn "Warps to Sector(s) :"
	setVar $limpetOwner SECTOR.LIMPETS.OWNER[$PLAYER~CURRENT_SECTOR]
	setVar $armidOwner SECTOR.MINES.OWNER[$PLAYER~CURRENT_SECTOR]
	if ((($limpetOwner = "belong to your Corp") OR ($limpetOwner = "yours")))
		setVar $placedLimpet TRUE
	end
	if ((($armidOwner = "belong to your Corp") OR ($armidOwner = "yours")))
		setVar $placedArmid TRUE
	end

	if (($placedArmid <> TRUE) AND ($placedlimpet <> TRUE))
		gosub :deployEquipment
	end

	if (($placedLimpet = FALSE) OR ($placedArmid = FALSE))
		while (($placedLimpet = FALSE) OR ($placedArmid = FALSE))
			gosub :attemptClearingMines
		end
		setSectorParameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
		setSectorParameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
	else
		if ($placedArmid)
			setSectorParameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
		end
		if ($placedLimpet)
			setSectorParameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
    	end
	end
	gosub :PLAYER~quikstats
	if ($PLAYER~CURRENT_PROMPT = "Command")
		send "l "&$planet~planet&"* m * * * c "
	end
return

:xenter
	
	send "r y n * t* * *" PASSWORD "*    *    *    m * * *  c       q    q  *     *       za9999*   z*   l j" & #8 & $planet~planet & "* c   "
	

	return

:attemptClearingMines
	killtrigger LAID_LIMP
	killtrigger LAID_ARMID
	setVar $LAID_ARMID $placedArmid
	setVar $LAID_LIMP $placedLimpet

	if ($bwarp = true)
		setVar $i 0
		setvar $bwarp_move  "b"&$player~current_sector&"*"
		setvar $bwarp_clear "y   *  l j" & #8 & #8 & #8 & #8 & #8 & $planet~planet & "*  j  c  *  "
		
		if ($reckless <> true)
			while ($i <= 3)
				killtrigger 1
				killtrigger 2
				killtrigger 3
				setTextTrigger 1 :no_bwarp_lock "Do you want to make this transport blind?"
				setTextTrigger 2 :bwarp_lock "All Systems Ready, shall we engage?"
				setTextLineTrigger 3 :bwarpNoFuel "This planet does not have enough Fuel Ore to transport you."

				send $bwarp_move
				pause

				:no_bwarp_lock
					killalltriggers
					send "n "
					setVar $SWITCHBOARD~message "Fighter is gone from sector!  Stopping, check for enemies!*"
					gosub :SWITCHBOARD~switchboard
					halt

				:bwarpNofuel
					killalltriggers
					setVar $SWITCHBOARD~message "Not enough fuel on the planet! Stopping.*"
					gosub :SWITCHBOARD~switchboard
					halt
				:bwarp_lock
					send $bwarp_clear
	
				add $i 1
			end
		else
			send $bwarp_move "  " $bwarp_clear $bwarp_move "  " $bwarp_clear $bwarp_move "  " $bwarp_clear $bwarp_move "  " $bwarp_clear $bwarp_move "  " $bwarp_clear
		end

		killtrigger 1 
		killtrigger 2
		killtrigger 3
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

		send "q  q  "&$_ARMIDS_&$_LIMPS_&" l "&$planet~planet&"*  c  "
		setTextLineTrigger	LAID_LIMP	:LAID_LIMP	"Limpet mine(s) on board."
		setTextLineTrigger	LAID_ARMID	:LAID_ARMID	"Armid mine(s) on board."
		gosub :PLAYER~quikstats
		waiton "Citadel command"

	else
		setvar $modules~minesToDeploy $grid_armids
		setvar $modules~limpsToDeploy $grid_limpets
		gosub :modules~clear
		gosub :player~quikstats
		setSectorParameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
		setSectorParameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
		setVar $LAID_ARMID TRUE
		setVar $LAID_LIMP TRUE
		setVar $placedLimpet TRUE
		setVar $placedArmid TRUE
	end
return
	:LAID_ARMID
		setVar $LAID_ARMID TRUE
		pause
	:LAID_LIMP
		setVar $LAID_LIMP TRUE
		pause


:deployEquipment
	send "q  q  h  1  z " & $grid_armids & "*  z c  *  h  2  z " & $grid_limpets & "*  z c  *   l " & $planet~planet  & "*  c "
	gosub :PLAYER~quikstats
	if ($beforeSector <> $PLAYER~CURRENT_SECTOR)
		gosub :callSaveMe
	end
	if ($PLAYER~CURRENT_PROMPT <> "Citadel")
		setVar $SWITCHBOARD~message "Unexpected Problem.. Halting*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if (($beforeLimpets > $PLAYER~LIMPETS) OR ($PLAYER~LIMPETS < $grid_limpets) OR (($limpetOwner = "belong to your Corp") OR (($limpetOwner = "yours"))))
		setVar $placedLimpet TRUE
	end
	if (($beforeArmids > $PLAYER~ARMIDS) OR ($PLAYER~ARMIDS < $grid_armids) OR (($armidOwner = "belong to your Corp") OR (($armidOwner = "yours"))))
		setVar $placedArmid TRUE
	end
	return

:DoTwarp
	setVar $msg ""
	setvar $photoned false
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
			setvar $photoned true
			goto :twarpDone

		:twarp_lock
			KillAlltriggers
			if ($PLAYER~ALIGNMENT  >= 1000)
				send "y * * p s g y g q "
			else
				send "y  *  *  m " & $MAP~stardock & " *  *  p s g y g q "
			end
		:twarpDone
			if ($msg <> "")
				setVar $SWITCHBOARD~message "Twarp Error - " & $msg & "*"
				gosub :SWITCHBOARD~switchboard
				send "*"
			end
	end
	return



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




:FindJumpSector
	setVar $i 1
	setVar $RED_adj 0
	send "qq*"
		while (SECTOR.WARPSIN[$MAP~stardock][$i] > 0)
		setVar $RED_adj SECTOR.WARPSIN[$MAP~stardock][$i]
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

:killthem
	if ($kill = true)
		:scanit_again
			killAllTriggers
			gosub :player~quikstats
			gosub :sector~getSectorData
			setvar $planet~planet_count SECTOR.PLANETCOUNT[$player~current_sector]
			if (($planet~planet_count = 1) and ($overide = false))
				setvar $one_planet true
				setvar $player~override true
			else
				setvar $player~override $override
			end
			if ($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips))
				goSub :combat~fastCitadelAttack
				if ($player~fighters <= 0)
					setvar $switchboard~message "Fighters are gone - halting.*"
					gosub :switchboard~switchboard
					halt
				end
				goto :scanit_again
			elseif (($sector~emptyShipCount > $sector~myShipCount) AND ($capEmptyShips = TRUE))
				setvar $player~startinglocation "Citadel"
				gosub :combat~fastCapture
				gosub :player~quikstats
				if ($player~current_prompt = "Command")
					send " l " $PLANET~PLANET " * n n * j m * * * j c  *  "
					gosub :player~quikstats
					if ($player~fighters <= 0)
						setvar $switchboard~message "Fighters are gone - halting.*"
						gosub :switchboard~switchboard
						halt
					end
				end
				goto :scanit_again
			end

	else
		setvar $switchboard~message "Trader Is In Sector. Halting!*"
		send "p" $homesector "*y "
	end
return

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\bot_includes\combat\init\combat"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\module_includes\modules\xenter\modules"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\grid\surround\grid"
include "source\bot_includes\player\findjumpsector\player"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastcitadelattack\combat"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\ship\loadshipinfo\ship"
include "source\bot_includes\ship\getshipcapstats\ship"
include "source\bot_includes\ship\getshipstats\ship"
include "source\module_includes\modules\clear\modules"

