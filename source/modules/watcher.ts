systemscript

###########################################
#Making sure default MSL variables are set#
###########################################
loadVar $MAP~stardock
setSectorParameter 1 "MSLSEC" TRUE
setSectorParameter 2 "MSLSEC" TRUE
setSectorParameter 3 "MSLSEC" TRUE
setSectorParameter 4 "MSLSEC" TRUE
setSectorParameter 5 "MSLSEC" TRUE
setSectorParameter 6 "MSLSEC" TRUE
setSectorParameter 7 "MSLSEC" TRUE
setSectorParameter 8 "MSLSEC" TRUE
setSectorParameter 9 "MSLSEC" TRUE
setSectorParameter 10 "MSLSEC" TRUE
if ($MAP~stardock > 0)
        setSectorParameter $MAP~stardock "MSLSEC" TRUE
end



    setTextLineTrigger  federase        :fedEraseFig        "The Federation We destroyed your Corp's "
    setTextLineTrigger  fighterserase       :eraseFig       " of your fighters in sector "
    setTextLineTrigger  warpfigerase        :eraseWarpFig       "You do not have any fighters in Sector "
    setTextLineTrigger  pgridadd    :pgridadd   "Successfully P-gridded into sector "
    setTextLineTrigger  pgridremove    :pgridremove   "Unsuccessful P-grid into sector "
    setTextLineTrigger  clearbusts      :erasebusts     ">[Busted:"
    setTextLineTrigger  planetmoved      :updatePlanetMovement     " moved to sector "
    setTextLineTrigger      fightersadd     :addFig         "Should they be (D)efensive, (O)ffensive or Charge a (T)oll ?"
    setTextLineTrigger  getPlanetNumber :setPlanetNumber    "Planet #"
    setTextTrigger  sectordata      :checkSectorData    "(?=Help)? :"
    setTextLineTrigger  getshipstats    :setShipOffensiveOdds   "Offensive Odds: "
    setTextLineTrigger  getshipmaxfighters  :setShipMaxFigAttack    " TransWarp Drive:   "
    setTextLineTrigger  captureLevelPlanet  :captureLevelPlanet " Level "
    setTextLineTrigger  captureNoLevelPlanet  :captureNoLevelPlanet " No Citadel"
    setTextLineTrigger  shipdestroyed         :shipdestroyed "You will have to start over from scratch!"
    setTextLineTrigger  getPlanetNumberRaw    :setPlanetNumberRaw "Land on which planet <Q to abort> ? "
    setTextLineTrigger  getShipNumberRaw       :setShipNumberRaw "Choose which ship to beam to (Q=Quit) "
    pause

:mcicneg
    #need to add sector in MCIC message for this to work
    cutText CURRENTLINE&"   " $spoof 1 1
    if ($spoof <> "R")
        setTextLineTrigger  mcicneg :mcicneg    "/unit - MCIC "
        pause
    end
    getText CURRENTLINE&"  [XX][XX][XX]" $temp "/unit - MCIC " "  [XX][XX][XX]"
    if ($temp <> "")
        setSectorParameter $target "MCIC" $temp
    end
    setTextLineTrigger  mcicneg :mcicneg    "/unit - MCIC "
    pause


:setShipNumberRaw
    getWord CURRENTLINE $spoof 1
    if ($spoof = "Choose")
        getWord CURRENTLINE $PLAYER~SHIP_NUMBER 8
        isNumber $test $PLAYER~SHIP_NUMBER 
        if ($test = TRUE)
            saveVar $PLAYER~SHIP_NUMBER
        end
    end
    setTextLineTrigger  getShipNumberRaw       :setShipNumberRaw "Choose which ship to beam to (Q=Quit) "
    pause

pause


:setPlanetNumberRaw
    getWord CURRENTLINE $spoof 1
    if ($spoof = "Land")
        getWord CURRENTLINE $PLANET~PLANET 9
        isNumber $test $PLANET~PLANET
        if ($test = TRUE)
            saveVar $PLANET~PLANET
        end
    end
    setTextLineTrigger  getPlanetNumberRaw    :setPlanetNumberRaw "Land on which planet <Q to abort> ? "
    pause

