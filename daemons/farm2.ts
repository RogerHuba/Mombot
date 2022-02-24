	reqRecording
	gosub :BOT~loadVars

	loadVar $GAME~GENESIS_COST
	loadVar $GAME~ATOMIC_COST
	loadVar $MAP~STARDOCK 
	loadvar $bot~folder
	loadvar $game~MAX_PLANETS_PER_SECTOR
	loadvar $planet~planet_file
	setVar $BUBBLE_LIST $bot~folder&"/bubble.list"
	setVar $BOT~command "farm"
	Window Farm_Script 330 424 ("M()M Farmer - " & GAMENAME) ONTOP

	setVar $BOT~help[1]  $BOT~tab&"Farms sectors marked with FARM parameters.  "
	setVar $BOT~help[2]  $BOT~tab&"       "
	setVar $BOT~help[3]  $BOT~tab&"  Options: "
	setVar $BOT~help[4]  $BOT~tab&"    [farm:xxx] - uses xxx sectors as farm sectors"
	setVar $BOT~help[5]  $BOT~tab&"       [f o e] - will strip fuel, org, equip off planets"
	setVar $BOT~help[6]  $BOT~tab&"        [cash] - will grab cash off planets"
	setVar $BOT~help[7]  $BOT~tab&"        [warp] - will warp planets to sell product"
	setVar $BOT~help[8]  $BOT~tab&"         [neg] - will attempt to sell product in sector only"
	setVar $BOT~help[9]  $BOT~tab&"        [half] - only sell half port capacity"
	setVar $BOT~help[10] $BOT~tab&"      [shield] - will ensure 200 Shields on shielded planets"
	setVar $BOT~help[11] $BOT~tab&"        [colo] - will colonize planets with avaliable fuel"
	setVar $BOT~help[12] $BOT~tab&"        [coln] - will balance colonists on planets"
	setVar $BOT~help[13] $BOT~tab&"     [upgrade] - will upgrade all planets "
	setVar $BOT~help[14] $BOT~tab&"        [port] - will create and upgrade sbb on ports"
	setVar $BOT~help[15] $BOT~tab&"    [skipfuel] - won't upgrade fuel       - for port option"
	setVar $BOT~help[16] $BOT~tab&"     [skiporg] - won't upgrade organics   - for port option "
	setVar $BOT~help[17] $BOT~tab&"   [skipequip] - won't upgrade equipment  - for port option"
	setVar $BOT~help[18] $BOT~tab&"       [build] - will create and upgrade planets and port"
	setVar $BOT~help[19] $BOT~tab&"[destroyports] - will destroy all non-class 3 ports"
	setVar $BOT~help[20] $BOT~tab&"         [one] - only pops 1 planet when none exist"
	setVar $BOT~help[21] $BOT~tab&"     [nostrip] - won't attempt to strip during build"
	setVar $BOT~help[22] $BOT~tab&"   [noupgrade] - won't attempt to upgrade during build"
	setVar $BOT~help[23] $BOT~tab&"     [defense] - set cannons"
	setVar $BOT~help[24] $BOT~tab&"      [amtrak] - uses amtrak sectors as farm sectors"
	setVar $BOT~help[25] $BOT~tab&"  [allplanets] - uses tl sectors as farm sectors"
	setVar $BOT~help[26] $BOT~tab&"     [planets] - only visits sectors with planets"
	setVar $BOT~help[27] $BOT~tab&"         [fig] - will strip fighters off planets"
	setVar $BOT~help[28] $BOT~tab&"     [balance] - balance planets throughout bubble or farm"
	setVar $BOT~help[29] $BOT~tab&"     [movefig] - moves all fighters from planet to sector"
	setVar $BOT~help[30] $BOT~tab&"   [barricade] - moves all fighters from planets to home"
	setVar $BOT~help[31] $BOT~tab&"  [armageddon] - destroy all planets and ports (kills colos)"
	setVar $BOT~help[32] $BOT~tab&"         [off] - turns off farming script"
	setVar $BOT~help[33] $BOT~tab&"       "
	setVar $BOT~help[34] $BOT~tab&"Data Options:"
	setVar $BOT~help[35] $BOT~tab&"         {set} plus [sector number]"
	setVar $BOT~help[36] $BOT~tab&"               - Marks sector as a FARM Sector"
	setVar $BOT~help[37] $BOT~tab&"                 "
	setVar $BOT~help[38] $BOT~tab&"       {clear} - Clears all FARM and BUBBLE sectors"
	setVar $BOT~help[39] $BOT~tab&"              "
	setVar $BOT~help[40] $BOT~tab&"   {setbubble} plus [bubble door]  "
	setVar $BOT~help[41] $BOT~tab&"               - sets all BUBBLE sectors"
	setVar $BOT~help[42] $BOT~tab&"                         "
	setVar $BOT~help[43] $BOT~tab&"        {list} - Lists all farm sectors"
	setVar $BOT~help[44] $BOT~tab&"        "
	setVar $BOT~help[45] $BOT~tab&"       {remove} plus [sector number]"
	setVar $BOT~help[46] $BOT~tab&"               - Removes FARM and BUBBLE marked sector"
	setVar $BOT~help[47] $BOT~tab&"    Examples:  "
	setVar $BOT~help[48] $BOT~tab&"              >farm neg half figs farm:bubble"
	setVar $BOT~help[49] $BOT~tab&"              >farm o e merch farm:targets"
	setVar $BOT~help[50] $BOT~tab&"              >farm o e figs warp"
	gosub :bot~helpfile

	setvar $portname "Mind ()ver Matter"
	setvar $planet~planetnamedoor "DOOR GUN"
	setvar $bot~parameter "FARM"
	setvar $name_the_planet "Mind ()ver Matter"
	setVar $j 1
	setvar $status_message "Initializing"
	setVar $version "3.0.0"
	
	setVar $BOT~script_title "M()M Farmer"

	gosub :process_command_line

	gosub :BOT~banner

	if (($planets~get_figs = FALSE) and ($strip = FALSE) and ($neg = FALSE) and ($warp = FALSE) and ($port = FALSE) and ($upgrade = FALSE) and ($colo = FALSE) and ($cash = FALSE) and ($shield = FALSE) and ($build = FALSE) and ($colonize = FALSE) and ($colo = FALSE) and ($bot~parm1 <> "") and ($defense = FALSE) and ($balance = FALSE) and ($barricade = FALSE) and ($armageddon = FALSE))
		setVar $SWITCHBOARD~message "What's the point?*"
		gosub :SWITCHBOARD~switchboard
		halt
	elseif ($bot~parm1 = "")
		setVar $SWITCHBOARD~message "What's the point?*"
		gosub :SWITCHBOARD~switchboard
		halt
	end



	setVar $i 1
	setArray $planet~planets 30
	gosub :PLAYER~quikstats
	setvar $home $PLAYER~CURRENT_SECTOR
	if ($PLAYER~PLANET_SCANNER = "No")
		setVar $SWITCHBOARD~message "Planet Farmer must be run with a planet scanner.*"
		gosub :SWITCHBOARD~switchboard
		halt
	elseif ($PLAYER~CURRENT_PROMPT <> "Citadel")
		setVar $SWITCHBOARD~message "Planet Farmer must be run from the Citadel Prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	
	gosub :PLANET~loadplanetInfo

	send "q"
	gosub :PLANET~getPlanetInfo
	send "c"
	setvar $planet~planetToFill $planet~planet
	gosub :SHIP~getShipStats
	gosub :data~fillplanetstats

	gosub :setWindow

	gosub :planets~get_tl_list
	setArray $checked SECTORS
		
