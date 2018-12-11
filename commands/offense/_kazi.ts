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
loadVar $command
loadVar $stardock
loadVar $rylos
loadVar $alpha_centauri

	fileExists $doesHelpFileExist "scripts\MOMBot\Help\"&$command&".txt"
	if ($doesHelpFileExist <> TRUE)
		write "scripts\MOMBot\Help\"&$command&".txt" "- "&$command&" [planet] {shields} {defender} {zdy}          " 
		write "scripts\MOMBot\Help\"&$command&".txt" "    Automates planet invasion.                              " 
		write "scripts\MOMBot\Help\"&$command&".txt" "                                                            " 
		write "scripts\MOMBot\Help\"&$command&".txt" "    [planet]                                                "
		write "scripts\MOMBot\Help\"&$command&".txt" "       - Planet number to attack                            " 
		write "scripts\MOMBot\Help\"&$command&".txt" "    [shields]                                               " 
		write "scripts\MOMBot\Help\"&$command&".txt" "       - Will kill planetary shields. Stops when below 50.  " 
		write "scripts\MOMBot\Help\"&$command&".txt" "    [defender]                                              " 
		write "scripts\MOMBot\Help\"&$command&".txt" "       - Will land defensively to take out military reaction." 
		write "scripts\MOMBot\Help\"&$command&".txt" "    [zdy]                                                   " 
		write "scripts\MOMBot\Help\"&$command&".txt" "       - Option to blow planet as soon as you land.         " 
		send "'{" $bot_name "} - Writing help file for this command in Help directory.*"
	end
	
