	gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&"reloader {fig minimum} {ig} {topoff} {fig} {noland} {sentinel}"
	setVar $BOT~help[2]  $BOT~tab&"  - Sector Reloader Mode"
	setVar $BOT~help[3]  $BOT~tab&"    Sits above planet and lands/reloads fighters when hit."
	setVar $BOT~help[4]  $BOT~tab&"  "
	setVar $BOT~help[5]  $BOT~tab&"    Options: "
	setVar $BOT~help[6]  $BOT~tab&"      {fig minimum}   Number of ship fighters to lose before "
	setVar $BOT~help[7]  $BOT~tab&"                      landing and refilling"
	setVar $BOT~help[8]  $BOT~tab&"               {ig}   Reset IG if photoned "
	setVar $BOT~help[9] $BOT~tab&"            {topoff}  Uses fighters in sector first "
	setVar $BOT~help[10] $BOT~tab&"              {fig}   Place fighter if sector figs attacked "
	setVar $BOT~help[11] $BOT~tab&"           {noland}   Do not land - should be running citfill "
	setVar $BOT~help[12] $BOT~tab&"         {sentinel}   Runs sentinel while waiting (15 seconds)"
	gosub :bot~helpfile

	setVar $BOT~script_title "Reloader"
	gosub :BOT~banner


	setvar $CheckCLVDetail 1
	setVar $logfile $bot~folder&"/sentinel"&$year & $month & $day & ".log"

	gosub :player~quikstats
	loadvar $planet~planet

	if ($bot~parm1 = "on")

	else
		setvar $bot~parm2 $bot~parm1
	end

	getwordpos " "&$bot~user_command_line&" " $pos " ig "
	if ($pos > 0)
		setvar $ig true
	else
		setvar $ig false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " topoff "
	if ($pos > 0)
		setvar $topoff true
	else
		setvar $topoff false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " fig "
	if ($pos > 0)
		setvar $replace_fig true
	else
		setvar $replace_fig false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " sent"
	if ($pos > 0)
		setvar $sentinel true
	else
		setvar $sentinel false
	end

	setarray $planets 100 2

	send "\"
	setTextLineTrigger flee_off :flee_off "Online Auto Flee is disabled."
	setTextLineTrigger flee_on :flee_on "Online Auto Flee is enabled."
	pause

:flee_on
	killtrigger flee_off
	send "\"

:flee_off
	killtrigger flee_on
	isNumber $number $bot~parm2
	if ($number = 0) or ($bot~parm2 = 0)
		setVar $threshold $player~fighters
		divide $threshold 2
	else
			setVar $threshold $bot~parm2
	end


setvar $version "1.75"
goto :_START_

:settriggers
	gosub :killreloadtriggers


	setTextLineTrigger 1 :sub_reload "Shipboard Computers"
	setTextLineTrigger 2 :landed		"{"&$bot~bot_name&"} - In Cit - Planet"
	if ($ig = true)
		setTextLineTrigger 3 :ig_turn_it_on_damage " damaging your ship."
	end
	if ($replace_fig)
		setTextLineTrigger 4 :replace_fig " of your fighters in sector "&$player~current_sector
	end
	if ($player~fighters < $ship~SHIP_FIGHTERS_MAX)
		getrnd $random_delay 30000 100000
		setDelayTrigger delay :reload $random_delay 
	end
	if ($sentinel)
		setdelaytrigger    20 :sentinel 15000
	end	
	setTextTrigger pause1 :pausing "Planet command (?="
	setTextTrigger pause2 :pausing "Computer command ["
	setTextTrigger pause3 :pausing "Corporate command ["

	pause

:pausing
	gosub :killreloadtriggers
	echo ANSI_6 "*[" ANSI_14 "Reloader paused. To restart, re-enter Command Prompt" ANSI_6 "]*" ANSI_7
	setTextTrigger 1 :restarting "Command [TL"
	pause
	:restarting
		killtrigger 2
		echo ANSI_6 "*[" ANSI_14 "Reloader restarted" ANSI_6 "]*" ANSI_7
		gosub :player~quikstats
		goto :settriggers


:replace_fig
	setvar $sentinel false
	setvar $line currentline
	getWord $line $test 1
	getwordpos " "&$line&" " $pos " "&$player~current_sector&" "
	if (($test = "F") or ($test = "R") or ($test = "P") or ($pos <= 0))
		setTextLineTrigger 4 :replace_fig " of your fighters in sector "&$player~current_sector
		pause
	end
	gosub :killreloadtriggers
	gosub :topoff
	add $loss 1
	goto :settriggers


