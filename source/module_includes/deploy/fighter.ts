:deploy
			if ($bot~startingLocation = "Citadel")
				send " q "
				gosub :PLANET~getPlanetInfo
				send " q "
			end
			if ($corporate)
				setvar $owner "c"
				setvar $owner_label "corporate"
			else
				setvar $owner "p"
				setvar $owner_label "personal"
			end
			if ($toll)
				setvar $type "t"
				setvar $type_label "toll"
			elseif ($offensive)
				setvar $type "o"
				setvar $type_label "offensive"
			else
				setvar $type "d"
				setvar $type_label "defensive"
			end
			send " f"
			
			waiton "fighters available."
			getword currentline $available_fighters 3
			stripText $available_fighters ","
			stripText $available_fighters " "

			waitOn "Your ship can support up to"
			getWord CURRENTLINE $ftrs_to_leave 10
			getWord CURRENTLINE $ship_fighters 7
			stripText $ftrs_to_leave ","
			stripText $ftrs_to_leave " "
			stripText $ship_fighters ","
			stripText $ship_fighters " "
			
			if ($ftrs_to_leave < $amount)
				setVar $ftrs_to_leave $amount
			end
			if ($available_fighters < $ftrs_to_leave)
				setvar $ftrs_to_leave $available_fighters
			end
			if (($available_fighters+$ship_fighters) > $amount)
				setvar $ftrs_to_leave ($available_fighters-$amount)
			end 
			send " " $ftrs_to_leave " * " $owner " " $type
			gosub :player~quikstats
			if ($bot~startingLocation = "Citadel")
				gosub :PLANET~landingSub
			end

			setVar $SWITCHBOARD~message $ftrs_to_leave&" "&$owner_label&" "&$type_label&" fighters have been deployed.*"
			gosub :SWITCHBOARD~switchboard

return
