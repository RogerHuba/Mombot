	gosub :BOT~loadVars
	gosub :combat~init 


	setVar $BOT~help[1]  $BOT~tab&"Attackdog will attempt to reach and kill any "
	setVar $BOT~help[2]  $BOT~tab&"opponent it sees in a holoscan on subspace."
	setVar $BOT~help[3]  $BOT~tab&"    "
	gosub :bot~helpfile

	setVar $BOT~script_title "Attack Dog"
	gosub :BOT~banner

	setVar $PLAYER~save TRUE


	if ($bot~parm1 = "off")
		setVar $SWITCHBOARD~message "Attack dog shutting down.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	gosub :PLAYER~getInfo

	setvar $starting_prompt $player~current_prompt
	setvar $starting_sector $player~current_sector

	if (($PLAYER~current_prompt <> "Command") and ($PLAYER~current_prompt <> "Citadel"))
		setVar $SWITCHBOARD~message "Must run attack dog from command or citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($starting_prompt = "Citadel")
		gosub :planetStats
	else
		send "*"
	end
	
	gosub :PLAYER~quikstats
	gosub :ship~getshipstats

	
	setTextTrigger need_ig :ig_was_off "Your Interdictor generator is now OFF"
	setTextTrigger skip_ig :skipig "is not equipped with an Interdictor Generator!"
	send "b"
	waitOn "Do you wish to change it? (Y/N)"
	send "*"
	setVar $SWITCHBOARD~message "Ship IG is already on.*"
	gosub :SWITCHBOARD~switchboard

	goto :skipig

	:ig_was_off
		send "y"
		setVar $SWITCHBOARD~message "Turning on ship IG.*"
		gosub :SWITCHBOARD~switchboard

	:skipig
	killalltriggers
	setvar $ig false

	# making ship corporate #
	send "co*cqq* "

	if ((PORT.BUYFUEL[$player~current_sector] <> true) and (PORT.EXISTS[$player~current_sector] = true))
		#buying fuel from port if possible#
		send "pt*** "
		gosub :player~quikstats
	end

	:pickupfighters
		setVar $BOT~command "topoff"
		setVar $BOT~user_command_line " topoff "
		setVar $BOT~parm1 ""
		saveVar $BOT~parm1
		saveVar $BOT~command
		saveVar $BOT~user_command_line
		load "scripts\mombot\commands\general\topoff.cts"
		setEventTrigger		topoffdone		:topoffdone "SCRIPT STOPPED" "scripts\mombot\commands\general\topoff.cts"
		pause
		:topoffdone


	goto :attack_dog_functions	
	halt


:attack_dog_functions
	killalltriggers
	gosub :player~quikstats

	# -=-=-=-=-=-=-=-=-=-=-=-=-| Holo Scan |-=-=-=-=-=-=-=-=-=-=-=-=-
	#
	#  Sector  : 650 in uncharted space.
	#  Ports   : Faisal Minor, Class 5 (SBS)
	#  Fighters: 1 (belong to your Corp) [Defensive]
	#
	#  Sector  : 5818 in uncharted space.
	#  Ports   : Muse Primus, Class 7 (SSS)
	#  Fighters: 1 (belong to Corp#3, Frosty Balls) [Defensive]
	#  Traders : Robber General Solo [2], w/ 45,990 ftrs,
	#             in sitting duck (Bofors Tholian Death Trap)
	#  Photon residue detected!  Estimated duration 2 seconds.
	#
	#  Sector  : 6839 in uncharted space.
	#  Ports   : New Pingos, Class 3 (SBB)
	#
	#  Sector  : 7028 in uncharted space.
	#  Ports   : New Vega, Class 5 (SBS)
	#  Fighters: 1 (belong to your Corp) [Defensive]
	#
	#  Sector  : 9255 in uncharted space.
	#  Ports   : Nagant Outpost, Class 3 (SBB)
	#  Planets : (O) .
	#  Fighters: 1 (belong to your Corp) [Defensive]
	#  Warps To: 650 - 5818 - 6839 - 7028

	setVar $SWITCHBOARD~message "Attack dog should attack any weak target it sees in a subspace holoscan.  *Warning: This attack dog comes back home, and could bring back fleas (limpets).  So I'd set them somewhere outside your home sector.*"
	gosub :SWITCHBOARD~switchboard

	:reset_attack_dog
		killalltriggers
		gosub :player~quikstats

		if (($player~current_prompt = "Command") AND (PORT.BUYFUEL[$player~current_sector] <> true) and (PORT.EXISTS[$player~current_sector] = true))
			#buying fuel from port if possible#
			send "pt*** "
		end
		if (($player~current_prompt = "Command") and ($starting_prompt = "Citadel"))
			gosub :landOnPlanetEnterCitadel
		end

		gosub :player~quikstats

		if ($player~twarp_type = "No")
			setvar $switchboard~message "No twarp available.  Possible pod?*"
			gosub :switchboard~switchboard
			halt
		end
		if ($player~fighters <= 0)
			setvar $switchboard~message "No more fighters available.  Fill up before running.*"
			gosub :switchboard~switchboard
			halt
		end
		if ($player~ore_holds <= 10)
			setvar $switchboard~message "Fuel too low.  Fill back up before running again.*"
			gosub :switchboard~switchboard
			halt
		end
		if ($player~ore_holds < $player~total_holds)
			setvar $switchboard~message "WARNING: You have "&$player~ore_holds&" out of "&$player~total_holds&" holds of fuel.  Make sure that's enough!*"
			gosub :switchboard~switchboard
		end

		setVar $SWITCHBOARD~message "Attack dog waiting for a target.  Grrrrrr..*"
		gosub :SWITCHBOARD~switchboard

		killalltriggers
		setTextLineTrigger checkscan :checkscan "-=-| Holo Scan |-=-"
		pause

	:checkscan
		setTextLineTrigger getsector :getsector "Sector  :"
		setTextLineTrigger gettrader :gettrader "Traders :"
		pause


	:getsector
		getWord CURRENTLINE $dropSector 3
		setTextLineTrigger getsector :getsector "Sector  :"
		pause

	:gettrader
		setvar $target_trader CURRENTLINE 
	
		getText $target_trader $target_fighters ", w/ " " ftrs"
		getText $target_trader $target_corp "[" "], w/ "
		if ($target_corp = $player~corp)
			setTextLineTrigger gettrader :gettrader "Traders :"
			pause		
		end
		killtrigger getsector
		striptext $target_fighters ","
		if (($player~fighters/2) > $target_fighters)
			setVar $SWITCHBOARD~message "Ruff Ruff Ruff!  Time to kill!*"
			gosub :SWITCHBOARD~switchboard
		else
			setVar $SWITCHBOARD~message "Too big a dog for me..  Back to watching..*"
			gosub :SWITCHBOARD~switchboard
			goto :reset_attack_dog
		end
		gosub :findAdjacent
		gosub :attemptDrop
		gosub :checkForVictims
		gosub :gohome

		setVar $SWITCHBOARD~message "Did I get em?  Did I get em!?*"
		gosub :SWITCHBOARD~switchboard



		goto :reset_attack_dog



		



