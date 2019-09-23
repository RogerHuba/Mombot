#expects $switchboard~message#
:echo
	getDeafClients $botIsDeaf
	if ($botIsDeaf)
		gosub :switchboard~switchboard
	else
		echo "*"&$switchboard~message&"*"
	end
return

