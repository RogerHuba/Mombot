systemscript
    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $self_command
    loadVar $MAP~stardock
    loadVar $MAP~backdoor
    loadVar $MAP~rylos
    loadVar $MAP~alpha_centauri
    loadVar $PLAYER~unlimitedGame
    loadVar $PLAYER~CREDITS
    loadVar $PLAYER~FIGHTERS
    loadVar $PLAYER~SHIELDS
    loadVar $PLAYER~TOTAL_HOLDS
    loadVar $PLAYER~ORE_HOLDS
    loadVar $PLAYER~ORGANIC_HOLDS
    loadVar $PLAYER~EQUIPMENT_HOLDS
    loadVar $PLAYER~COLONIST_HOLDS
    loadVar $PLAYER~PHOTONS
    loadVar $PLAYER~ARMIDS
    loadVar $PLAYER~LIMPETS
    loadVar $PLAYER~GENESIS
    loadVar $PLAYER~TWARP_TYPE
    loadVar $PLAYER~CLOAKS
    loadVar $PLAYER~BEACONS
    loadVar $PLAYER~ATOMIC
    loadVar $PLAYER~CORBO
    loadVar $PLAYER~EPROBES
    loadVar $PLAYER~MINE_DISRUPTORS
    loadVar $PLAYER~PSYCHIC_PROBE
    loadVar $PLAYER~PLANET_SCANNER
    loadVar $PLAYER~SCAN_TYPE
    loadVar $PLAYER~ALIGNMENT
    loadVar $PLAYER~EXPERIENCE
    loadVar $PLAYER~SHIP_NUMBER
    loadVar $PLAYER~TRADER_NAME

 loadvar $SWITCHBOARD~bot_name 

window COMS 280 650 "Stats" ONTOP
gosub :update_window

gosub :PLAYER~init

