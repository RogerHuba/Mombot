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
loadvar $SHIP~cap_file
loadvar $game~internalAliens
loadvar $game~internalFerrengi
loadvar $game~limpet_cost
loadvar $game~limpet_removal_cost
loadvar $game~armid_cost
loadvar $game~photon_cost
loadvar $game~DISRUPTOR_COST
loadvar $bot~username
lowercase $bot~username
loadvar $game~MULTIPLE_PHOTONS
loadvar $bot~folder

gosub :combat~init 

fileExists $SHIP~cap_file_chk $SHIP~cap_file
if ($SHIP~cap_file_chk <> TRUE)
	gosub :SHIP~getShipCapStats
else
	gosub :ship~loadShipInfo
end

gosub :SHIP~getShipStats
gosub :player~quikstats

setVar $BOT~help[1]  $BOT~tab&" Track Fig hits and do something useful"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&" fhit [on/off] {numresults} {report/figs:xxx/pdrop}"
setVar $BOT~help[4]  $BOT~tab&" "
setVar $BOT~help[5]  $BOT~tab&"   {numresults} - How many hits do you want back."
setVar $BOT~help[6]  $BOT~tab&"   "
setVar $BOT~help[7]  $BOT~tab&"   {report} - just report data to subspace; default."
setVar $BOT~help[8]  $BOT~tab&"   {pdrop}  - attempt planet drop on predicted sector"
setVar $BOT~help[9]  $BOT~tab&"   {figs:n} - attempt planet drop and drop figs on "
setVar $BOT~help[10]  $BOT~tab&"            - predicted sector (PDROP MODE)"
setVar $BOT~help[11]  $BOT~tab&"{offensive} - Send offensive messages to Fed space, or"
setVar $BOT~help[12]  $BOT~tab&"              make figs offensive, who knows?"


gosub :bot~helpfile

setVar $BOT~script_title "Fig Hit Analysis"
gosub :BOT~banner
	

setVar $targetsToFind 20
setVar $searchDistance 2000
gosub :player~quikstats
	
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


getWordPos $bot~user_command_line $pos "pdrop"
if ($pos > 0)
	setVar $mode "pdrop"

end
if ($mode = "pdrop")
	if ($player~current_prompt <> "Citadel")
		setvar $switchboard~message "Must be in citadel for pdrop mode.*"
		gosub :switchboard~switchboard
		halt
	end
	gosub :ship~getshipstats
	send "q"
	gosub :PLANET~getPlanetInfo	
	send " m * * * *c "
	setvar $call~starting_planet $planet~planet

	
	if ($planet~PLANET_FUEL < 10000)
		setvar $switchboard~message "Need more than 10k ore, you won't get far.*"
		gosub :switchboard~switchboard
		halt
	end
	setVar $pdropMsg "Planet Drop Mode"
		
	getWordPos $bot~user_command_line $pos "figs:"
	if ($pos > 0)
		setVar $dropftrs TRUE
		setVar $cline $bot~user_command_line & " "
		getText $cline $dropFigQuant "figs:" " "

		getWordPos $bot~user_command_line $pos "offensive"
		if ($pos > 0)
			setVar $dropftrsType "o"
		else
			setVar $dropftrsType "d"
		end
		send "c;q"
		waitFor "Figs Per Attack:"
		getWord CURRENTLINE $maxFigAttack 5
		
		setVar $maxFigAttack 20000
		setVar $moveFigMacro ""
		setVar $moved 0

		while ($moved < $dropFigQuant)
			
			setVar $toMove ($dropFigQuant - $moved)

			if ($toMove >= $maxFigAttack)
				setVar $thisMove $maxFigAttack
				setVar $moved ($moved + $thisMove)
			else
				setVar $thisMove $toMove
				setVar $moved $moved + $thisMove
			end

			setVar $moveFigMacro $moveFigMacro & "q m n t* q fz " & $moved & "* * zc" & $dropftrsType & " * l" & $planet~planet & " *m* t * ccq"
		end

		setVar $pdropMsg $pdropMsg & " - Deploying " & $dropFigQuant & " " & $dropftrsType & " Figs.*"
		
		if ($planet~PLANET_FIGHTERS < $dropFigQuant)
			setvar $switchboard~message "You have less figs than required for the drop.*"
			gosub :switchboard~switchboard
			halt
		end
	else
		setVar $pdropMsg $pdropMsg & "*"
	end
	setvar $switchboard~message $pdropMsg
	gosub :switchboard~switchboard
