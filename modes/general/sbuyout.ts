    #=--------                                                                       -------=#
     #=------------------------------   Ship BuyOut v1.0a    ------------------------------=#
    #=--------                                                                       -------=#
	#		Incep Date	:	December 4, 2007
	#		Author		:	LoneStar
	#		TWX			:	Should Work with TWX 2.03, 2.04b, and 2.04 Final
	#
	#		Description	:	Ship BuyOut - Start at StarDock Prompt
	#							Scans ship-menu and auto select cheapest Ship to buyout
	#							Resumes after getting Disconnected (relies on a relog script)
	#
	#		Fixes		:	Initial Release
	#
	#		Note		:	Leaves ships at Dock. They'll be repo'd at Tern!
	logging	off
	reqRecording
	setVar $TagLineA	"[ShipBuyOut]"
	setVar $TagLineB	(ANSI_9 & "["&ANSI_14 & "ShipBuyOut" & ANSI_9 & "]")
	setVar $Bought		0
	setVar $Compare		0
	setVar $Cycles		0
	gosub :player~quikstats

	if ($ALIGNMENT >= 0)
	else
		echo ("**" & $TagLineB & ANSI_14 & " Sorry, You Need To Be Fed-Safe**")
		halt
	end
	if ($EXPERIENCE >= 1000)
		echo ("**" & $TagLineB & ANSI_14 & " Sorry, You Need To Be Fed-Safe**")
		halt
	end
	if ($player~current_prompt <> "<StarDock>")
		echo ("**" & $TagLineB & ANSI_14 & " Start at Stardock Prompt!**")
		halt
	end

	gosub :Cheap_Ship

	Window StatusWind 400 130 "LoneStar's Ship Buy-Out Version 1.0a" ONTOP
	stripText $Ship_Cost ","
    SetVar $CashAmount ($CREDITS / $Ship_Cost)
	gosub :CommaSize
	setVar $TOBUY $CashAmount
	SetVar $CashAmount $CREDITS
	gosub :CommaSize
	setVar $CREDITS $CashAmount
	SetVar $CashAmount $Ship_Cost
	gosub :CommaSize
	SetVar $Ship_Cost $CashAmount
	setWindowContents StatusWind ("* Ships Bought  : " & $Bought & "* Credits Left  : $" & $CREDITS & "* Ship Type     : <"&$Ship_Letter&"> " & $Ship_Name & ", $" & $Ship_Cost & " each* Can Buy       : " & $TOBUY & " ships!*")
	send "'*"
	send ($TagLineA & " Buying Ship: <"&$Ship_Letter&"> " & $Ship_Name & ", $" & $Ship_Cost & " each*             Credits    : $" & $CREDITS & "*             Can Buy    : " & $TOBUY & "**")
	waitfor "Sub-space comm-link terminated"
	add  $Cycles 1
:ReStart
	SetEventTrigger 	Discod1 	:Discod     	"CONNECTION LOST"
	SetEventTrigger		Discod2		:Discod     	"Connections have been temporarily disabled."
	send "s"
:Again
	setTextTrigger		Bought	:Bought	"Should this be a (C)orporate"
	setTextTrigger		Naught	:Naught	"<Shipyards> Your option"
	send ("B N Y " & $Ship_Letter & " Y ")
	pause
:Naught
	killTrigger Bought
	killTrigger Naught
	if ($Cycles > 500)
		gosub :player~quikstats

		send ("'" & $TagLineA & " Still Running*")

		if ($CREDITS <= 1000)
			stripText $player~current_prompt "<"
			stripText $player~current_prompt ">"
			send ("'" & $TagLineA & " Out Of Funds. Stopping At " & $player~current_prompt & " Prompt.*")
			halt
		end

		setVar $Cycles 1

		if ($Compare < $Bought)
			stripText $Ship_Cost ","
		    SetVar $CashAmount ($CREDITS / $Ship_Cost)
			gosub :CommaSize
			setVar $TOBUY $CashAmount
			SetVar $CashAmount $CREDITS
			gosub :CommaSize
			setVar $CREDITS $CashAmount
			SetVar $CashAmount $Ship_Cost
			gosub :CommaSize
			SetVar $Ship_Cost $CashAmount
			setWindowContents StatusWind ("* Ships Bought  : " & $Bought & " (Up " & ($Bought - $Compare) & " ships)" & "* Credits Left  : $" & $CREDITS & "* Ship Type     : <"&$Ship_Letter&"> " & $Ship_Name & ", $" & $Ship_Cost & " each* Can Buy       : " & $TOBUY & " ships!*")
			setVar $Compare $Bought
		end
	end
	goto :again
