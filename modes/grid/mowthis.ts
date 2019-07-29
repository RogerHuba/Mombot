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
	fileExists $doesHelpFileExist "scripts\mombot\help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\mombot\help\"&$command&".txt" "- "&$command&" [param] {figstodrop} {true/false} {alarm}    " 
		write "scripts\mombot\help\"&$command&".txt" "    Mows to unfigged sectors defined in sector param given. " 
		write "scripts\mombot\help\"&$command&".txt" "    Does not do so safely.                                  " 
		write "scripts\mombot\help\"&$command&".txt" "                                                            " 
		write "scripts\mombot\help\"&$command&".txt" "    [param]  - sector parameter to move to                   " 
		write "scripts\mombot\help\"&$command&".txt" "    {figstodrop}  - fighters to drop (default is 1)          " 
		write "scripts\mombot\help\"&$command&".txt" "    {true}   - go to the param if it's equal to TRUE (1)     " 
		write "scripts\mombot\help\"&$command&".txt" "    {false}  - go to the param if it's equal to FALSE (0)   " 
		write "scripts\mombot\help\"&$command&".txt" "    {alarm}  - activate alarm                               " 
		write "scripts\mombot\help\"&$command&".txt" "    {notwarp}  - don't attempt twarp                        " 
		write "scripts\mombot\help\"&$command&".txt" "    {all}  - visits all sectors whether fig is down or not  " 
		write "scripts\mombot\help\"&$command&".txt" "                                                            " 
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

	setVar $figsToDrop 1
	isNumber $test $bot~parm2
	if ($test = true)
		if ($bot~parm2 > 0)
			setVar $figsToDrop $bot~parm2
		end
	end
	getWordPos $bot~user_command_line $pos "alarm" 
	if ($pos > 0)
		setVar $alarm_active TRUE
	else
		setVar $alarm_active FALSE
	end

	getWordPos $bot~user_command_line $pos "notwarp" 
	if ($pos > 0)
		setVar $no_twarp TRUE
	else
		setVar $no_twarp FALSE
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

	getWordPos $bot~user_command_line $pos "all" 
	if ($pos > 0)
		setVar $allsectors TRUE
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

	send "'{" $switchboard~bot_name "} -  Starting up mow this!  Mowing all sectors with "&$bot~parmAM&" set to a value of "&$output&".*"

	:DOAGAIN
		getRnd $random 1 $databasecount
		getWord $randomSectors $destination $random
		if ($destination = 0)
			send "'{" $switchboard~bot_name "} -  Database Cleared - Refresh Figs and Restart.*"
			halt		
		end
		if ($destination <> $homeSector)
			gosub :getCourses
			if ($valid)
					setVar $temp " "&$destination&" "
					replaceText $randomSectors $temp " "
					subtract $databasecount 1
						send "#qm***t n t 1* q"
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
					
					gosub :mow
					setVar $windowData "Sectors Figged: "&$count&" out of "&SECTORS&"*Current Target: "&$destination&"*Target Status: Attempting To Mow*"&$databasecount&" sectors left in database*"
					setWindowContents mowWindow $windowData
					setVar $lastDestination $destination
	
	
			else
				setVar $temp " "&$destination&" "
				replaceText $randomSectors $temp " "
				subtract $databasecount 1	
			end
		end
	goto :DOAGAIN
# ======================     START MOW SUBROUTINES     ==========================
:mow
	

	gosub :player~quikstats
	if ($maxFigAttack2 > $player~fighters)
		setVar $maxFigAttack2 9999
	end

setVar $result ""		

if ($no_twarp = FALSE)
	setVar $j 4
	setVar $closestFiggedSector 0	
	while ($j <= $courseLength)
		getSectorParameter $COURSE[$j] "FIGSEC" $isFigged
		if ($isFigged = TRUE)
			setVar $closestFiggedSector $COURSE[$j]
			setVar $index $j
			if ($j = $courseLength)
				setVar $PLAYER~warpto $closestFiggedSector
	            gosub :player~twarp
	            gosub  :player~currentPrompt
	            if ($PLAYER~twarpSuccess = TRUE)
	            	setVar $j $index
	            else
	            	setVar $j 3
	            end
	            goto :mowfromhere
	        end
		else
			if ($closestFiggedSector > 0)
				setVar $PLAYER~warpto $closestFiggedSector
	            gosub :player~twarp
	            gosub  :player~currentPrompt
	            if ($PLAYER~twarpSuccess = TRUE)
	            	setVar $j ($index + 1)
	            else
	            	setVar $j 3
	            end
	            goto :mowfromhere
			end
		end
		add $j 1	
	end
