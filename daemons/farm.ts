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

	setVar $BOT~help[1]  $BOT~tab&" farm {farm:param} {f} {o} {e} {fig} {cash} {warp} {neg} {half}   "
	setVar $BOT~help[2]  $BOT~tab&"      {shield} {colo} {coln} {upgrade} {port} {skipfuel}  "
	setVar $BOT~help[3]  $BOT~tab&"      {skiporg} {skipequip} {build} {destroyports} {one}  "
	setVar $BOT~help[4]  $BOT~tab&"      {nostrip} {noupgrade} {defense} {amtrak} {allplanets}  "
	setVar $BOT~help[5]  $BOT~tab&"      {planets} {balance} {movefig} {barricade} {armageddon} "
	setVar $BOT~help[6]  $BOT~tab&"       "
	setVar $BOT~help[7]  $BOT~tab&"  Options: "
	setVar $BOT~help[8]  $BOT~tab&"  {farm:param} - uses param sectors as farm sectors"
	setVar $BOT~help[9]  $BOT~tab&"           {f} - will strip fuel off planets"
	setVar $BOT~help[10] $BOT~tab&"           {o} - will strip organics off planets"
	setVar $BOT~help[11] $BOT~tab&"           {e} - will strip equipment off planets"
	setVar $BOT~help[12] $BOT~tab&"         {fig} - will strip fighters off planets"
	setVar $BOT~help[13] $BOT~tab&"        {cash} - will grab cash off planets"
	setVar $BOT~help[14] $BOT~tab&"        {warp} - will warp planets to sell product"
	setVar $BOT~help[15] $BOT~tab&"         {neg} - will attempt to sell product in sector only"
	setVar $BOT~help[16] $BOT~tab&"        {half} - only sell half port capacity"
	setVar $BOT~help[17] $BOT~tab&"      {shield} - will ensure 200 Shields on shielded planets"
	setVar $BOT~help[18] $BOT~tab&"        {colo} - will colonize planets with avaliable fuel"
	setVar $BOT~help[19] $BOT~tab&"        {coln} - will balance colonists on planets"
	setVar $BOT~help[20] $BOT~tab&"     {upgrade} - will upgrade all planets "
	setVar $BOT~help[21] $BOT~tab&"        {port} - will create and upgrade sbb on ports"
	setVar $BOT~help[22] $BOT~tab&"    {skipfuel} - won't upgrade fuel       - for port option"
	setVar $BOT~help[23] $BOT~tab&"     {skiporg} - won't upgrade organics   - for port option "
	setVar $BOT~help[24] $BOT~tab&"   {skipequip} - won't upgrade equipment  - for port option"
	setVar $BOT~help[25] $BOT~tab&"       {build} - will create and upgrade planets and port"
	setVar $BOT~help[26] $BOT~tab&"{destroyports} - will destroy all non-class 3 ports"
	setVar $BOT~help[27] $BOT~tab&"         {one} - only pops 1 planet when none exist"
	setVar $BOT~help[28] $BOT~tab&"     {nostrip} - won't attempt to strip during build"
	setVar $BOT~help[29] $BOT~tab&"   {noupgrade} - won't attempt to upgrade during build"
	setVar $BOT~help[30] $BOT~tab&"     {defense} - set cannons"
	setVar $BOT~help[31] $BOT~tab&"      {amtrak} - uses amtrak sectors as farm sectors"
	setVar $BOT~help[32] $BOT~tab&"  {allplanets} - uses tl sectors as farm sectors"
	setVar $BOT~help[33] $BOT~tab&"     {planets} - only visits sectors with planets"
	setVar $BOT~help[34] $BOT~tab&"     {balance} - balance planets throughout bubble or farm"
	setVar $BOT~help[35] $BOT~tab&"     {movefig} - moves all fighters from planet to sector"
	setVar $BOT~help[36] $BOT~tab&"   {barricade} - moves all fighters from planets to home"
	setVar $BOT~help[37] $BOT~tab&"  {armageddon} - destroy all planets and ports (kills colos)"
	setVar $BOT~help[38] $BOT~tab&"       "
	setVar $BOT~help[39] $BOT~tab&"Data Options:"
	setVar $BOT~help[40] $BOT~tab&"         {set} plus [sector number]"
	setVar $BOT~help[41] $BOT~tab&"               - Marks sector as a FARM Sector"
	setVar $BOT~help[42] $BOT~tab&"                 "
	setVar $BOT~help[43] $BOT~tab&"       {clear} - Clears all FARM and BUBBLE sectors"
	setVar $BOT~help[44] $BOT~tab&"              "
	setVar $BOT~help[45] $BOT~tab&"   {setbubble} plus [bubble door]  "
	setVar $BOT~help[46] $BOT~tab&"               - sets all BUBBLE sectors"
	setVar $BOT~help[47] $BOT~tab&"                         "
	setVar $BOT~help[48] $BOT~tab&"        {list} - Lists all farm sectors"
	setVar $BOT~help[49] $BOT~tab&"        "
	setVar $BOT~help[50] $BOT~tab&"       {remove} plus [sector number]"
	setVar $BOT~help[51] $BOT~tab&"               - Removes FARM and BUBBLE marked sector"
	setVar $BOT~help[52] $BOT~tab&"    Examples:  "
	setVar $BOT~help[53] $BOT~tab&"              >farm neg half figs farm:bubble"
	setVar $BOT~help[54] $BOT~tab&"              >farm o e merch farm:targets"
	setVar $BOT~help[55] $BOT~tab&"              >farm o e figs warp"
	gosub :bot~helpfile



	setvar $portname "Mind ()ver Matter"
	setvar $planet~planetnamedoor "DOOR GUN"
	setvar $bot~parameter "FARM"
	setvar $name_the_planet "Mind ()ver Matter"
	setVar $j 1
	setvar $status_message "Initializing"
	setVar $version "3.0.0"
	
	setVar $BOT~script_title "M()M Farmer"
		
	if ($bot~parm1 = "off")
		setVar $SWITCHBOARD~message "Shutting down "&$BOT~script_title&".*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($bot~parm1 = "setbubble") or ($bot~parm1 = "bubbleset")
		setVar $DOOR $bot~parm2
		setSectorParameter $DOOR "DOOR" TRUE
		setSectorParameter $DOOR "BUBBLE" TRUE
		setVar $bubble_sectors " "

		setVar $i 11
		setVar $count 0
		setVar $perc 0
		while ($i <= SECTORS)
			if ($i <> $DOOR)
				getCourse $path $i 1 
				if ($path = "-1")
					send "/"
					waitOn #179
					echo ANSI_14 "Updating database...*" ANSI_7
					send "^f"&$i&"*1**q"
					waitOn "ENDINTERROG"
					getCourse $path $i 1 
				end
				setVar $j 1
				setVar $found_bubble_sector FALSE
				while ($j <= $path)
					if ($path[$j] = $DOOR)
						setVar $found_bubble_sector TRUE
					end
					add $j 1
				end
				if ($found_bubble_sector = TRUE)
						write $BUBBLE_LIST $i
						setSectorParameter $i "BUBBLE" TRUE
						setVar $bubble_sectors $bubble_sectors&" "&$i  
						add $count 1
				else
						#setSectorParameter $i "BUBBLE" ""
				end

			end
			setVar $percTest (($i * 100) / SECTORS)
			if ($percTest > $perc)
				setVar $perc (($i * 100) / SECTORS)
				echo "*"
				echo #27 "["&($perc / 2)&"C"
				echo ANSI_14 "°" ANSI_15 " " $perc "%" #27 & "[1A   "
			end
			add $i 1
		end

		send "'*"&$count&" bubble sectors with door sector of "&$DOOR&": "&$bubble_sectors&"**"
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
		setVar $get_figs TRUE
	else
		setVar $get_figs FALSE
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
		setVar $movefig TRUE
	else
		setVar $movefig FALSE
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
		setVar $get_fuel TRUE
	else
		setVar $get_fuel FALSE
	end

	getWordPos " "&$bot~user_command_line&" " $pos " o "
	if ($pos > 0)
		setVar $strip TRUE
		setVar $get_org TRUE
	else
		setVar $get_org FALSE
	end

	getWordPos " "&$bot~user_command_line&" " $pos " e "
	if ($pos > 0)
		setVar $strip TRUE
		setVar $get_equip TRUE
	else
		setVar $get_equip FALSE
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

	gosub :BOT~banner

	if (($get_figs = FALSE) and ($strip = FALSE) and ($neg = FALSE) and ($warp = FALSE) and ($port = FALSE) and ($upgrade = FALSE) and ($colo = FALSE) and ($cash = FALSE) and ($shield = FALSE) and ($build = FALSE) and ($colonize = FALSE) and ($colo = FALSE) and ($bot~parm1 <> "") and ($defense = FALSE) and ($balance = FALSE) and ($barricade = FALSE) and ($armageddon = FALSE))
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
	gosub :fillplanetstats

	gosub :setWindow

	gosub :get_tl_list
	setArray $checked SECTORS
		
