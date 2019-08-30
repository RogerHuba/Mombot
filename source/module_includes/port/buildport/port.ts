:buildport
	killalltriggers
	gosub :PLAYER~quikstats
	setVar $bot~startingLocation $PLAYER~CURRENT_PROMPT
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	setVar $bot~validPrompts "Citadel Command"
	gosub :bot~checkStartingPrompt

	if ($startinglocation = "Command")
		send "** "
		waitOn "Warps to Sector(s)"
	else
		send "q"
		gosub :PLANET~getPlanetInfo
		send "m*** cs* "
		gosub :PLAYER~quikstats
	end

		setvar $line $bot~user_command_line
		echo "*[["&$line&"]]*"
		setvar $line "[BEGINNING]"&$line
		echo "*[["&$line&"]]*"
		striptext $line "[BEGINNING]"&" port "
		echo "*[["&$line&"]]*"
		setvar $port_name $line
		echo "*[["&$port_name&"]]*"
	if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = TRUE)
		setvar $switchboard~message "Already a port in sector!*"
		gosub :switchboard~switchboard
		halt
	end
	if (SECTOR.PLANETCOUNT[$PLAYER~CURRENT_SECTOR] <= 0)
		setvar $switchboard~message "Need a planet in sector to build a port!*"
		gosub :switchboard~switchboard
		halt
	end


	if ($bot~user_command_line = " port ")
		setvar $port_name "Mind ()ver Matter"
	else
		setvar $line $bot~user_command_line
		setvar $line "[BEGINNING]"&$line
		striptext $line "[BEGINNING]"&" port "
		setvar $port_name $line
	end
	killalltriggers

	if ($startinglocation = "Citadel")
		if ($PLAYER~CREDITS < 50000)
				send "T F 50000*"
		end
	end
	gosub :PLAYER~quikstats
	if ($PLAYER~CREDITS < 50000)
			setVar $SWITCHBOARD~message "Not Enough Credits to Make Ports*"
			gosub :switchboard~switchboard
			halt
	end
	send "q q q z n * o"
	settextlinetrigger 3 :blownup "Rad levels are way too high to build here!"
	settexttrigger 4 :portready "What Class of port do you want to build?"
	pause

	:blownup
		killtrigger 4
		setvar $switchboard~message "Port is already destroyed here!*"
		gosub :switchboard~switchboard
		setvar $fail true
	:portready
		killtrigger 3
		send "3y" $port_name "*"
		killtrigger 1
		killtrigger 2
		setvar $fail false
		settextlinetrigger 1 :too_many "Sorry... All of the StarPort Licenses have been granted."
		settextlinetrigger 2 :build_success "For building this Starport, you receive"
		pause
	:too_many
		setvar $switchboard~message "Too many ports in the universe!*"
		gosub :switchboard~switchboard
		setvar $fail true
	:build_success
		if ($fail = false)
			setvar $switchboard~message "Port successfully created!*"
			gosub :switchboard~switchboard
		end
	killtrigger 1
	killtrigger 2
	if ($startinglocation = "Citadel")
		send "l " & #8 & $PLANET~PLANET & "*  c  s* "
   end

return
