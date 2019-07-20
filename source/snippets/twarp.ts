# ======================    START INTERNAL TWARP SUBROUTINE     ==========================
:twarpto
	setVar $twarpSuccess FALSE
	gosub :quikstats
	if ($CURRENT_SECTOR = $warpto)
		setVar $msg "Already in that sector!"
		goto :twarpDone
	elseif (($warpto <= 0) OR ($warpto > SECTORS))
		setVar $msg "Destination sector is out of range!"
		goto :twarpDone
	end
	if ($TWARP_TYPE = "NO")
		setVar $msg "No T-warp drive on this ship!"
		goto :twarpDone
	end
	send "q q q * c u y q mz" $warpto "*"
	setTextTrigger there :adj_warp "You are already in that sector!"
	setTextLineTrigger adj_warp :adj_warp "Sector  : "&$warpto&" "
	setTextTrigger locking :locking "Do you want to engage the TransWarp drive?"
	setTextTrigger igd :twarpIgd "An Interdictor Generator in this sector holds you fast!"
	setTextTrigger noturns :twarpPhotoned "Your ship was hit by a Photon and has been disabled"
	setTextTrigger noroute :twarpNoRoute "Do you really want to warp there? (Y/N)"
	pause

	:adj_warp
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		send "z*"
		goto :twarp_adj
	:locking
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		send "y"
		setTextLineTrigger twarp_lock :twarp_lock "TransWarp Locked"
		setTextLineTrigger no_twrp_lock :no_twarp_lock "No locating beam found"
		setTextLineTrigger twarp_adj :twarp_adj "<Set NavPoint>"
		setTextLineTrigger no_fuel :twarpNoFuel "You do not have enough Fuel Ore"
		pause

	:twarpNoFuel
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		killtrigger twarp_lock
		killtrigger no_twrp_lock
		killtrigger twarp_adj
		killtrigger no_fuel
		setVar $msg "Not enough fuel for T-warp."
		goto :twarpDone

	:twarp_adj
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		killtrigger twarp_lock
		killtrigger no_twrp_lock
		killtrigger twarp_adj
		killtrigger no_fuel
		send "z* "
		setVar $msg "That sector is next door, just plain warping."
		setVar $twarpSuccess TRUE
		goto :twarpDone

	:twarpNoRoute
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		killtrigger twarp_lock
		killtrigger no_twrp_lock
		killtrigger twarp_adj
		killtrigger no_fuel
		send "n* z* "
		setVar $msg "No route available to that sector!"
		goto :twarpDone

	:no_twarp_lock
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		killtrigger twarp_lock
		killtrigger no_twrp_lock
		killtrigger twarp_adj
		killtrigger no_fuel
		send "n* z* "
		setVar $msg "No fighters at T-warp point!"
		setSectorParameter $warpto "FIGSEC" FALSE
		goto :twarpDone

	:twarpIgd
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		killtrigger twarp_lock
		killtrigger no_twrp_lock
		killtrigger twarp_adj
		killtrigger no_fuel
		setVar $msg "My ship is being held by Interdictor!"
		goto :twarpDone

	:twarpPhotoned
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		killtrigger twarp_lock
		killtrigger no_twrp_lock
		killtrigger twarp_adj
		killtrigger no_fuel
		setVar $msg "I have been photoned and can not T-warp!"
		goto :twarpDone

	:twarp_lock
		killtrigger there
		killtrigger adj_warp
		killtrigger locking
		killtrigger igd
		killtrigger noturns
		killtrigger noroute
		killtrigger twarp_lock
		killtrigger no_twrp_lock
		killtrigger twarp_adj
		killtrigger no_fuel
		send "y* "
		setSectorParameter $warpto "FIGSEC" TRUE

		setVar $msg "T-warp completed."
		setVar $twarpSuccess TRUE
	:twarpDone
return
# ======================    END INTERNAL TWARP SUBROUTINE     ==========================
