gosub :BOT~loadVars
loadvar $SWITCHBOARD~bot_name 
loadvar $bot~corppassword
loadvar $player~corpnumber

setVar $BOT~help[1]  $BOT~tab&"    ice2022 [command]"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&"    stripfig n - sells your ship and sits you in scout"
setVar $BOT~help[4]  $BOT~tab&"    stripcash - strips cash from corp mates (11k+ req)"
setVar $BOT~help[5]  $BOT~tab&"    buycorp   - buys Lucifer's Limo (corp) "
setVar $BOT~help[6]  $BOT~tab&"    updora     - Upgrades Your Pumpkin to Dora "
setVar $BOT~help[7]  $BOT~tab&"    buycolt   - buys Dracula's Coffin (colt) "
setVar $BOT~help[8]  $BOT~tab&"    movecolt  - moves Colts to sectors  "
setVar $BOT~help[9]  $BOT~tab&"                  >movecolt 95 16822 87 "
setVar $BOT~help[10] $BOT~tab&"    grabcolo  - fills any Colt in sector with colos "
setVar $BOT~help[11] $BOT~tab&"    docim     - downloads port/warp data "
setVar $BOT~help[12] $BOT~tab&"    gopod     - Find Pod Sector - 1 person, others follow"
setVar $BOT~help[11] $BOT~tab&"    surround  - Surrounds sector, including mowing backdoor"
setVar $BOT~help[13] $BOT~tab&"    podthem   - pod [botname] - botname person you will pod"
setVar $BOT~help[14] $BOT~tab&"                Everyone assemble at gopod sector. Use this "
setVar $BOT~help[15] $BOT~tab&"                command to pod each perosn once."
setVar $BOT~help[16] $BOT~tab&"                                      "
setVar $BOT~help[16] $BOT~tab&"      PlayerA - 1: gopod 2: surround 3: podthem [bot(s)]"
setVar $BOT~help[16] $BOT~tab&"      3 Players wait for gopod location and follow."


setVar $BOT~help[1]  $BOT~tab&"    ice2022 [command]"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&"    quickcomm [bot] - Gets Fed Comm using a bot corp mate"
setVar $BOT~help[4]  $BOT~tab&"                    [bot] needs 0 align, 8k cash under port"
setVar $BOT~help[5]  $BOT~tab&"    alignswap  - quickcomm will use this command"
setVar $BOT~help[6]  $BOT~tab&"           "
setVar $BOT~help[7]  $BOT~tab&"    Start Up Routines - All go to dock quickly and sell"
setVar $BOT~help[8]  $BOT~tab&"                their ship before custom options"
setVar $BOT~help[8]  $BOT~tab&"    colt (hammer) - SD > Sell Ship > buy TWarp and Out"
setVar $BOT~help[9]  $BOT~tab&"                Player then finds ore and gets comm"
setVar $BOT~help[10] $BOT~tab&"    under     - Rotate underground pass - transfer cash"
setVar $BOT~help[11] $BOT~tab&"    scout     - Sell Scout > Buy Merch > transfer"
setVar $BOT~help[12] $BOT~tab&"    "
setVar $BOT~help[13] $BOT~tab&"    3-4 Others do follow:"
setVar $BOT~help[14] $BOT~tab&"    gopod     - Find Pod Sector - 1 person, others follow"
setVar $BOT~help[15] $BOT~tab&"    surround  - Surrounds sector, including mowing backdoor"
setVar $BOT~help[16] $BOT~tab&"    podthem   - pod [botname] - botname person you will pod"
setVar $BOT~help[17] $BOT~tab&"                Everyone assemble at gopod sector. Use this "
setVar $BOT~help[18] $BOT~tab&"                command to pod each perosn once."
setVar $BOT~help[19] $BOT~tab&"                                      "
setVar $BOT~help[20] $BOT~tab&"      PlayerA - 1: gopod 2: surround 3: podthem [bot(s)]"
setVar $BOT~help[21] $BOT~tab&"      3 Players wait for gopod location and follow."



gosub :bot~helpfile

setVar $BOT~script_title "ICE2022 Utilities"

gosub :BOT~banner

setVar $podpeople[1] "123"
setVar $podpeople[2] "ham"
setVar $podpeople[3] "r2"
setVar $podpeople[4] "ob"
setVar $podpeoplei 1

setVar $podpeopleok 0

send "'Update Colt PErson Name for Bank Transfer*"
loadVar $bot~corppassword 
setVar $StartChief "1111"
# setVar $newPassword "BEWARE OF KAL DURAK" 
# Initial Password 
setVar $newPassword "BEWARE OF KOL DURAK"


if ($bot~parm1 = "alignswap")
    goSub :alignswap
    halt
end

if ($bot~parm1 = "quickcomm")
    goSub :quickCommission
    halt
end

if ($bot~parm1 = "under")
    goSub :underground
    halt
end

if ($bot~parm1 = "scout")
    goSub :scout
    halt
end

if ($bot~parm1 = "colt")
    goSub :colt
    halt
end

if ($bot~parm1 = "findbb")
    goSub :findbb
    halt
end

if ($bot~parm1 = "class0")
    goSub :findClassOhs
    halt
end

if ($bot~parm1 = "crazymow")
    goSub :crazyMow
    halt
end

if ($bot~parm1 = "gopod")
    goSub :gopod
    halt
end


if ($bot~parm1 = "preppod")
    goSub :preppod
    halt
end

if ($bot~parm1 = "podthem")

    goSub :masterpod
    halt
end

if ($bot~parm1 = "surround")

    goSub :iceSurround
    halt
end

if ($bot~parm1 = "waitandmow")
    goSub :waitandmow
    halt
end

if ($bot~parm1 = "stripfig")
	setVar $figsRequired $bot~parm2
	gosub :stripfig
	halt
end

if ($bot~parm1 = "sellship")
	gosub :sellship
	halt
end

if ($bot~parm1 = "buycorp")
	gosub :buycorp
	halt
end

if ($bot~parm1 = "stripcash")
	gosub :stripcash
	halt
end


if ($bot~parm1 = "updora")
	gosub :buydora
	halt
end

if ($bot~parm1 = "docim")
	gosub :docim
	halt
end

if (($bot~parm1 = "buycolt") or ($bot~parm1 = "buycolts"))
	gosub :buycolt
	halt
end

if (($bot~parm1 = "movecolt") or ($bot~parm1 = "movecolts"))
	gosub :movecolt
	halt
end

if (($bot~parm1 = "grabcolo") or ($bot~parm1 = "grabcolos"))
	gosub :grabcolos
	halt
end

setVar $SWITCHBOARD~message "Strewth mate, if you've got ere you've gone walkabout. Have a yarn with the help file and see whats what.*"
gosub :SWITCHBOARD~switchboard

halt

:findbb
 #set CN
    send "cn24"&$BOT~subspace&"* qq * "
    #Make Corp
    send "tm" $BOT~corpName "*y" $BOT~corpPassword "*yq"
    send "co*cq"

    # Find first tunnel entrance - Mow to it - fig it.
    setVar $BOT~command "findbb"
    setVar $BOT~user_command_line " findbb 5 18"
    setVar $BOT~parm1 "5"
    setVar $BOT~parm2 "18"
    saveVar $BOT~parm1
    saveVar $BOT~parm2
    saveVar $BOT~command
    saveVar $BOT~user_command_line
    load "scripts\"&$bot~mombot_directory&"\modes\data\findbb2.cts"
    setEventTrigger		findbbCrazy2		:findbbCrazy2 "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\data\findbb2.cts"
    pause
    :findbbCrazy2
        killalltriggers

    halt
return
    

:Colt
	setVar $attackWave "998877"
	goSub :doStart1
	send "p ss b y y fycShipShape**p b50* q"
	waitfor "Which item do you wish to buy"
	send "q h r d w 2 qq "
	waitfor "ee you late"


	setVar $result "12* n s za" & $attackWave & "* * za" & $attackWave & "* * za" & $attackWave & "*   ^q"
	send $result

	halt
