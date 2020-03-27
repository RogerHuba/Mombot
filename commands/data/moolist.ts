#	Get list of sectors that are surround

#a#sk how many we want to upgrade - order by MCIC

#get surround sectors

#Make list of sectors

#their our targets, some to grid, some to mine/limp only

#calc cost and go

	
	logging off
	clearAllAvoids
	gosub :BOT~loadVars
	loadvar $MAP~STARDOCK
	loadvar $map~home_sector


	setVar $BOT~help[1]  $BOT~tab&"   Looks for BXX ports with a MCIC above requested "
	setVar $BOT~help[2]  $BOT~tab&"       "
	setVar $BOT~help[3]  $BOT~tab&"   moolist [PROD] [MCIC] {port}"
	setVar $BOT~help[4]  $BOT~tab&"       "
	setVar $BOT~help[5]  $BOT~tab&"   [PROD] - f/o/e product to test against"
	setVar $BOT~help[5]  $BOT~tab&"   [MCIC] - MCIC Min - Positive Value 65 NOT -65"
	setVar $BOT~help[5]  $BOT~tab&"   {port} - BBB XXB - defaults primary product only"
	setVar $BOT~help[5]  $BOT~tab&"    Must run FIGS, CIM, MSL and LISTAMTRAK first."
	setVar $BOT~help[6]  $BOT~tab&"   This will then exclude sectors near MSL from being"
	setVar $BOT~help[7]  $BOT~tab&"   on our XMas list. "
	setVar $BOT~help[9]  $BOT~tab&"       "
	setVar $BOT~help[10]  $BOT~tab&"   MCIC from Planet Neg Param ORE-MCIC or Ephaggle FUEL-"
	setVar $BOT~help[11]  $BOT~tab&"   "
	setVar $BOT~help[12]  $BOT~tab&"   F: Has fighter - Yes/No"
	setVar $BOT~help[13]  $BOT~tab&"   M: Recorded MCIC Value"
	setVar $BOT~help[14]  $BOT~tab&"   UP: Does port already have > 3k buy"
	setVar $BOT~help[15]  $BOT~tab&"   T: Distance to Terra"
	setVar $BOT~help[16]  $BOT~tab&"   SD: Distance to SD"
	setVar $BOT~help[17]  $BOT~tab&"   D: Incoming sectors with no fighters "
	
	
	gosub :bot~helpfile

	setVar $BOT~script_title "Moo List"
	gosub :BOT~banner


	setvar $line $bot~user_command_line


	setVar $find_product $bot~parm1
	setVar $portClassOk 8

	if ($find_product <> "e") and ($find_product <> "o") and ($find_product <> "f")
		setvar $switchboard~message "First Parameter should be f/o/e.**"
		gosub :switchboard~switchboard
		halt
	end


	setVar $find_mcic_value $bot~parm2
	isNumber $number $find_mcic_value

	if ($number <> 1)
		setvar $switchboard~message "Please enter a MCIC value i.e. 65 gives 50% of ports for Fuel.**"
		gosub :switchboard~switchboard
		halt
	
	end
	
	if ($find_mcic_value = 0)
		setVar $SWITCHBOARD~message "Need a min MCIC value i.e. 65 gives 50% of ports for Fuel.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	
	
    if ($find_product = "e")
        setVar $portFilter "XXB"
        if ($find_mcic_value > 65) or ($find_mcic_value < 20)
            setVar $SWITCHBOARD~message "Equipment MCIC should be between 20 and 65.*"
            gosub :SWITCHBOARD~switchboard
            halt
        end
    end
	 if ($find_product = "o")
     setVar $portFilter "XBX"
        if ($find_mcic_value > 75) or ($find_mcic_value < 30)
            setVar $SWITCHBOARD~message "Equipment MCIC should be between 30 and 75.*"
            gosub :SWITCHBOARD~switchboard
            halt
        end
    end
	 if ($find_product = "f")
        setVar $portFilter "BXX"
        if ($find_mcic_value > 90) or ($find_mcic_value < 40)
            setVar $SWITCHBOARD~message "Equipment MCIC should be between 90 and 40.*"
            gosub :SWITCHBOARD~switchboard
            halt
        end
    end

    if ($find_mcic_value > 0)
		setVar $find_mcic_value (0 - $find_mcic_value)
	end

    if ($bot~parm3 <> "")
        setVar $portClassOK 0
        setVar $portFilter $bot~parm3
        setVar $tword $portFilter
        uppercase $tword
        cutText $tword $f 1 1
        cutText $tword $o 2 1
        cutText $tword $e 3 1
        if (($f = "B") or ($f = "X"))
            if (($o = "B") or ($o = "X"))
                if (($e = "B") or ($e = "X"))
                    setVar $portClassOK 1
                end
            end
        end
        if ($portClassOk = 0)
            setVar $SWITCHBOARD~message "Port Class Filter should be BBB XXB BXB etc.*"
            gosub :SWITCHBOARD~switchboard
            halt
        end
    end
	setVar $SWITCHBOARD~message "Searching for ports (" & $portFilter & ") with a MCIC below " & $find_mcic_value & " *"

    

	gosub :SWITCHBOARD~switchboard

    goSub :checkPortRequirements

    setVar $go 1
    setVar $i 2
    while ($go = 1)
        if (PORT.EXISTS[$i] = 1)
            setVar $go 0
            setVar $controlPort $i
        end
        add $i 1
    end
	setVar $portcontrol PORT.UPDATED[$controlPort] 
	getWord $portcontrol $front1 1
	getWord $portcontrol $front2 2
	getWord $portcontrol $rearchk 3
	getWordPos $front2 $slash ":"

	cutText $front2 $front3 1 ($slash - 1)
	setVar $frontchk ($front1 & " " & $front3)


	setVar $foundSectors 0
	setVar $foundFigged 0
	setVar $foundMCIC 0
	setVar $foundDistTerra 0
	setVar $foundDistSD 0
	setVar $foundDangerReport 0
	setVar $portUpgraded 0
	setVar $foundi 0

	setVar $ready ""
	setVar $readyi 0

	setVar $readyPort ""
	setVar $readyPorti 0

	setVar $countAmtrak 0
	setVar $countMslSec 0

	setvar $i 1
	while ($i <= sectors)
	
		getSectorParameter $i "FIGSEC" $isFigged
	

        if ($find_product = "f")
            # EP FIRST
            getSectorParameter $i "FUEL-" $mcic
            if ($mcic = "")
                # Internal Second
                getSectorParameter $i "ORE-MCIC" $mcic
            end
        end

        if ($find_product = "o")
            # EP FIRST
            getSectorParameter $i "ORGANICS-" $mcic
            if ($mcic = "")
                # Internal Second
                getSectorParameter $i "ORG-MCIC" $mcic
            end
        end

        if ($find_product = "e")
            # EP FIRST
            getSectorParameter $i "EQUIPMENT-" $mcic
            if ($mcic = "")
                # Internal Second
                getSectorParameter $i "EQU-MCIC" $mcic
            end
        end

		getSectorParameter $i "AMTRAK" $amtrak
		getSectorParameter $i "MSLSEC" $mslsec
		
		if ($amtrak = true)
			add $countAmtrak 1
		end
		if ($mslsec = true)
			add $countMslSec 1
		end
        setVar $portClassPass 0
		if ($portClassOk[PORT.CLASS[$i]] = 1)
            setVar $portClassPass 1
        end
		setVar $goodport 1

		if ($mcic <> "")
           
			if (($mcic <= $find_mcic_value) and ($mslsec <> true) and ($amtrak  <> true) and ($portClassPass = 1))
	
				getDistance $distanceT 1 $i
				getDistance $distanceSD $MAP~STARDOCK $i
				if ($distanceT <= 0)
					send "^f1*"&$i&"*q"
					waitOn "ENDINTERROG"
					getDistance $distanceT 1 $i
				end
				
				if ($distanceSD <= 0)
					send "^f"&$MAP~STARDOCK&"*"&$i&"*q"
					waitOn "ENDINTERROG"
					getDistance $distanceSD $MAP~STARDOCK $i
				end

				if ($distanceSD < 6)
					setVar $goodport 0
				end
				if ($distanceT < 6)
					setVar $goodport 0
				end

				add $foundi 1
				setVar $foundSectors[$foundi] $i
				if ($isFigged = true)
					setVar $foundFigged[$foundi] "Yes"
				else
					setVar $foundFigged[$foundi] "No"
					setVar $goodport 0
				end
				setVar $foundMCIC[$foundi] $mcic
				setVar $foundDistTerra[$foundi] $distanceT
				setVar $foundDistSD[$foundi] $distanceSD

				setVar $di 1
				setVar $danger 0
				setVar $dangerreport ""
				
				setVar $portReportDanger 0
				while ($di <= SECTOR.WARPINCOUNT[$i])
					getSectorParameter SECTOR.WARPSIN[$i][$di] "FIGSEC" $hasFig
					if ($hasFig = 0)
						add $danger 1
						if ($danger > 1)
							setVar $dangerreport $dangerreport &", " & SECTOR.WARPSIN[$i][$di]
						else
							setVar $dangerreport SECTOR.WARPSIN[$i][$di]
						end
						if (PORT.EXISTS[SECTOR.WARPSIN[$i][$di]])
				
							cutText PORT.UPDATED[SECTOR.WARPSIN[$i][$di]] $test1 1 $frontlen
							getWord PORT.UPDATED[SECTOR.WARPSIN[$i][$di]] $test2 3
	
							if (($test1 = $frontchk) or ($test2 = $rearchk))
								#echo SECTOR.WARPSIN[$i][$di] " ok*"
								setVar $dangerreport $dangerreport & "(r)"
							else
								setVar $portReportDanger 1
								
							end
						else
							setVar $portReportDanger 1
						end
					end
					add $di 1
				end
				if ($danger > 0)
					setVar $foundDangerReport[$foundi] "(" & $danger & ") " & $dangerreport
					#setVar $goodport 0
				else
					setVar $foundDangerReport[$foundi] ""
				end
                if ($find_product = "f")
                    if (PORT.FUEL[$i] > 3000)
                        setVar $portUpgraded[$foundi] "Yes"
                        setVar $goodport 0
                    else
                        setVar $portUpgraded[$foundi] "No"
                    end
                elseif ($find_product = "o")
                    if (PORT.ORG[$i] > 3000)
                        setVar $portUpgraded[$foundi] "Yes"
                        setVar $goodport 0
                    else
                        setVar $portUpgraded[$foundi] "No"
                    end
                elseif ($find_product = "e")
                    if (PORT.EQUIP[$i] > 3000)
                        setVar $portUpgraded[$foundi] "Yes"
                        setVar $goodport 0
                    else
                        setVar $portUpgraded[$foundi] "No"
                    end
                end

