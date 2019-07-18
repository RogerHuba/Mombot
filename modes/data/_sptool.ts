# Title: Z-SPTool 
# Author: Zed 
# Copyright (c) 2010 by Archibald H. Vilanos III 
# All Rights Reserved. 
# Sector Parameter Utility. 
SetVar $version "1.08"
SetVar $creditz "Zed"
SetVar $scriptname "Z-SPTool"
SetVar $scripttitle "Zed's Sector Parameter Tool"
SetVar $Z_Lib~scriptname $scriptname
SetVar $Z_Lib~scripttitle $scripttitle
SetVar $Z_Lib~Version $version
GoSub :Z_Lib~INITLIB
Gosub :Z_Lib~CHECKONCE
# AUTHORISE
SetVar $authorise TRUE
If ($authorise <> TRUE)
    Gosub :Z_Auth~CHECK
End
#SetVar $Z_Lib~license LOGINNAME
# End Authorise
Gosub :Z_Lib~SYNC
    setVar $botIsDeaf TRUE
    saveVar $botIsDeaf
    openMenu TWX_TOGGLEDEAF false
    closeMenu
SetVar $sector CURRENTSECTOR
Gosub :SETUPKEYS
Gosub :LOADCONFIG
:STARTMENU
If ($sector = 0)
    SetVar $sectord ANSI_12 & "NOT SET"
ElseIf ($sector < 1) or ($sector > SECTORS)
    SetVar $sectord ANSI_12 & "BAD ENTRY"
ElseIf ($sector = CURRENTSECTOR)
    SetVar $sectord ANSI_10 & $sector & ANSI_11 & "   <--- Current Sector"
Else
    SetVar $sectord ANSI_15 & $sector
End
SetArray $usedkey 36
SetVar $i 1
While ($i <= 36)
    SetVar $usedkey[$i] $keyused[$i]
    SetVar $i ($i + 1)
End
SetVar $i 1
While ($i <= $options)
    SetVar $optiondisplay[$i] ANSI_12 & "NOT SET"
    SetVar $i ($i + 1)
End
IsNumber $isnum $sector
If ($isnum = TRUE)
    If ($sector >= 1) and ($sector <= SECTORS)
        ListSectorParameters $sector $sectorparms
        SetVar $extras 0
        SetArray $Extra 0
        SetArray $Extrakey 0
        SetArray $Extradisplay 0
        SetVar $i 1
        While ($i <= $sectorparms)
            GetSectorParameter $sector $sectorparms[$i] $parameter
            SetVar $j 1
            SetVar $isastandard FALSE
            While ($j <= $options)
                If ($sectorparms[$i] = $option[$j])
                    SetVar $isastandard TRUE
                    If ($optiontype[$j] = "B")
                        If ($parameter = TRUE)
                            SetVar $optiondisplay[$j] ANSI_15 & "TRUE"
                        Else
                            SetVar $optiondisplay[$j] ANSI_14 & "FALSE"
                        End
                    ElseIf ($optiontype[$j] = "T")
                        If ($parameter = TRUE)
                            SetVar $optiondisplay[$j] ANSI_15 & "TRUE"
                        End
                    ElseIf ($optiontype[$j] = "A") or ($optiontype[$j] = "N")
                        SetVar $optiondisplay[$j] $parameter
                    End
                End
                SetVar $j ($j + 1)
            End
            If ($isastandard = FALSE)
                SetVar $x 1
                While ($x <= 36)
                    If ($usedkey[$x] = FALSE)
                        SetVar $usedkey[$x] TRUE
                        SetVar $extras ($extras + 1)
                        SetVar $extrakey[$extras] $keys[$x]
                        SetVar $extra[$extras] $sectorparms[$i]
                        SetVar $extradisplay[$extras] ANSI_15 & $parameter
                        SetVar $x 36
                    End
                    SetVar $x ($x + 1)
                End
            End
            SetVar $i ($i + 1)
        End
    End
End
Gosub :Z_Lib~HEADER
Echo "*" & ANSI_12 & "-=[" & ANSI_14 & "S" & ANSI_12 & "]=- " & ANSI_11 & "View Sector    : " $sectord
Echo "*"
SetVar $i 1
While ($i <= $options)
    SetVar $linenum (5 + $i)
    Echo "*" & ANSI_12 & "-=[" & ANSI_14 & $optionkey[$i] & ANSI_12 & "]=- " & ANSI_11 & $option[$i] & "["&$linenum&";24H" & ": " & ANSI_15 & $optiondisplay[$i]
    SetVar $i ($i + 1)
