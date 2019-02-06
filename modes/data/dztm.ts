loadVar $bot_name
gosub :BOT~loadVars
setVar $parm1 $BOT~parm1
setVar $parm2 $BOT~parm2
setVar $parm3 $BOT~parm3

#HELP FILE
        setVar $BOT~help[1]  $BOT~tab&"Deadend ZtM"
        setVar $BOT~help[2]  $BOT~tab&"  "
        setVar $BOT~help[3]  $BOT~tab&"dztm "
        setVar $BOT~help[4]  $BOT~tab&"         "
        setVar $BOT~help[5]  $BOT~tab&"Speed maps to find single warp sectors "
        setVar $BOT~help[6]  $BOT~tab&"         "
        setVar $BOT~help[7]  $BOT~tab&"Not meant to be accurate, just fast for quick start"
        gosub :BOT~help_file




#----- INCLUDES -----
reqRecording


# CREDITS
# -------
# Written by Hammer


# REVISION HISTORY
# ----------------
# 1.0.0 Initial version, Plots a map with no turn usage - dEAD END.



# --- CHECK LOCATION ---
gosub :PLAYER~quikstats
setVar $location $PLAYER~CURRENT_PROMPT
:checkLocation
    if (($location = "Command") OR ($location = "Citadel") OR ($location = "Computer"))
        if ($location <> "Computer")
        send "C"
            waitFor "Computer command [TL="
            setVar $location "Computer"
    end
    else
    send "'{" $bot_name "} - ZTM must be started from Command, Computer, or Citadel prompt.*"
    end
    


    
# --- INIT VARIABLES ---
:initVars
  
	setVar $maxSector SECTORS
	# testing purposes going from 10011 to 10100
	setVar $maxSector SECTORS

	setVar $forwardi 11
	setVar $backi $maxSector
	
	setVar $forwardSectors 0

# ADD THESE IN LATER
#	loadVar $dztm_resumepass
#	loadVar $dztm_resumesectorforward

	setVar $sectorsToFind 10
	if ($dztm_resumesectorforward > 0)
		setVar $forwardi $dztm_resumesectorforward
	end
# --- INIT PROGRAM ---
:init
	send "V0*YY"
	waitFor "Computer command [TL="
	gosub :PLAYER~quikstats



:start

echo "*## STARTING DEADEND ZTM"
echo "*##  $dztm_resumepass: " $dztm_resumepass
echo "*##  $forwardi: " $forwardi



	setVar $forwardSectorsFound 0
	setVar $backSectors 0
	setVar $letsLook 1

	while ($letsLook = 1)

		
		while ($forwardSectorsFound < $sectorsToFind)
			
			if (SECTOR.WARPCOUNT[$forwardi] = $dztm_resumepass)
				add $forwardSectorsFound 1
				setVar $forwardSectors[$forwardSectorsFound] $forwardi

			end
			
			add $forwardi 1
			if ($forwardi > $maxSector)
				
				if ($dztm_resumepass = 0)
					# Start Next Pass
					add $dztm_resumepass 1
					saveVar $dztm_resumepass

					setVar $forwardi 11
				elseif ($dztm_resumepass = 1)
					setVar $letsLook 0
				end
				goto :breakoutSearch
			end
		end
		:breakoutSearch

		setVar $i 1
		while ($i <= $forwardSectorsFound)
			
			if ($dztm_resumepass = 1)
				
				send "v" SECTOR.WARPS[$forwardSectors[$i]][1] "*"
			end

			setVar $otherSector $maxSector
			subtract $otherSector $forwardSectors[$i] 
			send "f" $forwardSectors[$i] "*" $otherSector "**"
			
			if ($dztm_resumepass = 1)
				send "v0*yy"
			end
			add $i 1
		end
		send "/"
		waitfor "³Turns"
		# Remove 
		
		
		setVar $forwardSectorsFound 0
		setVar $forwardSectors 0
	
	end
	

	setVar $checki 11
	setVar $forwardSectorsFound 0
	setVar $forwardSectors 0
	setVar $forwardSectorsTo 0
	
	while ($checki < $maxSector)
		

		if (SECTOR.WARPCOUNT[$checki] = 1)
			setVar $check 0
			setVar $checky 1
			while ($checky <= SECTOR.WARPINCOUNT[$checki])

				if (SECTOR.WARPSIN[$checki][$checky] <> SECTOR.WARPS[$checki][1])
					setVar $check SECTOR.WARPSIN[$checki][$checky]
					
				end
				add $checky 1
			end

			if ($check > 0)
				add $forwardSectorsFound 1
				setVar $forwardSectors[$forwardSectorsFound] $checki
				setVar $forwardSectorsTo[$forwardSectorsFound] $check
			end

		end
		add $checki 1
		if ($forwardSectorsFound >= $sectorsToFind)
			
			setVar $i 1
			while ($i <= $forwardSectorsFound)
				
				send "f" $forwardSectors[$i] "*" $forwardSectorsTo[$i] "**"
				add $i 1
			end
			setVar $forwardSectorsFound 0
			setVar $forwardSectors 0
			setVar $forwardSectorsTo 0
			send "/"
			waitfor "³Turns"
			
		end


	end
	
	setVar $i 1
	while ($i <= $forwardSectorsFound)
		
		send "f" $forwardSectors[$i] "*" $forwardSectorsTo[$i] "**"
		add $i 1
	end
	setVar $forwardSectorsFound 0
	setVar $forwardSectors 0
	setVar $forwardSectorsTo 0
	send "/"
	waitfor "³Turns"

	#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"

