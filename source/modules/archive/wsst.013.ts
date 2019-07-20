	#	Problem with the script:  Xporting is suppose to detect if range is exceeded
	#	but the requiste server msg is cancelled out by the macro
	#
	#	Made a rountine at the bottom: :FindShip  that will locate other cashing ship
	#	and mow to it, and resume. If other ship isn't found script simply halts
	#
	#	The :FindShip rountine was inspired by the one found in the TWX WorldSST.ts
	#	script
	#
	#	Added: furbpoint cmd param. reflected same in help file
	#			limp param option. if passed, script start dropping
	#			limps everywhere.

	logging off
	reqrecording
	goto :Starting
:quikstats
	setVar $CURRENT_PROMPT 		"Undefined"
	killtrigger noprompt
	killtrigger prompt1
	killtrigger prompt2
	killtrigger prompt3
	killtrigger prompt4
	killtrigger statlinetrig
	killtrigger getLine2
	setTextTrigger 		prompt1 	:allPrompts 		"(?="
	setTextLineTrigger 	prompt2 	:secondaryPrompts 	"(?)"
	setTextLineTrigger 	statlinetrig 	:statStart 		#179
	setTextTrigger		prompt3         :terraPrompts		"Do you wish to (L)eave or (T)ake Colonists?"
	setTextTrigger		prompt4         :terraPrompts		"How many groups of Colonists do you want to take ("
	send "^Q/"
	pause

	:allPrompts
		getWord currentansiline $checkPrompt 1
		getWord currentline $tempPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $CURRENT_PROMPT $tempPrompt
		end
		setTextLineTrigger prompt1 :allPrompts "(?="
		pause
	:secondaryPrompts
		getWord currentansiline $checkPrompt 1
		getWord currentline $tempPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $CURRENT_PROMPT $tempPrompt
		end
		setTextLineTrigger prompt2 :secondaryPrompts "(?)"
		pause
	:terraPrompts
		killtrigger prompt3
		killtrigger prompt4
		getWord currentansiline $checkPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $CURRENT_PROMPT "Terra"
		end
		setTextTrigger		prompt3         :terraPrompts		"Do you wish to (L)eave or (T)ake Colonists?"
		setTextTrigger		prompt4         :terraPrompts		"How many groups of Colonists do you want to take ("
		pause

	:statStart
		killtrigger prompt1
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger noprompt
		setVar $stats ""
		setVar $wordy ""


	:statsline
		killtrigger statlinetrig
		killtrigger getLine2
		setVar $line2 CURRENTLINE
		replacetext $line2 #179 " "
		striptext $line2 ","
		setVar $stats $stats & $line2
		getWordPos $line2 $pos "Ship"
		if ($pos > 0)
			goto :gotStats
		else
			setTextLineTrigger getLine2 :statsline
			pause
		end

	:gotStats
		setVar $stats $stats & " @@@"

		setVar $current_word 0
		while ($wordy <> "@@@")
			if ($wordy = "Sect")
				getWord $stats $CURRENT_SECTOR   	($current_word + 1)
			elseif ($wordy = "Turns")
				getWord $stats $TURNS  			($current_word + 1)
			elseif ($wordy = "Creds")
				getWord $stats $CREDITS  		($current_word + 1)
			elseif ($wordy = "Figs")
				getWord $stats $FIGHTERS   		($current_word + 1)
			elseif ($wordy = "Shlds")
				getWord $stats $SHIELDS  		($current_word + 1)
			elseif ($wordy = "Hlds")
				getWord $stats $TOTAL_HOLDS   		($current_word + 1)
			elseif ($wordy = "Ore")
				getWord $stats $ORE_HOLDS    		($current_word + 1)
			elseif ($wordy = "Org")
				getWord $stats $ORGANIC_HOLDS    	($current_word + 1)
			elseif ($wordy = "Equ")
				getWord $stats $EQUIPMENT_HOLDS    	($current_word + 1)
			elseif ($wordy = "Col")
				getWord $stats $COLONIST_HOLDS    	($current_word + 1)
			elseif ($wordy = "Phot")
				getWord $stats $PHOTONS   		($current_word + 1)
			elseif ($wordy = "Armd")
				getWord $stats $ARMIDS   		($current_word + 1)
			elseif ($wordy = "Lmpt")
				getWord $stats $LIMPETS   		($current_word + 1)
			elseif ($wordy = "GTorp")
				getWord $stats $GENESIS  		($current_word + 1)
			elseif ($wordy = "TWarp")
				getWord $stats $TWARP_TYPE  		($current_word + 1)
			elseif ($wordy = "Clks")
				getWord $stats $CLOAKS   		($current_word + 1)
			elseif ($wordy = "Beacns")
				getWord $stats $BEACONS 		($current_word + 1)
			elseif ($wordy = "AtmDt")
				getWord $stats $ATOMIC  		($current_word + 1)
			elseif ($wordy = "Corbo")
				getWord $stats $CORBO   		($current_word + 1)
			elseif ($wordy = "EPrb")
				getWord $stats $EPROBES   		($current_word + 1)
			elseif ($wordy = "MDis")
				getWord $stats $MINE_DISRUPTORS   	($current_word + 1)
			elseif ($wordy = "PsPrb")
				getWord $stats $PSYCHIC_PROBE  		($current_word + 1)
			elseif ($wordy = "PlScn")
				getWord $stats $PLANET_SCANNER  	($current_word + 1)
			elseif ($wordy = "LRS")
				getWord $stats $SCAN_TYPE    		($current_word + 1)
			elseif ($wordy = "Aln")
				getWord $stats $ALIGNMENT    		($current_word + 1)
			elseif ($wordy = "Exp")
				getWord $stats $EXPERIENCE    		($current_word + 1)
			elseif ($wordy = "Corp")
				getWord $stats $CORP   			($current_word + 1)
			elseif ($wordy = "Ship")
				getWord $stats $SHIP_NUMBER   		($current_word + 1)
			end
			add $current_word 1
			getWord $stats $wordy $current_word
		end
	:doneQuikstats
		killtrigger prompt1
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger statlinetrig
		killtrigger getLine2

return
# ============================== END QUICKSTATS SUB==============================
	
:transport
	if ($inShip1)
		send ("x     "&$psst_Ship2&"* q * ")
	else
		send ("x     "&$psst_Ship1&"* q * ")
	end
	killAllTriggers
	setTextLineTrigger success :transported "Security code accepted"
	setTextLineTrigger noship :noneAvailable "That is not an available ship."
	setTextLineTrigger range :outOfRange "only has a transport range of"
	pause
	:outOfRange
	:noneAvailable
		killAllTriggers
		halt
		goto :transport
	:transported
		killAllTriggers
		if ($inShip1)
			setVar $inShip1 FALSE
		else
			setVar $inShip1 TRUE
		end
		setVar $TURNS ($TURNS-1)
	return

