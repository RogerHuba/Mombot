gosub :BOT~loadVars


	setVar $BOT~help[1]  $BOT~tab&"       Scans and offers available PPT trades to adj sectors "
	setVar $BOT~help[2]  $BOT~tab&"       Aimed at Day 1 use - the only time to use PPT!"
	setVar $BOT~help[3]  $BOT~tab&"        "
	setVar $BOT~help[4]  $BOT~tab&"       ppt [sector/?] {h/t/n) {p:x} {k:x}"
	setVar $BOT~help[5]  $BOT~tab&"       "
	setVar $BOT~help[6]  $BOT~tab&" Options:"
	setVar $BOT~help[7]  $BOT~tab&"    [sector/?]     Sector to trade or ? to scan and choose."
	setVar $BOT~help[8]  $BOT~tab&"    {h/t/n}        h  - internal haggle; "
	setVar $BOT~help[9]  $BOT~tab&"                   n  - no haggle, just accepts the price"
	setVar $BOT~help[10] $BOT~tab&"                   t  - 3rd party haggle like EP - DEFAULT."
	setVar $BOT~help[11] $BOT~tab&"    {p:x}         When either product hits this % it will stop "
	setVar $BOT~help[12] $BOT~tab&"                   - Defaults to 30% (p:30)"
	setVar $BOT~help[13] $BOT~tab&"    {k:x}         k:5 - Keep this many holds of equipment at end of run. "
	setVar $BOT~help[14] $BOT~tab&"                   Used so we can test port MCICs as we travel."
	
	gosub :BOT~help_file

	setVar $BOT~script_title "Paired Port Trade"
	gosub :BOT~banner


# We need min percentages
# We need haggle option
# PPT hag 50

