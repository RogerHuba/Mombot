loadVar $bot_name
loadVar $user_command_line
loadVar $parm1
loadVar $parm2
loadVar $parm3
loadVar $parm4
loadVar $parm5
loadVar $parm6
loadVar $parm7
loadVar $parm8
setVar $PLAYER_CASH_MAX		999999999
setVar $CITADEL_CASH_MAX	999999999999999

if ($parm1 = "help")
	send "'{" $bot_name "} - deposit {amount} - Deposits credits into citadel, default is max*"
	halt
end	



include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\"&$bot~mombot_directory&"\botIncludes\quikstats"
