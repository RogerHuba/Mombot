gosub :BOT~loadVars


setVar $BOT~help[1]  $BOT~tab&"       Attempts to find a triple SXB combo for team thievery"
setVar $BOT~help[2]  $BOT~tab&"        "
setVar $BOT~help[3]  $BOT~tab&"       findsxb [dist] [mcic1] {mcic2}"
setVar $BOT~help[4]  $BOT~tab&"           {noplots} {twoports}"
setVar $BOT~help[5]  $BOT~tab&" Options:"
setVar $BOT~help[6]  $BOT~tab&"    [dist]     XPort range of evil ship"
setVar $BOT~help[7]  $BOT~tab&"    [mcic1]    MCIC of first port "
setVar $BOT~help[8]  $BOT~tab&"    {mcic2}    MCIC of second port"
setVar $BOT~help[9] $BOT~tab&"                "
setVar $BOT~help[10] $BOT~tab&"    Script starts with findind SXB ports with MCIC1"
setVar $BOT~help[11] $BOT~tab&"    Then finds two more, first with MCIC2 min and last best it"
setVar $BOT~help[12] $BOT~tab&"    can do. "
setVar $BOT~help[13] $BOT~tab&"    Designed for no ztm."
setVar $BOT~help[14] $BOT~tab&"    Does plot some courses to confirm."
setVar $BOT~help[15] $BOT~tab&"    Large dist's will be SLOW."
setVar $BOT~help[16] $BOT~tab&"    "
setVar $BOT~help[17] $BOT~tab&"    {noplots} - when you have ztm"
setVar $BOT~help[18] $BOT~tab&"    {twoports} - when you only need 2"

gosub :bot~helpfile

setVar $BOT~script_title "Finds triple SXB ports for Team SST/SDT"
gosub :BOT~banner


gosub :player~quikstats
setVar $location $player~current_prompt
if ($location <> "Command")
	setVar $SWITCHBOARD~message "Start from Command Prompt.*"
	gosub :switchboard~switchboard
	HALT
end


setVar $noplots 0
setVar $twoports 0
setVar $MCICREQ1 50
setVar $MCICREQ2 50
setVar $MAXDIST 7
	
	getWordPos $bot~user_command_line $pos "twoports"
	if ($pos > 0)
		setVar $twoports 1
		stripText $bot~user_command_line " twoports "
		stripText $bot~user_command_line " twoports"

	end

	getWordPos $bot~user_command_line $pos "noplots"
	if ($pos > 0)
		setVar $noplots 1
		stripText $bot~user_command_line " noplots "
		stripText $bot~user_command_line " noplots"

	end
	


	isNumber $test $bot~parm1
	IF ($test)
		if ($bot~parm1 < 1)
			setVar $SWITCHBOARD~message "Dist should be a number above zero.*"
			gosub :switchboard~switchboard
			HALT
		else
			setVar $MAXDIST $bot~parm1
		end
	ELSE
		setVar $SWITCHBOARD~message "Dist should be a number above zero.*"
		gosub :switchboard~switchboard
		HALT
	END


	isNumber $test $bot~parm2
	IF ($test)
		if (($bot~parm2 < 40) or ($bot~parm2 > 65))
			setVar $SWITCHBOARD~message "MCIC1 shold be from 40 to 65.*"
			gosub :switchboard~switchboard
			HALT
		else
			setVar $MCICREQ1 $bot~parm2
		end
	ELSE
		setVar $SWITCHBOARD~message "MCIC1 shold be from 40 to 65.*"
		gosub :switchboard~switchboard
		HALT
	END

	isNumber $test $bot~parm3
	IF ($test)
		if (($bot~parm3 < 40) or ($bot~parm3 > 65))
			setVar $SWITCHBOARD~message "MCIC2 shold be from 40 to 65.*"
			gosub :switchboard~switchboard
			HALT
		else
			setVar $MCICREQ2 $bot~parm2
		end
	ELSE
		setVar $MCICREQ2 ($MCICREQ1 - 10)
	END

