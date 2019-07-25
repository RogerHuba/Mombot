loadVar $switchboard~bot_name
loadVar $bot~parm1
loadVar $bot~user_command_line
loadVar $bot_turn_limit
loadVar $bot~parm2
loadVar $bot~parm3
loadVar $bot~parm4
loadVar $bot~parm5

:Mover
	KillAllTriggers
	setVar $StuffMoved ""
	setVar $rounds 0
	gosub :player~quikstats
	setVar $StartLocation $player~current_prompt
	IF (($StartLocation <> "Citadel") and ($StartLocation <> "Planet"))
        	send "'{" $switchboard~bot_name "} - Mover must be run from Citadel or Planet prompt.*"
		HALT
	END
	IF ($bot~parm1 = "f")
		setVar $StuffMoved "Fuel"
	ELSEIF ($bot~parm1 = "o")
		setVar $StuffMoved "Organics"
	ELSEIF ($bot~parm1 = "e")
		setVar $StuffMoved "Equipment"
	ELSEIF ($bot~parm1 = "fc")
		setVar $StuffMoved "Fuel Colonists"
	ELSEIF ($bot~parm1 = "oc")
		setVar $StuffMoved "Organic Colonists"
	ELSEIF ($bot~parm1 = "ec")
		setVar $StuffMoved "Equipment Colonists"
	ELSE
		send "'{" $switchboard~bot_name "} - Please use move [f/o/e/fc/oc/ec/] [planet] [rounds] format*"
		HALT
	END
	isNumber $test $bot~parm2
	IF ($test = FALSE)
		send "'{" $switchboard~bot_name "} - Mover Planet Parameter in-valid*"
		HALT
	END
	isNumber $test $bot~parm3
	IF ($test = FALSE)
		send "'{" $switchboard~bot_name "} - Mover Rounds Parameter in-valid*"
		HALT
	ELSEIF ($bot~parm3 <= 0)
		send "'{" $switchboard~bot_name "} - Must choose more than 0 rounds to move*"
		HALT
	END
	IF ($StartLocation = "Citadel")
		send "q"
	END
	gosub :planet~getplanetinfo

:StartMover
	IF ($StuffMoved = "Fighters")
		goto :MoveFighters
	ELSEIF (($StuffMoved = "Fuel") or ($StuffMoved = "Fuel Colonists"))
		setVar $stuff 1
	ELSEIF (($StuffMoved = "Organics") or ($StuffMoved = "Organic Colonists"))
		setVar $stuff 2
	ELSEIF (($StuffMoved = "Equipment") or ($StuffMoved = "Equipment Colonists"))
		setVar $stuff 3
	END
	getWordPos $bot~user_command_line $pos "c"
	IF ($pos > 0)
		send "q  j  y l "&$planet~planet&" *  "
		goto :MoveColonists
	else
		send "q  j  y l "&$planet~planet&" *  "
		goto :MoveProduct
	END

:MoveProduct
	IF ($rounds <= $bot~parm3)
		send "t  n  t  "&$stuff&"*  q  l "&$bot~parm2&"*  t  n  l "&$stuff&"*  q  l "&$planet~planet&"*  "
		add $rounds 1
		goto :MoveProduct
	ELSEIF ($rounds < 1)
		goto :MoveDone
	END

:MoveColonists
	IF ($rounds <= $bot~parm3)
		send "s  n  t  "&$stuff&"*  q  l "&$bot~parm2&"*  s  n  l "&$stuff&"*  q  l "&$planet~planet&"*  "
		add $rounds 1
		goto :MoveColonists
	ELSEIF ($rounds < 1)
		goto :MoveDone
	END

:MoveFighters
	IF ($rounds <= $bot~parm3)
		send "m  n  *  *  q  l  "&$bot~parm2&"*  m  n  l  *  q  l  "&$planet~planet&"*  "
		add $rounds 1
		goto :MoveFighters
	ELSEIF ($rounds < 1)
		goto :MoveDone
	END

:MoveDone
        IF ($StartLocation = "Citadel")
                send "c"
        END
	send "'{" $switchboard~bot_name "} - Moved "&$bot~parm3&" loads of "&$StuffMoved&" from "&$planet~planet&" to "&$bot~parm2&".*"
	HALT


include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
