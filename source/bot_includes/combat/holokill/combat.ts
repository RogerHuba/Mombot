:holocap
	setvar $holocapture true
:holokill
:holo_kill
:holo_kill_kill_check
	if ($SHIP~SHIP_MAX_ATTACK <= 0)
		gosub :ship~getshipstats
	end

	
	setvar $too_many_fighters (($ship~SHIP_OFFENSIVE_ODDS * $SHIP~SHIP_MAX_ATTACK))
	divide $too_many_fighters 12

	setTextLineTrigger noscan1 :holo_kill_noscanner "Handle which mine type, 1 Armid or 2 Limpet"
	setTextLineTrigger noscan2 :holo_kill_noscanner "You don't have a long range scanner."
	setTextLineTrigger scanned :holo_kill_scandone  "Select (H)olo Scan or (D)ensity Scan or (Q)uit? [D] H"
	if ($player~current_prompt = "Citadel")
		send " q q * sh*  l " & $PLANET~PLANET & "* j c * "
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
		waiton "[" & $player~current_sector & "]"

:holo_kill_get_prompt
:holo_kill_get_current_sector
		setVar $hkill_start_sector $player~current_sector
		setVar $killsector 0
		setVar $idx 1
		while ($idx <= SECTOR.WARPCOUNT[$player~current_sector])
			setVar $test_sector SECTOR.WARPS[$player~current_sector][$idx]
			setVar $safePlanets TRUE
			setVar $containsShieldedPlanet FALSE
			setvar $containsEnemyTrader FALSE
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
			if (SECTOR.TRADERCOUNT[$test_sector] > 0)
				setvar $t 1
				while ($t <= SECTOR.TRADERCOUNT[$test_sector])
					getwordpos SECTOR.TRADERS[$test_sector][$t] $pos "["&$player~corp&"]"
					if ($pos <= 0)
						setVar $containsEnemyTrader TRUE
					end
					add $t 1
				end
			end
			setVar $figowner SECTOR.FIGS.OWNER[$test_sector]
			if (($test_sector <> $MAP~stardock) AND ($test_sector > 10) AND (SECTOR.TRADERCOUNT[$test_sector] > 0) AND ($containsEnemyTrader = TRUE) AND ($safePlanets = TRUE) and ((SECTOR.FIGS.QUANTITY[$test_sector] < ($too_many_fighters*2)) OR (($figOwner = "belong to your Corp") OR ($figOwner = "yours"))))
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
		if ($noavoid <> true)
			send "'{" $SWITCHBOARD~bot_name "} - " $title " - Attacking sector "  $test_sector  ".*   c v 0 * y n "  $test_sector  " *  q  "
		end
		if ($slingshot)
			if ($player~cit = true)
				if ($switch)
					send " e y q m * * * q  m z "  $test_sector  " *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  j R  *  " $test_sector "=saveme* f  z  1  *  z  c  d  *   "
				else
					send " q m * * * q  m z "  $test_sector  " *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  j R  *  " $test_sector "=saveme* f  z  1  *  z  c  d  *   "
				end
			end
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
				gosub :callsaveme
			else
				setVar $SWITCHBOARD~message "Attack made and back in original sector!*"
			end
		else
			if ($switch)
				send " e y q m * * * q  m z "  $test_sector  " *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  R  *  f  z  1  *  z  c  d  *   "
			else
				send " q m * * * q  m z "  $test_sector  " *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  R  *  f  z  1  *  z  c  d  *   "
			end

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
				if ($switch)
					send " e y "
				end
			end
			gosub :player~quikstats
			if ($player~current_sector <> $hkill_start_sector)
				   gosub :callsaveme
			else
				setVar $SWITCHBOARD~message "Attack made and back in original sector!*"
			end

		end
	return
:holo_kill_no_targets
		setVar $SWITCHBOARD~self_command TRUE
		setVar $SWITCHBOARD~message "No Enemies found adjacent!*"
return


:callsaveme
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
	load "scripts\mombot\commands\defense\call.cts"
	setEventTrigger        callend1        :callend1 "SCRIPT STOPPED" "scripts\mombot\commands\defense\call.cts"
	pause
	:callend1
return

include "source\bot_includes\player\currentprompt\player"
include "source\bot_includes\grid\surround\grid"
include "source\bot_includes\ship\getshipstats\ship"