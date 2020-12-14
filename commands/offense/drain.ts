gosub :BOT~loadVars

	setVar $BOT~help[1]   $BOT~tab&"- drain {lll} {it n} {evac ship}" 
	setVar $BOT~help[2]   $BOT~tab&"    Utility Script for Draining Cannons" 
	setVar $BOT~help[3]   $BOT~tab&"    " 
	setVar $BOT~help[4]   $BOT~tab&"    lll  la la lannnddd  - Sends L alot, no scanners! "
	setVar $BOT~help[5]   $BOT~tab&"    it   >drain it     - Lifts once and lands quickly" 
	setVar $BOT~help[6]   $BOT~tab&"         >drain it {n} - Lifts n times with short pause between" 
	setVar $BOT~help[6]   $BOT~tab&"         >drain it {n} speed - Lifts n times no pauses" 
	setVar $BOT~help[7]   $BOT~tab&"    evac ship    "  
	setVar $BOT~help[8]   $BOT~tab&"         >drain evac 23 - Lifts and attempts to xport to ship 23 " 
	

	gosub :bot~helpfile

    if ($bot~parm1 = "lll")
        goSub :lalaland
    end

    if ($bot~parm1 = "it")
        goSub :drainit
    end

    if ($bot~parm1 = "evac")
        goSub :evac
    end


    halt
	gosub :player~quikstats
	setVar $startingLocation $player~CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		setvar $switchboard~message "Must start from Citadet*"
        gosub :SWITCHBOARD~switchboard
		halt
	end
    
    if ($bot~parm1 = "")
        setvar $switchboard~message "Must supply a photon bot*"
        gosub :SWITCHBOARD~switchboard
    end
    setVar $photonBot $bot~parm1

    if ($$bot~parm2 <> "")
        isNumber $test $bot~parm2
        if ($test)
            setVar $victimPlanet $bot~parm2
        else
            setVar $victimPlanet 0
        end
    end

:evac
    if ($$bot~parm2 <> "")
        isNumber $test $bot~parm2
        if ($test)
            setVar $xportShip $bot~parm2
            if ($xportShip < 1)
                 setvar $switchboard~message "Must supply a positive ship num*"
                gosub :SWITCHBOARD~switchboard
                halt
            end
        else
            setvar $switchboard~message "Must supply a ship num*"
            gosub :SWITCHBOARD~switchboard
            halt
        end
    else
        setvar $switchboard~message "Must supply a ship num*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
    
    send "r x " $xportShip "* * l * "

    halt
