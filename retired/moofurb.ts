# Let's add multiple modes
#  - Exchange Furb (efurb) - sit on planet and person swaps ships with you - you then restock 
#  - Tow Furb (tfurb) - you twarp a ship to them and xport out to dock (if in range) else tow
#       will require 3 ships. 
#  - Ice furb (furb)   - This mode (ice specific) - Moo Person warps around in explore ship
#                        when they find a target. They xport to their moo ship and trade.
#                        when they run out of torps you twarp to them, xport to their exp ship
#                        and they swap moo ships, you take the other back and furb

gosub :BOT~loadVars

loadVar $stardock

setVar $shipNum 0
setVar $ourShip 0
setVar $theBot ""
setVar $sitShip 0

setVar $BOT~help[1]  $BOT~tab&"       moofurb [efurb/tfurb/icefurb] {nofigs}"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&"   [efurb] - Citadel Exchange Furb"
setVar $BOT~help[4]  $BOT~tab&"   [tfurb] - Tow furb - Send ship required"
setVar $BOT~help[5]  $BOT~tab&"             >moofurb tfurb 2ndship"
setVar $BOT~help[6]  $BOT~tab&"   [xfurb] - You xport into ship, furb and xport out"
setVar $BOT~help[7]  $BOT~tab&" [icefurb] - Furber for ICE tournament"
setVar $BOT~help[8]  $BOT~tab&"        "
setVar $BOT~help[9]  $BOT~tab&"  {nofigs} - Don't restock fighters"
setVar $BOT~help[10]  $BOT~tab&"        "
setVar $BOT~help[11]  $BOT~tab&"        All modees deliver torps/atomics to traders running"
setVar $BOT~help[12]  $BOT~tab&"        a moo script. You need to be fed safe."




gosub :bot~helpfile

setVar $BOT~script_title "Moo Furb Script"
gosub :BOT~banner

gosub :player~quikstats
setVar $startingLocation $PLAYER~CURRENT_PROMPT
setVar $modestring $bot~parm1


setVar $startMsg ""

if ($modestring = "efurb")
	
	if (($player~TWARP_TYPE <> 1) and ($player~TWARP_TYPE <> 2))
		setVar $SWITCHBOARD~message "We have no t-warp.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($player~ALIGNMENT < 1000)
		setVar $SWITCHBOARD~message "You're just not good enough for this script (alignment).*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($player~photons > 0)
		setVar $SWITCHBOARD~message "You can't have photons on your ship.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "Must be started from Citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	
	send "q"
	goSub :planet~getPlanetInfo
	send "t n l2  * * * t n l 3 * *t n t 1 * m n t * * "
	send "c"
	setVar $efurbPlanet $planet~planet
	setVar $efurbSector $player~CURRENT_SECTOR
	setVar $startMsg $startMsg & "Exchange Furb Active - Will trigger of ship exchange*"	

elseif ($modestring = "xfurb")
	
	if (($player~TWARP_TYPE <> 1) and ($player~TWARP_TYPE <> 2))
		setVar $SWITCHBOARD~message "We have no t-warp.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($player~ALIGNMENT < 1000)
		setVar $SWITCHBOARD~message "You're just not good enough for this script (alignment).*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($player~photons > 0)
		setVar $SWITCHBOARD~message "You can't have photons on your ship.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "Must be started from Citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	setVar $shipTwo $bot~parm2
	
	isNumber $test $shipTwo
	if ($test = 0)
		setVar $SWITCHBOARD~message "The ship to furb must be a number*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $ourShip $player~SHIP_NUMBER
	
	setVar $startMsg $startMsg & "XFurb command in action.*"	

