	reqRecording
	logging off
	loadVar $bot_name
	loadVar $unlimitedGame
	loadVar $ptradesetting
	loadVar $bot_turn_limit
	loadVar $user_command_line
	loadVar $parm1
	loadVar $parm2
	loadVar $parm3
	loadVar $parm4
	loadVar $parm5
	loadVar $parm6
	loadVar $parm7
	loadVar $parm8
	loadVar $command
	loadVar $SECTORS
	loadVar $port_max
 	setvar $portname "Mind ()ver Matter"
 	setvar $planetnamedoor "DOOR GUN"
 	setvar $planetnamebubble "FARM"
 	setVar $j 1
 	setvar $status_message "Initializing"
 	loadVar $unlimited
 	setVar $output_file  GAMENAME & ".nego"
        setVar $selldelay 0
        setVar $oreMCIC "-90"
        setVar $orgMCIC "-75"
        setVar $equMCIC "-65"
        setVar $version "3.0.0"
        setVar $get_fuel FALSE
        setVar $get_org FALSE
        setVar $get_equip FALSE
        setVar $get_figs FALSE
        setVar $upgrade FALSE
        setVar $port FALSE
        setVar $build FALSE
        setVar $minimumFuel 20000
	setVar $planetNegotiate TRUE
	setVar $sellingOrg TRUE
	setVar $sellingEquip TRUE
	setVar $skipcim FALSE
	loadVar $PLANET~planet_file
	
	

:help_file
     fileExists $doesHelpFileExist "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt"
     IF (($parm1 = "help") and ($doesHelpFileExist = TRUE))
          send "'{" $bot_name "} - Deleting Current Help File*"
          delete "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt"
     END
     fileExists $doesHelpFileExist "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt"
     IF (($doesHelpFileExist <> TRUE) or ($parm1 = "help") or ($parm1 = "?"))
          IF ($parm1 = "help") or ($parm1 = "?")
          Send "'*"
          Send " *{"& $bot_name &"} farm [COMMAND] {Sector Number}* *COMMANDS : "
          Send "{set} {setdoor} {remove} {clear} {list}*"
          Send "           {fig} {f} (o) (e) {coln} {merch} {silent}*"
          Send "           {reverse} {warp} {cash} {shield} {colo} {help/?}* *"
          Send " -  {set} or {setdoor) plus [sector number]*"
          Send " -  Marks sector as a Bubble Sector / Door*"
          Send " -  {remove} plus [sector number]*"
          Send " -  Removes Marked sector*"
          Send " -  [clear] - clear deletes the farm file*"
          Send " -  [list] - show lists of all sectors in the farm file in order*"
          Send " -  [fig]- will strip fighters off planets in target sectors*"
          Send " -  [f] - will strip fuel off planets in target sectors*"
          Send " -  [o] - will strip organics off planets in target sectors*"
          Send " -  [e] - will strip equipment off planets in target sectors*"
          Send " -  [coln] - will adjust colonists on planets*"
          Send " -  [merch] - will fire up Planet Merchant to sell Product*"
          Send " -  [silent] - supressed subspace messages*"
          Send " -  [reverse] - travels farm sectors in reverse*"
          Send " -  [warp] - will warp planets to sell product*"
          Send " -  [cash] - will grab cash off farm planets if any avaliable*"
          Send " -  [shield] - will ensure 200 Shields on shielded planets*"
          Send " -  [Colo] - will colonize planets with avaliable fuel*"
          Send " -  [help/?] - shows this help and clears params**"
          WaitOn "ub-space c"
          GoSub :CLEARPARMS
       END
       IF ($doesHelpFileExist <> TRUE)
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "- farm {set} {clear} {list} {fig} {f} (o) (e)               "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "                                                            "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [set(door)] {sector}                                    "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       - Marks sector as a Bubble Sector / Door             "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [clear]                                                 "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       - clear deletes the farm file                        "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [list]                                                  "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       - show lists of all sectors in the farm file in order"
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [fig]                                                   "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       - will strip fighters off planets in target sectors  "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [f]                                                     "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       - will strip fuel off planets in target sectors      "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [o]                                                     "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       - will strip organics off planets in target sectors  "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [e]                                                     "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       - will strip equipment off planets in target sectors  "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [coln]                                                  "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       - will adjust colonists on planets                   "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [merch]                                                 "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       - will fire up Planet Merchant to sell Product       "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [silent]                                                "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       - supressed subspace messages                        "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [reverse]                                               "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       - travels farm sectors in reverse                    "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [warp]                                                  "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       - will warp planets to sell product                  "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [cash]                                                  "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       - will grab cash off farm planets if any avaliable   "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [shield]                                                "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       - will ensure 200 Shields on shielded planets         "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "    [Colo]                                              "
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "       - will colonize planets with avaliable fuel          "
                send "'{" $bot_name "} - Writing help file for this command in Help directory.*"
                WaitOn "ub-space c"
#	        IF ($parm1 = "help")
#	             HALT
       END
     END

	getWordPos $user_command_line $pos "silent"
	if ($pos > 0)
		setVar $silent TRUE
	else
		setVar $silent FALSE
	end

	getWordPos $user_command_line $pos "fig"
	if ($pos > 0)
	        setVar $strip TRUE
		setVar $get_figs TRUE
	else
		setVar $get_figs FALSE
	end
	
        getWordPos $user_command_line $pos "reverse"
	if ($pos > 0)
		setVar $reverse TRUE
	else
		setVar $reverse FALSE
	end

	getWordPos " "&$user_command_line&" " $pos " f "
	if ($pos > 0)
       	        setVar $strip TRUE
		setVar $get_fuel TRUE
	else
		setVar $get_fuel FALSE
	end

	getWordPos " "&$user_command_line&" " $pos " o "
	if ($pos > 0)
	        setVar $strip TRUE
		setVar $get_org TRUE
	else
		setVar $get_org FALSE
	end

	getWordPos " "&$user_command_line&" " $pos " e "
	if ($pos > 0)
	        setVar $strip TRUE
		setVar $get_equip TRUE
	else
		setVar $get_equip FALSE
	end

	getWordPos $user_command_line $pos "upgrade"
	IF ($pos > 0)
		setVar $upgrade TRUE
	ELSE
		setVar $upgrade FALSE
	END

        getWordPos $user_command_line $pos "port"
	IF ($pos > 0)
		setVar $strip TRUE
                setVar $port TRUE
	ELSE
		setVar $port FALSE
	END

	getWordPos $user_command_line $pos "coln"
	IF ($pos > 0)
		setVar $colo TRUE
	ELSE
		setVar $colo FALSE
	END
	getWordPos $user_command_line $pos "build"
	IF ($pos > 0)
		setVar $build TRUE
	ELSE
		setVar $build FALSE
	END

        getWordPos $user_command_line $pos "cash"
	IF ($pos > 0)
		setVar $cash TRUE
	ELSE
		setVar $cash FALSE
	END

	getWordPos $user_command_line $pos "merch"
	IF ($pos > 0)
		setVar $merch TRUE
	ELSE
		setVar $merch FALSE
	END

	getWordPos $user_command_line $pos "cim"
	IF ($pos > 0)
		setVar $skipcim TRUE
	END

	getWordPos $user_command_line $pos "shield"
	IF ($pos > 0)
		setVar $shield TRUE
	ELSE
		setVar $shield FALSE
	END

        getWordPos $user_command_line $pos "warp"
	IF ($pos > 0)
		setVar $warp TRUE
		IF ($skipcim <> TRUE)
		       send "^rq"
		       waitFor ": ENDINTERROG"
                END
	ELSE
		setVar $warp FALSE
	END

        getWordPos $user_command_line $pos "colo"
	IF ($pos > 0)
		setVar $colonize TRUE
	ELSE
		setVar $colonize FALSE
	END

        getWordPos $user_command_line $pos "clear"
	IF ($pos > 0)
	        setVar $IDX 11
	        setVar $perc 0
		WHILE ($IDX <= SECTORS)
		     setSectorParameter $IDX "BUBBLE" FALSE
                     add $IDX 1
		     setVar $percTest (($IDX * 100) / SECTORS)
                     IF ($percTest > $perc)
		          setVar $perc (($IDX * 100) / SECTORS)
		          echo "*"
		          echo #27 "["&($perc / 2)&"C"
		          echo ANSI_14 "�" ANSI_15 " " $perc "%" #27 & "[1A   "
		     END
		END
		send "'{" $bot_name "} - Bot Farming Sectors Have Been Cleared.*"
                HALT
	END

	getWordPos $user_command_line $pos "list"
	IF ($pos > 0)
	   setVar $IDX 11
	   send "'*{" $bot_name "} - Bubble Sectors: *"
	   WHILE ($IDX <= SECTORS)
	        getsectorparameter $IDX "BUBBLE" $BUBBLE
	        IF ($BUBBLE = TRUE)
	             send $IDX & "*"
            END
            add $IDX 1
        END
           send "*"
           HALT
    END

	getWordPos $user_command_line $pos "set"
	IF ($pos > 0)
		isNumber $test $parm2
		IF ($test)
			IF (($parm2 > 10) AND ($parm2 <= SECTORS) AND ($parm2 <> STARDOCK))
				setSectorParameter $parm2 "BUBBLE" TRUE
		        	send "'{" $bot_name "} - " & $parm2 & " Sector added as FARM Sector.*"
			END
		ELSE
                        send "'{" $bot_name "} - Sector to add not Valid.*"
                END
	        HALT
	END

	getWordPos $user_command_line $pos "setdoor"
	IF ($pos > 0)
		isNumber $test $parm2
		IF ($test)
			IF (($parm2 > 10) AND ($parm2 <= SECTORS) AND ($parm2 <> STARDOCK))
				setSectorParameter $parm2 "DOOR" TRUE
		        	send "'{" $bot_name "} - " & $parm2 & " Sector added as DOOR Sector Parameters.*"
			END
		ELSE
                        send "'{" $bot_name "} - Sector to add not Valid.*"
                END
	        HALT
	END

	getWordPos $user_command_line $pos "remove"
	IF ($pos > 0)
		isNumber $test $parm2
		IF ($test)
			IF (($parm2 > 10) AND ($parm2 <= SECTORS) AND ($parm2 <> STARDOCK))
				setSectorParameter $parm2 "BUBBLE" FALSE
		        	send "'{" $bot_name "} - " & $parm2 & " Sector removed from FARM Sector Parameters.*"
			END
		ELSE
                        send "'{" $bot_name "} - Sector to remove not Valid.*"
                END
	        HALT
	END

        IF (($get_figs = FALSE) and ($strip = FALSE) and ($port = FALSE) and ($upgrade = FALSE) and ($colo = FALSE) and ($cash = FALSE) and ($shield = FALSE) and ($build = FALSE) and ($colonize = FALSE) and ($colo = FALSE) and ($parm1 <> "0"))
                send "'{" $bot_name "} - Whats the point?*"
                HALT
        ElseIF ($parm1 = "0")
                HALT
        END

	setVar $i 1
	setArray $planets 3000
	send "c;q"
	waitfor "Max Figs Per Attack"
	getword currentline $SHIP_MAX_ATTACK 5
	gosub :PLAYER~quikstats
	setvar $home $PLAYER~CURRENT_SECTOR
	setVar $turns $PLAYER~TURNS
	IF ($PLAYER~PLANET_SCANNER = "No")
	        send "'{" $bot_name "} - Planet Farmer must be run with a planet scanner.*"
		HALT
	ELSEIF ($PLAYER~CURRENT_PROMPT <> "Citadel")
	        send "'{" $bot_name "} - Planet Farmer must be run from the Citadel Prompt.*"
		HALT
	END
	
	gosub :PLANET~loadplanetInfo

        send "q"
	gosub :PLANET~getPlanetInfo
	setVar $planetToFill $PLANET~PLANET
	setVar $planetToFillFuel $PLANET~PLANET_FUEL
	setVar $planetToFillOrganics $PLANET~PLANET_ORGANICS
	setVar $planetToFillEquipment $PLANET~PLANET_EQUIPMENT
	setVar $planetToFillFuelColonists $PLANET~PLANET_FUEL_COLONISTS
	setVar $planetToFillOrganicsColonists $PLANET~PLANET_ORGANICS_COLONISTS
	setVar $planetToFillEquipmentColonists $PLANET~PLANET_EQUIPMENT_COLONISTS
	send "qq*  v"
        waitfor "Planets per sector:"
        GETWORD CURRENTLINE $planetspersector 8
        striptext $planetspersector ","
        WAITFOR "Command [TL="
        send "l " & #8 & $planetToFill & "* c "
        Window Farm_Script 330 424 ("M()M Farmer - " & GAMENAME) ONTOP
        gosub :setWindow

:start
	killalltriggers
	IF ($reverse)
                 setVar $i SECTORS
        ELSE
                 setVar $i 11
        END

:inac
:tryAgain
	WHILE ($i <= SECTORS)
                 getSectorParameter $i "BUBBLE" $BUBBLE
                 IF ($BUBBLE = TRUE)
                        goto :move_the_planet
                 ELSE
                        IF ($reverse)
                             subtract $i 1
                        ELSE
                             add $i 1
                        END
                        goto :tryAgain
                 END

		:move_the_planet
                        send "p "& $i &"  *ys* "
		        settextlinetrigger warp_it :warp_it "All Systems Ready, shall we engage?"
		        settextlinetrigger no_warp :no_warp "You do not have any fighters in Sector"
		        setTextLineTrigger alreadythere :warp_it "You are already in that sector!"
		        pause

		:no_warp
			killalltriggers
			IF ($reverse)
                             subtract $i 1
                        ELSE
                             add $i 1
                        END
			goto :tryAgain

		:warp_it
			killalltriggers
			IF ($WARP)
			      send "tt"
			      waitfor "How much to transfer?"
			      send $PLAYER~CREDITS&"*"
			      waitfor "Citadel treasury contains"
			END
                        send "q"
	                gosub :PLANET~getPlanetInfo
	                setVar $planetToFillFuel $PLANET~PLANET_FUEL
	                setVar $planetToFillOrganics $PLANET~PLANET_ORGANICS
	                setVar $planetToFillEquipment $PLANET~PLANET_EQUIPMENT
	                setVar $planetToFillFuelColonists $PLANET~PLANET_FUEL_COLONISTS
	                setVar $planetToFillOrganicsColonists $PLANET~PLANET_ORGANICS_COLONISTS
	                setVar $planetToFillEquipmentColonists $PLANET~PLANET_EQUIPMENT_COLONISTS
			gosub :count_planets
                        send "qq* "
                        IF ($build = TRUE)
			        		gosub :buildplanets
                        END
                        IF ($port)
                                gosub :check_ports
                        END
                        IF (($strip) or ($colo) or ($upgrade) or ($cash) or ($shield) or ($colonize) or ($figs))
				gosub :stripallplanets
		        END
                        IF ($silent <> TRUE)
                                send "'{" $bot_name "} - Completed All Farming/Building/Port Actions Sector: " $i ".*"
                        END
                        send "qq* l " & #8 & $planetToFill & "* "
			gosub :PLANET~getPlanetInfo
			send "c"
			IF ($reverse)
                             subtract $i 1
                        ELSE
                             add $i 1
                        END
			IF (($PLANET~PLANET_ORGANICS > ($PLANET~PLANET_ORGANICS_MAX-1000)) AND ($PLANET~PLANET_EQUIPMENT > ($PLANET~PLANET_EQUIPMENT_MAX - 1000)))
			        setVar $planetIsFull TRUE
				goto :end
                        END
	END
	goto :end

:count_planets
	send "qq*  |l"
	waitOn "Registry# and Planet Name"
	setVar $planetCount 0
	killalltriggers
	setTextLineTrigger planetGrabber :planetline "   <"
	setTextLineTrigger beDone :done "Land on which planet "
	setTextLineTrigger noplanets :done "You can create one with a Genesis Torpedo."
	send "* |"
	pause
	:planetline
		killalltriggers
		getWordPos CURRENTLINE $pos "<<<< SHIELDED"
		if ($pos <= 0)
			setVar $line CURRENTLINE
			replacetext $line "<" " "
			replacetext $line ">" " "
			striptext $line ","
			add $planetCount 1
			getWord $line $planets[$planetCount] 1
		end
		setTextLineTrigger getLine2 :planetline "   <"
		setTextLineTrigger getEnd :done "Land on which planet "
		pause
	:done
                killalltriggers
         return

