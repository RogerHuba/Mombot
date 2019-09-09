	reqRecording
	logging off
	gosub :BOT~loadVars
	loadVar $MAP~STARDOCK
	loadVar $MAP~BACKDOOR

	if ($bot~param1 = "help")
		setVar $BOT~help[1]  $BOT~tab&"probethis [param] {void} {restock} "
		setVar $BOT~help[2]  $BOT~tab&"     "
		setVar $BOT~help[3]  $BOT~tab&"Will ether probe all sectors marked with param selected."
		setVar $BOT~help[4]  $BOT~tab&" 	   {param examples:}"
		setVar $BOT~help[5]  $BOT~tab&"     	- all"
		setVar $BOT~help[6]  $BOT~tab&"     	- unexplored "
		setVar $BOT~help[7]  $BOT~tab&"     	- msl"
		setVar $BOT~help[8]  $BOT~tab&"     	- bubble"
		setVar $BOT~help[9]  $BOT~tab&"     	- uppedport (custom from query command)"
		setVar $BOT~help[10] $BOT~tab&"     {void}  - Will void sectors where probe destroyed"
		setVar $BOT~help[11] $BOT~tab&"     {restock}  - Will attempt to restock probes even if not at stardock"
		setVar $BOT~help[12] $BOT~tab&"     {destroy}  - Will broadcast destroyed sector probes on ss"
		setVar $BOT~help[13] $BOT~tab&"     {ss}  - Will broadcast traders, ships, and planets on ss"
		setVar $BOT~help[14] $BOT~tab&"     {trader}  - Will broadcast traders on ss"
		setVar $BOT~help[15] $BOT~tab&"     {ships}  - Will broadcast empty ships on ss"
		setVar $BOT~help[16] $BOT~tab&"     {planets}  - Will broadcast planets on ss"
		setVar $BOT~help[17] $BOT~tab&"     {aliens}  - Will broadcast aliens and alien space on ss"
		setVar $BOT~help[18] $BOT~tab&" "
		setVar $BOT~help[19] $BOT~tab&"     Example: probethis uppedports restock void ss"
		gosub :bot~helpfile
		setVar $SWITCHBOARD~message "Help file written / rewritten*"
		gosub :SWITCHBOARD~switchboard
		HALT
	end


	if ($bot~parm1 <> "")
		setVar $bot~parmAM $bot~parm1
		upperCase $bot~parmAM
	end
	gosub :player~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	send "** "
	if (($startingLocation <> "Citadel") AND ($startingSector <> "Planet"))
		if ($startingLocation = "Command")
			setVar $restock FALSE
		else
			setVar $SWITCHBOARD~message "Must be in Command, Citadel or Planet prompt to run*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
	end

       	getWordPos $bot~user_command_line $pos "restock"
	if ($pos > 0)
		setVar $restock_active TRUE
	else
		setVar $restock_active FALSE
	end

	getWordPos $bot~user_command_line $pos "void"
	if ($pos > 0)
		setVar $void_active TRUE
	else
		setVar $void_active FALSE
	end
	
	getWordPos $bot~user_command_line $pos "report"
	if ($pos > 0)
		setVar $report_active TRUE
	else
		setVar $report_active FALSE
	end

	getWordPos $bot~user_command_line $pos "ss"
	if ($pos > 0)
		setVar $void_active TRUE
	else
		setVar $void_active FALSE
	end

		getWordPos $bot~user_command_line $pos "destroy"
	if ($pos > 0)
		setVar $void_active TRUE
	else
		setVar $void_active FALSE
	end

	if ($startingLocation = "Citadel")
		send "s* q "
	end

	setVar $shipCount 0
	if (($startingLocation = "Planet") OR ($startingLocation = "Citadel"))
		gosub :PLANET~GETPLANETINFO
		send "q "
		setvar $restock TRUE
	end
	send "*"

	getWordPos $bot~user_command_line $pos "unexplored"
	if ($pos > 0)
		setvar $unexplored true
	else
		setvar $unexplored false
	end

	gosub :getTargets

	setvar $switchboard~message "Starting up probe this!  Probing all unexplored sectors with "&$bot~parmAM&" set.*"
	gosub :switchboard~switchboard

	if ($databasecount <= 0)
		setvar $switchboard~message "No sector parameters found for "&$bot~parmAM&" set to a value of "&$output&" or already explored.*"
		gosub :switchboard~switchboard
		halt
	end
	window gridder 350 450 "Mowing to probe this: ["&$bot~parmAM&"]" ontop 

	:do_again
		gosub :player~quikstats
		if ($player~eprobes <= 0)
			if (($player~credits > 100000) AND ($restock = TRUE))
				gosub :restock
			else
				setVar $switchboard~message "Out of e-probes and can't restock.*"
				gosub :switchboard~switchboard
				halt
			end
		end
		getRnd $random 1 $databaseCount
		getWord $randomSectors $destination $random
		if ($destination = 0)
			setVar $switchboard~message "All sectors probed.*"
			gosub :switchboard~switchboard
			halt		
		else
			send "e"&$destination&"*"
			settextlinetrigger 1 :next "Probe Self Destructs"
			settextlinetrigger 2 :destroyed "Probe Destroyed!"
			settextlinetrigger 3 :next "You are already in that sector!"
			settextlinetrigger 4 :get_info "Probe entering sector :"
			pause
		end

                :get_info
