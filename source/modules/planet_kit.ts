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
    gosub :PLAYER~current_prompt
    setVar $PROMPT~validPrompts "Citadel"
    setVar $startingLocation $PLAYER~current_prompt
    setVar $PROMPT~startingLocation $startingLocation
    gosub :PROMPT~checkStartingPrompt

    loadVar $psimac_corp_limpet_drop_amt
    if ($psimac_corp_limpet_drop_amt < 1)
         setVar $psimac_corp_limpet_drop_amt 3
         saveVar $psimac_corp_limpet_drop_amt
    end
    loadVar $psimac_corp_armid_drop_amt
    if ($psimac_corp_armid_drop_amt < 1)
         setVar $psimac_corp_armid_drop_amt 1
         saveVar $psimac_corp_armid_drop_amt
    end
    loadVar $psimac_corp_ftr_drop_amt
    if ($psimac_corp_ftr_drop_amt < 1)
         setVar $psimac_corp_ftr_drop_amt 1
         saveVar $psimac_corp_ftr_drop_amt
    end
    setTextLineTrigger getp :getp "Planet #"
    send "q*c "
    pause
    :getp
        getWord CURRENTLINE $PLANET 2
        stripText $PLANET "#"
        waitOn "Citadel command (?="
    :print_the__planet_menu
    :planet_menu_without_clear
        echo "**"
        echo ANSI_15 "                       -=( " ANSI_14 "Psi Planet Macros" ANSI_15 " )=-  *"
        echo ANSI_5  " -----------------------------------------------------------------------------*"
        echo ANSI_9 #27&"[35m<"&#27&"[32m1"&#27&"[35m> " & ANSI_14 &"Lay 1 personal limpet" & ANSI_9 & ", land         " & ANSI_11 &#27&"[35m<"&#27&"[32m5"&#27&"[35m> " & ANSI_14 & "Holoscan" & ANSI_9 & ", land*"
        echo #27&"[35m<"&#27&"[32m2"&#27&"[35m> " & ANSI_14 & "Lay " & $psimac_corp_limpet_drop_amt & " corporate " & ANSI_11 & #27&"[35m<"&#27&"[32mL"&#27&"[35m>" & ANSI_14 & "impet(s)" & ANSI_9 & ", land   " & ANSI_11 #27&"[35m<"&#27&"[32m6"&#27&"[35m> " & ANSI_14 & "Lift attack*"
        echo #27&"[35m<"&#27&"[32m3"&#27&"[35m> " & ANSI_14 & "Lay " & $psimac_corp_armid_drop_amt & " corporate " & ANSI_11 & #27&"[35m<"&#27&"[32mA"&#27&"[35m>" & ANSI_14 & "rmid(s)" & ANSI_9 & ", land    " & ANSI_11 #27&"[35m<"&#27&"[32m7"&#27&"[35m> " & ANSI_14 & "Drop " & $psimac_corp_ftr_drop_amt & " corporate " & ANSI_11 & #27&"[35m<"&#27&"[32mF"&#27&"[35m>" & ANSI_14 & "ighter(s)" & ANSI_9 & "*"
        echo #27&"[35m<"&#27&"[32m4"&#27&"[35m> " & ANSI_14 & "Density scan" & ANSI_9 & ", land             " & ANSI_11 & "     " & #27&"[35m<"&#27&"[32m8"&#27&"[35m> " & ANSI_14 & "Launch a mine disrupter" & ANSI_9 & ", land*"
        echo         "*"
        echo #27&"[35m<"&#27&"[32mB"&#27&"[35m> " & ANSI_14 & "Get Xport List" & ANSI_9 & ", land                " ANSI_11 #27&"[35m<"&#27&"[32mE"&#27&"[35m> " & ANSI_14 & "Toggle IG" & ANSI_9 & ", land " ANSI_11 "*"
        echo #27&"[35m<"&#27&"[32mC"&#27&"[35m> " & ANSI_14 & "Xport into ship" & ANSI_9 & ", land               " ANSI_11 #27&"[35m<"&#27&"[32mG"&#27&"[35m> " & ANSI_14 & "Swap Planets*"
        echo #27&"[35m<"&#27&"[32mD"&#27&"[35m> " & ANSI_14 & "Get sector planet list" & ANSI_9 & ", land " ANSI_11 "*"
        echo ANSI_5  " -----------------------------------------------------------------------------**"
    :getPlanetMacroInput
        echo ANSI_10 "Your choice?*"
        getConsoleInput $chosen_option SINGLEKEY
        upperCase $chosen_option
        killalltriggers
    :process_command2
        if ($chosen_option = "1")
            goto :perslimp
        elseif ($chosen_option = "2")
            goto :corplimp
        elseif ($chosen_option = "3")
            goto :corparm
        elseif ($chosen_option = "4")
            gosub :dscan2
            halt
        elseif ($chosen_option = "5")
            gosub :hscan
            halt
        elseif ($chosen_option = "6")
            goto :lifta
        elseif ($chosen_option = "7")
            goto :dropfig
        elseif ($chosen_option = "8")
            gosub :PLAYER~quikstats
            if ($PLAYER~MINE_DISRUPTORS > 0)
                getInput $test "Sector to disrupt: "
                isNumber $numtest $test
                if ($numtest < 1)
                    echo ANSI_12 "**Bad sector number!*"
                    goto :planetMacMenu
                end
                if ($test > SECTORS) OR ($test <= 10)
                    echo ANSI_12 "**Bad sector number!*"
                    goto :planetMacMenu
                end
                send "q q c  w  y" & $test & "*  *  *  q  l " $PLANET "* c s*  "
                waitOn "Computer command [TL="
                waitOn "Citadel command (?=help)"
                halt
            else
                send "'Out of mine disruptors!*"
                waitOn "Citadel command (?=help)"
                halt
            end
        elseif ($chosen_option = "B")
            send "q q  x* *    l j"&#8&$PLANET&"* c @"
            waitOn "Average Interval Lag:"
            halt
        elseif ($chosen_option = "C")
            # Get and check input
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
            setTextLineTrigger tdet_trg1 :txport_notavail2 "That is not an available ship."
            setTextLineTrigger tdet_trg2 :txport_badrange2 "only has a transport range of"
            setTextLineTrigger tdet_trg3 :txport_security2 "SECURITY BREACH! Invalid Password, unable to link transporters."
            setTextLineTrigger tdet_trg4 :txport_noaccess2 "Access denied!"
            setTextLineTrigger tdet_trg5 :txport_xprtgood2 "Security code accepted, engaging transporter control."
            setTextTrigger tdet_trg6 :txport_go_ahead2 "Average Interval Lag:"
            send "q q  x    " & $shipnum & "    *    *    *    l j"&#8&$PLANET&"*  @"
            pause
            goto :print_the__planet_menu
            :txport_notavail2
                setVar $msg ANSI_12 & "**That ship is not available.*"
                pause
            :txport_badrange2
                 setVar $msg ANSI_12 & "**That ship is too far away.*"
                 pause
            :txport_security2
                 setVar $msg ANSI_12 & "**That ship is passworded.*"
                 pause
            :txport_noaccess2
                 setVar $msg ANSI_12 & "**Cannot access that ship.*"
                 pause
            :txport_xprtgood2
                 setVar $msg ANSI_10 & "**Xport good!*"
                 pause
            :txport_go_ahead2
                gosub :PLAYER~quikstats
                if ($PLAYER~CURRENT_PROMPT = "Planet")
                    send "c "
                end
                killalltriggers
                echo $msg
                halt
        elseif ($chosen_option = "D")
            send "q q  lj"&#8&$PLANET&"* c @"
            waitOn "Average Interval Lag:"
            halt
        elseif ($chosen_option = "E")
            send "q q b z y  l j"&#8&$PLANET&"* c @"
            waitOn "Average Interval Lag:"
            halt
        elseif ($chosen_option = "G")
            getInput $test "Planet to Swap to:: "
            isNumber $numtest $test
            if ($numtest < 1)
                  echo ANSI_12 "**Not a Planet Number!*"
                  goto :planetMacMenu
            else
                setvar $psimac_planet_swap "q q l "&$test&"*"&$PLANET&"* c"
                send $psimac_planet_swap
            end
            halt
        elseif ($chosen_option = "F")
            getInput $test "Fighters to deploy: "
            isNumber $numtest $test
            if ($numtest < 1)
                echo ANSI_12 "**Bad fighter count!*"
            elseif ($test <= 0)
                setVar $psimac_corp_ftr_drop_amt 1
                saveVar $psimac_corp_ftr_drop_amt
            else
                setVar $psimac_corp_ftr_drop_amt $test
                saveVar $psimac_corp_ftr_drop_amt
            end
            goto :print_the__planet_menu
        elseif ($chosen_option = "L")
            getInput $test "Limpets to deploy: "
            isNumber $numtest $test
            if ($numtest < 1)
                echo ANSI_12 "**Bad limpet count!*"
            elseif ($test > 250)
                setVar $psimac_corp_limpet_drop_amt 250
                saveVar $psimac_corp_limpet_drop_amt
            elseif ($test <= 0)
                setVar $psimac_corp_limpet_drop_amt 1
                saveVar $psimac_corp_limpet_drop_amt
            else
                setVar $psimac_corp_limpet_drop_amt $test
                saveVar $psimac_corp_limpet_drop_amt
            end
            goto :print_the__planet_menu
        elseif ($chosen_option = "A")
            getInput $test "Armids to deploy: "
            isNumber $numtest $test
            if ($numtest < 1)
                echo ANSI_12 "**Bad armid count!*"
            elseif ($test > 250)
                setVar $psimac_corp_armid_drop_amt 250
                saveVar $psimac_corp_armid_drop_amt
            elseif ($test <= 0)
                setVar $psimac_corp_armid_drop_amt 1
                saveVar $psimac_corp_armid_drop_amt
            else
                setVar $psimac_corp_armid_drop_amt $test
                saveVar $psimac_corp_armid_drop_amt
            end
            goto :print_the__planet_menu
        else
            halt
        end
