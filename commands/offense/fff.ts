setVar $numberofhits 1
setVar $noreset 0
setVar $fizzletime 20000

goSub :startUp
gosub :killscripts
gosub :loadarray


setVar $first $numberofhits
setVar $Hit_Sector_pre 2
:start
	goto :waitforit

:Fighit
	killalltriggers
	
	getWord CURRENTLINE $Hit_Sector 5
	getWord CURRENTANSILINE $ansi 6
	cutText $ansi $num 10 2
	stripText $Hit_Sector ":"
	if ($Hit_Sector = $Hit_Sector_pre)
		goto :Again
	end
	setVar $Hit_Sector_pre $Hit_Sector
	if ($num = 33)
		goto :Again
	end
	if ($first > 0)
		setvar $FIGS[$Hit_Sector] FALSE
		setVar $first ($first - 1)
		echo "*# Hits to go " $first " - waiting for more"
		goto :Again
	else
		setvar $FIGS[$Hit_Sector] FALSE
		goto :boomboom
	end
	
:boomboom

	echo "*# Sector: " $Hit_Sector " Solution1: " $solution[$Hit_Sector] " Solution2: " $solution2[$Hit_Sector]
	#echo "*# Sector: " $Hit_Sector " Solution1: " $FIGS[$solution[$Hit_Sector]] " Solution2: " $FIGS[$solution2[$Hit_Sector]]

	if (($solution[$Hit_Sector] <> 0))
		if ($FIGS[$solution[$Hit_Sector]] <> 0)
			setVar $player~warpto $solution[$Hit_Sector]
			goto :gotit
		end
			
	end
	
	if (($solution2[$Hit_Sector] <> 0))
		if ($FIGS[$solution2[$Hit_Sector]] <> 0)
			setVar $player~warpto $solution2[$Hit_Sector]
			goto :gotit
		end
	end
	setVar $first 0
	goto :Again



:gotit
	echo "*# TARGET: " $Hit_Sector " Landing: " $player~warpto
	# SHIP ATTACK STRING
	#send "c" $player~warpto "* y * * c p y " $Hit_Sector " * * qsd"
	# PLANET ATTACK STRING
	send "p" $player~warpto "* y * * c p y " $Hit_Sector " * * qq q sdl" $planet~planetNum "* c "

	
	setTextLineTrigger	fired	:fired          "Photon Missile launched into sec"
	setTextLineTrigger      miss    :miss           "That is not an adjacent sector"
	setDelayTrigger		fizzle2	:fizzle2	20000
	pause
	:fizzle2
		send "'FFF - tried to fire!! have no record of success, reloading*"
		setVar $first $numberofhits
		goSub :findSafeSector
		send "p" $safeSector "*y"
		goto :Waitforit
	 :miss
		send "'FFF - Missed lock, next time maybe*"		
		setVar $first $numberofhits
		goSub :findSafeSector
		send "p" $safeSector "*y"
		goto :Waitforit
	:fired
	
		setVar $stuff "Photon Missile Fired into " & $Hit_Sector & "*"
		killalltriggers
		waitfor "Relative Density Scan"

		:donetrap
		
			killalltriggers

			setVar $safeSector 0
			goSub :findSafeSector

			send "p" $safeSector "*y"
			setVar $first $numberofhits
			send "i"
			waitfor "Rank and Exp   :"
			setTextLineTrigger photonsleft :photonsleft "Photon Missiles:"
			setTextLineTrigger noPhotons :noPhotons "Citadel treasury contains"
			pause
			:noPhotons
				send "'FFF - Out of photons!! If afk bring home*"
				goto :startbot
				halt
			:photonsleft
				send "'Moved a few hops and reloading...*"
				goto :Waitforit


