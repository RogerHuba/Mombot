
gosub :BOT~loadVars

loadVar $game~port_max
loadVar $game~ptradesetting
loadvar $bot~$MCIC_FILE
loadvar $MAP~STARDOCK

setVar $BOT~help[1]  $BOT~tab&" MooPrep [p/l] {param} [f/o/e/a] {sectorlist} {secure} {adj} {sell}"
setVar $BOT~help[2]  $BOT~tab&"       "
setVar $BOT~help[3]  $BOT~tab&"        [p/l] - [p]aram look up or [l]ist of sectors"
setVar $BOT~help[4]  $BOT~tab&"    [f/o/e/a] - Upgrade {f}uel, {o}rg, {e}quip and/or {a}all"
setVar $BOT~help[5]  $BOT~tab&"      {param} - Will search for sectors with this param."
setVar $BOT~help[6]  $BOT~tab&"              - Syntax >upgradethis p PARAM ..."
setVar $BOT~help[7]  $BOT~tab&" {sectorlist} - List of sectors up upgrade"
setVar $BOT~help[8]  $BOT~tab&"     {secure} - Drops 3 Limps/Mines"
setVar $BOT~help[9]  $BOT~tab&"        {adj} - Drops 3 Limps/Mines on figged adj sectors"
setVar $BOT~help[10]  $BOT~tab&"       {sell} - Upgrades Sells, defaults to buys"
setVar $BOT~help[11]  $BOT~tab&"       "
setVar $BOT~help[12]  $BOT~tab&"      MooPrep p upports a secure"
setVar $BOT~help[13]  $BOT~tab&"      MooPrep l o e sell 12, 24, 593, 1234	"
setVar $BOT~help[14]  $BOT~tab&"    "
setVar $BOT~help[15]  $BOT~tab&"    T-warps to sectors to upgrade ports to max."
setVar $BOT~help[16]  $BOT~tab&"    Will secure sectors WITH our fighters."
setVar $BOT~help[17]  $BOT~tab&"    Requires ZTM to be safe."
setVar $BOT~help[18]  $BOT~tab&"    Run: MSL, Armids, Limps and Figs first!"
setVar $BOT~help[19]  $BOT~tab&"    Tags sector with MOOPORT and will skip those allowing restarting"

gosub :bot~helpfile

setVar $BOT~script_title "Moo Prep - Upgrade and Secure ports for Moo"
gosub :BOT~banner

setVar $startMsg ""

setVar $upgradeParams 0
setVar $upgradeFuel 0
setVar $upgradeOrg 0
setVar $upgradeEquip 0
setVar $secure 0
setVar $secureAdj 0
setVar $upgradeBuys 1

setVar $cline $bot~user_command_line&" "

if (($bot~parm1 <> "p") and ($bot~parm1 <> "l"))
	setVar $SWITCHBOARD~message "First parameter should be {p}aram or {l}list.*"
	gosub :SWITCHBOARD~switchboard
	halt
elseif ($bot~parm1 = "p")
	setVar $upgradeParams 1
	setVar $upgradeParam $bot~parm2
	UPPERCASE $upgradeParam
echo "PARAM:" $upgradeParam
	setVar $startMsg $startMsg & "Upgrading ports with Param:" & $upgradeParam & "*"
else
	setVar $startMsg $startMsg & "Upgrading ports in sector list.*"
end


getWordPos " "&$bot~user_command_line&" " $pos " f "
if ($pos > 0)
	setVar $upgradeFuel 1
end
getWordPos " "&$bot~user_command_line&" " $pos " o "
if ($pos > 0)
	setVar $upgradeOrg 1
end
getWordPos " "&$bot~user_command_line&" " $pos " e "
if ($pos > 0)
	setVar $upgradeEquip 1
end
getWordPos " "&$bot~user_command_line&" " $pos " a "
if ($pos > 0)
	setVar $upgradeFuel 1
	setVar $upgradeOrg 1
	setVar $upgradeEquip 1
