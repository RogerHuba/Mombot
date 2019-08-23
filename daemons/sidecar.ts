	gosub :BOT~loadVars
	gosub :combat~init 


	setVar $BOT~help[1]  $BOT~tab&"Once someone tows onto a ship with sidecar running  "
	setVar $BOT~help[2]  $BOT~tab&"it will automatically begin its function."
	setVar $BOT~help[3]  $BOT~tab&"    "
	setVar $BOT~help[4]  $BOT~tab&"Options: "
	setVar $BOT~help[5]  $BOT~tab&"    {off} - Turns off script"
	setVar $BOT~help[6]  $BOT~tab&" {refill} - Refills towing ship fighters when attacked"
	setVar $BOT~help[7]  $BOT~tab&"   {kill} - Kills automatically"
	setVar $BOT~help[8]  $BOT~tab&"     {ig} - IG reset"
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
		setVar $SWITCHBOARD~message "Refill mode on.*"
		gosub :SWITCHBOARD~switchboard
	else
		setvar $refill false
	end

	getwordpos $bot~user_command_line $pos "kill"
	if ($pos > 0)
		setvar $kill true
		setVar $SWITCHBOARD~message "Kill mode on.*"
		gosub :SWITCHBOARD~switchboard
	else
		setvar $kill false
	end

	getwordpos $bot~user_command_line $pos "ig"
	if ($pos > 0)
		setvar $ig true
		setVar $SWITCHBOARD~message "IG reset mode on.*"
		gosub :SWITCHBOARD~switchboard
	else
		setvar $ig false
	end

	gosub :ship~getshipstats

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
	setvar $ig false

	# making ship corporate #
	send "co*cqq* "

	send "f"
	waiton " fighters available."
	getword currentline $myfighters 3
	replacetext $myfighters "," ""
	send $myfighters&"*cd"
	setVar $SWITCHBOARD~message "Dropping fighters to allow tow.*"
	gosub :SWITCHBOARD~switchboard


	:wait_for_tow
	killtrigger tow
	killtrigger notow
	setTextLineTrigger tow :validate_tow " locks a tractor beam on your ship."
	pause



	:validate_tow
	setvar $line currentansiline
	getwordpos $line $pos  "[K[1;36m"
	getwordpos $line $pos2 " [0;32mlocks a tractor beam on your ship."
	if (($pos > 0) and ($pos2 > 0))
		getText $line $user_name "[K[1;36m" " [0;32mlocks a tractor beam on your ship."
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
			setvar $line currentline&"|ENDEND|"
			getwordpos $line $pos $user_name&" ["&$player~corp&"]"&"|ENDEND|"
			if ($pos > 0)
				setvar $switchboard~message $user_name&" is in my corporation.  Authentication approved.*"
				gosub :switchboard~switchboard
			else
				setvar $switchboard~message "Spoof attempt to make sidecar think it is a corpie, but it is not!.*"
				gosub :switchboard~switchboard
				halt
			end
			setVar $BOT~command "topoff"
			setVar $BOT~user_command_line " topoff "
			setVar $BOT~parm1 ""
			saveVar $BOT~parm1
			saveVar $BOT~command
			saveVar $BOT~user_command_line
			load "scripts\mombot\commands\general\topoff.cts"
			setEventTrigger		topoffdone		:topoffdone "SCRIPT STOPPED" "scripts\mombot\commands\general\topoff.cts"
			pause
			:topoffdone

			if ($refill)
				# get max fighters on towing ship #
				gosub :player~quikstats
				:find_tow_again
					settexttrigger 1 :found_tower "Exchange with "&$user_name&" (Y/N) [N]?" 
					setdelaytrigger 2 :not_tower 500
					send "tf"
					pause

				:not_tower
					send "*"
					setdelaytrigger 2 :not_tower 500
					pause

				:found_tower
					killtrigger 2 
					settextlinetrigger 1 :capturemaxfigs $user_name&" can only carry "
					settextlinetrigger 2 :refillerror "Corporate command [TL="
					send "y*"&$player~fighters&"* q "
					pause

				:capturemaxfigs			
					killtrigger 2 
					getText CURRENTLINE $tower_max_fighters $user_name&" can only carry " " fighters."

			end
			goto :sidecar_functions	
	else
		setvar $switchboard~message "Spoof attempt to make sidecar think it is towed.*"
		gosub :switchboard~switchboard
		goto :wait_for_tow
	end
	halt


:sidecar_functions
	killalltriggers
	gosub :player~quikstats
	if ($notow)
		setvar $switchboard~message "Sidecar no longer attached to "&$user_name&"'s ship.*"
		gosub :switchboard~switchboard		
	end
	setTextlinetrigger notow :validate_no_tow "You are no longer locked in tow."
	if ($kill)
		#kill triggers
		gosub :setkilltriggers
	end
	if ($ig)
		#ig triggers
		gosub :setigtriggers
	end
	if ($refill)
		#refill triggers
		gosub :setrefilltriggers
	end
	pause

:reloadFigMe
	killtrigger 1
	killtrigger 2
	settextlinetrigger 1 :thatsmyguy "Exchange with "&$user_name&" (Y/N) [N]?" 
	settextlinetrigger 2 :notmyguy "Average Interval Lag:"
	send "tf@"
	pause

	:thatsmyguy
		killtrigger 2
		settextlinetrigger 0 :howmany ", and "&$user_name&" has "
		send "y*"
		pause
		:howmany
			getword currentline $mycount 3
			getText CURRENTLINE $current_fighters "You have "&$mycount&" fighters, and "&$user_name&" has " "."
			setvar $transfer_fighters ($tower_max_fighters-$current_fighters)
			if ($player~fighters < $transfer_fighters)
				setvar $transfer_fighters $player~fighters
			end
			replacetext $transfer "9999" $transfer_fighters
			send $transfer_fighters&"* q "
			gosub :setrefilltriggers
			pause
	:notmyguy
		send "*@"
		settextlinetrigger 2 :notmyguy "Average Interval Lag:"
		pause

	:dotransfer
