loadVar $SWITCHBOARD~bot_name
loadVar $surround_before_hkill


:holo_kill
:hkill
    setVar $CIT FALSE
    if ($surround_before_hkill = TRUE)
            setVar $insurround_before_hkill TRUE
    end
    killalltriggers
    gosub  :player~currentPrompt
    setVar $PROMPT~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $PROMPT~validPrompts "Citadel Command"
    gosub :PROMPT~checkStartingPrompt
        gosub :SHIP~getShipStats

:holo_kill_kill_check
        setTextLineTrigger noscan1 :holo_kill_noscanner "Handle which mine type, 1 Armid or 2 Limpet"
        setTextLineTrigger noscan2 :holo_kill_noscanner "You don't have a long range scanner."
        setTextLineTrigger scanned :holo_kill_scandone  "Select (H)olo Scan or (D)ensity Scan or (Q)uit? [D] H"
        if ($PLAYER~CURRENT_PROMPT = "Citadel")
               send " qqqz* sh*  l " & $PLANET~PLANET & " * j c * "
               setVar $CIT TRUE
        else
               send " sh*"
        end
        pause
:holo_kill_noscanner
        killalltriggers
        setVar $SWITCHBOARD~message "You don't have a HoloScanner!*"
        gosub :SWITCHBOARD~switchboard
    	send " *  "
        halt
:holo_kill_scandone
        killalltriggers

:holo_kill_get_prompt
:holo_kill_get_current_sector
        setVar $hkill_start_sector $PLAYER~CURRENT_SECTOR
        setVar $killsector 0
        setVar $idx 1
        while ($idx <= SECTOR.WARPCOUNT[$PLAYER~CURRENT_SECTOR])
            
            setVar $test_sector SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$idx]
        	setVar $safePlanets TRUE
        	setVar $containsShieldedPlanet FALSE
        	if (SECTOR.PLANETCOUNT[$test_sector] > 0)
            	setVar $p 1
            	while ($p <= SECTOR.PLANETCOUNT[$test_sector])
            	    getWord SECTOR.PLANETS[$test_sector][$p] $test 1
            	    if ($test = "<<<<")
            	        setVar $containsShieldedPlanet TRUE
            	    end
            	    add $p 1
            	end
            	if ($PLAYER~surroundAvoidAllPlanets)
            	    setVar $safePlanets FALSE
            	elseif (($containsShieldedPlanet) AND ($PLAYER~surroundAvoidShieldedOnly))
            	    setVar $safePlanets FALSE
            	end
        	end
        	if (($test_sector <> $MAP~stardock) AND ($test_sector > 10) AND (SECTOR.TRADERCOUNT[$test_sector] > 0) AND ($safePlanets = TRUE))
            	setVar $killsector $test_sector
            	goto :holo_kill_killem
            end
            add $idx 1
        end
:holo_kill_killem
        IF ($killsector > 10) AND ($killsector <> $MAP~stardock)
            send "'{" $SWITCHBOARD~bot_name "} - HoloKill - Attacking sector " & $test_sector & ".*"
            setVar $no_str ""
            setVar $no_cnt SECTOR.SHIPCOUNT[$killsector]
            setVar $no_idx 1
            WHILE ($no_idx <= $no_cnt)
                setVar $no_str $no_str & "n"
                add $no_idx 1
            END
            send " c v 0 * y n " & $test_sector & " * q "
            IF ($PLAYER~startingLocation = "Citadel")
                send " qmnt*qqz* "
            END
            send " m z " & $test_sector & " *  *  z  a  99999  *  z  a  99999  *  R  *  f  z  1  *  z  c  d  *   "
            setVar $kill_idx 1
            if ($surround_before_hkill = TRUE)
                gosub :surround
                setVar $insurround_before_hkill FALSE
            end
        
            gosub  :player~currentPrompt
            setVar $PROMPT~validPrompts "Command"
            gosub :PROMPT~checkStartingPrompt
            goSub :SECTOR~getSectorData
            goSub :PLAYER~fastAttack
        
            send "m " & $hkill_start_sector & " *  *  z  a  99999  *  z  a  99999  *  R  *  f  z  1  *  z  c  d  *   "
            IF ($CIT = TRUE)
                send " l " & $PLANET~PLANET & " * n n * j m * * * j c  *  "
            END
            gosub :PLAYER~quikstats
            IF ($PLAYER~CURRENT_SECTOR <> $hkill_start_sector)
                   send "'" & $SWITCHBOARD~bot_name " call*"
            else
                setVar $SWITCHBOARD~message "Attack made and back in original sector!*"
                gosub :SWITCHBOARD~switchboard

            END

        ELSE
                IF ($PLAYER~startingLocation = "Citadel")
                       send " s* "
                       waitFor "<Scan Sector>"
                       waitFor "Citadel command (?=help)"
                ELSE
                       send " dz * "
                       waitFor "<Re-Display>"
                       waitFor "Command [TL="
                END
                setVar $SWITCHBOARD~message "No Enemies found adjacent!*"
                gosub :SWITCHBOARD~switchboard
                send " *  "
        
        END
        halt

#INCLUDES:
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
include "source\module_includes\prompt"
