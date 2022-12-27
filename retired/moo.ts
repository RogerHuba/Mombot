#TO DO

#Blowing Planets: only blow own planets (created today?) - blow all option
#Add planet names: list of X - make it look random but its not - randomly generate each run
#	enter sector 	- get list of planet names curently
#					- exclude from list to use
#					- create planet, give it name. Thats what we are looking for
#					- integrate straight to neg

#furbing: Swap ship on planet - have person at base - get them to LSD after swap - can share
#	or tow in a ship (good for day 1 - add this to mooexp)

#nothing to sell
# Could integrate checkSafeToBlow and the checkplanetlist routine together - save one waitfor per sector
# not getting planet names rights on sector lsit
#   if we need fuel, it needs to find planet name based on plist and grab - then send that straight to neg
#   check sector initial could also check for citadels etc and abort as required
gosub :BOT~loadVars

loadVar $game~port_max
loadVar $game~ptradesetting
loadvar $MAP~STARDOCK
loadVar $game~MAX_PLANETS_IN_GAME
loadVar $GAME~MAX_PLANETS_PER_SECTOR
loadVar $bot~Folder
loadVar $BOT~bot_turn_limit
loadVar $moo_primary_product
loadVar $moo_preferred_slot

setVar $BOT~help[1]  $BOT~tab&"       Warps around to ports and sells products from planets"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&"       "
setVar $BOT~help[4]  $BOT~tab&" moo [mode] {maxplanets} {f/o/e} {all/bad/top}"
setVar $BOT~help[5]  $BOT~tab&"        {guard} {nofigs} {ephag} {safe/paranoid}"
setVar $BOT~help[6]  $BOT~tab&" Options:"
setVar $BOT~help[7]  $BOT~tab&"    [mode]       skimpl/upgraded/param/everything/file/sector"
setVar $BOT~help[8]  $BOT~tab&"    {maxplanets} Max planets b4 blasting and replacing."
setVar $BOT~help[9]  $BOT~tab&"    {f/o/e}      Primary Product, Equipment by default, set"
setVar $BOT~help[10] $BOT~tab&"                 once only then no need to call."
setVar $BOT~help[11] $BOT~tab&"    {bad/all/top}Clean bad/all planets post trading. default none."
setVar $BOT~help[12] $BOT~tab&"                 Top leaves max planets per sector"
setVar $BOT~help[13] $BOT~tab&"    {guard}      Dock corp planet created"
setVar $BOT~help[14] $BOT~tab&"    {ephag}      Default is NEG but set to use EP Haggle"
setVar $BOT~help[15] $BOT~tab&"    {safe}       Ports must be surrounded by figs (ZTM!)"
setVar $BOT~help[16] $BOT~tab&"    {paranoid}   Ports must be surrounded by figs and limpets"
setVar $BOT~help[17] $BOT~tab&"    {efurb:bot}  Bot to exchange ships with at home planet to furb."
setVar $BOT~help[18] $BOT~tab&"    {xfurb:bot:ship} Xport Furb - Furb ship ready above planet."
setVar $BOT~help[19] $BOT~tab&"    {tradeto:n}  Trade to percentage, defaults 15, tradeto:50 = 50%"
setVar $BOT~help[20] $BOT~tab&"    {Secure}     Drop mines and Armids"
setVar $BOT~help[21] $BOT~tab&"    {onestock}   Works port till empty, restocks, moves to next"
setVar $BOT~help[22] $BOT~tab&"    Modes -"
setVar $BOT~help[23] $BOT~tab&"      skimpl/pl  - Sells off product from personal planet list"
setVar $BOT~help[24] $BOT~tab&"                 - Skim versions skips making new planets"
setVar $BOT~help[25] $BOT~tab&"      upgraded   - Visits upgrade ports (10k+) that are ready"
setVar $BOT~help[26] $BOT~tab&"      param      - Sectors with this param i.e. moo MOOPORTS"
setVar $BOT~help[27] $BOT~tab&"      everything - Anything that buys the primary prod with a fig"
setVar $BOT~help[28] $BOT~tab&"      file       - One sector per line, file must end in .txt"
setVar $BOT~help[29] $BOT~tab&"      sector     - One sector >Moo sector {maxplanets} {sector}"
setVar $BOT~help[30] $BOT~tab&"      "
setVar $BOT~help[31] $BOT~tab&"  FIRE TOURNAMENT"
setVar $BOT~help[32] $BOT~tab&"       moo [mode] fire {figs} {ephag} {safe/paranoid}"

gosub :bot~helpfile

setVar $BOT~script_title "Moo - Time to blow some crap up!"
gosub :BOT~banner

gosub :player~quikstats
setvar $startturns $player~turns



#array of planetnames
setArray $neg_planetNames 20
setArray $neg_planetNamesTaken 20
setVar $i 1
while ($i <= 20)
	getRnd $ran1 10000 999999
	getRnd $ran2 10000 999999
	setVar $ranname "m" & $ran1 & $ran2
	setVar $neg_planetNames[$i]  $ranname
	add $i 1
end

# Trading Min - we'll stop using a port when we get here
setVar $tradingMinProduct 15


# try and grab fuel at this
setvar $startMsg ""

setVar $minOre 120
if ($player~total_holds < $minOre)
	setVar $minOre $player~total_holds
end

# stop when turns drop below this number. It checks at the end of a sector

if ($BOT~bot_turn_limit < 1)
	setVar $turn_limit 50
	setvar $startMsg $startMsg &  "Turn Limit not set in bot - setting to 50.*"
	
else
	setVar $turn_limit $BOT~bot_turn_limit
end


setVar $startingLocation $PLAYER~CURRENT_PROMPT
if (($startingLocation <> "Command") and ($startingLocation <> "Citadel"))
	setVar $SWITCHBOARD~message "Start from the command prompt or a citadel to dump cash.*"
	gosub :SWITCHBOARD~switchboard
	halt
else
	if ($startingLocation = "Command")
		setvar $startMsg $startMsg & "Starting from sector level - no planet cash dump or fig top ups!*"
	else
		setvar $startMsg $startMsg & "Starting on planet - will dump cash and top up figs here.*"
	end
	
end

setVar $hazSlots 0
if ($bot~parm2 = "fire")
	setvar $startMsg $startMsg & "Using FIRE defaults (slot 10 + 3), Equipment, Top Cleanup*"
	setVar $preferredPlanetSlot 10

	setVar $hazSlots 3
	setVar $PrimaryProduct 3
	setVar $userCleanup 3
	
	
	goto :fireitup
elseif ($bot~parm2 = "star")
	setvar $startMsg $startMsg & "Using STARTREK defaults (slot 10 + 2), Equipment, Top Cleanup*"
	setVar $preferredPlanetSlot 10
	
	setVar $hazSlots 2
	setVar $PrimaryProduct 3
	setVar $userCleanup 3
	
	send "ctq"
	setTextLineTrigger timeAM :timeAM " AM "
	setTextLineTrigger timePM :timePM " PM "
	pause
	:timeAM
		killAllTriggers
	
	#	setVar $userCleanup 0
		goto :fireitup
	:timePM
		killAllTriggers
	goto :fireitup
else
	

	# it will make up to this many planets in sector before blasting them
	# however will leave when port empty

	setVar $preferredPlanetSlot $bot~parm2
	isNumber $number $preferredPlanetSlot
	if (($number = 1) and ($preferredPlanetSlot <> 0))
		if (($preferredPlanetSlot <= 0) or ($preferredPlanetSlot > 20))
			setvar $switchboard~message "Preferred planet should be from 1 to 20*"
			gosub :switchboard~switchboard
			halt
		else
			setvar $startMsg $startMsg & "We will create a max of " & $preferredPlanetSlot & " planets.*"
			setVar $moo_preferred_slot $preferredPlanetSlot
			SaveVar $moo_preferred_slot 
		end
	else
		if ($moo_preferred_slot > 0)
			setVar $preferredPlanetSlot $moo_preferred_slot
		else
			setvar $switchboard~message "Max Planets is not defined; please start with a # rom 1-20.*"
			gosub :switchboard~switchboard
			halt
		end
	end

end


# 
# Primary product 1 - fuel, 2 - org, 3 - fuel
# 


setVar $PrimaryProduct 0
getWordPos " "&$bot~user_command_line&" " $pos " f "
if ($pos > 0)
	setVar $PrimaryProduct 1
	setvar $startMsg $startMsg & "Primary product will be fuel ore.*"
	setVar $minOre 90
end

getWordPos " "&$bot~user_command_line&" " $pos " o "
if ($pos > 0)
	setvar $startMsg $startMsg & "Primary product will be Organics.*"
	setVar $PrimaryProduct 2
end

getWordPos " "&$bot~user_command_line&" " $pos " e "
if ($pos > 0)
	setVar $PrimaryProduct 3
	setvar $startMsg $startMsg & "Primary product will be Equipment.*"
end


if ($PrimaryProduct = 0)
	if ($moo_primary_product > 0)
		setVar $PrimaryProduct $moo_primary_product
	else
		setVar $PrimaryProduct 3
		setvar $startMsg $startMsg & "Primary product not found - defualt to equip.*"
		
	end
else
	# update primary product
	setVar $moo_primary_product $PrimaryProduct
	saveVar $moo_primary_product
	
end

getWordPos $bot~user_command_line $pos "secure"
if ($pos > 0)
	setVar $mines TRUE
	setvar $startMsg $startMsg & "We are dropping limpets and mines.*"
else
	setVar $mines FALSE
end

getWordPos $bot~user_command_line $pos "onestock"
if ($pos > 0)
	setVar $restockMoveOn TRUE
	setvar $startMsg $startMsg & "We will restock at end and move to next port.*"
else
	setVar $restockMoveOn FALSE
end


setVar $userCleanup 0
gosub :switchboard~switchboard
getWordPos $bot~user_command_line $pos "all"
if ($pos > 0)
	setVar $userCleanup 2
	setvar $startMsg $startMsg & "We are blowing ALL planets post trade.*"
else
	getWordPos $bot~user_command_line $pos "top"
	if ($pos > 0)
		setVar $userCleanup 3
		setvar $startMsg $startMsg & "We are blowing up planets above max planets.*"
	else
		getWordPos $bot~user_command_line $pos "bad"
		if ($pos > 0)
			setVar $userCleanup 1
			setvar $startMsg $startMsg & "We are just blowing dud planets.*"
		end
	end
end
setVar $cleanup $userCleanup

#   skimpl upgraded param (5th) everything file
# skimpl - goes and sells off excess product
# upgraded - searchs database for ports 10k + prod to buy
# param - trades sectors with param - next command line var is param
# everything - travels to any port buying the primary product matching our security level
# file - next command line var is param
:fireitup

