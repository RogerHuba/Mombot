gosub :BOT~loadVars


setVar $BOT~help[1]  $BOT~tab&"obfuscate {filter} "
setVar $BOT~help[2]  $BOT~tab&"  Obfuscates script source code "
setVar $BOT~help[3]  $BOT~tab&"             "
setVar $BOT~help[4]  $BOT~tab&"        {filter} - if you only want a subset of the scripts  "
setVar $BOT~help[5]  $BOT~tab&"                   to be included, you can use a command name"
setVar $BOT~help[6]  $BOT~tab&"                   or with wildcards like:"
setVar $BOT~help[7]  $BOT~tab&"                       >obfuscate "&#42&"mow"&#42&" "
gosub :bot~helpfile


setvar $filter ""
if (($bot~parm1 <> "") and ($bot~parm1 <> ""))
	setvar $filter $bot~parm1
else
	setvar $filter "*"
end
:add_includes

	gosub :getlabels
	gosub :getvariables

	setvar $directories "cashing data defense general grid offense resource"
	setvar $i 1
	getword $directories $directory $i "JUNK"
	while ($directory <> "JUNK")
		setvar $folder "scripts\"&$bot~mombot_directory&"\commands\"&$directory&"\"
		getFileList $scriptList $folder&$filter&".ts"
		gosub :reconfigure_scripts

		setvar $folder "scripts\"&$bot~mombot_directory&"\modes\"&$directory&"\"
		getFileList $scriptList $folder&$filter&".ts"
		gosub :reconfigure_scripts

		add $i 1
		getword $directories $directory $i "JUNK"
	end
	setvar $folder "scripts\"&$bot~mombot_directory&"\daemons\"
	getFileList $scriptList $folder&$filter&".ts"
	gosub :reconfigure_scripts

	echo "*[ Obfuscation processing complete. ]*"

halt


:reconfigure_scripts

		setVar $j 1
		while ($j <= $scriptList)
			if ($scriptList[$j] <> "obfuscate.ts") 
				setarray $script 20000
				setarray $paths 1000
				setvar $paths 0 
				setvar $doublecheck " "
				setvar $doublecheck2 " "
				setvar $script_file $folder&$scriptList[$j]
				echo "*In script: ["&$script_file&"]"
				setVar $k 1 
				read $script_file $script_line $k
				while ($script_line <> EOF)
					setvar $m 1
					setvar $temp $script_line
					replacetext $temp "&" " & "
					replacetext $temp "[" " [ "
					replacetext $temp "]" " ] "
					replacetext $temp "(" " ( "
					replacetext $temp ")" " ) "
					replacetext $temp "killtrigger " "killtrigger"
					replacetext $temp "killtrigger " "killtrigger"
					replacetext $temp "killtrigger " "killtrigger"
					replacetext $temp "killtrigger " "killtrigger"
					replacetext $temp "killtrigger " "killtrigger"
					replacetext $temp "killtrigger " "killtrigger"
					replacetext $temp "killtrigger " "killtrigger"
					replacetext $temp "killtrigger " "killtrigger"
					replacetext $temp "killtrigger " "killtrigger"
					replacetext $temp "killtrigger " "killtrigger"
					replacetext $temp "killtrigger " "killtrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settexttrigger " "settexttrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "settextlinetrigger " "settextlinetrigger"
					replacetext $temp "setTextLineTrigger " "settextlinetrigger"
					getword $temp $word $m "<<ENDOFLINE>>"
					while ($word <> "<<ENDOFLINE>>")
						getwordpos $word $isvariable "$"
						getwordpos $word $isgosub ":"
						getwordpos $word $isstring ":"&#42
						getwordpos $word $isinclude "~"
						getwordpos $word $isinclude "~"
						getwordpos $word $istrigger "killtrigger"
						getwordpos $word $istrigger2 "settextlinetrigger"
						getwordpos $word $istrigger3 "settexttrigger"
						if ($isinclude <> false)
							# ignore include labels and variables #
						else
							if (($istrigger > 0) or ($istrigger2 > 0) or ($istrigger3 > 0))
								gosub :replacetrigger
							end
							if ($isvariable > 0)
								gosub :replacevariable
							end
							getlength $word $length
							if (($isgosub = 1) and ($isstring <= 0) and ($length > 2))
								gosub :replacelabel
							end
						end
						add $m 1
						getword $temp $word $m "<<ENDOFLINE>>"
					end
					setvar $script[$k] $script_line
					add $k 1
					read $script_file $script_line $k
				end

				:write_new_script_file
					setvar $new_script $script_file
					replacetext $new_script ".ts" "_obfuscated.ts"
					delete $new_script
					setvar $k 1
					while ($script[$k] <> "0")
						write $new_script $script[$k]
						add $k 1
					end
					echo "*Writing new script: ["&$new_script&"]*"
			end
			add $j 1
		end

return

