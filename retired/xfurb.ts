#
#

setVar $furbloc ""
setVar $furbreturn 0
setVar $furbHolds 22
setVar $bustship 0
setVar $myship 0

gosub :_START_
	
	stripText $bustship "."
	stripText $bustship ","
	setVar $addHolds $furbHolds

	goto :startfurb
		
	halt
	
    gosub :PLAYER~quikstats

  
	:startFurb
	killalltriggers
	

#	send "C ZQ "

#	waitfor "<Active Ship Scan>"
#	:eachshiploc
#	setTextLineTrigger shiplocx :shiplocf " "&$bustship&" "
#	setTextLineTrigger nofindf :nofindf "Computer command [TL="
#	pause
#	:nofindf
#		send "*"
#		killalltriggers
#		setVar $SWITCHBOARD~message "Can not find ship.*"
#		gosub :SWITCHBOARD~switchboard
#		halt
		
#	:shiplocf
#		killtrigger shiplocf
#		killtrigger nofindf
		
#		getWord CURRENTLINE $isbustship 1
#		getWord CURRENTLINE $bustloc 2

#		if ($isbustship = $bustship)
			
#			setVar $SWITCHBOARD~message "Ship " & $bustship & " found, transporting.*"
#			gosub :SWITCHBOARD~switchboard
			