#			killtrigger 1
#			killtrigger 2
			killtrigger 3
			killtrigger 4
			getWord CURRENTLINE $Last_Entering_Sector 5
			setVar $temp " "&$Last_Entering_Sector&" "
			getwordpos $randomSectors $pos $temp 
			if ($pos > 0)
				echo "*Removing sector: ["&$Last_Entering_Sector&"]*"
				#if eprobe sees a sector we were going to eprobe later, remove it as seen#
				replaceText $randomSectors $temp " "
				subtract $databasecount 1	
			end
# 		        setVar $record_text[$count1] CURRENTLINE
#  		        getWordPos $record_text[$count1] $traders "Traders :"
# 		        getWordPos $record_text[$count1] $ships "Ships   :"
#    		        getWordPos $record_text[$count1] $planets "Planets :"
#    		        getWordPos $record_text[$count1] $class0 "Class 0 (Special)"
#    		        getWordPos $record_text[$count1] $feds "Federals:"
#    		        getWordPos $record_text[$count1] $sector_Rpt_Test "Sector  :"
#                        pause

                :destroyed
			killtrigger 1
			killtrigger 2
			killtrigger 3
			killtrigger 4

 		:next
			killtrigger 1
			killtrigger 2
			killtrigger 3
			killtrigger 4
			setVar $temp " "&$destination&" "
			replaceText $randomSectors $temp " "
			subtract $databasecount 1	
			setvar $window_content "*      Targets left to probe:"&$databaseCount&"*"
			savevar $window_content
			setWindowContents gridder $window_content

	goto :do_again

:getTargets
	setVar $databasecount 0
	setVar $randomSectors "  "
	setVar $path_database "  "
	setVar $perc 0
	setVar $i 1
	while ($i <= SECTORS)
		getWordPos $path_database $pos " "&$i&" "
		if ($pos <= 0)
			getSectorParameter $i $bot~parmAM $isTrue
			if (($isTrue = TRUE) and (((SECTOR.EXPLORED[$i] <> "YES") and ($unexplored = true)) or ($unexplored = false)))
				setVar $randomSectors $randomSectors&" "&$i&"  "
				add $databasecount 1
				getCourse $path $player~current_sector $i 
				if ($path = "-1")
					#send "/"
					#waitOn #179
					#echo ANSI_14 "Updating database...*" ANSI_7
					#send "^f"&$player~current_sector&"*"&$i&"**q"
					#waitOn "ENDINTERROG"
					#getCourse $path $player~current_sector $i 
				else
					setVar $j 2
					while ($j <= $path)
						setVar $path_database $path_database&" "&$path[$j]&" "
						add $j 1
					end
				end
			end
		end
		setVar $percTest (($i * 100) / SECTORS)
		if ($percTest > $perc)
			setVar $perc (($i * 100) / SECTORS)
			echo "*"
			echo #27 "["&($perc / 2)&"C"
			echo ANSI_14 "�" ANSI_15 " " $perc "%" #27 & "[1A   "
		end
		add $i 1
	end
