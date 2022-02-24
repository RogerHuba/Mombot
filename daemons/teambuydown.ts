	logging off
	gosub :BOT~loadVars
	loadvar $game~port_max
	loadvar $game~mbbs

	setVar $MAX_BOTS 15
	setVar $MIN_RED_EXP 0
	setVar $MIN_RED_ALIGNMENT "-100"

	########################################################################################
	# Bots array structure - $bots[bot id][is bot potential robber][bot name][trader name] #
	########################################################################################
	setArray $BOTS $MAX_BOTS 4
	setArray $CURRENT_SHIP $MAX_BOTS
	setArray $ORIGINAL_SHIP $MAX_BOTS

 
	setVar $BOT~help[1]  $BOT~tab&" teambuydown {minproduct:#} {stopturns:#} {f} {o} {e}"
	setVar $BOT~help[2]  $BOT~tab&"   "
	setVar $BOT~help[3]  $BOT~tab&" Buydown with multiple bots"
	setVar $BOT~help[4]  $BOT~tab&"   "
	setVar $BOT~help[5]  $BOT~tab&" {minproduct:#} - Port Min Prod Req (def:30,000)"
	setVar $BOT~help[6]  $BOT~tab&"  {stopturns:#} - Turns to stop at (def: 100)"
	setVar $BOT~help[7]  $BOT~tab&"            {f} - Buys fuel"
	setVar $BOT~help[8]  $BOT~tab&"            {o} - Buys organics"
	setVar $BOT~help[9]  $BOT~tab&"            {e} - Buye equipment"
	setVar $BOT~help[10] $BOT~tab&"         "
	setVar $BOT~help[11] $BOT~tab&"     Bots: callin buy1, buy2, etc."
	setVar $BOT~help[12] $BOT~tab&"           default is buying fuel and equip"
	
		gosub :bot~helpfile

	# for trader names #
	gosub :combat~init

	
	gosub :PLAYER~quikstats
	gosub :player~getinfo
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~MESSAGE "Team Buydown must be run from Citadel prompt.*"
		gosub :SWITCHBOARD~SWITCHBOARD
		halt
	end

	setVar $BOT~script_title "Team Buydown"
	gosub :BOT~banner

	getWordPos $bot~user_command_line $pos "minproduct:"
	if ($pos > 0)
		setVar $cline $bot~user_command_line & " "
		getText $cline $minimumProduct "minproduct:" " "
	else
		setVar $minimumProduct 0
	end
	
	getWordPos $bot~user_command_line $pos "stopturns:"
	if ($pos > 0)
		setVar $cline $bot~user_command_line & " "
		getText $cline $stopTurns "stopturns:" " "
	else
		setVar $stopTurns 0
	end

	getWordPos " "&$bot~user_command_line&" " $pos " f "
	if ($pos > 0)
        setvar $fuel true
	end

	getWordPos " "&$bot~user_command_line&" " $pos " o "
	if ($pos > 0)
        setvar $org true
	end

	getWordPos " "&$bot~user_command_line&" " $pos " e "
	if ($pos > 0)
        setvar $equip true
	end

    if (($fuel <> true) and ($org <> true) and ($equip <> true))
        setvar $fuel true
        setvar $equip true
    end

	if ($minimumProduct <= 0)
		isNumber $test $bot~parm1
		if ($test)
			if ($test > 0)
				setvar $minimumProduct $bot~parm1
			else
				setvar $minimumProduct 30000
			end
		else
			setvar $minimumProduct 30000
		end
		isNumber $test $bot~parm2
		if ($test)
			if ($test > 0)
				setvar $stopTurns $bot~parm2
			else
				setvar $stopTurns 100
			end
		else
			setvar $stopTurns 100
		end
	end

	getWordPos $bot~user_command_line $pos "half"
	if ($pos > 0)
		setVar $sellHalf TRUE
	else
		setVar $sellHalf FALSE
	end
	
	setVar $SWITCHBOARD~MESSAGE "Using ports with minimum " & $minimumProduct & " and stopping at roughly " & $stopTurns & " turns.*"
	gosub :SWITCHBOARD~SWITCHBOARD


	send "'"&$SWITCHBOARD~BOT_NAME&" login*"
	waitOn "Corporate command "

	setVar $SWITCHBOARD~MESSAGE "This script assumes all bots are placed correctly before this script is run.*"
	gosub :SWITCHBOARD~SWITCHBOARD


	setDelayTrigger    3 :waitforunlock 3000
	pause
	:waitforunlock
	

	send "q"
	waitOn "Planet command (?"
	gosub :PLANET~getPlanetInfo
	send "c"
	if ($planet~CITADEL < 4)
		setVar $SWITCHBOARD~message "You must run Team Buydown from at least a level 4 planet.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if (($planet~CITADEL_CREDITS + $PLAYER~CREDITS) < 5000000)
		setVar $SWITCHBOARD~message "WARNING - You should have at least 5 million credits in the citadel or on hand for Team Buydown.*"
		gosub :SWITCHBOARD~switchboard
		#halt
	end


	setVar $SWITCHBOARD~MESSAGE "Logging into all bots.*"
	gosub :SWITCHBOARD~SWITCHBOARD
	send "xtlogin**q "


	setVar $SWITCHBOARD~MESSAGE "Doing roll call.*"
	gosub :SWITCHBOARD~SWITCHBOARD
	
	setVar $i 1
	setVar $roll_call_done FALSE
	setVar $blue_count 0
	setvar $current_robber 0
	setvar $backup_robber 0
	while (($i <= $MAX_BOTS) AND ($roll_call_done = FALSE))
		send "'buy"&$i&" callout*"
		setDelayTrigger    3 :done 3000
		setTextLineTrigger 2 :found "Team: buy"&$i&" " 
		pause

		:toomany	
			setVar $SWITCHBOARD~MESSAGE "Too many bots responding to buy"&$i&".  Please fix bot teams so each buydown bot is unique.*"
			gosub :SWITCHBOARD~SWITCHBOARD
			halt

		:found
			getWordPos CURRENTLINE $pos "Team: "
			cutText CURRENTLINE $line $pos 9999
			getWord $line $sector 4
			getWord $line $exp 6
			getWord $line $align 8
			getWord $line $credits 10
			getWord $line $ship 12
			getWord $line $turns 14

			if (($turns < $stopTurns) AND ($PLAYER~UNLIMITED_GAME <> TRUE))
				setVar $SWITCHBOARD~MESSAGE "buy"&$i&" does not have enough turns for buydowns.  Replace them with someone with turns.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			end			
			setVar $BOTS[$i] $i
            add $blue_count 1

			setVar $BOTS[$i][1] $turns
			setVar $CURRENT_SHIP[$i] $ship
			setVar $ORIGINAL_SHIP[$i] $ship
			killtrigger 1
			setTextLineTrigger 1 :toomany "} - Team: buy"&$i&" " 
			pause
		:done
			killtrigger 1
			if ($BOTS[$i] = 0)
				setVar $roll_call_done TRUE
			else
				send "'buy"&$i&"*"
				waiton "} - You are logged into this bot. "
				# bot name #
				setvar $current_line currentline
				gettext currentline $BOTS[$i][3] "{" "} - You are logged into this bot." 
				getword $current_line $isthisme 1
				if ($isthisme = "R")
					gettext $current_line $BOTS[$i][4] "R " "[" 
				else
					setvar $bots[$i][4] $player~TRADER_NAME					
				end 

				setVar $SWITCHBOARD~MESSAGE "Bot name captured as: "&$BOTS[$i][3]&" for "&$bots[$i][4]&"*"
				gosub :SWITCHBOARD~SWITCHBOARD

			end
			add $i 1
	end
	
	gosub :killthetriggers
	

	if ($blue_count < 1)
		setVar $SWITCHBOARD~MESSAGE "Found "&$blue_count&" buydown bots. Need at least one buydown bot.  Make sure all bots callin as buy1, buy2, etc.*"
		gosub :SWITCHBOARD~SWITCHBOARD
		halt
	end

	if ($blue_count > 1)
		setVar $SWITCHBOARD~MESSAGE "Found "&$blue_count&" buydown bots.*"
	else
		setVar $SWITCHBOARD~MESSAGE "Found "&$blue_count&" buydown bot.*"
	end
	gosub :SWITCHBOARD~SWITCHBOARD

	setArray $checkedPorts SECTORS
	setArray $que SECTORS
	

