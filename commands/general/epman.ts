	gosub :BOT~loadVars
	
	
	setVar $BOT~help[1] $BOT~tab&"EP Haggle Manager"
	setVar $BOT~help[2] $BOT~tab&"	   "
	setVar $BOT~help[3] $BOT~tab&"Make sure ephaggle.ts is in your scripts\mombot Directory.*"
	setVar $BOT~help[4] $BOT~tab&"Options: *"
	setVar $BOT~help[5] $BOT~tab&"   {setup} - configures EP for first use with mombot."
	setVar $BOT~help[6] $BOT~tab&"   {stop}  - stop EP Haggle"
	setVar $BOT~help[7] $BOT~tab&"   {start} - Start EP Haggle"
	setVar $BOT~help[8] $BOT~tab&"   {hold} {on/off}  Haggle and Hold mode"
	setVar $BOT~help[9] $BOT~tab&"   {worst} {on/off} Worst Price mode"
	setVar $BOT~help[10] $BOT~tab&"   {mbbs} {on/off}  MBBS mode"
	setVar $BOT~help[11] $BOT~tab&"   {plan} {1-100} Planet Trade No idea what the range is meant to be?"
	setVar $BOT~help[12] $BOT~tab&"   {blue} {on/off} Blue Haggle on/off best price with no exp"
	setVar $BOT~help[13] $BOT~tab&"   {swath} {on/off} Swath Cap on/off"
	setVar $BOT~help[14] $BOT~tab&"   {active} {on/off} EpHaggle on/off"
	setVar $BOT~help[15] $BOT~tab&"   {show} List Config    *"
	setVar $BOT~help[16] $BOT~tab&"Usage: "
	setVar $BOT~help[17] $BOT~tab&"        >epman setup"
	setVar $BOT~help[18] $BOT~tab&"        >epman mbbs on"
	setVar $BOT~help[19] $BOT~tab&"        "
	setVar $BOT~help[20] $BOT~tab&"        Changing config means to restarting EP"
	gosub :bot~helpfile


	setVar $EPSettings GAMENAME&"_HaggleOpt.txt"
	setVar $EP_hh "Off"
	setVar $EP_wp "Off"
	setVar $EP_mbbs "On"
	setVar $EP_plan "100"
	setVar $EP_blue "Off"
	setVar $EP_swath "On"
	setVar $EP_active "Active"
	setVar $EP_supp "On"

	
	if ($bot~parm1 = "setup")
		setVar $silent 1
		goSub :killEP
		goSub :writeSettings
		setVar $SWITCHBOARD~message "EP Haggle settings created*"
		gosub :SWITCHBOARD~switchboard
		goSub :loadEP
	elseif ($bot~parm1 = "stop")
		gosub :killEp
	elseif ($bot~parm1 = "start")
		gosub :loadEP

	elseif ($bot~parm1 = "show")
		gosub :showSettings
	elseif ($bot~parm1 = "plan")
		isNumber $test $bot~parm2
		If ($test)
			setVar $EP_plan $bot~parm2
			gosub :saveAndRestart
		else
			setVar $SWITCHBOARD~message "Planetory Trade should be 1-100.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		
	elseif ($bot~parm1 = "hold")
		if (($bot~parm2 <> "on") and ($bot~parm2 <> "off"))
			setVar $SWITCHBOARD~message "Haggle and Hold should be set to on or off.*"
			gosub :SWITCHBOARD~switchboard
		else
			if ($bot~parm2 = "on")
				setVar $EP_hh "On"
			else
				setVar $EP_hh "Off"
			end
			gosub :saveAndRestart
		end
	elseif ($bot~parm1 = "mbbs")
		if (($bot~parm2 <> "on") and ($bot~parm2 <> "off"))
			setVar $SWITCHBOARD~message "MBBS should be set to on or off.*"
			gosub :SWITCHBOARD~switchboard
		else
			if ($bot~parm2 = "on")
				setVar $EP_mbbs "On"
			else
				setVar $EP_mbbs "Off"
			end
			gosub :saveAndRestart
		end
	elseif ($bot~parm1 = "worst")
		if (($bot~parm2 <> "on") and ($bot~parm2 <> "off"))
			setVar $SWITCHBOARD~message "Worst Price should be set to on or off.*"
			gosub :SWITCHBOARD~switchboard
		else
			if ($bot~parm2 = "on")
				setVar $EP_wp "On"
			else
				setVar $EP_wp "Off"
			end
			gosub :saveAndRestart
		end
	elseif ($bot~parm1 = "blue")
		if (($bot~parm2 <> "on") and ($bot~parm2 <> "off"))
			setVar $SWITCHBOARD~message "Blue Trade should be set to on or off.*"
			gosub :SWITCHBOARD~switchboard
		else
			if ($bot~parm2 = "on")
				setVar $EP_blue "On"
			else
				setVar $EP_blue "Off"
			end
			gosub :saveAndRestart
		end
	elseif ($bot~parm1 = "active")
		if (($bot~parm2 <> "on") and ($bot~parm2 <> "off"))
			setVar $SWITCHBOARD~message "Set EP Haggle Activity to on or off.*"
			gosub :SWITCHBOARD~switchboard
		else
			if ($bot~parm2 = "on")
				setVar $EP_active "Active"
			else
				setVar $EP_active "Inactive"
			end
			gosub :saveAndRestart
		end
	elseif ($bot~parm1 = "swath")
		if (($bot~parm2 <> "on") and ($bot~parm2 <> "off"))
			setVar $SWITCHBOARD~message "Set Swath Capture to on or off.*"
			gosub :SWITCHBOARD~switchboard
		else
			if ($bot~parm2 = "on")
				setVar $EP_swath "On"
			else
				setVar $EP_swath "Off"
			end
			gosub :saveAndRestart
		end
	else
		setVar $SWITCHBOARD~message "Command not found; try the help file.*"
		gosub :SWITCHBOARD~switchboard
	end

