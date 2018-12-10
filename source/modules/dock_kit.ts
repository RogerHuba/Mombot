#Credit Dynarri/Singularity
    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $self_command
    loadVar $stardock
    loadVar $backdoor

:dockKit
    killalltriggers
    setVar $SWITCHBOARD~bot_name $bot_name
    setVar $SWITCHBOARD~self_command $self_command
    gosub :PLAYER~current_prompt
    setVar $PROMPT~validPrompts "<StarDock> <Hardware <Libram <FedPolice> <Shipyards> <Tavern>"
    setVar $startingLocation $PLAYER~current_prompt
    setVar $PROMPT~startingLocation $startingLocation
    gosub :PROMPT~checkStartingPrompt

:print_the_menu
    gosub :PLAYER~quikstats
    echo "[2J"
:menu_without_clear
    echo "*"
    echo ANSI_15 "               -=( " ANSI_12 "Dnyarri's Dock Survival Toolkit" ANSI_15 " )=-  *"
    echo ANSI_5  " -----------------------------------------------------------------------------*"
    echo ANSI_9 #27&"[35m<"&#27&"[32m1"&#27&"[35m> " & ANSI_14 & " display stardock sector" & ANSI_9 & ", re-dock " #27&"[35m<"&#27&"[32m6"&#27&"[35m> " & ANSI_14 & " check twarp lock" & ANSI_9 & ", re-dock*"
    echo #27&"[35m<"&#27&"[32m2"&#27&"[35m> " & ANSI_14 & " holoscan" & ANSI_9 & ", re-dock                " #27&"[35m<"&#27&"[32m7"&#27&"[35m> " & ANSI_14 & " twarp out*"
    echo #27&"[35m<"&#27&"[32m3"&#27&"[35m> " & ANSI_14 & " density scan" & ANSI_9 & ", re-dock            " #27&"[35m<"&#27&"[32m8"&#27&"[35m> " & ANSI_14 & " lock tow" & ANSI_9 & ", twarp out*"
    echo #27&"[35m<"&#27&"[32m4"&#27&"[35m> " & ANSI_14 & " get xport list" & ANSI_9 & ", re-dock          " #27&"[35m<"&#27&"[32m9"&#27&"[35m> " & ANSI_14 & " xport" & ANSI_9 & ", re-dock*"
    echo #27&"[35m<"&#27&"[32m5"&#27&"[35m> " & ANSI_14 & " get planet list" & ANSI_9 & ", re-dock         *"
    echo         "*"
    echo #27&"[35m<"&#27&"[32mA"&#27&"[35m> " & ANSI_14 & " launch mine disruptor" & ANSI_9 & ", re-dock   " #27&"[35m<"&#27&"[32mE"&#27&"[35m> " & ANSI_14 & " make a planet" & ANSI_9 & ", re-dock*"
    echo #27&"[35m<"&#27&"[32mB"&#27&"[35m> " & ANSI_14 & " set avoid" & ANSI_9 & ",re-dock                " #27&"[35m<"&#27&"[32mF"&#27&"[35m> " & ANSI_14 & " land on planet and drop ore" & ANSI_9 & ", re-dock*"
    echo #27&"[35m<"&#27&"[32mC"&#27&"[35m> " & ANSI_14 & " clear avoided sector" & ANSI_9 & ", re-dock    " #27&"[35m<"&#27&"[32mG"&#27&"[35m> " & ANSI_14 & " land on planet and take all" & ANSI_9 & ", re-dock*"
    echo #27&"[35m<"&#27&"[32mD"&#27&"[35m> " & ANSI_14 & " plot course" & ANSI_9 & ", re-dock             " #27&"[35m<"&#27&"[32mH"&#27&"[35m> " & ANSI_14 & " land on and destroy planet" & ANSI_9 & ", re-dock*"
    echo "*"
    echo #27&"[35m<"&#27&"[32mZ"&#27&"[35m> " & ANSI_14 & " cloak out*"
    echo #27&"[35m<"&#27&"[32mL"&#27&"[35m> " & ANSI_14 & " get corpie locations" & ANSI_9 & ", re-dock*"
    echo #27&"[35m<"&#27&"[32mW"&#27&"[35m> " & ANSI_14 & " C U Y (enable t-warp)" & ANSI_9 & " ,re-dock*"
    echo #27&"[35m<"&#27&"[32mT"&#27&"[35m> " & ANSI_14 & " toggle cn9" & ANSI_9 & ", re-dock*"
    echo #27&"[35m<"&#27&"[32mO"&#27&"[35m> " & ANSI_14 & " Ore Swapper X-port*"
    echo ANSI_5  " -----------------------------------------------------------------------------**"
    echo ANSI_10 "Your choice?*"
        getConsoleInput $chosen_option SINGLEKEY
        upperCase $chosen_option
        killalltriggers
