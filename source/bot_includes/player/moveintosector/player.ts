:moveIntoSector
	setVar $result ""
	setVar $dropFigs TRUE
	setVar $result $result&"m "&$moveIntoSector&"*"
	if (($moveIntoSector > 10) AND ($moveIntoSector <> $map~stardock))
		if ($fighters > $ship~ship_max_attack)
			setVar $result $result&"za"&$ship~ship_max_attack&"* * "
		else
			setVar $result $result&"za"&$fighters&"* * "
		end
	end
	if ($surroundFigs <= 0)
		setvar $surroundFigs 1
	end
	if (($moveIntoSector > 10) AND ($moveIntoSector <> $map~stardock))
		if ($surroundFigs > 0)
			setVar $result $result&"f  z  "&$surroundFigs&"* z  c  d  *  "
		end
		if ($surroundlimp > 0)
			setVar $result $result&"  H  2  Z  "&$surroundLimp&"*  Z C  *  "
		end
		if ($surroundmine > 0)
			setVar $Result $result&"  H  1  Z  "&$surroundMine&"*  Z C  *  "
		end
	end
	loadvar $bot~autokill
	if ($bot~autokill)
		if ($SHIP~SHIP_MAX_ATTACK <= 0)
			gosub :SHIP~getShipStats
		end
		setvar $player~isFound false
		setvar $sector~moving true
		send $result
		goSub :SECTOR~getSectorData
		goSub :combat~fastAttack
		if ((($player~current_sector = 1) or ($player~current_sector = $map~stardock)) and ($furb = true))
			if ($player~isFound)
				load "scripts\mombot\commands\general\refurb.cts"
				setEventTrigger		1		:refurbended	"SCRIPT STOPPED" "scripts\mombot\commands\general\refurb.cts"
				pause
				:refurbended
				goSub :SECTOR~getSectorData
				goSub :combat~fastAttack
			end
		end
	else
		send $result
	end
return

include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastattack\combat"
include "source\bot_includes\ship\getshipstats\ship"

