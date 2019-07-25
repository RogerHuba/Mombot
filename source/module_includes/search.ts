:find
:near
	setVar $near $bot~parm1
	setVar $source $bot~parm2

	isNumber $number $source
	if ($number = TRUE)
		if ($source <= 0)
			setVar $source CURRENTSECTOR
		end
		if ($source > SECTORS)
			setVar $SWITCHBOARD~message "That sector is out of bounds (Must be between 1-"&SECTORS&")*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
	else
		setVar $port_type $bot~parm2
		setVar $source CURRENTSECTOR
	end

	getSectorParameter $source "FIGSEC" $isFigged
	if ($isFigged = "")
		setVar $SWITCHBOARD~message "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($near <> "owner") and ($near <> "ufde") and ($near <> "f") and ($near <> "nf") and ($near <> "fde") and ($near <> "uf") and ($near <> "fp") and ($near <> "nfup") and ($near <> "fup") and ($near <> "p") and ($near <> "de") and ($near <> "fig") and ($near <> "nofig") and ($near <> "figport") and ($near <> "port") and ($near <> "deadend")
		setVar $SWITCHBOARD~message "Please use - [type] [sector] format*"      
		gosub :SWITCHBOARD~switchboard
		halt
	end
	if ($near = "fp") or ($near = "port") or ($near = "p") or ($near = "nfup") or ($near = "fup")

		getLength $port_type $plength
		if (($source = 0) OR ($plength <> 3))
			setVar $port_type "xxx"
		end
		setVar $invalid FALSE
		cutText $port_type $pfuel 1 1
		if ($pfuel <> "s") and ($pfuel <> "b") and ($pfuel <> "x")
			setVar $invalid TRUE
		end
		cutText $port_type $porg 2 1
		if ($porg <> "s") and ($porg <> "b") and ($porg <> "x")
			setVar $invalid TRUE
		end
		cutText $port_type $pequip 3 1
		if ($pequip <> "s") and ($pequip <> "b") and ($pequip <> "x")
			setVar $invalid TRUE
		end
		if ($invalid)
			setVar $SWITCHBOARD~message "Please use - [fp/p] [sector] [port type] format."      
			gosub :SWITCHBOARD~switchboard
			halt
		end
		setVar $ptype $port_type
		upperCase $ptype
	end