return

:scout

    goSub :doStart1
    goSub :joincorp

	# SD Space to Buying Scout
    send "pssbyybycShipShape**pb50*q"
	waitfor "Do you want to set a password for this ship?"
	send "bnyhycMerch 1***q"
	waitfor "ou leave the shipyard"
	gosub :transferCash
	send "q"
halt
return

:underground

    goSub :doStart1
    goSub :getScoutTransferPassword
    goSub :bewareOfPassChanges

halt
return

:alignswap
	loadVar $bot~corpPassword
	gosub :player~quikstats
	setVar $Location $player~current_prompt
	setVar $oldCorp $player~CORP
	
	if ($Location <> "Command")
		setVar $SWITCHBOARD~message "I'm not at the command prompt.*"
		gosub :switchboard~switchboard
		HALT
	end
	send "d"
	waitfor "Warps to Sector"
	
	if ($player~ALIGNMENT >  0) 
		setVar $SWITCHBOARD~message "I can not help, my alignment is not zero.*"
		gosub :switchboard~switchboard
		HALT
	end
if ($player~CREDITS < 7000) 
		setVar $SWITCHBOARD~message "I need at least 7000 credits (give or take).*"
		gosub :switchboard~switchboard
		HALT
	end
	if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] <> 1)
		
		setVar $SWITCHBOARD~message "I can not help, no port in sector*"
		gosub :switchboard~switchboard
		HALT
		
	end
	
	setVar $SWITCHBOARD~message "Alignment Swap: Ready to go*"
	gosub :switchboard~switchboard
		
	waitfor "Alignment Swap: Drop Alignment"
	send "txyj1*wrongpass*q"
	waitfor "ry, that has been recorded by Federal Intel"
	gosub :player~quikstats
	if ($player~Alignment < 0)

		send "'Alignment Swap: drop success!*"
	else
		send "'Alignment Swap: drop failed!*"
	end
	waitfor "Alignment Swap: Fed Comm acquired!"
	send "o37*q"
	send "tj" $oldCorp "*" $bot~corpPassword "*"
	halt
return


:quickCommission
	gosub :player~quikstats
	setVar $Location $player~current_prompt
	echo "#" $player~current_prompt "#"
	if ($location <> "<StarDock>")
		setVar $SWITCHBOARD~message "Start from StarDock.*"
		gosub :switchboard~switchboard
		HALT
	end
	 setVar $bothelper $bot~parm2
    if ($bothelper = 0) or ($bothelper = "")
        setVar $SWITCHBOARD~message "Please provide the name of the bot that will be dropping alignment*"
		gosub :SWITCHBOARD~switchboard
		halt
    end

	setVar $alignNeeded (500 - $player~ALIGNMENT)
    if ($alignNeeded < 0)
        send "paq"
        setVar $SWITCHBOARD~message "You already have a fed comm.*"
		gosub :switchboard~switchboard
        halt
    end

	setVar $cashToGive ($alignNeeded * 1000)
	if ($player~Credits < $cashToGive)
		 setVar $SWITCHBOARD~message "You need " & $cashToGive & " to get a fed comm, you are short!*"
		gosub :switchboard~switchboard
        halt
	end
	send "p"
	send "'" $bothelper " ice2022 alignswap*"
	
	setTextLineTrigger botHelpLowOnCash :botHelpLowOnCash "I need at least 7000 credits"
	setTextLineTrigger wrongPrompt :wrongPrompt "I'm not at the command prompt."
	setTextLineTrigger wrongAlign :wrongAlign "I can not help, my alignment is not zero"
	setTextLineTrigger noPortSector :noPortSector "I can not help, no port in sector"
	setTextLineTrigger goodAlign :goodAlign "Alignment Swap: Ready to go"
	pause
	:botHelpLowOnCash
	:wrongPrompt
	:noPortSector
	:wrongAlignq
		killAllTriggers
		send "'halting alignment swap, need a corpie with zero align and a port in sector*"

		halt
	:goodAlign
		killAllTriggers
		send "'Alignment Swap: Drop Alignment*"
		setTextLineTrigger alignDropFail :alignDropFail "Alignment Swap: drop failed!"
 		setTextLineTrigger alignDropGood :alignDropGood "Alignment Swap: drop success!"
		pause
		:alignDropFail
			killAllTriggers
			send "'Alignment Swap: Failed - Need new bot*" 
			halt
		:alignDropGood
			killAllTriggers
			send "'Alignment Swap: Success - Post it*"

    send "p1*"
    
    :copitAgain
    waitfor "---"
    setTextLineTrigger noBountiesYet :noBountiesYet "Changed your mind eh? Too bad."
    setTextTrigger gotABounty :gotABounty "How much reward do you want to offer?"
    pause
    :noBountiesYet
        killalltriggers
        send "qpp1*"
        goto :copitAgain
    :gotABounty
        killalltriggers
        setVar $cashToGive ($alignNeeded * 1000)
        send $cashToGive "*a"
		waitfor "For this noble act your alignment went up by"
		send "'Alignment Swap: Fed Comm acquired!*"

	halt
return

:getScoutTransferPassword
    
	send "psuBEWARE OF KAL DURAK*y" $newPassword "*q"
	waitfor "<Underground> So, what do you want, scum?"
	send "sbyybyBEWARE OF PASSWORD CHANGES**pb50*qq"
	waitfor "<Shipyards> Your option "
	waitfor "<StarDock>"
	goSub :transferCash
		
return

:transferCash
	send "gd"
	#How many credits do you want to deposit? (142,908)
	setTextTrigger sc_bankterm :sc_bankterm "How many credits do you want to deposit?"
	pause
	:sc_bankterm
		getWord CURRENTLINE $creddep 9
		STRIPTEXT $creddep "("
		STRIPTEXT $creddep ")"
		STRIPTEXT $creddep ","
		subtract $creddep 5000
		echo $creddep "*"
		echo $creddep "*"
		echo $creddep "*"
		if ($creddep > 500000)
			setVar $creddep 500000
		end
		send $creddep "*"
		send "t" $StartChief "*y*q"
return

:bewareOfPassChanges

	
	send "u"
	

	:morePassWork
	send $newPassword "*"
	waitfor "What's the password, eh?"
	setTextLineTrigger underpassgood :underpassgood "The magnetic shielding goes down and the door opens."
	setTextTrigger underpassbad :underpassbad "<StarDock> Where to?"
	pause
	:underpassbad
		echo "PASSFAIL*"
		echo "PASSFAIL*"
		echo "PASSFAIL*"
		echo "PASSFAIL*"
		
		halt
	:underpassgood
		killAllTriggers
		gosub :getNewPassword
		send "y" $newPassword "*qu"

		goto :morePassWork
return

:getNewPassword
	getrnd $fpass 1000 9999
	getrnd $spass 1000 9999
	setVar $newPassword $fpass & $spass

return



