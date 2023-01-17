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

# SUB:       PPT
# Passed:    $SectorA - Sector number of port A
#            $SectorB - Sector number of port B (must be adjacent)
#            $ProdA - Product name to buy at port A - "Fuel" or "Organics" or "Equipment"
#            $ProdB - Product name to buy at port B
#            $DropFigs - "1" = drop figs under ports, "0" = don't drop figs
#            $PercTrade - Percent to trade ports down to ("30" = 30%)
#            $Haggle~HaggleFactor - Haggle factor to use while trading
# Triggered: Sector command prompt
# Returned:  $OneWay - "1" = fell through a one-way and aborted
#            $Sector - current sector (when completed)
#            $Aborted - "1" if ports weren't traded

:PPT
  # sys_check
  gosub :PlayerInfo~InfoQuick
  
  setVar $ore $PlayerInfo~Ore
  setVar $org $PlayerInfo~Org
  setVar $equip $PlayerInfo~Equip
  setVar $holds $PlayerInfo~Holds
  setVar $displayOFF "0"
  setVar $Aborted "0"
  
  if ($Ore > 0)
    setVar $OnHand "Fuel"
  elseif ($Org > 0)
    setVar $OnHand "Organics"
  elseif ($Equip > 0)
    setVar $OnHand "Equipment"
  else
    setVar $OnHand "None"
  end
  
  setVar $OneWay 0
  
  # find out how much is on these ports
  send "cr*r" $SectorB "*q"

  waitFor "Commerce report for"  
  setTextLineTrigger GetSellProductA :GetSellProductA $ProdA
  setTextLineTrigger GetBuyProductA :GetBuyProductA $ProdB
  setTextTrigger GotProductA :GotProductA "Computer command"
  pause
  :GetSellProductA
  setVar $line CURRENTLINE
  stripText $line "Ore"
  getWord $line $SellAmountA 3
  pause
  :GetBuyProductA
  setVar $line CURRENTLINE
  stripText $line "Ore"
  getWord $line $BuyAmountA 3
  pause
  :GotProductA
  
  killtrigger 1
  killtrigger 2
  setTextLineTrigger 1 :fighterdownportb "I have no information about a port in that sector."
  setTextLineTrigger 2 :keepgoingportb   "Commerce report for"  
  pause
  :keepgoingportb
  setTextLineTrigger GetSellProductB :GetSellProductB $ProdB
  setTextLineTrigger GetBuyProductB :GetBuyProductB $ProdA
  setTextTrigger GotProductB :GotProductB "Computer command"
  pause
  :GetSellProductB
  setVar $line CURRENTLINE
  stripText $line "Ore"
  getWord $line $SellAmountB 3
  pause
  :GetBuyProductB
  setVar $line CURRENTLINE
  stripText $line "Ore"
  getWord $line $BuyAmountB 3
  pause

  :fighterdownportb
  setvar $sellamountb 0 
  setvar $buyamountb 0

  :GotProductB
  
  # calculate how many cycles to run
  setVar $Trade 100
  setVar $X 100
  multiply $X $Holds
  subtract $Trade $PercTrade
  multiply $SellAmountA $Trade
  multiply $SellAmountB $Trade
  multiply $BuyAmountA $Trade
  multiply $BuyAmountB $Trade
  divide $SellAmountA $X
  divide $SellAmountB $X
  divide $BuyAmountA $X
  divide $BuyAmountB $X
  
if ($bot~nohaggle = true)
	setVar $Haggle~HaggleFactor 0
else
	gosub :player~isEpHaggle
	if ($player~isEphaggle)
		setVar $Haggle~HaggleFactor 7
	else
		setVar $Haggle~HaggleFactor 0
	end
