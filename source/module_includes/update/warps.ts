# ======================     START REFRESH WARPS (WARPS) SUBROUTINE    ==========================
:update
	setVar $SWITCHBOARD~message "Loading current warp report. . .*"
	gosub :SWITCHBOARD~switchboard

	:readWarpList
		send "^iq"
		setTextLineTrigger done :done "ENDINTERROG"
return

# ======================     END REFRESH WARPS (WARPS) SUBROUTINE    ==========================

:report

	setVar $switchboard~message $SWITCHBOARD~message&"-=-=-=-=- Warps Report Complete-=-=-=-=-*"
return
