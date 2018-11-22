	logging off
		gosub :BOT~loadVars
	setVar $parm1 $BOT~parm1
	setVar $parm2 $BOT~parm2
	setVar $parm3 $BOT~parm3
	setVar $parm4 $BOT~parm4
	setVar $parm5 $BOT~parm5
	setVar $parm6 $BOT~parm6
	setVar $parm7 $BOT~parm7
	setVar $parm8 $BOT~parm8
	setVar $user_command_line $BOT~user_command_line


	setVar $BOT~help[1] $BOT~tab&"Visits all ports in grid and buys fuel"
	setVar $BOT~help[2] $BOT~tab&"and sells/buys organics and equipment."
	setVar $BOT~help[3] $BOT~tab&" "
	setVar $BOT~help[4] $BOT~tab&"salesman [min port product] ({neg}otiate OR {hold}byhold) {skipcim} {upgradefuel}"
	setVar $BOT~help[5] $BOT~tab&"         "
	setVar $BOT~help[6] $BOT~tab&"Options: "
	setVar $BOT~help[7] $BOT~tab&"   {neg/hold}    Determines planet negotiate or hold selling approach"
	setVar $BOT~help[8] $BOT~tab&"   {docim}       Does cim before starting route"
	setVar $BOT~help[9] $BOT~tab&"   {upgradefuel} Upgrades fuel ports selling fuel"
	setVar $BOT~help[10] $BOT~tab&"   {nohaggle}    Doesn't haggle when buying product to keep from gaining exp"
	gosub :BOT~help_file

	setVar $BOT~script_title "Traveling Salesman"
	gosub :BOT~banner

		
:merchant
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "You must run Travelling Salesman command from a Citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
 		halt
	end
	
	setVar $buyFuel TRUE
	
	getWordPos $user_command_line $pos "docim"
	if ($pos > 0)
		setVar $docim TRUE
	else
		setVar $docim FALSE
	end
	getWordPos $user_command_line $pos "nohaggle"
	if ($pos > 0)
		setVar $nohaggle TRUE
	else
		setVar $nohaggle FALSE
	end
	getWordPos $user_command_line $pos "hold"
	if ($pos > 0)
		setVar $planetNegotiate FALSE
	else
		setVar $planetNegotiate TRUE
	end

	getWordPos $user_command_line $pos "upgradefuel"
	if ($pos > 0)
		setVar $upgrade_fuel TRUE
	else
		setVar $upgrade_fuel FALSE
	end

	setVar $minimumFuel $parm1
	isNumber $number $minimumFuel
	if ($number <> 1)
		setVar $SWITCHBOARD~message " Minimum Port Product entered is not a number!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($minimumFuel <= 0)
		setVar $SWITCHBOARD~message "Minimum Port Product must be greater than 0.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end



