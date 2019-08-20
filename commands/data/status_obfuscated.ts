	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"Reports information about bot on subspace  "
	setVar $BOT~help[2] $BOT~tab&"        "
	setVar $BOT~help[3] $BOT~tab&"Special stats that are bot specific:        "
	setVar $BOT~help[4] $BOT~tab&"  - Planet #: Last planet landed on"
	setVar $BOT~help[5] $BOT~tab&"  - Team Name: What team name your bot respondeds to, if any"
	setVar $BOT~help[6] $BOT~tab&"  - Bot mode:  What mode your bot is currently running"
	setVar $BOT~help[7] $BOT~tab&"        "
	gosub :bot~helpfile

	loadvar $planet~planet
	loadvar $bot~mode
	loadvar $BOT~bot_team_name

 # ============================== QSS ==============================
:qss
:status
	gosub :PLAYER~quikstats
	setvar $adskljl false
	if (($player~experience < 1000) and ($player~alignment >= 0))
		setvar $adskljl true
	end
	setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
	if ($BOT~mode = "General")
		if (($PLAYER~startingLocation = "Command") or ($PLAYER~startingLocation = "Citadel"))
			gosub :PLAYER~getInfo
			if ($PLAYER~NOFLIP)
				send "CQ"
			else
				send "C N 9 Q Q "
			end
			waiton "Computer command [TL="
			getText CURRENTLINE $idasoiudsa "Computer command [TL=" "]:"
		else
			setVar $lkjsad "Bad Prompt"
			setVar $idasoiudsa "Bad Prompt"
		end
	else
		setVar $lkjsad "Busy"
		setVar $idasoiudsa "Busy"        
	end
	setArray $lkjassdalkhsdh 35
	setArray $udsaasfewfgtthryhi 35
	setArray $auaoeieoiofksa 35

	setVar $lkjassdalkhsdh[1]  "Sector   :"
	setVar $lkjassdalkhsdh[2]  "Turns    :"
	setVar $lkjassdalkhsdh[3]  "Credits  :"
	setVar $lkjassdalkhsdh[4]  " Fighters  :"
	setVar $lkjassdalkhsdh[5]  " Shields   :"
	setVar $lkjassdalkhsdh[6]  "Holds    :"
	setVar $lkjassdalkhsdh[7]  "Fuel Ore :"
	setVar $lkjassdalkhsdh[8]  "Organics :"
	setVar $lkjassdalkhsdh[9]  "Equipment:"
	setVar $lkjassdalkhsdh[10] "Colonists:" 
	setVar $lkjassdalkhsdh[11] "Photons  :"
	setVar $lkjassdalkhsdh[12] " Armids   :"
	setVar $lkjassdalkhsdh[13] " Limpets  :"
	setVar $lkjassdalkhsdh[14] " Gen-Torps:"
	setVar $lkjassdalkhsdh[15] " Transwarp :"
	setVar $lkjassdalkhsdh[16] "Cloaks    :"
	setVar $lkjassdalkhsdh[17] " Beacons   :"
	setVar $lkjassdalkhsdh[18] " AtomicDet:"
	setVar $lkjassdalkhsdh[19] " Corbomite :"
	setVar $lkjassdalkhsdh[20] " E-Probes :"
	setVar $lkjassdalkhsdh[21] " Disruptor:"
	setVar $lkjassdalkhsdh[22] " PsiProbe  :"
	setVar $lkjassdalkhsdh[23] " PlanetScn:"
	setVar $lkjassdalkhsdh[24] " Scanner  :"
	setVar $lkjassdalkhsdh[25] " Alignment :"
	setVar $lkjassdalkhsdh[26] " Experience:"
	setVar $lkjassdalkhsdh[27] " Ship ID   :"
	setVar $lkjassdalkhsdh[28] " Planet # :"
	setVar $lkjassdalkhsdh[29] "Time Left:"
	setVar $lkjassdalkhsdh[30] "     Prompt:"
	setVar $lkjassdalkhsdh[31] " IG Status:"
	setVar $lkjassdalkhsdh[32] "  Bot Mode :"
	setVar $lkjassdalkhsdh[33] " Team Name :"
	setVar $lkjassdalkhsdh[34] "Planet #  :"
	setVar $lkjassdalkhsdh[35] " Fed Safe: "
	setVar $udsaasfewfgtthryhi[1] $PLAYER~CURRENT_SECTOR
	if ($PLAYER~unlimitedGame)
		setVar $udsaasfewfgtthryhi[2] "Unlim"
	else
		setVar $udsaasfewfgtthryhi[2] $PLAYER~TURNS
	end
	setVar $udsaasfewfgtthryhi[3] $PLAYER~CREDITS
	setVar $udsaasfewfgtthryhi[4] $PLAYER~FIGHTERS
	setVar $udsaasfewfgtthryhi[5] $PLAYER~SHIELDS
	setVar $udsaasfewfgtthryhi[6] $player~total_holds
	setVar $udsaasfewfgtthryhi[7] $player~ore_holds
	setVar $udsaasfewfgtthryhi[8] $player~organic_holds
	setVar $udsaasfewfgtthryhi[9] $player~equipment_holds
	setVar $udsaasfewfgtthryhi[10] $player~colonist_holds
	setVar $udsaasfewfgtthryhi[11] $PLAYER~PHOTONS
	setVar $udsaasfewfgtthryhi[12] $PLAYER~ARMIDS
	setVar $udsaasfewfgtthryhi[13] $PLAYER~LIMPETS
	setVar $udsaasfewfgtthryhi[14] $PLAYER~GENESIS
	setVar $udsaasfewfgtthryhi[15] $PLAYER~TWARP_TYPE
	setVar $udsaasfewfgtthryhi[16] $PLAYER~CLOAKS
	setVar $udsaasfewfgtthryhi[17] $PLAYER~BEACONS
	setVar $udsaasfewfgtthryhi[18] $PLAYER~ATOMIC
	setVar $udsaasfewfgtthryhi[19] $PLAYER~CORBO
	setVar $udsaasfewfgtthryhi[20] $PLAYER~EPROBES
	setVar $udsaasfewfgtthryhi[21] $PLAYER~MINE_DISRUPTORS
	setVar $udsaasfewfgtthryhi[22] $PLAYER~PSYCHIC_PROBE
	setVar $udsaasfewfgtthryhi[23] $PLAYER~PLANET_SCANNER
	setVar $udsaasfewfgtthryhi[24] $PLAYER~SCAN_TYPE
	setVar $udsaasfewfgtthryhi[25] $PLAYER~ALIGNMENT
	setVar $udsaasfewfgtthryhi[26] $PLAYER~EXPERIENCE
	setVar $udsaasfewfgtthryhi[27] $PLAYER~SHIP_NUMBER
	if (($PLAYER~startingLocation = "Planet") OR ($PLAYER~startingLocation = "Citadel"))
		if ($planet~planet = "0")
			setVar $udsaasfewfgtthryhi[28] "None"
		else
			setVar $udsaasfewfgtthryhi[28] $planet~planet
		end
	else
		setVar $udsaasfewfgtthryhi[28] "None"
	end
	if ($idasoiudsa = "00:00:00")
		setVar $udsaasfewfgtthryhi[29] "Unlim"
	else
		setVar $udsaasfewfgtthryhi[29] $idasoiudsa
	end
	
	if (($PLAYER~startingLocation = "Planet") OR ($PLAYER~startingLocation = "Citadel") OR ($PLAYER~startingLocation = "Corporate") OR ($PLAYER~startingLocation = "Command"))
		setVar $udsaasfewfgtthryhi[30] $PLAYER~startingLocation
	else
		setVar $dasjhsakjsda $PLAYER~FULL_CURRENT_PROMPT
		getLength $dasjhsakjsda $dasjhsakjsda_length
		if ($hadksjds > 10)
			cutText $dasjhsakjsda $dasjhsakjsda 1 10
		end
		setVar $udsaasfewfgtthryhi[30] $dasjhsakjsda
	end
	setVar $udsaasfewfgtthryhi[31] $PLAYER~igstat
	setVar $udsaasfewfgtthryhi[32] $BOT~mode
	if (($BOT~bot_team_name = "all") OR ($BOT~bot_team_name = FALSE))
		setVar $udsaasfewfgtthryhi[33] "None"
	else
		setVar $udsaasfewfgtthryhi[33] $BOT~bot_team_name
	end
	if ($planet~planet = "0")
		setVar $udsaasfewfgtthryhi[34] "None"
	else
		setVar $udsaasfewfgtthryhi[34] $planet~planet
	end
	if ($adskljl = true)
		setVar $udsaasfewfgtthryhi[35] "Yes"
	else
		setVar $udsaasfewfgtthryhi[35] "No"
	end

	setVar $jgrerllkhasd 0
	setVar $kjsahd 1
	setVar $euiqwye " "
	setVar $qwu 15