:gohome
	killalltriggers
	setVar $PLAYER~WARPTO $starting_sector
	gosub :PLAYER~twarp
	if (($PLAYER~twarpSuccess = FALSE) and ($player~msg <> "Already in that sector!"))
		setvar $switchboard~message "Could not make it back home with twarp. - ["&$player~msg&"]*"
		gosub :switchboard~switchboard
		halt
	end
return

:checkForVictims
	gosub :player~quikstats
	:scanit_again
	if ($player~fighters > 0)
		setvar $player~startingLocation $player~current_prompt
		gosub :sector~getSectorData
		if ($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips))
			setvar $istowed false
			gosub :combat~fastAttack
			goto :scanit_again
		elseif (($sector~emptyShipCount > $sector~myShipCount))
			setvar $istowed false
			gosub :combat~fastCapture
			goto :scanit_again
		end
	end
	gosub :setkilltriggers
	pause

	:ig_turn_it_on
		getWord CURRENTLINE $test 1
		if ($test = "F") or ($test = "R") or ($test = "P")
			setTextLineTrigger turnIGon :ig_turn_it_on " damaging your ship."
			pause
		end
		setVar $ig_mode 0
		setDelayTrigger ig_timeout :photon_ig_damage_trigger 3000
		setTextTrigger no_ig_trigger :no_ig_available "is not equipped with an Interdictor Generator!"
		setTextTrigger no_ig_beam :no_ig_beam "Beam to what sector? (U=Upgrade Q=Quit)"
		setTextTrigger no_ig_cby :no_ig_cby "ARE YOU SURE CAPTAIN? (Y/N)"
		setTextTrigger need_ig :ig_was_off "Your Interdictor generator is now OFF"
		setTextTrigger ig_fine :ig_was_on "Your Interdictor generator is now ON"
		setTextTrigger do_ig :do_ig_thing "Do you wish to change it? (Y/N)"
		send "b"
		pause

	:no_ig_available
		gosub :killigtriggers
		send "'{" $switchboard~bot_name "} - No IG available on this ship.*"
		halt

	:no_ig_beam
		gosub :killigtriggers
		send " Q "
		halt

	:no_ig_cby
		gosub :killigtriggers
		send " N "
		halt

	:ig_was_on
		setVar $ig_mode 1
		pause

	:ig_was_off
		setVar $ig_mode 0
		pause

	:do_ig_thing
		gosub :killigtriggers
		if ($ig_mode = 0)
			send "Y"
			send "'{" $switchboard~bot_name "} - IG on!*"
		else
			send "N"
			send "'{" $switchboard~bot_name "} - IG was already on.*"
		end
		gosub :setigtriggers
		pause

