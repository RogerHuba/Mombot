logging off
		gosub :BOT~loadVars
		loadVar $MAP~stardock


	setVar $BOT~help[1]  $BOT~tab&" Grabs all empty ships and brings them to your sector"
	setVar $BOT~help[2]  $BOT~tab&"                "
	setVar $BOT~help[3]  $BOT~tab&" getallships  {bubble} {+ship filter+}"
	setVar $BOT~help[4]  $BOT~tab&"                  "
	setVar $BOT~help[5]  $BOT~tab&"    Options:       "
	setVar $BOT~help[6]  $BOT~tab&"      [+ship filter+] - move ships only matching this filter"
	setVar $BOT~help[7]  $BOT~tab&"                   "
	setVar $BOT~help[8]  $BOT~tab&"           bubble - grabs bubble ships        "
	setVar $BOT~help[9]  $BOT~tab&"                    (default ignores BUBBLE sector param) "
	setVar $BOT~help[10] $BOT~tab&"                        "
	setVar $BOT~help[11] $BOT~tab&"              -  Can use either planet or SXX port in        "
	setVar $BOT~help[12] $BOT~tab&"                 starting sector for fuel."
	setVar $BOT~help[13]  $BOT~tab&"             -  Ship filter list can be comma delimited.    "
	gosub :bot~helpfile

	setVar $BOT~script_title "Get All Ships"
	gosub :BOT~banner


	getWordPos $bot~user_command_line $pos "bubble"
	if ($pos > 0)
		setVar $bubble TRUE
	else
		setVar $bubble FALSE
	end

	setvar $filterships ""
	setvar $grabbed " "
	#some stupid issue with twx where you can use quotes or single quotes in user command line 
	#unless there are multiple parameters guaranteed - so using + for this one script.
	getWordPos " "&$bot~user_command_line&" " $pos "+"
	if ($pos > 0)
		getText " "&$bot~user_command_line&" " $filterships "+" "+"
		if ($filterships = false)
			setVar $SWITCHBOARD~message "Invalid ship filter entered.*"
			gosub :SWITCHBOARD~switchboard
			halt			
		else
			splitText $filterships $shiptypes ","
			setVar $SWITCHBOARD~message "Moving all ships matching: ["&$filterships&"].*"
			gosub :SWITCHBOARD~switchboard
		end
	else
		setVar $SWITCHBOARD~message "Moving all ships back to this sector.*"
		gosub :SWITCHBOARD~switchboard
	end
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	send "** "
	setVar $fuelInSector FALSE
	if (($startingLocation <> "Citadel") AND ($startingSector <> "Planet"))
		if ($startingLocation = "Command")
			if ((PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = TRUE) AND (PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = FALSE))
				if ($player~credits < 50000)
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

		send "|x*"
		setTextLineTrigger statlinetrig :shipline "-----------------------------"
		settextlinetrigger enter :enter "[Pause]"
		setTextTrigger doneships :gotShips "Choose which ship to beam to (Q=Quit)"
		pause
		:enter
			send "*"
			settextlinetrigger enter :enter "[Pause]"
			pause

	:shipline
		setVar $line CURRENTLINE
		getWordPos $line $pos "Choose which ship to beam to (Q=Quit)"
		getWord $line $temp 2
		isNumber $result $temp
		getLength $line $length
		if ($length > 52)
			cuttext $line $shiptype 54 999
		end
		lowercase $shiptype
		if (($result = TRUE))
			if ($temp > 0)
				if ($filterships <> "")
					setvar $i 1
					setvar $shipfound false
					while ($i <= $shiptypes)
						getwordpos $shiptype $filterpos $shiptypes[$i]
						if ($filterpos > 0)
							setvar $shipfound true
						end
						add $i 1
					end
					if ($shipfound = true)
						getwordpos $grabbed $checkpos " "&$temp&" "
						if ($checkpos <= 0)
							add $shipCount 1
							setVar $theShips[$shipCount] $temp
							setvar $grabbed $grabbed&" "&$temp&" "
						end
					end
				else
					add $shipCount 1
					setVar $theShips[$shipCount] $temp
				end
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
		killtrigger statlinetrig
		killtrigger enter
		killtrigger doneships
		send "*|"
		if ($startingLocation <> "Command")
			send "l "&$planet~planet&"* c    "
		else
			if ($fuelInSector = true)
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
					setVar $BOT~user_command_line "moveship "&$theShips[$i]&" back silent "&#34&$filterships&#34&" "
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
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