:perslimp
    gosub :PLAYER~quikstats
    if ($PLAYER~LIMPETS > 0)
        send "q q z n h21  *  p z n n * l " $PLANET "* c s* "
        setVar $depType "limpets"
        setTextLineTrigger toomanypl :toomany "!  You are limited to "
        setTextLineTrigger plclear :plclear "Done. You have "
        setTextLineTrigger enemypl :noperdown "These mines are not under your control."
        pause
    else
        send "'Out of limpets!*"
        waitOn "Citadel command (?=help)"
        halt
    end
:plclear
    killalltriggers
    waitOn "Citadel command (?=help)"
    send "s* "
    setTextLineTrigger perdown :perdown "(Type 2 Limpet) (yours)"
    setTextLineTrigger noperdown :noperdown "Citadel treasury contains"
    pause
:perdown
    killalltriggers
    send "'Personal Limpet Deployed!*"
    waitOn "Citadel command (?=help)"
    halt
:noperdown
    killalltriggers
    send "'Sector already has enemy limpets present!*"
    waitOn "Citadel command (?=help)"
    halt
    :corplimp
    gosub :PLAYER~quikstats

    if ($PLAYER~LIMPETS > 0)
        send "q q z n h2z" & $psimac_corp_limpet_drop_amt & "* z c *  l " $PLANET "* c s* "
        if ($psimac_corp_limpet_drop_amt > 1)
            setVar $depType "Limpets"
        else        
            setVar $depType "Limpet"    
        end
        setTextLineTrigger toomanycl :toomany "!  You are limited to "
        setTextLineTrigger clclear :clclear "Done. You have "
        setTextLineTrigger enemycl :nocldown "These mines are not under your control."
        setTextLineTrigger notenoughcl :notenough "You don't have that many mines available."
        pause
    else
        send "'Out of limpets!*"
        waitOn "Citadel command (?=help)"
        halt
    end
