#
# to do
#  random end mac
#  random end mac with delay
#  Kill CitKill person
#  long delay - i.e. someone photons in, you want to trigger off that photon, but wait 3 seconds and shoot own.
#  # Max ATtacks on K - sligh pause to avoid photon?
#  # xscape:n  - attack planet figs, escape via xport
#  Delays should bebased on latency
#    i.e. dont' do additional delayed actions for Min Latency+20 to MinLatency + 80
#    don't do mass move for movement delay + 20 to movement delay + 100
#    max out actions, or at least WARN when they add up to more than photon time
#        i.e. 10 moves when 250ms move delay and 1 second photons
#
#  the RR: is getting photoned on re-entry when people go in same ship again - needs to check ship exists (xportin/out)
#
#  fill citadel i.e. PE fill (drop ore/figs off) bwarp out
#   
# IF in ship X and we are planning on xporting to X, just alert and end! we can check some of the stuff
#
#
# PE PED PEL PELK PEX PXE PXED PXEDX PXEL PXELK PXEX 
#
:check_invade_macro_params
	LOADVAR $GAME~LATENCY
	killalltriggers
	setArray $scan_array 1000
	gosub :PLAYER~quikstats
	setVar $bot~startingLocation $PLAYER~current_prompt
	setVar $bot~validPrompts "Citadel Command"
	gosub :bot~checkStartingPrompt
	setVar $PLAYER~startingLocation $PLAYER~current_prompt
	setvar $starting_ship $player~ship_number

	if ($SHIP~SHIP_MAX_ATTACK <= 0)
		gosub :SHIP~getShipStats
	end

	#IS THIS MASS ACTION?
	setVar $massRetrigger FALSE
	setVar $massAttackOneDone FALSE
	getWordPos $bot~user_command_line $pos "mass"
	if ($pos > 0)
		setVar $massWait TRUE
### STILL NEED TO TEST PXEDX 
		if ($bot~command = "pxex") or ($bot~command = "pxedx") 
			getWordPos $bot~user_command_line $pos "retrigger"
			if ($pos > 0)
				setVar $massRetrigger TRUE
			end
		end
	else
		setVar $massWait FALSE
		#VALIDATION OF PHOTONS
		if ($PLAYER~PHOTONS <= 0)
			setVar $SWITCHBOARD~message "This command requires a photon*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
	end

	setVar $doEndMac FALSE
	getWordPos $bot~user_command_line $pos "mac:"
	if ($pos > 0)
		setVar $doEndMac TRUE
		setVar $cline $bot~user_command_line
		cutText  $cline $endMac $pos 99
		
		replaceText $endMac "^m" "*"
		replaceText $endMac "^b" #8
		replaceText $endMac #42 "*"
		getWordPos $endMac $pos "`"
		getWordPos $endMac $pos2 "'"
		getWordPos $endMac $pos3 "="
	end

	if (($bot~command = "pxe") or ($bot~command = "pe") or ($bot~command = "ped") or ($bot~command = "pxed"))
		setVar $meatgrinder false
		getWordPos $bot~user_command_line $pos "meatgrinder"
		if ($pos > 0)
			setVar $meatgrinder TRUE
		end
	end

	#VALIDATION OF XPORT SHIP
	# # PE PED PEL PELK PEX PXE PXED PXEDX PXEL PXELK PXEX 
	isNumber $test $bot~parm2
	if ((($test = FALSE) or ($bot~parm2 = 0)) AND ($bot~command <> "pe") AND ($bot~command <> "ped"))
		setVar $SWITCHBOARD~message "Parameter 2 invalid*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	cutText $bot~command $twoLetters 1 2

	if ($twoLetters = "px")
		if ($PLAYER~SHIP_NUMBER = $bot~parm2)
			setVar $SWITCHBOARD~message "Your currently in your export ship, Photon XPort will not work.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
	end

	if (($bot~command = "pxex") or ($bot~command = "pxedx") or ($bot~command = "pedx") or ($bot~command = "pex"))
		# Return Retreat - returns a moment later to drain sector cannon