:start
	killalltriggers
	setVar $bottom 1
	setVar $top 1
	setVar $que[1] $player~current_sector

	setVar $focus 11
	while ($focus <= SECTORS)
		gosub :planets~checkForFarmTarget
		if ($isFarmFound = TRUE)
			add $count 1
		end
		add $focus 1
	end
	setvar $switchboard~message "Farm found "&$count&" "&$bot~parameter&" sectors to do farming on.*"
	gosub :switchboard~switchboard
	if ($count <= 0)
		halt
	end
	setvar $switchboard~message "Finding nearest farm sector...  please hold..*"
	gosub :switchboard~switchboard
	setVar $PLAYER~save TRUE
	setVar $focus 11
	gosub :player~quikstats
	setVar $checked[$player~current_sector] 1
	while ($bottom <= $top)
		setVar $focus $que[$bottom]
		loadVar $BOT~botIsDeaf
		loadVar $BOT~silent_running
		gosub :planets~checkForFarmTarget
		#########################################################
		# Found a farm target - do the farming for that sector! #
		#########################################################
		if (($isFarmFound = TRUE) and ($focus <> $player~current_sector))
			setvar $data~farmSector $focus
			gosub :move_the_planet
		end
		setVar $nearfig 0

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
	gosub :planets~end
	halt