pause

:fedEraseFig
    getWord CURRENTLINE $spoof 1
    if ($spoof <> "The")
        goto :endFedEraseFig
    end
    getText CURRENTLINE&"  [XX][XX][XX]" $temp " fighters in sector " ".  [XX][XX][XX]"
    if ($temp <> "")
        isNumber $test $temp
        if ($test = TRUE)
            if (($temp <= SECTORS) AND ($temp > 0))
                setVar $target $temp
                setSectorParameter $target "MSLSEC" TRUE
                gosub :removefigfromdata
            end
        end
    end
:endFedEraseFig
    setTextLineTrigger  federase        :fedEraseFig        "The Federation We destroyed "
    pause
:eraseFig
    cutText CURRENTLINE&"     " $spoof 1 2 
    cutText CURRENTLINE&"     " $spoof2 1 1 
    if (($spoof = "R ") OR ($spoof = "F ") OR ($spoof = "P ") OR ($spoof2 = "'") OR ($spoof2 = "`"))
        goto :endEraseFig
    end
    getText CURRENTLINE&" [XX][XX][XX]" $temp " destroyed " " [XX][XX][XX]"
    if ($temp <> "")
        getWord $temp $fig_hit 7
        getWord $temp $fig_number 1
        isNumber $test $fig_hit 
        if (($test = TRUE) AND ($fig_number <> "0"))
            if (($fig_hit <= SECTORS) AND ($fig_hit > 0))
                setVar $target $fig_hit
                gosub :removefigfromdata
            end
        end
    end
:endEraseFig
    setTextLineTrigger fighterserase :eraseFig " of your fighters in sector "
    pause
:eraseWarpFig
    getWord CURRENTLINE $spoof 1
    if ($spoof <> "You")
        setTextLineTrigger      warpfigerase        :eraseWarpFig       "You do not have any fighters in Sector "
        pause
    end
    getText CURRENTLINE&" [XX][XX][XX]" $temp "You do not have any fighters in Sector " ". [XX][XX][XX]"
    if ($temp <> "")
        isNumber $test $temp 
        if ($test)
            if (($temp <= SECTORS) AND ($temp > 0))
                setVar $target $temp
                gosub :removefigfromdata
            end
        end
    end
    setTextLineTrigger      warpfigerase        :eraseWarpFig       "You do not have any fighters in Sector "
    pause

:erasebusts
    cutText CURRENTLINE&"   " $spoof 1 1
    if ($spoof <> "R")
        setTextLineTrigger  clearbusts      :erasebusts     ">[Busted:"
        pause
    end
    getText CURRENTLINE&" [XX][XX][XX]" $temp ">[Busted:" "]<"
    if ($temp <> "")
        isNumber $test $temp
        if ($test)
            if (($temp <= SECTORS) AND ($temp > 0))
                setSectorParameter $temp "BUSTED" FALSE
                setSectorParameter $temp "FAKEBUST" FALSE
            end
        end
    end
    setTextLineTrigger  clearbusts      :erasebusts     ">[Busted:"
    pause

:updatePlanetMovement
    cutText CURRENTLINE&"   " $spoof 1 1
    if ($spoof <> "R")
        setTextLineTrigger  planetmoved      :updatePlanetMovement     " moved to sector "
        pause
    end
    getWordPos CURRENTLINE $pos "} - Planet #" 
    getWordPos CURRENTLINE $pos2 " moved to sector " 
    if (($pos > 0) and ($pos2 > 0))
        getWord CURRENTLINE $planet_id 6
        getWord CURRENTLINE $planet_sector 10
        replaceText $planet_id "#" ""
        replaceText $planet_sector "." ""
        isNumber $test $planet_sector
        if ($test)
            setSectorParameter $planet_id "PSECTOR" $planet_sector
        end
    end
    setTextLineTrigger  planetmoved      :updatePlanetMovement     " moved to sector "
    pause

