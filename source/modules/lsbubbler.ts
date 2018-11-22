    #=--------                                                                       -------=#
     #=--------------------------      LoneStar's BUBBLER     -----------------------------=#
    #=--------                                                                       -------=#
	#		Incep Date	:	July 1, 2008 - Version 1.00
	#		Author		:	LoneStar
	#		TWX			:	TWX 2.04b or TWX 2.04 Final
	#
	#		Credits		:	Credit goes to everyone who ever released a script in Source.
	#						I learned alot, and hopefully this script will, inspire others.
	#
	#		To Run		:	A complete Map/ZTM
	#
	#		Fixes       :	Inital Release
	#
	#		Description	:	Bubble Script. Took me a long, long time to figure out a
	#						method to hunt down bubbles w/o using SWATH. I created
	#						a technique that is -I believe- original and works fairly well.
	#						The only problem is with respect to Large Bubbles --doesn't find em.
	#						It would be interesting to see if someone out there can improve
	#						upon this script.
	#
	#						Method:		- Builds a $WARPS Array while removing all references
	#									  to One-way Warps.
	#									- Scans $WARPS for DE's to be followed until a sector
	#									  with more than 2 adjacents is found --the TAILS Array.
	#									- Hunts through the $TAILS Array looking for other TAILS
	#									  with the same 'head', and merges the Tails Together.
	#									- Additional Passes are done to Merge newly created Tails
	#
	#						Typically each Pass completes within 5mins, in a 20k Sector Universe.
	#
	#						Comments and/or Criticism always appreciated
goto :_START_
:MERGE_TAILS
setVar $IDX 1
setVar $MERGES 0
setVar $MATCH_FOUND FALSE

while ($IDX <= $IDX_INC)
	if ($TAILS[$IDX] <> 0)
		setVar $STR $TAILS[$IDX]
		getWord $STR $FOCUS 1
		setVar $IDY ($IDX + 1)
		while ($IDY <= $IDX_INC)
			if ($TAILS[$IDY] <> 0)
				getWord $TAILS[$IDY] $MATCH 1
				if ($MATCH = $FOCUS)
					setVar $MATCH_FOUND TRUE
					add $MERGES 1
					setVar $TEMP (" " & $TAILS[$IDY])
					replaceText $TEMP (" " & $FOCUS & " ") " "
					setVar $TAILS[$IDX] ($TAILS[$IDX] & $TEMP)
					setVar $TAILS[$IDY] 0
				end
			end
        	add $IDY 1
		end
		if ($MATCH_FOUND)
			setVar $c 1
			setArray $FOUND 7
			setVar $INC 0
			while ($c <= $WARPS[$FOCUS])
				getWordPos $TAILS[$IDX] $POS $WARPS[$FOCUS][$c]
				if ($POS = 0)
					add $INC 1
					setVar $FOUND[$INC] $WARPS[$FOCUS][$c]
				end
				add $c 1
			end
			if ($INC = 1)
				setVar $TAILS[$IDX] ($FOUND[$INC] & " " & $TAILS[$IDX])
			end
			setVar $MATCH_FOUND FALSE
			Echo "*" & $TAG & " MER=" & ANSI_7 & $MERGES &ANSI_15& " IDX="&ANSI_7&$IDX&ANSI_15&"/"&ANSI_7&$IDX_INC
		end
	end
	add $IDX 1
end
return

:BUILD_TAILS
Echo "*"&$TAG&" Growing Bubbles From Pool: " & ANSI_7 & $IDX_INC
setArray $TAILS ($IDX_INC + 1)
setVar $IDX 1
setVar $PTR 1
while ($IDX <= SECTORS)
	if ($WARPS[$IDX] = 1)
		setVar $FOCUS $IDX
		setVar $ADJ $WARPS[$FOCUS][1]

		setVar $TAILS[$PTR] ($ADJ & " " & $IDX)

		while ($WARPS[$ADJ] = 2)
			if ($WARPS[$ADJ][1] <> $FOCUS)
				setVar $FOCUS $ADJ
				setVar $ADJ $WARPS[$FOCUS][1]
			else
				setVar $FOCUS $ADJ
				setVar $ADJ $WARPS[$FOCUS][2]
			end
			#setVar $TAILS[$IDX] ($TAILS[$IDX] & " " & $ADJ)
			setVar $TAILS[$PTR] ($ADJ & " " & $TAILS[$PTR])
		end
		add $PTR 1
	end
	add $IDX 1