#This needs to instead of random pausing before shooting, to some how test ship still exits
#when using PXEX retrigger - very dangerous - removed sector number to trigger cannon - solves issue of ship being cap'd
		getWordPos $bot~user_command_line $pos "rr:"
		if ($pos > 0)
			setVar $returnRetreat TRUE
			setVar $cline $bot~user_command_line & " "
			getText $cline $rr "rr:" " "
			goSub :returnRetreatMac
		else
			setVar $returnRetreat FALSE
		end
		
		
		getWordPos $bot~user_command_line $pos "dl:"
		if ($pos > 0)
			setVar $delayLand TRUE
			setVar $cline $bot~user_command_line & " "
			getText $cline $delayLandPlanet "dl:" " "
			goSub :delayLandMacro
		else
			setVar $delayLand FALSE
		end

		setVar $xkill FALSE
		getWordPos $bot~user_command_line $pos "xkill"
		if ($pos > 0)
			setVar $xkill TRUE
			setVar $cline $bot~user_command_line & " "
			getText $cline $xkillWords "xkill" " "
			replaceText $xkillWords ":" " "
			getWord $xkillWords $xkillFigs 1 10000
			getWord $xkillWords $xkillWaves 2 10
			
		end
	end

	if ($bot~command = "pxelk") or ($bot~command = "pelk")
		setVar $fullsend FALSE
		getWordPos $bot~user_command_line $pos "kkkk"
		if ($pos > 0)
			setVar $fullsend TRUE
			
		end
	end
	
	if ($bot~command = "pxelk") or ($bot~command = "pelk") or ($bot~command = "pel") or ($bot~command = "pxel")
		getWordPos $bot~user_command_line $pos "xscape:"
		if ($pos > 0)
			setVar $xscape TRUE
			setVar $cline $bot~user_command_line & " "
			getText $cline $xscapeShip "xscape:" " "
			goSub :xscapeMac
		else
			setVar $xscape FALSE
		end

	end

	

	if (($bot~command = "pxedx") or ($bot~command = "pedx"))
		# return defend - returns to pop planets (skips first)

		getWordPos $bot~user_command_line $pos "rd:"
		if ($pos > 0)
			setVar $returnDefend TRUE
			setVar $cline $bot~user_command_line & " "
			getText $cline $rd "rd:" " "
			goSub :returnDefendMac
		else
			setVar $returnDefend FALSE
		end
		
	end
	
	
	getWordPos $bot~user_command_line $pos "tow:"
	if ($pos > 0)
		setVar $towShip TRUE
		setVar $cline $bot~user_command_line & " "
		getText $cline $towShipNum "tow:" " "
		setVar $towShipMac "w w n " & $towShipNum & "* "
	else
		setVar $towShip FALSE
	end

	#CHECK FOR SHIP/PLANET NUMBER IN PARAMETER 3
	isNumber $test $bot~parm3
	if (($test = FALSE) or ($bot~parm3 = 0))
		if ($bot~command = "pxex")
			setvar $bot~parm3 $PLAYER~SHIP_NUMBER
		elseif (($bot~command = "pxel") OR ($bot~command = "pxelk"))
			setVar $SWITCHBOARD~message "Planet Parameter in-valid*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
	end
	#VALIDATION OF ATTACK SECTOR
	isNumber $test $bot~parm1
	if ($test = FALSE)
		setVar $SWITCHBOARD~message "Sector Parameter invalid*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if (($bot~parm1 > 10) AND ($bot~parm1 <= SECTORS) AND ($bot~parm1 <> $MAP~STARDOCK))
	else
		setVar $SWITCHBOARD~message "Invalid attack sector entered*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	#MAKE SURE ATTACK SECTOR IS ADJACENT
	setVar $i 1
	setVar $isFound false
	while (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$i] > 0)
		if (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$i] = $bot~parm1)
			setVar $isFound TRUE
		end
		add $i 1
	end
	if ($isFound = FALSE)
		setVar $SWITCHBOARD~message "Cannot continue.  Sector not Adjacent, aborting..*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	getWordPos " "&$bot~user_command_line&" " $pos "speed"
	if ($pos > 0)
		setVar $speed TRUE
	else
		setVar $speed FALSE
	end
		#CLEARING THE ATTACK SECTOR
		send " c v * y * "&$bot~parm1&"*  "
	#GET PLANET NUMBER IF STARTING FROM CITADEL
	if ($PLAYER~startingLocation = "Citadel")
			if ($player~credits > 0)
				send "t t"&$player~credits&"* "
			end
			send " q  q"
			gosub :PLANET~getPlanetInfo
			send "  C C  "
	end
	setVar $enter   "m  "&$bot~parm1&"*"
	if ($towShip = TRUE)
		setVar $enter $towShipMac & $enter
	end
	setVar $xport   "x   "&$bot~parm2&"*  q  z  n  "
	setVar $xport_back   "x   "&$starting_ship&"*  q  z  n  "
	setVar $photon  "  p y"&$bot~parm1&"*  q  "
