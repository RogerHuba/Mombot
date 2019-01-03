	reqRecording
	logging off
	gosub :BOT~loadVars
	setVar $BOT~command "select"
	loadVar $BOT~bot_turn_limit
	loadVar $MAP~stardock
	loadvar $bot~subspace
	loadvar $switchboard~self_command

	setVar $BOT~help[1]   $BOT~tab&"select {planets | traders | ships | anomalies | unexplored | sector "
	setVar $BOT~help[2]   $BOT~tab&"       | ports} {BBB | XXB | SSX etc} {mark:PARAM}"
	setVar $BOT~help[3]   $BOT~tab&"     "
	setVar $BOT~help[4]   $BOT~tab&"     Searches TWX database for known info."
	setVar $BOT~help[5]   $BOT~tab&"      "
	setVar $BOT~help[6]   $BOT~tab&"     {mark:PARAM}  marks sectors PARAM=1 defult QUERY=1 "
	setVar $BOT~help[7]   $BOT~tab&"                   selectors = > < like"
	setVar $BOT~help[8]   $BOT~tab&"     {BBB | SSX}   match PORTS query to this pattern"
	setVar $BOT~help[9]   $BOT~tab&"                   X is wildcard."
	setVar $BOT~help[10]   $BOT~tab&"    {secure | paranoid}  "
	setVar $BOT~help[11]   $BOT~tab&"     Example: >select traders bubble=false equ-mcic<-60 "
	setVar $BOT~help[12]   $BOT~tab&"              >select planet like "&#34&"<<<< (a)"&#34
	# ham select ports ore-mcic<-70
	gosub :BOT~help_file

	#setVar $BOT~script_title "Select"
	#gosub :BOT~banner

	setVar $PLAYER~save TRUE


	getSectorParameter SECTORS "FIGSEC" $isFigged


setVar $mark "QUERY"
setVar $portClassOk 8
setVar $portClassWanted 0
#final filter of search results 0 - none, 1 - secure (figs surrounded) 2- PAranoid (Figs + Limps)
setVar $securityLevel 0

setvar $i 1

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
	:nextWord
	add $i 1
end


setVar $results ""
setvar $count 0
setvar $i 1
while ($i <= SECTORS)    
	setvar $j 1
	setvar $skip false
	
	while (($j <= $sector_param_count) and ($skip <> true))
		setvar $parameter $sector_params[$j]
		lowercase $parameter
		getwordpos $parameter $pos "port.o"
		if ($pos > 0)
			setvar $value port.fuel[$i]
		else
			getwordpos $parameter $pos "port.o"
			if ($pos > 0)
				setvar $value port.org[$i]
			else
				getwordpos $parameter $pos "port.e"
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
			getSectorParameter $i "FIGSEC" $isFigged
			setSectorParameter $i $mark TRUE
			if ($isFigged = true)
				setvar $results $results&"["&$i&"] "
			else
				setvar $results $results&$i&" "
			end
		else
			setSectorParameter $i $mark ""
		end
	else
		setSectorParameter $i $mark ""
	end
	add $i 1
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
				listSectorParameters $i $parms
				setvar $j 1
				setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  *"
				while ($j <= $parms)
				    getSectorParameter $i $parms[$j] $check
				    setVar $SWITCHBOARD~message $SWITCHBOARD~message&"    "&$parms[$j]&": "&$check&"*"
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
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
