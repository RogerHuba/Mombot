:check_invade_macro_params
    gosub :killthetriggers
    setArray $scan_array 1000
    gosub :PLAYER~quikstats
    setVar $PROMPT~startingLocation $PLAYER~current_prompt
    setVar $PROMPT~validPrompts "Citadel Command"
    gosub :PROMPT~checkStartingPrompt
    setVar $PLAYER~startingLocation $PLAYER~current_prompt
    setvar $starting_ship $player~ship_number

    if ($SHIP~SHIP_MAX_ATTACK <= 0)
        gosub :SHIP~getShipStats
    end
    #VALIDATION OF PHOTONS
    if ($PLAYER~PHOTONS <= 0)
        setVar $SWITCHBOARD~message "This command requires a photon*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
    #VALIDATION OF XPORT SHIP
    isNumber $test $parm2
    if ((($test = FALSE) or ($parm2 = 0)) AND ($command <> "pe") AND ($command <> "ped"))
        setVar $SWITCHBOARD~message "Parameter 2 invalid*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
    #CHECK FOR SHIP/PLANET NUMBER IN PARAMETER 3
    isNumber $test $parm3
    if (($test = FALSE) or ($parm3 = 0))
        if ($command = "pxex")
            setvar $parm3 $PLAYER~SHIP_NUMBER
        elseif (($command = "pxel") OR ($command = "pxelk"))
            setVar $SWITCHBOARD~message "Planet Parameter in-valid*"
            gosub :SWITCHBOARD~switchboard
            goto :wait_for_command
        end
    end
    #VALIDATION OF ATTACK SECTOR
    isNumber $test $parm1
    if ($test = FALSE)
        setVar $SWITCHBOARD~message "Sector Parameter in-valid*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
    if (($parm1 > 10) AND ($parm1 <= SECTORS) AND ($parm1 <> $MAP~STARDOCK))
    else
        setVar $SWITCHBOARD~message "Invalid attack sector entered*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
    #MAKE SURE ATTACK SECTOR IS ADJACENT
    setVar $i 1
    setVar $isFound false
    while (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$i] > 0)
        if (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$i] = $parm1)
            setVar $isFound TRUE
        end
        add $i 1
    end
    if ($isFound = FALSE)
        setVar $SWITCHBOARD~message "Cannot continue.  Sector not Adjacent, aborting..*"
        gosub :SWITCHBOARD~switchboard
        goto :wait_for_command
    end
    getWordPos " "&$user_command_line&" " $pos "speed"
    if ($pos > 0)
        setVar $speed TRUE
    else
        setVar $speed FALSE
    end
        #CLEARING THE ATTACK SECTOR
        send " c v * y * "&$parm1&"*  "
    #GET PLANET NUMBER IF STARTING FROM CITADEL
    if ($PLAYER~startingLocation = "Citadel")
            if ($player~credits > 0)
                send "t t"&$player~credits&"* "
            end
            send " q  q"
            gosub :PLANET~getPlanetInfo
            send "  C C  "
    end
    setVar $enter   "m  "&$parm1&"*"
    setVar $xport   "x   "&$parm2&"*  q  z  n  "
    setVar $xport_back   "x   "&$starting_ship&"*  q  z  n  "
    setVar $photon  "  p y"&$parm1&"*  q  "
return

:start_invade_macro
    if ($PLAYER~startingLocation = "Citadel")
        setVar $mac_starting $photon&"q  q  "
    else
        setVar $mac_starting $photon&"  "
    end
    if ($command = "pxex")
        setVar $mac_ending      "x   "&$parm3&"*  q  q  z  n"
        setVar $ends_in_sector      TRUE
    elseif ($command = "pex")
        setVar $mac_ending      "x    "&$parm2&"*  q  q  *  z  n  *  "
        setVar $ends_in_sector      TRUE
    elseif ($command = "pel")
        setVar $mac_ending      "l "&$parm2&"*  *"
        setVar $ends_in_sector      FALSE
    elseif ($command = "pxel")
        setVar $mac_ending      "l "&$parm3&"*  *  "
        setVar $ends_in_sector      FALSE
    elseif ($command = "pxelk")
        setVar $mac_ending      "l "&$parm3&"*  *  a"&$SHIP~SHIP_MAX_ATTACK&"*"
        setVar $ends_in_sector      FALSE
    elseif ($command = "pelk")
        setVar $mac_ending      "l "&$parm2&"*  *  a"&$SHIP~SHIP_MAX_ATTACK&"*"
        setVar $ends_in_sector      FALSE
    elseif (($command = "pxed") OR ($command = "ped"))
        setVar $mac_ending      "u  y  n  . *  j  c  *  "
        setVar $ends_in_sector      FALSE
    elseif (($command = "pxedx") OR ($command = "pedx"))
        setVar $mac_ending      "u  y  n  . *  j  c  *  "&$xport_back
        setVar $ends_in_sector      TRUE
    else
        setVar $mac_ending      ""
        setVar $ends_in_sector      FALSE
    end
    if (($PLAYER~startingLocation = "Citadel") AND ($ends_in_sector = TRUE))
        setVar $mac_ending $mac_ending&"l "&$PLANET~PLANET&" * c"
    end
    setVar $mac_ending $mac_ending&"@"
    #CHECK THE CLOCK TO OPTIMIZE PHOTON FIRING
    send "  t"
    waitfor ", 2"
    getWord CURRENTLINE $initTime 1
    :Photon_Attack_Timer
        send "  t"
        waitfor ", 2"
        getWord CURRENTLINE $currentTime 1
        waitfor "Computer"
        if ($initTime <> $currentTime)
            if ($speed = TRUE)
                send $mac_starting&$speed_invade_macro&$mac_ending
            else
                send $mac_starting&$normal_invade_macro&$mac_ending
            end
        else
            goto :Photon_Attack_Timer
        end
    #OUTPUT THE RESULTS OF THE DAMAGE IF REQUESTED
    if ($speed = FALSE)
        setVar $i 1
        setTextLineTrigger damage   :collect_damage     "The console reports damages of "
        setTextLineTrigger damage_done  :damage_done        "Average Interval Lag:"
        setTextLineTrigger damage_pod   :collect_pod        "You rush to an escape pod and abandon"
        setTextLineTrigger death   :collect_death        "You will have to start"
        pause
        :collect_damage
            setVar $scan_array[$i] CURRENTLINE
            add $i 1
            setTextLineTrigger damage :collect_damage "The console reports damages of "
            pause
        :collect_pod
            setVar $scan_array[$i] CURRENTLINE
            add $i 1
        :damage_done
            gosub :killthetriggers
            if ($i > 1)
                setVar $j 1
                send "'*"
                setTextLineTrigger comm :continuedamage "Comm-link open on sub-space band"
                pause
                :continuedamage
                    while ($j < $i)
                        send $scan_array[$j] & "*"
                        add $j 1
                    end
                    send "*"
                    setTextLineTrigger comm2 :continuedamage2 "Sub-space comm-link terminated"
                    pause
                :continuedamage2
            end
        :collect_death
            killalltriggers
            halt
    end
return

:wait_for_command
halt

:killthetriggers
    killalltriggers
return
