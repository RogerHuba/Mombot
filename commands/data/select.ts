	reqRecording
	logging off
	gosub :BOT~loadVars
	setVar $BOT~command "select"
	loadVar $BOT~bot_turn_limit
	loadVar $MAP~stardock
	loadvar $bot~subspace
	loadvar $switchboard~self_command

	setVar $BOT~help[1]   $BOT~tab&"select {planets | traders | ships | anomalies | unexplored | sector | ports}"
	setVar $BOT~help[2]   $BOT~tab&"       {BBB | XXB | SSX etc} {mark:PARAM} {dist | route} "
	setVar $BOT~help[3]   $BOT~tab&"       {warps:n} {beam:botname}"
	setVar $BOT~help[4]   $BOT~tab&"       "
	setVar $BOT~help[5]   $BOT~tab&"     Searches TWX database for known info."
	setVar $BOT~help[6]   $BOT~tab&"      "
	setVar $BOT~help[7]   $BOT~tab&"     {mark:PARAM}  marks sectors PARAM=1 defult QUERY=1 "
	setVar $BOT~help[8]   $BOT~tab&"                   selectors = > < like"
	setVar $BOT~help[9]   $BOT~tab&"     {BBB | SSX}   match PORTS query to this pattern"
	setVar $BOT~help[10]   $BOT~tab&"                   X is wildcard."
	setVar $BOT~help[11]   $BOT~tab&"    {secure | paranoid}  "
	setVar $BOT~help[12]   $BOT~tab&"     Example: >select traders bubble=false equ-mcic<-60 "
	setVar $BOT~help[13]   $BOT~tab&"              >select planet like "&#34&"<<<< (a)"&#34
	setVar $BOT~help[14]   $BOT~tab&"            "
	setVar $BOT~help[15]   $BOT~tab&"           {dist} - All results include distance from current. "
	setVar $BOT~help[16]   $BOT~tab&"          {route} - Plots a basic shortest path (slow). "
	setVar $BOT~help[17]   $BOT~tab&"            {ppt} - Finds port pair trading ports  "
	setVar $BOT~help[18]   $BOT~tab&"        {warps:n} - Restrict matches to nwarps  "
	setVar $BOT~help[19]   $BOT~tab&"   {beam:botname} - Beam to bot name  "
	# ham select ports ore-mcic<-70
	gosub :bot~helpfile

	#setVar $BOT~script_title "Select"
	#gosub :BOT~banner

	setVar $PLAYER~save TRUE


	getSectorParameter SECTORS "FIGSEC" $isFigged


setVar $mark "QUERY"
setVar $portClassOk 8
setVar $portClassWanted 0
#final filter of search results 0 - none, 1 - secure (figs surrounded) 2- PAranoid (Figs + Limps)
setVar $securityLevel 0
setVar $warps 0

setvar $i 1

getWordPos $bot~user_command_line $pos "dist"
if ($pos > 0)
	setVar $dist 1
	stripText $bot~user_command_line " dist "
	stripText $bot~user_command_line " dist"

end

getWordPos $bot~user_command_line $pos "warps:"
if ($pos > 0)
	
	getText $bot~user_command_line $warps "warps:" " "

	if ($warps = "")
		setVar $bot~user_command_line $bot~user_command_line & " "
		getText $bot~user_command_line $warps "warps:" " "
	end
	isNumber $test $warps
	
	if ($test)
		if (($warps > 6) or ($warps < 1))
			setVar $SWITCHBOARD~message "Warps should be a number 1-6.*"
			gosub :switchboard~switchboard
			halt
		else
			stripText $bot~user_command_line " warps:" & $warps & " "
			stripText $bot~user_command_line " warps:" & $warps 
			
		end
	else
		setVar $SWITCHBOARD~message "Warps should be a number 1-6.*"
		gosub :switchboard~switchboard
		halt
	end

end


getWordPos " "&$bot~user_command_line&" " $pos " ppt "
if ($pos > 0)
	setvar $portpair true
	#stripText $bot~user_command_line " ppt "
	#stripText $bot~user_command_line " ppt"
end

getWordPos $bot~user_command_line $pos "route"
if ($pos > 0)
	setVar $dist 0
	setVar $doroute 1
	stripText $bot~user_command_line " route "
	stripText $bot~user_command_line " route"

