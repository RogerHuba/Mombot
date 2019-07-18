:mow
		
		if ($PROMPT~startingLocation = "Citadel")
			send "q"
			gosub :PLANET~getPlanetInfo
			send "c "
		end
		if ($PROMPT~startingLocation = "Command")
			gosub :SHIP~getShipStats
			setVar $mow_SHIP_MAX_ATTACK $SHIP~SHIP_MAX_ATTACK
		elseif ($SHIP~SHIP_MAX_ATTACK <= 0)
			setVar $mow_SHIP_MAX_ATTACK 99991111
		else
			setVar $mow_SHIP_MAX_ATTACK $SHIP~SHIP_MAX_ATTACK
		end
		setVar $destination $BOT~parm1
		isNumber $number $destination
		if ($number <> 1)
			send "'{" $SWITCHBOARD~bot_name "} - Sector entered is not a number, cannot mow!*"
			return
		elseif (($destination <= 0) OR ($destination > SECTORS))
			send "'{" $SWITCHBOARD~bot_name "} - Sector entered is not valid, cannot mow!*"
			return
		end
		setVar $destination ($BOT~parm1+0)
		getWordPos " "&$BOT~user_command_line&" " $pos "kill"
		if ($pos > 0)
			setVar $mow_kill TRUE
		else
			setVar $mow_kill FALSE
		end
		getWordPos " "&$BOT~user_command_line&" " $pos "saveme"
		if ($pos > 0)
			setVar $mow_saveme TRUE
		else
			setVar $mow_saveme FALSE
		end
		getWordPos " "&$BOT~user_command_line&" " $pos " p "
		if ($pos > 0)
			setVar $are_we_docking TRUE
		else
			setVar $are_we_docking FALSE
		end
		setVar $figsToDrop $BOT~parm2
		isNumber $number $figsToDrop
		if ($number <> TRUE)
			setVar $figsToDrop 0
		else
			if ($figsToDrop > 50000)
				send "'{" $SWITCHBOARD~bot_name "} - Cannot drop more than 50,000 fighters per sector!*"
				return
			elseif ($figsToDrop > $FIGHTERS)
				send "'{" $SWITCHBOARD~bot_name "} - Fighters to drop cannot exceed total ship fighters.*"
				return
			end
		end
		if ($mow_SHIP_MAX_ATTACK > $FIGHTERS)
			setVar $mow_SHIP_MAX_ATTACK 9999
		end
		if ($CURRENT_SECTOR <> CURRENTSECTOR)
			setVar $CURRENT_SECTOR 0
		end
		gosub :getCourse
		setVar $j 2
		setVar $result "q q q * "
		while ($j <= $courseLength)
			if ($mowCourse[$j] <> $CURRENT_SECTOR)
				setVar $result $result&"m  "&$mowCourse[$j]&"*   "
				if (($mowCourse[$j] > 10) AND ($mowCourse[$j] <> $MAP~stardock))
					setVar $result $result&"za  "&$mow_SHIP_MAX_ATTACK&"* *  "
				end
				if (($figsToDrop > 0) AND ($mowCourse[$j] > 10) AND ($mowCourse[$j] <> $MAP~stardock) AND ($j > 2))
					setVar $result $result&"f "&$figsToDrop&" * c d "
					setVar $target $mowCourse[$j]
					gosub :addfigtodata
				end
				if (($j >= $courseLength) AND ($mow_saveme = TRUE) AND ($figstoDrop = 0))
					setVar $result $result&"f 1 * c d "
					setVar $target $mowCourse[$j]
					gosub :addfigtodata
				end
				if (($called = FALSE) AND ($mow_saveme = TRUE) AND ($j >= ($courseLength-2)))
					setVar $result $result&"'"&$destination&"=saveme*  "
					setVar $called TRUE
				end
			end
			add $j 1
		end
		setVar $docking_instructions ""
		if ($are_we_docking)
			setVar $docking_instructions " p z t *"
			if ($destination = $MAP~stardock)
				setVar $docking_instructions " p z s g y g q h *"
			end
			setVar $result $result & $docking_instructions
		elseif (($mow_saveme = TRUE) AND ($startingLocation = "Citadel"))
			setVar $i 0
			while ($i < 8)
				add $i 1
				#setVar $result $result&"l j" & #8 & $PLANET~PLANET & "*  *  "
				setVar $result $result&"l j" & #8 & $PLANET~PLANET & "*  *  j  c  *  *  "
			end
		end
		send $result
		gosub :quikstats
		if (($CURRENT_PROMPT = "Command") AND ($mow_kill = TRUE))
			setVar $startingLocation "Command"
			goSub :SECTOR~getSectorData
			goSub :fastAttack
		elseif ($CURRENT_PROMPT = "Planet")
			send "m * * * c "
			if ($mow_kill = FALSE)
				send "s* "
			else
				setVar $PROMPT~startingLocation "Citadel"
				gosub :scanit_cit_kill
			end
		elseif ($are_we_docking = FALSE)
			send "*"
		end
return
# ======================     END MOW SUBROUTINES     ==========================