:check_ports
        setvar $status_message "Checking Sector Port"
        gosub :setWindow
        send "*"
        killalltriggers
        setTextLineTrigger port_blown :port_blown "<=-DANGER-=>  Scanners indicate massive debris and heavy"
        setTextLineTrigger port_here :port_here "Class"
        setTextLineTrigger needs_port :build_port "Warps to Sector(s)"
        pause

        :port_here
	        killalltriggers
    		IF (PORT.CLASS[$PLAYER~CURRENT_SECTOR] <> 3)
                        send "l " & #8 & $planetToFill & "*  m n t *  c  "
      			waitfor "Citadel command"
                        gosub :PLAYER~quikstats
                        IF ($PLAYER~FIGHTERS < $SHIP_MAX_ATTACK)
                                IF ($silent <> TRUE)
                                         send "'{" $bot_name "} - Not Enough Fighters to Blow Port*"
                                END
                                goto  :end_check_ports
                        ELSE
                                send "qq*  pay" $SHIP_MAX_ATTACK "* * l " & #8 & $planetToFill & "*  mnt*  c  "
####  Add in triggers for blowing the port ####
                                goto  :end_check_ports
                        END
   		ELSE
                        IF (PORT.BUILDTIME[$PLAYER~CURRENT_SECTOR] > 0)
                                goto :under_construction
                        END
                        send "qq* o 1"
			waitfor "to quit)"
			getTExt CURRENTLINE $BUY "? (" "max"
			striptext $buy " "
			striptext $buy ","
			send $buy & "* *  "
			waitfor "Command"
			send "o 2"
			waitfor "to quit)"
			getTExt CURRENTLINE $BUY "? (" "max"
			striptext $buy " "
			striptext $buy ","
			send $buy & "* *  "
			waitfor "Command"
			send "o 3"
			waitfor "to quit)"
			getTExt CURRENTLINE $BUY "? (" "max"
			striptext $buy " "
			striptext $buy ","
			send $buy & "* * "
                        WAITFOR "Command [TL="
                        goto  :end_check_ports
                END
                goto  :end_check_ports

:build_port
        killalltriggers
        send "l " & #8 & $planetToFill & "*  m n t *  c "
        waitfor "Citadel command (?"
        IF ($PLAYER~CREDITS < 50000)
                send "T F 50000*"
                gosub :PLAYER~quikstats
                IF ($PLAYER~CREDITS < 50000)
                        IF ($silent <> TRUE)
                                send "'{" $bot_name "} - Not Enough Credits to Make Ports*"
                        END
                        send "qq* l " & #8 & $planetToFill & "*  c  *"
                END
        END
        send "qq* o3y" $portname "* l " & #8 & $planetToFill & "*  c  *"
        goto :end_check_ports

:port_blown
        killalltriggers
        send "qq* l " & #8 & $planetToFill & "*  c  *"
        goto :end_check_ports

:under_construction
        killalltriggers
        send "'{" $bot_name "} - Port at " & $PLAYER~CURRENT_SECTOR & " is Under Construction. " & PORT.BUILDTIME[$PLAYER~CURRENT_SECTOR] & " More Days*"
        send "l " & #8 & $planetToFill & "*  m n t *  c "
        goto :end_check_ports

:end_check_ports
        send "qq* "
        killalltriggers
        RETURN

:stripallplanets
 	setVar $j 1
	send "qq* "
	while ($j <= $planetCount)
		IF ($planetToFill <> $planets[$j])
        	        IF ($upgrade)
                             gosub :upgrade_planets
                        END
                        IF ($colonize)
                             gosub :colonize
                        END
                        send "l " & #8 & $planets[$j] & "* "
		        gosub :PLANET~getPlanetInfo
                        setVar $PLANET_FUEL $PLANET~PLANET_FUEL
                        setVar $PLANET_ORGANICS $PLANET~PLANET_ORGANICS
                        setVar $PLANET_EQUIPMENT $PLANET~PLANET_EQUIPMENT
                        setVar $PLANET_FUEL_COLONISTS $PLANET~PLANET_FUEL_COLONISTS
                        setVar $PLANET_ORGANICS_COLONISTS $PLANET~PLANET_ORGANICS_COLONISTS
                        setVar $PLANET_EQUIPMENT_COLONISTS $PLANET~PLANET_EQUIPMENT_COLONISTS
                        setVar $PLANET_CLASS $PLANET~PLANET_CLASS_NAME
                        setVar $PLANET_CITADEL_CREDITS $PLANET~CITADEL_CREDITS
                        setVar $PLANET_CITADEL $PLANET~CITADEL
                        setVar $PLANET_SHIELD_POWER $PLANET~SHIELD_POWER
                        lowercase $PLANET_CLASS
                        send "c "
                        gosub :setWindow
                        IF (($PLANET_CITADEL_CREDITS > 0) and ($cash))
                                IF ($PLANET_CITADEL_CREDITS > 999999999) or (($PLANET_CITADEL_CREDITS +  $PLAYER~CREDITS) > 999999999)
	                                setVar $PLANET_CITADEL_CREDITS (999999999 - $PLAYER~CREDITS)
	                        ELSE
                                        setVar $PLANET_CITADEL_CREDITS ($PLANET_CITADEL_CREDITS + $PLAYER~CREDITS)
                                END
                                send "t f " & $PLANET_CITADEL_CREDITS & "* qq* l " & #8 & $planetToFill & "* c t t " & $citadelCash & "* qq* "
                        END
                        IF (($shield) and ($PLANET_CITADEL > 4) and ($PLANET_SHIELD_POWER < 200))
                                IF ($PLAYER~SHIELDS < 2000)
                                        send "qq* l " & #8 & $planetToFill & "*"
                                        gosub :PLANET~getPlanetInfo
                                        IF ($PLANET~SHIELD_POWER < 200)
                                              setVar $shield FALSE
                                              send "qq* "
                                        ELSE
                                              send "cgf200*qq* "
                                        END
                                ELSE
                                       send "l " & #8 & $planets[$j] & "* c gt200*"
                                END
                        END
                        IF (($warp = TRUE) and ($PLANET~CITADEL > 3) and (($PLANET_ORGANICS > 2000) or ($PLANET_EQUIPMENT > 2000)))
                                send "qq* l " & #8 & $planets[$j] & "* c "
                                gosub :merch
                                send "d"
                                waitOn "Citadel treasury contains "
	                        getWord CURRENTLINE $citadelCash 4
	                        stripText $citadelCash ","
                                IF ($citadelCash > 0)
                                        IF ($citadelCash > 999999999) or (($citadelCash +  $PLAYER~CREDITS) > 999999999)
	                                     setVar $citadelCash (999999999 - $PLAYER~CREDITS)
	                                ELSE
                                             setVar $citadelCash ($citadelCash + $PLAYER~CREDITS)
                                        END
                                        send "t f " & $citadelCash & "* qq* l " & #8 & $planetToFill & "* c t t " & $citadelCash & "* "
                                END
                        END
                        send "qq* "

			:tryFuel
                                IF ($get_fuel)
                                        killAllTriggers
				        setvar $status_message "Stripping Fuel"
                                        setVar $TURNS ($PLAYER~TURNS-1)
#				        IF ($TURNS <= $bot_turn_limit)
#					          :lookUpPlanetStats2
#				        END
                                        send "qq* l " & #8 & $planets[$j] & "* t*t1* q* l " & #8 & $planetToFill & "* t* l1* q* "
					setTextTrigger fuelSuccess :continueFuel "You load the "
					setTextTrigger fuelEmpty :tryOrganics "There aren't that many "
					setTextTrigger fuelFull :emptyFuel "They don't have room for that many "
					pause

			                :continueFuel
			                     killalltriggers
      				             subtract $PLANET_FUEL $PLAYER~TOTAL_HOLDS
				             add $planetToFillFuel $PLAYER~TOTAL_HOLDS
				             gosub :setWindow
                                             goto :tryFuel

			                :emptyFuel
			                     killalltriggers
				             send "q* jy "
                                END
			:tryOrganics
                                IF ($get_org)
                                        killAllTriggers
				        setvar $status_message "Stripping Organics"
                                        setVar $quikstats3~TURNS ($PLAYER~TURNS-1)
#				        IF ($TURNS <= $bot_turn_limit)
#					     :lookUpPlanetStats2
#				        END
                                        send "qq* l " & #8 & $planets[$j] & "* t*t2* q l " & #8&$planetToFill & "* t*l2* q "
					setTextTrigger orgSuccess :continueOrg "You load the "
					setTextTrigger orgEmpty :tryEquipment "There aren't that many "
					setTextTrigger orgFull :emptyOrganics "They don't have room for that many "
					pause
                                        
                                        :continueOrg
                                             killalltriggers
      				             subtract $PLANET_ORGANICS $PLAYER~TOTAL_HOLDS
				             add $planetToFillOrganics $PLAYER~TOTAL_HOLDS
				             gosub :setWindow
                                             goto :tryOrganics

			                :emptyOrganics
			                     killalltriggers
			                     setVar $get_org FALSE
				             send "q* jy "
                                END

			:tryEquipment
			        IF ($get_equip)
                                        killAllTriggers
				        setvar $status_message "Stripping Equipement"
                                        setVar $PLAYER~TURNS ($PLAYER~TURNS-1)
