	reqRecording
	logging off
		gosub :BOT~loadVars
	setVar $parm1 $BOT~parm1
	setVar $parm2 $BOT~parm2
	setVar $parm3 $BOT~parm3
	setVar $parm4 $BOT~parm4
	setVar $parm5 $BOT~parm5
	setVar $parm6 $BOT~parm6
	setVar $parm7 $BOT~parm7
	setVar $parm8 $BOT~parm8
	setVar $user_command_line $BOT~user_command_line


	 setVar $BOT~help[1] $BOT~tab&"Bwarp Photon"
	 setVar $BOT~help[2] $BOT~tab&"Uses planet teleport-pad to arrive adjacent a fighter"
	 setVar $BOT~help[3] $BOT~tab&"hit; Launches a photon, returns, and lands"
	 setVar $BOT~help[4] $BOT~tab&"         "
	 setVar $BOT~help[5] $BOT~tab&"Options: "
	 setVar $BOT~help[6] $BOT~tab&"    {scrub sector} - use this if you want to scrub somewhere other"
	 setVar $BOT~help[7] $BOT~tab&"                     than your starting sector"
	 setVar $BOT~help[8] $BOT~tab&"            {holo) - holoscan after photon     "
	 setVar $BOT~help[9] $BOT~tab&"         {dens)ity - density scan after photon     "
	setVar $BOT~help[10] $BOT~tab&"           {mine)s - trigger on mine hits too"
	setVar $BOT~help[11] $BOT~tab&"           "
	setVar $BOT~help[12] $BOT~tab&"  Usage:     "
	setVar $BOT~help[13] $BOT~tab&"     >boton holo"
	setVar $BOT~help[14] $BOT~tab&"     >boton 1234 dens"
	setVar $BOT~help[15] $BOT~tab&"     >boton h mine "
	setVar $BOT~help[16] $BOT~tab&"     >boton "


	gosub :BOT~help_file

	setVar $TagLine				"LoneStar's BWARP PHOTON"
	setVar $TagLineB			"[LSBOTON]"
	setVar $CURENT_VERSION		"1.3"
	setVar $TagLineC			"[LSBOTON v"&$CURENT_VERSION&"]"

	setVar $Hit_Sector			0
	setVar $idx 				11
	setVar $Start_Sector		0

	setVar $PLANET~PLANET		0
	setVar $Planet_Level		0
	setVar $PLANET~PLANET_FUEL			0
	setVar $PLANET~PLANET_FUEL_Min		100
	setVar $Planet_FIG			0
	setVar $PLANET~Planet_TPad			0
	setVar $ORE_TOLERANCE		$PLANET~PLANET_FUEL_Min

	setVar $FIREPHOTON		TRUE
	setVar $ALIENS			FALSE
	setVar $AUTO_RETURN		TRUE

	getWordPos " "&$user_command_line&" " $pos " holo "

	if ($pos > 0)
		setVar $HOLO_SCAN	TRUE
		setVar $DEN_SCAN	FALSE
	else
		setVar $HOLO_SCAN	FALSE
	end

	getWordPos " "&$user_command_line&" " $pos " dens "
	if ($pos > 0)
		setVar $DEN_SCAN	TRUE
		setVar $HOLO_SCAN	FALSE
	else
		setVar $DEN_SCAN	FALSE
	end
	setVar $CONTINUOUS		TRUE
	setVar $TURN_LIMIT		$BOT~bot_turn_limit
	setVar $MINE_REACTION	"None"

	getWordPos " "&$user_command_line&" " $pos " mine "
	if ($pos > 0)
		setVar $MINE_REACTION	"Armids/Limps"
	else
		setVar $MINE_REACTION	"None"
	end

	setVar $UNLIM				$PLAYER~unlimitedGame
	setVar $CREDIT_LIMIT		50000
	setVar $CREDITS_ON_HAND		10000
	setVar $CREDITS_WITHDRAW	200000

	setArray $Figs				SECTORS
	setArray $Sects				SECTORS 5
	setArray $HoloOutput		1000

	isNumber $tst $parm1
	if ($tst = 0)
		setVar $SCRUB_SECT 0
	else
		setVar $SCRUB_SECT $parm1
	end

   	setVar $SWITCHBOARD~message ($TagLine&" v" & $CURENT_VERSION & " - Loading...*")
	gosub :SWITCHBOARD~switchboard

    gosub :PLAYER~quikstats
	gosub :GOOD_TO_GO


