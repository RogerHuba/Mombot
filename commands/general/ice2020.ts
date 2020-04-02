gosub :BOT~loadVars


setVar $BOT~help[1]  $BOT~tab&"    ice2020 [command]"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&"    setdora   - Preps for Dora and gets out safely."
setVar $BOT~help[4]  $BOT~tab&"    stripcash - strips cash from corp mates (11k+ req)"
setVar $BOT~help[5]  $BOT~tab&"    buydora   - Buys and setsup Merchie for trading "
setVar $BOT~help[6]  $BOT~tab&"    swapore   - Swaps or with specified ship (gtorp req)"
setVar $BOT~help[7]  $BOT~tab&"                 >ice2020 swapore [shipnum]"
setVar $BOT~help[8]  $BOT~tab&"    buycolt   - buys Colt transPORT "
setVar $BOT~help[9]  $BOT~tab&"    movecolt  - moves Colts to sectors  "
setVar $BOT~help[10]  $BOT~tab&"                  >movecolt [sec1] [sec2] [sec3=3]"
setVar $BOT~help[11] $BOT~tab&"    grabcolos - Tows colt to terra, loads with cols, returns "
setVar $BOT~help[12] $BOT~tab&"    safeexit  - Takes starter ship with ore, buys twarp ship "
setVar $BOT~help[13] $BOT~tab&"                to tow merchie out for trading"
setVar $BOT~help[14] $BOT~tab&"                 >ice2020 safeexit [merchship]"
setVar $BOT~help[15] $BOT~tab&"    docim     - downloads port/warp data "
setVar $BOT~help[16] $BOT~tab&"    runtrade  - cim - figs - tradereport "
setVar $BOT~help[17] $BOT~tab&"    backup    - fMow to dock > swap ore to twarp ship"
setVar $BOT~help[18] $BOT~tab&"    xbust     - Evil player xports to Colt Transport"
setVar $BOT~help[19] $BOT~tab&"                at dock, tbusts, xports back"
setVar $BOT~help[20] $BOT~tab&"                 >ice2020 xbust [exp_needed] [shipnum]"
setVar $BOT~help[21] $BOT~tab&"    sellship  - Sells current ship and jumps in scout"
setVar $BOT~help[22] $BOT~tab&"    atm [bot] - Pause Dora and get cash from [bot]"

gosub :bot~helpfile

setVar $BOT~script_title "ICE2020 Utilities"
setVar $pod #42 & #42 & #42 & " Escape Pod " & #42 & #42 & #42

# should be san
setVar $wallBot "san"
gosub :BOT~banner

# someone might run a script to blow all plants at dock
# this will ask someone to counter that 
#  i.e. they load up with g-torps and unload just as you swap
#  and hopefully you can swap
setVar $planetKillerCounter 1
setVar $doCrazyAlign 0

#goSub :safeexit


if ($bot~parm1 = "crazymow")
    goSub :crazyStart
    halt
end


if ($bot~parm1 = "xbust")
    goSub :xbust
    halt
end

if ($bot~parm1 = "backup")
    gosub :backup
    halt
end

if ($bot~parm1 = "fullstart")
    gosub :player~quikstats
    setVar $ogiginalShip $player~SHIP_NUMBER
    
    if ($bot~parm2 <> "skipback")
        
        gosub :backup
       
    else
        getInput $ogiginalShip "Enter the ship number of the Merch you started in (we will sell it)"
    end
    send "tt.**q"
    waitfor "CMS link terminated"
    goSub :fullstart
    halt
end

if ($bot~parm1 = "safeexit")
	gosub :safeexit
	halt
end

if ($bot~parm1 = "sellship")
    goSub :sellship
    halt
end

if ($bot~parm1 = "setdora")
	gosub :setDora
	halt
end

if ($bot~parm1 = "swapore")
	gosub :swapore
	halt
end


if ($bot~parm1 = "atm")
    goSub :getAtm
	halt
end


if ($bot~parm1 = "stripfig")
    
    if ($bot~parm2 <> "")
		isnumber $isanumber $bot~parm2
		if ($isanumber <> true)
			setVar $SWITCHBOARD~message "Please specify the total figs required (yours + strip amount)*"
			gosub :switchboard~switchboard
			HALT
		end
		setVar $figsRequired $bot~parm2
        
    else
        setVar $SWITCHBOARD~message "Please specify the total figs required (yours + strip amount).*"
        gosub :switchboard~switchboard
        HALT
	end

    gosub :player~quikstats
	gosub :stripfig
	halt
end

if ($bot~parm1 = "stripcash")
    
    if ($bot~parm2 <> "")
		isnumber $isanumber $bot~parm2
		if ($isanumber <> true)
			setVar $SWITCHBOARD~message "Please specify the total cash required (yours + strip amount)*"
			gosub :switchboard~switchboard
			HALT
		end
		setVar $cashRequired $bot~parm2
        
    else
        setVar $SWITCHBOARD~message "Please specify the total cash required (yours + strip amount).*"
        gosub :switchboard~switchboard
        HALT
	end

    gosub :player~quikstats
	gosub :stripcash
	halt
end

if ($bot~parm1 = "runtrade")
	gosub :runtrade
	halt
end


if ($bot~parm1 = "buydora")
	gosub :buydora
	halt
end

if ($bot~parm1 = "docim")
	gosub :docim
	halt
end

if (($bot~parm1 = "buycolt") or ($bot~parm1 = "buycolts"))
	gosub :buycolt
	halt
end

if (($bot~parm1 = "movecolt") or ($bot~parm1 = "movecolts"))
	gosub :movecolt
	halt
end

if (($bot~parm1 = "grabcolo") or ($bot~parm1 = "grabcolos"))
	gosub :grabcolos
	halt
end

setVar $SWITCHBOARD~message "I'll do a lot.. but not that.*"
gosub :switchboard~switchboard
halt
halt

:xbust
    gosub :player~quikstats
	setVar $location $player~current_prompt
	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Start from Command Prompt.*"
		gosub :switchboard~switchboard
		HALT
	end

    setVar $expWanted $bot~parm2
    setVar $starDockShip $bot~parm3
    setVar $startShip $player~SHIP_NUMBER

    isNumber $test $expWanted
    if ($test <> true)
        setVar $SWITCHBOARD~message "Experience should be a number from 1001 - 10000*"
		gosub :switchboard~switchboard
		HALT
    end

    isNumber $test $starDockShip
    if ($test <> true)
        setVar $SWITCHBOARD~message "Ship should be a number from 1 - 1000*"
		gosub :switchboard~switchboard
		HALT
    end
    setVar $msg ""
    if (($starDockShip > 200) and ($expWanted < 1000))
        setVar $msg "Ship and Exp params around wrong way, swapping*"
        setVar $temp $expWanted
        setVar $expWanted $starDockShip
        setVar $starDockShip $temp
    elseif ($expWanted < 1001)
        setVar $SWITCHBOARD~message "Experience wanted should be more than 1000*"
		gosub :switchboard~switchboard
		HALT
    elseif ($starDockShip > 200)
        setVar $SWITCHBOARD~message "Stardock Ship should be less than 200*"
		gosub :switchboard~switchboard
		HALT
    end

    setVar $msg $msg&"Xport Ship: " & $starDockShip & " Exp Wanted: " & $expWanted & "*"
    setVar $SWITCHBOARD~message $msg
    gosub :switchboard~switchboard

    setVar $current_exp $player~Experience
    setVar $exp_needed ($expWanted - $current_exp)

    if ($exp_needed <= 0)
        setVar $SWITCHBOARD~message "You've already got enough exp! My work here is done!*"
		gosub :switchboard~switchboard
		HALT

    end
    
     # 525000 gets 1125 exp - which is like 460 creds per exp - we will round up to 500
    setVar $dollarsPerExp 500
    setVar $dollarsNeeded ($exp_needed * $dollarsPerExp)
    add $dollarsNeeded 20000
    
    if ($player~CREDITS < $dollarsNeeded)
        setVar $SWITCHBOARD~message "Short on Credits. Estimate we need:" & $dollarsNeeded & " att 500k creds per 1k exp.*"
		gosub :switchboard~switchboard
		HALT

    end

    echo "Dollars Needed:"  $dollarsNeeded " Creds:" $player~CREDITS " Exp Needed:" $exp_needed "*"
    
    if (($player~ALIGNMENT >= 0) or ($player~current_sector = $map~stardock))
        setVar $SWITCHBOARD~message "We need to be away from dock, and evil..*"
		gosub :switchboard~switchboard
		HALT
    end
    
    setVar $xportShipFound 0
    send "x**"
    setTextLineTrigger myXportRange :myXportRange " has a transport range of"
    pause
    :myXportRange
         killalltriggers
         getText CURRENTLINE $myXportRange "transport range of " " hops."

    :xBustMoreShips
    setTextLineTrigger xBustShipListDone :xBustShipListDone "<I> Ship details"
    setTextLineTrigger xBustShipListNone :xBustShipListNone "You do not own any other ships!"
    setTextLineTrigger xBustNoShipList :xBustNoShipList ""
    pause
        :xBustNoShipList 
            killAllTriggers
            getWord CURRENTLINE $shipNum 1
            if ($shipNum = $starDockShip)
                setVar $xportShipFound 1
                getWord CURRENTLINE $sectorNum 2
                cutText CURRENTLINE $xportShipType 56 18
                echo "#" $xportShipType "#*"
                echo "#" $xportShipType "#*"
                echo "#" $xportShipType "#*"
                goto :xBustShipListNone
            end
            goto :xBustMoreShips
        :xBustShipListDone 
        :xBustShipListNone 
        killAllTriggers
    if ($xportShipFound = 0)
        setVar $SWITCHBOARD~message "Could not locate ship at Stardock*"
		gosub :switchboard~switchboard
		HALT
    else
        if ($sectorNum <> $MAP~StarDock)
            setVar $SWITCHBOARD~message "Found the ship but it's not at dock!*"
            gosub :switchboard~switchboard
            HALT
        end
        if ($xportShipType <> "Colonial Transport")
            setVar $SWITCHBOARD~message "Needs to be a Colonial Transport*"
            gosub :switchboard~switchboard
            HALT
        end
    end

    send "cf*" $MAP~StarDock "*q"
    setTextLineTrigger xBustfirstPlot :xBustfirstPlot "The shortest path"
    pause
    :xBustfirstPlot
        killAllTriggers
        getWord CURRENTLINE $range1 4
        STRIPTEXT $range1 "("

    send "cf" $MAP~StarDock "*" $PLAYER~CURRENT_SECTOR "*q"
    setTextLineTrigger xBustSecondPlot :xBustSecondPlot "The shortest path"
    pause
    :xBustSecondPlot
        killAllTriggers
        getWord CURRENTLINE $range2 4
        STRIPTEXT $range2 "("
    echo $range1 "#" $range2 "*"

    if ($range1 > $myXportRange)
        setVar $SWITCHBOARD~message "XPort range of my current ship won't make it to dock*"
        gosub :switchboard~switchboard
        HALT
    end

    if ($range2 > 20)
        setVar $SWITCHBOARD~message "XPort range back is longer than 20 - Colt won't make it*"
        gosub :switchboard~switchboard
        HALT
    end

    :FirstXport
    send "x " & $starDockShip & "* q p s "
    waitfor "<StarDock> Where to? (?=Help)"


    setVar $BOT~command "tbust"
    setVar $BOT~user_command_line " tbust " & $expWanted
    setVar $BOT~parm1 $expWanted
    setVar $BOT~parm2 ""
    setVar $BOT~parm3 ""
    
    saveVar $BOT~parm1
    saveVar $BOT~parm2
    saveVar $BOT~parm3
    saveVar $BOT~command
    saveVar $BOT~user_command_line
    load "scripts\"&$bot~mombot_directory&"\modes\cashing\tbust.cts"
    setEventTrigger		xbustTbustEnd		:xbustTbustEnd "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\cashing\tbust.cts"
    pause
    :xbustTbustEnd
    killalltriggers
    send "q x* " & $startShip & "* q"