:process_command
    if ($chosen_option = "1")
         send "qqq  z  n  dp  s  s "
             waitOn "Landing on Federation StarDock."
         waitOn "<Shipyards> Your option (?)"
    elseif ($chosen_option = "2")
         send "qqq  z  n  sh*  p  s  s "
         waitOn "Landing on Federation StarDock."
         gosub :PLAYER~quikstats
         waitOn "<Shipyards> Your option (?)"
    elseif ($chosen_option = "3")
         send "qqq  z  n  sdp  s  s "
         waitOn "Landing on Federation StarDock."
         waitOn "<Shipyards> Your option (?)"
    elseif ($chosen_option = "4")
         send "qqq  z  n  x**    p  s  s "
         waitOn "Landing on Federation StarDock."
         waitOn "<Shipyards> Your option (?)"
    elseif ($chosen_option = "5")
         send "qqq  z  n  l*  q  q  z  n  p  s  s "
         waitOn "Landing on Federation StarDock."
         waitOn "<Shipyards> Your option (?)"
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
         setVar $msg ""
             killalltriggers
         setTextLineTrigger det_trg1 :det_blnd "Do you want to make this jump blind?"
         setTextLineTrigger det_trg2 :det_fuel "You do not have enough Fuel Ore to make the jump."
         setTextLineTrigger det_trg3 :det_good "Locating beam pinpointed, TransWarp Locked."
         setTextLineTrigger det_trg4 :det_dock "Landing on Federation StarDock."
         send "qqq  z  n  m  " & $sector & "  *  yn  *  *  p  s  s "
         pause
         goto :print_the_menu
         :det_blnd
             setVar $msg ANSI_12 & "**No fighter lock exists. Blind warp hazard!!*"
             pause
         :det_fuel
             setVar $msg ANSI_12 & "**Not enough ore for that jump!*"
             pause
         :det_good
             setVar $msg ANSI_10 & "**Fighter lock found. Looks good!*"
             pause
         :det_dock
             waitOn "<Shipyards> Your option (?)"
                 killalltriggers
             echo $msg
             halt
    elseif ($chosen_option = "7")
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
         send "qqq  z  n  m  " & $sector & "  *  y  y  *  *"
         halt
    elseif ($chosen_option = "8")
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
         send "qqq  z  n  w  n  *  w  n" & $shipnum & "*  *  m  " & $sector & "  *  y  y  *  *"
         halt
    elseif ($chosen_option = "9")
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
         setTextLineTrigger det_trg1 :xport_notavail "That is not an available ship."
         setTextLineTrigger det_trg2 :xport_badrange "only has a transport range of"
         setTextLineTrigger det_trg3 :xport_security "SECURITY BREACH! Invalid Password, unable to link transporters."
         setTextLineTrigger det_trg4 :xport_noaccess "Access denied!"
         setTextLineTrigger det_trg5 :xport_xprtgood "Security code accepted, engaging transporter control."
         setTextLineTrigger det_trg6 :xport_go_ahead "Landing on Federation StarDock."
         send "qqq  z  n  x    " & $shipnum & "    *    *    *    p  s  s "
         pause
         goto :print_the_menu
         :xport_notavail
             setVar $msg ANSI_12 & "**That ship is not available.*"
             pause
         :xport_badrange
             setVar $msg ANSI_12 & "**That ship is too far away.*"
             pause
         :xport_security
             setVar $msg ANSI_12 & "**That ship is passworded.*"
             pause
         :xport_noaccess
             setVar $msg ANSI_12 & "**Cannot access that ship.*"
             pause
         :xport_xprtgood
             setVar $msg ANSI_10 & "**Xport good!*"
             pause
         :xport_go_ahead
             gosub :PLAYER~quikstats
             waitOn "<Shipyards> Your option (?)"
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
         setVar $msg ""
             killalltriggers
         setTextLineTrigger det_trg1 :dis_nadj "That is not an adjacent sector"
         setTextLineTrigger det_trg2 :dis_ndis "You do not have any Mine Disruptors!"
         setTextLineTrigger det_trg3 :dis_done "Disruptor launched into sector"
         setTextLineTrigger det_trg4 :dis_okay "Landing on Federation StarDock."
         send "qqq  z  n  c  w  y  " & $sector & "  *  q  q  q  z  n  p  s  h "
         pause
         :dis_nadj
             setVar $msg ANSI_10 & "**That sector isn't adjacent to StarDock.*"
             pause
         :dis_ndis
             setVar $msg ANSI_10 & "**Out of disruptors.*"
             pause
         :dis_done
             setVar $msg ANSI_10 & "**Disruptor launched!*"
             pause
         :dis_okay
             gosub :PLAYER~quikstats
             waitOn "<Hardware Emporium> So what are you looking for (?)"
                 killalltriggers
             echo $msg
             halt
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
         send "qqq  z  n  c  v  " & $sector & "*  q  p  s  s "
         waitOn "Landing on Federation StarDock."
         waitOn "<Shipyards> Your option (?)"
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
        send "qqq  z  n  c  v  0  *  y  n  " & $sector & "*  q  p  s  s "
        waitOn "Landing on Federation StarDock."
        waitOn "<Shipyards> Your option (?)"
        goto :print_the_menu
    elseif ($chosen_option = "D")
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
         if ($PLAYER~GENESIS > 0)
               send "qqq  z  n  u  y  *  .*  z  c  *  p  s  h "
               waitOn "Landing on Federation StarDock."
               gosub :PLAYER~quikstats
               waitOn "<Hardware Emporium> So what are you looking for (?)"
         else
               echo ANSI_12 "**You don't have any Genesis Torps!*"
               halt
         end
    elseif ($chosen_option = "F")
         if ($PLAYER~ORE_HOLDS < 1)
               echo ANSI_12 "**You have no ore to drop!*"
               halt
         end
         getInput $pnum "Planet number: "
         isNumber $numtest $pnum
         if ($numtest < 1)
               echo ANSI_12 "**Invalid planet number!*"
               halt
         end
         if ($pnum < 1) OR ($pnum > 33000)
               echo ANSI_12 "**Invalid planet number!*"
               halt
         end
         setVar $msg ""
             killalltriggers
         setTextLineTrigger det_trg1 :pland_trg_1 "Engage the Autopilot?"
         setTextLineTrigger det_trg2 :pland_trg_2 "That planet is not in this sector."
         setTextLineTrigger det_trg3 :pland_trg_3 "<Take all>"
         setTextLineTrigger det_trg4 :pland_trg_4 "<Take/Leave Products>"
         setTextLineTrigger det_trg5 :pland_trg_5 "Landing on Federation StarDock."
         send "qqq  z  n  l " & $pnum & "  *  *  z  n  z  n  *  z  q  t  n  z  l  1  *  q  q  z  n  p  s  h "
         pause
    elseif ($chosen_option = "G")
         getInput $pnum "Planet number: "
         isNumber $numtest $pnum
         if ($numtest < 1)
               echo ANSI_12 "**Invalid planet number!*"
               halt
         end
         if ($pnum < 1) OR ($pnum > 33000)
               echo ANSI_12 "**Invalid planet number!*"
               halt
         end
         setVar $msg ""
             killalltriggers
         setTextLineTrigger det_trg1 :pland_trg_1 "Engage the Autopilot?"
         setTextLineTrigger det_trg2 :pland_trg_2 "That planet is not in this sector."
         setTextLineTrigger det_trg3 :pland_trg_3 "<Take all>"
         setTextLineTrigger det_trg4 :pland_trg_4 "<Take/Leave Products>"
         setTextLineTrigger det_trg5 :pland_trg_5 "Landing on Federation StarDock."
         send "qqq  z  n  l " & $pnum & "  *  *  z  n  z  n  *  z  q  a  *  q  q  z  n  p  s  h "
         pause
    elseif ($chosen_option = "H")
         if ($PLAYER~ATOMIC < 1)
               echo ANSI_12 "**You don't have any Atomic Dets!*"
               halt
         end
         getInput $pnum "Planet number: "
         isNumber $numtest $pnum
         if ($numtest < 1)
               echo ANSI_12 "**Invalid planet number!*"
               halt
         end
         if ($pnum < 1) OR ($pnum > 33000)
               echo ANSI_12 "**Invalid planet number!*"
               halt
         end
         setVar $msg ""
             killalltriggers
         setTextLineTrigger det_trg1 :pland_trg_1 "Engage the Autopilot?"
         setTextLineTrigger det_trg2 :pland_trg_2 "That planet is not in this sector."
         setTextLineTrigger det_trg3 :pland_trg_3 "<Take all>"
         setTextLineTrigger det_trg4 :pland_trg_4 "<Take/Leave Products>"
         setTextLineTrigger det_trg5 :pland_trg_5 "Landing on Federation StarDock."
         setTextLineTrigger det_trg6 :pland_trg_6 "<DANGER> Are you sure you want to do this?"
         send "qqq  z  n  l " & $pnum & "  *  *  z  n  z  n  *  z  d  y  p  s  h "
         pause
    elseif ($chosen_option = "Z")
         if ($CLOAKS > 0)
              echo ANSI_11 "*Are you sure you want to cloak out? (y/N)*"
              getConsoleInput $choice singlekey
              upperCase $choice
              if ($choice = "Y")
                   goto :cloak_on_out
              else
                   echo ANSI_12 & "**Aborting cloak-out.*"
                   halt
              end
              :cloak_on_out
              send "qqq  y  y"
              halt
         else
              echo ANSI_12 & "**You have no cloaking devices!*"
         end
    elseif ($chosen_option = "L")
         send "qqq  z  n  t  aq  p  s  s "
         waitOn "Landing on Federation StarDock."
         waitOn "<Shipyards> Your option (?)"
    elseif ($chosen_option = "T")
         send "qqq  z  n  c  n  9q  q  p  s  s "
         waitOn "Landing on Federation StarDock."
         waitOn "<Shipyards> Your option (?)"
    elseif ($chosen_option = "W")
         send "qqq  z  n  c  u  y  q  p  s  s "
         waitOn "Landing on Federation StarDock."
         waitOn "<Shipyards> Your option (?)"
    elseif ($chosen_option = "O")
         goto :swap_ore
    end
    halt
