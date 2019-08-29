	logging off
	gosub :BOT~loadVars
	loadvar $game~port_max

	setVar $MAX_BOTS 15
	setVar $MIN_RED_EXP 0
	setVar $MIN_RED_ALIGNMENT "-100"

	setArray $BOTS $MAX_BOTS 3
	setArray $CURRENT_SHIP $MAX_BOTS
	setArray $ORIGINAL_SHIP $MAX_BOTS


	setVar $BOT~help[1] $BOT~tab&"Buydown and mega with multiple bots"
	gosub :bot~helpfile



	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~MESSAGE "Team Mega must be run from Citadel prompt.*"
		gosub :SWITCHBOARD~SWITCHBOARD
		halt
	end

	setVar $BOT~script_title "Team Mega"
	gosub :BOT~banner

	send "'"&$SWITCHBOARD~BOT_NAME&" login*"
	waitOn "Corporate command "

	setVar $SWITCHBOARD~MESSAGE "This script assumes all bots are placed correctly before this script is run.*"
	gosub :SWITCHBOARD~SWITCHBOARD


	send "q"
	waitOn "Planet command (?"
	gosub :PLANET~getPlanetInfo
	send "c"
	if ($planet~CITADEL < 4)
		setVar $SWITCHBOARD~message "You must run Team Mega from at least a level 4 planet.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if (($planet~CITADEL_CREDITS + $PLAYER~CREDITS) < 5000000)
		setVar $SWITCHBOARD~message "You must have at least 5 million credits in the citadel or on hand for Team Mega.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end


	setVar $SWITCHBOARD~MESSAGE "Logging into all bots.*"
	gosub :SWITCHBOARD~SWITCHBOARD
	send "xtlogin**q "


	setVar $SWITCHBOARD~MESSAGE "Doing roll call.*"
	gosub :SWITCHBOARD~SWITCHBOARD
	
	setVar $i 1
	setVar $roll_call_done FALSE
	setVar $red_count 0
	setVar $blue_count 0
	setvar $current_robber 0
	setvar $backup_robber 0
	while (($i <= $MAX_BOTS) AND ($roll_call_done = FALSE))
		send "'mega"&$i&" callout*"
		setDelayTrigger    3 :donered 3000
		setTextLineTrigger 2 :foundred "Team: mega"&$i&" " 
		pause

		:toomanyred	
			setVar $SWITCHBOARD~MESSAGE "Too many bots responding to mega"&$i&".  Please fix bot teams so each red is unique.*"
			gosub :SWITCHBOARD~SWITCHBOARD
			halt

		:foundred
			getWordPos CURRENTLINE $pos "Team: "
			cutText CURRENTLINE $line $pos 9999
			getWord $line $sector 4
			getWord $line $exp 6
			getWord $line $align 8
			getWord $line $credits 10
			getWord $line $ship 12
			getWord $line $turns 14

			if (($turns < 10) AND ($PLAYER~UNLIMITED_GAME <> TRUE))
				setVar $SWITCHBOARD~MESSAGE "mega"&$i&" does not have enough turns for stealing or buydowns.  Replace them with someone with turns.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			end			
			getWordPos $align $pos "-"
			if ($pos > 0)
				add $red_count 1
				#mark as potential robber#
				setvar $BOTS[$i][2] true
				if ($current_robber <> 0)
					setvar $backup_robber $current_robber
				end
				setvar $current_robber $BOTS[$i]
				setVar $SWITCHBOARD~MESSAGE "Found potential mega robber!*"
				gosub :SWITCHBOARD~SWITCHBOARD
			else
				add $blue_count 1
			end
			setVar $BOTS[$i] $i
			setVar $BOTS[$i][1] $turns
			setVar $CURRENT_SHIP[$i] $ship
			setVar $ORIGINAL_SHIP[$i] $ship
			killtrigger 1
			setTextLineTrigger 1 :toomanyred "} - Team: mega"&$i&" " 
			pause
		:donered
			killtrigger 1
			if ($BOTS[$i] = 0)
				setVar $roll_call_done TRUE
			else
				send "'mega"&$i&"*"
				waiton "} - You are logged into this bot. "
				# bot name #
				gettext currentline $BOTS[$i][3] "] ["&$player~current_sector&"] {" "} - You are logged into this bot." 
				setVar $SWITCHBOARD~MESSAGE "Bot name captured as: "&$BOTS[$i][3]&"*"
				gosub :SWITCHBOARD~SWITCHBOARD
			end
			add $i 1
	end

	if ($red_count < 1)
		setVar $SWITCHBOARD~MESSAGE "Found "&$red_count&" reds. Need at least one red.  Make sure all bots callin as mega1, mega2, etc.*"
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

	setArray $checkedPorts SECTORS
	setArray $que SECTORS
	setArray $checked SECTORS
	setvar $minimumProduct 10000