echo "*#" $i " g:" $goodport " $d:" $danger " Pr:" $portReportDanger " " SECTOR.EXPLORED[$i]

				if (($goodport = 1) and ($danger = 0))
					add $readyi 1
					if ($readyi > 1)
						setVar $ready $ready & ", " & $i
						if ($readyi > 9)
							setVar $ready $ready & "*"
							setVar $readyi 0
						end
					else
						setVar $ready $ready & $i
					end
				elseif (($goodport = 1) and ($portReportDanger = 0))
					add $readyPorti 1
					if ($readyPorti > 1)
						setVar $readyPort $readyPort & ", " & $i
						if ($readyPorti > 9)
							setVar $readyPort $readyPort & "*"
							setVar $readyPorti 0
						end
					else
						setVar $readyPort $readyPort & $i
					end
				end
			else
				setVar $goodport 0
			end
		else
			setVar $goodport 0
		end
		add $i 1
	end
	
	setVar $i 1
	
	setVar $SWITCHBOARD~message "  *"

	while ($i <= $foundi)
		setVar $SWITCHBOARD~message $SWITCHBOARD~message & "S: " &  $foundSectors[$i] & " F: " & $foundFigged[$i] & " M: " & $foundMCIC[$i]
		setVar $SWITCHBOARD~message $SWITCHBOARD~message & " UP: " & $portUpgraded[$i] & " T: " & $foundDistTerra[$i]&  " SD: " & $foundDistSD[$i]
		if (foundDangerReport[$i] <> "")
			setVar $SWITCHBOARD~message $SWITCHBOARD~message & " d: " & $foundDangerReport[$i] & "*"
		end
		add $i 1
	end

	setVar $SWITCHBOARD~message $SWITCHBOARD~message & "*"
	gosub :SWITCHBOARD~switchboard

	setVar $SWITCHBOARD~message "Ready Ports: " & $ready & "**"
	gosub :SWITCHBOARD~switchboard

	#setVar $SWITCHBOARD~message "Port Report Ready: " & $readyPort & "**"
	#gosub :SWITCHBOARD~switchboard


	setVar $SWITCHBOARD~message "DID WE DO MSL/LISTAMTRAK? MSL SECS: " & $countMslSec & " AMTRAK SECS: " & $countAmtrak & "*"
	gosub :SWITCHBOARD~switchboard


halt



:checkPortRequirements

	# Mark them all ok, and we'll rule them out
	setVar $pi 1
	while ($pi <= 8)
		setVar $portClassOk[$pi] 1
		add $pi 1
	end

	setVar $tword $portFilter
	uppercase $tword
	cutText $tword $f 1 1
	cutText $tword $o 2 1
	cutText $tword $e 3 1
	
	# 0 - zzz
	# 1 - BBS
	# 2 - BSB
	# 3 - SBB
	# 4 - SSB
	# 5 - SBS
	# 6 - BSS
	# 7 - SSS
	# 8 - BBB

	if ($f = "B")
		setVar $portClassOk[3] 0
		setVar $portClassOk[4] 0
		setVar $portClassOk[5] 0
		setVar $portClassOk[7] 0
	end
		
	if ($o = "B")
		setVar $portClassOk[2] 0
		setVar $portClassOk[4] 0
		setVar $portClassOk[6] 0
		setVar $portClassOk[7] 0
	end
			
	if ($e = "B")
		setVar $portClassOk[1] 0
		setVar $portClassOk[5] 0
		setVar $portClassOk[6] 0
		setVar $portClassOk[7] 0
	end
	
return


#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
