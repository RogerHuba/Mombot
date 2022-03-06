# next steps
# store these as sector params so we can run the find normal space
#  useful for eprobing - perhaps even sector param all sectors normal/not normal
# broadcast findings - 
# find and calc nomral space seperately
# Store Bubble Doors/Tunnel Doors
# PARAM BUBBLEDOOR 1
# PARAM TUNNELDOOR INDEX i.e. so we can pair them up there will be, two 1's, two 2's up to two n's

gosub :BOT~loadVars

loadvar $MAP~STARDOCK
loadVar $bot~Folder

setVar  $normal_sector_file     $bot~Folder&"/normalsectors.txt"
setVar  $bubble_sector_file     $bot~Folder&"/bubblesectors.txt"


setVar $BOT~help[1]  $BOT~tab&"    Finds Big Bubbles and Big Tunnels"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&"    Self Mapping - NO ZTM Required - Day 0"
setVar $BOT~help[4]  $BOT~tab&"     "
setVar $BOT~help[5]  $BOT~tab&"    findbb [maxbubbles] {distgreater} {all} {calcsecs} {report} {ztmcalc}"
setVar $BOT~help[6]  $BOT~tab&" Options:"
setVar $BOT~help[7]  $BOT~tab&"    {all}        Finds Bubbles, Reports approx Size and"
setVar $BOT~help[8]  $BOT~tab&"                 calculates what sectors in or out of a "
setVar $BOT~help[9]  $BOT~tab&"                 bubble."
setVar $BOT~help[10] $BOT~tab&"                 "
setVar $BOT~help[11] $BOT~tab&"    {calcsecs}   Calcs what sectors in or out of bubbles."
setVar $BOT~help[12] $BOT~tab&"                 Writes to sector param WHICHBUB."
setVar $BOT~help[13] $BOT~tab&"    {report}     Reports findings previously"
setVar $BOT~help[14] $BOT~tab&"    {ztmcalc}    Calc bubble interior off known data"
setVar $BOT~help[15] $BOT~tab&"    [maxbubbles] How many to find"
setVar $BOT~help[16] $BOT~tab&"    "
setVar $BOT~help[17] $BOT~tab&"    Default findbb just calcs bubbles, reports to subspace and"
setVar $BOT~help[18] $BOT~tab&"    does guestimate."

gosub :bot~helpfile

setVar $BOT~script_title "Find BB - Find Big Bubbles and Big Tunnels"
gosub :BOT~banner

gosub :player~quikstats



setVar $startingLocation $PLAYER~CURRENT_PROMPT
if ($startingLocation <> "Command")
	setVar $SWITCHBOARD~message "Start from the command prompt please.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

setVar $bubblesToFind $bot~parm1
	
isNumber $test $bubblesToFind
if ($test = 0)
	setVar $SWITCHBOARD~message "Max Bubbles must be a number*"
	gosub :SWITCHBOARD~switchboard
	halt
else

end

setVar $minWarpDist $bot~parm2
if ($minWarpDist <> "") and ($minWarpDist <> 0)
	isNumber $test $minWarpDist
	if ($test = 1)
		

	end
else
	setVar $minWarpDist 18
end

setVar $SWITCHBOARD~message "Warp Distance greater than: " & $minWarpDist & "*"
gosub :SWITCHBOARD~switchboard

setVar $routeOrder 0

setVar $routeOrder[1] 9
setVar $routeOrder[2] 10
setVar $routeOrder[3] 11
setVar $routeOrder[4] 12
setVar $routeOrder[5] 8
setVar $routeOrder[6] 7
setVar $routeOrder[7] 6
setVar $routeOrder[8] 13
setVar $routeOrder[9] 14
setVar $routeOrder[10] 15
setVar $routeOrder[11] 16


# NEW ROUTINE GLOBALS
    setVar $useCim 1
    setVar $nearestWarp 4

	setVar $courseIsClosed 1

	setVar $validBubble 0
	setVar $validTunnel 0

	setVar $testGroupA 0
	setVar $testGroupB 0
	setVar $groupAi 1
	setVar $groupBi 1
	setVar $groupABlocked 0
	setVar $groupBBlocked 0
	setvar $firsthalf 0
	setVar $secondhalf 0

# END NEW ROUTINE GLOBALS 
setVar $doplots 1
setVar $doGuestimate 1
setVar $doSectorSorter 0
setVar $SWITCHBOARD~message "Finding " & $bubblesToFind & " bubbles and doing guestimate.*"

getWordPos $bot~user_command_line $pos "all"
if ($pos > 0)
	setVar $doSectorSorter 1
	setVar $SWITCHBOARD~message "Completing all functions.*"
end

getWordPos $bot~user_command_line $pos "calcsecs"
if ($pos > 0)
	setVar $doplots 0
	setVar $doGuestimate 0
	setVar $doSectorSorter 1
	setVar $SWITCHBOARD~message "Only completing sectors in or out of a bubble.*"
end


getWordPos $bot~user_command_line $pos "ztmcalc"
if ($pos > 0)
	setVar $doplots 0
	setVar $doGuestimate 0
	setVar $doSectorSorter 0
	setvar $doztmcalc 1
	setVar $SWITCHBOARD~message "Calc bubbles sectors off ZTM data.*"
end

getWordPos $bot~user_command_line $pos "plotsonly"
if ($pos > 0)
	setVar $doplots 1
	setVar $doGuestimate 0
	setVar $doSectorSorter 0
	setVar $SWITCHBOARD~message "Just plotting bubbles and tunnels.*"
end


getWordPos $bot~user_command_line $pos "report"
if ($pos > 0)
	setVar $doplots 0
	setVar $doGuestimate 0
	setVar $doSectorSorter 1
	setVar $SWITCHBOARD~message "Reporting previously found info.*"
	gosub :SWITCHBOARD~switchboard
	gosub :ReportPreviousData
	halt
end

setVar $goCrazy 0
getWordPos $bot~user_command_line $pos "crazy"
if ($pos > 0)
	# We going to mow to first tunnel door - block it - mow into back and stop
	setVar $doplots 1
	setVar $goCrazy 1
	setVar $doGuestimate 0
	setVar $doSectorSorter 0
	setVar $SWITCHBOARD~message "Finding bubbles and doing guestimate.*"

end



gosub :SWITCHBOARD~switchboard





setVar $bubbleDoors 0
setVar $bubbleDoorsCount 0
setVar $bubbleEnds 0
setVar $bubblei 0

setVar $tunnelDoors1 0
setVar $tunnelDoors2 0
setVar $tunnelDoorsCount 0
setVar $tunnelEnds 0
setVar $tunnelsi 0

setVar $cSector 11
setVar $maxChecks 400
setVar $checkCounter 1
setVar $go 1


###

setVar $whichBubble 0
setVar $bubbleCounts 0

setVar $allDoors 0
setVar $allDoorsi 0
setVar $allDoorsOriginal 0
setVar $allDoorsCount 0

setVar $totalSecs 0

setArray $normalSectors SECTORS
setVAr $plotsReport ""

if ($doplots = 1)
	goSub :doplotsFunction
	setVar $SWITCHBOARD~message $plotsReport & "*"
	gosub :SWITCHBOARD~switchboard
	gosub :report
end

if ($doGuestimate = 1)
	gosub :guestimateCount
end

if ($doSectorSorter = 1)
	if ($doplots = 0)
	#	goSub :getDoors
	end
	
	#gosub :determineNormalSpace
	goSub :plotAllSectorsToBubble
end			

if ($doztmcalc = 1)
	gosub :plotAllSectorsToBubbleztm
end
halt

