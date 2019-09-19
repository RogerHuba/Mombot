
# move cols/product to planet from a donor planet for Citadel upgrade
# Original Script by:  Promethius - Released as .cts 01/2011
#                      03/2011 - Source released into the wild.

logging off
gosub :BOT~loadVars
loadVar $MAP~STARDOCK
loadVar $MAP~BACKDOOR
loadvar $game~MAX_PLANETS_PER_SECTOR
loadvar $planet~planet_file


setVar $BOT~help[1] $BOT~tab&"    "
setVar $BOT~help[2] $BOT~tab&"     "
setVar $BOT~help[3] $BOT~tab&"Upgrades all planets in sector."
setVar $BOT~help[4] $BOT~tab&"   Original Author: Promethius"
gosub :bot~helpfile


gosub :player~quikstats
setvar $prompt $player~current_prompt

if ($player~current_prompt <> "Planet") and ($player~current_prompt <> "Citadel")
   setvar $switchboard~message "You must start from the planet's surface.*"
   gosub :switchboard~switchboard
   halt
end
if ($player~current_prompt = "Citadel")
	gosub :player~getinfo
end

setVar $shipholds $player~total_holds
setvar $start_planet_check ""

:menu

	if ($player~unlimited_game)
		setvar $minTurns 0
	else
		setvar $minTurns $bot~bot_turn_limit
	end

	gosub :PLANET~loadplanetInfo


Window citBuilder 355 455 "Massupgrade by Promethius  "  ONTOP
setVar $sectCounter 1
setarray $potential_start_planets 20000
setvar $potential_start_planets 0
setvar $current_start_planet 0
setvar $original_start_planet 0
setVar $planet~planetsFilled 1

:startMeUp
	killalltriggers
	gosub :player~quikstats
	if ($player~current_prompt = "Citadel")
		send "q"
	else
		if ($player~current_prompt <> "Planet")
			setvar $switchboard~message "Wrong prompt!  Halting.*"
			gosub :switchboard~switchboard
			halt
		end
	end
	gosub :PLANET~getPlanetInfo
	if ($start_planet_check = "")
		setvar $start_planet_check " "&$planet~planet&" "
	end
	setvar $mysector $player~current_sector
	setvar $startplanet $planet~planet
  if ($original_start_planet = 0)
    setvar $original_start_planet $startplanet
  end
	setvar $startPlanetFuelCol $planet~planet_FUEL_COLONISTS
	setvar $startPlanetFuel $planet~planet_FUEL
	setvar $startPlanetOrgCol $planet~planet_ORGANICS_COLONISTS
	setvar $startPlanetOrg $planet~planet_ORGANICS
	setvar $startPlanetEquCol $planet~planet_EQUIPMENT_COLONISTS
	setvar $startPlanetEqu $planet~planet_EQUIPMENT
	setVar $startPlanetCols ($startPlanetFuelcol + $startPlanetOrgCol + $startPlanetEquCol)

	send "c "

# setup our moves
# need a resume method

gosub :setWindow
send "qq"
gosub :getplanetNumbers
while ($planet~planetsFilled <= $pNumCnt)
	setVar $fillPlanet $pNumber[$planet~planetsFilled]
	gosub :setWindow
	send "qq*  jy l " #8 $fillPlanet "* "
	waitfor "Planet command"
	gosub :checkPlanetNeeds
	if ($notEnoughVar = 1)
		add $current_start_planet 1
		if ($current_start_planet <= $potential_start_planets)
			setvar $startplanet $potential_start_planets[$current_start_planet]
			send "qq*  l " & #8 & $startplanet "**c"
			waitfor "#" & $startplanet
			setVar $notEnoughVar 0
			goto :startMeUP
		else
      goto :endscript
    end
	end
	add $planet~planetsFilled 1
end
:endScript
send "qq*  l " & #8 & $startplanet "**c"
setvar $switchboard~message "Mass upgrade run completed.*"
gosub :switchboard~switchboard
halt


