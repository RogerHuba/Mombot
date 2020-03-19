	logging off
	gosub :BOT~loadVars
	loadvar $bot~LIMP_COUNT_FILE
	loadVar $bot~ARMID_COUNT_FILE
	loadVar $bot~LIMP_FILE
	loadVar $bot~ARMID_FILE

	setVar $BOT~help[1]  $BOT~tab&" history "
	setVar $BOT~help[2]  $BOT~tab&"   "
	setVar $BOT~help[3]  $BOT~tab&"     Displays the most recent self commands"
	setVar $BOT~help[4]  $BOT~tab&"     this bot has given."

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

	setvar $i $BOT~historyCount
	while ($i >= 1)
		if ($history[$i] <> "0")
			setvar $switchboard~message $switchboard~message&$history[$i]&"*"
		end
		subtract $i 1
	end

	gosub :switchboard~switchboard
halt

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