:landed
	gosub :killreloadtriggers
	send " q  q  q  q  q  z  n  ** "
	waiton "Warps to Sector(s) :"
	waiton "Command [TL"
	gosub :player~quikstats
	if ($player~current_prompt <> "Command")
		setvar $switchboard~message "Unable to get to Command Prompt. Halting!*"
		gosub :switchboard~switchboard
		halt
	end
	goto :settriggers
:sub_reload
	setvar $sentinel false
	getWord CURRENTANSILINE $ck 1
	if ($ck <> "[K[1A[1;33mShipboard")
		echo "spoof"
		setTextLineTrigger 1 :sub_reload "Shipboard Computers"
		pause
	end
	setVar $reloaderline CURRENTLINE
	GetWordPos $reloaderLine $reloaderCheck "destroyed"
	if ($reloaderCheck = 0)
		echo "Found no damage*"
		setTextLineTrigger 1 :sub_reload "Shipboard Computers"
		pause
	end
	gosub :killreloadtriggers
	While ($reloaderCheck <> 0)
		SetVar $PreviousreloaderLine $reloaderLine
		CutText $PreviousreloaderLine $reloaderLine ($reloaderCheck + 10) 999
		GetWordPos $reloaderLine $reloaderCheck "destroyed"
	end
	GetWordPos $PreviousreloaderLine $reloaderCheck "destroyed"
	CutText $PreviousreloaderLine $PreviousreloaderLine $reloaderCheck 9999
	getText $PreviousreloaderLine $FigDamage "destroyed" "fighters."
	stripText $FigDamage "shield points and"
	getWord $FigDamage $Shield_pnts 1
	getWord $FigDamage $Fig_pnts 2
	if ($shield_pnts > 0)
		add $loss $shield_pnts
	end
	if ($fig_pnts > 0)
		add $loss $fig_pnts
	end
	if ($loss >= $threshold)
		goto :reload
	else
		goto :settriggers
	end

:reload
	gosub :killreloadtriggers
	if ($topoff = true)
		gosub :topoff
	else
		send "l " $planet~planet "*  m  *  *  *  q l* "
		gosub :land_and_check
	end
	setVar $loss 0
	gosub :player~quikstats
	if ($player~fighters < $ship~ship_fighters_max)
		if ($topoff = true)
			gosub :topoff
			gosub :player~quikstats
			if ($player~fighters < $ship~ship_fighters_max)
				setvar $topoff false
			end
		end
	end
	goto :settriggers

:killreloadtriggers
	killtrigger 1
	killtrigger 2
	killtrigger 3
	killtrigger 4
	killtrigger 20
	killtrigger delay
	killtrigger pause1
	killtrigger pause2
	killtrigger pause3
return

:_START_

# ============================== RELOADER (RELOAD) ==============================
:reloader
	setVar $startingLocation $player~current_prompt
	if ($startingLocation <> "Citadel") and ($startingLocation <> "Planet")
		if ($startingLocation <> "Command")
			setvar $switchboard~message "Must start at Planet, Citadel, or Command prompt.*"
			gosub :switchboard~switchboard
			halt
		else
			if ($player~PLANET_SCANNER <> "Yes")
				setVar $SWITCHBOARD~message "You can't run reloader from command prompt without planet scanner.  Start from planet instead.*"
				gosub :SWITCHBOARD~switchboard
				halt
			end

			send "l* "
			gosub :land_and_check

			setvar $switchboard~message "Attempting to use planet "&$planet~planet&".*"
			gosub :switchboard~switchboard

			setvar $planet~land_and_lift true
			gosub :planet~landingsub 
			if ($planet~sucessfulPlanet <> true)
				setvar $switchboard~message "Planet does not appear to be available.  Stopping.*"
				gosub :switchboard~switchboard
				halt
			else
				setvar $startinglocation "Planet"
				if ($planet~sucessfulCitadel = true)
					setvar $startinglocation "Citadel"
				end
			end
		end
	else
		send "q "
		gosub :planet~getplanetinfo
		send "q"
	end
	gosub :ship~getshipstats

	if ($planet~planet_fighters > 0)
		setvar $switchboard~message "Reloader "&$VERSION&" Active - Using Planet "&$planet~planet&" with "&$planet~planet_FIGHTERS&" fighters.*"
	else
		setvar $switchboard~message "Reloader "&$VERSION&" Active - Using Planet "&$planet~planet&".*"
	end
	gosub :switchboard~switchboard
	setvar $switchboard~message "Will reload when I get damaged more than "&$threshold&" fighters and shields.*"
	gosub :switchboard~switchboard
	if ($topoff = true)
		setvar $switchboard~message "Will topoff from sector figs before using planet.*"
		gosub :switchboard~switchboard
	end
	if ($ig = true)
		goto :ig_turn_it_on
	end
	goto :settriggers

