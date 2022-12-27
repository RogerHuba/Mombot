gosub :BOT~loadVars

loadVar $game~port_max
loadVar $game~ptradesetting
loadVar $game~MAX_PLANETS_IN_GAME
loadVar $GAME~MAX_PLANETS_PER_SECTOR
loadVar $bot~Folder
loadVar $BOT~LIMP_FILE 		
loadVar $BOT~ARMID_FILE 

# ORE

setVar $BOT~help[1]  $BOT~tab&"       Explores the universe looking for Moo Ports "
setVar $BOT~help[2]  $BOT~tab&"       "
setVar $BOT~help[3]  $BOT~tab&" mooexp [turnsstop/cashstop] [maxplanets] {primary} {bad/all} "
setVar $BOT~help[4]  $BOT~tab&"                      "
setVar $BOT~help[5]  $BOT~tab&" Options:"
setVar $BOT~help[6]  $BOT~tab&"    [turnsstop]  <= 60000 stop at these turns"
setVar $BOT~help[7]  $BOT~tab&"    [cashstop]   > 60000 stop at this cash amount"
setVar $BOT~help[8]  $BOT~tab&"    [maxplanets] Max planets b4 blasting and replacing."
setVar $BOT~help[9]  $BOT~tab&"	   {f/o/e}      Highest value product available defaults"
setVar $BOT~help[10]  $BOT~tab&"                to equipment"
setVar $BOT~help[11]  $BOT~tab&"    {bad/all}    Clean bad/all planets post trading. default none."
setVar $BOT~help[12]  $BOT~tab&"    {guard}       Ensures corp planet at SD to invoke Guardian"
setVar $BOT~help[13]  $BOT~tab&"    {ephag}       Default is NEG but set to use EP Haggle"
setVar $BOT~help[14]  $BOT~tab&"    {furb}       Safe Furb - Corp mate runs moofurb"
setVar $BOT~help[15]  $BOT~tab&"    {secure}     Drop/furb mines/limpets"
setVar $BOT~help[16]  $BOT~tab&"    "
setVar $BOT~help[17] $BOT~tab&"    "
setVar $BOT~help[18] $BOT~tab&"    Auto refurbs - requires fed safe if not using furb"
setVar $BOT~help[19] $BOT~tab&"    Stores sectors to go back to when script reruns."
setVar $BOT~help[20] $BOT~tab&"    AUTOCLEANUP if planets above 90%"
setVar $BOT~help[21] $BOT~tab&"    Start from citadel to auto cash dump"
setVar $BOT~help[22] $BOT~tab&"    "
setVar $BOT~help[23] $BOT~tab&"    mooexp [turns] [mooship1] furb ice"
setVar $BOT~help[24] $BOT~tab&"    Make sure >update"

gosub :bot~helpfile

setVar $BOT~script_title "Moo Explorer - Lets bring on the festivities!"
gosub :BOT~banner

gosub :player~quikstats

#array of planetnames
setArray $neg_planetNames 20
setArray $neg_planetNamesTaken 20
setVar $i 1
while ($i <= 20)
	getRnd $ran1 10000 999999
	getRnd $ran2 10000 999999
	setVar $ranname "m" & $ran1 & $ran2
	setVar $neg_planetNames[$i]  $ranname
	add $i 1
end


setvar $startcredits $player~credits
setvar $startturns $player~turns
# try and grab fuel at this
setVar $minOre 160
if ($player~total_holds < $minOre)
	setVar $minOre $player~total_holds
end

if ($player~photons > 0)
	setVar $SWITCHBOARD~message "Yeah Nah, we don't do this with photons.*"
	gosub :SWITCHBOARD~switchboard
	halt
end


if ($game~ptradesetting = 0) or ($game~MAX_PLANETS_IN_GAME = 0) or ($GAME~MAX_PLANETS_PER_SECTOR = 0)
	setVar $SWITCHBOARD~message "No planet trade/planets in game settings >refresh >update.*"
	gosub :SWITCHBOARD~switchboard
	halt
end
setVar $dropCashCit FALSE
setVar $dropCashSector 0
setvar $dropCashPlanet 0
setVAr $dropCashTotal 0


# safe_attack_only makes sure holokill and in sector attack only happens when you can win the fight #
setvar $sector~safe_attack_only true


setVar $startingLocation $PLAYER~CURRENT_PROMPT
if ($startingLocation = "Citadel")
	send "qtnt1*"
	goSub :PLANET~getPlanetInfo
	send "c"
	setVar $dropCashCit TRUE
	setVar $dropCashSector $player~CURRENT_SECTOR
	setVar $dropCashPlanet $planet~planet
	if ($planet~citadel = 0)
		setVar $SWITCHBOARD~message "Planet must have at least a level 1 citadel.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	gosub :player~quikstats
	send "q q "
elseif ($startingLocation <> "Command")
	setVar $SWITCHBOARD~message "must be started from Command prompt.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

if ($PLAYER~PLANET_SCANNER <> "Yes")
	setVar $SWITCHBOARD~message "Ship needs planet scanners*"
	gosub :SWITCHBOARD~switchboard
	halt
end


getWordPos $bot~user_command_line $pos "fire"
if ($pos > 0)

	getWordPos $bot~user_command_line $pos "bank:"
	if ($pos > 0)
		setVar $cline $bot~user_command_line & " "
		getText $cline $bankToo "bank:" " "
		setVar $bot~parm5 "bank:" & $bankToo 
	else
		setVar $bot~parm5 "bank:bot222" 
	end
	setVar $fireplanet 1
	setvar $firePlanetType "Dead Earth"

	setVar $bankcash TRUE
	setVar $doFireUpgrade 1
	setVar $bot~user_command_line $bot~parm1 & " " & $bot~parm2 & " e secure " & $bot~parm5

	setVar $bot~parm3 "e"
	setVar $bot~parm4 "secure"
	
	setVar $doFireTithe 1
	setVar $fireTithePerson "bot333"

	setvar $kill true
	setVar $furbfigs TRUE
	send "i"
	setTextLineTrigger checkHell :checkHell "Hell's StarShip"
	setTextLineTrigger checkHellDone :checkHellDone "Credits        :"
	pause
	:checkHell
		killalltriggers
		setVar $doFireUpgrade 0
	:checkHellDone
		killalltriggers
	

end
setVar $ice 0
getWordPos $bot~user_command_line $pos "ice"
if ($pos > 0)
	setVar $ice 1
end

getWordPos " "&$bot~user_command_line&" " $pos "kill"
if ($pos > 0)
	# set to false if you don't want to attack while cashing #
	setVar $kill TRUE
end

if (($player~TWARP_TYPE <> 1) and ($player~TWARP_TYPE <> 2))
	if ($ice = 0)
		setVar $SWITCHBOARD~message "MooExp - Twarp = good, No Twarp = bad.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
end

if ($player~FIGHTERS < 301)
	setVar $SWITCHBOARD~message "MooExp - Need more than 300 figs, you'll hit debree and die!*"
	gosub :SWITCHBOARD~switchboard
	halt
end


if (($player~ore_holds < 100) and ($ice = 0))
	setVar $SWITCHBOARD~message "MooExp - We need ore in our holds.*"
	gosub :SWITCHBOARD~switchboard
	halt
end


setVar $halt_turns $bot~parm1
isNumber $number $halt_turns

if ($number <> 1)
	setvar $switchboard~message "First parm should be stop turns or stop credits.*"
	gosub :switchboard~switchboard
	halt

end

if ($halt_turns <= 0)
	setvar $switchboard~message "First parm should be greater than zero.*"
	gosub :switchboard~switchboard
	halt
else
	if ($halt_turns <= 60000)
		setvar $switchboard~message "We will stop when we reach " & $halt_turns & " turns.*"
		gosub :switchboard~switchboard
		setVar $cashTarget 0
	else
		setVar $cashTarget $halt_turns
		setVar $halt_turns 50
		setvar $switchboard~message "We will stop when we reach " & $halt_turns & " turns or " & $cashTarget & " credits.*"
		gosub :switchboard~switchboard
	end
end



# it will make up to this many planets in sector before blasting them
# however will leave when port empty

setVar $preferredPlanetSlot $bot~parm2
isNumber $number $preferredPlanetSlot

if ($number <> 1)
	setvar $switchboard~message "Please select how many planets required.*"
	gosub :switchboard~switchboard
	halt

end

if (($preferredPlanetSlot <= 0) or ($preferredPlanetSlot > 10))
	setvar $switchboard~message "Preferred planet should be from 1 to 10*"
	gosub :switchboard~switchboard
	halt
else
	setvar $switchboard~message "We will create a max of " & $preferredPlanetSlot & " planets.*"
	gosub :switchboard~switchboard
end

setVar $furbfigsQuant 0

getWordPos $bot~user_command_line $pos "figs:"
if ($pos > 0)
	setVar $furbfigs TRUE
	setVar $cline $bot~user_command_line & " "
	getText $cline $furbfigsQuant "figs:" " "
	setvar $switchboard~message "We are restocking fighters up " & $furbfigsQuant & ".*"
else
	getWordPos $bot~user_command_line $pos "figs"
	if ($pos > 0)
		setVar $furbfigs TRUE
		setvar $switchboard~message "We are restocking fighters.*"

	end
end

getWordPos $bot~user_command_line $pos "bank:"
if ($pos > 0)
	setVar $bankcash TRUE
	setVar $cline $bot~user_command_line & " "
	getText $cline $bankToo "bank:" " "
	setvar $switchboard~message "We are sending our cash to " & $bankToo & ".*"

end

setVar $userCleanup 0
gosub :switchboard~switchboard
getWordPos $bot~user_command_line $pos "all"
if ($pos > 0)
	setVar $userCleanup 2
	setvar $switchboard~message "We are blowing ALL planets post trade.*"
else
	getWordPos $bot~user_command_line $pos "bad"
	if ($pos > 0)
		setVar $userCleanup 1
		setvar $switchboard~message "We are just blowing dud planets.*"
	end
end
setVar $cleanup $userCleanup
gosub :switchboard~switchboard

getWordPos $bot~user_command_line $pos "guard"
if ($pos > 0)
	setVar $useGuard TRUE
	setvar $switchboard~message "Creating a corp planet at SD.*"
else
	setVar $useGuard FALSE
	setvar $switchboard~message "Not Creating Guardian Planets.*"
end
gosub :switchboard~switchboard

getWordPos $bot~user_command_line $pos "ephag"
if ($pos > 0)
	setVar $useEp TRUE
	setvar $switchboard~message "Using Ep Haggle*"
else
	setVar $useEp FALSE
	setvar $switchboard~message "Using internal NEG for haggle.*"
end
gosub :switchboard~switchboard



setVar $iceFurb FALSE
setVar $iceShipMoo 0
setVar $iceShipExplore 0

# $player~corpCashDump <-- i've disabled this because you can be hit by attacks with this

getWordPos $bot~user_command_line $pos "furb"
if ($pos > 0)
	setVar $player~corpfurb TRUE
	setvar $switchboard~message "Using Corp Furbing.*"
	setVar $useGuard FALSE
	setVar $furbfigs FALSE
	setVar $player~corpCashDump FALSE
	
	if ($ice = 1)
		# mooexp 1000 5 furb ice
		setvar $switchboard~message "Using Corp Furbing: Ice T Version.*"
		setVar $iceFurb TRUE
		goSub :setUpIce
	end
else
	setVar $player~corpfurb FALSE
	setVar $player~corpCashDump FALSE
	setvar $switchboard~message "We will furb ourselves.*"
	if ($player~ALIGNMENT < 1000)
		setVar $SWITCHBOARD~message "You're just not good enough for this script (alignment).*"
		gosub :SWITCHBOARD~switchboard
		halt
	end


end
gosub :switchboard~switchboard



getWordPos $bot~user_command_line $pos "deldata"
if ($pos > 0)
	setVar $deleteData TRUE
else
	setVar $deleteData FALSE
end


setVar $secure FALSE
getWordPos $bot~user_command_line $pos "secure"
if ($pos > 0)
	setVar $secure TRUE
	setvar $switchboard~message "Securing sectors with limps and armids.*"
	loadVar $GAME~ARMID_COST
	loadVar $GAME~LIMPET_COST
end
gosub :switchboard~switchboard



