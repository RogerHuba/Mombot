	logging off
	#####################################
	# Main invade configuration setup #
	#####################################
	
	gosub :BOT~loadVars
	loadvar $MAP~STARDOCK
	loadvar $map~home_sector
	loadvar $SHIP~cap_file
	loadvar $game~internalAliens
	loadvar $game~internalFerrengi
	loadvar $game~limpet_cost
	loadvar $game~limpet_removal_cost
	loadvar $game~armid_cost
	loadvar $game~photon_cost
	loadvar $game~DISRUPTOR_COST


	setVar $BOT~help[1]  $BOT~tab&"invade {sector}  "
	setVar $BOT~help[2]  $BOT~tab&"             "
	setVar $BOT~help[3]  $BOT~tab&"   {sector} - sector to invade "
	setVar $BOT~help[4]  $BOT~tab&"           "
	setVar $BOT~help[5]  $BOT~tab&"        Examples: "
	setVar $BOT~help[6]  $BOT~tab&"             >invade 33 "

	gosub :bot~helpfile

	setVar $BOT~script_title "Invader"
	gosub :BOT~banner

	gosub :combat~init 

	getSectorParameter SECTORS "FIGSEC" $isFigged
	if (($MAP~stardock = 0) OR ($MAP~stardock = ""))
		setVar $SWITCHBOARD~message "Stardock is not defined.  Please define stardock variable in the bot.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($isFigged = "")
		setVar $SWITCHBOARD~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	loadvar $bot~safe_ship

	if ($bot~safe_ship = 0)
		setVar $SWITCHBOARD~message "This script requires a safe ship to be defined.*"
		gosub :SWITCHBOARD~switchboard
		halt	
	end

	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($PLAYER~current_prompt <> "Citadel")
		setVar $SWITCHBOARD~message "Must run "&$BOT~script_title&" from citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	getwordpos " "&$bot~user_command_line&" " $pos " f "
	if ($pos > 0)
		setvar $fighter true
	else
		setvar $fighter false
	end


	gosub :PLAYER~getInfo
	killalltriggers
	send "q"
	gosub :PLANET~getPlanetInfo	
	send "t*t1* m***  c "



	#######################################################################################################
	# need to add a check here to make sure no nav haz or enemy limpets in starting sector before furbing #
	#######################################################################################################

    fileExists $SHIP~cap_file_chk $SHIP~cap_file
    if ($SHIP~cap_file_chk <> TRUE)
        gosub :SHIP~getShipCapStats
    else
		gosub :ship~loadShipInfo
    end

    gosub :SHIP~getShipStats
	gosub :player~quikstats


	setvar $starting_planet $planet~planet
	setvar $starting_sector $player~current_sector
	setvar $starting_max_fig $ship~SHIP_FIGHTERS_MAX
	setvar $starting_max_shields $player~shields
	setvar $starting_ship_type $player~ship_type

	setvar $first true


	:invade
	killalltriggers
	setvar $no_damage_taken false
	if ($player~photons <= 0)
		gosub :refurb_photon
	end
	if ($player~fighters = $starting_max_fig)
		setvar $pe~destination $bot~parm1
		gosub :pe~run
		gosub :player~quikstats
		if (($player~fighters = $starting_max_fig) and ($player~shields = $starting_max_shields))
			setvar $no_damage_taken true
		end
		if ($player~ship_type <> $starting_ship_type)
			send "x    " $bot~safe_ship "*    "
			setvar $switchboard~message "I seem to have been podded entering the sector.  Check to make sure I'm okay.*"
			gosub :switchboard~switchboard
			halt
		end
		setvar $player~warpto $starting_sector
		gosub :player~twarp
		if ($player~twarpSuccess <> true)
			send "x    " $bot~safe_ship "*    *   "
			gosub :player~quikstats
			if (($player~ship_type <> $starting_ship_type) or ($player~ship_number = $bot~safe_ship))
				if ($player~ship_number = $bot~safe_ship)
					setvar $switchboard~message "I'm in the safe ship, so somehow I was podded or invading ship is stuck.*"
					gosub :switchboard~switchboard
				else
					setvar $switchboard~message "I seem to have been podded leaving the sector! *"
					gosub :switchboard~switchboard
				end
				halt
			end
		else
			send "l " $starting_planet " * n n * j m * * * j c  *  "		
		end
		if ($no_damage_taken)
			setvar $switchboard~message "No damage taken, seems like sector cannon damage is off.  Time to try a different tactic.*"
			gosub :switchboard~switchboard			
			halt
		end
		goto :invade
	else
		setvar $switchboard~message "Not enough fighters to continue.*"
		gosub :switchboard~switchboard
		halt
	end

	###########################################
	# Main information processor for invader #
	###########################################
		

	halt

