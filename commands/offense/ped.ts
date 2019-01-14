	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"PED - Photon, Enter, Defend"
	setVar $BOT~help[2] $BOT~tab&"      Used to launch a Photon into an adjacent Sector, Enter "
	setVar $BOT~help[3] $BOT~tab&"      Photon'd Sector and launches a Genesis Torpedo"
	setVar $BOT~help[4] $BOT~tab&"      "
	setVar $BOT~help[5] $BOT~tab&"      ped [Sector]"

	gosub :BOT~help_file

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
