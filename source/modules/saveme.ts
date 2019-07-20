	logging off
	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"Warps planet to a corpie who calls for a pickup."
	setVar $BOT~help[2] $BOT~tab&"         "
	setVar $BOT~help[3] $BOT~tab&"Options: "
	setVar $BOT~help[4] $BOT~tab&"{plimper} - Drops personal limps in a sector."
	gosub :bot~helpfile

	setVar $BOT~script_title "Saveme"
	gosub :BOT~banner


# ============================== START ACTIVATE SAVEME (SAVEME) ==============================
:saveme

	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($parm1 <> "on") and ($parm1 <> "off")
		setVar $SWITCHBOARD~message "Please use - saveme [on/off] format*"
		gosub :SWITCHBOARD~switchboard
		HALT
	end
	if ($parm1 = "on")
		if ($startingLocation <> "Citadel")
		     setVar $SWITCHBOARD~message "Must start at Citadel prompt*"
		     gosub :SWITCHBOARD~switchboard
		     HALT
		end
		isNumber $isnum $parm2
		if ($isnum = 1)
			if ($parm2 > 0)
				setVar $returnHome TRUE
				setVar $savemeDelay $parm2
			else
				setVar $returnHome FALSE
				setVar $savemeDelay 0
			end
			setVar $home_sector2 $PLAYER~CURRENT_SECTOR

		else
			setVar $returnHome FALSE
			setVar $savemeDelay 0

		end
		if ($returnHome)
			setVar $SWITCHBOARD~message "Activating SaveMe, Return Home enabled*"
		        gosub :SWITCHBOARD~switchboard
		else
			setVar $SWITCHBOARD~message "Activating SaveMe*"
		        gosub :SWITCHBOARD~switchboard
		end
		send "q"
	        killalltriggers
         	gosub :PLANET~getPlanetInfo
		send "c "
		setVar $targetingPerson FALSE
#Need to update this portion of code
#		getWordPos $user_command_line $pos #34
#		if ($pos > 0)
#			setVar $user_command_line $user_command_line&" "
#			getText " "&$user_command_line&" " $target " "&#34 #34&" "
#			if ($target <> "")
#				setVar $targetingPerson TRUE
#				lowercase $target
#				cutText $target $subTarget 1 6
#				stripText $user_command_line " "&#34&$target&#34&" "
#			else
#				setVar $targetingPerson FALSE
#			end
#		end
		if ($returnHome)
			if ($targetingPerson)
				setVar $SWITCHBOARD~message "Saveme - Running from planet " & $PLANET~PLANET & " for "&$target&", " & $savemeDelay & " second return home delay.*"
		                gosub :SWITCHBOARD~switchboard
			else
				setVar $SWITCHBOARD~message "Saveme - Running from planet " & $PLANET~PLANET & ", " & $savemeDelay & " second return home delay.*"
				gosub :SWITCHBOARD~switchboard

			end

		else
			if ($targetingPerson)
				setVar $SWITCHBOARD~message "Saveme - Running from planet " & $PLANET~PLANET & " for "&$target&".*"
				gosub :SWITCHBOARD~switchboard
			else
				setVar $SWITCHBOARD~message "Saveme - Running from planet " & $PLANET~PLANET & ".*"
				gosub :SWITCHBOARD~switchboard
			end
		end
		goto :settriggers
	else
                setVar $SWITCHBOARD~message "Please use - saveme [on/off] format**"
		gosub :SWITCHBOARD~switchboard
		halt
	end
# ============================== END ACTIVATE SAVEME (SAVEME) SUB ==============================

