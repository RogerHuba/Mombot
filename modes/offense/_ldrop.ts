	reqRecording
	gosub :BOT~loadVars
	setVar $BOT~command "ldrop"
	loadVar $BOT~bot_turn_limit
	loadVar $MAP~stardock
	loadvar $bot~subspace
	loadvar $switchboard~self_command

	setVar $BOT~help[1]   $BOT~tab&"ldrop [delay] {kill} {direct} {return} "
	setVar $BOT~help[2]   $BOT~tab&"       "
	setVar $BOT~help[3]   $BOT~tab&"     {kill} - attempts to kill after drop "
	setVar $BOT~help[4]   $BOT~tab&"   {direct} - try to drop directly into the limp sector"
	setVar $BOT~help[5]   $BOT~tab&"   {return} - after drop, return to starting sector "
	setVar $BOT~help[6]   $BOT~tab&"              and scan again"
	setVar $BOT~help[7]   $BOT~tab&"    {delay} - how many milliseconds to wait before drop"
	gosub :BOT~help_file

	setVar $BOT~script_title "Limpet Dropper"
	gosub :BOT~banner

	setVar $PLAYER~save TRUE


	getSectorParameter SECTORS "FIGSEC" $isFigged



setArray $dropSector 1000



getWordPos $bot~user_command_line $pos "direct"
if ($pos > 0)
	setVar $direct TRUE
else
	setVar $direct FALSE
end
getWordPos $bot~user_command_line $pos "kill"
if ($pos > 0)
	setVar $kill TRUE
else
	setVar $kill FALSE
end
getWordPos $bot~user_command_line $pos "return"
if ($pos > 0)
	setVar $return TRUE
else
	setVar $return FALSE
end

isNumber $test $bot~parm1
if ($test = TRUE)
	setVar $delay $bot~parm1
else
	setVar $delay 0
end
		
# ======================     START LIMP DROPPER (LDROP) SUBROUTINE    ==========================
:ldrop_start
	gosub :player~quikstats
	setVar $startingLocation $player~CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "Must start from Citadel.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	send "q"
	gosub :planet~getPlanetInfo
	send "q"
	
	if ($kill)
		setVar $targeting~PLANET $planet~PLANET
		gosub :targeting~initialize_targeting
	end
	
	setvar $home $player~CURRENT_SECTOR

	:ldrop_re_scan
		setvar $i 0
		setvar $r 0

	:ldrop_scan
		killalltriggers
		send "q q q * k2"
		waitfor "Activated  Limpet  Scan"
		settextlinetrigger corp_limp  :ldrop_corp_limp "Corporate"
		settextlinetrigger pers_limp :ldrop_pers_limp "Personal "
		settextlinetrigger no_limp :ldrop_no_limp "No Active Limpet"
		settexttrigger lets_move :ldrop_re_scan "Command [TL="
		pause

	:ldrop_corp_limp
		add $i 1
		setVar $temp $dropSector[$i]
		getword CURRENTLINE $dropSector[$i] 1
		if ($temp <> 0)
			if ($dropSector[$i] <> $temp)
				getSectorParameter $dropSector[$i] "FIGSEC" $isFigged
				if ($isFigged)
					if ($direct)
						setVar $adjsec $dropSector[$i]
						goto :dropToSector
					else
						goto :ldrop_re_scan
					end
				end
				goto :ldrop_lets_move
			end
		end 
		settextlinetrigger corp_limp  :ldrop_corp_limp "Corporate"
		pause
	
	:ldrop_pers_limp
		add $i 1
		setVar $temp $dropSector[$i]
		getword CURRENTLINE $dropSector[$i] 1
		if ($temp <> 0)
			if ($dropSector[$i] <> $temp)
				getSectorParameter $dropSector[$i] "FIGSEC" $isFigged
				if ($isFigged)
					if ($direct)
						setVar $adjsec $dropSector[$i]
						goto :dropToSector
					else
						goto :ldrop_re_scan
					end
				end
				goto :ldrop_lets_move
			end
		end 
		settextlinetrigger pers_limp :ldrop_pers_limp "Personal"
		pause

	:ldrop_no_limp
		killalltriggers
		goto :ldrop_scan

	:ldrop_lets_move
		killalltriggers
		#gosub :turnOnAnsi
		gosub :ldrop_get_adj
	:dropToSector
		killalltriggers
		if ($delay > 0)
			setDelayTrigger delay_drop :go_go_go $delay
			pause
		end
	:go_go_go
		send "l "&$planet~PLANET&"* cp "&$adjsec&"*y"
		settextlinetrigger no_fig :ldrop_no_fig "Your own fighters must be in the destination"
		settextlinetrigger in_sector :ldrop_in_sector "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
		pause

	:ldrop_no_fig
		killtrigger in_sector
		setVar $SWITCHBOARD~message "No Adjacent fig in drop sector.*"
		gosub :SWITCHBOARD~switchboard
		goto :ldrop_scan

	:ldrop_in_sector
		killalltriggers
		if ($kill)
			gosub :targeting~scanit_cit_kill
		else
			send "s* "
		end
		if ($return)
			goto :ldrop_return_home
		end
		halt

	:ldrop_return_home
		send "p "&$home&"* "
		goto :ldrop_scan

	:ldrop_get_adj
		setVar $adjsec 0
		setVar $s 1
		while (SECTOR.WARPS[$dropSector[$i]][$s] > 0)
			setVar $checkSector SECTOR.WARPS[$dropSector[$i]][$s]
			getSectorParameter $checkSector "FIGSEC" $isFigged
			if ($isFigged)
				setVar $adjsec $checkSector
				return
			end
			add $s 1
		end
		goto :ldrop_re_scan
		
	return
# ======================     END LIMP DROPPER (LDROP) SUBROUTINE    ==========================


#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
include "source\bot_includes\targeting"
