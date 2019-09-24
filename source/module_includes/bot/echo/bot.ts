#expects $switchboard~message#
:echo
	getDeafClients $botIsDeaf
	if ($botIsDeaf)
		setvar $switchboard~isSilent true
		gosub :switchboard~switchboard
	else
		echo $switchboard~message
	end
return

