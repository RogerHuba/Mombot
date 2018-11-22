loadVar $bot_name
loadVar $user_command_line
loadVar $parm1
loadVar $parm2
loadVar $parm3
loadVar $parm4
loadVar $parm5
loadVar $parm6
loadVar $parm7
loadVar $parm8


# ============================== START NAV HAZ KILLER (navhaz) Sub ==============================
:hazKill
	setVar $pName "M()M - NAV HAZ KiLLA!"
	gosub :quikstats~quikstats
	setVar $startingLocation $quikstats~CURRENT_PROMPT
	if (($startingLocation <> "Command") AND ($startingLocation <> "Citadel"))
	        send "'{" & $bot_name & "} - Please Start from Command or Citadel Prompts!*"
		halt
	end
	if ($quikstats~GENESIS <= 0)
		send "'{" & $bot_name & "} - No Genesis Torps On Hand.*"
		halt
	end
	if ($startingLocation = "Citadel")
		send "Q"
		gosub :planetinfo~getPlanetInfo
		send "  Q  "
		waitfor "Command [TL="
	end
	send "*"
	waitfor "(?="
	setVar $haz SECTOR.NAVHAZ[$quikstats~CURRENT_SECTOR]
	if ($haz <= 10)
		setVar $2Bpopped 1
	elseif ($haz <= 20)
		setVar $2Bpopped 2
	elseif ($haz <= 30)
		setVar $2Bpopped 3
	elseif ($haz <= 40)
		setVar $2Bpopped 4
	elseif ($haz <= 50)
		setVar $2Bpopped 5
	elseif ($haz <= 60)
		setVar $2Bpopped 6
	elseif ($haz <= 70)
		setVar $2Bpopped 7
	elseif ($haz <= 80)
		setVar $2Bpopped 8
	elseif ($haz <= 90)
		setVar $2Bpopped 9
	else
		setVar $2Bpopped 10
	end
	if ($2Bpopped > $quikstats~GENESIS)
		send "'{" & $bot_name & "} - Short " & ($2Bpopped - $quikstats~GENESIS) & " Genesis Torps.*"
		setVar $2Bpopped $quikstats~GENESIS
		waitfor "Message sent on sub-space"
	end
	while ($2Bpopped > 0)
		send "U Y "
		setTextLineTrigger planetname :planetname "What do you want to name this planet?"
		setTextTrigger override :override "Do you wish to abort?"
		pause
   		:override
			send "N "
			pause
			:planetname
			killtrigger planetname
			killtrigger override
			send $pName & "* Z  C * "
			subtract $2Bpopped 1
	end
	if ($startingLocation = "Citadel")
		send " L " & $planetinfo~planet & "* C "
	end
	send "'{" & $bot_name & "} - Nav Haz Killa Complete!*"

halt
# ============================== END NAV HAZ KILLER (navhaz) Sub ==============================


include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\MOMBot\botIncludes\quikstats"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\MOMBot\botIncludes\planetinfo"
