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
loadvar $BOT~BOT_NAME
loadVar $PLAYER~unlimitedGame


setVar $BOT~help[1]  $BOT~tab&"       Marco Polo - Trade Route for PPTing"
setVar $BOT~help[2]  $BOT~tab&"       "
setVar $BOT~help[3]  $BOT~tab&" macro [trade/report] {turns} {filename.txt} {int} "
setVar $BOT~help[4]  $BOT~tab&"                       {nohag}"
setVar $BOT~help[5]  $BOT~tab&" trade  - indicates bot will trade the route"
setVar $BOT~help[6]  $BOT~tab&" report - indicates bot will write route to file"
setVar $BOT~help[7]  $BOT~tab&" poll   - polls and waits for trade options"
setVar $BOT~help[8]  $BOT~tab&" {filename.txt} - can either be used as a source"
setVar $BOT~help[9]  $BOT~tab&"                  route or for writing to share."
setVar $BOT~help[10]  $BOT~tab&"  "
setVar $BOT~help[11]  $BOT~tab&" {turns}       - Compulsary when trade option used "
setVar $BOT~help[12]  $BOT~tab&"                 stops trading when reaching turns"
setVar $BOT~help[13]  $BOT~tab&"  "
setVar $BOT~help[13]  $BOT~tab&"  {int}        - Use internal haggle (quicker)"
setVar $BOT~help[13]  $BOT~tab&"  {nohag}      - No Haggling"
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
setVar $cashPause 0
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


gosub :player~isEpHaggle


if (($bot~parm1 <> "trade") and ($bot~parm1 <> "report") and ($bot~parm1 <> "poll"))
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

if ($bot~parm1 = "trade") or ($bot~parm1 = "poll")
	if ($bot~parm1 = "poll")
		setVar $mode "poll"
	else
		setVar $mode "trade"
	end
	
	if ($player~unlimitedGame = FALSE)
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
	else
		setVar $halt_turns 0
		setvar $switchboard~message "Unlimited game - we break for no one!*"
		gosub :switchboard~switchboard
	end

	

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
	
	if ($player~fighters < 20)
		setvar $switchboard~message "Less than 20 figs - are you mad?*"
			gosub :switchboard~switchboard
			halt
	end
	send "cuyq"
	if ($player~TOTAL_HOLDS > 200)
		if ($player~CREDITS < 25000)
			setvar $switchboard~message "We have 200+ holds and less than 25k Creds - more Cash Please!*"
			gosub :switchboard~switchboard
			halt
		end
	elseif ($player~TOTAL_HOLDS > 150)
		if ($player~CREDITS < 20000)
			setvar $switchboard~message "We have 150+ holds and less than 20k Creds - more Cash Please!*"
			gosub :switchboard~switchboard
			halt
		end
	elseif ($player~TOTAL_HOLDS > 100)
		if ($player~CREDITS < 15000)
			setvar $switchboard~message "We have 100+ holds and less than 15k Creds - more Cash Please!*"
			gosub :switchboard~switchboard
			halt
		end
	else
		if ($player~CREDITS < 10000)
			setvar $switchboard~message "We need at least 10k Creds please!*"
			gosub :switchboard~switchboard
			halt
		end
	end
	

	# t - EP - h "internal" - "n" no haggle
	setVar $haggle "t"
	setVar $msg ""
	getWordPos $bot~user_command_line $pos "int"
	if ($pos > 0)
		setVar $haggle "h"
		setVar $msg $msg&"Using internal haggle*"
	end
	getWordPos $bot~user_command_line $pos "nohag"
	if ($pos > 0)
		setVar $haggle "n"
		setVar $msg $msg&"Using no haggle routine*"
	end
	if ($haggle = "t")
		setVar $msg $msg&"Using EP haggle routine*"
	end

		
	setvar $switchboard~message $msg
	gosub :switchboard~switchboard

	listActiveScripts $scripts
	setVar $foundep 0
	setVar $a 1
	while ($a <= $scripts)
		if ($scripts[$a] = "ephaggle.cts")
			setVar $foundep 1
		end
		add $a 1
	end

	setvar $switchboard~message "Pause for effect....*"
	gosub :switchboard~switchboard
	if ($haggle = "h") or ($haggle = "n")
		if ($foundep = 1)
			stop "ephaggle"
		end
	end
	if ($foundep = 0) and ($haggle = "t")
		send "'" $BOT~BOT_NAME " ephaggle*"
	end


	setDelayTrigger delay :startPause 1000
	pause
	:startPause
		killtrigger startPause

	if ($mode = "trade")	
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
		goSub :loadPollTrades
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