:checkPlanetNeeds
	killalltriggers
	getDate $dateChecked
	setVar $citExists ""
	gosub :PLANET~getPlanetInfo
	lowercase $planet~planet_CLASS_NAME
	setVar $endPlanetCols ($planet~planet_FUEL_COLONISTS + $planet~planet_ORGANICS_COLONISTS + $planet~planet_EQUIPMENT_COLONISTS)
	setVar $i 1
	setVar $foundPlanet FALSE
	setVar $isAKeeper FALSE
	while (($i <= $planet~planetcounter) AND ($foundPlanet = FALSE))
		lowercase $planet~planetList[$i]
		lowercase $planet~planet_CLASS_NAME
		getWordPos $planet~planetList[$i] $pos $planet~planet_CLASS_NAME
		if ($pos > 0)
			setVar $isAKeeper $planet~planetList[$i][7]
			setVar $foundPlanet TRUE
		end
		add $i 1
	end
	getwordpos $start_planet_check $pos " "&$planet~planet&" "
	if (($endPlanetCols > 20000) and ($pos <= 0))
		setvar $start_planet_check $start_planet_check&" "&$planet~planet&" "
		add $potential_start_planets 1
		setvar $potential_start_planets[$potential_start_planets] $planet~planet
	end
	if ($isAKeeper <> TRUE)
		killalltriggers
		echo ansi_12 "**!!! Not a keeper planet !!! **"
		send "q*  l " #8 $startPlanet "* c "
		return		
	end
	if ($planet~citadel > 0)
		setVar $citExists "q"
	end
	if ($planet~under_construction = true)
		killalltriggers
		echo ansi_12 "**!!! Planet is under construction !!! **"
		gosub :planetUpGradeStat
		send "q*  l " #8 $startPlanet "* c "
		return
	end
	if ($planet~maxed_level = true)
		:maxedIG
		killalltriggers
		send "q*  l " #8 $startPlanet "* c "
		return
	end
	:planetDone


:checkCitRequirements
   killalltriggers
   send "c u* " $citExists "*"
   setTextTrigger cannot :cannotUpgrade "This Citadel cannot"
   setTextTrigger inProgress :inProgress "Be patient, your Citadel"
   setTextTrigger colsNeeded :colsNeeded " Colonists to support"
   setTextTrigger fuelNeeded :fuelNeeded " units of Fuel Ore,"
   setTextTrigger orgNeeded :orgNeeded " units of Organics,"
   setTextTrigger equNeeded :equNeeded " units of Equipment and"
   setTextTrigger beingBuild :beingBuilt "You may not upgrade while"
   pause

:beingBuilt
     killalltriggers
     echo ansi_12 "**" & CURRENTLINE & "!!!*"
     send "q*  l " #8 $startPlanet "* c "
     return

   :inProgress
     killalltriggers
     send "*"
     setTextTrigger L1Cit :L1Cit "day(s) till complete"
     pause
     :L1Cit
     gosub :planetUpGradeStat
     send "q*  l " #8 $startPlanet "* c "
     return

   :cannotUpgrade
     killalltriggers
     echo ANSI_12 "***   This planet CANNOT be upgraded!**"
     gosub :planetUpGradeStat
     send "qq*  l " #8 $startPlanet "* c "
     return

   :colsNeeded
     getword CURRENTLINE $colsNeeded 1
     stripText $colsNeeded ","
     pause
   :fuelNeeded
     getword CURRENTLINE $fuelNeeded 1
     stripText $fuelNeeded ","
     pause
   :orgNeeded
     getword CURRENTLINE $orgNeeded 1
     stripText $orgNeeded ","
     pause
   :equNeeded
     getword CURRENTLINE $equNeeded 1
     stripText $equNeeded ","