setVar $modestring $bot~parm1
setVar $mode 0
setVar $skimMode 0
setVar $searchParam ""
# sector file
setVar $sectorfile ""

if ($modestring = "skimpl")
	setVar $mode 1
	setVar $startMsg $startMsg & "Sourcing sectors from personal planet list, Skim Mode.*"
	setVar $skimMode 1
elseif ($modestring = "pl")
	setVar $mode 1
	setVar $startMsg $startMsg & "Sourcing sectors from personal planet list.*"
elseif ($modestring = "upgraded")
	setVar $mode 2
	setVar $startMsg $startMsg & "Sourcing sectors from anything upgraded.*"
elseif ($modestring = "everything")
	setVar $mode 4
	setVar $startMsg $startMsg & "Sourcing sectors from any good port.*"
elseif ($modestring = "sector")
	setVar $mode 6
	setVar $startMsg $startMsg & "Mooing Single Sector.*"
	setVar $mooSector $bot~parm3
	isNumber $number $mooSector
	if ($number = 1)
	
	else
		setVar $SWITCHBOARD~message "Please use >Moo sector {maxplanets} {sector}"
		gosub :SWITCHBOARD~switchboard
		halt
	end
else
	getWordPos $modestring $pos ".txt"
	if ($pos > 0)
		setVar $mode 5
		setVar $startMsg $startMsg & "Sourcing sectors from listed in " & $modestring & ".*"
		setVar $sectorfile $modestring
	else
		setVar $mode 3
		setVar $startMsg $startMsg & "Sourcing sectors with Param: " & $modestring & ".*"
		setVar $searchParam $modestring
		upperCase $searchParam
	end
end

if ($game~ptradesetting = 0) or ($game~MAX_PLANETS_IN_GAME = 0)
	setVar $SWITCHBOARD~message "No planet trade/planets in game settings >refresh >update.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

getWordPos $bot~user_command_line $pos "guard"
if ($pos > 0)
	setVar $useGuard TRUE
	setvar $startMsg $startMsg & "Creating a corp planet at SD.*"
else
	setVar $useGuard FALSE
	setvar $startMsg $startMsg & "Not Creating Guardian Planets.*"
end


getWordPos $bot~user_command_line $pos "nofigs"
if ($pos > 0)
	setVar $furbfigs FALSE
	setvar $startMsg $startMsg & "We are NOT restocking fighters.*"
else
	setVar $furbfigs TRUE
	setvar $startMsg $startMsg & "We are restocking fighters.*"
end





setVar $tradingMinProduct 15
getWordPos $bot~user_command_line $pos "tradeto:"
if ($pos > 0)

	setVar $cline $bot~user_command_line & " "
	getText $cline $tradeperc "tradeto:" " "

	isNumber $isit $tradePerc 
	if ($isit = FALSE)
		setVar $SWITCHBOARD~message "Trade Percentage should be between 15 and 90.*"
		gosub :SWITCHBOARD~switchboard
		halt
	else
		if ($tradePerc < 15) or ($tradePerc > 90)
			setVar $SWITCHBOARD~message "Trade Percentage should be between 15 and 90.*"
			gosub :SWITCHBOARD~switchboard
			halt
		else
			setVar $tradingMinProduct $tradePerc
			setvar $startMsg $startMsg & "We are trading ports down to " & $tradingMinProduct & "%.*"
		end
	end
end

getWordPos $bot~user_command_line $pos "figs:"
if ($pos > 0)
	setVar $dropftrs TRUE
	setVar $cline $bot~user_command_line & " "
	getText $cline $dropFigQuant "figs:" " "

	getWordPos $bot~user_command_line $pos "offensive"
	if ($pos > 0)
		setVar $dropftrsType "o"
	else
		setVar $dropftrsType "d"
	end
else
	setVar $dropftrs FALSE
end

getWordPos $bot~user_command_line $pos "efurb:"
if ($pos > 0)
	setVar $efurb TRUE
	setVar $cline $bot~user_command_line & " "
	getText $cline $efurbBot "efurb:" " "

	setvar $startMsg $startMsg & "We are exchange furbing with bot:" & $efurbBot &".*"
	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "Must start eFurb option from a citadel*"
		gosub :SWITCHBOARD~switchboard
		halt
	else
		
	end
else
	setVar $efurb FALSE

end

setVar $xfurbShip 0

getWordPos $bot~user_command_line $pos "xfurb:"
if ($pos > 0)
	setVar $xfurb TRUE
	setVar $cline $bot~user_command_line & " "
	getText $cline $xfurbInfo "xfurb:" " "

	replaceText $xfurbInfo ":" " "
	getWord $xfurbInfo $efurbBot 1
	getWord $xfurbInfo $xfurbShip 2
	
	setvar $startMsg $startMsg & "We are exchange furbing with bot: " & $efurbBot &" and ship " & $xfurbShip & ".*"
	isNumber $number $xfurbShip
	if ($number = false) or ($xfurbShip = 0)
		setVar $SWITCHBOARD~message "XFurb ship must be a number above 0*"
		gosub :SWITCHBOARD~switchboard
		halt
	end


	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "Must start xfurb option from a citadel*"
		gosub :SWITCHBOARD~switchboard
		halt
	else
		
	end
else
	setVar $xfurb FALSE

end


getWordPos $bot~user_command_line $pos "ephag"
if ($pos > 0)
	setVar $useEp TRUE
	setvar $startMsg $startMsg & "Using Ep Haggle*"

	setVar $SWITCHBOARD~message "Using Ep Haggle (DISABLED AT THE MO)*"
		gosub :SWITCHBOARD~switchboard
		halt
else
	setVar $useEp FALSE
	setvar $startMsg $startMsg & "Using internal NEG for haggle.*"
end

if ($useEp = 1)
	send "'" $BOT~BOT_NAME " ephaggle planet*"
	setDelayTrigger epHagDel :epHagDel 1500
	
else
	send "'" $BOT~BOT_NAME " stop ephaggle*" 
	setDelayTrigger epHagDel :epHagDel 1500
end
:epHagDel
	killalltriggers



# Requires SAFE

getWordPos $bot~user_command_line $pos "paranoid"
if ($pos > 0)
	setVar $bot~parmanoid TRUE
	setVar $surroundedSectorsOnly 1
	setvar $startMsg $startMsg &"Incoming Sectors require figs and limpets*"
else
	setVar $bot~parmanoid FALSE
	getWordPos $bot~user_command_line $pos "safe"
	if ($pos > 0)
		setVar $surroundedSectorsOnly 1
		setvar $startMsg $startMsg & "Incoming Sectors require figs.*"
	else
		setVar $surroundedSectorsOnly 0
		setvar $startMsg $startMsg & "Loose Cannon Mode Engaged!!!*"
	end
		
end
setVar $SWITCHBOARD~message $startMsg
gosub :switchboard~switchboard

if ($PLAYER~PLANET_SCANNER <> "Yes")
	setVar $SWITCHBOARD~message "Ship needs planet scanners*"
	gosub :SWITCHBOARD~switchboard
	halt
end

setVar $stat_dollarsgross 0
setVar $stat_dollarsnet 0
setVar $stat_dollarsspent 0
setVar $planet~planetsPopped 0
setVar $planet~planetsPoppedGood 0
setVar $updateCount 1




setVar  $moo_setting_file     $bot~Folder&"/moo_settings.cfg"


setVar $totalGamePlanets 0
setVar $getPlanetSettingsReq 0


# SHOULD WE MOO THESE PRODUCTS? And what min levels starting to qualify
setVar $MOO_FUEL 1
setVar $MOO_ORGANICS 1
setVar $MOO_EQUIPMENT 1
setVar $FUEL_MIN_MOO 750
setVar $ORGANICS_MIN_MOO 500
setVar $EQUIPMENT_MIN_MOO 250




fileExists $mooFileChk $moo_setting_file
if ($mooFileChk = 1)
	
	setVar $i 1
	readToArray $moo_setting_file $moo_settings
	setArray $planet~planetList $moo_settings 5
	while ($i <= $moo_settings)
	    setVar $planet~planetInf $moo_settings[$i]
	    gosub :process_planet_line
	    setVar $planet~planetList[$i] $planet~planetName
	   
	    setVar $planet~planetList[$i][1] $planet~planet_CHECKED
	    setVar $planet~planetList[$i][2] $planet~planet_START_FUEL
	    setVar $planet~planetList[$i][3] $planet~planet_START_ORG
	    setVar $planet~planetList[$i][4] $planet~planet_START_EQUIP
	    setVar $planet~planetList[$i][5] $planet~planet_TRADE_PLANET
	    
	    add $i 1
	end
	setVar $totalGamePlanets $moo_settings
     

else
	
	loadvar $planet~planet_file
	gosub :PLANET~loadplanetInfo
	setVar $i 1

	# Fuel Org Equ
	while ($i <= $planet~planetcounter)
		
		# Class E, Red Rider Double Action BB Gun
		setVar $p $planet~planetList[$i]
		getWordPos $p $loc "Class"
		
		cutText $p $planet~planetname $loc 99
		write $moo_setting_file "0 0 0 0 0 " & $planet~planetname 
		setVar $planet~planetList[$i] $planet~planetName
		setVar $planet~planetList[$i][1] 0
		setVar $planet~planetList[$i][2] 0
		setVar $planet~planetList[$i][3] 0
		setVar $planet~planetList[$i][4] 0
		setVar $planet~planetList[$i][5] 0
		add $i 1
	end
	setVar $totalGamePlanets $planet~planetcounter

end






# NEED TO GET THIS FROM GAME  -THen ALLOW SAY 80% used by script
setVar $planet~planetSALLOWEDINGAME $game~MAX_PLANETS_IN_GAME
setVar $planet~planetSALLOWED (($planet~planetSALLOWEDINGAME * 90) / 100)



setVar $startingFighters 0
setVar $safeFighters 0

setVar $planet~planetsInSector 0
setVar $planet~planets 0
setVar $planet~planeti 1


setVar $percmintostart 90
setVar $dumpCashOnPlanet 25000000


setVar $sectors 0
setVar $sectorsOk 0
setVar $sectorsOki 1
setVar $sectorsOkProduct 0
setVar $sectorsOkPlanetID 0
setVar $planet~planetsWithProducts 0

setVar $sectorsNoFig 0
setVar $sectorsNoFigi 1


setVar $startSectors 0
setVar $starti 1

###### SORCING STUFF ######



# only go to ports with this much - depends on option we might do 'upgrade - 10k' or 'skim' pl
setVar $minTrade 900

if ($PrimaryProduct = 1)
	setVar $minOnPlanet $FUEL_MIN_MOO
elseif ($PrimaryProduct = 2)
	setVar $minOnPlanet $ORGANICS_MIN_MOO
