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


	setVar $START_FIG_HIT "Deployed Fighters Report Sector "
	setVar $END_FIG_HIT   ":"
	setVar $ALIEN_ANSI    #27 & "[1;36m" & #27 & "["
	setVar $START_FIG_HIT_OWNER ":"
	setVar $END_FIG_HIT_OWNER "'s"


	setVar $BOT~help[1] $BOT~tab&"Grid defender "
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

    

	###########################################
	# Main information processor for defender #
	###########################################

	:processing
		gosub :killtriggers
		setTextTrigger 1 :attackSectorLimpet "Limpet mine in "
		setTextTrigger 2 :attackSectorMine "Your mines in "
		setTextTrigger 3 :attackSectorFighter "Deployed Fighters "
		setTextTrigger 4 :pausing "Planet command (?="
		setTextTrigger 5 :pausing "Computer command ["
		setTextTrigger 6 :pausing "Corporate command ["
		setTextTrigger 7 :pausing "Transfer To or From the Treasury (T/F)"
		setTextTrigger 8 :pausing "Qcannon Control Type :"
		setTextTrigger 9 :pausing "Beam to what sector? (U=Upgrade"

		setTextLineTrigger 10 :scan "warps into the sector."
		setTextLineTrigger 11 :scan "lifts off from"
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
	gosub :killtriggers
	if ($photon~found = true)
		gosub :photon~photon
		gosub :navigate~navigate_away
		gosub :player~quikstats
		if ($player~photons <= 0)
			gosub :restock~refurb_photons
		end
		if ($killing~last_fighter_attack <> "")
			gosub :killing~set_the_cannon
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

	gosub :navigate~navigate_away
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
	killtrigger 1
	killtrigger 2
	killtrigger 3
	killtrigger 4
	killtrigger 5
	killtrigger 6
	killtrigger 7
	killtrigger 8
	killtrigger 9
	killtrigger 10
	killtrigger 11
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
