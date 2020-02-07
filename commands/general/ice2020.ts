gosub :BOT~loadVars


setVar $BOT~help[1]  $BOT~tab&"    ice2020 [command]"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&"    setdora   - Preps for Dora and gets out safely."
setVar $BOT~help[4]  $BOT~tab&"    stripcash - strips cash from corp mates (11k+ req)"
setVar $BOT~help[5]  $BOT~tab&"    buydora   - Buys and setsup Merchie for trading "
setVar $BOT~help[6]  $BOT~tab&"    buymerch  - buys Merch and set it up "
setVar $BOT~help[7]  $BOT~tab&"    buycolt   - buys Colt "
setVar $BOT~help[8]  $BOT~tab&"    movecolt  - moves Colts to sectors  "
setVar $BOT~help[9]  $BOT~tab&"                  >movecolt 95 16822 87 "
setVar $BOT~help[10] $BOT~tab&"    grabcolo  - fills any Colt in sector with colos "
setVar $BOT~help[11] $BOT~tab&"    docim     - downloads port/warp data "
setVar $BOT~help[12] $BOT~tab&"    runtrade  - cim - figs - tradereport "

gosub :bot~helpfile

setVar $BOT~script_title "ICE2020 Utilities"
setVar $pod #42 & #42 & #42 & " Escape Pod " & #42 & #42 & #42

gosub :BOT~banner


if ($bot~parm1 = "setdora")
	gosub :setDora
	halt
end

if ($bot~parm1 = "stripcash")
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


:setDora
    gosub :player~quikstats
	setVar $location $player~current_prompt
	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Start from Command Prompt.*"
		gosub :switchboard~switchboard
		HALT
	end

    goSub :stripcash
    goSub :buydora

    setVar $exitSector 0
    setVar $exitSectorDen 0
    setVar $exitSectorAnom 0

    goSub :setExitSector 

    echo "ExitSector:" $exitSector " exitSectorDen: " $exitSectorDen " exitSectorAnom: " $exitSectorAnom "*"

    goSub :mowOutFromDock

	send "'" $SWITCHBOARD~BOT_NAME " dora 1300 buys warps*"
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
        load "scripts\mombot\modes\grid\mow.cts"
        setEventTrigger		mowterraended		:mowterraended "SCRIPT STOPPED" "scripts\mombot\modes\grid\mow.cts"
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
        load "scripts\mombot\commands\general\scrub.cts"
        #setEventTrigger		scrubfinished		:scrubfinished "SCRIPT STOPPED" "scripts\mombot\commands\general\scrub.cts"
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
				load "scripts\mombot\modes\grid\mow.cts"
				setEventTrigger		mowended		:mowended "SCRIPT STOPPED" "scripts\mombot\modes\grid\mow.cts"
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
        
    
    # strip someone of cash
    # sell ship and get in merch
    # lift and density check
    #   check safe exits
    #   if 0 found, void others
    #       elseif only 100s, void others
    #
    #           Check for -ve alignments
    #           elseif < 500 and no anomoly
    #               else if < 500 + anomoly
    #                   Mow to terra safest route
    #                   Strip Limp, and continue
    #                       Else - ABORT - need to twarp out

    #      Find sector 5 warps out - Mow not dropping figs
    #       Do fig scan 
    #       Start default dora settigs


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
    load "scripts\mombot\commands\data\figs.cts"
    setEventTrigger		figsrun		:figsrun "SCRIPT STOPPED" "scripts\mombot\commands\data\figs.cts"
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
    load "scripts\mombot\modes\cashing\marco.cts"
    setEventTrigger		marcorun		:marcorun "SCRIPT STOPPED" "scripts\mombot\modes\cashing\marco.cts"
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
	send "w** "
	settextlinetrigger foundcolt :foundcolt "  0  Colonial Transport"
	settextlinetrigger nomore :nomore "Choose which ship to tow (Q=Quit)"
	settextlinetrigger nomore2 :nomore "You do not own any other ships in this sector!"
	pause
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
		add $colts 1
		setvar $colts[$colts] $shipnumber
		settextlinetrigger foundcolt :foundcolt "  0  Colonial Transport"
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
	if ($player~credits < 565000)
		setVar $SWITCHBOARD~message "Need 565k for Colt, 120 holds, twarp and torp*"
		gosub :switchboard~switchboard
		halt
	end
	send "pssbnyfyc1234512345***sq"

	waitfor "vailable Ships in Orbit"
	setTextLineTrigger theship :theship "1234512345"
	pause
		:theship
		getWord CURRENTLINE $shipnum 1
		killalltriggers

		send "qqx*" $shipnum "*qpss"
		waitfor "You walk past row after row of space ships"
		send "ryShip " $shipnum "*y"
		send "pa120*yb200*c500*qqhrw1t1*qq"
		waitfor "You return to your ship and blast off from the StarDock."
		send "x*" $origship "**"
		setVar $SWITCHBOARD~message "Colt purchased.*"
		gosub :switchboard~switchboard
		halt
