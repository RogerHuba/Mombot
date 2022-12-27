
# this has planet safe

# need to check incoming warps safe

# SPECIFY DUMP PLANET
# SPECIFY SAFE SECTOR
# NEED TO MAKE PORT UPGRADE SCRIPT - include report of surrounding sectors to make it quicker

# one torp - moved to next setor, blew a planet with ore (erk?)
# then went to SD and ran out of ore and sat at dock
# - needs to land or detect not made it

# ran out of atomics - moved 701 - think it might have got low on figs, gone home - returned to home nad started trading


gosub :BOT~loadVars

loadVar $game~port_max
loadVar $game~ptradesetting
loadvar $bot~$MCIC_FILE
loadvar $MAP~STARDOCK

setVar $BOT~help[1]  $BOT~tab&"       Sells ore to upgraded ports"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&"       "
setVar $BOT~help[4]  $BOT~tab&" mooxmasup [turnsstop] [dumpplanet] {guard} {figs} {ephag} {paranoid}"
setVar $BOT~help[5]  $BOT~tab&"       "
setVar $BOT~help[6]  $BOT~tab&" Options:"
setVar $BOT~help[7] $BOT~tab&"	   [turnsstop]     Pimps till it hits this limit"
setVar $BOT~help[8]  $BOT~tab&"    {figs}          Will top up figs to max"
setVar $BOT~help[9]  $BOT~tab&"    {guard}       Ensures corp planet at SD to invoke Guardian"
setVar $BOT~help[10]  $BOT~tab&"                   combat odds. Ship: You'll Shoot You're Eye Out"
setVar $BOT~help[11]  $BOT~tab&"    {ephag}       Default is NEG but set to use EP Haggle"
setVar $BOT~help[12] $BOT~tab&"    {paranoid}        Limpets must be in all incoming sectors"
setVar $BOT~help[13] $BOT~tab&"    Auto refurbs - requires fed safe"
setVar $BOT~help[14] $BOT~tab&"    Stores sectors to go back to when script reruns."
setVar $BOT~help[15] $BOT~tab&"    AUTOCLEANUP if planets above 3500 to avoid bans!"

gosub :bot~helpfile

setVar $BOT~script_title "Moo XMas - Lets bring on the festivities!"
gosub :BOT~banner

gosub :player~quikstats
setvar $startcredits $player~credits
setvar $startturns $player~turns

# stop when turns drop below this number. It checks at the end of a sector


setVar $turn_limit $bot~parm1
isNumber $number $turn_limit

if ($number <> 1)
	setvar $switchboard~message "Please select what turns to halt at.*"
	gosub :switchboard~switchboard
	halt

end
setVar $dump_planet $bot~parm2
isNumber $number $dump_planet

if ($number <> 1)
	setvar $switchboard~message "Please select planet in sector to dump on.*"
	gosub :switchboard~switchboard
	halt

end


getWordPos $bot~user_command_line $pos "guard"
if ($pos > 0)
	setVar $useGuard TRUE
	setvar $switchboard~message "Creating a corp planet at SD.*"
else
	setVar $useGuard FALSE
	setvar $switchboard~message "Not Creating Guardian Planets.*"
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


getWordPos $bot~user_command_line $pos "ephag"
if ($pos > 0)
	setVar $useEp TRUE
	setvar $switchboard~message "Using Ep Haggle*"
else
	setVar $useEp FALSE
	setvar $switchboard~message "Using internal NEG for haggle.*"
end
gosub :switchboard~switchboard


getWordPos $bot~user_command_line $pos "paranoid"
if ($pos > 0)
	setVar $bot~parmanoid TRUE
	setvar $switchboard~message "We are going full spooked mode*"
else
	setVar $bot~parmanoid FALSE
	setvar $switchboard~message "Incoming sectors just need figs*"
end
gosub :switchboard~switchboard

setvar $_CK_PTRADESETTING  100
saveVar $_CK_PTRADESETTING


setVar $minOre 140 
setVar $planet~planetsPopped 0
setVar $planet~planetsPoppedGood 0

setVar $cashMade 0
setVar $updateCount 1

window moo 170 94 "Moo Master" 
setvar $stuff "Planets Made: " & $planet~planetsPopped & "*Good Planets: " & $planet~planetsPoppedGood & "*Cash:" & $cashMade & "* Cash:" & $cashMade
setWindowContents moo $stuff

