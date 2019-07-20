loadVar $bot_name	

:setTriggers
	setTextLineTrigger findfig :findfig "Deployed Fighters Report Sector"
	setTextLineTrigger findfig2 :findfig2 "Your fighters in sector "
	pause

:findfig2
	killalltriggers
	getWord CURRENTLINE $spoof 1
	if ($spoof <> "Your")
		goto :settriggers
	end
	getWord CURRENTLINE $fighit 5
	stripText $fighit ":"
	setVar $near "f"
	setVar $source $fighit
	goto :near_hit
	
:findfig
	killAllTriggers
	getWord CURRENTLINE $spoof 1
	if ($spoof <> "Deployed")
		goto :settriggers
	end
	getWordPos CURRENTLINE $pos " is attacking!"
	if ($pos <= 0)
		goto :settriggers
	end
	getWord CURRENTLINE $fighit 5
	stripText $fighit ":"
	setVar $near "f"
	setVar $source $fighit

:near_hit
	getSectorParameter $source "FIGSEC" $isFigged
	setVar $breadth_mode "forward"
        gosub :breadth_search
        if ($return_data <> "")
        	send "'*{" $bot_name "}*  - " & $return_data &"**"
	end
	goto :settriggers



:breadth_search

	setVar $i 1
        getNearestWarps $nearArray $source
        while ($i <= $nearArray)
                setVar $focus $nearArray[$i]
		getSectorParameter $focus "FIGSEC" $isFigged2

		   if (($isFigged2 = TRUE) AND ($source <> $focus))
			getCourse $course $source $focus
			setVar $i 1
			setVar $fcount 0
			setVar $directions ""
			if ($course = 1)
				while (SECTOR.WARPS[$source][$i] > 0)
					setVar $tempCheck SECTOR.WARPS[$source][$i]
					getSectorParameter $tempCheck "FIGSEC" $isFigged3
					if ($isFigged3)
						setVar $directions $directions&$tempCheck&" "
						add $fcount 1
					end
					add $i 1
				end
				if ($fcount > 1)
					setVar $return_data "Adjacent Figs to " & $source & " are [ " & $directions & "] "
				else
					setVar $return_data "Adjacent Fig to " & $source & " is [ " & $directions & "] "
				end
			else
				while ($i <= $course)
					setVar $directions $directions&$course[$i]&" "
					add $i 1
				end
				setVar $return_data "Nearest Fig to " & $source & " is " & $focus & " (" & $course & " hops)  << " & $directions & " >> "
        		end
         		return
        	   end
 
	     add $i 1
	end

# Well, if you make it all the way through the main while loop, it means that
# whatever you were searching for was never found.
	setVar $return_data "Nothing found for that search."
return


