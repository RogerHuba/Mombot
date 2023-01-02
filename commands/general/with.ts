	gosub :BOT~loadVars
	setVar $BOT~script_title "Withdraw"
	setVar $BOT~script_version "1.0.0"

	setVar $BOT~help[1]  $BOT~tab&" with {cash to withdrawl}"
	setVar $BOT~help[2]  $BOT~tab&"   "
	setVar $BOT~help[3]  $BOT~tab&"  	Withdrawls cash from citadel treasury."
	setVar $BOT~help[4]  $BOT~tab&"     "
	setVar $BOT~help[5]  $BOT~tab&"     {cash to withdrawl} - Cash amount to withdraw (max is default)"
	setVar $BOT~help[6]  $BOT~tab&"                                            "
	setVar $BOT~help[7]  $BOT~tab&"     Examples:"
	setVar $BOT~help[8]  $BOT~tab&"            >with 500k"
	setVar $BOT~help[9]  $BOT~tab&"            >with 500000"
	setVar $BOT~help[10] $BOT~tab&"            >with 2m"
	setVar $BOT~help[11] $BOT~tab&"            >with 2000000"
	setVar $BOT~help[12] $BOT~tab&"            >w 500k"
	setVar $BOT~help[13] $BOT~tab&"            >w 500000"

	gosub :bot~helpfile

	gosub :BOT~banner

	setVar $PLAYER_CASH_MAX     999999999
	setVar $planet~citadel_CASH_MAX    999999999999999

	## ============================== START WITHDRAW (WITH) ==============================
	:with
	:w
		replaceText $bot~parm1 "m" "000000"
		replaceText $bot~parm1 "M" "000000"
		replaceText $bot~parm1 "k" "000"
		replaceText $bot~parm1 "K" "000"

		gosub :bankProtections
		if ($bot~parm1 = "")
			setVar $cashToTransfer $PLAYER_CASH_MAX
		else
			setVar $cashToTransfer $bot~parm1
		end
		if ($cashToTransfer > $PLAYER_CASH_MAX)
			setvar $cashToTransfer $PLAYER_CASH_MAX
		end
		send "D" 
		waitOn "Citadel treasury contains "
		getWord CURRENTLINE $planet~citadelCash 4
		stripText $planet~citadelCash ","
		stripText $planet~citadelCash "."
		if (($PLAYER~CREDITS+$cashToTransfer) > $PLAYER_CASH_MAX)
			setVar $cashToTransfer ($PLAYER_CASH_MAX-$PLAYER~CREDITS)
		end
		if ($planet~citadelCash < $cashToTransfer)
			setVar $cashToTransfer $planet~citadelCash
		end
		send "t f "&$cashToTransfer&"* "
		waiton "credits, and the Treasury"
		setvar $map~value $cashtotransfer
		gosub :map~commas
		setvar $cashtotransfer $map~value
		setVar $SWITCHBOARD~message $cashToTransfer &" credits taken from citadel.*"
		gosub :SWITCHBOARD~switchboard
		halt
	# ============================== END WITHDRAW (WITH) ==============================
	:bankProtections
		gosub :PLAYER~quikstats
		setVar $bot~validPrompts "Citadel"
		gosub :bot~checkstartingprompt
		if ($bot~parm1 = "ss")
			setVar $bot~parm1 ""
		end
		isNumber $test $bot~parm1 
		if (($test = FALSE) and ($bot~parm1 <> ""))
			setVar $SWITCHBOARD~message "Cash entered is not a number, try again.*" 
			gosub :SWITCHBOARD~switchboard
			goto :wait_for_command  
		end
	return

	# includes:
	include "source\module_includes\bot\loadvars\bot"
	include "source\module_includes\bot\helpfile\bot"
	include "source\module_includes\bot\banner\bot"
	include "source\bot_includes\player\currentprompt\player"
	include "source\bot_includes\player\quikstats\player"
	include "source\bot_includes\map\commas\map"
	include "source\module_includes\bot\checkstartingprompt\bot"
