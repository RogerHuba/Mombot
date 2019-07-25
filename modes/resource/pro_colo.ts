# proEZcolonizer version 5.0

# need done - monitor cols
# verify bwarp from multiple planets
gosub :ansiColors
setVar $depleted 0
setVar $version "ProEZcolonizer v5.0"
setVar $getOreFrom "Not Set"
setVar $oreCols 0
setVar $orgCols 0
setVar $equCols 0
setVar $useTwarp FALSE
setVar $watchCols FALSE
setVar $eWarpEwarp FALSE
setVar $ewarpTwarp FALSE
setVar $bWarpeWarp FALSE
setVar $bWarp  FALSE
setVar $BTTW FALSE
setVar $numReady 0
setVar $gotColonists "n"
setVar $gotOreSource "n"
setVar $gotMoveMode "n"
setVar $twoShip FALSE
setVar $tMilk FALSE
setVar $attackMonitor FALSE
gosub :qStats
setVar $myFigs $ship_figs
setTextTrigger sp :sp  " "
pause
:sp

:planetToUse
  getword CURRENTLINE $prompt 1
  if ($prompt <> "Command") and ($prompt <> "Planet") and ($prompt <> "Citadel")
      echo "**Script must start at Citadel, Planet, or Sector command!!"
      halt
  end
  if ($prompt = "Citadel")
      setVar $prompt "Planet"
      send "q"
  end
  if ($prompt = "Planet")
     send "*"
     waitfor "Planet #"
     getword currentline $planet~planetNumber 2
     stripText $planet~planetNumber "#"
     setVar $planet~planetList $planet~planetNumber
     send "tnl1*tnl2*tnl3*snl1*qjy"
  else
     # get planets to fill
     echo $cls
     send "* l"
     setTextLineTrigger 1 :1 " in sector"
     setTextLineTrigger 2 :2 "Registry# and Planet Name"
     pause
     :1
       killtrigger 2
       getword currentline $planet~planetNumber 2
       stripText $planet~planetNumber "#"
       setVar $planet~planetList $planet~planetNumber
       send "*tnl1*tnl2*tnl3*snl1*qjy"
       goto :startUp
     :2
     killtrigger 1
     send "q*  "
     waitfor "Command"
     echo  $yellow "** Enter planet numbers to fill "
     getConsoleInput $planet~planetList
     replaceText $planet~planetList "," " "
     getword $planet~planetList $planet~planetNumber 1
     :donePlanetScan
     send "l" $planet~planetNumber "*tnl1*tnl2*tnl3*snl1*qjy"
  end
  send "f 1* c d"
:startup
setVar $mySector $ship_curSector
setVar $landStr "l  " & #8 & $planet~planetNumber & "*"
gosub :portClass
send "'Comms off for " $version " menu setup*"
send "|"
setTextTrigger commOff :commOff "Silencing all"
setTextTrigger commOn :commOn "Displaying all"
pause
:commOn
  send "|"
:commOff
killalltriggers


setVar $inString "Colonizing planet #(s): " & $planet~planetList
setVar $centerLen 22
gosub :padL

:menu
# echo "[2J"
echo $cls
echo  $whiteRed "*----------{" $blackWhite " " $version " " $whiteRed "}----------" $resetBlack
echo $yellow "**      Messages Silenced While In Menu"
echo $white  "*" $inString
echo $red "**-----------------" $cyan " Colos " $red "-------------------"
    if ($oreCols > 0)
        echo $green
    else
        echo $blue
    end
echo "*1. Number of Cols for Ore:         " $white $oreCols
    if ($orgCols > 0)
        echo $green
    else
        echo $blue
    end
echo "*2. Number of Cols for Org:         " $white $orgCols
    if ($equCols > 0)
        echo $green
    else
        echo $blue
    end
echo "*3. Number of Cols for Equ:         " $white $equCols

    echo $red "*---------------" $cyan " Move Mode " $red "-----------------"
    if ($eWarpEwarp)
        echo $green
    else
        echo $blue
    end
echo "*4. Use E-warp to, E-warp from?     " $white $ewarpEwarp

    if ($eWarpTwarp)
        echo $green
    else
        echo $blue
    end
echo "*5. Use E-warp to, T-warp from?     " $white $ewarpTwarp
    if ($useTwarp)
        echo $green
    else
        echo $blue
    end
echo "*6. Use T-warp to and from?         " $white $useTwarp
     if ($ship_Align < 1000) and ($useTwarp)
      echo $red " w/Jump - " $magenta $jumpPoint
   end
   if ($bWarpeWarp)
      echo $green
    else
      echo $blue
    end
echo "*7. Use B-warp to, E-Warp from?     " $white $bWarpeWarp
   if ($bWarpeWarp) and ($ship_Align < 1000)
      echo $red " w/Jump - " $magenta $jumpPoint
   end
   if ($bWarp)
      echo $green
    else
      echo $blue
    end
echo "*8. Use B-warp to, T-Warp from?     " $white $bWarp
   if ($bWarp) and ($ship_Align < 1000)
      echo $red " w/Jump - " $magenta $jumpPoint
   end
echo $red "*--------------" $cyan " Ore Source " $red "-----------------"
   if ($getOreFrom = "Not Set")
      echo $blue
    else
      echo $green
    end
    setVar $highlight $white
    if ($eWarpEwarp)
        echo $black
        setVar $highLight $black
    end
echo "*9. Get ore from Sector or Planet:  " $highlight $getOreFrom
   if ($oreSource = "p")
      echo " " $red $orePlanet
   end

