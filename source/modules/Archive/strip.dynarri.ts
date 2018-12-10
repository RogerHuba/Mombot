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

# -------------------------------------------------------------------
# Dnyarri's Planet Vacuum. A 2-pass sector stripper with a handful
# of options for moving products, colonists, and fighters from
# multiple source planets to a destination planet. Handles colo
# overloads and other various problems that can arise. Has a turn 
# limit for turn limited games.
#
# More scripts and info at http://www.navhaz.com
# -------------------------------------------------------------------

# Promptify
send #145
waitFor #145
setVar $currentline CURRENTLINE
stripText $currentline #8
stripText $currentline #145
getWord $currentline $prompt 1
if ($prompt <> "Citadel") AND ($prompt <> "Planet")
   send "'{" $bot_name "} - You must be at the Citadel or Planet prompt for this to run!*"
   halt
end
gosub :do_quickstats

# -------------------------------------------------------------------
	isNumber $test $parm1
	if (($test = FALSE) AND ($parm1 <> "all"))
		send "'{" $bot_name "} - Invalid planet. Please enter a planet number or 'all'.*"
		halt
	else
		if ($parm1 = "all")
			setVar $dpv_planet_list "ALL"
		else
			setVar $dpv_planet_list $parm1
		end
		
	end
	if ($parm2 = 0)
		setVar $dpv_move_ore "Yes"
		setVar $dpv_move_org "Yes"
		setVar $dpv_move_equ "Yes"
		setVar $dpv_move_ore_cols "Yes"
		setVar $dpv_move_org_cols "Yes"
		setVar $dpv_move_equ_cols "Yes"
		setVar $dpv_move_figs "Yes"
	else
		getWordPos " "&$user_command_line&" " $pos " f "
		if ($pos > 0)
		     setVar $dpv_move_ore "Yes"
		else
		     setVar $dpv_move_ore "No"
		end
		getWordPos " "&$user_command_line&" " $pos " o "
		if ($pos > 0)
		     setVar $dpv_move_org "Yes"
		else
		     setVar $dpv_move_org "No"
		end
		getWordPos " "&$user_command_line&" " $pos " e "
		if ($pos > 0)
			setVar $dpv_move_equ "Yes"
		else
			setVar $dpv_move_equ "No"
		end
		
		getWordPos " "&$user_command_line&" " $pos " fc "
		if ($pos > 0)
			setVar $dpv_move_ore_cols "Yes"
		else
			setVar $dpv_move_ore_cols "No"
		end
		getWordPos " "&$user_command_line&" " $pos " oc "
		if ($pos > 0)
			setVar $dpv_move_org_cols "Yes"
		else
			setVar $dpv_move_org_cols "No"
		end
		getWordPos " "&$user_command_line&" " $pos " ec "
		if ($pos > 0)
			setVar $dpv_move_equ_cols "Yes"
		else
			setVar $dpv_move_equ_cols "No"
		end
		getWordPos " "&$user_command_line&" " $pos " fig"
		if ($pos > 0)
			setVar $dpv_move_figs "Yes"
		else
			setVar $dpv_move_figs "Yes"
		end
	end

if ($unlimitedGame)
	setVar $dpv_turns_avail 0
else
    	if (($quickstats[TURNS]-$bot_turn_limit) <= 0)
		send "'{" $bot_name "} - You are already below or at your turn limit for this bot!*"
		halt
	end
	setVar $dpv_turns_avail ($quickstats[TURNS]-$bot_turn_limit)
end

# -------------------------------------------------------------------
:start_er_up
# -------------------------------------------------------------------

# Init some vars
setVar $turns_spent 0

# Send banner
send "'{" $bot_name "} - Dnyarri's Planet Vacuum - Powerrrrrring up!*"

# Get this planet number
if ($prompt = "Citadel")
   send " q d"
   waitFor "Planet #"
   getWord CURRENTLINE $this_planet 2
   stripText $this_planet "#"
   waitFor "Planet command"