:refurb_photon
	setVar $photonCashNeeded (1*$game~photon_cost)
	setVar $cashNeeded ($photonCashNeeded+$game~LIMPET_REMOVAL_COST)
	if ($cashNeeded > currentcredits)
		send "D" 
		waitOn "Citadel treasury contains "
		getWord CURRENTLINE $citadelCash 4
		stripText $citadelCash ","
		if (($citadelCash+currentcredits) < $cashNeeded)
			setvar $switchboard~message "Not enough cash ("&$cashNeeded&") for photon in treasury or on hand.*"
			gosub :switchboard~switchboard
			halt
		end
		send "t f " ($cashNeeded-currentcredits) "* "
	end

	if ($first)
		setvar $first false

		# check adj's for Dock.. if present, then we don't need a jump sector.
		setVar $i 1
		setVar $START_SECTOR currentsector
		setVar $WeAreAdjDock FALSE
		while ($i <= SECTOR.WARPCOUNT[$START_SECTOR])
			setVar $adj_start SECTOR.WARPS[$START_SECTOR][$i]
			if ($adj_start = $MAP~stardock)
				setVar $WeAreAdjDock TRUE
			end
			add $i 1
		end

		if ((currentalignment < 1000) AND ($WeAreAdjDock = FALSE))
			setVar $RED_adj 0
			gosub :FindJumpSector
			if ($RED_adj <> 0)
				setvar $switchboard~message "Jump Sector Found - Using Sector "&$RED_adj&"*"
				gosub :switchboard~switchboard
				send "*"
			else
				waitfor "Command [TL="
				setvar $switchboard~message "Cannot Find Jump Sector Adjacent Dock*"
				gosub :switchboard~switchboard
				send "*"
				halt
			end
		end


		if (currentalignment >= 1000)
			if ($WeAreAdjDock)
				send "^F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
			else
				send "^F" & $START_SECTOR & "*" & $MAP~stardock & "*F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
			end
		else
			if ($WeAreAdjDock)
				send "^F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
			else
				send "^F" & $START_SECTOR & "*" & $RED_adj & "*F" & $MAP~stardock & "*" & $START_SECTOR & "*Q/ "
			end
		end
		setTextLineTrigger noJoy :noJoy "*** Error - No route within"
		setTextTrigger cont :cont "(?="
		pause

		:noJoy
			killAllTriggers
			setvar $switchboard~message "Cannot Find Path to StarDock!*"
			gosub :switchboard~switchboard
			send "*"
			halt
		:cont
			killAllTriggers
			setDelayTrigger Latency_Delay		:Latency_Delay 500
			pause

			:Latency_Delay

			Echo "**" & ANSI_14 & "Please Stand By" & ANSI_15 & " - Calculating Distances...**"
			if ((currentalignment >= 1000) OR ($WeAreAdjDock))
				getdistance $dist1 $START_SECTOR $MAP~stardock
			else
				getdistance $dist1 $START_SECTOR $RED_adj
			end

			if ($dist1 <= 0)
				setvar $switchboard~message "Insufficient Warp Data Plotting Course to Dock*"
				gosub :switchboard~switchboard
				send "*"
				halt
			end

			getdistance $dist2 $MAP~stardock $START_SECTOR
			if ($dist2 <= 0)
				setvar $switchboard~message "Insufficient Warp Data Plotting Return Course From Dock*"
				gosub :switchboard~switchboard
				send "*"
				halt
			end
	end
		setVar $ore_req (($dist1 + $dist2) * 3)

		if ($PLAYER~ORE_HOLDS < $ore_req)
			setvar $switchboard~message "Not Enough ORE In Holds To Make Round Trip.  Needs "&$ore_req&".*"
			gosub :switchboard~switchboard
			send "*"
			halt
		end

		if ($PLAYER~TWARP_TYPE = "No")
			setvar $switchboard~message "Must Have Twarp 1 or 2*"
			gosub :switchboard~switchboard
			send "*"
			halt
		end

		if ($PLAYER~unlimitedGame = 0)
			gosub :TurnsRequired
			if ($turnsRequired > currentturns)
				setvar $switchboard~message "Not Enough Turns. "&$turnsRequired&", Required*"
				gosub :switchboard~switchboard
				send "*"
				halt
			elseif ($turnsRequired <= currentturns)
				setVar $tmp (currentturns - $turnsRequired)
				if ($tmp <= $bot~bot_turn_limit)
					setvar $switchboard~message "Proceeding Will Leave Fewer Than " & $bot~bot_turn_limit & " Turns!*"
					gosub :switchboard~switchboard
					send "*"
					halt
				end
			end
		end

	if ($first)
		send " C R " $MAP~stardock "*Q "
		setTextLineTrigger itsalive :itsalive "Items     Status  Trading % of max OnBoard"
		setTextLineTrigger nosoupforme :nosoupforme "I have no information about a port in that sector"
		pause
		:nosoupforme
			killAllTriggers
			setvar $switchboard~message "StarDock appears to have been Blown Up!*"
			gosub :switchboard~switchboard
			send "*"
			halt
		:itsalive
			killAllTriggers
			waitfor "(?="
			setVar $msg ""
	end
		if ((currentalignment >= 1000) AND ($WeAreAdjDock = FALSE))
			setVar $warpto $MAP~stardock
			gosub :DoTwarp
		elseif (($WeAreAdjDock = FALSE) AND ($RED_adj <> 0))
			setVar $warpto $RED_adj
			gosub :DoTwarp
		else
			send " m " $MAP~stardock "*  *  P  S G Y G Q "
		end
		if ($msg = "")
			waitfor "You leave the Galactic Bank."
		else
			setvar $switchboard~message "Unknown Problem Detected. Check TA!*"
			gosub :switchboard~switchboard
			send "*"
			halt
		end
		send "h P 1* Q Q Q Q Z N M " $START_SECTOR "* Y  Y  Y  * L Z"  #8  $starting_planet  "* p  s  s * * c *"
		gosub :PLAYER~quikstats
		if (currentsector = $MAP~stardock)
			setvar $switchboard~message "Twarp Error, Should be Hiding on Dock!*"
			gosub :switchboard~switchboard
			send "*"
			halt
		end