end

	setVar $j 3
	:mowfromhere
	while ($j <= $courseLength)
		setVar $result $result&"m  "&$COURSE[$j]&"* "
		if (($COURSE[$j] > 10) AND ($COURSE[$j] <> $STARDOCK))
			setVar $result $result&"za"&$maxFigAttack2&"* z * "	
		end
		if (($COURSE[$j] > 10) AND ($COURSE[$j] <> $STARDOCK) AND ($j > 2))
			if ($figsToDrop > 0)
				setVar $result $result&"f "&$figsToDrop&"* c d "
				setSectorParameter $COURSE[$j] "FIGSEC" TRUE
			else
				setVar $result $result&"f "&$figsToDrop&"*"
				setSectorParameter $COURSE[$j] "FIGSEC" FALSE
			end
		end
		add $j 1	
	end
	send $result&"zr* "
	gosub :player~quikstats
	if ($player~current_sector <> $destination)
		setVar $windowData "Sectors Figged: "&$count&" out of "&SECTORS&"*Current Target: "&$destination&"*Target Status: DANGER - Call Save Me Activated!"
		setWindowContents mowWindow $windowData			
		gosub :callSaveMe
		
	else
		send "mz "&$homeSector&"*y  y    *    "
		gosub :player~quikstats
		if ($player~current_sector <> $homeSector)
			gosub :callSaveMe
		end
		setVar $windowData "Sectors Figged: "&$count&" out of "&SECTORS&"*Current Target: "&$destination&"*Target Status: Returned Home Safely*"&$databasecount&" sectors left in database*"
		setWindowContents mowWindow $windowData
		gosub :landOnPlanetEnterCitadel
	end
	return

:getCourses
	killalltriggers
	setArray $COURSE 80
	setVar $sectors ""
	setTextLineTrigger sectorlinetrig :sectorsline " > "
	send "^f*"&$destination&"**q"
	pause


:sectorsline
	killAllTriggers
	setVar $line CURRENTLINE
	replacetext $line ">" " "
	striptext $line "("
	striptext $line ")"
	setVar $line $line&" "
	getWordPos $line $pos "So what's the point?"
	getWordPos $line $pos2 ": ENDINTERROG"
	if (($pos > 0) OR ($pos2 > 0))
		goto :noPath
	end
	getWordPos $line $pos " sector "
	getWordPos $line $pos2 "TO"
	if (($pos <= 0) AND ($pos2 <= 0))
		setVar $sectors $sectors & " " & $line
	end
	getWordPos $line $pos " "&$destination&" "
	getWordPos $line $pos2 "("&$destination&")"
	getWordPos $line $pos3 "TO"
	if ((($pos > 0) OR ($pos2 > 0)) AND ($pos3 <= 0))
		goto :gotSectors
	else
		setTextLineTrigger sectorlinetrig :sectorsline " > "
		setTextLineTrigger sectorlinetrig2 :sectorsline " "&$destination&" "
		setTextLineTrigger sectorlinetrig3 :sectorsline " "&$destination
		setTextLineTrigger sectorlinetrig4 :sectorsline "("&$destination&")"
		setTextLineTrigger donePath :sectorsline "So what's the point?"
		setTextLineTrigger donePath2 :sectorsline ": ENDINTERROG"
	end
	pause

:gotSectors
	killAllTriggers
	setVar $sectors $sectors&" :::"
	setVar $courseLength 0
	setVar $index 1
	setVar $valid FALSE
	:keepGoing
	getWord $sectors $COURSE[$index] $index
	while ($COURSE[$index] <> ":::")
		add $courseLength 1
		add $index 1
		getWord $sectors $COURSE[$index] $index
		if ($COURSE[$index] <> ":::")
			setVar $valid TRUE
		end
	end
	if ($valid)
		setVar $windowData "Sectors Figged: "&$count&" out of "&SECTORS&"*Current Target: "&$destination&"*Target Status: Attempting To Mow*"&$databasecount&" sectors left in database*"
	else
		setVar $windowData "Sectors Figged: "&$count&" out of "&SECTORS&"*Current Target: "&$destination&"*Target Status: Path Already Figged*"&$databasecount&" sectors left in database*"

	end
	setWindowContents mowWindow $windowData
						
:noPath
	killAllTriggers
	return
# ======================     END MOW SUBROUTINES     ==========================

:getTargets
	setVar $databasecount 0
	setVar $randomSectors "  "
	setVar $path_database "  "
	setVar $perc 0
	setVar $i 11
	while ($i <= SECTORS)
		getWordPos $path_database $pos " "&$i&" "
		if ($pos <= 0)
			if ($allsectors)
				setVar $isFigged FALSE
			else
				getSectorParameter $i "FIGSEC" $isFigged
			end
			getSectorParameter $i $bot~parmAM $isTrue
			if (($i <> $stardock) AND ($isTrue = $true) AND ($isFigged <> TRUE))
				setVar $randomSectors $randomSectors&$i&"  "
				add $databasecount 1
				getCourse $path $homeSector $i 
				if ($path = "-1")
					send "/"
					waitOn #179
					echo ANSI_14 "Updating database...*" ANSI_7
					send "^f"&$homeSector&"*"&$i&"**q"
					waitOn "ENDINTERROG"
					getCourse $path $homeSector $i 
				end
					setVar $j 2
					while ($j <= $path)
						if (($path[$j] > 10) AND ($path[$j] <> $stardock))
							setVar $path_database $path_database&" "&$path[$j]
						end
						add $j 1
					end
			end
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
