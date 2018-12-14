:displayAdjacentGridAnsi
    setVar $i 1
    if (CURRENTSECTOR = 0)
        gosub :player~quikstats
    end
    isNumber $test CURRENTSECTOR
    if ($test)
        while (SECTOR.WARPS[CURRENTSECTOR][$i] > 0)
            setVar $ADJ_SEC SECTOR.WARPS[CURRENTSECTOR][$i]
            setvar $isaliens false
            setVar $adjSectorOwner SECTOR.FIGS.OWNER[$ADJ_SEC]
            getSectorParameter $adj_sec "FIGSEC" $isFigged
            if ($isFigged <> true)
                setvar $isFigged false
            end
            setVar $containsShieldedPlanet FALSE
            setVar $shieldedPlanets 0
            if ($ADJ_SEC >= 10000)
                setVar $adjust ""
            elseif $ADJ_SEC >= 1000
                setVar $adjust " "
            elseif $ADJ_SEC >= 100
                setVar $adjust "  "
            elseif $ADJ_SEC >= 10
                setVar $adjust "   "
            else
                setVar $adjust "    "
            end

           
            gosub :format_sector_owner
            echo ANSI_13 "* (" ANSI_10 $i ANSI_13 ")" ANSI_15 " - " ANSI_13 "<" $color $ADJ_SEC ANSI_13 ">" $adjust ANSI_5 
            echo " " ansi_15 "["

           
            echo $color $temp

            echo ansi_15 "]"


            echo "   Warps" ANSI_14 ": " ANSI_14  SECTOR.WARPCOUNT[$ADJ_SEC] "   "
            getSectorParameter $ADJ_SEC "FIGSEC" $isFigged
            getSectorParameter $ADJ_SEC "MSLSEC" $isMSL
            getSectorParameter $ADJ_SEC "BUBBLE" $isBubble
            if ($isFigged = "")
                setVar $isFigged FALSE
            end
            if ($isMSL = "")
                setVar $isMSL FALSE
            end
            isNumber $isNumber SECTOR.ANOMALY[$ADJ_SEC]
            if ($isNumber)
                if (SECTOR.ANOMALY[$ADJ_SEC])
                    echo ANSI_15 " Anom: " ANSI_11 "Yes" ANSI_15
                else
                    echo ANSI_15 " Anom: " ANSI_7 " No" ANSI_15
                end
            else
                echo ANSI_15 " Anom: " ANSI_7 " ???" ANSI_15
            end
            echo ANSI_15 "  Dens: " ANSI_14 
            if (SECTOR.DENSITY[$ADJ_SEC] = "-1")
                echo "???        "
            else
                setVar $dens SECTOR.DENSITY[$ADJ_SEC]
                getLength SECTOR.DENSITY[$ADJ_SEC] $densLength
                if ($densLength >= 9)
                    echo "HIGH      "
                else
                    setVar $d $densLength
                    while ($d <= 10)
                        setVar $dens $dens&" "
                        add $d 1
                    end
                    echo $dens
                end
                
            end
            if ($isMSL = TRUE)
                echo ANSI_15 " [" ANSI_14 "MSL" ANSI_15 "]" ANSI_7 
            end
            if ($isBubble = true)
                echo ANSI_15 " [" ANSI_10 "BUBBLE" ANSI_15 "]" ANSI_7 
            end
            setVar $output ""
            if (PORT.EXISTS[$adj_sec])
                setVar $class PORT.CLASS[$adj_sec]
                setVar $output $output&ANSI_5&"           Port"&ANSI_14&"    : "&ANSI_11&PORT.NAME[$adj_sec]&ANSI_14&", "&ANSI_5&"Class "&ANSI_11&$class&" "
                if (($class <> "0") AND ($class <> "9"))
                    setVar $output $output&ANSI_5&"("
                    if (PORT.BUYFUEL[$adj_sec])
                        setVar $output $output&ANSI_2&"B"
                    else
                        setVar $output $output&ANSI_11&"S"
                    end
                    if (PORT.BUYORG[$adj_sec])
                        setVar $output $output&ANSI_2&"B"
                    else
                        setVar $output $output&ANSI_11&"S"
                    end
                    if (PORT.BUYEQUIP[$adj_sec])
                        setVar $output $output&ANSI_2&"B"
                    else
                        setVar $output $output&ANSI_11&"S"
                    end
                    setVar $output $output&ANSI_5&")"
                end
                setVar $output $output&""
                echo "*    "&$output&""
            end
            if (SECTOR.FIGS.QUANTITY[$adj_sec] > 0)
                setvar $fig_count SECTOR.FIGS.QUANTITY[$adj_sec]

                if ((SECTOR.FIGS.OWNER[$adj_sec] = "belong to your Corp") or (SECTOR.FIGS.OWNER[$adj_sec] = "yours"))
                    setvar $fig_owner ansi_11&"("&ansi_3&SECTOR.FIGS.OWNER[$adj_sec]&ansi_11&") "&ansi_6&"["&SECTOR.FIGS.TYPE[$adj_sec]&"]"
                    setvar $fighter_color ansi_14
                elseif ($isaliens = true)
                    setvar $fig_owner ansi_10&"("&ansi_2&SECTOR.FIGS.OWNER[$adj_sec]&ansi_10&") "&ansi_6&"["&SECTOR.FIGS.TYPE[$adj_sec]&"]"
                    setvar $fighter_color ansi_10
                else
                    setvar $fig_owner ansi_12&"("&ansi_4&SECTOR.FIGS.OWNER[$adj_sec]&ansi_12&") "&ansi_6&"["&SECTOR.FIGS.TYPE[$adj_sec]&"]"
                    setvar $fighter_color ansi_12
                end
                setvar $value $fig_count
                gosub :commas
                setvar $fig_count $value
                echo ANSI_5&"*               Fighters"&ANSI_14&": "&$fighter_color&$fig_count&ANSI_5&" "&$fig_owner

            end
            setVar $p 1
            setVar $output "*"
            while ($p <= SECTOR.PLANETCOUNT[$adj_sec])
                setVar $isShielded FALSE
                setVar $temp SECTOR.PLANETS[$adj_sec][$p]
                getWord $temp $test 1
                if ($test = "<<<<")
                    setVar $isShielded TRUE
                end
                getWord $temp $type 2
                stripText $type "("
                stripText $type ")"
                if ($isShielded)
                    getLength $temp $length
                    cutText $temp $temp 1 ($length-15)
                    cutText $temp $temp 10 9999
                    setVar $temp ANSI_12&"<<<< "&ANSI_10&"("&ANSI_14&$type&ANSI_10&") "&ANSI_1&$temp&ANSI_12&" >>>> "&ANSI_2&"(Shielded)"
                else
                    setVar $temp ANSI_2&$temp
                end
                if ($p = 1)
                    setVar $temp ANSI_5&"               Planets "&ANSI_14&": "&$temp
                    setVar $output $output&$temp&""
                else
                    setVar $output $output&"                         "&$temp&""
                end
                if ($p < SECTOR.PLANETCOUNT[$adj_sec])
                    setVar $output $output&"*"
                end
                add $p 1
            end
            if (SECTOR.PLANETCOUNT[$adj_sec] > 0)
                echo ""&$output&""
            end
            setVar $p 1
            if (SECTOR.TRADERCOUNT[$adj_sec] > 0)
                echo ANSI_6 "*               Traders" ansi_15 " : "&ANSI_7
            end
            while ($p <= SECTOR.TRADERCOUNT[$adj_sec])
                echo "*                         "&ANSI_11&SECTOR.TRADERS[$adj_sec][$p]
                add $p 1
            end
            setVar $p 1
            if (SECTOR.SHIPCOUNT[$adj_sec] > 0)
                echo ANSI_5 "*               Ships   " ansi_15 ": "&ANSI_11&"("&SECTOR.SHIPCOUNT[$adj_sec]&") Empty Ships"
            end
            add $i 1
        end
        setVar $gridWarpCount ($i-1)
    else
        echo ANSI_15 " ERROR WITH CURRENTSECTOR  " ANSI_7
    end

    echo "**" CURRENTANSILINE
