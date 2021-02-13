	gosub :BOT~loadVars
									

	setVar $BOT~help[1]  $BOT~tab&"  dothis {param:xxx} {"&#34&"bot command"&#34&"}    " 
	setVar $BOT~help[2]  $BOT~tab&"                                                            " 
	setVar $BOT~help[3]  $BOT~tab&"    Visits sectors marked with sector param and does bot  " 
	setVar $BOT~help[4]  $BOT~tab&"    command.  Twarps if started from command prompt and     " 
	setVar $BOT~help[5]  $BOT~tab&"    pwarps if started from citadel.                          " 
	setVar $BOT~help[6]  $BOT~tab&"                                                            " 
	setVar $BOT~help[7]  $BOT~tab&"          {param:xxx} - sector parameter to target         " 
	setVar $BOT~help[8]  $BOT~tab&"     {"&#34&"bot command"&#34&"} - bot command to run when you get to target " 
	setVar $BOT~help[9]  $BOT~tab&"                                                             " 
	setVar $BOT~help[10] $BOT~tab&"        Examples:                                           " 
	setVar $BOT~help[11] $BOT~tab&"              >dothis param:figsec "&#34&"disp"&#34&"                  " 
	setVar $BOT~help[12] $BOT~tab&"              >dothis figsec disp                   " 
	setVar $BOT~help[13] $BOT~tab&"              >dothis uppedport "&#34&"max e | max o | disp"&#34&"         " 
	setVar $BOT~help[14] $BOT~tab&"                                                            " 
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
            saveVar $BOT~user_command_line
            load "scripts\"&$bot~mombot_directory&"\commands\general\run.cts"
            setEventTrigger	runended :runended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\general\run.cts"
            pause
            :runended
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



#-=-=-=-=-includes-=-=-=-=-
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\pwarp\player"
include "source\bot_includes\player\currentprompt\player"
