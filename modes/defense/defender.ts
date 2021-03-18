	#####################################
	# Main defender configuration setup #
	#####################################
	
	gosub :BOT~loadVars
	loadvar $MAP~STARDOCK
	loadvar $map~home_sector
	loadvar $SHIP~cap_file
	loadvar $game~internalAliens
	loadvar $game~internalFerrengi
	loadvar $game~limpet_cost
	loadvar $game~limpet_removal_cost
	loadvar $game~armid_cost
	loadvar $game~photon_cost
	loadvar $game~DISRUPTOR_COST
	loadvar $bot~subspace
	loadvar $bot~username
	lowercase $bot~username
	loadvar $game~MULTIPLE_PHOTONS
	loadvar $bot~folder

	###################################
	# sets smart behavior for citkill #
	###################################
	setvar $player~smart true

	setVar $settings~sentinel_cycle 15000
	setvar $sentinel~CheckCLVDetail 1
	setVar $sentinel~logfile $bot~folder&"/sentinel"&$year & $month & $day & ".log"

	setvar $check_history false
	setarray $fire_history sectors
	setarray $main~friendly_sectors sectors
	setarray $main~attack_sectors sectors


	setVar $START_FIG_HIT "Deployed Fighters Report Sector "
	setVar $END_FIG_HIT   ":"
	setVar $ALIEN_ANSI    #27 & "[1;36m" & #27 & "["
	setVar $START_FIG_HIT_OWNER ":"
	setVar $END_FIG_HIT_OWNER "'s"
	setvar $photon~shot 0


	setVar $BOT~help[1]  $BOT~tab&"Grid defender {adjacent|density|nophoton} {f} {l} {a} {auto} {holo} {mines} "
	setVar $BOT~help[2]  $BOT~tab&"              {saveme:bot} {multi:#} {switch} {capture} {secure|paranoid}   "
	setVar $BOT~help[3]  $BOT~tab&"              {stay|holokill|slingshot} {sentinel} {noescape} {mines:#}     "
	setVar $BOT~help[4]  $BOT~tab&"              {limit:#} {mintargets:#} {safe}                               "
	setVar $BOT~help[5]  $BOT~tab&"          "
	setVar $BOT~help[6]  $BOT~tab&"           {f} - Trigger on fighter hits"
	setVar $BOT~help[7]  $BOT~tab&"           {l} - Trigger on limpet hits"
	setVar $BOT~help[8]  $BOT~tab&"           {a} - Trigger on armid hits"
	setVar $BOT~help[9]  $BOT~tab&"        {holo} - holoscan on ss after photon "
	setVar $BOT~help[10] $BOT~tab&"      {secure} - will only escape to limped sectors "
	setVar $BOT~help[11] $BOT~tab&"    {paranoid} - will only drop to limped sectors "
	setVar $BOT~help[12] $BOT~tab&"    {adjacent} - adjacent photon option - default"
	setVar $BOT~help[13] $BOT~tab&"     {density} - density photon option"
	setVar $BOT~help[14] $BOT~tab&"    {nophoton} - will not fire photon"
	setVar $BOT~help[15] $BOT~tab&"        {stay} - won't leave sector to kill"
	setVar $BOT~help[16] $BOT~tab&"    {holokill} - holokill if target is seen"
	setVar $BOT~help[17] $BOT~tab&"   {slingshot} - pgrid holokill if target is seen"
	setVar $BOT~help[18] $BOT~tab&"    {noescape} - will not retreat from attack sector"
	setVar $BOT~help[19] $BOT~tab&"        {auto} - Will reset cannon damages automatically"
	setVar $BOT~help[20] $BOT~tab&"     {capture} - capture instead of kill "
	setVar $BOT~help[21] $BOT~tab&"       {mines} - auto deploy mines as you go "
	setVar $BOT~help[22] $BOT~tab&"  {saveme:bot} - define saveme bot for your planet "
	setVar $BOT~help[23] $BOT~tab&"     {multi:#} - how many photons to shoot (multi photon games) "
	setVar $BOT~help[24] $BOT~tab&"      {switch} - will switch into saveme bots ship before kill "
	setVar $BOT~help[25] $BOT~tab&"    {sentinel} - turns on sentinel mode "
	setVar $BOT~help[26] $BOT~tab&"    {defender} - pops a planet during holokill "
	setVar $BOT~help[27] $BOT~tab&"     {mines:#} - how many mines to deploy "
	setVar $BOT~help[28] $BOT~tab&"     {limit:#} - how many photons to shoot before stopping "
	setVar $BOT~help[29] $BOT~tab&"{mintargets:#} - only fires if there are this many options "
	setVar $BOT~help[30] $BOT~tab&"        {safe} - only attacks outside of sector if odds are good "
	setVar $BOT~help[31] $BOT~tab&"           "
	setVar $BOT~help[32] $BOT~tab&"        Examples: "
	setVar $BOT~help[33] $BOT~tab&"             >defender f l a holo "
	setVar $BOT~help[34] $BOT~tab&"             >defender f l a density  "
	setVar $BOT~help[35] $BOT~tab&"             >defender f density adjacent secure"
	setVar $BOT~help[36] $BOT~tab&"             >defender secure saveme:hunt"

	gosub :bot~helpfile

	setvar $script_ver "Grid Defender"
	setVar $BOT~script_title $script_ver
	gosub :BOT~banner

	setVar $PLAYER~save TRUE
	gosub :combat~init 
	gosub :prhunter~initialize
	
	loadGlobal $bot~last_fighter_attack
	
	getSectorParameter SECTORS "FIGSEC" $isFigged
	if (($MAP~stardock = 0) OR ($MAP~stardock = ""))
		setVar $SWITCHBOARD~message "Stardock is not defined.  Please define stardock variable in the bot.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($isFigged = "")
		setVar $SWITCHBOARD~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		gosub :SWITCHBOARD~switchboard
		halt
	end




	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($PLAYER~current_prompt <> "Citadel")
		setVar $SWITCHBOARD~message "Must run "&$script_ver&" from citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setvar $map~home_sector $player~current_sector


	gosub :player~startCNsettings




	getwordpos " "&$bot~user_command_line&" " $pos " f "
	if ($pos > 0)
		setvar $fighter true
	else
		setvar $fighter false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " l "
	if ($pos > 0)
		setvar $limpet true
	else
		setvar $limpet false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " a "
	if ($pos > 0)
		setvar $armid true
	else
		setvar $armid false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " auto "
	if ($pos > 0)
		setvar $killing~auto true
	else
		setvar $killing~auto false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " holo "
	if ($pos > 0)
		setvar $holo true
	else
		setvar $holo false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " holokill"
	if ($pos > 0)
		setvar $killing~holokill true
	else
		setvar $killing~holokill false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " sling"
	if ($pos > 0)
		setvar $killing~slingshot true
		setvar $killing~holokill false
	else
		setvar $killing~slingshot false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " sec"
	if ($pos > 0)
		setvar $navigate~securePwarp true
	else
		setvar $navigate~securePwarp false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " par"
	if ($pos > 0)
		setvar $navigate~securePwarp true
		setvar $photon~paranoid true
	else
		setvar $photon~paranoid false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " sent"
	if ($pos > 0)
		setvar $sentinel~broadcast true
	else
		setvar $sentinel~broadcast false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " prhunt"
	if ($pos > 0)
		setvar $prhunter~activate true
	else
		setvar $prhunter~activate false
	end


	getwordpos " "&$bot~user_command_line&" " $pos " allkeys "
	if ($pos > 0)
		setvar $mode~allkeys true
	else
		setvar $mode~allkeys false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " den"
	if ($pos > 0)
		setvar $photon~density true
	else
		setvar $photon~density false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " swit"
	if ($pos > 0)
		setvar $killing~switch true
	else
		setvar $killing~switch false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " safe "
	if ($pos > 0)
		setvar $sector~safe_attack_only true
	else
		setvar $sector~safe_attack_only false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " alien"
	if ($pos > 0)
		setvar $aliens~hunt true
	else
		setvar $aliens~hunt false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " patp "
	if ($pos > 0)
		setvar $patp true
	else
		setvar $patp false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " buyfig "
	if ($pos > 0)
		setvar $buyfig true
	else
		setvar $buyfig false
	end

	if ($photon~density = true)
		getwordpos " "&$bot~user_command_line&" " $pos " adj"
		if ($pos > 0)
			setvar $photon~adjacentphoton true
		else
			setvar $photon~adjacentphoton false
		end
	else
		setvar $photon~adjacentphoton true
	end

	getwordpos " "&$bot~user_command_line&" " $pos " noescape "
	if ($pos > 0)
		setvar $noescape true
	else
		setvar $noescape false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " cap"
	if ($pos > 0)
		setvar $killing~capture true
	else
		setvar $killing~capture false
	end

    fileExists $SHIP~cap_file_chk $SHIP~cap_file
    if ($SHIP~cap_file_chk <> TRUE)
        gosub :SHIP~getShipCapStats
    else
		gosub :ship~loadShipInfo
    end

    gosub :SHIP~getShipStats


	getwordpos " "&$bot~user_command_line&" " $pos " mine"
	if ($pos > 0)
		getWordPos " "&$bot~user_command_line&" " $pos " mines:"
		if ($pos > 0)
			getText $bot~user_command_line&" " $deploy_mine_count "mines:" " "
			isNumber $test $deploy_mine_count
			if ($test <> true)
				setVar $SWITCHBOARD~message "Number of mines to deploy should be a number.*"
				gosub :switchboard~switchboard
				halt
			end
		end
		if ($deploy_mine_count = 0)
			setvar $deploy_mine_count 3
		end
		if ($deploy_mine_count > $SHIP~SHIP_MINES_MAX)
			setvar $deploy_mine_count $SHIP~SHIP_MINES_MAX
		end
		setvar $restock~deploymines true
	else
		setvar $restock~deploymines false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " defender "
	if ($pos > 0)
		setvar $combat~defender true
		if ($player~genesis <= 0)
			setVar $SWITCHBOARD~message "You have to have genesis torps to run defender mode.*"
			gosub :switchboard~switchboard
			halt			
		end
	else
		setvar $combat~defender false
	end

	setvar $aliens~filterships ""
	getWordPos $bot~user_command_line $pos #34
	if ($pos > 0)
		getText $bot~user_command_line $aliens~filterships #34 #34
		if ($aliens~filterships = false)
			setVar $SWITCHBOARD~message "Invalid ship filter entered.*"
			gosub :SWITCHBOARD~switchboard
			halt			
		else
			setVar $SWITCHBOARD~message "Moving all ships matching: ["&$aliens~filterships&"], and bringing them home.*"
			gosub :SWITCHBOARD~switchboard
		end
	end

	getwordpos $bot~user_command_line $pos "sell"
	if ($pos > 0)
		setvar $aliens~sell true
	else
		setvar $aliens~sell false
	end

	getwordpos " "&$bot~user_command_line&" " $pos "nokill"
	if ($pos > 0)
		setvar $killing~nokill true
	else
		setvar $killing~nokill false
	end

	getWordPos " "&$bot~user_command_line&" " $pos " multi:"
	setvar $photon~multi false
	setvar $photon~shooting_count 1
	if ($pos > 0)
		if ($game~MULTIPLE_PHOTONS <> TRUE)
			setVar $SWITCHBOARD~message "This game doesn't support multiple photons.*"
			gosub :switchboard~switchboard
			halt
		end
		setvar $photon~multi true
		getText $bot~user_command_line&" " $photon~shooting_count "multi:" " "
		isNumber $test $photon~shooting_count
		if ($test <> true)
			setVar $SWITCHBOARD~message "Number of photons to shoot should be a number.*"
			gosub :switchboard~switchboard
			halt
		end
		if ($photon~multi_count = 0)
			setvar $photon~shooting_count 3
		end
	else
		getwordpos " "&$bot~user_command_line&" " $pos " nophoton "
		if ($pos > 0)
			setvar $nophoton true
			setvar $photon~adjacentphoton false
			setvar $photon~density false
			setvar $photon~shooting_count 0
		else
			setvar $nophoton false
		end
	end

	getWordPos " "&$bot~user_command_line&" " $pos " limit:"
	if ($pos > 0)
		getText $bot~user_command_line&" " $photon~limit "limit:" " "
		if ($photon~limit = 0)
			setVar $SWITCHBOARD~message "Photon limit is not valid.*"
			gosub :switchboard~switchboard
			halt
		end
	end

	setvar $minimumTarget 0
	getWordPos " "&$bot~user_command_line&" " $pos " mintargets:"
	if ($pos > 0)
		getText $bot~user_command_line&" " $minimumTarget "mintargets:" " "
		if ($minimumTarget = 0)
			setVar $SWITCHBOARD~message "Minimum attack targets is not valid.*"
			gosub :switchboard~switchboard
			halt
		end
	end

	getWordPos " "&$bot~user_command_line&" " $pos " furbsec:"
	if ($pos > 0)
		setvar $restock~refurb_in_sector true
		getText $bot~user_command_line&" " $restock~refurb_sector "furbsec:" " "
		if ($restock~refurb_sector = 0)
			setVar $SWITCHBOARD~message "Refurb sector is not valid.*"
			gosub :switchboard~switchboard
			halt
		end
	end

	getWordPos " "&$bot~user_command_line&" " $pos " saveme:"
	setvar $main~saveme false
	setvar $main~saveme_bot ""
	if ($pos > 0)
		setvar $main~saveme true
		getText $bot~user_command_line&" " $main~saveme_bot "saveme:" " "
		if ($main~saveme_bot = 0)
			setVar $SWITCHBOARD~message "Saveme bot is not valid.*"
			gosub :switchboard~switchboard
			halt
		end
	end

	if (($killing~switch) and ($main~saveme <> true))
		setVar $SWITCHBOARD~message "Switch ships option doesn't work without saveme bot defined.*"	
		gosub :switchboard~switchboard
		halt
	end


	if (($fighter <> true) and ($armid <> true) and ($limpet <> true))
		setvar $fighter true
		setvar $armid true
		setvar $limpet true
	end

	gosub :PLAYER~getInfo
	gosub :kill_defender_triggers

	gosub :checkShipForDefenderStatus
	if (($isDefender = true) and ($player~genesis > 0))
		setVar $SWITCHBOARD~message "In a ship with defender odds so automatically turning on defender option.*"
		gosub :SWITCHBOARD~switchboard
		setvar $combat~defender true
	end

	gosub :keep

	send "q"
	gosub :PLANET~getPlanetInfo	
	send "t*t1* c x t Login**q "

	####################################################################################################
	# If atmosphere cannon isn't set, set it to 1% so make sure we can tell if someone lands on planet #
	####################################################################################################
	if ($planet~ATMOSPHERE_CANNON <= 0)
		send "l a1* "
		setVar $SWITCHBOARD~message "Defender automatically setting atmosphere canonon to 1% from 0%.*"
		gosub :SWITCHBOARD~switchboard
	end
	
	setvar $navigate~starting_planet $planet~planet


	#######################################################################################################
	# need to add a check here to make sure no nav haz or enemy limpets in starting sector before furbing #
	#######################################################################################################
    

	setvar $navigate~starting_ship_type $player~ship_type
	setvar $navigate~starting_ship_max_attack $ship~SHIP_MAX_ATTACK
	setvar $navigate~starting_ship_offensive_odds $SHIP~SHIP_OFFENSIVE_ODDS 


	setTextTrigger need_ig :ig_was_off "Your Interdictor generator is now OFF"
	setTextTrigger skip_ig :skipig "is not equipped with an Interdictor Generator"
	send "q q q q* b"
	waitOn "Do you wish to change it? (Y/N)"
	send "*"
	goto :skipig

	:ig_was_off
		send "y"
		setVar $SWITCHBOARD~message "Defender automatically turning on ship IG.*"
		gosub :SWITCHBOARD~switchboard

	:skipig
	killalltriggers
	send "l"&$planet~planet&"*"
	waitOn "Planet command"
	send "c "

	setvar $switchboard~message "Preloading sector data..  Please wait a couple seconds.*"
	gosub :switchboard~switchboard
	gosub :player~quikstats

	gosub :refresh_sectors

	gosub :check_for_photon_refurb

	################################
	# check for aliens in the game #
	################################
	setvar $game~hasAliens false

	send "#/"
	waiton "Who's Playing"
	setTextLineTrigger	1	:alien	"are on the move!"
	setTextTrigger		2	:aliendone (#179 & "Turns")
	pause
	:alien
		setvar $game~hasAliens true
	:aliendone
		killtrigger 1
		killtrigger 2
		savevar $game~hasAliens

	if ($main~saveme)
		send "'" $main~saveme_bot " unlock*"
		waiton " enters the game."
		getText "[[START]]"&CURRENTLINE $main~saveme_user "[[START]]" " enters the game."
		waiton "- Ship has been unlocked!"

		send "'" $main~saveme_bot " saveme on " #34 $bot~username #34 "*"
		setTextLineTrigger 1 :savemeready "- Saveme - Running from planet "&$planet~planet&" for "&$bot~username&"."
		setdelaytrigger 2 :savemefailed 10000
		pause

		:savemefailed
			killtrigger 1
			setvar $switchboard~message "Saveme bot isn't available or on wrong planet.  Please check and fix before running again.*"
			gosub :switchboard~switchboard
			halt
		:savemeready
			killtrigger 2
			setvar $switchboard~message "Saveme bot activated and unlocked for possible switching of ships.*"
			gosub :switchboard~switchboard

		if ($killing~switch)
			gosub :killing~switchships
	    	gosub :SHIP~getShipStats
			setvar $killing~switch_ship_type $player~ship_type
			setvar $killing~switch_ship_max_attack $ship~SHIP_MAX_ATTACK
			setvar $killing~switch_ship_offensive_odds $SHIP~SHIP_OFFENSIVE_ODDS 
			gosub :killing~switchships
	    end
	    gosub :SHIP~getShipStats
	end

	gosub :sentinel~checkcorp

	setVar $message $script_ver&" Currently Running On Planet "&$planet~planet&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-"
	if ($fighter)
		setVar $message $message&"*             On Fighter Hit: Yes"
	else
		setVar $message $message&"*             On Fighter Hit: No"
	end
	if ($limpet)
		setVar $message $message&"*              On Limpet Hit: Yes"
	else
		setVar $message $message&"*              On Limpet Hit: No"
	end
	if ($armid)
		setVar $message $message&"*               On Armid Hit: Yes"
	else
		setVar $message $message&"*               On Armid Hit: No"
	end
	if ($main~saveme)
		setVar $message $message&"*                 Saveme bot: "&$main~saveme_bot
	end
	setVar $message $message&"*                Home Sector: "&$map~home_sector
	format $planet~planet_fighters $formatted_fighters NUMBER
	setVar $message $message&"*                  Auto Kill: "&$formatted_fighters&" Fighters"
	setVar $message $message&"*                    "
	setVar $message $message&"*                  Modes"
	setVar $message $message&"*                 -------"
	if ($photon~adjacentphoton)
		setVar $message $message&"*             Adjacent Photon"
	end
	if ($photon~density)
		setVar $message $message&"*             Density Photon"
	end
	if ($nophoton = true)
		setVar $message $message&"*             Don't Photon"
	end
	if ($killing~nokill = true)
		setVar $message $message&"*             Don't Kill"
	else
		if ($killing~holokill)
			if ($killing~capture)
				setVar $message $message&"*             Holocap"
			else
				setVar $message $message&"*             Holokill"
			end
		end
		if ($killing~slingshot)
			setVar $message $message&"*             Slingshot"
		end
		if ($killing~switch)
			setVar $message $message&"*             Switch ships"
		end	
		if ($killing~capture)
			setVar $message $message&"*             Capture"
		end
	end
	if ($holo)
		setVar $message $message&"*             Holo Report"
	end
	if ($killing~auto)
		setVar $message $message&"*             Cannon Reset"
	end
	if ($navigate~securePwarp)
		setVar $message $message&"*             Secure"
	end
	if ($photon~paranoid)
		setVar $message $message&"*             Paranoid"
	end
	if ($restock~deploymines)
		if ($deploy_mine_count = 1)
			setVar $message $message&"*             Deploy "&$deploy_mine_count&" limpet and armid mine"
		else
			setVar $message $message&"*             Deploy "&$deploy_mine_count&" limpet and armid mines"
		end
	end
	if ($sentinel~broadcast = true)
		setVar $message $message&"*             Sentinel mode on"
	end
	if ($combat~defender = true)
		setVar $message $message&"*             Defender mode on"
	end
	if ($sector~safe_attack_only = true)
		setVar $message $message&"*             Only attacks outside of sector if odds good"
	end
	if ($prhunter~activate = true)
		setVar $message $message&"*             PR Hunter mode on"
	end
	if ($restock~refurb_in_sector = true)
		setVar $message $message&"*             Refurbing in sector "&$restock~refurb_sector
	end
	if ($photon~limit > 0)
		setVar $message $message&"*             Will stop after "&$photon~limit&" photons fired"
	end
	if ($minimumTarget > 1)
		setVar $message $message&"*             Consider sectors with "&$minimumTarget&" options minumum"
	end
	setVar $message $message&"*                                          "
	format $backdoorAttackCount $backdoorAttackCount NUMBER
	format $randomAttackCount $randomAttackCount NUMBER
	setvar $message $message&"*             "&$backdoorAttackCount&" backdoor attack vectors       "
	setvar $message $message&"*             "&$randomAttackCount&" random attack vectors           "
	setVar $message $message&"*                                        "
	setVar $message $message&"*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-**"	
	setvar $switchboard~message $message
	gosub :switchboard~switchboard

	if (($killing~holokill = true) and ($player~photons > $photon~shooting_count))
		if ($photon~shooting_count > 1)
			setvar $switchboard~message "Holokill with more than "&$photon~shooting_count&" photons is not advised.  Be careful.*"
		else
			if ($photon~shooting_count = 0)
				setvar $switchboard~message "Holokill photons is not advised.  Especially since you have photons turned off. Be careful.*"
			else
				setvar $switchboard~message "Holokill with more than "&$photon~shooting_count&" photon is not advised.  Be careful.*"
			end
		end
		gosub :switchboard~switchboard
	elseif (($killing~holokill = true) and ($nophoton = true) and ($player~photons > 0))
		setvar $switchboard~message "You are running holokill with a photon, with photon mode off.  Could be a recipe for disaster.  Be careful out there.*"
		gosub :switchboard~switchboard
	end

	# to allow twarp routine with photon #
	setvar $settings~override true


	###########################################
	# Main information processor for defender #
	###########################################

	setDelayTrigger	   announce_trigger :announce	1200000

	:processing
		gosub :kill_defender_triggers
		if ($planet~planet_fighters < ($planet~planet_fighters_max/3))
			if ($buyfig = true)
				killalltriggers
				gosub :with~run
				gosub :buyfig~run
				gosub :dep~run
			end
		end
		if (($patp = true) and ($planet~planet_fuel < ($planet~planet_fuel_max/3)))
			killalltriggers
			setvar $patp~minimum 1000
			setvar $patp~upgrade true
			gosub :patp~run
		end

		if ($mode~allkeys = true)
			if ($photon~is_all_keys <> true)
				send "c n 9 * q "
			end
			setvar $photon~is_all_keys true 
		end
		setvar $photon~found false

		#############################################################################################
		# Check for adjacent sectors in current location, for faster shooting if they come adjacent #
		#############################################################################################
		setarray $photon~adjacent 6
		setVar $i 1
		setvar $photon~adjacent_sectors " "
		while (SECTOR.WARPS[$player~current_sector][$i] > 0)
			setvar $photon~adjacent_sectors " "&$photon~adjacent_sectors&SECTOR.WARPS[$player~current_sector][$i]&" "
			add $i 1
		end
		if ($photon~sector > 0)
			if ($reprocess_sectors = true)
				gosub :refresh_sectors
				setvar $reprocess_sectors false
			end
			setVar $i 1
			setvar $photon~adjacent_to_last_attack_sectors_count 0
			setvar $photon~adjacent_to_last_attack_sectors " "
			while (SECTOR.WARPS[$photon~sector][$i] > 0)
				getsectorparameter SECTOR.WARPS[$photon~sector][$i] "FIGSEC" $isFigged
				if ($isFigged = true)
					add $photon~adjacent_to_last_attack_sectors_count 1
					setvar $photon~adjacent_to_last_attack_sectors " "&$photon~adjacent_to_last_attack_sectors&SECTOR.WARPS[$photon~sector][$i]&" "
				end
				add $i 1
			end
		end

		if ($limpet = true)
			setTextTrigger 21 :attackSectorLimpet "Limpet mine in "
		end
		if ($armid = true)
			setTextTrigger 22 :attackSectorMine "Your mines in "
		end
		if ($fighter = true)
			setTextTrigger 23 :attackSectorFighter "Deployed Fighters "
		end


		setTextTrigger 1 :pausing "Planet command (?="
		setTextTrigger 2 :pausing "Computer command ["
		setTextTrigger 3 :pausing "Corporate command ["
		setTextTrigger 4 :pausing "Transfer To or From the Treasury (T/F)"
		setTextTrigger 5 :pausing "Qcannon Control Type :"
		setTextTrigger 6 :pausing "Beam to what sector? (U=Upgrade"

		setTextLineTrigger 7  :scan "warps into the sector."
		setTextLineTrigger 8  :scan " lifts off from"
		setTextLineTrigger 9  :scan "Limpet mine in "&$player~current_sector
		setTextLineTrigger 10 :scan "Deployed Fighters Report Sector "&$player~current_sector&":"
		setTextLineTrigger 11 :scan "Quasar Cannon on"
		setTextLineTrigger 12 :scan "Shipboard Computers The Interdictor Generator on"
		setTextLineTrigger 13 :scan " is powering up weapons systems!"
		settextlinetrigger 14 :scan " launches a wave of fighters at the "
		settextlinetrigger 15 :scan	" launches a Genesis Torpedo into the sector!"
		settextlinetrigger 16 :scan " appears from the planetary rubble."
		setTextLineTrigger 17 :scan " exits the game."
		setTextLineTrigger 18 :scan " enters the game."
		if ($sentinel~broadcast)
			setdelaytrigger    20 :sentinel $settings~sentinel_cycle
		end
		setTextLineTrigger 24 :scan "Planetary TransWarp Drive Engaged!"
		

		if ($prhunter~activate = true)
			#################################################################################################
			# For searching and destroying passive gridders covering ports - expecting message from >prhunt #
			# R Minotaur PORT GONE: 19806 class: BBS                                                        #
			#################################################################################################
			setTextLineTrigger 25 :validate_prhunt " PORT GONE: "
		end
		pause
			

		:announce 

		killalltriggers
		if ($settings~sentinel_cycle > 15000)
			setvar $settings~sentinel_cycle 15000
			setvar $switchboard~message "Resetting sentinel to 15 seconds now that the action has stopped for a while.*"
			gosub :switchboard~switchboard
		end

		gosub :player~quikstats
		send "q "
		gosub :PLANET~getPlanetInfo	
		send "c "
		waiton "Citadel command ("

		setvar $description ""
		if ($photon~adjacentphoton)
			setvar $description $description&"Photon "
		end
		if ($photon~density)
			setvar $description $description&"Density "
		end
		if ($killing~holokill)
			if ($killing~capture)
				setvar $description $description&"Holocap "
			else
				setvar $description $description&"Holokill "
			end
		end
		if ($killing~switch)
			setvar $description $description&"Switch "
		end
		if ($killing~slingshot)
			setvar $description $description&"Slingshot "
		end
		if ($killing~capture)
			setvar $description $description&"Capture "
		end
		if ($navigate~securePwarp)
			setvar $description $description&"Secure "
		end
		if ($prhunter~activate)
			setvar $description $description&"PR Hunter "
		end
		if ($photon~paranoid)
			setvar $description $description&"Paranoid "
		end
		if ($main~saveme)
			setvar $description $description&"Saveme:"&$main~saveme_bot&" "
		end
		trim $description
		if ($description <> "")
			setvar $description " ("&$description&")"
		end
		setvar $switchboard~message $script_ver&$description&" is online and ready to fire.*"
		setvar $switchboard~message $switchboard~message&"*       Defender Activity       *"
		setvar $switchboard~message $switchboard~message&"-------------------------------*"
		if ($photon~shot > 0)
			setvar $switchboard~message $switchboard~message&"  Last shot at sector "&$photon~last_sector&"*"
			setvar $switchboard~message $switchboard~message&"  Photon attacks launched "&$photon~shot&" times*"
		else
			setvar $switchboard~message $switchboard~message&"  No photons fired.*"
		end
		if ($killing~holokill)
			setvar $switchboard~message $switchboard~message&"*  Planet holokills attempted "&$combat~holokill_count&" times *"
		end
		if ($prhunter~activate = true)
			setvar $switchboard~message $switchboard~message&"*  PR Hunter holokills attempted "&$prhunter~total_victims&" times *"
		end
		gosub :switchboard~switchboard
		gosub :refresh_sectors

		setDelayTrigger	   announce_trigger :announce	1200000
		goto :processing

		:head_home_timeout
			gosub :kill_defender_triggers
			setDelayTrigger	   announce_trigger :announce	1200000
			goto :processing
		:head_home 
			gosub :kill_defender_triggers
			gosub :player~quikstats
			if ($player~current_sector <> $map~home_sector)
				gosub :navigate~navigate_to_limp
				gosub :killing~scan_for_targets
				gosub :checkkillstatus
				gosub :navigate~runaway_if_needed
				gosub :restock~refurb_photons
				gosub :keep
			end
			if (($photon~shot >= $photon~limit) and ($photon~limit > 0))
				setvar $switchboard~message "Photon limit reached.  Shutting down.*"
				gosub :switchboard~switchboard
				setvar $nophoton true
			end
#			if ($player~current_prompt = "Citadel")
#				send "q "
#				gosub :PLANET~getPlanetInfo	
#				send "t * t 1* c  "
#				if (($planet~PLANET_FIGHTERS_MAX - $planet~planet_fighters) > ($ship~SHIP_FIGHTERS_MAX))
#					setvar $movefig~planetorsector "p"
#					gosub :movefig~run
#				end
#			end
#			gosub :player~quikstats
#			if ($player~current_prompt = "Citadel")		
#				send "q "
#				gosub :PLANET~getPlanetInfo	
#				send "t*t1* c "
#				if ($planet~planet_fighters < $ship~SHIP_FIGHTERS_MAX)
#					setvar $switchboard~message "Even after grabbing figs from sector, not enough fighters.  Shutting down..*"
#					gosub :switchboard~switchboard
#					halt
#				end
#			end
			gosub :waitbeforecheck
			loadGlobal $bot~last_fighter_attack
			if ($bot~last_fighter_attack <> "")
				gosub :killing~set_the_cannon
			end

		setDelayTrigger	   announce_trigger :announce	1200000
		goto :processing

	halt

:validate_prhunt
	getWord currentline $is_subspace_message 1
	getText currentline $prhunter~sector "PORT GONE:" " class: "
	isNumber $isNumber $prhunter~sector

	if (($is_subspace_message <> "R") or ($isNumber <> true))
		setTextLineTrigger 25 :validate_prhunt " PORT GONE: "
		pause
	end
	gosub :prhunter~hunt
	gosub :killing~scan_for_targets
	gosub :navigate~runaway_if_needed
	gosub :restock~refurb_photons

goto :processing

#################################################################
# Photon routines - fire photon, move away, restock, set cannon #
#################################################################


:attackSectorLimpet
	gosub :photon~limpet_spoof
	goto :check_to_fire_photon

:attackSectorMine
	gosub :photon~armid_spoof
	goto :check_to_fire_photon

:attackSectorFighter
	gosub :photon~fighter_spoof
	if (($photon~alien = true) and ($aliens~hunt = true))
		gosub :aliens~hunt
		send " ls"&$planet~SECTOR_CANNON&"* la"&$planet~ATMOSPHERE_CANNON&"*"  
		gosub :check_for_target_change
		gosub :navigate~navigate_away
	end


:check_to_fire_photon

	if ($photon~found = true)
		setvar $settings~sentinel_cycle 180000
		killalltriggers
		if ($photon~retreatfighter = true)
			gosub :photon~retreatphoton
		else
			if (($main~friendly_sectors[$photon~sector] = true) or ($fire_history[$photon~sector] > 5) or ($photon~last_sector = $photon~sector) or ($photon~sector = $map~home_sector))
				gosub :check_for_gridding_in_a_line
				goto :can_not_fire
			end
			if ($main~attack_sectors[$photon~sector] > 0)
				:try_another_shot_at_photon
					gosub :photon~photon
					gosub :check_for_gridding_in_a_line
			else
				setvar $j 1
				while (SECTOR.WARPSIN[$photon~sector][$j] > 0)
					setVar $tempAdj SECTOR.WARPSIN[$photon~sector][$j]
					getSectorParameter $tempAdj "FIGSEC" $isFigged
					getSectorParameter $tempAdj "LIMPSEC" $isLimped
					if (($isFigged = true) and ((($photon~paranoid = true) and ($isLimped = true)) or ($photon~paranoid = false)))
						setvar $main~attack_sectors[$photon~sector] $tempAdj
						goto :try_another_shot_at_photon
					end
					add $j 1
				end

				gosub :check_for_gridding_in_a_line
				gosub :check_for_target_change
				gosub :killing~scan_for_targets
				gosub :checkkillstatus
				gosub :check_for_target_change
				if ($player~current_sector = $bot~last_hit)
					gosub :killing~scan_for_targets
					gosub :checkkillstatus
				end
				goto :processing
			end
		end
		killalltriggers
		:done_firing
		########################################################################################
		# if last sector hit isn't sector shot and not sector we are currently in, shoot again #
		########################################################################################
		if ($photon~success = true)
			setvar $photon~last_sector $photon~sector
			setvar $fire_history[$photon~sector] ($fire_history[$photon~sector] + 1) 
			setvar $reprocess_sectors true
		else
			gosub :player~quikstats
		end
		if (($photon~shot >= $photon~limit) and ($photon~limit > 0))
			###################################################################
			# for when you only want to shoot a certain number of photons afk #
			###################################################################
			setvar $switchboard~message "Past the photon limit.  Shutting down photon mode.*"
			gosub :switchboard~switchboard
			setvar $nophoton true
		end
		gosub :check_for_target_change
		gosub :killing~scan_for_targets
		gosub :checkkillstatus
		gosub :check_for_target_change
		if ($player~current_sector = $bot~last_hit)
			gosub :killing~scan_for_targets
			gosub :checkkillstatus
		end
		#############################################
		# holoscan sector to see if victim is there #
		#############################################
		if ($killing~slingshot = true)
			gosub :killing~slingshot
		elseif ($killing~holokill = true)
			gosub :killing~doholokill
			if ($killing~holokill_stuck <> true)
				if (($photon~sector <> $MAP~stardock) AND ($photon~sector  > 10) AND (SECTOR.TRADERCOUNT[$photon~sector] > 0) AND ($combat~safePlanets = TRUE) and ($pwarp_success <> true))
					gosub :pwarp_direct_and_kill
				end
				if (($photon~sector <> $MAP~stardock) AND ($photon~sector  > 10) AND (SECTOR.TRADERCOUNT[$photon~sector] > 0) AND ($combat~safePlanets = TRUE) and ($pwarp_success <> true))
					gosub :killing~doholokill
					gosub :pwarp_direct_and_kill
				end
				if (($photon~sector <> $MAP~stardock) AND ($photon~sector  > 10) AND (SECTOR.TRADERCOUNT[$photon~sector] > 0) AND ($combat~safePlanets = TRUE) and ($pwarp_success <> true))
					gosub :killing~doholokill
					gosub :pwarp_direct_and_kill
				end
			else
				send "l j" #8 #8  $planet~planet  "* n n * j m * * * j c  *  "
				gosub :player~quikstats
				if ($player~current_prompt = "Command")
					# Stuck in sector probably without planet #
					# TODO #
					# Need to add logic to xport out of ship, and twarp to planet sector and land. #
					# twarp or mow to $killing~before_holo_kill_sector so we don't lose planet     #
				else
					if ($player~current_sector <> $killing~before_holo_kill_sector)
						gosub :killing~scan_for_targets
					end
				end

			end
		end
		gosub :check_for_target_change
		if (((($photon~adjacentphoton = true) and ($photon~success = true)) or ($nophoton = true)) and ($holo = true))
			gosub :doholo
		end

		gosub :check_for_target_change
		gosub :killing~scan_for_targets
		gosub :checkkillstatus
		gosub :check_for_target_change
		if ((SECTOR.LIMPETS.QUANTITY[$player~current_sector] <= 0) and ($player~limpets > 0) and ($restock~deploymines = true))
			gosub :main~domines
		end
		gosub :check_for_target_change
		if ($noescape <> true)
			gosub :navigate~navigate_away
			gosub :player~quikstats
			gosub :killing~scan_for_targets
			gosub :checkkillstatus
			gosub :navigate~runaway_if_needed
		end
		####################
		# check for refurb #
		####################
		gosub :player~quikstats
		gosub :check_for_photon_refurb
		gosub :waitbeforecheck
		loadGlobal $bot~last_fighter_attack
		if ($bot~last_fighter_attack <> "")
			gosub :killing~set_the_cannon
		end

	else
		if (($photon~alien = true) and ($aliens~hunt = true))	
			goto :processing
		end

		if ($limpet)
			killtrigger 21
			setTextTrigger 21 :attackSectorLimpet "Limpet mine in "
		end
		if ($armid)
			killtrigger 22
			setTextTrigger 22 :attackSectorMine "Your mines in "
		end
		if ($fighter)
			killtrigger 23
			setTextTrigger 23 :attackSectorFighter "Deployed Fighters "
		end
		pause
	end

	goto :processing


############################################################################################
# Scanning routines - checking sector for enemies and killing if possible - leaving if not #
############################################################################################

:scan
	setvar $i 1
	while ($i <= $sentinel~corp_count)
		getwordpos CURRENTLINE $pos $sentinel~corp_members[$i]&" "
		if ($pos > 0)
			goto :processing
		end
		add $i 1
	end
	gosub :kill_defender_triggers
	gosub :killing~checkForVictims
	gosub :checkkillstatus

	################################################################
	# after attempting to kill, need to move no matter the outcome #
	# they could be sitting above in defender ship                 #
	################################################################

	gosub :navigate~runaway_if_needed
	goto :processing


##############################################
# Pausing routine for leaving citadel prompt #
##############################################

:pausing
	gosub :kill_defender_triggers
	echo ANSI_6 "*[" ANSI_14 $script_ver " paused. To restart, re-enter Citadel Prompt" ANSI_6 "]*" ANSI_7
	setTextTrigger 1 :restarting "Citadel command ("
	settextlinetrigger 2 :fixpassword "Enter a new password (up to 10 chars) : OKIE: MSTS"
	pause
	:restarting
		killtrigger 2
		echo ANSI_6 "*[" ANSI_14 $script_ver " restarted" ANSI_6 "]*" ANSI_7
		gosub :player~quikstats
		goto :processing
	:fixpassword
		killtrigger 1
		send "c q  "
		setvar $switchboard~message "Connection from remote server messing up password.  Fixing..*"
		gosub :switchboard~switchboard
		goto :processing




:kill_defender_triggers
	setvar $i 1
	while ($i <= 30)
		killtrigger ""&$i&""
		add $i 1
	end
	killtrigger wait
	killtrigger announce_trigger
return

:check_for_gridding_in_a_line
	setvar $in_a_line false
	getwordpos $photon~adjacent_to_last_attack_sectors $pos " "&$photon~sector&" "
	if (($pos > 0) and ($photon~adjacent_to_last_attack_sectors_count = 1))
		############################################
		# if attacked to sectors in a row and only #
		# one possible attack, do density          #
		############################################
#		setvar $photon~found true
#		setvar $saved $photon~density
#		setvar $photon~density true
#		setvar $photon~long true
		getword $photon~adjacent_to_last_attack_sectors $photon~sector 1
#		gosub :photon~photon
#		setvar $photon~density $saved
		setvar $in_a_line true
		if ($main~attack_sectors[$photon~sector] > 0)
			send "p " $main~attack_sectors[$photon~sector] "*y "
			setvar $switchboard~message "Detecting gridding in a row.  Only one possible target.  Attempting adjacent photon.*"
			gosub :switchboard~switchboard
			gosub :player~quikstats
			goto :processing
		end
	elseif ($pos > 0)
		setvar $switchboard~message "They seem to be gridding in a line.  Time to pdrop them?*"
		gosub :switchboard~switchboard
		setvar $in_a_line true
	end
return

:doHolo
	setVar $BOT~command "holo"
	setVar $BOT~user_command_line " holo"
	
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\"&$bot~mombot_directory&"\commands\data\holo.cts"
	setEventTrigger        holoend1        :holoend1 "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\data\holo.cts"
	pause
	:holoend1
		killtrigger holoend1
return

:main~doMines


	################################################################################
	# TODO add fighter deployment as well - and for empty sectors drop 2 fighters, #
	# 9 armids (100 density) or 20 fighters (100 density                           #
	################################################################################
	setvar $limpet_amount $deploy_mine_count
	setvar $armid_amount $deploy_mine_count
	if ($player~limpets < $deploy_mine_count)
		setvar $limpet_amount $player~limpets
	end 
	if ($player~armids < $deploy_mine_count)
		setvar $armid_amount $player~armids
	end 
	send " q q * "
	if ($limpet_amount > 0)
		send "h 2" $limpet_amount "*  zc* "
	end
	if ($armid_amount > 0)
		send "h 1" $armid_amount "*  zc* "
	end
	send "l j" #8 #8  $planet~planet  "* j m * * * j c  *  "
	gosub :player~quikstats
	if ($player~current_prompt <> "Citadel")
		setvar $switchboard~message "Not at correct prompt after mine deploy!  Maybe planet is gone?  Check please!*"
		gosub :switchboard~switchboard
		gosub :navigate~callsaveme
	end
return

:check_for_photon_refurb
	loadGlobal $bot~last_fighter_attack
	if ($bot~last_fighter_attack <> "")
		gosub :killing~set_the_cannon
	end
	if ((($player~photons < $photon~shooting_count) and ($nophoton <> true)) or (($combat~defender = true) and ($player~genesis <= 0)) or (($restock~deploymines = true) and (($player~limpets < $deploy_mine_count) and ($player~armids < $deploy_mine_count) and ($ship~SHIP_MINES_MAX > 0))))
		if (($player~turns <= 0) and ($player~unlimitedGame <> true))
			setvar $switchboard~message "No turns to refurb photons.  Skipping - might need to wait for top of the hour.*"
			gosub :switchboard~switchboard
		end
		gosub :navigate~navigate_to_limp
		gosub :killing~scan_for_targets
		gosub :checkkillstatus
		gosub :navigate~runaway_if_needed
		gosub :restock~refurb_photons
		gosub :keep
		if ($player~photons < $photon~shooting_count)
			if (($photon~shooting_count > 1) and ($player~photons > 0))
				setvar $switchboard~message "This ship does not have enough to photons to shoot "&$photon~shooting_count&" times. Setting photon firing count to 1.*"
				setvar $photon~shooting_count 1
			else
				setvar $switchboard~message "This ship does not have enough to photons to shoot "&$photon~shooting_count&" times.  Either out of money or this ship doesn't hold that many.  Shutting down photon mode.*"
				setvar $nophoton true
			end
			gosub :switchboard~switchboard
		end
	end
return

:pwarp_direct_and_kill
	setTextTrigger 1 :jumped "All Systems Ready, shall we engage?"
	settexttrigger 2 :no_jump "Your own fighters must be in the destination to make a safe jump"
	settexttrigger 3 :jumped "You are already in that sector!"
	send "p" $photon~sector "*"
	pause
	:no_jump
		killtrigger 1
		killtrigger 2
		killtrigger 3
		setvar $pwarp_success false
		return
	:jumped
		send "y   "
		killtrigger 1
		killtrigger 2
		killtrigger 3
		setvar $pwarp_success true
		gosub :killing~scan_for_targets
		gosub :checkkillstatus
return

:waitbeforecheck
	setdelaytrigger waithere :checklasthit 5
	pause
	:checklasthit
return

:main~check_for_target_change
:check_for_target_change
	if ($player~photons > 0)
		gosub :waitbeforecheck
		loadGlobal $bot~last_hit
		if (($photon~sector <> $bot~last_hit) and ($bot~last_hit <> 0) and ($player~current_sector <> $bot~last_hit))
			loadGlobal $bot~last_hit_type
			if ($bot~last_hit_type = "limpet")
				gosub :photon~limpet_spoof
			elseif ($bot~last_hit_type = "armid")
				gosub :photon~armid_spoof
			else
				gosub :photon~fighter_spoof
			end
			if ($photon~found = true)
				if ($aliens~hunt = true)
					send " ls"&$planet~SECTOR_CANNON&"* la"&$planet~ATMOSPHERE_CANNON&"*"  
				end
				goto :check_to_fire_photon
			end
		end
	end
return

:sentinel
	gosub :kill_defender_triggers
	gosub :sentinel~activate
	goto :processing


:can_not_fire
	if ($photon~found = true)
		if ($fire_history[$photon~sector] > 5)
			echo "*Fired more than 5 times into sector "&$photon~sector&".  That's too many.  Restart script if you want to keep photoning.*"
		end
		if ($photon~last_sector = $photon~sector)
			echo "*Can't fire into sector "&$photon~sector&" twice.*"
		end
		if ($photon~sector = $map~home_sector)
			echo "*Can not fire into home sector.*"
		end
		if ($main~friendly_sectors[$photon~sector] = true)
			echo "*Can not fire into bubble or farm sector "&$photon~sector&"!*"
		end
	end
	gosub :killing~scan_for_targets
	gosub :checkkillstatus
	gosub :navigate~runaway_if_needed
	goto :processing


:refresh_sectors
		setvar $backdoorAttackCount 0
		setvar $randomAttackCount 0
		setvar $i 1
		while ($i <= sectors)
			###############################################################################
			# when photon has been fired, only adjust sectors pointing to the missing fig #
			###############################################################################
			if ($photon~sector > 0)
				if ($main~attack_sectors[$i] <> $photon~sector)
					goto :skip_refresh_sector
				end
			end
			getsectorparameter $i "BUBBLE" $isBubble
			getsectorparameter $i "FARM" $isFarm
			if (($isFarm = true) OR ($isBubble = true))
				setvar $friendly_sector[$i] true
			else
				setvar $friendly_sector[$i] false
			end
			if (($i = $map~stardock) OR ($i <= 10))
				setvar $friendly_sector[$i] true
				setSectorParameter $i "FIGSEC" false
			end
			setvar $foundSector false
			setvar $main~attack_sectors[$i] 0
			####################################################
			# Always pick a backdoor attack sector if possible #
			####################################################
			setvar $j 1
			while ((SECTOR.BACKDOORS[$i][$j] > 0) and ($foundSector = false))
				setVar $tempAdj SECTOR.BACKDOORS[$i][$j]
				getSectorParameter $tempAdj "FIGSEC" $isFigged
				getSectorParameter $tempAdj "LIMPSEC" $isLimped
				if (($isFigged = true) and ((($photon~paranoid = true) and ($isLimped = true)) or ($photon~paranoid = false)))
					setvar $main~attack_sectors[$i] $tempAdj
					add $backdoorAttackCount 1
					setvar $foundSector true
				end
				add $j 1
			end
			if ($foundSector = false)
				setarray $targets 7
				setvar $targetCount 0
				setvar $j 1
				while (SECTOR.WARPSIN[$i][$j] > 0)
					setVar $tempAdj SECTOR.WARPSIN[$i][$j]
					getSectorParameter $tempAdj "FIGSEC" $isFigged
					getSectorParameter $tempAdj "LIMPSEC" $isLimped
					if (($isFigged = true) and ((($photon~paranoid = true) and ($isLimped = true)) or ($photon~paranoid = false)))
						add $targetCount 1
						setvar $targets[$targetCount] $tempAdj
					end
					add $j 1
				end
				if ($targetCount > 0)
					if ($targetCount >= $minimumTarget)
						getRnd $randomTarget 1 $targetCount
						setvar $main~attack_sectors[$i] $targets[$randomTarget]
						add $randomAttackCount 1
					end
				end
			end
			:skip_refresh_sector
			add $i 1
		end
return

:checkkillstatus
	if ($killing~error = true)
		setvar $switchboard~message "Killing error - turning off kill mode.*"
		gosub :switchboard~switchboard
		setvar $killing~nokill true
	end
return

:checkShipForDefenderStatus
		setvar $shipname $player~SHIP_TYPE_LONG
		setVar $isFound FALSE
		setVar $s 1
		setVar $isDefender FALSE
		replacetext $shipname ";" "m"
		striptext $shipname "30m"
		striptext $shipname "31m"
		striptext $shipname "32m"
		striptext $shipname "33m"
		striptext $shipname "34m"
		striptext $shipname "35m"
		striptext $shipname "36m"
		striptext $shipname "37m"
		striptext $shipname "38m"
		striptext $shipname "39m"
		striptext $shipname "40m"
		striptext $shipname "41m"
		striptext $shipname "42m"
		striptext $shipname "43m"
		striptext $shipname "44m"
		striptext $shipname "45m"
		striptext $shipname "46m"
		striptext $shipname "47m"
		striptext $shipname "[0;30;47m"
		striptext $shipname "[32;40m"
		striptext $shipname "[0;"
		striptext $shipname "[1;"
		striptext $shipname "[0m"
		striptext $shipname "[1m"
		striptext $shipname #13
		striptext $shipname #27
		striptext $shipname ""
		striptext $shipname "["

		if ($ship~shipCounter <= 0)
			gosub :ship~loadShipInfo
		end
		while (($isFound = FALSE) AND ($s < $ship~shipCounter))
			striptext $ship~shipList[$s] "["
			trim $ship~shipList[$s]
			getwordpos $shipname $pos $ship~shipList[$s]
			#send "'["&$shipname&"]["&$ship~shipList[$s]&"]*"
			if ($pos > 0)
				#echo "*["&$shipname&"*][*"&$ship~shipList[$s]&"]*"
				setVar $isFound TRUE
				setVar $isDefender $ship~shipList[$s][8]
			end
			add $s 1
		end
return

:keep
	setVar $BOT~command "keep"
	setVar $BOT~user_command_line " keep 20000"
	setVar $BOT~parm1 20000
	setVar $BOT~parm2 ""
	setVar $BOT~parm3 ""
	setVar $BOT~parm4 ""
	setVar $BOT~parm5 ""
	setVar $BOT~parm6 ""
	saveVar $BOT~parm1
	saveVar $BOT~parm2
	saveVar $BOT~parm3
	saveVar $BOT~parm4
	saveVar $BOT~parm5
	saveVar $BOT~parm6
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\"&$bot~mombot_directory&"\commands\general\keep.cts"
	setEventTrigger		keepended		:keepended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\general\keep.cts"
	pause
	:keepended
return

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\combat\holokill\combat"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
include "source\bot_includes\player\addfigtodata\player"
include "source\bot_includes\player\getcourse\player"
include "source\bot_includes\player\findjumpsector\player"
include "source\bot_includes\combat\fastcitadelattack\combat"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\planet\landingsub\planet"
include "source\bot_includes\ship\getshipcapstats\ship"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\ship\loadshipinfo\ship"
include "source\module_includes\defender\navigate"
include "source\module_includes\defender\photon"
include "source\module_includes\defender\restock"
include "source\module_includes\defender\killing"
include "source\module_includes\defender\aliens"
include "source\module_includes\defender\sentinel"
include "source\module_includes\defender\prhunter"
include "source\bot_includes\external\htorp"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\external\movefig"
include "source\bot_includes\player\startcnsettings\player"
include "source\bot_includes\external\patp"
include "source\bot_includes\player\buy\player"
include "source\bot_includes\external\buyfig"
include "source\bot_includes\external\buyshield"
include "source\bot_includes\external\dep"
include "source\bot_includes\external\with"
include "source\bot_includes\grid\surround\grid"
include "source\bot_includes\planet\landonplanetentercitadel\planet"
include "source\bot_includes\external\dscan"
include "source\bot_includes\external\moveship"
include "source\bot_includes\external\xenter"
include "source\bot_includes\external\mow"
include "source\bot_includes\external\max"
include "source\bot_includes\external\pwarp"
include "source\bot_includes\external\scrub"
include "source\bot_includes\player\currentprompt\player"
include "source\bot_includes\sector\getautosectordata\sector"
include "source\bot_includes\sector\getsectordata\sector"
