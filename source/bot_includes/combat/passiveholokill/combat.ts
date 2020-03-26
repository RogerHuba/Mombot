:passiveholocap
	setvar $holocapture true
:passiveholokill
	if ($SHIP~SHIP_MAX_ATTACK <= 0)
		gosub :ship~getshipstats
	end

	
	setvar $too_many_fighters (($ship~SHIP_OFFENSIVE_ODDS * $SHIP~SHIP_MAX_ATTACK))
	divide $too_many_fighters 12

		setVar $hkill_start_sector $player~current_sector
		setVar $killsector 0
			setVar $test_sector $sector~targetSector
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
			setVar $figowner SECTOR.FIGS.OWNER[$test_sector]
			if (($test_sector <> $MAP~stardock) AND ($test_sector > 10) AND (SECTOR.TRADERCOUNT[$test_sector] > 0) AND ($containsEnemyTrader = TRUE) AND ($safePlanets = TRUE) and ((SECTOR.FIGS.QUANTITY[$test_sector] < ($too_many_fighters*2)) OR (($figOwner = "belong to your Corp") OR ($figOwner = "yours"))))
				setVar $killsector $test_sector
				goto :holo_kill_killem
			end

			setvar $title "Holokill"
			if ($noavoid <> true)
				send "'{" $SWITCHBOARD~bot_name "} - " $title " - Attacking sector "  $test_sector " -> (" $sector~enemy_name ").*   c v 0 * y n "  $test_sector  " *  q  "
			end
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
			if ($holocapture)
				gosub :fastCapture
			else
				goSub :fastAttack
			end		
			send "m "  $hkill_start_sector  " *  *  z  a  99999  *  z  a  99999  *  R  *   "
			gosub :player~quikstats
			if ($player~current_sector <> $hkill_start_sector)
				gosub :callsaveme
				gosub :player~quikstats
				setVar $SWITCHBOARD~message "After save me, resetting.*"
			else
				setVar $SWITCHBOARD~message "Attack made and back in original sector!*"
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
	load "scripts\mombot\commands\defense\call.cts"
	setEventTrigger        callend1        :callend1 "SCRIPT STOPPED" "scripts\mombot\commands\defense\call.cts"
	pause
	:callend1
return

include "source\bot_includes\player\currentprompt\player"
include "source\bot_includes\grid\surround\grid"
include "source\bot_includes\ship\getshipstats\ship"