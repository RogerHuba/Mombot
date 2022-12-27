
	
	logging off
	clearAllAvoids
	gosub :BOT~loadVars
	loadvar $MAP~STARDOCK
	loadvar $map~home_sector

	goSub :player~quikstats
	setVar $BOT~help[1]  $BOT~tab&"   Gets all ports with MOOPARAM and chks status "
	setVar $BOT~help[2]  $BOT~tab&"       "
	setVar $BOT~help[3]  $BOT~tab&"   xmaschk"
	setVar $BOT~help[4]  $BOT~tab&"       "
	setVar $BOT~help[5]  $BOT~tab&"    "
	setVar $BOT~help[6]  $BOT~tab&"   "
	setVar $BOT~help[7]  $BOT~tab&"   "
	setVar $BOT~help[8]  $BOT~tab&"   "
	setVar $BOT~help[9]  $BOT~tab&"       "
	setVar $BOT~help[10]  $BOT~tab&" "
	
	gosub :bot~helpfile

	setVar $BOT~script_title "XMas Check"
	gosub :BOT~banner


	setvar $line $bot~user_command_line
	

	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation <> "Command")
		setVar $SWITCHBOARD~message "Must be started from Command prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end


	
	setVar $foundi 0

	setVar $readyAmnt 60000

	# Ready To go - %
	setVar $readyi 0
	setVar $readyPort ""
	setVar $readyPorti 0

	setVar $errori 0
	setVar $errorPort ""
	setVar $errorPorti 0
	
	setVar $reportsReq 0
	setVar $portReported 0
	setVar $ports 0

	send "c"
	waitfor "<Computer activated>"
	
	setvar $i 1
	while ($i <= sectors)
		
		getSectorParameter $i "MOOPORT" $mooport
		if ($mooport = 1)
			send "r" $i "*"
			
			add $reportsReq 1
			setVar $ports[$reportsReq] $i
		end
		add $i 1
	end

	setVar $di 0
	:reporting
	setTextLineTrigger getNextSectorReport :getNextSectorReport "Commerce report for"
	setTextLineTrigger getNextSectorNoReport :getNextSectorNoReport "have no information about a port in that se"
	pause
	:getNextSectorReport
		killAllTriggers
		add $di 1
		setVar $portReported[$di] "yes"

		if ($di >= $reportsReq)
			goto :finishReporting
		else
			goto :reporting
		end

	:getNextSectorNoReport
		killAllTriggers
		add $di 1
		setVar $portReported[$di] "no"

		if ($di >= $reportsReq)
			goto :finishReporting
		else
			goto :reporting
		end
	
	:finishReporting

	send q
	waitfor "<Computer deactivated>"
	
	setVar $dangeri 0
	setVar $dangerReports 0

	setvar $i 1
	while ($i <= $reportsReq)
		
		setVar $danger 0
		setVar $dangerreport ""
		setVar $sector $ports[$i]
		
		getSectorParameter $sector "FIGSEC" $isFigged
		getSectorParameter $sector "LIMPSEC" $hasLimp
		
		if ($isFigged = 0)
			setVar $danger 1
			setVar $dangerreport $sector & " No Fig"
		end

		if ($hasLimp = 0)
	
			
			if ($danger = 1)
				setVar $dangerreport $dangerreport & " & No Limp "
			else
				setVar $dangerreport $sector & " No Limp"
			end
			setVar $danger 1
		end

		setVar $onhand PORT.FUEL[$sector]
		setVar $perc PORT.PERCENTFUEL[$sector]

		if ($perc = 0)
			setVar $totalFuel 0
		elseif ($perc < 100)
			setPrecision 2
			setVar $totalFuel ($onhand/($perc/100))
			setPrecision 0
		else
			setVar $totalFuel $onhand
		end

		setVar $di 1

		
		while ($di <= SECTOR.WARPINCOUNT[$sector])
			getSectorParameter SECTOR.WARPSIN[$sector][$di] "FIGSEC" $hasFig
			getSectorParameter SECTOR.WARPSIN[$sector][$di] "LIMPSEC" $hasLimp
			
			if (($hasFig = 0) or ($hasLimp = 0))
				
				
				if ($danger = 1)
					setVar $dangerreport $dangerreport &", " & SECTOR.WARPSIN[$sector][$di] & " F:" & $hasFig &" L:" & $hasLimp 
				else
					setVar $dangerreport SECTOR.WARPSIN[$sector][$di] & " F:" & $hasFig &" L:" & $hasLimp 
				end
				setvar $danger 1
			end
			add $di 1
		end
		
		if ($danger = 1)
	
			add $dangeri 1
			setVar $dangerReports[$dangeri] $dangerreport
		else  
			# port Good
			add $readyPorti 1
			setVar $readyPort[$readyPorti] $sector & " @ " & $onhand & "/" & $perc
			if ($onhand > $readyAmnt)
				setVar $readyPort[$readyPorti] $readyPort[$readyPorti] & " - Good to go!"
			end 
	
		end

		add $i 1
	end


	setVar $SWITCHBOARD~message $SWITCHBOARD~message & "MOOPORT Report - SAFE SECTORS*"
	
	setVar $i 1
	while ($i <= $readyPorti)

		setVar $SWITCHBOARD~message $SWITCHBOARD~message & $readyPort[$i] & "*"
		add $i 1
	end 


	
	if ($dangeri > 0)
		setVar $SWITCHBOARD~message $SWITCHBOARD~message & "Following Ports Have Failures*"
	
	end

	setVar $i 1
	while ($i <= $dangeri)

		setVar $SWITCHBOARD~message $SWITCHBOARD~message & $dangerReports[$i] & "*"
		add $i 1
	end 
	gosub :SWITCHBOARD~switchboard
	halt
	setVar $i 1
	
	

	while ($i <= $foundi)
		setVar $SWITCHBOARD~message $SWITCHBOARD~message & "S: " &  $foundSectors[$i] & " F: " & $foundFigged[$i] & " M: " & $foundMCIC[$i]
		setVar $SWITCHBOARD~message $SWITCHBOARD~message & " UP: " & $portUpgraded[$i] & " T: " & $foundDistTerra[$i]&  " SD: " & $foundDistSD[$i]
		if (foundDangerReport[$i] <> "")
			setVar $SWITCHBOARD~message $SWITCHBOARD~message & " d: " & $foundDangerReport[$i] & "*"
		end
		add $i 1
	end

	setVar $SWITCHBOARD~message $SWITCHBOARD~message & "*"
	gosub :SWITCHBOARD~switchboard

	setVar $SWITCHBOARD~message "Ready Ports: " & $ready & "**"
	gosub :SWITCHBOARD~switchboard

	#setVar $SWITCHBOARD~message "Port Report Ready: " & $readyPort & "**"
	#gosub :SWITCHBOARD~switchboard


	setVar $SWITCHBOARD~message "DID WE DO MSL/LISTAMTRAK? MSL SECS: " & $countMslSec & " AMTRAK SECS: " & $countAmtrak & "*"
	gosub :SWITCHBOARD~switchboard


halt
#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
