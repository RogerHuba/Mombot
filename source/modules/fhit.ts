	loadVar $bot_name
	loadVar $user_command_line
	loadVar $parm1
	loadVar $parm2
	loadVar $parm3
	loadVar $parm4
	loadVar $parm5
	loadVar $parm6
	loadVar $parm7
	loadVar $parm8
	loadVar $command

	fileExists $doesHelpFileExist "scripts\MOMBot\Help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\MOMBot\Help\"&$command&".txt" "- "&$command&" [on/off] " 
		write "scripts\MOMBot\Help\"&$command&".txt" "   - Outputs the distance and time from last fig hit by enemy."
		write "scripts\MOMBot\Help\"&$command&".txt" "   - Guesses next targets based on location"
		
		send "'{" $bot_name "} - Writing help file for this command in Help directory.*"
	end

	if ($parm1 <> "on")
        	send "'{" $bot_name "} - Please use - fhit [on/off]*"
		halt
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

//echo "* Lookin from " $sec 

	getNearestWarps $nearArray $sec
	setVar $i 1
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
						if ($foundcount > 6)
							setVar $x 1
							setVar $out "FH: " & $sec & " D:" & $dist2 & " T:" & $seconds
							while ($x < $foundcount)
								setVar $out $out & " " & $foundSecs[$x][1] & "(" &  $foundSecs[$x][2] & ")"
								add $x 1
							end
							send "'" $out "*"
							return
						end
					end
				end	

			end
		end
		add $searchs 1
		if ($searchs > 50)
			//echo "* SEARCHES EXPIRED!"
			send "'Nothing within nearest 50 sectors*"
			return
		end
		add $i 1
	end

return
