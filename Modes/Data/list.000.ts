	logging off

	gosub :BOT~loadVars
	loadvar $MAP~STARDOCK
	loadvar $map~home_sector
	loadvar $SHIP~cap_file
	loadvar $game~internalAliens
	loadvar $game~internalFerrengi
	loadvar $game~limpet_cost
	loadvar $game~limpet_removal_cost
	loadvar $game~armid_cost
	loadvar $game~photon_cost
	loadvar $game~DISRUPTOR_COST

#	setVar $BOT~help[1] $BOT~tab&"Lister"
#	gosub :BOT~help_file

	setVar $BOT~script_title "Lister"
	gosub :BOT~banner


	setvar $line $bot~user_command_line

	################################################
	## Strip out all parameters from command line ##
	################################################

	##Check for port type first - default is xxx


	setvar $i 1
	setvar $isFound false
	while (($i <= 70) and ($isFound <> true))
		getWordPos " "&$line&" " $pos " "&$i&" "
		if ($pos > 0)
			setvar $find_mcic_value $i
			setvar $isFound true
			setvar $find_port true
			setvar $find_good_mcic true
		end
		add $i 1
	end

	setvar $i 1
	while (($i <= 70) and ($isFound <> true))
		getWordPos " "&$line&" " $pos " -"&$i&" "
		if ($pos > 0)
			setvar $find_mcic_value "-"&$i
			setvar $isFound true
			setvar $find_port true
			setvar $find_good_mcic true
		end
		add $i 1
	end

	setarray $port_check 4

	gosub :clear_port_data
	setvar $port_check[1] "sss"
	setvar $port_check[2] false
	setvar $port_check[3] false
	setvar $port_check[4] false	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "bss"
	setvar $port_check[2] true
	setvar $port_check[3] false
	setvar $port_check[4] false	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "bbs"
	setvar $port_check[2] true
	setvar $port_check[3] true
	setvar $port_check[4] false	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "bbb"
	setvar $port_check[2] true
	setvar $port_check[3] true
	setvar $port_check[4] true	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "bsb"
	setvar $port_check[2] true
	setvar $port_check[3] false
	setvar $port_check[4] true	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "sbs"
	setvar $port_check[2] false
	setvar $port_check[3] true
	setvar $port_check[4] false	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "ssb"
	setvar $port_check[2] false
	setvar $port_check[3] false
	setvar $port_check[4] true	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "sbb"
	setvar $port_check[2] false
	setvar $port_check[3] true
	setvar $port_check[4] true	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "xbb"
	setvar $port_check[3] true
	setvar $port_check[4] true	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "xxb"
	setvar $port_check[4] true	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "xss"
	setvar $port_check[3] false
	setvar $port_check[4] false	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "xxs"
	setvar $port_check[4] false	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "bxb"
	setvar $port_check[2] true
	setvar $port_check[4] true	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "bxx"
	setvar $port_check[2] true
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "bxs"
	setvar $port_check[2] true
	setvar $port_check[4] false	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "sxs"
	setvar $port_check[2] false
	setvar $port_check[4] false	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "sxb"
	setvar $port_check[2] false
	setvar $port_check[4] true	
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "xxx"
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "ssx"
	setvar $port_check[2] false
	setvar $port_check[3] false
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "sxx"
	setvar $port_check[2] false
	gosub :check_for_port

	gosub :clear_port_data
	setvar $port_check[1] "bbx"
	setvar $port_check[2] true
	setvar $port_check[3] true
	gosub :check_for_port

	:done_port_checking

	getWordPos $line $pos "setup"
	if ($pos > 0)
		setvar $setup true
	end

	getWordPos $line $pos "deadend"
	if ($pos > 0)
		setvar $deadend true
	end

	getWordPos $line $pos "2way"
	if ($pos > 0)
		setvar $2way true
	end
	getWordPos $line $pos "3way"
	if ($pos > 0)
		setvar $3way true
	end
	getWordPos $line $pos "4way"
	if ($pos > 0)
		setvar $4way true
	end
	getWordPos $line $pos "5way"
	if ($pos > 0)
		setvar $5way true
	end
	getWordPos $line $pos "6way"
	if ($pos > 0)
		setvar $6way true
	end
	getWordPos $line $pos "7way"
	if ($pos > 0)
		setvar $7way true
	end

	getWordPos $line $pos "mcic"
	if ($pos > 0)
		setvar $find_good_mcic true
		setvar $find_port true
	end

	getWordPos $line $pos "pair"
	if ($pos > 0)
		setvar $find_port_pairs true
		setvar $find_port true
	else
		setvar $find_port_pairs false
	end

	getWordPos $line $pos "unfigged"
	if ($pos > 0)
		setVar $find_figged_sectors false
	else
		setVar $find_figged_sectors true		
	end

	if ($find_port)
		setvar $query "Listing "&$port_type&" ports"
	end
	if ($find_good_mcic)
		setvar $query $query&" with mcic values better than "&$find_mcic_value
	end
	if ($find_figged_sectors)
		setvar $query $query&" in figged sectors"
	else
		setvar $query $query&" in unfigged sectors"
	end
	if ($deadend)
		setvar $query $query&" with a deadend"
	end
	setvar $query $query&"."
	
	setarray $results sectors 1 1 1
	setvar $result_count 0


	if ($setup = true)
		setvar $i 1
		while ($i <= sectors)
			setvar $target $i
			gosub :get_distance
			add $i 1
		end
	end
	getNearestWarps $sectors CURRENTSECTOR

	setvar $i 1
	while ($i <= $sectors)
		getSectorParameter $sectors[$i] "FIGSEC" $isFigged
		getSectorParameter $sectors[$i] "EQUIPMENT+" $mcic
		setSectorParameter $sectors[$i] "TARGET" ""
			if ((($find_figged_sectors = true) and ($isFigged = true)) or (($find_figged_sectors = false) and ($isFigged <> true)))
				if ($find_port = true)
					if (($find_port = true) and (PORT.EXISTS[$sectors[$i]] = true))
						if (((($buy_fuel = "both") or ($buy_fuel = true)) and PORT.BUYFUEL[$sectors[$i]] = true) or ((($buy_fuel = "both") or ($buy_fuel = false)) and PORT.BUYFUEL[$sectors[$i]] = false))
							if (((($buy_org = "both") or ($buy_org = true)) and PORT.BUYORG[$sectors[$i]] = true) or ((($buy_org = "both") or ($buy_org = false)) and PORT.BUYORG[$sectors[$i]] = false))
								if (((($buy_equip = "both") or ($buy_equip = true)) and PORT.BUYEQUIP[$sectors[$i]] = true) or ((($buy_equip = "both") or ($buy_equip = false)) and PORT.BUYEQUIP[$sectors[$i]] = false))
									if ($find_good_mcic = true)
										//check for mcic 
										if ($mcic <> "")
											getwordpos $mcic $pos "-"
											getwordpos $find_mcic_value $pos2 "-"
											if (($pos > 0) and ($pos2 > 0))
												setvar $absolute_mcic $mcic
												striptext $absolute_mcic "-"
												setvar $absolute_find_mcic_value $find_mcic_value
												striptext $absolute_find_mcic_value "-"
												if ($absolute_mcic <= $absolute_find_mcic_value)
													goto :skip_sector
												end
											elseif ((($pos > 0) and ($pos2 <= 0)) or (($pos <= 0) and ($pos2 > 0)))
												goto :skip_sector
											else
												if ($mcic > $find_mcic_value)
													goto :skip_sector
												end

											end
										else
											goto :skip_sector
										end
									end
									if ($find_port_pairs = true)
										//check for port pairs
										if (PORT.BUYFUEL[$sectors[$i]] = true)
											setvar $buy_fuel true
										else
											setvar $buy_fuel false
										end
										if (PORT.BUYEQUIP[$sectors[$i]] = true)
											setvar $buy_equip true
										else
											setvar $buy_equip false
										end
										if (PORT.BUYORG[$sectors[$i]] = true)
											setvar $buy_org true
										else
											setvar $buy_org false
										end
										setvar $j 1
										setvar $found_port_pair 0
										setVar $isFound FALSE
										while ((SECTOR.WARPS[$sectors[$i]][$j] > 0) and ($isFound = false))
											setvar $test_sector SECTOR.WARPS[$sectors[$i]][$j]
											if (PORT.EXISTS[$test_sector] = true)
												if ((((PORT.BUYORG[$test_sector] <> $buy_org) and (PORT.BUYEQUIP[$test_sector] <> $buy_equip)) and ($buy_org <> $buy_equip)) or (((PORT.BUYFUEL[$test_sector] <> $buy_fuel) and (PORT.BUYEQUIP[$test_sector] <> $buy_equip)) and ($buy_fuel <> $buy_equip)) or (((PORT.BUYFUEL[$test_sector] <> $buy_fuel) and (PORT.BUYORG[$test_sector] <> $buy_org)) and ($buy_org <> $buy_fuel)))
													getDistance $distance $test_sector $sectors[$i]
													if ($distance <= 0)
														send "^f"&$test_sector&"*"&$sectors[$i]&"*q"
														waitOn "ENDINTERROG"
														getDistance $distance $test_sector $sectors[$i]
													end
													if ($distance = 1)
														setvar $found_port_pair $test_sector
														setvar $isFound true
													end
												end
											end
											add $j 1
										end
										if ($isFound = false)
											goto :skip_sector
										end
									end
								else
									goto :skip_sector
								end
							else
								goto :skip_sector
							end
						else
							goto :skip_sector
						end
					else
						goto :skip_sector
					end
				end
				if ($deadend = true)
					getSectorParameter $sectors[$i] "DEADEND" $isCorrect
					if ($isCorrect <> true)
						goto :skip_sector
					end
				end
				if ($2way = true)
					getSectorParameter $sectors[$i] "2WAY" $isCorrect
					if ($isCorrect <> true)
						goto :skip_sector
					end
				end
				if ($3way = true)
					getSectorParameter $sectors[$i] "3WAY" $isCorrect
					if ($isCorrect <> true)
						goto :skip_sector
					end
				end
				if ($4way = true)
					getSectorParameter $sectors[$i] "4WAY" $isCorrect
					if ($isCorrect <> true)
						goto :skip_sector
					end
				end
				if ($5way = true)
					getSectorParameter $sectors[$i] "5WAY" $isCorrect
					if ($isCorrect <> true)
						goto :skip_sector
					end
				end
				if ($6way = true)
					getSectorParameter $sectors[$i] "6WAY" $isCorrect
					if ($isCorrect <> true)
						goto :skip_sector
					end
				end
				if ($7way = true)
					getSectorParameter $sectors[$i] "7WAY" $isCorrect
					if ($isCorrect <> true)
						goto :skip_sector
					end
				end
			else
				goto :skip_sector
			end		

		#If it makes it through all the filtering, add it to the results to display
		add $result_count 1

		setvar $target $sectors[$i]
		gosub :get_distance

		setvar $results[$result_count] $sectors[$i] 
		setvar $results[$result_count][1] $distance
		setvar $results[$result_count][1][1] $found_port_pair
		setSectorParameter $i "TARGET" TRUE

		:skip_sector
		add $i 1
	end


