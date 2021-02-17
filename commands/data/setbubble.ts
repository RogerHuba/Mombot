	gosub :BOT~loadVars


	setVar $BOT~help[1]  $BOT~tab&"setbubble {door sector | clear} "
	setVar $BOT~help[2]  $BOT~tab&"  Sets sectors to BUBBLE based on door"
	setVar $BOT~help[3]  $BOT~tab&"      "
	setVar $BOT~help[4]  $BOT~tab&"  clear - clears all BUBBLE params"
	gosub :bot~helpfile



	getWordPos $bot~user_command_line $pos "clear"
	if ($pos > 0)
		setVar $IDX 11
		setVar $perc 0
		while ($IDX <= SECTORS)
			setSectorParameter $IDX "BUBBLE" ""
			setSectorParameter $IDX "FARM" ""
			setSectorParameter $IDX "DOOR" ""
			add $IDX 1
			setVar $percTest (($IDX * 100) / SECTORS)
			if ($percTest > $perc)
				setVar $perc (($IDX * 100) / SECTORS)
				echo "*"
				echo #27 "["&($perc / 2)&"C"
				echo ANSI_14 "?" ANSI_15 " " $perc "%" #27 & "[1A   "
			end
		end
		DELETE $BUBBLE_LIST
		setVar $SWITCHBOARD~message "Bot Farming and Bubble Sectors Have Been Cleared.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end


		setVar $DOOR $bot~parm1
		setSectorParameter $DOOR "DOOR" TRUE
		setSectorParameter $DOOR "BUBBLE" TRUE
		setVar $bubble_sectors " "

		setVar $i 11
		setVar $count 0
		setVar $perc 0
		while ($i <= SECTORS)
			if ($i <> $DOOR)
				getCourse $path $i 1 
				if ($path = "-1")
					send "/"
					waitOn #179
					echo ANSI_14 "Updating database...*" ANSI_7
					send "^f"&$i&"*1**q"
					waitOn "ENDINTERROG"
					getCourse $path $i 1 
				end
				setVar $j 1
				setVar $found_bubble_sector FALSE
				while ($j <= $path)
					if ($path[$j] = $DOOR)
						setVar $found_bubble_sector TRUE
					end
					add $j 1
				end
				if ($found_bubble_sector = TRUE)
						write $BUBBLE_LIST $i
						setSectorParameter $i "BUBBLE" TRUE
						setVar $bubble_sectors $bubble_sectors&" "&$i  
						add $count 1
				else
						#setSectorParameter $i "BUBBLE" ""
				end

			end
			setVar $percTest (($i * 100) / SECTORS)
			if ($percTest > $perc)
				setVar $perc (($i * 100) / SECTORS)
				echo "*"
				echo #27 "["&($perc / 2)&"C"
				echo ANSI_14 "°" ANSI_15 " " $perc "%" #27 & "[1A   "
			end
			add $i 1
		end

		send "'*"&$count&" bubble sectors with door sector of "&$DOOR&": "&$bubble_sectors&"**"
		halt

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"

