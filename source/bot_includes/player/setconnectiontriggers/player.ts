:setConnectionTriggers
	killtrigger discod1
	killtrigger discod2
	SetEventTrigger     Discod1     :Discod         "CONNECTION LOST"
	SetEventTrigger     Discod2     :Discod         "Connections have been temporarily disabled."

return
