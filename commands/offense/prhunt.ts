gosub :BOT~loadVars

loadVar $game~port_max
loadvar $MAP~STARDOCK
loadVar $bot~Folder
loadVar $game~photon_duration

setVar $BOT~help[1]  $BOT~tab&" PRHunt - Port Report Hunter - Foton"
setVar $BOT~help[2]  $BOT~tab&""
setVar $BOT~help[3]  $BOT~tab&" prhunt [foton/announce/checkports/fotonlist] {120 120 15 120}"
setVar $BOT~help[4]  $BOT~tab&"        {bwarp} {3warp/4warp/5warp/6warp}"
setVar $BOT~help[5]  $BOT~tab&"  "
setVar $BOT~help[6]  $BOT~tab&" foton - Scans ports and fires foton at tertiary port."
setVar $BOT~help[7]  $BOT~tab&" announce - Primary/Secondary search only, announces hits. "
setVar $BOT~help[8]  $BOT~tab&" fotonlist - Supply list of ports; it will scan those only "
setVar $BOT~help[9]  $BOT~tab&"             and attempt to foton. "
setVar $BOT~help[10]  $BOT~tab&" checkports - Must be run regularly for accurate targetting. "
setVar $BOT~help[11]  $BOT~tab&"  "
setVar $BOT~help[12]  $BOT~tab&" Search Pattern"
setVar $BOT~help[13]  $BOT~tab&"   1) Primary   - wide search any open port with greater or equ"
setVar $BOT~help[14]  $BOT~tab&"                  {3warp/4warp/5warp/6warp} warps. 4 default."
setVar $BOT~help[15]  $BOT~tab&"   2) Secondary - Scan 120 ports 120 times for second hit"
setVar $BOT~help[16]  $BOT~tab&"   3) Tertiary  - Scan 20 nearest ports with firing solutions"
setVar $BOT~help[17]  $BOT~tab&"                  240 times looking for a foton shot"
setVar $BOT~help[18]  $BOT~tab&" "
setVar $BOT~help[19]  $BOT~tab&" When Tertiary port is covered it attempts to foton."
setVar $BOT~help[20]  $BOT~tab&" "
setVar $BOT~help[21]  $BOT~tab&" Above numbers are default config with {n1 n2 n3 n4} "
setVar $BOT~help[22]  $BOT~tab&"     = {2ndPort# 2ndScanTimes TertPort# TertScanTimes}"
setVar $BOT~help[23]  $BOT~tab&"     prhunt 60 250 15 200 "
setVar $BOT~help[24]  $BOT~tab&"     - Scan 60 secondary ports 250 times"
setVar $BOT~help[25]  $BOT~tab&"     - Scan 15 tertiary ports 200 times"
setVar $BOT~help[26]  $BOT~tab&"     "
setVar $BOT~help[27]  $BOT~tab&" {bwarp} - uses bwarp from citadel prompt"
setVar $BOT~help[28]  $BOT~tab&" Additional planet (foton/fotonlist) Options:"
setVar $BOT~help[29]  $BOT~tab&" {kill}     - pgrid into sector and attempt kill"
setVar $BOT~help[30]  $BOT~tab&"              WARNING: Does not check for target or Saveme"
setVar $BOT~help[31]  $BOT~tab&" {surround} - (optimistically) surrounds sector before kill "
setVar $BOT~help[32]  $BOT~tab&" {pig}      - Bring a friend to lift and IG during kill cycle"
setVar $BOT~help[33]  $BOT~tab&" {direct}   - Skip secondary scan"



# making a varibale for stesting
setVar $sectors SECTORS
  
gosub :combat~init 

loadVar $player~surroundFigs
gosub :bot~helpfile

setVar $BOT~script_title "PRHunt - Port Report Hunter Starting"
gosub :BOT~banner

setVar $ship~CAP_FILE		"_MOM_" & GAMENAME & ".ships"
fileExists $CAP_FILE_chk $ship~CAP_FILE
if ($CAP_FILE_chk)
	gosub :ship~loadshipinfo
else
	gosub :ship~getShipCapStats
	gosub :ship~loadShipInfo
end 




setVar $cline $bot~user_command_line

setVar  $prhunt_logfile     $bot~Folder&"/prhunt.txt"

gosub :player~quikstats

setVar $attackPattern ""
setVar $fotonKill 0
setVar $fotonSurround 0
setVar $fotonPig 0

