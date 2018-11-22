	logging off
	gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&"              destroyports               "
	setVar $BOT~help[2]  $BOT~tab&"  Destroys all ports not marked as BUBBLE sector"
	setVar $BOT~help[3]  $BOT~tab&"       "
	gosub :BOT~help_file

	setVar $BOT~script_title "Port Destroyer"
	gosub :BOT~banner


   
	setVar $bot_name $SWITCHBOARD~bot_name
	
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "You must run Port Destroyer from a Citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
     	halt
	end
	send "q"
	waitOn "Planet command (?"
	gosub :PLANET~getPlanetInfo
	send "c"
	if ($PLANET~CITADEL < 4)
		setVar $SWITCHBOARD~message "You must run Port Destroyer from at least a level 4 planet.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	gosub :PLAYER~quikstats
	send "qsnl1*tnl1*tnl2*tnl3*"
	waitOn "Planet command (?"
	gosub :PLANET~getPlanetInfo
	
	send "qjy l "&$PLANET~planet&"* c"
	send "c;q"
	waitFor "Figs Per Attack:"
	getWord CURRENTLINE $SHIP~maxFigAttack 5

	setVar $startingSector $PLAYER~CURRENT_SECTOR

	setArray $checkedPorts SECTORS
	setArray $que SECTORS
	setArray $checked SECTORS

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
			getSectorParameter $focus "BUSTED" $isBusted
			# If this sector is our Sxx, we're done!
			getsectorparameter $focus "BUBBLE" $isBubble
			if (($checkedPorts[$focus] <> TRUE) AND (PORT.EXISTS[$focus] = TRUE) AND (PORT.CLASS[$focus] > 0) AND ($isBubble <> TRUE))
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
				killtrigger 1
				killtrigger 2
				killtrigger 3
				killtrigger 4
				send "p"&$NearFig&"*y"
				setTextLineTrigger 1 :emptyPort2 "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
				setTextLineTrigger 2 :emptyPort2 "You are already in that sector!"
				setTextLineTrigger 3 :noFigAtLocation "Your own fighters must be in the destination to make a safe jump."
				setTextLineTrigger 4 :doneNoFuel2 "You do not have enough Fuel Ore on this planet to make the jump."
				pause			
				:emptyPort2
					setSectorParameter $NearFig "FIGSEC" TRUE
					setVar $SWITCHBOARD~message ""
					send "q  q  sh*   "
					:keepDestroying
						killtrigger 1
						killtrigger 2
						killtrigger 3
						killtrigger 4
						gosub :PLAYER~quikstats
					if (PORT.EXISTS[$focus] <> TRUE)
						goto :portAlreadyGone
					end
					if ($PLAYER~FIGHTERS > $SHIP~maxFigAttack)
						send "p"
						setTextTrigger 1 :portAlreadyGone "Captain! Are you sure you want to port here?"
						setTextTrigger 2 :continueDestroy "<A> Attack this Port"
						pause
						:continueDestroy
						killtrigger 1
						killtrigger 2
						killtrigger 3
						killtrigger 4
						send " a y "&$SHIP~maxFigAttack&"*l "&$PLANET~planet&"* m * * * q "
						setTextTrigger 1 :keepDestroying "Incoming laser barrage from"
						setTextTrigger 2 :doneDestroying "You destroyed the Star Port!"
						pause
						:doneDestroying
							setVar $SWITCHBOARD~message "Port destroyed in sector "&$NearFig&".*"
						:portAlreadyGone
							send "*   "
							if ($SWITCHBOARD~message <> "")
								gosub :SWITCHBOARD~switchboard
							end
							killtrigger 1
							killtrigger 2
							killtrigger 3
							killtrigger 4
					else
						send "l "&$PLANET~planet&"* m** * c "
						goto :donePATP
					end
					if ($SWITCHBOARD~message <> "")
						send "l "&$PLANET~planet&"* m** * c s*    "
					else
						send "l "&$PLANET~planet&"*  c  "
					end
				end
			:tryAgain
			if (($PLAYER~turns < 50) AND ($PLAYER~unlimitedGame <> TRUE))
				setVar $isDone TRUE
			end
	end
	:donePATP
	send "p"&$startingSector&"*y"
	send  "{" $SWITCHBOARD~bot_name "}  - Port Destroyer - Back at starting sector.*"
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