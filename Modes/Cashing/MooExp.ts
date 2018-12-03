gosub :BOT~loadVars

loadVar $game~port_max
loadVar $game~ptradesetting
loadVar $game~MAX_PLANETS_IN_GAME
loadVar $bot~Folder

# ORE

setVar $BOT~help[1]  $BOT~tab&"       Explores the universe looking for Moo Ports "
setVar $BOT~help[2]  $BOT~tab&"       "
setVar $BOT~help[3]  $BOT~tab&" mooexp [turnsstop] [maxplanets] {primary} {bad/all} "
setVar $BOT~help[4]  $BOT~tab&"                      "
setVar $BOT~help[5]  $BOT~tab&" Options:"
setVar $BOT~help[6]  $BOT~tab&"    [turnsstop]  STOP when you get to this few turns"
setVar $BOT~help[7]  $BOT~tab&"    [maxplanets] Max planets b4 blasting and replacing."
setVar $BOT~help[8]  $BOT~tab&"	   {f/o/e}      Highest value product available defaults"
setVar $BOT~help[9]  $BOT~tab&"                to equipment"
setVar $BOT~help[10]  $BOT~tab&"    {bad/all}    Clean bad/all planets post trading. default none."
setVar $BOT~help[11]  $BOT~tab&"    {guard}       Ensures corp planet at SD to invoke Guardian"
setVar $BOT~help[12]  $BOT~tab&"    {ephag}       Default is NEG but set to use EP Haggle"
setVar $BOT~help[13]  $BOT~tab&"    {furb}       Safe Furb - Corp mate runs xmasfurb"
setVar $BOT~help[14] $BOT~tab&"    "
setVar $BOT~help[15] $BOT~tab&"    Auto refurbs - requires fed safe if not using furb"
setVar $BOT~help[16] $BOT~tab&"    Stores sectors to go back to when script reruns."
setVar $BOT~help[17] $BOT~tab&"    AUTOCLEANUP if planets above 90%"

gosub :BOT~help_file

setVar $BOT~script_title "Moo XMas - Lets bring on the festivities!"
gosub :BOT~banner

gosub :player~quikstats
setvar $startcredits $player~credits
setvar $startturns $player~turns
# try and grab fuel at this
setVar $minOre 120
if ($player~TOTAL_HOLDS < $minOre)
	setVar $minOre $player~TOTAL_HOLDS
end

if ($player~photons > 0)
	setVar $SWITCHBOARD~message "Yeah Nah, we don't do this with photons.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

setVar $startingLocation $PLAYER~CURRENT_PROMPT
if ($startingLocation <> "Command")
	setVar $SWITCHBOARD~message "must be started from Command prompt.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

if (($player~TWARP_TYPE <> 1) and ($player~TWARP_TYPE <> 2))
	setVar $SWITCHBOARD~message "MooXmas - Twarp = good, No Twarp = bad.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

if ($player~FIGHTERS < 301)
	setVar $SWITCHBOARD~message "MooXmas - Need more than 300 figs, you'll hit debree and die!*"
	gosub :SWITCHBOARD~switchboard
	halt
end


if ($player~ORE_HOLDS < 100)
	setVar $SWITCHBOARD~message "MooXmas - We need ore in our holds.*"
	gosub :SWITCHBOARD~switchboard
	halt
end


setVar $halt_turns $bot~parm1
isNumber $number $halt_turns

if ($number <> 1)
	setvar $switchboard~message "Please select what turns to halt at.*"
	gosub :switchboard~switchboard
	halt

end

if ($halt_turns <= 0)
	setvar $switchboard~message "Halt turns must be greater than 0.*"
	gosub :switchboard~switchboard
	halt
else
	setvar $switchboard~message "We will stop when we reach " & $halt_turns & " turns.*"
	gosub :switchboard~switchboard
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

getWordPos $bot~user_command_line $pos "figs"
if ($pos > 0)
	setVar $furbfigs TRUE
	setvar $switchboard~message "We are restocking fighters.*"

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



