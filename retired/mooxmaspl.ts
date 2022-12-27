#MOOXmasPL	- checks CY list for ports to use
#		- Option to make them - Should perfect this one as really this one is just go direct to a list 

# Blow Planets as we don't need em? or leave em? hides real ports

# Drop Cash off - starting sector
# no turn saveme!

# ADD TARGETS TO GO ON STATS

# CALC ORE LEFT ON PLANET AND DECIDE WHETHER TO BLOW


gosub :BOT~loadVars

loadVar $game~port_max
loadVar $game~ptradesetting
loadvar $bot~$MCIC_FILE

	setVar $setGridMines 0
	setVar $setGridLimpets 0


	setVar $BOT~help[1]  $BOT~tab&"       Moo Xmas Personal List Seller "
	setVar $BOT~help[2]  $BOT~tab&"       Views Personal Planet list and sell any ore to ports. "
	setVar $BOT~help[3]  $BOT~tab&"       Ports must be at 90% - no need to Cim and rerun at end."
	setVar $BOT~help[4]  $BOT~tab&"       Will NOT trade upgraded ports - Another script for that."
	setVar $BOT~help[5]  $BOT~tab&" "
	setVar $BOT~help[6]  $BOT~tab&" mooxmas [turnsstop] {dropmines} {cleanup} {guard} {figs} {ephag}"
	setVar $BOT~help[7]  $BOT~tab&"       "
	setVar $BOT~help[8]  $BOT~tab&" Options:"
	setVar $BOT~help[9]  $BOT~tab&"    [turnsstop]     STOP when you get to this few turns"
	setVar $BOT~help[10]  $BOT~tab&"    {dropmines}     Drops a mines and limpets at port."
	setVar $BOT~help[11]  $BOT~tab&"    {cleanup}       Cleanup planets after if less than "
	setVar $BOT~help[12]  $BOT~tab&"    {figs}          Top up as we furb."
	setVar $BOT~help[13]  $BOT~tab&"    {guard}         Pop a corp planet for Guardian effect"
	setVar $BOT~help[14]  $BOT~tab&"                    Requires: You'll Shoot You're Eye Out"
	setVar $BOT~help[15] $BOT~tab&"    "
	setVar $BOT~help[16]  $BOT~tab&"    {ephag}       Default is NEG but set to use EP Haggle"
	setVar $BOT~help[17] $BOT~tab&"    "
	
	gosub :bot~helpfile

	setVar $BOT~script_title "Moo XMas PL - Lets bring on the festivities!"
	gosub :BOT~banner

	gosub :player~quikstats
	setvar $startcredits $player~credits
	setvar $startturns $player~turns

	if ($player~photons > 0)
		setVar $SWITCHBOARD~message "Yeah Nah, we don't do this with photons.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation <> "Command")
		setVar $SWITCHBOARD~message "MooXmas -  must be started from Command prompt.*"
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

	if ($player~ore_holds < 100)
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

	getWordPos $bot~user_command_line $pos "dropmines"
	if ($pos > 0)
		setVar $setGridMines 3
		setVar $setGridLimpets 1
		setvar $switchboard~message "Dropping Mines.*"
	else
		
		setvar $switchboard~message "Not dropping mines.*"
	end
	gosub :switchboard~switchboard

	getWordPos $bot~user_command_line $pos "figs"
	if ($pos > 0)
		setVar $furbfigs TRUE
		setvar $switchboard~message "We are restocking fighters.*"
	else
		setVar $furbfigs FALSE
		setvar $switchboard~message "We are NOT restocking fighters.*"
	end
	gosub :switchboard~switchboard

	getWordPos $bot~user_command_line $pos "cleanup"
	if ($pos > 0)
		setVar $cleanup 1
		setvar $switchboard~message "We are blowing ALL planets post trade.*"
	else
		setVar $cleanup 0
		setvar $switchboard~message "We are just blowing dud planets.*"
	end
	gosub :switchboard~switchboard

	getWordPos $bot~user_command_line $pos "guard"
	if ($pos > 0)
		setVar $useGuard TRUE
		setvar $switchboard~message "Creating a corp planet at SD.*"
	else
		setVar $useGuard FALSE
		setvar $switchboard~message "Not creating guardian planets.*"
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
setVar $stat_targets 0



