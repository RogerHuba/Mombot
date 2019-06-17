loadVar $bot_name
gosub :BOT~loadVars
setVar $parm1 $BOT~parm1
setVar $parm2 $BOT~parm2
setVar $parm3 $BOT~parm3

#HELP FILE
        setVar $BOT~help[1]  $BOT~tab&"   Quick Dead End Finder"
        setVar $BOT~help[2]  $BOT~tab&"  RETIRED - just use ZTM and stop it"
        setVar $BOT~help[3]  $BOT~tab&"   dztm {s:n} {one}"
        setVar $BOT~help[4]  $BOT~tab&"         "
        setVar $BOT~help[5]  $BOT~tab&"   Will resume from FROMSECTOR if cancelled "
        setVar $BOT~help[6]  $BOT~tab&"         "
        setVar $BOT~help[8]  $BOT~tab&"   {s:n} - Start Sector - n from 2 to MAXSECTORS"
        setVar $BOT~help[9]  $BOT~tab&"   {one} - Plot to Terra instead of random"
        setVar $BOT~help[10] $BOT~tab&"   "
        setVar $BOT~help[11] $BOT~tab&"   Examples:"
        setVar $BOT~help[12] $BOT~tab&"   >ztm s:400   - Pass 2, sector 400"
        setVar $BOT~help[13] $BOT~tab&"   >ztm one         - Plot to one"
       gosub :BOT~help_file




#----- INCLUDES -----
reqRecording


# CREDITS
# -------
# Written by Hammer


# REVISION HISTORY
# ----------------
# 1.0.0 Initial version, Plots a map with no turn usage
# 2.0.0 Retired


halt
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
	# setVar $maxSector 500

	setVar $forwardi 2
	setVar $backi $maxSector
	
	setVar $forwardSectors 0

# ADD THESE IN LATER
	loadVar $dztm_resumepass
	loadVar $dztm_resumesectorforward
	
	setVar $bot~user_command_line ($bot~user_command_line & " ")
	setVar $useOne 0
	getWordPos $bot~user_command_line $pos "one"
	if ($pos > 0)
		setVar $useOne 1
	end

	setVar $error 0

	
	getWordPos $bot~user_command_line $pos "s:"
	if ($pos > 0)
		getText $bot~user_command_line $value "s:" " "
		isNumber $number $value
		if ($number = 1)
			if ($value < 2) or ($value > SECTORS)
				setVar $error 1
			else
				setVar $dztm_resumesectorforward $value
				saveVar $dztm_resumesectorforward
			end
			
		else
			setVar $error 1
		end
	end

	if ($error = 1)
		setvar $switchboard~message "Please use format >ztm p:2 s:400*"
		gosub :switchboard~switchboard
		halt
	end

	if ($dztm_resumesectorforward > 0)
		setVar $forwardi $dztm_resumesectorforward
	end

	setVar $sectorsToFind 40



# --- INIT PROGRAM ---
:init
	send "V0*YY"
	waitFor "Computer command [TL="
	gosub :PLAYER~quikstats



:start

setVar $msg "Starting DZTM from Pass: " & $dztm_resumepass & " Sector: " & $forwardi & "*"
setvar $switchboard~message $msg
gosub :switchboard~switchboard




	setVar $forwardSectorsFound 0
	setVar $backSectors 0
	setVar $letsLook 1

	while ($letsLook = 1)

		
		while ($forwardSectorsFound < $sectorsToFind)
			
			if (SECTOR.WARPCOUNT[$forwardi] = $dztm_resumepass)
				add $forwardSectorsFound 1
				setVar $forwardSectors[$forwardSectorsFound] $forwardi
				echo "Checking: " $forwardi " has " SECTOR.WARPCOUNT[$forwardi] " looking for " $dztm_resumepass "*"
			else
				echo "Skip: " $forwardi " has " SECTOR.WARPCOUNT[$forwardi] " looking for " $dztm_resumepass "*"
			end
			
			add $forwardi 1
			if ($forwardi > $maxSector)
				
				if ($dztm_resumepass < 7)
					# Start Next Pass
					add $dztm_resumepass 1
					saveVar $dztm_resumepass

					setVar $forwardi 2
				elseif ($dztm_resumepass = 7)
					setVar $letsLook 0
				end
				goto :breakoutSearch
			end
		end
		:breakoutSearch

		setVar $i 1
		while ($i <= $forwardSectorsFound)
			
			if ($dztm_resumepass > 0)
				setVar $y 1
				while ($y <= SECTOR.WARPCOUNT[$forwardSectors[$i]])
					send "v" SECTOR.WARPS[$forwardSectors[$i]][$y] "*"
					add $y 1
				end
				
			end

			setVar $otherSector $maxSector
			subtract $otherSector $forwardSectors[$i] 
			if ($useOne = 1)
				send "f" $forwardSectors[$i] "*1**"
			else
				send "f" $forwardSectors[$i] "*" $otherSector "**"
			end

			if ($dztm_resumepass > 0)
				send "v0*yy"
			end
			add $i 1
		end
		send "/"
		waitfor "³Shlds"
		waitfor "³PlScn"
		# Remove 
		setVar $dztm_resumesectorforward $forwardi
		saveVar $dztm_resumesectorforward
	
		setVar $forwardSectorsFound 0
		setVar $forwardSectors 0
	
	end
	
	
	### CHECK BACKDOORS
	
	setVar $checki 2
	setVar $forwardSectorsFound 0
	setVar $forwardSectors 0
	setVar $forwardSectorsTo 0
	
	while ($checki < $maxSector)
		

		if (SECTOR.BACKDOORCOUNT[$checki] > 0)
			setVar $check 0
			setVar $checky 1
			while ($checky <= SECTOR.BACKDOORCOUNT[$checki])

				add $forwardSectorsFound 1
				setVar $forwardSectors[$forwardSectorsFound] $checki
				setVar $forwardSectorsTo[$forwardSectorsFound] SECTOR.BACKDOORS[$checki][$checky]

				add $checky 1
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

	

	#### DOUBLE CHECKING 1 SECTORS 
	setVar $checki 2
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
				
				if ($useOne = 1)
					send "f" $forwardSectors[$i] "*1**"
				else
					send "f" $forwardSectors[$i] "*" $forwardSectorsTo[$i] "**"
				end
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
		
		if ($useOne = 1)
			send "f" $forwardSectors[$i] "*1**"
		else
			send "f" $forwardSectors[$i] "*" $forwardSectorsTo[$i] "**"
		end
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

