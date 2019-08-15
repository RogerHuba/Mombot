# WHEN DOING trade filename.txt amke sure it has a fig!
#   Perhaps assuming not next door do a lock test

# ISS - Marco] {rem} - Pairs Traded: 54 Cash Made: 6156959 Turns Taken: 2310 - full trading

gosub :BOT~loadVars

loadVar $game~port_max
loadVar $game~ptradesetting
loadVar $game~MAX_PLANETS_IN_GAME
loadVar $bot~Folder
loadVar $PLAYER~SURROUNDFIGS			
loadVar $PLAYER~SURROUNDLIMP;			
loadVar $PLAYER~SURROUNDMINE			
loadVar $MAP~STARDOCK	
loadVar $BOT~LIMP_FILE 		
loadVar $BOT~ARMID_FILE 
loadvar $bot~bot_turn_limit

setVar $BOT~help[1]  $BOT~tab&"       Marco Polo - Trade Route for PPTing"
setVar $BOT~help[2]  $BOT~tab&"       "
setVar $BOT~help[3]  $BOT~tab&" macro [trade/report] {turns} {filename.txt} "
setVar $BOT~help[4]  $BOT~tab&"                      "
setVar $BOT~help[5]  $BOT~tab&" trade  - indicates bot will trade the route"
setVar $BOT~help[6]  $BOT~tab&" report - indicates bot will write route to file"
setVar $BOT~help[7]  $BOT~tab&" "
setVar $BOT~help[8]  $BOT~tab&" {filename.txt} - can either be used as a source"
setVar $BOT~help[9]  $BOT~tab&"                  route or for writing to share."
setVar $BOT~help[10]  $BOT~tab&"  "
setVar $BOT~help[11]  $BOT~tab&" {turns}       - Compulsary when trade option used "
setVar $BOT~help[12]  $BOT~tab&"                 stops trading when reaching turns"
setVar $BOT~help[13]  $BOT~tab&"  "
setVar $BOT~help[14]  $BOT~tab&"  Marco requires pairs to have one ore seller."
setVar $BOT~help[15]  $BOT~tab&"  Please update CIM Ports/Warps and Figs."

gosub :BOT~helpfile


gosub :player~quikstats
setvar $startcredits $player~credits
setvar $startturns $player~turns
setVar $stat_pairs_traded 0
setVar $cash_made 0
setVar $turns_taken 0

# trade or report
setVar $mode ""
# from own data or file  self/file
setVar $trademode "" 

setArray $PortsUsed SECTORS

# report for port pair - currently using only figged sectors
#   report[1] sec1
#   report[2] sec2
#   report[3] sec1 > sec2 dist
#   report[4] sec2 > sec1 dist
setVar $portPairs 0
setVar $portPairsi 0

setVar $totalDist 0
setVar $oneOreTotalDist 12
setVar $twoOreTotaldist 20

# 0 - zzz
# 1 - BBS
# 2 - BSB
# 3 - SBB
# 4 - SSB
# 5 - SBS
# 6 - BSS
# 7 - SSS
# 8 - BBB

setVar $ports[1] BBS
setVar $ports[2] BSB
setVar $ports[3] SBB
setVar $ports[4] SSB
setVar $ports[5] SBS
setVar $ports[6] BSS
setVar $ports[7] SSS
setVar $ports[8] BBB




if (($bot~parm1 <> "trade") and ($bot~parm1 <> "report"))
	setVar $SWITCHBOARD~message "First parameter should be trade or report.*"
	gosub :SWITCHBOARD~switchboard
	halt
end
if ($bot~parm2 = 0)
	setVar $bot~parm2 ""
end

if ($bot~parm3 = 0)
	setVar $bot~parm3 ""
end

