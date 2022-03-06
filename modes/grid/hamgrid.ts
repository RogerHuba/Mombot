
# TO DO 
# - When we go to pwarp, ftr not present, re-calculate
# - other passenger can't deploy limpets, usually to many or none. need to manage their limps
#	in this scenario, QSS Them, and balance with our limpets via using climp command?
# - Safe-ReStock - goes home, but doesn't ensure no limpet?
# - Option to swap ships and have corpie with no turns to do clearances. That way if they get photoned, it doens't matter!
#		- does this include disrupting?
#		- idea being that driver has no turns, can do clearances etc, and other grids
# - Need to grab the next sector density sooner after landing.. i.e. if we know we are continuing, do it right after pgrid
#		pgrid success - lift and scan, store sector + den, when we do next check, if same sector use original

# Curious what happens if someone plocks - test

# ship switching, move on to next port if out range
#   - milking - only milk 10 at a time, and re-work back, keeping 5-10 being milked
#   - keep cannon at level

#
#   - add a 'clean up while moving' - so one step at at time. Check for adjacent holes, if safe, disrupt mines/drop mines
#   - passive options - include grid + Twarp back



 #                                         ADDED DESTORY PORTS - TEST
setVar $destroyports 0
setVar $destroyportsBot "ham"


# 0 = we use file list, 1 we use the subroutine :getNextTarget
setVar $nextSectorUseSearch 1

# jumpback - idea is you grid one in, find a random nearby, grid forward again
setVar $jumpBack 0
setVar $jumpBackNext 0

# minore to stop at - set to 0 to ignore
setVar $minPlanetOre 250000

// Will grid onto non-shielded planets
setVar $shieldedDangerOnly 1
setVar $shieldedSeen 0
setVar $holoData 0

// XPORTGRID
// roger pgrid 4399 d:105  x:24 scan
setVar $xportShip 0
#37

//The poor sap "going in" on pgrid
setVar $pgridBot "gman"
//The person running saveme - usally the passPerson/driver
setVar $savemeGuy "ham"


setVar $iampgridder 0
// Look for options to grid adjacent sectors that are safe
setVar $passiveGrid 0
// Only Passive forward
setVar $passiveForwardOnly 1

// This person will bring planet back
setVar $passivedriver "ham"
// Person running the script, always ham - Also for disrupting/refueling etc, always SCript owner
setVar $passivePerson "ham"

// Just chip one off each target so we can't be predicated - NOT WITH JUMPBACK
setVar $milkTargets 1
// Below not implemented but tricky. We need to holo and confirm alien ftrs, then when wwe move need to see our mines/limpets if they were present
setVar $milkTargetsContinueIfSafe 1

// Skip Skips, so instead of halting and waiting, just log and keep going when we find something odd (i.e. afk mode)
setVar $skipSkips 1

// Skip Same ORigin, so if next sector we leave from same origin, move on. This is to avoid people who are trying to block path
// with planet
setVar $doNotUseSameOrigin 0

// Skip warping the planet closer pgrid or warp one hop at a time - idea being we "walk" the path there and griding any gaps
setVar $skipPlanetWarp 0

// We require at least one of the following to skip a sector - could be ftr, or (ftr or mine or limpet )
//		all 1's means any of the following means we'll skip going there.
//		all 0's means you will ALWAYS re-take it, what the point man?
setVar $clearedReqFtr 1
setVar $clearedReqMine 0
setVar $clearedReqLimpet 0

//When to Holo?
//	There was/is an option to hit figs where the corp isn't present? for instance aliens, so always holo
//	In competitive games with low turns, we could set it to 495, that way we avoid running into planets but 
//	attack everything else - should save turns.
//	if game has a lot of aliens it might mean we get false positives when "milking"
//	Other issue is if we hit corp 1 ftr, we can safely hit corp 2 ftr, do we want to do that logic?

//set to zero to always holo
setVar $noHoloMaxDensity 150

//Max ftrs we will auto grid over - otherwise we mark as danager and either skip or wait for prompt
setVar $nextSectorFigsDanger 6000

// i.e. got back and fire disrupters1
setVar $disruptMines 0
// Fire them before entering - and get torp'd!
setVar $disruptMinesFirst 0

// exit to clear
setVar $clearLimpets 1

// Scrub limpets - corpie drops personal limpet, we scrub - same sector
setVar $scrubLimpets 1

//Safe scrub moves planet to place we have surrounded - so we can't get photoned in V2 when we exit - not easy but possible
//	
//However we have option to disrupt mines
setVar $safeScrubLimpets 0
// Before doing safe scrub, we'll disrupt mines on the way out - safe
setVar $safeScrubLimpetsDisrupt 0



#Log Anomloies
#new limpets at end point command

setVar $deployLimpets 1
setVar $deployMines 0
setVar $deployFighters 1
setVar $deployFightersType "d"
setVar $deployFightersOwner "c"
// 
// Moves planet home - if we aren't scrubing and we use this, currently our base will get found??
// i.e. we really need to scrub regardless of this option
setVar $saferestock 0

// - Any density greater than this gets logged in $densityfile
setVar $densityFileMin 495

# after gridding/clearing - we pause a while to not trigger scripts
setVar $doLongPause 1
setVar $delaySmall 500
setVar $delayLong 1500

#coudl make this a percentage of ftrs in the setting file - make more sense? though depends on gridder..
setVar $shipPlanet 0
setVar $shipRestockSector 0




// Check if ports are upgraded and log
setVar $logPorts 1
setVar $pf 0
setVar $po 0
setVar $pe 0

setVar $sectorHadNoEnemy 0

setVar $safeSectorDensity 495
# only twarps to sectors with our limpets, then limpets to othe sectors
setVar $safeWarp 1

# Stats
setVar $StatTargetSectors 0
setVar $StatSectorsApproached 0
setVar $StatsectorsPgridded 0
setVar $StatsectorsPassiveGridded 0
setVar $StatsectorsSkipped 0
setVar $StatTargetsReached 0

setVar $StatminesDeployed 0
setVar $StatlimpetsDeployed 0
setVar $StatdisruptersUsed 0
setVar $Statrestocked 0
setVar $Statexits 0

setVar $statsUpdated 1

window planetGridder 300 300 "Planet Gridder" 
setvar $stuff "Target Sectors: " & $StatTargetSectors & "*Sectors Approached: " & $StatSectorsApproached & "*Sectors PGridded:" & $StatsectorsPgridded
setVar $stuff $stuff & "*Sectors Pass Grid:" & $StatsectorsPassiveGridded & "*Sectors Skipped:" & $StatsectorsSkipped & "*Targets Reached:" & $StatTargetsReached & "** Mines Deployed:" & $StatminesDeployed & "* Limpets Deployed:" & $StatlimpetsDeployed 
setVar $stuff $stuff & "*Disrupters Fired:" & $StatdisruptersUsed & "*Times Restocked:" & $Statrestocked & "*Times exited:" & $Statexits & "*  "
setWindowContents planetGridder $stuff



setVar $ferrengiAutoKill "the Ferrenxxgi"

setVar $sectorList "searchl.txt"
setVar $killList "killlist.txt"
setVar $checkFile "checkfile.txt"
setVar $portlog "portlog.txt"
setVar $densityfile "densitycheck.txt"

setVar $adjacentMines 0
setVar $passDeploy 0

# Only checks for corp... not the best!
setVar $whosOnline 0
setVar $whosOnlinei 0
setVar $aliens 0
setVar $alieni 0
setVar $yourCorp 0
# we'll auto go in and kill this amount
setVar $alienAttackThreshold 5000

setVar $targetsAdded SECTORS

# Stop 1.ts if it is running
listActiveScripts $scripts
setVar $a 1
setVar $c 0

while ($a <= $scripts)
echo $scripts[$a] "*"
	if ($scripts[$a] = "Hammer_PlanetGridderFromList.ts")
		#stop $scripts[$a]
		add $c 1
		
		#return
	end
	add $a 1
end

if ($c > 1)
	echo "Script running multiple times: kill all!"
	stop "Hammer_PlanetGridderFromList.ts"
	stop "Hammer_PlanetGridderFromList.ts"
	halt
end
send "v"
waitfor "located in sector"

getWord CURRENTLINE $sd 7


send "cv" $sd "*q"

gosub :checkAliens
gosub :checkEnemy
goSub :quikStats

#make this a setting but ask for now
send "lq*"
waitfor "eparing ship to land on planet"
waitfor "Command ["
:getPlanetNumber
getInput $shipPlanet "Enter the planet number we will drive:"

isNumber $isnum $shipPlanet 
if ($isnum = 0)
	echo "Planet must be a number!"
	goto :getPlanetNumber
end
setVar $shipRestockSector CURRENTSECTOR


gosub :nearfig_inc~fig_list


setVar $figfile GAMENAME & "_FIGLIST.txt"
fileExists $figlchk $figfile
if ($figlchk = 1)
	read $figFile $lastrefresh 1
	
	setArray $figList SECTORS
	
	setVar $flcnt 2
	:rdfgfl
	read $figfile $fs $flcnt
	if ($fs <> "EOF")
		setVar $figList[$fs] 1

		
		add $flcnt 1
		goto :rdfgfl
	end
end

gosub :nearfig_inc~mine_list

setVar $figfile GAMENAME & "_MINELIST.txt"
fileExists $figlchk $figfile
if ($figlchk = 1)
	read $figFile $lastrefresh 1
	
	setArray $mineList SECTORS
	
	setVar $flcnt 2
	:rdmnfl
	read $figfile $fs $flcnt
	if ($fs <> "EOF")
		setVar $mineList[$fs] 1

		
		add $flcnt 1
		goto :rdmnfl
	end
end

gosub :nearfig_inc~limpet_list

setVar $figfile GAMENAME & "_LIMPETLIST.txt"
fileExists $figlchk $figfile
if ($figlchk = 1)
	read $figFile $lastrefresh 1
	
	setArray $limpetList SECTORS
	
	setVar $flcnt 2
	:rdlmfl
	read $figfile $fs $flcnt
	if ($fs <> "EOF")
		setVar $limpetList[$fs] 1

		
		add $flcnt 1
		goto :rdlmfl
	end
end

readToArray $sectorList $sectors

setVar $StatTargetSectors 0
setVar $i 1
while ($i < $sectors)
	if ($figList[$sectors[$i]] = 0)
		#add $StatTargetSectors 1
	end
	if ((($clearedReqFtr = 1) and ($figList[$sectors[$i]] = 1)) or (($clearedReqMine = 1) and ($mineList[$sectors[$i]] = 1)) or (($clearedReqLimpet = 1) and ($limpetList[$sectors[$i]] = 1)))
		#not a target
	else
		add $StatTargetSectors 1
	end
	add $i 1
end

setVar $xportShipSector 0