echo $red "*----------------" $cyan " Options " $red "------------------"
 
 if ($attackMonitor)
     echo $green
    else
     echo $blue
    end
echo "*a. Monitor for Attacks?            " $white $attackMonitor
    if ($bttw)
       echo $green
    else
       echo $blue
    end
echo "*b. BTTW mode - no Fuse Protection? " $white $BTTW
 if ($watchcols)
     echo $green
    else
     echo $blue
    end
echo "*c. Monitor Terra for Col Depleted? " $white $watchCols
   if ($twoShip)
      echo $green
    else
       echo $blue
    end
echo "*d. Two ship colonizer?             " $white $twoShip
   if ($tMilk)
       echo $green
    else
       echo $blue
    end
echo "*e. tMilk - timed colo every x secs " $white $tmilk
if ($tMilkDelay > 0)
   echo "*   Set to: " $tMilkDelay " milliseconds."
end
echo $red "*-------------------------------------------"
echo $red "*H. Help on this script"
echo $red "*Q. QUIT"
if ($gotMoveMode = "y") and ($gotOreSource = "y") and ($gotColonists = "y")
   setVar $canStart "y"
   echo ANSI_10
else
   echo $red
end
echo "*S. Start"
echo $red "*------------- " $white "by Promethius" $red " ---------------*"

getConsoleinput $menuChoice singleKey
lowerCase $menuChoice

if ($menuChoice = "1")
   echo $white "*Enter the number of cols for Ore"
   getConsoleInput $oreCols
   setVar $gotColonists "y"
elseif ($menuChoice = "2")
   echo $white "*Enter the number of cols for Org"
   getConsoleInput $orgCols
   setVar $gotColonists "y"
elseif ($menuChoice = "3")
   echo $white "*Enter the number of cols for Equ"
   getConsoleInput $equCols
   setVar $gotColonists "y"
 # choosing e-warp to and from Terra
 elseif ($menuChoice = "4")
       if ($ewarpEwarp = FALSE)
          setVar $gotMoveMode "y"
          setVar $eWarpEwarp TRUE
          setVar $jumpPoint 1
          setVar $gotOreSource "y"
          setVar $eWarpTwarp FALSE
          setVar $useTwarp FALSE
          setVar $bWarp FALSE
          setVar $mode "EW/EW"
       else
          setVar $gotMoveMode "n"
          setVar $eWarpEwarp FALSE
       end
 # choosing e-warp to and t-warp from Terra
elseif ($menuChoice = "5")
       if ($ewarpTwarp = FALSE)
          setVar $gotMoveMode "y"
          setVar $ewarpTwarp TRUE
          setVar $jumpPoint 1
          setVar $eWarpEwarp FALSE
          setVar $useTwarp FALSE
          setVar $bWarp FALSE
          setVar $mode "EW/TW"
       else
          setVar $ewarpTwarp FALSE
         setVar $gotMoveMode "n"
       end
 #isomg t-Warp
elseif ($menuChoice = "6")
     if ($useTwarp = FALSE)
        setVar $gotMoveMode "y"
        setVar $useTwarp TRUE
        if ($ship_aln < 1000)
             setVar $mode "TW/Jump/TW"
             loadVar $jumpPoint
             echo ANSI_9 "**Enter jump point to " $white "T-warp" ANSI_9 " to:"
             if ($jumpPoint > 0)
               echo "* press enter to use: " $white $JumpPoint "*"
             end
             getConsoleInput $tempJumpTo
             if ($tempJumpTo <> "")
                setVar $jumpPoint $tempJumpTo
                saveVar $jumpPoint
             else

             end
        else
           setVar $jumpPoint 1
           saveVar $jumpPoint
           setVar $mode "TW/TW"
        end
          setVar $eWarpTwarp FALSE
          setVar $eWarpEwarp FALSE
          setVar $bWarp FALSE
     else
        setVar $useTwarp FALSE
        setVar $gotMoveMode "n"
     end
     if ($jumpPoint = 0) or ($jumpPoint = "") or ($jumpPoint > SECTORS)
         setVar $useTwarp FALSE
         setVar $gotMoveMode "n"
     end
 # using planet t-pad beam warp
elseif ($menuChoice = "7") or ($menuChoice = "8")
        if ($bWarp = FALSE) or ($bWarpeWarp = FALSE)
          setVar $gotMoveMode "y"
          if ($menuChoice = "8")
            setVar $bWarp TRUE
          else
            setVar $bwarpeWarp TRUE
          end
          setVar $eWarpTwarp FALSE
          setVar $useTwarp FALSE
          setVar $eWarpEwarp FALSE
          if ($ship_aln < 1000)
             if ($menuChoice = "8")
                setVar $mode "BW/Jump/TW"
             else
                setVar $mode "BW/eWarp"
             end
             loadVar $jumpPoint
             echo ANSI_9 "**Enter jump point to " $white "B-warp" ANSI_9 " to  "
             if ($jumpPoint > 0)
               echo "* press enter to use " $jumpPoint "*"
             end
             getConsoleInput $tempJumpTo
             if ($tempJumpTo <> "")
                setVar $jumpPoint $tempJumpTo
                saveVar $jumpPoint
             end
          else
             if ($menuChoice = "8")
             setVar $mode "BW/TW"
             else
               setVar $mode "BW/eWarp"
             end
             setVar $jumpPoint 1
             saveVar $jumpPoint
          end
        else
           setVar $bWarp FALSE
           setVar $bWarpeWarp FALSE
          setVar $gotMoveMode "n"
        end
        if ($jumpPoint = 0) or ($jumpPoint = "") or ($jumpPoint > SECTORS)
         setVar $bwarp FALSE
         setVar $gotMoveMode "n"
        end

