 gosub :BOT~loadVars

	setVar $BOT~help[1]   $BOT~tab&"  unloader [TraderName] [planetnum] [delay] {attack} {reland}" 
	setVar $BOT~help[2]   $BOT~tab&"  Attempts to land on planet when TraderName lifts " 
	setVar $BOT~help[3]   $BOT~tab&"  and shoots at person on Reloader.   " 
	setVar $BOT~help[4]   $BOT~tab&"  "
	setVar $BOT~help[5]   $BOT~tab&"  [TraderName] - Person using CitCap Onshot" 
	setVar $BOT~help[6]   $BOT~tab&"  [planetnum]  - Planet to attempt to land on" 
	setVar $BOT~help[7]   $BOT~tab&"  [delay]      - Trigger pause test per game + num ships" 
	setVar $BOT~help[8]   $BOT~tab&"                 Ping 50: 60 1 ship, 70 2 ship. 100 5ship" 
	setVar $BOT~help[9]   $BOT~tab&"  {attack}     - Attack planet figs?" 
    setVar $BOT~help[10]  $BOT~tab&"  {reland}     - Reland and refurb on origin planet" 
	setVar $BOT~help[11]  $BOT~tab&"  {reset}      - Attemps, Attacks and Resets for repeat." 
	
	gosub :bot~helpfile

	setVar $BOT~script_title "Unload on the planet below the Reloader"
	gosub :BOT~banner
    loadVar $GAME~LATENCY

    gosub :player~quikstats
	gosub :player~getInfo
    setVar $startingLocation $player~current_prompt
    setVar $startingShipType $player~SHIP_TYPE
    echo "SHIP_TYPE " $player~SHIP_TYPE "*"
    echo "SHIP_TYPE " $player~SHIP_TYPE "*"
    
    if ($startingLocation <> "Citadel")
		setvar $switchboard~message "Citadel Capper must be run from the Citadel Prompt*"
		gosub :switchboard~switchboard
		halt
	end


    if ($bot~parm1 <> '')
        setVar $followTrader $bot~parm1
    else
        setvar $switchboard~message "Please Specify the Trader you will follow.*"
		gosub :switchboard~switchboard
		halt
    end

    isNumber $test $bot~parm2
	if ($test)
		if ($bot~parm2 > 0)
			setVar $planetTarget $bot~parm2
		end
	else
        setvar $switchboard~message "Please select planet number you will land on.*"
		gosub :switchboard~switchboard
		halt

    end
    isNumber $test $bot~parm3
	if ($test)
		if ($bot~parm3 > 0)
			setVar $shotDelay $bot~parm3
		end
	else
        setvar $switchboard~message "Please put in a latency.*"
		gosub :switchboard~switchboard
		halt

    end

    setVar $switchboard~message "Unloading on planet " & $planetTarget & ", following " & $followTrader & "*"

    getWordPos $bot~user_command_line $pos "attack"
	if ($pos > 0)
		setVar $attack TRUE
        setVar $switchboard~message $switchboard~message & "We will unload all figs on planet*" 
	else
		setVar $attack FALSE
	end

    getWordPos $bot~user_command_line $pos "reland"
	if ($pos > 0)
		setVar $reland TRUE
        setVar $switchboard~message $switchboard~message & "Reland and rearm post attack*" 
	else
		setVar $reland FALSE
	end

    getWordPos $bot~user_command_line $pos "reset"
	if ($pos > 0)
		setVar $reland TRUE
        setVar $attack TRUE
        setVar $reset TRUE
        setVar $switchboard~message $switchboard~message & "Will reset and attack again*" 
	else
		setVar $reset FALSE
	end

    gosub :player~quikstats
	setVar $player~startingLocation $player~current_prompt
	
    gosub :ship~getShipStats
    # ship~SHIP_MAX_ATTACK
	send "q m * * * "
	gosub :planet~getPlanetInfo
   
    gosub :switchboard~switchboard
	send "c  "
     gosub :player~quikstats
    setVar $ourplanet $planet~planet
    setVar $landingMac ""
    setVar $i 1
    while ($i <= 100)
        setVar $landingMac $landingMac & "l " & $planetTarget & "* "
        add $i 1
    end
    
    if ($attack = TRUE)
       
        #setVar $landingMac $landingMac & "*a z " & $ship~SHIP_MAX_ATTACK & "**a z " & $ship~SHIP_MAX_ATTACK & "**"
        #setVar $landingMac $landingMac & "a z " & $ship~SHIP_MAX_ATTACK & "**a z " & $ship~SHIP_MAX_ATTACK & "**"
        #setVar $landingMac $landingMac & "a z " & $ship~SHIP_MAX_ATTACK & "**a z " & $ship~SHIP_MAX_ATTACK & "**"
    
    end
    setVar $landingMac $landingMac & "l j"&#8&$ourplanet&"* j c * @ "

    if ($reland = TRUE)
        setVar $relandMac "z r * l j"&#8&$ourplanet&"*  m * * * c "
    end