:doStart1

    loadVar $BOT~subspace
	# if we go through main loop more than this, give up, manual control, good luck!
	setVar $maxTrys 6
	setVar $attackWave "499"
	setVar $firstSecOut 0
	setVar $lastSecin 0

    send "*CN24"&$BOT~subspace&"* Q Q Q ZN* ^Q "
	
	# not in corp no point changing ship
	#send "c o* c q q q zn *"
	gosub :quickstart_getcourse

	
	:todock
		killAllTriggers

		#avoid danger sectors 
        setVar $result "c v" & $firstSecOut &"* v" &$lastSecin &"* q"
		#a couple of attacks just in case
        setVar $result $result&"n s eza" & $attackWave & "* * za" & $attackWave & "* *  ^q*"
		##setVar $result $result&"nse"
        send $result
		setVar $attemptsToDock 0
		:tryMakeItAgain
		add $attemptsToDock 1
		if ($attemptsToDock > 6)
			killAllTriggers
			send "'Failed to get to dock after 6 sets of attack*"
			echo "*#####################################*"
			echo "*#####################################*"
			echo "*#####      WARNING WARNING     ######*"
			echo "*##   DID NOT MAKE IT TO DOCK TAKE  ##*"
			echo "*##   MANUAL CONTROL!  GOOD LUCK    ##*"
			echo "*#####################################*"
			halt
		end
		waitfor "ENDINTERROG"
		setTextTrigger enemyFigs :enemyFigs "Option? (A,D,I,R,?):?"
        setTextLineTrigger madeittosd :madeittosd ", Class 9 (Special) (StarDock)"
		setTextTrigger needtoexpress :needtoexpress "Stop in this sector (Y,N,E,I,R,S,D,P,?) (?=Help)"
		pause
		:enemyFigs
			killAllTriggers
			send "z a " $attackWave "* * z a " $attackWave "* *^q*"
			goto :tryMakeItAgain
		:needtoexpress
			killAllTriggers
			send "ey^q* *"
			goto :tryMakeItAgain
		:madeittosd
			killAllTriggers


		#- wait for dock and fig prompts to attack (discarding those already attacked)
		echo "AT DOCK *"
		echo "AT DOCK *"


return

:quickstart_getcourse
	# 1 to Dest $cSector
	setVar $course ""
	setVar $coursei 1

	setVar $logText ""
	setVar $log 0
	send "nsn"
	setTextTrigger qs_warplane :qs_warplane "Warp Lane is not adjacent"
	pause
	:qs_warplane
		killalltriggers
	
	:qs_checkGoing2
	setTextLineTrigger qs_startlog2 :qs_startlog2 "shortest path"
	setTextTrigger qs_endlog2 :qs_endlog2 "gage the Autopilo"
	setTextTrigger qs_endlog3 :qs_endlog3 "Command ["
	setTextLineTrigger qs_goodline2 :qs_goodline2 ""
	
	pause
	:qs_startlog2
		killalltriggers
		
		setVar $log 1
		goto :qs_checkGoing2
	:qs_goodline2
		killalltriggers
		if ($log = 1) and (CURRENTLINE <> "")
			cuttext CURRENTLINE $firstchar 1 1
			if ($firstchar = "1") or ($firstchar = " ")
				setVar $logText $logText & CURRENTLINE
			end
		end
		
		goto :qs_checkGoing2
	:qs_endlog2
	:qs_endlog3
		killalltriggers
	
	setVar $logText $logText & " end"
	setVar $y 1
	getWord $logTEXT $stuff $y

	while ($stuff <> "end")
		
		STRIPTEXT $stuff "("
		STRIPTEXT $stuff ")"

		if (($stuff <> ">") and ($stuff <> "end"))
			if (($firstSecOut = 0) and ($stuff > 10))
				setVar $firstSecOut $stuff
			end
			setVar $course[$coursei] $stuff
			add $coursei 1
		end

		add $y 1
		getWord $logTEXT $stuff $y
	end
	setVar $lasti ($coursei - 2)
	setVar $lastSecin $course[$lasti]
return


:findClassOhs

	SetVar $i 11
	while ($i <= 10000)
		setVar $nofig 0
		if (SECTOR.WARPCOUNT[$i] >= 1)
			setVar $adj 1
			while ($adj <= SECTOR.WARPCOUNT[$i])
				SetVar $adjSector SECTOR.WARPS[$i][$adj]
				if ($adjSector = 6)
					send "'Potenial Alpha: " $i " has " SECTOR.WARPCOUNT[$i] " warps*"
				end
				if ($adjSector = 8)
					echo "'Potenial Rylos: " $i " has " SECTOR.WARPCOUNT[$i] " warps*"
				end
				add $adj 1
			end
		end
		add $i 1
	end
	halt
return



:grabcolos
	setarray $colts 10
	setvar $colts 0
	gosub :player~quikstats
	setVar $origship $player~SHIP_NUMBER
	setVar $location $player~current_prompt
	setVar $starting $player~current_sector
	if (($starting = $map~stardock) or ($starting <= 10))
		setVar $SWITCHBOARD~message "Can't start this from Fed Space.*"
		gosub :switchboard~switchboard
		HALT
	end
	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Start from Command Prompt.*"
		gosub :switchboard~switchboard
		HALT
	end
	send "w** "
	settextlinetrigger foundcolt :foundcolt "  0  Dracula's Coffin"
	settextlinetrigger nomore :nomore "Choose which ship to tow (Q=Quit)"
	settextlinetrigger nomore2 :nomore "You do not own any other ships in this sector!"
	pause
	:foundcolt
		getword currentline $shipnumber 1
		add $colts 1
		setvar $colts[$colts] $shipnumber
		settextlinetrigger foundcolt :foundcolt "  0  Dracula's Coffin"
		pause
	:nomore
		killtrigger foundcolt
		killtrigger nomore
		killtrigger nomore2

	if ($colts <= 0)
		setVar $SWITCHBOARD~message "No Colts found in this sector.*"
		gosub :switchboard~switchboard
		HALT
	end

	setvar $i 1
	while ($i <= $colts)
		send "*"
		gosub :player~quikstats
		if ((PORT.BUYFUEL[$starting] = false) and ((PORT.CLASS[$starting] <> 0) and (PORT.CLASS[$starting] <> 9)))
			send "p  t  * * *"
		end
		send "x  "&$colts[$i]&"*  *  j y x  "&$origship&"*  *  w * "&$colts[$i]&"* "
		setVar $player~warpto 1
		gosub :player~twarp
		if ($player~twarpSuccess = FALSE)
			setVar $SWITCHBOARD~message "Can't make it to Terra.  Halting.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		gosub :player~quikstats
		send "x  "&$colts[$i]&"*  *  l**  x  "&$origship&"*  *   w * "&$colts[$i]&"* "
		if ($player~twarpSuccess = true)
			setVar $player~warpto $starting
			gosub :player~twarp
			if ($player~twarpSuccess = FALSE)
				setVar $SWITCHBOARD~message "Can't get back!  Halting*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
			gosub :player~quikstats
			send "w "
		end
		add $i 1
	end


return

