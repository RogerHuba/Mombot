:shipsell
 #must run quikstats before calling this 

	if ($player~CURRENT_SECTOR <> STARDOCK)
		setvar $switchboard~message "Must be at StarDock, Ported or in Sector!*"
		gosub :switchboard~switchboard
		halt
	end

	setVar $i 0
	setVar $startingLocation $player~CURRENT_PROMPT
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
setVar $CASH $player~CREDITS
setVar $inc 0
send "|S|"
waitfor "-------------------------------------------"
setTextlineTrigger  NoShip  :ShipSellDone   "You do not own any other ships orbiting the Stardock!"
setTextTrigger      Done    :Done           "Choose which ship to sell (Q=Quit)"
setTextLineTrigger  Line    :Line
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
setTextLineTrigger  Line    :Line
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
		setVar $CashAmount ($player~CREDITS - $CASH)
		gosub :CommaSize
		send "'{" $bot~bot_name "} - You sold " $inc " ships. You made $" $CashAmount " credits.*"
		waitfor "Message sent on sub-space channel"

	elseif ($inc < 1)
		send "'{" $bot~bot_name "} - No Ships to Sell.*"
		waitfor "Message sent on sub-space channel"

	end
	return
# ============================== END SellShip (sellship) Sub ==============================
halt