elseif ($prompt = "Planet")
   send "d"
   waitFor "Planet #"
   getWord CURRENTLINE $this_planet 2
   stripText $this_planet "#"
   waitFor "Planet command"
end

# Get my holds
gosub :do_quickstats
setVar $my_holds $quickstats[HLDS]

# Get fig capacity
send " q c ;q "
waitFor "Max Fighters:"
setVar $line CURRENTLINE
replaceText $line ":" " "
getWord $line $my_fig_capacity 7
stripText $my_fig_capacity ","

# Prep the planet list
upperCase $dpv_planet_list
replaceText $dpv_planet_list "," " "
if ($dpv_planet_list = "ALL")
   gosub :get_planet_nums
else
   setVar $word_idx 0
   setVar $count    0
   setVar $planet_list $dpv_planet_list & " %!%!%"
   :planet_list_loop
   add $word_idx 1
   getWord $planet_list $test $word_idx
   if ($test = "%!%!%")
        goto :end_of_planet_list_loop
   end
   isNumber $num $test
   if ($num > 0)
        if ($test > 0)
             add $count 1
             setVar $list[$count] $test
        end
   end
   goto :planet_list_loop
   :end_of_planet_list_loop
end

# Re-land
send " l j " & #8 & #8 & $this_planet & "* * "
waitFor "Planet command (?=help)"

# Run the drain loop
setVar $drain_idx 1
while ($drain_idx <= $count)
   setVar $source_planet $list[$drain_idx]
   if ($source_planet <> $this_planet)
        # Move figs
        if ($dpv_move_figs = "Yes")
             gosub :move_figs
        end
        if ($result = "NO ROOM LEFT")
             setVar $dpv_move_figs "No"
        end

        # Move ore
        if ($dpv_move_ore = "Yes")
             setVar $stuff "prod"
             setVar $prod 1
             gosub :move_holds
        end
        if ($result = "NO ROOM LEFT")
             setVar $dpv_move_ore "No"
        end
        if ($turns_spent >= $dpv_turns_avail) AND ($dpv_turns_avail > 0)
             send " j c * "
             send "'{" $bot_name "} - [Dny Planet Vacuum]: We've ran out of usable turns! Halting...*"
             halt
        end

        # Move ore cols
        if ($dpv_move_ore_cols = "Yes")
             setVar $stuff "colo"
             setVar $prod 1
             gosub :move_holds
        end
        if ($turns_spent >= $dpv_turns_avail) AND ($dpv_turns_avail > 0)
             send " j c * "
             send "'{" $bot_name "} - [Dny Planet Vacuum]: We've ran out of usable turns! Halting...*"
             halt
        end

        # Move org
        if ($dpv_move_org = "Yes")
             setVar $stuff "prod"
             setVar $prod 2
             gosub :move_holds
        end
        if ($result = "NO ROOM LEFT")
             setVar $dpv_move_org "No"
        end
        if ($turns_spent >= $dpv_turns_avail) AND ($dpv_turns_avail > 0)
             send " j c * "
             send "'{" $bot_name "} - [Dny Planet Vacuum]: We've ran out of usable turns! Halting...*"
             halt
        end

        # Move org cols
        if ($dpv_move_org_cols = "Yes")
             setVar $stuff "colo"
             setVar $prod 2
             gosub :move_holds
        end
        if ($turns_spent >= $dpv_turns_avail) AND ($dpv_turns_avail > 0)
             send " j c * "
             send "'{" $bot_name "} - [Dny Planet Vacuum]: We've ran out of usable turns! Halting...*"
             halt
        end

        # Move equ
        if ($dpv_move_equ = "Yes")
             setVar $stuff "prod"
             setVar $prod 3
             gosub :move_holds
        end
        if ($result = "NO ROOM LEFT")
             setVar $dpv_move_equ "No"
        end
        if ($turns_spent >= $dpv_turns_avail) AND ($dpv_turns_avail > 0)
             send " j c * "
             send "'{" $bot_name "} - [Dny Planet Vacuum]: We've ran out of usable turns! Halting...*"
             halt
        end

        # Move equ cols
        if ($dpv_move_equ_cols = "Yes")
             setVar $stuff "colo"
             setVar $prod 3
             gosub :move_holds
        end
        if ($turns_spent >= $dpv_turns_avail) AND ($dpv_turns_avail > 0)
             send " j c * "
             send "'{" $bot_name "} - [Dny Planet Vacuum]: We've ran out of usable turns! Halting...*"
             halt
        end
   end

   # Continue to the next planet
   add $drain_idx 1