:start
	killalltriggers

:inac
		setVar $bottom 1
		setVar $top 1
		setVar $que[1] $player~current_sector
:tryAgain

		setVar $focus 11
		while ($focus <= SECTORS)
			gosub :checkForFarmTarget
			if ($isFarmFound = TRUE)
				setVar $bubble_sectors $bubble_sectors&" "&$focus 
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
			gosub :checkForFarmTarget
			#########################################################
			# Found a farm target - do the farming for that sector! #
			#########################################################
			if (($isFarmFound = TRUE) and ($focus <> $player~current_sector))
				setvar $farmsector $focus
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
		goto :end
		halt



:count_planets
	send "qq*  |l"
	waitOn "Registry# and Planet Name"
	setVar $planet~planetCount 0
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
			striptext $line "."
			add $planet~planetCount 1
			getWord $line $planet~planets[$planet~planetCount] 1
		end
		setTextLineTrigger getLine2 :planetline "   <"
		setTextLineTrigger getend :done "Land on which planet "
		pause
	:done
		 killalltriggers
		 return

:get_tl_list
	setVar $sectorCount 0
	setarray $TLPlanets sectors
	killalltriggers
	setTextLineTrigger sectorGrabber :sector_planet_line "Class "
	setTextLineTrigger sectorbeDone :sector_done "======   ============"
	setVar $tl_planets " "
	if ($personal = TRUE)
		send "cyq"
	else
		send "xlq"
	end
	pause
	:sector_planet_line
		killalltriggers
		getWord CURRENTLINE $testsector 1
		setvar $TLPlanetCount $TLPlanets[$testsector]
		setvar $TLPlanets[$testsector] ($TLPlanetCount + 1)
		setVar $tl_planets $tl_planets&" "&$testsector
		setTextLineTrigger getLine2 :sector_planet_line "Class"
		setTextLineTrigger getEnd :sector_done "======   ============"
		pause
	:sector_done
	send "@"
	waitOn "Average Interval Lag:"

return


:checkForFarmTarget
	setvar $isFarmTarget false
	setvar $isFarmFound false
	getSectorParameter $focus $bot~parameter $isFarmTarget
	if ($where_planets = true)
		if ($TLPlanets[$focus] <= 0)
			goto :not_farm_sector
		end
	end
	#########################################################################
	# If farm target is true, we need to check if other options are as well #
	#########################################################################
	if ($isFarmTarget = true)
		if ($balance)
			if ($TLPlanets[$focus] > $game~MAX_PLANETS_PER_SECTOR)
				setvar $isFarmFound true
			end
		else
			if ($amtrak)
				getSectorParameter $focus "AMTRAK" $BUBBLE
			elseif ($allplanets)
				getWordPos $tl_planets $pos " "&$focus&" "
				if ($pos > 0)
					setVar $isFarmFound TRUE
				end
			else
				setvar $isFarmFound true
			end
		end
	end
	:not_farm_sector

return

