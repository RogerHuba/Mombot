:voidadjacent
    getSector $CURRENT_SECTOR $sectorInfo
    if ($sectorInfo.warp[1] = 0)
        send "'This sector has no warps, maybe you need to scan it first*"
        halt
    else
        setVar $voidsect 0
        :voids
        add $voidsect 1
        if ($voidsect < 7)
            if ($sectorInfo.warp[$voidsect] <> 0)
                send "CV" & $sectorInfo.warp[$voidsect] & "*Q"
            end
            goto :voids
        end

        send "'{" $bot_name "} - Avoids set on adjacent sectors!*"
        send "/"
        waitfor " Sect "    
    end
return

:clearadjacent
    getSector $CURRENT_SECTOR $sectorInfo
    if ($sectorInfo.warp[1] = 0)
        send "'{" $bot_name "} -This sector has no warps, try to scan it first!*"
        halt
    else
        setVar $voidsect 0
        :clearvoids
        add $voidsect 1
        if ($voidsect < 7)
            if ($sectorInfo.warp[$voidsect] <> 0)
                send "CV0*YN" & $sectorInfo.warp[$voidsect] & "*Q"
            end
            goto :clearvoids
        end

        send "'{" $bot_name "} - Avoids cleared on adjacent sectors!*"
        send "/"
        waitfor " Sect "
    end
return