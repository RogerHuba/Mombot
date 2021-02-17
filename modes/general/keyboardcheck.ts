:again
SetTextOutTrigger   UpArrow2    :output ""
pause
:output
getOutText $character
echo "[" $character "]*"   
goto :again