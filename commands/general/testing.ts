gosub :BOT~loadVars
loadvar $SWITCHBOARD~bot_name 
loadvar $bot~corppassword
loadvar $player~corpnumber

setVar $BOT~help[1]  $BOT~tab&"    ice2021 [command]"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&"    buyfed    - 1.8 Mil cash - buys ship and fed com"
setVar $BOT~help[4]  $BOT~tab&"    getore1   - Will make a planet, pause, pick up ore"
setVar $BOT~help[5]  $BOT~tab&"    getore10  - Will make 10 planets, attempt to pick up ore"
setVar $BOT~help[6]  $BOT~tab&"                (For when someone blows planets at docks)"
setVar $BOT~help[7]  $BOT~tab&"    gopod     - Goto pod sector at start of game"
setVar $BOT~help[8]  $BOT~tab&"    masterpod - MD: Will pod corpies in sector"
setVar $BOT~help[9]  $BOT~tab&"                everyone assembles with gopod, MD runs this"
setVar $BOT~help[10] $BOT~tab&"                then >sellship >buyfed"
setVar $BOT~help[11] $BOT~tab&"              "
setVar $BOT~help[12] $BOT~tab&"    crazymow  - Mows to sectors start of game with no safety"

gosub :bot~helpfile

setVar $BOT~script_title "ICE2021 Utilities"

gosub :BOT~banner

setVar $podpeople[1] "mind"
setVar $podpeople[2] "kane"
setVar $podpeople[3] "horns"
setVar $podpeople[4] "matt"
setVar $podpeoplei 4

setVar $podpeopleok 0

if ($bot~parm1 = "buyfed")
	gosub :buyfed
	halt
end
if ($bot~parm1 = "getore1")
	gosub :getore1
	halt
end
if ($bot~parm1 = "getore10")
	gosub :getore10
	halt
end

if ($bot~parm1 = "crazymow")
    goSub :crazyMow
    halt
end

if ($bot~parm1 = "gopod")
    goSub :gopod
    halt
end


if ($bot~parm1 = "preppod")
    goSub :preppod
    halt
end

if ($bot~parm1 = "masterpod")

    goSub :masterpod
    halt
end

if ($bot~parm1 = "waitandmow")
    goSub :waitandmow
    halt
end



setVar $SWITCHBOARD~message "Strewth mate, if you've got ere you've gone walkabout. Have a yarn with the help file and see whats what.*"
gosub :SWITCHBOARD~switchboard

halt

:waitandmow
    send "co*cq"
    send "nq"
    setTextLineTrigger getDockwait :getDockwait "(S) Sector  :"
    pause
    :getDockwait
        killalltriggers
        getWord CURRENTLINE $stardock 4

    gosub :player~quikstats

    setVar $towship $bot~parm2
    send "x* " $towship "* * "

    setVar $figsRequired 1000
    gosub :player~quikstats
	gosub :stripfig

    send "wn" $player~SHIP_NUMBER "*"
    setVar $towship $player~SHIP_NUMBER
    setDelayTrigger briefwait :briefwait 2000
    pause
    :briefwait
        setvar $mow~destination $stardock
        setvar $mow~deploy "0"
        gosub :mow~run

    
    gosub :player~quikstats
    if ($player~current_sector <> $stardock)
        halt
    end
    
    send "x* " $towship "* * "
   
    setVar $BOT~command "reboot"
    setVar $BOT~user_command_line " reboot "
    setVar $BOT~parm1 ""
    setVar $BOT~parm2 ""
    saveVar $BOT~parm1
    saveVar $BOT~parm2
    saveVar $BOT~command
    saveVar $BOT~user_command_line
    load "scripts\"&$bot~mombot_directory&"\commands\general\reboot.cts"
    setEventTrigger		rebootdone		:rebootdone "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\general\reboot.cts"
    pause
    :rebootdone
    killalltriggers
return


