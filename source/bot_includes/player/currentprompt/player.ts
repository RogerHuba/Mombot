:currentPrompt
	setVar $CURRENT_PROMPT      "Undefined"
	killtrigger noprompt
	killtrigger prompt
	killtrigger getLine2
	setvar $fedspace false
	loadvar $unlimitedGame
	setTextLineTrigger  prompt      :allPrompts     #145 & #8
	send #145
	pause
	:allPrompts
		setvar $ansiline currentansiline
		setvar $self_destruct_prompt false
		getwordpos $ansiline $pos "ARE YOU SURE CAPTAIN? (Y/N) [N]"
		if ($pos > 0)
			setvar $self_destruct_prompt true
		end

		getWord CURRENTLINE $CURRENT_PROMPT 1
		setVar $FULL_CURRENT_PROMPT CURRENTLINE
		stripText $FULL_CURRENT_PROMPT #145
		stripText $FULL_CURRENT_PROMPT #8
		stripText $CURRENT_PROMPT #145
		stripText $CURRENT_PROMPT #8
return


:verifyDelay
	killalltriggers
	disconnect