end

# Head back to cit if we can.
send " j c * "

# Final banner
send "'{" $bot_name "} - [Dny Planet Vacuum]: Done! Powering Down...*"

# -------------------------------------------------------------------
halt
# -------------------------------------------------------------------

:move_figs
   setVar $result ""

   # Drop my figs on the planet
   send " j m n j l * "

   # Get current planet's details
   gosub :parse_planet_info
   setVar $destination_planet $planet_num

   # Don't do anything if it's our current planet
   if ($destination_planet = $source_planet)
        send " j m * * * "
        return
   end

   # How much more can we squeeze on here?
   if ($planet[$planet_num][FIG_SHIP] > 0)
        setVar $result "NO ROOM LEFT"
        send " j m * * * "
        send "'{" $bot_name "} - [Dny Planet Vacuum]: There isn't enough room for any more fighters!*"
        return
   end

   setVar $room_left ($planet[$planet_num][FIG_MAX] - $planet[$planet_num][FIG_AMOUNT])
   if ($room_left < 1)
        setVar $result "NO ROOM LEFT"
        send " j m * * * "
        send "'{" $bot_name "} - [Dny Planet Vacuum]: There isn't enough room for any more fighters!*"
        return
   end

   # Lift, jet and test
   killTrigger no_planets
   killTrigger p_not_here
   killTrigger p_land_ok
   setTextLineTrigger no_planets :f_no_planets "There isn't a planet in this sector."
   setTextLineTrigger p_not_here :f_p_not_here "That planet is not in this sector."
   setTextLineTrigger p_land_ok  :f_p_land_ok  "Landing sequence engaged..."
   send " q q q z * lj" & #8 & $source_planet & "* * "
   pause

   :f_no_planets
   killTrigger no_planets
   killTrigger p_not_here
   killTrigger p_land_ok
   send " j m * * * j c * "
   send "'{" $bot_name "} - [Dny Planet Vacuum]: There aren't any planets here?!? WTF?!?*"
   halt

   :f_p_not_here
   killTrigger no_planets
   killTrigger p_not_here
   killTrigger p_land_ok
   send " j c * "
   send "'{" $bot_name "} - [Dny Planet Vacuum]: Planet #" & $source_planet & " isn't here!*"
   return
  
   :f_p_land_ok
   killTrigger no_planets
   killTrigger p_not_here
   killTrigger p_land_ok

   # Init leftover flag
   setVar $leftovers_run FALSE

   # We've landed on something. Let's check it out.
   :check_fig_source_details
   gosub :parse_planet_info
   if ($planet_num <> $source_planet)
        send "'{" $bot_name "} - [Dny Planet Vacuum]: Planet #" & $source_planet & " isn't here!*"
        return
   end

   # How many loops are we running?
   if ($planet[$planet_num][FIG_AMOUNT] > $room_left)
        setVar $move_amount $room_left
   else
        setVar $move_amount $planet[$planet_num][FIG_AMOUNT]
   end
   if ($move_amount <= 0)
        goto :back_to_original_fig_planet
   end
   setVar $loops_to_run (($move_amount / $my_fig_capacity) + 1)

   # Run the main loops
   setVar $loop_index 1
   while ($loop_index <= $loops_to_run)
        send " j m * * * q l j " & #8 & #8 & $destination_planet & "* * j m n j l * q l j " & #8 & #8 & $source_planet & "* * "
        add $loop_index 1
   end

   # Run the leftovers
   if ($leftovers_run = FALSE)
        setVar $leftovers_run TRUE
        goto :check_fig_source_details
   end
   
   # Head back to the destination planet
   :back_to_original_fig_planet
   send " q q q q q z * l j " & #8 & #8 & $destination_planet & "* * j m * * * "
   waitFor "Landing sequence engaged..."
   waitFor "Planet command"