return


:displayNavigation
    setVar $i 1
    setvar $map ""
    setarray $sectors_array 6
    setvar $sectors_array[1] ""
    setvar $sectors_array[2] ""
    setvar $sectors_array[3] ""
    setvar $sectors_array[4] ""
    setvar $sectors_array[5] ""
    setvar $sectors_array[6] ""
    setvar $count 0
    isNumber $test CURRENTSECTOR
    if ($test)
        while (SECTOR.WARPS[CURRENTSECTOR][$i] > 0)
            setvar $map ""
            setVar $ADJ_SEC SECTOR.WARPS[CURRENTSECTOR][$i]
            setVar $containsShieldedPlanet FALSE
            setVar $shieldedPlanets 0
            if ($ADJ_SEC >= 10000)
                setVar $adjust ""
            elseif $ADJ_SEC >= 1000
                setVar $adjust " "
            elseif $ADJ_SEC >= 100
                setVar $adjust "  "
            elseif $ADJ_SEC >= 10
                setVar $adjust "   "
            else
                setVar $adjust "    "
            end
            setVar $map $map&ANSI_13&"* ("&ANSI_10&$i&ANSI_13&")"&ANSI_15&" - "&ANSI_13&"<"&ANSI_14&SECTOR.WARPS[CURRENTSECTOR][$i]&ANSI_13&">"&$adjust&ANSI_15&" Warps: "&ANSI_7&SECTOR.WARPCOUNT[$ADJ_SEC] 
            getSectorParameter $ADJ_SEC "FIGSEC" $isFigged
            getSectorParameter $ADJ_SEC "MSLSEC" $isMSL
            if ($isFigged = "")
                setVar $isFigged FALSE
            end
            if ($isMSL = "")
                setVar $isMSL FALSE
            end
            setVar $adjSectorOwner SECTOR.FIGS.OWNER[$ADJ_SEC]
            if (($isFigged) OR (($adjSectorOwner = "belong to your Corp") OR ($adjSectorOwner = "yours")) AND (SECTOR.FIGS.QUANTITY[$ADJ_SEC] > 0))
                setvar $map $map&ANSI_15&" Owner: "&ANSI_14&"   OURS   "
            else
                getWord $adjSectorOwner $alienCheck 1
                if (($ADJ_SEC < 11) OR ($ADJ_SEC = $stardock))
                    setvar $map $map&ANSI_15&" Owner: "&ANSI_9&" FEDSPACE " 
                elseif ($ADJ_SEC = $rylos)
                    setvar $map $map&ANSI_15&" Owner: "&ANSI_9&"  RYLOS   " 
                elseif ($ADJ_SEC = $alpha_centauri)
                    setvar $map $map&ANSI_15&" Owner: "&ANSI_9&"  ALPHA   " 
                elseif ($adjSectorOwner = "Rogue Mercenaries")
                    setvar $map $map&ANSI_15&" Owner: "&ANSI_7&"  ROGUE   " 
                elseif ($alienCheck = "the")
                    setvar $map $map&ANSI_15&" Owner: "&ANSI_2&"  ALIENS  " 
                elseif ($alienCheck = "The")
                    setvar $map $map&ANSI_15&" Owner: "&ANSI_2&"  ALIENS  " 
                elseif (($adjSectorOwner <> "") AND ($adjSectorOwner <> "Unknown"))
                    setVar $heads TRUE
                    getWord $adjSectorOwner $temp 3
                    stripText $temp ","
                    upperCase $temp
                    getLength $temp $tempLength
                    if ($tempLength >= 10)
                        cutText $temp $temp 1 10
                    else
                        while ((10 - $tempLength) > 0)
                            if ($heads)
                                setVar $temp $temp&" "
                                setVar $heads FALSE
                            else
                                setVar $temp " "&$temp
                                setVar $heads TRUE
                            end
                            getLength $temp $tempLength
                        end
                    end
                    setvar $map $map&ANSI_15&" Owner: "&ANSI_12&$temp
                else
                    setvar $map $map&ANSI_15&" Owner: "&ANSI_13&"   NONE   "
                end
            end
            isNumber $isNumber SECTOR.ANOMALY[$ADJ_SEC]
            if ($isNumber)
                if (SECTOR.ANOMALY[$ADJ_SEC])
                    setvar $map $map&ANSI_15&" Anom: "&ANSI_11&"Yes"&ANSI_15
                else
                    setvar $map $map&ANSI_15&" Anom: "&ANSI_7&" No"&ANSI_15
                end
            else
                setvar $map $map&ANSI_15&" Anom: "&ANSI_7&" ???"&ANSI_15
            end
            setvar $map $map&ANSI_15&"  Dens: "&ANSI_14 
            if (SECTOR.DENSITY[$ADJ_SEC] = "-1")
                setvar $map $map&"???        "
            else
                setVar $dens SECTOR.DENSITY[$ADJ_SEC]
                getLength SECTOR.DENSITY[$ADJ_SEC] $densLength
                if ($densLength >= 9)
                    setvar $map $map&"HIGH      "
                else
                    setVar $d $densLength
                    while ($d <= 10)
                        setVar $dens $dens&" "
                        add $d 1
                    end
                    setvar $map $map&$dens
                end
                
            end
            if ($isMSL = TRUE)
                setvar $map $map&ANSI_15&"["&ANSI_14&"MSL"&ANSI_15&"]"&ANSI_7 
            end
            setVar $output ""
            if (PORT.EXISTS[$adj_sec])
                setVar $class PORT.CLASS[$adj_sec]
                setVar $output $output&ANSI_5&"    Port   "&ANSI_14&": "&ANSI_11&PORT.NAME[$adj_sec]&ANSI_14&", "&ANSI_5&"Class "&ANSI_11&$class&" "
                if (($class <> "0") AND ($class <> "9"))
                    setVar $output $output&ANSI_5&"("
                    if (PORT.BUYFUEL[$adj_sec])
                        setVar $output $output&ANSI_2&"B"
                    else
                        setVar $output $output&ANSI_11&"S"
                    end
                    if (PORT.BUYORG[$adj_sec])
                        setVar $output $output&ANSI_2&"B"
                    else
                        setVar $output $output&ANSI_11&"S"
                    end
                    if (PORT.BUYEQUIP[$adj_sec])
                        setVar $output $output&ANSI_2&"B"
                    else
                        setVar $output $output&ANSI_11&"S"
                    end
                    setVar $output $output&ANSI_5&")"
                end
                setVar $output $output&""
                setvar $map $map&"*    "&$output&""
            end
            if (SECTOR.FIGS.QUANTITY[$adj_sec] > 0)
                setvar $map $map&ANSI_5&"*    Fighters   : "&ANSI_11&SECTOR.FIGS.QUANTITY[$adj_sec]&ANSI_5&" ("&SECTOR.FIGS.OWNER[$adj_sec]&") "&ANSI_6&"["&SECTOR.FIGS.TYPE[$adj_sec]&"]"
            end
            setVar $p 1
            setVar $output "*"
            while ($p <= SECTOR.PLANETCOUNT[$adj_sec])
                setVar $isShielded FALSE
                setVar $temp SECTOR.PLANETS[$adj_sec][$p]
                getWord $temp $test 1
                if ($test = "<<<<")
                    setVar $isShielded TRUE
                end
                getWord $temp $type 2
                stripText $type "("
                stripText $type ")"
                if ($isShielded)
                    getLength $temp $length
                    cutText $temp $temp 1 ($length-15)
                    cutText $temp $temp 10 9999
                    setVar $temp ANSI_12&"<<<< "&ANSI_10&"("&ANSI_14&$type&ANSI_10&") "&ANSI_1&$temp&ANSI_12&" >>>> "&ANSI_2&"(Shielded)"
                else
                    setVar $temp ANSI_2&$temp
                end
                if ($p = 1)
                    setVar $temp ANSI_5&"     Planets "&ANSI_14&"  : "&$temp
                    setVar $output $output&$temp&""
                else
                    setVar $output $output&"                 "&$temp&""
                end
                if ($p < SECTOR.PLANETCOUNT[$adj_sec])
                    setVar $output $output&"*"
                end
                add $p 1
            end
            if (SECTOR.PLANETCOUNT[$adj_sec] > 0)
                setvar $map $map&""&$output&""
            end
            setVar $p 1
            if (SECTOR.TRADERCOUNT[$adj_sec] > 0)
                setvar $map $map&ANSI_6&"*        Traders: "&ANSI_7
            end
            while ($p <= SECTOR.TRADERCOUNT[$adj_sec])
                setvar $map $map&"*             "&ANSI_11&SECTOR.TRADERS[$adj_sec][$p]
                add $p 1
            end
            setVar $p 1
            if (SECTOR.SHIPCOUNT[$adj_sec] > 0)
                setvar $map $map&ANSI_6&"*       Ships   : "&ANSI_11&"("&SECTOR.SHIPCOUNT[$adj_sec]&") Empty Ships"
            end
            setVar $sectors_array[$i] $map
            add $count 1
            add $i 1
        end
        setVar $gridWarpCount ($i-1)
    else
        setvar $map $map&ANSI_15&" ERROR WITH CURRENTSECTOR  "&ANSI_7
    end
    setvar $map $sectors_array[1]&"  "&$sectors_array[2]&"  "&$sectors_array[3]&"***"
    setvar $displaySector currentsector
    gosub :displaySector
    setvar $map $map&$output&"*"
    setvar $map $map&$sectors_array[4]&"  "&$sectors_array[5]&"  "&$sectors_array[6]&"*"