# ============================== RELOADER (RELOAD) ==============================

halt

:ig_turn_it_on_damage
	setvar $sentinel false
:ig_turn_it_on
		getWord CURRENTLINE $test 1
		if ($test = "F") or ($test = "R") or ($test = "P")
			setTextLineTrigger 3 :ig_turn_it_on " damaging your ship."
			pause
		end
		killtrigger 1
		killtrigger 2
		killtrigger 3
		setVar $ig_mode 0
		setDelayTrigger ig_timeout :photon_ig_damage_trigger 3000
		setTextTrigger no_ig_trigger :no_ig_available "is not equipped with an Interdictor Generator!"
		setTextTrigger no_ig_beam :no_ig_beam "Beam to what sector? (U=Upgrade Q=Quit)"
		setTextTrigger no_ig_cby :no_ig_cby "ARE YOU SURE CAPTAIN? (Y/N)"
		setTextTrigger need_ig :ig_was_off "Your Interdictor generator is now OFF"
		setTextTrigger ig_fine :ig_was_on "Your Interdictor generator is now ON"
		setTextTrigger do_ig :do_ig_thing "Do you wish to change it? (Y/N)"
		send "q q* b"
		pause

	:no_ig_available
		killtrigger ig_timeout
		killtrigger no_ig_trigger
		killtrigger no_ig_beam
		killtrigger no_ig_cby
		killtrigger ig_fine
		killtrigger do_ig
		setvar $switchboard~message "No IG available on this ship.*"
		gosub :switchboard~switchboard
		setvar $ig false
		goto :settriggers

	:no_ig_beam
		killtrigger ig_timeout
		killtrigger no_ig_trigger
		killtrigger no_ig_beam
		killtrigger no_ig_cby
		killtrigger ig_fine
		killtrigger do_ig
		send " Q "
		goto :settriggers

	:no_ig_cby
		killtrigger ig_timeout
		killtrigger no_ig_trigger
		killtrigger no_ig_beam
		killtrigger no_ig_cby
		killtrigger ig_fine
		killtrigger do_ig
		send " N "
		goto :settriggers

	:ig_was_on
		setVar $ig_mode 1
		pause

	:ig_was_off
		setVar $ig_mode 0
		pause

	:do_ig_thing
		killtrigger ig_timeout
		killtrigger no_ig_trigger
		killtrigger no_ig_beam
		killtrigger no_ig_cby
		killtrigger ig_fine
		killtrigger do_ig
		killtrigger need_ig
		if ($ig_mode = 0)
			send "Y"
			setvar $switchboard~message "IG turned on!*"
			gosub :switchboard~switchboard
		else
			send "N"
			setvar $switchboard~message "IG was already on.*"
			gosub :switchboard~switchboard
		end
		goto :settriggers


:topoff
    :do_topoff_again
        killtrigger topoff_success
        killtrigger topoff_failure1
        killtrigger topoff_failure2
        send "f"
        waitOn "Your ship can support up to"
        getWord CURRENTLINE $ftrs_to_leave 10
        stripText $ftrs_to_leave ","
        stripText $ftrs_to_leave " "
        if ($ftrs_to_leave < 1)
            setVar $ftrs_to_leave 1
        end
        send $ftrs_to_leave & "* c d "
return