getWordPos $bot~user_command_line $pos "furb"
if ($pos > 0)
	setVar $corpfurb TRUE
	setvar $switchboard~message "Using Corp Furbing.*"
	setVar $useGuard FALSE
	setVar $furbfigs FALSE
	setVar $corpCashDump FALSE
else
	setVar $corpfurb FALSE
	setVar $corpCashDump TRUE
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



# Primary product 1 - fuel, 2 - org, 3 - fuel
setVar $SWITCHBOARD~message "Primary product will be equipment.*"
setVar $PrimaryProduct 3
getWordPos $bot~user_command_line $pos "f"
if ($pos > 0)
	setVar $PrimaryProduct 1
	setVar $SWITCHBOARD~message "Primary product will be equipment.*"
end

getWordPos $bot~user_command_line $pos "o"
if ($pos > 0)
	setVar $SWITCHBOARD~message "Primary product will be Organics.*"
	setVar $PrimaryProduct 2
end

getWordPos $bot~user_command_line $pos "e"
if ($pos > 0)
	setVar $PrimaryProduct 3
end

gosub :SWITCHBOARD~switchboard


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

loadVar $bot_name
loadVar $unlimitedGame		
loadVar $bot_turn_limit		
loadVar $user_command_line	
loadVar $parm1			
loadVar $parm2			
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

setVar $planetToBang 0
setVar $planetsInSector 0
setVar $planets 0
setVar $planeti 1



# Trading Min - we'll stop using a port when we get here
setVar $tradingMinProduct 40





# NEED TO GET THIS FROM GAME  -THen ALLOW SAY 80% used by script
setVar $PLANETSALLOWEDINGAME $game~MAX_PLANETS_IN_GAME
setVar $PLANETSALLOWED (($PLANETSALLOWEDINGAME * 90) / 100)


fileExists $mooFileChk $moo_setting_file
if ($mooFileChk = 1)
	
	setVar $i 1
	readToArray $moo_setting_file $moo_settings
	setArray $planetList $moo_settings 5
	while ($i <= $moo_settings)
	    setVar $planetInf $moo_settings[$i]
	    gosub :process_planet_line
	    setVar $planetList[$i] $planetName
	   
	    setVar $planetList[$i][1] $PLANET_CHECKED
	    setVar $planetList[$i][2] $PLANET_START_FUEL
	    setVar $planetList[$i][3] $PLANET_START_ORG
	    setVar $planetList[$i][4] $PLANET_START_EQUIP
	    setVar $planetList[$i][5] $PLANET_TRADE_PLANET
	    
	    add $i 1
	end
	setVar $totalGamePlanets $moo_settings
     

else
	
	loadvar $planet~planet_file
	gosub :PLANET~loadplanetInfo
	setVar $i 1

	# Fuel Org Equ
	while ($i <= $PLANET~planetcounter)
		
		# Class E, Red Rider Double Action BB Gun
		setVar $p $PLANET~planetList[$i]
		getWordPos $p $loc "Class"
		
		cutText $p $planetname $loc 99
		write $moo_setting_file "0 0 0 0 0 " & $planetname 
		setVar $planetList[$i] $planetName
		setVar $planetList[$i][1] 0
		setVar $planetList[$i][2] 0
		setVar $planetList[$i][3] 0
		setVar $planetList[$i][4] 0
		setVar $planetList[$i][5] 0
		add $i 1
	end
	setVar $totalGamePlanets $PLANET~planetcounter

end



setArray $explored SECTORS
setArray $portReported SECTORS
setArray $portBlocked SECTORS
setArray $futureDestinations SECTORS
setVar $futureDestsAdded 0
setVar $futurePortsAdded 0

