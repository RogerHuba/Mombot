# Copyright (C) 2005  Remco Mulder
# 
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
# 
# For source notes please refer to Notes.txt
# For license terms please refer to GPL.txt.
# 
# These files should be stored in the root of the compression you 
# received this source in.

# SUB:       Move
# Purpose:   Navigates the game using several scanning methods, searching for something
# Passed:    $checkSub - Label of check subroutine
#            $scanHolo -     0: Doesn't holo scan
#                            1: Holo scans on odd densities (not pattern sectors)
#                            2: Holo scans everywhere
#            $evasion -      0: Avoids everything except pattern sectors
#                            1: Paranoid, doesn't touch anything unusual
#                            2: Avoids NOTHING
#            $attack -       0: Standard, attacks on demand
#                            1: Fast attacks where necessary
#                            2: Fast attacks everywhere
#                            3: Pay tolls
#            $portPriority - 0: No priority on ports
#                            1: Higher priority on ports
#            $dedPriority -  0: No priority on deadends
#                            1: Higher priority on deadends
#            $ExtraSend    - Extra text to be sent to the server on exit of every non-fed sector
# Triggered: On display of sector (right after D)

# CheckSub:
# Passed:    $CurSector - Full details of current sector (from getSector)
# Returned:  $NoScan - "0" for normal
#                      "1" if routine has already density scanned
#                      "2" if routine has already holo-scanned
#            $Found - "1" to halt routine (target sector found)

:Move
  # sys_check
  
  # get current sector
  setTextLineTrigger 1 :GetSector "Sector  : "
  pause
  :GetSector
  getWord CURRENTLINE $curSector 3

  # update the history list
  setVar $history[9] $history[8]
  setVar $history[8] $history[7]
  setVar $history[7] $history[6]
  setVar $history[6] $history[5]
  setVar $history[5] $history[4]
  setVar $history[4] $history[3]
  setVar $history[3] $history[2]
  setVar $history[2] $history[1]
  setVar $history[1] $curSector

  if ($confirmSector = 1)
    # clear any obstructions
    setTextLineTrigger TollFigs :TollFigs "You have to destroy the fighters or pay"
    setTextLineTrigger Figs :Figs "You have to destroy the fighters to remain"
    setTextTrigger Mines :MinePrompt "Mined Sector:"
    setTextTrigger Arrived :Arrived "Command [TL="
    pause
    
    :TollFigs
    setvar $paidToll false
    if ($attack = 3)
      # pay tolls like a nice person
      send "py"
      setvar $paidToll true
    else
      # destroy!
      send "a9999*"
    end
    pause
    
    :Figs
    send "a9999*"
    pause
    
    :MinePrompt
    send "*"
    pause
    
    :Arrived
    killTrigger TollFigs
    killTrigger Figs
    killTrigger Mines
  else
    waitOn "Command [TL="
  end

  getSector $curSector $curSector
  setVar $confirmSector 0
  setVar $Found 0
  setVar $NoScan 0

  gosub $checkSub
  
  if ($Found = 1)
    return
  end

  # do a holo scan if required
  if ($scanHolo = 2) and ($NoScan < 2)
    setVar $scannedHolo 1
    send "shsd"
    waitOn "Relative Density Scan"
    waitOn "Command [TL="
  elseif ($NoScan = 0)
    # do a density scan
    setVar $scannedHolo 0
    send "sd"
    waitOn "Relative Density Scan"
    waitOn "Command [TL="
  end

  getSector $curSector $curSector

  :Assess
  # assess warps - highest score = least desired warp
  setVar $i 1
  setVar $bestScore 1000
  setVar $bestWarp 0
  setVar $bestAttack 0
  setVar $willHolo 0

  :TestWarp
  if ($curSector.warp[$i] > 0)
    setVar $score 0
    setVar $safe 1
    
    getSector $curSector.warp[$i] $thisSector
  
    if ($evasion <> 2)
      if ($scannedHolo = 0)
        # density scan evasion code
        
        if ($thisSector.density <> 0) and ($thisSector.density <> 100)
          if ($thisSector.density = 5) or ($thisSector.density = 105)
            setVar $safe 2
          else
            setVar $safe 0
          end
        end
      end
      if ($scannedHolo = 1)
        # holo scan evasion code
       
        if ($thisSector.anomoly = YES)
          # don't touch limpets
          setVar $safe 0
        end
        if ($thisSector.figs.owner <> "belong to your Corp") and ($thisSector.figs.owner <> "yours") and ($thisSector.figs.quantity > 0)
          if ($evasion = 1)
            setVar $safe 0
          else
            # avoid large groups of figs

            setVar $safe 2
            
            if ($thisSector.figs.quantity > 20)
              setVar $safe 0
            end
          end
        end
        if ($thisSector.density > 0)
          setVar $density $thisSector.density
          
          if ($thisSector.figs.quantity > 0)
            setVar $x $thisSector.figs.quantity
            multiply $x 5
            subtract $density $x
          end

          if (($density <> 100) or ($thisSector.port.exists = 0)) and ($density > 0)
            setVar $safe 0
          end
        end
        
      end
    end

    if ($safe = 2) and ($evasion = 1)
      add $score 500
    end

    if ($safe = 0)
      add $score 500
      setVar $willHolo 1
    end

    # avoid recently visited sectors
    setVar $x 1
    :CheckHistory
    if ($x <= 10)
      if ($history[$x] = $curSector.warp[$i])
        setVar $m 10
        subtract $m $x
        multiply $m 10
        add $score $m
      end
      add $x 1
      goto :CheckHistory
    end

    if ($portPriority = 1)
      # higher priority for ports
      if (($scannedHolo = 1) and ($thisSector.port.exists = 1)) or (($scannedHolo = 0) and ($thisSector.density = 100))
        subtract $score 3
      end
    end
    
    if ($dedPriority = 1)
      # higher priority for dead ends
      if ($thisSector.warps = 1)
        subtract $score 3
      end
    end

    # add some random
    getRnd $random 1 5
    add $score $random

    if ($score < $bestScore)
      setVar $bestScore $score
      setVar $bestWarp $curSector.warp[$i]
      setVar $bestSafe $safe
    end

    add $i 1
    goto :TestWarp
  end
  
  if ($bestScore > 400)
    # out of options - holo scan if we're allowed
    setVar $willHolo 1
  end

  if ($willHolo = 1) and ($scannedHolo = 0) and ($scanHolo = 1)
    # holo scan then re-assess
    send "sh"
    waitFor "Sector  : "
    waitFor "Command [TL="
    setVar $scannedHolo 1
    goto :Assess
  end
  
  if ($bestScore > 400) and ($evasion = 1)
    clientMessage "No safe options!"
    halt
  end

  # send extra stuff
  if ($paidToll <> true) and ($ExtraSend <> "") and ($CurSector > 10) and (PORT.CLASS[$CurSector] < 9)
    send $ExtraSend
  end

  # set sector suffix
  if (SECTORS > 5000) or ($bestWarp < 600)
    setVar $warpSuffix "*"
  else
    setVar $warpSuffix "."
  end
  
  # move to best sector (attacking if need be)
  if (($bestSafe = 2) and ($attack = 1)) or ($attack = 2)
    send $bestWarp $warpSuffix "*na9999**"
  else
    send $bestWarp $warpSuffix
    setVar $confirmSector 1
  end
  
  goto :Move
