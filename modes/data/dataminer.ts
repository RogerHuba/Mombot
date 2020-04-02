		gosub :BOT~loadVars
	loadVar $bot~silent_running

	setVar $BOT~help[1]  $BOT~tab&"Dataminer - Grabs Game Information.  "
	setVar $BOT~help[2]  $BOT~tab&"       "
	setVar $BOT~help[3]  $BOT~tab&"Dataminer Options: "
	setVar $BOT~help[4]  $BOT~tab&"     [map] - Create text file for all sectors"
	setVar $BOT~help[5]  $BOT~tab&"           - deadends, 2way, 3way..."
	setVar $BOT~help[6]  $BOT~tab&"    [port] - Create all port reports"
	setVar $BOT~help[7]  $BOT~tab&" [blister] - looks for blister (U bubbles)"
	setVar $BOT~help[8]  $BOT~tab&"  [tunnel] - Create text file for tunnels and missing tunnels"
	setVar $BOT~help[9]  $BOT~tab&" [traffic] - Create traffic analysis file"
	setVar $BOT~help[10]  $BOT~tab&"     [ss] - Displays data over SS (NOT IMPLEMENTED)"

		gosub :bot~helpfile
		setVar $BOT~script_title "Dataminer"
		gosub :BOT~banner
	getWordPos $bot~user_command_line $pos "setparm"
	if ($pos > 0)
			 setvar $setparm TRUE
		end
		gosub :PLAYER~quikstats
		setvar $path "scripts/"&$bot~mombot_directory&"/games/" & GAMENAME & "/"
		getWordPos $bot~user_command_line $pos "map"
		if ($pos > 0)
			delete $path & "deadend.txt"
			delete $path & "missingdeadends.txt"
			delete $path & "2way.txt"
			delete $path & "missing2way.txt"
			delete $path & "3way.txt"
			delete $path & "missing3way.txt"
			delete $path & "4way.txt"
			delete $path & "missing4way.txt"
			delete $path & "5way.txt"
			delete $path & "missing5way.txt"
			delete $path & "6way.txt"
			delete $path & "missing6way.txt"
			delete $path & "7way.txt"
			delete $path & "missing7way.txt"
			echo "*[[Mapping the universe]]*"
			gosub :mapitall
			goto :donedataminer
		end
	getWordPos $bot~user_command_line $pos "port"
	if ($pos > 0)
		 delete $path & sellers.txt
		 delete $path & buyers.txt
			 delete $path & fuel.txt
			 gosub :tunnelfind
			 gosub :makeMissingTunnels
		end
	getWordPos $bot~user_command_line $pos "tunnel"
	if ($pos > 0)
		 delete $path & tunnel.txt
		 delete $path & tunnel_list.txt
			 delete $path & missingtunnel.txt
			 gosub :tunnelfind
			 gosub :makeMissingTunnels
		end
	getWordPos $bot~user_command_line $pos "blister"
	if ($pos > 0)
		 delete $path & blister.txt
			 gosub :blisterfind
		end
	getWordPos $bot~user_command_line $pos "traffic"
	if ($pos > 0)
		delete $path & traffic.txt
		gosub :trafficfind
	end
	:donedataminer
	if ($subspace = TRUE)
		 setVar $SWITCHBOARD~message "Dataminer finished.*"
		 gosub :SWITCHBOARD~switchboard
	else
		 setVar $SWITCHBOARD~message "Dataminer finished, files written.*"
		 gosub :SWITCHBOARD~switchboard
	end
HALT

:mapitall
setarray $warps 7 
setvar $warps 7
setvar $warps[1] "deadend"
setvar $warps[2] "2way"
setvar $warps[3] "3way"
setvar $warps[4] "4way"
setvar $warps[5] "5way"
setvar $warps[6] "6way"
setvar $warps[7] "7way"


setvar $count 1
while ($count <= SECTORS)
	getSectorParameter $count "FIGSEC" $isfigged
	setvar $i 1
	while ($i <= $warps)
		setvar $file $path&$warps[$i]&".txt"
		setvar $missing_file $path&"missing"&$warps[$i]&".txt"
		setvar $label $warps[$i]
		uppercase $label
		if (SECTOR.WARPINCOUNT[$count] = $i)
			setSectorParameter $count $label TRUE
			if (SECTOR.WARPCOUNT[$count] >= 1)
				write $file $count&" has "&SECTOR.WARPCOUNT[$count]&" ways out."
			else
				write $file $count
			end
			if ($isfigged = false)
				write $missing_file $count
			end
		else
			setSectorParameter $count $label ""
		end
		add $i 1
	end
	add $count 1	
	setVar $percTest (($count * 100) / SECTORS)
	if ($percTest > $perc)
		setVar $perc (($count * 100) / SECTORS)
		echo "*"
		echo #27 "["&($perc / 2)&"C"
		echo ANSI_14 "°" ANSI_15 " " $perc "%" #27 & "[1A   "
		setdelaytrigger stopdelay :keepgoing 100
		pause
		:keepgoing
			send #27

	end
end
return


:tunnelfind
setVar $twoWarpSectors 0
setArray $twoWarps 0
setArray $tunnelSec SECTORS
setVar $i 11
while ($i <= SECTORS)
	if (SECTOR.WARPCOUNT[$i]=2) and (SECTOR.BACKDOORCOUNT[$i]=0)
		add $twoWarpSectors 1
		setVar $twoWarpSectors[$twoWarpSectors] $i
		setVar $twoWarps[$i] 1
	end
	add $i 1