:getDoors
	setVar $SWITCHBOARD~message "Loading bubble/Tunnel Doors*"
	gosub :SWITCHBOARD~switchboard

	setVar $bubbleDoors 0
	setVar $bubbleDoorsCount 0
	setVar $bubbleEnds 0
	setVar $bubblei 0

	setVar $tunnelDoors1 0
	setVar $tunnelDoors2 0
	setVar $tunnelDoorsCount 0
	setVar $tunnelEnds 0
	setVar $tunnelsi 0


	setVar $i 11
	while ($i < SECTORS)
		getSectorParameter $i "BUBBLEDOOR" $param_bubble
		getSectorParameter $i "TUNNELDOOR" $param_tunnel

		if ($param_tunnel = "")
			setVar $param_tunnel 0
		end
		if ($param_bubble = "")
			setVar $param_bubble 0
		end
		if ($param_bubble = 1)
			add $bubblei 1
			setVar $bubbleDoors[$bubblei] $i
			getSectorParameter $i "BDOORCOUNT" $param_count
			setVar $bubbleDoorsCount[$bubblei] $param_count
		end
		if ($param_tunnel > 0)
			if ($tunnelDoors1[$param_tunnel] = 0)
				setVar $tunnelDoors1[$param_tunnel] $i
				getSectorParameter $i "TDOORCOUNT" $param_count
				setVar $tunnelDoorsCount[$param_tunnel] $param_count
				add $tunnelsi 1
			else
				setVar $tunnelDoors2[$param_tunnel] $i
			end
		end
		add $i 1
	end
return

:ReportPreviousData

	goSub :getDoors

	setVar $reporti 0
	setVar $reportCount 0
	setVar $reportDoor 0

	
	setVar $i 1
	while ($i <= $bubblei)
		add $reporti 1
		setVar $reportDoor[$reporti] $bubbleDoors[$i]
		setVar $reportCount[$reporti] $bubbleDoorsCount[$i]
		add $i 1
	end

	setVar $i 1
	while ($i <= $tunnelsi)
		add $reporti 1
		setVar $reportDoor[$reporti] $tunnelDoors1[$i] & " " & $tunnelDoors2[$i] 
		setVar $reportCount[$reporti] $tunnelDoorsCount[$i]
		add $i 1
	end

	setVar $msg "Bubble Tunnel Report *"
	setVar $msg $msg & "SECTORS : [Proportional Size] *"
	
	setVar $i 1
	while ($i <= $reporti)
		setVar $msg $msg & $reportDoor[$i] & ": " &  $reportCount[$i] &  "*"

		add $i 1
	end
	setVar $msg $msg &  "TOTAL SECTORS: " & $totalSecs & "*"
	setVar $SWITCHBOARD~message $msg
	gosub :switchboard~switchboard
	send "q * * "

return

:doplotsFunction
getTime $test "'The time is :' h:m:s, ' the date is :' d:m:yyyy'"
echo $test
echo $test
echo $test
echo $test
echo $test
	send "c"
	send "v0*yy"
    
echo "Entering DO PLOTS*"
	while ($go = 1)

		send "f1*" $cSector "*"
		
		setTextLineTrigger badplot :badplot "Error - No route within"
		setTextLineTrigger goodplot :goodplot "The shortest path "
		pause
		:badplot
			killalltriggers
			send "n"
			goto :again
		:goodPlot
			killalltriggers
			getWord CURRENTLINE $dist 4
			STRIPTEXT $dist "("
			if ($dist > $minWarpDist)
				setVar $foundBubble 0
				goSub :checkBubble
				if ($foundBubble = 0)
					goSub :checkTunnel
					if ($foundBubble = 0)
						echo "*#######################################################"
						echo "*######## NO SOLUTION FOR:  " $cSector " ###############"
						echo "*#######################################################"
						getTime $test "'The time is :' h:m:s, ' the date is :' d:m:yyyy'"
echo $test
echo $test
echo $test
echo $test
echo $test
					else
						getTime $test "'The time is :' h:m:s, ' the date is :' d:m:yyyy'"
echo $test
echo $test
echo $test
echo $test
echo $test
					end
				else
				getTime $test "'The time is :' h:m:s, ' the date is :' d:m:yyyy'"
echo $test
echo $test
echo $test
echo $test
echo $test
					if ($goCrazy = 1)
						goSub :goCrazy
					end
				end
				setVar $x 1
				while ($x <= $bubblei)
					echo "*############# VOIDING KNOWN DOORS #############"
					send "v" $bubbleDoors[$x] "*"
					add $x 1
				end
				setVar $x 1
				while ($x <= $tunnelsi)
					echo "*############# VOIDING KNOWN TUnNEL DOORS #############"
					send "v" $tunnelDoors1[$x] "*"
					send "v" $tunnelDoors2[$x] "*"
					add $x 1
				end
				
			end

		:again
			
			add $cSector 1
			add $checkCounter 1
			setVar $totalFound ($tunnelsi + $bubblei)
			if ($totalFound = $bubblesToFind)
				send "q * * "
				return
			end
			if ($checkCounter > $maxChecks)
				send "q * * "
				return
			end

	end
	send "q * * "
	getTime $test "'The time at end is :' h:m:s, ' the date is :' d:m:yyyy'"
echo $test
return

halt



:determineNormalSpace
	send "c"
	send "v0*yy"

	killalltriggers
	setVar $i 1
	while ($i <= $bubblei)
		
		send "v" $bubbleDoors[$i] "*"
		add $i 1
	end

	setVar $i 1
	while ($i <= $tunnelsi)
		send "v" $tunnelDoors1[$i] "*"
		send "v" $tunnelDoors2[$i] "*"
		add $i 1
	end

	setVar $i 11
	setVar $plotc 1
	while ($i <= SECTORS)
	
		
		send "f1*" $i "** "
		add $plotC 1
		if ($plotC = 51)
			send "^q"
			:moreplotinfo
			setTextLineTrigger plotCourseError :plotCourseError "Error - No route within"
			setTextLineTrigger plotCoursePath :plotCoursePath "The shortest path"
			setTextLineTrigger plotCourseNext :plotCourseNext "ENDINTERROG"
			pause
			:plotCourseError 
				killalltriggers
				goto :moreplotinfo
			:plotCoursePath
				killalltriggers
				getWord CURRENTLINE $nsec 13
				setVar $normalSectors[$nsec] 1
				goto :moreplotinfo
			:plotCourseNext
				killalltriggers
			setVar $plotc 1
			if ($i = SECTORS)
				goto :wedonecounting
			end
		end
		add $i 1
		if ($i = SECTORS)
			send "f1*" $i "** "
			send "^q"
			goto :moreplotinfo
		end
	end

	setVar $totalNorm 0
	setVar $totalBB 0
	:wedonecounting
	delete $normal_sector_file 
	delete $bubble_sector_file
	setVar $i 11
	while ($i <= SECTORS)
		if ($normalSectors[$i] = 1)
			write $normal_sector_file $i 
			add $totalNorm 1
		else
			write $bubble_sector_file $i
			add $totalBB 1
		end
		add $i 1
	end
	setVar $SWITCHBOARD~message "Calcs Complete. Normal Secs: " & $totalNorm & " Bub Secs:" & $totalbb & ".*"
	gosub :SWITCHBOARD~switchboard
	
	send "q * * "
return