# future use we might choose not to haggle - unlimitd turns?
setVar $haggle 1


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
	setvar $turnsNow $player~turns

	if ($turnsNow < $halt_turns)
		setvar $switchboard~message "Turn Limit Reached*"
		gosub :switchboard~switchboard
		gosub :subreport
		halt
	end
	if ($player~FIGHTERS < 301)
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
		goSub :createAndSell
	end

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
		if (($cport = 1) or ($cport = 2) or ($cport = 6) or ($cport = 8)) 
			setVar $prodPerc PORT.PERCENTFUEL[$portToCheck]
			if ($prodPerc > $tradingMinProduct)
				setVar $portCheckedOk 1
			end
			
		end
	elseif ($PrimaryProduct = 2)
		if (($cport = 1) or ($cport = 3) or ($cport = 5) or ($cport = 8)) 
			setVar $prodPerc PORT.PERCENTORG[$portToCheck]
			if ($prodPerc > $tradingMinProduct)
				setVar $portCheckedOk 1
			end
			
		end
	elseif ($PrimaryProduct = 3)
		if (($cport = 2) or ($cport = 3) or ($cport = 4) or ($cport = 8)) 
			setVar $prodPerc PORT.PERCENTEQUIP[$portToCheck]
			if ($prodPerc > $tradingMinProduct)
				setVar $portCheckedOk 1
			end
			
		end
	end 
return




:restock

	if ($corpfurb = true)
		gosub :restockcorp
	else
		gosub :player~quikstats
		setVar $prestockcredits $player~credits
		stripText $precredits ","

		gosub :restockself

		gosub :player~quikstats
		setVar $poststockcredits $player~credits
		stripText $poststockcredits ","
		setVar $stat_dollarsspent ($precredits - $poststockcredits)
	end


return
:restockcorp
	
	gosub :player~quikstats

	:pickupTryAgain
	send "'XmasTime@ " $SWITCHBOARD~bot_name " " $player~SHIP_NUMBER " " CURRENTSECTOR "*"
	
	
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
	
	setVar $restockMakePlanet 0
	if ($useGuard = true)
		
		setVar $planetFound 0
		goSub :checkCorpPlanet
		if ($planetFound = 0)
			setVar $restockMakePlanet 1
		else
			setVar $restockMakePlanet 0
		end

	end

	if ($corpCashDump = TRUE)

		setVar $doDockCashDump FALSE
		if ($PLAYER~CREDITS > 1100000)
			setVar $corpNotAtDock TRUE
			gosub :checkCorpAtDock
			if ($corpNotAtDock = FALSE)
				setVar $doDockCashDump TRUE
			end

		end
	end 
	send "m" $stardock "*y"
	waitfor "Locating beam pinpointed, TransWarp"
	send "y  "
	
	send "p   sh"
	
		send "a"
		setTextTrigger shipCheckBuyAtomics :shipCheckBuyAtomics "How many Atomic Detonators do you want"
		pause
		:shipCheckBuyAtomics
			killalltriggers
			getWord CURRENTLINE $AtomicssAvail 9
			stripText $AtomicssAvail ")"
			if ($AtomicssAvail = 0)
				echo "*### we have a problem, no Atomics purchasable waiting for next"
				#waitfor "next@"
				send "*"
			else
				send  "*a" $AtomicssAvail "*"
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
		
		
			gosub :player~quikstats
			send "qsp"

			setTextTrigger refurbFigPricet :refurbFigPricet "credits per fighter"
			:checkShields
			setTextTrigger refurbShields :refurbShields "Shield Points"
			pause
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
					send "b" $figsToBuy "*"
				end
				goto :checkShields
			:refurbShields
				killalltriggers
				getWord CURRENTLINE $shieldPrice 5
				getWord CURRENTLINE $canBuy 9
				setVar $shieldsToBuy $player~credits
				subtract $shieldsToBuy 250000
				divide $shieldsToBuy $shieldPrice
				
				if ($shieldsToBuy > $canBuy)
					setVar $shieldsToBuy $canBuy
				end
				send "c" $shieldsToBuy "*"
			
			
	
	if ($corpCashDump = TRUE)

		if ($doDockCashDump = TRUE)
			goSUb :player~quikstats
			if ($PLAYER~CREDITS > 1100000)
				setVar $dumpcash ($PLAYER~CREDITS - 150000)
			else
				setVar $doDockCashDump FALSE
			end
		end
	end

	#send "qspb5000*c3000*q"
	send "qqq    *   "
	if ($restockMakePlanet = 1)
		send "u   y  n  .  n  *  c * *  "
	end
	
	if ($corpCashDump = TRUE)
		if ($doDockCashDump = TRUE)
			send "t  c  y  q   z   t" $dumpcash "*  *  *  "
		end
	end
	send "m  " $returnSpot  "*   y   y  "
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
					setVar $corpNotAtDock FALSE
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
				setVar $planetFound 1
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

				if ($prodPerc > $tradingMinProduct)					
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
				
				echo "*######################################"
				echo "*##  NO where to go too...  #"
				echo "*##  This is a day 1 - no ztm explorer  #"
				echo "*##  Re position and start again#"
				halt
			end

		else
			echo "*######################################"
			echo "*##  NO where to go too...  #"
			echo "*##  This is a day 1 - no ztm explorer  #"
			echo "*##  Re position and start again#"
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
		if ($hasFig = 1)
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
	elseif ($getFuturePortOnly = 0)
		# check we have a fig at the jump point
		setVar $checkSector $futureDestinations[$maxWarpsSector][0]
		getSectorParameter $checkSector "FIGSEC" $hasFig
		if ($hasFig = 1)
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


