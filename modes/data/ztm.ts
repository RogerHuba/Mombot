loadVar $bot_name
gosub :BOT~loadVars


#HELP FILE
        setVar $BOT~help[1]  $BOT~tab&"ZTM - Zero Turn Mapping"
        setVar $BOT~help[2]  $BOT~tab&"  "
        setVar $BOT~help[3]  $BOT~tab&"ztm {reset} {reset one} "
        setVar $BOT~help[4]  $BOT~tab&"         "
        setVar $BOT~help[5]  $BOT~tab&"Options: "
        setVar $BOT~help[6]  $BOT~tab&"   - [reset] = Script will start from first cycle keeping old data"
        setVar $BOT~help[7]  $BOT~tab&"   - [reset one] = Used to plot course to one, for large universes"
        setVar $BOT~help[8]  $BOT~tab&"                   or small course lengths."
        setVar $BOT~help[9]  $BOT~tab&"Begins Mapping using the same 6-Pass. "
        setVar $BOT~help[10]  $BOT~tab&"         "
        setVar $BOT~help[11]  $BOT~tab&"Originally written by Cherokee         "
        gosub :BOT~help_file



# ----- SCRIPT NAME AND VERSION -----
setVar $scriptname "Cherokee's ZTM"
setVar $version "1.5.0"

#----- INCLUDES -----
reqRecording


# CREDITS
# -------
# Written by Cherokee
# Method invented by The Reverend


# REVISION HISTORY
# ----------------
# 1.0.0 Initial version, Plots a map with no turn usage.
# 1.1.0 Passes user selectable from 2-6, and added one way pass and traffic report
# 1.2.0 Bursts data, resume mode
# 1.3.0 option not to use twx data, polishing
# 1.4.0 Bug Fixes
# 1.5.0 Bug Fixes


# --- CHECK LOCATION ---
gosub :PLAYER~quikstats
setVar $location $PLAYER~CURRENT_PROMPT
:checkLocation
    if (($location = "Command") OR ($location = "Citadel") OR ($location = "Computer"))
        if ($location <> "Computer")
        send "C"
            waitFor "Computer command [TL="
            setVar $location "Computer"
    end
    else
    setvar $switchboard~message "ZTM must be started from Command, Computer, or Citadel prompt.*"
	gosub :switchboard~switchboard

    end
    

# --- RESUME
:resume
    loadVar $resumepass
    loadVar $resumesector
    if ($bot~parm1 = "reset")
	setVar $resumepass 0
    end

    if ($bot~parm2 = "reset")
	setVar $resumepass 0
    end

    if ($bot~parm1 = "one")
	setVar $endone 1
    end

    if ($bot~parm2 = "one")
	setVar $endone 1
    end

    if ($resumepass = 7)
		setvar $switchboard~message "You have already ZTM'd this game!*"
		gosub :switchboard~switchboard
		setvar $switchboard~message "Start with a fresh database if you need to ZTM again.*"
		gosub :switchboard~switchboard
		halt
    elseif ($resumepass = 0)
		setVar $resumepass 1
		setVar $pass 0
    else
		setVar $pass $resumepass
    end
    
# --- INIT VARIABLES ---
:initVars
    setVar $passes 6
    setVar $passescompare $resumepass
    if ($passescompare = "Oneways")
        setVar $passescompare "6"
    end
    setVar $pass $resumepass
    # initend should be = SECTORS
    setVar $initend SECTORS
    setVar $end $initend
    add $end 1
    setArray $warpsout SECTORS
    setArray $traffic SECTORS
    setVar $voidsSet 1
    #setVar $filename "_ck_" & GAMENAME & ".ztmstats"


# --- INIT PROGRAM ---
:init
    send "V0*YY"
    waitFor "Computer command [TL="
    gosub :getTime
    #echo "*----*INIT*----*"
    gosub :loadTWX
    gosub :PLAYER~quikstats

