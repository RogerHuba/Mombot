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
    setVar $user_command_line $bot~user_command_line
    saveVar $user_command_line
    saveVar $bot~user_command_line
    setVar $bot_name $bot~bot_name
    saveVar $bot_name
    setVar $parm1 $bot~parm1
    saveVar $bot~parm1
    saveVar $parm1
    setVar $parm2 $bot~parm2
    saveVar $parm2
    saveVar $bot~parm2
    setVar $parm3 $bot~parm3
    saveVar $parm3
    saveVar $bot~parm3
    setVar $parm4 $bot~parm4
    saveVar $parm4
    saveVar $bot~parm4
    setVar $parm5 $bot~parm5
    saveVar $parm5
    saveVar $bot~parm5
    setVar $parm6 $bot~parm6
    saveVar $parm6
    saveVar $bot~parm6
    setVar $parm7 $bot~parm7
    saveVar $parm7
    saveVar $bot~parm7
    setVar $parm8 $bot~parm8
    saveVar $parm8
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
    setVar $user_command_line $bot~user_command_line
    saveVar $user_command_line
    setVar $bot_name $bot~bot_name
    saveVar $bot_name
    setVar $self_command $bot~self_command
    saveVar $self_command
    setVar $parm1 $bot~parm1
    saveVar $parm1
    setVar $parm2 $bot~parm2
    saveVar $parm2
    setVar $parm3 $bot~parm3
    saveVar $parm3
    setVar $parm4 $bot~parm4
    saveVar $parm4
    setVar $parm5 $bot~parm5
    saveVar $parm5
    setVar $parm6 $bot~parm6
    saveVar $parm6
    setVar $parm7 $bot~parm7
    saveVar $parm7
    setVar $parm8 $bot~parm8
    saveVar $parm8
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
    setVar $unlimitedGame $player~unlimitedGame
    saveVar $unlimitedGame
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
include "mombot\source\bot_includes\bot"
include "mombot\source\bot_includes\player"
include "mombot\source\bot_includes\switchboard"
include "mombot\source\bot_includes\planet"
include "mombot\source\bot_includes\ship"
include "mombot\source\bot_includes\map"
include "mombot\source\bot_includes\sector"
include "mombot\source\bot_includes\game"
include "mombot\source\bot_includes\bot\connectivity"
include "mombot\source\bot_includes\bot\internal_commands"
include "mombot\source\bot_includes\bot\menus"
include "mombot\source\bot_includes\bot\user_interface"