return

# -------------------------------------------------------------------

:move_holds
   setVar $result ""

   # Get the current planet's details
   gosub :parse_planet_info
   setVar $destination_planet $planet_num

   # Don't do anything if it's our current planet
   if ($destination_planet = $source_planet)
        return
   end

   # Get the amount to move
   if ($stuff = "colo")
        setVar $room_left 1000000
   else
        if ($prod = 1)
             setVar $room_left ($planet[$planet_num][ORE_MAX] - $planet[$planet_num][ORE_AMOUNT])
        elseif ($prod = 2)
             setVar $room_left ($planet[$planet_num][ORG_MAX] - $planet[$planet_num][ORG_AMOUNT])
        elseif ($prod = 3)
             setVar $room_left ($planet[$planet_num][EQU_MAX] - $planet[$planet_num][EQU_AMOUNT])
        end
   end
   if ($room_left < 1)
        setVar $result "NO ROOM LEFT"
        send "'{" $bot_name "} - [Dny Planet Vacuum]: There's no room left for this on the planet!*"
        return
   end

   # Lift, jet and test
   killTrigger no_planets
   killTrigger p_not_here
   killTrigger p_land_ok
   setTextLineTrigger no_planets :no_planets "There isn't a planet in this sector."
   setTextLineTrigger p_not_here :p_not_here "That planet is not in this sector."
   setTextLineTrigger p_land_ok  :p_land_ok  "Landing sequence engaged..."
   send " q q q z * j y lj" & #8 & $source_planet & "* * "
   pause

   :no_planets
   killTrigger no_planets
   killTrigger p_not_here
   killTrigger p_land_ok
   send " j c * "
   send "'{" $bot_name "} - [Dny Planet Vacuum]: There aren't any planets here?!? WTF?!?*"
   halt

   :p_not_here
   killTrigger no_planets
   killTrigger p_not_here
   killTrigger p_land_ok
   send "'{" $bot_name "} - [Dny Planet Vacuum]: Planet #" & $source_planet & " isn't here!*"
   return
  
   :p_land_ok
   killTrigger no_planets
   killTrigger p_not_here
   killTrigger p_land_ok

   # Init leftover flag
   setVar $leftovers_run FALSE

   # We've landed on something. Let's check it out.
   :check_source_details
   gosub :parse_planet_info
   if ($planet_num <> $source_planet)
        send "'{" $bot_name "} - [Dny Planet Vacuum]: Planet #" & $source_planet & " isn't here!*"
        return
   end

   # Ok, how much are we moving?
   if ($stuff = "colo")
        if ($prod = 1)
             if ($planet[$planet_num][ORE_COLS] > $room_left)
                  setVar $move_amount $room_left
             else
                  setVar $move_amount $planet[$planet_num][ORE_COLS]
             end
        elseif ($prod = 2)
             if ($planet[$planet_num][ORG_COLS] > $room_left)
                  setVar $move_amount $room_left
             else
                  setVar $move_amount $planet[$planet_num][ORG_COLS]
             end
        elseif ($prod = 3)
             if ($planet[$planet_num][EQU_COLS] > $room_left)
                  setVar $move_amount $room_left
             else
                  setVar $move_amount $planet[$planet_num][EQU_COLS]
             end
        end
   else
        if ($prod = 1)
             if ($planet[$planet_num][ORE_AMOUNT] > $room_left)
                  setVar $move_amount $room_left
             else
                  setVar $move_amount $planet[$planet_num][ORE_AMOUNT]
             end
        elseif ($prod = 2)
             if ($planet[$planet_num][ORG_AMOUNT] > $room_left)
                  setVar $move_amount $room_left
             else
                  setVar $move_amount $planet[$planet_num][ORG_AMOUNT]
             end
        elseif ($prod = 3)
             if ($planet[$planet_num][EQU_AMOUNT] > $room_left)
                  setVar $move_amount $room_left
             else
                  setVar $move_amount $planet[$planet_num][EQU_AMOUNT]
             end
        end
   end

   # How many loops are we running?
   if ($move_amount <= 0)
        goto :back_to_original_planet
   end
   setVar $loops_to_run ($move_amount / $my_holds)
   setVar $the_dredges  ($move_amount - ($loops_to_run * $my_holds))

   # Run the main loops
   setVar $loop_index 1
   while ($loop_index <= $loops_to_run)
        if ($stuff = "colo")
             send " j s n j t " & $prod & " * q l j " & #8 & #8 & $destination_planet & "* * j s n j l " & $prod & " * j s n j l 1 * j s n j l 2 * j s n j l 3 * q l j " & #8 & #8 & $source_planet & "* * "
        else
             send " j t n j t " & $prod & " * q l j " & #8 & #8 & $destination_planet & "* * j t n j l " & $prod & " * q l j " & #8 & #8 & $source_planet & "* * "
        end
        add $turns_spent 1
        if ($turns_spent >= $dpv_turns_avail) AND ($dpv_turns_avail > 0)
             goto :back_to_original_planet
        end
        add $loop_index 1
   end

   # Run the leftovers
   if ($leftovers_run = FALSE)
        setVar $leftovers_run TRUE
        goto :check_source_details
   end

   # Run the dredges
   if ($the_dredges > 0)
        if ($stuff = "colo")
             send " j s n j t " & $prod & " " & $the_dredges & " * q l j " & #8 & #8 & $destination_planet & "* * j s n j l " & $prod & " * j s n j l 1 * j s n j l 2 * j s n j l 3 * q l j " & #8 & #8 & $source_planet & "* * "
        else
             send " j t n j t " & $prod & " " & $the_dredges & " * q l j " & #8 & #8 & $destination_planet & "* * j t n j l " & $prod & " * q l j " & #8 & #8 & $source_planet & "* * "
        end
        add $turns_spent 1
        if ($turns_spent >= $dpv_turns_avail) AND ($dpv_turns_avail > 0)
             goto :back_to_original_planet
        end
   end

   # Head back to the destination planet
   :back_to_original_planet
   send " q q q q q z * l j " & #8 & #8 & $destination_planet & "* * "
   waitFor "Landing sequence engaged..."
   waitFor "Planet command"
   # if ($turns_spent >= $dpv_turns_avail) AND ($dpv_turns_avail > 0)
   #      send "'Turn limit reached!*"
   # end
