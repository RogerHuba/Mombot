	logging off
	gosub :BOT~loadVars
									

	setVar $adskljl "33"
	setVar $idasoiudsa "h"

	setVar $lkjsad 5
	setVar $lkjassdalkhsdh 1500
	setVar $udsaasfewfgtthryhi "-100"

	setVar $auaoeieoiofksa FALSE
	getWordPos $bot~user_command_line $dasjhsakjsda "twoship"
	if ($dasjhsakjsda > 0)
		setVar $auaoeieoiofksa TRUE
	end

	if ($auaoeieoiofksa = TRUE)
		setVar $hadksjds 2
	else
		setVar $hadksjds 3
	end

	setArray $jgrerllkhasd $lkjsad $hadksjds
	setArray $kjsahd $lkjsad
	setArray $euiqwye $lkjsad
	setArray $qwu $lkjsad

	setArray $iweqiu $hadksjds 3

	setVar $klkal 2
	setVar $qwoiwqoei 1000
	setVar $wmmmdksl 999
	setArray $xndanknjads $klkal


	 setVar $BOT~help[1] $BOT~tab&"Steal, Dump, Transport with multiple bots "
	 setVar $BOT~help[2] $BOT~tab&"Options: "
	 setVar $BOT~help[3] $BOT~tab&"         [ship1] - ship id of first cashing ship "
	 setVar $BOT~help[4] $BOT~tab&"         [ship2] - ship id of second cashing ship "
	 setVar $BOT~help[5] $BOT~tab&"         [ship3] - ship id of third cashing ship "
	 setVar $BOT~help[6] $BOT~tab&"       {planet1} - planet id of first planet"
	 setVar $BOT~help[7] $BOT~tab&"       {planet2} - planet id of second planet"
	 setVar $BOT~help[8] $BOT~tab&"       {planet3} - planet id of third planet"
	 setVar $BOT~help[9] $BOT~tab&"      {override} - won't stop if blue not fedsafe"
	setVar $BOT~help[10] $BOT~tab&"    {planetfuel} - will grab fuel from red planets"
	setVar $BOT~help[11] $BOT~tab&"       {twoship} - will use two ships to cash"
	setVar $BOT~help[12] $BOT~tab&"           {X:N} - furb ship letter and holds to buy"
	setVar $BOT~help[13] $BOT~tab&"                 - Uses EP Haggle if running in bot"
	setVar $BOT~help[14] $BOT~tab&"Usage: "
	setVar $BOT~help[15] $BOT~tab&"        >teamsdt 3 4 5"
	setVar $BOT~help[16] $BOT~tab&"        >teamsdt 3 4 5 11 12 13"
	setVar $BOT~help[17] $BOT~tab&"        >teamsdt 6 7 4 override"
	setVar $BOT~help[18] $BOT~tab&"Note: "
	setVar $BOT~help[19] $BOT~tab&"       Planet ids are only necessary when multiple planets exist"
	setVar $BOT~help[20] $BOT~tab&"       in sector or planet scanners are on ships.   "
	gosub :bot~helpfile



	gosub :PLAYER~quikstats
	setVar $ajsdjnkajnsd $PLAYER~CURRENT_PROMPT
	if (($ajsdjnkajnsd <> "Citadel") AND ($ajsdjnkajnsd <> "Command"))
		setVar $SWITCHBOARD~MESSAGE "Team SDT controller must be run from Command or Citadel prompt.*"
		gosub :SWITCHBOARD~SWITCHBOARD
		halt
	end

	setVar $BOT~script_title "Team SDT"
	gosub :BOT~banner

	send "'"&$SWITCHBOARD~BOT_NAME&" login*"
	waitOn "Corporate command "

	setVar $SWITCHBOARD~MESSAGE "This script assumes all red bots, blue bots, ships, and planets are placed correctly before this script is run.*"
	gosub :SWITCHBOARD~SWITCHBOARD


	setVar $SWITCHBOARD~MESSAGE "Doing roll call.*"
	gosub :SWITCHBOARD~SWITCHBOARD

	setVar $asduhui FALSE
	getWordPos $bot~user_command_line $dasjhsakjsda "override"
	if ($dasjhsakjsda > 0)
		setVar $asduhui TRUE
	end
	if ($bot~parm4 = "override")
		setVar $bot~parm4 "0"
	end
	setVar $planet~planetfuel FALSE
	getWordPos $bot~user_command_line $dasjhsakjsda "planetfuel"
	if ($dasjhsakjsda > 0)
		setVar $planet~planetfuel TRUE
		
	end
	
	setVar $dakasjkjka 0
	gosub :player~isEpHaggle
	IF ($player~isEpHaggle)
		setVar $dakasjkjka 1
		setVar $SWITCHBOARD~message "Using EP HAGGLE!*"
		gosub :switchboard~switchboard
	END

	setVar $ajsdjka FALSE
	getWordPos $bot~user_command_line $dasjhsakjsda ":"
	if ($dasjhsakjsda > 0)
		setVar $sjdkjansdh $bot~user_command_line
		getWordPos $sjdkjansdh $whueqiehl ":"
		cutText $sjdkjansdh $mksdmkalkmasd ($whueqiehl - 1) 99
		getWord $mksdmkalkmasd $alsdkdsajhuh 1
		replaceText $alsdkdsajhuh ":" " "
		getword $alsdkdsajhuh $idasoiudsa 1
		getword $alsdkdsajhuh $adskljl 2
		
		echo "#" $idasoiudsa "-" $adskljl
		
	end

	
	isNumber $kjdasijoias $bot~parm1
	if (($kjdasijoias) and ($bot~parm1 <> ""))
		setVar $jaoadslds $bot~parm1
		setVar $iweqiu[1] $jaoadslds
	else
		setVar $SWITCHBOARD~MESSAGE "Ship #1 number invalid.  Shutting down.*"
		gosub :SWITCHBOARD~SWITCHBOARD	
		halt	
	end

	isNumber $kjdasijoias $bot~parm2
	if (($kjdasijoias) and ($bot~parm2 <> ""))
		setVar $jokdlskjli $bot~parm2
		setVar $iweqiu[2] $jokdlskjli
	else
		setVar $SWITCHBOARD~MESSAGE "Ship #2 number invalid.  Shutting down.*"
		gosub :SWITCHBOARD~SWITCHBOARD	
		halt	
	end

	if ($auaoeieoiofksa = TRUE)
		isNumber $kjdasijoias $bot~parm3
		if ($kjdasijoias)
			setVar $iweqiu[1][2] $bot~parm3
		else
			setVar $SWITCHBOARD~MESSAGE "Planet #1 number invalid.  Shutting down.*"
			gosub :SWITCHBOARD~SWITCHBOARD	
			halt	
		end

		isNumber $kjdasijoias $bot~parm4
		if ($kjdasijoias) 
			setVar $iweqiu[2][2] $bot~parm4
		else
			setVar $SWITCHBOARD~MESSAGE "Planet #2 number invalid.  Shutting down.*"
			gosub :SWITCHBOARD~SWITCHBOARD	
			halt	
		end
	else
		isNumber $kjdasijoias $bot~parm3
		if (($kjdasijoias) and ($bot~parm3 <> ""))
			setVar $aseioweuowud $bot~parm3
			if ($hadksjds >= 3)
				setVar $iweqiu[3] $aseioweuowud
			end
		else
			setVar $SWITCHBOARD~MESSAGE "Ship #3 number invalid.  Shutting down.*"
			gosub :SWITCHBOARD~SWITCHBOARD	
			halt	
		end

		isNumber $kjdasijoias $bot~parm4

		if ($kjdasijoias)
			setVar $iweqiu[1][2] $bot~parm4
		else
			#setVar $SWITCHBOARD~MESSAGE "Planet #1 number invalid.  Shutting down.*"
			#gosub :SWITCHBOARD~SWITCHBOARD	
			#halt	
			setVar $iweqiu[1][2] ""
		end

		isNumber $kjdasijoias $bot~parm5
		if ($kjdasijoias) 
			setVar $iweqiu[2][2] $bot~parm5
		else
			#setVar $SWITCHBOARD~MESSAGE "Planet #2 number invalid.  Shutting down.*"
			#gosub :SWITCHBOARD~SWITCHBOARD	
			#halt	
			setVar $iweqiu[2][2] ""
		end

		isNumber $kjdasijoias $bot~parm6
		if ($kjdasijoias)
			if ($hadksjds >= 3)
				setVar $iweqiu[3][2] $bot~parm6
			end
		else
			if ($hadksjds >= 3)
				#setVar $SWITCHBOARD~MESSAGE "Planet #3 number invalid.  Shutting down.*"
				#gosub :SWITCHBOARD~SWITCHBOARD	
				#halt	
				setVar $iweqiu[3][2] ""
			end
			
		end
	end


	setVar $joiaaslslsdj 1
	setVar $osadlkjlkji FALSE
	setVar $jdsadsaljfoi 0

	while (($joiaaslslsdj <= $lkjsad) AND ($osadlkjlkji = FALSE))
		send "'red"&$joiaaslslsdj&" callout*"
		setDelayTrigger delay :donered 3000
		setTextLineTrigger red :foundred "Team: red"&$joiaaslslsdj&" " 
		pause

		:toomanyred	
			setVar $SWITCHBOARD~MESSAGE "Too many bots responding to red"&$joiaaslslsdj&".  Please fix bot teams so each red is unique.*"
			gosub :SWITCHBOARD~SWITCHBOARD
			halt

		:dcdjknncn
			getWordPos CURRENTLINE $dasjhsakjsda "Team: "
			cutText CURRENTLINE $papsadlkjesp $dasjhsakjsda 9999
			getWord $papsadlkjesp $pppwpowooopp 4
			getWord $papsadlkjesp $ssldasjlkjassdasuuus 6
			getWord $papsadlkjesp $usuuddsasdsuus 8
			getWord $papsadlkjesp $iiasuiu 10
			getWord $papsadlkjesp $wwqhdhj 12
			getWord $papsadlkjesp $xczcxz 14

			getWordPos $usuuddsasdsuus $dasjhsakjsda "-"
			if (($dasjhsakjsda <= 0) OR ($ssldasjlkjassdasuuus < $lkjassdalkhsdh))
				setVar $SWITCHBOARD~MESSAGE "red"&$joiaaslslsdj&" does not have experience and alignment needed for stealing.  Stopping script.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			end
			if (($xczcxz < 100) AND ($PLAYER~UNLIMITED_GAME <> TRUE))
				setVar $SWITCHBOARD~MESSAGE "red"&$joiaaslslsdj&" does not have enough turns for stealing.  Stopping script.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			end			
			setVar $jgrerllkhasd[$joiaaslslsdj] $wwqhdhj
			setVar $kjsahd[$joiaaslslsdj] $xczcxz
			setVar $euiqwye[$joiaaslslsdj] $wwqhdhj
			setVar $qwu[$joiaaslslsdj] $wwqhdhj

			add $jdsadsaljfoi 1
			setTextLineTrigger red :nseuie "} - Team: red"&$joiaaslslsdj&" " 
			pause
		:ncnc
			killtrigger 0
			if ($jgrerllkhasd[$joiaaslslsdj] = 0)
				setVar $osadlkjlkji TRUE
			end
			add $joiaaslslsdj 1
	end

	if ($jdsadsaljfoi <= 1)
		setVar $SWITCHBOARD~MESSAGE "Found "&$jdsadsaljfoi&" red. Not enough reds to run Team SDT.  Make sure red bots callin as red1, red2, etc.*"
		gosub :SWITCHBOARD~SWITCHBOARD
		halt
	end

	setVar $SWITCHBOARD~MESSAGE "Found "&$jdsadsaljfoi&" red bots.*"
	gosub :SWITCHBOARD~SWITCHBOARD

	setVar $mnmmmmkl 0
	setVar $joiaaslslsdj 1
	while ($joiaaslslsdj <= $jdsadsaljfoi)

		setVar $asddnnn 1
		while ($asddnnn <= $hadksjds)
			if ($euiqwye[$asddnnnoiaaslslsdj] = $iweqiu[$asddnnn])
				setVar $SWITCHBOARD~MESSAGE "Red "&$asddnnnoiaaslslsdj&" please hop out of ship "&$iweqiu[$asddnnn]&" and into your sit ship.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				setVar $mnmmmmkl 1
				
			end
			add $asddnnn 1
		end
		add $joiaaslslsdj 1
	end
	if ($mnmmmmkl = 1)
		halt
	end

	setVar $joiaaslslsdj 1
	setVar $osadlkjlkji FALSE
	setVar $wqeiuwqiue 0

	while (($joiaaslslsdj <= $klkal) AND ($osadlkjlkji = FALSE))
		send "'blue"&$joiaaslslsdj&" callout*"
		setDelayTrigger delay :doneblue 4000
		setTextLineTrigger blue :foundblue "Team: blue"&$joiaaslslsdj&" " 
		pause

		:toomanyblue
			setVar $SWITCHBOARD~MESSAGE "Too many bots responding to blue"&$joiaaslslsdj&".  Please fix bot teams so each blue is unique.*"
			gosub :SWITCHBOARD~SWITCHBOARD
			halt

		:eoqpwelklksa
			getWordPos CURRENTLINE $dasjhsakjsda "Team: "
			cutText CURRENTLINE $papsadlkjesp $dasjhsakjsda 9999
			getWord $papsadlkjesp $lslashdh 4
			getWord $papsadlkjesp $jpqpwppw 6
			getWord $papsadlkjesp $tsjkkk 8
			getWord $papsadlkjesp $rtucat 10

			if ($tsjkkk < 1000)
				setVar $SWITCHBOARD~MESSAGE "blue"&$joiaaslslsdj&" does not have alignment needed for furbing.  Stopping script.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			end
			if ($lslashdh <> $MAP~STARDOCK)
				setVar $SWITCHBOARD~MESSAGE "blue"&$joiaaslslsdj&" is not at stardock ("&$MAP~STARDOCK&") for furbing.  Stopping script.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			end
			if (($jpqpwppw > $wmmmdksl) AND ($asduhui = FALSE))
				setVar $SWITCHBOARD~MESSAGE "blue"&$joiaaslslsdj&" has too much experience to be fed safe.  Stopping script.  If you want to continue anyway, use the override option.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			end
			setVar $xndanknjads[$joiaaslslsdj] $lslashdh
			add $wqeiuwqiue 1
			send "'blue"&$joiaaslslsdj&" stop ephaggle*"
			setDelayTrigger stopep :stopep 1000 
			pause
			:gufuweyghi
				killtrigger 0
			
			send "'blue"&$joiaaslslsdj&" login*"
			setDelayTrigger login :login 1000 
			pause
			:quojoiwsm
				killtrigger 0
			setTextLineTrigger blue :klasdncb "} - Team: blue"&$joiaaslslsdj&" " 
			pause
		:yewiiwuwqowopw
			killtrigger 0
			if ($xndanknjads[$joiaaslslsdj] = 0)
				setVar $osadlkjlkji TRUE
			end
			add $joiaaslslsdj 1
	end

	if ($wqeiuwqiue < 1)
		setVar $SWITCHBOARD~MESSAGE "Found "&$wqeiuwqiue&" blue. Not enough blue to run Team SDT.  Make sure blue bots callin as blue1, blue2, etc.*"
		gosub :SWITCHBOARD~SWITCHBOARD
		halt
	end

	setVar $SWITCHBOARD~MESSAGE "Found "&$wqeiuwqiue&" blue bot.*"
	gosub :SWITCHBOARD~SWITCHBOARD




	send "czq"
	waitOn "-----------------------------------------------------------------------------"
	settextlinetrigger     0     :getshipnumber "Corp"
	settextlinetrigger     0      :check_bot_status "Computer command ["
	pause
     
	:dlkadsasddsanc
		getword CURRENTLINE $dddog 1
		getword CURRENTLINE $sspencil 2
		isNumber $kjdasijoias $sspencil
		if ($kjdasijoias)
			setVar $joiaaslslsdj 1
			while ($joiaaslslsdj <= $hadksjds)
				if ($joiaaslslsdjweqiu[$joiaaslslsdj] = $dddog)
					setVar $joiaaslslsdjweqiu[$joiaaslslsdj][1] $sspencil
					setVar $joiaaslslsdjweqiu[$joiaaslslsdj][3] TRUE
				end
				add $joiaaslslsdj 1
			end
		end
		settextlinetrigger     0     :dlkadsasddsanc "Corp"
		pause
		
	:dmopqwefi
		killtrigger 0
		setVar $traderxx FALSE
		setVar $joiaaslslsdj 1
		while ($joiaaslslsdj <= $hadksjds)
			if ($joiaaslslsdjweqiu[$joiaaslslsdj][3] <> TRUE)
				setVar $traderxx TRUE 
			end
			add $joiaaslslsdj 1
		end
		if ($traderxx = FALSE)
			setVar $SWITCHBOARD~MESSAGE "Red ships all valid.*"
		else
			setVar $joiaaslslsdj 1
			while ($joiaaslslsdj <= $hadksjds)
				if ($joiaaslslsdjweqiu[$joiaaslslsdj][3] <> TRUE)
					setVar $SWITCHBOARD~MESSAGE "Ship: " & $joiaaslslsdjweqiu[$joiaaslslsdj] & " not avaliable!  HALTING*"
				end
				add $joiaaslslsdj 1
			end
		end
		gosub :SWITCHBOARD~SWITCHBOARD


		setVar $joiaaslslsdj 1
		while ($joiaaslslsdj <= $jdsadsaljfoi)
			setVar $asddnnn 1
			while ($asddnnn <= $hadksjds)

				setVar $xxportxx FALSE
				setVar $xxstarbasexx FALSE

				send "'red"&$asddnnnoiaaslslsdj&" param "&$iweqiu[$asddnnn][1]&"*"
				waitfor "Displaying sector parameters for"
				
				:checkbusts
				setDelayTrigger delay :donebust 2000
				setTextLineTrigger redbusted :redbusted " BUSTED: "
				setTextLineTrigger redfakebusted :redfakebusted "FAKEBUST: " 
				pause

				
				:oiuriyewjc
					killalltriggers
					getWordPos CURRENTLINE $dasjhsakjsda "BUSTED: "
					cutText CURRENTLINE $papsadlkjesp $dasjhsakjsda 9999
					getWord $papsadlkjesp $xxportxx 2
					goto :ugruvyh
				:ndndvdtveh 
					killalltriggers
					getWordPos CURRENTLINE $dasjhsakjsda "FAKEBUST: "
					cutText CURRENTLINE $papsadlkjesp $dasjhsakjsda 9999
					getWord $papsadlkjesp $xxstarbasexx 2
					
				:rbnlekde
					killalltriggers
					if ($xxportxx = TRUE)
						setVar $asddnnngrerllkhasd[$asddnnnoiaaslslsdj][$asddnnn] "B"
					else
						if ($xxstarbasexx = TRUE)
							setVar $asddnnngrerllkhasd[$asddnnnoiaaslslsdj][$asddnnn] "F"					
						else
							setVar $asddnnngrerllkhasd[$asddnnnoiaaslslsdj][$asddnnn] FALSE					
						end
					end
				add $asddnnn 1
			end
			
			send "'red"&$joiaaslslsdj&" ephaggle planet*"
			waitfor "EP Perfect Haggle loaded"
			add $joiaaslslsdj 1
		end
		if ($SWITCHBOARD~SELF_COMMAND = FALSE)
			setVar $SWITCHBOARD~SELF_COMMAND 2
		end

		setVar $oolandingoo TRUE
		setArray $pasparting 2 3
		while ($oolandingoo = TRUE)
			setVar $SWITCHBOARD~MESSAGE "Bust matrix so far:*"
			setVar $joiaaslslsdj 1
			while ($joiaaslslsdj <= $jdsadsaljfoi)
				setVar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"                RED"&$joiaaslslsdj&": "
				setVar $asddnnn 1
				while ($asddnnn <= $hadksjds)
					setVar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"["&$asddnnngrerllkhasd[$asddnnnoiaaslslsdj][$asddnnn]&"]"
					add $asddnnn 1
				end
				setVar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"*"
				add $joiaaslslsdj 1
			end
			gosub :SWITCHBOARD~SWITCHBOARD

			gosub :find_ports
			if ($dsuoas = FALSE)
				setVar $joiaaslslsdj 1
				while ($joiaaslslsdj <= $jdsadsaljfoi)
					setVar $asddnnn 1
					while ($asddnnn <= $hadksjds)
						if ($euiqwye[$asddnnnoiaaslslsdj] = $iweqiu[$asddnnn])
							setVar $hjsdakjh $joiaaslslsdj
							setVar $papapap $qwu[$joiaaslslsdj]
							setVar $euiqwye[$joiaaslslsdj] $papapap
							gosub :x
						end
						add $asddnnn 1
					end
					add $joiaaslslsdj 1
				end
				gosub :jnoudiewyt
			end
			if ($dsuoas = FALSE)
				setVar $SWITCHBOARD~MESSAGE "No possible safe choices in the bust matrix.  Stopping..*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			end
			if ($pasparting[1][2] = "0")
				setVar $pasparting[1][2] ""
				setVar $pasparting[2][2] ""
			end
			if ($dakasjkjka = 0)
				send "'red"&$pasparting[1]&" sdt "&$pasparting[1][1]&" "&$pasparting[2][1]&" "&$pasparting[1][2]&" "&$pasparting[2][2]&"*"
			else
				send "'red"&$pasparting[1]&" sdt "&$pasparting[1][1]&" "&$pasparting[2][1]&" "&$pasparting[1][2]&" "&$pasparting[2][2]&" ep*"
			end
			:repeatorders
			settextlinetrigger 0 :wrong "That is not an available ship, Script Halting."
			settextlinetrigger 0 :lraship "last rob attempt is this sector!"
			settextlinetrigger 0 :noexp "You need more experience to SDT!!!"
			settextlinetrigger 0 :nowar "This sector has no warps, maybe you need to scan it first"
			settextlinetrigger 0 :auto "Detected SWATH Autohaggle"
			settextlinetrigger 0 :lowturns "NO Bust, stopping because I'm down to"
			settextlinetrigger 0 :fake "FAKE"
			settextlinetrigger 0 :waitforredbust "Busted in ship"
			settextlinetrigger 0 :emergencystop "STOP"
			pause
			:bhdchnsjnswwhb
				killalltriggers
				cutText CURRENTLINE&"   " $yayayaya 1 1
				if (($yayayaya = "R") or ($yayayaya = "'"))
					
					send "'red"&$pasparting[1]&" STOPALL*"
					waitfor " All non-system scripts and modules killed, and"
					
					send "'red"&$pasparting[1]&" x "& $qwu[$pasparting[1]] &"*"
					settexttrigger 0 :emergency  "- Xport complete."
					pause
					:gtertyeu
					killalltriggers
						setVar $SWITCHBOARD~MESSAGE "Emergency Stop - Do something useful?*"
						gosub :SWITCHBOARD~SWITCHBOARD
						halt
				else
					goto :dvbjcnjme
				end
			:dcjcnbg
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "Ships got messed up somehow.  Better check it out!  Halting.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			:nfmewopijoeuf
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "One of the cashers lost too much experience.  Halting.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			:hveiybcnlck
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "One of the cashers has no knowledge of the sector they are in.  That's very odd. Halting.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			:mpissooso
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "One of the cashers has SWATH haggle on. Halting.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt
			:ososiodo
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "One of the cashers has run out of usable turns. Halting.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				halt

			:isdodsodjd
				killalltriggers
				setVar $SWITCHBOARD~MESSAGE "Red Fake Busted.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				setVar $SWITCHBOARD~MESSAGE "Fake Busts don't clear ports. .*"
				gosub :SWITCHBOARD~SWITCHBOARD
				
				if (($rsrsrsrs <> "") AND ($rsrsrsrs <> "0") AND ($planet~planetfuel = TRUE))
					send "'blue1 furb "&$udududud&" "&$adskljl&" "&$idasoiudsa&" planet:"&$rsrsrsrs&"  *"
				else
					send "'blue1 furb "&$udududud&" "&$adskljl&" "&$idasoiudsa&"  *"
				end
				settexttrigger 0 :nofig "No fighter down at that ship number, drop a fig."
				settexttrigger 0 :furb1 "- Furb delivered"
				pause
				halt
			:svdfwvytqudbid
				killalltriggers
				if ($ehehjjsjhd = 1)
					setVar $SWITCHBOARD~MESSAGE "Orders repeated twice, fail fail fail.*"
					gosub :SWITCHBOARD~SWITCHBOARD
					halt
				end
				setVar $ehehjjsjhd 1
				setVar $SWITCHBOARD~MESSAGE "Ok, lets serve up the ports oppisite and try again.*"
				gosub :SWITCHBOARD~SWITCHBOARD
				send "'red"&$pasparting[1]&" SDT "&$pasparting[2][1]&" "&$pasparting[1][1]&" "&$pasparting[2][2]&" "&$pasparting[1][2]&"*"
	
				goto :dvbjcnjme
			:eefhbhcd
				getWordPos CURRENTLINE $dasjhsakjsda "Busted"
				add $dasjhsakjsda 5
				cutText CURRENTLINE $papsadlkjesp $dasjhsakjsda 9999
				getWord $papsadlkjesp $udududud 4
				getWord $papsadlkjesp $wmwmwmll 10
				striptext $udududud ","
				setVar $joiaaslslsdj 1
				while ($joiaaslslsdj <= $jdsadsaljfoi)
					if $udududud = $pasparting[1][1]
						#setvar $papapap $pasparting[2][1]
						setvar $papapap $qwu[$pasparting[1]]
						setvar $rsrsrsrs $pasparting[1][2]
						setVar $asddnnn $pasparting[1][3]
						if ($jgrerllkhasd[$joiaaslslsdj] = $jgrerllkhasd[$pasparting[1]])
							setVar $hjsdakjh $joiaaslslsdj
							setVar $asddnnngrerllkhasd[$asddnnnoiaaslslsdj][$asddnnn] "B"
							setVar $sydujash $jgrerllkhasd[$joiaaslslsdj]
							setVar $kjsahd[$joiaaslslsdj] $wmwmwmll
						else
							setVar $asddnnngrerllkhasd[$asddnnnoiaaslslsdj][$asddnnn] FALSE
						end
					else
						#setvar $papapap $pasparting[1][1]
						setvar $papapap $qwu[$pasparting[1]]
						setvar $rsrsrsrs $pasparting[2][2]
						setVar $asddnnn $pasparting[2][3]
						if ($jgrerllkhasd[$joiaaslslsdj] = $jgrerllkhasd[$pasparting[1]])
							setVar $hjsdakjh $joiaaslslsdj
							setVar $asddnnngrerllkhasd[$asddnnnoiaaslslsdj][$asddnnn] "B"
							setVar $sydujash $jgrerllkhasd[$joiaaslslsdj]
							setVar $kjsahd[$joiaaslslsdj] $wmwmwmll
						else
							setVar $asddnnngrerllkhasd[$asddnnnoiaaslslsdj][$asddnnn] FALSE
						end
					end
					add $joiaaslslsdj 1
				end
				setvar $mklckmlkm $papapap
				setVar $hjsdakjh $pasparting[1]
				setVar $euiqwye[$hjsdakjh] $mklckmlkm
				gosub :jnoudiewyt
				if ($dsuoas = FALSE)
					setVar $mklckmlkm $sydujash
					setVar $papapap $sydujash
					setVar $euiqwye[$hjsdakjh] $mklckmlkm
				end
				setdelaytrigger setup :setupfurber 2000
				pause

			:nkhbgvtresw
	
				killalltriggers
				if (($rsrsrsrs <> "") AND ($rsrsrsrs <> "0") AND ($planet~planetfuel = TRUE))
					send "'blue1 furb "&$udududud&" "&$adskljl&" "&$idasoiudsa&" planet:"&$rsrsrsrs&" blow:red"&$hjsdakjh&"  *"
				else
					send "'blue1 furb "&$udududud&" "&$adskljl&" "&$idasoiudsa&" blow:red"&$hjsdakjh&"  *"
				end
				
				settexttrigger 0 :iueiuewiueid "No fighter down at that ship number, drop a fig."
				settexttrigger 0 :cnsjnkdsj "- Furb delivered"
				pause
			
			:cnsjnkdsj
	
				killalltriggers
				setdelaytrigger xport :xport 5000
				settexttrigger 0 :noore "Ore at port critically low!"
				pause
				:wwawaewedfg
					killalltriggers
					
					send "'red"&$hjsdakjh&" mac o1100^mq*"
					setdelaytrigger pdelay :pdelay 500
					pause
					:cgvhbjknkh
					killtrigger 0
					send "'blue1 mac pt^m^m^m^m*"
					setdelaytrigger furb2 :furb2 8000
					pause
				:gfdtryuiop
					killalltriggers
					


			:qezwaewwa
				send "'red"&$hjsdakjh&" x "&$papapap&"*"
				settexttrigger 0 :done  "- Xport complete."
				pause

			:pppfpg
				killalltriggers
				send "'Quick Nap before resuming!*"
				setdelaytrigger naptime :naptime 3000
				pause
				:fpfgpfgpf
				killalltriggers
				send "'Wakey Wakey!*"

		end
