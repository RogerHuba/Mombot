logging off
reqRecording
loadVar $bot_name
loadVar $unlimitedGame
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
loadVar $stardock
loadvar $command

#add prompt checking at start to start from anywhere on sd
gosub :quikstats
:load
	fileExists $doesHelpFileExist "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "- tbust [Experience] {safe} {2fer} {max} {override} {delay} {makered}" 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "  Traitors Planet Buster Modified for M()M Bot Use " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "                                                            " 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "   - [Experience]   = Desired Experience" 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "   - [safe]         = Create and Destroy one at a time" 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "   - [2fer]         = Create and Destroy two at a time" 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "   - [max]          = Create and Destroy the max amount" 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "   - [override]     = Override Turns low Limit" 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "   - [delay]        = Random delay for each bust" 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "   - [bank]         = Corpie will pass credits through bank" 
		write "scripts\"&$bot~mombot_directory&"\help\"&$command&".txt" "   - [red]          = Will Attempt negative align"
		send "'{" $bot_name "} - Writing help file for this command in Help directory.*"
	end
        if ($TOTAL_HOLDS < 10)
                send "'{" $bot_name "} - You need at least 10 Holds to create a planet.*"
                HALT
        end
	isNumber $test $parm1
 	if ($test)
		if ($parm1 < 1)
			send "'{" $bot_name "} - Must enter Experience to Achiece*"
			HALT
		end
	else
		send "'{" $bot_name "} - Invalid Experience amount entered. *"
		HALT
	end
	if ($CURRENT_PROMPT = "Command")
		send "p ss ys *q"
	end
	if (($CURRENT_PROMPT <> "<StarDock>") and ($CURRENT_PROMPT <> "Command"))
		send "'{" $bot_name "} - Must start from StarDock or Command Prompt*"
		HALT
	end
	getWordPos $user_command_line $pos "safe" 
	if ($pos > 0)
		setVar $bustMode "safe"
	end
	getWordPos $user_command_line $pos "2fer" 
	if ($pos > 0)
		setVar $bustMode "2fer"
	end
	getWordPos $user_command_line $pos "max" 
	if ($pos > 0)
		setVar $bustMode "max"
	end
	getWordPos $user_command_line $pos "override" 
	if ($pos > 0)
		setVar $ovveride TRUE
	end
	getWordPos $user_command_line $pos "delay" 
	if ($pos > 0)
		setvar $randomDelay TRUE
	end
	getWordPos $user_command_line $pos "bank" 
	if ($pos > 0)
		setvar $corpieBanker TRUE
	end
	getWordPos $user_command_line $pos "red" 
	if ($pos > 0)
		setvar $makered "true"
	end
if ($parm1 < $EXPERIENCE)
	send "'{" $bot_name "} - Already at or Above Desired Experience*"
	halt
end
setvar $neededCycles ($parm1 / 75)

:check_corp
	if ($CORP > 0)
		gosub :silenceMessages
		goto :checkAutoFlee
	else
		send "'{" $bot_name "} - Must be on a Corp to Continue*"
		halt
	end

:checkAutoFlee
	send "\"
	settextlinetrigger checkFlee :checkFlee "Online Auto Flee is"
	pause

:checkFlee
	killtrigger checkFlee
	getword CURRENTLINE $autoFlee 5
	striptext $autoFlee "."
	if ($autoflee = "enabled")
		send "\"
	end
	goto :checkCN2

:checkCN2
	waitfor "<StarDock>"
	send "c"
	settextlinetrigger cn2off :cn2off "Sorry, only Traders with ANSI"
	settexttrigger cn2on :cn2on "Select(1-5,Q)"
	pause

:cn2off
	killtrigger cn2off
	killtrigger cn2on
	goto :checkCN9

:cn2on
	killtrigger cn2off
	killtrigger cn2on
	send "q"
	waitfor "<StarDock> Where to?"
	send " q  c  n  2  q  q  p  s"
	waitfor "<StarDock> Where to?"
	if ($unlimitedGame <> "1")
		SUBTRACT $TURNS 1
	end
	goto :checkCN9

:checkCN9
	send "ge"
	settextlinetrigger cn9space :cn9space "You enter the most"
	settextlinetrigger cn9all :cn9all "<Galactic Bank>"
	pause

:cn9space
	killtrigger cn9space
	killtrigger cn9all
	setvar $cn9 "space"
	settextlinetrigger checkBankAcct :checkBankAcct "credits in your account."
	pause

:cn9all
	killtrigger cn9space
	killtrigger cn9all
	setvar $cn9 "all"
	settextlinetrigger checkBankAcct :checkBankAcct "credits in your account."
	pause