# Primary product 1 - fuel, 2 - org, 3 - fuel
setVar $SWITCHBOARD~message "Primary product will be equipment.*"
setVar $PrimaryProduct 3
getWordPos " "&$bot~user_command_line&" " $pos " f "
if ($pos > 0)
	setVar $PrimaryProduct 1
	setVar $SWITCHBOARD~message "Primary product will be fuel ore.*"
end

getWordPos " "&$bot~user_command_line&" " $pos " o "
if ($pos > 0)
	setVar $SWITCHBOARD~message "Primary product will be Organics.*"
	setVar $PrimaryProduct 2
end

getWordPos " "&$bot~user_command_line&" " $pos " e "
if ($pos > 0)
	setVar $PrimaryProduct 3
end


gosub :SWITCHBOARD~switchboard

setVar $allLimps 0
setVar $allArmids 0


fileExists $limpFileChk $BOT~LIMP_FILE
fileExists $armidFileChk $BOT~ARMID_FILE
if ($limpFileChk = 1) and ($armidFileChk = 1)
	readToArray $BOT~LIMP_FILE $allLimps
	readToArray $BOT~ARMID_FILE $allArmids


else

	setVar $BOT~command "update"
	setVar $BOT~user_command_line ""
	setVar $BOT~parm1 ""
	saveVar $BOT~parm1
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\"&$bot~mombot_directory&"\commands\data\update.cts"
	setEventTrigger        limpchkend        :limpchkend "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\data\update.cts"
	pause
	:limpchkend
		killalltriggers

	readToArray $BOT~LIMP_FILE $allLimps
	readToArray $BOT~ARMID_FILE $allArmids
end

gosub :SHIP~getShipStats
gosub :combat~init 

setVar $stat_turnsUsed 0 
setVar $stat_figsdown 0
setVar $stat_moves 0
setVar $stat_trades 0
setVar $stat_refurbs 0
setVar $stat_torps 0
setVar $stat_atomics 0
setVar $stat_dollarsgross 0
setVar $stat_dollarsnet 0
setVar $stat_dollarsspent 0

window moo 300 300 "Explore and Trade" 

setvar $stuff "Turns: " & $stat_turnsUsed & "*Figs Down: " & $stat_figsdown & "*Ports Traded: " & $stat_trades & "*Moves Made: " & $stat_moves & "**Gross Cash:" & $stat_dollarsgross & "*Expense:" & $stat_dollarsspent & "*Net Cash:" & $stat_dollarsnet
setvar $stuff $stuff & "**Refurbs: " & $stat_refurbs & "**Gen Torps: " & $stat_torps & "*Atomics: " & $stat_atomics
setWindowContents moo $stuff



#logging off
#reqRecording

loadVar $switchboard~bot_name
loadVar $player~unlimitedGame		
loadVar $bot_turn_limit		
loadVar $bot~user_command_line	
loadVar $bot~parm1			
loadVar $bot~parm2			
loadVar $dropOffensive			
loadVar $dropToll			
loadVar $surroundFigs			
loadVar $surroundLimp			
loadVar $surroundMine			
loadVar $stardock			



setVar $mooExploredFile "moo_explored_" &  GAMENAME  & ".txt"
setVar $mooGoodPortsFile "moo_goodports_" &  GAMENAME  & ".txt"
setVar $dangerousSectorLogFile "Grid_Warnings_" &  GAMENAME & "_" & $date & ".txt"
setVar  $moo_setting_file     $bot~Folder&"/moo_settings.cfg"

setVar $totalGamePlanets 0
setVar $getPlanetSettingsReq 0


# SHOULD WE MOO THESE PRODUCTS? And what min levels starting to qualify
setVar $MOO_FUEL 1
setVar $MOO_ORGANICS 1
setVar $MOO_EQUIPMENT 1
setVar $FUEL_MIN_MOO 750
setVar $ORGANICS_MIN_MOO 500
setVar $EQUIPMENT_MIN_MOO 250

setVar $planet~planetsInSector 0
setVar $planet~planets 0
setVar $planet~planeti 1


# Trading Min - we'll stop using a port when we get here
setVar $tradingMinProduct 40


# NEED TO GET THIS FROM GAME  -THen ALLOW SAY 80% used by script
setVar $planet~planetSALLOWEDINGAME $game~MAX_PLANETS_IN_GAME
setVar $planet~planetSALLOWED (($planet~planetSALLOWEDINGAME * 90) / 100)


fileExists $mooFileChk $moo_setting_file
if ($mooFileChk = 1)
	
	setVar $i 1
	readToArray $moo_setting_file $moo_settings
	setArray $planet~planetList $moo_settings 5
	while ($i <= $moo_settings)
	    setVar $planet~planetInf $moo_settings[$i]
	    gosub :process_planet_line
	    setVar $planet~planetList[$i] $planet~planetName
	   
	    setVar $planet~planetList[$i][1] $planet~planet_CHECKED
	    setVar $planet~planetList[$i][2] $planet~planet_START_FUEL
	    setVar $planet~planetList[$i][3] $planet~planet_START_ORG
	    setVar $planet~planetList[$i][4] $planet~planet_START_EQUIP
	    setVar $planet~planetList[$i][5] $planet~planet_TRADE_PLANET
	    
	    add $i 1
	end
	setVar $totalGamePlanets $moo_settings
     

else
	
	loadvar $planet~planet_file
	gosub :PLANET~loadplanetInfo
	setVar $i 1

	# Fuel Org Equ
	while ($i <= $planet~planetcounter)
		
		# Class E, Red Rider Double Action BB Gun
		setVar $p $planet~planetList[$i]
		getWordPos $p $loc "Class"
		
		cutText $p $planet~planetname $loc 99
		write $moo_setting_file "0 0 0 0 0 " & $planet~planetname 
		setVar $planet~planetList[$i] $planet~planetName
		setVar $planet~planetList[$i][1] 0
		setVar $planet~planetList[$i][2] 0
		setVar $planet~planetList[$i][3] 0
		setVar $planet~planetList[$i][4] 0
		setVar $planet~planetList[$i][5] 0
		add $i 1
	end
	setVar $totalGamePlanets $planet~planetcounter

end



setArray $explored SECTORS
setArray $portReported SECTORS
setArray $portBlocked SECTORS
setArray $futureDestinations SECTORS
setVar $futureDestsAdded 0
setVar $futurePortsAdded 0


fileExists $figlchk $mooExploredFile
if ($figlchk = 1)
	
	if ($deleteData = TRUE)
		echo "*###########"
		echo "*# DELETED #"
		echo "*###########"
		setvar $switchboard~message "Deleting Previous Data.*"
		gosub :switchboard~switchboard
		delete $mooExploredFile
		delete $mooGoodPortsFile
	else
		if ($figlchk = 1)
			
			readToArray $mooExploredFile $voidsList
			setVar $i 1
			while ($i <= $voidsList)
				setVar $explored[$voidsList[$i]] 1
				#echo "* adding: " $voidsList[$i]
				add $i 1
			end
		end
	end
end


fileExists $figlchk $mooGoodPortsFile
if ($figlchk = 1)	
	readToArray $mooGoodPortsFile $goodList
	setVar $i 1
	while ($i <= $goodList)
		
		getWord $goodList[$i] $sec 1
		getWord $goodList[$i] $goodport 2
		getWord $goodList[$i] $den 3
		getWord $goodList[$i] $warps 4
		
		if ($explored[$sec] <> 1)
			add $futureDestsAdded 1
			add $futurePortsAdded 1
			setVar $futureDestinations[$sec] 1
			setVar $futureDestinations[$sec][0] $goodport
			setVar $futureDestinations[$sec][1] $den
			setVar $futureDestinations[$sec][2] $warps
			setVar $futureDestinations[$sec][3] 1

		end
		add $i 1
	end

	
end

setvar $switchboard~message "Pause for effect....*"
gosub :switchboard~switchboard
if ($useEp = 1)
	send "'" $BOT~BOT_NAME " ephaggle planet*"
end

setDelayTrigger delay :startPause 3000
pause
:startPause


setvar $switchboard~message "... and we are off!*"
gosub :switchboard~switchboard

gosub :player~quikstats

gosub :setVoidSectors




######################### MAIN LOOP
# Log Explored sectors so script can re-start



setVar $skipport 0	
setVar $iSaySo 1
while ($iSaySo)
	:topOfTheGridLoop
	setVar $freshSectors 0
	setVar $freshSectorsi 0

	setVar $firstNext 1
	
	gosub :player~quikstats
	if ($doFireUpgrade = 1) and ($player~credits > 12000000)
		goSub :fireUpgrade
	end
	setvar $player~turnsNow $player~turns

	if ($player~turnsNow < $halt_turns)
		setvar $switchboard~message "Turn Limit Reached*"
		gosub :switchboard~switchboard
		gosub :subreport
		halt
	end
	if (($player~FIGHTERS < 301) and ($ice = 0))
		setVar $SWITCHBOARD~message "Need more than 300 figs, you'll hit debree and die!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	goSub :updateStats

	if ($skipport = 0)
		goSub :checkTrade
	end
	setVar $skipport 0
	
	# Log These like ftr grid and reload to not duplicate
	setVar $explored[CURRENTSECTOR] 1
	write $mooExploredFile CURRENTSECTOR

	setVar $freshSectors 0
	setVar $freshSectorsi 0

	setVar $firstNext 0

	goSub :getNextSector

	if ($gridSectorPostTwarp > 0)
		
		setVar $player~warpto $gridSector
		gosub :player~twarp
		add $stat_moves 1

		setVar $gridSectorPostTwarp 0
		# Need to skip trading at next port as it'll be used
		# saves wasing time re checking
		setVar $skipport 1
		gosub :player~quikstats
		if ($player~CURRENT_SECTOR <> $gridSector)
			setVar $SWITCHBOARD~message "We didn't make it to: " & $gridSector &" - manually refuel and type 'go go !' minus spaces once you have fuel and I'll twarp there.!*"
			gosub :SWITCHBOARD~switchboard
			waitfor "gogo!"
			setVar $player~warpto $gridSector
			gosub :player~twarp
		end

	else
		goSub :gridNextSector
	end
	

	

	
end
######################### END LOOP

halt
######################################## TRADE ROUTINES 
:checkTrade
	
	setVar $didTrade 0
	setVar $tradingSector1 0
	
	setVar $portToCheck CURRENTSECTOR
	setVar $portCheckedOk 0
	goSub :searchForTradingPort
	if ($portCheckedOk = 1)
		setVar $tradingSector1 $portToCheck
	end
	if ($tradingSector1 > 0)
		setVar $tradingSector2 CURRENTSECTOR
		add $stat_trades 1
		if ($ice = 1)
			
			goSub :icePreTrade
			goSub :createAndSell
			goSub :icePostTrade
		else
			goSub :createAndSell
		end

	end

return

:icePreTrade
	# xport
	# Twarp
	setVar $xportShip $iceShipMoo
	goSub :xportShip
	gosub :player~quikstats
	setVar $player~warpto $tradingSector2
	gosub :player~twarp
	add $stat_moves 1
	gosub :player~quikstats

return

:icePostTrade
	gosub :player~quikstats
	setVar $iceShipMoo $player~SHIP_NUMBER

	setVar $xportShip $iceShipExplore
	goSub :xportShip
return

:xportShip

	setVar $xportString "X  " & $xportShip & "*Q"
        send $xportString
        setTextLineTrigger noxportship :noxportship "That is not an available ship"
        setTextLineTrigger noxportrange :noxportrange "only has a transport range"
        setTextLineTrigger noxportpassword :noxportpassword "Enter the password for"
        setTextLineTrigger xportsuccess :xportsuccess "Security code accepted"
        pause
        pause
        :noxportship
		killalltriggers
		setVar $SWITCHBOARD~message "Ship not available for Xport, could be under attack!!*"
		gosub :SWITCHBOARD~switchboard
		halt
        :noxportrange
		killalltriggers
		setVar $SWITCHBOARD~message "Not enough transport range, Script Halting.*"
		gosub :SWITCHBOARD~switchboard
		halt
        :noxportpassword
		killalltriggers
		setVar $SWITCHBOARD~message "Transport ship requires a password, Script Halting.*"
		gosub :SWITCHBOARD~switchboard
		halt
        :xportsuccess
		killalltriggers
		return

return

