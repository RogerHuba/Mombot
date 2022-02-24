:refurb_photons
	killalltriggers
	if ($refurb_sector > 0)
		
		:pwarp_refurb
			send "p" $refurb_sector "*y"
			SetTextLineTrigger homelock :home_lock "Planetary TransWarp Drive Engaged!"
			setTextLineTrigger nohomelock :no_home_lock "Your own fighters must be"
			setTextLineTrigger home_now :home_lock "You are already in that sector!"
			settextlinetrigger pwarp_rdy :hit_y "All Systems Ready, shall we engage?"
			pause

			:no_home_lock
				killtrigger homelock
				killtrigger nohomelock
				killtrigger home_now
				killtrigger pwarp_rdy
				setSectorParameter $refurb_sector "FIGSEC" false
				setvar $switchboard~message "No fig down in refurb sector!  That's not good.  Skipping refurb for now.  Either place fig down, or restart me with new refurb sector.*"
				gosub :switchboard~switchboard
				return

				:hit_y
					send "y "
		        :home_lock
					killtrigger homelock
					killtrigger nohomelock
					killtrigger home_now
					killtrigger pwarp_rdy

		:tryshipscan

			send "q q q * |w*"
			setTextLineTrigger statlinetrig :shipline "--<  Available Ships in Sector >--"
			settextlinetrigger enter :enter "[Pause]"
			setTextTrigger doneships :gotShips "Choose which ship to tow (Q=Quit)"
			pause
			:enter
				send "*"
				settextlinetrigger enter :enter "[Pause]"
				pause
		:shipline
			setVar $line CURRENTLINE
			getWordPos $line $pos "Choose which ship to tow (Q=Quit)"
			getWord $line $temp 1
			isNumber $result $temp
			if (($result = TRUE))
				if ($temp > 0)
					add $shipCount 1
					setVar $refurbShips[$shipCount] $temp
				end
			end
			if ($pos > 0)
				goto :gotShips
			else
				setTextLineTrigger getLine :shipline
				pause
			end


		:gotShips
			killtrigger getline
			killtrigger statlinetrig
			killtrigger enter
			killtrigger doneships
			send "*|"

			setVar $i 1
			setvar $furb_ship 0
			while ($i <= $shipCount)
				if ($refurbShips[$i] > 0)
					send "x  i "&$refurbShips[$i]&"**  * "
					waiton "Ship Name      : "
					setTextLineTrigger doneMissles :keepLooking "[Pause]"
					settextlinetrigger hasMissles :foundMissles "Photon Missiles: "
					pause

					:keepLooking
						killtrigger doneMissles
						killtrigger hasMissles
				end
				add $i 1
			end

			if ($furb_ship <= 0)
				gosub :player~quikstats
				setvar $switchboard~message "Can not find furb ship in sector "&$player~current_sector&".  Please buy some more and restart me.*"
				gosub :switchboard~switchboard
				send " l "&$planet~planet&"*  m***  c "
				return
			end

			:foundMissles
				killtrigger doneMissles
				setvar $furb_ship $refurbShips[$i]
				send "x  "&$furb_ship&"*  *  l "&$planet~planet&"*  m***  c "
				gosub :player~quikstats
				gosub :ship~getshipstats

				###################################################################
				# set starting ship variables so switch ship doesn't get confused #
				###################################################################
				
				setvar $navigate~starting_ship_type $player~ship_type
				setvar $navigate~starting_ship_max_attack $ship~SHIP_MAX_ATTACK
				setvar $navigate~starting_ship_offensive_odds $SHIP~SHIP_OFFENSIVE_ODDS 

				gosub :navigate~navigate_away

				setvar $switchboard~message "Grabbed refurb ship number "&$refurb_ship&" with "&$player~photons&" photons aboard.*"
				gosub :switchboard~switchboard

		return
	else
		:try_buying_furbs
		gosub :player~quikstats
		setVar $genesisCashNeeded 0 
		setVar $limpetCashNeeded 0
		setVar $armidCashNeeded 0
		setVar $disruptorCashNeeded 0
		if ($combat~defender = true)
			setVar $genesisCashNeeded ((($SHIP~SHIP_GENESIS_MAX-$PLAYER~genesis)*$game~genesis_cost))
		end
		if (($deploymines = true) and (($player~limpets < $deploy_mine_count) and ($player~armids < $deploy_mine_count) and ($ship~SHIP_MINES_MAX > 0)))
			setVar $limpetCashNeeded ((($SHIP~SHIP_MINES_MAX-$PLAYER~LIMPETS)*$game~LIMPET_COST))
			setVar $armidCashNeeded ((($SHIP~SHIP_MINES_MAX-$PLAYER~ARMIDS)*$game~ARMID_COST))
		end
		if ($killing~holokill)
			setVar $photonCashNeeded ($photon~shooting_count*$game~photon_cost)
		else
			###############################################################################
			# before the first furb, defender won't know how many photons a ship can hold #
			###############################################################################
			if ($ship~photon_max > 0)
				setVar $photonCashNeeded ($ship~photon_max*$game~photon_cost)
				if ($photon~shooting_count > $ship~photon_max)
					setvar $photon~shooting_count $ship~photon_max
				end
			else
				if ($photon~shooting_count > 5)
					setVar $photonCashNeeded ($photon~shooting_count*$game~photon_cost)
				else
					setVar $photonCashNeeded (5*$game~photon_cost)
				end
			end
		end
		if ($deploydisruptors = true)
			setVar $disruptorCashNeeded (10*$game~DISRUPTOR_COST)
		end
		setVar $cashNeeded ($photonCashNeeded+$limpetCashNeeded+$armidCashNeeded+$disruptorCashNeeded+$genesisCashNeeded+$game~LIMPET_REMOVAL_COST)
		setVar $furbing TRUE
		if ($cashNeeded > $player~credits)
			send "D" 
			waitOn "Citadel treasury contains "
			getWord CURRENTLINE $citadelCash 4
			stripText $citadelCash ","
			if (($citadelCash+currentcredits) < $cashNeeded)
				setVar $genesisCashNeeded 0 
				setVar $limpetCashNeeded 0
				setVar $armidCashNeeded 0
				setVar $disruptorCashNeeded 0
				setVar $cashNeeded (($photon~shooting_count*$game~photon_cost)+$game~LIMPET_REMOVAL_COST)
				if (($citadelCash+currentcredits) < $cashNeeded)
					setvar $switchboard~message "Not enough cash ("&$cashNeeded&") for restock in treasury or on hand.*"
					gosub :switchboard~switchboard
					gosub :navigate~head_home
				end
			end
			send "t f "&($cashNeeded-$player~credits)&"* "
		end
		# check adj's for Dock.. if present, then we don't need a jump sector.
		setVar $i 1
		setVar $START_SECTOR $player~current_sector
		setVar $WeAreAdjDock FALSE
		while ($i <= SECTOR.WARPCOUNT[$START_SECTOR])
			setVar $adj_start SECTOR.WARPSIN[$START_SECTOR][$i]
			if ($adj_start = $MAP~stardock)
				setVar $WeAreAdjDock TRUE
			end
			add $i 1
		end

		if ((currentalignment < 1000) AND ($WeAreAdjDock = FALSE))
			setVar $player~RED_adj 0
			setvar $player~target $map~stardock
			gosub :player~FindJumpSector
			if ($player~RED_adj = 0)
				waitfor "Command [TL="
				setvar $switchboard~message "Cannot Find Jump Sector Adjacent Dock*"
				gosub :switchboard~switchboard
				send "*"
				send " L Z" & #8 & $PLANET~PLANET & "* p  s  s * * c *"
				return
			end
		end

		if ((currentalignment >= 1000) OR ($WeAreAdjDock))
			getdistance $dist1 $START_SECTOR $MAP~stardock
			getdistance $dist2 $MAP~stardock $START_SECTOR
		else
			getdistance $dist1 $START_SECTOR $player~RED_adj
			getdistance $dist2 $player~RED_adj $START_SECTOR
		end
		if (($dist1 < 0) or $dist2 < 0)
			if ($player~alignment >= 1000)
				if ($WeAreAdjDock = true)
					setvar $player~starting_point $map~stardock
					setvar $player~destination $start_sector
					gosub :player~getcourse
					setvar $dist1 1
					setvar $dist2 $player~courseLength
				else
					setvar $player~starting_point $start_sector
					setvar $player~destination $map~stardock
					gosub :player~getcourse
					setvar $dist1 $player~courseLength

					setvar $path_to_stardock $player~mowCourse

					setvar $player~starting_point $map~stardock
					setvar $player~destination $start_sector
					gosub :player~getcourse
					setvar $dist2 $player~courseLength
				end
			else
				if ($WeAreAdjDock = true)
					setvar $player~starting_point $map~stardock
					setvar $player~destination $start_sector
					gosub :player~getcourse
					setvar $dist1 1
					setvar $dist2 $player~courseLength
				else
					setvar $player~starting_point $start_sector
					setvar $player~destination $player~RED_adj
					gosub :player~getcourse
					setvar $dist1 $player~courseLength

					setvar $path_to_stardock $player~mowCourse

					setvar $player~starting_point $map~stardock
					setvar $player~destination $start_sector
					gosub :player~getcourse
					setvar $dist2 $player~courseLength
				end
			end
		end
			if ($dist1 <= 0)
				setvar $switchboard~message "Insufficient Warp Data Plotting Course to Dock*"
				gosub :switchboard~switchboard
				send "*"
				return
			end

			getdistance $dist2 $MAP~stardock $START_SECTOR
			if ($dist2 <= 0)
				setvar $switchboard~message "Insufficient Warp Data Plotting Return Course From Dock*"
				gosub :switchboard~switchboard
				send "*"
				return
			end

			setVar $ore_req (($dist1 + $dist2) * 3)
			if ($PLAYER~ORE_HOLDS < $ore_req)

				# Move planet closer #
				setvar $i ($path_to_stardock-2)
				while ($i > 3)
					getSectorParameter $path_to_stardock[$i] "FIGSEC" $isFigged 
					getSectorParameter $path_to_stardock[$i] "LIMPSEC" $isLimped 
					if (($isFigged = true) and ($isLimped = true))
						send "p" $path_to_stardock[$i] "* y "
						gosub :player~quikstats
						if ($player~current_sector = $path_to_stardock[$i])
							goto :try_buying_furbs
						end
					end
					subtract $i 1
				end
				send "q  t*l2* t*l3* t*t1* c "
				gosub :player~quikstats
				if ($PLAYER~ORE_HOLDS < $ore_req)
					setvar $switchboard~message "Not Enough ORE In Holds To Make Round Trip.  Needs "&$ore_req&".*"
					gosub :switchboard~switchboard
					send "*"
					return

				end
			end

			if ($PLAYER~TWARP_TYPE = "No")
				setvar $switchboard~message "Must Have Twarp 1 or 2*"
				gosub :switchboard~switchboard
				send "*"
				return
			end

			if ($PLAYER~unlimitedGame = 0)
				gosub :TurnsRequired
				if ($turnsRequired > $player~turns)
					setvar $switchboard~message "Not Enough Turns. "&$turnsRequired&", Required*"
					gosub :switchboard~switchboard
					send "*"
					return
				elseif ($turnsRequired <= $player~turns)
					setVar $tmp ($player~turns - $turnsRequired)
					if ($tmp <= $bot~bot_turn_limit)
						setvar $switchboard~message "Proceeding Will Leave Fewer Than " & $bot~bot_turn_limit & " Turns!*"
						gosub :switchboard~switchboard
						send "*"
						return
					end
				end
			end

		send " C R " & $MAP~stardock & "*"
		setTextLineTrigger itsalive :itsalive "Items     Status  Trading % of max OnBoard"
		setTextLineTrigger nosoupforme :nosoupforme "I have no information about a port in that sector"
		pause
		:nosoupforme
			killAllTriggers
			setvar $switchboard~message "StarDock appears to have been Blown Up!*"
			gosub :switchboard~switchboard
			return
		:itsalive
			killAllTriggers
			waitfor "(?="
			setVar $msg ""
			if ((currentalignment >= 1000) AND ($WeAreAdjDock = FALSE))
				setVar $warpto $MAP~stardock
				gosub :DoTwarp
			elseif (($WeAreAdjDock = FALSE) AND ($player~RED_adj <> 0))
				setVar $warpto $player~RED_adj
				gosub :DoTwarp
			else
				send "q q q *  m " & $MAP~stardock & "*  *  P  S G Y G Q "
			end
			if ($msg = "")
				waitfor "You leave the Galactic Bank."
			else
				setvar $switchboard~message "Unknown Problem Detected. Check TA!*"
				gosub :switchboard~switchboard
				send "*"
				halt
			end
			gosub :PLAYER~quikstats

			setVar $_Disrupt ""
			setVar $_Limps ""
			setVar $_Mines ""
			setVar $_Genesis ""
			
			if ($combat~defender = true)
				setVar $_Genesis "Max"
			end
			if ($deploymines = true)
				setVar $_Limps "Max"
				setVar $_Mines "Max"
			end
			if ($photon~shooting_count = 0)
				setVar $_Photon ""
			else
				if (($killing~holokill = true) and ($prhunter~activate <> true))
					setVar $_Photon $photon~shooting_count
				else
					setVar $_Photon "Max"
				end
			end
			if ($deploydisruptors = true)
				setVar $_Disrupt "Max"
			end
			gosub :DoPurchases
			send "Q Q Q Q Z N M " & $START_SECTOR & "* Y  Y  Y  * L Z" & #8 & $PLANET~PLANET & "* p  s  s * * c *"
			gosub :PLAYER~quikstats
			if (currentsector = $MAP~stardock)
				setvar $switchboard~message "Twarp Error, Should be Hiding on Dock!*"
				gosub :switchboard~switchboard
				send "*"
				halt
			end
			send "q tnt1* c "
