	reqRecording
	logging off
	gosub :BOT~loadVars
	setVar $BOT~command "listfromfile"
	loadVar $BOT~bot_turn_limit
	loadVar $MAP~stardock
	loadvar $bot~subspace

	setVar $BOT~help[1]   $BOT~tab&"listfromfile [file]"
	setVar $BOT~help[2]   $BOT~tab&"     Reads file with list of sectors and create sector params"
	setVar $BOT~help[3]   $BOT~tab&"     called TARGET"
	setVar $BOT~help[4]   $BOT~tab&"                     "
	setVar $BOT~help[5]   $BOT~tab&"             file - path to target file"
	
	gosub :BOT~help_file

	setVar $BOT~script_title "File List Reader"
	gosub :BOT~banner

		getWord $bot~user_command_line $bot~parm1 1 "EMPTY"
	
		if ($bot~parm1 <> "EMPTY")
			fileexists $test $bot~parm1
			if ($test = TRUE)
				setVar $target $bot~parm1
				readToArray $target $targetSectors
				setvar $list ""
				setvar $i 1
				while ($i <= $targetSectors)
					setvar $list $list&" "&$targetSectors[$i]&" "
					add $i 1
				end
				setvar $i 1
				while ($i <= SECTORS) 
					getWordPos $list $pos " "&$i&" "
					if ($pos > 0)
						setSectorParameter $i "TARGET" TRUE
					else 
						setSectorParameter $i "TARGET" ""
					end
					add $i 1
				end
				if ($targetSectors <= 0)
					setVar $SWITCHBOARD~message " No targets found in file: ["&$target&"] ..*"
					gosub :SWITCHBOARD~switchboard
					halt
				else
					setVar $SWITCHBOARD~message $targetSectors&" targets added to sectors from file: ["&$target&"] ..*"
					gosub :SWITCHBOARD~switchboard
					halt
				end
			else
				setVar $SWITCHBOARD~message " Target file: ["&$target&"] does not exist, shutting down..*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		else
			setVar $SWITCHBOARD~message " Target file: ["&$target&"] does not exist, shutting down..*"
			gosub :SWITCHBOARD~switchboard
			halt
		end



	halt




#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"

