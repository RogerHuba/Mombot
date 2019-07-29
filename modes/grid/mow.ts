    gosub :BOT~loadVars
    loadVar $MAP~stardock
    loadvar $SWITCHBOARD~bot_name 
    loadvar $ship~ship_max_attack
    loadvar $planet~planet


	if (($bot~parm1 = "?") or ($bot~parm1 = "help"))
		goto :wait_for_command
	end

    gosub :PLAYER~quikstats
    setVar $homeSector $PLAYER~CURRENT_SECTOR
    setVar $bot~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $bot~validPrompts "Command <Underground> Do How Corporate Citadel Planet Computer Terra <StarDock> <FedPolice> <Tavern> <Libram <Galactic <Hardware <Shipyards>"
    gosub :bot~checkStartingPrompt

        setVar $PLAYER~destination $bot~parm1
        isNumber $number $PLAYER~destination
        if ($number <> 1)
            setVar $SWITCHBOARD~message "Sector entered is not a number, cannot mow!*"
            gosub :SWITCHBOARD~switchboard
            halt
        elseif (($PLAYER~destination <= 0) OR ($PLAYER~destination > SECTORS))
            setVar $SWITCHBOARD~message "Sector entered is not valid, cannot mow!*"
            gosub :SWITCHBOARD~switchboard
            halt
        end
        setVar $PLAYER~destination ($bot~parm1+0)
        if ($PLAYER~destination = $PLAYER~CURRENT_SECTOR)
            setVar $SWITCHBOARD~message "You are already in that sector!*"
            gosub :SWITCHBOARD~switchboard
            halt
        end    
    gosub :mow
    if (($PLAYER~CURRENT_PROMPT = "<StarDock>") OR ($PLAYER~CURRENT_PROMPT = "<Hardware"))
        setVar $SWITCHBOARD~message "Safely on Stardock*"
            gosub :SWITCHBOARD~switchboard
    end
    if (($PLAYER~CURRENT_SECTOR <> $PLAYER~destination) and ($twarp_back = FALSE))
        setVar $SWITCHBOARD~message "Mow did not reach destination!*"
            gosub :SWITCHBOARD~switchboard
    else
        if (($PLAYER~CURRENT_SECTOR <> $homeSector) and ($twarp_back = TRUE))
            setVar $SWITCHBOARD~message "Mow did not make it back to starting sector!*"
            gosub :SWITCHBOARD~switchboard
        else
            if (($twarp_back = TRUE) and ($PLAYER~CURRENT_SECTOR = $homeSector) and ($bot~startingLocation = "Citadel"))
                gosub :PLANET~landingSub
            end
            setVar $SWITCHBOARD~message "Mow completed.*"
            gosub :SWITCHBOARD~switchboard
        end
    end
    goto :wait_for_command