setvar $_CK_PTRADESETTING  100
saveVar $_CK_PTRADESETTING


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



	setVar $unlimited 0


	setVar $setVarPlanetType1 "Snowball Mountai"
	setVar $setVarPlanetType2 "Silent Night"
	setVar $setVarPlanetType3 "CANDYCANE 0"
	setVar $setVarPlanetType4 "Red Rider"
	setVar $setVarPlanetType5 "Jack Frost"

	setVar $planet~planetToBang 0
	setVar $planet~planetsInSector 0
	setVar $planet~planets 0
	setVar $planet~planeti 1
	setVar $planet~planetsInSectorReq 99
	setVar $planet~planetsCreated 0
	
	setVar $tradingMinFuel 40

	setVar $ftrs 1
	if ($dropToll)
		setVar $ftrsType "t"
	elseif ($dropOffensive)
		setVar $ftrsType "o"
	else
		setVar $ftrsType "d"
	end
	
	# need to get this from bto
	setVar $maxFightersToAttack 250

	setVar $setGridFighters 1
	setVar $setGridFightersOwner "c"
	setVar $setGridFightersType $ftrsType

	setVar $noMinesLeft 0
	setVar $noLimpetsLeft 0
	

	
	setVar $thisScriptName "MooXmasPL.ts"
	
	setVar $minOre 90
	


	setVar $sectors 0
	setVar $sectorsOk 0
	setVar $sectorsOki 1
	setVar $sectorsPlanetsOki 1
	setVar $sectorsNoFig 0
	setVar $sectorsNoFigi 1

	setVar $startPlanets 0
	setVar $startEquip 0
	
	setVar $minTrade 1000
	#stop going to upgraded planets
	setVar $maxTrade 3100
	setVar $minTradePer 90
	
	setVar $haggle 1

	clearAllAvoids


	# CHECK WE AREN't RUNNING TWO
	listActiveScripts $scripts
	setVar $a 1
	setVar $c 0

	while ($a <= $scripts)
		if ($scripts[$a] = $thisScriptName)
			#stop $scripts[$a]
			add $c 1
			
			#return
		end
		add $a 1
	end

	if ($c > 1)
		echo "Script running multiple times: kill all!"
		stop $thisScriptName
		stop $thisScriptName
		halt
	end

	send "d"
	waitfor "Re-Display"
	waitfor "Help)?"





	send "v"
	setTextTrigger starDockTrigger :starDockTrigger "The StarDock is located in sector"
	pause
	:starDockTrigger
		getWord CURRENTLINE $stardock 7
		stripText $stardock "."
		killalltriggers


	gosub :player~quikstats

	gosub :setVoidSectors



	#determine if ship has t-warp - turn option on and check if we have drive
		
	setVar $setGridHasTranswarp 0
	send "cuyqi"
	waitfor "Trader Name    :"

	:checkTwarpTriggers
	setTextLineTrigger checkTwarpYes :checkTwarpYes "TransWarp Power"
	setTextLineTrigger checkTwarpFinish :checkTwarpFinish "Credits        :"
	pause
	:checkTwarpYes
		killTrigger checkTwarpYes
		killTrigger checkTwarpFinish
		setVar $setGridHasTranswarp 1
		goto :checkTwarpTriggers

	:checkTwarpFinish
		killTrigger checkTwarpYes
		killTrigger checkTwarpFinish








	# Planet list from personal planets - relies on no shields being present

	setVar $targetP 0
	setVar $readi 1
	setVar $lastSector 0
	
	setVar $planet~planetsFound 0
	setVar $tempSectors 0
	setVar $tempPlanets 0
	setVar $tempOre 0
	setVar $tempi 1
	send "cyq"
	waitfor "<Computer activated>"
	waitfor "Sector  Planet Name"