halt

:SaveAndRestart
	goSub :killEP
	goSub :writeSettings
	goSub :loadEP
return

:killEP
	listActiveScripts $scripts
	setVar $i 1
	setVar $found FALSE

	if ($silent <> 1)
		setVar $SWITCHBOARD~message "Looking For EP..*"
		gosub :SWITCHBOARD~switchboard
	end
	while ($i <= $scripts)
	
		getWordPos $scripts[$i] $pos "EP_Haggle"
		if ($pos > 0)
			stop $scripts[$i]
			setVar $found TRUE
		end
		getWordPos $scripts[$i] $pos "ephaggle"
		if ($pos > 0)
			stop $scripts[$i]
			setVar $found TRUE
		end
		add $i 1
	end
	if ($silent <> 1)
		if ($FOUND = FALSE)
			setVar $SWITCHBOARD~message "No EP script found to Kill.*"
			gosub :SWITCHBOARD~switchboard
		else
			setVar $SWITCHBOARD~message "EP Haggle is killed.*"
			gosub :SWITCHBOARD~switchboard
		end
	end

return



:loadEP
	goSub :findEP
	if ($foundEp = TRUE)
		setVar $SWITCHBOARD~message "EP Haggle already running, stop first.*"
		gosub :SWITCHBOARD~switchboard
	else
		
		gosub :checkSettings
		setVar $SWITCHBOARD~message "Loading Ep.... wait....*"
		gosub :SWITCHBOARD~switchboard
		send "*"
		setDelayTrigger delay :wait2 500
		pause
		:wait2

		load "scripts\"&$bot~mombot_directory&"\ephaggle"
		
		setDelayTrigger delay :wait 1500
		pause

		:wait
		setVar $SWITCHBOARD~message "EP Haggle started!.*"
		gosub :SWITCHBOARD~switchboard
	end
   
return

:findEP
	setVar $foundEp FALSE
	listActiveScripts $scripts
	setVar $i 1
	setVar $found FALSE

	while ($i <= $scripts)
	
		getWordPos $scripts[$i] $pos "EP_Haggle"
		if ($pos > 0)
			setVar $foundEp TRUE
		end
		getWordPos $scripts[$i] $pos "ephaggle"
		if ($pos > 0)
			setVar $foundEp TRUE
		end
		add $i 1
	end
	
return

:showSettings
	
	gosub :checkSettings
	setVar $m    "EP Settings are as follows:*"
	setVar $m $m&" - Haggle and Hold          " & $EP_hh & "*"
	setVar $m $m&" - Worst Price              " & $EP_wp & "*"
	setVar $m $m&" - MBBS Mode                " & $EP_mbbs & "*"
	setVar $m $m&" - Planetary Trade %        " & $EP_plan & "*"
	setVar $m $m&" - Blue Haggle              " & $EP_blue & "*"
	setVar $m $m&" - Swath Offer Capture      " & $EP_blue & "*"
	setVar $m $m&" - Haggle Toggle            " & $EP_active & "*"
	setVar $m $m&" - Suppress Menu on Load    " & $EP_supp & "*"
	setVar $SWITCHBOARD~message $m
	gosub :SWITCHBOARD~switchboard
return

:checkSettings

#Off	-HAggle and HOld
#Off	- Worst Price
#Off	- MBBS Mode
#100	- Planetary Trade %
#Off	- Blue HAggle
#On	- Swath Offer Capture 
#Active	- Activelive haggling
#On	- Supress Menu Load

	fileExists $exists $EPSettings

	if ($exists)
echo "reading"
		read $EPSettings $EP_hh 1
		read $EPSettings $EP_wp 2
		read $EPSettings $EP_mbbs 3
		read $EPSettings $EP_plan 4
		read $EPSettings $EP_blue 5
		read $EPSettings $EP_swath 6
		read $EPSettings $EP_active 7
		read $EPSettings $EP_supp 8
	else
		setVar $SWITCHBOARD~message "EP Settings file not found; Creating!*"
		gosub :SWITCHBOARD~switchboard
		gosub :writeSettings
	end
	
	if ($EPSettings = "Off")
		setVar $SWITCHBOARD~message "Menu not suppressed; writing now!*"
		
		gosub :writeSettings

	end

return

:writeSettings
	
	delete $EPSettings
	write $EPSettings $EP_hh
	write $EPSettings $EP_wp
	write $EPSettings $EP_mbbs
	write $EPSettings $EP_plan
	write $EPSettings $EP_blue
	write $EPSettings $EP_swath
	write $EPSettings $EP_active
	write $EPSettings $EP_supp
return

halt


# includes:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
