	gosub :BOT~loadVars
    loadvar $bot~subspace
	loadvar $SHIP~cap_file

	setVar $BOT~help[1]   $BOT~tab&"hunt {sector} {p} {back} {nosaveme}"
	setVar $BOT~help[2]   $BOT~tab&"      "
	setVar $BOT~help[3]   $BOT~tab&"      Will attempt to reach sector passively while hunting "
	setVar $BOT~help[4]   $BOT~tab&"      for kill targets, even photoning under enemy fighters"
	setVar $BOT~help[5]   $BOT~tab&"      if possible.  It will photon targets, or kill them if"
	setVar $BOT~help[6]   $BOT~tab&"      you have no photons."
	setVar $BOT~help[7]   $BOT~tab&"      "
	setVar $BOT~help[8]   $BOT~tab&"    {sector} - sector to try to hunt "
	setVar $BOT~help[9]   $BOT~tab&"         {p} - attempt to port at end of hunt "
    setVar $BOT~help[10]  $BOT~tab&"      {back} - twarp back to starting sector after hunt "
    setVar $BOT~help[11]  $BOT~tab&"  {nosaveme} - if you don't have saveme person, pick this option "
    
		
	gosub :bot~helpfile

:hunt
	setVar $PLAYER~save TRUE
	gosub :combat~init 

    setvar $are_we_docking false
    getwordpos " "&$bot~user_command_line&" " $pos " p "
    if ($pos > 0)
        setVar $are_we_docking TRUE
    end

    setvar $twarp_back false
    getwordpos " "&$bot~user_command_line&" " $pos " back "
    if ($pos > 0)
        setVar $twarp_back TRUE
    end

    setvar $nosaveme false
    getwordpos " "&$bot~user_command_line&" " $pos " nosaveme "
    if ($pos > 0)
        setVar $nosaveme TRUE
    end

    killalltriggers
    gosub :PLAYER~quikstats

    setvar $start_sector $player~current_sector

    ################
    # check prompt #
    ################
    setVar $bot~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $bot~validPrompts "Command <Underground> Do How Corporate Citadel Planet Computer Terra <StarDock> <FedPolice> <Tavern> <Libram <Galactic <Hardware <Shipyards>"
    gosub :bot~checkStartingPrompt

    #####################
    # Must have scanner #
    #####################
    if ($PLAYER~SCAN_TYPE = "None")
        setvar $switchboard~message "Hunt can only be run when you have a long range scanner.*"
        gosub :switchboard~switchboard
        halt
    end

    ####################
    # check ship stats #
    ####################
    if (($PLAYER~startingLocation = "Command") or ($player~startingLocation = "Citadel"))
        gosub :SHIP~getShipStats
    elseif ($SHIP~SHIP_MAX_ATTACK <= 0)
        setVar $SHIP~SHIP_MAX_ATTACK 99991111
    end
    if ($SHIP~SHIP_MAX_ATTACK > $PLAYER~FIGHTERS)
        setVar $SHIP~SHIP_MAX_ATTACK $PLAYER~FIGHTERS
    end

    ############################
    # Validate the hunt sector #
    ############################
    setVar $PLAYER~destination $bot~parm1
    isNumber $number $PLAYER~destination
    if ($number <> 1)
        setvar $switchboard~message "Sector entered is not a number, cannot hunt that sector!*"
        gosub :switchboard~switchboard
        halt
    elseif (($PLAYER~destination <= 0) OR ($PLAYER~destination > SECTORS))
        setvar $switchboard~message "Sector entered is not valid, cannot hunt to that sector!*"
        gosub :switchboard~switchboard
        halt
    end



    gosub :player~getCourse
    if ($PLAYER~courseLength <= 0)
        setvar $switchboard~message "Can't find course to that sector!  Make sure you have ztm done.*"
        gosub :switchboard~switchboard
        halt
    end


    setVar $isSafe TRUE
    setvar $player~current_prompt "Command"
    send "q q q * "

    setVar $j 3
    while (($j <= $PLAYER~courseLength) AND ($isSafe))
        setVar $nextSafeSector $PLAYER~mowCourse[$j]
        gosub :scan_and_kill_if_possible
        if ($killing_error = true)
            setvar $isSafe false
        else
            setVar $safeDensityValue 0
            if (PORT.EXISTS[$nextSafeSector] = TRUE)
                add $safeDensityValue 100
            end
            if ((SECTOR.FIGS.QUANTITY[$nextSafeSector] > 0) AND ((SECTOR.FIGS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.FIGS.OWNER[$nextSafeSector] = "belong to your Corp")))
                add $safeDensityValue (SECTOR.FIGS.QUANTITY[$nextSafeSector] * 5)
            end
            if ((SECTOR.LIMPETS.QUANTITY[$nextSafeSector] > 0) AND ((SECTOR.LIMPETS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.LIMPETS.OWNER[$nextSafeSector] = "belong to your Corp")) AND (SECTOR.ANOMALY[$nextSafeSector] = TRUE))
                add $safeDensityValue (SECTOR.LIMPETS.QUANTITY[$nextSafeSector] * 3)
            end
            if ((SECTOR.MINES.QUANTITY[$nextSafeSector] > 0) AND ((SECTOR.MINES.OWNER[$nextSafeSector] = "yours") OR (SECTOR.MINES.OWNER[$nextSafeSector] = "belong to your Corp")))
                add $safeDensityValue (SECTOR.MINES.QUANTITY[$nextSafeSector] * 2)
            end
            setVar $densitySafe ((SECTOR.DENSITY[$nextSafeSector] <= 0) OR (SECTOR.DENSITY[$nextSafeSector] = $safeDensityValue))
            if ($densitySafe <> TRUE)
                setVar $minesSafe ((SECTOR.MINES.QUANTITY[$nextSafeSector] <= 0) OR (((SECTOR.MINES.OWNER[$nextSafeSector] = "yours") OR (SECTOR.MINES.OWNER[$nextSafeSector] = "belong to your Corp"))))
                setVar $figsSafe  ((SECTOR.FIGS.QUANTITY[$nextSafeSector] <= 0) OR (((SECTOR.FIGS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.FIGS.OWNER[$nextSafeSector] = "belong to your Corp"))))
                #########################################
                # for now, only avoids shielded planets #
                #########################################
                setVar $planet~planetSafe ((SECTOR.PLANETCOUNT[$nextSafeSector] <= 0) OR (($nextSafeSector = $MAP~stardock) OR ($nextSafeSector <= 10)))
                setvar $containsShieldedPlanet false
                if (SECTOR.PLANETCOUNT[$nextSafeSector] > 0)
                    setVar $p 1
                    while ($p <= SECTOR.PLANETCOUNT[$nextSafeSector])
                        getWord SECTOR.PLANETS[$nextSafeSector][$p] $test 1
                        if ($test = "<<<<")
                            setVar $containsShieldedPlanet TRUE
                        end
                        add $p 1
                    end
                end
                setVar $navHazSafe (SECTOR.NAVHAZ[$nextSafeSector] <= 0)
                setVar $player~limpetsSafe (SECTOR.ANOMALY[$nextSafeSector] = FALSE) OR ((((SECTOR.LIMPETS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.LIMPETS.OWNER[$nextSafeSector] = "belong to your Corp"))))
            end
            setvar $photoning_in false
            if (($densitySafe = true) OR (($player~limpetsSafe = true) AND ($figsSafe = true) AND ($minesSafe = true) AND ($navHazSafe = true) AND ($containsShieldedPlanet = false)))
                    send "m "&$PLAYER~mowCourse[$j]&"* "
                    setvar $player~current_sector $PLAYER~mowCourse[$j]
            else
                if ((($player~limpetsSafe AND $navHazSafe AND $planet~planetSafe) and ($player~photons > 0)))
                    send "c p y "&$player~mowCourse[$j]&"* y q  m "&$PLAYER~mowCourse[$j]&"* "
                    setvar $player~current_sector $PLAYER~mowCourse[$j]
                    setvar $player~photons ($player~photons-1)
                    setvar $photoning_in true
                else
                    setvar $isSafe false
                end
            end        
        end

        if ((($PLAYER~mowCourse[$j] > 10) AND ($PLAYER~mowCourse[$j] <> $MAP~stardock) AND ($j > 2)) and ($isSafe = true))
            if ($photoning_in = true)
                send "h 2 1* c "
                waiton "Handle which mine type, 1 Armid or 2 Limpet"
            else
                send "f 1 * c d "
                setVar $target $PLAYER~mowCourse[$j]
                gosub :player~addfigtodata
                send "'<"&$bot~subspace&">[Figged:"&$target&"]<"&$bot~subspace&">* "
            end
        end
        add $j 1
    end
    gosub :scan_and_kill_if_possible
    if ($killing_error = true)
        if ($nosaveme <> true)
            gosub :callsaveme
        end
    end


    setVar $docking_instructions ""
    if ($are_we_docking)
        setVar $docking_instructions " p z t *"
        if ($PLAYER~destination = $MAP~stardock)
            setVar $docking_instructions " p z s g y g q h *"
        end
        send $docking_instructions
    else
        if ($twarp_back = TRUE)
           send "  mz " $start_sector "*y  y    *    "
        end
    end
    gosub :PLAYER~quikstats
    if ($PLAYER~CURRENT_SECTOR <> $PLAYER~destination)
        setvar $switchboard~message "Hunt did not reach destination!*"
    else
        setvar $switchboard~message "Hunt completed.*"
    end
    gosub :switchboard~switchboard
