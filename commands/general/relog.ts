	gosub :BOT~loadVars
	loadvar $bot~username
	loadvar $bot~letter
	loadvar $bot~password
		
	setVar $BOT~help[1] $BOT~tab&"relog"
	setVar $BOT~help[2] $BOT~tab&"  - attempt to log the bot back into the game"
	gosub :BOT~help_file


    :relog_attempt
    	loadvar $bot~dorelog 
        if ($BOT~doRelog <> TRUE)
            halt
        end

        disconnect

        killalltriggers
        setDelayTrigger waitForRelogDelay :continueDoingRelog 500
        pause
        :continueDoingRelog
            setvar $first_time TRUE
            gosub :connectivity~do_relog
        :enter
            gosub :relog_freeze_trigger
            killtrigger relog
            killtrigger relog2
            killtrigger firstpause
            send "T*"
            setTextTrigger showtoday :continueshowtoday "Show today's log?"
            pause
        :continueshowtoday
            gosub :relog_freeze_trigger
            send "*"
            setTextTrigger pause2 :continuepause2 "[Pause]"
            pause
        :continuepause2
            gosub :relog_freeze_trigger
            send "*"
            setTextTrigger password :continuepassword "A password is required to enter this game."
            pause
        :continuepassword
            gosub :relog_freeze_trigger
            send $BOT~password & "*"
        :alldone_relog
            killtrigger clearvoids
            killtrigger novoids
            killtrigger morepauses
            gosub :relog_freeze_trigger
            send "Z*  *  Z*  Z   A 9999*  Z*  /"
			setvar $switchboard~message "Auto-relog activated*"
			gosub :switchboard~switchboard
	        setDelayTrigger 1 :didnotmakeittogame 10000
            waiton #179
        :continuerelogmessage
            gosub :PLAYER~quikstats
            gosub :relog_freeze_trigger
            if ($PLAYER~CURRENT_PROMPT = "Planet")
                send "*"
                gosub :PLANET~getPlanetInfo
                if ($PLANET~CITADEL > 0)
                    send "c "
                    setvar $switchboard~message "In citadel, planet "&$PLANET~PLANET&".*"
                    gosub :switchboard~switchboard
                    halt
                else
                    setvar $switchboard~message "On planet "&$PLANET~PLANET&".*"
                    gosub :switchboard~switchboard
                    halt
                end
            end
			if (($relog_message <> "") and ($relog_message <> "0"))
				setvar $switchboard~message $relog_message
				gosub :switchboard~switchboard
			end
            loadVar $PLANET~PLANET
            if (($PLANET~PLANET <> 0) AND ($PLAYER~CURRENT_SECTOR <> 1) AND ($PLAYER~CURRENT_SECTOR <> $MAP~stardock))
                gosub :planet~landingsub
            end
    halt

    :didnotmakeittogame
    	echo ANSI_4&"*Didn't make it into the game!  Bot will try again in about 30 seconds.*"&ANSI_15
    	halt
#============================== END ONLINE WATCH/RELOG SUB ==============================

:relog_freeze_trigger
      killtrigger unfreezingTrigger
      killtrigger unfreezingTriggerBigDelay
return





#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\bot\connectivity"
