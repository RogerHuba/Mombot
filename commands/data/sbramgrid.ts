gosub :BOT~loadVars


	setVar $BOT~help[1]  $BOT~tab&"    Rammars Legendary gridder"
	setVar $BOT~help[2]  $BOT~tab&"    "
	setVar $BOT~help[3]  $BOT~tab&"    ramgrid [stop_turns] [stop_fighters] {saveme}"
	setVar $BOT~help[4]  $BOT~tab&"       "
	setVar $BOT~help[5]  $BOT~tab&" Options:"
	setVar $BOT~help[6]  $BOT~tab&"    "
	setVar $BOT~help[7]  $BOT~tab&"   [stop_turns]     stop when you get to these turns "
	setVar $BOT~help[8]  $BOT~tab&"   [stop_fighters]  stop when you get to these fighters"
	setVar $BOT~help[9]  $BOT~tab&"   {saveme}  when gridder is stuck it will call saveme to be safe"
	setVar $BOT~help[10] $BOT~tab&"                   "
	
	gosub :bot~helpfile

	setVar $BOT~script_title "Rammar's Unfigged Gridder"
	gosub :BOT~banner



:Check_Prompt
	cutText CURRENTLINE $location 1 12
	if ($location <> "Command [TL=")
		clientMessage "This script must be run from the command prompt"
		halt
	end
	
# Create Fig-Grid File Name
:File_Maintenance
	mergeText "Fig_Grid-" GAMENAME $fig_file
	mergeText $fig_file ".txt" $fig_file
	fileExists $exists $fig_file
	if ($exists)
		read $fig_file $update 1
		echo ANSI_10 "*Your fighter list was last updated at: " ANSI_12& $update ANSI_10&"*Would you like to recheck the list? <"&ANSI_14&"y"&ANSI_10&"/"&ANSI_14&"n"
		getConsoleInput $response singlekey
		lowercase $response
		if ($response = "y")
			gosub :Create_List
		else
			echo ANSI_10&"* Reading stored fighter list...."
			gosub :Read_Fig_File
		end
	else
		goSub :Create_List
	end

:Build_Initial_Density_Report_Data
	 setVar $Density_File GAMENAME&"-Density_Reports.txt"
	getDate $date
	getTime $time "h:nn:ss am/pm"
	fileExists $exists $Density_File
	if ($exists = FALSE)
		write $Density_File "Sector   Density   NavHaz   Filtered    Time         Date"
	end
	setVar $final_Density_Report ANSI_12&"Ram Unfigged Gridder Density Report:*"
	setVar $final_Density_Found_Count 0


	killAllTriggers
	setVar $minimum_turns 0
	setVar $minimum_figs 0
	setVar $saveme 0

	getWord $bot~user_command_line $bot~parm1 1
	getWord $bot~user_command_line $bot~parm2 2
	getWord $bot~user_command_line $bot~parm3 3

	isNumber $test $bot~parm1
	if ($test)
		if ($bot~parm1 < 1)
			setVar $SWITCHBOARD~message "Stop Turns must be a number greater than zero!.*"
			gosub :SWITCHBOARD~switchboard
			halt
		else
			 setVar $minimum_turns $bot~parm1
		end
	else
		setVar $SWITCHBOARD~message "Stop Turns must be a number greater than zero!.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end



	isNumber $test $bot~parm2
	if ($test)
		if ($bot~parm2 < 50)
			setVar $SWITCHBOARD~message "Stop Fighters must be a number greater than 49!.*"
			gosub :SWITCHBOARD~switchboard
			halt
		else
			 setVar $minimum_figs $bot~parm2
		end
	else
		setVar $SWITCHBOARD~message "Stop Fighters must be a number greater than 49!.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	

	if ($bot~parm3 = "saveme")
		setVar $saveme 1
	end
	loadvar $map~stardock