# -------------------------------------------------------------------
:swap_ore
    echo "**"
    echo ANSI_11 "This automates the process of trading ore between ships.**"
    echo ANSI_15 "It pops a planet, drops ore and re-docks.*"
    echo ANSI_15 "After a brief pause it then lifts, xports, grabs the ore and re-docks.*"
    echo ANSI_15 "The result... you're in your new ship, safe at dock w/ ore.*"
    echo ANSI_15 "It tries to be as safe as possible but there's always some risk.*"
    echo "*"
    echo ANSI_14 "Are you sure you want to start the Ore Swapper X-port? (y/N)*"
    getConsoleInput $choice singlekey
    upperCase $choice
    if ($choice = "Y")
        goto :init_ore_swap_vars
    else
        echo ANSI_12 & "**Aborting Ore Swapper X-port.*"
        halt
    end
:init_ore_swap_vars
    setVar $funky_counter 0
    getInput $shipnum "Ship number to transfer fuel to: "
    isNumber $numtest $shipnum
    if ($numtest < 1)
        echo ANSI_12 "*Invalid ship number!*"
        halt
    end
    if ($shipnum < 1) OR ($shipnum > 65000)
        echo ANSI_12 "*Invalid ship number!*"
        halt
    end
:top_of_ore_swap
    gosub :PLAYER~quikstats
    add $funky_counter 1
    if ($PLAYER~GENESIS < 1)
        echo ANSI_12 "**Out of Genesis Torps. You're going to need one for this.*"
        halt
    end
    if ($PLAYER~ORE_HOLDS < 3)
        echo ANSI_12 "**There's no ore on your ship! You can't drop ore if you don't have any.*"
        halt
    end
    send "qqq  z  n  u  y  *  .*  z  c  *  p  s  h "
    waitOn "Landing on Federation StarDock."
    getRnd $rand_wait 100 300
    killtrigger safety_delay
    setDelayTrigger safety_delay :lift_stuff $rand_wait
    pause