# v1 has no planetnum
	:pread
	setTextLineTrigger pread1 :pread1 "#" 
	setTextLineTrigger pread2 :pread2 "---" 
	setTextLineTrigger preadDone :preadDone "======   ============  ==== ==== ==== ===== ===== " 
	pause
	:pread1
		killAllTriggers
		getWord CURRENTLINE $sector 1
		getWord CURRENTLINE $lastP 2
		stripText $lastP "#"
		cutText CURRENTLINE $planet~planetName 50 16 
		getWord $planet~planetName $p1 1
		getWord $planet~planetName $p2 2
		setVar $p $p1 & " " & $p2

		if ($p = $setVarPlanetType1)
			setVar $targetP 1
		elseif ($p = $setVarPlanetType2)
			setVar $targetP 1
		elseif ($p = $setVarPlanetType3)
			setVar $targetP 1
		elseif ($p = $setVarPlanetType4)
			setVar $targetP 1
		elseif ($p = $setVarPlanetType5)
			setVar $targetP 1
		else
			setVar $targetP 0
		end
		add  $planet~planetsFound 1

		goto :pread
	:pread2
		killAllTriggers
		
		getWord CURRENTLINE $ore 6
		getWordPos $ore $pos "T"
		if ($pos > 0)
			stripText $ore "T"
			multiply $ore 1000
		end
		getWordPos $ore $pos "M"
		if ($pos > 0)
			stripText $lastP "M"
			multiply $ore 1000000
		end
		
		if ($targetP = 1)
			# right type of planet

			if ($lastSector <> $sector)
	

				if ($tempSectors[1] > 1)

				
					setVar $loopi 1
					setVar $te 0
					setVar $tp 0
					setVar $ts 0
					while ($loopi < $tempi)
				
						if ($loopi = 1)
				 
							setVar $te $tempOre[$loopi]
							setVar $tp $tempPlanets[$loopi]
							setVar $ts $tempSectors[$loopi]
						else
							if ($tempOre[$loopi] > $te)
								setVar $te $tempOre[$loopi]
								setVar $tp $tempPlanets[$loopi]
								setVar $ts $tempSectors[$loopi]
							end
						end
						add $loopi 1
					end
					setVar $sectors[$readi] $ts
					setVar $startPlanets[$readi] $tp
					setVar $startEquip[$readi] $te
					add $readi 1

					setVar $tempSectors 0
					setVar $tempPlanets 0
					setVar $tempOre 0
					setVar $tempi 1
				end
				
			end
			
			#has product lock it in
			setVar $tempSectors[$tempi] $sector
			setVar $tempPlanets[$tempi] $lastP
			setVar $tempOre[$tempi] $ore
			add $tempi 1
			setVar $lastSector $sector
			
		end
		

		goto :pread
	:preadDone
		killAllTriggers
	

	# GET PORT REPORTS

	setVar $loopi 1
	send "c"
	waitfor "<Computer activated>"
	while ($loopi < $readi)
		send "r" $sectors[$loopi] "*"
		add $potControl 1
		if ($potControl = 100)
			setVar $potControl 0
			send "?"
			waitfor "Fire Photon Missile"
		end
		add $loopi 1
	end
	send q
	waitfor "<Computer deactivated>"

	
	# CHECK MIN PERCENTAGES
	
	setVar $lowPorts 0
	setVar $loopi 1

	while ($loopi < $readi)
		setVar $portOk 0
		setVar $ftrOk 0
		
		setVar $sector $sectors[$loopi]
		setVar $planet~planet $startPlanets[$loopi]
		if (PORT.BUYFUEL[$sector] = 1)
			if (PORT.FUEL[$sector] > $minTrade) and (PORT.FUEL[$sector] < $maxTrade)
				if (PORT.PERCENTFUEL[$sector] > $minTradePer)
					setVar $portOk 1
				end
			end
		end
		getSectorParameter $sector "FIGSEC" $hasFig

		if ($hasFig = 1)
			setVar $ftrOk 1
		end
		
		if (($ftrOk = 1) and ($portOk = 1) and ($startEquip[$loopi] > $minTrade))
			setVar $sectorsOk[$sectorsOki] $sector
			
			setVar $sectorsPlanetsOki[$sectorsOki] $planet~planet
			setVar $sectorsPlanetsOke[$sectorsOki] $startEquip[$loopi]
			
			add $sectorsOki 1
		elseif (($ftrOk = 1) and ($portOk = 0))
			add $lowPorts 1
		end
		if ($ftrOk = 0)
			setVar $sectorsNoFig[$sectorsNoFigi] $sector
			add $sectorsNoFigi 1
		end 

		add $loopi 1
	end
	  
	# REport No Figs

	if ($sectorsNoFigi > 1)
		echo "**############# NO FIG SECTORS"
		setVar $reportF "The following Sectors have no figs: "
		setVar $enteri 0
		setVar $i 1
		while ($i < $sectorsNoFigi)
			
			setVar $reportF $reportF & "," & $sectorsNoFig[$i]
			add $enteri 1
			if ($enteri > 8)
				setVar $enteri 0
				setVar $reportF $reportF & "*"
			end
			add $i 1
		end
		setVar $reportF $reportF & "**"
		setVar $SWITCHBOARD~message $reportF
		gosub :SWITCHBOARD~switchboard

	end
	setVar $loopi 1

	echo "### GOOD PORTS - Sector - Planet - Product ###"
	while ($loopi < $sectorsOki)
		echo "*" $sectorsOk[$loopi]  " - " $sectorsPlanetsOki[$loopi] "  - "  $sectorsPlanetsOke[$loopi] " " 
		add $loopi 1
	end
	echo "Waiting for next "

	setVar $startmsg "We are visiting " & $sectorsOki & " sectors with product."
	setVar $startmsg $startmsg & "*There are " & $lowPorts  & " ports with low product."
	setVar $startmsg $startmsg & "*There are " & $sectorsNoFigi  & " ports with no fighters."

	setVar $startmsg $startmsg & "*Send a Eng age!!! without the space to engage.*"
		

	setVar $SWITCHBOARD~message $startmsg
	gosub :SWITCHBOARD~switchboard


	setVar $stat_targets $sectorsOki
	waitfor "Engage!!!"


