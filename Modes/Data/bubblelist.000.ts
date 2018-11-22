	reqRecording
	logging off
	loadVar $bot_name
	loadVar $unlimitedGame
	loadVar $ptradesetting
	loadVar $bot_turn_limit
	loadVar $user_command_line
	loadVar $parm1
	loadVar $parm2
	loadVar $parm3
	loadVar $parm4
	loadVar $parm5
	loadVar $parm6
	loadVar $parm7
	loadVar $parm8
	loadVar $command

	fileExists $doesHelpFileExist "scripts\MOMBot\Help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\MOMBot\Help\"&$command&".txt" " - "&$command&" {door} - List sectors for bubble." 
		send "'{" $bot_name "} - Writing help file for this command in Help directory.*"
	end
	setVar $BUBBLE_LIST "_"&GAMENAME&"_Bubble.list"

	gosub :current_prompt
	if (($CURRENT_PROMPT <> "Command") AND ($CURRENT_PROMPT <> "Citadel"))
		send "'{"&$bot_name&"} - Must be run from Command or Citadel prompt.*"
		halt		
	end
	setVar $validParm FALSE
	isNumber $test $parm1
	if ($test = true)
		if (($parm1 <= SECTORS) AND ($parm1 > 0))
			setVar $validParm TRUE
		end
	end
	if ($validParm = FALSE)
		send "'{"&$bot_name&"} - Invalid door sector entered.*"
		halt
	end
	DELETE $BUBBLE_LIST
	setVar $DOOR $parm1
	setSectorParameter $DOOR "DOOR" TRUE
	setSectorParameter $DOOR "BUBBLE" TRUE
	setVar $bubble_sectors " "

	setArray $bubble 1000
	setVar $i 11
	setVar $count 0
	setVar $perc 0
	while ($i <= SECTORS)
		if ($i <> $DOOR)
			getCourse $path $i 1 
			if ($path = "-1")
				send "/"
				waitOn #179
				echo ANSI_14 "Updating database...*" ANSI_7
				send "^f"&$i&"*1**q"
				waitOn "ENDINTERROG"
				getCourse $path $i 1 
			end
			setVar $j 1
			setVar $found_bubble_sector FALSE
			while ($j <= $path)
				if ($path[$j] = $DOOR)
					setVar $found_bubble_sector TRUE
				end
				add $j 1
			end
			if ($found_bubble_sector = TRUE)
					write $BUBBLE_LIST $i
					setSectorParameter $i "BUBBLE" TRUE
					setVar $bubble_sectors $bubble_sectors&" "&$i  
					add $count 1
			else
					#setSectorParameter $i "BUBBLE" ""
			end

		end
		setVar $percTest (($i * 100) / SECTORS)
		if ($percTest > $perc)
			setVar $perc (($i * 100) / SECTORS)
			echo "*"
			echo #27 "["&($perc / 2)&"C"
			echo ANSI_14 "°" ANSI_15 " " $perc "%" #27 & "[1A   "
		end
		add $i 1
	end

send "'*"&$count&" bubble sectors with door sector of "&$DOOR&": "&$bubble_sectors&"**"
halt


:current_prompt
    setTextTrigger      prompt          :allPromptsCatch        #145 & #8
    setDelayTrigger     prompt_delay    :current_prompt_delay   5000
    send #145
    pause
    :current_prompt_delay
        setTextOutTrigger   atkeys      :current_prompt_at_keys
        setDelayTrigger     prompt_delay    :verifyDelay        30000
        pause
    :current_prompt_at_keys
        getOutText $out
        send $out
        killtrigger prompt_delay
        return
    :allPromptsCatch
        killtrigger prompt_delay
        getWord CURRENTLINE $CURRENT_PROMPT 1
        if ($CURRENT_PROMPT = 0)
            getWord CURRENTANSILINE $CURRENT_PROMPT 1
        end
        stripText $CURRENT_PROMPT #145
        stripText $CURRENT_PROMPT #8
        setVar $startingLocation $CURRENT_PROMPT
return