elseif ($menuChoice = "9") and ($eWarpEwarp = FALSE)
   if ($getOreFrom = "Sector") or ($goodPort = FALSE)
       setVar $getOreFrom "Planet"
       setVar $oreSource "p"
       echo "**Enter planet number or enter for same planet"
       getConsoleinput $orePlanet
       if ($orePlanet = "s") or ($orePlanet = "")
          setVar $orePlanet $planet~planetNumber
          setVar $samePlanet TRUE
       else
          setVar $orePlanet $orePlanet
          setVar $samePlanet FALSE
       end
   else
       setVar $getOreFrom "Sector"
       setVar $oreSource "s"

   end
   setVar $gotOreSource "y"
elseif ($menuChoice = "a")
       if ($attackMonitor = FALSE)
          setVar $attackMonitor TRUE
          if ($myShields > 1000)
             echo $white "**Shield hit detection set for 1000 shields*"
          else
             echo $white "*Shield hit detection set for ANY shields*"
          end
          echo $white "*Any fighter loss will key detection!*"
          echo $cyan "**How many cycles before attack detection - suggest 5?*"
          getConsoleInput $attackRuns
       else
          setVar $attackMonitor FALSE
       end
elseif ($menuChoice = "d")
        if ($twoShip = FALSE) and ($bwarp = FALSE) and ($bWarpeWarp = FALSE)
            setVar $twoShip TRUE
            setVar $1stShip $ship_no
            echo $white "**Enter the " $yellow " 2nd " $white "ship number to use"
            echo $white "*All holds WILL be jetted!!!!*"
            getConsoleInput $2ndShip
            setVar $bwarp FALSE
        else
            setVar $twoShip FALSE
        end
  # monitoring cols on Terra
elseif ($menuChoice = "c")
     if ($watchCols = FALSE)
        setVar $watchCols TRUE
     else
        setVar $watchCols FALSE
     end
  # balls-to-the-wall no fuse protection. Protection used for reds to jumpPoint, but not to base.
elseif ($menuChoice = "b")
      if ($BTTW = FALSE)
         setVar $BTTW TRUE
      else
         setVar $BTTW FALSE
      end
elseif ($menuChoice = "e")
        if ($tMilk = FALSE)
           echo $white "**Enter the number of" $yellow " SECONDS " $white "to wait before next colo run*"
           getConsoleInput $tMilkSeconds
           if ($tMilkSeconds > 0)
              setVar $tMilk TRUE
              setVar $tMilkDelay (1000 * $tMilkSeconds)
           end
        else
            setVar $tMilk FALSE
        end
elseif ($menuChoice = "h")
     gosub :help
elseif ($menuChoice = "q")
   send "|"
   halt
elseif ($menuChoice = "s")
  if ($canStart = "y")
     send "|"
     send "'Comms restored " $version " starting up*"
     setVar $colsPerPlanet ($oreCols + $orgCols + $equCols)
     if ($bttw)
         setVar $mode $mode & "/BTTW"
     end
     goto :setUpFuel
  else
     if ($gotOreSource = "n")
         echo $red "****!!! No Ore Source Set !!!"
     elseif ($gotMoveMode = "n")
         echo $red "****!!! Move Mode Not Set !!!"
     elseif ($gotColonists = "n")
         echo $red "****!!! Number of Cols Not Set !!!"
     end
     echo $white "**Press any key to continue**"
     getConsoleInput $inkey singlekey
  end
end
goto :menu

:setUpFuel
  gosub :qStats
  setVar $myFigs $ship_figs
  if ($ship_shlds > 1000)
   setVar $myShields ($ship_shlds + 1000)
  else
   setVar $myShields $ship_shlds
  end
  setVar $1stShipHolds $ship_hlds
  setVar $st "1"
  setVar $end $mySector
  gosub :routeCalc
  setVar $distHome $hops
  setVar $routeFromTerra $moveIt
  setVar $shipBurnHome ($distHome * 3)
  subTract $1stShipHolds $shipBurnHome

  if ($ship_aln < 1000) and ($eWarpTwarp = FALSE) and ($eWarpEwarp = FALSE)
     setVar $st $mySector
     setVar $end $jumpPoint
     gosub :routeCalc
     setVar $distJump $hops
     if ($bwarp) or ($bWarpeWarp)
        setVar $planet~planetFuelBurn ($distJump * 10)
     end
     setVar $st $jumpPoint
     setVar $end "1"
     gosub :routeCalc
     setVar $redRoute $moveIt
  else
     setVar $st $mySector
     setVar $end "1"
     gosub :routeCalc
     setVar $distJump $hops
     if ($bwarp) or ($bWarpeWarp)
        setVar $planet~planetFuelBurn ($distJump * 10)
     end
     setVar $routeToTerra $moveIt
  end
  if ($ewarpTwarp) or ($bwarp)
     setVar $oreToGet ($distHome * 3)
  elseif ($ewarpEwarp = FALSE) and ($bWarpeWarp = FALSE)
     setVar $oreToGet (($distHome + $distJump) * 3)
 end
 if ($twoShip) and ($eWarpEwarp = FALSE) and ($bWarpeWarp = FALSE)
    multiply $oreToGet 2
    if ($oreToGet > $ship_hlds)
       echo $cyan "**!!!! " $red "Insufficient Ship Holds" $cyan " !!!!"
       echo $red "**Ship holds = " $cyan $ship_hlds $red " and we need " $cyan $oreToGet $red " units of ore*"
       echo $red "*for colonizing! Halting script.*"
      halt
   end
 end

