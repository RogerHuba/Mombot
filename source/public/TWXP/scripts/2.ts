# HOW MANy WARPS WE WANT
setVar $minwarps 2

setVar $allFigSec 0
setVar $sectorsChecked 0


setVar $i 11
while ($i <= 10000)
	getSectorParameter $i "FIGSEC" $isFigged
	setVar $allFigSec[$i] $isFigged
	setVar $sectorsChecked[$i] 0
	add $i 1
end
setVar $i 11




getNearestWarps $nearArray CURRENTSECTOR
setVar $report ""
setVar $reportCount 0
SetVar $i 1
while ($i <= $nearArray)
	setVar $nofig 0
	setVar $focus $nearArray[$i]
	if (SECTOR.WARPCOUNT[$focus] >= 3)  and ($allFigSec[$focus] = 1)
		#if (PORT.CLASS[$focus] = 3) or (PORT.CLASS[$focus] = 4) or (PORT.CLASS[$focus] = 5) or (PORT.CLASS[$focus] = 7)
			setVar $adjQuantC 0
			setVar $adj 1
			while ($adj <= SECTOR.WARPCOUNT[$focus])
				SetVar $adjSector SECTOR.WARPS[$focus][$adj]
				if ($allFigSec[$adjSector] = 0) and (SECTOR.FIGS.QUANTITY[$adjSector] = 0)
					add $adjQuantC 1
				end	
				add $adj 1
			end
			if ($adjQuantC >= $minwarps)
				echo $focus " - " $adjQuantC "*"
				setVar $report $report & "Sec: " & $focus & ": " & $adjQuantC  & " adj "
				add $reportCount 1
				if ($reportCount > 4)
					setVar $i 30001
				end
			end
		#end
		
	end
	add $i 1
end
if ($reportCount > 0)
	setVar $report $report & "*"
else
	setVar $report "no result, can we increase minwarps: " & $minwarps & "*"
end

send "'" $report
halt

	# 0 - zzz
	# 1 - BBS
	# 2 - BSB
	# 3 - SBB
	# 4 - SSB
	# 5 - SBS
	# 6 - BSS
	# 7 - SSS
	# 8 - BBB
halt

setVar $allFigSec 0
setVar $sectorsChecked 0
setVar $sectorsToVisit 0
setVar $sectorsToVisiti 0

setVar $i 11
while ($i <= 20000)
	getSectorParameter $i "FIGSEC" $isFigged
	setVar $allFigSec[$i] $isFigged
	setVar $sectorsChecked[$i] 0
	add $i 1
end
setVar $i 11



SetVar $i 11
while ($i <= 20000)
	setVar $nofig 0
	if (SECTOR.WARPINCOUNT[$i] >= 1)
		if ($allFigSec[$i] = 0)
			setVar $adj 1
			while ($adj <= SECTOR.WARPINCOUNT[$i])
				SetVar $adjSector SECTOR.WARPSIN[$i][$adj]
				if ($allFigSec[$adjSector] = 0)
					setVar $nofig 1
				end
				add $adj 1
			end
			if ($nofig = 0)
				setSectorParameter $i "MOWIT" "1"
				echo $i "*"
				
			end
		
		end
	end
	add $i 1
end
echo "here"

halt
SetVar $i 11
while ($i <= 10000)
	if (SECTOR.WARPCOUNT[$i] >= 1)
		if ($allFigSec[$i] = 0) and ($sectorsChecked[$i] = 0)
			if (($i > 10) AND ($i <> STARDOCK))

				setVar $haveAdjFig 0
				setVar $adjMostWarpsSector 0
				setVar $adjMostWarpsNum 0

				setVar $adj 1
				while ($adj <= SECTOR.WARPCOUNT[$i])
					SetVar $adjSector SECTOR.WARPS[$i][$adj]
					if ($allFigSec[$adjSector] > 0)
						setVar $haveAdjFig 1
						if (SECTOR.WARPCOUNT[$adjSector] > $adjMostWarpsNum)
			echo "h:" $adjSector "*"
							setVar $adjMostWarpsSector $adjSector
							setVar $adjMostWarpsNum SECTOR.WARPCOUNT[$adjSector]
						end
					end
					add $adj 1
				end
				if ($haveAdjFig = 1)
					setVar $isCorp3 0
					goSub :isNotCorp
					if ($isCorp3 = 0)
						echo $i "*"
						echo "Found Target: " $i " using Adj: " $adjMostWarpsSector "*"
