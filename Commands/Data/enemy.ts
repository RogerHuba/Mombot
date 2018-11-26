	reqRecording
	logging off
	gosub :BOT~loadVars
	setVar $BOT~command "enemy"
	loadVar $BOT~bot_turn_limit
	loadVar $MAP~stardock
	loadvar $bot~subspace
	loadvar $switchboard~self_command

	setVar $BOT~help[1]   $BOT~tab&"enemy {planets | traders}"
	setVar $BOT~help[2]   $BOT~tab&"     Displays planets or traders from database information"
	
	gosub :BOT~help_file

	setVar $BOT~script_title "Enemy Finder"
	gosub :BOT~banner

	setVar $PLAYER~save TRUE


	gosub :PLAYER~quikstats
	gosub :player~getInfo

	getSectorParameter SECTORS "FIGSEC" $isFigged

	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Citadel") and ($startingLocation <> "Planet") and ($startingLocation <> "Command"))
		setVar $SWITCHBOARD~message "Wanderer must be started from command, planet, or citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
	end

	gosub :get_tl_list

	setvar $i 1
    while ($i <= SECTORS)
    	setvar $isBubble false
        getSectorParameter $i "BUBBLE" $isBubble
        getSectorParameter $i "FIGSEC" $isFigged

		getWordPos $tl_planets $pos " "&$i&" "
		if ($pos > 0)
			setVar $isBubble TRUE
		end
        if (($isBubble <> TRUE) AND ($isFigged <> TRUE))
            if (SECTOR.PLANETCOUNT[$i] > 0)
                setVar $MAP~displaySector $i
				gosub :MAP~displaySector
				setVar $SWITCHBOARD~message "  *"&$MAP~output
				if ($SWITCHBOARD~self_command <> TRUE)
				    setVar $SWITCHBOARD~self_command 2
				end
				listSectorParameters $i $parms
				setvar $j 1
				setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  *"
				while ($j <= $parms)
				    getSectorParameter $i $parms[$j] $check
				    setVar $SWITCHBOARD~message $SWITCHBOARD~message&"    "&$parms[$j]&": "&$check&"*"
				    add $j 1
				end
			    gosub :SWITCHBOARD~switchboard

            end
        end
        add $i 1
    end

halt

:get_tl_list
	setVar $sectorCount 0
	killalltriggers
	setTextLineTrigger sectorGrabber :sector_planet_line "Class "
	setTextLineTrigger sectorbeDone :sector_done "======   ============"
	setVar $tl_planets " "
	#personal first
	send "cyq"
	pause
	:sector_planet_line
		killalltriggers
		getWord CURRENTLINE $testsector 1
		setVar $tl_planets $tl_planets&" "&$testsector&" "
		setTextLineTrigger getLine2 :sector_planet_line "Class"
		setTextLineTrigger getEnd :sector_done "======   ============"
		pause
	:sector_done
	send "@"
	waitOn "Average Interval Lag:"


	if ($startingLocation = "Citadel")
		send "xlq"
	else
		send "tlq"
	end
	killalltriggers
	setTextLineTrigger sectorGrabber :sector_planet_line2 "Class "
	setTextLineTrigger sectorbeDone :sector_done2 "======   ============"
	pause
	:sector_planet_line2
		killalltriggers
		getWord CURRENTLINE $testsector 1
		setVar $tl_planets $tl_planets&" "&$testsector&" "
		setTextLineTrigger getLine2 :sector_planet_line2 "Class"
		setTextLineTrigger getEnd :sector_done2 "======   ============"
		pause
	:sector_done2
	send "@"
	waitOn "Average Interval Lag:"

return

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"