:start_over
    setVar $CURRENT_PROMPT      "Undefined"
    killtrigger noprompt
    killtrigger prompt
    killtrigger statlinetrig
    killtrigger getLine2
    killtrigger playerinfo
    killtrigger getshipoffense
    killtrigger getshipfighters
    killtrigger getshipmines
    setTextLineTrigger  prompt      :allPrompts     #145 & #8
    setTextLineTrigger  statlinetrig    :statStart      #179
    setTextLineTrigger  playerinfo :playerinfo  "<Info>"
    setTextLineTrigger  getshipoffense      :shipoffenseodds    "Offensive Odds: "
    setTextLineTrigger  getshipfighters     :shipmaxfigsperattack   " TransWarp Drive:   "
    setTextLineTrigger  getshipmines        :shipmaxmines       " Mine Max:  "

    pause
    :allPrompts
        getWord CURRENTLINE $CURRENT_PROMPT 1
        setVar $FULL_CURRENT_PROMPT CURRENTLINE
        stripText $FULL_CURRENT_PROMPT #145
        stripText $FULL_CURRENT_PROMPT #8
        stripText $CURRENT_PROMPT #145
        stripText $CURRENT_PROMPT #8
        setTextLineTrigger  prompt      :allPrompts     #145 & #8
        pause
    :statStart
        killtrigger prompt
        setVar $stats ""
        setVar $wordy ""
    :statsline
        killtrigger statlinetrig
        killtrigger getLine2
        setVar $line2 CURRENTLINE
        replacetext $line2 #179 " "
        striptext $line2 ","
        setVar $stats $stats & $line2
        getWordPos $line2 $pos "Ship"
        if ($pos > 0)
            goto :gotStats
        else
            setTextLineTrigger getLine2 :statsline
            pause
        end
    :gotStats
        setVar $stats $stats & " @@@"
        setVar $current_word 0
        while ($wordy <> "@@@")
            if ($wordy = "Sect")
                getWord $stats $PLAYER~CURRENT_SECTOR      ($current_word + 1)
            elseif ($wordy = "Turns")
                getWord $stats $PLAYER~TURNS           ($current_word + 1)
            elseif ($wordy = "Creds")
                getWord $stats $PLAYER~CREDITS         ($current_word + 1)
            elseif ($wordy = "Figs")
                getWord $stats $PLAYER~FIGHTERS        ($current_word + 1)
            elseif ($wordy = "Shlds")
                getWord $stats $PLAYER~SHIELDS         ($current_word + 1)
            elseif ($wordy = "Hlds")
                getWord $stats $PLAYER~TOTAL_HOLDS         ($current_word + 1)
            elseif ($wordy = "Ore")
                getWord $stats $PLAYER~ORE_HOLDS           ($current_word + 1)
            elseif ($wordy = "Org")
                getWord $stats $PLAYER~ORGANIC_HOLDS       ($current_word + 1)
            elseif ($wordy = "Equ")
                getWord $stats $PLAYER~EQUIPMENT_HOLDS     ($current_word + 1)
            elseif ($wordy = "Col")
                getWord $stats $PLAYER~COLONIST_HOLDS      ($current_word + 1)
            elseif ($wordy = "Phot")
                getWord $stats $PLAYER~PHOTONS         ($current_word + 1)
            elseif ($wordy = "Armd")
                getWord $stats $PLAYER~ARMIDS          ($current_word + 1)
            elseif ($wordy = "Lmpt")
                getWord $stats $PLAYER~LIMPETS         ($current_word + 1)
            elseif ($wordy = "GTorp")
                getWord $stats $PLAYER~GENESIS         ($current_word + 1)
            elseif ($wordy = "TWarp")
                getWord $stats $PLAYER~TWARP_TYPE          ($current_word + 1)
            elseif ($wordy = "Clks")
                getWord $stats $PLAYER~CLOAKS          ($current_word + 1)
            elseif ($wordy = "Beacns")
                getWord $stats $PLAYER~BEACONS         ($current_word + 1)
            elseif ($wordy = "AtmDt")
                getWord $stats $PLAYER~ATOMIC          ($current_word + 1)
            elseif ($wordy = "Corbo")
                getWord $stats $PLAYER~CORBO           ($current_word + 1)
            elseif ($wordy = "EPrb")
                getWord $stats $PLAYER~EPROBES         ($current_word + 1)
            elseif ($wordy = "MDis")
                getWord $stats $PLAYER~MINE_DISRUPTORS     ($current_word + 1)
            elseif ($wordy = "PsPrb")
                getWord $stats $PLAYER~PSYCHIC_PROBE       ($current_word + 1)
            elseif ($wordy = "PlScn")
                getWord $stats $PLAYER~PLANET_SCANNER      ($current_word + 1)
            elseif ($wordy = "LRS")
                getWord $stats $PLAYER~SCAN_TYPE           ($current_word + 1)
            elseif ($wordy = "Aln")
                getWord $stats $PLAYER~ALIGNMENT           ($current_word + 1)
            elseif ($wordy = "Exp")
                getWord $stats $PLAYER~EXPERIENCE          ($current_word + 1)
            elseif ($wordy = "Corp")
                getWord $stats $PLAYER~CORP            ($current_word + 1)
            elseif ($wordy = "Ship")
                getWord $stats $PLAYER~SHIP_NUMBER         ($current_word + 1)
            end
            add $current_word 1
            getWord $stats $wordy $current_word
        end
    :doneQuikstats
    killtrigger statlinetrig
    killtrigger getLine2
    gosub :update_window
goto :start_over

