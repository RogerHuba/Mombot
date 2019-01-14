	logging off
	gosub :BOT~loadVars
	loadvar $bot~LIMP_COUNT_FILE

	setVar $BOT~help[1] $BOT~tab&"Refreshes Deployed Limpet List"
	setVar $BOT~help[2] $BOT~tab&"  - Will show difference since last command was run."
	gosub :BOT~help_file

	setVar $BOT~script_title "Limpet Report"
	gosub :BOT~banner

			
# ============================== START REFRESH LIMPETS (LIMPS) ==============================
:limps
	
	gosub :PLAYER~current_prompt
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation = "Command")
	        goto :start_limps
	elseif ($startingLocation = "Citadel")
		send "qdq"
		goto :planet_limps
	elseif ($startingLocation = "Planet")
		send "dq"
		goto :planet_limps
	else
		setVar $SWITCHBOARD~message "Unknown Prompt*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

:planet_limps
	waitOn "Planet #"
   	GetWord CURRENTLINE $planet~planet 2
  	striptext $planet~planet "#"

:start_limps
	gosub :PLAYER~turnOffAnsi
	setVar $SWITCHBOARD~message "Loading current limpet locations. . .*"
	gosub :SWITCHBOARD~switchboard
	fileExists $gfile_chk $BOT~LIMP_COUNT_FILE
	if ($gfile_chk = 1)
		read $BOT~LIMP_COUNT_FILE $previousCount 1
	else
		setVar $previousCount 0
	end
	gosub :refreshLimps
	gosub :PLAYER~turnOnAnsi
	setVar $percent  (($count * 100) / SECTORS)
	setVar $gridChange ($count-$previousCount)
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
	setVar $SWITCHBOARD~message "          - Limpet Grid Report -*          - "&$count&" sectors, "&$personalCount&" personal. ("&$percent&"%) ("&$gridChange&" Change)*          - Activated  Limpet  Scan*            *             Sector    Personal/Corp*            ========================*"&$limpetOutput&"*"
	gosub :SWITCHBOARD~switchboard

halt
#===================================== END REFRESH LIMPS ========================================

# ======================     START REFRESH LIMP (LIMPS) SUBROUTINE    ==========================
:refreshLimps
	
	:readLimpList
		setVar $count 0
		setVar $personalCount 0
		send "k2"
		setVar $i 1
		setVar $limpetOutput ""
		setVar $personalOutput " "
		setVar $output " "
	:keepCountingLimps
		killtrigger corporate
		killtrigger personal
		killtrigger doneCountingFigs
		killtrigger doneNoFigs
		setTextLineTrigger corporate 		:corpCountLimps 	" Corp"
		setTextLineTrigger personal 		:personalCountLimps	"Personal "
		setTextLineTrigger doneCountingFigs	:doneCountingLimps 	"Total"
		setTextLineTrigger doneNoFigs 		:doneCountingLimps 	"No Limpet mines deployed"
		pause
	:personalCountLimps
		add $count 1
		add $personalCount 1
		getWord CURRENTLINE $sector 1
		setVar $personalOutput $personalOutput&$sector&"  "
		setTextLineTrigger personal 		:personalCountLimps	"Personal "
		pause
	:corpCountLimps
		add $count 1
		add $corpCount 1
		getWord CURRENTLINE $sector 1
		while ($i <= $sector)
			getWordPos $personalOutput $pos " "&$i&" "
			if (($sector = $i) OR ($pos > 0))
				setVar $output $output&$i&"*"
				setSectorParameter $i "LIMPSEC" TRUE
			else
				setVar $output $output&"0*"
				setSectorParameter $i "LIMPSEC" FALSE
			end
			add $i 1
		end
		setTextLineTrigger corporate 		:corpCountLimps 	" Corp"
  		pause

	:doneCountingLimps
		killtrigger corporate
		killtrigger personal
		killtrigger doneCountingFigs
		killtrigger doneNoFigs
		setTextTrigger checkLimps :checkMarkedLimps "Activated  Limpet  Scan"
		pause
	:checkMarkedLimps
		setTextLineTrigger donechecking 	:doneCheckingLimps 	"Total"
		setTextLineTrigger donecheckingtoo	:doneCheckingLimps 	"No Active Limpet mines detected"
		setTextLineTrigger corporate 		:markLimpet 		" Corp"
		setTextLineTrigger personal 		:markLimpet		"Personal "
		pause

		:markLimpet
			killtrigger corporate
			killtrigger personal
			setVar $temp CURRENTLINE
			stripText $temp #42
			setVar $limpetOutput $limpetOutput&"             "&$temp&"*"
			killtrigger unfreezingTrigger
                	setDelayTrigger unfreezingTrigger :unfreezebot 10000
      			setTextLineTrigger corporate 		:markLimpet 		" Corp"
			setTextLineTrigger personal 		:markLimpet		"Personal "
			pause
		:doneCheckingLimps
			killtrigger donechecking
			killtrigger donecheckingtoo
		while ($i <= SECTORS)
			getWordPos $personalOutput $pos " "&$i&" "
			if ($pos > 0)
				setVar $output $output&$i&"*"
				setSectorParameter $i "LIMPSEC" TRUE
			else
				setVar $output $output&"0*"
				setSectorParameter $i "LIMPSEC" FALSE
			end
			add $i 1
		end
		delete $BOT~LIMP_FILE
		delete $BOT~LIMP_COUNT_FILE
return
# ======================     END REFRESH LIMP (LIMPS) SUBROUTINE    ==========================



#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