end

if ($upgradeFuel = 0) and ($upgradeOrg = 0) and ($upgradeEquip = 0)
	setvar $switchboard~message "Please choose what product to ugprade {f/o/e/a}.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

setVar $portString ""
if ($upgradeFuel = 1) and ($upgradeOrg = 1) and ($upgradeEquip = 1)
	setVar $portString "b "
else
	if ($upgradeFuel = 1)
		setVar $portString $portString & "f "
	end
	if ($upgradeOrg = 1)
		setVar $portString $portString & "o "
	end
	if ($upgradeEquip = 1)
		setVar $portString $portString & "e "
	end

end

getWordPos $bot~user_command_line $pos "secure"
if ($pos > 0)
	setVar $secure TRUE
	setvar $startMsg $startMsg &  "Droping mines/limpets in port sector.*"
else
	setVar $secure FALSE
	setvar $startMsg $startMsg &  "Not securing port sector.*"
end

# if you secure adj, then your securing main ones also
getWordPos $bot~user_command_line $pos "adj"
if ($pos > 0)
	setVar $secureAdj TRUE
	setVar $secure TRUE
	setvar $startMsg $startMsg &  "Droping mines/limpets in adjacent sector.*"
else
	setVar $secureAdj FALSE
	setvar $startMsg $startMsg &  "Not securing adjacent sectors.*"
end

getWordPos $bot~user_command_line $pos "sell"
if ($pos > 0)
	setVar $upgradeBuys 0
	setvar $startMsg $startMsg &  "Upgrading SELL ports - not really, this isn't implemented yet*"
	setvar $switchboard~message $startMsg
	gosub :SWITCHBOARD~switchboard
	halt

end

# NOT ADDED YET
getWordPos $bot~user_command_line $pos "grid"
if ($pos > 0)
	#setVar $secure TRUE
	setvar $switchboard~message "We will grid sectors that are safe.*"
else
	setVar $doGrid FALSE
	#setvar $switchboard~message "We are not gridding unfigged sectors.*"
end

setArray $visited SECTORS
setVar $totalSectors 0
setVar $Sectors 0
setVar $pathSectors 0
setVar $pathi 0
setVar $danger ""

if ($upgradeParams = 1)
	setvar $i 11
	while ($i < SECTORS)
		getSectorParameter $i $upgradeParam $hasParam
		getSectorParameter $i "FIGSEC" $hasFig
		getSectorParameter $i "MSLSEC" $mslsec
		getSectorParameter $i "MOOPORT" $isMoo
		if ($hasParam = 1) and ($hasFig = 1) and ($mslSec <> 1) and ($isMoo <> 1)
			add $totalSectors 1
			setVar $Sectors[$totalSectors] $i
			setVar $AllSectors[$totalSectors] $i

		end
		add $i 1
	end
	
	if ($totalSectors < 1)
		setvar $switchboard~message "No sectors found with figs, not in MSL and param:" & $upgradeParam & ".*"
		gosub :switchboard~switchboard
		halt
	end
else
	setVar $stuff $bot~user_command_line & " " & done
	setvar $i 1
	getword $stuff $sector $i "done"
	while ($sector <> "done")
		
		stripText $sector ","
		isNumber $test $sector
		if ($test = 1)
			getSectorParameter $sector "FIGSEC" $hasFig
			if ($hasFig <> 1)
				setVar $danger $danger & "PRIMARY Sector " & $sector & " has no fig - will skip*"
			end
			getSectorParameter $sector "MSLSEC" $mslsec
			if ($mslsec = 1)
				setVar $danger $danger & "PRIMARY Sector " & $sector & " is in a MSL - will skip*"
		
			end
			getSectorParameter $i "MOOPORT" $isMoo
			if ($isMoo = 1)
				setVar $danger $danger & "PRIMARY Sector has been marked MOOPORT - will skip*"
		
			end
			if (($hasfig = 1) and ($mslsec <> 1) and ($isMoo <> 1))
				add $totalSectors 1
				setVar $Sectors[$totalSectors] $sector
				setVar $AllSectors[$totalSectors] $sector
			end
		end
		add $i 1
		getword $stuff $sector $i "done"
	end

	if ($totalSectors < 1)
		setvar $switchboard~message "Just a list of numbers please.*"
		gosub :switchboard~switchboard
		halt
	end