:calcRequirements
    killalltriggers
    setVar $notEnoughVar 0
    divide $colsNeeded 1000
    subTract $colsNeeded $endPlanetCols
	if (($colsNeeded > $startPlanetEquCol) and ($colsNeeded > $startPlanetOrgCol) and ($colsNeeded > $startPlanetFuelCol))
		setVar $notEnoughVar 1
	end
   subTract $fuelNeeded $planet~planet_FUEL
    if ($fuelNeeded > $startPlanetfuel)
        setVar $notEnoughVar 1
    end
    subTract $orgNeeded $planet~planet_ORGANICS
    if ($orgNeeded > $startPlanetorg)
        setVar $notEnoughVar 1
    end
   subTract $EquNeeded $planet~planet_EQUIPMENT
    if ($EquNeeded > $startPlanetEqu)
        setVar $notEnoughVar 1
    end
    if ($notEnoughVar = 1)
         return
    end

:goodToGo
   setVar $errorNoRoom 0
   if (($colsNeeded > 0) and (($startPlanetEquCol > $colsNeeded) or ($startPlanetOrgCol > $colsNeeded) or ($startPlanetFuelCol > $colsNeeded)))
      if ($startPlanetEquCol > $colsNeeded)
         setVar $take "snt3"
         setVar $leave "snl1"
         setVar $prodID 13
      ELSEIf ($startPlanetOrgCol > $colsNeeded)
         setVar $take "snt2"
         setVar $leave "snl1"
         setVar $prodID 12
      ElseIf ($startPlanetFuelCol > $colsNeeded)
         setVar $take "snt1"
         setVar $leave "snl1"
         setVar $prodID 11
      end
      setVar $trigger "How many groups of Colonists do you want to leave"
      setVar $amtNeeded $colsNeeded
      gosub :moveIt
   end
   if ($fuelNeeded > 0) and ($errorNoRoom = 0)
      setVar $take "tnt1"
      setVar $leave "tnl1"
      setVar $trigger "How many holds of Fuel Ore do you want to leave"
      setVar $amtNeeded $fuelNeeded
      setVar $prodID 2
      gosub :moveIt
   end
   if ($orgNeeded > 0) and ($errorNoRoom = 0)
      setVar $take "tnt2"
      setVar $leave "tnl2"
      setVar $trigger "How many holds of Organics do you want to leave"
      setVar $amtNeeded $orgNeeded
      setVar $prodID 3
      gosub :moveIt
   end
   if ($equNeeded > 0) and ($errorNoRoom = 0)
      setVar $take "tnt3"
      setVar $leave "tnl3"
      setVar $trigger "How many holds of Equipment do you want to leave"
      setVar $amtNeeded $equNeeded
      setVar $prodID 4
      gosub :moveIt
   end
   if ($errorNoRoom = 0)
      send "l  " #8 $fillPlanet "*cuy"
      waitfor "Do you wish to construct"
      setTextTrigger chkPrompt :chkPrompt " command"
      pause
      :chkPrompt
      getword currentline $chkPrompt 1
      if ($chkPrompt = "Citadel")
         send "q"
      end
   else
     send "l " #8 $startPlanet "* c "
     return
   end
   setDelayTrigger bogusDelay :bogusDelay 2000
   pause
   :bogusDelay
   goto :checkPlanetNeeds