:merchant
	killalltriggers
	setArray $checkedPorts SECTORS
	setArray $que SECTORS
	setArray $checked SECTORS
	send "q"
	waitOn "Planet command (?"
	gosub :PLANET~getPlanetInfo
	send "c"
	if ($PLANET~citadel < 4)
		setVar $SWITCHBOARD~message "You must run Travelling Salesman from at least a level 4 planet.*"
		gosub :SWITCHBOARD~switchboard
 		halt
	end
	gosub :PLAYER~quikstats
	setVar $sectorCount 10
	setVar $totalHolds 0 
	setVar $spentCredits 0 
	setVar $startingSector $PLAYER~CURRENT_SECTOR
	setVar $sellingOrg TRUE
	setVar $sellingEquip TRUE
	if ($docim = TRUE)
		setVar $SWITCHBOARD~message "Travelling Salesman Downloading Current Port CIM Data - Comms Off*"
		gosub :SWITCHBOARD~switchboard
		send "^rq"
		waitFor ": ENDINTERROG"
		setVar $SWITCHBOARD~message "Travelling Salesman CIM Port Data Complete - Comms Back On*"
		gosub :SWITCHBOARD~switchboard
	end
	while (TRUE)
		:inac
		if (($PLAYER~unlimitedGame = FALSE) AND ($PLAYER~TURNS <= $BOT~bot_turn_limit))
			setVar $SWITCHBOARD~message "Turns too low to continue.*"
			gosub :SWITCHBOARD~switchboard
			goto :doneMerchant
		end
		setVar $bottom 1
		setVar $top 1
		setArray $checked SECTORS
		setVar $que[1] $PLAYER~CURRENT_SECTOR
		setVar $checked[$PLAYER~CURRENT_SECTOR] 1
		:tryAgain2
		while ($bottom <= $top)
			# Now, pull out the next sector in the que, and make it our focus
			setVar $focus $que[$bottom]
			if ($docim = FALSE)
				if (($checkedPorts[$focus] <> TRUE) AND (PORT.EXISTS[$focus] = TRUE) AND (PORT.CLASS[$focus] > 0) AND (SECTOR.EXPLORED[$focus] = "YES"))
					send "cr"&$focus&"*q"
					gosub :PLAYER~quikstats
				end
			end
			getSectorParameter $focus "BUSTED" $isBusted
			# If this sector is our xxB, we're done!
			if (($checkedPorts[$focus] <> TRUE) AND (PORT.EXISTS[$focus] = TRUE) AND (PORT.CLASS[$focus] > 0) AND (((PORT.FUEL[$focus] >= $minimumFuel) AND (PORT.BUYFUEL[$focus] = FALSE)) OR (PORT.ORG[$focus] >= $minimumFuel) OR (PORT.EQUIP[$focus] >= $minimumFuel)) AND ($isBusted <> TRUE))
				# fig found 0 hops
				setVar $NearFig $focus
				setVar $checkedPorts[$NearFig] TRUE
				goto :continueOn2
			else
				setVar $nearfig 0
			end
			# That wasn't it, so let's add all the adjacents to the que for future testing.
			setVar $a 1
			while (SECTOR.WARPS[$focus][$a] > 0)
				setVar $adjacent SECTOR.WARPS[$focus][$a]
				# But only add them if they haven't been added previously
				if ($checked[$adjacent] = 0)
					# Okay, this one hasn't been checked, so tag it and que it.
					setVar $checked[$adjacent] 1
					add $top 1
					setVar $que[$top] $adjacent
				end
				add $a 1
			end
			# The adjacents of $focus were all queued, now on to the next one.
			add $bottom 1
		end	
			setVar $SWITCHBOARD~message "Can't find a route to any other ports.*"
			gosub :SWITCHBOARD~switchboard
     		goto :doneMerchant
		:continueOn2
			if ($NearFig > 0)
				killAllTriggers
				send "p"&$NearFig&"*y"
				setTextLineTrigger warped :emptyPort2 "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
				setTextLineTrigger same :emptyPort2 "You are already in that sector!"
				setTextLineTrigger didnotwarp :noFigAtLocation "Your own fighters must be in the destination to make a safe jump."
				setTextLineTrigger notEnoughFuel :doneNoFuel2 "You do not have enough Fuel Ore on this planet to make the jump."
				pause			
				:emptyPort2
					setSectorParameter $NearFig "FIGSEC" TRUE



				if (($upgrade_fuel) AND (PORT.BUYFUEL[$NearFig] = FALSE))
					killAllTriggers
					gosub :PLAYER~quikstats
					send "q"
					waitOn "Planet command (?"
					gosub :PLANET~getPlanetInfo
					send "c"
					setVar $total_creds_needed (300*7000)
					if ($total_creds_needed > $PLAYER~CREDITS)
						setVar $cashonhand $PLANET~citadel_credits
						add $cashonhand $PLAYER~CREDITS
						if ($cashonhand > $total_creds_needed)
						        send "T T " & $PLAYER~CREDITS & "* "
				        		send "T F " & $total_creds_needed & "* "
				        		setVar $PLAYER~CREDITS $total_creds_needed
		    				end
					end
					send "q q *O 1"
					waitOn ", 0 to quit)"
					getWord CURRENTLINE $upgradeAmount 9
					stripText $upgradeAmount "("
					send $upgradeAmount&"* * *CR*Q"
					waitOn "What sector is the port in? ["&$PLAYER~CURRENT_SECTOR&"]"
					setTextLineTrigger getFuel2 :fuelDuring "Fuel Ore"
					pause
					:fuelDuring
						killalltriggers
						getWord CURRENTLINE $totalPortFuel 4
						waitOn "<Computer deactivated>"
					gosub :PLAYER~quikstats
					gosub :PLANET~landOnPlanetEnterCitadel
				end

				if ($planetNegotiate = TRUE)
					killAllTriggers
					setVar $PLANET~_ck_pnego_fueltosell "-1"
					if ($PLANET~planetorg >= 500)
						setVar $PLANET~_ck_pnego_orgtosell "max"
					else
						setVar $PLANET~_ck_pnego_orgtosell "-1"
					end
					if ($PLANET~planetequip >= 500)
						setVar  $PLANET~_ck_pnego_equiptosell "max"
					else
						setVar  $PLANET~_ck_pnego_equiptosell "-1"
					end
					gosub :PLANET~planetNeg
				else	
					killAllTriggers
					gosub :PLAYER~quikstats
					send "q"
					waitOn "Planet command (?"
					gosub :PLANET~getPlanetInfo
					send "c"
	
					send "q q *cr*q"
					waitOn "Fuel Ore"
					getWord CURRENTLINE $totalPortFuel 4
					waitOn "Organics"
					getWord CURRENTLINE $totalPortOrganics 3
					waitOn "Equipment"
					getWord CURRENTLINE $totalPortEquipment 3		
					
					waitOn "<Computer deactivated>"
					if ((PORT.BUYORG[$NearFig] = TRUE) AND ($sellingOrg))
						if ($PLANET~planetOrg < $totalPortOrganics)
							setVar $turnsSellingProduct (($PLANET~planetOrg/$PLAYER~TOTAL_HOLDS)-1)
						else
							setVar $turnsSellingProduct (($totalPortOrganics/$PLAYER~TOTAL_HOLDS))
						end
						if (($PLAYER~unlimitedGame = FALSE) AND (($PLAYER~TURNS - $turnsSellingProduct) <= $BOT~bot_turn_limit))
							setVar $SWITCHBOARD~message "Turns too low to continue.*"
							gosub :SWITCHBOARD~switchboard
							send "l "&$PLANET~planet&"* c "
							goto :doneMerchant
						end
						send "l "&$PLAYER~planet&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
							
						while ($turnsSellingProduct > 0)
							send "l " $PLANET~planet "*  t  *  * 2*  q P * *"
							gosub :PLAYER~startHaggle
							send "0 * 0 *  /"
							if ($PLAYER~ni <> TRUE)
								subtract $turnsSellingProduct 1
								add $totalOrganicHolds $PLAYER~TOTAL_HOLDS
							end
							waitOn "³Turns"
						end
					end
					if ((PORT.BUYEQUIP[$NearFig] = TRUE) AND ($sellingEquip))
						if ($PLANET~planetEquip < $totalPortEquipment)
							setVar $turnsSellingProduct (($PLANET~planetEquip/$PLAYER~TOTAL_HOLDS)-1)
						else
							setVar $turnsSellingProduct (($totalPortEquipment/$PLAYER~TOTAL_HOLDS))
						end
						send "l "&$PLANET~planet&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
						while ($turnsSellingProduct > 0)
							
							while ($turnsSellingProduct > 0)
								send "l " $PLANET~planet "*  t  *  * 3*  q P * *"
								gosub :PLAYER~startHaggle
								send "0 * 0 *  /"
								if ($PLAYER~ni <> TRUE)
									subtract $turnsSellingProduct 1
									add $totalEquipmentHolds $PLAYER~TOTAL_HOLDS
								end
								waitOn "³Turns"
							end
						end
					end
					if ($planetNegotiate <> TRUE)
						gosub :PLANET~landOnPlanetEnterCitadel
					end
					gosub :PLAYER~quikstats
				end
					if (PORT.BUYEQUIP[$NearFig] = FALSE)
						setVar $PLAYER~buyobject "e"
						if ($nohaggle)
							setVar $PLAYER~buytype "s"
						else
							setVar $PLAYER~buytype "b"
						end
						gosub :PLAYER~buy
						gosub :PLAYER~quikstats
					end
					if (PORT.BUYORG[$NearFig] = FALSE)
						setVar $PLAYER~buyobject "o"
						if ($nohaggle)
							setVar $PLAYER~buytype "s"
						else
							setVar $PLAYER~buytype "b"
						end
						gosub :PLAYER~buy
						gosub :PLAYER~quikstats
					end
					if (PORT.BUYFUEL[$NearFig] = FALSE)
						setVar $PLAYER~buyobject "f"
						setVar $PLAYER~buytype "s"
						gosub :PLAYER~buy
						gosub :PLAYER~quikstats
					end
										
				send "#"
				waitOn "                            Who's Playing"
				send "cr*q"
				gosub :PLAYER~quikstats
			end	
		end
		:doneMerchant
			send "p"&$startingSector&"*y"
			setVar $SWITCHBOARD~message "Travelling Salesman completed.*"
			gosub :SWITCHBOARD~switchboard
			halt



:noFigAtLocation
	setSectorParameter $NearFig "FIGSEC" FALSE
	goto :tryAgain2

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"