:stripallplanets
	setVar $j 1
	send "qq* "
	if ((($upgrade = true) OR ($build = true)) AND ($noupgrade = FALSE))
		 if ($planet~planetCount > 1)
			send "l " & #8 & $planet~planetToFill & "*"
			gosub :PLANET~getPlanetInfo
			gosub :fillplanetstats
			send " c " 
			gosub :upgrade_planets
			send "q"
			gosub :PLANET~getPlanetInfo
			gosub :fillplanetstats
			send "q* "
		end
	end
	while ($j <= $planet~planetCount)
		if ($planet~planetToFill <> $planet~planets[$j])
						send "l " & #8 & $planet~planets[$j] & "* "
						gosub :PLANET~getPlanetInfo
						gosub :setwindow
						setVar $planet~planet_CLASS $planet~planet_CLASS_NAME
						lowercase $planet~planet_CLASS

						if ($armageddon = TRUE)
							setVar $BOT~user_command_line "s silent"
							saveVar $BOT~user_command_line
							setEventTrigger		1		:movefigarmended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
							load "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
							pause
							:movefigarmended	                    

							gosub :PLAYER~quikstats
							if ($PLAYER~CURRENT_PROMPT = "Citadel")
								send "q "
							end
							

							:blow_it_again
								if ($PLAYER~ATOMIC < 1)
									gosub :get_dets
									send "l " & #8 & $planet~planets[$j] & "*"
								end
								killtrigger 1
								killtrigger 2
								send "zay"&$PLAYER~FIGHTERS&"**dy"
								send "  z  d  y  "
								setTextLineTrigger 1	:no_deteonators "You do not have any Atomic Detonators!"
								setTextTrigger 2		:pop "Command [TL="
								pause

							:no_deteonators
								killTrigger 2
								setVar $SWITCHBOARD~message "Out Of Atomic Dets*"
								gosub :SWITCHBOARD~switchboard
								gosub :get_dets
								goto :blow_it_again

							:pop
								killtrigger 1
								killtrigger 2


							goto :doneWithThisPlanet
							

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
							if (($planet~planet_FUEL_COLONISTS < ($planet~planet_FUEL_COLONISTS_MAX-1000)) OR ($planet~planet_ORGANICS_COLONISTS < ($planet~planet_ORGANICS_COLONISTS_MAX-1000)) OR ($planet~planet_EQUIPMENT_COLONISTS < ($planet~planet_EQUIPMENT_COLONISTS_MAX-1000)))
								gosub :colonize
							end
							send "l " & #8 & $planet~planets[$j] & "* "
							gosub :PLANET~getPlanetInfo
							lowercase $planet~planet_CLASS
						end
						if ($defense = true)
							if ($planet~CITADEL >= 3)
								send "cls0*la100*q "                        	
							end
						end
						if ($barricade = TRUE)
							if (($planet~planet_FUEL > 10000) AND ($planet~CITADEL >= 4))
								send "c  "
								setVar $player~warpto $home
								gosub :pwarp
								send "q  "
								if ($success = TRUE)
									setVar $movefig TRUE
								else
									setVar $movefig FALSE
								end
							else
								setVar $movefig FALSE
							end
						end
						if ($movefig = TRUE)
							setVar $BOT~user_command_line "s silent"
							saveVar $BOT~user_command_line
							setEventTrigger		movefigended		:movefigended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
							load "scripts\"&$bot~mombot_directory&"\modes\resource\movefig.cts"
							pause
							:movefigended	                    
						end
						if ($barricade = TRUE)
							gosub :PLAYER~quikstats
							if (($PLAYER~CURRENT_SECTOR = $home) AND ($PLAYER~CURRENT_PROMPT = "Citadel"))
								setVar $player~warpto $farmSector
								gosub :pwarp
								send "q  "
							end
						end

						#AUTOMATICALLY ADJUST COLOS
						if ($planet~planet_FUEL_COLONISTS > $planet~planet_FUEL_COLONISTS_MAX)
							setVar $extra_colos ($planet~planet_FUEL_COLONISTS-$planet~planet_FUEL_COLONISTS_MAX)
							if ($planet~planet_ORGANICS_COLONISTS < $planet~planet_ORGANICS_COLONISTS_MAX)
								setVar $colos_needed ($planet~planet_ORGANICS_COLONISTS_MAX-$planet~planet_ORGANICS_COLONISTS)
								if ($colos_needed >= $extra_colos)
									setVar $colos_to_move $extra_colos
								else
									setVar $colos_to_move $colos_needed
								end
								setVar $extra_colos ($extra_colos - $colos_to_move)
								setVar $planet~planet_ORGANICS_COLONISTS ($planet~planet_ORGANICS_COLONISTS+$colos_to_move)
								setVar $planet~planet_FUEL_COLONISTS ($planet~planet_FUEL_COLONISTS-$colos_to_move)
								if ($colos_to_move > 0)
									send "p*1"&$colos_to_move&"*2"
									gosub :waiton
								end
							end
							if ($planet~planet_EQUIPMENT_COLONISTS < $planet~planet_EQUIPMENT_COLONISTS_MAX)
								setVar $colos_needed ($planet~planet_EQUIPMENT_COLONISTS_MAX-$planet~planet_EQUIPMENT_COLONISTS)
								if ($colos_needed >= $extra_colos)
									setVar $colos_to_move $extra_colos
								else
									setVar $colos_to_move $colos_needed
								end
								setVar $extra_colos ($extra_colos - $colos_to_move)
								setVar $planet~planet_EQUIPMENT_COLONISTS ($planet~planet_EQUIPMENT_COLONISTS+$colos_to_move)
								setVar $planet~planet_FUEL_COLONISTS ($planet~planet_FUEL_COLONISTS-$colos_to_move)
								if ($colos_to_move > 0)
									send "p*1"&$colos_to_move&"*3"
									gosub :waiton
								end
							end
						end
						if ($planet~planet_ORGANICS_COLONISTS > $planet~planet_ORGANICS_COLONISTS_MAX)
							setVar $extra_colos ($planet~planet_ORGANICS_COLONISTS-$planet~planet_ORGANICS_COLONISTS_MAX)
							if ($planet~planet_FUEL_COLONISTS < $planet~planet_FUEL_COLONISTS_MAX)
								setVar $colos_needed ($planet~planet_FUEL_COLONISTS_MAX-$planet~planet_FUEL_COLONISTS)
								if ($colos_needed >= $extra_colos)
									setVar $colos_to_move $extra_colos
								else
									setVar $colos_to_move $colos_needed
								end
								setVar $extra_colos ($extra_colos - $colos_to_move)
								setVar $planet~planet_FUEL_COLONISTS ($planet~planet_FUEL_COLONISTS+$colos_to_move)
								setVar $planet~planet_ORGANICS_COLONISTS ($planet~planet_ORGANICS_COLONISTS-$colos_to_move)
								if ($colos_to_move > 0)
									send "p*2"&$colos_to_move&"*1"
									gosub :waiton
								end
							end
							if ($planet~planet_EQUIPMENT_COLONISTS < $planet~planet_EQUIPMENT_COLONISTS_MAX)
								setVar $colos_needed ($planet~planet_EQUIPMENT_COLONISTS_MAX-$planet~planet_EQUIPMENT_COLONISTS)
								if ($colos_needed >= $extra_colos)
									setVar $colos_to_move $extra_colos
								else
									setVar $colos_to_move $colos_needed
								end
								setVar $extra_colos ($extra_colos - $colos_to_move)
								setVar $planet~planet_EQUIPMENT_COLONISTS ($planet~planet_EQUIPMENT_COLONISTS+$colos_to_move)
								setVar $planet~planet_ORGANICS_COLONISTS ($planet~planet_ORGANICS_COLONISTS-$colos_to_move)
								if ($colos_to_move > 0)
									send "p*2"&$colos_to_move&"*3"
									gosub :waiton
								end
							end
						end
						if ($planet~planet_EQUIPMENT_COLONISTS > $planet~planet_EQUIPMENT_COLONISTS_MAX)
							setVar $extra_colos ($planet~planet_EQUIPMENT_COLONISTS-$planet~planet_EQUIPMENT_COLONISTS_MAX)
							if ($planet~planet_ORGANICS_COLONISTS < $planet~planet_ORGANICS_COLONISTS_MAX)
								setVar $colos_needed ($planet~planet_ORGANICS_COLONISTS_MAX-$planet~planet_ORGANICS_COLONISTS)
								if ($colos_needed >= $extra_colos)
									setVar $colos_to_move $extra_colos
								else
									setVar $colos_to_move $colos_needed
								end
								setVar $extra_colos ($extra_colos - $colos_to_move)
								setVar $planet~planet_ORGANICS_COLONISTS ($planet~planet_ORGANICS_COLONISTS+$colos_to_move)
								setVar $planet~planet_EQUIPMENT_COLONISTS ($planet~planet_EQUIPMENT_COLONISTS-$colos_to_move)
								if ($colos_to_move > 0)
									send "p*3"&$colos_to_move&"*2"
									gosub :waiton
								end
							end
							if ($planet~planet_FUEL_COLONISTS < $planet~planet_FUEL_COLONISTS_MAX)
								setVar $colos_needed ($planet~planet_FUEL_COLONISTS_MAX-$planet~planet_FUEL_COLONISTS)
								if ($colos_needed >= $extra_colos)
									setVar $colos_to_move $extra_colos
								else
									setVar $colos_to_move $colos_needed
								end
								setVar $extra_colos ($extra_colos - $colos_to_move)
								setVar $planet~planet_FUEL_COLONISTS ($planet~planet_FUEL_COLONISTS+$colos_to_move)
								setVar $planet~planet_EQUIPMENT_COLONISTS ($planet~planet_EQUIPMENT_COLONISTS-$colos_to_move)
								if ($colos_to_move > 0)
									send "p*3"&$colos_to_move&"*1"
									gosub :waiton
								end
							end
						end

						send "qq* l " & #8 & $planet~planets[$j] & "*"
						gosub :setWindow
						gosub :PLANET~getPlanetInfo
						if ($planet~CITADEL > 0)
							send "c "
						end
						if (($planet~CITADEL_CREDITS > 0) and ($cash = true))
							while ($planet~CITADEL_CREDITS > 0)
								if ($planet~CITADEL_CREDITS > 999999999) or (($planet~CITADEL_CREDITS +  $PLAYER~CREDITS) > 999999999)
									setVar $amount_of_cash_to_transfer (999999999 - $PLAYER~CREDITS)
								else
									setVar $amount_of_cash_to_transfer ($planet~CITADEL_CREDITS)
								end
								setvar $planet~CITADEL_CREDITS ($planet~CITADEL_CREDITS - $amount_of_cash_to_transfer)
								send "t f " & $amount_of_cash_to_transfer & "* qq* l " & #8 & $planet~planetToFill & "* c t t " & $amount_of_cash_to_transfer & "* qq* l " & #8 & $planet~planets[$j] & "* c "
							end
							send "qq* "
						end
						if (($shield = true) and ($planet~CITADEL > 4) and ($planet~planet_SHIELD_POWER < 200))
							if ($PLAYER~SHIELDS < 2000)
									send "qq* l " & #8 & $planet~planetToFill & "*"
									gosub :PLANET~getPlanetInfo
									gosub :fillplanetstats
									if ($planet~SHIELD_POWER < 200)
										  setVar $shield FALSE
										  send "qq* "
									else
										  send "cgf200*qq* "
									end
							else
								   send "qq* l " & #8 & $planet~planets[$j] & "* c gt200*"
							end
						end
						if (($warp = TRUE) and ($planet~CITADEL > 3) and ($planet~planet_FUEL > 10000) and (($planet~planet_ORGANICS > 50000) or ($planet~planet_EQUIPMENT > 50000)))
							gosub :land_on_farm_planet
							gosub :merch
							send "d"
							waitOn "Citadel treasury contains "
							getWord CURRENTLINE $planet~CITADELCash 4
							stripText $planet~CITADELCash ","
							stripText $planet~CITADELCash "."
							if ($planet~CITADELCash > 0)
								if ($planet~CITADELCash > 999999999) or (($planet~CITADELCash +  $PLAYER~CREDITS) > 999999999)
									setVar $planet~CITADELCash (999999999 - $PLAYER~CREDITS)
								else
									setVar $planet~CITADELCash ($planet~CITADELCash + $PLAYER~CREDITS)
								end
								send "t f " & $planet~CITADELCash & "* qq* l " & #8 & $planet~planetToFill & "* c t t " & $planet~CITADELCash & "* "
							end
						end
						if ($neg = true)
							gosub :land_on_farm_planet
							gosub :neg
						end

						send "qq* * "

						if ($strip = true)
							send " qq* l " & #8 & $planet~planetToFill & "*"
							setVar $options ""
							if ($get_fuel)
								setVar $options $options&" f "
							end
							if ($get_org)
								setVar $options $options&" o "
							end
							if ($get_equip)
								setVar $options $options&" e "
							end
							if ($get_figs)
								setVar $options $options&" fig "
							end
							setvar $status_message "Stripping planet product ("&$options&")"
							gosub :setWindow
							killalltriggers
							setVar $BOT~command "mover"
							setVar $BOT~user_command_line "strip "&$planet~planets[$j]&" "&$options&" silent turbo*"
							setVar $BOT~parm1 "strip"
							saveVar $BOT~parm1
							setVar $BOT~parm2 $planet~planets[$j]
							saveVar $BOT~parm2
							saveVar $BOT~command
							saveVar $BOT~user_command_line
							load "scripts\"&$bot~mombot_directory&"\modes\resource\mover.cts"
							setEventTrigger		stripended		:stripended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\mover.cts"
							pause
							:stripended
							send "q "
							gosub :planet~getplanetinfo
							gosub :fillplanetstats
							send "q * "
						end
						:try_colo
						if ($colo = true)
							send "qq* jy* l " & #8 & $planet~planetToFill & "*  "
							gosub :planet~getplanetinfo
							gosub :fillplanetstats

							setVar $cyclebuffer 0
							setVar $cyclebufferlimit 20
							send "qq* jy* l " & #8 & $planet~planets[$j] & "*  "
							gosub :planet~getplanetinfo

							#remove fuel colos
							setVar $COLOS $planet~planet_FUEL_COLONISTS
							setVar $COLOS_MAX $planet~planet_FUEL_COLONISTS_MAX
							setvar $status_message "Stripping Fuel Colonists"
							setVar $moveColo "fuel"
							setVar $type 1
							gosub :remove_colos

							#add fuel colos
							setVar $COLOS $planet~planet_FUEL_COLONISTS
							setVar $COLOS_MIN $planet~planet_FUEL_COLONISTS_MIN
							setVar $type 1
							setVar $moveColo "fuel"
							setvar $status_message "Adding Fuel Colonists"
							gosub :add_colos

							#remove org colos
							setVar $COLOS $planet~planet_ORGANICS_COLONISTS
							setVar $COLOS_MAX $planet~planet_ORGANICS_COLONISTS_MAX
							setvar $status_message "Stripping Organics Colonists"
							setVar $moveColo "org"
							setVar $type 2
							gosub :remove_colos

							#add org colos
							setVar $COLOS $planet~planet_ORGANICS_COLONISTS
							setVar $COLOS_MIN $planet~planet_ORGANICS_COLONISTS_MIN
							setVar $type 2
							setVar $moveColo "org"
							setvar $status_message "Adding Organics Colonists"
							gosub :add_colos

							#remove equip colos
							setVar $COLOS $planet~planet_EQUIPMENT_COLONISTS
							setVar $COLOS_MAX $planet~planet_EQUIPMENT_COLONISTS_MAX
							setvar $status_message "Stripping Equip Colonists"
							setVar $moveColo "equip"
							setVar $type 3
							gosub :remove_colos

							#add equip colos
							setVar $COLOS $planet~planet_EQUIPMENT_COLONISTS
							setVar $COLOS_MIN $planet~planet_EQUIPMENT_COLONISTS_MIN
							setVar $type 3
							setVar $moveColo "equip"
							setvar $status_message "Adding Equip Colonists"
							gosub :add_colos
						end

					send "q* jy* "
					:doneWithThisPlanet
						killAllTriggers
		end
				add $j 1
	end
	gosub :land_on_farm_planet