:masterpod 
    gosub :player~quikstats
    if ($PLAYER~CURRENT_PROMPT <> "Command")
        setVar $SWITCHBOARD~message "Need to be at Command Prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
    end

    send "tt.**q"

    send "i"
    setTextLineTrigger getCorp :getCorp "Corp           #"
    pause
    :getcorp
    getWord CURRENTLINE $corpnum 3
    STRIPTEXT $corpnum ","
    gosub :player~quikstats

    setVar $secs 0
    setVar $seci 0
    send "d"
    setTextLineTrigger getwarps :getwarps "Warps to Sector(s) :"
    pause
    :getwarps
       
        setVar $stuff CURRENTLINE & " done"
        setVar $y 5
        setVar $go 1
        while ($go = 1)
            getWord $stuff $warp $y
            if ($warp = "done")
                setVar $go 0
            elseif ($warp <> "-")
                stripText $warp "("
                stripText $warp ")"
                add $seci 1
                setVar $secs[$seci] $warp

            end
            add $y 1
            if ($y > 50)
                setVar $go 0
            end

        end

    setVar $i 1
    while ($i <= $seci)

        send "cf" $player~current_sector "*" $secs[$i] "*q"
        send "cf" $secs[$i] "*" $player~current_sector "*q"
        

        add $i 1
    end
    send "^q"
    waitfor ": ENDINTERROG"


    setVar $player~surroundFigs 1
    gosub :grid~surround
    send "tt.**q"

    setVar $currentSec $player~current_sector

    setVar $i 1
    while ($i <= SECTOR.WARPCOUNT[$currentSec])
        setVar $csec SECTOR.WARPS[$currentSec][$i]
        getSectorParameter $csec "FIGSEC" $hasfig

        if ($hasfig <> 1)
            setvar $mow~destination $csec
            setvar $mow~deploy "1"
            gosub :mow~run

            setvar $mow~destination $currentSec
            setvar $mow~deploy "1"
            gosub :mow~run
        end
        add $i 1
    end

    setVar $podi 1
    while ($podi <= $podpeoplei)
        if ($podpeople[$podi] = $SWITCHBOARD~bot_name)
            #myturn
            goSub :preppod
            :macagain
            send "'" $podpeople[2] " mac ajyj1^Majnjyj1^M^Majnjnjyj1^M^M*"
            setTextLineTrigger macrowait :macrowait "Macro Complete"
            setDelayTrigger macrofail :macrofail 1500
            pause
            :macrofail
                killAllTriggers
                goto :macagain
            :macrowait
                killAllTriggers
            send "'" $podpeople[$podi] " corp join " $corpnum " " $bot~corppassword "*"
            waitfor "I joined the Corporation"
         
        else

            send "'" $podpeople[$podi] " callout*"
            setTextLineTrigger corpmate :corpmat " Sec:"
            setDelayTrigger cmtimeout :cmtimeout 3000
            pause
            :cmtimeout
                killAllTriggers
                send "'Corpie timed out, moving on*"
                goto :podloopend
            :corpmat
                killAllTriggers
                setVar $podpeopleok[$podi] 1
                #R hammer Team: None Sec: 14510 Exp: 786 Aln: 1343 Creds: 43277 Ship: 1 Turns: 4298
                cuttext CURRENTLINE $theirname 3 6
                gettext CURRENTLINE $theirsec "Sec: " " Exp:"
                TRIM $theirname
                gettext CURRENTLINE $theirship "Ship: " " Turns:"

                if ($theirsec = $player~current_sector)
                    setVar $podVictim $podpeople[$podi]
                    setVar $podName $theirname
                    goSub :podPerson
                    send "'" $podpeople[$podi] " corp join " $corpnum " " $bot~corppassword "*"
                    waitfor "I joined the Corporation and Claimed my Ship Corporate!"
                    
                else
                    send "'their not in our sector!*"
                end 
        end

        :podloopend
        add $podi 1
    end

    send "f"
    setTextLineTrigger figtrig1 :figtrig1 "fighters available."
    setTextLineTrigger figtrig2 :figtrig2 "Your ship can support up to"
    pause
    :figtrig1
        getWord CURRENTLINE $figsAvail 3
        STRIPTEXT $figsAvail ","
        pause
    :figtrig2
        getWord CURRENTLINE $figsSup 7
        STRIPTEXT $figsSup ","
        killAllTriggers
        if ($figsSup < $figsAvail)
            setVar $dep ($figsAvail - $figsSup)
            send $dep "*cd"
        else
            if ($figsAvail > 0)
                send "1*cd"
            else
                send "0*"
            end
        end

    send "co*cq"

    setVar $ships ""
    setVar $shipsi 0

    send "wn*"
    waitfor "-------------------------"
    setTextLineTrigger towline :towline "0"
    setTextLineTrigger towdone :towdone "Choose which ship to tow"
    pause
    :towline
        add $shipi 1
        getword CURRENTLINE $ship 1
        setVar $ships[$shipi] $ship
    
        setTextLineTrigger towline :towline "0"
        pause
    :towdone
        killAllTriggers

    send "wn" $ships[1] "*"
    
    setVar $y 2

    setVar $podi 1
    while ($podi <= $podpeoplei)
        if ($podpeopleok[$podi] = 1)
          
            send "'" $podpeople[$podi] " ice2021 waitandmow " $ships[$y] "*" 
            add $y 1
        end
        add $podi 1
    end
    send "nq"
    setTextLineTrigger getDockwait2 :getDockwait2 "(S) Sector  :"
    pause
    :getDockwait2
        killalltriggers
        getWord CURRENTLINE $stardock 4

    setvar $mow~destination $stardock
    setvar $mow~deploy "1"
    gosub :mow~run
    
    setVar $i 1
    while ($i < 50)
        send "a z 10* "
        add $i 1
    end
    send "* * n s **"

     
    gosub :player~quikstats
    if ($player~current_sector <> $stardock)
        halt
    end

    echo "BRIEF PAUSE WHiLE WE LET CORPIES ARRIVE*"
    echo "BRIEF PAUSE WHiLE WE LET CORPIES ARRIVE*"
    
    setDelayTrigger waitforCorps :waitforCorps 2000
    pause
    :waitforCorps

    send "x* " $ships[1] "* * "
    setVar $figsRequired 2000
    gosub :player~quikstats
	gosub :stripfig
    