if ($bot~parm1 = "trade")
	setVar $mode "trade"
	isNumber $test $bot~parm2
	if ($test)
		setvar $switchboard~message "We will stop when we reach " & $bot~parm2 & " turns.*"
		gosub :switchboard~switchboard
	else
		setvar $switchboard~message "Halt turns must be greater than 0.*"
		gosub :switchboard~switchboard
		halt
	end

	setVar $halt_turns $bot~parm2

	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation <> "Command")
		setVar $SWITCHBOARD~message "must be started from Command prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if (($player~TWARP_TYPE <> 1) and ($player~TWARP_TYPE <> 2))
		setVar $SWITCHBOARD~message "Requires T-Warp as we warp around.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if (($player~ORE_HOLDS = 0) or ($player~ORGANIC_HOLDS > 0) or ($player~EQUIPMENT_HOLDS > 0) or ($PLAYER~COLONIST_HOLDS > 0))
		setvar $switchboard~message "Fuel in holds only please.*"
		gosub :switchboard~switchboard
		halt
	end

	if ($bot~parm3 <> "")
		setVar $trademode "file" 
		setVar $fread $BOT~FOLDER & "/" & $bot~parm3
		fileExists $exists $fread
		if ($exists)
			setArray $pairlist SECTORS
			setVar $i 1
			setVar $pairi 1
			read $fread $pair $i
			while ($pair <> EOF)
				
				if ($pair <> "")
					setVar $pairlist[$pairi] $pair
					add $pairi 1
				end
				add $i 1
				read $fread $pair $i
			end
			setVar $totalPairs ($pairi - 1)
		end
		setVar $i 1
		setVar $portPairsi 0
		while ($i <= $totalPairs)
			add $portPairsi 1
			getWord $pairlist[$portPairsi] $portPairs[$i][1] 1
			getWord $pairlist[$portPairsi] $portPairs[$i][2] 2
			getWord $pairlist[$portPairsi] $portPairs[$i][3] 3
			getWord $pairlist[$portPairsi] $portPairs[$i][4] 4
			echo $pairlist[$portPairsi] "*"
			add $i 1
		end
		echo "total pairs: " $totalPairs "*"
		
	else
		setVar $trademode "self"
		goSub :getPairs
	end
else
	
	if ($bot~parm2 = "")
		setVar $SWITCHBOARD~message "Filename not specified.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $SWITCHBOARD~message "Writig to file: "&$bot~parm2 &".*"
	gosub :SWITCHBOARD~switchboard
	

	goSub :getPairs
	setVar $fwrite $BOT~FOLDER & "/" & $bot~parm2
	delete $fwrite
	setVar $i 1
	while ($i <= $portPairsi)
		write $fwrite $portPairs[$i][1] & " " & $portPairs[$i][2] & " " & $portPairs[$i][3] & " " & $portPairs[$i][4] & "*"
		add $i 1
	end

	setVar $SWITCHBOARD~message "Written " & $portPairsi & " to file*"
	gosub :SWITCHBOARD~switchboard
	halt
end






setVar $loopi 1
while ($loopi <= $portPairsi)
	setVar $sec $portPairs[$loopi][1]
	setVar $pairsec $portPairs[$loopi][2]
	setVar $skip FALSE
	if (PORT.EXISTS[$sec] = 1)
		if (PORT.PERCENTEQUIP[$sec] < 85)
			setVar $skip TRUE
		end
	end
	if (PORT.EXISTS[$pairsec] = 1)
		if (PORT.PERCENTEQUIP[$pairsec] < 85)
			setVar $skip TRUE
		end
	end
	if ($skip = TRUE)
		goto :nextLoop
	end

	if ($PLAYER~Turns < $halt_turns)
		stop "scripts\mombot\commands\cashing\ppt.cts"
		setVar $SWITCHBOARD~message "Turns are low, halting!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($PLAYER~CURRENT_SECTOR <> $pairsec)

		setVar $player~warpto $pairsec
		gosub :player~twarp
		if ($player~twarpSuccess = FALSE)
			setVar $SWITCHBOARD~message "Sector missing fig, moving onto next.*"
			gosub :SWITCHBOARD~switchboard
			goto :nextLoop
		end
		gosub :player~quikstats

	end
	
	goSub :checkDist
	send "d"
	waitfor "Warps to Sect"
	if (PORT.BUYFUEL[$pairsec] = 1)
		
		goSub :balanceTrade
		if ($portPairs[$loopi][4] = 1)
			setVar $PLAYER~moveIntoSector $sec
			gosub :PLAYER~moveIntoSector
		else
			setVar $player~warpto $sec
			gosub :player~twarp
			if ($player~twarpSuccess = FALSE)
				setVar $SWITCHBOARD~message "Sector missing fig, moving onto next.*"
				gosub :SWITCHBOARD~switchboard
				goto :nextLoop
			end
		end
		gosub :player~quikstats
		send "d"
		waitfor "Warps to Sect"
	end
	#begin trading
	setVar $beforeTradeCash $player~credits
	goSub :tradePair
	gosub :player~quikstats
	if ($beforeTradeCash = $player~credits)
		setVar $SWITCHBOARD~message "Something went wrong with that trade; didn't make any money.*"
		gosub :SWITCHBOARD~switchboard
	end

	add $stat_pairs_traded 1
	setVar $cash_made ($player~credits - $startcredits)
	setVar $turns_taken ($startturns - $player~turns)
	
	setVar $SWITCHBOARD~message "Pairs Traded: "&$stat_pairs_traded&" Cash Made: "&$cash_made&" Turns Taken: "&$turns_taken&".*"
	gosub :SWITCHBOARD~switchboard
	
	:nextLoop
	add $loopi 1