if ($xportShip > 0)
	
	setVar $xportShipFound FALSE
	goSub :getXportShipSector

	if ($xportShipFound = FALSE)
		send "'Could not find xport ship in shipscan*"
		
	else
		send "c;q"
		setTextLineTrigger shipXport :shipXport "Transport Range:"
		pause
		:shipXport
		killAllTriggers
		getWord CURRENTLINE $xportRange 6
	end
end



send "l" $shipPlanet "*mnt*c"

setTextTrigger planetNoShields :planetNoShields "Planet command"
setTextTrigger planetShields :planetShields "Planetary Defense Shielding Power Level"
pause
:planetShields
	killalltriggers
	getWord CURRENTLINE $shields 8
	echo $shields
	if ($shields < 200)
		echo "*######################################"
		echo "* ### PLANET HAS NO SHIELDS"
		echo "*######################################"
		halt
	end
	goto :doneshieldcheck
:planetNoShields
	echo "*######################################"
	echo "* ### PLANET HAS NO SHIELDS ARe you suRE?"
	setDelayTrigger delay :noshieldspause 5000
	pause
	:noshieldspause
	killalltriggers

:doneshieldcheck



send "'" $savemeGuy " saveme on*"
waitfor "Saveme - Running from planet"
setDelayTrigger savemepause :savemepause 2000
pause
	:savemepause

setVar $go 1
setVar $si 1
setVar $getFuel 0
setVar $foundTarget 0

setVar $milkedSectors 0

while ($go = 1)
	
	:newSector
	setVar $jumpBackNext 0

	setVar $nn 1
	while ($nn <= 6)
		setVar $nDensity[$nn] 0
		add $nn 1
	end
	
	setVar $isAlien 0
	setVar $stopCheck 0
	setVar $toSector 0
	if ($si > $sectors)
		setVar $si 1
		if ($foundTarget = 0)
			echo "*#####################################"
			echo "*#####################################"
			echo "*#####################################"
			echo "*#####################################"
			echo "*#####################################"
			echo "*#####################################"
			echo "*#####################################"
			echo "*#####################################"
			echo "*#####################################"
			echo "*#####################################"
			echo "*#####################################"
			echo "*#####################################"
			echo "*#####################################"
			echo "*## NO VALID TARGETS ###"
			halt
		end
		setVar $foundTarget 0
	end
#	getInput $toSector "Enter the sector we are going to:"
	setVar $toSector $sectors[$si]
	add $si 1
# this needs working on
	if ($nextSectorUseSearch = 1)
		setVar $si 1
		gosub :getNextTarget
	else

		if ((($clearedReqFtr = 1) and ($figList[$toSector] = 1)) or (($clearedReqMine = 1) and ($mineList[$toSector] = 1)) or (($clearedReqLimpet = 1) and ($limpetList[$toSector] = 1)))

			echo "**############################################"
			echo "*## To Sector : " $toSector
			echo "*## $figList : " $figList[$toSector]
			echo "*## $mineList : " $mineList[$toSector]
			echo "*## $limpetList : " $limpetList[$toSector]
			echo "*############################################"
			
			goto :newSector
		end
	end
	

	setVar $nearfig_inc~origsec $toSector
	gosub :nearfig_inc~closefig
	setVar $nearestFig $nearfig_inc~result
	
	if ($nearestFig = "-1")
		send "cf" CURRENTSECTOR  "*" $toSector "*q"
		waitfor "The shortest path"
		waitfor "Computer deactivated"

	end

	setVar $dist 0
	echo "DIST:" $dist "*"
	echo "CURRENTSECTOR:" $CURRENTSECTOR "*"
	echo "nearestFig:" $nearestFig "*"
	
	getDistance $dist CURRENTSECTOR $nearestFig 

	echo "*## getDistance : " $dist " " CURRENTSECTOR "  " $nearestFig
	if ($dist = "-1")
		if ($doNotUseSameOrigin = 1)
			echo "The nearest fighter is here*"
			echo "*#####################################################"
			echo "*### NEAREST SECTOR IS HERE!! DANGER USING SAME ORIGIN!"
			echo "*### Going to new sector "
			echo "*######################################################"
			add $StatTargetsReached 1
			goto :newSector
		end
	else
		if ($skipPlanetWarp = 0)
			setVar $planetWarpTo $nearestFig
			gosub :planetWarp
		end
	end
	setVar $foundTarget 1
	add $StatSectorsApproached 1
	goSub :pgridToSector
	
	if (CURRENTSECTOR = $toSector)
		add $StatTargetsReached 1
	end
	gosub :updateStats
	goSub :checkPlanetOre
	goto :newSector
	

end

:checkPlanetOre

	if ($minPlanetOre > 0)
		send "qdc"
		waitfor "-------  ---------  ---------  ---------  ---------  ---------  -------"
		setTextLineTrigger checkPlanetFuel :checkPlanetFuel
		pause
		:checkPlanetFuel
			killalltriggers
			getWord CurrentLine $pFuelAvail 6
			striptext $pFuelAvail ","
			if ($pFuelAvail < $minPlanetOre)
				send "'Planet low on fuel - refuel and hit put GO ! in subspace*"
				waitfor "GO!"
				send "'san disp*"
				waitfor "=-=-=-=-=| Display |=-=-=-=-=-=-=-"
				send "'san patp 1000 upgrade*"
				waitfor "Pay At The Pump - Completion Report"

			end
	end
return

:pgridToSector

	setVar $nextSector 0
	
	setVar $gridding 1
	while ($gridding = 1)

		if ($jumpBackNext = 1) and ($jumpBack = 1)

			send "s*"
			goSub :quikstats
			
			# double check next sector isn't a dead end - no point jumping back when we can just go straight in
			
			setVar $s 1
			while ($s <= SECTOR.WARPCOUNT[CURRENTSECTOR])
				if (SECTOR.WARPS[CURRENTSECTOR][$s] = $toSector)
					if (SECTOR.WARPCOUNT[$toSector] = SECTOR.WARPINCOUNT[$toSector]) and (SECTOR.WARPCOUNT[$toSector] = 1)
						if (SECTOR.WARPSIN[$toSector][1] = SECTOR.WARPS[$toSector][1])
							# it's a dead end - let's just go straigh in!
							setVar $jumpBackNext 0
					echo "*##############################################"
					echo "*####  NEXT SECTOR IS A DEAD END######"
					echo "*####### $jumpBackSector:" $jumpBackSector "*"
					echo "*####### NO NEED OT JUMP BACK *"	
					echo "*##############################################"
						else
							
						end
							
					end
				end
				add $s 1
			end
			if ($jumpBackNext = 1)
				setVar $jumpBackSector $toSector
				setVar $jumpBackReturnSector CURRENTSECTOR
		echo "*##############################################"
		echo "*####  FINDING JUMP BACK   ######"
		echo "*####### $jumpBackSector:" $jumpBackSector "*"
		echo "*####### $jumpBackReturnSector:" $jumpBackReturnSector "*"	
		echo "*##############################################"
		
				goSub :getJumpBack
				setVar $jumpBackNext 0

			end

		elseif ($jumpBackSector > 0)
			echo "*##############################################"
			echo "*####    RETURNINg AFTER JUMP BACK  ######"
			echo "*####### $jumpBackSector:" $jumpBackSector "*"
			echo "*####### $jumpBackReturnSector:" $jumpBackReturnSector "*"	
			echo "*##############################################"
			send "p"  $jumpBackReturnSector "*y"
			waitfor "lanetary TransWarp Drive Engaged"
			setVar $toSector $jumpBackSector
			setVar $jumpBackSector 0
			setVar $jumpBackNext 1
		elseif ($jumpBack = 1)
			setVar $jumpBackNext 1
		end
		setVar $nextNextSector 0
		setVar $sectorHadNoEnemy 0
		setVar $pgridDensityCheck 0
		gosub :densityScan
		
		gosub :getNextSector
		
		// Hammer set next sector density here

		setVar $skipGrid 0
		if ($skipPlanetWarp = 1)
			if ($figList[$nextsector] = 1)
				echo "*## NEXT SECOTR HAS A FIG, Skipping GRID"
				
				setVar $planetWarpTo $nextsector
				gosub :planetWarp
				setVar $skipGrid 1
				setVar $sectorHadNoEnemy 1
				
				if (1 = 2)
					send "s*"

					setVar $ai 1
					setVar $checkSector SECTOR.WARPSIN[$nextsector][$ai]
					
					setVar $noFigSectors 0
					while ($checkSector > 0)
						getSectorParameter $checkSector "FIGSEC" $isFigged
						if ($isFigged = FALSE)
							add $noFigSectors 0
						end
						add $ai 1
						setVar $checkSector SECTOR.WARPSIN[$nextsector][$ai]
					end
					if ($noFigSectors = 0)
						echo "all internals are ok, defuse?"
						#send "'kane disr*"

						# restock
					end
				end

			end
		else
			# we are meant to grid this but it has a fig already?! nearest error

			if ($figList[$nextsector] = 1)
				echo "*#######################################################"
				echo "*#######################################################"
				echo "*############### WE HAVE A FIG!! Skipping Grid #####################"
				echo "*#######################################################"
				echo "*#######################################################"
				setVar $planetWarpTo $nextsector
				gosub :planetWarp
				setVar $skipGrid 1
				if ($nextSector = $toSector)
					setVar $gridding 0
				end
				goto :passiveSkip
			end
		end
		if ($skipGrid = 0)

			if ($passiveGrid = 1)
				setVar $passiveNext 0
				gosub :checkPassiveOptions
				if ($passiveNext = 1)
			echo "**## going to passive next sector: " $nextSector

					send "'" $passivePerson " m " $nextSector " 1*"
					waitfor "Sector  :"
					send "'" $passivedriver " pwarp " $nextSector "*"
					waitfor "moved to sector"
					send "'" $passivePerson " land " $shipPlanet "*" 
					waitfor "} - In Cit - Planet"
					setVar $passDeploy 1
					gosub :deployStuff
					setVar $passDeploy 0
					if ($nextSector = $toSector)
						setVar $gridding 0
						
					end
					setVar $figList[$nextsector] 1
					setVar $nearfig_inc~origsec $nextsector
					gosub :nearfig_inc~hamAddFig
					echo "**## STILL GRIDDING: " $gridding
					add $StatsectorsPassiveGridded 1
					setVar $originSector $nextSector
					goto :passiveSkip
				end
			end
			
			setVar $skipCleanupDeploy 0
			gosub :moveCheck
			if ($skipCleanupDeploy = 1)
				#means enemy in sector and we should go to next target
				goto :newSector
			else
				if ($destroyports = 1)
					:checkDestroyPort
					if (PORT.EXISTS[CURRENTSECTOR])

						send "'" $destroyportsBot " kill port*"
						waitfor "Port Destroyed"
						send "s"
						waitfor "Warps to Sector(s) :"
					end
				end
			end
		end
		echo "##MILK:" $milkTargets "##*"
		if ($milkTargets = 1)
		//setVar $milkTargetsContinueIfSafe 1 

			send "s*"
			goSub :quikstats
			setVar $gridding 0
			# double check next sector isn't a dead end - may as well finish off if it's safe
			
			setVar $s 1
			while ($s <= SECTOR.WARPCOUNT[CURRENTSECTOR])
				if (SECTOR.WARPS[CURRENTSECTOR][$s] = $toSector)
					if (SECTOR.WARPCOUNT[$toSector] = SECTOR.WARPINCOUNT[$toSector]) and (SECTOR.WARPCOUNT[$toSector] = 1)
						if (SECTOR.WARPSIN[$toSector][1] = SECTOR.WARPS[$toSector][1])
							# it's a dead end - with no one way - lets go in
							setVar $gridding 1
							echo "*#######################################################"
							echo "*#######################################################"
							echo "*############### next sector dead end - continue#####################"
							echo "*#######################################################"
							echo "*#######################################################"
						else
							
						end
							
					end
				end
				add $s 1
			end

			if (($milkTargetsContinueIfSafe = 1) and ($sectorHadNoEnemy = 1))
				echo "*#######################################################"
				echo "*#######################################################"
				echo "*############### sector was safe ? #####################"
				echo "*#######################################################"
				echo "*#######################################################"
			else
	echo "MILKING IS DONE!*"
				add $milkedSectors 1
				if ($milkedSectors > 9)
					setVar $milkedSectors 0
					setVar $si 1
				end
			end
			
		end
		
		if ($nextSector = $toSector)
			if ($jumpBackSector > 0)
				# skip finishing
			else
				setVar $gridding 0
			end
		end
		:passiveSkip
		if ($logPorts = 1)
			if (PORT.EXISTS[CURRENTSECTOR])

				setVar $logit 0
				setPrecision 3
				send "cr" CURRENTSECTOR "*q"
				waitfor "<Computer deactivated>"

				setVar $pf PORT.FUEL[CURRENTSECTOR]
				if (PORT.PERCENTFUEL[CURRENTSECTOR] = 0)
					setVar $logit 1
				else
					setVar $pfPerc 100/PORT.PERCENTFUEL[CURRENTSECTOR]
					multiply $pf $pfPerc
					if ($pf > 5000)
						setVar $logit 1
					end
				end

				setVar $po PORT.ORG[CURRENTSECTOR]
				if (PORT.PERCENTORG[CURRENTSECTOR] = 0)
					setVar $logit 1
				else
					setVar $poPerc 100/PORT.PERCENTORG[CURRENTSECTOR]
					multiply $po $poPerc
					if ($po > 5000)
						setVar $logit 1
					end
				end

				setVar $pe PORT.EQUIP[CURRENTSECTOR]
				
				if (PORT.PERCENTEQUIP[CURRENTSECTOR] = 0)
					setVar $logit 1
				else
					setVar $pePerc 100/PORT.PERCENTEQUIP[CURRENTSECTOR]
					multiply $pe $pePerc
					if ($pe > 5000)
						setVar $logit 1
					end
				end

				setPrecision 0
				if ($logit = 1)
					goSub :logPort
				end
			end
		end
		# setVar $deployLimpets 3
		# setVar $deployMines 3
		# $disruptMines
		# $clearLimpets $saferestock 
		
	#	gosub :densityScan
		if (($clearLimpets = 1) or ($saferestock = 1))
			if (($deployLimpets > 0) or ($deployMines > 0) or ($disruptMines = 1))
				gosub :quikstats
				
				if (($LIMPETS < ($deployLimpets * 2)) or ($ARMIDS < ($deployLimpets * 2)) or (($MINE_DISRUPTORS < 4) and ($disruptMines = 1)))