halt
return

:safeexit
  

    gosub :player~quikstats
	setVar $location $player~current_prompt
	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Start from Command Prompt.*"
		gosub :switchboard~switchboard
		HALT
	end
    if ($bot~parm2 <> "")
		isnumber $isanumber $bot~parm2
		if ($isanumber <> true)
			setVar $SWITCHBOARD~message "Ship number needs to be a number, fancy that?*"
			gosub :switchboard~switchboard
			HALT
		end
		setVar $towShipNum $bot~parm2
        
    else
        setVar $SWITCHBOARD~message "Please specify ship num >ice2020 swapore [shipnum].*"
        gosub :switchboard~switchboard
        HALT
	end

    if ($player~ore_holds < 30)
        setVar $SWITCHBOARD~message "We need at least 30 units of ore to get range*"
		gosub :switchboard~switchboard
        halt
    end

    setVar $foudShip 0
    send "w"
    setTextTrigger towManned :towManned "Do you wish to tow a manned ship? (Y/N)"
    setTextLineTrigger towAlready :towAlready "You shut off your Tractor Beam."
    pause
    :towAlready
        killalltriggers
        send "w"
    :towManned
        killalltriggers
        send "n"
    
        waitfor "----------------------------------------------------------------------------"
        :towagain
        setTextTrigger towCommand :towCommand "Choose which ship to tow"
        setTextTrigger towCommand2 :towCommand2 "Command ["
        setTextLineTrigger towline :towLine ""
        pause
        :towLine
            killalltriggers
            getWord CURRENTLINE $towShipTemp 1
            if ($towShipTemp = $towShipNum)
                setVar $foudShip 1
                goto :towCommand
            end
            goto :towagain
    
        :towCommand
            send "q*"
        :towCommand2
            killalltriggers
    if ($foudShip = 0)
        setVar $SWITCHBOARD~message "Could not find the ship we want to tow out of here.*"
		gosub :switchboard~switchboard
		HALT
    end

    setVar $cashRequired 340000
    goSub :stripcash
    send "pssbnyfycShpMatters***"
    # now have ship above us
    send "sq"
    waitfor "vailable Ships in Orbit"
	setTextLineTrigger getTwarpShipNum :getTwarpShipNum "ShpMatters"
	pause
		:getTwarpShipNum
		getWord CURRENTLINE $twarpShipNum 1
		killalltriggers

    send "qht1*qs"
    setVar $swap_ship_num $twarpShipNum
    goSub :swap_ore

    gosub :player~quikstats
    
    # confirm we are in new ship with the ore via quikstats
    if ($player~SHIP_NUMBER = $twarpShipNum)
        if ($player~ore_holds < 30)
            setVar $SWITCHBOARD~message "We don't have ore, something went wrong.*"
            gosub :switchboard~switchboard
            HALT
        else
            send "qhw2"
            setTextLineTrigger warpinstallgood :warpinstallgood "Ok!  We'll get that installed in your ship right away!"
            setTextLineTrigger warpinstallalready :warpinstallalready "You don't need two!"
            setTextLineTrigger warpinstallnotallowed :warpinstallnotallowed "Sorry, your ship is not equipped for a TransWarp Drive!"
            setTextLineTrigger warpinstallnocash :warpinstallnocash "Sigh, another poor trader.  Come back when you have the cash!"
            pause
            :warpinstallalready
                killalltriggers
                setVar $SWITCHBOARD~message "We already have twarp - something went wrong.*"
                gosub :switchboard~switchboard
                HALT
            :warpinstallnotallowed
                killalltriggers
                setVar $SWITCHBOARD~message "Twarp not allowed - something went wrong.*"
                gosub :switchboard~switchboard
                HALT
            :warpinstallnocash
                killalltriggers
                setVar $SWITCHBOARD~message "Not enough cas for twarp - something went wrong.*"
                gosub :switchboard~switchboard
                HALT
            :warpinstallgood
                killalltriggers
                # ok we got ore, we got ships, we got type 2
                send "qq"
echo "GOOD GOOD* GOOD GOOD*"
                send "wn" $towShipNum "*"
           
        end
    else
        setVar $SWITCHBOARD~message "We aren't in the twarp ship, something went wrong.*"
		gosub :switchboard~switchboard
		HALT
    end
halt


:setDora
    gosub :player~quikstats
	setVar $location $player~current_prompt
	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Start from Command Prompt.*"
		gosub :switchboard~switchboard
		HALT
	end
    setVar $cashRequired 350000
    goSub :stripcash
    goSub :buydora

    setVar $exitSector 0
    setVar $exitSectorDen 0
    setVar $exitSectorAnom 0

    goSub :setExitSector 

    echo "ExitSector:" $exitSector " exitSectorDen: " $exitSectorDen " exitSectorAnom: " $exitSectorAnom "*"

    goSub :mowOutFromDock

	send "'" $SWITCHBOARD~BOT_NAME " dora 1300 buys ports mcicbuy*"
	halt
return

:mowOutFromDock

    
    if ($exitSectorAnom = 1)

        #mow to terra and clear
        #void all 6 out of SD
        setVar $BOT~command "mow"
        setVar $BOT~user_command_line " mow 1"
        setVar $BOT~parm1 "1"
        saveVar $BOT~parm1
        saveVar $BOT~command
        saveVar $BOT~user_command_line
        load "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
        setEventTrigger		mowterraended		:mowterraended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
        pause
        :mowterraended
        killalltriggers
        send "d"
        waitfor "Sector  :"
        waitfor "Command ["
        setVar $BOT~command "scrub"
            setVar $BOT~user_command_line " scrub "
            
            saveVar $BOT~command
            saveVar $BOT~user_command_line
            load "scripts\"&$bot~mombot_directory&"\commands\general\scrub.cts"
            #setEventTrigger		scrubfinished		:scrubfinished "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\general\scrub.cts"
        setTextLineTrigger scrubfailpause :scrubfailpause "Limpet exists, but not enough cash to get scrubbed."
        setTextLineTrigger scrublimp :scrublimp "Limpet scrubbed off of hull."
        setTextLineTrigger scrubnolimptet :scrubnolimptet "No limpet on my ship."
            pause
        :scrubfailpause
            killalltriggers
            setVar $SWITCHBOARD~message "Kill script or type go ! (nospace) to continue.*"
            gosub :switchboard~switchboard
            waitfor "go!"
            goto :continueafterscrub
            :scrublimp
        :scrubnolimptet
            killalltriggers
            
        :continueafterscrub
    end

    getRnd $sec 11 10000

	:pathagain
	send "cf*" $sec "*q"
	
	setTextLineTrigger shortest :shortest "The shortest path"
	pause
	:shortest
		killalltriggers
		getword CURRENTLINE $hops 4
		STRIPTEXT $hops "("
		if ($hops < 8)
			add $sec 1
			waitfor "<Computer deactivated>"
			goto :pathagain
		else
			
			setTextLineTrigger thepath :thepath " > "
			pause
			:thepath
				killalltriggers
				getword CURRENTLINE $whereto 11
				STRIPTEXT $whereto ")"
				STRIPTEXT $whereto "("
				setVar $BOT~command "mow"
				setVar $BOT~user_command_line " mow "& $whereto 
				setVar $BOT~parm1 $whereto
				saveVar $BOT~parm1
				saveVar $BOT~command
				saveVar $BOT~user_command_line
				load "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
				setEventTrigger		mowended		:mowended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
				pause
				:mowended
					

		end

	halt

return

:setExitSector

    setArray $den 6
    setArray $secs 6
    setArray $anom 6
    setArray $ourfigs 6
    setArray $enemyfigs 6
    send "sd"
    waitfor "Long Range Scan"
    waitfor "Command ["

    gosub :doHolo
    
    setVar $goodSector 0
    setVar $goodSectori 0

    setVar $i 1
    while ($i <= SECTOR.WARPCOUNT[CURRENTSECTOR])
        setVar $secs[$i] SECTOR.WARPS[CURRENTSECTOR][$i]
        setVar $den[$i] SECTOR.DENSITY[SECTOR.WARPS[CURRENTSECTOR][$i]]
        setVar $anom[$i] SECTOR.ANOMOLY[SECTOR.WARPS[CURRENTSECTOR][$i]]
        add $i 1
    end
	
	# if 0 den or 100 with port or our figs, less than 300 and no anom
    setVar $i 1
    while ($i <= 6)
