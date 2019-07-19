	reqRecording
	gosub :BOT~loadVars
	setVar $BOT~command "ldrop"
	loadVar $BOT~bot_turn_limit
	loadVar $MAP~stardock
	loadvar $bot~subspace
	loadvar $switchboard~self_command

	setVar $BOT~help[1]    $BOT~tab&"ldrop [delay] {plock/foton} {kill} {direct} {return} {figs:n} {0ffensive}"
	setVar $BOT~help[2]    $BOT~tab&"      "
	setVar $BOT~help[3]    $BOT~tab&"    {plock} - plocks sector and triggers directly or after {delay}"
	setVar $BOT~help[3]    $BOT~tab&"              if {return} is set plock cancels and returns after 5 seconds"
	setVar $BOT~help[4]    $BOT~tab&"    {foton} - lands 1 sector away and starts density foton"
	setVar $BOT~help[5]    $BOT~tab&"     {kill} - attempts to kill after drop (direct or plock)"
	setVar $BOT~help[6]    $BOT~tab&"   {direct} - try to drop directly into the limp sector"
	setVar $BOT~help[7]    $BOT~tab&"   {return} - after drop, return to starting sector "
	setVar $BOT~help[8]    $BOT~tab&"              and scan again"
	setVar $BOT~help[9]    $BOT~tab&"    {delay} - how many milliseconds to wait before drop or plock"
	setVar $BOT~help[10]   $BOT~tab&"   {figs:n} - drop this many figs to sector on landing"
	setVar $BOT~help[11]   $BOT~tab&"{offensive} - make figs offensive, default defense."
	gosub :bot~helpfile

	setVar $BOT~script_title "Limpet Dropper"
	gosub :BOT~banner

	setVar $PLAYER~save TRUE
	gosub :combat~init 


	getSectorParameter SECTORS "FIGSEC" $isFigged


gosub :player~quikstats

setArray $dropSector 1000


getWordPos $bot~user_command_line $pos "figs:"
if ($pos > 0)
	setVar $dropftrs TRUE
	setVar $cline $bot~user_command_line & " "
	getText $cline $dropFigQuant "figs:" " "

	getWordPos $bot~user_command_line $pos "offensive"
	if ($pos > 0)
		setVar $dropftrsType "o"
	else
		setVar $dropftrsType "d"
	end
else
	setVar $dropftrs FALSE
end

getWordPos $bot~user_command_line $pos "plock"
if ($pos > 0)
	setVar $plock TRUE
	setVar $SWITCHBOARD~message "We are running plock mode!*"
	gosub :SWITCHBOARD~switchboard
else
	setVar $plock FALSE
end

getWordPos $bot~user_command_line $pos "foton"
if ($pos > 0)
	setVar $foton TRUE
	if ($Player~Photons < 1)
		setVar $SWITCHBOARD~message "No Photons on Board!!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $SWITCHBOARD~message "We are landing and running density foton!*"
	gosub :SWITCHBOARD~switchboard
else
	setVar $foton FALSE
end

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
	isNumber $test $bot~parm2
	if ($test = TRUE)
		setVar $delay $bot~parm2
	else
		isNumber $test $bot~parm3
		if ($test = TRUE)
			setVar $delay $bot~parm3
		else
			setVar $delay 0
		end
	end
