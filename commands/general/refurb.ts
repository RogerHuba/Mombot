    gosub :BOT~loadVars

    setvar $bot~command "refurb"
    setVar $BOT~help[1]  $BOT~tab&"refurb - Auto buys fighters and shields "
    setVar $BOT~help[2]  $BOT~tab&"    {seek} - attempts to find class 9 or 0 port"
    gosub :BOT~help_file

:scrub
	setVar $message ""
	gosub  :player~currentPrompt
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Command") AND ($startingLocation <> "Citadel"))
		gosub  :player~currentPrompt
		setVar $BOT~validPrompts "Citadel Command"
		gosub :BOT~checkStartingPrompt
	end
	if ((CURRENTSECTOR = 1) OR (PORT.CLASS[CURRENTSECTOR] = 0) or (CURRENTSECTOR = $map~rylos) or (CURRENTSECTOR = $map~alpha_centauri))
		if ($startingLocation = "Citadel")
			send "q "
			gosub :PLANET~getPlanetInfo
			send "q "
		end
		send "p ty"
	elseif (CURRENTSECTOR = $MAP~STARDOCK)
		send "p ss ys *p"
	else
		if ($BOT~parm1 = "seek")
			if ($startingLocation = "Citadel")
				send "q "
				gosub :PLANET~getPlanetInfo
				send "c "
			end
			gosub :PLAYER~quikstats
			setVar $back $PLAYER~CURRENT_SECTOR
			setVar $PLAYER~warpto $MAP~stardock
			gosub :player~twarp
			gosub  :player~currentPrompt
			if ($PLAYER~twarpSuccess = TRUE)
				send "p ss ys *p"
			else
				setVar $SWITCHBOARD~message $PLAYER~msg&"*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		else
			setVar $SWITCHBOARD~message "No known class 0 or 9 port here to refurb at. Try the seek option.*" 
			gosub :SWITCHBOARD~switchboard
			halt
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
			getWord CURRENTLINE $PLAYER~SHIELDSToBuy 9
			send "b "&$figsToBuy&"* c "&$PLAYER~SHIELDSToBuy&"* q q q * "
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
				halt
			end
		 end		
		if ($startingLocation = "Citadel")
			gosub :PLANET~landingSub
		end
		gosub :PLAYER~quikstats
		if ($message <> "")
			setVar $SWITCHBOARD~message $message
			gosub :SWITCHBOARD~switchboard
		end
halt





# includes:
include "source\module_includes\bot"
include "source\bot_includes\player\currentprompt\player"
include "source\bot_includes\planet\getplanetinfo\planet"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\twarp\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet\landingsub\planet"
