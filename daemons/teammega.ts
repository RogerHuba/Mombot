	logging off
	gosub :BOT~loadVars
									
	setVar $MAX_RED_BOTS 10
	setVar $MIN_RED_EXP 0
	setVar $MIN_RED_ALIGNMENT "-100"

	setArray $RED_TURNS $MAX_RED_BOTS
	setArray $RED_CURRENT_SHIP $MAX_RED_BOTS
	setArray $RED_ORIGINAL_SHIP $MAX_RED_BOTS


	setVar $MAX_BLUE_BOTS 10
	setVar $MIN_BLUE_ALIGNMENT 1000
	setVar $MAX_BLUE_EXP 999
	setArray $BLUES $MAX_BLUE_BOTS

	setArray $BLUE_TURNS $MAX_BLUE_BOTS
	setArray $BLUE_CURRENT_SHIP $MAX_BLUE_BOTS
	setArray $BLUE_ORIGINAL_SHIP $MAX_BLUE_BOTS

	setVar $BOT~help[1] $BOT~tab&"Buydown and mega with multiple bots"
	gosub :bot~helpfile



	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
		setVar $SWITCHBOARD~MESSAGE "Team Mega controller must be run from Command or Citadel prompt.*"
		gosub :SWITCHBOARD~SWITCHBOARD
		halt
	end

	setVar $BOT~script_title "Team Mega"
	gosub :BOT~banner

	send "'"&$SWITCHBOARD~BOT_NAME&" login*"
	waitOn "Corporate command "

	setVar $SWITCHBOARD~MESSAGE "This script assumes all bots are placed correctly before this script is run.*"
	gosub :SWITCHBOARD~SWITCHBOARD


	setVar $SWITCHBOARD~MESSAGE "Doing roll call.*"
	gosub :SWITCHBOARD~SWITCHBOARD
	
	setVar $ephaggle 0
	gosub :player~isEpHaggle
	IF ($player~isEpHaggle)
		setVar $ephaggle 1
		setVar $SWITCHBOARD~message "Using EP HAGGLE!*"
		gosub :switchboard~switchboard
	END


	setVar $i 1
	setVar $roll_call_done FALSE
	setVar $red_count 0
	setVar $blue_count 0

	while (($i <= $MAX_RED_BOTS) AND ($roll_call_done = FALSE))
		send "'buydown"&$i&" callout*"
		setDelayTrigger delay :donered 3000
		setTextLineTrigger red :foundred "Team: buydown"&$i&" " 
		pause

		:toomanyred	
			setVar $SWITCHBOARD~MESSAGE "Too many bots responding to buydown"&$i&".  Please fix bot teams so each red is unique.*"
			gosub :SWITCHBOARD~SWITCHBOARD
			halt

		:foundred
			getWordPos CURRENTLINE $pos "Team: "
			cutText CURRENTLINE $line $pos 9999
			getWord $line $red_sector 4
			getWord $line $red_exp 6
			getWord $line $red_align 8
			getWord $line $red_credits 10
			getWord $line $red_ship 12
			getWord $line $red_turns 14

			getWordPos $red_align $pos "-"
			if ($pos > 0)
				add $red_count 1
				setVar $SWITCHBOARD~MESSAGE "Found potential mega robber!*"
				gosub :SWITCHBOARD~SWITCHBOARD
				setVar $RED_TURNS[$i] $red_turns
				setVar $RED_CURRENT_SHIP[$i] $red_ship
				setVar $RED_ORIGINAL_SHIP[$i] $red_ship

			else
				add $blue_count 1
				setVar $BLUE_TURNS[$i] $red_turns
				setVar $BLUE_CURRENT_SHIP[$i] $red_ship
				setVar $BLUE_ORIGINAL_SHIP[$i] $red_ship
			end
			if (($red_turns < 10) AND ($PLAYER~UNLIMITED_GAME <> TRUE))
				setVar $SWITCHBOARD~MESSAGE "buydown"&$i&" does not have enough turns for stealing or buydowns.  Stopping script.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			end			

			setTextLineTrigger red :toomanyred "} - Team: buydown"&$i&" " 
			pause
		:donered
			killtrigger red
			if ($REDS[$i] = 0)
				setVar $roll_call_done TRUE
			end
			add $i 1
	end

	if ($red_count <= 1)
		setVar $SWITCHBOARD~MESSAGE "Found "&$red_count&" reds. Need at least one red.  Make sure all bots callin as buydown1, buydown2, etc.*"
		gosub :SWITCHBOARD~SWITCHBOARD
		halt
	end

	if ($red_count > 1)
		setVar $SWITCHBOARD~MESSAGE "Found "&$red_count&" red bots.*"
	else
		setVar $SWITCHBOARD~MESSAGE "Found "&$red_count&" red bot.*"
	end
	gosub :SWITCHBOARD~SWITCHBOARD

	if ($blue_count > 1)
		setVar $SWITCHBOARD~MESSAGE "Found "&$blue_count&" blue bots.*"
	else
		setVar $SWITCHBOARD~MESSAGE "Found "&$blue_count&" blue bot.*"
	end
	gosub :SWITCHBOARD~SWITCHBOARD



		


		setVar $keep_going TRUE
		setArray $orders 2 3
		while ($keep_going = TRUE)
			gosub :find_ports


			if ($ephaggle = 0)
				send "'red"&$orders[1]&" sdt "&$orders[1][1]&" "&$orders[2][1]&" "&$orders[1][2]&" "&$orders[2][2]&"*"
			else
				send "'red"&$orders[1]&" sdt "&$orders[1][1]&" "&$orders[2][1]&" "&$orders[1][2]&" "&$orders[2][2]&" ep*"
			end
			:repeatorders
			settextlinetrigger badship :wrong "That is not an available ship, Script Halting."
			settextlinetrigger lraship :lraship "last rob attempt is this sector!"
			settextlinetrigger noexp :noexp "You need more experience to SDT!!!"
			settextlinetrigger nowar :nowar "This sector has no warps, maybe you need to scan it first"
			settextlinetrigger auto :auto "Detected SWATH Autohaggle"
			settextlinetrigger lowturns :lowturns "NO Bust, stopping because I'm down to"
			settextlinetrigger fake :fake "FAKE"
			settextlinetrigger run :waitforredbust "Busted in ship"
			settextlinetrigger emergencystop :emergencystop "STOP"
			pause
			:emergencystop
				killalltriggers
				cutText CURRENTLINE&"   " $spoof 1 1
				if (($spoof = "R") or ($spoof = "'"))
					
					send "'red"&$orders[1]&" STOPALL*"
					waitfor " All non-system scripts and modules killed, and"
					
					send "'red"&$orders[1]&" x "& $ORIGINAL_SHIP[$orders[1]] &"*"
					settexttrigger emergency :emergency  "- Xport complete."
					pause
					:emergency
					killalltriggers
						setVar $SWITCHBOARD~MESSAGE "Emergency Stop - Do something useful?*"
						gosub :SWITCHBOARD~SWITCHBOARD
						halt
				else
					goto :repeatorders
				end
			:wrong
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "Ships got messed up somehow.  Better check it out!  Halting.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			:noexp
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "One of the cashers lost too much experience.  Halting.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			:nowar
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "One of the cashers has no knowledge of the sector they are in.  That's very odd. Halting.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			:auto
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "One of the cashers has SWATH haggle on. Halting.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			:lowturns
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "One of the cashers has run out of usable turns. Halting.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt

			:fake
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "Red Fake Busted.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				setVar $SWITCHBOARD~MESSAGE "Fake Busts don't clear ports. .*"
				gosub :SWITCHBOARD~SWITCHBOARD
				
				if (($bust_planet <> "") AND ($bust_planet <> "0") AND ($planet~planetfuel = TRUE))
					send "'blue1 furb "&$bust_ship&" "&$FURB_HOLDS&" "&$FURB_SHIP&" planet:"&$bust_planet&"  *"
				else
					send "'blue1 furb "&$bust_ship&" "&$FURB_HOLDS&" "&$FURB_SHIP&"  *"
				end
				settexttrigger nofig :nofig "No fighter down at that ship number, drop a fig."
				settexttrigger furb1 :furb1 "- Furb delivered"
				pause
				halt
			:lraship
				killalltriggers
				if ($ordersrepeat = 1)
					setVar $SWITCHBOARD~MESSAGE "Orders repeated twice, fail fail fail.*"
					gosub :SWITCHBOARD~SWITCHBOARD
					halt
				end
				setVar $ordersrepeat 1
				setVar $SWITCHBOARD~MESSAGE "Ok, lets serve up the ports oppisite and try again.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				send "'red"&$orders[1]&" SDT "&$orders[2][1]&" "&$orders[1][1]&" "&$orders[2][2]&" "&$orders[1][2]&"*"
	
				goto :repeatorders
			:waitforredbust
				getWordPos CURRENTLINE $pos "Busted"
				add $pos 5
				cutText CURRENTLINE $line $pos 9999
				getWord $line $bust_ship 4
				getWord $line $bust_turns 10
				striptext $bust_ship ","
				setVar $i 1
				while ($i <= $red_count)
					if $bust_ship = $orders[1][1]
						#setvar $xport_ship $orders[2][1]
						setvar $xport_ship $ORIGINAL_SHIP[$orders[1]]
						setvar $bust_planet $orders[1][2]
						setVar $j $orders[1][3]
						if ($REDS[$i] = $REDS[$orders[1]])
							setVar $red_id $i
							setVar $REDS[$i][$j] "B"
							setVar $original_ship $REDS[$i]
							setVar $RED_TURNS[$i] $bust_turns
						else
							setVar $REDS[$i][$j] FALSE
						end
					else
						#setvar $xport_ship $orders[1][1]
						setvar $xport_ship $ORIGINAL_SHIP[$orders[1]]
						setvar $bust_planet $orders[2][2]
						setVar $j $orders[2][3]
						if ($REDS[$i] = $REDS[$orders[1]])
							setVar $red_id $i
							setVar $REDS[$i][$j] "B"
							setVar $original_ship $REDS[$i]
							setVar $RED_TURNS[$i] $bust_turns
						else
							setVar $REDS[$i][$j] FALSE
						end
					end
					add $i 1
				end
				setvar $taken_ship $xport_ship
				setVar $red_id $orders[1]
				setVar $RED_CURRENT_SHIP[$red_id] $taken_ship
				gosub :find_ports
				if ($found_thief = FALSE)
					setVar $taken_ship $original_ship
					setVar $xport_ship $original_ship
					setVar $RED_CURRENT_SHIP[$red_id] $taken_ship
				end
				setdelaytrigger setup :setupfurber 2000
				pause

			:setupfurber
	
				killalltriggers
				if (($bust_planet <> "") AND ($bust_planet <> "0") AND ($planet~planetfuel = TRUE))
					send "'blue1 furb "&$bust_ship&" "&$FURB_HOLDS&" "&$FURB_SHIP&" planet:"&$bust_planet&" blow:red"&$red_id&"  *"
				else
					send "'blue1 furb "&$bust_ship&" "&$FURB_HOLDS&" "&$FURB_SHIP&" blow:red"&$red_id&"  *"
				end
				
				settexttrigger nofig :nofig "No fighter down at that ship number, drop a fig."
				settexttrigger furb1 :furb1 "- Furb delivered"
				pause
			
			:furb1
	
				killalltriggers
				setdelaytrigger xport :xport 5000
				settexttrigger noOre :noore "Ore at port critically low!"
				pause
				:noore
					killalltriggers
					
					send "'red"&$red_id&" mac o1100^mq*"
					setdelaytrigger pdelay :pdelay 500
					pause
					:pdelay
					killtrigger pdelay
					send "'blue1 mac pt^m^m^m^m*"
					setdelaytrigger furb2 :furb2 8000
					pause
				:furb2
					killalltriggers
					


			:xport
				send "'red"&$red_id&" x "&$xport_ship&"*"
				settexttrigger xport :done  "- Xport complete."
				pause

			:done
				killalltriggers
				send "'Quick Nap before resuming!*"
				setdelaytrigger naptime :naptime 3000
				pause
				:naptime
				killalltriggers
				send "'Wakey Wakey!*"

		end
halt

:find_ports 
		setVar $bottom 1
		setVar $top 1
		setArray $checked SECTORS
		setVar $que[1] $PLAYER~CURRENT_SECTOR
		setVar $checked[$PLAYER~CURRENT_SECTOR] 1
		:tryAgain2
		while ($bottom <= $top)
			setVar $focus $que[$bottom]
			getSectorParameter $focus "" $isTarget
			getSectorParameter $focus "FIGSEC" $isFigged

			if (((($true = true) and ($isTarget = true)) or (($true = false) and ($isTarget <> true))) and (($isFigged <> true) or ($allSectors = true)))
				# fig found 0 hops
				setVar $NearFig $focus
				setVar $checkedPorts[$NearFig] TRUE
				goto :mowtotarget
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
		halt

return


:x
	send "'red"&$red_id&" x "&$xport_ship&"*"
	settexttrigger xport :done  "- Xport complete."
	pause

	:done
		killalltriggers
return
#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\isephaggle\player"
