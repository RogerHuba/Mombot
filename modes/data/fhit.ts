# A Few Ideas
#	- Provide number of search results
#	- Always show closest 5 sectors and distance
#	- Show guessed distance
#	- Provide a override distance and timing
#	- Provide actions

# Attempt Average Hit Times per corp
#	May need a reset average/ignore last hit etc.
#	OR perhaps we put a limitation - if hit between 2 - 14 secs it counts
#	       then within half the average
#	$timingHitsTotal[Corp] total	
#	$timingHitsNumber[Corp] number
#	$timingHits[Corp][1-tomany] values
#	$distHitsTotal[Corp] total
#       $distHits[Corp][1-tomany]
#       $distAvg[Corp]
#		Check if we store players to corp else extract from CLV
#
#
# Drop Target - 
#	All targets at Avg Distance
#	If none at that dist - next X $sectors
#		if average distance is 7, get all 7s, see which index it comes up as
#		if none at 7, then get next at 8-9-10 etc.
#		Grab these in loop 


gosub :BOT~loadVars


setVar $BOT~help[1]  $BOT~tab&" Track Fig hits and do something useful"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&" fhit [on/off] {numresults} {report/figs:xxx/pdrop}"
setVar $BOT~help[4]  $BOT~tab&" "
setVar $BOT~help[5]  $BOT~tab&"   {numresults} - How many hits do you want back."
setVar $BOT~help[6]  $BOT~tab&"   "
setVar $BOT~help[7]  $BOT~tab&"   {report} - just report data to subspace; default."
setVar $BOT~help[8]  $BOT~tab&"   {figs:n} - attempt planet dorp and drop figs on "
setVar $BOT~help[9]  $BOT~tab&"            - predicted sector "
setVar $BOT~help[10]  $BOT~tab&"   {pdrop}  - attempt planet drop on predicted sector"


gosub :bot~helpfile

setVar $BOT~script_title "Fig Hit Analysis"
gosub :BOT~banner
	

setVar $targetsToFind 20
setVar $searchDistance 2000


if ($bot~parm1 = "on")
	setvar $switchboard~message "Fig Hit ON.*"
	gosub :switchboard~switchboard
	
elseif ($bot~parm1 = "off")
	setvar $switchboard~message "Fig Hit Off*"
	gosub :switchboard~switchboard
	halt
else
	setvar $switchboard~message "Try fhit on or fhit off*"
	gosub :switchboard~switchboard
	halt
end

isNumber $number $bot~parm2
if (($number = 1) and ($bot~parm2 <> 0))
	setVar $targetsToFind $bot~parm2
	setvar $switchboard~message "Including " & $targetsToFind & " Search Results*"
	gosub :switchboard~switchboard
end

setVar $mode "report"


getWordPos $bot~user_command_line $pos "figs:"
if ($pos > 0)
	setVar $mode "figs"
	setVar $cline $bot~user_command_line & " "
	getText $cline $dropFigQuant "figs:" " "

	getWordPos $bot~user_command_line $pos "offensive"
	if ($pos > 0)
		setVar $dropftrsType "o"
	else
		setVar $dropftrsType "d"
	end
	
end

getWordPos $bot~user_command_line $pos "pdrop"
if ($pos > 0)
	setVar $mode "pdrop"
end

# Average Time Variables - anything outside of this  is probably a re-start or some other issue
# Most gridders move at a steady adn random pace.

setVar $minTime 2
setvar $maxTime 20

# INIT CORP ARRAYS - THIS WILL BECOME A CLV READER EVENTUALLY
setVar $timingHitsTotal[1] 0	
setVar $timingHitsNumber[1] 0
setVar $timingAvgHits[1] 0
setVar $distHitsTotal[1] 0
setVar $distHits[1] 0
setVar $distAvg[1] 0
setVar $PREV_TARGET_COUNT[1] 0
setVar $PREV_TARGET_TOTAL[1] $PREV_TARGET_0
setVar $PREV_TARGET_AVG_I[1] 0

#setVar $timingHits


setVar $minReqForAvgLock 3
setVar $avgsLocked 0