:lift_stuff
    send "qqq  z  n  l*  *  z  q  t  n  z  l  1  *  q  q  z  n  p  s  h "
        killalltriggers
    setTextLineTrigger result_trg1 :res_torps "You don't have any Genesis Torpedoes to launch!"
    setTextLineTrigger result_trg2 :res_nopln "There isn't a planet in this sector."
    setTextLineTrigger result_trg3 :res_mltpl "Registry# and Planet Name"
    setTextLineTrigger result_trg4 :res_landd "Landing sequence engaged..."
    setTextLineTrigger result_trg5 :res_backd "Landing on Federation StarDock."
    pause
:res_torps
    echo ANSI_12 "**You somehow ran out of Genesis Torps before launching. This should not have happened! Check your status!*"
    send "? "
    halt
:res_nopln
    echo ANSI_12 "**The planet is gone! Someone might be messing with us.*"
    if ($funky_counter < 4)
        goto :top_of_ore_swap
    else
        echo ANSI_12 "**I've tried this 3 times, something is definately going on. Check your status!*"
        send "? "
        halt
    end
:res_landd
    waitOn "Planet #"
    getWord CURRENTLINE $pnum 2
    stripText $pnum "#"
    waitOn "(?="
    echo ANSI_10 "**We've landed and dropped our ore on planet #" & $pnum & "!*"
    pause
