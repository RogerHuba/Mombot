    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $self_command
    loadVar $stardock
    loadVar $command
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 
    loadvar $SWITCHBOARD~self_command 
    setVar $INVADER~parm1 $parm1
    setVar $INVADER~parm2 $parm2
    setVar $INVADER~parm3 $parm3
    setVar $INVADER~parm4 $parm4
    setVar $INVADER~parm5 $parm5
    setVar $INVADER~parm6 $parm6
    setVar $INVADER~user_command_line $user_command_line
    setVar $INVADER~command $command

:pex
:pel
:pelk
:ped
:pe
    gosub :INVADER~check_invade_macro_params
    setVar $INVADER~speed_invade_macro  $INVADER~enter&"     *  "
    setVar $INVADER~normal_invade_macro $INVADER~enter&"*            "
    gosub :INVADER~start_invade_macro
halt

# includes:
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\module_includes\prompt"
include "source\module_includes\invader"