return

:DoTwarp
	setVar $msg ""
	if ($warpto > 0)
		send "q q * * mz" $warpto "*"
		setTextTrigger there        :adj_warp "You are already in that sector!"
		setTextLineTrigger adj_warp :adj_warp "Sector  : " & $warpto & " "
		setTextTrigger locking      :locking "Do you want to engage the TransWarp drive?"
		setTextTrigger igd          :twarpIgd "An Interdictor Generator in this sector holds you fast!"
		setTextTrigger noturns      :twarpPhotoned "Your ship was hit by a Photon and has been disabled"
		setTextTrigger noroute      :twarpNoRoute "Do you really want to warp there? (Y/N)"
		pause
		:adj_warp
			killAllTriggers
			send "z*"
			goto :twarp_adj
		:locking
			killAllTriggers
			send "y"
			setTextLineTrigger twarp_lock 		:twarp_lock "TransWarp Locked"
			setTextLineTrigger no_twrp_lock 	:no_twarp_lock "No locating beam found"
			setTextLineTrigger twarp_adj 		:twarp_adj "<Set NavPoint>"
			setTextLineTrigger no_fuel 		:itwarpNoFuel "You do not have enough Fuel Ore"
			pause
		:twarpNoFuel
			killAllTriggers
			setVar $msg "Not enough fuel for T-warp."
			goto :twarpDone

		:twarp_adj
			killAllTriggers
			send " * p s"
			goto :twarpDone

		:twarpNoRoute
			killAllTriggers
			send "n* z* "
			setVar $msg "No route available!"
			goto :twarpDone

		:no_twarp_lock
			killAllTriggers
			send "n*zn"
			send "l " & #8 & $start_planet "*c"
			setSectorParameter $warpto "FIGSEC" FALSE
			setvar $msg "no twarp lock"
			return

		:twarpIgd
			killAllTriggers
			setVar $msg "My ship is being held by Interdictor!"
			goto :twarpDone

		:twarpPhotoned
			killAllTriggers
			setVar $msg "I have been photoned and can not T-warp!"
			goto :twarpDone

		:twarp_lock
			KillAlltriggers
			if (currentalignment >= 1000)
				send "y * * p s g y g q " 
			else
				send "y  *  *  m " $MAP~stardock " *  *  p s g y g q "
			end
		:twarpDone
			if ($msg <> "")
				setvar $switchboard~message "Twarp Error - " & $msg & "*"
				gosub :switchboard~switchboard
				send "*"
			end
	end
	return

