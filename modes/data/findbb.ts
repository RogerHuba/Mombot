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
setVar $BOT~help[5]  $BOT~tab&"    findbb {all} {calcsecs} {report}"
setVar $BOT~help[6]  $BOT~tab&" Options:"
setVar $BOT~help[7]  $BOT~tab&"    {all}        Finds Bubbles, Reports approx Size and"
setVar $BOT~help[8]  $BOT~tab&"                 calculates what sectors in or out of a "
setVar $BOT~help[9]  $BOT~tab&"                 bubble."
setVar $BOT~help[10] $BOT~tab&"                 "
setVar $BOT~help[11] $BOT~tab&"    {calcsecs}   Calcs what sectors in or out of bubbles."
setVar $BOT~help[12] $BOT~tab&"                 Writes to files in data dir."
setVar $BOT~help[13] $BOT~tab&"    {report}     Reports findings previously"
setVar $BOT~help[14] $BOT~tab&"    "
setVar $BOT~help[15] $BOT~tab&"    Ham: Add report sectors for each bubble"
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

setVar $doplots 1
setVar $doGuestimate 1
setVar $doSectorSorter 0
setVar $SWITCHBOARD~message "Finding bubbles and doing guestimate.*"

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
setVar $maxChecks 300
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

if ($doplots = 1)
	goSub :doplotsFunction
	gosub :report
end

if ($doGuestimate = 1)
	gosub :guestimateCount
end

if ($doSectorSorter = 1)
	if ($doplots = 0)
		goSub :getDoors
	end
	
	gosub :determineNormalSpace
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
	send "c"
	send "v0*yy"

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
			if ($dist > 15)
				setVar $foundBubble 0
				goSub :checkBubble
				if ($foundBubble = 0)
					goSub :checkTunnel
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
			if ($checkCounter > $maxChecks)
				send "q * * "
				return
			end

	end
	send "q * * "
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

	setVar $course ""
	setVar $coursei 1
	setVar $logText ""
	setVar $log 0
	send "f1*" $cSector "*"
	waitfor "at is the destination sect"

	:checkGoing
	setTextLineTrigger startlog :startlog "shortest path"
	setTextLineTrigger goodline :goodline ")"
	setTextTrigger endlog :endlog "Computer command ["
	pause
	:startlog
		killalltriggers
		setVar $log 1
		goto :checkGoing
	:goodline
		killalltriggers
		if ($log = 1)
			setVar $logText $logText & CURRENTLINE
		end
		goto :checkGoing
	:endlog
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
	setVar $stopLookingAt ($coursei - 4)
	
	
	setVar $y 5
	setVar $lastPlot ($coursei - 1)

	while ($y < $coursei)
		if ($y = $stopLookingAt)
			# to close to end point - assume fail?
			send "^q"
			goto :checkLapB
		end 
		send "v" $course[$y] "*"
		send "f1*" $course[$lastPlot] "** "
		send "v0*yy"
		
		add $y 1
	end
	:checkLapB
		setVar $totalRec 0
		:waitLapBub
		setTextLineTrigger checkplotblockBub :checkplotblockBub "Error - No route within"
		setTextLineTrigger checkplotpathBub :checkplotpathBub "The shortest path"
		setTextLineTrigger bubbleNotFoundBub :bubbleNotFoundBub "ENDINTERROG"
		pause
		:checkplotpathBub
			killalltriggers
			add $totalRec 1
			goto :waitLapBub
		:checkplotblockBub
			killalltriggers
			setVar $bubbleDoorAt ($totalRec + 5)
			
			echo "*############# FOUND DOOR " $course[$bubbleDoorAt] " #############"
			setVar $msg "Found Big Bubble - Door: " & $course[$bubbleDoorAt] & " Internal Sec:" & $course[$lastPlot] & "*"
			setSectorParameter $course[$bubbleDoorAt] "BUBBLEDOOR" 1
			send "'" $msg

			add $bubblei 1
			setVar $bubbleDoors[$bubblei] $course[$bubbleDoorAt]
			setVar $bubbleEnds[$bubblei] $course[$lastPlot]
			setVar $foundBubble 1
			waitfor "ENDINTERROG"
			return
		:bubbleNotFoundBub
			killalltriggers
	
return

#setVar $tunnelDoors1 0
#setVar $tunnelDoors2 0
#setVar $tunnelEnds 0
#setVar $tunnelsi 0


:checkTunnel

	# the sector we think might be a in a tunnel
	setVar $tunnelTarget $cSector
echo "Checking TunnelTarget: " $tunnelTarget
	setVar $course ""
	setVar $coursei 1
	goSub :getCourseArray

	# How many to avoid in first path
	setVar $stopLookingAt2 ($coursei - 4)
	setVar $route1i 1
	setVar $route1 0
	while ($route1i < $coursei)
		setVar $route1[$route1i] $course[$route1i]
	echo "adding " $course[$route1i] "*"
		add $route1i 1
	end
	# got our route X1 X2 X3 x4 X5. .. X19
	# we want to void each spot - then replot to X19, then void each of it's plots
	

	setVar $r 4
echo "Searching from  " $r " to " $stopLookingAt2 "*"
	while ($r < $route1i)

		setVar $voidSec $route1[$r]
		send "v" $voidSec "*"

		setVar $course ""
		setVar $coursei 1
		goSub :getCourseArray
		# we are going to search from $y to %stopLoockingAt
		setVar $stopLookingAt ($coursei - 4)
		setVar $lastPlot ($coursei - 1)
		setVar $y 5


echo "VOID SEARCH FROM $y" $y " to " $coursei "*"
		
		while ($y < $coursei)
			if ($y = $stopLookingAt)
				# to close to end point - assume fail?
				send "^q"
				goto :checkLap
			end 
			send "v" $course[$y] "*"
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
				
				setVar $bubbleTwoAt ($totalRec + 5)
				echo "*############# FOUND FIRST DOOR " $voidSec " #############"
				echo "*############# FOUND SECOND DOOR " $course[$bubbleTwoAt] " #############"
				setVar $msg "Found Big Tunnel - Door 1: " & $voidSec & " Door 2: " & $course[$bubbleTwoAt] & " Internal Sec:" & $tunnelTarget & "*"
				send "'" $msg
			
				setVar $foundBubble 1
				add $tunnelsi 1
				setVar $tunnelDoors1[$tunnelsi] $voidSec
				setVar $tunnelDoors2[$tunnelsi] $course[$bubbleTwoAt]
				setVar $tunnelEnds[$tunnelsi] $tunnelTarget
				setSectorParameter $voidSec "TUNNELDOOR" $tunnelsi
				setSectorParameter $course[$bubbleTwoAt] "TUNNELDOOR" $tunnelsi
				waitfor "ENDINTERROG"
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
	setTextLineTrigger startlog2 :startlog2 "shortest path"
	setTextLineTrigger goodline2 :goodline2 ")"
	setTextTrigger endlog2 :endlog2 "Computer command ["
	pause
	:startlog2
		killalltriggers
		setVar $log 1
		goto :checkGoing2
	:goodline2
		killalltriggers
		if ($log = 1)
			setVar $logText $logText & CURRENTLINE
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
	setTextLineTrigger goodlineCourse :goodlineCourse ">"
	setTextTrigger endlogCourse :endlogCourse "Computer command ["
	pause
	:goodlineCourse
		killalltriggers
		if ($log = 1)
			setVar $logText $logText & CURRENTLINE
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
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
