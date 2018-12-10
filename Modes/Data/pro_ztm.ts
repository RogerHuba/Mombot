#Original Author - Prom
#Modified for BOT use - TBH
reqRecording

# Set Vars
setVar $game GAMENAME
setVar $totSectors SECTORS
setArray $chkedSectors SECTORS
loadVar $startSectorPass1
loadVar $endSectorPass1
loadVar $startSectorPass2
loadVar $endSectorPass2
loadVar $deadEndDone
setVar $deadEndList "n"
setVar $7Warps "n"
setVar $6Warps "n"
setVar $backdoor "n"
setVar $cim "y"

if ($startSectorPass1 = 0)
   setVar $startSectorPass1 1
   setVar $endSectorPass1 SECTORS
end

if ($startSectorPass2 = 0)
   setVar $startSectorPass2 1
   setVar $endSectorPass2 SECTORS
end

:beginWindow
getTime $stTime "'Start time:  ' h:nn:ss"
setVar $Window 1
Window ZTM 450 325 "M()M ZTM - " & $stTime  ONTOP

setWindowContents ZTM $Window
setDelayTrigger st :sttime 3000
pause

:sttime
 if ($cim = "y")
    setvar $WindowMessage "  Game:           "& $game & "*  Sectors:        " & $totSectors  & "*  Updating CIM" & "*"
    setWindowContents ZTM $WindowMessage
    send "^i"
 else
    send "^"
 end
waitfor ":"
# update window
 setvar $WindowMessagePass0 "*  Game:    "& $game & "*  Sectors: " & $totSectors  & "*"
 setVar $windowMessagepass1 "*  Pass 1:  Mapping @ 0%*"
 setVar $windowMessagePass2 "*  Pass 2: *"
 setVar $windowMessagePass3 "*  Pass 3: *"
 setVar $windowMessagePass4 "*"
 setVar $windowMessagePass5 "*"
 gosub :ztmWindowUpdate

:firstPass
while ($startSectorPass1 <= $totSectors) and ($endSectorPass1 > 0)
    :validstartSector
      if (SECTOR.WARPCOUNT[$startSectorPass1] > 0)
         add $startSectorPass1 1
         if ($startSectorPass1 > $totSectors)
            gosub :verify
            goto :warpMinCheck
         else
            goto :validstartSector
         end
      end
    :validendSector
      if (SECTOR.WARPINCOUNT[$endSectorPass1] > 0)
         subtract $endSectorPass1 1
         if ($endSectorPass1 < 1)
            gosub :verify
            goto :warpMinCheck
         else
           goto :validendSector
         end
      end
      if ($startSectorPass1 = $endSectorPass1)
         subtract $endSectorPass1 1
         if ($endSectorPass1 < 1)
            gosub :verify
            goto :warpMinCheck
         end
      end
      send "f" $startSectorPass1 "*" $endSectorPass1 "*y"
      waitfor "FM > " & $startSectorPass1
      if (SECTOR.WARPINCOUNT[$startSectorPass1] = 0) or (SECTOR.WARPCOUNT[$endSectorPass1] = 0)
         send "f" $endSectorPass1 "*" $startSectorPass1 "*y"
      end
      saveVar $startSectorPass1
      saveVar $endSectorPass1
      add $startSectorPass1 1
      subtract $endSectorPass1 1

      setVar $tot_sectors $startSectorPass1
      multiply $tot_sectors 100
      divide $tot_Sectors $totSectors
      multiply $tot_sectors 2
      if ($ckUpdate <> $tot_sectors)
             setVar $windowMessagePass1 "*  Pass 1:  Mapping @ " & $tot_Sectors & "%*"
             gosub :ztmWindowUpdate
      end
      setVar $ckUpdate $tot_Sectors

end
gosub :verify
goto :checkDeadEnds

:verify
  gosub :totalWarps
  gettime $passEndTime "hh:nn:ss"
  setVar $windowMessagePass1 "*  Pass 1:  Complete @ " & $passEndTime & " Warps  " & $totalWarps
  setVar $i 2
  setVar $verifyIn 0
  setVar $verifyOut 0
  while ($i <= $totSectors)
     if (sector.warpincount[$i] = 0)
         send "f1*" $i "*y"
         add $verifyIn 1
     end
     if (sector.warpCount[$i] = 0)
        send "f" $i "*1*y"
        add $verifyOut 1
     end
     add $i 1
  end
  add $verifyIn  $verifyOut
  setVar $windowMessagePass1 $windowMessagePass1 & "*  Verified Sectors - " & $verifyIn & "*"
  return

:warpMinCheck
  if ($deadEndDone <> 0)
      goto :DeDone
  end
  setVar $windowMessagePass2 "*  Pass 2:  Warp Min Check*"
  gosub :ztmWindowUpdate

  setVar $iwarps 1
#  while ($iwarps <= 3)
  while ($iwarps <= 4)
    setVar $i 1
       while ($i <= $totSectors)
          getSector $i $i
           if (SECTOR.WARPCOUNT[$i] = $iWarps)
             add $ideadCnt 1
             setvar $isDeadEnd[$ideadCnt] $i
             if ($ideadCnt > 2)
                 setVar $dEndCnt ($ideadCnt - 1)
                 send "f" $isDeadEnd[$ideadCnt] "*" $isDeadEnd[$dEndCnt] "*y"
                 waitfor "FM > " & $isDeadEnd[$ideadCnt]
                 send "f" $isDeadEnd[$dEndCnt] "*" $isDeadEnd[$ideadCnt] "*y"
                 waitfor "FM > " & $isDeadEnd[$dEndCnt]
             end
          end
          add $i 1
       end
    add $iWarps 1
    end
#    send "q"
  :deDone
  setVar $deadEndDone 1
  gettime $4PassEndTime "hh:nn:ss"
  gosub :totalWarps
  setVar $windowMessagePass2 "*  Pass 2:  Warp Min Check Complete @" & $4PassEndTime & "Warps " & $totalWarps & "*"
  gosub :ztmWindowUpdate


:finalDeadEnd
    setVar $i 11
    setVar $windowMessagePass3 "*  Pass 3:  Dead end check running*"
       while ($i <= $totSectors)
          getSector $i $i
          if (SECTOR.WARPS[$i][2] < 2)
             add $ideadCnt 1
             setvar $isDeadEnd[$ideadCnt] $i
             if ($ideadCnt > 2)
                 setVar $dEndCnt ($ideadCnt - 1)
                 send "f" $isDeadEnd[$ideadCnt] "*" $isDeadEnd[$dEndCnt] "*y"
                 waitfor "FM > " & $isDeadEnd[$ideadCnt]
             end
          end
          add $i 1
       end
    send "q"
  gettime $3passEndTime "hh:nn:ss"
  gosub :totalWarps
  setVar $windowMessagePass3 "*  Pass 3:  Completed @ " & $3passEndTime  & "  Warps " & $totalWarps & "*"
  gosub :ztmWindowUpdate
  gettime $ztmFinished "hh:nn:ss"
  setvar $windowmesagePass5  $windowMessagePass5 & "**   ZTM Finished @ " & $ztmFinished & "*"
  HALT

:totalWarps
setVar $totalWarps 0
setVar $ttlwrps 0
while ($ttlwrps < SECTORS)
    add $ttlwrps 1
    add $totalWarps SECTOR.WARPCOUNT[$ttlwrps]
end
return


:ztmWindowUpdate
  setVar $window $windowMessagePass0 & $windowMessagePass1 & $windowMessagePass2
  setVar $window $window & $windowMessagePass3 & $windowMessagePass4 & $windowMessagePass5
  setWindowContents ZTM $window
return