while (true) 
	gosub :player~quikstats
	gosub :grabplanetstats
	gosub :findports
	gosub :pwarptoport
	if ($go_to_next_port = false)
        if ($equip = true)
            gosub :findbestcandidates
            if (PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR] = false)
                setvar $type "e"
                gosub :startbuydown
            end

            setvar $check $current_trader
            gosub :checkin
        end
        if ($org = true)
            gosub :findbestcandidates
            if (PORT.BUYORG[$PLAYER~CURRENT_SECTOR] = false)
                setvar $type "o"
                gosub :startbuydown
            end

            setvar $check $current_trader
            gosub :checkin
        end
        if ($fuel = true)
            gosub :findbestcandidates
            if (PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = false)
                setvar $type "f"
                gosub :startbuydown
            end
        end
        gosub :findbestcandidates
        setvar $check $current_trader
        gosub :checkin
	end
end



halt

:checkin
	killtrigger 1
	send "'buy"&$check&" callout*"
	setTextLineTrigger 1 :foundtrader "Team: buy"&$check&" " 	
	pause

	:foundtrader
		getWordPos CURRENTLINE $pos "Team: "
		cutText CURRENTLINE $line $pos 9999
		getWord $line $sector 4
		getWord $line $exp 6
		getWord $line $align 8
		getWord $line $credits 10
		getWord $line $ship 12
		getWord $line $turns 14
        getwordpos $align $pos "-"
        if ($pos > 0)
    		setvar $BOTS[$check][2] true
        else
        	setvar $BOTS[$check][2] false
        end
		setvar $BOTS[$check][1] $turns
