gosub :BOT~loadVars

loadVar $MAP~STARDOCK	

setVar $BOT~help[1]  $BOT~tab&"    Finds PRHunt sectors for early game"
setVar $BOT~help[2]  $BOT~tab&"    "
setVar $BOT~help[3]  $BOT~tab&"    setprhunt {minadj} {maxtargets}"
setVar $BOT~help[4]  $BOT~tab&"     "
setVar $BOT~help[5]  $BOT~tab&" Options:"
setVar $BOT~help[6]  $BOT~tab&"    {minadj}     target port should have min adj sectors"
setVar $BOT~help[7]  $BOT~tab&"                 more suggests more chances of someone "
setVar $BOT~help[8]  $BOT~tab&"                 stopping by. default: 3"
setVar $BOT~help[9] $BOT~tab&"                 "
setVar $BOT~help[10] $BOT~tab&"    {maxtargets} how many sectors to target"
setVar $BOT~help[12] $BOT~tab&"                 "
setVar $BOT~help[13] $BOT~tab&"    Use PRTARGETS option on prhunt"
setVar $BOT~help[14] $BOT~tab&"    Day 1 usage, so assumes port not blocked"
setVar $BOT~help[15] $BOT~tab&"    PRhunt will check"


gosub :bot~helpfile

setVar $BOT~script_title "PRHunt Target Setter"
gosub :BOT~banner

#setVar $ports[1] "BBS"
#setVar $ports[2] "BSB"
#setVar $ports[3] "SBB"
#setVar $ports[4] "SSB"
#setVar $ports[5] "SBS"
#setVar $ports[6] "BSS"
#setVar $ports[7] "SSS"
#setVar $ports[8] "BBB"

clearallavoids

# vars to send in
# Min Warps on Adj sector, more the better?
setVar $minAdjSectors 3

# how many we want to target
SetVar $maxTargets 20

setVar $val $bot~parm1
isNumber $number $val

if ($number = 1)
	setVar $minAdjSectors $bot~parm1
    setVar $val $bot~parm2
    isNumber $number $val
    if ($number = 1)
        SetVar $maxTargets $bot~parm2
    end
end


setVar $SWITCHBOARD~message "Setting max " & $maxTargets & " with min " & $minAdjSectors & " adj warps.*"
gosub :SWITCHBOARD~switchboard

setDelayTrigger delay :startPause 1000
pause
:startPause
setArray $sectorHasFig SECTORS
setArray $targetTaken SECTORS

setvar $arrivalSectors 0
setVar $targetSectors 0
setVar $targetSectorsPort 0
setVar $targetSectorsNumPaths 0
setVar $targetSectorsAdjSecs 0

setVar $totalTargets 0
setVar $totalHitCount 0
setVar $avgHitCount 0
setVar $y 1



goSub :loadFigs

setVar $hitCount 0

setVar $i 11
while ($i <= SECTORS)
	setSectorParameter $i "PRTARGETS" 0
	if (SECTOR.EXPLORED[$i] = "YES") and ($sectorHasFig[$i])
		#echo $i " has fig and explored*"
		setVar $y 1
		while ($y < SECTOR.WARPCOUNT[$i])
			# Loop thru it's warps
			setVar $sec SECTOR.WARPS[$i][$y]
			if ($sec <> $MAP~STARDOCK) and ($sec > 10)
				if ($sectorHasFig[$sec] = 0) and (SECTOR.EXPLORED[$sec] = "YES") and (SECTOR.WARPCOUNT[$sec] >= $minAdjSectors)  
					if (PORT.EXISTS[$sec])
						setVar $porttype PORT.CLASS[$sec]
						#if ($porttype = 1) or ($porttype = 2) or ($porttype = 4) or ($porttype = 5)
							setVar $g 1
							setVar $sectorGood 0
							
							while ($g <= SECTOR.WARPCOUNT[$sec])
								if ($sectorHasFig[SECTOR.WARPS[$sec][$g]] = 0)
									setVar $sectorGood 1
								end
								add $g 1
							end
							
							if ($sectorGood = 1)
								
								setVar $targetFound $sec
								setVar $targetGood 0
								goSub :confirm_FiringSolution
								if ($targetGood = 1)
									if ($targetTaken[$targetFound] = 0)
										setVar $targetTaken[$targetFound] 1
										add $totalTargets 1
										setvar $arrivalSectors[$totalTargets] $i
										setVar $targetSectors[$totalTargets] $sec
										setVar $targetSectorsPort[$totalTargets] $porttype
										setVar $targetSectorsNumPaths[$totalTargets] $hitCount
										setVar $targetSectorsAdjSecs[$totalTargets] SECTOR.WARPCOUNT[$sec]
										echo "Found Target Shoot From: " $i " into " $sec " - it has " SECTOR.WARPCOUNT[$sec]
										echo  "  warps port:" PORT.CLASS[$sec] " Hit Count:" $hitCount "*"
										add $totalHitCount $hitCount

									end
								end
							end
						#end

					end
				end
			end
			add $y 1
		end
	end

#18975
	add $i 1