# DISTANCE
# MCIC MIN
#  Ideally file to SSB's
# SBB
# SSB 

#echo $MCICREQ1 "*"
#echo $MCICREQ2 "*"
# sec1 sec2 sec3  MC1 MC2 MC3   dock terra 

setVar $resulti 0
setVar $results ""

setVar $mciccut1 0
setVar $mciccut2 0
subtract $mciccut1 $MCICREQ1 
subtract $mciccut2 $MCICREQ2 
#echo $mciccut1 "*"
#echo $mciccut2 "*"
setVar $targets 0
setVar $targetsi 0
setVar $SWITCHBOARD~message "This will take a couple of minutes...*"
gosub :switchboard~switchboard

setVar $i 11

clearallavoids

# Find sectors with the right port and the right MCIC

while ($i <= SECTORS)
	
	if ((PORT.CLASS[$i] = 3) or (PORT.CLASS[$i] = 4))
		getSectorParameter $i "EQUIPMENT-" $mc_orig
		if ($mc_orig <> "")
			if ($mc_orig < $mciccut1)
				add $targetsi 1
				setVar $targets[$targetsi] $i
	#echo "Added Target: " $i "*"
			end
		end
	end
	add $i 1
end

if ($targetsi > 0)
	setVar $SWITCHBOARD~message "Potenial First Ports Found.. confirming distances*"
	gosub :switchboard~switchboard
else
	setVar $SWITCHBOARD~message "No Targets Found! exiting..*"
	gosub :switchboard~switchboard
	halt
end
setVar $i 1

# Plot courses to ensure we have ZTM
if ($noplots = 0)
	while ($i <= $targetsi)
		setVar $search $targets[$i]
		getNearestWarps $nearArray $search
		#class 3 4
		setVar $y 2
		while ($y <= $nearArray)
			setVar $focus $nearArray[$y]
			if ((PORT.CLASS[$focus] = 3) or (PORT.CLASS[$focus] = 4))
				goSub :sendDistance 
			end
			add $y 1
		end

		add $i 1
	end
end

setVar $SWITCHBOARD~message "Finding secondary ports..*"
gosub :switchboard~switchboard
setVar $i 1

while ($i <= $targetsi)
	setVar $search $targets[$i]
	getNearestWarps $nearArray $search
	getSectorParameter $search "EQUIPMENT-" $mc_orig
	setVar $cans 0
	setVar $cani 0
	setVar $maybe 0
	setVar $maybei 0

	#class 3 4
	# Lets find ports in range as the second port -
	setVar $y 2
	while ($y <= $nearArray)
		
		setVar $focus $nearArray[$y]
		if ((PORT.CLASS[$focus] = 3) or (PORT.CLASS[$focus] = 4))
			getDistance $dist1 $search $focus
			getDistance $dist2 $focus $search

			if (($dist1 > 0) and ($dist2 > 0))
				if (($dist1 <= $MAXDIST) and ($dist2 <=$MAXDIST))
					#echo $search " txxo " $dist1 ": " $focus "*"
					#echo $focus " txxo " $dist2 ": " $search "*"
					getSectorParameter $focus "EQUIPMENT+" $mc
					if ($mc <> "")
						if ($mc < $mciccut2)
							add $cani 1
							setVar $cans[$cani] $focus
							setVar $cansMc[$cani] $mc 
echo "CAndidate: " $search " (" $dist1 ")(" $mc_orig ") <> " $focus " (" $dist2 ")(" $mc ")*"
							setVar $SWITCHBOARD~message "Secondary found.. searching for more*"
							gosub :switchboard~switchboard
						else
							add $maybei 1
							setVar $maybe[$maybei] $focus
						end
					else
						add $maybei 1
						setVar $maybe[$maybei] $focus
					end
				end
			end
		end
		