:guestimateCount


	setVar $allDoors 0
	setVar $allDoorsi 0
	setVar $allDoorsOriginal 0
	setVar $allDoorsCount 0

	send "c"
	send "v0*yy"

	killalltriggers
	setVar $i 1
	while ($i <= $bubblei)
		setVar $whichBubble[$bubbleDoors[$i]] 99
		add $totalSecs 1
		add $allDoorsi 1
		setVar $allDoors[$allDoorsi] $bubbleDoors[$i]
		setVar $allDoorsOriginal[$allDoorsi] 0
		add $i 1
	end

	setVar $i 1
	while ($i <= $tunnelsi)
		setVar $whichBubble[$tunnelDoors1[$i]] 99
		setVar $whichBubble[$tunnelDoors2[$i]] 99
		add $totalSecs 1
		add $totalSecs 1
		add $allDoorsi 1
		setVar $allDoors[$allDoorsi] $tunnelDoors1[$i]
		setVar $allDoorsOriginal[$allDoorsi] $i
		add $allDoorsi 1
		setVar $allDoors[$allDoorsi] $tunnelDoors2[$i]
		setVar $allDoorsOriginal[$allDoorsi] $i

		add $i 1
	end

echo "We have " $allDoorsi " Door SEctors*"

	setVar $i 1
	setVar $sec 11
	while ($sec < 512)
		
		if ($whichBubble[$sec] = 0)
			send "f1*" $sec "*" 
			add $i 1
		end
		
		
		if ($i = 20)
			send "^q"
			:moreguessinfo
			setTextLineTrigger guessCourseError :guessCourseError "Error - No route within"
			setTextLineTrigger guessCoursePath :guessCoursePath "The shortest path"
			setTextLineTrigger guessCourseNext :guessCourseNext "ENDINTERROG"
			pause
			:guessCourseError 
				killalltriggers
				goto :moreguessinfo
			:guessCoursePath
				killalltriggers
				goSub :getCourse
				goto :moreguessinfo
			:guessCourseNext
				killalltriggers
				setVar $i 1
				if ($sec = 512)
					goto :noMoreguessplotting
				end
		end
		add $sec 1
		if ($sec = 512)
			if ($whichBubble[$sec] = 0)
				send "f1*" $sec "** "
			end
			send "^q"
			goto :moreguessinfo
		end
	end
	:noMoreguessplotting


	setVar $reporti 0
	setVar $reportCount 0
	setVar $reportDoor 0

	# totalSecs
	setVar $i 1
	while ($i <= $allDoorsi)

		
		if ($allDoorsOriginal[$i] = 0)
			echo $allDoors[$i] " has " $allDoorsCount[$i] " *"
			add $reporti 1
			setVar $reportDoor[$reporti] $allDoors[$i]
			setVar $reportCount[$reporti] $allDoorsCount[$i]
			setSectorParameter $allDoors[$i] "BDOORCOUNT" $allDoorsCount[$i]
		else

			add $reporti 1
			setVar $i2 ($i + 1)
			echo $allDoors[$i] " has " $allDoorsCount[$i] " *"
			echo $allDoors[$i2] " has " $allDoorsCount[$i2] " *"
			setVar $reportDoor[$reporti] $allDoors[$i] & " " & $allDoors[$i2] 
			setVar $reportCount[$reporti] ($allDoorsCount[$i] + $allDoorsCount[$i2])
			setSectorParameter $allDoors[$i] "TDOORCOUNT" ($allDoorsCount[$i] + $allDoorsCount[$i2])
			setSectorParameter $allDoors[$i2] "TDOORCOUNT" ($allDoorsCount[$i] + $allDoorsCount[$i2])
			add $i 1
		end
		add $i 1
	end

	setVar $msg "Bubble Tunnel Report *"
	setVar $msg $msg & "SECTORS : [Proportional Size] *"
	
	setVar $i 1
	while ($i <= $reporti)
		setVar $msg $msg & $reportDoor[$i] & ": " &  $reportCount[$i] &  "*"

		add $i 1
	end
	setVar $msg $msg &  "TOTAL SECTORS: " & $totalSecs & "*"
	setVar $SWITCHBOARD~message $msg
	gosub :switchboard~switchboard
	send "q * * "

return

:report
	setVar $x 1
	while ($x <= $bubblei)
		echo "*############# DOORS #############"
		echo "*DOOR: " $bubbleDoors[$x] " BACK: " $bubbleEnds[$x]
		add $x 1
	end

	setVar $x 1
	while ($x <= $tunnelsi)
		echo "*############# Tunnels #############"
		echo "*DOOR: " $tunnelDoors1[$x] " DOOR: " $tunnelDoors2[$x] " BACK: " $tunnelEnds[$x]
		add $x 1
	end
	
return

:checkBubble

echo "Checking Bubble: " $cSector

	# nearest warp to sector 1 we will test (could potenially be first none fed or even second value
	setVar $nearestWarp 4

	setVar $courseIsClosed 1
    setVar $foundBubble 0

	setVar $testGroupA 0
	setVar $testGroupB 0
	setVar $groupAi 1
	setVar $groupBi 1
	setVar $groupABlocked 0
	setVar $groupBBlocked 0
	setvar $firsthalf 0
	setVar $secondhalf 0
	
	setVar $clearAvoidsOk 1
	# we should have already confirmed it's a real tunnel and cleared avoids
	goSub :confirmIsValidBubble
    if ($validBubble = 0)
        echo "Bubble was not valid, moving on!"
        return
    else
        echo "bubble is valid!"
    end
	setVar $doorfound 0
	goSub :checkOneEndOfTunnel

	if ($doorfound = 0)
		echo "Thats a bust, move on!"
		return
	end
	setVar $firstDoor $doorfound
	
	setVar $bubbleDoorAt ($totalRec + 5)
			
	echo "*############# FOUND DOOR " $firstdoor " #############"
	setVar $msg "[Found Big Bubble] Door: " & $firstdoor & " Internal Sec:" & $cSector & "*"
	setVar $plotsReport $plotsReport & $msg 
	setSectorParameter $firstdoor "BUBBLEDOOR" 1
	setSectorParameter $firstdoor "BUBBLEINT" $cSector
	
	add $bubblei 1
	setVar $bubbleDoors[$bubblei] $firstdoor
	setVar $bubbleEnds[$bubblei] $cSector
	setVar $foundBubble 1

	send "^q"
	waitfor "ENDINTERROG"
	send "'" $msg

return


#setVar $tunnelDoors1 0
#setVar $tunnelDoors2 0
#setVar $tunnelEnds 0
#setVar $tunnelsi 0
:resetRouteOrder
	setVar $routeOrder 0

	setVar $routeOrder[1] 9
	setVar $routeOrder[2] 10
	setVar $routeOrder[3] 11
	setVar $routeOrder[4] 12
	setVar $routeOrder[5] 8
	setVar $routeOrder[6] 7
	setVar $routeOrder[7] 6
	setVar $routeOrder[8] 13
	setVar $routeOrder[9] 14
	setVar $routeOrder[10] 15
	setVar $routeOrder[11] 16

return

:getCheckOrder

