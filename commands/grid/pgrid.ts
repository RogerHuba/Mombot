	gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&"pgrid - planet grid into sector "
	gosub :bot~helpfile

# ======================     START PLANET GRID (PGRID) SUBROUTINE    ==========================
:pgrid
    setVar $SWITCHBOARD~bot_name $bot~bot_name
    setVar $SWITCHBOARD~self_command $self_command

    gosub :PLAYER~QUIKSTATS
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    setVar $startingPgridSector $PLAYER~CURRENT_SECTOR
    setVar $startingShip $PLAYER~SHIP_NUMBER
    setVar $bot~validPrompts "Citadel Command"
    setVar $PROMPT~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    setVar $PROMPT~validPrompts "Command Citadel"
    gosub :PROMPT~checkStartingPrompt

    if ($startingLocation = "Citadel")
        setVar $inCitadel "Q Q "
    else
        setVar $inCitadel ""
    end
    getWordPos " "&$bot~user_command_line&" " $pos "scan"
    if ($pos > 0)
        setVar $doDensityScan TRUE
    else
        setVar $doDensityScan FALSE
    end
    getWordPos " "&$bot~user_command_line&" " $pos "unsafe"
    if ($pos > 0)
        setVar $unsafe TRUE
    else
        setVar $unsafe FALSE
    end
    getWordPos " " & $bot~user_command_line & " " $pos " wave:"
    if ($pos > 0)
        getText $bot~user_command_line $wave "wave:" " "
        isNumber $test $wave
        if ($test)
            setVar $wave $wave
        else
            setVar $wave 0
        end     
    else
        setVar $wave 0
    end
    getWordPos " " & $bot~user_command_line & " " $pos " f:"
    if ($pos > 0)
        getText $bot~user_command_line $fighterDrop "f:" " "
        isNumber $test $fighterDrop
        if ($test)
            setVar $fighterDrop $fighterDrop
        else
            setVar $fighterDrop 1
        end     
    else
        setVar $fighterDrop 1
    end
    getWordPos " " & $bot~user_command_line & " " $pos " x:"
    if ($pos > 0)
        getText $bot~user_command_line $xportShip "x:" " "
        isNumber $test $xportShip
        if ($test)
            setVar $xporting TRUE
        else
            setVar $SWITCHBOARD~message "Invalid xport ship entered*"
            gosub :SWITCHBOARD~switchboard
            halt
        end     
    else
        setVar $xporting FALSE
    end

	setVar $surrendor TRUE
	getWordPos " "&$bot~user_command_line&" " $pos1 " nosur"
	getWordPos " "&$bot~user_command_line&" " $pos2 " nosurrender"
	if (($pos1 > 0) or ($pos2 > 0))
		setVar $surrendor FALSE	
	else
		setVar $surrendor TRUE
	end
	getWordPos " "&$bot~user_command_line&" " $pos " d:"
	setVar $validDesignatedDen FALSE

	if ($pos > 0)
		setVar $doDensityScan TRUE


		getText $bot~user_command_line $designatedDen "d:" " "
		
		isNumber $test $designatedDen
		if ($test)
			setVar $validDesignatedDen TRUE
			setVar $tempDensity2 $designatedDen
		else
			setVar $SWITCHBOARD~message "invalid#"&$designatedDen&"# designated density*"
			gosub :SWITCHBOARD~switchboard
			halt
		end		
	else
		setVar $validDesignatedDen FALSE
	end

    getWordPos " "&$bot~user_command_line&" " $pos " r "
    if ($pos > 0)
        setVar $retreating TRUE
    else
        setVar $retreating FALSE
    end
    setVar $pgridSector $bot~parm1
    isNumber $test $pgridSector
    if ($test = 0)
        setVar $SWITCHBOARD~message "Invalid PGRID number.*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
    isNumber $test $bot~parm2
    if ($test = 0)
        setVar $waveCount 1
    else
        if ($bot~parm2 > 0)
            setVar $waveCount $bot~parm2
        else
            setVar $waveCount 1
        end
    end
    if ($pgridSector = 0)
        setVar $SWITCHBOARD~message "Invalid PGRID number.*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
    if ($pgridSector < 11)
        setVar $SWITCHBOARD~message "Cannot PGRID into FedSpace!*"
        gosub :SWITCHBOARD~switchboard
        halt
    elseif ($pgridSector = $map~stardock)
        setVar $SWITCHBOARD~message "Cannot PGRID into STARDOCK!*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
    if ($startingLocation = "Citadel")
        send "q"
        gosub :PLANET~getPlanetInfo
        send "c "
    end
    if ($SHIP~SHIP_MAX_ATTACK <= 0)
        gosub :SHIP~getShipStats
    end
    setVar $i 1
    setVar $isFound false
    while (SECTOR.WARPS[$PLAYER~CURRENT_Sector][$i] > 0)
        if (SECTOR.WARPS[$PLAYER~CURRENT_Sector][$i] = $pgridSector)
            setVar $isFound TRUE
        end
        add $i 1
    end
    if ($isFound = FALSE)
        setVar $SWITCHBOARD~message "Cannot PGRID.  Sector " & $pgridsector & " not Adjacent, aborting..*"
        gosub :SWITCHBOARD~switchboard
        halt
    end 
    setvar $switchboard~message "Planet gridding into sector " & $pgridSector & "* c v* y* " & $pgridSector & "* q "

    setVar $mac " * "
    if ($waveCount <= 0)
        setVar $waveCount 1
    end
    if ($wave > 0)
        setVar $mac $mac & "a z"&$wave&"* * r * "
    else
        if ($PLAYER~FIGHTERS < $SHIP~SHIP_MAX_ATTACK)
            setVar $mac $mac & "a z " & ($PLAYER~FIGHTERS-1) & "9999" & "* * "
        else
            setVar $i 1
            while (($i <= $waveCount) AND ($PLAYER~FIGHTERS >= $SHIP~SHIP_MAX_ATTACK))
                setVar $mac $mac & "a z " & ($SHIP~SHIP_MAX_ATTACK-1) & "9999" & "* * "
                add $i 1
                subtract $PLAYER~FIGHTERS ($SHIP~SHIP_MAX_ATTACK-1)
            end
        end
    end
    if ($unsafe = true)
        setVar $mac $mac & "f z "&$fighterDrop&" * z c d l j" & #8 & $planet~planet & "* l j" & #8 & $planet~planet & "*  "
    else
        setVar $mac $mac & "j r * f z "&$fighterDrop&" * z c d * "
    end
    setVar $previousPlanetsInSector SECTOR.PLANETCOUNT[$PLAYER~CURRENT_SECTOR]
    if ($doDensityScan = TRUE)
        send "s* "
    end
    if (($SCAN_TYPE <> "None") AND ($doDensityScan = TRUE))
        :density_scanning

		if ($validDesignatedDen = TRUE)
			setVar $tempDensity $tempDensity2
		else
			setVar $tempDensity SECTOR.DENSITY[$pgridsector]
		end

           # setVar $tempDensity SECTOR.DENSITY[$pgridsector]
            setVar $pgridDensity "-99"
            send "q q sdz* l " & $planet~planet & "* c  "
            waitOn "Relative Density Scan"
            setTextLineTrigger denscheck  :getDensityPgrid " " & $pgridSector & "  ==>"
            setTextLineTrigger denscheck2 :getDensityPgrid2 " " & $pgridSector & ") ==>"
            setTextLineTrigger denscheck3 :getDensityPgrid "(" & $pgridSector & ") ==>"
            setTextLineTrigger denscheckdone :doneDensityCheck "<Enter Citadel>"
            pause
        :getDensityPgrid
            killtrigger denscheck
            killtrigger denscheck3
            killtrigger denscheck2
            getWord CURRENTLINE $pgridDensity 4
            stripText $pgridDensity ","
            pause
        :getDensityPgrid2
            killtrigger denscheck
            killtrigger denscheck3
            killtrigger denscheck2
            getWord CURRENTLINE $pgridDensity 5
            stripText $pgridDensity ","
            pause
        :doneDensityCheck
            killalltriggers
            if ($tempDensity <> "-1")
                if ($pgridDensity = "-99")
                    setVar $SWITCHBOARD~message "Last Density Scan was not correctly grabbed, cannot safely continue.*"
                    gosub :SWITCHBOARD~switchboard
                    halt
                elseif ($pgridDensity > $tempDensity)
                    setVar $SWITCHBOARD~message "Density increased since last scan in sector "&$pgridsector&". ("&$pgridDensity&")*"
                    gosub :SWITCHBOARD~switchboard
                    halt
                end
            else
                setVar $SWITCHBOARD~message "You must density scan sector "&$pgridsector&" at least once before pgridding.*"
                gosub :SWITCHBOARD~switchboard
                halt
            end
    end 
    setVar $newPlanetsInSector SECTOR.PLANETCOUNT[$PLAYER~CURRENT_SECTOR]
    if (($previousPlanetsInSector < $newPlanetsInSector) AND ($newPlanetsInSector > 1))
        setVar $SWITCHBOARD~message "Planet number increased since last scan in this sector. Try again to override.*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
    if ($retreating)
        send $inCitadel & "m " & $pgridSector & $mac & "< n n n * "

	if ($surrendor = TRUE)
		send " h s y * "
	end
        if ($planet~planet > 0)
            send "l j" & #8 & $planet~planet & "*  *  "
        end
        gosub :PLAYER~QUIKSTATS
        if (($PLAYER~CURRENT_SECTOR <> $startingPgridSector))
            send "'" & $pgridSector & "=saveme* "
            gosub :emergencyLanding
            setvar $switchboard~message "Unsuccessful retreat from sector " & $pgridSector & ". Attempted saveme call.*"
        else
            if ($PLAYER~CURRENT_PROMPT = "Planet")
                send "m * * * c p " & $pgridsector & "* y s* "
            end
            gosub :PLAYER~QUIKSTATS
            if ($PLAYER~CURRENT_SECTOR = $pgridsector)
                setVar $SWITCHBOARD~message "Successfully P-gridded into sector " & $pgridSector & "*"
                setVar $target $pgridSector
                setSectorParameter $target "FIGSEC" TRUE
            else
                setVar $SWITCHBOARD~message "No fighter deployed in sector " & $pgridSector & "*"
                gosub :SWITCHBOARD~switchboard
            end
        end
    else

        setVar $pgridString "'" & $pgridSector & "=saveme* " & $inCitadel & "m " & $pgridSector & $mac

	if ($surrendor = TRUE)
		setVar $pgridString $pgridString & " h s y * "

	end
	if ($xporting)
            setVar $pgridString $pgridString & "x   " & $xportship & "* * "
        end
        send $pgridString
        if ($xporting)
            gosub :PLAYER~QUIKSTATS
            if ($PLAYER~SHIP_NUMBER = $startingShip)
                gosub :emergencyLanding
                setVar $SWITCHBOARD~message "Unsuccessful xport out of sector " & $pgridSector & ". Ship too far away or I was photoned.*"  
                gosub :SWITCHBOARD~switchboard
            else
                if ($PLAYER~CURRENT_SECTOR = $startingPgridSector)
                    gosub :emergencyLanding
                    setVar $SWITCHBOARD~message "Unsuccessful pgrid unless xport ship was in starting sector. Currently in xport ship.*"
                    gosub :SWITCHBOARD~switchboard
                else
                    setDelayTrigger waitPgridXport :goPgridXport 3000
                    pause
                    :goPgridXport
                        send "x   " & $startingShip & "* * l j" & #8 & $planet~planet & "*  *  "
                        gosub :PLAYER~QUIKSTATS
                        if ($PLAYER~CURRENT_PROMPT = "Planet")
                            send "m * * * c s* "
                        end
                        if ($PLAYER~SHIP_NUMBER <> $startingShip)
                            setVar $SWITCHBOARD~message "Gridding ship not available for re-export.  Bot is in safe ship.*" 
                            gosub :SWITCHBOARD~switchboard
                        else
                            setVar $SWITCHBOARD~message "Successfully P-gridded w/xport into sector " & $pgridSector & "*"
                            gosub :SWITCHBOARD~switchboard
                        end
                end
            end
        else
            gosub :emergencyLanding
            gosub :PLAYER~QUIKSTATS
            if (($PLAYER~CURRENT_SECTOR <> $pgridSector))
                setVar $SWITCHBOARD~message "Unsuccessful P-grid into sector " & $pgridSector & ". Someone make sure bot is picked up.*"
                gosub :SWITCHBOARD~switchboard
            else
                setVar $SWITCHBOARD~message "Successfully P-gridded into sector " & $pgridSector & "*"
                gosub :SWITCHBOARD~switchboard
                setVar $target $pgridSector
                setSectorParameter $target "FIGSEC" TRUE
            end
        end
    end
    halt
:emergencyLanding
    setVar $i 0
    while ($i < 15)
        add $i 1
        send "l j" & #8 & $planet~planet & "*  *  "
    end
    gosub  :player~currentPrompt
    if ($PLAYER~current_prompt = "Planet")
        send "m * * * c s* "
    end
return
# ======================     END PGRID (PGRID) SUBROUTINE     ==========================

# includes:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\prompt"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\player\currentprompt\player"