:Get_Initial_Info
	 goSub :Quick_Stats
	 setVar $have_turns $quickstats[TURNS]
	 setVar $have_figs $quickstats[FIGS]
	 if ($have_turns = 0)
		  send "I"
		  waitFor "Turns left     :"
		  getWord CURRENTLINE $Unlim 4
		  if ($Unlim = "Unlimited")
			   setVar $Unlim TRUE
			   setVar $have_turns 65520
#               echo "**Unlim game detected! *"
		  end
	 end
	 send "C;q"
	 setTextLineTrigger 1 :Read_Turns_Per_Warp "Turns Per Warp:"
	 setTextLineTrigger 2 :Read_Max_Attack_Figs "Max Figs Per Attack:"
	 pause

:Read_Turns_Per_Warp
	 getText CURRENTLINE $ship_TPW "Turns Per Warp:" "Defensive Odds:"
	 getWord $ship_TPW $ship_TPW 1
	 pause

:Read_Max_Attack_Figs
	 getWord CURRENTLINE $max_attack_figs 5
	 stripText $max_attack_figs ","
#     echo ANSI_10&"**Ship TPW: " ANSI_14&$ship_TPW "*" ANSI_10&"Max Attack Figs: " ANSI_14&$max_attack_figs "*"
	 waitFor "Command [TL="

:Build_Menu
	addMenu "" "UnfiggedGridder" "*" "." "" ANSI_10&"Your Choice? "&ANSI_10&"<"&ANSI_14&"?"&ANSI_10&" for "&ANSI_14&"Help" FALSE
	 addMenu "UnfiggedGridder" "MinTurns" ANSI_11&"Minimum Turn Level -    "&ANSI_13&"("&ANSI_14&$have_Turns&" available"&ANSI_13&")      " "1" :Menu_Min_Turns "" FALSE
	 addMenu "UnfiggedGridder" "MinFigs" ANSI_11&"Minimum Fighter Level - "&ANSI_13&"("&ANSI_14&$have_Figs&" on hand"&ANSI_13&")        " "2" :Menu_Min_Figs "" FALSE
	 addMenu "UnfiggedGridder" "Go" ANSI_13&"Go!"&ANSI_10&" - "&ANSI_14&"Start Gridding" "G" :Start_Gridding "" TRUE
	 gosub :sub_setMenu

:Title
	echo ANSI_9 "** ======== " ANSI_10&" RammaR's " ANSI_14&"Nearest Unfigged Gridder " $ScriptVersion " " ANSI_9&"========*"
	openMenu "UnfiggedGridder"


:Menu_Min_Turns
	getInput $minimum_Turns ANSI_10&"Stop gridding with how many "&ANSI_14&"TURNS"&ANSI_10&" left?"
	isNumber $number $minimum_Turns
		if ($number = 0)
			echo ANSI_12&"*Bad Input - Try again*"
			goto :Menu_Min_Turns
		end
	saveVar $minimum_Turns
	gosub :sub_SetMenu
	goto :Title

:Menu_Min_Figs
	getInput $minimum_Figs ANSI_10&"Stop gridding if down to "&ANSI_14&"FIGHTERS"&ANSI_10&"?"
	isNumber $number $minimum_Figs
		if ($number = 0)
			echo ANSI_12&"*Bad Input - Try again*"
			goto :Menu_Min_Figs
		end
	saveVar $minimum_Figs
	gosub :sub_SetMenu
	goto :Title

:sub_setMenu
	 setMenuValue "MinTurns" $minimum_Turns
	setMenuValue "MinFigs" $minimum_figs
	return

:Start_Gridding
	 if ($window_made = FALSE)
		  window GridWindow 125 220 "Gridding:" onTop
		  setVar $window_made TRUE
	 end
	 send "'Ram Nearest Unfigged Gridder Starting for " ($have_turns - $minimum_turns) " turns*"
	 setVar $total_targets 0
	 setVar $total_hops 0

