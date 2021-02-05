gosub :BOT~loadVars
	setvar $bot~command "refurb"

	setVar $BOT~help[1]  $BOT~tab&"refurb {seek} "
	setVar $BOT~help[2]  $BOT~tab&"     "
	setVar $BOT~help[3]  $BOT~tab&"   Auto buys fighters and shields"
	setVar $BOT~help[4]  $BOT~tab&"     "
	setVar $BOT~help[5]  $BOT~tab&"   {seek} - twarp to class 9 or 0 port and back"
	gosub :bot~helpfile

	setVar $message ""
	setVar $BOT~validPrompts "Citadel Command"
	gosub :BOT~checkStartingPrompt
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ((CURRENTSECTOR = 1) OR (PORT.CLASS[CURRENTSECTOR] = 0) or (CURRENTSECTOR = $map~rylos) or (CURRENTSECTOR = $map~alpha_centauri))
		if ($startingLocation = "Citadel")
			send "q t*t1* "
			gosub :PLANET~getPlanetInfo
			send "q "
		end
		send "p ty"
	elseif (CURRENTSECTOR = $MAP~STARDOCK)
		send "p ss ys *p"
	else
		if ($BOT~parm1 = "seek")
			if ($startingLocation = "Citadel")
				send "q t*t1* "
				gosub :PLANET~getPlanetInfo
				send "c "
			end
			gosub :PLAYER~quikstats
			setVar $back $PLAYER~CURRENT_SECTOR
			setVar $PLAYER~warpto 1
			gosub :player~twarp
			gosub  :player~currentPrompt
			if ($PLAYER~twarpSuccess = TRUE)
				send "p ty"
			else
				send " C R " & $map~stardock & "*"
				setTextLineTrigger 1 :itsalive "Items     Status  Trading % of max OnBoard"
				setTextLineTrigger 2 :nosoupforme "I have no information about a port in that sector"
				pause
				:nosoupforme
					killtrigger 1
					setvar $switchboard~message "StarDock appears to have been Blown Up!*"
					gosub :switchboard~switchboard
					goto :wait_for_command
				:itsalive
					killtrigger 2
				send "q "
				setVar $PLAYER~warpto $map~stardock
				gosub :player~twarp
				gosub  :player~currentPrompt
				if ($PLAYER~twarpSuccess = TRUE)
					send "P  S G YG Q s p"
				else
					setVar $SWITCHBOARD~message $PLAYER~msg&"*"
					gosub :SWITCHBOARD~switchboard
					goto :wait_for_command
				end
			end
		else
			setVar $SWITCHBOARD~message "No known class 0 or 9 port here to refurb at. Try the seek option.*" 
			gosub :SWITCHBOARD~switchboard
			goto :wait_for_command
		end
	end
	setVar $message "No limpet on my ship.*"
	setTextLineTrigger limpet   :markLimpet	 "After an intensive scanning search, they find and remove the Limpet"
	setTextLineTrigger limpetno	 :markLimpetNo   "The port official frowns at you (you haven't the funds!) and storms"
	setTextLineTrigger fighter  :buyfighters	"B  Fighters        :"
	pause
	:markLimpet
		setVar $message "Limpet scrubbed off of hull.*"
		pause
	:markLimpetNo
		setVar $message "Limpet exists, but not enough cash to get scrubbed.*"
		pause   
	:buyfighters
		killalltriggers
		if ($scrubonly <> TRUE)
			getWord CURRENTLINE $figsToBuy 8
			waitOn " credits per point "
			getWord CURRENTLINE $shieldsToBuy 9
			send "b "&$figsToBuy&"* c "&$shieldsToBuy&"* q q q * "
		else
			send "b 0* c 0* q q q * "
		end
		if ($BOT~parm1 = "seek")
			gosub :PLAYER~quikstats
			setVar $PLAYER~warpto $back
			gosub :player~twarp
			if ($PLAYER~twarpSuccess <> TRUE)
				setVar $SWITCHBOARD~message $PLAYER~msg&"*"
				gosub :SWITCHBOARD~switchboard
				goto :wait_for_command
			end
		 end		
		if ($startingLocation = "Citadel")
			gosub :PLANET~landingSub
		end
		gosub :PLAYER~quikstats
		if ($figstobuy > 0)
			format $figstobuy $figstobuy NUMBER
			setvar $message $message&"   - "&$figstobuy&" fighters purchased.*"
		end
		if ($shieldstobuy > 0)
			format $shieldstobuy $shieldstobuy NUMBER
			setvar $message $message&"   - "&$shieldstobuy&" shields purchased.*"
		end
		if ($message <> "")
			setVar $SWITCHBOARD~message $message
			gosub :SWITCHBOARD~switchboard
		end

:wait_for_command
halt


# includes:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\checkstartingprompt\bot"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\planet\landingsub\planet"