return


# -------------------------------------------------------------------
# Subroutine to grab the planet list
# -------------------------------------------------------------------

:get_planet_nums
   setVar $count 0
   send "l"
   waitFor "<Preparing ship to land on planet surface>"
   killTrigger no_planet
   killTrigger landingon
   killTrigger planetnum
   killTrigger landprmpt
   setTextLineTrigger no_planet :no_planet "There isn't a planet in this sector."
   setTextLineTrigger landingon :landingon "Landing sequence engaged..."
   setTextLineTrigger planetnum :planetnum "<"
   setTextTrigger     landprmpt :landprmpt "Land on which planet <Q to abort>"
   pause

   :no_planets
   killTrigger no_planet
   killTrigger landingon
   killTrigger planetnum
   killTrigger landprmpt
   setVar $count 0
   setVar $result "NO PLANETS"
   return

   :landingon
   killTrigger no_planet
   killTrigger landingon
   killTrigger planetnum
   killTrigger landprmpt
   waitFor "Planet #"
   getWord CURRENTLINE $list[1] 2
   stripText $list[1] "#"
   send " q "
   setVar $count 1
   setVar $result "LANDED"
   return

   :landprmpt
   killTrigger no_planet
   killTrigger landingon
   killTrigger planetnum
   killTrigger landprmpt
   send "*"
   setVar $result "GOT LIST"
   return

   :planetnum
   killTrigger no_planet
   killTrigger landingon
   killTrigger planetnum
   getText CURRENTLINE $possible_word "<" ">"
   getWord $possible_word $test_word 1
   stripText $test_word "<"
   stripText $test_word ">"
   isNumber $result $test_word
   if ($result > 0)
        add $count 1
        setVar $list[$count] $test_word
   end
   setTextLineTrigger planetnum :planetnum "<"
   pause
