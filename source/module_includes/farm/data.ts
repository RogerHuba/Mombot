:setbubble
		setVar $DOOR $bot~parm2
		setSectorParameter $DOOR "DOOR" TRUE
		setSectorParameter $DOOR "BUBBLE" TRUE
		setVar $bubble_sectors " "

		setVar $i 11
		setVar $count 0
		setVar $perc 0
		while ($i <= SECTORS)
			if ($i <> $DOOR)
				getCourse $path $i 1 
				if ($path = "-1")
					send "/"
					waitOn #179
					echo ANSI_14 "Updating database...*" ANSI_7
					send "^f"&$i&"*1**q"
					waitOn "ENDINTERROG"
					getCourse $path $i 1 
				end
				setVar $j 1
				setVar $found_bubble_sector FALSE
				while ($j <= $path)
					if ($path[$j] = $DOOR)
						setVar $found_bubble_sector TRUE
					end
					add $j 1
				end
				if ($found_bubble_sector = TRUE)
						write $BUBBLE_LIST $i
						setSectorParameter $i "BUBBLE" TRUE
						setVar $bubble_sectors $bubble_sectors&" "&$i  
						add $count 1
				else
						#setSectorParameter $i "BUBBLE" ""
				end

			end
			setVar $percTest (($i * 100) / SECTORS)
			if ($percTest > $perc)
				setVar $perc (($i * 100) / SECTORS)
				echo "*"
				echo #27 "["&($perc / 2)&"C"
				echo ANSI_14 "°" ANSI_15 " " $perc "%" #27 & "[1A   "
			end
			add $i 1
		end

		send "'*"&$count&" bubble sectors with door sector of "&$DOOR&": "&$bubble_sectors&"**"
return

:fillplanetstats
	setVar $planet~planetToFill $planet~planet
	setVar $planet~planetToFillFuel $planet~planet_FUEL
	setVar $planet~planetToFillOrganics $planet~planet_ORGANICS
	setVar $planet~planetToFillEquipment $planet~planet_EQUIPMENT
	setVar $planet~planetToFillFuelColonists $planet~planet_FUEL_COLONISTS
	setVar $planet~planetToFillOrganicsColonists $planet~planet_ORGANICS_COLONISTS
	setVar $planet~planetToFillEquipmentColonists $planet~planet_EQUIPMENT_COLONISTS
	setvar $planet~planetToFillFuelMax $planet~planet_FUEL_COLONISTS_MAX
	setvar $planet~planetToFillOrgMax $planet~planet_ORGANICS_COLONISTS_MAX
	setvar $planet~planetToFillEquipMax $planet~planet_EQUIPMENT_COLONISTS_MAX
	gosub :setWindow						
return

