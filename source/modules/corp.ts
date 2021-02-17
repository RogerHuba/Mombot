	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"Completes basic corp changes"
	setVar $BOT~help[2] $BOT~tab&"          "
	setVar $BOT~help[3] $BOT~tab&"Corp Options"
	setVar $BOT~help[4] $BOT~tab&"          [drop] - Will drop your current corp"
	setVar $BOT~help[5] $BOT~tab&"          [join] plus [corp #] plus [password] - Will attempt to join corp"
	setVar $BOT~help[6] $BOT~tab&"          [ss] plus [subspace #] - will change subspace"
	gosub :bot~helpfile

	setVar $BOT~script_title "Corp"
	gosub :BOT~banner

        gosub :PLAYER~quikstats
        if (($PLAYER~CURRENT_PROMPT <> "Command") and ($PLAYER~CURRENT_PROMPT <> "Citadel"))
               setVar $SWITCHBOARD~message "Must run from Command or Citadel Prompt*"
               gosub :SWITCHBOARD~switchboard
               goto :wait_for_command
        end
        if ($parm1 = "ss")
               if ($parm2 < 0)
                     setVar $SWITCHBOARD~message "Please use CORP [ss] {subspace #}*"
                     gosub :SWITCHBOARD~switchboard
                     HALT
               else
                     send "cn4" & $parm2 & "*"
                     waitfor "Ok, you will send and receive sub-space messages"
                     send "qq"
                     setVar $SWITCHBOARD~message "Subspace channel has been switched!*"
                     gosub :SWITCHBOARD~switchboard
                     HALT
               end

        end
        if ($parm1 <> "drop")
               if (((($parm2 < 1) and ($BOT~corpNumber < 1)) or (($parm3 = "") or ($BOT~corpPassword = "")) and ($parm1 <> "join")))
                     setVar $SWITCHBOARD~message "Please use CORP [drop/join] {corp #} {password}*"
                     gosub :SWITCHBOARD~switchboard
                     goto :wait_for_command
               end
        end
        if ($parm2 > 0)
               setVar $corpNumber $parm2
               saveVar $BOT~corpNumber
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
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
