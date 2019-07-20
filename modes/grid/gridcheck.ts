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

	getSectorParameter SECTORS "FIGSEC" $isFigged
	if ($isFigged = "")
		send "'{" $switchboard~bot_name "} - It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		halt
	end

  	getWordPos " "&$bot~user_command_line&" " $pos " b "
	if ($pos > 0)
		setVar $Bwarp TRUE
	else
		setVar $Bwarp FALSE
	end


:get_info
	gosub :player~quikstats
	if ($player~current_prompt <> "Citadel")
		send "'{" $switchboard~bot_name "} - Must must start grid check from citadel prompt.*"
		halt
	end
	setVar $homesec $player~current_sector
	


:checkShip
	killAllTriggers
	send "c;q"
	waitFor "Mine Max:"
	getWord CURRENTLINE $maxLimpets 6
:start
	gosub :randomizer

	killAllTriggers
	send "qm***tnt1*"
	gosub :player~quikstats
	gosub :planet~getplanetinfo
	send "q"
	gosub :assemble_mac

:select_boomsec
	gosub :player~quikstats
	IF ($player~total_holds > $player~ore_holds)
		goto :no_ore
	END
	IF ($player~twarp_type = "No")
		send "'{" $switchboard~bot_name "} - Must have T-warp to run this script.*"
		HALT
	END

:getSector
	getRnd $random 1 $database_count
	getWord $database $warpto $random
	IF ($warpto = 0)

		send "'{" $switchboard~bot_name "} - Entire Grid Checked.*"
		HALT

	END

:clearit
	KillAllTriggers
	setVar $temp " "&$warpto&" "
	replaceText $database $temp " "
	subtract $database_count 1
	IF (SECTOR.EXPLORED[$warpto] = "YES")
		setVar $temp " "&$warpto&" "
		replaceText $database $temp " "
		subtract $database_count 1
		goto :getSector
	END
	IF ($BWarp = FALSE)
		send "q q * "
		gosub :twarp
	ELSE
		gosub :bwarp
	END

	

:hittingsec
	KillAllTriggers
	send $mac
	goto :select_boomsec



:twarp

	killAllTriggers
	send "m" $warpto "*"
	setTextTrigger there :adj_warp "You are already in that sector!"
	setTextLineTrigger adj_warp :adj_warp "Sector  : "&$warpto
	setTextLineTrigger locking :locking "That Warp Lane is not adjacent"
	pause

:adj_warp
	killAllTriggers
	send "zn"
	goto :twarp_adj
:locking
	killAllTriggers
	send "y"
	setTextLineTrigger twarp_lock :twarp_lock "TransWarp Locked"
	setTextLineTrigger no_twrp_lock :no_twarp_lock "No locating beam found"
	setTextLineTrigger twarp_adj :twarp_adj "<Set NavPoint>"
	setTextLineTrigger no_ore :no_ore "You do not have enough Fuel Ore"
	pause


:no_ore
	killAllTriggers
	send "'{" $switchboard~bot_name "} - Planet is out of fuel.  Please refill before running again.*"
	halt

:twarp_adj
	killAllTriggers
	send "zn"
	return

:twarp_lock
	KillAlltriggers
	send "y*zn"
	return

:no_twarp_lock
	killAllTriggers
	send "n*zn"
	send "l " & #8 & $planet~planet "*c"
	setSectorParameter $warpto "FIGSEC" FALSE
	setVar $temp " "&$warpto&" "
	replaceText $database $temp " "
	subtract $database_count 1
	goto :select_boomsec



:bwarp

	killAllTriggers
	send "b" $warpto "*"
	setTextTrigger go :go5 "TransWarp Locked"
	setTextTrigger no :no5 "No locating beam found"
	setTextTrigger outta_ore :no_ore "This planet does not have enough Fuel Ore to transport you."
	pause

:no5
	killAllTriggers
	send "n"
	waitfor "Transporter shutting down."
	setSectorParameter $warpto "FIGSEC" FALSE
	setVar $temp " "&$warpto&" "
	replaceText $database $temp " "
	subtract $database_count 1
	goto :select_boomsec

:go5
	killAllTriggers
	send "yzn"
	return




:ending
	halt



#-=-=-=-=- randomizer -=-=-=-=-=-
:randomizer
	setVar $rnd_count 0
	setVar $database_count 0
	setVar $database ""

:rnd_loop
	send "'{" $switchboard~bot_name "} - Calculating unexplored sectors..*"
	setVar $percfigs 0
	while ($rnd_count < SECTORS)	
		add $rnd_count 1
		getSectorParameter $rnd_count "FIGSEC" $isFigged
		if (($avoidedSectors[$rnd_count] = FALSE) AND ($isFigged = TRUE) AND (SECTOR.EXPLORED[$rnd_count] <> "YES"))
			setVar $database $database&" "&$rnd_count
			add $database_count 1
		end
		setVar $percTest (($rnd_count * 100) / SECTORS)
		if ($percTest > $percfigs)
			setVar $percfigs (($rnd_count * 100) / SECTORS)
			echo "*"
			echo #27 "["&($percfigs / 2)&"C" 
			echo ANSI_15 "°" ANSI_9 " " $percfigs "%" #27 & "[1A   "
		end	
	end	
	send "'{" $switchboard~bot_name "} - " $database_count " sectors in current grid need exploring.  Starting now.*"
	
	return