getWordPos $cline $pos "fotonlist"
if ($pos > 0)
	setVar $attackPattern "fotonlist"
	# create list
	# bwarp option ok
	# confirm list to subspace
	setVar $attackmsg "Using port list for targets"
	replaceText $cline "fotonlist" ""
	getWordPos $cline $pos "kill"
	if ($pos > 0)
		replaceText $cline "kill" ""
		setVar $fotonKill 1
		
		
		getWordPos $cline $pos "pig"
		if ($pos > 0)
			replaceText $cline "pig" ""
			setVar $fotonPig 1
		end
		getWordPos $cline $pos "surround"
		if ($pos > 0)
			replaceText $cline "surround" ""
			setVar $fotonSurround 1
			setVar $attackmsg $attackmsg & "*Kill Mode Engaged with Suround!*Need saveme bot on planet!"
		else
			setVar $attackmsg $attackmsg & "*Kill Mode Engaged!*Need saveme bot on planet!"
		end
	end

else
	getWordPos $cline $pos "foton"
	if ($pos > 0)
		setVar $attackPattern "foton"
		setVar $attackmsg "Foton Mode - Scanning for firing solutions."
		replaceText $cline "foton" ""
		getWordPos $cline $pos "kill"
		if ($pos > 0)
			replaceText $cline "kill" ""
			setVar $fotonKill 1

			getWordPos $cline $pos "pig"
			if ($pos > 0)
				replaceText $cline "pig" ""
				setVar $fotonPig 1
			end

			getWordPos $cline $pos "surround"
			if ($pos > 0)
				replaceText $cline "surround" ""
				setVar $fotonSurround 1
				setVar $attackmsg $attackmsg & "*Kill Mode Engaged with Suround!*Need saveme bot on planet!"
			else
				setVar $attackmsg $attackmsg & "*Kill Mode Engaged!*Need saveme bot on planet!"
			end
		end
		getWordPos $cline $pos "direct"
		if ($pos > 0)
			replaceText $cline "direct" ""
			setVar $directscan 1
			setVar $attackmsg $attackmsg & "*Skipping Secondary scan and going for direct scan"
		else
			setVar $directscan 0

		end
		

	else
		getWordPos $cline $pos "checkports"
		if ($pos > 0)
			goSub :getAllBlocked
			halt
		else
			getWordPos $cline $pos "announce"

			if ($pos > 0)
				setVar $attackPattern "announce"
				setVar $attackmsg "Search mode only will announce targets."
				replaceText $cline "announce" ""
			else
				setVar $SWITCHBOARD~message "Please include a task: foton, fotonlist, announce or checkports*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		end
	end
end

# Encase people used these switches in wrong mode
replaceText $cline "kill" ""
replaceText $cline "surround" ""
replaceText $cline "pig" ""

setVar $SWITCHBOARD~message $attackmsg & "*"
gosub :SWITCHBOARD~switchboard				
			
				


replaceText $cline "  " " "
replaceText $cline "  " " "

if (($attackPattern = "fotonlist") or ($attackPattern = "foton"))
	if ($player~photons = 0)
		setVar $SWITCHBOARD~message "A verbal barrage won't do, give me photons!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
end

setVar $currentPlanet 0
setVar $startingLocation $PLAYER~CURRENT_PROMPT
if (($startingLocation <> "Command") and ($startingLocation <> "Citadel"))
	setVar $SWITCHBOARD~message "Start from the command prompt or a citadel prompt.*"
	gosub :SWITCHBOARD~switchboard
	halt
else
	if (($attackPattern = "fotonlist") or ($attackPattern = "foton"))

		if ($startingLocation = "Command")
			setVar $attackMethod "t"
			setVar $minOre 120
			if ($player~total_holds < $minOre)
				setVar $minOre $player~total_holds
			end
			if ($player~ore_holds < $minOre)
				setVar $SWITCHBOARD~message "We need ore!*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
			if ($player~TWARP_TYPE = 0)
				setVar $SWITCHBOARD~message "We need TWARP!*"
				gosub :SWITCHBOARD~switchboard
				halt
			end

			setVar $SWITCHBOARD~message "Starting from sector level - twarp foton being used!*"
			gosub :SWITCHBOARD~switchboard
		else
			send "q"
			goSub :PLANET~getPlanetInfo
			send "c"
			setVar $currentPlanet $planet~planet
			
			if ($fotonKill = 1)
				setVar $targeting~PLANET $planet~planet
				gosub :targeting~initializetargeting
				send "qmnt*c"
			end
			
			if ($fotonPig = 1)
				send "'pig lift*"
				setDelayTrigger pig1 :pig1 2000
				pause
				:pig1
				killalltriggers

				send "'pig ig on*"
				setDelayTrigger pig2 :pig2 2000
				pause
				:pig2
				killalltriggers

				send "'pig land " $planet~planet "*"
				setDelayTrigger pig3 :pig3 2000
				pause
				:pig3
				killalltriggers
				
				send "'pig saveme on*"

			end
			getWordPos $cline $pos "bwarp"
			if ($pos > 0)
				replaceText $cline "bwarp" ""
				replaceText $cline "  " " "
				if ($planet~planet_TPad > 5)
					setVar $attackMethod "b"
					setVar $SWITCHBOARD~message "Starting from planet - using bwarp.*"
					gosub :SWITCHBOARD~switchboard
				else
					setVar $SWITCHBOARD~message "Planet Teleporter should be at least upgraded to 5.*"
					gosub :SWITCHBOARD~switchboard
					halt
				end
			else
				if (($planet~citadel > 3) and ($planet~planet_FUEL > 10000))
					setVar $attackMethod "p"
					setVar $SWITCHBOARD~message "Starting from planet - using planet warp.*"
					gosub :SWITCHBOARD~switchboard
				else
					setVar $SWITCHBOARD~message "Planet below level 4 or low on ore, us BWARP option to override.*"
					gosub :SWITCHBOARD~switchboard
					halt
				end
			end
		end
	end
