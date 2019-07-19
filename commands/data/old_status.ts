    gosub :BOT~loadVars

    setVar $BOT~help[1] $BOT~tab&"Reports information about bot on subspace  "
    setVar $BOT~help[2] $BOT~tab&"        "
    setVar $BOT~help[3] $BOT~tab&"Special stats that are bot specific:        "
    setVar $BOT~help[4] $BOT~tab&"  - Planet #: Last planet landed on"
    setVar $BOT~help[5] $BOT~tab&"  - Team Name: What team name your bot respondeds to, if any"
    setVar $BOT~help[6] $BOT~tab&"  - Bot mode:  What mode your bot is currently running"
    setVar $BOT~help[7] $BOT~tab&"        "
    gosub :bot~helpfile

    loadvar $PLANET~PLANET
    loadvar $bot~mode
    loadvar $BOT~bot_team_name

 # ============================== QSS ==============================
:qss
:status
    gosub :PLAYER~quikstats
    setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
    setVar $startingLocation $PLAYER~CURRENT_PROMPT
    if ($BOT~mode = "General")
        if (($PLAYER~startingLocation = "Command") or ($PLAYER~startingLocation = "Citadel"))
            gosub :PLAYER~getInfo
            if ($PLAYER~NOFLIP)
                send "CQ"
            else
                send "C N 9 Q Q "
            end
            waiton "Computer command [TL="
            getText CURRENTLINE $timeLeft "Computer command [TL=" "]:"
        else
            setVar $igstat "Bad Prompt"
            setVar $timeLeft "Bad Prompt"
        end
    else
        setVar $igstat "Busy"
        setVar $timeLeft "Busy"        
    end

        send "'*"
    send "{" $bot~bot_name "}   --- Status Report ---*"
    send "     - Sector      = " $player~CURRENT_SECTOR "*"
    send "     - Prompt      = " $player~CURRENT_PROMPT "*"
    if ($player~unlimitedGame)
        send "     - Turns       = Unlimited*"
    else
        send "     - Turns       = " $player~TURNS "*"
    end
    send "     - Photons     = " $player~PHOTONS "*"
    send "     - Mode        = " $bot~mode "*"
    send "     - IG          = " $igstat "*"
    send "     - Ship        = " $player~SHIP_NUMBER "*"
    if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
        if ($PLANET = "0")
            send "     - Planet      = None*"
        else
            send "     - Planet      = " $PLANET "*"
        end
    else
        if ($planet~PLANET = "0")
            send "     - Last Planet = None*"
        else
            send "     - Last Planet = " $PLANET "*"
        end
    end
    if ($bot~bot_team_name = $bot~bot_name)
        send "     - Team        = None*"
    else
        send "     - Team        = " $bot_team_name "*"
    end
    if ($timeLeft = "00:00:00")
        send "     - Time Left   = Unlimited*"
    else
        send "     - Time Left   = " & $timeLeft & "*"
    end
    if ($player~NOFLIP = 0)
        send "     - CN9 Check   = Reset To SPACE*"
    end
    send "*"
    goto :wait_for_command
# ============================== END GET STATUS (STATUS) SUB ==============================

# ============================== END QSS SUB ==============================



:wait_for_command
halt

:killthetriggers
    killalltriggers
return

:removeFigFromData
    getSectorParameter $target "FIGSEC" $check
    if ($check = TRUE)
        getSectorParameter 2 "FIG_COUNT" $figCount
        setSectorParameter 2 "FIG_COUNT" ($figCount-1)
    end
    setSectorParameter $target "FIGSEC" FALSE
return
:addFigToData
    setSectorParameter $target "FIGSEC" TRUE
return

# includes:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
