	logging off
		gosub :BOT~loadVars
									

	setVar $BOT~help[1]  $BOT~tab&"  upgradethis {sector:param} {fs} {fb} {os} {ob} {es} {eb} {noexp}"
	setVar $BOT~help[2]  $BOT~tab&"       "
	setVar $BOT~help[3]  $BOT~tab&"  Upgrades all ports until money or ports run out "
	setVar $BOT~help[4]  $BOT~tab&"       "
	setVar $BOT~help[5]  $BOT~tab&"    Options:    "
	setVar $BOT~help[6]  $BOT~tab&"      {sector:param} - travel to sectors marked with this parameter "
	setVar $BOT~help[7]  $BOT~tab&"                {fs} - upgrade fuel on selling ports"
	setVar $BOT~help[8]  $BOT~tab&"                {fb} - upgrade fuel on buying ports "
	setVar $BOT~help[9]  $BOT~tab&"                {os} - upgrade organics on selling ports"
	setVar $BOT~help[10] $BOT~tab&"                {ob} - upgrade organics on buying ports"
	setVar $BOT~help[11] $BOT~tab&"                {es} - upgrade equipment on selling ports"
	setVar $BOT~help[12] $BOT~tab&"                {eb} - upgrade equipment on buying ports"
	setVar $BOT~help[13] $BOT~tab&"             {noexp} - upgrade without gaining experience"
	gosub :bot~helpfile

	setVar $BOT~script_title "Pay At The Pump"
	gosub :BOT~banner


   
   setVar $switchboard~bot_name $SWITCHBOARD~bot_name

	
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
	if ($planet~CITADEL < 4)
		setVar $SWITCHBOARD~message "You must run upgradethis from at least a level 4 planet.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if (($planet~CITADEL_CREDITS + $PLAYER~CREDITS) < 5000000)
		setVar $SWITCHBOARD~message "You must have at least 5 million credits in the citadel or on hand for upgradethis.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	setvar $fs false
	setvar $fb false
	setvar $os false
	setvar $ob false
	setvar $es false
	setvar $eb false
	getwordpos " "&$bot~user_command_line&" " $pos " fs "
	if ($pos > 0)
		setvar $fs true
	end
	getwordpos " "&$bot~user_command_line&" " $pos " fb "
	if ($pos > 0)
		setvar $fb true
	end
	getwordpos " "&$bot~user_command_line&" " $pos " os "
	if ($pos > 0)
		setvar $os true
	end
	getwordpos " "&$bot~user_command_line&" " $pos " ob "
	if ($pos > 0)
		setvar $ob true
	end
	getwordpos " "&$bot~user_command_line&" " $pos " es "
	if ($pos > 0)
		setvar $es true
	end
	getwordpos " "&$bot~user_command_line&" " $pos " eb "
	if ($pos > 0)
		setvar $eb true
	end
	getwordpos $bot~user_command_line $pos "noexp"
	if ($pos > 0)
		setvar $max~noexp true
	else
		setvar $max~noexp false
	end
	getWordPos $bot~user_command_line $pos "sector:"
	if ($pos > 0)
		setVar $cline $bot~user_command_line & " "
		getText $cline $port "sector:" " "
	else
		setVar $port 0
	end
	if ($port = 0)
		lowerCase $bot~parm1
		setVar $port $bot~parm1
	end
	uppercase $port

	setVar $startingSector $PLAYER~CURRENT_SECTOR

	setArray $checkedPorts SECTORS
	setArray $que SECTORS
	setArray $checked SECTORS

	setVar $isDone FALSE
	setVar $player~turnsTooLow FALSE
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
			getsectorparameter $focus $port $isGoodSector
			# If this sector is our Sxx, we're done!
			if (($checkedPorts[$focus] <> TRUE) AND ($isGoodSector = true))
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
				send "p"&$NearFig&"*ys*"
				setTextLineTrigger warped :emptyPort "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
				setTextLineTrigger same :emptyPort "You are already in that sector!"
				setTextLineTrigger didnotwarp :noFigAtLocation "Your own fighters must be in the destination to make a safe jump."
				setTextLineTrigger notEnoughFuel :doneNoFuel "You do not have enough Fuel Ore on this planet to make the jump."
				pause
				:doneNoFuel
					killalltriggers
					setvar $switchboard~message "Planet out of fuel.  Halting.*"
					gosub :switchboard~switchboard
					halt

				:emptyPort
					setSectorParameter $NearFig "FIGSEC" TRUE
					if (PORT.CLASS[$nearfig] > 0)
						if (((PORT.BUYFUEL[$nearfig] = true) and ($fb = true)) or ((PORT.BUYFUEL[$nearfig] = false) and ($fs = true)))
							#upgrade fuel#
							setvar $max~type "f"
							gosub :max~run
						end
						if (((PORT.BUYORG[$nearfig] = true) and ($ob = true)) or ((PORT.BUYORG[$nearfig] = false) and ($os = true)))
							#upgrade organics#
							setvar $max~type "o"
							gosub :max~run
						end
						if (((PORT.BUYEQUIP[$nearfig] = true) and ($eb = true)) or ((PORT.BUYEQUIP[$nearfig] = false) and ($es = true)))
							#upgrade equipment#
							setvar $max~type "e"
							gosub :max~run
						end
					end
				gosub :PLAYER~quikstats
				if ((($PLAYER~TURNS < $BOT~bot_turn_limit) AND ($PLAYER~unlimitedGame = FALSE)))
					goto :donePATP
				end
			end
			if (($PLAYER~CREDITS + $planet~CITADEL_CREDITS) < 500000)
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




:noFigAtLocation
	setSectorParameter $NearFig "FIGSEC" FALSE
	goto :tryAgain2


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\external\max"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
