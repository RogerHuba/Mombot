	logging off
	loadVar $switchboard~bot_name
	loadVar $player~unlimitedGame		
	loadVar $bot_turn_limit		
	loadVar $bot~user_command_line	
	loadVar $bot~parm1			
	loadVar $bot~parm2			
	loadVar $bot~parm3			
	loadVar $bot~parm4
	loadVar $bot~parm5
	loadVar $bot~parm6
	loadVar $bot~parm7
	loadVar $bot~parm8
	loadVar $stardock
	loadVar $backdoor
	loadVar $rylos
	loadVar $alpha_centauri
	loadVar $command
	fileExists $doesHelpFileExist "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "- "&$command&" [param] {figstodrop} {true/false} {alarm}    " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    Twarps to figged param sectors and picks up fighters.   " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    Does not do so safely.                                  " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "                                                            " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [param]  - sector parameter to move to                   " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    {true}   - go to the param if it's equal to TRUE (1)     " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    {false}  - go to the param if it's equal to FALSE (0)   " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    {alarm}  - activate alarm                               " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "                                                            " 
		send "'{" $switchboard~bot_name "} - Writing help file for this command in Help directory.*"
	end
	if ($bot~parm1 <> "")
		setVar $bot~parmAM $bot~parm1
		upperCase $bot~parmAM
	end
	window mowWindow 350 450 "Mowing to this: ["&$bot~parmAM&"]" ontop 
	setArray $COURSE 80
	gosub :player~quikstats
	if ($player~current_prompt <> "Citadel")
		send "'{" $switchboard~bot_name "} - You must run this script from the Citadel prompt.*"
     		halt
	end

	getWordPos $bot~user_command_line $pos "alarm" 
	if ($pos > 0)
		setVar $alarm_active TRUE
	else
		setVar $alarm_active FALSE
	end

	setVar $true TRUE
	getWordPos $bot~user_command_line $pos "false" 
	if ($pos > 0)
		setVar $true FALSE
	end
	getWordPos $bot~user_command_line $pos "true" 
	if ($pos > 0)
		setVar $true TRUE
	end

	setVar $location $player~current_prompt
	setVar $homeSector $player~current_sector
	setVar $lastDestination 1
	send "c;q"
	waitOn "Max Figs Per Attack:"
	getWord CURRENTLINE $maxFigAttack2 5
	:getplanetnum
		send "qD"
		waitOn "Planet #"
		getWord CURRENTLINE $planet~planet 2
		stripText $planet~planet "#"
		send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*qjy"
	
	setWindowContents mowWindow "Sectors Figged: "&$count&" out of "&SECTORS&"*"
	gosub :landOnPlanetEnterCitadel
	gosub :getTargets

	if ($true)
		setVar $output "TRUE"
	else
		setVar $output "FALSE"
	end

	if ($databasecount <= 0)
		send "'{" $switchboard~bot_name "} -  No sector parameters found for "&$bot~parmAM&" set to a value of "&$output&" or already figged.*"
	end

	send "'{" $switchboard~bot_name "} -  Starting up empty this!  Emptying all sectors with "&$bot~parmAM&" set to a value of "&$output&".*"

	:DOAGAIN
		getRnd $random 1 $databasecount
		getWord $randomSectors $destination $random
		if ($destination = 0)
			send "'{" $switchboard~bot_name "} -  Database Cleared - Refresh Figs and Restart.*"
			halt		
		end
		if ($destination <> $homeSector)
					setVar $temp " "&$destination&" "
					replaceText $randomSectors $temp " "
					subtract $databasecount 1
					send "#qm*l*m**1000*t n t 1* q"
					loadVar $alarm_list
					if (($alarm_active) AND ($alarm_list <> ""))
						loadVar $who_is_online
						lowercase $alarm_list
						lowercase $who_is_online
						getWordPos $alarm_list $pos ","
						if ($pos > 0)
							splitText $alarm_list $alarm ","
						else
							setArray $alarm 1
							setVar $alarm[1] $alarm_list
							setVar $alarm 1
						end
						setVar $i 1
						while ($i <= $alarm)
							getWordPos $who_is_online $pos " "&$alarm[$i]&" "
							if ($pos > 0)
								send "'Alarm triggered by "&$alarm[$i]&", contingency plan engaged.*"
								:shutdown
								halt
							end
							add $i 1
						end
					end
					setVar $PLAYER~warpto $destination
		            gosub :player~twarp
		            gosub  :player~currentPrompt
		            if ($PLAYER~twarpSuccess = TRUE)
		        		send "f 0*"				

						send "mz "&$homeSector&"*y  y    *    "
		        		gosub :PLAYER~quikstats


						#setVar $PLAYER~warpto $homeSector
			            #gosub :player~twarp
			            #gosub  :player~currentPrompt
		            end
		        	setSectorParameter $destination "FIGSEC" FALSE
		            gosub :PLAYER~quikstats
		            if ($PLAYER~CURRENT_SECTOR <> $homeSector)
		            	gosub :callSaveMe
		            end
		            gosub :landOnPlanetEnterCitadel
		        			
					setVar $windowData "Sectors Figged: "&$count&" out of "&SECTORS&"*Current Target: "&$destination&"*Target Status: Attempting To Mow*"&$databasecount&" sectors left in database*"
					setWindowContents mowWindow $windowData

			end
	goto :DOAGAIN
