	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"HAZ - Create 100% NavHaz in Current-Sector"
	setVar $BOT~help[2] $BOT~tab&"      Scans the Game-Status (aka V Screen), once, to obtain"
	setVar $BOT~help[3] $BOT~tab&"      Maximum Planets per Sector."
	gosub :BOT~help_file



	gosub :player~quikstats

	if ($player~current_prompt <> "Command")
		setvar $switchboard~message "Start From Command Prompt!*"
		gosub :switchboard~switchboard
		halt
	end
	if ($player~genesis < 10)
		setvar $switchboard~message "Not Enough Gen Torps!*"
		gosub :switchboard~switchboard
		halt
	end
	if ($player~atomic < 10)
		setvar $switchboard~message "Not Enough Atomic Dets!*"
		gosub :switchboard~switchboard
		halt
	end
	if ($player~current_sector = 1)
		setvar $switchboard~message "The intense traffic in sector 1 prohibits planetary construction.*"
		gosub :switchboard~switchboard
		halt
	end

	if ($player~current_sector <> STARDOCK)
		setVar $BUFFER ($player~shields + $player~fighters)
		if ($BUFFER < 5500)
			setvar $switchboard~message "Not Enough Shields/Fighters*"
			gosub :switchboard~switchboard
			send "**"
			halt
		end
	end

	setVar $START_FIGS		$player~fighters
	setVar $START_SHIELDS	$player~shields
	setVar $i 1

	getRnd $ID 1000 9999

	setVar $ID ("M()M Haz Maker [" & $ID & "]")

	while ($i <= 10)
    	send "   u   y "
		setTextLineTrigger NoOverLoad	:NoOverload "What do you want to name this planet?"
		setTextLineTrigger Yikes		:Yikes "I'm sorry, but not enough free matter exists."
		setTextTrigger OverLoad 		:Overload "Do you wish to abort?"
		pause
		:Yikes
			killAllTriggers
			setvar $switchboard~message " Game Maximum Planets Reached.*"
			gosub :switchboard~switchboard
			send " ** "
			halt
		:Overload
			killTrigger Overload
			send " n "
			pause
		:NoOverload
			killAllTriggers
			send $ID & "*  j  c   "

		add $i 1
	end

	setArray $Registry	10
	setVar $i 1

	send " L"
	waitfor "-----------------------------------------------"
	setTextTrigger		DoneDrawing	:DoneDrawing	"Land on which planet <Q to abort>"
	:Loop
	setTextLineTrigger	Line		:Line			("> " & $ID)
	pause
	:Line
		getText CURRENTLINE $STR "<" ">"
		stripText $STR " "
		setVar $Registry[$i] $STR
		add $i 1
		setTextLineTrigger	Line		:Line			("> " & $ID)
		pause
	:DoneDrawing
		killAllTriggers
		send "*   "
		setVar $i 1
		while ($i <= 10)
			send "  L Z" & #8 & $Registry[$i] & "*   z  d  y  *   "
			add $i 1
		end
	send "  **  "
	gosub :player~quikstats

    setvar $switchboard~message "" & SECTOR.NAVHAZ[$player~current_sector] & "% Haz Created (Lost " & ($START_FIGS - $player~fighters) & " Figs, " & ($START_SHIELDS - $player~shields) & " Shields)*"
    gosub :switchboard~switchboard
	halt


#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