:Bought
	killTrigger Bought
	killTrigger Naught
	add $Bought 1
	send " C" & $TagLineA & "* N * "
	waitfor "<Shipyards>"
	add $Cycles 50
	goto :again

:Discod
   	killAllTriggers
	stripText $Ship_Cost ","
	stripText $CREDITS ","
    SetVar $CashAmount ($CREDITS / $Ship_Cost)
	gosub :CommaSize
	setVar $TOBUY $CashAmount
	SetVar $CashAmount $CREDITS
	gosub :CommaSize
	setVar $CREDITS $CashAmount
	SetVar $CashAmount $Ship_Cost
	gosub :CommaSize
	SetVar $Ship_Cost $CashAmount
	setWindowContents StatusWind "* Ships Bought  : " & $Bought & "* Credits Left  : $" & $CREDITS & "* Ship Type     : <"&$Ship_Letter&"> " & $Ship_Name & ", $" & $Ship_Cost & " each* Can Buy       : " & $TOBUY & " ships!**             !!DISCONNECTED!!*"
   	Echo "***                   " & $TagLineB & ANSI_15 & " DISCONNECTED " & $TagLineB & "***"
   	:Disco_Test
	if (CONNECTED <> TRUE)
		setDelayTrigger		Emancipate_CPU		:Emancipate_CPU 3000
		Echo ("**" & ANSI_14 & $TagLineB & ANSI_15 & " Auto Resume Initiated - Awaiting Connection!**")
		pause
		:Emancipate_CPU
		goto :Disco_Test
	end
	waitfor "(?="
	setDelayTrigger		WaitingABit		:WaitingABit	3000
	Echo ("**" & ANSI_14 & $TagLineB & ANSI_15 & " Connected - Waiting For Command Prompt!**")
	pause
	:WaitingABit
	killAllTriggers
	gosub :player~quikstats
	if ($player~current_prompt = "Command")
		send "  *  "
		setTextTrigger 		Local		:Local			"Command [TL="
		setDelayTrigger		TestConn	:TestConn		3000
		pause
		pause
		:TestConn
			killAllTriggers
			if (CONNECTED = FALSE)
				goto :Disco_Test
			else
				send ("'" & $TagLineA & " Problem Detected Unable Resume!*")
				halt
			end
		:Local
			killAllTriggers
			getText CURRENTLINE $chk "]:[" "] (?"
			isnumber $tst $chk
			if ($tst = 0)
				send ("'" & $TagLineA & " Problem Detected Unable Resume!*")
				halt
			end
			if ($chk <> STARDOCK)
				send ("'" & $TagLineA & " Unable To Resume, not at StarDock!*")
				halt
			end
			#doesn't Return if Dock isn't found
			gosub :Is_Dock_Blown
			stripText $Ship_Cost ","
			stripText $CREDITS ","
		    SetVar $CashAmount ($CREDITS / $Ship_Cost)
			gosub :CommaSize
			setVar $TOBUY $CashAmount
			SetVar $CashAmount $CREDITS
			gosub :CommaSize
			setVar $CREDITS $CashAmount
			SetVar $CashAmount $Ship_Cost
			gosub :CommaSize
			SetVar $Ship_Cost $CashAmount
			setWindowContents StatusWind "* Ships Bought  : " & $Bought & "* Credits Left  : $" & $CREDITS & "* Ship Type     : <"&$Ship_Letter&"> " & $Ship_Name & ", $" & $Ship_Cost & " each* Can Buy       : " & $TOBUY & " ships!*"
			send ("'" & $TagLineA & " Restarting...*  P S G Y G Q")
			waitfor "You leave the Galactic Bank"
			goto :ReStart
   	else
   		send (" p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * '" & $TagLineA & " Attempting to Reach Correct Prompt...*")
		setTextLineTrigger	EMQ_COMPLETE	:EMQ_DELAY "Attempting to Reach Correct Prompt..."
		setDelayTrigger 	EMQ_DELAY		:EMQ_DELAY 3000
		pause
		:EMQ_DELAY
		killAllTriggers
		goto :Disco_Test
	end