#				        IF ($TURNS <= $bot_turn_limit)
#					     :lookUpPlanetStats2
#				        END
					send "qq* l " & #8 & $planets[$j] & "* t*t3* q l " & #8 & $planetToFill & "* t*l3* q "
					setTextTrigger equipSuccess :continueEquip "You load the "
					setTextTrigger equipEmpty :endProduct "There aren't that many "
					setTextTrigger equipFill :emptyEquipment "They don't have room for that many "
					pause

				        :continueEquip
				             killalltriggers
      				             subtract $PLANET_EQUIPMENT $PLAYER~TOTAL_HOLDS
				             add $planetToFillEquipment $PLAYER~TOTAL_HOLDS
       				             gosub :setWindow
                                             goto :tryEquipment

			                :emptyEquipment
			                     killalltriggers
				             setVar $get_equip FALSE
                                             send "q* jy "
                                END

                        :endProduct
                              killalltriggers

                        IF ($get_figs)
			     :tryFighters
			           setvar $status_message "Stripping Fighters"
                                   gosub :setWindow
				   killAllTriggers
				   send "qq* l " #8 & $planetToFill & "* m n l * q l " & #8 & $planets[$j] & "*  m  n"
				   WaitOn "Do you wish to (L)eave or (T)ake Fighters? [T]"
				   send "t"
				   waitOn " Max) ["
				   getWord CURRENTLINE $figsToGrab 9
				   stripText $figsToGrab "("
				   send $figsToGrab & "* qq* "
                                   IF ($figsToGrab < 100)
				   	goto :try_colo
				   END
				   goto :tryFighters
			END

                        :try_colo
                        IF ($colo)
                             send "qq* jy* l " & #8 & $planets[$j] & "*  "
                              setVar $i 1
                              setVar $foundPlanet FALSE
                              while (($i < $PLANET~planetcounter) AND ($foundPlanet = FALSE))
                                      lowercase $PLANET~planetList[$i]
                                      lowercase $PLANET_CLASS
				      getWordPos $PLANET~planetList[$i] $pos $PLANET_CLASS
				      if ($pos > 0)
					   setVar $PLANET_FUEL_COLONISTS_MAX $PLANET~planetList[$i][1]
					   setVar $PLANET_ORGANICS_COLONISTS_MAX $PLANET~planetList[$i][2]
					   setVar $PLANET_EQUIPMENT_COLONISTS_MAX $PLANET~planetList[$i][3]
					   setVar $PLANET_FUEL_COLONISTS_MIN ($PLANET~planetList[$i][1]-1000)
					   setVar $PLANET_ORGANICS_COLONISTS_MIN ($PLANET~planetList[$i][2]-1000)
					   setVar $PLANET_EQUIPMENT_COLONISTS_MIN ($PLANET~planetList[$i][3]-1000)
					   echo $PLANET_FUEL_COLONISTS_MAX & "*"
      					   echo $PLANET_ORGANICS_COLONISTS_MAX & "*"
       					   echo $PLANET_EQUIPMENT_COLONISTS_MAX & "*"
					   echo $PLANET_FUEL_COLONISTS_MIN & "*"
       					   echo $PLANET_ORGANICS_COLONISTS_MIN "*"
       					   echo $PLANET_EQUIPMENT_COLONISTS_MIN & "*"
                                           setVar $foundPlanet TRUE
				      end
				      add $i 1
				end
			        if ($foundPlanet = FALSE)
				   send "'{" $bot_name "} - [" & $PLANET_CLASS & "] Planet Class Not Recognized Sector: " & $PLAYER~CURRENT_SECTOR & "["&$PLANET~planetList[$i]&"]*"
				   goto :doneWithThisPlanet
				end
                                   WHILE ($PLANET_FUEL_COLONISTS > $PLANET_FUEL_COLONISTS_MAX)
                                        setvar $status_message "Stripping Fuel Colonists"
                                        gosub :setWindow
                                        killalltriggers
                                        setVar $moveColo "fuel"
				        subtract $PLANET_FUEL_COLONISTS $PLAYER~TOTAL_HOLDS
                                        send "qq* l " & #8 & $planets[$j] & "*  snt1*  q l " & #8 & $planetToFill & "*  snl1*"
                                        setTextTrigger no_room :no_room1 "on the planet"
                                        setTextTrigger is_room :is_room1 "The Colonists disembark to begin their new life."
                                        pause

                                        :no_room1
                                               killalltriggers
                                               setVar $moveColo "org"
                                               send "snl2*"
                                               setTextTrigger no_room :no_room2 "on the planet"
                                               setTextTrigger is_room :is_room1 "The Colonists disembark to begin their new life."
                                               pause

                                        :no_room2
                                               killalltriggers
                                               setVar $moveColo "equip"
                                               send "snl3*"
                                               setTextTrigger no_room :no_room3 "on the planet"
                                               setTextTrigger is_room :is_room1 "The Colonists disembark to begin their new life."
                                               pause

                                        :no_room3
                                                setVar $moveColo "JETT"

                                        :is_room1
                                               killalltriggers
                                               IF ($moveColo = "fuel")
				                       add $planetToFillFuelColonists $PLAYER~TOTAL_HOLDS
				               ELSEIF ($moveColo = "org")
                                                       add $planetToFillOrganicsColonists $PLAYER~TOTAL_HOLDS
                                               ELSEIF ($moveColo = "equip")
                                                       add $planetToFillEquipmentColonists $PLAYER~TOTAL_HOLDS
                                               END
                                               send "q j y * "
                                   END

                                   WHILE ($PLANET_FUEL_COLONISTS < $PLANET_FUEL_COLONISTS_MIN)
                                        setvar $status_message "Adding Fuel Colonists"
                                        gosub :setWindow
                                        setVar $moveColo "fuel"
                                        killalltriggers
                                        send "q j y * l " & #8 & $planetToFill & "*  snt1*"
                                        setTextTrigger grab_colos :grab_colos_fuel "The Colonists file aboard your ship, eager to head out."
                                        setTextTrigger no_colos   :no_colos_fuel1   "There aren't that many on the planet!"
                                        pause

                                        :no_colos_fuel1
                                               killalltriggers
                                               setVar $moveColo "org"
                                               send "snt2*"
                                               setTextTrigger grab_colos :grab_colos_fuel "The Colonists file aboard your ship, eager to head out."
                                               setTextTrigger no_colos   :no_colos_fuel2   "There aren't that many on the planet!"
                                               pause

                                        :no_colos_fuel2
                                               killalltriggers
                                               setVar $moveColo "equip"
                                               send "snt3*"
                                               setTextTrigger grab_colos :grab_colos_fuel "The Colonists file aboard your ship, eager to head out."
                                               setTextTrigger no_colos   :no_colos_fuel3   "There aren't that many on the planet!"
                                               pause

                                        :grab_colos_fuel
                                              killalltriggers
                                              send "ql  " & #8 & #8 & $planets[$j] & "*  snl1*"
                                              setTextTrigger no_room :no_colos_fuel3 "on the planet"
                                              setTextTrigger is_room :is_room_fuel "The Colonists disembark to begin their new life."
                                              pause

                                        :no_colos_fuel3
                                              killalltriggers
                                              setVar $moveColo "JETT"
                                              setvar $PLANET_FUEL_COLONISTS $PLANET_FUEL_COLONISTS_MIN

                                        :is_room_fuel
                                               killalltriggers
                                               IF ($moveColo = "fuel")
                                                       add $PLANET_FUEL_COLONISTS $PLAYER~TOTAL_HOLDS
				                       subtract $planetToFillFuelColonists $PLAYER~TOTAL_HOLDS
				               ELSEIF ($moveColo = "org")
                                                       add $PLANET_FUEL_COLONISTS $PLAYER~TOTAL_HOLDS
                                                       subtract $planetToFillOrganicsColonists $PLAYER~TOTAL_HOLDS
                                               ELSEIF ($moveColo = "equip")
                                                       add $PLANET_FUEL_COLONISTS $PLAYER~TOTAL_HOLDS                                               
                                                       subtract $planetToFillEquipmentColonists $PLAYER~TOTAL_HOLDS
                                               END

                                   END

                                   WHILE ($PLANET_ORGANICS_COLONISTS > $PLANET_ORGANICS_COLONISTS_MAX)
                                        setvar $status_message "Stripping Organic Colonists"
                                        gosub :setWindow
                                        killalltriggers
                                        setVar $moveColo "fuel"
                                        subtract $PLANET_ORGANICS_COLONISTS $PLAYER~TOTAL_HOLDS
                                        send "qq*  l " & #8 & $planets[$j] & "*  snt2*  q l  " & #8 & #8 & $planetToFill & "*  snl1*"
                                        setTextTrigger no_room :no_room4 "on the planet"
                                        setTextTrigger is_room :is_room2 "The Colonists disembark to begin their new life."
                                        pause

                                        :no_room4
                                               killalltriggers
                                               setVar $moveColo "org"
                                               send "snl2*"
                                               setTextTrigger no_room :no_room5 "on the planet"
                                               setTextTrigger is_room :is_room2 "The Colonists disembark to begin their new life."
                                               pause

                                        :no_room5
                                               killalltriggers
                                               setVar $moveColo "equip"
                                               send "snl3*"
                                               setTextTrigger no_room :no_room6 "on the planet"
                                               setTextTrigger is_room :is_room2 "The Colonists disembark to begin their new life."
                                               pause

                                        :no_room6
                                               setVar $moveColo "JETT"

                                        :is_room2
                                               killalltriggers
                                               IF ($moveColo = "fuel")
				                       add $planetToFillFuelColonists $PLAYER~TOTAL_HOLDS
				               ELSEIF ($moveColo = "org")
                                                       add $planetToFillOrganicsColonists $PLAYER~TOTAL_HOLDS
                                               ELSEIF ($moveColo = "equip")
                                                       add $planetToFillEquipmentColonists $PLAYER~TOTAL_HOLDS
                                               END
                                               subtract $PLANET_ORGANICS_COLONISTS $PLAYER~TOTAL_HOLDS
                                               send "q  j  y  *  l  " & #8 & #8 & $planets[$j] & "*  "
                                   END

                                   WHILE ($PLANET_ORGANICS_COLONISTS < $PLANET_ORGANICS_COLONISTS_MIN)
                                        setvar $status_message "Adding Organic Colonists"
                                        setVar $moveColo "fuel"
                                        gosub :setWindow
                                        killalltriggers
                                        send "q* l " & #8 & $planetToFill & "* snt1*"
                                        setTextTrigger grab_colos :grab_colos_org "The Colonists file aboard your ship, eager to head out."
                                        setTextTrigger no_colos   :no_colos_org1   "There aren't that many on the planet!"
                                        pause

                                        :no_colos_org1
                                               killalltriggers
                                               setVar $moveColo "org"
                                               send "snt2*"
                                               setTextTrigger grab_colos :grab_colos_org "The Colonists file aboard your ship, eager to head out."
                                               setTextTrigger no_colos   :no_colos_org2   "There aren't that many on the planet!"
                                               pause

                                        :no_colos_org2
                                               killalltriggers
                                               setVar $moveColo "equip"
                                               send "snt3*"
                                               setTextTrigger grab_colos :grab_colos_org "The Colonists file aboard your ship, eager to head out."
                                               setTextTrigger no_colos   :no_colos_org3   "There aren't that many on the planet!"
                                               pause

                                        :grab_colos_org
                                              killalltriggers
                                              send "q* l " & #8 & $planets[$j] & "*  snl2*"
                                              setTextTrigger no_room :no_colos_org3 "on the planet"
                                              setTextTrigger is_room :is_room_org "The Colonists disembark to begin their new life."
                                              pause

                                        :no_colos_org3
                                              killalltriggers
                                              setVar $moveColo "JETT"
                                              setvar $PLANET_ORGANICS_COLONISTS $PLANET_ORGANICS_COLONISTS_MIN

                                        :is_room_org
                                              killalltriggers
                                              IF ($moveColo = "fuel")
				                      subtract $planetToFillFuelColonists $PLAYER~TOTAL_HOLDS
				              ELSEIF ($moveColo = "org")
                                                      subtract $planetToFillOrganicsColonists $PLAYER~TOTAL_HOLDS
                                              ELSEIF ($moveColo = "equip")
                                                      subtract $planetToFillEquipmentColonists $PLAYER~TOTAL_HOLDS
                                              END
                                              add $PLANET_ORGANICS_COLONISTS $PLAYER~TOTAL_HOLDS
                                   END

                                   WHILE ($PLANET_EQUIPMENT_COLONISTS > $PLANET_EQUIPMENT_COLONISTS_MAX)
                                        setvar $status_message "Stripping Equipment Colonists"
                                        gosub :setWindow
                                        setVar $moveColo "fuel"
                                        killalltriggers
                                        subtract $PLANET_EQUIPMENT_COLONISTS $PLAYER~TOTAL_HOLDS
                                        send "q* l " & #8 & $planets[$j] & "*  snt3*  ql " & #8 & $planetToFill & "*  snl1*"
                                        setTextTrigger no_room :no_room7 "on the planet"
                                        setTextTrigger is_room :is_room3 "The Colonists disembark to begin their new life."
                                        pause

                                        :no_room7
                                               killalltriggers
                                               setVar $moveColo "org"
                                               send "snl2*"
                                               setTextTrigger no_room :no_room8 "on the planet"
                                               setTextTrigger is_room :is_room3 "The Colonists disembark to begin their new life."
                                               pause

                                        :no_room8
                                               killalltriggers
                                               setVar $moveColo "equip"
                                               send "snl3*"
                                               setTextTrigger no_room :no_room9 "on the planet"
                                               setTextTrigger is_room :is_room3 "The Colonists disembark to begin their new life."
                                               pause

                                        :no_room9
                                               setVar $moveColo "JETT"

                                        :is_room3
                                               killalltriggers
                                               IF ($moveColo = "fuel")
				                       add $planetToFillFuelColonists $PLAYER~TOTAL_HOLDS
				               ELSEIF ($moveColo = "org")
                                                       add $planetToFillOrganicsColonists $PLAYER~TOTAL_HOLDS
                                               ELSEIF ($moveColo = "equip")
                                                       add $planetToFillEquipmentColonists $PLAYER~TOTAL_HOLDS
                                               END
                                               send "qj y * l " & #8 & $planets[$j] & "*  "
                                   END

                                   WHILE ($PLANET_EQUIPMENT_COLONISTS < $PLANET_EQUIPMENT_COLONISTS_MIN)
                                        setvar $status_message "Adding Equipment Colonists"
                                        gosub :setWindow
                                        killalltriggers
                                        setVar $moveColo "fuel"
                                        send "q* l " & #8 & $planetToFill & "*  snt1*"
                                        setTextTrigger grab_colos :grab_colos_equip "The Colonists file aboard your ship, eager to head out."
                                        setTextTrigger no_colos   :no_colos_equip1   "There aren't that many on the planet!"
                                        pause

                                        :no_colos_equip1
                                               killalltriggers
                                               setVar $moveColo "org"
                                               send "snt2*"
                                               setTextTrigger grab_colos :grab_colos_equip "The Colonists file aboard your ship, eager to head out."
                                               setTextTrigger no_colos   :no_colos_equip2   "There aren't that many on the planet!"
                                               pause

                                        :no_colos_equip2
                                               killalltriggers
                                               setVar $moveColo "equip"
                                               send "snt3*"
                                               setTextTrigger grab_colos :grab_colos_equip "The Colonists file aboard your ship, eager to head out."
                                               setTextTrigger no_colos   :no_colos_equip3   "There aren't that many on the planet!"
                                               pause

                                        :grab_colos_equip
                                              killalltriggers
                                              send "ql " & #8 & $planets[$j] & "*  snl3*"
                                              setTextTrigger no_room :no_colos_equip3 "on the planet"
                                              setTextTrigger is_room :is_room_equip "The Colonists disembark to begin their new life."
                                              pause

                                        :no_colos_equip3
                                              killalltriggers
                                              setVar $moveColo "JETT"
                                              setvar $PLANET_EQUIPMENT_COLONISTS $PLANET_EQUIPMENT_COLONISTS_MIN

                                        :is_room_equip
                                              killalltriggers
                                              IF ($moveColo = "fuel")
				                      subtract $planetToFillFuelColonists $PLAYER~TOTAL_HOLDS
				              ELSEIF ($moveColo = "org")
                                                      subtract $planetToFillOrganicsColonists $PLAYER~TOTAL_HOLDS
                                              ELSEIF ($moveColo = "equip")
                                                      subtract $planetToFillEquipmentColonists $PLAYER~TOTAL_HOLDS
                                              END
                                              add $PLANET_EQUIPMENT_COLONISTS $PLAYER~TOTAL_HOLDS
                                   END
                        END
                        send "q* jy* "
                        :doneWithThisPlanet
			      killAllTriggers
		END
                add $j 1
	END
	send "qq* l " & #8 & $planetToFill & "*  c"
        RETURN

:upgrade_planets
        setvar $status_message "Upgrading Planet"
        gosub :setWindow
        killalltriggers
        send "qq* l " & #8 & $planets[$j] & "*  c u y"
        goto :endPlanetUpgrade
        gosub :PLANET~getPlanetInfo
        setVar $PLANET_FUEL_TO_UPGRADE $PLANET~PLANET_FUEL
        setVar $PLANET_ORGANICS_TO_UPGRADE $PLANET~PLANET_ORGANICS
        setVar $PLANET_EQUIPMENT_TO_UPGRADE $PLANET~PLANET_EQUIPMENT
        setVar $PLANET_FUEL_COLONISTS_TO_UPGRADE $PLANET~PLANET_FUEL_COLONISTS
        setVar $PLANET_ORGANICS_COLONISTS_TO_UPGRADE $PLANET~PLANET_ORGANICS_COLONISTS
        setVar $PLANET_EQUIPMENT_COLONISTS_TO_UPGRADE $PLANET~PLANET_EQUIPMENT_COLONISTS
        setVar $PLANET_CIDATEL_TO_UPGRADE $PLANET~CITADEL
        IF ($PLANET_CIDATEL_TO_UPGRADE > 5)
              goto :endPlanetUpgrade
        END

:endPlanetUpgrade
       send "qq* "
       RETURN

:buildplanets
#        IF ($PLAYER~CURRENT_SECTOR = $home)
#                echo "*Heading To Next Sector* "
#                goto :buildplanetsend
#        END
        killalltriggers
        setTextLineTrigger port_blown1 :buildplanetsend "<=-DANGER-=>  Scanners indicate massive debris and heavy"
        setTextLineTrigger port_here1 :buildnext "Class"
        setTextLineTrigger needs_port1 :buildnext "Warps to Sector(s)"
        send "qqzn*"
        pause

:buildnext
        killalltriggers
        setVar $tempPlanetCount $planetCount
        setVar $planetsPerSector2 $planetspersector
        subtract $tempPlanetCount 1
        send "qqzn * l " & #8 & $planetToFill & "*mnt* qq* "
        setvar $status_message "Building Planets"
        gosub :setWindow
        subtract $planetsPerSector2 $tempPlanetCount
        IF ($planetsPerSector2 < 1)
                goto :buildplanetsend
        END

:LetsGoAgain
        gosub :PLAYER~quikstats
        IF (($PLAYER~ATOMIC < 1) or ($PLAYER~GENESIS < 1))
                gosub :get_dets
        END
	send "u y"
	setTextLineTrigger NoOverLoad	:NoOverload "What do you want to name this planet?"
	setTextLineTrigger Yikes	:Yikes      "I'm sorry, but not enough free matter exists."
	setTExtLineTrigger NeedGenTs	:NeedGenTs  "You don't have any Genesis Torpedoes to launch!"
	setTextTrigger     OverLoad 	:Overload   "Do you wish to abort?"
	pause

:NeedGenTs
	killAllTriggers
	send " Q "
	send "'{" $bot_name "} - Cannot Pop A Planet - Out Of Genesis Torpedoes.*"
	goto :buildplanetsend

:Yikes
	killAllTriggers
	send "'{" $bot_name "} - Bad News - Game Maximum Planets Reached.*"
	goto :buildplanetsend:

:Overload
	killTrigger Overload
	send "n"
	pause

:NoOverload
	killAllTriggers
	getWord CURRENTLINE $planet_type 11
	lowercase $planet_type
	striptext $planet_type ")"
	echo $planet_type&"*"
	#echo $planet_type&"*"
	#echo $planet_type&"*"
	#IF ($planet_type <> "striking")
	#	getRnd $PTag 100000 999999
	#	setVar $PlanetLabel "["&$PTag&"]"&"M()M Planet Farm "&"["&$PTag&"]"
    #ELSE
		setVar $PlanetLabel "FARM"
	#END
	send $PlanetLabel & "*"

#=------------------------ Planet's Been Popped ---------------------------------------
	setTextTrigger MakingItCorp     :MakingItCorp "Should this be a (C)orporate planet or (P)ersonal planet? "
	setTextTrigger LetsGo		:LetsGo       "Command [TL="
	pause

:MakingItCorp
	killTrigger MakingItCorp
	send "C"
	pause

:LetsGo
	killAllTriggers
	IF (($PlanetLabel <> "FARM") and ($PlanetLabel <> "DOOR"))
		send "L"
		setTextLineTrigger Plisted		:Plisted "-----------------------------------------------"
		setTextTrigger Landed			:Landed "Planet command (?="
		pause

:Plisted
		killTrigger PListed
		waitfor "> " & $PlanetLabel
		getText CURRENTLINE $landing "<" ">"
		striptext $landing " "
		send $landing & "*"
		pause

# add in code to strip the plant if there is product
:Landed
                killAllTriggers
		send "  Z  D  Y  "
		setTextLineTrigger NoDets	:NoDets "You do not have any Atomic Detonators!"
		setTextTrigger KaBoom		:KaBoom "Command [TL="
		pause

:NoDets
		killTrigger NoDets
		send "'{" $bot_name "} - Out Of Atomic Dets*"
                gosub :get_dets

:KaBoom
		killAllTriggers
		goto :LetsGoAgain
        END

:buildplanetsend
        killalltriggers
        RETURN

:end
        killalltriggers
        IF ($merch)
                gosub :merch
        END
        send "p " & $home & "  *ys* "
        send "'{" $bot_name "} - Farming run is complete.*"
        gosub :PLAYER~quikstats
        IF ($PLAYER~CURRENT_SECTOR <> $home)
	        send "'{" $bot_name "} - Could not make it back to starting sector!*"
        END
        HALT

:setWindow
        gosub :PLAYER~quikstats
        setVar $msg "* Status: " & $status_message
        setVar $msg $msg & "* Home Sector:   " & $home
        setVar $msg $msg & "* Current Sector " & $PLAYER~CURRENT_SECTOR
        IF ($PLAYER~TURNS > 0)
                setVar $msg $msg & "* Turns: " & $PLAYER~TURNS
        END
        setVar $msg $msg & "* Farm Planet: " & $planetToFill
	setVar $msg $msg & "* ----------------"
        setVar $msg $msg & "* Fuel: " & $planetToFillFuel
        setVar $msg $msg & "* Organics: " & $planetToFillOrganics
        setVar $msg $msg & "* Equipment: " & $planetToFillEquipment
	setVar $msg $msg & "* Fuel Colonists: " & $planetToFillFuelColonists
	setVar $msg $msg & "* Organics Colonists: " & $planetToFillOrganicsColonists
	setVar $msg $msg & "* Equipment Colonists: " & $planetToFillEquipmentColonists
        setVar $msg $msg & "** Target Planet: " & $planets[$j]
	setVar $msg $msg & "* ----------------"
        setVar $msg $msg & "* Fuel: " & $PLANET_FUEL
        setVar $msg $msg & "* Organics: " & $PLANET_ORGANICS
        setVar $msg $msg & "* Equipment: " & $PLANET_EQUIPMENT
        setVar $msg $msg & "* Fuel Colonists: " & $PLANET_FUEL_COLONISTS
        setVar $msg $msg & "* Organics Colonists: " & $PLANET_ORGANICS_COLONISTS
        setVar $msg $msg & "* Equipment Colonists: " & $PLANET_EQUIPMENT_COLONISTS
        setVar $msg $msg & "* Min / Max Fuel Colo: " & $PLANET_FUEL_COLONISTS_MIN & " / " & $PLANET_FUEL_COLONISTS_MAX
        setVar $msg $msg & "* Min / Max Organics Colo: " & $PLANET_ORGANICS_COLONISTS_MIN & " / " & $PLANET_ORGANICS_COLONISTS_MAX
        setVar $msg $msg & "* Min / Max Equipment Colo: " & $PLANET_EQUIPMENT_COLONISTS_MIN & " / " & $PLANET_EQUIPMENT_COLONISTS_MAX
        setVar $msg $msg & "** Credits: " & $PLAYER~CREDITS
        setWindowContents Farm_Script $msg & $msg1
        return
        
