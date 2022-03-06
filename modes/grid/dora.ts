# We can go down one ways when sectors have 2 or more warps - this could potenially get us stuck
#   do we want an option to not have this occur?
#
#   Currently not doing port reports
#	Faind good ports, then do report?
#
#   MCIC - surround good ports?
#   - Request move - when figs between 40 and 20, onc at SXX port, request figs

#   TWarp - Ore Management - not an issue just not put in yet
#     - Do we cart ore around or get stuck, find nearest ore, warp elsehere?
#     - i.e. hard to be both trader + twarp gridder
#   Known Issues
#
#    - We aren't doing port reports, so trading poor sectors at least once. In theory da 1 script
#   - When just testing MCIC - Looks like when it holos, finds a PPT, it then skips the test mcic
# 
#     - normal move through one way - did the m to no where, at 12 -




# add tunnel option
# cehck the "Get back inside" is using twarp options
# block doors via void, and then plot out from door sector - really should have just inside door tunnel
# topoff can't be door sector
# script to make door defence
# test testing ports
# test speed on real server
# send out MArco Ports - they dump cash
#
# - findbb - needs to make bubble doors with a param
# -   Dora needs to mark sector with same param
# -   

gosub :BOT~loadVars


setVar $debug 1


loadVar $game~port_max
loadVar $game~ptradesetting
loadVar $game~MAX_PLANETS_IN_GAME
loadVar $bot~Folder
loadVar $PLAYER~SURROUNDFIGS			
loadVar $PLAYER~SURROUNDLIMP;			
loadVar $PLAYER~SURROUNDMINE			
loadVar $MAP~STARDOCK	
loadVar $BOT~LIMP_FILE 		
loadVar $BOT~ARMID_FILE 
loadvar $BOT~BOT_NAME

# ORE


setVar $BOT~help[1]  $BOT~tab&" Dora the Explorer"
setVar $BOT~help[2]  $BOT~tab&" Expores universe, no ZTM required, optional trades."
setVar $BOT~help[3]  $BOT~tab&" "
setVar $BOT~help[4]  $BOT~tab&" dora [turnsstop] {all/org/buys/none} {ports/warps} "
setVar $BOT~help[5]  $BOT~tab&"                    {mcicsell/mcicbuy/mcicboth}"
setVar $BOT~help[6]  $BOT~tab&" - [turnsstop] - Will stop exploring once we reach these turns."
setVar $BOT~help[7]  $BOT~tab&" - {all}       - All fuel<>equip org<>equip options"
setVar $BOT~help[8]  $BOT~tab&" - {org}       - All org<>equip options"
setVar $BOT~help[9]  $BOT~tab&" - {buys}      - BSB<>BSB combos"
setVar $BOT~help[10]  $BOT~tab&" - {none}      - No trading"
setVar $BOT~help[11]  $BOT~tab&"               When any trades applied, script will trade any port"
setVar $BOT~help[12]  $BOT~tab&"               it passes where it can sell a full load."
setVar $BOT~help[13]  $BOT~tab&" "
setVar $BOT~help[14]  $BOT~tab&" - {ports}     - Priortises gridding ports"
setVar $BOT~help[15]  $BOT~tab&" - {warps}     - Priortises gridding high warp density"
setVar $BOT~help[16]  $BOT~tab&" "
setVar $BOT~help[17]  $BOT~tab&" - {mcicsell}  - Test XXS ports for MCIC "
setVar $BOT~help[18]  $BOT~tab&" - {mcicbuy}   - Test XXB ports for MCIC "
setVar $BOT~help[19]  $BOT~tab&" - {mcicboth}  - Test all ports for MCIC "
setVar $BOT~help[20]  $BOT~tab&" "
setVar $BOT~help[21]  $BOT~tab&" - {deldata}  Deletes explored sectors "
setVar $BOT~help[22]  $BOT~tab&" - {top:[sector]}  Sector to twarp back to reload figs "
setVar $BOT~help[23]  $BOT~tab&" - {bubble:[door]:[internal]}  Fill bubble mode "
setVar $BOT~help[24]  $BOT~tab&"              Script will lock itself to the bubble"
setVar $BOT~help[25]  $BOT~tab&"              requires the door and a internal sector"
setVar $BOT~help[26]  $BOT~tab&"              to plot courses to ensure it stays in bubble."
setVar $BOT~help[27]  $BOT~tab&"              Assumes no ZTM data as it is a day 1 script"
setVar $BOT~help[28]  $BOT~tab&" - {tunnel:[door1]:[door2]:[internal]}  Tunnel mode "


gosub :BOT~helpfile

setVar $BOT~script_title "Hola - Lets take a looksie!"
gosub :BOT~banner

gosub :player~quikstats
setvar $startcredits $player~credits
setvar $startturns $player~turns


setVar $startingLocation $PLAYER~CURRENT_PROMPT
if ($startingLocation <> "Command")
	setVar $SWITCHBOARD~message "must be started from Command prompt.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

getWordPos $bot~user_command_line $pos "kill"
if ($pos > 0)
	setVar $kill TRUE
else
	setVar $kill FALSE
end

setvar $sector~safe_attack_only true
if ($kill = true)
	loadvar $ship~CAP_FILE	
	fileExists $CAP_FILE_chk $ship~CAP_FILE
	if ($CAP_FILE_chk)
		gosub :ship~loadshipinfo
	else
		gosub :ship~getShipCapStats
		gosub :ship~loadShipInfo
	end 

	gosub :SHIP~getShipStats
	gosub :combat~init 
end

if (($player~TWARP_TYPE = 1) or ($player~TWARP_TYPE = 2))
	setVar $moveTwarp 1
end

if ($player~FIGHTERS < 21)
	setVar $SWITCHBOARD~message "Dora - Need more than 20 figs!*"
	gosub :SWITCHBOARD~switchboard
	halt
end



setVar $stardock $MAP~STARDOCK
if ($stardock = 0)
	send "v"
    setTextLineTrigger getBackDockCrazy :getBackDockCrazy "The StarDock is located in sector"
    pause
    :getBackDockCrazy
        killalltriggers
        getWord CURRENTLINE $stardock 7
		STRIPTEXT $stardock "."
end
# FUTURE VARS
# Limps/Mines bot vars
setVar $restock 0
# Figs - Mines - Limps - maybe even figs called in?
setVar $callInFigs 0

setVar $cashPause 0

setVar $halt_turns $bot~parm1
isNumber $number $halt_turns

if ($number <> 1)
	setvar $switchboard~message "Please select what turns to halt at.*"
	gosub :switchboard~switchboard
	halt

end

if ($halt_turns <= 0)
	setvar $switchboard~message "Halt turns must be greater than 0.*"
	gosub :switchboard~switchboard
	halt
else
	setvar $switchboard~message "We will stop when we reach " & $halt_turns & " turns.*"
	gosub :switchboard~switchboard
end


getWordPos $bot~user_command_line $pos "deldata"
if ($pos > 0)
	setVar $deleteData TRUE
else
	setVar $deleteData FALSE
end


# pair trading options - ppt
#  "all" all pairs
#  "org" all Org-Equ
#  "buys" org - equip not selling ore
#  "none"  skip this step
setVar $pptTradingOption "buys"
setVar $singleTrades 1

# grid prority
#  "ports" SBS SSB ports  - I think this doesn't work because we end up with not enough buys!
#  "warps" - default - grid best option for exploring
setVar $gridPriority "ports"

# use the 'Trade' command to testMCIC and generall trade

# Trade every port where MCIC is needed OR have a viable trade for cash
#     Actually many options here
#      - Trading for cash
#      - MCIC Buys - i.e. none megarob options
#      - MCIC All - when wanting XXS ports for mega robs
#       - combo of them
#     Just making three options
#  just looking at mcic ports - all B S

setVar $testMcicSell 0
setVar $testMcicBuy 0

getWordPos $bot~user_command_line $pos "mcicsell"
if ($pos > 0)
	setVar $testMcicSell 1
	setVar $testMcicBuy 0
	setVar $msg $msg&"Testing MCIC XXS Ports only*"
	striptext $bot~user_command_line "mcicsell"

end

getWordPos $bot~user_command_line $pos "mcicbuy"
if ($pos > 0)
	setVar $testMcicBuy 1
	setVar $testMcicSell 0
	setVar $msg $msg&"Testing MCIC XXB Ports only*"
	striptext $bot~user_command_line "mcicbuy"
end

getWordPos $bot~user_command_line $pos "mcicboth"
if ($pos > 0)
	setVar $testMcicBuy 1
	setVar $testMcicSell 1
	setVar $msg $msg&"Testing MCIC XXS and XXB Ports*"
	striptext $bot~user_command_line "mcicboth"
end


getWordPos $bot~user_command_line $pos "all"
if ($pos > 0)
	setVar $pptTradingOption "all"
	setVar $msg $msg&"Trading All Pairs*"
else
	getWordPos $bot~user_command_line $pos "org"
	if ($pos > 0)
		setVar $pptTradingOption "org"
		setVar $msg $msg&"Trading Organic - Equipment Ports*"
	else
		getWordPos $bot~user_command_line $pos "buys"
		if ($pos > 0)
			setVar $pptTradingOption "buys"
			setVar $msg $msg&"Trading Org - Equip at BXXs only"
		else
			getWordPos $bot~user_command_line $pos "none"
			if ($pos > 0)
				setVar $pptTradingOption "none"
				setVar $msg $msg&"We are not trading at ports*"
				setVar $singleTrades 0
			end
		end
	end
end

setVar $msg $msg&"Prioritising sectors with SBS or SSB ports*"
getWordPos $bot~user_command_line $pos "ports"
if ($pos > 0)
	setVar $gridPriority "ports"
	setVar $msg $msg&"Prioritising sectors with SBS or SSB ports*"
else
	getWordPos $bot~user_command_line $pos "warps"
	if ($pos > 0)
		setVar $gridPriority "warps"
		setVar $msg $msg&"Prioritising sectors with best gridding option*"
	end
end

#################################################
##     NEW STUFF TESTING

# t - EP - h "internal" - "n" no haggle
setVar $haggle "t"

getWordPos $bot~user_command_line $pos "int"
if ($pos > 0)
	setVar $haggle "h"
	setVar $msg $msg&"Using internal haggle*"
end
getWordPos $bot~user_command_line $pos "nohag"
if ($pos > 0)
	setVar $haggle "n"
	setVar $msg $msg&"Using no haggle routine*"
end
if ($haggle = "t")
	setVar $msg $msg&"Using EP haggle routine*"
end
setVar $doSelfTopOff 0

getWordPos " "&$bot~user_command_line&" " $pos " top:"
if ($pos > 0)
	getText " "&$bot~user_command_line&" " $topoffSector " top:" " "
	echo $topoffSector
	isNumber $test $topoffSector
	if ($test)
	
		if ($PLAYER~TWARP_TYPE = "No") or ($PLAYER~TWARP_TYPE = 0)
			setVar $SWITCHBOARD~message "This ship does not have a transwarp drive, can not TWARP top Off!*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		setVar $doSelfTopOff 1
		setVar $msg $msg&"Topping off figs at " & $topoffSector & "*"
	else
		setVar $SWITCHBOARD~message "Top Off sector should be a number.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end


end

# output PPT pairs to corp mates
setVar $alertPPT 1



if ($alertPPT = 1)
	setVar $pptPortUsed SECTORS
	setVar $portsClass5 0
	setVar $portsClass2 0
	setVar $portsClass5i 0
	setVar $portsClass2i 0

	setVar $portsClass4 0
	setVar $portsClass1 0
	setVar $portsClass4i 0
	setVar $portsClass1i 0

	# to save popping out ports and reshuffling arrays
	# i'll just keep a curose on where we are at in the 
	# various arrays.
	setVar $portsCurrent5i 0
	setVar $portsCurrent2i 0
	setVar $portsCurrent4i 0
	setVar $portsCurrent1i 0
