# Mind Dagger / The Bounty Hunter Meat Grinder
 
	
	
	cutText CURRENTLINE $location 1 7
	if ($location <> "Command")
	        echo ANSI_12 "**This script must be started from the Command Prompt.**"
	        halt
	end
	
	send "c;q"
	waitOn "Max Figs Per Attack:"
	getWord CURRENTLINE $maxFigAttack 5
	setVar $i 0
	send "'*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*    MD/TBH Meat Grinder Powering Up!   *[+] Add No  [-] Subtract No  [%] Exit*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"
	killAllTriggers
	setDelayTrigger delay :changeAttack 2000
	pause

:execute
	killtrigger delay
	killtrigger stop
	killtrigger add
	killtrigger subtract
	killtrigger fed
	killtrigger miss
	killtrigger hit
	setDelayTrigger delay :continue 50
	pause

:continue	
	setTextOutTrigger stop :stoppingPoint "%"
	setTextOutTrigger add :addN "+"
	setTextOutTrigger subtract :subtractN "-"
	setTextLineTrigger fed :execute "Are you POSITIVE you want to attack this Federation StarShip?"
	setTextLineTrigger miss :execute "Do you want instructions (Y/N) [N]?"
	setTextLineTrigger hit :execute "How many fighters do you wish to use ("
	send $targetString&"zy z"&$maxFigAttack&"* "
	pause
	
	

:stoppingPoint
	halt

:addN
	add $i 1
	goto :changeAttack
:subtractN
	subtract $i 1
	if ($i < 0)
		setVar $i 0
	end
	goto :changeAttack



:changeAttack

	setVar $targetString  "a"
	setVar $total 0
	while ($total < $i)
		setVar $targetString $targetString&"* "
		add $total 1
	end
	
	goto :execute

:clearScreen
	echo #27 & "[2J"
	return