setVar $debug 1


:restartLoop

setVar $loopi 1
while ($loopi <= $portPairsi)
	if ($debug = 1)
		echo "DEBUG: Top of Loop*"
	end
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

	if ($PLAYER~Turns < $halt_turns) AND ($player~unlimitedGame = FALSE)
		stop "scripts\"&$bot~mombot_directory&"\commands\cashing\ppt.cts"
		setVar $SWITCHBOARD~message "Turns are low, halting!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($PLAYER~CURRENT_SECTOR <> $pairsec)
		# Check second port has fig
		if ($sec <> $PLAYER~CURRENT_SECTOR)

			setVar $nextSector $sec
			goSub :checkIsNextDoor
			if ($isNextDoor)
				getSectorParameter $dSector "FIGSEC" $hasFig
				if ($hasFig = "")
					setVar $hasFig 0
				end
				if ($hasfig = 0)
					###killAllTriggers
					setVar $SWITCHBOARD~message "Sector missing fig, moving onto next.*"
					gosub :SWITCHBOARD~switchboard
					goto :nextLoop
				end

			else
				send "m" $sec "*yn"
				setTextLineTrigger checkPair2LockYes :checkPair2LockYes "Locating beam pinpointed, TransWarp"
				setTextLineTrigger checkPair2LockNo :checkPair2LockNo "No locating beam found for sector"
				pause
				:checkPair2LockNo
					killtrigger checkPair2LockYes
					killtrigger checkPair2LockNo
					setVar $SWITCHBOARD~message "Sector missing fig, moving onto next.*"
					gosub :SWITCHBOARD~switchboard
					goto :nextLoop
				:checkPair2LockYes
					killtrigger checkPair2LockYes
					killtrigger checkPair2LockNo
			end
		end
		# move us in - this is ok if first sector
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
	
	setTextLineTrigger warps1 :warps1 "Warps to Sect"
	pause
	:warps1

	if ($cashPause = 1)
		if (PORT.EXISTS[CURRENTSECTOR] = TRUE)
			if (PORT.BUYFUEL[CURRENTSECTOR] = FALSE)
				send "'[atm:" $switchboard~BOT_NAME "=" CURRENTSECTOR "]*"
				setTextLineTrigger atm1 :atm1 "[atmdone]"
				pause
				:atm1

				send "'[atm]Spend it wisely, I'm out here risking my hide for peanuts!*"
				setVar $cashPause 0
			end
		end
	end
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
		setTextLineTrigger warps2 :warps2 "Warps to Sect"
		pause
		:warps2
		if ($cashPause = 1)
			if (PORT.EXISTS[CURRENTSECTOR] = TRUE)
				if (PORT.BUYFUEL[CURRENTSECTOR] = FALSE)
					send "'[atm:" $switchboard~BOT_NAME "=" CURRENTSECTOR "]*"
					setTextLineTrigger atm2 :atm2 "[atmdone]"
					pause
					:atm2
					send "'[atm]Spend it wisely, I'm out here risking my hide for peanuts!*"
					setVar $cashPause 0
				end
			end
		end
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
if ($mode = "poll")
	setVar $portPairs 0
	setVar $portPairsi 0
	setVar $loopi 1
	goSub :pollForPorts
	goSub :restartLoop
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
	
	setTextLineTrigger Commerce1 :Commerce1 "Commerce report for"
	pause
	:Commerce1

	setTextLineTrigger checkCash :checkCash "empty cargo holds"
	setTextLineTrigger portFail :portFail "ou don't have anything they want, and they don't have anything you can b"
	pause
	:portFail
		setVar $SWITCHBOARD~message "Oops nothing to trade; script fail*"
		gosub :SWITCHBOARD~switchboard
		halt
	:checkCash
		killtrigger checkCash
		killtrigger portFail
	
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
		goSub :killTradeLoopTriggers

		send $sellOreQuant "*"
		goSub :doTrade
		goto :tradeloop
	:sell2
		goSub :killTradeLoopTriggers
		send "*"
		goSub :doTrade
		goto :tradeloop	
		
	:sell3
		goSub :killTradeLoopTriggers
		send "*"
		goSub :doTrade
		goto :tradeloop
		
	:buy1
		goSub :killTradeLoopTriggers
		gosub :noTrade
		goto :tradeloop
	:buy2
		goSub :killTradeLoopTriggers
		if ($productToBuy = "org")
			send "*"
		else
			gosub :noTrade
		end
		goto :tradeloop
	:buy3
		goSub :killTradeLoopTriggers
		if ($productToBuy = "equip")
			send "*"
		else
			gosub :noTrade
		end
		goto :tradeloop

	:tradeloopdone
		goSub :killTradeLoopTriggers