return
:drainit

    if ($$bot~parm2 <> "")
        isNumber $test $bot~parm2
        if ($test)
            setVar $drainItTimes $bot~parm2
            if ($drainItTimes = 0)
                setVar $drainItTimes 1
            end
        else
            setVar $drainItTimes 1
        end
    end

    setVar $speed 0
    if ($bot~parm3  = "speed")
        setVar $speed 1

    end
    gosub :player~quikstats
    setVar $hitPoints ($player~fighters + $player~shields)
    setVar $startSector $player~CURRENT_SECTOR
	setVar $startingLocation $player~CURRENT_PROMPT

    setTextLineTrigger failedToLand :failedToland "Do you want instructions (Y/N) [N]?"
    setTextTrigger landedGoodOrBad :landedGoodOrBad "Planet command (?=help) [D]"
    setVar $i 1
    while ($i <= $drainItTimes)
        send "r l * z *"
        if ($i <> $drainItTimes)
            if ($speed = 0)
                setDelayTrigger smallDelay :smallDelay 125
                pause
                :smallDelay
                    killtrigger smallDelay
            else
                setDelayTrigger tinyDelay :tinyDelay 5
                pause
                :tinyDelay
                    killtrigger tinyDelay
            end
        else
            send "^q"
            setTextLineTrigger drainItEnd :drainItEnd "ENDINTERROG"
            pause
        end
        add $i 1
    end

    :drainItEnd 
    gosub :player~quikstats
    
    setVar $hitPointsNow ($player~fighters + $player~shields)
    setVar $damageTaken ($hitPoints - $hitPointsNow)
    setVar $report "[Sec:" & $player~CURRENT_SECTOR & " HP:" & $hitPointsNow & "]"
    setvar $switchboard~message $report & "Finished draining - took " & $damageTaken & " points of damage.*"
    gosub :SWITCHBOARD~switchboard
    
    halt

    :failedToland
        killalltriggers
        
        # planet has either gone or we have been moved to a sector with many planets
        send "d* "
        waitfor "Sector  :"
        setVar $textout CURRENTLINE
        getWord $textout $startSector 3
        setTextTrigger end_of_lines2 :end_of_lines2 "Command [TL="
        setTextLineTrigger parse_scan_line2 :parse_scan_line2
        pause
        :parse_scan_line2
        
        killtrigger parse_scan_line2
        setvar $textout $textout & "*" & CURRENTLINE
        setTextLineTrigger parse_scan_line2 :parse_scan_line2
		pause

        :end_of_lines2
   
            setvar $switchboard~message $textout&"*"
            gosub :SWITCHBOARD~switchboard

        send "l"
        setTextLineTrigger landNoPlanet :landNoPlanet "There isn't a planet in this sector."
        setTextLineTrigger landPickOne :landPickOne "Registry# and Planet Name"
        setTextTrigger landOneAgain :landOneAgain "Option? (A,I,R,?):?"
        setTextLineTrigger landBlocked :landBlocked "blocks your attempt to enter orbit"
        pause
        :landNoPlanet
            setvar $switchboard~message "No planet in sector anymore! Help?*"
            gosub :SWITCHBOARD~switchboard
            halt
        :landOneAgain 
            setvar $switchboard~message "Planet dissappeared but it's back we are on attack prompt*"
            gosub :SWITCHBOARD~switchboard
            halt
        :landBlocked
            setvar $switchboard~message "Blocked from landing!! helllpppp*"
            gosub :SWITCHBOARD~switchboard
            halt
        :landPickOne 
            setTextLineTrigger firstPlanet :firstPlanet "<"
            pause
            :firstPlanet
                killalltriggers
                cutText CURRENTLINE $rawID 1 9
                stripText $rawID ">"
                stripText $rawID "<"
                stripText $rawID " "
                send "'trying to land on " $rawID "*"
                send $rawID "*z*"
                setTextLineTrigger landBlocked2 :landBlocked2 "blocks your attempt to enter orbit"
                setTextTrigger landOneAgain2 :landOneAgain2 "Option? (A,I,R,?):?"
                pause
                :landBlocked2 
                    send "'Blocked again - xport me or saveme please*!"
                    halt
                :landOneAgain2
                    killalltriggers
                    gosub :player~quikstats
                    if ($startSector <> $player~CURRENT_SECTOR)
                        send "'Attempted to land, in different sector, assume in pod!*"
                        halt
                    else
                        send "'made it back onto planet*"
                        halt
                    end

    halt
    :landedGoodOrBad
        send "'Good or bad - we are on a planet*"
        halt


    halt
return
:lalaland
    gosub :player~quikstats
    setVar $hitPoints ($player~fighters + $player~shields)
    setVar $startSector $player~CURRENT_SECTOR
	setVar $startingLocation $player~CURRENT_PROMPT

	if ($startingLocation <> "Command")
		setvar $switchboard~message "Must start from Command Prompt*"
        gosub :SWITCHBOARD~switchboard
		halt
	end

    if ($player~PLANET_SCANNER = "Yes")
        setvar $switchboard~message "Planet Scanners not allowed*"
        gosub :SWITCHBOARD~switchboard
		halt
    end
    setVar $count 0

    setTextTrigger landed :landed "Option? (A,I,R,?):?"
    setTextLineTrigger secCheck :secCheck "Shlds"

    :another10
    send "l * "
    setDelayTrigger 10sec :10sec 10

        pause
        :10sec
            killtrigger another10 
            add $count 1
            if ($count > 100)
                send "/"
                setVar $count 0
            end
            goto :another10
        :secCheck
            setVar $line2 CURRENTLINE
            replacetext $line2 #179 " "
            getWord $line2 $sec 2
echo "CURRENTSECTOR#" $sec "#"
            if ($sec <> $startSector)
                setvar $switchboard~message "Sector Change!!! Probably Dead!! Help!*"
                gosub :SWITCHBOARD~switchboard
                halt

            end
            setTextLineTrigger secCheck :secCheck "Shlds"
            pause
        :landed
            killalltriggers
            
            goSub :player~quikstats
            setVar $hitPointsNow ($player~fighters + $player~shields)
            setVar $damageTaken ($hitPoints - $hitPointsNow)
            setVar $report "[Sec:" & $player~CURRENT_SECTOR & " HP:" & $hitPointsNow & "]"
            setvar $switchboard~message $report & "We've landed taking " & $damageTaken & " points of damage.*"
            gosub :SWITCHBOARD~switchboard
      
    halt
return
    


    #INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipstats\ship"