echo "Sec: " $secs[$i] " Den: " $den[$i] " Anom: " $anom[$i] " ourFig: " $ourfigs[$i] "*"
        if ($den[$i] = 0) or (($den[$i] = 100) and (PORT.EXISTS[$secs[$i]] = 1)) or (($ourfigs[$i] = 1) and ($den[$i] < 300) and ($anom[$i] = "0"))
            add $goodSectori 1
            setVar $goodSector[$goodSectori] $secs[$i]
            echo "Good Sec 1: " $secs[$i] "*"
        end
        add $i 1
    end
    if ($goodSectori > 0)
        goto :voidsAndExit
    end
    
    setVar $evilPlayers 0
    goSub :checkEvil

    if ($evilPlayers = 1)
        #means they could dock photon  
        setVar $SWITCHBOARD~message "Evil player alert - Could be running foton from dock press*Press 'y' to continue or 'n' to exit.*"
        gosub :switchboard~switchboard
        :optagain
        getConsoleInput $opt SINGLEKEY
        if ($opt = "y")

        elseif ($opt = "n")
             setVar $SWITCHBOARD~message "Ok it's all on you.. exiting*"
            gosub :switchboard~switchboard
            halt
        else
            echo "(y)es or (n)o please?**"
            goto :optagain
        end
     end
	
    # these are going to be through a enemy blockade - so pretty risky
    setVar $i 1
    while ($i <= 6)
        if ($den[$i] < 300) and ($anom[$i] = "0")
            add $goodSectori 1
            setVar $goodSector[$goodSectori] $secs[$i]
            echo "Good med den Sec 1: " $secs[$i] "*"
        end
        add $i 1
    end

    if ($goodSectori > 0)
        goto :voidsAndExit
    end
   
    setVar $i 1
    while ($i <= 6)
        if ($den[$i] < 500) and ($anom[$i] = "1")
            setVar $exitSectorAnom 1
            add $goodSectori 1
            setVar $goodSector[$goodSectori] $secs[$i]
            echo "Anom den Sec 1: " $secs[$i] "*"
        end
        add $i 1
    end
    
    if ($goodSectori > 0)
        goto :voidsAndExit
    end
    setVar $SWITCHBOARD~message "Looks like we could not find a safe route from dock.. TWarp out*"
    gosub :switchboard~switchboard
    HALT

    :voidsAndExit
        getRnd $ran 1 $goodSectori
        setVar $exitSector $goodSector[$ran]
echo "Selected Exit SEctor: " $exitSector " from "  $goodSectori " Sectors via terra:" $exitSectorAnom "*"
        setVar $i 1
        while ($i <= 6)
            if ($secs[$i] <> $exitSector)
                send "cv" $secs[$i] " *q"
            else
                setVar $exitSectorDen $den[$i]
                send "cv0*yn" $secs[$i] " *q"
            end
            add $i 1
        end
        


return

:checkEvil
	setVar $evilPlayers 0
	send "clvq"
	waitfor "--------------------- -- ------------------------------ ------------------"
	:nextLine
	setTextLineTrigger clvLine :clvLine ""
	pause
        :clvLine
		killalltriggers
		getWord CURRENTLINE $w 1
		if ($w = "Computer")
			goto :endclv
		else
            getLength CURRENTLINE $len
            if ($len > 60)
                getWord CURRENTLINE $align 3
                STRIPTEXT $align ","
                getWord CURRENTLINE $corp 4
                isnumber $isanumber $align
        echo "len " $len " isnum: " $isanumber " align:" $align " corp:" $corp " player~corpnumber:" $player~corpnumber "*"
                if ($isanumber) and ($align < 0) and ($corp <> $player~corpnumber)
                    
                    cutText CURRENTLINE $ship 61 30
    echo "*Evil Check align: " $align " ship: #" $ship "#*"
                    if ($ship = "Imperial StarShip") or ($ship = $pod) or ($ship = "Havoc GunStar IG") or ($ship = "Underground Starship")
                        setVar $evilPlayers 1

    echo "EVIL SHIP EVIL SHIP*"
                    end
                end
            end
			goto :nextLine
		end
		
	:endclv

return

:doHolo
    setVar $h 0
    send "sh"
    waitfor "Long Range Scan"

    :waitagainholo
    setTextLineTrigger holoSector :holoSector "Sector  :"
    setTextLineTrigger holoFighter :holoFighter "Fighters:"
    setTextLineTrigger holoDone :holoDone "Stargate Alpha"
    pause
    :holoSector
        killalltriggers
        add $h 1
        goto :waitagainholo
    :holoFighter
        killalltriggers
        getword CURRENTLINE $whosfig 3
        if ($whosfig = "(yours)")
            setVar $ourfigs[$h] 1
        else
            getword CURRENTLINE $whosfig 5
            if ($whosfig = "your")
                setVar $ourfigs[$h] 1
            else
                setVar $enemyfigs[$h] 1
            end
        end
        goto :waitagainholo
    :holoDone
        killalltriggers

return

:runtrade

    gosub :docim

    # get figs
    setVar $BOT~command "figs"
    setVar $BOT~user_command_line " figs"
    setVar $BOT~parm1 ""
    saveVar $BOT~parm1
    saveVar $BOT~command
    saveVar $BOT~user_command_line
    load "scripts\"&$bot~mombot_directory&"\commands\data\figs.cts"
    setEventTrigger		figsrun		:figsrun "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\data\figs.cts"
    pause
    :figsrun
        killalltriggers

    #marco report trades.txt
    setVar $BOT~command "marco"
    setVar $BOT~user_command_line " macro report trades.txt"
    setVar $BOT~parm1 "report"
    setVar $BOT~parm2 "trades.txt"
    saveVar $BOT~parm1
    saveVar $BOT~parm2
    saveVar $BOT~command
    saveVar $BOT~user_command_line
    load "scripts\"&$bot~mombot_directory&"\modes\cashing\marco.cts"
    setEventTrigger		marcorun		:marcorun "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\cashing\marco.cts"
    pause
    :marcorun
        killalltriggers

    setVar $SWITCHBOARD~message "Marco Pair Report saves to trades.txt*Use >beam file trades.txt [BOTNAME]*"
	gosub :switchboard~switchboard
    #get Macro Report

return


:grabcolos
	setarray $colts 10
	setvar $colts 0
	gosub :player~quikstats
	setVar $origship $player~SHIP_NUMBER
	setVar $location $player~current_prompt
	setVar $starting $player~current_sector
	if (($starting = $map~stardock) or ($starting <= 10))
		setVar $SWITCHBOARD~message "Can't start this from Fed Space.*"
		gosub :switchboard~switchboard
		HALT
	end
	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Start from Command Prompt.*"
		gosub :switchboard~switchboard
		HALT
	end
    :towAgainPlease
	send "w** "
    setTextLineTrigger oopsTowAlready :oopsTowAlready "You shut off your Tractor Beam"
	settextlinetrigger foundcolt :foundcolt "  0  Colonial Transport"
	settextlinetrigger nomore :nomore "Choose which ship to tow (Q=Quit)"
	settextlinetrigger nomore2 :nomore "You do not own any other ships in this sector!"
	pause
    :oopsTowAlready
        killalltriggers
        goto :towAgainPlease
	:foundcolt
		getword currentline $shipnumber 1
		add $colts 1
		setvar $colts[$colts] $shipnumber
		settextlinetrigger foundcolt :foundcolt "  0  Colonial Transport"
		pause
	:nomore
		killtrigger foundcolt
		killtrigger nomore
		killtrigger nomore2

	if ($colts <= 0)
		setVar $SWITCHBOARD~message "No Colts found in this sector.*"
		gosub :switchboard~switchboard
		HALT
	end

	setvar $i 1
	while ($i <= $colts)
		send "*"
		gosub :player~quikstats
		if ((PORT.BUYFUEL[$starting] = false) and ((PORT.CLASS[$starting] <> 0) and (PORT.CLASS[$starting] <> 9)))
			send "p  t  * * *"
		end
		send "x  "&$colts[$i]&"*  *  j y x  "&$origship&"*  *  w * "&$colts[$i]&"* "
		setVar $player~warpto 1
		gosub :player~twarp
		if ($player~twarpSuccess = FALSE)
			setVar $SWITCHBOARD~message "Can't make it to Terra.  Halting.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		gosub :player~quikstats
		send "x  "&$colts[$i]&"*  *  l**  x  "&$origship&"*  *   w * "&$colts[$i]&"* "
		if ($player~twarpSuccess = true)
			setVar $player~warpto $starting
			gosub :player~twarp
			if ($player~twarpSuccess = FALSE)
				setVar $SWITCHBOARD~message "Can't get back!  Halting*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
			gosub :player~quikstats
			send "w "
		end
		add $i 1
	end


return

:movecolt
	setarray $colts 10 1
	setvar $colts 0
	gosub :player~quikstats
	setVar $origship $player~SHIP_NUMBER
	setVar $location $player~current_prompt
	setVar $starting $player~current_sector
	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Start from Command Prompt.*"
		gosub :switchboard~switchboard
		HALT
	end
	if ($bot~parm2 = "")
		setVar $SWITCHBOARD~message "No sectors selected.  You need to choose a sector to move to.*"
		gosub :switchboard~switchboard
		HALT
	end
	setvar $coltcount 0
	if ($bot~parm2 <> "")
		isnumber $isanumber $bot~parm2
		if ($isanumber <> true)
			setVar $SWITCHBOARD~message "Sector param is invalid.*"
			gosub :switchboard~switchboard
			HALT
		end
		add $coltcount 1
		setvar $colts[$coltcount][1] $bot~parm2
	end
	if ($bot~parm3 <> "")
		isnumber $isanumber $bot~parm3
		if ($isanumber <> true)
			setVar $SWITCHBOARD~message "Sector param is invalid.*"
			gosub :switchboard~switchboard
			HALT
		end
		add $coltcount 1
		setvar $colts[$coltcount][1] $bot~parm3
	end
	if ($bot~parm4 <> "")
		isnumber $isanumber $bot~parm4
		if ($isanumber <> true)
			setVar $SWITCHBOARD~message "Sector param is invalid.*"
			gosub :switchboard~switchboard
			HALT
		end
		add $coltcount 1
		setvar $colts[$coltcount][1] $bot~parm4

	end
	send "w** "
	settextlinetrigger foundcolt :foundcoltmove "  0  Colonial Transport"
	settextlinetrigger nomore :nomoremove "Choose which ship to tow (Q=Quit)"
	settextlinetrigger nomore2 :nomoremove "You do not own any other ships in this sector!"
	pause
	:foundcoltmove
		getword currentline $shipnumber 1
		getword currentline $shipWord 3
        if ($shipWord = "Ship")
		    add $colts 1
		    setvar $colts[$colts] $shipnumber
        end
		settextlinetrigger foundcolt :foundcoltmove "  0  Colonial Transport"
		pause
	:nomoremove
		killtrigger foundcolt
		killtrigger nomore
		killtrigger nomore2

		if ($colts <= 0)
			setVar $SWITCHBOARD~message "No Colts found in this sector.*"
			gosub :switchboard~switchboard
			HALT
		end
		if ($colts < $coltcount)
			setVar $SWITCHBOARD~message "Not enough colts in the sector for "&$coltcount&" sectors.  Buy more colts or choose fewer sectors.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
  
        setvar $i 1
		while ($i <= $coltcount)
			send "w * "&$colts[$i]&"* "
			setVar $player~warpto $colts[$i][1]
			gosub :player~twarp
			if ($player~twarpSuccess = FALSE)
				setVar $SWITCHBOARD~message "Sector missing fig, moving onto next.*"
				gosub :SWITCHBOARD~switchboard
			else
				setVar $SWITCHBOARD~message "Colt moved to sector "&$colts[$i][1]&".*"
				gosub :switchboard~switchboard
				send "*"
				gosub :player~quikstats
				if ((PORT.BUYFUEL[$colts[$i][1]] = false) and ((PORT.CLASS[$colts[$i][1]] <> 0) and (PORT.CLASS[$colts[$i][1]] <> 9)))
					send "p  t  * * *"
				end
			end
			send "w "
			gosub :player~quikstats
			if ($player~twarpSuccess = true)
				setVar $player~warpto $starting
				gosub :player~twarp
				if ($player~twarpSuccess = FALSE)
					setVar $SWITCHBOARD~message "Can't get back!  Halting*"
					gosub :SWITCHBOARD~switchboard
					halt
				end
				gosub :player~quikstats
			end
			add $i 1
		end

		halt
