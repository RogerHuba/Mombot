#Author: Mind Dagger
#Gets all planet information from planet prompt.
#Needs: Start from Planet prompt



# ==============================  START PLANET INFO SUBROUTINE  =================
:getPlanetInfo

	# ============================ START PLANET VARIABLES ==========================
        	setVar $CURRENT_SECTOR		0
        	setVar $PLANET			0
		setVar $PLANET_FUEL		0
		setVar $PLANET_FUEL_MAX		0
		setVar $PLANET_ORGANICS		0	
		setVar $PLANET_ORGANICS_MAX	0
		setVar $PLANET_EQUIPMENT	0
		setVar $PLANET_EQUIPMENT_MAX	0
		setVar $PLANET_FIGHTERS		0
		setVar $PLANET_FIGHTERS_MAX	0
		setVar $CITADEL			0
		setVar $CITADEL_CREDITS		0
		setVar $ATMOSPHERE_CANNON	0
		setVar $SECTOR_CANNON		0
	# ============================  END PLANET VARIABLES ==========================


	send "*"
	setTextLineTrigger planetInfo2 :planetInfo2 "Planet #"
	pause

	:planetinfo2
		setVar $CITADEL 0
		setVar $SECTOR_CANNON 0
		setVar $ATMOSPHERE_CANNON 0
		setVar $CITADEL_CREDITS 0
		getWord CURRENTLINE $PLANET 2
		stripText $PLANET "#"
		getWord CURRENTLINE $CURRENT_SECTOR 5
		stripText $CURRENT_SECTOR ":"
		waitfor "2 Build 1   Product    Amount     Amount     Maximum"

        :getPlanetStuff
		setTextLineTrigger fuelstart :fuelstart "Fuel Ore"
		setTextLineTrigger orgstart :orgstart "Organics"
		setTextLineTrigger equipstart :equipstart "Equipment"
		setTextLineTrigger figstart :figstart "Fighters        N/A"
		setTextLineTrigger citadelstart :citadelstart "Planet has a level"
		setTextLineTrigger cannon :cannonstart ", AtmosLvl="
		setTextTrigger planetInfoDone :planetInfoDone "Planet command (?=help)"
		pause

        :fuelstart
		getWord CURRENTLINE $PLANET_FUEL 6
		getWord CURRENTLINE $PLANET_FUEL_MAX 8
		stripText $PLANET_FUEL ","
		stripText $PLANET_FUEL_MAX ","
		pause

        :orgstart
		getWord CURRENTLINE $PLANET_ORGANICS 5
		getWord CURRENTLINE $PLANET_ORGANICS_MAX 7
		stripText $PLANET_ORGANICS ","
		stripText $PLANET_ORGANICS_MAX ","
		pause

        :equipstart
		getWord CURRENTLINE $PLANET_EQUIPMENT 5
		getWord CURRENTLINE $PLANET_EQUIPMENT_MAX 7
		stripText $PLANET_EQUIPMENT ","
		stripText $PLANET_EQUIPMENT_MAX ","
		pause

        :figstart
		getWord CURRENTLINE $PLANET_FIGHTERS 5
		getWord CURRENTLINE $PLANET_FIGHTERS_MAX 7
		stripText $PLANET_FIGHTERS ","
		stripText $PLANET_FIGHTERS_MAX ","
		pause

        :citadelstart
		getWord CURRENTLINE $CITADEL 5
		getWord CURRENTLINE $CITADEL_CREDITS 9
		striptext $CITADEL_CREDITS ","
		pause

	:cannonstart
		getWord CURRENTLINE $ATMOSPHERE_CANNON 5
		getWord CURRENTLINE $SECTOR_CANNON 6
		stripText $SECTOR_CANNON "SectLvl="
		striptext $SECTOR_CANNON "%"
		stripText $ATMOSPHERE_CANNON "AtmosLvl="
		striptext $ATMOSPHERE_CANNON "%"
		striptext $ATMOSPHERE_CANNON ","
		pause
	:planetInfoDone
		killtrigger citadelstart
		killtrigger cannon
	
setVar $currentBotPlanet $PLANET
saveVar $currentBotPlanet
return
# ==============================  END PLANET INFO SUBROUTINE  =================


#requires $planet
#requires $bot_name
#requires switchboard

:landingSub
    send "l" $PLANET "*z  n  z  n  *  "
    saveVar $PLANET
    setVar $sucessfulCitadel FALSE
    setVar $sucessfulPlanet FALSE
    setTextLineTrigger noplanet :noplanet "There isn't a planet in this sector."
    setTextLineTrigger no_land :no_land "since it couldn't possibly stand"
    setTextLineTrigger planet :planet "Planet #"
    setTextLineTrigger wrongone :wrong_num "That planet is not in this sector."
    pause
:noplanet
    killtrigger no_land
    killtrigger planet
    killtrigger wrongone
    setVar $SWITCHBOARD~message "No Planet in Sector!*"
    gosub :SWITCHBOARD~switchboard


    return
:no_land
    killtrigger noplanet
    killtrigger planet
    killtrigger wrongone
    setVar $SWITCHBOARD~message "This ship cannot land!*"
    gosub :SWITCHBOARD~switchboard
    return
:planet
    getWord CURRENTLINE $pnum_ck 2
    stripText $pnum_ck "#"
    if ($pnum_ck <> $PLANET)
        killtrigger no_land
        killtrigger wrongone
        killtrigger no_planet
        send "q"
        goto :wrong_num
    end
    killtrigger noplanet
    killtrigger no_land
    killtrigger wrongone
    setTextTrigger wrong_num :wrong_num "That planet is not in this sector."
    setTextTrigger planet :planet_prompt "Planet command"
    pause
:wrong_num
    killtrigger planet
    send "**"
    setVar $SWITCHBOARD~message "Incorrect Planet Number*"
    gosub :SWITCHBOARD~switchboard
    return
:planet_prompt
    killtrigger wrong_num
    setVar $currentBotPlanet $planet
    saveVar $currentBotPlanet 
    send "c*"
    setTextTrigger build_cit :build_cit "Do you wish to construct one?"
    setTextTrigger in_cit :in_cit "Citadel command"
    setTextTrigger nocitallowed :build_cit "Citadels are not allowed in FedSpace."
    setTextTrigger citnotbuiltyet :build_cit "Be patient, your Citadel is not yet finished."
    pause
:build_cit
    killtrigger in_cit
    killtrigger nocitallowed
    killtrigger build_cit
    killtrigger citnotbuiltyet
    setVar $sucessfulPlanet TRUE
    setVar $startingLocation "Planet"
    return
:in_cit
    killtrigger in_cit
    killtrigger nocitallowed
    killtrigger build_cit
    killtrigger citnotbuiltyet
    setVar $sucessfulCitadel TRUE
    setVar $startingLocation "Citadel"
return