# Need max dist
# Then order from likely to unlikely
	goSub :resetRouteOrder
	if ($MaxDistance > 19)
		setVar $RouteStop 11
	elseif ($MaxDistance = 18)
		setVar $RouteStop 10 
	elseif ($MaxDistance = 17)
		setVar $RouteStop 9
	elseif ($MaxDistance = 16)
		setVar $RouteStop 8 
	elseif ($MaxDistance = 15)
		setVar $RouteStop 7 
	elseif ($MaxDistance < 10)
		setVar $routeOrder[1] 4
		setVar $routeOrder[2] 5
		setVar $routeOrder[3] 6
		setVar $routeOrder[4] 7
		if ($MaxDistance = 9)
			setVar $RouteStop 4
		elseif ($MaxDistance = 8)
			setVar $RouteStop 2
		elseif ($MaxDistance = 7)
			setVar $RouteStop 3	
		elseif ($MaxDistance = 6)
			setVar $RouteStop 1
		end
	elseif ($MaxDistance < 15)
		setVar $routeOrder[1] 6
		setVar $routeOrder[2] 7
		setVar $routeOrder[3] 8
		setVar $routeOrder[4] 9
		setVar $routeOrder[5] 10
		setVar $routeOrder[6] 11
		setVar $routeOrder[7] 12
		if ($MaxDistance = 14)
			setVar $RouteStop 7
		elseif ($MaxDistance = 13)
			setVar $RouteStop 6
		elseif ($MaxDistance = 12)
			setVar $RouteStop 5	
		elseif ($MaxDistance = 11)
			setVar $RouteStop 4
		elseif ($MaxDistance = 10)
			setVar $RouteStop 3

		end
	end
return

:checktunnel

    setVar $clearAvoidsOk 0
    setVar $tunnelTarget $cSector
    setVar $foundBubble 0
    echo "Checking TunnelTarget: " $tunnelTarget
    goSub :confirmIsValidTunnel
    if ($validTunnel = 1)
        echo "**# Sector " $cSector " is a valid tunnel *"
    else
        echo "**# Sector " $cSector " is NOT a valid tunnel *"
        return
    end

    setVar $firstDoor 0
    setVar $secondDoor 0

    
    goSub :checkTunnelDivide

    echo "Tunnel Doors are: " $firstDoor " and " $secondDoor "*"

    if ($firstDoor = 0) or ($secondDoor = 0)

        return
    end

    setVar $bubbleTwoAt $routeOrder[$totalRec]
    echo "*############# FOUND FIRST DOOR " $secondDoor " #############"
    echo "*############# FOUND SECOND DOOR " $firstDoor " #############"
    setVar $msg "[Found Big Tunnel] Door 1: " & $secondDoor & " Door 2: " & $firstDoor & " Internal Sec:" & $tunnelTarget & "*"
    setVar $plotsReport $plotsReport & $msg 
    

    setVar $foundBubble 1
    add $tunnelsi 1
    setVar $tunnelDoors1[$tunnelsi] $secondDoor
    setVar $tunnelDoors2[$tunnelsi] $firstDoor
    setVar $tunnelEnds[$tunnelsi] $tunnelTarget
    setSectorParameter $secondDoor "TUNNELDOOR" $tunnelsi
    setSectorParameter $firstDoor "TUNNELDOOR" $tunnelsi
    setSectorParameter $secondDoor "TUNNELINT" $tunnelTarget
    setSectorParameter $firstDoor "TUNNELINT" $tunnelTarget
    send "^q"
    waitfor "ENDINTERROG"
    send "'" $msg
    send "v0*yy"
return

:checkTunnel_olldddd

	# the sector we think might be a in a tunnel
	setVar $tunnelTarget $cSector

	setVar $course ""
	setVar $coursei 1
	goSub :getCourseArray

	# Which sectors to inclde
	setVar $RouteStop 0
	setVar $route1 0
	setVar $MaxDistance $coursei
	goSub :getCheckOrder
	setvar $firstRouteStop $RouteStop
	setVar $routeMake 1
	while ($routeMake <= $firstRouteStop)
		setVar $route1[$routeMake] $course[$routeOrder[$routeMake]]
		add $routeMake 1
	end


	# How many to avoid in first path
	setVar $stopLookingAt2 $RouteStop
	
	setVar $r 1
echo "Searching from  " $r " to " $stopLookingAt2 "*"
	while ($r <= $firstRouteStop)

		setVar $voidSec $route1[$r]
		send "v" $voidSec "*"

		setVar $course ""
		setVar $coursei 1
		goSub :getCourseArray

		setVar $lastPlot ($coursei - 1)
		setVar $RouteStop2 0
		setVar $route2 0
		setVar $MaxDistance $coursei
		goSub :getCheckOrder
		setvar $secondRouteStop $RouteStop
		setVar $routeMake 1
		while ($routeMake <= $secondRouteStop)
			setVar $route2[$routeMake] $course[$routeOrder[$routeMake]]
			add $routeMake 1
		end

		setVar $y 1

		
echo "VOID SEARCH FROM $y" $y " to " $secondRouteStop "*"
		
		while ($y <= $secondRouteStop)
			if ($y = $secondRouteStop)
				# to close to end point - assume fail?
				send "^q"
				goto :checkLap
			end 
			send "v" $route2[$y] "*"
			send "f1*" $course[$lastPlot] "** "
			send "v0*yy"
			send "v" $voidSec "*"
			
			add $y 1
		end
		:checkLap
			setVar $totalRec 0
			:waitLap
			setTextLineTrigger checkplotblock2 :checkplotblock2 "Error - No route within"
			setTextLineTrigger checkplotpath :checkplotpath "The shortest path"
			setTextLineTrigger bubbleNotFound :bubbleNotFound "ENDINTERROG"
			pause
			:checkplotpath
				killalltriggers
				add $totalRec 1
				goto :waitLap
			:checkplotblock2
				killalltriggers
				add $totalRec 1
				setVar $bubbleTwoAt $routeOrder[$totalRec]
				echo "*############# FOUND FIRST DOOR " $voidSec " #############"
				echo "*############# FOUND SECOND DOOR " $course[$bubbleTwoAt] " #############"
				setVar $msg "[Found Big Tunnel] Door 1: " & $voidSec & " Door 2: " & $course[$bubbleTwoAt] & " Internal Sec:" & $tunnelTarget & "*"
				setVar $plotsReport $plotsReport & $msg 
				
			
				setVar $foundBubble 1
				add $tunnelsi 1
				setVar $tunnelDoors1[$tunnelsi] $voidSec
				setVar $tunnelDoors2[$tunnelsi] $course[$bubbleTwoAt]
				setVar $tunnelEnds[$tunnelsi] $tunnelTarget
				setSectorParameter $voidSec "TUNNELDOOR" $tunnelsi
				setSectorParameter $course[$bubbleTwoAt] "TUNNELDOOR" $tunnelsi
				setSectorParameter $voidSec "TUNNELINT" $tunnelTarget
				setSectorParameter $course[$bubbleTwoAt] "TUNNELINT" $tunnelTarget
				waitfor "ENDINTERROG"
				send "'" $msg
				return
			:bubbleNotFound
				killalltriggers
echo "Plot Not Found"
				goto :nextLap

		:nextLap
		
echo "NextLAp $r: " $r " stopLookingAt2 " $stopLookingAt2 "*"
echo "NextLAp $r: " $r " stopLookingAt2 " $stopLookingAt2 "*"
echo "NextLAp $r: " $r " stopLookingAt2 " $stopLookingAt2 "*"

		send "v0*yy"
		add $r 1
		if ($r = $stopLookingAt2)
			# to close to end point - assume fail?
			setVar $foundBubble 0
echo "Failed to find tunnel"
			return
		end 
		
	end
	
return


