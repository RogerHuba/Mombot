	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"xlk - Export, Land, Kill"
	setVar $BOT~help[2] $BOT~tab&"       Exports into another ship, and land on a "
	setVar $BOT~help[3] $BOT~tab&"       Planet then sends one wave of Fighters. "
	setVar $BOT~help[4] $BOT~tab&"       "
	setVar $BOT~help[6] $BOT~tab&"       xlk [ShipNumber] [PlanetNumber]"
	gosub :bot~helpfile

    gosub :INVADER~check_invade_macro_params
    setVar $INVADER~speed_invade_macro  $INVADER~xport&$INVADER~enter&"       * "
    setVar $INVADER~normal_invade_macro     $INVADER~xport&$INVADER~enter&"** "
    goto :INVADER~start_invade_macro

halt

# includes:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\invader"