setVar $startingFighters 0
setVar $safeFighters 0


setVar $setVarPlanetType1 "Snowball"
setVar $setVarPlanetType2 "Silent"
setVar $setVarPlanetType3 "CANDYCANE"
setVar $setVarPlanetType4 "Red Rider"
setVar $setVarPlanetType5 "Jack Frost"

setVar $useSwath 0

setVar $planet~planetsInSector 0
setVar $planet~planets 0
setVar $planet~planeti 1

# number of planets we want in the sector
setVar $planet~planetsInSectorReq 1
setVar $planet~planetsInSectorFAil 0

setVar $percmintostart 90
setVar $sectorfile "ports.txt"
setVar $percTradeToo 15

setVar $planet~planetsCreated 0
setVar $dumpCashOnPlanet 25000000

setVar $surroundedSectorsOnly 1


setVar $sectors 0
setVar $sectorsOk 0
setVar $sectorsOki 1
setVar $sectorsNoFig 0
setVar $sectorsNoFigi 1


setVar $startSectors 0
setVar $starti 1



# only go to ports with this much
setVar $minTrade 900

#amount to leave on the port
setVar $minAmount 300

#blast ALL planets afterwards
setVar $cleanUp 1
#blast Planets above sector max planets afterwards
setVar $cleanUpTop 0
# Number of planets edit allows
setVar $planet~planetsAllowed 4

//if clean up stop is on, it'll blow the amount of plantes in "Cleanup amount"
setVar $cleanupStop 0
setVar $cleanupAmount 150
setVar $cleanupCount 20


#buy fuel at dock - VID KIDs
setVar $dockFuel 0
setVar $dockFuelMin 160

#get ore off planet if settnigs allow it
setVar $planet~planetOreOk 1


#take planet  - not implemented but add?
setVar $takePlanet 1


gosub :player~quikstats

if ($player~photons > 0)
	setVar $SWITCHBOARD~message "Yeah Nah, we don't do this with photons.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

setVar $stardock $MAP~STARDOCK

# if we shoot $maxTorpBetweenRefresh torps and get no servible planets, then we need to refresh all planets and start again
setVar $maxTorpBetweenRefresh 25
setVar $torpPopCount 0

setVar $scriptName "MooXmasUp.ts"


listActiveScripts $scripts
setVar $a 1
setVar $c 0

while ($a <= $scripts)
echo $scripts[$a] "*"
	if ($scripts[$a] = $scriptName)
		#stop $scripts[$a]
		add $c 1
		
		#return
	end
	add $a 1
end

if ($c > 1)
	echo "Script running multiple times: kill all!"
	stop $scriptName
	stop $scriptName
	halt
end

setVar $cashDumpPlanet $dump_planet
setVar $cashDumpSector 0
if ($dumpCashOnPlanet > 0)
	


	

	setVar $planet~planetsInSector 0
	setVar $planet~planets 0
	setVar $planet~planeti 1
	goSub :reCheckPlanets
	waitfor "Command ["
	
	setVar $found 0
	setVar $i 1
	while ($i <= $planet~planetsInSector)

		if ($planet~planets[$i] = $cashDumpPlanet)
			setVar $found 1
		end
		add $i 1
	end

	if ($found = 0)
		setvar $switchboard~message "Dump planet:" & $cashDumpPlanet & " not in sector.*"
		gosub :switchboard~switchboard
		halt
	end

	setVar $cashDumpSector CURRENTSECTOR
	send "l"
	waitfor "Land on which planet"
	send $cashDumpPlanet "*"
	waitfor "Planet command"
	send "mnt**q"
	waitfor "lasting off from"


	setVar $startingFighters $player~FIGHTERS
	setVar $safeFighters $player~FIGHTERS/2
	#setVar $safeFighters 50000
end


if ($usefile = 1)
	## FILE FUNCTIONS
	if ($sectorfile <> "")
		fileExists $exists $sectorfile
	  
		if ($exists)
			setVar $readi 1
			read $sectorfile $sector $readi
		
			while ($sector <> EOF)
			
				setVar $sectors[$readi] $sector
				add $readi 1
				read $sectorfile $sector $readi
			 end
		end
	else
		echo "*##### CAN NOT FIND SECTOR FILE: " $sectorfile
		halt
	end
