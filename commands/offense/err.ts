logging off
     gosub :BOT~loadVars
     setVar $parm1 $BOT~parm1
     setVar $parm2 $BOT~parm2
     setVar $parm3 $BOT~parm3
     setVar $parm4 $BOT~parm4
     setVar $parm5 $BOT~parm5
     setVar $parm6 $BOT~parm6
     setVar $parm7 $BOT~parm7
     setVar $parm8 $BOT~parm8
     setVar $user_command_line $BOT~user_command_line

#HELP FILE
     setVar $BOT~help[1]  $BOT~tab&"Enter Sector and Retreat until back in original sector (pod or actual retreat).  "
     setVar $BOT~help[2]  $BOT~tab&"       "
     gosub :BOT~help_file
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
     isNumber $test $parm1
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
          send "cv0*yn" & $parm1 & "*qq"
          gosub :PLANET~getPlanetInfo
          send "q"
     end
     send $parm1 & "*  *  *  "
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
          send "l "&$PLANET~planet&"* "
     else
          setVar $SWITCHBOARD~message "Not in start sector - something is likely wrong.,*"
          gosub :SWITCHBOARD~switchboard
     end
     HALT

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
