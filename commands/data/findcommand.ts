gosub :BOT~loadVars
loadvar $switchboard~self_command

setVar $BOT~help[1]  $BOT~tab&"findcommands {filter} "
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
    setvar $display_filter $bot~parm1
    replacetext $display_filter "*" #42
else
	setvar $filter "*"
    setvar $display_filter #42
end
:add_includes

	setvar $directories "cashing data defense general grid offense resource"
	setvar $i 1
    setvar $switchboard~message "All external bot commands matching the filter of "&$display_filter&": *    *    *"
	getword $directories $directory $i "JUNK"
	while ($directory <> "JUNK")
		setvar $folder "scripts\"&$bot~mombot_directory&"\commands\"&$directory&"\"
		getFileList $scriptList $folder&$filter&".cts"
		gosub :reconfigure_scripts

		setvar $folder "scripts\"&$bot~mombot_directory&"\modes\"&$directory&"\"
		getFileList $scriptList $folder&$filter&".cts"
		gosub :reconfigure_scripts

		add $i 1
		getword $directories $directory $i "JUNK"
	end
	setvar $folder "scripts\"&$bot~mombot_directory&"\daemons\"
	getFileList $scriptList $folder&$filter&".cts"
	gosub :reconfigure_scripts
    if ($switchboard~self_command >= 1)
        setvar $bot~only_help true
    end
    setvar $switchboard~message $switchboard~message&"   *"
    gosub :switchboard~switchboard

halt
:reconfigure_scripts
    setvar $j 1
    while ($j <= $scriptList)
        getwordpos $scriptList[$j] $pos "_"
        if (($pos <> 1) or ($switchboard~self_command >= 1))
            setvar $script_file $folder&$scriptList[$j]
            setvar $switchboard~message $switchboard~message&$script_file&"*"
        end
        add $j 1
    end
return

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"

