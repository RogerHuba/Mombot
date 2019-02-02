	gosub :BOT~loadVars
	setVar $BOT~command "surround"
	setVar $PLAYER~save TRUE
	loadvar $BOT~surroundAutoCapture
	loadvar $surroundOverwrite
	loadvar $surroundAvoidAllPlanets
	loadvar $surroundAvoidShieldedOnly
	loadvar $surroundPassive
	loadvar $surroundLimp
	loadvar $surroundMine
	loadvar $surroundFigs

	loadvar $shipPhotonCheck

	setVar $BOT~help[1]   $BOT~tab&"surround   "
	setVar $BOT~help[2]   $BOT~tab&"      Surrounds sector with fighters, armids, or limpets.  "
	setVar $BOT~help[3]   $BOT~tab&"      "
	setVar $BOT~help[4]   $BOT~tab&"    - Options for surround can be found in the"
	setVar $BOT~help[5]   $BOT~tab&"      preferences menu in bot"
	gosub :BOT~help_file


	
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

    gosub :PLAYER~surround

        if ($BOT~surroundAutoCapture = TRUE)
            gosub :PLAYER~quikstats
            if ($startingLocation = "Citadel")
                setVar $PLAYER~startingLocation "Command"
                goSub :SECTOR~getSectorData
                goSub :PLAYER~fastCapture
                setVar $PLAYER~startingLocation "Citadel"
            else
                goSub :SECTOR~getSectorData
                goSub :PLAYER~fastCapture
            end

        end
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
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
include "source\bot_includes\targeting"
