logging off
gosub :BOT~loadVars

setVar $BOT~help[1] $BOT~tab&"Uses ecolo {all}"
setVar $BOT~help[2] $BOT~tab&"Uses E-warp to colonize.  For red or non-twarp ships."
setVar $BOT~help[3] $BOT~tab&"   Options:"
setVar $BOT~help[4] $BOT~tab&"   Will attempt to fill all planets in sector owned by you."
gosub :bot~helpfile

setVar $BOT~script_title "E-Colonizer"
gosub :BOT~banner


# ======================     START COLO (COLO) SUBROUTINE    ==========================
goto :Start_Up_Routines
:colo_next
	setVar $PLAYER~destination 1
	gosub :PLAYER~getcourse
    setVar $j 2
    setVar $result "q * "
    while ($j <= $PLAYER~courseLength)
        if ($PLAYER~mowCourse[$j] <> $PLAYER~CURRENT_SECTOR)
            setVar $result $result&"m    "&$PLAYER~mowCourse[$j]&"*               "
            if (($PLAYER~mowCourse[$j] > 10) AND ($PLAYER~mowCourse[$j] <> $MAP~stardock))
                setVar $result $result&"za  "&$SHIP~SHIP_MAX_ATTACK&"* *             "
            end
        end
        add $j 1
    end
    setVar $to_mow $result

    setVar $PLAYER~starting_point 1
	setVar $PLAYER~destination $PLAYER~CURRENT_SECTOR
	gosub :PLAYER~getcourse
    setVar $j 2
    setVar $result ""
    while ($j <= $PLAYER~courseLength)
        if ($PLAYER~mowCourse[$j] <> $PLAYER~starting_point)
            setVar $result $result&"m    "&$PLAYER~mowCourse[$j]&"*             "
            if (($PLAYER~mowCourse[$j] > 10) AND ($PLAYER~mowCourse[$j] <> $MAP~stardock))
                setVar $result $result&"za  "&$SHIP~SHIP_MAX_ATTACK&"* *           "
            end
        end
        add $j 1
    end
    setVar $from_mow $result

	setVar $i 1
	while ($i <= $PLANET~planetCount)
		setVar $colo_prod 1
		while ($colo_prod < 4)
			setVar $PLANET~planet $PLANET~planets[$i]
			if ($PLAYER~PLANET_SCANNER = "No")
				setVar $coloBurst $to_mow&"    l * * "&$from_mow&" l "&$PLANET~planet&"* s * * "&$colo_prod&"*"
			else
				setVar $coloBurst $to_mow&"    l 1* * * "&$from_mow&" l "&$PLANET~planet&"* s * * "&$colo_prod&"*"
			end
			send $coloBurst
			setTextLineTrigger 33 :morespeed "The Colonists disembark"
			setTextLineTrigger 34 :next_item_speed "There isn't room on the planet"
			setTextLineTrigger 35 :donespeed "There aren't that many on Terra!"
			pause

			:donespeed
				killtrigger 33
				killtrigger 34
				send "'{" $bot_name "} - Terra is empty. Colonizer shutting down.*"
				if ($startingLocation = "Citadel")
					send "c "
				end
				halt
			:next_item_speed
				killtrigger 33
				killtrigger 35
				#CHANGE ITEM TO NEXT
				add $colo_prod 1
				if ($colo_prod >= 4)
					send "'{" $bot_name "} - Planet "&$PLANET~planet&" is full of colonists, no more can be added.*"
				end
			:morespeed
				killtrigger 33
				killtrigger 34
				killtrigger 35

		end
		add $i 1
	end
halt

:Start_Up_Routines
	loadVar $unlimitedGame
	loadVar $bot_turn_limit
	loadVar $user_command_line
	loadVar $parm1
	loadVar $parm2
	loadVar $parm3
	loadVar $parm4
	loadVar $parm5
	loadVar $parm6
	loadVar $parm7
	loadVar $parm8
	loadVar $bot_name


# ======================     START COLO  (COLO) SUBROUTINE    ==========================
:colo_setup
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Planet"))
		send "'{" $bot_name "} - Colo must be run from Planet or Citadel prompt*"
		halt
	end
	if ($startingLocation = "Citadel")
		send "Q"
	end
	gosub :PLANET~getPlanetInfo
	send " t n l 1* t n l 2* t n l 3* s n l 1* s n l 2* s n l 3* q c u y q "

	if ($parm1 = "all")
		gosub :PLANET~countPlanets
	else
		setVar $PLANET~planets[1] $PLANET~PLANET
		setVar $PLANET~planetCount 1
	end
	gosub :PLAYER~getInfo
	gosub :SHIP~getShipStats
	goto :colo_next

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
