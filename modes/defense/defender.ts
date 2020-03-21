	logging off
	#####################################
	# Main defender configuration setup #
	#####################################
	
	gosub :BOT~loadVars
	loadvar $MAP~STARDOCK
	loadvar $map~home_sector
	loadvar $SHIP~cap_file
	loadvar $game~internalAliens
	loadvar $game~internalFerrengi
	loadvar $game~limpet_cost
	loadvar $game~limpet_removal_cost
	loadvar $game~armid_cost
	loadvar $game~photon_cost
	loadvar $game~DISRUPTOR_COST

	setvar $check_history false
	setarray $fire_history sectors

	setVar $START_FIG_HIT "Deployed Fighters Report Sector "
	setVar $END_FIG_HIT   ":"
	setVar $ALIEN_ANSI    #27 & "[1;36m" & #27 & "["
	setVar $START_FIG_HIT_OWNER ":"
	setVar $END_FIG_HIT_OWNER "'s"


	setVar $BOT~help[1]  $BOT~tab&"Grid defender {f} {l} {a} {auto} {holo} {mines} {extern:11pm}  "
	setVar $BOT~help[2]  $BOT~tab&"             "
	setVar $BOT~help[3]  $BOT~tab&"        {f} - Photon fighter hits "
	setVar $BOT~help[4]  $BOT~tab&"        {l} - Photon limpet hits "
	setVar $BOT~help[5]  $BOT~tab&"        {a} - Photon armid hits "
	setVar $BOT~help[6]  $BOT~tab&"     {holo} - holoscan on ss after photon "
	setVar $BOT~help[7]  $BOT~tab&"   {secure} - will only escape to limped sectors "
	setVar $BOT~help[8]  $BOT~tab&"   {extern} - stops defender 5 minutes before extern "
	setVar $BOT~help[9]  $BOT~tab&"              as defined by local system time "
	setVar $BOT~help[10] $BOT~tab&"  {density} - density photon option"
	setVar $BOT~help[11] $BOT~tab&" {adjacent} - adjacent photon option (default)"
	setVar $BOT~help[12] $BOT~tab&" {holokill} - holokill if possible"
	setVar $BOT~help[13] $BOT~tab&"{slingshot} - will pgrid holokill"
	setVar $BOT~help[14] $BOT~tab&" {nophoton} - will not fire photon"
	setVar $BOT~help[15] $BOT~tab&" {noescape} - will not retreat from attack sector"
	setVar $BOT~help[16] $BOT~tab&"     {auto} - Will reset cannon damages automatically"
	setVar $BOT~help[17] $BOT~tab&"  {capture} - capture instead of kill "
	setVar $BOT~help[18] $BOT~tab&"    {mines} - auto deploy mines as you go "
	setVar $BOT~help[19] $BOT~tab&"           "
	setVar $BOT~help[20] $BOT~tab&"        Examples: "
	setVar $BOT~help[21] $BOT~tab&"             >defender f l a holo "
	setVar $BOT~help[22] $BOT~tab&"             >defender f l a density  "
	setVar $BOT~help[23] $BOT~tab&"             >defender f density adjacent secure"

	gosub :bot~helpfile

	setvar $script_ver "Grid Defender"
	setVar $BOT~script_title $script_ver
	gosub :BOT~banner

	setVar $PLAYER~save TRUE
	gosub :combat~init 

	setvar $killing~last_fighter_attack ""
	
	getSectorParameter SECTORS "FIGSEC" $isFigged
	if (($MAP~stardock = 0) OR ($MAP~stardock = ""))
		setVar $SWITCHBOARD~message "Stardock is not defined.  Please define stardock variable in the bot.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($isFigged = "")
		setVar $SWITCHBOARD~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($PLAYER~current_prompt <> "Citadel")
		setVar $SWITCHBOARD~message "Must run "&$script_ver&" from citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setvar $map~home_sector $player~current_sector


	getwordpos " "&$bot~user_command_line&" " $pos " f "
	if ($pos > 0)
		setvar $fighter true
	else
		setvar $fighter false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " l "
	if ($pos > 0)
		setvar $limpet true
	else
		setvar $limpet false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " a "
	if ($pos > 0)
		setvar $armid true
	else
		setvar $armid false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " auto "
	if ($pos > 0)
		setvar $killing~auto true
	else
		setvar $killing~auto false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " holo "
	if ($pos > 0)
		setvar $holo true
	else
		setvar $holo false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " holokill "
	if ($pos > 0)
		setvar $killing~holokill true
	else
		setvar $killing~holokill false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " slingshot "
	if ($pos > 0)
		setvar $killing~slingshot true
		setvar $killing~holokill false
	else
		setvar $killing~slingshot false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " secure "
	if ($pos > 0)
		setvar $navigate~securePwarp true
	else
		setvar $navigate~securePwarp false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " density "
	if ($pos > 0)
		setvar $photon~density true
	else
		setvar $photon~density false
	end

	if ($photon~density = true)
		getwordpos " "&$bot~user_command_line&" " $pos " adj"
		if ($pos > 0)
			setvar $photon~adjacentphoton true
		else
			setvar $photon~adjacentphoton false
		end
	else
		setvar $photon~adjacentphoton true
	end

	getwordpos " "&$bot~user_command_line&" " $pos " nophoton "
	if ($pos > 0)
		setvar $nophoton true
		setvar $photon~adjacentphoton false
		setvar $photon~density false
	else
		setvar $nophoton false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " noescape "
	if ($pos > 0)
		setvar $noescape true
	else
		setvar $noescape false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " capture "
	if ($pos > 0)
		setvar $killing~capture true
	else
		setvar $killing~capture false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " mines "
	if ($pos > 0)
		setvar $restock~deploymines true
	else
		setvar $restock~deploymines false
	end

	if (($fighter <> true) and ($armid <> true) and ($limpet <> true))
		setvar $fighter true
		setvar $armid true
		setvar $limpet true
	end

	gosub :PLAYER~getInfo
	gosub :killtriggers
	send "q"
	gosub :PLANET~getPlanetInfo	
	send "t*t1* c "

	setvar $call~starting_planet $planet~planet


	#######################################################################################################
	# need to add a check here to make sure no nav haz or enemy limpets in starting sector before furbing #
	#######################################################################################################

    fileExists $SHIP~cap_file_chk $SHIP~cap_file
    if ($SHIP~cap_file_chk <> TRUE)
        gosub :SHIP~getShipCapStats
    else
		gosub :ship~loadShipInfo
    end

    gosub :SHIP~getShipStats
	gosub :player~quikstats

	setvar $call~starting_ship_type $player~ship_type

	gosub :check_for_photon_refurb

	################################
	# check for aliens in the game #
	################################
	setvar $game~hasAliens false

	send "#/"
	waiton "Who's Playing"
	setTextLineTrigger	1	:alien	"are on the move!"
	setTextTrigger		2	:aliendone (#179 & "Turns")
	pause
	:alien
		setvar $game~hasAliens true
	:aliendone
		killtrigger 1
		killtrigger 2
		savevar $game~hasAliens



	setVar $message "'*  {"&$bot~bot_name&"} - "&$script_ver&" Currently Running On Planet "&$planet~planet&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
	if ($fighter)
		setVar $message $message&"*                 On Fighter Hit: Yes"
	else
		setVar $message $message&"*                 On Fighter Hit: No"
	end
	if ($limpet)
		setVar $message $message&"*                  On Limpet Hit: Yes"
	else
		setVar $message $message&"*                  On Limpet Hit: No"
	end
	if ($armid)
		setVar $message $message&"*                   On Armid Hit: Yes"
	else
		setVar $message $message&"*                   On Armid Hit: No"
	end
	if ($photon~adjacentphoton)
		setVar $message $message&"*                Adjacent Photon: Yes"
	else
		setVar $message $message&"*                Adjacent Photon: No"
	end
	if ($photon~density)
		setVar $message $message&"*   Density Photon Attack Sector: Yes"
	else 
		setVar $message $message&"*   Density Photon Attack Sector: No"
	end
	if ($killing~holokill)
		setVar $message $message&"*                       Holokill: Yes"
	else
		setVar $message $message&"*                       Holokill: No"
	end
	if ($killing~slingshot)
		setVar $message $message&"*                      Slingshot: Yes"
	else
		setVar $message $message&"*                      Slingshot: No"
	end
	if ($holo)
		setVar $message $message&"*                    Holo Report: Yes"
	else
		setVar $message $message&"*                    Holo Report: No"
	end
	if ($killing~auto)
		setVar $message $message&"*                   Cannon Reset: Yes"
	else
		setVar $message $message&"*                   Cannon Reset: No"
	end
	if ($killing~capture)
		setVar $message $message&"*              Capture, not kill: Yes"
	else
		setVar $message $message&"*              Capture, not kill: No"
	end
	if ($restock~deploymines)
		setVar $message $message&"*                   Deploy mines: Yes"
	else
		setVar $message $message&"*                   Deploy mines: No"
	end
	setVar $message $message&"*                    Home Sector: "&$map~home_sector
	format $planet~planet_fighters $formatted_fighters NUMBER
	setVar $message $message&"*        Auto Kill: Enabled With "&$formatted_fighters&" Fighters"
	setVar $message $message&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"	
	send $message

	if (($killing~holokill = true) and ($player~photons > 1))
		setvar $switchboard~message "Holokill with more than one photon is not advised.  Be careful.*"
		gosub :switchboard~switchboard
	elseif (($killing~holokill = true) and ($nophoton = true) and ($player~photons > 0))
		setvar $switchboard~message "You are running holokill with a photon, with photon mode off.  Could be a recipe for disaster.  Be careful out there.*"
		gosub :switchboard~switchboard
	end

	###########################################
	# Main information processor for defender #
	###########################################

	:processing
		gosub :killtriggers
		setTextTrigger 1 :pausing "Planet command (?="
		setTextTrigger 2 :pausing "Computer command ["
		setTextTrigger 3 :pausing "Corporate command ["
		setTextTrigger 4 :pausing "Transfer To or From the Treasury (T/F)"
		setTextTrigger 5 :pausing "Qcannon Control Type :"
		setTextTrigger 6 :pausing "Beam to what sector? (U=Upgrade"

		setTextLineTrigger 7  :scan "warps into the sector."
		setTextLineTrigger 8  :scan " lifts off from"
		setTextLineTrigger 9  :scan "Limpet mine in "&$player~current_sector
		setTextLineTrigger 10 :scan "Deployed Fighters Report Sector "&$player~current_sector&":"
		setTextLineTrigger 11 :scan "Quasar Cannon on"
		setTextLineTrigger 12 :scan "Shipboard Computers The Interdictor Generator on"
		setTextLineTrigger 13 :scan " is powering up weapons systems!"
		settextlinetrigger 14 :scan " launches a wave of fighters at the "
		settextlinetrigger 15 :scan	" launches a Genesis Torpedo into the sector!"
		settextlinetrigger 16 :scan " appears from the planetary rubble."
		setTextLineTrigger 17 :scan " exits the game."
		setTextLineTrigger 18 :scan " enters the game."
		setDelayTrigger	   19 :announce	1200000
		setDelayTrigger	   20 :head_home_timeout 3600000
		setTextLineTrigger 24 :scan "Planetary TransWarp Drive Engaged!"
		

		#############################################################################################
		# Check for adjacent sectors in current location, for faster shooting if they come adjacent #
		#############################################################################################
		setarray $photon~adjacent 6
		setVar $i 1
		while (SECTOR.WARPS[$player~current_sector][$i] > 0)
			setTextTrigger "adjl"&$i&"" :photon_adjacent_limpet "Limpet mine in "&SECTOR.WARPS[$player~current_sector][$i]&" "
			setTextTrigger "adjf"&$i&"" :photon_adjacent_fighter "Deployed Fighters Report Sector "&SECTOR.WARPS[$player~current_sector][$i]&":"
			setTextTrigger "adja"&$i&"" :photon_adjacent_armid "Your mines in "&SECTOR.WARPS[$player~current_sector][$i]&" "
			add $i 1
		end

		if ($limpet)
			setTextTrigger 21 :attackSectorLimpet "Limpet mine in "
		end
		if ($armid)
			setTextTrigger 22 :attackSectorMine "Your mines in "
		end
		if ($fighter)
			setTextTrigger 23 :attackSectorFighter "Deployed Fighters "
		end
		pause
			

		:announce 
		setvar $description ""
		if ($photon~adjacentphoton)
			setvar $description $description&"Photon "
		end
		if ($photon~density)
			setvar $description $description&"Density "
		end
		if ($killing~holokill)
			if ($killing~capture)
				setvar $description $description&"Holocap "
			else
				setvar $description $description&"Holokill "
			end
		end
		if ($killing~slingshot)
			setvar $description $description&"Slingshot "
		end
		if ($killing~capture)
			setvar $description $description&"Capture "
		end
		if ($navigate~securePwarp)
			setvar $description $description&"Secure "
		end
		trim $description
		if ($description <> "")
			setvar $description " ("&$description&")"
		end
		setvar $switchboard~message $script_ver&$description&" is online and ready to fire.*"
		gosub :switchboard~switchboard

		setDelayTrigger	   19 :announce	1200000
		pause		

		:head_home_timeout
			gosub :killtriggers
			if ($player~current_sector <> $map~home_sector)
				setvar $switchboard~message "No activity in an hour, so heading home.*"
				gosub :switchboard~switchboard
			else
				goto :processing
			end
		:head_home 
			gosub :killtriggers
			gosub :player~quikstats
			echo ansi_2&"*Checking status after inactivity..*"
			if ($player~current_sector <> $map~home_sector)
				gosub :navigate~navigate_to_limp
				gosub :killing~scan_for_targets
				gosub :navigate~runaway_if_needed
				gosub :restock~refurb_photons
				send "p"&$map~home_sector&"*y "
			end
			if ($player~current_prompt = "Citadel")
				send "q"
				gosub :PLANET~getPlanetInfo	
				send "t*t1* c "
				if (($planet~PLANET_FIGHTERS_MAX - $planet~planet_fighters) > ($ship~SHIP_FIGHTERS_MAX))
					setvar $movefig~planetorsector "p"
					gosub :movefig~run
				end
			end
			gosub :player~quikstats
			if ($player~current_prompt = "Citadel")		
				send "q"
				gosub :PLANET~getPlanetInfo	
				send "t*t1* c "
				if ($planet~planet_fighters < $ship~SHIP_FIGHTERS_MAX)
					setvar $switchboard~message "Even after grabbing figs from sector, not enough fighters.  Shutting down..*"
					gosub :switchboard~switchboard
					halt
				end
			end
		goto :processing

	halt


#################################################################
# Photon routines - fire photon, move away, restock, set cannon #
#################################################################

:photon_adjacent_limpet
	gosub :photon~limpet_spoof
	if ($nophoton <> true)
		gosub :photon~fire_adjacent
	end
	goto :done_firing

:photon_adjacent_armid
	gosub :photon~armid_spoof
	if ($nophoton <> true)
		gosub :photon~fire_adjacent
	end
	goto :done_firing

:photon_adjacent_fighter
	gosub :photon~fighter_spoof
	if ($nophoton <> true)
		gosub :photon~fire_adjacent
	end
	goto :done_firing


:attackSectorLimpet
	gosub :photon~limpet_spoof
	goto :check_to_fire_photon

:attackSectorMine
	gosub :photon~armid_spoof
	goto :check_to_fire_photon

:attackSectorFighter
	gosub :photon~fighter_spoof


:check_to_fire_photon
	killalltriggers
	if ($photon~found = true)
		if ($photon~retreatfighter <> true)
			if (($fire_history[$photon~sector] > 5) or ($photon~last_sector = $photon~sector) or ($photon~sector = $map~home_sector))
				goto :can_not_fire
			end
			getsectorparameter $photon~sector "BUBBLE" $isBubble
			getsectorparameter $photon~sector "FARM" $isFarm
			if (($isBubble = true) or ($isFarm = true))
				setvar $switchboard~message "Can not fire into bubble or farm sector "&$photon~sector&"!*"
				gosub :switchboard~switchboard
				goto :can_not_fire
			end
			gosub :photon~photon
		else
			gosub :photon~retreatphoton
		end
#		setVar $i 1
#		while (SECTOR.WARPS[$player~current_sector][$i] > 0)
#			setTextTrigger "adjl"&$i&"" :photon_adjacent_limpet "Limpet mine in "&SECTOR.WARPS[$player~current_sector][$i]&" "
#			setTextTrigger "adjf"&$i&"" :photon_adjacent_fighter "Deployed Fighters Report Sector "&SECTOR.WARPS[$player~current_sector][$i]&":"
#			setTextTrigger "adja"&$i&"" :photon_adjacent_armid "Your mines in "&SECTOR.WARPS[$player~current_sector][$i]&" "
#			add $i 1
#		end
#		if ($limpet)
#			setTextTrigger 1 :attackSectorLimpet "Limpet mine in "
#		end
#		if ($armid)
#			setTextTrigger 2 :attackSectorMine "Your mines in "
#		end
#		if ($fighter)
#			setTextTrigger 3 :attackSectorFighter "Deployed Fighters "
#		end
#		setDelayTrigger wait :done_waiting_for_hits 300
#		pause
#
#		:done_waiting_for_hits
#			gosub :killtriggers

		:done_firing
		killalltriggers
		#############################################
		# holoscan sector to see if victim is there #
		#############################################
		gosub :killing~scan_for_targets
		if ($killing~error = true)
			goto :head_home
		end
		if ($killing~slingshot = true)
			gosub :killing~slingshot
		elseif ($killing~holokill = true)
			gosub :killing~doholokill
			if (($photon~sector <> $MAP~stardock) AND ($photon~sector  > 10) AND (SECTOR.TRADERCOUNT[$photon~sector] > 0) AND ($combat~safePlanets = TRUE) and ($pwarp_success <> true))
				gosub :pwarp_direct_and_kill
			end
			if (($photon~sector <> $MAP~stardock) AND ($photon~sector  > 10) AND (SECTOR.TRADERCOUNT[$photon~sector] > 0) AND ($combat~safePlanets = TRUE) and ($pwarp_success <> true))
				gosub :killing~doholokill
				gosub :pwarp_direct_and_kill
			end
			if (($photon~sector <> $MAP~stardock) AND ($photon~sector  > 10) AND (SECTOR.TRADERCOUNT[$photon~sector] > 0) AND ($combat~safePlanets = TRUE) and ($pwarp_success <> true))
				gosub :killing~doholokill
				gosub :pwarp_direct_and_kill
			end
		end
		if (((($photon~adjacentphoton = true) and ($photon~success = true)) or ($nophoton = true)) and ($holo = true))
			gosub :doholo
		end

		setvar $photon~last_sector $photon~sector
		setvar $fire_history[$photon~sector] ($fire_history[$photon~sector] + 1) 
		gosub :killing~scan_for_targets
		if ($killing~error = true)
			goto :head_home
		end
		if (((SECTOR.LIMPETS.QUANTITY[$player~current_sector] <= 0) or (SECTOR.MINES.QUANTITY[$player~current_sector] <= 0)) and ($player~limpets > 0) and ($restock~deploymines = true))
			gosub :doMines
		end
		if ($noescape <> true)
			gosub :navigate~navigate_away
			gosub :player~quikstats
			gosub :killing~scan_for_targets
			if ($killing~error = true)
				goto :head_home
			end
			gosub :navigate~runaway_if_needed
		end
		####################
		# check for refurb #
		####################
		gosub :player~quikstats
		gosub :check_for_photon_refurb
		if ($killing~last_fighter_attack <> "")
			gosub :killing~set_the_cannon
		end

	else
		:can_not_fire
		if ($photon~found = true)
			if ($fire_history[$photon~sector] > 5)
				setvar $switchboard~message "Fired more than 5 times into sector "&$photon~sector&".  That's too many.  Restart script if you want to keep photoning.*"
				gosub :switchboard~switchboard
			end
			if ($photon~last_sector = $photon~sector)
				setvar $switchboard~message "Can't fire into sector "&$photon~sector&" twice.*"
				gosub :switchboard~switchboard
			end
			if ($photon~sector = $map~home_sector)
				setvar $switchboard~message "Can not fire into home sector.*"
				gosub :switchboard~switchboard
			end
		end
		gosub :killing~scan_for_targets
		if ($killing~error = true)
			goto :head_home
		end
		gosub :navigate~runaway_if_needed
	end

	goto :processing


############################################################################################
# Scanning routines - checking sector for enemies and killing if possible - leaving if not #
############################################################################################

:scan
	killalltriggers
	gosub :killing~checkForVictims
	if ($killing~error = true)
		goto :head_home
	end

	################################################################
	# after attempting to kill, need to move no matter the outcome #
	# they could be sitting above in defender ship                 #
	################################################################

	gosub :navigate~runaway_if_needed
	goto :processing


##############################################
# Pausing routine for leaving citadel prompt #
##############################################

:pausing
	gosub :killtriggers
	echo ANSI_6 "*[" ANSI_14 $script_ver " paused. To restart, re-enter Citadel Prompt" ANSI_6 "]*" ANSI_7
	setTextTrigger 1 :restarting "Citadel command ("
	pause
	:restarting
		gosub :killtriggers
		echo ANSI_6 "*[" ANSI_14 $script_ver " restarted" ANSI_6 "]*" ANSI_7
		gosub :player~quikstats
		goto :processing




:killtriggers
	killalltriggers
#	setvar $i 1
#	while ($i <= 23)
#		killtrigger ""&$i&""
#		add $i 1
#	end
#	setvar $i 1
#	while ($i <= 6)
#		killtrigger "adjf"&$i&""
#		killtrigger "adjl"&$i&""
#		killtrigger "adja"&$i&""
#		add $i 1
#	end
#	killtrigger wait
return



:doHolo
	setVar $BOT~command "holo"
	setVar $BOT~user_command_line " holo"
	
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\mombot\commands\data\holo.cts"
	setEventTrigger        holoend1        :holoend1 "SCRIPT STOPPED" "scripts\mombot\commands\data\holo.cts"
	pause
	:holoend1
		killtrigger holoend1
return

:doMines
	setVar $BOT~command "deploy"
	setVar $BOT~user_command_line " mines 3"
	setvar $bot~parm1 "mines"
	setvar $bot~parm2 "3"

	saveVar $BOT~command
	saveVar $BOT~user_command_line
	saveVar $bot~parm1 

	load "scripts\mombot\commands\grid\deploy.cts"
	setEventTrigger        minesend        :minesend "SCRIPT STOPPED" "scripts\mombot\commands\grid\deploy.cts"
	setdelaytrigger        minetime        :minetime  10000
	pause

	:minetime
		killtrigger minesend
		stop "scripts\mombot\commands\grid\deploy.cts"
		gosub :player~quikstats
	:minesend
		killtrigger minetime
		gosub :player~quikstats
		if ($player~current_prompt <> "Citadel")
			send " q q q * l " $PLANET~PLANET " * n n * j m * * * j c  *  "
			gosub :player~quikstats
			if ($player~current_prompt <> "Citadel")
				setvar $switchboard~message "Not at correct prompt after mine deploy!  Maybe planet is gone?  Check please!*"
				gosub :switchboard~switchboard
				gosub :navigate~callsaveme
			end
		end

return

:check_for_photon_refurb
	if (($player~photons <= 0) and ($nophoton <> true))
		gosub :navigate~navigate_to_limp
		gosub :killing~scan_for_targets
		if ($killing~error = true)
			goto :head_home
		end
		gosub :navigate~runaway_if_needed
		gosub :restock~refurb_photons
	end
return

:pwarp_direct_and_kill
	setTextTrigger 1 :jumped "All Systems Ready, shall we engage? Yes"
	settexttrigger 2 :no_jump "Your own fighters must be in the destination to make a safe jump"
	send "p" $photon~sector "*y   "
	pause
	:no_jump
		killtrigger 1
		setvar $pwarp_success false
		return
	:jumped
		killtrigger 2
		setvar $pwarp_success true
		gosub :killing~scan_for_targets
		if ($killing~error = true)
			goto :head_home
		end
return

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\combat\holokill\combat"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\combat\fastcitadelattack\combat"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\planet\landingsub\planet"
include "source\bot_includes\ship\getshipcapstats\ship"
include "source\bot_includes\ship\loadshipinfo\ship"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\sector\getsectordata\sector"
include "source\module_includes\defender\navigate"
include "source\module_includes\defender\photon"
include "source\module_includes\defender\restock"
include "source\module_includes\defender\killing"
include "source\bot_includes\external\htorp"
include "source\bot_includes\external\call"
include "source\bot_includes\external\movefig"
