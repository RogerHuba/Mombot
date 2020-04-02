#		fixes
#				moved stuff around for speed
#				added the 'manual' trigger
#				successful plock msg is sent b4 actual lock is made as a
#				fix for when interactive subprompts are off.
#				fixed :plockFinished, sent " n s* ", if the planet is a
#				level 6, this would have no effect
goto :Starting

:settriggers
	killalltriggers
	setTextLineTrigger	1	:manual			("Planet is now in sector "&$target_sector)
	setTextTrigger 		2	:plockFinished	("Planetary TransWarp Drive shutting down.")
	setTextTrigger 		3	:goPlock 		("Report Sector "&$target_sector&": ")
	setTextTrigger 		4	:goPlock 		("Limpet mine in "&$target_sector&" ")
	setTextTrigger 		5	:goPlock 		("Your mines in "&$target_sector&" ")
	setTextTrigger 		6	:goPlock 		("Locator beam lost.")
	pause

:goPlock
	killalltriggers
	if ($plock_delay > 0)
		setdelaytrigger plockdelay :continuePlock $plock_delay
		pause
	end
	:continuePlock
	send "y '{" $bot_name "} - PLOCK Launched*"
	if ($plockKill)
		gosub :targeting~scanitcitkill
		halt
	else
		send "s* "
		halt
	end
:plockFinished
	send "  s*   "
	send "'{" $bot_name "} - PLOCK Sector Cleared*"
	halt
:manual
	killAllTriggers
	if ($plockKill)
		gosub :targeting~scanitcitkill
	else
		send "s* "
	end
	halt
# includes:

:Starting
loadVar $user_command_line
loadVar $parm1
loadVar $parm2
loadVar $parm3
loadVar $parm4
loadVar $parm5
loadVar $parm6
loadVar $parm7
loadVar $parm8
loadVar $bot_name
# ======================     START PRELOCK DROP (PLOCK) SUBROUTINE    ==========================
:start_plock
	gosub :quikstats~quikstats
	setVar $startingLocation $quikstats~CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		send "'{" $bot_name "} - You must run Plocker from Citadel prompt.*"
     		halt
	end
	send "Q"
	gosub :planetinfo~getPlanetInfo
	send "C "
	getWordPos $user_command_line $pos "kill"
	if ($pos > 0)
		setVar $plockKill TRUE
		setVar $targeting~PLANET $planetinfo~PLANET
		gosub :targeting~initializetargeting

	else
		setVar $plockKill FALSE
	end
	setVar $target_sector $parm1
	isNumber $isnum $target_sector
	if ($isnum = 1)
		if (($target_sector > 10) and ($target_sector <= SECTORS) and ($target_sector <> STARDOCK))
			goto :planetPrelock
		elseif (($target_sector < 10) or ($target_sector >= SECTORS) or ($target_sector = STARDOCK))
			send "'{" $bot_name "} - Not a Valid PLOCK Sector*"
			halt
		end
	elseif ($isnum <> 1)
		send "'{" $bot_name "} - PLOCK Sector must be a number*"
		halt
	end
	isNumber $isnum $parm2
	if ($isnum)
		setvar $plock_delay $parm2
	else
		isNumber $isnum $parm3
		if ($isnum = 1)
			setvar $plock_delay $parm3
		end
	end

:planetPrelock
	if ($plockKill)
		send "'{" $bot_name "} - PLOCK Ready to fire Sector: " $target_sector ", auto kill enabled.*"
	else
		send "'{" $bot_name "} - PLOCK Ready to fire Sector: " $target_sector "*"
	end
	send "p " $target_sector "*"
	setTextLineTrigger prelockNo :plockNo "You do not have any fighters in Sector " & $target_sector & "."
	setTextLineTrigger prelockYes :plockYes "Locating beam pinpointed, TransWarp Locked."
	setTextLineTrigger prelockAlreadyThere :plockFinished "You are already in that sector!"
	pause

:plockNo
	send "'{" $bot_name "} - You do not have any fighters in that Sector*"
	halt


:plockYes
	goto :settriggers

# ======================     END PLOCK (PLOCK) SUBROUTINE     ==========================
include "C:\__TWX_\scripts\"&$bot~mombot_directory&"\botIncludes\targeting.ts"
include "C:\__TWX_\scripts\"&$bot~mombot_directory&"\botIncludes\quikstats.ts"
include "C:\__TWX_\scripts\"&$bot~mombot_directory&"\botIncludes\shipstats.ts"
include "C:\__TWX_\scripts\"&$bot~mombot_directory&"\botIncludes\planetinfo.ts"

