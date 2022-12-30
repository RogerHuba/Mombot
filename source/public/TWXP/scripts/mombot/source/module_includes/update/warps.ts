# ======================     START REFRESH WARPS (WARPS) SUBROUTINE    ==========================
:update
	setVar $SWITCHBOARD~message "Stand By - CIMMING Warp Data . . .*"
	gosub :SWITCHBOARD~switchboard

	:readWarpList
		send "^iq"
		setTextLineTrigger done :done "ENDINTERROG"
:done
	return

# ======================     END REFRESH WARPS (WARPS) SUBROUTINE    ==========================

:report

	setVar $switchboard~message $SWITCHBOARD~message&"-=-=-=-=- Warps Report Complete-=-=-=-=-*"
return