End
If ($extras > 0)
    Gosub :Z_Strings~LINE
    Echo "*" & $Z_Strings~line
End
SetVar $i 1
While ($i <= $extras)
    SetVar $linenum ($options + 5 + $i + 1)
    Echo "*" & ANSI_12 & "-=[" & ANSI_14 & $extrakey[$i] & ANSI_12 & "]=- " & ANSI_11 & $extra[$i] & "["&$linenum&";24H" &  ": " & ANSI_15 & $extradisplay[$i]
    SetVar $i ($i + 1)
End
Gosub :Z_Strings~LINE
Echo "*" & $Z_Strings~line
Echo "*" & ANSI_12 & "-=[" & ANSI_14 & "="& ANSI_12 & "]=- " & ANSI_10 & "Create a NEW parameter"
Echo "*" & ANSI_12 & "-=[" & ANSI_14 & "-"& ANSI_12 & "]=- " & ANSI_10 & "Remove/clear a parameter"
Gosub :Z_Strings~LINE
Echo "*" & $Z_Strings~line
Echo "*" & ANSI_12 & "-=[" & ANSI_14 & "!"& ANSI_12 & "]=- " & ANSI_13 & "Remove/clear a parameter across ALL sectors"
Echo "*" & ANSI_12 & "-=[" & ANSI_14 & "@"& ANSI_12 & "]=- " & ANSI_13 & "Change a parameter across ALL sectors"
Echo "*" & ANSI_12 & "-=[" & ANSI_14 & "%"& ANSI_12 & "]=- " & ANSI_11 & "Remove/clear a parameter based on a sectorlist"
Echo "*" & ANSI_12 & "-=[" & ANSI_14 & "^"& ANSI_12 & "]=- " & ANSI_11 & "Change a parameter based on a sectorlist"
Echo "*" & ANSI_12 & "-=[" & ANSI_14 & "#"& ANSI_12 & "]=- " & ANSI_10 & "Count sectors based on the value of a parameter"
If ($lastcounted <> 0)
    Gosub :Z_Strings~LINE
    Echo "*" & $Z_Strings~line
    Echo "*" & ANSI_10 & "        Last count was " & ANSI_15 & $counted & ANSI_10 & " for value " & ANSI_14 & $lastcountvalue & ANSI_10 & " in parameter " & ANSI_14 & $lastcounted & ANSI_10 & "." 
End
Gosub :Z_Strings~LINE
Echo "*" & $Z_Strings~line
Echo "*" & ANSI_12 & "-=[" & ANSI_14 & "Q"& ANSI_12 & "]=- " & ANSI_10 & "Quit"
Echo "*"
GetConsoleInput $choice SINGLEKEY
UpperCase $choice
If ($choice = "S")
    Echo "**" & ANSI_10 & "Enter a Sector Number (1-" & SECTORS & "): " & ANSI_15
    GetConsoleInput $value
    IsNumber $isnum $value
    If ($isnum = TRUE)
        If (($value > 0) and ($value <= SECTORS))
            SetVar $sector $value
        End
    End
