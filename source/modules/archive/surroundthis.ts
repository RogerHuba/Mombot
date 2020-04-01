	logging off
	loadVar $bot_name
	loadVar $unlimitedGame		
	loadVar $bot_turn_limit		
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
	loadVar $backdoor
	loadVar $rylos
	loadVar $alpha_centauri
	loadVar $command
	fileExists $doesHelpFileExist "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "- "&$command&" [param] {figstodrop} {alarm}    " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    Mows to surround sectors defined in sector param given. " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    Does not do so safely.                                  " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "                                                            " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [param]  - sector parameter to surround            " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    {figstodrop}  - fighters to drop in surrounding sectors " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    {alarm}  - activate alarm                               " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "                                                            " 
		send "'{" $bot_name "} - Writing help file for this command in Help directory.*"
	end
	if ($parm1 <> "0")
		setVar $PARAM $parm1
		upperCase $PARAM
	end
	window mowWindow 350 450 "Mowing to surround this: ["&$PARAM&"]" ontop 
	setArray $COURSE 80
	gosub :quikstats
	if ($CURRENT_PROMPT <> "Citadel")
		send "'{" $bot_name "} - You must run this script from the Citadel prompt.*"
     		halt
	end

	setVar $figsToDrop 1
	isNumber $test $parm2
	if ($test = true)
		if ($parm2 > 0)
			setVar $figsToDrop $parm2
		end
	end
	getWordPos $user_command_line $pos "alarm" 
	if ($pos > 0)
		setVar $alarm_active TRUE
	else
		setVar $alarm_active FALSE
	end

	setVar $location $CURRENT_PROMPT
	setVar $homeSector $CURRENT_SECTOR
	setVar $lastDestination 1
	send "c;q"
	waitOn "Max Figs Per Attack:"
	getWord CURRENTLINE $maxFigAttack2 5
	:getplanetnum
		send "qD"
		waitOn "Planet #"
		getWord CURRENTLINE $planet 2
		stripText $planet "#"
		send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*qjy"
	
	setWindowContents mowWindow "Sectors Figged: "&$count&" out of "&SECTORS&"*"
	gosub :landOnPlanetEnterCitadel
	gosub :getTargets
	if ($databasecount <= 0)
		send "'{" $bot_name "} -  No sector parameters found for "&$PARAM&" set to a value of TRUE*"
	end

	send "'{" $bot_name "} -  Starting up surround this!  Surrounding all "&$PARAM&" sectors*"

	:DOAGAIN
		getRnd $random 1 $databasecount
		getWord $randomSectors $destination $random
		if ($destination = 0)
			send "'{" $bot_name "} -  Database Cleared - Refresh Figs and Restart.*"
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
	
	
			else
				setVar $temp " "&$destination&" "
				replaceText $randomSectors $temp " "
				subtract $databasecount 1	
			end
		end
	goto :DOAGAIN
# ======================     START MOW SUBROUTINES     ==========================
:mow
	

	gosub :quikstats
	if ($maxFigAttack2 > $FIGHTERS)
		setVar $maxFigAttack2 9999
	end
	setVar $j 2
	setVar $result ""		
	while ($j <= $courseLength)
		setVar $result $result&"m  "&$COURSE[$j]&"* "
		if (($COURSE[$j] > 10) AND ($COURSE[$j] <> STARDOCK))
			setVar $result $result&"za"&$maxFigAttack2&"* z * "	
		end
		if (($COURSE[$j] > 10) AND ($COURSE[$j] <> $STARDOCK) AND ($j > 2))
			getWordPos $randomSectors $pos " "&$COURSE[$j]&" "
			if ($pos > 0)
				setVar $result $result&"f "&$figsToDrop&" * c d "
				replaceText $randomSectors " "&$COURSE[$j]&" " " "
				subtract $databasecount 1
			else
				setVar $result $result&"f 1 * c d "
			end
			setSectorParameter $COURSE[$j] "FIGSEC" TRUE
		end
		add $j 1	
	end
	send $result&"zr* "
	gosub :quikstats
	if ($CURRENT_SECTOR <> $destination)
		setVar $windowData "Sectors Figged: "&$count&" out of "&SECTORS&"*Current Target: "&$destination&"*Target Status: DANGER - Call Save Me Activated!"
		setWindowContents mowWindow $windowData			
		gosub :callSaveMe
		
	else
		send "f "&$figsToDrop&"* c d  mz "&$homeSector&"*y  y    *    "
		gosub :quikstats
		if ($CURRENT_SECTOR <> $homeSector)
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
	setVar $i 1
	while ($i <= SECTORS)
		getSectorParameter $i $PARAM $isTrue
		if ($isTrue = TRUE)
			setVar $j 1
			while (SECTOR.WARPS[$i][$j] > 0)
				setVar $test_sector SECTOR.WARPS[$i][$j]
				getWordPos $path_database $pos " "&$test_sector&" "
				if ($pos <= 0)
					getSectorParameter $test_sector $PARAM $isTrue
					if (($isTrue <> TRUE) AND ($test_sector <> $stardock) AND ($test_sector > 10))
						setVar $path_database $path_database&$test_sector&"  "
						setVar $randomSectors $randomSectors&$test_sector&"  "
						add $databasecount 1
						getCourse $path $homeSector $test_sector 
						if ($path = "-1")
							send "/"
							waitOn #179
							echo ANSI_14 "Updating database...*" ANSI_7
							send "^f"&$homeSector&"*"&$test_sector&"**q"
							waitOn "ENDINTERROG"
							getCourse $path $homeSector $test_sector
						end
					end	
				end
				add $j 1
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