RETURN

:land_on_farm_planet
	if ($planet~CITADEL > 0)
		send "qq* l " & #8 & $planet~planets[$j] & "* c "
	else
		send "qq* l " & #8 & $planet~planets[$j] & "*"							
	end
return

:upgrade_planets
	setvar $status_message "Upgrading Planet(s)"
	gosub :setWindow
	killalltriggers
	setVar $BOT~command "massupgrade"
	setVar $BOT~user_command_line "massupgrade silent *"
	setVar $BOT~parm1 ""
	saveVar $BOT~parm1
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\"&$bot~mombot_directory&"\modes\resource\massupgrade.cts"
	setEventTrigger		upgradeended		:upgradeended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\massupgrade.cts"
	pause
	:upgradeended
return

:buildplanets
	killalltriggers
	setTextLineTrigger port_blown1 :buildplanetsend "<=-DANGER-=>  Scanners indicate massive debris and heavy"
	setTextLineTrigger port_here1 :buildnext "Class"
	setTextLineTrigger needs_port1 :buildnext "Warps to Sector(s)"
	send "qqzn*"
	pause

:buildnext
	killalltriggers
	setVar $doneWithPlanets FALSE
	setVar $tempPlanetCount ($planet~planetCount)
	loadVar $GAME~MAX_PLANETS_PER_SECTOR
	setVar $planet~planetsPerSector2 $GAME~MAX_PLANETS_PER_SECTOR
	subtract $tempPlanetCount 1
	send "qqzn * l " & #8 & $planet~planetToFill & "*mnt* qq* "
	setvar $planet~planetsPerSector2 ($planet~planetsPerSector2 - $tempPlanetCount)
	if (($tempPlanetCount > 0) AND ($one_per_sector = TRUE))
		setvar $status_message "Already a planet in this sector."
		gosub :setWindow
		goto :buildplanetsend
	end
	if ($planet~planetsPerSector2 <= 0)
		goto :buildplanetsend
	end
	setvar $status_message "Building planets in sector "&$PLAYER~CURRENT_SECTOR&"*    (Needs "&$planet~planetsPerSector2&" planet(s))"
	gosub :setWindow

:LetsGoAgain
	gosub :PLAYER~quikstats
	if (($PLAYER~ATOMIC < 1) OR ($PLAYER~GENESIS < 1))
			gosub :get_dets
	end
	send "u y"
	setTextLineTrigger NoOverLoad	:NoOverload "What do you want to name this planet?"
	setTextLineTrigger Yikes		:Yikes      "I'm sorry, but not enough free matter exists."
	setTExtLineTrigger NeedGenTs	:NeedGenTs  "You don't have any Genesis Torpedoes to launch!"
	setTextTrigger     OverLoad 	:Overload   "Do you wish to abort?"
	pause

