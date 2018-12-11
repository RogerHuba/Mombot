:start
loadVar $bot_name

send "'{" $bot_name "} - OZ Fed Monitor On Line!*"
:main
killAllTriggers
setDelayTrigger Notice	:warning		300000
setTextTrigger 0 :warning "INACTIVITY WARNING"
setTextTrigger 1 :grab " is surrounded by a glowing corona of warp energies!"
setTextTrigger 2 :grab " ship vanishes from scanners with a brilliant flash!"
setTextTrigger 3 :grab " warps into the sector."
setTextTrigger 4 :grab " warps out of the sector."
setTextTrigger 5 :grab "Scanners detect a wormhole opening in this sector!"
setTextTrigger 6 :grab " appears in a brilliant flash of warp energies!"
setTextTrigger 7 :grab " lands on the StarDock."
setTextTrigger 8 :grab " blasts off from the StarDock."
setTextTrigger 9 :grab " lands on Terra."
setTextTrigger 10 :grab " lifts off from Terra."
setTextTrigger 11 :grab " enters the game"
setTextTrigger 12 :grab " exits the game"
setTextTrigger 13 :grab " docks at Sol"
setTextTrigger 14 :grab " lifts off from Sol"
setTextTrigger 15 :grab " is powering up weapons systems!"
setTextTrigger 16 :grab " launches a wave of fighters at"
pause

:grab
killAllTriggers
cutText CURRENTLINE $spoof 1 2
if ($spoof = "P ") or ($spoof = "R ") or ($spoof = "F ")
	goto :main
end
cutText CURRENTLINE $ss 1 1
if ($ss = "'")
	goto :main
end
setVar $line CURRENTLINE
send "'{" $bot_name "} " $line "*"
goto :main

:warning
killAllTriggers
send "'{" $bot_name "} - OZ Fed Monitor On Line!*"
goto :main