:searchForTradingPort
# TradeType 1: XBS/XSB	

	# 0 - zzz
	# 1 - BBS
	# 2 - BSB
	# 3 - SBB
	# 4 - SSB
	# 5 - SBS
	# 6 - BSS
	# 7 - SSS
	# 8 - BBB

	setVar $cport PORT.CLASS[$portToCheck]
	if ($PrimaryProduct = 1)
		setVar $prodPerc PORT.PERCENTFUEL[$portToCheck]
		if ($prodPerc >= $tradingMinProduct)
			if (PORT.BUYFUEL[$portToCheck] = 1)
				setVar $portCheckedOk 1
			end
		end
	elseif ($PrimaryProduct = 2)
		setVar $prodPerc PORT.PERCENTORG[$portToCheck]
		if ($prodPerc >= $tradingMinProduct)
			if (PORT.BUYORG[$portToCheck] = 1)
				setVar $portCheckedOk 1
			end
		end
	elseif ($PrimaryProduct = 3)
		setVar $prodPerc PORT.PERCENTEQUIP[$portToCheck]
		if ($prodPerc >= $tradingMinProduct)
			if ($cport = 4)
				if (PORT.EQUIP[$portToCheck] > 1800)
					setVar $portCheckedOk 1
				end
			elseif (PORT.BUYEQUIP[$portToCheck] = 1)
				setVar $portCheckedOk 1
			end
		end
	end 


	
return

:searchForTradingPort_old
# TradeType 1: XBS/XSB	

	# 0 - zzz
	# 1 - BBS
	# 2 - BSB
	# 3 - SBB
	# 4 - SSB
	# 5 - SBS
	# 6 - BSS
	# 7 - SSS
	# 8 - BBB

	setVar $cport PORT.CLASS[$portToCheck]
	
	if ($PrimaryProduct = 1)
		if (($cport = 1) or ($cport = 2) or ($cport = 6) or ($cport = 8)) 
			setVar $prodPerc PORT.PERCENTFUEL[$portToCheck]
			if ($prodPerc >= $tradingMinProduct)
				setVar $portCheckedOk 1
			end
			
		end
	elseif ($PrimaryProduct = 2)
		if (($cport = 1) or ($cport = 3) or ($cport = 5) or ($cport = 8)) 
			setVar $prodPerc PORT.PERCENTORG[$portToCheck]
			if ($prodPerc >= $tradingMinProduct)
				setVar $portCheckedOk 1
			end
			
		end
	elseif ($PrimaryProduct = 3)
		if (($cport = 2) or ($cport = 3) or ($cport = 4) or ($cport = 8)) 
			setVar $prodPerc PORT.PERCENTEQUIP[$portToCheck]
			if ($prodPerc >= $tradingMinProduct)
				setVar $portCheckedOk 1
			end
			
		end
	end 
return


:headHomeAndDump
	setVar $player~warpto $dropCashSector
	gosub :player~twarp
	send "l" $dropCashPlanet "*c"
	goSub :player~quikstats
	send "tt" ($player~credits - 500000) "*"
	setVar $dropCashTotal ($dropCashTotal + ($player~credits - 500000))
	send "q q "
	waitfor "Command [TL"
	gosub :player~quikstats
return

:restock

	
	if ($player~corpfurb = true)
		if ($ice = 1)
			gosub :restockice
		else
			gosub :restockcorp
		end
	else
		gosub :player~quikstats
	
		if ($cashTarget > 0)
			if (($player~credits + $dropCashTotal)> $cashTarget)
			
				setVar $SWITCHBOARD~message "Cash target has been reached.*"
				gosub :SWITCHBOARD~switchboard
				if ($dropCashCit = TRUE)
					goSub :headHomeAndDump
				end
				goSub :updateStats
				halt
			end
		end
		
		setVar $dropCashThisTrip 0
		setVar $prestockcredits $player~credits
		stripText $precredits ","

		gosub :restockself

		gosub :player~quikstats
		setVar $poststockcredits $player~credits
		stripText $poststockcredits ","
		setVar $stat_dollarsspent ($precredits - ($poststockcredits + $dropCashThisTrip))
	end


return

:restockice
	
	# BOT_NAME - MOOSHIP - EXPLORESHIP CURRENTSECTOR
	gosub :player~quikstats

	:pickupTryAgain
	send "'MooTime@ " $SWITCHBOARD~bot_name " " $player~SHIP_NUMBER " " $iceShipExplore " " CURRENTSECTOR "*"
	
	
	setTextLineTrigger pickupok :pickupok "Roger, gifts on route"
	setDelayTrigger pickupTimeOut :pickupTimeOut 4000
	pause
	:pickupTimeOut
		killalltriggers
		goto :pickupTryAgain

	:pickupok
		killalltriggers
	
	waitfor "ICEICEBABY"
	gosub :player~quikstats
return

:restockcorp
	
	gosub :player~quikstats

	:pickupTryAgain
	send "'MooTime@ " $SWITCHBOARD~bot_name " " $player~SHIP_NUMBER " " CURRENTSECTOR "*"
	
	
	setTextLineTrigger pickupok :pickupok "Roger, gifts on route"
	setDelayTrigger pickupTimeOut :pickupTimeOut 4000
	pause
	:pickupTimeOut
		killalltriggers
		goto :pickupTryAgain

	:pickupok
		killalltriggers
	
	waitfor "Xport complete."
	gosub :player~quikstats

return

:restockself
	add $stat_refurbs 1
	send "d"
	setVar $returnSpot CURRENTSECTOR
echo "#RETURNSEC:" $returnSpot "*"
	setVar $restockMakePlanet 0
	if ($useGuard = true)
		
		setVar $planet~planetFound 0
		goSub :checkCorpPlanet
		if ($planet~planetFound = 0)
			setVar $restockMakePlanet 1
		else
			setVar $restockMakePlanet 0
		end

	end

	if ($player~corpCashDump = TRUE)

		setVar $doDockCashDump FALSE
		if ($PLAYER~CREDITS > 1100000)
			setVar $player~corpNotAtDock TRUE
			gosub :checkCorpAtDock
			if ($player~corpNotAtDock = FALSE)
				setVar $doDockCashDump TRUE
			end

		end
	end 
	
	send "nq"
	setTextLineTrigger stargateCheck :stargateCheck "Class 9 (Special) (StarDock)"
	setDelayTrigger nostargateCheck :nostargateCheck 3000
	pause
	:nostargateCheck
		killalltriggers
		setVar $SWITCHBOARD~message "Stardock is gone!! Halting..*"
		gosub :SWITCHBOARD~switchboard
		halt
	:stargateCheck
		killalltriggers
	send "m" $stardock "*y"
	waitfor "Locating beam pinpointed, TransWarp"
	send "y  p   sh"

		if ($doFireTithe = 1) and ($player~credits > 1500000)
			send "qgd500000*"
			send "t" $fireTithePerson "*500000******qh"
			subtract $player~credits 500000
		end
		if ($player~credits > 300000)
			send "a"
			setTextTrigger shipCheckBuyAtomics :shipCheckBuyAtomics "How many Atomic Detonators do you want"
			pause
			:shipCheckBuyAtomics
				killalltriggers
				getWord CURRENTLINE $player~atomicssAvail 9
				stripText $player~atomicssAvail ")"
				if ($player~atomicssAvail = 0)
					echo "*### we have a problem, no Atomics purchasable waiting for next"
					#waitfor "next@"
					send "*"
				else
					send  "*a" $player~atomicssAvail "*"
				end
		end

		send "t"
		setTextTrigger shipCheckBuyTorps :shipCheckBuyTorps "How many Genesis Torpedoes do you want"
		pause
		:shipCheckBuyTorps
			killalltriggers
			getWord CURRENTLINE $TorpssAvail 9
			stripText $TorpssAvail ")"
			if ($TorpssAvail = 0)
				echo "*### we have a problem, no Torps purchasable waiting for next"
				waitfor "next@"
			end
			send $TorpssAvail "*"

			if ($secure)
				#loadVar $GAME~ARMID_COST
				#loadVar $GAME~LIMPET_COST

				# just going to buy up to 100 of each - and when we are below 50 - to avoid slow down
				setTextLineTrigger cashLeft :cashLeft "You have "
				pause
				:cashLeft
					killalltriggers
					getWord CURRENTLINE $cashOnHand 3
					stripText $cashOnHand ","
					if ($cashOnHand > 1000000)
						setVar $cashOnHand ($cashOnHand - 1000000)
						setPrecision 1
						setVar $limpCash ($cashOnHand * 0.8)
						setVar $armidCash ($cashOnHand * 0.2)
						setPrecision 0
						if ($GAME~ARMID_COST = 0)
							send "m0*"
							setTextLineTrigger armidCost :armidCost "damage.  These cost"
							pause
							:armidCost
								killalltriggers
								getWord CURRENTLINE $acost 4
								STRIPTEXT $acost ","
								setVar $GAME~ARMID_COST $acost

							send "l0*"
							setTextLineTrigger limpCost :limpCost "credits each."
							pause
							:armidCost
								killalltriggers
								getWord CURRENTLINE $lcost 3
								STRIPTEXT $lcost ","
								setVar $GAME~LIMPET_COST $lcost
						end

						if ($PLAYER~LIMPETS < 50)
							setVar $limpsNeeded (100 - $PLAYER~LIMPETS)
							setVar $buyLimpQuant (($limpCash / $GAME~LIMPET_COST) - 1)
							if ($buyLimpQuant > $limpsNeeded)
								setVar $buyLimpQuant $limpsNeeded
							end
							send "l" $buyLimpQuant "*"
						end

						if ($PLAYER~ARMIDS < 50)
							setVar $minesNeeded (100 - $PLAYER~ARMIDS)
							setVar $buyMineQuant (($armidCash / $GAME~ARMID_COST) - 1)
							if ($buyMineQuant > $minesNeeded)
								setVar $buyMineQuant $minesNeeded
							end
							send "m" $buyMineQuant "*"
						end

					end
			end
		
			gosub :player~quikstats
			
			send "qsp"
			setVar $checkQuik FALSE

			if ($player~TOTAL_HOLDS < $SHIP~SHIP_MAX_HOLDS)
				setTextLineTrigger refurbHoldPrice :refurbHoldPrice "credits / next hold"
			end
			:moreRefurbing
			setTextTrigger refurbFigPricet :refurbFigPricet "credits per fighter"
			setTextTrigger refurbShields :refurbShields "Shield Points"
			pause
			:refurbHoldPrice
				killalltriggers
				if ($player~credits > 500000)
					getWord CURRENTLINE $holdsForSale 10
					send "a" $holdsForSale "*"
					setTextLineTrigger holdsCost :holdsCost "more holds is"
					pause
					:holdsCost
					killalltriggers
					getWord CURRENTLINE $holdsCost 8
					STRIPTEXT $holdsCost ","
					setVar $afterBuy ($player~credits - $holdsCost)
					if ($afterBuy < 200000)
						setVar $holdsForSale ($holdsForSale/2)
						send "na" $holdsForSale "*y"
					else
						send "y"
					end
					send "q"

					gosub :player~quikstats
					send "p"
				end
				
				goto :moreRefurbing
			:refurbFigPricet
				killalltriggers
				if ($furbfigs = TRUE)
					getWord CURRENTLINE $figPrice 4
					getWord CURRENTLINE $canBuy 8
					setVar $figsToBuy $player~credits
					subtract $figsToBuy 250000
					divide $figsToBuy $figPrice
					
					if ($figsToBuy > $canBuy)
						setVar $figsToBuy $canBuy
					end
					if ($furbfigsQuant > 0)
						if ($player~FIGHTERS < $furbfigsQuant)
							setVar $maxRequired ($furbfigsQuant - $player~FIGHTERS)
							if ($maxRequired < $figsToBuy)
								setVar $figsToBuy $maxRequired
							end
							if ($figsToBuy > 0)
								send "b" $figsToBuy "*" 
							end
						end
					else
						send "b" $figsToBuy "*"
					end
					setVar $checkQuik TRUE
				end
				goto :moreRefurbing
			:refurbShields
				killalltriggers
				getWord CURRENTLINE $shieldPrice 5
				getWord CURRENTLINE $canBuy 9
				setVar $player~shieldsToBuy $player~credits
				subtract $player~shieldsToBuy 250000
				divide $player~shieldsToBuy $shieldPrice
				
				if ($player~shieldsToBuy > $canBuy)
					setVar $player~shieldsToBuy $canBuy
				end
				send "c" $player~shieldsToBuy "*"
			
			if ($checkQuik = TRUE)
				goSUb :player~quikstats
				setVar $checkQuik FALSE
			end 
			if ($player~credits > 2000000) and ($bankcash = TRUE)
				goSUb :player~quikstats
				send "q q g d "
				setTextTrigger bankdeposit :bankdeposit "How many credits do you want to deposit? ("
				pause
				:bankdeposit
					killalltriggers
					getWord CURRENTLINE $depMax 9
					striptext $depMax "("
					striptext $depMax ")"
					striptext $depMax ","
					
					if ($depMax = $player~credits)
						setVar $depAmount ($depMax - 500000)
					else
						setVar $depAmount $depMax
					end
					
					if ($depAmount > 0)
						send $depAmount "*"
					else
						send "0*"
					end
					send "t" $bankToo "*"
					setTextLineTrigger bankUnknown :bankUnknown "Unknown Trader!"
					setTextTrigger bankunsure :bankunsure "Do you mean"
					setTextTrigger bankPersonFound :bankPersonFound "How many credits do you want to transfer?"
					pause
					:bankUnknown
						killalltriggers
						setVar $SWITCHBOARD~message "Trader to send bank transfer cash not found. I will not try again.*"
						gosub :SWITCHBOARD~switchboard
						setVar $bankcash false
						goto :bankDone
					:bankunsure
						killalltriggers
						:bankunsureagain
						getText CURRENTLINE $testName "Do you mean " "?"
						if ($testName <> $previousName)
							setVar $previousName $testName
							setVar $SWITCHBOARD~message "Attempting Bank Transfer, Unsure of name, Did you mean: " & $testName &"? (10 secs to answer)*"
							gosub :SWITCHBOARD~switchboard
							:giveUpAgain
							setDelayTrigger getNameGiveup :getNameGiveup 10000
							setTextTrigger bankunsureagain :bankunsureagain "Do you mean"
							setTextTrigger bankUnknown :bankUnknown "Unknown Trader!"
							setTextTrigger bankPersonFound :bankPersonFound "How many credits do you want to transfer?"
							pause
						else
							setTextTrigger bankunsureagain :bankunsureagain "Do you mean"
							pause
						end
						:getNameGiveup
							killalltriggers
							send "n"
							goto :giveUpAgain
						
						goto :bankDone

				:bankPersonFound
					killalltriggers
					getWord CURRENTLINE $transAmount 9
					striptext $transAmount "("
					striptext $transAmount ")"
					striptext $transAmount ","
					send $transAmount "*q s p"
					
				:bankDone
					killalltriggers
			end
			if ($player~corpCashDump = TRUE)

				if ($doDockCashDump = TRUE)
					goSUb :player~quikstats
					if ($PLAYER~CREDITS > 1100000)
						setVar $dumpcash ($PLAYER~CREDITS - 150000)
					else
						setVar $doDockCashDump FALSE
					end
				end
			end

	setVar $exitmacro ""

	#send "qspb5000*c3000*q"
	setVar $exitmacro $exitmacro & "qqq    *   "
	if ($restockMakePlanet = 1)
		setVar $exitmacro $exitmacro &  "u   y  n  .  n  *  c * *  "
	end
	
	if ($player~corpCashDump = TRUE)
		if ($doDockCashDump = TRUE)
			setVar $exitmacro $exitmacro &  "t  c  y  q   z   t" & $dumpcash  & "*  *  *  "
		end
	end

	setVar $doingCitDrop FALSE
	if ($dropCashCit = TRUE) and ($player~credits > 5000000)
		getSectorParameter $dropCashSector "FIGSEC" $hasFig
		if ($hasFig = 1)
			setVar $exitmacro $exitmacro &  "m  "  & $dropCashSector   & "*   y   y  "
			setVar $doingCitDrop TRUE
		else
			send "'Drop Cash Sector Fig GonE?!?*"
			setVar $exitmacro $exitmacro &  "m  "  & $returnSpot   &  "*   y   y  "
		end
	else
		setVar $exitmacro $exitmacro &  "m  " &  $returnSpot   &  "*   y   y  "
	end
	send $exitmacro
	setTextLineTrigger restockBack1 :restockBack1 "<Set NavPoint>"
	setTextLineTrigger restockBack2 :restockBack2  "Systems Ready, shall we engag"
	pause
		:restockBack1
			killalltriggers
			send "q * q * * pss"
			setVar $SWITCHBOARD~message "Failed to leave dock!! Hopefully on dock..*"
			gosub :SWITCHBOARD~switchboard
			halt	

		:restockBack2
			killalltriggers
	if ($doingCitDrop = TRUE)
		setVar $doingCitDrop FALSE
		send "l" $dropCashPlanet "*c"
		goSub :player~quikstats
		send "tt" ($player~credits - 500000) "*"
		setVar $dropCashThisTrip ($player~credits - 500000)
		setVar $dropCashTotal ($dropCashTotal + ($player~credits - 500000))
		send "q q "
		waitfor "Command [TL"
		gosub :player~quikstats
		setVar $player~warpto $returnSpot
		gosub :player~twarp
		gosub :player~quikstats
	end