:NeedGenTs
	killAllTriggers
	send " Q "
	setVar $SWITCHBOARD~message "Cannot pop a planet - out of genesis torpedoes.*"
	gosub :SWITCHBOARD~switchboard
	goto :buildplanetsend

:Yikes
	killAllTriggers
	setVar $SWITCHBOARD~message "Bad news - game maximum planets reached.*"
	gosub :SWITCHBOARD~switchboard
	goto :buildplanetsend

:Overload
	killTrigger Overload
	send "n"
	pause

:NoOverload
	killAllTriggers
	getWord CURRENTLINE $planet~planet_type 11
	lowercase $planet~planet_type
	striptext $planet~planet_type ")"
	#echo $planet~planet_type&"*"

	setVar $i 1
	setVar $foundPlanet FALSE
	setVar $isAKeeper FALSE
	while (($i <= $planet~planetcounter) AND ($foundPlanet = FALSE))
		lowercase $planet~planetList[$i]
		lowercase $planet~planet_type
		getWordPos $planet~planetList[$i] $pos $planet~planet_type
		if ($pos > 0)
			setVar $isAKeeper $planet~planetList[$i][7]
			setVar $foundPlanet TRUE
		end
		add $i 1
	end
	if ($isAKeeper = TRUE)
		getRnd $planet~planet_pointer 1 1000
		setVar $first_part $planet~planet_names[$planet~planet_pointer]
		getWord $first_part $first_half 1
		getRnd $planet~planet_pointer 1 1000
		setVar $second_part $planet~planet_names[$planet~planet_pointer]
		getRnd $flip_a_coin 1 2
		getWord $second_part $last_half $flip_a_coin
		if (($last_half = "")  OR ($last_half = "0"))
			getWord $second_part $last_half 1
		end
		setVar $planet~planetLabel $first_half&" "&$last_half
		setVar $name_the_planet $planet~planetLabel

	else
		getRnd $PTag 100000 999999
		setVar $planet~planetLabel "["&$PTag&"]"&"M()M Planet Farm "&"["&$PTag&"]"
	end
	send $planet~planetLabel & "*"

#=------------------------ Planet's Been Popped ---------------------------------------
	killtrigger makingitcorp
	killtrigger letsgo
	setTextTrigger MakingItCorp     :MakingItCorp "Should this be a (C)orporate planet or (P)ersonal planet? "
	setTextTrigger LetsGo		:LetsGo       "Command [TL="
	pause

:MakingItCorp
	send "c"
	pause

:LetsGo
	killtrigger makingitcorp
	if ($planet~planetLabel <> $name_the_planet)
		send "|l|"
		setTextLineTrigger Plisted		:Plisted "-----------------------------------------------"
		setTextTrigger Landed			:Landed "Planet command (?="
		pause

		:Plisted
				waitfor "> " & $planet~planetLabel
				getText CURRENTLINE $landing "<" ">"
				striptext $landing " "
				send $planet~planetToFill & "*"
				pause



		:Landed
		killtrigger plisted
		if ($nostrip = FALSE)
			# add in code to strip the plant if there is product
				setVar $BOT~command "mover"
				setVar $BOT~user_command_line "strip "&$landing&" f o e turbo silent"
				setVar $BOT~parm1 "strip"
				saveVar $BOT~parm1
				setVar $BOT~parm2 $landing
				saveVar $BOT~parm2
				saveVar $BOT~command
				saveVar $BOT~user_command_line
				load "scripts\"&$bot~mombot_directory&"\modes\resource\mover.cts"
				setEventTrigger		stripended		:stripendedbuild "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\mover.cts"
				pause
				:stripendedbuild
		end
				:blow_planet_dud
				killAllTriggers
				send "qq*l"&$landing&"*"
				waitOn "Planet command (?="
				send "  z  d  y  "
				setTextLineTrigger NoDets	:NoDets "You do not have any Atomic Detonators!"
				setTextTrigger KaBoom		:KaBoom "Command [TL="
				pause

		:NoDets
				killTrigger kaboom
				setVar $SWITCHBOARD~message "Out Of Atomic Dets*"
				gosub :SWITCHBOARD~switchboard
				gosub :get_dets
				goto :blow_planet_dud

		:KaBoom
				killtrigger nodets
				goto :LetsGoAgain
	else
		killAllTriggers
		subtract $planet~planetsPerSector2 1
		if (($planet~planetsPerSector2 <= 0) OR ($one_per_sector = TRUE))
			 goto :buildplanetsend
		else
			goto :LetsGoAgain
		end
	end

:buildplanetsend
	killalltriggers
	return

:end
	killalltriggers
	if ($merch)
		gosub :merch
	end
	send "p " & $home & "  *ys* "
	setVar $SWITCHBOARD~message "Farming run is complete.*"
	gosub :SWITCHBOARD~switchboard
	gosub :PLAYER~quikstats
	if ($PLAYER~CURRENT_SECTOR <> $home)
		setVar $SWITCHBOARD~message "Could not make it back to starting sector!*"
	end
	halt

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
		





:check_ports
	killalltriggers
	send "q  q  q  z  n  *"
	setTextLineTrigger port_blown :port_blown "<=-DANGER-=>  Scanners indicate massive debris and heavy"
	setTextLineTrigger port_here :port_here "Class"
	setTextLineTrigger needs_port :build_port "Warps to Sector(s)"
	pause

	:port_here
		killalltriggers
		setTextLineTrigger port_building :port_blown "(Under Construction - "
		waitOn "Warps to Sector(s)"
		killalltriggers

		if ((PORT.CLASS[$PLAYER~CURRENT_SECTOR] <> 3) AND ($destroyports = TRUE))
			send "l  " & #8 & #8 & $planet~planet & "*  m n t *  c  "
			waitfor "Citadel command"
			gosub :PLAYER~quikstats
			if ($PLAYER~FIGHTERS < $SHIP~SHIP_MAX_ATTACK)
				setVar $SWITCHBOARD~message "Not Enough Fighters to Blow Port.*"
				gosub :SWITCHBOARD~switchboard
			end
		elseif ($port)
			if (PORT.BUILDTIME[$PLAYER~CURRENT_SECTOR] > 0)
				goto :under_construction
			end
			send "q  q  q  z  n  * o 1"
			waitfor "to quit)"
			getTExt CURRENTLINE $BUY "? (" "max"
			striptext $buy " "
			striptext $buy ","
			striptext $buy "."
			if ((PORT.BUYFUEL[$player~current_sector] = FALSE) AND ($skipfuel <> TRUE))
				send $buy & "* *  "
			else
				send "0* *  "
			end
			waitfor "Command"
			send "o 2"
			waitfor "to quit)"
			getTExt CURRENTLINE $BUY "? (" "max"
			striptext $buy " "
			striptext $buy ","
			striptext $buy "."
			if ((PORT.BUYORG[$player~current_sector] = TRUE) AND ($skiporg <> TRUE))
				send $buy & "* *  "
			else
				send "0* * "
			end
			waitfor "Command"
			send "o 3"
			waitfor "to quit)"
			getTExt CURRENTLINE $BUY "? (" "max"
			striptext $buy " "
			striptext $buy ","
			striptext $buy "."
			if ((PORT.BUYEQUIP[$player~current_sector] = TRUE) AND ($skipequip <> TRUE))
				send $buy & "* * l "&$planet~planet&"* c "
			else
				send "0* * l "&$planet~planet&"* c "
			end
			send "s"
			waitfor "Citadel command (?=h"
		end
		goto  :end_check_ports