#			goto :transport
#		else
#			goto :eachshiploc
#		end


	
	:transport

	

	if (($furbloc = "A") or ($furbloc = "R") or (($furbloc = "T") and ($player~current_sector > 10)))
		send "x " $bustship " * *"
	else
		send "x * " $bustship " * *"
	end 

	SetTextTrigger 		xrange 		:xrange "only has a transport range"
	SetTextLineTrigger	xnotavail 	:xnotavail "That is not an available sh"
	SetTextLineTrigger	xsuccess 	:xsuccess "urity code accepted, engaging transporter contr"
	pause
	:xnotavail
		
		killalltriggers
		setVar $SWITCHBOARD~message "Ship not available! Halting....*"
		gosub :SWITCHBOARD~switchboard
		halt
	
	:xrange
		
		killalltriggers
		setVar $SWITCHBOARD~message "Ship out of range! Halting....*"
		gosub :SWITCHBOARD~switchboard
		halt
	
	:xsuccess
		killalltriggers

	gosub :player~quikstats
	setvar $bustloc $player~current_sector
	
	send "tc"
	setTextTrigger		THERE		:THERE		"Exchange with"
	setTextLineTrigger	NOTTHERE	:NOTTHERE	"Your Associate must be in the same sector to conduct transfers!"
	pause
	:THERE
		send "YF"
		waitfor "credits, and"
		getText CurrentLine $DECASH " has " "."
		stripText $DECASH ","
		stripText $DECASH " "
		if ($DECASH > 500000)
			setVar $DECASH ($DECASH - 500000)
			send $DECASH & "*"
		else
			setVar $DECASH 0
			send "*"
		end
		
		send "  *   *   "
	:NOTTHERE
		killAllTriggers
		send "   * *    "
		
    
	:checkforplanets

	send "D"
	gosub :PLAYER~quikstats
	
	if ($PLAYER~TWARP_TYPE = "No")
		killalltriggers
		setVar $SWITCHBOARD~message "No TWARP!! This ain't a bus service... exiting*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $gotore 0
	setVar $trybwarp 0

	setVar $planet~planetnumok 0
	gosub :player~quikstats
	send "lq* "

	:checkPlanetsInSector
		setTextLineTrigger blocked :blocked "blocks your attempt to enter orbit.  You wi"
		setTextLineTrigger cannotland :cannotland "ter making your pass through the atmosphere, y"
		setTextLineTrigger orenoplanet :orenoplanet "There isn't a planet in this sector."
		setTextLineTrigger oreoneplanet :oreoneplanet "-------  ---------  ---------  ---------  ---------  --"
		setTextLineTrigger orestartplannum :orestartplannum "Registry# and Planet Name"
		setTextLineTrigger orestartplanetsok :orestartplanetsok "<"
		pause
		:blocked
			killalltriggers
			setVar $SWITCHBOARD~message "I've been blocked from landing! waiting 10 seconds, will try again, then hald*"
			gosub :SWITCHBOARD~switchboard
			if ($blockedonce = 1)
				halt
			end
			setVar $blockedonce 1
			setDelayTrigger delayd :waitl 10000
			pause
			:waitl
			killalltriggers
			goto :checkPlanetsInSector
		:orestartplannum 
			setVar $planet~planetnumok 1
			pause
		:orenoplanet
		:cannotland
			killAllTriggers
			send " * * "
			goto :checkPlanetsFinishWait
		
			
		:orestartplanetsok
			killAllTriggers 
			if ($planet~planetnumok = 1)
				getwordpos currentline $pos "<"
				getwordpos currentline $pos2 ">"
				if (($pos <= 0) or ($pos2 <= 0))
					goto :checkPlanetsInSector
				end
				getWord CURRENTLINE $cPlanetNum 2
				stripText $cPlanetNum ">"
				stripText $cPlanetNum "<"
				isNumber $test $cPlanetNum
				if ($test = true)
					if ($cPlanetNum > 0)
					else
						getWord CURRENTLINE $cPlanetNum 1
						stripText $cPlanetNum ">"
						stripText $cPlanetNum "<"					
					end
				else
					getWord CURRENTLINE $cPlanetNum 1
					stripText $cPlanetNum ">"
					stripText $cPlanetNum "<"
				end

				send "l" $cPlanetNum "*"
				waitfor "-------  ---------  ---------  ---------  ---------"
				goto :getplanetdetails
			else
				goto :checkPlanetsInSector
			end
		
			
		:oreoneplanet
			killAllTriggers
			send "l *"
			goto :getplanetdetails


	:getplanetdetails
		waitfor "Fuel Ore"
		getWord CURRENTLINE $planet~planetfuel 6
		stripText $planet~planetfuel ","
		setTextLineTrigger tRange :tRange "TransPort power ="
		setTextTrigger tplanet :tplanet "Planet command"
		pause

		:tRange
			killalltriggers
			setVar $trybwarp 1
			goto :tdone
		:tplanet
			killalltriggers
			setVar $trybwarp 0
		:tdone
		
			gosub :player~quikstats
			if ($player~credits < 10000000)
				send "t n l 2 * t n l 3 * t n t 1 *  c t f " (10000000-$player~credits) "* q "
			else
				send "t n l 2 * t n l 3 * t n t 1 *  "
			end
			gosub :player~quikstats
			if ($player~ORE_HOLDS = $player~total_holds)
				setVar $gotore 1
			end

		if ($trybwarp = 1)
			send "cb" $furbreturn "*"
			setTextLineTrigger block :block "Locating beam pinpointed, TransWarp"
			setTextLineTrigger brange :brange "his planetary transporter does not have the range"
			setTextLineTrigger bore :bore "his planet does not have enough Fuel Ore to transport yo"
			pause
			
			:block 
				killalltriggers
				send "y"
				waitfor "Warps to Sector(s)"
				goto :doFurbandReturn
			:brange
				killalltriggers
				setVar $SWITCHBOARD~message "Planet in this sector does not have the bwarp range! Will try twarp.*"
				gosub :SWITCHBOARD~switchboard
				send " q q "
				goto :checkPlanetsFinishWait
			:bore
				killalltriggers
				setVar $SWITCHBOARD~message "Planet is out of ore! can't transport, will try twarp.*"
				gosub :SWITCHBOARD~switchboard
				send " q q "
				goto :checkPlanetsFinishWait
		else
			send " q * "
		end	


	
	# We didn't have a planet solution
	:checkPlanetsFinishWait
	
	if ($gotore = 0)
		if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = FALSE) OR (PORT.BUYFUEL[$PLAYER~CURRENT_SECTOR] = TRUE) OR (PORT.CLASS[$PLAYER~CURRENT_SECTOR] <= 0) OR (PORT.CLASS[$PLAYER~CURRENT_SECTOR] >= 9)
			setVar $SWITCHBOARD~message "This sector sells no ore, no planet solution eitehr!*"
			gosub :SWITCHBOARD~switchboard
		else
			send "P * * * "
			setVar $oreok 0
			waitfor "Enter your choice [T]"
			:orecheck
			setTextLineTrigger oregood :oregood "How many holds of Fuel Ore"
			setTextTrigger oreotherprod :oreotherprod "How many holds of Organics do you"
			setTextTrigger oredone :oredone "Command ["
			pause
			:oregood
				killalltriggers
				setVar $oreok 1
				goto :orecheck

			:oreotherprod
				killalltriggers
				send "0*0*"
				send "o 1 9* 1 9* 1 9* 1 9* 1 9* q"
				send "p t * * "
				setVar $oreok 1
			:oredone
				if ($oreok = 0)
					send "o 1 9* 1 9* 1 9* 1 9* 1 9* q"
					send "p t * * "
				end 

		end
	end
	

	
	SetTextTrigger 		noFig2 		:noFig2 		"blind?"
	SetTextLineTrigger 	lowShipOre2 :lowShipOre2 	"You do not have enough Fuel Ore to make the jump."
	SetTextLineTrigger 	locked2 	:locked2 		"Locating beam pinpointed"
	SetTextTrigger 		adj2 		:adj2 			"NavPoint Settings"
	#send "NSY"
	send "M" & $furbreturn & "*Y"
	pause
	:noFig2
	killtrigger nofig2
	killtrigger lowshipore2
	killtrigger locked2
	killtrigger adj2
		send "N "
		setVar $SWITCHBOARD~message "No Commission or No Lock! Exiting*"
		gosub :SWITCHBOARD~switchboard
		halt
	:lowShipOre2
	killtrigger nofig2
	killtrigger lowshipore2
	killtrigger locked2
	killtrigger adj2
		
		setVar $SWITCHBOARD~message "I don't have enough ore. SCRIPT HALTED*"
		gosub :SWITCHBOARD~switchboard
		halt
	:locked2
	killtrigger nofig2
	killtrigger lowshipore2
	killtrigger locked2
	killtrigger adj2
	send "Y "
	goto :doFurbandReturn

	:adj2
	killtrigger nofig2
	killtrigger lowshipore2
	killtrigger locked2
	killtrigger adj2
	send "* "

