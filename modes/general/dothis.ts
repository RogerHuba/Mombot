	gosub :BOT~loadVars
									
	setArray $INTERNALCOMMANDLISTS 7
	setVar $bot~internalCommandLists[1]  " stopall stop listall reset emq bot relog tow refresh login logoff unlock lift with dep callin about cn extern twarp bwarp pwarp relog help switchbot "
	setVar $bot~internalCommandLists[2]  " " 
	setVar $bot~internalCommandLists[3]  " hkill kill htorp "
	setVar $bot~internalCommandLists[4]  " refurb scrub "
	setVar $bot~internalCommandLists[5]  " surround exit xenter mow "
	setVar $bot~internalCommandLists[6]  " "
	setVar $bot~internalCommandLists[7]  " find pscan sector storeship setvar getvar "
	setVar $bot~doubledCommandList       " parm params parms qss sec sect secto cn9 logout emx smow port shipstore finder xenter status pinfo holotorp"
	setVar $bot~internalCommandList     $internalCommandLists[1]&$internalCommandLists[2]&$internalCommandLists[3]&$internalCommandLists[4]&$internalCommandLists[5]&$internalCommandLists[6]&$internalCommandLists[7]
	setArray $bot~TYPES 7
	setVar $bot~TYPES[1] "General"
	setVar $bot~TYPES[2] "Defense"
	setVar $bot~TYPES[3] "Offense"
	setVar $bot~TYPES[4] "Resource"
	setVar $bot~TYPES[5] "Grid"
	setVar $bot~TYPES[6] "Cashing"
	setVar $bot~TYPES[7] "Data"
	setArray $bot~CATAGORIES 3
	setVar $bot~CATAGORIES[1] "Modes"
	setVar $bot~CATAGORIES[2] "Commands"
	setVar $bot~CATAGORIES[3] "Daemons"


	setVar $BOT~help[1]  $BOT~tab&"- dothis {param:xxx} {"&#34&"bot command"&#34&"}    " 
	setVar $BOT~help[2]  $BOT~tab&"                                                            " 
	setVar $BOT~help[3]  $BOT~tab&"    Visits sectors marked with sector param and does bot. " 
	setVar $BOT~help[4]  $BOT~tab&"    command.                                               " 
	setVar $BOT~help[5]  $BOT~tab&"                                                            " 
	setVar $BOT~help[6]  $BOT~tab&"          {param:xxx} - sector parameter to target         " 
	setVar $BOT~help[7]  $BOT~tab&"     {"&#34&"bot command"&#34&"} - bot command to run when you get to target " 
	setVar $BOT~help[8]  $BOT~tab&"                                                             " 
	setVar $BOT~help[9]  $BOT~tab&"        Examples:                                           " 
	setVar $BOT~help[10] $BOT~tab&"              >dothis param:figsec "&#34&"disp"&#34&"                  " 
	setVar $BOT~help[11] $BOT~tab&"              >dothis figsec disp                   " 
	setVar $BOT~help[12] $BOT~tab&"              >dothis uppedport "&#34&"max e | max o | disp"&#34&"         " 
	setVar $BOT~help[13] $BOT~tab&"                                                            " 
	gosub :bot~helpfile

	getWordPos $bot~user_command_line $pos #34
	if ($pos > 0)
		getText $bot~user_command_line $bot_command #34 #34
	else
        setvar $bot_command $bot~parm2
    end
    if ($bot_command = false)
        setVar $SWITCHBOARD~message "Invalid bot command to do entered.*"
        gosub :SWITCHBOARD~switchboard
        halt			
    end


	if ($bot~parm1 <> "")
        getWordPos $bot~user_command_line $pos "param:"
        if ($pos > 0)
            getText " "&$bot~user_command_line&" " $parameter "param:" " "
            if ($parameter = false)
                setVar $SWITCHBOARD~message "Invalid sector parameter entered.*"
                gosub :SWITCHBOARD~switchboard
                halt			
            end
        else
            setvar $parameter $bot~parm1
        end
		upperCase $parameter
	end

	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
		setVar $SWITCHBOARD~message "You must run deploy from command or citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

    if ($startingLocation = "Citadel")
        send "qD"
        waitOn "Planet #"
        getWord CURRENTLINE $planet~planet 2
        stripText $planet~planet "#"
        send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*tnt1*c"
        setvar $travelType "Planet"
    else
        setvar $travelType "Ship"
    end

    setvar $doitcount 0
    setvar $switchboard~message "Attempting to do this ("&$bot_command&") on all "&$parameter&" sectors.*"
    gosub :switchboard~switchboard

	setArray $checkedTargets SECTORS

    while (true)
        :try_the_next_target
        gosub :findNextTarget
        if ($nearestTarget = "-1")
            setvar $switchboard~message "Dothis run completed.  I did this on "&$doitcount&" sectors!*"
            gosub :switchboard~switchboard
            halt
        else
            # travel to nearest target #
            setVar $PLAYER~warpto $nearestTarget
            if ($travelType = "Planet")
                gosub :PLAYER~pwarp
                if ($PLAYER~pwarpSuccess = FALSE)
                    setVar $SWITCHBOARD~message "Failed to PWARP to: " & $PLAYER~warpto &$PLAYER~msg&"*"
                    gosub :SWITCHBOARD~switchboard
                    goto :try_the_next_target
                end
            else
                gosub :PLAYER~twarp	
                if ($PLAYER~twarpSuccess = FALSE)
                    setVar $SWITCHBOARD~message "Failed to TWARP to: " & $PLAYER~warpto &$PLAYER~msg&"*"
                    gosub :SWITCHBOARD~switchboard
                    goto :try_the_next_target
                end
            end

            # do the action #
            add $doitcount 1
            setvar $bot~user_command_line $bot_command
            goto :USER_INTERFACE~runUserCommandLine
            :bot~wait_for_command

        end
    end
    halt

