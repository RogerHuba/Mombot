	reqRecording
gosub :BOT~loadVars

#started from new database 10k sectors - 1:42
#ended - 2:05

#HELP FILE
		setVar $BOT~help[1]  $BOT~tab&"bubbles - Find bubbles quickly in game"
		setVar $BOT~help[2]  $BOT~tab&"  "
		gosub :bot~helpfile

	gosub :player~quikstats
	if (($player~CURRENT_PROMPT <> "Command") AND ($player~CURRENT_PROMPT <> "Citadel"))
		setvar $switchboard~message "Must be run from Command or Citadel prompt.*"
		gosub :switchboard~switchboard
		halt		
	end

	clearallavoids
	send "cv0*y y q "
	setArray $bubble sectors 1
	setVar $i 11
	setVar $count 0
	setVar $perc 0
	while ($i <= SECTORS)
			getCourse $path $i 1 
			if ($path = "-1")
				send "^f"&$i&"*1**q"
				waitOn "ENDINTERROG"
				getCourse $path $i 1 
			end
			setVar $j 1
			setVar $found_bubble_sector FALSE
			while ($j <= $path)
					add $bubble[$path[$j]] 1
					#place bubble sector in array for later verification
					setvar $bubble[$path[$j]][1] $i
					add $j 1
			end
		setVar $percTest (($i * 100) / SECTORS)
		if ($percTest > $perc)
			setVar $perc (($i * 100) / SECTORS)
			echo "*"
			echo #27 "["&($perc / 2)&"C"
			echo ANSI_14 "°" ANSI_15 " " $perc "%" #27 & "[1A   "
		end
		add $i 1
	end

	clearallavoids
	setvar $i 1
	while ($i <= sectors)
		if ($bubble[$i] > 5)
			setavoid $i
			getCourse $path $bubble[$i][1] 1 
			if ($path = "-1")
				send "c v "&$i&"*q "
				send "^f"&$bubble[$i][1]&"*1**q"
				waitOn "ENDINTERROG"
				send "cv0*y y q "
				getCourse $path $bubble[$i][1] 1 
			end
			if ($path <> "-1")
				setvar $bubble[$i] 0
			end
			clearavoid $i
		end
		setVar $percTest (($i * 100) / SECTORS)
		if ($percTest > $perc)
			setVar $perc (($i * 100) / SECTORS)
			echo "*"
			echo #27 "["&($perc / 2)&"C"
			echo ANSI_14 "°" ANSI_15 " " $perc "%" #27 & "[1A   "
		end
		add $i 1
	end


	setvar $switchboard~message "Best guess for bubbles in the game:*"
	setvar $i 1
	while ($i <= sectors)
		if ($bubble[$i] > 100)
			setvar $switchboard~message $switchboard~message&$i&" : "&$bubble[$i]&"*"
		end
		add $i 1
	end
	gosub :switchboard~switchboard
	halt

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
