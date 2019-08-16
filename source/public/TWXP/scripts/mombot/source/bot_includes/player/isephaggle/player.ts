:isEpHaggle
	setvar $isEpHaggle false
	listActiveScripts $scripts
	setvar $i 1
	while ($i <= $scripts)
		getWordPos "<><><>"&$scripts[$i] $pos "<><><>ephaggle"
		if ($pos > 0)
			setvar $isEpHaggle true
			gosub :quikstats
			if ((($alignment > 0) and (($experience > 900) and ($experience < 1000))) and ($bot~worstprice <> true))
				setvar $bot~bluehaggle true
				savevar $bot~bluehaggle
			else
				setvar $bot~bluehaggle false
				savevar $bot~bluehaggle
			end
		end
		add $i 1
	end
return
