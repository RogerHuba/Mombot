#===================================== KEEP ALIVE ============================================
:keepalive
        send #27
        setvar $relog_message ""
        add $alive_count 1
    if ($alive_count >= ($BOT~echoInterval * 2))
        setVar $alive_count 0
        gosub :PLAYER~current_prompt
        getSectorParameter 2 "FIG_COUNT" $BOT~figCount
        echo ANSI_14 "*-= Time: " ANSI_15 TIME ANSI_14 " Fig Grid: " ANSI_15 $BOT~figCount ANSI_14 " =-*" ANSI_7
        echo CURRENTANSILINE
    end
    if ((CONNECTED <> TRUE) AND ($BOT~doRelog = TRUE))
        goto :relog_attempt
    end
    # at server game menu for some reason #
    if ((CURRENTLINE = $game~game_menu_prompt) or (CURRENTLINE = "[Pause] - [Press Space or Enter to continue]") or (CURRENTLINE = "Enter your choice: ") or (CURRENTLINE = "Selection (? for menu): "))
    	setvar $relog_message "Stuck on baffling prompt: ["&CURRENTLINE&"], so I relogged.*"
        DISCONNECT
        goto :relog_attempt
    end
    send #27
    setDelayTrigger     keepalive               :keepalive           30000
    pause
#=================================== END KEEP ALIVE ==========================================



#================================= ONLINE WATCH/RELOG ========================================
:online_watch
    if ((CONNECTED <> TRUE) AND ($BOT~doRelog = TRUE))
        goto :relog_attempt
    end
    setTextTrigger      online_watch            :online_watch              "Your session will be terminated in "
    send #27
    pause

    :relog_attempt
        if ($BOT~doRelog <> TRUE)
            goto :BOT~wait_for_command
        end
	    gosub :BOT~killthetriggers
        setDelayTrigger waitForRelogDelay :continueDoingRelog 1500
        pause
        :continueDoingRelog
            setvar $first_time TRUE
            gosub :do_relog
        :enter
            gosub :BOT~relog_freeze_trigger
            killtrigger relog
            killtrigger relog2
            killtrigger firstpause
            send "T*"
            setTextTrigger showtoday :continueshowtoday "Show today's log?"
            pause
        :continueshowtoday
            gosub :BOT~relog_freeze_trigger
            send "*"
            setTextTrigger pause2 :continuepause2 "[Pause]"
            pause
        :continuepause2
            gosub :BOT~relog_freeze_trigger
            send "*"
            setTextTrigger password :continuepassword "A password is required to enter this game."
            pause
        :continuepassword
            gosub :BOT~relog_freeze_trigger
            send $BOT~password & "*"
        :alldone_relog
            killtrigger clearvoids
            killtrigger novoids
            killtrigger morepauses
            gosub :BOT~relog_freeze_trigger
            send "Z*  *  Z*  Z   A 9999*  Z*  /"
			setvar $switchboard~message "Auto-relog activated*"
			gosub :switchboard~switchboard
            waiton #179
        :continuerelogmessage
            gosub :PLAYER~quikstats
            gosub :BOT~relog_freeze_trigger
            if ($PLAYER~CURRENT_PROMPT = "Planet")
                send "*"
                gosub :PLANET~getPlanetInfo
                if ($PLANET~CITADEL > 0)
                    send "c "
                    setvar $switchboard~message "In citadel, planet "&$PLANET~PLANET&".*"
                    gosub :switchboard~switchboard
                    goto :BOT~wait_for_command
                else
                    setvar $switchboard~message "On planet "&$PLANET~PLANET&".*"
                    gosub :switchboard~switchboard
                    goto :BOT~wait_for_command
                end
            end
			if ($relog_message <> "")
				setvar $switchboard~message $relog_message
				gosub :switchboard~switchboard
			end
            loadVar $PLANET~PLANET
            if (($PLANET~PLANET <> 0) AND ($PLAYER~CURRENT_SECTOR <> 1) AND ($PLAYER~CURRENT_SECTOR <> $MAP~stardock))
                setVar $LandOn $PLANET~PLANET
                setVar $BOT~user_command_line "land "&$LandOn
                goto :USER_INTERFACE~runUserCommandLine
            end
    goto :BOT~wait_for_command
#============================== END ONLINE WATCH/RELOG SUB ==============================
:do_relog
        :thedelay
            if (CONNECTED <> TRUE)
                connect
            end
            gosub :killrelogtriggers
            setEventTrigger continuelogin :continuelogin "CONNECTION ACCEPTED"
            pause
            :continuelogin
            gosub :killrelogtriggers
            setTextTrigger relog3 :continueRelog3 "Please enter your name"
            pause
        :continueRelog3
            gosub :killrelogtriggers
            setTextTrigger loginsuccessful :continueRelog4 "Trade Wars 2002"
            setTextTrigger loginsuccessful2 :continueRelog4 "Copyright (C) EIS"
            send $BOT~username & "*"
            pause

        :continueRelog4
            gosub :killrelogtriggers
            if ($first_time)
                setVar $first_time FALSE
                disconnect
                goto :do_relog
            end
            setTextTrigger relog69 :continueRelog5 "Make a Selection:"
            setTextTrigger relog3 :continueRelog5 "Selection (? for menu):"
            send "#"&#8
            pause
        :continueRelog5
            gosub :killrelogtriggers
            setTextTrigger firstpause :firstpause "[Pause]"
            setTextTrigger enter :done_do_relog "Enter your choice"
            send $BOT~letter
            pause
        :firstpause
            send "*"
            setTextTrigger firstpause :firstpause "[Pause]"
            pause
        :done_do_relog
            gosub :BOT~killthetriggers
return

:killrelogtriggers
    killtrigger continuelogin
    killtrigger thedelay
    killtrigger thedelay2
    killtrigger relog
    killtrigger relog2
    killtrigger relog3
    killtrigger relog69
    killtrigger relog89
    killtrigger loginsuccessful
    killtrigger loginsuccessful2
    killtrigger firstpause
    killtrigger enter
    setDelayTrigger thedelay2 :thedelay 5000
return