:Outer_Gridding_Loop
	 while ($have_figs > $minimum_figs) AND ($hit_turn_limit = FALSE)
		  goSub :Build_Array
		  goSub :Send_Macros
		  goSub :Verify_End_Of_Run
		  goSub :Update_Density_Scan_Report
	 end
	 goto :End

:Ended_Early
	send "r * * "
	send "'Ram-Grid: Gridder Podded / Stuck in sector: " $focus_sector "*"
	
	loadvar $switchboard~bot_name
	send "q q q q * '"&$SWITCHBOARD~bot_name&" call*"
	halt

:Ended_Early_Cant_Find_ZTM
	echo ANSI_10&"Manually get clear - then type: " ANSI_14&"FORCE_CONTINUE" ANSI_10&" on sub to save data.*"
	setTextLineTrigger 99 :End "FORCE_CONTINUE"
	pause

:End
	 goSub :Echo_Final_Density_Report
	 send "'*Gridding Complete, Fig'd: " $total_targets " new sectors at: " $efficiency "% efficiency.*I have: " $have_turns " turns and " $have_figs " figs remaining.**"
	 goSub :Save_Fig_Grid
	 halt


:Build_Array
#     goSub :Quick_Stats
	 setArray $target_sector 10
	 setArray $result_distance 10
	 setArray $macro 10
	 setArray $Path_sectors 0
	 setVar $path_sector_count 0
	 setVar $macro_hops 0
	 setVar $count1 1
	 setVar $built_macros 0
	 setVar $hit_turn_limit FALSE
	 setVar $focus_sector $quickstats[SECT]
	 setVar $previous_sector $quickstats[SECT]
	 setVar $projected_Turns $quickstats[TURNS]
	 if ($unlim = TRUE)
		  setVar $projected_Turns 65520
	 end
	 while ($count1 <= 10) AND ($projected_Turns > $minimum_turns)
		  setVar $attempted_ZTM_Fix FALSE
		  goSub :Breadth_UnFigged_Search
#          send "'target #" $count1 " is: " $target_sector[$count1] "*"
		  setVar $focus_sector $target_sector[$count1]
		  setVar $fig_grid[$focus_sector] 1
		  add $macro_hops $result_distance[$count1]
		  setVar $projected_Turns ($projected_turns - ($ship_TPW * $result_Distance[$count1]))
		  if ($projected_Turns > $minimum_turns)
			   getCourse $path $previous_sector $focus_sector
			   setVar $previous_sector $focus_sector
			   setVar $final_sector $focus_sector
			   setArray $gridded_sectors $path
			 setVar $step_Count 2
			 setVar $last_step FALSE
			 setVar $macro[$count1] ""
			 while ($step_Count <= ($result_distance[$count1] + 1))
				 setVar $next_Sector $path[$step_Count]
					if ($step_Count = ($result_distance[$count1] + 1))
						 setVar $last_step TRUE
				 end
				 goSub :Build_Move_Macro_Routine
				 setVar $macro[$count1] $macro[$count1]&$macro_text
				 add $step_Count 1
			 end
			   add $built_macros 1
			   add $total_targets 1
			   add $total_hops $result_Distance[$count1]
#		     echo ANSI_10&"*Macro #" $count1 ": " $macro[$count1] "*"
		  else
				setVar $hit_turn_limit TRUE
		  end
		  add $count1 1
	 end
	 Return

:Send_Macros
	 setVar $count2 1
	 while ($count2 <= $built_macros)
		  send $macro[$count2]
		  add $count2 1
	 end
	 goSub :Display_Window_Contents
	 Return

:Verify_End_Of_Run
	 goSub :Quick_Stats
	 if ($unlim = TRUE)
		  setVar $have_turns 65520
	 else
		  setVar $have_turns $quickstats[TURNS]
	 end
	 setVar $have_figs $quickstats[FIGS]
	 setVar $focus_sector $quickstats[SECT]
	 if ($focus_sector <> $final_sector)
		  goto :Ended_Early
	 end
	 Return



