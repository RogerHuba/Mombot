# rem xmasprep 6133, 19510 

# rem xmasprep 6435, 6471, 7379, 7920, 8089, 8768, 8804, 9342, 9857, 12832
# rem xmasprep 14980, 17167, 18673 12832
# 



#calc if we are close to max buy and skip.. i.e. % above 55k don't do it

gosub :BOT~loadVars

loadVar $game~port_max
loadVar $game~ptradesetting
loadvar $bot~$MCIC_FILE
loadvar $MAP~STARDOCK

setVar $BOT~help[1]  $BOT~tab&"       Uprades the ports fed to it"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&"       "
setVar $BOT~help[4]  $BOT~tab&" XmasPrep [port list]"
setVar $BOT~help[5]  $BOT~tab&"       "
setVar $BOT~help[6]  $BOT~tab&" e.g. XmasPrep 123 567 827 8999 18992"
setVar $BOT~help[7]  $BOT~tab&"      XmasPrep 12, 24, 593, 1234	"
setVar $BOT~help[8]  $BOT~tab&"    Warps to port maxs ORE, drops mines and limpets."
setVar $BOT~help[9]  $BOT~tab&"    Puts a limpet and 3 mines in surrounding INCOMING sectors."
setVar $BOT~help[10] $BOT~tab&"    "
setVar $BOT~help[15] $BOT~tab&"    Requires ZTM to be safe."
setVar $BOT~help[15] $BOT~tab&"    Run: MSL, Armids, Limps and Figs first!"

gosub :bot~helpfile

setVar $BOT~script_title "Xmas Prep - Lets have a safe holiday!"
gosub :BOT~banner

# NOT ADD YET
getWordPos $bot~user_command_line $pos "grid"
if ($pos > 0)
	#setVar $doGrid TRUE
	setvar $switchboard~message "We will grid sectors that are safe.*"
else
	setVar $doGrid FALSE
	#setvar $switchboard~message "We are not gridding unfigged sectors.*"
end

setVar $stuff $bot~user_command_line & " " & done
setVar $totalSectors 0
setVar $Sectors 0

setVar $pathSectors 0
setVar $pathi 0
setVar $danger ""
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
		if (($hasfig = 1) and ($mslsec <> 1))
			add $totalSectors 1
			setVar $Sectors[$totalSectors] $sector
			setVar $AllSectors[$totalSectors] $sector
#echo "*# Added SEctor to list: " $sector
		end

	end
	add $i 1
	getword $stuff $sector $i "done"
end

if ($totalSectors < 1)
	setvar $switchboard~message "Just a list of numbers please.**"
	gosub :switchboard~switchboard
	halt
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

send "'" $SWITCHBOARD~bot_name " stop ephaggle*"
setDelayTrigger delay :wait 3000
pause
:wait

setVar $i 1
while ($i <= $totalSectors)
	add $pathi 1
	setVar $pathSectors[$pathi] $Sectors[$i]

	setVar $di 1
	while ($di <= SECTOR.WARPINCOUNT[$Sectors[$i]])


		getSectorParameter SECTOR.WARPSIN[$Sectors[$i]][$di] "FIGSEC" $hasFig
		if ($hasFig <> 1)
			setVar $danger $danger & "Incoming Sector " & SECTOR.WARPSIN[$Sectors[$i]][$di] & " to " & $Sectors[$i] & " has no fig - will skip*"
		end
		getSectorParameter SECTOR.WARPSIN[$Sectors[$i]][$di] "MSLSEC" $mslsec
		if ($mslsec = 1)
			setVar $danger $danger & "Incoming Sector " & SECTOR.WARPSIN[$Sectors[$i]][$di] & " to " &  $Sectors[$i] & " is in a MSL - will skip*"
	
		end
#echo "*" $Sectors[$i] " " SECTOR.WARPSIN[$Sectors[$i]][$di] " f" $hasfig " m" $mslsec
		if (($hasfig = 1) and ($mslsec <> 1))
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
#echo "*# added Good sector to list " SECTOR.WARPSIN[$Sectors[$i]][$di]
				end

			end
		end
		add $di 1
	end
	
	add $i 1
end


setVar $limpsreq $allSectorCount
setVar $minesreq ($allSectorCount * 3)

setVar $msg "We are targeting " & $totalSectors & " primary sectors*"
setVar $msg $msg & "Totalling " & $allSectorCount & " including adjacent incoming sectors*"
setVar $msg $msg & "We may need up to " & $limpsreq & " limpets and " & $minesreq & " mines*"
if ($danger <> "")
	setVar $msg $msg & "Danager Report:*" & $danger 
end

setVar $msg $msg & "*"
setVar $SWITCHBOARD~message $msg
gosub :SWITCHBOARD~switchboard

setVar $lastUpgrade 0
setVar $i 1
while ($i <= $pathi)
	
	goSub :player~quikstats
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
				send "'Upgraded/mined "  $lastUpgrade  " and incoming warps. *"
				
			end
			setVar $lastUpgrade $sectors[$y]
		end
		add $y 1
	end
	
	if (($player~CREDITS < 1800000) and ($upgradeSector = 1))
		
		setVar $SWITCHBOARD~message "Credits are low, stopping.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setVar $player~warpto $gotoSector
	gosub :player~twarp

	goSub :player~quikstats
	
	if ($upgradeSector = 1)

		setVar $BOT~command "port"
		setVar $BOT~user_command_line " port upgrade b silent "
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
		load "scripts\mombot\commands\grid\port.cts"
		setEventTrigger		portended		:portended "SCRIPT STOPPED" "scripts\mombot\commands\grid\port.cts"
		pause
		:portended
		
		setSectorParameter $gotoSector "MOOPORT" "1"

	end

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
	send "h21*c"
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

	
	if ($player~ore_holds < 140)
		
		gosub :GetPlanetList
		if ($planet~planetsInSector > 0)
		
			send "l" $planet~planets[$planet~planetsInSector] "* t n t 1 * q *"
			waitfor "eparing ship to land o"
			waitfor "Command ["
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
#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\twarp\player"