end


# fill sectors - meaning we won't do adj trades, our goal is to fill out the grid
setVar $fillbubble 0
setVar $fillBubbleDoor 0
setVar $fillBubbleInt 0
setVar $fillBubbleIsTunnel 0
getWordPos " "&$bot~user_command_line&" " $pos " bubble:"
if ($pos > 0)
	getText " "&$bot~user_command_line&" " $bubbleinfo " bubble:" " "
	echo $bubbleinfo
	replaceText $bubbleinfo ":" " "
	getWord $bubbleinfo $fillBubbleDoor 1
	getWord $bubbleinfo $fillBubbleInt 2
	if ($debug = 1)
		echo "Fill Bubble Door is: " $fillBubbleDoor "*"
		echo "Fill Bubble Internal is: " $fillBubbleInt "*"
	end
	isNumber $test $fillBubbleDoor
	if ($test) and ($fillBubbleDoor > 10)
		isNumber $test $fillBubbleInt
		if ($test) and ($fillBubbleInt > 10)
			setVar $fillbubble 1
			
			setVar $msg $msg&"Fill Bubble Mode activate. Door: " & $fillBubbleDoor & " Int: " & $fillBubbleInt & "*"
		else
			setVar $SWITCHBOARD~message "Bubble Interior Sector is not a number above 10.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		
		
	else
		setVar $SWITCHBOARD~message "Bubble Door Sector is not a number above 10.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

end

getWordPos " "&$bot~user_command_line&" " $pos " tunnel:"
if ($pos > 0)
	getText " "&$bot~user_command_line&" " $bubbleinfo " tunnel:" " "
	echo $bubbleinfo
	replaceText $bubbleinfo ":" " "
	getWord $bubbleinfo $fillBubbleDoor 1
	getWord $bubbleinfo $fillBubbleDoor2 2
	getWord $bubbleinfo $fillBubbleInt 3
	setVar $fillBubbleIsTunnel 1
	if ($debug = 1)
		echo "Fill Tunnel Door 1: " $fillBubbleDoor "*"
		echo "Fill Tunnel Door 2: " $fillBubbleDoor2 "*"
		echo "Fill Tunnel Internal is: " $fillBubbleInt "*"
	end
	isNumber $test $fillBubbleDoor
	if ($test) and ($fillBubbleDoor > 10)
		isNumber $test $fillBubbleDoor2
		if ($test = false)
			setVar $SWITCHBOARD~message "Tunnel Door 2 Sector is not a number above 10.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		isNumber $test $fillBubbleInt
		if ($test) and ($fillBubbleInt > 10)
			setVar $fillbubble 1
			
			setVar $msg $msg&"Fill Bubble Mode activate. Tunnel Door 1: " & $fillBubbleDoor & " Door 2: " & $fillBubbleDoor2 & " Int: " & $fillBubbleInt & "*"
		else
			setVar $SWITCHBOARD~message "Bubble Interior Sector is not a number above 10.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		
		
	else
		setVar $SWITCHBOARD~message "Tunnel Door 1 Sector is not a number above 10.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end


end


# twarp options - bassically, we hit a dead end, we should twarp somewhere if we can

# Sector to land
setVar $twarpOption 0
# Adjacent Sector
setVar $twarpOptionAdj 0
setVar $twarpOptioni 0
if (($fillbubble = 1) and ($deleteData = 0))
	goSub :loadTwarpOption
end

## first trade we will avoid sectors - then remove

setVar $avoidSectorTest 1

######


setvar $switchboard~message $msg
	gosub :switchboard~switchboard

setVar $allLimps 0
setVar $allArmids 0

fileExists $limpchk $BOT~LIMP_FILE
if ($limpchk = false)
	setVar $BOT~command "update"
	setVar $BOT~user_command_line "update"
	setVar $BOT~parm1 "update"
	
	saveVar $BOT~parm1
	
	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\"&$bot~mombot_directory&"\commands\data\update.cts"
	setEventTrigger        limpchkend        :limpchkend "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\data\update.cts"
	pause
	:limpchkend
		killalltriggers
	readToArray $BOT~LIMP_FILE $allLimps
else
	readToArray $BOT~LIMP_FILE $allLimps
end




setVar $stat_turnsUsed 0 
setVar $stat_figsdown 0
setVar $stat_moves 0
setVar $stat_trades 0
setVar $stat_refurbs 0

setVar $stat_dollarsppt 0
setVar $stat_dollarsnet 0
setVar $stat_dollarstrade 0

window dora 300 300 "Explore and Trade" 

setvar $stuff "Turns: " & $stat_turnsUsed & "*Figs Down: " & $stat_figsdown & "*Ports Traded: " & $stat_trades & "*Moves Made: " & $stat_moves & "**Gross Cash:" & $stat_dollarsppt & "**Net Cash:" & $stat_dollarsnet
setvar $stuff $stuff & "**Refurbs: " & $stat_refurbs
setWindowContents dora $stuff



#logging off
#reqRecording


setVar $doraExploredFile "dora_explored_" &  GAMENAME  & ".txt"
# Good POrts - tehse are those we can come back and explore - if we have twarp
# if we don't, we'll just grid them as we go
setVar $dangerousSectorLogFile "Grid_Warnings_" &  GAMENAME & "_" & $date & ".txt"


setArray $explored SECTORS

# This will be my stack for storing back out
#   when we hit a dead end, we work back looking for another option.
#   
#		    Max Sectors we'll keep in path back
setVar $maxPathBack 25
setArray $pathBack $maxPathBack
setVar $pathBacki 0
# Before going back, check we are not locked in.
setArray $pathBackHasOptions $maxPathBack


# we store this because tradewars stores it based on warp data, not density scan
setArray $warpCount SECTORS

setVar $futureDestsAdded 0
setVar $futurePortsAdded 0


fileExists $figlchk $doraExploredFile
if ($figlchk = 1)
	
	if ($deleteData = TRUE)
		echo "*###########"
		echo "*# DELETED #"
		echo "*###########"
		goSub :clearTwarpOption
		setvar $switchboard~message "Deleting Previous Data.*"
		gosub :switchboard~switchboard
		delete $doraExploredFile
	else
		if ($figlchk = 1)
			
			readToArray $doraExploredFile $voidsList
			setVar $i 1
			while ($i <= $voidsList)
				setVar $explored[$voidsList[$i]] 1
				#echo "* adding: " $voidsList[$i]
				add $i 1
			end
		end
	end
end

setVar $whichBubble 0
setVar $maxWhichBubble 0
# Block Tunnel Bubble Doors
setVar $i 11
while ($i <= SECTORS)

	getSectorParameter $i "BUBBLEDOOR" $blockSec
	isNumber $test $blockSec
	if ($test = 1)
		if ($blockSec > 0)
			setVar $explored[$i] 1
			echo "Blocking Bubble Door: " $i "*"
			if ($fillbubble = 1)
				getSectorParameter $i "WHICHBUB" $whichbubTemp
				if ($whichbubTemp = "")
					setVar $whichbubTemp 0
				
				end
				if ($whichbubTemp > 0)
					if ($whichbubTemp > $maxWhichBubble)
						setVar $maxWhichBubble $whichbubTemp
					end
					if ($i = $fillBubbleDoor)
						setVar $whichbubble $whichbubTemp
					end
				end
			end
		end
	end

	getSectorParameter $i "TUNNELDOOR" $blockSec 
	isNumber $test $blockSec
	if ($test = 1)
		if ($blockSec > 0)
			setVar $explored[$i] 1
			echo "Blocking Tunnel Door: " $i "*"
			if ($fillbubble = 1)
				getSectorParameter $i "WHICHBUB" $whichbubTemp
				if ($whichbubTemp = "")
					setVar $whichbubTemp 0
				end
				if ($whichbubTemp > 0)
					if (($i = $fillBubbleDoor) or ($i = $fillBubbleDoor2))
						setVar $whichbubble $whichbubTemp
					end
					
					if ($whichbubTemp > $maxWhichBubble)
						setVar $maxWhichBubble $whichbubTemp
					end
					
				end
			end
		end
	end
	
	add $i 1
end

if (($fillbubble = 1) and ($whichbubble = 0))
	setVar $whichBubble ($maxWhichBubble + 1)
	if ($fillBubbleIsTunnel)
		setSectorParameter $fillBubbleDoor "WHICHBUB" $whichBubble
		setSectorParameter $fillBubbleDoor2 "WHICHBUB" $whichBubble
	else
		setSectorParameter $fillBubbleDoor "WHICHBUB" $whichBubble
	end
end
if ($fillbubble = 1)
	echo "$whichBubble: " $whichBubble "*"
	echo "$whichBubble: " $whichBubble "*"
	echo "$whichBubble: " $whichBubble "*"
	echo "$whichBubble: " $whichBubble "*"
	
end
listActiveScripts $scripts
setVar $foundep 0
setVar $a 1
while ($a <= $scripts)
	if ($scripts[$a] = "ephaggle.cts")
		setVar $foundep 1
	end
	add $a 1
end

setvar $switchboard~message "Pause for effect....*"
gosub :switchboard~switchboard
if ($haggle = "h") or ($haggle = "n")
	if ($foundep = 1)
		stop "ephaggle"
	end
end
if ($foundep = 0) and ($haggle = "t")
	send "'" $BOT~BOT_NAME " ephaggle*"
end

setDelayTrigger delay :startPause 3000
pause
:startPause


setvar $switchboard~message "... and we are off!*"
gosub :switchboard~switchboard

gosub :player~quikstats

gosub :setVoidSectors

if ($fillbubble = 1)

	setvar $switchboard~message "Voiding Door(s) and testing location*"
	gosub :switchboard~switchboard
	if ($topoffSector > 1)
		if ($topoffSector = $fillBubbleDoor)
			setvar $switchboard~message "Top Off sector can not be a Bubble/Tunnel Door*"
			gosub :switchboard~switchboard
			halt
		end

		if ($topoffSector = $fillBubbleDoor2)
			setvar $switchboard~message "Top Off sector can not be a Bubble/Tunnel Door*"
			gosub :switchboard~switchboard
			halt
		end
	end
	if (CURRENTSECTOR = $fillBubbleDoor)
		setvar $switchboard~message "Can't start from door, please start inside the bubble*"
		gosub :switchboard~switchboard
		halt
	end

	if ($fillBubbleIsTunnel = 1)
		if (CURRENTSECTOR = $fillBubbleDoor2)
			setvar $switchboard~message "Can't start from door 2, please start inside the bubble*"
			gosub :switchboard~switchboard
			halt
		end
	end
	send "cv" $fillBubbleDoor "*q"
	if ($fillBubbleIsTunnel = 1)
		send "cv" $fillBubbleDoor2 "*q"
	end
	
	setVar $bubbleChecks 0

	:bubbleChecksAgain
	if ($bubbleChecks = 0)
		setVar $bubbleChecks 1
	#check internal
		send "cf*" $fillBubbleInt "*q"
	else
		setVar $bubbleChecks 2
		send "cf1*" $fillBubbleInt "*q"
	end
	waitfor "t is the destination sect"
	setTextLineTrigger checkIntGood :checkIntGood "he shortest path"
	setTextLineTrigger checkIntBad :checkIntBad "No route within"
	pause
	:checkIntBad
		
		killalltriggers
		if ($bubbleChecks = 1)
			send "yq"
			setvar $switchboard~message "Either you are not in bubble or the internal sector isnt! Halting*"
			gosub :switchboard~switchboard
			halt
		else
			send "nq"
			goto :doneBubbleChecks
		end
	:checkIntGood
		killalltriggers
		if ($bubbleChecks = 1)
			goto :bubbleChecksAgain
		else
			setvar $switchboard~message "Either you are not in bubble or the internal sector isnt! Halting*"
			gosub :switchboard~switchboard
			halt
		end
		:doneBubbleChecks
