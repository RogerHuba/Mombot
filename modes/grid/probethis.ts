	reqRecording
	logging off
	gosub :BOT~loadVars
	loadVar $MAP~STARDOCK
	loadVar $MAP~BACKDOOR
	loadVar $bot~Folder
	loadvar $map~rylos
	loadvar $map~alpha_centauri

	setVar $BOT~help[1]  $BOT~tab&"probethis [param/all] {novoid} {restock} {resume} {unexplored}"
	setVar $BOT~help[2]  $BOT~tab&"     "
	setVar $BOT~help[3]  $BOT~tab&"Will ether probe all sectors marked with param selected."
	setVar $BOT~help[4]  $BOT~tab&" 	   {param examples:}"
	setVar $BOT~help[5]  $BOT~tab&"     	- all - will just probe everything"
	setVar $BOT~help[6]  $BOT~tab&"     	- msl - custom param"
	setVar $BOT~help[7]  $BOT~tab&"     	- bubble - custom param"
	setVar $BOT~help[8]  $BOT~tab&"     	- uppedport - custom from query command"
	setVar $BOT~help[9] $BOT~tab&"     {novoid}  - Will not void sectors where probe destroyed"
	setVar $BOT~help[10] $BOT~tab&"     {restock}  - Will attempt to restock probes even if not at stardock"
	setVar $BOT~help[11] $BOT~tab&"     {unexplored}  - Will only probe unexplored sectors in param/preset"
	setVar $BOT~help[12] $BOT~tab&"     {destroy}  - Will broadcast destroyed sector probes on ss"
	setVar $BOT~help[13] $BOT~tab&"     {ss}  - Will broadcast traders, ships, and planets on ss"
	setVar $BOT~help[14] $BOT~tab&"     {trader}  - Will broadcast traders on ss"
	setVar $BOT~help[15] $BOT~tab&"     {ships}  - Will broadcast empty ships on ss"
	setVar $BOT~help[16] $BOT~tab&"     {planets}  - Will broadcast planets on ss"
	setVar $BOT~help[17] $BOT~tab&"     {aliens}  - Will broadcast aliens and alien space on ss (coming soon)"
	setVar $BOT~help[18] $BOT~tab&"     {navhaz}  - Will broadcast navhaz"
	setVar $BOT~help[19] $BOT~tab&"     {resume}  - Continue last run"
	setVar $BOT~help[20] $BOT~tab&" "
	setVar $BOT~help[21] $BOT~tab&"     Example: probethis uppedports restock novoid ss"
	setVar $BOT~help[22] $BOT~tab&"     Items of interest are ALWAYS logged to mombot game directory"
	gosub :bot~helpfile
	setVar $BOT~script_title "probethis - Eprobe explorer"
	gosub :BOT~banner

	getTime $datefile "'probethis_found_'dmyyyy"
	getTime $unreachfile "'probethis_unreachable_'dmyyyy"
	setVar $unreachableFile $bot~Folder&"/" & $unreachfile & ".txt"
	setVar  $probethis_found     $bot~Folder&"/" & $datefile & ".txt"

	
	if ($bot~parm1 <> "")
		setVar $bot~parmAM $bot~parm1
		upperCase $bot~parmAM
	end
	gosub :player~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	send "** "
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Planet") AND ($startingLocation <> "Command"))
	
		setVar $SWITCHBOARD~message "Must be in Command, Citadel or Planet prompt to run*"
		gosub :SWITCHBOARD~switchboard
		halt
		
	end

    getWordPos $bot~user_command_line $pos "restock"
	if ($pos > 0)
		setVar $restock_active TRUE
		if ($startingLocation = "Command") and (PORT.BUYFUEL[$player~CURRENT_SECTOR] = 1)
			setVar $SWITCHBOARD~message "Can only restock from command prompt when at a XXS sector.*"
			gosub :SWITCHBOARD~switchboard
		end
	else
		setVar $restock_active FALSE
	end

	setVar $firstRestock TRUE

	setVar $void_active TRUE
	getWordPos $bot~user_command_line $pos "novoid"
	if ($pos > 0)
		setVar $void_active FALSE
	end

	getWordPos $bot~user_command_line $pos "resume"
	if ($pos > 0)
		setVar $resume_last TRUE
	else
		setVar $resume_last FALSE
	end

	# added for fire - but it'll auto check bank for more creds
	setVar $check_bank FALSE
	getWordPos $bot~user_command_line $pos "bank"
	if ($pos > 0)
		setVar $check_bank TRUE
	end

	getWordPos $bot~user_command_line $pos "destroy"
	if ($pos > 0)
		setVar $broadcast_destroyed TRUE
	else
		setVar $broadcast_destroyed FALSE
	end

	setVar $broadcast_traders FALSE
	setVar $broadcast_ships FALSE
	setVar $broadcast_planets FALSE
	setVar $broadcast_aliens FALSE
	setVar $broadcast_navhaz FALSE
	
	getWordPos $bot~user_command_line $pos "ss"
	if ($pos > 0)
		setVar $broadcast_traders TRUE
		setVar $broadcast_ships TRUE
		setVar $broadcast_planets TRUE
		setVar $broadcast_aliens TRUE
		setVar $broadcast_navhaz TRUE
	end

	getWordPos $bot~user_command_line $pos "traders"
	if ($pos > 0)
		setVar $broadcast_traders TRUE
	end
	getWordPos $bot~user_command_line $pos "ships"
	if ($pos > 0)
		setVar $broadcast_ships TRUE
	end
	getWordPos $bot~user_command_line $pos "planets"
	if ($pos > 0)
		setVar $broadcast_planets TRUE
	end
	getWordPos $bot~user_command_line $pos "aliens"
	if ($pos > 0)
		setVar $broadcast_aliens TRUE
	end
	getWordPos $bot~user_command_line $pos "navhaz"
	if ($pos > 0)
		setVar $broadcast_navhaz TRUE
	end


	if ($startingLocation = "Citadel")
		send "s* q "
	end

	setVar $shipCount 0
	if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
		gosub :PLANET~GETPLANETINFO
		send "q "
		setvar $restock_active TRUE
	end
	send "*"

	getWordPos $bot~user_command_line $pos "unexplored"
	if ($pos > 0)
		setvar $unexplored true
	else
		setvar $unexplored false
	end
	if ($resume_last = true)
		gosub :resumeTargets
	else
		gosub :getTargets
	end
	

	setvar $switchboard~message "Starting up probe this!  Probing all unexplored sectors with "&$bot~parmAM&" set.*"
	gosub :switchboard~switchboard

	if ($databasecount <= 0)
		setvar $switchboard~message "No sector parameters found for "&$bot~parmAM&" set to a value of "&$output&" or already explored.*"
		gosub :switchboard~switchboard
		halt
	end
	window gridder 350 450 "Mowing to probe this: ["&$bot~parmAM&"]" ontop 

	gosub :player~quikstats

	# so we don't report a sector twice
	setArray $reportedSectors SECTORS

	fileExists $exists $unreachableFile
	if ($exists = fALSE)
		write $unreachableFile "listing sectors we can not reach with probes using: "
		
	end

	write $unreachableFile $bot~user_command_line 
	
	:do_again
		
		getRnd $random 1 $databaseCount
		getWord $randomSectors $destination $random

		:probeAgain
		if ($player~eprobes <= 0)