:stripallplanets
	setVar $j 1
	send "qq* "
	if ((($upgrade = true) OR ($build = true)) AND ($noupgrade = FALSE))
		gosub :planets~upgrade
	end
	while ($j <= $planet~planetCount)
		if ($planet~planetToFill <> $planet~planets[$j])
			send "l " & #8 & $planet~planets[$j] & "* "
			gosub :PLANET~getPlanetInfo
			gosub :setwindow
			setVar $planet~planet_CLASS $planet~planet_CLASS_NAME
			lowercase $planet~planet_CLASS

			if ($armageddon = TRUE)
				gosub :planets~armageddon
			end
			setVar $i 1
			setVar $foundPlanet FALSE
			while (($i <= $planet~planetcounter) AND ($foundPlanet = FALSE))
				lowercase $planet~planetList[$i]
				lowercase $planet~planet_CLASS
				getWordPos $planet~planetList[$i] $pos $planet~planet_CLASS
				if ($pos > 0)
					setVar $planet~planet_FUEL_COLONISTS_MAX $planet~planetList[$i][2]
					setVar $planet~planet_ORGANICS_COLONISTS_MAX $planet~planetList[$i][4]
					setVar $planet~planet_EQUIPMENT_COLONISTS_MAX $planet~planetList[$i][6]
					setVar $planet~planet_FUEL_COLONISTS_MIN $planet~planetList[$i][1]
					setVar $planet~planet_ORGANICS_COLONISTS_MIN $planet~planetList[$i][3]
					setVar $planet~planet_EQUIPMENT_COLONISTS_MIN $planet~planetList[$i][5]
					setVar $foundPlanet TRUE
				end
				if ($foundPlanet = FALSE)
					add $i 1
				end
			end
			if ($foundPlanet = FALSE)
				subtract $i 1
				setVar $SWITCHBOARD~message "[" & $planet~planet_CLASS & "] Planet Class Not Recognized Sector: " & $PLAYER~CURRENT_SECTOR & "["&$planet~planetList[$i]&"]*"
				gosub :switchboard~switchboard
				goto :doneWithThisPlanet
			end
			if ($colonize = true)
				gosub :planets~colonize
			end
			if ($defense = true)
				gosub :planets~set_defense
			end
			if ($barricade = TRUE)
				gosub :planets~barricade
			end
			if ($planets~movefig = TRUE)
				gosub :planets~movefig
			end
			if ($barricade = TRUE)
				gosub :PLAYER~quikstats
				if (($PLAYER~CURRENT_SECTOR = $home) AND ($PLAYER~CURRENT_PROMPT = "Citadel"))
					setVar $player~warpto $data~farmSector
					gosub :planets~pwarp
					send "q  "
				end
			end

			gosub :planets~adjust_colonist_levels
			gosub :setWindow
			gosub :PLANET~getPlanetInfo
			send "c "
			if (($planet~CITADEL_CREDITS > 0) and ($cash = true))
				gosub :planets~grab_treasury
			end
			if (($shield = true) and ($planet~CITADEL > 4) and ($planet~planet_SHIELD_POWER < 200))
				gosub :planets~add_shields
			end
			if (($warp = TRUE) and ($planet~CITADEL > 3) and ($planet~planet_FUEL > 10000) and (($planet~planet_ORGANICS > 50000) or ($planet~planet_EQUIPMENT > 50000)))
				gosub :planets~warp_and_sell
			end
			if ($neg = true)
				gosub :planets~neg
			end

			send "qq* * "

			if ($strip = true)
				gosub :planets~strip
			:try_colo
			if ($colo = true)
				gosub :planets~colo
			end

			send "q* jy* "
			:doneWithThisPlanet
				killAllTriggers
		end
		add $j 1
	end
	gosub :planets~land_on_farm_planet
