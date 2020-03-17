:holocap
	setvar $holocapture true
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
		if ($slingshot)
			setvar $title "Slingshot Holokill"
		else
			setvar $title "Holokill"
		end
		send "'{" $SWITCHBOARD~bot_name "} - " $title " - Attacking sector "  $test_sector  ".*   c v 0 * y n "  $test_sector  " *  q  "
		if ($player~cit = true)
			send " qmnt*qqz* "
		end
		if ($slingshot)
			send " m z "  $test_sector  " *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  j R  *  " $test_sector "=saveme* f  z  1  *  z  c  d  *   "
			setVar $i 0
			while ($i < 15)
				add $i 1
				send " l " $PLANET~PLANET " * n n *  "
			end
			gosub :player~quikstats
			if (($player~current_prompt <> $test_sector))
				send "'Possible splatter on a planet, check for pod.*"
				return
			end
			send "m * * * c "
			goSub :SECTOR~getSectorData
			if ($holocapture)
				gosub :combat~fastCapture
				send " l " $PLANET~PLANET " * n n * j m * * * j c  *  "
				gosub :player~quikstats
			else
				goSub :fastCitadelAttack
			end
			send "p " $hkill_start_sector "* y "
			gosub :player~quikstats
			if ($player~current_sector <> $hkill_start_sector)
				if ($holocapture)
					send "'" & $SWITCHBOARD~bot_name " call cap*"
				else
					send "'" & $SWITCHBOARD~bot_name " call kill*"
				end
			else
				setVar $SWITCHBOARD~message "Attack made and back in original sector!*"
			end
		else
			send " m z "  $test_sector  " *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  R  *  f  z  1  *  z  c  d  *   "

			if ($player~surround_before_hkill = TRUE)
				gosub :player~quikstats
				gosub :grid~surround
				setVar $insurround_before_hkill FALSE
				gosub :player~quikstats
			end
		
			gosub  :player~quikstats
			if ($player~current_prompt <> "Command")
				setVar $SWITCHBOARD~message "Wrong prompt for holokill kill.*"
				return
			end
			setvar $PLAYER~startingLocation "Command"
			goSub :SECTOR~getSectorData
			if ($holocapture)
				gosub :combat~fastCapture
			else
				goSub :fastAttack
			end		
			send "m "  $hkill_start_sector  " *  *  z  a  99999  *  z  a  99999  *  R  *   "
			if ($player~CIT = TRUE)
				send " l "  $PLANET~PLANET  " * n n * j m * * * j c  *  "
			end
			gosub :player~quikstats
			if ($player~current_sector <> $hkill_start_sector)
				   send "'" & $SWITCHBOARD~bot_name " call*"
			else
				setVar $SWITCHBOARD~message "Attack made and back in original sector!*"
			end

		end
	return
:holo_kill_no_targets
		setVar $SWITCHBOARD~self_command TRUE
		setVar $SWITCHBOARD~message "No Enemies found adjacent!*"
return



include "source\bot_includes\player\currentprompt\player"
include "source\bot_includes\grid\surround\grid"
include "source\bot_includes\ship\getshipstats\ship"