:nextpass
    
    if (($resume <> "Y") and ($resume <> "y"))
        if ($pass <> 0)
            echo "*DONE WITH PASS " & $pass & "*"
            echo $plotsthispass & " plots this pass*"
            gosub :PLAYER~quikstats
            gosub :getTime
            setVar $plotsthispass 0
            setDelayTrigger dothenextpass :dothenextpass 300
            pause
            :dothenextpass
        end
        if ($pass = 6)
            setVar $checksector 1
            :enterOneways
            setVar $pass "Oneways"
            setVar $resumepass $pass
            saveVar $resumepass
            gosub :clearvoids
            gosub :checkoneways
            goto :nextpass
        end
        if ($pass = "Oneways")
            setVar $pass 6
        end
        add $pass 1
        setVar $resumepass $pass
        saveVar $resumepass
        setVar $start 0
        if ($pass > $passes)
            goto :finish
        end
        setVar $warpsoutCompare $pass
        subtract $warpsoutCompare 1
    else
        setVar $resume "N"
        if ($resumepass = "Oneways")
            setVar $checksector $resumesector
            goto :enterOneways
        else
            setVar $warpsoutCompare $pass
            subtract $warpsoutCompare 1
            setVar $start $resumesector
        end
    end

# --- Pass Loop ---
:pass
    setVar $resumesector $start
    saveVar $resumesector
    add $start 1
    if ($start > $initend)
        setVar $catchup 0
        :catchup
            if ($catchup < $burstcontrol)
                add $catchup 1
                gosub :plotCourse
                gosub :parseCourse
                goto :catchup
            end
        setVar $burstcontrol 0
        gosub :PLAYER~quikstats
    goto :nextpass
    end
    if ($visited[$start])
        goto :pass
    end
    if ($warpsout[$start] <> $warpsoutCompare)
        #echo "skipping " & $start & " - it has " & $warpsout[$start] & " warps out - looking for " & $warpsoutCompare & "*"
        goto :pass
    end
    subtract $end 1
    :whatsthepoint
    if ($start = $end)
        subtract $end 1
    end
    if ($end <= 0)
        setVar $end $initend
        goto :whatsthepoint
    end
    add $burstcontrol 1
#    echo "*burst control is " & $burstcontrol
    if ($burstcontrol > 10)
        gosub :plotCourse
        gosub :parseCourse
        gosub :plotCourse
        gosub :parseCourse
        gosub :plotCourse
        gosub :parseCourse
        gosub :plotCourse
        gosub :parseCourse
        gosub :plotCourse
        gosub :parseCourse
        gosub :plotCourse
        gosub :parseCourse
        gosub :plotCourse
        gosub :parseCourse
        gosub :plotCourse
        gosub :parseCourse
        gosub :plotCourse
        gosub :parseCourse
        gosub :plotCourse
        gosub :parseCourse
        setVar $burstcontrol 1
        gosub :PLAYER~quikstats
    end
    gosub :voidadjacents
    gosub :sendCourse
    goto :pass



:finish    
    echo "**SCRIPT DONE**"
    send "q"
    halt


:checkoneways
    setVar $resumesector $checksector
    saveVar $resumesector
    add $checksector 1
    if ($checksector > $initend)
        return
    end

    setVar $cur_oneway 0
    setVar $cur_oneway_limit 51
    setArray $testoneway $cur_oneway_limit
    :listoneways
        add $cur_oneway 1
        if (($cur_oneway < $cur_oneway_limit) and (SECTOR.BACKDOORS[$checksector][$cur_oneway] <> 0))
            setVar $testoneway[$cur_oneway] SECTOR.BACKDOORS[$checksector][$cur_oneway]
            goto :listoneways
        end

    setVar $cur_oneway 0
    :testoneways
        add $cur_oneway 1
        if ($testoneway[$cur_oneway] <> 0)
            # plot $checksector to the current backdoor
            setVar $start $checksector
            setVar $end $testoneway[$cur_oneway]
            gosub :sendCourse
            gosub :plotcourse
            gosub :parseCourse
            goto :testoneways
        end
        goto :checkoneways