:getPlanetPortStatus
  send "'Promethius - EZ-Colonizer for planet #" $planet~planetNumber "*"
  if ($oreSource = "s") and ($ewarpeWarp = FALSE) and ($bWarpeWarp = FALSE)
     send "p  t"
     setTextLineTrigger availPortFuel :availPortFuel "Fuel Ore   Selling"
     pause
     :availPortFuel
     getword currentline $fuelAvail 4
     stripText $fuelAvail ","
     send  $oretoGet "*" $buy
  elseif ($eWarpeWarp = FALSE)
     setTextLineTrigger availPlanetFuel :availPlanetFuel "Fuel Ore  "
     send "l  " & #8 & $orePlanet & "*"
     pause
     :availPlanetFuel
     getword currentline $fuelAvail 6
     if ($bwarp) or ($bWarpeWarp)
        setTextLineTrigger tpad :tpad "TransPort power = "
        setDelayTrigger noTpad :noTpad 2000
        pause
       :noTpad
        echo $red "***!!!! B-warp not available - No Transporter !!!!***"
        setDelayTrigger notAvail :notAvail 3000
        pause
        :notAvail
        halt
        :tpad
        killtrigger noTpad
        getText currentline $beamPower "TransPort power = " " hops -=-=-=-=-=-"
        if ($beamPower < $distJump)
           echo $red "***!!!! Not enough transporter distance - upgrade to at least " $blue $distJump $red " hops !!!!***"
           halt
        end
     end
     stripText $fuelAvail ","
     if ($bWarpeWarp = FALSE)
        send "tnt1" $oretoGet "*q"
     end
  end
  setVar $2ndShipHolds 0
  if ($twoShip)
     send "x     " $2ndShip "*    *i"
     setTextLineTrigger 2ndShipHolds :2ndShipHolds "Total Holds    :"
     pause
     :2ndShipHolds
     getword currentline $2ndShipHolds 4
     send "jyx    " $1stShip "*    *"
     setVar $mode $mode & "/2Ship"
  end

:setUpMoveToJump
  if ($twoShip) and ($bwarp = FALSE) and ($bWarpeWarp = FALSE)
     setVar $movetoJump "w  n " & $2ndship & "*"
  else
     setVar $movetoJump ""
  end
  if ($useTwarp)
     if ($ship_aln > 999)
        setVar $moveToJump $moveToJump & "m 1* y y "
     else
        setVar $moveToJump $moveToJump & "m " & $jumpPoint & "* y "
     end
  elseif ($bwarp) or ($bWarpeWarp)
     if ($ship_aln > 999)
        setVar $moveToJump "l " & #8 & $orePlanet & "* c b 1* y "
     else
        setVar $moveToJump "l " & #8 & $orePlanet & "* c b " & $jumpPoint & "*"
     end
  end

:setupTerraLand
  setVar $terraLanding "l  1*  t* "
  if ($twoShip)
     setVar $terraLanding "w" & $terraLanding & "x    " & $2ndShip & "*    *l  1* t* x    " & $1stShip & "*    *w  n " & $2ndShip & "*"
     multiply $shipBurnHome 2
  end
  if ($eWarpeWarp = FALSE) and ($bWarpeWarp = FALSE)
     setVar $terraLanding $terraLanding & "m " & $mySector & "* y "
     setVar $shipLoad ($ship_hlds - $shipBurnHome)
  else
     setVar $shipLoad $ship_hlds
  end
  add $shipLoad $2ndShipHolds
  setVar $numReady $shipLoad
  getTime $stTime "'Started: ' h:nn:ss"
  setVar $Window 1
  Window Colo 355 475 $version & " by Promethius  " & $stTime  ONTOP
  setVar $totalOre 0
  setVar $oreColsDelivered 0
  setVar $orgColsDelivered 0
  setVar $equColsDelivered 0
  if ($oreCols > 0)
     setVar $dropCols 1
  elseif ($orgCols > 0)
     setVar $dropCols 2
  elseif ($equCols > 0)
     setVar $dropCols 3
  end
  if ($prompt = "Command")
     setVar $numPlanets 1
     getword $planet~planetList $chk $numPlanets
     while ($chk <> 0)
         add $numPlanets 1
         getword $planet~planetList $chk $numPlanets
     end
     subtract $numPlanets 1
     setVar $totalColsRequired ($oreCols + $orgCols + $equCols)
     multiply $totalColsRequired $numPlanets
     setVar $totalOreRequired ($totalColsRequired / $shipLoad)
     multiply $totalOreRequired ($oretoGet + $planet~planetFuelBurn)
     getword $planet~planetList $planet~planetNumber 1
  else
     setVar $numPlanets 1
     setVar $totalColsRequired ($oreCols + $orgCols + $equCols)
     setVar $totalOreRequired ($totalColsRequired / $shipLoad)
     multiply $totalOreRequired ($oretoGet + $planet~planetFuelBurn)
  end
  add $totalOreRequired ($oretoGet + $planet~planetFuelBurn)

#-----------------------------
setVar $totalColsDelivered 0
setVar $totalFuel 0
setVar $planet~planetPointer 1
setVar $attackCounter 0
setVar $finalPlanet $planet~planetNumber
gosub :setUpGoHome
gettime $stTimeHH "h"
gettime $stTimeMM "n"
getTime $stTimeSS "s"

setTextTrigger sectFigKilled :sectFigKilled "Deployed Fighters Report Sector " & $mysector & ":"

if ($ewarpEwarp)
   setVar $1stShipHolds $ship_hlds
   goto :redBlueEwarpEwarp