echo "*### RESTOCKING AT END OF MOVE*"
echo "*### RESTOCKING AT END OF MOVE*"
echo "*### RESTOCKING AT END OF MOVE*"
					gosub :restock
				else
					//// $safeScrubLimpets  $clearLimpets
					if (($safeScrubLimpets = 1) or ($clearLimpets = 1))
						if ($LIMPETS < 10)
							gosub :restock
						end
					end
				end
			end
		end
		if (SECTOR.WARPCOUNT[CURRENTSECTOR] > 2)
			goSub :holoScan
		end
	end
	
return

:logPort
	
	round $pf 0
	round $po 0
	round $pe 0
	
	write $portlog CURRENTSECTOR & " " & $pf & " " & $po & " " & $pe 
	
return

:getJumpBack
	
	setVar $nearestNoFig 0
	getNearestWarps $nearArray CURRENTSECTOR
	setVar $i 1
	while ($i <= $nearArray)
		setVar $focus $nearArray[$i]
		if ($focus > 6)
			if ($focus <> STARDOCK)
				# get distance with our fig 3
				getDistance $nfigdist CURRENTSECTOR $focus 
				if ($nfigdist > 3) and ($figList[$focus] = 1)
					getDistance $returndist $focus CURRENTSECTOR
					if ($returndist = $nfigdist)
						setVar $ftarget 0
						setVar $y 1
						while ($y <= SECTOR.WARPCOUNT[$focus])
							# want the sector we landing at to jump back to make them jump, so it can't be a dead end
							if ($figList[SECTOR.WARPS[$focus][$y]] = 0) and (SECTOR.WARPCOUNT[SECTOR.WARPS[$focus][$y]] > 1)
								setVar $ftarget 1
								setVar $targetsAdded[$focus] 1

								send "p" $focus "*y"
								waitfor "lanetary TransWarp Drive Engaged"
								setVar $toSector SECTOR.WARPS[$focus][$y]
								
					
								return
							end
							add $y 1
						end
					end
				end
				
							
					
			end
		end
		add $i 1
	end
return

:getNextTarget
	clearAllAvoids
	setVar $nearestNoFig 0
	getNearestWarps $nearArray CURRENTSECTOR
	setVar $i 1
	while ($i <= $nearArray)
		setVar $focus $nearArray[$i]
		if ($focus > 10)
			if ($focus <> STARDOCK)
				# get distance with our fig 3
				getDistance $nfigdist CURRENTSECTOR $focus 
				if ($nfigdist > 0)
					setVar $value SECTOR.FIGS.OWNER[$focus]
					#echo $value "*"
					getwordpos $value $pos "belong to Corp#"
					if ($pos > 0) and ($figList[$focus] = 0)
						gettext $value $corpnumber "belong to Corp#" ","
						setvar $value "belong to Corp#"&$corpnumber
						#echo $corpnumber "*"
						if ($corpnumber = 2)
							setVar $ftarget 0
							setVar $closestTarget 0
							setVar $closestTargetDist 99
							setVar $y 1
							while ($y <= SECTOR.WARPINCOUNT[$focus])
								if ($figList[SECTOR.WARPSIN[$focus][$y]] = 1)
									getDistance $distToLand CURRENTSECTOR SECTOR.WARPSIN[$focus][$y]
									if ($distToLand < $closestTargetDist)
										setVar $closestTarget SECTOR.WARPSIN[$focus][$y]
										setVar $closestTargetDist $distToLand
										setVar $ftarget 1
									end
									
								end
								add $y 1
							end

							if ($ftarget = 1)
								setVar $targetsAdded[$focus] 1
								if ($closestTarget <> CURRENTSECTOR)
									send "p" $closestTarget "*y"
									waitfor "lanetary TransWarp Drive Engaged"
								end
								setVar $toSector $focus
								echo "Landing: " $closestTarget "*"
								echo "toSector: " $focus "*"
								
							end
							
							return
						end
					end

				end
	
			end
		end
		add $i 1
		
	end

	echo "'Could not find a target, halting!*"
	halt
return

:getNextTarget_param
	
	setVar $nearestNoFig 0
	getNearestWarps $nearArray CURRENTSECTOR
	setVar $i 1
	while ($i <= $nearArray)
		setVar $focus $nearArray[$i]
		if ($focus > 10)
			if ($focus <> STARDOCK)
				# get distance with our fig 3
				getDistance $nfigdist CURRENTSECTOR $focus 
				if ($nfigdist > 4) and ($figList[$focus] = 1)
					
					setVar $ftarget 0
					setVar $y 1
					while ($y <= SECTOR.WARPCOUNT[$focus])
						
						
						getSectorParameter SECTOR.WARPS[$focus][$y] "CORP2" $isblocked
						if ($isblocked = TRUE) and ($figList[SECTOR.WARPS[$focus][$y]] = 0)
							setVar $ftarget 1
							setVar $targetsAdded[$focus] 1

							send "p" $focus "*y"
							waitfor "lanetary TransWarp Drive Engaged"
							setVar $toSector SECTOR.WARPS[$focus][$y]
							
				
							return
						end
					end
				end
				
							
					
			end
		end
		add $i 1
		
	end

	echo "'Could not find a target, halting!*"
	halt
return

:getNextTarget_nearestithink

echo "using next target!"

	setVar $nearestNoFig 0
	getNearestWarps $nearArray CURRENTSECTOR
	setVar $i 1
	while ($i <= $nearArray)
		setVar $focus $nearArray[$i]
		if ($focus > 10)
			if ($focus <> STARDOCK)
				# get distance with our fig 3
				getDistance $nfigdist CURRENTSECTOR $focus 
				if ($nfigdist > 4) and ($figList[$focus] = 1)

					setVar $y 1
					while ($y <= SECTOR.WARPCOUNT[$focus])
						if ($figList[SECTOR.WARPS[$focus][$y]] = 0)
							if ($xportShip > 0)
								getDistance $shiptoo $xportShipSector SECTOR.WARPS[$focus][$y]
								getDistance $shipfrom SECTOR.WARPS[$focus][$y] $xportShipSector 
								if ($shiptoo <= $xportRange) and ($shipFrom <= $xportRange)
									send "p" $focus "*y"
									waitfor "lanetary TransWarp Drive Engaged"
									setVar $toSector SECTOR.WARPS[$focus][$y]
									return	
								end
							else
								setVar $targetsAdded[$focus] 1

								send "p" $focus "*y"
								waitfor "lanetary TransWarp Drive Engaged"
								setVar $toSector SECTOR.WARPS[$focus][$y]
								return
							end
							
						end
						add $y 1
					end
				end
				
							
					
			end
		end
		add $i 1
	end

	echo "'Could not find a target, halting!*"
return


:getNextTarget_3warp

