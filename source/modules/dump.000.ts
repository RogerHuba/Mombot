loadVar $bot_name
loadVar $user_command_line
loadVar $parm1
loadVar $parm2
loadVar $parm3
loadVar $parm4
loadVar $parm5
loadVar $parm6
loadVar $parm7
loadVar $parm8

if ($parm1 = "help")
	send "'*{" $bot_name "} - dump [type] - Jettisons colos off of planet*"
	send "  - [type] = use [f]uel, [o]rg, [e]quip, or [a]ll**"
	halt
end	

# ======================     START COLO DUMP (DUMP) SUBROUTINE    ==========================
:colo_dump
	gosub :quikstats~quikstats
	setVar $startingLocation $quikstats~CURRENT_PROMPT
	if (($startingLocation <> "Planet") and ($startingLocation <> "Citadel"))
        	send "'{" $bot_name "} - Colo Dump must be run from Citadel or Planet prompt.*"
		halt
	end

	:getcolosfrom
		setvar $cologroup $parm1
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
			isNumber $test $parm1
			if ($test)
				if ($parm1 > 0)
					setVar $numberColosToDump $parm1
					setVar $colodisplay $numberColosToDump
					setVar $cologroup 1
					setVar $coloCounting TRUE
				else
					send "'{" $bot_name "} - Please use [F]uel, [O]rganics, [E]quipment, [A]ll, or a Number.*"
					halt
				end
			else
				send "'{" $bot_name "} - Please use [F]uel, [O]rganics, [E]quipment, [A]ll, or a Number.*"
				halt
			end

		end
		if ($startingLocation = "Citadel")
			send "q"
		end
		gosub :planetinfo~getPlanetInfo
		send "'{" $bot_name "} - Dumping "&$colodisplay&" Colonists from Planet: "&$planetinfo~PLANET&".*"
		killTrigger 1
		send "q j y "

	:sub_Land
		send "l j"&#8&$planetinfo~PLANET&"* s n t "&$cologroup&"* "
		settexttrigger next_group :next_group "There aren't that many on the planet!"
		settexttrigger keep_dumping :keep_dumping "The Colonists file aboard your ship, eager to head out."
		if (($coloCounting) AND ($colosDumped >= $numberColosToDump))
			goto :doneDumping
		end
		pause

	:next_group
		killtrigger keep_dumping
		if ($parm1 = "a") and ($cologroup < 3)
			add $cologroup 1
			goto :sub_land
		else
			:doneDumping
				killtrigger next_group
				killtrigger keep_dumping
				send "'{" $bot_name "} - Finished Dumping "&$colodisplay&" Colonists from Planet: "&$planetinfo~PLANET&".*"
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
			add $colosDumped $quikstats~TOTAL_HOLDS
		end
		goto :sub_land
# ======================     END COLO DUMP (DUMP) SUBROUTINE    ==========================

include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\MOMBot\botIncludes\quikstats"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\MOMBot\botIncludes\planetinfo"
