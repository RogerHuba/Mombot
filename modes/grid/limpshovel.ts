	logging off
	reqRecording
	goto :load_script
	

:load_script
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
	loadVar $home_sector
	loadVar $backdoor
	loadvar $LIMPET_COST
	loadvar $ARMID_COST
	loadVar $LIMPET_REMOVAL_COST
	loadvar $password
	setVar $grid_limpets 3
	setVar $grid_armids 3
	setVar $refurb TRUE
	loadVar $FIG_FILE 		
	loadVar $LIMP_FILE 		
	loadVar $ARMID_FILE 
	loadvar $command
	setVar $GRIDDER_FILE 		"_MOM"&GAMENAME&"_GRIDDER_TARGETS.txt"
	setVar $MASTER_EDGE_FILE 	"_MOM_" & GAMENAME & "_EdgeMasterList.sectors"
	setVar $UNEXPLORED_FILE         "_MOM_UNEXPLORED_" & GAMENAME & ".sectors"
	setVar $imlimped FALSE
	setVar $avoidedSectors ""
	setArray $move SECTORS
	setVar $checkedForInfo ""
	setVar $grid_figs 1
	setVar $attack_retreat FALSE
	
	getSectorParameter SECTORS "FIGSEC" $isFigged
	getSectorParameter SECTORS "MINESEC" $isArmided
	getSectorParameter SECTORS "LIMPSEC" $isLimped
	fileExists $doesHelpFileExist "scripts\mombot\help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\mombot\help\"&$command&".txt" "- limpshovel {bwarp}                                                     " 
		write "scripts\mombot\help\"&$command&".txt" "  Limpet reorganizer. Dumps limpets to borders of grid or near base if no border available. " 
		write "scripts\mombot\help\"&$command&".txt" "                                                            " 
		write "scripts\mombot\help\"&$command&".txt" "    [bwarp] - Will use planetary transporter to hit sectors. Default is twarp.                                                          " 
		send "'{" $switchboard~bot_name "} - Writing help file for this command in Help directory.*"
	end

	setVar $max_sectors $bot~parm1
	isNumber $number $max_sectors
	if ($number <> 1)
		send "'{" $switchboard~bot_name "} - Amount of sectors to shovel not a number!*"
		halt
	end
	if ($max_sectors <= 0)
		send "'{" $switchboard~bot_name "} - Amount of sectors to shovel must be greater than 0.*"
		halt
	end

	getWordPos $bot~user_command_line $pos "norefurb" 
	getWordPos $bot~user_command_line $pos "bwarp" 
	if ($pos > 0)
		setVar $grid_warp "bwarp"
	else
		setVar $grid_warp "twarp"
	end	

	if ($isFigged = "")
		send "'{" $switchboard~bot_name "} - It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		halt
	end
	if ($isLimped = "")
		send "'{" $switchboard~bot_name "} - It appears no limpet data is available.  Run a limpet grid checker that uses the sector parameter LIMPSEC. (Try limps command)*"
		halt
	end
	if ($player~photons > 0)
	       send "'Can not run with photons on your ship.*"
               halt
	end

	gosub :player~quikstats
	if ($player~current_prompt <> "Citadel")
		send "'{" $switchboard~bot_name "} - Must start limpet shovel from citadel prompt.*"
		halt
	end

killalltriggers
setVar $homesec $player~current_sector
goSub :checkAvoidedSectors

:checkForTargets
	send "q"
	gosub :planet~getplanetinfo
	send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*q"
	gosub :landOnPlanetEnterCitadel
	send "'{" $switchboard~bot_name "} - M()M Limpet Shovel Powering Up!*"
	waitFor "(?="



:checkShip
	killAllTriggers
	gosub :player~quikstats
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
:restart
	send "q"
	gosub :planet~getplanetinfo
	send "c "
	gosub :findAllTargetSectors
	gosub :assemble_mac
	gosub :assemble_return_mac
	gosub :assemble_attack_mac
	gosub :assemble_land_mac
:select_boomsec
	killAllTriggers
	gosub :player~quikstats
	if ($player~fighters < ($figs+5))
		echo ANSI_12 "*Not enough fighters to safely continue.*" ANSI_7
		halt
	end
	if ($player~limpets >= ($maxMines-20))
		#DUMP THE EXTRA LIMPETS
		getWord $unload_sectors $player~warpto 1
		replaceText $unload_sectors " "&$player~warpto&" " " "
		if ($player~warpto = 0)
			getNearestWarps $nearest $homesec
			setVar $i 1
			while (($i <= $nearest) AND ($player~warpto = 0))
				setVar $focus $nearest[$i]
				getWordPos $avoidedSectors $pos " "&$focus&" "
				getSectorParameter $focus "FIGSEC" $isFigged
				getSectorParameter $focus "LIMPSEC" $isLimped
				if ($isFigged = "")
					setVar $isFigged FALSE
				end
				if ($isLimped = "")
					setVar $isLimped FALSE
				end
				if (($isLimped = TRUE) AND ($isFigged = TRUE) AND ($pos <= 0))
					setVar $player~warpto $focus
					setVar $avoidedSectors $avoidedSectors&" "&$focus&" "
				end
				add $i 1
			end
			if ($player~warpto = 0)
				echo ANSI_12 "*No Limpet Dump Sectors Able to be Found.*" ANSI_7
				halt
			end

		end
		if ($grid_warp = "twarp")
			gosub :doTwarp
		elseif ($grid_warp = "bwarp")
			gosub :bwarp
		else
			halt
		end
		killalltriggers
		setVar $justCheckingIfAlive FALSE
		gosub :player~quikstats
		if (($TWARP = "No") OR ($player~current_sector <> $player~warpto))
			goto :callSaveMe
		end
		send "h2 z"&$player~limpets&"*zc*"&$return_mac
		setVar $justCheckingIfAlive TRUE
		gosub :player~quikstats
		if (($TWARP = "No") OR ($player~current_sector <> $homesec))
			goto :callSaveMe
		end
		send $land_mac
		goto :select_boomsec
	end
	if ($TWARP = "No")
		goto :callSaveMe
	end