:getCourseArray
	# 1 to Dest $cSector
	setVar $course ""
	setVar $coursei 1
	

	setVar $logText ""
	setVar $log 0
	send "f1*" $cSector "*"
	waitfor "at is the destination sect"

	:checkGoing2
	setTextLineTrigger NoRoute2 :NoRoute2 "Error - No route within"
	setTextLineTrigger startlog2 :startlog2 "shortest path"
	setTextTrigger endlog2 :endlog2 "Computer command ["
	setTextLineTrigger goodline2 :goodline2 ""
	
	pause
	:NoRoute2
		killAllTriggers
		send "n"
		setVar $coursei 0
		return
	:startlog2
		killalltriggers
		setVar $log 1
		goto :checkGoing2
	:goodline2
		killalltriggers
		if ($log = 1) and (CURRENTLINE <> "")
			cuttext CURRENTLINE $firstchar 1 1
			if ($firstchar = "1") or ($firstchar = " ")
				setVar $logText $logText & CURRENTLINE
			end
		end
		
		goto :checkGoing2
	:endlog2
		killalltriggers
		
	setVar $logText $logText & " end"
	setVar $y 1
	getWord $logTEXT $stuff $y

	while ($stuff <> "end")
		
		STRIPTEXT $stuff "("
		STRIPTEXT $stuff ")"

		if (($stuff <> ">") and ($stuff <> "end"))
			setVar $course[$coursei] $stuff
			add $coursei 1
		end

		add $y 1
		getWord $logTEXT $stuff $y
	end
return



:getCourse

	setVar $course ""
	setVar $coursei 1
	
	setVar $logText ""
	setVar $log 1
	setVar $spitEVerything 0
	
	:checkGoingCourse
	setTextTrigger endlogCourse :endlogCourse "Computer command ["
	setTextLineTrigger goodlineCourse :goodlineCourse ">"
	
	pause
	:goodlineCourse
		killalltriggers
		if ($log = 1) and (CURRENTLINE <> "")
			cuttext CURRENTLINE $firstchar 1 1
			if ($firstchar = "1") or ($firstchar = " ")
				setVar $logText $logText & CURRENTLINE
			end
		end
		goto :checkGoingCourse
	:endlogCourse
		killalltriggers
		
		setVar $logText $logText & " end"
		setVar $y 1
		getWord $logTEXT $stuff $y

		while ($stuff <> "end")
			STRIPTEXT $stuff "("
			STRIPTEXT $stuff ")"
			if (($stuff <> ">") and ($stuff <> "end"))
				setVar $course[$coursei] $stuff
				add $coursei 1
			end
			add $y 1
			getWord $logTEXT $stuff $y
		end

#setVar $bubblei 8
#setVar $bubbleDoors[1] 2152
#3$bubbleCounts	


	setVar $y 1
	setVar $i 1
	setVar $foundi 0
	setVar $foundy 0
	while ($i < $coursei)
		setVar $y 1
		while ($y <= $allDoorsi)
			if ($course[$i] = $allDoors[$y])
Echo "Found:" $course[$i] "*"
				# Location of bubble Door is i
				setVar $foundi $i
				# Which bubble is $y
				setVar $foundy $y
				setVar $y 99
				setVar $i 99
			end
			add $y 1
		end
		add $i 1
	end
	
	setVar $y 1
	setVar $i 1

	if ($foundi > 0)
		while ($i < $foundi)
#if ($spitEVerything = 1)
#echo "$course[$i]:" $course[$i] " $whichBubble[$course[$i]]: " $whichBubble[$course[$i]] "*"

#end
			if ($whichBubble[$course[$i]] = 0)
				setVar $whichBubble[$course[$i]] 99
				add $totalSecs 1
			end
			add $i 1
		end
		add $i 1
		while ($i <  $coursei)
	#echo "$course[$i]:" $course[$i] " $whichBubble[$course[$i]]: " $whichBubble[$course[$i]] "*"
			if ($whichBubble[$course[$i]] = 0)
				setVar $whichBubble[$course[$i]] $foundy
				add $allDoorsCount[$foundy] 1
				add $totalSecs 1
			end
			add $i 1
		end
	end
	
	
return

:goCrazy
	
	send "v0*yyq"
	waitfor "Computer deactivated>"
	
	setVar $BOT~command "mow"
	setVar $BOT~user_command_line " mow " & $bubbleDoors[$bubblei] & " 0 "
	setVar $BOT~parm1 $bubbleDoors[$bubblei]
	setVar $BOT~parm2 "0"
	saveVar $BOT~parm1
	saveVar $BOT~parm2
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
	setEventTrigger		goCrazyMow1		:goCrazyMow1 "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
	pause
	:goCrazyMow1
	killalltriggers

	send "f1*cd"
	send "cf*" $bubbleEnds[$bubblei] "*q"
	waitfor "The shortest path"
	setTextLineTrigger goCrazy1in :goCrazy1in " > "
	pause
	:goCrazy1in
		getWord CURRENTLINE $onein 3
		STRIPTEXT $onein "("
		STRIPTEXT $onein ")"
	
		setVar $BOT~command "mow"
		setVar $BOT~user_command_line " mow " & $onein & " 1 "
		setVar $BOT~parm1 $onein
		setVar $BOT~parm2 "1"
		saveVar $BOT~parm1
		saveVar $BOT~parm2
		saveVar $BOT~command
		saveVar $BOT~user_command_line
		load "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
		setEventTrigger		goCrazyonein		:goCrazyonein "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
		pause
		:goCrazyonein
			halt
return


	setVar $bubbleDoors 0
	setVar $bubbleDoorsCount 0
	setVar $bubbleEnds 0
	setVar $bubblei 0

	setVar $tunnelDoors1 0
	setVar $tunnelDoors2 0
	setVar $tunnelDoorsCount 0
	setVar $tunnelEnds 0
	setVar $tunnelsi 0