end


setVar $allSectorCount $totalSectors


goSub :player~quikstats

if (($player~TWARP_TYPE <> 1) and ($player~TWARP_TYPE <> 2))
	setVar $SWITCHBOARD~message "MooXmas - Twarp = good, No Twarp = bad.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

if ($player~FIGHTERS < 301)
	setVar $SWITCHBOARD~message "MooXmas - Need more than 300 figs, you'll hit debree and die!*"
	gosub :SWITCHBOARD~switchboard
	halt
end

if ($player~ore_holds < 100)
	setVar $SWITCHBOARD~message "MooXmas - We need ore in our holds.*"
	gosub :SWITCHBOARD~switchboard
	halt
end
setVar $SWITCHBOARD~message $startMsg 
gosub :SWITCHBOARD~switchboard

send "'" $SWITCHBOARD~bot_name " stop ephaggle*"
setDelayTrigger delay :wait 3000
pause
:wait


setVar $i 1
while ($i <= $totalSectors)
	add $pathi 1
	setVar $pathSectors[$pathi] $Sectors[$i]
	echo "sectors:" $Sectors[$i] "*"
	setVar $visited[$Sectors[$i]] 1

	if ($secureAdj = 1)
		setVar $di 1
		while ($di <= SECTOR.WARPINCOUNT[$Sectors[$i]])

			if ($visited[SECTOR.WARPSIN[$Sectors[$i]][$di]] = 0)
				getSectorParameter SECTOR.WARPSIN[$Sectors[$i]][$di] "FIGSEC" $hasFig
				if ($hasFig <> 1)
					setVar $danger $danger & "Incoming Sector " & SECTOR.WARPSIN[$Sectors[$i]][$di] & " to " & $Sectors[$i] & " has no fig - will skip*"
				end
				getSectorParameter SECTOR.WARPSIN[$Sectors[$i]][$di] "MSLSEC" $mslsec
				if ($mslsec = 1)
					setVar $danger $danger & "Incoming Sector " & SECTOR.WARPSIN[$Sectors[$i]][$di] & " to " &  $Sectors[$i] & " is in a MSL - will skip*"
			
				end
				getSectorParameter $i "MOOPORT" $isMoo
		#echo "*" $Sectors[$i] " " SECTOR.WARPSIN[$Sectors[$i]][$di] " f" $hasfig " m" $mslsec
				if (($hasfig = 1) and ($mslsec <> 1) and ($isMoo <> 1))
		#echo "*# GOOD SECTOR" SECTOR.WARPSIN[$Sectors[$i]][$di]

					setVar $y 1
					setVar $found 0
					while ($y <= $allSectorCount)
						if ($AllSectors[$y] = SECTOR.WARPSIN[$Sectors[$i]][$di])
							setVar $found 1
							setVar $y 20001
						end
						add $y 1
					end

					if ($found = 0)
						getSectorParameter SECTOR.WARPSIN[$Sectors[$i]][$di] "LIMPSEC" $haslimp
						getSectorParameter SECTOR.WARPSIN[$Sectors[$i]][$di] "MINESEC" $hasmine
						if (($haslimp = 0) or ($hasmine = 0))
							add $allSectorCount 1
							setVar $AllSectors[$allSectorCount] SECTOR.WARPSIN[$Sectors[$i]][$di]
							add $pathi 1
							setVar $pathSectors[$pathi] SECTOR.WARPSIN[$Sectors[$i]][$di]
							setVar $visited[SECTOR.WARPSIN[$Sectors[$i]][$di]] 1
		#echo "*# added Good sector to list " SECTOR.WARPSIN[$Sectors[$i]][$di]
						end

					end
				end
			end
			add $di 1
		end
	end
	add $i 1
