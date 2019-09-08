	gosub :BOT~loadVars


	setVar $BOT~help[1] $BOT~tab&"Set sector parameters"
	setVar $BOT~help[2] $BOT~tab&"      setparms [parameter] [value] {sector} "
	setVar $BOT~help[3] $BOT~tab&"       "
	setVar $BOT~help[4] $BOT~tab&"Usage: "
	setVar $BOT~help[5] $BOT~tab&"       >setparms BUSTED 1 45"
	setVar $BOT~help[6] $BOT~tab&"       >setparms FIGSEC 1 "
	setVar $BOT~help[7] $BOT~tab&"        "
	setVar $BOT~help[8] $BOT~tab&"       Note: assumes current sector if sector isn't entered"
	gosub :bot~helpfile


setVar $name $bot~parm1
upperCase $name

setVar $value $bot~parm2
uppercase $value
if ($value = "TRUE")
	setvar $value true
end
if ($value = "FALSE")
	setvar $value false
end


IF ($bot~parm3 > 0)
     setVar $hub $bot~parm3
ELSE
     setVar $hub CURRENTSECTOR
END

setSectorParameter $hub $name $value
setvar $switchboard~message "Parameter "&$name&" has been set to "&$value&" in sector "&$hub&".*"
gosub :switchboard~switchboard

halt