end

# $sector_params param
# $sector_params[1] true/false
#
setArray $sector_params 100 3
setvar $sector_param_count 0

setvar $original_query $bot~user_command_line
getWordPos $bot~user_command_line $pos #34
if ($pos > 0)
	getText $bot~user_command_line $like " "&#34 #34
	if ($like <> "")

		#remove like statement from command line
		stripText $bot~user_command_line #34&$like&#34
		stripText $bot~user_command_line " like "
	end
	#echo "**[Like statement found]["&$like&"]**"
else
	setVar $like ""
end
setvar $beam ""
	

while ($word <> "@@@###@@@")
	getWord $bot~user_command_line $word $i "@@@###@@@"
	

	getLength $word $l
	if ($l = 3)
		setVar $portReqF 0
		goSub :checkPortRequirements
		if ($portReqF = 1)
			goto :nextWord
		end
	elseif ($word = "secure")
		setVar $securityLevel 1
		goto :nextWord
	elseif ($word = "paranoid")
		setVar $securityLevel 2
		goto :nextWord
	end

	getWordPos $word $pos "beam:"
	if ($pos > 0)
		replaceText $word "beam:" ""
		setVar $beam $word
	else
		getWordPos $word $pos "mark:"
		if ($pos > 0)
			replaceText $word "mark:" ""
			setVar $mark $word
			uppercase $mark
		else
			
			getWordPos $word $pos "="
			if ($pos > 0)
				add $sector_param_count 1
				replaceText $word "=" " "
				getWord $word $sector_params[$sector_param_count] 1
				upperCase $sector_params[$sector_param_count]
				getWord $word $sector_params[$sector_param_count][1] 2
				if ($sector_params[$sector_param_count][1] = "true")
					setvar $sector_params[$sector_param_count][1] 1
				end
				if ($sector_params[$sector_param_count][1] = "false")
					setvar $sector_params[$sector_param_count][1] 0
				end
				setvar $sector_params[$sector_param_count][2] "="
			else
			
				setVar $selectchar ""

				getWordPos $word $pos ">"
				if ($pos > 0)
					setVar $selectchar ">"
					replaceText $word ">" " "
				else
					getWordPos $word $pos "<"
					if ($pos > 0)
						setVar $selectchar "<"
						replaceText $word "<" " "
					else
						getWordPos $word $pos "!"
						if ($pos > 0)
							setVar $selectchar "!"
							replaceText $word "!" " "
						end
					end
				end

				if ($selectchar <> "")
					add $sector_param_count 1
					getWord $word $sector_params[$sector_param_count] 1
					upperCase $sector_params[$sector_param_count]
					getWord $word $sector_params[$sector_param_count][1] 2
					setvar $sector_params[$sector_param_count][2] $selectchar
				end
			end
		end
	end
	:nextWord
	add $i 1
end

