logging off
	gosub :BOT~loadVars
	loadVar $ptradesetting

	setVar $BOT~help[1]   $BOT~tab&"- "&$command&"                                              " 
	setVar $BOT~help[2]   $BOT~tab&"                                                            " 
	setVar $BOT~help[3]   $BOT~tab&"    Strips fighters from all empty ships and deploys them   " 
	setVar $BOT~help[4]   $BOT~tab&"    into the sector.                                        " 
	gosub :bot~helpfile

# ============================== START Move Ship (moveship) Sub ==============================
:emptyships
	killalltriggers
	gosub :player~quikstats
	setVar $startShip $player~ship_number
	setVar $startingLocation $player~current_prompt
	setVar $total_figs 0
	send "** "
	setVar $fuelInSector FALSE
	if (($startingLocation <> "Citadel") AND ($startingSector <> "Planet") AND ($startingLocation <> "Command"))
		setvar $switchboard~message "Must be in Command, Citadel or Planet prompt to run*"
		gosub :switchboard~switchboard
		halt
	end

	if ($startingLocation = "Citadel")
		send "q "
	end
	setVar $shipCount 0
	if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
		gosub :planet~getplanetinfo
		send "q "
	end
	setvar $switchboard~message "Ship Stripper starting up!  Starting ship scan..*"
	gosub :switchboard~switchboard
	:tryshipscan
		send "wnq*@"
		setTextLineTrigger statlinetrig :shipline "-----------------------------------------------------------------------------"
		setTextLineTrigger towalreadyon :continuetowon "You shut off your Tractor Beam."
		pause
		:continuetowon
			killtrigger statlinetrig
			goto :tryshipscan

	:shipline
		killtrigger towalreadyon
		setVar $line CURRENTLINE
		getWordPos $line $pos "Average Interval Lag:"
		getWord $line $temp 1
		isNumber $result $temp
		if (($result = TRUE))
			if ($temp > 0)
				add $shipCount 1
				setVar $theShips[$shipCount] $temp
			end
		end
		if ($pos > 0)
			goto :gotShips
		else
			setTextLineTrigger getLine :shipline
			pause
		end


	:gotShips
		setvar $switchboard~message "Found "&$shipCount&" empty ships to strip.*"
		gosub :switchboard~switchboard
		setVar $i 1
		while ($i <= $shipCount)
			if ($theShips[$i] > 0)
				send "x "&$theShips[$i]&"*   *   "
				gosub :player~quikstats
				send " F"
				waitOn " fighters available."
				getWord CURRENTLINE $ftrs_to_leave 3
				stripText $ftrs_to_leave ","
				stripText $ftrs_to_leave " "
				if ($ftrs_to_leave > 0)
					send " " & $ftrs_to_leave & " * C D"
					add $total_figs $ftrs_to_leave
				end
			end
			add $i 1
		end
		send "x "&$startShip&"*  *   "
		if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
			gosub :planet~landingSub
		end
		setvar $switchboard~message "Done stripping empty ships.*"
		gosub :switchboard~switchboard		
halt
# ============================== END Move Ship (moveship) Sub ==============================
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\planet\landingsub\planet"
