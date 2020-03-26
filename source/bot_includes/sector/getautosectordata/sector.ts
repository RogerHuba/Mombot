##################################################################################
# requires $player~startingLocation to be set before getAutoSectorData is called #
##################################################################################

:getAutoSectorData
	setVar $ENDLINE     "_ENDLINE_"
	setVar $STARTLINE   "_STARTLINE_"
	
	setarray $adjacent 7
	setarray $adjacent_sector 7
	setvar $adjcount 0

	
	killalltriggers
	:startover
	setVar $sectorData ""
	:auto_sectorsline_cit_kill
		setVar $line CURRENTANSILINE
		setVar $line $STARTLINE&$line&$ENDLINE
		setVar $sectorData $sectorData&$line
		getWordPos $line $pos "Sector  [33m: "
		if ($pos > 0)
			getText $line $tempSector "Sector  [33m: [36m" " [0;32min" 
			setvar $player~current_sector $tempSector
			add $adjcount 1
			setvar $adjacent[$adjcount] $sectorData
			setvar $adjacent_sector[$adjcount] $tempSector
			setVar $sectorData $line
		end
		getWordPos $line $pos "Warps to Sector(s) "
		if ($pos > 0)
			goto :gotAutoSectorData
		else
			setTextLineTrigger getLine :auto_sectorsline_cit_kill
		end
		pause
	:gotAutoSectorData
		settexttrigger nomines :nomines "Citadel command (?=help)" 
		settexttrigger nomines2 :nomines "Command ["
		settexttrigger mines :mines "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
		pause

		:mines
		send "* "
		:nomines
		killtrigger nomines
		killtrigger nomines2
		killtrigger mines

		setvar $s 7
		while ($s > 0)
			setvar $holotargetfound false
			setvar $sectortargetfound false
			setvar $sectorData $adjacent[$s]
			setvar $targetSector $adjacent_sector[$s]
			if (($sectorData <> "") and ($sectorData <> "0"))
				getWordPos $sectorData $beaconPos "[0m[35mBeacon  [1;33m:"
				if ($beaconPos > 0)
					setVar $containsBeacon TRUE
				else
					setVar $containsBeacon FALSE
				end
				goSub :getTraders
				goSub :getEmptyShips
				goSub :getFakeTraders
				if ($realTraderCount > $corpieCount)
					setVar $c 1
					setvar $player~isFound false
					while (($c <= $realTraderCount) AND ($player~isFound = FALSE))
						if (($player~traders[$c][1]) = ($player~CORP))
						elseif (($player~fedspace = true) AND ($player~traders[$c][2] = TRUE))
						elseif (($PLAYER~targetingShip <> false) and ($player~traders[$c][3] <> true))
						else
							setvar $enemy_fighters $player~traders[$c][4]
							if ($player~fighters > $enemy_fighters)
								setVar $player~isFound TRUE
							end
						end
						add $c 1
					end

					if ($s = 7)
						setvar $sectortargetfound true
					else
						setvar $holotargetfound true
					end
					if ($player~isFound)
						goto :done_scanning
					end
				end
			end
			subtract $s 1
		end
		:done_scanning
return


include "source\bot_includes\sector\getemptyships\sector"
include "source\bot_includes\sector\getfaketraders\sector"
include "source\bot_includes\sector\gettraders\sector"
