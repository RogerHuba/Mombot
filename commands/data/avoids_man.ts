	gosub :BOT~loadVars
	

       upperCase $bot~parm2
       upperCase $bot~parm3
     


	 setVar $BOT~help[1] $BOT~tab&"Set, clear, or display avoids in Groups"
	 setVar $BOT~help[2] $BOT~tab&" "
	 setVar $BOT~help[3] $BOT~tab&"Store Avoids in Named Groups"
	 setVar $BOT~help[4] $BOT~tab&"   avoids_man [store/clear/recall/list/show] [name] {param}"
	 setVar $BOT~help[5] $BOT~tab&""
	 setVar $BOT~help[6] $BOT~tab&"  store   - Store current in-game avoids to this group."
	 setVar $BOT~help[7] $BOT~tab&"  recall  - Void sectors in this group in-game."
	 setVar $BOT~help[8] $BOT~tab&"            It will clear current avoids first!"
	 setVar $BOT~help[9] $BOT~tab&"  clear   - Clear avoids in group"
	setVar $BOT~help[10] $BOT~tab&"  list    - list of group names"
	setVar $BOT~help[11] $BOT~tab&"  show    - list of voids in a group*"
	setVar $BOT~help[12] $BOT~tab&"  name    - Name of this void group - max 6*"
	setVar $BOT~help[13] $BOT~tab&"  {param} - If parameter specified then it will"
	setVar $BOT~help[14] $BOT~tab&"            search sector parameters where this"
	setVar $BOT~help[15] $BOT~tab&"            param is not FALSE."
	setVar $BOT~help[16] $BOT~tab&"	           Those that exist are added to group.*"
	setVar $BOT~help[17] $BOT~tab&"   To add to a group first recall group,"
	setVar $BOT~help[18] $BOT~tab&"   manually void sectors and then store again."
	setVar $BOT~help[19] $BOT~tab&" "
	setVar $BOT~help[20] $BOT~tab&"Usage: "
	setVar $BOT~help[21] $BOT~tab&"       >avoids_man store trucesectors"
	setVar $BOT~help[22] $BOT~tab&"       >avoids_man clear trucesectors"
	setVar $BOT~help[23] $BOT~tab&"       >avoids_man store alienspace FERRENGI"
	gosub :BOT~help_file

	setVar $name_array 0
	setVar $name_arrayCount 0
	setVar $avoids 0
	setVar $avoidsCount 0
	setVar $currentName "AV_" & $bot~parm2
	setVar $found 0
	
	
	gosub :PLAYER~quikstats

	if ($bot~parm1 = "list")
		
		goSub :findName
		
		setVar $voidsList "Current Avoid Group List*"
		setVar $i 1
		while ($i <= $name_arrayCount)
			setVar $voidsList $voidsList&"  - "& $name_array[$i] & "*"
			add $i 1
		end
		
		setVar $SWITCHBOARD~message $voidsList
		gosub :SWITCHBOARD~switchboard
		halt
	elseif ($bot~parm1 = "wipeall")
		gosub :wipeall
		setVar $SWITCHBOARD~message "All data wiped...*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if ($PLAYER~CURRENT_PROMPT = "Command") OR ($PLAYER~CURRENT_PROMPT = "Citadel")
		
		if (($bot~parm1 <> "store") and ($bot~parm1 <> "clear") and ($bot~parm1 <> "recall") and ($bot~parm1 <> "list") and ($bot~parm1 <> "show"))
			setVar $SWITCHBOARD~message "Parm1 should be store/clear/recall/list/show*"
			gosub :SWITCHBOARD~switchboard
			halt	
		end
		if (($bot~parm2 = "0") or ($bot~parm2 = ""))
			setVar $SWITCHBOARD~message "Please specifiy void group name*"
			gosub :SWITCHBOARD~switchboard
			halt
		else
			getLength $bot~parm2 $len
			if ($len > 6)
				setVar $SWITCHBOARD~message "Name should be no more than 6 chars.*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		end
	else
		setVar $SWITCHBOARD~message "Must be started from the Command or Citadel Prompt*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	if (($bot~parm3 <> "") and ($bot~parm3 <> "0"))
		if ($bot~parm1 = "store")
			setVar $avoidsAdded 0
			
			setVar $i 1
			while ($i <= SECTORS)
				getSectorParameter $i $bot~parm3 $v
				if (($v <> "0") and ($v <> ""))
					add $avoidsCount 1
					add $avoidsAdded 1
					setSectorParameter $i $currentName 1
				end
				add $i 1
			end
			if ($avoidsAdded = 0)
				setVar $SWITCHBOARD~message "Did not find any with this sector PARAM:"&$bot~parm3&"*"
				gosub :SWITCHBOARD~switchboard
				halt
			else
				setVar $SWITCHBOARD~message "Added "&$avoidsAdded&" to group "&$bot~parm1&"*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		else
			setVar $SWITCHBOARD~message "Can only STORE using Sector Param*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
	elseif ($bot~parm1 = "store")
		
		goSub :manageNames
		gosub :storeCurrentAvoids
		
		setVar $SWITCHBOARD~message "Stored "&$avoidsCount&" Sectors to Group "&$bot~parm2&"*"
		gosub :SWITCHBOARD~switchboard
	elseif ($bot~parm1 = "recall")
		goSub :findName

		if ($found = 0)
			setVar $SWITCHBOARD~message "Could Not Find Group "&$bot~parm2&"*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		gosub :recallCurrentAvoids
		
		setVar $SWITCHBOARD~message "Recalled "&$avoidsCount&" Sectors to Group "&$bot~parm2&"*"
		gosub :SWITCHBOARD~switchboard
	elseif ($bot~parm1 = "show")
		goSub :findName

		if ($found = 0)
			setVar $SWITCHBOARD~message "Could Not Find Group "&$bot~parm2&"*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
		gosub :displayCurrentAvoids
		
		
	elseif ($bot~parm1 = "clear")
		goSub :findName
		if ($found = 0)
			setVar $SWITCHBOARD~message "Could Not Find Group "&$bot~parm2&"*"
			gosub :SWITCHBOARD~switchboard
			halt
		end

	
		gosub :clearCurrentAvoids

		setVar $SWITCHBOARD~message "Cleared "&$avoidsCount&" Sectors to Group "&$bot~parm2&"*"
		gosub :SWITCHBOARD~switchboard
	end
