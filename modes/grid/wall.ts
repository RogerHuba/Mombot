Look at making mow holo more efficent
turn limit or reporting? 
loadVar $switchboard~bot_name
gosub :BOT~loadVars
clearAllAvoids
#HELP FILE
		setVar $BOT~help[1]  $BOT~tab&"   The Wall"
		setVar $BOT~help[2]  $BOT~tab&"  "
		setVar $BOT~help[3]  $BOT~tab&"   wall [Origin] [Distance] {holo}"
		setVar $BOT~help[4]  $BOT~tab&"         "
		setVar $BOT~help[5]  $BOT~tab&"   Plots courses to find all sectors Distance from Origin"
		setVar $BOT~help[6]  $BOT~tab&"         "
		setVar $BOT~help[7]  $BOT~tab&"   hole - Will holo all unexplored sectors."
		setVar $BOT~help[8]  $BOT~tab&"   "
		setVar $BOT~help[9]  $BOT~tab&"  designed for day 1 use with no ZTM."
	
	   gosub :bot~helpfile


gosub :PLAYER~quikstats
setVar $location $PLAYER~CURRENT_PROMPT

setVar $doholo 0
setVar $origin 0
setVar $distance 0

setVar $minFigs 100
setVar $restockTerra 0
setVar $endFigsOnly 0

    if ($bot~parm1 = 0)
        setVar $bot~parm1 ""
    end

    isNumber $test $bot~parm1
	if ($test)
        if ($bot~parm1 <= SECTORS)
		    setvar $switchboard~message "Using Origin Sector: " & $bot~parm1 & "*"
		    gosub :switchboard~switchboard
            setVar $origin $bot~parm1
        else
            setvar $switchboard~message "Origin should be from 1 to  " & SECTORS & "*"
		    gosub :switchboard~switchboard
            halt
        end
	else
		setvar $switchboard~message "Origin should be from 1 to  " & SECTORS & "*"
		gosub :switchboard~switchboard
		halt
	end

    if ($bot~parm2 = 0)
        setVar $bot~parm2 ""
    end

    isNumber $test $bot~parm2
	if ($test)
        if ($bot~parm2 <= 12) and ($bot~parm2 >= 2)
		    setvar $switchboard~message "Putting up fig wall " & $bot~parm2 & " warps from origin.*"
		    gosub :switchboard~switchboard
            setVar $distance $bot~parm2
        else
            setvar $switchboard~message "Distance should be 2 to 12 warps from origin.*"
		    gosub :switchboard~switchboard
            halt
        end
	else
		setvar $switchboard~message "Distance should be 2 to 12 warps from origin.*"
		gosub :switchboard~switchboard
		halt
	end
    
	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Please start from the command prompt"
        gosub :switchboard~switchboard
        halt
	end

    getWordPos $bot~user_command_line $pos "holo"
	if ($pos > 0)
		setVar $doholo 1
	end
	
    send "cv0*yyq"
    setArray $destSectors 10
    setArray $destSectorsOk 10
    setVar $i 1
    while ($i <= 10)
        setVar $destSectorsOk[$i] 1
        add $i 1
    end

    setVar $targetSectors 0
    setVar $targetSectorsi 0
    setVar $badCourse 0

    goSub :setDestSectors

    goSub :addExistingKnowledge

    while ($badCourse < 10)
        goSub :sendPlots
    end
    send "cv0*yyq"
    

    #void sectors near origin + 1 (if at origin, you have issue)
    #check num figs left (option to stock)
    #check location, don't mow to self
    #sort - create sort routine i.e. pass it two arrays source/results

echo "**Unsorted Sector List*"
    setVar $sectorListi $targetSectorsi
    setVar $sectorList 0
    setVar $i 1
    while ($i <= $targetSectorsi)
echo $targetSectors[$i] "*"
        setVar $sectorList[$i] $targetSectors[$i]
        add $i 1
    end

    goSub :sortSectors
    setVar $SWITCHBOARD~message "Courses plotted, " & $targetSectorsi & " targets, covering approximately " & $temp_TotalDist & " moves*"
    gosub :switchboard~switchboard
setVar $i 1
    while ($i <= $sectorListi)
        echo  $sectorCourse[$i] "*"
        add $i 1
    end

    setVar $doneVoids 0
    goSub :checkDoVoids

    setVar $i 1
    while ($i <= $sectorListi)
        setVar $target $sectorCourse[$i]