:FIRE_IN_THE_HOLE
	setVar $Suffix	""
	if ($AUTO_RETURN)
		if ($SCRUB_SECT = 0)
			setVar $Suffix (" M " & $Start_Sector & "*  Y  Y  *  L Z" & #8 & $PLANET~PLANET & "*  *  J  C  *  ")
		else
			setVar $Suffix (" M " & $SCRUB_SECT & "*  Y  Y  *  J  *  ")
		end
	end

	gosub :Read_In_Figs
	gosub :MSGS_ON
	gosub :PLAYER~quikstats

	if ($PLAYER~ORE_HOLDS < $PLAYER~TOTAL_HOLDS)
		setVar $SWITCHBOARD~message "Ship Holds Are Not Full of ORE.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if (($SCRUB_SECT <> 0) AND ($AUTO_RETURN))
		#Testing For A Fighter Lock - Because there's no Blind Warp Protectin
		setTextTrigger		Sector_IS_Good	:Sector_IS_Good		"All Systems Ready, shall we engage?"
		setTextTrigger		Sector_IS_Bad1	:Sector_IS_Bad		"Do you want to make this transport blind"
		setTextLineTrigger	Sector_IS_Bad2	:Sector_IS_Bad		"This planetary transporter does not have the range."
		setTextLineTrigger	Sector_IS_Bad3	:Sector_IS_Bad		"This planet does not have enough Fuel Ore to transport you."
		send "B"&$SCRUB_SECT&"*N*  "
		pause
		:Sector_IS_Bad
			killAlltriggers
			setVar $SWITCHBOARD~message ($TagLineB&" - Cannot Obtain Fighter Lock On Scrub Sector. Halting!*")
			gosub :SWITCHBOARD~switchboard
			halt
		:Sector_IS_Good
			setVar $SWITCHBOARD~message ($TagLineB&" - Scrub Sector Is Good!*")
			gosub :SWITCHBOARD~switchboard
			killAllTriggers
	end
	:Disp_Banner
	if ($FIREPHOTON)
		setVar $SWITCHBOARD~message ($TagLineC&" Running From Planet #"&$PLANET~PLANET&", with "&$PLAYER~PHOTONS&" Photons.*")
		gosub :SWITCHBOARD~switchboard
	else
		setVar $SWITCHBOARD~message ($TagLineC&" Running From Planet #"&$PLANET~PLANET&", Not Firing A Photon.*")
		gosub :SWITCHBOARD~switchboard
	end
	:inac
	killAllTriggers
	send #27
	SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
	SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
	SetDelayTrigger		Banner		:Banner			350000
	setTextTrigger	BWarp_Blind		:BWarp_Blind 	"Do you want to make this transport blind"
	setTextTrigger	BWarp_GO		:BWarp_GO		"All Systems Ready, shall we engage?"
	setTextLineTrigger BWARP_Miss	:BWarp_Miss		"Computer command [TL="
	setTextLineTrigger	gotem		:gotem			"Photon Missile launched into sector"
	setTextLineTrigger	wrong		:wrong			"That is not an adjacent sector"

	:Again
	if ($ALIENS)
		setTextLineTrigger	FigHit_A	:FigHit_A	"Deployed Fighters Report Sector"
	else
		setTextLineTrigger	FigHit		:FigHit		"Deployed Fighters Report Sector"
	end

	setTextLineTrigger	inac		:inac			"Session termination is imminent."

	if (($MINE_REACTION = "Armids") OR ($MINE_REACTION = "Armids/Limps"))
		if ($ALIENS)
			setTextLineTrigger	Mines_A		:Mines_A	"Your mines in"
		else
			setTextLineTrigger	Mines		:Mines		"Your mines in"
		end
	end
	if (($MINE_REACTION = "Limps") OR ($MINE_REACTION = "Armids/Limps"))
		setTextLineTrigger	Limp		:Limp		"Limpet mine in"
	end
	pause
	:Banner
		killAllTriggers
		goto :Disp_Banner
	:Discod
	   	killAllTriggers
	   	Echo "**" & ANSI_14 & $TagLineB & ANSI_15 & " Disconnected **"
	   	:Disco_Test
		if (CONNECTED <> TRUE)
			setDelayTrigger		Emancipate_CPU		:Emancipate_CPU 3000
			Echo "**" & ANSI_14 & $TagLineB & ANSI_15 & " Auto Land & Resume Initiated - Awaiting Connection!**"
			pause
			:Emancipate_CPU
			goto :Disco_Test
		end
		waitfor "(?="
		setDelayTrigger		WaitingABit		:WaitingABit	3000
		Echo "**" & ANSI_14 & $TagLineB & ANSI_15 & " Connected - Waiting For Command Prompt!**"
		pause
		:WaitingABit
		killAllTriggers
		gosub :PLAYER~quikstats
		if ($PLAYER~CURRENT_PROMPT = "Command")
			send " L Z" & #8 & $PLANET~PLANET & "*  *  J  C  *  "
			setTextLineTrigger	NotLanded	:NotLanded		"Are you sure you want to jettison all cargo?"
			setTextLineTrigger	Landed		:Landed			"<Enter Citadel>"
			setDelayTrigger		TestConn	:TestConn		3000
			pause
			:TestConn
				killAllTriggers
				if (CONNECTED = FALSE)
					goto :Disco_Test
				else
					setVar $SWITCHBOARD~message ($TagLineB & " Problem Detected Unable to Land!*")
					gosub :SWITCHBOARD~switchboard
					halt
				end
			:NotLanded
				killAllTriggers
				setVar $SWITCHBOARD~message ($TagLineB&" - Unable To Land After Reconnect,Check My TA!**")
				gosub :SWITCHBOARD~switchboard
				halt
			:Landed
				killAllTriggers
				setVar $SWITCHBOARD~self_command FALSE
				setVar $SWITCHBOARD~message ($TagLineB&" - Restarting!**")
				gosub :SWITCHBOARD~switchboard
		    	waitfor "Message sent on sub-space channel"
				goto :inac
		elseif ($PLAYER~CURRENT_PROMPT = "Citadel")
			setVar $SWITCHBOARD~self_command FALSE
			setVar $SWITCHBOARD~message ($TagLineB&" - Restarting!**")
			gosub :SWITCHBOARD~switchboard
			waitfor "Message sent on sub-space channel"
	   		goto :inac
	   	else
	   		send (" p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '" & $TagLineB & "Attempting to Reach Correct Prompt...*")
			setTextLineTrigger	EMQ_COMPLETE		:EMQ_DELAY "Attempting to Reach Correct Prompt..."
			setDelayTrigger 	EMQ_DELAY		:EMQ_DELAY 3000
			pause
			:EMQ_DELAY
				killAllTriggers
				goto :Disco_Test
		end
	:Mines
		killTrigger inac
		killTrigger FigHit
		killTrigger Limp
		killTrigger Mines
		killTrigger Fighit_A
		getWord CURRENTLINE $ck 1
		if ($ck <> "Your")
			goto :Again
		end
		getWord CURRENTLINE $Hit_Sector 4
		goto :Pwarp_GO
    :Mines_A
		killTrigger Mines_A
	    	killTrigger Fighit_A
		killTrigger inac
		killTrigger Limp
		getWord CURRENTLINE $Hit_Sector 4
		getWord CURRENTANSILINE $ansi 9
		cutText $ansi $num 10 2
		stripText $Hit_Sector ":"
		if ($num <> 33)
			goto :Pwarp_GO
		else
			goto :Again
		end
	:Limp
		killTrigger Fighit_A
		killTrigger Mines_A
		killTrigger inac
		killTrigger Limp
		killTrigger FigHit
		killTrigger Mines
		getWord CURRENTLINE $ck 1
		if ($ck <> "Limpet")
			goto :Again
		end
		getWord CURRENTLINE $Hit_Sector 4
		goto :Pwarp_GO
	:Fighit_A
		killTrigger inac
		killTrigger Mines_A
		killTrigger Fighit_A
		killTrigger Limp
		getWord CURRENTLINE $Hit_Sector 5
		getWord CURRENTANSILINE $ansi 6
		cutText $ansi $num 10 2
		stripText $Hit_Sector ":"
		isNumber $tst $Hit_Sector
		if (($num <> 33) AND ($tst <> 0))
			goto :Pwarp_GO
		else
			goto :Again
		end
	:Fighit
		killTrigger inac
		killTrigger Mines
		killTrigger Limp
		killTrigger FigHit
		getWord CURRENTLINE $ck 1
		if ($ck <> "Deployed")
			goto :Again
		end
		getWord CURRENTLINE $Hit_Sector 5
		stripText $Hit_Sector ":"
		isNumber $tst $Hit_Sector
		if ($tst = 0)
			goto :Again
		end
	:Pwarp_GO
		SetVar $Launch_From $Sects[$Hit_Sector]
		if ($Launch_From <> 0)
			send " B " & $Launch_From & "*  C  Q  "
			pause
		else
			goto :Again
		end
	:BWarp_Blind
		killAllTriggers
		send " N "
		gosub :Clear_Sector
		killAllTriggers
		goto :inac
	:BWarp_Miss
		killAllTriggers
		gosub :Clear_Sector
		goto :inac
	:BWarp_GO
		killTrigger BWARP_Miss
		killTrigger BWarp_Blind
		killTrigger BWarp_GO
		if ($FIREPHOTON)
			send ("y  *  c  p  y  "&$Hit_Sector&"**Q")
			pause
		else
			send ("y  *  ")
			goto :gotem_with_no_photon
		end
		:gotem
			killAllTriggers
			getWord CURRENTLINE $ck 1
			if ($ck <> "Photon")
				goto :inac
			end
			:gotem_with_no_photon
			if ($HOLO_SCAN)
				gosub :doScan
			elseif ($DEN_SCAN)
				gosub :doScan_Den
			end

			if ($AUTO_RETURN)
				if ($SCRUB_SECT <> 0)
					if ($FIREPHOTON)
					    setVar $SWITCHBOARD~message ($TagLineB&" FIRED " & $Launch_From & "->" & $Hit_Sector & "* ")
					    gosub :SWITCHBOARD~switchboard
					    send $Suffix
					else
					    setVar $SWITCHBOARD~message ($TagLineB&" TRIGGERED " & $Launch_From & "->" & $Hit_Sector & "* ")
					    gosub :SWITCHBOARD~switchboard
						send  $Suffix
					end
					setTextTrigger		ReturnedSafe	:ReturnedSafe	"Are you sure you want to jettison all cargo"
					setDelayTrigger		NotSafe2	:WhatsUp		4000
					pause
					:ReturnedSafe
						killAllTriggers
						gosub :PLAYER~quikstats
						if ($PLAYER~CURRENT_SECTOR <> $SCRUB_SECT)
							setVar $WeReHere $PLAYER~CURRENT_SECTOR
							gosub :CALL_SAVE_ME
							halt
						end
						gosub :SPIT_IT_OUT
						halt
				else
					if ($FIREPHOTON)
				    	setVar $SWITCHBOARD~message ($TagLineB&" FIRED " & $Launch_From & "->" & $Hit_Sector & "* ")
					    gosub :SWITCHBOARD~switchboard
				    	send $suffix
				    else
						setVar $SWITCHBOARD~message ($TagLineB&" TRIGGERED " & $Launch_From & "->" & $Hit_Sector & "* ")
					    gosub :SWITCHBOARD~switchboard
						send $suffix
					end
					setTextLineTrigger	Landed		:doScan_Landed		"Enter Citadel"
					setTextTrigger		NotLanded	:doScan_NotLanded	"Are you sure you want to jettison all cargo"
					setDelayTrigger		WhatsUp		:WhatsUp			4000
					pause
					:WhatsUp
						killAllTriggers
						gosub :PLAYER~quikstats
						if ($PLAYER~CURRENT_PROMPT <> "Command")
							send (" p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '" & $TagLineB & " Attempting To Reach Correct Prompt...*")
							setTextLineTrigger	EMQ_COMPLETE	:EMQ_DELAY "Attempting To Reach Correct Prompt..."
							setDelayTrigger 	EMQ_DELAY		:EMQ_DELAY 3000
							pause
							:EMQ_DELAY
								killAllTriggers
	    				end
						setVar $WeReHere CURRENTSECTOR
						gosub :CALL_SAVE_ME
						halt
					:doScan_NotLanded
						killAllTriggers
						setTextTrigger	WhereAreWe	:WhereAreWe "(?="
						send "   *   "
						pause
						:WhereAreWe
							getText CURRENTLINE $WeReHere "]:[" "] (?=He"
							isNumber $tst $WeReHere
							if ($tst = 0)
								setVar $WeReHere 0
							end
							if ($WeReHere <> $Start_Sector)
								gosub :CALL_SAVE_ME
							else
								gosub :SPIT_IT_OUT
								setVar $SWITCHBOARD~message ($TagLineB&" Planet #"&$PLANET~PLANET&" Not In Sector, Halting!!*")
								gosub :SWITCHBOARD~switchboard
								halt
							end
							halt
					:doScan_Landed
						killAllTriggers
				end
			else

				if ($FIREPHOTON)
					setVar $SWITCHBOARD~message ($TagLineB&" FIRED " & $Launch_From & "->" & $Hit_Sector & ", Halting!!*")
					gosub :SWITCHBOARD~switchboard
				else
					setVar $SWITCHBOARD~message ($TagLineB&" TRIGGERED " & $Launch_From & "->" & $Hit_Sector & ", Halting!!*")
					gosub :SWITCHBOARD~switchboard
				end
				gosub :SPIT_IT_OUT
				halt
			end

			gosub :SPIT_IT_OUT
			gosub :PLAYER~quikstats

			if ($PLAYER~CURRENT_PROMPT = "Citadel")
				send " Q "
				gosub :PLANET~getPlanetInfo
				send "T N L 2* T N L 3* T N T 1* C "
				if ($PLANET~PLANET_FUEL < $ORE_TOLERANCE)
					SetVar $CashAmount $PLANET~PLANET_FUEL
					gosub :CommaSize
					setVar $SWITCHBOARD~message ($TagLineB&" Planet ORE at " & $CashAmount & ", Stopping*")
					gosub :SWITCHBOARD~switchboard
					halt
				end
			else
				setVar $SWITCHBOARD~message ($TagLineB&" At Wrong Prompt. Should be in the Citadel!**")
				gosub :SWITCHBOARD~switchboard
				halt
			end

			if ($CONTINUOUS)
				if ($PLAYER~PHOTONS = 0)
					gosub :WITHDRAW_CASH
					if ($Loot < $CREDIT_LIMIT)
						setVar $SWITCHBOARD~message ($TagLineB&" Not Enough Cash To Furb - Halting!*")
						gosub :SWITCHBOARD~switchboard
						halt
					end

					gosub :Buy_Fotons
					gosub :PLAYER~quikstats
					if ($PLAYER~PHOTONS = 0)
						setVar $SWITCHBOARD~message ($TagLineB&" No Photons Furb'd - Halting!*")
						gosub :SWITCHBOARD~switchboard
						halt
					end
					if ($PLAYER~CREDITS > $CREDITS_ON_HAND)
						send (" TT"&($PLAYER~CREDITS - $CREDITS_ON_HAND)&"*")
						gosub :SWITCHBOARD~switchboard
					end
				end
				gosub :PLAYER~quikstats
			if ($UNLIM = 0)
		            if ($PLAYER~TURNS <= $TURN_LIMIT)
						setVar $SWITCHBOARD~message ($TagLineB&" Turn Limit Reached. Halting!*")
						gosub :SWITCHBOARD~switchboard
						halt
					end
				end

				if ($PLAYER~ORE_HOLDS < $PLAYER~TOTAL_HOLDS)
					setVar $SWITCHBOARD~message ($TagLineB&" Ship Holds Not Full Of ORE - Halting!*")
		gosub :SWITCHBOARD~switchboard
					halt
				end
				goto :Disp_Banner
			end
halt

		:wrong
			killAllTriggers
			gosub :PLAYER~quikstats
			if ($PLAYER~CURRENT_PROMPT = "Citadel")

			elseif ($PLAYER~CURRENT_PROMPT = "Command")
				if ($PLAYER~CURRENT_SECTOR <> $Start_Sector)
					setVar $WeReHere $PLAYER~CURRENT_SECTOR
					gosub :CALL_SAVE_ME
					halt
				else
					send " L Z" & #8 & $PLANET~PLANET & "*  *  J  C  *  ^ Q "
					waitfor ": ENDINTERROG"
					gosub :PLAYER~quikstats
					if ($PLAYER~CURRENT_PROMPT <> "Citadel")
						setVar $SWITCHBOARD~message ($TagLineB&" At Wrong Prompt. Should be in the Citadel!**")
						gosub :SWITCHBOARD~switchboard
						halt
					end
				end

				send "  Q  "
				gosub :PLANET~getPlanetInfo
				send "T  N  L  2*  T  N  L  3*  T  N  T  1*  C  "
				
				if ($UNLIM = 0)
		            if ($PLAYER~TURNS <= $TURN_LIMIT)
						setVar $SWITCHBOARD~message ($TagLineB&" Turn Limit Reached. Halting!*")
						gosub :SWITCHBOARD~switchboard
						halt
					end
				end

				
				if ($PLANET~PLANET_FUEL < $ORE_TOLERANCE)
					SetVar $CashAmount $PLANET~PLANET_FUEL
					gosub :CommaSize
					setVar $SWITCHBOARD~message ($TagLineB&" Planet ORE at " & $CashAmount & ", Stopping*")
		gosub :SWITCHBOARD~switchboard
					halt
				end
				if ($PLAYER~PHOTONS = 0)
					setVar $SWITCHBOARD~message ($TagLineB&" Out Of Photons, Stopping!*")
		gosub :SWITCHBOARD~switchboard
					halt
				end
			else
				setVar $SWITCHBOARD~message ($TagLineB&" At Wrong Prompt. Should be in the Citadel!**")
		gosub :SWITCHBOARD~switchboard
				halt
			end
			goto :inac
			halt

    #=--------                                                                       -------=#
     #=------------------------------      SUB ROUTINES      ------------------------------=#
    #=--------                                                                       -------=#
:ALIENS_CHECK
	SetTextLineTrigger	Aliens		:AlienRaceFound		"are on the move"
	SetTextTrigger		Nadda		:Nadda				"(?="
	send "#"
	waitfor "Who's Playing"
	pause
	:AlienRaceFound
		killAllTriggers
		setVar $ALIENS TRUE
		return
	:Nadda
    	killAllTriggers
    	setVar $ALIENS FALSE
    	return

:CALL_SAVE_ME
    setTextTrigger friendlyplanet :friendlyplanet "Saveme script activated - Planet "
    setDelayTrigger timeout :timeout 30000
	send "'"&$WeReHere&"=saveme* F Z 1 * Z C D * "
    pause
    :timeout
        killalltriggers
		setVar $SWITCHBOARD~message ($TagLineB&" 30 seconds after save call, script halted.**")
		gosub :SWITCHBOARD~switchboard
		halt
    :friendlyplanet
        killalltriggers
        getText CURRENTLINE $planet "Saveme script activated - Planet " " to "
        send "L " & $planet & "* C 'I landed on planet " & $planet & "* * "
		halt
	return

:GOOD_TO_GO
	if ($PLAYER~CURRENT_PROMPT <> "Citadel")
		setVar $SWITCHBOARD~message ($TagLineB&" Must Start From The Citadel**")
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ((STARDOCK = "") OR (STARDOCK = 0))
		setVar $SWITCHBOARD~message ($TagLineB&" StarDock Not In TWX DBase!**")
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($PLAYER~PHOTONS <= 0)
		setVar $SWITCHBOARD~message ($TagLineB&" Ship is out of photons, shutting down.*")
		gosub :SWITCHBOARD~switchboard
		halt
	else
   		setVar $FIREPHOTON TRUE
   	end

	setVar $Start_Sector $PLAYER~CURRENT_SECTOR


	if ($PLAYER~CREDITS > $CREDITS_ON_HAND)
		send ("TT"&($PLAYER~CREDITS - $CREDITS_ON_HAND)&"*")
		gosub :SWITCHBOARD~switchboard
	end
	send "q "
	gosub :PLANET~getPlanetInfo
	send "c "
   	if ($PLANET~Planet_TPad = 0)
		setVar $SWITCHBOARD~message ($TagLineB&" Planet Does Not Appear To Have Transport Pad*")
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($PLANET~PLANET	= 0)
		setVar $SWITCHBOARD~message ($TagLineB&" Unable To Obtain Planet Number.*")
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($PLANET~PLANET_FUEL	< $PLANET~PLANET_FUEL_Min)
		setVar $SWITCHBOARD~message ($TagLineB&" Planet Has Too Little Fuel ORE*")
		gosub :SWITCHBOARD~switchboard
		halt
	end

	send " cn"
	setTextLineTrigger 	CN1				:CN1			" ANSI graphics            - Off"
	setTextLineTrigger	CN2				:CN2			" Animation display        - On"
	setTextLineTrigger	CN9				:CN9			" Abort display on keys    - ALL KEYS"
	setTextLineTrigger	CNA				:CNA			" Message Display Mode     - Long"
	setTextLineTrigger	CNB				:CNB			" Screen Pauses            - Yes"
	setTextLineTrigger	CNC				:CNC			" Online Auto Flee         - On"
	setTextTrigger		CND				:CND			"Settings command (?=Help)"
	pause

	:CN1
		killTrigger CN1
		setVar $CN1 TRUE
		pause
	:CN2
		killTrigger CN2
		setVar $CN2 TRUE
		pause
	:CN9
		killTrigger CN9
		setVar $CN9 TRUE
		pause
	:CNA
		killTrigger CNA
		setVar $CNA TRUE
		pause
	:CNB
		killTrigger CNB
		setVar $CNB TRUE
		pause
	:CNC
		killTrigger CNC
		setVar $CNC TRUE
		pause
	:CND
		killAllTriggers
		setVar $str ""
		if ($CN1)
			setVar $str ($str & "1")
		end
		if ($CN2)
			setVar $str ($str & "2")
		end
		if ($CN9)
			setVar $str ($str & "9")
		end
		if ($CNA)
			setVar $str ($str & "A")
		end
		if ($CNB)
			setVar $str ($str & "B")
		end
		if ($CNC)
			setVar $str ($str & "C")
		end

	send $str & " q q "
	waitfor "Citadel command (?="
	send " SZ*  Q  T  N  L  1*  T  N  L  2*  T  N  L  3*  T  N  T  1*  C  C  U  Y  V  0*  Y  Y  Q"
	waitfor "<Computer deactivated>"
	waitfor "Citadel command (?="

	if ((SECTOR.FIGS.OWNER[$Start_Sector] <> "belong to your Corp") AND (SECTOR.FIGS.OWNER[$Start_Sector] <> "yours"))
		setVar $SWITCHBOARD~message ($TagLineB&" Must Have Friendly Fighter(s) Deployed In Start Sector!!*")
		gosub :SWITCHBOARD~switchboard
		halt
	end
	return

:Read_In_Figs
	Echo ("**" & ANSI_14 & $TagLineB & ANSI_15 & " Reading Sector Parameters & Building Arrays...**")
		gosub :SWITCHBOARD~switchboard
	setVar $idx 11

	while ($idx <= SECTORS)
		getSectorParameter $idx "FIGSEC" $flag
		isNumber $tst $flag
		if ($tst <> 0)
			if ($flag > 0)
				setVar $Figs[$idx] 1
			end
		end
       	add $idx 1
	end

	setVar $idx 11
	setVar $FCnt 0

	while ($idx <= SECTORS)
		setVar $i 1
		setVar $ptr 1
		while ($i <= SECTOR.WARPCOUNT[$idx])
			setVar $adj SECTOR.WARPS[$idx][$i]
			if (($Figs[$adj] <> 0) AND ($ptr <= 5))
				if ($ptr = 1)
					setVar $Sects[$idx] $adj
					add $FCnt 1
				else
					setVar $Sects[$idx][$ptr] $adj
				end
				add $ptr 1
			end
			add $i 1
		end
		add $idx 1
	end

	if ($FCnt = 0)
		setVar $SWITCHBOARD~message ($TagLineB&" No Deployed Fighter Data Located. Update FIG List!*")
		gosub :SWITCHBOARD~switchboard
		halt
	end

	return


:Clear_Sector
	if ($Launch_From <> 0)
		setVar $ptr $Sects[$Launch_From]
		setVar $j 1
		while ($j <= 5)
			if ($ptr <> 0)
		    	setVar $i 1
				while ($i < 5)
					if (($Sects[$ptr][$i] = $Launch_From) OR ($Sects[$ptr][$i] = 0))
						if ($i = 1)
							setVar $Sects[$ptr] $Sects[$ptr][$i]
							setVar $Sects[$ptr][$i] 0
						else
							setVar $Sects[$ptr][$i] $Sects[$ptr][($i+1)]
							setVar $Sects[$ptr][($i+1)] 0
						end
					end
		        	add $i 1
				end
			end
			setVar $ptr $Sects[$Launch_From][$j]
			add $j 1
		end
		setVar $Sects[$Launch_From]		0
		setVar $Sects[$Launch_From][1]	0
		setVar $Sects[$Launch_From][2]	0
		setVar $Sects[$Launch_From][3]	0
		setVar $Sects[$Launch_From][4]	0
		setVar $Sects[$Launch_From][5]	0
	end
	return

:doScan_Den
	setVar $Line_Pointer 1
	send ("  S  D*  J  *  ")
	waitfor "-------------------------------------------"
	setTextTrigger	DoneScan_D			:DoneScan_D		"Command [TL="
	setTextTrigger end_of_lines_D		:end_of_lines_D	"Are you sure you want to jettison all cargo"
	:reset_trigger_D
	setTextLineTrigger line :line_D
	pause
	:line_D
	setVar $Scan_Line_D CURRENTLINE
	if (($Scan_Line_D = "") OR ($Scan_Line_D = 0))
		goto :reset_trigger_D
	end
	if ($Line_Pointer <= 1000)
		replaceText $Scan_Line_D " ==>    " " => "
		replaceText $Scan_Line_D "  Warps : " "  Warps: "
		replaceText $Scan_Line_D "   NavHaz :   " " Haz: "
		replaceText $Scan_Line_D "  Anom : " " Anom: "
		setVar $HoloOutput[$Line_Pointer] $Scan_Line_D
		add $Line_Pointer 1
	end
	goto :reset_trigger_D

	:end_of_lines_D
    	killTrigger line_D
		setVar $HoloOutput[$Line_Pointer] "ENDENDENDENDENDENDEND"
		pause
	:DoneScan_D
		killAllTriggers
		return

:doScan
	setVar $Line_Pointer 1
	send (" S H*  J  *  ")
	setTextLineTrigger	DoneScan		:DoneScan		"Warps to Sector(s) :"
	setTextLineTrigger	NoScan			:NoScan			"Handle which mine type, 1 Armid or 2 Limpet"
	setTextTrigger		end_of_lines	:end_of_lines	"Are you sure you want to jettison all cargo"
	:reset_trigger
	setTextLineTrigger line :line
	pause
	:line
	setVar $HoloOutput[$Line_Pointer] CURRENTLINE
	if ($Line_Pointer <= 1000)
		add $Line_Pointer 1
	end
	goto :reset_trigger

	:DoneScan
	killTrigger line
	setVar $HoloOutput[$Line_Pointer] "ENDENDENDENDENDENDEND"
	pause
	:NoScan
	killAllTriggers
	# Prob hit with a foton
	halt
	:end_of_lines
	killAllTriggers
	return

:CommaSize
	if ($CashAmount < 1000)
		#do nothing
	elseif ($CashAmount < 1000000)
    	getLength $CashAmount $len
		setVar $len ($len - 3)
		cutText $CashAmount $tmp 1 $len
		cutText $CashAMount $tmp1 ($len + 1) 999
		setVar $tmp $tmp & "," & $tmp1
		setVar $CashAmount $tmp
	elseif ($CashAmount <= 999999999)
		getLength $CashAmount $len
		setVar $len ($len - 6)
		cutText $CashAmount $tmp 1 $len
		setVar $tmp $tmp & ","
		cutText $CashAmount $tmp1 ($len + 1) 3
		setVar $tmp $tmp & $tmp1 & ","
		cutText $CashAmount $tmp1 ($len + 4) 999
		setVar $tmp $tmp & $tmp1
		setVar $CashAmount $tmp
	end
	return

:MSGS_ON
    :ON_AGAIN
    setTextTrigger onMSGS_ON  :onMSGS_ON "Displaying all messages."
    setTextTrigger onMSGS_OFF :onMSGS_OFF "Silencing all messages."
    send "|"
    pause
    :onMSGS_OFF
    killAllTriggers
    goto :ON_AGAIN
    :onMSGS_ON
    killAllTriggers
    return

:SPIT_IT_OUT
	if ($Line_Pointer > 0)
		if ($HOLO_SCAN)
			setVar $i 1
			send "'*"
			send ("{" & $SWITCHBOARD~bot_name & "} "&$TagLineB&" -------- Sector Scan From " & $Launch_From & " ---------*")
			while ($i < $Line_Pointer)
				getWordPos $HoloOutput[$i] $pos ("Sector  : " & $Hit_Sector)
				if ($pos <> 0)
					while ($i < $Line_Pointer)
						getWordPos $HoloOutput[$i] $pos "Warps to Sector(s) :"
						if (($HoloOutput[$i] = "") OR ($pos <> 0))
							send "     **"
							goto :Done_Scn
						end
						send ($HoloOutput[$i] & "*")
	                	add $i 1
					end
	            end
				add $i 1
			end
			:Done_Scn
		elseif ($DEN_SCAN)
			setVar $i 1
			send "'*"
			send ("{" & $SWITCHBOARD~bot_name & "} "&$TagLineB&" ------- Sector Density Scan From " & $Launch_From & " --------*")
			while ($i < $Line_Pointer)
				getWordPos $HoloOutput[$i] $pos "Command [TL="
				if ($pos = 0)
					send ($HoloOutput[$i] & "*")
				else
					send "    **"
					goto :Done_Scn_D
				end
                	add $i 1
			end
			:Done_Scn_D
		end
	end
	return


:Buy_Fotons
	killAllTriggers
	if ($PLAYER~ALIGNMENT < 1000)
		setVar $SWITCHBOARD~message ($TagLineB&" Unable To Furb - Alignment's Below 1,000!*")
		gosub :SWITCHBOARD~switchboard
		halt
	end

   	setTextLineTrigger DoneBurst		:DoneBurst		": ENDINTERROG"
	#clear avoids, turn on twarp, plot warp courses
	send  (" C V O* Y N " & STARDOCK & "* V 0* Y N " & $Start_Sector & "* U Y Q* ^F" & $PLAYER~CURRENT_SECTOR & "*" & STARDOCK & "*F" & STARDOCK & "*" & $PLAYER~CURRENT_SECTOR & "*Q")
	pause
	:DoneBurst
		killAllTriggers

	setDelayTrigger Wait_A_Bit			:Wait_A_Bit		1000
	pause
	:Wait_A_Bit
		killAllTriggers

	getDistance $Dist $PLAYER~CURRENT_SECTOR STARDOCK
	if ($PLANET~Planet_TPad < $Dist)
		setVar $SWITCHBOARD~message ($TagLineB&" Unable To Furb - StarDock Is Out Of Range Of T-Pad!*")
		gosub :SWITCHBOARD~switchboard
		halt
	end
	getDistance $Dist STARDOCK $PLAYER~CURRENT_SECTOR
	if ($Dist > ($PLAYER~ORE_HOLDS / 3))
		setVar $SWITCHBOARD~message ($TagLineB&" Unable To Furb - Not Enough Gas For Return Trip!*")
		gosub :SWITCHBOARD~switchboard
	   halt
	end

	setTextLineTrigger	itsalive 	:Buy_Fotons_itsalive		"Items     Status  Trading % of max OnBoard"
	setTextLineTrigger	nosoupforme	:Buy_Fotons_nosoupforme		"I have no information about a port in that sector"
	setDelayTrigger		WeHaveAProb	:Buy_Fotons_WeHaveAProb		3000
	send ("CR"&STARDOCK&"*Q ")
	waitfor "Computer command [TL"
	pause
	:Buy_Fotons_WeHaveAProb
		killAllTriggers
		setVar $SWITCHBOARD~message ($TagLineB&" Unable To Furb - Problem Comfirming StarDock's Alive (Timed Out)!*")
		gosub :SWITCHBOARD~switchboard
		halt
	:Buy_Fotons_nosoupforme
		killAllTriggers
		setVar $SWITCHBOARD~message ($TagLineB&" Unable To Furb - StarDock Appears To Have Been Blown!*")
		gosub :SWITCHBOARD~switchboard
		halt
	:Buy_Fotons_itsalive
		killAllTriggers

	gosub :PLAYER~quikstats

   	setTextTrigger	Buy_Fotons_Blind	:Buy_Fotons_Blind 	"Do you want to make this transport blind"
	setTextTrigger	Buy_Fotons_GO		:Buy_Fotons_GO		"All Systems Ready, shall we engage?"
	setTextLineTrigger Buy_Fotons_Miss	:Buy_Fotons_Miss	"Computer command [TL="
	send " B " & STARDOCK & "* C Q "
	Pause
	:Buy_Fotons_Blind
		killAllTriggers
		setVar $SWITCHBOARD~message ($TagLineB&" Unable To Furb - Unable To Obtain B-Warp Lock!*")
		gosub :SWITCHBOARD~switchboard
		halt
	:Buy_Fotons_Miss
		killAllTriggers
		setVar $SWITCHBOARD~message ($TagLineB&" Unable To Furb - Unable To B-Warp. Planet ORE May Be Low!*")
		gosub :SWITCHBOARD~switchboard
		halt
	:Buy_Fotons_GO
		killAllTriggers
		send " Y  P  SGYGQHP"
		waitFor "How many Photon Missiles do you want"
		getText CURRENTLINE $Lets_Buy "(Max " ")"
		send $Lets_Buy "*"

	    setTextTrigger Buy_Fotonstwarp_lock       :Buy_Fotonstwarp_lock 	"All Systems Ready, shall we engage"
	    setTextTrigger Buy_Fotonsno_twrp_lock     :Buy_Fotonsno_twarp_lock	"Do you want to make this jump blind"
		send ("Q  Q  Q  Z  N  *  M" & $Start_Sector & "* Y ")
		pause
		:Buy_Fotonsno_twarp_lock
			killAllTriggers
			send " N  *  P  SGYG"
			setVar $SWITCHBOARD~message ($TagLineB&" Unable To Return, Blind Warp Averted Hiding On Dock!*")
		gosub :SWITCHBOARD~switchboard
			halt
		:Buy_Fotonstwarp_lock
        	killAllTriggers
        	send (" Y *  *  L Z"&#8&$PLANET~PLANET&"*  * JC*")
		gosub :SWITCHBOARD~switchboard
			setTextLineTrigger	Buy_Fotons_NotLanded1	:Buy_Fotons_NotLanded1		"Are you sure you want to jettison all cargo?"
			SetDelayTrigger		Buy_Fotons_NotLAnded2	:Buy_Fotons_NotLanded2		4000
			setTextLineTrigger	Buy_Fotons_Landed		:Buy_Fotons_Landed			"<Enter Citadel>"
			pause
			:Buy_Fotons_NotLanded1
				killAllTriggers
				setVar $SWITCHBOARD~message ($TagLineB&" Not Landed. Planet "&$PLANET~PLANET&", Not Found!*")
		gosub :SWITCHBOARD~switchboard
				halt
			:Buy_Fotons_NotLanded2
				killAllTriggers
				setVar $SWITCHBOARD~message ($TagLineB&" Return Trip Timed Out - Check My TA!*")
		gosub :SWITCHBOARD~switchboard
				halt
			:Buy_Fotons_Landed
				killAllTriggers
				send "Q T N T 1* * C"
	return

:WITHDRAW_CASH
	setVar $Loot 0
	setTextLineTrigger	Treasury				:Treasury					"Citadel treasury contains"
	setDelayTrigger		Tellers_On_A_SmokeBreak	:Tellers_On_A_SmokeBreak	3000
	send "  D"
	pause
	:Tellers_On_A_SmokeBreak
		killAllTriggers
		setVar $SWITCHBOARD~message ($TagLineB&" Unable To Take Cash From Citadel, Halting!*")
		gosub :SWITCHBOARD~switchboard
		halt
	:Treasury
		killAllTriggers
		getText CURRENTLINE $Loot "contains" "credits."
		stripText $Loot ","
		stripText $Loot " "
		if ($Loot > $CREDITS_WITHDRAW)
			setVar $Loot $CREDITS_WITHDRAW
		end
		send ("TF"&$Loot&"*")
	return

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\planet"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\player\quikstats"