echo $player~credits " " $restock_active "*"
echo $player~credits " " $restock_active "*"
echo $player~credits " " $restock_active "*"
			if (($player~credits > 100000) AND ($restock_active = TRUE))
				gosub :restock
			else
				setVar $switchboard~message "Out of e-probes and can't restock.*"
				gosub :switchboard~switchboard
				halt
			end
		end
		
		setVar $Last_Entering_Sector 0
		# current sector storage
		setVar $currentSectorLog ""
		# storage for info found
		setVar $writefileLog ""
		# storage for info found
		setVar $subspaceLog ""
	
		# We've found something to report
		setVar $writeFileCurrentSector 0
		# We've found something to report to subspace
		setVar $subspaceAlertCurrentSector 0
		# We are reporting to sub at end of probe
		setVar $subspaceAlertAtEnd 0
		# We are writing to file at end of probe
		setVar $writeFileAtEnd 0

		if ($destination = 0)
			setVar $switchboard~message "All sectors probed.*"
			gosub :switchboard~switchboard
			halt		
		else
			send "ez"&$destination&"*"
			
			settextlinetrigger 1 :next "Probe Self Destructs"
			settextlinetrigger 2 :destroyed "Probe Destroyed!"
			settextlinetrigger 12 :noroute "No route within "
			settextlinetrigger 3 :next "You are already in that sector!"
			settextlinetrigger 4 :get_info "Probe entering sector :"
			settextlinetrigger 5 :out_of_probes "You do not have any Ether Probes."
			settextlinetrigger 6 :found_planets "Planets :"
			settextlinetrigger 7 :found_traders "Traders :"
			settextlinetrigger 8 :found_ships "Ships   :"
			settextlinetrigger 9 :found_aliens "Aliens  :"
			settextlinetrigger 10 :found_navhaz "NavHaz  :"
			settextlinetrigger 13 :found_rylos "Ports   : Rylos, Class 0 (Special)"
			settextlinetrigger 14 :found_alpha "Ports   : Alpha Centauri, Class 0 (Special)"
			setTextLineTrigger 11 :therest ""
		
			pause
		end

		:found_rylos
			if ($map~rylos = 0)

				setVar $map~rylos $Last_Entering_Sector
				setVar $report_rylos 1
				setVar $writeFileCurrentSector 1

			end
			pause
		:found_alpha
			if ($map~alpha_centauri = 0)

				setVar $map~alpha_centauri $Last_Entering_Sector
				setVar $report_alpha 1
				setVar $writeFileCurrentSector 1

			end
			pause
			
		:out_of_probes
			KillAllTriggers
			gosub :player~quikstats
			goSub :probeAgain
		:therest
			
			getLength CURRENTLINE $len
			if ($len > 0)
				setVar $currentSectorLog $currentSectorLog & "*" & CURRENTLINE 
			end
			setTextLineTrigger 11 :therest ""
			pause

		:found_planets
			if ($broadcast_planets = TRUE)
				setVar $subspaceAlertCurrentSector 1
			end
			setVar $writeFileCurrentSector 1
			setVar $currentSectorLog $currentSectorLog & "*" & CURRENTLINE 
			settextlinetrigger 6 :found_planets "Planets :"
			pause
		:found_ships
			if ($broadcast_ships = TRUE)
				setVar $subspaceAlertCurrentSector 1
			end
			setVar $writeFileCurrentSector 1
			setVar $currentSectorLog $currentSectorLog & "*" & CURRENTLINE 
			settextlinetrigger 8 :found_ships "Ships   :"
			pause
		:found_traders
			if ($broadcast_traders = TRUE)
				setVar $subspaceAlertCurrentSector 1
			end
			setVar $writeFileCurrentSector 1
			setVar $currentSectorLog $currentSectorLog & "*" & CURRENTLINE 
			settextlinetrigger 7 :found_traders "Traders :"
			pause
		:found_aliens
			if ($broadcast_aliens = TRUE)
				setVar $subspaceAlertCurrentSector 1
			end
			setVar $writeFileCurrentSector 1
			setVar $currentSectorLog $currentSectorLog & "*" & CURRENTLINE 
			settextlinetrigger 9 :found_aliens "Aliens  :"
			pause
		:found_navhaz
			if ($broadcast_navhaz = TRUE)
				setVar $subspaceAlertCurrentSector 1
			end
			setVar $writeFileCurrentSector 1
			setVar $currentSectorLog $currentSectorLog & "*" & CURRENTLINE 
			settextlinetrigger 10 :found_navhaz "NavHaz  :"
			pause

	
        :get_info
			goSub :processEndOfSector
			# Reset Log Vars
			setVar $writeFileCurrentSector 0
			setVar $subspaceAlertCurrentSector 0
			setVar $reportCurrentSector ""

			getWord CURRENTLINE $Last_Entering_Sector 5
			setVar $temp " "&$Last_Entering_Sector&" "
			getwordpos $randomSectors $pos $temp 
			if ($pos > 0)
				#if eprobe sees a sector we were going to eprobe later, remove it as seen#
				replaceText $randomSectors $temp " "
				subtract $databasecount 1	
			end
			settextlinetrigger 4 :get_info "Probe entering sector :"
			pause
		:noroute
			KillAllTriggers
			send "n"
			write $unreachableFile $destination 
			setVar $temp " "&$destination&" "
			getwordpos $randomSectors $pos $temp 
			if ($pos > 0)
				replaceText $randomSectors $temp " "
				subtract $databasecount 1	
				setSectorParameter $destination "PTHISTARGZ" ""
			end
			setvar $window_content "*      Targets left to probe:"&$databaseCount&"*"
			savevar $window_content
			setWindowContents gridder $window_content
			goto :next
        :destroyed
			goSub :processEndOfSector
			KillAllTriggers
			if ($broadcast_destroyed = TRUE)
				setVar $SWITCHBOARD~message "Probe destroyed sector:" & $Last_Entering_Sector & "*"
				gosub :SWITCHBOARD~switchboard
			end
			if ($void_active = TRUE)
				send "cv" $Last_Entering_Sector "*q"
			end

			goSub :processEndOfProbe

			if ($Last_Entering_Sector = $destination) or ($void_active = FALSE)
				write $unreachableFile $destination
				goto :next
			else
				goSub :probeAgain
			end
 		:next
			KillAllTriggers
			goSub :processEndOfSector
			goSub :processEndOfProbe
			setSectorParameter $destination "PTHISTARGZ" ""
			setVar $temp " "&$destination&" "
			getwordpos $randomSectors $pos $temp 
			if ($pos > 0)
				replaceText $randomSectors $temp " "
				subtract $databasecount 1	
				
			end
			setvar $window_content "*      Targets left to probe:"&$databaseCount&"*"
			savevar $window_content
			setWindowContents gridder $window_content

	goto :do_again