:movecolt
	setarray $colts 10 1
	setvar $colts 0
	gosub :player~quikstats
	setVar $origship $player~SHIP_NUMBER
	setVar $location $player~current_prompt
	setVar $starting $player~current_sector
	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Start from Command Prompt.*"
		gosub :switchboard~switchboard
		HALT
	end
	if ($bot~parm2 = "")
		setVar $SWITCHBOARD~message "No sectors selected.  You need to choose a sector to move to.*"
		gosub :switchboard~switchboard
		HALT
	end
	setvar $coltcount 0
	if ($bot~parm2 <> "")
		isnumber $isanumber $bot~parm2
		if ($isanumber <> true)
			setVar $SWITCHBOARD~message "Sector param is invalid.*"
			gosub :switchboard~switchboard
			HALT
		end
		add $coltcount 1
		setvar $colts[$coltcount][1] $bot~parm2
	end
	if ($bot~parm3 <> "")
		isnumber $isanumber $bot~parm3
		if ($isanumber <> true)
			setVar $SWITCHBOARD~message "Sector param is invalid.*"
			gosub :switchboard~switchboard
			HALT
		end
		add $coltcount 1
		setvar $colts[$coltcount][1] $bot~parm3
	end
	if ($bot~parm4 <> "")
		isnumber $isanumber $bot~parm4
		if ($isanumber <> true)
			setVar $SWITCHBOARD~message "Sector param is invalid.*"
			gosub :switchboard~switchboard
			HALT
		end
		add $coltcount 1
		setvar $colts[$coltcount][1] $bot~parm4

	end
	send "w** "
	settextlinetrigger foundcolt :foundcoltmove "  0  Dracula's Coffin"
	settextlinetrigger nomore :nomoremove "Choose which ship to tow (Q=Quit)"
	settextlinetrigger nomore2 :nomoremove "You do not own any other ships in this sector!"
	pause
	:foundcoltmove
		getword currentline $shipnumber 1
		add $colts 1
		setvar $colts[$colts] $shipnumber
		settextlinetrigger foundcolt :foundcolt "  0  Dracula's Coffin"
		pause
	:nomoremove
		killtrigger foundcolt
		killtrigger nomore
		killtrigger nomore2

		if ($colts <= 0)
			setVar $SWITCHBOARD~message "No Colts found in this sector.*"
			gosub :switchboard~switchboard
			HALT
		end
		if ($colts < $coltcount)
			setVar $SWITCHBOARD~message "Not enough colts in the sector for "&$coltcount&" sectors.  Buy more colts or choose fewer sectors.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
	
		setvar $i 1
		while ($i <= $coltcount)
			send "w * "&$colts[$i]&"* "
			setVar $player~warpto $colts[$i][1]
			gosub :player~twarp
			if ($player~twarpSuccess = FALSE)
				setVar $SWITCHBOARD~message "Sector missing fig, moving onto next.*"
				gosub :SWITCHBOARD~switchboard
			else
				setVar $SWITCHBOARD~message "Colt moved to sector "&$colts[$i][1]&".*"
				gosub :switchboard~switchboard
				send "*"
				gosub :player~quikstats
				if ((PORT.BUYFUEL[$colts[$i][1]] = false) and ((PORT.CLASS[$colts[$i][1]] <> 0) and (PORT.CLASS[$colts[$i][1]] <> 9)))
					send "p  t  * * *"
				end
			end
			send "w "
			gosub :player~quikstats
			if ($player~twarpSuccess = true)
				setVar $player~warpto $starting
				gosub :player~twarp
				if ($player~twarpSuccess = FALSE)
					setVar $SWITCHBOARD~message "Can't get back!  Halting*"
					gosub :SWITCHBOARD~switchboard
					halt
				end
				gosub :player~quikstats
			end
			add $i 1
		end

		halt
return

:docim

	setVar $SWITCHBOARD~message "Entering the matrix...*"
	gosub :switchboard~switchboard
	send "^i?"
	waitfor "<U> Unexplored Sectors"
	send "r?"
	waitfor "<U> Unexplored Sectors"
	send "q"
	setVar $SWITCHBOARD~message "Cim downlaod complete..*"
	gosub :switchboard~switchboard

return

:buycolt
	gosub :player~quikstats
	setVar $origship $player~SHIP_NUMBER
	setVar $location $player~current_prompt
	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Start from Command Prompt.*"
		gosub :switchboard~switchboard
		HALT
	end
	
	send "d"
	waitfor "Sector  :"
	setTextLineTrigger stardock2 :stardock2 "Ports   : Haunted Circuit City"
	setTextLineTrigger nostardock2 :nostardock2 "Warps to Sector(s) :"
	pause
	:nostardock2
		setVar $SWITCHBOARD~message "Start at dock*"
		gosub :switchboard~switchboard
		HALT
	:stardock2 
		killalltriggers


	setVar $origshi $player~SHIP_NUMBER
	if ($player~credits < 565000)
		setVar $SWITCHBOARD~message "Need 565k for Colt, 120 holds, twarp and torp*"
		gosub :switchboard~switchboard
		halt
	end
	send "pssbnyfyc1234512345***sq"

	waitfor "vailable Ships in Orbit"
	setTextLineTrigger theship :theship "1234512345"
	pause
		:theship
		getWord CURRENTLINE $shipnum 1
		killalltriggers

		send "qqx*" $shipnum "*qpss"
		waitfor "You walk past row after row of space ships"
		send "ryShip " $shipnum "*y"
		send "pa120*yb200*c500*qqhrw1t1*qq"
		waitfor "You return to your ship and blast off from the StarDock."
		send "x*" $origship "**"
		setVar $SWITCHBOARD~message "Colt purchased.*"
		gosub :switchboard~switchboard
		halt
return




:stripcash
	
	gosub :player~quikstats
	setVar $location $player~current_prompt
	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Start from Command Prompt.*"
		gosub :switchboard~switchboard
		HALT
	end
	
	

	send "t"
	setVar $go 1
	setVar $i 1
	while ($go = 1)
		send "c"
		setVar $y 1
		while ($y < $i)
			send "nm"
			add $y 1
		end
		waitfor "Exchange with"
		send "yf"
		setTextLineTrigger cash :cash "credits, and"
		setTextLineTrigger cashdone :cashdone "You may only be on one Corp at a time"
		pause
		:cashdone 
			killalltriggers
			send "* * * * * * * * * "
			setVar $SWITCHBOARD~message "Cash Strip Complete.*"
			gosub :switchboard~switchboard
			halt
		:cash
			killalltriggers
			getText CurrentLine $DECASH " has " "."
			stripText $DECASH ","
			stripText $DECASH " "
			if ($DECASH > 11000)
				setVar $DECASH ($DECASH - 5000)
				send $DECASH & "*"
			else
				setVar $DECASH 0
				send "*"
			end

		add $i 1
		if ($i > 10)
			send "* * * "
			halt
		end
	end

return

:buydora
	send "cv0*yyq"
	
	gosub :atdockinmerch
	
	send "psspa30*yqqhrhqspb3000*qqq"
	waitfor "You return to your ship and blast off from the StarDock"
	send "tfyf450*fnyf450** * * "
	setVar $SWITCHBOARD~message "Should be in Orion.*"
	gosub :switchboard~switchboard

	setVar $sec 1001
	:pathagain
	send "cf*" $sec "*q"
	
	setTextLineTrigger shortest :shortest "The shortest path"
	pause
	:shortest
		killalltriggers
		getword CURRENTLINE $hops 4
		STRIPTEXT $hops "("
		if ($hops < 8)
			add $sec 1
			waitfor "<Computer deactivated>"
			goto :pathagain
		else
			
			setTextLineTrigger thepath :thepath " > "
			pause
			:thepath
				killalltriggers
				getword CURRENTLINE $whereto 11
				STRIPTEXT $whereto ")"
				STRIPTEXT $whereto "("
				setVar $BOT~command "mow"
				setVar $BOT~user_command_line " mow "& $whereto 
				setVar $BOT~parm1 $whereto
				saveVar $BOT~parm1
				saveVar $BOT~command
				saveVar $BOT~user_command_line
				load "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
				setEventTrigger		mowended		:mowended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
				pause
				:mowended
					send "'" $SWITCHBOARD~BOT_NAME " dora 1400 all ports mcicbuy*"
					halt

		end

	halt

return

:buycorp
	
	gosub :atdockinmerch
	if ($player~credits < 1200000)
		setVar $SWITCHBOARD~message "Need 350k cash to get flag.*"
		gosub :switchboard~switchboard
		halt
	end

	send "pssbyyey"
	setTextLineTrigger flagok :flagok "What do you want to name this ship?"
	setTextLineTrigger flagnotok :flagnotok "Only Corporate Chairs can purchase this ship!"
	pause
	:flagnotok
		killalltriggers
		send "q q "
		setVar $SWITCHBOARD~message "You're not the CEO!.*"
		gosub :switchboard~switchboard
		halt
	:flagok
		killalltriggers
		send "The Bossman**pa155*yb199*qqhrhw2qq"
		waitfor "u return to your ship and blast off from the St"
		send "t f y f 900* * * * "
		send "t f n y f 900*  * * * * * * * * * "
		send "t f n n y f  900* * * * * * * * * * "
		send "t f n n n y f  900* * * * * * * * * * "
		send "t f n n n n y f  900* * * * * * * * * * "

		setVar $SWITCHBOARD~message "Should be in flaggy.*"
		gosub :switchboard~switchboard
		halt

