	logging off
	gosub :BOT~loadVars
									

	setVar $FURB_HOLDS "33"
	setVar $FURB_SHIP "g"

	setVar $MAX_RED_BOTS 5
	setVar $MIN_RED_EXP 600
	setVar $MIN_RED_ALIGNMENT "-100"

	setVar $twoship FALSE
	getWordPos $bot~user_command_line $pos "twoship"
	if ($pos > 0)
		setVar $twoship TRUE
	end

	if ($twoship = TRUE)
		setVar $NUMBER_CASHING_SHIPS 2
	else
		setVar $NUMBER_CASHING_SHIPS 3
	end

	setArray $REDS $MAX_RED_BOTS $NUMBER_CASHING_SHIPS
	setArray $RED_TURNS $MAX_RED_BOTS
	setArray $RED_CURRENT_SHIP $MAX_RED_BOTS
	setArray $ORIGINAL_SHIP $MAX_RED_BOTS

	setArray $SHIPS $NUMBER_CASHING_SHIPS 3

	setVar $MAX_BLUE_BOTS 2
	setVar $MIN_BLUE_ALIGNMENT 1000
	setVar $MAX_BLUE_EXP 999
	setArray $BLUES $MAX_BLUE_BOTS


	 setVar $BOT~help[1] $BOT~tab&"Steal, Dump, Transport with multiple bots "
	 setVar $BOT~help[2] $BOT~tab&"Options: "
	 setVar $BOT~help[3] $BOT~tab&"         [ship1] - ship id of first cashing ship "
	 setVar $BOT~help[4] $BOT~tab&"         [ship2] - ship id of second cashing ship "
	 setVar $BOT~help[5] $BOT~tab&"         [ship3] - ship id of third cashing ship "
	 setVar $BOT~help[6] $BOT~tab&"       {planet1} - planet id of first planet"
	 setVar $BOT~help[7] $BOT~tab&"       {planet2} - planet id of second planet"
	 setVar $BOT~help[8] $BOT~tab&"       {planet3} - planet id of third planet"
	 setVar $BOT~help[9] $BOT~tab&"      {override} - won't stop if blue not fedsafe"
	setVar $BOT~help[10] $BOT~tab&"    {planetfuel} - will grab fuel from red planets"
	setVar $BOT~help[11] $BOT~tab&"       {twoship} - will use two ships to cash"
	setVar $BOT~help[12] $BOT~tab&"           {X:N} - furb ship letter and holds to buy"
	setVar $BOT~help[13] $BOT~tab&"          {swap} - do swap furb on planets"
	setVar $BOT~help[14] $BOT~tab&"                 - Uses EP Haggle if running in bot"
	setVar $BOT~help[15] $BOT~tab&"Usage: "
	setVar $BOT~help[16] $BOT~tab&"        >teamsdt 3 4 5"
	setVar $BOT~help[17] $BOT~tab&"        >teamsdt 3 4 5 11 12 13"
	setVar $BOT~help[18] $BOT~tab&"        >teamsdt 6 7 4 override"
	setVar $BOT~help[19] $BOT~tab&"Note: "
	setVar $BOT~help[20] $BOT~tab&"       Planet ids are only necessary when multiple planets exist"
	setVar $BOT~help[21] $BOT~tab&"       in sector or planet scanners are on ships.   "
	gosub :bot~helpfile



	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
		setVar $SWITCHBOARD~MESSAGE "Team SDT controller must be run from Command or Citadel prompt.*"
		gosub :SWITCHBOARD~SWITCHBOARD
		halt
	end

	setVar $BOT~script_title "Team SDT"
	gosub :BOT~banner

	send "'"&$SWITCHBOARD~BOT_NAME&" login*"
	waitOn "Corporate command "

	setVar $SWITCHBOARD~MESSAGE "This script assumes all red bots, blue bots, ships, and planets are placed correctly before this script is run.*"
	gosub :SWITCHBOARD~SWITCHBOARD


	setVar $SWITCHBOARD~MESSAGE "Doing roll call.*"
	gosub :SWITCHBOARD~SWITCHBOARD

	setVar $override FALSE
	getWordPos $bot~user_command_line $pos "override"
	if ($pos > 0)
		setVar $override TRUE
	end
	if ($bot~parm4 = "override")
		setVar $bot~parm4 "0"
	end
	setVar $planet~planetfuel FALSE
	getWordPos $bot~user_command_line $pos "planetfuel"
	if ($pos > 0)
		setVar $planet~planetfuel TRUE
		
	end
	
	setVar $swap FALSE
	getWordPos $bot~user_command_line $pos "swap"
	if ($pos > 0)
		setVar $swap TRUE
	end

	setVar $ephaggle 0
	gosub :player~isEpHaggle
	IF ($player~isEpHaggle)
		setVar $ephaggle 1
		setVar $SWITCHBOARD~message "Using EP HAGGLE!*"
		gosub :switchboard~switchboard
	END

	setvar $treasury ""
	getWordPos " "&$bot~user_command_line&" " $pos " treasury:"
	if ($pos > 0)
		getText " "&$bot~user_command_line&" " $treasury "treasury:" " "
		if ($treasury = "")
			setVar $SWITCHBOARD~message "Invalid treasury value!  Halting.*"
			gosub :switchboard~switchboard
			halt
		end
		replaceText $bot~user_command_line " treasury:"&$treasury " "
	end

	setVar $custom_furb FALSE
	getWordPos $bot~user_command_line $pos ":"
	if ($pos > 0)
		setVar $stuff $bot~user_command_line
		getWordPos $stuff $loc ":"
		cutText $stuff $info ($loc - 1) 99
		getWord $info $furbinfo 1
		replaceText $furbinfo ":" " "
		getword $furbinfo $FURB_SHIP 1
		getword $furbinfo $FURB_HOLDS 2
		
		echo "#" $FURB_SHIP "-" $FURB_HOLDS
		
	end

	
	isNumber $is_a_number $bot~parm1
	if (($is_a_number) and ($bot~parm1 <> ""))
		setVar $ship1 $bot~parm1
		setVar $SHIPS[1] $ship1
	else
		setVar $SWITCHBOARD~MESSAGE "Ship #1 number invalid.  Shutting down.*"
		gosub :SWITCHBOARD~SWITCHBOARD	
		halt	
	end

	isNumber $is_a_number $bot~parm2
	if (($is_a_number) and ($bot~parm2 <> ""))
		setVar $ship2 $bot~parm2
		setVar $SHIPS[2] $ship2
	else
		setVar $SWITCHBOARD~MESSAGE "Ship #2 number invalid.  Shutting down.*"
		gosub :SWITCHBOARD~SWITCHBOARD	
		halt	
	end

	isNumber $is_a_number4 $bot~parm4
	isNumber $is_a_number5 $bot~parm5
	isNumber $is_a_number6 $bot~parm6
	if ((($bot~parm4 <> "0") and ($is_a_number4 = true)) and (($bot~parm5 = "0") or ($is_a_number5 <> true)) and (($bot~parm6 = "0") or ($is_a_number6 <> true)))
		setvar $twoship true
	end
	if ($twoship = TRUE)
		isNumber $is_a_number $bot~parm3
		if ($is_a_number)
			setVar $SHIPS[1][2] $bot~parm3
		else
			setVar $SWITCHBOARD~MESSAGE "Planet #1 number invalid.  Shutting down.*"
			gosub :SWITCHBOARD~SWITCHBOARD	
			halt	
		end

		isNumber $is_a_number $bot~parm4
		if ($is_a_number) 
			setVar $SHIPS[2][2] $bot~parm4
		else
			setVar $SWITCHBOARD~MESSAGE "Planet #2 number invalid.  Shutting down.*"
			gosub :SWITCHBOARD~SWITCHBOARD	
			halt	
		end
	else
		isNumber $is_a_number $bot~parm3
		if (($is_a_number) and ($bot~parm3 <> ""))
			setVar $ship3 $bot~parm3
			if ($NUMBER_CASHING_SHIPS >= 3)
				setVar $SHIPS[3] $ship3
			end
		else
			setVar $SWITCHBOARD~MESSAGE "Ship #3 number invalid.  Shutting down.*"
			gosub :SWITCHBOARD~SWITCHBOARD	
			halt	
		end

		isNumber $is_a_number $bot~parm4

		if ($is_a_number)
			setVar $SHIPS[1][2] $bot~parm4
		else
			#setVar $SWITCHBOARD~MESSAGE "Planet #1 number invalid.  Shutting down.*"
			#gosub :SWITCHBOARD~SWITCHBOARD	
			#halt	
			setVar $SHIPS[1][2] ""
		end

		isNumber $is_a_number $bot~parm5
		if ($is_a_number) 
			setVar $SHIPS[2][2] $bot~parm5
		else
			#setVar $SWITCHBOARD~MESSAGE "Planet #2 number invalid.  Shutting down.*"
			#gosub :SWITCHBOARD~SWITCHBOARD	
			#halt	
			setVar $SHIPS[2][2] ""
		end

		isNumber $is_a_number $bot~parm6
		if ($is_a_number)
			if ($NUMBER_CASHING_SHIPS >= 3)
				setVar $SHIPS[3][2] $bot~parm6
			end
		else
			if ($NUMBER_CASHING_SHIPS >= 3)
				#setVar $SWITCHBOARD~MESSAGE "Planet #3 number invalid.  Shutting down.*"
				#gosub :SWITCHBOARD~SWITCHBOARD	
				#halt	
				setVar $SHIPS[3][2] ""
			end
			
		end
	end


	setVar $i 1
	setVar $roll_call_done FALSE
	setVar $red_count 0

	while (($i <= $MAX_RED_BOTS) AND ($roll_call_done = FALSE))
		send "'red"&$i&" callout*"
		setDelayTrigger delay :donered 3000
		setTextLineTrigger red :foundred "Team: red"&$i&" " 
		pause

		:toomanyred	
			setVar $SWITCHBOARD~MESSAGE "Too many bots responding to red"&$i&".  Please fix bot teams so each red is unique.*"
			gosub :SWITCHBOARD~SWITCHBOARD
			halt

		:foundred
			getWordPos CURRENTLINE $pos "Team: "
			cutText CURRENTLINE $line $pos 9999
			getWord $line $red_sector 4
			getWord $line $red_exp 6
			getWord $line $red_align 8
			getWord $line $red_credits 10
			getWord $line $red_ship 12
			getWord $line $red_turns 14

			getWordPos $red_align $pos "-"
			if (($pos <= 0) OR ($red_exp < $MIN_RED_EXP))
				setVar $SWITCHBOARD~MESSAGE "red"&$i&" does not have experience and alignment needed for stealing.  Stopping script.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			end
			if (($red_turns < 100) AND ($PLAYER~UNLIMITED_GAME <> TRUE))
				setVar $SWITCHBOARD~MESSAGE "red"&$i&" does not have enough turns for stealing.  Stopping script.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			end			
			setVar $REDS[$i] $red_ship
			setVar $RED_TURNS[$i] $red_turns
			setVar $RED_CURRENT_SHIP[$i] $red_ship
			setVar $ORIGINAL_SHIP[$i] $red_ship

			add $red_count 1
			setTextLineTrigger red :toomanyred "} - Team: red"&$i&" " 
			pause
		:donered
			killtrigger red
			if ($REDS[$i] = 0)
				setVar $roll_call_done TRUE
			end
			add $i 1
	end

	if ($red_count <= 1)
		setVar $SWITCHBOARD~MESSAGE "Found "&$red_count&" red. Not enough reds to run Team SDT.  Make sure red bots callin as red1, red2, etc.*"
		gosub :SWITCHBOARD~SWITCHBOARD
		halt
	end

	setVar $SWITCHBOARD~MESSAGE "Found "&$red_count&" red bots.*"
	gosub :SWITCHBOARD~SWITCHBOARD

	setVar $shipsinuse 0
	setVar $i 1
	while ($i <= $red_count)

		setVar $j 1
		while ($j <= $NUMBER_CASHING_SHIPS)
			if ($RED_CURRENT_SHIP[$i] = $SHIPS[$j])
				setVar $SWITCHBOARD~MESSAGE "Red "&$i&" please hop out of ship "&$SHIPS[$j]&" and into your sit ship.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				setVar $shipsinuse 1
				
			end
			add $j 1
		end
		add $i 1
	end
	if ($shipsinuse = 1)
		halt
	end

	setVar $i 1
	setVar $roll_call_done FALSE
	setVar $blue_count 0

	while (($i <= $MAX_BLUE_BOTS) AND ($roll_call_done = FALSE))
		send "'blue"&$i&" callout*"
		setDelayTrigger delay :doneblue 4000
		setTextLineTrigger blue :foundblue "Team: blue"&$i&" " 
		pause

		:toomanyblue
			setVar $SWITCHBOARD~MESSAGE "Too many bots responding to blue"&$i&".  Please fix bot teams so each blue is unique.*"
			gosub :SWITCHBOARD~SWITCHBOARD
			halt

		:foundblue
			getWordPos CURRENTLINE $pos "Team: "
			cutText CURRENTLINE $line $pos 9999
			getWord $line $blue_sector 4
			getWord $line $blue_exp 6
			getWord $line $blue_align 8
			getWord $line $blue_credits 10

			if ($blue_align < 1000)
				setVar $SWITCHBOARD~MESSAGE "blue"&$i&" does not have alignment needed for furbing.  Stopping script.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			end