:GoGo
	window cash 300 170 ("LoneStar's World SST - " & GAMENAME) ONTOP
	gosub :displayCredits
	while (TRUE)
		if (($unlimitedGame = FALSE) AND ($TURNS <= $bot_turn_limit))
			goto :endSST
		end
		gosub :findSSTPorts
		setVar $busted FALSE
		while ($busted = FALSE)
			if (($unlimitedGame = FALSE) AND ($TURNS <= $bot_turn_limit))
				goto :endSST
			end
			gosub :steal
		end
		gosub :quikstats
		setVar $minRefurb ($EXPERIENCE / $steal_factor - 1)
		if ($minRefurb > 255)
			setVar $minRefurb 255
		end
		setVar $minRefurb (($minRefurb * 7) / 8)
		if (($ship1TotalHolds < $minRefurb) OR ($ship2TotalHolds < $minRefurb))
			gosub :refurb
		end
		if (($dropCashAtBase = TRUE) AND ($CREDITS > $dropCashLimit))
			gosub :dropCashAtBase
		end
	end
	goto :endSST


:checkSSTShips
	setVar $foundShip2 FALSE
	killalltriggers
	send "wn*"
	setTextLineTrigger other :shipline " "&$current_Sector&" "
	setTextLineTrigger noShips :shipDone "You do not own any other ships in this sector!"
	pause

	:shipline
		killalltriggers
		add $shipCount 1
		getWord CURRENTLINE $tempID 1
		if ($tempID = $psst_Ship2)
			setVar $foundShip2 TRUE
		end
		setTextLineTrigger other :shipline " "&$current_Sector&" "
		setTextLineTrigger noMore :shipDone "Choose which ship to tow "
		pause
	:shipDone
	killalltriggers
	return

:moveIntoSector
	setVar $result ""
	setVar $dropFigs TRUE
	setVar $result $result&"m "&$moveIntoSector&"*"
	if (($moveIntoSector > 10) AND ($moveIntoSector <> $STARDOCK))
		setVar $result $result&"za"&$SHIP_MAX_ATTACK&"* * "
	end
	if (($dropFigs = TRUE) AND ($moveIntoSector > 10) AND ($moveIntoSector <> $STARDOCK) AND ($j > 2))
		if ($x100)
			if ($FIGHTERS > 1000)
				setVar $result $result&"f  z  100* z  c  d  *  "
				setvar $FIGHTERS ($FIGHTERS - 100)
			end
		else
			setVar $result $result&"f  z  1* z  c  d  *  "
		end
	end
	if ($DROPLIMPS)
		setVar $result $result&"  H  2  Z  3*  Z C  *  "
	end
	if ($DROPARMIDS)
		setVar $Result $result&"  H  1  Z  3*  Z C  *  "
	end
	send $result
	#waitOn "["&$moveIntoSector&"]"
	#if (($dropFigs) AND ($moveIntoSector > 10) AND ($moveIntoSector <> $STARDOCK) AND ($j > 2))
	#	waitOn "<Drop/Take Fighters>"
	#end
	send "  sdsh"
	waitOn "Long Range Scan"
	waiton "Warps to Sector(s) :"
	return

