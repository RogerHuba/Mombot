	logging off
		gosub :BOT~loadVars
									

	setVar $BOT~help[1] $BOT~tab&"qreset [planet1] [damage1] ... [planetx] [damagex] "
	setVar $BOT~help[2] $BOT~tab&"  - Sets sector and atmos cannons for planets listed"
	setVar $BOT~help[3] $BOT~tab&"   "
	setVar $BOT~help[4] $BOT~tab&"qreset [damage]"
	setVar $BOT~help[5] $BOT~tab&"  - Sets sector and atmos cannon for current planet"
	gosub :bot~helpfile

	setVar $BOT~script_title "Cannon Resetter"
	gosub :BOT~banner



# ======================     START CANNON SETTER (CANNONSET) SUBROUTINE    ==========================
:cannonSet
	killalltriggers
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Command") AND ($startingLocation <> "Citadel"))
		setVar $SWITCHBOARD~message "Cannon Setter must be run from command or citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setArray $cannonPlanet 200
	setArray $cannonAmount 200
	setVar $cannonPlanetCount 0
	setVar $totalDamage 0
	setVar $onePlanet FALSE

	setVar $j 0	
	setVar $temp ""
	while ($temp <> 0)
		add $j 1
		getWord $bot~user_command_line $temp $j
		if ($temp <> 0)
			add $cannonPlanetCount 1
			setVar $cannonPlanet[$cannonPlanetCount] $temp
			add $j 1
			getWord $bot~user_command_line $temp $j
			setVar $cannonAmount[$cannonPlanetCount] $temp
		end
	end
	if ($cannonPlanetCount <= 0)
		setVar $SWITCHBOARD~message "No planet numbers entered.*"
		gosub :SWITCHBOARD~switchboard
		halt			
	end
	if (($cannonPlanetCount = 1) AND ($cannonAmount[$cannonPlanetCount] = 0))
		#Only run from one planet
		setVar $onePlanet TRUE
		setVar $cannon_amount $cannonPlanet[1]
		setvar $cannon_total $cannonPlanet[1]
		setVar $planet~planetMemory $planet~planet
		if ($startingLocation = "Command")
			setVar $SWITCHBOARD~message "Must be run from citadel if only one planet.*"
			gosub :SWITCHBOARD~switchboard
			halt						
		end
	end

	:resetTheCannons
	killalltriggers
	setVar $totalDamage 0
	if ($onePlanet)
		setVar $cannon_amount $cannonPlanet[1]
		setvar $cannon_total $cannonPlanet[1]
		send "q "
		gosub :setTheCannon
		setvar $planet~planetMemory $planet~planet
	else
		setvar $cannon_amount 0
		setvar $cannon_total 0
		send "q q * "
		setVar $planet~planetMemory ""
		setVar $i 1
		while ($i <= $cannonPlanetCount)
			add $cannon_total $cannonAmount[$i]
			add $i 1
		end
		## for multiple planets, no reason to set atmos cannons above 500k, when ships don't go higher than 400k fighters ##

		if ($cannon_total > 500000)
			setvar $cannon_total 500000
		end
		setVar $i 1
		while ($i <= $cannonPlanetCount)
			getWordPos $planet~planetMemory $pos " "&$cannonPlanet[$i]&" "
			if ($pos > 0)
				
			else
				setVar $planet~planetMemory $planet~planetMemory&" "&$cannonPlanet[$i]&" "
				send "l "&$cannonPlanet[$i]&"* * "
				setTextLineTrigger 	wrongPlanet2 		:badPlanet2 	"That planet is not in this sector."
				setTextLineTrigger 	badPlanet2 		:badPlanet2 	"Invalid registry number, landing aborted."
				setTextLineTrigger 	goodPlanet2 		:goodPlanet2 	"Planet command (?=help)"
				pause
				:badPlanet2	
					killtrigger wrongPlanet2
					killtrigger badPlanet2
					killtrigger goodPlanet2
					setVar $SWITCHBOARD~message "Planet number "&$cannonPlanet[$i]&" entered not valid. *"
					gosub :SWITCHBOARD~switchboard
					halt
				:goodPlanet2
					killtrigger wrongPlanet2
					killtrigger badPlanet2
					killtrigger goodPlanet2
					setVar $cannon_amount $cannonAmount[$i]
					gosub :setTheCannon
					if ($i < $cannonPlanetCount)
						send "q q "
					end
			end
				:keepGoingPlanetSet	
			add $i 1
		end
	end

	gosub :PLAYER~quikstats
	setVar $SWITCHBOARD~message "Quasar Cannon reset mode enabled.  Planet number(s) ["&$planet~planetMemory&"] are set for a total of "&$totalDamage&". *"
	gosub :SWITCHBOARD~switchboard
	setvar $switchboard~message "Atmos cannons attempted to be set to "&$cannon_total&".*"
	gosub :SWITCHBOARD~switchboard

	goto :setmultitriggers
	halt
# ======================     END CANNON SETTER (CANNONSET) SUBROUTINE     ==========================

:setTheCannon
	loadvar $game~mbbs
	gosub :PLANET~getPlanetInfo

    ## Set sector cannons ##

            setVar $percentToSet (((3*$cannon_amount)*100)/$planet~planet_FUEL)
            if (((($planet~planet_FUEL * $percentToSet) / 100)/3) < $cannon_amount)
                add $percentToSet 1
            end
            if ($percentToSet > 100)
                setVar $percentToSet 100
            end
            add $totalDamage ((($planet~planet_FUEL * $percentToSet) / 100)/3)
            send "c l s "&$percentToSet&"* "

    ## Then set atmos cannons ##
            if ($game~mbbs)
                setVar $percentToSet ((($cannon_total/2)*100)/$planet~planet_FUEL)
                if (((($planet~planet_FUEL * $percentToSet) / 100)*2) < $cannon_total)
                    add $percentToSet 1
                end
            else
                setVar $percentToSet (((2*$cannon_total)*100)/$planet~planet_FUEL)
                if (((($planet~planet_FUEL * $percentToSet) / 100)/2) < $cannon_total)
                    add $percentToSet 1
                end
            end
            if ($percentToSet > 100)
                setVar $percentToSet 100
            end
            if ($game~mbbs)
                setvar $totalAtmosDamage ((($planet~planet_FUEL * $percentToSet) / 100)*2)
            else
                setvar $totalAtmosDamage ((($planet~planet_FUEL * $percentToSet) / 100)/2)             
            end
            send "l a "&$percentToSet&"* "
return


:setmultitriggers
	killalltriggers
	setTextLineTrigger 1 :resetTheCannons "Quasar Cannon on"
	#setDelayTrigger delay :resetTheCannons 120000
	setTextTrigger 		pause 	:pausing 		"Planet command (?="
	setTextTrigger 		pause2 	:pausing 		"Computer command ["
	setTextTrigger 		pause3 	:pausing 		"Corporate command ["
	pause


:pausing
	killAllTriggers
	echo ANSI_6 "*[" ANSI_14 "Cannon Reset paused. To restart, re-enter citadel prompt" ANSI_6 "]*" ANSI_7
	setTextTrigger restart :restarting "Citadel command ("
	pause
	:restarting
	killAllTriggers
	echo ANSI_6 "*[" ANSI_14 "Cannon Reset restarted" ANSI_6 "]*" ANSI_7
	goto :setmultitriggers
	pause


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet\getplanetinfo\planet"
