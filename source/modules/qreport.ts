
	loadVar $bot_name
	loadVar $user_command_line
	loadVar $parm1
	loadVar $parm2
	loadVar $parm3
	loadVar $parm4
	loadVar $parm5
	loadVar $parm6
	loadVar $parm7
	loadVar $parm8
	loadVar $mbbs

	
# ======================     START CANNON CALCULATOR (QREPORT) SUBROUTINE    ==========================
:cannonCalculator
	gosub :quikstats~quikstats
	setVar $startingLocation $quikstats~CURRENT_PROMPT
	echo "STARTING LOCATION: "&$startingLocation&"8392*"
	if ($startingLocation <> "Command")
		send "'{" $bot_name "} - Cannon Calculator must be run from command prompt*"
		halt
	end
	setArray $cannonPlanet 100
	setArray $cannonFuel 100
	setArray $cannonPercent 100
	setVar $cannonPlanetCount 0
	getWord $user_command_line $temp 1	
	while ($temp <> 0)
		add $cannonPlanetCount 1
		setVar $cannonPlanet[$cannonPlanetCount] $temp
		getWord $user_command_line $temp $cannonPlanetCount+1
	end
	if ($cannonPlanetCount <= 0)
		send "'{" $bot_name "} - No planet numbers entered*"
		halt
	end
	setVar $planetMemory " "
	setVar $i 1
	while ($i <= $cannonPlanetCount)
		getWordPos $planetMemory $pos " "&$cannonPlanet[$i]&" "
		if ($pos > 0)

		else
			setVar $planetMemory $planetMemory&" "&$cannonPlanet[$i]&" "
			send "l "&$cannonPlanet[$i]&"** "
			setTextLineTrigger wrongPlanet :badPlanet "That planet is not in this sector."
			setTextLineTrigger badPlanet :badPlanet "Invalid registry number, landing aborted."
			setTextLineTrigger goodPlanet :goodPlanet "Claimed by:"
			pause
			:badPlanet
				send "'{" $bot_name "} - Planet number " $cannonPlanet[$i] " entered not valid. *"
				halt
			:goodPlanet
				killtrigger wrongplanet
				killtrigger badplanet
				gosub :planetinfo~getPlanetInfo
				send "q "
				setVar $cannonFuel[$i] $planetinfo~PLANET_FUEL
				setVar $cannonPercent[$i] $planetinfo~SECTOR_CANNON


		end

		add $i 1
	end
	setVar $count 1
	setVar $quasarOutput "'*"
	setVar $quasarOutput $quasarOutput&"{"&$bot_name&"}    Sector Quasar Report    {"&$bot_name&"}*  (Planet "
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
			if ($mbbs)
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
	setVar $quasarOutput $quasarOutput&"{"&$bot_name&"}    Sector Quasar Report    {"&$bot_name&"}**"
	send $quasarOutput
	halt
# ======================     END CANNON CALCULATOR (QREPORT) SUBROUTINE     ==========================

# includes:
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\MOMBot\botIncludes\quikstats"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\MOMBot\botIncludes\planetinfo"