elseif ($PrimaryProduct = 3)
	setVar $minOnPlanet $EQUIPMENT_MIN_MOO
end
gosub :player~quikstats

if ($player~photons > 0)
	setVar $SWITCHBOARD~message "Yeah Nah, we don't do this with photons.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

setVar $stardock $MAP~STARDOCK

if ($startingLocation = "Citadel")
	
	if ($player~credits > 2000000)
		send "tt" $player~credits "*tf2000000*"
	end
	
	send "q"
	goSub :planet~getPlanetInfo
	send "c"
	
	if ($efurb = TRUE)
		goSub :verifyOneTrader
		if ($traderCount <> 1)
			setVar $SWITCHBOARD~message "Needs to be one other trader in this citadel and it should be the person you are swapping with.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		goSub :verifyTraderPlanet
		send "'" $efurbBot " stopall*"
		waitfor " All non-system scripts and modules killed, and modes reset"
		if ($tradeLocked = 1)
			send "'" $efurbBot " unlock*"
			waitfor "Ship has been unlocked!"
		end
		send "'" $efurbBot " moofurb efurb*"
		waitfor "Furber: waiting for ship trade to trigger."
		send "qc"
	end

	if ($xfurb = TRUE)
		goSub :verifyTraderPlanet
		send "'" $efurbBot " stopall*"
		waitfor " All non-system scripts and modules killed, and modes reset"
	
		send "qc"
	end

	setVar $cashDumpPlanet $planet~planet
	setVar $cashDumpSector $PLAYER~CURRENT_SECTOR
	
	waitfor "Planet command"
	send "qmnt**tnt1**q"
	waitfor "lasting off from"

	goSub :player~quikstats
	setVar $startingFighters $player~FIGHTERS
	setVar $safeFighters $player~FIGHTERS/2
	#setVar $safeFighters 50000
	
	
end

setVar $readi 1


if ($mode = 1)
	goSub :sectorsFromPersonal 	
elseif ($mode = 2)
	goSub :sectorsFromPersonal 
	goSub :sectorsFromUpgraded
elseif ($mode = 3)
	goSub :sectorsFromPersonal 
	goSub :sectorsFromParam
elseif ($mode = 4)
	goSub :sectorsFromPersonal 
	goSub :sectorsFromEverything
elseif ($mode = 5)
	goSub :sectorsFromPersonal 
	goSub :sectorsFromFile
elseif ($mode = 6)
	setVar $sectors[$readi] $mooSector
	add $readi 1
end

gosub :getPortReports 
gosub :filterPortsAndReport

setVar $stat_targets ($sectorsOki - 1)


if (($player~ALIGNMENT < 1000) and ($skimMode <> true) and ($efurb <> true) and ($xfurb <> true))
	setVar $SWITCHBOARD~message "MooXmas - You're just not good enough for this script (alignment).*"
	gosub :SWITCHBOARD~switchboard
	halt
end

setVar $wasCleanupTop 0
send "v"
setTextLineTrigger gameplanets :gameplanets "planets exist in the universe,"
pause
	:gameplanets
	killAllTriggers
	getword CURRENTLINE $vplanets 1
	STRIPTEXT $vplanets ","
	if ($vplanets > $planet~planetSALLOWED)
		if ($cleanup = 3)
			setVar $wasCleanupTop 1
		end
		setVar $cleanup 2
	end


setVar $loopi 1
while ($loopi < $sectorsOki)
	setVar $sector $sectorsOk[$loopi]	
	
	setVar $returnSpotSafe 0
	if ($dumpCashOnPlanet > 0)
		gosub :player~quikstats
		if ($player~CREDITS > $dumpCashOnPlanet)
		   
		    setVar $player~warpto $cashDumpSector
		    gosub :player~twarp
		   	gosub :player~quikstats
			if ($player~CURRENT_SECTOR = $cashDumpSector)
				
				send "l" & $cashDumpPlanet&"* t n t 1 * C"
				send "TT"
				waitfor "credits, and the Treasury"
				setVar $line CURRENTLINE
				getWord $line $credsmade 3
				striptext $credsmade ","
				subtract $credsmade 1000000
				if ($credsmade >= 1)
				send $credsmade & "*"
				send "QQ"
				else
				send "*QQ"
				end
				waitfor "Blasting off from"
			else
				setVar $SWITCHBOARD~message "Failed to make it to cash dump sector - will continue on and try again next lap*"
				gosub :SWITCHBOARD~switchboard
			end
		end

		if ($restockMoveOn = TRUE) and ($loopi > 1)
			# Assumption is we finsihed with port at same time we ran out of "goods"
			goSub :restockMoveOnRestock
			if ($returnSpotSafe = 0)
				goTo :theEndNextSector
			end
		else
			if ($sector <> CURRENTSECTOR)
				setVar $PLAYER~warpto $sector
				gosub :player~twarp
				
				if ($PLAYER~twarpSuccess = FALSE)
					setVar $SWITCHBOARD~message "Failed to make it to next sector, continuing (could be ore of figs)*"
					gosub :SWITCHBOARD~switchboard
					goto :endloop
				
				end
			end
		end
	else
		if ($restockMoveOn = TRUE) and ($loopi > 1)
			# Assumption is we finsihed with port at same time we ran out of "goods"
			goSub :restockMoveOnRestock
			if ($returnSpotSafe = 0)
				goTo :theEndNextSector
			end
		else
			if ($sector <> CURRENTSECTOR)
				setVar $PLAYER~warpto $sector
				gosub :player~twarp
			end
		end
	end

	if ($mines = true)
		if ($player~ARMIDS >= 3)
			send "h 13*c "
			setSectorParameter $sector "MINESEC" 1
		end

		if ($player~LIMPETS >= 2)
			send "h 22* c "
			setSectorParameter $sector "LIMPSEC" 1
		end
	end

	setVar $noPlanetsInSector 1
	setVar $safeToBlow 1
	gosub :checkSafeToBlow
	if ($safeToBlow = 0)
		echo "*#########################################"
		echo "* ### CITADELS DETECTED SKIPPING BOOMS ###"
		echo "*#########################################"
		setVar $SWITCHBOARD~message "Warning: Citadel in sector, skipping.*"
		gosub :SWITCHBOARD~switchboard
		goto :endloop
	end
	
	# we are here, lets trade it!
	goSub :createAndSell
	


	:theEndNextSector

	gosub :player~quikstats

	if ($player~TURNS < $turn_limit)
		setvar $switchboard~message "Hit our turn limited; stopping.*"
		gosub :switchboard~switchboard
		goto :goHomeandhalt
		
	end
	
	goSub :updateStats
	:endloop
	add $loopi 1
	
end

:goHomeandhalt
	if ($cashDumpSector > 0)
		send "* * * "
		setVar $PLAYER~warpto $cashDumpSector
		gosub :player~twarp
		
	end
	if ($startingLocation = "Citadel")
		send "l" & $cashDumpPlanet&"* t n t 1 * C"
		send "TT"
		waitfor "credits, and the Treasury"
		setVar $line CURRENTLINE
		getWord $line $credsmade 3
		striptext $credsmade ","
		subtract $credsmade 500000
		if ($credsmade >= 1)
			send $credsmade & "*"
		else
			send "*"
		end
	end
	setvar $switchboard~message "Mooooooooooo Mooooooooooo Done.*"
	gosub :switchboard~switchboard
halt





:createAndSell

	goSub :resetPlanetsUsed
	
	if ($hazSlots > 0)
		setVar $hazPlanetNumber ($preferredPlanetSlot + $hazSlots)
		setVar $workingPlanetSlot ($preferredPlanetSlot + $hazSlots)
	else
		setVar $workingPlanetSlot $preferredPlanetSlot
	end
	setVar $planet~planetsInSector 0
	setVar $planet~planets 0
	setVar $planet~planetNames 0
	setVar $planet~planeti 1

	setVar $checkNewPlanet 0
	setVar $initPlanets 0

	if ($noPlanetsInSector = 0)
		goSub :reCheckPlanets
		setVar $initPlanets $planet~planetsInSector
		goSub :checkPlanetNames
	end

	setVar $go 1

	setVar $planet~planetsInSectorCHK $planet~planetsInSector

	# Before loop lets see if we have anything to sell first and then skip to port check
	if ($sectorsOkPlanetID[$loopi] > 0)
		setVar $tradePlanet $sectorsOkPlanetID[$loopi]
		goto :skipToTrade
	elseif ($planet~planetsWithProducts[$sector] > 0)
		setVar $tradePlanet $planet~planetsWithProducts[$sector]
		goto :skipToTrade
		setVar $sectorsOkPlanetID[$sector] 0
	end

	while ($go = 1)
		# ENSURE PREFERRED SLOT IS FREE 

		if ($planet~planetsInSectorCHK >= $workingPlanetSlot)
			if ($hazSlots > 0)
				
				if ($workingPlanetSlot = $hazPlanetNumber)

					# return preferred planets
					setVar $workingPlanetSlot ($workingPlanetSlot - $hazSlots)
					setVar $slotToBlow $hazPlanetNumber
					setVar $checkNewPlanet 0

					while ($slotToBlow >= $workingPlanetSlot)
						goSub :reCheckPlanets
						setVar $removePlanetName $planet~planetNames[$slotToBlow]
						goSub :removePlanet
						setVar $shipBlastPlanet $planet~planets[$slotToBlow]
						gosub :blastPlanet
						subtract $slotToBlow 1
					end
					goSub :reCheckPlanets
					setVar $planet~planetsInSectorCHK $planet~planetsInSector
				else
					setVar $checkNewPlanet 0
					goSub :reCheckPlanets
					setVar $removePlanetName $planet~planetNames[$workingPlanetSlot]
					goSub :removePlanet
					setVar $shipBlastPlanet $planet~planets[$workingPlanetSlot]
					
					gosub :blastPlanet
					setVar $checkNewPlanet 0
					goSub :reCheckPlanets
					setVar $planet~planetsInSectorCHK $planet~planetsInSector
				end
			else
				setVar $checkNewPlanet 0
				goSub :reCheckPlanets
				setVar $removePlanetName $planet~planetNames[$workingPlanetSlot]
				goSub :removePlanet
				setVar $shipBlastPlanet $planet~planets[$workingPlanetSlot]
				gosub :blastPlanet
				setVar $checkNewPlanet 0
				goSub :reCheckPlanets
				setVar $planet~planetsInSectorCHK $planet~planetsInSector
			end
		end
		
		# CREATE A PLANET
		setVar $getPlanetSettingsReq 0
		setVar $goodPlanet 0
		
		goSub :makeAPlanet
		
		if ($getPlanetSettingsReq > 0)
			setVar $checkNewPlanet 1
			goSub :reCheckPlanets
			setVar $checkNewPlanet 0
			setVar $checkPlanet $newPlanetMade
			goSub :updateMooPlanet
			if ($goodPlanet = 1)
				# We know planet number from re-checking planets to test it
				setVar $tradePlanet $newPlanetMade
			end
		end

		# DID WE MAKE A GOOD ONE?
		if ($goodPlanet = 1)
			add $planet~planetsPoppedGood 1
			# if we just checked the new planet then we can skip this
			if ($getPlanetSettingsReq = 0)
				# FIND NEW PLANET NUMBER
				setVar $newPlanetMade 0
			#h	setVar $checkNewPlanet 1
			#h	goSub :reCheckPlanets
			#h	setVar $checkNewPlanet 0
			#h	setVar $tradePlanet $newPlanetMade
				setVar $tradePlanet $newPlanetName

			end
	
			:skipToTrade
			# PLANET TRADE	
			setVar $tradeOre 0
			setVar $tradeOrg 0
			setVar $tradeEquip 0
		
			gosub :planetTrade
			
			
			
			:sellDonePort
			send "cr*q"
			waitfor "<Computer deactivated>"
			if ($PrimaryProduct = 1)
				setVar $prodPerc PORT.PERCENTFUEL[CURRENTSECTOR]
			elseif ($PrimaryProduct = 2)
				setVar $prodPerc PORT.PERCENTORG[CURRENTSECTOR]
			elseif ($PrimaryProduct = 3)
				setVar $prodPerc PORT.PERCENTEQUIP[CURRENTSECTOR]
			end
	

			if ($prodPerc <= $tradingMinProduct)
				setVar $go 0
			end
			
			# mode = 1 means we are skimming and not busting new ones.. however we might want to change this
			if (($mode = 1) and ($skimMode = 1))
				setVar $go 0
			end

		end

		if ($restockMoveOnGo = 1)
			setVar $restockMoveOnGo 0
			setVar $go 0
		end		

	end
	

	# Sector Clean up

	# if we are above the 90% planets then auto cleanup
	if ($tradePlanet > $planet~planetSALLOWED)
		if ($cleanup = 3) 
