:scanitcitkill
	gosub :checkForVictimsFromCitadel
	echo ansi_12 "*NO Targets*"
	return

:checkForVictimsFromCitadel
	gosub :player~quikstats
	setVar $startingLocation $player~CURRENT_PROMPT
	gosub :getSectorData
	if ($corpieCount < $realTraderCount)
		goSub :fastCitadelAttack
		goto :checkForVictimsFromCitadel
	end
return
