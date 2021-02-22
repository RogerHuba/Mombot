	gosub :BOT~loadVars
	
	setVar $START_FIG_HIT "Deployed Fighters Report Sector "
	setVar $END_FIG_HIT   ":"
        setVar $ALIEN_ANSI    #27 & "[1;36m" & #27 & "["
        setVar $START_FIG_HIT_OWNER ":"
	setVar $END_FIG_HIT_OWNER "'s"

    setVar $BOT~help[1]    $BOT~tab&"  runaway  {firstrun:#} {evac} "
	setVar $BOT~help[2]    $BOT~tab&"      "
	setVar $BOT~help[3]    $BOT~tab&"  Attempts to run away when enemy gets too close "
	gosub :bot~helpfile


	gosub :PLAYER~quikstats
	setVar $BOT~validPrompts "Citadel"
	gosub :BOT~checkStartingPrompt
	setVar $startingLocation $player~CURRENT_PROMPT


		
#============================== RUNAWAY (RUNAWAY) ==============================
:runaway
		
	gosub :player~quikstats
	setVar $startingLocation $player~CURRENT_PROMPT

	setvar $switchboard~message "Activating Runaway*"
	gosub :switchboard~switchboard

:load_runaway
	isNumber $test $bot~parm1
	if ($test)
		setVar $firstrun $bot~parm1
	else
		setVar $firstrun 0
	end
	getWordPos $bot~user_command_line $pos "evac"
	if ($pos > 0)
		setVar $doEvacuate TRUE
	else
		setVar $doEvacuate FALSE
	end

	send "s*"
	waitFor "<Scan Sector>"


:set_flee_data
	setvar $switchboard~message "Runaway initiated - Mapping...*"
	gosub :switchboard~switchboard

	setVar $run_count 1
	setVar $run_database_count 0
	setVar $sectiona SECTORS
	divide $sectiona 78
	setVar $echo_count 1
	setArray $run_database SECTORS
	echo "** Plotting Primary Flee Sectors...**"

:start_run_count
	while ($run_count <= SECTORS)
		if (SECTOR.WARPCOUNT[$run_count] <> 2)
			gosub :displayProgress
		else
			getSectorParameter $run_count "FIGSEC" $isFigged
			getDistance $rundist $player~current_sector $run_count
			if ($rundist < 0)
				setvar $player~starting_point $player~current_sector
				setvar $player~destination $run_count
				gosub :player~getcourse
				setvar $rundist $player~courseLength
			end
			if (($rundist < 4) OR ($rundist > 12) OR ($isFigged < 1))
					gosub :displayProgress
			else
				setvar $adjrunsec1 SECTOR.WARPS[$run_count][1]
				setVar $adjrunsec2 SECTOR.WARPS[$run_count][2]
				getSectorParameter $adjrunsec1 "FIGSEC" $isFiggedAdj1
				getSectorParameter $adjrunsec2 "FIGSEC" $isFiggedAdj2
				if ((SECTOR.WARPCOUNT[$adjrunsec1] = 1) OR (SECTOR.WARPCOUNT[$adjrunsec2] = 1) OR ($isFiggedAdj1 < 1) OR ($isFiggedAdj2 < 1))
					gosub :displayProgress
				else
					gosub :displayProgress
					add $run_database_count 1
					setVar $run_database[$run_database_count]  $run_count				
				end
			end		
		end
		add $run_count 1
	end
	if ($run_database_count < 20)
		setvar $switchboard~message "Runaway list too short - Remapping...*"
		gosub :switchboard~switchboard
	else
		goto :end_map
	end
	setVar $run_count 1

	
	
	echo "** Plotting Secondary Flee Sectors...**"
	setVar $echo_count 1
	:second_run_count
	while ($run_count <= SECTORS)
		
		if (SECTOR.WARPCOUNT[$run_count] <> 1]
			gosub :displayProgress
		else
			getDistance $rundist $player~current_sector $run_count
			if ($rundist < 0)
				setvar $player~starting_point $player~current_sector
				setvar $player~destination $run_count
				gosub :player~getcourse
				setvar $rundist $player~courseLength
			end
			getSectorParameter $run_count "FIGSEC" $isFigged
			
			if ($rundist < 4)
				gosub :displayProgress
			elseif ($rundist > 12)
				gosub :displayProgress
			elseif ($isFigged < 1)
				gosub :displayProgress
			else
				setvar $adjrunsec1 SECTOR.WARPS[$run_count][1]
				getSectorParameter $run_count "FIGSEC" $isFiggedAdj1
				if ($isFiggedAdj1 < 1)
					gosub :displayProgress
				else
					add $run_database_count 1
					gosub :displayProgress
					setVar $run_database[$run_database_count]  $run_count				
				end
			end
		end
		add $run_count 1
	end
