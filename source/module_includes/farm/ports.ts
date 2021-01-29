:check
	killalltriggers
	send "q  q  q  z  n  *"
	setTextLineTrigger port_blown :port_blown "<=-DANGER-=>  Scanners indicate massive debris and heavy"
	setTextLineTrigger port_here :port_here "Class"
	setTextLineTrigger needs_port :build_port "Warps to Sector(s)"
	pause

	:port_here
		killalltriggers
		setTextLineTrigger port_building :port_blown "(Under Construction - "
		waitOn "Warps to Sector(s)"
		killalltriggers

		if ((PORT.CLASS[$PLAYER~CURRENT_SECTOR] <> 3) AND ($destroyports = TRUE))
			send "l  " & #8 & #8 & $planet~planet & "*  m n t *  c  "
			waitfor "Citadel command"
			gosub :PLAYER~quikstats
			if ($PLAYER~FIGHTERS < $SHIP~SHIP_MAX_ATTACK)
				setVar $SWITCHBOARD~message "Not Enough Fighters to Blow Port.*"
				gosub :SWITCHBOARD~switchboard
			end
		elseif ($port)
			if (PORT.BUILDTIME[$PLAYER~CURRENT_SECTOR] > 0)
				goto :under_construction
			end
			send "q  q  q  z  n  * o 1"
			waitfor "to quit)"
			getTExt CURRENTLINE $BUY "? (" "max"
			striptext $buy " "
			striptext $buy ","
			if ((PORT.BUYFUEL[$player~current_sector] = FALSE) AND ($skipfuel <> TRUE))
				send $buy & "* *  "
			else
				send "0* *  "
			end
			waitfor "Command"
			send "o 2"
			waitfor "to quit)"
			getTExt CURRENTLINE $BUY "? (" "max"
			striptext $buy " "
			striptext $buy ","
			if ((PORT.BUYORG[$player~current_sector] = TRUE) AND ($skiporg <> TRUE))
				send $buy & "* *  "
			else
				send "0* * "
			end
			waitfor "Command"
			send "o 3"
			waitfor "to quit)"
			getTExt CURRENTLINE $BUY "? (" "max"
			striptext $buy " "
			striptext $buy ","
			if ((PORT.BUYEQUIP[$player~current_sector] = TRUE) AND ($skipequip <> TRUE))
				send $buy & "* * l "&$planet~planet&"* c "
			else
				send "0* * l "&$planet~planet&"* c "
			end
			send "s"
			waitfor "Citadel command (?=h"
		end
		killalltriggers
return


:build
    killalltriggers
    send "l " & #8 & $planet~planetToFill & "*  m n t *  c "
    waitfor "Citadel command (?"
    if ($PLAYER~CREDITS < 50000)
            send "T F 50000*"
            gosub :PLAYER~quikstats
            if ($PLAYER~CREDITS < 50000)
                    setVar $SWITCHBOARD~message "Not Enough Credits to Make Ports*"
                    send "qq* l " & #8 & $planet~planet & "*  c  *"
            end
    end
    send "q q q z n * o3y" $portname "* l " & #8 & $planet~planet & "*  c  *"
    goto :end_check_ports

:port_blown
    killalltriggers
    send "qq* l " & #8 & $planet~planet & "*  c  *"
    goto :end_check_ports

:under_construction
    killalltriggers
    setVar $SWITCHBOARD~message "Port at " & $PLAYER~CURRENT_SECTOR & " is Under Construction. " & PORT.BUILDTIME[$PLAYER~CURRENT_SECTOR] & " More Days*"
    gosub :SWITCHBOARD~switchboard
    send "l " & #8 & $planet~planet & "*  m n t *  c "
    goto :end_check_ports

:end_check_ports
    killalltriggers
return