end


 
######################### MAIN LOOP
# Log Explored sectors so script can re-start


setVar $skipport 0	
setVar $iSaySo 1
while ($iSaySo)
	:topOfTheGridLoop
	if ($fillbubble = 1)
		setSectorParameter CURRENTSECTOR "WHICHBUB" $whichBubble
	end
if ($debug = 1)
	echo "DEBUG: 	topOfTheGridLoop*"
end
	setVar $freshSectors 0
	setVar $freshSectorsi 0
	setVar $freshSectorsNewPorts 0
	
	gosub :player~quikstats
	setvar $turnsNow $player~turns
	
	if ($cashPause = 1)
		if (PORT.EXISTS[CURRENTSECTOR] = TRUE)
			if (PORT.BUYFUEL[CURRENTSECTOR] = FALSE)
				send "'[atm:" $switchboard~BOT_NAME "=" CURRENTSECTOR "]*"
				waitfor "[atmdone]"
				send "'[atm]Spend it wisely, I'm out here risking my hide for peanuts!*"
				setVar $cashPause 0
			end
		end
	end
	if ($turnsNow < $halt_turns)
		setvar $switchboard~message "Turn Limit Reached*"
		gosub :switchboard~switchboard
		clearAllAvoids
		gosub :subreport
		halt
	end
	if (($doSelfTopOff = 1) and ($player~FIGHTERS < 41) and ($ice = 0))
		
		if (PORT.EXISTS[CURRENTSECTOR] = TRUE)
			if (PORT.BUYFUEL[CURRENTSECTOR] = FALSE)

				gosub :functionDoTopOff
			end
		end
		if (($player~FIGHTERS < 11) and ($ice = 0))
			setVar $SWITCHBOARD~message "Could not locate a port to top off fuel and get more figs, halting*"
			gosub :SWITCHBOARD~switchboard
			clearAllAvoids
			gosub :subreport
			halt
		end
	elseif (($player~FIGHTERS < 21) and ($ice = 0))
		setVar $SWITCHBOARD~message "Need more than 20 figs*"
		gosub :SWITCHBOARD~switchboard
		clearAllAvoids
		gosub :subreport
		halt
	end
	goSub :updateStats
	
	setVar $doneHolo 0
	#densityscan and store
	goSub :densityScan

	# check Trades
	if ((($pptTradingOption <> "none") or ($testMcicSell = 1) or ($testMcicBuy = 1)) and (PORT.EXISTS[$PLAYER~CURRENT_SECTOR]) and ($skipNextTrade = 0))
if ($debug = 1)
	echo "DEBUG: 	check Trades*"
end
		if ($freshSectorsNewPorts > 0)
			goSub :holoScan
			setVar $doneHolo 1
			#check warps (maybe reports?)
			goSub :updateFreshSectors
		end
		# check trade needs to use $pptTradingOption and return back here once done. 
		# Check trade can also do $testMcic trade 
		# do the trade also
		setVar $originSector $PLAYER~CURRENT_SECTOR
		goSub :checkTrade
		if ($originSector <> $PLAYER~CURRENT_SECTOR)

			# Ok finished in other sector, lets push the previous onto the stack and go from here
			# Lets count if it had any neighbouring safe sectors, excluding ourselves!

			setVar $i 1
			setVar $safeSectors 0
			while ($i <= $deni)

				setVar $danger 0
				setVar $dSector $nSector[$i]
				setVar $dIndex $i
				getSectorParameter $dSector "FIGSEC" $hasFig
				if ($hasFig = "")
					setVar $hasFig 0
				end
				goSub :checkDanger
		
				if (($danger = 0) and ($explored[$dSector] = 0))
					if (($hasFig = 0) and ($dSector <> $PLAYER~CURRENT_SECTOR))
						add $safeSectors 1
						if ($moveTwarp = 1)
							setVar $twarpOrigin $originSector
							setVar $twarpAdj $dSector
							goSub :addTwarpOption

						end
					end
				end
				add $i 1
			end
			setVar $explored[$originSector] 1
			write $doraExploredFile $originSector
			setVar $stackSector $originSector
			goSub :pushPath
			# We've traded this sector, so we just want to go on to next one
			setVar $skipNextTrade 1
			goto :topOfTheGridLoop
		end
	
	end
	setVar $skipNextTrade 0
	# Check ATM

	if ($cashPause = 1)
		if (PORT.EXISTS[CURRENTSECTOR] = TRUE)
			if (PORT.BUYFUEL[CURRENTSECTOR] = FALSE)
				send "'[atm:" $switchboard~BOT_NAME "=" CURRENTSECTOR "]*"
				waitfor "[atmdone]"
				send "'[atm]Spend it wisely, I'm out here risking my hide for peanuts!*"
				setVar $cashPause 0
			end
		end
	end

	# Trading Done
	if ($debug = 1)
		echo "DEBUG: chcking fresh sectors*"
	end
	if ($alertPPT = 1)
		goSub :checkPPTAlerts
	end

	if (($freshSectorsNewPorts > 0) and ($doneHolo = 0))
		goSub :holoScan
		goSub :updateFreshSectors
	end

	goSub :getNextWarp
	if ($bestSector = 0)
		# We had to reposition and therefor not moving
		# need to rescan and move
		setVar $skipNextTrade 1
		goto :topOfTheGridLoop
	end

	if ($player~current_sector = 0)
		gosub :player~quikstats
	end
	# Log These like ftr grid and reload to not duplicate
	setVar $explored[$PLAYER~CURRENT_SECTOR] 1
	write $doraExploredFile $PLAYER~CURRENT_SECTOR

	
	if ($gridSectorPostTwarp > 0)
		# means we got something from previous options
if ($debug = 1)
	echo "DEBUG: $gridSectprPostTwarp*"
end
		setVar $player~warpto $gridSector
		gosub :player~twarp
		add $stat_moves 1

		setVar $gridSectorPostTwarp 0
		# Need to skip trading at next port as it'll be used
		# saves wasing time re checking
		setVar $skipport 1

	else
		goSub :gridNextSector
	end
	
end
######################### END LOOP
clearAllAvoids
halt

:updateFreshSectors
if ($debug = 1)
	echo "DEBUG: 	updateFreshSectors*"
end
	# just get all ports and single sectors plots back
	# this is to make sure we don't go down a 1 way whether navigating or ppt
	
	setVar $i 1
	while ($i <= $deni)
		# only get warps of target ports
		setVar $cl PORT.CLASS[$nSector[$i]]
		# only get paths of singles when no ppt'ing
		if (($pptTradingOption <> "none") or (($gridPriority = "ports") and (($cl = 4) or ($cl = 5) or ((($cl = 2) or ($cl = 1)) and ($nWarps[$i] > 2)))))
			if ((($nWarps[$i] = 1) and ($nNew[$i] = 1)) or (($nDensity[$i] = 100) and ($nNew[$i] = 1)))
			#	send "cf" $nSector[$i] "*" $PLAYER~CURRENT_SECTOR "*q"
			#	waitfor "omputer deactivated"
			end
		else
			# Unsure if I want to test 1 ways..
			if (($nWarps[$i] = 1) and ($nNew[$i] = 1))
				#send "cf" $nSector[$i] "*" $PLAYER~CURRENT_SECTOR "*q"
				#waitfor "omputer deactivated"
			end
		end
		add $i 1
	end
return


:getNextWarp
if ($debug = 1)
	echo "DEBUG: 	:getNextWarp*"
end	
	# COLLECT DATA - Some used in one routine and not the other
	setVar $i 1
	setVar $safeSectors 0
	setVar $safes 0
	setVar $numSells 0
	setVar $sells 0
	setVar $numBuys 0
	setVar $buys 0
	setVar $bestSector 0

	while ($i <= $deni)

		setVar $danger 0
		setVar $dSector $nSector[$i]
		setVar $dIndex $i
		setvar $class PORT.CLASS[$dSector]
		getSectorParameter $dSector "FIGSEC" $hasFig
		if ($hasFig = "")
			setVar $hasFig 0
		end
		goSub :checkDanger
#echo "$danger:" $danger " $explored[$dSector]:" $explored[$dSector] " $class:" $class " $hasFig:" $hasFig "*"
		if (($danger = 0) and ($explored[$dSector] = 0))

			if ((($class = 4) or ($class = 5)) and ($hasFig = 0))
#echo "Found NumSells*"
				add $numSells 1
				setVar $sells[$numSells] $dSector
			end

			# we'll store buys with 4+ as th next option they are twice as prevlant as Sxx's, so it'll work out even
			if ((($class = 1) or ($class = 2)) and ($hasFig = 0) and ($warpCount[$dSector] > 2))
				add $numBuys 1
				setVar $buys[$numBuys] $dSector
			end
			if (($hasFig = 0) or ($hasFig = ""))
				add $safeSectors 1
				setVar $safes[$safeSectors] $dSector
				if ($moveTwarp = 1)
					setVar $twarpOrigin CURRENTSECTOR
					setVar $twarpAdj $dSector
					goSub :addTwarpOption
				end
			end
		end
		add $i 1
	end

	# Chanse sell ports
	if ($gridPriority = "ports")
		
		if ($numSells > 0)
			setVar $chkOptioni $numSells
			setVar $chkOption 0
			setVar $i 1
			while ($i <= $numSells)
				setVar $chkOption[$i] $sells[$i]
				add $i 1
			end

			goSub :getBestSectorFromList
			# we aren't going to infill when we are using fillbubble
			if ($newOptions > 1) and ($fillbubble = 0)
				goSub :goGridOtherOptions
			end
		end
		
		setVar $chkOptioni $numBuys
		setVar $chkOption 0
		setVar $i 1
		while ($i <= $numBuys)
			setVar $chkOption[$i] $buys[$i]
			add $i 1
		end

		if ($bestSector = 0)
			# we don't have a SELL ore pair, lets get a Buy Ore Pair port
			
			goSub :getBestSectorFromList
			if ($newOptions > 1) and ($fillbubble = 0)
				goSub :goGridOtherOptions
			end
		else
			# only if we aren't filling
			if ($fillbubble = 0)
				# going to grid the buys now anyway - may remove this later
				# just testing ot see if we can increase number of trades post
				# - taking note, we are using the best sector routine to sort these
				# so need to save and restore
				setVar $temp_$bestSector $bestSector
				goSub :getBestSectorFromList
				#restore it, and grid them all
				setVar $bestSector $temp_$bestSector
				if ($newOptions > 0)
					goSub :goGridOtherOptions
				end
			end
		end
		if ($bestSector = 0)
			# found no ports we wanted, lets just go best warps
			goSub :getBestWarps
		end	
		if ($fillbubble = 1)
			goSub :goGridSingleDeadEnds
		end
	else
	# goSub :goGridSingleDeadEnds
	
		goSub :getBestWarps
		if ($fillbubble = 1)
			goSub :goGridSingleDeadEnds
		end
	end

	if ($bestSector = 0)
		#means we didn't find a new sector to go to

if ($debug = 1)
	echo "DEBUG: No Best Sector - Trying Twarp Options*"