else
	setPrecision 0
	 setVar $i 11
	setVar $readi 1
	 while ($i <= SECTORS)
	 
		if (PORT.EXISTS[$i] = 1)
		
			if (PORT.BUYFUEL[$i] = 1)
			
				 setVar $onhand PORT.FUEL[$i]
				 setVar $perc PORT.PERCENTFUEL[$i]
				 
				 if ($perc = 0)
					setVar $totalFuel 0
				 elseif ($perc < 100)
					 setPrecision 2
					setVar $totalFuel ($onhand/($perc/100))
					setPrecision 0
				 else
					setVar $totalFuel $onhand
				 end

				 if ($totalFuel > 62000)
					setVar $sectors[$readi] $i
					add $readi 1
				 end
			end
		end
		add $i 1
	end

end

setVar $loopi 1
send "c"
waitfor "<Computer activated>"
while ($loopi < $readi)
	send "r" $sectors[$loopi] "*"
	add $loopi 1
end
send q
waitfor "<Computer deactivated>"

setVar $loopi 1

setVar $noLimpets 0
setVar $noFigs 0

while ($loopi < $readi)
	setVar $portOk 0
	setVar $ftrOk 0
	
	setVar $sector $sectors[$loopi]
	
	if (PORT.BUYFUEL[$sector] = 1)
		if (PORT.FUEL[$sector] > $minTrade)
			if (PORT.PERCENTFUEL[$sector] > $percmintostart)
				setVar $portOk 1
		
			end
			
		else
			
		end
	end
	getSectorParameter $sector "FIGSEC" $hasFig
	if ($hasFig = 1)
		setVar $ftrOk 1
	end
	
	if (($ftrOk = 1) and ($portOk = 1))
		if ($surroundedSectorsOnly = 1)
		
			setVar $i 1
			setVar $danger 0
			setVar $ldanger 0
			while ($i <= SECTOR.WARPINCOUNT[$sector])
				getSectorParameter SECTOR.WARPSIN[$sector][$i] "FIGSEC" $hasFig
				if ($hasFig = 0)
					setVar $danger 1
				end
				add $i 1
			end
			if ($bot~parmanoid = TRUE)
				setVar $i 1
				
				while ($i <= SECTOR.WARPINCOUNT[$sector])
					getSectorParameter SECTOR.WARPSIN[$sector][$i] "LIMPSEC" $hasFig
					if ($hasFig = 0)
						setVar $ldanger 1
					end
					add $i 1
				end

			end

			if (($danger = 0) and ($ldanger = 0))
				setVar $sectorsOk[$sectorsOki] $sector
				add $sectorsOki 1
			else
				if ($danger = 1)
					echo "*## Slipping Sector - Incoming Warps aren't figged" $sector
					
					add $noFigs 1
				end
				if ($ldanger = 1)
					echo "*## Slipping Sector - Incoming Warps missing limpets" $sector
					add $noLimpets 1
				end
				
			end	
		else

			setVar $sectorsOk[$sectorsOki] $sector
			add $sectorsOki 1
		end
		
	end
	if ($ftrOk = 0)
		setVar $sectorsNoFig[$sectorsNoFigi] $sector
		add $sectorsNoFigi 1
	end 

	add $loopi 1
end

setVar $sectorNoFigsReport ""

if ($sectorsNoFigi > 1)
	echo "**############# PORTS MISSING FIGHTERS8**"
	setVar $i 1
	while ($i < $sectorsNoFigi)
		echo "*# " $sectorsNoFig[$i]
		setVar $sectorNoFigsReport  $sectorNoFigsReport & $sectorsNoFig[$i]
		add $i 1
	end

end
setVar $loopi 1

echo "###" SECTORS GOOD TO GO " ###**" 
while ($loopi < $sectorsOki)
	echo "*" $sectorsOk[$loopi]
	
	add $loopi 1