##########################
###############  Main LOOP
	
setVar $loopi 1
    while ($loopi < $sectorsOki)
	gosub :player~quikstats
	setvar $player~turnsNow $player~turns

	if ($player~turnsNow < $halt_turns)
		setvar $switchboard~message "Turn Limit Reached*"
		gosub :switchboard~switchboard
		gosub :subreport
		halt
	end
	if ($player~FIGHTERS < 301)
		setVar $SWITCHBOARD~message "MooXmas - Need more than 300 figs, you'll hit debree and die!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	goSub :updateStats

	setVar $sector $sectorsOk[$loopi]
	setVar $shipBlastPlanet $sectorsPlanetsOki[$loopi]

	# Lets get there
	gosub :moveSector
	
	# Lets sell it
	echo "* New Planet to Trade is: " $shipBlastPlanet
	setVar $tradePlanet $shipBlastPlanet
	gosub :planetTrade 
	
	# fresh report?
	send "cr*q"
	waitfor "<Computer deactivated>"
		
	# do we need to blow shit up?
	gosub :checkPlanetWork
	
	:endLoop
	add $loopi 1
	
    end

    gosub :subreport

halt

:checkPlanetWork
	setVar $safeToBlow 1
	
	# LEaving it messy..
	if ($cleanup = 0)
		return
	end
	
	gosub :checkSafeToBlow
	
	if ($safeToBlow = 1)
	
		gosub :reGetPlanetList
	
		setVar $planet~planetsToBlow 0
		setVar $figsRequired 0
		setVar $i 1

		while ($i < $planet~planetsInSector)
			add $planet~planetsToBlow 1
			add $figsRequired (100 * $planet~planetsToBlow)
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
		while ($i <= $planet~planetsInSector)
			setVar $shipBlastPlanet $planet~planets[$i]
			gosub :blastPlanet
			add $i 1
		end
	else
		
		echo "*#########################################"
		echo "* ### CITADELS DETECTED SKIPPING BOOMS ###"
		echo "*#########################################"
		setVar $SWITCHBOARD~message "Warning: Citadel in sector, skipping.*"
		gosub :SWITCHBOARD~switchboard
			

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
		echo "*#####  BLAST PLANET NOT FUOND - BUG BUG ####"
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
		waitfor "Command ["
		goSub :player~quikstats

		goSub :restock

		
		goto :blastblastblast
	:blowPlanet2
		killAllTriggers
		setVar $goodPlanet 0
		
		add $stat_atomics 1

	setVar $goodPlanet 0