#setVar $PLAYER~moveIntoSector SECTOR.WARPS[CURRENTSECTOR][$sector]
#gosub :PLAYER~moveIntoSector	
	
	
	# 0 means we keep none
	setVar $keepEquip 0
	setVar $tradingMinPer 50
	setVar $haggle "t"
	

	getWord $bot~user_command_line $parm1 1
	getWord $bot~user_command_line $parm2 2
	getWord $bot~user_command_line $parm3 3
	

	
	if ($parm2 <> "")
		if ($parm2 = "h")
			setVar $haggle "h"
		elseif ($parm2 = "n")
			setVar $haggle "n"
		elseif ($parm2 = "t")
			setVar $haggle "t"
		
		end
	end
	if ($parm3 <> "")
		if ($parm3 = "h")
			setVar $haggle "h"
		elseif ($parm3 = "n")
			setVar $haggle "n"
		elseif ($parm3 = "t")
			setVar $haggle "t"
		
			
		end
	end
	getWordPos " "&$bot~user_command_line&" " $pos " p:"
	if ($pos > 0)
		getText " "&$bot~user_command_line&" " $tradingMinPer "p:" " "
		isNumber $test $tradingMinPer
		if ($test)
			
		else
			setVar $SWITCHBOARD~message "Trading min should be a number.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end

	else
		setVar $tradingMinPer 50
	end

	if ($tradingMinPer > 90)
		setVar $tradingMinPer 90
	end

	getWordPos " "&$bot~user_command_line&" " $pos " k:"

	if ($pos > 0)
		getText " "&$bot~user_command_line&" " $keepEquip "k:" " "

		isNumber $test $keepEquip
		if ($test)
			
		else
			setVar $SWITCHBOARD~message "Equipment holds to keep should be a number.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end

	else
		setVar $keepEquip 5
	end
	


	gosub :player~quikstats
	
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation <> "Command")
		setVar $SWITCHBOARD~message "PPT Must start at command prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt

	end

	if ($parm1 = "0")
		setVar $parm1 "?"
	end

	isNumber $test $parm1
	if (($test = FALSE) AND ($parm1 <> "?"))
		
		setVar $SWITCHBOARD~message "Invalid sector. Please enter a sector number or '?'.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($parm1 = "h")
		setVar $haggle "h"
	elseif ($parm1 = "n")
		setVar $haggle "n"
	elseif ($parm1 = "t")
		setVar $haggle "t"
	end

	setVar $tradingSector1 0
	setVar $tradingType 0
	:pptUpdateData
	if ($parm1 = "?")
		setVar $i 1
		send "c"
		waitfor "<Computer activated>"
		send "r" CURRENTSECTOR "*"
		while ($i <= SECTOR.WARPCOUNT[CURRENTSECTOR])
			
			send "f" SECTOR.WARPS[CURRENTSECTOR][$i] "*" CURRENTSECTOR "*"
			send "r" SECTOR.WARPS[CURRENTSECTOR][$i] "*"
			
			add $i 1
		end
		send "q"
		waitfor "<Computer deactivated>"
		goSub :displayPortReport
		setVar $tradingSector2 CURRENTSECTOR
	else
		setVar $tradingSector1 $parm1
		setVar $tradingSector2 CURRENTSECTOR
		isNumber $res $tradingSector1
		if ($res = 0)
			setVar $SWITCHBOARD~message "Invalid sector. Please enter a sector number or '?'.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		setVar $i 1
		setVar $sectorFound 0
		while ($i <= SECTOR.WARPCOUNT[CURRENTSECTOR])
			if ($tradingSector1 = SECTOR.WARPS[CURRENTSECTOR][$i])
				setVar $sectorFound 1
			end 
			add $i 1
		end
		if ($sectorFound = 0)
			setVar $SWITCHBOARD~message "Sector not adjacent.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end 
		send "cr" CURRENTSECTOR "*r" $tradingSector1 "*f" $tradingSector1 "*" CURRENTSECTOR "*q"
		waitfor "<Computer deactivated>"
		setVar $i 1
		setVar $sectorFound 0
		while ($i <= SECTOR.WARPCOUNT[$tradingSector1])
			if (CURRENTSECTOR = SECTOR.WARPS[$tradingSector1][$i])
				setVar $sectorFound 1
			end 
			add $i 1
		end
		if ($sectorFound = 0)
			setVar $SWITCHBOARD~message "That sector is not a two way warp.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end 
		setVar $port1 PORT.CLASS[$tradingSector1]
		setVar $port2 PORT.CLASS[$tradingSector2]

		goSub :isTradingPort
		if ($portCanTrade = 0)
			setVar $SWITCHBOARD~message "Nothing to trade with that port.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end

		send "cr" CURRENTSECTOR "*q"
		waitfor "<Computer deactivated>"
	end

	
	
        gosub :player~quikstats
	gosub :voidadjacent
	
	setVar $empty_holds ($PLAYER~TOTAL_HOLDS - ($player~ORE_HOLDS + $player~ORGANIC_HOLDS + $player~EQUIPMENT_HOLDS + $PLAYER~COLONIST_HOLDS))

	if ($PLAYER~COLONIST_HOLDS > 0)
		setVar $SWITCHBOARD~message "Don't bore the tourists, offload the colonists.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $firstMove 1

	getSector $tradingSector1 $sec2
	getSector $tradingSector2 $sec1
	
	setVar $sec1_maxprod1 0
	setVar $sec1_maxprod2 0
	setVar $sec2_maxprod1 0
	setVar $sec2_maxprod2 0
	
	setVar $skip_first 0



	if ($tradingType = 1)
		setPrecision 2
		setVar $sec1_maxprod1 ($sec1.PORT.ORG * (100/PORT.PERCENTORG[$sec1.index]))
		setVar $sec2_maxprod1 ($sec2.PORT.ORG * (100/PORT.PERCENTORG[$sec2.index]))
		setVar $sec1_maxprod2 ($sec1.PORT.EQUIP * (100/PORT.PERCENTEQUIP[$sec1.index]))
		setVar $sec2_maxprod2 ($sec2.PORT.EQUIP * (100/PORT.PERCENTEQUIP[$sec2.index]))
		setPrecision 0


		if (($player~ORE_HOLDS > 0) and (PORT.BUYFUEL[$sec1.index] = 0))
			send "jy"
			waitfor "ettison Cargo"
			waitfor "Command ["
			gosub :player~quikstats
			setVar $empty_holds ($PLAYER~TOTAL_HOLDS - ($player~ORE_HOLDS + $player~ORGANIC_HOLDS + $player~EQUIPMENT_HOLDS + $PLAYER~COLONIST_HOLDS))
		end
		if ($sec1.PORT.BUY_ORG = "YES")
			#BS
			if  (($player~ORGANIC_HOLDS = 0) and ($empty_holds = 0) and ($player~ORE_HOLDS = 0))
				setVar $skip_first 1
			end
		else
	
			#SB - Means we have orgs in the holds and min equip
			if (($player~EQUIPMENT_HOLDS <= $keepEquip) and ($empty_holds = 0) and ($player~ORE_HOLDS = 0))
				setVar $skip_first 1
			end
			
		end
	else
		setPrecision 2
		setVar $sec1_maxprod1 (PORT.FUEL[$sec1.index] * (100/PORT.PERCENTFUEL[$sec1.index]))
		setVar $sec2_maxprod1 (PORT.FUEL[$sec1.index] * (100/PORT.PERCENTFUEL[$sec2.index]))
		setVar $sec1_maxprod2 ($sec1.PORT.EQUIP * (100/PORT.PERCENTEQUIP[$sec1.index]))
		setVar $sec2_maxprod2 ($sec2.PORT.EQUIP * (100/PORT.PERCENTEQUIP[$sec2.index]))
		
		setPrecision 0

		if (($PLAYER~ORGANIC_HOLDS > 0) and ($sec1.PORT.BUY_ORG = "NO"))
			send "jy"
			waitfor "ettison Cargo"
			waitfor "Command ["
			gosub :player~quikstats
			setVar $empty_holds ($PLAYER~TOTAL_HOLDS - ($player~ORE_HOLDS + $player~ORGANIC_HOLDS + $player~EQUIPMENT_HOLDS + $PLAYER~COLONIST_HOLDS))
		end

		if (PORT.BUYFUEL[$sec1.index] = 1)
			if  (($player~ORE_HOLDS = 0) and ($empty_holds = 0) and ($player~ORGANIC_HOLDS = 0))
				setVar $skip_first 1
			end
		else
			if (($player~EQUIPMENT_HOLDS <= $keepEquip) and ($empty_holds = 0) and ($PLAYER~ORGANIC_HOLDS = 0))
				setVar $skip_first 1
			end
		end

	end


	gosub :player~quikstats


	setVar $test 1
	
	setVar $prod1 0
	setVar $prod2 0
	setVar $report 0
	setVar $port1Ok 1
	setVar $port2Ok 1

	if ($skip_first = 0)
	# Trade first sector
		:firstTradeStart
		goSub :portandtrade
		if ($report)
			setVar $report 0
			goto :firstTradeStart
		end
	end
	
	# check we have a fig here
	setVar $chkFtrSector $sec1.INDEX
	goSub :chkFtr
	
	#move to second sector and begin
	setVar $PLAYER~moveIntoSector $sec2.INDEX
	gosub :PLAYER~moveIntoSector	
	goSub :chkFtr

	setVar $c 0
	

	while ($test = 1)
		:loopTrade2
		goSub :portandtrade
		if ($report)
			setVar $report 0
			goto :loopTrade2
		end
		if (($port2Ok = 0) and ($port1Ok = 0))
			# we done, move on!
			setVar $test 0
			goto :finishAndExit
		end
		if (($port1Ok = 1) and ($port2Ok = 0))
			# Force Fail Other port but let it do one more trade
			setVar $port1Ok 0
		end
		
		setVar $PLAYER~moveIntoSector $sec1.INDEX
		gosub :PLAYER~moveIntoSector


		:loopTrade1
		goSub :portandtrade
		if ($report)
			setVar $report 0
			goto :loopTrade1
		end
		
		if (($port2Ok = 0) and ($port1Ok = 0))
			# we done, move on!
			setVar $test 0
			goto :finishAndExit
		end
		if (($port2Ok = 1) and ($port1Ok = 0))
			# Force Fail Other port but let it do one more trade
			setVar $port2Ok 0
		end

		
		setVar $PLAYER~moveIntoSector $sec2.INDEX
		gosub :PLAYER~moveIntoSector

		:finishAndExit

		#Safety/Testing check
		add $c 1
		if ($c > 20)
			setVar $test 0
		end

	end
	
	gosub :clearadjacent