return

:docim

	setVar $SWITCHBOARD~message "Entering the matrix...*"
	gosub :switchboard~switchboard
	send "^i?"
	waitfor "<U> Unexplored Sectors"
	send "r?"
	waitfor "<U> Unexplored Sectors"
	send "q"
	setVar $SWITCHBOARD~message "Cim downlaod complete..*"
	gosub :switchboard~switchboard

return

:buycolt

	gosub :player~quikstats
	setVar $origship $player~SHIP_NUMBER
	setVar $location $player~current_prompt
	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Start from Command Prompt.*"
		gosub :switchboard~switchboard
		HALT
	end
	
	send "d"
	waitfor "Sector  :"
	setTextLineTrigger stardock2 :stardock2 "Ports   : Stargate Alpha I"
	setTextLineTrigger nostardock2 :nostardock2 "Warps to Sector(s) :"
	pause
	:nostardock2
		setVar $SWITCHBOARD~message "Start at dock*"
		gosub :switchboard~switchboard
		HALT
	:stardock2 
		killalltriggers


	setVar $origshi $player~SHIP_NUMBER
	if ($player~credits < 860000)
		setVar $SWITCHBOARD~message "Need 860k for Colt, Max holds and twarp*"
		gosub :switchboard~switchboard
		halt
	end
	send "pssbnyeyc1234512345***sq"

	waitfor "vailable Ships in Orbit"
	setTextLineTrigger theship :theship "1234512345"
	pause
		:theship
		getWord CURRENTLINE $shipnum 1
		killalltriggers

		send "qqx*" $shipnum "*qpss"
		waitfor "You walk past row after row of space ships"
		send "ryShip " $shipnum "*y"
        send "pa150*yb500*c500*qqhrdt1*qq"
		waitfor "You return to your ship and blast off from the StarDock."
		send "x*" $origship "**"
		setVar $SWITCHBOARD~message "Colt purchased.*"
		gosub :switchboard~switchboard
		halt
return

:stripcash

    setVar $havecorpies 0
    setVar $totalCash $player~credits
    setVar $cashToTake ($cashRequired - $totalCash)

    if ($cashToTake < 0)
        setVar $SWITCHBOARD~message "We already have more than " &$cashRequired &", exiting strip.*"
		gosub :switchboard~switchboard
        return
    end
    if ($cashRequired < 1)
        setVar $SWITCHBOARD~message "We didn't specify how much cash is required for stripCash.*"
		gosub :switchboard~switchboard
		halt
    end
	send "t"
	setVar $go 1
	setVar $i 1
	while ($go = 1)
		send "c"
		setVar $y 1
		while ($y < $i)
			send "nm"
			add $y 1
		end

        if ($havecorpies = 0)
            :waitcorpies
    #c count - if 100 alert and quit
            setTextLineTrigger nocorpies :nocorpies "Your Associate must be in the same sector to conduct transfers!"
            setTextTrigger corpies :corpies "Exchange with"
            pause 
            :nocorpies 
                killalltriggers
                send "c"
                goto :waitcorpies
            :corpies
                killalltriggers
                setVar $havecorpies 1
        else
		    waitfor "Exchange with"
        end
		send "yf"
		setTextLineTrigger cash :cash "credits, and"
		setTextLineTrigger cashdone :cashdone "You may only be on one Corp at a time"
		pause
		:cashdone 
			killalltriggers
			send "* * * * * * * * * "
			setVar $SWITCHBOARD~message "Cash Strip Complete.*"
			gosub :switchboard~switchboard
			return
		:cash
			killalltriggers
			getText CurrentLine $DECASH " has " "."
			stripText $DECASH ","
			stripText $DECASH " "
            # $cashToTake
            if ($DECASH > 5001)
                if ($cashToTake > ($DECASH - 5000))
                    setVar $takeCash ($DECASH -5000)
                    setVar $cashToTake ($cashToTake - $takeCash)
                else
                    setVar $takeCash $cashToTake
                    setVar $cashToTake 0
                end
			
				send $takeCash & "*"
			else
				setVar $DECASH 0
				send "*"
			end
            
            if ($cashToTake = 0)
                send "* * * * * * * * * "
                setVar $SWITCHBOARD~message "Cash Strip Complete.*"
			    gosub :switchboard~switchboard
                return 
            end
		add $i 1
		if ($i > 10)
			send "* * * "
			halt
		end
	end

return

:buydora
    gosub :player~quikstats
	setVar $origship $player~SHIP_NUMBER
	setVar $location $player~current_prompt
	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Start from Command Prompt.*"
		gosub :switchboard~switchboard
		if ($doraReturn = 1)
            return
        else
            halt
        end
	end


	if ($bot~parm2 = "new")

        if ($player~credits < 330000)
            setVar $SWITCHBOARD~message "Need 330k cash to get Merchie.*"
            gosub :switchboard~switchboard
            if ($doraReturn = 1)
                return
            else
                halt
            end
        end
        send "pssbnygycNewMerch***sqqq"
        waitfor "vailable Ships in Orbit"
        setTextLineTrigger buyDoraShip :buyDoraShip "NewMerch"
        pause
            :buyDoraShip
            getWord CURRENTLINE $shipnum 1
            killalltriggers
            waitfor "ou return to your ship and blast off from the StarDock."

            send "x*" $shipnum "*qpss"
            waitfor "You walk past row after row of space ships"
            send "ryShip " $shipnum "*y"
            send "pa120*yqqhrhqq"
            waitfor "You return to your ship and blast off from the StarDock."
            setVar $figsRequired 500
            gosub :player~quikstats
	        gosub :stripfig

            send "x*" $origship "**"
            setVar $SWITCHBOARD~message "Merch purchased.*"
            gosub :switchboard~switchboard
            
    else
	    gosub :atdockinmerch
    
        if ($player~credits < 350000)
            setVar $SWITCHBOARD~message "Need 350k cash to get flag.*"
            gosub :switchboard~switchboard
            if ($doraReturn = 1)
                return
            else
                halt
            end
        end
        send "pssbyygycLets Go**pa120*yb500*qqhrhqq"
        waitfor "You return to your ship and blast off from the StarDock"
        goSub :player~quikstats
        if ($player~TOTAL_HOLDS <> 150)
            setVar $SWITCHBOARD~message "Do not have 150 holds ,press go ! (no space) to continue or tab tab to stop..*"
            gosub :switchboard~switchboard
            waitfor "go!"
        end
    end

	
	
	
	
return

:buycorp
	
	gosub :atdockinmerch
	if ($player~credits < 350000)
		setVar $SWITCHBOARD~message "Need 350k cash to get flag.*"
		gosub :switchboard~switchboard
		halt
	end

	send "pssbyyey"
	setTextLineTrigger flagok :flagok "What do you want to name this ship?"
	setTextLineTrigger flagnotok :flagnotok "Only Corporate Chairs can purchase this ship!"
	pause
	:flagnotok
		killalltriggers
		send "q q "
		setVar $SWITCHBOARD~message "You're not the CEO!.*"
		gosub :switchboard~switchboard
		halt
	:flagok
		killalltriggers
		send "The Bossman**pa130*yb99*qqhrhw2qq"
		waitfor "u return to your ship and blast off from the St"
		send "t f y f 900* * * * "
		send "t f n y f 900*  * * * * * * * * * "
		send "t f n n y f  900* * * * * * * * * * "
		send "t f n n n y f  900* * * * * * * * * * "
		send "t f n n n n y f  900* * * * * * * * * * "

		setVar $SWITCHBOARD~message "Should be in flaggy.*"
		gosub :switchboard~switchboard
		halt

return

:sellship
	
	gosub :atdockinmerch
	
	send "pssbyybyc...**qq"
	waitfor "You return to your ship and blast off from the StarDock"
	setVar $SWITCHBOARD~message "Ship sold, cash on me.*"
	gosub :switchboard~switchboard
	HALT

return

:atdockinmerch
	gosub :player~quikstats
	setVar $location $player~current_prompt
	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Start from Command Prompt.*"
		gosub :switchboard~switchboard
		HALT
	end
	send "i"
	waitfor "Ship Name      :"
	setTextLineTrigger merch :merch "Merchant Cruiser"
	setTextLineTrigger nomerch :nomerch "Credits        :"
	pause
	:nomerch
		setVar $SWITCHBOARD~message "Start at dock, in day 1 merch.*"
		gosub :switchboard~switchboard
		HALT
	:merch
		killalltriggers
	send "d"
	waitfor "Sector  :"
	setTextLineTrigger stardock :stardock "Ports   : Stargate Alpha I"
	setTextLineTrigger nostardock :nostardock "Warps to Sector(s) :"
	pause
	:nostardock
		setVar $SWITCHBOARD~message "Start at dock, in day 1 merch*"
		gosub :switchboard~switchboard
		HALT
	:stardock 
		killalltriggers