:processEndOfProbe

	if ($subspaceAlertAtEnd = 1)
		setVar $SWITCHBOARD~message "Probe Report:" & $subspaceLog & "*"
		gosub :SWITCHBOARD~switchboard
	end
	if ($report_alpha = 1)
		setVar $SWITCHBOARD~message "Alpha Found in Sector:" & $map~alpha_centauri & "*"
		gosub :SWITCHBOARD~switchboard
		setVar $report_alpha 0
	end
	if ($report_rylos = 1)
		setVar $SWITCHBOARD~message "Rylos Found in Sector:" & $map~rylos & "*"
		gosub :SWITCHBOARD~switchboard
		setVar $report_rylos 0
	end
	if ($writeFileAtEnd = 1)
		write $probethis_found $writefileLog
	end

return

:processEndOfSector
	# Self Destruct - Destroyed Message
	if ($Last_Entering_Sector > 0)

		if ($reportedSectors[$Last_Entering_Sector] = 0)
			setVar $reportedSectors[$Last_Entering_Sector] 1
			
			if ($subspaceAlertCurrentSector = 1)
				setVar $subspaceLog $subspaceLog & $currentSectorLog
				setVar $subspaceAlertAtEnd 1
			end
			if ($writeFileCurrentSector = 1)
				setVar $writefileLog $writefileLog & $currentSectorLog
				setVar $writeFileAtEnd 1
			end
		end

	end

	setVar $currentSectorLog ""
	setVar $writeFileCurrentSector 0
	setVar $subspaceAlertCurrentSector 0
	setVar $reportCurrentSector ""