:build_port
		killalltriggers
		send "l " & #8 & $planet~planetToFill & "*  m n t *  c "
		waitfor "Citadel command (?"
		if ($PLAYER~CREDITS < 50000)
				send "T F 50000*"
				gosub :PLAYER~quikstats
				if ($PLAYER~CREDITS < 50000)
						setVar $SWITCHBOARD~message "Not Enough Credits to Make Ports*"
						send "qq* l " & #8 & $planet~planet & "*  c  *"
				end
		end
		send "q q q z n * o3y" $portname "* l " & #8 & $planet~planet & "*  c  *"
		goto :end_check_ports

:port_blown
		killalltriggers
		send "qq* l " & #8 & $planet~planet & "*  c  *"
		goto :end_check_ports

:under_construction
		killalltriggers
		setVar $SWITCHBOARD~message "Port at " & $PLAYER~CURRENT_SECTOR & " is Under Construction. " & PORT.BUILDTIME[$PLAYER~CURRENT_SECTOR] & " More Days*"
		gosub :SWITCHBOARD~switchboard
		send "l " & #8 & $planet~planet & "*  m n t *  c "
		goto :end_check_ports

:end_check_ports
		killalltriggers
		return

:get_dets
	setVar $JUMP 0
	if (STARDOCK = 0)
		setVar $SWITCHBOARD~message "Stardock Not Known To TWX.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	send "qq* jy* l " & $planet~planetToFill & "* tnt1*mnt*c"
	waitFor "Citadel command ("
	setVar $player~creditsNeeded (($SHIP~SHIP_GENESIS_MAX*$GAME~GENESIS_COST)+($SHIP~SHIP_GENESIS_MAX*$GAME~ATOMIC_COST))
	if ($PLAYER~CREDITS < $player~creditsNeeded)
		setVar $withdraw ($player~creditsNeeded-$PLAYER~CREDITS)
		send "T F "&$withdraw&"*"
		gosub :PLAYER~quikstats
		if ($PLAYER~CREDITS < $player~creditsNeeded)
				setVar $SWITCHBOARD~message "Not Enough Credits to Make Ports*"
				gosub :SWITCHBOARD~switchboard
				send "qq* l " & #8 & $planet~planet & "*  c  *"
				goto :end
		end
	end
	send "qq*"
	WAITFOR "Command [TL="

	send " C R " & STARDOCK & "*Q "
	setTextLineTrigger itsalive	:itsalive	"Items     Status  Trading % of max OnBoard"
	setTextLineTrigger nosoupforme	:nosoupforme	"I have no information about a port in that sector"
	pause

	:nosoupforme
		killAllTriggers
		setVar $SWITCHBOARD~message "StarDock appears to have been Blown Up!*"
		gosub :SWITCHBOARD~switchboard
		halt

	:itsalive
	killAllTriggers
	gosub :PLAYER~quikstats
	if (($PLAYER~ALIGNMENT < 1000) AND ($player~ore_holds > 0))
		setVar $adj 1
		while (SECTOR.WARPSIN[STARDOCK][$adj] <> 0)
			setVar $JUMP SECTOR.WARPSIN[STARDOCK][$adj]
			if ($JUMP <> $PLAYER~CURRENT_SECTOR)
				send "M Z " & $JUMP & "*Y"
				setTextLineTrigger	TwarpVoided		:Next_Jump_Point1	"You have marked sector "&$JUMP&" to be avoided!"
				setTextLineTrigger	TwarpBlind 		:Next_Jump_Point2	"No locating beam found"
				setTextLineTrigger	TwarpLocked		:TwarpLocked		"Locating beam pinpointed, TransWarp"
				setTextLineTrigger	TwarpNoGas		:Next_Jump_Point2	"You do not have enough Fuel Ore to make the jump"
				setTextLineTrigger	TwarpNoGas2		:Next_Jump_Point2	"You do not have enough Fuel Ore to make the jump"
				setTextLineTrigger  TwarpNextDoor   :Next_Jump_Point2   "<Set NavPoint>"
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
	if ($PLAYER~ALIGNMENT < 1000)
		setVar $SWITCHBOARD~message "Something is wrong and twarp can't be verified.  Halting.*"
		gosub :SWITCHBOARD~switchboard
		halt
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

	if (($PLAYER~TWARP_TYPE = "No") OR ($player~ore_holds < $ORE_REQ) OR (($PLAYER~ALIGNMENT < 1000) AND ($JUMP = 0)))
		if ($JUMP <> 0)
			send "  N  "
		end
	else
		SetVar $MOW FALSE
	end

	if ($MOW)
	else
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
	stripText $BUY "."
	send $BUY & "* T "
	waitfor "How many Genesis Torpedoes do you want"
	getText CURRENTLINE $BUY "(Max" ") ["
	stripText $BUY " "
	stripText $BUY ","
	stripText $BUY "."
	send $BUY & "* Q S P C "
	waitfor "How many shield armor points do you want to buy"
	getText CURRENTLINE $BUY "(Max" ") ["
	stripText $BUY " "
	stripText $BUY ","
	stripText $BUY "."
	send $BUY & "* "

	if ($MOW)
	else
		send ("Q Q Q  " & $PLAYER~CURRENT_SECTOR & "*Y")
		setTextLineTrigger	TwarpVoided		:TwarpBad1			"You have marked sector "&$PLAYER~CURRENT_SECTOR&" to be avoided!"
		setTextLineTrigger	TwarpBlind 		:TwarpBad2			"No locating beam found"
		setTextLineTrigger	TwarpLocked		:TwarpGood			"Locating beam pinpointed, TransWarp"
		SetTextLineTrigger	TwarpNoGas		:TwarpBad2			"You do not have enough Fuel Ore to make the jump"
		setTextLineTrigger  TwarpNextDoor   :TwarpGood   		"<Set NavPoint>"
		pause
		:TwarpBad1
			killAllTriggers
			send "  NN   "
		:TwarpBad2
			killAllTriggers
			send " *  P S G Y G Q "
			waitfor "You leave the Galactic Bank."
			setVar $SWITCHBOARD~message "Return Trip Failed.*"
			gosub :SWITCHBOARD~switchboard
			halt
		:TwarpGood
			killAllTriggers
			send "  Y  *   J  Y  "
	end
	waitfor "Are you sure you want to jettison all cargo"
	waitfor "Command [TL"
	getText CURRENTLINE $WhereRwe "]:[" "] (?"
	stripText $WhereRwe " "
	if ($WhereRwe <> $PLAYER~CURRENT_SECTOR)
		setVar $SWITCHBOARD~message "Return Trip Failed.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	return