end

return

:DoTwarp
	setVar $msg ""
	if ($warpto > 0)
		send "q q q * * mz" & $warpto "*"
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
			send "l " & #8 & $PLANET~PLANET "*c"
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
				if ($furbing)
					setVar $str "y * * p s g y g q " 
				else
					setVar $str "y * *  " 
				end
				send $str
			else
				if ($furbing)
					setVar $str "y  *  *  m " & $MAP~stardock & " *  *  p s g y g q "
				else
					setVar $str "y * *  " 
				end
				send $str
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


:TurnsRequired
	send "i"
	setTextLineTrigger TurnsRequired_TPW	:TurnsRequired_TPW "Turns to Warp  : "
	pause

	:TurnsRequired_TPW
	killAllTriggers
	getWord CURRENTLINE $turnsRequired_TPW 5

	if ($player~RED_adj > 0)
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


:callSaveMe
	send "q q q q * '"&$SWITCHBOARD~bot_name&" call*"
	halt

:DoPurchases
	send "|h "
	waitfor "<Hardware Emporium>"
	#=============================================== PURCHASE PHOTONS
	if ($_Photon  <> "")
		setTextTrigger canhouse :canhouse "How many Photon Missiles do you want"
		setTextTrigger canthouse :canthouse "<Hardware Emporium> So what are you looking for"
		send "P "
		pause
		:canhouse
			killAllTriggers
			if ($_Photon  = "Max")
				getText CURRENTLINE $buy "(Max" ")"
				send $buy & "* "
				setvar $ship~photon_max $buy
			else
				send $_Photon & "* "
			end
			waitfor "<Hardware Emporium>"
		:canthouse
			killAllTriggers
	end
	#=============================================== PURCHASE GENESIS
	if ($_Genesis  <> "")
		send "T "
		waitfor "How many Genesis Torpedoes do you want"
		if ($_Genesis  = "Max")
			getText CURRENTLINE $buy "(Max" ")"
			send $buy & "* "
		else
			send $buy $_Genesis & "* "
		end
		waitfor "<Hardware Emporium>"
	end
	#=============================================== PURCHASE LIMPS
	if ($_Limps  <> "")
		send "L "
		waitfor "How many mines do you want"
		if ($_Limps  = "Max")
			getText CURRENTLINE $buy "(Max" ")"
			send $buy & "* "
		else
			send $buy $_Limps & "* "
		end
		waitfor "<Hardware Emporium>"
	end
	#=============================================== PURCHASE ARMIDS
	if ($_Mines  <> "")
		send "M "
		setVar $buy 0
		waitfor "How many mines do you"
		if ($_Mines  = "Max")
			getText CURRENTLINE $buy "(Max" ")"
			send $buy & "* "
		else
			send $_Mines & "* "
		end
		waitfor "<Hardware Emporium>"
	end
	#=============================================== PURCHASE DISRUPTORS
	if ($_Disrupt  <> "")
		send "S "
		waitfor "How many Mine Disruptors do you want"
		if ($_Disrupt  = "Max")
			getText CURRENTLINE $buy "(Max" ")"
			send $buy & "* "
			setvar $ship~disruptor_max $buy
		else
			send $_Disrupt & "* "
		end
		waitfor "<Hardware Emporium>"
	end

	send "|"
	return