return

:checkDockThere

	send "cr" $stardock "*q"
	waitfor "Computer activated"
	setTextLineTrigger checkDockThereYes :checkDockThereYes "Commerce report for"
	setTextLineTrigger checkDockThereNo :checkDockThereNo "Computer deactivated"
	pause
	:checkDockThereNo
		killalltriggers
		setvar $switchboard~message "Stardock is blown up!! Aborting restock.*"
		gosub :switchboard~switchboard
		setvar $switchboard~message "Suggest enemy is waiting at dock; suggest combat mission*"
		gosub :switchboard~switchboard
		halt

	:checkDockThereYes
		killalltriggers


return

:restock
	
	add $stat_refurbs 1
	send "d"
	setVar $returnSpot CURRENTSECTOR
	
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
	goSub :checkDockThere

	setVar $doDockCashDump FALSE
	if ($PLAYER~CREDITS > 1100000)
		setVar $player~corpNotAtDock TRUE
		gosub :checkCorpAtDock
		if ($player~corpNotAtDock = FALSE)
			setVar $doDockCashDump TRUE
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
			getWord CURRENTLINE $player~atomicssAvail 9
			stripText $player~atomicssAvail ")"
			if ($player~atomicssAvail = 0)
				echo "*### we have a problem, no Atomics purchasable waiting for next"
				#waitfor "next@"
				send "*"
			else
				send  "*a" $player~atomicssAvail "*"
			end
			
		if ($setGridMines > 0)
			if ($player~limpets < 10)
				send "l10*"	
			end
			
			if ($player~ARMIDS < 100)
				send "m90*"	
			end
		end

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
			setVar $player~shieldsToBuy $player~credits
			subtract $player~shieldsToBuy 250000
			divide $player~shieldsToBuy $shieldPrice
			
			if ($player~shieldsToBuy > $canBuy)
				setVar $player~shieldsToBuy $canBuy
			end
			send "c" $player~shieldsToBuy "*"
			
	if ($doDockCashDump = TRUE)
		goSUb :player~quikstats
		if ($PLAYER~CREDITS > 1100000)
			setVar $dumpcash ($PLAYER~CREDITS - 150000)
		else
			setVar $doDockCashDump FALSE
		end
	end

	send "qqq    *   "
	if ($restockMakePlanet = 1)
		send "u   y  n  .  n  *  c * *  "
	end
	if ($doDockCashDump = TRUE)
		send "t  c  y  q   z   t" $dumpcash "*  *  *  "
	end

	send "m  " $returnSpot  "*   y   y  "
	setTextLineTrigger restockBack1 :restockBack1 "<Set NavPoint>"
	setTextLineTrigger restockBack2 :restockBack2  "Systems Ready, shall we engag"
	pause
		:restockBack1
			killalltriggers
			send "q * Q * Q * * pss"
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
				echo "#" $sector "#*"
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
:reGetPlanetList


	setVar $planet~planetsInSector 0
	setVar $planet~planets 0
	setVar $planet~planeti 1
	send "lq*"
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
			add $planet~planetsInSector 1
			setVar $planet~planets[$planet~planeti] $cPlanetNum
			add $planet~planeti 1
		end
		goto :reCheckPlanetsT

	:reCheckPlanetsT3
		killAllTriggers