:findSSTPorts

	while ($ship1NeedsPort = TRUE)
		if ($inShip1 <> TRUE)
			goSub :transport
		end
		:tryNewRouteShip1
		setVar $destination 0
		while ($destination = 0)
			gosub :getRandomCourse
			gosub :quikstats
		end
		setVar $j 3
		while (($j <= $courseLength) AND ($ship1NeedsPort = TRUE))
			setVar $moveIntoSector $COURSE[$j]
			setVar $containsShieldedPlanet FALSE
			setVar $p 1
			#echo "**["&$moveintosector&"]**["&$sectors&"]*"
			while ($p <= SECTOR.PLANETCOUNT[$moveIntoSector])
				getWord SECTOR.PLANETS[$moveIntoSector][$p] $test 1
				if ($test = "<<<<")
					setVar $containsShieldedPlanet TRUE
				end
				add $p 1
			end
        		if ($containsShieldedPlanet)
				echo "*Avoiding shielded planet*"
				goto :tryNewRouteShip1
			end
			setVar $figOwner  SECTOR.FIGS.OWNER[$moveIntoSector]
			setVar $mineOwner SECTOR.MINES.OWNER[$moveIntoSector]
			setVar $limpOwner SECTOR.LIMPETS.OWNER[$moveIntoSector]
			setVar $figCount  SECTOR.FIGS.QUANTITY[$moveIntoSector]
			if (($figCount > $safeFighterLevel) AND (($figOwner <> "belong to your Corp") AND ($figOwner <> "yours")))
				echo "*Avoiding too many enemy fighters*"
				goto :tryNewRouteShip1
			end
			gosub :moveIntoSector
			getSectorParameter $moveIntoSector "BUSTED" $isBusted
			if ((PORT.BUYEQUIP[$moveIntoSector] = TRUE) AND ($isBusted <> TRUE) AND ($moveIntoSector <> $ship2Sector))
				gosub :quikstats
				setVar $ship1NeedsPort FALSE
				setVar $ship1Sector $COURSE[$j]
				setVar $testSector $COURSE[$j]
				gosub :getSSTPortInfo
				setVar $ship1TotalHolds $TOTAL_HOLDS
				setVar $ship1Equipment $EQUIPMENT_HOLDS
				gosub :displayCredits
			else
				setVar $k 1
				setVar $isFound FALSE
				while ((SECTOR.WARPS[$COURSE[$j]][$k] > 0) AND ($isFound = FALSE))
					setVar $checkingNeighbor SECTOR.WARPS[$COURSE[$j]][$k]
					getSectorParameter $checkingNeighbor "BUSTED" $isBusted
					setVar $containsShieldedPlanet FALSE
					setVar $p 1
					while ($p <= SECTOR.PLANETCOUNT[$checkingNeighbor])
						getWord SECTOR.PLANETS[$checkingNeighbor][$p] $test 1
						if ($test = "<<<<")
							setVar $containsShieldedPlanet TRUE
						end
						add $p 1
					end
					setVar $figOwner  SECTOR.FIGS.OWNER[$checkingNeighbor]
					setVar $mineOwner SECTOR.MINES.OWNER[$checkingNeighbor]
					setVar $limpOwner SECTOR.LIMPETS.OWNER[$checkingNeighbor]
					setVar $figCount  SECTOR.FIGS.QUANTITY[$checkingNeighbor]
					if ((PORT.BUYEQUIP[$checkingNeighbor] = TRUE) AND ($isBusted <> TRUE) AND ($checkingNeighbor <> $ship2Sector) AND ($containsShieldedPlanet = FALSE) AND (($figCount <= $safeFighterLevel) AND (($figOwner = "belong to your Corp") OR ($figOwner = "yours"))))
						setVar $moveIntoSector $checkingNeighbor
						gosub :moveIntoSector
						setVar $ship1NeedsPort FALSE
						setVar $ship1Sector $checkingNeighbor
						gosub :quikstats
						setVar $testSector $checkingNeighbor
						gosub :getSSTPortInfo
						setVar $ship1TotalHolds $TOTAL_HOLDS
						setVar $ship1Equipment $EQUIPMENT_HOLDS
						gosub :displayCredits
						setVar $isFound TRUE
					end
					add $k 1
				end
			end
			add $j 1
		end
	end

	while ($ship2NeedsPort = TRUE)
		if ($inShip1)
			goSub :transport
		end
		:tryNewRouteShip2
		setVar $destination 0
		while ($destination = 0)
			gosub :getRandomCourse
			gosub :quikstats
		end
		setVar $j 3
		while (($j <= $courseLength) AND ($ship2NeedsPort = TRUE))
			setVar $moveIntoSector $COURSE[$j]
			setVar $containsShieldedPlanet FALSE
			setVar $p 1
			#echo "**["&$moveintosector&"]**["&$sectors&"]*"
			while ($p <= SECTOR.PLANETCOUNT[$moveIntoSector])
				getWord SECTOR.PLANETS[$moveIntoSector][$p] $test 1
				if ($test = "<<<<")
					setVar $containsShieldedPlanet TRUE
				end
				add $p 1
			end
			if ($containsShieldedPlanet)
				goto :tryNewRouteShip2
			end
			setVar $figOwner  SECTOR.FIGS.OWNER[$moveIntoSector]
			setVar $mineOwner SECTOR.MINES.OWNER[$moveIntoSector]
			setVar $limpOwner SECTOR.LIMPETS.OWNER[$moveIntoSector]
			setVar $figCount  SECTOR.FIGS.QUANTITY[$moveIntoSector]
			if (($figCount > $safeFighterLevel) AND (($figOwner <> "belong to your Corp") AND ($figOwner <> "yours")))
				echo "*Avoiding too many enemy fighters*"
				goto :tryNewRouteShip2
			end
			gosub :moveIntoSector
			getSectorParameter $COURSE[$j] "BUSTED" $isBusted
			if ((PORT.BUYEQUIP[$COURSE[$j]] = TRUE) AND ($isBusted <> TRUE) AND ($COURSE[$j] <> $ship1Sector))
				setVar $ship2NeedsPort FALSE
				setVar $ship2Sector $COURSE[$j]
				gosub :quikstats
				setVar $testSector $COURSE[$j]
				gosub :getSSTPortInfo
				setVar $ship2TotalHolds $TOTAL_HOLDS
				setVar $ship2Equipment $EQUIPMENT_HOLDS
				gosub :displayCredits
			else
				setVar $k 1
				setVar $isFound FALSE
				while ((SECTOR.WARPS[$COURSE[$j]][$k] > 0) AND ($isFound = FALSE))
					setVar $checkingNeighbor SECTOR.WARPS[$COURSE[$j]][$k]
					setVar $containsShieldedPlanet FALSE
					setVar $p 1
					while ($p <= SECTOR.PLANETCOUNT[$checkingNeighbor])
						getWord SECTOR.PLANETS[$checkingNeighbor][$p] $test 1
						if ($test = "<<<<")
							setVar $containsShieldedPlanet TRUE
						end
						add $p 1
					end
					setVar $figOwner  SECTOR.FIGS.OWNER[$checkingNeighbor]
					setVar $mineOwner SECTOR.MINES.OWNER[$checkingNeighbor]
					setVar $limpOwner SECTOR.LIMPETS.OWNER[$checkingNeighbor]
					setVar $figCount  SECTOR.FIGS.QUANTITY[$checkingNeighbor]
					getSectorParameter $checkingNeighbor "BUSTED" $isBusted
					if ((PORT.BUYEQUIP[$checkingNeighbor] = TRUE) AND ($isBusted <> TRUE) AND ($checkingNeighbor <> $ship1Sector) AND ($containsShieldedPlanet = FALSE) AND (($figCount <= $safeFighterLevel) AND (($figOwner = "belong to your Corp") OR ($figOwner = "yours"))))
						setVar $moveIntoSector $checkingNeighbor
						gosub :moveIntoSector
						setVar $ship2NeedsPort FALSE
						setVar $ship2Sector $checkingNeighbor
						gosub :quikstats
						setVar $testSector $checkingNeighbor
						gosub :getSSTPortInfo
						setVar $ship2TotalHolds $TOTAL_HOLDS
						setVar $ship2Equipment $EQUIPMENT_HOLDS
						gosub :displayCredits
						setVar $isFound TRUE
					end
					add $k 1
				end
			end
			add $j 1
		end
	end

	gosub :FindShip

	if (($dist1 > $transportRange) OR ($dist2 > $transportRange))
		if ($inship1)
			setVar $ship1NeedsPort TRUE
		else
			setVar $ship2NeedsPort TRUE
		end
    	gosub :getCourse
		setVar $j 2
		setVar $result ""
		while ($j <= ($courseLength - 1))
			setVar $result $result&" m "&$COURSE[$j]&"* "
			if (($COURSE[$j] > 10) AND ($COURSE[$j] <> STARDOCK))
				setVar $result $result & " z a " & $SHIP_MAX_ATTACK & "* * "
			end
			if (($COURSE[$j] > 10) AND ($COURSE[$j] <> STARDOCK) AND ($j > 2))
				setVar $result $result&" f 1 * c d "
			end
			add $j 1
		end
		send $result & " ** "
		gosub :quikstats
		goto :findSSTPorts
	end
	return

:getRandomCourse
#Does Random Course Calculation
	killalltriggers
	setArray $COURSE 80
	setVar $courseLength 0
	setVar $sectors ""
	setTextLineTrigger sectorlinetrig :sectorsline " > "
	getRnd $destination 11 SECTORS
	send "^f*"&$destination&"**q"
	pause

:getCourse
#Does Specific Course Calculation
	killalltriggers
	setVar $courseLength 0
	setArray $COURSE 80
	setVar $sectors ""
	setTextLineTrigger sectorlinetrig :sectorsline " > "
	send "^f*"&$destination&"**q"
	pause


