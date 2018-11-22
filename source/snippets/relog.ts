#Reconnects to game after disconnection
#Authors: Mind Dagger/Bounty Hunter
#      Needs: quikstats, getPlanetInfo


#============================== RELOG ==============================
:online_watch
	killalltriggers
	if (CONNECTED <> TRUE)
             goto :relog
        end
	Seteventtrigger relog :relog "Connections have been temporarily disabled."
	Seteventtrigger relog2 :relog "Connection lost"
	setTextLineTrigger whos :whos "Who's Playing"
	setTextTrigger alternate :whos ""
	setDelayTrigger verifydelay :verifydelay 3000
	send "#"
	pause

	:whos
        	killalltriggers
	        goto :wait_for_command

	:verifyDelay
        	killalltriggers
	        disconnect
        	goto :relog
:relog
	killalltriggers
	setDelayTrigger thedelay :thedelay 200
	pause

:thedelay
	killAllTriggers
	connect
	if (CONNECTED <> TRUE)
		goto :relog
	end
	setDelayTrigger verifydelay :verifydelay 3000
	waitfor "Please enter your name (ENTER for none):"
	killtrigger verifyDelay
	sound "page.wav"
	send $username & "*"
	setDelayTrigger verifydelay :verifydelay 3000
	waitfor "Trade Wars 2002 Game Server"
	killtrigger verifyDelay
	send $letter

:extrapause
	killalltriggers
	Seteventtrigger relog :relog "Connections have been temporarily disabled."
	Seteventtrigger relog2 :relog "Connection lost"
	setTextTrigger firstpause :firstpause "[Pause]"
	setTextTrigger enter :enter "Enter your choice"
	setDelayTrigger verifydelay :verifydelay 3000
	pause

:firstpause
	killalltriggers
	send "*"
	goto :extrapause

:enter
	killalltriggers
	send "T*"
	setDelayTrigger verifydelay :verifydelay 3000
	waitfor "Show today's log?"
	killtrigger verifyDelay
	send "*"
	setDelayTrigger verifydelay :verifydelay 3000
	waitfor "[Pause]"
	killtrigger verifyDelay
	send "*"
	setDelayTrigger verifydelay :verifydelay 3000
	waitfor "A password is required to enter this game."
	killtrigger verifyDelay
	send $password & "*"


:alldone_relog
	killtrigger clearvoids
	killtrigger novoids
	killtrigger morepauses
	send "Z*  *  Z*  Z   A 9999*  Z*  "
	send "'{" $bot_name "} - Auto-relog activated*"
	setDelayTrigger verifydelay :verifydelay 3000
	waitOn "{"&$bot_name&"} - Auto-relog activated"
	killAllTriggers
	gosub :quikstats
	if ($CURRENT_PROMPT = "Planet")
		send "*"
		gosub :getPlanetInfo
		send "q"
	end
	if ($PLANET <> 0)
		send "l "&$PLANET&"* c "
	end
	goto :wait_for_command
#============================== END RELOG SUB ==============================