end
		setVar $twarpOptionSuccess 0
		goSub :useTwarpOption
		if ($twarpOptionSuccess = 1)
			if ($debug = 1)
				echo "DEBUG: Found a TWARP options*"
			end

		else

			goSub :checkOptions
			if ($safeOptionsBack = 0)
				setVar $SWITCHBOARD~message "Currently No safe path back - if have TWARP then we could move else where using DB *"
				gosub :SWITCHBOARD~switchboard 
				halt
			else
				
				setVar $chkSec $PLAYER~CURRENT_SECTOR
				setVar $adjSec $safeOptionsBackDirect
				goSub :checkAdj
				if (($moveTwarp = 1) and ($isAdj = 0))
					:jumpagain
					setVar $player~warpto $safeOptionsBackDirect
					gosub :player~twarp
					gosub :player~quikstats
					if ($player~twarpSuccess = TRUE)
	if ($debug = 1)
		echo "DEBUG: $safeOptionsBackDirect TWARP Success *"
	end	
						setVar $twarpRemoveSector $safeOptionsBackDirect
						goSub :removeTwarpOption

						add $stat_moves 1
						setVar $toStackSector $safeOptionsBackDirect
						goSub :moveStackToOption
					else
	if ($debug = 1)
		echo "DEBUG: $safeOptionsBackDirect TWARP fail *"
	end	
						setVar $pathi 1
						setVar $c_pathBacki $pathBacki
						while ($pathi <= $c_pathBacki)
							
							setVar $stackSector $pathBack[1]
							goSub :popPath 
							getSectorParameter $stackSector "FIGSEC" $hasFig
							if ($hasFig = "")
								setVar $hasFig 0
							end
							if ($hasFig = 1)

								setVar $adjSec $stackSector
								goSub :checkAdj
								if ($isAdj = 0)
									setVar $SWITCHBOARD~message "Next Sector on walk back was not adjacent.. halting*"
									gosub :SWITCHBOARD~switchboard
									halt
								end
								add $stat_moves 1
								add $stat_retreats 1
								setVar $PLAYER~moveIntoSector $stackSector
								gosub :PLAYER~moveIntoSector
	if ($debug = 1)
		echo "DEBUG: Moving into sector as walking back *"
	end	
								setVar $twarpRemoveSector $stackSector
								goSub :removeTwarpOption
						
								gosub :player~quikstats
								
								if (PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = 0) AND (PORT.EXISTS[CURRENTSECTOR] = TRUE)
	if ($debug = 1)
		echo "DEBUG: Grabbing Fuel and attempting direct route *"
	end	

									send "jy"
									send "p t *  *  "
									gosub :player~quikstats	
									goto :jumpagain
								else
									goSub :checkPassingTrading
								end
								
								
			
							else
								setVar $SWITCHBOARD~message "Paths blocked finding a safe sector.*"
								gosub :SWITCHBOARD~switchboard
								halt
							end

							if ($stackSector = $safeOptionsBackDirect)
								setVar $pathi 30001
								return
							end
							add $pathi 1
						end
					end
				else				
					setVar $pathi 1
					setVar $c_pathBacki $pathBacki
					while ($pathi <= $c_pathBacki)
						
						setVar $stackSector $pathBack[1]
						goSub :popPath 
						getSectorParameter $stackSector "FIGSEC" $hasFig
						if ($hasFig = "")
							setVar $hasFig 0
						end
						if ($hasFig = 1)
							setVar $adjSec $stackSector
							goSub :checkAdj
							if ($isAdj = 0)
								setVar $SWITCHBOARD~message "Next Sector on walk back was not adjacent.. halting*"
								gosub :SWITCHBOARD~switchboard
								halt
							end
							add $stat_moves 1
							add $stat_retreats 1
							setVar $PLAYER~moveIntoSector $stackSector
							gosub :PLAYER~moveIntoSector
							setVar $twarpRemoveSector $stackSector
							goSub :removeTwarpOption
							gosub :player~quikstats
							goSub :checkPassingTrading
		
						else
							setVar $SWITCHBOARD~message "Paths blocked finding a safe sector.*"
							gosub :SWITCHBOARD~switchboard
							halt
						end

						if ($stackSector = $safeOptionsBackDirect)
							setVar $pathi 30001
							return
						end
						add $pathi 1
					end
				end
			end



		end
	
		 
	else
		# log warps back
	end

return

:goGridSingleDeadEnds
	if ($debug = 1)
		echo "DEBUG: 	:goGridSingleDeadEnds*"
	end	
	setVar $returnSector $PLAYER~CURRENT_SECTOR
	setVar $dei 1
	while ($dei <= $safeSectors)
		if ($safes[$dei] <> $bestSector)
			if ($warpCount[$safes[$dei]] = 1)
				setVar $doReturn 0

				if (SECTOR.WARPS[$safes[$dei]][1] = $returnSector)
					echo "DEBUG: 	:goGridSingleDeadEnds   Sector is adjacent from TWX DB*"
					setVar $doReturn 1
				else
					send "cf" $safes[$dei] "*" $returnSector "*q"
					waitfor "t is the destination sect"
					setTextLineTrigger checkReturnSuccess :checkReturnSuccess "he shortest path"
					setTextLineTrigger checkReturnFail :checkReturnFail "No route within"
					pause
					:pathbad
						killalltriggers
						send "yq"
						goto :goGridSingleNext
					:checkReturnSuccess
						killalltriggers
						getWord CURRENTLINE $deDist 4
						striptext $deDist "("
						if ($deDist = 1)
							setVar $doReturn 1
						end
				end
				if ($doReturn = 1)
					setVar $PLAYER~moveIntoSector $safes[$dei] 
					gosub :PLAYER~moveIntoSector
					setSectorParameter  $safes[$dei] "FIGSEC" TRUE
					setVar $twarpRemoveSector $safes[$dei] 
					goSub :removeTwarpOption
					gosub :player~quikstats
					send "sd"
					goSub :checkPassingTrading
					add $stat_moves 1
					add $stat_figsdown 1		
					setVar $PLAYER~moveIntoSector $returnSector 
					gosub :PLAYER~moveIntoSector
					gosub :player~quikstats
					add $stat_moves 1
				end
			end
			
		end
		:goGridSingleNext
		add $dei 1
	end
	
return

:goGridOtherOptions
if ($debug = 1)
	echo "DEBUG: 	:goGridOtherOptions*"
end	
	setVar $returnSector $PLAYER~CURRENT_SECTOR

	if ($moveTwarp = 11) 
		# STORE OTHER OPTIONS HERE ? Undecided
		# do we still want to do this as we are using the stack and already pushing
	else

		setVar $i 1
		while ($i <= $newOptions)
			if ($newi[$i] <> $bestSector)

				setVar $PLAYER~moveIntoSector $newi[$i] 
				gosub :PLAYER~moveIntoSector
				setSectorParameter  $newi[$i] "FIGSEC" TRUE
				setVar $twarpRemoveSector $newi[$i] 
				goSub :removeTwarpOption

				#gosub :player~quikstats
				send "sd"
				goSub :checkPassingTrading
				add $stat_moves 1
				add $stat_figsdown 1		
				setVar $PLAYER~moveIntoSector $returnSector 
				gosub :PLAYER~moveIntoSector
				#gosub :player~quikstats
				add $stat_moves 1
			end
			add $i 1
		end
	
	end
return

:checkAdj
	setVar $isAdj 0
	setVar $cc 1
	while ($cc <= SECTOR.WARPCOUNT[$chkSec])
		if (SECTOR.WARPS[$chkSec][$cc] = $adjSec)

			setVar $isAdj 1
			return
		end
		add $cc 1
	end

return

:getBestSectorFromList
if ($debug = 1)
	echo "DEBUG: 	:getBestSectorFromList*"
end	
	# takes array of chkOption Sectors - picks the one with most warps
	# Checks it isn't one way - Assuming we aren't using "fill sector" 
	#         - Need to add in option for "no plotting", as in v1 we don't plot
	#           as it ruins speed.
	
	setVar $newOptions 0
	setVar $newi 0

	setVar $i 1
	while ($i <= $chkOptioni)
		setVar $chkSec $chkOption[$i]
		setVar $adjSec $PLAYER~CURRENT_SECTOR
		goSub :checkAdj
		if (($isAdj = 1) or ($fillbubble = 1))
			add $newOptions 1
			setVar $newi[$newOptions] $chkSec
		else
		end
		add $i 1
	end

	if ($newOptions > 0)
		# select best
		setVar $denCount 0
		setVar $bestSector 0
		setVar $i 1
		while ($i <= $newOptions)
			if ($warpCount[$newi[$i]] > $denCount)
				setVar $bestSector $newi[$i]
				setVar $denCount $warpCount[$newi[$i]]
			end
			add $i 1
		end
	end

return


:getBestWarps
if ($debug = 1)
	echo "DEBUG: 	:getBestWarps*"
end	
	setVar $i 1
	setVar $denCount 0
	setVar $bestSector 0
	while ($i <= $safeSectors)
		if ($warpCount[$safes[$i]] > $denCount)
			setVar $bestSector $safes[$i]
			setVar $denCount $warpCount[$safes[$i]]
		end
		add $i 1
	end

return


:checkTrade
if ($debug = 1)
	echo "DEBUG: 	:checkTrade*"
end		
	# $pptTradingOption
	#  "all" all pairs  (which still excludes fuel<>org
	#  "org" all Org-Equ
	#  "buys" org - equip not selling ore
	#  "none"  skip this step
#	echo "$pptTradingOption: " $pptTradingOption "*"
	setVar $trades 0
	setVar $tradesi 0
	setVar $tradestype 0

	if (($pptTradingOption <> "none") and (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = 1))

		# get neighbours with a potenial trading port that warp back
		setVar $cport PORT.CLASS[$PLAYER~CURRENT_SECTOR]
		setVar $i 1
		while ($i <= $deni)
			setVar $danger 0
			setVar $dSector $nSector[$i]
			setVar $dIndex $i
			
			goSub :checkDanger

			if ((PORT.EXISTS[$nSector[$i]]) and ($danger = 0))
				setVar $nport PORT.CLASS[$nSector[$i]]
				setVar $chkSec $nSector[$i]
				setVar $adjSec $PLAYER~CURRENT_SECTOR
				goSub :checkAdj
				if ($isAdj = 1)
					# all - i.e. 1 to 6
					if (($pptTradingOption = "all") and ($nport > 0) and ($nport < 7))
						goSub :isAllPair
						if ($portCanTrade = 1)
							add $tradesi 1
							setVar $trades[$tradesi] $chkSec
							setVar $tradestype[$tradesi] $tradingType
						end 
					elseif (($pptTradingOption = "org") and (($nport = 1) or ($nport = 2) or ($nport = 4) or ($nport = 5)))
						goSub :isOrgEPair
						if ($portCanTrade = 1)
							add $tradesi 1
							setVar $trades[$tradesi] $chkSec
							setVar $tradestype[$tradesi] $tradingType
						end 
					elseif (($pptTradingOption = "buys") and (($nport = 1) or ($nport = 2)))
						goSub :isBuysPair
						if ($portCanTrade = 1)
							add $tradesi 1
							setVar $trades[$tradesi] $chkSec
							setVar $tradestype[$tradesi] $tradingType
						end 
					end
				end

			end
			
			add $i 1
		end
		
		if ($tradesi > 0)
			 
			if ($tradesi > 1)
				setVar $i 1
				while ($i <= $tradesi)
					send "cr" $trades[$i] "*q"
					waitfor "Computer deactivated>"
					add $i 1
				end


				setVar $maxe 0
				setVar $tradePort 0
				setVar $i 1
				
				while ($i <= $tradesi)
					if (PORT.EQUIP[$trades[$i]] > $maxe)
						setVAr $maxe PORT.EQUIP[$trades[$i]]
						setVar $tradePort $trades[$i]
					end
					add $i 1
				end
			else
				setVar $tradePort $trades[1]
			end

			
			setVar $originSector $PLAYER~CURRENT_SECTOR
			setVar $prepptc $player~credits

			setVar $BOT~command "ppt"
			setVar $BOT~user_command_line $tradePort & " " & $haggle &" p:50 k:10"
			setVar $BOT~parm1 $tradePort
			setVar $BOT~parm2 $haggle
			setVar $BOT~parm3 "p:50"
			setVar $BOT~parm4 "k:10"

			saveVar $BOT~parm1
			saveVar $BOT~parm2
			saveVar $BOT~parm3
			saveVar $BOT~parm4

			saveVar $BOT~command
			saveVar $BOT~user_command_line
	
			load "scripts\"&$bot~mombot_directory&"\commands\cashing\ppt.cts"
			:backpptwait
			setTextLineTrigger        pptPauseForCash        :pptPauseForCash "[atm:" & $SWITCHBOARD~BOT_NAME & "]"
			setTextLineTrigger        pptMove        :pptMove "<Move>"
			setEventTrigger        pptended        :pptended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\cashing\ppt.cts"
			pause
			:pptPauseForCash
				killalltriggers
				setVar $cashPause 1
				send "'[atm:ack] Will pause at next SXB post trading.*"
				goto :backpptwait
			:pptMove
				killalltriggers
				add $stat_moves 1
				goto :backpptwait
			:pptended
				killalltriggers
			gosub :player~quikstats
			setVar $stat_dollarsppt ($stat_dollarsppt + ($player~credits - $prepptc))

			add $stat_ppts_done 1
			add $stat_figsdown 1
			setSectorParameter $tradePort "FIGSEC" TRUE
			
			if ($originSector <> $PLAYER~CURRENT_SECTOR)
				# Finished up next door, return
				
				return
			end
		else
			#echo "No Trade*"
			
		end
		
	
	end
	if (($tradesi = 0) and (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = 1))