elseif ($ewarpTwarp)
   goto :redBlueEwarpTwarp
elseif ($useTwarp) and ($ship_aln < 1000)
   goto :redTwarp
elseif ($useTwarp) and ($ship_aln > 999)
   goto :blueTwarp
elseif ($bWarpeWarp) and ($ship_aln < 1000)
   goto :redbWarpeWarp
elseif ($bWarpeWarp) and ($ship_aln > 999)
   goto :bluebWarpeWarp
elseif ($bWarp) and ($ship_aln < 1000)
   goto :redbWarp
elseif ($bWarp) and ($ship_aln > 999)
   goto :bluebWarp
end

# eWarp Colonizers

:redBlueEwarpEwarp
  while ($totalColsDelivered <= $totalColsRequired) or ($planet~planetColsDelivered <= $colsPerPlanet)
     send $moveToJump & $routeToTerra & $terraLanding
     if ($watchCols)
        gosub :colWatching
     end
     send $routeFromTerra & $goHomeStr
     gosub :calculations
  end
  goto :colonizerDone

:redBlueEwarpTwarp
  while ($totalColsDelivered <= $totalColsRequired) or ($planet~planetColsDelivered <= $colsPerPlanet)
     send $moveToJump $routeToTerra & $terraLanding
     if ($watchCols)
        gosub :colWatching
     end
     if ($bttw = FALSE)
        gosub :twarpOut
     else
        send "y "
     end
     send $goHomeStr
     gosub :calculations
  end
  goto :colonizerDone

# Red Colonizers

:redTwarp
  while ($totalColsDelivered <= $totalColsRequired) or ($planet~planetColsDelivered <= $colsPerPlanet)
     send $moveToJump
     gosub :twarpOut
     send $redRoute & $terraLanding
     if ($watchCols)
        gosub :colWatching
     end
     if ($bttw = FALSE)
        gosub :twarpOut
     else
        send "y "
     end
     send $goHomeStr

     gosub :calculations
  end
  goto :colonizerDone

:redbWarpeWarp
  while ($totalColsDelivered <= $totalColsRequired) or ($planet~planetColsDelivered <= $colsPerPlanet)
     send $moveToJump
     gosub :bwarpOut
     send $redRoute & $terraLanding
     if ($watchCols)
        gosub :colWatching
     end
     send $routeFromTerra & $goHomeStr
      gosub :calculations
  end
  goto :colonizerDone


:redbWarp
  while ($totalColsDelivered <= $totalColsRequired) or ($planet~planetColsDelivered <= $colsPerPlanet)
     send $moveToJump
     gosub :bwarpOut
     send $redRoute & $terraLanding
     if ($watchCols)
        gosub :colWatching
     end
     if ($bttw = FALSE)
        gosub :twarpOut
     else
        send "y "
     end
     send $goHomeStr
      gosub :calculations
  end
  goto :colonizerDone

# Blue Colonizers

:blueTwarp
  while ($totalColsDelivered <= $totalColsRequired) or ($planet~planetColsDelivered <= $colsPerPlanet)
     if ($bttw = FALSE)
        send $moveToJump & $terraLanding
        if ($watchCols)
           gosub :colWatching
        end
        gosub :twarpOut
        send $goHomeStr
     else
        send $moveToJump & $terraLanding & "y " & $goHomeStr
        if ($watchCols)
           gosub :colWatching
        end
     end
     gosub :calculations
  end
  goto :colonizerDone

:blueBWarp

  while ($totalColsDelivered <= $totalColsRequired) or ($planet~planetColsDelivered <= $colsPerPlanet)
     if ($bttw = FALSE)
         send $moveToJump & $terraLanding
         if ($watchCols)
           gosub :colWatching
         end
         gosub :twarpOut
         send $goHomeStr
     else
         send $moveToJump & $terraLanding 
         send "y " & $goHomeStr
        if ($watchCols)
           gosub :colWatching
        end
     end
     gosub :calculations
   end
  goto :colonizerDone

:blueBwarpEwarp
 while ($totalColsDelivered <= $totalColsRequired) or ($planet~planetColsDelivered <= $colsPerPlanet)
     send $moveToJump & $terraLanding & $routeFromTerra & $goHomeStr
#     send $goHomeStr
     gosub :calculations
 end
   goto :colonizerDone

:colonizerDone
send "l " & #8 & $finalPlanet "* c * "
setVar $inString $Run_time
setVar $padLen 24
gosub :padR
send "'*Run Time:   " & $inString & "  |  Mode: " & $mode & "*"
setVar $inString $totalColsDelivered
setVar $padLen 10
gosub :padR

send "Total Cols: " & $inString & "                |  Avg Cols/Sec: " & $avgPerSecond & "*"
setVar $instring $totalOre
setVar $padLen 24
gosub :padR
send "Ore Used:   " $inString "  |  Ore Remaining: " & $fuelAvail & "**"
halt

#############  goSubs  ###############