// initPlanets
			setVar $wasCleanupTop 1
		end
		setVar $cleanup 2
	else
		setVar $cleanup $userCleanup
	end


	if ($cleanup > 0)
		goSub :reCheckPlanets
		setVar $planet~planetsToBlow 0
		setVar $figsRequired 0
		setVar $i 1
		while ($i <= $planet~planetsInSector)
			
				
			if ($planet~planets[$i] <> $tradePlanet)
				add $planet~planetsToBlow 1
				add $figsRequired (100 * $planet~planetsToBlow)
			elseif ($cleanup = 2) or ($cleanup = 3)
				add $planet~planetsToBlow 1
				add $figsRequired ($figsRequired + (100 * $planet~planetsToBlow))
			end 
			add $i 1
		end
		# little safety margin
		add $figsRequired ($figsRequired + 101)
		if ($figsRequired > $player~FIGHTERS)
				
			echo "*#########################################"
			echo "* ### Not enough figs For Clean up, theoritically you could go boom! ###"
			echo "*#########################################"
			setVar $SWITCHBOARD~message "Warning: Fighters low, can not do cleanup.*"
			gosub :SWITCHBOARD~switchboard
			
			halt
		end
		setVar $i 1


		if ($cleanup = 3)
			# FIRE HARDCODE
			#subtract $planet~planetsInSector $GAME~MAX_PLANETS_PER_SECTOR
			setVar $i ($GAME~MAX_PLANETS_PER_SECTOR + 1)
		elseif ($wasCleanupTop = 1)
			setVar $i ($initPlanets + 1)
		end
		echo "$planet~planetsInSector " $planet~planetsInSector "*"
		echo "$planet~planetsInSector " $planet~planetsInSector "*"
		
		while ($i <= $planet~planetsInSector)
			
				
			if ($planet~planets[$i] <> $tradePlanet)
				
				setVar $shipBlastPlanet $planet~planets[$i]
				gosub :blastPlanet
			elseif ($cleanup = 2) or ($cleanup = 3)
				setVar $shipBlastPlanet $tradePlanet
				gosub :blastPlanet
			end 
			
			
			add $i 1
		end
	end
	
	
return



:reCheckPlanets

	if ($checkNewPlanet = 11)

		setVar $prevPlanetsInSector 0
		setVar $prevPlanets 0
		setVar $prevPlaneti 1
		while ($prevPlaneti <= $planet~planetsInSector)
			
			setVar $prevPlanets[$prevPlaneti] $planet~planets[$prevPlaneti]
			add $prevPlanetsInSector 1
			add $prevPlaneti 1
		end
	end
	
	setVar $planet~planetsInSector 0
	setVar $planet~planets 0
	setVar $planet~planeti 1
	send "l*"
	setVar $startLogging 0
	:reCheckPlanetsT
	setTextLineTrigger reCheckPlanetsT1 :reCheckPlanetsT1 "There isn't a planet in this sector."
	setTextLineTrigger reCheckPlanetsstart :reCheckPlanetsstart "------------------------------------------------------------------------------"
	setTextLineTrigger reCheckPlanetsT2 :reCheckPlanetsT2 "<"
	setTextTrigger reCheckPlanetsT3 :reCheckPlanetsT3 "Land on which planet"
	pause
	:reCheckPlanetsstart
		killAllTriggers
		setVar $startLogging 1
		goto :reCheckPlanetsT
	:reCheckPlanetsT1
		killAllTriggers

		waitfor "Command ["
		return
	:reCheckPlanetsT2
		killAllTriggers 
		if ($startLogging = 1)
			
			
			getWord CURRENTLINE $cPlanetNum 1
			if ($cPlanetNum = "Land")
				goto :reCheckPlanetsT3
			elseif ($cPlanetNum = "<")
				getWord CURRENTLINE $cPlanetNum 2
				stripText $cPlanetNum ">"
			else
				stripText $cPlanetNum ">"
				stripText $cPlanetNum "<"
			end
			cutText CURRENTLINE $planetname 11 37

			trim $planetname
			if ($planetname = $newPlanetName)
				setVar $newPlanetMade $cPlanetNum
			end
			add $planet~planetsInSector 1
			setVar $planet~planets[$planet~planeti] $cPlanetNum
			setVar $planet~planetNames[$planet~planeti] $planetname
			
			add $planet~planeti 1
		end
		goto :reCheckPlanetsT

	:reCheckPlanetsT3
		killAllTriggers
		waitfor "Command ["

	if ($checkNewPlanet = 11)
		setVar $planet~planeti 1
		while ($planet~planeti <= $planet~planetsInSector)
			setVar $searchPlanet $planet~planets[$planet~planeti]
			setVar $searchi 1
			setVar $found 0

			while ($searchi <= $prevPlanetsInSector)
				if ($prevPlanets[$searchi] = $searchPlanet)
					setVar $found 1
				end
				add $searchi 1
			end
			if ($found = 0)
				setVar $newPlanetMade $searchPlanet
			end
			add $planet~planeti 1
		end
	end

return




:updateMooPlanet
	
	send "l" $checkPlanet "*"
	gosub :PLANET~getPlanetInfo
	send "q"
	setVar $MooThePlanet 0



	setVar $planet~planetList[$planet~planetIndexFound][1] 1
	setVar $planet~planetList[$planet~planetIndexFound][2] $planet~planet_FUEL
	setVar $planet~planetList[$planet~planetIndexFound][3] $planet~planet_ORGANICS
	setVar $planet~planetList[$planet~planetIndexFound][4] $planet~planet_EQUIPMENT

	if (($planet~planet_FUEL >= $FUEL_MIN_MOO) and ($MOO_FUEL = 1))
		setVar $MooThePlanet 1
	end
	if (($planet~planet_ORGANICS >= $ORGANICS_MIN_MOO) and ($MOO_ORGANICS = 1))
		setVar $MooThePlanet 1
	end
	if (($planet~planet_EQUIPMENT >= $EQUIPMENT_MIN_MOO) and ($MOO_EQUIPMENT = 1))
		setVar $MooThePlanet 1
	end
	setVar $planet~planetList[$planet~planetIndexFound][5] $MooThePlanet
	
	if ($MooThePlanet = 1)
		goSub :checkGoodPlanet
	end
	goSub :rewriteMooSettings
	

return

:checkGoodPlanet
	

	if (($planet~planetList[$planet~planetIndexFound][2] > $FUEL_MIN_MOO) and ($MOO_FUEL = 1))
		if ((PORT.BUYFUEL[CURRENTSECTOR] = 1) and (PORT.PERCENTFUEL[CURRENTSECTOR] > $tradingMinProduct))
			setVar $goodPlanet 1
		end
	end
	if (($planet~planetList[$planet~planetIndexFound][3] > $ORGANICS_MIN_MOO) and ($MOO_ORGANICS = 1))
		if ((PORT.BUYORG[CURRENTSECTOR] = 1) and (PORT.PERCENTORG[CURRENTSECTOR] > $tradingMinProduct))
			setVar $goodPlanet 1
		end
	end
	if (($planet~planetList[$planet~planetIndexFound][4] > $EQUIPMENT_MIN_MOO) and ($MOO_EQUIPMENT = 1))
		if ((PORT.BUYEQUIP[CURRENTSECTOR] = 1) and (PORT.PERCENTEQUIP[CURRENTSECTOR] > $tradingMinProduct))
			setVar $goodPlanet 1
		end
	end
return