halt

:jnoudiewyt 
	setVar $joiaaslslsdj 1
	setVar $dsuoas FALSE
	setVar $kdjsahkjhsd 0
	setVar $uwheiuhqwejn " "
	while ($joiaaslslsdj <= $jdsadsaljfoi)
		setVar $uwheiuhqwejn $uwheiuhqwejn&" "&$euiqwye[$joiaaslslsdj]&" "
		add $joiaaslslsdj 1
	end
	setVar $joiaaslslsdj 1
	while ($joiaaslslsdj <= $jdsadsaljfoi)
		setVar $asddnnn 1
		setVar $sdjhkjdsah 0
		while (($asddnnn <= $hadksjds) AND ($sdjhkjdsah < 2))
			getWordPos $uwheiuhqwejn $dasjhsakjsda " "&$iweqiu[$asddnnn]&" "
			if (($asddnnngrerllkhasd[$asddnnnoiaaslslsdj][$asddnnn] = FALSE) AND ($dasjhsakjsda <= 0))
				add $sdjhkjdsah 1
				setVar $lkoiieowow[$sdjhkjdsah] $joiaaslslsdj
				setVar $lkoiieowow[$sdjhkjdsah][1] $iweqiu[$asddnnn]
				setVar $lkoiieowow[$sdjhkjdsah][2] $iweqiu[$asddnnn][2]
				setVar $lkoiieowow[$sdjhkjdsah][3] $asddnnn
			end
			add $asddnnn 1
		end
		if ($sdjhkjdsah >= 2)
			if ($kjsahd[$joiaaslslsdj] > $kdjsahkjhsd)
				setVar $dsuoas TRUE
				setVar $kdjsahkjhsd $kjsahd[$joiaaslslsdj]
				setVar $pasparting[1] $lkoiieowow[1]
				setVar $pasparting[1][1] $lkoiieowow[1][1]
				setVar $pasparting[1][2] $lkoiieowow[1][2]
				setVar $pasparting[1][3] $lkoiieowow[1][3]
				setVar $pasparting[2][1] $lkoiieowow[2][1]
				setVar $pasparting[2][2] $lkoiieowow[2][2]
				setVar $pasparting[2][3] $lkoiieowow[2][3]
			end
		end
		add $joiaaslslsdj 1
	end
return


:x
	send "'red"&$hjsdakjh&" x "&$papapap&"*"
	settexttrigger 0 :pppfpg  "- Xport complete."
	pause

	:pppfpg
		killalltriggers
return
#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\bot_includes\player\quikstats\player"
include "source\module_includes\bot\banner\bot"
include "source\bot_includes\player\isephaggle\player"