:checkBankAcct
	killtrigger checkBankAcct
	getword CURRENTLINE $bankCreds 3
	striptext $bankCreds ","
	send "q"
	waitfor "<StarDock> Where to?"
	goto :getPricing

:getPricing
	send "ha"
	settextlinetrigger getDetCost :getDetCost "We sell them for"
	pause

:getDetCost
	killtrigger getDetCost
	getword CURRENTLINE $detCost 5
	striptext $detCost ","
	settexttrigger howManyDets :howManyDets "How many Atomic Detonators do you want"
	pause

:howManyDets
	killtrigger howManyDets
	getword CURRENTLINE $maxDets 9
	striptext $maxDets ")"
	setvar $maxDets ($maxDets + $ATOMIC)
	send "0*t"
	settextlinetrigger getGTorpCost :getGTorpCost "Aldus Genesis Torpedo."
	pause

:getGTorpCost
	killtrigger getGTorpCost
	getword CURRENTLINE $gtorpCost 6
	striptext $gtorpCost ","
	settexttrigger howManyGtorps :howManyGtorps "How many Genesis Torpedoes do you want"
	pause

:howManyGtorps
	killtrigger howManyGtorps
	getword CURRENTLINE $maxGtorps 9
	striptext $maxGtorps ")"
	setvar $maxGtorps ($maxGtorps + $GENESIS)
	send "0*q"
	waitfor "See you later."

:RedCheck
        if ($makered = "true")
               gosub :FixAlign
        end

:checkForProblems
	if ($unlimitedGame = "1")
		goto :fixCN9
	elseif ($TURNS = 0) and ($unlimitedGame <> "1")
		send "'{" $bot_name "} - Turns to low to Run TBust! *"
		gosub :hearmessages
		HALT
	elseif ($TURNS < 50) and ($OVERRIDE = TRUE)
		goto :fixcn9
	elseif ($TURNS < 50)
		gosub :hearmessages
		send "'{" $bot_name "} - Turns to low to Run TBust!*"
		halt
	end

:fixCN9
	if ($cn9 = "all")
		send "qcn9  q  q  p  s"
		setvar $cn9 "space"
		waitfor "Landing on Federation StarDock."
		if ($unlimitedGame <> "1")
			SUBTRACT $TURNS 1
		end
	end

:getUserInput
        if (($maxDets = $maxGtorps) or ($maxDets < $maxGtorps))
                setvar $maxPerCycle $maxDets
        else
                setvar $maxPerCycle $maxGtorps
        end
	setvar $totalInitialCreds ($CREDITS + $bankCreds)
	setvar $totalCycles (((($CREDITS + $bankCreds) / ($gtorpCost + $detCost))-1) + $ATOMIC)
	if ($CREDITS < ($gtorpCost + $detCost))
		send "'{" $bot_name "} - Need more Credits to bust.*"
		halt
	else
		setvar $totalCycles ((($CREDITS / ($gtorpCost + $detCost))-1) + $ATOMIC)
	end

:finalPrepBeforeBusting
	setvar $WTF 0
	if ($bustMode = "safe")
		setvar $maxPerCycle 1
	elseif ($bustMode = "2fer")
		setvar $maxPerCycle 2
	elseif ($bustMode = "max")
		setvar $maxPerCycle $maxGtorps
	end
	send "@"
	waitfor "hundredths"
	gosub :quikstats
	gosub :checkStatus
	if ($TURNS < (($neededCycles / $maxPerCycle) + 2))
		if ($unlimitedGame <> "1")
			gosub :hearMessages
			send "'{" $bot_name "} - Not Enough Turns*"
			HALT
		end
	end
	if ($ATOMIC < $maxPerCycle)
		send "h  a  " ($maxPerCycle - $ATOMIC) "*q"
		waitfor "See you later"
	end
	if ($GENESIS < $maxPerCycle)
		send "h  t  " ($maxPerCycle - $GENESIS) "*q"
		waitfor "See you later"
	end

:startBustCycle
	setvar $count 1
	setvar $bustString "q  "
	setvar $tempCycles $maxPerCycle
	if ($neededCycles < $tempCycles)
		setvar $tempCycles $neededCycles
	end
	if ($tempCycles < 1)
		setvar $tempCycles 1
		add $WTF 1
	end
	while ($count <= $tempCycles)
		setvar $bustString $bustString & "u  y  n  .*cl  *  z  d  y  "
		add $count 1
	end
	setvar $bustString $bustString & "p  s "
	subtract $neededCycles $tempCycles
	send $bustString
	waitfor "Command"
	settextlinetrigger invalidRegNum :invalidRegNum "Invalid registry number"
	settexttrigger bustOK :bustOK "<StarDock>"
	pause