halt

:portandtrade
	
	//
	setVar $report 0
	send "p   t"
	waitfor "Commerce report for"
	goSub :getCommerceReport
	setTextLineTrigger checkCash :checkCash "empty cargo holds"
	setTextLineTrigger portFail :portFail "ou don't have anything they want, and they don't have anything you can b"
	pause
	:portFail
		setVar $SWITCHBOARD~message "Oops nothing to trade; script fail?*"
		gosub :SWITCHBOARD~switchboard
		halt
	:checkCash
		killAllTriggers
		getWord CURRENTLINE $cCredits 3
		stripText $cCredits ","


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
	:sell2
		setVar $PLAYER~multiplier 105
		killalltriggers
		gosub :doTrade
		goto :tradeloop
	:sell3
		setVar $PLAYER~multiplier 105
		killalltriggers
		gosub :doTrade
		goto :tradeloop
		
	:buy1
		killalltriggers
		setVar $PLAYER~multiplier 95
		if ($tradingType = 2)
			gosub :doTrade
		else
			gosub :noTrade
		end
		goto :tradeloop
	:buy2
		killalltriggers
		setVar $PLAYER~multiplier 95
		if ($tradingType = 1)
			gosub :doTrade
		else
			gosub :noTrade
		end
		goto :tradeloop
	:buy3
		killalltriggers
		setVar $PLAYER~multiplier 95
		gosub :doTrade

	:tradeloopdone
		killalltriggers