:sectorsline
	killAllTriggers
	setVar $line CURRENTLINE
	replacetext $line ">" " "
	striptext $line "("
	striptext $line ")"
	setVar $line $line&" "
	getWordPos $line $pos "So what's the point?"
	getWordPos $line $pos2 ": ENDINTERROG"
	getWordPos $line $pos3 "*** Error - No route within"
	if (($pos > 0) OR ($pos2 > 0) OR ($pos3 > 0))
		goto :noPath
	end
	getWordPos $line $pos " sector "
	getWordPos $line $pos2 "TO"
	if (($pos <= 0) AND ($pos2 <= 0))
		setVar $sectors $sectors & " " & $line
	end
	getWordPos $line&" " $pos " "&$destination&" "
	getWordPos $line $pos2 "("&$destination&")"
	getWordPos $line $pos3 "TO"
	if ((($pos > 0) OR ($pos2 > 0)) AND ($pos3 <= 0))
		goto :gotSectors
	else
		setTextLineTrigger sectorlinetrig :sectorsline " > "
		setTextLineTrigger sectorlinetrig2 :sectorsline " "&$destination&" "
		setTextLineTrigger sectorlinetrig3 :sectorsline " "&$destination
		setTextLineTrigger sectorlinetrig4 :sectorsline "("&$destination&")"
		setTextLineTrigger donePath :sectorsline "So what's the point?"
		setTextLineTrigger donePath2 :sectorsline ": ENDINTERROG"
	end
	pause

:gotSectors
	killAllTriggers
	setVar $sectors $sectors&" :::"
	setVar $courseLength 0
	setVar $index 1
	:keepGoing
	getWord $sectors $COURSE[$index] $index
	while ($COURSE[$index] <> ":::")
		add $courseLength 1
		add $index 1
		getWord $sectors $COURSE[$index] $index
	end

:noPath
	if ($courseLength <= 0)
		setVar $destination 0
	end
	killAllTriggers
	return

:steal
	
	getSectorParameter $ship1Sector "BUSTED" $isBusted1
	getSectorParameter $ship2Sector "BUSTED" $isBusted2
	if (($isBusted1 <> TRUE) AND ($isBusted2 <> TRUE))
		setVar $maxSteal ($EXPERIENCE / $steal_factor - 1)
		setVar $send ""
			if ($inShip1)
				if ($ship1Equipment > 0)
					# sell off existing equipment
					setVar $send $send & "p t * * 0* 0* "
					setVar $ship1Equipment 0
					add $equipAtPort[$ship1Sector] $ship1Equipment
				end
				# steal as much as we are able to on this ship
				if ($ship1TotalHolds < $maxSteal)
					setVar $steal $ship1TotalHolds
				else
					setVar $steal $maxSteal
				end

				while ($equipAtPort[$ship1Sector] < ($steal + 20))
					setVar $upgrade ($steal - $equipAtPort[$ship1Sector])
					divide $upgrade 10
					add $upgrade 4
					setVar $send $send & "o 3" & $upgrade & "* * "
					add $equipAtPort[$ship1Sector] ($upgrade * 10)
				end
 				setVar $send $send & "p r * s z 3 " & $steal & "* x    "
				setVar $ship1Equipment $steal
			else
				if ($ship2Equipment > 0)
					# sell off existing equipment
					setVar $send $send & "p t * * 0* 0* "
      					setVar $ship2Equipment 0
					add $equipAtPort[$ship2Sector] $ship2Equipment
				end
				# steal as much as we are able to on this ship
				if ($ship2TotalHolds < $maxSteal)
					setVar $steal $ship2TotalHolds
				else
					setVar $steal $maxSteal
				end

				while ($equipAtPort[$ship2Sector] < ($steal + 20))
					setVar $upgrade ($steal - $equipAtPort[$ship2Sector])
					divide $upgrade 10
					add $upgrade 4
					setVar $send $send & "o 3" & $upgrade & "* * "
					add $equipAtPort[$ship2Sector] ($upgrade * 10)
				end
 				setVar $send $send & "p r* s   z3  " & $steal & "*  x    "
				setVar $ship2Equipment $steal
			end

			if ($inShip1)
				send $send & $psst_Ship2 & "*  * "
				setVar $inShip1 FALSE
			else
   				send $send & $psst_Ship1 & "*  * "
				setVar $inShip1 TRUE
			end
			setVar $TURNS ($TURNS-2)
   			if ($inShip1)
				setVar $LastSteal $ship1Sector
			else
				setVar $LastSteal $ship2Sector
			end
			add $curClock 1
		end

			# calculate experience gain or hold loss
			setVar $stake ($steal - 1) / 11

			waitOn "(R)ob this port, (S)teal product"
			setTextLineTrigger success :success "Success!"
			setTextLineTrigger busted :busted "Suddenly you're Busted!"
			setTextLineTrigger portMaxxed :busted "There aren't that many holds of Equipment at this port!"
			setTextLineTrigger fakeBust :busted "Do you want instructions (Y/N) [N]?"
			pause

			:success
				add $EXPERIENCE $stake
				if ($inShip1)
					setVar $ship2Equipment 1
					setVar $lastStealRobSector $ship2Sector
					saveVar $lastStealRobSector
				else
					setVar $ship1Equipment 1
					setVar $lastStealRobSector $ship1Sector
					saveVar $lastStealRobSector
				end
				goto :continue

			:busted
    		# calculate holds lost and flag this sector as busted
				if ($inShip1)
					subtract $ship2TotalHolds $stake
					setSectorParameter $ship2Sector "BUSTED" TRUE
					setVar $lastBustSector $ship2Sector
					saveVar $lastBustSector
					setVar $ship2Equipment 0
   				else
					subtract $ship1TotalHolds $stake
					setSectorParameter $ship1Sector "BUSTED" TRUE
					setVar $lastBustSector $ship1Sector
					saveVar $lastBustSector
					setVar $ship1Equipment 0
				end
				add $numberbusted 1
				setVar $busted 1
				gosub :transport
				if ($inShip1)
					setVar $ship1NeedsPort TRUE
				else
					setVar $ship2NeedsPort TRUE
				end
				if ($QUIET = 0)
					send "'<"&$subspace&">[Busted:"&$lastBustSector&"]<"&$subspace&">* c"
				else
					send "  c"
				end
				waitOn "<Computer activated>"
				send "tq"
				setTextLineTrigger AM :getBustStamp " AM "
				setTextLineTrigger PM :getBustStamp " PM "
				pause
    			:getBustStamp
				killtrigger AM
				killtrigger PM
				killalltriggers
				if ($inShip1)
					if ($BUST_FILE <> "") and ($BUST_FILE <> "0")
						write $BUST_FILE $ship1Sector&"  "&CURRENTLINE
					end
    				else
					if ($BUST_FILE <> "") and ($BUST_FILE <> "0")
						write $BUST_FILE $ship2Sector&"  "&CURRENTLINE
					end
				end

    				waitOn "<Computer deactivated>"

			:continue
				killTrigger success
				killTrigger fakeBust
				killTrigger busted
				killTrigger portMaxxed
				subtract $curClock 1
				add $curResult 1

				if ($curResult > 2)
					setVar $curResult 1
				end
return