elseif ($modestring = "sxfurb")

	
	if ($startingLocation <> "Command")
		setVar $SWITCHBOARD~message "Must be started from Command prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($player~ALIGNMENT < 1000)
		setVar $SWITCHBOARD~message "You're just not good enough for this script (alignment).*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if (CURRENTSECTOR <> $stardock)
		setVar $SWITCHBOARD~message "Please start at StarDock.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	setVar $ourShip $player~SHIP_NUMBER
	
	setVar $shipTwo $bot~parm2
	
	isNumber $test $shipTwo
	if ($test = 0)
		setVar $SWITCHBOARD~message "The ship to furb must be a number*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	send "w** "
	
	setVar $startscan 0
	setVar $shipFound 0
	settextlinetrigger sxship2found2nd :sxship2found2nd " " & $shipTwo & " "
	setTextLineTrigger sxship2startscan :sxship2startscan "Ship  Sect Name"
	settextlinetrigger sxship2nomore :sxship2nomore "Choose which ship to tow (Q=Quit)"
	settextlinetrigger sxship2nomore2 :sxship2nomore "You do not own any other ships in this sector!"
	pause
	:sxship2startscan
		setVAr $startscan 1
		pause
	:sxship2found2nd
		if ($startscan = 1)
			getword currentline $shipnumber 1
			
			if ($shipnumber = $shipTwo)
				setVar $shipFound 1
			else
				settextlinetrigger sxship2found2nd :sxship2found2nd " " & $shipTwo & " "
				pause
			end
		end
	:sxship2nomore
		killalltriggers

		if ($shipFound = 0)
			setVar $SWITCHBOARD~message "Could not find your second ship.*"
			gosub :switchboard~switchboard
			HALT
		end
		

	setVar $startMsg $startMsg & "SXFurb Command In Action.*"	
elseif ($modestring = "icefurb")
	if ($player~ore_holds < 70)
		setVar $SWITCHBOARD~message "Please load up on fuel ore.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end


	if ($startingLocation <> "Command")
		setVar $SWITCHBOARD~message "Must be started from Command prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($player~ALIGNMENT < 1000)
		setVar $SWITCHBOARD~message "You're just not good enough for this script (alignment).*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if (CURRENTSECTOR <> $stardock)
		setVar $SWITCHBOARD~message "Please start at StarDock.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if (($player~TWARP_TYPE <> 1) and ($player~TWARP_TYPE <> 2))
		setVar $SWITCHBOARD~message "We have no t-warp.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $ourShip $player~SHIP_NUMBER
elseif ($modestring  = "tfurb")
	setVar $shipTwo $bot~parm2
	setVar $ourShip $player~SHIP_NUMBER

	isNumber $test $shipTwo
	if ($test = 0)
		setVar $SWITCHBOARD~message "Tow Furb ship not specified >moofurb tfurb 9  where 9 is shipnum of spare ship at dock*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($player~ore_holds < 70)
		setVar $SWITCHBOARD~message "Please load up on fuel ore.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end


	if ($startingLocation <> "Command")
		setVar $SWITCHBOARD~message "Must be started from Command prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($player~ALIGNMENT < 1000)
		setVar $SWITCHBOARD~message "You're just not good enough for this script (alignment).*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if (CURRENTSECTOR <> $stardock)
		setVar $SWITCHBOARD~message "Please start at StarDock.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if (($player~TWARP_TYPE <> 1) and ($player~TWARP_TYPE <> 2))
		setVar $SWITCHBOARD~message "We have no t-warp.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	send "w** "
	
	setVar $startscan 0
	setVar $shipFound 0
	settextlinetrigger cshipfound2nd :cshipfound2nd " " & $shipTwo & " "
	setTextLineTrigger cshipstartscan :cshipstartscan "Ship  Sect Name"
	settextlinetrigger cshipnomore :cshipnomore "Choose which ship to tow (Q=Quit)"
	settextlinetrigger cshipnomore2 :cshipnomore "You do not own any other ships in this sector!"
	pause
	:cshipstartscan
		setVAr $startscan 1
		pause
	:cshipfound2nd
		if ($startscan = 1)
			getword currentline $shipnumber 1
			
			if ($shipnumber = $shipTwo)
				setVar $shipFound 1
			else
				settextlinetrigger cshipfound2nd :cshipfound2nd " " & $shipTwo & " "
				pause
			end
		end
	:cshipnomore
		killalltriggers

		if ($shipFound = 0)
			setVar $SWITCHBOARD~message "Could not find your second ship.*"
			gosub :switchboard~switchboard
			HALT
		end
		

	
else
	setVar $SWITCHBOARD~message "No furb mode specified.. halting*"
	gosub :SWITCHBOARD~switchboard
	halt
end



setVar $restockFigs 1
getWordPos $bot~user_command_line $pos "nofigs"
if ($pos > 0)
	setVar $restockFigs FALSE
	setvar $startMsg $startMsg & "We are NOT restocking fighters.*"

end


if ($modestring <> "xfurb")
	setVar $SWITCHBOARD~message $startMsg
	gosub :SWITCHBOARD~switchboard	
