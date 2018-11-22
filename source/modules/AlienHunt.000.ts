	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"Hunts down aliens and captures their ships.  "
	setVar $BOT~help[2] $BOT~tab&"Will automatically turn ships and planet personal."
	setVar $BOT~help[3] $BOT~tab&"Will use shields on planet as well."
	setVar $BOT~help[4] $BOT~tab&"Best to use with a defender ship."
	setVar $BOT~help[5] $BOT~tab&"         "
	setVar $BOT~help[6] $BOT~tab&"Options: "
	setVar $BOT~help[7] $BOT~tab&"{off} - Turns off script and sets planet and ship corporate."
	gosub :BOT~help_file

	setVar $BOT~script_title "Alien Hunter"
	gosub :BOT~banner


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
	send "op**tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*m***cm0*co*pq"
	
	gosub :PLAYER~quikstats
	if ($PLAYER~CURRENT_PROMPT = "Citadel")
		setVar $SWITCHBOARD~message "Made ship and planet personal for convenience. Turning off military reaction.*"
		gosub :SWITCHBOARD~switchboard
	else
		setVar $SWITCHBOARD~message "Something went wrong during startup. Ship and planet should be personal now, so be careful.*"
		gosub :SWITCHBOARD~switchboard
	end

	setTextTrigger need_ig :planet_ig_was_off "Your Interdictor Generator is now ACTIVE"
	setTextTrigger skip_ig :skipplanetig "This Citadel does not have an Interdictor Generator."
	send "n"
	waitOn "Do you want to change this setting? (Y/N)"
	goto :skipplanetig

	:planet_ig_was_off
		send "y"
		setVar $SWITCHBOARD~message "Turning off planet IG.*"
		gosub :SWITCHBOARD~switchboard

	:skipplanetig
	killalltriggers

	send "ls0*la0*"
	setVar $SWITCHBOARD~message "Turning off quasar cannons.*"
	gosub :SWITCHBOARD~switchboard

	gosub :PLAYER~quikstats
	
	setVar $PLAYER~$surroundFigs 1
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
			send "'"&$SWITCHBOARD~bot_name&" xenter silent*"
			setEventTrigger		xenterended		:xenterended "SCRIPT STOPPED" "scripts\MomBot\Modes\General\xenter.cts"
			pause
			:xenterended
			send "s"
			send "'"&$SWITCHBOARD~bot_name&" moveship s silent*"
			setEventTrigger		moveshipended2		:moveshipended "SCRIPT STOPPED" "scripts\MomBot\Modes\Resource\moveship.cts"
			pause
			:moveshipended

			gosub :PLAYER~quikstats
			if ($startingSector <> $PLAYER~CURRENT_SECTOR)
				send "'"&$SWITCHBOARD~bot_name&" mow "&$startSector&" 1*"
				setEventTrigger		mowended		:mowended "SCRIPT STOPPED" "scripts\MomBot\Modes\Grid\mow.cts"
				pause
				:mowended
				gosub :PLANET~landingSub
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