:bustOK
	killtrigger invalidRegNum
	killtrigger bustOK
	send "@"
	waitfor "hundredths"
	gosub :quikstats
	gosub :checkStatus
	if ($ATOMIC >= $tempCycles) AND ($GENESIS >= $tempCycles)
		setvar $buyDetQty 0
		setvar $buyTorpQty 0
	else
		setvar $buyDetQty ($tempCycles - $ATOMIC)
		setvar $buyTorpQty ($tempCycles - $GENESIS)
	end	
	send "h  a  " $buyDetQty "*  t  " $buyTorpQty "*  q"
	if ($randomDelay = "TRUE")
		gosub :randomDelay
	end
	goto :startBustCycle
	
:invalidRegNum
	killtrigger bustOK
	killtrigger invalidRegNum
	setvar $planetNums ""
	send "@"
	waitfor "hundredths"
	gosub :quikstats
	gosub :checkStatus
	send "h  t  1*  q"
	waitfor "<StarDock>"
	send "q  u  y  n  .*cl*  z  d  y  p  s "
	waitfor "Command"
	settexttrigger getPlanNum :getPlanNum "Registry#"
	settexttrigger ondock :ondock "<StarDock>"
	pause
	
:getPlanNum
	killtrigger getPlanNum
	settextlinetrigger planNum :planNum "   <"
	pause
	
:planNum
	killtrigger planNum
	add $extraPlanets 1
	getword CURRENTLINE $tempPlanetNum 2
	striptext $tempPlanetNum ">"
	setvar $planetNums $planetNums & " " & $tempPlanetNum
	settexttrigger planNum :planNum "   <"
	pause

:onDock
	killtrigger getPlanNum
	killtrigger planNum
	killtrigger ondock
	getword CURRENTLINE $spoofPlanetName 1
	if ($spoofPlanetName <> "<StarDock>")
		settexttrigger ondock :ondock "<StarDock>"
		settexttrigger planNum :planNum "   <"
		pause
	end	
	setarray $randomPlanNum $extraPlanets
	setvar $c 1
	setvar $rndPlanetNums ""
	
:planetNumberRandomizer
	while ($c <= $extraplanets)
		getRnd $random 1 $extraPlanets
		if ($randomPlanNum[$random] = 1)
			goto :planetNumberRandomizer
		else
			getword $planetNums $tempPlanetNum $random
			setvar $rndPlanetNums $rndPlanetNums & " " & $tempPlanetNum
			add $c 1
			setvar $randomPlanNum[$random] 1
		end
	end

:multiPlanets
	send "@"
	waitfor "hundredths"
	gosub :quikstats
	gosub :checkStatus
	if ($extraPlanets >= 1)
		send "h  a  1*  q"
		waitfor "<StarDock>"
		getword $rndPlanetNums $tempPlanetNum $extraPlanets
		send "q  l  " & #8 & #8 & $tempPlanetNum "*  n  z  n  d  y  *  p  s "
		settexttrigger backOnDock :backOndock "<StarDock>"
		settexttrigger planetNumGone :planetNumGone "That planet is not in this sector."
		settexttrigger triedToMove :triedToMove "<Move>"
		pause
	else
		send "@"
		waitfor "hundredths"
		goto :bustOK
	end

:backOnDock
	killtrigger backOnDock
	killtrigger planetNumGone
	killtrigger triedToMove
	getword CURRENTLINE $spoofPlanetName 1
	if ($spoofPlanetName <> "<StarDock>")
		settexttrigger backOnDock :backOndock "<StarDock>"
		settexttrigger planetNumGone :planetNumGone "That planet is not in this sector."
		settexttrigger triedToMove :triedToMove "<Move>"
		pause
	end	
	subtract $extraPlanets 1
	goto :multiPlanets

:planetNumGone
	killtrigger backOnDock
	killtrigger planetNumGone
	killtrigger triedToMove
	goto :invalidRegNum

:triedToMove
	killtrigger backOnDock
	killtrigger planetNumGone
	killtrigger triedToMove
	goto :bustOK

:checkStatus
	if ($CURRENT_PROMPT <> "<StarDock>")
		gosub :hearMessages
		send "p  s  t"
		send "'{" $bot_name "} - Houston, we have a problem...*"
		HALT
	end
	if ($EXPERIENCE >= $parm1)
		gosub :hearMessages
		send "'{" $bot_name "} - Target Exp Reached!*"
		HALT
	end
	if ($TURNS < 10) AND ($unlimitedGame <> "1")
		gosub :hearMessages
		send "'{" $bot_name "} - Not Enough Turns to Continue!*"
		HALT
	end