return


:displaySector
    setVar $i $displaySector
    setVar $output ANSI_10&"    Sector  "&ANSI_14&": "&ANSI_11&$i&ANSI_2&" in "
    setVar $constellation SECTOR.CONSTELLATION[$i]
    if ($constellation = "The Federation.")
        setVar $output $output&ANSI_10&$constellation&"*"
    else
        setVar $output $output&ANSI_1&$constellation&"*"
    end
    if (SECTOR.BEACON[$i] <> "")
        setVar $output $output&ANSI_5&"    Beacon  "&ANSI_14&": "&ANSI_12&SECTOR.BEACON[$i]&"*"
    end
    if (PORT.EXISTS[$i])
        setVar $class PORT.CLASS[$i]
        setVar $output $output&ANSI_5&"    Ports   "&ANSI_14&": "&ANSI_11&PORT.NAME[$i]&ANSI_14&", "&ANSI_5&"Class "&ANSI_11&$class&" "
        if (($class <> "0") AND ($class <> "9"))
            setVar $output $output&ANSI_5&"("
            if (PORT.BUYFUEL[$i])
                setVar $output $output&ANSI_2&"B"
            else
                setVar $output $output&ANSI_11&"S"
            end
            if (PORT.BUYORG[$i])
                setVar $output $output&ANSI_2&"B"
            else
                setVar $output $output&ANSI_11&"S"
            end
            if (PORT.BUYEQUIP[$i])
                setVar $output $output&ANSI_2&"B"
            else
                setVar $output $output&ANSI_11&"S"
            end
            setVar $output $output&ANSI_5&")"
        end
        setVar $output $output&"*"
    end
    setVar $j 1
    while ($j <= SECTOR.PLANETCOUNT[$i])
        setVar $isShielded FALSE
        setVar $temp SECTOR.PLANETS[$i][$j]
        getWord $temp $test 1
        if ($test = "<<<<")
            setVar $isShielded TRUE
        end
        getWord $temp $type 2
        stripText $type "("
        stripText $type ")"
        if ($isShielded)
            getLength $temp $length
            cutText $temp $temp 1 ($length-15)
            cutText $temp $temp 10 9999
            setVar $temp ANSI_12&"<<<< "&ANSI_10&"("&ANSI_14&$type&ANSI_10&") "&ANSI_1&$temp&ANSI_12&" >>>> "&ANSI_2&"(Shielded)"
        else
            setVar $temp ANSI_2&$temp
        end
        if ($j = 1)
            setVar $temp ANSI_5&"    Planets "&ANSI_14&": "&$temp
            setVar $output $output&$temp&"*"
        else
            setVar $output $output&"              "&$temp&"*"
        end
        add $j 1
    end
    setVar $j 1
    while ($j <= SECTOR.TRADERCOUNT[$i])
        setVar $isShielded FALSE
        setVar $temp SECTOR.TRADERS[$i][$j]
        setVar $temp ANSI_2&$temp
        if ($j = 1)
            setVar $temp ANSI_5&"    Traders "&ANSI_14&": "&$temp
            setVar $output $output&$temp&"*"
        else
            setVar $output $output&"              "&$temp&"*"
        end
        add $j 1
    end
    if (SECTOR.FIGS.QUANTITY[$i] > 0)
        setVar $output $output&ANSI_5&"    Fighters"&ANSI_14&": "&ANSI_11&SECTOR.FIGS.QUANTITY[$i]&ANSI_5&" ("&SECTOR.FIGS.OWNER[$i]&") "&ANSI_6&"["&SECTOR.FIGS.TYPE[$i]&"]*"
    end
    setVar $output $output&ANSI_10&"    Warps to sector(s) "&ANSI_14&":  "
    setVar $k 1
    while (SECTOR.WARPS[$i][$k] > 0)
        if ($k <> 1)
            setVar $output $output&ANSI_2&" - "
        end
        getSectorParameter SECTOR.WARPS[$i][$k] "FIGSEC" $check
        if ($check = true)
            setVar $output $output&ANSI_11&"["&SECTOR.WARPS[$i][$k]&"]"
        else
            setVar $output $output&ANSI_11&SECTOR.WARPS[$i][$k]
        end
        add $k 1
    end
    setVar $k 1
    while (SECTOR.BACKDOORS[$i][$k] > 0)
        if ($k <> 1)
            setVar $output $output&ANSI_2&" - "
        else
            setVar $output $output&ANSI_12&"*    Backdoor from sector(s) "&ANSI_14&":  "
        end
        setVar $output $output&ANSI_11&SECTOR.BACKDOORS[$i][$k]
        add $k 1
    end
    setVar $output $output&"**"
