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


	setVar $BOT~help[1] $BOT~tab&"Self destructs planet if captured.  Attempts to kill pod.  "
	setVar $BOT~help[2] $BOT~tab&" "
	setVar $BOT~help[3] $BOT~tab&"Requires citadel, atomic detonator, and unique planet name."
	setVar $BOT~help[4] $BOT~tab&""
	setVar $BOT~help[5] $BOT~tab&"Options:"
	setVar $BOT~help[6] $BOT~tab&"       move [sector]"
	setVar $BOT~help[7] $BOT~tab&"       	Instead of self destructing, planet is moved to sector."
	gosub :BOT~help_file

	setVar $BOT~script_title "Tripwire"
	gosub :BOT~banner

	gosub :combat~init 

	if ($parm1 = "move")
		if ($parm2 <= 0 OR $parm2 > SECTORS)
			setVar $SWITCHBOARD~message "When move option is used, sector must be a valid number.*"
			gosub :SWITCHBOARD~switchboard		
			halt
		end
		setVar $move_planet TRUE
		setVar $move_sector $parm2
	end


	send "|"
	waitFor " all messages."
	
	getWordPos CURRENTLINE $pos "Silencing all messages."
	if ($pos > 0) 
		send "|"
	else
		setVar $SWITCHBOARD~message "Mesages were silenced.  Turning messages back on so tripwire can function.*"
		gosub :SWITCHBOARD~switchboard		
	end
	
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($PLAYER~current_prompt <> "Citadel")
		setVar $SWITCHBOARD~message "Must run tripwire from citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	
	if (($PLAYER~ATOMIC < 1) and ($move_planet <> true))
		setVar $SWITCHBOARD~message "Tripwire requires at least one atomic detonator. (Just in case)*"
		gosub :SWITCHBOARD~switchboard
		halt

	end

	gosub :PLAYER~getInfo
	setVar $homesector $PLAYER~CURRENT_SECTOR
    	
    	
    	
	setTextTrigger need_ig :planet_ig_was_off "Your Interdictor Generator is now ACTIVE"
	setTextTrigger no_ig :skipplanetig "This Citadel does not have an Interdictor Generator"
	send "n"
	waitOn "Do you want to change this setting? (Y/N)"
	goto :skipplanetig

	:planet_ig_was_off
		send "y"
		setVar $SWITCHBOARD~message "Turning off planet IG.*"
		gosub :SWITCHBOARD~switchboard

	:skipplanetig
	send "* ls0*la1*"
	setVar $SWITCHBOARD~message "Turning off sector quasar cannons. Setting atmos to 1 percent.*"
	gosub :SWITCHBOARD~switchboard

	killalltriggers	
	send "q"
	gosub :PLANET~getPlanetInfo	

	send "c "	
	gosub :PLAYER~quikstats
	if ($PLAYER~CURRENT_PROMPT <> "Citadel")
		setVar $SWITCHBOARD~message "Something went wrong.  Not at citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	gosub :SHIP~getShipStats
	
	killalltriggers

	setVar $SWITCHBOARD~message "Trip wire set on planet "&$PLANET~PLANET_NAME&".*"
	if ($move_planet = TRUE)
		setVar $SWITCHBOARD~message "Trip wire set on planet "&$PLANET~PLANET_NAME&" to move to sector "&$move_sector&".*"
	end
	
	gosub :SWITCHBOARD~switchboard
	
	if ($move_planet = TRUE) 
		setTextLineTrigger time_to_move :check_for_move " of your fighters on planet "&$PLANET~PLANET_NAME
		setTextLineTrigger time_to_move_2 :check_for_move_2 " of your Planetary Shields on planet "&$PLANET~PLANET_NAME
		setTextLineTrigger time_to_move_3 :check_for_move_3 "Quasar Cannon on "&$PLANET~PLANET_NAME&" blasted"
		pause
		
		:check_for_move
		getWordPos CURRENTANSILINE $pos "[0;32m of your fighters on planet [1;33m"&$PLANET~PLANET_NAME

		if ($pos <= 0)
			setTextLineTrigger time_to_move :check_for_move " of your fighters on planet "&$PLANET~PLANET_NAME
			pause
		end
		goto :move
		
		:check_for_move_2
		getWordPos CURRENTANSILINE $pos "[0;32m of your Planetary Shields on planet [1;33m"&$PLANET~PLANET_NAME
		
		if ($pos <= 0)
			setTextLineTrigger time_to_move_2 :check_for_move_2 " of your Planetary Shields on planet "&$PLANET~PLANET_NAME
			pause
		end
		goto :move
		
		:check_for_move_3
		getWordPos CURRENTANSILINE $pos "[0;32m points (atmos)"
		
		if ($pos <= 0)
			setTextLineTrigger time_to_move_3 :check_for_move_3 "Quasar Cannon on "&$PLANET~PLANET_NAME&" blasted"
			pause
		end
		goto :move
		
		
		
		:move
			killtrigger time_to_move
			killtrigger time_to_move_2
			killtrigger time_to_move_3
			
			send "p"&$move_sector&"*y ny q q z n a y y " $SHIP~SHIP_MAX_ATTACK "* * z n q z n  l " $PLANET~PLANET "*  m  *** "
			send " q z n a y y " $SHIP~SHIP_MAX_ATTACK "* * z n q z n  l " $PLANET~PLANET "*  m  *** "
			send " q z n a y y " $SHIP~SHIP_MAX_ATTACK "* * z n q z n  l " $PLANET~PLANET "*  m  *** "
			send " q z n a y y " $SHIP~SHIP_MAX_ATTACK "* * z n q z n  l " $PLANET~PLANET "*  m  *** "
			send " q z n a y y " $SHIP~SHIP_MAX_ATTACK "* * z n q z n  l " $PLANET~PLANET "*  m  *** "
			send " q z n a y y " $SHIP~SHIP_MAX_ATTACK "* * z n q z n  l " $PLANET~PLANET "*  m  *** "
			send " q z n a y y " $SHIP~SHIP_MAX_ATTACK "* * z n q z n  l " $PLANET~PLANET "*  m  *** "
			send " q z n a y y " $SHIP~SHIP_MAX_ATTACK "* * z n q z n  l " $PLANET~PLANET "*  m  *** "
			send " q z n a y y " $SHIP~SHIP_MAX_ATTACK "* * z n q z n  l " $PLANET~PLANET "*  m  *** "
			send " q z n a y y " $SHIP~SHIP_MAX_ATTACK "* * z n q z n  l " $PLANET~PLANET "*  m  *** "
			send " q z n a y y " $SHIP~SHIP_MAX_ATTACK "* * z n q z n  l " $PLANET~PLANET "*  m  *** "
			send " q z n a y y " $SHIP~SHIP_MAX_ATTACK "* * z n q z n  l " $PLANET~PLANET "*  m  *** "
			send "c s* @"
			waitOn "Average Interval Lag:"
			
			setVar $SWITCHBOARD~message "Trip wire tripped (moved to sector "&$move_sector&") on planet "&$PLANET~PLANET_NAME&".  Kill mode commencing.*"
			gosub :SWITCHBOARD~switchboard

			setVar $PLAYER~doubletap TRUE
			setVar $PLAYER~smart TRUE
			while ($PLAYER~FIGHTERS = $SHIP~SHIP_FIGHTERS_MAX)
				send "@"
				waitOn "Average Interval Lag:"
				
				
				if ($PLAYER~CURRENT_PROMPT = "Citadel")
					setVar $PLAYER~startingLocation "Citadel"
					goSub :SECTOR~getSectorData
					goSub :combat~fastCitadelAttack					
				else
					halt
				end
				gosub :PLAYER~quikstats
			end	
			setVar $SWITCHBOARD~message "Kill mode shutting down because there are too few fighters left.  Getting ready to blow the planet..*"
			gosub :SWITCHBOARD~switchboard
			goto :arm_the_tripmine
			
			
			halt
	else 
	
		:arm_the_tripmine
		
		send "q m*l100* c "
		setVar $SWITCHBOARD~message "Dropped minimal fighters on the planet.  Now it's just a waiting game..*"
		gosub :SWITCHBOARD~switchboard
		
		gosub :PLAYER~quikstats
		if ($PLAYER~CURRENT_PROMPT <> "Citadel")
			setVar $SWITCHBOARD~message "Something went wrong.  Not at citadel prompt.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end

		
		setTextLineTrigger time_to_blow :check " invaded and captured "&$PLANET~PLANET_NAME
		setTextLineTrigger time_to_blow_2 :check_for_blow " of your fighters on planet "&$PLANET~PLANET_NAME
		setTextLineTrigger time_to_blow_3 :check_for_blow_2 " of your Planetary Shields on planet "&$PLANET~PLANET_NAME
		setTextLineTrigger time_to_blow_4 :check_for_blow_3 "Quasar Cannon on "&$PLANET~PLANET_NAME&" blasted"
		pause

		:check
		getWordPos CURRENTANSILINE $pos "[0;32m invaded and captured [1;33m"&$PLANET~PLANET_NAME

		if ($pos <= 0)
			setTextLineTrigger time_to_blow :check " invaded and captured "&$PLANET~PLANET_NAME
			pause
		end
		goto :kaboom
	
		:check_for_blow
		getWordPos CURRENTANSILINE $pos "[0;32m of your fighters on planet [1;33m"&$PLANET~PLANET_NAME

		if ($pos <= 0)
			setTextLineTrigger time_to_blow_2 :check_for_blow_2 " of your fighters on planet "&$PLANET~PLANET_NAME
			pause
		end
		goto :kaboom
		
		:check_for_blow_2
		getWordPos CURRENTANSILINE $pos "[0;32m of your Planetary Shields on planet [1;33m"&$PLANET~PLANET_NAME
		
		if ($pos <= 0)
			setTextLineTrigger time_to_blow_3 :check_for_blow_3 " of your Planetary Shields on planet "&$PLANET~PLANET_NAME
			pause
		end
		goto :kaboom
		
		:check_for_blow_3
		getWordPos CURRENTANSILINE $pos "[0;32m points (atmos)"
		
		if ($pos <= 0)
			setTextLineTrigger time_to_blow_4 :check_for_blow_4 "Quasar Cannon on "&$PLANET~PLANET_NAME&" blasted"
			pause
		end
		goto :kaboom

		:kaboom
			killalltriggers
			send "q z d y j a y j 99999* j a y j 99999* j a y j 99999* j a y j 99999* j a y j 99999**  "
			gosub :PLAYER~quikstats
			
			if ($PLAYER~CURRENT_PROMPT = "Command")
				goSub :SECTOR~getSectorData
				goSub :combat~fastAttack
			else
				send "'"&$SWITCHBOARD~bot_name&" exit*"
				waitFor "Exit Enter"		
			end
			send "'"&$SWITCHBOARD~bot_name&" call*"
	end
	
halt		
	
#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
include "source\bot_includes\combat"

