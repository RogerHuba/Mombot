	gosub :BOT~loadVars
									loadVar $MAP~STARDOCK
	loadVar $MAP~home_sector
		loadvar $ship~cap_file
	loadvar $planet~planet_file

	gosub :combat~init 


	setVar $BOT~help[1]  $BOT~tab&"Hunts down aliens and captures their ships.  "
	setVar $BOT~help[2]  $BOT~tab&"Will automatically turn ships and planet personal."
	setVar $BOT~help[3]  $BOT~tab&"Will use shields on planet as well."
	setVar $BOT~help[4]  $BOT~tab&"Best to use with a defender ship."
	setVar $BOT~help[5]  $BOT~tab&"         "
	setVar $BOT~help[6]  $BOT~tab&"Options: "
	setVar $BOT~help[7]  $BOT~tab&"          {off} - Turns off script and sets planet and ship corporate."
	setVar $BOT~help[8]  $BOT~tab&"         {corp} - Doesn't turn everything personal."
	setVar $BOT~help[9]  $BOT~tab&"         {sell} - Sell everyship you capture at dock and deposit the cash."
	setVar $BOT~help[10] $BOT~tab&"       {refuel} - Refuel planet if possible."
	setVar $BOT~help[11] $BOT~tab&"      {upgrade} - Upgrade fuel port if possible."
	setVar $BOT~help[12] $BOT~tab&"       {cannon} - Will reset cannon levels after hunting alien."
	setVar $BOT~help[13] $BOT~tab&"       {return} - Return to starting sector after each hunt."
	setVar $BOT~help[14] $BOT~tab&"      {passive} - Surround passively when hunting."
	setVar $BOT~help[15] $BOT~tab&"         {home} - Move ships to starting sector instead of stardock."
	setVar $BOT~help[16] $BOT~tab&"{"&#34&"ship filter"&#34&"} - move ships matching this home, stardock for the others"
	gosub :bot~helpfile
 
	setVar $BOT~script_title "Alien Hunter"
	gosub :BOT~banner

	setVar $PLAYER~save TRUE

	setVar $START_FIG_HIT "Deployed Fighters Report Sector "
	setVar $END_FIG_HIT   ":"
	setVar $ALIEN_ANSI    #27 & "[1;36m" & #27 & "["
	setVar $START_FIG_HIT_OWNER ":"
	setVar $END_FIG_HIT_OWNER "'s"
	
	Window alienhunt_script 560 170 ("Alienhunt - " & GAMENAME) ONTOP


	getSectorParameter SECTORS "FIGSEC" $isFigged
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

	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($PLAYER~current_prompt <> "Citadel")
		setVar $SWITCHBOARD~message "Must run alien hunter commands from citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($bot~parm1 = "off")
		send "qoccco*cq"
		waitOn "<Computer deactivated>"
		setVar $SWITCHBOARD~message "Alien hunter shutting down.  Making ship and planet corporate again.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($player~photons > 0)
		setVar $SWITCHBOARD~message "Please pick a ship with no photons.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	getwordpos $bot~user_command_line $pos "corp"
	if ($pos > 0)
		setvar $corp true
	else
		setvar $corp false
	end

	getwordpos $bot~user_command_line $pos "refuel"
	if ($pos > 0)
		setvar $refuel true
	else
		setvar $refuel false
	end

	getwordpos $bot~user_command_line $pos "upgrade"
	if ($pos > 0)
		setvar $upgrade true
	else
		setvar $upgrade false
	end

	getwordpos $bot~user_command_line $pos "sell"
	if ($pos > 0)
		setvar $sell true
	else
		setvar $sell false
	end

	getwordpos $bot~user_command_line $pos "cannon"
	if ($pos > 0)
		setvar $cannon true
	else
		setvar $cannon false
	end

	getwordpos $bot~user_command_line $pos "passive"
	if ($pos > 0)
		setvar $passive true
	else
		setvar $passive false
	end

	getwordpos $bot~user_command_line $pos "return"
	if ($pos > 0)
		setvar $return true
	else
		setvar $return false
	end

	getwordpos $bot~user_command_line $pos "home"
	if ($pos > 0)
		setvar $home true
	else
		setvar $home false
	end
	setvar $filterships ""
	getWordPos $bot~user_command_line $pos #34
	if ($pos > 0)
		getText $bot~user_command_line $filterships #34 #34
		if ($filterships = false)
			setVar $SWITCHBOARD~message "Invalid ship filter entered.*"
			gosub :SWITCHBOARD~switchboard
			halt			
		else
			setVar $SWITCHBOARD~message "Moving all ships matching: ["&$filterships&"], and bringing them home.*"
			gosub :SWITCHBOARD~switchboard
		end
	end



	

	gosub :PLAYER~getInfo
	setVar $homesector $PLAYER~CURRENT_SECTOR
		
	killalltriggers	
	send "q"
	gosub :PLANET~getPlanetInfo	
	gosub :setwindow
	setvar $starting_sector_cannon $planet~SECTOR_CANNON
	setvar $starting_atmos_cannon $planet~ATMOSPHERE_CANNON
	setvar $sector_total ((($planet~planet_FUEL * $starting_sector_cannon) / 100)/3)

	setTextTrigger need_ig :ig_was_off "Your Interdictor generator is now OFF"
	setTextTrigger skip_ig :skipig "is not equipped with an Interdictor Generator"
	send "q q q q* b"
	waitOn "Do you wish to change it? (Y/N)"
	send "*"
	goto :skipig

	:ig_was_off
		send "y"
		setVar $SWITCHBOARD~message "Turning on ship IG.*"
		gosub :SWITCHBOARD~switchboard

	:skipig
	killalltriggers
	send "l"&$planet~planet&"*"
	waitOn "Planet command"
	if ($corp <> true)
		send "op**tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*m***cm0*co*pq"
	else
		send "**tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*m***cm0*"
	end	

	if ($cannon = false)
		send "*ls0*la0*"
		setVar $SWITCHBOARD~message "Turning off quasar cannons.*"
		gosub :SWITCHBOARD~switchboard
	end
	gosub :PLAYER~currentprompt
	if ($PLAYER~CURRENT_PROMPT = "Citadel")
		if ($corp <> true)
			setVar $SWITCHBOARD~message "Made ship and planet personal for convenience. Turning off military reaction.*"
		else
			setVar $SWITCHBOARD~message "Keeping planet and ship corporate for safety. Might be annoying. Turning off military reaction.*"
		end
		gosub :SWITCHBOARD~switchboard
	else
		setVar $SWITCHBOARD~message "Something went wrong during startup. Ship and planet should be personal now, so be careful.*"
		gosub :SWITCHBOARD~switchboard
	end

	#setTextTrigger need_ig :planet_ig_was_off "Your Interdictor Generator is now ACTIVE"
	#setTextTrigger skip_ig :skipplanetig "This Citadel does not have an Interdictor Generator."
	#send "n"
	#waitOn "Do you want to change this setting? (Y/N)"
	goto :skipplanetig

	:planet_ig_was_off
		send "y"
		setVar $SWITCHBOARD~message "Turning off planet IG.*"
		gosub :SWITCHBOARD~switchboard

	:skipplanetig
	killalltriggers


	if ($sell = true)
		setVar $SWITCHBOARD~message "Selling every ship after capture.  Will deposit money in the citadel.*"
		gosub :SWITCHBOARD~switchboard
	end

	gosub :PLAYER~quikstats

	loadvar $PLAYER~surroundFigs 
	if ($PLAYER~surroundFigs <= 0)
		setvar $PLAYER~surroundFigs 1
	end
	if ($passive = true)
		setvar $player~surroundPassive true
	end
	setVar $PLAYER~onlyAliens TRUE
	setVar $PLAYER~cappingAliens TRUE
	setVar $PLAYER~defenderCapping TRUE
	setVar $PLAYER~surroundAvoidShieldedOnly TRUE

	loadvar $ship~CAP_FILE	
	fileExists $CAP_FILE_chk $ship~CAP_FILE
	if ($CAP_FILE_chk)
		gosub :ship~loadshipinfo
	else
		gosub :ship~getShipCapStats
		gosub :ship~loadShipInfo
	end 

	if ($SHIP~SHIP_OFFENSIVE_ODDS <= 0)
		gosub :SHIP~getShipStats
	end

	while (TRUE)
		#gosub :PLAYER~quikstats
		if (CURRENTFIGHTERS < $SHIP~SHIP_FIGHTERS_MAX)
			setVar $SWITCHBOARD~message "Not enough fighters to continue the hunt.*"
			gosub :switchboard~switchboard
			send "p"&$homeSector&"*y"
			send "'"&$SWITCHBOARD~bot_name&" scrub seek*"
			if ($cannon = true)
				send " *ls"&$percentToSet&"* la"&$starting_atmos_cannon&"*"  
			end
			send "qoccco*cq"
			waitOn "<Computer deactivated>"

			halt
		end
		if ($return = true)
			send "p"&$homeSector&"*y"
		end
		if ($cannon = true)
			setVar $percentToSet (((3*$sector_total)*100)/$planet~planet_FUEL)
			if (((($planet~planet_FUEL * $percentToSet) / 100)/3) < $cannonDamage)
				add $percentToSet 1
			end
			if ($percentToSet > 100)
				setVar $percentToSet 100
			end

			send " *ls"&$percentToSet&"* la"&$starting_atmos_cannon&"*"  

		end
		setVar $lastTarget ""
		setVar $thisTarget ""

		gosub :attackandmoveship

		setvar $switchboard~message "* Waiting for something to hunt..*"
		gosub :bot~echo 

		:bot~restart
		gosub :validateFighterHit
		gosub :attackandmoveship
		gosub :dosurround
		gosub :attackandmoveship
	end
	halt