:makeAPlanet
	goSub :getPlanetName

	if ($player~GENESIS = 0)
		goto :buildPlanet1
	end
	:updatePlanetsFinishWait
	setVar $goodPlanet 0
	if ($planet~planetsInSectorCHK >= $GAME~MAX_PLANETS_PER_SECTOR)
		send "u y n " $newPlanetName "* z p * "
	else
		send "u y " $newPlanetName "* z p * "
	end
	:buildPlanet
	setTextLineTrigger buildPlanet1 :buildPlanet1 "You don't have any Genesis Torpedoes to launch!"
	setTextLineTrigger buildPlanet2 :buildPlanet2 "For building this planet you receive"
	pause
	:buildPlanet1
		killAllTriggers
		#send "*"
		if ($restockMoveOn = TRUE)
			setVar $restockMoveOnGo 1
			return
		else
			gosub :restock
			goto :updatePlanetsFinishWait
		end

	:buildPlanet2
		killAllTriggers
		subTract $player~GENESIS 1
		add $stat_torps 1
		add $planet~planetsInSectorCHK 1
		add $planet~planetsPopped 1
		
		setVar $planet~planetIndexFound 0
		setVar $t 1
		while ($t <= $totalGamePlanets)
			setTextLineTrigger $t :MakePlanetLbl & $t $planet~planetList[$t]
			add $t 1
		end
		pause
		:MakePlanetLbl1
			setVar $planet~planetIndexFound 1
			goto :endMakePlanetLbls
		:MakePlanetLbl2
			setVar $planet~planetIndexFound 2
			goto :endMakePlanetLbls
		:MakePlanetLbl3
			setVar $planet~planetIndexFound 3
			goto :endMakePlanetLbls
		:MakePlanetLbl4
			setVar $planet~planetIndexFound 4
			goto :endMakePlanetLbls
		:MakePlanetLbl5
			setVar $planet~planetIndexFound 5
			goto :endMakePlanetLbls
		:MakePlanetLbl6
			setVar $planet~planetIndexFound 6
			goto :endMakePlanetLbls
		:MakePlanetLbl7
			setVar $planet~planetIndexFound 7
			goto :endMakePlanetLbls
		:MakePlanetLbl8
			setVar $planet~planetIndexFound 8
			goto :endMakePlanetLbls
		:MakePlanetLbl9
			setVar $planet~planetIndexFound 9
			goto :endMakePlanetLbls
		:MakePlanetLbl10
			setVar $planet~planetIndexFound 10
			goto :endMakePlanetLbls
		:MakePlanetLbl11
			setVar $planet~planetIndexFound 11
			goto :endMakePlanetLbls
		:MakePlanetLbl12
			setVar $planet~planetIndexFound 12
			goto :endMakePlanetLbls
		:MakePlanetLbl13
			setVar $planet~planetIndexFound 13
			goto :endMakePlanetLbls
		:MakePlanetLbl14
			setVar $planet~planetIndexFound 14
			goto :endMakePlanetLbls
		:MakePlanetLbl15
			setVar $planet~planetIndexFound 15
			goto :endMakePlanetLbls
		:MakePlanetLbl16
			setVar $planet~planetIndexFound 16
			goto :endMakePlanetLbls
		:MakePlanetLbl17
			setVar $planet~planetIndexFound 17
			goto :endMakePlanetLbls
		:MakePlanetLbl18
			setVar $planet~planetIndexFound 18
			goto :endMakePlanetLbls
		:MakePlanetLbl19
			setVar $planet~planetIndexFound 19
			goto :endMakePlanetLbls
		:MakePlanetLbl20
			setVar $planet~planetIndexFound 20
			goto :endMakePlanetLbls

		:endMakePlanetLbls

		if ($planet~planetList[$planet~planetIndexFound][1] = 0)
			setVar $getPlanetSettingsReq $planet~planetIndexFound
		else
			if ($planet~planetList[$planet~planetIndexFound][5] = 1)
				goSub :checkGoodPlanet
			end

		end


			
return



:checkDockThere

	send "cr" $stardock "*q"
	waitfor "Computer activated"
	setTextLineTrigger checkDockThereYes :checkDockThereYes "Commerce report for"
	setTextLineTrigger checkDockThereNo :checkDockThereNo "Computer deactivated"
	pause
	:checkDockThereNo
		killalltriggers
		setvar $switchboard~message "Stardock is blown up!! Aborting restock.*"
		gosub :switchboard~switchboard
		setvar $switchboard~message "Suggest enemy is waiting at dock; suggest combat mission*"
		gosub :switchboard~switchboard
		goto :goHomeandhalt
		halt

	:checkDockThereYes
		killalltriggers


return

:restockMoveOnRestock

	gosub :player~quikstats
	
	if (($player~ore_holds < $minOre) and (PORT.BUYFUEL[CURRENTSECTOR] = 0))
		send "pt * * * "
		waitfor "Your offer ["
	end

	setVar $prestockcredits $player~credits
	stripText $precredits ","
	
	send "d"
	waitfor "Warps to Sector(s) :"
	setVar $returnSpotSafe 0
	

	setVar $foundAdj 0
	setVar $adj 1
	while ($adj <= SECTOR.WARPCOUNT[CURRENTSECTOR])
		if (SECTOR.WARPS[CURRENTSECTOR][$adj] = $sector)
			send "sh"
			waitfor "Select (H)olo Scan"
			waitfor "Command ["
			getSectorParameter $sector "FIGSEC" $isFigged
			setVar $foundAdj 1
			if ($isFigged = 1)
				setVar $returnSpotSafe 1
			end
		end
		add $adj 1
	end
	
	if ($returnSpotSafe = 0) and ($foundAdj = 1)
		return
	elseif ($returnSpotSafe = 0)
		send "m" $sector "*yn"
		setTextLineTrigger returnSafeCheckYes :returnSafeCheckYes "Locating beam pinpointed, TransWarp"
		setTextLineTrigger returnSafeCheckNo :returnSafeCheckNo "Do you want to make this jump blind?"
		pause
		:returnSafeCheckNo
			killalltriggers
			return
		:returnSafeCheckYes
			killalltriggers
			setVar $returnSpotSafe 1
	end
	setVar $returnSpot $sector

	add $stat_refurbs 1

	#same logic applys to all furbing?
	if ($efurb = TRUE)
		goSub :restock_efurb
	elseif ($xfurb = TRUE)
		goSub :restock_xfurb
	else
		goSub :restock_self
	end

	setVar $poststockcredits $player~credits
	stripText $poststockcredits ","
	setVar $stat_dollarsspent ($precredits - $poststockcredits)


return


:restock
	
	gosub :player~quikstats
	
	if (($player~ore_holds < $minOre) and (PORT.BUYFUEL[CURRENTSECTOR] = 0))
		send "pt * * * "
		waitfor "Your offer ["
	end


	setVar $prestockcredits $player~credits
	stripText $precredits ","

	send "d"
	waitfor "Warps to Sector(s) :"

	setVar $returnSpot CURRENTSECTOR

	add $stat_refurbs 1

	if ($efurb = TRUE)
		goSub :restock_efurb
	elseif ($xfurb = TRUE)
		goSub :restock_xfurb
	else
		goSub :restock_self
	end

	setVar $poststockcredits $player~credits
	stripText $poststockcredits ","
	setVar $stat_dollarsspent ($precredits - $poststockcredits)


return

:restock_xfurb

	setVar $player~warpto $cashDumpSector
	gosub :player~twarp
	
	setVar $playerShip $player~SHIP_NUMBER
	send "l" & $cashDumpPlanet&"* t n t 1 * m * * * C"
	send "TT"
	waitfor "credits, and the Treasury"
	setVar $line CURRENTLINE
	getWord $line $credsmade 3
	striptext $credsmade ","
	subtract $credsmade 1000000
	if ($credsmade >= 1)
		send $credsmade & "*"
	else
		send "*"
	end
	send "^q"
	waitfor ": ENDINTERROG"
	gosub :player~quikstats
	setVar $cship $player~SHIP_NUMBER

	send "q q x j " $xfurbShip "* q * l" $cashDumpPlanet "* tnt1 * c "
	gosub :player~quikstats
	if ($xfurbShip <> $player~SHIP_NUMBER)
		setVar $SWITCHBOARD~message "Failed to switch ships after furb.*"
		gosub :SWITCHBOARD~switchboard
		halt
	else
		send "'" $efurbBot " moofurb xfurb " $cship "*"
	end
	setVar $xfurbShip $cship

	gosub :player~quikstats

	if ($player~GENESIS < 5)
		setvar $switchboard~message "XPort Furb Fail - New ship has les than 5 torps*"
		gosub :switchboard~switchboard
		halt
	end

	send "QQ"
	waitfor "Blasting off from"
	
	setVar $player~warpto $returnSpot
	gosub :player~twarp
	gosub :player~quikstats
	if ($player~CURRENT_SECTOR <> $returnSpot)

		setvar $switchboard~message "We didn't make it back post exchange furb*"
		gosub :switchboard~switchboard
		halt
	end
return


:restock_efurb

	setVar $player~warpto $cashDumpSector
	gosub :player~twarp
	
	setVar $playerShip $player~SHIP_NUMBER
	send "l" & $cashDumpPlanet&"* t n t 1 * m * * * C"
	send "TT"
	waitfor "credits, and the Treasury"
	setVar $line CURRENTLINE
	getWord $line $credsmade 3
	striptext $credsmade ","
	subtract $credsmade 1000000
	if ($credsmade >= 1)
		send $credsmade & "*"
	else
		send "*"
	end
	send "^q"
	waitfor ": ENDINTERROG"
	goSub :verifyOneTrader
	
	if ($traderCount <> 1)
		setVar $SWITCHBOARD~message "Needs to be one other trader in this citadel and it should be the person you are swapping with.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	send "ey n n n * * "

	gosub :player~quikstats
	
	if ($player~SHIP_NUMBER = $playerShip)
		setvar $switchboard~message "Exchange Furb Fail - still in same ship; where's my bot!!!*"
		gosub :switchboard~switchboard
		
		halt
	end
	if ($player~GENESIS < 5)
		setvar $switchboard~message "Exchange Furb Fail - New ship has les than 5 torps*"
		gosub :switchboard~switchboard
		halt
	end

	send "QQ"
	waitfor "Blasting off from"
	
	setVar $player~warpto $returnSpot
	gosub :player~twarp
	gosub :player~quikstats
	if ($player~CURRENT_SECTOR <> $returnSpot)

		setvar $switchboard~message "We didn't make it back post exchange furb*"
		gosub :switchboard~switchboard
		halt
	end
return

