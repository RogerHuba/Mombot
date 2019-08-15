# Beam File

loadVar $switchboard~bot_name
gosub :BOT~loadVars
	
setVar $BOT~help[1]  $BOT~tab&"   Beam File to Corp Mate"
setVar $BOT~help[2]  $BOT~tab&"  "
setVar $BOT~help[3]  $BOT~tab&"   File should be in mombot game directory"
setVar $BOT~help[4]  $BOT~tab&"         "
setVar $BOT~help[5]  $BOT~tab&"   beam [filename.txt] [botname] {override}"
setVar $BOT~help[6]  $BOT~tab&"         "
setVar $BOT~help[7]  $BOT~tab&"   >beam ports.txt ham"

gosub :bot~helpfile

setVar $recbot ""
if ($bot~parm1 = "receive")
	setVar $filerec $bot~parm2
	setVar $fullfile $BOT~FOLDER&"/"&$bot~parm2
	if (($filerec <> "0") and ($filerec <> ""))
		setVar $testFile $filerec

		gosub :testTxtFile
		fileExists $exists $fullfile
		if (($exists) and ($bot~parm3 <> "override")) 
			setVar $SWITCHBOARD~message "File Exists " & $filerec & ", please include override.*"
			gosub :SWITCHBOARD~switchboard
			halt
		elseif ($exists)
			delete $fullfile
		end
		setVar $SWITCHBOARD~message "Ready to Receive " & $filerec & ". BEAMFILE*"
		gosub :SWITCHBOARD~switchboard

		goto :receiveFile
		halt
	end
else
	if ($bot~parm1 = "0")
		setVar $SWITCHBOARD~message "Please specify file to send.*"
		gosub :SWITCHBOARD~switchboard
		halt
	else
		setVar $sendfile $BOT~FOLDER&"/"&$bot~parm1
		setVar $sendName $bot~parm1
		setVar $testFile $bot~parm1
		goSub :testTxtFile
		fileExists $exists $sendfile
		if ($exists)
			if ($bot~parm2 <> "")
				send "'" $bot~parm2 " qss*"
				setTextLineTrigger botfound :botfound "[General] {" & $bot~parm2 & "}"
				setDelayTrigger     timeout1 :timeout1 		8000
				pause
				:timeout1
					killalltriggers
					setVar $SWITCHBOARD~message "Receive Bot Not Found.*"
					gosub :SWITCHBOARD~switchboard
					halt
				:botfound
				killalltriggers
					setTextLineTrigger genFound :genFound "Bot Mode :General"
					setDelayTrigger     timeout2 :timeout2 		8000
					pause
					:timeout2
						killalltriggers
						setVar $SWITCHBOARD~message "Receive Bot Needs to be in General Mode.*"
						gosub :SWITCHBOARD~switchboard
						halt
					:genFound
						killalltriggers
						setVar $recbot $bot~parm2
			else
				setVar $SWITCHBOARD~message "Please specify the bot name receiving file.*"
				gosub :SWITCHBOARD~switchboard
				halt
			end
		else
			setVar $SWITCHBOARD~message "Can not find file: " & $sendfile & "*"
			gosub :SWITCHBOARD~switchboard
			halt
		end
	end
end

if ($bot~parm3 = "override")
	send "'" $recbot " beam receive " $sendName " override*"
else
	send "'" $recbot " beam receive " $sendName " *"
end


setTextLineTrigger beamready :beamready "BEAMFILE"
setDelayTrigger timeoutbeam :timeoutbeam 8000
pause
 :timeoutbeam
 killalltriggers
 	setVar $SWITCHBOARD~message "Failed to get beam start response.*"
	gosub :SWITCHBOARD~switchboard
	halt
 :beamready
 	killalltriggers
	goSub :sendFile
	setVar $SWITCHBOARD~message "File Transfer Complete.*"
	gosub :SWITCHBOARD~switchboard

halt

:sendFile
	
	setVar $maxRow 10
	setVar $beamendNeeded 0
	setVar $rowc 1
	setVar $i 1
	
	read $sendfile $line $i
	while ($line <> EOF)
		setVar $beamendNeeded 1
		if ($rowc = 1)
			send "'*[BEAMSTART]*"
		end
		if ($line <> "")
			send "[BSOL]" $line "[BEOL]*"
			add $rowc 1
		end
		add $i 1
		if ($rowc = $maxRow)
			send "[BEAMEND]**"
			setVar $rowc 1
			
			setTextLineTrigger beammore :beammore "[BEAMMORE]"
			setDelayTrigger     timeout3 :timeout3 		8000
			pause
			:timeout3
				killalltriggers
				setVar $SWITCHBOARD~message "Timed out beaming? uh oh.*"
				gosub :SWITCHBOARD~switchboard
				halt
			:beammore
				killalltriggers
			setVar $beamendNeeded 0
		end
		read $sendfile $line $i
	end
	if ($beamendNeeded = 1)
		send "[BEAMEND]**"
	end
	
	send "'[BEAMOVER]*"

return

:receiveFile

	:keepbeaming
	setTextLineTrigger beamstart :beamstart "[BEAMSTART]"
	setTextLineTrigger beameol :beameol "[BEOL]"
	setTextLineTrigger beamend :beamend "[BEAMEND]"
	setTextLineTrigger beamover :beamover "[BEAMOVER]"
	setDelayTrigger     timeout4 :timeout4 	8000
	pause
	:beamstart
		killalltriggers
		goto :keepbeaming
	
	:beameol
		killalltriggers
		getText CURRENTLINE $stuff "[BSOL]" "[BEOL]"
		write $fullfile $stuff & "*"
		goto :keepbeaming
	:beamend
		killalltriggers
		send "'[BEAMMORE]*"
		goto :keepbeaming
	:beamover
		killalltriggers
		setVar $SWITCHBOARD~message "You've left me beaming! Thanks for the file.*"
		gosub :SWITCHBOARD~switchboard
		halt

	:timeout4
		killalltriggers
		setVar $SWITCHBOARD~message "Timed out beaming? uh oh.*"
		gosub :SWITCHBOARD~switchboard
		halt

return

:testTxtFile
	replaceText $testFile "." " "
	getWord $testFile $testword 2
	if ($testword <> "txt")
		setVar $SWITCHBOARD~message "Please only send .txt files.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

return
# includes:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