end

halt

:balanceTrade
	
	if ($portPairs[$loopi][4] > 1)
		setVar $oreReq ($portPairs[$loopi][4] * 3)
	else
		setVar $oreReq 0
	end

	if ($oreReq > $player~ORE_HOLDS)
		setvar $switchboard~message "Not enough fuel to keep trading.*"
		gosub :switchboard~switchboard
	end
	
	
	if (PORT.BUYORG[$sec] = 1)
		setVar $productToBuy "org" 
	else
		setVar $productToBuy "equip"
	end
	setVar $sellOreQuant ($player~ORE_HOLDS - $oreReq)

	send "p   t"
	waitfor "Commerce report for"
	
	setTextLineTrigger checkCash :checkCash "empty cargo holds"
	setTextLineTrigger portFail :portFail "ou don't have anything they want, and they don't have anything you can b"
	pause
	:portFail
		setVar $SWITCHBOARD~message "Oops nothing to trade; script fail*"
		gosub :SWITCHBOARD~switchboard
		halt
	:checkCash
		killAllTriggers

	killalltriggers
	:tradeloop
	setTextTrigger sell1 :sell1 "How many holds of Fuel Ore do you want to sell"
	setTextTrigger sell2 :sell2 "How many holds of Organics do you want to sell"
	setTextTrigger sell3 :sell3 "How many holds of Equipment do you want to sell"
	setTextTrigger buy1 :buy1 "How many holds of Fuel Ore do you want to buy"
	setTextTrigger buy2 :buy2 "How many holds of Organics do you want to buy"
	setTextTrigger buy3 :buy3 "How many holds of Equipment do you want to buy"
	setTextTrigger tradeloopdone :tradeloopdone "Command ["
	pause

	:sell1
		killalltriggers
		send $sellOreQuant "*"
		goSub :doTrade
		goto :tradeloop
	:sell2
		killalltriggers
		send "*"
		goSub :doTrade
		goto :tradeloop	
		
	:sell3
		killalltriggers
		send "*"
		goSub :doTrade
		goto :tradeloop
		
	:buy1
		killalltriggers
		gosub :noTrade
		goto :tradeloop
	:buy2
		killalltriggers
		if ($productToBuy = "org")
			send "*"
		else
			gosub :noTrade
		end
		goto :tradeloop
	:buy3
		killalltriggers
		if ($productToBuy = "equip")
			send "*"
		else
			gosub :noTrade
		end
		goto :tradeloop

	:tradeloopdone
		killalltriggers

return

:doTrade
	waitfor "Agreed,"
	setTextLineTrigger tradeFin :tradeFin "empty cargo holds"
	pause
	:tradeFin
return


:noTrade
	send "0*"
	waitfor "empty cargo holds."
return



