logging off
	 gosub :BOT~loadVars
	 loadvar $SHIP~cap_file
	loadvar $player~onlyAliens
	loadvar $player~cappingAliens
	loadvar $player~empty_ships_only
	loadvar $player~defenderCapping


#HELP FILE
	 setVar $BOT~help[1]  $BOT~tab&"cap   "
	 setVar $BOT~help[2]  $BOT~tab&"    Captures enemy ships and attempts to not destroy them.   "
	 gosub :bot~helpfile

	gosub :combat~init 

	loadvar $ship~CAP_FILE	
	fileExists $CAP_FILE_chk $ship~CAP_FILE
	if ($CAP_FILE_chk)
		gosub :ship~loadshipinfo
	else
		gosub :ship~getShipCapStats
		gosub :ship~loadShipInfo
	end 

#============================== START AUTO CAPTURE =======================================
:autoCap
:cap
	gosub :PLAYER~quikstats
	setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
	if ($PLAYER~startingLocation <> "Command")
		if ($PLAYER~startingLocation = "Citadel")
			loadvar $bot~mode
			if ($bot~mode <> "Citcap")
				setVar $BOT~command "citcap"
				setVar $BOT~user_command_line " citcap on "
				setVar $BOT~parm1 "on"
				saveVar $BOT~parm1
				saveVar $BOT~command
				saveVar $BOT~user_command_line
				setvar $bot~mode "Citcap"
				savevar $bot~mode
				load "scripts\"&$bot~mombot_directory&"\modes\offense\citcap.cts"
			else
				setvar $bot~mode "General"
				savevar $bot~mode
				stop "scripts\"&$bot~mombot_directory&"\modes\offense\citcap.cts"
				setVar $SWITCHBOARD~message "Citcap off.*" 
				gosub :SWITCHBOARD~switchboard
			end
			halt
		end
		setVar $SWITCHBOARD~message "Wrong prompt for auto capture.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	getWordPos $BOT~user_command_line $pos "alien"
	if ($pos > 0)
		setVar $PLAYER~onlyAliens TRUE
	else
		setVar $PLAYER~onlyAliens FALSE
	end
	fileExists $SHIP~cap_file_chk $SHIP~cap_file
	if ($SHIP~cap_file_chk <> TRUE)
		gosub :SHIP~getShipCapStats
	end
	loadVar $SHIP~SHIP_MAX_ATTACK
	loadVar $SHIP~SHIP_FIGHTERS_MAX
	loadVar $SHIP~SHIP_OFFENSIVE_ODDS
	if ($SHIP~SHIP_OFFENSIVE_ODDS <= 0)
		gosub :SHIP~getShipStats
	end
	setVar $lastTarget ""
	setVar $thisTarget ""
	goSub :SECTOR~getSectorData
	goSub :combat~fastCapture
	halt

#================================ END AUTO CAPTURE ===================================

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\ship\loadshipinfo\ship"
include "source\bot_includes\ship\getshipcapstats\ship"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastcapture\combat"
