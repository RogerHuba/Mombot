loadVar $bot_name
loadVar $user_command_line
loadVar $parm1
loadVar $parm2
loadVar $parm3
loadVar $parm4
loadVar $parm5
loadVar $parm6
loadVar $parm7
loadVar $parm8
setArray $dropSector 1000



getWordPos $user_command_line $pos "direct"
if ($pos > 0)
	setVar $direct TRUE
else
	setVar $direct FALSE
end
		
# ======================     START LIMP DROPPER (LDROP) SUBROUTINE    ==========================
:ldrop_start
	isNumber $test $parm1
	if ($test = TRUE)
		setVar $delay $parm1
	else
		setVar $delay 0
	end
	gosub :quikstats~quikstats
	setVar $startingLocation $quikstats~CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		send "'{" $bot_name "} - Must start from Citadel*"
		halt
	end
	send "q"
	gosub :planetinfo~getPlanetInfo
	send "q"
	getWordPos $user_command_line $pos "kill"
	if ($pos > 0)
		setVar $kill TRUE
		setVar $targeting~PLANET $planetinfo~PLANET
		gosub :targeting~initializetargeting
	else
		setVar $kill FALSE
	end
	
	setvar $home $quikstats~CURRENT_SECTOR

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
		send "l "&$planetinfo~PLANET&"* cp "&$adjsec&"*y"
		settextlinetrigger no_fig :ldrop_no_fig "Your own fighters must be in the destination"
		settextlinetrigger in_sector :ldrop_in_sector "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
		pause

	:ldrop_no_fig
		killtrigger in_sector
		send "'{" $bot_name "} - No Adjacent fig in drop sector*"
		goto :ldrop_scan

	:ldrop_in_sector
		killalltriggers
		if ($kill)
			gosub :targeting~scanitcitkill
		else
			send "s* "
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




include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\mombot\botIncludes\quikstats"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\mombot\botIncludes\planetinfo"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\mombot\botIncludes\targeting"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\mombot\botIncludes\shipstats"