# Can we be more selective here?
# maybe XXBs and those with a decent trade for cash?

		goSub :checkSingleTrading
		
	end

return

:doSingleTrade
if ($debug = 1)
	echo "DEBUG: 	:doSingleTrade*"
end			
	
	if (($testMcicBuy = 0) and ($testMcicSell = 0))
		setVar $keepquant 0
	else
		if ($pptTradingOption = "none")
			setVar $keepquant 15
		else
			setVar $keepquant 5
		end
	end

	setVar $pretradec $player~credits
	setVar $BOT~command "trade"
	setVar $BOT~parm1 $keepquant
	setVar $BOT~parm2 ""
	if ($haggle = "h")
		setVar $BOT~parm2 "int"
	elseif ($haggle = "n")
		setVar $BOT~parm2 "nohag"
	end
	
	setVar $BOT~user_command_line $keepquant & " " & $BOT~parm2
	saveVar $BOT~parm1
	saveVar $BOT~parm2
	
	
	if ($avoidSectorTest = 1)
		setVar $avoidSectorTest  0
		setVar $BOT~parm3 "silent"
		saveVar $BOT~parm3
		setVar $BOT~user_command_line $BOT~user_command_line & " " & $BOT~parm3
	else
		setVar $BOT~parm3 "aoverride"
		saveVar $BOT~parm3
		setVar $BOT~parm4 "silent"
		saveVar $BOT~parm4
		setVar $BOT~user_command_line $BOT~user_command_line & " " & $BOT~parm3 & " " & $BOT~parm4
	end
	

	saveVar $BOT~command
	saveVar $BOT~user_command_line
	load "scripts\"&$bot~mombot_directory&"\commands\cashing\trade.cts"
	:backtradewait
	setTextLineTrigger        tradePauseForCash        :tradePauseForCash "[atm:" & $SWITCHBOARD~BOT_NAME & "]"
	setEventTrigger        tradeended        :tradeended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\cashing\trade.cts"
	pause
	:tradePauseForCash
		killalltriggers
		setVar $cashPause 1
		send "'[atm:ack] Will pause at next SXB post trading.*"
		goto :backtradewait
	:tradeended
		killalltriggers

	setVar $BOT~user_command_line "ss"
	saveVar $BOT~user_command_line
	setVar $BOT~parm1 "ss"
	saveVar $BOT~parm1

	setVar $BOT~parm2 ""
	setVar $BOT~parm3 ""
	setVar $BOT~parm4 ""
	saveVar $BOT~parm2
	saveVar $BOT~parm3
	saveVar $BOT~parm4
	setvar $BOT~silent_running 0
	saveVar $BOT~silent_running
	add $stat_trades 1
	gosub :player~quikstats

	setVar $stat_dollarstrade ($stat_dollarstrade + ($player~credits - $pretradec))
	
return

:isAllPair
	# Any port combo returns a postitve
	setVar $portCanTrade 0
	if ((($cport = 1) or ($cport = 5)) and (($nport = 2) or ($nport = 4)))
		setVar $portCanTrade 1
		setVar $tradingType 1
	elseif ((($cport = 2) or ($cport = 4)) and (($nport = 1) or ($nport = 5)))
		setVar $portCanTrade 1
		setVar $tradingType 1
	elseif ((($cport = 3) or ($cport = 4)) and (($nport = 1) or ($nport = 6)))
		setVar $portCanTrade 1
		setVar $tradingType 2
	elseif ((($cport = 1) or ($cport = 6)) and (($nport = 3) or ($nport = 4)))
		setVar $portCanTrade 1
		setVar $tradingType 2
	end

return


:isOrgEPair
	# Any port combo returns a postitve
	setVar $portCanTrade 0

	if (($cport = 1) or ($cport = 5))
		if (($nport = 2) or ($nport = 4))
			setVar $portCanTrade 1
			setVar $tradingType 1
		end
	elseif (($cport = 2) or ($cport = 4))
		if (($nport = 1) or ($nport = 5))
			setVar $portCanTrade 1
			setVar $tradingType 1
		end
	end

return


:isBuysPair
	# Any port combo returns a postitve
	setVar $portCanTrade 0

	if ($cport = 1)
		if ($nport = 2)
			setVar $portCanTrade 1
			setVar $tradingType 1
		end
	elseif ($cport = 2)
		if ($nport = 1)
			setVar $portCanTrade 1
			setVar $tradingType 1
		end
	end

return

:checkPassingTrading
	if ($fillbubble = 1)
		setSectorParameter CURRENTSECTOR "WHICHBUB" $whichBubble
	end
	if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = 0)
		return
	end
if ($debug = 1)
	echo "DEBUG: 	:checkPassingTrading*"
end	
	if ($fillbubble = 1)
		goSub :checkBubbleTrade
	else
		# for sectors we've explored/tested MCIC - do we want to trade
		if ($singleTrades = 1)
			setVar $doQuickTrade 0

			if (($player~ORE_HOLDS > 40) and (PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = 1))
				setVar $doQuickTrade 1
			elseif (($player~ORGANIC_HOLDS > 40) and (PORT.BUYORG[$PLAYER~CURRENT_SECTOR] = 1))
				setVar $doQuickTrade 1
			elseif (($player~EQUIPMENT_HOLDS > 40) and (PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR] = 1))
				setVar $doQuickTrade 1
			end
			if ($doQuickTrade = 1)
				goSub :doSingleTrade
			end
		end
	end
	
	
return

:checkSingleTrading

	
if ($debug = 1)
	echo "DEBUG: 	:checkSingleTrading*"
end	
	if ($fillbubble = 1)
		goSub :checkBubbleTrade
	else
		setVar $doQuickTrade 0
		setVar $empty_holds ($PLAYER~TOTAL_HOLDS - ($player~ORE_HOLDS + $player~ORGANIC_HOLDS + $player~EQUIPMENT_HOLDS + $PLAYER~COLONIST_HOLDS))

		if ($singleTrades = 1)
			setVar $doQuickTrade 0

			if (($player~ORE_HOLDS > 40) and (PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = 1))
				setVar $doQuickTrade 1
			elseif (($player~ORGANIC_HOLDS > 40) and (PORT.BUYORG[$PLAYER~CURRENT_SECTOR] = 1))
				setVar $doQuickTrade 1
			elseif (($player~EQUIPMENT_HOLDS > 40) and (PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR] = 1))
				setVar $doQuickTrade 1
			elseif (((PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = 0) or (PORT.BUYORG[$PLAYER~CURRENT_SECTOR] = 0) or (PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR] = 0)) and ($empty_holds > 10))
				setVar $doQuickTrade 1
			end
			
		end
		getSectorParameter $PLAYER~CURRENT_SECTOR "EQUIPMENTH" $doneMCIC
		if ($doneMCIC = "")
			setVar $doneMCIC 0
		end
	#echo "$singleTrades: " $singleTrades " $doneMCIC:" $doneMCIC " $testMcicBuy:" $testMcicBuy "PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR] : " PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR]  " $player~EQUIPMENT_HOLDS: " $player~EQUIPMENT_HOLDS "*"
		# if we haven't done MCIC, and it buys equip, and we are testing eqip, and we have at least one hold
		# TEST BUY PORT
		if (($doneMCIC = 0) and (PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR] = 1) and ($testMcicBuy = 1) and ($player~EQUIPMENT_HOLDS > 0))
			setVar $doQuickTrade 1
		end
		# TEST SELL PORT
		if (($doneMCIC = 0) and (PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR] = 0) and ($testMcicSell = 1) and ($empty_holds > 0))
			setVar $doQuickTrade 1
		end
		
		# OUT OF EQUIP BUY IT
		if (($testMcicBuy = 1) and (PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR] = 0) and ($player~EQUIPMENT_HOLDS < 2))
			setVar $doQuickTrade 1
		end
		
		# NEED TO FREE UP EQUIP
		if (($testMcicSell = 1) and (PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR] = 1) and ($empty_holds < 2) and ($player~EQUIPMENT_HOLDS > 0))
			setVar $doQuickTrade 1
		end
		
		if ($doQuickTrade = 1)
			goSub :doSingleTrade
		end
	end
return

:checkBubbleTrade

	if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = 0)
		return
	end

if ($debug = 1)
	echo "DEBUG: 	:checkBubbleTrade*"
