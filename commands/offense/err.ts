logging off
     gosub :BOT~loadVars

#HELP FILE
     setVar $BOT~help[1]  $BOT~tab&"ERR - Enter Retreat Retreat"
     setVar $BOT~help[2]  $BOT~tab&"      Enter Sector and Retreat until back in "
     setVar $BOT~help[3]  $BOT~tab&"      original sector (pod or actual retreat)."
     setVar $BOT~help[4]  $BOT~tab&"      "
     setVar $BOT~help[5]  $BOT~tab&"      err [sector] {ship}"
     setVar $BOT~help[6]  $BOT~tab&"      {ship} - xport to this ship before entering"

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

     echo "$bot~parm2#" $bot~parm2 "#"
     isNumber $test $bot~parm2
     if ($test) and (($bot~parm2 <> 0) and ($bot~parm2 <> ""))
          setVar $xport_first TRUE
          setVar $xport_ship $bot~parm2 
     else
          if ($bot~parm2 <> 0) and ($bot~parm2 <> "")
               setVar $SWITCHBOARD~message "Xport Ship must be a number*"
               gosub :SWITCHBOARD~switchboard
               halt
          end
     end

     if ($PLAYER~CURRENT_PROMPT = "Citadel")
          if ($player~credits > 0)
               send "t t"&$player~credits&"* "
          end
          send "cv0*yn" & $bot~parm1 & "*qq"
          gosub :PLANET~getPlanetInfo
          send "m * * * * * c"
          gosub :PLAYER~quikstats
          setVar $startmac "q q * "
     else
          setVar $startmac ""
     end
     if ($xport_first = TRUE)
          setVar $startmac $startmac & "x " & $xport_ship & "* q "
     end
     
     setVar $startmac $startmac &  $bot~parm1 & "*  *  *  "
     send $startmac

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
          send "l "&$planet~planet&"* c "
     else
          setVar $SWITCHBOARD~message "Not in start sector - something is likely wrong.,*"
          gosub :SWITCHBOARD~switchboard
     end
     HALT

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
