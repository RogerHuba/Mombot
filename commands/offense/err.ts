logging off
     gosub :BOT~loadVars

#HELP FILE
     setVar $BOT~help[1]  $BOT~tab&"Enter Sector and Retreat until back in original sector (pod or actual retreat).  "
     setVar $BOT~help[2]  $BOT~tab&"       "
     gosub :bot~helpfile
     setVar $BOT~script_title "ERR"
     gosub :BOT~banner

:start
     gosub :PLAYER~quikstats
     setvar $StartSector $PLAYER~CURRENT_SECTOR 
     if (($PLAYER~CURRENT_PROMPT <> "Citadel") and ($PLAYER~CURRENT_PROMPT <> "Command"))
          setVar $SWITCHBOARD~message "ERR must be run from Command or Citadel prompt*"
	  gosub :SWITCHBOARD~switchboard
          halt
     end
     isNumber $test $bot~parm1
		if ($test)
                else
                        setVar $SWITCHBOARD~message "SECTOR must be a number*"
 	                gosub :SWITCHBOARD~switchboard
	                halt
		end

     if ($PLAYER~CURRENT_PROMPT = "Citadel")
          if ($player~credits > 0)
               send "t t"&$player~credits&"* "
          end
          send "cv0*yn" & $bot~parm1 & "*qq"
          gosub :PLANET~getPlanetInfo
          send "q"
     end
     send $bot~parm1 & "*  *  *  "
:looper
     killtrigger 1
     killtrigger 2
     send "zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  zr  *  "
     setDelayTrigger 1   :looper  20
     settexttrigger 2 :done "Do you want instructions"
     pause
     :done
     gosub :PLAYER~quikstats
     if ($PLAYER~CURRENT_SECTOR = $StartSector)
          send "l "&$planet~planet&"* "
     else
          setVar $SWITCHBOARD~message "Not in start sector - something is likely wrong.,*"
          gosub :SWITCHBOARD~switchboard
     end
     HALT

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet\getplanetinfo\planet"
