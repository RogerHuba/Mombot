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

	fileExists $doesHelpFileExist "scripts\mombot\help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\mombot\help\"&$command&".txt" "- "&$command&" [on/off] " 
		write "scripts\mombot\help\"&$command&".txt" "   - Outputs the distance and time from last fig hit by enemy."
		write "scripts\mombot\help\"&$command&".txt" "   - Guesses next targets based on location"
		
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
	
	killtrigger r1
	killtrigger r2
	setTextLineTrigger r1 :r1 "Report Sector "
	setTextLineTrigger r2 :r2 "Your fighters in sector "
	pause

	:r1

		killAllTriggers
		getWord CURRENTLINE $sec 5
		striptext $sec ":"
		isNumber $test $sec
		setvar $durationticks 0
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
				else
					setvar $dist2 2
				end
				setVar $lastfighit $sec
				setvar $target_sector 0
				goSub :doReport
				gosub :attempt_drop
			end
		end
		goto :theend
	:r2
		killAllTriggers
		getWord CURRENTLINE $sec 5
			if ($lastfighit <> $sec)
				if ($lastfighit <> 0)
					getTimer $stopTicks
					setVar $durationTicks ($stopTicks - $startTicks)
					setPrecision 3
					setVar $seconds ($durationTicks / 2100000000)
					setPrecision 0
					getDistance $dist2 $lastfighit $sec 
				else
					setvar $dist2 2
				end
				setVar $lastfighit $sec
				setvar $target_sector 0
				goSub :doReport
				gosub :attempt_drop
			end
		goSub :doReport
		gosub :attempt_drop
		goto :theend
	
	:theend
end

:doReport
	setVar $foundcount 0
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
			if ($dist >= $dist2)
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
					if (($warpsInFigged < SECTOR.WARPINCOUNT[$focus]) and (SECTOR.WARPINCOUNT[$focus] > 1))
						//Valid Target
						setvar $target_sector $focus
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
		if ($searchs > 1000)
			//echo "* SEARCHES EXPIRED!"
			if ($foundcount <= 0)
				send "'Nothing within nearest 50 sectors*"
				setvar $target_sector 0
			else
				setVar $x 1
				setVar $out "FH: " & $sec & " D:" & $dist2 & " T:" & $seconds
				while ($x < $foundcount)
					setVar $out $out & " " & $foundSecs[$x][1] & "(" &  $foundSecs[$x][2] & ")"
					add $x 1
				end
				send "'" $out "*"				
			end	
			return

		end
		add $i 1
	end

return

:attempt_drop
	setVar $target_sector $foundSecs[1][1] 
	getTimer $startTicks
	#echo "*["&$seconds&"]["&$target_sector&"]*"
	if (($seconds <> "0") and ($target_sector <> "0"))
			#setTextLineTrigger r1 :r1 "Report Sector "
			#setTextLineTrigger r2 :r2 "Your fighters in sector "
			setDelaytrigger pdrop :pdrop ((($seconds)*1000)+300)
			pause
		:pdrop
			killtrigger r1
			killtrigger r2
			send "p"&$target_sector&"* y  "
	end
return