	gosub :BOT~loadVars
	setVar $parm1 $BOT~parm1
	setVar $parm2 $BOT~parm2
	setVar $parm3 $BOT~parm3
	setVar $parm4 $BOT~parm4
	setVar $parm5 $BOT~parm5
	setVar $parm6 $BOT~parm6
	setVar $parm7 $BOT~parm7
	setVar $parm8 $BOT~parm8
	loadVar $MAP~STARDOCK
	loadVar $MAP~home_sector
	setVar $user_command_line $BOT~user_command_line


	setVar $BOT~help[1]  $BOT~tab&"Hunts down aliens and captures their ships.  "
	setVar $BOT~help[2]  $BOT~tab&"Will automatically turn ships and planet personal."
	setVar $BOT~help[3]  $BOT~tab&"Will use shields on planet as well."
	setVar $BOT~help[4]  $BOT~tab&"Best to use with a defender ship."
	setVar $BOT~help[5]  $BOT~tab&"         "
	setVar $BOT~help[6]  $BOT~tab&"Options: "
	setVar $BOT~help[7]  $BOT~tab&"    {off} - Turns off script and sets planet and ship corporate."
	setVar $BOT~help[8]  $BOT~tab&"   {corp} - Doesn't turn everything personal."
	setVar $BOT~help[9]  $BOT~tab&"   {sell} - Sell everyship you capture at dock and deposit the cash."
	setVar $BOT~help[10] $BOT~tab&" {refuel} - Refuel planet if possible."
	setVar $BOT~help[11] $BOT~tab&"{upgrade} - Upgrade fuel port if possible."
	gosub :BOT~help_file

	setVar $BOT~script_title "Alien Hunter"
	gosub :BOT~banner

	setVar $PLAYER~save TRUE

	setVar $START_FIG_HIT "Deployed Fighters Report Sector "
	setVar $END_FIG_HIT   ":"
    setVar $ALIEN_ANSI    #27 & "[1;36m" & #27 & "["
    setVar $START_FIG_HIT_OWNER ":"
	setVar $END_FIG_HIT_OWNER "'s"
	setVar $CAP_FILE	"_MOM_" & GAMENAME & ".ships"



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

	if ($parm1 = "off")
		send "qoccco*cq"
		waitOn "<Computer deactivated>"
		setVar $SWITCHBOARD~message "Alien hunter shutting down.  Making ship and planet corporate again.*"
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

	gosub :PLAYER~getInfo
	setVar $homesector $PLAYER~CURRENT_SECTOR
    	
	killalltriggers	
	send "q"
	gosub :PLANET~getPlanetInfo	

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
	send "l"&$PLANET~PLANET&"*"
	waitOn "Planet command"
	if ($corp <> true)
		send "op**tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*m***cm0*co*pq"
	else
		send "**tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*m***cm0*"
	end	
	gosub :PLAYER~quikstats
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

	send "*ls0*la0*"
	setVar $SWITCHBOARD~message "Turning off quasar cannons.*"
	gosub :SWITCHBOARD~switchboard

	if ($sell = true)
		setVar $SWITCHBOARD~message "Selling every ship after capture.  Will deposit money in the citadel.*"
		gosub :SWITCHBOARD~switchboard
	end

	gosub :PLAYER~quikstats
	
	loadvar $PLAYER~surroundFigs 
	if ($PLAYER~surroundFigs <= 0)
		setvar $PLAYER~surroundFigs 1
	end
	setVar $PLAYER~onlyAliens TRUE
	setVar $PLAYER~cappingAliens TRUE
	setVar $PLAYER~defenderCapping TRUE
	setVar $PLAYER~surroundAvoidShieldedOnly TRUE

    fileExists $SHIP~cap_file_chk $SHIP~cap_file
    if ($SHIP~cap_file_chk <> TRUE)
        gosub :SHIP~getShipCapStats
    end

    if ($SHIP~SHIP_OFFENSIVE_ODDS <= 0)
        gosub :SHIP~getShipStats
    end

	while (TRUE)
		gosub :PLAYER~quikstats
		if ($PLAYER~FIGHTERS < $SHIP~SHIP_FIGHTERS_MAX)
			setVar $SWITCHBOARD~message "Not enough fighters to continue the hunt.*"
			send "p"&$homeSector&"*y"
			send "'"&$SWITCHBOARD~bot_name&" scrub seek*"
			halt
		end
		setVar $lastTarget ""
		setVar $thisTarget ""

		echo "*Waiting for something to hunt..*"
		:BOT~restart
		gosub :validateFighterHit
		gosub :attackandmoveship
		gosub :dosurround
	end
	halt

:validateFighterHit
	setTextLineTrigger fig :checkFighter "Deployed Fighters Report Sector"
	setTextLineTrigger liftsoff :pwarpConfirmed " lifts off from "
	gosub :BOT~disconnect_triggers
	pause



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
		if ($dropSector <> $CURRENT_SECTOR)
			send "p " $dropSector "*y"
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
		echo "No Targets..*"
		setVar $targetSectors[1] $CURRENT_LOCATION
	end

return
:attemptDrop
	
	if ($targetCount > 0)
		getRnd $randomTarget 1 $targetCount
		setVar $gotoSector $targetSectors[$randomTarget]
		setVar $warpto $gotoSector
		gosub :dopwarp
	end
	
return

