	logging off
	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"Refreshes Deployed Armid List"
	setVar $BOT~help[2] $BOT~tab&"  - Will show difference since last command was run."
	gosub :BOT~help_file

	setVar $BOT~script_title "Armid Report"
	gosub :BOT~banner

	loadVar $ARMID_COUNT_FILE 
	loadVar $ARMID_FILE 
				
# ============================== START REFRESH ARMIDS (ARMIDS) ==============================
:armids
	
	gosub :PLAYER~current_prompt
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
	fileExists $gfile_chk $ARMID_COUNT_FILE
	if ($gfile_chk = 1)
		read $ARMID_COUNT_FILE $previousCount 1
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
		setVar $personalOutput $personalOutput&$sector&"  "
		setTextLineTrigger personal 		:personalCountarmids	"Personal "
		pause
	:corpCountarmids
		add $count 1
		add $corpCount 1
		getWord CURRENTLINE $sector 1
		while ($i <= $sector)
			getWordPos $personalOutput $pos " "&$i&" "
			if (($sector = $i) OR ($pos > 0))
				setVar $output $output&$i&"*"
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
				setVar $output $output&$i&"*"
				setSectorParameter $i "MINESEC" TRUE
			else
				setVar $output $output&"0*"
				setSectorParameter $i "MINESEC" FALSE
			end
			add $i 1
		end
		delete $ARMID_FILE
		write $ARMID_FILE $output
		delete $ARMID_COUNT_FILE
		write $ARMID_COUNT_FILE $count
return
# ======================     END REFRESH LIMP (LIMPS) SUBROUTINE    ==========================




#=============================== FORMATTING FOR SPACES =======================================
:formatNumberForSpaces
	if ($inputVariable < 10)
		setVar $outputVariable "    " & $inputVariable
	elseif ($inputVariable < 100)
		setVar $outputVariable "   " & $inputVariable
	elseif ($inputVariable < 1000)
		setVar $outputVariable "  " & $inputVariable
	elseif ($inputVariable < 10000)
		setVar $outputVariable " " & $inputVariable
	else
		setVar $outputVariable $inputVariable
	end
return

:formatPercentageForSpaces
	if ($inputVariable < 10)
		setVar $outputVariable "  (" & $inputVariable&"%)"
	elseif ($inputVariable < 100)
		setVar $outputVariable " (" & $inputVariable&"%)"
	elseif ($inputVariable < 1000)
		setVar $outputVariable "(" & $inputVariable&"%)"
	else
		setVar $outputVariable $inputVariable
	end
return
#============================= END FORMATTING FOR SPACES =====================================

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
