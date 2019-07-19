logging off
     gosub :BOT~loadVars
     setVar $bot~parm1 $BOT~parm1
     setVar $bot~parm2 $BOT~parm2
     setVar $bot~parm3 $BOT~parm3
     setVar $bot~parm4 $BOT~parm4
     setVar $bot~parm5 $BOT~parm5
     setVar $bot~parm6 $BOT~parm6
     setVar $bot~parm7 $BOT~parm7
     setVar $bot~parm8 $BOT~parm8
     setVar $bot~user_command_line $BOT~user_command_line

#HELP FILE
     setVar $BOT~help[1]  $BOT~tab&"Enter Sector and attack until out of fighters and then surrender ship).  "
     setVar $BOT~help[2]  $BOT~tab&"       "
     gosub :bot~helpfile
     setVar $BOT~script_title "EAS"
     gosub :BOT~banner

:start
     gosub :PLAYER~quikstats
     setvar $total_fighters $player~fighters
     setvar $last_total_fighters $player~fighters
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
               HALT
		end
     gosub :ship~getShipStats
     send "cv0*yn" & $bot~parm1 & "*q"
     if ($PLAYER~CURRENT_PROMPT = "Citadel")
          if ($player~credits > 0)
               send "t t"&$player~credits&"* "
          end
          send "q"
          gosub :PLANET~getPlanetInfo
          send "q"
     end
:looper
     send $bot~parm1 & "*  *  "

:looper2
     killtrigger 1
     killtrigger 2
     settexttrigger 1 :attack "How many fighters do you wish to use "
     settexttrigger 2 :done "Do you want instructions"
     send "za"
     pause
     :attack
          killtrigger 2
          getword currentline $attack_fighters 11
          striptext $attack_fighters "," 
          striptext $attack_fighters ")" 
          send $attack_fighters & "*     "
          goto :looper2

     :done
          killtrigger 1
          send "*  "
          gosub :PLAYER~quikstats
          if ($PLAYER~CURRENT_SECTOR = $StartSector)
               send "l "&$planet~planet&"* "
               setVar $SWITCHBOARD~message "Back in start sector.  Probably in a pod.*"
               gosub :SWITCHBOARD~switchboard
               halt
          end
          if ($PLAYER~CURRENT_SECTOR = $bot~parm1)
               setVar $SWITCHBOARD~message "Made it into attack sector!  Let's go!*"
               gosub :SWITCHBOARD~switchboard
          else
               setVar $SWITCHBOARD~message "Not in start sector or attack sector!  What happened?!*"
               gosub :SWITCHBOARD~switchboard
          end
halt

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\planet\getplanetinfo\planet"