end	

send "cuyq"
send "tt1*** "
setVar $startCreds $player~CREDITS
setVar $startTruns $player~TURNS

if ($modestring  = "efurb")
	goSub :efurb_furbLoop

elseif ($modestring  = "tfurb")
	goSub :tfurb_restock
	goSub :tfurb_furbloop

elseif ($modestring = "xfurb")
	goSub :xfurb_doit
elseif ($modestring  = "icefurb")
	goSub :ice_restock
	goSub :ice_furbloop
elseif ($modestring  = "sxfurb")
	goSub :sxfurb_restock
	goSub :sxfurb_furbloop
else
	setVar $SWITCHBOARD~message "No furb mode specified.. halting*"
	gosub :SWITCHBOARD~switchboard
	halt
end

halt

:xfurb_doit
//$ourShip
	setVar $bwarpok 1
	send "q"
	goSub :planet~getPlanetInfo
	send "q x j " $shipTwo "* q * l" $planet~planet "*"
	send "t n l2  * * * t n l 3 * *t n t 1 * m n t * * "
	send "c"
	gosub :player~quikstats
	if ($ourShip = $player~SHIP_NUMBER)
		setVar $SWITCHBOARD~message "Failed to switch ships and furb.*"
		gosub :SWITCHBOARD~switchboard
		halt
	else
		setVar $theirship $player~SHIP_NUMBER
	end

	setVar $efurbPlanet $planet~planet
	setVar $efurbSector $player~CURRENT_SECTOR

	goSub :efurb_restock

	send "q q x j " $ourShip "* q * l" $planet~planet "* c "
	gosub :player~quikstats
	if ($ourShip <> $player~SHIP_NUMBER)
		setVar $SWITCHBOARD~message "Failed to switch ships after furb.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
return


:tfurb_furbloop
	setVar $go 1
	while ($go = 1)
		 
		setVar $SWITCHBOARD~message "Furber: Waiting for instructions*"
		gosub :SWITCHBOARD~switchboard
		goSub :player~quikstats
		goSub :tfurb_WaitingForInst
		goSub :tfurb_restock

	end

return


:ice_furbLoop
	setVar $go 1
	while ($go = 1)
		 
		setVar $SWITCHBOARD~message "Furber: Waiting for instructions*"
		gosub :SWITCHBOARD~switchboard
		goSub :player~quikstats
		goSub :ice_WaitingForInst
		

	end

return


:sxfurb_furbLoop
	setVar $go 1
	while ($go = 1)
		 
		setVar $SWITCHBOARD~message "Furber: Waiting for instructions*"
		gosub :SWITCHBOARD~switchboard
		goSub :player~quikstats
		goSub :sxfurb_WaitingForInst
		

	end

return

:efurb_furbLoop
	
	setVar $bwarpok 1
	goSub :player~quikstats
	if ($player~GENESIS = 0) or ($player~ATOMIC = 0)
		goSub :efurb_restock
	end
	
	setVar $go 1
	while ($go = 1)
		 
		setVar $SWITCHBOARD~message "Furber: waiting for ship trade to trigger.*"
		gosub :SWITCHBOARD~switchboard
		goSub :player~quikstats
		setTextLineTrigger efurb_trigger :efurb_trigger " I traded ships with you!"
		pause
		:efurb_trigger
			killalltriggers
			goSub :efurb_restock

	end
	halt

return


:report
	goSub :player~quikstats
	setVar $credsgained ($player~CREDITS - $startCreds)
	setVar $player~turnsused ($startTruns - $player~TURNS)

	setVar $thereport "Turns: " & $player~turnsused & " Creds Pickedup: " &  $credsgained & "*" 
	setVar $SWITCHBOARD~message $thereport
	gosub :SWITCHBOARD~switchboard
return


:getCreds
	
	#You have 31,034 credits, and The Bounty Hunter has 2,025,862.
	send "tcyf"
	waitfor "nsfer To or Fro"
	waitfor "credits, and"

	getWordPos CURRENTLINE $has "has "
	add $has 4
	cutText CURRENTLINE $creds $has 99
	
	striptext $creds ","
	striptext $creds "."
	send $creds "*cyt150000*q"

	add $credsTaken $creds
	subtract $credsTaken 150000
	# Leave him wiht some walk around money
	waitfor "Command ["
return