return


:waitFor200e

	
	:againE
	send "cr*q"
	waitfor "Commerce report for"
	waitfor "Equipment"
	getWord CURRENTLINE $eonhand 3
	if ($eonhand > $buydownholds)
		return 
	
	else
		goto :againE
	end

return

:startbuydown
	setvar $nextbot $BOTS[$current_trader][3]
#    if ($BOTS[$current_trader][2] = true)
#        send "'" $nextbot " buy " $type " b *"
#    else
        send "'" $nextbot " buy " $type " s *"
#    end
	setTextLineTrigger 1 :startDock1 " docks at"
	setTextLineTrigger 2 :startDock2 "Commerce report for"
	setDelayTrigger    3 :startDockDelay 5000
	pause
	:startDockDelay
		gosub :killthetriggers
		send "'" $nextBot " stopall*"
		waitfor " non-system scripts and modules killed, and mode"

		send "'" $nextBot " land*"
		waitfor "] {"&$nextbot&"} - In Cit - Plane"
		send "'" $nextBot " cn*"
		waitfor "] {"&$nextbot&"} - CN Settings are reset for this bo"
		send "'" $nextbot " buy " $type " s *"
	:startDock1
	:startDock2
		gosub :killthetriggers


	setTextLineTrigger 1 :bdComplete1 "] {"&$nextbot&"} - Buy down exiting --- Nothing to buy"
	setTextLineTrigger 2 :bdComplete1 "] {"&$nextbot&"} - Buy down exiting --- Normal Exit"
	setTextLineTrigger 3 :bdcash1 "] {"&$nextbot&"} - Buy down exiting --- Not enough cash onhand"

	pause
	:bdcash1
		gosub :killthetriggers
		send "'" $nextBot " w 4000000*"
		waitfor "] {"&$nextbot&"} - 4,000,000 credits taken from citadel."
		goto :bdagain1
	:bdComplete1
		gosub :killthetriggers
		send "cr*q"
		waitfor "Commerce report for"
		waitfor "Equipment"
		getWord CURRENTLINE $eonhand 3