return

:start_invade_macro
	if ($massWait = TRUE)
		if ($PLAYER~startingLocation = "Citadel")
			setVar $mac_starting " q  q  "
		else
			setVar $mac_starting "  "
		end
		send "q"
	else
		if ($PLAYER~startingLocation = "Citadel")
			setVar $mac_starting $photon&"q  q  "
		else
			setVar $mac_starting $photon&"  "
		end
	end

 
	if ($bot~command = "pxex")
		setVar $mac_ending      "x   "&$bot~parm3&"*  q  q  z  n"
		setVar $ends_in_sector      TRUE
	elseif ($bot~command = "pex")
		setVar $mac_ending      "x    "&$bot~parm2&"*  q  q  *  z  n  *  "
		setVar $ends_in_sector      TRUE
	elseif ($bot~command = "pel")
		setVar $mac_ending      "LT" & #8 & #8 & $bot~parm2 & "*  *" 
		# while not true - we want to land on our citadel if we get podded
		setVar $ends_in_sector      TRUE
	elseif ($bot~command = "pxel")
		setVar $mac_ending       "LT" & #8 & #8 & $bot~parm3&"*  *  "
		# while not true - we want to land on our citadel if we get podded
		setVar $ends_in_sector      TRUE
	elseif ($bot~command = "pxelk")
		setVar $mac_ending       "LT" & #8 & #8 & $bot~parm3&"*  *  a"&$SHIP~SHIP_MAX_ATTACK&"*"
		if ($fullsend = TRUE)
			goSub :fullSendAttack
			setVar $mac_ending $mac_ending & $fullsendMacro
		end

		# while not true - we want to land on our citadel if we get podded
		setVar $ends_in_sector      TRUE
	elseif ($bot~command = "pelk")
		setVar $mac_ending       "LT" & #8 & #8 & $bot~parm2&"*  *  a"&$SHIP~SHIP_MAX_ATTACK&"*"
		if ($fullsend = TRUE)
			goSub :fullSendAttack
			setVar $mac_ending $mac_ending & $fullsendMacro
		end
		# while not true - we want to land on our citadel if we get podded
		setVar $ends_in_sector      TRUE
	elseif (($bot~command = "pxed") OR ($bot~command = "ped"))
		setVar $mac_ending      "u  y  n  . *  j  c  *  "
		setVar $ends_in_sector      FALSE
	elseif (($bot~command = "pxedx") OR ($bot~command = "pedx"))
		if ($returnDefend = FALSE)
			setVar $mac_ending      "u  y  n  . *  j  c  *  "&$xport_back
		else
			setVar $mac_ending $xport_back
		end
		setVar $ends_in_sector      TRUE
	else
		setVar $mac_ending      ""
		setVar $ends_in_sector      FALSE
	end
	if ($xscape = TRUE)
		setVar $mac_ending $mac_ending&$xscapeMac
	elseif (($PLAYER~startingLocation = "Citadel") AND ($ends_in_sector = TRUE))
		setVar $mac_ending $mac_ending&"LT" & #8 & #8 &  $PLANET~PLANET&" * c"
	end
	if ($doEndMac = TRUE)
		setVar $mac_ending $mac_ending&$endMac
	end
	setVar $mac_ending $mac_ending&"@"

	if ($massWait = FALSE)

		#CHECK THE CLOCK TO OPTIMIZE PHOTON FIRING
		send "  t"
		waitfor ", 2"
		getWord CURRENTLINE $initTime 1
		:Photon_Attack_Timer
			send "  t"
			waitfor ", 2"
			getWord CURRENTLINE $currentTime 1
			waitfor "Computer"
			if ($initTime <> $currentTime)
				if ($speed = TRUE)
					send $mac_starting&$speed_invade_macro&$mac_ending
				else
					send $mac_starting&$normal_invade_macro&$mac_ending
				end
			else
				goto :Photon_Attack_Timer
			end
	else
		setVar $firstMassEntry TRUE
		:replayMassYouDumb
		if ($bot~command = "pxex") or ($bot~command = "pex")  or ($bot~command = "pxel")  or ($bot~command = "pxed")  or ($bot~command = "pxedx") 
			setVar $SWITCHBOARD~message "Mass Attack Waiting for photon shot Target: " & $bot~parm1 & " Ship: " & $bot~parm2 
			if ($massRetrigger = TRUE)
				setVar $SWITCHBOARD~message $SWITCHBOARD~message & " with Retrigger!*"
			else
				setVar $SWITCHBOARD~message $SWITCHBOARD~message & "*"
			end
			gosub :SWITCHBOARD~switchboard
		else
			setVar $SWITCHBOARD~message "Mass Attack Waiting for photon shot Target: " & $bot~parm1
			if ($massRetrigger = TRUE)
				setVar $SWITCHBOARD~message $SWITCHBOARD~message & " with Retrigger!*"
			else
				setVar $SWITCHBOARD~message $SWITCHBOARD~message & "*"
			end
			gosub :SWITCHBOARD~switchboard
		end
		setDelayTrigger MassTimeOut :MassTimeOut 300000
		:photonWaitAgain
		setTextLineTrigger PhotonFired :PhotonFired "launched a Photon Torpedo!"
		pause
		:MassTimeOut
			killalltriggers
			setVar $SWITCHBOARD~message "Mass Attack Time Out.. halting..*"
			gosub :SWITCHBOARD~switchboard
			halt

		:PhotonFired
			killalltriggers
			##[K[1;36mWerewolf[0;32m just launched a Photon Torpedo!
			getText CURRENTANSILINE $testword "[0;32m just launched a " " Torpedo!"

			setVar $line CURRENTANSILINE
			getWordPos $line $loc1 "[1;36m"


			if ($testword <> "Photon")
				## spoof
				echo "Spoof attempt??*"

				goto :photonWaitAgain
			else
				
				getRnd $delaytime 260 330
				setDelayTrigger masspause :masspause $delaytime
				pause
				:masspause

					if ($firstMassEntry = FALSE)
						if ($speed = TRUE)
							send $mac_starting&$speed_invade_macro_retrigger&$mac_ending
						else
							send $mac_starting&$normal_invade_macro_retrigger&$mac_ending
						end
					else
						if ($speed = TRUE)
							send $mac_starting&$speed_invade_macro&$mac_ending
						else
							send $mac_starting&$normal_invade_macro&$mac_ending
						end
					end
					

					setVar $firstMassEntry FALSE
			end
		
	end
	setVar $donewaiting FALSE

	# Go back in, retreat n times, drain cannon
	if ($returnRetreat = TRUE)
		if ($donewaiting = FALSE)
			getRnd $delaytime 80 150
			setDelayTrigger shortpause :shortpause $delaytime
			pause
			:shortpause
				setVar $donewaiting TRUE
		end
		send $rrmac
	end

	# go back in, pop some planets
	if ($returnDefend = TRUE)
		if ($donewaiting = FALSE)
			getRnd $delaytime 80 150
			setDelayTrigger shortpause2 :shortpause2 $delaytime
			pause
			:shortpause2
				setVar $donewaiting TRUE
		end
		send $rdmac
	end
	
	# go back and try and kill some on citkill
	if ($xkill = TRUE)
		if ($xkillFigs = 0)
			setVar $xkillFigs 10000
		end
		if ($bot~command = "pxex") or ($bot~command = "pxedx")
			setVar $shipEnemySector $bot~parm2
			setVar $shipOurSector $PLAYER~SHIP_NUMBER
		else
			setVar $shipEnemySector $PLAYER~SHIP_NUMBER
			setVar $shipOurSector $bot~parm2
		end
		setVar $sloc $PLAYER~startingLocation
			
		waitfor "Average Interval Lag:"
		
		# wait roughly 2 latencys for the citkill person to lift and start attacking ship
		setVar $delmin (2 * $GAME~LATENCY)
		setVar $delmax ($delmin + 70)

		getRnd $delaytime $delmin $delmax
		setDelayTrigger shortpause4 :shortpause4 $delaytime
		pause
		:shortpause4
			setVar $donewaiting TRUE
		
		if ($PLAYER~startingLocation = "Citadel")
			setVar $xmac "q  q  "
		else
			setVar $xmac ""
		end

		setVar $xmac $xmac & "x   "&$shipEnemySector&"*  q  q  z  n"

		send $xmac
		if ($massAttackOneDone = TRUE) and ($massRetrigger = TRUE)
			send $attackMac
		else
			
			gosub :PLAYER~quikstats
			if ($PLAYER~CURRENT_SECTOR <> $bot~parm1)
				if ($PLAYER~startingLocation = "Citadel")
					setVar $rrmac $rrmac &  "LT" & #8 & #8 & $PLANET~PLANET&" * c"
				end
				setVar $SWITCHBOARD~message "We are not in the attack sector!! UH OH!!*"
				gosub :SWITCHBOARD~switchboard
				halt
			else
				setVar $PLAYER~startingLocation "Command ["
				gosub :sector~getSectorData
				setVar $waves 10
				setVar $attackMac ""
				setVar $isFound FALSE
				setVar $nnnn ""

				if (($sector~emptyShipCount + $sector~fakeTraderCount + $sector~realTraderCount) > 0)
					setVar $i 0
					while ($i < ($sector~emptyShipCount + $sector~fakeTraderCount))
						setVar $nnnn $nnnn & "n "
						add $i 1
					end
					setVar $c 1
					while (($c <= $sector~realTraderCount) AND ($isFound = FALSE))
						if ((($CURRENT_SECTOR <= 10) OR ($CURRENT_SECTOR = STARDOCK)) AND $player~TRADERS[$c][2] = TRUE)
							setVar $nnnn $nnnn &"n "
						elseif (($player~TRADERS[$c][1] = $PLAYER~CORP) OR ($player~TRADERS[$c][1] = 100000))
							setVar $nnnn $nnnn &"n "	
						else
							setVar $isFound TRUE	
						end
						add $c 1
					end
				
				else
					echo ANSI_12 "*You have no targets.*" ANSI_7
					return
				end
				
				setVar $n 1
				while ($n <= $xkillWaves)
					setVar $attackMac $attackMac & "z n q z n a " & $nnnn & " y y " & $xkillFigs & "* * "
					add $n 1
				end
				#xport back to photon ship
				setVar $attackMac $attackMac & "x   "& $shipOurSector &"*  q  q  z  n"

				echo $attackMac
				if ($sloc = "Citadel")
					# Land
					setVar $attackMac $attackMac &  "LT" & #8 & #8 & $PLANET~PLANET&" * c"
				end
				setVar $attackMac $attackMac & "@"
				send $attackMac
				setVar $PLAYER~startingLocation $sloc
			end
		end
		
	end

	if ($delayLand = TRUE)
		
		if ($donewaiting = FALSE)
			getRnd $delaytime 80 150
			setDelayTrigger shortpause3 :shortpause3 $delaytime
			pause
			:shortpause3
				setVar $donewaiting TRUE
		end
		send $dlMac

		
	end

	if ($meatgrinder = TRUE)
		goSub :meatgrinder
	end
	# if it's not a massattack it'll just exit out.. so ok to set this
	setVar $massAttackOneDone TRUE

	#OUTPUT THE RESULTS OF THE DAMAGE IF REQUESTED
	if ($speed = FALSE)
		setVar $i 1
		setTextLineTrigger damage   :collect_damage     "The console reports damages of "
		setTextLineTrigger damage_done  :damage_done        "Average Interval Lag:"
		setTextLineTrigger damage_pod   :collect_pod        "You rush to an escape pod and abandon"
		setTextLineTrigger death   :collect_death        "You will have to start"
		pause
		:collect_damage
			setVar $scan_array[$i] CURRENTLINE
			add $i 1
			setTextLineTrigger damage :collect_damage "The console reports damages of "
			pause
		:collect_pod
			setVar $scan_array[$i] CURRENTLINE
			add $i 1
		:damage_done
			killalltriggers
			if ($i > 1)
				setVar $j 1
				send "'*"
				setTextLineTrigger comm :continuedamage "Comm-link open on sub-space band"
				pause
				:continuedamage
					while ($j < $i)
						send $scan_array[$j] & "*"
						add $j 1
					end
					send "*"
					setTextLineTrigger comm2 :continuedamage2 "Sub-space comm-link terminated"
					pause
				:continuedamage2
			end
			if ($massRetrigger = TRUE)
				killalltriggers
				goto :replayMassYouDumb
			end
		:collect_death
			killalltriggers
			halt
	end
	