halt

:scan_and_kill_if_possible
    setvar $before_holo_kill_sector $player~current_sector
    setvar $killing_error false

    ################################################################
    # Only photon if you have photons left when finding target     #
    # TODO: add kill option after photoning if you have zero after #
    # shooting, but need to wait for photon wave to finish         #
    ################################################################
    setvar $combat~photon_only false
    setvar $combat~photon_and_kill false
    if ($player~photons > 0)
        #if ($player~photons > 1)
            setvar $combat~photon_only true
        #else
        #    setvar $combat~photon_and_kill true
        #end
    end
    #########################################################
    # call planet in immediately when seeing target to kill #
    #########################################################
    if ($nosaveme = true)
        setvar $combat~slingshot false
    else
        setvar $combat~slingshot true
    end
    gosub :combat~holokill
    if ($sector~holotargetfound = true)
        add $total_victims 1
        add $total_run_victims 1
    end
    gosub :player~quikstats
    if (($sector~holotargetfound = true) and ($player~current_sector <> $before_holo_kill_sector))
        setVar $PLAYER~WARPTO $hunting_start
        gosub :PLAYER~twarp
        if (($PLAYER~twarpSuccess = FALSE) and ($player~msg <> "Already in that sector!"))
			send "*"
            gosub :player~quikstats
			setVar $figowner SECTOR.FIGS.OWNER[$player~current_sector]
			setVar $figCount SECTOR.FIGS.QUANTITY[$player~current_sector]

			if (($figcount > 0) and (($figOwner <> "belong to your Corp") AND ($figOwner <> "yours")))
				gosub :xenter~run
			end		

            setvar $switchboard~message "Could not make it back to starting sector after holokill. - ["&$player~msg&"]*"
            setvar $killing_error true
            if ($nosaveme <> true)
                gosub :callsaveme
            end
        else
            send " l " $PLANET~PLANET " * n n * j m * * * j c  *  "
        end
    end
    if ($switchboard~message <> "No targets found adjacent.*")
        gosub :switchboard~switchboard
    end
    send "sd"
    gosub :PLAYER~quikstats