:CommaSize
	If ($CashAmount < 1000)
		#do nothing
	ElseIf ($CashAmount < 1000000)
    	getLength $CashAmount $len
		SetVar $len ($len - 3)
		cutText $CashAmount $tmp 1 $len
		cutText $CashAMount $tmp1 ($len + 1) 999
		SetVar $tmp $tmp & "," & $tmp1
		SetVar $CashAmount $tmp
	ElseIf ($CashAmount <= 999999999)
		getLength $CashAmount $len
		SetVar $len ($len - 6)
		cutText $CashAmount $tmp 1 $len
		SetVar $tmp $tmp & ","
		cutText $CashAmount $tmp1 ($len + 1) 3
		SetVar $tmp $tmp & $tmp1 & ","
		cutText $CashAmount $tmp1 ($len + 4) 999
		SetVar $tmp $tmp & $tmp1
		SetVar $CashAmount $tmp
	end
	return

:player~quikstats
	setVar $player~current_prompt 		"Undefined"
	killtrigger noprompt
	killtrigger prompt1
	killtrigger prompt2
	killtrigger prompt3
	killtrigger prompt4
	killtrigger statlinetrig
	killtrigger getLine2
	setTextTrigger 		prompt1 		:allPrompts 		"(?="
	setTextLineTrigger 	prompt2 		:secondaryPrompts 	"(?)"
	setTextLineTrigger 	statlinetrig 	:statStart 			#179
	setTextTrigger		prompt3         :terraPrompts		"Do you wish to (L)eave or (T)ake Colonists?"
	setTextTrigger		prompt4         :terraPrompts		"How many groups of Colonists do you want to take ("
	send "^Q/"
	pause

	:allPrompts
		getWord currentansiline $checkPrompt 1
		getWord currentline $tempPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $player~current_prompt $tempPrompt
		end
		setTextLineTrigger prompt1 :allPrompts "(?="
		pause
	:secondaryPrompts
		getWord currentansiline $checkPrompt 1
		getWord currentline $tempPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $player~current_prompt $tempPrompt
		end
		setTextLineTrigger prompt2 :secondaryPrompts "(?)"
		pause
	:terraPrompts
		killtrigger prompt3
		killtrigger prompt4
		getWord currentansiline $checkPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $player~current_prompt "Terra"
		end
		setTextTrigger		prompt3         :terraPrompts		"Do you wish to (L)eave or (T)ake Colonists?"
		setTextTrigger		prompt4         :terraPrompts		"How many groups of Colonists do you want to take ("
		pause
	:statStart
		killtrigger prompt1
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger noprompt
		setVar $stats ""
		setVar $wordy ""
	:statsline
		killtrigger statlinetrig
		killtrigger getLine2
		setVar $line2 CURRENTLINE
		replacetext $line2 #179 " "
		striptext $line2 ","
		setVar $stats $stats & $line2
		getWordPos $line2 $pos "Ship"
		if ($pos > 0)
			goto :gotStats
		else
			setTextLineTrigger getLine2 :statsline
			pause
		end
	:gotStats
		setVar $stats $stats & " @@@"

		setVar $current_word 0
		while ($wordy <> "@@@")
			if ($wordy = "Sect")
				getWord $stats $player~current_sector   	($current_word + 1)
			elseif ($wordy = "Turns")
				getWord $stats $TURNS  				($current_word + 1)
			elseif ($wordy = "Creds")
				getWord $stats $CREDITS  			($current_word + 1)
			elseif ($wordy = "Figs")
				getWord $stats $player~fighters   			($current_word + 1)
			elseif ($wordy = "Shlds")
				getWord $stats $SHIELDS  			($current_word + 1)
			elseif ($wordy = "Hlds")
				getWord $stats $TOTAL_HOLDS   		($current_word + 1)
			elseif ($wordy = "Ore")
				getWord $stats $ORE_HOLDS    		($current_word + 1)
			elseif ($wordy = "Org")
				getWord $stats $ORGANIC_HOLDS    	($current_word + 1)
			elseif ($wordy = "Equ")
				getWord $stats $EQUIPMENT_HOLDS    	($current_word + 1)
			elseif ($wordy = "Col")
				getWord $stats $COLONIST_HOLDS    	($current_word + 1)
			elseif ($wordy = "Phot")
				getWord $stats $PHOTONS   			($current_word + 1)
			elseif ($wordy = "Armd")
				getWord $stats $ARMIDS   			($current_word + 1)
			elseif ($wordy = "Lmpt")
				getWord $stats $LIMPETS   			($current_word + 1)
			elseif ($wordy = "GTorp")
				getWord $stats $GENESIS  			($current_word + 1)
			elseif ($wordy = "TWarp")
				getWord $stats $TWARP_TYPE  		($current_word + 1)
			elseif ($wordy = "Clks")
				getWord $stats $CLOAKS   			($current_word + 1)
			elseif ($wordy = "Beacns")
				getWord $stats $BEACONS 			($current_word + 1)
			elseif ($wordy = "AtmDt")
				getWord $stats $ATOMIC  			($current_word + 1)
			elseif ($wordy = "Corbo")
				getWord $stats $CORBO   			($current_word + 1)
			elseif ($wordy = "EPrb")
				getWord $stats $EPROBES   			($current_word + 1)
			elseif ($wordy = "MDis")
				getWord $stats $MINE_DISRUPTORS   	($current_word + 1)
			elseif ($wordy = "PsPrb")
				getWord $stats $PSYCHIC_PROBE  		($current_word + 1)
			elseif ($wordy = "PlScn")
				getWord $stats $player~planet_scanner  	($current_word + 1)
			elseif ($wordy = "LRS")
				getWord $stats $SCAN_TYPE    		($current_word + 1)
			elseif ($wordy = "Aln")
				getWord $stats $ALIGNMENT    		($current_word + 1)
			elseif ($wordy = "Exp")
				getWord $stats $EXPERIENCE    		($current_word + 1)
			elseif ($wordy = "Corp")
				getWord $stats $CORP   				($current_word + 1)
			elseif ($wordy = "Ship")
				getWord $stats $player~ship_number   		($current_word + 1)
			end
			add $current_word 1
			getWord $stats $wordy $current_word
		end
	:doneQuikstats
		killtrigger prompt1
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger statlinetrig
		killtrigger getLine2
	return

