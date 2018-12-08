	reqRecording
	logging off
	gosub :BOT~loadVars
	setVar $BOT~command "select"
	loadVar $BOT~bot_turn_limit
	loadVar $MAP~stardock
	loadvar $bot~subspace
	loadvar $switchboard~self_command

	setVar $BOT~help[1]   $BOT~tab&"select {planets | traders | ships | anomalies | unexplored "
	setVar $BOT~help[2]   $BOT~tab&"       | ports}"
	setVar $BOT~help[3]   $BOT~tab&"     Searches TWX database for known info."
	setVar $BOT~help[4]   $BOT~tab&"      "
	setVar $BOT~help[5]   $BOT~tab&"     {mark:PARAM} marks sectors PARAM=1 defult QUERY=1 "
	setVar $BOT~help[6]   $BOT~tab&"     selectors = > < "
	setVar $BOT~help[7]   $BOT~tab&"      "
	setVar $BOT~help[8]   $BOT~tab&"     Example: >select traders bubble=false equ-mcic<-60 "

	# ham select ports ore-mcic<-70
	gosub :BOT~help_file

	#setVar $BOT~script_title "Select"
	#gosub :BOT~banner

	setVar $PLAYER~save TRUE


	getSectorParameter SECTORS "FIGSEC" $isFigged


setVar $mark "QUERY"
setvar $i 1

# $sector_params param
# $sector_params[1] true/false
#
setArray $sector_params 100 3
setvar $sector_param_count 0

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
	add $i 1
end


setVar $results "Displaying results for: select "&$bot~user_command_line&"* *"
setvar $count 0
setvar $i 1
while ($i <= SECTORS)    
	setvar $j 1
	setvar $skip false
	
	while (($j <= $sector_param_count) and ($skip <> true))
		getSectorParameter $i $sector_params[$j] $value
		
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
										if (PORT.EXISTS[$i]= 1)
											setvar $skip true
										else
											if ($like <> "")
												setvar $temp PORT.NAME[$i]
												lowercase $temp
												getwordpos $temp $pos $like
												if ($pos <= 0)
													setvar $skip true
												end
											end
										end
									else
										setVar $SWITCHBOARD~message $SWITCHBOARD~message&"You must select either planets, ships, unexplored, explored, anomoly, or traders.*"
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
	if ($skip <> true)
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
	add $i 1
end


if ($SWITCHBOARD~self_command <> TRUE) or ($bot~silent_running <> TRUE)
    setVar $SWITCHBOARD~self_command 2
end

setVar $SWITCHBOARD~message $results&"* *Your query returned "&$count&" results.*All result sectors are now marked with QUERY sector parameter.*You can also display individual results with the sector bot command.*"
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



#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"