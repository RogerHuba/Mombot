	gosub :BOT~loadVars
	setVar $BOT~command "clearfig"

	setVar $BOT~help[1]   $BOT~tab&"clearfig  [sector] {defend}  "
	setVar $BOT~help[2]   $BOT~tab&"      clears adjacent fighters and calls saveme  "
	setVar $BOT~help[3]   $BOT~tab&"      "
	setVar $BOT~help[4]   $BOT~tab&"   - [defend] for offensive fighters,just enters/retreats"
	setVar $BOT~help[5]   $BOT~tab&"      "
	setVar $BOT~help[6]   $BOT~tab&"    - From Citadel prompt grabs fighters from planet"
	setVar $BOT~help[7]   $BOT~tab&"    - From Command prompt grabs fighters from the sector "
	gosub :bot~helpfile

	setVar $BOT~script_title "Adjacent Fig Clear"
	gosub :BOT~banner

	setVar $PLAYER~save TRUE


	getSectorParameter SECTORS "FIGSEC" $isFigged

	

# ======================     START ADJACENT FIGHTER CLEAR (FIGCLEAR) SUBROUTINES     ==========================
:adjfig
	gosub :player~quikstats
	setVar $startingLocation $player~current_prompt
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
			setvar $switchboard~message "Must start at Citadel or Command Prompt.*"
			gosub :switchboard~switchboard
			halt
	end
	setVar $pgridSector $bot~parm1
	isNumber $test $pgridSector
	if ($test = 0)
		setVar $SWITCHBOARD~message "Invalid CLEARFIG sector.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($pgridSector = 0)
		setVar $SWITCHBOARD~message "Invalid CLEARFIG sector.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($pgridSector < 11)
		setVar $SWITCHBOARD~message "Cannot CLEARFIG into FedSpace!*"
		gosub :SWITCHBOARD~switchboard
		halt
	elseif ($pgridSector = $map~STARDOCK)
		setVar $SWITCHBOARD~message "Cannot CLEARFIG into STARDOCK!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($startingLocation = "Citadel")
		send "q"
		gosub :planet~getPlanetInfo
		send "m * * * c "
	end
	gosub :ship~getShipStats
	
	getWordPos $bot~user_command_line $pos "def"
	if ($pos > 0)
		setVar $defend TRUE
	else
		setVar $defend FALSE
	end

	setVar $i 1
	setVar $isFound false
	while (SECTOR.WARPS[$player~current_Sector][$i] > 0)
		if (SECTOR.WARPS[$player~current_Sector][$i] = $pgridSector)
			setVar $isFound TRUE
		end
		add $i 1
	end
	if ($isFound <> true)
		setVar $SWITCHBOARD~message "Cannot CLEARFIG.  Sector not Adjacent, aborting..*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $SWITCHBOARD~message "Fig Clearing sector " & $pgridSector & "*"
	gosub :SWITCHBOARD~switchboard

	#clear any possible avoid to the sector
	send "c v* y* "&$pgridSector&"* q "
	
	setVar $mac "     * "
	setVar $i 1
	if ($defend <> true)
		while ($player~FIGHTERS >= $ship~SHIP_MAX_ATTACK)
			setVar $mac $mac&"a z " & ($ship~SHIP_MAX_ATTACK-1) & "* * "
			add $i 1
			subtract $player~FIGHTERS ($ship~SHIP_MAX_ATTACK-1)
		end
	end
	setVar $mac $mac & "j r * f  z  1  * z  c  d  * "

	:attackAdjSector
		gosub :player~quikstats
		if ($player~FIGHTERS < $ship~SHIP_FIGHTERS_MAX)
			setVar $SWITCHBOARD~message "Unable to proceed, not enough fighters.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		if ($startingLocation = "Citadel")
			send "Q Q * "
		end
		send "m " $pgridSector & $mac & "'" & $pgridSector & "=saveme*"
		gosub :player~quikstats

		if ($player~CURRENT_SECTOR = $pgridSector)
			if ($startingLocation = "Citadel")
				setVar $i 0
				while ($i < 30)
					add $i 1
					send "l j" & #8 & $planet~planet & "*  *  "
				end
			end
			setVar $SWITCHBOARD~message "Successfully Fig Cleared sector " & $pgridSector & "*"
			gosub :SWITCHBOARD~switchboard
		else
			if ($startingLocation = "Citadel")
				send "l j" & #8 & $planet~planet & "*  *  "
				gosub  :player~currentPrompt
				if ($player~current_prompt = "Planet")
					send "m* * *"
				else
					setVar $SWITCHBOARD~message "Had to stop, planet appears to be gone.*"
					gosub :SWITCHBOARD~switchboard
					halt
				end
			else
				send " F"
				waitOn "Your ship can support up to"
				getWord CURRENTLINE $ftrs_to_leave 10
				stripText $ftrs_to_leave ","
				stripText $ftrs_to_leave "."
				stripText $ftrs_to_leave " "
				if ($ftrs_to_leave < 1)
					setVar $ftrs_to_leave 1
				end
				send " " & $ftrs_to_leave & " * C D "
			end
			goto :attackAdjSector
		end
	halt


# ======================     END ADJACENT FIGHTER CLEAR (FIGCLEAR) SUBROUTINES     ==========================

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\player\currentprompt\player"