return

:sellship
	
	setVar $SWITCHBOARD~message "Retired.*"
	gosub :switchboard~switchboard
	HALT
	gosub :atdockinmerch
	
	send "pssbyybycSitInIt**qq"
	waitfor "You return to your ship and blast off from the StarDock"
	setVar $SWITCHBOARD~message "Ship sold, cash on me.*"
	gosub :switchboard~switchboard
	HALT

return

:atdockinmerch
	gosub :player~quikstats
	setVar $location $player~current_prompt
	if ($location <> "Command")
		setVar $SWITCHBOARD~message "Start from Command Prompt.*"
		gosub :switchboard~switchboard
		HALT
	end
	send "i"
	waitfor "Ship Name      :"
	setTextLineTrigger merch :merch "Pumpkin Seed"
	setTextLineTrigger nomerch :nomerch "Credits        :"
	pause
	:nomerch
		setVar $SWITCHBOARD~message "Start at dock, in day 1 merch.*"
		gosub :switchboard~switchboard
		HALT
	:merch
		killalltriggers
	send "d"
	waitfor "Sector  :"
	setTextLineTrigger stardock :stardock "Ports   : Haunted Circuit City"
	setTextLineTrigger nostardock :nostardock "Warps to Sector(s) :"
	pause
	:nostardock
		setVar $SWITCHBOARD~message "Start at dock, in day 1 merch*"
		gosub :switchboard~switchboard
		HALT
	:stardock 
		killalltriggers

return
:waitandmow
    send "co*cq"
    send "nq"
    setTextLineTrigger getDockwait :getDockwait "(S) Sector  :"
    pause
    :getDockwait
        killalltriggers
        getWord CURRENTLINE $stardock 4

    setVar $towship $bot~parm2
    send "wn" $towship "*"

    setDelayTrigger briefwait :briefwait 2000
    pause
    :briefwait
        setvar $mow~destination $stardock
        setvar $mow~deploy "0"
        gosub :mow~run

    
    gosub :player~quikstats
    if ($player~current_sector <> $stardock)
        halt
    end
    
    send "x* " $towship "* * "
    setVar $figsRequired 2000
    gosub :player~quikstats
	//gosub :stripfig
     send "cv0*yyq"
    setVar $BOT~command "reboot"
    setVar $BOT~user_command_line " reboot "
    setVar $BOT~parm1 ""
    setVar $BOT~parm2 ""
    saveVar $BOT~parm1
    saveVar $BOT~parm2
    saveVar $BOT~command
    saveVar $BOT~user_command_line
    load "scripts\"&$bot~mombot_directory&"\commands\general\reboot.cts"
    setEventTrigger		rebootdone		:rebootdone "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\general\reboot.cts"
    pause
    :rebootdone
    killalltriggers
return

:iceSurround

    
    gosub :player~quikstats
    setVar $secs 0
    setVar $seci 0
    send "d"
    setTextLineTrigger getwarps :getwarps "Warps to Sector(s) :"
    pause
    :getwarps
       killAllTriggers
        setVar $stuff CURRENTLINE & " done"
    
        setVar $y 5
        setVar $go 1
        while ($go = 1)
            getWord $stuff $warp $y
            if ($warp = "done")
                setVar $go 0
            elseif ($warp <> "-")
                stripText $warp "("
                stripText $warp ")"
                add $seci 1
                setVar $secs[$seci] $warp
       
            end
            add $y 1
            if ($y > 50)
                setVar $go 0
            end

        end

    setVar $i 1
    while ($i <= $seci)
        getSectorParameter $tempAdj "FIGSEC" $isFigged
        if ($tempAdj = FALSE)
            send "cf" $player~current_sector "*" $secs[$i] "*q"
            send "cf" $secs[$i] "*" $player~current_sector "*q"
            
        end

        add $i 1
    end
    send "^q"
    waitfor ": ENDINTERROG"


    setVar $player~surroundFigs 1
    gosub :grid~surround
    send "tt.**q"

    setVar $currentSec $player~current_sector

    setVar $i 1
    while ($i <= SECTOR.WARPCOUNT[$currentSec])
        setVar $csec SECTOR.WARPS[$currentSec][$i]
        getSectorParameter $csec "FIGSEC" $hasfig

        if ($hasfig <> 1)
            setvar $mow~destination $csec
            setvar $mow~deploy "1"
            gosub :mow~run

            setvar $mow~destination $currentSec
            setvar $mow~deploy "1"
            gosub :mow~run
        end
        add $i 1
    end
    
    send "^q"
    waitfor "ENDINTERROG"
return

:masterpod 
    setVar $ships 0
    setVar $shipsi 0

    gosub :player~quikstats
    if ($PLAYER~CURRENT_PROMPT <> "Command")
        setVar $SWITCHBOARD~message "Need to be at Command Prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
    end

    setVar $podVictim $bot~parm2
    if ($podVictim = 0) or ($podVictim = "")
        setVar $SWITCHBOARD~message "Please provide the name of the bot you will be podding*"
		gosub :SWITCHBOARD~switchboard
		halt
    end

    send "tt.**q"

    send "i"
    setTextLineTrigger getCorp :getCorp "Corp           #"
    pause
    :getcorp
    getWord CURRENTLINE $corpnum 3
    STRIPTEXT $corpnum ","
    gosub :player~quikstats

   # gosub :iceSurround
    
    
    send "'" $podVictim " callin ppp" $podVictim "*"
    waitfor " - I am now part of team:"
    send "'" $podVictim " callout*"
    setTextLineTrigger corpmate :corpmat "ppp" & $podVictim
    setDelayTrigger cmtimeout :cmtimeout 3000
    pause
    :cmtimeout
        killAllTriggers
        send "'Corpie timed out, halting*"
        halt
    :corpmat
        killAllTriggers
       
        #R hammer Team: None Sec: 14510 Exp: 786 Aln: 1343 Creds: 43277 Ship: 1 Turns: 4298
        cuttext CURRENTLINE $theirname 3 6
        gettext CURRENTLINE $theirsec "Sec: " " Exp:"
        TRIM $theirname
        gettext CURRENTLINE $theirship "Ship: " " Turns:"

        if ($theirsec = $player~current_sector)
            setVar $podName $theirname
            setVar $shipsi 0
            goSub :getShipArray

            goSub :podPerson
            send "'" $podVictim " corp join " $corpnum " " $bot~corppassword "*"
            waitfor "I joined the Corporation and Claimed my Ship Corporate!"
           setVar $currentShips 0
            setVar $currenti 0
            setVar $newShip 0

            while ($currenti < $shipsi)
                add $currenti 1
                setVar $currentShips[$currenti] $ships[$currenti]
            end
            goSub :getShipArray
            if ($currenti > 0)
                
                setVar $iii 1
                while ($iii <= $shipsi)
                    setVar $foundship 0
                    setVar $yyy 1
                    while ($yyy <= $currenti)
    
                        if ($currentShips[$yyy] = $ships[$iii])
                            setVar $foundship 1
                        end
                        add $yyy 1
                    end
                    if ($foundship = 0)
                        setVar $newShip $ships[$iii]
                        setVar $iii 100
                    end
                    add $iii 1
                end
            else
                setVar $newShip $ships[1]
            end
            if ($newShip = 0)
                send "'Did not find the new ship num! something went wrong... *"
            end
            send "'" $podVictim " mac co" #42 "cq*"
            waitfor "{" & $podVictim & "} - Macro Complete"
            send "'" $podVictim " topoff*"
            waitfor "{" & $podVictim & "} - TopOff complete Left"    
            send "'" $podVictim " x " $newShip "*"
            waitfor "{" & $podVictim & "} - Xport complete"
            send "'" $podVictim " topoff*"
            waitfor "{" & $podVictim & "} - TopOff complete Left"    
            echo "'Podding complete*"
        else
            send "'" $podVictim " is not in our sector! halting...*"
            halt
        end 
   