end


	setVar $startmsg "We are visiting " & $sectorsOki & " sectors with maxed ports."
	if ($sectorsNoFigi > 1)
		setVar $startmsg $startmsg & "*There are " & $sectorsNoFigi  & " ports with no fighters."
		setVar $startmsg $startmsg & "*" & $sectorNoFigsReport
	end
	if ($noFigs > 1)
		setVar $startmsg $startmsg & "*There are " & $noFigs  & " ports missing incoming fighters."
	end
	if ($noLimpets > 1)
		setVar $startmsg $startmsg & "*There are " & $noLimpets  & " ports missing incoming Limpets."
	end
	setVar $startmsg  $startmsg & "*Dumping cash on planet: " & $cashDumpPlanet
	setVar $startmsg  $startmsg & "*Stopping at turns: " & $turn_limit
	
	setVar $startmsg $startmsg & "*Send a Eng age!!! without the space to engage.*"
		

	setVar $SWITCHBOARD~message $startmsg
	gosub :SWITCHBOARD~switchboard


	setVar $stat_targets $sectorsOki
	waitfor "Engage!!!"


if ($player~ALIGNMENT < 1000)
	setVar $SWITCHBOARD~message "MooXmas - You're just not good enough for this script (alignment).*"
	gosub :SWITCHBOARD~switchboard
	halt
end

getRnd $rNum 10000 99999 
setVar $planet~planetName $player~ship_number  & $rNum




setVar $loopi 1
    while ($loopi < $sectorsOki)
	setVar $sector $sectorsOk[$loopi]	
	setSectorParameter $sector "MOOPORT" "1"

	setVar $moveOk 1
	if ($dumpCashOnPlanet > 0)
		gosub :player~quikstats
		if ($player~CREDITS > $dumpCashOnPlanet)
		    send "m" $cashDumpSector "*y"
		    waitfor "All Systems Ready, shall we engage?"
		    send "y"
		    waitfor "TransWarp Drive Engaged!"
		    send "l" & $cashDumpPlanet&"* t n t 1 * C"
		    send "TT"
		    waitfor "credits, and the Treasury"
		    setVar $line CURRENTLINE
		    getWord $line $credsmade 3
		    striptext $credsmade ","
		    subtract $credsmade 1000000
		    if ($credsmade >= 1)
		       send $credsmade & "*"
		       send "QQ"
		    else
		       send "*QQ"
		    end
		    waitfor "Blasting off from"
		end
		
		gosub :moveNextSector
		
	else
		gosub :moveNextSector
	end
	
	if ($moveOk = 0)
		goto :endloop
	end


	setVar $upgradesFound 0
	gosub :checkPlanetsSafeInSector

	if ($upgradesFound = 1)
		echo "*###############################"
		echo "*######### CITADEL FOUND MOVING ON"
		echo "*###############################"
		goto :endloop
	
	end

	
	:imstilltradingyeahyeahyeah
	setVar $planet~planetsInSector 0
	setVar $planet~planets 0
	setVar $planet~planeti 1
	
	# BLAST EXISTING PLANETS - may take extra damage first run
	
echo "*Entering check"
	# this will get all the planets
	gosub :reCheckPlanets
	waitfor "Command ["
	
echo "*# $planet~planeti " $planet~planeti

	setVar $i 1
	while ($i < $planet~planeti)
		setVar $shipBlastPlanet $planet~planets[$i] 
		goSub :blastPlanet 
		add $i 1
	end
echo "*## quik stats"
	setVar $planet~planetsCreated 0
	setVar $findPlanetName 0
	
	gosub :player~quikstats

	setVar $inMakePlanet 0

	:tryBuildAgain
	goSub :buildPlanet
	

	:planetBlast
		
		setTextLineTrigger planetBlast1 :planetBlast1 $setVarPlanetType1
		setTextLineTrigger planetBlast2 :planetBlast2 $setVarPlanetType2
		setTextLineTrigger planetBlast3 :planetBlast3 $setVarPlanetType3
		setTextLineTrigger planetBlast4 :planetBlast4 $setVarPlanetType4
		setTextLineTrigger planetBlast5 :planetBlast5 $setVarPlanetType5
		setTextLineTrigger planetBlastDone :planetBlastDone "Should this be a (C)orporate planet or (P)ersonal planet?"
		pause
		
		:planetBlast5	
		:planetBlast1
		:planetBlast2
		:planetBlast3
		:planetBlast4

			killAllTriggers
			setVar $goodPlanet 1
			setVar $torpPopCount 0
			add $planet~planetsPoppedGood 1
			goto :planetBlastComplete
			
		:planetBlastDone
			killAllTriggers
			setVar $goodPlanet 0
			add $torpPopCount 1
			waitfor "Command ["
			gosub :reCheckPlanets
			waitfor "Command ["
	
			setVar $shipBlastPlanet $planet~planets[1]