:merch
        setvar $status_message "Selling Product"
        gosub :setWindow
	gosub :quikstats
	setVar $startingLocation $CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		send "'{" $bot_name "} - You must run Planet Merchant command from a Citadel prompt.*"
     		halt
	end

:merchant
	killalltriggers
	setArray $checkedPorts SECTORS
	setArray $que SECTORS
	setArray $checked SECTORS
	send "q"
	waitOn "Planet command (?"
	gosub :getPlanetInfo
	send "c"
	setVar $sectorCount 10
	setVar $totalHolds 0 
	setVar $spentCredits 0
	setVar $startingSector $CURRENT_SECTOR
	IF ($warp <> TRUE)
	        send "'{" $bot_name "} - Planet Merchant Downloading Current Port CIM Data - Comms Off*"
	        send "^rq"
	        waitFor ": ENDINTERROG"
         	send "'{" $bot_name "} - Planet Merchant CIM Port Data Complete - Comms Back On*"
        END
	while ((($sellingOrg) AND ($planetorg >= 500)) OR (($sellingEquip) AND ($planetequip >= 500)))
		:inac
		if (($unlimitedGame = FALSE) AND ($TURNS <= $bot_turn_limit))
			send "'{" $bot_name "} - Turns too low to continue.*"
			goto :doneMerchant
		end
		setVar $bottom 1
		setVar $top 1
		setArray $checked SECTORS
		setVar $que[1] $CURRENT_SECTOR
		setVar $checked[$CURRENT_SECTOR] 1
		:tryAgain2
		while ($bottom <= $top)
			# Now, pull out the next sector in the que, and make it our focus
			setVar $focus $que[$bottom]
			# If this sector is our xxB, we're done!
			getSectorParameter $focus "BUSTED" $isBusted
			if (($isBusted <> TRUE) AND ($checkedPorts[$focus] <> TRUE) AND (PORT.EXISTS[$focus]) AND ((($sellingOrg) AND ($planetorg > 500) AND (PORT.BUYORG[$focus]) AND (PORT.ORG[$focus] >= $minimumFuel)) OR (($sellingEquip) AND ($planetequip > 500) AND (PORT.BUYEQUIP[$focus]) AND (PORT.EQUIP[$focus] >= $minimumFuel))))
				# fig found 0 hops
				setVar $NearFig $focus
				setVar $checkedPorts[$NearFig] TRUE
				goto :continueOn2
			else
				setVar $nearfig 0
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
			add $bottom 1
		end	
		send "'{" $bot_name "} Can't find a route to any other ports.*"
     		goto :doneMerchant
		:continueOn2
			IF (($NearFig > 0) and ($NearFig < SECTORS))
				killAllTriggers
				send "p"&$NearFig&"*y"
				setTextLineTrigger warped :emptyPort2 "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
				setTextLineTrigger same :emptyPort2 "You are already in that sector!"
				setTextLineTrigger didnotwarp :noFigAtLocation "Your own fighters must be in the destination to make a safe jump."
				setTextLineTrigger notEnoughFuel :doneNoFuel2 "You do not have enough Fuel Ore on this planet to make the jump."
				pause
				:emptyPort2
					setSectorParameter $NearFig "FIGSEC" TRUE
				if ($planetNegotiate = TRUE)
					killAllTriggers
					setVar $_ck_pnego_fueltosell "-1"
					if ($sellingOrg)
						setVar $_ck_pnego_orgtosell "max"
					else
						setVar $_ck_pnego_orgtosell "-1"
					end
					if ($sellingEquip)
						setVar  $_ck_pnego_equiptosell "max"
					else
						setVar  $_ck_pnego_equiptosell "-1"
					end
					gosub :planetNeg
					if (($buyFuel = TRUE) AND (PORT.BUYFUEL[$NearFig] = FALSE))
						gosub :buydownfuel
					end
				else
					killAllTriggers
					gosub :quikstats
					send "q"
					waitOn "Planet command (?"
					gosub :getPlanetInfo
					send "c"
					gosub :setWindow
					send "q q *cr*q"
					waitOn "Fuel Ore"
					getWord CURRENTLINE $totalPortFuel 4
					waitOn "Organics"
					getWord CURRENTLINE $totalPortOrganics 3
					waitOn "Equipment"
					getWord CURRENTLINE $totalPortEquipment 3
					waitOn "<Computer deactivated>"
					if (($planetFuelMax-$planetFuel) < $totalPortFuel)
						setVar $turnsToEmptyFuel ((($planetFuelMax-$planetFuel)/$TOTAL_HOLDS-1)
					else
						setVar $turnsToEmptyFuel (($totalPortFuel/$TOTAL_HOLDS)-1)
					end
					if ((PORT.BUYORG[$NearFig] = TRUE) AND ($sellingOrg))
						if ($planetOrg < $totalPortOrganics)
							setVar $turnsSellingProduct (($planetOrg/$TOTAL_HOLDS)-1)
						else
							setVar $turnsSellingProduct (($totalPortOrganics/$TOTAL_HOLDS))
						end
						if (($unlimitedGame = FALSE) AND (($TURNS - $turnsSellingProduct) <= $bot_turn_limit))
							send "'{" $bot_name "} - Turns too low to continue.*"
							send "l "&$planet&"* c "
							goto :doneMerchant
						end
						if ((PORT.BUYFUEL[$NearFig] = FALSE) AND ($buyFuel = TRUE))
							send "l "&$planet&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
							gosub :quikstats
							while (($turnsSellingProduct > 0) AND ($turnsToEmptyFuel > 1))
									send "l " $planet "*   t  *  l 1* t  *  * 2*  q P * *"
									gosub :startHaggle
									send "*"
									gosub :startHaggle
									send " 0 *  /"
									if ($ni <> TRUE)
										subtract $turnsSellingProduct 1
									end
									subtract $turnsToEmptyFuel 1
									add $totalOrganicHolds $TOTAL_HOLDS
									waitOn "?Turns"
							end
						end
						send "l "&$planet&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
						gosub :quikstats
                                                gosub :setWindow
						while ($turnsSellingProduct > 0)
							send "l " $planet "*  t  *  * 2*  q P * *"
							gosub :startHaggle
							send "0 * 0 *  /"
							waitOn "?Turns"
							if ($ni <> TRUE)
								subtract $turnsSellingProduct 1
							end
							add $totalOrganicHolds $TOTAL_HOLDS
						end
					end
					if ((PORT.BUYEQUIP[$NearFig] = TRUE) AND ($sellingEquip))
						if ($planetEquip < $totalPortEquipment)
							setVar $turnsSellingProduct (($planetEquip/$TOTAL_HOLDS)-1)
						else
							setVar $turnsSellingProduct (($totalPortEquipment/$TOTAL_HOLDS))
						end
						if ((PORT.BUYFUEL[$NearFig] = FALSE) AND ($buyFuel = TRUE))
							send "l "&$planet&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
							while (($turnsSellingProduct > 0) AND ($turnsToEmptyFuel > 1))
								send "l " $planet "*   t  *  l 1* t  *  * 3*  q P * *"
								gosub :startHaggle
								send "*"
								gosub :startHaggle
								send " 0 *  /"
								if ($ni <> TRUE)
									subtract $turnsSellingProduct 1
								end
								subtract $turnsToEmptyFuel 1
								add $totalEquipmentHolds $TOTAL_HOLDS
								waitOn "?Turns"
							end
						end
						gosub :setWindow
						send "l "&$planet&"* t n l 1* t nl 2* t n l 3* s n l 1* s n l 2* s n l 3* q jy "
						while ($turnsSellingProduct > 0)
							send "l " $planet "*  t  *  * 3*  q P * *"
							gosub :startHaggle
							send "0 * 0 *  /"
							if ($ni <> TRUE)
								subtract $turnsSellingProduct 1
							end
							add $totalEquipmentHolds $TOTAL_HOLDS
							waitOn "?Turns"
						end
					end
				end
					
				send "#"
				waitOn "                            Who's Playing"
				IF ($planetNegotiate <> TRUE)
					gosub :landOnPlanetEnterCitadel
				END
				IF ($upgrade)
                                        gosub :check_ports
				END
                                send "cr*q"
				gosub :quikstats
			end
		end
		:doneMerchant
                        send "p" & $startingSector & "*y"
                        return


# ============================== QUICKSTATS ==============================
:quikstats

        # ============================ START QUIKSTAT VARIABLES ==========================
                setVar $CURRENT_PROMPT          "Undefined"
                setVar $PSYCHIC_PROBE           "NO"
                setVar $PLANET_SCANNER          "NO"
                setVar $SCAN_TYPE               "NONE"
                setVar $CURRENT_SECTOR          0
                setVar $TURNS                   0
                setVar $CREDITS                 0
                setVar $FIGHTERS                0
                setVar $SHIELDS                 0
                setVar $TOTAL_HOLDS             0
                setVar $ORE_HOLDS               0
                setVar $ORGANIC_HOLDS           0
                setVar $EQUIPMENT_HOLDS         0
                setVar $COLONIST_HOLDS          0
                setVar $PHOTONS                 0
                setVar $ARMIDS                  0
                setVar $LIMPETS                 0
                setVar $GENESIS                 0
                setVar $TWARP_TYPE              0
                setVar $CLOAKS                  0
                setVar $BEACONS                 0
                setVar $ATOMIC                  0
                setVar $CORBO                   0
                setVar $EPROBES                 0
                setVar $MINE_DISRUPTORS         0
                setVar $ALIGNMENT               0
                setVar $EXPERIENCE              0
                setVar $CORP                    0
                setVar $SHIP_NUMBER             0
                setVar $TURNS_PER_WARP          0
                setVar $COMMAND_PROMPT          "Command"
                setVar $COMPUTER_PROMPT         "Computer"
                setVar $CITADEL_PROMPT          "Citadel"
                setVar $PLANET_PROMPT           "Planet"
                setVar $CORPORATE_PROMPT        "Corporate"
                setVar $STARDOCK_PROMPT         "<Stardock>"
                setVar $HARDWARE_PROMPT         "<Hardware"
                setVar $SHIPYARD_PROMPT         "<Shipyard>"
                setVar $TERRA_PROMPT            "Terra"
        # ============================ END QUIKSTAT VARIABLES ==========================

     	setVar $CURRENT_PROMPT 		"Undefined"
	killtrigger noprompt
	killtrigger prompt1
	killtrigger prompt2
	killtrigger prompt3
	killtrigger prompt4
	killtrigger statlinetrig
	killtrigger getLine2
	setTextLineTrigger 	prompt		:allPrompts	 	#145 & #8
	setTextLineTrigger 	statlinetrig 	:statStart 		#179
	send #145&"/"
	pause

	:allPrompts
		getWord CURRENTLINE $CURRENT_PROMPT 1
		stripText $CURRENT_PROMPT #145
		stripText $CURRENT_PROMPT #8
		#getWord currentansiline $checkPrompt 1
		#getWord currentline $tempPrompt 1
		#getWordPos $checkPrompt $pos "[35m"
		#if ($pos > 0)
		#	setVar $CURRENT_PROMPT $tempPrompt
		#end
		setTextLineTrigger 	prompt		:allPrompts	 	#145 & #8
		pause

	:statStart
		killtrigger prompt
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger noprompt
		setVar $stats ""
		setVar $wordy ""


	:statsline
		killtrigger statlinetrig
		killtrigger getLine2
		setVar $line2 CURRENTLINE
		replacetext $line2 #179 " "
		striptext $line2 ","
		setVar $stats $stats & $line2
		getWordPos $line2 $pos "Ship"
		if ($pos > 0)
			goto :gotStats
		else
			setTextLineTrigger getLine2 :statsline
			pause
		end

	:gotStats
		setVar $stats $stats & " @@@"

		setVar $current_word 0
		while ($wordy <> "@@@")
			if ($wordy = "Sect")
				getWord $stats $CURRENT_SECTOR   	($current_word + 1)
			elseif ($wordy = "Turns")
				getWord $stats $TURNS  			($current_word + 1)
			elseif ($wordy = "Creds")
				getWord $stats $CREDITS  		($current_word + 1)
			elseif ($wordy = "Figs")
				getWord $stats $FIGHTERS   		($current_word + 1)
			elseif ($wordy = "Shlds")
				getWord $stats $SHIELDS  		($current_word + 1)
			elseif ($wordy = "Hlds")
				getWord $stats $TOTAL_HOLDS   		($current_word + 1)
			elseif ($wordy = "Ore")
				getWord $stats $ORE_HOLDS    		($current_word + 1)
			elseif ($wordy = "Org")
				getWord $stats $ORGANIC_HOLDS    	($current_word + 1)
			elseif ($wordy = "Equ")
				getWord $stats $EQUIPMENT_HOLDS    	($current_word + 1)
			elseif ($wordy = "Col")
				getWord $stats $COLONIST_HOLDS    	($current_word + 1)
			elseif ($wordy = "Phot")
				getWord $stats $PHOTONS   		($current_word + 1)
			elseif ($wordy = "Armd")
				getWord $stats $ARMIDS   		($current_word + 1)
			elseif ($wordy = "Lmpt")
				getWord $stats $LIMPETS   		($current_word + 1)
			elseif ($wordy = "GTorp")
				getWord $stats $GENESIS  		($current_word + 1)
			elseif ($wordy = "TWarp")
				getWord $stats $TWARP_TYPE  		($current_word + 1)
			elseif ($wordy = "Clks")
				getWord $stats $CLOAKS   		($current_word + 1)
			elseif ($wordy = "Beacns")
				getWord $stats $BEACONS 		($current_word + 1)
			elseif ($wordy = "AtmDt")
				getWord $stats $ATOMIC  		($current_word + 1)
			elseif ($wordy = "Corbo")
				getWord $stats $CORBO   		($current_word + 1)
			elseif ($wordy = "EPrb")
				getWord $stats $EPROBES   		($current_word + 1)
			elseif ($wordy = "MDis")
				getWord $stats $MINE_DISRUPTORS   	($current_word + 1)
			elseif ($wordy = "PsPrb")
				getWord $stats $PSYCHIC_PROBE  		($current_word + 1)
			elseif ($wordy = "PlScn")
				getWord $stats $PLANET_SCANNER  	($current_word + 1)
			elseif ($wordy = "LRS")
				getWord $stats $SCAN_TYPE    		($current_word + 1)
			elseif ($wordy = "Aln")
				getWord $stats $ALIGNMENT    		($current_word + 1)
			elseif ($wordy = "Exp")
				getWord $stats $EXPERIENCE    		($current_word + 1)
			elseif ($wordy = "Corp")
				getWord $stats $CORP   			($current_word + 1)
			elseif ($wordy = "Ship")
				getWord $stats $SHIP_NUMBER   		($current_word + 1)
			end
			add $current_word 1
			getWord $stats $wordy $current_word
		end
	:doneQuikstats
		killtrigger prompt1
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger statlinetrig
		killtrigger getLine2

return
# ============================== END QUICKSTATS SUB==============================

# ============================== END QUICKSTATS SUB==============================
# ==============================  START PLANET INFO SUBROUTINE  =================
:getPlanetInfo
    killalltriggers
    send "*"
    setTextLineTrigger planetInfo :planetInfo "Planet #"
    pause

    :planetinfo
        killalltriggers
        setVar $citadel 0
        setVar $sCannon 0
        setVar $aCannon 0
        setVar $citadelcredits 0
        getWord CURRENTLINE $planet 2
        stripText $planet "#"
        getWord CURRENTLINE $current_sector 5
        stripText $current_sector ":"
        waitfor "2 Build 1   Product    Amount     Amount     Maximum"

        :getPlanetStuff
            setTextLineTrigger fuelstart :fuelstart "Fuel Ore"
            setTextLineTrigger orgstart :orgstart "Organics"
            setTextLineTrigger equipstart :equipstart "Equipment"
            setTextLineTrigger figstart :figstart "Fighters        N/A"
            setTextLineTrigger citadelstart :citadelstart "Planet has a level"
            setTextLineTrigger cannon :cannonstart ", AtmosLvl="
            setTextTrigger planetInfoDone :planetInfoDone "Planet command (?=help)"
            pause

        :fuelstart
            killalltriggers
            getWord CURRENTLINE $planetfuel 6
            getWord CURRENTLINE $planetfuelmax 8
            stripText $planetfuel ","
            stripText $planetfuelmax ","
            goto :getPlanetStuff

        :orgstart
            killalltriggers
            getWord CURRENTLINE $planetorg 5
            getWord CURRENTLINE $planetorgmax 7
            stripText $planetorg ","
            stripText $planetorgmax ","
            goto :getPlanetStuff

        :equipstart
            killalltriggers
            getWord CURRENTLINE $planetequip 5
            getWord CURRENTLINE $planetequipmax 7
            stripText $planetequip ","
            stripText $planetequipmax ","
            goto :getPlanetStuff

        :figstart
            killalltriggers
            getWord CURRENTLINE $planetfig 5
            getWord CURRENTLINE $planetfigmax 7
            stripText $planetfig ","
            stripText $planetfigmax ","
            goto :getPlanetStuff

        :citadelstart
            killalltriggers
            getWord CURRENTLINE $citadel 5
            getWord CURRENTLINE $citadelcredits 9
            striptext $citadelcredits ","
	    goto :getPlanetStuff

	:cannonstart
            killalltriggers
            getWord CURRENTLINE $aCannon 5
            getWord CURRENTLINE $sCannon 6
            stripText $sCannon "SectLvl="
	    striptext $sCannon "%"
	    stripText $aCannon "AtmosLvl="
	    striptext $aCannon "%"
	    striptext $aCannon ","

    :planetInfoDone
	killalltriggers
return
# ==============================  END PLANET INFO SUBROUTINE  =================

:checkAvoidedSectors
	setVar $avoidedSectors ""	
	:readAvoidedList
		setTextLineTrigger getLine1 :getAvoids
		gosub :setConnectionTriggers
		send "cxq"
		pause
	:keepCountingAvoids
		killAllTriggers
		setTextLineTrigger getLine :getAvoids
		gosub :setConnectionTriggers
		pause
	:getAvoids
		killAllTriggers
		setVar $workingText CURRENTLINE
		getWordPos $workingText $pos "<Computer deactivated>"
		if ($pos > 0)
			goto :doneAvoids
		end
		getWordPos $workingText $pos "Computer"
		if ($pos > 0)
			goto :keepCountingAvoids
		end
		if (CURRENTLINE = "")
			goto :KeepCountingAvoids
		end
		getWordPos $workingText $pos "<List Avoided Sectors>"
		if ($pos > 0)
			goto :keepCountingAvoids
		end
		getWordPos $workingText $pos "No Sectors are currently being avoided."
		if ($pos > 0)
			goto :doneAvoids
		end
		getWordPos $workingText $pos "Citadel"
		if ($pos > 0)
			goto :keepCountingAvoids
		end
		setVar $workingText $workingText&" +++"
		getWord $workingText $avoid 1
		getWordPos $workingText $pos $avoid
		
		while ($avoid <> "+++")
			setVar $avoidedSectors $avoidedSectors&" "&$avoid&" "
			getLength $avoid $length 
			getLength $workingText $checkLength
			cutText $workingText $workingText ($pos+$length) 9999	
			getWord $workingText $avoid 1
			getWordPos $workingText $pos $avoid
			
		end
		goto :keepCountingAvoids
		
	:doneAvoids
return

# ============================== START PLANET NEGOTIATION =======================
:planetNeg
:verifyprompt
    IF (($startingLocation <> "Citadel") and ($startingLocation <> "Planet "))
        setVar $exit_message "Must start at Citadel or Planet Prompt for Planet Nego"
        goto :exitneg
    END
    setVar $_ck_ptradesetting $ptradesetting

if ($startingLocation = "Citadel")
    send "Q"
elseif ($startingLocation = "Planet ")
    setVar $startingLocation "Planet"
end
gosub :getPlanetInfo
send "Q"
gosub :getInfo
send "*"
send "|CR" & $current_sector & "*Q|"
setTextLineTrigger foundport :foundport "Items     Status  Trading % of max OnBoard"
setTextLineTrigger noport :noport "I have no information about a port in that sector."
setTextLineTrigger noport2 :noport "You have never visted sector"
setTextLineTrigger noport3 :noport "credits / next hold"
pause

:noport
    killalltriggers
    gosub :negotiateLand
    setVar $exit_message "No port to sell to"
    goto :exitneg

:foundport
    killalltriggers
    setTextLineTrigger portinfo1 :portinfo1 "Fuel Ore "
    setTextLineTrigger portinfo2 :portinfo2 "Organics"
    setTextLineTrigger portinfo3 :portinfo3 "Equipment"
    setTextLineTrigger gotCR :gotCR "Computer command [TL="
    pause

    :portinfo1
        killalltriggers
        getWord CURRENTLINE $current_sector.orebuying 3
        getWord CURRENTLINE $current_sector.oretrading 4
        getWord CURRENTLINE $current_sector.orepercent 5
        striptext $current_sector.orepercent "%"
        goto :foundport

    :portinfo2
        killalltriggers
        getWord CURRENTLINE $current_sector.orgbuying 2
        getWord CURRENTLINE $current_sector.orgtrading 3
        getWord CURRENTLINE $current_sector.orgpercent 4
        striptext $current_sector.orgpercent "%"
        goto :foundport

    :portinfo3
        killalltriggers
        getWord CURRENTLINE $current_sector.equbuying 2
        getWord CURRENTLINE $current_sector.equtrading 3
        getWord CURRENTLINE $current_sector.equpercent 4
        striptext $current_sector.equpercent "%"
        goto :foundport
    :gotCR

setDelayTrigger justasec :justasec 500
pause

:justasec
:initinfo
    if ($turns <= 0)
        gosub :negotiateLand
        setVar $exit_message "I have no turns to negotiate this planet"
        goto :exitneg
    end
    if ($credits > 990000000)
        gosub :negotiateLand
        setVar $exit_message "I have too much cash on hand"
        goto :exitneg
    end
    setVar $fueltosell $planetfuel
    if ($fueltosell > $planetfuel)
        setVar $fueltosell $planetfuel
    end
    if ($_ck_pnego_fueltosell = "-1")
	 setVar $fueltosell 0
    end
    setVar $orgtosell $planetorg
    if ($orgtosell > $planetorg)
        setVar $orgtosell $planetorg
    end
    if ($_ck_pnego_orgtosell = "-1")
	 setVar $orgtosell 0
    end
    setVar $equiptosell $planetequip
    if ($equiptosell > $planetequip)
        setVar $equiptosell $planetequip
    end
    if ($_ck_pnego_equiptosell = "-1")
	 setVar $equiptosell 0
    end
            killalltriggers
            # determine if the sale can proceed, based on units desired to sell and what port is buying
            if (($current_sector.orebuying <> "Buying") or ($current_sector.orepercent < 15))
                setVar $fueltosell 0
            end
            if (($current_sector.orgbuying <> "Buying") or ($current_sector.orgpercent < 15))
                setVar $orgtosell 0
            end
            if (($current_sector.equbuying <> "Buying") or ($current_sector.equpercent < 15))
                setVar $equiptosell 0
            end

:selloff
    if (($fueltosell <> 0) or ($orgtosell <> 0) or ($equiptosell <> 0))
        setVar $ore_sell_failures 0
        setVar $org_sell_failures 0
        setVar $equ_sell_failures 0
        setVar $oreselloutput ""
        setVar $orgselloutput ""
        setVar $equselloutput ""
        setVar $oreprofit 0
        setVar $orgprofit 0
        setVar $equprofit 0
        # turning comms off
        send "|"
        gosub :sell
        gosub :negotiateLand
        if ($startingLocation = "Citadel")
            # deposit profits in treasury
            if ($oreprofit <> 0)
#               send "TT" & $oreprofit & "*"
                subtract $credits $oreprofit
            end
            if ($orgprofit <> 0)
#               send "TT" & $orgprofit & "*"
                subtract $credits $orgprofit
            end
            if ($equprofit <> 0)
#               send "TT" & $equprofit & "*"
                subtract $credits $equprofit
            end
        end
        # turning comms back on
        send "|"
        # send script output
        setVar $generalOutput "*Sector " & $CURRENT_SECTOR  & "*"
        write $output_file $generalOutput

        if ($oreselloutput <> "")
            send $oreselloutput
            write $output_file $oreselloutput
        end
        if ($orgselloutput <> "")
            send $orgselloutput
            write $output_file $orgselloutput
        end
        if ($equselloutput <> "")
            send $equselloutput
            write $output_file $equselloutput
        end
        setVar $exit_message "Done with port"
        goto :exitneg
    else
        gosub :negotiateLand
        setVar $exit_message "Nothing to sell"
        goto :exitneg
    end

:sell
    :resell
        if ($turns <= 0)
            send "'I'm out of turns*"
            return
        end
        setVar $thisorefailed 0
        setVar $thisorgfailed 0
        setVar $thisequfailed 0
        send "PN" & $planet & "*"
        subtract $turns 1
            :getpercts
                setTextLineTrigger orepct :orepct "Fuel Ore   Buying"
                setTextLineTrigger orgpct :orgpct "Organics   Buying"
                setTextLineTrigger equpct :equpct "Equipment  Buying"
                setTextLineTrigger gotpercts :gotpercts "Registry# and Planet Name"
                pause

                :orepct
                    killalltriggers
                    getWord CURRENTLINE $current_sector.oretrading 4
                    getWord CURRENTLINE $current_sector.orepercent 5
                    striptext $current_sector.orepercent "%"
                    if ($current_sector.orepercent < 100)
                        add $current_sector.orepercent 1
                    end
                    goto :getpercts

                :orgpct
                    killalltriggers
                    getWord CURRENTLINE $current_sector.orgtrading 3
                    getWord CURRENTLINE $current_sector.orgpercent 4
                    striptext $current_sector.orgpercent "%"
                    if ($current_sector.orgpercent < 100)
                        add $current_sector.orgpercent 1
                    end
                    goto :getpercts

                :equpct
                    killalltriggers
                    getWord CURRENTLINE $current_sector.equtrading 3
                    getWord CURRENTLINE $current_sector.equpercent 4
                    striptext $current_sector.equpercent "%"
                    if ($current_sector.equpercent < 100)
                        add $current_sector.equpercent 1
                    end
                    goto :getpercts

                :gotpercts

            :sellproduct
                setTextTrigger sellfuel :sellfuel "How many units of Fuel Ore"
                setTextTrigger sellorg :sellorg "How many units of Organics"
                setTextTrigger sellequ :sellequ "How many units of Equipment"
                setTextTrigger donewithport :donewithport "Command [TL="
                pause

            :sellfuel
                killalltriggers
                if (($current_sector.orepercent >= 15) and ($fueltosell > 0))
                    if ($fueltosell > $current_sector.oretrading)
                        setVar $fueltosell $current_sector.oretrading
                    end
                    setVar $prodtosell "ore"
                    setVar $portbuying $fueltosell
                    gosub :sellhaggle
                    if ($currenthaggle = "succeeded")
                        setVar $orehaggle "succeeded"
                        setVar $fueltosell 0
                        subtract $oreMCIC 1
                    else
                        setVar $orehaggle "failed"
                    end
                else
                    send "0*"
                end
                goto :sellproduct

            :sellorg
                killalltriggers
                if (($current_sector.orgpercent >= 15) and ($orgtosell > 0))
                    if ($orgtosell > $current_sector.orgtrading)
                        setVar $orgtosell $current_sector.orgtrading
                    end
                    setVar $prodtosell "org"
                    setVar $portbuying $orgtosell
                    gosub :sellhaggle
                    if ($currenthaggle = "succeeded")
                        setVar $orghaggle "succeeded"
                        setVar $orgtosell 0
                        subtract $orgMCIC 1
                    else
                        setVar $orghaggle "failed"
                    end
                else
                    send "0*"
                end
                goto :sellproduct

            :sellequ
                killalltriggers
                if (($current_sector.equpercent >= 15) and ($equiptosell > 0))
                    if ($equiptosell > $current_sector.equtrading)
                        setVar $equiptosell $current_sector.equtrading
                    end
                    setVar $prodtosell "equ"
                    setVar $portbuying $equiptosell
                    gosub :sellhaggle
                    if ($currenthaggle = "succeeded")
                        setVar $equhaggle "succeeded"
                        setVar $equiptosell 0
                        subtract $equMCIC 1
                    else
                        setVar $equhaggle "failed"
                    end
                else
                    send "0*"
                end
                goto :sellproduct

            :donewithport
                killalltriggers
                if (($ore_sell_failures > 4) or ($org_sell_failures > 4) or ($equ_sell_failures > 4))
                    setVar $selloutput $selloutput & "Multiple Haggle Failures - Please cut and paste this haggling session and email to Cherokee*"
                    return
                elseif (($fueltosell = 0) and ($orgtosell = 0) and ($equiptosell = 0))
                    return
                else
                    goto :resell
                end

 :sellhaggle
    setTextLineTrigger sellfirstoffer :sellfirstoffer "We'll buy them for"
    send $portbuying & "*"
    pause

    :sellfirstoffer
        killalltriggers
        getWord CURRENTLINE $offer 5
        striptext $offer ","

        gosub :swathoff
        if ($swathoff = FALSE)
            gosub :negotiateLand
            setVar $exit_message $swathOffMessage
            goto :exitneg
        end

        # ----- CALCULATE the port's "quality" -----
        setVar $perunitinitoffer $offer

        #NEW CODE ADDED TO SUPPORT NON-100% PTRADES
        multiply $perunitinitoffer 100
        divide $perunitinitoffer $_ck_ptradesetting

        # multiply by 100 to increase accuracy of results, we'll need to divide by 100 later
        multiply $perunitinitoffer 100

        # divide by the number of units you are selling
        divide $perunitinitoffer $portbuying

        #initialize portmaxinit
        setVar $portmaxinit $perunitinitoffer

        # return to 10 scale
        divide $perunitinitoffer 10

        if ($prodtosell = "ore")
            # port max init  =(($perunitinitoffer-25.60558)/($percent-11.7248))*(88.2752)+25.60558
            setVar $basevalue 256055800
            setVar $basepercent 11725
            setVar $basepercentinverse 88275
            setVar $percentfrombase $current_sector.orepercent
        elseif ($prodtosell = "org")
            # port max init  =(($perunitinitoffer-50.62764)/($percent-11.28715))*(88.71285)+50.62764
            setVar $basevalue 506276400
            setVar $basepercent 11287
            setVar $basepercentinverse 88713
            setVar $percentfrombase $current_sector.orgpercent
        elseif ($prodtosell = "equ")
            # port max init  =(($perunitinitoffer-90.6281)/($percent-10.98921))*(89.01079)+90.6281
            setVar $basevalue 906281000
            setVar $basepercent 10989
            setVar $basepercentinverse 89010
            setVar $percentfrombase $current_sector.equpercent
        end

        if ($percentfrombase = 100)
            echo "* 100% port*"
            # return to 10 scale
            divide $portmaxinit 10

        elseif ($percentfrombase >= 15)
            # multiply by 100,000 for precision
            multiply $portmaxinit 100000

            # subtract basevalue (in 10,000,000 scale)
            subtract $portmaxinit $basevalue

            # multiply by 1000 for precision
            multiply $percentfrombase 1000

            # subtract equ base percent (1,000 scale)
            subtract $percentfrombase $basepercent

            # calculate PMI/PFB
            divide $portmaxinit $percentfrombase

            # multiply by inverse of equ base percent (1,000 scale)
            multiply $portmaxinit $basepercentinverse

            # add the basevalue (in 10,000,000 scale)
            add $portmaxinit $basevalue

            # return to 10 scale
            divide $portmaxinit 1000000

        elseif ($prodtosell = "ore")
            setVar $portmaxinit 340

        elseif ($prodtosell = "org")
            setVar $portmaxinit 635

        elseif ($prodtosell = "equ")
            setVar $portmaxinit 1063
        end

        # ----- LOOKUP the counteroffer percentage to use at this "quality" port -----

        if ($prodtosell = "ore")
            if ($portmaxinit >= 436)
                setVar $MCIC "-90"
                setVar $multiple "1494"

            elseif ($portmaxinit >= 434)
                setVar $MCIC "-89"
                setVar $multiple "1488"

            elseif ($portmaxinit >= 433)
                setVar $MCIC "-88"
                setVar $multiple "1482"

            elseif ($portmaxinit >= 431)
                setVar $MCIC "-87"
                setVar $multiple "1476"

            elseif ($portmaxinit >= 429)
                setVar $MCIC "-86"
                setVar $multiple "1470"

            elseif ($portmaxinit >= 427)
                setVar $MCIC "-85"
                setVar $multiple "1464"

            elseif ($portmaxinit >= 425)
                setVar $MCIC "-84"
                setVar $multiple "1458"

            elseif ($portmaxinit >= 424)
                setVar $MCIC "-83"
                setVar $multiple "1452"

            elseif ($portmaxinit >= 422)
                setVar $MCIC "-82"
                setVar $multiple "1446"

            elseif ($portmaxinit >= 420)
                setVar $MCIC "-81"
                setVar $multiple "1440"

            elseif ($portmaxinit >= 418)
                setVar $MCIC "-80"
                setVar $multiple "1434"

            elseif ($portmaxinit >= 416)
                setVar $MCIC "-79"
                setVar $multiple "1429"

            elseif ($portmaxinit >= 414)
                setVar $MCIC "-78"
                setVar $multiple "1423"

            elseif ($portmaxinit >= 412)
                setVar $MCIC "-77"
                setVar $multiple "1417"

            elseif ($portmaxinit >= 411)
                setVar $MCIC "-76"
                setVar $multiple "1411"

            elseif ($portmaxinit >= 409)
                setVar $MCIC "-75"
                setVar $multiple "1405"

            elseif ($portmaxinit >= 407)
                setVar $MCIC "-74"
                setVar $multiple "1399"

            elseif ($portmaxinit >= 405)
                setVar $MCIC "-73"
                setVar $multiple "1393"

            elseif ($portmaxinit >= 403)
                setVar $MCIC "-72"
                setVar $multiple "1387"

            elseif ($portmaxinit >= 401)
                setVar $MCIC "-71"
                setVar $multiple "1381"

            elseif ($portmaxinit >= 399)
                setVar $MCIC "-70"
                setVar $multiple "1375"

            elseif ($portmaxinit >= 397)
                setVar $MCIC "-69"
                setVar $multiple "1369"

            elseif ($portmaxinit >= 396)
                setVar $MCIC "-68"
                setVar $multiple "1363"

            elseif ($portmaxinit >= 394)
                setVar $MCIC "-67"
                setVar $multiple "1357"

            elseif ($portmaxinit >= 392)
                setVar $MCIC "-66"
                setVar $multiple "1351"

            elseif ($portmaxinit >= 390)
                setVar $MCIC "-65"
                setVar $multiple "1345"

            elseif ($portmaxinit >= 388)
                setVar $MCIC "-64"
                setVar $multiple "1342"

            elseif ($portmaxinit >= 386)
                setVar $MCIC "-63"
                setVar $multiple "1336"

            elseif ($portmaxinit >= 384)
                setVar $MCIC "-62"
                setVar $multiple "1330"

            elseif ($portmaxinit >= 382)
                setVar $MCIC "-61"
                setVar $multiple "1324"

            elseif ($portmaxinit >= 380)
                setVar $MCIC "-60"
                setVar $multiple "1318"

            elseif ($portmaxinit >= 378)
                setVar $MCIC "-59"
                setVar $multiple "1312"

            elseif ($portmaxinit >= 376)
                setVar $MCIC "-58"
                setVar $multiple "1306"

            elseif ($portmaxinit >= 374)
                setVar $MCIC "-57"
                setVar $multiple "1300"

            elseif ($portmaxinit >= 372)
                setVar $MCIC "-56"
                setVar $multiple "1294"

            elseif ($portmaxinit >= 370)
                setVar $MCIC "-55"
                setVar $multiple "1291"

            elseif ($portmaxinit >= 368)
                setVar $MCIC "-54"
                setVar $multiple "1285"

            elseif ($portmaxinit >= 366)
                setVar $MCIC "-53"
                setVar $multiple "1279"

            elseif ($portmaxinit >= 364)
                setVar $MCIC "-52"
                setVar $multiple "1273"

            elseif ($portmaxinit >= 362)
                setVar $MCIC "-51"
                setVar $multiple "1267"

            elseif ($portmaxinit >= 360)
                setVar $MCIC "-50"
                setVar $multiple "1261"

            elseif ($portmaxinit >= 358)
                setVar $MCIC "-49"
                setVar $multiple "1255"

            elseif ($portmaxinit >= 356)
                setVar $MCIC "-48"
                setVar $multiple "1249"

            elseif ($portmaxinit >= 354)
                setVar $MCIC "-46"
                setVar $multiple "1246"

            elseif ($portmaxinit >= 352)
                setVar $MCIC "-46"
                setVar $multiple "1240"

            elseif ($portmaxinit >= 350)
                setVar $MCIC "-45"
                setVar $multiple "1234"

            elseif ($portmaxinit >= 348)
                setVar $MCIC "-44"
                setVar $multiple "1228"

            elseif ($portmaxinit >= 346)
                setVar $MCIC "-43"
                setVar $multiple "1222"

            elseif ($portmaxinit >= 344)
                setVar $MCIC "-42"
                setVar $multiple "1219"

            elseif ($portmaxinit >= 342)
                setVar $MCIC "-41"
                setVar $multiple "1209"

            elseif ($portmaxinit >= 340)
                setVar $MCIC "-40"
                setVar $multiple "1208"

            else
                setVar $MCIC 0
                setVar $multiple "1208"
            end
  
          elseif ($prodtosell = "org")
            if ($portmaxinit >= 813)
                setVar $MCIC "-75"
                setVar $multiple "1405"

            elseif ($portmaxinit >= 810)
                setVar $MCIC "-74"
                setVar $multiple 1399

            elseif ($portmaxinit >= 806)
                setVar $MCIC "-73"
                setVar $multiple 1393

            elseif ($portmaxinit >= 802)
                setVar $MCIC "-72"
                setVar $multiple 1387

            elseif ($portmaxinit >= 798)
                setVar $MCIC "-71"
                setVar $multiple 1381

            elseif ($portmaxinit >= 795)
                setVar $MCIC "-70"
                setVar $multiple 1375

            elseif ($portmaxinit >= 791)
                setVar $MCIC "-69"
                setVar $multiple 1369

            elseif ($portmaxinit >= 787)
                setVar $MCIC "-68"
                setVar $multiple 1363

            elseif ($portmaxinit >= 783)
                setVar $MCIC "-67"
                setVar $multiple 1357

            elseif ($portmaxinit >= 779)
                setVar $MCIC "-66"
                setVar $multiple 1351

            elseif ($portmaxinit >= 775)
                setVar $MCIC "-65"
                setVar $multiple 1345

            elseif ($portmaxinit >= 772)
                setVar $MCIC "-64"
                setVar $multiple 1339

            elseif ($portmaxinit >= 768)
                setVar $MCIC "-63"
                setVar $multiple 1336

            elseif ($portmaxinit >= 764)
                setVar $MCIC "-62"
                setVar $multiple 1330

            elseif ($portmaxinit >= 760)
                setVar $MCIC "-61"
                setVar $multiple 1324

            elseif ($portmaxinit >= 756)
                setVar $MCIC "-60"
                setVar $multiple 1318

            elseif ($portmaxinit >= 752)
                setVar $MCIC "-59"
                setVar $multiple 1312

            elseif ($portmaxinit >= 748)
                setVar $MCIC "-58"
                setVar $multiple 1306

            elseif ($portmaxinit >= 744)
                setVar $MCIC "-57"
                setVar $multiple 1300

            elseif ($portmaxinit >= 740)
                setVar $MCIC "-56"
                setVar $multiple 1294

            elseif ($portmaxinit >= 737)
                setVar $MCIC "-55"
                setVar $multiple 1291

            elseif ($portmaxinit >= 733)
                setVar $MCIC "-54"
                setVar $multiple 1285

            elseif ($portmaxinit >= 729)
                setVar $MCIC "-53"
                setVar $multiple 1279

            elseif ($portmaxinit >= 725)
                setVar $MCIC "-52"
                setVar $multiple 1273

            elseif ($portmaxinit >= 721)
                setVar $MCIC "-51"
                setVar $multiple 1267

            elseif ($portmaxinit >= 717)
                setVar $MCIC "-50"
                setVar $multiple 1261

            elseif ($portmaxinit >= 713)
                setVar $MCIC "-49"
                setVar $multiple 1255

            elseif ($portmaxinit >= 709)
                setVar $MCIC "-48"
                setVar $multiple 1252

            elseif ($portmaxinit >= 705)
                setVar $MCIC "-47"
                setVar $multiple 1246

            elseif ($portmaxinit >= 701)
                setVar $MCIC "-46"
                setVar $multiple 1236

            elseif ($portmaxinit >= 697)
                setVar $MCIC "-45"
                setVar $multiple 1233

            elseif ($portmaxinit >= 693)
                setVar $MCIC "-44"
                setVar $multiple 1227

            elseif ($portmaxinit >= 688)
                setVar $MCIC "-43"
                setVar $multiple 1224

            elseif ($portmaxinit >= 684)
                setVar $MCIC "-42"
                setVar $multiple 1214

            elseif ($portmaxinit >= 680)
                setVar $MCIC "-41"
                setVar $multiple 1213

            elseif ($portmaxinit >= 676)
                setVar $MCIC "-40"
                setVar $multiple 1203

            elseif ($portmaxinit >= 672)
                setVar $MCIC "-39"
                setVar $multiple 1200

            elseif ($portmaxinit >= 668)
                setVar $MCIC "-38"
                setVar $multiple 1194

            elseif ($portmaxinit >= 664)
                setVar $MCIC "-37"
                setVar $multiple 1191

            elseif ($portmaxinit >= 660)
                setVar $MCIC "-36"
                setVar $multiple 1181

            elseif ($portmaxinit >= 656)
                setVar $MCIC "-35"
                setVar $multiple 1178

            elseif ($portmaxinit >= 651)
                setVar $MCIC "-34"
                setVar $multiple 1172

            elseif ($portmaxinit >= 647)
                setVar $MCIC "-33"
                setVar $multiple 1166

            elseif ($portmaxinit >= 643)
                setVar $MCIC "-32"
                setVar $multiple 1160

            elseif ($portmaxinit >= 639)
                setVar $MCIC "-31"
                setVar $multiple 1157

            elseif ($portmaxinit >= 635)
                setVar $MCIC "-30"
                setVar $multiple 1154

            else
                setVar $MCIC 0
                setVar $multiple "1154"
            end

        elseif ($prodtosell = "equ")
            if ($portmaxinit >= 1393)
                setVar $MCIC "-65"
                setVar $multiple 1347

            elseif ($portmaxinit >= 1386)
                setVar $MCIC "-64"
                setVar $multiple 1341

            elseif ($portmaxinit >= 1379)
                setVar $MCIC "-63"
                setVar $multiple 1336

            elseif ($portmaxinit >= 1372)
                setVar $MCIC "-62"
                setVar $multiple 1330

            elseif ($portmaxinit >= 1365)
                setVar $MCIC "-61"
                setVar $multiple 1324

            elseif ($portmaxinit >= 1358)
                setVar $MCIC "-60"
                setVar $multiple 1319

            elseif ($portmaxinit >= 1351)
                setVar $MCIC "-59"
                setVar $multiple 1313

            elseif ($portmaxinit >= 1344)
                setVar $MCIC "-58"
                setVar $multiple 1307

            elseif ($portmaxinit >= 1337)
                setVar $MCIC "-57"
                setVar $multiple 1302

            elseif ($portmaxinit >= 1329)
                setVar $MCIC "-56"
                setVar $multiple 1296

            elseif ($portmaxinit >= 1323)
                setVar $MCIC "-55"
                setVar $multiple 1291

            elseif ($portmaxinit >= 1315)
                setVar $MCIC "-54"
                setVar $multiple 1285

            elseif ($portmaxinit >= 1308)
                setVar $MCIC "-53"
                setVar $multiple 1279

            elseif ($portmaxinit >= 1301)
                setVar $MCIC "-52"
                setVar $multiple 1274

            elseif ($portmaxinit >= 1294)
                setVar $MCIC "-51"
                setVar $multiple 1268

            elseif ($portmaxinit >= 1287)
                setVar $MCIC "-50"
                setVar $multiple 1262

            elseif ($portmaxinit >= 1279)
                setVar $MCIC "-49"
                setVar $multiple 1254

            elseif ($portmaxinit >= 1272)
                setVar $MCIC "-48"
                setVar $multiple 1247

            elseif ($portmaxinit >= 1265)
                setVar $MCIC "-47"
                setVar $multiple 1246

            elseif ($portmaxinit >= 1258)
                setVar $MCIC "-46"
                setVar $multiple 1241

            elseif ($portmaxinit >= 1251)
                setVar $MCIC "-45"
                setVar $multiple 1235

            elseif ($portmaxinit >= 1243)
                setVar $MCIC "-44"
                setVar $multiple 1229

            elseif ($portmaxinit >= 1236)
                setVar $MCIC "-43"
                setVar $multiple 1224

            elseif ($portmaxinit >= 1229)
                setVar $MCIC "-42"
                setVar $multiple 1218

            elseif ($portmaxinit >= 1221)
                setVar $MCIC "-41"
                setVar $multiple 1213

            elseif ($portmaxinit >= 1214)
                setVar $MCIC "-40"
                setVar $multiple 1208

            elseif ($portmaxinit >= 1206)
                setVar $MCIC "-39"
                setVar $multiple 1201

            elseif ($portmaxinit >= 1199)
                setVar $MCIC "-38"
                setVar $multiple 1196

            elseif ($portmaxinit >= 1192)
                setVar $MCIC "-37"
                setVar $multiple 1190

            elseif ($portmaxinit >= 1184)
                setVar $MCIC "-36"
                setVar $multiple 1185

            elseif ($portmaxinit >= 1177)
                setVar $MCIC "-35"
                setVar $multiple 1180

            elseif ($portmaxinit >= 1169)
                setVar $MCIC "-34"
                setVar $multiple 1174

            elseif ($portmaxinit >= 1162)
                setVar $MCIC "-33"
                setVar $multiple 1169

            elseif ($portmaxinit >= 1154)
                setVar $MCIC "-32"
                setVar $multiple 1164

            elseif ($portmaxinit >= 1147)
                setVar $MCIC "-31"
                setVar $multiple 1158

            elseif ($portmaxinit >= 1139)
                setVar $MCIC "-30"
                setVar $multiple 1152

            elseif ($portmaxinit >= 1132)
                setVar $MCIC "-29"
                setVar $multiple 1149

            elseif ($portmaxinit >= 1124)
                setVar $MCIC "-28"
                setVar $multiple 1144

            elseif ($portmaxinit >= 1116)
                setVar $MCIC "-27"
                setVar $multiple 1136

            elseif ($portmaxinit >= 1109)
                setVar $MCIC "-26"
                setVar $multiple 1132

            elseif ($portmaxinit >= 1101)
                setVar $MCIC "-25"
                setVar $multiple 1126

            elseif ($portmaxinit >= 1093)
                setVar $MCIC "-24"
                setVar $multiple 1122

            elseif ($portmaxinit >= 1086)
                setVar $MCIC "-23"
                setVar $multiple 1117

            elseif ($portmaxinit >= 1078)
                setVar $MCIC "-22"
                setVar $multiple 1110

            elseif ($portmaxinit >= 1071)
                setVar $MCIC "-21"
                setVar $multiple 1105

            elseif ($portmaxinit >= 1063)
                setVar $MCIC "-20"
                setVar $multiple 1102

            else
                setVar $MCIC "0"
                setVar $multiple 1102

            end
        end

        # has to be done this way because of TWX numeric upper limit of 2.14 billion
        setVar $counter $offer
        divide $counter 10
        multiply $counter $multiple
        divide $counter 100
        send $counter & "*"
        setVar $midhaggles 0

    :sellofferloop
        setTextLineTrigger sellprice :sellprice "We'll buy them for"
        setTextLineTrigger sellfinaloffer :sellfinaloffer "Our final offer"
        # setTextLineTrigger sellnotinterested :sellnotinterested "We're not interested."
        setTextLineTrigger sellexperience :sellexperience "experience point(s)"
        setTextLineTrigger sellyouhave :sellyouhave "You have"
        setTextLineTrigger sellscrewup1 :sellscrewup "Get real ion-brain, make me a real offer."
        setTextLineTrigger sellscrewup2 :sellscrewup "This is the big leagues Jr.  Make a real offer."
        setTextLineTrigger sellscrewup3 :sellscrewup "My patience grows short with you."
        setTextLineTrigger sellscrewup4 :sellscrewup "I have much better things to do than waste my time.  Try again."
        setTextLineTrigger sellscrewup5 :sellscrewup "HA! HA, ha hahahhah hehehe hhhohhohohohh!  You choke me up!"
        setTextLineTrigger sellscrewup6 :sellscrewup "Quit playing around, you're wasting my time!"
        setTextLineTrigger sellscrewup7 :sellscrewup "Make a real offer or get the h"
        setTextLineTrigger sellscrewup8 :sellscrewup "WHAT?!@!? you must be crazy!"
        setTextLineTrigger sellscrewup9 :sellscrewup "So, you think I'm as stupid as you look? Make a real offer."
        setTextLineTrigger sellscrewup10 :sellscrewup "What do you take me for, a fool?  Make a real offer!"
        pause
        pause

    :sellscrewup
        killalltriggers
        multiply $counter 98
        divide $counter 100
        send $counter & "*"
        goto :sellofferloop

    :sellprice
        killalltriggers
        add $midhaggles 1
        setVar $old_offer $offer
        setVar $old_counter $counter
        getWord CURRENTLINE $offer 5
        striptext $offer ","

            # new method
            setVar $offer_change $offer
            subtract $offer_change $old_offer
            if ($MCIC > "-35")
                multiply $offer_change 75
                divide $offer_change 100
                subtract $counter $offer_change
                subtract $counter 25
            elseif ($MCIC > "-55")
                multiply $offer_change 65
                divide $offer_change 100
                subtract $counter $offer_change
                subtract $counter 25
            else
                multiply $offer_change 60
                divide $offer_change 100
                subtract $counter $offer_change
                subtract $counter 10
            end
        send $counter & "*"
        goto :sellofferloop

    :sellfinaloffer
        killalltriggers
        # ore -  51,  54,  56   so...  25000, make sure we get 1 mid
        # org -  94,  99, 102   so...  15000, make sure we get 1 mid...  25,000, make sure we get 2 mids
        # equ - 160, 166, 170   so...  12000, make sure we get 1 mid...  20,000, make sure we get 2 mids
        if (($prodtosell = "ore") and ($MCIC <= "-75") and ($portbuying >= 25000) and ($midhaggles < 1) and ($ore_sell_failures < 2))
            setVar $forcefail 1
            setVar $thisorefailed 1
        elseif (($prodtosell = "org") and ($MCIC <= "-60") and ($portbuying >= 25000) and ($midhaggles < 2) and (($thisorefailed = 1) or ($org_sell_failures < 4)))
            setVar $forcefail 1
            setVar $thisorgfailed 1
        elseif (($prodtosell = "org") and ($MCIC <= "-60") and ($portbuying >= 15000) and ($midhaggles < 1) and (($thisorefailed = 1) or ($org_sell_failures < 2)))
            setVar $forcefail 1
            setVar $thisorgfailed 1
        elseif (($prodtosell = "equ") and ($MCIC <= "-55") and ($portbuying >= 20000) and ($midhaggles < 2) and (($thisorefailed = 1) or ($thisorgfailed = 1) or ($equ_sell_failures < 4)))
            setVar $forcefail 1
            setVar $thisequfailed 1
        elseif (($prodtosell = "equ") and ($MCIC <= "-55") and ($portbuying >= 12000) and ($midhaggles < 1) and (($thisorefailed = 1) or ($thisorgfailed = 1) or ($equ_sell_failures < 2)))
            setVar $forcefail 1
            setVar $thisequfailed 1
        else
            setVar $forcefail 0
        end

        if ($forcefail = 0)
            setVar $old_offer $offer
            setVar $old_counter $counter
            getWord CURRENTLINE $offer 5
            striptext $offer ","
            setVar $offer_change $offer
            subtract $offer_change $old_offer
            if ($prodtosell = "ore")
                multiply $offer_change 30
            elseif ($prodtosell = "org")
                multiply $offer_change 27
            elseif ($prodtosell = "equ")
                multiply $offer_change 25
            end
            divide $offer_change 10
            subtract $counter $offer_change
            subtract $counter 10
            send $counter & "*"
        else
            # fail the haggle on purpose
            send $counter & "*"
        end
        goto :sellofferloop

    :sellnotinterested
        killalltriggers
        goto :sellhagglefailed

    :sellexperience
        killalltriggers
        getWord CURRENTLINE $exp_bonus 7
        add $EXPERIENCE $exp_bonus
        goto :sellofferloop

    :sellyouhave
        killalltriggers
        setVar $oldcredits $CREDITS
        getWord CURRENTLINE $CREDITS 3
        stripText $CREDITS ","
        if ($oldcredits = $CREDITS)
            setVar $currenthaggle "failed"
            goto :sellhagglefailed
        else
            setVar $currenthaggle "succeeded"
            goto :sellhagglesucceeded
        end

    :sellhagglefailed
        if ($prodtosell = "ore")
            add $ore_sell_failures 1
        elseif ($prodtosell = "org")
            add $org_sell_failures 1
        elseif ($prodtosell = "equ")
            add $equ_sell_failures 1
        end
        if ($selldelay > 99)
	    gosub :setConnectionTriggers
            setDelayTrigger selldelay :selldelay $selldelay
            pause
            :selldelay
        end
        return

    :sellhagglesucceeded
        setVar $perunit $counter
        divide $perunit $portbuying

        setVar $selloutput "'"
        setVar $selloutput $selloutput & $portbuying & " " & $prodtosell & " for " & $counter & " cr"
        setVar $selloutput $selloutput & " - "
        if ($prodtosell = "ore")
            setVar $selloutput $selloutput & $ore_sell_failures
        elseif ($prodtosell = "org")
            setVar $selloutput $selloutput & $org_sell_failures
        elseif ($prodtosell = "equ")
            setVar $selloutput $selloutput & $equ_sell_failures
        end
        setVar $selloutput $selloutput & " fails"
        setVar $selloutput $selloutput & " - " & $perunit & "/unit"
        #setVar $selloutput $selloutput & " - PMI " & $portmaxinit
        #setVar $selloutput $selloutput & " - MULT " & $multiple
        setVar $selloutput $selloutput & " - MCIC " & $MCIC
        if ($prodtosell = "ore")
            setVar $selloutput $selloutput & "/-90*"
            setVar $oreselloutput $selloutput
            setVar $oreprofit $counter
        elseif ($prodtosell = "org")
            setVar $selloutput $selloutput & "/-75*"
            setVar $orgselloutput $selloutput
            setVar $orgprofit $counter
        elseif ($prodtosell = "equ")
            setVar $selloutput $selloutput & "/-65*"
            setVar $equselloutput $selloutput
            setVar $equprofit $counter
        end

        if ($selldelay > 99)
            setDelayTrigger selldelay :selldelay2 $selldelay
            pause
            pause
            :selldelay2
        end
        return

:negotiateLand
    if ($startingLocation = "Citadel")
        send "L " & $planet & "* "
	gosub :getPlanetInfo
	send "c "
    elseif ($startingLocation = "Planet")
        send "L " & $planet & "* "
	gosub :getPlanetInfo
    end
    return

:exitneg
	send "'Planet Negotiation exiting --- " & $exit_message & "*"
return
# ==============================  END PLANET NEGOTIATION ========================

# ============================  START PLAYER INFO SUBROUTINE  =================
:getInfo
    setVar $PHOTONS 0
    setVar $SCAN_TYPE "None"
    setVar $TWARP_TYPE 0
    setVar $corpstring "[0]"
    send "I"
    waitfor "<Info>"
    :waitForInfo
        setTextLineTrigger getTraderName :getTraderName "Trader Name    :"
        setTextLineTrigger getExpAndAlign :getExpAndAlign "Rank and Exp"
        setTextLineTrigger getCorp :getCorp "Corp           #"
        setTextLineTrigger getShipType :getShipType "Ship Info      :"
        setTextLineTrigger getTPW :getTPW "Turns to Warp  :"
        setTextLineTrigger getSect :getSect "Current Sector :"
        setTextLineTrigger getTurns :getTurns "Turns left"
        setTextLineTrigger getHolds :getHolds "Total Holds"
        setTextLineTrigger getFighters :getFighters "Fighters       :"
        setTextLineTrigger getShields :getShields "Shield points  :"
        setTextLineTrigger getPhotons :getPhotons "Photon Missiles:"
        setTextLineTrigger getScanType :getScanType "LongRange Scan :"
        setTextLineTrigger getTwarpType1 :getTwarpType1 "  (Type 1 Jump):"
        setTextLineTrigger getTwarpType2 :getTwarpType2 "  (Type 2 Jump):"
        setTextLineTrigger getCredits :getCredits "Credits"
        setTextTrigger getInfoDone :getInfoDone "Command [TL="
        setTextTrigger getInfoDone2 :getInfoDone "Citadel command"
        pause
        pause

    :getTraderName
        killAllTriggers
        setVar $TRADER_NAME CURRENTLINE
        stripText $TRADER_NAME "Trader Name    : "
        stripText $TRADER_NAME "3rd Class "
        stripText $TRADER_NAME "2nd Class "
        stripText $TRADER_NAME "1st Class "
        stripText $TRADER_NAME "Nuisance "
        stripText $TRADER_NAME "Menace "
        stripText $TRADER_NAME "Smuggler Savant "
        stripText $TRADER_NAME "Smuggler "
        stripText $TRADER_NAME "Robber "
        stripText $TRADER_NAME "Private "
        stripText $TRADER_NAME "Lance Corporal "
        stripText $TRADER_NAME "Corporal "
        stripText $TRADER_NAME "Staff Sergeant "
        stripText $TRADER_NAME "Gunnery Sergeant "
        stripText $TRADER_NAME "1st Sergeant "
        stripText $TRADER_NAME "Sergeant Major "
        stripText $TRADER_NAME "Sergeant "
        stripText $TRADER_NAME "Chief Warrant Officer "
        stripText $TRADER_NAME "Warrant Officer "
        stripText $TRADER_NAME "Terrorist "
        stripText $TRADER_NAME "Infamous Pirate "
        stripText $TRADER_NAME "Notorious Pirate "
        stripText $TRADER_NAME "Dread Pirate "
        stripText $TRADER_NAME "Pirate "
        stripText $TRADER_NAME "Galactic Scourge "
        stripText $TRADER_NAME "Enemy of the State "
        stripText $TRADER_NAME "Enemy of the People "
        stripText $TRADER_NAME "Enemy of Humankind "
        stripText $TRADER_NAME "Heinous Overlord "
        stripText $TRADER_NAME "Prime Evil "
        stripText $TRADER_NAME "Ensign "
        stripText $TRADER_NAME "Lieutenant J.G. "
        stripText $TRADER_NAME "Lieutenant Commander "
        stripText $TRADER_NAME "Lieutenant "
        stripText $TRADER_NAME "Commander "
        stripText $TRADER_NAME "Captain "
        stripText $TRADER_NAME "Commodore "
        stripText $TRADER_NAME "Rear Admiral "
        stripText $TRADER_NAME "Vice Admiral "
        stripText $TRADER_NAME "Fleet Admiral "
        stripText $TRADER_NAME "Admiral "
        stripText $TRADER_NAME "Civilian "
        stripText $TRADER_NAME "Annoyance "
        goto :waitForInfo

    :getExpAndAlign
        killAllTriggers
        getWord CURRENTLINE $EXPERIENCE 5
        getWord CURRENTLINE $ALIGNMENT 7
        stripText $EXPERIENCE ","
        stripText $ALIGNMENT ","
        stripText $ALIGNMENT "Alignment="
        goto :waitForInfo

    :getCorp
        killAllTriggers
        getWord CURRENTLINE $CORP 3
        stripText $CORP ","
        setVar $corpstring "[" & $CORP & "]"
        goto :waitForInfo

    :getShipType
        killAllTriggers
        getWordPos CURRENTLINE $shiptypeend "Ported="
        subtract $shiptypeend 18
        cutText CURRENTLINE $SHIP_TYPE 18 $shiptypeend
        goto :waitForInfo
    :getTPW
        killAllTriggers
        getWord CURRENTLINE $TURNS_PER_WARP 5
        goto :waitForInfo

    :getSect
        killAllTriggers
        getWord CURRENTLINE $CURRENT_SECTOR 4
        goto :waitForInfo

    :getTurns
        killAllTriggers
        getWord CURRENTLINE $TURNS 4
        if ($TURNS = "Unlimited")
            setVar $TURNS 65000
	    setVar $unlimitedGame TRUE
        end
	saveVar $unlimitedGame
        goto :waitForInfo

    :getHolds
        killAllTriggers
        setVar $line CURRENTLINE
        getWord $line $TOTAL_HOLDS 4
        getWordPos $line $textpos "Ore="
        if ($textpos <> 0)
            cutText CURRENTLINE $temp $textpos 100
            getWord $temp $ORE_HOLDS 1
            stripText $ORE_HOLDS "Ore="
        else
            setVar $ORE_HOLDS 0
        end
        getWordPos $line $textpos "Organics="
        if ($textpos <> 0)
            cutText CURRENTLINE $temp $textpos 100
            getWord $temp $ORGANIC_HOLDS 1
            stripText $ORGANIC_HOLDS "Organics="
        else
            setVar $ORGANIC_HOLDS 0
        end
        getWordPos $line $textpos "Equipment="
        if ($textpos <> 0)
            cutText CURRENTLINE $temp $textpos 100
            getWord $temp $EQUIPMENT_HOLDS 1
            stripText $EQUIPMENT_HOLDS "Equipment="
        else
            setVar $EQUIPMENT_HOLDS 0
        end
        getWordPos $line $textpos "Colonists="
        if ($textpos <> 0)
            cutText CURRENTLINE $temp $textpos 100
            getWord $temp $COLONIST_HOLDS 1
            stripText $COLONIST_HOLDS "Colonists="
        else
            setVar $COLONIST_HOLDS 0
        end
        getWordPos $line $textpos "Empty="
        if ($textpos <> 0)
            cutText CURRENTLINE $temp $textpos 100
            getWord $temp $EMPTY_HOLDS 1
            stripText $EMPTY_HOLDS "Empty="
        else
            setVar $EMPTY_HOLDS 0
        end
        goto :waitForInfo

    :getFighters
        killAllTriggers
        getWord CURRENTLINE $FIGHTERS 3
        stripText $FIGHTERS ","
        goto :waitForInfo

    :getShields
        killAllTriggers
        getWord CURRENTLINE $SHIELDS 4
        stripText $SHIELDS ","
        goto :waitForInfo

    :getPhotons
        killAllTriggers
        getWord CURRENTLINE $PHOTONS 3
        goto :waitForInfo

    :getScanType
        killAllTriggers
        getWord CURRENTLINE $SCAN_TYPE 4
        goto :waitForInfo

    :getTwarpType1
        killAllTriggers
        getWord CURRENTLINE $TWARP_1_RANGE 4
        setVar $twarp_type 1
        goto :waitForInfo

    :getTwarpType2
        killAllTriggers
        getWord CURRENTLINE $TWARP_2_RANGE 4
        setVar $twarp_type 2
        goto :waitForInfo

    :getCredits
        killAllTriggers
        getWord CURRENTLINE $CREDITS 3
        stripText $CREDITS ","
        goto :waitForInfo

    :getInfoDone
        killalltriggers
return
# ==============================  END PLAYER INFO SUBROUTINE  =================

# ===========================  START SWATH DISABLING SUBROUTINE  =================
:swathoff
    if ($swathoff = FALSE)
        setTextTrigger swathison :swathison "Command [TL="
        setDelayTrigger swathisoff :swathisoff 2000
        pause

        :swathison
        killalltriggers
        setVar $swathOffMessage "Detected SWATH Autohaggle"
        setVar $swathoff FALSE
        return

        :swathisoff
        killalltriggers
        setVar $swathoff TRUE
    end
return
# ==========================   END SWATH DISABLING SUBROUTINE  =================

:noFigAtLocation
	setSectorParameter $NearFig "FIGSEC" FALSE
	goto :tryAgain2

:buydownfuel
	setVar $upgrade FALSE
	killAllTriggers
	gosub :quikstats
	send "q"
	waitOn "Planet command (?"
	gosub :getPlanetInfo
	send "c"
					if ($upgrade)
						setVar $total_creds_needed (300*7000)
						if ($total_creds_needed > $CREDITS)
							setVar $cashonhand $citadelcredits
							add $cashonhand $CREDITS
							if ($cashonhand > $total_creds_needed)
							        send "T T " & $CREDITS & "* "
				        			send "T F " & $total_creds_needed & "* "
				        			setVar $CREDITS $total_creds_needed
		    					end
						end
						send "q q *O 1"
						waitOn ", 0 to quit)"
						getWord CURRENTLINE $upgradeAmount 9
						stripText $upgradeAmount "("
						send $upgradeAmount&"* * *CR*Q"
						waitOn "What sector is the port in? ["&$CURRENT_SECTOR&"]"
						setTextLineTrigger getFuel2 :fuelDuring "Fuel Ore"
						pause
						:fuelDuring
							killalltriggers
							getWord CURRENTLINE $totalPortFuel 4
						waitOn "<Computer deactivated>"
						gosub :quikstats
					else
						send "q q *cr*q"
						waitOn "Fuel Ore"
						getWord CURRENTLINE $totalPortFuel 4
					end
					if (($planetFuelMax-$planetFuel) < $totalPortFuel)
						setVar $turnsToEmpty (($planetFuelMax-$planetFuel)/$TOTAL_HOLDS)
						setVar $isDone TRUE
					else
						setVar $turnsToEmpty ($totalPortFuel/$TOTAL_HOLDS)
					end
					setVar $total_creds_needed ($turnsToEmpty*$TOTAL_HOLDS*35)
					if ($CREDITS < $total_creds_needed)
						gosub :getFuelCash
					end
					if ($CREDITS < $total_creds_needed)
						gosub :landOnPlanetEnterCitadel
						return
					end
					setVar $creditsBefore $CREDITS
					if (($unlimitedGame = FALSE) AND (($turns-$turnsToEmpty) <= $bot_turn_limit))
						setVar $turnsTooLow TRUE
						gosub :landOnPlanetEnterCitadel
						return
					end
					while ($turnsToEmpty > 1)
						setVar $creditsBefore $CREDITS
						if ($turbo)
							send "P T * * l j"&#8&$planet&"*   t  n  l 1*  q * "
						else
							send "P T * * l j"&#8&$planet&"*   t  n  l 1*  q * /"
						end
						subtract $turnsToEmpty 1
						add $totalHolds $TOTAL_HOLDS
						if ($turbo <> TRUE)
							waitOn "?Creds"
						end
					end
					gosub :quikstats
					if ((($TURNS < $bot_turn_limit) AND ($unlimitedGame = FALSE)))
						gosub :landOnPlanetEnterCitadel
						return
					end
					add $spentCredits ($creditsBefore - $CREDITS)
				gosub :landOnPlanetEnterCitadel
return

:landOnPlanetEnterCitadel
	send "l "&$planet&"*tnl1*tnl2*tnl3*snl1*snl2*snl3*c "
	waitOn "Fuel Ore"
	getWord CURRENTLINE $planetFuel 6
	stripText $planetFuel ","
	send "@"
	waitOn "Average Interval Lag:"
	gosub :quikstats
#	setVar $cashToTransfer $CREDITS
#	send "D"
#	waitOn "Citadel treasury contains "
#	getWord CURRENTLINE $citadelCash 4
#	stripText $citadelCash ","
#	send "t t "&$cashToTransfer&"* "
return

:getFuelCash
	send "l " $planet "*   c t f"&$total_creds_needed&"*qq* "
	gosub :quikstats
return

:startHaggle
killalltriggers
setVar $hfactor 5

:units
        killtrigger ptrade
        killtrigger strade
        killtrigger go
        killtrigger done
	gosub :setConnectionTriggers
        SetTextTrigger ptrade :bunits "do you want to buy ["
        SetTextTrigger strade :sunits "do you want to sell ["
        setTextLineTrigger go :finishhaggle "Agreed, "
        setTextLineTrigger done :donehaggle "empty cargo holds."
        pause

:finishhaggle
        killtrigger done
        gosub :haggle

:donehaggle
 
return

:bunits
        setVar $multiplier (100 - $hfactor)
        goto :units

:sunits
        setVar $multiplier (100 + $hfactor)
	goto :units


:haggle
        setVar $ni 0
        setVar $midhag "-1"
        setVar $nocred 0
        killtrigger 1
        killtrigger 0
        killtrigger donehaggling
	killtrigger donhag
	killtrigger offerme
        gosub :setConnectionTriggers
        setTextTrigger donehag :done_haggle "Command [TL="
        SetTextTrigger donehaggling :done_haggle "empty cargo holds."
        SetTextTrigger offerme :offerme "] ?"
        pause

:offerme
        getWord CURRENTLINE $offer 3
        stripText $offer "["
        stripText $offer "]"
        stripText $offer ","
        stripText $offer "?"
        setVar $orig_offer $offer

:rehaggle
        killtrigger 1
	killtrigger 0
        killtrigger 2
        killtrigger 3
        setVar $offer (($orig_offer * $multiplier) / 100)
        send $offer "*"
        add $midhag 1
        waitFor $offer
        IF ($multiplier > 100)
	       subtract $multiplier 1
        ELSE
	       add $multiplier 1
        END
        send "@"
        waiton "Average Interval Lag:"
        setTextTrigger 0 :done_haggle "How many holds of"
        setTextTrigger 1 :rehaggle "Your offer"
        setTextTrigger 2 :donehag "We're not interested."
        setTextTrigger 3 :nocreds "You only have"
        pause

:nocreds
        setVAr $nocred 1
        send "0*0*"
        goto :done_haggle

:donehag
        setVar $ni 1

:done_haggle
        killtrigger donehag
        killtrigger 0
        killtrigger 1
        killtrigger 2
        killtrigger 3
        killtrigger rehaggle
        killtrigger donehaggling
        killtrigger offerme
	killalltriggers
        return

:check_ports
        killalltriggers
        send "q  q  q  z  n  *"
        setTextLineTrigger port_blown :port_blown "<=-DANGER-=>  Scanners indicate massive debris and heavy"
        setTextLineTrigger port_here :port_here "Class"
        setTextLineTrigger needs_port :build_port "Warps to Sector(s)"
        pause

        :port_here
	        killalltriggers
    		IF (PORT.CLASS[$CURRENT_SECTOR] <> 3)
                        send "l  " & #8 & #8 & $planet & "*  m n t *  c  "
      			waitfor "Citadel command"
                        gosub :quikstats
                        IF ($FIGHTERS < $SHIP_MAX_ATTACK)
                                send "'{" $bot_name "} - Not Enough Fighters to Blow Port*"
                                goto  :end_check_ports
                        ELSE
                                goto  :end_check_ports
                        END
   		ELSE
                        IF (PORT.BUILDTIME[$CURRENT_SECTOR] > 0)
                                goto :under_construction
                        END
                        send "q  q  q  z  n  *  o 1"
			waitfor "to quit)"
			getTExt CURRENTLINE $BUY "? (" "max"
			striptext $buy " "
			striptext $buy ","
			send $buy & "* *  "
			waitfor "Command"
			send "o 2"
			waitfor "to quit)"
			getTExt CURRENTLINE $BUY "? (" "max"
			striptext $buy " "
			striptext $buy ","
			send $buy & "* *  "
			waitfor "Command"
			send "o 3"
			waitfor "to quit)"
			getTExt CURRENTLINE $BUY "? (" "max"
			striptext $buy " "
			striptext $buy ","
			send $buy & "* * l "&$planet&"* c "
			send "s"
 			waitfor "Citadel command (?=h"
                        goto  :end_check_ports
                END
                goto  :end_check_ports

:build_port
        killalltriggers
        send "l " & #8 & $planetToFill & "*  m n t *  c "
        waitfor "Citadel command (?"
        IF ($CREDITS < 50000)
                send "T F 50000*"
                gosub :quikstats
                IF ($CREDITS < 50000)
                        send "'{" $bot_name "} - Not Enough Credits to Make Ports*"
                        send "qq* l " & #8 & $planet & "*  c  *"
                END
        END
        send "q q q z n * o3y" $portname "* l " & #8 & $planet & "*  c  *"
        goto :end_check_ports

:port_blown
        killalltriggers
        send "qq* l " & #8 & $planet & "*  c  *"
        goto :end_check_ports

:under_construction
        killalltriggers
        send "'{" $bot_name "} - Port at " & $CURRENT_SECTOR & " is Under Construction. " & PORT.BUILDTIME[$CURRENT_SECTOR] & " More Days*"
        send "l " & #8 & $planet & "*  m n t *  c "
        goto :end_check_ports

:end_check_ports
        killalltriggers
        RETURN

:get_dets
	setVar $JUMP 0
	IF (STARDOCK = 0)
		send "'{" $bot_name "} - Stardock Not Known To TWX.*"
		HALT
	END
        send "qq* jy* l " & $planetToFill & "* tnt1*mnt* qq*"
        WAITFOR "Command [TL="
	send " C R " & STARDOCK & "*Q "
	setTextLineTrigger itsalive	:itsalive	"Items     Status  Trading % of max OnBoard"
	setTextLineTrigger nosoupforme	:nosoupforme	"I have no information about a port in that sector"
	pause

	:nosoupforme
		killAllTriggers
		send "'{" $bot_name "} - StarDock appears to have been Blown Up!*"
		HALT

	:itsalive
	killAllTriggers

	if (($PLAYER~ALIGNMENT < 1000) AND ($ORE_HOLDS <> 0))
		setVar $adj 1
		while (SECTOR.WARPSIN[STARDOCK][$adj] <> 0)
			setVar $JUMP SECTOR.WARPSIN[STARDOCK][$adj]
			if ($JUMP <> $CURRENT_SECTOR)
				send "M Z " & $JUMP & "*Y"
				setTextLineTrigger	TwarpVoided		:Next_Jump_Point1	"You have marked sector "&$JUMP&" to be avoided!"
				setTextLineTrigger	TwarpBlind 		:Next_Jump_Point2	"No locating beam found"
				setTextLineTrigger	TwarpLocked		:TwarpLocked		"Locating beam pinpointed, TransWarp"
				setTextLineTrigger	TwarpNoGas		:Next_Jump_Point2	"You do not have enough Fuel Ore to make the jump"
				pause
				:TwarpLocked
					killAllTriggers
					goto :Lock_Initiated
				:Next_Jump_Point1
					killAllTriggers
					send "  NN   "
				:Next_Jump_Point2
					killAllTriggers
					send "  *   "
			end
        	add $adj 1
		end
		setVar $JUMP 0
	end
	:Lock_Initiated
	if ($JUMP = 0)
		getDistance $Dist1 $PLAYER~CURRENT_SECTOR STARDOCK
		if ($Dist1 = "-1")
			send "cf" & $PLAYER~CURRENT_SECTOR & "*" & STARDOCK & "*q"
			waitOn "What is the starting sector"
			waitOn "Command [TL="
			getDistance $Dist1 $PLAYER~CURRENT_SECTOR STARDOCK
		end
	else
		getDistance $Dist1 $PLAYER~CURRENT_SECTOR $JUMP
		if ($Dist1 = "-1")
			send "cf" & $PLAYER~CURRENT_SECTOR & "*" & $JUMP & "*q"
			waitOn "What is the starting sector"
			waitOn "Command [TL="
			getDistance $Dist1 $PLAYER~CURRENT_SECTOR $JUMP
		end
	end
	getDistance $Dist2 STARDOCK $PLAYER~CURRENT_SECTOR
	if ($Dist2 = "-1")
		send "cf" & STARDOCK & "*" & $PLAYER~CURRENT_SECTOR & "*q"
		waitOn "What is the starting sector"
		waitOn "Command [TL="
		getDistance $Dist2 STARDOCK $PLAYER~CURRENT_SECTOR
	end

	setVar $ORE_REQ (($Dist1 + $Dist2) * 3)

	if (($PLAYER~TWARP_TYPE = "No") OR ($PLAYER~ORE_HOLDS < $ORE_REQ) OR (($PLAYER~ALIGN < 1000) AND ($JUMP = 0)))
		if ($JUMP <> 0)
			send "  N  "
		end
	else
		SetVar $MOW FALSE
	end

	IF ($MOW)
	ELSE
		if ($JUMP = 0)
			send (" M " & STARDOCK & "* Y Y * P S G Y G Q H ")
		else
			send (" Y  *  M " & STARDOCK & "* P S G Y G Q H ")
		end
	end

	waitfor "<Hardware Emporium>"
	send "A"
	waitfor "How many Atomic Detonators do you want"
	getText CURRENTLINE $BUY "(Max" ") ["
	stripText $BUY " "
	stripText $BUY ","
	send $BUY & "* T "
	waitfor "How many Genesis Torpedoes do you want"
	getText CURRENTLINE $BUY "(Max" ") ["
	stripText $BUY " "
	stripText $BUY ","
	send $BUY & "* Q S P C "
	waitfor "How many shield armor points do you want to buy"
	getText CURRENTLINE $BUY "(Max" ") ["
	stripText $BUY " "
	stripText $BUY ","
	send $BUY & "* "

	IF ($MOW)
	ELSE
		send ("Q Q Q  " & $PLAYER~CURRENT_SECTOR & "*Y")
		setTextLineTrigger	TwarpVoided		:TwarpBad1			"You have marked sector "&$PLAYER~CURRENT_SECTOR&" to be avoided!"
		setTextLineTrigger	TwarpBlind 		:TwarpBad2			"No locating beam found"
		setTextLineTrigger	TwarpLocked		:TwarpGood			"Locating beam pinpointed, TransWarp"
		SetTextLineTrigger	TwarpNoGas		:TwarpBad2			"You do not have enough Fuel Ore to make the jump"
		pause
		:TwarpBad1
			killAllTriggers
			send "  NN   "
		:TwarpBad2
			killAllTriggers
			send " *  P S G Y G Q "
			waitfor "You leave the Galactic Bank."
			Echo "**" & ANSI_14 & "Return Trip Failed.*"
			halt
		:TwarpGood
			killAllTriggers
			send "  Y  *   J  Y  "
	END
	waitfor "Are you sure you want to jettison all cargo"
	waitfor "Command [TL"
	getText CURRENTLINE $WhereRwe "]:[" "] (?"
	stripText $WhereRwe " "
	IF ($WhereRwe <> $PLAYER~CURRENT_SECTOR)
		Echo "*" & ANSI_14 & "Return Trip Failed.*"
		HALT
	END
	return


:getCourse
	killalltriggers
	setVar $sectors ""
	setTextLineTrigger sectorlinetrig :sectorsline " > "
	send ("^f"&$source&"*"&$destination&"*q")
	pause

:sectorsline
	killAllTriggers
	setVar $line CURRENTLINE
	replacetext $line ">" " "
	striptext $line "("
	striptext $line ")"
	setVar $line $line&" "
	getWordPos $line $pos "So what's the point?"
	getWordPos $line $pos2 ": ENDINTERROG"
	if (($pos > 0) OR ($pos2 > 0))
		setVar $NoPATH TRUE
		goto :noPath
	end
	getWordPos $line $pos " sector "
	getWordPos $line $pos2 "TO"
	if (($pos <= 0) AND ($pos2 <= 0))
		setVar $sectors $sectors & " " & $line
	end
	getWordPos $line $pos " "&$destination&" "
	getWordPos $line $pos2 "("&$destination&")"
	getWordPos $line $pos3 "TO"
	if ((($pos > 0) OR ($pos2 > 0)) AND ($pos3 <= 0))
		goto :gotSectors
	else
		setTextLineTrigger sectorlinetrig :sectorsline " > "
		setTextLineTrigger sectorlinetrig2 :sectorsline " "&$destination&" "
		setTextLineTrigger sectorlinetrig3 :sectorsline " "&$destination
		setTextLineTrigger sectorlinetrig4 :sectorsline "("&$destination&")"
		setTextLineTrigger donePath :sectorsline "So what's the point?"
		setTextLineTrigger donePath2 :sectorsline ": ENDINTERROG"
	end
	pause

:gotSectors
	killAllTriggers
	setVar $sectors $sectors&" :::"
	setArray $COURSE 100
	setVar $courseLength 0
	setVar $index 1
	:keepGoing
	getWord $sectors $COURSE[$index] $index
	while ($COURSE[$index] <> ":::")
		add $courseLength 1
		add $index 1
		getWord $sectors $COURSE[$index] $index
	end
	return
:noPath
	killAllTriggers
	send "  *  "
	return
	
:colonize
        killalltriggers
        setvar $status_message "Colonizing Planet"
        gosub :setWindow
        send "l " & #8 & $planetToFill & "*m n t * q l " & #8 & $planets[$j] & "* c"
        waitfor "Planet command (?"
        send "'" & $bot_name & " colo s*"
        settextlinetrigger planetneedsfuel :colonizerneedsfuel "Colonizer needs more fuel on planet"
        settextlinetrigger terraneedscolos :terraneedscolos "Terra is empty. Colonizer shutting down"
        pause
        
        :terraneedscolos
        :colonizerneedsfuel
             send "qq* "
             return

:CLEARPARMS
SetVar $PARM1 "0"
SetVar $PARM2 "0"
SetVar $PARM3 "0"
SetVar $PARM4 "0"
SetVar $PARM5 "0"
SetVar $PARM6 "0"
SetVar $PARM7 "0"
SetVar $PARM8 "0"
SetVar $COMMAND "0"
SaveVar $COMMAND
SetVar $USER_COMMAND_LINE "0 0 0 0 0 0 0"
SaveVar $USER_COMMAND_LINE
SaveVar $PARM1
SaveVar $PARM2
SaveVar $PARM3
SaveVar $PARM4
SaveVar $PARM5
SaveVar $PARM6
SaveVar $PARM7
SaveVar $PARM8
Return

#-=-=-=-=-includes-=-=-=-=-
include "source\bot_includes\player"
include "source\bot_includes\planet"