:clclear
    killalltriggers
    waitOn "Citadel command (?=help)"
    send "s* "
    setTextLineTrigger cldown :cldown "(Type 2 Limpet) (belong to your Corp)"
    setTextLineTrigger nocldown :nocldown "Citadel treasury contains"
    pause
:cldown
    killalltriggers
    send "'"&$psimac_corp_limpet_drop_amt&" Corporate "&$depType&" Deployed!*"
    waitOn "Citadel command (?=help)"
    halt
:nocldown
    killalltriggers
    send "'Sector already has enemy limpets present!*"
    waitOn "Citadel command (?=help)"
    halt
    #lays a corp armid
    :corparm
    gosub :PLAYER~quikstats
    if ($PLAYER~ARMIDS > 0)
        if ($psimac_corp_armid_drop_amt > 1)
            setVar $depType "Armids"
        else
            setVar $depType "Armid"
        end
        send "q q z n h1z" & $psimac_corp_armid_drop_amt & " * z c *  l " $PLANET "* c s* "
        setTextLineTrigger toomanya :toomany "!  You are limited to "
        setTextLineTrigger aclear :aclear "Done. You have "
        setTextLineTrigger enemya :noadown "These mines are not under your control."
        setTextLineTrigger notenoughca :notenough "You don't have that many mines available."
        pause
    else
        send "'Out of armids!*"
        waitOn "Citadel command (?=help)"
        halt
    end
