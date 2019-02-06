	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"Quasar Report"
	setVar $BOT~help[2] $BOT~tab&"  - Will display cannon shots based on current settings."
	setVar $BOT~help[3] $BOT~tab&"  qreport {planet1} {planet2} ... {planetx}"
	gosub :BOT~help_file
	loadVar $game~mbbs

	
# ======================     START CANNON CALCULATOR (QREPORT) SUBROUTINE    ==========================
:cannonCalculator
	gosub :player~quikstats
	setVar $startingLocation $player~CURRENT_PROMPT
	if ($startingLocation <> "Command")
		setvar $switchboard~message "Cannon Calculator must be run from command prompt*"
		gosub :switchboard~switchboard
		halt
	end
	setArray $cannonPlanet 100
	setArray $cannonFuel 100
	setArray $cannonPercent 100
	setVar $cannonPlanetCount 0
	getWord $bot~user_command_line $temp 1	
	while ($temp <> 0)
		add $cannonPlanetCount 1
		setVar $cannonPlanet[$cannonPlanetCount] $temp
		getWord $bot~user_command_line $temp $cannonPlanetCount+1
	end
	if ($cannonPlanetCount <= 0)
		setvar $switchboard~message "No planet numbers entered*"
		gosub :switchboard~switchboard
		halt
	end
	setVar $planet~planetMemory " "
	setVar $i 1
	while ($i <= $cannonPlanetCount)
		getWordPos $planet~planetMemory $pos " "&$cannonPlanet[$i]&" "
		if ($pos > 0)

		else
			setVar $planet~planetMemory $planet~planetMemory&" "&$cannonPlanet[$i]&" "
			send "l "&$cannonPlanet[$i]&"** "
			setTextLineTrigger wrongPlanet :badPlanet "That planet is not in this sector."
			setTextLineTrigger badPlanet :badPlanet "Invalid registry number, landing aborted."
			setTextLineTrigger goodPlanet :goodPlanet "Claimed by:"
			pause
			:badPlanet
				setvar $switchboard~message "Planet number "&$cannonPlanet[$i]&" entered not valid. *"
				gosub :switchboard~switchboard

				halt
			:goodPlanet
				killtrigger wrongplanet
				killtrigger badplanet
				gosub :planet~getPlanetInfo
				send "q "
				setVar $cannonFuel[$i] $planet~planet_FUEL
				setVar $cannonPercent[$i] $planet~SECTOR_CANNON


		end

		add $i 1
	end
	setVar $count 1
	setVar $quasarOutput "'*"
	setVar $quasarOutput $quasarOutput&"{"&$bot~bot_name&"}    Sector Quasar Report    {"&$bot~bot_name&"}*  (Planet "
	setVar $i 1
	while ($i <= $cannonPlanetCount)
		if (($i = $cannonPlanetCount) AND ($i > 1))
			setVar $quasarOutput $quasarOutput&" and "&$cannonPlanet[$i]&")*"
		elseif ($i = $cannonPlanetCount)
			setVar $quasarOutput $quasarOutput&$cannonPlanet[$i]&")*"
		elseif ($i = 1)
			setVar $quasarOutput $quasarOutput&$cannonPlanet[$i]
		else
			setVar $quasarOutput $quasarOutput&", "&$cannonPlanet[$i]
		end
		add $i 1
	end
	while ($count <= 5)
		setVar $cannonDamage 0
		setVar $i 1
		while ($i <= $cannonPlanetCount)
			if ($game~mbbs)
				add $cannonDamage ((($cannonFuel[$i] * $cannonPercent[$i]) / 100)/2)
			else
				add $cannonDamage ((($cannonFuel[$i] * $cannonPercent[$i]) / 100)/3)
			end
			subtract $cannonFuel[$i] (($cannonFuel[$i] * $cannonPercent[$i]) / 100)
			if ($cannonFuel[$i] < 0)
				setVar $cannonFuel[$i] 0
			end
			add $i 1
		end

		setVar $formattedCannonDamage ""
		getLength $cannonDamage $length
		while ($length > 3)
			cutText $cannonDamage $snippet $length-2 9999
			cutText $cannonDamage $cannonDamage 1 $length-3
			getLength $cannonDamage $length
			setVar $formattedCannonDamage ","&$snippet&$formattedCannonDamage
		end
		setVar $formattedCannonDamage $cannonDamage&$formattedCannonDamage
		setVar $quasarOutput $quasarOutput&"  Shot "&$count&": "&$formattedCannonDamage&" points of damage.*"
		add $count 1
	end
	setVar $quasarOutput $quasarOutput&"{"&$bot~bot_name&"}    Sector Quasar Report    {"&$bot~bot_name&"}**"
	send $quasarOutput
	halt
# ======================     END CANNON CALCULATOR (QREPORT) SUBROUTINE     ==========================


#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