return

:podPerson
    # $podVictim - bot name of the person about to be podded
    # Assumes same sector

    send "'" $podVictim " ice2021 preppod*"
    setTextLineTrigger victimReady :victimReady "{" & $podVictim & "} - Ready to be podded."
    setDelayTrigger victimelost :victimelost 4000
    pause
    :victimelost
        killAllTriggers
        setVar $SWITCHBOARD~message "Victime didn't respond... moving on*"
        gosub :SWITCHBOARD~switchboard
        return
    :victimReady
        killAllTriggers
      
	send "a"
	waitfor "<Attack>"

	:attackcont
	setTextTrigger att :att "(Y/N) [N]?"
	setTextTrigger endatt :endatt "Command ["
	pause
	:att
		killalltriggers
        #Attack bb's Trade Master (99-1,104) (Y/N) [N]? No
        GETTEXT CURRENTLINE $tempname "Attack " "'s"
        getlength $tempname $len 
        if ($len > 6)
            setvar $temp $tempname
            cutText $temp $tempname 1 6
        end

        GETTEXT CURRENTLINE $shiptype "'s " " ("
        GETWORD $shiptype $ship 1

        if ($ship = "unmanned")
            send "n"
            goto :attackcont
        end
        if ($ship = "Trade") and ($tempname = $theirname)
            GETTEXT CURRENTLINE $figcount "-" ") ("
            if ($figcount = 0)
                send "y1*"
                return
            else
                echo "PROBLME THEY HAVE FIGS!!"
                echo "'This person has figs, should not!*"
                send "* * * * *"
                return
            end
        else
            send "n"
            goto :attackcont
        end
    :ENDATT
        killAllTriggers
        return
