	gosub :BOT~loadVars

	setVar $BOT~help[1]   $BOT~tab&"  sellship   "
	setVar $BOT~help[2]   $BOT~tab&"  "
	setVar $BOT~help[3]   $BOT~tab&"     Sells all the ships at dock it can "
	gosub :BOT~help_file

# ============================== Start SellShip (sellship) Sub ==============================
:sellship
:shipsell
	KillAllTriggers
	gosub :player~quikstats

	if ($player~current_sector <> STARDOCK)
      	setvar $switchboard~message "Must be at StarDock, Ported or in Sector!*"
      	gosub :switchboard~switchboard
		halt
	end

	setVar $i 0
	setVar $startingLocation $player~current_prompt
	stripText $startingLocation ">"
	stripText $startingLocation "<"
	if (($startingLocation <> "Command") and ($startingLocation <> "StarDock") and ($startingLocation <> "Shipyards"))
      	setvar $switchboard~message "Ship Sell must be run from Command, Stardock or Shipyard prompt.*"
		gosub :switchboard~switchboard

		halt
	end
	if ($startingLocation = "Command")
		send "p ss ys *"
	elseif ($startingLocation = "StarDock")
		send "s"
	elseif ($startingLocation = "Shipyard")
		goto :StartSell
	end

:StartShipSell
setVar $CASH $player~credits
setVar $inc 0
send "|S|"
waitfor "-------------------------------------------"
setTextlineTrigger	NoShip	:ShipSellDone	"You do not own any other ships orbiting the Stardock!"
setTextTrigger		Done	:Done			"Choose which ship to sell (Q=Quit)"
setTextLineTrigger	Line	:Line
pause
:Line
getWord CURRENTLINE $i 1
isNumber $tst $i
if ($tst)
	if ($i <> 0)
		add $inc 1
    	setVar $Selling[$inc] $i
	end
end
setTextLineTrigger	Line	:Line
pause
:Done
killAllTriggers
send "  Q  "
setVar $i 1
if ($inc <> 0)
	while ($i <= $inc)
		send " S  " & $Selling[$i] & "* Y  "
		waiton "You have "
		add $i 1
	end
end

:ShipSellDone
	killalltriggers
	if ($inc > 0)
		gosub :player~quikstats
		setVar $CashAmount ($player~credits - $CASH)
		gosub :CommaSize
		setvar $switchboard~message "You sold "&$inc&" ships. You made $"&$CashAmount&" credits.*"
		gosub :switchboard~switchboard
		halt
	elseif ($inc < 1)
		setvar $switchboard~message "No Ships to Sell.*"
		gosub :switchboard~switchboard
		halt
	end
# ============================== END SellShip (sellship) Sub ==============================



:CommaSize
	If ($CashAmount < 1000)
		#do nothing
	ElseIf ($CashAmount < 1000000)
    	getLength $CashAmount $len
		SetVar $len ($len - 3)
		cutText $CashAmount $tmp 1 $len
		cutText $CashAMount $tmp1 ($len + 1) 999
		SetVar $tmp $tmp & "," & $tmp1
		SetVar $CashAmount $tmp
	ElseIf ($CashAmount <= 999999999)
		getLength $CashAmount $len
		SetVar $len ($len - 6)
		cutText $CashAmount $tmp 1 $len
		SetVar $tmp $tmp & ","
		cutText $CashAmount $tmp1 ($len + 1) 3
		SetVar $tmp $tmp & $tmp1 & ","
		cutText $CashAmount $tmp1 ($len + 4) 999
		SetVar $tmp $tmp & $tmp1
		SetVar $CashAmount $tmp
	end
return

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