:restock_self
	if ($player~FIGHTERS < $safeFighters)
		
		setVar $player~warpto $cashDumpSector
		gosub :player~twarp

		send "l" & $cashDumpPlanet&"*mnt*tnt1*q"
		
		waitfor "Blasting off from"
		
	end
	
	goSub :checkDockThere
	
	
	
	
	setVar $restockMakePlanet 0
	if ($useGuard = true)
		
		setVar $planet~planetFound 0
		goSub :checkCorpPlanet
		if ($planet~planetFound = 0)
			setVar $restockMakePlanet 1
		else
			setVar $restockMakePlanet 0
		end

	end

	send "m" $stardock "*y"
	waitfor "Locating beam pinpointed, TransWarp"
	send "y p s"
	goSub :limpetCheck
	send "h"
		send "t"
		setTextTrigger shipCheckBuyTorps :shipCheckBuyTorps "How many Genesis Torpedoes do you want"
		pause
		:shipCheckBuyTorps
			killalltriggers
			getWord CURRENTLINE $TorpssAvail 9
			stripText $TorpssAvail ")"
			
			send $TorpssAvail "*"

		send "a"
		setTextTrigger shipCheckBuyAtomics :shipCheckBuyAtomics "How many Atomic Detonators do you want"
		pause
		:shipCheckBuyAtomics
			killalltriggers
			getWord CURRENTLINE $player~atomicssAvail 9
			stripText $player~atomicssAvail ")"
			if ($player~atomicssAvail = 0)
				echo "*### we have a problem, no Atomics purchasable waiting for next"
				#waitfor "next@"
				send "*"
			else
				send  "*a" $player~atomicssAvail "*"
			end
		
		if ($mines = TRUE)
			if ($player~limpets < 100)
				send "l"
				setTextTrigger doBuyLimps :doBuyLimps "How many mines do you want"
				pause
				:doBuyLimps
					getWord CURRENTLINE $limps 8
					stripText $limps ")"
					if ($limps > 50)
						setVar $limps 50
					end
					send $limps "*"
			end
			if ($player~ARMIDS < 100)
				send "m"
				setTextTrigger doBuyArmids :doBuyArmids "How many mines do you want"
				pause
				:doBuyArmids
					getWord CURRENTLINE $armids 8
					stripText $armids ")"
					if ($armids > 50)
						setVar $armids 50
					end
					send $armids "*"
			end
			
		end
		
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
				setVar $player~shieldsToBuy $player~credits
				subtract $player~shieldsToBuy 250000
				divide $player~shieldsToBuy $shieldPrice
				
				if ($player~shieldsToBuy > $canBuy)
					setVar $player~shieldsToBuy $canBuy
				end
				send "c" $player~shieldsToBuy "*"
		gosub :player~quikstats
		setVar $postFurbFigs $player~fighters	
	setVar $exitMacro "qqq    *   "
	
	if ($restockMakePlanet = 1)
		 
		setVar $exitMacro $exitMacro & "u   y  n  .  n  *  c * *  "
	end
	
	setVar $exitMacro $exitMacro & "m  " & $returnSpot &  "*   y   y  "
	send $exitMacro

	setTextLineTrigger restockBack1 :restockBack1 "<Set NavPoint>"
	setTextLineTrigger restockBack2 :restockBack2  "Systems Ready, shall we engag"
	pause
		:restockBack1
			killalltriggers
			send "q * Q * * pss"
			setVar $SWITCHBOARD~message "Failed to leave dock!! Hopefully on dock..*"
			gosub :SWITCHBOARD~switchboard
			halt	

		:restockBack2
			killalltriggers
	
	gosub :player~quikstats
	if ($player~fighters < $postFurbFigs)
		setVar $diff ($postFurbFigs - $player~fighters)
		setVar $SWITCHBOARD~message "I took fig damage (" & $diff & ") exiting dock!! and I probably don't even know it.*"
		gosub :SWITCHBOARD~switchboard
		if ($furbfigs = FALSE)
			setVar $furbfigs TRUE
		end
	end
		
	
return





:limpetCheck
		setTextTrigger limpetchecky :limpetchecky "A port official runs"
		setTextTrigger limpetcheckn :limpetcheckn "StarDock> Where to?"
		setTextTrigger dockgone1 :dockgone1 "Scanners indicate massive debris and heavy"
		setTextTrigger dockgone2 :dockgone2 "aptain! Are you sure you want to port her"
		
		pause
		:dockgone1
		:dockgone2
			send " n * * *  n 1 y y "
			echo "*############################################"
			echo "*############################################"
			echo "*#### DOCK HE GONE... GONE GONE GONE halting.."
			echo "*############################################"
			echo "*############################################"
			halt
			

		:limpetchecky
			killalltriggers
			send "y"
			return
		:limpetcheckn
			killalltriggers
			return

return




:planetTrade
	
	
	gosub :player~quikstats
	setVar $precredits $player~credits
	stripText $precredits ","

	if ($useEp = TRUE)
		goSub :planetTrade_ep
	else
		goSub :planetTrade_ck
	end

	gosub :player~quikstats
	stripText $player~credits ","
	setVar $player~creditsNow $player~credits

	subtract $player~creditsNow $precredits
	add $stat_dollarsgross $player~creditsNow
	
	if (($player~ore_holds < $minOre) and (PORT.BUYFUEL[CURRENTSECTOR] = 0))
		send "pt * * * "
		waitfor "credits and"
	end


return

:planetTrade_ck_test
	setVar $planet~fueltosell 67000
	setVar $planet~orgtosell 67000
	setVar $planet~equiptosell 67000
	setVar $planet~_ck_ptradesetting $GAME~ptradesetting
	setVar $planet~planet "..x."
	setVar $planet~quantityUnknown 1

	if ($player~ore_holds < $minOre)
		send "l" $tradePlanet "* t n t1* * q * "
		waitfor "Planet command ("
		waitfor "Command ["
	end
	
	goSub :planet~sell
	
	if ($planet~exit_message <> 0)
		send "'" $planet~exit_message "*"
	end
	gosub :player~quikstats
	
return

:planetTrade_ck
  

	setVar $planet~fueltosell 67000
	setVar $planet~orgtosell 67000
	setVar $planet~equiptosell 67000
	setVar $planet~_ck_ptradesetting $GAME~ptradesetting
	setVar $planet~planet $tradePlanet
	setVar $planet~quantityUnknown 1

	if ($player~ore_holds < $minOre)
		isNumber $number $tradePlanet
		if ($number = 0)
			goSub :reCheckPlanets
			setVar $tradePlanet $newPlanetMade
		end
		send "l" $tradePlanet "* t n t1* * q * "
		waitfor "Planet command ("
		waitfor "Command ["
	end

	send "|"
	goSub :planet~sell
	send "|"

	setVar $tradePlanet $planet~planet 

	if ($planet~exit_message <> 0)
		#send "'" $planet~exit_message "*"
	end
	gosub :player~quikstats
	stripText $player~credits ","
	setVar $player~creditsNow $player~credits
	if ($player~creditsNow = $precredits)
		echo "*################*##############"
		echo "*#### NEG FAILED, SELLING AT COST!"
		echo "*###############################"

	
		send "q q q * * *  p n" $tradePlanet "* * * * * * * ^q"
		waitfor "ENDINTERROG"
		gosub :player~quikstats
		stripText $player~credits ","
		setVar $player~creditsNow $player~credits
	end
		
return


:planetTrade_ck_old

	send "l" $tradePlanet "*"
	
	setTextLineTrigger tradePlanetLand1 :tradePlanetLand1 "That planet is not in this sector."
	setTextLineTrigger tradePlanetLand2 :tradePlanetLand2 "ding sequence engaged"
	pause
	:tradePlanetLand1
		killAllTriggers
echo "*### PLANET FOUND! WE COUNTED WRONG SOMEWHERE"
		halt
		
		
	:tradePlanetLand2
		killAllTriggers
	Waitfor "-------  ---------  ---------  ---------  ---------  ---------  ---------"
	if ($player~ore_holds < $minOre)
		send "tnt1*"
		waitfor "free cargo holds."
		send "d"
		Waitfor "-------  ---------  ---------  ---------  ---------  ---------  ---------"
	end


	setTextLineTrigger tradePlanetLand3 :tradePlanetLand3 "Fuel Ore"
	setTextLineTrigger tradePlanetLand4 :tradePlanetLand4 "Organics"
	setTextLineTrigger tradePlanetLand5 :tradePlanetLand5 "Equipment"
	setTextTrigger tradePlanetLand6 :tradePlanetLand6 "Planet command ("
	pause
		:tradePlanetLand3
			killTrigger :tradePlanetLand3
			getWord CURRENTLINE $availOre 6
			striptext $availOre ","
			if ($availOre = 0)
				setVar $tradeOre "-1"
			end
		
			pause
		:tradePlanetLand4
			killTrigger :tradePlanetLand4
			getWord CURRENTLINE $availOrg 5
			striptext $availOrg ","
			if ($availOrg = 0)
				setVar $tradeOrg "-1"
			end
			pause
		:tradePlanetLand5
			killTrigger :tradePlanetLand5
			getWord CURRENTLINE $availEquip 5
			striptext $availEquip ","
			if ($availEquip = 0)
				setVar $tradeEquip "-1"
			end
			pause
		:tradePlanetLand6
			killAllTriggers
			if ($tradeOre = 0)
				setVar $tradeOre $availOre
			end
			if ($tradeOrg = 0)
				setVar $tradeOrg $availOrg
			end
			if ($tradeEquip = 0)
				setVar $tradeEquip $availEquip
			end
			
		setVar $planet~_ck_pnego_fueltosell $tradeOre
		setVar $planet~_ck_pnego_orgtosell $tradeOrg
		setVar $planet~_ck_pnego_equiptosell $tradeEquip
		
		gosub :player~quikstats

		gosub :planet~planetNeg


		gosub :player~quikstats
		stripText $player~credits ","
		setVar $player~creditsNow $player~credits
		if ($player~creditsNow = $precredits)
			echo "*################*##############"
			echo "*#### NEG FAILED, SELLING AT COST!"
			echo "*###############################"

		
			send "q p n" $tradePlanet "* * * * * * * l" $tradePlanet "*"
			waitfor "Land on which planet"
			gosub :player~quikstats
			stripText $player~credits ","
			setVar $player~creditsNow $player~credits
		end
		
		send "q"

return


:planetTrade_ep


	if ($player~ore_holds < $minOre)
		send "l" $tradePlanet "*"
		send "tnt1*"
		waitfor "free cargo holds."
		send "d"
		Waitfor "-------  ---------  ---------  ---------  ---------  ---------  ---------"
		send "q"
	end


	send "pn" $tradePlanet "*"
	waitfor "Negotiate Planetary TradeAgreement"
	:startplanetTrade_ep
	setTextLineTrigger weAreBuying :weAreBuying "We are buying up to "
	setTextTrigger weAreDone :weAreDone "(?=Help)?"
	pause
	:weAreBuying
		killalltriggers
		send "*"
		waitfor "Agreed, "
		setTextLineTrigger sellempty2 :sellempty2 "You have"
		setDelayTrigger epsellwait2 :epsellwait2 7000
		pause
		:epsellwait2
			killalltriggers
			
			setvar $switchboard~message "Ep Haggle timed out on Haggle*"
			gosub :switchboard~switchboard
			send "*"
		
		:sellempty2
			killalltriggers
		goto :startplanetTrade_ep
	
	:weAreDone
		killalltriggers
		
	gosub :player~quikstats
	stripText $player~credits ","
	setVar $player~creditsNow $player~credits
	if ($player~creditsNow = $precredits)
		echo "*################*##############"
		echo "*#### NEG FAILED, SELLING AT COST!"
		echo "*###############################"

		send "p n" $tradePlanet "* * * * * * * "
		waitfor "Your offer "
		gosub :player~quikstats
		stripText $player~credits ","
		setVar $player~creditsNow $player~credits
	end
	

return