return

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

:moveSector
	
	getDistance $ndoor $sector CURRENTSECTOR
	add $stat_moves 1
	if ($ndoor = 1)
		send "m" $sector "*"
		waitfor "<Move>"
		waitfor " (?=Help)? :"
	else

		send "m" $sector "*y"
		waitfor "To which Sector"
		:moveSector
		setTextLineTrigger moveSectorGood :moveSectorGood "Locating beam pinpointed, TransWarp Locked"
		setTextLineTrigger moveSectorBad :moveSectorBad "No locating beam found"
		setTextLineTrigger moveSectorGood2 :moveSectorGood2 "Warps to Sector(s)"
		
		
		pause

		:moveSectorBad
			killAllTriggers
			echo "#####move bad??"
			waitfor "TransWarp Drive shutting down."
			setvar $switchboard~message "Fighter not present at " & $sector&  ", Moving onto next sector.*"
			gosub :switchboard~switchboard
			goto :endLoop
		:moveSectorGood
		:moveSectorGood2
			killAllTriggers
			send "y"	
		waitfor "TransWarp Drive Engaged!"
			
		if ($setGridMines > 0)
			send "h1" $setGridMines "*ch2" $setGridLimpets "*c"
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
		send "'Moo Update - Trades: " $stat_trades "/" $stat_targets " Turns: " $stat_turnsUsed " Net Profit: " $stat_dollarsnet "*"
	end
return

:calcStats

	setVar $stat_dollarsnet ($player~credits - $startcredits)
	setVar $stat_dollarsspent ($stat_dollarsgross - $stat_dollarsnet)
	setVar $stat_turnsUsed ($startturns - $player~turns)

	setvar $stuff "Turns Used: " & $stat_turnsUsed & "*Figs Down: " & $stat_figsdown & "*Ports Traded: " & $stat_trades  & "*Moves Made: " & $stat_moves & "*Gross Cash:" & $stat_dollarsgross & "*Expense:" & $stat_dollarsspent & "*Net Cash:" & $stat_dollarsnet
	setvar $stuff $stuff & "*Refurbs: " & $stat_refurbs & "*Gen Torps: " & $stat_torps & "*Atomics: " & $stat_atomics
return

:planetTrade
	
	if ($useEp = TRUE)
		goSub :planetTrade_ep
	else
		goSub :planetTrade_ck
	end

return

:planetTrade_ck

###
# requires: tradePlanet
# requires: amount? or 0 for all
	gosub :player~quikstats
	
	add $stat_trades 1
	
	setvar $_ck_pnego_current_sector $player~CURRENT_SECTOR
	saveVar $_ck_pnego_current_sector 

if ($unlimited = 1)
	setVar $player~turns 999
