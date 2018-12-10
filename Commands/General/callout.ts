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
	
	loadVar $BOT~bot_team_name

	setVar $BOT~help[1] $BOT~tab&"Reports team name and current sector."
	gosub :BOT~help_file


	gosub :PLAYER~quikstats
	if ($BOT~bot_team_name = FALSE)
		setVar $BOT~bot_team_name "None"
	end
	setVar $SWITCHBOARD~SELF_COMMAND FALSE
    setVar $SWITCHBOARD~MESSAGE "Team: " & $BOT~bot_team_name & " Sec: "&$PLAYER~CURRENT_SECTOR&" Exp: "&$PLAYER~EXPERIENCE&" Aln: "&$PLAYER~ALIGNMENT&" Creds: "&$PLAYER~CREDITS&" Ship: "&$PLAYER~SHIP_NUMBER&" Turns: "&$PLAYER~TURNS&"*"
    gosub :SWITCHBOARD~SWITCHBOARD

halt

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"