:updateStats
	setVar $stat_dollarsnet ($stat_dollarsgross - $stat_dollarsspent)
	setVar $stat_turnsUsed ($startturns - $player~turns)

	add $updateCount 1
	if ($updateCount > 20)
		setVar $updateCount 1
		format $stat_dollarsnet $stat_dollarsnet_formatted NUMBER
		format $stat_turnsUsed $stat_turnsUsed_formatted NUMBER
		send "'Moo Update - Planets: " $planet~planetsPoppedGood "/" $planet~planetsPopped " Cash: " $stat_dollarsnet_formatted " in " $stat_turnsUsed_formatted " Turns*"
	end
return



:checkSafeToBlow
	
	send "lq*"


	:checkSafeToBlowStart
		setTextLineTrigger checkSafeToBlowNoPlanet :checkSafeToBlowNoPlanet "There isn't a planet in this sector."
		setTextLineTrigger checkSafeToBlowCit1 :checkSafeToBlowCit1 "Level 1"
		setTextLineTrigger checkSafeToBlowCit2 :checkSafeToBlowCit2 "Level 2"
		setTextLineTrigger checkSafeToBlowCit3 :checkSafeToBlowCit3 "Level 3"
		setTextLineTrigger checkSafeToBlowCit4 :checkSafeToBlowCit4 "Level 4"
		setTextLineTrigger checkSafeToBlowCit5 :checkSafeToBlowCit5 "Level 5"
		setTextLineTrigger checkSafeToBlowCit6 :checkSafeToBlowCit6 "Level 6"
		setTextLineTrigger checkSafeToBlowCit7 :checkSafeToBlowCit7 "<<<< SHIELDED PLANET >>>>"
		setTextTrigger checkSafeToBlowFinish :checkSafeToBlowFinish "Land on which planet"
		pause

		:checkSafeToBlowCit1
		:checkSafeToBlowCit2
		:checkSafeToBlowCit3
		:checkSafeToBlowCit4
		:checkSafeToBlowCit5
		:checkSafeToBlowCit6
		
			killalltriggers
			setVar $noPlanetsInSector 0
			setVar $safeToBlow 0
			return
		:checkSafeToBlowCit7
			goSub :callSaveMe
			killalltriggers
			setVar $safeToBlow 0
			return
		:checkSafeToBlowFinish
			setVar $noPlanetsInSector 0
		:checkSafeToBlowNoPlanet
			killalltriggers
			return
	waitfor "Command ["


return

	

:blastPlanet

	:blastblastblast
	send "l " $shipBlastPlanet "* z d y * "

	:blowPlanet
	setTextLineTrigger blowPlanet1 :blowPlanet1 "You do not have any Atomic Detonators!"
	setTextLineTrigger blowPlanet2 :blowPlanet2 "For blowing up this planet you receive"
	setTextLineTrigger blowPlanet3 :blowPlanet3 "Invalid registry number, landing aborted."
	pause
	:blowPlanet3
		killAllTriggers
		
			
		echo "**############################################"
		echo "*############################################"
		echo "*#####  BLAST PLANET NOT FOUND - BUG BUG ####"
		echo "*###### LET HAMMER KNOW - GENTLY!       #####"
		echo "*############################################"
		echo "*############################################"

		setDelayTrigger delay :blastFail 5000
		pause
		:blastFail
			return

	:blowPlanet1
		killAllTriggers
		send "q"
		waitfor "Blasting off from"
		waitfor "(?=Help)?"
		goSub :player~quikstats

		goSub :restock

		
		goto :blastblastblast
	:blowPlanet2
		killAllTriggers
		setVar $goodPlanet 0
		waitfor "(?=Help)?"
		add $stat_atomics 1

	setVar $goodPlanet 0

return


:checkPlanetNames
		# get current planets in sector array and mark any off
	setVar $planet~planeti 1
	while ($planet~planeti <= $planet~planetsInSector)
		setVar $searchName $planet~planetNames[$planet~planeti]
		setVar $searchi 1
		setVar $found 0

		while ($searchi <= 20)
			if ($neg_planetNames[$searchi] = $searchName)
				setVar $found 1
			end
			add $searchi 1
		end
		if ($found = 1)
			setVar $neg_planetNamesTaken[$planet~planeti] 1
		end
		add $planet~planeti 1
	end
return


:removePlanet
	setVar $pii 1
	while ($pii <= 20)
		if ($neg_planetNames[$pii] = $removePlanetName)
			setVar $neg_planetNamesTaken[$pii] 0
		end
		add $pii 1
	end
return

:getPlanetName

	setVar $pii 1
	while ($pii <= 20)
		if ($neg_planetNamesTaken[$pii] = 0)
			setVar $newPlanetName $neg_planetNames[$pii]
			setVar $neg_planetNamesTaken[$pii] 1
			return 
		end
		add $pii 1
	end

	ECHO "ISSUE SHOULD NOT GET HERE - all 20 names taken*"
	halt
return

:resetPlanetsUsed
	setVar $newPlanetName ""
	setVar $pii 1
	while ($pii <= 20)
		setVar $neg_planetNamesTaken[$pii] 0
		add $pii 1
	end
return

:checkCorpPlanet

	send "tlq"
	waitfor "Corporate Planet Scan"
	waitfor "======================================="

	:checkCorpPlanetsList
		setTextLineTrigger checkCorpPlanetsListPlanet :checkCorpPlanetsListPlanet "#"
		setTextLineTrigger checkCorpPlanetsListnoPlanets :checkCorpPlanetsListnoPlanets "No Planets claimed"
		setTextLineTrigger checkCorpPlanetsListnoPlanets2 :checkCorpPlanetsListnoPlanets2 "You're not on a team!"
		setTextLineTrigger checkCorpPlanetsListEndPlanets :checkCorpPlanetsListEndPlanets "===   ============  ==== ==== ==== ===== ===== ===== ========== ====="
		pause
		:checkCorpPlanetsListPlanet
			killAllTriggers
			getWord CURRENTLINE $checkPlanet 1
			if ($checkPlanet = $stardock)
				setVar $planet~planetFound 1
				return
			end
			goto :checkCorpPlanetsList
		:checkCorpPlanetsListnoPlanets
		:checkCorpPlanetsListnoPlanets2
		:checkCorpPlanetsListEndPlanets
			killAllTriggers
			return

return



:process_planet_line
        getWord $planet~planetInf $planet~planet_CHECKED 1
        getWord $planet~planetInf $planet~planet_START_FUEL 2
        getWord $planet~planetInf $planet~planet_START_ORG 3
        getWord $planet~planetInf $planet~planet_START_EQUIP 4
        getWord $planet~planetInf $planet~planet_TRADE_PLANET 5
	getLength $planet~planet_CHECKED $length1
	getLength $planet~planet_START_FUEL $length2
	getLength $planet~planet_START_ORG $length3
	getLength $planet~planet_START_EQUIP $length4
	getLength $planet~planet_TRADE_PLANET $length5
	setVar $startlen ($length1 + $length2 + $length3 + $length4 + $length5 + 6)
	cutText $planet~planetInf $planet~planetname $startlen 999
return

:rewriteMooSettings
	
	delete $moo_setting_file
	setVar $pcount 1
	while ($pcount <= $totalGamePlanets)
		
		write $moo_setting_file $planet~planetList[$pcount][1] & " " & $planet~planetList[$pcount][2] & " " & $planet~planetList[$pcount][3] & " "  & $planet~planetList[$pcount][4] & " " & $planet~planetList[$pcount][5] & " " & $planet~planetList[$pcount]
		add $pcount 1
	end
	
return

:callSaveMe
	send "'"&CURRENTSECTOR&"=saveme*q q q q * '"&$switchboard~bot_name&" call*"
halt


################ SOURCE FUNCTION


:sectorsFromFile
	## FILE FUNCTIONS
	if ($sectorfile <> "")
		fileExists $exists $sectorfile
	  
		if ($exists)
			setVar $readi 1
			read $sectorfile $sector $readi
		
			while ($sector <> EOF)
			
				setVar $sectors[$readi] $sector
				add $readi 1
				read $sectorfile $sector $readi
			 end
		end
	else
		echo "*##### CAN NOT FIND SECTOR FILE: " $sectorfile
		halt
	end

return


:getPortBuyQuants

	
	if ($PrimaryProduct = 1)
		setVar $prodBuying PORT.BUYFUEL[$chkPort]
		setVar $prodPerc PORT.PERCENTFUEL[$chkPort]
		setVar $prodAmount PORT.FUEL[$chkPort]
	elseif ($PrimaryProduct = 2)
		setVar $prodBuying PORT.BUYORG[$chkPort]
		setVar $prodPerc PORT.PERCENTORG[$chkPort]
		setVar $prodAmount PORT.ORG[$chkPort]
	elseif ($PrimaryProduct = 3)
		setVar $prodBuying PORT.BUYEQUIP[$chkPort]
		setVar $prodPerc PORT.PERCENTEQUIP[$chkPort]
		setVar $prodAmount PORT.EQUIP[$chkPort]
	end  

return

:sectorsFromEverything
	# Need to exclude next to SD
	setPrecision 0

	setVar $i 11
	setVar $readi 1
	while ($i <= SECTORS)
		getSectorParameter $i "FIGSEC" $hasFig

		if ((PORT.EXISTS[$i] = 1) and ($hasFig = 1))
			setVar $chkPort $i
			goSub :getPortBuyQuants
			if ($prodBuying = 1)

				setVar $sectors[$readi] $i
				add $readi 1
				 
			end
		end
		add $i 1
	end

return

:sectorsFromUpgraded
	setPrecision 0
	setVar $i 11
	setVar $readi 1
	while ($i <= SECTORS)
		
		if (PORT.EXISTS[$i] = 1)
			setVar $chkPort $i
			goSub :getPortBuyQuants

			if ($prodBuying = 1)
				

				 if ($prodPerc = 0)
					setVar $totalProd 0
				 elseif ($prodPerc < 100)
					 setPrecision 2
					setVar $totalProd ($prodAmount/($prodPerc/100))
					setPrecision 0
				 else
					setVar $totalProd $prodAmount
				 end

				 if ($totalProd > 10000)
					setVar $sectors[$readi] $i
					add $readi 1
				 end
			end
		end
		add $i 1
	end

return

:sectorsFromParam

	
	setVar $i 11
	setVar $readi 1
	while ($i <= SECTORS)
		getSectorParameter $i $searchParam $hasParam

		if ((PORT.EXISTS[$i] = 1) and ($hasParam = 1))
			setVar $chkPort $i
			goSub :getPortBuyQuants

			if ($prodBuying = 1)

				setVar $sectors[$readi] $i
				add $readi 1
				 
			end
		end
		add $i 1
	end
return