:plotAllSectorsToBubble
	# Assumes max 20 doors

	send "c"

	setArray $sFilter SECTORS
	setArray $bIndex SECTORS
	setArray $allSectors SECTORS
	setVar $totalBubs 0
	setVar $totalBubsReport 0

	setVar $allDoors 0
	setVar $allDoorsi 0
	goSub :getDoors

	setVar $i 1
	while ($i <= 20)
		setVar $allDoors[$i] 99999
		add $i 1
	end
	
	setVar $i 11
	while ($i < SECTORS)
		setSectorParameter $i "WHICHBUB" ""
		setSectorParameter $i "NOTBUB" ""
		add $i 1
	end
	
	setVar $i 1
	while ($i <= $bubblei)
		add $totalBubs 1
		setVar $totalBubsReport[$totalBubs] "B:" & $bubbleDoors[$i]
		setVar $y ((($totalBubs - 1) *2) + 1)
		setVar $allDoors[$y] $bubbleDoors[$i]
		setVar $y2 ($y+1)
		setVar $allDoors[$y2] 99999
		setVar $bIndex[$bubbleDoors[$i]] $totalBubs
		setVar $sFilter[$bubbleDoors[$i]] 1
		add $i 1
	end

	setVar $i 1
	while ($i <= $tunnelsi)
		add $totalBubs 1
		setVar $y ((($totalBubs - 1) * 2) + 1)

		setVar $y2 ($y+1)
		setVar $allDoors[$y] $tunnelDoors1[$i]
		setVar $allDoors[$y2] $tunnelDoors2[$i]
		setVar $bIndex[$tunnelDoors1[$i]] $totalBubs
		setVar $sFilter[$tunnelDoors1[$i]] 1
		setVar $bIndex[$tunnelDoors2[$i]] $totalBubs
		setVar $sFilter[$tunnelDoors2[$i]] 1
		setVar $totalBubsReport[$totalBubs] "T:" & $tunnelDoors1[$i] & " " & $tunnelDoors2[$i]
		add $i 1
	end

	setVar $i 1
	while ($i <= 20)
		echo $allDoors[$i] "*"
		add $i 1
	end

	
	
	setVar $totalPlots 11
	setVar $maxPlots 10000
	setVar $lastRun 0

	:plotAllMore
	setVar $i 11
	while ($i <= 61)
		if ($totalPlots > $maxPlots)
			setVar $lastRun 1
			goto :iiiend
		end
		if ($sFilter[$i] <> 1)
			send "f1*" $totalPlots "**"
		end
		add $totalPlots 1
		add $i 1
	end 
	:iiiend
	send "^q"

	:waitMorePlots

	setTextLineTrigger startPLook :startPLook "Computed."
	setTextLineTrigger 41 :entranceEnd "ENDINTERROG"
	pause
	:startPLook
		killalltriggers
	setTextLineTrigger shortestP :shortestP "The shortest path"
	pause
		:shortestP
		killalltriggers
		getword CURRENTLINE $lastSector 13
		
	setTextLineTrigger plotComputerDone :plotComputerDone "Computer command ["
	setTextLineTrigger 1 :enterance1 " (" & $allDoors[1] & ") "
	setTextLineTrigger 2 :enterance2 " (" & $allDoors[2] & ") "
	setTextLineTrigger 3 :enterance3 " (" & $allDoors[3] & ") "
	setTextLineTrigger 4 :enterance4 " (" & $allDoors[4] & ") "
	setTextLineTrigger 5 :enterance5 " (" & $allDoors[5] & ") "
	setTextLineTrigger 6 :enterance6 " (" & $allDoors[6] & ") "
	setTextLineTrigger 7 :enterance7 " (" & $allDoors[7] & ") "
	setTextLineTrigger 8 :enterance8 " (" & $allDoors[8] & ") "
	setTextLineTrigger 9 :enterance9 " (" & $allDoors[9] & ") "
	setTextLineTrigger 10 :enterance10 " (" & $allDoors[10] & ") "
	setTextLineTrigger 11 :enterance11 " (" & $allDoors[11] & ") "
	setTextLineTrigger 12 :enterance12 " (" & $allDoors[12] & ") "
	setTextLineTrigger 13 :enterance13 " (" & $allDoors[13] & ") "
	setTextLineTrigger 14 :enterance14 " (" & $allDoors[14] & ") "
	setTextLineTrigger 15 :enterance15 " (" & $allDoors[15] & ") "
	setTextLineTrigger 16 :enterance16 " (" & $allDoors[16] & ") "
	setTextLineTrigger 17 :enterance17 " (" & $allDoors[17] & ") "
	setTextLineTrigger 18 :enterance18 " (" & $allDoors[18] & ") "
	setTextLineTrigger 19 :enterance19 " (" & $allDoors[19] & ") "
	setTextLineTrigger 20 :enterance20 " (" & $allDoors[20] & ") "
		
	setTextLineTrigger 21 :enterance1b " " & $allDoors[1] & " "
	setTextLineTrigger 22 :enterance2b " " & $allDoors[2] & " "
	setTextLineTrigger 23 :enterance3b " " & $allDoors[3] & " "
	setTextLineTrigger 24 :enterance4b " " & $allDoors[4] & " "
	setTextLineTrigger 25 :enterance5b " " & $allDoors[5] & " "
	setTextLineTrigger 26 :enterance6b " " & $allDoors[6] & " "
	setTextLineTrigger 27 :enterance7b " " & $allDoors[7] & " "
	setTextLineTrigger 28 :enterance8b " " & $allDoors[8] & " "
	setTextLineTrigger 29 :enterance9b " " & $allDoors[9] & " "
	setTextLineTrigger 30 :enterance10b " " & $allDoors[10] & " "
	setTextLineTrigger 31 :enterance11b " " & $allDoors[11] & " "
	setTextLineTrigger 32 :enterance12b " " & $allDoors[12] & " "
	setTextLineTrigger 33 :enterance13b " " & $allDoors[13] & " "
	setTextLineTrigger 34 :enterance14b " " & $allDoors[14] & " "
	setTextLineTrigger 35 :enterance15b " " & $allDoors[15] & " "
	setTextLineTrigger 36 :enterance16b " " & $allDoors[16] & " "
	setTextLineTrigger 37 :enterance17b " " & $allDoors[17] & " "
	setTextLineTrigger 38 :enterance18b " " & $allDoors[18] & " "
	setTextLineTrigger 39 :enterance19b " " & $allDoors[19] & " "
	setTextLineTrigger 40 :enterance20b " " & $allDoors[20] & " "


	
	pause
	:plotComputerDone
		killalltriggers
		goto :waitMorePlots
			:enterance1
			:enterance2
			:enterance1b 
			:enterance2b 
			killalltriggers
				setVar $bub 1
				goSub :addDoor
				goto :waitMorePlots

			:enterance3 
			:enterance4
			:enterance3b 
			:enterance4b 
			killalltriggers
				setVar $bub 2
				goSub :addDoor
				goto :waitMorePlots

			:enterance5 
			:enterance6 
			:enterance5b 
			:enterance6b 
			killalltriggers
				setVar $bub 3
				goSub :addDoor
				goto :waitMorePlots

			:enterance7 
			:enterance8 
			:enterance7b 
			:enterance8b 
			killalltriggers
				setVar $bub 4
				goSub :addDoor
				goto :waitMorePlots

			:enterance9 
			:enterance10
			:enterance9b 
			:enterance10b 
			killalltriggers
				setVar $bub 5
				goSub :addDoor
				goto :waitMorePlots

			:enterance11
			:enterance12
			:enterance11b 
			:enterance12b 
			killalltriggers
				setVar $bub 6
				goSub :addDoor
				goto :waitMorePlots

			:enterance13
			:enterance14
			:enterance13b 
			:enterance14b 
			killalltriggers
				setVar $bub 7
				goSub :addDoor
				goto :waitMorePlots

			:enterance15
			:enterance16
			:enterance15b 
			:enterance16b 
			killalltriggers
				setVar $bub 8
				goSub :addDoor
				goto :waitMorePlots

			:enterance17 
			:enterance18
			:enterance17b 
			:enterance18b 
			killalltriggers
				setVar $bub 9
				goSub :addDoor
				goto :waitMorePlots

	:enterance19
	:enterance20
	:enterance19b 
	:enterance20b 
	killalltriggers
		setVar $bub 10
		goSub :addDoor
		goto :waitMorePlots

	:entranceEnd
		killalltriggers
		if ($lastRun = 1)
			echo "DONE - sending.. *"
		else
			goto :plotAllMore
		end

	#setVar $i 11
	#while ($i <= $maxPlots)
	#	echo $i " " $allSectors[$i] " " $totalBubsReport[$allSectors[$i]] "*"
	#	add $i 1
	#end

	setVar $i 11
	while ($i < SECTORS)
		getSectorParameter $i "WHICHBUB" $test
		if ($test = "")
			setVar $test 0
		end
		if ($test = 0)
			setSectorParameter $i "NOTBUB" "1"
		end
		add $i 1
	end

	setVar $i 1
	while ($i <= 20)
		if ($allDoors[$i] <= SECTORS)
			if ($i <=2)
				setVar $bub 1
			elseif ($i <=4)
				setVar $bub 1
			elseif ($i <=6)
				setVar $bub 1
			elseif ($i <=8)
				setVar $bub 1
			elseif ($i <=10)
				setVar $bub 1
			elseif ($i <=12)
				setVar $bub 1
			elseif ($i <=14)
				setVar $bub 1
			elseif ($i <=16)
				setVar $bub 1
			elseif ($i <=18)
				setVar $bub 1
			elseif ($i <=20)
				setVar $bub 1
			end
			setSectorParameter $allDoors[$i] "BUBCOUNT" $bubbleCounts[$i]
			setSectorParameter $allDoors[$i] "BUBINDEX" $bub
		end
		add $i 1
	end


	setVar $i 1
	setVar $rep  "BUBBLE SECTOR         SECTOR COUNT*"
	while ($i <= 10)
		
		setvar $rep $rep & $totalBubsReport[$i] &  "            "  & $bubbleCounts[$i] &  "*"
		add $i 1
	end
	setVar $SWITCHBOARD~message $rep
	gosub :SWITCHBOARD~switchboard
	halt

	send "q"

