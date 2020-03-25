	gosub :BOT~loadVars
	gosub :combat~init 


	setVar $BOT~help[1]  $BOT~tab&"Autokill  "
	gosub :bot~helpfile

	setVar $BOT~script_title "Autokill"
	gosub :BOT~banner

	gosub :combat~init 

	setvar $furb true
	loadVar $SHIP~SHIP_MAX_ATTACK
	loadVar $SHIP~SHIP_FIGHTERS_MAX
	loadVar $SHIP~SHIP_OFFENSIVE_ODDS
	if ($SHIP~SHIP_MAX_ATTACK <= 0)
		gosub :SHIP~getShipStats
	end
	gosub :player~quikstats
:again
	killtrigger 1
	settexttrigger 1 :start_scan "Sector  : "
	pause
		:start_scan


	setvar $player~isFound false
	setvar $sector~passive true
	loadvar $player~fighters
	if ($player~fighters = 0)
		gosub :player~quikstats
	end
	goSub :SECTOR~getSectorData
	goSub :combat~fastAttack
	if ((($player~current_sector = 1) or ($player~current_sector = $map~stardock)) and ($furb = true))
		if ($player~isFound)
			load "scripts\mombot\commands\general\refurb.cts"
			setEventTrigger		1		:refurbended	"SCRIPT STOPPED" "scripts\mombot\commands\general\refurb.cts"
			pause
			:refurbended
			setvar $sector~passive false
			goSub :SECTOR~getSectorData
			goSub :combat~fastAttack
		end
	end
	goto :again



#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\bot_includes\combat\init\combat"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastcitadelattack\combat"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\combat\fastcapture\combat"