:pgridadd
    cutText CURRENTLINE&"   " $spoof 1 1
    if ($spoof <> "R")
        setTextLineTrigger  pgridadd    :pgridadd   "Successfully P-gridded into sector "
        pause
    end

    getText CURRENTLINE&" [XX][XX][XX]" $temp "Successfully P-gridded into sector " " [XX][XX][XX]"
    if ($temp <> "")
        isNumber $test $temp
        if ($test)
            if (($temp <= SECTORS) AND ($temp > 0))
                setVar $target $temp
                gosub :addfigtodata 
            end
        end
    end
    setTextLineTrigger  pgridadd    :pgridadd   "Successfully P-gridded into sector "
    pause

:pgridremove
    cutText CURRENTLINE&"   " $spoof 1 1
    if ($spoof <> "R")
        setTextLineTrigger  pgridremove    :pgridremove   "Unsuccessful P-grid into sector "
        pause
    end

    getText CURRENTLINE&" [XX][XX][XX]" $temp "Unsuccessful P-grid into sector " ". Someone make sure bot is picked up."
    if ($temp <> "")
        isNumber $test $temp
        if ($test)
            if (($temp <= SECTORS) AND ($temp > 0))
                setVar $target $temp
                gosub :removefigfromdata 
            end
        end
    end
    setTextLineTrigger  pgridremove    :pgridremove   "Unsuccessful P-grid into sector "
    pause

:addFig
    isNumber $test CURRENTSECTOR
    if ($test)
        if ((CURRENTSECTOR > 10) AND (CURRENTSECTOR < SECTORS))
            setVar $target CURRENTSECTOR
            gosub :addfigtodata
        end
    end
    setTextLineTrigger      fightersadd     :addFig         "Should they be (D)efensive, (O)ffensive or Charge a (T)oll ?"
    pause



:removeFigFromData
    getSectorParameter $target "FIGSEC" $check
    if ($check = TRUE)
        getSectorParameter 2 "FIG_COUNT" $figCount
        setSectorParameter 2 "FIG_COUNT" ($figCount-1)
    end
    setSectorParameter $target "FIGSEC" FALSE
return
:addFigToData
    setSectorParameter $target "FIGSEC" TRUE
return


# ============================== START GET PLANET STATS TRIGGERS==============================
:setPlanetNumber
    getWordPos RAWPACKET $pos "Planet " & #27 & "[1;33m#" & #27 & "[36m"
    if ($pos > 0)
        getText RAWPACKET $PLANET~PLANET "Planet " & #27 & "[1;33m#" & #27 & "[36m" #27 & "[0;32m in sector "
        isNumber $test $PLANET~PLANET 
        if ($test = TRUE)
            saveVar $PLANET~PLANET
            setSectorParameter $PLANET~PLANET "PSECTOR" CURRENTSECTOR
        end
    end
    setTextLineTrigger  getPlanetNumber :setPlanetNumber    "Planet #"
    pause
# =============================== END GET PLANET STATS TRIGGERS===============================
# ============================== CHECK SECTOR DATA ========================================
:checkSectorData
    getText CURRENTLINE $cursec "]:[" "] ("
    if ($cursec = CURRENTSECTOR)
        setVar $PLAYER~CURRENT_SECTOR $cursec
        saveVar $PLAYER~CURRENT_SECTOR
        getSectorParameter $PLAYER~CURRENT_SECTOR "BUSTED" $isBusted
        loadVar $BOT~command_prompt_extras
        if (($BOT~command_prompt_extras = TRUE) and ($isBusted = TRUE))
            echo ANSI_5 "[" ANSI_12 "BUSTED" ANSI_5 "] : "
        end
        getSectorParameter $PLAYER~CURRENT_SECTOR "MSLSEC" $isMSL
        if (($BOT~command_prompt_extras = TRUE) and ($isMSL = TRUE))
            echo ANSI_5 "[" ANSI_9 "MSL" ANSI_5 "] : "
        end
    end
    setTextTrigger  sectordata      :checkSectorData    "(?=Help)? :"
    pause
