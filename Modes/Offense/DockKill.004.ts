	logging off
		gosub :BOT~loadVars
	setVar $parm1 $BOT~parm1
	setVar $parm2 $BOT~parm2
	setVar $parm3 $BOT~parm3
	setVar $parm4 $BOT~parm4
	setVar $parm5 $BOT~parm5
	setVar $parm6 $BOT~parm6
	setVar $parm7 $BOT~parm7
	setVar $parm8 $BOT~parm8
	setVar $user_command_line $BOT~user_command_line


	setVar $BOT~help[1] $BOT~tab&"Scans for targets and autokills in sector."
	setVar $BOT~help[2] $BOT~tab&"         "
	setVar $BOT~help[3] $BOT~tab&"Options: "
	setVar $BOT~help[4] $BOT~tab&"{off} - Turns off script and sets planet and ship corporate."
	gosub :BOT~help_file

	setVar $BOT~script_title "Dock Killer"
	gosub :BOT~banner

goto :start_script
:inac
	gosub :PLAYER~quikstats
:execute
	setVar $SWITCHBOARD~self_command TRUE
	send "@"
	waitOn "Average Interval Lag:"

	goSub :SECTOR~getSectorData
	goSub :PLAYER~fastAttack
	goto :execute


:start_script
	:cit_kill
	killalltriggers
	gosub :PLAYER~quikstats	
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	setVar $PLAYER~targetingPerson FALSE
	setVar $PLAYER~targetingCorp FALSE
	setVar $PLAYER~target ""
	if ($parm1 <> "on")
        	send "'{" $SWITCHBOARD~bot_name "} - Please use - dockkill [on/off]*"
		halt
	else
		if ($startingLocation <> "Command") AND ($startingLocation <> "<StarDock>")
			send "'{" $SWITCHBOARD~bot_name "} - Stardock Killer must be run from the Command or StarDock Prompt*"
			halt
		end
		isNumber $test $parm2
		if ($test)
			if ($parm2 > 0)
				setVar $targetingCorp TRUE
				setVar $target $parm2
			end
		else
			getWordPos $parm2 $pos #34
			if ($pos > 0)	
				setVar $user_command_line $user_command_line&" "
				getText $user_command_line $PLAYER~target " "&#34 #34&" "
				if ($PLAYER~target <> "")
					setVar $PLAYER~targetingPerson TRUE
					lowercase $PLAYER~target
					stripText $user_command_line " "&#34&$PLAYER~target&#34&" "
				else
					setVar $PLAYER~targetingPerson FALSE
				end
			end
		end
		getWordPos $user_command_line $pos "dt"
		if ($pos > 0)
			setVar $PLAYER~doubletap TRUE
		else
			setVar $PLAYER~doubletap FALSE
		end
		getWordPos $user_command_line $pos "sg"
		if ($pos > 0)
			setVar $PLAYER~shotgun TRUE
		else
			setVar $PLAYER~shotgun FALSE
		end
		:start_cit_kill
	end		

:start

	if ($startingLocation = "<StarDock>")
		send "q "
	end
	gosub :SHIP~getShipStats

:warning
	if (($PLAYER~CURRENT_SECTOR = STARDOCK) AND (PORT.EXISTS[STARDOCK]))
		setVar $refurbString "p s s p "
	elseif ((($PLAYER~CURRENT_SECTOR = 1) OR (PORT.CLASS[$PLAYER~CURRENT_SECTOR] = 0)) AND (PORT.EXISTS[$PLAYER~CURRENT_SECTOR]))
		setVar $refurbString "p t "
	else
		setVar $refurbString ""
		echo "*No known class 0 or 9 port here to refurb at.*"
	end
	if ($refurbString <> "")
		if ($PLAYER~CURRENT_SECTOR = STARDOCK)
			send "p ss ys *p"
		elseif (($PLAYER~CURRENT_SECTOR = 1) OR (PORT.CLASS[$PLAYER~CURRENT_SECTOR] = 0))
			send "p ty"
		else
			echo "*No known class 0 or 9 port here to refurb at.*"
		end
		gosub :setConnectionTriggers
		waitOn "B  Fighters        :"
		getWord CURRENTLINE $figsToBuy 8
		waitOn "C  Shield Points   :"
		getWord CURRENTLINE $shieldsToBuy 9
		if ($PLAYER~CURRENT_SECTOR = STARDOCK)
			setVar $leavestring "b "&$figsToBuy&"* c "&$shieldsToBuy&"* q q q "
		else
			setVar $leavestring "b "&$figsToBuy&"* c "&$shieldsToBuy&"* q "
		end
		send $leavestring
	end
	if ($PLAYER~targetingPerson)
		send "'{" $SWITCHBOARD~bot_name "} - StarDock Killer Targeting "&$PLAYER~target&" running in sector "&$PLAYER~current_sector&".*"
	elseif ($PLAYER~targetingCorp)
		send "'{" $SWITCHBOARD~bot_name "} - StarDock Killer Targeting Corp "&$PLAYER~target&" running in sector "&$PLAYER~current_sector&".*"
	else
		send "'{" $SWITCHBOARD~bot_name "} - StarDock Killer running in sector "&$PLAYER~current_sector&".*"
	end
	if ($PLAYER~shotgun)
		send "'{" $SWITCHBOARD~bot_name "} - Shotgun mode enabled.*"
	elseif ($PLAYER~doubletap)
		send "'{" $SWITCHBOARD~bot_name "} - Doubletap mode enabled.*"
	end

	gosub :PLAYER~quikstats	

	goto :execute


:Discod
	   	setVar $TagLine				"[Stardock Killer]"
		setVar $TagLineB			"[Stardock Killer]"
		killAllTriggers
	   	Echo "**" & ANSI_14 & $TagLineB & ANSI_15 & " Disconnected **"
	   	:Disco_Test
		if (CONNECTED <> TRUE)
			setDelayTrigger		Emancipate_CPU		:Emancipate_CPU 3000
			Echo "**" & ANSI_14 & $TagLineB & ANSI_15 & " Auto Resume Initiated - Awaiting Connection!**"
			pause
			:Emancipate_CPU
			goto :Disco_Test
		end
		waitfor "(?="
		setDelayTrigger		WaitingABit		:WaitingABit	3000
		Echo "**" & ANSI_14 & $TagLineB & ANSI_15 & " Connected - Waiting For Command Prompt!**"
		pause
		:WaitingABit
		killAllTriggers
		gosub :quikstats
		if ($CURRENT_PROMPT = "Command")
			send ("'{" & $bot_name & "} "&$TagLineB&" - Restarting!**")
		    	waitfor "Message sent on sub-space channel"
			goto :inac
		elseif ($CURRENT_PROMPT = "Citadel")
			send ("'{" & $bot_name & "} "&$TagLineB&" - Restarting!**")
			waitfor "Message sent on sub-space channel"
	   		send "qqqq**"
	   		goto :inac
	   	else
	   		send (" p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '" & $TagLineB & "Attempting to Reach Correct Prompt...*")
			setTextLineTrigger	EMQ_COMPLETE		:EMQ_DELAY "Attempting to Reach Correct Prompt..."
			setDelayTrigger 	EMQ_DELAY		:EMQ_DELAY 3000
			pause
			:EMQ_DELAY
				killAllTriggers
				goto :Disco_Test
		end

:setConnectionTriggers
	killtrigger discod1
	killtrigger discod2
	SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
	SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."

return


#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"