:resume
	if ($CREDITS < (($gtorpCost + $detCost) * $maxPerCycle))
		if ($corpieBanker = TRUE)
			send "ge"
			settextlinetrigger viewBankAcct :viewBankAcct "credits in your account."
			pause
	
	:viewBankAcct
			killtrigger viewBankAcct
			getword CURRENTLINE $bankCreds 3
			striptext $bankCreds ","
			send "q"
			waitfor "<StarDock> Where to?"
			if (($CREDITS + $bankCreds) < (($gtorpCost + $detCost) * $maxPerCycle))
				if ($corpieBanker = TRUE)
					gosub :hearMessages
					send "'{" $bot_name "} - Need Creds in bank to continue. Waiting on Transfer*"
					settextlinetrigger waitForCreds :waitForCreds "credits to your Galactic bank account."
					pause
					
				:waitForCreds
					killtrigger waitForCreds
					send "ge"
					settextlinetrigger verifyBankAcct :verifyBankAcct "credits in your account."
					pause
	
				:verifyBankAcct
					killtrigger verifyBankAcct
					getword CURRENTLINE $bankCreds 3
					striptext $bankCreds ","
					send "q"
					waitfor "<StarDock> Where to?"
					if (($CREDITS + $bankCreds) < (($gtorpCost + $detCost) * $maxPerCycle))
						send "'{" $bot_name "} - Not enough Creds in bank*"
						settextlinetrigger waitForCreds :waitForCreds "your Galactic bank account."
						pause
					else
						subtract $bankCreds (($gtorpCost + $detCost) * $maxPerCycle) 
						send "g  w" ((($gtorpCost + $detCost) * $maxPerCycle) - $CREDITS) "*  q"
						gosub :silenceMessages
						waitfor "<StarDock>"
					end
				end
			else
				subtract $bankCreds (($gtorpCost + $detCost) * $maxPerCycle)
				send "g  w" ((($gtorpCost + $detCost) * $maxPerCycle) - $CREDITS) "*  q"
				waitfor "<StarDock>"
			end
		end
	end
	if ($WTF > 10)
		gosub :hearMessages
		pause
	end
	return
	
:randomDelay
	getrnd $rndNum 50 2000
	setdelaytrigger delay :delay $rndNum
	pause
	
:delay
	killtrigger delay
	return

:silenceMessages
	send "|"
	setvar $HearMessages "no"
	settextlinetrigger Message :Message "all messages."
	pause

:hearmessages
	send "|"
	setvar $HearMessages "yes"
	settextlinetrigger Message :Message "all messages."
	pause
	
:Message
	killtrigger Message
	getword CURRENTLINE $msgStat 1
	if ($msgStat = "Displaying") AND ($HearMessages = "yes")
		return
	elseif ($msgStat = "Displaying") AND ($HearMessages = "no")
		send "|"
		return
	elseif  ($msgStat = "Silencing") AND ($HearMessages = "no")
		return
	else
		send "|"
		return
	end
        # ============================== FIX ALIGN ===============================
 :FixAlign
        if ($ALIGNMENT  > 0) and ($ALIGNMENT < 200)
		send "ttmafia*y"
		settexttrigger getMafiaPWPrice :getMafiaPWPrice "will ye pay?"
		pause

		:getMafiaPWPrice
		# here is where it gets the pricing for the underground PW
		killtrigger getMafiaPWPrice
		getword CURRENTLINE $mafiaPWPrice 6
		striptext $mafiaPWPrice ","
		send "n*q"
		waitfor "You make a hasty exit from the Tavern."
		setvar $fixAlign $ALIGNMENT
		setvar $fixAlignCreds (($fixAlign * 250) + $mafiaPWPrice)
		setvar $newMafiaPW "use mombot more"
		goto :getMafiaPW

elseif ($yourAlign > 199)
	send "'{" $bot_name "} - Cant Get a Negative Alignement.  Continuing for Experience*"
	goto :FixAlignReturn
end

:getMafiaPW
         send "ttmafia*yy"
         settextlinetrigger mafiaPW :mafiaPW "The password today is"
         pause

:mafiaPW
         killtrigger mafiaPW
         gettext CURRENTLINE $tempMafiaPW "today is " & #34 ""
         getlength $tempMafiaPW $mafiaPWLength
         cuttext $tempMafiaPW $mafiaPW 1 ($mafiaPWLength - 1)
         send "*q"
         waitfor "<StarDock>"
         goto :underground