:land_and_check
	waitOn "Registry# and Planet Name"
	setVar $planet_count 0
	setTextLineTrigger 1 :planetline "   <"
	setTextLineTrigger 2 :done "Land on which planet "
	setTextLineTrigger 3 :done "You can create one with a Genesis Torpedo."
	pause
	:planetline
		killtrigger 1
		killtrigger 2
		getWordPos CURRENTLINE $pos "<<<< SHIELDED"
		if ($pos <= 0)
			setVar $line CURRENTLINE
			replacetext $line "<" " "
			replacetext $line ">" " "
			striptext $line ","
			getText CURRENTLINE&"[ENDOFLINE]" $string "Level " "[ENDOFLINE]" 
			getword $string $planet_fighters 3
			replacetext $planet_fighters "T" "000"
			replacetext $planet_fighters "M" "000000"
			if ($planet_fighters > 0)
				add $planet_count 1
				setvar $planets[$planet_count][1] $planet_fighters
				getWord $line $planets[$planet_count] 1
			end
		end
		setTextLineTrigger 1 :planetline "   <"
		setTextLineTrigger 2 :done "Land on which planet "
		pause
	:done
		killalltriggers

	setvar $i 1
	setvar $target_planet 0
	setvar $max_fighters 0
	while ($i <= $planet_count)
		if ($planets[$i][1] > $max_fighters)
			setvar $max_fighters $planets[$i][1]
			setvar $target_planet $planets[$i]
		end
		add $i 1
	end
	setvar $planet~planet $target_planet
	#<Atmospheric maneuvering system engaged>
	#Registry# and Planet Name                    Citadel RLvl Fighters QCanRLvl Cls
	#-------------------------------------------------------------------------------
	#   <   6> Pirate Ship                        Level 5   0%    305T      1%    H
	#          Owned by: Sandy Pants [2]
	#   <   7> .                                  Level 6  13%     31T     10%    K
	#          Owned by: Sandy Pants [2]
	#   <   8> Good Time                          Level 5 100%     17T      0%    O
	#          Owned by: Sandy Pants [2]
	#   <  15> Death                              Level 5 100%       0      1%    U
	#          Owned by: Sandy Pants [2]
	#   <  39> Legion                             Level 4   0%     41T      0%    K
	#          Owned by: Sandy Pants [2]
return


:sentinel
	killalltriggers
	gosub :checkcorp
	setvar $broadcast true
	if ($broadcast)
		setvar $switchboard~message ""
		gosub :CheckCLV
		gosub :CheckOnline
		gosub :switchboard~switchboard
	end
	setvar $i 1
	echo "**"
	if ($corp_count > 0)
		echo ansi_14 "*                 Corp Info                   " ansi_15
		echo "*[1;44m  Name                             Sector  [0m"
		while ($i <= $corp_count)
			setvar $name $corp_members[$i]
			padRight $name 30
			echo ansi_14 "*  " $name                        ansi_6  "   " $corp_members[$i][1]
			add $i 1
		end
		echo "**" ansi_15
	end
	echo "*[1;44m        Sentinel Activity        [0m"
	echo "**" ansi_15
goto :settriggers

:checkcorp
	setarray $corp_members 10 1
	setvar $corp_count 0
	send "ta"
	waiton "    Corp Member Name                   Sector  Fighters Shields Mines  Credits"
	waiton "------------------------------------------------------------------------------"
	
	:ta_again
		setTextLineTrigger taline :ta_check
		pause

		:ta_check
			getwordpos CURRENTLINE $pos "P indicates Trader is on a planet in that sector"
			if ($pos > 0)
				goto :done_ta
			end
			setvar $line CURRENTLINE
			cutText $line $name 1 30
			replacetext $line $name ""
			trim $name
			add $corp_count 1
			setvar $corp_members[$corp_count] $name
			getword $line $corp_members[$corp_count][1] 1
		goto :ta_again

	:done_ta
	send "q"
return

