systemscript
reqRecording
# TWX Script            : Mind Over Matter Bot
# Authors           : Mind Dagger / The Bounty Hunter / Lonestar
# Contributions/QA              : Misbehavin / DaCreeper / The Butcher
# Description           : Allows Corpies to use you while AFK and a Self Helper
# Credits           : Oz, Zentock, SupG, Dynarri, Cherokee, Alexio, Xide, Phx, Rincrast, Voltron, Traitor, Parrothead, PSI,

setVar $bot~major_version   "3"
setVar $bot~minor_version   "5beta"
savevar $bot~major_version
savevar $bot~minor_version

goto :BOT~load_bot

:MAIN~module_vars
	saveVar $bot~command
	setVar $command $bot~command
	saveVar $command
	saveVar $bot~user_command_line
	saveVar $bot~user_command_line
	setVar $switchboard~bot_name $bot~bot_name
	saveVar $switchboard~bot_name
	saveVar $bot~parm1
	saveVar $bot~parm1
	saveVar $bot~parm2
	saveVar $bot~parm2
	saveVar $bot~parm3
	saveVar $bot~parm3
	saveVar $bot~parm4
	saveVar $bot~parm4
	saveVar $bot~parm5
	saveVar $bot~parm5
	saveVar $bot~parm6
	saveVar $bot~parm6
	saveVar $bot~parm7
	saveVar $bot~parm7
	saveVar $bot~parm8
	saveVar $bot~parm8
	saveVar $bot~bot_turn_limit
	saveVar $player~unlimitedGame
return




:MAIN~backwards_compatible
	setVar  $safe_ship $bot~safe_ship
	saveVar $safe_ship
	setVar  $safe_planet $bot~safe_planet
	saveVar $safe_planet
	setVar $command $bot~command
	saveVar $command
		saveVar $bot~user_command_line
	setVar $switchboard~bot_name $bot~bot_name
	saveVar $switchboard~bot_name
	setVar $self_command $bot~self_command
	saveVar $self_command
		saveVar $bot~parm1
		saveVar $bot~parm2
		saveVar $bot~parm3
		saveVar $bot~parm4
		saveVar $bot~parm5
		saveVar $bot~parm6
		saveVar $bot~parm7
		saveVar $bot~parm8
	setVar $rylos $map~rylos
	saveVar $rylos
	setVar $alpha_centauri $map~alpha_centauri
	saveVar $alpha_centauri
	setVar $stardock $map~stardock
	saveVar $stardock
	setVar $backdoor $map~backdoor
	saveVar $backdoor
	setVar $home_sector $map~home_sector
	saveVar $home_sector
	setVar $alarm_list $bot~alarm_list
	saveVar $alarm_list
	setVar $player~unlimitedGame $player~unlimitedGame
	saveVar $player~unlimitedGame
	setVar $bot_turn_limit $bot~bot_turn_limit
	saveVar $bot_turn_limit
	setVar $steal_factor $game~steal_factor
	saveVar $steal_factor
	setVar $password $bot~password
	saveVar $password
	setVar $mode $bot~mode
	saveVar $mode
	setVar $subspace $bot~subspace
	saveVar $subspace
	setVar $ptradesetting $game~ptradesetting
	saveVar $ptradesetting

return

#INCLUDES:
include "source\bot_includes\bot"
include "source\bot_includes\bot\connectivity"
include "source\bot_includes\bot\internal_commands"
include "source\bot_includes\bot\menus"
include "source\bot_includes\bot\user_interface"
include "source\bot_includes\switchboard"
include "source\module_includes\modules\clear\modules"
include "source\module_includes\modules\xenter\modules"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\currentprompt\player"
include "source\bot_includes\player\startcnsettings\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\player\init\player"
include "source\bot_includes\player\moveintosector\player"
include "source\bot_includes\ship\getshipcapstats\ship"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\ship\savetheship\ship"
include "source\bot_includes\ship\loadshipinfo\ship"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\combat\holokill\combat"
include "source\bot_includes\planet\loadplanetinfo\planet"
include "source\bot_includes\planet\landonplanetentercitadel\planet"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\planet\getplanetstats\planet"
include "source\bot_includes\planet\landingsub\planet"
include "source\bot_includes\grid\surround\grid"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\map\displayadjacentgridansi\map"
include "source\bot_includes\map\commas\map"
include "source\bot_includes\map\displaysector\map"
include "source\bot_includes\game\gamestats\game"