:resetRetrigger
	killalltriggers
	gosub :player~quikstats
	setTextLineTrigger 	followTraderLift 	:followTraderLift 	$followTrader&" lifts off from"
	setDelayTrigger cancelScript :cancelScript 600000
    pause
    :cancelScript
        killalltriggers
        setvar $switchboard~message "Unloader has timed out waiting for attacker!*"
		gosub :switchboard~switchboard
        halt
    :followTraderLift
        killalltriggers
        send "q q q *"


    setTextLineTrigger 	attemptLand 	:attemptLand 	$followTrader&" is powering up weapons systems!"
    setDelayTrigger cancelLand :cancelLand 500
    pause
    :cancelLand
        killalltriggers
        send "* * l j"&#8&$ourplanet&"* j c * ^q"
        setvar $switchboard~message "Unloader didn't see attack message.*"
		
        if ($reset = TRUE)
            setvar $switchboard~message $switchboard~message & ", reseting.*"
            gosub :switchboard~switchboard
            goto :resetRetrigger
        else
            setvar $switchboard~message $switchboard~message & ", exiting.*"
            gosub :switchboard~switchboard
            halt
        end
    :attemptLand
        killalltriggers
        setDelayTrigger shotPause :shotPause $shotDelay
        pause
        :shotPause
            send $landingMac
            killalltriggers

            #send $targetString
            setTextTrigger 		invadeShields 		:keepInvading 		"You have to destroy the fighters defending the planet to land." 
            setTextTrigger 		invadeContinue 		:shieldInvade 		"You have to destroy the Planetary Shields defending the planet to land." 
            setTextTrigger 		invadeDone     		:Invaded 		"<Destroy Planet>"
            #setTextTrigger  	blockedInvade		:blockedInvading 	"Do you want instructions (Y/N)"
            setTextLineTrigger      noPlanet                :noPlanetToInvade       "Invalid registry number, landing aborted."
            setTextLineTrigger	invadequick		:Invaded		"  Item    Colonists  Colonists    Daily     Planet      Ship      Planet"
            setTextLineTrigger	noland			:doneInvading		"since it couldn't possibly stand the stress of landing."
            setTextLineTrigger      invadePod               :destroyedWhile         "Average Interval Lag:"
            pause
            :destroyedWhile
                killalltriggers
                gosub :player~quikstats
                if ($player~SHIP_TYPE <> $startingShipType)
                    setvar $switchboard~message "Podded while attempting unloader, what did you really expect? Calling saveme in case I am not safely back on the planet.*"
                    gosub :switchboard~switchboard
                    halt
                elseif ($player~current_prompt <> "Citadel")
                    setvar $switchboard~message "I'm not at the citadel, attempting to land and halting*"
                    gosub :switchboard~switchboard
                    send "q q q * * * * " $relandMac
                     goto :doneInvading
                else
                    setvar $switchboard~message "Did not land this attempt.*"
                    gosub :switchboard~switchboard
                    send "q m * * * * c "
                    waitfor "<Enter Citadel>"
                     if ($reset = TRUE)
                        goto :resetRetrigger
                    else
                        halt
                    end
                end
            :noPlanetToInvade
                killalltriggers
                setvar $switchboard~message "Planet number entered is not in this sector.*"
                goto :doneInvading
            :shieldInvade
                killalltriggers
                gosub :player~quikstats
                setVar $damageTaken ($ship~SHIP_FIGHTERS_MAX-$player~FIGHTERS)
                setvar $switchboard~message ""&$damageTaken&" points of damage taken from quasar cannon*"
                setVar $player~FIGHTERS ($player~FIGHTERS-$damageTaken)
                if ($player~FIGHTERS <= 0)
                    goto :invadeRefurb
                end
                
                while ($player~FIGHTERS > 0)
                    if ($player~FIGHTERS >= $ship~SHIP_MAX_ATTACK)
                        setVar $attackString $attackString&"z a "&$ship~SHIP_MAX_ATTACK&"* * "
                        subtract $player~FIGHTERS $ship~SHIP_MAX_ATTACK
                    else
                        setVar $attackString $attackString&"z a "&$player~FIGHTERS&"* * "
                        setVar $player~FIGHTERS 0
                    end
                end
                send $attackString
                
                goto :invadeRefurb
            :keepInvading
                killalltriggers
                gosub :player~quikstats
                
                setVar $attackString ""
                while ($player~FIGHTERS > 0)
                    if ($player~FIGHTERS >= $ship~SHIP_MAX_ATTACK)
                        setVar $attackString $attackString&"z a "&$ship~SHIP_MAX_ATTACK&"* * "
                        subtract $player~FIGHTERS $ship~SHIP_MAX_ATTACK
                    else
                        setVar $attackString $attackString&"z a "&$player~FIGHTERS&"* * "
                        setVar $player~FIGHTERS 0
                    end
                end
                send $attackString
                gosub :player~quikstats
                if ($player~FIGHTERS > 0)
                    gosub :claimOrDestroyPlanet
                    goto :doneInvading
                else
                    setvar $switchboard~message "I launched " & $player~FIGHTERS & " at the planet.*"
                end
                
            :invadeRefurb

                killalltriggers
                send $relandMac
               
                gosub :player~quikstats
                if ($reset = TRUE)
                    goto :resetRetrigger
                end
            goto :doneInvading

            :Invaded
                killalltriggers
                gosub :claimOrDestroyPlanet
            :doneInvading
                killalltriggers
                send "q q q q * "&$relandMac&"C "
                
                setvar $switchboard~message "Something good or bad happened, halting Unloader.*"
                gosub :switchboard~switchboard
                halt

            :claimOrDestroyPlanet
                if ($zdy)
                    if ($player~FIGHTERS > 1000)
                        send "z a y "&($player~FIGHTERS-1000)&"* * Z D Y"
                    else
                        send "z d y "
                    end
                    setvar $switchboard~message "Invaded and attempting to blow planet, check for pods!*"
                else
                    send "* * * o z c * c v y q q "
                    setvar $switchboard~message "Invaded and claiming planet, attempting to evict all from citadel, check for people to kill!*"
                end
                gosub :switchboard~switchboard
            halt
            

    :finishUnloader


    halt



    #INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\ship\loadshipinfo\ship"
include "source\bot_includes\ship\getshipcapstats\ship"
include "source\bot_includes\sector\getsectordata\sector"