echo $target "*"
        
        getSectorParameter $target "FIGSEC" $hasFig
        if ($hasFig = 0) and ($player~CURRENT_SECTOR <> $target)
            
            gosub :PLAYER~quikstats
            if ($player~FIGHTERS < $minFigs)
                setVar $SWITCHBOARD~message "Fighters are low, stopping...*"
                gosub :switchboard~switchboard
                halt
            end
            setVar $BOT~command "mow"
            if ($endFigsOnly = 0)
                setVar $BOT~user_command_line " mow "& $target & " 1 "
            else
                setVar $BOT~user_command_line " mow "& $target & " 0 "
            end
            setVar $BOT~parm1 $target
            
            if ($endFigsOnly = 0)
                setVar $BOT~parm2 1
            else
                setVar $BOT~parm2 0
            end
            if ($doholo)
                setVar $BOT~user_command_line  $BOT~user_command_line & " holo "
                setVar $BOT~parm3 "holo"
            else
                setVar $BOT~parm3 ""
            end

            saveVar $BOT~parm1
            saveVar $BOT~parm2
            saveVar $BOT~parm3
            saveVar $BOT~command
            saveVar $BOT~user_command_line
            load "scripts\mombot\modes\grid\mow.cts"
            setEventTrigger		mowended		:mowended "SCRIPT STOPPED" "scripts\mombot\modes\grid\mow.cts"
            pause
            :mowended
                if ($doholo)
                    setVar $holook 0
                    setVar $y 1
                    while ($y <= SECTOR.WARPCOUNT[$target])
                        if (SECTOR.EXPLORED[SECTOR.WARPS[$target][$y]] <> "YES")
                            setVar $holook 1
                        end
                        add $y 1
                    end
                    if ($holook = 1)
                        send "sh*"
                        waitfor "Long Range Scan"
                        waitfor "Command ["
                    end
                end
                send "f1*cd"
                setSectorParameter  $target "FIGSEC" TRUE
                goSub :checkDoVoids
        end
        add $i 1
    end
    send "cv0*yyq"

    setVar $SWITCHBOARD~message "Unvoiding sectors and finishing up.. Done!*"
    gosub :switchboard~switchboard
    halt
    halt

    :sendPlots
        setVar $desti 1
        send "c"
        waitfor "<Computer activated>"
        while ($desti <= 10)
            if ($destSectorsOk[$desti] = 1)
                echo $destSectors[$desti] "*"
                send "f" $origin "*" $destSectors[$desti] "*"
                goSub :checkcourse
            end
            add $desti 1
        end 
        send "q"
    return

    
    halt
    
    :checkcourse
        killalltriggers
        setVar $course ""
        setTextLineTrigger checkPath :checkPath "The shortest path" 
        setTextLineTrigger noCheckPath :noCheckPath "Error - No route within"
        pause
        :noCheckPath
            killalltriggers
            send "n"
            setVar $destSectorsOk[$desti] 0
            add $badCourse 1
            return

        :checkPath
            killalltriggers
            getWord CURRENTLINE $courselen 4
            STRIPTEXT $courselen "("
            if ($courselen <= $distance)
echo "# DIDNT THINK PLOT COULT GET SMALLER?*"
echo "# DIDNT THINK PLOT COULT GET SMALLER?*"
echo "# DIDNT THINK PLOT COULT GET SMALLER?*"
echo "# DIDNT THINK PLOT COULT GET SMALLER?*"
#if this occurs, void it and move on
halt
            end
            :keepadding2
            setTextLineTrigger addCourse2 :addCourse2 ">"
            setTextTrigger endCourse2 :endCourse2 "Computer command [" 
            pause
            :addCourse2
                killalltriggers
                setVar $course $course & " " & CURRENTLINE
                goto :keepadding2
            :endCourse2
                killalltriggers
                #5749 > (2496) > (7072) > (322) > (799) > (6950) > (5933) > 7113 > 609 > 1 
                setVar $prevwarp ""
                setVar $y 1
                setVar $countC 0
                setVar $go 1
                 echo "$Course: " $course  "*"    
                while ($go = 1)
               
                    getWord $course $warp $y
                    if ($warp <> ">")
                        add $countC 1
                        if ($countC = ($distance + 1))
                            stripText $warp "("
                            stripText $warp ")"
                            
                            add $targetSectorsi 1
                            setVar $targetSectors[$targetSectorsi] $warp
                            send "v" $warp "*"
    echo "Found $warp: " $warp " To list*"
                        end
                        
                    end
                    add $y 1
                    if ($y > 50)
                        setVar $go 0
                    end
                end
        killalltriggers
    return
    :addExistingKnowledge

        getAllCourses $allCourses $origin
        send "c"
        setVar $i 1
        while ($i <= SECTORS)
            if ($allCourses[$i] = $distance)
                echo $i "*"
                send "v" $i "*"
                add $targetSectorsi 1
                setVar $targetSectors[$targetSectorsi] $i
            end
            add $i 1
        end
        send "q"
        waitfor "<Computer deactivated>"
    return
    :setDestSectors
        setVar $successSectors 0
        setVar $successAttemp 11
        send "c"
        while ($successSectors < 10)

            if ($successAttemp = $origin)
                add $successAttemp 1
            end
            send "f" $origin "*" $successAttemp "*"
            
            setVar $course ""
            setTextLineTrigger destPath :destPath "The shortest path" 
            setTextLineTrigger noPath :noPath "Error - No route within"
            pause
            :noPath
                killalltriggers
                send "y"
                goto :tryDestSectAgain
            :destPath
                killalltriggers
                getWord CURRENTLINE $courselen 4
                STRIPTEXT $courselen "("
                if ($courselen <= $distance)
                    goto :tryDestSectAgain
                end
                :keepadding
                setTextLineTrigger addCourse :addCourse ">"
                setTextTrigger endCourse :endCourse "Computer command [" 
                pause
                :addCourse
                    killalltriggers
                    setVar $course $course & " " & CURRENTLINE
                    goto :keepadding
                :endCourse
                    killalltriggers
                    #5749 > (2496) > (7072) > (322) > (799) > (6950) > (5933) > 7113 > 609 > 1 
                    setVar $prevwarp ""
                    setVar $y 1
                    setVar $countC 0
                    setVar $go 1
                    while ($go = 1)
                        
                        getWord $course $warp $y
                        if ($warp <> ">")
                            add $countC 1
                            if ($countC = ($distance + 2))
                                stripText $warp "("
                                stripText $warp ")"
                                
                                add $successSectors 1
                                setVar $destSectors[$successSectors] $warp
                                