setVar $loop  1
setVar $findSecs 3
setVar $foundSecs 0
setVar $dist2 0
setVar $lastfighit 0

setVar $stopTicks 0
setVar $startTicks 0
setVar $foundcount 1
setVar $foundSecs 0
setVar $searchs 0


while ($loop = 1)
	
	setTextLineTrigger r1 :r1 "Report Sector "
	setTextLineTrigger r2 :r2 "Your fighters in sectosr "
	pause

	:r1

		killAllTriggers
# check for spoof
# check for corp  - i.e. we won't maek this up in future
		setVar $player~corp 1
		setvar $alien false
		getText currentansiline $alien_check ": " "'s"
		getWordPos $alien_check $pos #27 & "[1;36m" & #27 & "["
		if ($pos > 0)
			setvar $alien true
			setTextLineTrigger r1 :r1 "Report Sector "
			setTextLineTrigger r2 :r2 "Your fighters in sectosr "
			pause
		end

		getWord CURRENTLINE $sec 5
		striptext $sec ":"
		isNumber $test $sec
		if ($test = 1)
			setVar $PREV_TARGET_FOUND[$player~corp] 0
			//setVar $figList[$sec] 0
			if ($lastfighit <> $sec)
				if ($lastfighit <> 0)
					
					getTimer $stopTicks
					setVar $durationTicks ($stopTicks - $startTicks)
					setPrecision 1
					setVar $seconds ($durationTicks / 2100000000)
					setPrecision 0
					getDistance $dist2 $lastfighit $sec
					
					# MEanin we got a hit in standard time and should do something
					setVar $recordhitOk 0
					goSub :recordHit
	
					# if record hit was within an accepible time - then judge success of last array
					setVar $PREV_TARGET_FOUND[$player~corp] 0
					setVar $PREV_TARGET_I[$player~corp] 0
					if ($recordhitOk = 1)
	
						setVar $g 1
						while ($g <= $foundcount)
							if ($foundSecs[$g][1] = $sec)
								setVar $PREV_TARGET_FOUND[$player~corp] 1
								setVar $PREV_TARGET_I[$player~corp] $g
								setVar $prevTargetReporti  $g
								setVar $g 99999
								
							end
							add $g 1
						end
						if ($PREV_TARGET_FOUND = 1)
							add $PREV_TARGET_COUNT[$player~corp] 1
							add $PREV_TARGET_TOTAL[$player~corp] $PREV_TARGET_I[$player~corp]
							setVar $PREV_TARGET_AVG_I[$player~corp] ($PREV_TARGET_TOTAL[$player~corp]/$PREV_TARGET_COUNT[$player~corp])
						end
					end
					
				end
				setVar $lastfighit $sec
				goSub :doReport
				
				getTimer $startTicks
			end
		end
		goto :theend
	:r2
		killAllTriggers
		getWord CURRENTLINE $sec 5
		goSub :doReport
		goto :theend
	
	:theend
end


:doReport
	setVar $foundcount 1
	setVar $foundSecs 0
	setVar $searchs 0


	setVar $firstSix ""
	setVar $firstSixi 0

