gosub :BOT~loadVars


setVar $BOT~help[1]  $BOT~tab&"    bg2019 [command]"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&"    sellship  - sells your ship and sits you in scout"
setVar $BOT~help[4]  $BOT~tab&"    stripcash - strips cash from corp mates (11k+ req)"
setVar $BOT~help[5]  $BOT~tab&"    buycorp   - buys Corp Flag "
setVar $BOT~help[6]  $BOT~tab&"    buydora   - buys Orion "
setVar $BOT~help[7]  $BOT~tab&"    buycolt   - buys Colt "
setVar $BOT~help[8]  $BOT~tab&"    movecolt  - moves Colts to sectors  "
setVar $BOT~help[9]  $BOT~tab&"                  >movecolt 95 16822 87 "
setVar $BOT~help[10] $BOT~tab&"    grabcolo  - fills any Colt in sector with colos "
setVar $BOT~help[11] $BOT~tab&"    docim     - downloads port/warp data "

gosub :bot~helpfile

setVar $BOT~script_title "BG2019 Utilities"
gosub :BOT~banner


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


if ($bot~parm1 = "buydora")
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

setVar $SWITCHBOARD~message "I'll do a lot.. but not that.*"
gosub :switchboard~switchboard
halt
halt

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
	settextlinetrigger foundcolt :foundcolt "  0  Colonial Transport"
	settextlinetrigger nomore :nomore "Choose which ship to tow (Q=Quit)"
	settextlinetrigger nomore2 :nomore "You do not own any other ships in this sector!"
	pause
	:foundcolt
		getword currentline $shipnumber 1
		add $colts 1
		setvar $colts[$colts] $shipnumber
		settextlinetrigger foundcolt :foundcolt "  0  Colonial Transport"
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
	settextlinetrigger foundcolt :foundcoltmove "  0  Colonial Transport"
	settextlinetrigger nomore :nomoremove "Choose which ship to tow (Q=Quit)"
	settextlinetrigger nomore2 :nomoremove "You do not own any other ships in this sector!"
	pause
	:foundcoltmove
		getword currentline $shipnumber 1
		add $colts 1
		setvar $colts[$colts] $shipnumber
		settextlinetrigger foundcolt :foundcolt "  0  Colonial Transport"
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
	setTextLineTrigger stardock2 :stardock2 "Ports   : Stargate Alpha I"
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
	
	gosub :atdockinmerch
	
	send "pssbyymycDora The Explorer**pa30*yqqhrhqspb3000*qqq"
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
					send "'" $SWITCHBOARD~BOT_NAME " dora 2000 none ports*"
					halt

		end

	halt

return

:buycorp
	
	gosub :atdockinmerch
	if ($player~credits < 350000)
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
		send "The Bossman**pa130*yb99*qqhrhw2qq"
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
	setTextLineTrigger merch :merch "Merchant Cruiser"
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
	setTextLineTrigger stardock :stardock "Ports   : Stargate Alpha I"
	setTextLineTrigger nostardock :nostardock "Warps to Sector(s) :"
	pause
	:nostardock
		setVar $SWITCHBOARD~message "Start at dock, in day 1 merch*"
		gosub :switchboard~switchboard
		HALT
	:stardock 
		killalltriggers

return

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\quikstats\player"