return

:checkCorpAtDock

	send "taq"
	waitfor "-----------------------------------------------------------------------------"
	:CorpAtDockLookAgain
	
	setTextLineTrigger CorpAtDock :CorpAtDock ""
	pause
		:CorpNotAtDock1
			killalltriggers
			
			
		:CorpAtDock
			killalltriggers
			getWord CURRENTLINE $chk 1
			if ($chk = "Corporate")
				goto :doneAtDock
			end
			getLength CURRENTLINE $clen
			if ($clen > 48)
				
				cutText CURRENTLINE $sector 40 5
				striptext $sector " "
				
				if ($sector = $stardock)
					setVar $player~corpNotAtDock FALSE
				end
			end
			goto :CorpAtDockLookAgain


	:doneAtDock

return

:checkCorpPlanet

	send "tlq"
	waitfor "Corporate Planet Scan"
	waitfor "======================================="

	:checkCorpPlanetsList
		setTextLineTrigger checkCorpPlanetsListPlanet :checkCorpPlanetsListPlanet "#"
		setTextLineTrigger checkCorpPlanetsListnoPlanets :checkCorpPlanetsListnoPlanets "No Planets claimed"
		setTextLineTrigger checkCorpPlanetsListnoPlanets2 :checkCorpPlanetsListnoPlanets2 "You're not on a team!"
		setTextLineTrigger checkCorpPlanetsListEndPlanets :checkCorpPlanetsListEndPlanets "===   ============  ==== ==== ==== ===== ===== ===== ========== ====="
		pause
		:checkCorpPlanetsListPlanet
			killAllTriggers
			getWord CURRENTLINE $checkPlanet 1
			if ($checkPlanet = $stardock)
				setVar $planet~planetFound 1
				return
			end
			goto :checkCorpPlanetsList
		:checkCorpPlanetsListnoPlanets
		:checkCorpPlanetsListnoPlanets2
		:checkCorpPlanetsListEndPlanets
			killAllTriggers
			return

return


######################################## END TRADE ROUTINES

############################# Next Sector STuff

:getNextSector

	#0 or 100, no limpets, or warp back our own path

	setVar $nDensity 0
	setVar $nSector 0
	setVar $nWarps 0
	setVar $nHaz 0
	setVar $nAnom 0
	setVar $nDanger 0
	setVar $deni 0

	setvar $nOkToExplore 0
	setVar $nOkToTrade 0
	
	goSub :scanSectors
	
	setVar $maxWarps 0
	setVar $maxWarpsSector 0
	setVar $maxWarpsGoodPort 0
	setVar $maxWarpsGoodPortSector 0
	setVar $maxProdAmount 0
	setVar $maxProdAmountSector 0

	setVar $i 1

	while ($i <= $deni)

		setVar $danger 0
		setVar $dSector $nSector[$i]
		setVar $dIndex $i
		goSub :checkDanger
		setVar $nDanger[$i] $danger
		setVar $nOkToExplore[$i] 0
		setVar $nOkToTrade[$i] 0
		
#echo $nSector[$i] " " $explored[$nSector[$i]] " " $danger "*"

		if (($explored[$nSector[$i]] = 0) and ($danger = 0))

			
			setVar $nOkToExplore[$i] 1
			
			if ($nWarps[$i] > $maxWarps)
				setVar $maxWarps $nWarps[$i]
				setVar $maxWarpsSector $nSector[$i]
			end
			

			setVar $portToCheck $nSector[$i]
			setVar $portCheckedOk 0
			goSub :searchForTradingPort

			if ($portCheckedOk = 1)
				gosub :getPortQuants

				if ($prodPerc >= $tradingMinProduct)					
					setVar $nOkToTrade[$i] 1

					if ($nWarps[$i] > $maxWarpsGoodPort)
						#echo "* ## Sector is new best port sector:   " $port
						setVar $maxWarpsGoodPort $nWarps[$i]
						setVar $maxWarpsGoodPortSector $nSector[$i]
					end
					if ($prodAmount > $maxProdAmount)
						setVar $maxProdAmount $prodAmount
						setVar $maxProdAmountSector $nSector[$i]
					end
				else
					#echo "* ## Below Min uel - Skipping:   " $port "%"
				end
			end
		end
		
		add $i 1
	end


	setVar $addSectors 0 
	setVar $gridSectorPostTwarp 0
	setVar $getFuturePortOnly 0
	setVar $gridSector 0

	if ($maxProdAmountSector <> 0)
		setVar $gridSector $maxProdAmountSector
		setVar $addSectors 1 
		# make sure its removed from a future gener
		goSub :removeFuture
	elseif ($maxWarpsSector <> 0)
		setVar $addSectors 1 

		if ($futurePortsAdded > 0)
			setVar $tempGridSector $maxWarpsSector
			setVar $getFuturePortOnly 1
			goSub :getFutureDest

			if ($gridSector = 0)
				setVar $gridSector $tempGridSector
			else
			end
			goSub :removeFuture
		else
			setVar $gridSector $maxWarpsSector
			
			# make sure its removed from a future gener
			goSub :removeFuture
		end

	else
		setVar $gridSector 0
		if ($futureDestsAdded > 0)

			goSub :getFutureDest

			if ($gridSector = 0)
				gosub :holoScan
				setvar $switchboard~message "Out of options, try figs and CIM Warps update*"
				gosub :switchboard~switchboard
		
				halt
			end

		else
			gosub :holoScan
			setvar $switchboard~message "Out of options, try figs and CIM Warps update*"
			gosub :switchboard~switchboard
			halt
		end
	end


	if ($addSectors = 1)

		# We found a successful sector
		setVar $i 1
		while ($i <= $deni)
			if (($nOkToExplore[$i] = 1) and ($gridSector <> $nSector[$i]))
			
				# Check if it has more than 1 warp out unless it has a good port

				if ((($nWarps[$i] = 1) and ($nOkToTrade[$i] = 1)) or ($nWarps[$i] > 1))
					setVar $futureDestinations[$nSector[$i]] 1
					add $futureDestsAdded 1

					# adjacent safe
					setVar $futureDestinations[$nSector[$i]][0] CURRENTSECTOR
					# Density
					setVar $futureDestinations[$nSector[$i]][1] $nDensity[$i]
					# Warps
					setVar $futureDestinations[$nSector[$i]][2] $nWarps[$i]
					
					# Good Port
					if ($nOkToTrade[$i] = 1)
						setVar $futureDestinations[$nSector[$i]][3] 1
						add $futurePortsAdded 1
						setVar $writeStuff $nSector[$i] & " " & CURRENTSECTOR & " " & $nDensity[$i] & " " & $nWarps[$i] 
						write $mooGoodPortsFile $writeStuff
					else
						setVar $futureDestinations[$nSector[$i]][3] 0
					end
				end
			end 
			add $i 1
		end
	end

return


:getPortQuants

	
	if ($PrimaryProduct = 1)
		setVar $prodPerc PORT.PERCENTFUEL[$nSector[$i]]
		setVar $prodAmount PORT.FUEL[$nSector[$i]]
	elseif ($PrimaryProduct = 2)
		setVar $prodPerc PORT.PERCENTORG[$nSector[$i]]
		setVar $prodAmount PORT.ORG[$nSector[$i]]
	elseif ($PrimaryProduct = 3)
		setVar $prodPerc PORT.PERCENTEQUIP[$nSector[$i]]
		setVar $prodAmount PORT.EQUIP[$nSector[$i]]
	end  

return


:removeFuture
	setVar $futureDestinations[$gridSector] 0
return



