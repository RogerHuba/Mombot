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


	gosub :BOT~loadVars

	setVar $BOT~help[1]    $BOT~tab&"upgrader {seek} {ignore:} "
	setVar $BOT~help[2]    $BOT~tab&"       "
	setVar $BOT~help[3]    $BOT~tab&"      {seek} - Will attempt to search for ports to upgrade "
	setVar $BOT~help[4]    $BOT~tab&"               planets.  This is NOT safe."         
	setVar $BOT~help[5]    $BOT~tab&"       "
	setVar $BOT~help[6]    $BOT~tab&"   {ignore:} - List of planet numbers to ignore.  Separate"
	setVar $BOT~help[7]    $BOT~tab&"               numbers by commas and no spaces."
	setVar $BOT~help[8]    $BOT~tab&"                              "
	setVar $BOT~help[9]    $BOT~tab&"           Examples:                   "
	setVar $BOT~help[10]   $BOT~tab&"                   >upgrader seek ignore:5,8,9       "
	setVar $BOT~help[11]   $BOT~tab&"                   >upgrader            "
	setVar $BOT~help[12]   $BOT~tab&"                              "
	setVar $BOT~help[13]   $BOT~tab&"               - Originally written by Xide"
	gosub :bot~helpfile


gosub :player~quikstats
setVar $startingLocation $PLAYER~CURRENT_PROMPT
if ($startingLocation = "Command")

elseif ($startingLocation = "Citadel")
	send "q"
	gosub :PLANET~getPlanetInfo
	setvar $startingPlanet $planet~planet
	send "q"
elseif ($startingLocation = "Planet")
	gosub :PLANET~getPlanetInfo
	setvar $startingPlanet $planet~planet
	send "q"
else
	setVar $SWITCHBOARD~message "Have to be on Command, Planet, or Citadel prompt to start upgrader.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

reqRecording
logging off



getWordPos " "&$bot~user_command_line&" " $pos "ignore:"
if ($pos > 0)
	getText " "&$bot~user_command_line&" " $MassUpgrade~IgnoreList "ignore:" " "
	replacetext $MassUpgrade~IgnoreList "," " "
else
	setVar $MassUpgrade~IgnoreList ""
end

getWordPos " "&$bot~user_command_line&" " $pos "seek"
if ($pos > 0)
	setVar $MassUpgrade~Seek true
else
	setVar $MassUpgrade~Seek false
end




# set move routine prefs
loadVar $Move~Saved

if ($Move~Saved)
  loadVar $Move~ScanHolo
  loadVar $Move~Evasion
  loadVar $Move~Attack
  loadVar $Move~PortPriority
  loadVar $Move~ExtraSend
  replaceText $Move~ExtraSend #42 "*"
else
  setVar $Move~ScanHolo 1
  setVar $Move~Evasion 0
  setVar $Move~Attack 3
  setVar $Move~PortPriority 1
  setVar $Move~ExtraSend "f1" & #42 & "ct"
  saveVar $Move~ExtraSend
  replaceText $Move~ExtraSend #42 "*"
  
  saveVar $Move~ScanHolo
  saveVar $Move~Evasion
  saveVar $Move~Attack
  saveVar $Move~PortPriority
  
  setVar $Move~Saved 1
  saveVar $Move~Saved
end

:Menu_Go
setEventTrigger disconnect :disconnected "Connection lost"
gosub :MassUpgrade~MassUpgrade

if (($startingLocation = "Citadel") OR ($startingLocation = "Planet"))
	setvar $planet~planet $startingPlanet
	gosub :PLANET~landingsub
end
setVar $SWITCHBOARD~message "Upgrader is complete.*"
gosub :SWITCHBOARD~switchboard
halt

:disconnected
  # disconnected.  Wait for the prompt then restart
  killAllTriggers
  setEventTrigger disconnect :disconnected "Connection lost"
  
  waitFor "Command [TL="
  goto :Menu_Go
  

# includes:

include "source\module_includes\bot\loadvars\bot"
include "source\pack2_includes\massUpgrade"
include "source\pack2_includes\move"
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\planet\landingsub\planet"
