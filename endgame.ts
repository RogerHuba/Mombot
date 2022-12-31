#####################################
# Main endgame configuration setup #
#####################################
reqRecording
logging off
gosub :BOT~loadVars
loadvar $MAP~STARDOCK
loadvar $map~home_sector
loadvar $SHIP~cap_file
loadvar $bot~subspace
loadvar $bot~username
lowercase $bot~username

#####################################
# Help Menu
#####################################

setVar $BOT~help[1]  $BOT~tab&"End Game {ver} "
setVar $BOT~help[2]  $BOT~tab&"          "
setVar $BOT~help[3]  $BOT~tab&"           {ver} - Displays the name and current version of the script."
setVar $BOT~help[4] $BOT~tab&"           "
setVar $BOT~help[5] $BOT~tab&"        Examples: "
setVar $BOT~help[6] $BOT~tab&"             >endgame ver "
gosub :bot~helpfile

setvar $script_ver "End Game v .01"
setVar $BOT~script_title $script_ver
gosub :BOT~banner

gosub :PLAYER~quikstats

:get_options
  getWordPos " "&$bot~user_command_line&" " $pos " ver "
  if ($pos > 0)
    setVar $SWITCHBOARD~message $script_ver
    gosub :SWITCHBOARD~switchboard
    halt
  end

:check_for_stardock
	getSectorParameter SECTORS "FIGSEC" $isFigged
	if (($MAP~stardock = 0) OR ($MAP~stardock = ""))
		setVar $SWITCHBOARD~message "Stardock is not defined.  Please define stardock variable in the bot if known.*"
		gosub :SWITCHBOARD~switchboard
	end

:check_location
	setvar $startinglocation $player~current_prompt

	if (($PLAYER~CURRENT_PROMPT <> "Citadel") and ($player~current_prompt <> "Command") and ($player~current_prompt <> "Planet"))
		setVar $SWITCHBOARD~message "Unstacker must be run from the Planet, Citadel or Command Prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end


# Check game variables
# - age of the game
# - Check players in High Score List
# - Stardock visible
# - Aliens
# - Number of fighters, mines, planets in tthe game
# - Check if planet options are known (SubZero, BattleStar etc..)
# - Base cost of starting ship
# - Number of starting fighters / shields
# - Starting Credits
# - Buy a better ship?
# - If single player determin if playing blue or red
# - If part of a team look do your part red / blue

# Check if alone in the universe
# - Mow to Dock

# Do Quick ZTM Moments
# Look for a small bubble 3-4 deep preferably a 1-1-2 split for a 1-2 split

# Create / join Corp
# Depending on starting credits / sale of ship
# - WPPT
#   - Buy a scanner if enough credits
#   - Buy Additional Holds
#   - Buy minimal fighters / shields (determine based on current pricing)
#   - If Scanner, set to always dual scan
#   - If speed is necessary (start of a major game on not alone)
#   - Set avoidance based on Online Check

# Track online Players and What they are doing
# - Busting Planets
# - Running SSM / SST
# - Colonizing