end


# NUMBER OF WARPS SECTOR HAS FOR PRIMARY SEARCH
setVar $primaryPattern 4

getWordPos $cline $pos "3warp"
if ($pos > 0)
	replaceText $cline "3warp" ""
	replaceText $cline "  " " "	
	setVar $primaryPattern 3
end

getWordPos $cline $pos "4warp"
if ($pos > 0)
	replaceText $cline "4warp" ""
	replaceText $cline "  " " "	
	setVar $primaryPattern 4
end

getWordPos $cline $pos "5warp"
if ($pos > 0)
	replaceText $cline "5warp" ""
	replaceText $cline "  " " "	
	setVar $primaryPattern 5
end

getWordPos $cline $pos "6warp"
if ($pos > 0)
	replaceText $cline "6warp" ""
	replaceText $cline "  " " "	
	setVar $primaryPattern 6
end
# just in case of mistakes
replaceText $cline "bwarp" ""
replaceText $cline "  " " "



# Bot Variable
setVar $map~stardock $MAP~STARDOCK


# Number of targets we want once we go to secondary search
setVar $secondaryTargets 180

# How many sectors we'll search before giving up on 20 (should really be distance)
setVar $targetSearchDepth 1500

# We will burst this many scans - means we have more oppurtunity to get a recent target on 
# the large  - still requires some luck
setVar $maxPortScans 120

# Will scan $maxPortScans port $scanTimes2ndList times - think its 120 ports per second? or 60 -check
setVar $scanTimes2ndList 60

# time = ($maxPortScans/60) * $scanTimesMidList =  240 secs - 4 mins


# Scans the narrow target lsit this many times $scanTimesPdropList - this will be quick!
setVar $scanTimesPdropList 240


# no longer get a port scan but we know a port should be there
setArray $sectorBlocked $sectors

# have figs for speed
setArray $sectorHasFig $sectors


# how many ports we want to scan when looking for direct photon. 15 in 250ms
SetVar $solutionsRequired 20

# How far a firing solution can be from origin hit
setVar $maxDistanceFromOrigin 6

# Max courses we'll check before giving up on the hunt
setVar $maxCoursesPlotted 600

#stores Firing Solutions and Count
setVar $firingSolutions 0
setVar $fsi 0




if ($attackPattern <> "fotonlist")
	if ($cline <> "")
		getword $cline $secCount 1
		isNumber $number $secCount
	
		if (($number = 1) and ($secCount <> 0))
			
			getword $cline $secTimes 2
			isNumber $number2 $secTimes
			getword $cline $tertCount 3
			isNumber $number3 $tertCount
			getword $cline $tertTimes 4
			isNumber $number4 $tertTimes

			if (($number2 = 1) and ($secTimes <> 0) and ($number3 = 1) and ($tertCount <> 0) and ($number4 = 1) and ($tertTimes <> 0))
				setVar $secondaryTargets $secCount
				setVar $scanTimes2ndList $secTimes
				setVar $solutionsRequired $tertCount
				setVar $scanTimesPdropList $tertTimes
				setVar $SWITCHBOARD~message "Using search patter " & $secCount & " " & $secTimes & " " & $tertCount & " " & $tertTimes & "*"
				gosub :SWITCHBOARD~switchboard
			else
				
				setVar $SWITCHBOARD~message "Must structure command prhunt 2ndPort# 2ndScanTimes TertPort# TertScanTimes*"
				gosub :SWITCHBOARD~switchboard
			end

		else

			setVar $SWITCHBOARD~message "Using default search pattern.*"
			gosub :SWITCHBOARD~switchboard

		end
	end
end


clearAllAvoids
	
goSub :loadAllBlocked




setVar $largeList 0
setVar $largeListSize 0

setVar $smallList 0
setVar $smallListSize 0

setVar $whichlist 1
setVar $totalTargets 0

setVar $first 1


setVar $homeSector CURRENTSECTOR

send "c"
waitfor "<Computer activated>"