end


setVar $minesreq ($allSectorCount * 3)
setVar $limpsreq $minesreq

setVar $msg "We are targeting " & $totalSectors & " primary sectors*"
setVar $msg $msg & "Totalling " & $allSectorCount & " including adjacent incoming sectors*"
setVar $msg $msg & "We may need up to " & $limpsreq & " limpets and " & $minesreq & " mines*"
if ($danger <> "")
	setVar $msg $msg & "Danager Report:*" & $danger 
end

setVar $msg $msg & "*"
setVar $SWITCHBOARD~message $msg
gosub :SWITCHBOARD~switchboard

setVar $restockNextOre 0
setVar $lastUpgrade 0
setVar $i 1
while ($i <= $pathi)
	
	goSub :player~quikstats
	if ($secure = 1) or ($secureAdj = 1)
		if ($player~limpets < 20) or ($player~Armids < 20)
			if ($player~credits < 10000000)
				setVar $SWITCHBOARD~message "Low on cash, so cant restock, cash up and start again.*"
				gosub :SWITCHBOARD~switchboard
				halt
			else
				setVar $restockNextOre 1
			end
		end
	end

	if ($restockNextOre = 1)

		if (PORT.EXISTS[CURRENTSECTOR] = 1)
			if (PORT.BUYFUEL[CURRENTSECTOR] = 0)
				setVar $restockNextOre 0
				send "p t * * "
				waitfor "Enter your choice [T]"
				
				goSub :restock
				
			end
		end
	end

	setVar $planet~planetsInSector 0
	setVar $planet~planets 0
	setVar $planet~planeti 1
	setVar $gotoSector $pathSectors[$i]
	
	# Is this a port upgrade sector?
	setVar $y 1
	setVar $upgradeSector 0
	while ($y <= $totalSectors)