return

:addDoor
	setVar $allSectors[$lastSector] $bub
	add $bubbleCounts[$bub] 1
	setSectorParameter $lastSector "WHICHBUB" $bub
return




:plotAllSectorsToBubbleztm
	
	  clearAllAvoids

	setArray $sFilter SECTORS
	setArray $bIndex SECTORS
	setArray $allSectors SECTORS
	setVar $totalBubs 0
	setVar $totalBubsReport 0

	setVar $allDoors 0
	setVar $allDoorsi 0
	goSub :getDoors

	setVar $i 1
	while ($i <= 20)
		setVar $allDoors[$i] 99999
		add $i 1
	end
	
	setVar $i 11
	while ($i < SECTORS)
		setSectorParameter $i "WHICHBUB" ""
		setSectorParameter $i "NOTBUB" ""
		add $i 1
	end
	
	setVar $i 1
	while ($i <= $bubblei)
		add $allDoorsi 2
		add $totalBubs 1
		setVar $totalBubsReport[$totalBubs] "B:" & $bubbleDoors[$i]
		setVar $y ((($totalBubs - 1) *2) + 1)
		setVar $allDoors[$y] $bubbleDoors[$i]
		setVar $y2 ($y+1)
		setVar $allDoors[$y2] 99999
		setVar $bIndex[$bubbleDoors[$i]] $totalBubs
		setVar $sFilter[$bubbleDoors[$i]] 1
		add $i 1
	end

	setVar $i 1
	while ($i <= $tunnelsi)
		add $totalBubs 1
		add $allDoorsi 2
		setVar $y ((($totalBubs - 1) * 2) + 1)

		setVar $y2 ($y+1)
		setVar $allDoors[$y] $tunnelDoors1[$i]
		setVar $allDoors[$y2] $tunnelDoors2[$i]
		setVar $bIndex[$tunnelDoors1[$i]] $totalBubs
		setVar $sFilter[$tunnelDoors1[$i]] 1
		setVar $bIndex[$tunnelDoors2[$i]] $totalBubs
		setVar $sFilter[$tunnelDoors2[$i]] 1
		setVar $totalBubsReport[$totalBubs] "T:" & $tunnelDoors1[$i] & " " & $tunnelDoors2[$i]
		add $i 1
	end

	setVar $mindisttodoor 99
	setVar $i 1
	while ($i <= $allDoorsi)
	//echo "$allDoors[$i] " $allDoors[$i] "*"
		if ($allDoors[$i] > 0) and ($allDoors[$i] <= SECTORS)
			getcourse $course 1 $allDoors[$i]
			echo $i " " $allDoors[$i] " dist: " $course "*"
			if ($course < $mindisttodoor)
				setVar $mindisttodoor $course
			end
		end
		add $i 1
	end

	echo "min dist to door: " $mindisttodoor "*"




	getAllCourses $courses 1
	setVar $a 1
	while ($a <= SECTORS)

		// This sector is furtherer than closest door
		if ($a >= $mindisttodoor)
			
			// echo "*" $a ", Course:"
			setVar $b $mindisttodoor
			// Loop thru path from min distance
			while ($b <= ($courses[$a] + 1))
			//	echo "  " $courses[$a][$b]

				// check if it's a current door.
				setVar $i 1
				while ($i <= $allDoorsi)
					if ($courses[$a][$b] = $allDoors[$i])
						// found
						setVar $t ($i + 1)
						setVar $bub ($t/2)
						setVar $lastSector $a
						// echo " (Found " $bub " door adding)"
						goSub :addDoor
						setVar $i 100
						setVar $b 100
					end
					add $i 1
				end
				add $b 1
			end
			

		end
		
		
		add $a 1
	end

	
	setVar $i 11
	while ($i < SECTORS)
		getSectorParameter $i "WHICHBUB" $test
		if ($test = "")
			setVar $test 0
		end
		if ($test = 0)
			setSectorParameter $i "NOTBUB" "1"
		end
		add $i 1
	end

	setVar $i 1
	while ($i <= 20)
		if ($allDoors[$i] <= SECTORS)
			if ($i <=2)
				setVar $bub 1
			elseif ($i <=4)
				setVar $bub 2
			elseif ($i <=6)
				setVar $bub 3
			elseif ($i <=8)
				setVar $bub 4
			elseif ($i <=10)
				setVar $bub 5
			elseif ($i <=12)
				setVar $bub 6
			elseif ($i <=14)
				setVar $bub 7
			elseif ($i <=16)
				setVar $bub 8
			elseif ($i <=18)
				setVar $bub 9
			elseif ($i <=20)
				setVar $bub 10
			end
			setSectorParameter $allDoors[$i] "BUBCOUNT" $bubbleCounts[$i]
			setSectorParameter $allDoors[$i] "BUBINDEX" $bub
		end
		add $i 1
	end


	setVar $i 1
	setVar $rep  "BUBBLE SECTOR         SECTOR COUNT*"
	while ($i <= 10)
		
		setvar $rep $rep & $totalBubsReport[$i] &  "            "  & $bubbleCounts[$i] &  "*"
		add $i 1
	end
	setVar $SWITCHBOARD~message $rep
	gosub :SWITCHBOARD~switchboard
	halt

	
#### NEW  TUNNEL BubbLE routines #######################

:confirmIsValidBubble

	setVar $validTunnel 0
	setVar $course ""
	setVar $coursei 1
	goSub :getCourseArray

	goSub :blockCourse

	goSub :testCourseOpen
	if ($courseIsClosed = 1)
		setVar $validBubble 1
	else
		setVar $validBubble 0
	end
	send "v0*yy"

return


:confirmIsValidTunnel
    setVar $courseIsClosed 0
	setVar $validTunnel 0
	setVar $course ""
	setVar $coursei 1
	goSub :getCourseArray

	goSub :blockCourse

	setVar $course ""
	setVar $coursei 1
	goSub :getCourseArray
	if ($coursei = 0)
		setVar $validTunnel 0
		send "v0*yy"
		return
	end
	goSub :blockCourse

	
	goSub :testCourseOpen
	if ($courseIsClosed = 1)
		setVar $validTunnel 1
	else
		setVar $validTunnel 0
	end
	send "v0*yy"

return

:blockCourse 

	setVar $endBlockCourse ($coursei - 4)
	if ($useCim = 1)
		send "^"
	end
	setVar $yy $nearestWarp
	while ($yy <= $endBlockCourse)
		if ($useCim = 1)
			send "s" $course[$yy] "*"
		else
			send "v" $course[$yy] "*"
		end
		add $yy 1
	end	
	if ($useCim = 1)
		send "q"
	end

return

:unBlockCourse


return

:checkTunnelDivide

echo "Checking TunnelTarget: " $cSector

	# nearest warp to sector 1 we will test (could potenially be first none fed or even second value
	setVar $nearestWarp 4

	setVar $courseIsClosed 1


	setVar $testGroupA 0
	setVar $testGroupB 0
	setVar $groupAi 1
	setVar $groupBi 1
	setVar $groupABlocked 0
	setVar $groupBBlocked 0
	setvar $firsthalf 0
	setVar $secondhalf 0