end	
	getSectorParameter $PLAYER~CURRENT_SECTOR "EQUIPMENTH" $doneMCIC
	if ($doneMCIC = "")
		setVar $doneMCIC 0
	end

	#### Cmmenting out and trying trade mcicbuy
	if (1 = 2)
		
		setVar $empty_holds ($player~total_holds - ($player~ore_holds + $player~organic_holds + $player~equipment_holds + $player~colonist_holds))
	if ($debug = 1)
		echo "DEBUG: 	$doneMCIC : " $doneMCIC "*"
		echo "DEBUG: 	$PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR]  : " PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR]  "*"
		echo "DEBUG: 	$PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR]  : " PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR]  "*"
		echo "DEBUG: 	$empty_holds : " $empty_holds "*"
		echo "DEBUG: 	$player~ORE_HOLDS : " $player~ORE_HOLDS "*"
		echo "DEBUG: 	$player~EQUIPMENT_HOLDS : " $player~EQUIPMENT_HOLDS "*"
		echo "DEBUG: 	$testMcicBuy : " $testMcicBuy "*"
		echo "DEBUG: 	$doneMCIC : " $doneMCIC "*"
	end	

		if ($testMcicBuy = 1)
			if ($player~equipment_holds = 0)
				if ($debug = 1)
					echo "DEBUG: 	No equipment attempting to buy if a SXS*"
				end
				if (PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR] = 0)

					if (($empty_holds < 30) and (PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = 0))
						send "jy "
						setVar $fuel_buy ($player~total_holds - 50)
						send "p t " $fuel_buy "* * "
						if (PORT.BUYORG[$PLAYER~CURRENT_SECTOR] = 0)
							send "0*"
						end
						send "25* * "
					end

				end
				return
			end
		end
		#first check we have some equipemnt and/or empty holds - we need to make sure we have say 30 holds for equipment sells/buys
		#the rest should be ore

		# TEST BUY PORT
		setVar $doQuickTrade 0
		if (($doneMCIC = 0) and (PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR] = 1) and ($testMcicBuy = 1) and ($player~EQUIPMENT_HOLDS > 0))
			setVar $doQuickTrade 1
		end
		# OUT OF EQUIP BUY IT
		if (($testMcicBuy = 1) and (PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR] = 0) and ($player~EQUIPMENT_HOLDS < 10) and ($player~EMPTY_HOLDS > 9))
			setVar $doQuickTrade 1
		end

		if ((PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = 0) and ($empty_holds > 90))
			if ($testMcicBuy = 0)
				send "j y p t * * 0* 0*"
				gosub :player~quikstats
				return
			else
				setVar $doQuickTrade 1
			end
		end
	else
		setVar $doQuickTrade 1
	end
 
	if ($doQuickTrade = 1)
		# keeping fuel topped up and testing equipment
		setVar $keepquant ($player~equipment_holds - 5)
		setVar $BOT~command "trade"
		setVar $BOT~user_command_line " mcicbuy"
		setVar $BOT~parm1 "mcicbuy"
		
		
		saveVar $BOT~parm1
	
		
		if ($avoidSectorTest = 1)
			setVar $avoidSectorTest  0
			setVar $BOT~parm2 "silent"
			saveVar $BOT~parm2
			setVar $BOT~user_command_line $BOT~user_command_line & " " & $BOT~parm2
		else
			setVar $BOT~parm2 "aoverride"
			saveVar $BOT~parm2
			setVar $BOT~parm3 "silent"
			saveVar $BOT~parm3
			setVar $BOT~user_command_line $BOT~user_command_line & " " & $BOT~parm2 & " " & $BOT~parm3
		end
		
		saveVar $BOT~command
		saveVar $BOT~user_command_line
		load "scripts\"&$bot~mombot_directory&"\commands\cashing\trade.cts"
		
		setEventTrigger        tradeended2        :tradeended2 "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\cashing\trade.cts"
		pause
		
		:tradeended2
			killalltriggers
			gosub :player~quikstats

		setVar $BOT~user_command_line "ss"
		saveVar $BOT~user_command_line
		setVar $BOT~parm1 "ss"
		saveVar $BOT~parm1
		
		setVar $BOT~parm2 ""
		setVar $BOT~parm3 ""
		setVar $BOT~parm4 ""
		saveVar $BOT~parm2
		saveVar $BOT~parm3
		saveVar $BOT~parm4
		setvar $BOT~silent_running 0
		saveVar $BOT~silent_running
	end
		
return

:restock

	
	gosub :player~quikstats
	setVar $prestockcredits $player~credits
	stripText $precredits ","

	gosub :restockself

	gosub :player~quikstats
	setVar $poststockcredits $player~credits
	stripText $poststockcredits ","
	setVar $stat_dollarstrade ($precredits - $poststockcredits)
	

return



:restockself
	add $stat_refurbs 1
	send "d"
	setVar $returnSpot $PLAYER~CURRENT_SECTOR
	
	setVar $restockMakePlanet 0
	if ($useGuard = true)
		
		setVar $planetFound 0
		goSub :checkCorpPlanet
		if ($planetFound = 0)
			setVar $restockMakePlanet 1
		else
			setVar $restockMakePlanet 0
		end

	end

	if ($corpCashDump = TRUE)

		setVar $doDockCashDump FALSE
		if ($PLAYER~CREDITS > 1100000)
			setVar $corpNotAtDock TRUE
			gosub :checkCorpAtDock
			if ($corpNotAtDock = FALSE)
				setVar $doDockCashDump TRUE
			end

		end
	end 
	send "m" $stardock "*y"
	waitfor "Locating beam pinpointed, TransWarp"
	send "y  "
	
	send "p   sh"
	
		send "a"
		setTextTrigger shipCheckBuyAtomics :shipCheckBuyAtomics "How many Atomic Detonators do you want"
		pause
		:shipCheckBuyAtomics
			killalltriggers
			getWord CURRENTLINE $AtomicssAvail 9
			stripText $AtomicssAvail ")"
			if ($AtomicssAvail = 0)
				#waitfor "next@"
				send "*"
			else
				send  "*a" $AtomicssAvail "*"
			end
			

		send "t"
		setTextTrigger shipCheckBuyTorps :shipCheckBuyTorps "How many Genesis Torpedoes do you want"
		pause
		:shipCheckBuyTorps
			killalltriggers
			getWord CURRENTLINE $TorpssAvail 9
			stripText $TorpssAvail ")"
			if ($TorpssAvail = 0)
				waitfor "next@"
			end
			send $TorpssAvail "*"
		
		
			gosub :player~quikstats
			send "qsp"

			setTextTrigger refurbFigPricet :refurbFigPricet "credits per fighter"
			:checkShields
			setTextTrigger refurbShields :refurbShields "Shield Points"
			pause
			:refurbFigPricet
				killalltriggers
				if ($furbfigs = TRUE)
					getWord CURRENTLINE $figPrice 4
					getWord CURRENTLINE $canBuy 8
					setVar $figsToBuy $player~credits
					subtract $figsToBuy 250000
					divide $figsToBuy $figPrice
					
					if ($figsToBuy > $canBuy)
						setVar $figsToBuy $canBuy
					end
					send "b" $figsToBuy "*"
				end
				goto :checkShields
			:refurbShields
				killalltriggers
				getWord CURRENTLINE $shieldPrice 5
				getWord CURRENTLINE $canBuy 9
				setVar $shieldsToBuy $player~credits
				subtract $shieldsToBuy 250000
				divide $shieldsToBuy $shieldPrice
				
				if ($shieldsToBuy > $canBuy)
					setVar $shieldsToBuy $canBuy
				end
				send "c" $shieldsToBuy "*"
			
			
	
	if ($corpCashDump = TRUE)

		if ($doDockCashDump = TRUE)
			goSUb :player~quikstats
			if ($PLAYER~CREDITS > 1100000)
				setVar $dumpcash ($PLAYER~CREDITS - 150000)
			else
				setVar $doDockCashDump FALSE
			end
		end
	end

	#send "qspb5000*c3000*q"
	send "qqq    *   "
	if ($restockMakePlanet = 1)
		send "u   y  n  .  n  *  c * *  "
	end
	
	if ($corpCashDump = TRUE)
		if ($doDockCashDump = TRUE)
			send "t  c  y  q   z   t" $dumpcash "*  *  *  "
		end
	end
	send "m  " $returnSpot  "*   y   y  "
	setTextLineTrigger restockBack1 :restockBack1 "<Set NavPoint>"
	setTextLineTrigger restockBack2 :restockBack2  "Systems Ready, shall we engag"
	pause
		:restockBack1
			killalltriggers
			send "q * q * * pss"
			setVar $SWITCHBOARD~message "Failed to leave dock!! Hopefully on dock..*"
			gosub :SWITCHBOARD~switchboard
			halt	

		:restockBack2
			killalltriggers
	
return



######################################## END TRADE ROUTINES




:setVoidSectors

	clearAllAvoids
	# we don't really want to sit outside of SD.

	setVar $explored[$stardock] 1
	setVar $a 1
	while ($a <= SECTOR.WARPCOUNT[$stardock])
		# Avoids warps out of StarDock
		setVar $explored[SECTOR.WARPS[$stardock][$a]] 1
		setAvoid SECTOR.WARPS[$stardock][$a]
		add $a 1
	end

	setVar $doMini 0
	setVar $i 2
	while ($i < 11)
		if (SECTOR.WARPCOUNT[$i] = 0)
			setVar $doMini 1
		end
		add $i 1
	end
	if ($doMini = 1)
		goSub :doMini
	end

	setVar $i 2
	while ($i < 11)
		setVar $a 1
		while ($a <= SECTOR.WARPCOUNT[$i])
			setVar $explored[SECTOR.WARPS[$i][$a]] 1
			setAvoid SECTOR.WARPS[$i][$a]
			add $a 1
		end
		add $i 1
	end

return


:doMini
	# we just want to check we have all warps out of fed
	send "c"
	setVar $i 10
	while ($i > 1)
		send "f" $i "*1*"
		subtract $i 1
	end
	
	send "/"
	waitfor "Shlds"

	setVar $plot 1
	while ($plot = 1)
		
		send "f1*" $stardock "*"
		setTextLineTrigger pathgood :pathgood "he shortest path"
		setTextLineTrigger pathbad :pathbad "No route within"
		pause
		:pathbad
			killalltriggers
			send "yq"
			setVar $plot 0
			goto :endplot
		:pathgood
			killalltriggers
			waitfor ">"
			getWord CURRENTLINE $sec1 3 
			getWord CURRENTLINE $sec2 5 
			getWord CURRENTLINE $sec3 7 
			stripText $sec1 "("
			stripText $sec2 "("
			stripText $sec3 "("
		
			stripText $sec1 ")"
			stripText $sec2 ")"
			stripText $sec3 ")"

			if ($sec1 > 10)
				setVar $voidS $sec1
			elseif ($sec2 > 10)
				setVar $voidS $sec2
			elseif ($sec3 > 10)
				setVar $voidS $sec3
			end
			send "v" $voidS "*"
			waitfor "future navigation calc"
			
		

		:endplot
	end


:subreport

	setVar $stuff ""
	gosub :calcStats
	setvar $switchboard~message $stuff & "**"
	gosub :switchboard~switchboard
return

:updateStats

	setVar $stuff ""
	gosub :calcStats

	setWindowContents dora $stuff
	add $updateCount 1
	if ($updateCount > 20)
		setVar $updateCount 1
		send "'Dora Update - Figs: " $stat_figsdown " Turns: " $stat_turnsUsed "*"
	end
return

:calcStats

	setVar $stat_dollarsnet ($stat_dollarsppt + $stat_dollarstrade)
	
	setVar $stat_turnsUsed ($startturns - $player~turns)

	setvar $stuff "Turns Used: " & $stat_turnsUsed & "*Figs Down: " & $stat_figsdown & "*Ports Traded: " & $stat_trades  & "*Pairs Traded: " & $stat_ppts_done  & "*Moves Made: " & $stat_moves& "*Backtracks Made: " & $stat_retreats
	
	setvar $stuff $stuff & "*Cash Pairs:" & $stat_dollarsppt & "*Cash Trades:" & $stat_dollarstrade & "*Total Cash:" & $stat_dollarsnet & "*Refurbs: " & $stat_refurbs
return

:checkDanger
	
	# Remove all known items and then compare	
	setVar $compareDensity $nDensity[$dIndex]
	if (PORT.EXISTS[$dSector])
		subtract $compareDensity 100
	end
	getSectorParameter $dSector "FIGSEC" $hasFig
	if ($hasFig = "")
		setVar $hasFig 0
	end
	if ($hasFig = 1)
		if (SECTOR.FIGS.OWNER[$dSector] = "belong to your Corp")
			subtract $compareDensity (SECTOR.FIGS.QUANTITY[$dSector] * 5)
		end
	end

	if ($allLimps[$dSector] > 0)
		subtract $compareDensity (2 * $allLimps[$dSector])
		setVar $nAnom[$dIndex] 0
	end

	if ($allArmids[$dSector] > 0)
		subtract $compareDensity (10 * $allArmids[$dSector])
	end


	if ($compareDensity = 0)
		setVar $danger 0
	else
		if ($dSector < 11)
			setVar $danger 0
			#echo "* ## Fed Safe so OK: " $dSector
		else
			#echo "* ## Odd Density - Avoiding: " $dSector
			setVar $danger 1
		end
	end
	

	if ($danger = 1)

		#echo "*#####################################################"
		#echo "*# Sector " $nDensity[$dIndex] " shows danger *"
		#echo "*#####################################################"
		
		write $dangerousSectorLogFile $dSector & " N:" & $PLAYER~CURRENT_SECTOR & " D: " & $nDensity[$dIndex] & " A: " & $nAnom[$dIndex]
		setVar $a 1
		while ($a <= SECTOR.WARPCOUNT[$PLAYER~CURRENT_SECTOR])
			
			if (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$a] = $dSector)
				write $dangerousSectorLogFile $holoData[$a]
			end
			add $a 1
		end
		
	end 
