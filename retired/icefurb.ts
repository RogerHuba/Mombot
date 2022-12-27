#
#
# Going to be a race to the 2k planets
# - Lets make the Ice Exp person call this guy
# 
#  

gosub :BOT~loadVars

loadVar $stardock

setVar $shipNum 0
setVar $ourShip 0
setVar $theBot ""
setVar $sitShip 0

setVar $BOT~help[1]  $BOT~tab&"       ICE Furb Script "
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&"       Delivers ship with Torps to traders running MOOEXP FURB ICE."
setVar $BOT~help[4]  $BOT~tab&"       Start in one trading ship at SD; other in use by person "
setVar $BOT~help[5]  $BOT~tab&"       "
setVar $BOT~help[6]  $BOT~tab&"       icefurb"
setVar $BOT~help[7] $BOT~tab&"    "
setVar $BOT~help[8] $BOT~tab&"    Please be fed safe.. or die :)"

gosub :bot~helpfile

setVar $BOT~script_title "Xmas Furb Script"
gosub :BOT~banner

gosub :player~quikstats


if ($player~ore_holds < 70)
	setVar $SWITCHBOARD~message "Please load up on fuel ore.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

setVar $startingLocation $PLAYER~CURRENT_PROMPT
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
echo "*# " $player~TWARP_TYPE

if (($player~TWARP_TYPE <> 1) and ($player~TWARP_TYPE <> 2))
	setVar $SWITCHBOARD~message "We have no t-warp.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

send "cuyq"


setVar $ourShip $player~SHIP_NUMBER
setVar $startCreds $player~CREDITS
setVar $startTruns $player~TURNS

goSub :restock

setVar $go 1
while ($go = 1)


	
	setVar $SWITCHBOARD~message "Furber: Waiting for instructions*"
	gosub :SWITCHBOARD~switchboard

	goSub :WaitingForInst
	

end



halt

:report
	goSub :player~quikstats
	setVar $credsgained ($player~CREDITS - $startCreds)
	setVar $player~turnsused ($startTruns - $player~TURNS)

	setVar $thereport "Turns: " & $player~turnsused & " Creds Pickedup: " &  $credsgained & "*" 
	setVar $SWITCHBOARD~message $thereport
	gosub :SWITCHBOARD~switchboard
return

:WaitingForInst
	
	# # BOT_NAME - MOOSHIP - EXPLORESHIP CURRENTSECTOR

	:topofwait
	setTextTrigger waitFurb :waitFurb "MooTime@"
	
	pause
	
	:waitFurb
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

		gosub :orderUp
return

:orderup
	setVar $moveSec $theirSector
	gosub :moveToSector 
	gosub :getCreds
	send "x " $theirExpShip "*q"
	gosub :switchShip
	
	send "'" $theirBot " x " $ourship "*"
	gosub :corpSwitchShip

	send "x" $theirMooShip "*q"
	gosub :switchShip
	
	setVar $moveSec $stardock
	gosub :moveToSector 
	gosub :restock
	gosub :report
	setVar $ourship $theirMooShip
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






:corpSwitchShip
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

:restock

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
	
		gosub :player~twarpSector
	
return

:warpToSector
	
	send "m" $moveSec "**"
	add $player~turnsused 2
	waitFor "Warps to Sector"
return

:tWarptoSector

	:startWarpMove

	send "m" $moveSec "*y"
	add $player~turnsused 2
	setTextLineTrigger warpEngagedYes :warpEngagedYes "Locating beam pinpointed, TransWarp"
	setTextLineTrigger warpEngagedNo :warpEngagedNo "You do not have enough Fuel Ore to make the jump."
	setTextLineTrigger warpEngagedNoLock :warpEngagedNoLock "No locating beam found for sector"
	pause

	:warpEngagedNoLock
		killalltriggers
		send "n"
		echo "*####################"
		echo "*# Issues!! waiting for next but this could mean we are under attack or trader needs to drop a ftr"
		waitfor "NEXT@"
		killalltriggers
		
	:warpEngagedNo
		killalltriggers
		echo "*####################"
		echo "*# Sack the furber, no fuel. Waiting for NEXT @ minus the space to try again."
		waitfor "NEXT@"
		goto :startWarpMove

	:warpEngagedYes
		send "y"
		waitFor "ansWarp Drive Engaged!"
		
		killalltriggers
		waitFor "Warps to Sector"

return

halt


include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\twarp\player"