:moveIt
   setVar $temp $amtNeeded
   divide $temp $shipHolds
   multiply $temp $shipHolds
   setVar $fraction 0
   if ($temp < $amtNeeded)
       setVar $fraction ($amtNeeded - $temp)
   elseif ($temp > $amtNeeded)
       subtract $amtNeeded 1
       setVar $fraction ($temp - $amtNeeded)
   end
   divide $amtNeeded $shipHolds
   add $amtNeeded 1
   setVar $i 1
   setTextTrigger noRoom :noRoom "They don't have room for that many on the planet!"
   while ($i <= $amtNeeded)
	      gosub :setWindow
	      killtrigger 1
	      send "l  " & #8 & $startPlanet & "*  " & $take & "*ql  " & #8 & $fillPlanet & "*  " & $leave & "*q"
	      setTextLineTrigger myTurns :myTurns "One turn deducted,"
	      setTextTrigger doneLeave :doneLeave $trigger
	      setdelaytrigger 1 :doneleave  5000
	      pause
	      :myTurns
	       getword currentline $myTurns 4
	       if ($minTurns > 0)
	          if ($myTurns <= $minTurns)
	             killtrigger doneLeave
	             echo ANSI_12 "***!!!! " ANSI_11 "Minimum Turn Level Reached" ANSI_12 " !!!!***"
	             send "l  " & #8 & $startPlanet & "* c "
	             halt
	          end
	       pause
	       end
	      :doneLeave
	       killtrigger myTurns
	       killtrigger doneLeave
	       killtrigger 1
	      if ($prodID = 11)
	         subtract $startPlanetCols $shipHolds
	         subtract $startPlanetFuelCol $shipHolds
	         subTract $colsNeeded $shipHolds
	      elseif ($prodID = 12)
	         subtract $startPlanetCols $shipHolds
	         subtract $startPlanetOrgCol $shipHolds
	         subTract $colsNeeded $shipHolds
	      elseif ($prodID = 13)
	         subtract $startPlanetCols $shipHolds
	         subtract $startPlanetEquCol $shipHolds
	         subTract $colsNeeded $shipHolds
	      elseif ($prodID = 2)
	         subtract $startPlanetFuel $shipHolds
	         subtract $fuelNeeded $shipHolds
	      elseif ($prodID = 3)
	         subTract $startPlanetOrg $shipHolds
	         subtract $orgNeeded $shipHolds
	      elseif ($prodID = 4)
	         subTract $startPlanetEqu $shipHolds
	         subTract $equNeeded $shipHolds
	      end
      add $i 1
   end
   if ($fraction > 0)
       send "l  " #8 $startPlanet "*  " $take & $fraction "*ql  " #8 $fillPlanet "*  " $leave $fraction "*q"
      if ($prodID = 11)
         subtract $startPlanetCols $fraction
         subtract $startPlanetFuelCol $fraction
         subTract $colsNeeded $fraction
      elseif ($prodID = 12)
         subtract $startPlanetCols $fraction
         subtract $startPlanetOrgCol $fraction
         subTract $colsNeeded $fraction
      elseif ($prodID = 13)
         subtract $startPlanetCols $fraction
         subtract $startPlanetEquCol $fraction
         subTract $colsNeeded $fraction
      elseif ($prodID = 2)
         subtract $startPlanetFuel $fraction
         subtract $fuelNeeded $fraction
      elseif ($prodID = 3)
         subTract $startPlanetOrg $fraction
         subtract $orgNeeded $fraction
      elseif ($prodID = 4)
         subTract $startPlanetEqu $fraction
         subTract $equNeeded $fraction
      end
      gosub :setWindow
   end
   killtrigger noRoom
return

:noRoom
 killalltriggers
 echo ansi_12 "*!!!! NO ROOM ON THIS PLANET ABORTING !!!!***"
 setVar $errorNoRoom 1
return

:getPlanetNumbers
# always more than 1 planet in sector
send "l"
setVar $pNumCnt 0
waitfor "---------"
:getPlanetNum
  killalltriggers
  setTextLineTrigger pNum :pNum "   <"
  setTextTrigger pNumDone :pNumDone "Land on which"
  pause
  :pNum
    killtrigger pNumDone
#    getWord currentline $planet~planet 2
     getText currentline $planet~planet "  <" "> "
     stripText $planet~planet " "
#    stripText $planet~planet ">"
    if ($planet~planet <> $startPlanet)
       add $pNumCnt 1
       setVar $pNumber[$pNumCnt] $planet~planet
    end
    goto :getPlanetNum
  :pNumDone
  send "  " #8 $startPlanet "* c"
  killtrigger pNum
  return