write "holotargets.txt" $adjMostWarpsSector 
						add $sectorsToVisiti 1
						setVar $sectorsToVisit[$sectorsToVisiti] $adjMostWarpsSector
						setVar $sectorsChecked[$i] 1
						setVar $adj 1
						while ($adj <= SECTOR.WARPCOUNT[$adjMostWarpsSector])
							SetVar $adjSector SECTOR.WARPS[$adjMostWarpsSector][$adj]
							if ($allFigSec[$adjSector] = 0)
								setVar $sectorsChecked[$adjSector] 1
		echo "Adding " $adjSector " to checked too*"
							end
							add $adj 1
						end
					end
				end
				
			end
		
		end
	end
	add $i 1
end
echo "here"

halt

:isNotCorp

	setVar $value SECTOR.FIGS.OWNER[$i]
	lowercase $value
	#belong to corp#4, king's court#
	getwordpos $value $pos "belong to corp#"
	if ($pos > 0)
		gettext $value $corpnumber "belong to corp#" ","
		if ($corpnumber = 3)
			setVar $isCorp3 1
		end
	end

return

SetVar $i 11
while ($i <= 10000)
	if (SECTOR.WARPCOUNT[$i] >= 1)
		if ($allFigSec[$i] > 0)
			setVar $adj 1
			while ($adj <= SECTOR.WARPCOUNT[$i])
				SetVar $adjSector SECTOR.WARPS[$i][$adj]
				if ($allFigSec[$adjSector] > 0)
					goto :NextOrph
				end
				add $adj 1
			end
			if (($adjSector > 10) AND ($adjSector <> STARDOCK))
				add $Orphans 1

				echo $i "*"
				
			end
		:NextOrph
		end
	end
	add $i 1
end
echo "here"

halt
settextlinetrigger test :test "isrupted all of your mines in"
pause
:test
	send "p8000*ycpy1046*qp7908^Mq"


setVar $value SECTOR.FIGS.OWNER[$i]

lowercase $value
#belong to corp#4, king's court#
getwordpos $value $pos "belong to corp#"
if ($pos > 0)
	gettext $value $corpnumber "belong to corp#" ","
	
end
getwordpos $value $pos "belong to your corp"
if ($pos > 0)
	setvar $value "belong to corp#"&CURRENTCORP
end
isNumber $test $sector_params[$j][1]
getwordpos $sector_params[$j][1] $pos "belong to"
if ($pos <= 0)
	if ($test = true)
		setvar $sector_params[$j][1] "belong to corp#"&$sector_params[$j][1]
	else
		setvar $sector_params[$j][1] "belong to "&$sector_params[$j][1]
	end
end


halt
# Get Orphans
setVar $allFigSec 0

setVar $i 11
while ($i <= 10000)
	getSectorParameter $i "FIGSEC" $isFigged
	setVar $allFigSec[$i] $isFigged
	add $i 1
end
setVar $i 11


SetVar $i 11
while ($i <= 10000)
	if (SECTOR.WARPCOUNT[$i] >= 1)
		if ($allFigSec[$i] > 0)
			setVar $adj 1
			while ($adj <= SECTOR.WARPCOUNT[$i])
				SetVar $adjSector SECTOR.WARPS[$i][$adj]
				if ($allFigSec[$adjSector] > 0)
					goto :NextOrph
				end
				add $adj 1
			end
			if (($adjSector > 10) AND ($adjSector <> STARDOCK))
				add $Orphans 1

				echo $i "*"
				halt
			end
		:NextOrph
		end
	end
	add $i 1
end
echo "here"
halt

#AV_EPROB2 2061
setVar $ctime PORT.UPDATED[6640] 

echo $ctime "*"
getWord $ctime $controltime1 1
getWord $ctime $controltime2 2

replaceText $controltime2 ":" " "
getWord $controltime2 $controltime3 1

setVar $controlDate $controltime1
setVar $controlHour $controltime3
setVar $target false
setvar $results "NO FIG PORT REPORT:*Control Time:" & $ctime & "*"
setVar $results $results & $lookmsg & ".*"

setVar $sdone 0