RETURN


:setWindow
	#gosub :PLAYER~quikstats
	setVar $msg "* Status: " & $status_message
	setVar $msg $msg & "* Home Sector:   " & $home
	setVar $msg $msg & "* Current Sector " & $PLAYER~CURRENT_SECTOR
	if ($PLAYER~TURNS > 0)
			setVar $msg $msg & "* Turns: " & $PLAYER~TURNS
	end
	setVar $msg $msg & "* Farm Planet: " & $planet~planetToFill
	setVar $msg $msg & "* ----------------"
	setVar $msg $msg & "* Fuel: " & $planet~planetToFillFuel
	setVar $msg $msg & "* Organics: " & $planet~planetToFillOrganics
	setVar $msg $msg & "* Equipment: " & $planet~planetToFillEquipment
	setVar $msg $msg & "* Fuel Colonists: " & $planet~planetToFillFuelColonists
	setVar $msg $msg & "* Organics Colonists: " & $planet~planetToFillOrganicsColonists
	setVar $msg $msg & "* Equipment Colonists: " & $planet~planetToFillEquipmentColonists
	setVar $msg $msg & "** Target Planet: " & $planet~planets[$j]
	setVar $msg $msg & "* ----------------"
	setVar $msg $msg & "* Fuel: " & $planet~planet_FUEL
	setVar $msg $msg & "* Organics: " & $planet~planet_ORGANICS
	setVar $msg $msg & "* Equipment: " & $planet~planet_EQUIPMENT
	setVar $msg $msg & "* Fuel Colonists: " & $planet~planet_FUEL_COLONISTS
	setVar $msg $msg & "* Organics Colonists: " & $planet~planet_ORGANICS_COLONISTS
	setVar $msg $msg & "* Equipment Colonists: " & $planet~planet_EQUIPMENT_COLONISTS
	setVar $msg $msg & "* Min / Max Fuel Colo: " & $planet~planet_FUEL_COLONISTS_MIN & " / " & $planet~planet_FUEL_COLONISTS_MAX
	setVar $msg $msg & "* Min / Max Organics Colo: " & $planet~planet_ORGANICS_COLONISTS_MIN & " / " & $planet~planet_ORGANICS_COLONISTS_MAX
	setVar $msg $msg & "* Min / Max Equipment Colo: " & $planet~planet_EQUIPMENT_COLONISTS_MIN & " / " & $planet~planet_EQUIPMENT_COLONISTS_MAX
	setVar $msg $msg & "** Credits: " & $PLAYER~CREDITS
	setWindowContents Farm_Script $msg & $msg1
	setVar $window_content $msg 
	replaceText $window_content "*" "[][]"
	saveVar $window_content
return
		
:move_the_planet
	send "p "& $focus &"  *ys* "
	settextlinetrigger warp_it :warp_it "All Systems Ready, shall we engage?"
	settextlinetrigger no_warp :no_warp "You do not have any fighters in Sector"
	setTextLineTrigger alreadythere :warp_it "You are already in that sector!"
	pause

:no_warp
	killalltriggers
	return

