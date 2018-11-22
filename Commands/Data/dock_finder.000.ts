	logging off
		gosub :BOT~loadVars
	setVar $parm1 $BOT~parm1
	setVar $parm2 $BOT~parm2
	setVar $parm3 $BOT~parm3
	setVar $parm4 $BOT~parm4
	setVar $parm5 $BOT~parm5
	setVar $parm6 $BOT~parm6
	setVar $parm7 $BOT~parm7
	setVar $parm8 $BOT~parm8
	setVar $user_command_line $BOT~user_command_line


	setVar $BOT~help[1] $BOT~tab&"Searches for hidden dock. "
	setVar $BOT~help[2] $BOT~tab&"Assumes 6 warps out with a backdoor."
	gosub :BOT~help_file

	setVar $BOT~script_title "Dock Finder"
	gosub :BOT~banner


	setVar $possible ""
	setVar $sector 10
	if (STARDOCK > 0)
		setVar $SWITCHBOARD~message "Stardock already in database:"&STARDOCK&"*"
		gosub :SWITCHBOARD~switchboard		
		halt
	end
	while ($sector <= SECTORS)
		setVar $warps_out SECTOR.WARPCOUNT[$sector]
		setVar $warps_in  SECTOR.WARPINCOUNT[$sector]
		if ($warps_out = 6)
			if ($warps_in >= 7)
				if (PORT.EXISTS[$sector] = FALSE)
                                        if (SECTOR.EXPLORED[$sector] <> "YES")
					       setVar $possible $possible&" "&$sector			
                                        end				
				end
			end
		end
		add $sector 1
	end
	
	setVar $SWITCHBOARD~message "Stardock possibilities:"&$possible&"*"
	gosub :SWITCHBOARD~switchboard
	halt

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