:res_mltpl
    waitOn "--------------------"
        killalltriggers
    setVar $p_array_idx 0
    setArray $p_array 255
        killalltriggers
    setTextLineTrigger plist_trig :plist_line ">"
    setTextLineTrigger plist_end  :plist_end  "Land on which planet"
    pause
    halt
    :plist_line
        add $p_array_idx 1
        setVar $line CURRENTLINE
        stripText $line "<"
        stripText $line ">"
        getWord $line $a_number 1
        setVar $p_array[$p_array_idx] $a_number
        killtrigger plist_trig
        setTextLineTrigger plist_trig :plist_line "<"
        pause
        halt
    :plist_end
            killalltriggers
        if ($p_array_idx < 1)
            echo ANSI_12 "**The planet is gone! Someone might be messing with us.*"
            if ($funky_counter < 4)
                goto :top_of_ore_swap
            else
                    echo ANSI_12 "**I've tried this 3 times, something is definately going on. Check your status!*"
                    send "? "
                halt
            end
        end
    waitOn "Landing on Federation StarDock."
    waitOn "<Hardware Emporium> So what are you looking for (?)"
    getRnd $rand_wait 100 300
    killtrigger safety_delay
    setDelayTrigger safety_delay :more_lift_stuff $rand_wait
    pause
    :more_lift_stuff
        getRnd $rnd_idx 1 $p_array_idx
        setVar $pnum $p_array[$rnd_idx]
            killalltriggers
        setTextLineTrigger result_trg1 :res_baddd "Engage the Autopilot?"
        setTextLineTrigger result_trg2 :res_baddd "That planet is not in this sector."
        setTextLineTrigger result_trg3 :res_land2 "<Take/Leave Products>"
        setTextLineTrigger result_trg4 :res_backd "Landing on Federation StarDock."
        send "qqq  z  n  l " & $pnum & "  *  *  z  n  z  n  *  z  q  t  n  z  l  1  *  q  q  z  n  p  s  h "
        pause
:res_baddd
        killalltriggers
    echo ANSI_12 "**Our planet is gone! Someone might be messing with us.*"
    if ($funky_counter < 4)
            goto :top_of_ore_swap
    else
        echo ANSI_12 "**I've tried this 3 times, something is definately going on. Check your status!*"
        send "? "
    end
    halt
