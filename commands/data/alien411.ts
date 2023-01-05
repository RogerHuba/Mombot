    #=--------                                                                       -------=#
     #=--------------------- LoneStar's Alien Directory Assistance ------------------------=#
    #=--------                                                                       -------=#
	#		Incep Date	:	June 16, 2008 - Version 2.0
	#		Author		:	LoneStar
	#		TWX			:	TWX 2.04b or TWX 2.04 Final
	#		Credits		:	Singularities Print Alien Spaces Routine
	#
	#		To Run		:	Alien Sectors must have been seen by TWX in order
	#						for this script to work.
	#
	#		Fixes       :	Initial Release
	#
	#		Description	:	Just a basic TWX DataBase scan for alien spaces.
	#
	#						Creates a Text File to store known alien sectors to
	#						be referenced later for speed.
	#
	#						Can now redirect data to SubSpace, Fed Comms, or PM.
	#

		gosub :BOT~loadVars


	setVar $BOT~help[1] $BOT~tab&"Author: Lonestar  "
	setVar $BOT~help[2] $BOT~tab&"Will grab any alien sectors in database."
	setVar $BOT~help[3] $BOT~tab&" "
	setVar $BOT~help[4] $BOT~tab&"Will add alien sectors as sector parameters."
	gosub :bot~helpfile

	setVar $BOT~script_title "Lonestar's Alien 411"
	gosub :BOT~banner



	setVar $TAG (ANSI_9 & "["&ANSI_14&"ALIEN411"&ANSI_9&"] " & ANSI_15)
	setVar $TAG2 "[ALIEN411] "
	setVar $FNAME		"ALIEN411_" & GAMENAME & ".txt"
	setVar $Race_Max	10
	setArray $Races		$Race_Max 1
	setVar $idx 		0

	if (CONNECTED)
	else
		setVar $SWITCHBOARD~message "Must Be Connected To A Server*"
		gosub :SWITCHBOARD~switchboard
		goto :_END_
	end

:_TOP_OF_THE_WORLD_
		send "#/"
		waiton "Who's Playing"
		setTextLineTrigger	Alien		:Alien	"are on the move!"
		setTextTrigger		AlienDone	:AlienDone (#179 & "Turns")
		pause
		:Alien
			getText CURRENTLINE $Temp "The " " are on the move!"
			if ($idx < $Race_Max)
				add $idx 1
				setVar $Races[$idx] $Temp
				setVar $Races[$idx][1] ""
				setVar $RACES $idx
			end
			setTextLineTrigger	Alien		:Alien	"are on the move!"
			pause
		:AlienDone
			killAllTriggers
			gosub :RACE_SCAN


	if ($s = 0)
		setVar $s 1
	end
    setVar $LOOKING $s
    setVar $alienOutput ""
    setVar $SWITCHBOARD~message ""
    while ($RACES[$LOOKING] <> "0")
		setVar $SWITCHBOARD~message  $SWITCHBOARD~message&"              *"
		setVar $SWITCHBOARD~message  $SWITCHBOARD~message&"Results For " & $RACES[$LOOKING] & " Space*"
		setVar $STR $RACES[$LOOKING][1]
		setVar $idx 1
		getword $STR $SECT $idx "0"
		getWord $RACES[$LOOKING] $alien_name 1
		cutText $alien_name $alien_name 0 10
		upperCase $alien_name
		setVar $alienOutput $alienOutput&"["&$alien_name&"] "
		while ($SECT <> "0")
			isnumber $tst $SECT
			if ($tst)
				gosub :PAD
				setVar $SWITCHBOARD~message $SWITCHBOARD~message&$PAD & $SECT & " " & SECTOR.WARPCOUNT[$SECT] & "-Warps"
				setSectorParameter $SECT "ALIENS" TRUE
				setSectorParameter $SECT $alien_name TRUE
				getSectorParameter $SECT "FIGSEC" $F
				isnumber $tst $F
				if ($tst)
					if ($F <> 0)
						setVar $SWITCHBOARD~message $SWITCHBOARD~message&" FIG"
					end
				end
				getSectorParameter $SECT "LIMPSEC" $L
				isnumber $tst $L
				if ($tst <> 0)
					if ($L <> 0)
						setVar $SWITCHBOARD~message $SWITCHBOARD~message&" LIMP"
					end
				end
				getSectorParameter $SECT "MINESEC" $A
				isnumber $tst $A
				if ($tst <> 0)
					if ($A <> 0)
						setVar $SWITCHBOARD~message $SWITCHBOARD~message&" MINE"
					end
				end
				setVar $SWITCHBOARD~message $SWITCHBOARD~message&"*"
			end


	        add $idx 1
	        getword $STR $SECT $idx "0"
		end

		add $LOOKING 1
	end
setVar $SWITCHBOARD~message $SWITCHBOARD~message&"All Done! - Can now check alien space using sector param ALIENS*"
setVar $SWITCHBOARD~message $SWITCHBOARD~message&"Also, you can check these as well ("&$alienOutput&")*"
if ($SWITCHBOARD~self_command = FALSE)
	setVar $SWITCHBOARD~self_command 2
end
gosub :SWITCHBOARD~switchboard


:_END_
halt


:RACE_COUNT
	setVar $STR $RACES[$IDX][1]
	setVar $COUNT 1
	getword $STR $SECT $idx "0"
	while ($SECT <> "0")
		add $COUNT 1
		getword $STR $SECT $COUNT "0"
	end
	subtract $COUNT 1
	return

:PAD
	if ($SECT < 10)
		setVar $PAD "    "
	elseif ($SECT < 100)
		setVar $PAD "   "
	elseif ($SECT < 1000)
		setVar $PAD "  "
	elseif ($SECT < 10000)
		setVar $PAD " "
	else
		setVar $PAD ""
	end
	return

:RACE_SCAN
if ($Races = 0)
setVar $SWITCHBOARD~message "No Aliens In This Universe. Please Try Again Later*"
gosub :SWITCHBOARD~switchboard
goto :_END_
end
setVar $SWITCHBOARD~message "Scanning TWX DBase For Alien Space...*"
gosub :SWITCHBOARD~switchboard
setVar $i 11
while ($i <= SECTORS)
	getSector $i $SECT
	setVar $constellation $SECT.CONSTELLATION
	stripText $constellation "(unexplored)"
	stripText $constellation "uncharted space"
	stripText $constellation "."
	setVar $idx 1
	while ($idx <= $RACES)
		getWordPos $constellation $POS $RACES[$idx]
		if ($POS <> 0)
			setVar $RACES[$IDX][1] ($RACES[$IDX][1] & " " & $i)
		end
		add $idx 1
	end
	add $i 1
end
delete $FNAME
setVar $IDX 1
while ($IDX <= $RACES)
	setVar $STR ""
	setVar $STR $RACES[$IDX] & #9 & $RACES[$IDX][1]
	write $FNAME $STR
	add $IDX 1
end
return

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
