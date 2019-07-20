# ======================     START FIND FIGHTER TRIGGER    ==========================
:findfig
	getWord CURRENTLINE $spoof 1
	if ($spoof <> "Deployed")
		halt
	end
	getWord CURRENTLINE $fighit 5
	stripText $fighit ":"
	isNumber $test $fighit
return
	#reimplement with sector params
	#if ($test)
	#	if (($fighit > 0) AND ($fighit <= SECTORS))
	#		setVar $FIGHTER_GRID[$fighit] 0
	#	end
	#end
	#gosub :quikstats
	
	#if ($mode = "Runaway")
	#	getDistance $dist $fighit $CURRENT_SECTOR
	#	if ($dist <= 2)
	#		goto :run_pwarp
	#	end
	#end
	#setTextLineTrigger findfig :findfig "Deployed Fighters Report Sector"
	#pause
# ======================     END FIND FIGHTER SUBROUTINE    ==========================