#-=-=-=-=-=- assemble macro -=-=-=-=-=-=-=-=-
:assemble_mac
	setVar $mac " *  z n  s z h* "
	setVar $mac $mac & "m" & $homesec & "*yy*  l " & #8 & $planet~planet & "*  z  n  z  n  *  mnt*  tnt1**  cr*  "
	return

# -=-=-=-=-=- return triggers -=-=-=-=-=-=-=-
:return_triggers
	setTextTrigger incit :incit "To which Sector"
	setTextTrigger igd :igd "An Interdictor Generator in this sector holds you fast!"
	setTextTrigger noturns :igd "Your ship was hit by a Photon and has been disabled"
	pause
:incit
	killAllTriggers
	return
:igd
	killAllTriggers
	gosub :player~quikstats
	if ($player~current_prompt = "Citadel")
		halt
	end
	if ($player~current_prompt = "Computer") or ($player~current_prompt = "Corporate") or ($player~current_prompt = "NavPoint")
		send "q"
		waitFor "Command [TL"
	end
	gosub :callsaveme
	halt

:callSaveMe
	killAllTriggers
	send "q q q * * * * "
	gosub :player~quikstats
    	setVar $figstodeploy 1
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

	gosub :deployfigs
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
        send "'{" $switchboard~bot_name "} - 30 seconds after save call, script halted.*"
        goto :PauseGridder

    :friendlytwarp
        killalltriggers
        setVar $figstodeploy "ALL"
        gosub :deployfigs
        goto :waitforhelp

    :friendlyplanet
        killalltriggers
        getText CURRENTLINE $planet~planet_SAVEME "Saveme script activated - Planet " " to "
        send "L " & #8 & $planet~planet_SAVEME & "* C 'I landed on planet " & $planet~planet_SAVEME & "*"
        goto :PauseGridder

    :towlocked
        killalltriggers
        setVar $figstodeploy 1
        gosub :deployfigs
        send "'Tow locked, get us out of here!*"
        goto :PauseGridder


:deployfigs
    if ($figstodeploy = 0)
        setVar $figstodeploy 1
    end
    if (($player~current_sector  < 11) or ($player~current_sector  = STARDOCK))
        send "'Can't deploy figs in fed*"
        return
    end
    send "a y y 9999* F"
    setTextLineTrigger nocontrol :nocontrol "These fighters are not under your control."
    setTextLineTrigger abletodeploy :abletodeploy "fighters available."
    pause

    :nocontrol
        killalltriggers
        send "'{" $switchboard~bot_name "} - We don't control the figs in this sector!*"
        return

    :abletodeploy
        killalltriggers
        getWord CURRENTLINE $figsavailable 3
        striptext $figsavailable ","
        if ($figstodeploy = "ALL")
            setVar $figstodeploy $figsavailable
        end
        if ($figsavailable = 0)
            send "0* ZC D* '{"&$switchboard~bot_name&"} - I have no figs to deploy!*"
        else
            send $figstodeploy & "* ZC D* '" & $figstodeploy & " figs deployed*"
        end
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

	

:getLine
	killtrigger done
	add $cnt 1
	setVar $culine CURRENTLINE
	replaceText $culine #179 " " & #179 & " "
	setVar $line[$cnt] $culine
	getWordPos $culine $pos " Ship "
	if ($pos > 0)
	     goto :done_read
	end
	goto :chk


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


:landOnPlanetEnterCitadel
	send "l " & #8 & $planet~planet "* c"
	waitOn "<Enter Citadel>"
	return
:leaveCitadelAndPlanet	
	send "q q"
	waitOn "Blasting off from"
	waitOn "Command [TL"
	return
:header

return

:clearScreen
	echo #27 & "[2J"
	return

:checkAvoidedSectors
	:readAvoidedList
		setArray $avoidedSectors SECTORS
		send "cxq"
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
			goto :doneAvoids
		end
		setVar $workingText $workingText&" +++"
		getWord $workingText $avoid 1
		getWordPos $workingText $pos $avoid
		
		
		while ($avoid <> "+++")
			setVar $avoidedSectors[$avoid] TRUE
			getLength $avoid $length 
			getLength $workingText $checkLength
			cutText $workingText $workingText ($pos+$length) 9999	
			getWord $workingText $avoid 1
			getWordPos $workingText $pos $avoid
			
		end
		goto :keepCountingAvoids
		
	:doneAvoids
	return

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