return




#############END NEXT SECTOR STUFF


########################### GRID NEXT SECTOR
:gridNextSector
if ($debug = 1)
	echo "DEBUG: 	:gridNextSector best sec:" $bestSector " kill: " $kill "*"
end	
	## We might not be using these - but remove it anyway

	setVar $twarpRemoveSector $bestSector
	goSub :removeTwarpOption
	if (($bestSector < 11) or ($bestSector = $stardock))
		send "m" $bestSector "**"
		add $stat_moves 1
	else
		setVar $origin $PLAYER~CURRENT_SECTOR

		setVar $PLAYER~moveIntoSector $bestSector
		gosub :PLAYER~moveIntoSector
		setSectorParameter $bestSector "FIGSEC" TRUE
		if ($kill = true)
			gosub :sector~getAutoSectorData
			if (($sector~realTraderCount > ($sector~corpieCount + $sector~defenderShips)))
				gosub :combat~fastattack
			end
			
		else
			waitfor "Warps to S"
			waitfor "Command ["		
		end
		
		#gosub :player~quikstats
	
		setVar $chkSec $PLAYER~CURRENT_SECTOR
		setVar $adjSec $origin
		goSub :checkAdj
		if ($isAdj = 1)
			setVar $stackSector $origin
			goSub :pushPath
			
		else
		# check adj relies on "plotting", we aren't plotting, so check this AFTER we arrive
			# We just went through a one way - reset path back
			setArray $pathBack $maxPathBack
			setVar $pathBacki 0
			setArray $pathBackHasOptions $maxPathBack
			echo "WENT THROUGH A ONE WAY -PATH BACK EMPTED*"
			echo "Have had issues, leaving to highlight for debugging*"
			if ($fillbubble = 1)
				# we are doing fill area - so let's see if we can plot a course back to door
				send "cf*" $fillBubbleInt "*q"
				waitfor "What is the starting secto"
				setTextLineTrigger fillPlotChkBad :fillPlotChkBad "No route within "
				setTextLineTrigger fillPlotChkGood :fillPlotChkGood "he shortest path"
				pause
				:fillPlotChkBad 
					send "nq"
					# lets get back in
					echo "*We have exited the bubble.. Attempting to Twarp Back in"
					goSub :useTwarpOption
					if ($twarpOptionSuccess = 0)
						setVar $SWITCHBOARD~message "We have left the bubble and I can't get back - Reposition and type - GO GO GO (nospaces).*"
						gosub :SWITCHBOARD~switchboard
						waitfor "GOGOGO"
					end
				:fillPlotChkGood
				killAllTriggers
				# ok, we good, continue

			

			end
		end
		add $stat_figsdown 1
		add $stat_moves 1
	end
	if (PORT.EXISTS[CURRENTSECTOR] = TRUE)
		if (PORT.BUYFUEL[CURRENTSECTOR] = 0)
			if (($pptTradingOption = "none") and ($testMcicBuy = 0))
				if ($player~ORE_HOLDS < 100)
					send "jy p t * * 0* 0* "
				end
			end
		end
	end
return

#
############# PATH Stack

:moveStackToOption
	# if we twarp back to a spot on the path
	# we should trim stack to there 
	# Takes - $toStackSector
	
	setVar $movei 1
	while ($movei <= $pathBacki)
		
		setVar $stackSector $pathBack[$movei]
		goSub :popPath 
		if ($pathBack[$movei] = $toStackSector)
			setVar $movei 30001
			return
		end
		add $movei 1
	end

return

:checkOptions
	setVar $safeOptionsBack 0
	setVar $safeOptionsBackDirect 0
	setVar $ii 1

	while ($ii <= $pathBacki)
		if ($pathBackHasOptions[$ii] = 1)
if ($debug = 1)
	echo "DEBUG: checkOptions    SafeOptions BackDirect: "  $pathBack[$ii] "*"
end
			setVar $safeOptionsBackDirect $pathBack[$ii]
			setVar $safeOptionsBack 1
			setVar $ii 30001
			return
		end
		add $ii 1
	end

return
:popPath
	goSub :printPath
	if ($pathBacki = 0)
		setVar $stackSector 0
		return
	else
		setVar $stackSector $pathBack[1]
		setVar $tempi 1
		while ($tempi < $pathBacki)
			setVar $tempy ($tempi + 1)
			setVar $pathBack[$tempi] $pathBack[$tempy]
			setVar $pathBackHasOptions[$tempi] $pathBackHasOptions[$tempy]
			add $tempi 1
		end
		setVar $pathBack[$pathBacki] 0
		setVar $pathBackHasOptions[$pathBacki] 0
		subtract $pathBacki 1
	end
	goSub :printPath
return

:pushPath

	#goSub :printPath

	if ($maxPathBack = $pathBacki)

		setVAr $tempi ($maxPathBack - 1)
		while ($tempi >= 1)
			# i.e. 50 = 49, then 49 = 48
			setVar $tempy ($tempi + 1)
			setVar $pathBack[$tempy] $pathBack[$tempi]
			setVar $pathBackHasOptions[$tempy] $pathBackHasOptions[$tempi]
			subtract $tempi 1
		end 
		setVar $pathBack[1] $stackSector
		# We are going to one of the safe sectors, so we need 2+ to have an option
		if ($safeSectors > 1)
			setVar $pathBackHasOptions[1] 1
		else
			setVar $pathBackHasOptions[1] 0
		end
	else
		setVAr $tempi $pathBacki
		while ($tempi >= 1)
			# i.e. 50 = 49, then 49 = 48
			setVar $tempy ($tempi + 1)
			setVar $pathBack[$tempy] $pathBack[$tempi]
			setVar $pathBackHasOptions[$tempy] $pathBackHasOptions[$tempi]
			subtract $tempi 1
		end 
		setVar $pathBack[1] $stackSector
		# We are going to one of the safe sectors, so we need 2+ to have an option
		if ($safeSectors > 1)
			setVar $pathBackHasOptions[1] 1
		else
			setVar $pathBackHasOptions[1] 0
		end
		add $pathBacki 1
	end
	#goSub :printPath

return
:printPath
	# JUST FOR DEBUGGING
	return
	echo "Printing Stack Size:" $pathBacki "/" $maxPathBack "*"
	setVar $tempi 1
	while ($tempi <= $maxPathBack)
		echo "  " $tempi ": " $pathBack[$tempi] " opt:" $pathBackHasOptions[$tempi] "*"
		add $tempi 1
	end

return
###### END PATH STac

:holoScan
	if ($debug = 1)
		echo "DEBUG: HoloScan*"
	end
if ($kill = true)
	setvar $before_holo_kill_sector $player~current_sector
	gosub :combat~holokill
	if (($sector~holotargetfound = true) and ($player~current_sector <> $before_holo_kill_sector))
		setVar $PLAYER~WARPTO $before_holo_kill_sector
		gosub :PLAYER~twarp
		if (($PLAYER~twarpSuccess = FALSE) and ($player~msg <> "Already in that sector!"))
			setvar $switchboard~message "Could not make it back to starting sector after holokill. - ["&$player~msg&"]*"
		end
	end
	if ($switchboard~message <> "No targets found adjacent.*")
		gosub :switchboard~switchboard
	end
else
	send "sh^q"
	waitfor "Long Range Scan"
	setVar $hIndex 1
	setVar $hData ""
#: ENDINTERROG
	:holoSectorStart
		setTextLineTrigger holoScanFirstSector :holoScanFirstSector "Sector  :"
		pause
		:holoScanFirstSector
			killtrigger holoScanFirstSector
			getWord CURRENTLINE $hSector 3
			setVar $hData "     " & CURRENTLINE

		
		:holoScanContinue
		setTextLineTrigger holoScanDetails :holoScanDetails ""
		pause
		:holoScanDetails

			killtrigger holoScanDetails
			getWord CURRENTLINE $firstword 1
			if ($firstword = "Command")
				return
			elseif ($firstword = "Sector")
				setVar $holoData[$hIndex] $hData
				add $hIndex 1
				setVar $hData "     " & CURRENTLINE
				goto :holoScanContinue
			else
				setVar $hData "     " & $hData & "*" & CURRENTLINE
				goto :holoScanContinue
			end
end

if ($debug = 1)
		echo "DEBUG: Exit HoloScan*"
	end
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



halt


:gotoDock
	send "y1*q"
	send "m" $stardock "*y"
	waitfor "All Systems Ready, shall we engage?"
	send "y"
	waitfor "TransWarp Drive Engaged!"
	send "ps"
	gosub :limpetCheck

return

:limpetCheck
		setTextTrigger limpetchecky :limpetchecky "A port official runs"
		setTextTrigger limpetcheckn :limpetcheckn "StarDock> Where to?"
		pause
		:limpetchecky
			killalltriggers
			send "y"
			return
		:limpetcheckn
			killalltriggers
			return

return

:topOffFuel
	# Pass in $totore
	if ($debug = 1)
		echo "DEBUG:    $topOffFuel*"
	end
	gosub :player~quikstats

	echo "totore: " $totore	
	if ($totore < $player~ORE_HOLDS)
		setVar $empty_holds ($player~total_holds - ($player~ore_holds + $player~organic_holds + $player~equipment_holds + $player~colonist_holds))
		setVar $required_ore ($totore - $player~ORE_HOLDS)
		if ($debug = 1)
			echo "DEBUG: $totore: " $totore "*"
			echo "DEBUG: $empty_holds: " $empty_holds "*"
			echo "DEBUG: $required_ore: " $required_ore "*"
			
		end
		if ($empty_holds < $required_ore)
			send "jy p t * * 0* 0* "
		else
			send "p t "

			if (PORT.BUYORG[CURRENTSECTOR] = 1) and ($player~organic_holds > 0)
				send "* * "
			end
			
			if (PORT.BUYEQUIP[CURRENTSECTOR] = 1) and ($player~equipment_holds > 0)
				if ($testMcicBuy = 1)
					send "0* "
				else
					send "* * "
				end
			end
			if ($testMcicBuy = 1)
				send $required_ore "* * 0* 0* "
			else
				send "* * 0* 0* "
			end
		end
	end
return

:functionDoTopOff
	send "cf*" $topoffSector "*"
	send "f" $topoffSector "*" $player~CURRENT_SECTOR "*q"
	setTextLineTrigger topOffCourse1 :topOffCourse1 "The shortest path "
	pause
	:topOffCourse1
		killAllTriggers
		getWord CURRENTLINE $dist1 4
		setTextLineTrigger topOffCourse2 :topOffCourse2 "The shortest path "
		pause
		:topOffCourse2
		killAllTriggers
		getWord CURRENTLINE $dist2 4
		stripText $dist1 "("
		stripText $dist2 "("
		setvar $totore (($dist1 + $dist2) * 3)
		gosub :player~quikstats

		goSub :topOffFuel
		
	setVar $returnSector $player~CURRENT_SECTOR
	setVar $player~warpto $topoffSector
	gosub :player~twarp
	if ($player~twarpSuccess = FALSE)
		setVar $SWITCHBOARD~message "Did not make it to top off sector... Halting*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	gosub :player~quikstats
	setVar $currentFigs $player~FIGHTERS

	gosub :player~topoff
	gosub :player~quikstats

	if ($player~FIGHTERS = $currentFigs)
		setVar $SWITCHBOARD~message "I didn't gain fighters while doing top off...  Halting.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	setVar $player~warpto $returnSector
	gosub :player~twarp
	if ($player~twarpSuccess = FALSE)
		setVar $SWITCHBOARD~message "Can't make it back from Top Off sector.. Halting.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	gosub :player~quikstats
	#if ($fillbubble = 1)
	#	send "p t * * 0* 0* "
	#else
		
	#	send " p t " $totore "* * 0* 0* "
		
	#end
