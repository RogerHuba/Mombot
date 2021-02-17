    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $self_command
    loadVar $stardock
    loadVar $backdoor

   killalltriggers
    setVar $SWITCHBOARD~bot_name $bot_name
    setVar $SWITCHBOARD~self_command $self_command
    gosub  :player~currentPrompt
    setVar $bot~validPrompts "Do How"
    setVar $startingLocation $PLAYER~current_prompt
    setVar $bot~startingLocation $startingLocation
    gosub :bot~checkStartingPrompt

    gosub :bot~checkStartingPrompt
    :print_the__terra_menu
        gosub :PLAYER~quikstats
        echo "[2J"
    :terra_menu_without_clear
        echo "*"
        echo ANSI_15 "               -=( " ANSI_12 "M()M Terra Survival Toolkit" ANSI_15 " )=-  "&ANSI_7&"*"
        echo ANSI_5  " -----------------------------------------------------------------------------"&ANSI_7&"*"
        echo ANSI_9&#27&"[35m<"&#27&"[32m1"&#27&"[35m> " & ANSI_14 & " display Terra sector" & ANSI_9 & ", land       " #27&"[35m<"&#27&"[32m5"&#27&"[35m> " & ANSI_14 & " check twarp lock" & ANSI_9 & ", land*"
        echo #27&"[35m<"&#27&"[32m2"&#27&"[35m> " & ANSI_14 & " holoscan" & ANSI_9 & ", land                   " #27&"[35m<"&#27&"[32m6"&#27&"[35m> " & ANSI_14 & " lift, twarp out*"
        echo #27&"[35m<"&#27&"[32m3"&#27&"[35m> " & ANSI_14 & " density scan" & ANSI_9 & ", land               " #27&"[35m<"&#27&"[32m7"&#27&"[35m> " & ANSI_14 & " lift, lock tow" & ANSI_9 & ", twarp out*"
        echo #27&"[35m<"&#27&"[32m4"&#27&"[35m> " & ANSI_14 & " get xport list" & ANSI_9 & ", land             " #27&"[35m<"&#27&"[32m8"&#27&"[35m> " & ANSI_14 & " xport" & ANSI_9 & ", land*"
        echo         "*"
        echo #27&"[35m<"&#27&"[32mA"&#27&"[35m> " & ANSI_14 & " set avoid" & ANSI_9 & ",land                   " #27&"[35m<"&#27&"[32mE"&#27&"[35m> " & ANSI_14 & " lift, cloak out*"
        echo #27&"[35m<"&#27&"[32mB"&#27&"[35m> " & ANSI_14 & " clear avoided sector" & ANSI_9 & ", land       " #27&"[35m<"&#27&"[32mF"&#27&"[35m> " & ANSI_14 & " C U Y (enable t-warp)" & ANSI_9 & " ,land*"
        echo #27&"[35m<"&#27&"[32mC"&#27&"[35m> " & ANSI_14 & " plot course" & ANSI_9 & ", land                " #27&"[35m<"&#27&"[32mG"&#27&"[35m> " & ANSI_14 & " toggle cn9" & ANSI_9 & ", land*"
        echo #27&"[35m<"&#27&"[32mD"&#27&"[35m> " & ANSI_14 & " get corpie locations" & ANSI_9 & ", land       *"
        echo ANSI_5  " -----------------------------------------------------------------------------**"
        echo ANSI_10 "Your choice?*"
            getConsoleInput $chosen_option SINGLEKEY
            upperCase $chosen_option
            killalltriggers
    :process_command
        if ($chosen_option = "1")
             send "* * dl 1*  "
             gosub :PLAYER~quikstats
        elseif ($chosen_option = "2")
             send "* * shl 1*   "
             gosub :PLAYER~quikstats
        elseif ($chosen_option = "3")
            send "* * sdl 1*  "
            gosub :PLAYER~quikstats
        elseif ($chosen_option = "4")
            send "* *  x**    l 1*  "
            gosub :PLAYER~quikstats
        elseif ($chosen_option = "5")
             if ($PLAYER~TWARP = "No")
                   echo ANSI_12 "**Cannot T-warp. No Twarp drive!*"
                   halt
             elseif ($PLAYER~ORE_HOLDS < 3)
                   echo ANSI_12 "**Cannot T-warp. No ore!*"
                   halt
             end
             getInput $sector "T-Warp to: "
             isNumber $numtest $sector
             if ($numtest < 1)
                   echo ANSI_12 "**Invalid sector number!*"
                   halt
             end
             if ($sector < 1) OR ($sector > SECTORS)
                   echo ANSI_12 "**Invalid sector number!*"
                   halt
             end
             setVar $msg ""
             killalltriggers
             setTextLineTrigger tdet_trg1 :tdet_blnd "Do you want to make this jump blind?"
             setTextLineTrigger tdet_trg2 :tdet_fuel "You do not have enough Fuel Ore to make the jump."
             setTextLineTrigger tdet_trg3 :tdet_good "Locating beam pinpointed, TransWarp Locked."
             setTextTrigger tdet_trg4 :tdet_dock "Do you wish to (L)eave or (T)ake Colonists?"
             send "* *   m  " & $sector & "  *  y*  *  *  l 1*   "
             pause
             goto :print_the_menu
             :tdet_blnd
                 setVar $msg ANSI_12 & "**No fighter lock exists. Blind warp hazard!!*"
                 pause
             :tdet_fuel
                 setVar $msg ANSI_12 & "**Not enough ore for that jump!*"
                 pause
             :tdet_good
                 setVar $msg ANSI_10 & "**Fighter lock found. Looks good!*"
                 pause
             :tdet_dock
                 gosub :PLAYER~quikstats
                 killalltriggers
                 echo $msg
                 halt
        elseif ($chosen_option = "6")
             if ($PLAYER~TWARP = "No")
                   echo ANSI_12 "**Cannot T-warp. No Twarp drive!*"
                   halt
             elseif ($PLAYER~ORE_HOLDS < 3)
                   echo ANSI_12 "**Cannot T-warp. No ore!*"
                   halt
             end
             getInput $sector "T-Warp to: "
             isNumber $numtest $sector
             if ($numtest < 1)
                   echo ANSI_12 "**Invalid sector number!*"
                   halt
             end
             if ($sector < 1) OR ($sector > SECTORS)
                   echo ANSI_12 "**Invalid sector number!*"
                   halt
             end
             send "* *  m  " & $sector & "  *  y  y  *  *"
             gosub :PLAYER~quikstats
             if ($PLAYER~CURRENT_SECTOR = 1)
            send "l 1*  "
             end
             halt
        elseif ($chosen_option = "7")
             if ($PLAYER~TWARP = "No")
                   echo ANSI_12 "*Cannot T-warp. No Twarp drive!*"
                   halt
             elseif ($PLAYER~ORE_HOLDS < 3)
                   echo ANSI_12 "*Cannot T-warp. No ore!*"
                   halt
             end
             getInput $shipnum "Ship number to tow: "
             isNumber $numtest $shipnum
             if ($numtest < 1)
                   echo ANSI_12 "*Invalid ship number!*"
                   halt
             end
             if ($shipnum < 1) OR ($shipnum > 65000)
                   echo ANSI_12 "*Invalid ship number!*"
                   halt
             end
             getInput $sector "T-Warp to: "
             isNumber $numtest $sector
             if ($numtest < 1)
                   echo ANSI_12 "*Invalid sector number!*"
                   halt
             end
             if ($sector < 1) OR ($sector > SECTORS)
                   echo ANSI_12 "*Invalid sector number!*"
                   halt
             end
             send "* * w  *  *  w  *" & $shipnum & "*  *  m  " & $sector & "  *  y  y  *  *"
             gosub :PLAYER~quikstats
             if ($PLAYER~CURRENT_SECTOR = 1)
            send "l 1*  "
             end
             halt
        elseif ($chosen_option = "8")
             getInput $shipnum "Ship number to xport to: "
             isNumber $numtest $shipnum
             if ($numtest < 1)      
                   echo ANSI_12 "*Invalid ship number!*"
                   halt
             end
             if ($shipnum < 1) OR ($shipnum > 65000)
                   echo ANSI_12 "*Invalid ship number!*"
                   halt
             end
             setVar $msg ""
             killalltriggers
             setTextLineTrigger tdet_trg1 :txport_notavail "That is not an available ship."
             setTextLineTrigger tdet_trg2 :txport_badrange "only has a transport range of"
             setTextLineTrigger tdet_trg3 :txport_security "SECURITY BREACH! Invalid Password, unable to link transporters."
             setTextLineTrigger tdet_trg4 :txport_noaccess "Access denied!"
             setTextLineTrigger tdet_trg5 :txport_xprtgood "Security code accepted, engaging transporter control."
             setTextTrigger tdet_trg6 :txport_go_ahead "Do you wish to (L)eave or (T)ake Colonists?"
                     setTextTrigger tdet_trg7 :txport_go_ahead "That planet is not in this sector."
                     setTextTrigger tdet_trg8 :txport_go_ahead "Are you sure you want to jettison all cargo? (Y/N)"
             send "* *  x    z" & $shipnum & "*  *    l j"&#8&" 1*  "
             pause
             goto :print_the_menu
             :txport_notavail
                 setVar $msg ANSI_12 & "**That ship is not available.*"
                 pause
             :txport_badrange
                 setVar $msg ANSI_12 & "**That ship is too far away.*"
                 pause
             :txport_security
                 setVar $msg ANSI_12 & "**That ship is passworded.*"
                 pause
             :txport_noaccess
                 setVar $msg ANSI_12 & "**Cannot access that ship.*"
                 pause
             :txport_xprtgood
                 setVar $msg ANSI_10 & "**Xport good!*"
                 pause
             :txport_go_ahead
                 killalltriggers
                 echo $msg
                 halt
        elseif ($chosen_option = "A")
             getInput $sector "To sector: "
             isNumber $numtest $sector
             if ($numtest < 1)
                   echo ANSI_12 "**Invalid sector number!*"
                   halt
             end
             if ($sector < 1) OR ($sector > SECTORS)
                   echo ANSI_12 "**Invalid sector number!*"
                   halt
             end        
             send "* *  c  v  " & $sector & "*  q  l 1*  "
             gosub :PLAYER~quikstats
        elseif ($chosen_option = "B")
             getInput $sector "To sector: "
             isNumber $numtest $sector
             if ($numtest < 1)
                   echo ANSI_12 "**Invalid sector number!*"
                   halt
             end
             if ($sector < 1) OR ($sector > SECTORS)
                   echo ANSI_12 "**Invalid sector number!*"
                   halt
             end
             send "* *  c  v  0  *  y  n  " & $sector & "*  q  l 1*  "
             gosub :PLAYER~quikstats
        elseif ($chosen_option = "C")
             getInput $sector "To sector: "
             isNumber $numtest $sector
             if ($numtest < 1)
                   echo ANSI_12 "**Invalid sector number!*"
                   halt
             end
             if ($sector < 1) OR ($sector > SECTORS)
                   echo ANSI_12 "**Invalid sector number!*"
                   halt
             end
             send "^f*" & $sector & "*q"
             waitOn "ENDINTERROG"
        elseif ($chosen_option = "E")
             if ($CLOAKS > 0)
                  echo ANSI_11 "*Are you sure you want to cloak out? (y/N)*"
                  getConsoleInput $choice singlekey
                  upperCase $choice
                  if ($choice = "Y")
                       send "* * q  y  y"
                  else
                       echo ANSI_12 & "**Aborting cloak-out.*"
                       halt
                  end
                  halt
             else
                  echo ANSI_12 & "**You have no cloaking devices!*"
             end
        elseif ($chosen_option = "D")
             send "* *  t  aq  l 1*  "
             gosub :PLAYER~quikstats
        elseif ($chosen_option = "G")
             send "* *  c  n  9q  q  l 1*  "
             gosub :PLAYER~quikstats
        elseif ($chosen_option = "F")
             send "* * c  u  y  q  l 1*  "
             gosub :PLAYER~quikstats
        else
             halt
        end
halt
:doneTerraKit
        echo #27 "[30D                           " #27 "[30D"
        halt
        
        include "source\bot_includes\player"
  include "source\bot_includes\switchboard"
include "source\module_includes\prompt"