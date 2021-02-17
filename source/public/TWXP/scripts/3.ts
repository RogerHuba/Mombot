
setVar $home 9966
setVar $planet 17
setVar $shortShip 1
setVar $shortShipRange 10
setVar $longship 32
setVar $gridShip 5




setVar $shipSector CURRENTSECTOR

send "cf*" $home "*q"
# IF WE DO THIS PROPERLY ADD OTHER PLOT OPTIONS - i.e. errors
waitfor "The shortest path ("
getWord CURRENTLINE $dist 4
stripText $dist "("
echo "#" $dist "#"
if ($dist <= $shortShipRange)
	send "x " $shortShip "* q "
else
	send "x " $longship "* q "
end
	
waitfor "Security code accepted,"

send "l" $planet "*tnt1*cb" $shipSector "*"
waitfor "Locating beam pinpointed, TransWarp"
send "y"
waitfor "Warps to Sector(s)"
send "wn" $gridShip "*"
waitfor "You lock your Tractor Beam o"

send "m" $home "*y"

waitfor "Locating beam pinpointed,"
send "y"
send "x " $gridShip "* q * * "

waitfor "Security code accepted,"

send "l" $planet "*cb" 
