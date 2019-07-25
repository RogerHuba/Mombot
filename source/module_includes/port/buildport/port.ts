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
	if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = TRUE)
		setvar $switchboard~message "Already a port in sector!*"
		gosub :switchboard~switchboard
		halt
	end


	if (($bot~user_command_line = "") OR ($bot~user_command_line = "0"))
		setvar $port_name "Mind ()ver Matter"
	else
		setvar $port_name $bot~user_command_line
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
	send "q q q z n * o3y" $port_name "*"
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
