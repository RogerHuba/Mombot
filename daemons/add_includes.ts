gosub :BOT~loadVars


setVar $BOT~help[1]  $BOT~tab&"add_includes {filter} "
setVar $BOT~help[2]  $BOT~tab&"  Modifies scripts to use only the necessary include files "
setVar $BOT~help[3]  $BOT~tab&"             "
setVar $BOT~help[4]  $BOT~tab&"        {filter} - if you only want a subset of the scripts  "
setVar $BOT~help[5]  $BOT~tab&"                   to be included, you can use a command name"
setVar $BOT~help[6]  $BOT~tab&"                   or with wildcards like:"
setVar $BOT~help[7]  $BOT~tab&"                       >add_includes "&#42&"mow"&#42&" "
gosub :bot~helpfile


setvar $filter ""
if (($bot~parm1 <> "") and ($bot~parm1 <> ""))
	setvar $filter $bot~parm1
else
	setvar $filter "*"
end
:add_includes

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
		fileExists $includeExists "scripts\"&$bot~mombot_directory&"\"&$prepath&$include&".ts"
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
			if ($scriptList[$j] <> "add_includes.ts") 
				setarray $script 5000
				setarray $paths 1000
				setvar $paths 0 
				setvar $doublecheck " "
				setvar $doublecheck2 " "
				setvar $script_file $folder&$scriptList[$j]
				echo "*In script: ["&$script_file&"]"
				setVar $k 1 
				read $script_file $script_line $k
				while ($script_line <> EOF)
					setvar $lowercase_script_line $script_line
					lowercase $lowercase_script_line
					getwordpos $lowercase_script_line $includepos "~"

					if ($includepos > 0)
						setvar $bot_includes " combat game grid map planet player sector ship switchboard tactics targeting validation "
						setvar $bot_bot_includes " connectivity help internal_commands listener menus user_interface "
						setvar $module_includes " bot citadel dump invader modules port prompt search strip wppt "

						setvar $l 1
						getword $module_includes $include $l "JUNK"
						while ($include <> "JUNK")
							setvar $command ""
							setvar $prepath "source\module_includes\"
							gosub :check_for_include
							getDirList $includeList "scripts\"&$bot~mombot_directory&"\"&$prepath&$include&"\????????????????????????????????"
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
							getDirList $includeList "scripts\"&$bot~mombot_directory&"\"&$prepath&$include&"\??????????????????????????????????"
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
							getDirList $includeList "scripts\"&$bot~mombot_directory&"\"&$prepath&$include&"\???????????????????????????????????"
							setvar $m 1
							while ($m <= $includeList)
								setvar $command $includeList[$m]
								gosub :check_for_include
								add $m 1
							end
							add $l 1
							getword $bot_bot_includes $include $l "JUNK"
						end
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
					setvar $switchboard_already_included false
					while ($path_count <= $paths)
						if ($paths[$path_count] = "source\module_includes\bot\helpfile\bot")
							setvar $switchboard_already_included true
						end
						add $path_count 1
					end
					setvar $path_count 1 
					while ($path_count <= $paths)
						if ($paths[$path_count] <> "0")
							if (($paths[$path_count] = "source\bot_includes\switchboard") and ($switchboard_already_included = true))
								//skip switchboard, already included in helpfile include
							else
								echo "*Adding: ["&$paths[$path_count]&"]"
								write $script_file "include "&#34&$paths[$path_count]&#34
							end
						end
						add $path_count 1
					end
					echo "*Writing new script: ["&$script_file&"]*"
			end
			add $j 1
		end



return

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"