return

:swapore
    if ($bot~parm2 <> "")
		isnumber $isanumber $bot~parm2
		if ($isanumber <> true)
			setVar $SWITCHBOARD~message "Ship number needs to be a number, fancy that?*"
			gosub :switchboard~switchboard
			HALT
		end
		setVar $swap_ship_num $bot~parm2
        goSub :swap_ore
    else
        setVar $SWITCHBOARD~message "Please specify ship num >ice2020 swapore [shipnum].*"
        gosub :switchboard~switchboard
        HALT
	end
    

halt

:swap_ore
    # must have G-Torp
    # pass this in:
    
    gosub :PLAYER~quikstats
    :checkShip
    
    if ($PLAYER~CURRENT_PROMPT <> "<Shipyards>")
        setVar $SWITCHBOARD~message "Start from shipyards!*"
		gosub :switchboard~switchboard
        halt
    end
    setVar $shipfound 0
    send "s"
    
    
    
    :scanShips
        killalltriggers
        :scanShipLineAgain
        setTextTrigger scanDone :scanDone "Choose which ship to sell"
        setTextLineTrigger scanNoShips :scanNoShips "You do not own any other ships orbiting the"
        setTextLineTrigger scanShipLine :scanShipLine ""
        pause
        :scanNoShips
        killalltriggers
            
            setVar $SWITCHBOARD~message "Couldn't find ship in orbit above Dock.*"
            gosub :switchboard~switchboard
            halt
        :scanShipLine
            killalltriggers
            getWord CURRENTLINE $testship 1
            if ($testship = $swap_ship_num)
                setVar $shipfound 1
            end
            goto :scanShipLineAgain
        :scanDone
            killalltriggers

        if ($shipfound = 0)
            send "q"
            setVar $SWITCHBOARD~message "Couldn't find ship in orbit above Dock.*"
            gosub :switchboard~switchboard
            halt
        end

    :init_ore_swap_vars
    setVar $funky_counter 0
    
    isNumber $numtest $swap_ship_num
    if ($numtest < 1)
        setVar $SWITCHBOARD~message "Invalid ship number!*"
		gosub :switchboard~switchboard
        halt
    end
    if ($swap_ship_num < 1) OR ($swap_ship_num > 65000)
        setVar $SWITCHBOARD~message "Invalid ship number!*"
		gosub :switchboard~switchboard
        halt
    end
   
    :top_of_ore_swap
    gosub :PLAYER~quikstats
    add $funky_counter 1
    if ($PLAYER~GENESIS < 1)
        setVar $SWITCHBOARD~message "Out of Genesis Torps. You're going to need one for this.*"
        send "Q"
		gosub :switchboard~switchboard
        halt
    end
    if ($player~ore_holds < 3)
        setVar $SWITCHBOARD~message "There's no ore on your ship! You can't drop ore if you don't have any.*"
		gosub :switchboard~switchboard
        halt
    end
    if ($planetKillerCounter = 1)
        send "'swaporecountergo*"
    end
    send "qqq  z  n  u  y  *  .*  z  c  *  p  s  h "
    waitOn "Landing on Federation StarDock."
    getRnd $rand_wait 50 200
    killtrigger safety_delay
    setDelayTrigger safety_delay :lift_stuff $rand_wait
    pause
    :lift_stuff
    send "qqq  z  n  l*  *  z  q  t  n  z  l  1  *  q  q  z  n  p  s  h "
        killalltriggers
    setTextLineTrigger result_trg1 :res_torps "You don't have any Genesis Torpedoes to launch!"
    setTextLineTrigger result_trg2 :res_nopln "There isn't a planet in this sector."
    setTextLineTrigger result_trg3 :res_mltpl "Registry# and Planet Name"
    setTextLineTrigger result_trg4 :res_landd "Landing sequence engaged..."
    setTextLineTrigger result_trg5 :res_backd "Landing on Federation StarDock."
    pause
    :res_torps
        setVar $SWITCHBOARD~message "You somehow ran out of Genesis Torps before launching. This should not have happened! Check your status!*"
		gosub :switchboard~switchboard
        send "? "
        halt
    :res_nopln
        
        setVar $SWITCHBOARD~message "The planet is gone! Someone might be messing with us.*"
		gosub :switchboard~switchboard
    if ($funky_counter < 4)
        goto :top_of_ore_swap
    else
        setVar $SWITCHBOARD~message "I've tried this 3 times, something is definately going on. Check your status!*"
		gosub :switchboard~switchboard
        send "? "
        halt
    end
    :res_landd
    waitOn "Planet #"
    getWord CURRENTLINE $pnum 2
    stripText $pnum "#"
    waitOn "(?="
    echo ANSI_10 "**We've landed and dropped our ore on planet #" & $pnum & "!*"
    pause
    :res_mltpl
    waitOn "--------------------"
        killalltriggers
    setVar $p_array_idx 0
    setArray $p_array 255
        killalltriggers
    setTextLineTrigger plist_trig :plist_line ">"
    setTextLineTrigger plist_end  :plist_end  "Land on which planet"
    pause
    halt
    :plist_line
        add $p_array_idx 1
        setVar $line CURRENTLINE
        stripText $line "<"
        stripText $line ">"
        getWord $line $a_number 1
        setVar $p_array[$p_array_idx] $a_number
        killtrigger plist_trig
        setTextLineTrigger plist_trig :plist_line "<"
        pause
        halt
    :plist_end
            killalltriggers
        if ($p_array_idx < 1)
            setVar $SWITCHBOARD~message "The planet is gone! Someone might be messing with us.*"
		    gosub :switchboard~switchboard
            if ($funky_counter < 4)
                goto :top_of_ore_swap
            else
                    setVar $SWITCHBOARD~message "I've tried this 3 times, something is definately going on. Check your status!*"
		            gosub :switchboard~switchboard
                    send "? "
                halt
            end
        end
    waitOn "Landing on Federation StarDock."
    waitOn "<Hardware Emporium> So what are you looking for (?)"
    getRnd $rand_wait 50 200
    killtrigger safety_delay
    setDelayTrigger safety_delay :more_lift_stuff $rand_wait
    pause
    :more_lift_stuff
        getRnd $rnd_idx 1 $p_array_idx
        setVar $pnum $p_array[$rnd_idx]
            killalltriggers
        setTextLineTrigger result_trg1 :res_baddd "Engage the Autopilot?"
        setTextLineTrigger result_trg2 :res_baddd "That planet is not in this sector."
        setTextLineTrigger result_trg3 :res_land2 "<Take/Leave Products>"
        setTextLineTrigger result_trg4 :res_backd "Landing on Federation StarDock."
        send "qqq  z  n  l " & $pnum & "  *  *  z  n  z  n  *  z  q  t  n  z  l  1  *  q  q  z  n  p  s  h "
        pause
    :res_baddd
        killalltriggers
        setVar $SWITCHBOARD~message "The planet is gone! Someone might be messing with us.*"
		    gosub :switchboard~switchboard
    if ($funky_counter < 4)
            goto :top_of_ore_swap
    else
        setVar $SWITCHBOARD~message "I've tried this 3 times, something is definately going on. Check your status!*"
		gosub :switchboard~switchboard
        send "? "
    end
    halt
    :res_land2
    echo ANSI_10 "**We've landed and dropped our ore on planet #" & $pnum & "!*"
    pause
    :res_backd
        killalltriggers
    gosub :PLAYER~quikstats
    waitOn "<Hardware Emporium> So what are you looking for (?)"
    getRnd $rand_wait 100 300
    killtrigger safety_delay 
    setDelayTrigger safety_delay :yet_more_lift_stuff $rand_wait
    pause
    :yet_more_lift_stuff
        setVar $msg ""
        setTextLineTrigger result_trg1 :swap_xport_notavail "That is not an available ship."
        setTextLineTrigger result_trg2 :swap_xport_badrange "only has a transport range of"
        setTextLineTrigger result_trg3 :swap_xport_security "SECURITY BREACH! Invalid Password, unable to link transporters."
        setTextLineTrigger result_trg4 :swap_xport_noaccess "Access denied!"
        setTextLineTrigger result_trg5 :swap_xport_xprtgood "Security code accepted, engaging transporter control."
        setTextLineTrigger result_trg6 :swap_pland_noplnet1 "Engage the Autopilot?"
        setTextLineTrigger result_trg7 :swap_pland_noplnet2 "That planet is not in this sector."
        setTextLineTrigger result_trg8 :swap_pland_noplnet3 "Invalid registry number, landing aborted."
        setTextLineTrigger result_trg9 :swap_pland_prodtakn "<Take all>"
        setTextLineTrigger result_trg0 :swap_pland_complete "Landing on Federation StarDock."
        send "qqq  z  n  "
        send "x    " & $swap_ship_num & "    *    *    *   "
        send "l " & $pnum & "  *  *  z  n  z  n  *  z  q  a  *  q  q  z  n  "
        send "p  s  s "
        pause
    :swap_xport_notavail
        setVar $msg $msg & "*That ship is not available, using the original ship...*"
        pause
    :swap_xport_badrange
        setVar $msg $msg & "That ship is too far away, using the original ship...*"
        pause
    :swap_xport_security
        setVar $msg $msg & "That ship is passworded, using the original ship...*"
        pause
    :swap_xport_noaccess
        setVar $msg $msg & "Cannot access that ship, using the original ship...*"
        pause
    :swap_xport_xprtgood
        setVar $msg $msg & "Xport good!*"
        pause
    :swap_pland_noplnet1
        setVar $msg $msg & "The planet has gone missing. Check your status!*"
        pause
    :swap_pland_noplnet2
        setVar $msg $msg & "The planet has gone missing. Check your status!*"
        pause
    :swap_pland_noplnet3
        setVar $msg $msg & "The planet has gone missing. Check your status!*"
        pause
    :swap_pland_prodtakn
        setVar $msg $msg & "Products collected!*"
        pause
    :swap_pland_complete
            killalltriggers
        gosub :PLAYER~quikstats
        waitOn "<Shipyards> Your option (?) ?"
        setVar $SWITCHBOARD~message $msg
		gosub :switchboard~switchboard
        return
    pause
    halt
    # -------------------------------------------------------------------
    :pland_trg_1
    setVar $msg "*There are no planets in the StarDock sector!*"
    pause
    :pland_trg_2
    setVar $msg "*That planet is not in the StarDock sector!*"
    pause
    :pland_trg_3
    setVar $msg "*Products taken!*"
    pause
    :pland_trg_4
    setVar $msg "*Fuel dropped!*"
    pause
    :pland_trg_6
    setVar $msg "*Planet destroyed!*"
    pause
    :pland_trg_5
    gosub :PLAYER~quikstats
    waitOn "<Hardware Emporium> So what are you looking for (?)"
        killalltriggers
    echo $msg
    halt