:setVoidSectors

	
	# we don't really want to sit outside of SD.

	setVar $explored[$stardock] 1
	setVar $a 1
	while ($a <= SECTOR.WARPCOUNT[$stardock])
		# Avoids warps out of StarDock
		setVar $explored[SECTOR.WARPS[$stardock][$a]] 1
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
		send "'Moo Update - Planets: " $stat_torps " Turns: " $stat_turnsUsed " Net Profit: " $stat_dollarsnet "*"
	end
return

:calcStats

	setVar $stat_dollarsnet ($stat_dollarsgross - $stat_dollarsspent)
	
	setVar $stat_turnsUsed ($startturns - $player~turns)

	setvar $stuff "Turns Used: " & $stat_turnsUsed & "*Figs Down: " & $stat_figsdown & "*Ports Traded: " & $stat_trades  & "*Moves Made: " & $stat_moves & "*Gross Cash:" & $stat_dollarsgross & "*Expense:" & $stat_dollarsspent & "*Net Cash:" & $stat_dollarsnet
	setvar $stuff $stuff & "*Refurbs: " & $stat_refurbs & "*Gen Torps: " & $stat_torps & "*Atomics: " & $stat_atomics
return

:checkDanger
	# Density check will be stoped by own figs, so we assume explored is safe for now
		
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
	if ($danger = 1)

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
	add $stat_figsdown 1
	add $stat_moves 1
return

:holoScan
	
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
			return

		:checkSafeToBlowFinish
		:checkSafeToBlowNoPlanet
			killalltriggers
			return
	waitfor "Command ["


return

:createAndSell



	setVar $planetToBang 0
	setVar $planetsInSector 0
	setVar $planets 0
	setVar $planeti 1
	
	setVar $safeToBlow 1
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
	goSub :reCheckPlanets

	setVar $go 1

	setVar $planetsInSectorCHK $planetsInSector

	while ($go = 1)

# ENSURE PREFERRED SLOT IS FREE 
		
		if ($planetsInSectorCHK >= $preferredPlanetSlot)
			setVar $checkNewPlanet 0
			goSub :reCheckPlanets
			setVar $shipBlastPlanet $planets[$preferredPlanetSlot]
			gosub :blastPlanet
			setVar $checkNewPlanet 0
			goSub :reCheckPlanets
			setVar $planetsInSectorCHK $planetsInSector
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
				# we going to trade it now
				setVar $tradePlanet $newPlanetMade
			end
		end