:corpMateSwitchShip
	# We are requesting they switch ships
	setTextLineTrigger corpSwitch1 :corpSwitch1 "Xport complete."
	setTextLineTrigger corpswitch2 :corpswitch2 "Cannot xport to that ship!"
	setTextLineTrigger corpswitch3 :corpswitch3 "That ship is out of range."
	
	pause

	:corpSwitch1
		killalltriggers
		
		return

	:corpswitch2
	:corpswitch3
		killalltriggers
		setvar $switchboard~message "Ship not available; ermergency?????*"
		gosub :switchboard~switchboard
		halt

return

:switchShip

	setTextLineTrigger switch1 :switch1 "Security code accepted, engaging"
	setTextLineTrigger switch2 :switch2 "only has a transport range"
	setTextLineTrigger switch3 :switch3 "That is not an available ship"
	
	pause

	:switch1
		killalltriggers
		
		return

	:switch2
	:switch3
		killalltriggers
		setvar $switchboard~message "Ship not available; ermergency?????*"
		gosub :switchboard~switchboard
		halt


return

:tfurb_restock

	send "x*" $shiptwo "*q * "
	goSub :standard_restock
	gosub :player~quikstats
	send "x*" $ourShip "*q * "
	gosub :player~quikstats
	send "wn" $shipTwo "*"
return

:efurb_restock

	goSub :player~quikstats
	setVar $returnSector $player~CURRENT_SECTOR
	send "qtnt1*c"
	waitfor "<Enter Citadel>"

	gosub :dep~run
	setVar $with~amount 10000000
	gosub :with~run
	setVar $PLAYER~warpto STARDOCK
	if ($bwarpok = 1)
		gosub :player~bwarp
	else
		send "q q "
		waitfor "] (?=Help)?"
		gosub :player~twarp
	end
	goSub :player~quikstats
	if ($player~current_sector = $returnSector)
		setVar $bwarpok 0
		setvar $switchboard~message "Bwarp didn't make it to dock, switching to twarp.*"
		gosub :switchboard~switchboard
		send "q q " 
		waitfor "] (?=Help)?"
		gosub :player~twarp
	end

	goSub :standard_restock

	goSub :efurb_returnandland
return

:standard_restock
	
	send "psh"
	setTextLineTrigger efurb_limp :efurb_limp "A port official runs up to you as you dock"
	setTextLineTrigger efurb_hardware :efurb_hardware "Welcome to the Emporium!"
	setTextTrigger efurb_sdgone :efurb_sdgone "Captain! Are you sure you want to port here?"
	pause
	:efurb_sdgone
		killalltriggers
		send "n * * "
		setvar $switchboard~message "Stardock is gone! Probably Sando again.*"
		gosub :switchboard~switchboard
		goSub :efurb_returnandland
		halt
		
	:efurb_limp
		killalltriggers
		send "yh"
	:efurb_hardware
		killalltriggers
	
	send "t"
	setTextTrigger efurb_shipCheckBuyTorps :efurb_shipCheckBuyTorps "How many Genesis Torpedoes do you want"
	pause
	:efurb_shipCheckBuyTorps
		killalltriggers
		getWord CURRENTLINE $TorpssAvail 9
		stripText $TorpssAvail ")"
		send $TorpssAvail "*"
	send "a"
	setTextTrigger efurb_shipCheckBuyAtomics :efurb_shipCheckBuyAtomics "How many Atomic Detonators do you want"
	pause
	:efurb_shipCheckBuyAtomics
		killalltriggers
		getWord CURRENTLINE $player~atomicssAvail 9
		stripText $player~atomicssAvail ")"
		if ($player~atomicssAvail = 0)
			send "*"
		else
			send  "*a" $player~atomicssAvail "*"
		end
	
	
	gosub :player~quikstats
	send "qsp"

	setTextTrigger efurb_refurbFigPricet :efurb_refurbFigPricet "credits per fighter"
	:efurb_checkShields
	setTextTrigger efurb_refurbShields :efurb_refurbShields "Shield Points"
	pause
	:efurb_refurbFigPricet
		killalltriggers
		if ($restockFigs = TRUE)
			getWord CURRENTLINE $figPrice 4
			getWord CURRENTLINE $canBuy 8
			setVar $figsToBuy $player~credits
			subtract $figsToBuy 250000
			divide $figsToBuy $figPrice
			
			if ($figsToBuy > $canBuy)
				setVar $figsToBuy $canBuy
			end
			send "b" $figsToBuy "*"
		end
		goto :efurb_checkShields
	:efurb_refurbShields
		killalltriggers
		getWord CURRENTLINE $shieldPrice 5
		getWord CURRENTLINE $canBuy 9
		setVar $player~shieldsToBuy $player~credits
		subtract $player~shieldsToBuy 250000
		divide $player~shieldsToBuy $shieldPrice
		
		if ($player~shieldsToBuy > $canBuy)
			setVar $player~shieldsToBuy $canBuy
		end
		send "c" $player~shieldsToBuy "*"
	gosub :player~quikstats
	setVar $postFurbFigs $player~fighters	
	send "qqq    *   "	