return

:crazyStart

    setDelayTrigger crazyStartDelay :crazyStartDelay 3000
    :crazyStartDelay
        killAllTriggers
    send "lt7*"

    # Find first tunnel entrance - Mow to it - fig it.
    setVar $BOT~command "findbb"
    setVar $BOT~user_command_line " findbb crazy "
    setVar $BOT~parm1 "crazy"
    setVar $BOT~parm2 ""
    saveVar $BOT~parm1
    saveVar $BOT~parm2
    saveVar $BOT~command
    saveVar $BOT~user_command_line
    load "scripts\"&$bot~mombot_directory&"\modes\data\findbb.cts"
    setEventTrigger		findbbCrazy		:findbbCrazy "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\data\findbb.cts"
    pause
    :findbbCrazy
        killalltriggers
    # Eject Cols
    send "jy"
    send "v0*yyq"
    send "tt.**q"
    waitfor "Corporate command ["
    waitfor "Command ["
    send "'all watcher*"

    # Run complete BB
    setVar $BOT~command "findbb"
    setVar $BOT~user_command_line " findbb plotsonly "
    setVar $BOT~parm1 "plotsonly"
    setVar $BOT~parm2 ""
    saveVar $BOT~parm1
    saveVar $BOT~parm2
    saveVar $BOT~command
    saveVar $BOT~user_command_line
    load "scripts\"&$bot~mombot_directory&"\modes\data\findbb.cts"
    setEventTrigger		findbbNormal		:findbbNormal "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\data\findbb.cts"
    pause
    :findbbNormal
        killalltriggers
    setVar $doCrazyAlign 0
    send "cv0*yyq"
    goto :crazyMow
halt

:crazyMow

    gosub :player~quikstats

    if ($PLAYER~CURRENT_PROMPT <> "Command")
        setVar $SWITCHBOARD~message "Need to be at Command Prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
    end

    send "v"
    setTextLineTrigger getBackDockCrazy :getBackDockCrazy "The StarDock is located in sector"
    pause
    :getBackDockCrazy
        killalltriggers
        getWord CURRENTLINE $stardock 7
        STRIPTEXT $stardock "."
   
    setVar $PLAYER~destination $stardock
    #goSub :voidfirstnotFed

    setVar $go 1
	while ($go = 1)
		goSub :getWarpAndAvoid
	
		if ($voidfound = 0)
			setVar $go 0
		end
	end

    setVar $targets 0
    setVar $targeti 0
    setVar $targetDone 0

    setVar $totalTargets 0
    setVar $totalDone 0

    
    setVar $i 11
	while ($i < SECTORS)
		getSectorParameter $i "BUBBLEDOOR" $param_bubble
		getSectorParameter $i "TUNNELDOOR" $param_tunnel

		if ($param_tunnel = "")
			setVar $param_tunnel 0
		end
		if ($param_bubble = "")
			setVar $param_bubble 0
		end
		if ($param_bubble = 1)
			add $targeti 1
			setVar $targets[$targeti] $i
            setVar $targetDone[$targeti] 0
		end
		if ($param_tunnel > 0)
			add $targeti 1
			setVar $targets[$targeti] $i
            setVar $targetDone[$targeti] 0
		end
		add $i 1
	end

    setVar $totalTargets $targeti
    # Technically totaldone is 0 but loops look neater this way goign 1 to 10 vs 0 to 9
    setVar $totalDone 1
    setVar $shortestTarget 99999

    while ($totalDone <= $totalTargets)
        setVar $shortestTarget 99999

        if ($totalDone = $totalTargets)
        echo "LAST TARGET!"
            setVar $i 1
            while ($i <= $totalTargets)

                if ($targetDone[$i] = 0)
                     setVar $shortestTarget $targets[$i]
                end
                add $i 1
            end
        else
            goSub :crazyGetCloset
        end
echo  "TARGET" $totalDone ": " $shortestTarget "*"

        :DoMow
            setVar $BOT~command "mow"
            setVar $BOT~user_command_line " mow " & $shortestTarget & " 1 "
            setVar $BOT~parm1 $shortestTarget
            setVar $BOT~parm2 "1"
            saveVar $BOT~parm1
            saveVar $BOT~parm2
            saveVar $BOT~command
            saveVar $BOT~user_command_line
            load "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
            setEventTrigger		mowCrazyEnd		:mowCrazyEnd "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
            pause
            :mowCrazyEnd
            killalltriggers
                
                send "i"
                setTextLineTrigger crazyMowPod :crazyMowPod "Escape Pod"
                setTextLineTrigger crazyMowNoPod :crazyMowNoPod "Total Holds    :"
                pause
                :crazyMowPod 
                    killAllTriggers
                    send "pzt"
                    send "'ALERT I'VE BEEN PODED! MAY be AFK! HELP*"
                    send "'ALERT I'VE BEEN PODED! MAY be AFK! HELP*"
                    send "'ALERT I'VE BEEN PODED! MAY be AFK! HELP*"
                    halt
                :crazyMowNoPod 
                    killAllTriggers

                    gosub :player~quikstats
                    if ($player~current_sector <> $shortestTarget)
                        send "'Didn't make mow sector.. going on still*"
                    end
                #check SEctor
                #CHECK SHIP - issue xport to anything
            if ((PORT.EXISTS[$player~current_sector]) and ($doCrazyAlign = 1))
                setVar $doCrazyAlign 0
                send "o120*q"
            end
        add $totalDone 1
    end 

    getSectorParameter CURRENTSECTOR "TUNNELINT" $inTheTunnel
   
    if ($inTheTunnel = "")
        getSectorParameter CURRENTSECTOR "BUBBLEINT" $inTheTunnel
      
    end
    
    setVar $BOT~command "mow"
    setVar $BOT~user_command_line " mow " & $inTheTunnel & " "
    setVar $BOT~parm1 $inTheTunnel
    setVar $BOT~parm2 ""
    saveVar $BOT~parm1
    saveVar $BOT~parm2
    saveVar $BOT~command
    saveVar $BOT~user_command_line
    load "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
    setEventTrigger		mowCrazyEnd2		:mowCrazyEnd2 "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
    pause
    :mowCrazyEnd2
    send "f1*cd"
    send "pztn"
    send "'TUnnels Blocked - Can I go 0 alignment and mow to safety?? - hidden in tunnel/bubble!*"

    halt

    
return

:crazyGetCloset

    setVar $shortestDist 99
    setVar $shortestTarget 99999

    setVar $i 1
    while ($i <= $targeti)
            #The shortest path (19 hops, 38 turns) from sector 1 to sector 12 is:
        if ($targetDone[$i] = 0)
            send "cf*" $targets[$i] "*q"
        end
        add $i 1
    end
    send "^q"

    :crazyClosestWaitMore
    setTextLineTrigger crazyShortestPath :crazyShortestPath "The shortest path "
    setTextLineTrigger crazyEndInterrog :crazyEndInterrog "ENDINTERROG"
    pause
    :crazyShortestPath
        killAllTriggers
        getWord CURRENTLINE $cshort 4
        getWord CURRENTLINE $cSector 13
        STRIPTEXT $cshort "("
        if ($cshort < $shortestDist)
            setVar $shortestDist $cshort
            setVar $shortestTarget $cSector 
echo "Setting shortest:" $cshort " to sector " $cSector "*"
        end
        goto :crazyClosestWaitMore

    :crazyEndInterrog
        killAllTriggers

    setVar $i 1
    while ($i <= $targeti)
           
        if ($targets[$i] = $shortestTarget)
            setVar $targetDone[$i] 1
        end
        add $i 1
    end


return
:backup

    gosub :player~quikstats

    if (($PLAYER~CURRENT_SECTOR <> 1) or ($PLAYER~CURRENT_PROMPT <> "Command"))
        setVar $SWITCHBOARD~message "Need to be at Terra and at Command Prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
    end
    send "p t a30* y q "
    waitfor "Which item do you wish to buy?"
    waitfor "Command ["

    
    setVar $cashRequired 1200000
    goSub :stripcash

    send "v"
    setTextLineTrigger getBackDock :getBackDock "The StarDock is located in sector"
    pause
    :getBackDock
        killalltriggers
        getWord CURRENTLINE $stardock 7
        STRIPTEXT $stardock "."
   
    setVar $PLAYER~destination $stardock
    goSub :voidfirstnotFed

    setVar $go 1
	while ($go = 1)
		goSub :getWarpAndAvoid
	
		if ($voidfound = 0)
			setVar $go 0
		end
	end

    setVar $cashRequired 1200000
    goSub :stripcash

    getRnd $dest 11 5000
    setVar $dist 6
    goSub :fuelMowToRandom
    gosub :player~quikstats

    :findFuelAgain
    if ($player~ore_holds < 30)
        getRnd $dest 11 5000
        setVar $dist 5
        goSub :fuelMowToRandom
        gosub :player~quikstats
        goto :findFuelAgain
    end

    setVar $BOT~command "mow"
    setVar $BOT~user_command_line " mow " & $stardock & " 1 "
    setVar $BOT~parm1 $stardock
    setVar $BOT~parm2 "1"
    saveVar $BOT~parm1
    saveVar $BOT~parm2
    saveVar $BOT~command
    saveVar $BOT~user_command_line
    load "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
    setEventTrigger		mowSDEnded		:mowSDEnded "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
    pause
    :mowSDEnded
    killalltriggers
    
    gosub :player~quikstats
    if ($player~current_sector <> $stardock)
        setVar $SWITCHBOARD~message "Not at dock - uh oh, mow back to terra or random?*"
		gosub :SWITCHBOARD~switchboard
		halt
    end
    setVar $cashRequired 210000
    goSub :stripcash

    send "p s s b n y f ycPrime Time II***s*q h t1* q s"
    waitfor "vailable Ships in Orbit"
	setTextLineTrigger getSwapShip :getSwapShip "Prime Time II"
	pause
		:getSwapShip
		getWord CURRENTLINE $swap_ship_num 1
		killalltriggers

    waitfor "How many Genesis Torpedoes"
    waitfor "<Shipyards>"

    goSub :swap_ore
    gosub :player~quikstats

    send "q q"
    send "cv0*yyq"
    setVar $SWITCHBOARD~message "Backup ship bought - sell other and get some figs?*"
	gosub :SWITCHBOARD~switchboard

    
