
gosub :BOT~loadVars


	setVar $BOT~help[1]  $BOT~tab&"       Buys minimum Ore/Org/Equip and dumps to planet          "
	setVar $BOT~help[2]  $BOT~tab&"           to gain experience from a SSS Port.      "
	setVar $BOT~help[3]  $BOT~tab&"       "
	setVar $BOT~help[4]  $BOT~tab&" bbb [expstop] {ore_holds} {org_holds} {equip_holds} {hagoff} {jet}"
	setVar $BOT~help[5]  $BOT~tab&"       "
	setVar $BOT~help[6]  $BOT~tab&" Options:"
	setVar $BOT~help[7]  $BOT~tab&"    [expstop]     STOP when you get to this exp."
	setVar $BOT~help[8]  $BOT~tab&"	                 Script also stops at 5k cash and 50 turns."
	setVar $BOT~help[9]  $BOT~tab&"    {hagoff}      Indicates you are using an external haggle script e.g. EP "
	setVar $BOT~help[10] $BOT~tab&"                   - Defaults to on"
	setVar $BOT~help[11] $BOT~tab&"    {ore_holds}   Number of ore to buy each loop; default 12"
	setVar $BOT~help[12] $BOT~tab&"    {org_holds}   Number of organics to buy each loop; default 6"
	setVar $BOT~help[13] $BOT~tab&"    {equip_holds} Number of equip to buy each loop; default 3"
	setVar $BOT~help[14] $BOT~tab&"    {jet}         No planet? no worries, we will just litter.. :("
	gosub :BOT~help_file

	setVar $BOT~script_title "Buy Buy Buy"
	gosub :BOT~banner



	setVar $internalHaggle 0
	setVar $useplanet TRUE


	gosub :player~quikstats
	
	setvar $startexp $player~experience
	setvar $startturns $player~turns


	getWordPos $bot~user_command_line $pos "jet"
	if ($pos > 0)
		setVar $useplanet FALSE
	else
		setVar $useplanet TRUE
	end


	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Planet") and ($startingLocation <> "Command"))
		setVar $SWITCHBOARD~message "Buy Buy Buy must be started from Planet or Command prompts.*"
		gosub :SWITCHBOARD~switchboard
		halt

	else

		if (($startingLocation = "Command") and ($useplanet = true))
			setVar $SWITCHBOARD~message "Buy Buy Buy must be started from Planet prompt in this mode.*"
			gosub :SWITCHBOARD~switchboard
			halt
		end

		if (($startingLocation = "Planet") and ($useplanet = false))
			send "q"
		end
	end

	getWordPos $bot~user_command_line $pos "hagoff"
	if ($pos > 0)
		setVar $internalHaggle FALSE
	else
		setVar $internalHaggle TRUE
	end

	
	setVar $halt_exp $bot~parm1
	isNumber $number $halt_exp

	if ($number <> 1)
		setvar $switchboard~message "Please select what experience to halt at.*"
		gosub :switchboard~switchboard
		halt
	
	end

	if ($halt_exp <= 0)
		setvar $switchboard~message "Halt experience must be greater than 0.*"
		gosub :switchboard~switchboard
		halt
	end


	setVar $ore $bot~parm2
	isNumber $number $ore

	if (($number <> 1) or ($bot~parm2 = 0))
		setVar $oreholds 12
	else
		setVar $oreholds $ore
	end

	if ($oreholds <= 0)
		setvar $switchboard~message "Ore Holds must be greater than 0.*"
		gosub :switchboard~switchboard
		halt
	end

	setVar $org $bot~parm3
	isNumber $number $org
	if (($number <> 1) or ($bot~parm3 = 0))
		setVar $org_holds 6
	else
		setVar $org_holds $org
	end

	if ($org_holds <= 0)
		setvar $switchboard~message "Org Holds must be greater than 0.*"
		gosub :switchboard~switchboard
		halt
	end

	setVar $equip $bot~parm4
	isNumber $number $equip
	if (($number <> 1) or ($bot~parm4 = 0))
		setVar $equip_holds 3
	else
		setVar $equip_holds $equip
	end

	if ($equip_holds <= 0)
		setvar $switchboard~message "Equip Holds must be greater than 0.*"
		gosub :switchboard~switchboard
		halt
	end

	
	if ($useplanet = TRUE)
		send "snl1*snl2*snl3*tnl1*tnl2*tnl3*"
	else
		send "J    y    *"
	end

	