end

# Average Time Variables - anything outside of this  is probably a re-start or some other issue
# Most gridders move at a steady adn random pace.

:resetTimes

killAllTriggers

setVar $minTime 0
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

setVar $seconds 0

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
	setDelayTrigger  reset :resetTimes ($maxTime * 1000)
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
			setDelayTrigger  reset :resetTimes ($maxTime * 1000)
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
		getText currentansiline $alien_check ": " "'s"
		getWordPos $alien_check $pos #27 & "[1;36m" & #27 & "["
		if ($pos > 0)
			setvar $alien true
			setTextLineTrigger r1 :r1 "Report Sector "
			setTextLineTrigger r2 :r2 "Your fighters in sectosr "
			setDelayTrigger  reset :resetTimes ($maxTime * 1000)
			pause
		end
		getWord CURRENTLINE $sec 5
		goSub :doReport
		goto :theend
	
	:theend
end


:doReport
	getwordpos $memory $pos " "&$sec&" "
	setvar $target_was_predicted false
	if ($pos > 0)
		setvar $last_target $sec
		setvar $target_was_predicted true
	end
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
				setVar $mindist ($distAvg[$player~corp]-1)
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
			
			#setVar $exitMsg "Only found " & $foundcount & " within " & $searchDistance & " sectors; exiting.*"
			#setVar $SWITCHBOARD~message $exitMsg
			#gosub :SWITCHBOARD~switchboard
			
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
	setvar $memory " "
	setVar $drophere ""
	while ($x < $foundcount)
		setVar $out $out & " " & $foundSecs[$x][1] & "(" &  $foundSecs[$x][2] & ")"
		setvar $memory $memory&" "&$foundSecs[$x][1]&" "
echo "#" $foundSecs[$x][1] " " $foundSecs[$x][2] " " $distAvg[$player~corp] " #"

		if ($foundSecs[$x][2] >= $distAvg[$player~corp]) and ($drophere = "")
			setVar $drophere $foundSecs[$x][1]
			echo "'drop here:" $drophere "*"
		end 
		add $x 1
	end
	setvar $switchboard~message $out&"**"
	

	getrnd $lucky 1 $foundcount
	if ($mode = "pdrop")
		gosub :player~quikstats
		
		if ($avgSec > 0.0) or ($seconds > 0.0)
			
			gosub :getTime
			setVar $time " "&$hour & ":" & $minute & ":" & $second & ":" & $msec & "  "
			echo  "#" $time "#*"
			setPrecision 1
			if ($avgSec = 0.0)
				setVar $shootTime ($seconds - 0.2)
			else
				setVar $shootTime ($avgSec - 0.2)
			end
			
			if (($drophere <> $player~current_sector) and ($drophere <> 0))
				send "'About to drop on sector "&$drophere&" in "&$shootTime&" seconds Dist: " $distAvg[$player~corp] "..*"
				killalltriggers
				setdelaytrigger waithere :nowdrop ($shootTime*1000)
				setPrecision 0
				pause

				
				:nowdrop
				send "p" $drophere "*  y  "
				gosub :getTime
				setVar $time " "&$hour & ":" & $minute & ":" & $second & ":" & $msec & "  "
				echo  "#" $time "#*"

				if ($dropftrs = TRUE)
					send $moveFigMacro
				end
				
				goSub :checkForVictims
				gosub :getTime
				setVar $time " "&$hour & ":" & $minute & ":" & $second & ":" & $msec & "  "
				echo  "#" $time "#*"
				setdelaytrigger waithere2 :nowdrop2 2000
				setPrecision 0
				pause
				:nowdrop2
					goSub :checkForVictims
					if ($dropftrs = true)
						goSub :retrieveFigs
					end
				goto :resetTimes
			end
			setPrecision 0
		else
			send "'avg seconds to low, waiting..*"
		end
	end
	gosub :switchboard~switchboard
	if ($target_was_predicted)
		setvar $switchboard~message "Sector "&$last_target&" was predicted last time!*"
		gosub :switchboard~switchboard
	end