return

:useTwarpOption
	if ($debug = 1)
		echo "DEBUG: useTwarpOption*"
	end

	setVar $twarpOptionSuccess 0
	gosub :player~quikstats
	goSub :getTwarpOption
	if ($twarpDest = 0)
		return
	end

	setVar $lowOre 0
	if ($player~ORE_HOLDS < 90)
		send "cf*" $twarpDest "*q"
		waitfor "at is the destination se"
		setTextLineTrigger utoGetDistance :utoGetDistance "The shortest path ("
		setTextLineTrigger utoNoDistance :utonoDistance  "No route within"
		pause
		:utonoDistance
			killAllTriggers
			send "nq"
			#just making a figure up as we can't plot
			setVar $oreNeeded 90
			goto :utoCalcOre
		:utoGetDistance
			killalltriggers
			getWord CURRENTLINE $hopDist 4
			striptext $hopDist "("
			setVar $oreNeeded ($hopDist * 3)
		:utoCalcOre
		if ($oreNeeded > $player~ore_holds)
			if (PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = 0) AND (PORT.EXISTS[CURRENTSECTOR] = TRUE)
				
				goSub :topOffFuel
				gosub :player~quikstats	
				setVar $lowOre 0
			else
				setVar $lowOre 1
			end
		end

	end

	if ($lowOre = 1)
		getNearestWarps $nearArray CURRENTSECTOR
		setVar $neari 1
		while ($neari <= $nearArray)
			setVar $focus $nearArray[$neari]
			if (PORT.BUYFUEL[$focus] = 0) AND (PORT.EXISTS[$focus] = TRUE)
				getCourse $courseToFuel CURRENTSECTOR $focus
				if ($courseToFuel < 1)

				else
					setVar $coursei 1
					setVar $courseSafe 1
					while ($coursei <= $courseToFuel)
						getSectorParameter $courseToFuel[$coursei] "FIGSEC" $hasFig
						if ($hasFig = 0)
							setVar $courseSafe 0
						end
						add $coursei 1
					end
					if ($courseSafe = 1)
						echo "**We can mow to :" $focus " safely to get fuel - testing*"

					end
				end
			end
			add $neari 1
		end
		echo "**########### NOT ENOUGH FUEL ######*"
		echo "* ### GEt Fuel, and type FUEL_GO! with no _ to continue*"
		waitfor "FUELGO!"
	end

	setVar $player~warpto $twarpDest
	gosub :player~twarp
	gosub :player~quikstats
	setVar $twarpRemoveSector $twarpDest

	if ($player~twarpSuccess = TRUE)
		add $stat_moves 1
		# Clear Stack of paths
		setArray $pathBack $maxPathBack
		setVar $pathBacki 0
		setArray $pathBackHasOptions $maxPathBack
		setVar $twarpOptionSuccess 1
	else

		setVar $SWITCHBOARD~message "Twarp to next safe destination failed - halting!*"
		gosub :SWITCHBOARD~switchboard 
		halt
	end

return
:storeTwarpOptions
	# Takes the $newi array of new options and stores them for later twarp
	setVar $i 1
	while ($i <= $newOptions)
		if ($newi[$i] <> $bestSector)
			setVar $twarpOrigin $PLAYER~CURRENT_SECTOR
			setVar $twarpAdj $newi[$i] 
		end
		add $i 1
	end
return


:getTwarpOption
	#	returns		$twarpDest  	-- place to land -- if 0, out of options
	#				$twarpDestAdj 
	setVar $twarpDest 0
	setVar $twarpDestAdj 0

	if ($debug = 1)
		echo "DEBUG:  getTwarpOption     $twarpOptioni: " $twarpOptioni "*"
	end

	if ($twarpOptioni = 0)
		# no options
		return
	end

	setVar $foundValid 0
	setVar $twarpChki $twarpOptioni
	while ($twarpChki > 0)
		if ($twarpOption[$twarpChki] = 0) and ($foundValid = 0)
			subtract $twarpOptioni 1
		end
		if ($twarpOption[$twarpChki] > 0)
			# really don't think $foundValid is required.. but..
			setVar $foundValid 1
			
			setVar $twarpDest $twarpOption[$twarpChki]
			setVar $twarpDestAdj $twarpOptionAdj[$twarpChki]
			if ($debug = 1)
				echo "DEBUG: Found an option twarpDest: " $twarpDestAdj " twarpDest " $twarpDestAdj "*"
			end
			# remove this as a option
			setVar $twarpOption[$twarpChki] 0
			setVar $twarpOptionAdj[$twarpChki] 0
			return
		end
		subtract $twarpChki 1
	end

return

:addTwarpOption
	# Takes 	$twarpOrigin  -- Where we'll land and probably currently are
	#			 $twarpAdj - Adjacent Sector we think is safe.
	
	if ($debug = 1)
		echo "DEBUG: :addTwarpOption    $twarpOrigin: #" $twarpOrigin "# $twarpAdj: #" $twarpAdj "#*" 
	end
	setVar $twarpOptionPresent 0
	goSub :chkExistsTwarpOption
	if ($twarpOptionPresent = 0)
		if ($debug = 1)
			echo "DEBUG: ADDED $twarpOrigin: " $twarpOrigin  " $twarpAdj : " $twarpAdj "*" 
		end
		add $twarpOptioni 1
		setVar $twarpOption[$twarpOptioni] $twarpOrigin
		setVar $twarpOptionAdj[$twarpOptioni] $twarpAdj
		setSectorParameter $twarpOptionAdj[$twarpOptioni] "TWARPOPT" $twarpOrigin
	end

return

:chkExistsTwarpOption
	# Takes 	$twarpAdj
	# Returns	$twarpOptionPresent 

	if ($debug = 1)
		echo "DEBUG: chkExistsTwarpOption   $twarpAdj " $twarpAdj " *"
	end

	setVar $twarpOptionPresent 0

	setVar $twarpChki 1
	while ($twarpChki <= $twarpOptioni)

	if ($debug = 2)
		echo "TwarpChki: " $twarpChki " adj: " $twarpOptionAdj[$twarpChki]   " twarpAdj: " $twarpAdj "*"
	end
		if ($twarpOptionAdj[$twarpChki] = $twarpAdj)
			setVar $twarpOptionPresent 1
			if ($debug = 1)
				echo "DEBUG: chkExistsTwarpOption   $twarpOptionPresent " $twarpOptionPresent " *"
			end
			return
		end
		add $twarpChki 1
	end
return

:removeTwarpOption
	# Takes $twarpRemoveSector

	if ($debug = 1)
		echo "DEBUG: removeTwarpOption   $twarpRemoveSector " $twarpRemoveSector " *"
	end

	setVar $twarpChki 1
	while ($twarpChki <= $twarpOptioni)
		if ($twarpOptionAdj[$twarpChki] = $twarpRemoveSector)
			
			setSectorParameter $twarpOptionAdj[$twarpChki] "TWARPOPT" 0
			setVar $twarpOption[$twarpChki] 0
			setVar $twarpOptionAdj[$twarpChki] 0
			if ($debug = 1)
				echo "Removed " $twarpRemoveSector " from list*"
			end
			return
		end
		add $twarpChki 1
	end

return

:clearTwarpOption
	
	setVar $tt 11
	while ($tt <= SECTORS)
		
		getSectorParameter $tt "TWARPOPT" $hasOpt 
		if ($hasOpt = "")
			setVar $hasOpt 0
		end
		if ($hasOpt > 10)
			setSectorParameter $tt "TWARPOPT" 0
		end
		add $tt 1
	end
return
:loadTwarpOption
	setVar $twarpOption 0
	setVar $twarpOptionAdj 0
	setVar $twarpOptioni 0
	setVar $tt 11
	while ($tt <= SECTORS)
		
		getSectorParameter $tt "TWARPOPT" $hasOpt 
		if ($hasOpt = "")
			setVar $hasOpt 0
		end
		if ($hasOpt > 10)
			add $twarpOptioni 1
			setVar $twarpOption[$twarpOptioni] $hasOpt
			setVar $twarpOptionAdj[$twarpOptioni] $tt
			if ($debug = 1)
				echo "DEBUG: TWARPOPTION added Adj: " $tt " Land:  " $hasOpt "*"
			end
		end
		add $tt 1
	end
return



:checkPPTAlerts
	if (PORT.EXISTS[CURRENTSECTOR] = TRUE)
		if ($pptPortUsed[CURRENTSECTOR] = 0)
			setVar $cport PORT.CLASS[CURRENTSECTOR]
			
			if ($cport = 5)
				add $portsClass5i 1
				setVar $portsClass5[$portsClass5i] CURRENTSECTOR
				# check for 5 2 pair
				setVar $pptCheckType 1
				gosub :checkPairReady
				setVar $pptPortUsed[CURRENTSECTOR] 1
			elseif ($cport = 2)
				add $portsClass2i 1
				setVar $portsClass2[$portsClass2i] CURRENTSECTOR
				# check for 5 2 pair
				setVar $pptCheckType 1
				gosub :checkPairReady
				setVar $pptPortUsed[CURRENTSECTOR] 1
			elseif ($cport = 4)
				add $portsClass4i 1
				setVar $portsClass4[$portsClass4i] CURRENTSECTOR
				# check for 4 1 pair
				setVar $pptCheckType 2
				gosub :checkPairReady
				setVar $pptPortUsed[CURRENTSECTOR] 1
			elseif ($cport = 1)
				add $portsClass1i 1
				setVar $portsClass1[$portsClass1i] CURRENTSECTOR
				# check for 4 1 pair
				setVar $pptCheckType 2
				gosub :checkPairReady
				setVar $pptPortUsed[CURRENTSECTOR] 1
			end
			
		end
	end

return

:checkPairReady

	setVar $doAnnouncement 0
	if ($pptCheckType = 1)
		setVar $diff1 ($portsClass5i - $portsCurrent5i)
		setVar $diff2 ($portsClass2i - $portsCurrent2i)
		if (($diff1 > 0) and ($diff2 > 0))
			# both ports are ready!
			add $portsCurrent5i 1
			add $portsCurrent2i 1
			setVar $pptAnnouncement "TWARPPPTPAIR:" & $portsClass5[$portsCurrent5i] & "_" 
			setVar $pptAnnouncement $pptAnnouncement & $portsClass2[$portsCurrent2i] & "_3_3"  & ":ENDPAIR"
			setVar $doAnnouncement 1
		end
	else
		setVar $diff1 ($portsClass4i - $portsCurrent4i)
		setVar $diff2 ($portsClass1i - $portsCurrent1i)
		if (($diff1 > 0) and ($diff2 > 0))
			# both ports are ready!
			add $portsCurrent4i 1
			add $portsCurrent1i 1
			setVar $pptAnnouncement "TWARPPPTPAIR:" & $portsClass4[$portsCurrent4i] & "_" 
			setVar $pptAnnouncement $pptAnnouncement & $portsClass1[$portsCurrent1i] & "_3_3"  & ":ENDPAIR"
			setVar $doAnnouncement 1
		end
	end
	if ($doAnnouncement = 1)
		setVar $SWITCHBOARD~message $pptAnnouncement & "*"
		gosub :SWITCHBOARD~switchboard
	end
return


include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\player\moveintosector\player"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\combat\holokill\combat"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\sector\getautosectordata\sector"
include "source\bot_includes\combat\fastcitadelattack\combat"
include "source\bot_includes\combat\fastcapture\combat"
include "source\bot_includes\ship\loadshipinfo\ship"
include "source\bot_includes\ship\getshipcapstats\ship"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\player\topoff\player"