end
	setvar $_ck_pnego_turns $player~TURNS
	saveVar $_ck_pnego_turns 

	stripText $player~credits ","
	setvar $_ck_pnego_credits $player~credits
	saveVar $_ck_pnego_credits 
	
	stripText $player~EXPERIENCE ","
	setvar $_ck_pnego_exp $player~EXPERIENCE
	saveVar $_ck_pnego_exp 

	:tradePlanetLandAgain

	send "l" $tradePlanet "*"
	
	setvar $_ck_pnego_planet $tradePlanet
	saveVar $_ck_pnego_planet 

	setTextLineTrigger tradePlanetLand1 :tradePlanetLand1 "That planet is not in this sector."
	setTextLineTrigger tradePlanetLand2 :tradePlanetLand2 "ding sequence engaged"
	pause
	:tradePlanetLand1
		killAllTriggers
		send "q*"
		waitfor "Command ["
		setVar $newPlanetMade 0
		goSub :reCheckPlanets
		if ($newPlanetMade = 0)
			setVar $tradePlanet $planet~planets[$planet~planetsInSectorReq]
		else
			setVar $tradePlanet $newPlanetMade
		end
		goto :tradePlanetLandAgain
	:tradePlanetLand2
		killAllTriggers
	Waitfor "-------  ---------  ---------  ---------  ---------  ---------  ---------"
	if ($player~ore_holds < $minOre)
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
			setvar $_ck_pnego_planetfuel $availOre
			saveVar $_ck_pnego_planetfuel 
			if ($availOre = 0)
				setVar $tradeOre "-1"
			end
		
			pause
		:tradePlanetLand4
			killTrigger :tradePlanetLand4
			getWord CURRENTLINE $availOrg 5
			striptext $availOrg ","
			setvar $_ck_pnego_planetorg $availOrg
			saveVar $_ck_pnego_planetorg 
			if ($availOrg = 0)
				setVar $tradeOrg "-1"
			end
			pause
		:tradePlanetLand5
			killTrigger :tradePlanetLand5
			getWord CURRENTLINE $availEquip 5
			striptext $availEquip ","
			setvar $_ck_pnego_planetequip $availEquip
			saveVar $_ck_pnego_planetequip 
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
			
			
		
echo "*################*##############"
			echo "*#### $tradeOre " $tradeOre
			echo "*#### $planet~_ck_pnego_fueltosell " $planet~_ck_pnego_fueltosell
			echo "*###############################"

		
		gosub :player~quikstats
		setVar $precredits $player~credits
		stripText $precredits ","


		gosub :planet~planetNeg
		setvar $switchboard~message $planet~exit_message&"*"
		gosub :switchboard~switchboard
			
			
		gosub :player~quikstats
		stripText $player~credits ","
		setVar $player~creditsNow $player~credits
		if ($player~creditsNow = $precredits)
			echo "*################*##############"
			echo "*#### NEG FAILED, SELLING AT COST!"
			echo "*###############################"

	
	
			send "q p n" $tradePlanet "* * * l" $tradePlanet "*"
			waitfor "Land on which planet"
			gosub :player~quikstats
			stripText $player~credits ","
			setVar $player~creditsNow $player~credits
		end
		subtract $player~creditsNow $_ck_pnego_credits
		add $stat_dollarsgross $player~creditsNow
		
		send "q"

return


:planetTrade_ep


	gosub :player~quikstats
	
	
	if ($unlimited = 1)
		setVar $player~turns 999
	end


	
	if ($player~ore_holds < $minOre)
		send "l" $tradePlanet "*"
		send "tnt1*"
		waitfor "free cargo holds."
		send "d"
		Waitfor "-------  ---------  ---------  ---------  ---------  ---------  ---------"
		send "q"
	end

	
	
	gosub :player~quikstats
	setVar $precredits $player~credits
	stripText $precredits ","

	send "pn" $tradePlanet "*"
	
	waitfor "We are buying up to "
	send "*"
	waitfor "Agreed, "
	setTextLineTrigger sellempty2 :sellempty2 "You have"
	setDelayTrigger epsellwait2 :epsellwait2 7000
	pause
	:epsellwait2
		killalltriggers
		send "'{" $switchboard~bot_name "} - Ep Haggle timed out on Haggle*"
		
		send "*"
	
	:sellempty2
		killalltriggers
		
		
	gosub :player~quikstats
	stripText $player~credits ","
	setVar $player~creditsNow $player~credits
	if ($player~creditsNow = $precredits)
		echo "*################*##############"
		echo "*#### NEG FAILED, SELLING AT COST!"
		echo "*###############################"



		send "p n" $tradePlanet "* * * "
		waitfor "Your offer "
		gosub :player~quikstats
		stripText $player~credits ","
		setVar $player~creditsNow $player~credits
	end
	subtract $player~creditsNow $_ck_pnego_credits
	add $stat_dollarsgross $player~creditsNow
	
	

return

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\planetneg\planet"