return

:efurb_returnandland

	setVar $player~warpto $efurbSector
	gosub :player~twarp
	gosub :player~quikstats
	if ($player~current_sector = $returnSector)
		send "l" $efurbPlanet "*c"
		setTextLineTrigger efurb_returnsuccess :efurb_returnsuccess "<Enter Citadel>"
		setDelayTrigger efurb_returnFail :efurb_returnFail 8000
		pause
		:efurb_returnFail
			killalltriggers
			setVar $SWITCHBOARD~message "Furb failed to find the planet on return.. halting*"
			gosub :SWITCHBOARD~switchboard
			halt
		:efurb_returnsuccess
			killalltriggers
			return
	else
		send "p s h "
		setVar $SWITCHBOARD~message "Failed to return back from Stardock on efurb/xfurb - landing on dock and halting.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
return

:tfurb_WaitingForInst

	
	setTextTrigger waitTFurb :waitTFurb "MooTime@"
	
	pause
	
	:waitTFurb
		killalltriggers
		setVar $SWITCHBOARD~message "Roger, gifts on route.*"
		gosub :SWITCHBOARD~switchboard

		getWordPos CURRENTLINE $xLoc "MooTime@"
		cutText CURRENTLINE $xmasCommand $xLoc 99
		getWord $xmasCommand $theirBot 2
		getWord $xmasCommand $theirMooShip 3
		getWord $xmasCommand $theirSector 4
	
		echo "*# $theirBot" $theirBot
		echo "*# $theirMooShip" $theirMooShip
		echo "*# $theirSector" $theirSector

		gosub :tfurb_orderUp

return

:tfurb_orderUp

	setVar $moveSec $theirSector
	gosub :moveToSector 
	goSub :player~quikstats
	if ($player~current_sector <> $theirSector)
		setVar $SWITCHBOARD~message "Twarp fail on route to Refurb.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	gosub :getCreds
	send "'" $theirBot " x " $shiptwo "*"
	gosub :corpMateSwitchShip

	send "x" $theirMooShip "*q"
	gosub :switchShip

	setVar $shiptwo $ourship
	send "wn" $shiptwo "*"

	setVar $ourShip $theirMooShip

	setVar $moveSec $stardock
	gosub :moveToSector 
	


return

:ice_WaitingForInst
	
	# # BOT_NAME - MOOSHIP - EXPLORESHIP CURRENTSECTOR


	setTextTrigger waitIceFurb :waitIceFurb "MooTime@"
	
	pause
	
	:waitIceFurb
		killalltriggers
		setVar $SWITCHBOARD~message "Roger, gifts on route.*"
		gosub :SWITCHBOARD~switchboard

		getWordPos CURRENTLINE $xLoc "MooTime@"
		cutText CURRENTLINE $xmasCommand $xLoc 99
		getWord $xmasCommand $theirBot 2
		getWord $xmasCommand $theirMooShip 3
		getWord $xmasCommand $theirExpShip 4
		getWord $xmasCommand $theirSector 5
	
		echo "*# $theirBot" $theirBot
		echo "*# $theirMooShip" $theirMooShip
		echo "*# $theirExpShip" $theirExpShip
		echo "*# $theirSector" $theirSector

		gosub :ice_orderUp
return

:ice_orderup
	setVar $moveSec $theirSector
	gosub :moveToSector 
	goSub :player~quikstats
	if ($player~current_sector <> $theirSector)
		setVar $SWITCHBOARD~message "Twarp fail on route to Refurb.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	gosub :getCreds
	send "x " $theirExpShip "*q"
	gosub :switchShip
	
	send "'" $theirBot " x " $ourship "*"
	gosub :corpMateSwitchShip

	send "x" $theirMooShip "*q"
	gosub :switchShip
	
	setVar $moveSec $stardock
	gosub :moveToSector 
	gosub :ice_restock
	gosub :report
	setVar $ourship $theirMooShip