:dopwarp
    send "p" $warpTo "*y"
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
        setVar $target $warpto
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
		    gosub :PLAYER~quikstats
		    if (($PLAYER~TURNS <= $BOT~bot_turn_limit) and ($PLAYER~unlimitedGame <> TRUE))
	                setVar $SWITCHBOARD~message "Turns Exceed Bot Turn Limit.*"
	        		gosub :SWITCHBOARD~switchboard
	                halt
	        end
	        send "q "
	        gosub :PLANET~getPlanetInfo
	        send "q "
			gosub :PLAYER~surround
            gosub :PLANET~landingSub
	        setVar $SWITCHBOARD~message "Surrounded sector "&$PLAYER~CURRENT_SECTOR&".*"
	        gosub :SWITCHBOARD~switchboard
	        echo "*" & ANSI_14 & $PLAYER~surroundOutput & "*" & ANSI_7

return

:attackandmoveship
		send "q q q* * "
		gosub :PLAYER~quikstats
		setVar $SECTOR~fakeTraderCount 1
		setVar $SECTOR~federalCount 0
		setVar $targetsFound FALSE
		while ($SECTOR~fakeTraderCount > $SECTOR~federalCount)
		    goSub :SECTOR~getSectorData
		    if ($SECTOR~fakeTraderCount > $SECTOR~federalCount)
		    	setVar $targetsFound TRUE
		    end
		    goSub :PLAYER~fastCapture
		end
		gosub :PLANET~landingSub
		send "q m*** c "
		gosub :PLAYER~quikstats
		setVar $startingSector $PLAYER~CURRENT_SECTOR
		if ($PLAYER~SHIELDS < $SHIP~SHIP_SHIELD_MAX)
			setVar $shields_needed ($SHIP~SHIP_SHIELD_MAX - $PLAYER~SHIELDS)
			setVar $planet_shields_to_take ($shields_needed/10)
			send "gf"&$planet_shields_to_take&"*"
		end
		if ($targetsFound = TRUE)

			send "s*  "
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
			
			setVar $emptyShips SECTOR.SHIPCOUNT[$PLAYER~CURRENT_SECTOR]
			if ($emptyShips > 0)
				setvar $i 1
				setvar $found_keeper false
				while ($i <= $emptyShips)
					setvar $ship_name SECTOR.SHIPS[$player~current_sector][$i]
					lowercase $ship_name
					getwordpos $ship_name $pos "alien starship"
					if ($pos > 0)
						setvar $found_keeper true
					end
					add $i 1
				end
				setVar $BOT~command "moveship"
				loadVar $MAP~stardock
				if ($found_keeper = true)
					setVar $BOT~user_command_line " moveship h silent"
					setVar $BOT~parm1 $MAP~home_sector
				else
					setVar $BOT~user_command_line " moveship "&$MAP~stardock&" sell dep silent"
					setVar $BOT~parm1 $MAP~stardock
				end
				saveVar $BOT~parm1
				saveVar $BOT~command
				saveVar $BOT~user_command_line
				load "scripts\mombot\modes\resource\moveship.cts"
				setEventTrigger		moveshipended2		:moveshipended "SCRIPT STOPPED" "scripts\mombot\modes\resource\moveship.cts"
				pause
				:moveshipended
				gosub :PLAYER~quikstats
				if ($startingSector <> $PLAYER~CURRENT_SECTOR)
					setVar $BOT~command "mow"
					setVar $BOT~user_command_line " mow "&$startSector&" 1"
					setVar $BOT~parm1 $startSector
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
		end
		if ($startingSector = $player~current_sector)
			if ($refuel = true)
				if ($upgrade)
					killAllTriggers
					gosub :PLAYER~quikstats
					send "q"
					waitOn "Planet command (?"
					gosub :PLANET~getPlanetInfo
					send "c"
					setVar $total_creds_needed (300*7000)
					if ($total_creds_needed > $PLAYER~CREDITS)
						setVar $cashonhand $PLANET~citadel_credits
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
					gosub :PLAYER~quikstats
					gosub :PLANET~landOnPlanetEnterCitadel
				end
				if (($PLANET~planet_fuel_max-$PLANET~planet_fuel) < $totalPortFuel)
					setVar $turnsToEmpty (($PLANET~planet_fuel_max-$PLANET~planet_fuel)/$PLAYER~TOTAL_HOLDS)
					add $totalHolds ($PLANET~planet_fuel_max-$PLANET~planet_fuel)
					setVar $isDone TRUE
				else
					setVar $turnsToEmpty ($totalPortFuel/$PLAYER~TOTAL_HOLDS)
					add $totalHolds $totalPortFuel
				end
				setVar $PLAYER~buyobject "f"
				setVar $PLAYER~buytype "s"
				setVar $PLAYER~buydownRoundsFromParam $turnsToEmpty
				gosub :PLAYER~buy
				gosub :PLAYER~quikstats
				send "c r*q "
				
				if ($PLAYER~exit_message <> "Normal Exit")
					setVar $SWITCHBOARD~message $PLAYER~exit_message&"*"
					gosub :SWITCHBOARD~switchboard
				end
				if (($PLAYER~unlimitedGame = FALSE) AND (($PLAYER~turns-$turnsToEmpty) <= $BOT~bot_turn_limit))
					setVar $SWITCHBOARD~message "Turns too low to continue.*"
	        		gosub :SWITCHBOARD~switchboard
					halt	        
				end

			end
		end
		killalltriggers
return

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"