# DID WE MAKE A GOOD ONE?

		if ($goodPlanet = 1)

			# if we just checked the new planet then we can skip this
			if ($getPlanetSettingsReq = 0)
				
				# FIND NEW PLANET NUMBER
				setVar $newPlanetMade 0
				setVar $checkNewPlanet 1
				goSub :reCheckPlanets
				setVar $checkNewPlanet 0
				setVar $tradePlanet $newPlanetMade
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
	

	# Sector Clean up

	# if we are above the 90% planets then auto cleanup
	if ($tradePlanet > $PLANETSALLOWED)
		setVar $cleanup 2
	else
		setVar $cleanup $userCleanup
	end


	if ($cleanup > 0)
		setVar $planetsToBlow 0
		setVar $figsRequired 0
		setVar $i 1
		while ($i <= $planetsInSector)
			
				
			if ($planets[$i] <> $tradePlanet)
				add $planetsToBlow 1
				add $figsRequired (100 * $planetsToBlow)
			elseif ($cleanup = 2)
				add $planetsToBlow 1
				add $figsRequired ($figsRequired * $planetsToBlow)
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
			

		end
		setVar $i 1
		while ($i <= $planetsInSector)
			
				
			if ($planets[$i] <> $tradePlanet)
				
				setVar $shipBlastPlanet $planets[$i]
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



	setVar $planetList[$planetIndexFound][1] 1
	setVar $planetList[$planetIndexFound][2] $PLANET~PLANET_FUEL
	setVar $planetList[$planetIndexFound][3] $PLANET~PLANET_ORGANICS
	setVar $planetList[$planetIndexFound][4] $PLANET~PLANET_EQUIPMENT

	if (($PLANET~PLANET_FUEL >= $FUEL_MIN_MOO) and ($MOO_FUEL = 1))
		setVar $MooThePlanet 1
	end
	if (($PLANET~PLANET_ORGANICS >= $ORGANICS_MIN_MOO) and ($MOO_ORGANICS = 1))
		setVar $MooThePlanet 1
	end
	if (($PLANET~PLANET_EQUIPMENT >= $EQUIPMENT_MIN_MOO) and ($MOO_EQUIPMENT = 1))
		setVar $MooThePlanet 1
	end
	setVar $planetList[$planetIndexFound][5] $MooThePlanet
	
	if ($MooThePlanet = 1)
		goSub :checkGoodPlanet
	end
	goSub :rewriteMooSettings
	

return

:checkGoodPlanet
	

	if (($planetList[$planetIndexFound][2] > $FUEL_MIN_MOO) and ($MOO_FUEL = 1))
		if ((PORT.BUYFUEL[CURRENTSECTOR] = 1) and (PORT.PERCENTFUEL[CURRENTSECTOR] > $tradingMinProduct))
			setVar $goodPlanet 1
		end
	end
	if (($planetList[$planetIndexFound][3] > $ORGANICS_MIN_MOO) and ($MOO_ORGANICS = 1))
		if ((PORT.BUYORG[CURRENTSECTOR] = 1) and (PORT.PERCENTORG[CURRENTSECTOR] > $tradingMinProduct))
			setVar $goodPlanet 1
		end
	end
	if (($planetList[$planetIndexFound][4] > $EQUIPMENT_MIN_MOO) and ($MOO_EQUIPMENT = 1))
		if ((PORT.BUYEQUIP[CURRENTSECTOR] = 1) and (PORT.PERCENTEQUIP[CURRENTSECTOR] > $tradingMinProduct))
			setVar $goodPlanet 1
		end
	end
return


