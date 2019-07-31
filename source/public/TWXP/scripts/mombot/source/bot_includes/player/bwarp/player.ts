:bwarp
	send "b"
	setTextTrigger noBwarp  :noBwarp  "Would you like to place a subspace order for one? "
	setTextTrigger yesBwarp :yesBwarp "Beam to what sector? (U="
	setTextTrigger IGBwarp  :bwarpPhotoned "Your ship was hit by a Photon and has been disabled"
	pause
	:noBwarp
		killtrigger yesBwarp
		killtrigger IGBwarp
		killtrigger noBwarp
		send "*"
		setVar $SWITCHBOARD~message "No Bwarp installed on this planet*"
		gosub :SWITCHBOARD~switchboard
		return
	:yesBwarp
		killtrigger yesBwarp
		killtrigger IGBwarp
		killtrigger noBwarp
		send $warpto&"*"
		setTextTrigger bwarp_lock :bwarp_no_range "This planetary transporter does not have the range."
		setTextTrigger no_bwrp_lock :no_bwarp_lock "Do you want to make this transport blind?"
		setTextTrigger bwarp_ready :bwarp_lock "All Systems Ready, shall we engage?"
		setTextLineTrigger no_bwarpfuel :bwarpNoFuel "This planet does not have enough Fuel Ore to transport you."
		pause
	:bwarp_no_range
		killtrigger bwarp_lock
		killtrigger no_bwrp_lock
		killtrigger bwarp_ready
		killtrigger no_bwarpfuel
		setVar $SWITCHBOARD~message "Not enough range on this planet's transporter.*"
		gosub :SWITCHBOARD~switchboard
		return
	:no_bwarp_lock
		killtrigger bwarp_lock
		killtrigger no_bwrp_lock
		killtrigger bwarp_ready
		killtrigger no_bwarpfuel
		send "* "
		setVar $target $warpto
		setSectorParameter $target "FIGSEC" FALSE
		setVar $SWITCHBOARD~message "No fighter down at that destination, aborting*"
		gosub :SWITCHBOARD~switchboard
		return
	:bwarp_lock
		killtrigger bwarp_lock
		killtrigger no_bwrp_lock
		killtrigger bwarp_ready
		killtrigger no_bwarpfuel
		send "y     * "
		setVar $target $warpto
		setSectorParameter $target "FIGSEC" TRUE
		setVar $SWITCHBOARD~message "B-warp completed.*"
		gosub :SWITCHBOARD~switchboard
		return
	:bwarpNoFuel
		killtrigger bwarp_lock
		killtrigger no_bwrp_lock
		killtrigger bwarp_ready
		killtrigger no_bwarpfuel
		setVar $SWITCHBOARD~message "Not enough fuel on the planet to make the transport!*"
		gosub :SWITCHBOARD~switchboard
		return
	:bwarpPhotoned
		killtrigger yesBwarp
		killtrigger IGBwarp
		killtrigger noBwarp
		setVar $SWITCHBOARD~message "I have been photoned and can not B-warp!*"
		gosub :SWITCHBOARD~switchboard
		return
