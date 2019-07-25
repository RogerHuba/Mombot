	logging off
		gosub :BOT~loadVars
									

	setVar $BOT~help[1] $BOT~tab&"Scans for targets and autokills in sector."
	setVar $BOT~help[2] $BOT~tab&"         "
	setVar $BOT~help[3] $BOT~tab&"Options: "
	setVar $BOT~help[4] $BOT~tab&"{off} - Turns off script and sets planet and ship corporate."
	gosub :bot~helpfile

	setVar $BOT~script_title "Dock Killer"
	gosub :BOT~banner
	gosub :combat~init 
	setVar $SWITCHBOARD~self_command TRUE
	
	goto :start_script
:inac
	gosub :PLAYER~quikstats
:execute
		setdelaytrigger justwait :okaygo 100
		pause
	:okaygo
	goSub :SECTOR~getSectorData
	#set player~refurbString to allow fast refurbing if you have a mac#
	goSub :combat~fastAttack
	goto :execute


:start_script
	:cit_kill
	killalltriggers
	gosub :PLAYER~quikstats	
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	setVar $PLAYER~targetingPerson FALSE
	setVar $PLAYER~targetingCorp FALSE
	setVar $PLAYER~target ""
	loadvar $ship~ship_fighters_max
	loadvar $ship~ship_max_attack

	if ($bot~parm1 = "off")
		send "'{" $SWITCHBOARD~bot_name "} - Shutting down dockkill..*"
		if ($player~current_sector = STARDOCK)
			send "p ss ys *p"
			send "'{" $SWITCHBOARD~bot_name "} - Should be on dock.*"
		end
		if ($player~current_sector = "1")
			send "p ty"
			send "'{" $SWITCHBOARD~bot_name "} - Should be on port.*"
		end
		halt
	else
		if ($startingLocation <> "Command") AND ($startingLocation <> "<StarDock>")
			send "'{" $SWITCHBOARD~bot_name "} - Stardock Killer must be run from the Command or StarDock Prompt*"
			halt
		end
		isNumber $test $bot~parm2
		if ($test)
			if ($bot~parm2 > 0)
				setVar $targetingCorp TRUE
				setVar $target $bot~parm2
			end
		else
			getWordPos $bot~parm2 $pos #34
			if ($pos > 0)	
				setvar $bot~user_command_line $bot~user_command_line&" "
				getText $bot~user_command_line $PLAYER~target " "&#34 #34&" "
				if ($PLAYER~target <> "")
					setVar $PLAYER~targetingPerson TRUE
					lowercase $PLAYER~target
					stripText $bot~user_command_line " "&#34&$PLAYER~target&#34&" "
				else
					setVar $PLAYER~targetingPerson FALSE
				end
			end
		end
		getWordPos $bot~user_command_line $pos "dt"
		if ($pos > 0)
			setVar $PLAYER~doubletap TRUE
		else
			setVar $PLAYER~doubletap FALSE
		end
		getWordPos $bot~user_command_line $pos "sg"
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
		setVar $player~refurbString "p s s p "
	elseif ((($PLAYER~CURRENT_SECTOR = 1) OR (PORT.CLASS[$PLAYER~CURRENT_SECTOR] = 0)) AND (PORT.EXISTS[$PLAYER~CURRENT_SECTOR]))
		setVar $player~refurbString "p t "
	else
		setVar $player~refurbString ""
		echo "*No known class 0 or 9 port here to refurb at.*"
	end
	if ($player~refurbString <> "")
		if ($PLAYER~CURRENT_SECTOR = STARDOCK)
			setvar $player~refurbString "p  s  s  p  b  "&$ship~ship_max_attack&"*  b  "&$ship~ship_max_attack&"*  c  "&$ship~max_shields&"*  q q q "
			send "P  S G Y G Q s p"
		elseif (($PLAYER~CURRENT_SECTOR = 1) OR (PORT.CLASS[$PLAYER~CURRENT_SECTOR] = 0))
			setvar $player~refurbString "p  t  b "&$ship~ship_max_attack&"* b "&$ship~ship_max_attack&"* c "&$ship~max_shields&"* q "
			send "p ty"
		else
			echo "*No known class 0 or 9 port here to refurb at.*"
		end
		waitOn "B  Fighters        :"
		getWord CURRENTLINE $figsToBuy 8
		waitOn "C  Shield Points   :"
		getWord CURRENTLINE $player~shieldsToBuy 9
		if ($PLAYER~CURRENT_SECTOR = STARDOCK)
			setVar $leavestring "b "&$figsToBuy&"* c "&$player~shieldsToBuy&"* q q q "
		else
			setVar $leavestring "b "&$figsToBuy&"* c "&$player~shieldsToBuy&"* q "
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
		gosub :player~quikstats
		if ($player~current_prompt = "Command")
			send ("'{" & $switchboard~bot_name & "} "&$TagLineB&" - Restarting!**")
		    	waitfor "Message sent on sub-space channel"
			goto :inac
		elseif ($player~current_prompt = "Citadel")
			send ("'{" & $switchboard~bot_name & "} "&$TagLineB&" - Restarting!**")
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

:player~setconnectiontriggers
	killtrigger discod1
	killtrigger discod2
	SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
	SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."

return


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\player\setconnectiontriggers\player"