:sectorsFromPersonal
	


	# Planet list from personal planets - relies on no shields being present

	setVar $targetP 0
	setVar $readi 1
	setVar $lastSector 0
	
	setVar $tempSectors 0
	setVar $tempPlanets 0
	setVar $tempProd 0
	setVar $tempi 1
	send "cyq"
	waitfor "<Computer activated>"
	waitfor "Sector  Planet Name"

	:pread
	setTextLineTrigger pread1 :pread1 "#" 
	setTextLineTrigger pread2 :pread2 "---" 
	setTextLineTrigger preadDone :preadDone "======   ============  ==== ==== ==== ===== ===== " 
	setTextLineTrigger preadDone2 :preadDone "No Planets claimed"

	pause
	:pread1
		killAllTriggers
		getWord CURRENTLINE $sector 1
		getWord CURRENTLINE $lastP 2
		stripText $lastP "#"


		goto :pread
	:pread2
		killAllTriggers
		if ($PrimaryProduct = 1)
			getWord CURRENTLINE $prod 6
		elseif ($PrimaryProduct = 2)
			getWord CURRENTLINE $prod 7
		elseif ($PrimaryProduct = 3)
			getWord CURRENTLINE $prod 8
		end
		getWordPos $prod $pos "T"
		if ($pos > 0)
			stripText $prod "T"
			multiply $prod 1000
		end
		getWordPos $prod $pos "M"
		if ($pos > 0)
			stripText $prod "M"
			multiply $prod 1000000
		end
	

		if ($prod >= $minOnPlanet)
			# right type of planet

			if ($lastSector <> $sector)
	

				if ($tempSectors[1] > 1)

				
					setVar $loopi 1
					setVar $te 0
					setVar $tp 0
					setVar $ts 0
					while ($loopi < $tempi)
				
						if ($loopi = 1)
				 
							setVar $te $tempProd[$loopi]
							setVar $tp $tempPlanets[$loopi]
							setVar $ts $tempSectors[$loopi]
						else
							if ($tempProd[$loopi] > $te)
								setVar $te $tempProd[$loopi]
								setVar $tp $tempPlanets[$loopi]
								setVar $ts $tempSectors[$loopi]
							end
						end
						add $loopi 1
					end
					if ($mode = 1)
						setVar $sectors[$readi] $ts
						setVar $startPlanets[$readi] $tp
						setVar $startProd[$readi] $te
					end
					setVar $planet~planetsWithProducts[$ts] $tp
					add $readi 1

					setVar $tempSectors 0
					setVar $tempPlanets 0
					setVar $tempProd 0
					setVar $tempi 1
				end
				
			end
			
			#has product lock it in
			setVar $tempSectors[$tempi] $sector
			setVar $tempPlanets[$tempi] $lastP
			setVar $tempProd[$tempi] $prod
			add $tempi 1
			setVar $lastSector $sector
			
		end
		

		goto :pread
	:preadDone
		killAllTriggers


	

return



:getPortReports

	setVar $loopi 1
	send "c"
	waitfor "<Computer activated>"
	while ($loopi < $readi)
		send "r" $sectors[$loopi] "*"
		add $loopi 1
	end
	send q
	waitfor "<Computer deactivated>"
return

:filterPortsAndReport
	setVar $loopi 1
	setVar $noLimpets 0
	setVar $noFigs 0

	while ($loopi < $readi)
		setVar $portOk 0
		setVar $ftrOk 0
		
		setVar $sector $sectors[$loopi]
		
		if ($PrimaryProduct = 1)
			if (PORT.BUYFUEL[$sector] = 1)
				if (PORT.FUEL[$sector] > $minTrade)
					if (PORT.PERCENTFUEL[$sector] > $percmintostart)
						setVar $portOk 1
					end
				end
			end
		elseif ($PrimaryProduct = 2)
			if (PORT.BUYORG[$sector] = 1)
				if (PORT.ORG[$sector] > $minTrade)
					if (PORT.PERCENTORG[$sector] > $percmintostart)
						setVar $portOk 1
					end
				end
			end
		elseif ($PrimaryProduct = 3)
			if (PORT.BUYEQUIP[$sector] = 1)
				if (PORT.EQUIP[$sector] > $minTrade)
					if (PORT.PERCENTEQUIP[$sector] > $percmintostart)
						setVar $portOk 1
					end
				end
			end
		end

		getSectorParameter $sector "FIGSEC" $hasFig
		if ($hasFig = 1)
			setVar $ftrOk 1
		end
		
		if (($ftrOk = 1) and ($portOk = 1))
			if ($surroundedSectorsOnly = 1)
			
				setVar $i 1
				setVar $danger 0
				setVar $ldanger 0
				while ($i <= SECTOR.WARPINCOUNT[$sector])
					getSectorParameter SECTOR.WARPSIN[$sector][$i] "FIGSEC" $hasFig
					if ($hasFig = 0)
						setVar $danger 1
					end
					add $i 1
				end
				if ($bot~parmanoid = TRUE)
					setVar $i 1
					
					while ($i <= SECTOR.WARPINCOUNT[$sector])
						getSectorParameter SECTOR.WARPSIN[$sector][$i] "LIMPSEC" $hasFig
						if ($hasFig = 0)
							setVar $ldanger 1
						end
						add $i 1
					end

				end

				if (($danger = 0) and ($ldanger = 0))
					setVar $sectorsOk[$sectorsOki] $sector
					if ($startProd[$loopi] > 0)
						setVar $sectorsOkProduct[$sectorsOki] $startProd[$loopi]
						setVar $sectorsOkPlanetID[$sectorsOki] $startPlanets[$loopi]
					else
						setVar $sectorsOkProduct[$sectorsOki] 0
						setVar $sectorsOkPlanetID[$sectorsOki] 0
					end
					add $sectorsOki 1
				else
					if ($danger = 1)
						echo "*## Slipping Sector - Incoming Warps aren't figged" $sector
						
						add $noFigs 1
					end
					if ($ldanger = 1)
						echo "*## Slipping Sector - Incoming Warps missing limpets" $sector
						add $noLimpets 1
					end
					
				end	
			else

				setVar $sectorsOk[$sectorsOki] $sector
				if ($startProd[$loopi] > 0)
					setVar $sectorsOkProduct[$sectorsOki] $startProd[$loopi]
					setVar $sectorsOkPlanetID[$sectorsOki] $startPlanets[$loopi]
				else
					setVar $sectorsOkProduct[$sectorsOki] 0
					setVar $sectorsOkPlanetID[$sectorsOki] 0
				end
				add $sectorsOki 1
			end
			
		end
		if ($ftrOk = 0)
			setVar $sectorsNoFig[$sectorsNoFigi] $sector
			add $sectorsNoFigi 1
		end 

		add $loopi 1
	end

	setVar $sectorNoFigsReport ""

	if ($sectorsNoFigi > 1)
		echo "**############# PORTS MISSING FIGHTERS8**"
		setVar $i 1
		while ($i < $sectorsNoFigi)
			echo "*# " $sectorsNoFig[$i]
			setVar $sectorNoFigsReport  $sectorNoFigsReport & $sectorsNoFig[$i] & " "
			add $i 1
		end

	end
	setVar $loopi 1

	echo "###" SECTORS GOOD TO GO " ###**" 
	while ($loopi < $sectorsOki)
		echo "*" $sectorsOk[$loopi]
		
		add $loopi 1
	end


	setVar $startmsg "We are visiting " & ($sectorsOki - 1) & " sectors with target ports."
	if ($sectorsNoFigi > 1)
		setVar $startmsg $startmsg & "*There are " & $sectorsNoFigi  & " ports with no fighters."
		setVar $startmsg $startmsg & "*" & $sectorNoFigsReport
	end
	if ($noFigs > 1)
		setVar $startmsg $startmsg & "*There are " & $noFigs  & " ports missing incoming fighters."
	end
	if ($noLimpets > 1)
		setVar $startmsg $startmsg & "*There are " & $noLimpets  & " ports missing incoming Limpets."
	end
	setVar $startmsg  $startmsg & "*Dumping cash on planet: " & $cashDumpPlanet
	setVar $startmsg  $startmsg & "*Stopping at turns: " & $turn_limit
	
	if ($mode < 6)
		setVar $startmsg $startmsg & "*Send a Eng age!!! without the space to engage.*"
	else
		setVar $startmsg $startmsg & "*"
	end	

	setVar $SWITCHBOARD~message $startmsg
	gosub :SWITCHBOARD~switchboard
	waitfor "Sub-space radio"
	waitfor "Command ["
return

:verifyOneTrader

	send "d"
	setVar $startCount 0
	setVar $traderCount 0
	setVar $tradeLocked 0

	setTextLineTrigger v_notraders :v_notraders "There are no other Traders in the Citadel."
	setTextLineTrigger v_traderheading :v_traderheading "Other Traders Here"
	setTextLineTrigger v_tradersdone1 :v_tradersdone1 "Citadel treasury"
	setTextLineTrigger v_tradersdone2 :v_tradersdone2 "means you are locked out of that Ship and cannot use i"
	setTextLineTrigger v_everything :v_everything ""
	pause
	:v_traderheading
		setVar $startCount 1
		pause

	
	:v_tradersdone2
		setVar $tradeLocked 1
	:v_tradersdone1
		killAllTriggers
		return
	:v_notraders
		killAllTriggers
		return
	:v_everything
		if ($startCount= 1)
			getLength CURRENTLINE $thelen
			if ($thelen > 20)
				add $traderCount 1
			end
		end
		setTextLineTrigger v_everything :v_everything ""
		pause

	return
return

:verifyTraderPlanet
	
    send "'" $efurbBot " qss*"
    setVar $confirmedPlanet 0
    
    settextLineTrigger photonBotName :photonBotName "{" & $efurbBot & "}"
    setDelayTrigger photonBotNameTimeout :photonBotNameTimeout 3000
    pause
        :photonBotNameTimeout
        killalltriggers
            setvar $switchboard~message "Couldn't find bot we are trading ships with - exiting*"
            gosub :SWITCHBOARD~switchboard
            halt
        :photonBotName
        killalltriggers

    setTextLineTrigger qssPlanetLine :qssPlanetLine "Sector   :"
    setTextTrigger qssDone :qssDone "Bot Mode :General"
    pause
    :qssPlanetLine
        cuttext CURRENTLINE $planetID 62 4
		trim $planetID
echo "#"  $planetID "#" $planet~planet "#*"
        if ($planetID = $planet~planet)
            setVar $confirmedPlanet 1
        end
        pause
    
	:qssDone
		if ($confirmedPlanet = 1)
			
		else
			setvar $switchboard~message "Bot we are trading ships with isn't on our planet.*"
			gosub :SWITCHBOARD~switchboard
			 
			halt
		end


return
#############################

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\loadplanetinfo\planet"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\planet\planetneg\planet"
