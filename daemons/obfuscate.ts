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
		setvar $folder "scripts\mombot\commands\"&$directory&"\"
		getFileList $scriptList $folder&$filter&".ts"
		gosub :reconfigure_scripts

		setvar $folder "scripts\mombot\modes\"&$directory&"\"
		getFileList $scriptList $folder&$filter&".ts"
		gosub :reconfigure_scripts

		add $i 1
		getword $directories $directory $i "JUNK"
	end
	setvar $folder "scripts\mombot\daemons\"
	getFileList $scriptList $folder&$filter&".ts"
	gosub :reconfigure_scripts

	echo "*[ Add include processing complete. ]*"

halt

:check_for_include
	getwordpos $lowercase_script_line $pos  ":"&$include&"~"
	getwordpos $doublecheck $pos2 " "&$include&" "
	setvar $command_pos 0
	setvar $command_pos2 0
	if ($command <> "")
		#echo "*["&$include&"~"&$command&"]*"
		getwordpos $lowercase_script_line $command_pos ":"&$include&"~"&$command
		getwordpos $doublecheck2 $command_pos2 " "&$include&"~"&$command&" "
	end
	if (($pos > 0) and ($pos2 <= 0))
		fileExists $includeExists "scripts\mombot\"&$prepath&$include&".ts"
		if ($includeExists)
			add $paths 1
			setvar $paths[$paths] $prepath&$include
		end
		setvar $doublecheck $doublecheck&" "&$include&" "
	end
	if (($command_pos > 0) and ($command_pos2 <= 0))
		add $paths 1
		setvar $paths[$paths] $prepath&$include&"\"&$command&"\"&$include
		setvar $doublecheck2 $doublecheck2&" "&$include&"~"&$command&" "		
	end
	#setdelaytrigger delay :done_delay 10
	#pause
	:done_delay
return

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
					getword $script_line $word $m "<<ENDOFLINE>>"
					while ($word <> "<<ENDOFLINE>>")
						getwordpos $word $isvariable "$"
						getwordpos $word $isgosub ":"
						getwordpos $word $isinclude "~"
						if ($isinclude <> false)
							# ignore include labels and variables #
						else
							if ($isvariable <> false)
								gosub :replacevariable
							end
							if ($isgosub <> false)
								gosub :replacelabel
							end
						end
						setvar $script[$m] $script_line
						add $m 1
						getword $script_line $word $m "<<ENDOFLINE>>"
					end
					add $k 1
					read $script_file $script_line $k
				end

				:write_new_script_file
					setvar $new_script $script_file
					replacetext $new_script ".ts" "_obfuscated.ts"
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

:getvariables
	setarray $variable_array 200 1
	setvar $variables "adskljl idasoiudsa lkjsad lkjassdalkhsdh ui ausa dasjhsakjsda  hadksjds jhasd kjsahd euiqwye qwu iweqiu klkal qwoiwqoei wmmmdksl xndanknjads ajsdjnkajnsd asduhui dakasjkjka ajsdjka sjdkjansdh whueqiehl mksdmkalkmasd alsdkdsajhuh kjdasijoias  jaods joi asd joiasdj oi jdsaoi papsp pppp ssuuus usuuuus iiasuiu wwqhdhj xczcxz mnmmmmkl asddnnn wqeiuwqiue lslashdh jpqpwppw tsjkkk rtucat dddog sspencil traderxx xxportxx xxstarbasexx oolandingoo pasparting dsuoas hjsdakjh papapap yayayaya rsrsrsrs udududud ehehjjsjhd wmwmwmll sydujash mklckmlkm kdjsahkjhsd uwheiuhqwejn sdjhkjdsah lkoiieowow ksdjjklasjadslk dsauiiwqi ppppspspspks jsahwywuw wpwpwpwp wweeewww sjajkskjsk dshdssssuehiuh askdjkjasdhkjahsdk pvp ion mom rend sjkkk ppsawwiow njaskskkal tsrashjaosij mclsdkmcsdl sadhiuhsa kalsalk hdyuqwywq slmcmccl wiwo dasjoi qwuhfifweh jhdcs dajslkj euwhfguvygie wuqdhoci jasljcbveweid uwpajcalksdjk adsbvhjs bcakjscnjv nshjdbva sgvajbcskj dancvbgsjd abskjdndl nfweuidie wyfhike dlasljasc bhbsjdvaj hsndcanvh fjsbdajvsd bkjnxoweh dfieuyhvi wejdacln asduihue wrieuwrds uhfiuasdk jnvnlkmgiore tuhiuweh dndsklfgioe hqiweygdsjn mvkbtgfansjkb avstfqcwd ytegfisdkna svmdgktmtn iuesbdua svdfuibgn sjdkn vsdhbfs kjvnasdreteret"

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
	setvar $labels "ncnc dcdjknncn nseuie yewiiwuwqowopw eoqpwelklksa klasdncb gufuweyghi quojoiwsm dlknc dmopqwefi ugruvyh rbnlekde oiuriyewjc ndndvdtveh jnoudiewyt dvbjcnjme dcjcnbg svdfwvytqudbid nfmewopijoeuf hveiybcnlck mpissooso ososiodo isdodsodjd eefhbhcd bhdchnsjnswwhb gtertyeu iueiuewiueid cnsjnkdsj nkhbgvtresw qezwaewwa wwawaewedfg cgvhbjknkh gfdtryuiop pppfpg fpfgpfgpf kdsoldfkjl kjvnsmdmm kdkmkmcdjnhb dchbdjhbbdcd bhjbdjhdbsj hdsbjdhbcjd hsbjhbneiu hruyrgtffr dersrwrse dfytuyhh bvgfcdxf zxgfguyg utfrty fytugiu hkhbvtce ertryftjg vjkbnbkju buvjhvjh vghvghjcf ghfgdxg fhcjhgv jgyft rdtrdy tfgjhb hbkjbkj bkjbhbhbk bkjbkjbkj bkjbbvgtt xerwzewaer tyfugbkoe poepwrure porweiepi worpoire whjkdsk hdfshkjfs dkjhfdsk jhkjhds akjbka bjhcsjdghv chfsgcyv uyegwuyqt eiqueow iquoiwqj jksnalndl kasdjlask jlajssadkbhu gwvuqwyte yguqywqe wiuwqey iudhjbkc hbdkcjsn xmklmalxk msediuedi uewhiuewu yigswioiojswkl sksalkjdlajks ldhaigywuy fugrjjoie ojdiojwu ihsuygqft wyfwdtrsrtd wrwdrtsr swywqu gwusyggw qiuhednroio fjoig joierough iyefieuybd eiwndo wnrhvbcjh bnkdjn wehuigh wreiyhdqo wijoajn dwshugsv yrwfsguyid uheiufg iruhfoi rtjgoeirgj oirwfe hdisag utdfetufg firwufhed oiejdoiwj ofuhwify gieyfg iewfgie wfuhoe iwfowefij oewijou hieygue wqfdutu yiqedhi uwehdoqdh oqidhwoijq woqiheiu gquwyeg iqegwiugei yfgiwheoe ihfouwe hfiuegue ofhou hwfeo"

	setvar $a 1
	getword $labels $word $a "<<DONE>>"
	while ($word <> "<<DONE>>")
		setvar $label_array[$a] $word
		add $a 1
		getword $labels $word $a "<<DONE>>"
	end

return

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"