:getFutureDest
	
	setVar $maxWarps 0
	setVar $maxWarpsSector 0
	setVar $maxWarpsGoodPort 0
	setVar $maxWarpsGoodPortSector 0
	setVar $gridSectorPostTwarp 0

	setVar $i 1
	while ($i <= SECTORS)
		
		if ($futureDestinations[$i] = 1)
			if ($futureDestinations[$i][2] > $maxWarps)
				setVar $maxWarps $futureDestinations[$i][2]
				setVar $maxWarpsSector $i
			end

			if ($futureDestinations[$i][3] = 1)
				if ($futureDestinations[$i][2] > $maxWarpsGoodPort)
					setVar $maxWarpsGoodPort $futureDestinations[$i][2]
					setVar $maxWarpsGoodPortSector $i
				end
			end
		end
		add $i 1
	end
	
	subtract $futureDestsAdded 1

	if ($maxWarpsGoodPortSector > 0)
		subtract $futurePortsAdded 1

		setVar $checkSector $futureDestinations[$maxWarpsGoodPortSector][0]
		getSectorParameter $checkSector "FIGSEC" $hasFig

		setVar $portExists 0
		setVar $checkPortSector $maxWarpsGoodPortSector
		goSub :checkPortExits 
		if ($hasFig = 1) and ($portExists = 1)
			setVar $gridSector $futureDestinations[$maxWarpsGoodPortSector][0]
			setVar $futureDestinations[$maxWarpsGoodPortSector] 0
			setVar $gridSectorPostTwarp $maxWarpsGoodPortSector
			
		else
			setVar $futureDestinations[$maxWarpsGoodPortSector] 0
			if ($futureDestsAdded = 0)
				return
			else
				goSub :getFutureDest
			end
		end
	elseif ($getFuturePortOnly = 0) and ($maxWarpsSector <> 0)
		# check we have a fig at the jump point

		setVar $checkSector $futureDestinations[$maxWarpsSector][0]
		getSectorParameter $checkSector "FIGSEC" $hasFig
		setVar $portExists 0
		setVar $checkPortSector $maxWarpsSector
		goSub :checkPortExits 

		if ($hasFig = 1) and ($portExists = 1)
			setVar $gridSector $futureDestinations[$maxWarpsSector][0]
			setVar $futureDestinations[$maxWarpsSector] 0
			setVar $gridSectorPostTwarp $maxWarpsSector
		else
			setVar $futureDestinations[$maxWarpsSector] 0
			if ($futureDestsAdded = 0)
				return
			else
				goSub :getFutureDest
			end
		end
	end

	
return

:checkPortExits 
	send "cr" $checkPortSector "*q"
	waitfor "Computer activate"
	setTextLineTrigger portexistsy :portexistsy "Commerce report for"
	setTextLineTrigger portexistsno :portexistsno "I have no information about a port in that sector"
	setTextLineTrigger portexistsno2 :portexistsno2 "u have never visted sector"
	pause
	:portexistsy
		setVar $portExists 1

	:portexistsno
	:portexistsno2
		killtrigger portexistsno
		killtrigger portexistsno2
		killtrigger portexistsy
return

:setVoidSectors

	
	# we don't really want to sit outside of SD.

	setVar $explored[$stardock] 1
	setVar $a 1
	while ($a <= SECTOR.WARPCOUNT[$stardock])
		# Avoids warps out of StarDock
		setVar $explored[SECTOR.WARPS[$stardock][$a]] 1
		add $a 1
	end

	setVar $a 1
	while ($a <= 10)
		setVar $explored[$a] 1
		setVar $y 1
		while ($y <= SECTOR.WARPCOUNT[$a])
			# Avoids warps out of Fed (if known)
			setVar $explored[SECTOR.WARPS[$a][$y]] 1
			add $y 1
		end
		add $a 1
	end
	
	

return

:subreport

	setVar $stuff ""
	gosub :calcStats
	setvar $switchboard~message $stuff & "**"
	gosub :switchboard~switchboard
return

:updateStats

	setVar $stuff ""
	gosub :calcStats

	setWindowContents moo $stuff
	add $updateCount 1
	if ($updateCount > 20)
		setVar $updateCount 1
		send "'Moo Update - Planets: " $stat_torps " Turns: " $stat_turnsUsed_formatted " Net Profit: " $stat_dollarsnet_formatted "*"
	end
return

:calcStats

	setVar $stat_dollarsnet ($stat_dollarsgross - $stat_dollarsspent)
	
	setVar $stat_turnsUsed ($startturns - $player~turns)


 	format $stat_dollarsgross $stat_dollarsgross_formatted NUMBER
 	format $stat_dollarsnet $stat_dollarsnet_formatted NUMBER
 	format $stat_turnsUsed $stat_turnsUsed_formatted NUMBER
 	format $stat_dollarsspent $stat_dollarsspent_formatted NUMBER

 	setvar $stuff "Turns Used: " & $stat_turnsUsed_formatted & "*Figs Down: " & $stat_figsdown & "*Ports Traded: " & $stat_trades  & "*Moves Made: " & $stat_moves & "*Gross Cash:" & $stat_dollarsgross_formatted & "*Expense:" & $stat_dollarsspent_formatted & "*Net Cash:" & $stat_dollarsnet_formatted
	setvar $stuff $stuff & "*Refurbs: " & $stat_refurbs & "*Gen Torps: " & $stat_torps & "*Atomics: " & $stat_atomics
return

:checkDanger
	# Density check will be stoped by own figs, so we assume explored is safe for now

	if ($allLimps[$dSector] > 0)
		subtract $nDensity[$dIndex] (2 * $allLimps[$dSector])
		setVar $nAnom[$dIndex] 0
	end

	if ($allArmids[$dSector] > 0)
		subtract $nDensity[$dIndex] (10 * $allArmids[$dSector])
	end	

	if (($nDensity[$dIndex] = 0) or (($nDensity[$dIndex] = 100) and (PORT.EXISTS[$dSector] = 1)))
		setVar $danger 0
		#echo "* ## Sector has safe density: " $dSector
	else
		if (($nDensity[$dIndex] = 5) or ($nDensity[$dIndex] = 105))
			getSectorParameter $dSector "FIGSEC" $hasFig
			if ($hasFig = 1)
				#echo "* ## Sector has 5/105 in fig lsit, so ok: " $dSector
				setVar $danger 0
			else
				#echo "* ## Sector has 5/105 but NOT our ftrs: " $dSector
				setVar $danger 1
				
			end
		else
			if ($dSector < 11)
				setVar $danger 0
				#echo "* ## Fed Safe so OK: " $dSector
			else
				#echo "* ## Odd Density - Avoiding: " $dSector
				setVar $danger 1
			end
		end
	end
	# only verify these if density suggests safe to move
	if ($danger = 0)
		if ($nHaz[$dIndex] = 0)
			if ($nAnom[$dIndex] = 0)
				#echo "* ## Sector has no haz or Anom: " $dSector
				setVar $danger 0
			elseif ($dSector < 11)
				#echo "* ## Sector has Anom but is fed space: " $dSector
				setVar $danger 0
			else
				#echo "* ## Sector has Anom - no limpets for me!: " $dSector
				setVar $danger 1
			end
		else
			#echo "* ## Sector has haz: " $dSector
			setVar $danger 1
		end
	end
	if (($danger = 1) and ($kill <> true))

		#echo "*#####################################################"
		#echo "*# Sector " $nDensity[$dIndex] " shows danger "
		#echo "*#####################################################"
		
		write $dangerousSectorLogFile $dSector & " N:" & CURRENTSECTOR & " D: " & $nDensity[$dIndex] & " A: " & $nAnom[$dIndex]
		setVar $a 1
		while ($a <= SECTOR.WARPCOUNT[CURRENTSECTOR])
			
			if (SECTOR.WARPS[CURRENTSECTOR][$a] = $dSector)
				write $dangerousSectorLogFile $holoData[$a]
			end
			add $a 1
		end
		
	end 
return


:scanSectors
	
	goSub :densityScan

	if ($freshSectorsi > 0)
#echo "*### START FRESH SECTOR Scanning"
		gosub :holoScan
		setVar $di 1
		send "c"
		waitfor "<Computer activated>"
		
		while ($di <= $freshSectorsi)
			#send "f" $freshSectors[$di] "*" CURRENTSECTOR "*"
			send "r" $freshSectors[$di] "*"
			add $di 1
		end
		setVar $di 0
		
		:reporting
		setTextLineTrigger getNextSectorReport :getNextSectorReport "Commerce report for"
		setTextLineTrigger getNextSectorNoReport :getNextSectorNoReport "have no information about a port in that se"
		pause
		:getNextSectorReport
			killAllTriggers
			add $di 1
			setVar $portReported[$freshSectors[$di]] 1
			if ($di >= $freshSectorsi)
				goto :finishReporting
			else
				goto :reporting
			end

		:getNextSectorNoReport
			killAllTriggers
			add $di 1
			setVar $portReported[$freshSectors[$di]] 1
			setVar $portBlocked[$freshSectors[$di]] 1
			if ($di >= $freshSectorsi)
				goto :finishReporting
			else
				goto :reporting
			end
		
		:finishReporting

		send "q"
		waitfor "<Computer deactivated>"	
	end

	#setArray $explored SECTORS
	#setArray $portReported SECTORS
	#setArray $portBlocked SECTORS
	

	setVar $reportsGatheredi 0
	setVar $reportsGathered 0


	setVar $di 1
	
	send "c"
	while ($di <= $deni)
		
		if ($portReported[$nSector[$di]] = 0)
			send "r" $nSector[$di] "*"
			add $reportsGatheredi 1
			setVar $reportsGathered[$di] $nSector[$di]
		end

		add $di 1
	end
	send "q"
	
	if ($reportsGatheredi > 0)
		setVar $di 0
			
		:startReport2
		add $di 1
		setTextLineTrigger getNextSectorReport2 :getNextSectorReport2 "Commerce report for"
		setTextLineTrigger getNextSectorNoReport2 :getNextSectorNoReport2 "have no information about a port in that se"
		pause

		:getNextSectorReport2
			killAllTriggers
			setVar $portReported[$nSector[$di]] 1
			
			if ($di >= $reportsGatheredi)
				goto :endReport2
			else
				goto :startReport2
			end
		:getNextSectorNoReport2
			killAllTriggers
			setVar $portReported[$nSector[$di]] 1
			setVar $portBlocked[$nSector[$di]] 1
			
			if ($di >= $reportsGatheredi)
				goto :endReport2
			else
				goto :startReport2
			end
		:endReport2
		
		waitfor "<Computer deactivated>"
	end
	
	
	
return


#############END NEXT SECTOR STUFF

########################### GRID NEXT SECTOR
:gridNextSector

	if (($gridSector < 11) or ($gridSector = $stardock))
		send "m" $gridSector "**"
		add $stat_moves 1
	else
		
		setVar $PLAYER~moveIntoSector $gridSector
		gosub :PLAYER~moveIntoSector
	end
	if ($secure)
	
		if ($player~ARMIDS >= 3)
			send "h 13*c "
			setVar $allArmids[$gridSector] 3
			setSectorParameter $gridSector "MINESEC" 1
		end

		if ($player~LIMPETS >= 2)
			send "h 22* c "
			setVar $allLimps[$gridSector] 2
			setSectorParameter $gridSector "LIMPSEC" 1
		end
		
	end
	if ($kill = true)
		gosub :sector~getsectordata
		if (($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips)))
			gosub :combat~fastattack
		end
	end
	add $stat_figsdown 1
	add $stat_moves 1
return

:holoScan
if ($kill = true)
	setvar $before_holo_kill_sector $player~current_sector
	gosub :combat~holokill
	if (($sector~holotargetfound = true) and ($player~current_sector <> $before_holo_kill_sector))
		setVar $PLAYER~WARPTO $before_holo_kill_sector
		gosub :PLAYER~twarp
		if (($PLAYER~twarpSuccess = FALSE) and ($player~msg <> "Already in that sector!"))
			setvar $switchboard~message "Could not make it back to starting sector after holokill. - ["&$player~msg&"]*"
		end
	end
	if ($switchboard~message <> "No targets found adjacent.*")
		gosub :switchboard~switchboard
	end