:validateFighterHit
	send "q "
	gosub :planet~getplanetinfo
	gosub :setwindow
	send "c "
	if ($planet~planet_fighters <= $SHIP~SHIP_FIGHTERS_MAX)
		send "p"&$map~home_sector&"*y  "
		send "qoccco*cq"
		waitOn "<Computer deactivated>"
		setVar $SWITCHBOARD~message "Alien hunter shutting down.  Making ship and planet corporate again.  Check to make sure I made it home.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setTextLineTrigger fig :checkFighter "Deployed Fighters Report Sector"
	setTextTrigger armid :attackSectorMine "Your mines in "
	setTextLineTrigger liftsoff :pwarpConfirmed " lifts off from "
	setTextLineTrigger 	warps 	:pwarpConfirmed 	"warps into the sector."
	setTextLineTrigger 	power 	:pwarpConfirmed 	"is powering up weapons systems!"
	settextlinetrigger  wave    :pwarpConfirmed    " launches a wave of fighters at the "
	
	gosub :bot~disconnecttriggers
	pause

	:attackSectorMine
		gosub :validateMineHit
		if ($isValid = true)
			goto :go_to_drop_sector
		else
			setTextTrigger armid :attackSectorMine "Your mines in "
			pause
		end
	pause
	:checkFighter
		killalltriggers

		cutText CURRENTLINE&" " $radio 1 1
		getText CURRENTLINE $dropSector $START_FIG_HIT $END_FIG_HIT
		getText CURRENTANSILINE $alien_check $START_FIG_HIT_OWNER $END_FIG_HIT_OWNER
		getWordPos $alien_check $apos $ALIEN_ANSI
		if (($apos <= 0) OR ($radio <> "D"))
			setTextLineTrigger fig :checkFighter "Deployed Fighters Report Sector"
			pause
		end
	:go_to_drop_sector
		if ($dropSector <> $player~current_sector)
			send "*ls0* la0*  p " $dropSector "*y"
			setTextLineTrigger pwarpNotOk :pwarpTryAdjacent "You do not have any fighters in Sector "
			setTextLineTrigger pwarpOk :pwarpConfirmed " Planetary TransWarp Drive Engaged! "
			setTextLineTrigger pwarpOk2 :pwarpConfirmed "You are already in that sector!"
			pause
			
			:pwarpDone
				killAllTriggers
		end
		:pwarpTryAdjacent
			killAllTriggers
			setSectorParameter $dropSector "FIGSEC" FALSE
			gosub :findAdjacent
			gosub :attemptDrop
			gosub :dosurround
			send "p " $dropSector "*y"
			return
		:pwarpConfirmed
			killalltriggers
			gosub :dosurround
			gosub :attackandmoveship
			setVar $i 1
			if ($dropSector <= 0)
				setvar $dropsector $player~current_sector
			end
			setVar $checkSector SECTOR.WARPS[$dropSector][$i]
			while ($checkSector > 0)
				send "p " $checkSector "*y"
				gosub :attackandmoveship
				add $i 1
				setVar $checkSector SECTOR.WARPS[$dropSector][$i]
			end