echo "**### DEBUG $shipBlastPlanet " $shipBlastPlanet
			goSub :blastPlanet 
			goto :tryBuildAgain


	:planetBlastComplete
	
	gosub :reCheckPlanets

	setVar $tradePlanet $planet~planets[1]
	setVar $tradeOre 0
	setVar $tradeOrg 0
	setVar $tradeEquip 0
	goSub :planetTrade

	send "cr*q"
	waitfor "<Computer deactivated>"
	
	setVar $contAmount ($minAmount + 200)
	if (PORT.PERCENTFUEL[CURRENTSECTOR] < $percTradeToo)
		goto :theEndNextSector
	end

	if (PORT.FUEL[CURRENTSECTOR] > $contAmount)
		
		goto :imstilltradingyeahyeahyeah
	
	end


	:theEndNextSector

	gosub :player~quikstats

	if ($player~TURNS < $turn_limit)
		setvar $switchboard~message "Hit our turn limited; stopping.*"
		gosub :switchboard~switchboard
		goto :goHomeandhalt
		
	end
	
	:endloop
	add $loopi 1
	
    end

:goHomeandhalt
 send "* * * "
    send "m" $cashDumpSector "*y"
    waitfor "All Systems Ready, shall we engage?"
    send "y"
halt


:reCheckPlanets

	

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
		goto :goHomeandhalt
		halt

	:checkDockThereYes
		killalltriggers


return

:restock
	
	gosub :player~quikstats
	send "d"
	waitfor "Warps to Sector(s) :"

	setVar $returnSpot CURRENTSECTOR

	if ($player~FIGHTERS < $safeFighters)
		send "m" $cashDumpSector "*y"
		waitfor "All Systems Ready, shall we engage?"
		send "y"
		waitfor "TransWarp Drive Engaged!"
		send "l" & $cashDumpPlanet&"*mnt*tnt1*q"
		
		waitfor "Blasting off from"
		
	end
	
	goSub :checkDockThere
	
	add $stat_refurbs 1
	
	
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
echo "*# DEBUG $restockMakePlanet " $restockMakePlanet	
	send "m" $stardock "*y"
	waitfor "Locating beam pinpointed, TransWarp"
	send "y  "
	
	send "p   s"
	goSub :limpetCheck
	send "h"
		send "t"
		setTextTrigger shipCheckBuyTorps :shipCheckBuyTorps "How many Genesis Torpedoes do you want"
		pause
		:shipCheckBuyTorps
			killalltriggers
			getWord CURRENTLINE $TorpssAvail 9
			stripText $TorpssAvail ")"
			
			send $TorpssAvail "*"

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
			

	send "qqq    *   "
	if ($restockMakePlanet = 1)
		send "u   y  n  .  n  *  c * *  "
	end
	send "m  " $returnSpot  "*   y   y  "
	
	setTextLineTrigger restockBack1 :restockBack1 "<Set NavPoint>"
	setTextLineTrigger restockBack2 :restockBack2  "Systems Ready, shall we engag"
	pause
		:restockBack1
			killalltriggers
			send "q * Q * * pss"
			setVar $SWITCHBOARD~message "Failed to leave dock!! Hopefully on dock..*"
			gosub :SWITCHBOARD~switchboard
			halt	

		:restockBack2
			killalltriggers
	
return





:limpetCheck
		setTextTrigger limpetchecky :limpetchecky "A port official runs"
		setTextTrigger limpetcheckn :limpetcheckn "StarDock> Where to?"
		setTextTrigger dockgone1 :dockgone1 "Scanners indicate massive debris and heavy"
		setTextTrigger dockgone2 :dockgone2 "aptain! Are you sure you want to port her"
		
		pause
		:dockgone1
		:dockgone2
			send " n * * *  n 1 y y "
			echo "*############################################"
			echo "*############################################"
			echo "*#### DOCK HE GONE... GONE GONE GONE halting.."
			echo "*############################################"
			echo "*############################################"
			halt
			

		:limpetchecky
			killalltriggers
			send "y"
			return
		:limpetcheckn
			killalltriggers
			return

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
	
	
	setvar $_ck_pnego_current_sector $player~CURRENT_SECTOR
	saveVar $_ck_pnego_current_sector 

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


