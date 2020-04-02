    loadVar $bot_name
    loadVar $user_command_line
    loadVar $parm1
    loadVar $parm2
    loadVar $parm3
    loadVar $command
    loadvar $self_command
    loadVar $stardock
    loadVar $PLAYER~unlimitedGame        
    loadvar $SWITCHBOARD~bot_name 

# ============================== Corp Join/Drop (CORP) ==============================
:corp
        fileExists $doesHelpFileExist "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt"
        if ($doesHelpFileExist <> TRUE)
           write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "- "&$command&" [join/drop] [corp number] [password]                "
           write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "      join        - Will join Corporation                          "
           write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "      drop        - Will Drop current corporation                  "
           write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "      corp number - The corp number to join                        "
           write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "      password    - The corp password                              "
           write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "*NOTE: If corp and password were previously used via bot           "
               write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       the corp number and password will be saved                  "
           send "'{" $SWITCHBOARD~bot_name "} - Writing help file for "&$command&" in Help directory.*"
        end
        gosub :PLAYER~quikstats
        if (($PLAYER~CURRENT_PROMPT <> "Command") and ($PLAYER~CURRENT_PROMPT <> "Citadel"))
               setVar $SWITCHBOARD~message "Must run from Command or Citadel Prompt*"
               gosub :SWITCHBOARD~switchboard
               goto :wait_for_command
        end
        if ($parm1 <> "drop")
               if (((($parm2 < 1) and ($corpNumber < 1)) or (($parm3 = "") or ($corpPassword = "")) and ($parm1 <> "join")))
                     setVar $SWITCHBOARD~message "Please use CORP [drop/join] {corp #} {password}*"
                     gosub :SWITCHBOARD~switchboard
                     goto :wait_for_command
               end
        end
        if ($parm2 > 0)
               setVar $corpNumber $parm2
               saveVar $corpNumber
        end
        if ($parm3 <> "")
                setVar $corpPassword $parm3
                saveVar $corpPassword
        end
        if ($parm1 = "drop")
               if ($PLAYER~CURRENT_PROMPT = "Command")
                     send "txy**q*"
                 setTextLineTrigger offCorp :offCorp "Ok!  You're off the Corp"
                 setTextlineTrigger notOnCorp :notOnCorp "You are not currently in a Corporation"
                 pause
           elseif ($PLAYER~CURRENT_PROMPT = "Citadel")
                 send "xxy*q**"
                 setTextLineTrigger offCorp :offCorp "Ok!  You're off the Corp"
                 setTextlineTrigger notOnCorp :notOnCorp "You are not currently in a Corporation"
                 pause
               end
        elseif ($parm1 = "join")
               if ($PLAYER~CURRENT_PROMPT = "Command")
                     send "tj"
                     setTextLineTrigger onCorpAlready :onCorpAlready "You are already on a Corp silly"
                 setTextlineTrigger joinCorp      :joinCorp      "Enter the Password to join"
                     pause
           elseif ($PLAYER~CURRENT_PROMPT = "Citadel")
                 send "xj"
                     setTextLineTrigger onCorpAlready :onCorpAlready "You are already on a Corp silly"
                 setTextlineTrigger joinCorp      :joinCorp      "Enter the Password to join"
                     pause
               end
        end
               send  $corpNumber & "*"
               setTextLineTrigger fullcorp            :fullCorp      "The Corporation is Full"
           setTextlineTrigger alignConflict       :alignConflict "Sorry, you can only join a Corporation if your alignment doesn't conflict."
        :joinCorp
               gosub :killthetriggers
               send $corpPassword & "*q"
           setTextlineTrigger badCorpPass         :badCorpPass "Nice try, that has been recorded by Federal Intelligence."
           setTextlineTrigger joinedCorp          :joinedCorp "Welcome Aboard"
           pause
        :joinedCorp
               gosub :killthetriggers
               setVar $SWITCHBOARD~message "I joined the Corporation and Claimed my Ship Corporate!*"
               gosub :SWITCHBOARD~switchboard
               goto :wait_for_command
        :offCorp
               gosub :killthetriggers
               setVar $SWITCHBOARD~message "I have removed myself from the Corporation!*"
               gosub :SWITCHBOARD~switchboard
               goto :wait_for_command
        :notOnCorp
               gosub :killthetriggers
               setVar $SWITCHBOARD~message "I am not currently on a Corporation!*"
               gosub :SWITCHBOARD~switchboard
               goto :wait_for_command
        :onCorpAlready
               gosub :killthetriggers
               send "q"
               setVar $SWITCHBOARD~message "I am already on a Corporation!*"
               gosub :SWITCHBOARD~switchboard
               goto :wait_for_command
        :alignConflict
               gosub :killthetriggers
               send "q"
               setVar $SWITCHBOARD~message "My alignment currently prohibits me from joining this corporation!*"
               gosub :SWITCHBOARD~switchboard
               goto :wait_for_command
        :badCorpPass
               gosub :killthetriggers
               send "q"
               setVar $SWITCHBOARD~message "The Corporation password was incorrect.!*"
               gosub :SWITCHBOARD~switchboard
               goto :wait_for_command
        :fullCorp
               gosub :killthetriggers
               send "q"
               setVar $SWITCHBOARD~message "The Corporation is FULL.!*"
               gosub :SWITCHBOARD~switchboard
               goto :wait_for_command
# ============================== End Corp Join/Drop (CORP) ==============================


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