# ======================     START MOW SUBROUTINES     ==========================

:getTargets
	setVar $databasecount 0
	setVar $randomSectors "  "
	setVar $path_database "  "
	setVar $perc 0
	setVar $i 11
	while ($i <= SECTORS)
		getSectorParameter $i "FIGSEC" $isFigged
		getSectorParameter $i $bot~parmAM $isTrue
		if (($isTrue = $true) AND ($isFigged = TRUE))
			setVar $randomSectors $randomSectors&$i&"  "
			add $databasecount 1
		end
		setVar $percTest (($i * 100) / SECTORS)
		if ($percTest > $perc)
			setVar $perc (($i * 100) / SECTORS)
			echo "*"
			echo #27 "["&($perc / 2)&"C"
			echo ANSI_14 "°" ANSI_15 " " $perc "%" #27 & "[1A   "
		end
		add $i 1
	end
return

:player~quikstats
	setVar $player~current_prompt 		"Undefined"
	killtrigger noprompt
	killtrigger prompt1
	killtrigger prompt2
	killtrigger prompt3
	killtrigger prompt4
	killtrigger statlinetrig
	killtrigger getLine2
	setTextTrigger 		prompt1 	:allPrompts 		"(?="
	setTextLineTrigger 	prompt2 	:secondaryPrompts 	"(?)"
	setTextLineTrigger 	statlinetrig 	:statStart 		#179
	setTextTrigger		prompt3         :terraPrompts		"Do you wish to (L)eave or (T)ake Colonists?"
	setTextTrigger		prompt4         :terraPrompts		"How many groups of Colonists do you want to take ("
#	setDelayTrigger 	noprompt        :doneQuikstats		 3000
	send "^Q/"
	pause

	:allPrompts
		getWord currentansiline $checkPrompt 1
		getWord currentline $tempPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $player~current_prompt $tempPrompt
		end
		setTextLineTrigger prompt1 :allPrompts "(?="
		pause
	:secondaryPrompts
		getWord currentansiline $checkPrompt 1
		getWord currentline $tempPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $player~current_prompt $tempPrompt
		end
		setTextLineTrigger prompt2 :secondaryPrompts "(?)"
		pause
	:terraPrompts
		killtrigger prompt3
		killtrigger prompt4
		getWord currentansiline $checkPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $player~current_prompt "Terra"
		end
		setTextTrigger		prompt3         :terraPrompts		"Do you wish to (L)eave or (T)ake Colonists?"
		setTextTrigger		prompt4         :terraPrompts		"How many groups of Colonists do you want to take ("
		pause

	:statStart
		killtrigger prompt1
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger noprompt
		setVar $stats ""
		setVar $wordy ""


	:statsline
		killtrigger statlinetrig
		killtrigger getLine2
		setVar $line2 CURRENTLINE
		replacetext $line2 #179 " "
		striptext $line2 ","
		setVar $stats $stats & $line2
		getWordPos $line2 $pos "Ship"
		if ($pos > 0)
			goto :gotStats
		else
			setTextLineTrigger getLine2 :statsline
			pause
		end

	:gotStats
		setVar $stats $stats & " @@@"

		setVar $current_word 0
		while ($wordy <> "@@@")
			if ($wordy = "Sect")
				getWord $stats $player~current_sector   	($current_word + 1)
			elseif ($wordy = "Turns")
				getWord $stats $player~turns  			($current_word + 1)
			elseif ($wordy = "Creds")
				getWord $stats $player~credits  		($current_word + 1)
			elseif ($wordy = "Figs")
				getWord $stats $player~fighters   		($current_word + 1)
			elseif ($wordy = "Shlds")
				getWord $stats $player~shields  		($current_word + 1)
			elseif ($wordy = "Hlds")
				getWord $stats $player~total_holds   		($current_word + 1)
			elseif ($wordy = "Ore")
				getWord $stats $player~ore_holds    		($current_word + 1)
			elseif ($wordy = "Org")
				getWord $stats $player~organic_holds    	($current_word + 1)
			elseif ($wordy = "Equ")
				getWord $stats $player~equipment_holds    	($current_word + 1)
			elseif ($wordy = "Col")
				getWord $stats $player~colonist_holds    	($current_word + 1)
			elseif ($wordy = "Phot")
				getWord $stats $player~photons   		($current_word + 1)
			elseif ($wordy = "Armd")
				getWord $stats $player~armids   		($current_word + 1)
			elseif ($wordy = "Lmpt")
				getWord $stats $player~limpets   		($current_word + 1)
			elseif ($wordy = "GTorp")
				getWord $stats $player~genesis  		($current_word + 1)
			elseif ($wordy = "TWarp")
				getWord $stats $player~twarp_type  		($current_word + 1)
			elseif ($wordy = "Clks")
				getWord $stats $player~cloaks   		($current_word + 1)
			elseif ($wordy = "Beacns")
				getWord $stats $player~beacons 		($current_word + 1)
			elseif ($wordy = "AtmDt")
				getWord $stats $player~atomic  		($current_word + 1)
			elseif ($wordy = "Corbo")
				getWord $stats $player~corbo   		($current_word + 1)
			elseif ($wordy = "EPrb")
				getWord $stats $player~eprobes   		($current_word + 1)
			elseif ($wordy = "MDis")
				getWord $stats $player~mine_disruptors   	($current_word + 1)
			elseif ($wordy = "PsPrb")
				getWord $stats $player~psychic_probe  		($current_word + 1)
			elseif ($wordy = "PlScn")
				getWord $stats $player~planet_scanner  	($current_word + 1)
			elseif ($wordy = "LRS")
				getWord $stats $player~scan_type    		($current_word + 1)
			elseif ($wordy = "Aln")
				getWord $stats $player~alignment    		($current_word + 1)
			elseif ($wordy = "Exp")
				getWord $stats $player~experience    		($current_word + 1)
			elseif ($wordy = "Corp")
				getWord $stats $player~corp   			($current_word + 1)
			elseif ($wordy = "Ship")
				getWord $stats $player~ship_number   		($current_word + 1)
			end
			add $current_word 1
			getWord $stats $wordy $current_word
		end
	:doneQuikstats
		killtrigger prompt1
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger statlinetrig
		killtrigger getLine2