echo "using next target!"

	setVar $nearestNoFig 0
	getNearestWarps $nearArray CURRENTSECTOR
	setVar $i 1
	while ($i <= $nearArray)
		setVar $focus $nearArray[$i]
		if ($focus > 10)
			if ($focus <> STARDOCK)
				# get distance with our fig 3
				getDistance $nfigdist CURRENTSECTOR $focus 
				if ($nfigdist > 2) and ($figList[$focus] = 1)
					
					setVar $ftarget 0
					setVar $y 1
					while ($y <= SECTOR.WARPCOUNT[$focus])
						if ($figList[SECTOR.WARPS[$focus][$y]] = 0)
							setVar $ftarget 1
							setVar $targetsAdded[$focus] 1

							send "p" $focus "*y"
							waitfor "lanetary TransWarp Drive Engaged"
							setVar $toSector SECTOR.WARPS[$focus][$y]
							
				
							return
						end
						add $y 1
					end
				end
				
							
					
			end
		end
		add $i 1
	end

	echo "'Could not find a target, halting!*"
return

:getNextSector

	send "cf*" $toSector "*q"
	
	setTextLineTrigger plot1 :plot1 "The shortest path"
	setTextLineTrigger plot2 :plot2 "No route within"
	pause
	:plot2
		killAllTriggers
		echo "**############# CRITICAL ERROR WITH COURSE - NEXT TO SKIP **"
		waitfor "next@"
		goto :newSector
	:plot1
		killAllTriggers
		//The shortest path (2 hops, 4 turns) from
		getWord CURRENTLINE $nextHops  4
		StripText $nextHops "("

		setTextLineTrigger courseCheck :courseCheck " > "
		pause
		:courseCheck
			killAllTriggers
			getWord CURRENTLINE $nextSector  3
			StripText $nextSector "("
			StripText $nextSector ")"
			if ($nextHops > 1)
				getWord CURRENTLINE $nextNextSector  5
				StripText $nextNextSector "("
				StripText $nextNextSector ")"
			end
		
	setVar $secz 1
	while ($secz <=6)
	
		if ($nextSector = $nSector[$secz])
			setVar $pgridDensityCheck $nDensity[$secz]

		end
		add $secz 1
	end
	

return

:nextSectorDensityRecord
// before gridding the currrent sector we recorded the next sector to be gridded - if there was on.
//	i.e. A > B > C   - we just gridded B from A, now we want to record C's density

	// Do a density scan and get next 
	gosub :densityScan
	setVar $secz 1
	while ($secz <=6)
	
		if ($nextNextSector = $nSector[$secz])
			setVar $pgridDensityCheck2 $nDensity[$secz]

		end
		add $secz 1
	end
return


:planetWarp
echo "#" $planetWarpTo "#"
	send "p" $planetWarpTo "*y"
	
	:moveSector
	setTextLineTrigger moveSectorGood :moveSectorGood "Locating beam pinpointed, TransWarp Locked"
	setTextLineTrigger moveSectorBad :moveSectorBad "Your own fighters must be in the destination to make a safe ju"
	setTextLineTrigger moveSectorGood2 :moveSectorGood2 "Planet is now in sector"
	
	
	pause

	:moveSectorBad
		killAllTriggers
		
		
		echo "**##########**########## FAILED TO LOCK, SKIPPING, Next to continue to next"
		setVar $figList[$planetWarpTo] 0
		setVar $nearfig_inc~origsec $planetWarpTo
		gosub :nearfig_inc~hamRemoveFig
		goto :newSector
	:moveSectorGood
		send "y"
		killAllTriggers
		goto :moveSector
	:moveSectorGood2
		killAllTriggers

return


:moveCheck
	:moveCheckAgain
	setVar $firstCheck 1
	setVar $checkuser 0

	setVar $nextSectorHasLimpets 0
	setVar $nextSectorHasLimpetsQuant 0
	setVar $nextSectorHasArmids 0
	setVar $nextSectorHasArmidsQuant 0
	setVar $nextSectorHasHaz 0
	setVar $nextSectorHasHazDensity 0
	// ASSUME THE WORST
	setVar $nextSectorHasFtrs 1
	setVar $nextSectorHasFtrsQuant 1

	:checkSector1
	
	gosub :warpReport
	gosub :nextSectorDensityEval


	if ($checkuser = 1)

		if ($firstCheck = 1)
			setVar $firstCheck 0
			setVar $checkuser 0
echo "*# HOLO AT CHECKUSER"
			goSub :holoScan
			waitfor "Citadel treasury contains"
			gosub :warpReport

			goto :checkSector1
		end
		
		setVar $nextSectorDanger 0
		setVar $stopAndLook 0
		goSub :nextSectorSafetyCheck

		setVar $nextSectorHasFtrsQuant SECTOR.FIGS.QUANTITY[$nextSector]
		if ($nextSectorHasFtrsQuant > 0)
			setVar $nextSectorHasFtrs 1
		else
			setVar $nextSectorHasFtrs 0
		end
echo "danager$nextSectorDanger " $nextSectorDanger "*"
		:checkUserMove
		if ($nextSectorDanger = 0)
			
			goSub :pgridSector

		elseif ($nextSectorDanger = 1)
			

			if ($skipSkips = 1)
				write $densityfile $nextSector & " HAS BEEN AUTO SKIPPED - CHECKOUT!"
				write $checkFile  $nextSector & " HAS BEEN AUTO SKIPPED - CHECKOUT!"
				add $StatsectorsSkipped 1
				setVar $stopCheck 1
					goto :newSector
			else
				:stopAndLooksie
				echo "**================"
				echo "* next sector: " $nextSector " danger: " $nextSectorDanger " $shieldedSeen " $shieldedSeen
				echo "* h: Holoscan"
				echo "* s: Stop"
				echo "* g: Go"
				echo "* k: sKip"
				getInput $whattodo "What you gonna do?"
			
				if ($whattodo = "h")
	echo "*# HOLO AT skipskips"				
					goSub :holoScan
					
					goto :checkUserMove
				elseif ($whattodo = "s")
					echo "**Waiting for next @ command"
					waitfor "next@"
					goto :checkUserMove

				elseif ($whattodo = "k")
					setVar $stopCheck 1
					goto :newSector
				elseif ($whattodo = "g")
					goSub :pgridSector
				else
					
					goto :checkUserMove
				end
			end
		end
	else
		goSub :pgridSector
	end
return

:pgridSector
	
	setVar $originSector CURRENTSECTOR
	setVar $sectorDangerSport 0
	
	if ($disruptMinesFirst = 1)
		setVar $previousDensity $nextSectorDensity
echo "*##Prev Density " $previousDensity
		setVar $minesToDisrupt $nextSectorHasArmidsQuant
		setVar $mineDisruptSector $nextSector
		setVar $newDensityAfterDisr $previousDensity
		subtract $newDensityAfterDisr ($nextSectorHasArmidsQuant * 10)

		goSub :disruptSector
		setVar $nextSectorHasArmids 0
		setVar $nextSectorHasArmidsQuant 0
		
		goSub :densityScan
		goSub :nextSectorDensityEval
		//if ($newDensityAfterDisr <> $nextSectorDensity)
			echo "*###### DENSITY CHANGE #######"
			echo "*## $newDensityAfterDisr " $newDensityAfterDisr
			echo "*## $nextSectorDensity " $nextSectorDensity
			echo "*## Waiting for next"
		//	waitfor "next@"
			#now go back to re-evaluating sector - goto not go sub as we need wind out of this routine cleanly
		//	goto :moveCheckAgain
		//end

	end

//can disrupt here, however, make sure we do one at a time with pause
//Make sure we take density of destination. If it changes from current - minesdensity, then we must re-eval

	goSub :scanSector
	if ($sectorDangerSport = 0)

		if ($iampgridder)
			if ($pgridDensityCheck <> 0)
echo "*#############DOING RND *"
echo "*#############DOING RND *"
echo "*#############DOING RND *"
echo "*#############DOING RND *"
				
				getRnd $delaytime 750 2000
				setDelayTrigger shortpause :shortpause $delaytime
				pause
				:shortpause
					killtrigger shortpause
			end
			if ($xportShip > 0)
				goSub :doShipGrid
			else
				send "'" $pgridBot " pgrid " $nextsector " d:" $pgridDensityCheck " scan*"
				waitfor "Successfully P-gridded"
			end
			
			send "s* * "
			
		else
			send "'" $pgridBot " disp*"
			waitfor "=-=-=-=-=-=-=-=-=-=-=-=| Display |=-=-=-=-=-=-=-=-=-=-=-"
			waitfor "Warps To:"
			if ($xportShip > 0)
				goSub :doShipGrid
			else
				if ($pgridDensityCheck <> 0)
					send "'" $pgridBot " pgrid " $nextsector " d:" $pgridDensityCheck " scan*"
				else
					send "'" $pgridBot " pgrid " $nextsector "*"
				end
			end
			#waitfor " enters the citadel."
			waitfor "Successfully P-gridded"
			send "s* * "

			#send "'" $pgridBot " land " $shipPlanet "*"
			
		end
		add $StatsectorsPgridded 1

		//Check botter landed and/or tell them to land

		setVar $figList[$nextsector] 1
		setVar $nearfig_inc~origsec $nextsector
		gosub :nearfig_inc~hamAddFig

		setVar $skipCleanupDeploy 0
		goSub :scanSectorForEnemy

		if ($skipCleanupDeploy = 0)
			// No enemy in sector!

			goSub :nextSectorDensityRecord
				
			if ($safeScrubLimpets = 0)
				goSub :sectorCleanup
				goSub :deployStuff
			end
		end
		if ($safeScrubLimpets = 1) and ($nextSectorHasLimpets = 1)
			goSub :safeScrubLimpet
		else
			goSub :deployStuff
		end

			
		
		if ($doLongPause = 1)
		echo "*###################################################"
		echo "*# PAUSING #########"
		echo "*###################################################"
			
			getRnd $delaytime $delaySmall $delayLong
			setDelayTrigger longPause :longPause $delaytime
			pause
			:longPause
				killtrigger longPause
		end
	else
		echo "*###################################################"
		echo "*# DANGER DANGER DANGER  - waiting for next#########"
		echo "*###################################################"
		waitfor "next@"
	end

return


:doShipGrid

	:DoShipGridAgain
	if ($pgridDensityCheck <> 0)
		send "'" $pgridBot " pgrid " $nextsector " d:" $pgridDensityCheck " x:" $xportShip "  scan*"
	else
		send "'" $pgridBot " pgrid " $nextsector "   x:" $xportShip " *"
	end

	
	setTextLineTrigger shipgridFail1 :shipgridFail1 "Could not find xport ship in shipscan"
	setTextLineTrigger shipgridFail2 :shipgridFail2 "will be out of range"
	setTextLineTrigger shipgridgood :shipgridgood "Successfully P-gridded w/xport"
	pause
	:shipgridFail1
		send "'Ship does not exist to pgrid*"
		halt
	:shipgridFail2
		killalltriggers
		goSub :moveXportShip
		goto :DoShipGridAgain
	:shipgridgood
		killalltriggers
		return

return

