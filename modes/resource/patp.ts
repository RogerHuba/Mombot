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
	loadVar $PLAYER~unlimitedGame


	setVar $BOT~help[1]  $BOT~tab&"              PATP - Pay At The Pump               "
	setVar $BOT~help[2]  $BOT~tab&"  patp [min port fuel] {upgrade} {buyhalf} {docim} {destroyports}"
	setVar $BOT~help[3]  $BOT~tab&"       "
	setVar $BOT~help[4]  $BOT~tab&"        "
	setVar $BOT~help[5]  $BOT~tab&"Options:"
	setVar $BOT~help[6]  $BOT~tab&"    [min port fuel]  minimum fuel a port must have to visit it"
	setVar $BOT~help[7]  $BOT~tab&"    [upgrade]        upgrades fuel in each port"
	setVar $BOT~help[8]  $BOT~tab&"    [buyhalf]        empties ports halfway"
	setVar $BOT~help[9]  $BOT~tab&"    [docim]          does cim check before patp"
	setVar $BOT~help[10] $BOT~tab&"    [destroyports]   destroys every port it drains if you "
	setVar $BOT~help[11] $BOT~tab&"    [bubble]         only visits bubble sectors  "
	setVar $BOT~help[12] $BOT~tab&"                     have enough fighters"
	gosub :BOT~help_file

	setVar $BOT~script_title "Pay At The Pump"
	gosub :BOT~banner


  
   setVar $bot_name $SWITCHBOARD~bot_name

	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "You must run Pay At The Pump command from a Citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
     	halt
	end
	send "q"
	waitOn "Planet command (?"
	gosub :PLANET~getPlanetInfo
	send "c"
	if ($PLANET~CITADEL < 4)
		setVar $SWITCHBOARD~message "You must run Pay At The Pump from at least a level 4 planet.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if (($PLANET~citadel_credits + $PLAYER~CREDITS) < 5000000)
		setVar $SWITCHBOARD~message "You must have at least 5 million credits in the citadel or on hand for patp.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	lowerCase $parm1
	setVar $minimumFuel $parm1
	isNumber $number $minimumFuel
	if ($number <> 1)
		setVar $SWITCHBOARD~message "Minimum Port Fuel entered is not a number!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($minimumFuel <  0)
		setVar $SWITCHBOARD~message "Minimum Port Fuel must be greater than or equal to 0.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	getWordPos $user_command_line $pos "destroyports"
	if ($pos > 0)
		setVar $destroyPorts TRUE
	else
		setVar $destroyPorts FALSE
	end
	getWordPos $user_command_line $pos "upgrade"
	if ($pos > 0)
		setVar $upgrade TRUE
	else
		setVar $upgrade FALSE
	end
	getWordPos $user_command_line $pos "half"
	if ($pos > 0)
		setVar $buyHalf TRUE
	else
		setVar $buyHalf FALSE
	end
	getWordPos $user_command_line $pos "docim"
	if ($pos > 0)
		setVar $docim TRUE
	else
		setVar $docim FALSE
	end
	getWordPos $user_command_line $pos "bubble"
	if ($pos > 0)
		setVar $bubble TRUE
	else
		setVar $bubble FALSE
	end
	gosub :PLAYER~quikstats
	send "qsnl1*tnl1*tnl2*tnl3*"
	waitOn "Planet command (?"
	gosub :PLANET~getPlanetInfo
	
	send "qjy l "&$PLANET~planet&"* c"
	send "c;q"
	waitFor "Figs Per Attack:"
	getWord CURRENTLINE $SHIP~maxFigAttack 5
	if ($reverse)
		setVar $sectorCount SECTORS
	else
		setVar $sectorCount 11
	end
	setVar $totalHolds 0 
	setVar $spentCredits 0 
	setVar $startingSector $PLAYER~CURRENT_SECTOR

	setArray $checkedPorts SECTORS
	setArray $que SECTORS
	setArray $checked SECTORS

	if ($docim = TRUE)
		setVar $SWITCHBOARD~message "PATP Downloading Current Port CIM Data - Comms Off*"
		gosub :SWITCHBOARD~switchboard
		send "^rq"
		killalltriggers
		waitFor ": ENDINTERROG"
		setVar $SWITCHBOARD~message "PATP CIM Port Data Complete - Comms Back On*"
		gosub :SWITCHBOARD~switchboard
	end
	setVar $isDone FALSE
	setVar $turnsTooLow FALSE
	:inac
	killalltriggers
	while ($isDone <> TRUE)
		loadVar $BOT~botIsDeaf
		loadVar $BOT~silent_running
		:inac
		if (($PLAYER~unlimitedGame = FALSE) AND ($PLAYER~TURNS <= $BOT~bot_turn_limit))
			setVar $SWITCHBOARD~message "Turns too low to continue.*"
			gosub :SWITCHBOARD~switchboard
			goto :donePATP
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
			getSectorParameter $focus "BUSTED" $isBusted
			# If this sector is our Sxx, we're done!
			if ($bubble)
				getsectorparameter $focus "BUBBLE" $isBubble
			else
				setVar $isBubble TRUE
			end
			if ($docim = FALSE)
				if (($checkedPorts[$focus] <> TRUE) AND (PORT.EXISTS[$focus] = TRUE) AND (PORT.CLASS[$focus] > 0) AND (SECTOR.EXPLORED[$focus] = "YES") AND (((PORT.FUEL[$focus] >= $minimumFuel) AND (PORT.BUYFUEL[$focus] = FALSE)) AND ($isBusted <> TRUE) AND ($isBubble = TRUE)))
					send "cr"&$focus&"*q"
					gosub :PLAYER~quikstats
				end
			end
			if (($checkedPorts[$focus] <> TRUE) AND (PORT.EXISTS[$focus] = TRUE) AND (PORT.CLASS[$focus] > 0) AND (((PORT.FUEL[$focus] >= $minimumFuel) AND (PORT.BUYFUEL[$focus] = FALSE)) AND ($isBusted <> TRUE) AND ($isBubble = TRUE)))
				# fig found 0 hops
				setVar $NearFig $focus
				setVar $checkedPorts[$NearFig] TRUE
				setVar $totalPortFuel PORT.FUEL[$focus]
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
		goto :donePATP
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



				if ($upgrade)
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
				if ($buyHalf)
					divide $totalPortFuel 2
				end
				if (($PLANET~planet_fuel_max-$PLANET~planet_fuel) < $totalPortFuel)
					setVar $turnsToEmpty (($PLANET~planet_fuel_max-$PLANET~planet_fuel)/$PLAYER~TOTAL_HOLDS)
					add $totalHolds ($PLANET~planet_fuel_max-$PLANET~planet_fuel)
					setVar $isDone TRUE
				else
					setVar $turnsToEmpty ($totalPortFuel/$PLAYER~TOTAL_HOLDS)
					add $totalHolds $totalPortFuel
				end
				setVar $PLAYER~buyobject "f"
				setVar $PLAYER~buytype "s"
				setVar $PLAYER~buydownRoundsFromParam $turnsToEmpty
				gosub :tactics~buy
				gosub :PLAYER~quikstats
				send "c r*q "
				
				if ($PLAYER~exit_message <> "Normal Exit")
					setVar $SWITCHBOARD~message $PLAYER~exit_message&"*"
					gosub :SWITCHBOARD~switchboard
					goto :donePATP
				end
				if (($PLAYER~unlimitedGame = FALSE) AND (($PLAYER~turns-$turnsToEmpty) <= $BOT~bot_turn_limit))
					setVar $turnsTooLow TRUE
					goto :donePATP
				end

				if ($buyHalf)
					setVar $SWITCHBOARD~message "Port half emptied in sector "&$NearFig&".*"
					gosub :SWITCHBOARD~switchboard
				else
					setVar $SWITCHBOARD~message "Port emptied in sector "&$NearFig&".*"
					gosub :SWITCHBOARD~switchboard
				end
				gosub :PLAYER~quikstats
				if ((($PLAYER~TURNS < 50) AND ($PLAYER~unlimitedGame = FALSE)))
					goto :donePATP
				end
				add $spentCredits $PLAYER~credits_spent
				if ($destroyPorts)
					send "q q "
					:keepDestroying
						killalltriggers
						gosub :PLAYER~quikstats
					if ($PLAYER~FIGHTERS > $SHIP~maxFigAttack)
						send "p"
						setTextTrigger portAlreadyGone :doneDestroying "Captain! Are you sure you want to port here?"
						setTextTrigger portHere :continueDestroy "<A> Attack this Port"
						pause
						:continueDestroy
						killalltriggers
						send " a y "&$SHIP~maxFigAttack&"*l "&$PLANET~planet&"* m * * * q "
						setTextTrigger notDestroyed :keepDestroying "Incoming laser barrage from"
						setTextTrigger DestoryedPort :doneDestroying "You destroyed the Star Port!"
						pause
						:doneDestroying
							killalltriggers
							send "*"
							setVar $SWITCHBOARD~message "Port destroyed in sector "&$sectorCount&".*"
							gosub :SWITCHBOARD~switchboard
							gosub :PLAYER~quikstats
					end
					send "c r*q "
					gosub :landOnPlanetEnterCitadel
				end
			end
			if (($PLAYER~CREDITS + $PLANET~citadel_credits) < 1000000)
				setVar $isDone TRUE
			end
			:tryAgain
			if (($PLAYER~turns < 50) AND ($PLAYER~unlimitedGame <> TRUE))
				setVar $isDone TRUE
			end
	end
	:donePATP
	send "p"&$startingSector&"*y"
	setVar $formattedSpentCredits ""
	getLength $spentCredits $length
	while ($length > 3)
		cutText $spentCredits $snippet $length-2 9999
		cutText $spentCredits $spentCredits 1 $length-3
		getLength $spentCredits $length
		setVar $formattedSpentCredits ","&$snippet&$formattedSpentCredits
	end
	setVar $formattedSpentCredits $spentCredits&$formattedSpentCredits
	
	setVar $formattedHolds ""
	getLength $totalHolds $length
	while ($length > 3)
		cutText $totalHolds $snippet $length-2 9999
		cutText $totalHolds $totalHolds 1 $length-3
		getLength $totalHolds $length
		setVar $formattedHolds ","&$snippet&$formattedHolds
	end
	setVar $formattedHolds $totalHolds&$formattedHolds
	
	send "'*{" $SWITCHBOARD~bot_name "} Pay At The Pump - Completion Report {" $SWITCHBOARD~bot_name "}*  "&$formattedHolds&" total holds of fuel ore purchased.*  Credits spent: "&$formattedSpentCredits&" credits*"	
	if (($PLAYER~credits+$PLANET~citadel_credits) < 1000000)
		send "  Credits are below 1,000,000.*"
	end
	if ($turnsTooLow)
		send "  Low on turns! (Turns: "&$PLAYER~TURNS&")*"			
	end
	if ($PLANET~PLANET_fuel >= ($PLANET~PLANET_fuel_max-2000))
		send "  Planet "&$PLANET~PLANET&" is full.*"
	end
	send  "{" $SWITCHBOARD~bot_name "} Pay At The Pump - Completion Report {" $SWITCHBOARD~bot_name "}**"
	halt

:getFuelCash
	send "l " $PLANET~planet "*   c t f"&$total_creds_needed&"*qq"
	gosub :PLAYER~quikstats
return




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