return



:podPerson
    # $podVictim - bot name of the person about to be podded
    # Assumes same sector

    send "'" $podVictim " ice2022 preppod*"
    setTextLineTrigger victimReady :victimReady "{" & $podVictim & "} - Ready to be podded."
    setDelayTrigger victimelost :victimelost 4000
    pause
    :victimelost
        killAllTriggers
        setVar $SWITCHBOARD~message "Victime didn't respond... moving on*"
        gosub :SWITCHBOARD~switchboard
        return
    :victimReady
        killAllTriggers
      
	send "a"
	waitfor "<Attack>"

	:attackcont
	setTextTrigger att :att "(Y/N) [N]?"
	setTextTrigger endatt :endatt "Command ["
	pause
	:att
		killalltriggers
        #Attack log33333's Merchant Trader (100-0) (Y/N) [N]? No
        GETTEXT CURRENTLINE $tempname "Attack " "'s"
        getlength $tempname $len 
        if ($len > 6)
            setvar $temp $tempname
            cutText $temp $tempname 1 6
        end
echo "their Name: " $tempname "*"
        GETTEXT CURRENTLINE $shiptype "'s " " ("
        GETWORD $shiptype $ship 1

        if ($ship = "unmanned")
            send "n"
            goto :attackcont
        end

	    getWordPos $ship $pos "erchant"
        if ($pos > 0) and ($tempname = $theirname)
            GETTEXT CURRENTLINE $figcount "-" ") ("
            if ($figcount = 0)
                send "y1*"
                return
            else
                echo "PROBLME THEY HAVE FIGS!!"
                echo "'This person has figs, should not!*"
                send "* * * * *"
                return
            end
        else
            send "n"
            goto :attackcont
        end
    :ENDATT
        killAllTriggers
        return
return



:preppod
    gosub :player~quikstats
    send "f"
    setTextLineTrigger deployfig :deployfig " fighters available."
    pause
    :deployfig
        killAllTriggers
        getWord CURRENTLINE $figs 3
        STRIPTEXT $figs ","
        if ($figs = 0)
            send "0*"
        else
            send $figs "*cd"
        end
        setVar $BOT~command "corp"
        setVar $BOT~user_command_line " corp drop "
        setVar $BOT~parm1 "drop"
        setVar $BOT~parm2 ""
        saveVar $BOT~parm1
        saveVar $BOT~parm2
        saveVar $BOT~command
        saveVar $BOT~user_command_line
        load "scripts\"&$bot~mombot_directory&"\commands\general\corp.cts"
        setEventTrigger		dropcorp		:dropcorp "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\general\corp.cts"
        pause
        :dropcorp
            killalltriggers
    
    setVar $SWITCHBOARD~message "Ready to be podded.*"
    gosub :SWITCHBOARD~switchboard
    
return




:gopod
    gosub :player~quikstats

    if ($PLAYER~CURRENT_PROMPT <> "Command")
        setVar $SWITCHBOARD~message "Need to be at Command Prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
    end

    send "nq"
    setTextLineTrigger getBackDockgoPod :getBackDockgoPod "(S) Sector  :"
    pause
    :getBackDockgoPod
        killalltriggers
        getWord CURRENTLINE $stardock 4
       
    

    send "cv0*yyq"

    setVar $PLAYER~destination $stardock
    goSub :voidfirstnotFed
    waitfor "now be avoided in future navigation calculation"

    setVar $go 1
    while ($go = 1)
        getRnd $ranSector 1000 2000
        setVar $course ""
	    setVar $coursei 1
        setVar $courseStart 1
        setVar $courseEnd $ranSector
        echo "GETCOURSEARE******"
        echo "GETCOURSEARE******"
        echo "GETCOURSEARE******"
        
	    goSub :getCourseArray
        if ($pathdistance > 11)
            setVar $destBad 0
            setVar $destSector $course[11]
           
            
            setVar $courseStart $destSector
            setVar $courseEnd $stardock
            goSub :getCourseArray
        
            
            if ($pathdistance < 7)
                setVar $destBad 1
                echo "Target Destination to close to dock!*"
            end
            setVar $courseStart $stardock
            setVar $courseEnd $destSector
            goSub :getCourseArray
           
            if ($pathdistance < 7)
                setVar $destBad 1
                echo "Target Destination to close to dock!*"
            end
             if ($destBad = 0) and ($destSector <> 0)
                send "'Lets go to:" $destSector ", I hear it is sunny and warm*"
                setVar $go 0
            end
        end
       
    end
    



    setvar $mow~destination $destSector
    setvar $mow~deploy "0"
    gosub :mow~run
    
    killalltriggers

    send "f1*cd"

return


:getCourseArray
	# 1 to Dest $cSector
	setVar $course ""
	setVar $coursei 1
	

	setVar $logText ""
	setVar $log 0
	send "cf" $courseStart "*" $courseEnd "*"
	waitfor "at is the destination sect"

	:checkGoing2
	setTextLineTrigger NoRoute2 :NoRoute2 "Error - No route within"
	setTextLineTrigger startlog2 :startlog2 "shortest path"
	setTextTrigger endlog2 :endlog2 "Computer command ["
	setTextLineTrigger goodline2 :goodline2 ""
	
	pause
	:NoRoute2
		killAllTriggers
		send "n"
		setVar $coursei 0
		return
	:startlog2
		killalltriggers
        getWord CURRENTLINE $pathdistance 4
        striptext $pathdistance "("
        echo $pathdistance "*"
echo $pathdistance "*"
echo $pathdistance "*"

		setVar $log 1
		goto :checkGoing2
	:goodline2
		killalltriggers
		if ($log = 1) and (CURRENTLINE <> "")
			cuttext CURRENTLINE $firstchar 1 1
			if ($firstchar = "1") or ($firstchar = " ")
				setVar $logText $logText & CURRENTLINE
			end
		end
		
		goto :checkGoing2
	:endlog2
		killalltriggers
	send "q"
	setVar $logText $logText & " end"
	setVar $y 1
	getWord $logTEXT $stuff $y

	while ($stuff <> "end")
		
		STRIPTEXT $stuff "("
		STRIPTEXT $stuff ")"

		if (($stuff <> ">") and ($stuff <> "end"))
			setVar $course[$coursei] $stuff
			add $coursei 1
		end

		add $y 1
		getWord $logTEXT $stuff $y
	end
return