if (($attackPattern = "foton") or ($attackPattern = "announce"))
	# Large Array of Sectors to Hunt
		:restart1
		setVar $startTargets 0
		setVar $startTargetsi 0

		setVar $i 11

		 while ($i <= $sectors)
			if (PORT.EXISTS[$i] = 1)
				if (SECTOR.WARPCOUNT[$i] >= $primaryPattern)
					getSectorParameter $i "FIGSEC" $hasFig
					if (($hasFig <> 1) and ($i <> $map~stardock))
						add $startTargetsi 1
						setVar $startTargets[$startTargetsi] $i
					end

				end
					 
			end
			add $i 1
		end
		
		#Search 1
		

			setVar $largeListSize $startTargetsi
			:search1
			setVar $scanThisManyTimes 0
			setVar $whichlist 1
			setVar $totalTargets 0
			goSub :setSectorList

			#returns $targetList $totalTargets

			setVar $targetFound 0
			goSub :monitorList
			
			if ($directscan = 1)
				send "'Found a primary hit " $targetFound ", going for direct approach.*"
				goto :skipTo3
			else
				send "'Found a primary hit " $targetFound ", narrowing search*"
			end
		#Search 2

			# $targetFound now gets origin of search pattern - lets get nearest sectors and narrow the search

			# Returns :$startTargets
			# Takes: $targetFound $targetSearchDepth $secondaryTargets
			goSub :getLimitedTargets

			# $startTargets Now populatd with close targets
			# lets do one filter scan to ensure reports are good then monitor

			:search2
			setVar $whichlist 2
			setVar $totalTargets 0
			goSub :setSectorList
			
			# now we monitor that list of close by targets
			setVar $scanThisManyTimes $scanTimes2ndList
			setVar $targetFound 0
			goSub :monitorList
			if ($targetFound = 0)
				
				send "'Failed to find target in secondary list; resuming full search*"
				setVar $i 1
				setVar $startTargetsi $largeListSize
				setVar $startTargets 0
				while ($i <= $largeListSize)
					setVar $startTargets[$i] $largeList[$i]
					add $i 1
				end
		
				goto :search1
			end

		send "'Found secondary hit: " $targetFound "*"
end

		# SEARCH 3
			:skipTo3
			goSub :getFiringSolutions
			
			if ($fsi = 0)
				setVar $SWITCHBOARD~message "No firing solutions? Halting.. *"
				gosub :SWITCHBOARD~switchboard
				halt

			end


			setVar $startTargets 0
			setVar $f 1
			while ($f <= $fsi)
				setVar $startTargets[$f] $firingSolutions[$f][2]
				add $f 1
			end
			setVar $startTargetsi $fsi

			setVar $whichlist 3
			setVar $totalTargets 0
			goSub :setSectorList
			
			# now we monitor that list of close by targets
			
			if ($attackPattern = "fotonlist")
				# just keeeeeep scanning
				setVar $scanThisManyTimes 999999
			else
				setVar $scanThisManyTimes $scanTimesPdropList
			end
			setVar $targetFound 0
			goSub :monitorList

			if ($targetFound = 0)
				if ($directscan = 1)
					send "'Failed to find target  - Scanning again *"
					goto :restart1
				else

					send "'Failed to find target in teritary list; resuming secondary search*"
					setVar $i 1
					setVar $startTargetsi $smallListSize
					setVar $startTargets 0
					while ($i <= $smallListSize)
						setVar $startTargets[$i] $smallList[$i]
						add $i 1
					end
					goto :search2
				end
			else
				gosub :boomboomboomshaketheroom
			end
			
			
		# dosomething with $targetFound



halt

