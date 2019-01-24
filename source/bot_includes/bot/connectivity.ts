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
        goto :internal_commands~relog_attempt
    end
    
    # if the last line hasn't changed for the last two keep alive checks #
	if ($last_prompt_seen = CURRENTLINE)
		# at server game menu for some reason #
		if ((CURRENTLINE = $game~game_menu_prompt) or (CURRENTLINE = "[Pause] - [Press Space or Enter to continue]") or (CURRENTLINE = "Enter your choice: ") or (CURRENTLINE = "Selection (? for menu): "))
			setvar $relog_message "Stuck on baffling prompt: ["&CURRENTLINE&"], so I relogged.*"
			DISCONNECT
			goto :internal_commands~relog_attempt
		end
		# TODO - add checking for subprompt interactivity turned off and resetting prompts that turn off comms if stuck there #
	end
    setvar $last_prompt_seen CURRENTLINE
    send #27
    setDelayTrigger     keepalive               :keepalive           30000
    pause
#=================================== END KEEP ALIVE ==========================================



#================================= ONLINE WATCH/RELOG ========================================
:online_watch
    if ((CONNECTED <> TRUE) AND ($BOT~doRelog = TRUE))
        goto :internal_commands~relog_attempt
    end
    setTextTrigger      online_watch            :online_watch              "Your session will be terminated in "
    send #27
    pause



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
            killalltriggers
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

