# ============================== END MAIN BODY WAIT FOR COMMANDS SUB ==============================
:loginmemo
    getWordPos CURRENTANSILINE $pos (#27 & "[32mYou have a corporate memo from " & #27 & "[1;36m")
    getwordpos currentansiline $pos2 ("[K[0;32mYou have a corporate memo from [1;36m")
    if ($pos > 0)
        getText CURRENTANSILINE $user_name (#27 & "[32mYou have a corporate memo from " & #27 & "[1;36m") (#27 & "[0;32m." & #13)
        setVar $i 1
        setVar $tempUsername $user_name
        lowercase $tempUsername
        lowerCase $user_name
        while ($i <= $BOT~corpycount)
            setVar $tempCorpy $BOT~corpy[$i]
            lowerCase $tempCorpy
            if ($tempCorpy = $tempUsername)
                goto :endloginmemo
            end
            add $i 1
        end
        add $BOT~corpycount 1
        setVar $BOT~corpy[$BOT~corpycount] $user_name
        cutText $user_name $cut_user_name 1 6
        stripText $cut_user_name " "
        setVar $loggedin[$cut_user_name] 1
        send "'["&$BOT~mode&"]{"&$SWITCHBOARD~bot_name&"} - User Verified - "&$user_name&"*"
    end
    if ($pos2 > 0)
        getText CURRENTANSILINE $user_name ("[K[0;32mYou have a corporate memo from " & #27 & "[1;36m") (#27 & "[0;32m." & #13)
        setVar $i 1
        setVar $tempUsername $user_name
        lowercase $tempUsername
        lowerCase $user_name
        while ($i <= $BOT~corpycount)
            setVar $tempCorpy $BOT~corpy[$i]
            lowerCase $tempCorpy
            if ($tempCorpy = $tempUsername)
                goto :endloginmemo
            end
            add $i 1
        end
        add $BOT~corpycount 1
        setVar $BOT~corpy[$BOT~corpycount] $user_name
        cutText $user_name $cut_user_name 1 6
        stripText $cut_user_name " "
        setVar $loggedin[$cut_user_name] 1
        send "'["&$BOT~mode&"]{"&$SWITCHBOARD~bot_name&"} - User Verified - "&$user_name&"*"
    end
    :endloginmemo
        killtrigger loginmemo
        setTextLineTrigger      loginmemo               :loginmemo            "You have a corporate memo from "
        pause
# ======================================= COMMAND ROUTING =========================================


:stop
    gosub :BOT~killthetriggers
    listActiveScripts $scripts
    setVar $i 1
    setVar $found FALSE
    while ($i <= $scripts)
        lowerCase $scripts[$i]
        getWordPos "<><><>"&$scripts[$i] $pos "<><><>"&$BOT~parm1
        getWordPos "<><><>"&$scripts[$i] $pos2 "<><><>__mom_bot"
        if (($pos > 0) and ($pos2 <= 0))
            stop $scripts[$i]
            setVar $found TRUE
            setVar $SWITCHBOARD~message "Script ["&$scripts[$i]&"] killed.*"
            gosub :SWITCHBOARD~switchboard
        end
        add $i 1
    end
    if ($FOUND = FALSE)
        setVar $SWITCHBOARD~message "No script starting with "&$BOT~parm1&" was found to kill.*"
        gosub :SWITCHBOARD~switchboard
    end
    goto :BOT~wait_for_command

# ========================== START STOPALL (STOPALL) SUBROUTINE ==============================
:stopall
    gosub :BOT~killthetriggers
    openMenu TWX_STOPALLFAST FALSE
    setVar $BOT~mode "General"
    savevar $bot~mode
    gosub :msgs_on

    if ($was_silent)
		setVar $SWITCHBOARD~message "All non-system scripts and modules killed, and modes reset. Also, turned messages back on.*"
    else
		setVar $SWITCHBOARD~message "All non-system scripts and modules killed, and modes reset.*"
    end
    gosub :SWITCHBOARD~switchboard
    goto :BOT~wait_for_command

:msgs_on
    setVar $was_silent TRUE
    :msgs_on_again
    setTextTrigger onMSGS_ON  :onMSGS_ON "Displaying all messages."
    setTextTrigger onMSGS_OFF :onMSGS_OFF "Silencing all messages."
    send "|"
    pause
    :onMSGS_OFF
    killtrigger onMSGS_ON
    SETVAR $was_silent FALSE
    goto :msgs_on_again
    :onMSGS_ON
    killtrigger onMSGS_OFF
    loadvar $BOT~botIsDeaf
    if ($BOT~botIsDeaf = TRUE)
        gosub :MENUS~donePrefer
    end
return

# =========================== END STOPALL (STOPALL) SUBROUTINE ================================
:listall
    listActiveScripts $scripts
    setVar $a 1
    setVar $SWITCHBOARD~message " Current script(s) loaded*"
    setVar $SWITCHBOARD~message $SWITCHBOARD~message&"--------------------------*"
    while ($a <= $scripts)
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&"   "&$scripts[$a]&"*"
        add $a 1
    end
    if (($SWITCHBOARD~self_command <> TRUE) OR ($bot~silent_running <> TRUE))
        setVar $SWITCHBOARD~self_command 2
    end
    gosub :SWITCHBOARD~switchboard  
goto :BOT~wait_for_command
# ================================== START GENERAL MODE RESET ====================================
:stopModules
    openMenu TWX_STOPALLFAST FALSE
    stop $BOT~LAST_LOADED_MODULE
    echo ANSI_14 "*<<" ANSI_15 "General Mode Reset" ANSI_14 ">>*" ANSI_7
    setVar $BOT~mode "General"
    savevar $bot~mode
    setVar $BOT~LAST_LOADED_MODULE ""
    gosub :msgs_on
    goto :BOT~wait_for_command
# ================================= END GENERAL MODE RESET ==========================================

:callin
    setVar $new_bot_team_name $BOT~parm1
    stripText $new_bot_team_name "^"
    stripText $new_bot_team_name " "
    lowerCase $new_bot_team_name
    if ($new_bot_team_name = "")
        setVar $SWITCHBOARD~message "Invalid team name entered, cannot join that one.*"
        gosub :SWITCHBOARD~switchboard
        goto :BOT~wait_for_command        
    else
        if (($new_bot_team_name ="all") OR ($new_bot_team_name = "0"))
            setVar $SWITCHBOARD~message "Invalid team name*"
            gosub :SWITCHBOARD~switchboard
            goto :BOT~wait_for_command
        else
            setVar $BOT~bot_team_name $new_bot_team_name
            saveVar $BOT~bot_team_name
            setVar $SWITCHBOARD~message "I am now part of team: " & $BOT~bot_team_name & "*"
            gosub :SWITCHBOARD~switchboard
        end
    end
goto :BOT~wait_for_command

# ============================== START TWARP HOTKEY ===============================
:twarpswitch
    getInput $BOT~parm1 "Twarp To:"
    getWord $BOT~parm1 $BOT~parm1 1
    stripText $BOT~parm1 " "
    if (($BOT~parm1 = "0") OR ($BOT~parm1 = ""))
        goto :BOT~wait_for_command
    end
    setVar $BOT~user_command_line "twarp "&$BOT~parm1&" "
    goto :USER_INTERFACE~runUserCommandLine
#================================  END TWARP HOTKEY =================================

# ============================== START MOW HOTKEY ===============================
:mowswitch
    getInput $BOT~parm1 "Mow To:"
    getWord $BOT~parm1 $BOT~parm1 1
    stripText $BOT~parm1 " "
    if (($BOT~parm1 = "0") OR ($BOT~parm1 = ""))
        goto :BOT~wait_for_command
    end
    setVar $BOT~user_command_line "mow "&$BOT~parm1&" 1"
    goto :USER_INTERFACE~runUserCommandLine
#================================  END MOW HOTKEY =================================
#============================= START PHOTON HOTKEY ================================
:fotonswitch
    if ($BOT~mode = "Foton")
        setVar $BOT~user_command_line "foton off"
        goto :USER_INTERFACE~runUserCommandLine
    else
        setVar $BOT~user_command_line "foton on p"
        goto :USER_INTERFACE~runUserCommandLine
    end
goto :BOT~wait_for_command
#=========================== END PHOTON HOTKEY =======================================

:clear
   setVar $BOT~user_command_line "clear"
    goto :USER_INTERFACE~runUserCommandLine

:kit
   setVar $BOT~user_command_line "macro_kit"
    goto :USER_INTERFACE~runUserCommandLine

:dock_shopper
    setVar $BOT~user_command_line "dock_shopper"
    goto :USER_INTERFACE~runUserCommandLine


:x
:xport
    setVar $BOT~user_command_line "xport "&$BOT~parm1&" "&$BOT~parm2&" "&$BOT~parm3&" "&$BOT~parm4&" "&$BOT~parm5&" "&$BOT~parm6&" "&$BOT~parm7&" "&$BOT~parm8
    goto :USER_INTERFACE~runUserCommandLine
    
:mow
:m
    setVar $BOT~user_command_line "mow "&$BOT~parm1&" "&$BOT~parm2&" "&$BOT~parm3&" "&$BOT~parm4&" "&$BOT~parm5&" "&$BOT~parm6&" "&$BOT~parm7&" "&$BOT~parm8
    goto :USER_INTERFACE~runUserCommandLine

:land
:l
    setVar $BOT~user_command_line "land "&$BOT~parm1&" "&$BOT~parm2&" "&$BOT~parm3&" "&$BOT~parm4
    goto :USER_INTERFACE~runUserCommandLine

:sector
:secto
:sect
:sec
    setVar $BOT~user_command_line "sector "&$BOT~parm1&" "&$BOT~parm2&" "&$BOT~parm3&" "&$BOT~parm4
    goto :USER_INTERFACE~runUserCommandLine
:qss
:status
    setVar $BOT~user_command_line "status "&$BOT~parm1&" "&$BOT~parm2&" "&$BOT~parm3&" "&$BOT~parm4
    goto :USER_INTERFACE~runUserCommandLine

:parm
:parms
:params
    setVar $BOT~user_command_line "param "&$BOT~parm1&" "&$BOT~parm2&" "&$BOT~parm3&" "&$BOT~parm4
    goto :USER_INTERFACE~runUserCommandLine

:t
:twarp
    setVar $BOT~user_command_line "twarp "&$BOT~parm1&" "&$BOT~parm2&" "&$BOT~parm3&" "&$BOT~parm4&" "&$BOT~parm5&" "&$BOT~parm6&" "&$BOT~parm7&" "&$BOT~parm8    
    goto :USER_INTERFACE~runUserCommandLine

:b
:bwarp
    setVar $BOT~user_command_line "bwarp "&$BOT~parm1&" "&$BOT~parm2&" "&$BOT~parm3&" "&$BOT~parm4&" "&$BOT~parm5&" "&$BOT~parm6&" "&$BOT~parm7&" "&$BOT~parm8    
    goto :USER_INTERFACE~runUserCommandLine

:p
:pwarp
    setVar $BOT~user_command_line "pwarp "&$BOT~parm1&" "&$BOT~parm2&" "&$BOT~parm3&" "&$BOT~parm4&" "&$BOT~parm5&" "&$BOT~parm6&" "&$BOT~parm7&" "&$BOT~parm8
    goto :USER_INTERFACE~runUserCommandLine

:d
:dep
    setVar $BOT~user_command_line "dep "&$BOT~parm1&" "&$BOT~parm2&" "&$BOT~parm3&" "&$BOT~parm4
    goto :USER_INTERFACE~runUserCommandLine

:w
:with
    setVar $BOT~user_command_line "with "&$BOT~parm1&" "&$BOT~parm2&" "&$BOT~parm3&" "&$BOT~parm4
    goto :USER_INTERFACE~runUserCommandLine

:htorp
    setVar $BOT~user_command_line "htorp "&$BOT~parm1&" "&$BOT~parm2&" "&$BOT~parm3&" "&$BOT~parm4
    goto :USER_INTERFACE~runUserCommandLine


#==================================== LOG OFF SUB ===========================================
:logoff
:logout
    killalltriggers
    gosub :PLAYER~quikstats
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    setVar $quittingWithNoTimer FALSE
    isNumber $test $BOT~parm1

    if ($startingLocation = "Citadel")
        send "q "
        gosub :PLANET~getPlanetInfo
        send "c "
    end
    if ($test = FALSE)
        setVar $quittingWithNoTimer TRUE
    elseif (($BOT~parm1 <= 0) OR ($BOT~parm1 = "cloak"))
        setVar $quittingWithNoTimer TRUE
    else
        setVar $timeToLogBackIn ($BOT~parm1*60)
        gosub :calcTime
    end
    setVar $cloakingOut FALSE
    getWordPos " "&$BOT~user_command_line&" " $pos " cloak "
    if ($pos > 0)
        setVar $cloakingOut TRUE
    end
    if (($cloakingOut = TRUE) AND ($PLAYER~CLOAKS > 0))
        if ($quittingWithNoTimer)
            send "'{" $SWITCHBOARD~bot_name "} - Logging and cloaking out until I am at keys to login again.*"
        else
            send "'{" $SWITCHBOARD~bot_name "} - Logging and cloaking out for "&$hours&" hours, "&$minutes&" minutes, and "&$seconds&" seconds.*"
        end
        send "q q q q  * * * * q q q q y y x *"
        waitOn "==-- Trade Wars 2002 --=="
    else
        if ($quittingWithNoTimer)
            send "'{" $SWITCHBOARD~bot_name "} - Logging out until I am at keys to login again.*"
        else
            send "'{" $SWITCHBOARD~bot_name "} - Logging out for "&$hours&" hours, "&$minutes&" minutes, and "&$seconds&" seconds.*"
        end
        if ($startingLocation = "Citadel")
            send "ryy* x *##"
            waitOn "Game Server"
        else
            send "q q q q  * * * * q q q q y*"
            waitOn "==-- Trade Wars 2002 --=="
        end
    end
    disconnect
    setVar $timer 0
    if ($quittingWithNoTimer)
        halt
    end
    setTextOutTrigger logearly :endLogoffGame #32
    while ($timeToLogBackIn > 0)
        gosub :calcTime
        echo ANSI_10 #27 & "[1A" & #27 & "[K" & $hours ":" $minutes ":" $seconds " left before entering game " GAME " (" GAMENAME ") "&ANSI_15&" ["&ANSI_14&"Spacebar to relog"&ANSI_15&"]*"
        setDelayTrigger timeBeforeRelog :relogTimer 1000
        pause
        :relogTimer
            setVar $timeToLogBackIn $timeToLogBackIn-1
    end
    :endLogoffGame
    killtrigger logearly
    killtrigger timeBeforeRelog
    goto :CONNECTIVITY~relog_attempt


:calcTime
    setVar $hours 0
    setVar $minutes 0
    setVar $seconds 0
    setVar $testTime $timeToLogBackIn
    if ($testTime >= 3600)
        setVar $hours ($testTime/3600)
        setVar $testTime $testTime-($hours*3600)
    end
    if ($testTime >= 60)
        setVar $minutes ($testTime/60)
        setVar $testTime $testTime-($minutes*60)
    end
    if ($testTime >= 1)
        setVar $seconds $testTime
    end
    if ($hours < 10)
        setVar $hours "0"&$hours
    end
    if ($minutes < 10)
        setVar $minutes "0"&$minutes
    end
    if ($seconds < 10)
        setVar $seconds "0"&$seconds
    end
return
#==================================== END LOG OFF SUB ========================================

#===================================== SURROUND SUB =============================================================
:surround
    gosub :BOT~killthetriggers
    gosub :PLAYER~quikstats
    if (($PLAYER~TURNS <= $BOT~bot_turn_limit) and ($PLAYER~unlimitedGame <> TRUE))
                setVar $SWITCHBOARD~message "Turns Exceed Bot Turn Limit.*"
        gosub :SWITCHBOARD~switchboard
                goto :BOT~wait_for_command
        end
        if ($PLAYER~PHOTONS > 0)
                if ($shipPhotonCheck = $PLAYER~SHIP_NUMBER)

                else
                       setVar $shipPhotonCheck $PLAYER~SHIP_NUMBER
                       echo "*" & ANSI_14  &"You are carrying photons. *If you wish to surround anyway, press TAB-S again.*" & ANSI_7
                       goto :BOT~wait_for_command
                end
        end
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    if ($startingLocation = "Command")
    elseif ($startingLocation = "Citadel")
        send "q "
        gosub :PLANET~getPlanetInfo
        send "q "
    elseif ($startingLocation = "Planet")
        gosub :PLANET~getPlanetInfo
        send "q "
    else
        echo "*Wrong prompt for surround command.*"
        goto :BOT~wait_for_command
    end

    gosub :PLAYER~surround

        if ($BOT~surroundAutoCapture = TRUE)
            gosub :PLAYER~quikstats
            if ($startingLocation = "Citadel")
                setVar $PLAYER~startingLocation "Command"
                goSub :SECTOR~getSectorData
                goSub :PLAYER~fastCapture
                setVar $PLAYER~startingLocation "Citadel"
            else
                goSub :SECTOR~getSectorData
                goSub :PLAYER~fastCapture
            end

        end
        if (($startingLocation = "Citadel") OR ($startingLocation = "Planet"))
            gosub :PLANET~landingSub
        end
        send "'{" $SWITCHBOARD~bot_name "} - Surrounded sector "&$PLAYER~CURRENT_SECTOR&".*"
        setTextLineTrigger surroundmessage :continuesurroundmessage  "{"&$SWITCHBOARD~bot_name&"} - Surrounded sector "&$PLAYER~CURRENT_SECTOR&"."
        pause
    :continuesurroundmessage
        echo "*" & ANSI_14 & $PLAYER~surroundOutput & "*" & ANSI_7
goto :BOT~wait_for_command
#========================== END SURROUND SUB ==============================================


:emx
:reset
    disconnect
    goto :BOT~wait_for_command
:emq
    send " q q q * p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * "
    goto :BOT~wait_for_command
:lift
    send "0* 0* 0* q q q q q z a 999* * * * "
    goto :BOT~wait_for_command
# ============================== START LOGIN (login) Sub ==============================
:login
    gosub :BOT~killthetriggers
    gosub :PLAYER~current_prompt
    setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $BOT~validPrompts "Citadel Command"
    gosub :BOT~checkStartingPrompt
    if ($PLAYER~startingLocation = "Command")
        send "t tLogin** q "
    else
        send "x tLogin** q "
    end
goto :BOT~wait_for_command
# ============================== END LOGIN (login) Sub ==============================




# ============================== START STORE SHIP ====================================
:storeship
:shipstore
        gosub :PLAYER~current_prompt
        setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
        setVar $BOT~validPrompts "Command Citadel"
        gosub :BOT~checkStartingPrompt
        gosub :SHIP~save_the_ship
        goto :BOT~wait_for_command
# ================================== END STORE SHIP ==============================================




:exit
:xenter
    setVar $BOT~user_command_line "xenter "&$BOT~parm1&" "&$BOT~parm2&" "&$BOT~parm3&" "&$BOT~parm4&" "&$BOT~parm5&" "&$BOT~parm6&" "&$BOT~parm7&" "&$BOT~parm8
    goto :USER_INTERFACE~runUserCommandLine

#====================================SHUTDOWN MODULE SUB =====================================
:shutdown
    setVar $BOT~mode "General"
    savevar $bot~mode
    goto :BOT~wait_for_command
#===================================END SHUTDOWN MODULE SUB ==================================
:bustcount
:countbust
:countbusts
    Echo "**"
    setVar $SWITCHBOARD~message "Please StandBy, Counting*"
    gosub :SWITCHBOARD~switchboard
    waiton "Please StandBy, Counting"
    setVar $i 1
    setVar $bustCount 0
    while ($i <= SECTORS)
        getSectorParameter $i "BUSTED" $isBusted
        if ($isBusted)
            add $bustCount 1
        end
        add $i 1
    end
    setVar $SWITCHBOARD~message "This bot currently has "&$bustCount&" busts recorded in the universe*"

    gosub :SWITCHBOARD~switchboard
    goto :BOT~wait_for_command

# ----- CN settings -----
:cn
:cn9
    gosub :PLAYER~current_prompt
    setVar $BOT~validPrompts "Citadel Command Computer"
    gosub :BOT~checkStartingPrompt
    if ($PLAYER~startingLocation = "Computer")
        send "q"
    end
    gosub :startCNsettings
    setVar $SWITCHBOARD~message "CN Settings are reset for this bot.*"
    gosub :SWITCHBOARD~switchboard
goto :BOT~wait_for_command
    
:startCNsettings
    send "CN"
        SetTextLineTrigger ansi1 :cncheck "(1) ANSI graphics            - Off"
        SetTextLineTrigger anim1 :cncheck "(2) Animation display        - On"
        SetTextLineTrigger page1 :cncheck "(3) Page on messages         - On"
        SetTextLineTrigger setsschn :setsschn "(4) Sub-space radio channel"
        SetTextLineTrigger silence1 :cncheck "(7) Silence ALL messages     - Yes"
        SetTextLineTrigger abortdisplay1 :cncheck "(9) Abort display on keys    - ALL KEYS"
        SetTextLineTrigger messagedisplay1 :cncheck "(A) Message Display Mode     - Long"
        SetTextLineTrigger screenpauses1 :cncheck "(B) Screen Pauses            - Yes"
        SetTextLineTrigger onlineautoflee0 :cncdone "(C) Online Auto Flee         - Off"
        SetTextLineTrigger onlineautoflee1 :cncalmostdone "(C) Online Auto Flee         - On"
        pause
    :cncheck
        gosub :getCNC
        pause
        :setsschn
            getWord CURRENTLINE $BOT~subspace 6
        if ($BOT~subspace = 0)
            getRnd $BOT~subspace 101 60000
            send "4" & $BOT~subspace & "*"
        end
        saveVar $BOT~subspace
        pause
    :cncalmostdone
        gosub :getCNC
    :cncdone
            send "QQ"
            killtrigger 1
            killtrigger 2
            SetTextTrigger 1 :subStartCNcontinue "Command [TL="
            SetTextTrigger 2 :subStartCNcontinue "Citadel command (?=help)"
            pause
            :subStartCNcontinue
            killtrigger 1
            killtrigger 2
            gosub :BOT~killthetriggers
return
:getCNC
    getWord CURRENTLINE $cnc 1
    stripText $cnc "("
    stripText $cnc ")"
    send $cnc&"  "
return

#============================== BOT PROMPT COMMUNICATION =================================
:ss
    cutText $BOT~user_command_line $BOT~user_command_line 2 9999
    send "'"&$BOT~user_command_line&"*"
    goto :BOT~wait_for_command
:fed
    cutText $BOT~user_command_line $BOT~user_command_line 2 9999
    send "`"&$BOT~user_command_line&"*"
    goto :BOT~wait_for_command
#============================ END BOT PROMPT COMMUNICATION ================================
:about
    gosub :menus~doSplashScreen
    echo "*" CURRENTANSILINE
    goto :BOT~wait_for_command
# ======================== START TURN BOT ON/OFF (BOT) SUBROUTINE =========================
:bot
    setVar $SWITCHBOARD~message ""
    if ($BOT~parm1 = "on")
        setVar $BOT~botIsOff FALSE
        setVar $SWITCHBOARD~message "Bot Active*"
    end
    if ($BOT~parm1 = "off")
        setVar $BOT~botIsOff TRUE
        setVar $SWITCHBOARD~message "Bot Deactivated*"
    end
    if (($BOT~parm1 <> "off") AND ($BOT~parm1 <> "on"))
        setVar $SWITCHBOARD~message "That status option is unknown..*"
    end
    gosub :SWITCHBOARD~switchboard
goto :BOT~wait_for_command
:relog
    setVar $SWITCHBOARD~message ""
    if ($BOT~parm1 = "on")
        setVar $SWITCHBOARD~message "Relog Active*"
        setVar $BOT~doRelog TRUE
    end
    if ($BOT~parm1 = "off")
        setVar $SWITCHBOARD~message "Relog Deactivated*"
        setVar $BOT~doRelog FALSE
    end
    if (($BOT~parm1 <> "off") AND ($BOT~parm1 <> "on"))
        setVar $SWITCHBOARD~message "Please use relog [on/off] format.*"
        goto :BOT~wait_for_command
    end
    saveVar $BOT~doRelog
    gosub :SWITCHBOARD~switchboard
goto :BOT~wait_for_command
# ====================== END TURN BOT ON/OFF (BOT) SUBROUTINE ==========================
#============================= REFRESH BOT SUB ===============================================
:refresh
    gosub :PLAYER~quikstats
    setVar $BOT~validPrompts "Citadel Command"
    gosub :BOT~checkStartingPrompt
    if ($PLAYER~CURRENT_PROMPT = "Citadel")
        send "q"
        gosub :PLANET~getPlanetInfo
        send "q"
    end
    gosub :PLAYER~getInfo
    gosub :GAME~gamestats
    
    gosub :SHIP~getShipStats
    
    gosub :PLAYER~quikstats
    gosub :SHIP~getShipCapStats
    gosub :SHIP~loadShipInfo

    gosub :PLANET~getPlanetStats
    gosub :PLANET~loadPlanetInfo

    if ($PLAYER~CURRENT_PROMPT = "Citadel")
        gosub :PLANET~landingSub
    end
    send "'{" & $SWITCHBOARD~bot_name & "} - Bot data refresh completed.*"
goto :BOT~wait_for_command
#========================== END REFRESH BOT SUB =================================================

#####===============================================  BOT HELP SECTION ================================================#####
:holo_kill
:hkill
    setVar $CIT FALSE
    if ($PLAYER~surround_before_hkill = TRUE)
            setVar $PLAYER~insurround_before_hkill TRUE
    end
    gosub :PLAYER~quikstats
    gosub :BOT~killthetriggers
    gosub :PLAYER~current_prompt
    setVar $startingLocation $PLAYER~current_prompt
    setVar $BOT~validPrompts "Citadel Command"
    gosub :BOT~checkStartingPrompt
    gosub :PLAYER~holo_kill
    if ($SWITCHBOARD~message <> "")
        gosub :SWITCHBOARD~switchboard
    end
    goto :BOT~wait_for_command

#####==========================================  BOT INTERNAL MENUS SECTION ===========================================#####

# ========================================= SETVAR ======================================================
:getvar
    gosub :BOT~killthetriggers
    getWord $BOT~user_command_line $BOT~parm1 1
    setVar $SWITCHBOARD~message ""
    if (($BOT~parm1 = "h") OR ($BOT~parm1 = "home") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Home Sector: "&$MAP~home_sector&"*"
    end
    if (($BOT~parm1 = "s") OR ($BOT~parm1 = "stardock") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Stardock: "&$MAP~stardock&"*"
    end
    if (($BOT~parm1 = "r") OR ($BOT~parm1 = "rylos") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Rylos: "&$MAP~rylos&"*"
    end
    if (($BOT~parm1 = "a") OR ($BOT~parm1 = "alpha") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Alpha Centauri: "&$MAP~alpha_centauri&"*"
    end
    if (($BOT~parm1 = "b") OR ($BOT~parm1 = "backdoor") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Backdoor: "&$MAP~backdoor&"*"
    end
    if (($BOT~parm1 = "x") OR ($BOT~parm1 = "safeship") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Safe Ship: "&$BOT~safe_ship&"*"
    end
    if (($BOT~parm1 = "tl") OR ($BOT~parm1 = "turnlimit") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Turn Limit: "&$BOT~bot_turn_limit&"*"
    end
    if (($BOT~parm1 = "pgridbot") OR ($BOT~parm1 = "pbot") OR ($BOT~parm1 = $SWITCHBOARD~bot_name))
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&"PGrid Bot: "&$BOT~pgrid_bot&"*"
    end
    if ($SWITCHBOARD~message = "")
        setVar $SWITCHBOARD~message "Unknown variable name entered.*"
    end
    if ($SWITCHBOARD~self_command <> TRUE)
        setVar $SWITCHBOARD~self_command 2
    end
    gosub :SWITCHBOARD~switchboard
goto :BOT~wait_for_command
:setvar
    gosub :BOT~killthetriggers
    getWord $BOT~user_command_line $BOT~parm1 1
    isNumber $test $BOT~parm2
    if (($BOT~parm1 = "h") OR ($BOT~parm1 = "home"))
        if ($test)
            if (($BOT~parm2 <= SECTORS) AND ($BOT~parm2 >= 1))
                setVar $MAP~home_sector $BOT~parm2
                setVar $SWITCHBOARD~message "Home Sector variable set to: "&$MAP~home_sector&".*"
            else
                setVar $SWITCHBOARD~message "Variable entered not valid, keeping old value.*"
            end
        end
    elseif (($BOT~parm1 = "s") OR ($BOT~parm1 = "stardock"))
        if ($test)
            if (($BOT~parm2 <= SECTORS) AND ($BOT~parm2 >= 1))
                setVar $MAP~stardock $BOT~parm2
                setVar $MAP~stardock $BOT~parm2
                setVar $SWITCHBOARD~message "Stardock variable set to: "&$MAP~stardock&".*"
            else
                setVar $SWITCHBOARD~message "Variable entered not valid, keeping old value.*"
            end
        end
    elseif (($BOT~parm1 = "r") OR ($BOT~parm1 = "rylos"))
        if ($test)
            if (($BOT~parm2 <= SECTORS) AND ($BOT~parm2 >= 1))
                setVar $MAP~rylos $BOT~parm2
                setVar $MAP~rylos $BOT~parm2
                setVar $SWITCHBOARD~message "Rylos variable set to: "&$MAP~rylos&".*"
            else
                setVar $SWITCHBOARD~message "Variable entered not valid, keeping old value.*"
            end
        end
    elseif (($BOT~parm1 = "a") OR ($BOT~parm1 = "alpha"))
        if ($test)
            if (($BOT~parm2 <= SECTORS) AND ($BOT~parm2 >= 1))
                setVar $MAP~alpha_centauri $BOT~parm2
                setVar $MAP~alpha_centauri $BOT~parm2
                setVar $SWITCHBOARD~message "Alpha Centauri variable set to: "&$MAP~alpha_centauri&".*"
            else
                setVar $SWITCHBOARD~message "Variable entered not valid, keeping old value.*"
            end
        end
    elseif (($BOT~parm1 = "b") OR ($BOT~parm1 = "backdoor"))
        if ($test)
            if (($BOT~parm2 <= SECTORS) AND ($BOT~parm2 >= 1))
                setVar $MAP~backdoor $BOT~parm2
                setVar $MAP~backdoor $BOT~parm2
                setVar $SWITCHBOARD~message "Backdoor Sector variable set to: "&$MAP~backdoor&".*"
            else
                setVar $SWITCHBOARD~message "Variable entered not valid, keeping old value.*"
            end
        end
    elseif (($BOT~parm1 = "x") OR ($BOT~parm1 = "safeship"))
        if ($test)
            if ($BOT~parm2 >= 1)
                setVar $BOT~safe_ship $BOT~parm2
                setVar $SWITCHBOARD~message "Safe Ship variable set to: "&$BOT~safe_ship&".*"
            else
                setVar $SWITCHBOARD~message "Variable entered not valid, keeping old value.*"
            end
        end
    elseif (($BOT~parm1 = "tl") OR ($BOT~parm1 = "turnlimit"))
        if ($test)
            if ($BOT~parm2 >= 0)
                setVar $BOT~bot_turn_limit $BOT~parm2
                setVar $SWITCHBOARD~message "Turn Limit variable set to: "&$BOT~bot_turn_limit&".*"
            else
                setVar $SWITCHBOARD~message "Variable entered not valid, keeping old value.*"
            end
        end
    elseif (($BOT~parm1 = "pgridbot") OR ($BOT~parm1 = "pbot"))
        
            if ($BOT~parm2 <> 0)
                setVar $BOT~pgrid_bot $BOT~parm2
                setVar $SWITCHBOARD~message "PGrid Bot has been set.*"
            else
		setVar $BOT~pgrid_bot ""
                setVar $SWITCHBOARD~message "PGrid Bot has been cleared.*"
            end
        

    else
        setVar $SWITCHBOARD~message "Unknown variable name entered.*"
    end
    gosub :MENUS~preferenceStats      
    gosub :SWITCHBOARD~switchboard
goto :BOT~wait_for_command
# ======================================== END SETVAR ===================================================

#=============================== AUTO KILL ==========================================
:autoKill
:kill
    gosub :BOT~killthetriggers
    gosub :PLAYER~current_prompt
    setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
    if ($PLAYER~startingLocation <> "Command")
        if ($PLAYER~startingLocation = "Citadel")
            if ($BOT~mode <> "Citkill")
                setVar $BOT~user_command_line "citkill on override"
                goto :USER_INTERFACE~runUserCommandLine
            else
                setVar $BOT~user_command_line "citkill off"
                goto :USER_INTERFACE~runUserCommandLine
            end
        end
        setVar $SWITCHBOARD~message "Wrong prompt for auto kill.*" 
        gosub :SWITCHBOARD~switchboard
        goto :BOT~wait_for_command
    end
    loadVar $SHIP~SHIP_MAX_ATTACK
    loadVar $SHIP~SHIP_FIGHTERS_MAX
    loadVar $SHIP~SHIP_OFFENSIVE_ODDS
    if ($SHIP~SHIP_MAX_ATTACK <= 0)
        gosub :SHIP~getShipStats
    end
    goSub :SECTOR~getSectorData
    goSub :PLAYER~fastAttack
    goto :BOT~wait_for_command
#============================ END AUTO KILL ============================================
:autoCapture
:autoCap
:cap
    setVar $BOT~user_command_line "cap "&$BOT~parm1&" "&$BOT~parm2&" "&$BOT~parm3&" "&$BOT~parm4&" "&$BOT~parm5&" "&$BOT~parm6&" "&$BOT~parm7&" "&$BOT~parm8
    goto :USER_INTERFACE~runUserCommandLine

#========================= AUTO REFURB SUB ===============================================
:scrub
    setVar $scrubonly TRUE
:autorefurb
:refurb
    setVar $message ""
    gosub :BOT~killthetriggers
    gosub :PLAYER~current_prompt
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
    if (($startingLocation <> "Command") AND ($startingLocation <> "Citadel"))
        gosub :PLAYER~current_prompt
        setVar $BOT~validPrompts "Citadel Command"
        gosub :BOT~checkStartingPrompt
    end
    if ((CURRENTSECTOR = 1) OR (PORT.CLASS[CURRENTSECTOR] = 0))
        if ($startingLocation = "Citadel")
            send "q "
            gosub :PLANET~getPlanetInfo
            send "q "
        end
        send "p ty"
    elseif (CURRENTSECTOR = $MAP~STARDOCK)
        send "p ss ys *p"
    else
        if ($BOT~parm1 = "seek")
            if ($startingLocation = "Citadel")
                send "q "
                gosub :PLANET~getPlanetInfo
                send "c "
            end
            gosub :PLAYER~quikstats
            setVar $back $PLAYER~CURRENT_SECTOR
            setVar $PLAYER~warpto $MAP~stardock
            gosub :PLAYER~twarp
            gosub :PLAYER~current_prompt
            if ($PLAYER~twarpSuccess = TRUE)
                send "p ss ys *p"
            else
                setVar $SWITCHBOARD~message $PLAYER~msg&"*"
                gosub :SWITCHBOARD~switchboard
                goto :BOT~wait_for_command
            end
        else
            setVar $SWITCHBOARD~message "No known class 0 or 9 port here to refurb at. Try the seek option.*" 
            gosub :SWITCHBOARD~switchboard
            goto :BOT~wait_for_command
        end
    end
    setVar $SWITCHBOARD~message ""
    setTextLineTrigger limpet   :markLimpet     "After an intensive scanning search, they find and remove the Limpet"
    setTextLineTrigger limpetno     :markLimpetNo   "The port official frowns at you (you haven't the funds!) and storms"
    setTextLineTrigger fighter  :buyfighters    "B  Fighters        :"
    pause
    :markLimpet
        setVar $message "Limpet scrubbed off of hull.*"
        pause
    :markLimpetNo
        setVar $message "Limpet exists, but not enough cash to get scrubbed.*"
        pause   
    :buyfighters
        gosub :BOT~killthetriggers
        if ($scrubonly <> TRUE)
            getWord CURRENTLINE $figsToBuy 8
            waitOn " credits per point "
            getWord CURRENTLINE $PLAYER~SHIELDSToBuy 9
            send "b "&$figsToBuy&"* c "&$PLAYER~SHIELDSToBuy&"* q q q * "
        else
            send "b 0* c 0* q q q * "
        end
        if ($BOT~parm1 = "seek")
            gosub :PLAYER~quikstats
            setVar $PLAYER~warpto $back
            gosub :PLAYER~twarp
            if ($PLAYER~twarpSuccess <> TRUE)
                setVar $SWITCHBOARD~message $PLAYER~msg&"*"
                gosub :SWITCHBOARD~switchboard
                goto :BOT~wait_for_command
            end
         end        
        if ($startingLocation = "Citadel")
            gosub :PLANET~landingSub
        end
        gosub :PLAYER~quikstats
        if ($message <> "")
            setVar $SWITCHBOARD~message $message
            gosub :SWITCHBOARD~switchboard
        end
goto :BOT~wait_for_command
#=============================== END AUTO REFURB =========================================