:boomboomboomshaketheroom
	
	setVar $landing 0
	setVar $attacking 0

	setVar $f 1
	while ($f <= $fsi)
		if ($firingSolutions[$f][2] = $targetFound)
			setVar $landing $firingSolutions[$f][1]
			setVar $attacking $firingSolutions[$f][2]
		end
		add $f 1
	end
	send "q"
	if (($attackMethod = "t") or ($attackMethod = "b"))
		if ($attackMethod = "t")
			send "m" $landing "*y"
		else
			send "b" $landing "*y"
		end
		setTextLineTrigger twarpyes :twarpyes "ocating beam pinpointed, TransWarp"
		setTextLineTrigger twarpno :twarpno "No locating beam found for sector"
		pause
			:twarpno
			killalltriggers
			send "'No Twarp Lock!! Script halting :(*"
			halt
			:twarpyes
			killalltriggers
			send "y * "
	elseif ($attackMethod = "p")
		send "p" $landing "*y"

		setTextLineTrigger pwarpno :pwarpno "Your own fighters must be in the destination to make a sa"
		setTextLineTrigger pwarpyes :pwarpyes "Planetary TransWarp Drive Engaged!"
		pause
		:pwarpno
			killalltriggers
			send "'No Pwarp Lock!! Script Halting :(*"
			halt
		:pwarpyes
			killalltriggers
			

	end
	send "cpy" $attacking "*q"
	send "'Fired photon from " $landing " to " $attacking "*"
	
	if (($attackmethod = "t") or ($attackmethod = "b"))
		
		goSub :doHolo

		#waitfor success - move home
		send "m" $homeSector "*y"
		waitfor "ating beam pinpointed, Tran"
		send "y"
	else

		if ($fotonKill = 1)
			
			setTextLineTrigger photonOver :photonOver "Photon Wave Duration has ended in sector"
			setDelayTrigger photonOver2 :photonOver2 (($game~photon_duration * 1000) + 1000)
			pause
			:photonOver
			:photonOver2
				killalltriggers

				setVar $BOT~command "pgrid " & $attacking
				setVar $bot~user_command_line " pgrid "& $attacking 
				setVar $bot~parm1 $attacking
				saveVar $bot~parm1
				saveVar $BOT~command
				saveVar $bot~user_command_line
				load "scripts\mombot\commands\grid\pgrid.cts"
				setEventTrigger        pgridended        :pgridended "SCRIPT STOPPED" "scripts\mombot\commands\grid\pgrid.cts"
				pause
				:pgridended
					killalltriggers
				
				if ($fotonPig = 1)
					send "'pig lift*"
				end
				if ($fotonSurround = 1)
					gosub :player~quikstats

					send "qq"
					gosub :grid~surround
					send "l" $currentPlanet "*c"
					waitfor "<Enter Citadel>"
					gosub :targeting~scanitcitkill
				else
					gosub :targeting~scanitcitkill
				end
				
				send "p" $homeSector "*y"

		else
				
			goSub :doHolo
			#waitfor success - move home
			send "p" $homeSector "*y"
		end
	end

return

:doHolo
	setVar $BOT~command "holo"
	setVar $BOT~user_command_line " holo"
	
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\mombot\commands\data\holo.cts"
	setEventTrigger        holoend1        :holoend1 "SCRIPT STOPPED" "scripts\mombot\commands\data\holo.cts"
	pause
	:holoend1
		killalltriggers

return
:setSectorList
	
	send "'Setting sector list of " $startTargetsi " targets*"

	setVar $targetList 0
	setVar $targetListi 0
	setVar $i 1

	while ($i <= $startTargetsi)

		send "r" $startTargets[$i] "*"
		add $i 1
	end


	setVar $gathered 0

	:startportagain
	if ($gathered = $startTargetsi)
		goto :startportfinish
	end

	setTextLineTrigger startportok :startportok "Commerce report for"
	setTextLineTrigger startportnook :startportnook "I have no information about a port in that sector"
	setTextLineTrigger startportreallynotok :startportreallynotok "u have never visted sector"
	pause
		:startportok
			killalltriggers
			add $gathered 1
			add $targetListi 1
			setVar $targetList[$targetListi] $startTargets[$gathered]
			if ($first = 0)
				#send "'Targets: " $startTargets[$gathered] "*"
			end
			goto :startportagain
		:startportnook
		:startportreallynotok
			add $gathered 1
			setVar $sectorBlocked[$startTargets[$gathered]] 1
			killalltriggers
			setVar $logentry " Missing On-Set (update cim?): " & $startTargets[$gathered]
			goSub :writeLog
			goto :startportagain


	:startportfinish
	setVar $first 0
	
	setVar $totalTargets $targetListi

	if ($whichlist = 1)
		setVar $i 1
		# wipe it
		setVar $largeList 0
		while ($i <= $totalTargets)
			setVar $largeList[$i] $targetList[$i]
			add $i 1
		end
		setVar $largeListSize $totalTargets
	elseif ($whichlist = 2)
		setVar $i 1
		# wipe it
		setVar $smallList 0
		while ($i <= $totalTargets)
			setVar $smallList[$i] $targetList[$i]
			add $i 1
		end
		setVar $smallListSize $totalTargets
	end
	send "'" $totalTargets " viable targets found*"

	echo "*############################"
	echo "*### EXITING setSectorList"
return


