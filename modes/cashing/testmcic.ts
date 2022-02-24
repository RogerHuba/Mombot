
gosub :BOT~loadVars

loadVar $game~port_max
loadVar $game~ptradesetting
loadVar $game~MAX_PLANETS_IN_GAME
loadVar $bot~Folder
loadVar $PLAYER~SURROUNDFIGS			
loadVar $PLAYER~SURROUNDLIMP			
loadVar $PLAYER~SURROUNDMINE			
loadVar $MAP~STARDOCK	
loadVar $BOT~LIMP_FILE 		
loadVar $BOT~ARMID_FILE 
loadvar $bot~bot_turn_limit
loadvar $BOT~BOT_NAME
loadVar $PLAYER~unlimitedGame


setVar $BOT~help[1]  $BOT~tab&"       Test MCIC - Twarps to Figged ports and tests"
setVar $BOT~help[2]  $BOT~tab&"       "
setVar $BOT~help[3]  $BOT~tab&" testmcic [turns] [param] {limpets}"
setVar $BOT~help[4]  $BOT~tab&"                      "
setVar $BOT~help[5]  $BOT~tab&" [turns]   - stop when turns get to here"
setVar $BOT~help[6]  $BOT~tab&" [param]   - Use select to pick ports to check"
setVar $BOT~help[7]  $BOT~tab&" {limpets} - Jump to limped sectors only"
setVar $BOT~help[8]  $BOT~tab&" "
setVar $BOT~help[9]  $BOT~tab&" Script will auto find more equip and/or fuel"
setVar $BOT~help[10]  $BOT~tab&" However, start with 10-20 eqiup and a few empty holds"


gosub :BOT~helpfile


gosub :player~quikstats
setvar $startcredits $player~credits
setvar $startturns $player~turns
setVar $stat_traded 0
setVar $turns_taken 0
setVar $halt_turns 0
setVar $chkparam ""

setArray $PortsUsed SECTORS

gosub :player~isEpHaggle



if ($player~unlimitedGame = FALSE)
    isNumber $test $bot~parm1
    if ($test)
        setvar $switchboard~message "We will stop when we reach " & $bot~parm1 & " turns.*"
        gosub :switchboard~switchboard
    else
        setvar $switchboard~message "Halt turns must be greater than 0.*"
        gosub :switchboard~switchboard
        halt
    end
    setVar $halt_turns $bot~parm1
else
    setVar $halt_turns 0
    setvar $switchboard~message "Unlimited game - we break for no one!*"
    gosub :switchboard~switchboard
end

if ($bot~parm2 = "") or ($bot~parm2 = 0)
    setvar $switchboard~message "Testing all ports with " & $bot~parm2 & " and no Equipment+ value*"
    gosub :switchboard~switchboard
else
    setVar $chkparam $bot~parm2
    upperCase $chkparam
end

getWordPos $bot~user_command_line $pos "limpets"
	if ($pos > 0)
		setVar $limps TRUE
	else
		setVar $limps FALSE
	end


setVar $startingLocation $PLAYER~CURRENT_PROMPT
if ($startingLocation <> "Command")
    setVar $SWITCHBOARD~message "must be started from Command prompt.*"
    gosub :SWITCHBOARD~switchboard
    halt
end

if (($player~TWARP_TYPE <> 1) and ($player~TWARP_TYPE <> 2))
    setVar $SWITCHBOARD~message "Requires T-Warp as we warp around.*"
    gosub :SWITCHBOARD~switchboard
    halt
end

if (($player~ORE_HOLDS = 0) or ($player~ORGANIC_HOLDS > 0) or ($player~EQUIPMENT_HOLDS > 0) or ($PLAYER~COLONIST_HOLDS > 0))
    setvar $switchboard~message "Fuel in holds only please.*"
    gosub :switchboard~switchboard
    halt
end

if ($player~fighters < 10)
    setvar $switchboard~message "Less than 10 figs - are you mad?*"
        gosub :switchboard~switchboard
        halt
end
send "cuyq"
if ($player~TOTAL_HOLDS < 100)
    setvar $switchboard~message "We have 100+ holds and less than 100k Creds!*"
    gosub :switchboard~switchboard
    halt
else
    if ($player~CREDITS < 100000)
        setvar $switchboard~message "We need at least 100k Creds please!*"
        gosub :switchboard~switchboard
        halt
    end