echo $results "*"
setVar $found 0
setVar $i 11
while ($i <= 10000)
	setSectorParameter $i "TARGETS" 0
	setVar $tsec $i
	goSub :checkPort
	if ($checksOut = 1)
		
		echo $i "*"
		
	end
	add $i 1
end

halt

:checkFriendly

	setVar $x 1
	while ($x <= SECTOR.WARPCOUNT[$sec1])
		getSectorParameter SECTOR.WARPs[$sec1][$x] "FIGSEC" $hasFig
		if ($hasFig = 1)
echo $sec1 " has friendly fig adj at " SECTOR.WARPs[$sec1][$x] "*"
			setVar $sec1HasFriend 1
		end
		add $x 1
	end

	setVar $x 1
	while ($x <= SECTOR.WARPCOUNT[$sec2])
		getSectorParameter SECTOR.WARPs[$sec2][$x] "FIGSEC" $hasFig

		if ($hasFig = 1)
echo $sec1 " has friendly fig adj at " SECTOR.WARPs[$sec2][$x] "*"
			setVar $sec2HasFriend 1
		end
		add $x 1
	end
	
return


:checkEnemy

	setVar $x 1
	while ($x <= SECTOR.WARPCOUNT[$sec1])
		setVar $bsec SECTOR.WARPs[$sec1][$x] 
		goSub :checkBlockedTime
		if ($target = TRUE)
echo $sec1 " has blocked sector at " $bsec "*"
			setVar $sec1HasEnemy 1
			goto :checken2
		else
			if (SECTOR.FIGS.QUANTITY[$bsec] > 0)
				if (SECTOR.FIGS.OWNER[$bsec] <> "belong to your Corp")
	echo $sec1 " has enemy figs at " $bsec " " SECTOR.FIGS.OWNER[$bsec]  "*"
					setVar $sec1HasEnemy 1
					goto :checken2
				end
			end
		end
		add $x 1
	end

	:checken2

	setVar $x 1
	while ($x <= SECTOR.WARPCOUNT[$sec2])
		setVar $bsec SECTOR.WARPs[$sec2][$x] 
		goSub :checkBlockedTime
		if ($target = TRUE)
			setVar $sec2hasEnemy 1
			echo $sec2 " has blocked sector at " $bsec "*"
			goto :checkendone
		else
			if (SECTOR.FIGS.QUANTITY[$bsec] > 0)
				if (SECTOR.FIGS.OWNER[$bsec] <> "belong to your Corp")
echo $sec2 " has enemy figs at " $bsec " " SECTOR.FIGS.OWNER[$bsec]  "*"
					setVar $sec2hasEnemy 1
					goto :checkendone
				end
			end
		end
		add $x 1
	end
	:checkendone
return


:checkPort

	setVar $checksOut 0
	if (PORT.EXISTS[$tsec] = TRUE) and (SECTOR.EXPLORED[$tsec] = "YES")
		getSectorParameter $tsec "FIGSEC" $hasFig
		getSectorParameter $tsec "PORTDEST" $portGone
		if (($hasFig <> 1) and ($portGone <> 1))
			if (PORT.CLASS[$tsec] <> 0) and ($sdone[$tsec] = 0)
				goSub :checkTime
				if ($target = TRUE)
					setVar $checksOut 1
				end
				
			end
		end
		
	end

return


:checkTime
	setVar $target false

	setVar $ltime PORT.UPDATED[$tsec] 
	getWord $ltime $ltimeword1 1
	getWord $ltime $ltimeword2 2

	replaceText $ltimeword2 ":" " "
	getWord $ltimeword2 $ltimeword3 1

	
	if ($controlDate = $ltimeword1) and ($controlHour = $ltimeword3)
		setVar $target true
	end

return


:checkBlockedTime
	setVar $target false
	if (PORT.EXISTS[$bsec] = FALSE)
		return
	end
	setVar $ltime PORT.UPDATED[$bsec] 
	getWord $ltime $ltimeword1 1
	getWord $ltime $ltimeword2 2

	replaceText $ltimeword2 ":" " "
	getWord $ltimeword2 $ltimeword3 1
	
	if ($controlDate <> $ltimeword1)
		setVar $target true
	else
		if ($controlHour <> $ltimeword3)
			setVar $target true
		end
			
	end

return