while (true) 
	gosub :player~quikstats
	gosub :grabplanetstats
	gosub :findports
	gosub :pwarptoport
	if ($isGoodBuyer = true)
		gosub :findbestcandidates
		gosub :selloffproduct
		setvar $check $current_trader
		gosub :checkin
	end
	if ($isGoodSeller = true)
		gosub :findbestcandidates
		gosub :startbuydownequip
		setvar $check $current_trader
		gosub :checkin

		gosub :findbestcandidates
		gosub :startbuydownfuel
		setvar $check $current_trader
		gosub :checkin

		gosub :findbestcandidates
		gosub :domega
		if (($do_backup_robber = true) and ($backup_robber <> "0"))
			setvar $save_current_robber $current_robber
			setvar $current_robber $backup_robber
			gosub :domega
			setvar $current_robber $save_current_robber
		end
		setvar $check $current_robber
		gosub :checkin
	end

end



halt

:checkin
	killtrigger 1
	send "'mega"&$check&" callout*"
	setTextLineTrigger 1 :foundtrader "Team: mega"&$i&" " 
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

		setvar $BOTS[$check][1] $turns
return
:domega
	setvar $once 0
	setvar $do_backup_robber false
	:megaagain
	setvar $evilbot $BOTS[$current_robber][3]
	send "'" $evilBot " mega*"
	
	setTextLineTrigger 1 :mrBusted "[Busted"
	setTextLineTrigger 2 :mrBusted2 "Fake Busted"
	setTextLineTrigger 3 :mrshort "Port is short"
	setTextLineTrigger 4 :mrrobbed "credits robbed"
	setTextLineTrigger 5 :mrsecond "credits left for a second mega"
	pause
		:mrshort 
			gosub :killthetriggers
			if ($once = 1)
				goto :oncegogo
			end
			setvar $once 1
			gosub :waitFor200e
			
			send "'" $nextBot " mac cr**q"
			waitfor "Macro Complete"

			send "'" $nextBot " buy e w*"
			waitfor "Buy down exiting"
			goto :megaagain
			:oncegogo
			echo "*# We are short... waiting for GO GO GO"
			gosub :waitForGo
		:mrrobbed
		:mrBusted
		:mrBusted2
			gosub :killthetriggers
			setTextLineTrigger 1 :mrsecond "credits left for a second mega"
			setDelayTrigger    2 :mrdelayover 2000
			pause
			:mrdelayover
				gosub :killthetriggers 
				return
		:mrsecond
			add $moreRobsi 1
			setvar $do_backup_robber true
			gosub :killthetriggers 
			return

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

:startbuydownequip
	setvar $nextbot $BOTS[$current_trader][3]
	send "'" & $nextbot & " buy e w *"

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
		send "'" & $nextbot & " buy e w *"
	:startDock1
	:startDock2
		gosub :killthetriggers

	setTextLineTrigger 1 :bdComplete1 "] {"&$nextbot&"} - Buy down exiting --- Normal Exit"
	setTextLineTrigger 2 :bdcash1 "] {"&$nextbot&"} - Buy down exiting --- Not enough cash onhand"

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

