# ============================== GAME INITIALIZATIONS ==============================
:getInitialSettings
	gosub :validation
	getWord CURRENTLINE $startingLocation 1
	echo "*"&$scriptname & $mom_bot_version & " - Starting Up!*"
	fileExists $FIG_FILE_chk $FIG_FILE
	if ($FIG_FILE_chk)
		readToArray $FIG_FILE $FIGHTER_GRID
	else
		setArray $FIGHTER_GRID SECTORS
	end
	fileExists $SCRIPT_FILE_chk $SCRIPT_FILE
	if ($SCRIPT_FILE_chk)
		setArray $HOTKEY_SCRIPTS 10 1
    		setVar $i 1
		setVar $HOTKEY_SCRIPTS 0
    		read $SCRIPT_FILE $line $i
    		while ($line <> "EOF")
			getWord $line $fileLocation 1
			getWordPos $line $pos #34
			if ($pos <= 0)
				echo "Error with script file. either remove " & $SCRIPT_FILE & ", or fix it*"
				halt
			end
			cutText $line $scriptName $pos 9999
			stripText $scriptName #34
      			setVar $HOTKEY_SCRIPTS[$i] $fileLocation
      			setVar $HOTKEY_SCRIPTS[$i][1] $scriptName
			add $i 1
			add $HOTKEY_SCRIPTS 1
      			read $SCRIPT_FILE $line $i

    		end
	else
		setArray $HOTKEY_SCRIPTS 10 2
	end
	fileExists $gfile_chk $gconfig_file
	if ($gfile_chk)
		setVar $gameStats TRUE
		loadVar $mbbs
		loadVar $steal_factor
		loadVar $rob_factor
		loadVar $ptradesetting
		loadVar $port_max
		loadVar $unlimitedGame
		loadVar $armidCost
		loadVar $limpetCost
		loadVar $photonCost
		read $gconfig_file $bot_name 1
		if (($startingLocation = "Command") OR ($startingLocation = "Citadel"))
			gosub :getCorpies
			gosub :quikstats
			gosub :getInfo
			gosub :getShipStats
			fileExists $CAP_FILE_chk $CAP_FILE
			if ($CAP_FILE_chk)
				gosub :loadshipinfo
			else
				gosub :getShipCapStats
				gosub :loadShipInfo
			end
		else
			fileExists $USER_FILE_chk $BOT_USER_FILE
			if ($USER_FILE_chk)
				readToArray $BOT_USER_FILE $corpy
				setVar $corpyCount $corpy
			else
				setArray $corpy 1
			end
			fileExists $CAP_FILE_chk $CAP_FILE
			if ($CAP_FILE_chk)
				gosub :loadshipinfo
			end
		end
	else
		:conf_bot
			echo "*{M()M-Bot} . . . Getting Initial Settings . . . "
			echo "*{M()M-Bot} . . . Communications Off . . . **"
			echo ANSI_13 "*Game is not set up for M()M-Bot, doing now . . . *"
			gosub :add_game

			if (($startingLocation = "Command") OR ($startingLocation = "Citadel"))
				gosub :getCorpies
				gosub :gameStats
				setVar $gameStats TRUE
				gosub :quikstats
				gosub :getInfo
				fileExists $CAP_FILE_chk $CAP_FILE
				if ($CAP_FILE_chk)
					gosub :loadshipinfo
				else
					gosub :getShipCapStats
					gosub :loadShipInfo
				end
			else
				fileExists $FIG_FILE_chk $BOT_USER_FILE
				if ($FIG_FILE_chk)
					setArray $corpy 1
					readToArray $BOT_USER_FILE $corpy
					setVar $corpyCount $corpy
				end
				fileExists $CAP_FILE_chk $CAP_FILE
				if ($CAP_FILE_chk)
					gosub :loadshipinfo
				end
			end
	end
	loadVar $password
	loadVar $newPrompt
	loadVar $surroundAvoidShieldedOnly
	loadVar $surroundAutoCapture
	loadVar $stardock
	loadVar $rylos
	loadVar $alpha_centauri
	loadVar $home_sector
	loadVar $surroundFigs
	loadVar $surroundLimp
	loadVar $surroundMine
	loadVar $surroundOverwrite
	loadVar $surroundPassive
	loadVar $surroundNormal

	if ($password = 0)
		setVar $password PASSWORD
	end
	if ($stardock <= 0)
		setVar $stardock STARDOCK
		saveVar $stardock
	end
	if ($rylos <= 0)
		setVar $rylos RYLOS
		saveVar $rylos
	end
	if ($alpha_centauri <= 0)
		setVar $alpha_centauri ALPHACENTAURI
		saveVar $alpha_centauri
	end
	if ($armidCost <= 0)
		setVar $armidCost 1000
	end
	if ($limpetCost <= 0)
		setVar $limpetCost 40000
	end
	if ($photonCost <= 0)
		setVar $armidCost 100000
	end
	goto :run_bot
# ============================== END GAME INITIALIZATIONS SUB ==============================

# ============================== SCRIPT VALIDATION ==============================
:validation
#	GetTime $CurrentDate "d:m:yyyy"
#	GetWordPos $CurrentDate $SemiPos ":"
#	CutText $CurrentDate $Day 1 ($SemiPos - 1)
#	CutText $CurrentDate $CurrentDate ($SemiPos +1) 999
#	GetWordPos $CurrentDate $SemiPos ":"
#	CutText $CurrentDate $Month 1 ($SemiPos - 1)
#	CutText $CurrentDate $Year ($SemiPos +1) 999
#	if (($TRADER_NAME <> "") and ($TRADER_NAME <> "bob") and ($TRADER_NAME <> "Bob") and ($TRADER_NAME <> "BOB"))
#		Setvar $OkayToUse FALSE
#	end
#	if ($Month <> 2)
#		Setvar $OkayToUse FALSE
#	end
#	if ($Year <> 2006)
#		Setvar $OkayToUse FALSE
#	end
#	if ($Day > 22)
#		Setvar $OkayToUse FALSE
#	end
#	if (STARDOCK <> 1222)
#		Setvar $OkayToUse FALSE
#	end
#	if (SECTORS <> 5000)
#		Setvar $OkayToUse FALSE
#	end
#	if ($OkayToUse = FALSE)
#		echo "***"
#		echo ansi_12 "This script is no longer valid, contact A Mind ()ver Matter member for extension.*"
#		echo ansi_13 "This script is no longer valid, contact A Mind ()ver Matter member for extension.*"
#		echo ansi_14 "This script is no longer valid, contact A Mind ()ver Matter member for extension.*"
#		echo ansi_15 "This script is no longer valid, contact A Mind ()ver Matter member for extension.*"
#		echo "***"
#	halt
#	end
return
# ============================== END SCRIPT VALIDATION SUB==============================