:near_hit
	getSectorParameter $source "FIGSEC" $isFigged
	getWord SECTOR.FIGS.OWNER[$source] $figowner 3
	setVar $source_message ""
	if (($near = "f") AND ($isFigged = TRUE))
		setVar $source_message "appears to be fig'd."
	elseif (($near = "owner") AND (($isFigged <> TRUE) AND ($figowner = "Corp#"&$target_corp&",")))
		setVar $source_message "appears to be fig'd by corp #"&$target_corp&"."
	elseif ((($near = "nf") OR ($near = "uf")) AND ($isFigged <> TRUE))
		setVar $source_message "is not figged."
	elseif (($near = "ufde") AND (($isFigged = FALSE) and (SECTOR.WARPCOUNT[$source] = 1)))
		setVar $source_message "appears to be an unfigged dead-end."
	elseif (($near = "fde") AND (($isFigged = TRUE) and (SECTOR.WARPCOUNT[$source] = 1)))
		setVar $source_message "appears to be a figged dead-end."
	elseif (($near = "fp") AND ((($isFigged = TRUE) and ((PORT.CLASS[$source] > 0) and (PORT.CLASS[$source] < 9)))))
		if (($pfuel = "b") AND (PORT.BUYFUEL[$source] = 1)) or (($pfuel = "s") AND (PORT.BUYFUEL[$source] = 0)) or ($pfuel = "x")
			if (($porg = "b") AND (PORT.BUYORG[$source] = 1)) or (($porg = "s") AND (PORT.BUYORG[$source] = 0)) or ($porg = "x")
				if (($pequip = "b") AND (PORT.BUYEQUIP[$source] = 1)) or (($pequip = "s") AND (PORT.BUYEQUIP[$source] = 0)) or ($pequip = "x")
					setVar $source_message " has a " & $ptype & " port that's figged."
				end
			end
		end
	elseif ((($near = "port") OR ($near = "p")) AND (((PORT.CLASS[$source] > 0) and (PORT.CLASS[$source] < 9))))
		if (($pfuel = "b") AND (PORT.BUYFUEL[$source] = 1)) or (($pfuel = "s") AND (PORT.BUYFUEL[$source] = 0)) or ($pfuel = "x")
			if (($porg = "b") AND (PORT.BUYORG[$source] = 1)) or (($porg = "s") AND (PORT.BUYORG[$source] = 0)) or ($porg = "x")
				if (($pequip = "b") AND (PORT.BUYEQUIP[$source] = 1)) or (($pequip = "s") AND (PORT.BUYEQUIP[$source] = 0)) or ($pequip = "x")
					setVar $source_message " has a " & $ptype & " port."
				end
			end
		end
	elseif (((($near = "fup") AND ($isFigged = TRUE)) OR (($near = "nfup") AND ($isFigged <> TRUE))) AND (((PORT.CLASS[$source] > 0) and (PORT.CLASS[$source] < 9))))
		setVar $foundFuelPort FALSE
		setVar $foundOrgPort FALSE
		setVar $foundEquipPort FALSE
		if ((($pfuel = "b") AND (PORT.BUYFUEL[$source] = 1)) AND (PORT.FUEL[$source] >= 10000)) OR ((($pfuel = "s") AND (PORT.BUYFUEL[$source] = 0)) AND (PORT.FUEL[$source] >= 10000))
			setVar $foundFuelPort TRUE
		end
		if ((($porg = "b") AND (PORT.BUYORG[$source] = 1)) AND (PORT.ORG[$source] >= 10000)) OR ((($porg = "s") AND (PORT.BUYORG[$source] = 0)) AND (PORT.ORG[$source] >= 10000))
			setVar $foundOrgPort TRUE
		end
		if ((($pequip = "b") AND (PORT.BUYEQUIP[$source] = 1)) AND (PORT.EQUIP[$source] >= 10000)) OR ((($pequip = "s") AND (PORT.BUYEQUIP[$source] = 0)) AND (PORT.EQUIP[$source] >= 10000))
			setVar $foundEquipPort TRUE
		end
		if (($pfuel = "x") AND ($porg = "x") AND ($pequip = "x"))
			if ((($pfuel = "x") AND (PORT.FUEL[$source] >= 10000)) OR (($porg = "x") AND (PORT.ORG[$source] >= 10000)) OR (($pequip = "x") AND (PORT.EQUIP[$source] >= 10000)))
				setVar $foundFuelPort TRUE
				setVar $foundOrgPort TRUE
				setVar $foundEquipPort TRUE
			end
		else
			if ($pfuel = "x")
				setVar $foundFuelPort TRUE
			end
			if ($porg = "x")
				setVar $foundOrgPort TRUE
			end
			if ($pequip = "x")
				setVar $foundEquipPort TRUE
			end
		end
		if (($foundFuelPort = TRUE) AND ($foundOrgPort = TRUE) AND ($foundEquipPort = TRUE))
			if ($near = "fup")
				setVar $source_message " has an upped " & $ptype & " port that's figged."
			else
				setVar $source_message " has an upped " & $ptype & " port that's not figged."
			end
		end
	end
	gosub :breadth_search
	if ($return_data <> "")
		setVar $SWITCHBOARD~message $return_data
		if ($source_message <> "")
			getSectorParameter $source "FIGSEC" $isFigged3
			getSectorParameter $source "MINESEC" $isMined3
			getSectorParameter $source "LIMPSEC" $isLimpd3
			if ($isLimpd3 = true) AND ($isMined3 = true)
				setVar $SWITCHBOARD~message $SWITCHBOARD~message&"*   *   Note: " & $source & "LA, " & $source_message
			else
				if ($isLimpd3 = true)
					setVar $SWITCHBOARD~message $SWITCHBOARD~message&"*   *   Note: " & $source & "L, " & $source_message
				elseif ($isMined3 = true)
					setVar $SWITCHBOARD~message $SWITCHBOARD~message&"*   *   Note: " & $source & "A, " & $source_message
						else
							setVar $SWITCHBOARD~message $SWITCHBOARD~message&"*   *   Note: " & $source & ", " & $source_message
				end
			end
			if ($isFigged3 = true)
				setVar $directions (" " & $source & "F" & $directions)
			else
				setVar $directions (" " & $source & $directions)
			end
		end
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"*"
		if (($SWITCHBOARD~self_command <> TRUE) OR ($bot~silent_mode <> TRUE))
			setVar $SWITCHBOARD~self_command 2
		end
		gosub :SWITCHBOARD~switchboard
	end
