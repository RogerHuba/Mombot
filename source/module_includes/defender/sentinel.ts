:activate
	send "clvq"
	gosub :CheckCLV
	gosub :CheckOnline
	gosub :switchboard~switchboard
return



:checkclv
	getDate $date
	getTime $time
	setVar $date $date & " "
	setvar $broadcast true

	if ($CheckCLVPod = "0")
		setVar $CheckCLVPod #42 & #42 & #42 & " Escape Pod " & #42 & #42 & #42
	end

	setVar $CLVFigsHit 0

	setTextLineTrigger CLVBeginCheck :CLVBeginCheck "--- ---------------------"
	pause

	:CLVBeginCheck
		setTextLineTrigger CLVCheck :CLVCheck
		pause

	:CLVCheck
		getLength CURRENTLINE $CLVLen

		if ($CLVLen >= 61)
			cutText CURRENTLINE $CLVPlyr 30 31

			# shave the spaces off the name
			setVar $CLVPlayer ""
			setVar $CLVWord 1
			:CLVWord
				getWord $CLVPlyr $CLVPWord $CLVWord
				if ($CLVPWord <> 0)
					if ($CLVWord = 1)
						setVar $CLVPlayer $CLVPWord
					else
						setVar $CLVPlayer $CLVPlayer & " " & $CLVPWord
					end
					add $CLVWord 1
					goto :CLVWord
				end

				setVar $CLVLRank[$CLVPlayer] $CLVRank[$CLVPlayer]
				setVar $CLVLAlign[$CLVPlayer] $CLVAlign[$CLVPlayer]
				setVar $CLVLCorp[$CLVPlayer] $CLVCorp[$CLVPlayer]
				setVar $CLVLShip[$CLVPlayer] $CLVShip[$CLVPlayer]

				getWord CURRENTLINE $CLVRank[$CLVPlayer] 2
				getWord CURRENTLINE $CLVAlign[$CLVPlayer] 3
				getWord CURRENTLINE $CLVCorp[$CLVPlayer] 4
				cutText CURRENTLINE $CLVShip[$CLVPlayer] 61 999

				stripText $CLVRank[$CLVPlayer] ","
				stripText $CLVAlign[$CLVPlayer] ","

				if ($CLVCorp[$CLVPlayer] <> #42 & #42)
					add $CLVCorpNum[$CLVCorp[$CLVPlayer]] 1

					add $CLVCorpBaseAlign[$CLVCorp[$CLVPlayer]] $CLVAlign[$CLVPlayer]

					if ($CLVCorp[$CLVPlayer] > $CLVHighestCorp)
						setVar $CLVHighestCorp $CLVCorp[$CLVPlayer]
					end
				end

				setVar $CLVRawName $CLVPlayer & "(" & $CLVCorp[$CLVPlayer] & ")"

				if ($Colour = "1")
					if ($CLVAlign[$CLVPlayer] < 0)
						setVar $CLVClr #3 & "4" & $CLVPlayer & #3 & "6(" & $CLVCorp[$CLVPlayer] & ")"
					else
						setVar $CLVClr #3 & "12" & $CLVPlayer & #3 & "6(" & $CLVCorp[$CLVPlayer] & ")"
					end
				else
					setVar $CLVClr $CLVRawName
				end
				setvar $switchboard~message ""
				if ($CLVInit = 0)
					# first check pass, don't report - just save stuff
					setVar $CLV[$CLVCount] $CLVPlayer
					add $CLVCount 1
				else
					# check pass - compare and report

					if ($CLVShip[$CLVPlayer] <> $CLVLShip[$CLVPlayer])
						# ship has changed
						if ($logfile <> "0")
							write $logfile $time & " - CLV: " & $CLVClr & " is now in " & $CLVShip[$CLVPlayer]
						end
						setvar $switchboard~message $switchboard~message&"CLV: " & $CLVRawName & " is now in " & $CLVShip[$CLVPlayer] & "*"
					end
					if ($CLVCorp[$CLVPlayer] <> $CLVLCorp[$CLVPlayer])
						# corp has changed
						if ($logfile <> "0")
							write $logfile $time & " - CLV: " & $CLVClr & " has jumped from corp " & $CLVLCorp[$CLVPlayer]
						end
						setvar $switchboard~message $switchboard~message&"CLV: " & $CLVRawName & " has jumped from corp " & $CLVLCorp[$CLVPlayer] & "*"
					end
					if ($CLVRank[$CLVPlayer] <> $CLVLRank[$CLVPlayer]) or ($CLVAlign[$CLVPlayer] <> $CLVLAlign[$CLVPlayer])
						if ($CLVRank[$CLVPlayer] < $CLVLRank[$CLVPlayer]) and ($CLVLAlign[$CLVPlayer] < "-100") and ($CLVShip[$CLVPlayer] <> "# Ship Destroyed #") and ($CLVShip[$CLVPlayer] <> $pod)
							# player busted
							if ($CheckCLVDetail = "1")
								if ($logfile <> "0")
									write $logfile $time & " - CLV: " & $CLVClr & " has busted"
								end
								setvar $switchboard~message $switchboard~message&"CLV: " & $CLVRawName & " has busted" & "*"
							end
						else
							setVar $CLVCashing 0
							if ($CLVRank[$CLVPlayer] > $CLVLRank[$CLVPlayer]) and ($CLVAlign[$CLVPlayer] < $CLVLAlign[$CLVPlayer]) and ($CLVLAlign[$CLVPlayer] < "-100")
								setVar $CLVRChange $CLVRank[$CLVPlayer]
								subtract $CLVRChange $CLVLRank[$CLVPlayer]
								setVar $CLVChange $CLVAlign[$CLVPlayer]
								subtract $CLVChange $CLVLAlign[$CLVPlayer]

								# player is cashing
								setVar $CLVCashing 1
								if ($CheckCLVDetail = "1")
									if ($logfile <> "0")
										write $logfile $time & " - CLV: " & $CLVClr & " is cashing (+" & $CLVRChange & " xp, " & $CLVChange & " algn)"
									end
									setvar $switchboard~message $switchboard~message&"CLV: " & $CLVRawName & " is cashing (+" & $CLVRChange & " xp, " & $CLVChange & " algn)*"
								end
							end

							if ($CLVRank[$CLVPlayer] <> $CLVLRank[$CLVPlayer]) and ($CLVCashing = 0)
								# experience has changed
								setVar $CLVChange $CLVRank[$CLVPlayer]
								subtract $CLVChange $CLVLRank[$CLVPlayer]
								if (($CheckCLVDetail = "1") or (($CheckCLVDetail = "2") and (($CLVChange >= "25") or ($CLVChange <= "-25"))))
									if ($CLVChange > 0)
										setVar $CLVChange "+" & $CLVChange
									end
									if ($logfile <> "0")
										write $logfile $time & " - CLV: " & $CLVClr & " has changed experience (" & $CLVChange & ")"
									end
									setvar $switchboard~message $switchboard~message&"CLV: " & $CLVRawName & " has changed experience (" & $CLVChange & ")*"
								end
							end
							if ($CLVAlign[$CLVPlayer] <> $CLVLAlign[$CLVPlayer]) and ($CLVCashing = 0)
								# align has changed
								setVar $CLVChange $CLVAlign[$CLVPlayer]
								subtract $CLVChange $CLVLAlign[$CLVPlayer]

								setVar $CLVFigCorp 0

								if ($CheckCLVFigCorp > 0) and ($CLVCorpAlign[$CheckCLVFigCorp] > 0)
									# find an alignment match with corp figs
									setVar $CLVX $CLVChange
									multiply $CLVX 100
									divide $CLVX $CLVCorpAlign[$CheckCLVFigCorp]
									setVar $CLVZ $CLVX
									divide $CLVZ 100
									multiply $CLVZ 100
									subtract $CLVX $CLVZ

									if ($CLVX < 0)
										multiply $CLVX "-1"
									end

									if (($CLVX <= 1) or ($CLVX >= 99)) and ((($CLVCorpAlign[6] < 0) and ($CLVChange < 0)) or (($CLVCorpAlign[6] > 0) and ($CLVChange > 0))) and ($CLVZ > 0)
										setVar $CLVFigCorp 1
									end
								end

								if ($CLVFigCorp = 0)
									if (($CheckCLVDetail = "1") or (($CheckCLVDetail = "2") and (($CLVChange >= "25") or ($CLVChange <= "-25"))))
										if ($CLVChange > 0)
											setVar $CLVChange "+" & $CLVChange
										end

										if ($logfile <> "0")
											write $logfile $time & " - CLV: " & $CLVClr & " has shifted alignment (" & $CLVChange & ")"
										end
										setvar $switchboard~message $switchboard~message&"CLV: " & $CLVRawName & " has shifted alignment (" & $CLVChange & ")*"
									end
								else
									setVar $FigsHit 1

									if ($CLVChange > 0)
										setVar $CLVChange "+" & $CLVChange
									end

									if ($logfile <> "0")
										write $logfile $time & " - CLV: " & $CLVClr & " may be shooting our figs (" & $CLVChange & " align)"
									end
									setvar $switchboard~message $switchboard~message&"CLV: " & $CLVRawName & " may be shooting corp " & $CheckCLVFigCorp & " figs (" & $CLVChange & " align)"
								end
							end
						end
					end
				end
		else
			getWord CURRENTLINE $CLVTest 1
			if ($CLVTest = "==--") or ($CLVTest = "Computer")
				setVar $CLVCorp $CLVHighestCorp
				:CLVNextCorp
					if ($CLVCorp > 0)
						if ($CLVCorpNum[$CLVCorp] > 0)
							divide $CLVCorpBaseAlign[$CLVCorp] $CLVCorpNum[$CLVCorp]
							setVar $CLVCorpAlign[$CLVCorp] $CLVCorpBaseAlign[$CLVCorp]
							divide $CLVCorpAlign[$CLVCorp] 10000
							multiply $CLVCorpAlign[$CLVCorp] "-1"
							setVar $CLVCorpBaseAlign[$CLVCorp] 0
							setVar $CLVCorpNum[$CLVCorp] 0
						end
						subtract $CLVCorp 1
						goto :CLVNextCorp
					end	

					setVar $CLVInit 1
					return
			end
		end

goto :CLVBeginCheck

# SUB:       ClearData
# Purpose:   Clears all CLV data for a clean re-check

:ClearData
# sys_check

setVar $count 1
:next
	if ($LastPlayer[$count] <> 0)
		setVar $LastPlayer[$count] 0
		add $count 1
		goto :next
	end

return


:CheckOnline
	# sys_check

	send "#"
	setTextLineTrigger pause5 :pause5 "     Who's Playing     "
	pause

	:pause5
		killTrigger checkFailed
		setVar $Count 1
		setTextLineTrigger GetPlayer :GetPlayer
		pause
  
:GetPlayer
  
	if (CURRENTLINE = "")
		if ($Count = 1)
			setTextLineTrigger GetPlayer :GetPlayer
			pause
		else
			goto :GotPlayers
		end
	end
  
	setVar $StripRankPlayer CURRENTLINE
	gosub :StripRank
  
	setVar $StripCorpPlayer $StripRankPlayer
	gosub :StripCorp
  
	setVar $Player $StripCorpPlayer
  
	# see if the player exists
	setVar $I 1
	setVar $Found 0
	:NextPlayer
		if ($LastPlayers[$I] <> 0)
			if ($LastPlayers[$I] = $Player)
				setVar $Found 1
			end
			add $I 1
			goto :NextPlayer
		end
  
	if ($Found = 0) and ($CheckOnlineInit = 1)
		setvar $switchboard~message $switchboard~message&"ONLINEUPDATE: "&$Player&" has entered the game*"
	end
  
	setVar $Players[$Count] $Player
	add $Count 1
	setTextLineTrigger GetPlayer :GetPlayer
	pause
  
	:GotPlayers
	setVar $Players[$Count] 0

	# check for missing players
	setVar $Count 1
  
  :CheckNextPlayer
  if ($LastPlayers[$Count] <> 0)
    setVar $I 1
    setVar $Found 0
    
    :CheckNextPlayer2
    if ($Players[$I] <> 0)
      if ($Players[$I] = $LastPlayers[$Count])
        setVar $Found 1
      end
      add $I 1
      goto :CheckNextPlayer2
    end
    
	if ($Found = 0)
		setvar $switchboard~message $switchboard~message&"ONLINEUPDATE: "&$LastPlayers[$Count]&" has left the game*"
	end
    
    add $Count 1
    goto :CheckNextPlayer
  end
  
  # copy old new list over old one
  setVar $Count 1
  
  :GetNextPlayer
  if ($Players[$Count] <> 0)
    setVar $LastPlayers[$Count] $Players[$Count]
    add $Count 1
    goto :GetNextPlayer
  end
  
  setVar $LastPlayers[$Count] 0
  setVar $CheckOnlineInit 1

  # output results #
  return

:StripRank
  # sys_check
  
  cutText $StripRankPlayer $Rank 1 6 
  if ($Rank = "Robber")
    cutText $StripRankPlayer $StripRankPlayer 8 999
    return
  end
  if ($Rank = "Pirate")
    cutText $StripRankPlayer $StripRankPlayer 8 999
    return
  end
  if ($Rank = "Ensign")
    cutText $StripRankPlayer $StripRankPlayer 8 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 7 
  if ($Rank = "Captain")
    cutText $StripRankPlayer $StripRankPlayer 9 999
    return
  end
  if ($Rank = "Admiral")
    cutText $StripRankPlayer $StripRankPlayer 9 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 8
  if ($Rank = "Civilian")
    cutText $StripRankPlayer $StripRankPlayer 10 999
    return
  end
  if ($Rank = "Corporal")
    cutText $StripRankPlayer $StripRankPlayer 10 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 9 
  if ($Rank = "Annoyance")
    cutText $StripRankPlayer $StripRankPlayer 11 999
    return
  end
  cutText $StripRankPlayer $Rank 1 9 
  if ($Rank = "Terrorist")
    cutText $StripRankPlayer $StripRankPlayer 11 999
    return
  end
  if ($Rank = "Commander")
    cutText $StripRankPlayer $StripRankPlayer 11 999
    return
  end
  if ($Rank = "Commodore")
    cutText $StripRankPlayer $StripRankPlayer 11 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 10 
  if ($Rank = "Prime Evil")
    cutText $StripRankPlayer $StripRankPlayer 12 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 12
  if ($Rank = "1st Sergeant")
    cutText $StripRankPlayer $StripRankPlayer 14 999
    return
  end
  if ($Rank = "Rear Admiral")
    cutText $StripRankPlayer $StripRankPlayer 14 999
    return
  end
  if ($Rank = "Vice Admiral")
    cutText $StripRankPlayer $StripRankPlayer 14 999
    return
  end
  if ($Rank = "Dread Pirate")
    cutText $StripRankPlayer $StripRankPlayer 14 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 13 
  if ($Rank = "Fleet Admiral")
    cutText $StripRankPlayer $StripRankPlayer 15 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 14
  if ($Rank = "Lance Corporal")
    cutText $StripRankPlayer $StripRankPlayer 16 999
    return
  end
  if ($Rank = "Sergeant Major")
    cutText $StripRankPlayer $StripRankPlayer 16 999
    return
  end
  if ($Rank = "Staff Sergeant")
    cutText $StripRankPlayer $StripRankPlayer 16 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 15
  if ($Rank = "Warrant Officer")
    cutText $StripRankPlayer $StripRankPlayer 17 999
    return
  end
  if ($Rank = "Lieutenant J.G.")
    cutText $StripRankPlayer $StripRankPlayer 17 999
    return
  end
  if ($Rank = "Smuggler Savant")
    cutText $StripRankPlayer $StripRankPlayer 17 999
    return
  end
  if ($Rank = "Infamous Pirate")
    cutText $StripRankPlayer $StripRankPlayer 17 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 16
  if ($Rank = "Gunnery Sergeant")
    cutText $StripRankPlayer $StripRankPlayer 18 999
    return
  end
  if ($Rank = "Menace 3rd Class")
    cutText $StripRankPlayer $StripRankPlayer 18 999
    return
  end
  if ($Rank = "Menace 2nd Class")
    cutText $StripRankPlayer $StripRankPlayer 18 999
    return
  end
  if ($Rank = "Menace 1st Class")
    cutText $StripRankPlayer $StripRankPlayer 18 999
    return
  end
  if ($Rank = "Notorious Pirate")
    cutText $StripRankPlayer $StripRankPlayer 18 999
    return
  end
  if ($Rank = "Galactic Scourge")
    cutText $StripRankPlayer $StripRankPlayer 18 999
    return
  end
  if ($Rank = "Heinous Overlord")
    cutText $StripRankPlayer $StripRankPlayer 18 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 17
  if ($Rank = "Private 1st Class")
    cutText $StripRankPlayer $StripRankPlayer 19 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 18 
  if ($Rank = "Nuisance 3rd Class")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  if ($Rank = "Nuisance 2nd Class")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  if ($Rank = "Nuisance 1st Class")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  if ($Rank = "Smuggler 3rd Class")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  if ($Rank = "Smuggler 2nd Class")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  if ($Rank = "Smuggler 1st Class")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  if ($Rank = "Enemy of the State")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  if ($Rank = "Enemy of Humankind")
    cutText $StripRankPlayer $StripRankPlayer 20 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 19 
  if ($Rank = "Enemy of the People")
    cutText $StripRankPlayer $StripRankPlayer 21 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 20 
  if ($Rank = "Lieutenant Commander")
    cutText $StripRankPlayer $StripRankPlayer 22 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 21
  if ($Rank = "Chief Warrant Officer")
    cutText $StripRankPlayer $StripRankPlayer 23 999
    return
  end
  
  cutText $StripRankPlayer $Rank 1 7
  if ($Rank = "Private")
    cutText $StripRankPlayer $StripRankPlayer 9 999
    return
  end
  cutText $StripRankPlayer $Rank 1 8
  if ($Rank = "Sergeant")
    cutText $StripRankPlayer $StripRankPlayer 10 999
    return
  end
  cutText $StripRankPlayer $Rank 1 10 
  if ($Rank = "Lieutenant")
    cutText $StripRankPlayer $StripRankPlayer 12 999
    return
  end
  
  return

:StripCorp
  # sys_check
  
  getLength $StripRankPlayer $Len
  
  if ($Len < 3)
    return
  end
  
  cutText $StripRankPlayer $player~corpData $Len 1
  
  if ($player~corpData = "]")
    subtract $Len 3
    cutText $StripRankPlayer $player~corpData $Len 99
    getWord $player~corpData $player~corpData 1
    StripText $StripRankPlayer " " & $player~corpData
    StripText $player~corpData "["
    StripText $player~corpData "]"
  end
  
return