return

:getCommerceReport
	setVar $cQuant1 0
	setVar $cQuant2 0
	

//get it
	waitfor "Docking Log"
	:dockinglog
	setTextLineTrigger cr1 :cr1 "Fuel Ore"
	setTextLineTrigger cr2 :cr2 "Organics"
	setTextLineTrigger cr3 :cr3 "Equipment"
	pause
	:cr1
		killalltriggers
		if ($tradingType = 2)
			getWord CURRENTLINE $cQuant1 4
		end
		goto :dockinglog
	:cr2
		killalltriggers
		if ($tradingType = 1)
			getWord CURRENTLINE $cQuant1 3
		end
		goto :dockinglog
	:cr3
		killalltriggers
		getWord CURRENTLINE $cQuant2 3


	setVar $cQuant1 ($cQuant1 - $PLAYER~TOTAL_HOLDS)
	setVar $cQuant2 ($cQuant2 - $PLAYER~TOTAL_HOLDS)
	
	setPrecision 2
	if (CURRENTSECTOR = $sec1.INDEX)
		
		setVar $cPerc1 (($cQuant1/$sec1_maxprod1) * 100)
		setVar $cPerc2 (($cQuant2/$sec1_maxprod2) * 100)
		if ($cPerc1 < $tradingMinPer) or ($cPerc2 < $tradingMinPer)
			setVar $port1Ok 0
		end
	else
		setVar $cPerc1 (($cQuant1/$sec2_maxprod1) * 100)
		setVar $cPerc2 (($cQuant2/$sec2_maxprod2) * 100)
		if ($cPerc1 < $tradingMinPer) or ($cPerc2 < $tradingMinPer)
			setVar $port2Ok 0
		end
	end

	setPrecision 0
return

:noTrade
	send "0*"
	waitfor "empty cargo holds."
return

:doTrade
	
	if (($port1Ok = 0) and ($port2Ok = 0))
		# one of the ports is at min % so we are onto last two trades
		# we want to keep the min equip holds
		if (($keepEquip > 0) and (PORT.BUYEQUIP[CURRENTSECTOR]))
			setvar $h ($PLAYER~TOTAL_HOLDS - $keepEquip)
			send $h "*"
		else 
			send "*"
		end
			
	else
		send "*"
	end
	if (($haggle = "t") or ($haggle = "h"))
		
		
		if ($haggle = "t")
			waitfor "Agreed,"
			setTextLineTrigger tradeFin :tradeFin "empty cargo holds"
			pause
			:tradeFin
				killAllTriggers
				getWord CURRENTLINE $nCredits 3
				stripText $nCredits ","
				
				if ($nCredits = $cCredits)
					setVar $report 1
				else
					setVar $cCredits $nCredits
				end	
		elseif ($haggle = "h")
			gosub :PLAYER~startHaggle
		end
	else
		send "  *  "
	end
return





:chkFtr
	
	if (SECTOR.FIGS.QUANTITY[$chkFtrSector] = 0)
		if ($chkFtrSector > 10)
			send "f   1  *  c  d "

		end
	end

return


:isTradingPort
	# port1
	# port2
	# $portCanTrade  - result

	setVar $portCanTrade 0

	if (($port1 = 1) or ($port1 = 5))
		if (($port2 = 2) or ($port2 = 4))
			setVar $portCanTrade 1
			setVar $tradingType 1
		end
	elseif (($port1 = 2) or ($port1 = 4))
		if (($port2 = 1) or ($port2 = 5))
			setVar $portCanTrade 1
			setVar $tradingType 1
		end
	elseif (($port1 = 3) or ($port1 = 4))
		if (($port2 = 1) or ($port2 = 6))
			setVar $portCanTrade 1
			setVar $tradingType 2
		end
	elseif (($port1 = 1) or ($port1 = 6))
		if (($port2 = 3) or ($port2 = 4))
			setVar $portCanTrade 1
			setVar $tradingType 2
		end
	end

return