setvar $result_memory " "
setVar $results ""
setarray $sectorresults sectors
setarray $pairedports sectors
setVar $sectorResults 0
setVar $sectorResultsi 0
setvar $count 0
setvar $i 1
while ($i <= SECTORS)    
	setvar $j 1
	setvar $skip false
	if ((($warps > 0) and (SECTOR.WARPCOUNT[$i] = $warps)) or ($warps = 0))
		while (($j <= $sector_param_count) and ($skip <> true))
			setvar $bot~parmameter $sector_params[$j]
			lowercase $bot~parmameter
			getwordpos $bot~parmameter $pos "port.o"
			if ($pos > 0)
				setvar $value port.fuel[$i]
			else
				getwordpos $bot~parmameter $pos "port.o"
				if ($pos > 0)
					setvar $value port.org[$i]
				else
					getwordpos $bot~parmameter $pos "port.e"
					if ($pos > 0)
						setvar $value port.equip[$i]
					else
						//If it's not one of these specific variables, assume sector param
						getSectorParameter $i $sector_params[$j] $value
					end
				end
			end
			
			if ($sector_params[$j][2] = "=")
				
				if ($value = $sector_params[$j][1])
					//possible candidate
				else
					if (($value = "") and ($sector_params[$j][1] = 0))
						//possible candidate
					else
						setvar $skip true
					end
				end
			else
				
				if ($value <> "")
					if ($sector_params[$j][2] = ">")
						
						if ($value > $sector_params[$j][1])
							//possible candidate
						else
							setvar $skip true
						end
					elseif ($sector_params[$j][2] = "<")
						
						if ($value < $sector_params[$j][1])
							//possible candidate
						else
							setvar $skip true
						end
					end
				else
					setvar $skip true
				end
			end
			
			add $j 1
		end
	else
		setVar $skip true
	end
	if ($skip <> true)
		if (($bot~parm1 = "planet") or ($bot~parm1 = "planets"))
			if (SECTOR.PLANETCOUNT[$i] <= 0)
				setvar $skip true
			else
				if ($like <> "")
					setvar $j 1
					setvar $isFound false
					while (($j <= SECTOR.PLANETCOUNT[$i]) and ($isFound <> true))
						setvar $temp SECTOR.PLANETS[$i][$j]
						lowercase $temp
						getwordpos $temp $pos $like
						if ($pos > 0)
							setvar $isFound true
						end
						add $j 1
					end
					if ($isFound <> true)
						setvar $skip true
					end
				end
			end
		else
			if (($bot~parm1 = "trader") or ($bot~parm1 = "traders"))
				if (SECTOR.TRADERCOUNT[$i] <= 0)
					setvar $skip true
				else
					if ($like <> "")
						setvar $j 1
						setvar $isFound false
						while (($j <= SECTOR.TRADERCOUNT[$i]) and ($isFound <> true))
							setvar $temp SECTOR.TRADERS[$i][$j]
							lowercase $temp
							getwordpos $temp $pos $like
							if ($pos > 0)
								setvar $isFound true
							end
							add $j 1
						end
						if ($isFound <> true)
							setvar $skip true
						end
					end
				end
			else
				if (($bot~parm1 = "ship") or ($bot~parm1 = "ships"))
					if (SECTOR.SHIPCOUNT[$i] <= 0)
						setvar $skip true
					else 
						if ($like <> "")
							setvar $j 1
							setvar $isFound false
							while (($j <= SECTOR.SHIPCOUNT[$i]) and ($isFound <> true))
								setvar $temp SECTOR.SHIPS[$i][$j]
								lowercase $temp
								getwordpos $temp $pos $like
								if ($pos > 0)
									setvar $isFound true
								end
								add $j 1
							end
							if ($isFound <> true)
								setvar $skip true
							end
						end
					end
				else
					if (($bot~parm1 = "unexplore") or ($bot~parm1 = "unexplored"))
						if (SECTOR.EXPLORED[$i] = "YES")
							setvar $skip true
						end
					else
						if (($bot~parm1 = "anomoly") or ($bot~parm1 = "anomolies"))
							if (SECTOR.ANOMOLY[$i] <> true)
								setvar $skip true
							end
						else
							if (($bot~parm1 = "explore") or ($bot~parm1 = "explored"))
								if (SECTOR.EXPLORED[$i] <> "YES")
									setvar $skip true
								end
							else
								if (($bot~parm1 = "trader") or ($bot~parm1 = "traders"))
									if ((SECTOR.SHIPCOUNT[$i] <= 0) and (SECTOR.TRADERCOUNT <= 0))
										setvar $skip true
									else

										if ($like <> "")
											setvar $j 1
											setvar $isFound false
											while (($j <= SECTOR.TRADERCOUNT[$i]) and ($isFound <> true))
												setvar $temp SECTOR.TRADERS[$i][$j]
												lowercase $temp
												getwordpos $temp $pos $like
												if ($pos > 0)
													setvar $isFound true
												end
												add $j 1
											end
											setvar $j 1
											while (($j <= SECTOR.SHIPCOUNT[$i]) and ($isFound <> true))
												setvar $temp SECTOR.SHIPS[$i][$j]
												lowercase $temp
												getwordpos $temp $pos $like
												if ($pos > 0)
													setvar $isFound true
												end
												add $j 1
											end
											if ($isFound <> true)
												setvar $skip true
											end
										end
									end
								else
									if (($bot~parm1 = "port") or ($bot~parm1 = "ports"))
										if (PORT.EXISTS[$i] <> 1)
											setvar $skip true
										else
											if ($portClassWanted = 1)
												if ($portClassOk[PORT.CLASS[$i]] = 0)
													setvar $skip true
												end
											end
											if ($portpair = true)
												setvar $possible_ppt_classes " 1 2 4 5 "
												getwordpos $possible_ppt_classes $pos " "&PORT.CLASS[$i]&" " 
												if ($pos > 0)
													setvar $isfound false
													setvar $class PORT.CLASS[$i]
													if ($class = "1")
														setvar $pair "2"
														setvar $pair2 "4"
													elseif ($class = "2")
														setvar $pair "5"
														setvar $pair2 "1"
													elseif ($class = "4")
														setvar $pair "5"
														setvar $pair2 "1"
													elseif ($class = "5")
														setvar $pair "4"
														setvar $pair2 "2"
													end
													setvar $j 1
													while (SECTOR.WARPS[$i][$j] > 0)
														setvar $neighbor SECTOR.WARPS[$i][$j]
														# check and see if result for neighbor sector is already been selected as result. #
														getwordpos $result_memory $pos " "&$neighbor&" "
														if ((PORT.EXISTS[$neighbor]) and ($pos <= 0))
															if ((PORT.CLASS[$neighbor] = $pair) or (PORT.CLASS[$neighbor] = $pair2))
																setvar $pairedports[$i] $neighbor
																setvar $isfound true
															end
														end
														add $j 1
													end
													if ($isfound <> true)
														setvar $skip true
													end
												else
													setvar $skip true
												end
												#1 - 4,2
												#2 - 1,5
												#4 - 1,5
												#5 - 2,4


											end


											if (($like <> "") and ($skip <> true))
												setvar $temp PORT.NAME[$i]
												lowercase $temp
												getwordpos $temp $pos $like
												if ($pos <= 0)
													setvar $skip true
												end
											end
										end
										
									else
										if (($bot~parm1 = "sector") or ($bot~parm1 = "sectors"))

										else
											setVar $SWITCHBOARD~message "You must select either sectors, planets, ships, unexplored, explored, anomoly, ports, or traders.*"
											gosub :SWITCHBOARD~switchboard
											halt
										end

									end
								end
							end
						end
					end
				end
			end
		end
	end
	if ($skip <> true)
		setVar $securityBreach 0
		if ($securityLevel > 0)
			setVar $di 1
			while ($di <= SECTOR.WARPINCOUNT[$i])
				getSectorParameter SECTOR.WARPSIN[$i][$di] "FIGSEC" $hasFig
		
				if ($hasFig <> 1)
					add $securityBreach 1
				end
				if ($securityLevel = 2)
					getSectorParameter SECTOR.WARPSIN[$i][$di] "LIMPSEC" $hasLimp
					if ($hasLimp <> 1)
						add $securityBreach 1
					end
				end
				add $di 1
			end
		end
		if ($securityBreach = 0)
			add $count 1
			add $sectorResultsi 1
			setvar $result_memory $result_memory&" "&$i&" "
			setVar $sectorResults[$sectorResultsi] $i

			#getSectorParameter $i "FIGSEC" $isFigged
			#setSectorParameter $i $mark TRUE
			#if ($isFigged = true)
			#	setvar $results $results&"["&$i&"] "
			#else
			#	setvar $results $results&$i&" "
			#end
		else
			setSectorParameter $i $mark ""
		end
	else
		setSectorParameter $i $mark ""
	end
	add $i 1