#			if ($blue_sector <> $MAP~STARDOCK)
#				setVar $SWITCHBOARD~MESSAGE "blue"&$i&" is not at stardock ("&$MAP~STARDOCK&") for furbing.  Stopping script.*"
#				gosub :SWITCHBOARD~SWITCHBOARD
#				halt
#			end
			if ($blue_sector <> $map~stardock)
				setvar $swap true
			end
			if (($blue_exp > $MAX_BLUE_EXP) AND ($override = FALSE))
				setVar $SWITCHBOARD~MESSAGE "blue"&$i&" has too much experience to be fed safe.  Stopping script.  If you want to continue anyway, use the override option.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			end
			setVar $BLUES[$i] $blue_sector
			add $blue_count 1
			send "'blue"&$i&" stop ephaggle*"
			setDelayTrigger stopep :stopep 1000 
			pause
			:stopep
				killtrigger stopep
			
			send "'blue"&$i&" login*"
			setDelayTrigger login :login 1000 
			pause
			:login
				killtrigger login
			setTextLineTrigger blue :toomanyblue "} - Team: blue"&$i&" " 
			pause
		:doneblue
			killtrigger blue
			if ($BLUES[$i] = 0)
				setVar $roll_call_done TRUE
			end
			add $i 1
	end

	if ($blue_count < 1)
		setVar $SWITCHBOARD~MESSAGE "Found "&$blue_count&" blue. Not enough blue to run Team SDT.  Make sure blue bots callin as blue1, blue2, etc.*"
		gosub :SWITCHBOARD~SWITCHBOARD
		halt
	end

	setVar $SWITCHBOARD~MESSAGE "Found "&$blue_count&" blue bot.*"
	gosub :SWITCHBOARD~SWITCHBOARD




	send "czq"
	waitOn "-----------------------------------------------------------------------------"
	settextlinetrigger     shipnumber     :getshipnumber "Corp"
	settextlinetrigger     doneships      :check_bot_status "Computer command ["
	pause
     
	:getshipnumber
		getword CURRENTLINE $shiptest 1
		getword CURRENTLINE $shiplocation 2
		isNumber $is_a_number $shiplocation
		if ($is_a_number)
			setVar $i 1
			while ($i <= $NUMBER_CASHING_SHIPS)
				if ($SHIPS[$i] = $shiptest)
					setVar $SHIPS[$i][1] $shiplocation
					setVar $SHIPS[$i][3] TRUE
				end
				add $i 1
			end
		end
		settextlinetrigger     shipnumber     :getshipnumber "Corp"
		pause
		
	:check_bot_status
		killtrigger shipnumber
		setVar $invalid FALSE
		setVar $i 1
		while ($i <= $NUMBER_CASHING_SHIPS)
			if ($SHIPS[$i][3] <> TRUE)
				setVar $invalid TRUE 
			end
			add $i 1
		end
		if ($invalid = FALSE)
			setVar $SWITCHBOARD~MESSAGE "Red ships all valid.*"
		else
			setVar $i 1
			while ($i <= $NUMBER_CASHING_SHIPS)
				if ($SHIPS[$i][3] <> TRUE)
					setVar $SWITCHBOARD~MESSAGE "Ship: " & $SHIPS[$i] & " not avaliable!  HALTING*"
					gosub :SWITCHBOARD~SWITCHBOARD
					halt
				end
				add $i 1
			end
		end
		gosub :SWITCHBOARD~SWITCHBOARD


		setVar $i 1
		while ($i <= $red_count)
			setVar $j 1
			while ($j <= $NUMBER_CASHING_SHIPS)

				setVar $is_busted FALSE
				setVar $is_fake FALSE

				send "'red"&$i&" param "&$SHIPS[$j][1]&"*"
				waitfor "Displaying sector parameters for"
				
				:checkbusts
				setDelayTrigger delay :donebust 2000
				setTextLineTrigger redbusted :redbusted " BUSTED: "
				setTextLineTrigger redfakebusted :redfakebusted "FAKEBUST: " 
				pause

				
				:redbusted
					killalltriggers
					getWordPos CURRENTLINE $pos "BUSTED: "
					cutText CURRENTLINE $line $pos 9999
					getWord $line $is_busted 2
					goto :checkbusts
				:redfakebusted 
					killalltriggers
					getWordPos CURRENTLINE $pos "FAKEBUST: "
					cutText CURRENTLINE $line $pos 9999
					getWord $line $is_fake 2
					
				:donebust
					killalltriggers
					if ($is_busted = TRUE)
						setVar $REDS[$i][$j] "B"
					else
						if ($is_fake = TRUE)
							setVar $REDS[$i][$j] "F"					
						else
							setVar $REDS[$i][$j] FALSE					
						end
					end
				add $j 1
			end
			send "'red"&$i&" stop ephaggle*"
			setDelayTrigger stopep2 :stopep2 1000 
			pause
			:stopep2
			send "'red"&$i&" watcher*"
			setDelayTrigger watchstop :watchstop 1000 
			pause
			:watchstop

			add $i 1
		end
		if ($SWITCHBOARD~SELF_COMMAND = FALSE)
			setVar $SWITCHBOARD~SELF_COMMAND 2
		end

		setVar $keep_going TRUE
		setArray $orders 2 3
		while ($keep_going = TRUE)
			setVar $SWITCHBOARD~MESSAGE "Bust matrix so far:*"
			setVar $i 1
			while ($i <= $red_count)
				setVar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"                RED"&$i&": "
				setVar $j 1
				while ($j <= $NUMBER_CASHING_SHIPS)
					setVar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"["&$REDS[$i][$j]&"]"
					add $j 1
				end
				setVar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"*"
				add $i 1
			end
			gosub :SWITCHBOARD~SWITCHBOARD

			gosub :find_ports
			if ($found_thief = FALSE)
				setVar $i 1
				while ($i <= $red_count)
					setVar $j 1
					while ($j <= $NUMBER_CASHING_SHIPS)
						if ($RED_CURRENT_SHIP[$i] = $SHIPS[$j])
							setVar $red_id $i
							setVar $xport_ship $ORIGINAL_SHIP[$i]
							setVar $RED_CURRENT_SHIP[$i] $xport_ship
							gosub :x
						end
						add $j 1
					end
					add $i 1
				end
				gosub :find_ports
			end
			if ($found_thief = FALSE)
				setVar $SWITCHBOARD~MESSAGE "No possible safe choices in the bust matrix.  Stopping..*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			end
			if ($orders[1][2] = "0")
				setVar $orders[1][2] ""
				setVar $orders[2][2] ""
			end
			if ($treasury <> "")
				send "'red"&$orders[1]&" lift *"
			end
			if ($ephaggle = 0)
				send "'red"&$orders[1]&" sdt "&$orders[1][1]&" "&$orders[2][1]&" "&$orders[1][2]&" "&$orders[2][2]&" noavoid*"
			else
				send "'red"&$orders[1]&" sdt "&$orders[1][1]&" "&$orders[2][1]&" "&$orders[1][2]&" "&$orders[2][2]&" noavoid ep*"
			end
			:repeatorders
			settextlinetrigger badship :wrong "That is not an available ship, Script Halting."
			settextlinetrigger lraship :lraship "last rob attempt is this sector!"
			settextlinetrigger noexp :noexp "You need more experience to SDT!!!"
			settextlinetrigger nowar :nowar "This sector has no warps, maybe you need to scan it first"
			settextlinetrigger auto :auto "Detected SWATH Autohaggle"
			settextlinetrigger lowturns :lowturns "NO Bust, stopping because I'm down to"
			settextlinetrigger fake :fake "FAKE"
			settextlinetrigger run :waitforredbust "Busted in ship"
			settextlinetrigger emergencystop :emergencystop "STOP"
			pause
			:emergencystop
				killalltriggers
				cutText CURRENTLINE&"   " $spoof 1 1
				if (($spoof = "R") or ($spoof = "'"))
					
					send "'red"&$orders[1]&" STOPALL*"
					waitfor " All non-system scripts and modules killed, and"
					
					send "'red"&$orders[1]&" x "& $ORIGINAL_SHIP[$orders[1]] &"*"
					settexttrigger emergency :emergency  "- Xport complete."
					pause
					:emergency
					killalltriggers
						setVar $SWITCHBOARD~MESSAGE "Emergency Stop - Do something useful?*"
						gosub :SWITCHBOARD~SWITCHBOARD
						halt
				else
					goto :repeatorders
				end
			:wrong
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "Ships got messed up somehow.  Better check it out!  Halting.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			:noexp
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "One of the cashers lost too much experience.  Halting.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			:nowar
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "One of the cashers has no knowledge of the sector they are in.  That's very odd. Halting.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			:auto
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "One of the cashers has SWATH haggle on. Halting.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			:lowturns
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "One of the cashers has run out of usable turns. Halting.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt

			:fake
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "Red Fake Busted.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				setVar $SWITCHBOARD~MESSAGE "Fake Busts don't clear ports. .*"
				gosub :SWITCHBOARD~SWITCHBOARD
				goto :deliverfurb				
				halt
			:lraship
				killalltriggers
				if ($ordersrepeat = 1)
					setVar $SWITCHBOARD~MESSAGE "Orders repeated twice, fail fail fail.*"
					gosub :SWITCHBOARD~SWITCHBOARD
					halt
				end
				setVar $ordersrepeat 1
				setVar $SWITCHBOARD~MESSAGE "Ok, lets serve up the ports oppisite and try again.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				send "'red"&$orders[1]&" SDT "&$orders[2][1]&" "&$orders[1][1]&" "&$orders[2][2]&" "&$orders[1][2]&" noavoid*"
	
				goto :repeatorders
			:waitforredbust
				getWordPos CURRENTLINE $pos "Busted"
				add $pos 5
				cutText CURRENTLINE $line $pos 9999
				getWord $line $bust_ship 4
				getWord $line $bust_turns 10
				striptext $bust_ship ","
				setVar $i 1
				while ($i <= $red_count)
					if $bust_ship = $orders[1][1]
						#setvar $xport_ship $orders[2][1]
						setvar $xport_ship $ORIGINAL_SHIP[$orders[1]]
						setvar $bust_planet $orders[1][2]
						setVar $j $orders[1][3]
						if ($REDS[$i] = $REDS[$orders[1]])
							setVar $red_id $i
							setVar $REDS[$i][$j] "B"
							setVar $original_ship $REDS[$i]
							setVar $RED_TURNS[$i] $bust_turns
						else
							setVar $REDS[$i][$j] FALSE
						end
					else
						#setvar $xport_ship $orders[1][1]
						setvar $xport_ship $ORIGINAL_SHIP[$orders[1]]
						setvar $bust_planet $orders[2][2]
						setVar $j $orders[2][3]
						if ($REDS[$i] = $REDS[$orders[1]])
							setVar $red_id $i
							setVar $REDS[$i][$j] "B"
							setVar $original_ship $REDS[$i]
							setVar $RED_TURNS[$i] $bust_turns
						else
							setVar $REDS[$i][$j] FALSE
						end
					end
					add $i 1
				end
				setvar $taken_ship $xport_ship
				setVar $red_id $orders[1]
				setVar $RED_CURRENT_SHIP[$red_id] $taken_ship
				gosub :find_ports
				if ($found_thief = FALSE)
					setVar $taken_ship $original_ship
					setVar $xport_ship $original_ship
					setVar $RED_CURRENT_SHIP[$red_id] $taken_ship
				end
				setdelaytrigger setup :setupfurber 2000
				pause

			:setupfurber
				goto :deliverfurb
			
			:furb1
	
				killalltriggers
				setdelaytrigger xport :xport 5000
				settexttrigger noOre :noore "Ore at port critically low!"
				pause
				:noore
					killalltriggers
					
					send "'red"&$red_id&" mac o1100^mq*"
					setdelaytrigger pdelay :pdelay 500
					pause
					:pdelay
					killtrigger pdelay
					send "'blue1 mac pt^m^m^m^m*"
					setdelaytrigger furb2 :furb2 8000
					pause
				:furb2
					killalltriggers
					


			:xport
				send "'red"&$red_id&" x "&$xport_ship&"*"
				settexttrigger xport :donexport  "- Xport complete."
				pause

			:donexport
				if ($treasury <> "")
					send "'red" $red_id " land " $treasury "*"
					waiton "In Cit - Planet "&$treasury
					settexttrigger deposit :donetreasury " credits deposited into citadel"
					settexttrigger withdrawal :donetreasury " credits taken from citadel"
					settexttrigger noneed :donetreasury "- No transaction required"
					send "'red"&$red_id&" keep 500000*"
					pause
					:donetreasury
				end
				killalltriggers
				
				#send "'Quick Nap before resuming!*"
				setdelaytrigger naptime :naptime 500
				pause
				:naptime
				killalltriggers
				#send "'Wakey Wakey!*"

		end