:aclear
    killalltriggers
    waitOn "Citadel command (?=help)"
    send "s* "
    setTextLineTrigger adown :adown "(Type 1 Armid) (belong to your Corp)"
    setTextLineTrigger noadown :noadown "Citadel treasury contains"
    pause
:adown
    killalltriggers
    send "'"&$psimac_corp_armid_drop_amt&" Corporate"&$depType&" Deployed!*"
    waitOn "Citadel command (?=help)"
    halt
:noadown
    killalltriggers
    send "'Sector already has enemy armids present!*"
    waitOn "Citadel command (?=help)"
    halt
:dscan2
    send "q q z n sdzn l " $PLANET "* c  "
    waitOn "<Enter Citadel>"
    waitOn "Citadel command (?=help)"
    gosub :MAP~displayAdjacentGridAnsi
return
:hscan
    send "q q z n s hzn* l " $PLANET "*  c  "
    waitOn "<Enter Citadel>"
    waitOn "Citadel command (?=help)"
    gosub :MAP~displayAdjacentGridAnsi
return
:lifta
    send "q q z n a y y " $SHIP_MAX_ATTACK "* * z n q z n  l " $PLANET "*  m  *** c s* @"
    waitOn "Average Interval Lag:"
    goto :getPlanetMacroInput
:dropfig
    gosub :PLAYER~quikstats
    if ($FIGHTERS > 0)
        send " q q f z" & $psimac_corp_ftr_drop_amt & "* z c d *  l " $PLANET "* c s* "
        if ($psimac_corp_ftr_drop_amt > 1)
            setVar $depType "Fighters"
        else
            setVar $depType "Fighter"
        end
        setTextLineTrigger toomanyfig :toomany "Too many fighters in your fleet!"
        setTextLineTrigger figclear :figclear " fighter(s) in close support."
        setTextLineTrigger enemyfig :nofigdown "These fighters are not under your control."
        pause
    else
         send "'Out of fighters!*"
         waitOn "Citadel command (?=help)"
         halt
    end
:figclear
    killalltriggers
    waitOn "Citadel command (?=help)"
    send "s* "
    setTextLineTrigger figdown :figdown "(belong to your Corp) [Defensive]"
    setTextLineTrigger nofigdown :nofigdown "Citadel treasury contains"
    pause
:figdown
    killalltriggers
    send "'"&$psimac_corp_ftr_drop_amt&" Corporate "&$depType&" Deployed!*"
    setVar $target $PLAYER~CURRENT_SECTOR
    gosub :player~addfigtodata
    waitOn "Citadel command (?=help)"
    halt
:nofigdown
    killalltriggers
    send "'Sector already has enemy fighters present!*"
    waitOn "Citadel command (?=help)"
    halt
:toomany
    killalltriggers
    waitOn "<Scan Sector>"
    waitOn "Citadel command (?=help)"
    clientMessage "Ship cannot carry that many " & $depType & "!"
    clientMessage "No " & $depType & " were deployed!"
    halt
:notenough
    killalltriggers
    waitOn "<Scan Sector>"
    waitOn "Citadel command (?=help)"
    clientMessage "Ship doesn't have that many " & $depType & "!"
    clientMessage "No " & $depType & " were deployed!"
    halt
:donePsiMacs
        echo #27 "[30D                           " #27 "[30D"
        halt
                        include "source\bot_includes\player"
  include "source\bot_includes\switchboard"
include "source\module_includes\prompt"
include "source\bot_includes\map"