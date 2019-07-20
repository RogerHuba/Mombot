	reqRecording
	logging off

	gosub :BOT~loadVars
	loadVar $ptradesetting

	setVar $BOT~help[1]   $BOT~tab&"- stripall {set} {clear} {list} {f} {o} {e} {fig}                                " 
	setVar $BOT~help[2]   $BOT~tab&"    Visits sectors in list and strips the planets there.     " 
	setVar $BOT~help[3]   $BOT~tab&"       - default will visit all planets on the tl list       " 
	setVar $BOT~help[4]   $BOT~tab&"                                                            " 
	setVar $BOT~help[5]   $BOT~tab&"    [set] {sector1} {sector2} {...} {sectorx}               "
	setVar $BOT~help[6]   $BOT~tab&"       - set puts sectors in the order you enter into a file" 
	setVar $BOT~help[7]   $BOT~tab&"    [clear]                                                 " 
	setVar $BOT~help[8]   $BOT~tab&"       - clear deletes the farm file                        " 
	setVar $BOT~help[9]   $BOT~tab&"    [list]                                                  " 
	setVar $BOT~help[10]  $BOT~tab&"       - show lists of all sectors in the farm file in order" 
	setVar $BOT~help[11]  $BOT~tab&"       " 
	setVar $BOT~help[12]  $BOT~tab&"    {personal}   " 
	setVar $BOT~help[13]  $BOT~tab&"       - goes to all personal planets instead of corp" 
	setVar $BOT~help[14]  $BOT~tab&"       " 
	setVar $BOT~help[15]  $BOT~tab&"   {f} - strips fuel ore" 
	setVar $BOT~help[16]  $BOT~tab&"   {o} - strips organics" 
	setVar $BOT~help[17]  $BOT~tab&"   {e} - strips equipment" 
	setVar $BOT~help[18]  $BOT~tab&"   {fig} - strips fighters" 
	setVar $BOT~help[19]  $BOT~tab&"       - default is all" 
	gosub :bot~helpfile




	setVar $STRIPPER_FILE "_"&GAMENAME&"_PlanetStripper.list"

	getWordPos $bot~user_command_line $pos "silent" 
	if ($pos > 0)
		setVar $silent TRUE
	else
		setVar $silent FALSE
	end
	getWordPos $bot~parm1 $pos "clear" 
	if ($pos > 0)
		delete $STRIPPER_FILE
		send "'{" $switchboard~bot_name "} - Bot Stripping File has been deleted.*"
		halt
	end

	getWordPos " "&$bot~user_command_line&" " $pos " personal " 
	if ($pos > 0)
		setVar $personal TRUE
	end
	getWordPos " "&$bot~user_command_line&" " $pos " f " 
	if ($pos > 0)
		setVar $emptyFuel TRUE
	end
	getWordPos " "&$bot~user_command_line&" " $pos " o " 
	if ($pos > 0)
		setVar $emptyOrganics TRUE
	end
	getWordPos " "&$bot~user_command_line&" " $pos  " e " 
	if ($pos > 0)
		setVar $emptyEquipment TRUE
	end
	getWordPos " "&$bot~user_command_line&" " $pos " fig" 
	if ($pos > 0)
		setVar $emptyFighters TRUE
	end

	if (($emptyFuel = false) and ($emptyOrganics = false) and ($emptyEquipment = false) and ($emptyFighters = false))	
		setVar $emptyFuel TRUE
		setVar $emptyOrganics TRUE
		setVar $emptyEquipment TRUE
		setVar $emptyFighters TRUE
	end
	getWordPos $bot~parm1 $pos "list" 
	if ($pos > 0)
		fileExists $test $STRIPPER_FILE
		if ($test)
			readToArray $STRIPPER_FILE $sector 
			setVar $i 1
			setVar $list_output ""
			while ($i < $sector)
				setVar $list_output $list_output&$sector[$i]&","
				add $i 1
			end
			setVar $list_output $list_output&$sector[$i]
			send "'*{" $switchboard~bot_name "} - Planet Stripping List (In traveling order) *"&$list_output&"**"
		else
			send "'{" $switchboard~bot_name "} - No Planet Stripping File to list from.*"
		end
		halt
	end
	getWordPos $bot~parm1 $pos "set"
	if ($pos > 0)
		setVar $i 2
		getWord $bot~user_command_line $check $i "%%%"
		while ($check <> "%%%")
			isNumber $test $check
			if ($test)
				if ($check > 0) AND ($check <= SECTORS)
					write $STRIPPER_FILE $check
				end
			end
			add $i 1
			getWord $bot~user_command_line $check $i "%%%"
		end
		send "'{" $switchboard~bot_name "} - "&($i-2)&" Sectors added to Bot Planet Stripping File.*"
		halt
	end
	setVar $i 1
	setArray $planet~planets 3000
	gosub :player~quikstats
	if ($player~planet_scanner = "No")
	        send "'{" $switchboard~bot_name "} - Planet Farmer must be run with a planet scanner.*" 
		halt
	end
	if ($player~current_prompt <> "Citadel")
	        send "'{" $switchboard~bot_name "} - Planet Farmer must be run from the Citadel Prompt.*" 
		halt
	end
	fileExists $test $STRIPPER_FILE
	if ($test)
		send "'{" $switchboard~bot_name "} - Loading Planet List From Planet Stripping File...*"
		readToArray $STRIPPER_FILE $sector 
	else
		setVar $sector SECTORS
		setArray $sector SECTORS
		send "'{" $switchboard~bot_name "} - No Planet Stripping File, Loading Planet List...*"
		gosub :get_tl_list
	end

	send "'{" $switchboard~bot_name "} - Planet List Loaded, starting the Planet Stripping!*"	
	gosub :player~quikstats
	setvar $home $player~current_sector
	gosub :planet_info