halt


:findName
	setVar $found 0
	getSectorParameter 1 "AVOIDS_MAN" $names

	replaceText $names "|" " "
	setVar $w 1
	setVar $go 1
	setVar $name_arrayCount 0
	setVar $name_array ""
	while ($go = 1)
		getWord $names $word $w
		if ($word <> 0)
			setVar $name_array[$w] $word
			add $name_arrayCount 1

			if ($bot~parm2 = $word)
				setVar $found 1
			end
		else
			setVar $go 0
		end
		add $w 1
	end

return

:manageNames

	gosub :findName

	if ($found = 0)
		getSectorParameter 1 "AVOIDS_MAN" $names
		if ($names = 0)
			setVar $names $bot~parm2
		else
			setVar $names $names&"|"&$bot~parm2
		end
		setSectorParameter 1 "AVOIDS_MAN" $names
	end

return

:clearCurrentAvoids
	setVar $i 1

	while ($i <= SECTORS)
		getSectorParameter $i $currentName $v
		if ($v = "1")
			add $avoidsCount 1
			setSectorParameter $i $currentName 0
		end
		add $i 1
	end
return

:displayCurrentAvoids

	setVar $maxVoidsLine 11
	setVar $lineCount 0
	setVar $maxLines 20
	setVar $maxLineCount 0

	setVar $voidsList ""
		
	#setVar $voidsList $voidsList&"  - "& $name_array[$i] & "*"
			
	setVar $i 1
	
	while ($i <= SECTORS)
		getSectorParameter $i $currentName $v

		if ($v = "1")
			add $avoidsCount 1
			
			if ($i < 10)
				setVar $voidsList $voidsList&"     "&$i
			elseif ($i < 100)
				setVar $voidsList $voidsList&"    "&$i
			elseif ($i < 1000)
				setVar $voidsList $voidsList&"   "&$i
			elseif ($i < 10000)
				setVar $voidsList $voidsList&"  "&$i
			else
				setVar $voidsList $voidsList&" "&$i
			end
			add $lineCount 1
			if ($lineCount = $maxVoidsLine)
				setVar $voidsList $voidsList&"*"
				setVar $lineCount 0
				add $maxLineCount 1
				if ($maxLineCount = $maxLines)
					setVar $voidsList $voidsList&"*Maximum voids reached for display!! "
					setVar $i 64000
				end
			end
		end
		add $i 1
	end
	setVar $voidsInfo "Displaying "&$avoidsCount&" Voids in Group " &$bot~parm2 &"**"
	setVar $voidsList $voidsInfo&$voidsList
	setVar $SWITCHBOARD~message $voidsList&"*"
	gosub :SWITCHBOARD~switchboard
	halt
return
:recallCurrentAvoids
	
	send "cv0*yy"
	waitfor "Avoided sectors Cleared."

	setVar $burstControl 0

	setVar $i 1

	while ($i <= SECTORS)
		getSectorParameter $i $currentName $v

		if ($v = "1")
			add $avoidsCount 1
			send "v" $i "*"
			add $burstControl 1
		end
		if ($burstControl = 20)
			send "#"
			waitfor "Who's Playing"
			setVar $burstControl 0
		end
		add $i 1
	end
	send "q"
return


:storeCurrentAvoids
	send "cxq"
	setVar $AVOIDS_text ""
	waitfor "<List Avoided Sectors>"
	setTextLineTrigger		NoAvoid	:NoAvoid	"No Sectors are currently being avoided."
	setTextLineTrigger		Done	:Done		"Computer command"
	setTextLineTrigger		Line	:Line
	pause
	:Line
    	if ((CURRENTLINE <> "") AND (CURRENTLINE <> "0"))
			setVar $Temp (" " & CURRENTLINE & " +++ ")
			While ($Temp <> "+++")
				getWord $Temp $Avoided 1
				isNumber $tst $Avoided
				if (($tst <> 0) and ($Avoided <> 0))
					setVar $AVOIDS_text ($AVOIDS_text & $Avoided & " ")
					replacetext $Temp (" " & $Avoided & " ") ""
					add $Void_CNT 1
				else
					setVar $Temp "+++"
				end
			end
		end
		setTextLineTrigger		Line	:Line
		pause
	:NoAvoid
		killAlltriggers
		return
	:Done
		killAllTriggers
		
		setVar $w 1
		setVar $go 1
		while ($go = 1)
			getWord $AVOIDS_text $word $w
			if ($word <> 0)
				setVar $avoids[$w] $word
				setSectorParameter $word $currentName 1
				add $avoidsCount 1
			else
				setVar $go 0
			end
			
			add $w 1
		end
		return

return

:wipeall
	getSectorParameter 1 "AVOIDS_MAN" $names


	replaceText $names "|" " "
	setVar $w 1
	setVar $go 1
	while ($go = 1)
		getWord $names $word $w
		if ($word <> 0)
			setVar $name_array[$w] $word
			setVar $currentName "AV_" & $word
			goSub :clearCurrentAvoids
		else
			setVar $go 0
		end
		add $w 1
	end
	setSectorParameter 1 "AVOIDS_MAN" ""
return

include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
