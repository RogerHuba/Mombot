:add_includes

	setvar $directories "cashing data defense general grid offense resource"
	setvar $i 1
	getword $directories $directory $i "JUNK"
	while ($directory <> "JUNK")
		setvar $folder "scripts\mombot\commands\"&$directory&"\"
		getFileList $scriptList $folder&"*.ts"
		gosub :reconfigure_scripts

		setvar $folder "scripts\mombot\modes\"&$directory&"\"
		getFileList $scriptList $folder&"*.ts"
		gosub :reconfigure_scripts

		add $i 1
		getword $directories $directory $i "JUNK"
	end
	setvar $folder "scripts\mombot\daemons\"
	getFileList $scriptList $folder&"*.ts"
	gosub :reconfigure_scripts

halt

:check_for_include
	getwordpos $lowercase_script_line $pos  ":"&$include&"~"
	getwordpos $doublecheck $pos2 " "&$include&" "
	setvar $command_pos 0
	setvar $command_pos2 0
	if ($command <> "")
		getwordpos $lowercase_script_line $command_pos ":"&$include&"~"&$command
		getwordpos $doublecheck2 $command_pos2 " "&$include&"~"&$command&" "
	end
	if (($pos > 0) and ($pos2 <= 0))
		add $paths 1
		fileExists $includeExists "scripts\mombot\"&$prepath&$include&".ts"
		if ($includeExists)
			setvar $paths[$paths] $prepath&$include
		end
		setvar $doublecheck $doublecheck&" "&$include&" "
	end
	if (($command_pos > 0) and ($command_pos2 <= 0))
		add $paths 1
		setvar $paths[$paths] $prepath&$include&"\"&$command&"\"&$include
		setvar $doublecheck2 $doublecheck2&" "&$include&"~"&$command&" "		
	end
return

:reconfigure_scripts

		setVar $j 1
		while ($j <= $scriptList)
			setarray $script 5000
			setarray $paths 1000
			setvar $paths 0 
			setvar $doublecheck " "
			setvar $doublecheck2 " "
			setvar $script_file $folder&$scriptList[$j]
			setVar $k 1 
			read $script_file $script_line $k
			while ($script_line <> EOF)
				setvar $lowercase_script_line $script_line
				lowercase $lowercase_script_line

				setvar $bot_includes " combat game grid map planet player sector ship switchboard tactics targeting validation "
				setvar $bot_bot_includes " connectivity help internal_commands listener menus user_interface "
				setvar $module_includes " bot citadel dump invader modules port prompt search strip "

				setvar $l 1
				getword $module_includes $include $l "JUNK"
				while ($include <> "JUNK")
					setvar $command ""
					setvar $prepath "source\module_includes\"
					gosub :check_for_include
					getDirList $includeList "scripts\mombot\"&$prepath&$include&"\????????????????????????"
					setvar $m 1
					while ($m <= $includeList)
						setvar $command $includeList[$m]
						gosub :check_for_include
						add $m 1
					end
					add $l 1
					getword $module_includes $include $l "JUNK"
				end
				setvar $l 1
				getword $bot_includes $include $l "JUNK"
				while ($include <> "JUNK")
					setvar $command ""
					setvar $prepath "source\bot_includes\"
					gosub :check_for_include
					getDirList $includeList "scripts\mombot\"&$prepath&$include&"\????????????????????????"
					setvar $m 1
					while ($m <= $includeList)
						setvar $command $includeList[$m]
						gosub :check_for_include
						add $m 1
					end
					add $l 1
					getword $bot_includes $include $l "JUNK"
				end
				setvar $l 1
				getword $bot_bot_includes $include $l "JUNK"
				while ($include <> "JUNK")
					setvar $command ""
					setvar $prepath "source\bot_includes\bot\"
					gosub :check_for_include
					getDirList $includeList "scripts\mombot\"&$prepath&$include&"\????????????????????????"
					setvar $m 1
					while ($m <= $includeList)
						setvar $command $includeList[$m]
						gosub :check_for_include
						add $m 1
					end
					add $l 1
					getword $bot_bot_includes $include $l "JUNK"
				end


				getwordpos $lowercase_script_line $pos  "source\"
				getwordpos $lowercase_script_line $pos2 "_includes\"
				if (($pos > 0) and ($pos2 > 0))
					goto :write_new_script_file
				end
				setvar $script[$k] $script_line

				add $k 1
				read $script_file $script_line $k
			end

			:write_new_script_file
				delete $script_file
				setvar $k 1
				while ($script[$k] <> "0")
					write $script_file $script[$k]
					add $k 1
				end
				setvar $path_count 1 
				while ($path_count <= $paths)
					write $script_file "include "&#34&$paths[$path_count]&#34
					add $path_count 1
				end

			add $j 1
		end



return