:displaying_results
	
	echo "Found "&$result_count&" results.*"


	setVar $SWITCHBOARD~message $query&"*   *"
	if ($SWITCHBOARD~self_command <> TRUE)
		setVar $SWITCHBOARD~self_command 2
	end
	if ($result_count > 100)
		setvar $i 100
	else
		setvar $i $result_count
	end
	while ($i > 0)
		setvar $result_sector $results[$i]
		gosub :get_port_status		
		gosub :get_fighter_status
		setvar $switchboard~message $switchboard~message&"Sector: "&$results[$i]&" ("&$results[$i][1]&" sectors away) Figged: "&$fighter_status&", Port: "&$port&" MCIC: "&$mcic&"*"
		if ($find_port_pairs = true)
			setvar $port_pair $results[$i][1][1]
			if ($port_pair > 0)
				getSectorParameter $port_pair "FIGSEC" $isFigged
				gosub :get_fighter_status
				setvar $result_sector $port_pair
				gosub :get_port_status
				setvar $switchboard~message $switchboard~message&"   Port Pair --> Sector: "&$port_pair&" Figged: "&$fighter_status&", Port: "&$port&" MCIC: "&$mcic&"*"
			end
		end
		subtract $i 1
	end
		gosub :switchboard~switchboard
	halt