return


# -------------------------------------------------------------------
# Subroutine to parse the planet details.
# -------------------------------------------------------------------

:parse_planet_info
   send "d"
   waitFor "Planet #"
   getWord CURRENTLINE $planet_num 2
   stripText $planet_num "#"

   waitFor "Fuel Ore"
   getWord CURRENTLINE $planet[$planet_num][ORE_COLS] 3
   stripText $planet[$planet_num][ORE_COLS] ","
   getWord CURRENTLINE $planet[$planet_num][ORE_AMOUNT] 6
   stripText $planet[$planet_num][ORE_AMOUNT] ","
   getWord CURRENTLINE $planet[$planet_num][ORE_MAX] 8
   stripText $planet[$planet_num][ORE_MAX] ","
   
   waitFor "Organics"
   getWord CURRENTLINE $planet[$planet_num][ORG_COLS] 2
   stripText $planet[$planet_num][ORG_COLS] ","
   getWord CURRENTLINE $planet[$planet_num][ORG_AMOUNT] 5
   stripText $planet[$planet_num][ORG_AMOUNT] ","
   getWord CURRENTLINE $planet[$planet_num][ORG_MAX] 7
   stripText $planet[$planet_num][ORG_MAX] ","

   waitFor "Equipment"
   getWord CURRENTLINE $planet[$planet_num][EQU_COLS] 2
   stripText $planet[$planet_num][EQU_COLS] ","
   getWord CURRENTLINE $planet[$planet_num][EQU_AMOUNT] 5
   stripText $planet[$planet_num][EQU_AMOUNT] ","
   getWord CURRENTLINE $planet[$planet_num][EQU_MAX] 7
   stripText $planet[$planet_num][EQU_MAX] ","

   waitFor "Fighters"
   getWord CURRENTLINE $planet[$planet_num][FIG_AMOUNT] 5
   stripText $planet[$planet_num][FIG_AMOUNT] ","
   getWord CURRENTLINE $planet[$planet_num][FIG_SHIP] 6
   stripText $planet[$planet_num][FIG_SHIP] ","
   getWord CURRENTLINE $planet[$planet_num][FIG_MAX] 7
   stripText $planet[$planet_num][FIG_MAX] ","

   waitFor "Planet command"
return


# -------------------------------------------------------------------
# Quickstats routine by Dnyarri. A simple way to parse the slash stats
# into something useful.
# -------------------------------------------------------------------

:do_quickstats
     killtrigger statlinetrig
     setVar $stats ""
     setTextLineTrigger statlinetrig :statsline #179
     send "/"
pause

:statsline
     killtrigger statlinetrig
     setVar $line CURRENTLINE
     replacetext $line #179 " "
     striptext $line ","
     setVar $stats $stats & $line
     getWordPos $line $pos "Ship"
     if ($pos > 0)
          goto :gotStats
     else
          setTextLineTrigger statlinetrig :statsline
     end
pause

