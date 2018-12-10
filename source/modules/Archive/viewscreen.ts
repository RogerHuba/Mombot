systemscript
    gosub :BOT~loadVars

    setVar $BOT~help[1] $BOT~tab&"Information screen for self use only.  "
    gosub :BOT~help_file

    setVar $BOT~script_title "Viewscreen"
    gosub :BOT~banner

    setvar $version "2.0.1 12/09/05"
:setup
gosub :getTime
loadvar $MH_LoginName
if ($MH_LoginName = 0) OR ($MH_LoginName = "")
    if (LOGINNAME = "")
        setvar $MH_LoginName "ME"
    else
        setvar $MH_LoginName LOGINNAME
        savevar $MH_LoginName
    end
end
setvar $startDate $year & $month & $day
setvar $logFileName "data\" & GAMENAME & "-comlog-" & $year & $month & $day & ".txt"
setvar $count 1
setvar $comstring ""
setVar $comsize 200
setVar $comm_window_size 29
setVar $comm_window_start_index 1
setArray $coms $comsize
setArray $stats 38

setVar $i $comsize
while ($i > 0)
    setvar $coms[$i][1] 1
    subtract $i 1
end
# ======================     START PREFERENCES MENU SUBROUTINE    ==========================
:chatMenu
setVar $BOT~botIsDeaf FALSE
saveVar $BOT~botIsDeaf
gosub :buildComString
:start
if ($BOT~botIsDeaf)
    gosub :refreshChatMenu
end
setvar $comtype ""
killtrigger lookForP
killtrigger lookForR
killtrigger lookForF
killtrigger lookForF2
killtrigger lookForR2
killtrigger lookForSelfR
killtrigger lookForSelfF
killtrigger talk
killtrigger delay
killtrigger lookForSelfMul
settextlinetrigger lookForP :lookForCom "P "
settextlinetrigger lookForR :lookForCom "R "
settextlinetrigger lookForF :lookForCom "F "
settextlinetrigger lookForSelfR :lookForCom "'"
settextlinetrigger lookForSelfF :lookForCom "`"
settextlinetrigger lookForSelfMul :lookForCom "S: "
loadVar $BOT~botIsDeaf
if ($BOT~botIsDeaf)
    setDelayTrigger delay :refresh 2000 
end
setTextOutTrigger talk :process_command "" 
pause
    :process_command
        killtrigger delay
        getOutText $chosen_option
        upperCase $chosen_option
        if ($chosen_option = "'")
            getInput $message ANSI_13&"Subspace message:"&ANSI_7
            if ($message <> "")
                send "'"&$message&"*"
                #setVar $line "R ME     "&$message
                #gosub :addCom2Window
                goto :start
            end
        elseif ($chosen_option = "`")
            getInput $message ANSI_13&"Fed message:"&ANSI_7            
            if ($message <> "")
                send "`"&$message&"*"
                #setVar $line "F ME     "&$message
                #gosub :addCom2Window
                goto :start
            end
        elseif (($chosen_option = "U") AND (($BOT~botIsDeaf)))
            if ($comm_window_start_index < ($comsize-$comm_window_size))
                add $comm_window_start_index 1
                #echo "["&$comm_window_start_index&"]*"
                if ($comm_window_start_index > ($comsize-$comm_window_size))
                    setVar $comm_window_start_index ($comsize-$comm_window_size)
                end
            end
        elseif (($chosen_option = "D") AND (($BOT~botIsDeaf)))
            if ($comm_window_start_index > 1)
                subtract $comm_window_start_index 1
                if ($comm_window_start_index < 1)
                    setVar $comm_window_start_index 1
                end
            end
        elseif ($chosen_option = "_")
            openMenu TWX_TOGGLEDEAF false
            closeMenu
            loadVar $BOT~botIsDeaf
            if ($BOT~botIsDeaf)
                setVar $BOT~botIsDeaf FALSE
            else
                setVar $BOT~botIsDeaf TRUE
                setVar $comm_window_start_index 1
                gosub :refreshChatMenu
            end           
            saveVar $BOT~botIsDeaf  
        else
            if ($BOT~botIsDeaf = FALSE)
                processOut $chosen_option
            end
            setTextOutTrigger talk :process_command "" 
            pause
        end

        goto :start
