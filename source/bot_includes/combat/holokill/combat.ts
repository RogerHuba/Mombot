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
	setTextLineTrigger scanned :holo_kill_scandone  "Warps to Sector(s) : "
	if ($player~current_prompt = "Citadel")
		send " q q * sh"
		setVar $player~CIT TRUE
	else
		send " sh"
	end
	pause
:holo_kill_noscanner
		killalltriggers
		setVar $SWITCHBOARD~message "You don't have a HoloScanner!*"
		if ($player~CIT)
			send "*  l " & $PLANET~PLANET & "* j c * "
		else
			send "* "
		end
		return
:holo_kill_scandone
	if ($player~CIT)
		send "*  l " & $PLANET~PLANET & "* j c * "
	else
		send "* "
	end

		gosub :sector~getAutoSectorData

:holo_kill_get_prompt
:holo_kill_get_current_sector
		setVar $hkill_start_sector $sector~starting_sector
		setvar $player~current_sector $starting_sector
		setVar $killsector 0

		setVar $test_sector $sector~targetSector
		setVar $safePlanets TRUE
		setVar $containsShieldedPlanet FALSE
		setvar $containsEnemyTrader FALSE
		if ($sector~holotargetfound)
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
			setVar $figowner SECTOR.FIGS.OWNER[$test_sector]
			if (($test_sector <> $MAP~stardock) AND ($test_sector > 10) AND ($safePlanets = TRUE) and ((SECTOR.FIGS.QUANTITY[$test_sector] < ($too_many_fighters*2)) OR (($figOwner = "belong to your Corp") OR ($figOwner = "yours"))))
				setVar $killsector $test_sector
			else
				setVar $SWITCHBOARD~message "Cannot holokill - check for planets or too many figs?*"
				return
			end
		else
			setVar $SWITCHBOARD~message "No targets found adjacent.*"
			return
		end
:holo_kill_killem
		add $holokill_count 1
		if ($slingshot)
			setvar $title "Slingshot Holokill"
		else
			setvar $title "Holokill"
		end
		if ($noavoid <> true)
			 send "c v 0 * y n "  $test_sector  " *  q  "
		end
		if ($slingshot)
			if ($player~cit = true)
				if ($switch)
					send " e y q m * * * q  m z "  $test_sector  " *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  j R  *  " $test_sector "=saveme* f  z  1  *  z  c  d  *   "
				else
					send " q m * * * q  m z "  $test_sector  " *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  j R  *  " $test_sector "=saveme* f  z  1  *  z  c  d  *   "
				end
			else
				send " m z "  $test_sector  " *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  j R  *  " $test_sector "=saveme* f  z  1  *  z  c  d  *   "
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
				setVar $SWITCHBOARD~message "After save me, resetting.*"
			else
				setVar $SWITCHBOARD~message  $title&" - Attacking sector "&$test_sector&".*"
				setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Attack made and back in original sector!*"
			end
		else
			if ($player~cit = true)
				if ($switch)
					send " e y q m * * * q  m z "  $test_sector  " *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  R  *  "
				else
					send " q m * * * q  m z "  $test_sector  " *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  R  *  "
				end
			else
				send " m z "  $test_sector  " *  *  z  a  " $SHIP~SHIP_MAX_ATTACK "*  z  a  " $SHIP~SHIP_MAX_ATTACK "*  R  *  "
			end
			if ($player~surround_before_hkill = TRUE)
				gosub :player~quikstats
				gosub :grid~surround
				setVar $insurround_before_hkill FALSE
				gosub :player~quikstats
			end
		
			if ($holocapture)
				gosub :combat~fastCapture
			else
				goSub :fastAttack
			end		
			if ($player~CIT = TRUE)
				if ($switch)
					send "  f  z  1  *  z  c  d  *   m "  $hkill_start_sector  " *  *  z  a  99999  *  z  a  99999  *  R  *    l "  $PLANET~PLANET  " * n n * j m * * * j c  *   e y "					
				else
					send "  f  z  1  *  z  c  d  *   m "  $hkill_start_sector  " *  *  z  a  99999  *  z  a  99999  *  R  *    l "  $PLANET~PLANET  " * n n * j m * * * j c  *  "
				end
			else
				send "  f  z  1  *  z  c  d  *   m "  $hkill_start_sector  " *  *  z  a  99999  *  z  a  99999  *  R  *   "
			end
			gosub :player~quikstats
			if ($player~current_sector <> $hkill_start_sector)
				gosub :callsaveme
				gosub :player~quikstats
				setVar $SWITCHBOARD~message "After save me, resetting.*"
			else
				setvar $switchboard~message "Holokill attacked "&$sector~enemy_name&" in sector "&$test_sector&".*"
				setVar $SWITCHBOARD~message $switchboard~message&"Attack made and back in original sector!*"
			end

		end
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
	load "scripts\"&$bot~mombot_directory&"\commands\defense\call.cts"
	setEventTrigger        callend1        :callend1 "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\defense\call.cts"
	pause
	:callend1
return

include "source\bot_includes\player\currentprompt\player"
include "source\bot_includes\sector\getautosectordata\sector"
include "source\bot_includes\grid\surround\grid"
include "source\bot_includes\ship\getshipstats\ship"