end


setVar $sortedResults 0
setVar $sortedResultsi 0
setVar $sortedDistance 0
# NEed Dist and Route
setVar $distances 0
if ($dist = 1)
	# Measures distance from this point of origin
	getAllCourses $courses CURRENTSECTOR
	setVar $y 1
	while ($y <= $sectorResultsi)
		setVar $distances[$y] $courses[$sectorResults[$y]]
		add $y 1
	end

	setVar $l 1
	while ($l <= 45)
		
		setVar $y 1
		while ($y <= $sectorResultsi)
			if ($distances[$y] = $l)
				add $sortedResultsi 1
				setVar $sortedResults[$sortedResultsi] $sectorResults[$y]
				setVar $sortedDistance[$sortedResultsi] $distances[$y] 

			end
			add $y 1
		end	


		add $l 1
	end
elseif ($doroute = 1)
	if ($sectorResultsi > 50)
		setVar $SWITCHBOARD~message "To many results for route calculation; please narrow search.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	
	setVar $routeDone 0
	setVar $y 1
	while ($y <= $sectorResultsi)
		setVar $routeDone[$y] 0
		add $y 1
	end

	setVar $routeCurrent CURRENTSECTOR
	setVar $route 0
	setVar $routei 0

	setVar $go 1
	while ($go = 1)
		
		setVar $found 0
		getNearestWarps $near $routeCurrent
		setVar $i 1
		while ($i <= $near)
			
			setVar $y 1
			while ($y <= $sectorResultsi)
				if (($near[$i] = $sectorResults[$y]) and ($routeDone[$y] = 0))
	
					setVar $routeDone[$y] 1
					setVar $found 1
					add $routei 1
					setVar $route[$routei] $sectorResults[$y]
					getDistance $dist $routeCurrent $sectorResults[$y]
					setVar $routeCurrent $sectorResults[$y]

					setVar $sortedDistance[$routei] $dist

					# for exit the loops
					setVar $y 99999
					setVar $i 99999
				end
				
				add $y 1
			end
			add $i 1
		end
		
		if ($found = 0)
			# if ever not found, then we'll have to exit loop and report
			setVar $go 0
			setVar $SWITCHBOARD~message "Debug: Did we just exit route creation without completing all sectors?*"
			gosub :SWITCHBOARD~switchboard
		end

		if ($routei = $sectorResultsi)
			setVar $go 0
		end
		
	end
	
	setVar $y 1
	while ($y <= $routei)
		setVar $sortedResults[$y] $route[$y]
		
		add $y 1
	end

