	gosub :BOT~loadVars
	loadVar $BOT~bot_turn_limit
	loadVar $PLAYER~unlimitedGame

	setVar $BOT~help[1]   $BOT~tab&"  port {build/create} {destroy/kill} {upgrade/max}                "
	setVar $BOT~help[2]   $BOT~tab&"  Options:"
	setVar $BOT~help[3]   $BOT~tab&"     port build {port name} "
	setVar $BOT~help[4]   $BOT~tab&"       - create sbb port in sector if possible"
	setVar $BOT~help[5]   $BOT~tab&"         {port name} - Name of port to create "
	setVar $BOT~help[6]   $BOT~tab&"                   default: Mind ()ver Matter "
	setVar $BOT~help[7]   $BOT~tab&"      "
	setVar $BOT~help[8]   $BOT~tab&"     port destroy "
	setVar $BOT~help[9]   $BOT~tab&"       - blow up port in sector if possible"
	setVar $BOT~help[10]  $BOT~tab&"      "
	setVar $BOT~help[11]  $BOT~tab&"     port upgrade {f} {o} {e} {noexp}"
	setVar $BOT~help[12]  $BOT~tab&"       - upgrade port if possible, using treasury if available"
	setVar $BOT~help[13]  $BOT~tab&"             {f} - upgrade fuel"
	setVar $BOT~help[14]  $BOT~tab&"             {o} - upgrade organics"
	setVar $BOT~help[15]  $BOT~tab&"             {e} - upgrade equipment"
	setVar $BOT~help[16]  $BOT~tab&"         {noexp} - upgrade without experience increase"
	setVar $BOT~help[16]  $BOT~tab&"                   default: s/b/b upgraded"
	gosub :BOT~help_file


	setVar $bot_name $SWITCHBOARD~bot_name
	
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
		setVar $SWITCHBOARD~message "You must run port helper from command or citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	loadVar $planet~planet
	
	setvar $i 1
	setvar $line $bot~user_command_line
	setvar $nothing "<>!<>junk<>!<>!"
	getword $line $word 1 $nothing

	while ($word <> $nothing)
		add $i 1
		getword $line $word $i $nothing
		if ($word <> $nothing)
			setvar $bot~user_command_line $bot~user_command_line&$word&" "
		end
	end

	if (($bot~parm1 = "build") OR ($bot~parm1 = "create"))
		gosub :port~build_port
		halt
	elseif (($bot~parm1 = "destroy") or ($bot~parm1 = "kill"))
		gosub :port~destroy_port
		halt
	elseif (($bot~parm1 = "max") or ($bot~parm1 = "upgrade"))
		gosub :port~upgrade_port
		halt
	else
		setVar $SWITCHBOARD~message "Option used for port helper not recognized.  Try build/create/destroy/kill/upgrade/max options.*"
		gosub :SWITCHBOARD~switchboard
		halt	
	end

halt

#INCLUDES:
include "source\module_includes\bot"
include "source\module_includes\port"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
include "source\module_includes\prompt"