:playerinfo
    setTextLineTrigger getTraderName            :getTraderName "Trader Name    :"
        setTextLineTrigger getExpAndAlign           :getExpAndAlign "Rank and Exp"
        setTextLineTrigger getCorp          :getCorp "Corp           #"
        setTextLineTrigger getShipType              :getShipType "Ship Info      :"
        setTextLineTrigger getTPW           :getTPW "Turns to Warp  :"
        setTextLineTrigger getSect          :getSect "Current Sector :"
        setTextLineTrigger getTurns                 :getTurns "Turns left"
        setTextLineTrigger getHolds                 :getHolds "Total Holds"
        setTextLineTrigger getFighters              :getFighters "Fighters       :"
        setTextLineTrigger getShields               :getShields "Shield points  :"
        setTextLineTrigger getPhotons               :getPhotons "Photon Missiles:"
        setTextLineTrigger getScanType              :getScanType "LongRange Scan :"
        setTextLineTrigger getTwarpType1            :getTwarpType1 "  (Type 1 Jump):"
        setTextLineTrigger getTwarpType2            :getTwarpType2 "  (Type 2 Jump):"
        setTextLineTrigger getCredits               :getCredits "Credits"
        setTextLineTrigger checkig          :checkig "Interdictor ON :"
    setTextTrigger getInfoDone          :getInfoDone "Command [TL="
        setTextTrigger getInfoDone2                 :getInfoDone "Citadel command"
        pause
    :getInfo_CN9_Check
        setvar $NOFLIP  TRUE
        pause
    :getTraderName
        killTrigger getInfo_CN9_Check_1
        killTrigger getInfo_CN9_Check_2
        setVar $PLAYER~TRADER_NAME CURRENTLINE
        stripText $PLAYER~TRADER_NAME "Trader Name    : "
        setVar $i 1
        while ($i <= $PLAYER~ranksLength)
            setVar $temp $PLAYER~ranks[$i]
            stripText $temp "31m"
            stripText $temp "36m"
            stripText $PLAYER~TRADER_NAME $temp&" "
            add $i 1
        end
        pause
    :getExpAndAlign
            getWord CURRENTLINE $PLAYER~EXPERIENCE 5
            getWord CURRENTLINE $PLAYER~ALIGNMENT 7
            stripText $PLAYER~EXPERIENCE ","
            stripText $PLAYER~ALIGNMENT ","
            stripText $PLAYER~ALIGNMENT "Alignment="
            pause
    :getCorp
            getWord CURRENTLINE $PLAYER~CORP 3
            stripText $PLAYER~CORP ","
            setVar $CORPstring "[" & $PLAYER~CORP & "]"
            pause
    :getShipType
            getWordPos CURRENTLINE $shiptypeend "Ported="
            subtract $shiptypeend 18
            cutText CURRENTLINE $PLAYER~SHIP_TYPE 18 $shiptypeend
            pause
    :getTPW
            getWord CURRENTLINE $PLAYER~TURNS_PER_WARP 5
            pause
    :getSect
            getWord CURRENTLINE $PLAYER~CURRENT_SECTOR 4
            pause
    :getTurns
            getWord CURRENTLINE $PLAYER~TURNS 4
            if ($PLAYER~TURNS = "Unlimited")
                setVar $PLAYER~unlimitedGame TRUE
            end
            saveVar $PLAYER~unlimitedGame
            pause
    :getHolds
        setVar $Temp (CURRENTLINE & " ")
        getText $Temp $PLAYER~ORE_HOLDS "Ore=" " "
        if ($PLAYER~ORE_HOLDS = "")
            setVar $PLAYER~ORE_HOLDS "0"
        end
        getText $Temp $PLAYER~ORGANIC_HOLDS "Organics=" " "
        if ($PLAYER~ORGANIC_HOLDS = "")
            setVar $PLAYER~ORGANIC_HOLDS "0"
        end
        getTExt $Temp $PLAYER~EQUIPMENT_HOLDS "Equipment=" " "
        if ($PLAYER~EQUIPMENT_HOLDS = "")
            setVar $PLAYER~EQUIPMENT_HOLDS "0"
        end
        getTExt $Temp $PLAYER~COLONIST_HOLDS "Colonists=" " "
        if ($PLAYER~COLONIST_HOLDS = "")
            setVar $PLAYER~COLONIST_HOLDS "0"
        end
        getText $Temp $PLAYER~EMPTY_HOLDS "Empty=" " "
        if ($PLAYER~EMPTY_HOLDS = "")
            setVar $PLAYER~EMPTY_HOLDS "0"
        end
        pause
    :getFighters
            getWord CURRENTLINE $PLAYER~FIGHTERS 3
            stripText $PLAYER~FIGHTERS ","
            pause
    :getShields
            getWord CURRENTLINE $PLAYER~SHIELDS 4
            stripText $PLAYER~SHIELDS ","
            pause
    :getPhotons
            getWord CURRENTLINE $PLAYER~PHOTONS 3
            pause
    :getScanType
            getWord CURRENTLINE $PLAYER~SCAN_TYPE 4
            pause
    :getTwarpType1
            getWord CURRENTLINE $PLAYER~TWARP_1_RANGE 4
            setVar $PLAYER~TWARP_TYPE 1
            pause
    :getTwarpType2
            getWord CURRENTLINE $PLAYER~TWARP_2_RANGE 4
            setVar $PLAYER~TWARP_TYPE 2
            pause
    :getCredits
            getWord CURRENTLINE $PLAYER~CREDITS 3
            stripText $CREDITS ","
            if ($PLAYER~igstat = 0)
                setVar $PLAYER~igstat "NO IG"
            end
            pause
    :checkig
        getWord CURRENTLINE $PLAYER~igstat 4
        pause
    :getInfoDone
                    killtrigger getExpAndAlign     
                killtrigger getCorp         
                killtrigger getShipType       
                killtrigger getTPW           
                killtrigger getSect          
                killtrigger getTurns                 
                killtrigger getHolds                 
                killtrigger getFighters              
                killtrigger getShields               
                killtrigger getPhotons               
                killtrigger getScanType             
                killtrigger getTwarpType1          
                killtrigger getTwarpType2           
                killtrigger getCredits              
                killtrigger checkig          
                killtrigger getInfoDone          
                killtrigger getInfoDone2        
