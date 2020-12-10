
	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"PXEX - Photon, Xport, Enter, Xport "
	setVar $BOT~help[2] $BOT~tab&"       Used to launch a Photon into an adjacent Sector then immediately "
	setVar $BOT~help[3] $BOT~tab&"       Xport into another Ship and Enter Photoned Sector; then, Xport "
	setVar $BOT~help[4] $BOT~tab&"       back into Photon ship. "
	setVar $BOT~help[5] $BOT~tab&"             "
	setVar $BOT~help[6] $BOT~tab&"       pxex [Sector] [ShipNumber] {tow:n} {mass} {retrigger}"
	setVar $BOT~help[7] $BOT~tab&"       "
	setVar $BOT~help[8] $BOT~tab&"{tow:n}     Tow a ship in"
	setVar $BOT~help[9] $BOT~tab&"{mass}      Does not fire but waits for another person to shoot"
	setVar $BOT~help[10] $BOT~tab&"{retrigger} Will reset and repeat macro on photon fire (mass only)"
	setVar $BOT~help[11] $BOT~tab&"      "
	setVar $BOT~help[12] $BOT~tab&"            Additional Options after main macro done - small delay added "
	setVar $BOT~help[13] $BOT~tab&"{rr:[n]}    xport back to ShipNum and attempt to retreat n times "
	setVar $BOT~help[14] $BOT~tab&"{dl:pnum}   xport back to ShipNum and land on planet n."
	setVar $BOT~help[15] $BOT~tab&"{xkill:n}   xport back after a delay and attempt to kill citkill person."
	setVar $BOT~help[16] $BOT~tab&"            n is number of figs to shoot. Best with tow:n"
	setVar $BOT~help[17] $BOT~tab&"{mac:nnn}   run some random macro at end - BUGGY STILL"
	
		gosub :bot~helpfile

    gosub :INVADER~check_invade_macro_params
    setVar $INVADER~speed_invade_macro  $INVADER~xport&$INVADER~enter&"       * "
   	setVar $INVADER~speed_invade_macro_retrigger  $INVADER~xport &"m       * "
    setVar $INVADER~normal_invade_macro     $INVADER~xport&$INVADER~enter&"** "
    setVar $INVADER~normal_invade_macro_retrigger     $INVADER~xport &"m** "
    goto :INVADER~start_invade_macro

halt

# includes:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\invader"