end
setVar $avgHitCount 0
echo "**TOTAL TARGETS:" $totalTargets  "*"
if ($totalTargets > $maxTargets)
	echo "Total Targets more than maxTargets*"
	echo "Attempting to trim... *"
	
	setVar $keepFrom ($totalTargets - $maxTargets)
	setVar $maxI $totalTargets
	setVar $maxVal 0
	setVar $indAdj 1

	setVar $i 1
	while ($i <= $totalTargets)
		setVar $toSort[$i] $targetSectorsNumPaths[$i]
		setVar $toSort[$i][1] $arrivalSectors[$i]
		setVar $toSort[$i][2] $targetSectors[$i]
		setVar $toSort[$i][3] $targetSectorsPort[$i]
		setVar $toSort[$i][4] $targetSectorsAdjSecs[$i]
		if ($maxVal < $targetSectorsNumPaths[$i])
			setVar $maxVal $targetSectorsNumPaths[$i]
		end
		add $i 1
	end

	gosub :sort

	setVar $totalTargets 0

	setVar $i ($keepFrom + 1)
	while ($i <= $maxI)

		echo $sorted[$i] " " $sorted[$i][1] " into " $sorted[$i][2] "*"
		add $totalTargets 1
		setvar $arrivalSectors[$totalTargets] $toSort[$i][1]
		setVar $targetSectors[$totalTargets] $toSort[$i][2]
		setVar $targetSectorsPort[$totalTargets] $toSort[$i][3]
		setVar $targetSectorsNumPaths[$totalTargets] $toSort[$i]
		setVar $targetSectorsAdjSecs[$totalTargets] $toSort[$i][4]

		setSectorParameter $targetSectors[$totalTargets] "PRTARGETS" 1 
		add $i 1
	end
		
else
    setVar $i 1
    while ($i <= $totalTargets)
        echo "Found Target Shoot From: " $arrivalSectors[$i] " into " $targetSectors[$i] "*" 
        setSectorParameter $targetSectors[$i] "PRTARGETS" 1 
        add $i 1
    end
    
end

setVar $SWITCHBOARD~message $totalTargets & " Targets Found and Sector Param Set.*"
gosub :SWITCHBOARD~switchboard

halt
 ## SORT
    ## Sorts an array using counting sort.
    ## by Joshdan
    ##
    ## args:
    ## $tosort[] => Array to sort (e.g. distances)
    ## $tosort[][1] => Extra data to copy (e.g. sector numbers)
    ## $maxI => size of $tosort array
    ## $maxVal => Highest value in $tosort[]
    ## $indAdj => 1 minus the lowest value in $tosort (generally set to 1)
    ##
    ## returns:
    ## $sorted[] => Sorted array
    ## $sorted[][1] => Extra data (respecting new sort order)
    ##
	

    :Sort
		

		setArray $counts ($maxVal+$indAdj)
		setArray $sorted ($maxI)
		# count occurences of each value
		setVar $i $maxI
		while ($i > 0)
			add $counts[($tosort[$i]+$indAdj)] 1
			subtract $i 1
		end
		# adjust counts into indexes
		setVar $j 1
		while ($j < ($maxVal+$indAdj))
			add $counts[($j+1)] $counts[$j]
			add $j 1
		end
		# copy values to sorted list, using indexes from counts array
		# looping backwards makes the sort stable
		setVar $i $maxI
		while ($i > 0)
			setVar $val ($tosort[$i] + $indAdj)
			setVar $sorted[$counts[$val]] ($val - $indAdj)
			# copy additional "payload" data (for instance sector numbers)
			setVar $sorted[$counts[$val]][1] $tosort[$i][1]
			setVar $sorted[$counts[$val]][2] $tosort[$i][2]
			setVar $sorted[$counts[$val]][3] $tosort[$i][3]
			setVar $sorted[$counts[$val]][4] $tosort[$i][4]
			subtract $counts[$val] 1
			subtract $i 1
		end

    return

:confirm_FiringSolution

	setArray $okSearch $sectors

	setVar $hops 6
	getAllCourses $courses $targetFound
	setVar $a 1
	while ($a <= SECTORS)

		if ($courses[$a] < $hops) and ($courses[$a] > 1)
			#echo "*" $a ", Course:"
			setVar $b 1
			while ($b <= ($courses[$a] + 1))
				#echo "  " $courses[$a][$b] 
				if ($sectorHasFig[$courses[$a][$b]] = 1)
					add $b 99
				else
					setVar $okSearch[$courses[$a][$b]] 1
				end
				add $b 1
			end
		end
		add $a 1
	end

	setVar $hitCount 0
	setVar $a 1
	while ($a <= SECTORS)
		if ($okSearch[$a] = 1)
			#echo "clear" $a "*"
			add $hitCount 1
		end
		add $a 1
	end
	if ($hitCount > 9)
		setVar $targetGood 1
	end
return






:loadFigs
	
	setVar $b 11
	while ($b <= SECTORS)
		getSectorParameter $b "FIGSEC" $hasFig
		if ($hasFig <> "1")
			setVar $sectorHasFig[$b] 0
		else
			setVar $sectorHasFig[$b] 1
		end
		add $b 1
	end
return
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