return



:preppod
    gosub :player~quikstats
    send "f"
    setTextLineTrigger deployfig :deployfig " fighters available."
    pause
    :deployfig
        killAllTriggers
        getWord CURRENTLINE $figs 3
        STRIPTEXT $figs ","
        if ($figs = 0)
            send "0*"
        else
            send $figs "*cd"
        end
        setVar $BOT~command "corp"
        setVar $BOT~user_command_line " corp drop "
        setVar $BOT~parm1 "drop"
        setVar $BOT~parm2 ""
        saveVar $BOT~parm1
        saveVar $BOT~parm2
        saveVar $BOT~command
        saveVar $BOT~user_command_line
        load "scripts\"&$bot~mombot_directory&"\commands\general\corp.cts"
        setEventTrigger		dropcorp		:dropcorp "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\general\corp.cts"
        pause
        :dropcorp
            killalltriggers
    
    setVar $SWITCHBOARD~message "Ready to be podded.*"
    gosub :SWITCHBOARD~switchboard
    
return




:gopod
    gosub :player~quikstats

    if ($PLAYER~CURRENT_PROMPT <> "Command")
        setVar $SWITCHBOARD~message "Need to be at Command Prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
    end

    send "v"
    send "nq"
    setTextLineTrigger getBackDockgoPod :getBackDockgoPod "(S) Sector  :"
    pause
    :getBackDockgoPod
        killalltriggers
        getWord CURRENTLINE $stardock 4
       
    

    #grab figs
    send "cr*q"
    setTextLineTrigger sec1Figs :sec1Figs "B  Fighters        :"
    pause
    :sec1Figs
        killAllTriggers
        getWord CURRENTLINE $maxfigs 8
        subtract $maxFigs 200
        if ($maxFigs > 250)
            setVar $maxFigs 250
        end

        if ($maxFigs > 0)
            send "ptb" $maxFigs "*q"
        end

    send "cv0*yyq"

    setVar $PLAYER~destination $stardock
    goSub :voidfirstnotFed

    setVar $go 1
	while ($go = 1)
		goSub :getWarpAndAvoid
    
		if ($voidfound = 0)
			setVar $go 0
		end
	end

    setVar $course ""
    setVar $backdoorRoute ""
    setVar $backdoorRoutei 0
    setVar $terraRoute ""
    setVar $terraRoutei 0

    send "cf1*" $stardock "*q"
    waitfor "The shortest path"
    setTextLineTrigger bdroute1 :bdroute1 ">"
    setTextLineTrigger bdroute2 :bdroute2 "command ["
    pause
    :bdroute1 
        setVar $course $course & " " & CURRENTLINE
        setTextLineTrigger bdroute1 :bdroute1 ">"
        pause
    :bdroute2 
        killAllTriggers
        setVar $course $course & " done"
        setVar $y 1
        setVar $go 1
        while ($go = 1)
            
            getWord $course $warp $y
            if ($warp = "done")
                setVar $go 0
            elseif ($warp <> ">")
                stripText $warp "("
                stripText $warp ")"
                add $backdoorRoutei 1
                setVar $backdoorRoute[$backdoorRoutei] $warp
            end
            add $y 1
            if ($y > 50)
                setVar $go 0
            end
        end
    setVar $voidi ($backdoorRoutei - 3)
    setVar $backdoori ($backdoorRoutei - 2)
   #Warps to Sector(s) :  4781 1st b - 6531 dock - 8428 - 9373
    setVar $go 1
    while ($go = 1)
        :tryvoidagain
        setVar $course ""
        send "cv" $backdoorRoute[$voidi] "*q"
        send "cf" $backdoorRoute[$backdoori] "*1*q"
        setTextLineTrigger badReturnRoute :badReturnRoute "Error - No route within"
        setTextLineTrigger goodREturnRoute :goodREturnRoute "The shortest path"
        pause
        :badReturnRoute
            killAllTriggers
            send "nq"
            send "cv0*yn" $backdoorRoute[$voidi] "*q"
            setVar $voidi ($voidi - 1)
            setVar $backdoori ($backdoori - 1)
            goto :tryvoidagain

        :goodREturnRoute
            killAllTriggers
           
            setTextLineTrigger bdroute3 :bdroute3 ">"
            setTextLineTrigger bdroute4 :bdroute4 "command ["
            pause
            :bdroute3 

                setVar $course $course & " " & CURRENTLINE
                setTextLineTrigger bdroute3 :bdroute3 ">"
                pause
            :bdroute4 
                killAllTriggers
                setVar $course $course & " done"
                setVar $y 1
                setVar $go2 1
                while ($go2 = 1)
                    
                    getWord $course $warp $y
                    if ($warp = "done")
                        setVar $go2 0
                    elseif ($warp <> ">")
                        stripText $warp "("
                        stripText $warp ")"
                        add $terraRoutei 1
                        setVar $terraRoute[$terraRoutei] $warp
        
                    end
                    add $y 1
                    if ($y > 50)
                        setVar $go2 0
                    end
                end

                #we now have route back, avoiding going along inwards path.
                # we want to move two back, off the main route, so we can surround unhindered
                setVar $destsector $terraRoute[3]
                setVar $go 0
    end

    setvar $mow~destination $destsector
    setvar $mow~deploy "1"
    gosub :mow~run
    
    killalltriggers