:moveXportShip
	setVar $xportShipFound FALSE
	goSub :getXportShipSector

	if ($xportShipFound = FALSE)
		send "'Could not find xport ship in shipscan*"
		
	end
	goSub :quikstats

	setVar $nearLimpSector 0
	setVar $nearLimpUsed 0
	goSub :nearestLimpet
	if ($nearLimpSector = 0)
		send "'Something went wrong, could not find a safe sector"
		halt
	end
	
	if ($nearLimpSector <> CURRENTSECTOR)
		setVar $returnLimpSec CURRENTSECTOR
		send "p" $nearLimpSector "*y"
		waitfor "lanetary TransWarp Drive Engaged"
		setVar $nearLimpUsed 1
	end
	goSub :quikstats

	setVar $returnSec CURRENTSECTOR
	send "qtnt1*c"
	waitfor "Enter Citadel>"
	send "b" $xportShipSector "*"
	waitfor "cating beam pinpointed, Trans"
	send "y"
	waitfor "Warps to Sector(s)"
	send " * wn" $xportShip "*"
	waitfor "ou lock your Tractor Beam on"

	
	send "m" $nearLimpSector "*y"
	waitfor "ocating beam pinpointed"
	send "y * * l" $shipPlanet "* c "
	waitfor "Enter Citadel>"

	if ($nearLimpUsed = 1)
		send "p" $returnLimpSec "*y"
		waitfor "lanetary TransWarp Drive Engaged"
	end

return

:nearestLimpet

	

	setVar $lSec 0
	getNearestWarps $nearArray CURRENTSECTOR
	setVar $lSec 1
	while ($lsec <= $nearArray)
		setVar $focus $nearArray[$lsec]
		getSectorParameter $focus "LIMPSEC" $hasLimp
		
		if ($hasLimp = TRUE) and ($figList[$focus] = 1)
			setVar $nearLimpSector $focus
			return
		end
		add $lsec 1
	end
	

return
:scanSectorForEnemy
	setVar $shieldedCountScan 0

	setVar $updateMinesQuant 0
	setVar $updateMinesDanger 0


	waitfor "<Scan Sector>"
	
	:scanSectorForEnemyContinue
	setTextLineTrigger ssfe1 :ssfe1 "(Shielded)"
	setTextLineTrigger updateMinesPresent :updateMinesPresent "(Type 1 Armid)"
	setTextLineTrigger updateMinesDanger :updateMinesDanger "Mined Sector: Do you wish to Avoid this sector in the future?"
	setTextTrigger ssfe2 :ssfe2 "Citadel command"
	pause
	:updateMinesPresent 
		killAllTriggers
		getWord CURRENTLINE $updateMinesQuant 3
		goto :scanSectorForEnemyContinue
	:updateMinesDanger
		killAllTriggers
		setVar $updateMinesDanger 1
		goto :scanSectorForEnemyContinue
	:ssfe1
		killAllTriggers
		add $shieldedCountScan 1
		goto :scanSectorForEnemyContinue
	:ssfe2
		killAllTriggers
		if ($updateMinesDanger = 1)
			setVar $nextSectorHasArmids 1
			setVar $nextSectorHasArmidsQuant $updateMinesQuant
		else
			setVar $nextSectorHasArmids 0
			setVar $nextSectorHasArmidsQuant 0
		end
		if ($shieldedCountScan > 1)
			setVar $skipCleanupDeploy 1

			echo "*###################################################"
			echo "*# DANGER DANGER DANGER  - ENEMY PLANET MAY BE PRESENT          #########"
			echo "*# DANGER DANGER DANGER  - Script will continue on in 3 seconds #########"
			echo "*# DANGER DANGER DANGER  - Unless stopstop put in subspace    #########"
			echo "*# DANGER DANGER DANGER  - Nothing will be deployed    #########"
			echo "*# DANGER DANGER DANGER  - If safe sector is picked for refurbing it will go there to scrub  #########"
			echo "*###################################################"


			
			#send "'ang p " $nextsector "*"
			#send "'san citcap on*"
			#setDelayTrigger delay :willowD 200
			#pause
			#:willowD
			#	send "'wil citfill on 49999*"
			#	send "'ang lift*"
			#halt

			setDelayTrigger delay :scanSectorWait 3000
			setTextLineTrigger scanSectorPause :scanSectorPause "stopstop"
			pause
			:scanSectorWait
				killalltriggers
					if ($saferestock = 1)
						send "'" $pgridBot " p " $shipRestockSector "*"
						waitfor "moved to sector"
						setVar $saferestock 0
						gosub :restock
						setVar $saferestock 1
					end

				return
			:scanSectorPause
				killalltriggers
				echo "*###################################################"
				echo "*# Script will continue to next sector on NEXT@ #########"
				echo "*###################################################"

				waitfor "next@"
				return

		end
return

:deployStuff
	echo "*## $ARMIDS $ARMIDS $ARMIDS" $ARMIDS
	if ($deployMines > 0)
		if ($ARMIDS < $deployMines)
			goSub :reStock
			goto :deployStuff
		end

		send "'" $passivePerson " cMine " $deployMines "*"
		waitfor "Corporate Mines Deployed"
	end
	
	if (($passDeploy = 1) and ($deployLimpets > 0))
		if ($LIMPETS < $deployLimpets)
			goSub :reStock
			goto :deployStuff
		end
		send "'" $passivePerson " climp " $deployLimpets "*"
		waitfor "Corporate Limpets Deployed!"
	end

return



:sectorCleanup
	#setVar $disruptMines 1
	#setVar $disruptMinesFirst 1
	#setVar $clearLimpets 1
	#setVar $nextSectorHasLimpets 0
	#setVar $nextSectorHasLimpetsQuant 0
	#setVar $nextSectorHasArmids 0
	#setVar $nextSectorHasArmidsQuant 0
	
	if (SECTOR.LIMPETS.OWNER[CURRENTSECTOR] = "belong to your Corp")
		setVar $nextSectorHasLimpets 0
	end
	if (SECTOR.MINES.OWNER[CURRENTSECTOR] = "belong to your Corp")
		setVar $nextSectorHasArmids 0
	end
	
	if (($nextSectorHasFtrs = 0) AND ($nextSectorHasLimpets = 0) AND ($nextSectorHasArmids = 0))
		setVar $sectorHadNoEnemy 1
	end
	goSub :quikStats

	if ($disruptMines = 1)
		if ($disruptMinesFirst = 0)
			if ($nextSectorHasArmids = 1)
				
				
				send "'" $passivePerson " p " $originSector "*"
				waitfor "moved to sector"
				
				setVar $minesToDisrupt $nextSectorHasArmidsQuant
				setVar $mineDisruptSector $nextSector
				goSub :disruptSector
				
				

				setVar $nextSectorHasArmids 0
				setVar $nextSectorHasArmidsQuant 0

				send "'" $passivePerson " p " $nextSector  "*"
				waitfor "moved to sector"
				
			end
		end
	end
	
	if ($clearLimpets = 1)
		// No point using safescrub limpets if we are clearing the, we'll still get
		if ($nextSectorHasLimpets = 1)

			
		
			:climpretry
			setDelayTrigger limpw :limpw 1000
			pause
			:limpw

			send "'" $pgridBot " exit*"
			waitfor "Exit Enter."
			setDelayTrigger delay :wait2 750
			pause
			:wait2
			
			send "'" $pgridBot " climp 2*"
			:climp3retry
			setTextLineTrigger climp1 :climp1 "Sector already has enemy limpets present!"
			setTextLineTrigger climp2 :climp2 "Corporate Limpets Deployed!"
			setTextLineTrigger climp3 :climp3 "Too many mines in the sector"
			pause
			:climp3
				send "'" $pgridBot " climp 20*"
				killalltriggers
				goto :climp3retry
			:climp1
				killalltriggers
				goto :climpretry
			:climp2
			
				killalltriggers
			

			setDelayTrigger delay :wait3 750
			pause
			:wait3

			if ($scrubLimpets = 1)
				send "'" $savemeGuy " plimp 1*" 
				setTextLineTrigger plimpno :plimpno "Cannot Deploy Limps!"
				setTextLineTrigger plimpno2 :plimpno2 "Too many mines in the sector"
				setTextLineTrigger plimpyes :plimpyes "Personal Limpet"
				pause
				:plimpno
				:plimpno2
					killAllTriggers
					send "'" $savemeGuy " plimp 20*"
					waitfor "Personal Limpet"
					send "'" $pgridBot " exit*"
					waitfor "Exit Enter."
					setDelayTrigger delay :wait6 500
					pause
					:wait6

					send "'" $savemeGuy " climp " 20 "*"
					waitfor "Corporate Limpets Deployed"
					goto :donescrub
				:plimpyes
					killAllTriggers
					send "'" $pgridBot " exit*"
					waitfor "Exit Enter."
					setDelayTrigger delay :wait5 500
					pause
					:wait5
					send "'" $pgridBot " climp " $deployLimpets "*"
					waitfor "Corporate Limpets Deployed"
					goto :donescrub
				
			else

				send "'" $passivePerson " climp " $deployLimpets "*"
				waitfor "Corporate Limpets Deployed"
			end

			:donescrub
			
			
			
		else
			send "'" $passivePerson " climp " $deployLimpets "*"
			waitfor "Corporate Limpets Deployed"	
		end
		goSub :quikStats
		if ($LIMPETS  < 5)
			goSub :reStock
		end
	else
	
	

		if ($deployLimpets > 0)
			send "'" $passivePerson " climp " $deployLimpets "*"
			waitfor "Corporate Limpets Deployed"
			if ($LIMPETS  < 5)
				goSub :quikStats
				goSub :reStock
			end
		end
	end

return
:disruptSector
	setVar $dr $minesToDisrupt
	divide $dr 8
	add $dr 1
	echo "*## Disrupters Required: " $dr
	// adds one for rounidng
	
	if ($disruptMines = 1)
		if ($MINE_DISRUPTORS <= $dr)
			goSub :reStock
		end
		setVar $dri 1
		while ($dri <= $dr)
			goSub :disrMines
			add $dri 1
		end
	end
	
return

:disrMines
	
	send "q  q  c  w  y  " $mineDisruptSector "  *  q  l" $shipPlanet "  *  c  "
	waitfor "<Enter Citadel>"
	#short delay between shots to avoid getting photoned on the second disruption
	setDelayTrigger delay :wait 400
	pause
	:wait
return

