	reqRecording
	gosub :BOT~loadVars
	setVar $BOT~command "docktrap"
	loadVar $BOT~bot_turn_limit
	loadVar $MAP~stardock
	loadvar $bot~subspace
	loadvar $switchboard~self_command
	
	setVar $BOT~help[1]   $BOT~tab&"docktrap {trig_sect:#} {drop_sect:#} {figs:#} {kill}"
	setVar $BOT~help[2]   $BOT~tab&"         {cap} {offensive} {return}"	
    setVar $BOT~help[3]   $BOT~tab&"        "
    setVar $BOT~help[4]   $BOT~tab&"      Warps planet to move sector when enemy hits trigger "
    setVar $BOT~help[5]   $BOT~tab&"      can drop fighters ."
    setVar $BOT~help[6]   $BOT~tab&"         "
    setVar $BOT~help[7]   $BOT~tab&"{trig_sect:#} - drop this many figs to sector "
    setVar $BOT~help[8]   $BOT~tab&"{drop_sect:#} - drop this many figs to sector "
    setVar $BOT~help[9]   $BOT~tab&"     {figs:#} - drop this many figs to sector "
    setVar $BOT~help[10]  $BOT~tab&"  {offensive} - make figs offensive, default defense."
    setVar $BOT~help[11]  $BOT~tab&"       {kill} - turns on citkill"
    setVar $BOT~help[12]  $BOT~tab&"        {cap} - turns on citcap"
    setVar $BOT~help[13]  $BOT~tab&"     {return} - returns to home sector after 10 seconds"	
    setVar $BOT~help[14]  $BOT~tab&"         "
    setVar $BOT~help[15]  $BOT~tab&"   Examples:"
    setVar $BOT~help[16]  $BOT~tab&"      >docktrap 362 1055"
    setVar $BOT~help[17]  $BOT~tab&"      >docktrap 362 1055 100000 citkill return"
    setVar $BOT~help[18]  $BOT~tab&"      >docktrap 362 1055 citcap"
    gosub :bot~helpfile

	gosub :ship~getShipStats
	setVar $maxShipFighters $ship~SHIP_FIGHTERS_MAX

	gosub :player~quikstats
	setVar $homeSector $player~current_sector

	setVar $startingLocation $player~current_prompt
	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "This script must be run from the Citadel Prompt*"
		setVar $mode "General"
		gosub :SWITCHBOARD~switchboard		
		halt
	end

	getWordPos $bot~user_command_line $pos "trig_sect:"
	if ($pos > 0)
	    setVar $cline $bot~user_command_line & " "
        getText $cline $triggerSector  "trig_sect:" " "
	else
		isNumber $test $bot~parm1
		if ($test)
			setvar $triggerSector $bot~parm1
		end
	end

	getWordPos $bot~user_command_line $pos "drop_sect:"
	if ($pos > 0)
	    setVar $cline $bot~user_command_line & " "
        getText $cline $dropSector  "drop_sect:" " "
	else
		isNumber $test $bot~parm2
		if ($test)
			setvar $dropSector $bot~parm2
		end
	end

	getWordPos $bot~user_command_line $pos "figs:"
	if ($pos > 0)
		setVar $dropftrs TRUE
		setVar $cline $bot~user_command_line & " "
		getText $cline $dropFigs "figs:" " "

		getWordPos $bot~user_command_line $pos "offensive"
		if ($pos > 0)
			setVar $dropftrsType "o"
		else
			setVar $dropftrsType "d"
		end
	else
		setVar $dropftrs FALSE
	end

	getWordPos $bot~user_command_line $pos "kill"
	if ($pos > 0)
		setVar $kill TRUE
	else
		setVar $kill FALSE
	end

	getWordPos $bot~user_command_line $pos "return"
	if ($pos > 0)
		setVar $returnHome TRUE
		setVar $returnHomeDelay 5000
	else
		setVar $returnHome FALSE
		setVar $returnHomeDelay 0
	end

	getWordPos $bot~user_command_line $pos "cap"
	if ($pos > 0)
		setVar $cap TRUE
	else
		setVar $cap FALSE
	end

	gosub :ship~getshipstats
	
	send "qmnt*"
	
	gosub :planet~getPlanetInfo
	setvar $PLANET $planet~planet
	setvar $PLANET_FIGHTERS $planet~PLANET_FIGHTERS     

	if ($planet~planet_FIGHTERS < $dropFigs)
		setVar $SWITCHBOARD~message "There are only " & $planet~planet_FIGHTERS & " fighters on the planet.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	
	setVar $moveFigMacro ""
	setVar $pickFigMacro ""
	setVar $moved 0
	setVar $picked 0

	:move
		while ($moved < $dropFigs)
			setVar $toMove ($dropFigs - $moved)
			if ($toMove >= $maxShipFighters)
				setVar $thisMove $maxShipFighters
				setVar $moved ($moved + $thisMove)
			else
				setVar $thisMove $toMove
				setVar $moved $moved + $thisMove
			end
			setVar $moveFigMacro $moveFigMacro & "q m n t* q fz " & $moved & "* * zc" & $dropftrsType & " * l" & $PLANET & " *m* t * ccq"
		end

		while ($picked < $moved)
			setVar $toMove ($moved - $picked)
			if ($toMove >= $maxShipFighters)
				setVar $thisMove $maxShipFighters
				setVar $picked ($picked + $thisMove)
			else 
				setVar $thisMove $toMove
				setVar $picked $picked + $thisMove
			end
			setVar $pickFigMacro $pickFigMacro & "q m n l* q fz " & $toMove & "* * zc" & $dropftrsType & " * l" & $PLANET & " *m* l * ccq"
		end
		setVar $pickFigMacro $pickFigMacro & "q m n l* q fz " & "1" & "* * zc" & $dropftrsType & " * l" & $PLANET & "*m* t *c"

	send "c"
	setVar $SWITCHBOARD~message "running on planet: " & $PLANET & "*"
	gosub :SWITCHBOARD~switchboard
	waitfor "Citadel command (?=help)"
	waiton "Deployed Fighters Report Sector "&$triggerSector&":"
	send "p" & $dropSector & "*y  "

	if ($dropftrs)
		send $moveFigMacro
		gosub :player~quikstats
		send "s"
	end

	if (($kill) or ($cap))
		gosub :checkForVictims
	end
	if ($returnHome)
		killAllTriggers
		setDelayTrigger returnHome :goHome $returnHomeDelay
		pause
		:goHome
			gosub :pickUpFighters
			send "p" & $homeSector & "*yy"
	end

	halt

	:checkForVictims
		gosub :player~quikstats
		send " s*  "
		:scanit_again
		setvar $player~startingLocation $player~current_prompt
		gosub :sector~getSectorData
		if ($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips))
			if ($cap)
				gosub :combat~fastCapture
			else
				goSub :combat~fastCitadelAttack
			end
			goto :scanit_again
		elseif (($sector~emptyShipCount > $sector~myShipCount))
			gosub :combat~fastCapture
			goto :scanit_again
		end
	return	

	:pickUpFighters
		send $pickFigMacro
	return	

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\combat\fastcitadelattack\combat"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\ship\loadshipinfo\ship"