setVar $totalholds ($oreholds + $org_holds + $equip_holds)
setVar $shipholds $player~total_holds
setVar $looptimes ($shipholds/$totalholds)

gosub :PLAYER~voidAdjacent



if ($useplanet = TRUE)
	send "l"
	send "d"
	waitfor "Planet #"
	getword CURRENTLINE $pnum 2
	stripText $pnum "#"
	send "q"
end

setVar $i 1

# just put this in because it should probably stop eventually, particularly when I program in a infinite loop... 10 times in a row... painful
setvar $trips 1000
setVar $notifyi 0
setVar $notifyi1st 1
while ($y < $trips)
	

	send "p t"
	
	setVar $quant 0
	gosub :weareselling
	if ($quant < $oreholds)
		setvar $switchboard~message "Low on available fuel ore, Halting...*"
		gosub :switchboard~switchboard
		send "0*0*0*"
		gosub :PLAYER~clearadjacent
		halt
	end

	send $oreholds "*"
	gosub :PLAYER~startHaggle
	if ($quant < $org_holds)
		setvar $switchboard~message "Low on available organics, Halting...*"
		gosub :switchboard~switchboard
		send "0*0*"
		gosub :PLAYER~clearadjacent
		halt
	end

	send $org_holds "*"
	gosub :PLAYER~startHaggle
	if ($quant < $equip_holds)
		setvar $switchboard~message "Low on available equipment, Halting...*"
		gosub :switchboard~switchboard
		send "0*"
		gosub :PLAYER~clearadjacent
		halt
	end
	send $equip_holds "*"
	gosub :PLAYER~startHaggle
	gosub :player~quikstats


	add $i 1
	if ($i > $looptimes)
		setVar $i 1
		if ($useplanet = TRUE)
			send "l" $pnum "*tnl1*tnl2*tnl3*q"
		else
			send "j  y  *  "
		end 
		
		add $y 1
	end
	
	
	add $notifyi 1
	if (($notifyi1st > 0) and ($notifyi = 5))
		add $notifyi1st 1
		gosub :calcstats
		setVar $notifyi 0
		if ($notifyi1st = 4)
			setvar $notifyi1st 0
		end
	end
	if ($notifyi > 30)
		gosub :calcstats
		setVar $notifyi 0
	end
	if ($player~credits < 5000)
		setvar $switchboard~message "Low on cash, Halting...*"
		gosub :switchboard~switchboard
		gosub :PLAYER~clearadjacent
		halt
	end
	if ($player~turns < 50)
		setvar $switchboard~message "Turns low.. keeping a few up our sleeve.. halting*"
		gosub :switchboard~switchboard
		gosub :PLAYER~clearadjacent
		halt
	end
	if ($player~EXPERIENCE > $halt_exp)
		setvar $switchboard~message "Experience target met.. halting*"
		gosub :switchboard~switchboard
		gosub :PLAYER~clearadjacent
		halt
	end
end




halt

:weareselling
	waitfor "We are selling up to"
	getword CURRENTLINE $quant 6
	stripText $quant "."
return


:calcstats
	
	setVar $expdiff ($player~experience - $startexp)
	setVar $turndiff ($startturns - $player~turns)
	setPrecision 2
	setVar $expperturn ($expdiff/$turndiff)
	setPrecision 0

	send "'We are making " $expperturn " per turn; exp @ " $player~experience "*"

return




halt

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player"
include "source\bot_includes\switchboard"