:start
	killalltriggers
	goto :move_the_planet

:get_tl_list
	setVar $sectorCount 0
	killalltriggers
	gosub :player~setconnectiontriggers
	setTextLineTrigger sectorGrabber :sector_planet_line "Class "
	setTextLineTrigger sectorbeDone :sector_done "======   ============"
	if ($personal = TRUE)
		send "cyq"
	else
		send "xlq"
	end
	pause
	:sector_planet_line
		killalltriggers
		add $sectorCount 1
		getWord CURRENTLINE $testsector 1
		setVar $sector[$sectorCount] $testsector
		gosub :player~setconnectiontriggers
		setTextLineTrigger getLine2 :sector_planet_line "Class"
		setTextLineTrigger getEnd :sector_done "======   ============"
		pause
	:sector_done
	send "@"
	setVar $sector $sectorCount
	gosub :player~setconnectiontriggers
	waitOn "Average Interval Lag:"

return


	

:planet_info
	send "qd"
	gosub :player~setconnectiontriggers
	waitOn "Planet #"
	getWord CURRENTLINE $planet~planetToFill 2
	stripText $planet~planetToFill "#"
	send "snl1*snl2*snl3*tnl1*tnl2*tnl3*  q  j  y  l "  $planet~planetToFill "*  c"
	return

:move_the_planet
	setVar $i 1
	
:inac
:tryAgain
	while ($i <= $sector)
		while (($sector[$i] <= 0) AND ($i <= $sector))
			add $i 1
			if ($i > $sector)
				goto :end
			end
		end
		
		send "p "&$sector[$i]&"  *ys* "
		gosub :player~setconnectiontriggers
		settextlinetrigger warp_it :warp_it "All Systems Ready, shall we engage?"
		settextlinetrigger no_warp :no_warp "You do not have any fighters in Sector"
		setTextLineTrigger alreadythere :warp_it "You are already in that sector!"
		pause
		:no_warp
			killalltriggers
			add $i 1
			goto :tryAgain
		:warp_it
			killalltriggers
			gosub :count_planets
			gosub :stripallplanets
			if ($silent <> TRUE)
				send "'{" $switchboard~bot_name "} - Done Planet Stripping sector " $sector[$i] ".*"
			end
			send "q"
			gosub :getPlanetInfo
			send "c"
			add $i 1
			if (($planet~planetorg > ($planet~planetorgmax-1000)) AND ($planet~planetequip > ($planet~planetequipmax - 1000)))
				setVar $planet~planetIsFull TRUE
				goto :end
			end 
	end
	goto :end
:count_planets
	gosub :player~quikstats
	send "q  q  q  z  n  *|l"
	gosub :player~setconnectiontriggers
	waitOn "Registry# and Planet Name"
	setVar $planet~planetCount 0
	killalltriggers
	gosub :player~setconnectiontriggers
	setTextLineTrigger planetGrabber :planetline "   <"
	setTextLineTrigger beDone :done "Land on which planet "
	setTextLineTrigger noplanets :done "You can create one with a Genesis Torpedo."
	send "q* |"
	pause
	:planetline
		killalltriggers
		getWordPos CURRENTLINE $pos "<<<< SHIELDED"
		if ($pos <= 0)
			setVar $line CURRENTLINE
			replacetext $line "<" " "
			replacetext $line ">" " "
			striptext $line ","
			add $planet~planetCount 1
			getWord $line $planet~planets[$planet~planetCount] 1
		end
		gosub :player~setconnectiontriggers
		setTextLineTrigger getLine2 :planetline "   <"
		setTextLineTrigger getEnd :done "Land on which planet "
		pause
	:done
	killalltriggers
return