:end_map

if ($doEvacuate)
	setvar $switchboard~message "Runaway/Evacuate Multiple Planets Mode - "&$run_database_count&" flee sectors plotted.*"
else
	setvar $switchboard~message "Runaway - "&$run_database_count&" flee sectors plotted.*"
end
gosub :switchboard~switchboard

goto :getsettings

:run_pwarp
	if ($firstrun = true)
		setVar $player~warpto $firstrun
		setVar $firstrun false
	else
		gosub :getNewRunAwaySector
	end
	if ($doEvacuate)
		setVar $bot~parm1 $player~warpto
		goto :evac_start
	end
	setVar $player~warpto $player~warpto
	setVar $player~bot_name $switchboard~bot_name
	gosub :player~pwarp
	gosub :player~quikstats
	if ($player~CURRENT_SECTOR <> $player~warpto)
		goto :run_pwarp
	end
	setVar $player~current_sector $player~CURRENT_SECTOR
	goto :getsettings

:getNewRunAwaySector
	setVar $player~warpto 0
	while ($player~warpto <= 0)
		getRnd $random 1 $run_database_count
		setVar $player~warpto $run_database[$random]
	end
return
#============================== END RUNAWAY (RUNAWAY) SUB ==============================

:displayProgress
	if ($echo_count = $sectiona)
		echo ansi_13 #178
		setVar $echo_count 1
	else
		add $echo_count 1
	end
return

:getsettings
	killalltriggers
	setTextLineTrigger 1 :findfig "Deployed Fighters Report Sector"	
	pause

:findfig
	killalltriggers
	gosub :validateFighterHit
	if ($isValid <> TRUE)
		goto :getsettings
	end
	getDistance $dist $dropSector $player~CURRENT_SECTOR
	if ($dist < 0)
		setvar $player~starting_point $dropSector
		setvar $player~destination $player~CURRENT_SECTOR
		gosub :player~getcourse
		setvar $dist $player~courseLength
	end

	echo "[" $dist " hops away]*"
	if ($dist <= 2)
		setvar $switchboard~message "Enemy fighter hit 2 or less hops away - running away!*"
		gosub :switchboard~switchboard
		goto :run_pwarp
	end
	goto :getsettings
	