halt

:find_ports 
	setVar $i 1
	setVar $found_thief FALSE
	setVar $found_thief_turns 0
	setVar $red_taken_ships " "
	while ($i <= $red_count)
		setVar $red_taken_ships $red_taken_ships&" "&$RED_CURRENT_SHIP[$i]&" "
		add $i 1
	end
	setVar $i 1
	while ($i <= $red_count)
		setVar $j 1
		setVar $found_ports 0
		while (($j <= $NUMBER_CASHING_SHIPS) AND ($found_ports < 2))
			getWordPos $red_taken_ships $pos " "&$SHIPS[$j]&" "
			if (($REDS[$i][$j] = FALSE) AND ($pos <= 0))
				add $found_ports 1
				setVar $temp_orders[$found_ports] $i
				setVar $temp_orders[$found_ports][1] $SHIPS[$j]
				setVar $temp_orders[$found_ports][2] $SHIPS[$j][2]
				setVar $temp_orders[$found_ports][3] $j
			end
			add $j 1
		end
		if ($found_ports >= 2)
			if ($RED_TURNS[$i] > $found_thief_turns)
				setVar $found_thief TRUE
				setVar $found_thief_turns $RED_TURNS[$i]
				setVar $orders[1] $temp_orders[1]
				setVar $orders[1][1] $temp_orders[1][1]
				setVar $orders[1][2] $temp_orders[1][2]
				setVar $orders[1][3] $temp_orders[1][3]
				setVar $orders[2][1] $temp_orders[2][1]
				setVar $orders[2][2] $temp_orders[2][2]
				setVar $orders[2][3] $temp_orders[2][3]
			end
		end
		add $i 1
	end