else
	setVar $y 1
	while ($y <= $sectorResultsi)
		setVar $sortedResults[$y] $sectorResults[$y]
		setVar $sortedDistance[$y] "" 
		add $y 1
	end
end


setVar $d ""
setVar $y 1
while ($y <= $sectorResultsi)
	
	if ($sortedResults[$y] > 0)
		getSectorParameter $sortedResults[$y] "FIGSEC" $isFigged
		setSectorParameter $sortedResults[$y] $mark TRUE
		if (($dist = 1) or ($doroute = 1))
			SetVar $d "(" & $sortedDistance[$y] &")"
		end
		if ($portpair = true)
			getSectorParameter $pairedports[$sortedResults[$y]] "FIGSEC" $isFigged2
			if ($isFigged2 = true)
				setvar $pair "["&$pairedports[$sortedResults[$y]]&"]"
			else
				setvar $pair $pairedports[$sortedResults[$y]]
			end
			if ($isFigged = true)
				setvar $results $results&"["& $sortedResults[$y] &"]<->"&$pair& $d & " "
			else
				setvar $results $results& $sortedResults[$y]&"<->"&$pair& $d & " "
			end
		else	
			if ($isFigged = true)
				setvar $results $results&"["& $sortedResults[$y] &"]" & $d & " "
			else
				setvar $results $results& $sortedResults[$y] & $d & " "
			end
		end	
	end
	add $y 1
end



if ($SWITCHBOARD~self_command <> TRUE) or ($bot~silent_running <> TRUE)
    setVar $SWITCHBOARD~self_command 2
end

if ($count <= 0)
	setVar $SWITCHBOARD~message "Displaying results for: select "&$original_query&"* *Your query returned "&$count&" results.*"
else
	if ($count > 1000)
		setVar $SWITCHBOARD~message "Displaying results for: select "&$original_query&"* *Your query returned "&$count&" results.*This is too many to display on subspace. *If you'd like to narrow your search, add more parameters.*All result sectors are now marked with QUERY sector parameter.*You can also display individual results with the sector bot command.*"
	else
		setVar $SWITCHBOARD~message "Displaying results for: select "&$original_query&"* *"&$results&"* *Your query returned "&$count&" results.*All result sectors are now marked with QUERY sector parameter.*You can also display individual results with the sector bot command.*"
	end
