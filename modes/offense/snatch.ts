	
	setVar $targetPlanet 0
	setVar $invasionBots 0
	setVar $wavesMacro ""
	setVar $waves 0
	setVar $figsperwave 9999
	gosub :BOT~loadVars

	

    setVar $BOT~help[1]  $BOT~tab&"snatch {invasion_bots} {waves} {wavesize}*"
	setVar $BOT~help[2]  $BOT~tab&""
	setVar $BOT~help[3]  $BOT~tab&"{invasion_bots} - Designated Callin name of bots"
	setVar $BOT~help[4]  $BOT~tab&"                  Default: invaders"
	setVar $BOT~help[5]  $BOT~tab&"{waves}         - number of waves to fire once landing "
	setVar $BOT~help[6]  $BOT~tab&"                  on planet. Default: None"
	setVar $BOT~help[7]  $BOT~tab&"{wavesize}      - number of figs in wave. Def: 9999*"
	setVar $BOT~help[8]  $BOT~tab&""
	setVar $BOT~help[9]  $BOT~tab&"Lifts, checks for planets next door, fires photon"
	setVar $BOT~help[10]  $BOT~tab&"and sends your friends in to share the good news."
    setVar $BOT~help[11]  $BOT~tab&"Friends should have no planet scanners."


	gosub :bot~helpfile

	setVar $BOT~script_title "Planet Snatcher"
	gosub :BOT~banner
	
		
	setvar $directAction 1

	getWord $bot~user_command_line $bot~parm1 1
	getWord $bot~user_command_line $bot~parm2 2
	getWord $bot~user_command_line $bot~parm3 3
	getWord $bot~user_command_line $bot~parm4 4

	
   
    if ($bot~parm1 <> 0)
        setVar $invasionBots $bot~parm1
    else
        setVar $invasionBots "invaders"
    end

    if ($bot~parm2 <> 0)
        isNumber $test $bot~parm2
        if ($test)
            if ($bot~parm2 < 6)
                setVar $waves $bot~parm2
                if ($bot~parm3 <> 0)
                    isNumber $test $bot~parm3
                    if ($test)
                        setVar $figsperwave $bot~parm3
                    else
                        setVar $SWITCHBOARD~message "Figs per wave should be a number*"
                        gosub :SWITCHBOARD~switchboard
                        halt
                    end
                else
                    setVar $figsperwave 9999
                end
                setVar $i 1
                while ($i <= $waves)
                    setVar $wavesMacro $wavesMacro & "a z " & $figsperwave & " ^M ^M "
                    add $i 1
                end

            else
                setVar $SWITCHBOARD~message "Max Waves of 5 please*"
                gosub :SWITCHBOARD~switchboard
                halt
            end
        else
            setVar $SWITCHBOARD~message "Waves should be a number*"
            gosub :SWITCHBOARD~switchboard
            halt
        end
    end
		
	
	gosub :player~quikstats
	

	setVar $startingLocation $player~CURRENT_PROMPT
	setVar $bot~validPrompts "Citadel"
	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "Start from the Citadel Prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt

	end
	
    if ($player~PHOTONS < 1)
        setVar $SWITCHBOARD~message "Need a photon.*"
		gosub :SWITCHBOARD~switchboard
		halt

    end
	send "'" $SWITCHBOARD~bot_name " login*"
	waitfor "Type corporate message"

	
	
	setVar $invasion_mac " mac Q Q m SECTOR ^m n n z ^M a  z 9999 ^m a z 9999 ^m ^m ^m ^m ^m z ^m l^mn n ^m ^m " & $wavesMacro &" *"

	setVar $invasions_bots_macro "'" & $invasionBots &  $invasion_mac


    setVar $dropSector 0
    goSub :doScan

    if ($dropSector > 0)
        replaceText $invasions_bots_macro "SECTOR" $dropSector
	    send $invasions_bots_macro
        send "cpy" $dropSector "*q"
    else
         setVar $SWITCHBOARD~message "No Targets*"
		gosub :SWITCHBOARD~switchboard
    end

halt
:doScan
    send "q"
	gosub :planet~getplanetinfo


    send "q shl" $planet~PLANET "* c"
    setVar $hlook 0
    setVar $sectorPass 0
    
    :hwait
    setTextLineTrigger hstart :hstart "Select (H)olo Scan or (D)ensity Scan or (Q)uit? [D]"
    setTextLineTrigger hsector :hsector "Sector  :"
    setTextLineTrigger hplanets :hplanets "Planets :"
    setTextLineTrigger hend :hend "Warps to Sector(s) :"
    pause
    :hstart
        killalltriggers 
        setVar $hlook 1
        goto :hwait
    :hsector
        killalltriggers
        getWord CURRENTLINE $chkSec 3

        
        if ($chkSec > 10) and ($chkSec <> STARDOCK) and ($chkSec <> $player~current_sector)
            setVar $sectorPass 1
        else
            setVar $sectorPass 0
        end
        goto :hwait
    :hplanets
        killalltriggers
        
        if ($sectorPass = 1)
            setVar $dropSector $chkSec
            goto :TargetFound
        else
            goto :hwait
        end

    :hend

    :TargetFound

return



include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