#########  Read Quick Stat Info   ##################################################################
:Quick_Stats

	setVar $qs[1] "Sect"
	setVar $qs[2] "Turns"
	setVar $qs[3] "Creds"
	setVar $qs[4] "Figs"
	setVar $qs[5] "Shlds"
	setVar $qs[6] "Hlds"
	setVar $qs[7] "Ore"
	setVar $qs[8] "Org"
	setVar $qs[9] "Equ"
	setVar $qs[10] "Col" 
	setVar $qs[11] "Phot"
	setVar $qs[12] "Armd"
	setVar $qs[13] "Lmpt"
	setVar $qs[14] "GTorp"
	setVar $qs[15] "TWarp"
	setVar $qs[16] "Clks"
	setVar $qs[17] "Beacns"
	setVar $qs[18] "AtmDt"
	setVar $qs[19] "Crbo"
	setVar $qs[20] "EPrb"
	setVar $qs[21] "MDis"
	setVar $qs[22] "PsPrb"
	setVar $qs[23] "PlScn"
	setVar $qs[24] "LRS"
	setVar $qs[25] "Aln"
	setVar $qs[26] "Exp"
	setVar $qs[27] "Ship"
	setVar $qs_count 0
	
	send "/"
:QuickStat_Trigger
	setTextLineTrigger ReadQSLine :Read_QS_Line "³Turns "
	pause

:Read_QS_Line
	getWordPos CURRENTLINE $pos #179
	if ($pos > 0)
		add $qs_count 1
		setVar $qs_statline CURRENTLINE
		replaceText $qs_statline #179 " " & #179 & " "
		setVar $qs_line[$qs_count] $qs_statline
		getWordPos $qs_statline $pos " Ship "
#		echo "*qs_statline = " $qs_line[$qs_count] "*"
		if ($pos > 0)
			goto :finished_QS_read
		end
	else
		getWordPos CURRENTLINE $pos " Ship "
		if ($pos > 0)
			add $qs_count 1
			setVar $qs_statline CURRENTLINE
			setVar $qs_line[$qs_count] $qs_statline
#			echo "*qs_statline = " $qs_line[$qs_count] "*"
			goto :finished_QS_read
		end
	end
	setTextLineTrigger ReadQSLine :Read_QS_Line
	pause

:finished_QS_read
	killtrigger ReadQSLine
	setVar $qs_count 0
:qs_count
	if ($qs_count < 27)
		add $qs_count 1
		setVar $QS_line_count 0
:QS_line_count
		if ($QS_line_count < $qs_count)
			add $QS_line_count 1
			getWordPos $qs_line[$QS_line_count] $pos $qs[$qs_count]
#			echo ANSI_10&"*The $pos of:" ANSI_14&$qs[$qs_count] ANSI_10&" is: " ANSI_14&$pos ANSI_10&" in Text:*" ANSI_13&$qs_line[$QS_line_count] "*"
			if ($pos > 0)
				setVar $temp_line $qs_line[$QS_line_count]
				cutText $temp_line $temp_line $pos 9999
				upperCase $qs[$qs_count]
				getWord $temp_line $quickstats[$qs[$qs_count]] 2
				stripText $quickstats[$qs[$qs_count]] ","
			else
				goto :QS_line_count
			end
		end
#		echo ANSI_10&"*quickstat " $qs[$qs_count] ":" ANSI_14&$quickstats[$qs[$qs_count]] "*"
		goto :qs_count
	end
	return

####################################################################################################

#### BELOW IS ADDED IN FROM THE FIG_GRID_LIST instead of using it as an INCLUDE.

# Creates an array and stores the locations of all of your "Personal" and "Corporate" figs.
:Create_List
	delete $fig_file
	getDate $date
	getTime $time "h:nn:ss am/pm"
	write $fig_file $time & ", " & $date 
	setArray $fig_Grid SECTORS
	setVar $Sector_Count 0
	
