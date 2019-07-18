logging off
		gosub :BOT~loadVars
	setVar $parm1 $BOT~parm1
	setVar $parm2 $BOT~parm2
	setVar $parm3 $BOT~parm3
	setVar $parm4 $BOT~parm4
	setVar $parm5 $BOT~parm5
	setVar $parm6 $BOT~parm6
	setVar $parm7 $BOT~parm7
	setVar $parm8 $BOT~parm8
	setVar $user_command_line $BOT~user_command_line
	loadVar $MAP~stardock


	setVar $BOT~help[1] $BOT~tab&"Grabs all empty ships and brings them to your sector"
	setVar $BOT~help[2] $BOT~tab&"                "
	setVar $BOT~help[3] $BOT~tab&"getallships  {bubble}"
	setVar $BOT~help[4] $BOT~tab&"                  "
	setVar $BOT~help[5] $BOT~tab&"    Options:       "
	setVar $BOT~help[6] $BOT~tab&"           bubble - grabs bubble ships        "
	setVar $BOT~help[7] $BOT~tab&"                    (default ignores bubble sectors) "
	setVar $BOT~help[8] $BOT~tab&"                        "
	setVar $BOT~help[9] $BOT~tab&"           Can use either planet or SXX port in        "
	setVar $BOT~help[10] $BOT~tab&"           starting sector for fuel."
	gosub :BOT~help_file

	setVar $BOT~script_title "Get All Ships"
	gosub :BOT~banner


	getWordPos $user_command_line $pos "bubble"
	if ($pos > 0)
		setVar $bubble TRUE
	else
		setVar $bubble FALSE
	end

	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	send "** "
	setVar $fuelInSector FALSE
	if (($startingLocation <> "Citadel") AND ($startingSector <> "Planet"))
		if ($startingLocation = "Command")
			if ((PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = TRUE) AND (PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = FALSE))
				if ($CREDITS < 50000)
					setVar $SWITCHBOARD~message "Need at least 50,000 credits to use port as fuel source*"
					gosub :SWITCHBOARD~switchboard
				end
				setVar $fuelInSector TRUE
			else
				setVar $i 1
				setVar $isFound false
				while (SECTOR.WARPS[$PLAYER~CURRENT_Sector][$i] > 0)
					if (SECTOR.WARPS[$PLAYER~CURRENT_Sector][$i] = $moveSector)
						setVar $isFound TRUE
					end
					add $i 1
				end
				if ($isFound = FALSE)
					setVar $SWITCHBOARD~message "No fuel port in sector, cannot run from Command Prompt*"
					gosub :SWITCHBOARD~switchboard
					halt
				end
			end
		else
			setVar $SWITCHBOARD~message "Must be in Command, Citadel or Planet prompt to run*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
	end

	if ($startingLocation = "Citadel")
		send "s* q "
	end

	setVar $shipCount 0
	if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
		gosub :PLANET~GETPLANETINFO
		send "q "
	end
	send "*"
	gosub :PLAYER~quikstats
	setVar $startSector $PLAYER~CURRENT_SECTOR
	setVar $figcnt SECTOR.FIGS.QUANTITY[$startSector]
	setVar $figowner SECTOR.FIGS.OWNER[$startSector]
	if (($figcnt = 0) OR (($figOwner <> "belong to your Corp") AND ($figOwner <> "yours")))
		setVar $SWITCHBOARD~message "No friendly fighters deployed in current sector!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $SWITCHBOARD~message "Starting ship scan..*"
	gosub :SWITCHBOARD~switchboard
	:tryshipscan
		send "|xnq*@|"
		setTextLineTrigger statlinetrig :shipline "-----------------------------"
		setTextLineTrigger towalreadyon :continuetowon "You shut off your Tractor Beam."
		setTextLineTrigger doneships :gotShips "Average Interval Lag:"
		pause
		:continuetowon
			killtrigger statlinetrig
			killtrigger doneships
			goto :tryshipscan

	:shipline
		killtrigger towalreadyon
		setVar $line CURRENTLINE
		getWordPos $line $pos "Average Interval Lag:"
		getWord $line $temp 2
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
		killtrigger getline
		if ($startingLocation <> "Command")
			send "l "&$PLANET~PLANET&"* c    "
		else
			if ($fuelInSector)
				send " p t * * 0 * * 0 * * 0 * * "
			end
		end

		killtrigger statlinetrig
		killtrigger towalreadyon
		killtrigger doneships
		setVar $i 1
		setVar $sectors_done "  "
		loadVar $MAP~stardock
		while ($i <= $shipCount)
			getWordPos $sectors_done $pos " "&$theShips[$i]&" "
			if (($theShips[$i] > 0) AND ($pos <= 0))

				getsectorparameter $theShips[$i] "BUBBLE" $isBubble

				if ((($bubble = TRUE) AND ($isBubble = TRUE)) OR (($bubble = FALSE) AND ($isBubble <> TRUE)))
					setVar $sectors_done $sectors_done&" "&$theShips[$i]&" "
					setVar $BOT~command "moveship"
					setVar $BOT~user_command_line "moveship "&$theShips[$i]&" back silent "
					setVar $BOT~parm1 $theShips[$i]
					setVar $BOT~parm2 "back"
					saveVar $BOT~parm1
					saveVar $BOT~parm2
					saveVar $BOT~command
					saveVar $BOT~user_command_line
					stop "scripts\mombot\modes\resource\moveship.cts"
					gosub :PLAYER~quikstats
					setEventTrigger		moveshipended2		:moveshipended "SCRIPT STOPPED" "scripts\mombot\modes\resource\moveship.cts"
					load "scripts\mombot\modes\resource\moveship.cts"
					pause
					:moveshipended
				end
			end
			add $i 1
		end
		setVar $SWITCHBOARD~message "All ships moved successfully.*"
		gosub :SWITCHBOARD~switchboard

halt
# ============================== END Move Ship (moveship) Sub ==============================


#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet\getplanetinfo\planet"
