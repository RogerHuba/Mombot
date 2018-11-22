	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"Pgrids automatically until stopped. pgrid {fighterToDrop} "
	setVar $BOT~help[2] $BOT~tab&"          "
	setVar $BOT~help[3] $BOT~tab&"Requires corpie running saveme"
	setVar $BOT~help[4] $BOT~tab&" "
	setVar $BOT~help[5] $BOT~tab&"   Options:"
	setVar $BOT~help[6] $BOT~tab&"          {fightersToDrop} - how many figs to drop in sector"
	gosub :BOT~help_file

	setVar $BOT~script_title "Planet Gridder"
	gosub :BOT~banner


	if ($parm1 > 0)
		setVar $fighterDrop $parm1
	else
		setVar $fighterDrop 1
	end

	gosub :PLAYER~quikstats

	setVar $location $PLAYER~CURRENT_PROMPT
	setVar $homeSector $PLAYER~CURRENT_SECTOR
	setVar $lastDestination 1

	send "c;q"
	waitFor "Offensive Odds:"
	getWordPos CURRENTLINE $pos "Offensive"
	cutText CURRENTLINE $oddline $pos 99
	getText $oddline $offodd "Odds:" ":1"
	stripText $offodd " "
	stripText $offodd "."
	waitFor "Mine Max:"
	getText CURRENTLINE $maxMines "Mine Max:" "B"
	stripText $maxMines " "
	waitFor "Figs Per Attack:"
	getWord CURRENTLINE $figs 5
	multiply $offodd $figs
	divide $offodd 12
	setVar $max_figs $FIGHTERS

	:getplanetnum
		send "qD"
		waitOn "Planet #"
		getWord CURRENTLINE $PLANET~planet 2
		stripText $planet "#"
		saveVar $planet~planet
		send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*c "
	

		:inac
		if (($PLAYER~unlimitedGame = FALSE) AND ($PLAYER~TURNS <= $BOT~bot_turn_limit))
			setVar $SWITCHBOARD~message "Turns too low to continue.*"
			gosub :SWITCHBOARD~switchboard
			goto :done
		end
		setArray $checked SECTORS
		:tryAgain
		killtrigger again
		killtrigger done
		setVar $bottom 1
		setVar $top 1
		getRnd $randomSector 11 SECTORS
		setVar $que[1] $randomSector
		setVar $checked[$randomSector] 1
		while ($bottom <= $top)
			# Now, pull out the next sector in the que, and make it our focus
			setVar $focus $que[$bottom]
			getSectorParameter $focus "FIGSEC" $isFigged
			setVar $checked[$focus] TRUE
			if ($isFigged = 0)
				setVar $a 1
				while (SECTOR.WARPSIN[$focus][$a] > 0)
					setVar $adjacent SECTOR.WARPSIN[$focus][$a]
					getSectorParameter $adjacent "FIGSEC" $isFigged
					if ($isFigged = TRUE)
						setVar $travelTo $focus
						setVar $nearfig $adjacent
						setVar $checked[$nearfig] TRUE
						goto :continue
					end
					add $a 1	
				end
			end
			setVar $nearfig 0
			# That wasn't it, so let's add all the adjacents to the que for future testing.
			setVar $a 1
			while (SECTOR.WARPS[$focus][$a] > 0)
				setVar $adjacent SECTOR.WARPSIN[$focus][$a]
				# But only add them if they haven't been added previously
				if ($adjacent > 0)
					if ($checked[$adjacent] = 0)
						# Okay, this one hasn't been checked, so tag it and que it.
						setVar $checked[$adjacent] 1
						add $top 1
						setVar $que[$top] $adjacent
					end
				end
				add $a 1
			end
			# The adjacents of $focus were all queued, now on to the next one.
			add $bottom 1
		end	
		setVar $SWITCHBOARD~message "Can't find a route to any other gridding sectors.*"
		gosub :SWITCHBOARD~switchboard
     	goto :done
		:continue
			if ($NearFig > 0)
				killtrigger warped
				killtrigger same
				killtrigger didnotwarp
				killtrigger notEnoughFuel
				send "p"&$nearfig&"*y"
				setTextLineTrigger warped :emptyPort "-=-=-=- Planetary TransWarp Drive Engaged! -=-=-=-"
				setTextLineTrigger same :emptyPort "You are already in that sector!"
				setTextLineTrigger didnotwarp :noFigAtLocation "Your own fighters must be in the destination to make a safe jump."
				setTextLineTrigger notEnoughFuel :done "You do not have enough Fuel Ore on this planet to make the jump."
				pause			
				:emptyPort
					killtrigger warped
					killtrigger same
					killtrigger didnotwarp
					killtrigger notEnoughFuel
					setSectorParameter $nearfig "FIGSEC" TRUE

					send "q q sdsh* l "&$PLANET~PLANET&"* m * * * c  " 
					waitFor "Relative Density Scan"
					waitFor "Long Range Scan"
					waitFor "[" & $nearfig & "]"
					setVar $boomsec $travelTo
					getDistance $distance $nearfig $boomsec
					getDistance $distanceback $boomsec $nearfig 
					gosub :PLAYER~quikstats
					setVar $containsShieldedPlanet FALSE
					setVar $i 1
					while ($i <= SECTOR.PLANETCOUNT[$boomsec])
						getWord SECTOR.PLANETS[$boomsec][$i] $test 1
						if ($test = "<<<<")
							setVar $containsShieldedPlanet TRUE
						end
						add $i 1
					end
					setVar $figowner SECTOR.FIGS.OWNER[$boomsec]
					setVar $figCount SECTOR.FIGS.QUANTITY[$boomsec]
					getWord $figOwner $alienCheck 1
					lowerCase $alienCheck
					setVar $mineOwner SECTOR.MINES.OWNER[$boomsec]
					setVar $mineCount SECTOR.MINES.QUANTITY[$boomsec]
					if (SECTOR.PLANETCOUNT[$boomsec] > 0)
						setVar $i 1
						while ($i <= SECTOR.PLANETCOUNT[$boomsec])
							setVar $output $output&"    "&SECTOR.PLANETS[$boomsec][$i]&#13
							add $i 1
						end
						setVar $i 1
						while ($i <= SECTOR.TRADERCOUNT[$boomsec])
							setVar $output $output&"    "&SECTOR.TRADERS[$boomsec][$i]&#13
							add $i 1
						end
						setVar $output $output&SECTOR.FIGS.QUANTITY[$boomsec]&" figs owned by: "&SECTOR.FIGS.OWNER[$boomsec]&#13
						setVar $output "'"&#13&"WARNING - Planet(s) Detected - Sector "&$boomsec&#13&$output&#13&" "&#13&" "
					elseif (SECTOR.TRADERCOUNT[$boomsec] > 0)
						setVar $i 1
						while ($i <= SECTOR.TRADERCOUNT[$boomsec])
							setVar $output $output&"    "&SECTOR.TRADERS[$boomsec][$i]&#13
							add $i 1
						end
						setVar $output $output&SECTOR.FIGS.QUANTITY[$boomsec]&" figs owned by: "&SECTOR.FIGS.OWNER[$boomsec]&#13
						setVar $output "'"&#13&"WARNING - Trader(s) Detected - Sector "&$boomsec&#13&$output&#13&" "&#13&" "
					elseif ($distance <> 1)
						setVar $output "'WARNING - Sector not Adj (Sector "&$boomsec&")"&#13
					elseif ($boomsec <= 10) or ($boomsec = STARDOCK)
						setVar $output "'WARNING - Fed Sector Adj (Sector "&$boomsec&")"&#13
					elseif (SECTOR.FIGS.QUANTITY[$boomsec] >= ($offodd*2))
						setVar $output "'WARNING - "&SECTOR.FIGS.QUANTITY[$boomsec]&" figs owned by: "&SECTOR.FIGS.OWNER[$boomsec]&" - Sector "&$boomsec&#13
					else
						setVar $output ""
					end
	
					if (((($avoidShieldedOnly = TRUE) AND ($containsShieldedPlanet = FALSE)) OR (SECTOR.PLANETCOUNT[$boomsec] <= 0)) and (SECTOR.TRADERCOUNT[$boomsec] <= 0) and ($distance = 1) and ($boomsec > 10) and ($boomsec <> STARDOCK) and ((($attackretreat = TRUE) AND ($distanceback = 1) AND (SECTOR.FIGS.QUANTITY[$boomsec] >= ($offodd*2))) OR (SECTOR.FIGS.QUANTITY[$boomsec] < ($offodd*2))))
						if ((SECTOR.anomaly[$boomsec] = TRUE) and ($isLimped = FALSE))
							setVar $imlimped TRUE
						end

						send "'"&$SWITCHBOARD~bot_name&" pgrid "&$travelTo&" f:"&$fighterDrop&" scan*"
						setTextLineTrigger done :done "Unsuccessful P-grid into sector " & $travelTo & ". Someone make sure bot is picked up."
						setTextLineTrigger again :success "Successfully P-gridded into sector " & $travelTo
						pause
						:noFigAtLocation
							killtrigger warped
							killtrigger same
							killtrigger didnotwarp
							killtrigger notEnoughFuel
							setSectorParameter $nearfig "FIGSEC" FALSE
							goto :report
						:success
							killtrigger done
							setSectorParameter $travelTo "FIGSEC" TRUE
							goto :report
						:done
							killalltriggers
							setVar $SWITCHBOARD~message "Planet Gridder halting*"
							gosub :SWITCHBOARD~switchboard
							halt
					end

				:report				
					if ($output <> "")
						send $output
					end
					goto :tryAgain
			end











#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
include "source\bot_includes\planet"
include "source\bot_includes\ship"
include "source\bot_includes\map"
include "source\bot_includes\sector"