:stripallplanets
setVar $j 1
	send "q q * * jy * "
	while ($j <= $planet~planetCount)
		if ($planet~planetToFill <> $planet~planets[$j])
			:tryFuel
				killAllTriggers
				if ($emptyFuel)
					send "l j " & #8 & #8 & $planet~planets[$j]&"* * "
					setTextTrigger noplanet :doneWithThisPlanet "That planet is not in this sector."				
					setTextTrigger planethere :continueFuel "Planet command (?=help)"
					pause
					:continueFuel
					killalltriggers
					send "tnt1*q l "&$planet~planetToFill&"* tnl1*q "
					gosub :player~setconnectiontriggers
					setTextTrigger fuelSuccess :tryFuel "You load the "				
					setTextTrigger fuelEmpty :emptyFuel "There aren't that many "
					setTextTrigger fuelFull :emptyFuel "They don't have room for that many "
					pause
					:emptyFuel
						send "l "&$planet~planets[$j]&"* tnl1*q jy "
						send "@"
						waitOn "Average Interval Lag:"
				end
			:tryOrganics
				killAllTriggers
				if ($emptyOrganics)
					send "l "&$planet~planets[$j]&"* tnt2*q l "&$planet~planetToFill&"* tnl2*q "
					gosub :player~setconnectiontriggers
					setTextTrigger success :tryOrganics "You load the "
					setTextTrigger emptyEmpty :emptyOrganics "There aren't that many "
					setTextTrigger fullFill :emptyOrganics "They don't have room for that many "
					pause
					:emptyOrganics
						send "l "&$planet~planets[$j]&"* tnl2*q jy "
						send "@"
						waitOn "Average Interval Lag:"
				end
			:tryEquipment
				killAllTriggers
				if ($emptyEquipment)
					send "l "&$planet~planets[$j]&"* tnt3*q l "&$planet~planetToFill&"* tnl3*q "
					gosub :player~setconnectiontriggers
					setTextTrigger success :tryEquipment "You load the "
					setTextTrigger emptyEmpty :emptyEquipment "There aren't that many "
					setTextTrigger fullFill :emptyEquipment "They don't have room for that many "
					pause
					:emptyEquipment
						send "l "&$planet~planets[$j]&"* tnl3*q jy "
						send "@"
						waitOn "Average Interval Lag:"
				end
			
			:tryFuelColonists
				killAllTriggers
				if ($emptyFuelColonists)
					send "l "&$planet~planets[$j]&"* snt1*q l "&$planet~planetToFill&"* snl"&$coloType&"*q "
					gosub :player~setconnectiontriggers
					setTextTrigger success :tryFuelColonists "The Colonists disembark to "
					setTextTrigger emptyEmpty :switchFuel "There isn't room on the planet"
					setTextTrigger fullFill :tryOrganicColonists "They don't have room for that many "
					setTextTrigger empty :tryOrganicColonists  "There aren't that many on the planet!"
					pause
					:switchFuel
						killAllTriggers
						add $coloType 1
						if ($coloType >= 4)
							goto :doneWithThisPlanet
						end
						goto :tryFuelColonists
				end
			:tryOrganicColonists
				killAllTriggers
				if ($emptyOrganicColonists)
					send "l "&$planet~planets[$j]&"* snt2*q l "&$planet~planetToFill&"* snl"&$coloType&"*q "
					gosub :player~setconnectiontriggers
					setTextTrigger success :tryOrganicColonists "The Colonists disembark to "
					setTextTrigger emptyEmpty :switchOrganics "There isn't room on the planet"
					setTextTrigger fullFill :tryEquipmentColonists "They don't have room for that many "
					setTextTrigger empty :tryEquipmentColonists "There aren't that many on the planet!"
					pause
					:switchOrganics
						killAllTriggers
						add $coloType 1
						if ($coloType >= 4)
							goto :doneWithThisPlanet
						end
						goto :tryOrganicColonists
				end
			:tryEquipmentColonists
				killAllTriggers
				if ($emptyEquipmentColonists)
					send "l "&$planet~planets[$j]&"* snt3*q l "&$planet~planetToFill&"* snl"&$coloType&"*q "
					gosub :player~setconnectiontriggers
					setTextTrigger success :tryEquipmentColonists "The Colonists disembark to "
					setTextTrigger emptyEmpty :switchEquipment "There isn't room on the planet"
					setTextTrigger fullFill :tryFighters "They don't have room for that many "
					setTextTrigger empty :tryFighters "There aren't that many on the planet!"
					pause
					:switchEquipment
						killAllTriggers
						add $coloType 1
						if ($coloType >= 4)
							goto :doneWithThisPlanet
						end
						goto :tryFighters
				end
				
			:tryFighters
				killAllTriggers
				if ($emptyFighters)
					send "l "&$planet~planets[$j]&"* m***q l "&$planet~planetToFill&"* m*l* q "
					gosub :player~setconnectiontriggers
					WaitOn "Do you wish to (L)eave or (T)ake Fighters? [T]"
					waitOn " Max) ["
					getWord CURRENTLINE $figsToGrab 9
					stripText $figsToGrab "("
					if ($figsToGrab < 100)
						goto :doneWithThisPlanet	
					end
					goto :tryFighters
				end
			:doneWithThisPlanet
			killAllTriggers
		end
			
		add $j 1
	end
	send "l "&$planet~planetToFill&"* c"
return	
:end
killalltriggers
send "p "&$home&"  *ys* "
if ($planet~planetIsFull)
	send "'{" $switchboard~bot_name "} - Planet Stripping Planet is full.  Ready to sell off the product!*"
else
	send "'{" $switchboard~bot_name "} - Planet Stripping run is complete.*"
end
gosub :player~quikstats
if ($player~current_sector <> $home)
	send "'{" $switchboard~bot_name "} - Could not make it back to starting sector!*"
end
halt



