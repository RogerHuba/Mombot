gosub :BOT~loadVars

#HELP FILE
     setVar $BOT~help[1]  $BOT~tab&"listamtrak   "
     setVar $BOT~help[2]  $BOT~tab&"    Creates list of amtrak sectors   "
     gosub :bot~helpfile

setVar $SWITCHBOARD~message "Creating list of AMTRAK sectors..*"
gosub :SWITCHBOARD~switchboard

:getTargets
	setVar $databasecount 0
	setVar $randomSectors "  "
	setVar $path_database "  "
	setVar $perc 0
	setVar $i 1
	setVar $bot~parmAM "MSLSEC"
	while ($i <= SECTORS)
		getSectorParameter $i $bot~parmAM $isTrue
		if ($isTrue = TRUE)
			setVar $j 1
			while (SECTOR.WARPS[$i][$j] > 0)
				setVar $test_sector SECTOR.WARPS[$i][$j]
				getWordPos $path_database $pos " "&$test_sector&" "
				if ($pos <= 0)
					getSectorParameter $test_sector $bot~parmAM $isTrue
					if (($isTrue <> TRUE) AND ($test_sector <> $map~stardock) AND ($test_sector > 10) AND ($test_sector <> $map~rylos) AND ($test_sector <> $map~alpha_centauri))
						setVar $path_database $path_database&$test_sector&"  "
						setSectorParameter $test_sector "AMTRAK" TRUE
					end	
				end
				add $j 1
			end
		end
		setVar $percTest (($i * 100) / SECTORS)
		if ($percTest > $perc)
			setVar $perc (($i * 100) / SECTORS)
			echo "*"
			echo #27 "["&($perc / 2)&"C"
			echo ANSI_14 "°" ANSI_15 " " $perc "%" #27 & "[1A   "
		end
		add $i 1
	end

halt


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\switchboard"