:displayPortReport
	
	# 0 - zzz
	# 1 - BBS
	# 2 - BSB
	# 3 - SBB
	# 4 - SSB
	# 5 - SBS
	# 6 - BSS
	# 7 - SSS
	# 8 - BBB
	# 1/5 pair wit 2/4 for org/equip
	# 1/6 pair 3/4

	# $tradingPorts - sectors you can trade with
	# $tradingPortsDetails - details for the port report
	# $tpi - number of prts you can trade with
	setVar $cport PORT.CLASS[CURRENTSECTOR]
	setVar $tradingPorts 0
	setVar $tradingPortsType 0
	setVar $tradingPortsDetails 0
	setVar $tpi 0

	
	setVar $i 1
	
	while ($i <= SECTOR.WARPCOUNT[CURRENTSECTOR])
		
		# check it has warps back
		setVar $w 1
		setVar $warpBack 0

		while ($w <= SECTOR.WARPCOUNT[SECTOR.WARPS[CURRENTSECTOR][$i]])
			if (CURRENTSECTOR = SECTOR.WARPS[SECTOR.WARPS[CURRENTSECTOR][$i]][$w])
				setVar $warpBack 1
			end
			add $w 1
		end
		
		if ($warpBack = 1)
			if (($cport = 5) or ($cport = 1))
				if ((PORT.CLASS[SECTOR.WARPS[CURRENTSECTOR][$i]] = 2) or (PORT.CLASS[SECTOR.WARPS[CURRENTSECTOR][$i]] = 4))
					add $tpi 1
					setVar $tradingPorts[$tpi] SECTOR.WARPS[CURRENTSECTOR][$i]
					
					setVar $portPairType 1
					setVar $portReport $tradingPorts[$tpi]
					setVar $portReportLine ""
					goSub :portReportLine
					setVar $tradingPortsDetails[$tpi] $portReportLine
					setVar $tradingPortsType[$tpi] $portPairType
				end
			elseif (($cport = 2) or ($cport = 4))
				if ((PORT.CLASS[SECTOR.WARPS[CURRENTSECTOR][$i]] = 1) or (PORT.CLASS[SECTOR.WARPS[CURRENTSECTOR][$i]] = 5))
					add $tpi 1
					setVar $tradingPorts[$tpi] SECTOR.WARPS[CURRENTSECTOR][$i]
					
					setVar $portPairType 1
					setVar $portReport $tradingPorts[$tpi]
					setVar $portReportLine ""
					goSub :portReportLine
					setVar $tradingPortsDetails[$tpi] $portReportLine
					setVar $tradingPortsType[$tpi] $portPairType
				end
			end
			if (($cport = 1) or ($cport = 6))
				if ((PORT.CLASS[SECTOR.WARPS[CURRENTSECTOR][$i]] = 3) or (PORT.CLASS[SECTOR.WARPS[CURRENTSECTOR][$i]] = 4))
					add $tpi 1
					setVar $tradingPorts[$tpi] SECTOR.WARPS[CURRENTSECTOR][$i]
					
					setVar $portPairType 2
					setVar $portReport $tradingPorts[$tpi]
					setVar $portReportLine ""
					goSub :portReportLine
					setVar $tradingPortsDetails[$tpi] $portReportLine
					setVar $tradingPortsType[$tpi] $portPairType
				end
			elseif (($cport = 3) or ($cport = 4))
				if ((PORT.CLASS[SECTOR.WARPS[CURRENTSECTOR][$i]] = 1) or (PORT.CLASS[SECTOR.WARPS[CURRENTSECTOR][$i]] = 6))
					add $tpi 1
					setVar $tradingPorts[$tpi] SECTOR.WARPS[CURRENTSECTOR][$i]
					
					setVar $portPairType 2
					setVar $portReport $tradingPorts[$tpi]
					setVar $portReportLine ""
					goSub :portReportLine
					setVar $tradingPortsDetails[$tpi] $portReportLine
					setVar $tradingPortsType[$tpi] $portPairType
				end
			end
		else
			echo "*############*# Sector " SECTOR.WARPS[CURRENTSECTOR][$i]  " does not warp back "
		end 
		add $i 1
	end

	:GetPort
	if ($tpi = 0)
		setVar $SWITCHBOARD~message "Nothing to trade here...*"
		gosub :SWITCHBOARD~switchboard
		halt

	end
	setVar $i 1
	echo "*####################################"
	echo "*  Select a port to trade with"
	echo "*  (q) to quit"
	echo "*"

	while ($i <= $tpi)
		
		echo $tradingPortsDetails[$i]
		add $i 1
	end
	echo "*"
	
	
	getConsoleInput $portOption SINGLEKEY
	if ($portOption = "q")
		halt
	end
	isNumber $res $portOption
	if ($res = 0)
		echo "**Must be a number or (q) to quit"
		goto :GetPort
	end 
	if ($portOption > $tpi)
		echo "*That isn't an option!! try agian numbbat"
		goto :GetPort
	end
	
	setVar $tradingSector1 $tradingPorts[$portOption]
	setVar $tradingType $tradingPortsType[$portOption]

	return