halt
:Waitforit

	:Again
	killalltriggers
	if ($Hit_Sector <> "0")
		setvar $FIGS[$Hit_Sector] FALSE
	end
	# when we fire on first hit, we don't want to fizzle
	if (($first = 0) and ($noreset = 0))
		setDelayTrigger		fizzle	:fizzle	$fizzletime
	end

	setTextLineTrigger	FigHit	:FigHit	"Deployed Fighters Report Sector"
	setTextLineTrigger      fffstop :fffstop "FFF STOP"
	setDelayTrigger		BANNER	:BANNER	300000
	pause
        HALT




:fffstop
	send "'Exiting fff and starting bot....*"
	goto :startbot
return

:fizzle
	killalltriggers
	setVar $first $numberofhits
	echo "'FN Fast Foton - Second hit did not come, reloading*"
	goto :Again


:loadarray
	
	echo "### CREATING FIG ARRAy.... *"

	SetArray $FIGS	SECTORS
	setvar $IDX 11
	While ($IDX <= SECTORS)
		GetSectorParameter $IDX "FIGSEC" $F
		if ($F <> "0")
			setvar $FIGS[$IDX] TRUE
			# find a solution

		end
		add $IDX 1
	end
	
	echo "### Finding Solutions.... *"

	setvar $IDX 11
	While ($IDX <= SECTORS)
		setVar $found 0
		if ($FIGS[$IDX] = TRUE)
			setVar $WARPCOUNT SECTOR.WARPCOUNT[$IDX]
			setVar $i 1
			setVar $found2 0
			while ($i <= $WARPCOUNT)
				setvar $ADJ SECTOR.WARPS[$IDX][$i]
	
				if ($FIGS[$ADJ] <> 0)
		
					setVar $y 1
					setVar $found 0
					
					while ($y <= SECTOR.WARPCOUNT[$ADJ])
						if (SECTOR.WARPS[$ADJ][$y] = $IDX)
							setVar $found 1
						end
						add $y 1
					end
					if ($found = 1)
						if ($found2 = 0)
							setVar $solution[$IDX] $ADJ
							setVar $found2 1
						else
					
							setVar $solution2[$IDX] $ADJ
							
							goto :nextSol
						end
		
						
					end
					
				end

				add $i 1
			end

		end
		:nextSol
		
		
		add $IDX 1
	end
	
	return
:BANNER
	

	setVar $SWITCHBOARD~message "FN Fast Foton - On and Not Tested, F_FF STOP without _ to stop*"
	gosub :SWITCHBOARD~switchboard
	
	goto :Again



:killScripts
	setVar $thisScriptName "fff"
	setVar $a 1
	setVar $c 0
	listActiveScripts $scripts
	while ($a <= $scripts)
		echo $scripts[$a] "*"
		cuttext $scripts[$a] $ss 1 3

		getWordPos $scripts[$a] $mombos "ombot"
		if ($mombos > 0)
			echo "found: " $scripts[$a] "*"
		end
		if ($ss <> $thisScriptName)
			setvar $do_not_resuscitate true
			savevar $do_not_resuscitate
			stop $scripts[$a]
		end
		add $a 1
	end
return

:startbot
	setvar $do_not_resuscitate false
	savevar $do_not_resuscitate
	if ($monname = "")
		setVar $monname "mombot.cts"
	end
	load "scripts\"&$bot~mombot_directory&"\mombot.cts"
	halt
return

:dockit
	send "nsy"
	waitfor "Locating beam pinpointed"
	send "y"
	waitfor "Sector"
	send "ps"
		setTextTrigger shipCheckRestockDock :shipCheckRestockDock "StarDock> Where to?"
		setTextLineTrigger shipCheckRestockLimpet :shipCheckRestockLimpet "their sensors have detected a Limpet tracking mine somewhere on"
		pause
		:shipCheckRestockLimpet
			send "y"
			pause
		:shipCheckRestockDock
			killalltriggers
			
		send "h"
		send "'*" & $stuff & "**"
	goto :startbot