# ============================== ACTIVATE SAVEME ON CORPIE CALL ==============================
:saveCall
	killalltriggers
	setVar $line CURRENTLINE
	gosub :authenticate
	if ($auth_result = "false")
		goto :settriggers
	elseif ($auth_result = "true")
		cutText $line $target_sector 9 13
	elseif ($auth_result = "self")
		cutText $line $target_sector 2 12
	end
	setVar $target_sector " " & $target_sector
	striptext $target_sector " 000"
	striptext $target_sector " 00"
	striptext $target_sector " 0"
	striptext $target_sector " "
	striptext $target_sector "=saveme"
	isNumber $isnum $target_sector
	if ($isnum = 1)
		if (($target_sector > 0) AND ($target_sector <= SECTORS))
		setTextLineTrigger abort :abort "abort saveme"
		setTextLineTrigger there :there "You are already in that sector!"
		setVar $i 0
	        setVar $j 0
                send "P" & $target_sector & "*Y"
                send "P" & $target_sector & "*Y"
                send "P" & $target_sector & "*Y"
                send "P" & $target_sector & "*Y"
                send "P" & $target_sector & "*Y"
            	:pwarp1
                	add $i 1
	                add $j 1
        	        if ($j = 100)
			    setVar $SWITCHBOARD~message "No fig down yet, 100 attempts, aborting*"
			    gosub :SWITCHBOARD~switchboard
	                    goto :settriggers
        	        elseif ($i = 10)
			    setVar $SWITCHBOARD~message "No fig down yet*"
			    gosub :SWITCHBOARD~switchboard
	                    setVar $i 0
        	        end
                	send "P" & $target_sector & "*Y"
	                setTextLineTrigger nofig :nofig "You do not have any fighters"
        	        pause

		:nofig
                	goto :pwarp1

		:there
                	killtrigger abort
	                killtrigger nofig
			setVar $SWITCHBOARD~message "Saveme script activated - Planet " & $PLANET~PLANET & " to " & $target_sector & " on attempt " & $j & ".*"
			gosub :SWITCHBOARD~switchboard
        	        send "IS*"
			if ($returnHome)
				setDelayTrigger savemereturn :returnsaveme ($savemeDelay*1000)
				pause
				:returnsaveme
					send "P" & $home_sector2 & "*Y"
                	end
			goto :settriggers

            	:abort
                	killtrigger nofig
       		    	killtrigger abort
	                setVar $SWITCHBOARD~message "Save Aborted*"
			gosub :SWITCHBOARD~switchboard
        	        if ($returnHome)
				setDelayTrigger savemereturn :returnsaveme ($savemeDelay*1000)
				pause
				:returnsaveme
				     send "P" & $home_sector2 & "*Y"
                	end
                        goto :settriggers

	        else
	                setVar $SWITCHBOARD~message "Invalid save call (out of range)*"
			gosub :SWITCHBOARD~switchboard
			if ($returnHome)
				setDelayTrigger savemereturn :returnsaveme ($savemeDelay*1000)
				pause
				:returnsaveme
					send "P" & $home_sector2 & "*Y"
                	end
                       goto :settriggers
		end

    	else
	        setVar $SWITCHBOARD~message "Invalid save call (non-numeric)*"
		gosub :SWITCHBOARD~switchboard
	        if ($returnHome)
				setDelayTrigger savemereturn :returnsaveme ($savemeDelay*1000)
				pause
				:returnsaveme
					send "P" & $home_sector2 & "*Y"
                 end
                 goto :settriggers
	end



:End
	killalltriggers
	send "P" & $home_sector2 & "*Y"
        goto :settriggers

:authenticate
	killalltriggers
	setVar $subLine CURRENTLINE
	setVar $subLine $subLine & "             "
	getWord $subLine $spoof 1
	cutText $subLine $subSender 3 6
	setVar $auth_result "false"
	if ($targetingPerson)
		lowerCase $subSender
		if ($spoof = "'")
			setVar $auth_result "self"
			return
		elseif ($spoof = "R")
			if ($subSender <> $subTarget)
				setVar $auth_result "true"
				return
			else
				return
			end
		else
			return
		end
	else
		if ($spoof = "'")
			setVar $auth_result "self"
		elseif ($spoof = "R")
			setVar $auth_result "true"
        	end
        	return
	end
:settriggers
	killalltriggers
#	setTextLineTrigger 1 :announce "script?"
#	setTextLineTrigger 2 :announce "Script?"
	setTextLineTrigger 3 :saveCall "=saveme"
#	setTextLineTrigger 4 :savemeDeployMines $bot_name & " Deploy Mines"
#	setTextLineTrigger 5 :savemePersonalLimpet $bot_name & " Personal Limp"
#	setTextLineTrigger 6 :savemeDeployMines $bot_name & " deploy mines"
#	setTextLineTrigger 7 :savemePersonalLimpet $bot_name & " personal limp"
pause


#:announce
#	killalltriggers
#	gosub :authenticateannounce
#	if ($auth_result)
#	        setVar $SWITCHBOARD~message "Invalid save call (non-numeric)*"
#		gosub :SWITCHBOARD~switchboard
#		send "'*Save Me - Running from planet " & $PLANET~PLANET & "*---Command List---*" & $bot_name & " Deploy Mines*" & $bot_name & " Personal Limp*----End of List---** "
#	end
#	waitOn "----End of List---"
#	goto :Settriggers

#:authenticateannounce
#    killalltriggers
#    setVar $subLine CURRENTLINE
#    cuttext $subLine $spoof 1 1
#    setVar $auth_result FALSE
#   if ($spoof = "R")
#	setVar $auth_result TRUE
#    end
return
# ============================== END ACTIVATE SAVEME ON CORPIE CALL SUB ==============================