# 5419


		add $y 1
	end
	if ($twoports = 0)

		if ($cani > 0)
			setVar $SWITCHBOARD~message "Candidate Found.. Checking for Tertiary port*"
			gosub :switchboard~switchboard
			setVar $port3 0
			setVar $port3MC 0
			setVar $y 1
			while ($y <= $cani)

		#echo "TEsting: " $search " with " $cans[$y] " *"
				# Lop thru can's and then loopthrough maybe's to see if thye are in range
				setVar $port3 0
				setVar $port3MC 0
				setVar $x 1
				while ($x <= $maybei)

					getDistance $dist1 $cans[$y] $maybe[$x]
					getDistance $dist2 $maybe[$x] $cans[$y]

			#echo $dist1 " " $dist2 " *"

					if (($dist1 <= $MAXDIST) and ($dist2 <=$MAXDIST))
						#echo $cans[$y] " to " $maybe[$x] ": " $dist1 "*"
						#echo $maybe[$x] " to " $cans[$y] ": " $dist2 "*"
						getSectorParameter $maybe[$x] "EQUIPMENT+" $mc
						if ($mc = "")
							setVar $mc 0
						end
						if ($port3 = 0)
							setVar $port3 $maybe[$x]
							setVar $port3MC $mc
						else
							if ($mc > $port3MC)
								setVar $port3 $maybe[$x]
								setVar $port3MC $mc
							else
		#echo "Rejected maybe: " $maybe[$x] ":" $mc "*"
							end
						end
					end
					add $x 1
				end
			#echo "Best Candidates are " $search " "  $cans[$y] " " $port3 "*"
			if ($port3 <> 0)
				setVar $SWITCHBOARD~message "Tertiary found.. checking for more*"
				gosub :switchboard~switchboard
				gosub :sendDistance3
			else
				setVar $SWITCHBOARD~message "Tertiary no good.. continuing*"
				gosub :switchboard~switchboard
			end
				add $y 1
			end
		end
	else
		if ($cani > 0)
			setVar $SWITCHBOARD~message "Candidates Found..two port option.. picking best*"
			gosub :switchboard~switchboard
			setVar $bestmc 0
			setVar $bestPort 0
			setVar $y 1
			while ($y <= $cani)	
				if ($cansMc[$y] < $bestmc)
					setVar $bestmc $cansMc[$y]
					setVar $bestPort $cans[$y]
				end
				add $y 1
			end

			add $resulti 1
			setVar $results[$resulti][1] $search
			setVar $results[$resulti][2] $bestPort
			setVar $results[$resulti][3] "skip"
			setVar $results[$resulti][4] $mc_orig
			setVar $results[$resulti][5] $bestmc
			setVar $results[$resulti][6] "skip"

		end
	end
	add $i 1
end

#echo "**"
#echo "FINAL REPORT*"

setVar $stuff "Final Report*"
setVar $i 1

while ($i < $resulti)
	
	#echo "A:" $results[$i][1] " ( " $results[$i][4] "/" $results[$i][7] ") "
	#echo "B:" $results[$i][2] " ( " $results[$i][5] "/" $results[$i][8] ") "
	#echo "C:" $results[$i][3] " ( " $results[$i][6] "/" $results[$i][9] ") *"
	
	setVar $stuff $stuff& "A:" & $results[$i][1] & " ( " & $results[$i][4] & "/" & $results[$i][7] & ") "
	setVar $stuff $stuff& "B:" & $results[$i][2] & " ( " & $results[$i][5] & "/" & $results[$i][8] & ") "
	setVar $stuff $stuff& "C:" & $results[$i][3] & " ( " & $results[$i][6] & "/" & $results[$i][9] & ") *"
	

	add $i 1
end

setVar $stuff $stuff & "*"
setvar $switchboard~message $stuff 
gosub :switchboard~switchboard

halt

:findbest3rd