#echo " *  $gotoSector:"  $gotoSector " $sectors[$y]:"  $sectors[$y]
		if ($gotoSector = $sectors[$y])
			setVar $upgradeSector 1
			setVar $y 9999
			if ($lastUpgrade > 0)
				send "'Upgraded/mined "  $lastUpgrade  " and incoming warps.*"
				
			end
			setVar $lastUpgrade $sectors[$y]
		end
		add $y 1
	end
	
	if (($player~CREDITS < 10000000) and ($upgradeSector = 1))
		
		setVar $SWITCHBOARD~message "Low on cash, so cant restock, cash up and start again.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $player~warpto $gotoSector
	gosub :player~twarp
	send "d"
	goSub :player~quikstats
	
	if ($player~CURRENT_SECTOR <> $gotoSector)
		setVar $SWITCHBOARD~message "TWarp failed, please check and restart*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($upgradeSector = 1)

		setVar $BOT~command "port"
		setVar $BOT~user_command_line " port upgrade " & $portString &"silent "
		setVar $BOT~parm1 "upgrade"
		setVar $BOT~parm2 ""
		setVar $BOT~parm3 ""
		setVar $BOT~parm4 ""
		setVar $BOT~parm5 ""
		setVar $BOT~parm6 ""
		saveVar $BOT~parm1
		saveVar $BOT~parm2
		saveVar $BOT~parm3
		saveVar $BOT~parm4
		saveVar $BOT~parm5
		saveVar $BOT~parm6
		saveVar $BOT~command
		saveVar $BOT~user_command_line
		load "scripts\"&$bot~mombot_directory&"\commands\grid\port.cts"
		setEventTrigger		portended		:portended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\grid\port.cts"
		pause
		:portended
		
		setSectorParameter $gotoSector "MOOPORT" "1"

	end

	if (($upgradeSector = 1) and ($secure = 1)) or ($upgradeSector = 0)
		:armidsagain
		send "h13*c"
		setTextTrigger mines1 :mines1 "Done. You have"
		setTextTrigger mines2 :mines2 "You don't have that many mines available"
		pause
			:mines2
				killalltriggers
				setVar $SWITCHBOARD~message "Out of mines; restock, return here, and send 're start!!!'*"
				gosub :SWITCHBOARD~switchboard
				waitfor "restart!!!"
				goto :armidsagain
			:mines1 
				killalltriggers

		:limpetsagain
		send "h23*c"
		setTextTrigger limps1 :limps1 "Done. You have"
		setTextTrigger limps2 :limps2 "You don't have that many mines available"
		pause
			:limps2
				killalltriggers
				setVar $SWITCHBOARD~message "Out of Limpets; restock, return here, and send 're start!!!'*"
				gosub :SWITCHBOARD~switchboard
				waitfor "restart!!!"
				goto :limpetsagain
			:limps1 
				killalltriggers
	end

	
	if ($player~ore_holds < 160)
		
		gosub :GetPlanetList
		if ($planet~planetsInSector > 0)
		
			send "l" $planet~planets[$planet~planetsInSector] "* t n t 1 * q *"
			waitfor "eparing ship to land o"
			waitfor "Command ["
			
		end
		goSub :player~quikstats
		if ($player~ore_holds < 140)
			if (PORT.EXISTS[CURRENTSECTOR] = 1)
				if (PORT.BUYFUEL[CURRENTSECTOR] = 0)
					send "pt**"
					waitfor "Enter your choic"
					waitfor "Command ["
				end
			end

		end
	end
	
	
	add $i 1
end
setVar $SWITCHBOARD~message "Upgraded/mined " & $lastUpgrade & " and incoming warps. *"
gosub :SWITCHBOARD~switchboard
setVar $SWITCHBOARD~message "Finished upgrades!*"
gosub :SWITCHBOARD~switchboard
halt




:GetPlanetList


	setVar $planet~planetsInSector 0
	setVar $planet~planets 0
	setVar $planet~planeti 1
	send "lq*"
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
			add $planet~planetsInSector 1
			setVar $planet~planets[$planet~planeti] $cPlanetNum
			add $planet~planeti 1
		end
		goto :reCheckPlanetsT

	:reCheckPlanetsT3
		killAllTriggers

return



:restock
	
	send "d"
	setVar $returnSpot CURRENTSECTOR

	send "nq"
	setTextLineTrigger stargateCheck :stargateCheck "Class 9 (Special) (StarDock)"
	setDelayTrigger nostargateCheck :nostargateCheck 3000
	pause
	:nostargateCheck
		killalltriggers
		setVar $SWITCHBOARD~message "Stardock is gone!! Halting..*"
		gosub :SWITCHBOARD~switchboard
		halt
	:stargateCheck
		killalltriggers
		send "nsy"
		waitfor "Locating beam pinpointed, TransWarp"
		send "y  p   sh"


		send "l"
		setTextTrigger shipCheckBuyLimps :shipCheckBuyLimps "How many mines do you want"
		pause
		:shipCheckBuyLimps
			killalltriggers
			getWord CURRENTLINE $limpsAvail 8
			stripText $limpsAvail ")"
			send $limpsAvail "*"

		send "m"
		setTextTrigger shipCheckBuyArmids :shipCheckBuyArmids "How many mines do you want"
		pause
		:shipCheckBuyArmids
			killalltriggers
			getWord CURRENTLINE $minesAvail 8
			stripText $minesAvail ")"
			send $minesAvail "*"

			gosub :player~quikstats
			
	
		send "qqq    *   "

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




#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\twarp\player"