:remove_colos
	setVar $cyclebuffer 0
	while ($COLOS > $COLOS_MAX)
		killtrigger no_room
		killtrigger is_room
		if ($COLOS < $player~total_holds)
			setVar $holds_to_grab $COLOS
		else
			setVar $holds_to_grab $player~total_holds
		end
		add $cyclebuffer 1
		if ($cyclebuffer >= $cyclebufferlimit)
			setVar $cyclebuffer 1
			gosub :PLAYER~quikstats
			send "qq* l " & #8 & $planet~planets[$j] & "*  s * t "&$type&$holds_to_grab&"*  q l " & #8 & $planet~planetToFill & "*  s*l1*"
			setTextTrigger no_room :no_room1 "on the planet"
			setTextTrigger is_room :is_room1 "The Colonists disembark to begin their new life."
			pause

			:no_room1
				   killtrigger no_room
				   killtrigger is_room
				   killtrigger nocolos
				   setVar $moveColo "org"
				   send "snl2*"
				   setTextTrigger no_room :no_room2 "on the planet"
				   setTextTrigger is_room :is_room1 "The Colonists disembark to begin their new life."
				   settexttrigger nocolos :no_room3 "How many groups of Colonists do you want to leave ([0] on board)"
				   pause

			:no_room2
				   killtrigger no_room
				   killtrigger is_room
				   killtrigger nocolos
				   setVar $moveColo "equip"
				   send "snl3*"
				   setTextTrigger no_room :no_room3 "on the planet"
				   setTextTrigger is_room :is_room1 "The Colonists disembark to begin their new life."
				   settexttrigger nocolos :no_room3 "How many groups of Colonists do you want to leave ([0] on board)"
				   pause

			:no_room3
					setVar $moveColo "NO ROOM - EMPTY FULL PLANET"

			:is_room1
				killtrigger no_room
				killtrigger is_room

		else
			send "qq* l " & #8 & $planet~planets[$j] & "*  s * t "&$type&$holds_to_grab&"*  q l " & #8 & $planet~planetToFill & "*  s*l1*  s*l2*  s*l3*  "
		end
		subtract $COLOS $player~total_holds
		if ($moveColo = "fuel")
			if (($planet~planet_fuel_colonists - $player~total_holds) > 0)
				subtract $planet~planet_FUEL_COLONISTS $player~total_holds
				add $planet~planetToFillFuelColonists $player~total_holds
			end
		elseif ($moveColo = "org")
			if (($planet~planet_organics_colonists - $player~total_holds) > 0)
				subtract $planet~planet_ORGANICS_COLONISTS $player~total_holds
				add $planet~planetToFillOrganicsColonists $player~total_holds
			end
		elseif ($moveColo = "equip")
			if (($planet~planet_equipment_colonists - $player~total_holds) > 0)
				subtract $planet~planet_EQUIPMENT_COLONISTS $player~total_holds
				add $planet~planetToFillEquipmentColonists $player~total_holds
			end
		end
		gosub :setWindow
	end
return
	

:add_colos

	setVar $cyclebuffer 0
	while (($COLOS < $COLOS_MIN) and (($planet~planetToFillFuelColonists >= $player~total_holds) or ($planet~planetToFillOrganicsColonists >= $player~total_holds) or ($planet~planetToFillEquipmentColonists >= $player~total_holds)))
		killtrigger grab_colos
		killtrigger no_colos
		add $cyclebuffer 1
		if ($cyclebuffer >= $cyclebufferlimit)
			setVar $cyclebuffer 1
			gosub :PLAYER~quikstats
			send "q q* l " & #8 & $planet~planetToFill & "*  snt1*"
			killtrigger grab_colos
			killtrigger no_colos
			setTextTrigger grab_colos :grab_colos_fuel "The Colonists file aboard your ship, eager to head out."
			setTextTrigger no_colos   :no_colos_fuel1  "There aren't that many on the planet!"
			pause

			:no_colos_fuel1
				killtrigger grab_colos
				killtrigger no_colos
				setVar $moveColo "org"
				send "snt2*"
				setTextTrigger grab_colos :grab_colos_fuel "The Colonists file aboard your ship, eager to head out."
				setTextTrigger no_colos   :no_colos_fuel2   "There aren't that many on the planet!"
				pause

			:no_colos_fuel2
				killtrigger grab_colos
				killtrigger no_colos
				setVar $moveColo "equip"
				send "snt3*"
				setTextTrigger grab_colos :grab_colos_fuel "The Colonists file aboard your ship, eager to head out."
				setTextTrigger no_colos   :no_colos_fuel3   "There aren't that many on the planet!"
				pause

			:grab_colos_fuel
				killtrigger grab_colos
				killtrigger no_colos
				send "q q* l " & #8 & $planet~planets[$j] & "*  snl"&$type&"*"
				setTextTrigger no_colos :no_colos_fuel3 "on the planet"
				setTextTrigger grab_colos :is_room_fuel "The Colonists disembark to begin their new life."
				pause

			:no_colos_fuel3
				killtrigger grab_colos
				killtrigger no_colos
				setVar $moveColo "JETT"
				setvar $COLOS $COLOS_MIN

			:is_room_fuel
				killtrigger grab_colos
				killtrigger no_colos
		else
			send "q q* l " & #8 & $planet~planetToFill & "*  s * t 1* s * t 2* s * t3* q q* l " & #8 & $planet~planets[$j] & "*  s * l "&$type&"*  "
		end
		add $COLOS $player~total_holds                                               
		if ($moveColo = "fuel")
			if ($planet~planetToFillFuelColonists - $player~total_holds > 0)
				add $planet~planet_FUEL_COLONISTS $player~total_holds
				subtract $planet~planetToFillFuelColonists $player~total_holds
			elseif ($planet~planetToFillOrganicsColonists - $player~total_holds > 0)
				add $planet~planet_EQUIPMENT_COLONISTS $player~total_holds
				subtract $planet~planetToFillOrganicsColonists $player~total_holds
			elseif ($planet~planetToFillEquipmentColonists - $player~total_holds > 0)
				add $planet~planet_EQUIPMENT_COLONISTS $player~total_holds
				subtract $planet~planetToFillEquipmentColonists $player~total_holds
			end
		elseif ($moveColo = "org")
			if ($planet~planetToFillOrganicsColonists - $player~total_holds > 0)
				add $planet~planet_ORGANICS_COLONISTS $player~total_holds
				subtract $planet~planetToFillOrganicsColonists $player~total_holds
			elseif ($planet~planetToFillFuelColonists - $player~total_holds > 0)
				add $planet~planet_ORGANICS_COLONISTS $player~total_holds
				subtract $planet~planetToFillFuelColonists $player~total_holds
			elseif ($planet~planetToFillEquipmentColonists - $player~total_holds > 0)
				add $planet~planet_EQUIPMENT_COLONISTS $player~total_holds
				subtract $planet~planetToFillEquipmentColonists $player~total_holds
			end
		elseif ($moveColo = "equip")
			if ($planet~planetToFillEquipmentColonists - $player~total_holds > 0)
				subtract $planet~planetToFillEquipmentColonists $player~total_holds
			elseif ($planet~planetToFillOrganicsColonists - $player~total_holds > 0)
				subtract $planet~planetToFillOrganicsColonists $player~total_holds
			elseif ($planet~planetToFillFuelColonists - $player~total_holds > 0)
				subtract $planet~planetToFillFuelColonists $player~total_holds
			end
			add $planet~planet_EQUIPMENT_COLONISTS $player~total_holds
		end
		gosub :setWindow
	end


return

:colonize
	killalltriggers
	setvar $status_message "Colonizing Planet"
	gosub :setWindow
	send "qq* l " & #8 & $planet~planetToFill & "*m n t * q l " & #8 & $planet~planets[$j] & "* c"
	waitfor "Planet command (?"
	setVar $BOT~command "colo"
	setVar $BOT~user_command_line " s 50 silent "
	setVar $BOT~parm1 "s"
	setVar $BOT~parm2 "50"
	saveVar $BOT~parm1
	saveVar $BOT~parm2
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\"&$bot~mombot_directory&"\modes\resource\colo.cts"
	setEventTrigger		coloended		:coloended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\colo.cts"
	pause
	:coloended
		 send "qq* "
return

:merch
	setVar $BOT~command "merch"
	if ($half = true)
		loadvar $game~port_max
		setvar $half_port_max $game~port_max
		divide $half_port_max 2
		setVar $bot~user_command_line " merch "&$half_port_max&" o e buyfuel skipcim half silent"
	else
		setVar $bot~user_command_line " merch 10000 o e skipcim buyfuel silent"
	end
	setVar $bot~parm1 "10000"
	saveVar $bot~parm1
	saveVar $BOT~command
	saveVar $bot~user_command_line
	load "scripts\"&$bot~mombot_directory&"\modes\cashing\merch.cts"
	setEventTrigger		merchended		:merchended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\cashing\merch.cts"
	pause
	:merchended
return