:doneChat
    openMenu TWX_TOGGLEDEAF false
    closeMenu
        echo #27 "[30D                        " #27 "[30D"
        echo CURRENTANSILINE
        setVar $botIsDeaf FALSE
        saveVar $botIsDeaf
        halt
return

:refresh
    loadVar $BOT~botIsDeaf
    if ($BOT~botIsDeaf)
        gosub :refreshChatMenu
        setDelayTrigger delay :refresh 5000 
    end
    pause







:lookForCom
killtrigger lookForP
killtrigger lookForR
killtrigger lookForF
killtrigger lookForF2
killtrigger lookForR2
killtrigger delay
setvar $line CURRENTLINE
cuttext $line $checkCom 1 2
cutText $line $firstChar 1 1
getword $checkCom $checkCom 1
if ($firstChar = "'") OR ($firstChar = "`") OR ($checkCom = "P") OR ($checkCom = "R") OR ($checkCom = "F") OR ($checkCom = "S:")
    if ($checkCom = "P")
        getword $line $checkCorpScan 2
        if ($checkCorpScan = "indicates")
            goto :start
        end
    end
    getlength $line $length
    if ($length > 4)
        if ($firstChar = "'")
            cuttext $line $line 2 9999
            setVar $line "R ME     "&$line
        end
        if ($firstChar = "`")
            cuttext $line $line 2 9999
            setVar $line "F ME     "&$line
        end
        if ($checkCom = "S:")
            cuttext $line $line 4 9999
            setVar $line "R ME     "&$line
        end
        gosub :addCom2Window
    end
    goto :start
else
    goto :start
end

:addCom2Window
gosub :getTime
if ($startDate <> $year & $month & $day)
    setvar $startDate $year & $month & $day
    setvar $logFileName "data\" & GAMENAME & "-comlog-" & $year & $month & $day & ".txt"
end
write $logFileName $hour & ":" & $minute & ":" & $second & ":" & $msec & "  " &$line
getlength $line $length
setvar $numline 1
setvar $line " " & $line
if ($length > 86)
    cuttext $line $line1 1 86
    cuttext $line $line2 87 200
    setvar $line $line1&"* "&$line2
    setvar $numline 2

    setVar $line $line1
    getlength $line $length
    gosub :formatLine
    if ($line2 <> "")
        setVar $line "+         "&$line2
        getlength $line $length
        gosub :formatLine
    end
else
    gosub :formatLine
end
return

:formatLine
    if ($length > 11)
        cuttext $line $commChar 1 2
        cuttext $line $theName 3 8
        cuttext $line $theRest 10 9999
        setVar $line ANSI_3&$commChar&ANSI_11&$theName&ANSI_14&$theRest
        gosub :buildComString
    end
return

:buildComString
setvar $comstring ""
setvar $windowString ""
setVar $i $comsize
while ($i > 0)
    if ($i = 1)
        setvar $coms[1] $line
        setvar $coms[1][1] $numline
    else
        setvar $coms[$i] $coms[($i-1)]
        setvar $coms[$i][1] $coms[($i-1)][1]
    end
    subtract $i 1
end

setvar $count 2
while (($numline < ($comsize-1)) AND ($count < $comsize))
    setvar $numline ($numline + $coms[$count][1])
    add $count 1
end
while ($count >=1)
    if ($coms[$count] = 0)
        setvar $coms[$count] ""
    end
    setvar $comstring $comstring & $coms[$count] & "*"
    subtract $count 1
end
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