:bwarp

	killAllTriggers
	send "b" $warpto "*"
	setTextTrigger go :go5 "TransWarp Locked"
	setTextTrigger no :no5 "No locating beam found"
	goSub :delayTrigger
	pause

:no5
	killAllTriggers
	send "n "
	waitfor "Transporter shutting down."
	return

:go5
	killAllTriggers
	send "y z * "
	return

:FindJumpSector
	setVar $i 1
	setVar $RED_adj 0
	send "qq*"
	while (SECTOR.WARPSIN[$MAP~stardock][$i] > 0)
		setVar $RED_adj SECTOR.WARPSIN[$MAP~stardock][$i]
		send "m " & $RED_adj & "* y"
		setTextTrigger TwarpBlind 			:TwarpBlind "Do you want to make this jump blind? "
		setTextTrigger TwarpLocked			:TwarpLocked "All Systems Ready, shall we engage? "
		setTextLineTrigger TwarpVoided			:TwarpVoided "Danger Warning Overridden"
		setTextLineTrigger TwarpAdj			:TwarpAdj "<Set NavPoint>"
		pause
		:TwarpAdj
		killAllTriggers
		send " * "
		return

		:TwarpVoided
		killAllTriggers
		send " N N "
		goto :TryingNextAdj

		:TwarpLocked
		killAllTriggers
		send " N "

		goto :SectorLocked

		:TwarpBlind
		killAllTriggers
		send " N "

		:TryingNextAdj
    	add $i 1
	end

	:NoAdjsFound
		setVar $RED_adj 0
		return

	:SectorLocked
		return


:TurnsRequired
	send "i"
	setTextLineTrigger TurnsRequired_TPW	:TurnsRequired_TPW "Turns to Warp  : "
	pause

	:TurnsRequired_TPW
	killAllTriggers
	getWord CURRENTLINE $turnsRequired_TPW 5

	if ($RED_adj > 0)
		# twarp to jmp sector, then into SD sect, then twarp home
		setVar $turnsRequired_temp ($turnsRequired_TPW * 3)
		if ($_Tow > 0)
			# 2 Turns for exporting into other ship and back again
			add $turnsRequired_temp_temp 2
			# 3 Turns for initial Port then x into other ship, port & shop, then x and report
			#   b4 heading home
			add $turnsRequired_temp 3
		else
			add $turnsRequired_temp 1
		end
	else
		setVar $turnsRequired_temp ($turnsRequired_TPW * 2)
		# 1 Turn to port at dock
		add $turnsRequired_temp 1
	end

	setVar $turnsRequired $turnsRequired_temp
	return




#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\external\pe"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\planet\landingsub\planet"
include "source\bot_includes\ship\getshipcapstats\ship"
include "source\bot_includes\ship\loadshipinfo\ship"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\sector\getsectordata\sector"
