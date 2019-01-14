	loadVar $game~goldenabled
	loadVar $game~mbbs
	loadVar $game~port_max
	loadvar $game~rob_factor
	loadVar $game~production_rate
	loadVar $bot~folder
	setVar  $bot~no_credits_file $bot~folder&"/No_Credits.list"
	savevar $bot~no_credits_file

	gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&"- wrob [minimum rob amount] {upgraded} {skipcim}            " 
	setVar $BOT~help[2]  $BOT~tab&"    Travels universe robbing ports                          " 
	setVar $BOT~help[3]  $BOT~tab&"                                                            " 
	setVar $BOT~help[4]  $BOT~tab&"    [minimum rob amount]                                    "
	setVar $BOT~help[5]  $BOT~tab&"       - Amount that must be on port before attempting rob  " 
	setVar $BOT~help[6]  $BOT~tab&"    [upgraded]                                              " 
	setVar $BOT~help[7]  $BOT~tab&"       - Will only visit upgraded ports                     " 
	setVar $BOT~help[8]  $BOT~tab&"    [skipcim]                                               " 
	setVar $BOT~help[9]  $BOT~tab&"       - Will skip running CIM port report before running   " 
	setVar $BOT~help[10] $BOT~tab&"    [CLEAR_EMPTY]                                           " 
	setVar $BOT~help[11] $BOT~tab&"       - Will delete the empty port file                    " 

	gosub :BOT~help_file

	setVar $BOT~script_title "World Rob"
	gosub :BOT~banner

	setVar $PLAYER~save TRUE


:merchant
	gosub :player~quikstats
	setVar $startingLocation $player~current_prompt
	if ($startingLocation <> "Citadel")
		send "'{" $bot~bot_name "} - You must run World Rob command from a Citadel prompt.*"
     		halt
	end

	setVar $minimumPort $bot~parm1
	isNumber $number $minimumPort
	if ($number <> 1)
		send "'{" $bot~bot_name "} - Minimum rob amount entered is not a number!*"
		halt
	end
	if ($minimumPort <= 0)
		send "'{" $bot~bot_name "} - Minimum rob amount must be greater than 0.*"
		halt
	end

	getWordPos $bot~user_command_line $pos "cim"
	if ($pos > 0)
		setVar $skipcim TRUE
	else
		setVar $skipcim FALSE
	end

	getWordPos $bot~user_command_line $pos "upgrade"
	if ($pos > 0)
		setVar $visitUpgraded TRUE
	else
		setVar $visitUpgraded FALSE
	end

:merchant
	killalltriggers
	setArray $checkedPorts SECTORS
	setArray $que SECTORS
	setArray $checked SECTORS
	send "q"
	waitOn "Planet command (?"
	gosub :planet~getplanetinfo
	send "c"
	if ($planet~citadel < 4)
		send "'{" $bot~bot_name "} - You must run World Rob from at least a level 4 planet.*"
     		halt
	end
	gosub :player~quikstats
	setVar $sectorCount 10
	setVar $totalHolds 0 
	setVar $spentCredits 0 
	setVar $startingSector $player~current_sector
	
	if ($skipcim = FALSE)
		send "'{" $bot~bot_name "} - World Rob Downloading Current Port CIM Data - Comms Off*"
		send "^rq"
		waitFor ": ENDINTERROG"
		send "'{" $bot~bot_name "} - World Rob CIM Port Data Complete - Comms Back On*"
	end
	lowerCase $bot~parm1
	if ($bot~parm1 = "clear_empty")
		delete $bot~no_credits_file
		send "'{" $bot~bot_name "} - 'No Money' file for this bot has been cleared.*"
		halt
	end
	setArray $EMPTY_GRID SECTORS
	fileExists $exists $bot~no_credits_file
	if ($exists)
		send "'{" $bot~bot_name "} Reading 'No Money' Ports from file..*"
		setVar $read_count 1
		read $bot~no_credits_file $temp $read_count
		while ($temp <> "EOF")
			getWord $temp $bustLocation 1
			setVar $EMPTY_GRID[$bustLocation] TRUE
			add $read_count 1
			read $bot~no_credits_file $temp $read_count
		end
	else
		send "'{" $bot~bot_name "} No 'No Money' file, starting clean..*"
	end

	while (true)
		if (($player~unlimitedgame = FALSE) AND ($player~turns <= $player~bot_turn_limit))
			send "'{" $bot~bot_name "} - Turns too low to continue.*"
			goto :doneWorldRob
		end
		setVar $isFigged FALSE
		while ($isFigged <> TRUE)
			gosub :findNearestRobPort
			gosub :checkPort
			if ($foundPort = TRUE)
				gosub :pwarp
				getSectorParameter $NearFig "FIGSEC" $isFigged
			end
		end
		gosub :rob
		gosub :player~quikstats	
			
	end
		:doneWorldRob
			send "p"&$startingSector&"*y"
			send "'{" $bot~bot_name "} - World Rob completed.*"
			halt