:getStats
    gosub :loadVars
    
    if ($PLAYER~CURRENT_SECTOR = 0)
        setVar $stats[1] "    Sector : "&CURRENTSECTOR&"*"
    else
        setVar $stats[1] "    Sector : "&$PLAYER~CURRENT_SECTOR&"*"
    end
    if ($PLANET~PLANET <> 0)
        setVar $stats[2] "    Planet : "&$PLANET~PLANET&"*"
    else
        setVar $stats[2] "    Planet : None*"
    end
    if ($PLAYER~unlimitedGame)
        setVar $stats[3] "     Turns : Unlimited*"
    else
        setVar $stats[3] "     Turns : "&$PLAYER~TURNS&"*"
    end 
    setVar $stats[4]  "       Exp : "&$PLAYER~EXPERIENCE&"*"
    setVar $stats[5]  "     Align : "&$PLAYER~ALIGNMENT&"*"
    setVar $stats[6]  "   Credits : "&$PLAYER~CREDITS&"*"
    setVar $stats[7]  ANSI_7&"----------------------------------*"
    setVar $stats[8]  "Holds Info : "&$PLAYER~TOTAL_HOLDS&"*"
    setVar $stats[9]  ANSI_7&"----------------------------------*"
    setVar $stats[10] "  Fuel Ore : "&$PLAYER~ORE_HOLDS&"*"
    setVar $stats[11] "  Organics : "&$PLAYER~ORGANIC_HOLDS&"*"
    setVar $stats[12] " Equipment : "&$PLAYER~EQUIPMENT_HOLDS&"*"
    setVar $stats[13] " Colonists : "&$PLAYER~COLONIST_HOLDS&"*"
    setVar $empty_holds ($total_holds - $ore_holds)
    setVar $empty_holds ($empty_holds - $organic_holds)
    setVar $empty_holds ($empty_holds - $equipment_holds)
    setVar $empty_holds ($empty_holds - $colonist_holds)
    
    setVar $stats[14] "     Empty : "&$PLAYER~EMPTY_HOLDS&"*"
    setVar $stats[15] ANSI_7&"----------------------------------*"
    setVar $stats[16] "    Ship # : "&$PLAYER~SHIP_NUMBER&"*"
    setVar $stats[17] ANSI_7&"----------------------------------*"
    setVar $stats[18] "  Fighters : "&$PLAYER~FIGHTERS&"*"
    setVar $stats[19] "   Shields : "&$PLAYER~SHIELDS&"*"
    setVar $stats[20] "  Max Figs : "&$SHIP~SHIP_FIGHTERS_MAX&"*"
    setVar $stats[21] "  Max Wave : "&$SHIP~SHIP_MAX_ATTACK&"*"
    setVar $stats[22] "Turns/Warp : "&$PLAYER~TURNS_PER_WARP&"*"
    setVar $stats[23] ANSI_7&"----------------------------------*"
  
    cutText $PLAYER~ARMIDS&"    " $ARMIDS 0 3
    cutText $PLAYER~CLOAKS&"    " $CLOAKS 0 3
    cutText $PLAYER~GENESIS&"    " $GENESIS 0 3
    cutText $PLAYER~MINE_DISRUPTORS&"    " $MINE_DISRUPTORS 0 3
    cutText $PLAYER~EPROBES&"    " $EPROBES 0 3
    cutText $PLAYER~TWARP_TYPE&"    " $TWARP_TYPE 0 3
    cutText $PLAYER~SCAN_TYPE&"    " $SCAN_TYPE 0 3

    setVar $stats[24] "   EProbes : "&$eprobes&" | Beacons : "&$PLAYER~beacons&"*"
    setVar $stats[25] "   Disrupt : "&$MINE_DISRUPTORS&" | Photons : "&$PLAYER~PHOTONS&"*"
    setVar $stats[26] "    Armids : "&$ARMIDS&" | Limpets : "&$PLAYER~LIMPETS&"*"
    setVar $stats[27] "   Genesis : "&$GENESIS&" | AtmDets : "&$PLAYER~ATOMIC&"*"
    setVar $stats[28] "    Cloaks : "&$CLOAKS&" |  Corbos : "&$PLAYER~CORBO&"*"
    setVar $stats[29] "     Twarp : "&$TWARP_TYPE&" | PlnScan : "&$PLAYER~PLANET_SCANNER&"*"
    setVar $stats[30] "   Scanner : "&$SCAN_TYPE&" | PsiProb : "&$PLAYER~PSYCHIC_PROBE&"*"
    setVar $stats[31] "     *"