:portReportLine
	
	setVar $portReportLine ""

	if ($portPairType = 1)
		setVar $outputLen 8
		setVar $outputText PORT.ORG[$portReport]
		gosub :padOutputLen
		setVar $portReportLine $portReportLine & ANSI_10 & " ORG/EQU" & $outputText

		setVar $outputLen 3
		setVar $outputText PORT.PERCENTORG[$portReport]
		gosub :padOutputLen
		setVar $portReportLine $portReportLine & ANSI_11 & "(" & $outputText & "%) / "
	else
		setVar $outputLen 8
		setVar $outputText PORT.FUEL[$portReport]
		gosub :padOutputLen
		setVar $portReportLine $portReportLine & ANSI_10 & " FUEL/EQU" &$outputText

		setVar $outputLen 3
		setVar $outputText PORT.PERCENTFUEL[$portReport]
		gosub :padOutputLen
		setVar $portReportLine $portReportLine & ANSI_11 & "(" & $outputText & "%) / "


	end
	setVar $outputLen 6
	setVar $outputText PORT.EQUIP[$portReport]
	gosub :padOutputLen
	setVar $portReportLine $portReportLine & ANSI_10 & $outputText

	setVar $outputLen 3
	setVar $outputText PORT.PERCENTEQUIP[$portReport]
	gosub :padOutputLen
	setVar $portReportLine $portReportLine & ANSI_11 & "(" & $outputText & "%)"
	
	setVar $outputLen 6
	setVar $outputText $portReport
	gosub :padOutputLen
	setVar $portReportLine "*" & ANSI_11 & "      Pair(" & $tpi & "): " & ANSI_11 & $outputText & $portReportLine

return


:padOutputLen

	getLength $outputText $len

	if ($len < $outputLen)
		subtract $outputLen $len
		setVar $padi 1
		while ($padi <= $outputLen)
			setVar $outputText   " " & $outputText
			add $padi 1
		end
	end

return

:voidadjacent
	
	setVar $voidSector $tradingSector1
	setVar $otherSect $tradingSector2

	gosub :voidadjacentPPT
	setVar $voidSector $tradingSector2
	setVar $otherSect $tradingSector1
	gosub :voidadjacentPPT

return
:clearadjacent
	
	setVar $voidSector $tradingSector1
	setVar $otherSect $tradingSector2
	gosub :clearadjacentPPT
	setVar $voidSector $tradingSector2
	setVar $otherSect $tradingSector1
	gosub :clearadjacentPPT

return

:voidadjacentPPT
    getSector $voidSector $sectorInfo
    if ($sectorInfo.warp[1] = 0)
        send "'This sector has no warps, maybe you need to scan it first*"
        halt
    else
        setVar $voidsect 0
        :voids
        add $voidsect 1
        if ($voidsect < 7)
            if ($sectorInfo.warp[$voidsect] <> 0)
		if ($sectorInfo.warp[$voidsect] <> $otherSect)
			send "CV" & $sectorInfo.warp[$voidsect] & "*Q"
		end
            end
            goto :voids
        end

        send "'{" $bot_name "} - Avoids set on adjacent sectors!*"
        send "/"
        waitfor " Sect "    
    end
return

:clearadjacentPPT
    getSector $voidSector $sectorInfo
    if ($sectorInfo.warp[1] = 0)
        send "'{" $bot_name "} -This sector has no warps, try to scan it first!*"
        halt
    else
        setVar $voidsect 0
        :clearvoids
        add $voidsect 1
        if ($voidsect < 7)
            if ($sectorInfo.warp[$voidsect] <> 0)
		if ($sectorInfo.warp[$voidsect] <> $otherSect)
			send "CV0*YN" & $sectorInfo.warp[$voidsect] & "*Q"
		end
            end
            goto :clearvoids
        end

        send "'{" $bot_name "} - Avoids cleared on adjacent sectors!*"
        send "/"
        waitfor " Sect "
    end
return

halt

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