end
setVar $i 1
while ($i <= $twoWarpSectors)
	setVar $2Warp $twoWarpSectors[$i]
	setVar $tunnel $2Warp
	setVar $tunnelLength 1
	setVar $invalid 0
	setVar $checked[$2Warp] 1
	setVar $queue[1][1] SECTOR.WARPS[$2Warp][1]
	setVar $queue[2][1] SECTOR.WARPS[$2Warp][2]
	setVar $a 1
	setVar $b 1
	setVar $top 1
	while ($a < 3)
		while ($queue[$a][$b] <> 0) and ($checked[$queue[$a][$b]] = 0)
			setVar $focus $queue[$a][$b]
			setVar $checked[$focus] 1
			if ($deadEnds[$focus] = 1)
				setVar $invalid 1
			end
			if ($twoWarps[$focus] = 1)
				add $tunnelLength 1
				if ($a = 1)
					setVar $tunnel $focus & " " & $tunnel
				else
					setVar $tunnel $tunnel & " " & $focus
				end
				if ($checked[SECTOR.WARPS[$focus][1]] = 0)
					add $top 1
					setVar $queue[$a][$top] SECTOR.WARPS[$focus][1]
				elseif ($checked[SECTOR.WARPS[$focus][2]] = 0)
					add $top 1
					setVar $queue[$a][$top] SECTOR.WARPS[$focus][2]
				end
			end
			add $b 1
		end
		setVar $b 1
		setVar $top 1
		add $a 1
	end
	if ($tunnelLength > 1) and ($invalid = 0)
		setvar $tempTunnelLength $tunnelLength
		while ($tempTunnelLength > 0)
			getword $tunnel $tempTunnelSec $tempTunnelLength
			setvar $tunnelSec[$tempTunnelSec] 1
			add $tunnelSec 1
			subtract $tempTunnelLength 1
		end
		write $path & tunnel.txt $tunnel
	end
	add $i 1
end
setvar $count 1
while ($count <= SECTORS)
	if ($tunnelSec[$count] = 1)
		write $path & tunnel_list.txt $count
	end
	add $count 1
end
write $path & tunnel_list.txt "Total Tunnel Sectors: " & $tunnelSec
return

:makeMissingTunnels
setvar $count 1
while ($count <= SECTORS)
	getSectorParameter $count FIGSEC $isfigged
	if ($tunnelSec[$count] = 1)
		if ($isfigged = false) AND ($visiblePorts[$count] = 0)
			write $path & missingtunnel.txt $count
		end
	end
	add $count 1
end

return

:blisterfind
setvar $currsec 11
while ($currsec <= SECTORS)
	if (SECTOR.WARPINCOUNT[$currsec] = 2) AND (SECTOR.WARPCOUNT[$currsec] >= 2)
		setvar $onehop1 SECTOR.WARPS[$currsec][1]
		setvar $onehop2 SECTOR.WARPS[$currsec][2]
		if (SECTOR.WARPCOUNT[$onehop1] >= 2) AND (SECTOR.WARPCOUNT[$onehop2] >= 2)
			GetDistance $dist1to2 $onehop1 $onehop2
			GetDistance $dist2to1 $onehop2 $onehop1
			if ($dist1to2 = 1) AND ($dist1to2 = 1)
			write $path & blister.txt $onehop1 & " " & $currsec & " " & $onehop2
			end
		end	
	end
	add $currsec 1
end
return

:trafficfind
setArray $leastUsedSec SECTORS
setvar $count 1
setvar $leastUsedSec[STARDOCK] 1
add $leastUsedSec 1
while ($count <= SECTORS)
	if ($deadEnds[$count] = 1)
		getcourse $course STARDOCK $count
		setvar $tempCourseLength ($course + 1)
		while ($tempCourseLength > 1)
			setvar $leastUsedSec[$course[$tempCourseLength]] 1
			subtract $tempCourseLength 1
		end
		getcourse $course $count STARDOCK
		setvar $tempCourseLength ($course + 1)
		while ($tempCourseLength > 1)
			setvar $leastUsedSec[$course[$tempCourseLength]] 1
			subtract $tempCourseLength 1
		end
		getcourse $course 1 $count
		setvar $tempCourseLength ($course + 1)
		while ($tempCourseLength > 1)
			setvar $leastUsedSec[$course[$tempCourseLength]] 1
			subtract $tempCourseLength 1
		end
		getcourse $course $count 1
		setvar $tempCourseLength ($course + 1)
		while ($tempCourseLength > 1)
			setvar $leastUsedSec[$course[$tempCourseLength]] 1
			subtract $tempCourseLength 1
		end
	end
	add $count 1
end
setvar $count 1
while ($count <= SECTORS)
	if ($tunnelSec[$count] = 1)
		setvar $leastUsedSec[$count] 1
	end
	add $count 1
end
setvar $count 1
while ($count <= SECTORS)
	if ($leastUsedSec[$count] = 0)
		write $path & "TRAFFIC.txt" $count & " warps in: " & SECTOR.WARPINCOUNT[$count] & " warps out: " & SECTOR.WARPCOUNT[$count]
	end
	add $count 1
end
return

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