return

:loadVars
    loadVar $PLANET~planet
    loadVar $PLAYER~unlimitedGame
    loadVar $PLAYER~CREDITS
    loadVar $PLAYER~FIGHTERS
    loadVar $PLAYER~SHIELDS
    loadVar $PLAYER~TOTAL_HOLDS
    loadVar $PLAYER~ORE_HOLDS
    loadVar $PLAYER~ORGANIC_HOLDS
    loadVar $PLAYER~EQUIPMENT_HOLDS
    loadVar $PLAYER~COLONIST_HOLDS
    loadVar $PLAYER~PHOTONS
    loadVar $PLAYER~ARMIDS
    loadVar $PLAYER~LIMPETS
    loadVar $PLAYER~GENESIS
    loadVar $PLAYER~TWARP_TYPE
    loadVar $PLAYER~CLOAKS
    loadVar $PLAYER~BEACONS
    loadVar $PLAYER~ATOMIC
    loadVar $PLAYER~CORBO
    loadVar $PLAYER~EPROBES
    loadVar $PLAYER~MINE_DISRUPTORS
    loadVar $PLAYER~PSYCHIC_PROBE
    loadVar $PLAYER~PLANET_SCANNER
    loadVar $PLAYER~SCAN_TYPE
    loadVar $PLAYER~ALIGNMENT
    loadVar $PLAYER~EXPERIENCE
    loadVar $PLAYER~SHIP_NUMBER
    loadVar $PLAYER~TRADER_NAME
    loadVar $MAP~STARDOCK
    loadVar $MAP~alpha_centauri
    loadVar $MAP~rylos
    loadVar $MAP~backdoor
    loadVar $SHIP~SHIP_FIGHTERS_MAX
    loadvar $SHIP~SHIP_MAX_ATTACK
    loadVar $PLAYER~TURNS_PER_WARP
return

:refreshChatMenu
    loadVar $BOT~who_is_online 
    replaceText $BOT~who_is_online "," "*"
    gosub :getStats
    Echo #27 & "[2J"
    Echo "**"
    echo ANSI_13&"                                   Who's Online?                                     *"
    echo ANSI_15&"-------------------------------------------------------------------------------------*"
    echo ANSI_10&""&ANSI_7&$BOT~who_is_online
    echo ANSI_15&"------------------------------------------------------------------------------------- ---------------------------------------*"
    echo ANSI_13&"                                   Communications                                                      Stats                 *"
    echo ANSI_15&"------------------------------------------------------------------------------------- ---------------------------------------*"
    setVar $i $comm_window_size
    setVar $j 1
    while ($i >= 0)
        setVar $line $coms[($comm_window_start_index+$i)]
        getWordPos $line $posF "F"
        getWordPos $line $posR "R"
        getWordPos $line $posP "P"
        getWordPos $line $posPlus "+"

        if (($posF > 0) OR ($posR > 0) OR ($posP > 0) OR ($posPlus > 0))
            setVar $line_length 108
        else
            setVar $line_length 85
        end
        getlength $line $length
        while ($length <= $line_length)
            setVar $line $line&" "
            getlength $line $length
        end
        replaceText $stats[$j] ":" ANSI_14&":"&ANSI_11
        replaceText $stats[$j] "|" ANSI_5&":"&ANSI_11
        echo $line&" "&ANSI_5&$stats[$j]
        subtract $i 1
        add $j 1
    end
    echo ANSI_15&"------------------------------------------------------------------------------------- ---------------------------------------*"
    echo ANSI_12&" "&#27&"[35m["&#27&"[32m'"&#27&"[35m]"&ANSI_15&"Subspace ("&$BOT~subspace&")      "&#27&"[35m["&#27&"[32m`"&#27&"[35m]"&ANSI_15&"Fedspace      "&#27&"[35m["&#27&"[32mU"&#27&"[35m]p Chat History   "&#27&"[35m["&#27&"[32mD"&#27&"[35m]own Chat History*"&ANSI_7&"**"
return

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
