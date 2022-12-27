gosub :BOT~loadVars
loadvar $SWITCHBOARD~bot_name 
loadvar $bot~corppassword
loadvar $player~corpnumber

setVar $BOT~help[1]  $BOT~tab&"    xmas2020 [command]"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&"    buyfed    - 1.8 Mil cash - buys ship and fed com"
setVar $BOT~help[4]  $BOT~tab&"    getore1   - Will make a planet, pause, pick up ore"
setVar $BOT~help[5]  $BOT~tab&"    getore10  - Will make 10 planets, attempt to pick up ore"
setVar $BOT~help[6]  $BOT~tab&"                (For when someone blows planets at docks)"

setVar $BOT~help[7]  $BOT~tab&"    start [botname]    - Game Start setup "
setVar $BOT~help[8]  $BOT~tab&"    mind - CEO and Person who will go evil"

gosub :bot~helpfile

setVar $BOT~script_title "xmas2020 Utilities"

gosub :BOT~banner

setVar $BOT~corpName "Rocinante"
setVar $BOT~corpPassword "27531"
setVar $BOT~subspace 27531



setVar $podpeople[1] "mind"
setVar $podpeople[2] "kane"
setVar $podpeople[3] "far"
setVar $podpeople[4] "skip"
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

if ($bot~parm1 = "mind")
    
    send "'mind xmas2020 crazystart*"
    
    halt
end
    

if ($bot~parm1 = "crazystart")
    
    
    setVar $SWITCHBOARD~bot_name "mind"
    setVar $BOT~isCEO TRUE
   
    goSub :crazyStart
    halt
end


if ($bot~parm1 = "waitandmow")
    goSub :waitandmow
    halt
end

if ($bot~parm1 = "start")
    setVar $SWITCHBOARD~bot_name $bot~parm2
    setVar $BOT~isCEO FALSE
    
    goSub :doStart1
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

    setVar $towship $bot~parm2
    send "wn" $towship "*"

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
    setVar $figsRequired 2000
    gosub :player~quikstats
	gosub :stripfig
   
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
	setTextLineTrigger buildPlanet3 :buildPlanet3 "Snowball Mountain"
	setTextLineTrigger buildPlanet1 :buildPlanet1 "CANDYCANE"
	setTextLineTrigger buildPlanet4 :buildPlanet4 "Jack Frost Frathouse"
	setTextLineTrigger buildPlanet2 :buildPlanet2 "Silent Night"
	setTextLineTrigger buildPlanet5 :buildPlanet5 "Red Rider Double Action BB Gun"
	setTextLineTrigger buildPlanet6 :buildPlanet6 "ddd(Class a-ci, Dead Earth)"
	setTextLineTrigger buildPlanet7 :buildPlanet7 ": ENDINTERROG"
	pause
	:buildPlanet1
	:buildPlanet2
    :buildPlanet3
    :buildPlanet4
    :buildPlanet5
		killAllTriggers
        setVar $lastPlanetOre 1
		goto :buildPlanet


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

:doStart1

# 
    send "*CN24"&$BOT~subspace&"* Q Q Q ZN* ^Q c o* c q q q zn *"
	send "nsn"
	setTextLineTrigger todock :todock "The shortest path" 
	pause
	
	:todock
		killAllTriggers

        getWord CURRENTLINE $hops 4
        getWord CURRENTLINE $stardock 13
        echo "stardock:" $stardock
	setTextLineTrigger todockpath :todockpath ">" 
	pause
	:todockpath 
	killAllTriggers
	setVar $sdpath CURRENTLINE

	stripText $sdpath "("
	stripText $sdpath ")"
	replaceText $sdpath " > " " "
        stripText $hops "("
 
        setVar $result ""
       
        # lots of attacks
        setVar $result $result&"nseza750* * za750* * za750* * za750* * za750* * za750* * za750* * za750* * za750* * za750* * za750* * za750* * za750* * za750* * za750* * za750* * ^q"

        send $result

        
        send "^q"
        waitfor "ENDINTERROG"
        send "cv0*yyq"
       

        if ($SWITCHBOARD~BOT_NAME <> "ham")
            send "p s s b y y f yc.....**p c300* b50000*q  q g d250000*tamos**q h r h f y w2t5*q q "
        else
            send "p s s b y y f yc.....**p c100* b100*q q h r h f y w2t5*q p"
            goSub :copshop
            send " q q "
        end
        send "^q"
        waitfor "ENDINTERROG"
        
        if ($SWITCHBOARD~BOT_NAME <> "ham")
            
            goSub :randMow
            goSub :joincorp 
            send "f1*cd"
        else
            goSub :joincorp 
            send "cn2qq"
            goSub :getOre10
            gosub :player~quikstats
            send "p s ht1*t1*t1*t1*t1*q g w250000**w250000**qs bnyfycshipit*  * * q q wn*"
            
           
            waitfor "<Tow Control>"
            setTextLineTrigger towline2 :towline2 "shipit"
            setTextLineTrigger towdone2 :towdone2 "Choose which ship to tow"
            pause
            :towline2
               
                getword CURRENTLINE $xportship 1
               
                pause
            :towdone2
                killAllTriggers


                setTextLineTrigger crazyloc :crazyloc "crazyStuffDone"
                pause
                :crazyloc
                    getWordPos CURRENTLINE $xLoc "crazyStuffDone"
                    cutText CURRENTLINE $xmasCommand $xLoc 99
                    getWord $xmasCommand $theirBot 2
                    getWord $xmasCommand $theirMooShip 3
                    getWord $xmasCommand $theirSector 4

                setVar $player~warpto $theirSector
		        gosub :player~twarp
                send "tt.**qtfyf1500*q"
                gosub :getCreds
                setVar $ourShip $player~SHIP_NUMBER
                send "x " $xportship "*q"
                waitfor "Security code accepted"
                send "'" $theirBot " x " $ourShip "*"
           
                send "psspb10000*qqhrhfyw2t5*qq"
                goSub :getore1
                gosub :player~quikstats
                if ($player~ore_holds = 0)
                    goSub :getOre10
                    
                end
                send "p s ht1*t1*t1*t1*t1*q s bnyfycxportit*  * * q q wn*"
        end
        send "'" $SWITCHBOARD~BOT_NAME " reboot*"
