	gosub :BOT~loadVars
	gosub :combat~init 


	setVar $BOT~help[1]  $BOT~tab&"Autokill  "
	gosub :bot~helpfile

	setVar $BOT~script_title "Autokill"
	gosub :BOT~banner

	setvar $sector~passive true
:again
	killtrigger 1
	settexttrigger 1 :start_scan "Sector  : "
	pause
		:start_scan
		gosub :sector~getSectorData
		if ($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips))
			gosub :combat~fastAttack
			goto :again
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