return

:stripcash
    setVar $havecorpies 0
    setVar $totalCash $player~credits
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
			if ($DECASH > 11000)
				setVar $DECASH ($DECASH - 5000)
				send $DECASH & "*"
			else
				setVar $DECASH 0
				send "*"
			end
            add $totalCash $DECASH
            if ($totalCash > 350000)
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

:buydora
	
	gosub :atdockinmerch
	
	send "pssbyygycLets Go**pa120*yb500*qqhrhqq"
	waitfor "You return to your ship and blast off from the StarDock"
	goSub :player~quikstats
    if ($player~TOTAL_HOLDS <> 150)
        setVar $SWITCHBOARD~message "Do not have 150 holds ,press go ! (no space) to continue or tab tab to stop..*"
	    gosub :switchboard~switchboard
        waitfor "go!"
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
	
	send "pssbyybycSitInIt**qq"
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

:swap_ore
     You flag down a used ship salesperson and get ready to deal.

                    --<  Available Ships in Orbit >--
        Ship  Sect Name                  Fighters Shields Hops Type
        -----------------------------------------------------------------------------
        4  2146 s               Corp      500       0    0  Merchant Cruiser

        Choose which ship to sell (Q=Quit) Q

   # this should both scan and take in a var
    echo "**"
    echo ANSI_11 "This automates the process of trading ore between ships.**"
    echo ANSI_15 "It pops a planet, drops ore and re-docks.*"
    echo ANSI_15 "After a brief pause it then lifts, xports, grabs the ore and re-docks.*"
    echo ANSI_15 "The result... you're in your new ship, safe at dock w/ ore.*"
    echo ANSI_15 "It tries to be as safe as possible but there's always some risk.*"
    echo "*"
    echo ANSI_14 "Are you sure you want to start the Ore Swapper X-port? (y/N)*"
    getConsoleInput $choice singlekey
    upperCase $choice
    if ($choice = "Y")
        goto :init_ore_swap_vars
    else
        echo ANSI_12 & "**Aborting Ore Swapper X-port.*"
        halt
    end
    :init_ore_swap_vars
    setVar $funky_counter 0
    getInput $shipnum "Ship number to transfer fuel to: "
    isNumber $numtest $shipnum
    if ($numtest < 1)
        echo ANSI_12 "*Invalid ship number!*"
        halt
    end
    if ($shipnum < 1) OR ($shipnum > 65000)
        echo ANSI_12 "*Invalid ship number!*"
        halt
    end
    :top_of_ore_swap
    gosub :PLAYER~quikstats
    add $funky_counter 1
    if ($PLAYER~GENESIS < 1)
        echo ANSI_12 "**Out of Genesis Torps. You're going to need one for this.*"
        halt
    end
    if ($player~ore_holds < 3)
        echo ANSI_12 "**There's no ore on your ship! You can't drop ore if you don't have any.*"
        halt
    end
    send "qqq  z  n  u  y  *  .*  z  c  *  p  s  h "
    waitOn "Landing on Federation StarDock."
    getRnd $rand_wait 100 300
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
    echo ANSI_12 "**You somehow ran out of Genesis Torps before launching. This should not have happened! Check your status!*"
    send "? "
    halt
    :res_nopln
    echo ANSI_12 "**The planet is gone! Someone might be messing with us.*"
    if ($funky_counter < 4)
        goto :top_of_ore_swap
    else
        echo ANSI_12 "**I've tried this 3 times, something is definately going on. Check your status!*"
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
            echo ANSI_12 "**The planet is gone! Someone might be messing with us.*"
            if ($funky_counter < 4)
                goto :top_of_ore_swap
            else
                    echo ANSI_12 "**I've tried this 3 times, something is definately going on. Check your status!*"
                    send "? "
                halt
            end
        end
    waitOn "Landing on Federation StarDock."
    waitOn "<Hardware Emporium> So what are you looking for (?)"
    getRnd $rand_wait 100 300
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
    echo ANSI_12 "**Our planet is gone! Someone might be messing with us.*"
    if ($funky_counter < 4)
            goto :top_of_ore_swap
    else
        echo ANSI_12 "**I've tried this 3 times, something is definately going on. Check your status!*"
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
        send "x    " & $shipnum & "    *    *    *   "
        send "l " & $pnum & "  *  *  z  n  z  n  *  z  q  a  *  q  q  z  n  "
        send "p  s  h "
        pause
    :swap_xport_notavail
        setVar $msg $msg & ANSI_12 & "*That ship is not available, using the original ship...*"
        pause
    :swap_xport_badrange
        setVar $msg $msg & ANSI_12 & "*That ship is too far away, using the original ship...*"
        pause
    :swap_xport_security
        setVar $msg $msg & ANSI_12 & "*That ship is passworded, using the original ship...*"
        pause
    :swap_xport_noaccess
        setVar $msg $msg & ANSI_12 & "*Cannot access that ship, using the original ship...*"
        pause
    :swap_xport_xprtgood
        setVar $msg $msg & ANSI_10 & "*Xport good!*"
        pause
    :swap_pland_noplnet1
        setVar $msg $msg & ANSI_12 & "*The planet has gone missing. Check your status!*"
        pause
    :swap_pland_noplnet2
        setVar $msg $msg & ANSI_12 & "*The planet has gone missing. Check your status!*"
        pause
    :swap_pland_noplnet3
        setVar $msg $msg & ANSI_12 & "*The planet has gone missing. Check your status!*"
        pause
    :swap_pland_prodtakn
        setVar $msg $msg & ANSI_10 & "*Products collected!*"
        pause
    :swap_pland_complete
            killalltriggers
        gosub :PLAYER~quikstats
        waitOn "<Hardware Emporium> So what are you looking for (?)"
        echo $msg
        halt
    pause
    halt
    # -------------------------------------------------------------------
    :pland_trg_1
    setVar $msg ANSI_12 & "**There are no planets in the StarDock sector!*"
    pause
    :pland_trg_2
    setVar $msg ANSI_12 & "**That planet is not in the StarDock sector!*"
    pause
    :pland_trg_3
    setVar $msg ANSI_10 & "**Products taken!*"
    pause
    :pland_trg_4
    setVar $msg ANSI_10 & "**Fuel dropped!*"
    pause
    :pland_trg_6
    setVar $msg ANSI_10 & "**Planet destroyed!*"
    pause
    :pland_trg_5
    gosub :PLAYER~quikstats
    waitOn "<Hardware Emporium> So what are you looking for (?)"
        killalltriggers
    echo $msg
    halt

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\quikstats\player"
