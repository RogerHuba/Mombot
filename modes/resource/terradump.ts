logging off
	gosub :BOT~loadVars
									

setVar $BOT~help[1] $BOT~tab&"terradump"
setVar $BOT~help[2] $BOT~tab&"Start in non-fed sector.  Will pull colos off terra and jettison."
gosub :bot~helpfile

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
				send "'{" $switchboard~bot_name "} - Terra is empty. Colonizer shutting down.*"
				halt
			:morespeed
				killtrigger 33
				killtrigger 35

		end
halt

:Start_Up_Routines
	loadVar $player~unlimitedGame
	loadVar $bot_turn_limit
	loadVar $bot~user_command_line
	loadVar $bot~parm1
	loadVar $bot~parm2
	loadVar $bot~parm3
	loadVar $bot~parm4
	loadVar $bot~parm5
	loadVar $bot~parm6
	loadVar $bot~parm7
	loadVar $bot~parm8
	loadVar $switchboard~bot_name


# ======================     START COLO  (COLO) SUBROUTINE    ==========================
:colo_setup
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation <> "Command")
		send "'{" $switchboard~bot_name "} - Colo must be run from Command prompt*"
		halt
	end
	send " jy*  "

	gosub :PLAYER~getInfo
	gosub :SHIP~getShipStats
	goto :colo_next

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\getcourse\player"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\ship\getshipstats\ship"
