	gosub :BOT~loadVars
	gosub :combat~init 


	setVar $BOT~help[1]  $BOT~tab&"Once someone tows onto a ship with sidecar running  "
	setVar $BOT~help[2]  $BOT~tab&"it will automatically begin its function."
	setVar $BOT~help[3]  $BOT~tab&"    "
	setVar $BOT~help[4]  $BOT~tab&"Options: "
	setVar $BOT~help[5]  $BOT~tab&"    {off} - Turns off script"
	setVar $BOT~help[6]  $BOT~tab&" {refill} - Refills towing ship fighters when attacked"
	setVar $BOT~help[7]  $BOT~tab&"   {kill} - Kills automatically"
	setVar $BOT~help[8]  $BOT~tab&"    {cap} - Captures ships automatically"
	setVar $BOT~help[9]  $BOT~tab&"     {ig} - IG reset"
	gosub :bot~helpfile

	setVar $BOT~script_title "Sidecar"
	gosub :BOT~banner

	setVar $PLAYER~save TRUE


	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	gosub :PLAYER~getInfo
	if ($PLAYER~current_prompt <> "Command")
		setVar $SWITCHBOARD~message "Must run sidecar from command prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($bot~parm1 = "off")
		setVar $SWITCHBOARD~message "Sidecar shutting down.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	getwordpos $bot~user_command_line $pos "refill"
	if ($pos > 0)
		setvar $refill true
	else
		setvar $refill false
	end

	getwordpos $bot~user_command_line $pos "cap"
	if ($pos > 0)
		setvar $cap true
	else
		setvar $cap false
	end

	getwordpos $bot~user_command_line $pos "ig"
	if ($pos > 0)
		setvar $ig true
	else
		setvar $ig false
	end

	setTextTrigger need_ig :ig_was_off "Your Interdictor generator is now OFF"
	setTextTrigger skip_ig :skipig "is not equipped with an Interdictor Generator!"
	send "b"
	waitOn "Do you wish to change it? (Y/N)"
	send "*"
	goto :skipig

	:ig_was_off
		send "y"
		setVar $SWITCHBOARD~message "Turning on ship IG.*"
		gosub :SWITCHBOARD~switchboard

	:skipig
	killalltriggers
	# making ship corporate #
	send "co*cqq* "

	:wait_for_tow
	killtrigger tow
	killtrigger notow
	setTextLineTrigger tow :validate_tow " locks a tractor beam on your ship."
	pause


	:validate_tow
	getwordpos currentansiline $pos  "[K[1;36m"
	getwordpos currentansiline $pos2 " [0;32mlocks a tractor beam on your ship."
	if (($pos > 0) and ($pos2 > 0))
		getText CURRENTANSILINE $user_name "[K[1;36m" " [0;32mlocks a tractor beam on your ship."
		setvar $switchboard~message "Sidecar attached to "&$user_name&"'s ship.*"
		gosub :switchboard~switchboard

		#check to see if they are a corpie#
		settextlinetrigger online :mycorpie $user_name&" ["&$player~corp&"]"
		settextlinetrigger lag :nocorpie "Average Interval Lag:"
		send "#@"
		pause

		:nocorpie
			killtrigger online
			setvar $switchboard~message $user_name&" is not in my corporation. Authentication denied. Shutting down sidecar.*"
			gosub :switchboard~switchboard
			halt
		:mycorpie
			killtrigger lag
			setvar $switchboard~message $user_name&" is in my corporation.  Authentication approved.*"
			gosub :switchboard~switchboard
			goto :sidecar_functions	
	else
		setvar $switchboard~message "Spoof attempt to make sidecar think it is towed.*"
		gosub :switchboard~switchboard
		goto :wait_for_tow
	end
	halt


:sidecar_functions
	setTextlinetrigger notow :validate_no_tow "You are no longer locked in tow."
	if ($kill)
		#kill triggers
		#	setTextLineTrigger liftsoff :pwarpConfirmed " lifts off from "
		#	setTextLineTrigger 	warps 	:pwarpConfirmed 	"warps into the sector."
		#	setTextLineTrigger 	power 	:pwarpConfirmed 	"is powering up weapons systems!"
		#	settextlinetrigger  wave    :pwarpConfirmed    " launches a wave of fighters at the "
	end
	if ($cap)
		#cap triggers
		#	setTextLineTrigger liftsoff :pwarpConfirmed " lifts off from "
		#	setTextLineTrigger 	warps 	:pwarpConfirmed 	"warps into the sector."
		#	setTextLineTrigger 	power 	:pwarpConfirmed 	"is powering up weapons systems!"
		#	settextlinetrigger  wave    :pwarpConfirmed    " launches a wave of fighters at the "
	end
	if ($ig)
		#ig triggers
	end
	if ($refill)
		#refill triggers
	end
	pause



:validate_no_tow
	getwordpos currentansiline $pos "[32mYou are no longer locked in tow."
	if ($pos > 0)
		setvar $switchboard~message "Sidecar no longer attached to "&$user_name&"'s ship.*"
		gosub :switchboard~switchboard		
	else
		setvar $switchboard~message "Spoof attempt to make sidecar think it isn't towed anymore."
		gosub :switchboard~switchboard
		goto :wait_for_tow
	end
goto :wait_for_tow

	

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\bot_includes\combat\init\combat"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipcapstats\ship"
include "source\bot_includes\ship\getshipstats\ship"
include "source\module_includes\bot\disconnecttriggers\bot"
include "source\bot_includes\grid\surround\grid"
include "source\bot_includes\planet\landingsub\planet"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastcitadelattack\combat"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\planet\landonplanetentercitadel\planet"
include "source\bot_includes\player\buy\player"