:crazyMow

    gosub :player~quikstats

    if ($PLAYER~CURRENT_PROMPT <> "Command")
        setVar $SWITCHBOARD~message "Need to be at Command Prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
    end

    send "v"
    setTextLineTrigger getBackDockCrazy :getBackDockCrazy "The StarDock is located in sector"
    pause
    :getBackDockCrazy
        killalltriggers
        getWord CURRENTLINE $stardock 7
        STRIPTEXT $stardock "."
   
    
    #goSub :voidfirstnotFed

    
    setDelayTrigger crazyStartDelay :crazyStartDelay 3000
    :crazyStartDelay
        killAllTriggers
    
    #grab cols
    send "lt2*"

    #grab figs
    send "cr*q"
    setTextLineTrigger sec1Figs2 :sec1Figs2 "B  Fighters        :"
    pause
    :sec1Figs2
        killAllTriggers
        getWord CURRENTLINE $maxfigs 8
        subtract $maxFigs 100
        if ($maxFigs > 0)
            send "ptb" $maxFigs "*q"
        end

    

    send "cv0*yyq"

    setVar $targets 0
    setVar $targeti 0
    setVar $targetDone 0

    setVar $totalTargets 0
    setVar $totalDone 0

    setVar $sent 0
    
    setVar $i 11
	while ($i < 51)

        send "cf1*" $i "*q"
        add $sent 1
		add $i 1
	end
    goSub :crazyGetTargets
     setVar $sent 0

    setVar $i 51
	while ($i < 91)

        send "cf1*" $i "*q"
        add $sent 1
		add $i 1
	end
    goSub :crazyGetTargets
   
   
    setVar $PLAYER~destination $stardock
    setVar $go 1
	while ($go = 1)
		goSub :getWarpAndAvoid
    
		if ($voidfound = 0)
			setVar $go 0
		end
	end

    setVar $jettisonDone 0

    setVar $i 1
    while ($i <= $targeti)
       
            setVar $BOT~command "mow"
            setVar $BOT~user_command_line " mow " & $targets[$i] & " 1 "
            setVar $BOT~parm1 $targets[$i]
            setVar $BOT~parm2 "1"
            saveVar $BOT~parm1
            saveVar $BOT~parm2
            saveVar $BOT~command
            saveVar $BOT~user_command_line
            load "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
            setEventTrigger		mowCrazyEnd2		:mowCrazyEnd2 "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
            pause
            :mowCrazyEnd2
            killalltriggers

                send "i"
                setTextLineTrigger crazyMowPod :crazyMowPod "*Pumpkin Seed*"
                setTextLineTrigger crazyMowNoPod :crazyMowNoPod "Total Holds    :"
                pause
                :crazyMowPod 
                    killAllTriggers
                    send "pzt"
                    send "'ALERT I'VE BEEN PODED! MAY be AFK! HELP*"
                    send "'ALERT I'VE BEEN PODED! MAY be AFK! HELP*"
                    send "'ALERT I'VE BEEN PODED! MAY be AFK! HELP*"
                    halt
                :crazyMowNoPod 
                    killAllTriggers

                    gosub :player~quikstats
                    if ($player~current_sector <> $targets[$i])
                        send "'Didn't make mow sector.. going on still*"
                    end

                gosub :player~quikstats
                if ($jettisonDone = 0)
                    send "d"
                    
                    if (PORT.EXISTS[$player~current_sector])
                        setVar $jettisonDone 1
                        send "o210*q"
                        send "jy"
                    
                        send "tt.**q"
                        waitfor "Corporate command ["
                        waitfor "Command ["
                        send "'all watcher*"
                    end
                end
                if ($player~fighters < 50)
                    setVar $SWITCHBOARD~message "Running low on figs, halting*"
                    gosub :SWITCHBOARD~switchboard
                    halt
                end

        add $i 1
    end

     send "'FIRE CRAZY MOW COMPELTE - WHO EVER DID THIS IS A SUCKER - bwahahah!*"

halt
# COUNT FIGS AFTER EACH LAP

    setVar $totalTargets $targeti
    # Technically totaldone is 0 but loops look neater this way goign 1 to 10 vs 0 to 9
    setVar $totalDone 1
    setVar $shortestTarget 99999

    while ($totalDone <= $totalTargets)
        setVar $shortestTarget 99999

        if ($totalDone = $totalTargets)
        echo "LAST TARGET!"
            setVar $i 1
            while ($i <= $totalTargets)

                if ($targetDone[$i] = 0)
                     setVar $shortestTarget $targets[$i]
                end
                add $i 1
            end
        else
            goSub :crazyGetCloset
        end
echo  "TARGET" $totalDone ": " $shortestTarget "*"

        :DoMow
            setVar $BOT~command "mow"
            setVar $BOT~user_command_line " mow " & $shortestTarget & " 1 "
            setVar $BOT~parm1 $shortestTarget
            setVar $BOT~parm2 "1"
            saveVar $BOT~parm1
            saveVar $BOT~parm2
            saveVar $BOT~command
            saveVar $BOT~user_command_line
            load "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
            setEventTrigger		mowCrazyEnd		:mowCrazyEnd "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\grid\mow.cts"
            pause
            :mowCrazyEnd
            killalltriggers
                
               
                #check SEctor
                #CHECK SHIP - issue xport to anything
            if ((PORT.EXISTS[$player~current_sector]) and ($doCrazyAlign = 1))
                setVar $doCrazyAlign 0
                send "o120*q"
            end
        if ($totalDone = 1)
            send "jy*"
        end
        add $totalDone 1
    end 

    send "f1*cd"
    send "pztn"
    send "'FIRE CRAZY MOW COMPELTE - WHO EVER DID THIS IS A SUCKER - bwahahah!*"

    halt

    
return

:crazyGetTargets

    setVar $y 1
    while ($y <= $sent) 
		setTextLineTrigger cMowPlot :cMowPlot "The shortest path "
        pause
        :cMowPlot
            killAllTriggers
            getWord CURRENTLINE $cDist 4
            striptext $cDist "("
            getWord CURRENTLINE $cSector 13
            if ($cDist > 15)
                add $targeti 1
                setVar $targets[$targeti] $cSector
                setVar $targetDone[$targeti] 0
            end
        add $y 1
    end
return

:crazyGetCloset

    setVar $shortestDist 99
    setVar $shortestTarget 99999

    setVar $i 1
    while ($i <= $targeti)
            #The shortest path (19 hops, 38 turns) from sector 1 to sector 12 is:
        if ($targetDone[$i] = 0)
            send "cf*" $targets[$i] "*q"
        end
        add $i 1
    end
    send "^q"

    :crazyClosestWaitMore
    setTextLineTrigger crazyShortestPath :crazyShortestPath "The shortest path "
    setTextLineTrigger crazyEndInterrog :crazyEndInterrog "ENDINTERROG"
    pause
    :crazyShortestPath
        killAllTriggers
        getWord CURRENTLINE $cshort 4
        getWord CURRENTLINE $cSector 13
        STRIPTEXT $cshort "("
        if ($cshort < $shortestDist)
            setVar $shortestDist $cshort
            setVar $shortestTarget $cSector 
echo "Setting shortest:" $cshort " to sector " $cSector "*"
        end
        goto :crazyClosestWaitMore

    :crazyEndInterrog
        killAllTriggers

    setVar $i 1
    while ($i <= $targeti)
           
        if ($targets[$i] = $shortestTarget)
            setVar $targetDone[$i] 1
        end
        add $i 1
    end


return

:getWarpAndAvoid
	setVar $voidfound 0
	send "cf" $PLAYER~destination "*" $PLAYER~CURRENT_SECTOR "*q"
	setTextLineTrigger void1 :void1 "The shortest path" 
	setTextLineTrigger nopath :nopath "Error - No route within "
	pause
	:nopath
		killAllTriggers
		send "nq"
		return
	:void1
		killAllTriggers
		setTextLineTrigger void2 :void2 ">" 
		pause
		:void2 
		killAllTriggers

		getWord CURRENTLINE $warp1 3
		stripText $warp1 "("
		stripText $warp1 ")"
		send "cv" $warp1 "*q"
		setVar $voidfound 1

return

:voidfirstnotFed
	
	send "cf" $PLAYER~CURRENT_SECTOR "*" $PLAYER~destination "*q"
	setVar $course ""
	setTextLineTrigger voidnotfedl :voidnotfedl "The shortest path" 
	setTextLineTrigger noindirectfed :noindirectfed "Error - No route within"
	pause
	:noindirectfed
		killalltriggers
		send "yq"
		setVar $SWITCHBOARD~message "Not initial path, exiting.*"
		gosub :SWITCHBOARD~switchboard
		halt
	:voidnotfedl
		killalltriggers
		:keepaddingfed
		setTextLineTrigger addCoursefed :addCoursefed ">"
		setTextTrigger endCoursefed :endCoursefed "Computer command [" 
		pause
		:addCoursefed
			killalltriggers
			setVar $course $course & " " & CURRENTLINE
			goto :keepaddingfed
		:endCoursefed
			killalltriggers
			setVar $prevwarp ""
			setVar $y 1
			setVar $go 1
			while ($go = 1)
				
				getWord $course $warp $y
				if ($warp <> ">")
					stripText $warp "("
					stripText $warp ")"
					if (($warp > 10) and ($y > 1))
						setVar $go 0
						if ($warp <> $PLAYER~destination)
							send "cv" $warp "*q"
						end
					end
					
					setVar $prevwarp $warp
				end
				add $y 1
				if ($y > 50)
					setVar $go 0
				end
			end



