:destroyport
	gosub :PLAYER~quikstats
	setVar $bot~startingLocation $PLAYER~CURRENT_PROMPT
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	setVar $bot~validPrompts "Citadel Command"
	gosub :bot~checkStartingPrompt

	if ($startinglocation = "Command")
		send "** "
		waitOn "Warps to Sector(s)"
	else
		if ($planet~planet = "0")
			send "q"
			gosub :PLANET~getPlanetInfo
			send "m*** cs* "
			gosub :PLAYER~quikstats
		end
	end
	if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] <> TRUE)
		setvar $switchboard~message "No port in sector!*"
		gosub :switchboard~switchboard
		halt
	end
	gosub :SHIP~getShipStats

	if (PORT.EXISTS[$player~current_sector] = TRUE)
		:keepDestroying
		killtrigger 1
		killtrigger 2
		killtrigger 3
		killtrigger 4
		gosub :PLAYER~quikstats
		if ($PLAYER~FIGHTERS >= $SHIP~SHIP_MAX_ATTACK)
			if ($startinglocation = "Citadel")
				send "q q q * *  "
			end
			send "p"
			setTextTrigger 1 :portAlreadyGone "Captain! Are you sure you want to port here?"
			setTextTrigger 2 :continueDestroy "<A> Attack this Port"
			pause
			:continueDestroy
			killtrigger 1
			killtrigger 2
			killtrigger 3
			killtrigger 4
			send " a y "&$SHIP~SHIP_MAX_ATTACK&"** "
			if ($startinglocation = "Citadel")
				send "l "&$planet~planet&"* m * * * q "
			end
			setTextTrigger 1 :keepDestroying "Incoming laser barrage from"
			setTextTrigger 2 :doneDestroying "You destroyed the Star Port!"
			pause
			:doneDestroying
			:portAlreadyGone
				send "*   "
				if ($startinglocation = "Citadel")
					send "l "&$planet~planet&"* c s*  "
				end
				killtrigger 1
				killtrigger 2
				killtrigger 3
		killtrigger 4

		setVar $SWITCHBOARD~message "Port Destroyed.*"
				gosub :SWITCHBOARD~switchboard

		else
			setVar $SWITCHBOARD~message "Not enough fighters.  Better reload before the you blow up this port.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
	end
halt