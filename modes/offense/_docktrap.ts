reqRecording

	gosub :BOT~loadVars

	setVar $BOT~command "docktrap"
	loadVar $BOT~bot_turn_limit
	loadVar $MAP~stardock
	loadvar $bot~subspace
	loadvar $switchboard~self_command
	loadvar $ship~ship_max_attack

    setVar $BOT~help[1]   $BOT~tab&"docktrap [trigger sector] [move sector] {fig drop} {citkill} {citcap}"
    setVar $BOT~help[2]   $BOT~tab&"              "
    setVar $BOT~help[3]   $BOT~tab&"      Warps planet to move sector when enemy hits trigger "
    setVar $BOT~help[4]   $BOT~tab&"      can drop fighters ."
    setVar $BOT~help[5]   $BOT~tab&"         "
    setVar $BOT~help[6]   $BOT~tab&"       Options:"
    setVar $BOT~help[7]   $BOT~tab&"           {fig drop} - number of fighters to drop in sector"
    setVar $BOT~help[8]   $BOT~tab&"           {citkill} - turns on citkill"
    setVar $BOT~help[9]   $BOT~tab&"           {citcap} - turns on citcap"
    setVar $BOT~help[10]   $BOT~tab&"         "
    setVar $BOT~help[11]   $BOT~tab&"         "
    setVar $BOT~help[12]   $BOT~tab&"       Examples: "
    setVar $BOT~help[13]  $BOT~tab&"           >docktrap 362 1055"
    setVar $BOT~help[14]  $BOT~tab&"           >docktrap 362 1055 100000 citkill return"
    setVar $BOT~help[15]  $BOT~tab&"           >docktrap 362 1055 citcap"
    gosub :bot~helpfile



	loadVar $bot~command
	getWord $bot~user_command_line $bot~parm1 1
	getWord $bot~user_command_line $bot~parm2 2
	getWord $bot~user_command_line $bot~parm3 3
	getWord $bot~user_command_line $bot~parm4 4


	setvar $triggerSector $bot~parm1
	setvar $moveSector $bot~parm2
	
	gosub :player~quikstats

	setVar $startingLocation $player~current_prompt
	if ($startingLocation <> "Citadel")
		send "'{" $bot~bot_name "} - This script must be run from the Citadel Prompt*"
		setVar $mode "General"
	        halt
	end


	setvar $bot~user_command_line " "&$bot~user_command_line&" "
	isNumber $test $bot~parm3
	if ($test)
		setVar $dropFigs $bot~parm2
	else 
		setVar $dropFigs 0
	end
	getWordPos $bot~user_command_line $pos " citkill "
	if ($pos > 0)
		setVar $citkill TRUE
	end
	getWordPos $bot~user_command_line $pos " citcap "
	if ($pos > 0)
		setVar $citcap TRUE
	end

	gosub :ship~getshipstats
	
	setvar $MAX_FIGHTERS $ship~SHIP_FIGHTERS_MAX

	send "q"
	gosub :planet~getPlanetInfo
	
	setvar $PLANET $getPlanetInfo~PLANET
	setvar $PLANET_FIGHTERS $getPlanetInfo~PLANET_FIGHTERS
	if ($PLAMET_FIGHTERS < $bot~parm3)
		send "'{" $bot~bot_name "} - Not enough fighters on the planet*"
		halt
	end
		
	send "mnt*c"
	waitfor "Citadel command (?=help)"
	echo "**Deployed Fighters Report Sector "&$triggerSector&":**"
	waiton "Deployed Fighters Report Sector "&$triggerSector&":"
	send "p" & $moveSector & "*y"

	
	#if ($dropFigs > 0)
	#send "qq*  f " & $MAX_FIGHTERS & "*cd l " & $PLANET & "* c"
	#end
	if $citkill
		#load citkill script
	end
	if $citcap
		#load citcap
	end 

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\planet\getplanetinfo\planet"
