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
