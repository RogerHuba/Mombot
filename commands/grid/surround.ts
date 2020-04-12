	gosub :BOT~loadVars
	setVar $BOT~command "surround"
	setVar $PLAYER~save TRUE
	loadvar $player~surroundOverwrite
	loadvar $player~surroundAvoidAllPlanets
	loadvar $player~surroundAvoidShieldedOnly
	loadvar $player~surroundPassive
	loadvar $player~surroundLimp
	loadvar $player~surroundMine
	loadvar $player~surroundFigs

	loadvar $shipPhotonCheck

	setVar $BOT~help[1]   $BOT~tab&"surround   "
	setVar $BOT~help[2]   $BOT~tab&"      Surrounds sector with fighters, armids, or limpets.  "
	setVar $BOT~help[3]   $BOT~tab&"      "
	setVar $BOT~help[4]   $BOT~tab&"    - Options for surround can be found in the"
	setVar $BOT~help[5]   $BOT~tab&"      preferences menu in bot"
	gosub :bot~helpfile

	gosub :PLAYER~quikstats
	if (($PLAYER~TURNS <= $BOT~bot_turn_limit) and ($PLAYER~unlimitedGame <> TRUE))
			setVar $SWITCHBOARD~message "Turns Exceed Bot Turn Limit.*"
			gosub :SWITCHBOARD~switchboard
			halt
	end
	if ($PLAYER~PHOTONS > 0)
		if ($shipPhotonCheck = $PLAYER~SHIP_NUMBER)
			# good to go #
		else
			setVar $shipPhotonCheck $PLAYER~SHIP_NUMBER
			saveVar $shipPhotonCheck
			echo "*" & ANSI_14  &"You are carrying photons. *If you wish to surround anyway, press TAB-S again.*" & ANSI_7
			halt
		end
	end
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation = "Command")
	elseif ($startingLocation = "Citadel")
		send "q "
		gosub :PLANET~getPlanetInfo
		send "q "
	elseif ($startingLocation = "Planet")
		gosub :PLANET~getPlanetInfo
		send "q "
	else
		echo "*Wrong prompt for surround command.*"
		halt
	end
	gosub :grid~surround
	if (($startingLocation = "Citadel") OR ($startingLocation = "Planet"))
		gosub :PLANET~landingSub
	else
		gosub :player~quikstats
	end
	setvar $switchboard~message "Surrounded sector "&$PLAYER~CURRENT_SECTOR&".*"
	gosub :switchboard~switchboard
	echo "*" & ANSI_14 & $PLAYER~surroundOutput & "*" & ANSI_7
halt


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\grid\surround\grid"
include "source\bot_includes\planet\landingsub\planet"