return
:resumeTargets

	setVar $databasecount 0
	setVar $randomSectors "  "
	setVar $path_database "  "
	setVar $perc 0
	setVar $i 1
	while ($i <= SECTORS)
		
		getWordPos $path_database $pos " "&$i&" "
		if ($pos <= 0)
			getSectorParameter $i "PTHISTARGZ" $isTrue
			if ($isTrue = TRUE)
				setVar $randomSectors $randomSectors&" "&$i&"  "
				
				add $databasecount 1
				getCourse $path $player~current_sector $i 
				if ($path = "-1")
					#send "/"
					#waitOn #179
					#echo ANSI_14 "Updating database...*" ANSI_7
					#send "^f"&$player~current_sector&"*"&$i&"**q"
					#waitOn "ENDINTERROG"
					#getCourse $path $player~current_sector $i 
				else
					setVar $j 2
					while ($j <= $path)
						setVar $path_database $path_database&" "&$path[$j]&" "
						
						add $j 1
					end
				end
			end
		end
		setVar $percTest (($i * 100) / SECTORS)
		if ($percTest > $perc)
			setVar $perc (($i * 100) / SECTORS)
			echo "*"
			echo #27 "["&($perc / 2)&"C"
			echo ANSI_14 "�" ANSI_15 " " $perc "%" #27 & "[1A   "
		end
		add $i 1
	end
