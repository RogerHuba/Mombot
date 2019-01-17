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


	setVar $BOT~help[1] $BOT~tab&"Grid defender {f}   "
	setVar $BOT~help[2] $BOT~tab&"         f - Photon fighter hits "
	setVar $BOT~help[3] $BOT~tab&"         l - Photon limpet hits "
	setVar $BOT~help[4] $BOT~tab&"         a - Photon armid hits "
	setVar $BOT~help[5] $BOT~tab&"  nocannon - Will not reset cannon damages "

	gosub :BOT~help_file

	setvar $script_ver "Grid Defender"
	setVar $BOT~script_title $script_ver
	gosub :BOT~banner

	setVar $PLAYER~save TRUE
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
	if (($MAP~home_sector = 0) OR ($MAP~home_sector = ""))
		setvar $map~home_sector $player~current_sector
		savevar $map~home_sector
	end

	if ($parm1 = "off")
		setVar $SWITCHBOARD~message $script_ver&" shutting down.  Making ship and planet corporate again.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

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

	getwordpos " "&$bot~user_command_line&" " $pos " nocannon "
	if ($pos > 0)
		setvar $nocannon true
	else
		setvar $nocannon false
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

	if ($PLAYER~photons <= 0)
		gosub :restock~refurb_photons
	end

    fileExists $SHIP~cap_file_chk $SHIP~cap_file
    if ($SHIP~cap_file_chk <> TRUE)
        gosub :SHIP~getShipCapStats
    else
		gosub :ship~loadShipInfo
    end

    gosub :SHIP~getShipStats
    gosub :player~quikstats

	if ($PLAYER~photons <= 0)
		gosub :restock~refurb_photons
	end

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


    

	###########################################
	# Main information processor for defender #
	###########################################

	:processing
		gosub :killtriggers
		if ($limpet)
			setTextTrigger 1 :attackSectorLimpet "Limpet mine in "
		end
		if ($armid)
			setTextTrigger 2 :attackSectorMine "Your mines in "
		end
		if ($fighter)
			setTextTrigger 3 :attackSectorFighter "Deployed Fighters "
		end
		setTextTrigger 4 :pausing "Planet command (?="
		setTextTrigger 5 :pausing "Computer command ["
		setTextTrigger 6 :pausing "Corporate command ["
		setTextTrigger 7 :pausing "Transfer To or From the Treasury (T/F)"
		setTextTrigger 8 :pausing "Qcannon Control Type :"
		setTextTrigger 9 :pausing "Beam to what sector? (U=Upgrade"

		setTextLineTrigger 10 :scan "warps into the sector."
		setTextLineTrigger 11 :scan " lifts off from"
		setTextLineTrigger 12 :scan "Limpet mine in "&$player~CURRENT_SECTOR
		setTextLineTrigger 13 :scan "Deployed Fighters Report Sector "&$player~CURRENT_SECTOR
		setTextLineTrigger 14 :scan "Quasar Cannon on"
		setTextLineTrigger 15 :scan "Shipboard Computers The Interdictor Generator on"
		setTextLineTrigger 16 :scan " is powering up weapons systems!"
		settextlinetrigger 17 :scan " launches a wave of fighters at the "
		settextlinetrigger 18 :scan	" launches a Genesis Torpedo into the sector!"
		settextlinetrigger 19 :scan " appears from the planetary rubble."
		setTextLineTrigger 20 :scan " exits the game."
		setTextLineTrigger 21 :scan " enters the game."
		setDelayTrigger	   22 :announce	1200000
		pause
			

		:announce 
		setvar $switchboard~message $script_ver&" is online and ready to fire.*"
		gosub :switchboard~switchboard
		setDelayTrigger	   22 :announce	1200000
		pause		
	halt


#################################################################
# Photon routines - fire photon, move away, restock, set cannon #
#################################################################

:attackSectorLimpet
	gosub :photon~limpet_spoof
	goto :check_to_fire_photon

:attackSectorMine
	gosub :photon~armid_spoof
	goto :check_to_fire_photon

:attackSectorFighter
	gosub :photon~fighter_spoof


:check_to_fire_photon
	if (($photon~found = true) and ($fire_history[$photon~sector] <= 5) and ($photon~last_sector <> $photon~sector) and ($photon~sector <> $map~home_sector))
		getsectorparameter $photon~sector "BUBBLE" $isBubble
		if ($isBubble = true)
			setvar $switchboard~message "Can not fire into bubble sector "&$photon~sector&"!*"
			gosub :switchboard~switchboard
			goto :can_not_fire
		end
		gosub :photon~photon
		setvar $photon~last_sector $photon~sector
		setvar $fire_history[$photon~sector] ($fire_history[$photon~sector] + 1) 
		gosub :navigate~navigate_away
		gosub :player~quikstats
		if ($sector~realTraderCount = $sector~corpieCount)
			#############################################
			# do nothing if there is no enemy in sector #
			#############################################
		else
			gosub :navigate~navigate_away
			####################################################################
			# after navigating away, check for enemies in sector, just in case #
			####################################################################
			gosub :killing~checkForVictims
		end
		####################
		# check for refurb #
		####################
		if ($player~photons <= 0)
			gosub :navigate~navigate_to_limp
			gosub :killing~checkForVictims
			if ($sector~realTraderCount = $sector~corpieCount)
				#############################################
				# do nothing if there is no enemy in sector #
				#############################################
			else
				gosub :navigate~navigate_away
				####################################################################
				# after navigating away, check for enemies in sector, just in case #
				####################################################################
				gosub :killing~checkForVictims
			end
			gosub :restock~refurb_photons
		end
		if (($killing~last_fighter_attack <> "") and ($nocannon <> true))
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
		gosub :killing~checkForVictims
		if ($sector~realTraderCount = $sector~corpieCount)
			#############################################
			# do nothing if there is no enemy in sector #
			#############################################
		else
			gosub :navigate~navigate_away
			####################################################################
			# after navigating away, check for enemies in sector, just in case #
			####################################################################
			gosub :killing~checkForVictims
		end
	end
	goto :processing


############################################################################################
# Scanning routines - checking sector for enemies and killing if possible - leaving if not #
############################################################################################

:scan
	gosub :killtriggers
	gosub :killing~checkForVictims

	################################################################
	# after attempting to kill, need to move no matter the outcome #
	# they could be sitting above in defender ship                 #
	################################################################

	if ($sector~realTraderCount = $sector~corpieCount)
		#############################################
		# do nothing if there is no enemy in sector #
		#############################################
	else
		gosub :navigate~navigate_away

		####################################################################
		# after navigating away, check for enemies in sector, just in case #
		####################################################################
		gosub :killing~checkForVictims
	end
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
	setvar $i 1
	while ($i <= 22)
		killtrigger ""&$i&""
		add $i 1
	end
return






#INCLUDES:
include "source\module_includes\bot"
include "source\module_includes\defender\killing"
include "source\module_includes\defender\photon"
include "source\module_includes\defender\navigate"
include "source\module_includes\defender\restock"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