echo "Added $warp: " $warp " To list*"
                            end
                            
                        end
                        add $y 1
                        if ($y > 50)
                            setVar $go 0
                        end
                    end

            :tryDestSectAgain
                add $successAttemp 1
        end
        send "q"
    return


:checkDoVoids
    # just void the origin and adjacent sectors 

    if ($doneVoids = 1)
        Return
    end

    gosub :PLAYER~quikstats
    if ($player~CURRENT_SECTOR = $origin)
        return
    end

    setVar $i 1
    while ($i <= SECTOR.WARPCOUNT[$origin])
        if ($player~CURRENT_SECTOR = SECTOR.WARPS[$origin][$i])
            return
        end
        add $i 1
    end
    
    
    send "cv" $origin "*"
    setVar $i 1
    while ($i <= SECTOR.WARPCOUNT[$origin])
        send "v" SECTOR.WARPS[$origin][$i] "*"
        add $i 1
    end
    send "q"
    waitfor "<Computer deactivated>"
    setVar $doneVoids 1
return

############ SORTING MOVE TO INCLUDE ONE DAY

# Takes $sectorList - Array of sectors
# Takes $sectorListi - Length of that array
# Returns $sectorCourse
#  Future: add a param option, which would find sectors with param, then call this function



:sortSectors

    setVar $searchsectors 0
    setVar $sectorsLeft 0
    setVar $totalSectors $sectorListi
    setVar $sectorCourse 0
    setVar $nextDistance 0
    setVar $nextIndex 2
    setVar $sectorCourse[1] $sectorList[1]
    setVar $nextDistance[1] $sectorList[1]

    setVar $temp_TotalDist 0

    setVar $i 1
    while ($i <= $sectorListi)
        setVar $searchsectors[$i] $sectorList[$i]
		setVar $sectorsLeft[$i] $sectorList[$i]  
        add $i 1
    end

    setVar $x 1
    setVar $sectorsLeft[1] "-1"
    setVar $fromSector $searchsectors[1]

    setVar $badDist 0
    setVar $badDistLog ""

    while ($x < $totalSectors)

        setVar $y 1
        setVar $closestSector 99999
        setVar $closestDistance 99
        setVar $badDist 0
        while ($y <= $totalSectors)
            setVar $toSector $sectorsLeft[$y]
            if ($toSector <> "-1")
#echo " from:"  $fromSector " to: " $toSector "*"
                getDistance $dist $fromSector $toSector
                if ($dist = "-1")
                    
                    setVar $dist 25
                    setVar $badDist 1
                    
                end
                if ($dist <> "-1")
                    if ($dist < $closestDistance)
                        setVar $closestSector $toSector
                        setVar $closestDistance $dist
                    end
                end
            end
            add $y 1
        end
        if ($badDist = 1)
            setVar $badDistLog $badDistLog & " " & $fromSector 
 
        end

        setVar $sectorCourse[$nextIndex] $closestSector
        setVar $nextDistance[$nextIndex] $closestDistance
        add $temp_TotalDist $closestDistance

        setVar $y 1
        while ($y < $totalSectors)
            if ($sectorsLeft[$y] = $closestSector)
                setVar $sectorsLeft[$y] "-1"
            end
            add $y 1
        end
        
        if ($closestSector < 30001)
            setVar $fromSector $closestSector
        end

        Gosub :sleep
        add $nextIndex 1
        add $x 1
    end
    if ($badDisLog <> "")
        setVar $SWITCHBOARD~message $badDistLog & "*"
        gosub :switchboard~switchboard
    end
return

:sleep
	# This subroutine prevents twx from locking up, and allows you to
	# use the $SX twx command to halt if necessary.
	setdelaytrigger wake :wake 10
	pause
	:wake
	killalltriggers
	return

##########
	#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"


