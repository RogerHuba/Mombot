# ===========================  START SWATH DISABLING SUBROUTINE  =================
loadvar $swathoff
:swathoff
	if ($swathoff = FALSE)
		setTextTrigger swathison :swathison "Command [TL="
		setDelayTrigger swathisoff :swathisoff 2000
		pause

		:swathison
		killtrigger swathisoff
		killtrigger swathison
		setVar $swathOffMessage "Detected SWATH Autohaggle"
		setVar $swathoff FALSE
        saveVar $swathoff
		return

		:swathisoff
		killtrigger swathisoff
		killtrigger swathison
		setVar $swathoff TRUE
        savevar $swathoff
	end
return
# ==========================   END SWATH DISABLING SUBROUTINE  =================