:killtriggers
	killtrigger 1
	killtrigger 2
	killtrigger 3
	killtrigger 4
	killtrigger 5
	killtrigger 6
	killtrigger 7
	killtrigger 8
	killtrigger 9
	killtrigger 10
	killtrigger 11
return

:get_fighter_status
		if ($isFigged)
			setvar $fighter_status "Yes"
		else
			setvar $fighter_status "No"
		end
return

:get_port_status
	getSectorParameter $result_sector "EQUIPMENT+" $mcic
	getSectorParameter $result_sector "EQUIPMENT-" $mcic_low
	if ($mcic <> "")
		if ($mcic <> $mcic_low)
			setvar $mcic $mcic&" ("&$mcic_low&")"
		end
	else
		setvar $mcic "N/A"
	end
	getSectorParameter $result_sector "FIGSEC" $isFigged
	if (PORT.EXISTS[$result_sector])
		if (PORT.BUYFUEL[$result_sector])
			setvar $port "B"
		else
			setvar $port "S"
		end
		if (PORT.BUYORG[$result_sector])
			setvar $port $port&"B"
		else
			setvar $port $port&"S"
		end
		if (PORT.BUYEQUIP[$result_sector])
			setvar $port $port&"B"
		else
			setvar $port $port&"S"
		end
	else
		setvar $port "N/A"
	end
return

:get_distance
	getDistance $distance CURRENTSECTOR $target
	if ($distance <= 0)
		if (currentsector <> $target)
			send "^f"&currentsector&"*"&$target&"*q"
			waitOn "ENDINTERROG"
			getDistance $distance CURRENTSECTOR $target
		else
			setvar $distance 0 
		end
	end
return

:check_for_port
	getWordPos $line $pos $port_check[1]
	if ($pos > 0)
		setvar $port_type $port_check[1]
		setvar $buy_fuel $port_check[2]
		setvar $buy_org $port_check[3]
		setvar $buy_equip $port_check[4]
		setvar $find_port true
		goto :done_port_checking
	end

return

:clear_port_data
	setvar $port_check[1] "xxx"
	setvar $port_check[2] "both"
	setvar $port_check[3] "both"
	setvar $port_check[4] "both"
return

#INCLUDES:
include "source\module_includes\bot"
include "source\module_includes\defender\killing"
include "source\module_includes\defender\photon"
include "source\module_includes\defender\navigate"
include "source\module_includes\defender\restock"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