:pwarp
	send "p "& $player~warpto &"  *ys* "
	settextlinetrigger 1 :warp_its "All Systems Ready, shall we engage?"
	settextlinetrigger 2 :no_warps "You do not have any fighters in Sector"
	setTextLineTrigger 3 :warp_its "You are already in that sector!"
	pause

	:no_warps
		killtrigger 1
		killtrigger 2
		killtrigger 3
		setVar $success FALSE
	return
	:warp_its
		killtrigger 1
		killtrigger 2
		killtrigger 3
		setVar $success TRUE
	return

:neg

	setVar $BOT~command "neg"
	if ($half = true)
		setVar $bot~user_command_line " neg o e half silent"
	else
		setVar $bot~user_command_line " neg o e silent"
	end

	setVar $bot~parm1 "o"
	saveVar $bot~parm1
	setVar $bot~parm2 "e"
	saveVar $bot~parm2
	saveVar $BOT~command
	saveVar $bot~user_command_line
	load "scripts\"&$bot~mombot_directory&"\commands\cashing\neg.cts"
	setEventTrigger		negended		:negended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\cashing\neg.cts"
	pause
	:negended
return

:move_the_planet
			send "p "& $focus &"  *ys* "
			settextlinetrigger warp_it :warp_it "All Systems Ready, shall we engage?"
			settextlinetrigger no_warp :no_warp "You do not have any fighters in Sector"
			setTextLineTrigger alreadythere :warp_it "You are already in that sector!"
			pause

		:no_warp
			killalltriggers
			goto :tryAgain

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
			gosub :fillplanetstats

			send "m*** q* "
			gosub :count_planets
			if ($build = TRUE)
				gosub :buildplanets
			end
			gosub :setWindow

			gosub :count_planets
			if (($port) OR ($build))
				gosub :check_ports
			end
			if ($balance = true)
				if ($TLPlanets[$farmsector] > $game~MAX_PLANETS_PER_SECTOR)
					setVar $j 1
					setvar $planet~planets_to_move ($TLPlanets[$farmsector] - $game~MAX_PLANETS_PER_SECTOR)
					setvar $planet~planets_moved 0 
					while ($j <= $planet~planetCount)
						if ($planet~planetToFill <> $planet~planets[$j])
							send "l " & #8 & $planet~planets[$j] & "* "
							gosub :PLANET~getPlanetInfo
							if (($planet~planet_FUEL >= 5000) and ($planet~CITADEL >= 4))
								setvar $k 11
								while ($k <= SECTORS)
									getSectorParameter $k $bot~parameter $isTargettedSector
									if (($isTargettedSector = true) and ($TLPlanets[$k] < $game~MAX_PLANETS_PER_SECTOR))
										killtrigger 1
										killtrigger 2
										killtrigger 3
										send "c p "& $k &"  *ys* "
										settextlinetrigger 1 :warp_it_balance "All Systems Ready, shall we engage?"
										settextlinetrigger 2 :no_warp_balance "You do not have any fighters in Sector"
										setTextLineTrigger 3 :warp_it_balance "You are already in that sector!"
										pause			

										:warp_it_balance
											setvar $TLPlanets[$k] ($TLPlanets[$k] + 1)
											setvar $TLPlanets[$farmsector] ($TLPlanets[$farmsector] - 1)
											setvar $player~startinglocation "Citadel"
											setVar $PLAYER~warpto $farmsector
											gosub :player~quikstats
											gosub :player~twarp
											gosub  :player~currentPrompt
											if ($PLAYER~twarpSuccess <> TRUE)
												setvar $switchboard~message "Twarp failed during planet balancing. "&$player~msg&" Halting!*"
												gosub :switchboard~switchboard
												halt
											end
											add $planet~planets_moved 1
											if ($planet~planets_moved >= $planet~planets_to_move)
												goto :done_moving_planets
											end

										:no_warp_balance					
											killtrigger 1
											killtrigger 2
											killtrigger 3
											goto :done_moving_this_planet
									end
									add $k 1
								end
							end
							:done_moving_this_planet
							send "qq* "
						end
						add $j 1
					end
				end
			end
			:done_moving_planets
			if ($balance = true)
				gosub :count_planets
			end
			if ($armageddon = TRUE)
				setVar $BOT~command "mover"
				setVar $BOT~user_command_line "dump all fc oc ec turbo silent"
				setVar $BOT~parm1 "dump"
				saveVar $BOT~parm1
				saveVar $BOT~command
				saveVar $BOT~user_command_line
				load "scripts\"&$bot~mombot_directory&"\modes\resource\mover.cts"
				setEventTrigger		dumpended		:dumpendedbuild "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\resource\mover.cts"
				pause
				:dumpendedbuild	       

				if (PORT.EXISTS[$farmSector] = TRUE)
					if ($PLAYER~FIGHTERS > $SHIP~SHIP_MAX_ATTACK)
						send "p"
						setTextTrigger 1 :portAlreadyGone "Captain! Are you sure you want to port here?"
						setTextTrigger 2 :continueDestroy "<A> Attack this Port"
						pause
						:continueDestroy
						killtrigger 1
						killtrigger 2
						killtrigger 3
						killtrigger 4
						send " a y "&$SHIP~SHIP_MAX_ATTACK&"*l "&$planet~planetToFill&"* m * * * q "
						setTextTrigger 1 :keepDestroying "Incoming laser barrage from"
						setTextTrigger 2 :doneDestroying "You destroyed the Star Port!"
						pause
						:doneDestroying
						:portAlreadyGone
							send "*   "
							killtrigger 1
							killtrigger 2
							killtrigger 3
							killtrigger 4
					else
						setVar $SWITCHBOARD~message "Not enough fighters.  Better reload before the armageddon can continue.*"
						gosub :SWITCHBOARD~switchboard
						halt
					end
				end


			end
			if (($strip) or ($colo) or ($upgrade) or ($cash) or ($warp) or ($shield) or ($colonize) or ($figs) or ($defense) or ($movefig) or ($barricade) or ($armageddon))
				gosub :stripallplanets
			end
			if ($silent <> TRUE)
				setVar $SWITCHBOARD~message "Completed All Farming/Building/Port Actions Sector: "&$farmSector&".*"
				gosub :SWITCHBOARD~switchboard
			end
			send "qq* l " & #8 & $planet~planetToFill & "* "
			gosub :PLANET~getPlanetInfo
			gosub :fillplanetstats
			send "c"
			:next_farm_sector
			if ($strip = TRUE)
				if ((($get_org = TRUE) AND ($planet~planet_ORGANICS > ($planet~planet_ORGANICS_MAX-1000))) AND (($get_equ = TRUE) AND ($planet~planet_EQUIPMENT > ($planet~planet_EQUIPMENT_MAX - 1000))))
					setVar $planet~planetIsFull TRUE
					goto :end
				end
			end
return

:fillplanetstats
	setVar $planet~planetToFill $planet~planet
	setVar $planet~planetToFillFuel $planet~planet_FUEL
	setVar $planet~planetToFillOrganics $planet~planet_ORGANICS
	setVar $planet~planetToFillEquipment $planet~planet_EQUIPMENT
	setVar $planet~planetToFillFuelColonists $planet~planet_FUEL_COLONISTS
	setVar $planet~planetToFillOrganicsColonists $planet~planet_ORGANICS_COLONISTS
	setVar $planet~planetToFillEquipmentColonists $planet~planet_EQUIPMENT_COLONISTS
	setvar $planet~planetToFillFuelMax $planet~planet_FUEL_COLONISTS_MAX
	setvar $planet~planetToFillOrgMax $planet~planet_ORGANICS_COLONISTS_MAX
	setvar $planet~planetToFillEquipMax $planet~planet_EQUIPMENT_COLONISTS_MAX
	gosub :setWindow						
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
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\loadplanetinfo\planet"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\planet\makeplanetarray\planet"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\currentprompt\player"
