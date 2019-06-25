logging off
     gosub :BOT~loadVars
     loadvar $SHIP~cap_file
     gosub :combat~init 


#HELP FILE
     setVar $BOT~help[1]  $BOT~tab&"kill   "
     setVar $BOT~help[2]  $BOT~tab&"    Kills any enemy players.   "
     gosub :BOT~help_file


#============================== START AUTO CAPTURE =======================================
:kill
:autokill
	loadvar $player~targetingPerson 
	loadvar $player~targetingCorp 
	loadvar $player~cappingAliens 
	loadvar $player~target 
	loadvar $map~stardock 

	if ($bot~parm1 = "furb")
		setvar $furb true
	end

	gosub :PLAYER~current_prompt
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
	goSub :SECTOR~getSectorData
	goSub :combat~fastAttack
	if ((($player~current_sector = 1) or ($player~current_sector = $map~stardock)) and ($furb = true))
		load "scripts\mombot\commands\general\refurb.cts"
		setEventTrigger		1		:refurbended	"SCRIPT STOPPED" "scripts\mombot\commands\general\refurb.cts"
		pause
		:refurbended
	end
	halt

#================================ END AUTO CAPTURE ===================================

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
include "source\bot_includes\combat"