return

:restock
KillAllTriggers
SetTextLineTrigger sdyes :sdyes "Commerce report for Stargate Alpha I:"
SetTextLineTrigger sdno1  :sdno  "You have never visted sector"
SetTextLineTrigger sdno2  :sdno  "I have no information about a port in that sector."
setDelayTrigger sdno3 :sdno 10000
#had to add WaitFors b/c AllKeys was bypassing display
send "C"
WaitFor "<Computer activated>"
send "R"
WaitFor "What sector is the port"
send $map~stardock "*"

Pause
Pause

:sdno
	send "q"
	setVar $SWITCHBOARD~message "SD is not in that sector, or never been visited!! Shutting down in starting sector.*"
	gosub :SWITCHBOARD~switchboard
	HALT

:sdyes
	send "ql "&$planet~planet&"* t * l 1 * t * l 2 * t * l 3 * s * l 1 * s * l 2 * s * l 3 * t * t1*m* * * q "
	WaitFor "Command [TL"

if (($map~backdoor <> 0) and ($player~ALIGNMENT < 1000))
	KillAlltriggers
	SetTextTrigger nofig :nofig "Do you want to make this jump blind?"
	SetTextTrigger ready1 :ready1 "Locating beam pinpointed,"
    SetTextTrigger nofuel2 :nofuel "You do not have enough Fuel Ore to make the jump"	
	send "m" $map~backdoor "*y"
	Pause
    Pause
End
SetTextTrigger nofig :nofig "Do you want to make this jump blind?"
SetTextTrigger ready2 :ready2 "All Systems Ready, shall we engage?"
SetTextTrigger nofuel1 :nofuel "You do not have enough Fuel Ore to make the jump"	
send "nsy"
Pause
Pause

:nofig
KillAlltriggers
send "n"
setVar $SWITCHBOARD~message "No fig at target sector. Shutting Down*"
gosub :SWITCHBOARD~switchboard
HALT

:nofuel
KillAlltriggers
setVar $SWITCHBOARD~message "No fuel for twarp. Shutting Down*"
gosub :SWITCHBOARD~switchboard
HALT

:ready1
KillAlltriggers
SetTextTrigger limpet :limpet "ort official runs up"
SetTextTrigger buytorps :buytorps "<StarDock> Where to?"
send "YNS P S"
Pause
Pause

:ready2
KillAllTriggers
SetTextTrigger limpet :limpet "ort official runs up"
SetTextTrigger buytorps :buytorps "<StarDock> Where to?"
send "Y PS"
Pause
Pause

:limpet
send "Y"
Pause

:buytorps
KillAlltriggers
SetTextTrigger torps :torps "How many Probes do you want"
send "HE"
Pause
Pause

:torps 
GetWord CURRENTLINE $numtorps 8
StripText $numtorps ")"
send $numtorps & "*"
send "Q Q M " & $player~current_sector & " * Y"
SetTextTrigger nofig :nofig "Do you want to make this jump blind?"
SetTextTrigger ready3 :ready3 "Locating beam pinpointed,"
SetTextTrigger nofuel :nofuel "You do not have enough Fuel Ore to make the jump"
Pause
Pause

:ready3
send "Y"
WaitFor "Command [TL"
send "l "&$planet~planet&"* t n l 1* q q * j y * "
Return



#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\player\currentprompt\player"