return





:sxfurb_WaitingForInst
	
	# # BOT_NAME - MOOSHIP CURRENTSECTOR


	setTextTrigger waitSXFurb :waitSXFurb "MooTime@"
	
	pause
	
	:waitSXFurb
		killalltriggers
		

		getWordPos CURRENTLINE $xLoc "MooTime@"
		cutText CURRENTLINE $xmasCommand $xLoc 99
		getWord $xmasCommand $theirBot 2
		getWord $xmasCommand $theirMooShip 3
		#getWord $xmasCommand $theirExpShip 4
		getWord $xmasCommand $theirSector 4
		setVar $SWITCHBOARD~message "Roger "  &  $theirBot & ", gifts on route.*"
		gosub :SWITCHBOARD~switchboard
		echo "*# $theirBot" $theirBot
		echo "*# $theirMooShip" $theirMooShip
		echo "*# $theirSector" $theirSector

		gosub :SX_orderUp
return

:SX_orderup
	setVar $moveSec $theirSector
	gosub :moveToSector 
	goSub :player~quikstats
	if ($player~current_sector <> $theirSector)
		setVar $SWITCHBOARD~message "Twarp fail on route to Refurb.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	gosub :getCreds
	send "x " $shipTwo "*q"
	gosub :switchShip
	
	send "'" $theirBot " x " $ourship "*"
	gosub :corpMateSwitchShip

	send "x*" $theirMooShip "*q"
	gosub :switchShip
	
	setVar $moveSec $stardock
	gosub :moveToSector 
	gosub :sxfurb_restock
	gosub :report
	setVar $ourship $theirMooShip
return

:sxfurb_restock

	send "psht"
	add $player~turnsused 1
	setTextTrigger sxshipCheckBuyTorps :sxshipCheckBuyTorps "How many Genesis Torpedoes do you want"
	pause
	:sxshipCheckBuyTorps
		killalltriggers
		getWord CURRENTLINE $TorpssAvail 9
		stripText $TorpssAvail ")"
		add $torpsbought $TorpssAvail
		send $TorpssAvail "*"

			
	send "q"
	gosub :player~quikstats
	if (($player~SHIELDS < 1000) or ($player~FIGHTERS < 1000))
		
		send "sp"
		
		setTextTrigger sxrefurbFigPricet :sxrefurbFigPricet "credits per fighter"
		pause
		:sxrefurbFigPricet
			killalltriggers
			setVar $buyfigs (1000 - $player~FIGHTERS)
			setVar $buyshields (1000 - $player~SHIELDS)
			
			send "b" $buyfigs "*"
			send "c" $buyshields "*"
				
		send "qq"
	end
	
	send "q"
	waitfor "rn to your ship and blast off from the StarDo"
return



:ice_restock

	send "psht"
	add $player~turnsused 1
	setTextTrigger shipCheckBuyTorps :shipCheckBuyTorps "How many Genesis Torpedoes do you want"
	pause
	:shipCheckBuyTorps
		killalltriggers
		getWord CURRENTLINE $TorpssAvail 9
		stripText $TorpssAvail ")"
		add $torpsbought $TorpssAvail
		send $TorpssAvail "*"

			
	send "q"
	gosub :player~quikstats
	if (($player~SHIELDS < 1000) or ($player~FIGHTERS < 1000))
		
		send "sp"
		
		setTextTrigger refurbFigPricet :refurbFigPricet "credits per fighter"
		pause
		:refurbFigPricet
			killalltriggers
			setVar $buyfigs (2000 - $player~FIGHTERS)
			setVar $buyshields (1000 - $player~SHIELDS)
			
			send "b" $buyfigs "*"
			send "c" $buyshields "*"
				
		send "qq"
	end
	
	send "q"
	waitfor "rn to your ship and blast off from the StarDo"
return


:moveToSector
		setVar $player~warpto $movesec
		gosub :player~twarp

return

:warpToSector
	
	send "m" $moveSec "**"
	add $player~turnsused 2
	waitFor "Warps to Sector"
return

halt


include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\planet\loadplanetinfo\planet"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\external\dep"
include "source\bot_includes\external\with"
include "source\bot_includes\player\bwarp\player"