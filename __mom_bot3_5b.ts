systemscript
reqRecording
# TWX Script            : Mind Over Matter Bot
# Authors           : Mind Dagger / The Bounty Hunter / Lonestar
# Contributions/QA              : Misbehavin / DaCreeper / The Butcher
# Description           : Allows Corpies to use you while AFK and a Self Helper
# Credits           : Oz, Zentock, SupG, Dynarri, Cherokee, Alexio, Xide, Phx, Rincrast, Voltron, Traitor, Parrothead, PSI,

setVar $BOT~major_version   "3"
setVar $BOT~minor_version   "5beta"

goto :BOT~load_bot

:MAIN~module_vars
    saveVar $BOT~command
    setVar $command $BOT~command
    saveVar $command
    setVar $user_command_line $BOT~user_command_line
    saveVar $user_command_line
    saveVar $BOT~user_command_line
    setVar $bot_name $BOT~bot_name
    saveVar $bot_name
    setVar $parm1 $BOT~parm1
    saveVar $BOT~parm1
    saveVar $parm1
    setVar $parm2 $BOT~parm2
    saveVar $parm2
    saveVar $BOT~parm2
    setVar $parm3 $BOT~parm3
    saveVar $parm3
    saveVar $BOT~parm3
    setVar $parm4 $BOT~parm4
    saveVar $parm4
    saveVar $BOT~parm4
    setVar $parm5 $BOT~parm5
    saveVar $parm5
    saveVar $BOT~parm5
    setVar $parm6 $BOT~parm6
    saveVar $parm6
    saveVar $BOT~parm6
    setVar $parm7 $BOT~parm7
    saveVar $parm7
    saveVar $BOT~parm7
    setVar $parm8 $BOT~parm8
    saveVar $parm8
    saveVar $BOT~parm8
    saveVar $BOT~bot_turn_limit
    saveVar $PLAYER~unlimitedGame
return




:MAIN~backwards_compatible
    setVar  $safe_ship $BOT~safe_ship
    saveVar $safe_ship
    setVar  $safe_planet $BOT~safe_planet
    saveVar $safe_planet
    setVar $command $BOT~command
    saveVar $command
    setVar $user_command_line $BOT~user_command_line
    saveVar $user_command_line
    setVar $bot_name $BOT~bot_name
    saveVar $bot_name
    setVar $self_command $BOT~self_command
    saveVar $self_command
    setVar $parm1 $BOT~parm1
    saveVar $parm1
    setVar $parm2 $BOT~parm2
    saveVar $parm2
    setVar $parm3 $BOT~parm3
    saveVar $parm3
    setVar $parm4 $BOT~parm4
    saveVar $parm4
    setVar $parm5 $BOT~parm5
    saveVar $parm5
    setVar $parm6 $BOT~parm6
    saveVar $parm6
    setVar $parm7 $BOT~parm7
    saveVar $parm7
    setVar $parm8 $BOT~parm8
    saveVar $parm8
    setVar $rylos $MAP~rylos
    saveVar $rylos
    setVar $alpha_centauri $MAP~alpha_centauri
    saveVar $alpha_centauri
    setVar $stardock $MAP~stardock
    saveVar $stardock
    setVar $backdoor $MAP~backdoor
    saveVar $backdoor
    setVar $home_sector $MAP~home_sector
    saveVar $home_sector
    setVar $alarm_list $BOT~alarm_list
    saveVar $alarm_list
    setVar $unlimitedGame $PLAYER~unlimitedGame
    saveVar $unlimitedGame
    setVar $bot_turn_limit $BOT~bot_turn_limit
    saveVar $bot_turn_limit
    setVar $steal_factor $GAME~steal_factor
    saveVar $steal_factor
    setVar $password $BOT~password
    saveVar $password
    setVar $mode $BOT~mode
    saveVar $mode
    setVar $subspace $BOT~subspace
    saveVar $subspace
    setVar $ptradesetting $GAME~ptradesetting
    saveVar $ptradesetting

return

#INCLUDES:
include "Mombot\source\bot_includes\bot"
include "Mombot\source\bot_includes\player"
include "Mombot\source\bot_includes\switchboard"
include "Mombot\source\bot_includes\planet"
include "Mombot\source\bot_includes\ship"
include "Mombot\source\bot_includes\map"
include "Mombot\source\bot_includes\sector"
include "Mombot\source\bot_includes\game"
include "Mombot\source\bot_includes\bot\connectivity"
include "Mombot\source\bot_includes\bot\help"
include "Mombot\source\bot_includes\bot\internal_commands"
include "Mombot\source\bot_includes\bot\menus"
include "Mombot\source\bot_includes\bot\user_interface"

