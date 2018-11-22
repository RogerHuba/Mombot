        logging off
        gosub :BOT~loadVars
	setVar $parm1 $BOT~parm1
	setVar $parm2 $BOT~parm2
	setVar $parm3 $BOT~parm3
	setVar $parm4 $BOT~parm4
	setVar $parm5 $BOT~parm5
	setVar $parm6 $BOT~parm6
	setVar $parm7 $BOT~parm7
	setVar $parm8 $BOT~parm8
	setVar $user_command_line $BOT~user_command_line
	loadVar $silent_running

	setVar $BOT~help[1]  $BOT~tab&"Dataminer - Grabs Game Information.  "
	setVar $BOT~help[2]  $BOT~tab&"       "
	setVar $BOT~help[3]  $BOT~tab&"Dataminer Options: "
	setVar $BOT~help[4]  $BOT~tab&"     [deadend] - Create text file for deadends / missing deadend"
	setVar $BOT~help[5]  $BOT~tab&"     [blister] - will strip fuel off planets"
	setVar $BOT~help[6]  $BOT~tab&"      [tunnel] - Create text file for tunnels and missing tunnels"
	setVar $BOT~help[7]  $BOT~tab&"     [traffic] - Create traffic analysis file"
	setVar $BOT~help[8]  $BOT~tab&"        [2way] - Create text file for 2-way secotors"
	setVar $BOT~help[9]  $BOT~tab&"        [3way] - Create text file for 3-way secotors"
	setVar $BOT~help[10]  $BOT~tab&"        [4way] - Create text file for 4-way secotors"
	setVar $BOT~help[11]  $BOT~tab&"        [5way] - Create text file for 5-way secotors"
	setVar $BOT~help[12]  $BOT~tab&"        [6way] - Create text file for 6-way secotors"
	setVar $BOT~help[13]  $BOT~tab&"    [subspace] - Displays data over SS (NOT IMPLEMENTED)"

        gosub :BOT~help_file
        setVar $BOT~script_title "Dataminer"
        gosub :BOT~banner
	getWordPos $user_command_line $pos "setparm"
	if ($pos > 0)
             setvar $setparm TRUE
        end
        gosub :PLAYER~quikstats

        setvar $path "dataminer\" & GAMENAME & "-"
        getWordPos $user_command_line $pos "deadend"
    	if ($pos > 0)
             delete $path & deadend.txt
	     delete $path & missingdeadends.txt
             gosub :makedeadend
             gosub :makemissingdeadends
        end
        getWordPos $user_command_line $pos "2way"
    	if ($pos > 0)
             delete $path & 2way.txt
	     delete $path & missing2way.txt
             gosub :make2way
             gosub :makemissing2way
        end
        getWordPos $user_command_line $pos "3way"
    	if ($pos > 0)
             delete $path & 3way.txt
	     delete $path & missing3way.txt
             gosub :make3way
             gosub :makemissing3way
        end
        getWordPos $user_command_line $pos "4way"
    	if ($pos > 0)
             delete $path & 4way.txt
	     delete $path & missing4way.txt
             gosub :make4way
             gosub :makemissing4way
        end
        getWordPos $user_command_line $pos "5way"
    	if ($pos > 0)
             delete $path & 5way.txt
	     delete $path & missing5way.txt
             gosub :make5way
             gosub :makemissing5way
        end
        getWordPos $user_command_line $pos "6way"
    	if ($pos > 0)
             delete $path & 6way.txt
	     delete $path & missing6way.txt
             gosub :make6way
             gosub :makemissing6way
        end
        getWordPos $user_command_line $pos "tunnel"
	if ($pos > 0)
	     delete $path & tunnel.txt
	     delete $path & tunnel_list.txt
             delete $path & missingtunnel.txt
             gosub :tunnelfind
             gosub :makeMissingTunnels
        end
	getWordPos $user_command_line $pos "blister"
	if ($pos > 0)
	     delete $path & blister.txt
             gosub :blisterfind
        end
 	getWordPos $user_command_line $pos "traffic"
	if ($pos > 0)
             delete $path & traffic.txt
             gosub :trafficfind
        end
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
	       write $path & deadend.txt $count & " Has " & SECTOR.WARPCOUNT[$count] & " ways out."
                    setSectorParameter $count "DEADEND" TRUE
          else
	       write $path & deadend.txt $count
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
               write $path & missingdeadends.txt $count
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
	  if (SECTOR.WARPCOUNT[$count] > 1)
	       write $path & 2way.txt $count & " Has " & SECTOR.WARPCOUNT[$count] & " ways out."
                    setSectorParameter $count "2WAY" TRUE
          else
	       write $path & 2way.txt $count
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
               write $path & missing2way.txt $count
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
	  if (SECTOR.WARPCOUNT[$count] > 1)
	       write $path & 3way.txt $count & " Has " & SECTOR.WARPCOUNT[$count] & " ways out."
                    setSectorParameter $count "3WAY" TRUE
          else
	       write $path & 3way.txt $count
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
               write $path & missing3way.txt $count
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
	  if (SECTOR.WARPCOUNT[$count] > 1)
	       write $path & 4way.txt $count & " Has " & SECTOR.WARPCOUNT[$count] & " ways out."
                    setSectorParameter $count "4WAY" TRUE
          else
	       write $path & 4way.txt $count
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
               write $path & missing4way.txt $count
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
	  if (SECTOR.WARPCOUNT[$count] > 1)
	       write $path & 5way.txt $count & " Has " & SECTOR.WARPCOUNT[$count] & " ways out."
                    setSectorParameter $count "5WAY" TRUE
          else
	       write $path & 5way.txt $count
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
               write $path & missing5way.txt $count
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
	  if (SECTOR.WARPCOUNT[$count] > 1)
	       write $path & 6way.txt $count & " Has " & SECTOR.WARPCOUNT[$count] & " ways out."
                    setSectorParameter $count "6WAY" TRUE
          else
	       write $path & 6way.txt $count
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
               write $path & missing6way.txt $count
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
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"