return
# ----- SUB :breadth_search -----
:breadth_search
	setVar $i 1
	setVar $loop_data 1
	getNearestWarps $nearArray $source
	while ($i <= $nearArray)
		setVar $focus $nearArray[$i]
		getDistance $_DIST_1_ $focus $source
		getDistance $_DIST_2_ $source $focus
		if ($_DIST_1_ = $_DIST_2_)
			getSectorParameter $focus "FIGSEC" $isFigged2
			getWord SECTOR.FIGS.OWNER[$focus] $figowner 3
			if ((($source <> $focus) AND ($focus > 10) AND ($focus <> $MAP~stardock)) AND ((($isFigged2 = FALSE) AND (($near = "uf") OR ($near = "nf") OR (($near = "owner") AND ($figowner = "Corp#"&$target_corp&",")) OR (($near = "de") AND (SECTOR.WARPCOUNT[$focus] = 1)) OR (($near = "ufde") AND (SECTOR.WARPCOUNT[$focus] = 1)))) OR (($isFigged2 = TRUE) AND (($near = "f") OR (($near = "fde") AND (SECTOR.WARPCOUNT[$focus] = 1))))))
				getCourse $course $source $focus
				setVar $i 1
				setVar $fcount 0
				setVar $directions ""
				if ($near = "f")
					setVar $SWITCHBOARD~message "Nearest Fig"
				elseif (($near = "uf") OR ($near = "nf"))
					setVar $SWITCHBOARD~message "Nearest Non-Fig"
				elseif ($near = "owner")
					setVar $SWITCHBOARD~message "Nearest Corp #"&$target_corp&" Fig"
				elseif ($near = "de") or ($near = "ufde")
					setVar $SWITCHBOARD~message "Nearest Non-Fig DE"
				elseif ($near = "fde")
					setVar $SWITCHBOARD~message "Nearest Fig'd DE"
				end
				if ($course = 1)
					while (SECTOR.WARPS[$source][$i] > 0)
						setVar $tempCheck SECTOR.WARPS[$source][$i]
						getSectorParameter $tempCheck "FIGSEC" $isFigged3
						getSectorParameter $tempCheck "MINESEC" $isMined3
						getSectorParameter $tempCheck "LIMPSEC" $isLimpd3

						getWord SECTOR.FIGS.OWNER[$tempCheck] $figowner2 3
						if ((($isFigged3 = TRUE) AND (($near = "f") OR (($near = "fde") AND (SECTOR.WARPCOUNT[$tempCheck] = 1)))) OR (($isFigged3 = FALSE) AND ((($near = "owner") AND ($figowner2 = "Corp#"&$target_corp&",")) OR ($near = "uf") OR ($near = "nf") OR (($near = "de") AND (SECTOR.WARPCOUNT[$tempCheck] = 1)) OR (($near = "ufde") AND (SECTOR.WARPCOUNT[$tempCheck] = 1)))))
							setVar $directions ($directions & $tempCheck)
							if ($isMined3 = true) AND ($isLimpd3 = true)
								setVar $directions ($directions & "LA")
							else
								if ($isMined3 = true)
									setVar $directions ($directions & "A")
								elseif ($isLimpd3 = true)
									setVar $directions ($directions & "L")
								end
							end
							setVar $directions ($directions & " ")
							add $fcount 1
						end
						add $i 1
					end
					if ($fcount > 1)
						setVar $return_data $SWITCHBOARD~message & "s adjacent to " & $source & " are*    [ " & $directions & "]"
					else
						setVar $return_data $SWITCHBOARD~message & " adjacent to " & $source & " is*    [ " & $directions & "]"
					end
				else
					while ($i <= ($course+1))
						getSectorParameter $course[$i] "FIGSEC" $isFigged3
						getSectorParameter $course[$i] "MINESEC" $isMined3
						getSectorParameter $course[$i] "LIMPSEC" $isLimpd3
						if ($isMined3 = true) AND ($isLimpd3 = true)
							setVar $directions ("LA" & $directions)
						else
							if ($isMined3 = true)
								setVar $directions ("A" & $directions)
							end
							if ($isLimpd3 = true)
								setVar $directions ("L" & $directions)
							end
						end
						if ($isFigged3 = true)
							setVar $directions (" " & $course[$i] & "F" & $directions)
						else
							setVar $directions (" " & $course[$i] & $directions)
						end

						add $i 1
					end
					setVar $return_data $SWITCHBOARD~message&" to " & $source & " is " & $focus & " (" & $course & " hops)*  <<" & $directions & " >>*                L: Limpet A: Armid F:Fighter  "
				end
				return
			elseif (($near = "nfup") AND ($isFigged2 = FALSE)) OR (($near = "fup") AND ($isFigged2 = TRUE))
				setVar $foundFuelPort FALSE
				setVar $foundOrgPort FALSE
				setVar $foundEquipPort FALSE
				if (((PORT.CLASS[$focus] > 0) and (PORT.CLASS[$focus] < 9)) AND ($focus <> $source))
					if ((($pfuel = "b") AND (PORT.BUYFUEL[$focus] = 1)) AND (PORT.FUEL[$focus] >= 10000)) OR ((($pfuel = "s") AND (PORT.BUYFUEL[$focus] = 0)) AND (PORT.FUEL[$focus] >= 10000))
						setVar $foundFuelPort TRUE
					end
					if ((($porg = "b") AND (PORT.BUYORG[$focus] = 1)) AND (PORT.ORG[$focus] >= 10000)) OR ((($porg = "s") AND (PORT.BUYORG[$focus] = 0)) AND (PORT.ORG[$focus] >= 10000))
						setVar $foundOrgPort TRUE
					end
					if ((($pequip = "b") AND (PORT.BUYEQUIP[$focus] = 1)) AND (PORT.EQUIP[$focus] >= 10000)) OR ((($pequip = "s") AND (PORT.BUYEQUIP[$focus] = 0)) AND (PORT.EQUIP[$focus] >= 10000))
						setVar $foundEquipPort TRUE
					end
					if (($pfuel = "x") AND ($porg = "x") AND ($pequip = "x"))
						if ((($pfuel = "x") AND (PORT.FUEL[$focus] >= 10000)) OR (($porg = "x") AND (PORT.ORG[$focus] >= 10000)) OR (($pequip = "x") AND (PORT.EQUIP[$focus] >= 10000)))
							setVar $foundFuelPort TRUE
							setVar $foundOrgPort TRUE
							setVar $foundEquipPort TRUE
						end
					else
						if ($pfuel = "x")
							setVar $foundFuelPort TRUE
						end
						if ($porg = "x")
							setVar $foundOrgPort TRUE
						end
						if ($pequip = "x")
							setVar $foundEquipPort TRUE
						end
					end
					if (($foundFuelPort = TRUE) AND ($foundOrgPort = TRUE) AND ($foundEquipPort = TRUE))
						if ($loop_data = 1)
							getCourse $course $source $focus
							setVar $return_data "Nearest Figged upgraded " & $ptype & " port(s) to " & $source & ": "  & $focus & " (" & $course & " hops)"
						elseif ($loop_data = 2)
							getCourse $course $source $focus
							setVar $return_data $return_data&", "  & $focus & " (" & $course & " hops)"
						else
							getCourse $course $source $focus
							setVar $return_data $return_data&", and "  & $focus & " (" & $course & " hops)"
							setVar $loop_data 1
							return
						end
						add $loop_data 1
					end
			   end
			elseif (($near = "port") OR ($near = "p") OR (($near = "fp") AND ($isFigged2 = TRUE)))
				if (((PORT.CLASS[$focus] > 0) and (PORT.CLASS[$focus] < 9)) AND ($focus <> $source))
					if (($pfuel = "b") AND (PORT.BUYFUEL[$focus] = 1)) or (($pfuel = "s") AND (PORT.BUYFUEL[$focus] = 0)) or ($pfuel = "x")
						if (($porg = "b") AND (PORT.BUYORG[$focus] = 1)) or (($porg = "s") AND (PORT.BUYORG[$focus] = 0)) or ($porg = "x")
							if (($pequip = "b") AND (PORT.BUYEQUIP[$focus] = 1)) or (($pequip = "s") AND (PORT.BUYEQUIP[$focus] = 0)) or ($pequip = "x")
								if ($loop_data = 1)
									getCourse $course $source $focus
									setVar $return_data "Nearest Figged " & $ptype & " port(s) to " & $source & ": "  & $focus & " (" & $course & " hops)"
								elseif ($loop_data = 2)
									getCourse $course $source $focus
									setVar $return_data $return_data&", "  & $focus & " (" & $course & " hops)"
								else
									getCourse $course $source $focus
									setVar $return_data $return_data&", and "  & $focus & " (" & $course & " hops)"
									setVar $loop_data 1
									return
								end
								add $loop_data 1
							end
						end
					end
			   end
			end
		end
	add $i 1
	end
	setVar $return_data "Nothing found for that search."
return
#=============================== END FIND =======================================================


include "source\bot_includes\switchboard"