# ======================     START KAMIKAZE (KAZI) SUBROUTINE    ==========================
:kamikaze
	gosub :quikstats~quikstats
	setVar $startingLocation $quikstats~CURRENT_PROMPT
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
		send "'{" $bot_name "} - Must start from Citadel or Command Prompt*"
		halt
	end
	setVar $message ""
	setVar $planetToAttack $parm1
	getWordPos $user_command_line $pos "zdy"
	if ($pos > 0)
		setVar $zdy TRUE
	else
		setVar $zdy FALSE
	end
	getWordPos $user_command_line $pos "sh"
	if ($pos > 0)
		setVar $shieldsOnly TRUE
	else
		setVar $shieldsOnly FALSE
	end
	getWordPos $user_command_line $pos "def"
	if ($pos > 0)
		setVar $defender TRUE
	else
		setVar $defender FALSE
	end
	if ($startingLocation = "Citadel")
		send "q"
		gosub :planetinfo~getPlanetInfo
		send "m * * * c "
		gosub :shipstats~getShipStats
		send " q "
		setVar $refurbString "l "&$planetinfo~PLANET&"* m * * * "
		setVar $attackString ""
		setVar $targetString  "q l j"&#8&$planetToAttack&"*z *  @"
	else
		gosub :shipstats~getShipStats
		gosub :grabfigs
		gosub :quikstats~quikstats
		setVar $attackString ""
		setVar $targetString  "l j"&#8&$planetToAttack&"*z *  @"
	end
	:tryInvadeAgain
	gosub :quikstats~quikstats
	if (($zdy = TRUE) AND ($quikstats~ATOMIC < 1))
		send "'{" $bot_name "} - Cannot run zdy version of kamikaze without detonators!*"
		halt
	end
	while ($quikstats~FIGHTERS = $shipstats~SHIP_FIGHTERS_MAX)
		setVar $attackString ""
		send $targetString
		setTextTrigger 		invadeShields 		:keepInvading 		"You have to destroy the fighters defending the planet to land." 
		setTextTrigger 		invadeContinue 		:shieldInvade 		"You have to destroy the Planetary Shields defending the planet to land." 
		setTextTrigger 		invadeDone     		:Invaded 		"<Destroy Planet>"
		setTextTrigger  	blockedInvade		:blockedInvading 	"Do you want instructions (Y/N)"
		setTextLineTrigger      noPlanet                :noPlanetToInvade       "Invalid registry number, landing aborted."
		setTextLineTrigger	invadequick		:Invaded		"  Item    Colonists  Colonists    Daily     Planet      Ship      Planet"
		setTextLineTrigger	noland			:doneInvading		"since it couldn't possibly stand the stress of landing."
		setTextLineTrigger      invadePod               :destroyedWhile         "Average Interval Lag:"
		pause
		:destroyedWhile
			killalltriggers
			send "* * q q q q r * l j"&#8&$planetinfo~PLANET&"* j c * "
			setVar $message "'{"&$bot_name&"} - Podded while being a kamikaze, what did you really expect? Calling saveme in case I am not safely back on the planet.*"
			send $message
			halt
		:noPlanetToInvade
			killalltriggers
			setVar $message "'{"&$bot_name&"} - Planet number entered is not in this sector.*"
			goto :doneInvading
		:shieldInvade
			killalltriggers
			gosub :quikstats~quikstats
			setVar $damageTaken ($shipstats~SHIP_FIGHTERS_MAX-$quikstats~FIGHTERS)
			send "'{" $bot_name "} - "&$damageTaken&" points of damage taken from quasar cannon*"
			setVar $quikstats~FIGHTERS ($quikstats~FIGHTERS-$damageTaken)
			if ($quikstats~FIGHTERS <= 0)
				goto :invadeRefurb
			end
			if ($shieldsOnly = TRUE)
				send "*"
				waitOn " / Shields "
				getWord CURRENTLINE $quikstats~FIGHTERS 2
				getWord CURRENTLINE $planet_shields 5
				if ($planet_shields < 50)
					setVar $message "'{"&$bot_name&"} - Planet has less than 50 planetary shields.*"
					goto :doneInvading
				end
				while (($planet_shields >= 50) AND ($quikstats~FIGHTERS > 0))
					setVar $temp (((($planet_shields-45)*20)*10)/$shipstats~SHIP_OFFENSIVE_ODDS)
					if ($temp >= $shipstats~SHIP_MAX_ATTACK)
						if ($quikstats~FIGHTERS >= $shipstats~SHIP_MAX_ATTACK)
							setVar $amount $shipstats~SHIP_MAX_ATTACK
							setVar $temp ($temp-$shipstats~SHIP_MAX_ATTACK)
							setVar $quikstats~FIGHTERS ($quikstats~FIGHTERS-$shipstats~SHIP_MAX_ATTACK)
						else
							setVar $amount $quikstats~FIGHTERS
							setVar $temp ($temp-$quikstats~FIGHTERS)
							setVar $quikstats~FIGHTERS 0
						end
					else
						setVar $amount $temp
						setVar $temp 0
					end
					send "a"&$amount&"*"
					waitOn " / Shields "
					getWord CURRENTLINE $planet_shields 5

				end
				if ($planet_shields < 50)
					setVar $message "'{"&$bot_name&"} - Planet has less than 50 planetary shields.*"
					goto :doneInvading
				end
			else
				while ($quikstats~FIGHTERS > 0)
					if ($quikstats~FIGHTERS >= $shipstats~SHIP_MAX_ATTACK)
						setVar $attackString $attackString&"z a "&$shipstats~SHIP_MAX_ATTACK&"* * "
						subtract $quikstats~FIGHTERS $shipstats~SHIP_MAX_ATTACK
					else
						setVar $attackString $attackString&"z a "&$quikstats~FIGHTERS&"* * "
						setVar $quikstats~FIGHTERS 0
					end
				end
				send $attackString
			end
			goto :invadeRefurb
		:keepInvading
			killalltriggers
			gosub :quikstats~quikstats
			setVar $figsToUse 9999
			setVar $attackString ""
			if ($defender = TRUE)
				if ($quikstats~FIGHTERS = $shipstats~SHIP_FIGHTERS_MAX)
					setVar $message "'{"&$bot_name&"} - No damage being taken when landing defensively.*"
					goto :doneInvading
				end
			else
				while ($quikstats~FIGHTERS > 0)
					if ($quikstats~FIGHTERS >= $shipstats~SHIP_MAX_ATTACK)
						setVar $attackString $attackString&"z a "&$shipstats~SHIP_MAX_ATTACK&"* * "
						subtract $quikstats~FIGHTERS $shipstats~SHIP_MAX_ATTACK
					else
						setVar $attackString $attackString&"z a "&$quikstats~FIGHTERS&"* * "
						setVar $quikstats~FIGHTERS 0
					end
				end
				send $attackString
				gosub :quikstats~quikstats
				if ($quikstats~FIGHTERS > 0)
					gosub :claimOrDestroyPlanet
					goto :doneInvading
				end
			end
		:invadeRefurb
			killalltriggers
			if ($startingLocation = "Citadel")
				send "z R * "&$refurbString
			else
				send "z R * "
				gosub :grabfigs
				gosub :quikstats~quikstats
				if ($quikstats~FIGHTERS < 100)
					gosub :grabfigs
				end
			end
			gosub :quikstats~quikstats
	end
	goto :doneInvading
	:blockedInvading
		killalltriggers
		send "a y y "&$shipstats~SHIP_MAX_ATTACK&"* "&$refurbString
		goto :tryInvadeAgain
	:Invaded
		killalltriggers
		gosub :claimOrDestroyPlanet
	:doneInvading
		killalltriggers
		if ($startingLocation = "Citadel")
			send "q q q q * "&$refurbString&"C "
		else
			send "z R * q q q q * "
			gosub :grabfigs
		end
		send $message
		send "'{" $bot_name "} - Kamikaze run ended.*"
		halt

	:claimOrDestroyPlanet
		if ($zdy)
			if ($quikstats~FIGHTERS > 1000)
				send "z a y "&($quikstats~FIGHTERS-1000)&"* * Z D Y"
			else
				send "z d y "
			end
			setVar $message "'{"&$bot_name&"} - Invaded and attempting to blow planet, check for pods!*"
		else
			send "* * * o z c * c v y q q "
			setVar $message "'{"&$bot_name&"} - Invaded and claiming planet, attempting to evict all from citadel, check for people to kill!*"
		end
	return

:grabfigs
	send " F"
	waitOn "Your ship can support up to"
	getWord CURRENTLINE $ftrs_to_leave 10
	stripText $ftrs_to_leave ","
	stripText $ftrs_to_leave " "
	if ($ftrs_to_leave < 1)
		setVar $ftrs_to_leave 1
	end
	send " " & $ftrs_to_leave & " * C D"
return
# ======================     END KAMIKAZE (KAZI) SUBROUTINE    ==========================

include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\MOMBot\botIncludes\quikstats"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\MOMBot\botIncludes\planetinfo"
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\MOMBot\botIncludes\shipstats"