ElseIf ($choice = "=")
    Echo "**" & ANSI_10 & "Enter the NAME of the NEW parameter (NO SPACES): " & ANSI_15
    GetConsoleInput $value1
    UpperCase $value1
    GetWordPos $value1 $pos " "
    If ($value1 <> #13) and ($value1 <> "") and ($pos = 0)
        Echo "**" & ANSI_10 & "Enter a value for [" &ANSI_14 & $value1 & ANSI_10 & "]: " & ANSI_15
        GetConsoleInput $value2
        If ($value2 <> #13) and ($value2 <> "")
            SetSectorParameter $sector $value1 $value2
        End
    End
ElseIf ($choice = "-")
    Echo "**" & ANSI_10 & "Enter the NAME of the parameter to REMOVE: " & ANSI_15
    GetConsoleInput $value1
    UpperCase $value1
    GetWordPos $value1 $pos " "
    If ($value1 <> #13) and ($value1 <> "") and ($pos = 0)
        Echo "**" & ANSI_12 & "Are you SURE (Y/N): " & ANSI_15
        GetConsoleInput $value2 SINGLEKEY
        UpperCase $value2
        If ($value2 = "Y")
            SetSectorParameter $sector $value1 ""
        End
    End
ElseIf ($choice = "!")
    Echo "**" & ANSI_14 & "Enter the NAME of the parameter to REMOVE: " & ANSI_15
    GetConsoleInput $value1
    UpperCase $value1
    GetWordPos $value1 $pos " "
    If ($value1 <> #13) and ($value1 <> "") and ($pos = 0)
        Echo "**" & ANSI_14 & "[5m" & "!!! WARNING !!!" & "[0m"
        Echo "*" & ANSI_12 & "This will REMOVE the parameter " & ANSI_14 & $value1 & ANSI_12 & " ACROSS ALL SECTORS."
        Echo "*" & ANSI_12 & "Are you SURE (Y/N): " & ANSI_15
        GetConsoleInput $value2 SINGLEKEY
        UpperCase $value2
        If ($value2 = "Y")
            Gosub :Z_Lib~SETDIAL 
            SetVar $i 1
            While ($i <= SECTORS)
                SetSectorParameter $i $value1 ""
                SetVar $i ($i + 1)
                Gosub :Z_Lib~UPDATEDIAL 
            End
            Gosub :Z_Lib~ENDDIAL
        End
    End
ElseIf ($choice = "@")
    Echo "**" & ANSI_14 & "Enter the NAME of the parameter to ADD/CHANGE (NO SPACES): " & ANSI_15
    GetConsoleInput $value1
    UpperCase $value1
    GetWordPos $value1 $pos " "
    If ($value1 <> #13) and ($value1 <> "") and ($pos = 0)
        Echo "**" & ANSI_10 & "Enter a value for [" &ANSI_14 & $value1 & ANSI_10 & "]: " & ANSI_15
        GetConsoleInput $value2
        If ($value2 <> #13) and ($value2 <> "")
            Echo "**" & ANSI_14 & "[5m" & "!!! WARNING !!!" & "[0m" 
            Echo "*" & ANSI_12 & "This will CHANGE the parameter [" & ANSI_14 & $value1 & ANSI_12 & "] to [" & ANSI_14 & $value2 & ANSI_12 & "] ACROSS ALL SECTORS."
            Echo "*" & ANSI_12 & "Are you SURE (Y/N): " & ANSI_15
            GetConsoleInput $value3 SINGLEKEY
            UpperCase $value3
            If ($value3 = "Y")
                Gosub :Z_Lib~SETDIAL 
                SetVar $i 1
                While ($i <= SECTORS)
                    SetSectorParameter $i $value1 $value2
                    SetVar $i ($i + 1)
                    Gosub :Z_Lib~UPDATEDIAL 
                End
                Gosub :Z_Lib~ENDDIAL
            End
        End
    End
ElseIf ($choice = "#")
    Echo "**" & ANSI_10 & "Enter the NAME of the parameter to COUNT (NO SPACES): " & ANSI_15
    GetConsoleInput $value1
    UpperCase $value1
    GetWordPos $value1 $pos " "
    If ($value1 <> #13) and ($value1 <> "") and ($pos = 0)
        Echo "**" & ANSI_11 & "Press " & ANSI_14 & "ENTER" & ANSI_11 & " for EMPTY. Enter " & ANSI_14 & "!ANY!" & ANSI_11 & " for NOT empty and NOT FALSE."
        Echo "*" & ANSI_11 & "Remember: 0 = FALSE. 1 = TRUE."
        Echo "*" & ANSI_10 & "Enter a value to check for in [" &ANSI_14 & $value1 & ANSI_10 & "] " & ANSI_15
        GetConsoleInput $value2
        Echo "**" & ANSI_11 & "COUNT: Enter a filename to create a sector list or leave blank for none."
        Echo "*" & ANSI_11 & "Note that the prefix " & ANSI_14 & GAMENAME & "_" & ANSI_11 & " will be added automatically and if the file"
        Echo "*" & ANSI_11 & "exists it will be deleted prior to creation of the list.**"
        GetConsoleInput $value3
        If ($value3 <> "") and ($value3 <> "0")
            SetVar $filename GAMENAME & "_" & $value3
            Delete $filename
        End
        SetVar $counted 0
        Gosub :Z_Lib~SETDIAL
        SetVar $i 1
        While ($i <= SECTORS)
            GetSectorParameter $i $value1 $value
            If ($value2 = "!ANY!") and ($value <> "") and ($value <> "0")
                SetVar $counted ($counted + 1)
                Write $filename $i
            ElseIf ($value2 = $value)
                SetVar $counted ($counted + 1)
                Write $filename $i
            End
            SetVar $i ($i + 1)
            Gosub :Z_Lib~UPDATEDIAL
        End
        Gosub :Z_Lib~ENDDIAL
        SetVar $lastcounted $value1
        If ($value2 = #13) or ($value2 = "")
            SetVar $lastcountvalue "EMPTY"
        Else
            SetVar $lastcountvalue $value2
        End
    End
ElseIf ($choice = "%")
    Echo "**" & ANSI_11 & "CLEAR PARAMETERS: Enter the sectorlist filename or leave blank to cancel:*"
    GetConsoleInput $filename
    If ($filename <> "") and ($filename <> "0")
        FileExists $fileok $filename
        If ($fileok = TRUE)
            ReadToArray $filename $sectorlist
            Echo "**" & ANSI_14 & "Enter the NAME of the parameter to REMOVE: " & ANSI_15
            GetConsoleInput $value1
            UpperCase $value1
            GetWordPos $value1 $pos " "
            If ($value1 <> #13) and ($value1 <> "") and ($pos = 0)
                Echo "**" & ANSI_14 & "[5m" & "!!! WARNING !!!" & "[0m"
                Echo "*" & ANSI_12 & "This will REMOVE the parameter " & ANSI_14 & $value1 & ANSI_12 & " ACROSS ALL SECTORS in the list."
                Echo "*" & ANSI_12 & "Are you SURE (Y/N): " & ANSI_15
                GetConsoleInput $value2 SINGLEKEY
                UpperCase $value2
                If ($value2 = "Y")
                    Gosub :Z_Lib~SETDIAL
                    SetVar $i 1
                    While ($i <= $sectorlist)
                        IsNumber $isnum $sectorlist[$i]
                        If ($isnum = TRUE)
                            If ($sectorlist[$i] > 0) and ($sectorlist[$i] <= SECTORS)
                                SetSectorParameter $sectorlist[$i] $value1 ""
                            End
                        End
                        SetVar $i ($i + 1)
                        Gosub :Z_Lib~UPDATEDIAL
                    End
                    Gosub :Z_Lib~ENDDIAL
                End
            End
        Else
            Echo "**" & ANSI_14 & $filename & ANSI_12 & " - File NOT FOUND !"
            Gosub :Z_Lib~ANYKEY
            Goto :STARTMENU
        End
    End
ElseIf ($choice = "^")
    Echo "**" & ANSI_11 & "CHANGE PARAMETERS: Enter the sectorlist filename or leave blank to cancel:*"
    GetConsoleInput $filename
    If ($filename <> "") and ($filename <> "0")
        FileExists $fileok $filename
        If ($fileok = TRUE)
            ReadToArray $filename $sectorlist
            Echo "**" & ANSI_14 & "Enter the NAME of the parameter to ADD/CHANGE (NO SPACES): " & ANSI_15
            GetConsoleInput $value1
            UpperCase $value1
            GetWordPos $value1 $pos " "
            If ($value1 <> #13) and ($value1 <> "") and ($pos = 0)
                Echo "**" & ANSI_10 & "Enter a value for [" &ANSI_14 & $value1 & ANSI_10 & "]: " & ANSI_15
                GetConsoleInput $value2
                If ($value2 <> #13) and ($value2 <> "")
                    Echo "**" & ANSI_14 & "[5m" & "!!! WARNING !!!" & "[0m" 
                    Echo "*" & ANSI_12 & "This will CHANGE the parameter [" & ANSI_14 & $value1 & ANSI_12 & "] to [" & ANSI_14 & $value2 & ANSI_12 & "] ACROSS ALL SECTORS in the list."
                    Echo "*" & ANSI_12 & "Are you SURE (Y/N): " & ANSI_15
                    GetConsoleInput $value3 SINGLEKEY
                    UpperCase $value3
                    If ($value3 = "Y")
                        Gosub :Z_Lib~SETDIAL
                        SetVar $i 1
                        While ($i <= $sectorlist)
                            IsNumber $isnum $sectorlist[$i]
                            If ($isnum = TRUE)
                                If ($sectorlist[$i] > 0) and ($sectorlist[$i] <= SECTORS)
                                    SetSectorParameter $sectorlist[$i] $value1 $value2
                                End
                            End
                            SetVar $i ($i + 1)
                            Gosub :Z_Lib~UPDATEDIAL
                        End
                        Gosub :Z_Lib~ENDDIAL
                    End
                End
            End
        Else
            Echo "**" & ANSI_14 & $filename & ANSI_12 & " - File NOT FOUND !"
            Gosub :Z_Lib~ANYKEY
            Goto :STARTMENU
        End
    End
ElseIf ($choice = "Q")
    Goto :FINISH
Else
    SetVar $i 1
    While ($i <= $options)
        If ($choice = $optionkey[$i])
            If ($optiontype[$i] = "B")
                GetSectorParameter $sector $option[$i] $parameter
                If ($parameter = TRUE)
                    SetSectorParameter $sector $option[$i] FALSE
                Else
                    SetSectorParameter $sector $option[$i] TRUE
                End
            ElseIf ($optiontype[$i] = "T")
                GetSectorParameter $sector $option[$i] $parameter
                If ($parameter = TRUE)
                    SetSectorParameter $sector $option[$i] ""
                Else
                    SetSectorParameter $sector $option[$i] TRUE
                End
            ElseIf ($optiontype[$i] = "N")
                Echo "**" & ANSI_10 & "Enter a Number: " & ANSI_15
                GetConsoleInput $value
                IsNumber $isnum $value
                If ($isnum = TRUE)
                    SetSectorParameter $sector $option[$i] $value
                End
            ElseIf ($optiontype[$i] = "A")
                Echo "**" & ANSI_10 & "Enter a value or string: " & ANSI_15
                GetConsoleInput $value
                If ($value <> #13) and ($value <> "")
                    SetSectorParameter $sector $option[$i] $value
                End
            End
        End
        SetVar $i ($i + 1)
    End
    SetVar $i 1
    While ($i <= $extras)
        If ($choice = $extrakey[$i])
            Echo "**" & ANSI_10 & "Enter a value: " & ANSI_15
            GetConsoleInput $value
            If ($value <> #13) and ($value <> "")
                SetSectorParameter $sector $extra[$i] $value
            End
        End
        SetVar $i ($i + 1)
    End
End
Goto :STARTMENU
:FINISH
    openMenu TWX_TOGGLEDEAF false
    closeMenu
        echo #27 "[30D                        " #27 "[30D"
        echo CURRENTANSILINE
        setVar $BOT~botIsDeaf FALSE
        saveVar $BOT~botIsDeaf
Halt
# SETUPKEYS
:SETUPKEYS
SetVar $keys[1] "A"
SetVar $keys[2] "B"
SetVar $keys[3] "C"
SetVar $keys[4] "D"
SetVar $keys[5] "E"
SetVar $keys[6] "F"
SetVar $keys[7] "G"
SetVar $keys[8] "H"
SetVar $keys[9] "I"
SetVar $keys[10] "J"
SetVar $keys[11] "K"
SetVar $keys[12] "L"
SetVar $keys[13] "M"
SetVar $keys[14] "N"
SetVar $keys[15] "O"
SetVar $keys[16] "P"
SetVar $keys[17] "Q"
SetVar $keys[18] "R"
SetVar $keys[19] "S"
SetVar $keys[20] "T"
SetVar $keys[21] "U"
SetVar $keys[22] "V"
SetVar $keys[23] "W"
SetVar $keys[24] "X"
SetVar $keys[25] "Y"
SetVar $keys[26] "Z"
SetVar $keys[27] "1"
SetVar $keys[28] "2"
SetVar $keys[29] "3"
SetVar $keys[30] "4"
SetVar $keys[31] "5"
SetVar $keys[32] "6"
SetVar $keys[33] "7"
SetVar $keys[34] "8"
SetVar $keys[35] "9"
SetVar $keys[36] "0"
SetVar $i 1
While ($i <= 36)
    SetVar $keyused[$i] FALSE
    SetVar $i ($i + 1)
End
SetVar $keyused[17] TRUE
SetVar $keyused[19] TRUE
Return
# LOADCONFIG
:LOADCONFIG
SetVar $cfgfile "z-sptool.cfg"
Fileexists $fileexist $cfgfile
If ($fileexist = TRUE)
    ReadToArray $cfgfile $cfgsettings
    SetVar $i 1
    SetVar $options 0
    
    While ($i <= $cfgsettings)
        If ($cfgsettings[$i] <> 0) and ($cfgsettings[$i] <> "")
            GetWord $cfgsettings[$i] $value 1
            UpperCase $value
            If ($value = "B") or ($value = "N") or ($value = "A") or ($value = "N") or ($value = "T")
                SetVar $options ($options + 1)
                SetVar $optiontype[$options] $value
                
                GetWord $cfgsettings[$i] $value 2
                UpperCase $value
                SetVar $count 1
                SetVar $used FALSE
                While ($count <= 36)
                    If ($value = $keys[$count])
                        If ($keyused[$count] = TRUE)
                            SetVar $used TRUE
                        Else
                            SetVar $keyused[$count] TRUE
                        End
                    End
                    SetVar $count ($count + 1)
                End
                If ($used = TRUE)
                    Echo "**" & ANSI_12 & "KEY ASSIGNED TWICE [" & ANSI_14 & $value & ANSI_12 & "]. Exiting..**"
                    Goto :FINISH
                End
                SetVar $optionkey[$options] $value
                
                GetWord $cfgsettings[$i] $value 3
                SetVar $option[$options] $value
                
                SetVar $optiondisplay[$options] "NOT SET"
            End
        End
        SetVar $i ($i + 1)
    End
Else
# Optiontypes can be B=Boolean, N=Number, A=Alphanumeric, T=TRUE or nul 
    SetVar $optiontype[1] "B"
    SetVar $optionkey[1] "F"
    SetVar $option[1] "FIGSEC"
    
    SetVar $optiontype[2] "B"
    SetVar $optionkey[2] "M"
    SetVar $option[2] "MINESEC"
    
    SetVar $optiontype[3] "B"
    SetVar $optionkey[3] "L"
    SetVar $option[3] "LIMPSEC"
    
    SetVar $optiontype[4] "T"
    SetVar $optionkey[4] "B"
    SetVar $option[4] "BUSTED"
    
    SetVar $optiontype[5] "T"
    SetVar $optionkey[5] "J"
    SetVar $option[5] "MSLSEC"
    
    SetVar $i 1
    SetVar $options 5
    Write $cfgfile "# -------------------------------------------------------------"
    Write $cfgfile "# Z-SPTool STANDARD Sector Parameters Configuration."
    Write $cfgfile "# --------------------------------------------------"
    Write $cfgfile "# Format is 1 entry per SectorParameter per line."
    Write $cfgfile "# Each line has 3 parts separated by spaces."
    Write $cfgfile " "
    Write $cfgfile "# TYPE KEY SECTORPARAMETER."
    Write $cfgfile " "
    Write $cfgfile "# TYPE can be: B or N or A or T or #."
    Write $cfgfile "# Where B is type Boolean (TRUE or FALSE)."
    Write $cfgfile "#       N is type Numerical (a number)."
    Write $cfgfile "#       A is type alphanumerical (a string)."
    Write $cfgfile "#       T is type TRUE or Nul (Parameter is erased when FALSE)."
    Write $cfgfile "#       # is a comment (ignored by Z-SPTool)."
    Write $cfgfile " "
    Write $cfgfile "# KEY is the key to press in the menu to alter the parameter."
    Write $cfgfile "# Ensure that each key is unique. A-Z and 0-9 are acceptable."
    Write $cfgfile "# Note that Q and S are already used and are unavailable."
    Write $cfgfile " "
    Write $cfgfile "# SECTORPARAMETER is the name of the parameter as stored in the game database."
    Write $cfgfile "# -------------------------------------------------------------"
    Write $cfgfile " "
    While ($i <= $options)
        Write  $cfgfile $optiontype[$i]&" "&$optionkey[$i]&" "&$option[$i]
        SetVar $i ($i + 1)
    End
End
Return
# INCLUDES
Include include\Z_Auth.ts
Include include\Z_Lib.ts
Include include\Z_Strings.ts
# ZeD Compiled: Sun 09/01/2011 - 16:37:42.08 
# ZeD Compiled: Sun 09/01/2011 - 21:42:12.04 
# ZeD Compiled: Wed 02/02/2011 - 21:39:02.80 
# ZeD Compiled: Tue 07/06/2011 -  5:57:38.22 
# ZeD Compiled: Wed 22/06/2011 - 16:37:12.48 
# ZeD Compiled: Wed 27/07/2011 -  8:39:29.55 
# ZeD Compiled: Sat 20/10/2012 -  5:46:20.27 
# ZeD Compiled: Sun 25/11/2012 -  9:29:17.53 
include "source\module_includes\bot"