else
	send "sh"
	waitfor "Long Range Scan"
	setVar $hIndex 1
	setVar $hData ""
	:holoSectorStart
		setTextLineTrigger holoScanFirstSector :holoScanFirstSector "Sector  :"
		pause
		:holoScanFirstSector
			killtrigger holoScanFirstSector
			getWord CURRENTLINE $hSector 3
			setVar $hData "     " & CURRENTLINE

		
		:holoScanContinue
		setTextLineTrigger holoScanDetails :holoScanDetails ""
		pause
		:holoScanDetails

			killtrigger holoScanDetails
			getWord CURRENTLINE $firstword 1
			if ($firstword = "Warps")
				return
			elseif ($firstword = "Sector")
				setVar $holoData[$hIndex] $hData
				add $hIndex 1
				setVar $hData "     " & CURRENTLINE
				goto :holoScanContinue
			else
				setVar $hData "     " & $hData & "*" & CURRENTLINE
				goto :holoScanContinue
			end

end
return




:densityScan
	send "sd"
	waitfor "Relative Density Scan"

	setVar $deni 0
	setVar $nDensity 0
	setVar $nSector 0
	setVar $nWarps 0
	setVar $nHaz 0
	setVar $nAnom 0

	setVar $freshSectors 0
	setVar $freshSectorsi 0
	
	

	:densityScanning
		setTextLineTrigger densityScanLine :densityScanLine "Sector"
		setTextTrigger densityScanEnd :densityScanEnd "Help)?"
		pause
	
		:densityScanLine
	
			KillTrigger densityScanLine
			KillTrigger densityScanEnd
			
			getWord CURRENTLINE $scanSector 2
			if ($scanSector = "(")
				getWord CURRENTLINE $scanSector 3
				getWord CURRENTLINE $secDensity 5
				getWord CURRENTLINE $secWarps 8
				getWord CURRENTLINE $nHaz 11
				getWord CURRENTLINE $scanAnom 14
			else
				getWord CURRENTLINE $secDensity 4
				getWord CURRENTLINE $secWarps 7
				getWord CURRENTLINE $nHaz 10
				getWord CURRENTLINE $scanAnom 13
			end
			
			stripText $nHaz "%"
			
			getLength $scanSector $len

			stripText $scanSector ")"
			stripText $scanSector "("
			getLength $scanSector $len2
			if ($len2 < $len)
				add $freshSectorsi 1
				setVar $freshSectors[$freshSectorsi] $scanSector			
			end
			stripText $secDensity ","

			add $deni 1
			setVar $nDensity[$deni] $secDensity
			setVar $nSector[$deni] $scanSector
			setVar $nWarps[$deni] $secWarps
			setVar $nHaz[$deni] $nHaz
			setVar $nAnom[$deni] 0
			if ($scanAnom = "Yes")
				setVar $anomoly[$scanSector] 1
				setVar $nAnom[$deni] 1
			end
	
			goto :densityScanning
			
		:densityScanEnd
			KillTrigger densityScanLine
			KillTrigger densityScanEnd
	return



halt

:checkSafeToBlow
	
	send "lq*"


	:checkSafeToBlowStart
		setTextLineTrigger checkSafeToBlowNoPlanet :checkSafeToBlowNoPlanet "There isn't a planet in this sector."
		setTextLineTrigger checkSafeToBlowCit1 :checkSafeToBlowCit1 "Level 1"
		setTextLineTrigger checkSafeToBlowCit2 :checkSafeToBlowCit2 "Level 2"
		setTextLineTrigger checkSafeToBlowCit3 :checkSafeToBlowCit3 "Level 3"
		setTextLineTrigger checkSafeToBlowCit4 :checkSafeToBlowCit4 "Level 4"
		setTextLineTrigger checkSafeToBlowCit5 :checkSafeToBlowCit5 "Level 5"
		setTextLineTrigger checkSafeToBlowCit6 :checkSafeToBlowCit6 "Level 6"
		setTextLineTrigger checkSafeToBlowCit7 :checkSafeToBlowCit7 "<<<< SHIELDED PLANET >>>>"
		setTextTrigger checkSafeToBlowFinish :checkSafeToBlowFinish "Land on which planet"
		pause

		:checkSafeToBlowCit1
		:checkSafeToBlowCit2
		:checkSafeToBlowCit3
		:checkSafeToBlowCit4
		:checkSafeToBlowCit5
		:checkSafeToBlowCit6
		
			killalltriggers
			setVar $safeToBlow 0
			setVar $noPlanetsInSector 0
			return
		:checkSafeToBlowCit7
			killalltriggers
			setVar $safeToBlow 0
			return
		:checkSafeToBlowFinish
			setVar $noPlanetsInSector 0
		:checkSafeToBlowNoPlanet
			killalltriggers
			return
	waitfor "Command ["


return

:createAndSell


	goSub :resetPlanetsUsed

	setVar $planet~planetsInSector 0
	setVar $planet~planets 0
	setVar $planet~planetNames 0
	setVar $planet~planeti 1
	
	setVar $safeToBlow 1
	setVar $noPlanetsInSector 1
	gosub :checkSafeToBlow
	if ($safeToBlow = 0)
		echo "*#########################################"
		echo "* ### CITADELS DETECTED SKIPPING BOOMS ###"
		echo "*#########################################"
		setVar $SWITCHBOARD~message "Warning: Citadel in sector, skipping.*"
		gosub :SWITCHBOARD~switchboard
		return
	end

	setVar $checkNewPlanet 0
	
	if ($noPlanetsInSector = 0)
		goSub :reCheckPlanets
		goSub :checkPlanetNames
	end
	

	setVar $go 1
	setVar $planet~planetsInSectorCHK $planet~planetsInSector

	while ($go = 1)

# ENSURE PREFERRED SLOT IS FREE 
		
		if ($planet~planetsInSectorCHK >= $preferredPlanetSlot)

			setVar $checkNewPlanet 0
			goSub :reCheckPlanets
			setVar $removePlanetName $planet~planetNames[$preferredPlanetSlot]
			goSub :removePlanet
			setVar $shipBlastPlanet $planet~planets[$preferredPlanetSlot]
			gosub :blastPlanet
			setVar $checkNewPlanet 0
			goSub :reCheckPlanets
			setVar $planet~planetsInSectorCHK $planet~planetsInSector
		end
		
# CREATE A PLANET
		setVar $getPlanetSettingsReq 0
		setVar $goodPlanet 0
		goSub :makeAPlanet
		
		if ($getPlanetSettingsReq > 0)
			setVar $checkNewPlanet 1
			goSub :reCheckPlanets
			setVar $checkNewPlanet 0
			setVar $checkPlanet $newPlanetMade
			goSub :updateMooPlanet
			if ($goodPlanet = 1)
				# We know planet number from re-checking planets to test it
				setVar $tradePlanet $newPlanetMade
			end
		end

		# FIRE SPECIFIC Stuff
		if ($doFirePlanet > 0)
			setVar $doFirePlanet 0
			if ($getPlanetSettingsReq = 0)
				setVar $checkNewPlanet 1
				goSub :reCheckPlanets
				setVar $checkNewPlanet 0
			end
			send "u y n " $newPlanetName "* z p * * "
			send "u y n " $newPlanetName "* z p * * "
			send "u y n " $newPlanetName "* z p * * "
			send "u y n " $newPlanetName "* z p * * "
			send "u y n " $newPlanetName "* z p * * "

			send "l" $newPlanetMade "*oc"
			send "^q"
			waitfor "ENDINTERROG"
			setVar $BOT~command "pimp"
            setVar $BOT~user_command_line #34& "m185380721" &#34& " f "
            setVar $BOT~parm1 "m185380721"
            setVar $BOT~parm2 "f"
            saveVar $BOT~parm1
            saveVar $BOT~parm2
            saveVar $BOT~command
            saveVar $BOT~user_command_line
            load "scripts\"&$bot~mombot_directory&"\modes\resource\pimp.cts"
            setEventTrigger		firstPimpEnd		:firstPimpEnd "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\pimp.cts"
            pause
            :firstPimpEnd
            killalltriggers
				send "^q"
				waitfor "ENDINTERROG"
				send "cy"
				goSub :smallDelay
				send "cuy"
				goSub :smallDelay
				send "uy"
				goSub :smallDelay
				send "uy"
				goSub :smallDelay
			setVar $BOT~command "pimp"
            setVar $BOT~user_command_line #34& "m185380721" &#34& " f "
            setVar $BOT~parm1 "m185380721"
            setVar $BOT~parm2 "f"
            saveVar $BOT~parm1
            saveVar $BOT~parm2
            saveVar $BOT~command
            saveVar $BOT~user_command_line
            load "scripts\"&$bot~mombot_directory&"\modes\resource\pimp.cts"
            setEventTrigger		secondPimpEnd		:secondPimpEnd "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\pimp.cts"
            pause
            :secondPimpEnd
           	 killalltriggers
				send "^q"
				waitfor "ENDINTERROG"
			send "q q "
			goSub :smallDelay
			goSub :player~quikstats
			setVar $checkNewPlanet 0
			goSub :reCheckPlanets
			setVar $planet~planetsInSectorCHK $planet~planetsInSector
		end
# DID WE MAKE A GOOD ONE?

		if ($goodPlanet = 1)

			# if we just checked the new planet then we can skip this
			if ($getPlanetSettingsReq = 0)
				setVar $checkNewPlanet 0
				setVar $newPlanetMade 0
				setVar $tradePlanet $newPlanetName
			end
# PLANET TRADE		

			setVar $tradeOre 0
			setVar $tradeOrg 0
			setVar $tradeEquip 0
			gosub :planetTrade

			
			:sellDonePort
			send "cr*q"
			waitfor "<Computer deactivated>"
			if ($PrimaryProduct = 1)
				setVar $prodPerc PORT.PERCENTFUEL[CURRENTSECTOR]
			elseif ($PrimaryProduct = 2)
				setVar $prodPerc PORT.PERCENTORG[CURRENTSECTOR]
			elseif ($PrimaryProduct = 3)
				setVar $prodPerc PORT.PERCENTEQUIP[CURRENTSECTOR]
			end
			if ($prodPerc < $tradingMinProduct)
				setVar $go 0
			end
		

		end
				

	end
	

	# if we are above the 90% planets then auto cleanup
	if ($tradePlanet > $planet~planetSALLOWED)
		setVar $cleanup 2
	else
		setVar $cleanup $userCleanup
	end

	if ($cleanup > 0)

		if ($planet~planetsInSector = 0)
			setVar $checkNewPlanet 0
			goSub :reCheckPlanets
		end
		setVar $planet~planetsToBlow 0
		setVar $figsRequired 0
		setVar $i 1
		while ($i <= $planet~planetsInSector)
			
				
			if ($planet~planets[$i] <> $tradePlanet)
				add $planet~planetsToBlow 1
				add $figsRequired (100 * $planet~planetsToBlow)
			elseif ($cleanup = 2)
				add $planet~planetsToBlow 1
				add $figsRequired ($figsRequired * $planet~planetsToBlow)
			end 
			
			
			add $i 1
		end
		# little safety margin
		add $figsRequired ($figsRequired + 101)
		if ($figsRequired > $player~FIGHTERS)
				
			echo "*#########################################"
			echo "* ### Not enough figs For Clean up, theoritically you could go boom! ###"
			echo "*#########################################"
			setVar $SWITCHBOARD~message "Warning: Fighters low, can not do cleanup.*"
			gosub :SWITCHBOARD~switchboard
			halt

		end
		echo "planet~planetsInSector " $planet~planetsInSector "*"

		setVar $i 1
		while ($i <= $planet~planetsInSector)
			
				
			if ($planet~planets[$i] <> $tradePlanet)
				
				setVar $shipBlastPlanet $planet~planets[$i]
				gosub :blastPlanet
			elseif ($cleanup = 2)
				setVar $shipBlastPlanet $tradePlanet
				gosub :blastPlanet
			end 
			
			
			add $i 1
		end
	end
	
	
return


