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


setVar $BOT~help[1] $BOT~tab&"terradump"
setVar $BOT~help[2] $BOT~tab&"Start in non-fed sector.  Will pull colos off terra and jettison."
gosub :BOT~help_file

setVar $BOT~script_title "Terra Dump"
gosub :BOT~banner


# ======================     START COLO (COLO) SUBROUTINE    ==========================
goto :Start_Up_Routines
:colo_next
	setVar $PLAYER~destination 1
	gosub :player~getCourse
    setVar $j 2
    setVar $result ""
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
	gosub :player~getCourse
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

		while (TRUE)
			if ($PLAYER~PLANET_SCANNER = "No")
				setVar $coloBurst $to_mow&"    l * * "&$from_mow&" j y *        "
			else
				setVar $coloBurst $to_mow&"    l 1* * * "&$from_mow&" j y *       "
			end
			send $coloBurst
			setTextLineTrigger 33 :morespeed "The Colonists file aboard your ship, eager to head out to new frontiers."
			setTextLineTrigger 35 :donespeed "There aren't that many on Terra!"
			pause

			:donespeed
				killtrigger 33
				send "'{" $bot_name "} - Terra is empty. Colonizer shutting down.*"
				halt
			:morespeed
				killtrigger 33
				killtrigger 35

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
	if ($startingLocation <> "Command")
		send "'{" $bot_name "} - Colo must be run from Command prompt*"
		halt
	end
	send " jy*  "

	gosub :PLAYER~getInfo
	gosub :SHIP~getShipStats
	goto :colo_next

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player\getcourse\player"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\ship\getshipstats\ship"