:getSSTPortInfo
	
	send "* cr*q"
	waitOn "What sector is the port in? ["
	:portInfo
		setTextLineTrigger getPortEquip :getPortEquip "Equipment  Buying"
		setTextLineTrigger noPortEquip  :noEquipHere "I have no information about a port in that sector."
		pause

		:noEquipHere
			killalltriggers
			setVar $equipBuy 0
			setVar $equipPerc 0
			goto :gotAllPortInfo

		:getPortEquip
			killAllTriggers
			getWord CURRENTLINE $equipBuy 3
			getWord CURRENTLINE $equipPerc 4
			stripText $equipPerc "%"
			setVar $x 10000
			if ($equipPerc = 0)
 				setVar $equipAtPort[$TestSector] ($TOTAL_HOLDS + 50)
			else
				divide $x $equipPerc
				multiply $x $equipBuy
				divide $x 100
				subtract $x 1
				subtract $x $equipBuy

				if ($x < 0)
					setVar $equipAtPort[$TestSector] 0
				else
       	 				setVar $equipAtPort[$TestSector] $x
				end
			end
		:gotallportinfo
			killAllTriggers

  return

:refurb

	if ($FURBING <> 0)
		setVar $mowIntoSector $FURBING
		setVar $refurbPort $FURBING
	else
		setVar $mowIntoSector $refurbPort
	end
	if ($ultraSafe)
		:trySafeMowAgainRefurb
			gosub :safemowIntoSector
			if ($isSafe = FALSE)
				goto :trySafeMowAgainRefurb
			end
	else
		gosub :mowIntoSector
	end
	gosub :quikstats

	if ($CURRENT_SECTOR = $refurbPort)
		killAllTriggers
		if ($FURBING <> $Stardock)
			send "p ty"
		else
			send "p s g y g q s p"
		end
		waitOn "A  Cargo holds     :"
		getWord CURRENTLINE $holdsprice 5
		getWord CURRENTLINE $holdsToBuy 10
		setVar $beforeFurbCredits $CREDITS
		setVar $CREDITS ($CREDITS-($holdsprice * $holdsToBuy))
		if ($CREDITS > $CASH_TO_HOLD_ONTO)
			if ($refurbFighters)
				waitOn "B  Fighters        :"
				getWord CURRENTLINE $figprice 4
				getWord CURRENTLINE $figsToBuy 8
			else
				setVar $figsToBuy 0
			end
			if ($refurbShields)
				waitOn "C  Shield Points   :"
				getWord CURRENTLINE $shieldprice 5
				getWord CURRENTLINE $shieldsToBuy 9
			else
				setVar $shieldsToBuy 0
			end
			if ($figsToBuy > 0)
				if (($figprice * $figsToBuy) > ($CREDITS-$CASH_TO_HOLD_ONTO))
					setVar $figsToBuy (($CREDITS-$CASH_TO_HOLD_ONTO)/$figprice)
				end
				setVar $CREDITS ($CREDITS-($figprice * $figsToBuy))
			end
			if ($shieldsToBuy > 0)
				if (($shieldprice * $shieldsToBuy) > ($CREDITS-$CASH_TO_HOLD_ONTO))
					setVar $shieldsToBuy (($CREDITS-$CASH_TO_HOLD_ONTO)/$shieldprice)
				end
				setVar $CREDITS ($CREDITS-($shieldprice * $shieldsToBuy))
			end
		else
			setVar $figsToBuy 0
			setVar $shieldsToBuy 0
		end
		if ($FURBING <> $Stardock)
			send "a "&$holdsToBuy&"* y b "&$figsToBuy&"* c "&$shieldsToBuy&"* q q q z n * "
		elseif (($FURBING = $Stardock) AND (($DROPLIMPS) OR ($DROPARMIDS)) AND ($CREDITS > ($CASH_TO_HOLD_ONTO + 2000000)))
			send "a "&$holdsToBuy&"* y b "&$figsToBuy&"* c "&$shieldsToBuy&"* q q h "
			waitfor "<Hardware Emporium>"
			if ($DROPLIMPS)
				send "L"
				waitfor "How many mines do you want"
				getText CURRENTLINE $Buy "(Max" ") ["
				striptext $buy " "
				send $buy & "*"
				waitfor "<Hardware Emporium>"
			end
			if ($DROPARMIDS)
				send "M"
				waitfor "How many mines do you want"
				getText CURRENTLINE $Buy "(Max" ") ["
				striptext $buy " "
				send $buy & "*"
				waitfor "<Hardware Emporium>"
			end
			send "/"
			waitfor #179 & "Figs"
			getText CURRENTLINE $CREDITS (#179 & "Creds") (#179 & "Figs")
			striptext $CREDITS " "
			stripText $CREDITS ","
			send " Q Q "
		else
			send "a "&$holdsToBuy&"* y b "&$figsToBuy&"* c "&$shieldsToBuy&"* q q q z n * "
		end

		setVar $spentCredits ($spentCredits+($beforeFurbCredits-$CREDITS))
		setVar $fightersPurchased ($fightersPurchased+$figsToBuy)
		setVar $shieldsPurchased ($shieldsPurchased+$shieldsToBuy)
	else
		send "'Something bad happened on mow, I am probably in big trouble. [Temp error message until saveme implemented]*"
	end

return

:safemowIntoSector
	setVar $isSafe TRUE
	setVar $destination $mowIntoSector
	gosub :getCourse
	setVar $j 2
	setVar $result ""
	while (($j <= $courseLength) AND ($isSafe))
		setVar $nextSafeSector $Course[$j]
		send "sdsh"
		waitOn "Long Range Scan"
		waiton "Warps to Sector(s) :"
		#gosub :quikstats
		setVar $minesafe TRUE
		setVar $figsSafe  ((SECTOR.FIGS.QUANTITY[$nextSafeSector] <= 0) OR (((SECTOR.FIGS.OWNER[$nextSafeSector] = "yours") OR (SECTOR.FIGS.OWNER[$nextSafeSector] = "belong to your Corp"))))
		setVar $planetSafe ((SECTOR.PLANETCOUNT[$nextSafeSector] <= 0) OR (($nextSafeSector = $stardock) OR ($nextSafeSector <= 10)))
		setVar $navHazSafe TRUE
		setVar $densitySafe TRUE
		setVar $limpetSafe TRUE
		if ($densitySafe OR ($limpetsSafe AND $figsSafe AND $minesSafe AND $navHazSafe AND $planetSafe))
			setVar $result ($result & "m "&$Course[$j]&"* ")
			if (($COURSE[$j] > 10) AND ($COURSE[$j] <> STARDOCK))
				setVar $result ($result & "za"&$SHIP_MAX_ATTACK&"* * ")
			end
		else
			setVar $result ($result & "c v"&$nextSafeSector&"*q ")
			setVar $isSafe FALSE
			send $result
			return
		end
		if (($Course[$j] > 10) AND ($Course[$j] <> STARDOCK) AND ($j > 2))
			setVar $result ($result & "f z 1* z c d * ")
			setSectorParameter $Course[$j] "FIGSEC" TRUE
	       	if ($DROPLIMPS)
				setVar $result $result&"  H  2  Z  3*  Z C  *  "
			end
			if ($DROPARMIDS)
				setVar $Result $result&"  H  1  Z  3*  Z C  *  "
			end
		end
		setVar $result ($result & "  /")
		send $result
		waitfor (#179 & "Turns")
		add $j 1
	end
return

:mowIntoSector
	setVar $destination $mowIntoSector
	gosub :getCourse
	setVar $j 2
	setVar $result ""
	while ($j <= $courseLength)
		setVar $result $result&"m"&$COURSE[$j]&"* "
		if (($COURSE[$j] > 10) AND ($COURSE[$j] <> STARDOCK))
			setVar $result $result&"za"&$SHIP_MAX_ATTACK&"* * "
		end
		if (($dropFigs = TRUE) AND ($COURSE[$j] > 10) AND ($COURSE[$j] <> STARDOCK) AND ($j > 2))
			if ($x100)
				if ($FIGHTERS > 1000)
					setVar $result $result&"f  z  100* z c d *  "
					setvar $FIGHTERS ($FIGHTERS - 100)
				end
			else
				setVar $result $result&"f  z  1* z c d *  "
			end
		end

       	if ($DROPLIMPS)
			setVar $result $result&"  H  2  Z  3*  Z C  *  "
		end
		if ($DROPARMIDS)
			setVar $Result $result&"  H  1  Z  3*  Z C  *  "
		end

		add $j 1
	end
	send $result
return
:dropCashAtBase
	if ($CREDITS > $dropCashLimit)
		setVar $mowIntoSector $cashDropSector
		if ($ultraSafe)
			:trySafeMowAgain
				gosub :safemowIntoSector
				if ($isSafe = FALSE)
					goto :trySafeMowAgain
				end
		else
			gosub :mowIntoSector
		end
		gosub :quikstats
		if ($CURRENT_SECTOR = $cashDropSector)
			send "l "&$cashDropPlanet &"* c t t "&($CREDITS-1000000)&"* qq* "
			#send "l "&$cashDropPlanet &"* m n l "&($FIGHTERS/2)&"*  c t t "&($CREDITS-1000000)&"* qq* "
			add $cashDeposited ($CREDITS-1000000)
			setVar $CREDITS 1000000
			gosub :displayCredits
		else
			send "'Something bad happened on mow, I am probably in big trouble. [Temp error message until saveme implemented]*"
		end
	end
return
:displayCredits
	
	setVar $formattedDepositedCredits ""
	setVar $spentCredits2 $cashDeposited
	getLength $spentCredits2 $length
	while ($length > 3)
		cutText $spentCredits2 $snippet $length-2 9999
		cutText $spentCredits2 $spentCredits2 1 $length-3
		getLength $spentCredits2 $length
		setVar $formattedDepositedCredits ","&$snippet&$formattedDepositedCredits
	end
	setVar $formattedDepositedCredits $spentCredits2&$formattedDepositedCredits

	setVar $formattedOnHandCredits ""
	setVar $spentCredits2 $CREDITS
	getLength $spentCredits2 $length
	while ($length > 3)
		cutText $spentCredits2 $snippet $length-2 9999
		cutText $spentCredits2 $spentCredits2 1 $length-3
		getLength $spentCredits2 $length
		setVar $formattedOnHandCredits ","&$snippet&$formattedOnHandCredits
	end
	setVar $formattedOnHandCredits $spentCredits2&$formattedOnHandCredits

	setVar $formattedSpentCredits ""
	setVar $spentCredits2 $spentCredits
	getLength $spentCredits2 $length
	while ($length > 3)
		cutText $spentCredits2 $snippet $length-2 9999
		cutText $spentCredits2 $spentCredits2 1 $length-3
		getLength $spentCredits2 $length
		setVar $formattedSpentCredits ","&$snippet&$formattedSpentCredits
	end
	setVar $formattedSpentCredits $spentCredits2&$formattedSpentCredits

	setVar $formattedFighters ""
	setVar $spentCredits2 $fightersPurchased
	getLength $spentCredits2 $length
	while ($length > 3)
		cutText $spentCredits2 $snippet $length-2 9999
		cutText $spentCredits2 $spentCredits2 1 $length-3
		getLength $spentCredits2 $length
		setVar $formattedFighters ","&$snippet&$formattedFighters
	end
	setVar $formattedFighters $spentCredits2&$formattedFighters

	setVar $formattedShields ""
	setVar $spentCredits2 $shieldsPurchased
	getLength $spentCredits2 $length
	while ($length > 3)
		cutText $spentCredits2 $snippet $length-2 9999
		cutText $spentCredits2 $spentCredits2 1 $length-3
		getLength $spentCredits2 $length
		setVar $formattedShields ","&$snippet&$formattedShields
	end
	setVar $formattedShields $spentCredits2&$formattedShields

	add $portaverage $cashDeposited
	add $portaverage $CREDITS
	add $portaverage $spentCredits
	subtract $portaverage $startcash
	if ($numberbusted = 0)
		setvar $numberbusted 1
	end
	divide $portaverage $numberbusted

	setVar $formattedPortAverage ""
	setVar $spentCredits2 $portaverage
	getLength $spentCredits2 $length
	while ($length > 3)
		cutText $spentCredits2 $snippet $length-2 9999
		cutText $spentCredits2 $spentCredits2 1 $length-3
		getLength $spentCredits2 $length
		setVar $formattedPortAverage ","&$snippet&$formattedPortAverage
	end
	setVar $formattedPortAverage $spentCredits2&$formattedPortAverage

	setWindowContents cash "    Cash Deposited: "&$formattedDepositedCredits&"*      Cash On Hand: "&$formattedOnHandCredits&"*  Busted xxB Ports: "&$numberbusted&"*  Credits per Port: "&$formattedPortAverage&"*   Fighters bought: "&$formattedFighters&"*    Shields bought: "&$formattedShields&"*        Experience: "&$EXPERIENCE&"*             Turns: "&$TURNS&"*"
	return

:endSST
	killalltriggers
	send "q q q q  * * * "
	send "'{" $bot_name "} - World SST has completed, make sure you pick up the bot and its ships.*"
	halt


# ==============================  START PLANET INFO SUBROUTINE  =================
:getPlanetInfo

	send "*"
	setTextLineTrigger planetInfo :planetInfo "Planet #"
	pause

	:planetinfo
		killalltriggers
		setVar $CITADEL 0
		setVar $SECTOR_CANNON 0
		setVar $ATMOSPHERE_CANNON 0
		setVar $CITADEL_CREDITS 0
		getWord CURRENTLINE $PLANET 2
		stripText $PLANET "#"
		getWord CURRENTLINE $CURRENT_SECTOR 5
		stripText $CURRENT_SECTOR ":"
		waitfor "2 Build 1   Product    Amount     Amount     Maximum"

        :getPlanetStuff
		setTextLineTrigger fuelstart :fuelstart "Fuel Ore"
		setTextLineTrigger orgstart :orgstart "Organics"
		setTextLineTrigger equipstart :equipstart "Equipment"
		setTextLineTrigger figstart :figstart "Fighters        N/A"
		setTextLineTrigger citadelstart :citadelstart "Planet has a level"
		setTextLineTrigger cannon :cannonstart ", AtmosLvl="
		setTextTrigger planetInfoDone :planetInfoDone "Planet command (?=help)"
		pause

        :fuelstart
		getWord CURRENTLINE $PLANET_FUEL 6
		getWord CURRENTLINE $PLANET_FUEL_MAX 8
		stripText $PLANET_FUEL ","
		stripText $PLANET_FUEL_MAX ","
		pause

        :orgstart
		getWord CURRENTLINE $PLANET_ORGANICS 5
		getWord CURRENTLINE $PLANET_ORGANICS_MAX 7
		stripText $PLANET_ORGANICS ","
		stripText $PLANET_ORGANICS_MAX ","
		pause

        :equipstart
		getWord CURRENTLINE $PLANET_EQUIPMENT 5
		getWord CURRENTLINE $PLANET_EQUIPMENT_MAX 7
		stripText $PLANET_EQUIPMENT ","
		stripText $PLANET_EQUIPMENT_MAX ","
		pause

        :figstart
		getWord CURRENTLINE $PLANET_FIGHTERS 5
		getWord CURRENTLINE $PLANET_FIGHTERS_MAX 7
		stripText $PLANET_FIGHTERS ","
		stripText $PLANET_FIGHTERS_MAX ","
		pause

        :citadelstart
		getWord CURRENTLINE $CITADEL 5
		getWord CURRENTLINE $CITADEL_CREDITS 9
		striptext $CITADEL_CREDITS ","
		pause

	:cannonstart
		getWord CURRENTLINE $ATMOSPHERE_CANNON 5
		getWord CURRENTLINE $SECTOR_CANNON 6
		stripText $SECTOR_CANNON "SectLvl="
		striptext $SECTOR_CANNON "%"
		stripText $ATMOSPHERE_CANNON "AtmosLvl="
		striptext $ATMOSPHERE_CANNON "%"
		striptext $ATMOSPHERE_CANNON ","
		pause
	:planetInfoDone
		killtrigger citadelstart
		killtrigger cannon
	
return
# ==============================  END PLANET INFO SUBROUTINE  =================

:getShipStats
	
	send "c;q"
	setTextLineTrigger	getshipoffense		:shipoffenseodds	"Offensive Odds: "
	setTextLineTrigger	getshipfighters 	:shipmaxfigsperattack	" TransWarp Drive:   "
	setTextLineTrigger	getshipmines 		:shipmaxmines		" Mine Max:  "
	pause
	
	:shipoffenseodds
		getWordPos CURRENTANSILINE $pos "[0;31m:[1;36m1"
		if ($pos > 0)
			getText CURRENTANSILINE $SHIP_OFFENSIVE_ODDS "Offensive Odds[1;33m:[36m " "[0;31m:[1;36m1"
			stripText $SHIP_OFFENSIVE_ODDS "."
			stripText $SHIP_OFFENSIVE_ODDS " "
			gettext CURRENTANSILINE $SHIP_FIGHTERS_MAX "Max Fighters[1;33m:[36m" "[0;32m Offensive Odds"
			stripText $SHIP_FIGHTERS_MAX ","
			stripText $SHIP_FIGHTERS_MAX " "
		end
		pause
	:shipmaxmines
		getText CURRENTLINE $SHIP_MINES_MAX "Mine Max:" "Beacon Max:"
		stripText $SHIP_MINES_MAX " "
		pause

	:shipmaxfigsperattack
		getWordPos CURRENTANSILINE $pos "[0m[32m Max Figs Per Attack[1;33m:[36m"
		if ($pos > 0)
			getText CURRENTANSILINE $SHIP_MAX_ATTACK "[0m[32m Max Figs Per Attack[1;33m:[36m" "[0;32mTransWarp"
			striptext $SHIP_MAX_ATTACK " "
			setVar $SHIP_MAX_ATTACK 1000
		end
return

:FindShip
	setVar $Found1 0
	setVar $Found2 0
	send "czq"
	waitOn "---------------------------------"
	:nextShip
	setTextLineTrigger		Ships	:Ships
	pause
	:Ships
		getWord CURRENTLINE $shipNum 1
		isNumber $tst $shipNum
		if ($tst <> 0)
			if ($shipnum = $psst_Ship2)
				setVar $Found2 CURRENTLINE
				replaceText $Found2 "+" " "
				getWord $Found2 $Found2 2
			elseif ($shipNum = $psst_Ship1)
				setVar $Found1 CURRENTLINE
				replaceText $Found1 "+" " "
				getWord $Found1 $Found1 2
			end
			goto :NextShip
		end
		if ($inShip1)
			setVar $destination $Found2
		else
			setVar $destination $Found1
		end
		gosub :quikstats

		getDistance $dist1 $CURRENT_SECTOR $destination
		#if (($dist1 = "-1") or ($dist1 > $transportRange))
		if ($dist1 = "-1")
			send "cf" & $CURRENT_SECTOR & "*" & $destination & "*q"
			waitOn "What is the starting sector"
			waitOn "Command [TL="
			getDistance $dist1 $CURRENT_SECTOR $destination
		end
		getDistance $dist2 $destination $CURRENT_SECTOR
		#if (($dist2 = "-1") or ($dist2 > $transportRange))
		if ($dist2 = "-1")
			send "cf" & $destination & "*" & $CURRENT_SECTOR & "*q"
			waitOn "What is the starting sector"
			waitOn "Command [TL="
			getDistance $dist2 $destination $CURRENT_SECTOR
		end
		return

:Starting
	loadVar $steal_factor
	loadVar $unlimitedGame
	loadVar $bot_turn_limit
	loadVar $user_command_line
	loadVar $parm1
	loadVar $parm2
	loadVar $parm3
	loadVar $parm4
	loadVar $parm5
	loadVar $parm6
	loadVar $parm7
	loadVar $parm8
	loadVar $bot_name
	loadVar $stardock
	loadVar $rylos
	loadVar $alpha_centauri
	loadVar $subspace
	setVar $CASH_TO_HOLD_ONTO 1000000


	setVar $BUST_FILE "MOM_"&GAMENAME&"_Busts.txt"
	setVar $FIG_FILE "MOM_"&GAMENAME&"_Fighter_Grid.txt"
	setVar $FIG_COUNT_FILE "MOM_"&GAMENAME&"_Fighter_Grid_Count.cnt"

	gosub :quikstats
	
	setVar $DROPLIMPS (" " & $user_command_line & " ")
	lowercase $DROPLIMPS
	getWordPos $DROPLIMPS $pos " limp "
	if ($pos = 0)
		setVar $DROPLIMPS FALSE
	else
		setVar $DROPLIMPS TRUE
	end

	setVar $DROPARMIDS (" " & $user_command_line & " ")
	lowercase $DROPARMIDS
	getWordPos $DROPARMIDS $pos " armid "
	if ($pos = 0)
		setVar $DROPARMIDS FALSE
	else
		setVar $DROPARMIDS TRUE
	end

	setVar $QUIET (" " & $user_command_line & " ")
	lowercase $QUIET
	getWordPos $QUIET $pos " quiet "
	if ($pos = 0)
		setVar $QUIET FALSE
	else
		setVar $QUIET TRUE
	end

	setVar $x100 (" " & $user_command_line & " ")
	lowercase $x100
	getWordPos $x100 $pos " x100 "
	if ($pos = 0)
		setVar $x100 FALSE
	else
		setVar $x100 TRUE
	end

	setVar $startingLocation $CURRENT_PROMPT
	isNumber $isParamOneNumber   $parm1
	isNumber $isParamTwoNumber   $parm2
	isNumber $isParamThreeNumber $parm3

	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
		send "'{" $bot_name "} - World SST must be run from command or citadel prompt*"
		halt
	end
	gosub :getShipStats

	lowerCase $parm1
	if ($parm1 = "clear_busts")
		delete $BUST_FILE
		setVar $i 1
		while ($i <= SECTORS)
			setSectorParameter $i "BUSTED" FALSE
			add $i 1
		end
		send "'{" $bot_name "} - Bust file for this bot has been cleared.*"
		halt
	elseif ($isParamOneNumber = TRUE)
		setVar $psst_Ship2 $parm1
		if ($isParamTwoNumber = TRUE)
			setVar $dropCashLimit $parm2
		end
	else
		send "'{" $bot_name "} - Please use wsst [ship2#] format.*"
		halt
	end
	if ($EXPERIENCE < 500)
		send "'{" $bot_name "} - You do not have enough experience to run WorldSST.*"
		halt
	end
	if ($CREDITS < 500000)
		send "'{" $bot_name "} - You must have at least 500,000 credits on hand to run WorldSST.*"
		halt
	end
	cutText $ALIGNMENT $neg_ck 1 1

	stripText $ALIGNMENT "-"
	if ($ALIGNMENT < 100) and ($neg_ck = "-")
		send "'{" $bot_name "} - Need -100 Alignment Minimum to run World SST.*"
		halt
	elseif ($neg_ck <> "-")
		send "'{" $bot_name "} - Need -100 Alignment Minimum to run World SST.*"
		halt
	end
	getWordPos " "&$user_command_line&" " $pos " f "
	if ($pos > 0)
		setVar $refurbFighters TRUE
	else
		setVar $refurbFighters FALSE
	end

	getWordPos " "&$user_command_line&" " $pos " s "
	if ($pos > 0)
		setVar $refurbShields TRUE
	else
		setVar $refurbShields FALSE
	end
	setVar $safeFighterLevel 5000
	getWordPos " "&$user_command_line&" " $pos " safe "
	if ($pos > 0)
		setVar $ultrasafe TRUE
		setVar $safeFighterLevel 100
	else
		setVar $ultrasafe FALSE
	end

	getWordPos " "&$user_command_line&" " $pos " passive "
	if ($pos > 0)
		setVar $passive TRUE
		setVar $safeFighterLevel 0
	else
		setVar $passive FALSE
	end

	setVar $FURBING $stardock

	setVar $Temp ("  " & $user_command_line & "  ")
	getwordpos $Temp $pos " alpha "
	if (($pos <> 0) AND ($alpha_centauri <> 0))
		setVar $FURBING $alpha_centauri
	end
	getWordpos $Temp $pos " rylos "
	if (($pos <> 0) AND ($rylos <> 0))
		setVar $FURBING $rylos
	end
	getWordPos $Temp $pos " dock "
	if (($pos <> 0) AND ($stardock <> 0))
		setVar $FURBING $stardock
	end

	getWordPos $Temp $pos " terra "
	if (($pos <> 0) AND ($stardock <> 0))
		setVar $FURBING 1
	end

	setVar $portaverage 1
	send "jy*"
	setVar $cashDeposited 0
	goSub :quikstats
	setvar $startcash $CREDITS
	setArray $bustedPorts SECTORS
	setVar $psst_Ship1 $SHIP_NUMBER
	setVar $startingLocation $CURRENT_PROMPT
	if ($startingLocation = "Citadel")
	        send "q"
                gosub :getPlanetInfo
                send "q* "
		setVar $cashDropPlanet $PLANET
                setVar $cashDropSector $CURRENT_SECTOR
 	else
	        setVar $cashDropPlanet 0
                setVar $cashDropSector 0

        end
	if ($dropCashLimit <= 10000000)
		setVar $dropCashLimit 10000000
	end
	if (($cashDropSector = 0) OR ($cashDropPlanet = 0))
		setVar $dropCashAtBase FALSE
	else
		setVar $dropCashAtBase TRUE
	end

	if (($psst_Ship2 <= 0) OR ($steal_factor <= 0))
		send "'This module should be run from the MOM Bot.*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	setVar $startingSector $current_Sector
	setVar $inShip1 TRUE
	setvar $p1chk 3
	setvar $p2chk 3
	if ($RYLOS > 10)
		setVar $refurbPort $RYLOS
	elseif ($ALPHA_CENTAURI > 10)
		setVar $refurbPort $ALPHA_CENTAURI
	else
		setVar $refurbPort 1
	end

	gosub :checkSSTShips

	if ($foundShip2 <> TRUE)
		send "'{" $bot_name "} - Ship #2 entered for Planet SST was not valid for this sector.*"
		setVar $mode "General"
		saveVar $mode
		halt
	end
	send "'{" $bot_name "} World SST Powering Up!*"
	send "c;qjy "
	waitOn "Transport Range:"
	getWord CURRENTLINE $transportRange1 6
	getWord CURRENTLINE $maxHolds1 3
	gosub :transport
	send "c;qjy "
	waitOn "Transport Range:"
	getWord CURRENTLINE $transportRange2 6
	getWord CURRENTLINE $maxHolds2 3
	gosub :transport
	if ($transportRange1 <= $transportRange2)
		setVar $transportRange $transportRange1
	else
		setVar $transportRange $transportRange2
	end
	send "'{" $bot_name "} Minimum transport range of these two ships is "&$transportRange&".*"

	setVar $ship1Sector $current_Sector
	setVar $ship2Sector $current_Sector
	setVar $ship1NeedsPort TRUE
	setVar $ship2NeedsPort TRUE
	setVar $i 1
	setVar $yes TRUE
	setVar $busted FALSE
	setArray $equipAtPort SECTORS
	setArray $fuelAtPort SECTORS
goto :GoGo