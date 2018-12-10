	logging off
	gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&"  Upgrades all ports until money or ports run out "
	setVar $BOT~help[2]  $BOT~tab&"       "
	setVar $BOT~help[3]  $BOT~tab&"  upgradethis [port type/sector param] "
	setVar $BOT~help[4]  $BOT~tab&"       "
	setVar $BOT~help[5]  $BOT~tab&"        "
	gosub :BOT~help_file

	setVar $BOT~script_title "Pay At The Pump"
	gosub :BOT~banner


   
   setVar $bot_name $SWITCHBOARD~bot_name

   
   
   
   
   
   
   
   
                    



	
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "You must run upgradethis command from a Citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
     	halt
	end
	send "q"
	waitOn "Planet command (?"
	gosub :PLANET~getPlanetInfo
	send "c"
	if ($PLANET~CITADEL < 4)
		setVar $SWITCHBOARD~message "You must run upgradethis from at least a level 4 planet.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if (($PLANET~citadel_credits + $PLAYER~CREDITS) < 10000000)
		setVar $SWITCHBOARD~message "You must have at least 10 million credits in the citadel or on hand for upgradethis.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	lowerCase $parm1
	setVar $port $parm1


	setVar $startingSector $PLAYER~CURRENT_SECTOR

	setArray $checkedPorts SECTORS
	setArray $que SECTORS
	setArray $checked SECTORS

	if ($docim = TRUE)
		setVar $SWITCHBOARD~message "upgradethis Downloading Current Port CIM Data - Comms Off*"
		gosub :SWITCHBOARD~switchboard
		send "^rq"
		killalltriggers
		waitFor ": ENDINTERROG"
		setVar $SWITCHBOARD~message "upgradethis CIM Port Data Complete - Comms Back On*"
		gosub :SWITCHBOARD~switchboard
	end
	setVar $isDone FALSE
	setVar $turnsTooLow FALSE
	:inac
	killalltriggers
	while ($isDone <> TRUE)
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
			# If this sector is our Sxx, we're done!
			if (($checkedPorts[$focus] <> TRUE) AND (PORT.EXISTS[$focus] = TRUE) AND (PORT.CLASS[$focus] > 0) AND ((PORT.BUYEQUIP[$focus] = TRUE) AND (PORT.BUYORG[$focus] = TRUE)))
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



					killAllTriggers
					gosub :PLAYER~quikstats
					send "q"
					waitOn "Planet command (?"
					gosub :PLANET~getPlanetInfo
					send "c"
					setVar $total_creds_needed (1400*8000)
					if ($total_creds_needed > $PLAYER~CREDITS)
						setVar $cashonhand $PLANET~citadel_credits
						add $cashonhand $PLAYER~CREDITS
						if ($cashonhand > $total_creds_needed)
						        send "T T " & $PLAYER~CREDITS & "* "
				        		send "T F " & $total_creds_needed & "* "
				        		setVar $PLAYER~CREDITS $total_creds_needed
		    				end
					end
					send "'"&$SWITCHBOARD~bot_name&" max o*"
					waitOn "{"&$SWITCHBOARD~bot_name&"} - Port upgrade complete."
					send "'"&$SWITCHBOARD~bot_name&" max e*"
					waitOn "{"&$SWITCHBOARD~bot_name&"} - Port upgrade complete."
				gosub :PLAYER~quikstats
				if ((($PLAYER~TURNS < $BOT~bot_turn_limit) AND ($PLAYER~unlimitedGame = FALSE)))
					goto :donePATP
				end
			end
			if (($PLAYER~CREDITS + $PLANET~citadel_credits) < 10000000)
				setVar $isDone TRUE
			end
			:tryAgain
			if (($PLAYER~turns < $BOT~bot_turn_limit) AND ($PLAYER~unlimitedGame <> TRUE))
				setVar $isDone TRUE
			end
	end
	:donePATP
		send "p"&$startingSector&"*y"
		setVar $SWITCHBOARD~message "Upgrade This run complete.*"
		gosub :SWITCHBOARD~switchboard
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
include "source\bot_includes\sector"