:Cheap_Ship
	setArray $SHIPS  50 2
	setVar $Prefix ""
	setVar $idx 1
	killAllTriggers
	send "s b n y ?"
	waitfor "Which ship are you interested in"
	setTextLineTrigger	NextPg	:Cheap_Ship_NextPg		"<+> Next Page"
	setTextLineTrigger	Done	:Cheap_Ship_Done		"<Q> To Leave"
	:Cheap_Ship_Again
	setTextLineTrigger	Line	:Cheap_Ship_Line
	pause
	:Cheap_Ship_NextPg
		killAllTriggers
		send "+"
		waitfor "Which ship are you interested in"
		setTextLineTrigger	Line	:Cheap_Ship_Line
		setTextLineTrigger	Done	:Cheap_Ship_Done		"<Q> To Leave"
    	pause
	:Cheap_Ship_Line
		killTrigger Line
		setVar $Temp CURRENTLINE
		getWordPos $Temp $pos "<+>"
		if (($Temp <> "") AND ($Temp <> "0") AND ($pos <> 1))
			if ($idx <= 50)
				#Get Ship Cost
				setVar $Temp ($Temp & "@@@@")
				getText $Temp $Cost "    " "@@@@"
				stripText $Cost " "
				stripText $Cost ","
				setVar $SHIPS[$idx][2] $Cost
				#Get Ship Letter
				getText $Temp $Cost "<" ">"
				setVar $SHIPS[$idx][1] ($Prefix&$Cost)
				#Get Ship Name
				getText $Temp $Cost "> " "    "
				stripText $Cost "  "
				setVar $SHIPS[$idx] $Cost
			end
			add $idx 1
		end
		goto :Cheap_Ship_Again
	:Cheap_Ship_Done
		killAllTriggers
		setVar $ii 1
		setVar $Ship_Letter	$SHIPS[$ii][1]
		setVar $Ship_Name	$SHIPS[$ii]
		setVar $Ship_Cost	$SHIPS[$ii][2]
		add $ii 1
		while ($ii <= $idx)
			if  ($SHIPS[$ii][2] <> 0)
				if ($SHIPS[$ii][2] < $Ship_Cost)
					setVar $Ship_Letter	$SHIPS[$ii][1]
					setVar $Ship_Name	$SHIPS[$ii]
					setVar $Ship_Cost	$SHIPS[$ii][2]
				end
			end
        	add $ii 1
		end
		send "qq"
	return


:Is_Dock_Blown
		send ("  CR"&STARDOCK&"*Q ")
		setTextLineTrigger	itsalive 	:itsalive		"Items     Status  Trading % of max OnBoard"
		setTextLineTrigger	nosoupforme	:nosoupforme	"I have no information about a port in that sector"
		setDelayTrigger		WeHaveAProb	:WeHaveAProb	4000
		waitfor "Computer command [TL"
		pause
		:WeHaveAProb
			killAllTriggers
			send ("'"&$TagLineA&" Unable To Resume - Dock Check Timed Out*")
			halt
		:Buy_Fotons_nosoupforme
			killAllTriggers
			send ("'"&$TagLineB&" Unable To Resume - StarDock Appears To Have Been Blown!*")
			halt
		:itsalive
			killAllTriggers
	return