# ============================ END CHECK SECTOR DATA ========================================
# ============================== START GET SHIP STATS TRIGGERS==============================
:setShipOffensiveOdds
    getWordPos CURRENTANSILINE $pos "[0;31m:[1;36m1"
    if ($pos > 0)
        getText CURRENTANSILINE $SHIP~SHIP_OFFENSIVE_ODDS "Offensive Odds[1;33m:[36m " "[0;31m:[1;36m1"
        stripText $SHIP~SHIP_OFFENSIVE_ODDS "."
        stripText $SHIP~SHIP_OFFENSIVE_ODDS " "
        saveVar $SHIP~SHIP_OFFENSIVE_ODDS
        gettext CURRENTANSILINE $SHIP~SHIP_FIGHTERS_MAX "Max Fighters[1;33m:[36m" "[0;32m Offensive Odds"
        stripText $SHIP~SHIP_FIGHTERS_MAX ","
        stripText $SHIP~SHIP_FIGHTERS_MAX " "
        saveVar $SHIP~SHIP_FIGHTERS_MAX
    end
    setTextLineTrigger  getshipstats    :setShipOffensiveOdds   "Offensive Odds: "
    pause
:setShipMaxFigAttack
    getWordPos CURRENTANSILINE $pos "[0m[32m Max Figs Per Attack[1;33m:[36m"
    if ($pos > 0)
        getText CURRENTANSILINE $SHIP~SHIP_MAX_ATTACK "[0m[32m Max Figs Per Attack[1;33m:[36m" "[0;32mTransWarp"
        striptext $SHIP~SHIP_MAX_ATTACK " "
        saveVar $SHIP~SHIP_MAX_ATTACK
    end
    setTextLineTrigger  getshipmaxfighters  :setShipMaxFigAttack    " TransWarp Drive:   "
    pause
# ============================== END GET SHIP STATS TRIGGERS==============================
return

:captureLevelPlanet
#do better ansi checks for spoofing
getWordPos CURRENTANSILINE $pos "[32mLevel [1;33m"
if ($pos > 0)
    getWord CURRENTLINE $planet_sector 1
    getWord CURRENTLINE $planet_id 2
    if ($planet_id = "T")
        getWord CURRENTLINE $planet_id 3
    end
    replaceText $planet_id "#" ""
    isNumber $test $planet_id
    getWordPos $planet_id $pos "."
    if (($test = TRUE) and ($pos <= 0))
        if ($planet_id > 0)
            setSectorParameter $planet_id "PSECTOR" $planet_sector
        end
    end
end
setTextLineTrigger  captureLevelPlanet  :captureLevelPlanet " Level "
pause

:captureNoLevelPlanet
getWordPos CURRENTANSILINE $pos "[32m No Citadel"
if ($pos > 0)
    getWord CURRENTLINE $planet_sector 1
    getWord CURRENTLINE $planet_id 2
    if ($planet_id = "T")
        getWord CURRENTLINE $planet_id 3
    end
    replaceText $planet_id "#" ""
    isNumber $test $planet_id
    getWordPos $planet_id $pos "."
    if (($test = TRUE) and ($pos <= 0))
        if ($planet_id > 0)
            setSectorParameter $planet_id "PSECTOR" $planet_sector
        end
    end
end
setTextLineTrigger  captureNoLevelPlanet  :captureNoLevelPlanet " No Citadel"
pause

:shipdestroyed

getWordPos CURRENTANSILINE $pos "[32mYou will have to start over"
if ($pos > 0)
    DISCONNECT
    setVar $BOT~isShipDestroyed TRUE
    saveVar $BOT~isShipDestroyed
    listActiveScripts $scripts
    setVar $i 1
    setVar $found FALSE
    setVar $rebooted FALSE
    echo "Mombot rebooting..**"
    while ($i <= $scripts)
        getWordPos "<><><>"&$scripts[$i] $pos "<><><>__mom_bot"
        if ($pos > 0)
            if ($rebooted = FALSE)
                load "scripts\mombot\"&$scripts[$i]
            end
            stop $scripts[$i]
            setVar $found TRUE
        end
        add $i 1
    end
    if ($FOUND = FALSE)
        echo "No mombot script found to reboot.**"
    end
end

setTextLineTrigger  shipdestroyed         :shipdestroyed "You will have to start over from scratch!"
pause