return


:stripfig

    send "c;q"
    setTextLineTrigger getMaxFigs :getMaxFigs " Main Drive Cost: "
    pause
        :getMaxFigs
        killAllTriggers
        getWord CURRENTLINE $maxFigs 7
        striptext $maxFigs ","

        if ($maxFigs < $figsRequired)
            setVar $figsRequired $maxFigs
            setVar $SWITCHBOARD~message "You want more figs than this ship holds so readjusting to " & $maxFigs & ".*"
		    gosub :switchboard~switchboard
        end


    setVar $havecorpies 0
    setVar $totalFigs $player~fighters
    setVar $figsToTake ($figsRequired - $totalFigs)

    if ($figsToTake <= 0)
        setVar $SWITCHBOARD~message "We already have equal or more than " & $figsRequired &", exiting strip.*"
		gosub :switchboard~switchboard
        return
    end
    if ($figsRequired < 1)
        setVar $SWITCHBOARD~message "We didn't specify how many fighters is required for stripFigs.*"
		gosub :switchboard~switchboard
		halt
    end
    
	send "t"
	setVar $go 1
	setVar $i 1
	while ($go = 1)
		send "f"
		setVar $y 1
		while ($y < $i)
			send "nm"
			add $y 1
		end

        if ($havecorpies = 0)
            :waitcorpiesFigs
    #c count - if 100 alert and quit
            setTextLineTrigger nocorpiesFigs :nocorpiesFigs "Your Associate must be in the same sector to conduct transfers!"
            setTextTrigger corpiesFigs :corpiesFigs "Exchange with"
            pause 
            :nocorpiesFigs 
                killalltriggers
                send "f"
                goto :waitcorpiesFigs
            :corpiesFigs
                killalltriggers
                setVar $havecorpies 1
        else
		    waitfor "Exchange with"
        end
		send "yf"
		setTextLineTrigger Figs :Figs "fighters, and"
		setTextLineTrigger Figsdone :Figsdone "You may only be on one Corp at a time"
		pause
		:Figsdone 
			killalltriggers
			send "* * * * * * * * * "
			setVar $SWITCHBOARD~message "Fig Strip Complete.*"
			gosub :switchboard~switchboard
			return
		:Figs
			killalltriggers
			getText CurrentLine $DEFIG " has " "."
			stripText $DEFIG ","
			stripText $DEFIG " "
            # $figsToTake
            if ($DEFIG > 0)
                if ($figsToTake > $DEFIG)
                    setVar $takeFigs $DEFIG
                    setVar $figsToTake ($figsToTake - $takeFigs)
                else
                    setVar $takeFigs $figsToTake
                    setVar $figsToTake 0
                end
			
				send $takeFigs & "*"
			else
				setVar $DEFIG 0
				send "*"
			end
            
            if ($figsToTake = 0)
                setVar $SWITCHBOARD~message "Fig Strip Complete.*"
			    gosub :switchboard~switchboard
                send "* * * * * * * * * "
                return 
            end
		add $i 1
		if ($i > 10)
			send "* * * "
			halt
		end
	end

return


:getShipArray
    setVar $shipsi 0
    setVar $done 0
    setVar $line ""
    setVar $ships ""

 
    send "WN"
    setTextTrigger depause :DEPAUSE "[Pause]"
    setTextTrigger cnt :CONTINUE "------"
    setTextTrigger blownstarport :BLOWN_STARPORT "Captain! Are you sure you want to port here?"
    pause


    :CONTINUE
    
    killTrigger cnt

    while ($done = 0)
        waitFor " "
        setVar $line CURRENTLINE
        if ($line = "You do not own any other ships in this sector!")
            setVar $done 1
        elseif ($line = "Choose which ship to tow (Q=Quit) ")
            setVar $done 2
        else
			trim $line
            getWord $line $ship_numb 1
            getWord $line $shipsec 2
            trim $shipsec
            if ($shipsec = CURRENTSECTOR)
                add $shipsi 1
                setVar $ships[$shipsi] $ship_numb
            end
        end
    end
	killalltriggers
    send "Q*"
return


:densityScan
	send "sd"
	waitfor "Relative Density Scan"

	setVar $deni 0
	setVar $nDensity 0
	setVar $nSector 0
	setVar $nWarps 0
	setVar $nHaz 0
	setVar $nAnom 0
	setVar $nNew 0

	setVar $freshSectors 0
	setVar $freshSectorsi 0
	setVar $freshSectorsNewPorts 0
	

	:densityScanning
		setTextLineTrigger densityScanLine :densityScanLine "Sector"
		setTextTrigger densityScanEnd :densityScanEnd "Help)?"
		pause
	
		:densityScanLine
	
			KillTrigger densityScanLine
			KillTrigger densityScanEnd
			
			getWord CURRENTLINE $scanSector 2
			if ($scanSector = "(")
				getWord CURRENTLINE $scanSector 3
				getWord CURRENTLINE $secDensity 5
				getWord CURRENTLINE $secWarps 8
				getWord CURRENTLINE $nHaz 11
				getWord CURRENTLINE $scanAnom 14
			else
				getWord CURRENTLINE $secDensity 4
				getWord CURRENTLINE $secWarps 7
				getWord CURRENTLINE $nHaz 10
				getWord CURRENTLINE $scanAnom 13
			end
			
			stripText $nHaz "%"
			
			getLength $scanSector $len

			stripText $scanSector ")"
			stripText $scanSector "("
			getLength $scanSector $len2
			
			stripText $$secDensity ","

			add $deni 1
			if ($len2 < $len)
				add $freshSectorsi 1
				setVar $freshSectors[$freshSectorsi] $scanSector
				if ($secDensity = 100)
					add $freshSectorsNewPorts 1
				end
				setVar $nNew[$deni] 1
			else
				setVar $nNew[$deni] 0
			end
			
			STRIPTEXT $secDensity ","			
			setVar $nDensity[$deni] $secDensity
			setVar $nSector[$deni] $scanSector
			setVar $nWarps[$deni] $secWarps
			setVar $warpCount[$scanSector] $secWarps
			setVar $nHaz[$deni] $nHaz
			setVar $nAnom[$deni] 0
			if ($scanAnom = "Yes")
				setVar $anomoly[$scanSector] 1
				setVar $nAnom[$deni] 1
			end
	
			goto :densityScanning
			
		:densityScanEnd
			KillTrigger densityScanLine
			KillTrigger densityScanEnd
	return

:joincorp
    :checkForCorp
        send "*TD"
        gosub :PLAYER~quikstats
        setTextLineTrigger	1 :thereIsMyCorp	"    "&$BOT~corpName
        setTextTrigger 		2 :noCorpThatName	"Corporate command ["
        send "L"
        pause
    :noCorpThatName
        killalltriggers
        echo "[[ Waiting 3 seconds to check for corp again, press [Spacebar] to cancel. ]]*"
        setDelayTrigger		3 :checkForCorp		3000
        setTextOutTrigger 	4 :alreadyCorped 	#32
        pause
    :thereIsMyCorp
        killalltriggers
        getWord CURRENTLINE $corpNumber 1
    :continueCorpCreation
        killalltriggers
        send "J"&$corpNumber&"*"&$BOT~corpPassword&"* * *CN24"&$BOT~subspace&"* Q Q Q ZN* ^Q c o* c q "
return

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\player\moveintosector\player"

include "source\bot_includes\grid\surround\grid"
include "source\bot_includes\planet\landingsub\planet"
include "source\bot_includes\external\mow"