:safeScrubLimpet
	# Finds nearest sector with all safe incoming warps limpets
	# Script should scrub this sector for limpets
	# and then scrub player
	# also has option to disrupt mines on the way

	if ($safeScrubLimpetsDisrupt = 1)
		if (SECTOR.LIMPETS.OWNER[CURRENTSECTOR] = "belong to your Corp")
			setVar $nextSectorHasLimpets 0
		end
		if (SECTOR.MINES.OWNER[CURRENTSECTOR] = "belong to your Corp")
			setVar $nextSectorHasArmids 0
		end
		
		if (($nextSectorHasFtrs = 0) AND ($nextSectorHasLimpets = 0) AND ($nextSectorHasArmids = 0))
			setVar $sectorHadNoEnemy 1
		end
		goSub :quikStats

		if ($disruptMines = 1)
			if ($disruptMinesFirst = 0)
				if ($nextSectorHasArmids = 1)
					
					
					send "'" $passivePerson " p " $originSector "*"
					waitfor "moved to sector"
					
					setVar $minesToDisrupt $nextSectorHasArmidsQuant
					setVar $mineDisruptSector $nextSector
					goSub :disruptSector

					setVar $nextSectorHasArmids 0
					setVar $nextSectorHasArmidsQuant 0
					
				end
			end
		end
	end


	setVar $safeScrubSector 0
	setVar $distToSafe 0
	setVar $distFromSafe 0

	getNearestWarps $nearArray CURRENTSECTOR
	setVar $i 1
	while ($i <= $nearArray)
		setVar $focus $nearArray[$i]
		if ($focus > 10)
			if ($focus <> $sd)
				if ($figList[$focus] = 1)
					
					setVar $y 1
					setVar $danger 0
					while ($y <= SECTOR.WARPINCOUNT[$focus])
						if ($figList[SECTOR.WARPSIN[$focus][$y]] = 0)
							setVar $danger 1
						end
						add $y 1
					end
					if ($danger = 0)
						getDistance $distToSafe CURRENTSECTOR $focus 
						getDistance $distFromSafe $focus CURRENTSECTOR 
						if ($distToSafe = $distFromSafe)
							setVar $safeScrubSector $focus
							goto :endSafeSearch
						end
					end
				end
			end
		end
		add $i 1
	end

	:endSafeSearch
	if ($safeScrubSector = 0)
		
		echo "*#############################################"
		echo "*##### NO SAFE SCRUB OPTION FOUND ############"
		echo "*#############################################"
		halt
	else
		setVar $safeScrubReturn 0

		if (CURRENTSECTOR <> $safeScrubSector)
			setVar $safeScrubReturn CURRENTSECTOR
			send "'" $pgridBot " p " $safeScrubSector "*"
			waitfor "moved to sector"
		end

		:ssLimpRetry
		send "'" $passivePerson " climp 2*"
		setTextLineTrigger sslimp1 :sslimp1 "Sector already has enemy limpets present!"
		setTextLineTrigger sslimp2 :sslimp2 "Corporate Limpets Deployed!"
		setTextLineTrigger sslimp3 :sslimp3 "Cannot Deploy Limps!"
		
		pause
		:sslimp1
			killalltriggers
			
			send "'" $passivePerson " exit*"
			waitfor "Exit Enter."
			setDelayTrigger delay :sswait1 750
			pause
			:sswait1
				killalltriggers
				goto :ssLimpRetry
		:sslimp3
			
			killalltriggers
		:sslimp2
			killalltriggers
		
		
		send "'" $savemeGuy " plimp 1*" 
		setTextLineTrigger ssplimpno :ssplimpno "Cannot Deploy Limps!"
		setTextLineTrigger ssplimpyes :ssplimpyes "Personal Limpet" 
		pause
		:ssplimpno
			killAllTriggers
			send "'" $savemeGuy " plimp 20*"
			waitfor "Personal Limpet"
			send "'" $pgridBot " exit*"
			waitfor "Exit Enter."
			setDelayTrigger delay :sswait6 500
			pause
			:sswait6

			send "'" $savemeGuy " climp " 20 "*"
			waitfor "Corporate Limpets Deployed"
			goto :ssdonescrub
		:ssplimpyes
			killAllTriggers
			send "'" $pgridBot " exit*"
			waitfor "Exit Enter."
			setDelayTrigger delay :sswait5 500
			pause
			:sswait5
			send "'" $passivePerson " climp " $deployLimpets "*"
			waitfor "Corporate Limpets Deployed"
			goto :ssdonescrub
			
		
	end
	:ssdonescrub
	if (CURRENTSECTOR <> $safeScrubReturn) and ($safeScrubReturn > 0)
		
		send "'" $pgridBot " p " $safeScrubReturn "*"
		waitfor "moved to sector"
	end
return


:restock
	
echo "*################################"
echo "*################################"
echo "*################################"
echo "*##### RE STOCK HALT ##########"
echo "*################################"
echo "*################################"
echo "*################################"
echo "*################################"
echo "*################################"
# check i'm in twarp ship - hht I wasn't
waitfor "go!"
return 
	halt
	setVar $restockreturn CURRENTSECTOR

	if ($saferestock = 1)
		send "s*  "
		waitfor "Warps to Sector"
		send "'" $pgridBot " p " $shipRestockSector "*"
		waitfor "moved to sector"
	end

	send "cv0*yn" $sd "*q"
	
	gosub :quikstats
	if ($ORE_HOLDS < 100)
		send "qtnt1*c"
	end
	send "s*  "
	#paranoid check
	waitfor "Warps to Sector"
	setVar $returnSector CURRENTSECTOR
	send "'" $passivePerson " d*"
	waitfor "credits deposited into citade"
	send "'" $passivePerson " w 10000000*"
	waitfor "credits taken from citade"


	goSub :gotoDock
	send "h"
	#RESTOCK
		send "l"
		setTextTrigger shipCheckBuyLimpets :shipCheckBuyLimpets "How many mines do you want"
		pause
		:shipCheckBuyLimpets
			killalltriggers
			getWord CURRENTLINE $LimpetssAvail 8
			stripText $LimpetssAvail ")"
echo "*#########*###" $LimpetssAvail "*"
			if ($LimpetssAvail = 0)
				echo "*### we have a problem, no Limpets purchasable waiting for next"
				
			end
			send $LimpetssAvail "*"

		send "m"
		setTextTrigger shipCheckBuyMines :shipCheckBuyMines "How many mines do you want"
		pause
		:shipCheckBuyMines
			killalltriggers
			getWord CURRENTLINE $MinessAvail 8
			stripText $MinessAvail ")"
echo "*#########*###" $MinessAvail "*"
			if ($MinessAvail = 0)
				echo "*### we have a problem, no Mines purchasable waiting for next"
				
			end
			send $MinessAvail "*"
		send "s"
		setTextTrigger shipCheckBuyDisr :shipCheckBuyDisr "How many Mine Disruptors do you want"
		pause
		:shipCheckBuyDisr
			killalltriggers
			getWord CURRENTLINE $DisrsAvail 9
			stripText $DisrsAvail ")"
echo "*#########*###" $DisrsAvail "*"
			if ($DisrsAvail = 0)
				echo "*### we have a problem, no Disr purchasable waiting for next"
				
			end
			send $DisrsAvail "*"

	send "qspb50000*b50000*b50000*c16000*c3000*q"
	send "qq"
	send "m" $returnSector "*y"
	waitfor "All Systems Ready, shall we engage?"
	send "y*l" $shipPlanet "*c"
	waitfor "TransWarp Drive Engaged!"
	waitfor "<Enter Citadel>"
	goSub :quikStats
	send "cv" $sd "*q"
	if ($saferestock = 1)
		
		send "'" $pgridBot " p " $restockreturn "*"
		waitfor "moved to sector"
	end

return

:gotoDock
	send "d"
	# ensure we are in citadel
	waitfor "Citadel treasury conta"
	send "b" $sd "*"
	waitfor "Federation beacon acknowledged, coordinates cleared for beaming"
	send "yps"
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

:warpReport


	setVar $denChecks[1] 0
	setVar $denChecks[2] 0
	setVar $denChecks[3] 0
	setVar $denChecks[4] 0
	setVar $denChecks[5] 0
	setVar $denChecks[6] 0

#echo "*DENSITY REPORT"
#echo "*$nDensity[1]: " $nDensity[1]
#echo "*$nDensity[2]: " $nDensity[2]
#echo "*$nDensity[3]: " $nDensity[3]
#echo "*$nDensity[4]: " $nDensity[4]
#echo "*$nDensity[5]: " $nDensity[5]
#echo "*$nDensity[6]: " $nDensity[6]


	setVar $dangerNextSector 0

	if ($nDensity[1] > $noHoloMaxDensity)

		if ($figlist[$nSector[1]] <> "1")
			if ($firstCheck = 0) and (SECTOR.FIGS.OWNER[$nSector[1]]  <> $ferrengiAutoKill)
				setVar $checkuser 1
			elseif ($firstCheck = 1)
				setVar $checkuser 1
			end
			if ($nextSector = $nSector[1])
				setVar $dangerNextSector 1

			end
			setVar $denChecks[1] 1
		end
	end
	if ($nDensity[2] > $noHoloMaxDensity)		
		if ($figlist[$nSector[2]] <> "1")
			
			if ($firstCheck = 0) and (SECTOR.FIGS.OWNER[$nSector[2]]  <> $ferrengiAutoKill)
				setVar $checkuser 1
			elseif ($firstCheck = 1)
				setVar $checkuser 1
			end
			if ($nextSector = $nSector[2])
				setVar $dangerNextSector 1
			end
			setVar $denChecks[2] 1
		end
	end
	if ($nDensity[3] > $noHoloMaxDensity)		
		if ($figlist[$nSector[3]] <> "1")
				
			if ($firstCheck = 0) and (SECTOR.FIGS.OWNER[$nSector[3]]  <> $ferrengiAutoKill)
				setVar $checkuser 1
			elseif ($firstCheck = 1)
				setVar $checkuser 1
			end
			if ($nextSector = $nSector[3])
				setVar $dangerNextSector 1
			end
			setVar $denChecks[3] 1
		end
	end
	if ($nDensity[4] > $noHoloMaxDensity)
		if ($figlist[$nSector[4]] <> "1")
			if ($firstCheck = 0) and (SECTOR.FIGS.OWNER[$nSector[4]]  <> $ferrengiAutoKill)
				setVar $checkuser 1
			elseif ($firstCheck = 1)
				setVar $checkuser 1
			end
			if ($nextSector = $nSector[4])
				setVar $dangerNextSector 1
			end
			setVar $denChecks[4] 1
		end
	end
	if ($nDensity[5] > $noHoloMaxDensity)
		if ($figlist[$nSector[5]] <> "1")
			if ($firstCheck = 0) and (SECTOR.FIGS.OWNER[$nSector[5]]  <> $ferrengiAutoKill)
				setVar $checkuser 1
			elseif ($firstCheck = 1)
				setVar $checkuser 1
			end
			if ($nextSector = $nSector[5])
				setVar $dangerNextSector 1
			end
			setVar $denChecks[5] 1
		end
	end
	if ($nDensity[6] > $noHoloMaxDensity)
		if ($figlist[$nSector[6]] <> "1")
			if ($firstCheck = 0) and (SECTOR.FIGS.OWNER[$nSector[6]]  <> $ferrengiAutoKill)
				setVar $checkuser 1
			elseif ($firstCheck = 1)
				setVar $checkuser 1
			end
			if ($nextSector = $nSector[6])
				setVar $dangerNextSector 1
			end
			setVar $denChecks[6] 1
		end
	end