:checkclv
	getDate $date
	getTime $time
	setVar $date $date & " "

	if ($CheckCLVPod = "0")
		setVar $CheckCLVPod #42 & #42 & #42 & " Escape Pod " & #42 & #42 & #42
	end

	setVar $CLVFigsHit 0

	send "clv"
	setTextLineTrigger CLVBeginCheck :CLVBeginCheck "--- ---------------------"
	pause

	:CLVBeginCheck
		killtrigger clvcheck
		killtrigger doneclv
		setdelaytrigger doneclv :doneclv 300
		setTextLineTrigger CLVCheck :CLVCheck
		pause

	:CLVCheck
		getLength CURRENTLINE $CLVLen

		if ($CLVLen >= 61)
			cutText CURRENTLINE $CLVPlyr 30 31

			# shave the spaces off the name
			setVar $CLVPlayer ""
			setVar $CLVWord 1
			:CLVWord
				getWord $CLVPlyr $CLVPWord $CLVWord
				if ($CLVPWord <> 0)
					if ($CLVWord = 1)
						setVar $CLVPlayer $CLVPWord
					else
						setVar $CLVPlayer $CLVPlayer & " " & $CLVPWord
					end
					add $CLVWord 1
					goto :CLVWord
				end

				setVar $CLVLRank[$CLVPlayer] $CLVRank[$CLVPlayer]
				setVar $CLVLAlign[$CLVPlayer] $CLVAlign[$CLVPlayer]
				setVar $CLVLCorp[$CLVPlayer] $CLVCorp[$CLVPlayer]
				setVar $CLVLShip[$CLVPlayer] $CLVShip[$CLVPlayer]

				getWord CURRENTLINE $CLVRank[$CLVPlayer] 2
				getWord CURRENTLINE $CLVAlign[$CLVPlayer] 3
				getWord CURRENTLINE $CLVCorp[$CLVPlayer] 4
				cutText CURRENTLINE $CLVShip[$CLVPlayer] 61 999

				stripText $CLVRank[$CLVPlayer] ","
				stripText $CLVAlign[$CLVPlayer] ","

				if ($CLVCorp[$CLVPlayer] <> #42 & #42)
					add $CLVCorpNum[$CLVCorp[$CLVPlayer]] 1

					add $CLVCorpBaseAlign[$CLVCorp[$CLVPlayer]] $CLVAlign[$CLVPlayer]

					if ($CLVCorp[$CLVPlayer] > $CLVHighestCorp)
						setVar $CLVHighestCorp $CLVCorp[$CLVPlayer]
					end
				end

				setVar $CLVRawName $CLVPlayer & "[" & $CLVCorp[$CLVPlayer] & "]"

				if ($Colour = "1")
					if ($CLVAlign[$CLVPlayer] < 0)
						setVar $CLVClr #3 & "4" & $CLVPlayer & #3 & "6[" & $CLVCorp[$CLVPlayer] & "]"
					else
						setVar $CLVClr #3 & "12" & $CLVPlayer & #3 & "6[" & $CLVCorp[$CLVPlayer] & "]"
					end
				else
					setVar $CLVClr $CLVRawName
				end
				if ($CLVInit = 0)
					# first check pass, don't report - just save stuff
					setVar $CLV[$CLVCount] $CLVPlayer
					add $CLVCount 1
				else
					# check pass - compare and report

					if ($CLVShip[$CLVPlayer] <> $CLVLShip[$CLVPlayer])
						# ship has changed
						if ($logfile <> "0")
							write $logfile $time & " - CLV: " & $CLVClr & " is now in " & $CLVShip[$CLVPlayer]
						end
						setvar $switchboard~message $switchboard~message&"CLV: " & $CLVRawName & " is now in " & $CLVShip[$CLVPlayer] & "*"
					end
					if ($CLVCorp[$CLVPlayer] <> $CLVLCorp[$CLVPlayer])
						# corp has changed
						if ($logfile <> "0")
							write $logfile $time & " - CLV: " & $CLVClr & " has jumped from corp " & $CLVLCorp[$CLVPlayer]
						end
						setvar $switchboard~message $switchboard~message&"CLV: " & $CLVRawName & " has jumped from corp " & $CLVLCorp[$CLVPlayer] & "*"
					end
					if ($CLVRank[$CLVPlayer] <> $CLVLRank[$CLVPlayer]) or ($CLVAlign[$CLVPlayer] <> $CLVLAlign[$CLVPlayer])
						if ($CLVRank[$CLVPlayer] < $CLVLRank[$CLVPlayer]) and ($CLVLAlign[$CLVPlayer] < "-100") and ($CLVShip[$CLVPlayer] <> "# Ship Destroyed #") and ($CLVShip[$CLVPlayer] <> $pod)
							# player busted
							if ($CheckCLVDetail = "1")
								if ($logfile <> "0")
									write $logfile $time & " - CLV: " & $CLVClr & " has busted"
								end
								setvar $switchboard~message $switchboard~message&"CLV: " & $CLVRawName & " has busted" & "*"
							end
						else
							setVar $CLVCashing 0
							if ($CLVRank[$CLVPlayer] > $CLVLRank[$CLVPlayer]) and ($CLVAlign[$CLVPlayer] < $CLVLAlign[$CLVPlayer]) and ($CLVLAlign[$CLVPlayer] < "-100")
								setVar $CLVRChange $CLVRank[$CLVPlayer]
								subtract $CLVRChange $CLVLRank[$CLVPlayer]
								setVar $CLVChange $CLVAlign[$CLVPlayer]
								subtract $CLVChange $CLVLAlign[$CLVPlayer]

								# player is cashing
								setVar $CLVCashing 1
								if ($CheckCLVDetail = "1")
									if ($logfile <> "0")
										write $logfile $time & " - CLV: " & $CLVClr & " is cashing (+" & $CLVRChange & " xp, " & $CLVChange & " algn)"
									end
									setvar $switchboard~message $switchboard~message&"CLV: " & $CLVRawName & " is cashing (+" & $CLVRChange & " xp, " & $CLVChange & " algn)*"
								end
							end

							if ($CLVRank[$CLVPlayer] <> $CLVLRank[$CLVPlayer]) and ($CLVCashing = 0)
								# experience has changed
								setVar $CLVChange $CLVRank[$CLVPlayer]
								subtract $CLVChange $CLVLRank[$CLVPlayer]
								if (($CheckCLVDetail = "1") or (($CheckCLVDetail = "2") and (($CLVChange >= "25") or ($CLVChange <= "-25"))))
									if ($CLVChange > 0)
										setVar $CLVChange "+" & $CLVChange
									end
									if ($logfile <> "0")
										write $logfile $time & " - CLV: " & $CLVClr & " has changed experience (" & $CLVChange & ")"
									end
									setvar $switchboard~message $switchboard~message&"CLV: " & $CLVRawName & " has changed experience (" & $CLVChange & ")*"
								end
							end
							if ($CLVAlign[$CLVPlayer] <> $CLVLAlign[$CLVPlayer]) and ($CLVCashing = 0)
								# align has changed
								setVar $CLVChange $CLVAlign[$CLVPlayer]
								subtract $CLVChange $CLVLAlign[$CLVPlayer]

								setVar $CLVFigCorp 0

								if ($CheckCLVFigCorp > 0) and ($CLVCorpAlign[$CheckCLVFigCorp] > 0)
									# find an alignment match with corp figs
									setVar $CLVX $CLVChange
									multiply $CLVX 100
									divide $CLVX $CLVCorpAlign[$CheckCLVFigCorp]
									setVar $CLVZ $CLVX
									divide $CLVZ 100
									multiply $CLVZ 100
									subtract $CLVX $CLVZ

									if ($CLVX < 0)
										multiply $CLVX "-1"
									end

									if (($CLVX <= 1) or ($CLVX >= 99)) and ((($CLVCorpAlign[6] < 0) and ($CLVChange < 0)) or (($CLVCorpAlign[6] > 0) and ($CLVChange > 0))) and ($CLVZ > 0)
										setVar $CLVFigCorp 1
									end
								end

								if ($CLVFigCorp = 0)
									if (($CheckCLVDetail = "1") or (($CheckCLVDetail = "2") and (($CLVChange >= "25") or ($CLVChange <= "-25"))))
										if ($CLVChange > 0)
											setVar $CLVChange "+" & $CLVChange
										end

										if ($logfile <> "0")
											write $logfile $time & " - CLV: " & $CLVClr & " has shifted alignment (" & $CLVChange & ")"
										end
										setvar $switchboard~message $switchboard~message&"CLV: " & $CLVRawName & " has shifted alignment (" & $CLVChange & ")*"
									end
								else
									setVar $FigsHit 1

									if ($CLVChange > 0)
										setVar $CLVChange "+" & $CLVChange
									end

									if ($logfile <> "0")
										write $logfile $time & " - CLV: " & $CLVClr & " may be shooting our figs (" & $CLVChange & " align)"
									end
									setvar $switchboard~message $switchboard~message&"CLV: " & $CLVRawName & " may be shooting corp " & $CheckCLVFigCorp & " figs (" & $CLVChange & " align)"
								end
							end
						end
					end
				end
		else
			getWord CURRENTLINE $CLVTest 1
			if ($CLVTest = "==--") or ($CLVTest = "Computer")
				:doneclv
				killalltriggers
				setVar $CLVCorp $CLVHighestCorp
				:CLVNextCorp
					if ($CLVCorp > 0)
						if ($CLVCorpNum[$CLVCorp] > 0)
							divide $CLVCorpBaseAlign[$CLVCorp] $CLVCorpNum[$CLVCorp]
							setVar $CLVCorpAlign[$CLVCorp] $CLVCorpBaseAlign[$CLVCorp]
							divide $CLVCorpAlign[$CLVCorp] 10000
							multiply $CLVCorpAlign[$CLVCorp] "-1"
							setVar $CLVCorpBaseAlign[$CLVCorp] 0
							setVar $CLVCorpNum[$CLVCorp] 0
						end
						subtract $CLVCorp 1
						goto :CLVNextCorp
					end	

					setVar $CLVInit 1
					send "q "
					return
			end
		end

goto :CLVBeginCheck

# SUB:       ClearData
# Purpose:   Clears all CLV data for a clean re-check

:ClearData
# sys_check

setVar $count 1
:next
	if ($LastPlayer[$count] <> 0)
		setVar $LastPlayer[$count] 0
		add $count 1
		goto :next
	end

return

:CheckOnline
	# sys_check

	send "#"
	setTextLineTrigger pause5 :pause5 "     Who's Playing     "
	pause

	:pause5
		killTrigger checkFailed
		setVar $Count 1
		setTextLineTrigger GetPlayer :GetPlayer
		pause
  
:GetPlayer
  
	if (CURRENTLINE = "")
		if ($Count = 1)
			setTextLineTrigger GetPlayer :GetPlayer
			pause
		else
			goto :GotPlayers
		end
	end
  
	setVar $StripRankPlayer CURRENTLINE
	gosub :StripRank
  
	setVar $StripCorpPlayer $StripRankPlayer
	gosub :StripCorp
  
	setVar $Player $StripCorpPlayer
  
	# see if the player exists
	setVar $I 1
	setVar $Found 0
	:NextPlayer
		if ($LastPlayers[$I] <> 0)
			if ($LastPlayers[$I] = $Player)
				setVar $Found 1
			end
			add $I 1
			goto :NextPlayer
		end
  
	if ($Found = 0) and ($CheckOnlineInit = 1)
		setvar $switchboard~message $switchboard~message&"ONLINEUPDATE: "&$Player&" has entered the game*"
	end
  
	setVar $Players[$Count] $Player
	add $Count 1
	setTextLineTrigger GetPlayer :GetPlayer
	pause
  
	:GotPlayers
	setVar $Players[$Count] 0

	# check for missing players
	setVar $Count 1
  
  :CheckNextPlayer
  if ($LastPlayers[$Count] <> 0)
    setVar $I 1
    setVar $Found 0
    
    :CheckNextPlayer2
    if ($Players[$I] <> 0)
      if ($Players[$I] = $LastPlayers[$Count])
        setVar $Found 1
      end
      add $I 1
      goto :CheckNextPlayer2
    end
    
	if ($Found = 0)
		setvar $switchboard~message $switchboard~message&"ONLINEUPDATE: "&$LastPlayers[$Count]&" has left the game*"
	end
    
    add $Count 1
    goto :CheckNextPlayer
  end
  
  # copy old new list over old one
  setVar $Count 1
  
  :GetNextPlayer
  if ($Players[$Count] <> 0)
    setVar $LastPlayers[$Count] $Players[$Count]
    add $Count 1
    goto :GetNextPlayer
  end
  
  setVar $LastPlayers[$Count] 0
  setVar $CheckOnlineInit 1

  # output results #
  return

:StripRank
  # sys_check
  
  cutText $StripRankPlayer $Rank 1 6 
  if ($Rank = "Robber")
    cutText $StripRankPlayer $StripRankPlayer 8 999
    return
  end
  if ($Rank = "Pirate")
    cutText $StripRankPlayer $StripRankPlayer 8 999
    return
  end
  if ($Rank = "Ensign")
    cutText $StripRankPlayer $StripRankPlayer 8 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 7 
  if ($Rank = "Captain")
    cutText $StripRankPlayer $StripRankPlayer 9 999
    return
  end
  if ($Rank = "Admiral")
    cutText $StripRankPlayer $StripRankPlayer 9 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 8
  if ($Rank = "Civilian")
    cutText $StripRankPlayer $StripRankPlayer 10 999
    return
  end
  if ($Rank = "Corporal")
    cutText $StripRankPlayer $StripRankPlayer 10 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 9 
  if ($Rank = "Annoyance")
    cutText $StripRankPlayer $StripRankPlayer 11 999
    return
  end
  cutText $StripRankPlayer $Rank 1 9 
  if ($Rank = "Terrorist")
    cutText $StripRankPlayer $StripRankPlayer 11 999
    return
  end
  if ($Rank = "Commander")
    cutText $StripRankPlayer $StripRankPlayer 11 999
    return
  end
  if ($Rank = "Commodore")
    cutText $StripRankPlayer $StripRankPlayer 11 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 10 
  if ($Rank = "Prime Evil")
    cutText $StripRankPlayer $StripRankPlayer 12 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 12
  if ($Rank = "1st Sergeant")
    cutText $StripRankPlayer $StripRankPlayer 14 999
    return
  end
  if ($Rank = "Rear Admiral")
    cutText $StripRankPlayer $StripRankPlayer 14 999
    return
  end
  if ($Rank = "Vice Admiral")
    cutText $StripRankPlayer $StripRankPlayer 14 999
    return
  end
  if ($Rank = "Dread Pirate")
    cutText $StripRankPlayer $StripRankPlayer 14 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 13 
  if ($Rank = "Fleet Admiral")
    cutText $StripRankPlayer $StripRankPlayer 15 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 14
  if ($Rank = "Lance Corporal")
    cutText $StripRankPlayer $StripRankPlayer 16 999
    return
  end
  if ($Rank = "Sergeant Major")
    cutText $StripRankPlayer $StripRankPlayer 16 999
    return
  end
  if ($Rank = "Staff Sergeant")
    cutText $StripRankPlayer $StripRankPlayer 16 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 15
  if ($Rank = "Warrant Officer")
    cutText $StripRankPlayer $StripRankPlayer 17 999
    return
  end
  if ($Rank = "Lieutenant J.G.")
    cutText $StripRankPlayer $StripRankPlayer 17 999
    return
  end
  if ($Rank = "Smuggler Savant")
    cutText $StripRankPlayer $StripRankPlayer 17 999
    return
  end
  if ($Rank = "Infamous Pirate")
    cutText $StripRankPlayer $StripRankPlayer 17 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 16
  if ($Rank = "Gunnery Sergeant")
    cutText $StripRankPlayer $StripRankPlayer 18 999
    return
  end
  if ($Rank = "Menace 3rd Class")
    cutText $StripRankPlayer $StripRankPlayer 18 999
    return
  end
  if ($Rank = "Menace 2nd Class")
    cutText $StripRankPlayer $StripRankPlayer 18 999
    return
  end
  if ($Rank = "Menace 1st Class")
    cutText $StripRankPlayer $StripRankPlayer 18 999
    return
  end
  if ($Rank = "Notorious Pirate")
    cutText $StripRankPlayer $StripRankPlayer 18 999
    return
  end
  if ($Rank = "Galactic Scourge")
    cutText $StripRankPlayer $StripRankPlayer 18 999
    return
  end
  if ($Rank = "Heinous Overlord")
    cutText $StripRankPlayer $StripRankPlayer 18 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 17
  if ($Rank = "Private 1st Class")
    cutText $StripRankPlayer $StripRankPlayer 19 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 18 
  if ($Rank = "Nuisance 3rd Class")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  if ($Rank = "Nuisance 2nd Class")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  if ($Rank = "Nuisance 1st Class")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  if ($Rank = "Smuggler 3rd Class")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  if ($Rank = "Smuggler 2nd Class")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  if ($Rank = "Smuggler 1st Class")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  if ($Rank = "Enemy of the State")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  if ($Rank = "Enemy of Humankind")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 19 
  if ($Rank = "Enemy of the People")
    cutText $StripRankPlayer $StripRankPlayer 21 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 20 
  if ($Rank = "Lieutenant Commander")
    cutText $StripRankPlayer $StripRankPlayer 22 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 21
  if ($Rank = "Chief Warrant Officer")
    cutText $StripRankPlayer $StripRankPlayer 23 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 7
  if ($Rank = "Private")
    cutText $StripRankPlayer $StripRankPlayer 9 999
    return
  end
  cutText $StripRankPlayer $Rank 1 8
  if ($Rank = "Sergeant")
    cutText $StripRankPlayer $StripRankPlayer 10 999
    return
  end
  cutText $StripRankPlayer $Rank 1 10 
  if ($Rank = "Lieutenant")
    cutText $StripRankPlayer $StripRankPlayer 12 999
    return
  end
  
  return

:StripCorp
  # sys_check
  
  getLength $StripRankPlayer $Len
  
  if ($Len < 3)
    return
  end
  
  cutText $StripRankPlayer $player~corpData $Len 1
  
  if ($player~corpData = "]")
    subtract $Len 3
    cutText $StripRankPlayer $player~corpData $Len 99
    getWord $player~corpData $player~corpData 1
    StripText $StripRankPlayer " " & $player~corpData
    StripText $player~corpData "["
    StripText $player~corpData "]"
  end
  
return


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\landingsub\planet"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipstats\ship"
