:helpfile
setvar $only_help false
if (($parm1 = "help") or ($parm1 = "?"))
	setvar $only_help true
end
if (($switchboard~self_command <> false) and (($bot~parm1 = "!") or ($bot~parm1 = "menu")))
	goto :self_menu
end
	setVar $help_file "scripts\"&$mombot_directory&"\help\"&$command&".txt"
	fileExists $doesHelpFileExist $help_file
	if ($doesHelpFileExist)
		setVar $i 1 
		read $help_file $help_line ($i+4)
		while ($help_line <> EOF)
			#echo "*[]"&$help[$i]&"[]<->*[]"&$help_line&"[]*"
			stripText $help[$i] #13
			stripText $help[$i] "`"
			stripText $help[$i] "'"
			#replaceText $help[$i] "=" "-"
			if ($help[$i] <> $help_line)
				goto :write_new_help_file
			end
			add $i 1
			read $help_file $help_line ($i+4)
		end
		if (($help[($i + 1)] <> "0") OR (($help[($i + 2)] <> "0")))
			goto :write_new_help_file
		end
		if ($only_help = true)
			gosub :displayhelp
			halt
		end
		return
	end
	:write_new_help_file
		delete $help_file
		setvar $i 1
		getLength $command $length
		setVar $spaces "                                            "
		setVar $stars "---------------------------------------------"
		setVar $pos ($length)
		cutText $stars $border 1 $pos
		setVar $pos ((50-($length+10))/2)
		cutText $spaces $center 1 $pos
		write $help_file "                     "
		write $help_file "   "
		write $help_file $center&"<<<< "&$command&" >>>>" 
		write $help_file "   "
		while ($i <= $help)
			stripText $help[$i] #13
			stripText $help[$i] "`"
			stripText $help[$i] "'"
			#replaceText $help[$i] "=" "-"
			if ($help[$i] = "0")
				goto :done_help_file
			end
			write $help_file $help[$i]
			add $i 1
		end
		:done_help_file
			 setVar $SWITCHBOARD~message "Writing text file for "&$command&" in help directory.*"
			 gosub :SWITCHBOARD~switchboard

		if ($only_help = true)
			gosub :displayhelp
			halt
		end
		:self_menu
			setvar $i 1
			if (($switchboard~self_command <> false) and (($bot~parm1 = "!") or ($bot~parm1 = "menu")))
				setarray $fields 100 5
				setvar $fields 0
				setvar $field_count 0
				setvar $isDone false
				setvar $topOfFile true
				while (($i <= $help) and ($isDone <> true)) 
					if ($help[$i] <> "0")
						stripText $help[$i] #13
						stripText $help[$i] "`"
						stripText $help[$i] "'"
						#############################################################
						# Grid defender {f|l|a} {auto} {holo} {mines} {extern:11pm} #
						#############################################################
						setvar $check_for_blank_line $help[$i]
						trim $check_for_blank_line
						if ($check_for_blank_line = "")
							setvar $topOfFile false
						else
							if ($topOfFile = true)
								# create field types and grab script name #
								if ($i = 1)
									getwordpos $help[$i] $pos "{"
									cuttext $help[$i] $menu_title 1 $pos
									cuttext $help[$i] $rest_of_string $pos 9999
								else
									setvar $rest_of_string $help[$i]
								end
								getText $rest_of_string $option "{" "}"
								while ($option <> "")
									###########################################
									# remove the option found from the string #
									###########################################
									getwordpos $rest_of_string $pos "}"
									cuttext $rest_of_string&"     " $rest_of_string ($pos+1) 9999

									replacetext $option "{" ""
									replacetext $option "}" ""
									getwordpos $option $pos "|"
									
									add $field_count 1

									if ($pos > 0)
										setvar $field_type "multi"
										setvar $field_name $option
										splitText $fields[$field_count] $options "|"
										# grab first option as default #
										setvar $fields[$field_count][2] $options[1]
									else
										getwordpos $option $pos ":"
										if ($pos > 0)
											getwordpos $option $pos ":#"
											if ($pos > 0)
												setvar $field_type "number"
												setvar $fields[$field_count][2] 0
											else
												setvar $field_type "string"
												setvar $fields[$field_count][2] ""
											end
											splitText $option $inputs
											setvar $field_name $inputs[1]
										else
											setvar $field_type "boolean"
											setvar $field_name $option
											setvar $fields[$field_count][2] false
										end 
									end
									setvar $fields[$field_count] $field_name
									setvar $fields[$field_count][1] $field_type
									echo "adding field: [" $fields[$field_count] "]*"
									add $fields 1
									########################
									# grab the next option #
									########################
									getText $rest_of_string $option "{" "}"
								end
							else
								getwordpos $help[$i] $pos "{"
								if ($pos > 0)
									#######################################
									# define field types and descriptions #
									#######################################

									##################################################
									#  {adjacent} - adjacent photon option (default) #
									##################################################

									getWord $help[$i] $option 1
									replacetext $option "{" ""
									replacetext $option "}" ""
									trim $option 
									getwordpos $help[$i] $pos "}"
									cuttext $help[$i] $help[$i] $pos 9999
									replacetext $help[$i] "{" ""
									replacetext $help[$i] "}" ""
									replacetext $help[$i] "-" ""
									trim $help[$i]

									setvar $j 1 
									while ($j <= $fields)
										setvar $foundOption false
										getwordpos $fields[$j] $pos "|"
										if ($pos > 0)
											splitText $fields[$j] $options "|"
											setvar $k 1
											while ($k <= $options)
												trim $options[$k]
												if ($options[$k] = $option)
													setvar $fields[$j][3] $help[$i]
												end
												add $k 1
											end
										else
											if ($option = $fields[$j])
												setvar $fields[$j][3] $help[$i]
											end
										end
										add $j 1
									end
								else
									# ignore lines without {} in them #
								end

							end
						end
					else
						setvar $isDone true
					end
					add $i 1
				end

				setvar $i 1
				addMenu "" "MENUSYSTEM" $command&" Settings" "." "" "Main" FALSE
				echo "final field count: [" $fields "]*"
				setarray $menu_system_keys 30
				setvar $menu_system_keys 30
				setvar $menu_system_keys[1] 1
				setvar $menu_system_keys[2] 2
				setvar $menu_system_keys[3] 3
				setvar $menu_system_keys[4] 4
				setvar $menu_system_keys[5] 5
				setvar $menu_system_keys[6] 6
				setvar $menu_system_keys[7] 7
				setvar $menu_system_keys[8] 8
				setvar $menu_system_keys[9] 9
				setvar $menu_system_keys[10] "a"
				setvar $menu_system_keys[11] "b"
				setvar $menu_system_keys[12] "c"
				setvar $menu_system_keys[13] "d"
				setvar $menu_system_keys[14] "e"
				setvar $menu_system_keys[15] "f"
				setvar $menu_system_keys[16] "g"
				setvar $menu_system_keys[17] "h"
				setvar $menu_system_keys[18] "i"
				setvar $menu_system_keys[19] "j"
				setvar $menu_system_keys[20] "k"
				setvar $menu_system_keys[21] "l"
				setvar $menu_system_keys[22] "m"
				setvar $menu_system_keys[23] "n"
				setvar $menu_system_keys[24] "o"
				setvar $menu_system_keys[25] "p"
				setvar $menu_system_keys[26] "r"
				setvar $menu_system_keys[27] "s"
				setvar $menu_system_keys[28] "t"
				setvar $menu_system_keys[29] "u"
				setvar $menu_system_keys[30] "v"
				while ($i <= $fields)
					addMenu "MENUSYSTEM" $fields[$i] $fields[$i]&" ("&$fields[$i][3]&")" $menu_system_keys[$i] ":"&$fields[$i][1]&"Field" $fields[$i][3] FALSE
					echo "field type for " $fields[$i] " is [" $fields[$i][1] "]*"
					add $i 1
				end
				openMenu "MENUSYSTEM" true

			end
return

:booleanField
	setvar $booleanCheck $fields[$i][2]
return

:multiField

return

:stringField

return

:numberField

return

include "source\module_includes\bot\displayhelp\bot"
include "source\bot_includes\switchboard"

