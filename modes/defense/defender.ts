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


	setVar $BOT~help[1] $BOT~tab&"Grid defender {f} {l} {a} {nocannon} {holo} {extern:11pm}  "
	setVar $BOT~help[2] $BOT~tab&"         f - Photon fighter hits "
	setVar $BOT~help[3] $BOT~tab&"         l - Photon limpet hits "
	setVar $BOT~help[4] $BOT~tab&"         a - Photon armid hits "
	setVar $BOT~help[5] $BOT~tab&"  nocannon - Will not reset cannon damages "
	setVar $BOT~help[6] $BOT~tab&"      holo - holoscan on ss after photon "
	setVar $BOT~help[7] $BOT~tab&"    extern - stops defender 5 minutes before extern "
	setVar $BOT~help[8] $BOT~tab&"             as defined by local system time "

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
	if (($MAP~home_sector = 0) OR ($MAP~home_sector = ""))
		setvar $map~home_sector $player~current_sector
		savevar $map~home_sector
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

	getwordpos " "&$bot~user_command_line&" " $pos " holo "
	if ($pos > 0)
		setvar $holo true
	else
		setvar $holo false
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

	if ($player~photons <= 0)
		gosub :navigate~navigate_to_limp
		gosub :killing~checkForVictims
		if ($sector~realTraderCount = $sector~corpieCount)
			#############################################
			# do nothing if there is no enemy in sector #
			#############################################
		else
			gosub :navigate~navigate_to_limp
			####################################################################
			# after navigating away, check for enemies in sector, just in case #
			####################################################################
			gosub :killing~checkForVictims
		end
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



	setVar $message "'*  {"&$bot~bot_name&"} - "&$script_ver&" Currently Running On Planet "&$planet~planet&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
	    setvar $message $message&"*      Photon Type: Adjacent "
	if ($fighter)
		setVar $message $message&"*   On Fighter Hit: Yes"
	else
		setVar $message $message&"*   On Fighter Hit: No"
	end
	if ($limpet)
		setVar $message $message&"*    On Limpet Hit: Yes"
	else
		setVar $message $message&"*    On Limpet Hit: No"
	end
	if ($armid)
		setVar $message $message&"*     On Armid Hit: Yes"
	else
		setVar $message $message&"*     On Armid Hit: No"
	end
	if ($holo)
		setVar $message $message&"*      Holo Report: Yes"
	else
		setVar $message $message&"*      Holo Report: No"
	end
	if ($nocannon)
		setVar $message $message&"*     Cannon Reset: No"
	else
		setVar $message $message&"*     Cannon Reset: Yes"
	end
		setVar $message $message&"*        Auto Kill: Enabled With "&$planet~planet_Fighters&" Fighters"
	setVar $message $message&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"	
	send $message

    

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
		setTextLineTrigger 13 :scan "Deployed Fighters Report Sector "&$player~CURRENT_SECTOR&":"
		setTextLineTrigger 14 :scan "Quasar Cannon on"
		setTextLineTrigger 15 :scan "Shipboard Computers The Interdictor Generator on"
		setTextLineTrigger 16 :scan " is powering up weapons systems!"
		settextlinetrigger 17 :scan " launches a wave of fighters at the "
		settextlinetrigger 18 :scan	" launches a Genesis Torpedo into the sector!"
		settextlinetrigger 19 :scan " appears from the planetary rubble."
		setTextLineTrigger 20 :scan " exits the game."
		setTextLineTrigger 21 :scan " enters the game."
		setDelayTrigger	   22 :announce	1200000
		setDelayTrigger	   23 :head_home 3600000
		pause
			

		:announce 
		setvar $switchboard~message $script_ver&" is online and ready to fire.*"
		gosub :switchboard~switchboard
		setDelayTrigger	   22 :announce	1200000
		pause		

		:head_home 
		gosub :player~quikstats
		echo ansi_2&"*Checking status after inactivity..*"
		if ($player~current_sector <> $map~home_sector)
			setvar $switchboard~message "No activity in an hour, so heading home.*"
			gosub :switchboard~switchboard
			gosub :navigate~navigate_to_limp
			gosub :killing~checkForVictims
			gosub :restock~refurb_photons
			send "p"&$map~home_sector&"*y "
		end
		goto :processing

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
	gosub :killtriggers
	if ($photon~found = true)
		if (($fire_history[$photon~sector] > 5) or ($photon~last_sector = $photon~sector) or ($photon~sector = $map~home_sector))
			goto :can_not_fire
		end
		getsectorparameter $photon~sector "BUBBLE" $isBubble
		if ($isBubble = true)
			setvar $switchboard~message "Can not fire into bubble sector "&$photon~sector&"!*"
			gosub :switchboard~switchboard
			goto :can_not_fire
		end
		gosub :photon~photon
		
		#############################################
		# holoscan sector to see if victim is there #
		#############################################
		if ($holo = true)
			gosub :doholo
		end

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
		gosub :player~quikstats
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
	while ($i <= 23)
		killtrigger ""&$i&""
		add $i 1
	end
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



#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\switchboard"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipcapstats\ship"
include "source\bot_includes\ship\loadshipinfo\ship"
include "source\bot_includes\ship\getshipstats\ship"