:calculations
   add $ColsDelivered[$dropCols] $shipLoad
   add $totalColsDelivered $shipLoad
   add $planet~planetColsDelivered $shipLoad
   add $totalOre ($oreToGet + $planet~planetFuelBurn)
   subtract $fuelAvail ($oreToGet + $planet~planetFuelBurn)

  if ($ColsDelivered[1] >= $orecols) and ($ColsDelivered[2] = 0) and ($orgCols > 0)
      setVar $dropCols 2
      gosub :setUpGoHome
  elseif ($ColsDelivered[1] >= $orecols) and ($ColsDelivered[2] >= $orgCols) and ($equCols > 0)
      setVar $dropCols 3
      gosub :setUpGoHome
  end
  gosub :windowUpdate
  if ($watchCols)
     getText $colLine $availCols "take ([" "] empty"
     if ($availCols < $1stShipHolds)
        echo $red "!!!!" $white " Terra Depleted " $red "!!!!**"
        halt
     end
  end
  if ($planet~planetColsDelivered >= $colsPerPlanet)
     add $planet~planetPointer 1
     getword $planet~planetList $planet~planetNumber $planet~planetPointer
     if ($planet~planetNumber = 0)
         goto :colonizerDone
     else
        if ($oreCols > 0)
           setVar $dropCols 1
        elseif ($orgCols > 0)
           setVar $dropCols 2
        elseif ($equCols > 0)
           setVar $dropCols 3
        end
        gosub :setUpGoHome
        setVar $planet~planetColsDelivered 0
        setVar $colsDelivered[1] 0
        setVar $colsDelivered[2] 0
        setVar $colsDelivered[3] 0
     end
  end
     setTextTrigger atHome :atHome "The Colonists disembark to begin"
     pause
     :atHome
  if ($twoShip)
      setTextTrigger atHome2 :atHome2 "The Colonists disembark to begin"
      pause
     :atHome2
  end
     add $attackCounter 1
     if ($attackMonitor) and ($attackCounter > $attackRuns)
        setVar $attackCounter 0
        if ($twoShip)
           waitfor "Choose which ship to beam to (Q=Quit) " & $1stShip
           waitfor "Command"
        end
        gosub :qStats
        if ($myFigs < $ship_figs) or ($myShields < $ship_shlds)
           echo $red "**!!!! " $cyan "ATTACK DETECTED" $red " !!!!**"
           if (currentsector = $mySector)
               send "l " & #8 & $planet~planetNumber & "*"
            else
               send "pt"
            end
            halt
        end
     end

  if ($tMilk)
      setDelayTrigger tmilk :tmilk $tMilkDelay
      pause
      :tmilk
  end
return

:colWatching
  setTextLineTrigger colMonitor :ColWatch "How many groups of Colonists do you want to take"
  pause
  :colWatch
  setVar $colLine CURRENTLINE
  return

:sectFigKilled
  echo $red "****!!!!!! " $white "BASE SECTOR FIG KILLED " $red "!!!!!!"
  if (currentSector = 1)
     send "* pt"
  elseif (currentsector = $mySector)
     send "l " $planet~planetNumber "* "
  end
  halt

:portClass
    setVar $buy ""
    setVar $goodPort FALSE
 if (port.Exists[$mySector])
   if (PORT.buyfuel[$mySector] = FALSE)
      setVar $buy "*"
      setVar $goodPort TRUE
   end
   if ($port.buyOrg[$mySector] = FALSE)
       setVar $buy $buy & "0*"
   end
   if ($port.buyEquip[$mySector] = FALSE)
      setVar $buy $buy & "0*"
   end
 end
return

:twarpOut
   settextTrigger GoForWarp :goForWarp "All Systems Ready, shall"
   settextTrigger noWarp :noBeam "Do you want to make this"
   settextTrigger noWarpFuel :NoFuel "You do not have enough"
 pause

 :noBeam
  send "n"
  :NoFuel
  if (CURRENTSECTOR = "1")
     send "pt"
  end
   halt

:goForWarp
   send "y "
   killtrigger nowarpFuel
   killtrigger noWarp
   return

:bWarpOut
  setTextTrigger blindBwarp :blindBwarp "Do you want to make this transport blind?"
  setTextTrigger readyBwarp :readyBwarp "All Systems Ready, shall we engage"
  pause
  :blindBwarp
    send "n"
    halt
  :readyBwarp
    killtrigger blindBwarp
    send "y"
  return

:routeCalc
   setVar $path ""
   send "cf" $st "*" & $end & "*q"
   setTextLineTrigger hops :hops "path ("
   pause
   :hops
   getword currentline $hops 4
   striptext $hops "("
   :lineTrigger
   setTextLineTrigger lines :getLines ""
   pause
   :getLines
   getLength currentline $length
   if ($length = 0)
      goto :doneRoute
   end
   setVar $path $path & currentline
   striptext $path ">"
   striptext $path "("
   striptext $path ")"
   goto :lineTrigger
   :doneRoute
   setVar $icnt 2
   setVar $moveit ""
   while ($icnt <= ($hops + 1))
     getword $path $tmp $icnt
     if ($tmp > 10) and ($tmp <> STARDOCK)
        setVar $moveit $moveit & "m " & $tmp & "* z a9999* * "
     else
        setVar $moveit $moveit & "m " & $tmp & "* "
     end
     add $icnt 1
   end
return

:setUpGoHome
  setVar $landStr "l " & #8 & $planet~planetNumber & "*  "
  if ($twoShip) and ($bwarp = FALSE)
      setVar $twoShipStrHome "x  " & $2ndShip & "*  * " & $landStr & "snl" & $dropCols & "*qx  " & $1stShip & "*  *"
      setVar $goHomeStr "w" & $landStr & "snl" & $dropCols & "*"
  else
      setVar $twoShipStrHome ""
      setVar $goHomeStr $landStr & "snl" & $dropCols & "*"
  end
   if ($eWarpEwarp = FALSE)
     if ($oreSource = "s")
         setVar $goHomeStr $goHomeStr & "qpt" & $oretoGet & "*" & $buy & $twoShipStrHome
     else
        if ($planet~planetNumber <> $orePlanet)
           setVar $goHomeStr $goHomeStr & "ql " & #8 & $orePlanet & "*  "
        end
        if ($bwarp)
          setVar $goHomeStr $goHomeStr  & "tnt1" & $oretoGet & "*"
        elseif ($bWarpeWarp = FALSE)
           setVar $goHomeStr $goHomeStr & "tnt1" & $oretoGet & "*q" & $twoShipStrHome
        end
     end
  else
      setVar $goHomeStr $goHomeStr & " q" & $twoShipStrHome
  end