end
return

:BUILD_WARPS
setArray $WARPS SECTORS 6
setVar $WARP_COUNT 0
setVar $IDX 1
setVar $IDX_INC 0
Echo "*"&$TAG&" Preparing Warp-Data"
while ($IDX <= SECTORS)
	setVar $FOCUS $IDX
	setVar $i 1
	setVar $ADJ_COUNT 0
	while (SECTOR.WARPS[$FOCUS][$i] <> 0)
		setVar $ADJ SECTOR.WARPS[$FOCUS][$i]
		setVar $ii 1
		while (SECTOR.WARPS[$ADJ][$ii] <> 0)
			if (SECTOR.WARPS[$ADJ][$ii] = $FOCUS)
				add $ADJ_COUNT 1
    			setVar $WARPS[$IDX][$ADJ_COUNT] $ADJ
			end
			add $ii 1
		end
    	add $i 1
	end
	setVar $WARPS[$IDX] $ADJ_COUNT
	if ($ADJ_COUNT = 1)
		add $IDX_INC 1
	end
	add $WARP_COUNT $ADJ_COUNT
	add $IDX 1
end
Echo "*"&$TAG&" Warps Found " & ANSI_7 & $WARP_COUNT
return

:CommaSize
	If ($CashAmount < 1000)
		#do nothing
	ElseIf ($CashAmount < 1000000)
    	getLength $CashAmount $len
		SetVar $len ($len - 3)
		cutText $CashAmount $tmp 1 $len
		cutText $CashAMount $tmp1 ($len + 1) 999
		SetVar $tmp $tmp & "," & $tmp1
		SetVar $CashAmount $tmp
	ElseIf ($CashAmount <= 999999999)
		getLength $CashAmount $len
		SetVar $len ($len - 6)
		cutText $CashAmount $tmp 1 $len
		SetVar $tmp $tmp & ","
		cutText $CashAmount $tmp1 ($len + 1) 3
		SetVar $tmp $tmp & $tmp1 & ","
		cutText $CashAmount $tmp1 ($len + 4) 999
		SetVar $tmp $tmp & $tmp1
		SetVar $CashAmount $tmp
	end
	return

