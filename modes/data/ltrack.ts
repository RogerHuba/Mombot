	reqRecording
	gosub :BOT~loadVars
	setVar $BOT~command "ltrack"

	setVar $BOT~help[1]    $BOT~tab&"ltrack "
	setVar $BOT~help[2]    $BOT~tab&"      Tracks active limpets and reports via subspace"
	gosub :bot~helpfile

	setVar $BOT~script_title "Limpet Tracker"
	gosub :BOT~banner

	setVar $PLAYER~save TRUE
	getSectorParameter SECTORS "FIGSEC" $isFigged


	setarray $limpets 100

	gosub :player~quikstats
	setVar $startingLocation $player~CURRENT_PROMPT
	if ($startingLocation <> "Command")
		setVar $SWITCHBOARD~message "Must start from Citadel or Command prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	:re_scan
	killtrigger 1
	killtrigger 2
	killtrigger 3
	killtrigger 4
	if (($switchboard~message <> "") and ($last_message <> $switchboard~message))
		# report on limpet locations here #
		setvar $last_message $switchboard~message
		gosub :switchboard~switchboard
	end
	setVar $SWITCHBOARD~message ""
	setvar $i 0
	send "k2"
	waitfor "Activated  Limpet  Scan"
	settextlinetrigger 1 :corp_limp "Corporate"
	settextlinetrigger 2 :pers_limp "Personal "
	settextlinetrigger 3 :no_limp "No Active Limpet"
	settexttrigger     4 :re_scan "Command [TL="
	pause

	:corp_limp
		getword CURRENTLINE $limpet_sector 1
		getwordpos $corp_history $pos " "&$limpet_sector&" "
		setVar $SWITCHBOARD~message $switchboard~message&"Corporate limpet: "&$limpet_sector&"*"
		settextlinetrigger 1  :ldrop_corp_limp "Corporate"
		pause
	
	:pers_limp
		getwordpos $pers_history $pos " "&$limpet_sector&" "
		setVar $SWITCHBOARD~message $switchboard~message&"Personal limpet: "&$limpet_sector&"*"
		pause

	:no_limp
		killalltriggers
		setVar $SWITCHBOARD~message $switchboard~message&"No limpets active, shutting down.*"
		gosub :switchboard~switchboard
		halt

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