return


:buyfed
    gosub :player~quikstats
	setVar $origship $player~SHIP_NUMBER
	setVar $location $player~current_prompt
    if ($player~ALIGNMENT >= 1000)
        setVar $cashNeeded 1300000
        setVar $getFed 0
    
    else
        setVar $cashNeeded 1800000
        setVar $getFed 1
    end

	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Start from Command Prompt.*"
		gosub :switchboard~switchboard
        halt
	end

    if ($player~credits < $cashNeeded)
        setVar $SWITCHBOARD~message "Need "  & $cashNeeded & " cash to get Fed.*"
        gosub :switchboard~switchboard
       halt
    end
    
    send "ps"

    if ($getFed = 1)
        send "p"
        goSub :copshop
        send "q"
    end
    send "sbyyiycSHIPNAME**"
    gosub :player~quikstats
    send "ryFed Ship " $player~SHIP_NUMBER "*y"
    send "pb500*qqhrhfyw2t10*qq"

    gosub :getore1

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

:getore10

    gosub :player~quikstats
    if ($player~PLANET_SCANNER <> "Yes")
        setVar $SWITCHBOARD~message "Need planet scanners to be safe.*"
		gosub :SWITCHBOARD~switchboard
        return
    end
    setVar $planetsToMake 10
    goSub :makeAPlanet
    
    goSub :reCheckPlanets
    setVar $p1 $planet~planeti - 2
    setVar $p2 ($planet~planeti - 1)
    send "l j" & #8 & $planet~planets[$p1] & "*  t n  t 1* * q * * "
    send "l j" & #8 & $planet~planets[$p2] & "*  t n  t 1* * q * * "
return


:getore1
    gosub :player~quikstats
    if ($player~PLANET_SCANNER <> "Yes")
        setVar $SWITCHBOARD~message "Need planet scanners to be safe.*"
		gosub :SWITCHBOARD~switchboard
        return
    end
    setVar $planetsToMake 1
    goSub :makeAPlanet
    if ($lastPlanetOre = 1)
        goSub :reCheckPlanets
        setDelayTrigger smallpause :smallpause 125
        pause
        :smallpause
        killAllTriggers
        send "l j" & #8 & $lastPlanetNum & "*  t n  t 1* * q * * "
    else
        setVar $SWITCHBOARD~message "Not a fuel planet, try again.*"
		gosub :SWITCHBOARD~switchboard
    end

return


