	gosub :BOT~loadVars


	setVar $BOT~help[1]  $BOT~tab&"last {hit} {fig} {limp} {armid}"
	setVar $BOT~help[2]  $BOT~tab&"   Displays last sector hit"
	setVar $BOT~help[3]  $BOT~tab&"       "
	setVar $BOT~help[4]  $BOT~tab&"       {hit} - last sector where "
	setVar $BOT~help[5]  $BOT~tab&"               fig, limp, or armid was hit"
	setVar $BOT~help[6]  $BOT~tab&"       {fig} - last fig sector hit"
	setVar $BOT~help[7]  $BOT~tab&"      {limp} - last limp sector hit"
	setVar $BOT~help[8]  $BOT~tab&"     {armid} - last armid sector hit"
	gosub :bot~helpfile

	getwordpos " "&$bot~user_command_line&" " $pos " f"
	if ($pos > 0)
		setvar $fig true
	else
		setvar $fig false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " l"
	if ($pos > 0)
		setvar $limp true
	else
		setvar $limp false
	end

	getwordpos " "&$bot~user_command_line&" " $pos " a"
	if ($pos > 0)
		setvar $armid true
	else
		setvar $armid false
	end

	setvar $hit false
	if (($fig <> true) and ($limp <> true) and ($armid <> true))
		setvar $hit true
	end

	loadVar $bot~last_hit
	if ($bot~last_hit = 0)
		setvar $switchboard~message "There is no record of any sector hits.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	setvar $switchboard~message ""
	if ($hit)
		setvar $switchboard~message $switchboard~message&"    *Last hit:*"
		setVar $MAP~displaySector $bot~last_hit
		gosub :MAP~displaySector
		setVar $SWITCHBOARD~message $switchboard~message&"*"&$MAP~output
		listSectorParameters $bot~last_hit $bot~parms
		setvar $j 1
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"     *  "
		while ($j <= $bot~parms)
			getSectorParameter $i $bot~parms[$j] $check
			setVar $SWITCHBOARD~message $SWITCHBOARD~message&"    "&$bot~parms[$j]&": "&$check&"*"
			add $j 1
		end
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"     *     *"
	else
		if ($fig)
			loadVar $bot~last_fighter_hit
			if ($bot~last_fighter_hit = 0)
				setvar $switchboard~message $switchboard~message&"No fighter hit sector recorded.*"
			else
				setvar $switchboard~message $switchboard~message&"   *Last fighter hit:*"

				setVar $MAP~displaySector $bot~last_fighter_hit
				gosub :MAP~displaySector
				setVar $SWITCHBOARD~message $switchboard~message&"*"&$MAP~output
				listSectorParameters $bot~last_fighter_hit $bot~parms
				setvar $j 1
				setVar $SWITCHBOARD~message $SWITCHBOARD~message&"     *  "
				while ($j <= $bot~parms)
					getSectorParameter $i $bot~parms[$j] $check
					setVar $SWITCHBOARD~message $SWITCHBOARD~message&"    "&$bot~parms[$j]&": "&$check&"*"
					add $j 1
				end
				setVar $SWITCHBOARD~message $SWITCHBOARD~message&"     *     *"
			end
		end
		if ($limp)
			loadVar $bot~last_limpet_hit
			if ($bot~last_limpet_hit = 0)
				setvar $switchboard~message $switchboard~message&"No limpet hit sector recorded.*"
			else
				setvar $switchboard~message $switchboard~message&"    *Last limpet hit:*"

				setVar $MAP~displaySector $bot~last_limpet_hit
				gosub :MAP~displaySector
				setVar $SWITCHBOARD~message $switchboard~message&"*"&$MAP~output
				listSectorParameters $bot~last_limpet_hit $bot~parms
				setvar $j 1
				setVar $SWITCHBOARD~message $SWITCHBOARD~message&"     *  "
				while ($j <= $bot~parms)
					getSectorParameter $i $bot~parms[$j] $check
					setVar $SWITCHBOARD~message $SWITCHBOARD~message&"    "&$bot~parms[$j]&": "&$check&"*"
					add $j 1
				end
				setVar $SWITCHBOARD~message $SWITCHBOARD~message&"     *     *"
			end
		end
		if ($armid)
			loadVar $bot~last_armid_hit
			if ($bot~last_armid_hit = 0)
				setvar $switchboard~message $switchboard~message&"No armid hit sector recorded.*"
			else
				setvar $switchboard~message $switchboard~message&"   *Last armid hit:*"
			
				setVar $MAP~displaySector $bot~last_armid_hit
				gosub :MAP~displaySector
				setVar $SWITCHBOARD~message $switchboard~message&"*"&$MAP~output
				listSectorParameters $bot~last_armid_hit $bot~parms
				setvar $j 1
				setVar $SWITCHBOARD~message $SWITCHBOARD~message&"     *  "
				while ($j <= $bot~parms)
					getSectorParameter $i $bot~parms[$j] $check
					setVar $SWITCHBOARD~message $SWITCHBOARD~message&"    "&$bot~parms[$j]&": "&$check&"*"
					add $j 1
				end
				setVar $SWITCHBOARD~message $SWITCHBOARD~message&"     *     *"
			end
		end
	end



	gosub :SWITCHBOARD~switchboard
halt

# includes:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\map\displaysector\map"
include "source\bot_includes\switchboard"
