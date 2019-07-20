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

  loadVar $bot_name
  loadVar $command
  loadVar $avoidedSectorsUgrid
  loadVar $unlimitedGame
  loadVar $bot_turn_limit
  loadVar $user_command_line
  loadVar $parm1
  loadVar $parm2
  loadVar $parm3
  loadVar $parm4
  loadVar $parm5
  loadVar $parm6
  loadVar $parm7
  loadVar $parm8
  loadVar $stardock
  loadVar $home_sector
  loadVar $backdoor
  loadvar $LIMPET_COST
  loadvar $ARMID_COST
  loadVar $LIMPET_REMOVAL_COST
  loadvar $password

  fileExists $doesHelpFileExist "scripts\mombot\help\"&$command&".txt"
  if ($doesHelpFileExist <> TRUE)
    write "scripts\mombot\help\"&$command&".txt" "- wppt {holoscan} {evade}" 
    write "scripts\mombot\help\"&$command&".txt" "  World PPT - Originally written by Xide                          " 
    write "scripts\mombot\help\"&$command&".txt" "                                                                  " 
    write "scripts\mombot\help\"&$command&".txt" "   - {holoscan}    = 0 - doesn't holoscan                         " 
    write "scripts\mombot\help\"&$command&".txt" "                     1 - holoscans on odd densities               "
    write "scripts\mombot\help\"&$command&".txt" "                     2 - always holoscans (default)               " 
    write "scripts\mombot\help\"&$command&".txt" "                                                                  " 
    write "scripts\mombot\help\"&$command&".txt" "   - {evade}       = 0 - normal (default)                         " 
    write "scripts\mombot\help\"&$command&".txt" "                     1 - paranoid                                 " 
    write "scripts\mombot\help\"&$command&".txt" "                     2 - avoids nothing                           " 
    write "scripts\mombot\help\"&$command&".txt" "                                                                  " 
    write "scripts\mombot\help\"&$command&".txt" "   - {nohaggle}    = doesn't haggle                               " 
    write "scripts\mombot\help\"&$command&".txt" "                                                                  " 
    send "'{" $bot_name "} - Writing help file for this command in Help directory.*"
  end

if (($parm1 = 0) OR ($parm1 = 1) OR ($parm1 = 2))
  setVar $Move~ScanHolo $parm1
  setVar $PortCheck~ScanHolo $parm1
else
  setVar $Move~ScanHolo 1
  setVar $PortCheck~ScanHolo 1
end


if (($parm1 = 0) OR ($parm1 = 1) OR ($parm1 = 2))
  setVar $Move~Evasion $parm2
else
  setVar $Move~Evasion 0
end

    setTextLineTrigger  prompt      :allPrompts     #145 & #8
    send #145&"/"
    pause
    :allPrompts
        getWord CURRENTLINE $CURRENT_PROMPT 1
        stripText $CURRENT_PROMPT #145
        stripText $CURRENT_PROMPT #8
killalltriggers

# check location

if ($CURRENT_PROMPT <> "Command")
        clientMessage "This script must be run from the command menu"
        halt
end

reqRecording
logging off


getWordPos $user_command_line $pos "nohaggle"
if ($pos > 0)
  setVar $Haggle~HaggleFactor 1
else
  setVar $Haggle~HaggleFactor 7
end

  


  setVar $Move~Attack 2
  setVar $Move~PortPriority 1
  setVar $Move~ExtraSend "f 1 " & #42 & " c d "
  replaceText $Move~ExtraSend #42 "*"
    
  setVar $Move~Saved 1

  setVar $PPT~DropFigs 1
    
  setVar $PPT~Saved 1


  setVar $PortCheck~Danger 1
  setVar $PortCheck~FuelOrganics 1
  setVar $PortCheck~PortType 1
  
  setVar $PortCheck~Saved 1


:Menu_Go
setVar $WorldTrade~Quota 0
setEventTrigger disconnect :disconnected "Connection lost"
gosub :WorldTrade~WorldTrade
halt

:disconnected
  # disconnected.  Wait for the prompt then restart
  killAllTriggers
  
  waitFor "Command [TL="
  goto :Menu_Go
  

# includes:
include "include\worldTrade"