return


	setTextLineTrigger 1 :Complete1 "] {"&$nextbot&"} - Buy down exiting --- Nothing to buy"
	setTextLineTrigger 2 :Complete1 "] {"&$nextbot&"} - Buy down exiting --- Normal Exit"
	setTextLineTrigger 3 :cash1 "] {"&$nextbot&"} - Buy down exiting --- Not enough cash onhand"

	pause
	:cash1
		gosub :killthetriggers
		send "'" $nextBot " w 4000000*"
		waitfor "] {"&$nextbot&"} - 4,000,000 credits taken from citadel."
		goto :bdagain1
	:Complete1
		gosub :killthetriggers
		send "cr*q"
		waitfor "Commerce report for"
		waitfor "Equipment"
		getWord CURRENTLINE $eonhand 3
return

:selloffproduct
	:startSell
	if ($sellHalf = TRUE)
		send "'"&$BOTS[$current_trader][3]&" neg o e half*"
	else
		send "'"&$BOTS[$current_trader][3]&" neg o e*"
	end
	setTextLineTrigger 1 :good "] {"&$BOTS[$current_trader][3]&"} - Done with port"
	setTextLineTrigger 2 :bad  "] {"&$BOTS[$current_trader][3]&"} - Nothing to sell"
	pause

	:good
	killtrigger 2
	send "cr*q"
	waitfor "Commerce report for"
	waitfor "Equipment"
	getWord CURRENTLINE $eonhand 3
	if ($eonhand > 20000)
		setVar $SWITCHBOARD~MESSAGE "Neg fail detected! trying again*"
		gosub :SWITCHBOARD~SWITCHBOARD
		goto :startSell
	end
	:bad
	killtrigger 1
return


:findbestcandidates
	setvar $i 1
	setvar $highest_turns 0
	setvar $current_trader 0 
	while ($i <= $MAX_BOTS)
		# pick the bot with highest turn who is not the designated robber/a robber and has more than
		# stop turns  stop_turns - minus half a port
		if (($BOTS[$i][1] > $highest_turns) and (($BOTS[$i][1] - 65) > $stopTurns))
			setvar $current_trader $BOTS[$i] 
			setvar $highest_turns $BOTS[$i][1]
		end
		add $i 1
	end
	if ($current_trader = "0")
		setVar $SWITCHBOARD~MESSAGE "Well, that shouldn't have happened.  I can't find a trader to go next!  Halting.*"
		gosub :SWITCHBOARD~SWITCHBOARD
		halt
	end
return

:switchrobberships
	setvar $switchto $bots[$save_current_robber][4]
	goto :doswitch
:switchships 
	setvar $switchto $swapwithme
	
	:doswitch
	send "'" $bots[$current_trader][3] " switch " $switchto "*"
	waiton "} - Switched successfully!"
return


:grabplanetstats
	send "q"
	waitOn "Planet command (?"
	gosub :PLANET~getPlanetInfo
	send "c"
return