:findSafeSector
	
	send "s"
	waitfor "Warps to Sector(s)"
		

	getNearestWarps $nearArray CURRENTSECTOR
	setVar $i 1
	while ($i <= $nearArray)

		GetSectorParameter $nearArray[$i] "FIGSEC" $isfigged

		if ($isfigged = "1")
		
			getDistance $dist CURRENTSECTOR $nearArray[$i]
			if ($dist > 2)

				setVar $y 1
				setVar $notsafe 0
				
				while ($y <= SECTOR.WARPCOUNT[$nearArray[$i]])
					GetSectorParameter SECTOR.WARPS[$nearArray[$i]][$y] "FIGSEC" $isfigged
			echo SECTOR.WARPS[$nearArray[$i]][$y] " " $isfigged "*"
					if ($isfigged = "0")
						setVar $notsafe 1
					end
					add $y 1
				end
				if ($notsafe = 0)
					setVar $safeSector $nearArray[$i]
	
					return
				end

			end
	
		end
		add $i 1
	end

return



:startUp
	gosub :BOT~loadVars

	setVar $BOT~help[1]  $BOT~tab&"       fff [{first}/{swings}] {hit_threshold} *"
	setVar $BOT~help[2]  $BOT~tab&"       {first} Shoots on first fig hit - no swings/threshold"
	setVar $BOT~help[3]  $BOT~tab&"       {swings} Lets this many hits before firing  "
	setVar $BOT~help[4]  $BOT~tab&"       {hit_threshold} Time between each hit in seconds*"
	setVar $BOT~help[5]  $BOT~tab&"       Fires photon at ship after {swings} fig hits "
	setVar $BOT~help[6]  $BOT~tab&"       with {hit_threshold} between hits. "
	setVar $BOT~help[7]  $BOT~tab&"       "
	setVar $BOT~help[8]  $BOT~tab&"       Default: One Swing, then fires on 2nd hit within *20 seconds."
	setVar $BOT~help[9]  $BOT~tab&"       "
	setVar $BOT~help[10]  $BOT~tab&"       "
	setVar $BOT~help[11]  $BOT~tab&"       To Restart Normal Mode SubSpace: FFF STOP"

	gosub :bot~helpfile

	setVar $BOT~script_title "Fn Fast Foton"
	gosub :BOT~banner
	
		
	getWord $bot~user_command_line $bot~parm1 1
	getWord $bot~user_command_line $bot~parm2 2

	if (($bot~parm1 = "zero") or ($bot~parm1 = "first"))
		setVar $numberofhits 0
		setVar $noreset 1
	elseif ($bot~parm1 <> 0)
		isNumber $test $bot~parm1
		if ($test)
			setVar $numberofhits $bot~parm1
		else
			setVar $numberofhits 1
		end
		if ($bot~parm2 <> 0)
			isNumber $test $bot~parm2
			if ($test)
				setVar $fizzletime ($bot~parm2 * 1000)
			else
				setVar $SWITCHBOARD~message "Hit Threshold should be a number.*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
			 
		end
		
	end

	# in future we will support b-warp
	setVar $planet~planetMode 1

	gosub :player~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation <> "Citadel")
		setVar $SWITCHBOARD~message "Start at the citadel.*"
		gosub :SWITCHBOARD~switchboard
		halt

	end
	if ($PLAYER~PHOTONS < 1)
		setVar $SWITCHBOARD~message "What, You going to fire off verbal barrage? Get some Photons!*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($numberofhits = 0)
		send "'FFF Shooting after first hit*"
	else
		send "'FFF Shooting after this many hits: " $numberofhits ", with " $fizzletime " between hits*"
	end
	send "qdc"
	waitfor "Planet #"
	getWord CURRENTLINE $planet~planetNum 2
	stripText $planet~planetNum "#"
	waitfor "<Enter Citadel>"

	send "qql" $planet~planetNum "*c"
	waitfor "<Enter Citadel>"

	setVar $momname "" 
return

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
