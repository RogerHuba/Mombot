loadVar $bot_name
loadVar $user_command_line
loadVar $parm1
loadVar $parm2
loadVar $parm3
loadVar $parm4
loadVar $parm5
loadVar $parm6
loadVar $parm7
loadVar $parm8
loadVar $stardock

loadVar $unlimitedGame
loadVar $ptradesetting
loadVar $bot_turn_limit
loadVar $command

	fileExists $doesHelpFileExist "scripts\mombot\help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\mombot\help\"&$command&".txt" "- "&$command&" [sector] {defend}                            " 
		write "scripts\mombot\help\"&$command&".txt" "     clears adjacent fighters and calls saveme              " 
		write "scripts\mombot\help\"&$command&".txt" "                                                            " 
		write "scripts\mombot\help\"&$command&".txt" "     - [defend] for offensive fighters,just enters/retreats "
		write "scripts\mombot\help\"&$command&".txt" "                                                            " 
		write "scripts\mombot\help\"&$command&".txt" "     - From Citadel prompt grabs fighters from planet       " 
		write "scripts\mombot\help\"&$command&".txt" "     - From Command prompt grabs fighters from the sector   " 
		send "'{" $bot_name "} - Writing help file for this command in Help directory.*"
	end
	

# ======================     START ADJACENT FIGHTER CLEAR (FIGCLEAR) SUBROUTINES     ==========================
:adjfig
	gosub :quikstats~quikstats
	setVar $startingLocation $quikstats~CURRENT_PROMPT
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
	        send "'{" $bot_name "} - Must start at Citadel or Command Prompt.*"
	        halt
	end
	setVar $pgridSector $parm1
	isNumber $test $pgridSector
	if ($test = 0)
		send "'{" $bot_name "} - Invalid FIGCLEAR number.*"
		halt
	end

	if ($pgridSector = 0)
		send "'{" $bot_name "} - Invalid FIGCLEAR number.*"
		halt
	end
	if ($pgridSector < 11)
		send "'{" $bot_name "} - Cannot FIGCLEAR into FedSpace!*"
		halt
	elseif ($pgridSector = $STARDOCK)
		send "'{" $bot_name "} - Cannot FIGCLEAR into STARDOCK!*"
		halt
	end
	if ($startingLocation = "Citadel")
		send "q"
		gosub :planetinfo~getPlanetInfo
		send "m * * * c "
	end
	if ($shipstats~SHIP_MAX_ATTACK <= 0)
		gosub :shipstats~getShipStats
	end
	
	getWordPos $user_command_line $pos "def"
	if ($pos > 0)
		setVar $defend TRUE
	else
		setVar $defend FALSE
	end

	setVar $i 1
	setVar $isFound false
	while (SECTOR.WARPS[$quikstats~current_Sector][$i] > 0)
		if (SECTOR.WARPS[$quikstats~current_Sector][$i] = $pgridSector)
			setVar $isFound TRUE
		end
		add $i 1
	end
	if ($isFound = FALSE)
		send "'{" $bot_name "} - Cannot FIGCLEAR.  Sector not Adjacent, aborting..*"
		halt
	end
	send "'{" $bot_name "} - Fig Clearing sector " & $pgridSector & "* c v* y* "&$pgridSector&"* q "
	setVar $mac "     * "
	setVar $i 1
	if ($defend = FALSE)
		while ($quikstats~FIGHTERS >= $shipstats~SHIP_MAX_ATTACK)
			setVar $mac $mac&"a z " & ($shipstats~SHIP_MAX_ATTACK-1) & "* * "
			add $i 1
			subtract $quikstats~FIGHTERS ($shipstats~SHIP_MAX_ATTACK-1)
		end
	end
	setVar $mac $mac & "j r * f  z  1  * z  c  d  * "

        :attackAdjSector
		gosub :quikstats~quikstats
		if ($quikstats~FIGHTERS < $shipstats~SHIP_FIGHTERS_MAX)
        	      send "'{" $bot_name "} - Unable to proceed, not enough fighters.*"
        	      halt
		end
		if ($startingLocation = "Citadel")
			send "Q Q * "
		end
		send "m " $pgridSector & $mac
        	gosub :quikstats~quikstats

		if ($quikstats~CURRENT_SECTOR = $pgridSector)
			send "'" & $pgridSector & "=saveme*"
			if ($startingLocation = "Citadel")
				setVar $i 0
		        	while ($i < 15)
		      		        add $i 1
					send "l j" & #8 & $planetinfo~PLANET & "*  *  "
				end
		        end
			send "'{" $bot_name "} - Successfully Fig Cleared sector " & $pgridSector & "*"
		else
	                if ($startingLocation = "Citadel")
				send "l j" & #8 & $planetinfo~PLANET & "*  *  "
	                	gosub :current_prompt
	                	if ($CURRENT_PROMPT = "Planet")
	                	        send "m* * *"
	                	else
				    	send "'{" $bot_name "} - Had to stop, planet appears to be gone.*"
	                	        halt
				end
			else
				send " F"
				waitOn "Your ship can support up to"
				getWord CURRENTLINE $ftrs_to_leave 10
				stripText $ftrs_to_leave ","
				stripText $ftrs_to_leave " "
				if ($ftrs_to_leave < 1)
					setVar $ftrs_to_leave 1
				end
				send " " & $ftrs_to_leave & " * C D "
			end
			goto :attackAdjSector
		end
	halt


:current_prompt
	setTextTrigger 	prompt		:allPromptsCatch	 	#145 & #8
	send #145
	pause

	:allPromptsCatch
		getWord CURRENTLINE $CURRENT_PROMPT 1
		if ($CURRENT_PROMPT = 0)
			getWord CURRENTANSILINE $CURRENT_PROMPT 1
		end
		stripText $CURRENT_PROMPT #145
		stripText $CURRENT_PROMPT #8
return
# ======================     END ADJACENT FIGHTER CLEAR (FIGCLEAR) SUBROUTINES     ==========================


include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\mombot\botIncludes\quikstats"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\mombot\botIncludes\planetinfo"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\mombot\botIncludes\pwarp"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\mombot\botIncludes\shipstats"
