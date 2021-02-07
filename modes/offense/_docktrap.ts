	reqRecording
	gosub :BOT~loadVars
	setVar $BOT~command "docktrap"
	loadVar $BOT~bot_turn_limit
	loadVar $MAP~stardock
	loadvar $bot~subspace
	loadvar $switchboard~self_command

    setVar $BOT~help[1]    $BOT~tab&"docktrap [trigger sector] [move sector] {figs:n} {kill} {cap}"
    setVar $BOT~help[2]    $BOT~tab&"              "
    setVar $BOT~help[3]    $BOT~tab&"      Warps planet to move sector when enemy hits trigger "
    setVar $BOT~help[4]    $BOT~tab&"      can drop fighters ."
    setVar $BOT~help[5]    $BOT~tab&"         "
    setVar $BOT~help[6]    $BOT~tab&"       Options:"
    setVar $BOT~help[7]    $BOT~tab&"           {figs:n} - drop this many figs to sector "
    setVar $BOT~help[8]    $BOT~tab&"           {offensive} - make figs offensive, default defense."
    setVar $BOT~help[9]    $BOT~tab&"           {kill} - turns on citkill"
    setVar $BOT~help[10]   $BOT~tab&"           {cap} - turns on citcap"
    setVar $BOT~help[11]   $BOT~tab&"         "
    setVar $BOT~help[12]   $BOT~tab&"         "
    setVar $BOT~help[13]   $BOT~tab&"       Examples: "
    setVar $BOT~help[14]   $BOT~tab&"           >docktrap 362 1055"
    setVar $BOT~help[15]   $BOT~tab&"           >docktrap 362 1055 100000 citkill return"
    setVar $BOT~help[16]   $BOT~tab&"           >docktrap 362 1055 citcap"
    gosub :bot~helpfile

	setvar $triggerSector $bot~parm1
	setvar $moveSector $bot~parm2
	setvar $figsInSector 0

	gosub :player~quikstats

	setVar $startingLocation $player~current_prompt
	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "This script must be run from the Citadel Prompt*"
		setVar $mode "General"
		gosub :SWITCHBOARD~switchboard		
		halt
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


	getWordPos $bot~user_command_line $pos "cap"
	if ($pos > 0)
		setVar $cap TRUE
	else
		setVar $cap FALSE
	end

	gosub :ship~getshipstats
	
	send "q"
	
	gosub :planet~getPlanetInfo
	
	setvar $PLANET $getPlanetInfo~PLANET
	setvar $PLANET_FIGHTERS $$planet~PLANET_FIGHTERS     

	if ($planet~planet_FIGHTERS < $dropFigs)
		setVar $SWITCHBOARD~message "There are only " & $planet~planet_FIGHTERS & " fighters on the planet.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
		
	send "mnt*c"
	waitfor "Citadel command (?=help)"
	waiton "Deployed Fighters Report Sector "&$triggerSector&":"
	send "p" & $moveSector & "*y  "

	if ($dropftrs)
		send $moveFigMacro
		gosub :player~quikstats
		send "s"
	end

	if ($kill)
		send "'In Kill*"
		send "'"&$bot~bot_name&" citkill on*"
	end

	if ($cap)
		send "'In Cap*"
		send "'"&$bot~bot_name&" citcap on*"
	end

halt

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\planet\getplanetinfo\planet"