return

:fuelMowToRandom
    :fmpathagain
	send "cf*" $dest "*q"
	
	setTextLineTrigger fmshortest :fmshortest "The shortest path"
	pause
	:fmshortest
		killalltriggers
		getword CURRENTLINE $hops 4
		STRIPTEXT $hops "("
		if ($hops < ($dist + 1))
			add $dest 1
			waitfor "<Computer deactivated>"
			goto :fmpathagain
		else
			
			setTextLineTrigger thepath :fmthepath " > "
			pause
			:fmthepath
				killalltriggers
                # $whereToWord = HOPS + 1 + HOPS to get word 1 > 2 > 3 > 4 > 5   i.e. 3 hops out if sector 4 = 3 + 1 + 3 = 7
                setVar $whereToWord ($dist + 1 + $dist)
				getword CURRENTLINE $whereto $whereToWord
				STRIPTEXT $whereto ")"
				STRIPTEXT $whereto "("
				setVar $BOT~command "fmow"
				setVar $BOT~user_command_line " fmow "& $whereto & " 1 "
				setVar $BOT~parm1 $whereto
                setVar $BOT~parm2 1
				saveVar $BOT~parm1
                saveVar $BOT~parm2
				saveVar $BOT~command
				saveVar $BOT~user_command_line
				load "scripts\"&$bot~mombot_directory&"\modes\grid\fmow.cts"
				:waitAgainFuelMow
                setEventTrigger		fmmowended		:fmmowended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\grid\fmow.cts"
                setTextLineTrigger fMowGotPort :fMowGotPort "How many holds of"
				pause
                :fMowGotPort
                    killalltriggers
                    echo CURRENTSECTOR "*"
                    echo CURRENTSECTOR "*"
                    setSectorParameter 2 "KNOWNORE" CURRENTSECTOR 
                    goto :waitAgainFuelMow
				:fmmowended
                    killAllTriggers
					return

		end

return

:getWarpAndAvoid
	setVar $voidfound 0
	send "cf" $PLAYER~destination "*" $PLAYER~CURRENT_SECTOR "*q"
	setTextLineTrigger void1 :void1 "The shortest path" 
	setTextLineTrigger nopath :nopath "Error - No route within "
	pause
	:nopath
		killAllTriggers
		send "nq"
		return
	:void1
		killAllTriggers
		setTextLineTrigger void2 :void2 ">" 
		pause
		:void2 
		killAllTriggers

		getWord CURRENTLINE $warp1 3
		stripText $warp1 "("
		stripText $warp1 ")"
		send "cv" $warp1 "*q"
		setVar $voidfound 1

return

:voidfirstnotFed
	
	send "cf" $PLAYER~CURRENT_SECTOR "*" $PLAYER~destination "*q"
	setVar $course ""
	setTextLineTrigger voidnotfedl :voidnotfedl "The shortest path" 
	setTextLineTrigger noindirectfed :noindirectfed "Error - No route within"
	pause
	:noindirectfed
		killalltriggers
		send "yq"
		setVar $SWITCHBOARD~message "Not initial path, exiting.*"
		gosub :SWITCHBOARD~switchboard
		halt
	:voidnotfedl
		killalltriggers
		:keepaddingfed
		setTextLineTrigger addCoursefed :addCoursefed ">"
		setTextTrigger endCoursefed :endCoursefed "Computer command [" 
		pause
		:addCoursefed
			killalltriggers
			setVar $course $course & " " & CURRENTLINE
			goto :keepaddingfed
		:endCoursefed
			killalltriggers
			setVar $prevwarp ""
			setVar $y 1
			setVar $go 1
			while ($go = 1)
				
				getWord $course $warp $y
				if ($warp <> ">")
					stripText $warp "("
					stripText $warp ")"
					if (($warp > 10) and ($y > 1))
						setVar $go 0
						if ($warp <> $PLAYER~destination)
							send "cv" $warp "*q"
						end
					end
					
					setVar $prevwarp $warp
				end
				add $y 1
				if ($y > 50)
					setVar $go 0
				end
			end



return


:stripfig

    send "c;q"
    setTextLineTrigger getMaxFigs :getMaxFigs " Main Drive Cost: "
    pause
        :getMaxFigs
        killAllTriggers
        getWord CURRENTLINE $maxFigs 7
        striptext $maxFigs ","

        if ($maxFigs < $figsRequired)
            setVar $figsRequired $maxFigs
            setVar $SWITCHBOARD~message "You want more figs than this ship holds so readjusting to " & $maxFigs & ".*"
		    gosub :switchboard~switchboard
        end


    setVar $havecorpies 0
    setVar $totalFigs $player~fighters
    setVar $figsToTake ($figsRequired - $totalFigs)

    if ($figsToTake <= 0)
        setVar $SWITCHBOARD~message "We already have equal or more than " & $figsRequired &", exiting strip.*"
		gosub :switchboard~switchboard
        return
    end
    if ($figsRequired < 1)
        setVar $SWITCHBOARD~message "We didn't specify how many fighters is required for stripFigs.*"
		gosub :switchboard~switchboard
		halt
    end
    
	send "t"
	setVar $go 1
	setVar $i 1
	while ($go = 1)
		send "f"
		setVar $y 1
		while ($y < $i)
			send "nm"
			add $y 1
		end

        if ($havecorpies = 0)
            :waitcorpiesFigs
    #c count - if 100 alert and quit
            setTextLineTrigger nocorpiesFigs :nocorpiesFigs "Your Associate must be in the same sector to conduct transfers!"
            setTextTrigger corpiesFigs :corpiesFigs "Exchange with"
            pause 
            :nocorpiesFigs 
                killalltriggers
                send "f"
                goto :waitcorpiesFigs
            :corpiesFigs
                killalltriggers
                setVar $havecorpies 1
        else
		    waitfor "Exchange with"
        end
		send "yf"
		setTextLineTrigger Figs :Figs "fighters, and"
		setTextLineTrigger Figsdone :Figsdone "You may only be on one Corp at a time"
		pause
		:Figsdone 
			killalltriggers
			send "* * * * * * * * * "
			setVar $SWITCHBOARD~message "Fig Strip Complete.*"
			gosub :switchboard~switchboard
			return
		:Figs
			killalltriggers
			getText CurrentLine $DEFIG " has " "."
			stripText $DEFIG ","
			stripText $DEFIG " "
            # $figsToTake
            if ($DEFIG > 100)
                if ($figsToTake > ($DEFIG - 99))
                    setVar $takeFigs ($DEFIG -99)
                    setVar $figsToTake ($figsToTake - $takeFigs)
                else
                    setVar $takeFigs $figsToTake
                    setVar $figsToTake 0
                end
			
				send $takeFigs & "*"
			else
				setVar $DEFIG 0
				send "*"
			end
            
            if ($figsToTake = 0)
                setVar $SWITCHBOARD~message "Fig Strip Complete.*"
			    gosub :switchboard~switchboard
                send "* * * * * * * * * "
                return 
            end
		add $i 1
		if ($i > 10)
			send "* * * "
			halt
		end
	end

return
:copshop

    gosub :player~quikstats
    setVar $alignNeeded (500 - $player~ALIGNMENT)
    if ($alignNeeded < 0)
        send "a"
        setVar $SWITCHBOARD~message "You already have a fed comm.*"
		gosub :switchboard~switchboard
        return
    end

    send "p1*"
    
    :copitAgain
    waitfor "---"
    setTextLineTrigger noBountiesYet :noBountiesYet "Changed your mind eh? Too bad."
    setTextTrigger gotABounty :gotABounty "How much reward do you want to offer?"
    pause
    :noBountiesYet
        killalltriggers
        send "qpp1*"
        goto :copitAgain
    :gotABounty
        killalltriggers
        setVar $cashToGive ($alignNeeded * 1000)
        send $cashToGive "*a"
return