return
# ============================== END QUICKSTATS SUB==============================


:callSaveMe
	killAllTriggers
	send "*"
	waitFor "(?="
	getWord CURRENTLINE $prompt 1
	if ($prompt = "Citadel")
		echo "**Had to halt script, check ship to see if it is valid.**"
		halt
	end
	if ($prompt = "Computer") or ($prompt = "Corporate") or ($prompt = "NavPoint")
		send "q"
		waitFor "Command [TL"
	end	
	gosub :player~quikstats
    	setVar $figstodeploy 1
	gosub :deployfigs 
	setVar $savetarget $player~current_sector 
	if ($savetarget < 10)
		setVar $savetarget "0000" & $savetarget
	elseif ($savetarget < 100)
		setVar $savetarget "000" & $savetarget
	elseif ($savetarget < 1000)
		setVar $savetarget "00" & $savetarget
	elseif ($savetarget < 10000)
		setVar $savetarget "0" & $savetarget
	end
	
	send "'" & $savetarget & "=saveme*"
	send "'pickup " & $player~current_sector  & " ::*"


:waitforhelp
    setTextLineTrigger friendlytwarp :friendlytwarp "appears in a brilliant flash of warp energies!"
    setTextLineTrigger friendlyplanet :friendlyplanet "Saveme script activated - Planet "
    setTextLineTrigger towlocked :towlocked "locks a tractor beam on your ship."
    setDelayTrigger timeout :timeout 30000
    pause

    :timeout
        killalltriggers
        send "'30 seconds after save call, script halted.*"
        halt

    :friendlytwarp
        killalltriggers
        setVar $figstodeploy "ALL"
        gosub :deployfigs
        goto :waitforhelp

    :friendlyplanet
        killalltriggers
        getText CURRENTLINE $planet~planet "Saveme script activated - Planet " " to "
        send "L " & $planet~planet & "* C 'I landed on planet " & $planet~planet & "*"
        halt

    :towlocked
        killalltriggers
        setVar $figstodeploy 1
        gosub :deployfigs
        send "'Tow locked, get us out of here!*"
        halt


:deployfigs
    if ($figstodeploy = 0)
        setVar $figstodeploy 1
    end
    if (($player~current_sector  < 11) or ($player~current_sector  = STARDOCK))
        send "'Can't deploy figs in fed*"
        return
    end
    send "F"
    setTextLineTrigger nocontrol :nocontrol "These fighters are not under your control."
    setTextLineTrigger abletodeploy :abletodeploy "fighters available."
    pause

    :nocontrol
        killalltriggers
        send "'We don't control the figs in this sector!*"
        halt

    :abletodeploy
        killalltriggers
        getWord CURRENTLINE $figsavailable 3
        striptext $figsavailable ","
        if ($figstodeploy = "ALL")
            setVar $figstodeploy $figsavailable
        end
        if ($figsavailable = 0)
            send "0* ZC D* 'I have no figs to deploy!*"
        else
            send $figstodeploy & "* ZC D* '" & $figstodeploy & " figs deployed*"
        end
return

:landOnPlanetEnterCitadel
	send "l " $planet~planet "* c"
	waitOn "<Enter Citadel>"
	return
:leaveCitadelAndPlanet	
	send "q q"
	waitOn "Blasting off from"
	waitOn "Command [TL"
	return


#-=-=-=-=-includes-=-=-=-=-
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\currentprompt\player"