:updateMooPlanet
	
	send "l" $checkPlanet "*"
	gosub :PLANET~getPlanetInfo
	send "q"
	setVar $MooThePlanet 0



	setVar $planet~planetList[$planet~planetIndexFound][1] 1
	setVar $planet~planetList[$planet~planetIndexFound][2] $planet~planet_FUEL
	setVar $planet~planetList[$planet~planetIndexFound][3] $planet~planet_ORGANICS
	setVar $planet~planetList[$planet~planetIndexFound][4] $planet~planet_EQUIPMENT

	if (($planet~planet_FUEL >= $FUEL_MIN_MOO) and ($MOO_FUEL = 1))
		setVar $MooThePlanet 1
	end
	if (($planet~planet_ORGANICS >= $ORGANICS_MIN_MOO) and ($MOO_ORGANICS = 1))
		setVar $MooThePlanet 1
	end
	if (($planet~planet_EQUIPMENT >= $EQUIPMENT_MIN_MOO) and ($MOO_EQUIPMENT = 1))
		setVar $MooThePlanet 1
	end
	setVar $planet~planetList[$planet~planetIndexFound][5] $MooThePlanet
	
	if ($MooThePlanet = 1)
		goSub :checkGoodPlanet
	end
	goSub :rewriteMooSettings
	

return

:checkGoodPlanet
	

	if (($planet~planetList[$planet~planetIndexFound][2] > $FUEL_MIN_MOO) and ($MOO_FUEL = 1))
		if ((PORT.BUYFUEL[CURRENTSECTOR] = 1) and (PORT.PERCENTFUEL[CURRENTSECTOR] >= $tradingMinProduct))
			setVar $goodPlanet 1
		end
	end
	if (($planet~planetList[$planet~planetIndexFound][3] > $ORGANICS_MIN_MOO) and ($MOO_ORGANICS = 1))
		if ((PORT.BUYORG[CURRENTSECTOR] = 1) and (PORT.PERCENTORG[CURRENTSECTOR] >= $tradingMinProduct))
			setVar $goodPlanet 1
		end
	end
	if (($planet~planetList[$planet~planetIndexFound][4] > $EQUIPMENT_MIN_MOO) and ($MOO_EQUIPMENT = 1))
		if ((PORT.BUYEQUIP[CURRENTSECTOR] = 1) and (PORT.PERCENTEQUIP[CURRENTSECTOR] >= $tradingMinProduct))
			setVar $goodPlanet 1
		end
	end
return


:makeAPlanet
	goSub :getPlanetName

	if ($player~GENESIS = 0)
		goto :buildPlanet1
	end
	:updatePlanetsFinishWait
	setVar $goodPlanet 0
	if ($planet~planetsInSectorCHK >= $GAME~MAX_PLANETS_PER_SECTOR)
		send "u y n " $newPlanetName "* z p * "
	else
		send "u y " $newPlanetName "* z p * "
	end
	:buildPlanet
	setTextLineTrigger buildPlanet1 :buildPlanet1 "You don't have any Genesis Torpedoes to launch!"
	setTextLineTrigger buildPlanet2 :buildPlanet2 "For building this planet you receive"
	pause
	:buildPlanet1
		killAllTriggers
		#send "*"
		gosub :restock
		goto :updatePlanetsFinishWait
		
	:buildPlanet2
		killAllTriggers
		subTract $player~GENESIS 1
		add $stat_torps 1
		add $planet~planetsInSectorCHK 1
	
		
		setVar $planet~planetIndexFound 0
		setVar $t 1
		while ($t <= $totalGamePlanets)
			setTextLineTrigger $t :MakePlanetLbl & $t $planet~planetList[$t]
			add $t 1
		end
		pause
		:MakePlanetLbl1
			setVar $planet~planetIndexFound 1
			goto :endMakePlanetLbls
		:MakePlanetLbl2
			setVar $planet~planetIndexFound 2
			goto :endMakePlanetLbls
		:MakePlanetLbl3
			setVar $planet~planetIndexFound 3
			goto :endMakePlanetLbls
		:MakePlanetLbl4
			setVar $planet~planetIndexFound 4
			goto :endMakePlanetLbls
		:MakePlanetLbl5
			setVar $planet~planetIndexFound 5
			goto :endMakePlanetLbls
		:MakePlanetLbl6
			setVar $planet~planetIndexFound 6
			goto :endMakePlanetLbls
		:MakePlanetLbl7
			setVar $planet~planetIndexFound 7
			goto :endMakePlanetLbls
		:MakePlanetLbl8
			setVar $planet~planetIndexFound 8
			goto :endMakePlanetLbls
		:MakePlanetLbl9
			setVar $planet~planetIndexFound 9
			goto :endMakePlanetLbls
		:MakePlanetLbl10
			setVar $planet~planetIndexFound 10
			goto :endMakePlanetLbls
		:MakePlanetLbl11
			setVar $planet~planetIndexFound 11
			goto :endMakePlanetLbls
		:MakePlanetLbl12
			setVar $planet~planetIndexFound 12
			goto :endMakePlanetLbls
		:MakePlanetLbl13
			setVar $planet~planetIndexFound 13
			goto :endMakePlanetLbls
		:MakePlanetLbl14
			setVar $planet~planetIndexFound 14
			goto :endMakePlanetLbls
		:MakePlanetLbl15
			setVar $planet~planetIndexFound 15
			goto :endMakePlanetLbls
		:MakePlanetLbl16
			setVar $planet~planetIndexFound 16
			goto :endMakePlanetLbls
		:MakePlanetLbl17
			setVar $planet~planetIndexFound 17
			goto :endMakePlanetLbls
		:MakePlanetLbl18
			setVar $planet~planetIndexFound 18
			goto :endMakePlanetLbls
		:MakePlanetLbl19
			setVar $planet~planetIndexFound 19
			goto :endMakePlanetLbls
		:MakePlanetLbl20
			setVar $planet~planetIndexFound 20
			goto :endMakePlanetLbls

		:endMakePlanetLbls

		if ($planet~planetList[$planet~planetIndexFound][1] = 0)
			setVar $getPlanetSettingsReq $planet~planetIndexFound
		else
			if ($planet~planetList[$planet~planetIndexFound][5] = 1)
				goSub :checkGoodPlanet
			end

		end
		if ($fireplanet = 1) and ($player~credits > 4000000)
			getWordPos $planet~planetList[$planet~planetIndexFound] $pos "Dead Earth"
			if ($pos > 0)
				goSub :fireCheckLevel4Needed
				if ($levelNeeded = 1)

					add $doFirePlanet 1
					setVar $fireplanet 0
				else
					setVar $fireplanet 0
				end
			end
		end

			
return


:blastPlanet

:blastblastblast
send "l " $shipBlastPlanet "* z d y * "

:blowPlanet
	setTextLineTrigger blowPlanet1 :blowPlanet1 "You do not have any Atomic Detonators!"
	setTextLineTrigger blowPlanet2 :blowPlanet2 "For blowing up this planet you receive"
	setTextLineTrigger blowPlanet3 :blowPlanet3 "Invalid registry number, landing aborted."
	pause
	:blowPlanet3
		killAllTriggers
		
			
		echo "**############################################"
		echo "*############################################"
		echo "*#####  BLAST PLANET NOT FOUND - BUG BUG ####"
		echo "*###### LET HAMMER KNOW - GENTLY!       #####"
		echo "*############################################"
		echo "*############################################"

		setDelayTrigger delay :blastFail 5000
		pause
		:blastFail
			return

	:blowPlanet1
		killAllTriggers
		send "q"
		waitfor "Blasting off from"
		waitfor "(?=Help)?"
		goSub :player~quikstats

		goSub :restock

		
		goto :blastblastblast
	:blowPlanet2
		killAllTriggers
		setVar $goodPlanet 0
		waitfor "(?=Help)?"
		add $stat_atomics 1

	setVar $goodPlanet 0

return

:reCheckPlanets

	if ($checkNewPlanet = 1)

		setVar $prevPlanetsInSector 0
		setVar $prevPlanets 0
		setVar $prevPlaneti 1
		while ($prevPlaneti <= $planet~planetsInSector)
			
			setVar $prevPlanets[$prevPlaneti] $planet~planets[$prevPlaneti]
			add $prevPlanetsInSector 1
			add $prevPlaneti 1
		end
	end
	
	setVar $planet~planetsInSector 0
	setVar $planet~planets 0
	setVar $planet~planeti 1
	send "l*"
	setVar $startLogging 0
	:reCheckPlanetsT
	setTextLineTrigger reCheckPlanetsT1 :reCheckPlanetsT1 "There isn't a planet in this sector."
	setTextLineTrigger reCheckPlanetsstart :reCheckPlanetsstart "------------------------------------------------------------------------------"
	setTextLineTrigger reCheckPlanetsT2 :reCheckPlanetsT2 "<"
	setTextTrigger reCheckPlanetsT3 :reCheckPlanetsT3 "Land on which planet"
	pause
	:reCheckPlanetsstart
		killAllTriggers
		setVar $startLogging 1
		goto :reCheckPlanetsT
	:reCheckPlanetsT1
		killAllTriggers

		waitfor "Command ["
		return
	:reCheckPlanetsT2
		killAllTriggers 
		if ($startLogging = 1)
			
			
			getWord CURRENTLINE $cPlanetNum 1
			if ($cPlanetNum = "Land")
				goto :reCheckPlanetsT3
			elseif ($cPlanetNum = "<")
				getWord CURRENTLINE $cPlanetNum 2
				stripText $cPlanetNum ">"
			else
				stripText $cPlanetNum ">"
				stripText $cPlanetNum "<"
			end
			cutText CURRENTLINE $planetname 11 37

			trim $planetname
			if ($planetname = $newPlanetName)
				setVar $newPlanetMade $cPlanetNum
			end
			add $planet~planetsInSector 1
			setVar $planet~planets[$planet~planeti] $cPlanetNum
			setVar $planet~planetNames[$planet~planeti] $planetname

			add $planet~planeti 1
		end
		goto :reCheckPlanetsT

	:reCheckPlanetsT3
		killAllTriggers
		waitfor "Command ["

	if ($checkNewPlanet = 11)
		setVar $planet~planeti 1
		while ($planet~planeti <= $planet~planetsInSector)
			setVar $searchPlanet $planet~planets[$planet~planeti]
			setVar $searchi 1
			setVar $found 0

			while ($searchi <= $prevPlanetsInSector)
				if ($prevPlanets[$searchi] = $searchPlanet)
					setVar $found 1
				end
				add $searchi 1
			end
			if ($found = 0)
				setVar $newPlanetMade $searchPlanet
			end
			add $planet~planeti 1
		end
	end

return

:gotoDock
	send "y1*q"
	send "m" $stardock "*y"
	waitfor "All Systems Ready, shall we engage?"
	send "y"
	waitfor "TransWarp Drive Engaged!"
	send "ps"
	gosub :limpetCheck

return

:limpetCheck
		setTextTrigger limpetchecky :limpetchecky "A port official runs"
		setTextTrigger limpetcheckn :limpetcheckn "StarDock> Where to?"
		pause
		:limpetchecky
			killalltriggers
			send "y"
			return
		:limpetcheckn
			killalltriggers
			return

return


:planetTrade
	
	
	gosub :player~quikstats
	setVar $precredits $player~credits
	stripText $precredits ","

	if ($useEp = TRUE)
		goSub :planetTrade_ep
	else
		goSub :planetTrade_ck
	end

	gosub :player~quikstats
	stripText $player~credits ","
	setVar $player~creditsNow $player~credits

	subtract $player~creditsNow $precredits
	add $stat_dollarsgross $player~creditsNow
	
	if (($player~ore_holds < $minOre) and (PORT.BUYFUEL[CURRENTSECTOR] = 0))
		send "pt * * * "
		waitfor "credits and"
	end


return

:planetTrade_ck
	setVar $planet~fueltosell 67000
	setVar $planet~orgtosell 67000
	setVar $planet~equiptosell 67000
	setVar $planet~_ck_ptradesetting $GAME~ptradesetting
	setVar $planet~planet $tradePlanet
	setVar $planet~quantityUnknown 1

	if ($player~ore_holds < $minOre)
		isNumber $number $tradePlanet
		if ($number = 0)
			goSub :reCheckPlanets
			setVar $tradePlanet $newPlanetMade
		end
		send "l" $tradePlanet "* t n t1* * q * "
		waitfor "Planet command ("
		waitfor "Command ["
	end

	send "|"
	goSub :planet~sell
	send "|"

	setVar $tradePlanet $planet~planet 

	if ($planet~exit_message <> 0)
		#send "'" $planet~exit_message "*"
	end
	gosub :player~quikstats
	stripText $player~credits ","
	setVar $player~creditsNow $player~credits
	if ($player~creditsNow = $precredits)
		echo "*################*##############"
		echo "*#### NEG FAILED, SELLING AT COST!"
		echo "*###############################"

	
		send "q q q * * *  p n" $tradePlanet "* * * * * * * ^q"
		waitfor "ENDINTERROG"
		gosub :player~quikstats
		stripText $player~credits ","
		setVar $player~creditsNow $player~credits
	end
