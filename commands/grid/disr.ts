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
	gosub :BOT~loadVars

	setVar		$ErrMsg					"DisR Syntax Error"
	setVar 		$planet~planet					0
	setVar		$ScanIT					TRUE
	setVar		$Bursting				FALSE
	setVar		$Start_Prompt			""
	setVar 		$Total_Mines_Poofed		0
	setArray	$ADJ2HiT				6 1
	#			ADJ2HiT Break Down - 1st Dimension: ADdj Sector Numbers; 2nd Dimension: Armids Scanned/Remaining

	setVar $BOT~help[1]  $BOT~tab&" disr {sector} {nscan} {burst}"
	setVar $BOT~help[2]  $BOT~tab&"   "
	setVar $BOT~help[3]  $BOT~tab&"      {sector} - Disrupt mines in adj sector"
	setVar $BOT~help[4]  $BOT~tab&"       {burst} - Sends only 1 disruptor into each sector"
	setVar $BOT~help[5]  $BOT~tab&"       {nscan} - Do not perform holo scan - otherwise it"
	setVar $BOT~help[6]  $BOT~tab&"                 will auto detect enemy armids"
	setVar $BOT~help[7]  $BOT~tab&"   "
	setVar $BOT~help[8]  $BOT~tab&"         Start prompts:"
	setVar $BOT~help[9]  $BOT~tab&"                         [Command Prompt]"
	setVar $BOT~help[10] $BOT~tab&"                         [Planet/Citadel Prompt(s)]"
	setVar $BOT~help[11] $BOT~tab&"                         [Computer Prompt]"
	setVar $BOT~help[12] $BOT~tab&"                         [StarDock Prompt]"
	setVar $BOT~help[13] $BOT~tab&"                         [Port Prompt]"
	setVar $BOT~help[14] $BOT~tab&"   "
	setVar $BOT~help[15] $BOT~tab&"      Default action: disrupt all adjs, with holo scan."
	setVar $BOT~help[16] $BOT~tab&"   "
	setVar $BOT~help[17] $BOT~tab&"                             Author - Lonestar"
	gosub :bot~helpfile

	isNumber $tst $bot~MODE
	if ($tst = 0)
		LowerCase $bot~MODE
		if (($bot~MODE <> "general") and ($bot~mode <> ""))
			setvar $switchboard~message "M()MBot Must Be In General Mode!*"
			gosub :switchboard~switchboard
			halt
		end
	end

	isNumber $tst $bot~parm1
	if (($tst = 0) and ($bot~parm1 <> ""))
		lowerCase $bot~parm1
		if ($bot~parm1 = "nscan")
			setVar $ScanIT 		FALSE
			setVar $bot~parm1 "0"
		elseif ($bot~parm1 = "burst")
			setVar $bot~parm1 "0"
			setVar $Bursting 	TRUE
		else
			setvar $switchboard~message $ErrMsg&"*"
			gosub :switchboard~switchboard
			halt
		end
	end
	if ($bot~parm1 = "")
		setvar $bot~parm1 "0"
	end
	if ((($bot~parm1 < 11) AND ($bot~parm1 <> 0)) OR ($bot~parm1 = STARDOCK))
		setvar $switchboard~message $ErrMsg & " - Invalid Target!*"
		gosub :switchboard~switchboard
		halt
	elseif (($bot~parm1 = "0") AND ($ScanIT = 0))
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
	if (($tst = 0) and ($bot~parm2 <> ""))
		LowerCase $bot~parm2
		if ($bot~parm2 = "nscan")
			setVar $ScanIT 		FALSE
		elseif ($bot~parm2 = "burst")
			setVar $ScanIT 		FALSE
			setVar $Bursting	TRUE
		end
	end

	isNumber $tst $bot~parm3
	if (($tst = 0) and ($bot~parm3 <> ""))
		LowerCase $bot~parm3
		if ($bot~parm3 = "nscan")
			setVar $ScanIT 		FALSE
		elseif ($bot~parm3 = "burst")
			setVar $ScanIT 		FALSE
			setVar $Bursting	TRUE
		end
	end

	:Prompt_Checking
	gosub :player~quikstats
	if (($ScanIT) AND ($player~scan_type <> "Holo"))
		setvar $switchboard~message "Ship Does Not Have A Long Range Scanner!*"
		gosub :switchboard~switchboard
		halt
	end
		echo "*["&$player~current_prompt&"]*"

	if ($player~mine_disruptors = 0)
		setvar $switchboard~message "No Disruptors On Board!*"
		gosub :switchboard~switchboard
		halt
	end

	if ($player~current_prompt = "Planet")
		gosub :planet~getplanetinfo
		if ($planet~planet = 0)
			setvar $switchboard~message "Unable To Obtain Planet Number!*"
			gosub :switchboard~switchboard
			halt
		end
		send "  Q  "
	elseif ($player~current_prompt = "Citadel")
		send "  Q  "
		gosub :planet~getplanetinfo
		send "  Q  "
		if ($planet~planet = 0)
			setvar $switchboard~message "Unable To Obtain Planet Number!*"
			gosub :switchboard~switchboard
			halt
		end
	elseif ($player~current_prompt = "Command")

	elseif ($player~current_prompt = "Computer")
		send "  Q  "
		goto :Prompt_Checking
	elseif ($player~current_prompt = "StarDock")
		send "Q  "
	elseif ($player~current_prompt = "How")
		send " 0*  0*  0*  0*  "
	else
		setvar $switchboard~message "At Unkown Prompt!*"
		gosub :switchboard~switchboard
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
			send " Q Q Q Z N L Z" & #8 & $planet~planet & "*  *  J  C  *  * "
		else
			send " Q Q Q Z N L Z" & #8 & $planet~planet & "*  *  "
		end
	elseif ($Start_Prompt = "StarDock")
		SetTextLineTrigger	Limpet_Found	:Limpet_Found	"A port official runs up to you as you dock and informs you that"
		SetTextTrigger		On_Dock			:On_Dock		"<StarDock> Where to?"
		send " P  S"
		pause
		:Limpet_Found
			send  " Y "
			pause
		:On_Dock
			killAllTriggers
	elseif ($Start_Prompt = "How")
		send " P  T  "
	end

	setVar $idx 1
	setVar $str ""
	while ($idx <= 6)
		if ($ADJ2HiT[$idx][1] <> 0)
			setVar $str $str&"        Sector "&$ADJ2HiT[$idx]&", "&$ADJ2HiT[$idx][1]&" Mines Remain*"
		end
		add $idx 1
	end

	if ($str = "")
		setvar $switchboard~message "Disrupted " & $Total_Mines_Poofed & " Mines!*"
	else
		setvar $switchboard~message "Status Report:*"
		setvar $switchboard~message $switchboard~message&" *" & $str
		setvar $switchboard~message $switchboard~message&"        Disrupted: " & $Total_Mines_Poofed & "*"
	end
	gosub :switchboard~switchboard

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
	else
		gosub :player~quikstats
		setvar $switchboard~message "Unknown Problem Occured, at '"&$player~current_prompt&"' Prompt!*"
		gosub :switchboard~switchboard
		halt
	end
	pause
	:Whoa_WuzUp
		killAllTriggers
		setvar $switchboard~message "Unknown Problem Occured, Attempting to reach Command Prompt!*"
		gosub :switchboard~switchboard
		send "  P D 0* 0* 0* * *** * C  Q  Q  Q  Q  Q  Z  2  2  C  Q  *  Z  *  ***  *  *  ^Q"
		waitfor ": ENDINTERROG"
		gosub :player~quikstats
		setvar $switchboard~message "Unknown Problem Occured, at '"&$player~current_prompt&"' Prompt!*"
		gosub :switchboard~switchboard
		halt
	:Scan_Complete
		killAllTriggers
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

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\planet\getplanetinfo\planet"