return
:findAdjacent
	getSectorParameter $dropSector "FIGSEC" $isFigged
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
		setvar $switchboard~message " No Targets..*"
		gosub :bot~echo 
		setVar $targetSectors[1] $CURRENT_LOCATION
	end

return
:attemptDrop
	
	if ($targetCount > 0)
		getRnd $randomTarget 1 $targetCount
		setVar $gotoSector $targetSectors[$randomTarget]
		setVar $player~warpto $gotoSector
		gosub :dopwarp
	end
	
return

:dopwarp
	send "p" $player~warpto "*y"
	setTextLineTrigger pwarp_lock       :pwarp_lock     "Locating beam pinpointed"
	setTextLineTrigger no_pwarp_lock    :no_pwarp_lock  "Your own fighters must be"
	setTextLineTrigger already      :already    "You are already in that sector!"
	setTextLineTrigger no_ore       :no_ore     "You do not have enough Fuel Ore"
	setTextLineTrigger No_pwarp     :noPwarp    "This Citadel does not have a Planetary TransWarp"
	setTextLineTrigger wrong_number     :wrong_number   "Invalid Sector number,"
	pause
	:wrong_number
		killalltriggers
		setVar $SWITCHBOARD~message "Not a valid sector to pwarp to!*"
		gosub :SWITCHBOARD~switchboard
		return
		
	:noPwarp
		killalltriggers
		setVar $SWITCHBOARD~message "Planet Does Not Have A Planetary TransWarp Drive!*"
		gosub :SWITCHBOARD~switchboard
		return
	:no_pwarp_lock
		killalltriggers
		setVar $target $player~warpto
		setSectorParameter $gotoSector "FIGSEC" FALSE
		return
	:no_ore
		killalltriggers
		setVar $SWITCHBOARD~message "Not enough fuel for that pwarp.*"
		gosub :SWITCHBOARD~switchboard
		return
	:pwarp_lock
		killalltriggers
		waitOn "Planet is now in sector"
		setVar $target $gotoSector
		return
	:already
		killalltriggers