:underground
         send "u"
         waitfor "Your reply :"
         send $mafiaPW "*"
         settexttrigger PWworks :PWworks "The magnetic shielding goes down and the door opens."
         settexttrigger PWfails :PWfails "<StarDock> Where to? (?=Help)"
         pause

:PWfails
         killtrigger PWworks
         killtrigger PWfails
         send "'{" $bot_name "} - Underground PW failed. You will have to fix manually.  Halting Script*"
         halt

:PWworks
         killtrigger PWworks
         killtrigger PWfails
         send "y" $newMafiaPW "*"

:placeContract
         setvar $letters "e t a o i n s r h l d c u m f p g w y b v k x j q z"
         setvar $count 1

:pickTrader4contract
if ($count <= 26)
	getword $letters $temp $count
	send "p" $temp "*"
	settexttrigger knownTrader :knownTrader "Do you mean"
	settexttrigger unknownTrader :unknownTrader "Unknown Trader!"
	pause
else
	gosub :hearMessages
	send "'{" $bot_name "} - Problems placing a Bounty. - HALTING*"
	halt
end

:unknownTrader
        killtrigger knownTrader
        killtrigger unknownTrader
        add $count 1
        goto :pickTrader4contract

:knownTrader
        killtrigger knownTrader
        killtrigger unknownTrader
        send "y" ($fixAlign * 250) "*q"
        waitfor "<StarDock>"
        send "@"
        waitfor "hundredths"
        gosub :quikstats

:FixAlignReturn
         return

        # ============================== QUICKSTATS ==============================
	:quikstats
	    	setVar $CURRENT_PROMPT 		"Undefined"
		killtrigger noprompt
		killtrigger prompt1
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger statlinetrig
		killtrigger getLine2
		setTextLineTrigger 	prompt		:allPrompts	 	#145 & #8
		setTextLineTrigger 	statlinetrig 	:statStart 		#179
		send #145&"/"
		pause
	
		:allPrompts
			getWord CURRENTLINE $CURRENT_PROMPT 1
			stripText $CURRENT_PROMPT #145
			stripText $CURRENT_PROMPT #8
			setTextLineTrigger 	prompt		:allPrompts	 	#145 & #8
			pause
	
		:statStart
			killtrigger prompt
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
					getWord $stats $CURRENT_SECTOR   	($current_word + 1)
				elseif ($wordy = "Turns")
					getWord $stats $TURNS  			($current_word + 1)
				elseif ($wordy = "Creds")
					getWord $stats $CREDITS  		($current_word + 1)
				elseif ($wordy = "Figs")
					getWord $stats $FIGHTERS   		($current_word + 1)
				elseif ($wordy = "Shlds")
					getWord $stats $SHIELDS  		($current_word + 1)
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
					getWord $stats $PHOTONS   		($current_word + 1)
				elseif ($wordy = "Armd")
					getWord $stats $ARMIDS   		($current_word + 1)
				elseif ($wordy = "Lmpt")
					getWord $stats $LIMPETS   		($current_word + 1)
				elseif ($wordy = "GTorp")
					getWord $stats $GENESIS  		($current_word + 1)
				elseif ($wordy = "TWarp")
					getWord $stats $TWARP_TYPE  		($current_word + 1)
				elseif ($wordy = "Clks")
					getWord $stats $CLOAKS   		($current_word + 1)
				elseif ($wordy = "Beacns")
					getWord $stats $BEACONS 		($current_word + 1)
				elseif ($wordy = "AtmDt")
					getWord $stats $ATOMIC  		($current_word + 1)
				elseif ($wordy = "Corbo")
					getWord $stats $CORBO   		($current_word + 1)
				elseif ($wordy = "EPrb")
					getWord $stats $EPROBES   		($current_word + 1)
				elseif ($wordy = "MDis")
					getWord $stats $MINE_DISRUPTORS   	($current_word + 1)
				elseif ($wordy = "PsPrb")
					getWord $stats $PSYCHIC_PROBE  		($current_word + 1)
				elseif ($wordy = "PlScn")
					getWord $stats $PLANET_SCANNER  	($current_word + 1)
				elseif ($wordy = "LRS")
					getWord $stats $SCAN_TYPE    		($current_word + 1)
				elseif ($wordy = "Aln")
					getWord $stats $ALIGNMENT    		($current_word + 1)
				elseif ($wordy = "Exp")
					getWord $stats $EXPERIENCE    		($current_word + 1)
				elseif ($wordy = "Corp")
					getWord $stats $CORP   			($current_word + 1)
				elseif ($wordy = "Ship")
					getWord $stats $SHIP_NUMBER   		($current_word + 1)
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
	# ============================== END QUICKSTATS SUB==============================