:quikstats
	setVar $CURRENT_PROMPT 		"Undefined"
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
			setVar $CURRENT_PROMPT $tempPrompt
		end
		setTextLineTrigger prompt1 :allPrompts "(?="
		pause
	:secondaryPrompts
		getWord currentansiline $checkPrompt 1
		getWord currentline $tempPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $CURRENT_PROMPT $tempPrompt
		end
		setTextLineTrigger prompt2 :secondaryPrompts "(?)"
		pause
	:terraPrompts
		killtrigger prompt3
		killtrigger prompt4
		getWord currentansiline $checkPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $CURRENT_PROMPT "Terra"
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
				getWord $stats $CURRENT_SECTOR   	($current_word + 1)
			elseif ($wordy = "Turns")
				getWord $stats $TURNS  			($current_word + 1)
			elseif ($wordy = "Creds")
				getWord $stats $CREDITS  		($current_word + 1)
			elseif ($wordy = "Figs")
				getWord $stats $FIGHTERS   		($current_word + 1)
			elseif ($wordy = "Shlds")
				getWord $stats $SHIELDS  		($current_word + 1)
			elseif ($wordy = "Hlds")
				getWord $stats $TOTAL_HOLDS   		($current_word + 1)
			elseif ($wordy = "Ore")
				getWord $stats $ORE_HOLDS    		($current_word + 1)
			elseif ($wordy = "Org")
				getWord $stats $ORGANIC_HOLDS    	($current_word + 1)
			elseif ($wordy = "Equ")
				getWord $stats $EQUIPMENT_HOLDS    	($current_word + 1)
			elseif ($wordy = "Col")
				getWord $stats $COLONIST_HOLDS    	($current_word + 1)
			elseif ($wordy = "Phot")
				getWord $stats $PHOTONS   		($current_word + 1)
			elseif ($wordy = "Armd")
				getWord $stats $ARMIDS   		($current_word + 1)
			elseif ($wordy = "Lmpt")
				getWord $stats $LIMPETS   		($current_word + 1)
			elseif ($wordy = "GTorp")
				getWord $stats $GENESIS  		($current_word + 1)
			elseif ($wordy = "TWarp")
				getWord $stats $TWARP_TYPE  		($current_word + 1)
			elseif ($wordy = "Clks")
				getWord $stats $CLOAKS   		($current_word + 1)
			elseif ($wordy = "Beacns")
				getWord $stats $BEACONS 		($current_word + 1)
			elseif ($wordy = "AtmDt")
				getWord $stats $ATOMIC  		($current_word + 1)
			elseif ($wordy = "Corbo")
				getWord $stats $CORBO   		($current_word + 1)
			elseif ($wordy = "EPrb")
				getWord $stats $EPROBES   		($current_word + 1)
			elseif ($wordy = "MDis")
				getWord $stats $MINE_DISRUPTORS   	($current_word + 1)
			elseif ($wordy = "PsPrb")
				getWord $stats $PSYCHIC_PROBE  		($current_word + 1)
			elseif ($wordy = "PlScn")
				getWord $stats $PLANET_SCANNER  	($current_word + 1)
			elseif ($wordy = "LRS")
				getWord $stats $SCAN_TYPE    		($current_word + 1)
			elseif ($wordy = "Aln")
				getWord $stats $ALIGNMENT    		($current_word + 1)
			elseif ($wordy = "Exp")
				getWord $stats $EXPERIENCE    		($current_word + 1)
			elseif ($wordy = "Corp")
				getWord $stats $CORP   			($current_word + 1)
			elseif ($wordy = "Ship")
				getWord $stats $SHIP_NUMBER   		($current_word + 1)
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
	gosub :quikstats
    	setVar $figstodeploy 1
	gosub :deployfigs 
	setVar $savetarget $CURRENT_SECTOR 
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
	send "'pickup " & $CURRENT_SECTOR  & " ::*"


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
        getText CURRENTLINE $planet "Saveme script activated - Planet " " to "
        send "L " & $planet & "* C 'I landed on planet " & $planet & "*"
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
    if (($CURRENT_SECTOR  < 11) or ($CURRENT_SECTOR  = STARDOCK))
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
	send "l " $planet "* c"
	waitOn "<Enter Citadel>"
	return
:leaveCitadelAndPlanet	
	send "q q"
	waitOn "Blasting off from"
	waitOn "Command [TL"
	return