:startbuydownfuel
	setvar $nextbot $BOTS[$current_trader][3]
	send "'" & $nextbot & " buy f s *"

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
		send "'" & $nextbot & " buy f s *"
	:startDock1
	:startDock2
		gosub :killthetriggers

	setTextLineTrigger 1 :bdComplete1 "] {"&$nextbot&"} - Buy down exiting --- Normal Exit"
	setTextLineTrigger 2 :bdcash1 "] {"&$nextbot&"} - Buy down exiting --- Not enough cash onhand"

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

:selloffproduct
	:startSell
	send "'"&$BOTS[$current_trader][3]&" neg o e*"
	waitfor "] {"&$BOTS[$current_trader][3]&"} - Done with port"
	send "cr*q"
	waitfor "Commerce report for"
	waitfor "Equipment"
	getWord CURRENTLINE $eonhand 3
	if ($eonhand > 5000)
		setVar $SWITCHBOARD~MESSAGE "Neg fail detected! trying again*"
		gosub :SWITCHBOARD~SWITCHBOARD
		goto :startSell
	end
return

:findbestcandidates
	setvar $i 1
	setvar $highest_turns 0
	setvar $current_trader 0 
	while ($i <= $MAX_BOTS)
		# pick the bot with highest turn who is not the designated robber #
		if (($BOT[$i][1] > $highest_turns) and ($current_robber <> $BOT[$i]))
			setvar $current_trader $BOT[$i] 
			setvar $highest_turns $BOT[$i][1]
		end
		add $i 1
	end
	if ($current_trader = "0")
		setVar $SWITCHBOARD~MESSAGE "Well, that shouldn't have happened.  I can't find a trader to go next!  Halting.*"
		gosub :SWITCHBOARD~SWITCHBOARD
		halt
	end
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
		setArray $checked SECTORS
		setVar $que[1] $PLAYER~CURRENT_SECTOR
		setVar $checked[$PLAYER~CURRENT_SECTOR] 1
		:tryAgain2
		while ($bottom <= $top)
			# Now, pull out the next sector in the que, and make it our focus
			setVar $focus $que[$bottom]

			getSectorParameter $focus "MEGABUY" $isGoodBuyer
			getSectorParameter $focus "MEGASELL" $isGoodSeller
			getSectorParameter $focus "FIGSEC" $isFigged

			# Check to see if planet has equipment to sell, or if planet is too full to go to next seller.  #
			# Hopefully it will pick the closest, best option based on this. #

			if ((($isGoodBuyer = true) and ($planet~PLANET_EQUIPMENT > $minimumProduct)) OR (($isGoodSeller = true) and (($planet~PLANET_EQUIPMENT_MAX - $planet~PLANET_EQUIPMENT) > $game~port_max)))
				# fig found 0 hops
				setVar $NearFig $focus
				setVar $checkedPorts[$NearFig] TRUE
				setVar $totalPortFuel PORT.FUEL[$focus]
				return
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
		setVar $SWITCHBOARD~message "Can't find a route to any other MEGABUY OR MEGASELL ports.*"
		gosub :SWITCHBOARD~switchboard
		halt
return

:pwarptoport
	gosub :killthetriggers
	send "p"&$NearFig&"*ys** "
	setTextLineTrigger 1 :emptyPort "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
	setTextLineTrigger 2 :emptyPort "You are already in that sector!"
	setTextLineTrigger 3 :noFigAtLocation "Your own fighters must be in the destination to make a safe jump."
	setTextLineTrigger 4 :doneNoFuel "You do not have enough Fuel Ore on this planet to make the jump."
	pause			
	:emptyPort
		gosub :killthetriggers
		setSectorParameter $NearFig "FIGSEC" TRUE
		return
	:noFigAtLocation
		gosub :killthetriggers
		setSectorParameter $NearFig "FIGSEC" FALSE
		return
	:doneNoFuel
		gosub :killthetriggers
		setVar $SWITCHBOARD~message "Your planet doesn't have enough fuel to jump to the next closest port.  Halting.*"
		gosub :SWITCHBOARD~switchboard
		halt


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
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\planet\getplanetinfo\planet"
