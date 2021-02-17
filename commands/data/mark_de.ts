:makedeadend
setArray $deadEnds SECTORS
setvar $count 1
while ($count <= SECTORS)
	if (SECTOR.WARPINCOUNT[$count] = 1)
		setvar $deadEnds[$count] 1
		add $deadEnds 1
		if (SECTOR.WARPCOUNT[$count] >= 1)
			setSectorParameter $count "DEADEND" TRUE
		end
	 else
		  setSectorParameter $count "DEADEND" ""
	 end
	 add $count 1
end
