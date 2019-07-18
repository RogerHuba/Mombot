	logging off
	gosub :BOT~loadVars
	loadVar $BOT~ARMID_COUNT_FILE

	setVar $BOT~help[1] $BOT~tab&"Refreshes Deployed Armid List"
	setVar $BOT~help[2] $BOT~tab&"  - Will show difference since last command was run."
	gosub :BOT~help_file

	setVar $BOT~script_title "Armid Report"
	gosub :BOT~banner

	loadVar $ARMID_COUNT_FILE 
	loadVar $bot~ARMID_FILE 
				
# ============================== START REFRESH ARMIDS (ARMIDS) ==============================
:armids
	
	gosub  :player~currentPrompt
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation = "Command")
		goto :start_armids
	elseif ($startingLocation = "Citadel")
		send "q"
		gosub :PLANET~getPlanetInfo
		send "q"
	elseif ($startingLocation = "Planet")
		gosub :PLANET~getPlanetInfo
		send "q"
	else
		setVar $SWITCHBOARD~message "Unknown Prompt*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

:start_armids
	gosub :PLAYER~turnOffAnsi
	setVar $SWITCHBOARD~message "Loading current armid locations. . .*"
	gosub :SWITCHBOARD~switchboard
	fileExists $gfile_chk $BOT~ARMID_COUNT_FILE
	if ($gfile_chk = 1)
		read $BOT~ARMID_COUNT_FILE $previousCount 1
	else
		setVar $previousCount 0
	end
	gosub :refresharmids
	gosub :PLAYER~turnOnAnsi
	setVar $percent  (($count * 100) / SECTORS)
	setVar $gridChange $count-$previousCount
	if ($gridChange > 0)
		setVar $gridChange "+"&$gridChange
	end


	setVar $limpetsGridded TRUE
	if (($startingLocation = "Citadel") OR ($startingLocation = "Planet"))
		gosub :PLANET~landingsub
	end
	if ($SWITCHBOARD~self_command = FALSE)
		setVar $SWITCHBOARD~self_command 2
	end
	setVar $SWITCHBOARD~message "          - Armid Grid Report -*          - "&$count&" sectors, "&$personalCount&" personal. ("&$percent&"%) ("&$gridChange&" Change)**"
	gosub :SWITCHBOARD~switchboard

halt
#===================================== END REFRESH ARMIDS ========================================

# ======================     START REFRESH ARMIDS (ARMIDS) SUBROUTINE    ==========================
:refresharmids
	setArray $pmines SECTORS
	:readarmidList
		setVar $count 0
		setVar $personalCount 0
		send "k1"
		setVar $i 1
		setVar $limpetOutput ""
		setVar $personalOutput " "
		setVar $output " "
	:keepCountingarmids
		killtrigger corporate
		killtrigger personal
		killtrigger doneCountingFigs
		killtrigger doneNoFigs
		setTextLineTrigger corporate 		:corpCountarmids 	" Corp"
		setTextLineTrigger personal 		:personalCountarmids	"Personal "
		setTextLineTrigger doneCountingFigs	:doneCountingarmids 	"Total"
		setTextLineTrigger doneNoFigs 		:doneCountingarmids 	"No mines deployed"
		pause
	:personalCountarmids
		add $count 1
		add $personalCount 1
		getWord CURRENTLINE $sector 1
		getWord CURRENTLINE $numMines 2
		setVar $personalOutput $personalOutput&$sector&"  "
		setVar $pmines[$sector] $numMines
		setTextLineTrigger personal 		:personalCountarmids	"Personal "
		pause
	:corpCountarmids
		add $count 1
		add $corpCount 1
		getWord CURRENTLINE $sector 1
		getWord CURRENTLINE $numMines 2
		while ($i <= $sector)
			getWordPos $personalOutput $pos " "&$i&" "
			if (($sector = $i) OR ($pos > 0))
				if ($pos > 0)
					setVar $output $output& $pmines[$i]  &"*"
				else
					setVar $output $output&$numMines&"*"
				end
				setSectorParameter $i "MINESEC" TRUE
			else
				setVar $output $output&"0*"
				setSectorParameter $i "MINESEC" FALSE
			end
			add $i 1
		end
		setTextLineTrigger corporate 		:corpCountarmids 	" Corp"
  		pause

	:doneCountingarmids
		killtrigger corporate
		killtrigger personal
		killtrigger doneCountingFigs
		killtrigger doneNoFigs

		while ($i <= SECTORS)
			getWordPos $personalOutput $pos " "&$i&" "
			if ($pos > 0)
				setVar $output $output&$numMines&"*"
				setSectorParameter $i "MINESEC" TRUE
			else
				setVar $output $output&"0*"
				setSectorParameter $i "MINESEC" FALSE
			end
			add $i 1
		end
		delete $BOT~ARMID_FILE
		write $BOT~ARMID_FILE $output
		delete $BOT~ARMID_COUNT_FILE
		write $BOT~ARMID_COUNT_FILE $count
return
# ======================     END REFRESH LIMP (LIMPS) SUBROUTINE    ==========================






#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\player\currentprompt"
include "source\bot_includes\planet"
include "source\bot_includes\switchboard"
include "source\bot_includes\player\turnoffansi"
include "source\bot_includes\player\turnonansi"
