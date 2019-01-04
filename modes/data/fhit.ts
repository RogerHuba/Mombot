# A Few Ideas
#	- Provide number of search results
#	- Always show closest 5 sectors and distance
#	- Show guessed distance
#	- Provide a override distance and timing
#	- Provide actions

gosub :BOT~loadVars


setVar $BOT~help[1]  $BOT~tab&" Track Fig hits and do something useful"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&" fhit [on/off] {numresults}"
setVar $BOT~help[4]  $BOT~tab&" "
setVar $BOT~help[5]  $BOT~tab&"   numresults - How many hits do you want back."


gosub :BOT~help_file

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

setVar $loop  1
setVar $findSecs 3
setVar $foundSecs 0
setVar $dist2 0
setVar $lastfighit 0

setVar $stopTicks 0
setVar $startTicks 0


while ($loop = 1)
	
	setTextLineTrigger r1 :r1 "Report Sector "
	setTextLineTrigger r2 :r2 "Your fighters in sectosr "
	pause

	:r1

		killAllTriggers
		getWord CURRENTLINE $sec 5
		striptext $sec ":"
		isNumber $test $sec
		if ($test = 1)
			//setVar $figList[$sec] 0
			if ($lastfighit <> $sec)
				if ($lastfighit <> 0)
					getTimer $stopTicks
					setVar $durationTicks ($stopTicks - $startTicks)
					setPrecision 3
					setVar $seconds ($durationTicks / 2100000000)
					setPrecision 0
					getDistance $dist2 $lastfighit $sec 
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

			if ($dist > 1)
				// MAke sure we have 2 warps in
				//echo "* SECTOR.WARPINCOUNT[$focus]: " SECTOR.WARPINCOUNT[$focus] "*"
			
				if (SECTOR.WARPINCOUNT[$focus] > 1)
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


:sendReport
	
	setVar $out "FH: " & $sec & " D:" & $dist2 & " T:" & $seconds
	
	goSub :addClosestSix
	
	setVar $out $out & "Predicted: "
	setVar $x 1
	
	while ($x < $foundcount)
		setVar $out $out & " " & $foundSecs[$x][1] & "(" &  $foundSecs[$x][2] & ")"
		add $x 1
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

include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"