return

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

:commas
        if ($value < 1000)
                #do nothing
        elseif ($value < 1000000)
        getLength $value $len
                setVar $len ($len - 3)
                cutText $value $tmp 1 $len
                cutText $value $tmp1 ($len + 1) 999
                setVar $tmp $tmp & "," & $tmp1
                setVar $value $tmp
        elseif ($value <= 999999999)
                getLength $value $len
                setVar $len ($len - 6)
                cutText $value $tmp 1 $len
                setVar $tmp $tmp & ","
                cutText $value $tmp1 ($len + 1) 3
                setVar $tmp $tmp & $tmp1 & ","
                cutText $value $tmp1 ($len + 4) 999
                setVar $tmp $tmp & $tmp1
                setVar $value $tmp
        end
        return

:format_sector_owner
            setvar $most_recent_data false
            setvar $datetime date&" "&time
            if ($datetime = SECTOR.UPDATED[$adj_sec])
                setvar $most_recent_data true
            end
            if ($most_recent_data = true)
                if ((($adjSectorOwner = "belong to your Corp") OR ($adjSectorOwner = "yours")) AND (SECTOR.FIGS.QUANTITY[$ADJ_SEC] > 0))
                    setSectorParameter $adj_sec "FIGSEC" TRUE
                    setvar $isFigged true
                else
                    setSectorParameter $adj_sec "FIGSEC" FALSE
                    setvar $isFigged false
                end
            end
            if (($isFigged = true) OR (($adjSectorOwner = "belong to your Corp") OR ($adjSectorOwner = "yours")) AND (SECTOR.FIGS.QUANTITY[$ADJ_SEC] > 0))
                setvar $text "OURS"
                setvar $color ansi_14
            else
                getWord $adjSectorOwner $alienCheck 1
                if (($ADJ_SEC < 11) OR ($ADJ_SEC = $stardock))
                    setvar $color ansi_9
                    setvar $text "FEDSPACE" 
                elseif ($ADJ_SEC = $rylos)
                    setvar $color ansi_9
                    setvar $text "RYLOS" 
                elseif ($ADJ_SEC = $alpha_centauri)
                    setvar $color ansi_9
                    setvar $text "ALPHA" 
                elseif ($adjSectorOwner = "Rogue Mercenaries")
                    setvar $color ansi_7
                    setvar $text "ROGUE" 
                elseif ($alienCheck = "the")
                    setvar $color ansi_2
                    setvar $text "ALIEN" 
                    setvar $isaliens true
                elseif ($alienCheck = "The")
                    setvar $color ansi_2
                    setvar $text "ALIEN" 
                    setvar $isaliens true
                elseif (($adjSectorOwner <> "") AND ($adjSectorOwner <> "Unknown"))
                    setVar $heads TRUE
                    getWord $adjSectorOwner $temp 3
                    stripText $temp ","
                    upperCase $temp
                    setvar $text $temp
                    setvar $color ansi_12
                else
                    setvar $text "NONE"
                    setvar $color ansi_13
                end
            end
            setvar $temp $text
            getLength $temp $tempLength
            setvar $length 10
            if ($tempLength >= $length)
                cutText $temp $temp 1 $length
            else
                while (($length - $tempLength) > 0)
                    if ($heads)
                        setVar $temp $temp&" "
                        setVar $heads FALSE
                    else
                        setVar $temp " "&$temp
                        setVar $heads TRUE
                    end
                    getLength $temp $tempLength
                end
            end
return