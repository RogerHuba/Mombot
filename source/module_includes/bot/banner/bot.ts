:banner
	setVar $SWITCHBOARD~message $script_title&" starting up!*"
	gosub :SWITCHBOARD~switchboard
return

include "source\bot_includes\switchboard"