# SUB ----- :sendCourse
# requires parameters $start and $end
:sendCourse

    
	if ($endone = 1)
		send "f" & $start & "*1**"
	else
		send "f" & $start & "*" & $end & "**"
	end
return

# SUB ----- :plotCourse
# requires parameters $start and $end
# returns parameters $coursePlot
:plotCourse
    killtrigger getpath
    killtrigger nowarp
    killtrigger nowarp2
    add $plotsthispass 1
    setVar $i 0

    setTextLineTrigger getPath :getPath "The shortest path"
    setTextLineTrigger noWarp :noWarp "No route within"
    settextlinetrigger nowarp2 :nowarp "So what's the point?"
    pause

    :getPath
        killtrigger getpath
        killtrigger nowarp
        killtrigger nowarp2
        setTextTrigger 1 :mergeLines "Computer command [TL="
        setTextLineTrigger 2  :getLine ">"
        setTextLineTrigger 3  :getLine " 1"
        setTextLineTrigger 4 :getLine " (1"
        setTextLineTrigger 5  :getLine " 2"
        setTextLineTrigger 6 :getLine " (2"
        setTextLineTrigger 7  :getLine " 3"
        setTextLineTrigger 8 :getLine " (3"
        setTextLineTrigger 9  :getLine " 4"
        setTextLineTrigger 10 :getLine " (4"
        setTextLineTrigger 11 :getLine " 5"
        setTextLineTrigger 12 :getLine " (5"
        setTextLineTrigger 13  :getLine " 6"
        setTextLineTrigger 14 :getLine " (6"
        setTextLineTrigger 15  :getLine " 7"
        setTextLineTrigger 16 :getLine " (7"
        setTextLineTrigger 17  :getLine " 8"
        setTextLineTrigger 18 :getLine " (8"
        setTextLineTrigger 19  :getLine " 9"
        setTextLineTrigger 20 :getLine " (9"
        pause

    :getLine
        setvar $z 1
        while ($z <= 20)
        	killtrigger $z
        	add $z 1
        end
        add $i 1
        setVar $line[$i] CURRENTLINE
        goto :getPath


    :noWarp
        killtrigger getpath
        setVar $coursePlot 0
        # send "Y"
        return

    :mergeLines
        setvar $z 1
        while ($z <= 20)
        	killtrigger $z
        	add $z 1
        end
        setVar $j 0
        setVar $coursePlot ""
        :merge
        if ($j < $i)
            add $j 1
            setVar $coursePlot $line[$j]
#            setVar $coursePlot $coursePlot & $line[$j]
            goto :merge
        end
        stripText $coursePlot "("
        stripText $coursePlot ")"
        return


# SUB ----- :parseCourse
:parseCourse
    setVar $cment "-1"
:getElements
    setVar $lstment $courseElement
    add $cment 2
    setVar $realLast $lastWarp
    getWord $courseplot $thisWarp $cment
   #echo $courseplot "*"
#    pause
    getWord $courseplot $lastWarp $lstment
    isnumber $isnum $thisWarp
    if (($thisWarp <> 0) and ($isnum))
        if ($lastWarp <> 0)
            #echo "Last Warp " & $lastWarp & "   "
            gosub :buildWarpArray
            add $traffic[$thisWarp] 1
        end
        #echo "This Warp " & $thiswarp
        #echo "*"
        goto :getElements
    else
        setVar $lastWarp $realLast
        setVar $thisWarp $end
    end
    return


# SUB ----- :voidsingle
:voidsingle
    send "V" & $voidsector & "*"
    setVar $voidsSet 1
    return