# ======================     START PLANET MOVER (EVAC) SUBROUTINE    ==========================
	:evac_start
		gosub :player~quikstats
		setVar $startingLocation $player~CURRENT_PROMPT
		if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
			setvar $switchboard~message "Must start from Citadel or Command Prompt*"
			gosub :switchboard~switchboard
			halt
		end
		if (($bot~parm1 = "s") and ($stardock <> 0))
			setvar $bot~parm1 $map~stardock
		end
		if (($bot~parm1 = "r") and ($rylos <> 0))
			setvar $bot~parm1 $map~rylos
		end
		if (($bot~parm1 = "a") and ($alpha_centauri <> 0))
			setvar $bot~parm1 $map~alpha_centauri
		end
		if (($bot~parm1 = "h") and ($home_sector <> 0))
			setvar $bot~parm1 $map~home_sector
		end
		setvar $target_sector $bot~parm1
	:evac_run	
		setvar $switchboard~message "Starting Planet Evacuation to sector: "&$target_sector&".*"
		gosub :switchboard~switchboard
		setvar $evac_home $player~CURRENT_SECTOR
		if ($startingLocation = "Citadel")
			send "qq"
		end
		send "j  y  lq*"
	
	:evac_get_planets
		waitOn "Registry# and Planet Name"
		setVar $planet~planetCount 0
		setVar $planet~planetSkip 0
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
		add $planet~planetCount 1
		getWord $line $planet~planet[$planet~planetCount] 1
		setTextLineTrigger getLine2 :evac_planetline "   <"
		setTextLineTrigger getEnd :evac_done "Land on which planet "
		pause

	:evac_no_scanner
		goto :evac_Move
	
	:evac_done
		killtrigger getline2
		setvar $evac_total $planet~planetCount
		setvar $planet~planetCount 1

	:evac_move
		send "l " $planet~planet[$planet~planetCount] "* "
		gosub :planetinfo~getPlanetInfo
		if ($planet~CITADEL < 4)
			add $planet~planetSkip 1
			goto :evac_twarp
		elseif ($planet~CITADEL > 3)
			send "m * * * t n t 1 * c p " $target_sector "*"
			settextlinetrigger warp :evac_Pwarp "Locating beam pinpointed, TransWarp"
			settextlinetrigger no_warp :evac_no_fig "You do not have any fighters in Sector"
			pause
		end

	:evac_Pwarp
		killtrigger no_Warp
		send "y*"
		if ($planet~planetCount = $evac_total)
			subtract $planet~planetCount $planet~planetSkip
			send "'{" $switchboard~bot_name "} - Evac Complete. Moved: "&$planet~planetCount&" Skipped: "&$planet~planetSkip&". *"
			goto :evac_end
		end
		send "qq  z  n  *  m" $evac_home "*y"
		SetTextTrigger warp :evac_twarp "All Systems Ready, shall we engage?"
		SetTextTrigger no_warp :evac_no_warp_back "Do you want to make"
		pause

	:evac_twarp
		killtrigger no_Warp
		add $planet~planetCount 1
		send "y  *  *  *  q  z  n  *"
		goto :evac_move

	:evac_no_warp_back
		killtrigger warp
		send "'{" $switchboard~bot_name "} - No Fighter at Home Sector.  Shutting down Evac.*"
		goto :evac_end

	:evac_no_fig
		killtrigger warp
		if ($mode = "Runaway")
			send "qqq* "
			gosub :getNewRunAwaySector
			setVar $target_sector $player~warpto
			goto :evac_move
		end
		send "'{" $switchboard~bot_name "} - No Fighter at Target Sector.  Shutting down Evac.*"

	:evac_end
		goto :getsettings

# ======================     END PLANET MOVER (EVAC) SUBROUTINE    ==========================

:validateFighterHit
	setVar $isValid FALSE
	cutText CURRENTLINE&" " $radio 1 1
	getText CURRENTLINE $dropSector $START_FIG_HIT $END_FIG_HIT
	if ($radio <> "D")
		return
	end
	getText CURRENTANSILINE $alien_check $START_FIG_HIT_OWNER $END_FIG_HIT_OWNER
	getWordPos CURRENTLINE $pos $START_FIG_HIT_OWNER
	getWordPos $alien_check $apos $ALIEN_ANSI
	if (($apos > 0) OR ($pos = 0))
		return
	end
	if ($targetingPerson)
		getWordPos CURRENTLINE $pos " "&$target&"'s "
		if ($pos <= 0)
			return
		end
	end
	setVar $isValid TRUE
return

include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\pwarp\player"
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\checkstartingprompt\bot"
include "source\bot_includes\player\getcourse\player"