return


:planetTrade_ep


	if ($player~ore_holds < $minOre)
		send "l" $tradePlanet "*"
		send "tnt1*"
		waitfor "free cargo holds."
		send "d"
		Waitfor "-------  ---------  ---------  ---------  ---------  ---------  ---------"
		send "q"
	end


	send "pn" $tradePlanet "*"
	waitfor "Negotiate Planetary TradeAgreement"
	:startplanetTrade_ep
	setTextLineTrigger weAreBuying :weAreBuying "We are buying up to "
	setTextTrigger weAreDone :weAreDone "(?=Help)?"
	pause
	:weAreBuying
		killalltriggers
		send "*"
		waitfor "Agreed, "
		setTextLineTrigger sellempty2 :sellempty2 "You have"
		setDelayTrigger epsellwait2 :epsellwait2 7000
		pause
		:epsellwait2
			killalltriggers
			
			setvar $switchboard~message "Ep Haggle timed out on Haggle*"
			gosub :switchboard~switchboard
			send "*"
		
		:sellempty2
			killalltriggers
		goto :startplanetTrade_ep
	
	:weAreDone
		killalltriggers
		
	gosub :player~quikstats
	stripText $player~credits ","
	setVar $player~creditsNow $player~credits
	if ($player~creditsNow = $precredits)
		echo "*################*##############"
		echo "*#### NEG FAILED, SELLING AT COST!"
		echo "*###############################"

		send "p n" $tradePlanet "* * * * * * * "
		waitfor "Your offer "
		gosub :player~quikstats
		stripText $player~credits ","
		setVar $player~creditsNow $player~credits
	end
	

return



:process_planet_line
        getWord $planet~planetInf $planet~planet_CHECKED 1
        getWord $planet~planetInf $planet~planet_START_FUEL 2
        getWord $planet~planetInf $planet~planet_START_ORG 3
        getWord $planet~planetInf $planet~planet_START_EQUIP 4
        getWord $planet~planetInf $planet~planet_TRADE_PLANET 5
	getLength $planet~planet_CHECKED $length1
	getLength $planet~planet_START_FUEL $length2
	getLength $planet~planet_START_ORG $length3
	getLength $planet~planet_START_EQUIP $length4
	getLength $planet~planet_TRADE_PLANET $length5
	setVar $startlen ($length1 + $length2 + $length3 + $length4 + $length5 + 6)
	cutText $planet~planetInf $planet~planetname $startlen 999
return

:rewriteMooSettings
	
	delete $moo_setting_file
	setVar $pcount 1
	while ($pcount <= $totalGamePlanets)
		
		write $moo_setting_file $planet~planetList[$pcount][1] & " " & $planet~planetList[$pcount][2] & " " & $planet~planetList[$pcount][3] & " "  & $planet~planetList[$pcount][4] & " " & $planet~planetList[$pcount][5] & " " & $planet~planetList[$pcount]
		add $pcount 1
	end
	
return


:setUpIce
	
	send "i"
	waitfor "Ship Name      :"
	setTextLineTrigger icegs :icegs "Merchant Trader Ported"
	setTextLineTrigger icess :icess "Merchant Trader Ported"
	pause
		:icess
		setVar $SWITCHBOARD~message "For ICE Explore you need to start in a Merch Trader.*"
		gosub :SWITCHBOARD~switchboard
		halt
		:icegs
		killalltriggers
		
	# ship is good
	# Swap out second variable from SLOT to MOO ship num
	setVar $iceShipMoo $preferredPlanetSlot
	setVar $iceShipExplore $player~SHIP_NUMBER
	
	send "xq"
	waitfor "--------------------"
	setVar $foundShip 0
	:shipScan
	setTextLineTrigger shipCorp :shipCorp "Corp "
	setTextLineTrigger shipEnd :shipEnd "<I> Ship details"
	pause
	:shipCorp
		killAllTriggers
		getWord CURRENTLINE $tnum 1
		if ($tnum = $iceShipMoo)
			setVar $foundShip 1
			#   5  3385 POP2            Corp      500       0    0  Colonial Transwarp
			cuttext CURRENTLINE $shipType 56 18
			
			if ($shipType <> "Colonial Transwarp")
				setVar $SWITCHBOARD~message "Moo ships need to be Colonial Transwarp.*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		end
		goto :shipScan
	:shipEnd
		killAllTriggers
	if ($foundShip = 0)
	
		setVar $SWITCHBOARD~message "For ICE mode you must specify MOOEXP [TURNS] [MOOSHIP] .*"
		gosub :SWITCHBOARD~switchboard
		halt

	end
	setVar $preferredPlanetSlot 99

return

:fireUpgrade

	gosub :player~quikstats

	if ($player~CREDITS < 12000000)
		setVar $SWITCHBOARD~message "We need 12 million dollars to upgrade safely to hells Starship*"
		gosub :SWITCHBOARD~switchboard
		return
	end
	setVar $originSector CURRENTSECTOR
	setVar $returnSector CURRENTSECTOR
	if (PORT.BUYFUEL[CURRENTSECTOR] = 0)
		# we acn buy fuel and move from here.
		setVar $foundSafeSector CURRENTSECTOR
	else
		getNearestWarps $nearArray CURRENTSECTOR
		setVar $i 1
		while ($i <= $nearArray)
			setVar $focus $nearArray[$i]
			getSectorParameter $focus "FIGSEC" $isFigged
			getSectorParameter $focus "LIMPSEC" $isLimp
			if ($isFigged = TRUE) and ($isLimp = TRUE) and (PORT.BUYFUEL[$focus] = 0)
				setVar $returnSector $focus
				setVar $foundSafeSector $focus
				setVar $player~warpto $focus
				gosub :player~twarp
				add $stat_moves 1
				gosub :player~quikstats
				goto :foundSec
			end
			add $i 1
		end
	end

	:foundSec
	if ($foundSafeSector = 0)
		setVar $SWITCHBOARD~message "Could not find a safe sector upgrade ship.. skipping*"
		gosub :SWITCHBOARD~switchboard
		return
	end

	send "p t * * "

	send "nq"
	setTextLineTrigger stargateCheck2 :stargateCheck2 "Class 9 (Special) (StarDock)"
	setDelayTrigger nostargateCheck2 :nostargateCheck2 3000
	pause
	:nostargateCheck2
		killalltriggers
		setVar $SWITCHBOARD~message "Stardock is gone!! Halting..*"
		gosub :SWITCHBOARD~switchboard
		halt
	:stargateCheck2
		killalltriggers
	send "m" $stardock "*y"
	waitfor "Locating beam pinpointed, TransWarp"
	send "y  p   sh"


	if ($player~TWARP_TYPE = 1)
		send "wu"
	end
	if ($player~GENESIS = 0)
		send "t1*"
	end

	send "qs"

	# MAKE SURE WE ARE closish, at a secure port - surrounded by limpets, 6+ hops out, at a SXX port - max ore before hand
	setVar $newShipNum 0
	setVar $currentShipNum $player~SHIP_NUMBER

	# macro to buy hellship from <shipyards> prompt - "bnyjychellyeah*n*"
	# scan for ship num and rename
	send "bnyjychellyeah*n*"
	waitfor "Do you want to set a password"
	waitfor "<Shipyards>"
	send "sq"
	waitfor "vailable Ships in Orbit"
	setTextLineTrigger getHellsNum :getHellsNum "hellyeah"
	pause
		:getHellsNum
		getWord CURRENTLINE $newShipNum 1
		killalltriggers

	# switch ships
	send "q q x* " $newShipNum  "* q p s s "
	waitfor "Landing on Federation StarDock"
	gosub :player~quikstats
	if ($player~SHIP_NUMBER <> $newShipNum)
		setVar $SWITCHBOARD~message "Switch ship failed on FIRE Upgrade .*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	# rename ship
	send "ryHells Yeah " $newShipNum "*y"
	waitfor "is what you want?"

	# Upgrade the ship
	send "pa5*yb100*c1000000*qqhrhfyw2c200000*qs"
	waitfor "You leave the shipyards."
	waitfor "You walk past row after row o"

	# switch back
	send "q q x* " $currentShipNum "* q p s s "
	waitfor "Landing on Federation StarDock"

	# tow and dock
	send "q q w n " $newShipNum "* p s h "
	waitfor "Landing on Federation StarDock"


	send "qqq    *   m  " $returnSector  "*   y   y  "
	
	setTextLineTrigger restockBack3 :restockBack3 "<Set NavPoint>"
	setTextLineTrigger restockBack4 :restockBack4  "Systems Ready, shall we engag"
	pause
		:restockBack3
			killalltriggers
			send "q * q * * pss"
			setVar $SWITCHBOARD~message "Failed to leave dock!! Hopefully on dock..*"
			gosub :SWITCHBOARD~switchboard
			halt	
		:restockBack4
			killalltriggers

	gosub :player~quikstats

	if ($player~FIGHTERS > 49999)
		send "uyn.*p * "
	end
	send "f" $player~fighters "*cd"
	if ($player~ARMIDS > 0)
		send "h1" $player~ARMIDS "*c"
	end

	if ($player~LIMPETS > 0)
		send "h2" $player~LIMPETS "*c"
	end
	send "^q"
	waitfor "ENDINTERROG"

	send "x " $newShipNum "* q * "
	send "f1*cd^q"

	if ($player~ARMIDS > 0)	
		send "h13*c"
	end

	if ($player~LIMPETS > 0)
		send "h23*c"
	end
	waitfor "ENDINTERROG"

	send "p t * * "
	
	gosub :player~quikstats
	if ($originSector <> $returnSector)
		setVar $player~warpto $originSector
		gosub :player~twarp
		add $stat_moves 1
		gosub :player~quikstats
	end
	# back to it
	setVar $doFireUpgrade 0

return	

:checkPlanetNames
		# get current planets in sector array and mark any off
	setVar $planet~planeti 1
	while ($planet~planeti <= $planet~planetsInSector)
		setVar $searchName $planet~planetNames[$planet~planeti]
		setVar $searchi 1
		setVar $found 0

		while ($searchi <= 20)
			if ($neg_planetNames[$searchi] = $searchName)
				setVar $found 1
			end
			add $searchi 1
		end
		if ($found = 1)
			setVar $neg_planetNamesTaken[$planet~planeti] 1
		end
		add $planet~planeti 1
	end
return


:removePlanet
	setVar $pii 1
	while ($pii <= 20)
		if ($neg_planetNames[$pii] = $removePlanetName)
			setVar $neg_planetNamesTaken[$pii] 0
		end
		add $pii 1
	end
return

:getPlanetName

	setVar $pii 1
	while ($pii <= 20)
		if ($neg_planetNamesTaken[$pii] = 0)
			setVar $newPlanetName $neg_planetNames[$pii]
			setVar $neg_planetNamesTaken[$pii] 1
			return 
		end
		add $pii 1
	end

	ECHO "ISSUE SHOULD NOT GET HERE - all 20 names taken*"
	halt
return

:resetPlanetsUsed
	setVar $newPlanetName ""
	setVar $pii 1
	while ($pii <= 20)
		setVar $neg_planetNamesTaken[$pii] 0
		add $pii 1
	end
return

:smallDelay
echo "STARTING SMALL DELAY*"
	setDelayTrigger delay :wait 2000
	pause
		:wait
		killalltriggers
return

:fireCheckLevel4Needed

	setVar $levelNeeded 0
	setVar $level4Count 0

	send "tlq"
	waitfor "Corporate Planet Scan"
	setTextLineTrigger nocorpplanets :nocorpplanets "No Planets claimed"
	setTextLineTrigger level4ready :level4ready "Dead Earth           Level 4"
	setTextLineTrigger scancorpplanetsdone :scancorpplanetsdone "Corporate command ["
	pause
	:level4ready
	
		add $level4Count 1
		setTextLineTrigger level4ready :level4ready "Dead Earth           Level 4"
		pause

	:nocorpplanets
		killalltriggers
		setVar $levelNeeded 1
		return
	:scancorpplanetsdone
		killalltriggers
		if ($level4Count < 3)
			setVar $levelNeeded 1
		end
return
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\loadplanetinfo\planet"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\moveintosector\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\planet\planetneg\planet"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\combat\holokill\combat"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\combat\fastattack\combat"


