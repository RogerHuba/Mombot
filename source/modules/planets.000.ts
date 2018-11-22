openMenu TWX_TOGGLEDEAF false
closeMenu
#window planets 400 550 "Planet List" ONTOP

setVar $i 2
:keepgoing
killalltriggers
setVar $foundSectors 0
setVar $output "*"
while (($i <= SECTORS) AND ($foundSectors < 5))
	getSectorParameter $i "FIGSEC" $isFigged
	setVar $owner SECTOR.FIGS.OWNER[$i]
	if (($isFigged <> TRUE) AND ($owner <> "belong to your Corp") AND ($owner <> "yours"))
		if (SECTOR.PLANETCOUNT[$i] > 0)
			setVar $output $output&ANSI_10&"Sector  "&ANSI_14&": "&ANSI_11&$i&ANSI_2&" in "&ANSI_1&SECTOR.CONSTELLATION[$i]&"*"
			if (PORT.EXISTS[$i])
				setVar $class PORT.CLASS[$i]
				setVar $output $output&ANSI_10&"Ports   "&ANSI_14&": "&ANSI_11&PORT.NAME[$i]&ANSI_14&", "&ANSI_5&"Class "&$class&" "
				if (($class <> "0") AND ($class <> "9"))
					setVar $output $output&ANSI_5&"("
					if (PORT.BUYFUEL[$i])
						setVar $output $output&ANSI_2&"B"
					else
						setVar $output $output&ANSI_11&"S"
					end
					if (PORT.BUYORG[$i])
						setVar $output $output&ANSI_2&"B"
					else
						setVar $output $output&ANSI_11&"S"
					end
					if (PORT.BUYEQUIP[$i])
						setVar $output $output&ANSI_2&"B"
					else
						setVar $output $output&ANSI_11&"S"
					end
					setVar $output $output&ANSI_5&")"
				end
				setVar $output $output&"*"
			end
			setVar $j 1
			while ($j <= SECTOR.PLANETCOUNT[$i])
				setVar $isShielded FALSE
				setVar $temp SECTOR.PLANETS[$i][$j]
				getWord $temp $test 1
				if ($test = "<<<<")
					setVar $isShielded TRUE
				end
				getWord $temp $type 2
				stripText $type "("
				stripText $type ")"
				if ($isShielded)
					getLength $temp $length
					cutText $temp $temp 1 ($length-15)
					cutText $temp $temp 10 9999
					setVar $temp ANSI_12&"<<<< "&ANSI_10&"("&ANSI_14&$type&ANSI_10&") "&ANSI_1&$temp&ANSI_12&" >>>> "&ANSI_2&"(Shielded)"
				else
					setVar $temp ANSI_2&$temp
				end
				if ($j = 1)
					setVar $temp ANSI_5&"Planets "&ANSI_14&": "&$temp
					setVar $output $output&$temp&"*"
				else
					setVar $output $output&"          "&$temp&"*"
				end
				add $j 1
			end
			setVar $output $output&ANSI_5&"Fighters"&ANSI_14&": "&ANSI_11&SECTOR.FIGS.QUANTITY[$i]&ANSI_5&" ("&SECTOR.FIGS.OWNER[$i]&") "&ANSI_6&"["&SECTOR.FIGS.TYPE[$i]&"]**"
			add $foundSectors 1
		end
	end
	add $i 1
end
if ($foundSectors > 0)
	echo "[2J"&$output
	if ($i >= SECTORS)
		echo "*End of List"
	end
end
setTextOutTrigger quitkey :stop "q"
setTextOutTrigger quitkey2 :stop "Q"
setTextOutTrigger anykey :keepgoing 
pause

:stop
killalltriggers
openMenu TWX_TOGGLEDEAF false
closeMenu
echo "*Halting..*"
halt