:List_Fighters
	 send "c n 1 q q "
#	send "*"
#	waitfor "Command ["
	send "g"
	waitFor "======"

:resetFtrTriggers
	killAllTriggers
	setTextLineTrigger corp :recordFtr "Corp"
	setTextLineTrigger pers :recordFtr "Personal"
	setTextLineTrigger done :List_Update_Complete "Total"
	PAUSE

:recordFtr
	getWord CURRENTLINE $Sector_Num 1
	setVar $Fig_Grid[$Sector_Num] 1
#	write $fig_file $Sector_Num
	add $Sector_Count 1
	goto :resetFtrTriggers

:List_Update_Complete
	killAllTriggers
	 send "c n  1 q q"
	waitFor "<Computer deactivated>"
	 setVar $fig_indexer 1
	 setVar $fig_write_list $fig_Grid[$fig_indexer] & " "
	 while ($fig_indexer < SECTORS)
		  add $fig_indexer 1
		  setVar $fig_write_list $fig_write_list & $fig_Grid[$fig_indexer] & " "
	 end
	 write $fig_file $fig_write_list

	echo ANSI_9&"* File update complete. *"
	echo ANSI_10&"* You have " ANSI_14&$Sector_count ANSI_10&" sectors fig'd out of " ANSI_14&SECTORS ANSI_10&".*"
	Return
	
# This Section Loads the data in from the file into the Array.
:Read_Fig_File
	setVar $sector_count 0
	setVar $read_line 2
	read $Fig_file $fig_read_list $read_line
	setArray $fig_Grid SECTORS
:Read_loop
	 setVar $fig_indexer 1
	while ($fig_indexer <= SECTORS)
		getWord $fig_read_List $fig_Grid[$fig_indexer] $fig_indexer
		if ($fig_grid[$fig_indexer] > 0)
		   add $sector_count 1
		end
		add $fig_indexer 1
	end
	echo ANSI_9&"* File read complete. *"
	echo ANSI_10&"* You have " ANSI_14&$Sector_count ANSI_10&" sectors fig'd out of " ANSI_14&SECTORS ANSI_10&".*"
	Return
	
###############################################################################

:Breadth_UnFigged_Search
	 
	 setArray $search_que 0
	 setArray $search_Flagged 0
	 setArray $distance 0
	setVar $search_start $focus_sector
	setVar $search_bottom 1
	setVar $search_top 1
	setVar $search_que[1] $search_start
	setVar $search_flagged[$search_start] 1
	setVar $distance[$search_start] 0

	 while ($search_bottom <= $search_top)
#          echo ANSI_10&"*Search Top: " $search_top "  Search Bottom: " $search_bottom "*"
		  setVar $search_focus $search_que[$search_bottom]
		  setVar $a 1
		  while ($a <= SECTOR.WARPCOUNT[$search_focus])
			   setVar $adj_search_test SECTOR.WARPS[$search_Focus][$a]
			   if ($search_flagged[$adj_search_test] = 0)
					setVar $distance[$adj_search_test] ($distance[$search_focus] + 1)
#                   echo ANSI_10&"*Now testing: " $adj_search_test "*"
					if ($fig_grid[$adj_search_test] = 0) AND ($adj_search_test <> STARDOCK) AND ($adj_search_test > 10) AND (SECTOR.WARPCOUNT[$adj_search_test] > 0) AND (SECTOR.WARPINCOUNT[$adj_search_test] > 0)
						 setVar $target_sector[$count1] $adj_search_test
						 setVar $result_distance[$count1] $distance[$adj_search_test]