:buildPlanet
	
	:buildPlanetAgain
	setVar $goodPlanet 0
	setVar $firstPlanetCreatedInSector 0
	send "uyn.*p"
	
	setTextLineTrigger buildPlanet1 :buildPlanet1 "You don't have any Genesis Torpedoes to launch!"
	setTextLineTrigger buildPlanet2 :buildPlanet2 "For building this planet you receive"
	
	pause

	:buildPlanet1
		killAllTriggers
		setVar $goodPlanet 0
		send "*"
		gosub :restock
		goto :buildPlanetAgain
		
	:buildPlanet2
		killAllTriggers
		add $stat_torps 1

	add $planet~planetsPopped 1

return



:updateStats
	setvar $stuff "Planets Made: " & $planet~planetsPopped & "*Good Planets: " & $planet~planetsPoppedGood & "*Cash:" & $cashMade & "* Cash:" & $cashMade
	setWindowContents moo $stuff
	add $updateCount 1
	if ($updateCount > 20)
		setVar $updateCount 1
		send "'Moo Update - Planets: " $planet~planetsPoppedGood "/" $planet~planetsPopped " Cash: " $cashMade "*"
	end
return




:checkPlanetsSafeInSector

	send "l*"
	setVar $startLogging 0
	setVar $upgradesFound 0

	:checkPlanetsSafeInSectorWait
	setTextLineTrigger checkPlanetsSafeInSectorNoPlanet :checkPlanetsSafeInSectorNoPlanet "There isn't a planet in this sector."
	setTextLineTrigger checkPlanetsSafeInSectorNoPlanetstart :checkPlanetsSafeInSectorNoPlanetstart "------------------------------------------------------------------------------"
	setTextLineTrigger checkPlanetsSafeInSectorPlanet :checkPlanetsSafeInSectorPlanet "<"
	setTextTrigger checkPlanetsSafeInSectorFinish :checkPlanetsSafeInSectorFinish "Land on which planet"
	pause
	:checkPlanetsSafeInSectorNoPlanetstart
		killAllTriggers
		setVar $startLogging 1
		goto :checkPlanetsSafeInSectorWait
	:checkPlanetsSafeInSectorNoPlanet
		killAllTriggers
		goto :checkPlanetsSafeInSectorFinishWait
	:checkPlanetsSafeInSectorPlanet
		killAllTriggers 
		if ($startLogging = 1)
			
			getWord CURRENTLINE $endcheck 1
			if ($endcheck = "Land")
				goto :checkPlanetsSafeInSectorFinish
			end
			cutText CURRENTLINE $planet~planetdata 46 999
			echo "*#" $planet~planetdata "#"
			getWord $planet~planetdata $firstword 1
			if ($firstword = "Level")
				echo "*# ALERT ALERT LAERT #"
				
				setVar $upgradesFound 1
			end
		end
		goto :checkPlanetsSafeInSectorWait

	:checkPlanetsSafeInSectorFinish
		killAllTriggers

	:checkPlanetsSafeInSectorFinishWait
return
	

:moveNextSector

	getDistance $dist CURRENTSECTOR $sector
	if ($dist = 1)
		send "m" $sector "*"
		waitfor "To which Sector"
		waitfor "Command ["
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
			send "n"
			waitfor "TransWarp Drive shutting down."
			
			goto :theEndNextSector
		:moveSectorGood
			send "y"
		:moveSectorGood2
			killAllTriggers

		waitfor "TransWarp Drive Engaged!"
		waitfor "Warps to Sector(s)"
		send "f1*cd"
		if (PORT.BUYFUEL[CURRENTSECTOR] = 0)
			send "pt**"
			waitfor "do you want to buy"
			waitfor "You have"
			#waitfor "Do you want instructions"
			#waitfor "Command ["
			setVar $buyOre 0
		end
	
	end
	gosub :player~quikstats
	if (PORT.BUYFUEL[CURRENTSECTOR] = 0)
		if ($player~ore_holds < 120)
			send "pt**"
			waitfor "do you want to buy"
			waitfor "You have"
		end
	end
return



:blastPlanet 

	:blastblastblast
	send "l" $shipBlastPlanet "*zdy *"
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
	subtract $player~creditsNow $precredits
	add $stat_dollarsgross $player~creditsNow
	
	

return

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\planetneg\planet"
