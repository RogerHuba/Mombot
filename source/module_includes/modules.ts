:clear
	gosub :PLAYER~QUIKSTATS
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	setVar $bot~validPrompts "Command Citadel"
	gosub :bot~checkStartingPrompt

	if ($startingLocation = "Citadel")
		send "q"
		gosub :PLANET~getPlanetInfo
		send "c  s*"
	else
		send "*"
	end
	setVar $beforeLimpets $PLAYER~LIMPETS
	setVar $beforeArmids  $PLAYER~ARMIDS
	setVar $placedLimpet FALSE
	setVar $placedArmid FALSE
	waitOn "Warps to Sector(s) :"
	setVar $limpetOwner SECTOR.LIMPETS.OWNER[$PLAYER~CURRENT_SECTOR]
	setVar $armidOwner SECTOR.MINES.OWNER[$PLAYER~CURRENT_SECTOR]
	if (($PLAYER~LIMPETS <= 0) AND (($limpetOwner <> "belong to your Corp") AND ($limpetOwner <> "yours")))
		setVar $SWITCHBOARD~message "Need limpets to clear this sector*"
		gosub :SWITCHBOARD~switchboard
		goto :BOT~wait_for_command
	end
	if (($PLAYER~ARMIDS <= 0) AND (($armidOwner <> "belong to your Corp") AND ($armidOwner <> "yours")))
		setVar $SWITCHBOARD~message "Need armids to clear this sector*"
		gosub :SWITCHBOARD~switchboard
		goto :BOT~wait_for_command
	end
	if ((($limpetOwner = "belong to your Corp") or ($limpetOwner = "yours")) and (($armidOwner = "belong to your Corp") or ($armidOwner = "yours")))
		setVar $SWITCHBOARD~message "Current Sector Already Clear of Enemy Mines!*"
		gosub :SWITCHBOARD~switchboard
		goto :BOT~wait_for_command
	end
	setvar $switchboard~message "Clearing Current Sector*"
	gosub :SWITCHBOARD~switchboard
	send "q qq z n *  "
	gosub :clear_sector_deployEquipment
	while (($placedLimpet = FALSE) OR ($placedArmid = FALSE))
		gosub :clear_sector_attemptClearingMines
	end
	if ($startingLocation = "Citadel")
		setVar $SWITCHBOARD~bot_name $bot~bot_name
		gosub :PLANET~landingSub
	end
	setSectorParameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
	setSectorParameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
	setvar $switchboard~message "Sector Cleared*"
	gosub :SWITCHBOARD~switchboard
		
	goto :BOT~wait_for_command
	:clear_sector_attemptClearingMines
		setVar $i 0
		while ($i < 10)
			gosub :clear_sector_xenter
			add $i 1
		end
		gosub :clear_sector_deployEquipment
		return
	:clear_sector_xenter
		send "q y n * t* * *" $password "*    *    *       za9999*   z*   "
		return
	:clear_sector_deployEquipment
		if ($player~surroundmine <= 0)
			setvar $player~surroundmine 1
		end
		if ($player~surroundlimp <= 0)
			setvar $player~surroundlimp 1
		end

		if ($PLAYER~ARMIDS < $player~surroundmine)
			setVar $minesToDeploy $PLAYER~ARMIDS
		else
			setVar $minesToDeploy $player~surroundmine
		end
		if ($PLAYER~LIMPETS < $player~surroundlimp)
			setVar $limpsToDeploy $PLAYER~LIMPETS
		else
			setVar $limpsToDeploy $player~surroundlimp
		end
		setVar $clearMac ""
		if (($armidOwner <> "belong to your Corp") AND ($armidOwner <> "yours"))
			setVar $clearMac $clearMac&"h  1  z " & $minesToDeploy & "*  z c  *  "
		end
		if (($limpetOwner <> "belong to your Corp") AND ($limpetOwner <> "yours"))
			setVar $clearMac $clearMac&"h  2  z " & $limpsToDeploy & "*  z c  *   "
		end
		send $clearMac
		gosub :PLAYER~quikstats
		if (($beforeLimpets > $PLAYER~LIMPETS) OR (($limpetOwner = "belong to your Corp") OR ($limpetOwner = "yours")))
			setVar $placedLimpet TRUE
		end
		if (($beforeArmids > $PLAYER~ARMIDS) OR (($armidOwner = "belong to your Corp") OR ($armidOwner = "yours")))
			setVar $placedArmid TRUE
		end
		return
goto :BOT~wait_for_command

:xenter
	gosub :PLAYER~quikstats
	isNumber $test $bot~parm1
	if ($test = FALSE)
		setVar $bot~parm1 1
	else
		if ($bot~parm1 <= 0)
			setVar $bot~parm1 1
		end
	end
	getWordPos $bot~user_command_line $pos "fill"
	if ($pos > 0)
		setVar $refill TRUE
	else
		setVar $refill FALSE
	end
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	setVar $BOT~validPrompts "Command Citadel"
	gosub :BOT~checkStartingPrompt
	if ($startingLocation = "Citadel")
		send "q m n t *"
		gosub :PLANET~getPlanetInfo
		send "c "
	end
:exit_xenter
	setVar $i 1
		if ($startingLocation = "Command")
			setvar $exit_mac "q y * "
			setvar $exit_enter " t* * *"&$BOT~password&"*    *    *       za9999*   z*   /"
		else
			setvar $exit_mac "r   y   * * "
			setvar $exit_enter " t* * *"&$BOT~password&"*    *    *    m * * *   q  *    *    *     za9999*   z*   f z1* z c d *  l j"&#8&$planet~planet&"* c  /"
		end

	while ($i <= $bot~parm1)
		killtrigger 1
		killtrigger 2
		send $exit_mac
		settexttrigger 1 :pickgame "Selection (? for menu)"
		settexttrigger 2 :enter_choice "Enter your choice:"
		pause
		:enter_choice

		killtrigger 1
		killtrigger 2
		send $exit_enter
		waitOn #179

		if ($startinglocation = "Command")
			if (($PLAYER~CURRENT_SECTOR > 10) and ($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK))
				if ($refill = TRUE)
					gosub :player~topoff
				else
					if ($i = $bot~parm1)
						if ($startingLocation = "Command")
							send "f z1* z c d * "
						end
					end
				end
			end
		end
		add $i 1
	end
	:doneExitEnter

	gosub :PLAYER~quikstats
	if ($bot~parm1 > 1)
		setVar $SWITCHBOARD~message "Exit Enter - " & $bot~parm1 & " times completed.*"
	else
		setVar $SWITCHBOARD~message "Exit Enter.*"
	end
	gosub :SWITCHBOARD~switchboard
	goto :BOT~wait_for_command


	:pickgame
		killtrigger 2
		send $BOT~letter&"  *  "
		waiton "[Pause]"
		send " * "
		goto :enter_choice
goto :BOT~wait_for_command