return




:nextSectorDensityEval
	
	setVar $nextSectorDensity 32123
	setVar $seci 1
	while ($seci <=6)
	
		if ($nextSector = $nSector[$seci])
			setVar $NextSectori $seci
			setVar $nextSectorDensity $nDensity[$seci]
		end
		add $seci 1
	end

	if ($nAnom[$NextSectori] = 1)
		setVar $nextSectorHasLimpets 1
	end
	if ($nHaz[$NextSectori] > 0)
		setVar $nextSectorHasHaz 1
		setVar $nextSectorHasHazDensity $nHaz[$NextSectori]
		multiply $nextSectorHasHazDensity 21
	end
	 
	echo "*## Next Sector: " $nSector[$NextSectori] " Anom:" $nextSectorHasLimpets "*"

	#gosub :dashpause
return

:checkPassiveOptions
	
	//flag we have something to do
	setVar $optionsAvail 0

	// store adjacent sectors with no density
	setVar $optionsToDo 0
	setVar $optionsi 1
	
	// store adjacent sectors with ports
	setVar $optionsToDoPort 0
	setVar $optionsPorti 1

	//Those will ACTUALLY grid
	setVar $toGrid 0
	setVar $toGridi 1

	// Passive next door - and if has a port check density
	setVar $passiveNext 0
	setVar $checkDensity 0



//:holoScan
	setVar $pi 1
	while ($pi <= $deni)
		
		if ($nDensity[$pi] = 0) 
		
			if ($nSector[$pi] = $nextSector)
				setVar $passiveNext 1
				echo "*### Passve Next Sector " $nSector[$pi]
			else
				if ($passiveForwardOnly = 0)
					setVar $optionsAvail 1
					setVar $optionsToDo[$optionsi] $nSector[$pi]
					add $optionsi 1
					echo "*### Passve Adjacent Sector " $nSector[$pi]
				end
			end
		elseif ($nDensity[$pi] = 100)
			if ($nSector[$pi] = $nextSector)
				setVar $checkDensity 1
				setVar $passiveNext 1
				echo "*### Passve Next Sector but check for port " $nSector[$pi]
			else
				if ($passiveForwardOnly = 0)
					setVar $optionsAvail 1
					setVar $optionsToDoPort[$optionsPorti] $nSector[$pi]
					add $optionsPorti 1
					echo "*### Passve Adjacent Sector but check for port " $nSector[$pi]
				end
			end
		end
	
		add $pi 1
	end

	setVar $doneHolo 0
	if ($optionsPorti > 1)
echo "*# HOLO AT OPTIONSPORTi"
		gosub :holoScan
		setVar $doneHolo 1
		setVar $hi 1
		send "c"
		while ($hi < $optionsPorti)
			send "r" $optionsToDoPort[$hi] "*"
			setTextLineTrigger portch1 :portch1 "ave no information about a port in that sector"
			setTextLineTrigger portch2 :portch2 "Commerce report for"
			pause
			:portch1
				killalltriggers
				goto :nextOptPort
			:portch2
				killalltriggers
				setVar $toGrid[$toGridi] $optionsToDoPort[$hi]
				add $toGridi 1

			:nextOptPort
			add $hi 1
		end
		send "q"
	end
	if ($optionsi > 1)
		setVar $hi 1
		while ($hi < $optionsi)
			setVar $toGrid[$toGridi] $optionsToDo[$hi]
			add $toGridi 1
			add $hi 1
		end
	end
	
	if ($passiveNext = 1) and ($checkDensity = 1)
		if ($doneHolo = 0)
echo "*# HOLO AT PASSIVENEXT"
			gosub :holoScan
		end
		send "cr" $nextSector "*"
		setTextLineTrigger portch3 :portch3 "ave no information about a port in that sector"
		setTextLineTrigger portch4 :portch4 "Commerce report for"
		pause
		:portch3
			killalltriggers
			setVar $passiveNext 0

			goto :nextOptPort2
		:portch4
			killalltriggers
			

		:nextOptPort2

	end
	setVar $origin CURRENTSECTOR

	setVar $hi 1
	while ($hi < $toGridi)
		echo "*###we are goign to grid the folliwng passively"
		echo "*# " $toGrid[$hi] "*"

		// This person will bring planet back

		send "'" $passivePerson " m " $toGrid[$hi] " 1*"
		waitfor "Sector  :"
		send "'" $passivedriver " pwarp " $toGrid[$hi] "*"
		waitfor "moved to sector"
		send "'" $passivePerson " land " $shipPlanet "*" 
		waitfor "} - In Cit - Planet"
		send "'" $passivePerson " pwarp " $origin "*" 
		waitfor "moved to sector"
		setVar $figList[$toGrid[$hi]] 1
		setVar $nearfig_inc~origsec $toGrid[$hi]
		gosub :nearfig_inc~hamAddFig
		add $StatsectorsPassiveGridded 1
		add $hi 1
	end
	echo "*# Passive Next " $passiveNext "**"
return

:densityScan
	send "q q sdl" $shipPlanet "* c "
	waitfor "Relative Density Scan"

	setVar $deni 0
	setVar $nDensity 0
	setVar $nSector 0
	setVar $nWarps 0
	setVar $nHaz 0
	setVar $nAnom 0

	

	:densityScanning
		setTextLineTrigger densityScanLine :densityScanLine "Sector"
		setTextTrigger densityScanEnd :densityScanEnd "Help)?"
		setTextTrigger densityScanEnd2 :densityScanEnd2 "Stop in this sec"
		
		pause
	
		:densityScanLine
	
			KillTrigger densityScanLine
			KillTrigger densityScanEnd
			KillTrigger densityScanEnd2
			
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

			stripText $secDensity ","
			stripText $scanSector ")"
			stripText $scanSector "("
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
			if ($secDensity > $densityFileMin)
				write $densityfile $scanSector & " " & $secDensity & " " & $nHaz
				send "'HIGH DENSITY SECTOR:" $scanSector  " DENSITY:" $secDensity " HAZ:"  $nHaz " OURFIG:" $figList[$scanSector] "*"
			end
#echo "*###########"
#echo "*## $deni " $deni
#echo "*## $nDensity[$deni] " $nDensity[$deni]
#echo "*## $nSector[$deni] " $nSector[$deni]
#echo "*## $nWarps[$deni] " $nWarps[$deni]
#echo "*## $nHaz[$deni] " $nHaz[$deni]
#echo "*## $nAnom[$deni] " $nAnom[$deni]
#echo "*###########"



	
			goto :densityScanning
			
		:densityScanEnd
		:densityScanEnd2
			KillTrigger densityScanLine
			KillTrigger densityScanEnd
			KillTrigger densityScanEnd2
			waitfor "Citadel treasury contains"
	return


:holoScan



echo "*##ENTERinG HOLO SCAN"

	send "q q shl" $shipPlanet "* c "
	waitfor "Long Range Scan"
	setVar $hIndex 1
	setVar $hData ""
	setVar $hStartLogging 0
	setVar $hNextSectorLog 0
	setVar $hNextSectorLogi 1
	setVar $adjacentMines 0

	:holoSectorStart
	

		setTextLineTrigger holoScanFirstSector :holoScanFirstSector "Sector  :"
		pause
		:holoScanFirstSector
			killtrigger holoScanFirstSector
			getWord CURRENTLINE $hSector 3
			setVar $hData "     " & CURRENTLINE & "*"
			if ($hSector = $nextSector)
				setVar $hStartLogging 1

			else
				setVar $hStartLogging 0
			end
			
		
		:holoScanContinue
		setTextLineTrigger holoScanDetails :holoScanDetails ""
		
		pause
		:holoScanDetails

			killtrigger holoScanDetails
			getWord CURRENTLINE $firstword 1
			if ($firstword = "Warps")
				goto :checkHoloScan
			elseif ($firstword = "Sector")
				getWord CURRENTLINE $hSector 3
				if ($hSector = $nextSector)
					setVar $hStartLogging 1
	
				else
					setVar $hStartLogging 0
				end
				setVar $holoData[$hIndex] $hData
				add $hIndex 1
				setVar $hData "     " & CURRENTLINE & "*"
				goto :holoScanContinue
			else
				if ($hStartLogging = 1)
					setVar $hNextSectorLog[$hNextSectorLogi] CURRENTLINE
					add $hNextSectorLogi 1
				end
				getWordPos CURRENTLINE $minepos "Mines"
				if ($minepos = 1)
					getWord $adjacentMines[$hIndex] $nextSectorHasArmidsQuant 3
				else
					setVar $adjacentMines[$hIndex] 0
				end
				setVar $hData "     " & $hData & "*" & CURRENTLINE & "*"
				goto :holoScanContinue
			end
	
	:checkHoloScan
	setVar $hIndex 1
	

	while ($hIndex <= 6)
#		echo "*## CHeck " $hIndex
		if ($denChecks[$hIndex] = 1)
			if ($shieldedDangerOnly = 1)
				getWordPos $holoData[$hIndex] $shieldloc "(Shielded)"
				if ($shieldloc > 0)
					setVar $shieldedSeen 1
				end
			end
			

			write $checkFile $holoData[$hIndex]
		end
		add $hIndex 1
	end



	setVar $hNextDatai 1
	while ($hNextDatai < $hNextSectorLogi)
		//Mines   : 1 (Type 1 Armid) (belong to your Corp)
		
		getWordPos $hNextSectorLog[$hNextDatai] $minepos "Mines"
		
		if ($minepos = 1)
			getWord $hNextSectorLog[$hNextDatai] $nextSectorHasArmidsQuant 3
			setVar $nextSectorHasArmids 1 
			
		end

		add $hNextDatai 1
	end
return

:nextSectorSafetyCheck
		
		setVar $stopAndLook 0
		setVar $density SECTOR.DENSITY[$nextSector]

		setVar $figs SECTOR.FIGS.QUANTITY[$nextSector]
		setVar $haz SECTOR.NAVHAZ[$nextSector]
		setVar $ships SECTOR.SHIPCOUNT[$nextSector]
		setVar $traders SECTOR.TRADERCOUNT[$nextSector]
		setVar $planets SECTOR.PLANETCOUNT[$nextSector]
		setVar $limpets2 SECTOR.LIMPETS.QUANTITY[$nextSector]
		
		if ($planets > 0)
			if ($shieldedDangerOnly = 1)
				if ($shieldedSeen = 1)
					setVar $nextSectorDanger 1
				else
					setVar $nextSectorDanger 0
				end
			else
				setVar $nextSectorDanger 1
			end
			
		elseif  ($traders > 0)
			setVar $nextSectorDanger 1
		elseif  ($ships > 0)
			setVar $nextSectorDanger 1
		elseif  ($figs > $nextSectorFigsDanger)
			setVar $nextSectorDanger 1
		end

	echo "*### FIGS:" $figs  $nextSectorDanger "*"
	echo "*### FIGS:" $figs  $nextSectorDanger "*"