return



:callsaveme
	gosub :call
    gosub :PLAYER~quikstats
    if ($PLAYER~CURRENT_PROMPT = "Command")
        setvar $switchboard~message "No one saved me!   Will try to kill one more time, but I could use some backup!*"
        gosub :switchboard~switchboard
        setVar $bot~startingLocation "Command"
        goSub :SECTOR~getSectorData
        goSub :combat~fastAttack
        gosub :call
        halt
    elseif (($PLAYER~CURRENT_PROMPT = "Planet") or ($player~current_prompt = "Citadel"))
        if ($player~current_prompt = "Planet")
            send "m * * * c "
        end
        setVar $bot~startingLocation "Citadel"

        setvar $switchboard~message "Switching to citkill mode after saveme.  Should kill any enemies in sector or entering sector until stopped.*"
        gosub :switchboard~switchboard

        :startTargeting
            killalltriggers
            setTextLineTrigger 	limp2 	:scan 	"Limpet mine in "&$player~CURRENT_SECTOR
            setTextLineTrigger 	warps 	:scan 	"warps into the sector."
            setTextLineTrigger 	lifts 	:scan 	"lifts off from"
            setTextLineTrigger 	deffig 	:scan 	"Deployed Fighters Report Sector "&$player~CURRENT_SECTOR
            setTextLineTrigger 	secgun 	:scan 	"Quasar Cannon on"
            setTextLineTrigger 	ig		:scan 	"Shipboard Computers The Interdictor Generator on"
            setTextLineTrigger 	power 	:scan 	"is powering up weapons systems!"
            settextlinetrigger  wave    :scan    " launches a wave of fighters at  "
            settextlinetrigger  planet  :scan	" launches a Genesis Torpedo into the sector!"
            settextlinetrigger  atomic  :scan    " appears from the planetary rubble."
            setTextLineTrigger 	exits 	:scan 	"exits the game."
            setTextLineTrigger 	enters 	:scan 	"enters the game."
            setDelayTrigger		delay	:scan	30000

        :scan
            killAllTriggers
            goSub :checkForVictims
            goto :startTargeting

    end
return

:checkForVictims
	gosub :player~quikstats
	send " s*  "
	:scanit_again
	setvar $player~startingLocation $player~current_prompt
	gosub :sector~getSectorData
	if ($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips))
		if ($capture)
			gosub :combat~fastCapture
		else
			goSub :combat~fastCitadelAttack
		end
		goto :scanit_again
	elseif (($sector~emptyShipCount > $sector~myShipCount))
		gosub :combat~fastCapture
		goto :scanit_again
	end
return	

:call
:callagain
	setVar $BOT~command "call"
	setvar $bot~parm1 ""
	setVar $BOT~user_command_line " call  "
	setvar $bot~parm2 ""
	setvar $bot~parm3 ""
	setvar $bot~parm4 ""
	setvar $bot~parm5 ""
	setvar $bot~parm6 ""
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	savevar $bot~parm1
	savevar $bot~parm2
	savevar $bot~parm3
	savevar $bot~parm4
	savevar $bot~parm5
	savevar $bot~parm6
	load "scripts\"&$bot~mombot_directory&"\commands\defense\call.cts"
	setEventTrigger        callend1        :callend1 "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\defense\call.cts"
	pause
	:callend1


# includes:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\checkstartingprompt\bot"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\player\getcourse\player"
include "source\bot_includes\player\addfigtodata\player"
include "source\bot_includes\combat\fastcitadelattack\combat"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\sector\getautosectordata\sector"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\combat\holokill\combat"

