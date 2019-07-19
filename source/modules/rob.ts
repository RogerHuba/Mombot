    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadvar $self_command
    loadVar $stardock
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 

:rob
    gosub :PLAYER~quikstats
    setVar $bot~validPrompts "Citadel Command"
    setVar $bot~startingLocation $PLAYER~CURRENT_PROMPT
    if (($PLAYER~TURNS = 0) and ($PLAYER~unlimitedGame = FALSE))
            send "'{" $SWITCHBOARD~bot_name "} - I have no turns*"
            goto :wait_for_command
        end
    gosub :bot~checkStartingPrompt
    cutText $PLAYER~ALIGNMENT $neg_ck 1 1
    stripText $PLAYER~ALIGNMENT "-"
    if ((($PLAYER~ALIGNMENT < 100) and ($neg_ck = "-")) OR ($neg_ck <> "-"))
        send "'{" $SWITCHBOARD~bot_name "} - Need -100 Alignment Minimum*"
        goto :portrm_done
    end
    if ($bot~startingLocation = "Citadel")
        send "q"
        gosub :PLANET~getPlanetInfo
        send "q"
    end
    setVar $second_mega 0
    setvar $leftover_cash 0
    setVar $mega_min 2970000
    setVar $mega_max 5760000
    send "p r * r"
    setTextLineTrigger fake :port_fake "Busted!"
    setTextLinetrigger mega :port_ok "port has in excess of"
    pause
:port_fake
    gosub :killthetriggers
    if ($bot~startingLocation = "Citadel")
        gosub :PLANET~landingSub
    end
    setSectorParameter $PLAYER~CURRENT_SECTOR "BUSTED" TRUE
    send "'{" $SWITCHBOARD~bot_name "} - Fake Busted*"
    goto :portrm_done
:port_ok
    gosub :killthetriggers
    setVar $rob ($rob_factor*$PLAYER~EXPERIENCE)
    getWord CURRENTLINE $port_cash 11
    stripText $port_cash ","
    if ($port_cash < $mega_min)
        if ($isMega)
            setVar $port_cash (($port_cash*10)/9)
            setVar $mega_short (3300000 - $port_cash)
            send "0* "
            if ($bot~startingLocation = "Citadel")
                gosub :PLANET~landingSub
            end
            send "'{" $SWITCHBOARD~bot_name "} - Port is short " $mega_short " credits*"
            goto :portrm_done
        else
            goto :do_rob        
        end
    elseif (($MBBS = TRUE) AND ($isMega = FALSE))
        send "'{" $SWITCHBOARD~bot_name "} - " $port_cash " credits on port.  Port is ready for Mega Rob**"
        if ($bot~startingLocation = "Citadel")
            gosub :PLANET~landingSub
        end
        goto :portrm_done
    else
        if ($isMega)
            setVar $actual_cash $port_cash
            multiply $actual_cash 10
            divide $actual_cash 9
            setVar $mega_cash $actual_cash
            if ($actual_cash >= 3300000)
                :mega_loop
                    if ($mega_cash > 6400000)
                        subtract $mega_cash 3300000
                        add $leftover_cash 3300000
                        setVar $second_mega 1
                        goto :mega_loop
                    end
                    if ($second_mega = 0)
                        send $actual_cash "*"
                    elseif ($second_mega = 1)
                        send $mega_cash "*"
                        setVar $actual_cash $mega_cash
                    end
            end
            setTextLineTrigger mega_suc :port_suc "Success!"
            setTextLineTrigger mega_bust :port_bust "Busted!"
            pause
        else
            goto :do_rob
        end
    end
:port_bust
    gosub :killthetriggers
    if ($bot~startingLocation = "Citadel")
        gosub :PLANET~landingSub
    end
    setSectorParameter $PLAYER~CURRENT_SECTOR "BUSTED" TRUE
    send "'<" & $subspace & ">[Busted:" & $PLAYER~CURRENT_SECTOR & "]<" & $subspace & ">*"
    goto :portrm_done
:port_suc
    gosub :killthetriggers
    if ($bot~startingLocation = "Citadel")
        gosub :PLANET~landingSub
        send "tt" $actual_cash "*"
    end
    send "'{" $SWITCHBOARD~bot_name "} - Success! - " $actual_cash " credits robbed*"
    if ($second_mega = TRUE)
        send "'{" $SWITCHBOARD~bot_name "} - There are " $leftover_cash " credits left for a second mega*"
    end
:portrm_done
    setVar $isMega FALSE
    goto :wait_for_command
:do_rob
    setVar $port_cash (($port_cash*10)/9)
    if ($port_cash < $rob)
        setVar $rob $port_cash
    end
    send $rob "*"
    setVar $actual_cash $rob
    setTextLineTrigger port_empty :port_suc "Maybe some other day, eh?"
    setTextLineTrigger mega_suc :port_suc "Success!"
    setTextLineTrigger port_bust :port_bust "Busted!"
    pause


:wait_for_command
halt

:killthetriggers
    killalltriggers
return

# includes:
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