return

:qstats
  setVar $line ""
  send "/"
   :setup
     setTextLineTrigger done :done "Ship "
     setTextLineTrigger funky :funky ""
     pause

  :funky
     killtrigger done
     setVar $line $line & currentline & "³"
     goto :setup

  :done
     killtrigger funky
     setVar $line $line & currentline & "³"

     # get the ship line and parse
     getText $line $shipTemp "Ship" "³"
     getword $shipTemp $ship_no 1
     stripText $line " "
     stripText $line ","

     # parse the rest of the string
     getText $line $ship_curSector "Sect" "³"
     getText $line $ship_turns "Turns" "³"
     getText $line $ship_creds "Creds" "³"
     getText $line $ship_figs "Figs" "³"
     getText $line $ship_shlds "Shlds" "³"
     getText $line $ship_hlds "Hlds" "³"
     getText $line $ship_ore "Ore" "³"
     getText $line $ship_org "Org" "³"
     getText $line $ship_equ "Equ" "³"
     getText $line $ship_col "Col" "³"
     getText $line $ship_phot "Phot" "³"
     getText $line $ship_armd "Armd" "³"
     getText $line $ship_lmpt "Lmpt" "³"
     getText $line $ship_gTorp "GTorp" "³"
     getText $line $ship_tWarp "TWarp" "³"
     getText $line $ship_clks "Clks" "³"
     getText $line $ship_beacns "Beacns" "³"
     getText $line $ship_atmDt "AtmDt" "³"
     getText $line $ship_crbo "Crbo" "³"
     getText $line $ship_eprob "EPrb" "³"
     getText $line $ship_mDis "MDis" "³"
     getText $line $ship_psPrb "PsPrb" "³"
     getText $line $ship_plScn "PlScn" "³"
     getText $line $ship_lrs "LRS" "³"
     getText $line $ship_aln "Aln" "³"
     getText $line $ship_exp "Exp" "³"
     getText $line $ship_corp "Corp" "³"
return

  :windowUpdate
  setVar $msg "* Colonizing Mode: " & $mode & "*"
  gosub :data_Window
  setVar $msg $msg & "* Colonizing Planets: " & $planet~planetList & "*"
  setVar $msg $msg & "* Planet Number:      " & $planet~planetNumber & "*"
  setVar $msg $msg & "* Fuel Colonists:     " & $colsDelivered[1] & " of " & $oreCols & " target*"
  setVar $msg $msg & "* Org Colonists:      " & $colsDelivered[2] & " of " & $orgCols & " target*"
  setVar $msg $msg & "* Equ Colonists:      " & $colsDelivered[3] & " of " & $equCols & " target*"
  setVar $msg $msg & "* Total Colonists:    " & $totalColsDelivered & " of " & $totalColsRequired & " target*"
  setVar $msg $msg & "* Average col/sec:    " & $avgPerSecond & "*"
  setVar $msg $msg & "* Total Ore Used:     " & $totalOre & "*"
  setVar $msg $msg & "* Approx Total Fuel Required: " & $totalOreRequired & "*"
  setVar $msg $msg & "* Approx Fuel Remaining:      " & $fuelAvail & "*"
  setVar $msg $msg & "* Approx Turns Remaining:     " & $ship_turns & "*"
  setWindowContents Colo $msg
  return

:data_window
  setVar $timePart 1
  getTime $endTimeHH "h"
  getTime $endTimeMM "n"
  getTime $endTimeSS "s"

  if ($endtimeSS < $stTimeSS)
      subtract $endTimeMM 1
      add $endTimeSS 60
  end
  if ($endtimeMM < $stTimeMM)
      subtract $endTimeHH 1
      add $endTimeMM 60
  end
  setVar $elapsedHH ($endtimeHH - $stTimeHH)
  setVar $elapsedMM ($endtimeMM - $stTimeMM)
  setVar $elapsedSS ($endtimeSS - $stTimeSS)
  setVar $elapsedSeconds ($elapsedSS + ($elapsedMM * 60) + ($elapsedHH * 3600))
  if ($elapsedSeconds = 0)
     setVar $elapsedSeconds 1
  end
  setVar $averageSeconds ($totalColsDelivered / $elapsedSeconds)
  setVar $estComplete ($totalColsRequired - $totalColsDelivered) / $averageSeconds
  setVar $avgPerSecond $averageSeconds
  setVar $Run_Time "Hrs: " & $elapsedHH & "  Min: " & $elapsedMM & "  Sec: " & $elapsedSS
  setVar $estHr 0
  setVar $estMM 0
  setVar $estSS 0
  while ($estComplete > 0)
        if ($estComplete >= 3600)
           add $estHr 1
           subtract $EstComplete 3600
        elseif ($EstComplete >= 60) and ($estComplete < 3600)
           subtract $EstComplete 60
           add $estMM 1
        elseIf ($EstComplete > 0) and ($estComplete < 60)
           setVar $estSS $EstComplete
           setVar $EstComplete 0
        end
  end
  setVar $estComplete "Hrs: " & $estHr & "  Min: " & $estMM & "  Sec: " & $estSS

  setVar $msg  $msg & " ----------------------------------------*" & " Run Time    :  " & $Run_time & "* ----------------------------------------*" & " Est Complete:  " & $estComplete & "* ----------------------------------------*"
  return

