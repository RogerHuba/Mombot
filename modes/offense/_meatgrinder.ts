# Mind Dagger / The Bounty Hunter Meat Grinder
 
logging off
	gosub :BOT~loadVars
	setvar $player~save true

	setVar $BOT~help[1] $BOT~tab&"Meatgrinder tries to kill as fast as possible"
	setVar $BOT~help[2] $BOT~tab&"    {turbo} - speed over accuracy"
	setVar $BOT~help[3] $BOT~tab&"    {fedsafe} - If no longer fed safe, stop and hide"
	gosub :bot~helpfile

	getWordPos $BOT~user_command_line $pos "turbo"
	if ($pos > 0)
		setVar $turbo TRUE
	else
		setVar $turbo FALSE
	end
	getWordPos $BOT~user_command_line $pos "fedsafe"
	if ($pos > 0)
		setVar $fedsafe TRUE
	else
		setVar $fedsafe FALSE
	end
	
	gosub :player~quikstats
	setvar $location $player~current_prompt

	if (($location <> "Command") and ($location <> "Citadel") and ($location <> "Planet"))
	        echo ANSI_12 "**This script must be started from the Command Prompt.**"
	        halt
	end
	

	setvar $planet~planet_string ""
	if (($player~current_prompt = "Citadel") or ($player~current_prompt = "Planet"))
		if ($player~current_prompt = "Citadel")
			send "q "
		end
		setvar $from_planet true
		gosub :planet~getplanetinfo
		send "q "
		setvar $planet~planet_string "l "&$planet~planet&"* n  m * * * q "
	end

	gosub :ship~getshipstats


	setVar $i 0

	gosub :sector~getSectorData
	setvar $autoavoidcount ($sector~emptyShipCount + $sector~fakeTraderCount)
	setvar $j 1
	while ($j <= $autoavoidcount)
		#add n's to attack macro to avoid feds, aliens, and empty ships
		add $i 1
		add $j 1
	end
	
	setvar $player~startinglocation "Citadel"
	setVar $loop 20

	send "'*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*    MD/TBH Meat Grinder Powering Up!   *[+] Add No  [-] Subtract No  [%] Exit*[r] Refurb                           *-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"
	killAllTriggers
	setDelayTrigger delay :changeAttack 500
	pause

:didihit
	setvar $attemptedhit true
	goto :execute
:missed
	if ($attemptedhit = true)
		gosub :player~quikstats
		if ($fedsafe = true)
			if ((($player~alignment < 0) or ($player~experience > 1000)) and (($player~current_sector <= 10) or ($player~current_sector = $map~stardock)))
				#not fedsafe and still attacking - need to hide!
				if ($player~current_sector = 1)
					send "l 1*"
					setvar $switchboard~message "Stopping and hiding on Terra.  Not fed safe anymore!*"
					gosub :switchboard~switchboard
					halt
				else
					if ($player~current_sector = $map~stardock)
						send "ps* "
						setvar $switchboard~message "Stopping and hiding on Stardock.  Not fed safe anymore!*"
						gosub :switchboard~switchboard
						halt
					else
						send "'"&$bot~bot_name&" t h *"
						setvar $switchboard~message "Stopping and attempting to twarp home.  Not fed safe anymore!*"
						gosub :switchboard~switchboard
						halt
					end
				end
			end
		end
		setvar $attemptedhit false
		if ($player~fighters < $ship~SHIP_FIGHTERS_MAX)
			goto :refurb
		end
	end
:execute
:burst
	killtrigger wait
	killtrigger delay
	killtrigger stop
	killtrigger add
	killtrigger subtract
	killtrigger fed
	killtrigger miss
	killtrigger hit
	killtrigger empty
	killtrigger refurb
	killtrigger toomuchmiss
	if ($turbo = TRUE)
		setVar $loop 0
		setvar $send ""
		while ($loop < 200)
			setvar $send $send&$targetString&"z y  z"&$ship~SHIP_MAX_ATTACK&"* "&$planet~planet_string
			add $loop 1
		end
		send $send&"@"
		setTextLineTrigger wait :continue "Average Interval Lag:"
		pause
	else
		setDelayTrigger delay :continue 1
		pause
	end

:continue	
	setTextOutTrigger stop :stoppingPoint "%"
	setTextOutTrigger add :addN "+"
	setTextOutTrigger subtract :subtractN "-"
	setTextOutTrigger refurb :refurb "r"
	setTextLineTrigger fed :addN "Are you POSITIVE you want to attack this Federation StarShip?"
	setTextLineTrigger miss :missed "Do you want instructions (Y/N) [N]?"
	setTextLineTrigger empty :checkEmptyAttack "'s unmanned "
	setTextLineTrigger hit :didihit "How many fighters do you wish to use ("
	settextlinetrigger toomuchmiss :subtractN "<Re-Display>"
	send $targetString&"zy z"&$ship~SHIP_MAX_ATTACK&"* "&$planet~planet_string
	pause
	
	

:stoppingPoint
	halt

:checkEmptyAttack
getWordPos CURRENTLINE $pos " (Y/N) [N]? Yes"
getWordPos CURRENTLINE $pos2 " (Y/N)Yes"
getWordPos CURRENTLINE $pos3 " (Y/N) -Y"
if (($pos <= 0) AND ($pos2 <= 0) and ($pos3 <= 0))
	setTextLineTrigger empty :checkEmptyAttack "'s unmanned "
	pause
end


:addN
	add $i 1
	goto :changeAttack
:subtractN
	killtrigger wait
	killtrigger delay
	killtrigger stop
	killtrigger add
	killtrigger subtract
	killtrigger fed
	killtrigger miss
	killtrigger hit
	killtrigger empty
	killtrigger refurb
	killtrigger toomuchmiss
	subtract $i 1
	if ($i < 0)
		setVar $i 0
	end
	goto :changeAttack



:changeAttack

	setVar $targetString  "a "
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
			getWord CURRENTLINE $player~shieldsToBuy 9
			if ($PLAYER~CURRENT_SECTOR = STARDOCK)
				setVar $leavestring "b "&$figsToBuy&"* c "&$player~shieldsToBuy&"* q q q "
			else
				setVar $leavestring "b "&$figsToBuy&"* c "&$player~shieldsToBuy&"* q "
			end
			send $leavestring
		end
	goto :execute

:clearScreen
	echo #27 & "[2J"
	return

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\sector\getsectordata\sector"
