	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"PED - Photon, Enter, Defend"
	setVar $BOT~help[2] $BOT~tab&"      Used to launch a Photon into an adjacent Sector, Enter "
	setVar $BOT~help[3] $BOT~tab&"      Photon'd Sector and launches a Genesis Torpedo"
	setVar $BOT~help[4] $BOT~tab&"      "
	setVar $BOT~help[5] $BOT~tab&"      ped [Sector] {tow:n} {mass} {ret:n} {meatgrinder} "
	setVar $BOT~help[6] $BOT~tab&"     "
	setVar $BOT~help[7] $BOT~tab&"{tow:n}     Tow a ship in"
	setVar $BOT~help[8] $BOT~tab&"{mass}      Does not fire but waits for another person to shoot"
	setVar $BOT~help[9] $BOT~tab&"{retrigger} No mass retrigger on this command"
	setVar $BOT~help[10] $BOT~tab&"{meatgrinder} Photon in and start grinding! "
	setVar $BOT~help[11] $BOT~tab&"{ret:[n]}     Will attempt to move and trigger interdictor"
	setVar $BOT~help[12] $BOT~tab&"{mac:nnn}   run some random macro at end - BUGGY STILL"

	gosub :bot~helpfile

    gosub :INVADER~check_invade_macro_params
    setVar $INVADER~speed_invade_macro  $INVADER~enter&"     *  "
    setVar $INVADER~normal_invade_macro $INVADER~enter&"*            "
    gosub :INVADER~start_invade_macro
halt

# includes:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\invader"