return




:checkForVictims
	gosub :player~quikstats
	send " s*  * "
	:scanit_again
	setvar $player~startingLocation $player~current_prompt
	gosub :sector~getSectorData
	if ($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips))
		if ($capture)
			gosub :combat~fastCapture
		else
			goSub :combat~fastCitadelAttack
		end
		goto :scanit_again
	elseif (($sector~emptyShipCount > $sector~myShipCount))
		gosub :combat~fastCapture
		goto :scanit_again
	end
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

# ----====[Get the date and time ]====----
# creates a unique number timestamp
# if time/date is 10:50:00am 9/15/05 then output = 20050915105000
# if time/date is 5:33:22pm 9/15/05 then output = 20050915173322
:getTime
getTime $dateTime "yyyymmddhhnnsszzz am/pm"
getword $dateTime $amPMcheck 2
getword $dateTime $finalTime 1
cuttext $finalTime $12check 9 2
if ($amPMcheck = "pm")
	if ($12check <> 12)
		add $finalTime 120000000
	end
end
cuttext $finalTime $year 1 4
cuttext $finalTime $month 5 2
cuttext $finalTime $day 7 2
cuttext $finalTime $hour 9 2
cuttext $finalTime $minute 11 2
cuttext $finalTime $second 13 2
cuttext $finalTime $msec 15 3
# echo ANSI_10 "*" $finalTime
# echo ANSI_10 "**" $month "/" $day "/" $year " - " $hour ":" $minute ":" $second
# echo ANSI_10 "*Date: " DATE " Time: " TIME "*"
return


:retrieveFigs
	gosub :player~quikstats
	send " s*  * "
	setVar $figOwner SECTOR.FIGS.OWNER[$player~current_sector]
	setVar $figQuant SECTOR.FIGS.QUANTITY[$player~current_sector]
	
	waitfor "<Scan Sector>"
	waitfor "Citadel treasury contains"
	

	if ($figQuant <> 0) AND (($figOwner = "belong to your Corp") or ($figOwner = "yours"))
		
		setVar $retFigMacro ""
		setVar $moved 0
		setVar $sectorQuant $figQuant
		if ($dropFigQuant > $figQuant)
			setVar $retQuant $figQuant
		else
			setVar $retQuant $dropFigQuant
		end
		while ($moved < $retQuant)
			
			setVar $toMove ($retQuant - $moved)

			if ($toMove >= $ship~SHIP_FIGHTERS_MAX)
				setVar $thisMove $ship~SHIP_FIGHTERS_MAX
				setVar $moved ($moved + $thisMove)
				setVar $sectorQuant ($sectorQuant - $thisMove)
			else
				setVar $thisMove $toMove
				setVar $moved $moved + $thisMove
				setVar $sectorQuant ($sectorQuant - $thisMove)
				
			end
			
			if ($sectorQuant = 0)
				
				setVar $retFigMacro $retFigMacro & "q m n l* q fz 1* * zc" & $dropftrsType & " * l" & $planet~planet & " *m* t * ccq"

			else
				setVar $retFigMacro $retFigMacro & "q m n l* q fz " & $sectorQuant & "* * zc" & $dropftrsType & " * l" & $planet~planet & " *m* t * ccq"
			end

		end

	end

	send $retFigMacro
	
return

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\combat\holokill\combat"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\combat\fastcitadelattack\combat"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\planet\landingsub\planet"
include "source\bot_includes\ship\getshipcapstats\ship"
include "source\bot_includes\ship\loadshipinfo\ship"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\sector\getsectordata\sector"