:continueOn
	getRnd $random 1 $databaseCount
	getWord $database $player~warpto $random
	if ($player~warpto = 0)
		send "'{" $switchboard~bot_name "} - Reorganized limpets in all sectors possible.*"
		halt
	end
	getDistance $distance $homesec $player~warpto
	if ($distance <= 0)
		send "^f"&$homesec&"*"&$player~warpto&"*q"
		waitOn "ENDINTERROG"
		getDistance $distance $homesec $player~warpto
	end

:clearit
	KillAllTriggers
	replaceText $database " "&$player~warpto&" " " "
	subtract $databaseCount 1
	if ($distance <= 2)
		goto :select_boomsec
	end
	if ($grid_warp = "twarp")
		gosub :doTwarp
	elseif ($grid_warp = "bwarp")
		gosub :bwarp
	else
		halt
	end


:hittingsec
	killalltriggers
	setVar $justCheckingIfAlive FALSE
	gosub :player~quikstats
	if (($TWARP = "No") OR ($player~current_sector <> $player~warpto))
		goto :callSaveMe
	end
	send $mac&$return_mac
	setVar $justCheckingIfAlive TRUE
	gosub :player~quikstats
	if (($TWARP = "No") OR ($player~current_sector <> $homesec))
		goto :callSaveMe
	end
	send $land_mac
	goto :select_boomsec



#-=-=-=-=- Find All Target Sectors -=-=-=-=-=-
:findAllTargetSectors
	setVar $targetSectorCount 1
	setVar $databaseCount 0
	setVar $database ""
	setVar $adjacentDatabase ""
	setVar $unload_sectors " "

	echo ANSI_14 "* Loading target sectors..*" ANSI_7
	setVar $perc 0

	getNearestWarps $nearest $player~current_sector
	setVar $i 1
	if ($nearest < $max_sectors)
		setVar $max_sectors $nearest
	end
	while (($i <= $nearest) AND ($databaseCount < $max_sectors))
		setVar $focus $nearest[$i]
		getWordPos $avoidedSectors $pos " "&$focus&" "
		getSectorParameter $focus "FIGSEC" $isFigged
		getSectorParameter $focus "MINESEC" $isArmided
		getSectorParameter $focus "LIMPSEC" $isLimped
		if ($isFigged = "")
			setVar $isFigged FALSE
		end
		if ($isLimped = "")
			setVar $isLimped FALSE
		end
		if ($isArmided = "")
			setVar $isArmided FALSE
		end
		setVar $isFound FALSE
		setVar $isFigAdjacent FALSE
		setVar $p 1
		while (SECTOR.WARPS[$focus][$p] > 0)
			setVar $temp SECTOR.WARPS[$focus][$p]
			getSectorParameter $temp "FIGSEC" $isFigAdjacent
			if ($isFigAdjacent <> TRUE)
				if (($isLimped = TRUE) AND ($isFigged = TRUE) AND ($pos <= 0))
					setVar $unload_sectors $unload_sectors&"  "&$focus&"  "
					setVar $isFound TRUE
				end
			end
			add $p 1
		end
		if ($isFound = FALSE)
			if (($isLimped = TRUE) AND ($isFigged = TRUE) AND ($pos <= 0))
				setVar $database $database&" "&$focus&" "
				add $databaseCount 1
			end
		end
		add $i 1

		setVar $percTest (($i * 100) / $max_sectors)
		if ($percTest > $perc)
			setVar $perc (($i * 100) / $max_sectors)
			echo "*"
			echo #27 "["&($perc / 2)&"C"
			echo ANSI_14 "°" ANSI_15 " " $perc "%" #27 & "[1A   "
		end

	end
	send "'{" $switchboard~bot_name "} - "&$databaseCount&" limpet sectors found.*"
return


#-=-=-=-=-=- assemble macro -=-=-=-=-=-=-=-=-
:assemble_mac
        setVar $mac ""
	#if ($grid_figs > 0)
	#	setVar $mac "f " & $grid_figs & "*cd"
	#end
	#if (($grid_armids > 0) AND ($player~armids > 0))
	#	setVar $mac $mac & "h1 z0*zc*"
	#end
	#if (($grid_limpets > 0) AND ($player~limpets > 0))
		setVar $mac $mac & "h2 z0*zc*"
	#end
