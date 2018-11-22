loadVar $bot_name
loadVar $user_command_line
loadVar $parm1
loadVar $parm2
loadVar $parm3

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
gosub :quikstats
setVar $location $CURRENT_PROMPT
:checkLocation
    if (($location = "Command") OR ($location = "Citadel") OR ($location = "Computer"))
        if ($location <> "Computer")
		send "C"
        	waitFor "Computer command [TL="
        	setVar $location "Computer"
	end
    else
	send "'{" $bot_name "} - ZTM must be started from Command, Computer, or Citadel prompt.*"
    end
    

# --- RESUME
:resume
    loadVar $resumepass
    loadVar $resumesector
    if ($resumepass = 7)
        send "'{" $bot_name "} - You have already ZTM'd this game!*"
	send "'{" $bot_name "} - Start with a fresh database if you need to ZTM again.*"
        halt
    elseif ($resumepass = 0)
	setVar $resumepass 1
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
    echo "*----*INIT*----*"
    gosub :loadTWX
    gosub :quikstats

:nextpass
    killalltriggers
    if (($resume <> "Y") and ($resume <> "y"))
        if ($pass <> 0)
            echo "*DONE WITH PASS " & $pass & "*"
            echo $plotsthispass & " plots this pass*"
            gosub :quikstats
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
        gosub :quikstats
	goto :nextpass
    end
    if ($visited[$start])
        goto :pass
    end
    if ($warpsout[$start] <> $warpsoutCompare)
        echo "skipping " & $start & " - it has " & $warpsout[$start] & " warps out - looking for " & $warpsoutCompare & "*"
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
        gosub :quikstats
    end
    gosub :voidadjacents
    gosub :sendCourse
    goto :pass



:finish    
    echo "**SCRIPT DONE**"
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
    killalltriggers
    send "f" & $start & "*" & $end & "**"
return

# SUB ----- :plotCourse
# requires parameters $start and $end
# returns parameters $coursePlot
:plotCourse
    killalltriggers
    add $plotsthispass 1
    setVar $i 0

    setTextLineTrigger getPath :getPath "The shortest path"
    setTextLineTrigger noWarp :noWarp "No route within"
    pause

    :getPath
        killalltriggers
        setTextTrigger mergeLines :mergeLines "Computer command [TL="
        setTextLineTrigger getLine0  :getLine ">"
        setTextLineTrigger getLine1  :getLine " 1"
        setTextLineTrigger getLine11 :getLine " (1"
        setTextLineTrigger getLine2  :getLine " 2"
        setTextLineTrigger getLine22 :getLine " (2"
        setTextLineTrigger getLine3  :getLine " 3"
        setTextLineTrigger getLine33 :getLine " (3"
        setTextLineTrigger getLine4  :getLine " 4"
        setTextLineTrigger getLine44 :getLine " (4"
        setTextLineTrigger getLine5  :getLine " 5"
        setTextLineTrigger getLine55 :getLine " (5"
        setTextLineTrigger getLine6  :getLine " 6"
        setTextLineTrigger getLine66 :getLine " (6"
        setTextLineTrigger getLine7  :getLine " 7"
        setTextLineTrigger getLine77 :getLine " (7"
        setTextLineTrigger getLine8  :getLine " 8"
        setTextLineTrigger getLine88 :getLine " (8"
        setTextLineTrigger getLine9  :getLine " 9"
        setTextLineTrigger getLine99 :getLine " (9"
        pause

    :getLine
        killalltriggers
        add $i 1
        setVar $line[$i] CURRENTLINE
        goto :getPath


    :noWarp
        killalltriggers
        setVar $coursePlot 0
        # send "Y"
        return

    :mergeLines
        killalltriggers
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
#   echo $courseplot "*"
#    pause
    getWord $courseplot $lastWarp $lstment
    isnumber $isnum $thisWarp
    if (($thisWarp <> 0) and ($isnum))
        if ($lastWarp <> 0)
#            echo "Last Warp " & $lastWarp & "   "
            gosub :buildWarpArray
            add $traffic[$thisWarp] 1
        end
#        echo "This Warp " & $thiswarp
#        echo "*"
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
#    echo $start & "." & $warpnumber & " = " & $warpsout[$start][$warpnumber] & "*"
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
            killalltriggers
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
            killalltriggers
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
        getSector $TWXsector $TWXsectorInfo
        setVar $TWXwarpnumber 0
        :TWXwarps
            add $TWXwarpnumber 1
            if ($TWXwarpnumber = 7)
                goto :grabTWXsectors
            end
            if ($TWXsectorInfo.warp[$TWXwarpnumber] <> 0)
                add $TWXWarps 1
                setVar $lastWarp $TWXSector
                setVar $thiswarp $TWXsectorInfo.warp[$TWXwarpnumber]
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