:tradePair
	
	if ($PLAYER~CURRENT_SECTOR = $portPairs[$loopi][1])
		setVar $tradeSec $portPairs[$loopi][2]
	elseif ($PLAYER~CURRENT_SECTOR = $portPairs[$loopi][2])
		setVar $tradeSec $portPairs[$loopi][1]
	else
		setVar $SWITCHBOARD~message "We should be at one of the ports here, fail.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if (($portPairs[$loopi][3] = 1) and ($portPairs[$loopi][4] = 1))
		setVar $BOT~parm1 $tradeSec
		setVar $BOT~parm2 "ore:" & $PLAYER~TOTAL_HOLDS
		setVar $BOT~parm3 ""
	else
		setVar $BOT~parm1 $tradeSec
		setVar $BOT~parm2 "twarp"
		setVar $BOT~parm3 "ore:" & $PLAYER~TOTAL_HOLDS
	end
	setVar $BOT~command "ppt"
	setVar $BOT~user_command_line $tradeSec &" "& $BOT~parm2 & " " & $BOT~parm3


	saveVar $BOT~parm1
	saveVar $BOT~parm2
	saveVar $BOT~parm3
	
	saveVar $BOT~command
	saveVar $BOT~user_command_line

	load "scripts\mombot\commands\cashing\ppt.cts"
	:backpptwait
	setTextLineTrigger        pptMove        :pptMove "<Move>"
	setEventTrigger        pptended        :pptended "SCRIPT STOPPED" "scripts\mombot\commands\cashing\ppt.cts"
	pause
	:pptMove
		killalltriggers
		if ($PLAYER~Turns < $halt_turns)
			stop "scripts\mombot\commands\cashing\ppt.cts"
			setVar $SWITCHBOARD~message "Turns are low, halting!*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		goto :backpptwait
	:pptended
		killalltriggers
	gosub :player~quikstats
	

return

:checkDist
	:tryagainplot1
	send "cf" $pairsec "*" $sec "*q"
	setTextLineTrigger pathgood1 :pathgood1 "he shortest path"
	setTextLineTrigger pathbad1 :pathbad1 "No route within"
	pause
	:pathbad1
		killalltriggers
		send "yq"
		setVar $plot 0
		goto :tryagainplot
	:pathgood1
		killalltriggers
		
		getWord CURRENTLINE $dist2 4 
		stripText $dist2 "("
	
	send "cf" $sec "*" $pairsec "*q"
	setTextLineTrigger pathgood2 :pathgood2 "he shortest path"
	setTextLineTrigger pathbad2 :pathbad2 "No route within"
	pause
	:pathbad2
		killalltriggers
		send "yq"
		setVar $plot 0
		goto :tryagainplot
	:pathgood2
		killalltriggers
		
		getWord CURRENTLINE $dist1 4 
		stripText $dist1 "("

	setVar $portPairs[$loopi][3] $dist1
	setVar $portPairs[$loopi][4] $dist2

return
:getPairs


	setVar $SWITCHBOARD~message "Finding Pairs..*"
	gosub :SWITCHBOARD~switchboard
	# SBS with BSB
	# SSB with BBS
	# max distance 5 (for now)
	setVar $totalDist $oneOreTotalDist

	setVar $sec 11
	while ($sec < SECTORS)
		
		if ($PortsUsed[$sec] = 0)
			setVar $cport PORT.CLASS[$sec]
			getSectorParameter $sec "FIGSEC" $hasFig
			
			if (($hasFig = 1) and (PORT.PERCENTEQUIP[$sec] > 80))
				if ($cport = 5)
					setVar $targetA 2
					gosub :checkPairDist
				elseif ($cport = 4)
					setVar $targetA 1
					gosub :checkPairDist
				end
			end
		end
		add $sec 1
	end
	
	#Debugging only
	#goSub :portReport

	echo "Two Ore Port " $twoOreTotaldist " total warps apart*"

	# SBS with SSB



	setVar $totalDist $twoOreTotaldist
	setVar $sec 11
	while ($sec < SECTORS)
		
		if ($PortsUsed[$sec] = 0)
			setVar $cport PORT.CLASS[$sec]
			getSectorParameter $sec "FIGSEC" $hasFig
			if (($hasFig = 1) and (PORT.PERCENTEQUIP[$sec] > 80))
				if ($cport = 5)
					setVar $targetA 4
					
					gosub :checkPairDist
				elseif ($cport = 5)
					setVar $targetA 4
					
					gosub :checkPairDist
				end
			end
		end
		add $sec 1
	end

	#Debugging only
	#goSub :portReport

return


