	gosub :BOT~loadVars
	

    setVar $BOT~help[1]    $BOT~tab&"  decash {cash:#} {"&#34&"trader name"&#34&"}   "
	setVar $BOT~help[2]    $BOT~tab&"      "
	setVar $BOT~help[3]    $BOT~tab&"       {cash:#} - amount to leave on the trader "
	setVar $BOT~help[4]    $BOT~tab&"{"&#34&"trader name"&#34&"} - trader to decash  "
	setVar $BOT~help[5]    $BOT~tab&"      "
	setVar $BOT~help[6]    $BOT~tab&"     Examples:                     "
	setVar $BOT~help[7]    $BOT~tab&"                                   "
	setVar $BOT~help[8]    $BOT~tab&"           >decash                 "
	setVar $BOT~help[9]    $BOT~tab&"           >decash 100k            "
	setVar $BOT~help[10]   $BOT~tab&"           >decash 100k mind       "
	setVar $BOT~help[11]   $BOT~tab&"           >decash 100k "&#34&"mind dagger"&#34&"  "
	setVar $BOT~help[12]   $BOT~tab&"                 "
	setVar $BOT~help[13]   $BOT~tab&"  Defaults are 500k and first corp member in sector "
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
            setVar $cash_to_leave $bot~parm1
    		setvar $trader_name $bot~parm2
        else
    		setvar $trader_name $bot~parm1
            isNumber $test $bot~parm2
            if (($test = TRUE) and ($bot~parm2 <> "0"))
                setVar $cash_to_leave $bot~parm2
            end
        end
	end

    if ($cash_to_leave = "0")
        getWordPos $bot~user_command_line $pos "cash:"
        if ($pos > 0)
            getText " "&$bot~user_command_line&" " $cash_to_leave "cash:" " "
        else
            setVar $cash_to_leave 500000
        end
    end

    if ($trader_name = "0")
        setvar $trader_name ""
    end

        setvar $found_cash false
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
        setvar $found_cash true
		send "YF"
		waitfor "credits, and"
		getText CurrentLine $decash_target "credits, and " " has "
		getText CurrentLine $DECASH " has " "."
		stripText $DECASH ","
		stripText $DECASH "."
		stripText $DECASH " "
		if ($DECASH > $cash_to_leave)
			setVar $DECASH ($DECASH - $cash_to_leave)
			send $DECASH & "*"
		else
			setVar $DECASH 0
			send "*"
		end
		:NOTTHERE
		killAllTriggers
		send "   * *    "
        if ($found_cash = true)
            setvar $switchboard~message "Took "&$decash&" credits from "&$decash_target&".*"
        else
            setvar $switchboard~message "Couldn't find a trader to grab cash from in this sector.  Wrong name?*"
        end
        gosub :switchboard~switchboard
halt

# includes:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\checkstartingprompt\bot"
