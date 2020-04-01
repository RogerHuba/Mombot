loadVar $bot_name
loadVar $user_command_line
loadVar $parm1
loadVar $parm2
loadVar $parm3
loadVar $parm4
loadVar $parm5
loadVar $parm6
loadVar $parm7
loadVar $parm8
loadVar $stardock
loadVar $rylos
loadVar $alpha_centauri
loadVar $home_sector

# ======================     START PLANET MOVER (EVAC) SUBROUTINE    ==========================
	:evac_start
		gosub :quikstats~quikstats
		setVar $startingLocation $quikstats~CURRENT_PROMPT
		if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
			send "'{" $bot_name "} - Must start from Citadel or Command Prompt*"
			halt
		end
		if (($parm1 = "s") and ($stardock <> 0))
			setvar $parm1 $stardock
		end
		if (($parm1 = "r") and ($rylos <> 0))
			setvar $parm1 $rylos
		end
		if (($parm1 = "a") and ($alpha_centauri <> 0))
			setvar $parm1 $alpha_centauri
		end
		if (($parm1 = "h") and ($home_sector <> 0))
			setvar $parm1 $home_sector
		end
		setvar $target_sector $parm1
	:evac_run	
		send "'{" $bot_name "} - Starting Planet Evacuation to sector: "&$target_sector&".*"
		setvar $evac_home $quikstats~CURRENT_SECTOR
		if ($startingLocation = "Citadel")
			send "qq"
		end
		send "j  y  lq*"
	
	:evac_get_planets
		waitOn "Registry# and Planet Name"
		setVar $planetCount 0
		setVar $planetSkip 0
		settexttrigger planetGrabber :evac_planetline "   <"
		settexttrigger beDone :evac_done "Land on which planet "
		settexttrigger no_scanner :evac_no_scanner "Planet command (?=help)"
		pause

	:evac_planetline
		killtrigger planetgrabber
		killtrigger bedone
		killtrigger no_scanner 
		killtrigger getline2
		killtrigger getend
		setVar $line CURRENTLINE
		replacetext $line "<" " "
		replacetext $line ">" " "
		striptext $line ","
		add $planetCount 1
		getWord $line $planet[$planetCount] 1
		setTextLineTrigger getLine2 :evac_planetline "   <"
		setTextLineTrigger getEnd :evac_done "Land on which planet "
		pause

	:evac_no_scanner
		goto :evac_Move
	
	:evac_done
		killtrigger getline2
		setvar $evac_total $planetCount
		setvar $planetCount 1

	:evac_move
		send "l " $planet[$planetCount] "* "
		gosub :planetinfo~getPlanetInfo
		if ($planetinfo~CITADEL < 4)
			add $planetSkip 1
			goto :evac_twarp
		elseif ($planetinfo~CITADEL > 3)
			send "m * * * t n t 1 * c p " $target_sector "*"
			settextlinetrigger warp :evac_Pwarp "Locating beam pinpointed, TransWarp"
			settextlinetrigger no_warp :evac_no_fig "You do not have any fighters in Sector"
			pause
		end

	:evac_Pwarp
		killtrigger no_Warp
		send "y*"
		if ($planetCount = $evac_total)
			subtract $planetCount $planetSkip
			send "'{" $bot_name "} - Evac Complete. Moved: "&$planetCount&" Skipped: "&$planetSkip&". *"
			goto :evac_end
		end
		send "qq  z  n  *  m" $evac_home "*y"
		SetTextTrigger warp :evac_twarp "All Systems Ready, shall we engage?"
		SetTextTrigger no_warp :evac_no_warp_back "Do you want to make"
		pause

	:evac_twarp
		killtrigger no_Warp
		add $planetCount 1
		send "y  *  *  *  q  z  n  *"
		goto :evac_move

	:evac_no_warp_back
		killtrigger warp
		send "'{" $bot_name "} - No Fighter at Home Sector.  Shutting down Evac.*"
		goto :evac_end

	:evac_no_fig
		killtrigger warp
		if ($mode = "Runaway")
			send "qqq* "
			gosub :getNewRunAwaySector
			setVar $target_sector $warpTo
			goto :evac_move
		end
		send "'{" $bot_name "} - No Fighter at Target Sector.  Shutting down Evac.*"

	:evac_end
		halt

# ======================     END PLANET MOVER (EVAC) SUBROUTINE    ==========================

include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\"&$bot~mombot_directory&"\botIncludes\quikstats"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\"&$bot~mombot_directory&"\botIncludes\planetinfo"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\"&$bot~mombot_directory&"\botIncludes\pwarp"
