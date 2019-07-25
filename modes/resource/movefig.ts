	logging off
	gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&"movefig [p/s] {fighter amount} {all}"
	setVar $BOT~help[2]  $BOT~tab&"  - Move fighters onto or off of a planet"
	setVar $BOT~help[3]  $BOT~tab&"    "
	setVar $BOT~help[4]  $BOT~tab&"    Options: "
	setVar $BOT~help[5]  $BOT~tab&"     [p/s]  P indicates to planet from sector"
	setVar $BOT~help[6]  $BOT~tab&"            S indicates to sector from planet"
	setVar $BOT~help[7]  $BOT~tab&"            "
	setVar $BOT~help[8]  $BOT~tab&"  {amount}  Number of fighters to move. Default" 
	setVar $BOT~help[9]  $BOT~tab&"            is all available fighters."
	setVar $BOT~help[10] $BOT~tab&"                     "
	setVar $BOT~help[11] $BOT~tab&"     {all}  Will move fighters off of all your"
	setVar $BOT~help[12] $BOT~tab&"            planets in sector. >figmove s only"
	gosub :bot~helpfile

	setVar $BOT~script_title "Movefig"
	gosub :BOT~banner


# ======================     START FIGMOVE  (FIGMOVE) SUBROUTINE    ==========================
:figmove
:movefig
	gosub :player~quikstats
	setVar $startingLocation $player~current_prompt
	setvar $total_moved 0
	getWord $bot~user_command_line $bot~parm1 1
	getWord $bot~user_command_line $bot~parm2 2



	if (($bot~parm2 = "p") OR ($bot~parm2 = "s"))
		setVar $moveToSector $bot~parm2
		isNumber $test $bot~parm1
		if (($test) OR ($bot~parm1 = "all"))
			if ($test)
				setVar $move $bot~parm1
			end
		else
			setvar $move 0
		end
	elseif (($bot~parm1 = "p") OR ($bot~parm1 = "s"))
		setVar $moveToSector $bot~parm1
		isNumber $test $bot~parm2
		if (($test) or ($bot~parm2 = "all"))
			if ($test)
				setVar $move $bot~parm2
			end
		else
			setvar $move 0
		end
	else
		setVar $SWITCHBOARD~message "Please use movefig [p/s] [fighter amount]*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	getWordPos $bot~user_command_line $pos " all"
	setVar $allPlanets FALSE
	if (($pos > 0) AND ($moveToSector = "s"))
		setVar $allPlanets TRUE
	end
	if ($startingLocation = "Citadel")
		send "q"
	elseif ($startingLocation <> "Planet")
		setVar $SWITCHBOARD~message "You must start this script from a planet!* "
		gosub :SWITCHBOARD~switchboard
		halt
	end
	send "mnl*"
	gosub :player~quikstats
	gosub :planet~getplanetinfo
	setVar $sector_figs 0
	send "q  q  z  n  **   "
	waiton "Warps to Sector(s) :"
	waiton "Command [TL"
	gosub :player~quikstats
	
	if ($allPlanets = true)
		gosub :countPlanets
	else
		setVar $planet~planetCount 1
		setVar $planet~planets[1] $planet~planet
	end
	setVar $figOwner SECTOR.FIGS.OWNER[$player~current_sector]
	setVar $figQuant SECTOR.FIGS.QUANTITY[$player~current_sector]

	setVar $sector_figs $figQuant
	setVar $starting_planet $planet~planet

	if ($figQuant <> 0) AND (($figOwner <> "belong to your Corp") AND ($figOwner <> "yours"))
		send "l " & $planet~planet & "*"
		waitOn "Planet command (?=help) [D]"
		if ($startingLocation = "Citadel")
			send "c"
			waiton "Citadel command"
		end
		setVar $SWITCHBOARD~message "Friendly Fighters Not Present!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	setvar $planet~planet_figs_room $planet~planet_FIGHTERS_MAX
	subtract $planet~planet_figs_room $planet~planet_FIGHTERS

	gosub :ship~getShipStats

	setVar $i 1
	while ($i <= $planet~planetCount)
		if ($allPlanets = true)
			gosub :player~quikstats
			setVar $move 0
		end
		send "l " $planet~planets[$i] "*"
		waitOn "Planet command (?=help) [D]"
		gosub :planet~getplanetinfo

		:start
			killalltriggers
			if ($moveToSector = "s")
				if ($move = 0)
					setvar $move $planet~planet_fighters
					setvar $total_moved 0
				end
				setvar $end_figs $sector_figs
				add $end_figs $move
				if ($move > $planet~planet_FIGHTERS)
					setVar $SWITCHBOARD~message "Not Enough Figs on Planet*"
					gosub :SWITCHBOARD~switchboard
					if ($startingLocation = "Citadel")
			   			send "c "
					end
					halt
				end
				while ($total_moved < $move)
					if (($move-$total_moved) < $ship~ship_fighters_max)
						setvar $amount_to_grab ($move-$total_moved)
					else
			        	setvar $amount_to_grab $ship~SHIP_FIGHTERS_MAX
			        end
			        add $sector_figs $amount_to_grab
					if ($sector_figs > $end_figs)
						setvar $sector_figs $end_figs
					end
					send "m * * *  q  f z " $sector_figs "*  z c d  *  l " $planet~planets[$i] "*  "
					add $total_moved $amount_to_grab
		    	end
		    	send "q q * "
			end
			if ($moveToSector = "p")
				if ($move = 0)
					setvar $move $sector_figs
					subtract $move 500
				end
				setvar $end_figs $move
				if ($planet~planet_figs_room < $move)
					setvar $move $planet~planet_figs_room
				end
				send "m n l * "
				while ($move > $ship~SHIP_FIGHTERS_MAX)
					subtract $sector_figs $ship~SHIP_FIGHTERS_MAX
					send "q f z " $sector_figs "* z c d  *  l " $planet~planets[$i] "* m n l * "
					subtract $move $ship~SHIP_FIGHTERS_MAX
				end
				subtract $sector_figs $move
				if ($sector_Figs <> 0)
					send "q  f  z " $sector_figs "*  z  c  d  * l " $planet~planets[$i] "*  m  n  l  * "
				else
					send "q  f  z * l " $planet~planets[$i] "*  m  n  l * "
				end
				#send "q  f z " $sector_figs "* z c d * l " $planet~planets[$i] "* "
			end
			add $i 1
	end
		gosub :player~quikstats
		if ($player~current_prompt = "Planet")
			send "m*  *  **  q q * * "
		end
		gosub :player~topoff
		setVar $planet~planet $starting_planet
		gosub :planet~landingSub

		setVar $SWITCHBOARD~message "fighters moved*"
		gosub :SWITCHBOARD~switchboard
		halt
# ======================     END FIGMOVE  (FIGMOVE) SUBROUTINE    ==========================


:countPlanets

	setVar $planet~planetCount 0
	killalltriggers
	setTextLineTrigger planetGrabber :planetline "   <"
	setTextLineTrigger beDone :done "Land on which planet "
	send "lq*"
	pause
	:planetline
		killalltriggers
		getWordPos CURRENTLINE $pos "<<<< ("
		if ($pos <= 0)
			setVar $line CURRENTLINE
			replacetext $line "<" " "
			replacetext $line ">" " "
			striptext $line ","
			add $planet~planetCount 1
			getWord $line $planet~planets[$planet~planetCount] 1
		end
		setTextLineTrigger getLine2 :planetline "   <"
		setTextLineTrigger getEnd :done "Land on which planet "
		pause
	:done
return


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\player\topoff\player"
include "source\bot_includes\planet\landingsub\planet"