:fullstart  
    # now at Dock - Merch is still there with 490 figs
    # In Colt 
    setVar $cashRequired 1100000
    gosub :player~quikstats
	gosub :stripcash
    send "'" $wallBot " figs*"
    getSectorParameter 2 "KNOWNORE" $fuelSector 
    setVar $figsRequired 500
    gosub :player~quikstats
	gosub :stripfig

    setVar $stardock $player~current_sector
    setVar $twarpShipNum $player~SHIP_NUMBER
    send "cuyq"
    send "pshw2qp"
    goSub :copshop
    send "qq"
    waitfor "You return to your ship and blast off from the StarDock."
    gosub :player~quikstats
    if ($player~ALIGNMENT < 1000)
        setVar $SWITCHBOARD~message "You did not get your fedcom!!!*"
		gosub :switchboard~switchboard
		HALT
    end    

    # move us in - this is ok if first sector
    setVar $player~warpto $fuelSector
    gosub :player~twarp
    if ($player~twarpSuccess = FALSE)
        setVar $SWITCHBOARD~message "Sector missing fig, can't get more ore!*"
        gosub :SWITCHBOARD~switchboard
       halt
    end
    gosub :player~quikstats

    send "P t * * * "
    waitfor "Your offer ["
    
    setVar $player~warpto $stardock
    gosub :player~twarp
    if ($player~twarpSuccess = FALSE)
        setVar $SWITCHBOARD~message "We didn't get back to dock!!!*"
        gosub :SWITCHBOARD~switchboard
       halt
    end
    gosub :player~quikstats

    send "psss" $ogiginalShip "*y"
    waitfor "The shipmaster takes possession of your"

    send "bnygycSandStorm***"
    waitfor "will repossess any unmanned"
    send "sq"
    
    waitfor "vailable Ships in Orbit"
	setTextLineTrigger getSandoShipNum :getSandoShipNum "SandStorm"
	pause
		:getSandoShipNum
		getWord CURRENTLINE $sanShipNum 1
		killalltriggers

    send "qq"
    waitfor "You return to your ship and blast off from the StarDock"
    send "'" $SWITCHBOARD~BOT_NAME " x " $sanShipNum "*"
    waitfor " - Xport complete"
    send "pshrhqq"
    waitfor "You return to your ship and blast off from the StarDock"
    send "'" $SWITCHBOARD~BOT_NAME " x " $twarpShipNum "*"
    waitfor " - Xport complete"
    gosub :player~quikstats

    # Drop Sando Ship Off
    setVar $towShipNum $sanShipNum
    setVar $towShipSector 1
    goSub :towShipAndTwarp
    gosub :player~quikstats
    

    send "'" $SWITCHBOARD~BOT_NAME " x " $sanShipNum "*"
    waitfor " - Xport complete"
    gosub :player~quikstats
    setVar $figsRequired 500
    goSub :stripFig
    send "'" $SWITCHBOARD~BOT_NAME " x " $twarpShipNum "*"
    waitfor " - Xport complete"

    send "'" $wallBot " x " $sanShipNum "*"
    waitfor " - Xport complete"

    setVar $i 1
    while ($i < SECTORS)
        getSectorParameter $i "TUNNELDOOR" $isADoor
        if ($isADoor = 1)
            setVar $sandoGoTo $i
            setVar $i 99999
        end
        add $i 1
    end
    
    
    send "'" $wallBot " mow " $sandoGoTo "*"

    waitfor "{" & $wallBot & "} - Mow completed."
    send "'" $wallBot " wall " $stardock " 3 block*"
    waitfor "{" & $wallBot & "} - Wall Completed Block Routine"
    send "'" $wallBot " wall 1 6 limit:50 useblock holo*"
    waitfor "Putting up fig wall"

    gosub :player~quikstats
    setVar $player~warpto $fuelSector
    gosub :player~twarp
    if ($player~twarpSuccess = FALSE)
        setVar $SWITCHBOARD~message "We didn't make it - type 'go !' to try (no space). *"
        gosub :SWITCHBOARD~switchboard
        waitfor "go!"
    end
    gosub :player~quikstats
    send "P T * * * "
    waitfor "Your offer ["
    
    setVar $player~warpto $stardock
    gosub :player~twarp
    if ($player~twarpSuccess = FALSE)
        setVar $SWITCHBOARD~message "We didn't make it - type 'go !' to try (no space). *"
        gosub :SWITCHBOARD~switchboard
        waitfor "go!"
    end
    gosub :player~quikstats
    

    setVar $cashRequired 350000
    gosub :player~quikstats
	gosub :stripcash
    
    setVar $doraReturn 1
    :tryDoraAgain
    setVar $doraError 0

    setVar $bot~parm2 "new"
    goSub :buyDora
    setVar $doraShipNum $shipnum
    setVar $bot~parm2 ""

    if ($doraError = 1)
        setVar $SWITCHBOARD~message "Dora Fail - get 330K cash. type 'go !' to try (no space). *"
        gosub :SWITCHBOARD~switchboard
        waitfor "go!"
        goto :tryDoraAgain
    end
    setDelayTrigger fullpause :fullpause 1000
    pause
    :fullpause
    killAllTriggers

    goSub :moveToTunnel
    
return

:moveToTunnel
    # REQUIRES
    # $stardock
    # $doraShipNum
    # $fuelSector 
    # $xportShipNum
    # 

    setVar $hasfuel 0

    
    send "***"
    echo "IF WE GOT THIS FAR WE CAN START MOVING PEOPLE"
    getInput $corpMatesBot "Enter the persons bot name we will take"
    :tunnelTrouble
    getInput $tunnelDoor "Enter the tunnel door to take Dora Ship"

    send "tt.**q"
    waitfor "CMS link terminated"

    getSectorParameter $tunnelDoor "TUNNELINT" $tInternal
    if ($tInternal = "")
        getSectorParameter CURRENTSECTOR "BUBBLEINT" $tInternal
    end
    isNumber $isit $tInternal 
    if ($isit = TRUE)
        if ($tInternal > 0)
            setVar $towShipNum $doraShipNum
            setVar $towShipSector 1
            goSub :towShipAndTwarp
            gosub :player~quikstats
            setVar $current_ship $player~SHIP_NUMBER
            
            send "cf" $tunnelDoor "*" $tInternal "*q"
            waitfor "The shortest path"
            setTextLineTrigger getMoveToTunnelInt :getMoveToTunnelInt " > "
            pause
            :getMoveToTunnelInt
                killAllTriggers
                getWord CURRENTLINE $intSec 3
                STRIPTEXT $intSec "("
                STRIPTEXT $intSec ")"
            setVar $figsRequired 1000
            goSub :stripFig

            send "'" $corpMatesBot " x " $doraShipNum "*"
            waitfor "Xport complete"
            
            send "'" $corpMatesBot " ice2020 stripfig 500*"
            setTextLineTrigger corpMateStrip3 :corpMateStrip3 "Fig Strip Complete"
            setTextLineTrigger corpMateStrip4 :corpMateStrip4 "We already have equal or more than"
            pause
            :corpMateStrip3
            :corpMateStrip4
                killAllTriggers

            send "'" $corpMatesBot " ice2020 stripcash 17000*"
            setTextLineTrigger corpMateStrip1 :corpMateStrip1 "Cash Strip Complete"
            setTextLineTrigger corpMateStrip2 :corpMateStrip2 "We already have more than"
            pause
            :corpMateStrip1
            :corpMateStrip2
                killAllTriggers       

            send "'"  $corpMatesBot " mow " $intSec "*" 
            waitfor "[Mow] {" & $corpMatesBot &"} - Mow completed."
            send "'"  $corpMatesBot " dora 1200 buys ports mcicbuy*" 

           
            setVar $player~warpto $fuelSector
            gosub :player~twarp
            if ($player~twarpSuccess = FALSE)
                setVar $SWITCHBOARD~message "We didn't make it - type 'go !' to try (no space). *"
                gosub :SWITCHBOARD~switchboard
                waitfor "go!"
            else
                 send "P T * * * "
                waitfor "Your offer ["
            end
            gosub :player~quikstats
           
               
            setVar $player~warpto $stardock
            gosub :player~twarp
            if ($player~twarpSuccess = FALSE)
                setVar $SWITCHBOARD~message "We didn't make it - type 'go !' to try (no space). *"
                gosub :SWITCHBOARD~switchboard
                waitfor "go!"
            end
            gosub :player~quikstats

        else
            setVar $SWITCHBOARD~message "Not a known tunnel- type 'go !' to renter again (no space).*"
            gosub :switchboard~switchboard
            waitfor "go!"
            goto :tunnelTrouble
        end
    else
        setVar $SWITCHBOARD~message "Not a known tunnel- type 'go !' to renter again (no space).*"
        gosub :switchboard~switchboard
        waitfor "go!"
        goto :tunnelTrouble
    end
return

:towShipAndTwarp
        
    gosub :player~quikstats
    if ($player~ORE_HOLDS < 60)
        setVar $SWITCHBOARD~message "Less than 60 ore.. type 'go !' to try (no space).*"
        gosub :switchboard~switchboard
        waitfor "go!"
    end
    send "'" $SWITCHBOARD~BOT_NAME " tow " $towShipNum "*"
    setTextLineTrigger towGoodtowAndGo :towGoodtowAndGo "Tow locked onto ship number"
    setTextLineTrigger towBadtowAndGo :towBadtowAndGo "That ship number is not in the sector"
    pause
    :towBadtowAndGo
        killAllTriggers
        setVar $SWITCHBOARD~message "Couldn't locate the ship - Attach ship and type 'go !' to try (no space).*"
        gosub :switchboard~switchboard
        waitfor "go!"
    :towGoodtowAndGo
        killAllTriggers

    setVar $player~warpto $towShipSector
    gosub :player~twarp
    if ($player~twarpSuccess = FALSE)
        setVar $SWITCHBOARD~message "We didn't make it out with the ship!!!.. type 'go !' to try (no space).*"
        gosub :switchboard~switchboard
        waitfor "go!"
    end

return

:getAtm

    if ($bot~parm2 <> "")
		setVar $friendbot $bot~parm2
    else
        setVar $SWITCHBOARD~message "Please specify the bot name (i.e. ham / kane) you will be taking cash from*"
        gosub :switchboard~switchboard
        HALT
	end

    gosub :player~quikstats
    setVar $startLocation $player~current_sector
    
    setTextLineTrigger friendISTrading :friendISTrading "{"& $friendbot & "} - Trade starting up!"
    setTextLineTrigger friendISPPTing :friendISPPTing "{"& $friendbot & "} - Paired Port Trade starting up!"
    setDelayTrigger friendNotHome :friendNotHome 30000
    pause
    :friendNotHome
        killalltriggers
        setVar $SWITCHBOARD~message "Waited 30 seconds, no response from friendy trader*"
        gosub :switchboard~switchboard
        return
    :friendISTrading
    :friendISPPTing
        killalltriggers
        send "'[atm:" $friendbot "]*"
        
    setTextLineTrigger atmIsReadyForAction :atmIsReadyForAction "[atm:" & $friendbot & "="
    pause
    :atmIsReadyForAction
    killalltriggers 
        getText CURRENTLINE $atmLocation $friendbot & "=" "]"
        echo $atmLocation
    
    setVar $player~warpto $atmLocation
    gosub :player~twarp
    if ($player~twarpSuccess = FALSE)
        setVar $SWITCHBOARD~message "We didn't make it out with the ship!!!*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
    gosub :player~quikstats

    send "P T * * * "
    waitfor "Your offer ["
    send "tcyf"
    setTextLineTrigger atmGetCreds :atmGetCreds "credits, and"
    pause
    :atmGetCreds
    killalltriggers
        getWord CURRENTLINE $cashheld 8
        STRIPTEXT $cashheld "."
        STRIPTEXT $cashheld ","
        setVar $cashToTake ($cashheld - 35000)
        if ($cashToTake > 0)
            send $cashToTake "*"
        else
            send "0*"
        end
        send "q"

    waitfor "Command ["
    send "'[atmdone]*"
    setVar $player~warpto $startLocation
    gosub :player~twarp
    if ($player~twarpSuccess = FALSE)
        setVar $SWITCHBOARD~message "We didn't make it out with the ship!!!*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
    gosub :player~quikstats

    
return


include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\player\moveintosector\player"