:findports 
		setVar $bottom 1
		setVar $top 1
		setvar $nearfig 0
		setVar $que[1] $PLAYER~CURRENT_SECTOR
		setArray $checked SECTORS
		setVar $checked[$PLAYER~CURRENT_SECTOR] 1

		:tryAgain2
		while ($bottom <= $top)
			# Now, pull out the next sector in the que, and make it our focus
			setVar $focus $que[$bottom]

			getSectorParameter $focus "BUYDOWN" $isGoodSeller
			getSectorParameter $focus "FIGSEC" $isFigged

			# Check to see if planet has equipment to sell, or if planet is too full to go to next seller.  #
			# Hopefully it will pick the closest, best option based on this. #

			if ($checkedPorts[$focus] <> TRUE)
				if (SECTOR.EXPLORED[$focus] = "YES")
					if ((((PORT.EXISTS[$focus] = TRUE) AND (PORT.CLASS[$focus] > 0))) and ((($isGoodSeller = true) and (($planet~PLANET_EQUIPMENT_MAX - $planet~PLANET_EQUIPMENT) >= $game~port_max))))
						send "cr"&$focus&"*q"
						gosub :PLAYER~quikstats
						if (((PORT.EQUIP[$focus] >= $minimumProduct) and ($equip = true)) or ((PORT.FUEL[$focus] >= $minimumProduct) and ($fuel = true)) or ((PORT.ORG[$focus] >= $minimumProduct) and ($org = true)))
							# fig found 0 hops
							setVar $NearFig $focus
							setVar $checkedPorts[$NearFig] TRUE
							setVar $totalPortFuel PORT.FUEL[$focus]
							return
						else
							setVar $nearfig 0
						end
					else
						setVar $nearfig 0
					end
				else
					if ((($isGoodSeller = true) and (($planet~PLANET_EQUIPMENT_MAX - $planet~PLANET_EQUIPMENT) > $game~port_max)))
						# fig found 0 hops
						setVar $NearFig $focus
						setVar $checkedPorts[$NearFig] TRUE
						setVar $totalPortFuel PORT.FUEL[$focus]
						return
					else
						setVar $nearfig 0
					end
				end
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
		setVar $SWITCHBOARD~message "Can't find a route to any other BUYDOWN ports.*"
		gosub :SWITCHBOARD~switchboard
		halt
return

:pwarptoport
if ($nearfig > 0)
	gosub :killthetriggers
	send "p"&$NearFig&"*ys** "
	setTextLineTrigger 1 :emptyPort "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
	setTextLineTrigger 2 :emptyPort "You are already in that sector!"
	setTextLineTrigger 3 :noFigAtLocation "Your own fighters must be in the destination to make a safe jump."
	setTextLineTrigger 4 :doneNoFuel "You do not have enough Fuel Ore on this planet to make the jump."
	pause			
	:emptyPort
		gosub :killthetriggers
		send "cr"&$NearFig&"*q"
		gosub :PLAYER~quikstats
		setSectorParameter $NearFig "FIGSEC" TRUE
		if ((PORT.EXISTS[$NearFig] = TRUE) AND (PORT.CLASS[$NearFig] > 0) AND (SECTOR.EXPLORED[$NearFig] = "YES") AND ((PORT.EQUIP[$NearFig] >= $minimumProduct) or (PORT.ORG[$NearFig] >= $minimumProduct) or (PORT.FUEL[$NearFig] >= $minimumProduct)))
			setvar $go_to_next_port false
		else
			setvar $go_to_next_port true
		end
			
		return
	:noFigAtLocation
		gosub :killthetriggers
		setSectorParameter $NearFig "FIGSEC" FALSE
		setvar $go_to_next_port true
		return
	:doneNoFuel
		gosub :killthetriggers
		setVar $SWITCHBOARD~message "Your planet doesn't have enough fuel to jump to the next closest port.  Halting.*"
		gosub :SWITCHBOARD~switchboard
		halt
else
	setVar $SWITCHBOARD~message "Couldn't find a way to another port.  Weird.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

:killthetriggers
	killtrigger 1
	killtrigger 2
	killtrigger 3
	killtrigger 4
	killtrigger 5
	killtrigger 6
return

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\planet\getplanetinfo\planet"
