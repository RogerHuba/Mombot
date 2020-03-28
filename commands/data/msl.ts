## TWX Script       : MSL Checker
## Version          : 1.4
## Author           : Psion
## Description      : Either lists all MSL sectors or checks if a single sector is in the MSLs
##                  : Will also output a list of AMTRAK sectors
## Trigger Point    : Anywhere, handles everything through the TWX DB
## Warnings         : MUST have a full ZTM to run
##                  : Can be run if AC or Rylos is unknown, but will not be able to plot
##                  : complete MSLs (obviously).  Enter 0 for unknown class 0s and it 
##                  : will do the best it can.  Script will NEVER give a false positive,
##                  : only false negatives.  So it may think a sector that is actually inside
##                  : the MSLs is outside them, but never vice versa.
## Other            : Checks for and ignores repeat sectors
##		    : Future version might check for planets in MSLs too
##	 	    : Fedspace sectors (1-10 and SD) are NOT included in AMTRACK or MSL lists
##                  : They ARE included when checking a single sector though
##                  : AMTRACK includes all sectors adj to the MSL sectors, excepting the MSL
##                  : sectors themselves, plus all sectors adj to 1-10, excepting 1-10 themselves
##                  : My ICQ is 211279673.  Drop me a message if you have questions or problems.
gosub :BOT~loadVars
loadvar $map~rylos
loadvar $map~alpha_centauri

setVar $BOT~help[1]  $BOT~tab&"   Calculates MSL Sectors "
setVar $BOT~help[2]  $BOT~tab&"       "
setVar $BOT~help[3]  $BOT~tab&"   MOdified from Psion script"



gosub :bot~helpfile

setVar $BOT~script_title "MSL Calculator"
gosub :BOT~banner

setVar $i 1
while ($i <= SECTORS)
    setSectorParameter $i "MSLSEC" 0
    add $i 1
end

setVar $i 1
while ($i <= 10)
    setSectorParameter $i "MSLSEC" 1
    add $i 1
end
##Plots
##1#    1	SD
##2#    SD	1
##3#    SD	AC
##4#    AC	SD
##5#    SD	Ry
##6#    Ry	SD
##7#    AC	Ry
##8#    Ry	AC
:buildmsl
setArray $paths 8 2
setVar $i 1
setVar $k 1

##Builds static plot array
setVar $paths[1][1] 1
setVar $paths[1][2] STARDOCK
setVar $paths[2][1] STARDOCK
setVar $paths[2][2] 1
setVar $paths[3][1] STARDOCK
setVar $paths[3][2] $map~alpha_centauri
setVar $paths[4][1] $map~alpha_centauri
setVar $paths[4][2] STARDOCK
setVar $paths[5][1] STARDOCK
setVar $paths[5][2] $map~rylos
setVar $paths[6][1] $map~rylos
setVar $paths[6][2] STARDOCK
setVar $paths[7][1] $map~alpha_centauri
setVar $paths[7][2] $map~rylos
setVar $paths[8][1] $map~rylos
setVar $paths[8][2] $map~alpha_centauri

##Plots all MSLs
While ($k <= 8)
        setVar $one $paths[$k][1]
        setVar $two $paths[$k][2]
        gosub :plotpath
        add $k 1
end


if ($incflag = 1)
        setvar $switchboard~message "Insufficient data to calculate all MSL Sectors*"
		gosub :switchboard~switchboard
end
setvar $switchboard~message "MSLs calculated*"
gosub :switchboard~switchboard
halt

##Plots MSLs and records sectors
:plotpath
if ($one = 0)
        setVar $incflag 1
        return
elseif ($two = 0)
        setVar $incflag 1
        return
end

getCourse $plot $one $two
setvar $j 1
while ($j <= $plot)
        setVar $msldupe 0
        setVar $msldupecheck 1
        While ($msldupecheck <= $i)
                if ($plot[$j] = $msl[$msldupecheck])
                        setVar $msldupe 1
                end
                add $msldupecheck 1
        end
        if ($msldupe <> 1)
                setVar $msl[$i] $plot[$j]
                setSectorParameter $plot[$j] "MSLSEC" 1
                add $i 1
        end
        add $j 1
end
return

include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