gosub :update_window
goto :start_over


:ship_stats
    
    :shipoffenseodds
    getWordPos CURRENTANSILINE $pos "[0;31m:[1;36m1"
    if ($pos > 0)
        getText CURRENTANSILINE $SHIP~SHIP_OFFENSIVE_ODDS "Offensive Odds[1;33m:[36m " "[0;31m:[1;36m1"
        stripText $SHIP~SHIP_OFFENSIVE_ODDS " "
        gettext CURRENTANSILINE $SHIP~SHIP_FIGHTERS_MAX "Max Fighters[1;33m:[36m" "[0;32m Offensive Odds"
        stripText $SHIP~SHIP_FIGHTERS_MAX ","
        stripText $SHIP~SHIP_FIGHTERS_MAX " "
    end
    pause
    :shipmaxmines
        getText CURRENTLINE $SHIP~SHIP_MINES_MAX "Mine Max:" "Beacon Max:"
        stripText $SHIP~SHIP_MINES_MAX " "
        pause
    
    :shipmaxfigsperattack
        getWordPos CURRENTANSILINE $pos "[0m[32m Max Figs Per Attack[1;33m:[36m"
        if ($pos > 0)
            getText CURRENTANSILINE $SHIP~SHIP_MAX_ATTACK "[0m[32m Max Figs Per Attack[1;33m:[36m" "[0;32mTransWarp"
            striptext $SHIP~SHIP_MAX_ATTACK " "
        end 

gosub :update_window
goto :start_over