:warp_it
	killalltriggers
	setvar $player~current_sector $focus
	gosub :setWindow
	if ($WARP)
			send "tt"
			waitfor "How much to transfer?"
			send $PLAYER~CREDITS&"*"
			waitfor "Citadel treasury contains"
	end

	send "q"
	gosub :PLANET~getPlanetInfo
	gosub :data~fillplanetstats

	send "m*** q* "
	gosub :planets~count
	if ($build = TRUE)
		gosub :planets~build
	end
	gosub :setWindow

	gosub :planets~count
	if (($port) OR ($build))
		gosub :ports~check
	end
	if ($balance = true)
		gosub :planets~balance
	end
	:done_moving_planets
	if ($balance = true)
		gosub :planets~count
	end
	if ($armageddon = TRUE)
		gosub :dump_and_destroy_ports
	end
	if (($strip) or ($colo) or ($upgrade) or ($cash) or ($warp) or ($shield) or ($colonize) or ($figs) or ($defense) or ($planets~movefig) or ($barricade) or ($armageddon))
		gosub :stripallplanets
	end
	if ($silent <> TRUE)
		setVar $SWITCHBOARD~message "Completed All Farming/Building/Port Actions Sector: "&$data~farmSector&".*"
		gosub :SWITCHBOARD~switchboard
	end
	send "qq* l " & #8 & $planet~planetToFill & "* "
	gosub :PLANET~getPlanetInfo
	gosub :data~fillplanetstats
	send "c"
	:next_farm_sector
	if ($strip = TRUE)
		if ((($planets~get_org = TRUE) AND ($planet~planet_ORGANICS > ($planet~planet_ORGANICS_MAX-1000))) AND (($planets~get_equ = TRUE) AND ($planet~planet_EQUIPMENT > ($planet~planet_EQUIPMENT_MAX - 1000))))
			setVar $planet~planetIsFull TRUE
			gosub :planets~end
			halt
		end
	end
return

