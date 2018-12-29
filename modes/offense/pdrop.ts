reqRecording
# Mind Over Matter Planet Drop
# Author: Mind Dagger

	gosub :BOT~loadVars
	setVar $BOT~command "pdrop"
	loadVar $BOT~bot_turn_limit
	loadVar $MAP~stardock
	loadvar $bot~subspace
	loadvar $switchboard~self_command
	loadvar $ship~ship_max_attack

	setVar $BOT~help[1]   $BOT~tab&"pdrop [on/off]{delay}{drop type}{trigger}{return}{kill} "
	setVar $BOT~help[2]   $BOT~tab&"       "
	setVar $BOT~help[3]   $BOT~tab&"     - [delay]     = delay before dropping in milliseconds      "
	setVar $BOT~help[4]   $BOT~tab&"     - [drop type] = [d]irect, [a]djacent, [s]urround, "
	setvar $BOT~help[5]   $BOT~tab&"                     or [da] direct, then adjacent"
	setVar $BOT~help[6]   $BOT~tab&"     - [delay]     = delay before dropping in milliseconds "
	setVar $BOT~help[7]   $BOT~tab&"     - [trigger]   = [f]igs, [fm] figs/mines,  "
	setVar $BOT~help[8]   $BOT~tab&"                     [m]ines, [uf] No-Fig Mines"
	setVar $BOT~help[9]   $BOT~tab&"     - [return]    = will return planet home after 10 seconds"
	setVar $BOT~help[10]  $BOT~tab&"     - [kill]      = checks for enemy, and kills if possible"
	setVar $BOT~help[11]  $BOT~tab&"     - [fastkill]  = does kill mac without checking"
	gosub :BOT~help_file

	setVar $BOT~script_title "Planet Dropper"
	gosub :BOT~banner

	setVar $PLAYER~save TRUE
	gosub :player~init

	getSectorParameter SECTORS "FIGSEC" $isFigged


	setVar $START_FIG_HIT "Deployed Fighters Report Sector "
	setVar $END_FIG_HIT   ":"
        setVar $ALIEN_ANSI    #27 & "[1;36m" & #27 & "["
        setVar $START_FIG_HIT_OWNER ":"
	setVar $END_FIG_HIT_OWNER "'s"
	loadVar $map~stardock
	loadVar $map~backdoor
	loadVar $map~rylos
	loadVar $map~alpha_centauri
	loadVar $bot~command
	getWord $bot~user_command_line $bot~parm1 1
	getWord $bot~user_command_line $bot~parm2 2
	getWord $bot~user_command_line $bot~parm3 3
	getWord $bot~user_command_line $bot~parm4 4
	getWord $bot~user_command_line $bot~parm5 5
	getWord $bot~user_command_line $bot~parm6 6
	getWord $bot~user_command_line $bot~parm7 7
	getWord $bot~user_command_line $bot~parm8 8
	getSectorParameter SECTORS "FIGSEC" $isFigged
	if ($isFigged = "")
		send "'{" $bot~bot_name "} - It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		halt
	end
	
	gosub :player~quikstats
	setVar $startingLocation $player~current_prompt
	setVar $script_ver "Mind Over Matter Bot P-drop"
	if ($startingLocation <> "Citadel")
		send "'{" $bot~bot_name "} - This script must be run from the Citadel Prompt*"
		setVar $mode "General"
	        halt
	end
	if ($bot~parm1 <> "on")
		send "'{" $bot~bot_name "} - Please use [on/off] {delay} {drop type} {trigger type} {kill} {return}*"
		halt
	end
	setVar $bot~user_command_line $bot~user_command_line&" "
	isNumber $test $bot~parm2
	if ($test)
		setVar $dropDelay $bot~parm2
	else
		setVar $dropDelay 0
	end
	getWordPos $bot~user_command_line $pos " d "
	if ($pos > 0)
		setVar $dropDescription "Direct"
	else
		getWordPos $bot~user_command_line $pos " a "
		if ($pos > 0)
			setVar $dropDescription "Adjacent"
		else
			getWordPos $bot~user_command_line $pos " da "
			if ($pos > 0)
				setVar $dropDescription "Direct, then Adjacent"
			else
				getWordPos $bot~user_command_line $pos " s "
				if ($pos > 0)
					setVar $dropDescription "Surround"
				else
					getWordPos $bot~user_command_line $pos " ad "
					if ($pos > 0)
						setVar $dropDescription "Adjacent, then Direct"
					else
						setVar $dropDescription "Direct"
					end
				end
			end
		end
	end
	getWordPos $bot~user_command_line $pos " f "
	if ($pos > 0)
		setVar $triggerDescription "Fighters"
	else
		getWordPos $bot~user_command_line $pos " fm "
		if ($pos > 0)
			setVar $triggerDescription "Fighters and Mines"
		else
			getWordPos $bot~user_command_line $pos " m "
			if ($pos > 0)
				setVar $triggerDescription "Mines"
			else
				getWordPos $bot~user_command_line $pos " uf "
				if ($pos > 0)
					setVar $triggerDescription "Unfigged Mines"
				else
					setVar $triggerDescription "Fighters and Mines"
				end
			end
		end
	end
	getWordPos $bot~user_command_line $pos "return"
	if ($pos > 0)
		setVar $returnHome TRUE
		setVar $returnHomeDelay 10
	else
		setVar $returnHome FALSE
		setVar $returnHomeDelay 0
	end

	getWordPos $bot~user_command_line $pos "kill"
	if ($pos > 0)
		setVar $attackOnSight TRUE
	else
		setVar $attackOnSight FALSE
	end
	setVar $randomAttack TRUE

	getWordPos $bot~user_command_line $pos "fastkill"
	if ($pos > 0)
		setVar $fastkill TRUE
	else
		setVar $fastkill FALSE
	end
	setVar $randomAttack TRUE

	gosub :player~quikstats
	if ($player~corporation > 0)
		gosub :getCorpies
	end
	gosub :getName
	setVar $script_ver "Planet Drop"

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
	
	setVar $message "'*  {"&$bot~bot_name&"} - Planet Dropper Currently Running On Planet "&$planet~planet&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*        Drop Type: "&$dropDescription&" On "&$triggerDescription
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
		setVar $message $message&"*        Auto Kill: Enabled With "&$planet~planetFighters&" Fighters"
	end
	if ($fastkill)
		setVar $message $message&"*        Fast Kill: Will attempt kill macro at every pdrop attempt"
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
	gosub :player~quikstats
	setVar $homeSector $player~current_sector
	:startTargeting
		killAllTriggers
		if (($returnHome = TRUE) AND ($isManual <> TRUE) AND ($player~current_sector <> $homeSector))
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
				setvar $send "p "&$dropSector&"* y "
				if ($fastkill = true)
					setvar $send $send&"q q a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n l "&$planet~PLANET&"*  m  *** q z n a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n  l "&$planet~PLANET&"*  m  *** q z n a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n  l "&$planet~PLANET&"*  m  *** q z n a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n  l "&$planet~PLANET&"*  m  *** q z n a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n  l "&$planet~PLANET&"*  m  *** c  "
				end
				send $send

				if ($attackOnSight)

					goSub :checkForVictims
				end	
				goSub :getSectorLocation
				if ($player~current_sector <> $dropSector)
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
				if ($dropSector <> $player~current_sector)
					send "p " $dropSector "*y"
					setTextTrigger pwarpNotOk :pwarpTryAdjacent "You do not have any fighters in Sector "
					setTextTrigger pwarpOk :pwarpDone " Planetary TransWarp Drive Engaged! "
					pause

					:pwarpDone
						killAllTriggers
						setVar $player~current_sector $dropSector
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
			setVar $checkSector SECTOR.WARPS[$dropSector][$i]
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
		setvar $send "p "&$gotoSector&"*y"
		if ($fastkill = true)
			setvar $send $send&"q q a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n l "&$planet~PLANET&"*  m  *** q z n a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n  l "&$planet~PLANET&"*  m  *** q z n a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n  l "&$planet~PLANET&"*  m  *** q z n a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n  l "&$planet~PLANET&"*  m  *** q z n a y y "&$ship~SHIP_MAX_ATTACK&"* * z n q z n  l "&$planet~PLANET&"*  m  *** c  "
		end
		send $send
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
	gosub :player~quikstats
	send "*"
	waitOn "Planet #"
	getWord CURRENTLINE $planet~planet 2
	waitOn "Fighters"
	getWord CURRENTLINE $planet~planetFighters 5
	stripText $planet~planet "#"
	send "c"
