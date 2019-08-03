:currentPrompt
	setTextTrigger      prompt          :allPromptsCatch        #145 & #8
	setDelayTrigger     prompt_delay    :current_prompt_delay   5000
	send #145
	pause
	:current_prompt_delay
		setTextOutTrigger   atkeys      :current_prompt_at_keys
		setDelayTrigger     prompt_delay    :verifyDelay        30000
		pause
	:current_prompt_at_keys
		getOutText $out
		send $out
		killtrigger prompt_delay
		return
	:allPromptsCatch
		killtrigger prompt_delay
		getWord CURRENTLINE $CURRENT_PROMPT 1
		if ($CURRENT_PROMPT = 0)
			getWord CURRENTANSILINE $CURRENT_PROMPT 1
		end
		stripText $CURRENT_PROMPT #145
		stripText $CURRENT_PROMPT #8
		setVar $startingLocation $CURRENT_PROMPT
return


:verifyDelay
	killalltriggers
	disconnect

include "source\bot_includes\player\currentprompt\player"