:_START_
	setVar $TAG (ANSI_9 & "["&ANSI_14&"BUBBLER"&ANSI_9&"] " & ANSI_15)
	setVar $STOP (ANSI_9 & "["&ANSI_12&"STOPPED"&ANSI_9&"] " & ANSI_15)
	setVar $FNAME	"BUBBLES_"&GAMENAME&".txt"
	delete $FNAME

	echo "*" & $TAG
	Echo ("*" & $TAG & #196 & #196 & ANSI_7 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & ANSI_7 & #196 & ANSI_15 & #196 & #196)
	echo "*" & $TAG & " LoneStar's TWX Bubble Search"
	echo "*" & $TAG & ANSI_14 & "         Version 1.0"
	Echo ("*" & $TAG & #196 & #196 & ANSI_7 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & ANSI_7 & #196 & ANSI_15 & #196 & #196)
	echo "*" & $TAG

	Echo "*" & $TAG & " Checking MAP"
	setVar $i 1
	setVar $ii 0
	while ($i <= SECTORS)
		if (SECTOR.WARPCOUNT[$i] = 0)
			add $ii 1
		end
		add $i 1
	end
	if ($ii > 10)
		Echo "*" & $TAG & " Map is not Complete."
		Echo "*" & $TAG
		Echo "*" & $STOP
		Echo "*"
	end

	#Create and Populate $WARPS array. All One-ways removed
	gosub :BUILD_WARPS
	#Populate $TAILS array with 'tunnels'. First word being the Head, last word being the Tail (aka DE)
	gosub :BUILD_TAILS

	setVar $MERGES 1
	setVar $PASS 1
	#Scan $TAILS for duplicate 'Heads' and connect them together
	while ($MERGES <> 0)
		Echo ("*" & $TAG & #196 & #196 & ANSI_7 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & ANSI_7 & #196 & ANSI_15 & #196 & #196)
		echo "*" & $TAG & " PASS "&$PASS&" Started, Performing Merge"
		gosub :MERGE_TAILS
		echo "*" & $TAG
		Echo ("*" & $TAG & #196 & #196 & ANSI_7 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & ANSI_7 & #196 & ANSI_15 & #196 & #196)
		echo "*" & $TAG & " MERGES: " & $MERGES & " - PASS "&$PASS&" Complete"
		add $PASS 1
	end
	
	echo "*" & $TAG
	echo "*" & $TAG & " Writing Data To File.."
	echo "*" & $TAG
	setvar $i 1
	while ($i <= $IDX_INC)
		if ($TAILS[$i] <> 0)
			setVar $STR (" " & $TAILS[$i] & " ")
			getWord $STR $GATE 1

			replaceText $STR (" " & $GATE & " ") " "
	
			setVar $WORD_COUNT 0
			setVar $WORD_POINTER 1
			setVar $WORD $STR
			while ($WORD_POINTER <> 0)
				getWord $WORD $WORD_POINTER 1
				if ($WORD_POINTER <> 0)
					replaceText $WORD (" " & $WORD_POINTER & " ") " "
					add $WORD_COUNT 1
				end
			end
			if ($WORD_COUNT > 2)
				stripText $GATE " "
				write $FNAME ("Bubble gate(s)......: " & $GATE)
				write $FNAME ("Bubble size.........: " & $WORD_COUNT)
				getDistance $D $GATE 1
				write $FNAME ("Distance To Terra...: " & $D)
				getDistance $D 1 $GATE
				write $FNAME ("Distance From Terra.: " & $D)
				getDistance $D $GATE STARDOCK
				write $FNAME ("Distance To Dock....: " & $D)
				getDistance $D STARDOCK $GATE
				write $FNAME ("Distance From Dock..: " & $D)
				if (RYLOS <> 0)
				getDistance $D $GATE RYLOS
				write $FNAME ("Distance To RYLOS...: " & $D)
				getDistance $D RYLOS $GATE
				write $FNAME ("Distance From RYLOS.: " & $D)
				end
				if (ALPHACENTAURI <> 0)
				getDistance $D $GATE ALPHACENTAURI
				write $FNAME ("Distance To ALPHA...: " & $D)
				getDistance $D ALPHACENTAURI $GATE
				write $FNAME ("Distance From ALPHA.: " & $D)
				write $FNAME ("Bubble Sectors:")
				write $FNAME ($STR)
				end
				write $FNAME ("  ")
				write $FNAME ("---------------------------------------------------")
				write $FNAME ("  ")
			end
		end
		add $i 1
	end
	fileExists $tst $FNAME
	if ($TST)
		readtoarray $FNAME $BUFFER
		setVar $IDX 1
		setVar $bytes 0
		setVar $lines 0
		while ($IDX <= $BUFFER)
			getLength $BUFFER[$IDX] $LEN
			add $DATA_BYTES ($LEN + 2)
			add $bytes ($LEN + 2)
			add $DATA_LINES	1
			add $lines 1
			add $idx 1
		end
		Echo "*" & $TAG & " File Written: " & ANSI_7 & $FNAME
		setVar $CashAmount $bytes
		gosub :CommaSize
		replaceText $CashAmount "," (ANSI_7 & "," & ANSI_15)
		Echo "*" & $TAG & " File Size : " & ANSI_15 & $CashAmount & ANSI_15 & " bytes"
		setVar $CashAmount $lines
		gosub :CommaSize
		replaceText $CashAmount "," (ANSI_7 & "," & ANSI_15)
		Echo "*" & $TAG & " Lines     : " & ANSI_15 & $CashAmount & ANSI_15 & " lines"
	end
	Echo "*" & $TAG
	Echo ("*" & $TAG & #196 & #196 & ANSI_7 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & #196 & ANSI_7 & #196 & ANSI_15 & #196 & #196)
	Echo "*" & $TAG
	Echo "*" & $STOP & "*"
	halt
