	gosub :BOT~loadVars

	setArray $INTERNALCOMMANDLISTS 7
	setVar $bot~internalCommandLists[1]  " stopall stop listall reset emq bot relog tow refresh login logoff unlock lift with dep callin about cn extern twarp bwarp pwarp relog help switchbot "
	setVar $bot~internalCommandLists[2]  " " 
	setVar $bot~internalCommandLists[3]  " hkill kill htorp "
	setVar $bot~internalCommandLists[4]  " refurb scrub "
	setVar $bot~internalCommandLists[5]  " surround exit xenter mow "
	setVar $bot~internalCommandLists[6]  " "
	setVar $bot~internalCommandLists[7]  " find pscan sector storeship setvar getvar "
	setVar $bot~doubledCommandList       " parm params parms qss sec sect secto cn9 logout emx smow port shipstore finder xenter status pinfo holotorp"
	setVar $bot~internalCommandList     $bot~internalCommandLists[1]&$bot~internalCommandLists[2]&$bot~internalCommandLists[3]&bot~$internalCommandLists[4]&$bot~internalCommandLists[5]&$bot~internalCommandLists[6]&$bot~internalCommandLists[7]
	setArray $bot~TYPES 7
	setVar $bot~TYPES[1] "General"
	setVar $bot~TYPES[2] "Defense"
	setVar $bot~TYPES[3] "Offense"
	setVar $bot~TYPES[4] "Resource"
	setVar $bot~TYPES[5] "Grid"
	setVar $bot~TYPES[6] "Cashing"
	setVar $bot~TYPES[7] "Data"
	setArray $bot~CATAGORIES 3
	setVar $bot~CATAGORIES[1] "Modes"
	setVar $bot~CATAGORIES[2] "Commands"
	setVar $bot~CATAGORIES[3] "Daemons"



goto :USER_INTERFACE~runUserCommandLine

halt




:MAIN~module_vars
	saveVar $bot~command
	saveVar $bot~user_command_line
	setVar $switchboard~bot_name $bot~bot_name
	saveVar $switchboard~bot_name
	savevar $bot~name
	saveVar $bot~parm1
	saveVar $bot~parm2
	saveVar $bot~parm3
	saveVar $bot~parm4
	saveVar $bot~parm5
	saveVar $bot~parm6
	saveVar $bot~parm7
	saveVar $bot~parm8
	saveVar $bot~bot_turn_limit
	saveVar $player~unlimitedGame
	gosub :MAIN~backwards_compatible
return




:MAIN~backwards_compatible
	setVar  $safe_ship $bot~safe_ship
	saveVar $safe_ship
	setVar  $safe_planet $bot~safe_planet
	saveVar $safe_planet
	setVar $command $bot~command
	saveVar $command
	setvar $user_command_line $bot~user_command_line
	saveVar $user_command_line
	setVar $bot_name $bot~bot_name
	saveVar $bot_name
	setVar $self_command $bot~self_command
	saveVar $self_command
	setvar $parm1 $bot~parm1
	setvar $parm2 $bot~parm2
	setvar $parm3 $bot~parm3
	setvar $parm4 $bot~parm4
	setvar $parm5 $bot~parm5
	setvar $parm6 $bot~parm6
	setvar $parm7 $bot~parm7
	setvar $parm8 $bot~parm8
	if ($parm1 = "")
		setvar $parm1 "0"
	end
	if ($parm2 = "")
		setvar $parm2 "0"
	end
	if ($parm3 = "")
		setvar $parm3 "0"
	end
	if ($parm4 = "")
		setvar $parm4 "0"
	end
	if ($parm5 = "")
		setvar $parm5 "0"
	end
	if ($parm6 = "")
		setvar $parm6 "0"
	end
	if ($parm7 = "")
		setvar $parm7 "0"
	end
	if ($parm8 = "")
		setvar $parm8 "0"
	end
	saveVar $parm1
	saveVar $parm2
	saveVar $parm3
	saveVar $parm4
	saveVar $parm5
	saveVar $parm6
	saveVar $parm7
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

#-=-=-=-=-includes-=-=-=-=-
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\bot\internal_commands"
include "source\bot_includes\bot\user_interface"