end

  if (($Haggle~HaggleFactor = 0) or ($bot~nohaggle = true))
    setVar $clock 4
  else
    setVar $clock 0
  end
  
  if ($SellAmountA <= 1) or ($SellAmountB <= 1) or ($BuyAmountA <= 1) or ($BuyAmountB <= 1)
    # not worth trading
    setVar $Sector $SectorA
    setVar $Aborted "1"
    return
  end
  
  # make sure holds are empty
  if ($SectorA <> STARDOCK) and ($SectorA > 10)
    # drop a fig if we have to
    if ($DropFigs = 1)
      send "f1*cd"
    end
    
    send "jy"
  end
  
  
  # begin PPT
  setVar $FirstRun 1
  
  :PortA
  

  if (($Haggle~HaggleFactor = 0) OR ($bot~nohaggle = true))
	send "p t "
    # burst sell/buy
    if ($OnHand <> "None")
      send "**"
    end
    if ($SellAmountA <= 0) or ($BuyAmountB <= 0)
      if (PORT.CLASS[$SectorA] < 8)
        send "0* "
      end
      if (PORT.CLASS[$SectorA] > 3)
        send "0* "
      end
    else
      if (PORT.BUYFUEL[$SectorA] = 0)
        if ($ProdA = "Fuel")
          send "* * "
        else
          send "0* "
        end
      end
      if (PORT.BUYORG[$SectorA] = 0)
        if ($ProdA = "Organics")
          send "* * "
        else
          send "0* "
        end
      end
      if (PORT.BUYEQUIP[$SectorA] = 0)
        if ($ProdA = "Equipment")
          send "* * "
        else
          send "0* "
        end
      end
      
      setVar $OnHand $ProdA
    end
    
    # Note: WaitFor CAN be removed for overclocking
    if ($clock > 0)
      waitFor "<Port>"
      waitFor "Command [TL="
      subtract $clock 1
    end
  else
	send "pt"
    # haggle sell/buy
    
    if ($SellAmountA <= 0) or ($BuyAmountB <= 0)
      setVar $Haggle~BuyProd "none"
    else
      setVar $Haggle~BuyProd $ProdA
    end
    setVar $Haggle~Sector $SectorA
    gosub :Haggle~Haggle
    setVar $Credits $Haggle~Credits
    if ($Haggle~Abort = 1)
      goto :PortA
    end
  end
  subtract $BuyAmountA 1
  subtract $SellAmountA 1
  
  if ($SellAmountA <= "-1") or ($BuyAmountB <= "-1")
    setVar $Sector $SectorA
    if (($Haggle~HaggleFactor = 0) or ($bot~nohaggle = true)) and ($DisplayOFF)
      send "cn 9 qq"
    end

    return
  end
  
  # update window
  # setWindowContents worldTrade "Op: Trading*Cash: " & $credits
  # setTextTrigger Mines :MinePrompt "Mined Sector:"
  # if ($SectorB < 600) or (SECTORS > 5000)
    send $SectorB&"**"
    waitFor "Command [TL="
  #else
  #  send $SectorB
  #end

  if ($FirstRun = 1)
    setVar $FirstRun 0
    waitFor "Command [TL="
    if (($Haggle~HaggleFactor = 0) or ($bot~nohaggle = true)) // burst haggle, abort on all keys
      setVar $DisplayOFF 1
      send "cn 9 qq"
    end

    if ($SectorB <> STARDOCK) and ($SectorB > 10) and ($DropFigs = 1)
      send "* f1*ct"
    end
    
    waitOn "Warping to Sector " & $SectorB
    waitOn "Command [TL="
  
    # check if we fell through a one-way
    getDistance $distance $SectorB $SectorA
    if ($distance = 1)
    	goto :PortB
    else
      # update window
      # setWindowContents worldTrade "Op: Fell through One-way*Cash: " & $credits
  
      if (($Haggle~HaggleFactor = 0) or ($bot~nohaggle = true)) and ($DisplayOFF)
        send "cn 9 qq"
      end

      setVar $OneWay 1
      setVar $Sector $SectorB
      
      if ($SectorB > 10) and ($SectorB <> STARDOCK)
        send "jy"
      end
      return
    end
  end
  
  :PortB
  if (($Haggle~HaggleFactor = 0) or ($bot~nohaggle = true))
	send "p t "
    # burst sell/buy
    if ($OnHand <> "None")
      send "* * "
    end
    if ($SellAmountB <= 0) or ($BuyAmountA <= 0)
      if (PORT.CLASS[$SectorB] < 8)
        send "0* "
      end
      if (PORT.CLASS[$SectorB] > 3)
        send "0* "
      end
    else
      if (PORT.BUYFUEL[$SectorB] = 0)
        if ($ProdB = "Fuel")
          send "* * "
        else
          send "0 * "
        end
      end
      if (PORT.BUYORG[$SectorB] = 0)
        if ($ProdB = "Organics")
          send "* * "
        else
          send "0 * "
        end
      end
      if (PORT.BUYEQUIP[$SectorB] = 0)
        if ($ProdB = "Equipment")
          send "* * "
        else
          send "0 * "
        end 
      end
      
      setVar $OnHand $ProdB

    end
    
    # Note: WaitFor CAN be removed for overclocking
    if ($clock > 0)
      waitFor "<Port>"
      waitFor "Command [TL="
      subtract $clock 1
    end
  else
	send "pt"
    # Haggle sell/buy
  
    if ($SellAmountB <= 0) or ($BuyAmountA <= 0)
      setVar $Haggle~BuyProd "none"
    else
      setVar $Haggle~BuyProd $ProdB
    end
    setVar $Haggle~Sector $SectorB
    gosub :Haggle~Haggle
    setVar $Credits $Haggle~Credits
    if ($Haggle~Abort = 1)
      goto :PortB
    end
  end
  
  subtract $BuyAmountB 1
  subtract $SellAmountB 1
  
  if ($SellAmountB <= "-1") or ($BuyAmountA <= "-1")
    if (($Haggle~HaggleFactor = 0) or ($bot~nohaggle = true)) and ($DisplayOFF)
      send "cn 9 qq"
    end

    setVar $Sector $SectorB
    return
  end
  
  # if ($SectorA < 600) or (SECTORS > 5000)
    send $SectorA&"**"
    waitFor "Command [TL="
   # else
  #  send $SectorA
  # end
  
  # update window
  # setWindowContents worldTrade "Op: Trading*Cash: " & $credits
  
  goto :PortA