:monitorList
	
	# if list is smaller than the Max Port Scans - then lets only send that many
	# we don't want to compromise speed
	setVar $bannerCount 0

	setVar $announceTarget 0
	setVar $scanMsg ""
	setVar $targetFound 0
	setVar $loops 0
	if ($scanThisManyTimes = 0)
		setVar $scanThisManyTimes 9999999
		setVar $scanMsg "Scanning " & $totalTargets & " targets..."
	else
		setVar $scanMsg "Scanning " & $totalTargets & " targets " & $scanThisManyTimes & " times"
	end
	
	send "'" $scanMsg "*"

	if ($totalTargets <  $maxPortScans)
		setVar $maxPortScansApplied $totalTargets
	else
		setVar $maxPortScansApplied $maxPortScans
	end
	setVar $go 1
	
	echo "*############################"
	echo "*### ENTERING monitorLIst"
	echo "*### $totalTargets " $totalTargets
	echo "*### $maxPortScansApplied " $maxPortScansApplied

	setVar $monitorTargets 0
	setVar $monitorTargetsi 0
	# This will monitor where we are in the port loop
	setVar $targeti 1
	while ($go = 1)

		

		setVar $i 1
		
		# ($i <= $totalTargets) and 
		
		# Record where are starting for when we grab reports
		SetVar $loopTargeti $targeti
		while ($i <= $maxPortScansApplied)

			send "r" $targetList[$targeti] "*"
			add $targeti 1
			if ($targeti > $totalTargets)
				setVar $targeti 1
				if ($whichlist = 1)
					setVar $bannerCount ($bannerCount + $totalTargets)
					# roughly every 2 mins
					if ($bannerCount > 7200)
						send "'PRHunt active*"
						setVar $bannerCount 0
					end

				end

			end
			add $i 1
		end
		setVar $totalSent ($i -1)
		send "?"

		setVar $monitorGathered 0

		:monitorportagain
		if ($monitorGathered = $totalSent)
			goto :monitorportfinish
		end

		setTextLineTrigger monitorportok :monitorportok "Commerce report for"
		setTextLineTrigger monitorportnook :monitorportnook "I have no information about a port in that sector"
		setTextLineTrigger monitorportreallynotok :monitorportreallynotok "u have never visted sector"
		pause
			:monitorportok
				killalltriggers
				# how many we've collected
				add $monitorGathered 1
				# where are in the ports loop
				add $loopTargeti 1
				if ($loopTargeti > $totalTargets)
					setVar $loopTargeti 1
				end
				goto :monitorportagain
			:monitorportnook
				killalltriggers
				add $monitorGathered 1
				
				if (($attackPattern = "announce") and ($whichlist = 2))
					setVar $c 1
					setVar $found 0
					while ($c <= $monitorTargetsi)
						if ($monitorTargets[$c] = $targetList[$loopTargeti])
							setVar $found 1
						end
						add $c 1
					end
					if ($found = 0)
						setVar $announceTarget 1
						add $monitorTargetsi 1
						setVar $monitorTargets[$monitorTargetsi] $targetList[$loopTargeti]
						send "'PORT G0NE: " $targetList[$loopTargeti] "*"
					end

				else
					add $monitorTargetsi 1
					setVar $monitorTargets[$monitorTargetsi] $targetList[$loopTargeti]
					send "'PORT GONE: " $targetList[$loopTargeti] "*"
					setVar $logentry "PORT GONE: " & $targetList[$loopTargeti]
					goSub :writeLog

				end

				add $loopTargeti 1
				if ($loopTargeti > $totalTargets)
					setVar $loopTargeti 1
				end
				goto :monitorportagain
			:monitorportreallynotok
				killalltriggers
				add $monitorGathered 1
				add $loopTargeti 1
				if ($loopTargeti > $totalTargets)
					setVar $loopTargeti 1
				end
				goto :monitorportagain
			

		:monitorportfinish

		if (($attackPattern = "announce") and ($whichlist = 2))
			if ($announceTarget = 1)
				send "'Targets where found this loop, resetting counter*"
				
				setVar $announceTarget 0
				setVar $loops 0
			end
		else
			if ($monitorTargetsi > 0)
				setVar $targetFound 0
				
				echo "*######### TARGETS FOUND!"

				setVar $y 1
				while ($y <= $monitorTargetsi)
					echo $monitorTargets[$y] "*"
					# Keep highest sector, has highest probability of being most recent
					setVar $targetFound $monitorTargets[$y]
					add $y 1
				end

				setVar $go 0
			end
		end
		
		add $loops 1
		if ($loops >= $scanThisManyTimes)
			return
		end

	end



return

# Returns :$startTargets
# Takes: $targetFound $targetSearchDepth $secondaryTargets
:getLimitedTargets

	
	getNearestWarps $nearest $targetFound
	setVar $startTargets 0
	setVar $startTargetsi 0

	setVar $i 1
	while ($i <= $nearest)
		setVar $sector $nearest[$i]
		if (PORT.EXISTS[$sector] = 1)
			getSectorParameter $sector "FIGSEC" $hasFig
			if (($hasFig <> 1) and ($sector <> $map~stardock))
				
				add $startTargetsi 1
				setVar $startTargets[$startTargetsi] $sector
			end

			
				 
		end

		if ($i > $targetSearchDepth)
send "'Target Search Depth exceeded, hunting " $startTargetsi " targets.*"
			setVar $i 99999
		end
		if ($startTargetsi > $secondaryTargets)
send "'" $secondaryTargets " Targets found*"
			setVar $i 99999
		end
	
		add $i 1
	end

return


:getFiringSolutions
	
	if ($attackPattern = "foton")
		goSub :getFiringSolutions_calculate
	else
		goSub :getFiringSolutions_selfserve
	end

return