return

:returnRetreatMac

	if ($PLAYER~startingLocation = "Citadel")
		setVar $rrmac "q  q  "
	else
		setVar $rrmac ""
	end

	
	setVar $mmac ""
	if (($bot~command <> "pxex") and ($bot~command <> "pxedx") and ($bot~command <> "pedx") and ($bot~command <> "pex"))
		
	else
		if ($bot~command = "pxex") or ($bot~command = "pxedx")
			setVar $shipEnemySector $bot~parm2
			setVar $shipOurSector $PLAYER~SHIP_NUMBER
		else
			setVar $shipEnemySector $PLAYER~SHIP_NUMBER
			setVar $shipOurSector $bot~parm2
		end

		# return to ship
		setVar $rrmac $rrmac & "x   "&$shipEnemySector&"*  q  q  z  n"

		setVar $rri 1
		while ($rri <= $rr)
			setVar $mmac $mmac &" m " & $PLAYER~CURRENT_SECTOR & "* * "
			add $rri 1
		end
		
		#xport back to photon ship
		setVar $rrmac $rrmac & $mmac & "x   "&$shipOurSector&"*  q  q  z  n"
		
		if ($PLAYER~startingLocation = "Citadel")
			# Land
			setVar $rrmac $rrmac &  "LT" & #8 & #8 & $PLANET~PLANET&" * c"
		end

	end