# SUB ----- :voidadjacents
:voidadjacents
    gosub :clearvoids
    setVar $warpnumber 0
    :voidWarps
    add $warpnumber 1
    #echo $start & "." & $warpnumber & " = " & $warpsout[$start][$warpnumber] & "*"
    if ($warpnumber = 7)
        # break out, sectors can't have more than 6 warps out
        goto :voidwarpsdone
    elseif ($warpsout[$start][$warpnumber] <> 0)
        # void this warp
        send "V" & $warpsout[$start][$warpnumber] & "*"
        setVar $voidsSet 1
        goto :voidWarps
    end
    :voidWarpsDone
    return


# SUB ----- :clearvoids
:clearvoids
    send "V0*YY"
    setVar $voidsSet 0
    return


# SUB ----- :buildWarpArray
:buildWarpArray
    setVar $warpnumber 0
:testWarps
    add $warpnumber 1
    if ($warpnumber = 7)
        # break out, sectors can't have more than 6 warps out
        goto :testWarpsDone
    elseif ($warpsout[$lastWarp][$warpnumber] = $thisWarp)
        # break out, we already stored this warp
        goto :testWarpsDone
    elseif ($warpsout[$lastWarp][$warpnumber] = 0)
        setVar $warpsout[$lastWarp][$warpnumber] $thisWarp
        setVar $warpsout[$lastWarp] $warpnumber
        goto :testWarpsDone
    else
        # continue, we are finding other warps in the array
        goto :testWarps
    end
    :testWarpsDone
    return


# SUB ----- :getCIM
:getCIM
    setVar $recording "ON"
    if ($recording = "ON")
        send "^"
        waitfor ": "
        send "I"
        waitfor " "
        waitfor ": "
        send "Q"
        return
    else
        setArray $visited SECTORS
        send "^I"
        waitFor ": "
        :grabCIMsectors
            setTextLineTrigger CIMspace :CIMspace " "
            setTextTrigger CIMdone :CIMdone ": "
            pause
        :CIMspace
            killtrigger CIMdone
            getWord CURRENTLINE $CIMsector 1
            setVar $visited[$CIMsector] 1
            setVar $CIMwarpnumber 0
            :CIMwarps
                add $CIMwarpnumber 1
                if ($CIMwarpnumber = 7)
                    goto :grabCIMsectors
                end
                setVar $CIMwordnumber $CIMwarpnumber
                add $CIMwordnumber 1
                getWord CURRENTLINE $CIMwarp $CIMwordnumber
                if ($CIMwordnumber <> 0)
                    setVar $lastWarp $CIMsector
                    setVar $thiswarp $CIMwarp
                    gosub :buildWarpArray
                end
                goto :CIMwarps
        :CIMdone
            killtrigger CIMspace
            send "Q"
            return
    end

# SUB ----- :loadTWX
:loadTWX
    echo "*Loading warp data from the TWX database, one moment...*"
    setVar $TWXsector 0
    setVar $TWXWarps 0
    :grabTWXsectors
        add $TWXsector 1
        if ($TWXsector > SECTORS)
            goto :TWXdone
        end
        #getSector $TWXsector $TWXsectorInfo
        setVar $TWXwarpnumber 0
        :TWXwarps
            add $TWXwarpnumber 1
            if ($TWXwarpnumber = 7)
                goto :grabTWXsectors
            end
            if (SECTOR.WARPS[$TWXsector][$TWXwarpnumber] <> 0)
                add $TWXWarps 1
                setVar $lastWarp $TWXSector
                setVar $thiswarp SECTOR.WARPS[$TWXsector][$TWXwarpnumber]
                gosub :buildWarpArray
            end
            goto :TWXwarps
    :TWXdone
        echo "*Loaded " & $TWXwarps & " warps from the TWX database.*"
        return


# SUB ----- :getTime
:getTime
    send "T"
    SetTextLineTrigger thetime :thetime ","
    pause
:thetime
    setVar $thetime CURRENTLINE
    return

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
