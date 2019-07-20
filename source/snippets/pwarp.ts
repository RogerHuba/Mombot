:pwarp
	send "p" $warpTo "*y"
	setTextLineTrigger pwarp_lock 		:pwarp_lock 	"Locating beam pinpointed"
	setTextLineTrigger no_pwarp_lock 	:no_pwarp_lock 	"Your own fighters must be"
	setTextLineTrigger already 		:already 	"You are already in that sector!"
	setTextLineTrigger no_ore 		:no_ore 	"You do not have enough Fuel Ore"
	pause

	:no_pwarp_lock
		killtrigger pwarp_lock
		killtrigger already
		killtrigger no_ore
		killtrigger no_pwarp_lock
		#Sector param should go here
		#setVar $FIGHTER_GRID[$warpTo] 0
		send "'{" $bot_name "} - No fighter down at that location!*"
		return

	:no_ore
		killtrigger pwarp_lock
		killtrigger no_ore
		killtrigger already
		killtrigger no_pwarp_lock
		send "'{" $bot_name "} - Not enough fuel for that pwarp.*"
		return


	:pwarp_lock
		killtrigger no_pwarp_lock
		killtrigger pwarp_lock
		killtrigger already
		killtrigger no_ore
		waitFor "Planet is now in sector"
		send "'{" $bot_name "} - Planet moved to sector "&$warpTo&".*"
		return

	:already
		killtrigger no_pwarp_lock
		killtrigger pwarp_lock
		killtrigger already
		killtrigger no_ore
		send "'{" $bot_name "} - Planet already in that sector!.*"

return