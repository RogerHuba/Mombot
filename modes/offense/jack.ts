	logging off
		gosub :BOT~loadVars
									

	setVar $BOT~help[1] $BOT~tab&"jack [planet number]  "
	setVar $BOT~help[2] $BOT~tab&"Sits in a port waiting for a ship to enter.  "
	setVar $BOT~help[3] $BOT~tab&"It then pops out and attacks."
	setVar $BOT~help[4] $BOT~tab&"   "
	setVar $BOT~help[5] $BOT~tab&"Works best with saveme on."
	setVar $BOT~help[6] $BOT~tab&"         "
	gosub :bot~helpfile

	setVar $BOT~script_title "Jack In The Box"
	gosub :BOT~banner	

	gosub :combat~init 

	if ($bot~parm1 <= 0)
		setVar $SWITCHBOARD~message "Need to define saveme planet number.*"
		gosub :SWITCHBOARD~switchboard
		halt
	else
		setVar $saveme_planet $bot~parm1
	end

	gosub :PLAYER~quikstats
	gosub :SHIP~getShipStats

	getLength $PLAYER~CURRENT_SECTOR $length 
	setVar $savetarget $PLAYER~CURRENT_SECTOR
	while ($length < 5)
		setVar $saveTarget "0" & $saveTarget
		add $length 1 
	end

	send "pt"
	waitOn "Items     Status  Trading % of max OnBoard"

	:startTargeting
		killAllTriggers
		setTextTrigger limp :GO "Limpet mine in "&$PLAYER~CURRENT_SECTOR&" "
		setTextTrigger armid :GO "Your mines in "&$PLAYER~CURRENT_SECTOR&" "
		setTextTrigger fig :GO "Deployed Fighters Report Sector "&$PLAYER~CURRENT_SECTOR&":"
		send "'Jack In The Box wound up and waiting in sector "&$PLAYER~CURRENT_SECTOR&"!*"
		pause
		
	:GO
		killtrigger limp
		killtrigger armid
		killtrigger fig

		send "0* 0* 0*  '" & $savetarget & "=saveme*q y * t* * *" PASSWORD "*    *    *       za9999*   z*   f z 1000* z c * d  *  "
		setVar $i 0
		while ($i < 20)
			add $i 1
			send "l j " & #8 & #8 &$saveme_planet& "*  *  "
		end
		send "m * * * c "
		gosub :checkForVictimsFromCitadel

		setVar $SWITCHBOARD~message "Jack in the box completed!*"
		gosub :SWITCHBOARD~switchboard
		HALT


:checkForVictimsFromCitadel
	gosub :SECTOR~getSectorData
	if ($SECTOR~corpieCount < $SECTOR~RealTraderCount)
		goSub :combat~fastCitadelAttack
		goto :checkForVictimsFromCitadel
	end
return


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\combat\init\combat"
include "source\bot_includes\switchboard"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\ship\getshipstats\ship"
include "source\bot_includes\sector\getsectordata\sector"
include "source\bot_includes\combat\fastcitadelattack\combat"