#=================================QUIKSTATS================================================
:quikstats
	setVar $CURRENT_PROMPT 		"Undefined"
	killtrigger noprompt
	killtrigger prompt
	killtrigger prompt1
	killtrigger prompt2
	killtrigger prompt3
	killtrigger prompt4
	killtrigger statlinetrig
	killtrigger getLine2
	setTextLineTrigger 	prompt		:allPrompts	 	#145 & #8
	setTextLineTrigger 	statlinetrig 	:statStart 		#179
	send #145&"/"
	pause

	:allPrompts
		getWord CURRENTLINE $CURRENT_PROMPT 1
		stripText $CURRENT_PROMPT #145
		stripText $CURRENT_PROMPT #8
		setTextLineTrigger 	prompt		:allPrompts	 	#145 & #8
		pause

	:statStart
		killtrigger prompt
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger noprompt
		setVar $stats ""
		setVar $wordy ""


	:statsline
		killtrigger statlinetrig
		killtrigger getLine2
		setVar $line2 CURRENTLINE
		replacetext $line2 #179 " "
		striptext $line2 ","
		setVar $stats $stats & $line2
		getWordPos $line2 $pos "Ship"
		if ($pos > 0)
			goto :gotStats
		else
			setTextLineTrigger getLine2 :statsline
			pause
		end

	:gotStats
		setVar $stats $stats & " @@@"

		setVar $current_word 0
		while ($wordy <> "@@@")
			if ($wordy = "Sect")
				getWord $stats $CURRENT_SECTOR   	($current_word + 1)
			elseif ($wordy = "Turns")
				getWord $stats $TURNS  			($current_word + 1)
			elseif ($wordy = "Creds")
				getWord $stats $CREDITS  		($current_word + 1)
			elseif ($wordy = "Figs")
				getWord $stats $FIGHTERS   		($current_word + 1)
			elseif ($wordy = "Shlds")
				getWord $stats $SHIELDS  		($current_word + 1)
			elseif ($wordy = "Hlds")
				getWord $stats $TOTAL_HOLDS   		($current_word + 1)
			elseif ($wordy = "Ore")
				getWord $stats $ORE_HOLDS    		($current_word + 1)
			elseif ($wordy = "Org")
				getWord $stats $ORGANIC_HOLDS    	($current_word + 1)
			elseif ($wordy = "Equ")
				getWord $stats $EQUIPMENT_HOLDS    	($current_word + 1)
			elseif ($wordy = "Col")
				getWord $stats $COLONIST_HOLDS    	($current_word + 1)
			elseif ($wordy = "Phot")
				getWord $stats $PHOTONS   		($current_word + 1)
			elseif ($wordy = "Armd")
				getWord $stats $ARMIDS   		($current_word + 1)
			elseif ($wordy = "Lmpt")
				getWord $stats $LIMPETS   		($current_word + 1)
			elseif ($wordy = "GTorp")
				getWord $stats $GENESIS  		($current_word + 1)
			elseif ($wordy = "TWarp")
				getWord $stats $TWARP_TYPE  		($current_word + 1)
			elseif ($wordy = "Clks")
				getWord $stats $CLOAKS   		($current_word + 1)
			elseif ($wordy = "Beacns")
				getWord $stats $BEACONS 		($current_word + 1)
			elseif ($wordy = "AtmDt")
				getWord $stats $ATOMIC  		($current_word + 1)
			elseif ($wordy = "Corbo")
				getWord $stats $CORBO   		($current_word + 1)
			elseif ($wordy = "EPrb")
				getWord $stats $EPROBES   		($current_word + 1)
			elseif ($wordy = "MDis")
				getWord $stats $MINE_DISRUPTORS   	($current_word + 1)
			elseif ($wordy = "PsPrb")
				getWord $stats $PSYCHIC_PROBE  		($current_word + 1)
			elseif ($wordy = "PlScn")
				getWord $stats $PLANET_SCANNER  	($current_word + 1)
			elseif ($wordy = "LRS")
				getWord $stats $SCAN_TYPE    		($current_word + 1)
			elseif ($wordy = "Aln")
				getWord $stats $ALIGNMENT    		($current_word + 1)
			elseif ($wordy = "Exp")
				getWord $stats $EXPERIENCE    		($current_word + 1)
			elseif ($wordy = "Corp")
				getWord $stats $CORP   			($current_word + 1)
			elseif ($wordy = "Ship")
				getWord $stats $SHIP_NUMBER   		($current_word + 1)
			end
			add $current_word 1
			getWord $stats $wordy $current_word
		end
	:doneQuikstats
		killtrigger prompt1
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger statlinetrig
		killtrigger getLine2

return
# ============================== END QUICKSTATS SUB==============================
