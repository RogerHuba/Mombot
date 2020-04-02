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

	setVar $START_FIG_HIT "Deployed Fighters Report Sector "
	setVar $END_FIG_HIT   ":"
        setVar $ALIEN_ANSI    #27 & "[1;36m" & #27 & "["
        setVar $START_FIG_HIT_OWNER ":"
	setVar $END_FIG_HIT_OWNER "'s"

		
#============================== RUNAWAY (RUNAWAY) ==============================
:runaway
	setVar $FIG_FILE 		"_MOM_" & GAMENAME & ".figs"
		
	gosub :quikstats~quikstats
	setVar $startingLocation $quikstats~CURRENT_PROMPT
	if ($parm1 <> "on") and ($parm1 <> "off")
		send "'{" $bot_name "} - Please use - Runaway [on/off] format*"
		halt
	end

	if ($parm1 = "on")
		if ($startingLocation <> "Citadel")
			send "'{" $bot_name "} - Runaway must start at Citadel prompt*"
			halt
		end
		send "'{" $bot_name "} - Activating Runaway*"
		goto :load_runaway
	else
		send "'{" $bot_name "} - Please use - Runaway [on/off] format**"
		halt
	end

:load_runaway
	isNumber $test $parm2
	if ($test)
		setVar $firstrun $parm2
	else
		setVar $firstrun 0
	end
	getWordPos $user_command_line $pos "evac"
	if ($pos > 0)
		setVar $doEvacuate TRUE
	else
		setVar $doEvacuate FALSE
	end

	send "s*"
	waitFor "<Scan Sector>"
	waitFor "(?="
	setVar $runsec $quikstats~CURRENT_SECTOR


:set_flee_data
	send "'{" $bot_name "} - Runaway initiated - Mapping...*"
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
				if ($echo_count = $sectiona)
					echo ansi_13 #178
					setVar $echo_count 1
				else
					add $echo_count 1
				end
		else
			getSectorParameter $run_count "FIGSEC" $isFigged
			getDistance $rundist $runsec $run_count
			if (($rundist < 4) OR ($rundist > 12) OR ($isFigged < 1))
					if ($echo_count = $sectiona)
						echo ansi_13 #178
						setVar $echo_count 1
					else
						add $echo_count 1
					end
			else
				setvar $adjrunsec1 SECTOR.WARPS[$run_count][1]
				setVar $adjrunsec2 SECTOR.WARPS[$run_count][2]
				getSectorParameter $adjrunsec1 "FIGSEC" $isFiggedAdj1
				getSectorParameter $adjrunsec2 "FIGSEC" $isFiggedAdj2
				if ((SECTOR.WARPCOUNT[$adjrunsec1] = 1) OR (SECTOR.WARPCOUNT[$adjrunsec2] = 1) OR ($isFiggedAdj1 < 1) OR ($isFiggedAdj2 < 1))
					if ($echo_count = $sectiona)
						echo ansi_13 #178
						setVar $echo_count 1
					else
						add $echo_count 1
					end
				end
				add $run_database_count 1
				if ($echo_count = $sectiona)
					echo ansi_13 #178
					setVar $echo_count 1
				else
					add $echo_count 1
				end
				setVar $run_database[$run_database_count]  $run_count

			end		
		end
		add $run_count 1
	end
	if ($run_database_count < 20)
		send "'{" $bot_name "} - Runaway list too short - ReMapping...*"
		waitFor "Message sent on"
	else
		goto :end_map
	end
	setVar $run_count 1

	
	
	echo "** Plotting Secondary Flee Sectors...**"
	setVar $echo_count 1
	:second_run_count
	while ($run_count <= SECTORS)
		
		if (SECTOR.WARPCOUNT[$run_count] <> 1]
				if ($echo_count = $sectiona)
					echo ansi_13 #178
					setVar $echo_count 1
				else
					add $echo_count 1
				end

		else
			getDistance $rundist $runsec $run_count
			getSectorParameter $run_count "FIGSEC" $isFigged
			
			if ($rundist < 4)
					if ($echo_count = $sectiona)
						echo ansi_13 #178
						setVar $echo_count 1
					else
						add $echo_count 1
					end
			elseif ($rundist > 12)
					if ($echo_count = $sectiona)
						echo ansi_13 #178
						setVar $echo_count 1
					else
						add $echo_count 1
					end
			elseif ($isFigged < 1)
					if ($echo_count = $sectiona)
						echo ansi_13 #178
						setVar $echo_count 1
					else
						add $echo_count 1
					end
			else
				setvar $adjrunsec1 SECTOR.WARPS[$run_count][1]
				getSectorParameter $run_count "FIGSEC" $isFiggedAdj1
				if ($isFiggedAdj1 < 1)
						if ($echo_count = $sectiona)
							echo ansi_13 #178
							setVar $echo_count 1
						else
							add $echo_count 1
						end
				else
					add $run_database_count 1
					if ($echo_count = $sectiona)
						echo ansi_13 #178
						setVar $echo_count 1
					else
						add $echo_count 1
					end
					setVar $run_database[$run_database_count]  $run_count
					
				end
			end
		end
		add $run_count 1
	end
:end_map
	if ($doEvacuate)
		send "'{" $bot_name "} - Runaway/Evacuate Multiple Planets Mode - " $run_database_count " flee sectors plotted.*"
	else
		send "'{" $bot_name "} - Runaway - " $run_database_count " flee sectors plotted.*"
	end
	goto :getsettings

:run_pwarp
	if ($firstrun <> 0)
		setVar $warpTo $firstrun
		setVar $firstrun 0
	else
		gosub :getNewRunAwaySector
	end
	if ($doEvacuate)
		setVar $parm1 $warpTo
		goto :evac_start
	end
	setVar $pwarp~warpto $warpto
	setVar $pwarp~bot_name $bot_name
	gosub :pwarp~pwarp
	gosub :quikstats~quikstats
	if ($quikstats~CURRENT_SECTOR <> $warpTo)
		goto :run_pwarp
	end
	setVar $runsec $quikstats~CURRENT_SECTOR
	goto :getsettings

:getNewRunAwaySector
	setVar $warpTo 0
	while ($warpTo <= 0)
		getRnd $random 1 $run_database_count
		setVar $warpTo $run_database[$random]
	end
return
#============================== END RUNAWAY (RUNAWAY) SUB ==============================

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
	#getWord CURRENTLINE $fighit 5
	#stripText $fighit ":"
	#isNumber $test $fighit
	getDistance $dist $dropSector $quikstats~CURRENT_SECTOR
	echo "[" $dist "]*"
	if ($dist <= 2)
		goto :run_pwarp
	end
	goto :getsettings
	
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



include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\"&$bot~mombot_directory&"\botIncludes\quikstats"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\"&$bot~mombot_directory&"\botIncludes\planetinfo"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\"&$bot~mombot_directory&"\botIncludes\pwarp"