:findNextTarget
	killalltriggers
	gosub :PLAYER~quikstats
	setVar $isDone FALSE
	setVar $player~turnsTooLow FALSE
    setArray $checked SECTORS
	setArray $que SECTORS
	while ($isDone <> TRUE)
		loadVar $BOT~botIsDeaf
		loadVar $BOT~silent_running
		if (($PLAYER~unlimitedGame = FALSE) AND ($PLAYER~TURNS <= $BOT~bot_turn_limit))
			setVar $SWITCHBOARD~message "Turns too low to continue.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		setVar $bottom 1
		setVar $top 1
		setVar $que[1] $PLAYER~CURRENT_SECTOR
		while ($bottom <= $top)
			# Now, pull out the next sector in the que, and make it our focus
			setVar $focus $que[$bottom]
			getSectorParameter $focus $parameter $isTarget
			getSectorParameter $focus "FIGSEC" $isFigged
			
            if (($isTarget = true) and ($checkedTargets[$focus] <> true))
                # fig found 0 hops
                setVar $nearestTarget $focus
                setvar $checkedTargets[$focus] true
                return
            else
                setvar $checkedTargets[$focus] true
                setVar $nearestTarget 0
            end

			# That wasn't it, so let's add all the adjacents to the que for future testing.
			setVar $a 1
			while (SECTOR.WARPS[$focus][$a] > 0)
				setVar $adjacent SECTOR.WARPS[$focus][$a]
				# But only add them if they haven't been added previously
				if ($checked[$adjacent] = 0)
					# Okay, this one hasn't been checked, so tag it and que it.
					setVar $checked[$adjacent] 1
					add $top 1
					setVar $que[$top] $adjacent
				end
				add $a 1
			end
			# The adjacents of $focus were all queued, now on to the next one.
			:gotoBottom
			add $bottom 1
		end	
        # can't find anymore #
        setvar $nearestTarget "-1"
        return
    end


:MAIN~module_vars
	saveVar $bot~command
	saveVar $bot~user_command_line
	setVar $switchboard~bot_name $bot~bot_name
	saveVar $switchboard~bot_name
	savevar $bot~name
	saveVar $bot~parm1
	saveVar $bot~parm2
	saveVar $bot~parm3
	saveVar $bot~parm4
	saveVar $bot~parm5
	saveVar $bot~parm6
	saveVar $bot~parm7
	saveVar $bot~parm8
	saveVar $bot~bot_turn_limit
	saveVar $player~unlimitedGame
	gosub :MAIN~backwards_compatible
return


:MAIN~backwards_compatible
	setVar  $safe_ship $bot~safe_ship
	saveVar $safe_ship
	setVar  $safe_planet $bot~safe_planet
	saveVar $safe_planet
	setVar $command $bot~command
	saveVar $command
	setvar $user_command_line $bot~user_command_line
	saveVar $user_command_line
	setVar $bot_name $bot~bot_name
	saveVar $bot_name
	setVar $self_command $bot~self_command
	saveVar $self_command
	setvar $parm1 $bot~parm1
	setvar $parm2 $bot~parm2
	setvar $parm3 $bot~parm3
	setvar $parm4 $bot~parm4
	setvar $parm5 $bot~parm5
	setvar $parm6 $bot~parm6
	setvar $parm7 $bot~parm7
	setvar $parm8 $bot~parm8
	if ($parm1 = "")
		setvar $parm1 "0"
	end
	if ($parm2 = "")
		setvar $parm2 "0"
	end
	if ($parm3 = "")
		setvar $parm3 "0"
	end
	if ($parm4 = "")
		setvar $parm4 "0"
	end
	if ($parm5 = "")
		setvar $parm5 "0"
	end
	if ($parm6 = "")
		setvar $parm6 "0"
	end
	if ($parm7 = "")
		setvar $parm7 "0"
	end
	if ($parm8 = "")
		setvar $parm8 "0"
	end
	saveVar $parm1
	saveVar $parm2
	saveVar $parm3
	saveVar $parm4
	saveVar $parm5
	saveVar $parm6
	saveVar $parm7
	saveVar $parm8
	setVar $rylos $map~rylos
	saveVar $rylos
	setVar $alpha_centauri $map~alpha_centauri
	saveVar $alpha_centauri
	setVar $stardock $map~stardock
	saveVar $stardock
	setVar $backdoor $map~backdoor
	saveVar $backdoor
	setVar $home_sector $map~home_sector
	saveVar $home_sector
	setVar $alarm_list $bot~alarm_list
	saveVar $alarm_list
	setVar $unlimitedGame $player~unlimitedGame
	saveVar $unlimitedGame
	setVar $bot_turn_limit $bot~bot_turn_limit
	saveVar $bot_turn_limit
	setVar $steal_factor $game~steal_factor
	saveVar $steal_factor
	setVar $password $bot~password
	saveVar $password
	setVar $mode $bot~mode
	saveVar $mode
	setVar $subspace $bot~subspace
	saveVar $subspace
	setVar $ptradesetting $game~ptradesetting
	saveVar $ptradesetting

return

#-=-=-=-=-includes-=-=-=-=-
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\pwarp\player"
include "source\bot_includes\player\currentprompt\player"
include "source\bot_includes\bot\internal_commands"
include "source\bot_includes\bot\user_interface"
include "source\bot_includes\bot"