return

:killTradeLoopTriggers
	killtrigger sell1
	killtrigger sell2
	killtrigger sell3
	killtrigger buy1
	killtrigger buy2
	killtrigger buy3
	killtrigger tradeloopdone
return

:doTrade
	if (($haggle = "t") or ($haggle = "h"))
		
		
		if ($haggle = "t")
			setTextLineTrigger agreed1 :agreed1 "Agreed,"
			pause
			:agreed1
			
			setTextLineTrigger tradeFin :tradeFin "empty cargo holds"
			pause
			:tradeFin
				killtrigger tradeFin
		elseif ($haggle = "h")
			gosub :PLAYER~startHaggle
		end
	else
		send "  *  "
	end
return


:noTrade
	send "0*"
	
	setTextLineTrigger empty1 :empty1 "empty cargo holds."
	pause
	:empty1
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
		setVar $BOT~parm2 $haggle
		setVar $BOT~parm3 "ore:" & $PLAYER~TOTAL_HOLDS
		setVar $BOT~parm4 ""

	else
		setVar $BOT~parm1 $tradeSec
		setVar $BOT~parm2 $haggle
		setVar $BOT~parm3 "twarp"
		setVar $BOT~parm4 "ore:" & $PLAYER~TOTAL_HOLDS
		
	end
	setVar $BOT~command "ppt"
	setVar $BOT~user_command_line $tradeSec &" "& $BOT~parm2 & " " & $BOT~parm3 & " " & $BOT~parm4


	saveVar $BOT~parm1
	saveVar $BOT~parm2
	saveVar $BOT~parm3
	saveVar $BOT~parm4
	
	saveVar $BOT~command
	saveVar $BOT~user_command_line

	load "scripts\"&$bot~mombot_directory&"\commands\cashing\ppt.cts"
	:backpptwait
	setTextLineTrigger        pptPauseForCash        :pptPauseForCash "[atm:" & $SWITCHBOARD~BOT_NAME & "]"
	setTextLineTrigger        pptMove        :pptMove "<Move>"
	setEventTrigger        pptended        :pptended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\cashing\ppt.cts"
	pause
	:pptPauseForCash
			killtrigger pptPauseForCash
			killtrigger pptMove
			killtrigger pptended
			
			setVar $cashPause 1
			send "'[atm:ack] Will pause at next SXB post trading.*"
			goto :backpptwait
	:pptMove
		killtrigger pptPauseForCash
		killtrigger pptMove
		killtrigger pptended
		if ($PLAYER~Turns < $halt_turns)  AND ($player~unlimitedGame = FALSE)
			stop "scripts\"&$bot~mombot_directory&"\commands\cashing\ppt.cts"
			setVar $SWITCHBOARD~message "Turns are low, halting!*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		goto :backpptwait
	:pptended
		killtrigger pptPauseForCash
		killtrigger pptMove
		killtrigger pptended
		setVar $pptSec1  $portPairs[$loopi][1]
		goSub :removePPTOption
		setVar $pptSec1  $portPairs[$loopi][2]
		goSub :removePPTOption
		

	gosub :player~quikstats
	

return

:checkDist
	:tryagainplot1
	send "cf" $pairsec "*" $sec "*q"
	setTextLineTrigger pathgood1 :pathgood1 "he shortest path"
	setTextLineTrigger pathbad1 :pathbad1 "No route within"
	pause
	:pathbad1
		killtrigger pathgood1
		killtrigger pathbad1
		
		send "yq"
		setVar $plot 0
		goto :tryagainplot
	:pathgood1
		killtrigger pathgood1
		killtrigger pathbad1
		
		getWord CURRENTLINE $dist2 4 
		stripText $dist2 "("
	
	send "cf" $sec "*" $pairsec "*q"
	setTextLineTrigger pathgood2 :pathgood2 "he shortest path"
	setTextLineTrigger pathbad2 :pathbad2 "No route within"
	pause
	:pathbad2
		killtrigger pathgood2
		killtrigger pathbad2
		send "yq"
		setVar $plot 0
		goto :tryagainplot
	:pathgood2
		killtrigger pathgood2
		killtrigger pathbad2
		
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