return

:dosurround
		
	
		setVar $BOT~command "dscan"
		setVar $BOT~user_command_line " dscan silent"
		setVar $BOT~parm1 "silent"
		saveVar $BOT~parm1
		saveVar $BOT~command
		saveVar $BOT~user_command_line
		load "scripts\mombot\commands\data\dscan.cts"
		setEventTrigger		dscandone		:dscandone "SCRIPT STOPPED" "scripts\mombot\commands\data\dscan.cts"
		pause
		:dscandone
		
			send "q "
			gosub :PLANET~getPlanetInfo
			gosub :setwindow
			send "q "
			gosub :grid~surround
			send "l "&$planet~planet&"* m*** c "
			setVar $SWITCHBOARD~message "Surrounded sector "&$PLAYER~CURRENT_SECTOR&".*"
			gosub :SWITCHBOARD~switchboard
			setvar $switchboard~message "* " & ANSI_14 & $PLAYER~surroundOutput & "*" & ANSI_7
			gosub :bot~echo

return

:attackandmoveship
		gosub :PLAYER~currentprompt
		setvar $startingLocation $player~current_prompt
		if ($player~current_prompt = "Command")
			gosub :PLANET~landingSub		
			gosub :PLAYER~currentprompt
		end
		setVar $SECTOR~federalCount 0
		setvar $SECTOR~fakeTraderCount 1
		setVar $targetsFound FALSE
		while ($SECTOR~fakeTraderCount > $SECTOR~federalCount)
			gosub :PLAYER~currentprompt
			setvar $player~startingLocation $player~current_prompt
			if ($player~current_prompt = "Command")
				gosub :PLANET~landingSub		
				gosub :PLAYER~currentprompt
				setvar $player~startingLocation $player~current_prompt
			end
			goSub :SECTOR~getSectorData			
			if ($SECTOR~realTraderCount > $SECTOR~corpieCount)
				setvar $targetsFound true
				gosub :combat~fastCitadelAttack
				send "'Just attacked (and hopefully killed) a trader in my sector! Sector "&$player~current_sector&".*"
			end
			if ($SECTOR~fakeTraderCount > $SECTOR~federalCount)
				setVar $targetsFound TRUE
				goSub :combat~fastCapture
			end
		end
		gosub :PLAYER~currentprompt
		if ($player~current_prompt = "Command")
			gosub :PLANET~landingSub
		end
		send "q m*** c "
		gosub :PLAYER~quikstats
		setVar $startingSector $PLAYER~CURRENT_SECTOR
		if ($PLAYER~SHIELDS < $SHIP~SHIP_SHIELD_MAX)
			setVar $player~shields_needed ($SHIP~SHIP_SHIELD_MAX - $PLAYER~SHIELDS)
			setVar $planet~planet_shields_to_take ($player~shields_needed/10)
			send "gf"&$planet~planet_shields_to_take&"*"
		end
		if ((CURRENTTURNS <= $BOT~bot_turn_limit) and ($PLAYER~unlimitedGame <> TRUE))
			setVar $SWITCHBOARD~message "Turns Exceed Bot Turn Limit.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end

		if ($targetsFound = TRUE)

			send "s*  "
			waiton "Warps to Sector(s) : "
			setVar $figowner SECTOR.FIGS.OWNER[$player~current_sector]
			setVar $figCount SECTOR.FIGS.QUANTITY[$player~current_sector]

			if (($figcount <= 0) or (($figOwner <> "belong to your Corp") AND ($figOwner <> "yours")))
				setVar $BOT~command "xenter"
				setVar $BOT~user_command_line " xenter silent"
				setVar $BOT~parm1 "silent"
				saveVar $BOT~parm1
				saveVar $BOT~command
				saveVar $BOT~user_command_line
				load "scripts\mombot\commands\grid\xenter.cts"
				setEventTrigger		xenterended		:xenterended "SCRIPT STOPPED" "scripts\mombot\commands\grid\xenter.cts"
				pause
				:xenterended
			end		
			setVar $emptyShips SECTOR.SHIPCOUNT[$PLAYER~CURRENT_SECTOR]
			if ($emptyShips > 0)
				setVar $BOT~command "moveship"
				loadVar $MAP~stardock
				if ($filterships <> "")
					setVar $BOT~user_command_line " moveship h silent "&#34&$filterships&#34
					setVar $BOT~parm1 $MAP~home_sector
					saveVar $BOT~parm1
					saveVar $BOT~command
					saveVar $BOT~user_command_line
					load "scripts\mombot\modes\resource\moveship.cts"
					setEventTrigger		moveshipended2		:movehomeshipended "SCRIPT STOPPED" "scripts\mombot\modes\resource\moveship.cts"
					pause
					:movehomeshipended
				end
				if ($sell)
					if ($home = true)
						setVar $BOT~user_command_line " moveship "&$homesector&" silent"
						setVar $BOT~parm1 $homesector
					else
						setVar $BOT~user_command_line " moveship "&$MAP~stardock&" sell dep silent"
						setVar $BOT~parm1 $MAP~stardock
					end
				else
						setVar $BOT~user_command_line " moveship "&$MAP~stardock&" silent"
						setVar $BOT~parm1 $MAP~stardock						
				end
				saveVar $BOT~parm1
				saveVar $BOT~command
				saveVar $BOT~user_command_line
				load "scripts\mombot\modes\resource\moveship.cts"
				setEventTrigger		moveshipended2		:moveshipended "SCRIPT STOPPED" "scripts\mombot\modes\resource\moveship.cts"
				pause
				:moveshipended
				if ($startingSector <> currentsector)
					setVar $BOT~command "mow"
					setVar $BOT~user_command_line " mow "&$startingSector&" 1"
					setVar $BOT~parm1 $startingSector
					saveVar $BOT~parm1
					saveVar $BOT~command
					saveVar $BOT~user_command_line
					load "scripts\mombot\modes\grid\mow.cts"
					setEventTrigger		mowended		:mowended "SCRIPT STOPPED" "scripts\mombot\modes\grid\mow.cts"
					pause
					:mowended
					gosub :PLANET~landingSub
				end
			end
			
			#gosub :PLAYER~quikstats
			
			if ($startingSector = currentsector)
				killalltriggers
				setvar $is_fuel_buyer PORT.BUYFUEL[$startingSector]
				setvar $is_port PORT.EXISTS[$startingSector]
				setvar $class PORT.CLASS[$startingSector]
				getSectorParameter $startingSector "BUSTED" $isBusted

				if (($refuel = true) and ($is_fuel_buyer <> true) and ($is_port = true) and ($class > 0) and ($isBusted <> true))
					if ($upgrade = true)
						killAllTriggers
						send "q"
						waitOn "Planet command (?"
						gosub :PLANET~getPlanetInfo
						gosub :setwindow
						send "c"
						setVar $total_creds_needed (300*7000)
						if ($total_creds_needed > $PLAYER~CREDITS)
							setVar $cashonhand $planet~CITADEL_CREDITS
							add $cashonhand $PLAYER~CREDITS
							if ($cashonhand > $total_creds_needed)
									send "T T " & $PLAYER~CREDITS & "* "
									send "T F " & $total_creds_needed & "* "
									setVar $PLAYER~CREDITS $total_creds_needed
								end
						end
						send "q q *O 1"
						waitOn ", 0 to quit)"
						getWord CURRENTLINE $upgradeAmount 9
						stripText $upgradeAmount "("
						send $upgradeAmount&"* * *CR*Q"
						waitOn "What sector is the port in? ["&$PLAYER~CURRENT_SECTOR&"]"
						setTextLineTrigger getFuel2 :fuelDuring "Fuel Ore"
						pause
						:fuelDuring
							killalltriggers
							getWord CURRENTLINE $totalPortFuel 4
							waitOn "<Computer deactivated>"
						gosub :PLAYER~currentprompt
						gosub :PLANET~landOnPlanetEnterCitadel
					end
					if (($planet~planet_fuel_max-$planet~planet_fuel) < $totalPortFuel)
						setVar $player~turnsToEmpty (($planet~planet_fuel_max-$planet~planet_fuel)/$player~total_holds)
						add $totalHolds ($planet~planet_fuel_max-$planet~planet_fuel)
						setVar $isDone TRUE
					else
						setVar $player~turnsToEmpty ($totalPortFuel/$player~total_holds)
						add $totalHolds $totalPortFuel
					end
					setVar $PLAYER~buyobject "f"
					setVar $PLAYER~buytype "s"
					setVar $PLAYER~buydownRoundsFromParam $player~turnsToEmpty
					gosub :player~buy
					gosub :PLAYER~currentprompt
					send "c r*q "
					
					if ($PLAYER~exit_message <> "Normal Exit")
						setVar $SWITCHBOARD~message $PLAYER~exit_message&"*"
						gosub :SWITCHBOARD~switchboard
					end
					if (($PLAYER~unlimitedGame = FALSE) AND (($PLAYER~turns-$player~turnsToEmpty) <= $BOT~bot_turn_limit))
						setVar $SWITCHBOARD~message "Turns too low to continue.*"
						gosub :SWITCHBOARD~switchboard
						halt	        
					end

				end
			end

		end
		killalltriggers
