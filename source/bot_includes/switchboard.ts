#requires $bot_name
#requires $self_command
#requires $message


:switchboard
    loadvar $BOT~botIsDeaf
    
    setVar $MSG_Header_Echo     (ANSI_9 & "{"&ANSI_14&$bot_name&ANSI_9&"} " & ANSI_15)
    setVar $MSG_Header_SS_1     ("'{"&$bot_name&"} - ")
    setVar $MSG_Header_SS_2     ("'*{"&$bot_name&"} - *")
    if ($message <> "")
        killalltriggers
        if ($self_command > 0)
            setVar $length 0
        else
            getLength $bot_name $length
        end
        setVar $i 1
        setVar $spacing ""
        getWordPos " "&$BOT~user_command_line&" " $isBroadcast " ss "
        getWordPos " "&$BOT~user_command_line&" " $isSilent " silent "

        if ($self_command <> 0)
            #echo "*[self command:"&$self_command&"]*"
            if ($bot~command <> "help")
                if (($self_command > 1) or (($self_command = 1) and (($bot~silent_running <> true) and ($isSilent <= 0))))
                    striptext $message ANSI_1
                    striptext $message ANSI_2
                    striptext $message ANSI_3
                    striptext $message ANSI_4
                    striptext $message ANSI_5
                    striptext $message ANSI_6
                    striptext $message ANSI_7
                    striptext $message ANSI_8
                    striptext $message ANSI_9
                    striptext $message ANSI_10
                    striptext $message ANSI_11
                    striptext $message ANSI_12
                    striptext $message ANSI_13
                    striptext $message ANSI_14
                    striptext $message ANSI_15
                    if ($helpList <> TRUE)
                        #striptext $message "    "
                    end
                end
            end
            while ($i <= ($length))
                setVar $spacing $spacing&" "
                add $i 1
            end

            setVar $new_message ""
            setVar $message_line ""
            replaceText $message "**" "{END_OF_LINE}"
            replaceText $message "*"  "{END_OF_LINE}"
            getText ("{START_OF_MESSAGE}"&$message) $message_line "{START_OF_MESSAGE}" "{END_OF_LINE}"
            while ($message_line <> "")
                setVar $new_message $new_message&$spacing&$message_line&"*"
                getLength ("{START_OF_MESSAGE}"&$message_line&"{END_OF_LINE}") $cutlength
                cutText ("{START_OF_MESSAGE}"&$message&"     ") $message ($cutlength+1) 99999
                getText ("{START_OF_MESSAGE}"&$message) $message_line "{START_OF_MESSAGE}" "{END_OF_LINE}"
            end
        else
            setVar $new_message $message
        end

        getWordPos " "&$new_message&" " $pos "*"
        getlength $new_message $length

        if ($self_command > 1)
            setvar $self_command false
        end
        if ($pos < $length)
            setvar $multiple_lines true
        else
            setvar $multiple_lines false
        end
        #echo "*[length of "&$new_message&":"&$length&"  position of enter:"&$pos&"] isSilent:["&$isSilent&"]*"
        #echo "*[command line: "&$bot~user_command_line&"self command:"&$self_command&"    silent running:"&$bot~silent_running&"   command:"&$bot~command&"] isSilent:["&$isSilent&"]*"
        if (((($isSilent > 0) or ($bot~silent_running = true)) and ($self_command = true)) or (($self_command = true) and ($bot~command = "help")) and ($isBroadcast <= 0))
            if ($BOT~botIsDeaf <> TRUE)
                Echo "*" & $MSG_Header_Echo & $new_message
                send #145
            else
                setvar $window_content $new_message
                replaceText $window_content "*" "[][]"
                saveVar $window_content
            end
        elseif ($multiple_lines = false)
            send $MSG_Header_SS_1 & $new_message
        else
            send $MSG_Header_SS_2 & $new_message & "*"
        end
        setVar $message ""
    end
    setVar $helpList FALSE
return

