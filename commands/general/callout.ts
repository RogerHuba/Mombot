	gosub :BOT~loadVars
	
	loadVar $BOT~bot_team_name

	setVar $BOT~help[1] $BOT~tab&"Reports team name and current sector."
	gosub :bot~helpfile


	gosub :PLAYER~quikstats
	if ($BOT~bot_team_name = FALSE)
		setVar $BOT~bot_team_name "None"
	end
	setVar $SWITCHBOARD~SELF_COMMAND FALSE
    setVar $SWITCHBOARD~MESSAGE "Team: " & $BOT~bot_team_name & " Sec: "&$PLAYER~CURRENT_SECTOR&" Exp: "&$PLAYER~EXPERIENCE&" Aln: "&$PLAYER~ALIGNMENT&" Creds: "&$PLAYER~CREDITS&" Ship: "&$PLAYER~SHIP_NUMBER&" Turns: "&$PLAYER~TURNS&"*"
    gosub :SWITCHBOARD~SWITCHBOARD

halt

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
