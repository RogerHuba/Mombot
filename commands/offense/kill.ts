logging off
     gosub :BOT~loadVars
     loadvar $SHIP~cap_file
     gosub :combat~init 


#HELP FILE
	setvar $bot~command "kill"
	setVar $BOT~help[1]  $BOT~tab&"kill   "
	setVar $BOT~help[2]  $BOT~tab&"    Kills any enemy players.   "
	gosub :bot~helpfile


#============================== START AUTO CAPTURE =======================================
:kill
:autokill
	loadvar $player~targetingPerson
	loadvar $player~targetingCorp
	loadvar $player~cappingAliens
	loadvar $player~target
	loadvar $map~stardock
	loadvar $in_kill_routine

	if ($in_kill_routine = true)
		echo "[Kill routine already running.]*"
	else
		if ($bot~parm1 = "furb")
			setvar $furb true
		end

		gosub  :player~currentPrompt
		setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
		if ($PLAYER~startingLocation <> "Command")
			if ($PLAYER~startingLocation = "Citadel")
				loadvar $bot~mode
				if ($bot~mode <> "Citkill")
					setVar $BOT~command "citkill"
					setVar $BOT~user_command_line " citkill on "
					setVar $BOT~parm1 "on"
					saveVar $BOT~parm1
					saveVar $BOT~command
					saveVar $BOT~user_command_line
					setvar $bot~mode "Citkill"
					savevar $bot~mode
					load "scripts\mombot\modes\offense\citkill.cts"
				else
					setvar $bot~mode "General"
					savevar $bot~mode
					stop "scripts\mombot\modes\offense\citkill.cts"
					setVar $SWITCHBOARD~message "Citkill off.*" 
					gosub :SWITCHBOARD~switchboard
				end
				halt
			end
			setVar $SWITCHBOARD~message "Wrong prompt for auto kill.*" 
			gosub :SWITCHBOARD~switchboard
			halt
		end
		loadVar $SHIP~SHIP_MAX_ATTACK
		loadVar $SHIP~SHIP_FIGHTERS_MAX
		loadVar $SHIP~SHIP_OFFENSIVE_ODDS
		if ($SHIP~SHIP_MAX_ATTACK <= 0)
			gosub :SHIP~getShipStats
		end
		setvar $player~isFound false
		goSub :SECTOR~getSectorData
		goSub :combat~fastAttack
		if ((($player~current_sector = 1) or ($player~current_sector = $map~stardock)) and ($furb = true))
			if ($player~isFound)
				load "scripts\mombot\commands\general\refurb.cts"
				setEventTrigger		1		:refurbended	"SCRIPT STOPPED" "scripts\mombot\commands\general\refurb.cts"
				pause
				:refurbended
				goSub :SECTOR~getSectorData
				goSub :combat~fastAttack
			end
		end
		setvar $in_kill_routine false
		savevar $in_kill_routine
	end
	gosub :player~quikstats
	halt

#================================ END AUTO CAPTURE ===================================

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\bot_includes\combat\init\combat"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\currentprompt\player"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\player\quikstats\player"