:mow
        
        if ($bot~startingLocation = "Citadel")
            send "q"
            gosub :PLANET~getPlanetInfo
            send "t*t1* c "
        end

        if ($bot~startingLocation = "Command")
            gosub :SHIP~getShipStats
            setVar $mow_SHIP_MAX_ATTACK $SHIP~SHIP_MAX_ATTACK
        elseif ($SHIP~SHIP_MAX_ATTACK <= 0)
            setVar $mow_SHIP_MAX_ATTACK 99991111
        else
            setVar $mow_SHIP_MAX_ATTACK $SHIP~SHIP_MAX_ATTACK
        end
        getWordPos " "&$bot~user_command_line&" " $pos "kill"
        if ($pos > 0)
        	gosub :combat~init 
            setVar $mow_kill TRUE
        else
            setVar $mow_kill FALSE
        end
        getWordPos " "&$bot~user_command_line&" " $pos "saveme"
        if ($pos > 0)
            setVar $mow_saveme TRUE
        else
            setVar $mow_saveme FALSE
        end
        getWordPos " "&$bot~user_command_line&" " $pos "hoover"
        if ($pos > 0)
            setVar $hoover TRUE
        else
            setVar $hoover FALSE
        end
        getWordPos " "&$bot~user_command_line&" " $pos "back"
        if ($pos > 0)
            setVar $twarp_back TRUE
            if ($player~ore_holds <= 10)
                send "'{" $SWITCHBOARD~bot_name "} - Need more fuel ore on your ship if you want to twarp back!*"
                halt
            end
        else
            setVar $twarp_back FALSE
        end
        getWordPos " "&$bot~user_command_line&" " $pos " p "
        if ($pos > 0)
            setVar $are_we_docking TRUE
        else
            setVar $are_we_docking FALSE
        end
        setVar $figsToDrop $bot~parm2
        isNumber $number $figsToDrop
        if ($number <> TRUE)
            setVar $figsToDrop 0
        else
            if ($figsToDrop > 50000)
                send "'{" $SWITCHBOARD~bot_name "} - Cannot drop more than 50,000 fighters per sector!*"
                halt
            elseif ($figsToDrop > $PLAYER~FIGHTERS)
                send "'{" $SWITCHBOARD~bot_name "} - Fighters to drop cannot exceed total ship fighters.*"
                halt
            end
        end
        if ($mow_SHIP_MAX_ATTACK > $PLAYER~FIGHTERS)
            setVar $mow_SHIP_MAX_ATTACK 9999
        end
	if ($mow_SHIP_MAX_ATTACK < 99) or ($PLAYER~FIGHTERS < 99)
		if ($mow_SHIP_MAX_ATTACK = 0)
			setVar $mow_SHIP_MAX_ATTACK ""
		end
		setVar $mow_SHIP_MAX_ATTACK $mow_SHIP_MAX_ATTACK & "998877111"
	end



        if ($PLAYER~CURRENT_SECTOR <> CURRENTSECTOR)
            setVar $PLAYER~CURRENT_SECTOR 0
        end
        gosub :player~getCourse
        if ($PLAYER~courseLength <= 0)
            halt
        end
        setVar $j 3
        setVar $result "q q q * "
        while ($j <= $PLAYER~courseLength)
            if ($PLAYER~mowCourse[$j] <> $PLAYER~CURRENT_SECTOR)
                setVar $result $result&"m  "&$PLAYER~mowCourse[$j]&"*   "
                if (($PLAYER~mowCourse[$j] > 10) AND ($PLAYER~mowCourse[$j] <> $MAP~stardock))
                    setVar $result $result&"za  "&$mow_SHIP_MAX_ATTACK&"* *  "
                end
                if ((($figsToDrop > 0) or ($hoover = true)) AND ($PLAYER~mowCourse[$j] > 10) AND ($PLAYER~mowCourse[$j] <> $MAP~stardock) AND ($j > 2))
                    if ($hoover = true)
                        setVar $result $result&"f * "
                    else
                        setVar $result $result&"f "&$figsToDrop&" * c d "
                        setVar $target $PLAYER~mowCourse[$j]
                        gosub :player~addfigtodata
                    end
                end
                if (($j >= $PLAYER~courseLength) AND ($mow_saveme = TRUE) AND ($figstoDrop = 0))
                    setVar $result $result&"f 1 * c d "
                    setVar $target $PLAYER~mowCourse[$j]
                    gosub :player~addfigtodata
                end
                if (($called = FALSE) AND ($mow_saveme = TRUE) AND ($j >= ($PLAYER~courseLength-2)))
                    setVar $result $result&"'"&$PLAYER~destination&"=saveme*  "
                    setVar $called TRUE
                end
                if (($twarp_back = TRUE) AND ($j = ($PLAYER~courseLength)))
                    setVar $result $result&"  mz "&$homeSector&"*y  y    *    "
                end
            end
            add $j 1
        end
        setVar $docking_instructions ""
        if ($are_we_docking)
            setVar $docking_instructions " p z t *"
            if ($PLAYER~destination = $MAP~stardock)
                setVar $docking_instructions " p z s g y g q h *"
            end
            setVar $result $result & $docking_instructions
        elseif (($mow_saveme = TRUE) AND ($bot~startingLocation = "Citadel"))
            setVar $i 0
            while ($i < 8)
                add $i 1
                #setVar $result $result&"l j" & #8 & $planet~planet & "*  *  "
                setVar $result $result&"l j" & #8 & $planet~planet & "*  *  j  c  *  *  "
            end
        end
        send $result
        gosub :PLAYER~quikstats
        if (($PLAYER~CURRENT_PROMPT = "Command") AND ($mow_kill = TRUE))
            setVar $bot~startingLocation "Command"
            goSub :SECTOR~getSectorData
            goSub :combat~fastAttack
        elseif ($PLAYER~CURRENT_PROMPT = "Planet")
            send "m * * * c "
            if ($mow_kill = FALSE)
                send "s* "
            else
                setVar $bot~startingLocation "Citadel"
                gosub :scanit_cit_kill
            end
        elseif ($are_we_docking = FALSE)
            send "*"
        end
return
# ======================     END MOW SUBROUTINES     ==========================


:wait_for_command

	# write the help file at the end for speed purposes #
	setVar $BOT~help[1] $BOT~tab&"mow [destination] {figs} {kill} {cap} {saveme} {p} {back}"
	setVar $BOT~help[2] $BOT~tab&" Options: "
	setVar $BOT~help[3] $BOT~tab&"     {p} - port ship immediately upon arrival."
	setVar $BOT~help[4] $BOT~tab&"  {kill} - attempt to kill immediately upon arrival."
	setVar $BOT~help[5] $BOT~tab&"   {cap} - attempt to capture immediately upon arrival."
	setVar $BOT~help[6] $BOT~tab&"{saveme} - call saveme to be picked up at destination."
	setVar $BOT~help[7] $BOT~tab&"  {back} - twarp back to start sector after mow"
	setVar $BOT~help[8] $BOT~tab&"{hoover} - attempts to pull fighters from sectors     "
	gosub :bot~helpfile

halt

:killthetriggers
    killalltriggers
return


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\checkstartingprompt\bot"
include "source\bot_includes\planet\landingsub\planet"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\player\getcourse\player"
include "source\bot_includes\player\addfigtodata\player"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastattack\combat"