# ============================== START PERSONAL LIMP (LIMP) SUB ==============================
#:savemePersonalLimpet
#	setVar $limp "p"
#	setVar $parm1 1
#	goto :plimp
#
#:plimp
#	killalltriggers
#	gosub :quikstats~quikstats
#	if ($quikstats~LIMPETS <= 0)
#		send "'{" $bot_name "} - Out of limpets!*"
#		goto :settriggers
#	end
#	if ($startingLocation = "Citadel")
#		send "q q z* h2z" $parm1 "* z " $limp " z * * *l " $planetinfo~PLANET "* c"
#		setTextLineTrigger toomanypl :toomany_limp "!  You are limited to "
#		setTextLineTrigger plclear :plclear_limp "Done. You have "
#		setTextLineTrigger enemypl :noperdown_limp "These mines are not under your control."
#		setTextLineTrigger notenough :toomany_limp "You don't have that many mines available."
#		pause
#	elseif ($startingLocation = "Command")
#		send "z* h2z" $parm1 "* z " $limp " z * *"
#		setTextLineTrigger toomanypl :toomany_limp "!  You are limited to "
#		setTextLineTrigger plclear :plclear_limp "Done. You have "
#		setTextLineTrigger enemypl :noperdown_limp "These mines are not under your control."
#		setTextLineTrigger notenough :toomany_limp "You don't have that many mines available."
#		pause
#	else
#		send "'{" $bot_name "} - Not at the correct prompt for deploying limpets.*"
#		goto :settriggers
#	end
#
#
#:plclear_limp
#	killalltriggers
#	if ($startingLocation = "Citadel")
#		setTextTrigger checklimpcommand :continuechecklimpcitadel "Citadel command (?=help)"
#		pause
#		:continuechecklimpcitadel
#		send "s* "
#		setTextLineTrigger perdown :perdown_limp "(Type 2 Limpet) (yours)"
#		setTextLineTrigger cordown :cordown_limp "(Type 2 Limpet) (belong to your Corp)"
#		setTextLineTrigger noperdown :noperdown_limp "Citadel treasury contains"
#		pause
#	elseif ($startingLocation = "Command")
#		setTextTrigger checklimpcommand :continuechecklimpcommand "Command [TL="
#		pause
#		:continuechecklimpcommand
#		send "d* "
#		setTextLineTrigger perdown :perdown_limp "(Type 2 Limpet) (yours)"
#		setTextLineTrigger cordown :cordown_limp "(Type 2 Limpet) (belong to your Corp)"
#		setTextLineTrigger noperdownp :noperdown_limp "Warps to Sector(s)"
#		pause
#	else
#		send "'{" $bot_name "} - Not at the correct prompt for deploying limpets.*"
#		goto :settriggers
#	end

#:cordown_limp
#	killalltriggers
#	if ($startingLocation = "Citadel")
#		waitOn "Citadel command (?=help)"
#		send "'{" $bot_name "} - " $parm1 " Corporate Limpets Deployed!*"
#	end
#	if ($startingLocation = "Command")
#		waitOn "Command [TL="
#		send "'{" $bot_name "} - " $parm1 " Corporate Limpets Deployed!*"
#	end
#	setSectorParameter $CURRENT_SECTOR "LIMPSEC" TRUE
#	goto :settriggers


#:perdown_limp
#	killalltriggers
#	if ($startingLocation = "Citadel")
#		waitOn "Citadel command (?=help)"
#		if ($parm1 = 1)
#			send "'{" $bot_name "} - " $parm1 " Personal Limpet Deployed!*"
#		else
#			send "'{" $bot_name "} - " $parm1 " Personal Limpets Deployed!*"
#		end
#	end
#	if ($startingLocation = "Command")
#		waitOn "Command [TL="
#		if ($parm1 = 1)
#			send "'{" $bot_name "} - " $parm1 " Personal Limpet Deployed!*"
#		else
#			send "'{" $bot_name "} - " $parm1 " Personal Limpets Deployed!*"
#		end
#	end
#	goto :settriggers

#:noperdown_limp
#	killalltriggers
#	if ($startingLocation = "Citadel")
#		waitOn "Citadel command (?=help)"
#		send "'{" $bot_name "} - Sector already has enemy limpets present!*"
#		goto :settriggers
#	end
#	if ($startingLocation = "Command")
#		waitOn "Command [TL="
#		send "'{" $bot_name "} - Sector already has enemy limpets present!*"
#		goto :settriggers
#	end

#:toomany_limp
#	killalltriggers
#	if ($startingLocation = "Citadel")
#		waitOn "Citadel command (?=help)"
#		send "'{" $bot_name "} - Cannot Deploy Limps!*"
#		goto :settriggers
#	else
#		waitOn "Command [TL="
#		send "'{" $bot_name "} - Cannot Deploy Limps!*"
#		goto :settriggers
#	end
# ============================== END PERSONAL LIMP SUB ==============================

