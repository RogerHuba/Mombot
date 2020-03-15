	gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&" citcap {"&#34&"player name"&#34&" | corp#}"
	setVar $BOT~help[2]  $BOT~tab&" Citadel Capper captures enemy ships from planet citadel"
	setVar $BOT~help[3]  $BOT~tab&"  "
	setVar $BOT~help[4]  $BOT~tab&" {"&#34&"player name"&#34&"} - Player to target, name must be"
	setVar $BOT~help[5]  $BOT~tab&"                   surrounded by double quotes"
	setVar $BOT~help[6]  $BOT~tab&"         {corp#} - Corporation number to target"
	setVar $BOT~help[7]  $BOT~tab&"         "
	setVar $BOT~help[8]  $BOT~tab&"         Examples:"
	setVar $BOT~help[9]  $BOT~tab&"              >citcap "
	setVar $BOT~help[10] $BOT~tab&"              >citcap "&#34&"player name"&#34&" "
	setVar $BOT~help[11] $BOT~tab&"              >citcap 3"
	gosub :bot~helpfile

	setVar $BOT~script_title "Citadel Capper"
	gosub :BOT~banner


	setArray $shipList 	200
	gosub :player~quikstats
	gosub :player~getInfo
	setVar $startingLocation $player~current_prompt
	setVar $player~targetingPerson FALSE
	setVar $player~targetingCorp FALSE
	setVar $player~cappingAliens TRUE
	setVar $player~target ""
	
	setvar $bot~mode "Citcap"
	saveVar $bot~mode

	if ($startingLocation <> "Citadel")
		setvar $switchboard~message "Citadel Capper must be run from the Citadel Prompt*"
		gosub :switchboard~switchboard
		setVar $mode "General"
		halt
	end
	isNumber $test $bot~parm1
	if ($test)
		if ($bot~parm2 > 0)
			setVar $targetingCorp TRUE
			setVar $player~target $bot~parm2
		end
	else
		getWordPos $bot~user_command_line $pos #34
		if ($pos > 0)
			setvar $bot~user_command_line $bot~user_command_line&" "
			getText $bot~user_command_line $player~target " "&#34 #34&" "
			if ($player~target <> "")
				setVar $targetingPerson TRUE
				stripText $player~target #34
				lowercase $player~target
			else
				setVar $targetingPerson FALSE
			end
		end
	end

	gosub :player~quikstats
	setVar $player~startingLocation $player~current_prompt
	gosub :combat~init 

	if ($player~current_prompt <> "Citadel")
		setvar $switchboard~message "Must start at the citadel prompt*"
		gosub :switchboard~switchboard
		halt
	end
	loadvar $ship~CAP_FILE	
	fileExists $CAP_FILE_chk $ship~CAP_FILE
	if ($CAP_FILE_chk)
		gosub :ship~loadshipinfo
	else
		gosub :ship~getShipCapStats
		gosub :ship~loadShipInfo
	end 



:start_cit_cap
	setvar $switchboard~message "Citadel Capper :: Powering Up!*"
	gosub :switchboard~switchboard
:stats_cit_cap
	gosub :ship~getShipStats
:warning_cit_kill
	send "q m * * * "
	gosub :planet~getPlanetInfo
	format $planet~planet_fighters $formatted_fighters NUMBER
	if ($targetingPerson)
		setvar $switchboard~message "Citadel Capper Targeting "&$player~target&" :: Running on Planet "&$planet~planet&" :: "&$formatted_fighters&" Fighters available on surface.*"
		gosub :switchboard~switchboard
	elseif ($targetingCorp)
		setvar $switchboard~message "Citadel Capper Targeting Corp "&$player~target&" :: Running on Planet"&$planet~planet&" :: "&$formatted_fighters&" Fighters available on surface.*"
		gosub :switchboard~switchboard
	else
		setvar $switchboard~message "Citadel Capper :: Running on Planet "&$planet~planet&" :: "&$formatted_fighters&" Fighters available on surface.*"
		gosub :switchboard~switchboard
	end
	send "c "
	goto :scanit_cit_cap


:main
	killalltriggers
	gosub :player~quikstats
	setTextLineTrigger 	limp 	:scanit_cit_cap 	"Limpet mine in "&$player~current_sector
	setTextLineTrigger 	warps 	:scanit_cit_cap 	"warps into the sector."
	setTextLineTrigger 	lifts 	:scanit_cit_cap 	"lifts off from"
	setTextLineTrigger 	deffig 	:scanit_cit_cap 	"Deployed Fighters Report Sector "&$player~current_sector
	setTextLineTrigger 	secgun 	:scanit_cit_cap 	"Quasar Cannon on"
	setTextLineTrigger 	ig 	:scanit_cit_cap 	"Shipboard Computers The Interdictor Generator on"
	setTextLineTrigger 	power 	:scanit_cit_cap 	"is powering up weapons systems!"
	setTextLineTrigger 	exits 	:scanit_cit_cap 	"exits the game."
	setTextLineTrigger 	enters 	:scanit_cit_cap 	"enters the game."
	setTextTrigger 		pause 	:pausing 		"Planet command (?="
	setTextTrigger 		pause2 	:pausing 		"Computer command ["
	setTextTrigger 		pause3 	:pausing 		"Corporate command ["
	pause


:pausing
	killAllTriggers
	echo ANSI_6 "*[" ANSI_14 "Citadel Capture paused. To restart, re-enter citadel prompt" ANSI_6 "]*" ANSI_7
	setTextTrigger restart :restarting "Citadel command ("
	pause
	:restarting
	killAllTriggers
	echo ANSI_6 "*[" ANSI_14 "Citadel Capture restarted" ANSI_6 "]*" ANSI_7
	goto :main


:scanit_cit_cap
	killalltriggers
	getWord CURRENTLINE $test 1
	if (($test = "P") OR ($test = "F") OR ($test = "R") OR ($test = ">"))
		echo ANSI_14 "*spoof attempt!*"
		goto :main
	end	
	gosub :checkForCappingVictimsFromCitadel
	echo ansi_12 "*NO Targets*"
	goto :main

:checkForCappingVictimsFromCitadel
	gosub :sector~getSectorData
	goSub :combat~fastCapture
	gosub :player~quikstats
	if ($player~current_prompt = "Command")
		send "l "&$planet~planet&"* m * * * c "
		if ($player~isFound = true)
			goto :checkForCappingVictimsFromCitadel
		end
	end
	
return



#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\ship\loadshipinfo\ship"
include "source\bot_includes\ship\getshipcapstats\ship"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastcapture\combat"