:makeAPlanet
    # DO QUIKSTATS FIRST
    # $planetsToMake

    
	if ($player~GENESIS = 0)
		 setVar $SWITCHBOARD~message "No Torps!*"
		gosub :switchboard~switchboard
        halt
	end
    if ($planetsToMake > $player~GENESIS)
        setVar $planetsToMake $player~GENESIS
    end
    setVar $i 1

    while ($i <= $planetsToMake)
        send "u y n .* z p * "
        add $i 1
    end
    send "^q"

	:buildPlanet
	setTextLineTrigger buildPlanet3 :buildPlanet3 "(Class M, Earth)"
	setTextLineTrigger buildPlanet1 :buildPlanet1 "(Class M, Dead Planet)"
	setTextLineTrigger buildPlanet4 :buildPlanet4 "(Class K-BE, Hell on Earth)"
	setTextLineTrigger buildPlanet2 :buildPlanet2 "(Class H-KBL, Earth's Fire)"
	setTextLineTrigger buildPlanet5 :buildPlanet5 "(Class K-O, Earth's Eden)"
	setTextLineTrigger buildPlanet6 :buildPlanet6 "(Class a-ci, Dead Earth)"
	setTextLineTrigger buildPlanet7 :buildPlanet7 ": ENDINTERROG"
	pause
	:buildPlanet1
	:buildPlanet2
		killAllTriggers
        setVar $lastPlanetOre 1
		goto :buildPlanet

	:buildPlanet3
    :buildPlanet4
    :buildPlanet5
    :buildPlanet6
        killAllTriggers
        setVar $lastPlanetOre 0
		goto :buildPlanet

    :buildPlanet7
        killAllTriggers

    return
			
return


:reCheckPlanets


	
	setVar $planet~planetsInSector 0
	setVar $planet~planets 0
	setVar $planet~planeti 1
	send "l*"
	setVar $startLogging 0
	:reCheckPlanetsT
	setTextLineTrigger reCheckPlanetsT1 :reCheckPlanetsT1 "There isn't a planet in this sector."
	setTextLineTrigger reCheckPlanetsstart :reCheckPlanetsstart "------------------------------------------------------------------------------"
	setTextLineTrigger reCheckPlanetsT2 :reCheckPlanetsT2 "<"
	setTextTrigger reCheckPlanetsT3 :reCheckPlanetsT3 "Land on which planet"
	pause
	:reCheckPlanetsstart
		killAllTriggers
		setVar $startLogging 1
		goto :reCheckPlanetsT
	:reCheckPlanetsT1
		killAllTriggers

		waitfor "Command ["
		return
	:reCheckPlanetsT2
		killAllTriggers 
		if ($startLogging = 1)
			
			getWord CURRENTLINE $cPlanetNum 1
			if ($cPlanetNum = "Land")
				goto :reCheckPlanetsT3
			elseif ($cPlanetNum = "<")
				getWord CURRENTLINE $cPlanetNum 2
				stripText $cPlanetNum ">"
			else
				stripText $cPlanetNum ">"
				stripText $cPlanetNum "<"
			end
			cutText CURRENTLINE $planetname 11 37

			trim $planetname
			add $planet~planetsInSector 1
			setVar $planet~planets[$planet~planeti] $cPlanetNum
			setVar $planet~planetNames[$planet~planeti] $planetname
            setVar $lastPlanetNum $cPlanetNum
			add $planet~planeti 1
		end
		goto :reCheckPlanetsT

	:reCheckPlanetsT3
		killAllTriggers
		waitfor "Command ["

