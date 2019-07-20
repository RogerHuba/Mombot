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

	loadVar $switchboard~bot_name
	loadVar $command
	loadVar $avoidedSectorsUgrid
	loadVar $player~unlimitedGame
	loadVar $bot_turn_limit
	loadVar $bot~user_command_line
	loadVar $bot~parm1
	loadVar $bot~parm2
	loadVar $bot~parm3
	loadVar $bot~parm4
	loadVar $bot~parm5
	loadVar $bot~parm6
	loadVar $bot~parm7
	loadVar $bot~parm8
	loadVar $stardock
	loadVar $home_sector
	loadVar $backdoor
	loadvar $LIMPET_COST
	loadvar $ARMID_COST
	loadVar $LIMPET_REMOVAL_COST
	loadvar $password

	fileExists $doesHelpFileExist "scripts\mombot\help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\mombot\help\"&$command&".txt" "- "&$command&" {holoscan} {evade} {seek}                          " 
		write "scripts\mombot\help\"&$command&".txt" "  Mass Upgrage - Originally written by Xide                       " 
		write "scripts\mombot\help\"&$command&".txt" "                                                                  " 
		write "scripts\mombot\help\"&$command&".txt" "   - {holoscan}    = 0 - doesn't holoscan                         " 
		write "scripts\mombot\help\"&$command&".txt" "                     1 - holoscans on odd densities               "
		write "scripts\mombot\help\"&$command&".txt" "                     2 - always holoscans (default)               " 
		write "scripts\mombot\help\"&$command&".txt" "                                                                  " 
		write "scripts\mombot\help\"&$command&".txt" "   - {evade}       = 0 - normal (default)                         " 
		write "scripts\mombot\help\"&$command&".txt" "                     1 - paranoid                                 " 
		write "scripts\mombot\help\"&$command&".txt" "                     2 - avoids nothing                           " 
		write "scripts\mombot\help\"&$command&".txt" "   - {seek}        = Seeks resources outside sector for upgrades  " 
		write "scripts\mombot\help\"&$command&".txt" "                                                                  " 
		send "'{" $switchboard~bot_name "} - Writing help file for this command in Help directory.*"
	end

    setTextLineTrigger  prompt      :allPrompts     #145 & #8
    send #145&"/"
    pause
    :allPrompts
        getWord CURRENTLINE $player~current_prompt 1
        stripText $player~current_prompt #145
        stripText $player~current_prompt #8
killalltriggers

# check location

if ($player~current_prompt <> "Command")
        clientMessage "This script must be run from the command menu"
        halt
end


reqRecording
logging off


getWordPos $bot~user_command_line $pos "seek"
if ($pos > 0)
	setVar $MassUpgrade~Seek 1
else
	setVar $MassUpgrade~Seek 0
end

if (($bot~parm1 = 0) OR ($bot~parm1 = 1) OR ($bot~parm1 = 2))
	setVar $Move~ScanHolo $bot~parm1
else
	setVar $Move~ScanHolo 1
end


if (($bot~parm1 = 0) OR ($bot~parm1 = 1) OR ($bot~parm1 = 2))
	setVar $Move~Evasion $bot~parm2
else
	setVar $Move~Evasion 0
end

  
setVar $MassUpgrade~IgnoreList ""
  
  
  
  setVar $Move~Attack 2
  setVar $Move~PortPriority 1
  setVar $Move~ExtraSend "f 1 " & #42 & " c d "
  replaceText $Move~ExtraSend #42 "*"
    

:Menu_Go
setEventTrigger disconnect :disconnected "Connection lost"
gosub :MassUpgrade~MassUpgrade
halt

:disconnected
  # disconnected.  Wait for the prompt then restart
  killAllTriggers
  setEventTrigger disconnect :disconnected "Connection lost"
  
  waitFor "Command [TL="
  goto :Menu_Go
  

# includes:
include "include\massUpgrade"
include "include\move"