:makeAPlanet
		:updatePlanetsFinishWait
		setVar $goodPlanet 0
		send "uyn.*p"
		:buildPlanet
		setTextLineTrigger buildPlanet1 :buildPlanet1 "You don't have any Genesis Torpedoes to launch!"
		setTextLineTrigger buildPlanet2 :buildPlanet2 "For building this planet you receive"
		pause
		:buildPlanet1
			killAllTriggers
			send "*"
			gosub :restock
			goto :updatePlanetsFinishWait
			
		:buildPlanet2
			killAllTriggers
			add $stat_torps 1
			add $planetsInSectorCHK 1
		
			
			setVar $planetIndexFound 0
			setVar $t 1
			while ($t <= $totalGamePlanets)
				setTextLineTrigger $t :MakePlanetLbl & $t $planetList[$t]
				add $t 1
			end
			pause
			:MakePlanetLbl1
				setVar $planetIndexFound 1
				goto :endMakePlanetLbls
			:MakePlanetLbl2
				setVar $planetIndexFound 2
				goto :endMakePlanetLbls
			:MakePlanetLbl3
				setVar $planetIndexFound 3
				goto :endMakePlanetLbls
			:MakePlanetLbl4
				setVar $planetIndexFound 4
				goto :endMakePlanetLbls
			:MakePlanetLbl5
				setVar $planetIndexFound 5
				goto :endMakePlanetLbls
			:MakePlanetLbl6
				setVar $planetIndexFound 6
				goto :endMakePlanetLbls
			:MakePlanetLbl7
				setVar $planetIndexFound 7
				goto :endMakePlanetLbls
			:MakePlanetLbl8
				setVar $planetIndexFound 8
				goto :endMakePlanetLbls
			:MakePlanetLbl9
				setVar $planetIndexFound 9
				goto :endMakePlanetLbls
			:MakePlanetLbl10
				setVar $planetIndexFound 10
				goto :endMakePlanetLbls
			:MakePlanetLbl11
				setVar $planetIndexFound 11
				goto :endMakePlanetLbls
			:MakePlanetLbl12
				setVar $planetIndexFound 12
				goto :endMakePlanetLbls
			:MakePlanetLbl13
				setVar $planetIndexFound 13
				goto :endMakePlanetLbls
			:MakePlanetLbl14
				setVar $planetIndexFound 14
				goto :endMakePlanetLbls
			:MakePlanetLbl15
				setVar $planetIndexFound 15
				goto :endMakePlanetLbls
			:MakePlanetLbl16
				setVar $planetIndexFound 16
				goto :endMakePlanetLbls
			:MakePlanetLbl17
				setVar $planetIndexFound 17
				goto :endMakePlanetLbls
			:MakePlanetLbl18
				setVar $planetIndexFound 18
				goto :endMakePlanetLbls
			:MakePlanetLbl19
				setVar $planetIndexFound 19
				goto :endMakePlanetLbls
			:MakePlanetLbl20
				setVar $planetIndexFound 20
				goto :endMakePlanetLbls

			:endMakePlanetLbls

			if ($planetList[$planetIndexFound][1] = 0)
				setVar $getPlanetSettingsReq $planetIndexFound
			else
				if ($planetList[$planetIndexFound][5] = 1)
					goSub :checkGoodPlanet
				end

			end


			
return


:blastPlanet

:blastblastblast
send "l" $shipBlastPlanet "*zdy *"

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
		while ($prevPlaneti <= $planetsInSector)
			
			setVar $prevPlanets[$prevPlaneti] $planets[$prevPlaneti]
			add $prevPlanetsInSector 1
			add $prevPlaneti 1
		end
	end
	
	setVar $planetsInSector 0
	setVar $planets 0
	setVar $planeti 1
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

			add $planetsInSector 1
			setVar $planets[$planeti] $cPlanetNum
			
			add $planeti 1
		end
		goto :reCheckPlanetsT

	:reCheckPlanetsT3
		killAllTriggers
		waitfor "Command ["

	if ($checkNewPlanet = 1)
		setVar $planeti 1
		while ($planeti <= $planetsInSector)
			setVar $searchPlanet $planets[$planeti]
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
			add $planeti 1
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
	setVar $creditsNow $player~credits

	subtract $creditsNow $precredits
	add $stat_dollarsgross $creditsNow
	
	if (($player~ORE_HOLDS < $minOre) and (PORT.BUYFUEL[CURRENTSECTOR] = 0))
		send "pt * * * "
		waitfor "credits and"
	end


return

:planetTrade_ck

	send "l" $tradePlanet "*"
	
	setTextLineTrigger tradePlanetLand1 :tradePlanetLand1 "That planet is not in this sector."
	setTextLineTrigger tradePlanetLand2 :tradePlanetLand2 "ding sequence engaged"
	pause
	:tradePlanetLand1
		killAllTriggers