return

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
   
    
    #goSub :voidfirstnotFed

    
    setDelayTrigger crazyStartDelay :crazyStartDelay 3000
    :crazyStartDelay
        killAllTriggers
    
    #grab cols
    send "lt2*"

    #grab figs
    send "cr*q"
    setTextLineTrigger sec1Figs2 :sec1Figs2 "B  Fighters        :"
    pause
    :sec1Figs2
        killAllTriggers
        getWord CURRENTLINE $maxfigs 8
        subtract $maxFigs 100
        if ($maxFigs > 0)
            send "ptb" $maxFigs "*q"
        end

    

    send "cv0*yyq"

    setVar $targets 0
    setVar $targeti 0
    setVar $targetDone 0

    setVar $totalTargets 0
    setVar $totalDone 0

    setVar $sent 0
    
    setVar $i 11
	while ($i < 51)

        send "cf1*" $i "*q"
        add $sent 1
		add $i 1
	end
    goSub :crazyGetTargets
     setVar $sent 0

    setVar $i 51
	while ($i < 91)

        send "cf1*" $i "*q"
        add $sent 1
		add $i 1
	end
    goSub :crazyGetTargets
   
   
    setVar $PLAYER~destination $stardock
    setVar $go 1
	while ($go = 1)
		goSub :getWarpAndAvoid
    
		if ($voidfound = 0)
			setVar $go 0
		end
	end

    setVar $jettisonDone 0

    setVar $i 1
    while ($i <= $targeti)
       
            setVar $BOT~command "mow"
            setVar $BOT~user_command_line " mow " & $targets[$i] & " 1 "
            setVar $BOT~parm1 $targets[$i]
            setVar $BOT~parm2 "1"
            saveVar $BOT~parm1
            saveVar $BOT~parm2
            saveVar $BOT~command
            saveVar $BOT~user_command_line
            load "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
            setEventTrigger		mowCrazyEnd2		:mowCrazyEnd2 "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
            pause
            :mowCrazyEnd2
            killalltriggers

                send "i"
                setTextLineTrigger crazyMowPod :crazyMowPod "Trade Pod"
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
                    if ($player~current_sector <> $targets[$i])
                        send "'Didn't make mow sector.. going on still*"
                    end

                gosub :player~quikstats
                if ($jettisonDone = 0)
                    send "d"
                    
                    if (PORT.EXISTS[$player~current_sector])
                        setVar $jettisonDone 1
                        send "o210*q"
                        send "jy"
                    
                        send "tt.**q"
                        waitfor "Corporate command ["
                        waitfor "Command ["
                        send "'all watcher*"
                    end
                end
                if ($player~fighters < 50)
                    setVar $SWITCHBOARD~message "Running low on figs, halting*"
                    gosub :SWITCHBOARD~switchboard
                    halt
                end

        add $i 1
    end

     send "'FIRE CRAZY MOW COMPELTE - WHO EVER DID THIS IS A SUCKER - bwahahah!*"

halt
# COUNT FIGS AFTER EACH LAP

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
                
               
                #check SEctor
                #CHECK SHIP - issue xport to anything
            if ((PORT.EXISTS[$player~current_sector]) and ($doCrazyAlign = 1))
                setVar $doCrazyAlign 0
                send "o120*q"
            end
        if ($totalDone = 1)
            send "jy*"
        end
        add $totalDone 1
    end 

    send "f1*cd"
    send "pztn"
    send "'FIRE CRAZY MOW COMPELTE - WHO EVER DID THIS IS A SUCKER - bwahahah!*"

    halt

    
return

:crazyGetTargets

    setVar $y 1
    while ($y <= $sent) 
		setTextLineTrigger cMowPlot :cMowPlot "The shortest path "
        pause
        :cMowPlot
            killAllTriggers
            getWord CURRENTLINE $cDist 4
            striptext $cDist "("
            getWord CURRENTLINE $cSector 13
            if ($cDist > 15)
                add $targeti 1
                setVar $targets[$targeti] $cSector
                setVar $targetDone[$targeti] 0
            end
        add $y 1
    end
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
            if ($DEFIG > 0)
                if ($figsToTake > $DEFIG)
                    setVar $takeFigs $DEFIG
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


include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\player\moveintosector\player"

include "source\bot_includes\grid\surround\grid"
include "source\bot_includes\planet\landingsub\planet"
include "source\bot_includes\external\mow"