return
:sendDistance3
	setVar $distError FALSE

	if ($noplots = 0)
		send "cf" $search "*" $cans[$y] "*"
		waitfor "The shortest path ("
		getWord CURRENTLINE $dist 4 
		stripText $dist "("
	else
		getDistance $dist $search $cans[$y]
	end

	if ($dist > $MAXDIST)
		setVar $distError TRUE
	end
	if ($noplots = 0)
		send "f" $cans[$y] "*" $search "*"
		waitfor "The shortest path ("
		getWord CURRENTLINE $dist 4 
		stripText $dist "("
	else
		getDistance $dist $cans[$y] $search
	end

	if ($dist > $MAXDIST)
		setVar $distError TRUE
	end
	if ($noplots = 0)
		send "f" $port3 "*" $cans[$y] "*"
		waitfor "The shortest path ("
		getWord CURRENTLINE $dist 4 
		stripText $dist "("
	else
		getDistance $dist $port3 $cans[$y]
	end

	if ($dist > $MAXDIST)
		setVar $distError TRUE
	end
	
	if ($noplots = 0)
		send "f" $cans[$y] "*" $port3 "*"
		waitfor "The shortest path ("
		getWord CURRENTLINE $dist 4 
		stripText $dist "("
	else
		getDistance $dist $cans[$y] $port3
	end

	if ($dist > $MAXDIST)
		setVar $distError TRUE
	end

	if ($noplots = 0)
		send "f" $port3 "*" $search "*"
		waitfor "The shortest path ("
		getWord CURRENTLINE $dist 4 
		stripText $dist "("
	else
		getDistance $dist $port3 $search
	end

	if ($dist > $MAXDIST)
		setVar $distError TRUE
	end

	if ($noplots = 0)
		send "f" $search "*" $port3 "*"
		waitfor "The shortest path ("
		getWord CURRENTLINE $dist 4 
		stripText $dist "("
	else
		getDistance $dist $search $port3
	end

	if ($dist > $MAXDIST)
		setVar $distError TRUE
	end
	if ($noplots = 0)
		send "q"
		waitfor "Computer deactivated>"
	end

	if ($distError = FALSE)
		
		# sec1 sec2 sec3  MC1 MC2 MC3   dock terra 

		add $resulti 1
		setVar $results[$resulti][1] $search
		setVar $results[$resulti][2] $cans[$y]
		setVar $results[$resulti][3] $port3
		setVar $results[$resulti][4] $mc_orig
		setVar $results[$resulti][5] $cansMc[$y]
		setVar $results[$resulti][6] $port3MC
		
		if ($noplots = 0)
			send "cf" STARDOCK "*" $results[$resulti][1] "*"
			waitfor "The shortest path ("
			getWord CURRENTLINE $dist 4 
			stripText $dist "("
			setVar $results[$resulti][7] $dist

			send "f" STARDOCK "*" $results[$resulti][2] "*"
			waitfor "The shortest path ("
			getWord CURRENTLINE $dist 4 
			stripText $dist "("
			setVar $results[$resulti][8] $dist

			send "f" STARDOCK "*" $results[$resulti][3] "*q"
			waitfor "The shortest path ("
			getWord CURRENTLINE $dist 4 
			stripText $dist "("
			setVar $results[$resulti][9] $dist
		else
			
			getDistance $dist STARDOCK $results[$resulti][1] 
			setVar $results[$resulti][7] $dist
			getDistance $dist STARDOCK $results[$resulti][2] 
			setVar $results[$resulti][8] $dist
			getDistance $dist STARDOCK $results[$resulti][3] 
			setVar $results[$resulti][9] $dist

		end


	end

return

:sendDistance
	
	if ($noplots = 0)
		send "cf" $search "*" $focus "*"
		send "f" $focus "*" $search "*"
		send "q"

		waitfor "The shortest path ("
		getWord CURRENTLINE $dist1 4 
		waitfor "The shortest path ("
		getWord CURRENTLINE $dist2 4 
		waitfor "Computer deactivated>"
		stripText $dist1 "("
		stripText $dist2 "("
	else
		getDistance $dist1 $search $focus
		getDistance $dist2 $focus $search
	end
echo "DIST:" $dist1 " " $dist2 " **"
	
	if (($dist1 > $MAXDIST) and ($dist2 > $MAXDIST))
		setVar $y 99999
	end


return


include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