#                         echo ANSI_10&"*Target sector: " ANSI_14&$target_sector[$count1] ANSI_10&"  Distance: " ANSI_14&$result_distance[$count1] "*"
						 return
					end
					setVar $search_flagged[$adj_search_test] 1
					add $search_top 1
					setVar $search_que[$search_top] $adj_search_test
			   end
			   add $a 1
		  end
		  add $search_bottom 1
	 end

	 echo "*can't find target sector for: " $focus_sector " count is: " $count1 "*"
	 if ($attempted_ZTM_Fix = FALSE)
		  goSub :Attempt_ZTM_Fix
		  goto :Breadth_UnFigged_Search
	 else
		  echo ANSI_10&"**Simple ZTM Fix " ANSI_12&"Failed" ANSI_10&" script halting.**"
		  goto :Ended_Early_Cant_Find_ZTM
	 end
	 setVar $target_sector[$count1] "0"
	 setVar $result_distance[$count1] "0"
	 return
	 
#########  BUILD MACRO ROUTINE ################################################
:Build_Move_Macro_Routine
	 setVar $macro_Text "m "&$path[$step_Count]
	setVar $last_mode "Charge"
	if ($path[$step_Count] > 10) AND ($path[$step_Count] <> STARDOCK) AND ($path[$step_Count] <> $stardock)
		mergeText $macro_Text "* z a 9999 * *" $macro_Text
#          setVar $DE_check $path[$step_Count]
#		if (SECTOR.WARPCOUNT[$DE_check] = 1) AND (SECTOR.WARPINCOUNT[$DE_check] = 1)
#			mergeText $macro_Text "f z 3 * z c z d * " $macro_Text
#		else
		mergeText $macro_Text "f z 1 * z c z d * " $macro_Text
#		end
		if ($quickstats[LRS] = "Dens")
			  mergeText $macro_Text "s" $macro_Text
		  elseIf ($quickstats[LRS] = "Holo")
			mergeText $macro_Text "s d" $macro_Text
		end
	else
		mergeText $macro_Text "* * " $macro_Text
		if ($quickstats[LRS] = "Dens")
			  mergeText $macro_Text "s" $macro_Text
		  elseIf ($quickstats[LRS] = "Holo")
			mergeText $macro_Text "s d" $macro_Text
		end
		if ($path[$step_Count] <= 10)
			setVar $passesFed "TRUE"
		else
			setVar $passesDock "TRUE"
		end
	end

	 add $path_sector_count 1
	 setVar $Path_sectors[$path_sector_count] $path[$step_Count]
	Return
	
###############################################################################
:Display_Window_Contents
	 setPrecision 10
	 setVar $efficiency (($total_targets / $total_hops) * 100)
	 round $efficiency 2
	 setPrecision 0
	 setVar $window_text "Total Gridded: "&$total_targets&"*Efficiency: "&$efficiency&"%*Now Charging:*"
	 setVar $count3 1
	 while ($count3 <= $built_macros)
		  setVar $window_text $window_text&"              "&$target_sector[$count3]&"*"
		  add $count3 1
	 end
	 setWindowContents GridWindow $window_text
	 return

###############################################################################
:Save_Fig_Grid
	 echo ANSI_10&"*Saving Current Fig Data -- " ANSI_14&"Please be patient...*"
	delete $fig_file
	getDate $date
	getTime $time "h:nn:ss am/pm"
	write $fig_file $time & ", " & $date
	setVar $new_fig_Count 0
	setVar $fig_indexer 1
	 setVar $fig_write_list $fig_Grid[$fig_indexer] & " "
	 while ($fig_indexer < SECTORS)
		  add $fig_indexer 1
		  setVar $fig_write_list $fig_write_list & $fig_Grid[$fig_indexer] & " "
		  if ($fig_Grid[$fig_indexer] > 0)
			   add $new_fig_Count 1
		  end
	 end
	 write $fig_file $fig_write_list

	echo ANSI_14&"*File Update Complete*"
	echo ANSI_10&"You have " ANSI_14&$new_fig_Count ANSI_10&" out of " ANSI_14&SECTORS ANSI_14&" sectors fig'd.*"
	Return
	