:doFurbandReturn
	
	if ($furbloc = "S")
		send "p s s p"
	else
		send "p t"
	end
	waitfor "A  Cargo holds"
	getWord CURRENTLINE  $holdsforsale 10

	if ($holdsforsale < $furbHolds)
		if ($PLAYER~CREDITS > 200000)
			if ($holdsforsale = 0)
				#setVar $SWITCHBOARD~message "No holds for sale, wrong ship?*"
				#gosub :SWITCHBOARD~switchboard
				send "a" $furbHolds "*y"

			else
				#setVar $SWITCHBOARD~message "Short on holds, buying what they've got.*"
				#gosub :SWITCHBOARD~switchboard
				send "a" $holdsforsale "*y"

			end
		else
			setVar $SWITCHBOARD~message "Not enough holds for sale, low cash?*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
	else
		send "a" $furbHolds "*y"
	end
	if ($furbloc = "S")
		send "q q q "
	else
		send "q "
	end



:takeFurbedShipHome

	SetTextTrigger 		noFig3 		:noFig3 		"blind?"
	SetTextLineTrigger 	lowShipOre3 :lowShipOre3 	"You do not have enough Fuel Ore to make the jump."
	SetTextLineTrigger 	locked3 	:locked3 		"Locating beam pinpointed"
	SetTextTrigger 		adj3 		:adj3 			"NavPoint Settings"
	#send "NSY"
	send "M" & $bustloc & "*Y"
	pause
	:noFig3
	killtrigger noFig3
	killtrigger lowShipOre3
	killtrigger locked3
	killtrigger adj3
		send "N "
		setVar $SWITCHBOARD~message "No Lock on returning furb*"
		gosub :SWITCHBOARD~switchboard
		halt
	:lowShipOre3
	killtrigger noFig3
	killtrigger lowShipOre3
	killtrigger locked3
	killtrigger adj3
		
		setVar $SWITCHBOARD~message "I don't have enough ore. SCRIPT HALTED*"
		gosub :SWITCHBOARD~switchboard
		halt
	:locked3
	killtrigger noFig3
	killtrigger lowShipOre3
	killtrigger locked3
	killtrigger adj3
	send "Y "
	goto :getBackIntoOwnShip

	:adj3
	killtrigger noFig3
	killtrigger lowShipOre3
	killtrigger locked3
	killtrigger adj3
	send "* "
	

:getBackIntoOwnShip
	send "x " $myship " * *"
	SetTextTrigger 		xrange2 	:xrange2 "only has a transport range"
	SetTextLineTrigger	xnotavail2 	:xnotavail "That is not an available sh"
	SetTextLineTrigger	xsuccess2 	:xsuccess2 "urity code accepted, engaging transporter contr"
	pause
	:xnotavail2
		
		killalltriggers
		setVar $SWITCHBOARD~message "Ship not available! Halting....*"
		gosub :SWITCHBOARD~switchboard
		halt
	:xrange2
		
		killalltriggers
		setVar $SWITCHBOARD~message "Ship out of range! Halting....*"
		gosub :SWITCHBOARD~switchboard
		halt
	
	:xsuccess2
		
		setVar $SWITCHBOARD~message " xfurb complete*"
		gosub :SWITCHBOARD~switchboard
		killalltriggers
