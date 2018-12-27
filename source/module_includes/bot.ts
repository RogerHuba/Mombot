:checkStartingPrompt
    if ($PLAYER~CURRENT_PROMPT = "0")
        gosub :PLAYER~current_prompt
    end
    getWordPos " "&$validPrompts&" " $pos $PLAYER~CURRENT_PROMPT
    if ($pos <= 0)
        setVar $SWITCHBOARD~message "Invalid starting prompt: ["&$PLAYER~CURRENT_PROMPT&"]. Valid prompt(s) for this command: ["&$validPrompts&"]*"
        gosub :SWITCHBOARD~switchboard
        halt
    end
return

:loadVars
    loadVar $mode
    loadVar $command 
    loadVar $SWITCHBOARD~bot_name
    setVar $bot_name $SWITCHBOARD~bot_name
    loadvar $planet~planet_file
    loadvar $ship~cap_file
    loadVar $user_command_line 
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadVar $parm4
    loadVar $parm5
    loadVar $parm6
    loadVar $parm7
    loadVar $parm8
    loadVar $bot_turn_limit
    loadVar $PLAYER~unlimitedGame
    loadVar $MAP~stardock
    loadVar $silent_running
    loadVar $botIsDeaf
    loadvar $switchboard~self_command
    loadvar $planet~planet

    setArray $help 60
    setVar $help 60
    setVar $TAB "     "

return

:help_file
    setVar $help_file "scripts\MOMBot\Help\"&$command&".txt"
    fileExists $doesHelpFileExist $help_file

    if ($doesHelpFileExist)
        setVar $i 1 
        read $help_file $help_line ($i+4)
        while ($help_line <> EOF)
            #echo $help[$i]&"<->"&$help_line&"*"
            if ($help[$i] <> $help_line)
                goto :write_new_help_file
            end
            add $i 1
            read $help_file $help_line ($i+4)
        end
        if (($help[($i + 1)] <> "0") OR (($help[($i + 2)] <> "0")))
            goto :write_new_help_file
        end
        return
    end
    :write_new_help_file
        delete $help_file
        setvar $i 1
        getLength $command $length
        setVar $spaces "                                            "
        setVar $stars "---------------------------------------------"
        setVar $pos ($length)
        cutText $stars $border 1 $pos
        setVar $pos ((50-($length+10))/2)
        cutText $spaces $center 1 $pos
        write $help_file "                     "
        write $help_file "   "
        write $help_file $center&"<<<< "&$command&" >>>>" 
        write $help_file "   "
        while ($i <= $help)
            if ($help[$i] = "0")
                goto :done_help_file
            end
            write $help_file $help[$i]
            add $i 1
        end
        :done_help_file
             setVar $SWITCHBOARD~message "Writing text file for "&$command&" in help directory.*"
             gosub :SWITCHBOARD~switchboard
return

:banner
    setVar $SWITCHBOARD~message $script_title&" starting up!*"
    gosub :SWITCHBOARD~switchboard
return

:disconnect_triggers
    setTextTrigger      pause   :pausing        "Planet command (?="
    setTextTrigger      pause2  :pausing        "Computer command ["
    setTextTrigger      pause3  :pausing        "Corporate command ["
return

:pausing
    killAllTriggers
    echo ANSI_14 "*[["&ANSI_15&$script_title&" paused. To restart, re-enter citadel prompt"&ANSI_14&"]]*"&ANSI_7
    setTextTrigger restart :restarting "Citadel command ("
    pause
    :restarting
    killAllTriggers
    echo ANSI_14 "*[[" ANSI_15 "Alien Hunter restarted" ANSI_14 "]]*" ANSI_7
    goto :restart



:menu

addMenu "" "ScriptMenu" ANSI_6&"["&ANSI_14&"Settings"&ANSI_6&"]"&ANSI_7 "." "" "Main" FALSE
setvar $i 1
while ($i <= $menu)
    if (($menu[$i] <> "0") and ($menu[$i] <> ""))
        setvar $display_menu $menu[$i]
        replacetext $menu[$i] " " "_"
        addMenu "ScriptMenu" $menu[$i]        ANSI_6&"["&ANSI_15&$display_menu&ANSI_6&"]                                 "&ANSI_7 "A" :menu_set         "" FALSE
        setMenuHelp $menu[$i] $menu[$i][1]
    end
    add $i 1
end
openMenu "ScriptMenu"


:menu_set
    pause
    openMenu "Menu"

return