return

:getTargets

	setVar $databasecount 0
	setVar $randomSectors "  "
	setVar $path_database "  "
	setVar $perc 0
	setVar $i 1
	while ($i <= SECTORS)
		setSectorParameter $i "PTHISTARGZ" ""
		getWordPos $path_database $pos " "&$i&" "
		if ($pos <= 0)
			if ($bot~parmAM = "ALL")
				setVar $isTrue TRUE
			else
				getSectorParameter $i $bot~parmAM $isTrue
			end
			if (($isTrue = TRUE) and (((SECTOR.EXPLORED[$i] <> "YES") and ($unexplored = true)) or ($unexplored = false)))
				setVar $randomSectors $randomSectors&" "&$i&"  "
				setSectorParameter $i "PTHISTARGZ" "1"
				add $databasecount 1
				getCourse $path $player~current_sector $i 
				if ($path = "-1")
					#send "/"
					#waitOn #179
					#echo ANSI_14 "Updating database...*" ANSI_7
					#send "^f"&$player~current_sector&"*"&$i&"**q"
					#waitOn "ENDINTERROG"
					#getCourse $path $player~current_sector $i 
				else
					setVar $j 2
					while ($j <= $path)
						setVar $path_database $path_database&" "&$path[$j]&" "
						
						add $j 1
					end
				end
			end
		end
		setVar $percTest (($i * 100) / SECTORS)
		if ($percTest > $perc)
			setVar $perc (($i * 100) / SECTORS)
			echo "*"
			echo #27 "["&($perc / 2)&"C"
			echo ANSI_14 "�" ANSI_15 " " $perc "%" #27 & "[1A   "
		end
		add $i 1
	end
return

:restock

goSub :player~quikstats
setVar $dockrestock 0

if ($player~CURRENT_SECTOR = $map~stardock)
	setVar $dockrestock 1
	goto :dockrestock
end

KillAllTriggers
SetTextLineTrigger sdyes :sdyes "Commerce report for Stargate Alpha I:"
SetTextLineTrigger sdno1  :sdno  "You have never visted sector"
SetTextLineTrigger sdno2  :sdno  "I have no information about a port in that sector."
setDelayTrigger sdno3 :sdno 10000
#had to add WaitFors b/c AllKeys was bypassing display
send "C"
WaitFor "<Computer activated>"
send "R"
WaitFor "What sector is the port"
send $map~stardock "*"

Pause
Pause

:sdno
	send "q"
	setVar $SWITCHBOARD~message "SD is not in that sector, or never been visited!! Shutting down in starting sector.*"
	gosub :SWITCHBOARD~switchboard
	HALT

:sdyes
	KillAllTriggers
	send "q"
	if ($startingLocation = "Command")
		if ($firstRestock = true)
			send "cf" $player~current_sector "*" $map~stardock "*"
			setTextLineTrigger theShortestPath1 :theShortestPath1 "The shortest path"
			pause
			:theShortestPath1
				KillAllTriggers
				getWord CURRENTLINE $sdToo 4
				send "f" $map~stardock "*" $player~current_sector "*q"
				setTextLineTrigger theShortestPath2 :theShortestPath2 "The shortest path"
				pause
				:theShortestPath2
					KillAllTriggers
					getWord CURRENTLINE $sdfrom 4
					stripText $sdfrom "("
					stripText $sdToo "("
					setVar $twarpFuelRequired (($sdfrom + $sdToo) * 3)
