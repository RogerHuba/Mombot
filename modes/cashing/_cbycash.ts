
:menu1
	getInput $amount "Enter the cash to transfer: "
	isNumber $number $amount
	if ($number <> 1)
		echo ANSI_12 "*Invalid Number*"
		goto :menu1
	end
:menu2
	getInput $player~corpieName "Name of corpie: "
	
:game_server_prompt
killalltriggers
#send "#"
#setTextLineTrigger sendloginname :sendloginname "Please enter your name (ENTER for none):"
setDelayTrigger annoyance    :press_pound 300
setTextTrigger selectionp    :continue_on "Selection (? for menu):"
pause
goto :game_server_prompt

:continue_on
killalltriggers
send Game
waitFor "module now loading."
send "*        *      tN***"
waitFor "Password?"
send Password & "*"

setTextTrigger pause :pause "[Pause]"
setTextTrigger avoidclear :pause "Do you wish to clear some avoids?"
pause

:pause
killalltriggers
getWord CURRENTLINE $temp 3
if ($temp = "Delete")
        send "Y"
end
setTextTrigger pause :pause "[Pause]"
setTextTrigger abrtm :abrt "Searching for messages received since your last time on:"
setTextTrigger ship  :ship "What do you want to name your ship? "
send "**"
pause

:ship
killalltriggers
setTextTrigger onterra :inGame "Warps to Sector(s) :"
setTextTrigger failed1 :failed "Trade Wars 2002 Game Server"
setTextTrigger failed2 :failed "www.tradewars.com"
send "#.*"
waitFor "is what you want?"
send "y"
pause
:game_server_prompt

:inGame
killalltriggers
send "tc"
:try
#setTextTrigger transfer :transfer "Exchange with "&$player~corpieName
setTextTrigger failedTransfer :failedTransfer "Your Associate must be in the same sector to conduct transfers!"
setTextTrigger transfer2 :transferWrong "Exchange with "
setTextTrigger transfer3 :failedTransfer "<D> Display Corporations"

pause

:failedTransfer
	killAllTriggers
	send "'No corpie in sector 1!*"
	halt
:transferWrong
	killAllTriggers
	getWordPos CURRENTLINE $pos "Exchange with "&$player~corpieName
	if ($pos > 0)
		goto :transfer
	end
	send "n?"
	goto :try
:transfer
	killAllTriggers
	send "yt"&$amount&"* q cby"
	waitOn "Enter your choice:"
	send "x*#"
	goto :game_server_prompt


:failed
killalltriggers
goto :game_server_prompt

:sendloginname 
send LoginName & "*"
goto :game_server_prompt

:abrt
send "  "
goto :pause

:press_pound
send "#"
pause