//echo "* Lookin from " $sec 

	getNearestWarps $nearArray $sec
	setVar $i 2
	while ($i <= $nearArray)
		setVar $focus $nearArray[$i]
		//echo "*First Option: " $focus
		//Do we have a fighter there?
		getsectorparameter $focus "FIGSEC" $F
		
		if ($f > 0)
			//echo "*NearFig: " $focus "*"
			getDistance $dist $sec $focus 
			//echo "* dist: " $dist "*"
			// Make sure we are at least 2 warps away

			if ($firstSixi < 6)
				add $firstSixi 1
				setVar $six $focus & "[" & $dist & "]"

				setVar $firstSix[$firstSixi] $six
				
			end
			
			if ($distAvg[$player~corp] = 0)
				setVar $mindist 1
			else
				setVar $mindist $distAvg[$player~corp]
			end
			
			if ($dist >= $mindist)
				// MAke sure we have 2 warps in
				//echo "* SECTOR.WARPINCOUNT[$focus]: " SECTOR.WARPINCOUNT[$focus] "*"
			
				if (SECTOR.WARPINCOUNT[$focus] > 0)
					setVar $warpsInFigged 0
					setVar $y 1
					//Loop through and count how many warps in have our figs
					
					while ($y <= SECTOR.WARPINCOUNT[$focus])
						
						getsectorparameter SECTOR.WARPSIN[$focus][$y] "FIGSEC" $F
						//if ($figList[SECTOR.WARPSIN[$focus][$y]] > 0)
						if ($f > 0)
							add $warpsInFigged 1
						end
						add $y 1
					end
					//echo "* $warpsInFigged: " $warpsInFigged "*"
					//echo "* $warpsInFigged: " $warpsInFigged "*"

					// If warps in figged is less than total warps - meaining the potenially have a enemy fig
					if ($warpsInFigged < SECTOR.WARPINCOUNT[$focus])
						//Valid Target
						setVar $foundSecs[$foundcount][1] $focus
						setVar $foundSecs[$foundcount][2] $dist
						add $foundcount 1
			//echo "* TARGET!!"
						if ($foundcount > $targetsToFind)
							goSub :sendReport

							return
						end
					end
				end	

			end
		end
		add $searchs 1
		if ($searchs > $searchDistance)
			//echo "* SEARCHES EXPIRED!"
			
			setVar $exitMsg "Only found " & $foundcount & " within " & $searchDistance & " sectors; exiting.*"
			setVar $SWITCHBOARD~message $exitMsg
			gosub :SWITCHBOARD~switchboard
			
			goSub :sendReport
			return
		end
		add $i 1
	end

return

:recordHit

echo "# SECONDS" $seconds " -min:" $minTime " max: " $maxTime "*"
	if (($seconds >= $minTime) and ($seconds <= $maxTime))
		# GOOD HIT FOR NOW- We'll recheck this if we hit the min 5 hits for avg
		setVar $recordhitOk 1
		setPrecision 0	
		add $timingHitsNumber[$player~corp] 1
		if ($timingHitsNumber[$player~corp] >= $minReqForAvgLock)
			setVar $avgsLocked 1
		end
		setPrecision 0
		add $timingHitsTotal[$player~corp] $durationTicks
		setVar $timingHits[$player~corp][$timingHitsNumber[$player~corp]] $durationTicks
		setVar $timingAvgHits[$player~corp] ($timingHitsTotal[$player~corp]/$timingHitsNumber[$player~corp])
echo "# ind:" $timingHitsNumber[$player~corp] " Hits"  $timingHitsNumber[$player~corp] "  TOTAL"   $timingHitsTotal[$player~corp] "  AVG: " $timingAvgHits[$player~corp] " Thisv:" $timingHits[$player~corp][$timingHitsNumber[$player~corp]] "**"
echo "CHK: " $timingHits[$player~corp][1] "*"

		add $distHitsTotal[$player~corp] $dist2
		setVar $distHits[$player~corp][$timingHitsNumber[$player~corp]] $dist2
		setVar $distAvg[$player~corp] ($distHitsTotal[$player~corp]/$timingHitsNumber[$player~corp])