end



listActiveScripts $scripts
setVar $foundep 0
setVar $a 1
while ($a <= $scripts)
    if ($scripts[$a] = "ephaggle.cts")
        setVar $foundep 1
    end
    add $a 1
end


if ($foundep = 0)
    send "'" $BOT~BOT_NAME " ephaggle*"
end

setDelayTrigger delay :startPause 1000
pause
:startPause

setArray $destinations SECTORS
setVar $desti 0
setArray $destdone SECTORS

echo "**Calculating Destinations"
setVar $i 11
while ($i < SECTORS)

    getSectorParameter $i $chkparam $dosec
    if ($dosec <> "") and ($dosec <> 0)	
        
        getSectorParameter $i "FIGSEC" $figsec
        getSectorParameter $i "LIMPSEC" $isLimped
        if ($figsec = TRUE) and (($limps = FALSE) or ($limps = TRUE and $isLimped = TRUE))

            getSectorParameter $i "EQUIPMENT+" $mcic
echo $i " " $figsec " " $mcic "*"
            if ($mcic = "") or ($mcic = 0)
                add $desti 1
                setVar $destinations[$desti] $i
                setVar $destdone[$desti] 0
            end
        end
    end	

    add $i 1
end

echo "We are visiting " $desti " destinations *"
gosub :player~quikstats

setVar $doNotBReak 1
setVar $nexti 1
setVar $totalDone 0
while ($totalDone < $desti)
    gosub :player~quikstats
    setvar $priorityBuyOre 0
    setVar $priorityBuyEquip 0
    setVar $prioritySellEquip 0
    setVar $empty_holds ($player~total_holds - ($player~ore_holds + $player~organic_holds + $player~equipment_holds + $player~colonist_holds))

    if ($player~ore_holds < 70)
        setvar $priorityBuyOre 1
    end
    if ($player~equipment_holds < 5)
        setVar $priorityBuyEquip 1
    else
        setVar $prioritySellEquip 0
    end

    getNearestWarps $nearArray $player~current_sector 
	setvar $new_target $destination
	setVar $i 1
	while ($i <= $nearArray)
        setVar $goodPort 1
        setVar $nearArray[$i] $focus
        if ($destinations[$focus] = 1) and ($destdone[$focus] = 0)
            if ($priorityBuyOre = 1) and (PORT.BUYFUEL[$focus] = 1)
                setVar $goodPort 0
            end
            if ($priorityBuyEquip = 1) and (PORT.BUYEQUIP[$focus] = 1)
                setVar $goodPort 0
            end
            if ($prioritySellEquip = 1) and (PORT.BUYEQUIP[$focus] = 0)
                setVar $goodPort 0
            end
        end
        if ($goodPort = 1)
            setVar $i 99999
            setVar $goodPort $focus
        end
        add $i 1
    end

    if ($goodPort <= 1)
        setvar $switchboard~message "Ran out of targets, halting!*"
        gosub :switchboard~switchboard
        halt
    else

        setVar $player~warpto $goodPort
		gosub :player~twarp
		if ($player~twarpSuccess = FALSE)
			setVar $SWITCHBOARD~message "Sector missing fig, moving onto next.*"
			gosub :SWITCHBOARD~switchboard
		else
            gosub :player~quikstats
            
            setVar $destdone[$goodPort] 1
           
            setVar $keepquant ($player~equipment_holds - 5)
            setVar $BOT~command "trade"
            setVar $BOT~user_command_line $keepquant & " mcic"
            setVar $BOT~parm1 $keepquant
            setVar $BOT~parm2 "mcic"
            
            saveVar $BOT~parm1
            saveVar $BOT~parm2
            
            saveVar $BOT~command
            saveVar $BOT~user_command_line
            load "scripts\"&$bot~mombot_directory&"\commands\cashing\trade.cts"
         
            setEventTrigger        tradeended        :tradeended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\cashing\trade.cts"
            pause
           
            :tradeended
                killalltriggers
                gosub :player~quikstats
                add $totalDone 1
		end
		
    end
    add $doNotBReak 1
    if ($doNotBReak > 20000)
        #it broke!
        setVar $totalDone 99999
    end
end

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"

include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\moveintosector\player"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\isephaggle\player"