return


:x
	send "'red"&$red_id&" x "&$xport_ship&"*"
	settexttrigger xport :donex  "- Xport complete."
	pause

	:donex
		killalltriggers
return

:deliverfurb
	if ($swap)
		send "'red"&$red_id&" x "&$xport_ship&"*"
		settexttrigger xport :now_do_xport_furb  "- Xport complete."
		pause
		:now_do_xport_furb
			send "'blue1 xfurb "&$bust_ship&" "&$FURB_HOLDS&" *"
			waiton "xfurb complete"
			goto :done
	end
	if (($bust_planet <> "") AND ($bust_planet <> "0") AND ($planet~planetfuel = TRUE))
		if ($treasury = "")
			send "'blue1 furb "&$bust_ship&" "&$FURB_HOLDS&" "&$FURB_SHIP&" planet:"&$bust_planet&" blow:red"&$red_id&" *"
		else
			send "'blue1 furb "&$bust_ship&" "&$FURB_HOLDS&" "&$FURB_SHIP&" planet:"&$bust_planet&" blow:red"&$red_id&" nodecash *"
		end
	else
		if ($treasury = "")
			send "'blue1 furb "&$bust_ship&" "&$FURB_HOLDS&" "&$FURB_SHIP&" blow:red"&$red_id&" *"
		else
			send "'blue1 furb "&$bust_ship&" "&$FURB_HOLDS&" "&$FURB_SHIP&" blow:red"&$red_id&" nodecash *"
		end
	end
	settexttrigger nofig :nofig "No fighter down at that ship number, drop a fig."
	settexttrigger furb1 :furb1 "- Furb delivered"
	pause

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\isephaggle\player"
