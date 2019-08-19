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
		setvar $path "scripts/mombot/games/" & GAMENAME & "-"
		getWordPos $bot~user_command_line $pos "map"
		if ($pos > 0)
			delete $path & deadend.txt
			delete $path & missingdeadends.txt
			delete $path & 2way.txt
			delete $path & missing2way.txt
			delete $path & 3way.txt
			delete $path & missing3way.txt
			delete $path & 4way.txt
			delete $path & missing4way.txt
			delete $path & 5way.txt
			delete $path & missing5way.txt
			delete $path & 6way.txt
			delete $path & missing6way.txt
			delete $path & 7way.txt
			delete $path & missing7way.txt
			echo "*[[Making deadends]]*"
			gosub :makedeadend
			echo "*[[Making missing Deadends]]*"
			gosub :makemissingdeadends
			echo "*[[Making 2 way]]*"
			gosub :make2way
			echo "*[[Making missing 2 way]]*"
			gosub :makemissing2way
			echo "*[[Making 3 way]]*"
			gosub :make3way
			echo "*[[Making missing 3 way]]*"
			gosub :makemissing3way
			echo "*[[Making 4 way]]*"
			gosub :make4way
			echo "*[[Making missing 4 way]]*"
			gosub :makemissing4way
			echo "*[[Making 5 way]]*"
			gosub :make5way
			echo "*[[Making missing 5 way]]*"
			gosub :makemissing5way
			echo "*[[Making 6 way]]*"
			gosub :make6way
			echo "*[[Making missing 6 way]]*"
			gosub :makemissing6way
			echo "*[[Making 7 way]]*"
			gosub :make7way
			echo "*[[Making missing 7 way]]*"
			gosub :makemissing7way
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

:makedeadend
setArray $deadEnds SECTORS
setvar $count 1
while ($count <= SECTORS)
	if (SECTOR.WARPINCOUNT[$count] = 1)
		setvar $deadEnds[$count] 1
		add $deadEnds 1
		if (SECTOR.WARPCOUNT[$count] >= 1)
			write $path & "deadend.txt" $count & " Has " & SECTOR.WARPCOUNT[$count] & " ways out."
			setSectorParameter $count "DEADEND" TRUE
		else
			write $path & "deadend.txt" $count
		end
	 else
		  setSectorParameter $count "DEADEND" ""
	 end
	 add $count 1
end
return

:makemissingdeadends
setvar $count 1
while ($count <= SECTORS)
	 if (SECTOR.WARPINCOUNT[$count] = 1)
		  if ($figsec[$count] = 0)
			   write $path & "missingdeadends.txt" $count
		  end
	 end
	add $count 1
end
return

:make2way
setArray $2way SECTORS
setvar $count 1
while ($count <= SECTORS)
	 if (SECTOR.WARPINCOUNT[$count] = 2)
		setvar $2way[$count] 1
		add $2way 1
		if (SECTOR.WARPCOUNT[$count] >= 1)
			write $path & "2way.txt" $count & " Has " & SECTOR.WARPCOUNT[$count] & " ways out."
			setSectorParameter $count "2WAY" TRUE
		else
			write $path & "2way.txt" $count
		end
	 else
		  setSectorParameter $count "2WAY" ""
	 end
	 add $count 1
end
return
:makemissing2way
setvar $count 1
while ($count <= SECTORS)
	 if (SECTOR.WARPINCOUNT[$count] = 2)
		  if ($figsec[$count] = 0)
			   write $path & "missing2way.txt" $count
		  end
	 end
	add $count 1
end
return

:make3way
setArray $3way SECTORS
setvar $count 1
while ($count <= SECTORS)
	 if (SECTOR.WARPINCOUNT[$count] = 3)
		  setvar $3way[$count] 1
	  add $3way 1
	  if (SECTOR.WARPCOUNT[$count] >= 1)
		   write $path & "3way.txt" $count & " Has " & SECTOR.WARPCOUNT[$count] & " ways out."
					setSectorParameter $count "3WAY" TRUE
		  else
		   write $path & "3way.txt" $count
	  end
	 
	 else
		  setSectorParameter $count "3WAY" ""
	 end
	 add $count 1