:padR
  getLength $inString $len
  while ($len < $padLen)
        setVar $inString $inString & " "
        add $len 1
  end
  return

:planetUpGradeStat
  setVar $inString $fillPlanet
  setVar $padLen 4
  gosub :padR
  setVar $stat_fillPlanet $inString
  setVar $instring $sectorArray[$sectCounter]
  setVar $padLen 5
  gosub :padR
  setVar $stat_sector $inString
  if ($lastSector <> $sectorArray[$sectCounter])
     setVar $lastSector $sectorArray[$sectCounter]
     write $gameFile " *"
  end
  getText currentline $UpgradeStat ", " " till complete"
  setVar $pStat "|" & currentline
  getText $pstat $pstat "|" "under construction"
  write $gameFile "Planet: " & $stat_fillPlanet  & " | Sector: " & $stat_sector & " | Date: " & $dateChecked & " | " & $upGradeStat & " | " & $pstat
  return

:setWindow
setVar $msg "*"
setVar $msg $msg & "* Current Sector " & $player~current_sector
if ($minTurns > 0)
   setVar $msg $msg & "* Remaining Turns: " & $myTurns
end
setVar $msg $msg & "* ---------------- *"
setVar $msg $msg & "* Donar Planet:    " & $startPlanet
setVar $inputVar $startPlanetFuelCol
gosub :genFormat
setVar $msg $msg & "* Fuel Cols Avail: " & $outPutVar
setVar $inputVar $startPlanetOrgCol
gosub :genFormat
setVar $msg $msg & "* Org Cols Avail:  " & $outPutVar
setVar $inputVar $startPlanetEquCol
gosub :genFormat
setVar $msg $msg & "* Equ Cols Avail:  " & $OutPutVar
setVar $inputVar $startPlanetFuel
gosub :genFormat
setVar $msg $msg & "* Fuel Avail:      " & $outPutVar
setVar $inputVar $startPlanetOrg
gosub :genFormat
setVar $msg $msg & "* Org Avail:       " & $outPutVar
setVar $inputVar $startPlanetEqu
gosub :genFormat
setVar $msg $msg & "* Equip Avail:     " & $outPutVar
setVar $inputVar $oreSafeMin
gosub :genFormat
setVar $msg $msg & "* Min Fuel Set To: " & $outPutVar
setVar $msg $msg & "* ---------------- *"
setVar $msg $msg & "* Upgrade Planet:  " & $fillPlanet
setVar $msg $msg & "* Upgrading:       " & $planet~planetsFilled & " of " & $pNumCnt & " planets"
setVar $inputVar $colsNeeded
gosub :genFormat
setVar $msg $msg & "* Cols Needed:     " & $outPutVar
setVar $inputVar $fuelNeeded
gosub :genFormat
setVar $msg $msg & "* Ore Needed:      " & $outPutVar
setVar $inputVar $orgNeeded
gosub :genFormat
setVar $msg $msg & "* Org Needed:      " & $outPutVar
setVar $inputVar $equNeeded
gosub :genFormat
setVar $msg $msg & "* Equ Needed:      " & $outPutVar
setVar $msg $msg & "*----------------- *"
setvar $window_start $start_planet_check
replacetext $window_start "  " " "
replacetext $window_start " " ","

setvar $msg $msg&"*Potential donar planets: "&$window_start
setVar $msg $msg & "*----------------- *"
setWindowContents citBuilder $msg & $msg1
return

:genFormat
  setVar $outputVar ""
  getLength $inputVar $cutLen
  while ($cutLen > 3)
      cutText $inputVar $tmpVar ($cutLen - 2) 3
      setVar $outPutVar  "," & $tmpVar & $outputVar
      subtract $cutLen 3
  end
  cutText $inputVar $tmpVar 1 $cutLen
  setVar $outputVar $tmpVar & $outputVar
  return


 


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\planet\loadplanetinfo\planet"
include "source\bot_includes\planet\getplanetinfo\planet"
