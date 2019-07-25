	reqRecording
	logging off
	loadVar $switchboard~bot_name
	loadVar $player~unlimitedGame
	loadVar $ptradesetting
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
	loadVar $command

	fileExists $doesHelpFileExist "scripts\mombot\help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\mombot\help\"&$command&".txt" " - "&$command&" {door} - List sectors for bubble." 
		send "'{" $switchboard~bot_name "} - Writing help file for this command in Help directory.*"
	end
	setVar $BUBBLE_LIST "_"&GAMENAME&"_Bubble.list"

	gosub :current_prompt
	if (($player~current_prompt <> "Command") AND ($player~current_prompt <> "Citadel"))
		send "'{"&$switchboard~bot_name&"} - Must be run from Command or Citadel prompt.*"
		halt		
	end
	setVar $validParm FALSE
	isNumber $test $bot~parm1
	if ($test = true)
		if (($bot~parm1 <= SECTORS) AND ($bot~parm1 > 0))
			setVar $validParm TRUE
		end
	end
	if ($validParm = FALSE)
		send "'{"&$switchboard~bot_name&"} - Invalid door sector entered.*"
		halt
	end
	DELETE $BUBBLE_LIST
	setVar $DOOR $bot~parm1
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
        getWord CURRENTLINE $player~current_prompt 1
        if ($player~current_prompt = 0)
            getWord CURRENTANSILINE $player~current_prompt 1
        end
        stripText $player~current_prompt #145
        stripText $player~current_prompt #8
        setVar $startingLocation $player~current_prompt
return