return

:checkAliens
	setVar $aliens 0
	setVar $alieni 0

	send "#"
	waitfor "Who's Playing"
	:nextAlien
	setTextLineTrigger checkAliens1 :checkAliens1 "are on the move!"
	setTextTrigger checkAliens2 :checkAliens2 "Command [TL"
	pause
	:checkAliens1
		killAllTriggers
		add $alieni 1

		getText CURRENTLINE $alien "The " " are on the move!"
		setVar $aliens[$alieni] "The " & $alien
		
echo "*### Addinga Alien #" $alien "#"
		goto :nextAlien
	:checkAliens2
		killAllTriggers
		add $alieni 1
		setVar $aliens[$alieni] "Rogue Mercenaries"
		
return

:checkSelf
	send "i"
	waitfor "ank and Exp"
	setTextLineTrigger checkEnemyCorp1 :checkEnemyCorp1 "Corp   "
	setTextLineTrigger checkEnemyCorp2 :checkEnemyCorp2 "Credits        :"
	pause

	:checkEnemyCorp1
		killAllTriggers
		getWord CURRENTLINE $yourCorp 3
		stripText $yourCorp ","
echo "*#### YOUR CORP IS: " $yourCorp
	:checkEnemyCorp2	

return

:checkEnemy
	setVar $whosOnline 0
	setVar $whosOnlinei 0
	
	if ($yourCorp = 0)
		goSub :checkSelf
	end
	
	send "#"
	waitfor "Who's Playing"
	:checkEnemyContinue
	setTextLineTrigger checkEnemy1 :checkEnemy1 "["
	setTextTrigger checkEnemy2 :checkEnemy2 "Command [TL"
	pause
	:checkEnemy1
		killAllTriggers
		getText CURRENTLINE $whoqu "[" "]"
		if ($whoqu = $yourCorp)
			goto :checkEnemyContinue
		end
		if ($whosOnlinei > 0)
			setVar $whoi 0
			setVar $foundWho 0
			while ($whoi < $whosOnlinei)
				if ($whosOnline[$whoi] = $whoqu)
					setVar $foundWho 1
				end 
				add $whoi 1

			end
			if ($foundWho = 0)
				add $whosOnlinei 1
				setVar $whosOnline[$whosOnlinei] $whoqu
echo "*### Addingx " $whoqu
			end
		else
			add $whosOnlinei 1
echo "*### Addingz " $whoqu
			setVar $whosOnline[$whosOnlinei] $whoqu
		end

		goto :checkEnemyContinue
	:checkEnemy2
		killAllTriggers
		
return

:scanSector

	setVar $sectorDangerSport 0
	setVar $shieldedCount 0
	send "s* "
	waitfor "<Scan Sector>"
	waitfor "Sector  :"
	:scanSectorContinue
		setTextLineTrigger scanSectorShielded :scanSectorShielded "(Shielded)"
		setTextLineTrigger scanSectorDone :scanSectorDone "Warps to Sector(s) :"
		pause
		:scanSectorShielded
			killAllTriggers
			add $shieldedCount 1
			goto :scanSectorContinue
		:scanSectorDone
			killAllTriggers
			if ($shieldedCount > 1)
				setVar $sectorDangerSport 1
			end
		

return


:quikstats


     	setVar $CURRENT_PROMPT 		"Undefined"
	killtrigger noprompt
	killtrigger prompt1
	killtrigger prompt2
	killtrigger prompt3
	killtrigger prompt4
	killtrigger statlinetrig
	killtrigger getLine2
	setTextLineTrigger 	prompt		:allPrompts	 	#145 & #8
	setTextLineTrigger 	statlinetrig 	:statStart 		#179
	send #145&"/"
	pause

	:allPrompts
		getWord CURRENTLINE $CURRENT_PROMPT 1
		stripText $CURRENT_PROMPT #145
		stripText $CURRENT_PROMPT #8
		#getWord currentansiline $checkPrompt 1
		#getWord currentline $tempPrompt 1
		#getWordPos $checkPrompt $pos "[35m"
		#if ($pos > 0)
		#	setVar $CURRENT_PROMPT $tempPrompt
		#end
		setTextLineTrigger 	prompt		:allPrompts	 	#145 & #8
		pause

	:statStart
		killtrigger prompt
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger noprompt
		setVar $stats ""
		setVar $wordy ""


	:statsline
		killtrigger statlinetrig
		killtrigger getLine2
		setVar $line2 CURRENTLINE
		replacetext $line2 #179 " "
		striptext $line2 ","
		setVar $stats $stats & $line2
		getWordPos $line2 $pos "Ship"
		if ($pos > 0)
			goto :gotStats
		else
			setTextLineTrigger getLine2 :statsline
			pause
		end

	:gotStats
		setVar $stats $stats & " @@@"

		setVar $current_word 0
		while ($wordy <> "@@@")
			if ($wordy = "Sect")
				getWord $stats $CURRENT_SECTOR   	($current_word + 1)
			elseif ($wordy = "Turns")
				getWord $stats $TURNS  			($current_word + 1)
			elseif ($wordy = "Creds")
				getWord $stats $CREDITS  		($current_word + 1)
			elseif ($wordy = "Figs")
				getWord $stats $FIGHTERS   		($current_word + 1)
			elseif ($wordy = "Shlds")
				getWord $stats $SHIELDS  		($current_word + 1)
			elseif ($wordy = "Hlds")
				getWord $stats $TOTAL_HOLDS   		($current_word + 1)
			elseif ($wordy = "Ore")
				getWord $stats $ORE_HOLDS    		($current_word + 1)
			elseif ($wordy = "Org")
				getWord $stats $ORGANIC_HOLDS    	($current_word + 1)
			elseif ($wordy = "Equ")
				getWord $stats $EQUIPMENT_HOLDS    	($current_word + 1)
			elseif ($wordy = "Col")
				getWord $stats $COLONIST_HOLDS    	($current_word + 1)
			elseif ($wordy = "Phot")
				getWord $stats $PHOTONS   		($current_word + 1)
			elseif ($wordy = "Armd")
				getWord $stats $ARMIDS   		($current_word + 1)
			elseif ($wordy = "Lmpt")
				getWord $stats $LIMPETS   		($current_word + 1)
			elseif ($wordy = "GTorp")
				getWord $stats $GENESIS  		($current_word + 1)
			elseif ($wordy = "TWarp")
				getWord $stats $TWARP_TYPE  		($current_word + 1)
			elseif ($wordy = "Clks")
				getWord $stats $CLOAKS   		($current_word + 1)
			elseif ($wordy = "Beacns")
				getWord $stats $BEACONS 		($current_word + 1)
			elseif ($wordy = "AtmDt")
				getWord $stats $ATOMIC  		($current_word + 1)
			elseif ($wordy = "Corbo")
				getWord $stats $CORBO   		($current_word + 1)
			elseif ($wordy = "EPrb")
				getWord $stats $EPROBES   		($current_word + 1)
			elseif ($wordy = "MDis")
				getWord $stats $MINE_DISRUPTORS   	($current_word + 1)
			elseif ($wordy = "PsPrb")
				getWord $stats $PSYCHIC_PROBE  		($current_word + 1)
			elseif ($wordy = "PlScn")
				getWord $stats $PLANET_SCANNER  	($current_word + 1)
			elseif ($wordy = "LRS")
				getWord $stats $SCAN_TYPE    		($current_word + 1)
			elseif ($wordy = "Aln")
				getWord $stats $ALIGNMENT    		($current_word + 1)
			elseif ($wordy = "Exp")
				getWord $stats $EXPERIENCE    		($current_word + 1)
			elseif ($wordy = "Corp")
				getWord $stats $CORP   			($current_word + 1)
			elseif ($wordy = "Ship")
				getWord $stats $SHIP_NUMBER   		($current_word + 1)
			end
			add $current_word 1
			getWord $stats $wordy $current_word
		end
		setVar $t_holds $ORE_HOLDS
		add $t_holds $ORGANIC_HOLDS
		add $t_holds $EQUIPMENT_HOLDS
		add $t_holds $COLONIST_HOLDS
		setVar $EMPTY_HOLDS $TOTAL_HOLDS
		subtract $EMPTY_HOLDS $t_holds
		
	:doneQuikstats
		killtrigger prompt1
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger statlinetrig
		killtrigger getLine2

return

:updateStats
	setvar $stuff "Target Sectors: " & $StatTargetSectors & "*Sectors Approached: " & $StatSectorsApproached & "*Sectors PGridded:" & $StatsectorsPgridded
	setVar $stuff $stuff & "*Sectors Pass Grid:" & $StatsectorsPassiveGridded & "*Sectors Skipped:" & $StatsectorsSkipped & "*Targets Reached:" & $StatTargetsReached & "** Mines Deployed:" & $StatminesDeployed & "* Limpets Deployed:" & $StatlimpetsDeployed 
	setVar $stuff $stuff & "*Disrupters Fired:" & $StatdisruptersUsed & "*Times Restocked:" & $Statrestocked & "*Times exited:" & $Statexits & "*  "
	setWindowContents planetGridder $stuff
	add $statsUpdated 1
	if ($statsUpdated > 10)
		setVar $statsUpdated 1
		#send "'PGridding Update - Sectors: " $planetsPoppedGood "/" $planetsPopped " Cash: " $cashMade "*"
	end
return

:getXportShipSector
	send "czq"
	waitfor "-----------------------------------------------------------------------------"
	:shipsagain
	setTextTrigger shipsDone :shipsDone "Computer command ["
	setTextLineTrigger shipFound :shipFound ""
	pause
		:shipFound
		killalltriggers
		getWord CURRENTLINE $maybeship 1
		isNumber $test $maybeship
		if ($test)
			if ($maybeship = $xportShip)
				getWord CURRENTLINE $xportShipSector 2
				setVar $xportShipFound true

				goto :shipsDone
			end
		else
			if ($maybeship = "Computer")
				goto :shipsDone
			end
			
		end
		goto :shipsagain
	:shipsDone
		killalltriggers

return
:dashpause
	
	echo "*Press the dash to continue*"
	setTextOutTrigger dashpauseGo :dashpauseGo "-"
	pause
	:dashpauseGo
		killtrigger :dashpauseGo
return
halt

include "_SupG_Script_Pack\supginclude\nearfig_inc"
include "Hammer_Basic_Settings"