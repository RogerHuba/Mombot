#  Label Ships Bot Addon  v1.00  (2016)  [Developer: Adept -- www.darkhorizontwgs.net]

loadVar $bot_name
loadVar $reg_fee

goSub :QSTATS

if ($_QSS[SECT] <> STARDOCK)
 send "'{" $bot_name "} - Please run Label Ships from StarDock. Halting.*"
 halt
end

#  Check prompt.
setVar $prompt_quit 1
getWord CURRENTLINE $prompt 1
if ($prompt <> "Command")
 if ($prompt = "<StarDock>") OR ($prompt = "Corporate") OR ($prompt = "Computer")
  send "Q"
 elseif ($prompt = "<Shipyards>") OR ($prompt = "Settings") OR ($prompt = "<Hardware") OR ($prompt = "<Galactic")
  send "QQ"
 else
  send "'{" $bot_name "} - Label Ships initialized from improper prompt. Halting.*"
  halt
 end
end

setVar $i 1
setVar $current_ship 0
setVar $done 0
setVar $line ""
setVar $return_ship $_QSS[SHIP]
setVar $ships ""

#  Checking current ship.
send "I"
waitOn "Ship Name      :"
setVar $line CURRENTLINE
stripText $line "Ship Name      : "
getWordPos $line $pos $_QSS[SHIP]
if ($pos = 0)
 setVar $ships[$i][NUMB] $_QSS[SHIP]
 setVar $ships[$i][NAME] $line & "-" & $ships[$i][NUMB]
 setVar $current_ship 1
 add $i 1
end

waitFor "Command [TL="
send "WN"
setTextTrigger depause :DEPAUSE "[Pause]"
setTextTrigger cnt :CONTINUE "------"
setTextTrigger blownstarport :BLOWN_STARPORT "Captain! Are you sure you want to port here?"
pause


:CONTINUE
#  Generate whole processing queue from tow listing.
killTrigger cnt

while ($done = 0)
 waitFor " "
 setVar $line CURRENTLINE
 if ($line = "You do not own any other ships in this sector!")
  setVar $done 1
 elseif ($line = "Choose which ship to tow (Q=Quit) ")
  setVar $done 2
 else
  getWord $line $ck 2
  if ($ck = $_QSS[SECT])
   getWord $line $ship_numb 1
   getWordPos $line $pos $_QSS[SECT]
   getLength $_QSS[SECT] $len
   cutText $line $ship_name ($pos+$len+1) 15
   getWordPos $ship_name $pos $ship_numb
   if ($pos = 0)
    setVar $ships[$i][NUMB] $ship_numb
    setVar $ships[$i][NAME] $ship_name
    stripText $ships[$i][NAME] "  "
    setVar $ships[$i][NAME] $ships[$i][NAME] & "-" & $ships[$i][NUMB]
    replaceText $ships[$i][NAME] " -" "-"
    add $i 1
   end
  end
 end
end

send "Q*"

setVar $turns_req ($i*2)
if ($_QSS[TURNS] < $turns_req)
 send "'{" $bot_name "} - I lack the turns process " & $i & " ships. Halting.*"
 halt
end

setVar $queue ($i-1)
setVar $i 1

goSub :CHECK_FUNDS

goto :ENGAGE

:ENGAGE
killAllTriggers
setTextLineTrigger error1 :NOT_AVAIL "That is not an available ship."
setTextLineTrigger error2 :NOT_CEO "Your retinal scan does not match that of the CEO."
setTextLineTrigger error3 :NO_COMMISH "You are not commissioned by the Federation to captain this ship."
setTextLineTrigger error4 :NO_EXP "exerience to captain that ship."
waitFor " "

while ($i <= $queue)

 if ($current_ship = 0)
  send "X* "
  send $ships[$i][NUMB] & "* Q"
 else
  setVar $current_ship 0
 end

 send "P"
 waitFor "Enter your choice [T] ?"
 send "S SR"

 if ($reg_fee = 0)
  waitFor "creds to process a different ship name."
  getWord CURRENTLINE $reg_fee 3
  stripText $reg_fee ","
  saveVar $reg_fee
  goSub :CHECK_FUNDS
 end

 waitFor "Still interested?"
 send "Y"
 waitFor "What do you want to name your ship?"

 send $ships[$i][NAME] & "*YQQ"
 waitFor "Command [TL="
 add $i 1

end

goto :CLEANUP

:NOT_AVAIL
send "'{" $bot_name "} - Ship Number: " & $ships[$i][NUMB] & " is no longer here. Bypassing.*"
add $i 1
goto :ENGAGE

:NOT_CEO
send "'{" $bot_name "} - Ship Number: " & $ships[$i][NUMB] & " is only accessible by the CEO. Bypassing.*"
add $i 1
goto :ENGAGE

:NO_COMMISH
send "'{" $bot_name "} - Ship Number: " & $ships[$i][NUMB] & " requires a Fed-Commish. Bypassing.*"
add $i 1
goto :ENGAGE 

:NOT_EXP
send "'{" $bot_name "} - Ship Number: " & $ships[$i][NUMB] & " requires additional experience. Bypassing.*"
add $i 1
goto :ENGAGE


:BLOWN_STARPORT
KillAllTriggers
send "'{" $bot_name "} - The StarDock has been DESTROYED! Halting.*"
halt


:CHECK_FUNDS
#  Check onhand cash to cover costs.
setVar $total ($reg_fee*$queue)
if ($_QSS[CREDS] < $total)
 setVar $cash_needed ($total-$_QSS[CREDS])
 send "'{" $bot_name "} - I require an additional: " & $cash_needed & "-credits to process all " & $queue & " ships. Halting.*"
 halt
end
return


:CLEANUP
killAllTriggers
if ($done = 1)
 if ($queue = 0)
   send "'{" $bot_name "} - There are no ships ready for labeling at StarDock. Halting.*"
 else
  send "'{" $bot_name "} - My current ship has been labeled.*"
 end
else
 send "X* " & $return_ship & "* Q"
 send "'{" $bot_name "} - " & $queue & " ships labeled and ready for transport at the StarDock.*/D"
end
halt


:DEPAUSE
killTrigger depause
send "*"
setTextTrigger depause :DEPAUSE "[Pause]"
pause


:QSTATS
#  Improved Quick Stats Subroutine  v2.02.  Update quick stat data as a dynamic array.  Use placeholder:  $_QSS[ITEM]
setVar $break 0
setVar $qss_line ""
send "/"
waitFor #179 & "Creds"
while ($break = 0)
 setVar $line CURRENTLINE
 getWordPos $line $break "Ship"
 setVar $qss_line $qss_line & $line
 waitFor " "
end
replaceText $qss_line #179 " "
stripText $qss_line ","
upperCase $qss_line
replaceText $qss_line "YES" 1
replaceText $qss_line "NO" 0
setVar $a 1
setVar $item ""
while ($item <> "SHIP")
 getWord $qss_line $item $a
 getWord $qss_line $data ($a + 1)
 setVar $_QSS[$item] $data
 add $a 2
 if ($a > 60)
  send "'{" & $bot_name & "} - QSS ERROR: Unable to complete data refresh!*"
  return
 end
end
return
#  END QSTATS.