:checkPort
	setVar $foundPort FALSE
	send "c r "&$nearFig&"*q "
	waitOn "What sector is the port in? ["&$player~current_sector&"] "&$nearFig
	killalltriggers
	setTextLineTrigger crchecknothere   :checkPortTryagain "I have no information about a port in that sector."
	setTextLineTrigger crneverbeenthere :checkPort2 "You have never visted sector"
	setTextLineTrigger crclass0         :checkPortTryagain  "A  Cargo holds     :"
	waitOn " Items     Status  Trading % of max OnBoard"
	:checkPort2
		killalltriggers
		setVar $foundPort TRUE

	:checkPortTryAgain
		killalltriggers	
		if ($foundPort <> TRUE)
			setVar $checkedPorts[$nearfig] TRUE	
		end
return

:pwarp
	killAllTriggers
	send "p"&$NearFig&"*y"
	setTextLineTrigger warped :emptyPort2 "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
	setTextLineTrigger same :emptyPort2 "You are already in that sector!"
	setTextLineTrigger didnotwarp :noFigAtLocation "Your own fighters must be in the destination to make a safe jump."
	setTextLineTrigger notEnoughFuel :doneNoFuel2 "You do not have enough Fuel Ore on this planet to make the jump."
	pause			
	:emptyPort2
		setSectorParameter $NearFig "FIGSEC" TRUE
		return
	:noFigAtLocation
		setVar $checkedPorts[$nearfig] TRUE
		setSectorParameter $NearFig "FIGSEC" FALSE
		return
	:doneNoFuel2
		halt


:findNearestRobPort
		setVar $bottom 1
		setVar $top 1
		setArray $checked SECTORS
		if ($lastSteal > 0)
			setVar $que[1] $lastSteal
			setVar $checked[$lastSteal] 1
		else
			setVar $que[1] $player~current_sector
			setVar $checked[$player~current_sector] 1
		end
		:tryAgain2
		while ($bottom <= $top)
			# Now, pull out the next sector in the que, and make it our focus
			setVar $focus $que[$bottom]
			# If this sector is our xxB, we're done!
			getSectorParameter $focus "BUSTED" $isBusted
			if ($visitUpgraded)
				setVar $isUpped FALSE
				setVar $upgradeLimit 10000
				if (PORT.BUYFUEL[$focus] = FALSE) 
					if (port.percentfuel[$focus] <> 0)
						divide $currentfuel port.percentfuel[$focus]
					end
					if ($currentfuel > $upgradeLimit)
						setVar $isUpped TRUE
					end
				end
				if (PORT.BUYORG[$focus] = FALSE) 
					setVar $currentorg port.org[$focus]
					multiply $currentorg 100
					if (port.percentorg[$focus] <> 0)
						divide $currentorg port.percentorg[$focus]
					end
					if ($currentorg > $upgradeLimit)
						setVar $isUpped TRUE
					end
				end
				
				if (PORT.BUYEQUIP[$focus] = FALSE) 
					setVar $currentEquip port.equip[$focus]
					multiply $currentEquip 100
					if (port.percentequip[$focus] <> 0)
						divide $currentEquip port.percentequip[$focus]
					end
					if ($currentEquip > $upgradeLimit)
						setVar $isUpped TRUE
					end
				end
			end
			getSectorParameter $focus "FIGSEC" $isFigged
			if (($isFigged = TRUE) AND ($EMPTY_GRID[$focus] <> TRUE) AND ($checkedPorts[$focus] <> TRUE) AND (PORT.EXISTS[$focus] = TRUE) AND ($isBusted <> TRUE) AND ($focus <> $player~current_sector) AND ($focus <> $laststeal) AND (PORT.CLASS[$focus] <> "0") AND (PORT.CLASS[$focus] <> "8") AND ((($visitUpgraded = TRUE) AND ($isUpped = TRUE)) OR ($visitUpgraded = FALSE)))
				# fig found 0 hops
				setVar $NearFig $focus
				return
			else
				setVar $checked[$focus] 1
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
		send "'{" $bot~bot_name "} Can't find a route to any other ports.*"
     		halt