return

:validateMineHit
	setVar $isValid FALSE
	cutText CURRENTLINE&"    " $ck 1 1
	if ($ck <> "Y")
		return
	end
	getText CURRENTLINE $dropSector "Your mines in " " did"
	getText CURRENTANSILINE&"[][][]" $alien_check "Your mines in" "[][][]"
	getWordPos CURRENTLINE $pos " damage to "
	getWordPos $alien_check $apos $ALIEN_ANSI
	if (($apos > 0) OR ($pos = 0))
		return
	end
	setVar $isValid TRUE
return


:setWindow
	setVar $msg "*   Current Sector: " & $PLAYER~CURRENT_SECTOR&"                            "
	cutText $msg $msg 1 30
	if ($player~unlimitedGame = true)
		setVar $msg $msg & "   Turns: Unlimited"
	else
		setVar $msg $msg & "   Turns: " & $PLAYER~TURNS
	end
	setarray $window_lines 7
	setvar $window_lines[1] "* Alienhunt Planet: " & $planet~planet
	setvar $window_lines[2] "* ---------------------------------------------------------------"
	format $planet~planet_fuel $player~value NUMBER
	setvar $window_lines[3] "*      Planet Fuel: " & $player~value&"                          "
	cutText $window_lines[3] $window_lines[3] 1 30
	format $planet~planet_fighters $player~value NUMBER
	setvar $window_lines[4] "   Planet Fighters: " & $player~value
	format $planet~planet_shields $player~value NUMBER
	setvar $window_lines[5] "*   Planet Shields: " & $player~value&"                          "
	cutText $window_lines[5] $window_lines[5] 1 30
	format $planet~citadel_credits $player~value NUMBER
	setvar $window_lines[6] "   Citadel Credits: " & $player~value
	format $player~fighters $player~value NUMBER
	setvar $window_lines[7] "*    Ship Fighters: " & $player~value&"*"

	setvar $i 1
	while ($i <= 7)
		setvar $msg $msg&$window_lines[$i]
		add $i 1
	end
	setWindowContents alienhunt_script $msg 
	setVar $window_content $msg 
	replaceText $window_content "*" "[][]"
	saveVar $window_content
return



#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\bot_includes\combat\init\combat"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\currentprompt\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipcapstats\ship"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\ship\loadshipinfo\ship"
include "source\module_includes\bot\disconnecttriggers\bot"
include "source\bot_includes\grid\surround\grid"
include "source\bot_includes\planet\landingsub\planet"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastcitadelattack\combat"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\planet\landonplanetentercitadel\planet"
include "source\bot_includes\player\buy\player"
