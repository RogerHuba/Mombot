    #=--------                                                                       -------=#
     #=------------------------------     DisRuption v1.0    ------------------------------=#
    #=--------                                                                       -------=#
	#		Incep Date	:	March 10, 2007  -  Version 1.0
	#		Author		:	LoneStar
	#		TWX			:	Should Work with TWX 2.03, 2.04b, and 2.04 Final
	#		Description	:	Another LoneStar Advanced Script Classic
	#						Disrupts Armid mines in Adjacent Sectors Can start from: Command,
	#						Planet, Citadel, Stardock, Computer and Port Prompts. If no
	#						parameters are passed script will holo-scan and will disrupt all
	#						adj enemy armids.
	#
	#		Parameters	:	disr {sector} {nscan} {burst}
	#
	#						{sector}	Disrupts Armids in Adj-Sector (Does not Holo Scan)
	#						{nscan}		Skips Holo Scan
	#						{burst}		Only send one Disrupter per sector
	#
	#		Credits		:	Mind Dagger's :player~quikstats Routine (improved version of Singularity's)
	#
	#		NOTE		:	I Modified :quikstat to include the 'Port' Prompt. Also added
	#                       the Variable $PORT_PROMPT_TYPE to indicate which product-prompt
	#						user's on --though not used in this script.
	LoadVar 	$MODE
	LoadVar 	$switchboard~bot_name
	LoadVar 	$bot~parm1
	LoadVar 	$bot~parm2
	LoadVar		$bot~parm3
	setVar		$TagLine				("{" & $switchboard~bot_name & "} DisR")
	setVar		$ErrMsg					("'{" & $switchboard~bot_name & "} - DisR Syntax Error")
	setVar 		$planet~planet					0
	setVar		$ScanIT					TRUE
	setVar		$Bursting				FALSE
	setVar		$Start_Prompt			""
	setVar 		$Total_Mines_Poofed		0
   	setArray	$ADJ2HiT				6 1
	#			ADJ2HiT Break Down - 1st Dimension: ADdj Sector Numbers; 2nd Dimension: Armids Scanned/Remaining

	if ($bot~parm1 = "help")
		send "'*" & $TagLine & " {Sector} {NScan} {Burst}*"
		send "   *"
		send "      {Sector}  Disrupt Mines in Adj Sector*"
		send "      {Burst}   Sends only 1 Disruptor into each Sector*"
		send "      {NScan}   Do Not Perform Holo Scan --otherwise it*"
		send "                Auto Detect enemy Armids*"
		send "   *"
		send "         Start Prompts:*"
		send "                         Command Prompt*"
		send "                         Planet/Citadel Prompt(S)*"
		send "                         Computer Prompt*"
		send "                         StarDock Prompt*"
		send "                         Port Prompt*"
		send "   *"
		send "      Default Action: Disrupt All Adjs, With Holo Scan.**"
		halt
	end

	isNumber $tst $MODE
	if ($tst = 0)
		LowerCase $MODE
		if ($MODE <> "general")
			send ("'" & $TagLine & " - M()MBot Must Be In General Mode!*")
		   halt
    	end
    end

	isNumber $tst $bot~parm1
	if ($tst = 0)
		lowerCase $bot~parm1
		if ($bot~parm1 = "nscan")
			setVar $ScanIT 		FALSE
			setVar $bot~parm1 		0
		elseif ($bot~parm1 = "burst")
			setVar $bot~parm1 		0
			setVar $Bursting 	TRUE
		else
			send ($ErrMsg & "*")
			halt
		end
	end

	if ((($bot~parm1 < 11) AND ($bot~parm1 <> 0)) OR ($bot~parm1 = STARDOCK))
		send ($ErrMsg & " - Invalid Target!*")
		halt
	elseif (($bot~parm1 = 0) AND ($ScanIT = 0))
		setVar $idx	1
		while (SECTOR.WARPS[CURRENTSECTOR][$idx] > 0)
			setVar $adj SECTOR.WARPS[CURRENTSECTOR][$idx]
			setVar $ADJ2HiT[$idx] $adj
			setVar $ADJ2HiT[$idx][1] 1
			add $idx 1
		end
	elseif ($bot~parm1 > 0)
		setVar $ADJ2HiT[1] 		$bot~parm1
		setVar $ADJ2HiT[1][1] 	1
		setVar $ScanIT 			FALSE
	end

	isNumber $tst $bot~parm2
	if ($tst = 0)
		LowerCase $bot~parm2
		if ($bot~parm2 = "nscan")
			setVar $ScanIT 		FALSE
		elseif ($bot~parm2 = "burst")
			setVar $ScanIT 		FALSE
			setVar $Bursting	TRUE
		end
	end

	isNumber $tst $bot~parm3
	if ($tst = 0)
		LowerCase $bot~parm3
		if ($bot~parm3 = "nscan")
			setVar $ScanIT 		FALSE
		elseif ($bot~parm3 = "burst")
			setVar $ScanIT 		FALSE
			setVar $Bursting	TRUE
		end
	end

	:Prompt_Checking
	gosub	:player~quikstats
	if (($ScanIT) AND ($player~scan_type <> "Holo"))
	   send ("'" & $TagLine & " - Ship Does Not Have A Long Range Scanner!*")
	   halt
	end
	if ($player~mine_disruptors = 0)
		send ("'" & $TagLine & " - No Disruptors On Board!*")
		halt
	end

	if ($player~current_prompt = "Planet")
		gosub :planet~getplanetinfo
		if ($planet~planet = 0)
			send ("'" & $TagLine & " - Unable To Obtain Planet Number!*")
			halt
		end
		send "  Q  "
	elseif ($player~current_prompt = "Citadel")
		send "  Q  "
		gosub :planet~getplanetinfo
		send "  Q  "
		if ($planet~planet = 0)
			send ("'" & $TagLine & " - Unable To Obtain Planet Number!*")
			halt
		end
	elseif ($player~current_prompt = "Command")

	elseif ($player~current_prompt = "Computer")
		send "  Q  "
		goto :Prompt_Checking
	elseif ($player~current_prompt = "StarDock")
		send "Q  "
	elseif ($player~current_prompt = "Port")
		send " 0*  0*  0*  0*  "
	else
		send ("'" & $TagLine & " - At Unkown Prompt!*")
		halt
	end

	setVar $Start_Prompt $player~current_prompt

	if ($ScanIT)
		gosub :Do_Scan
		setVar $idx 1

		#while ($idx <= 6)xx
		while (SECTOR.WARPS[CURRENTSECTOR][$idx] > 0)
			setVar $adj SECTOR.WARPS[CURRENTSECTOR][$idx]
			if (SECTOR.MINES.QUANTITY[$adj] <> 0)
				if ((SECTOR.MINES.OWNER[$adj] <> "belong to your Corp") AND (SECTOR.MINES.OWNER[$adj] <> "yours"))
					setVar $ADJ2HiT[$idx] $adj
					setVar $ADJ2HiT[$idx][1] SECTOR.MINES.QUANTITY[$adj]
				else
					setVar $ADJ2HiT[$idx][1] 0
				end
			end
        	add $idx 1
		end
	end


	gosub :STAR_BURST


	if ($planet~planet <> 0)
		if ($Start_Prompt = "Citadel")
			send (" Q Q Q Z N L Z" & #8 & $planet~planet & "*  *  J  C  *  * ")
		else
			send (" Q Q Q Z N L Z" & #8 & $planet~planet & "*  *  ")
		end
	elseif ($Start_Prompt = "StarDock")
		SetTextLineTrigger	Limpet_Found	:Limpet_Found	"A port official runs up to you as you dock and informs you that"
		SetTextTrigger		On_Dock			:On_Dock		"<StarDock> Where to?"
		send (" P  S")
		pause
		:Limpet_Found
			send  " Y "
			pause
		:On_Dock
			killAllTriggers
	elseif ($Start_Prompt = "Port")
		send " P  T  "
	end

	setVar $idx 1
	setVar $str ""
	while ($idx <= 6)
		if ($ADJ2HiT[$idx][1] <> 0)
			setVar $str ($str & "        Sector " & $ADJ2HiT[$idx] & ", " & $ADJ2HiT[$idx][1] & " Mines Remain*")
		end
		add $idx 1
	end

	if ($str = "")
		send ("'" & $TagLine & " - Disrupted " & $Total_Mines_Poofed & " Mines!*")
	else
		send ("'*" & $TagLine & " - Status Report:*")
		send (" *" & $str)
		send ("        Disrupted: " & $Total_Mines_Poofed & "**")
	end

	halt

    #=--------                                                                       -------=#
     #=------------------------------      SUB ROUTINES      ------------------------------=#
    #=--------                                                                       -------=#
    #
    #		:Do_Scan				Performs simple Holo-Scan. Assumes users at Cmd Prompt.
    #
	#		:player~quikstats				Mind Dagger's version of Singularity's quikstat routine
	#								Modified by me to Include the Prompt Type:  Port
	#
	#		:Planet_Info			Simply aquires Planet Number, if necessary
	#
	#		:STAR_BURST				Where The Magic Happens. The Routine where Disruptors are
	#								fired off in adj sectors.

:Do_Scan
	setDelayTrigger		Whoa_WuzUp		:Whoa_WuzUp		4000
	setTextLineTrigger	Scan_Complete	:Scan_Complete	"Warps to Sector(s)"
	if ($Start_Prompt = "Citadel")
		send (" S  H")
	elseif ($Start_Prompt = "Planet")
		send (" S  H")
	elseif ($Start_Prompt = "StarDock")
		send ("  S  H")
	elseif ($Start_Prompt = "Command")
		send ("  S  H")
	elseif ($Start_Prompt = "Port")
		send (" S   H")
	else
		gosub :quikstat
		send ("'" & $TagLine & " - Unknown Problem Occured, at '"&$player~current_prompt&"' Prompt!*")
		halt
	end
	pause
	:Whoa_WuzUp
		killAllTriggers
		send ("'" & $TagLine & " - Unknown Problem Occured, Attempting to reach Command Prompt!*  P D 0* 0* 0* * *** * C  Q  Q  Q  Q  Q  Z  2  2  C  Q  *  Z  *  ***  *  *  ^Q")
		waitfor ": ENDINTERROG"
		gosub :player~quikstats
		send ("'" & $TagLine & " - Unknown Problem Occured, at '"&$player~current_prompt&"' Prompt!*")
		halt
	:Scan_Complete
		killAllTriggers
		return

:Planet_Info
	setTextLineTrigger	Planet		:Planet "Planet #"
	send "D"
	pause
	:Planet
		killTrigger Planet
		getWord CURRENTLINE $planet~planet 2
		stripText $planet~planet "#"
		isNumber $tst $planet~planet
		if ($tst = 0)
			setVar $planet~planet 0
		end
	return

:player~quikstats
	setVar $player~current_prompt 		"Undefined"
	killtrigger 		noprompt
	killtrigger 		prompt1
	killtrigger 		prompt2
	killtrigger 		prompt3
	killtrigger 		prompt4
	killtrigger			prompt5
	killtrigger 		statlinetrig
	killtrigger 		getLine2
	setTextTrigger 		prompt1 		:allPrompts 		"(?="
	setTextLineTrigger 	prompt2 		:secondaryPrompts 	"(?)"
	setTextLineTrigger 	statlinetrig 	:statStart 			#179
	setTextTrigger		prompt3         :terraPrompts		"Do you wish to (L)eave or (T)ake Colonists?"
	setTextTrigger		prompt4         :terraPrompts		"How many groups of Colonists do you want to take ("
	setTextTrigger		prompt5			:portPrompt			"How many holds of"
	send "^Q/"
	pause

	:allPrompts
		getWord currentansiline $checkPrompt 1
		getWord currentline $tempPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $player~current_prompt $tempPrompt
		end
		setTextLineTrigger prompt1 :allPrompts "(?="
		pause
	:secondaryPrompts
		getWord currentansiline $checkPrompt 1
		getWord currentline $tempPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $player~current_prompt $tempPrompt
		end
		setTextLineTrigger prompt2 :secondaryPrompts "(?)"
		pause
	:terraPrompts
		killtrigger prompt3
		killtrigger prompt4
		getWord currentansiline $checkPrompt 1
		getWordPos $checkPrompt $pos "[35m"
		if ($pos > 0)
			setVar $player~current_prompt "Terra"
		end
		setTextTrigger		prompt3         :terraPrompts		"Do you wish to (L)eave or (T)ake Colonists?"
		setTextTrigger		prompt4         :terraPrompts		"How many groups of Colonists do you want to take ("
		pause
	:portPrompt
		getWord CURRENTANSILINE $checkPrompt 1
		setVar $PORT_PROMPT_TYPE CURRENTLINE
		getWord $PORT_PROMPT_TYPE $tempPrompt 1
		getWordPos $checkPrompt $pos "[35mHow"
		if ($pos > 0)
			setVar $player~current_prompt "Port"
		end
		setTextTrigger		prompt5			:portPrompt			"How many holds of"
		pause

	:statStart
		killtrigger prompt1
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger prompt5
		killtrigger noprompt
		setVar $stats ""
		setVar $wordy ""

	:statsline
		killtrigger statlinetrig
		killtrigger getLine2
		setVar $line2 CURRENTLINE
		replacetext $line2 #179 " "
		striptext $line2 ","
		setVar $stats $stats & $line2
		getWordPos $line2 $pos "Ship"
		if ($pos > 0)
			goto :gotStats
		else
			setTextLineTrigger getLine2 :statsline
			pause
		end

	:gotStats
		setVar $stats $stats & " @@@"

		setVar $current_word 0
		while ($wordy <> "@@@")
			if ($wordy = "Sect")
				getWord $stats $player~current_sector   	($current_word + 1)
			elseif ($wordy = "Turns")
				getWord $stats $player~turns  				($current_word + 1)
			elseif ($wordy = "Creds")
				getWord $stats $player~credits  			($current_word + 1)
			elseif ($wordy = "Figs")
				getWord $stats $player~fighters   			($current_word + 1)
			elseif ($wordy = "Shlds")
				getWord $stats $player~shields  			($current_word + 1)
			elseif ($wordy = "Hlds")
				getWord $stats $player~total_holds   		($current_word + 1)
			elseif ($wordy = "Ore")
				getWord $stats $player~ore_holds    		($current_word + 1)
			elseif ($wordy = "Org")
				getWord $stats $player~organic_holds    	($current_word + 1)
			elseif ($wordy = "Equ")
				getWord $stats $player~equipment_holds    	($current_word + 1)
			elseif ($wordy = "Col")
				getWord $stats $player~colonist_holds    	($current_word + 1)
			elseif ($wordy = "Phot")
				getWord $stats $player~photons   			($current_word + 1)
			elseif ($wordy = "Armd")
				getWord $stats $player~armids   			($current_word + 1)
			elseif ($wordy = "Lmpt")
				getWord $stats $player~limpets   			($current_word + 1)
			elseif ($wordy = "GTorp")
				getWord $stats $player~genesis  			($current_word + 1)
			elseif ($wordy = "TWarp")
				getWord $stats $player~twarp_type  		($current_word + 1)
			elseif ($wordy = "Clks")
				getWord $stats $player~cloaks   			($current_word + 1)
			elseif ($wordy = "Beacns")
				getWord $stats $player~beacons 			($current_word + 1)
			elseif ($wordy = "AtmDt")
				getWord $stats $player~atomic  			($current_word + 1)
			elseif ($wordy = "Corbo")
				getWord $stats $player~corbo   			($current_word + 1)
			elseif ($wordy = "EPrb")
				getWord $stats $player~eprobes   			($current_word + 1)
			elseif ($wordy = "MDis")
				getWord $stats $player~mine_disruptors   	($current_word + 1)
			elseif ($wordy = "PsPrb")
				getWord $stats $player~psychic_probe  		($current_word + 1)
			elseif ($wordy = "PlScn")
				getWord $stats $player~planet_scanner  	($current_word + 1)
			elseif ($wordy = "LRS")
				getWord $stats $player~scan_type    		($current_word + 1)
			elseif ($wordy = "Aln")
				getWord $stats $player~alignment    		($current_word + 1)
			elseif ($wordy = "Exp")
				getWord $stats $player~experience    		($current_word + 1)
			elseif ($wordy = "Corp")
				getWord $stats $player~corp   				($current_word + 1)
			elseif ($wordy = "Ship")
				getWord $stats $player~ship_number   		($current_word + 1)
			end
			add $current_word 1
			getWord $stats $wordy $current_word
		end
	:doneQuikstats
		killtrigger prompt1
		killtrigger prompt2
		killtrigger prompt3
		killtrigger prompt4
		killtrigger prompt5
		killtrigger statlinetrig
		killtrigger getLine2

		stripText $player~current_prompt "<"
		stripText $player~current_prompt ">"
	return

:Global_Grover
	setVar $player~current_prompt 		"Undefined"
	setVar $player~psychic_probe 		"NO"
	setVar $player~planet_scanner 		"NO"
	setVar $player~scan_type 			"NONE"
	setVar $player~current_sector 		0
	setVar $player~turns 				0
	setVar $player~credits 			0
	setVar $player~fighters 			0
	setVar $player~shields 			0
	setVar $player~total_holds 		0
	setVar $player~ore_holds 			0
	setVar $player~organic_holds 		0
	setVar $player~equipment_holds 	0
	setVar $player~colonist_holds		0
	setVar $player~photons 			0
	setVar $player~armids 				0
	setVar $player~limpets 			0
	setVar $player~genesis 			0
	setVar $player~twarp_type 			0
	setVar $player~cloaks 				0
	setVar $player~beacons 			0
	setVar $player~atomic 				0
	setVar $player~corbo 				0
	setVar $player~eprobes 			0
	setVar $player~mine_disruptors 	0
	setVar $player~alignment 			0
	setVar $player~experience			0
	setVar $player~corp 				0
	setVar $player~ship_number			0
	setVar $player~turns_PER_WARP 		0
	setVar $COMMAND_PROMPT 		"Command"
	setVar $COMPUTER_PROMPT 	"Computer"
	setVar $planet~CITADEL_PROMPT		"Citadel"
	setVar $planet~planet_PROMPT		"Planet"
	setVar $player~corpORATE_PROMPT	"Corporate"
	setVar $STARDOCK_PROMPT 	"Stardock"
	setVar $HARDWARE_PROMPT 	"Hardware"
	setVar $SHIPYARD_PROMPT 	"Shipyard"
	setVar $TERRA_PROMPT 		"Terra"
	setVar $PORT_PROMPT			"Port"
	setVar $PORT_PROMPT_TYPE	""
	return


:STAR_BURST
	setVar $DisRuptors $player~mine_disruptors
	send " C "
	:Lets_Go_Again
	setVar $idx 1
	setVar $Adj_Hits 0
	while ($idx <= 6)
		if ($ADJ2HiT[$idx][1] <> 0)
			setTextLineTrigger	NoMines		:NoMines	("There were no mines in sector " & $ADJ2HiT[$idx])
			setTextLineTrigger	MinesGone	:MinesGone	("of the mines in sector "&$ADJ2HiT[$idx]&"!")
			setTextLineTrigger	NotAdj		:NotAdj		("That is not an adjacent sector")
			send (" W Y " & $ADJ2HiT[$idx] & "*")
			pause
			:NoMines
				killAllTriggers
				setVar $DisRuptors ($DisRuptors - 1)
				setVar $ADJ2HiT[$idx][1] 0
				goto :Loop_D_Lou
			:NotAdj
				killAllTriggers
				send " Q"
				setVar $ADJ2HiT[$idx][1] 0
				goto :Loop_D_Lou
			:MinesGone
				killAllTriggers
				setVar $Temp CURRENTLINE
				getWordPos $Temp $pos "remain)"
				setVar $DisRuptors ($DisRuptors - 1)
				if ($pos = 0)
            		getWord $Temp $Temp 4
            		isNumber $tst $Temp
            		if ($tst)
						setVar $Total_Mines_Poofed ($Total_Mines_Poofed + $Temp)
					end
					setVar $ADJ2HiT[$idx][1] 0
				else
					getWord $Temp $Temp2 3
					isNumber $tst $Temp2
					if ($tst)
						setVar $Total_Mines_Poofed ($Total_Mines_Poofed + $Temp2)
					end
					getText $Temp $Temp ($ADJ2HiT[$idx] & "! (") " remain)"
					isNumber $tst $Temp
					if ($tst = 0)
						setVar $Temp 0
					end
					setVar $ADJ2HiT[$idx][1] $Temp
					setVar $Adj_Hits ($Adj_Hits + 1)
				end
			:Loop_D_Lou
			if ($DisRuptors < 1)
				setVar $idx 6
			end
		end
    	add $idx 1
	end
	if (($Adj_Hits <> 0) AND ($DisRuptors > 0) AND ($Bursting = 0))
		goto :Lets_Go_Again
	end
	send " Q "
	return
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