return


:getCreds
	
	#You have 31,034 credits, and The Bounty Hunter has 2,025,862.
	send "tcyf"
	waitfor "nsfer To or Fro"
	waitfor "credits, and"

	getWordPos CURRENTLINE $has "has "
	add $has 4
	cutText CURRENTLINE $creds $has 99
	
	striptext $creds ","
	striptext $creds "."
	send $creds "*cyt50000*q"

	add $credsTaken $creds
	subtract $credsTaken 150000
	# Leave him wiht some walk around money
	waitfor "Command ["
return

:randMow

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
				setVar $BOT~user_command_line " mow "& $whereto & " "
				setVar $BOT~parm1 $whereto
                setVar $BOT~parm2 ""
				saveVar $BOT~parm1
                saveVar $BOT~parm2
				saveVar $BOT~command
				saveVar $BOT~user_command_line
				load "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
				setEventTrigger		mowended		:mowended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
				pause
				:mowended
					

		end

return
:joincorp
    :checkForCorp
        send "*TD"
        gosub :PLAYER~quikstats
        setTextLineTrigger	1 :thereIsMyCorp	"    "&$BOT~corpName
        setTextTrigger 		2 :noCorpThatName	"Corporate command ["
        send "L"
        pause
    :noCorpThatName
        killalltriggers
        echo "[[ Waiting 3 seconds to check for corp again, press [Spacebar] to cancel. ]]*"
        setDelayTrigger		3 :checkForCorp		3000
        setTextOutTrigger 	4 :alreadyCorped 	#32
        pause
    :thereIsMyCorp
        killalltriggers
        getWord CURRENTLINE $corpNumber 1
    :continueCorpCreation
        killalltriggers
        send "J"&$corpNumber&"*"&$BOT~corpPassword&"* * *CN24"&$BOT~subspace&"* Q Q Q ZN* ^Q c o* c q "
return



:crazyStart

    #set CN
    send "cn24"&$BOT~subspace&"* qqlt30*"
    #Make Corp
    send "tm" $BOT~corpName "*y" $BOT~corpPassword "*yq"
    send "co*cq"

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
    setEventTrigger		findbbCrazy2		:findbbCrazy2 "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\data\findbb.cts"
    pause
    :findbbCrazy2
        killalltriggers

    

    # Eject Cols
    send "jy"
    goSub :joincorp
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
    setEventTrigger		findbbNormal2		:findbbNormal2 "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\data\findbb.cts"
    pause
    :findbbNormal2
        killalltriggers
    setVar $doCrazyAlign 1
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
    setTextLineTrigger getBackDockCrazy2 :getBackDockCrazy2 "The StarDock is located in sector"
    pause
    :getBackDockCrazy2
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

        
            setVar $BOT~command "mow"
            setVar $BOT~user_command_line " mow " & $shortestTarget & " 1 "
            setVar $BOT~parm1 $shortestTarget
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
                setTextLineTrigger crazyMowPod2 :crazyMowPod2 "Total Holds    : 1 - Empty"
                setTextLineTrigger crazyMowNoPod2 :crazyMowNoPod2 "Fighters       :"
                pause
                :crazyMowPod2 
                    killAllTriggers
                    send "pzt"
                    send "'ALERT I'VE BEEN PODED! MAY be AFK! HELP*"
                    send "'ALERT I'VE BEEN PODED! MAY be AFK! HELP*"
                    send "'ALERT I'VE BEEN PODED! MAY be AFK! HELP*"
                    halt
                :crazyMowNoPod2
                    killAllTriggers

                    gosub :player~quikstats
                    if ($player~current_sector <> $shortestTarget)
                        send "'Didn't make mow sector.. going on still*"
                    end
                #check SEctor
                #CHECK SHIP - issue xport to anything
            if ((PORT.EXISTS[$player~current_sector]) and ($doCrazyAlign = 1))
                setVar $doCrazyAlign 0
                send "o1150*q"
            end

        add $totalDone 1
    end 
   
    send "'crazyStuffDone " $SWITCHBOARD~bot_name " " $player~SHIP_NUMBER " " CURRENTSECTOR "*"
    waitfor "Security code accepted"
    send "'" $SWITCHBOARD~BOT_NAME " reboot*"
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