return

:assemble_attack_mac
        setVar $attack_mac "* za" & $figs & "* jr * "
return

:assemble_return_mac
	setVar $return_mac $homesec & "* yy * * "
return

:assemble_land_mac
	setVar $land_mac "l j" & #8 & #8 & #8 & #8 & #8 & $planet~planet & "*  * j m  * * *  t * t 1* c * "
	#setVar $land_mac "l " & $planet~planet & "*  m  * * *  t * t 1*  c  "
return

# -=-=-=-=-=- return triggers -=-=-=-=-=-=-=-
:return_triggers
	setTextTrigger incit :incit "To which Sector"
	setTextTrigger igd :igd "An Interdictor Generator in this sector holds you fast!"
	setTextTrigger noturns :igd "Your ship was hit by a Photon and has been disabled"
	goSub :delayTrigger
	pause
:incit
	killAllTriggers
	return
:igd
	goto :callSaveMe


:landOnPlanetEnterCitadel
	send "l " $planet~planet "* c"
	waitOn "<Enter Citadel>"
	return
:leaveCitadelAndPlanet
	send "q q"
	waitOn "Blasting off from"
	waitOn "Command [TL"
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
	setVar $avoidedSectors $avoidedSectors&" "&$homesec&" "
	setVar $p 1
	while (SECTOR.WARPS[$homesec][$p] > 0)
		setVar $avoidedSectors $avoidedSectors&" "&SECTOR.WARPS[$homesec][$p]&" "
		add $p 1
	end
return


:delayTrigger
	setDelayTrigger delayUntilSaveMe :callSaveMe 5000
return

:xenter
	send "q y * t* * *" $password "*    *    *       za"&$figs&"*   z*   f z 1*  z c d *  "
return



#GETCOURSE SUB ###################################################################################################
:getCourses
	killalltriggers
	setVar $originalDestination $destination
	send "f*"&$destination&"*"
	getCourse $course $player~current_sector $destination
	setVar $index 1
	while ($index <= $course)
		if (($FIGHTER_GRID[$COURSE[$index]] <= 0) AND ($COURSE[$index] <> $originalDestination))
			setVar $destination $COURSE[$index]
                elseif ($COURSE[$index] <> $originalDestination)
		    	setVar $destination $originalDestination
		end
		add $index 1


	end

:noPath
	killAllTriggers
	return

#END GETCOURSE SUB ###################################################################################################


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


:attemptRefurb
:attempt_Refurb
	setVar $limpetCashNeeded ((($maxMines-$player~limpets)*$LIMPET_COST)+$LIMPET_REMOVAL_COST)
	setVar $armidCashNeeded ((($maxMines-$player~armids)*$ARMID_COST))
	setVar $cashNeeded ($limpetCashNeeded+$armidCashNeeded)
	setVar $furbing TRUE
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
	setVar $START_SECTOR $player~current_sector
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
			setVar $player~warpto $stardock
			gosub :DoTwarp
		elseif (($WeAreAdjDock = FALSE) AND ($RED_adj <> 0))
			setVar $player~warpto $RED_adj
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
		send "q tnt1* c "
	

return

:DoTwarp
	setVar $msg ""
	if ($player~warpto > 0)
		send "q q mz" & $player~warpto " * "
		setTextTrigger there        :adj_warp "You are already in that sector!"
		setTextLineTrigger adj_warp :adj_warp "Sector  : " & $player~warpto & " "
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
			setTextLineTrigger no_fuel 		:itwarpNoFuel "You do not have enough Fuel Ore"
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
			send "n*zn"
			send "l " & #8 & $planet~planet "*c"
			setSectorParameter $player~warpto "FIGSEC" FALSE
			setVar $temp " "&$player~warpto&" "
			replaceText $database $temp " "
			subtract $database_count 1
			goto :select_boomsec

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
				if ($furbing)
					setVar $str "y * * p s g y g q " 
				else
					setVar $str "y * *  " 
				end
				send $str
			else
				if ($furbing)
					setVar $str "y  *  *  m " & $STARDOCK & " *  *  p s g y g q "
				else
					setVar $str "y * *  " 
				end
				send $str
			end
		:twarpDone
			if ($msg <> "")
				send "'{" $switchboard~bot_name "} Twarp Error - " & $msg & "**"
			end
	end
	return

:bwarp

	killAllTriggers
	send "b" $player~warpto "*"
	setTextTrigger go :go5 "TransWarp Locked"
	setTextTrigger no :no5 "No locating beam found"
	goSub :delayTrigger
	pause

:no5
	killAllTriggers
	send "n "
	waitfor "Transporter shutting down."
	setVar $FIGHTER_GRID[$player~warpto] 0
	goto :select_boomsec

:go5
	killAllTriggers
	send "y z * "
	return

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


:callSaveMe
	send "q q q q * '"&$switchboard~bot_name&" call*"
	halt

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
	return

include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\player\findjumpsector\player"
