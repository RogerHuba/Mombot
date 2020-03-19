	logging off
	gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&" history {limit#}"
	setVar $BOT~help[2]  $BOT~tab&"   "
	setVar $BOT~help[3]  $BOT~tab&"     Displays the most recent self commands"
	setVar $BOT~help[4]  $BOT~tab&"     this bot has given."
	setVar $BOT~help[5]  $BOT~tab&"         "
	setVar $BOT~help[6]  $BOT~tab&"     {limit#} - display the last # of commands"

	gosub :bot~helpfile

	setVar $bot~historyMax      100

	loadVar $BOT~historyString
	setVar $BOT~historyCount 0



	setvar $switchboard~message ""

	getWordPos $BOT~historyString $pos "<<|HS|>>"
	while (($pos > 0) AND ($BOT~historyCount < $BOT~historyMax))
		cutText $BOT~historyString $archive 1 ($pos-1)
		replaceText $BOT~historyString $archive&"<<|HS|>>" "" 
		setVar $history[($BOT~historyCount+1)] $archive
		add $BOT~historyCount 1
		getWordPos $BOT~historyString $pos "<<|HS|>>"
	end

	isNumber $isnumber $bot~parm1
	if ($isnumber = true)
		setvar $history_limit $bot~parm1
	end
	if ($history_limit = 0)
		setvar $history_limit $BOT~historyCount
	end

	setvar $i $BOT~historyCount
	setvar $count 0
	setvar $switchboard~message $switchboard~message&"Displaying last "&$history_limit&" commands in self command prompt:*"
	while (($i >= 1) and ($count <= $history_limit))
		if ($history[$i] <> "0")
			setvar $switchboard~message $switchboard~message&$history[$i]&"*"
		end
		subtract $i 1
		add $count 1
	end

	gosub :switchboard~switchboard
halt

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