:replacevariable
	setvar $b 1
	replacetext $word "$" ""
	replacetext $word "(" ""
	replacetext $word ")" ""
	replacetext $word "[" " "
	replacetext $word "]" ""
	getword $word $word 1
	setvar $isfound false
	while (($variable_array[$b][1] <> "0") and ($isfound = false))
		if ($variable_array[$b][1] = $word)
			replacetext $script_line "$"&$word "$"&$variable_array[$b]
			setvar $isfound true
		end
		add $b 1
	end
	if ($isfound <> true)
		replacetext $script_line "$"&$word "$"&$variable_array[$b]
		setvar $variable_array[$b][1] $word
	end

return

:replacelabel
	setvar $b 1
	replacetext $word ":" ""
	setvar $isfound false
	while (($label_array[$b][1] <> "0") and ($isfound = false))
		if ($label_array[$b][1] = $word)
			replacetext $script_line ":"&$word ":"&$label_array[$b]
			setvar $isfound true
		end
		add $b 1
	end
	if ($isfound <> true)
		replacetext $script_line "$"&$word "$"&$label_array[$b]
		setvar $label_array[$b][1] $word
	end
return

:replacetrigger
	setvar $b 1
	replacetext $word "settextlinetrigger" ""
	replacetext $word "settexttrigger" ""
	replacetext $word "killtrigger" ""
	setvar $isfound false
	while (($trigger_array[$b][1] <> "0") and ($isfound = false))
		if ($trigger_array[$b][1] = $word)
			replacetext $script_line " "&$word " "&$trigger_array[$b]
			setvar $isfound true
		end
		add $b 1
	end
	if ($isfound <> true)
		replacetext $script_line " "&$word " "&$trigger_array[$b]
		setvar $trigger_array[$b][1] $word
	end
return

:getvariables
	setarray $variable_array 200 1
	setvar $variables "adskljl idasoiudsa lkjsad lkjassdalkhsdh udsaasfewfgtthryhi auaoeieoiofksa dasjhsakjsda  hadksjds jgrerllkhasd kjsahd euiqwye qwu iweqiu klkal qwoiwqoei wmmmdksl xndanknjads ajsdjnkajnsd asduhui dakasjkjka ajsdjka sjdkjansdh whueqiehl mksdmkalkmasd alsdkdsajhuh kjdasijoias  jaoadslds jokdlskjli aseioweuowud joiaaslslsdj osadlkjlkji jdsadsaljfoi papsadlkjesp pppwpowooopp ssldasjlkjassdasuuus usuuddsasdsuus iiasuiu wwqhdhj xczcxz mnmmmmkl asddnnn wqeiuwqiue lslashdh jpqpwppw tsjkkk rtucat dddog sspencil traderxx xxportxx xxstarbasexx oolandingoo pasparting dsuoas hjsdakjh papapap yayayaya rsrsrsrs udududud ehehjjsjhd wmwmwmll sydujash mklckmlkm kdjsahkjhsd uwheiuhqwejn sdjhkjdsah lkoiieowow ksdjjklasjadslk dsauiiwqi ppppspspspks jsahwywuw wpwpwpwp wweeewww sjajkskjsk dshdssssuehiuh askdjkjasdhkjahsdk pvp ion mom rend sjkkk ppsawwiow njaskskkal tsrashjaosij mclsdkmcsdl sadhiuhsa kalsalk hdyuqwywq slmcmccl wiwo dasjoi qwuhfifweh jhdcs dajslkj euwhfguvygie wuqdhoci jasljcbveweid uwpajcalksdjk adsbvhjs bcakjscnjv nshjdbva sgvajbcskj dancvbgsjd abskjdndl nfweuidie wyfhike dlasljasc bhbsjdvaj hsndcanvh fjsbdajvsd bkjnxoweh dfieuyhvi wejdacln asduihue wrieuwrds uhfiuasdk jnvnlkmgiore tuhiuweh dndsklfgioe hqiweygdsjn mvkbtgfansjkb avstfqcwd ytegfisdkna svmdgktmtn iuesbdua svdfuibgn sjdkn vsdhbfs kjvnasdreteret"

	setvar $a 1
	getword $variables $word $a "<<DONE>>"
	while ($word <> "<<DONE>>")
		setvar $variable_array[$a] $word
		add $a 1
		getword $variables $word $a "<<DONE>>"
	end
return