return

:warning
	send "#"
return

:landOnPlanetEnterCitadel
	send "l " $planet~planet "* c"
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

:scanit_again
	killAllTriggers
	gosub :sector~getSectorData
	if ($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips))
		goSub :player~fastCitadelAttack
		goto :scanit_again
	elseif (($sector~emptyShipCount > $sector~myShipCount) AND ($capEmptyShips = TRUE))
		gosub :player~fastCapture
		goto :scanit_again
	end
	goto :halt


:checkForVictims
	gosub :player~quikstats
	:scanit_again
	setvar $player~startingLocation $player~current_prompt
	gosub :sector~getSectorData
	if ($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips))
		goSub :player~fastCitadelAttack
		goto :scanit_again
	elseif (($sector~emptyShipCount > $sector~myShipCount))
		gosub :player~fastCapture
		goto :scanit_again
	end
return	



:getDropperStats
	send "c;q"
	waitFor "Figs Per Attack:"
	getWord CURRENTLINE $ship~SHIP_MAX_ATTACK 5

	send "q m****c "
	waitOn "Planet #"
	getWord CURRENTLINE $planet~planet 2
	waitOn "Fighters        N/A"
	getWord CURRENTLINE $planet~planetFighters 5
	waitOn "<Enter Citadel>"

	stripText $planet~planet "#"
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
	setVar $player~current_sector $temp
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

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
