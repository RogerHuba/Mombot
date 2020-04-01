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
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "- "&$command&" {figstodrop} {all} {alarm} {notwarp}         " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    Mows to unfigged upgraded fuel ports in grid.           " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    Does not do so safely.                                  " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "                                                            " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    {all} - Mows to all upgraded ports                      " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    {alarm}  - activate alarm                               " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    {notwarp} - Don't twarp near closest unfigged sector" 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    {figstodrop} - How many fighters to drop" 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "                                   " 
		send "'{" $switchboard~bot_name "} - Writing help file for this command in Help directory.*"
	end
	window mowWindow 350 450 "Sectors Gridded" ontop 
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

	getWordPos $bot~user_command_line $pos "notwarp" 
	if ($pos > 0)
		setVar $no_twarp TRUE
	else
		setVar $no_twarp FALSE
	end


	getWordPos $bot~user_command_line $pos "alarm" 
	if ($pos > 0)
		setVar $alarm_active TRUE
	else
		setVar $alarm_active FALSE
	end
	getWordPos $bot~user_command_line $pos "all" 
	if ($pos > 0)
		setVar $all TRUE
	else
		setVar $all FALSE
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
		if (($COURSE[$j] > 10) AND ($COURSE[$j] <> STARDOCK))
			setVar $result $result&"za"&$maxFigAttack2&"* z * "	
		end
		if (($COURSE[$j] > 10) AND ($COURSE[$j] <> $STARDOCK) AND ($j > 2))
			setVar $result $result&"f "&$figsToDrop&"* c d "
			setSectorParameter $COURSE[$j] "FIGSEC" TRUE
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
		send "f "&$figsToDrop&"* c d  mz "&$homeSector&"*y  y    *    "
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
	setVar $i 11
	while ($i <= SECTORS)
		getSectorParameter $i "FIGSEC" $isFigged
		setVar $isFound FALSE
		if (($i > 10) AND (PORT.BUYFUEL[$i] = FALSE) AND (PORT.EXISTS[$i] = TRUE) AND ($isFigged <> TRUE))
			setVar $currentFuel PORT.FUEL[$i]
			multiply $currentfuel 100
			if (port.percentfuel[$i] <> 0)
				divide $currentfuel port.percentfuel[$i]
			end
			if ($currentFuel > 5000)
				setVar $isFound TRUE
				setVar $randomSectors $randomSectors&$i&"  "
				add $databasecount 1
			end
		end
		getWordPos $randomSectors $pos " "&$i&" "
		if (($pos <= 0) AND ($all = TRUE) AND ($isFound <> TRUE) AND (PORT.BUYORG[$i] = TRUE) AND (PORT.EXISTS[$i] = TRUE) AND ($isFigged <> TRUE))
			setVar $currentFuel PORT.ORG[$i]
			multiply $currentfuel 100
			if (port.percentorg[$i] <> 0)
				divide $currentfuel port.percentorg[$i]
			end
			if ($currentFuel > 5000)
				setVar $randomSectors $randomSectors&$i&"  "
				add $databasecount 1
				setVar $isFound TRUE
			end
		end
		getWordPos $randomSectors $pos " "&$i&" "
		if (($pos <= 0) AND ($all = TRUE) AND ($isFound <> TRUE) AND (PORT.BUYEQUIP[$i] = TRUE) AND (PORT.EXISTS[$i] = TRUE) AND ($isFigged <> TRUE))
			setVar $currentFuel PORT.EQUIP[$i]
			multiply $currentfuel 100
			if (port.percentequip[$i] <> 0)
				divide $currentfuel port.percentequip[$i]
			end
			if ($currentFuel > 5000)
				setVar $randomSectors $randomSectors&$i&"  "
				add $databasecount 1
				setVar $isFound TRUE
			end
		end
		add $i 1
	end
return



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
