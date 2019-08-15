:getSectorData
	setVar $ENDLINE     "_ENDLINE_"
	setVar $STARTLINE   "_STARTLINE_"
	
	 killalltriggers
	if ($PLAYER~startingLocation = "Citadel")
		send "s* "
	else
		if ($player~fedspace = true)
			send "*"
		else
			send "** "
		end
	end
	setVar $sectorData ""
	:sectorsline_cit_kill
		setVar $line CURRENTANSILINE
		setVar $line $STARTLINE&$line&$ENDLINE
		setVar $sectorData $sectorData&$line
		getWordPos $line $pos "Warps to Sector(s) "
		if ($pos > 0)
			goto :gotSectorData
		else
			setTextLineTrigger getLine :sectorsline_cit_kill
		end
		pause
	:gotSectorData
		getWordPos $sectorData $beaconPos "[0m[35mBeacon  [1;33m:"
		if ($beaconPos > 0)
			setVar $containsBeacon TRUE
		else
			setVar $containsBeacon FALSE
		end
		setvar $player~current_sector currentsector
		goSub :getTraders
		goSub :getEmptyShips
		goSub :getFakeTraders
return


include "source\bot_includes\sector\getemptyships\sector"
include "source\bot_includes\sector\getfaketraders\sector"
include "source\bot_includes\sector\gettraders\sector"
