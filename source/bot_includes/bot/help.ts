#####==============================================  BOT HELP SECTION =================================================#####
:command_list
    setVar $SWITCHBOARD~helpList TRUE
    setVar $helpList TRUE
    if ($BOT~parm1 = 0)
        gosub :PLAYER~quikstats
        setVar $SWITCHBOARD~message "  --------------Mind ()ver Matter Bot Help Categories------------*"
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&"                          Version: "&$BOT~major_version&"_"&$BOT~minor_version&"*"
                setVar $SWITCHBOARD~message $SWITCHBOARD~message&" *"
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&"                [OFFENSE]|[DEFENSE]|[DATA]|[CASHING]*"
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&"                     [RESOURCE]|[GRID]|[GENERAL]*"
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&" *"
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  ---------------------------------------------------------------*"
    else
        getFileList $commandList "scripts\MomBot\Commands\"&$BOT~parm1&"\*.cts"
        getFileList $modeList "scripts\MomBot\Modes\"&$BOT~parm1&"\*.cts"
        setVar $maxStringLength 34
        setVar $paddingDashes "                                 "
        upperCase $BOT~parm1
        setVar $SWITCHBOARD~message "  --Mind ()ver Matter Bot Commands--*"
        getLength "-="&$BOT~parm1&"=-" $comLength
        setVar $sideLength (($maxStringLength-$comLength)/2)
        cutText $paddingDashes $leftPad 1 $sideLength
        cutText $paddingDashes $rightPad 1 (($maxStringLength-$comLength)-$sideLength)
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&" |"&$leftPad&"-="&$BOT~parm1&"=-"&$rightPad&"|*"
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&" |----------------------------------|*"
            setVar $i 1
            upperCase $currentList
            while ($i <= $commandList)
                setVar $tempCommand $commandList[$i]&"###"
                getWord $currentList $next ($i+1)
                getWord $currentList $next2 ($i+2)
                stripText $tempCommand "scripts\MomBot\Commands\"&$BOT~parm1&"\"
                stripText $tempCommand ".cts###"
                upperCase $tempCommand
                cutText $tempCommand&" " $hidden 1 1
                if ($hidden = "_")
                    getLength $tempCommand $tempLength
                    if (($SWITCHBOARD~self_command = TRUE) AND ($tempLength > 1))
                        cutText $tempCommand $tempCommand 2 9999
                        setVar $currentList $currentList&" [<><>HIDDEN<><>]"&$tempCommand&" "
                    end
                else
                    getWordPos $currentList $pos " "&$tempCommand&" "
                    if ($pos <= 0)
                        setVar $currentList $currentList&" "&$tempCommand&" "
                    end
                end
                add $i 1
            end
            setVar $SWITCHBOARD~message $SWITCHBOARD~message&" |           -=Commands=-           |*"
            setVar $commandCount 0
            setVar $bufferCount 0
            gosub :bufferList
        if ($modelist > 0)
            setVar $SWITCHBOARD~message $SWITCHBOARD~message&" |            -=Modes=-             |*"
            setVar $currentList " "
            setVar $i 1
            while ($i <= $modelist)
                setVar $tempCommand $modelist[$i]&"###"
                stripText $tempCommand "scripts\MomBot\Modes\"&$BOT~parm1&"\"
                stripText $tempCommand ".cts###"
                upperCase $tempCommand
                cutText $tempCommand&" " $hidden 1 1
                if ($hidden = "_")
                    getLength $tempCommand $tempLength
                    if (($SWITCHBOARD~self_command = TRUE) AND ($tempLength > 1))
                        cutText $tempCommand $tempCommand 2 9999
                        setVar $currentList $currentList&" [<><>HIDDEN<><>]"&$tempCommand&" "
                    end
                else
                    setVar $currentList $currentList&" "&$tempCommand&" "
                end
                add $i 1
            end
            gosub :bufferList
        end
        setVar $SWITCHBOARD~message $SWITCHBOARD~message&" |----------------------------------|*"
    end
    #if ($SWITCHBOARD~self_command <> TRUE)
    if (($SWITCHBOARD~self_command = true) or ($BOT~silent_running = TRUE))

    else
        setVar $SWITCHBOARD~self_command 2
    end
    gosub :SWITCHBOARD~switchboard