return

:delayLandMacro
	# - this only gets call one these ones:
	#   if (($bot~command = "pxex") or ($bot~command = "pxedx") or ($bot~command = "pedx") or ($bot~command = "pex"))
	
	if ($bot~command = "pxex") or ($bot~command = "pxedx")
		setVar $shipEnemySector $bot~parm2
		setVar $shipOurSector $PLAYER~SHIP_NUMBER
	else
		setVar $shipEnemySector $PLAYER~SHIP_NUMBER
		setVar $shipOurSector $bot~parm2
	end

	if ($PLAYER~startingLocation = "Citadel")
		setVar $dlMac "q  q  "
	else
		setVar $dlMac ""
	end
	setVar $dlMac $dlMac & "x   "&$shipEnemySector&"*  q  q  z  n"

	# no idea who owns this planet, so lets just try and land on it and go to cit
	setVar $dlMac $dlMac & "LT" & #8 & #8 &  $delayLandPlanet &" * * * c"

return

:returnDefendMac
	if ($PLAYER~startingLocation = "Citadel")
		setVar $rdmac "q  q  "
	else
		setVar $rdmac ""
	end

	setVar $mmac ""
	if (($bot~command <> "pxedx") and ($bot~command <> "pedx"))
		# Only supports these two for now - 

	else
		if ($bot~command = "pxedx")
			setVar $shipEnemySector $bot~parm2
			setVar $shipOurSector $PLAYER~SHIP_NUMBER
		else
			setVar $shipEnemySector $PLAYER~SHIP_NUMBER
			setVar $shipOurSector $bot~parm2
		end
		# return to ship
		setVar $rdmac $rdmac & "x   "&$shipEnemySector&"*  q  q  z  n"

		setVar $rdi 1
		while ($rdi <= $rd)
			setVar $mmac $mmac &" u  y  n  . *  j  c  *  "
			add $rdi 1
		end
		
		#xport back to photon ship
		setVar $rdmac $rdmac & $mmac & "x   "&$shipOurSector&"*  q  q  z  n"
		if ($PLAYER~startingLocation = "Citadel")
			# Land
			setVar $rdmac $rdmac &  "LT" & #8 & #8 & $PLANET~PLANET&" * c"
		end
	end

return

:xscapeMac
	setVar $xscapeMac  "r * * x   "&$xscapeShip&"*  q  q  z  n"
	if ($PLAYER~startingLocation = "Citadel")
		# Land
		setVar $xscapeMac $xscapeMac &  "LT" & #8 & #8 & $PLANET~PLANET&" * c"
	end

return

:fullSendAttack
	
	setVar $fullsendMacro ""
	setVar $n 1
	while ($n <=10)
		setVar $fullsendMacro $fullsendMacro & "a z 15000* * "
		add $n 1
	end
return


:meatgrinder

	setVar $BOT~command "meatgrinder"
	setVar $BOT~user_command_line " meatgrinder turbo" 
	setVar $BOT~parm1 "turbo"
	setVar $BOT~parm2 ""
	saveVar $BOT~parm1
	saveVar $BOT~parm2
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\"&$bot~mombot_directory&"\modes\offense\_meatgrinder.cts"
	setEventTrigger        meatstop        :meatstop "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\offense\_meatgrinder.cts"
	
	pause
	
	:meatstop
		killalltriggers
		
		halt


halt

include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\ship\getshipstats\ship"
include "source\module_includes\bot\checkstartingprompt\bot"
include "source\bot_includes\sector\getsectordata\sector"