:holokill
:holo_kill
:holo_kill_kill_check
	if ($SHIP~SHIP_MAX_ATTACK <= 0)
		gosub :ship~getshipstats
	end

		setTextLineTrigger noscan1 :holo_kill_noscanner "Handle which mine type, 1 Armid or 2 Limpet"
		setTextLineTrigger noscan2 :holo_kill_noscanner "You don't have a long range scanner."
		setTextLineTrigger scanned :holo_kill_scandone  "Select (H)olo Scan or (D)ensity Scan or (Q)uit? [D] H"
		if ($player~current_prompt = "Citadel")
			   send " qqqz* sh*  l " & $PLANET~PLANET & " * j c * "
			   setVar $player~CIT TRUE
		else
			   send " sh*"
		end
		pause
:holo_kill_noscanner
		killalltriggers
		setVar $SWITCHBOARD~message "You don't have a HoloScanner!*"
		send " *  "
		return
:holo_kill_scandone
		killalltriggers
		gosub :SHIP~getShipStats

:holo_kill_get_prompt
:holo_kill_get_current_sector
		setVar $hkill_start_sector $player~current_sector
		setVar $killsector 0
		setVar $idx 1
		while ($idx <= SECTOR.WARPCOUNT[$player~current_sector])
				setVar $test_sector SECTOR.WARPS[$player~current_sector][$idx]
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
			if ($player~surroundAvoidAllPlanets)
				setVar $safePlanets FALSE
			elseif (($containsShieldedPlanet) AND ($player~surroundAvoidShieldedOnly))
				setVar $safePlanets FALSE
			end
		end
		if (($test_sector <> $MAP~stardock) AND ($test_sector > 10) AND (SECTOR.TRADERCOUNT[$test_sector] > 0) AND ($safePlanets = TRUE))
					   setVar $killsector $test_sector
					   goto :holo_kill_killem
				end
				add $idx 1
		end
		goto :holo_kill_no_targets

:holo_kill_killem
		send "'{" $SWITCHBOARD~bot_name "} - HoloKill - Attacking sector " & $test_sector & ".*"
		setVar $no_str ""
		setVar $no_cnt SECTOR.SHIPCOUNT[$killsector]
		setVar $no_idx 1
		while ($no_idx <= $no_cnt)
			setVar $no_str $no_str & "n"
			add $no_idx 1
		end
		send " c v 0 * y n " & $test_sector & " * q "
		if ($player~cit = true)
			send " qmnt*qqz* "
		end
		send " m z " & $test_sector & " *  *  z  a  "&$SHIP~SHIP_MAX_ATTACK&"*  z  a  "&$SHIP~SHIP_MAX_ATTACK&"*  R  *  f  z  1  *  z  c  d  *   "
		setVar $kill_idx 1
		if ($player~surround_before_hkill = TRUE)
			gosub :player~quikstats
			gosub :surround
			setVar $insurround_before_hkill FALSE
			gosub :player~quikstats
		end
	
		gosub  :player~currentPrompt
		if ($player~current_prompt <> "Command")
			setVar $SWITCHBOARD~message "Wrong prompt for holokill kill.*"
			return
		end
		goSub :SECTOR~getSectorData
		goSub :fastAttack
	
		send "m " & $hkill_start_sector & " *  *  z  a  99999  *  z  a  99999  *  R  *  f  z  1  *  z  c  d  *   "
		if ($player~CIT = TRUE)
			send " l " & $PLANET~PLANET & " * n n * j m * * * j c  *  "
		end
		gosub :player~quikstats
		if ($player~current_sector <> $hkill_start_sector)
			   send "'" & $SWITCHBOARD~bot_name " call*"
		else
			setVar $SWITCHBOARD~message "Attack made and back in original sector!*"
		end
		return
:holo_kill_no_targets
		setVar $SWITCHBOARD~self_command TRUE
		setVar $SWITCHBOARD~message "No Enemies found adjacent!*"
return

include "source\bot_includes\player\currentprompt\player"