#### PLOT AND BLOCK FIRST END OF TUNNEL 
####        We don't know what sector it is, but assume blocking warps 4 to Endish will block it
	setVar $course ""
	setVar $coursei 1
	goSub :getCourseArray

	setVar $CourseA 1
	setVar $CourseALength $coursei
	setVar $yy 1
	while ($yy <= $CourseALength)
		setVar $CourseA[$yy] $course[$yy]

		add $yy 1
	end
	
	setVar $endBlockCourseA ($CourseALength - 4)
	
	if ($useCim = 1)
		send "^"
	end

	setVar $yy $nearestWarp
	while ($yy <= $endBlockCourseA)
		if ($useCim = 1)
			send "s" $CourseA[$yy] "*"
		else
			send "v" $CourseA[$yy] "*"
		end
		add $yy 1
		
	end	

    if ($useCim = 1)
		send "q"
	end

## ONE END IS NOW BLOCKED
## LETS fIND THE OTHER END DOOR

	setVar $doorfound 0
	goSub :checkOneEndOfTunnel

	if ($doorfound = 0)
		echo "Thats a bust, move on!"
		return
	end
	setVar $firstDoor $doorfound

	#Clear all voids and block known door
	send "v0*yy"
	send "v" $firstDoor "*"

	setVar $doorfound 0
	goSub :checkOneEndOfTunnel

	if ($doorfound = 0)
		echo "Thats a bust, move on!"
		return
	end
	setVar $secondDoor $doorfound

	

return


:checkOneEndOfTunnel

	# means we are doing a tunnel and need to replot, else it's a bubble and we already have course
	if ($clearAvoidsOk = 0)
		setVar $course ""
		setVar $coursei 1
		goSub :getCourseArray
	end

	setVar $CourseB 1
	setVar $CourseBLength $coursei
	setVar $yy 1
	while ($yy < $CourseBLength)
		setVar $CourseB[$yy] $course[$yy]
echo $CourseB[$yy] "*"
		add $yy 1
	end

	
	setVar $testCourse 0
	### length of Course B - Minus Nearest warp, and 3 hops out
	setVar $testCourseLength ($CourseBLength - (3 + $nearestWarp))

	echo "Course we will be testing*"
	echo "   Of len: " $testCourseLength "**"

	setVar $yy 1
	while ($yy <= $testCourseLength)
		setVar $spot (($yy + $nearestWarp) - 1)
		setVar $testCourse[$yy] $CourseB[$spot]
		echo $CourseB[$spot] "*"
		add $yy 1
	end

	

	:MainTestLoop

	goSub :StartTheTest
	setVar $yy 1

	if ($groupABlocked = 1)
		echo "**### GROUP A WAS BLOCKED - USING THESE**"
		if ($firsthalf = 1)
			#FOUND IT
			echo "*FOuND SECOND PLOT: "
			echo $testCourse[1] "**"
			setVar $doorfound $testCourse[1]
			return
		else
			

			setVar $testCourseLength $firsthalf
			setVar $testCourse 0
			while ($yy <= $testCourseLength)
				echo "new :" $testGroupA[$yy] "*"
				setVar $testCourse[$yy] $testGroupA[$yy]
				add $yy 1
			end
		end
	else
		echo "**### GROUP B WAS BLOCKED - USING THESE**"
		if ($secondhalf = 1)
			#FOUND IT
			echo "*FOuND SECOND PLOT: "
			echo $testGroupB[1] "**"
			setVar $doorfound $testGroupB[1]
			return
		else
			
			setVar $testCourseLength $secondhalf
			setVar $testCourse 0
			while ($yy <= $testCourseLength)
				echo "new :" $testGroupB[$yy] "*"
				setVar $testCourse[$yy] $testGroupB[$yy]
				add $yy 1
			end
		end
	end

	goto :MainTestLoop

halt

:StartTheTest

	#### Pass In
	####   $testCourseLength
	####   $TestCourse

	setVar $testGroupA 0
	setVar $testGroupB 0
	setVar $groupAi 1
	setVar $groupBi 1
	setVar $groupABlocked 0
	setVar $groupBBlocked 0

	##setVar $numToTest ($CourseBLength - (3 + $nearestWarp))
	##echo "###" $numToTest
	setvar $firsthalf $testCourseLength/2
	setVar $secondhalf ($testCourseLength - $firsthalf)

echo "First Half**"
	while ($groupAi <= $firsthalf)
		echo $testCourse[$groupAi] "*"
		setVar $testGroupA[$groupAi] $testCourse[$groupAi]
		add $groupAi 1
	end
echo "**"
echo "second half**"
	setVar $yy $groupAi
	while ($yy <= $testCourseLength)
		echo $testCourse[$yy] "*"
		setVar $testGroupB[$groupBi] $testCourse[$yy]
		add $yy 1
		add $groupBi 1
	end

	if ($useCim = 1)
		send "^"
	end

	setVar $yy 1
	while ($yy < $groupAi)
		if ($useCim = 1)
			send "s" $testGroupA[$yy] "*"
		else
			send "v" $testGroupA[$yy] "*"
		end
		add $yy 1
	end	

	if ($useCim = 1)
		send "q"
	end
	
	setVar $testCourseSector $cSector
	goSub :testCourseOpen
	setVar $groupABlocked $courseIsClosed
	echo "######### *"
	echo "Group A Blocked: " $groupABlocked "*"
	echo "########## *"

	if ($clearAvoidsOk = 1)
		# For bubbles - we can just clear all
		send "v0*yy"
	else
		
		if ($useCim = 1)
			send "^"
		end
		setVar $yy 1
		while ($yy < $groupAi)
			
			if ($useCim = 1)
				send "c" $testGroupA[$yy] "*"
			else
				send "v0*yn" $testGroupA[$yy] "*"
			end
			add $yy 1
			
		end	
		if ($useCim = 1)
			send "q"
		end
	end

    if ($groupABlocked = 1)
        return
    end

	
	if ($useCim = 1)
		send "^"
	end
	setVar $yy 1
	while ($yy < $groupBi)
		if ($useCim = 1)
			send "s" $testGroupB[$yy] "*"
		else
			send "v" $testGroupB[$yy] "*"
		end
		
		add $yy 1
		
	end	
	if ($useCim = 1)
		send "q"
	end

	goSub :testCourseOpen
	setVar $groupBBlocked $courseIsClosed

	if ($groupABlocked = 1)
		#Sector is in this one
		echo "Sector block is in Group A"
	else
		echo "Sector block is in Group B"
	end

	if ($clearAvoidsOk = 1)
		# For bubbles - we can just clear all
		send "v0*yy"
		
	else
		
		if ($useCim = 1)
			send "^"
		end
		setVar $yy 1
		while ($yy < $groupBi)
		if ($useCim = 1)
				send "c" $testGroupB[$yy] "*"
			else
				send "v0*yn" $testGroupB[$yy] "*"
			end
			
			add $yy 1
			
		end	

		if ($useCim = 1)
			send "q"
		end
	end
return

halt

:testCourseOpen
	setVar $courseIsClosed 1
	send "f1*" $cSector "**"
	waitfor "at is the destination sect"

	
	setTextLineTrigger testCourseOpenShort :testCourseOpenShort "he shortest path"
	setTextLineTrigger testCourseOpenClosed :testCourseOpenClosed "Error - No route within"
	
	pause
	:testCourseOpenShort
		killAllTriggers
		echo "######### *"
echo " COURSE OPEN*"
echo "########## *"
		setVar $courseIsClosed 0
		return
	:testCourseOpenClosed
		setVar $courseIsClosed 1
			echo "######### *"
echo " COURSE CLOSED*"
echo "########## *"
		killalltriggers
		return
	
return

return
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