:process_command_line
		
	if ($bot~parm1 = "off")
		setVar $SWITCHBOARD~message "Shutting down "&$BOT~script_title&".*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($bot~parm1 = "setbubble") or ($bot~parm1 = "bubbleset")
		gosub :data~setbubble
		halt
	end

	getWordPos $bot~user_command_line $pos "balance"
	if ($pos > 0)
		setVar $balance TRUE
	else
		setVar $balance FALSE
	end

	getWordPos $bot~user_command_line $pos "half"
	if ($pos > 0)
		setVar $half TRUE
	else
		setVar $half FALSE
	end

	getWordPos $bot~user_command_line $pos "silent"
	if ($pos > 0)
		setVar $silent TRUE
	else
		setVar $silent FALSE
	end

	getWordPos $bot~user_command_line $pos "amtrak"
	if ($pos > 0)
		setVar $amtrak TRUE
	else
		setVar $amtrak FALSE
	end

	getWordPos $bot~user_command_line $pos "allplanets"
	if ($pos > 0)
		setVar $allplanets TRUE
	else
		setVar $allplanets FALSE
	end

	getWordPos $bot~user_command_line $pos "planets"
	if ($pos > 0)
		setVar $where_planets TRUE
	else
		setVar $where_planets FALSE
	end

	getWordPos $bot~user_command_line $pos "fig"
	if ($pos > 0)
		setVar $strip TRUE
		setVar $planets~get_figs TRUE
	else
		setVar $planets~get_figs FALSE
	end
	
	getWordPos $bot~user_command_line $pos "reverse"
	if ($pos > 0)
		setVar $reverse TRUE
	else
		setVar $reverse FALSE
	end

	getWordPos " "&$bot~user_command_line&" " $pos "one"
	if ($pos > 0)
		setVar $one_per_sector TRUE
	else
		setVar $one_per_Sector FALSE
	end

	getWordPos $bot~user_command_line $pos "nostrip"
	if ($pos > 0)
		setVar $nostrip TRUE
	else
		setVar $nostrip FALSE
	end

	getWordPos $bot~user_command_line $pos "noupgrade"
	if ($pos > 0)
		setVar $noupgrade TRUE
	else
		setVar $noupgrade FALSE
	end

	getWordPos $bot~user_command_line $pos "movefig"
	if ($pos > 0)
		setVar $planets~movefig TRUE
	else
		setVar $planets~movefig FALSE
	end

	getWordPos $bot~user_command_line $pos "defense"
	if ($pos > 0)
		setVar $defense TRUE
	else
		setVar $defense FALSE
	end

	getWordPos " "&$bot~user_command_line&" " $pos " f "
	if ($pos > 0)
		setVar $strip TRUE
		setVar $planets~get_fuel TRUE
	else
		setVar $planets~get_fuel FALSE
	end

	getWordPos " "&$bot~user_command_line&" " $pos " o "
	if ($pos > 0)
		setVar $strip TRUE
		setVar $planets~get_org TRUE
	else
		setVar $planets~get_org FALSE
	end

	getWordPos " "&$bot~user_command_line&" " $pos " e "
	if ($pos > 0)
		setVar $strip TRUE
		setVar $planets~get_equip TRUE
	else
		setVar $planets~get_equip FALSE
	end

	getWordPos $bot~user_command_line $pos "upgrade"
	if ($pos > 0)
		setVar $upgrade TRUE
	else
		setVar $upgrade FALSE
	end

	getWordPos $bot~user_command_line $pos "port"
	if ($pos > 0)
		setVar $port TRUE
	else
		setVar $port FALSE
	end

	getWordPos $bot~user_command_line $pos "skipfuel"
	if ($pos > 0)
		setVar $skipfuel TRUE
	else
		setVar $skipfuel FALSE
	end

	getWordPos $bot~user_command_line $pos "skiporg"
	if ($pos > 0)
		setVar $skiporg TRUE
	else
		setVar $skiporg FALSE
	end

	getWordPos $bot~user_command_line $pos "skipequip"
	if ($pos > 0)
		setVar $skipequip TRUE
	else
		setVar $skipequip FALSE
	end

	getWordPos $bot~user_command_line $pos "coln"
	if ($pos > 0)
		setVar $colo TRUE
	else
		setVar $colo FALSE
	end
	getWordPos $bot~user_command_line $pos "build"
	if ($pos > 0)
		setVar $build TRUE
		gosub :planet~make_planet_array
	else
		setVar $build FALSE
	end
	getWordPos $bot~user_command_line $pos "farm:"
	if ($pos > 0)
		getWordPos " "&$bot~user_command_line&" " $pos " farm:"
		setvar $use_bubble true
		if ($pos > 0)
			getText $bot~user_command_line&" " $bot~parameter "farm:" " "
			if ($bot~parameter = 0)
				setVar $SWITCHBOARD~message "Farm parameter is not valid.*"
				gosub :switchboard~switchboard
				halt
			else
				uppercase $bot~parameter
				setVar $SWITCHBOARD~message "Farming all sectors marked as "&$bot~parameter&".*"
				gosub :switchboard~switchboard			
			end
		end
	else
		setvar $use_bubble false
	end
	getWordPos $bot~user_command_line $pos "destroyports"
	if ($pos > 0)
		setVar $destroyports TRUE
	else
		setVar $destroyports FALSE
	end

	getWordPos $bot~user_command_line $pos "cash"
	if ($pos > 0)
		setVar $cash TRUE
	else
		setVar $cash FALSE
	end

	getWordPos $bot~user_command_line $pos "merch"
	if ($pos > 0)
		setVar $merch TRUE
	else
		setVar $merch FALSE
	end

	getWordPos $bot~user_command_line $pos "neg"
	if ($pos > 0)
		setVar $neg TRUE
	else
		setVar $neg FALSE
	end

	getWordPos $bot~user_command_line $pos "cim"
	if ($pos > 0)
		setVar $skipcim TRUE
	else
		setVar $skipcim FALSE
	end

	getWordPos $bot~user_command_line $pos "shield"
	if ($pos > 0)
		setVar $shield TRUE
	else
		setVar $shield FALSE
	end

	getWordPos $bot~user_command_line $pos "armaged"
	if ($pos > 0)
		setVar $armageddon TRUE
	else
		setVar $armageddon FALSE
	end

	getWordPos $bot~user_command_line $pos "warp"
	if ($pos > 0)
		setVar $warp TRUE
		if ($skipcim <> TRUE)
			send "^rq"
			waitFor ": ENDINTERROG"
		end
	else
		setVar $warp FALSE
	end

	getWordPos $bot~user_command_line $pos "colo"
	if ($pos > 0)
		setVar $colonize TRUE
	else
		setVar $colonize FALSE
	end

	getWordPos $bot~user_command_line $pos "barricade"
	if ($pos > 0)
		setVar $barricade TRUE
	else
		setVar $barricade FALSE
	end

	getWordPos $bot~user_command_line $pos "clear"
	if ($pos > 0)
		setVar $IDX 11
		setVar $perc 0
		while ($IDX <= SECTORS)
			setSectorParameter $IDX "BUBBLE" ""
			setSectorParameter $IDX "FARM" ""
			setSectorParameter $IDX "DOOR" ""
			add $IDX 1
			setVar $percTest (($IDX * 100) / SECTORS)
			if ($percTest > $perc)
				setVar $perc (($IDX * 100) / SECTORS)
				echo "*"
				echo #27 "["&($perc / 2)&"C"
				echo ANSI_14 "?" ANSI_15 " " $perc "%" #27 & "[1A   "
			end
		end
		DELETE $BUBBLE_LIST
		setVar $SWITCHBOARD~message "Bot Farming and Bubble Sectors Have Been Cleared.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	setVar $bubble_sectors " "
	setvar $count 0

	getWordPos $bot~user_command_line $pos "list"
	if ($pos > 0)
		setVar $IDX 11
		while ($IDX <= SECTORS)
			getsectorparameter $IDX $bot~parameter $test
			if ($test = TRUE)
				setVar $bubble_sectors $bubble_sectors&" "&$IDX 
				add $count 1
			end
			add $IDX 1
		end
		send "'*"&$count&" "&$bot~parameter&" sectors: "&$bubble_sectors&"**"
		halt
	end

	getWordPos $bot~user_command_line $pos "set"
	if ($pos > 0)
		isNumber $test $bot~parm2
		if ($test)
			if (($bot~parm2 > 10) AND ($bot~parm2 <= SECTORS) AND ($bot~parm2 <> STARDOCK))
				setSectorParameter $bot~parm2 $bot~parameter TRUE
				setVar $SWITCHBOARD~message "" & $bot~parm2 & " Sector added as "&$bot~parameter&" Sector.*"
				gosub :SWITCHBOARD~switchboard
			end
		else
			setVar $SWITCHBOARD~message "Sector to add not Valid.*"
			gosub :SWITCHBOARD~switchboard
		end
		halt
	end


	getWordPos $bot~user_command_line $pos "remove"
	if ($pos > 0)
		isNumber $test $bot~parm2
		if ($test)
			if (($bot~parm2 > 10) AND ($bot~parm2 <= SECTORS) AND ($bot~parm2 <> STARDOCK))
				setSectorParameter $bot~parm2 $bot~parameter FALSE
				setVar $SWITCHBOARD~message "" & $bot~parm2 & " Sector removed from "&$bot~parameter&" Sector Parameters.*"
				gosub :SWITCHBOARD~switchboard
			end
		else
			setVar $SWITCHBOARD~message "Sector to remove not Valid.*"
			gosub :SWITCHBOARD~switchboard
		end
		halt
	end

return

:waiton
	setdelaytrigger waitfortime :donewaitingfortime 5000
	waitOn "The Colonists drop what"
	killtrigger waitfortime
	:donewaitingfortime
return
#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\module_includes\farm\data"
include "source\module_includes\farm\ports"
include "source\module_includes\farm\planets"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\loadplanetinfo\planet"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\planet\makeplanetarray\planet"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\currentprompt\player"