####################################################################################################
:Update_Density_Scan_Report
#     echo "**Checking Density Loop**"
	 setVar $count6 1
	 setVar $density_report "Unusual Density Report:*"
	 setVar $density_found_Count 0
	 while ($count6 <= $path_sector_count)
		  setVar $path_Sector $Path_sectors[$count6]
#          echo "Path Sector is: " $path_sector "*"
		setVar $density_loops SECTOR.WARPCOUNT[$path_Sector]
		  setVar $count7 1
		while ($count7 <= $density_loops)
			 setVar $test_sector SECTOR.WARPS[$path_Sector][$count7]
#		     echo "Examining Sector: " $test_sector "*"
			 if ($test_sector > 10) AND ($test_sector <> STARDOCK) AND ($density_checked[$test_sector] = 0)
					if (SECTOR.DENSITY[$test_sector] = 38) OR (SECTOR.DENSITY[$test_sector] = 40) OR (SECTOR.DENSITY[$test_sector] = 43) OR (SECTOR.DENSITY[$test_sector] = 45) OR (SECTOR.DENSITY[$test_sector] = 78) OR (SECTOR.DENSITY[$test_sector] = 80) OR (SECTOR.DENSITY[$test_sector] = 85) OR (SECTOR.DENSITY[$test_sector] = 138) OR (SECTOR.DENSITY[$test_sector] = 140) OR (SECTOR.DENSITY[$test_sector] = 143) OR (SECTOR.DENSITY[$test_sector] = 145) OR (SECTOR.DENSITY[$test_sector] = 178) OR (SECTOR.DENSITY[$test_sector] = 180) OR (SECTOR.DENSITY[$test_sector] = 185) OR (SECTOR.DENSITY[$test_sector] > 200)
						  mergeText $Density_Report "Sector: "&$test_sector&"  Density: "&SECTOR.DENSITY[$test_sector]&"  Nav Haz: "&SECTOR.NAVHAZ[$test_sector]&"%  Filtered: "&(SECTOR.DENSITY[$test_sector] - (21 * SECTOR.NAVHAZ[$test_sector]))&"*" $Density_Report
						  mergeText $Final_Density_Report ANSI_10&"Sector: "&ANSI_14&$test_sector&ANSI_10&"  Density: "&ANSI_14&SECTOR.DENSITY[$test_sector]&ANSI_10&"  NavHaz: "&ANSI_12&SECTOR.NAVHAZ[$test_sector]&ANSI_10&"%  Filtered: "&ANSI_14&(SECTOR.DENSITY[$test_sector] - (21 * SECTOR.NAVHAZ[$test_sector]))&"*" $Final_Density_Report
					  write $Density_File $test_sector & "        " & SECTOR.DENSITY[$test_sector] & "       " & SECTOR.NAVHAZ[$test_sector] & "        " & (SECTOR.DENSITY[$test_sector] - (21 * SECTOR.NAVHAZ[$test_sector])) & "     " & $time & "    " & $date
					  add $density_found_Count 1
					  add $final_density_found_count 1
				   end
				   setVar $density_checked[$test_sector] 1
			 end
			   add $count7 1
		  end
		add $count6 1
	end
#	echo "Found Density's: " $density_found_Count "**"
	if ($density_found_Count <> 0)
		send "'*" $density_report "* "
	end
	Return

:Echo_Final_Density_Report
	 if ($final_Density_found_count > 0)
		  echo "**" $final_density_report "*"
		  echo ANSI_13&"Report logged in: " ANSI_14&$Density_File "*"
	 else
		  send "'Ram-Grid: No Strange Density's to Report.*"
		  waitFor "Message sent on sub-space channel"
		  echo ANSI_10&"**No Strange Density's to Report.*"
	 end
	 return
	 
:Attempt_ZTM_Fix
	 setVar $attempted_ZTM_Fix TRUE
	 send "c f "
	 waitFor "What is the starting sector"
	 send $focus_sector "*1*f 1*" $focus_sector "*q"
	 waitFor "Command [TL"
	 return

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