goto :BOT~wait_for_command
:bufferList
    setVar $i 1
    getWord $currentList $test $i "[<><>NONE<><>]"
    setVar $paddingDashes "                                "
    while ($test <> "[<><>NONE<><>]")
        setVar $tempCommand $test
        setVar $tempCommandHidden FALSE
        setVar $nextHidden FALSE
        setVar $next2Hidden FALSE
        getWord $currentList $next ($i+1)
        getWord $currentList $next2 ($i+2)
        getWordPos $tempCommand $pos "[<><>HIDDEN<><>]"
        if ($pos > 0)
            stripText $tempCommand "[<><>HIDDEN<><>]"
            setVar $tempCommandHidden TRUE
            setVar $tempCommand2 ANSI_14&$tempCommand&ANSI_15
        else
            setVar $tempCommand2 $tempCommand
        end
        if ($next <> 0)
            getWordPos $next $pos "[<><>HIDDEN<><>]"
            stripText $next "[<><>HIDDEN<><>]"
            if ($pos > 0)
                setVar $nextHidden TRUE
                setVar $tempCommand2 $tempCommand2&"   "&ANSI_14&$next&ANSI_15
            else
                setVar $tempCommand2 $tempCommand2&"   "&$next
            end
            setVar $tempCommand $tempCommand&"   "&$next
            add $i 1
        end
        if ($next2 <> 0)
            getWordPos $next2 $pos "[<><>HIDDEN<><>]"
            stripText $next2 "[<><>HIDDEN<><>]"
            if ($pos > 0)
                setVar $next2Hidden TRUE
                setVar $tempCommand2 $tempCommand2&"   "&ANSI_14&$next2&ANSI_15
            else
                setVar $tempCommand2 $tempCommand2&"   "&$next2
            end
            setVar $tempCommand $tempCommand&"   "&$next2
            add $i 1
        end
        getLength $tempCommand $comLength
        upperCase $tempCommand
        setVar $sideLength (($maxStringLength-$comLength)/2)
        cutText $paddingDashes $leftPad 1 $sideLength
        cutText $paddingDashes $rightPad 1 (($maxStringLength-$comLength)-$sideLength)
        if ($SWITCHBOARD~self_command = TRUE)
            setVar $SWITCHBOARD~message $SWITCHBOARD~message&" |"&$leftPad&$tempCommand2&$rightPad&"|*"
        else
            setVar $SWITCHBOARD~message $SWITCHBOARD~message&" |"&$leftPad&$tempCommand&$rightPad&"|*"  
        end
        add $commandCount 1
        add $i 1
        getWord $currentList $test $i "[<><>NONE<><>]"
    end
return
:echo_help
    echo "*"
    echo ansi_13 "  ----------------" ansi_14 "Mind " ansi_4 "()" ansi_14 "ver Matter Bot Help Categories" ansi_13 "---------------*"
        echo ansi_13 "                            Version: "&$BOT~major_version&"."&$BOT~minor_version&"*"
        echo ansi_13 "                  [OFFENSE]|[DEFENSE]|[DATA]|[CASHING]*"
    echo ansi_13 "                      [RESOURCE]|[GRID]|[GENERAL]    *"
    echo ansi_13 "  ------------------------------"&ANSI_14&"Hot Keys"&ANSI_13&"------------------------------*"
    gosub :MENUS~echoHotKeys
    echo ansi_13 "  ------------------------------"&ANSI_14&"Daemons"&ANSI_13&"-------------------------------*"
    getFileList $daemonList "scripts\MomBot\Daemons\*.cts"
    if ($daemonList > 0)
        setVar $paddingDashes "                                 "
        setVar $currentList ""
        setVar $maxStringLength 68
        setVar $i 1
        while ($i <= $daemonList)
            setVar $tempCommand $daemonList[$i]&"###"
            stripText $tempCommand "scripts\MomBot\Daemons\"&$BOT~parm1&"\"
            stripText $tempCommand ".cts###"
            setVar $currentList $currentList&" "&$tempCommand&" "
            add $i 1
        end
        setVar $SWITCHBOARD~message ""
        gosub :bufferList
        echo $SWITCHBOARD~message
        echo ansi_13 "  --------------------------------------------------------------------***"
    end
    goto :BOT~wait_for_command
:ss_help
    setVar $helpString "'*"
    setVar $helpString $helpString&"  -----------------Mind ()ver Matter Bot Help Categories--------------*"
    setVar $helpString $helpString&"                              Version: "&$BOT~major_version&"."&$BOT~minor_version&"*"
        setVar $helpString $helpString&"                   [OFFENSE]|[DEFENSE]|[DATA]|[CASHING]*"
    setVar $helpString $helpString&"                        [RESOURCE]|[GRID]|[GENERAL]    *"
    setVar $helpString $helpString&"  --------------------------------------------------------------------**"
    send $helpString
    goto :BOT~wait_for_command
# ============================== END HELP FOR COMMANDS SUB ==============================
