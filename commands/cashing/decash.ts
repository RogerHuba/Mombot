	gosub :BOT~loadVars
		
	setVar $BOT~help[1] $BOT~tab&"Attempts to take credits off of a corp member in sector."
	gosub :bot~helpfile

	gosub :PLAYER~quikstats
	setVar $BOT~validPrompts "Command"
	gosub :BOT~checkStartingPrompt
	setVar $startingLocation $player~CURRENT_PROMPT

	getWordPos $bot~user_command_line $pos #34
	if ($pos > 0)
		getText $bot~user_command_line $trader_name #34 #34
		if ($trader_name = false)
			setVar $SWITCHBOARD~message "Trader name entered wrong.*"
			gosub :SWITCHBOARD~switchboard
			halt			
		end
	else
        isNumber $test $bot~parm1
        if (($test = TRUE) and ($bot~parm1 <> "0"))
            setVar $cash_to_grab $bot~parm1
    		setvar $trader_name $bot~parm2
        else
    		setvar $trader_name $bot~parm1
            isNumber $test $bot~parm2
            if (($test = TRUE) and ($bot~parm2 <> "0"))
                setVar $cash_to_grab $bot~parm2
            end
        end
	end

    if ($cash_to_grab <> "0")
        getWordPos $bot~user_command_line $pos "cash:"
        if ($pos > 0)
            getText " "&$bot~user_command_line&" " $cash_to_grab "cash:" " "
        else
            setVar $cash_to_grab 500000
        end
    end

    if ($trader_name = "0")
        setvar $trader_name ""
    end

 		send "t"
        waiton "Corporate command ["
        send "c"
		setTextTrigger		THERE		:THERE		"Exchange with"&$trader_name
		setTextLineTrigger	NOTTHERE	:NOTTHERE	"Your Associate must be in the same sector to conduct transfers!"
        settexttrigger      noone       :notthere   "Corporate command ["
        setdelaytrigger     toolong     :tryanother   1000
		pause
        :tryanother
            setdelaytrigger     toolong     :tryanother   1000
            send "*"
            pause
		:THERE
		send "YF"
		waitfor "credits, and"
		getText CurrentLine $decash_target "credits, and " " has "
		getText CurrentLine $DECASH " has " "."
		stripText $DECASH ","
		stripText $DECASH " "
		if ($DECASH > 500000)
			setVar $DECASH ($DECASH - 500000)
			send $DECASH & "*"
		else
			setVar $DECASH 0
			send "*"
		end
		:NOTTHERE
		killAllTriggers
		send "   * *    "
        # You have 1,979,499 credits, and Galaga has 99,175. #
        setvar $switchboard~message "Took "&$decash&" credits from "&$decash_target&".*"
        gosub :switchboard~switchboard

halt

# includes:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\checkstartingprompt\bot"