end

return

:makemissing3way
setvar $count 1
while ($count <= SECTORS)
	 if (SECTOR.WARPINCOUNT[$count] = 3)
		  if ($figsec[$count] = 0)
			   write $path & "missing3way.txt" $count
		  end
	 end
	add $count 1
end
return

:make4way
setArray $4way SECTORS
setvar $count 1
while ($count <= SECTORS)
	if (SECTOR.WARPINCOUNT[$count] = 4)
		setvar $4way[$count] 1
		add $4way 1
		if (SECTOR.WARPCOUNT[$count] >= 1)
			write $path & "4way.txt" $count & " Has " & SECTOR.WARPCOUNT[$count] & " ways out."
			setSectorParameter $count "4WAY" TRUE
		else
			write $path & "4way.txt" $count
		end
	else
		setSectorParameter $count "4WAY" ""
	end
	add $count 1
end
return

:makemissing4way
	setvar $count 1
	while ($count <= SECTORS)
		if (SECTOR.WARPINCOUNT[$count] = 4)
			if ($figsec[$count] = 0)
				write $path & "missing4way.txt" $count
			end
		end
		add $count 1
	end
return

:make5way
setArray $5way SECTORS
setvar $count 1
while ($count <= SECTORS)
	 if (SECTOR.WARPINCOUNT[$count] = 5)
		  setvar $5way[$count] 1
	  add $5way 1
	  if (SECTOR.WARPCOUNT[$count] >= 1)
		   write $path & "5way.txt" $count & " Has " & SECTOR.WARPCOUNT[$count] & " ways out."
					setSectorParameter $count "5WAY" TRUE
		  else
		   write $path & "5way.txt" $count
	  end
	 else
		  setSectorParameter $count "5WAY" ""
	 end
	 add $count 1
end
return

:makemissing5way
setvar $count 1
while ($count <= SECTORS)
	 if (SECTOR.WARPINCOUNT[$count] = 5)
		  if ($figsec[$count] = 0)
			   write $path & "missing5way.txt" $count
		  end
	 end
	add $count 1
end
return

:make6way
setArray $6way SECTORS
setvar $count 1
while ($count <= SECTORS)
	if (SECTOR.WARPINCOUNT[$count] = 6)
		setvar $6way[$count] 1
		add $6way 1
		if (SECTOR.WARPCOUNT[$count] >= 1)
			write $path & "6way.txt" $count & " Has " & SECTOR.WARPCOUNT[$count] & " ways out."
			setSectorParameter $count "6WAY" TRUE
		else
			write $path & "6way.txt" $count
		end
	else
		setSectorParameter $count "6WAY" ""
	end
	add $count 1
end
return

:makemissing6way
setvar $count 1
while ($count <= SECTORS)
	 if (SECTOR.WARPINCOUNT[$count] = 6)
		  if ($figsec[$count] = 0)
			   write $path & "missing6way.txt" $count
		  end
	 end
	add $count 1
end
return

:make7way
setArray $7way SECTORS
setvar $count 1
while ($count <= SECTORS)
	if (SECTOR.WARPINCOUNT[$count] = 7)
		setvar $7way[$count] 1
		add $6way 1
		if (SECTOR.WARPCOUNT[$count] >= 1)
			write $path & "7way.txt" $count & " Has " & SECTOR.WARPCOUNT[$count] & " ways out."
			setSectorParameter $count "7WAY" TRUE
		else
			write $path & "7way.txt" $count
		end
	else
		setSectorParameter $count "7WAY" ""
	end
	add $count 1
end
return

:makemissing7way
setvar $count 1
while ($count <= SECTORS)
	 if (SECTOR.WARPINCOUNT[$count] = 7)
		  if ($figsec[$count] = 0)
			   write $path & "missing7way.txt" $count
		  end
	 end
	add $count 1
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
	if ($tunnelSec[$count] = 1)
		if ($figSec[$count] = 0) AND ($visiblePorts[$count] = 0)
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