echo "*### PLANET FOUND! WE COUNTED WRONG SOMEWHERE"
		halt
		
		
	:tradePlanetLand2
		killAllTriggers
	Waitfor "-------  ---------  ---------  ---------  ---------  ---------  ---------"
	if ($player~ORE_HOLDS < $minOre)
		send "tnt1*"
		waitfor "free cargo holds."
		send "d"
		Waitfor "-------  ---------  ---------  ---------  ---------  ---------  ---------"
	end


	setTextLineTrigger tradePlanetLand3 :tradePlanetLand3 "Fuel Ore"
	setTextLineTrigger tradePlanetLand4 :tradePlanetLand4 "Organics"
	setTextLineTrigger tradePlanetLand5 :tradePlanetLand5 "Equipment"
	setTextTrigger tradePlanetLand6 :tradePlanetLand6 "Planet command ("
	pause
		:tradePlanetLand3
			killTrigger :tradePlanetLand3
			getWord CURRENTLINE $availOre 6
			striptext $availOre ","
			if ($availOre = 0)
				setVar $tradeOre "-1"
			end
		
			pause
		:tradePlanetLand4
			killTrigger :tradePlanetLand4
			getWord CURRENTLINE $availOrg 5
			striptext $availOrg ","
			if ($availOrg = 0)
				setVar $tradeOrg "-1"
			end
			pause
		:tradePlanetLand5
			killTrigger :tradePlanetLand5
			getWord CURRENTLINE $availEquip 5
			striptext $availEquip ","
			if ($availEquip = 0)
				setVar $tradeEquip "-1"
			end
			pause
		:tradePlanetLand6
			killAllTriggers
			if ($tradeOre = 0)
				setVar $tradeOre $availOre
			end
			if ($tradeOrg = 0)
				setVar $tradeOrg $availOrg
			end
			if ($tradeEquip = 0)
				setVar $tradeEquip $availEquip
			end
			
		setVar $planet~_ck_pnego_fueltosell $tradeOre
		setVar $planet~_ck_pnego_orgtosell $tradeOrg
		setVar $planet~_ck_pnego_equiptosell $tradeEquip
		

		gosub :planet~planetNeg

		gosub :player~quikstats
		stripText $player~credits ","
		setVar $creditsNow $player~credits
		if ($creditsNow = $precredits)
			echo "*################*##############"
			echo "*#### NEG FAILED, SELLING AT COST!"
			echo "*###############################"

		
			send "q p n" $tradePlanet "* * * * * * * l" $tradePlanet "*"
			waitfor "Land on which planet"
			gosub :player~quikstats
			stripText $player~credits ","
			setVar $creditsNow $player~credits
		end
		
		send "q"

return


:planetTrade_ep


	if ($player~ORE_HOLDS < $minOre)
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
			
		
		:sellempty2
			killalltriggers
		goto :startplanetTrade_ep
	
	:weAreDone
		killalltriggers
		
	gosub :player~quikstats
	stripText $player~credits ","
	setVar $creditsNow $player~credits
	if ($creditsNow = $precredits)
		echo "*################*##############"
		echo "*#### NEG FAILED, SELLING AT COST!"
		echo "*###############################"

		send "p n" $tradePlanet "* * * * * * * "
		waitfor "Your offer "
		gosub :player~quikstats
		stripText $player~credits ","
		setVar $creditsNow $player~credits
	end
	

return



:process_planet_line
        getWord $planetInf $PLANET_CHECKED 1
        getWord $planetInf $PLANET_START_FUEL 2
        getWord $planetInf $PLANET_START_ORG 3
        getWord $planetInf $PLANET_START_EQUIP 4
        getWord $planetInf $PLANET_TRADE_PLANET 5
	getLength $PLANET_CHECKED $length1
	getLength $PLANET_START_FUEL $length2
	getLength $PLANET_START_ORG $length3
	getLength $PLANET_START_EQUIP $length4
	getLength $PLANET_TRADE_PLANET $length5
	setVar $startlen ($length1 + $length2 + $length3 + $length4 + $length5 + 6)
	cutText $planetInf $planetname $startlen 999
return

:rewriteMooSettings
	
	delete $moo_setting_file
	setVar $pcount 1
	while ($pcount <= $totalGamePlanets)
		
		write $moo_setting_file $planetList[$pcount][1] & " " & $planetList[$pcount][2] & " " & $planetList[$pcount][3] & " "  & $planetList[$pcount][4] & " " & $planetList[$pcount][5] & " " & $planetList[$pcount]
		add $pcount 1
	end
	
return


include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"