return
# ============================== ROB (ROB) ==============================
:rob
		
	killalltriggers
	gosub :player~quikstats
	setVar $startingLocation $player~current_prompt
	
	cutText $player~alignment $neg_ck 1 1
	
	stripText $player~alignment "-"
	if ($player~alignment < 100) and ($neg_ck = "-")
		send "'{" $bot~bot_name "} - Need -100 Alignment Minimum*"
		goto :wait_for_command
	elseif ($neg_ck <> "-")
		send "'{" $bot~bot_name "} - Need -100 Alignment Minimum*"
		goto :wait_for_command
	end
	send "q q pr * r"
	setTextLinetrigger valid :rob_continue "<R> Rob this Port"
	setTextLinetrigger notvalid :rob_not_valid "<Q> Quit, nevermind"
	pause
	:rob_continue
	killtrigger notvalid
	setTextLineTrigger fake :rob_fake "Busted!"
	setTextLinetrigger mega :rob_ok "port has in excess of"
	pause

:rob_fake
	killalltriggers
	if ($startingLocation = "Citadel")
		gosub :planet~landingSub
	end
	setSectorParameter $player~current_sector "BUSTED" TRUE
	send "'{" $bot~bot_name "} - Fake Busted*"
	return

:rob_ok
	killalltriggers
	#setvar $rob $player~experience
	#multiply $rob 3
	#multiply $game~rob_factor 100
	setVar $rob ($game~rob_factor*$player~experience)
	getWord CURRENTLINE $port_cash 11

	stripText $port_cash ","
	setVar $original_port_cash $port_cash
	multiply $port_cash 10
	divide $port_cash 9
#	if (($port_cash >= 3000000) AND ($game~mbbs = TRUE))
#		send "'{" $bot~bot_name "} - " $port_cash " credits on port.  Port is ready for Mega Rob**"
#		gosub :planet~landingSub
#		goto :wait_for_command
#	end
	if ($port_cash < $minimumPort)
		echo "*Port has less than "&$minimumPort&" credits on it.*"
		send "0*"
		setVar $rob 0
	elseif ($port_cash >= $rob) 
		send $rob "*"
	elseif ($port_cash < $rob)
		setVar $rob $port_cash
		send $rob "*"
	end
	if ($port_cash < $minimumPort)
		setVar $checkedPorts[$player~current_sector] TRUE	
		setVar $EMPTY_GRID[$player~current_sector] TRUE
		write $bot~no_credits_file $player~current_sector		
	end
	setTextLineTrigger port_empty :rob_suc "Maybe some other day, eh?"
	setTextLineTrigger mega_suc :rob_suc "Success!"
	setTextLineTrigger mega_bust :rob_bust "Busted!"
	pause

:rob_bust
	killalltriggers
	if ($startingLocation = "Citadel")
		gosub :planet~landingSub
	end
	setSectorParameter $player~current_sector "BUSTED" TRUE
	send "'<"&$subspace&">[Busted:"&$player~current_sector&"]<"&$subspace&">* "
	return

:rob_ready_to_mega
	killalltriggers
	send "0*  "
	if ($startingLocation = "Citadel")
		gosub :planet~landingSub
	end
	return

:rob_not_valid
	killalltriggers
	setVar $checkedPorts[$player~current_sector] TRUE	
	setVar $EMPTY_GRID[$player~current_sector] TRUE
	write $bot~no_credits_file $player~current_sector	
	setVar $rob 0
	setVar $original_port_cash 0	
:rob_suc
	killalltriggers
	if ($startingLocation = "Citadel")
		send "l " $planet~planet "* c t t " $rob "* "
	end
	if ($rob > $original_port_cash)
		setVar $checkedPorts[$player~current_sector] TRUE	
		setVar $EMPTY_GRID[$player~current_sector] TRUE
		write $bot~no_credits_file $player~current_sector				
	end
	if ($rob > 0)
		setVar $laststeal $player~current_sector
		send "'{" $bot~bot_name "} - Success! - " $rob " credits robbed*"
	end
	return
# ============================== END ROB (ROB) SUB ==============================



#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