:update_window
    setVar $contents ""
    setVar $contents $contents&"----------------------------------*"
    setVar $contents $contents&"      Game : "&GAMENAME&"*"
    setVar $contents $contents&"----------------------------------*"
    setVar $contents $contents&"    Trader : "&$PLAYER~TRADER_NAME&"*"
    setVar $contents $contents&"----------------------------------*"
    if ($PLAYER~CURRENT_SECTOR = 0)
        setVar $contents $contents&"    Sector : "&CURRENTSECTOR&"*"
    else
        setVar $contents $contents&"    Sector : "&$PLAYER~CURRENT_SECTOR&"*"
    end
    if ($PLANET <> 0)
        setVar $contents $contents&"    Planet : "&$PLANET~PLANET&"*"
    end
    if ($PLAYER~unlimitedGame)
        setVar $contents $contents&"     Turns : Unlimited*"
    else
        setVar $contents $contents&"     Turns : "&$PLAYER~TURNS&"*"
    end
    setVar $contents $contents&"       Exp : "&$PLAYER~EXPERIENCE&"*"
    setVar $contents $contents&"     Align : "&$PLAYER~ALIGNMENT&"*"
    setVar $contents $contents&"   Credits : "&$PLAYER~CREDITS&"*"
    setVar $contents $contents&"----------------------------------*"
    setVar $contents $contents&"Holds Info : "&$PLAYER~TOTAL_HOLDS&"*"
    setVar $contents $contents&"----------------------------------*"
    setVar $contents $contents&"  Fuel Ore : "&$PLAYER~ORE_HOLDS&"*"
    setVar $contents $contents&"  Organics : "&$PLAYER~ORGANIC_HOLDS&"*"
    setVar $contents $contents&" Equipment : "&$PLAYER~EQUIPMENT_HOLDS&"*"
    setVar $contents $contents&" Colonists : "&$PLAYER~COLONIST_HOLDS&"*"
    setVar $empty_holds ($total_holds - $ore_holds)
    setVar $empty_holds ($empty_holds - $organic_holds)
    setVar $empty_holds ($empty_holds - $equipment_holds)
    setVar $empty_holds ($empty_holds - $colonist_holds)
    
    setVar $contents $contents&"     Empty : "&$PLAYER~EMPTY_HOLDS&"*"
    setVar $contents $contents&"----------------------------------*"
    setVar $contents $contents&"    Ship # : "&$PLAYER~SHIP_NUMBER&"*"
    setVar $contents $contents&"----------------------------------*"
    setVar $contents $contents&"  Fighters : "&$PLAYER~FIGHTERS&"*"
    setVar $contents $contents&"   Shields : "&$PLAYER~SHIELDS&"*"
    setVar $contents $contents&"  Max Figs : "&$PLAYER~SHIP_FIGHTERS_MAX&"*"
    setVar $contents $contents&"  Max Wave : "&$PLAYER~SHIP_MAX_ATTACK&"*"
    setVar $contents $contents&"Turns/Warp : "&$PLAYER~TURNS_PER_WARP&"*"
    setVar $contents $contents&"----------------------------------*"
  
    cutText $PLAYER~ARMIDS&"    " $PLAYER~ARMIDS 0 3
    cutText $PLAYER~CLOAKS&"    " $PLAYER~CLOAKS 0 3
    cutText $PLAYER~GENESIS&"    " $PLAYER~GENESIS 0 3
    cutText $PLAYER~MINE_DISRUPTORS&"    " $PLAYER~MINE_DISRUPTORS 0 3
    cutText $PLAYER~EPROBES&"    " $PLAYER~EPROBES 0 3
    cutText $PLAYER~TWARP_TYPE&"    " $PLAYER~TWARP_TYPE 0 3
    cutText $PLAYER~SCAN_TYPE&"    " $PLAYER~SCAN_TYPE 0 3

    setVar $contents $contents&"   EProbes : "&$PLAYER~eprobes&" | Beacons : "&$PLAYER~beacons&"*"
    setVar $contents $contents&"   Disrupt : "&$PLAYER~MINE_DISRUPTORS&" | Photons : "&$PLAYER~PHOTONS&"*"
    setVar $contents $contents&"    Armids : "&$PLAYER~ARMIDS&" | Limpets : "&$PLAYER~LIMPETS&"*"
    setVar $contents $contents&"   Genesis : "&$PLAYER~GENESIS&" | AtmDets : "&$PLAYER~ATOMIC&"*"
    setVar $contents $contents&"    Cloaks : "&$PLAYER~CLOAKS&" |  Corbos : "&$PLAYER~CORBO&"*"
    setVar $contents $contents&"     Twarp : "&$PLAYER~TWARP_TYPE&" | PlnScan : "&$PLAYER~PLANET_SCANNER&"*"
    setVar $contents $contents&"   Scanner : "&$PLAYER~SCAN_TYPE&" | PsiProb : "&$PLAYER~PSYCHIC_PROBE&"*"
    setVar $contents $contents&"----------------------------------*"
    setVar $contents $contents&"  Special Sectors*"
    setVar $contents $contents&"----------------------------------*"
    setVar $contents $contents&"     Dock  : "&$MAP~stardock&"*"
    setVar $contents $contents&"     Alpha : "&$MAP~alpha_centauri&"*"
    setVar $contents $contents&"     Rylos : "&$MAP~rylos&"*"
    setVar $contents $contents&"  Backdoor : "&$MAP~backdoor&"*"
    setVar $contents $contents&"----------------------------------*"
    setwindowcontents COMS $contents

    saveVar $MAP~stardock
    saveVar $MAP~backdoor
    saveVar $MAP~rylos
    saveVar $MAP~alpha_centauri
    saveVar $PLAYER~unlimitedGame
    saveVar $PLAYER~CREDITS
    saveVar $PLAYER~FIGHTERS
    saveVar $PLAYER~SHIELDS
    saveVar $PLAYER~TOTAL_HOLDS
    saveVar $PLAYER~ORE_HOLDS
    saveVar $PLAYER~ORGANIC_HOLDS
    saveVar $PLAYER~EQUIPMENT_HOLDS
    saveVar $PLAYER~COLONIST_HOLDS
    saveVar $PLAYER~PHOTONS
    saveVar $PLAYER~ARMIDS
    saveVar $PLAYER~LIMPETS
    saveVar $PLAYER~GENESIS
    saveVar $PLAYER~TWARP_TYPE
    saveVar $PLAYER~CLOAKS
    saveVar $PLAYER~BEACONS
    saveVar $PLAYER~ATOMIC
    saveVar $PLAYER~CORBO
    saveVar $PLAYER~EPROBES
    saveVar $PLAYER~MINE_DISRUPTORS
    saveVar $PLAYER~PSYCHIC_PROBE
    saveVar $PLAYER~PLANET_SCANNER
    saveVar $PLAYER~SCAN_TYPE
    saveVar $PLAYER~ALIGNMENT
    saveVar $PLAYER~EXPERIENCE
    saveVar $PLAYER~SHIP_NUMBER
    saveVar $PLAYER~TRADER_NAME

return
# includes:
include "source\bot_includes\player"
