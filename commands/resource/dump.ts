	gosub :BOT~loadVars

	setVar $BOT~help[1]   $BOT~tab&"- dump [type] - Jettisons colos off of planet" 
	setVar $BOT~help[2]   $BOT~tab&"     [type] = use [f]uel, [o]rg, [e]quip, or [a]ll " 
	gosub :BOT~help_file


# ======================     START COLO DUMP (DUMP) SUBROUTINE    ==========================
:colo_dump
	gosub :player~quikstats
	setVar $startingLocation $player~CURRENT_PROMPT
	if (($startingLocation <> "Planet") and ($startingLocation <> "Citadel"))
        	setvar $switchboard~message "Colo Dump must be run from Citadel or Planet prompt.*"
			gosub :switchboard~switchboard

		halt
	end

	:getcolosfrom
		setvar $cologroup $bot~parm1
		setVar $colosDumped 0
		setVar $coloCounting FALSE
		setVar $numberColosToDump 0
		if ($cologroup = "f")
			setvar $cologroup 1
			setvar $colodisplay "Fuel"
		elseif ($cologroup ="o")
			setvar $cologroup 2
			setvar $colodisplay "Organics"
		elseif ($cologroup ="e")
			setvar $cologroup 3
			setvar $colodisplay "Equipment"
		elseif ($cologroup = "a")
			setVar $cologroup 1
			setvar $colodisplay "All"
		else
			isNumber $test $bot~parm1
			if ($test)
				if ($bot~parm1 > 0)
					setVar $numberColosToDump $bot~parm1
					setVar $colodisplay $numberColosToDump
					setVar $cologroup 1
					setVar $coloCounting TRUE
				else
					setvar $switchboard~message "Please use [F]uel, [O]rganics, [E]quipment, [A]ll, or a Number.*"
					gosub :switchboard~switchboard

					halt
				end
			else
				setvar $switchboard~message "Please use [F]uel, [O]rganics, [E]quipment, [A]ll, or a Number.*"
				gosub :switchboard~switchboard

				halt
			end

		end
		if ($startingLocation = "Citadel")
			send "q"
		end
		gosub :planet~getPlanetInfo
		setvar $switchboard~message "Dumping "&$colodisplay&" Colonists from Planet: "&$planet~planet&".*"
		gosub :switchboard~switchboard
		killTrigger 1
		send "q j y "

	:sub_Land
		send "l j"&#8&$planet~planet&"* s n t "&$cologroup&"* "
		settexttrigger next_group :next_group "There aren't that many on the planet!"
		settexttrigger keep_dumping :keep_dumping "The Colonists file aboard your ship, eager to head out."
		if (($coloCounting) AND ($colosDumped >= $numberColosToDump))
			goto :doneDumping
		end
		pause

	:next_group
		killtrigger keep_dumping
		if ($bot~parm1 = "a") and ($cologroup < 3)
			add $cologroup 1
			goto :sub_land
		else
			:doneDumping
				killtrigger next_group
				killtrigger keep_dumping
				setvar $switchboard~message "Finished Dumping "&$colodisplay&" Colonists from Planet: "&$planet~planet&".*"
				gosub :switchboard~switchboard
				send "s n l 1* s n l 2* s n l 3* "
				if ($startingLocation = "Citadel")
					send "c"
				end
				halt
		end


	:keep_dumping
		killtrigger next_group
		send "q j y "
		if ($coloCounting)
			add $colosDumped $player~TOTAL_HOLDS
		end
		goto :sub_land
# ======================     END COLO DUMP (DUMP) SUBROUTINE    ==========================

# includes:
include "source\module_includes\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet\getplanetinfo\planet"