:qss_gather
	while ($kjsahd <= 35)
		setVar $iweqiu 1
		#upperCase $lkjassdalkhsdh[$kjsahd]
		setVar $auaoeieoiofksa[$kjsahd] $lkjassdalkhsdh[$kjsahd]&$udsaasfewfgtthryhi[$kjsahd]
		setVar $klkal 18
		getLength $auaoeieoiofksa[$kjsahd] $qwoiwqoei
		subtract $klkal $qwoiwqoei
		while ($klkal >= 0)
			setVar $auaoeieoiofksa[$kjsahd] $auaoeieoiofksa[$kjsahd]&$euiqwye 
			subtract $klkal 1
		end
		add $kjsahd 1
	end
:qss_send
						 setVar $SWITCHBOARD~message "                    --- Status Update ---                        *"
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"----------------------------------------------------------------*"
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  "&$auaoeieoiofksa[1]&$auaoeieoiofksa[27]&$auaoeieoiofksa[28]&"*"
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  "&$auaoeieoiofksa[3]&$auaoeieoiofksa[4]&$auaoeieoiofksa[13]&"*"
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  "&$auaoeieoiofksa[2]&$auaoeieoiofksa[5]&$auaoeieoiofksa[12]&"*"
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  "&$auaoeieoiofksa[11]&$auaoeieoiofksa[25]&$auaoeieoiofksa[21]&"*"
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  "&$auaoeieoiofksa[6]&$auaoeieoiofksa[26]&$auaoeieoiofksa[20]&"*"
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  "&$auaoeieoiofksa[7]&$auaoeieoiofksa[17]&$auaoeieoiofksa[14]&"*"
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  "&$auaoeieoiofksa[8]&$auaoeieoiofksa[22]&$auaoeieoiofksa[18]&"*"
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  "&$auaoeieoiofksa[9]&$auaoeieoiofksa[19]&$auaoeieoiofksa[23]&"*"
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  "&$auaoeieoiofksa[10]&$auaoeieoiofksa[15]&$auaoeieoiofksa[24]&"*"
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  "&$auaoeieoiofksa[29]&$auaoeieoiofksa[33]&$auaoeieoiofksa[31]&"*"
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"    *"
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&$auaoeieoiofksa[32]&"  "&$auaoeieoiofksa[30]&"    "&$auaoeieoiofksa[35]&"*"
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"----------------------------------------------------------------**"
	
	if ($SWITCHBOARD~self_command <> TRUE)
		setVar $SWITCHBOARD~self_command 2
	else
		setVar $SWITCHBOARD~message "   *"&$SWITCHBOARD~message
	end
	gosub :SWITCHBOARD~switchboard
halt
# ============================== END QSS SUB ==============================






# includes:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\player\getinfo\player"