:res_land2
    echo ANSI_10 "**We've landed and dropped our ore on planet #" & $pnum & "!*"
    pause
:res_backd
        killalltriggers
    gosub :PLAYER~quikstats
    waitOn "<Hardware Emporium> So what are you looking for (?)"
    getRnd $rand_wait 100 300
    killtrigger safety_delay 
    setDelayTrigger safety_delay :yet_more_lift_stuff $rand_wait
    pause
    :yet_more_lift_stuff
        setVar $msg ""
        setTextLineTrigger result_trg1 :swap_xport_notavail "That is not an available ship."
        setTextLineTrigger result_trg2 :swap_xport_badrange "only has a transport range of"
        setTextLineTrigger result_trg3 :swap_xport_security "SECURITY BREACH! Invalid Password, unable to link transporters."
        setTextLineTrigger result_trg4 :swap_xport_noaccess "Access denied!"
        setTextLineTrigger result_trg5 :swap_xport_xprtgood "Security code accepted, engaging transporter control."
        setTextLineTrigger result_trg6 :swap_pland_noplnet1 "Engage the Autopilot?"
        setTextLineTrigger result_trg7 :swap_pland_noplnet2 "That planet is not in this sector."
        setTextLineTrigger result_trg8 :swap_pland_noplnet3 "Invalid registry number, landing aborted."
        setTextLineTrigger result_trg9 :swap_pland_prodtakn "<Take all>"
        setTextLineTrigger result_trg0 :swap_pland_complete "Landing on Federation StarDock."
        send "qqq  z  n  "
        send "x    " & $shipnum & "    *    *    *   "
        send "l " & $pnum & "  *  *  z  n  z  n  *  z  q  a  *  q  q  z  n  "
        send "p  s  h "
        pause
    :swap_xport_notavail
        setVar $msg $msg & ANSI_12 & "*That ship is not available, using the original ship...*"
        pause
    :swap_xport_badrange
        setVar $msg $msg & ANSI_12 & "*That ship is too far away, using the original ship...*"
        pause
    :swap_xport_security
        setVar $msg $msg & ANSI_12 & "*That ship is passworded, using the original ship...*"
        pause
    :swap_xport_noaccess
        setVar $msg $msg & ANSI_12 & "*Cannot access that ship, using the original ship...*"
        pause
    :swap_xport_xprtgood
        setVar $msg $msg & ANSI_10 & "*Xport good!*"
        pause
    :swap_pland_noplnet1
        setVar $msg $msg & ANSI_12 & "*The planet has gone missing. Check your status!*"
        pause
    :swap_pland_noplnet2
        setVar $msg $msg & ANSI_12 & "*The planet has gone missing. Check your status!*"
        pause
    :swap_pland_noplnet3
        setVar $msg $msg & ANSI_12 & "*The planet has gone missing. Check your status!*"
        pause
    :swap_pland_prodtakn
        setVar $msg $msg & ANSI_10 & "*Products collected!*"
        pause
    :swap_pland_complete
            killalltriggers
        gosub :PLAYER~quikstats
        waitOn "<Hardware Emporium> So what are you looking for (?)"
        echo $msg
        halt
    pause
    halt
# -------------------------------------------------------------------
:pland_trg_1
    setVar $msg ANSI_12 & "**There are no planets in the StarDock sector!*"
    pause
:pland_trg_2
    setVar $msg ANSI_12 & "**That planet is not in the StarDock sector!*"
    pause
:pland_trg_3
    setVar $msg ANSI_10 & "**Products taken!*"
    pause
:pland_trg_4
    setVar $msg ANSI_10 & "**Fuel dropped!*"
    pause
:pland_trg_6
    setVar $msg ANSI_10 & "**Planet destroyed!*"
    pause
:pland_trg_5
    gosub :PLAYER~quikstats
    waitOn "<Hardware Emporium> So what are you looking for (?)"
        killalltriggers
    echo $msg
    halt
:doneDockKit
        echo #27 "[30D                        " #27 "[30D"
        halt

                include "source\bot_includes\player"
  include "source\bot_includes\switchboard"
include "source\module_includes\prompt"