echo "Fuel to get there and back: " $twarpFuelRequired "*"
echo "Fuel to get there and back: " $twarpFuelRequired "*"
echo "Fuel to get there and back: " $twarpFuelRequired "*"

		end

		if ($player~ORE_HOLDS < $twarpFuelRequired)

			send "cr*q"
			waitfor "tems     Status  Trading % of max OnBoa"
			setTextLineTrigger fuelAtPort :fuelAtPort "Fuel Ore"
			pause
			:fuelAtPort
				KillAllTriggers
				getWord CURRENTLINE  $fuelAtPort 4
				if ($fuelAtPort < 255)
					send "o 1 9* 1 9* 1 9* q"
				end

			send "p t * * * " 
			waitfor "<Port>"
			waitfor "Command ["
		end
	else
		send "l"&$planet~planet&"* t * l 1 * t * l 2 * t * l 3 * s * l 1 * s * l 2 * s * l 3 * t * t1*m* * * q "
		WaitFor "Command [TL"
	end
if (($map~backdoor <> 0) and ($player~ALIGNMENT < 1000))
	KillAlltriggers
	SetTextTrigger nofig :nofig "Do you want to make this jump blind?"
	SetTextTrigger ready1 :ready1 "Locating beam pinpointed,"
    SetTextTrigger nofuel2 :nofuel "You do not have enough Fuel Ore to make the jump"	
	send "m" $map~backdoor "*y"
	Pause
    Pause
End
SetTextTrigger nofig :nofig "Do you want to make this jump blind?"
SetTextTrigger ready2 :ready2 "All Systems Ready, shall we engage?"
SetTextTrigger nofuel1 :nofuel "You do not have enough Fuel Ore to make the jump"	
send "nsy"
Pause
Pause

:nofig
	KillAlltriggers
	send "n"
	setVar $SWITCHBOARD~message "No fig at target sector. Shutting Down*"
	gosub :SWITCHBOARD~switchboard
	HALT

:nofuel
	KillAlltriggers
	setVar $SWITCHBOARD~message "No fuel for twarp. Shutting Down*"
	gosub :SWITCHBOARD~switchboard
	HALT



:ready1
	send "Y"
:dockrestock
	send " P S"
	KillAlltriggers
	SetTextTrigger limpet :limpet "ort official runs up"
	SetTextTrigger buytorps :buytorps "<StarDock> Where to?"
	
	Pause
	Pause

:ready2
	KillAllTriggers
	SetTextTrigger limpet :limpet "ort official runs up"
	SetTextTrigger buytorps :buytorps "<StarDock> Where to?"
	send "Y PS"
	Pause
	Pause

:limpet
	send "Y"
	Pause

:buytorps
	KillAlltriggers
	SetTextTrigger torps :torps "How many Probes do you want"
	send "HE"
	Pause
	Pause

:torps 
GetWord CURRENTLINE $numtorps 8
StripText $numtorps ")"
send $numtorps & "*"

if ($check_bank = TRUE)
	send "qgw*"
	waitfor "credits in your account."
end

if ($dockrestock = 1)
	send "Q Q "
	gosub :player~quikstats
	return
else
	send "Q Q M " & $player~current_sector & " * Y"
end
SetTextTrigger nofig :nofig3 "Do you want to make this jump blind?"
SetTextTrigger ready3 :ready3 "Locating beam pinpointed,"
SetTextTrigger nofuel :nofuel3 "You do not have enough Fuel Ore to make the jump"
Pause
Pause
:nofuel3
:nofig3
	send "psh"
	KillAlltriggers
	setVar $SWITCHBOARD~message "No fuel for twarp or no fig at starting point, on dock*"
	gosub :SWITCHBOARD~switchboard
	halt
:ready3
	send "Y"
	WaitFor "Command [TL"
	if ($startingLocation <> "Command")
		send "l"&$planet~planet&"* t n l 1* q q * j y * "
	end
	gosub :player~quikstats
Return



#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\banner\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\currentprompt\player"
