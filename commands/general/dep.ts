	gosub :BOT~loadVars
	setVar $BOT~script_title "Deposit"
	setVar $BOT~script_version "1.0.0"

	setVar $BOT~help[1]  $BOT~tab&" dep {cash_to_deposit:n}"
	setVar $BOT~help[2]  $BOT~tab&"   "
	setVar $BOT~help[3]  $BOT~tab&"  	Deposits cash to citadel treasury."
	setVar $BOT~help[4]  $BOT~tab&"     "
	setVar $BOT~help[5]  $BOT~tab&"     {cash_to_deposit:n} - Cash amount to deposit (max is default)"
	setVar $BOT~help[6]  $BOT~tab&"                                            "
	setVar $BOT~help[7]  $BOT~tab&"     Examples:"
	setVar $BOT~help[8]  $BOT~tab&"            >dep 500k"
	setVar $BOT~help[9]  $BOT~tab&"            >dep 500000"
	setVar $BOT~help[10] $BOT~tab&"            >dep 2m"
	setVar $BOT~help[11] $BOT~tab&"            >dep 2000000"
	setVar $BOT~help[12] $BOT~tab&"            >d 500k"
	setVar $BOT~help[13] $BOT~tab&"            >d 500000"

	gosub :bot~helpfile

	gosub :BOT~banner
	setVar $PLAYER_CASH_MAX     999999999
	setVar $planet~citadel_CASH_MAX    999999999999999

	# ============================== START DEPOSIT (DEP) ==============================
	:dep
	:d
		replaceText $bot~parm1 "m" "000000"
		replaceText $bot~parm1 "M" "000000"
		replaceText $bot~parm1 "k" "000"
		replaceText $bot~parm1 "K" "000"

		gosub :bankProtections
		if ($bot~parm1 = "")
			setVar $cashToTransfer $PLAYER~CREDITS
		else
			setVar $cashToTransfer $bot~parm1
		end
		send "D"
		waitOn "Citadel treasury contains "
		getWord CURRENTLINE $planet~citadelCash 4
		stripText $planet~citadelCash ","
		stripText $planet~citadelCash "."
		if (($cashToTranfer+$planet~citadelCash) >= $planet~citadel_CASH_MAX)
			setVar $SWITCHBOARD~message "Citadel has too much cash to do transfer (how sad for you)*"
			gosub :SWITCHBOARD~switchboard
			goto :wait_for_command
		end
		send "t t "&$cashToTransfer&"* "
		waiton "credits, and the Treasury"
		setvar $map~value $cashtotransfer
		gosub :map~commas
		setvar $cashtotransfer $map~value
		setVar $SWITCHBOARD~message $cashToTransfer &" credits deposited into citadel.*"
		gosub :SWITCHBOARD~switchboard
		halt
	# ============================== END DEPOSIT (DEP) ==============================


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
			halt
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