:checkIsNextDoor
	# $nextSector
	# $isNextDoor
	setVar $isNextDoor 0
	setVar $isNexti 1
	while ($isNexti<= SECTOR.WARPCOUNT[$nextSector])
		
		echo SECTOR.WARPS[CURRENTSECTOR][$isNexti] " " $nextSector "*"

		if (SECTOR.WARPS[CURRENTSECTOR][$isNexti] = $nextSector)

			setVar $isNextDoor 1
		end
		
		add $isNexti 1
	end
return

:pollForPorts
	killtrigger pptOptionSaveTrigger
	setVar $SWITCHBOARD~message "Marco - Waiting for PPT options..*"
	gosub :SWITCHBOARD~switchboard
	:pptOptionBackWaiting
	setTextLineTrigger pptOptionWaitTrigger :pptOptionWaitTrigger "TWARPPPTPAIR:"
	setDelayTrigger pptOptionAnnouce :pptOptionAnnouce 30000
	pause
	:pptOptionAnnouce
		killtrigger pptOptionAnnouce
		killtrigger pptOptionWaitTrigger
		setVar $SWITCHBOARD~message "Marco - Waiting for PPT options..*"
		gosub :SWITCHBOARD~switchboard
		goto :pptOptionBackWaiting
	:pptOptionWaitTrigger
		killtrigger pptOptionAnnouce
		killtrigger pptOptionWaitTrigger
		
		goSub :setPPTOptionTriggers
		goSub :processOptionLine
		
return

:processOptionLine
	# blahblah TWARPPPTPAIR:SECTOR_SECTOR_DIST_DIST:ENDPAIR

	getText CURRENTLINE $pptinfo "TWARPPPTPAIR:" ":ENDPAIR"
	replaceText $pptinfo "_" " "
	add $portPairsi 1
	getWord $pptinfo $portPairs[$portPairsi][1] 1
	getWord $pptinfo $portPairs[$portPairsi][2] 2
	getWord $pptinfo $portPairs[$portPairsi][3] 3
	getWord $pptinfo $portPairs[$portPairsi][4] 4

	# save to sector var
	setVar $pptOptInfo ($portPairs[$portPairsi][2] & "_" & $portPairs[$portPairsi][3] & "_" & $portPairs[$portPairsi][4])
	setSectorParameter  $portPairs[$portPairsi][1] "PPTOPT1" 1
	setSectorParameter  $portPairs[$portPairsi][1] "PPTOPTINFO" $pptOptInfo
	echo "PAir Added: portPairsi" $portPairsi " loopi:" $loopi " $pptoptinfo: " $pptOptInfo "*"
return

:setPPTOptionTriggers
	# in theory this adds the trigger and moves on
	setTextLineTrigger pptOptionSaveTrigger :pptOptionSaveTrigger "TWARPPPTPAIR:"
	
return

:pptOptionSaveTrigger
		killtrigger pptOptionSaveTrigger
		goSub :processOptionLine
		setTextLineTrigger pptOptionSaveTrigger :pptOptionSaveTrigger "TWARPPPTPAIR:"
		pause
return

:removePPTOption

	setSectorParameter $pptSec1 "PPTOPT1" ""
	setSectorParameter $pptSec1 "PPTOPTINFO" ""
return

:loadPollTrades
	# load poll trades - i.e. those storedin params
	# Returns array with 4 vars
	#    port1 port2 port1to2dist port2to1dist

	setVar $pptOptions 0
	setVar $pptOptioni 0
	setVar $tt 11
	while ($tt <= SECTORS)
		
		getSectorParameter $tt "PPTOPT1" $hasOpt 
		if ($hasOpt = "")
			setVar $hasOpt 0
		end
		if ($hasOpt > 10)
			getSectorParameter $tt "PPTOPTINFO" $pptOptInfo 
			#PPTOPTINFO SSSSS_D1_D2 i.e. 4504_10_12
			replaceText $pptOptInfo "_" " "
			getWord $pptOptInfo $pptPort2 1
			getWord $pptOptInfo $pptDist1 2
			getWord $pptOptInfo $pptDist2 3
			
			add $pptOptioni 1
			setVar $pptOptions[$pptOptioni][1] $tt
			setVar $pptOptions[$pptOptioni][2] $pptPort2
			setVar $pptOptions[$pptOptioni][3] $pptDist1
			setVar $pptOptions[$pptOptioni][4] $pptDist2
			
			if ($debug = 1)
				echo "DEBUG: pptOPTION pptPort1: " $tt " pptPort2:  " $pptPort2 " pptDist1: " $pptDist1 " pptDist2:  " $pptDist2 "*"
			end
		end
		add $tt 1
	end

return



include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"

include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\moveintosector\player"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\isephaggle\player"
include "source\bot_includes\player\starthaggle\player"