:checkPairDist
	setVar $fr1 "[] "
	setVar $fr2 "[] " 
	getNearestWarps $nearArray $sec
	setVar $y 1
	while ($y <= $nearArray)
		setVar $focus $nearArray[$y]
		
		if ((PORT.CLASS[$focus] = $targetA) and ($PortsUsed[$focus] = 0))
			getSectorParameter $focus "FIGSEC" $hasFig2
			if ($hasFig2 = 1)
				getDistance $to $focus $sec 
				getDistance $from $sec $focus 
				if (($to > 0) and ($from > 0))
					setVar $accum $to
					add $accum $from
					if ($accum <= $totalDist)
						setVar $pairsec $focus
						setVar $pairclass PORT.CLASS[$focus]
						if (PORT.PERCENTEQUIP[$pairsec] > 80)
							setVar $PortsUsed[$focus] 1
							setVar $PortsUsed[$sec] 1
							add $portPairsi 1
							setVar $portPairs[$portPairsi][1] $sec
							setVar $portPairs[$portPairsi][2] $pairsec
							setVar $portPairs[$portPairsi][3] $from
							setVar $portPairs[$portPairsi][4] $to
							
echo "Pair Found (" $portPairsi "):" $fr1 $sec "(" $ports[$cport] ") (" $from ") <> (" $to ") " $fr2 $pairsec "(" $ports[$pairclass] ")*"
					
							return

						end
						
						
					end
				end
			end
		end
		add $y 1
	end
	
return

:checkPair
# Not currently used but for adjaent pairs
	setVar $fr1 "[] "
	setVar $fr2 "[] " 
	setVar $y 1
	while ($y <= SECTOR.WARPCOUNT[$sec])
		if ($PortsUsed[SECTOR.WARPS[$sec][$y]] = 0)
			if ((PORT.CLASS[SECTOR.WARPS[$sec][$y]] = $targetA) or (PORT.CLASS[SECTOR.WARPS[$sec][$y]] = $targetB))
				setVar $pairsec SECTOR.WARPS[$sec][$y]
				setVar $pairclass PORT.CLASS[SECTOR.WARPS[$sec][$y]]
				getSectorParameter $pairsec "FIGSEC" $hasFig2
				if ($hasFig2 = 1)
					goSub :checkAdj
					if ($adj = 1)
						setVar $PortsUsed[SECTOR.WARPS[$sec][$y]] 1
						setVar $PortsUsed[$sec] 1
						getSectorParameter $sec "FIGSEC" $hasFig1
						if ($hasfig1)
							setVar $fr1 "[x] "
						end
						getSectorParameter $pairsec "FIGSEC" $hasFig2
						if ($hasfig2)
							setVar $fr2 "[x] "
						end
echo "Pair Found:"  $fr1 $sec "(" $ports[$cport] ") <> " $fr2 $pairsec "(" $ports[$pairclass] ")*"
						return
					else
						setVar $pairsec 0
						setVar $pairclass 0
					end
				end
			end
		end
		add $y 1
	end

return

:checkAdj
	setVar $adj 0
	setVar $x 1
	while ($x <= SECTOR.WARPCOUNT[$pairsec])
		if (SECTOR.WARPS[$pairsec][$x] = $sec)
			setVar $adj 1
			return
		end
		add $x 1
	end
return




:portReport

	setVar $i 11
	setArray $reportPorts 10
	setArray $reportPortsUsed 10

	while ($i <= SECTORS)
		
		if (PORT.CLASS[$i] > 0)
			add $reportPorts[PORT.CLASS[$i]] 1
			if ($PortsUsed[$i] = 1)
				add $reportPortsUsed[PORT.CLASS[$i]] 1
			end
		end	
		add $i 1
	end
	
	echo "Port Status and Usage *"
	echo "Ports BBS: "  $reportPortsUsed[1] "/"  $reportPorts[1] "*"
	echo "Ports BSB: "  $reportPortsUsed[2] "/"  $reportPorts[2] "*"
	echo "Ports SBB: "  $reportPortsUsed[3] "/"  $reportPorts[3] "*"
	echo "Ports SSB: "  $reportPortsUsed[4] "/"  $reportPorts[4] "*"
	echo "Ports SBS: "  $reportPortsUsed[5] "/"  $reportPorts[5] "*"
	echo "Ports BSS: "  $reportPortsUsed[6] "/"  $reportPorts[6] "*"
	echo "Ports SSS: "  $reportPortsUsed[7] "/"  $reportPorts[7] "*"
	echo "Ports BBB: "  $reportPortsUsed[8] "/"  $reportPorts[8] "*"
	echo "**"
return


include "source\module_includes\bot\loadvars\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\player\moveintosector\player"
include "source\bot_includes\player\twarp\player"
include "source\module_includes\bot\helpfile\bot"