echo "# DIST"  $timingHitsNumber[$player~corp] "  TOTAL"   $distHitsTotal[$player~corp] "  AVG: " $distAvg[$player~corp] "**"


		if ($timingHitsNumber[$player~corp] > 5)
			# Lets check average for outliers
			# RESET THIS AND CHECK AGAIN BELOW
			setVar $recordhitOk 0

			setVar $timingHitMin ($timingAvgHits[$player~corp] - ($timingAvgHits[$player~corp]/2))
			setVar $timingHitMax ($timingAvgHits[$player~corp] + ($timingAvgHits[$player~corp]/2))
	echo "# REDOING AVERAGES " $timingHitMin " to " $timingHitMax "*"

			setVar $tempHits 0
			setVar $tempHitsi 0
			setVar $tempTotal 0
			setVar $tempDist 0
			setVar $tempDistTotal 0
			setVar $h 1
			while ($h <= $timingHitsNumber[$player~corp])

	echo " Check Hit: " $timingHits[$player~corp][$h] " d;" $distHits[$player~corp][$h]  " h:" $h 
				if (($timingHits[$player~corp][$h] >= $timingHitMin) and ($timingHits[$player~corp][$h] <= $timingHitMax))
		echo " KEEP"
					add $tempHitsi 1
					setVar $tempHits[$tempHitsi] $timingHits[$player~corp][$h]
					add $tempTotal $timingHits[$player~corp][$h]
					setVar $tempDist[$tempHitsi] $distHits[$player~corp][$h]
					add $tempDistTotal $distHits[$player~corp][$h]
					if ($h = $timingHitsNumber[$player~corp])
						setVar $recordhitOk 1
					end
				else
		echo " DROP"
				end
		echo "*"	
				add $h 1
				
			end
			if ($tempTotal <> $timingHitsTotal[$player~corp])

				setVar $h 1
				while ($h <= $timingHitsNumber[$player~corp])
					setVar $timingHits[$player~corp][$h] 0
					setVar $distHits[$player~corp][$h] 0
					add $h 1
				end
				
				setVar $timingHitsNumber[$player~corp] $tempHitsi
				setVar $timingHitsTotal[$player~corp] 0
				setVar $distHitsTotal[$player~corp] 0
				setVar $h 1
				while ($h <= $tempHitsi)
					setVar $timingHits[$player~corp][$h] $tempHits[$h]
					add $timingHitsTotal[$player~corp] $tempHits[$h]
					setVar $distHits[$player~corp][$h] $tempDist[$h]
					add $distHitsTotal[$player~corp] $tempDist[$h]
					add $h 1

				end

				setVar $timingAvgHits[$player~corp] ($timingHitsTotal[$player~corp]/$timingHitsNumber[$player~corp])
				setVar $distAvg[$player~corp] ($distHitsTotal[$player~corp]/$timingHitsNumber[$player~corp])
echo "# RECALULATED AVERAGE*"
echo "# NEW DATA*"
echo "# Hits"  $timingHitsNumber[$player~corp] "  TOTAL"   $timingHitsTotal[$player~corp] "  AVG: " $timingAvgHits[$player~corp] "**"
echo "# DIST"  $timingHitsNumber[$player~corp] "  TOTAL"   $distHitsTotal[$player~corp] "  AVG: " $distAvg[$player~corp] "**"
			end
		end

	end

return

:sendReport
	setPrecision 1
	setVar $avgSec ($timingAvgHits[$player~corp] / 2100000000)
	setPrecision 0

	if ($PREV_TARGET_FOUND[$player~corp] = 1)
		setVar $prevtargetinfo "Sector found in previous list at : " & $prevTargetReporti & "*"
	else
		setVar $prevtargetinfo ""
	end
	setVar $out $prevtargetinfo & "FH: " & $sec & " D:" & $dist2 & " T:" & $seconds & " Avg Time:" & $avgSec & " Avg Dist: " & $distAvg[$player~corp]
	
	goSub :addClosestSix
	
	setVar $out $out & "Predicted: "
	setVar $x 1
	
	while ($x < $foundcount)
		setVar $out $out & " " & $foundSecs[$x][1] & "(" &  $foundSecs[$x][2] & ")"
		add $x 1
	end
	if ($mode = "pdrop")
		if ($foundSecs[$x][1] <> currentsector)
			send "'About to drop on sector "&$foundSecs[$x][1]&" in "&$avgSec&" seconds..*"
			setdelaytrigger waithere :nowdrop (($avgSec*1000)-500)
			pause
			:nowdrop
			send "p" $foundSecs[$x][1] "*  y  "
		end
	end
	send "'*" $out "**"
	return
return

:addClosestSix

	setVar $out $out & "*Nearest Six: "
	setVar $si 1
	while ($si <= $firstSixi)
		
		if ($si > 1)
			setVar $out $out & " "
		end
		setVar $out $out & $firstSix[$si]
		add $si 1
	end
	
	setVar $out $out & "*"
return

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