end
gosub :SWITCHBOARD~switchboard
if ($beam <> "")
		setVar $SWITCHBOARD~message "Autobeaming to "&$beam&".*"
		setVar $BOT~command "beam"
		setVar $BOT~user_command_line " beam param "&$mark&" "&$beam&" delete "
		setVar $BOT~parm1 "param"
		saveVar $BOT~parm1
		setVar $BOT~parm2 $mark
		saveVar $BOT~parm2
		setVar $BOT~parm3 $beam
		saveVar $BOT~parm3
		setVar $BOT~parm4 "delete"
		saveVar $BOT~parm5
		saveVar $BOT~command
		saveVar $BOT~user_command_line
		load "scripts\mombot\modes\data\beam.cts"
		setEventTrigger		beamdone		:beamdone "SCRIPT STOPPED" "scripts\mombot\modes\data\beam.cts"
		pause
		:beamdone
end
halt



	setvar $i 1
    while ($i <= SECTORS)
    	setvar $isBubble false
        getSectorParameter $i "BUBBLE" $isBubble
        getSectorParameter $i "FIGSEC" $isFigged

		getWordPos $tl_planets $pos " "&$i&" "
		if ($pos > 0)
			setVar $isBubble TRUE
		end
        if (($isBubble <> TRUE) AND ($isFigged <> TRUE))
            if (SECTOR.PLANETCOUNT[$i] > 0)
                setVar $MAP~displaySector $i
				gosub :MAP~displaySector
				setVar $SWITCHBOARD~message "  *"&$MAP~output
				if ($SWITCHBOARD~self_command <> TRUE)
				    setVar $SWITCHBOARD~self_command 2
				end
				listSectorParameters $i $bot~parms
				setvar $j 1
				setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  *"
				while ($j <= $bot~parms)
				    getSectorParameter $i $bot~parms[$j] $check
				    setVar $SWITCHBOARD~message $SWITCHBOARD~message&"    "&$bot~parms[$j]&": "&$check&"*"
				    add $j 1
				end
			    gosub :SWITCHBOARD~switchboard

            end
        end
        add $i 1
    end

halt

:checkPortRequirements

	# Mark them all ok, and we'll rule them out
	setVar $pi 1
	while ($pi <= 8)
		setVar $portClassOk[$pi] 1
		add $pi 1
	end

	setVar $tword $word
	uppercase $tword
	cutText $tword $f 1 1
	cutText $tword $o 2 1
	cutText $tword $e 3 1
	if (($f = "B") or ($f = "S") or ($f = "X"))
		if (($o = "B") or ($o = "S") or ($o = "X"))
			if (($e = "B") or ($e = "S") or ($e = "X"))
				setVar $portClassWanted 1
			end
		end
	end
	if ($portClassWanted = 0)
		return
	end
	# 0 - zzz
	# 1 - BBS
	# 2 - BSB
	# 3 - SBB
	# 4 - SSB
	# 5 - SBS
	# 6 - BSS
	# 7 - SSS
	# 8 - BBB

	if ($f = "B")
		setVar $portClassOk[3] 0
		setVar $portClassOk[4] 0
		setVar $portClassOk[5] 0
		setVar $portClassOk[7] 0
	elseif ($f = "S")
		setVar $portClassOk[1] 0
		setVar $portClassOk[2] 0
		setVar $portClassOk[6] 0
		setVar $portClassOk[8] 0
	end
		
	if ($o = "B")
		setVar $portClassOk[2] 0
		setVar $portClassOk[4] 0
		setVar $portClassOk[6] 0
		setVar $portClassOk[7] 0
	elseif ($o = "S")
		setVar $portClassOk[1] 0
		setVar $portClassOk[3] 0
		setVar $portClassOk[5] 0
		setVar $portClassOk[8] 0
	end
			
			
	if ($e = "B")
		setVar $portClassOk[1] 0
		setVar $portClassOk[5] 0
		setVar $portClassOk[6] 0
		setVar $portClassOk[7] 0
	elseif ($e = "S")
		setVar $portClassOk[2] 0
		setVar $portClassOk[3] 0
		setVar $portClassOk[4] 0
		setVar $portClassOk[8] 0
	
	end
	setVar $portReqF 1

return


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\map\displaysector\map"