:killigtriggers
	killtrigger ig_timeout
	killtrigger no_ig_trigger
	killtrigger no_ig_beam
	killtrigger no_ig_cby
	killtrigger ig_was_on
	killtrigger ig_was_off
	killtrigger do_ig_thing
return

:setkilltriggers
	killtrigger liftsoff
	killtrigger warps
	killtrigger power
	killtrigger wave
	killtrigger moved
	killtrigger deffig
	killtrigger secgun
	killtrigger ig
	killtrigger planet
	killtrigger atomic
	killtrigger exits
	killtrigger enters
	setTextLineTrigger liftsoff :checkForVictims    " lifts off from "
	setTextLineTrigger 	warps 	:checkForVictims 	"warps into the sector."
	setTextLineTrigger 	power 	:checkForVictims 	"is powering up weapons systems!"
	settextlinetrigger  wave    :checkForVictims    " launches a wave of fighters at "
	settextlinetrigger  moved   :checkforvictims    " I towed you from sector "
	setTextLineTrigger 	deffig 	:checkforvictims 	"Deployed Fighters Report Sector "&$player~CURRENT_SECTOR
	setTextLineTrigger 	secgun 	:checkforvictims 	"Quasar Cannon on"
	setTextLineTrigger 	ig		:checkforvictims 	"Shipboard Computers The Interdictor Generator on"
	settextlinetrigger  planet  :checkforvictims	" launches a Genesis Torpedo into the sector!"
	settextlinetrigger  atomic  :checkforvictims    " appears from the planetary rubble."
	setTextLineTrigger 	exits 	:checkforvictims 	"exits the game."
	setTextLineTrigger 	enters 	:checkforvictims 	"enters the game."
return

:setigtriggers
	killtrigger turnIGon
	setTextLineTrigger turnIGon :ig_turn_it_on " damaging your ship."
return


:findAdjacent
	#getSectorParameter $dropSector "FIGSEC" $isFigged
	setVar $i 1
	setVar $targetSector $player~current_sector
	setVar $checkSector SECTOR.WARPS[$dropSector][$i]
	while ($checkSector > 0)
		getSectorParameter $checkSector "FIGSEC" $isFigged
		if ($isFigged = TRUE)
			setVar $targetSector $checkSector
		end
		if ($isFigged = true)
			setvar $checkSector 0
		else
			setVar $checkSector SECTOR.WARPS[$dropSector][$i]
		end
		add $i 1
	end
return

:attemptDrop
	setVar $PLAYER~WARPTO $targetSector
	gosub :PLAYER~twarp
	if (($PLAYER~twarpSuccess = FALSE) and ($player~msg <> "Already in that sector!"))
		setVar $SWITCHBOARD~message $player~msg&"*"
		gosub :SWITCHBOARD~switchboard
		goto :attack_dog_reset
	end
	gosub :player~quikstats
return

:planetStats
	send "q m * * * "
	send "*"
	waitOn "Planet #"
	getWord CURRENTLINE $planet~planet 2
	waitOn "Fighters"
	getWord CURRENTLINE $planet~planetFighters 5
	stripText $planet~planet "#"
	send "q"
return

:landOnPlanetEnterCitadel
	send "l " $planet~planet "* c"
	waitOn "<Enter Citadel>"
return

:checkForVictims
	gosub :player~quikstats
	if ($player~fighters <= 0)
		goto :goHome
	end
	:scanit_again
	setvar $player~startingLocation $player~current_prompt
	gosub :sector~getSectorData
	if ($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips))
		gosub :combat~fastAttack
		goto :scanit_again
	elseif (($sector~emptyShipCount > $sector~myShipCount))
		gosub :combat~fastCapture
		goto :scanit_again
	end
	if ($holotorp)
		setVar $BOT~command "htorp"
		setVar $BOT~user_command_line " htorp "
		setVar $BOT~parm1 ""
		saveVar $BOT~parm1
		saveVar $BOT~command
		saveVar $BOT~user_command_line
		load "scripts\mombot\commands\offense\htorp.cts"
		setEventTrigger		htorpdone		:htorpdone "SCRIPT STOPPED" "scripts\mombot\commands\offense\htorp.cts"
		pause
		:htorpdone
	end
	setvar $before_holo_kill_sector $player~current_sector
	gosub :combat~holokill
	if ($player~current_sector <> $before_holo_kill_sector)
		setVar $PLAYER~WARPTO $before_holo_kill_sector
		gosub :PLAYER~twarp
		if (($PLAYER~twarpSuccess = FALSE) and ($player~msg <> "Already in that sector!"))
			setvar $switchboard~message "Could not make it back to starting sector before holokill. - ["&$player~msg&"]*"
			gosub :switchboard~switchboard
			halt
		end
	end

return	


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\bot_includes\combat\init\combat"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\combat\holokill\combat"