end


		
setVar $moveFigMacro ""

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
	
	
	if ($dropftrs)
		send "c"
		send "c;q"
		setTextLineTrigger shipMaxFtrs :shipMaxFtrs "Max Fighters:"
		pause
		:shipMaxFtrs
			killtrigger shipMaxFtrs
			getText CURRENTLINE $maxShipFigs "Max Fighters:" "Offensive Odds:"
			replaceText $maxShipFigs " " ""
			replaceText $maxShipFigs "," ""


		if ($PLANET~PLANET_FIGHTERS < $dropFigQuant)
			setVar $SWITCHBOARD~message "There are only " & $PLANET~PLANET_FIGHTERS & " fighters on the planet.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end

		setVar $SWITCHBOARD~message "Dropping " & $dropFigQuant & " on landing; Cannons not changed.*"
		gosub :SWITCHBOARD~switchboard

		setVar $moveFigMacro ""
		setVar $moved 0

		while ($moved < $dropFigQuant)
			
			setVar $toMove ($dropFigQuant - $moved)

			if ($toMove >= $maxShipFigs)
				setVar $thisMove $maxShipFigs
				setVar $moved ($moved + $thisMove)
			else
				setVar $thisMove $toMove
				setVar $moved $moved + $thisMove
			end

			setVar $moveFigMacro $moveFigMacro & "q m n t* q fz " & $moved & "* * zc" & $dropftrsType & " * l" & $PLANET~PLANET & " *m* t * c"
		end

	end
	


	send "q"
	if ($kill)
		setVar $targeting~PLANET $planet~PLANET
		gosub :targeting~initializetargeting
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
		if (($delay > 0) and ($plock = FALSE))
			setDelayTrigger delay_drop :go_go_go $delay
			pause
		end
	:plockFotonCheck
		if ($foton = TRUE)
			# see if this sector has an adjancet sector we can shoot from
			# We are targeting the ADjacent Sector they are entering

			setVar $s 1
			while ($s <= SECTOR.WARPINCOUNT[$adjsec])
				if (SECTOR.WARPSIN[$adjsec][$s] <> $dropSector[$i])

					setVar $checkSector SECTOR.WARPSIN[$adjsec][$s]
					getSectorParameter $checkSector "FIGSEC" $isFigged
					if ($isFigged)
						
						send "l "&$planet~PLANET&"*  c"
						send "p " $checkSector "*y"
						setTextLineTrigger denMoveNo :denMoveNo "You do not have any fighters in Sector " & $adjsec & "."
						setTextLineTrigger denMoveYes :denMoveYes "Locating beam pinpointed, TransWarp Locked."
						pause
						:denMoveNo
							killalltriggers
							send " q  q   "
							goto :ldrop_scan
						:denMoveYes
							
							setVar $BOT~command "foton"
							setVar $BOT~user_command_line " foton on d" 
							setVar $BOT~parm1 "on"
							setVar $BOT~parm2 "d"
							saveVar $BOT~parm1
							saveVar $BOT~parm2
							saveVar $BOT~command
							saveVar $BOT~user_command_line
							load "scripts\mombot\modes\offense\foton.cts"
							setEventTrigger        fotonended        :fotonended "SCRIPT STOPPED" "scripts\mombot\modes\offense\foton.cts"
							setdelaytrigger	fotonwait :fotonwait 5000
							pause
							:fotonwait
								
								stop "scripts\mombot\modes\offense\foton.cts"
								goto :ldrop_return_home
							:fotonended
								killalltriggers
								if ($return)
									goto :ldrop_return_home
								end
								halt
					end
				end
				add $s 1
			end
			goto :ldrop_scan
		elseif ($plock = TRUE)

			send "l "&$planet~PLANET&"*  c"
			send "p " $adjsec "*"
			setTextLineTrigger prelockNo :plockNo "You do not have any fighters in Sector " & $adjsec & "."
			setTextLineTrigger prelockYes :plockYes "Locating beam pinpointed, TransWarp Locked."
			
			pause
			:plockNo
			:plockNo
				killalltriggers
				setvar $switchboard~message "Lock Missed, back drop scanning...*"
				gosub :switchboard~switchboard
				send " q  q   "
				goto :ldrop_scan
			:plockYes
				killalltriggers
				:settriggers
					setvar $switchboard~message "Lock Aquired on " & $adjsec & "*"
					gosub :switchboard~switchboard
					killalltriggers
					setTextLineTrigger	1	:manual			("Planet is now in sector "&$adjsec)
					setTextTrigger 		2	:plockFinished	("Planetary TransWarp Drive shutting down.")
					setTextTrigger 		3	:goPlock 		("Report Sector "&$adjsec&": ")
					setTextTrigger 		4	:goPlock 		("Limpet mine in "&$adjsec&" ")
					setTextTrigger 		5	:goPlock 		("Your mines in "&$adjsec&" ")
					setTextTrigger 		6	:goPlock 		("Locator beam lost.")
					setdelaytrigger	plockCancel :plockCancel 5000
					pause
				:plockCancel
					killalltriggers
					setvar $switchboard~message "Plock not triggered after 5 seconds.. resuming..*"
					gosub :switchboard~switchboard
					send "n  q  q   "
					goto :ldrop_scan
				:goPlock
					killalltriggers
					if ($delay > 0)
						setdelaytrigger plockdelay :continuePlock $delay
						pause
					end
					:continuePlock
						killalltriggers
						send "y '{" $bot_name "} - PLOCK Launched*"
						if ($kill)
							setVar $targeting~PLANET $planet~PLANET
							gosub :targeting~initializetargeting
						else
							send "s* "
						end
						if ($return)
							setvar $switchboard~message "I will return and resume Ldrop Plock in 10 seconds...*"
							gosub :switchboard~switchboard
							setdelaytrigger	plockBack :plockBack 10000
							pause
							:plockBack
								killalltriggers
								goto :ldrop_return_home
						end
						halt
				:plockFinished
					killalltriggers
					send "  s*   "
					send "'{" $bot_name "} - PLOCK Sector Cleared*"
					send " q  q   "
					goto :ldrop_scan
				:manual
					killAllTriggers
					if ($kill)
						gosub :targeting~scanitcitkill
					else
						send "s* "
					end
					
					halt
			

			
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
		if ($dropftrs)
			send $moveFigMacro
		end

		if ($kill)
			gosub :targeting~scanitcitkill
		else
			send "s* "
		end
		if ($return)
			if ($dropftrs)
				setVar $BOT~command "movefig"
				setVar $BOT~user_command_line " movefig p "& $dropFigQuant 
				setVar $BOT~parm1 $p
				setVar $BOT~parm2 $dropFigQuant
				saveVar $BOT~parm1
				saveVar $BOT~parm2
				saveVar $BOT~command
				saveVar $BOT~user_command_line
				load "scripts\mombot\modes\resource\movefig.cts"
				setEventTrigger        moveended        :moveended "SCRIPT STOPPED" "scripts\mombot\modes\resource\movefig.cts"
				pause
				:moveended
					killalltriggers
					
			end
			goto :ldrop_return_home
		end
		halt

	:ldrop_return_home
		send "p "&$home&"* y"
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
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\targeting\initializetargeting\targeting"
include "source\bot_includes\targeting\scanitcitkill\targeting"
