# Mind Dagger / The Bounty Hunter Meat Grinder
 
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

	getWordPos $BOT~user_command_line $pos "turbo"
	if ($pos > 0)
		setVar $turbo TRUE
	else
		setVar $turbo FALSE
	end
	
	gosub :player~quikstats
	setvar $location $player~current_prompt

	if (($location <> "Command") and ($location <> "Citadel") and ($location <> "Planet"))
	        echo ANSI_12 "**This script must be started from the Command Prompt.**"
	        halt
	end
	

	setvar $planet_string ""
	if (($player~current_prompt = "Citadel") or ($player~current_prompt = "Planet"))
		if ($player~current_prompt = "Citadel")
			send "q "
		end
		setvar $from_planet true
		gosub :planet~getplanetinfo
		send "q "
		setvar $planet_string "l "&$PLANET~PLANET&"* n  m * * * q "
	end

	send "c;q"
	waitOn "Max Figs Per Attack:"
	getWord CURRENTLINE $maxFigAttack 5
	setVar $i 0
	setVar $loop 20

	send "'*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*    MD/TBH Meat Grinder Powering Up!   *[+] Add No  [-] Subtract No  [%] Exit*[r] Refurb                           *-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"
	killAllTriggers
	setDelayTrigger delay :changeAttack 1000
	pause

:burst
	if ($turbo = TRUE)
		while ($loop < 5)
			send $targetString&"zy z"&$maxFigAttack&"* "
			add $loop 1
		end
		send "@"
		waitOn "Average Interval Lag:"
	end
	setVar $loop 0
:execute
	killtrigger delay
	killtrigger stop
	killtrigger add
	killtrigger subtract
	killtrigger fed
	killtrigger miss
	killtrigger hit
	killtrigger empty
	killtrigger refurb
	setDelayTrigger delay :continue 40
	pause

:continue	
	setTextOutTrigger stop :stoppingPoint "%"
	setTextOutTrigger add :addN "+"
	setTextOutTrigger subtract :subtractN "-"
	setTextOutTrigger refurb :refurb "r"
	setTextLineTrigger fed :addN "Are you POSITIVE you want to attack this Federation StarShip?"
	setTextLineTrigger miss :burst "Do you want instructions (Y/N) [N]?"
	setTextLineTrigger empty :checkEmptyAttack "'s unmanned "
	setTextLineTrigger hit :execute "How many fighters do you wish to use ("

	send $targetString&"zy z"&$maxFigAttack&"* "&$planet_string
	pause
	
	

:stoppingPoint
	halt

:checkEmptyAttack
getWordPos CURRENTLINE $pos " (Y/N) [N]? Yes"
getWordPos CURRENTLINE $pos2 " (Y/N)Yes"
if (($pos <= 0) AND ($pos2 <= 0))
	setTextLineTrigger empty :checkEmptyAttack "'s unmanned "
	pause
end


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

:refurb
		gosub :PLAYER~quikstats
		if (($PLAYER~CURRENT_SECTOR = STARDOCK) AND (PORT.EXISTS[STARDOCK]))
			setVar $refurbString "p s s p "
		elseif ((($PLAYER~CURRENT_SECTOR = 1) OR (PORT.CLASS[$PLAYER~CURRENT_SECTOR] = 0)) AND (PORT.EXISTS[$PLAYER~CURRENT_SECTOR]))
			setVar $refurbString "p t "
		else
			setVar $refurbString ""
			echo "*No known class 0 or 9 port here to refurb at.*"
		end
		if (($refurbString <> "") AND ($PLAYER~CREDITS > 500000) and ($player~current_prompt <> "Planet"))
			if ($PLAYER~CURRENT_SECTOR = STARDOCK)
				send "p ss ys *p"
			elseif (($PLAYER~CURRENT_SECTOR = 1) OR (PORT.CLASS[$PLAYER~CURRENT_SECTOR] = 0))
				send "p ty"
			else
				echo "*No known class 0 or 9 port here to refurb at.*"
			end
			waitOn "B  Fighters        :"
			getWord CURRENTLINE $figsToBuy 8
			waitOn "C  Shield Points   :"
			getWord CURRENTLINE $shieldsToBuy 9
			if ($PLAYER~CURRENT_SECTOR = STARDOCK)
				setVar $leavestring "b "&$figsToBuy&"* c "&$shieldsToBuy&"* q q q "
			else
				setVar $leavestring "b "&$figsToBuy&"* c "&$shieldsToBuy&"* q "
			end
			send $leavestring
		end
	goto :execute

:clearScreen
	echo #27 & "[2J"
	return

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