:Add_Comma's
	getLength $add_comma $length_total
	If ($length_total > 3)
		setvar $Lmarker $length_total
		add $Lmarker 1
		While ($lmarker > 0)
			subtract $lmarker 3
			cuttext $add_comma $num1 $lmarker 9999999
			cuttext $add_comma $num2 1 $lmarker - 1
			If ($num2 <> "")
				setvar $num1 $num2 & "," & $num1
				setvar $add_comma $num1
			end
		end
	end
	return

:padL
  getLength $inString $len
  divide $len 2
  subtract $centerLen $len
  while ($len < 21)
        setVar $inString " " & $inString
        add $len 1
  end
  return

:padR
  getLength $inString $len
  while ($len < $padLen)
        setVar $inString $inString & " "
        add $len 1
  end
  return

:ansiColors
  setVar $cls #27 & "[2J"
  setVar $black #27 & "[1;30m"
  setVar $red #27 & "[1;31m"
  setVar $green #27 & "[1;32m"
  setVar $yellow #27 & "[1;33m"
  setVar $blue #27 & "[1;34m"
  setVar $magenta #27 & "[1;35m"
  setVar $cyan #27 & "[1;36m"
  setVar $white #27 & "[1;37m"
  setVar $blackWhite #27 & "[0;30;47m"
  setVar $whiteRed #27 & "[1;37;41m"
  setVar $redWhite #27 & "[1;31;47m"
  setVar $yellowRed #27 & "[1;33;41m"
  setVar $resetBlack #27 & "[1;37;40m"
 return

:help
echo $cls
echo $whiteRed "*------------------{" $blackWhite " " $version " " $whiteRed "}------------------" $resetBlack
echo $green  "**Start from planet to colonize or from sector to select"
echo $green  "*multiple planets to colonize."
echo $green  "**You must have an ore source for this script to work,"
echo $green  "*except for eWarp-eWarp colonizing.  The ore planet " $red "MUST"
echo $green  "*be the planet that the transporter is on if using any"
echo $green  "*bwarp modes!"
echo $cyan  "**Fuse protection used on all warps EXCEPT when in BTTW mode"
echo $cyan  "*" $red "MIMIMAL" $cyan " FUSE PROTECTION IS USED - " $red "YOU COULD FUSE!"
echo $cyan "**Menu choice " $blue "<" $cyan "4" $blue "> to set ewarp-ewarp colonizing - this is not"
echo $blue  "*a safe method of colonizing in a hostile game."
echo $cyan "**Menu choice " $blue "<" $cyan "5" $blue "> use for ewarp to Terra and T-warp to base"
echo $blue   "*and is somewhat safer than ewarp-ewarp but still leaves you"
echo $blue   "*open to nav hazards and picking up limpets."
echo $cyan "**Menu choice" $blue " <" $cyan "6" $blue "> Twarp to and from Terra for blues, requires"
echo $blue   "*a jump point for red colonizing and ewarp to Terra"
echo $cyan "**Menu choice" $blue " <" $cyan "7" $blue "> uses Citadel transporter to beam to Terra"
echo $blue   "*for blue players, a jump point for reds requiring ewarping"
echo $blue   "*to Terra from the jump and then ewarps back to base."
echo $cyan "**Menu choice" $blue " <" $cyan "8" $blue "> uses Citadel transporter to beam to Terra"
echo $blue   "*for blue players, a jump point for reds requiring ewarping"
echo $blue   "*to Terra from the jump and then twarps back to base."
echo $blue   "*This is the fastest mode for a blue player when used"
echo $blue   "*with BTTW mode but burns ore, and BTTW is susceptible"
echo $blue   "*to fusing when the base fighter is killed."
echo ANSI_14  "**Press any key to continue."
getConsoleInput $inkey singlekey
echo $cls
echo $whiteRed "*------------------{" $blackWhite " " $version " " $whiteRed "}------------------" $resetBlack
echo $cyan "**Menu choice" $blue " <" $cyan "9" $blue "> sets the ore source AND the planet for"
echo $blue   "*transporter use.  They " $red "MUST" $blue " be the same planet."
echo $cyan "**Menu choice" $blue " <" $cyan "a" $blue "> monitors shields and fighters for attacks."
echo $blue   "*If you have more than 1000 shields, then the script will allow"
echo $blue   "*those shields to be destroyed before detecting the attack."
echo $blue   "*I you have less than 1000 shields, any shield loss will detect."
echo $cyan "**Menu choice" $blue " <" $cyan "b" $blue "> warps home without twarp lock verification"
echo $blue   "*- you can fuse this way.  A method is in place that might prevent"
echo $blue   "*this, but it is not reliable - make sure your base fig is safe."
echo $cyan "**Menu choice" $blue " <" $cyan "c" $blue "> monitorng Terra colo depletion will slow"
echo $blue   "*the script down."
echo $cyan "**Menu choice" $blue " <" $cyan "d" $blue "> allows for two ship colonizing which is"
echo $blue   "*fastest in some uses - esp for reds.  Suggest your first shift (the"
echo $blue   "*one you are in) be the safest to handle attacks or nav/haz."
echo $cyan "**Menu choice" $blue " <" $cyan "e" $blue "> t-milk works with all modes and simply puts"
echo $blue   "*a delay in the moves to Terra of x amount of seconds."
echo ANSI_14 "**Press any key to return to menu."
getconsoleinput $inkey singlekey
return
