    gosub :BOT~loadVars

    setVar $BOT~help[1]  $BOT~tab&"scrub - Will attempt to scrub limpet off ship "
    gosub :BOT~help_file

:scrub
	setVar $scrubonly TRUE
	setVar $message ""
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Command") AND ($startingLocation <> "Citadel"))
		gosub :PLAYER~current_prompt
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
			gosub :tactics~twarp
			gosub :PLAYER~current_prompt
			if ($PLAYER~twarpSuccess = TRUE)
				send "p ss ys *p"
			else
				setVar $SWITCHBOARD~message $PLAYER~msg&"*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		else
			setVar $SWITCHBOARD~message "No known class 0 or 9 port here to scrub at. Try the seek option.*" 
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
			gosub :tactics~twarp
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
include "source\bot_includes\player"
include "source\bot_includes\tactics"
include "source\bot_includes\map"
include "source\bot_includes\ship"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\module_includes\prompt"