# ============================== MINES (ARMID AND LIMP) SUB ==============================
#:savemeDeployMines
#	setVar $parm1 3
#	setVar $limp "c"
#	setVar $armid "c"

#:mines
#	KillAllTriggers
#	gosub :quikstats~quikstats
#	setVar $startingLocation $quikstats~CURRENT_PROMPT
#	if ($parm1 = 0)
#		setVar $parm1 3
#	end
#	if ($startingLocation <> "Citadel") and ($startingLocation <> "Command")
#    		send "'{" $bot_name "}  - Must start at Citadel or Command Prompt.*"
#     		goto :settriggers
#	end
#	if ($startingLocation = "Citadel")
#		send "q "
#		gosub :planetinfo~getPlanetInfo
#		send "c "
#	end
#	setVar $preDeployArmids $quikstats~ARMIDS
#	setvar $preDeployLimpets $quikstats~LIMPETS

#	if ($startingLocation = "Citadel")
#		send "s* "
#		waitOn "Warps to Sector(s) :"
#		setVar $limpener SECTOR.LIMPETS.OWNER[$quikstats~CURRENT_SECTOR]
#		setVar $armidOwner SECTOR.MINES.OWNER[$quikstats~CURRENT_SECTOR]
#		if (($quikstats~ARMIDS <= 0) AND (($armidOwner <> "belong to your Corp") AND ($armidOwner <> "yours")))
#			send "'{" $bot_name "} - Out of armids!*"
#			goto :settriggers
#		elseif (($parm1 > $quikstats~ARMIDS) AND (($armidOwner <> "belong to your Corp") AND ($armidOwner <> "yours")))
#			setVar $parm1 $quikstats~ARMIDS
#		end
#		if (($quikstats~LIMPETS <= 0) AND (($limpetOwner <> "belong to your Corp") AND ($limpetOwner <> "yours")))
#			send "'{" $bot_name "} - Out of limpets!*"
#			goto :settriggers
#		elseif (($parm1 > $quikstats~LIMPETS) AND (($limpetOwner <> "belong to your Corp") AND ($limpetOwner <> "yours")))
#			setVar $parm1 $quikstats~LIMPETS
#		end
#		send "q q z n h 2 z " $parm1 "*  z" $limp " * * h 1 z " $parm1 "*  z " $armid " * * * l " $planetinfo~PLANET "* c "
#	end
#	if ($startingLocation = "Command")
#		send "** "
#		waitOn "Warps to Sector(s) :"
#		setVar $limpetOwner SECTOR.LIMPETS.OWNER[$quikstats~CURRENT_SECTOR]
#		setVar $armidOwner SECTOR.MINES.OWNER[$quikstats~CURRENT_SECTOR]
#		send "z n h 2 z " $parm1 "*  z " $limp "  * * h 1 z " $parm1 "*  z" $armid "  * * "
#	end
#	gosub :quikstats~quikstats

#	if (($predeployArmids > $quikstats~ARMIDS) AND ($predeployLimpets > $quikstats~LIMPETS))
#		send "'{" $bot_name "} - " $parm1 " Armid and Limpet mines deployed into the sector!*"
#	elseif ($predeployArmids > $quikstats~ARMIDS)
#		send "'{" $bot_name "} - " $parm1 " Armid mine(s) deployed into the sector!*"
#	elseif ($predeployLimpets > $quikstats~LIMPETS)
#		send "'{" $bot_name "} - " $parm1 " Limpet mine(s) deployed into the sector!*"
#	end
#	if ($predeployArmids < $quikstats~ARMIDS)
#		send "'{" $bot_name "} - " ($ARMIDS-$predeployArmids) " Armid mines picked up from sector!*"
#	elseif (($predeployArmids = $quikstats~ARMIDS) AND (($armidOwner <> "belong to your Corp") AND ($armidOwner <> "yours")))
#		send "'{" $bot_name "} - Enemy armid(s) present in sector, cannot deploy!*"
#	end
#	if ($predeployLimpets < $quikstats~LIMPETS)
#		send "'{" $bot_name "} - " ($quikstats~LIMPETS-$predeployLimpets) " Limpet mines picked up from sector!*"
#	elseif (($predeployLimpets = $quikstats~LIMPETS) AND (($limpetOwner <> "belong to your Corp") AND ($limpetOwner <> "yours")))
#		send "'{" $bot_name "} - Enemy limpet(s) present in sector, cannot deploy!*"
#	end
#	goto :settriggers


#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"

