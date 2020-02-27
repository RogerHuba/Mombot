	gosub :BOT~loadVars
	gosub :combat~init 


	setVar $BOT~help[1]  $BOT~tab&" density {kill} {escape:sectornumber} {photon} "
	setVar $BOT~help[2]  $BOT~tab&"   - Density scans until it sees ship or planet and "
	setVar $BOT~help[3]  $BOT~tab&"     then performs an action  "
	setVar $BOT~help[4]  $BOT~tab&"             "
	setVar $BOT~help[5]  $BOT~tab&"       {kill} - will kill/holokill "
	setVar $BOT~help[6]  $BOT~tab&"     {escape} - will escape to sector provided "
	setVar $BOT~help[7]  $BOT~tab&"     {photon} - photon sector"
	setVar $BOT~help[8]  $BOT~tab&"    "
	gosub :bot~helpfile

	setVar $BOT~script_title "Density Trigger"
	gosub :BOT~banner

	setVar $PLAYER~save TRUE


	getWordPos " "&$bot~user_command_line&" " $pos " kill "
	setvar $kill false
	if ($pos > 0)
		setvar $kill true
	end

	getWordPos $bot~user_command_line $pos "escape:"
	if ($pos > 0)
		setvar $escape true
		getText $bot~user_command_line&" " $escape_sector "escape:" " "

		isNumber $test $escape_sector
		
		if ($test <> true)
			setVar $SWITCHBOARD~message "Escape sector should be a number.*"
			gosub :switchboard~switchboard
			halt
		end
	end

	getWordPos " "&$bot~user_command_line&" " $pos " photon "
	setvar $photon false
	if ($pos > 0)
		setvar $photon true
	end

	gosub :player~quikstats
	gosub :ship~getshipstats

	setVar $startingLocation $player~current_prompt
	setArray $adj 7
	setArray $dens 7
	setArray $adjsec 7
	setArray $density 7
	if ($startingLocation = "Command")
		goto :checkndtorps
	elseif ($startingLocation = "Planet")
		gosub :planet~getplanetinfo
		send "q"
	elseif ($startingLocation = "Citadel")
		send "q"
		gosub :planet~getplanetinfo
		send "q"
	elseif ($startingLocation = "<StarDock>")
		send "q"
	else
		setVar $SWITCHBOARD~message "Must be run from Command, Planet, Citadel, or Stardock Prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	goto :check_dens

:check_dens
	setVar $mm 0
	setVar $i 0
	send "sz*"
	waiton "Relative Density Scan"

:dtorp_Start
	killTrigger alldone
	setTextLineTrigger getSec :getSec "Sector"
	setTextTrigger allDone :allDone "Command [TL="
	pause

:getSec
	add $i 1
	getText CURRENTLINE $Adj[$i] "Sector" "==>"
	stripText $adj[$i] "("
	stripText $adj[$i] ")"
	stripText $adj[$i] " "
	getText CURRENTLINE $Dens[$i] "==>" "Warps :"
	stripText $dens[$i] ","
	stripText $dens[$i] " "
	goto :dtorp_Start

:allDone
	killTrigger getSec
	gosub :firechk

:letslook
	setVar $w 0

:sublooky
	add $w 1
	if ($w > $i)
		goto :alldone
	elseif ($density[$w] <> $dens[$w])
		setVar $diff ($density[$w] - $den[$w])
		if ($diff > 39)
			gosub :do_action
			goto :dtorp_end
		else
			goto :sublooky
		end
	else
		goto :sublooky
	end

:firechk
	setVar $y 0
	send "sz*"
	waiton "Relative Density Scan"

:looky
	killtrigger manual_stop
	killtrigger dtop_dtorp
	killtrigger getsec
	killtrigger alldone
	setTextLineTrigger getSec :looksec "Sector"
	setTextTrigger allDone :donelook "Command [TL="
	pause

:looksec
	add $y 1
	getText CURRENTLINE $Adjsec[$y] "Sector" "==>"
	stripText $adjsec[$y] "("
	stripText $adjsec[$y] ")"
	stripText $adjsec[$y] " "
	getText CURRENTLINE $Density[$y] "==>" "Warps :"
	stripText $density[$y] ","
	stripText $density[$y] " "
	killtrigger dtop_dtorp
	killtrigger manual_Stop
	killtrigger alldone
	goto :looky

:donelook
	killtrigger getSec
	return

:dtorp_end
	if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
		if ($escape <> true)
			gosub :planet~landingsub
		end
	end
	halt


:do_action
	if (($photon = true) and (CURRENTPHOTONS > 0))
		setvar $sector $adj[$w]
		gosub :photon~run
	end

	if (($kill = true) and (CURRENTFIGHTERS > 0))
		gosub :player~quikstats
		:scanit_again
		setvar $player~startingLocation $player~current_prompt
		gosub :sector~getSectorData
		if ($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips))
			gosub :combat~fastAttack
			goto :scanit_again
		elseif (($sector~emptyShipCount > $sector~myShipCount))
			gosub :combat~fastCapture
			goto :scanit_again
		end
		setvar $before_holo_kill_sector $player~current_sector
		gosub :combat~holokill
		if ($player~current_sector <> $before_holo_kill_sector)
			setVar $PLAYER~WARPTO $before_holo_kill_sector
			gosub :PLAYER~twarp
			if (($PLAYER~twarpSuccess = FALSE) and ($player~msg <> "Already in that sector!"))
				setvar $switchboard~message "Could not make it back to starting sector before holokill. - ["&$player~msg&"]*"
				gosub :switchboard~switchboard
			end
		end
	end

	if ($escape = true)
		killalltriggers

		setVar $PLAYER~WARPTO $escape_sector
		if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
			gosub :planet~landingsub
			gosub :PLAYER~pwarp
		else
			gosub :PLAYER~twarp
			if (($PLAYER~twarpSuccess = FALSE) and ($player~msg <> "Already in that sector!"))
				setvar $switchboard~message "Could not escape. - ["&$player~msg&"]*"
				gosub :switchboard~switchboard
				halt
			end
		end
	end

	setvar $switchboard~message "Density trigger complete.*"
	gosub :switchboard~switchboard

return

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\bot_includes\combat\init\combat"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\pwarp\player"
include "source\bot_includes\player\currentprompt\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\planet\landingsub\planet"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastcitadelattack\combat"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\external\photon"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\combat\holokill\combat"
include "source\bot_includes\ship\getshipstats\ship"