goto :sidecar_functions

:validate_no_tow
	getwordpos currentansiline $pos "[32mYou are no longer locked in tow."
	if ($pos > 0)
		setvar $switchboard~message "Sidecar no longer attached to "&$user_name&"'s ship.*"
		gosub :switchboard~switchboard		
		goto :wait_for_tow
	else
		setvar $notow false
		setvar $switchboard~message "Spoof attempt to make sidecar think it isn't towed anymore."
		gosub :switchboard~switchboard
		goto :sidecar_functions
	end


:checkForVictims
	gosub :player~quikstats
	:scanit_again
	if ($player~fighters > 0)
		setvar $player~startingLocation $player~current_prompt
		gosub :sector~getSectorData
		if ($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips))
			setvar $istowed false
			gosub :combat~fastAttack
			goto :scanit_again
		elseif (($sector~emptyShipCount > $sector~myShipCount))
			setvar $istowed false
			gosub :combat~fastCapture
			goto :scanit_again
		end
	end
	gosub :setkilltriggers
	pause

	:ig_turn_it_on
		getWord CURRENTLINE $test 1
		if ($test = "F") or ($test = "R") or ($test = "P")
			setTextLineTrigger turnIGon :ig_turn_it_on " damaging your ship."
			pause
		end
		setVar $ig_mode 0
		setDelayTrigger ig_timeout :photon_ig_damage_trigger 3000
		setTextTrigger no_ig_trigger :no_ig_available "is not equipped with an Interdictor Generator!"
		setTextTrigger no_ig_beam :no_ig_beam "Beam to what sector? (U=Upgrade Q=Quit)"
		setTextTrigger no_ig_cby :no_ig_cby "ARE YOU SURE CAPTAIN? (Y/N)"
		setTextTrigger need_ig :ig_was_off "Your Interdictor generator is now OFF"
		setTextTrigger ig_fine :ig_was_on "Your Interdictor generator is now ON"
		setTextTrigger do_ig :do_ig_thing "Do you wish to change it? (Y/N)"
		send "b"
		pause

	:no_ig_available
		gosub :killigtriggers
		send "'{" $switchboard~bot_name "} - No IG available on this ship.*"
		halt

	:no_ig_beam
		gosub :killigtriggers
		send " Q "
		halt

	:no_ig_cby
		gosub :killigtriggers
		send " N "
		halt

	:ig_was_on
		setVar $ig_mode 1
		pause

	:ig_was_off
		setVar $ig_mode 0
		pause

	:do_ig_thing
		gosub :killigtriggers
		if ($ig_mode = 0)
			send "Y"
			send "'{" $switchboard~bot_name "} - IG on!*"
		else
			send "N"
			send "'{" $switchboard~bot_name "} - IG was already on.*"
		end
		gosub :setigtriggers
		pause

:killigtriggers
	killtrigger ig_timeout
	killtrigger no_ig_trigger
	killtrigger no_ig_beam
	killtrigger no_ig_cby
	killtrigger ig_was_on
	killtrigger ig_was_off
	killtrigger do_ig_thing
return

:setkilltriggers
	killtrigger liftsoff
	killtrigger warps
	killtrigger power
	killtrigger wave
	killtrigger moved
	killtrigger deffig
	killtrigger secgun
	killtrigger ig
	killtrigger planet
	killtrigger atomic
	killtrigger exits
	killtrigger enters
	setTextLineTrigger liftsoff :checkForVictims    " lifts off from "
	setTextLineTrigger 	warps 	:checkForVictims 	"warps into the sector."
	setTextLineTrigger 	power 	:checkForVictims 	"is powering up weapons systems!"
	settextlinetrigger  wave    :checkForVictims    " launches a wave of fighters at "
	settextlinetrigger  moved   :checkforvictims    " I towed you from sector "
	setTextLineTrigger 	deffig 	:checkforvictims 	"Deployed Fighters Report Sector "&$player~CURRENT_SECTOR
	setTextLineTrigger 	secgun 	:checkforvictims 	"Quasar Cannon on"
	setTextLineTrigger 	ig		:checkforvictims 	"Shipboard Computers The Interdictor Generator on"
	settextlinetrigger  planet  :checkforvictims	" launches a Genesis Torpedo into the sector!"
	settextlinetrigger  atomic  :checkforvictims    " appears from the planetary rubble."
	setTextLineTrigger 	exits 	:checkforvictims 	"exits the game."
	setTextLineTrigger 	enters 	:checkforvictims 	"enters the game."
return

:setigtriggers
	killtrigger turnIGon
	setTextLineTrigger turnIGon :ig_turn_it_on " damaging your ship."
return

:setrefilltriggers
	killtrigger reload1
	killtrigger reload2
	setTextLineTrigger reload1 :reloadFigMe "launches a wave of fighters at "&$user_name
	setTextLineTrigger reload2 :reloadFigMe $user_name&" deploys some fighters"
return
#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\bot_includes\combat\init\combat"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastcitadelattack\combat"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\combat\fastcapture\combat"