:gotStats
     setVar $quickstats[SECT] 0
     setVar $quickstats[TURNS] 0
     setVar $quickstats[CREDS] 0
     setVar $quickstats[FIGS] 0
     setVar $quickstats[SHLDS] 0
     setVar $quickstats[HLDS] 0
     setVar $quickstats[ORE] 0
     setVar $quickstats[ORG] 0
     setVar $quickstats[EQU] 0
     setVar $quickstats[COL] 0
     setVar $quickstats[PHOT] 0
     setVar $quickstats[ARMD] 0
     setVar $quickstats[LMPT] 0
     setVar $quickstats[GTORP] 0
     setVar $quickstats[TWARP] 0
     setVar $quickstats[CLKS] 0
     setVar $quickstats[BEACNS] 0
     setVar $quickstats[ATMDT] 0
     setVar $quickstats[CRBO] 0
     setVar $quickstats[EPRB] 0
     setVar $quickstats[MDIS] 0
     setVar $quickstats[PSPRB] "NO"
     setVar $quickstats[PLSCN] "NO"
     setVar $quickstats[LRS] "NONE"
     setVar $quickstats[ALN] 0
     setVar $quickstats[EXP] 0
     setVar $quickstats[CORP] 0
     setVar $quickstats[SHIP] 0
     setVar $quickstats[TYPE] 0
     setVar $stats $stats & " @@@"
     upperCase $stats
     setVar $current_word 0
     setVar $wordy ""
     while ($wordy <> "@@@")
          if ($wordy = "SECT")
               getWord $stats $quickstats[SECT]   ($current_word + 1)
          elseif ($wordy = "TURNS")
               getWord $stats $quickstats[TURNS]  ($current_word + 1)
          elseif ($wordy = "CREDS")
               getWord $stats $quickstats[CREDS]  ($current_word + 1)
          elseif ($wordy = "FIGS")
               getWord $stats $quickstats[FIGS]   ($current_word + 1)
          elseif ($wordy = "SHLDS")
               getWord $stats $quickstats[SHLDS]  ($current_word + 1)
          elseif ($wordy = "HLDS")
               getWord $stats $quickstats[HLDS]   ($current_word + 1)
          elseif ($wordy = "ORE")
               getWord $stats $quickstats[ORE]    ($current_word + 1)
          elseif ($wordy = "ORG")
               getWord $stats $quickstats[ORG]    ($current_word + 1)
          elseif ($wordy = "EQU")
               getWord $stats $quickstats[EQU]    ($current_word + 1)
          elseif ($wordy = "COL")
               getWord $stats $quickstats[COL]    ($current_word + 1)
          elseif ($wordy = "PHOT")
               getWord $stats $quickstats[PHOT]   ($current_word + 1)
          elseif ($wordy = "ARMD")
               getWord $stats $quickstats[ARMD]   ($current_word + 1)
          elseif ($wordy = "LMPT")
               getWord $stats $quickstats[LMPT]   ($current_word + 1)
          elseif ($wordy = "GTORP")
               getWord $stats $quickstats[GTORP]  ($current_word + 1)
          elseif ($wordy = "TWARP")
               getWord $stats $quickstats[TWARP]  ($current_word + 1)
          elseif ($wordy = "CLKS")
               getWord $stats $quickstats[CLKS]   ($current_word + 1)
          elseif ($wordy = "BEACNS")
               getWord $stats $quickstats[BEACNS] ($current_word + 1)
          elseif ($wordy = "ATMDT")
               getWord $stats $quickstats[ATMDT]  ($current_word + 1)
          elseif ($wordy = "CRBO")
               getWord $stats $quickstats[CRBO]   ($current_word + 1)
          elseif ($wordy = "EPRB")
               getWord $stats $quickstats[EPRB]   ($current_word + 1)
          elseif ($wordy = "MDIS")
               getWord $stats $quickstats[MDIS]   ($current_word + 1)
          elseif ($wordy = "PSPRB")
               getWord $stats $quickstats[PSPRB]  ($current_word + 1)
          elseif ($wordy = "PLSCN")
               getWord $stats $quickstats[PLSCN]  ($current_word + 1)
          elseif ($wordy = "LRS")
               getWord $stats $quickstats[LRS]    ($current_word + 1)
          elseif ($wordy = "ALN")
               getWord $stats $quickstats[ALN]    ($current_word + 1)
          elseif ($wordy = "EXP")
               getWord $stats $quickstats[EXP]    ($current_word + 1)
          elseif ($wordy = "CORP")
               getWord $stats $quickstats[CORP]   ($current_word + 1)
          elseif ($wordy = "SHIP")
               getWord $stats $quickstats[SHIP]   ($current_word + 1)
               getWord $stats $quickstats[TYPE]   ($current_word + 2)
          end
          add $current_word 1
          getWord $stats $wordy $current_word
     end
return

# -------------------------------------------------------------------