:getFiringSolutions_selfserve
	# we will be a little more relaxed about what counts here
	# must have a incoming warp with a fig - if they all have figs 
	# then you needed to choose better..
		

	setVar $firingSolutions 0
	setVar $fsi 0


	setVar $i 1
	getWord $cline $sector $i
	while (($sector <> "") and ($sector <> 0))
		
		if (($sector > 10) and ($sector <> $map~stardock))
			setVar $y 1
			setVar $hasAFig 0
			while ($y <= SECTOR.WARPINCOUNT[$sector])
				if ($sectorHasFig[SECTOR.WARPSIN[$sector][$y]] = 1)
					setVar $hasAFig SECTOR.WARPSIN[$sector][$y]
				end
				add $y 1
			end
			if ($hasAFig > 0)
				add $fsi 1
				setVar $firingSolutions[$fsi][1] $hasAFig
				setVar $firingSolutions[$fsi][2] $sector

			end
		end
		add $i 1
		getWord $cline $sector $i

		if ($i > 999)
			echo "Probably broke something here in the loop... "
			halt
		end
	end
return

:getFiringSolutions_calculate
	setVar $firingSolutions 0
	setVar $fsi 0

	# LOOKS FOR TARGETS TWO WAYS 
	#    1: Plots Courses from target sector (lost port) to our figs looknig for clear paths
	#       with a port adjacent. Idea being that port gets covered we foton that sector quickly
	#
	#    2: Look for figs which have empty ports next door. The sector next door must have clear
	#       warps in - so there is a chance they can warp in directly or passively to be viable
	#

	# $firingSolutions[x][1] SECTOR WE LAND
	# $firingSolutions[x][2] SECTOR WE PORT SCAN


	setVar $looking 1
	setVar $lookat 2
	setVar $looked 1
	getNearestWarps $nearest $targetFound



	# when plotting firing solutions we'll block sectors to stop solutions we already have
	setArray $blockSearch $sectors

	setVar $course 0
	while ($course <= $maxDistanceFromOrigin)

		setVar $sector $nearest[$lookat]
		if ($sectorHasFig[$sector] = "1")

			getCourse $course $targetFound $sector
			if ($course = 1)
				goto :skipnextdoor
			end
			setVar $isBlockedCourse 0
			setVar $hasBlockedPorts 0
			setVar $lastport 0
			setVar $b 2
			while ($b <= $course)
				
				// Fig in way and NOT $course
				if ($sectorHasFig[$course[$b]] = "1")
					setVar $blockSearch[$course[$b]] 1
				end
				// Is Port Blocked
				if ($sectorBlocked[$course[$b]] = "1")
					setVar $hasBlockedPorts 1
				end

				if (PORT.EXISTS[$course[$b]] = 1)
					setVar $lastport 1
				else
					setVar $lastport 0
				end
				if ($blockSearch[$course[$b]] = 1)
					setVar $b 99
					setVar $isBlockedCourse 1
				end
				add $b 1
			end

			#Last sector before fig is a PORT, is not a blocked route and has no blocked ports in route
			if (($isBlockedCourse = 0) and ($hasBlockedPorts = 0) and ($lastport = 1))
				#echo "GOOD COURSE to target :" $sector " " 

				setVar $b 1
				while ($b <= $course)
					#echo $course[$b] " >" 
					add $b 1
				end
				#echo "    "
				#echo "Blocking: " $course[$course] " " $sector
				setVar $blockSearch[$course[$course]] 1
				setVar $blockSearch[$sector] 1
				#echo "*"
				add $fsi 1
				setVar $firingSolutions[$fsi][1] $sector
				setVar $firingSolutions[$fsi][2] $course[$course]
			end

			
		end
		
		if ($fsi >= $solutionsRequired)
			setVar $course 99
		end
		add $looked 1
		if ($looked > $maxCoursesPlotted)
			
			setVar $course 99
		end
		:skipnextdoor
		add $lookat 1

	end

	if ($fsi < $solutionsRequired)


		setVar $looking 1
		setVar $lookat 1
		while ($looking = 1)


			setVar $sector $nearest[$lookat]
			
			if ($sectorHasFig[$sector] = "1")
				
				# Making it 3 warp in or greater, increase probability of hits?
				if (SECTOR.WARPCOUNT[$sector] > 2)
					setVar $i 1
					while ($i <= SECTOR.WARPCOUNT[$sector])
						if ((SECTOR.WARPS[$sector][$i] > 10) and (SECTOR.WARPS[$sector][$i] <> $map~stardock))
							if (PORT.EXISTS[SECTOR.WARPS[$sector][$i]] = 1)
								if (($sectorBlocked[SECTOR.WARPS[$sector][$i]] = "0") and ($sectorHasFig[SECTOR.WARPS[$sector][$i]] = "0"))
									# found potenial target - HAs Port, Not our Fig, Reporting, and not Fed
									# Must have more than 1 warp and one not our fig
									setVar $checkSector SECTOR.WARPS[$sector][$i]
									if (SECTOR.WARPINCOUNT[$checkSector] > 1)
										setVar $y 1
										setVar $allIncomingHaveFigs 1
										while ($y <= SECTOR.WARPINCOUNT[$checkSector])
											if ($sectorHasFig(SECTOR.WARPSIN[$checkSector][$y]) = 0)
												setVar $allIncomingHaveFigs 0
											end
											add $y 1
										end
										if ($allIncomingHaveFigs = 0)
											
											setVar $f 1
											# check we didn't log it in the course plots
											setVar $fsiFound 0
											while ($f <= $fsi)
												if ($checkSector = $firingSolutions[$f][2])
													setVar $fsiFound 1
												end
												add $f 1
											end
											if ($fsiFound = 0)
												#echo $sector " >> " SECTOR.WARPS[$sector][$i] "*"
												add $fsi 1
												setVar $firingSolutions[$fsi][1] $sector
												setVar $firingSolutions[$fsi][2] $checkSector
											end
										end
									end
									
								end
							end
						end
						add $i 1
					end
				end
			end
			if ($fsi >= $solutionsRequired)
				setVar $looking 0
			end
			if ($lookat > 600)
				setVar $looking 0
			end

			add $lookat 1
		end

		

		setVar $f 1
		# check we didn't log it in the course plots
		setVar $fsiFound 0
		while ($f <= $fsi)
			echo $firingSolutions[$f][1] " >> " $firingSolutions[$f][2] "*"
			add $f 1
		end
	end
