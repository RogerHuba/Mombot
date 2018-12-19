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
	loadvar $ship~cap_file
	loadvar $planet~planet~planet_file

	setVar $BOT~help[1]  $BOT~tab&"Slingshot - Attempts to warp into sector and attack "
	setVar $BOT~help[2]  $BOT~tab&"Slingshot - Not a safe way to fly. "
	gosub :BOT~help_file

	setVar $PLAYER~save TRUE



	setVar $ENDLINE "_ENDLINE_"
	setVar $STARTLINE "_STARTLINE_"	
	setVar $fig_hit_test_front ": "
	setVar $fig_hit_test_back "'s"
	setVar $alien_ansi #27 & "[1;36m" & #27 & "["
	setVar $mid_attack_mac "* y  Q Q m "
	setVar $front_attack_mac "p "
	gosub :player~quikstats
	setVar $startingSector $player~current_sector
	

	send "q"
	gosub :PLANET~getPlanetInfo	


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
	send "l"&$planet~planet&"*  c  "
	waitOn "Citadel command"
	gosub :SHIP~getShipStats
	savevar $planet~planet
	setVar $enter_attack_mac "*    *  n z  a z " & ($SHIP~SHIP_MAX_ATTACK-1) & "9999" & "* *  "
	setVar $deploy_fig_mac "j r * f z 1 * z c d * "

	send "'Slingshot pulled back and ready!*"


		:startTargetingAdjacent
			killAllTriggers
			setTextTrigger limp :attackSectorLimpetAdjacent "Limpet mine in "
			setTextTrigger armid :attackSectorMineAdjacent "Your mines in "
			setTextTrigger fig :attackSectorFighterAdjacent "Deployed Fighters "
			pause
		:attackSectorMineAdjacent
			getText CURRENTANSILINE $alien_check $fig_hit_test_front $fig_hit_test_back
			getWordPos $alien_check $apos $alien_ansi
			if ($apos > 0)
				goto :startTargetingAdjacent
			end
			getWord CURRENTLINE $dropSector 4
			goto :getDropSectorAdjacent
		:attackSectorLimpetAdjacent
			getWord CURRENTLINE $dropSector 4
			goto :getDropSectorAdjacent
		:attackSectorFighterAdjacent
			getText CURRENTANSILINE $alien_check $fig_hit_test_front $fig_hit_test_back
			getWordPos $alien_check $apos $alien_ansi
			if ($apos > 0)
				goto :startTargetingAdjacent
			end
			getWord CURRENTLINE $dropSector 5
			
		:getDropSectorAdjacent
			stripText $dropSector ":"
			send $front_attack_mac&SECTOR.WARPS[$dropSector][1]&$mid_attack_mac&$dropSector&$enter_attack_mac&"'"&$dropSector&"=saveme*"&$deploy_fig_mac 
			setVar $i 0
			while ($i < 10)
				add $i 1
				send "l  j" & #8 & $planet~planet & "*  *  "
			end
			gosub :getSectorLocation
			if (($player~current_sector <> $dropSector))
				if ($player~current_sector = $startingSector)
					send "'No fig at pwarp location, no attempt made. Restart when ready.*"
				elseif ($player~current_sector = SECTOR.WARPS[$dropSector][1])
					send "'Possible SPLATTER on a planet, check for pod.*"
				else
					send "'Didn't make it, not sure what happened. Check ship and restart*"
				end
				halt
			end
			send "m * * * c "
			killalltriggers
			gosub :checkForVictimsFromCitadel
		halt


:getSectorLocation
	killalltriggers
	send "/"
	waitOn "Sect "
	getWord CURRENTLINE $player~current_sector 2
	replacetext $player~current_sector #179&"Turns" ""
return

:checkShip
	killAllTriggers 
	send "c;q"
	waitFor "Figs Per Attack:"
	getWord CURRENTLINE $ship~SHIP_MAX_ATTACK 5
return

:callSaveMe
	killAllTriggers
	send "*"
	waitFor "(?="
	getWord CURRENTLINE $prompt 1
	if ($prompt = "Citadel")
		echo "**Had to halt script, check ship to see if it is valid.**"
		halt
	end
	if ($prompt = "Computer") or ($prompt = "Corporate") or ($prompt = "NavPoint")
		send "q"
		waitFor "Command [TL"
	end	
	gosub :getSectorLocation
    	setVar $figstodeploy 1
	gosub :deployfigs 
	send "'" & $player~current_sector & "=saveme*"
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
        halt

    :friendlytwarp
        killalltriggers
        setVar $figstodeploy "ALL"
        gosub :deployfigs
        goto :waitforhelp

    :friendlyplanet
        killalltriggers
        getText CURRENTLINE $planet~planet "Saveme script activated - Planet " " to "
        send "L " & $planet~planet & "* C 'I landed on planet " & $planet~planet & "*"
        halt

    :towlocked
        killalltriggers
        setVar $figstodeploy 1
        gosub :deployfigs
        send "'Tow locked, get us out of here!*"
        halt


:deployfigs
    if ($figstodeploy = 0)
        setVar $figstodeploy 1
    end
    if (($player~current_sector  < 11) or ($player~current_sector  = STARDOCK))
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
        halt

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

:checkForVictimsFromCitadel
	gosub :sector~getSectorData
	if ($sector~corpieCount < $sector~realTraderCount)
		goSub :player~fastCitadelAttack
		goto :checkForVictimsFromCitadel
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

