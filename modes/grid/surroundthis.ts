	logging off
	gosub :BOT~loadVars

	setVar $BOT~help[1]   $BOT~tab&" surroundthis [param] {figstodrop} {alarm} {notwarp}   " 
	setVar $BOT~help[2]   $BOT~tab&"    Mows to surround sectors defined in sector param given. " 
	setVar $BOT~help[3]   $BOT~tab&"    Does not do so safely.                                  " 
	setVar $BOT~help[4]   $BOT~tab&"                                                            " 
	setVar $BOT~help[5]   $BOT~tab&"    [param]  - sector parameter to surround            " 
	setVar $BOT~help[6]   $BOT~tab&"    {figstodrop}  - fighters to drop in surrounding sectors " 
	setVar $BOT~help[7]   $BOT~tab&"    {alarm}  - activate alarm                               " 
	setVar $BOT~help[8]   $BOT~tab&"    {notwarp}  - only mow, no twarp to closest fig          " 
	
	gosub :bot~helpfile


	if ($bot~parm1 <> "0")
		setVar $bot~parmAM $bot~parm1
		upperCase $bot~parmAM
	end
	window mowWindow 350 450 "Mowing to surround this: ["&$bot~parmAM&"]" ontop 
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
	if ($databasecount <= 0)
		send "'{" $switchboard~bot_name "} -  No sector parameters found for "&$bot~parmAM&" set to a value of TRUE*"
	end

	send "'{" $switchboard~bot_name "} -  Starting up surround this!  Surrounding all "&$bot~parmAM&" sectors*"

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
		getSectorParameter $i $bot~parmAM $isTrue
		if ($isTrue = TRUE)
			setVar $j 1
			while (SECTOR.WARPS[$i][$j] > 0)
				setVar $test_sector SECTOR.WARPS[$i][$j]
				getWordPos $path_database $pos " "&$test_sector&" "
				if ($pos <= 0)
					getSectorParameter $test_sector $bot~parmAM $isTrue
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
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\currentprompt\player"