halt


:_START_
	gosub :BOT~loadVars
	loadVar $PLAYER~unlimitedGame  

				
	setVar $BOT~help[1] $BOT~tab&"  XFurb - XPorts to Ship, Swaps and Furbs  "
	setVar $BOT~help[2] $BOT~tab&"          Start at any Class 0"
	setVar $BOT~help[3] $BOT~tab&"- xfurb [Furb Ship] {holds} "
	setVar $BOT~help[4] $BOT~tab&"- [Furb Ship]   = ship number that needs the furb"
	setVar $BOT~help[5] $BOT~tab&"- {holds}       = holds to buy, defaults 22"
	setVar $BOT~help[6] $BOT~tab&" "
	setVar $BOT~help[7] $BOT~tab&"  Xports to furb ship, brings it to location, buys "
	setVar $BOT~help[8] $BOT~tab&"  holds and twarps back. Requires TWarp/Ore Source "
	setVar $BOT~help[9] $BOT~tab&"  will check top planet for fuel and a teleport option first."
	
	gosub :bot~helpfile


	
	if ($bot~parm1 = 0)
		setVar $SWITCHBOARD~message "Specify both Furb and Sit ship.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	isNumber $test $bot~parm1
        IF ($test)
		if ($bot~parm1 > 1) OR ($bot~parm1 <= 2000)
			SetVar $bustship $bot~parm1
		else
			setVar $SWITCHBOARD~message "Furb Ship  Number out of range.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
        ELSE
	        setVar $SWITCHBOARD~message "Furb Ship needs to be a number.*"
		gosub :SWITCHBOARD~switchboard
		halt
        END
	
	

	
	if ($bot~parm2 = "")
		setVar $furbholds 22
	else
		isNumber $test $bot~parm2
		IF ($test)
			setVar $furbholds $bot~parm2
			if ($furbholds < 1)
				setVar $SWITCHBOARD~message "Furb nothing? consider it done.. exiting!*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		ELSE
			setVar $SWITCHBOARD~message "Ship Number needs to be a number.*"
			gosub :SWITCHBOARD~switchboard
			halt
		END

	end

	gosub :PLAYER~quikstats
	
	setVar $myship $PLAYER~SHIP_NUMBER

	setVar $START_CASH $PLAYER~CREDITS
	setVar $startingLocation $PLAYER~CURRENT_PROMPT

	if ($startingLocation <> "Command")
		
		setVar $SWITCHBOARD~message "xFurb must be run from Command Prompt*"
		gosub :SWITCHBOARD~switchboard
		
		halt
	end

	send "d"
	waitfor "Sector  :"
	:startdisp
	setTextLineTrigger sd :sd "Ports   : Stargate Alpha I"
	setTextLineTrigger terra :terra "Ports   : Sol"
	setTextLineTrigger alpha :alpha "Ports   : Alpha Centauri"
	setTextLineTrigger rylos :rylos "Ports   : Rylos"
	setTextTrigger enddisp :enddisp "Command ["
	pause
	:sd
		setVar $furbloc "S"
		setvar $furbreturn $map~stardock
		pause
	:terra
		setVar $furbloc "T"
		setvar $furbreturn 1
		pause
	:alpha
		setVar $furbloc "A"
		setvar $furbreturn $map~alpha_centauri
		pause	
	:rylos	
		setVar $furbloc "R"
		setvar $furbreturn $map~rylos
		pause
	:enddisp
		killalltriggers
		if ($furbloc = "")
			setVar $furbloc "T"			
			setvar $furbreturn 1
		end
	
	
	
	if ($PLAYER~unlimitedGame = FALSE) and ($PLAYER~TURNS < 30)
		setVar $SWITCHBOARD~message "You need at least 30 turns.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($PLAYER~CREDITS < 100000)
		setVar $SWITCHBOARD~message "Must Have At Least 100,000 Cred On Hand.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	
	setVar $myship $PLAYER~SHIP_NUMBER

	killAllTriggers
	send "C U Y V 0* Y Y Q "
	waitfor "Avoided sectors Cleared."
	waitfor "Command ["
	


 return

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



#INCLUDES:
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