:getlabels
	setarray $label_array 200 1
	setvar $labels "ncnc dcdjknncn nseuie yewiiwuwqowopw eoqpwelklksa klasdncb gufuweyghi quojoiwsm dlkadsasddsanc dmopqwefi ugruvyh rbnlekde oiuriyewjc ndndvdtveh jnoudiewyt dvbjcnjme dcjcnbg svdfwvytqudbid nfmewopijoeuf hveiybcnlck mpissooso ososiodo isdodsodjd eefhbhcd bhdchnsjnswwhb gtertyeu iueiuewiueid cnsjnkdsj nkhbgvtresw qezwaewwa wwawaewedfg cgvhbjknkh gfdtryuiop pppfpg fpfgpfgpf kdsoldfkjl kjvnsmdmm kdkmkmcdjnhb dchbdjhbbdcd bhjbdjhdbsj hdsbjdhbcjd hsbjhbneiu hruyrgtffr dersrwrse dfytuyhh bvgfcdxf zxgfguyg utfrty fytugiu hkhbvtce ertryftjg vjkbnbkju buvjhvjh vghvghjcf ghfgdxg fhcjhgv jgyft rdtrdy tfgjhb hbkjbkj bkjbhbhbk bkjbkjbkj bkjbbvgtt xerwzewaer tyfugbkoe poepwrure porweiepi worpoire whjkdsk hdfshkjfs dkjhfdsk jhkjhds akjbka bjhcsjdghv chfsgcyv uyegwuyqt eiqueow iquoiwqj jksnalndl kasdjlask jlajssadkbhu gwvuqwyte yguqywqe wiuwqey iudhjbkc hbdkcjsn xmklmalxk msediuedi uewhiuewu yigswioiojswkl sksalkjdlajks ldhaigywuy fugrjjoie ojdiojwu ihsuygqft wyfwdtrsrtd wrwdrtsr swywqu gwusyggw qiuhednroio fjoig joierough iyefieuybd eiwndo wnrhvbcjh bnkdjn wehuigh wreiyhdqo wijoajn dwshugsv yrwfsguyid uheiufg iruhfoi rtjgoeirgj oirwfe hdisag utdfetufg firwufhed oiejdoiwj ofuhwify gieyfg iewfgie wfuhoe iwfowefij oewijou hieygue wqfdutu yiqedhi uwehdoqdh oqidhwoijq woqiheiu gquwyeg iqegwiugei yfgiwheoe ihfouwe hfiuegue ofhou hwfeo"

	setvar $a 1
	getword $labels $word $a "<<DONE>>"
	while ($word <> "<<DONE>>")
		setvar $label_array[$a] $word
		add $a 1
		getword $labels $word $a "<<DONE>>"
	end

return

:gettriggers
	setarray $trigger_array 200 1
	setvar $triggers "ncnc dcdjknncn nseuie yewiiwuwqowopw eoqpwelklksa klasdncb gufuweyghi quojoiwsm dlkadsasddsanc dmopqwefi ugruvyh rbnlekde oiuriyewjc ndndvdtveh jnoudiewyt dvbjcnjme dcjcnbg svdfwvytqudbid nfmewopijoeuf hveiybcnlck mpissooso ososiodo isdodsodjd eefhbhcd bhdchnsjnswwhb gtertyeu iueiuewiueid cnsjnkdsj nkhbgvtresw qezwaewwa wwawaewedfg cgvhbjknkh gfdtryuiop pppfpg fpfgpfgpf kdsoldfkjl kjvnsmdmm kdkmkmcdjnhb dchbdjhbbdcd bhjbdjhdbsj hdsbjdhbcjd hsbjhbneiu hruyrgtffr dersrwrse dfytuyhh bvgfcdxf zxgfguyg utfrty fytugiu hkhbvtce ertryftjg vjkbnbkju buvjhvjh vghvghjcf ghfgdxg fhcjhgv jgyft rdtrdy tfgjhb hbkjbkj bkjbhbhbk bkjbkjbkj bkjbbvgtt xerwzewaer tyfugbkoe poepwrure porweiepi worpoire whjkdsk hdfshkjfs dkjhfdsk jhkjhds akjbka bjhcsjdghv chfsgcyv uyegwuyqt eiqueow iquoiwqj jksnalndl kasdjlask jlajssadkbhu gwvuqwyte yguqywqe wiuwqey iudhjbkc hbdkcjsn xmklmalxk msediuedi uewhiuewu yigswioiojswkl sksalkjdlajks ldhaigywuy fugrjjoie ojdiojwu ihsuygqft wyfwdtrsrtd wrwdrtsr swywqu gwusyggw qiuhednroio fjoig joierough iyefieuybd eiwndo wnrhvbcjh bnkdjn wehuigh wreiyhdqo wijoajn dwshugsv yrwfsguyid uheiufg iruhfoi rtjgoeirgj oirwfe hdisag utdfetufg firwufhed oiejdoiwj ofuhwify gieyfg iewfgie wfuhoe iwfowefij oewijou hieygue wqfdutu yiqedhi uwehdoqdh oqidhwoijq woqiheiu gquwyeg iqegwiugei yfgiwheoe ihfouwe hfiuegue ofhou hwfeo"

	setvar $a 1
	getword $triggers $word $a "<<DONE>>"
	while ($word <> "<<DONE>>")
		setvar $trigger_array[$a] $word
		add $a 1
		getword $triggers $word $a "<<DONE>>"
	end

return


include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"