return


:loadAllBlocked
	
	setVar $b 11
	while ($b <= $sectors)
		getSectorParameter $b "FIGSEC" $hasFig

		if ($hasFig <> "1")
			setVar $sectorHasFig[$b] 0
		else
			setVar $sectorHasFig[$b] 1
		end
		getSectorParameter $b "PORTBLKED" $blocked
		if ($blocked <> "1")
			setVar $sectorBlocked[$b] 0
		else
			setVar $sectorBlocked[$b] 1
		end
		add $b 1
	end
return
:getAllBlocked
	
	setVar $SWITCHBOARD~message "Updating all ports for being blocked...*"
	gosub :SWITCHBOARD~switchboard
	send "c"
	waitfor "<Computer activated>"
	setVar $reportsWanted 200
	setVar $x 11
	setVar $total 0
	setVar $totalFree 0

	:allBlockedNextWave
	setVar $sendCount 0
	setVar $sent 0

	while ($x <= $sectors)
		getSectorParameter $x "FIGSEC" $hasFig
		if ((PORT.EXISTS[$x] = 1) and ($hasFig <> 1))
			
			send "r" $x "*"
			add $sendCount 1
			add $total 1
			setVar $sent[$sendCount] $x
		elseif ($hasFig = 1)
			setVar $sectorHasFig[$x] 1
		end
		
		if ($sendCount >= $reportsWanted)
			send "#"
			goto :getAllBlockedReports
		end
		add $x 1

	end
	
	:getAllBlockedReports

	setVar $gathered 0
	:allBlockedagain
	if ($x >= $sectors)
		setVar $reportsWanted $sendCount
	end
	if ($gathered = $reportsWanted)
		if ($x >= $sectors)
			goto :allBlockedfinish
		else
			goto :allBlockedNextWave
		end
	end

	setTextLineTrigger allBlockedok :allBlockedok "Commerce report for"
	setTextLineTrigger allBlockednook :allBlockednook "I have no information about a port in that sector"
	setTextLineTrigger allBlockedreallynotok :allBlockedreallynotok "u have never visted sector"
	pause
		:allBlockedok
			killalltriggers
			add $gathered 1
			add $totalFree 1
			goto :allBlockedagain
		:allBlockednook
		:allBlockedreallynotok
			add $gathered 1
			setVar $sectorBlocked[$sent[$gathered]] 1
			setSectorParameter $sent[$gathered] "PORTBLKED" 1
			echo "Blocking " $sent[$gathered] " *"
			killalltriggers
			
			goto :allBlockedagain


	:allBlockedfinish
	setVar $SWITCHBOARD~message $total & " unfigged ports scanned; " & $totalFree & " are still reporting*"
	gosub :SWITCHBOARD~switchboard

	setVar $SWITCHBOARD~message "Blocked Ports are updated; please restart using preferred search pattern.*"
	gosub :SWITCHBOARD~switchboard
return

:writeLog

	getTime $time
	write $prhunt_logfile $time & " " & $logentry

return


include "source\module_includes\bot\loadvars\bot"
include "source\bot_includes\combat\init\combat"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\ship\loadshipinfo\ship"
include "source\bot_includes\ship\getshipcapstats\ship"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\targeting\initializetargeting\targeting"
include "source\bot_includes\grid\surround\grid"
include "source\bot_includes\targeting\scanitcitkill\targeting"
