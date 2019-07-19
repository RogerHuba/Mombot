#	Log Reader & Filter - For M()M Bot
#	Updated: OCT 22 - 0130hours
#	Spoof Proofed
#
#							news [type] {refresh}
#
#	News types allowed:
#                           rep			- overall reporting of events in the Log
#                           foton		- lists fotons fired
#							tow			- who was towed
#							ports		- port activity (construction, demolition)
#							planets		- who popped planet and how many
#							obits		- CBY's, Fuses, Captures, etc..
#							corp		- Corporate news, formations, hirings, firings, etc.
#							fed			- Awarded Commish, Bounties
#							pods		-
#							invasions	- Planet invasions
#							overloads	- list of sectors with overloaded planets
#							announce	- reporting of any announcements made
#
#   Refresh command line params:
#							r			- does a refresh using curnet game date
#							yest		- does a refresh of previous game date data
#
#	Features Comming Soon:
#                           showme      - will echo snippets of the log on ss as defined by one
#                                         additional param: news showme [from] ...max number of lines
#                                         send on SS will prob be 20 (included will be time stamping)
#                                         be 2hrs..
#                           echo		- sender will transmit log data with ansi code
#										  via internal mail system, receiving bot will
#										  redisplay in techni-colour!
#							tracker		- will be used to indicate a Traders activity,
#										  in the Log, allowing for determining when Trader(s)
#										  are most likely to be afk.
#
#[1;36mWookie[5;31m captured [1;36mLostone's [30;46mBattlestar[32;40m!
# ============================== START NEWS MODULE (news)  ==============================
gosub :BOT~loadVars

#HELP FILE
	setVar $BOT~help[1]   $BOT~tab&"news   "
	setVar $BOT~help[2]   $BOT~tab&"    Daily news reader "
	setVar $BOT~help[3]   $BOT~tab&"    rep         - Overall reporting of events in the Log*"
	setVar $BOT~help[4]   $BOT~tab&"    foton       - Lists fotons fired*"
	setVar $BOT~help[5]   $BOT~tab&"    tow         - Who was towed*"
	setVar $BOT~help[6]   $BOT~tab&"    ports       - Port activity (construction, demolition, Openings)*"
	setVar $BOT~help[7]   $BOT~tab&"    planets     - Who popped planet(s) and how many*"
	setVar $BOT~help[8]   $BOT~tab&"    corp        - Corporate news, formations, hirings, firings, etc.*"
	setVar $BOT~help[9]   $BOT~tab&"    fed         - Awarded Commish, Bounties*"
	setVar $BOT~help[10]  $BOT~tab&"    pods        - Itemized list of who podded*"
	setVar $BOT~help[11]  $BOT~tab&"    overloads   - List of sectors with overloaded planets*"
	setVar $BOT~help[12]  $BOT~tab&"    announce    - Reporting of any announcements made*"

	setVar $BOT~help[13]  $BOT~tab&"      "
	setVar $BOT~help[14]  $BOT~tab&"      Author: Lonestar"
	gosub :bot~helpfile

	loadvar $game~PHOTON_COST

if ($bot~parm1 = "help")
	send "'*{" $bot~bot_name "} - news [category] {r}*"
	send " Categories Allowed:*"
	send "                *"
	halt
end		

:Read_News_Paper
	setVar $News_Param1 $bot~parm1
	setVar $News_Param2 $bot~parm2
	
# ============================== END NEWS MODULE (news) ==============================
	setVar $News_Version "v2.0"
	
	setVar $UNDER_CONSTRUCTION	"    *    Feature Currently Not Implemented*     *"
	setVar $NEWS_HEADER			"-------------=[Lonestar's M()M Dailies News Reader " & $News_Version & "]=-------------*"
	setVar $Universal_File_Err	"    *    Problem Reading Data File*    *    "
	setVar $Unexpected_EOF		"** '{" & $bot~bot_name & "} - Unexpected End Of Array. Halting.*"
	setVar $NEWS_EMPTY			"[32mNo log entries today."
	# A brief scan for $NEW_EMPTY, result indicated by $NEWS_VALIDATED
	setVar $NEWS_VALIDATED		FALSE
	setVar $NEWS_FOOTER			""
	setVar $NEWS_FILE			$bot~folder&"/news.log"
	# First line in NEWS file, indicates last update --local computer time/date.
	setVar $file_header			""
	setVar $NEWS_READ			FALSE
	loadVar $NEWS_Yest
	# Actual Lines is a count of Log data that excludes Date Time Stamping
	setVar $ActualLines			0

	gosub :player~quikstats
	setVar $startingLocal $player~current_prompt

	if (($startingLocal <> "Citadel") and ($startingLocal <> "Command"))
		setvar $switchboard~message "Must start at citadel or command prompt*"
		gosub :switchboard~switchboard
		halt
	end

	setVar $NEWS_Yest FALSE
		gosub :LOG_2_FILE
	

	gosub :FILE_2_ARRAY
	gosub :FORMAT_FOOTER
	gosub :VALIDATE

	send "'*"
	waitFor "Comm-link open on sub-space band"

	send $NEWS_HEADER

	if ($NEWS_VALIDATED = FALSE)
		send "     *      No News To Report*     *     *"
	elseif (($News_Param1 = "rep") OR ($News_Param1 = 0) OR ($News_Param1 = "r") OR ($News_Param1 = "yest"))
		gosub :OVERLOAD
		send $UMass_Results  & "    *"
		gosub :TOW_DETAIL
		send $TowResults  & "       *"
		gosub :PORT_AUTHORITY
		send $PortResults  & "      *"
		gosub :PLANETS_POPPED
		send $PoppedResults & "     *"
		gosub :PHOTONS_FIRED
		send $LaunchedResults& "    *"
		gosub :PODINGSS
		send $PodResults & "        *"
		gosub :ANNOUNCED
		send $annonResults & "      *"
		gosub :CORPORATE
		send $CorpResults & "       *"
		gosub :FED
		send $FedResults & "        *"
	elseif ($News_Param1 = "foton")
		gosub :PHOTONS_LIST
		send $PhotonResults
	elseif ($News_Param1 = "tow")
		gosub :TOW_DETAIL
		send $TowResults  & "       *"
	elseif ($News_Param1 = "ports")
		gosub :PORT_AUTHORITY
		send $PortResults  & "      *"
	elseif ($News_Param1 = "planets")
		gosub :PLANETS_POPPED
		send $PoppedResults  & "    *"
	elseif ($News_Param1 = "obits")
		send $UNDER_CONSTRUCTION
	elseif ($News_Param1 = "pods")
		gosub :PODINGSS
		send $PodResults & "        *"
	elseif ($News_Param1 = "corp")
		gosub :CORPORATE
		send $CorpResults & "       *"
	elseif ($News_Param1 = "invasions")
		send $UNDER_CONSTRUCTION
	elseif ($News_Param1 = "overload")
		gosub :OVERLOAD
		send $UMass_Results  & "    *"
	elseif ($News_Param1 = "announce")
		gosub :ANNOUNCED
		send $annonResults  & "     *"
	elseif ($News_Param1 = "fed")
		gosub :FED
		send $FedResults & "        *"
	else
		send "    *    SYNTAX ERROR!*      *"
#		send " param1 " & $News_Param1 & "*"
#		send " param2 " & $News_Param1 & "*    *"
	end
	send $NEWS_FOOTER & "** "
	halt
#=========================== SUB ROUTINES ===========================================
:PODINGSS
	setVar $idx 1
	setVar $PodResults ""
	setVar $PodSize 200
	setVar $Poddings 10
	# A 3rd 'pod' migth actually be a #SD# ...hard to tell
	setArray $Pods $PodSize $Poddings
	setVar $PodCNT 0
	if (($NEWS_READ) AND ($Lines <> 0))
    	while ($idx <= $Lines)
    		setVar $currentline $NEWS_ARRAY[$idx]
	    	if ($currentline = "EOF")
				send $Unexpected_EOF
				halt
			else
                getWordPos $currentline $pos "[0;32m was on the pl"
                if ($pos <> 0)
                    setVar $i 1
                    setVar $TrderResp " N/A  "
                    add $PodCNT 1
                    gosub :TIME_DECODE
                    getText $currentline $Trader "[1;36m" "[0;32m was"
                    #Let's see who blew up the planet..
                    while ($i <= ($idx + 10)
                        setVar $ctline $NEWS_ARRAY[$i]
                        getWordPos $cline $pos "DESTROYED[32m the planet"
                        if ($pos <> 0)
                            getText $cline $TraderResp "[1;36m" "[5;31m"
                            goto :Resp_SRCH_DONE
                        end
                        add $i 1
                    end
                    :Resp_SRCH_DONE
                    setVar $i 1
                    while ($i <= $PosSize)
                        if ($Pods[$i] = $Trader)
                            setVar $ii 1
                            while ($ii <= $Poddings)
                                if ($Pods[$i][$ii] = 0)
                                    setVar $Pods[$i][$ii] $timeCode  & " Was on a planet Blown-up by: " & $TraderResp
                                    goto :Next_Podding
                                end
                                add $ii 1
                            end
                        elseif ($Pods[$i] = 0)
                            setVar $Pods[$i] $Trader
                            setVar $Pods[$i][1] $timeCode  & " Was on a planet Blown-up by: " & $TraderResp
                            goto :Next_Podding
                        end
                    end
                end

                getWordPos $currentline $pos "[31mGOT BLOWN UP TOO!"
                if ($pos <> 0)
                    setVar $i 1
                    add $PodCNT 1
                    gosub :TIME_DECODE
                    getText $currentline $Trader "[1;36m" " [31mGOT"
                    while ($i <= $PodSize)
                        if ($Pods[$i] = $Trader)
                            setVar $ii 1
                            while ($ii <= $Poddings)
                                if ($Pods[$i][$ii] = 0)
									setVar $Pods[$i][$ii] $timeCode & " Destroyed a Planet and got blown up too!"
									goto :Next_Podding
                                end
                                add $ii 1
                            end
                        elseif ($Pods[$i] = 0)
          					setVar $Pods[$i] $Trader
                            setVar $Pods[$i][1] $timeCode & " Destroyed a Planet and got blown up too!"
							goto :Next_Podding
                        end
                        add $i 1
                    end
                end

				getWordPos $currentline $pos "[32m by collision with a Nav"
				if ($pos <> 0)
					setVar $i 1
					add $PodCNT 1
					gosub :TIME_DECODE
					getText $currentline $Trader "[1;36m" "'s ["
					while ($i <= $PodSize)
						if ($Pods[$i] = $Trader)
							setVar $ii 1
							while ($ii <= $Poddings)
								if ($Pods[$i][$ii] = 0)
									setVar $Pods[$i][$ii] $timeCode & " Collided with a Navigational Hazard!"
									goto :Next_Podding
								end
								add $ii 1
							end
						elseif ($Pods[$i] = 0)
        					setVar $Pods[$i] $Trader
        					setVar $Pods[$i][1] $timeCode & " Collided with a Navigational Hazard!"
        					goto :Next_Podding
						end
						add $i 1
					end
				end

				getWordPos $currentline $pos "[32m by a Corbomite Reaction!"
				if ($pos <> 0)
					setVar $i 1
					add $podCNT 1
					gosub :TIME_DECODE
					getText $currentline $Trader "[1;36m" "'s "
					while ($i <= $PodSize)
						if ($Pods[$i] = $Trader)
							setVar $ii 1
							while ($ii <= $Poddings)
								if ($Pods[$i][$ii] = 0)
									setVar $Pods[$i][$ii] $timeCode & " Ship was Destroyed by a Corbomite Reaction!"
									goto :Next_Podding
								end
								add $ii 1
							end
						elseif ($Pods[$i] = 0)
        					setVar $Pods[$i] $Trader
        					setVar $Pods[$i][1] $timeCode & " Ship was Destroyed by a Corbomite Reaction!"
        					goto :Next_Podding
						end
						add $i 1
					end
				end

				getWordPos $currentline $pos "[32m while invading [1;36m"
				if ($pos <> 0)
					setVar $i 1
					add $podCNT 1
					gosub :TIME_DECODE
					getText $currentline $Trader "[1;36m" "'s [0"
					getText $currentline $planet~planetoid "invading [1;36m" "[0;32m!"
					while ($i <= $PodSize)
						if ($Pods[$i] = $Trader)
							setVar $ii 1
							while ($ii <= $Poddings)
								if ($Pods[$i][$ii] = 0)
									setVar $Pods[$i][$ii] $timeCode & " Ship was Destroyed Invading " & $planet~planetoid & "!"
									goto :Next_Podding
								end
								add $ii 1
							end
						elseif ($Pods[$i] = 0)
        					setVar $Pods[$i] $Trader
        					setVar $Pods[$i][1] $timeCode & " Ship was Destroyed Invading " & $planet~planetoid & "!"
        					goto :Next_Podding
						end
						add $i 1
					end
				end

				getWordPos $currentline $pos "destroyed[32m by a Quasar"
				if ($pos <> 0)
					setVar $i 1
					add $PodCNT 1
					gosub :TIME_DECODE
					getText $currentline $Trader "[1;36m" "'s ["
					while ($i <= $PodSize)
						if ($Pods[$i] = $Trader)
							setVar $ii 1
							while ($ii <= $Poddings)
								if ($Pods[$i][$ii] = 0)
									setVar $Pods[$i][$ii] $timeCode & " Ship was Destroyed by a Quasar Cannon!"
									goto :Next_Podding
								end
								add $ii 1
							end
						elseif ($Pods[$i] = 0)
        					setVar $Pods[$i] $Trader
        					setVar $Pods[$i][1] $timeCode & " Ship was Destroyed by a Quasar Cannon!"
        					goto :Next_Podding
						end
						add $i 1
					end
				end

				getWordPos $currentline $pos "[0;32m's fighters!"
				if ($pos <> 0)
					setVar $i 1
					add $PodCNT 1
					gosub :TIME_DECODE
					getText $currentline $Trader "[1;36m" "'s ["
					while ($i <= $PodSize)
						if ($Pods[$i] = $Trader)
							setVar $ii 1
							while ($ii <= $Poddings)
								if ($Pods[$i][$ii] = 0)
									setVar $Pods[$i][$ii] $timeCode & " was destroyed by fighters!"
									goto :Next_Podding
								end
								add $ii 1
							end
						elseif ($Pods[$i] = 0)
        					setVar $Pods[$i] $Trader
        					setVar $Pods[$i][1] $timeCode & " was destroyed by fighters!"
        					goto :Next_Podding
						end
						add $i 1
					end
				end

				getWordPos $currentline $pos "[5;31m DESTROYED [1;36m"
				if ($pos <> 0)
				    getWordPos $currentline $pos "[1;36mCorp #[33m"
				    if ($pos <> 0)
				        #Filter out empty ships
                        goto :Next_Podding
                    end
					setVar $i 1
					add $PodCNT 1
					gosub :TIME_DECODE
					getText $currentline $Trader "DESTROYED [1;36m" "'s "
					getTExt $currentline $Podder "[1;36m" "[5;31m"
					while ($i <= $PodSize)
						if ($Pods[$i] = $Trader)
							setVar $ii 1
							while ($ii <= $Poddings)
								if ($Pods[$i][$ii] = 0)
									setVar $Pods[$i][$ii] $timeCode & " Ship Destroyed by " & $Podder
									goto :Next_Podding
								end
								add $ii 1
							end
						elseif ($Pods[$i] = 0)
        					setVar $Pods[$i] $Trader
        					setVar $Pods[$i][1] $timeCode & " Ship Destroyed by " & $Podder
        					goto :Next_Podding
						end
						add $i 1
					end
				end

				getWordPos $currentline $pos " [0;32msurrendered a"
				if ($pos <> 0)
					setVar $i 1
					add $PodCNT 1
					gosub :TIME_DECODE

					getText $currentline $Trader "[1;36m" " [0;32msurrendered a"
					while ($i <= $PodSize)
						if ($Pods[$i] = $Trader)
							setVar $ii 1
							while ($ii <= $Poddings)
								if ($Pods[$i][$ii] = 0)
									setVar $Pods[$i][$ii] $timeCode & " surrendered a ship!"
									goto :Next_Podding
								end
								add $ii 1
							end
						elseif ($Pods[$i] = 0)
        					setVar $Pods[$i] $Trader
        					setVar $Pods[$i][1] $timeCode & " " & $speacial
        					goto :Next_Podding
						end
						add $i 1
					end
				end

				getWordPos $currentline $pos "[32m by atomic fusion!"
				if ($pos <> 0)
					setVar $i 1
					add $PodCNT 1
					gosub :TIME_DECODE
					getText $currentline $Trader "[1;36m" "'s ["
					while ($i <= $PodSize)
						if ($Pods[$i] = $Trader)
							setVar $ii 1
							while ($ii <= $Poddings)
								if ($Pods[$i][$ii] = 0)
									setVar $Pods[$i][$ii] $timeCode & " Ship was Destroyed by atomic fusion"
									goto :Next_Podding
								end
								add $ii 1
							end
						elseif ($Pods[$i] = 0)
        					setVar $Pods[$i] $Trader
        					setVar $Pods[$i][1] $timeCode & " Ship was Destroyed by atomic fusion!"
        					goto :Next_Podding
						end
						add $i 1
					end
				end

				getWordPos $currentline $pos "by [1;36mCaptain Zyrain"
				if ($pos <> 0)
					setVar $i 1
					add $PodCNT 1
					gosub :TIME_DECODE
					getText $currentline $Trader "[1;36m" "'s ["
					while ($i <= $PodSize)
						if ($Pods[$i] = $Trader)
							setVar $ii 1
							while ($ii <= $Poddings)
								if ($Pods[$i][$ii] = 0)
									setVar $Pods[$i][$ii] $timeCode & " Ship was Destroyed by Captain Zyrain!"
									goto :Next_Podding
								end
								add $ii 1
							end
						elseif ($Pods[$i] = 0)
        					setVar $Pods[$i] $Trader
        					setVar $Pods[$i][1] $timeCode & " Ship was Destroyed by Captain Zyrain!"
        					goto :Next_Podding
						end
						add $i 1
					end
				end
			end
			:Next_Podding
			add $idx 1
		end

		setVar $PodResults "Possible Poddings:*"
 		setVar $i 1

		while ($i <= $PodSize)
			if ($Pods[$i] <> 0)
				setVar $ii 1
				setVar $PodResults $PodResults & "           " & $Pods[$i] & "*"
				while ($ii <= 10)
					if ($Pods[$i][$ii] <> 0)
						setVar $PodResults $PodResults & "              " & $Pods[$i][$ii] & "*"
					end
					add $ii 1
				end
			end
			add $i 1
		end

	else
		setVar $PodResults $Universal_File_Err
	end

	return
:FED
	setVar $idx 1
	setVar $FedResults ""
	setVar $BountySize 500
	setArray $Bounties $BountySize
	setVar $BountyCNT 0
	setVar $CommishSize 500
	setArray $Commish $CommishSize
	setVar $CommishCNT 0

	if (($NEWS_READ) AND ($Lines <> 0))
    	while ($idx <= $Lines)
    		setVar $currentline $NEWS_ARRAY[$idx]
	    	if ($currentline = "EOF")
				send $Unexpected_EOF
				halt
			else
            	getWordpos $currentline $pos "[33mThe Federation hereby posts"
            	if ($pos <> 0)
            		add $BountyCNT 1
                	getText $currentline $Amount "of [1m" "[0;33m credits"
                	setVar $i ($idx+1)
                	while ($i <= $Lines)
                		setVar $TraderSearch $NEWS_ARRAY[$i]
						getWordPos $TraderSearch $pos "[33m  for the destruction of"
						if ($pos <> 0)
							getText $TraderSearch $Trader "of [1;36m" " [0;33mship!"
							goto :Got_Trader
						end
                    	add $i 1
                    end
                    setVar $Trader "-- Not Known --"
                    :Got_Trader
                    setVar $i 1
                    while ($i <= $BountySize)
						if ($Bounties[$i] <> 0)
							setVar $Bounties[$i] $Trader & " for " & $Amount
							goto :Next_Fed_Item
						end
                    	add $i 1
					end
                end

				getWordPos $currentline $pos "[31m was awarded a Federal"
				if ($pos <> 0)
					add $CommishCNT 1
					gosub :TIME_DECODE
					getText $currentline $Trader "[1;32m" "[31m was"
					setVar $i 1
					while ($i <= $CommishSize)
						if ($Commish[$i] <> 0)
							setVar $Commish[$i] $timeCode & " - " & $Trader
                        	goto :Next_Fed_Item
						end
						add $i 1
					end
				end
			end
			:Next_Fed_Item
			add $idx 1
		end

		if ($BountyCNT > 0)
			setVar $FedResults $BountyCNT & " Federal Bounties Posted:*"
			setVar $i 1
			while ($i <= $BountySize)
				if ($Bounties[$i] <> 0)
					setVar $FedResults $FedResults & "                               " & $Bounties[$i] & "*"
				end
				add $i 1
			end
			setVar $FedResults $FedResults & "         *"
		else
			setVar $FedResults "Federal Bounties Posted:        None*     *"
		end
		if ($CommishCNT > 0)
			setVar $FedResults $FedResults & $CommishCNT & " Federal Commissions Issued:*"
			setVar $i 1
			while ($i <= $CommishSize)
				if ($Commish[$i] <> 0)
					setVar $FedResults $FedResults & "                               " & $Commish[$i] & "*"
				end
				add $i 1
			end
		else
			setVar $FedResults $FedResults & "Federal Commissions Issued:     None*"
		end
	else
		setVar $FedResults $Universal_File_Err
	end
	return

:CORPORATE
	setVar $idx 1
	setVar $CorpResults ""
	setVar $Corps_NEW 0
	setVar $CorpArraySize 50
	setVar $CorpMemberSize 10
	setArray $Corporations $CorpArraySize $CorpMemberSize
	setVar $FiredSize 200
	setArray $Fired $FiredSize
	setVar $FiredCNT 0

	if (($NEWS_READ) AND ($Lines <> 0))
    	while ($idx <= $Lines)
    		setVar $currentline $NEWS_ARRAY[$idx]
	    	if ($currentline = "EOF")
				send $Unexpected_EOF
				halt
			else
            	getWordPos $currentline $pos "name of [1;33m"
				if ($pos <> 0)
					add $Corps_NEW 1
					setVar $i 1
					gosub :TIME_DECODE
					while ($i <= $CorpArraySize)
						if ($Corporations[$i] = 0)
							getText $currentline $Trader "[1;36m" "[0;32m created"
							getText $currentline $CorpName "of [1;33m" "[0;32m."
							setVar $Corporations[$i] $CorpName
							setVar $Corporations[$i][1] $timeCode & " " & $Trader & " Created Corp"
							goto :Next_CorpItem
						end
						add $i 1
					end
					goto :Next_CorpItem
				end

				getWordPos $currentline $pos "[0;32m joined up with"
				if ($pos <> 0)
					getText $currentline $CorpName "with [1;33m" "[0;32m."
					getText $currentline $Trader "[1;36m" "[0;32m joined"
					gosub :TIME_DECODE
					setVar $i 1
					while ($i <= $CorpArraySize)
						if ($CorpName = $Corporations[$i])
							setVar $ii 1
							while ($ii <= $CorpMemberSize)
								if ($Corporations[$i][$ii] = 0)
                                	setVar $Corporations[$i][$ii] $timeCode & " " & $Trader & " joined corp"
									goto :Next_CorpItem
								end
                            	add $ii 1
							end
						elseif ($Corporations[$i] = 0)
							setVar $Corporations[$i] $CorpName
							setVar $Corporations[$i][1] $timeCode & " " & $Trader & " joined corp"
							goto :Next_CorpItem
						end
						add $i 1
					end
					goto :Next_CorpItem
				end

				getWordPos $currentline $pos "[0;32m tried to"
				if ($pos <> 0)
                	getText $currentline $CorpName "Corp: [1;33m" "[0;32m!"
                	setVar $i 1
					gosub :TIME_DECODE
					getText $currentline $Trader "[1;36m" "[0;32m tried"
					while ($i <= $CorpArraySize)
						if ($CorpName = $Corporations[$i])
    						setVar $ii 1
							while ($ii <= $CorpMemberSize)
								if ($Corporations[$i][$ii] = 0)
                                	setVar $Corporations[$i][$ii] $timeCode & " " & $Trader & " Attempted a B&E"
			                        goto :Next_CorpItem
                            	end
                            	add $ii 1
                            end
                        elseif ($Corporations[$i] = 0)
							setVar $Corporations[$i] $CorpName
                           	setVar $Corporations[$i][1] $timeCode & " " & $Trader & " Attempted a B&E"
	                        goto :Next_CorpItem
						end
						add $i 1
					end
					goto :Next_CorpItem
				end

				getWordPos $currentline $pos "[0;32m disbanded Corp"
				if ($pos <> 0)
                	getText $currentline $CorpName "Corp [1;33m" "[0;32m."
					getText $currentline $Trader "[1;36m" "[0;32m disbanded"
                	setVar $i 1
					gosub :TIME_DECODE
					while ($i <= $CorpArraySize)
						if ($CorpName = $Corporations[$i])
    						setVar $ii 1
							while ($ii <= $CorpMemberSize)
								if ($Corporations[$i][$ii] = 0)
                                	setVar $Corporations[$i][$ii] $timeCode & " " & $Trader & " Disbanded Corp"
			                        goto :Next_CorpItem
                            	end
                            	add $ii 1
                            end
                        elseif ($Corporations[$i] = 0)
							setVar $Corporations[$i] $CorpName
                           	setVar $Corporations[$i][1] $timeCode & " " & $Trader & " Disbanded Corp"
                        	goto :Next_CorpItem
						end
						add $i 1
					end
					goto :Next_CorpItem
				end

				getWordPos $currentline $pos "[0;32m deserted"
				if ($pos <> 0)
					getText $currentline $CorpName "Corp [1;33m" "[0;32m."
    				getText $currentline $Trader "[1;36m" "[0;32m deserted"
					gosub :TIME_DECODE
					setVar $i 1
					while ($i <=  $CorpArraySize)
						if ($CorpName = $Corporations[$i])
							setVar $ii 1
							while ($ii <= $CorpMemberSize)
                                if ($Corporations[$i][$ii] = 0)
    								setVar $Corporations[$i][$ii] $timeCode & " " & $Trader & " Deserted Corp"
									goto :Next_CorpItem
								end
								add $ii 1
							end
						elseif ($Corporations[$i] = 0)
							setVar $Corporations[$i] $CorpName
							setVar $Corporations[$i][1] $timeCode & " " & $Trader & " Deserted Corp"
                        	goto :Next_CorpItem
						end
                    	add $i 1
					end
				end

				getWordPos $currentline $pos "[0;32m removed [1;33m"
				if ($pos <> 0)
					add $FiredCNT 1
    				setVar $i 0
    				while ($i <= $FiredSize)
                    	if ($Fired[$i] = 0)
                    		getText $currentline $Trader "[1;36m" "[0;32m removed"
                    		getText $currentline $player~corpnumber "Corp#[1;33m" "[0;32m."
							gosub :TIME_DECODE
                        	setVar $Fired[$i] $timeCode & " " & $Trader & " removed from Corp #" & $player~corpnumber
							goto :Next_CorpItem
						end
						add $i 1
					end
				end
			end
			:Next_CorpItem
            add $idx 1
		end

        setVar $CorpResults "Corporate Happenings:*            *"

       	if ($Corporations[1] <> 0)
			setVar $i 1
			while ($i <= $CorpArraySize)
				if ($Corporations[$i] <> 0)
					setVar $currentCorp $Corporations[$i]
					setVar $CorpResults $CorpResults & "        " & $currentCorp & "*"
					setVar $ii 1
					while ($ii <= $CorpMemberSize)
						if ($Corporations[$i][$ii] <> 0)
							setVar $CorpResults $CorpResults & "           " & $Corporations[$i][$ii] & "*"
						end
						add $ii 1
					end
				end
				add $i 1
			end
			return
			if ($FiredCNT <> 0)
				setVar $i 1
				while ($i <= $FiredSize)
					if ($Fired[$i] <> 0)
						setVar $CorpResults $CorpResults & "           " & $Fired[$i] & "*"
					end
					add $i 1
				end
			end
		else
	        setVar $CorpResults "Corporate Happenings:           None*"
			end
	else
		setVar $CorpResults $Universal_File_Err
	end
	return

:ANNOUNCED
	setVar $idx 1
	setVar $annonCNT 0
	setVar $annonResults ""
	setVar $annonsize 5000
	setArray $annon $annonsize

	if (($NEWS_READ) AND ($Lines <> 0))
    	while ($idx <= $Lines)
	    	setVar $currentline $NEWS_ARRAY[$idx]
	    	if ($currentline = "EOF")
				send $Unexpected_EOF
				halt
			else
				getWordPos $currentline $pos "[0;32mposted this"
				if (($pos <> 0) AND ($annonCNT < $annonsize))
					add $annonCNT 1
                	getText $currentline $Trader "[1;36m" " [0;32mposted"
					gosub :TIME_DECODE
					setVar $currentline $NEWS_ARRAY[($idx+1)]
					striptext $currentline "0m[1;34m"
					striptext $currentline "[1;34m"
					setVar $temp $timeCode & "::" & $Trader & "::" & $currentline
					getLength $temp $length
					if ($length > 70)
						cutText $temp $temp1 1 70
						if ($length > 127)
							setVar $temp3 ""
							setVar $temp2 ""
							stripText $temp $temp1
							cutText $temp $temp2 1 57
							stripText $temp $temp2
							cutText $temp $temp3 1 9999
							setVar $temp $temp1 & "*             " & $temp2 & "*             " & $temp3
    					else
							stripText $temp $temp1
							cutText $temp $temp2 1 9999
							setVar $temp $temp1 & "*             " & $temp2
						end
					end
					setVar $annon[$annonCNT] $temp
				end
			end
			add $idx 1
		end

		if ($annonCNT <> 0)
        	setVar $annonResults "    *" & $annonCNT & " Public Addresses Made:*     *"
        	setVar $i 1
        	while ($i <= $annonCNT)
				setVar $annonResults $annonResults & $annon[$i] & "*"
            	add $i 1
        	end
		else
			setVar $annonResults "   *" & "Public Addresses Made:  None*"
		end
	else
		setVar $annonResults  $Universal_File_Err
	end
	return
#=-------------------------------------------------------------------------------------------
:PLANETS_POPPED
	setVar $idx 1
	setVar $PoppedResults ""
	setVar $Popped 0
	setVar $PopperSize 20000
	setArray $Poppers $PopperSize 2
	setVar $PoppingTraders 0

	if (($NEWS_READ) AND ($Lines <> 0))
    	while ($idx <= $Lines)
	    	setVar $currentline $NEWS_ARRAY[$idx]
	    	if ($currentline = "EOF")
				send $Unexpected_EOF
				halt
	    	else
	    		getWordPos $currentline $Pos "[5;31m DESTROYED[32m the planet"
				getWordPos $currentline $Poz "[1;36m"
	    		if (($pos <> 0) AND ($poz = 1))
					add $Popped 1
					getText $currentline $Trader "[1;36m" "[5;31m DESTROYED"
					setVar $i 1
					while ($i <= $PopperSize)
						if ($Poppers[$i][1] = $Trader)
							setVar $temp $Poppers[$i][2]
							stripText $temp " "
							add $temp 1
							if ($temp < 10)
								setVar $Poppers[$i][2] "   "  & $temp
							elseif ($temp < 100)
								setVar $Poppers[$i][2] "  " & $temp
							elseif ($temp < 1000)
								setVar $Poppers[$i][2] " " & $temp
							else
								setVar $Poppers[$i][2] $temp
							end
							goto :done_popper
						elseif ($Poppers[$i][2] = 0)
							setVar $Poppers[$i][1] $Trader
							setVar $Poppers[$i][2] "   1"
							goto :done_popper
						end
						add $i 1
					end
				end
			end
			:done_popper
			add $idx 1
		end
		if ($Popped <> 0)
			setVar $PoppedResults $Popped & " Planet(s) Popped:*"
			setVar $i 1
			while ($i <= $PopperSize)
				if ($Poppers[$i][1] <> 0)
					setVar $PoppedResults $PoppedResults & "                       " & $Poppers[$i][2] & " by " & $Poppers[$i][1] & "*"
				end
				add $i 1
			end
		else
			setVar $PoppedResults "Planet(s) Popped:*"
			setVar $PoppedResults $PoppedResults & "                       None*"
		end
	else
		setVar $PoppedResults $Universal_File_Err
	end
	return
#=-------------------------------------------------------------------------------------------
:PORT_AUTHORITY
	setVar $idx 1
	setVar $PortResults ""
	setVar $BlownCNT 0
	setVar $PortArraySize 2000
	setArray $PortBlown $PortArraySize 3
	setArray $NewPorts $PortArraySize
	setVar $NewPortIDX 0
	setArray $Opened $PortArraySize
	setVar $OpenedIDX 0
	setArray $Advanced $PortArraySize
	setVar $AdvancedIDX 0
	setArray $nAdvanced $PortArraySize
	setVar $nAdvancedIDX 0
	setVar $PortOffSize $PortArraySize
	setArray $PortOff $PortOffSize
	SetVar $PortOffCNT 0

	if (($NEWS_READ) AND ($Lines <> 0))
    	while ($idx <= $Lines)
	    	setVar $currentline $NEWS_ARRAY[$idx]
	    	if ($currentline = "EOF")
				send $Unexpected_EOF
				halt
	    	else
				getWordPos $currentline $pos "[0;32m began construction!"
				if ($pos <> 0)
					add $NewPortIDX 1
					getText $currentline $currentline "[1;36m" "[0;32m began"
					setVar $NewPorts[$NewPortIDX] $currentline
					goto :Next_Port
				end

				getWordPos $currentline $pos "[0;32m opened"
				if ($pos <> 0)
					add $OpenedIDX 1
					stripText $currentline "[0;32m opened for business today. (" & $NEWS_DATE & ")"
					stripText $currentline "[32mPort [1;36m"
					gosub :TIME_DECODE
					setVar $Opened[$OpenedIDX] $currentline & " at " & $timeCode
					goto :Next_Port
				end

 				getWordPos $currentline $pos "[0;32m construction advanced."
 				if ($pos <> 0)
					add $AdvancedIDX 1
					stripText $currentline "[1;36m"
					stripText $currentline "[0;32m construction advanced."
					setVar $Advanced[$AdvancedIDX] $currentline
					goto :Next_Port
				end

				getWordPos $currentline $pos "[5;31m construction did not"
 				if ($pos <> 0)
					add $nAdvancedIDX 1
					stripText $currentline "[32mPort [1;36m"
					stripText $currentline "[5;31m construction did not advance."
					setVar $nAdvanced[$nAdvancedIDX] $currentline
					goto :Next_Port
				end

				getWordPos $currentline $pos "by Star Port [35m"
				if ($pos <> 0)
					add $PortOffCNT 1
					getText $currentline $Trader "[1;36m" "[0;32m was"
					getText $currentline $PortName "Port [35m" "[32m!"
					gosub :TIME_DECODE
					while ($i <= $PortOffSize)
						if ($i <> 0)
						if ($PortOff[$i] <> "0")
							setVar $PortOff[$i] $timeCode & " " & $Trader & " attacked by Port " & $PortName
							goto :Next_Port
						end
						end
						add $i 1
					end
				end

                getWordPos $currentline $pos "[5;31m DESTROYED [32mthe Star Port in sector"
                if ($pos <> 0)
					add $BlownCNT 1
					getText $currentline $Trader "[1;36m" "[5;31m DESTROYED"
					getText $currentline $Port_Addy "sector [1;33m" "[0;32m!"
					setVar $i 1
					while ($i <= $PortArraySize)
						if ($PortBlown[$i][1] = $Trader)
							setVar $temp $PortBlown[$i][2]
							stripText $temp " "
							gosub :TIME_DECODE
							add $temp 1
							if ($temp < 10)
								setVar $PortBlown[$i][2] "   " & $temp
							elseif ($temp < 100)
								setVar $PortBlown[$i][2] "  " & $temp
							elseif ($temp < 1000)
								setVar $PortBlown[$i][2] " " & $temp
							else
								setVar $PortBlown[$i][2] $temp
							end
							setVar $PortBlown[$i][3] $PortBlown[$i][3]&"*                                Sector "&$Port_Addy & " at " & $timeCode
							goto :Next_Port
						else
							gosub :TIME_DECODE
							setVar $PortBlown[$i][1] $Trader
							setVar $PortBlown[$i][2] "   1"
							setVar $PortBlown[$i][3] $Port_Addy & " at " & $timeCode
							goto :Next_Port
						end
						add $i 1
					end
				end
			end
			:Next_Port
			add $idx 1
		end

		if ($NewPortIDX <> 0)
			setVar $PortResults $PortResults & "       *"
			setVar $PortResults $NewPortIDX & " New Ports:*"
			setVar $i 1
			while ($i <= $NewPortIDX)
				setVar $PortResults $PortResults & "                       " & $NewPorts[$i] & "*"
				add $i 1
			end
		else
			setVar $PortResults $PortResults & "       *"
			setVar $PortResults $PortResults & "New Ports:                    None*"
		end
		if ($OpenedIDX <> 0)
			setVar $PortResults $PortResults & "       *"
			setVar $PortResults $PortResults & $OpenedIDX & " Ports Opened Today:*"
			setVar $i 1
			while ($i <= $OpenedIDX)
				setVar $PortResults $PortResults & "                       " & $Opened[$i] & "*"
				add $i 1
			end
		else
			setVar $PortResults $PortResults & "       *"
			setVar $PortResults $PortResults & "Opened Today:                 None*"
		end

		if ($AdvancedIDX <> 0)
			setVar $PortResults $PortResults & "       *"
			setVar $PortResults $PortResults & $AdvancedIDX & " Ports Construction Advanced:*"
			setVar $i 1
			while ($i <= $AdvancedIDX)
				setVar $PortResults $PortResults & "                              " & $Advanced[$i] & "*"
				add $i 1
			end
		else
			setVar $PortResults $PortResults & "       *"
			setVar $PortResults $PortResults & "Port Construction Advanced:   None*"
		end

		if ($nAdvancedIDX <> 0)
			setVar $PortResults $PortResults & "       *"
			setVar $PortResults $PortResults & $nAdvancedIDX & " Ports Construction Stalled:*"
			setVar $i 1
			while ($i <= $nAdvancedIDX)
				setVar $PortResults $PortResults & "                              " & $nAdvanced[$i] & "*"
				add $i 1
			end
		else
			setVar $PortResults $PortResults & "       *"
			setVar $PortResults $PortResults & "Port Construction Stalled:    None*"
		end

		if ($BlownCNT <> 0)
			setVar $PortResults $PortResults & "       *"
			setVar $PortResults $PortResults & $BlownCNT & " Ports Blown Up:*"
			setVar $i 1
			while ($i <= $PortArraySize)
				if ($PortBlown[$i][1] <> 0)
					setVar $PortResults $PortResults & "                       " & $PortBlown[$i][2] & " by " & $PortBlown[$i][1] & "*"
					setVar $PortResults $PortResults & "                                Sector " & $PortBlown[$i][3] & "*"
			end
				add $i 1
			end
		else
			setVar $PortResults $PortResults & "       *"
			setVar $PortResults $PortResults & "Ports Blown Up:               None*"
		end

        if ($PortOffCNT <> 0)
			setVar $PortResults $PortResults & "       *"
			setVar $PortResults $PortResults & $PortOffCNT & " Port Attacks:*"
			setVar $i 1
			while ($i <= $portOffSize)
				if ($PortOff[$i] <> 0)
					setVar $PortResults $PortResults & "                       " & $PortOff[$i] & "*"
				end
            	add $i 1
			end
		end
		setVar $PortResults $PortResults & "       *"
	else
		setVar $PortResults $Universal_File_Err
	end
	return
#=-------------------------------------------------------------------------------------------
:OVERLOAD
	setVar $idx 1
	setVar $UMass_Results "Unstable Planetary Masses: None Detected*"
	setVar $UMass 0
	setVar $CollidedSize 500
	setArray $Collided  $CollidedSize

	if (($NEWS_READ) AND ($Lines <> 0))
    	while ($idx <= $Lines)
	    	setVar $currentline $NEWS_ARRAY[$idx]
	    	if ($currentline = "EOF")
				send $Unexpected_EOF
				halt
	    	else
    	    	getWordPos $currentline $pos "[32mAn unstable "
        		if ($pos <> 0)
					add $UMass 1
					getText $currentline $UMassAddy "sector [1;33m" ""
					setVar $currentline $NEWS_ARRAY[($idx+1)]
					getWordPos $currentline $pos "[31m collided!"
					if ($pos <> 0)
						getText $currentline $temp1 "Planets [36m" " [31mand"
						getText $currentline $temp2 "and [36m" "[31m collided"
						setVar $UMassAddy "Sector: " & $UMassAddy & ", Planets " & $temp1 & " and " & $temp2
					else
						setVar $UMassAddy "Sector: " & $UMassAddy & ", Planet Name Unkown"
					end
                    setVar $Collided[$UMass] $UMassAddy
				else
					getWordPos $currentline $pos "[33mEnd Daily Journal [34m"
					if ($pos <> 0)
						if ($UMass <> 0)
							setVar $UMass_Results $UMass & " Unstable Planetary Masses:*"
							setVar $i 1
							while ($i <= $UMass)
								setVar $UMass_Results $UMass_Results & "                      " & $Collided[$i] & "*"
								add $i 1
							end
						end
						return
					end
				end
			end
			add $idx 1
		end
	else
		setVar $UMass_Results $Universal_File_Err
	end
	return
#=-------------------------------------------------------------------------------------------
:PHOTONS_FIRED
	setVar $idx 1
	setVar $LaunchedResults ""
	setVar $Launched 0
	setVar $LaunchedSize 1000
	setArray $Launchers $LaunchedSize 2000

	if (($NEWS_READ) AND ($Lines <> 0))
		while ($idx <= $Lines)
			setVar $currentline $NEWS_ARRAY[$idx]
			if ($currentline = "EOF")
				send $Unexpected_EOF
				halt
			else
				getWordPos $currentline $pos "[0;32m launched a"
				if ($pos <> 0)
					add $Launched 1
                    setVar $Trader $currentline
                    stripText $Trader "[1;36m"
					stripText $Trader "[0;32m launched a Photon Missile somewhere!"
					setVar $i 1
					while ($i <= $LaunchedSize)
						if ($Launchers[$i][1] = $Trader)
							setVar $temp $Launchers[$i][2]
							stripText $temp " "
							gosub :TIME_DECODE
							add $temp 1
							if ($temp < 10)
								setVar $Launchers[$i][2] "   " & $temp
							elseif ($temp < 100)
								setVar $Launchers[$i][2] "  " & $temp
							elseif ($temp < 1000)
								setVar $Launchers[$i][2] " " & $temp
							else
								setVar $Launchers[$i][2] $temp
							end
							#setVar $Launchers[$i][($temp+2)] $timeCode
							goto :done_torper
						elseif ($Launchers[$i][1] = 0)
							gosub :TIME_DECODE
							setVar $Launchers[$i][1] $Trader
							setVar $Launchers[$i][2] "   1"
							setVar $Launchers[$i][3] $timeCode
							goto :done_torper
						end
						add $i 1
					end
				end
			end
			:done_torper
			add $idx 1
    	end

		if ($Launched <> 0)
			setVar $LaunchedResults $Launched & " Photons Launched:*"
			setVar $i 1
			while ($i <= $LaunchedSize)
				if ($Launchers[$i][1] <> 0)
					setVar $LaunchedResults $LaunchedResults & "                       " & $Launchers[$i][2] & " by " & $Launchers[$i][1] & " ("&$Launchers[$i][2]*$game~photon_cost&" credits worth)*"
					if ($Launchers[$i][2] > 4)
						#Let's get only the 4 most recent firings
						setVar $math4dummies ($Launchers[$i][2] - 4)
						setVar $ii ($math4dummies + 3)
					else
						setVar $ii 3
					end
					while ($Launchers[$i][$ii] <> 0)
						setVar $LaunchedResults $LaunchedResults & "                                  " & $Launchers[$i][$ii] & "*"
						add $ii 1
					end
				end
				add $i 1
			end
		else
			setVar $LaunchedResults "Photons Launched:*"
			setVar $LaunchedResults $LaunchedResults & "                       None Were Found In Log*"
		end
	else
		setVar $LaunchedResults $Universal_File_Err
	end
	return
#=-------------------------------------------------------------------------------------------
:PHOTONS_LIST
	setVar $idx 1
	setVar $PhotonResults ""
	setVar $TotalFired 0

	if (($NEWS_READ) AND ($Lines <> 0))
		while ($idx <= $Lines)
			setVar $currentline $NEWS_ARRAY[$idx]
			if ($currentline = "EOF")
				send $Unexpected_EOF
				halt
			else
				getWordPos $currentline $pos "[0;32m launched a Photon Missile somewhere!"
				if ($pos <> 0)
					add $TotalFired 1
					gosub :TIME_DECODE
					stripText $currentline " somewhere!"
					stripText $currentline "[1;36m"
					stripText $currentline "[0;32m"
					setVar $PhotonResults $PhotonResults & $timeCode & " - " & $currentline & "*"
				end
			end
			add $idx 1
		end

		if ($TotalFired <> 0)
			setVar $PhotonResults $PhotonResults & "------------*" & "Total Fired: " & $TotalFired & "*"
		else
			setVar $PhotonResults "   *    No Photons Fired*    *"
		end
	else
		setVar $PhotonResults $Universal_File_Err
	end

	return
#=-------------------------------------------------------------------------------------------
:TIME_DECODE
	setVar $TimeIDX ($idx - 1)
	while ($TimeIDX > 0)
		getWordPos $NEWS_ARRAY[$TimeIDX] $pos $Filter
		if ($pos <> 0)
			setVar $timeCode $NEWS_ARRAY[$TimeIDX]
			stripText $timecode $Filter & " [0;35m"
			stripText $timecode "[1;31m-- [0;35m"
			stripText $timecode "[1;31m --"
			return
		end
		subtract $TimeIDX 1
	end
	setVar $timeCode "  UnKnown  "
	return
#=-------------------------------------------------------------------------------------------
:TOW_DETAIL
	setVar $idx 1
	setVar $TowResults ""
	setVar $ArraySize 200
	setArray $Towed $ArraySize
	setVar $hits 0

	if (($NEWS_READ) AND ($Lines <> 0))
		while ($idx <= $Lines)
			setVar $currentline $NEWS_ARRAY[$idx]
			if ($currentline = "EOF")
				send $Unexpected_EOF
				halt
			else
				getWordPos $currentline $pos "[0;33m was towed"
				if ($pos <> 0)
					add $hits 1
					stripText $currentline  "[0;33m was towed out of FedSpace"
					SetVar $ii $idx
					while ($ii <= $Lines)
						setVar $Search $NEWS_ARRAY[$ii]
						getWordPos $Search $pos $currentline
						if ($pos = 1)
							stripText $currentline "[1;36m"
							setVar $TowResults $TowResults & "                      " & $currentline & " - Has Been Online*"
							goto :search_complete
						end
						add $ii 1
					end
					stripText $currentline "[1;36m"
					setVar $TowResults $TowResults & "                      " & $currentline & "*"
					:search_complete
				else
					getWordPos $currentline $pos "[33mEnd Daily Journal [34m"
					if ($pos <> 0)
						if ($hits = 0)
							setVar $TowResults "Towed From Fed Space: No One*"
						else
							setVar $TowResults "Towed From Fed Space:*" & $TowResults
						end
						return
					end
				end
			end
			add $idx 1
		end
	else
		setVar $TowResults $Universal_File_Err
	end
	return
#=-------------------------------------------------------------------------------------------
:FORMAT_FOOTER
	setVar $idx 1
	loadVar $NEWS_DATE
	setVar $Filter "[1;31m-- [0;35m" & $NEWS_DATE & "[1;31m --"

	if (($NEWS_READ) AND ($Lines > 0))
		while ($idx <= $Lines)
			setVar $currentline $NEWS_ARRAY[$idx]
			if ($currentline = "EOF")
				send $Unexpected_EOF
				halt
			end
			getWordPos $currentline $Pos $Filter
			if ($Pos = 0)
				add $ActualLines 1
			end
        	add $idx 1
		end

		setVar $NEWS_FOOTER "---={Lines In Log: " & $ActualLines
		if ($NEWS_Yest)
			setVar $NEWS_FOOTER $NEWS_FOOTER & " - Yesturday's Log Data."
		end
		setVar $NEWS_FOOTER $NEWS_FOOTER & "*---={Last Updated: " & $NEWS_ARRAY[1] & "*"
	else
		setVar $NEWS_FOOTER "---------------- ERROR - DATA CORRUPTION -------------------"
	end
	return
#=-------------------------------------------------------------------------------------------
:FILE_2_ARRAY
	setVar $NEWS_READ TRUE
	read $NEWS_FILE $file_header 1
	readToArray $NEWS_FILE $NEWS_ARRAY
	setVar $Lines $NEWS_ARRAY

	if (($file_header = "EOF") OR ($Lines <= 0))
		setvar $switchboard~message "Problem Reading File. Try A Refresh. Halting*"
		gosub :switchboard~switchboard
		halt
	else
		setvar $switchboard~message "Loading NEWS::AS OF " & $file_header & "*"
		gosub :switchboard~switchboard
		#waitfor "(?="
	end
	return
#=-------------------------------------------------------------------------------------------
:VALIDATE
	setVar $idx 1
	setVar $Limitor 35

	if (($NEWS_READ) AND ($Lines <> 0))
		if ($Lines < $Limitor)
			setVar $Limitor $Lines
		end
		while ($idx <= $Limitor)
			setVar $currentline $NEWS_ARRAY[$idx]
			if ($currentline = "EOF")
				send $Unexpected_EOF
				halt
			else
				getWordPos $currentline $pos $NEWS_EMPTY
				if ($pos <> 0)
					setVar $NEWS_VALIDATED FALSE
					return
				end
			end
			add $idx 1
		end
		setVar $NEWS_VALIDATED TRUE
	else
		setVar $NEWS_VALIDATED FALSE
	end

	return
#=-------------------------------------------------------------------------------------------
:LOG_2_FILE
	Delete $NEWS_FILE
	setVar $STOP_DATE ""
	saveVar $NEWS_Yest
	setvar $switchboard~message "Reading Log To File... Comms will be off during this...*"
	gosub :switchboard~switchboard
	send "| C D"
	setVar $s TIME & "-" & DATE
	getTime $s "h:nna/p - d/m/yyy"
	write  $NEWS_FILE $s
	:GetDate_Spoof
	setTextTrigger GetDate :GetDate "Enter the beginning date you wish to read from. Today is"
	pause
	:GetDate
		killTrigger GetDate
		setVar $ANSI CURRENTANSILINE
		stripText $ANSI "[0m"
		stripText $ANSI #10
		stripText $ANSI #13

		getWordPos $ANSI $pos "is [1;33m"
		if ($pos <> 0)
			getText $ANSI $NEWS_DATE "is [1;33m" ""

			if ($NEWS_Yest)

				setVar $STOP_DATE $NEWS_DATE
				replaceText $NEWS_DATE "/" " "
				getWord $NEWS_DATE $news_month 1
				getWord $NEWS_DATE $news_day 2
				getWord $NEWS_DATE $news_year 3

				if (($news_month = 12) AND ($news_day = 01))
					setVar $news_month 11
					setVar $news_day 30
				elseif (($news_month = 11) AND ($news_day = 1))
					setVar $news_month 10
					setVar $news_day 31
				elseif (($news_month = 10) AND ($news_day = 1))
					setVar $news_month 9
					setVar $news_day 30
				elseif (($news_month = 9) AND ($news_day = 1))
					setVar $news_month 8
					setVar $news_day 31
				elseif (($news_month = 8) AND ($news_day = 1))
					setVar $news_month 7
					setVar $news_day 31
				elseif (($news_month = 7) AND ($news_day = 1))
					setVar $news_month 6
					setVar $news_day 30
				elseif (($news_month = 6) AND ($news_day = 1))
					setVar $news_month 5
					setVar $news_day 31
				elseif (($news_month = 5) AND ($news_day = 1))
					setVar $news_month 4
					setVar $news_day 30
				elseif (($news_month = 4) AND ($news_day = 1))
					setVar $news_month 3
					setVar $news_day 31
				elseif (($news_month = 3) AND ($news_day = 1))
					# I'll worry about leap years if it becomes an issue :)
					setVar $news_month 2
					setVar $news_day 28
				elseif (($news_month = 2) AND ($news_day = 1))
					setVar $news_month 1
					setVar $news_day 31
				elseif (($news_month = 1) AND ($news_day = 1))
					setVar $news_month 12
					setVar $news_day 30
				else
					subtract $news_day 1
				end

				setVar $NEWS_DATE $news_month & "/" & $news_day & "/" & $news_year
			end
			saveVar $NEWS_DATE
   		else
			goto :GetDate_Spoof
		end
		:InDate_Spoof
		setTextTrigger InDate :InDate "Input search date"
		pause
	:InDate
		killTrigger InDate
		getWordPos CURRENTANSILINE $pos "[35mInput"
		if ($pos <> 0)
           	send $NEWS_DATE & "*y*"
       	else
       		goto :InDate_Spoof
       	end

		:TopOfLog_Spoof
		setTextTrigger TopOfLog :TopOfLog "-=-=-=-=-=-=-=-=-=- Trade Wars 2002"
		pause

    :TopOfLog
       	killTrigger TopOfLog
		getWordPos CURRENTANSILINE $Pos "[1;34m  -="
		if  ($pos <> 0)
   		else
			goto :TopOfLog_Spoof
		end
		:end_of_lines_spoof
		if ($NEWS_Yest)
			setTextLineTrigger end_of_lines1 :end_of_lines "S.D. " & $STOP_DATE
		else
			setTextTrigger end_of_lines2 :end_of_lines "command [TL="
		end
		setTextLineTrigger Nothing_2_Do :Nothing_2_Do "No log entries today."
	:reset_line_trigger
		setTextLineTrigger line_trig :parse_scan_line
		pause
	:parse_scan_line
		killTrigger :line_trig
		setVar $ANSI CURRENTANSILINE
		stripText $ANSI "[0m"
		stripText $ANSI #13
		stripText $ANSI #16

#   		getWordPos $ANSI $Pos "[35m[Pause]"
   		getWordPos $ANSI $Pos "[Pause]"
   		if ($pos <> 0)
           	send "*"
			goto :reset_line_trigger
		end
		if (($ANSI = "") OR ($ANSI = 0))
			goto :reset_line_trigger
		end
		write $NEWS_FILE $ANSI
		goto :reset_line_trigger
	:Nothing_2_Do
		killAllTriggers
		setVar $ANSI CURRENTANSILINE
		getWordPos $ANSI $pos $NEWS_EMPTY
		if ($pos <> 0)
			write $NEWS_FILE $NEWS_EMPTY
			send "***  Q|"
			goto :Done_Reading_News
		else
			goto :end_of_lines_spoof
		end
	:end_of_lines
       	killTrigger end_of_lines
       	killTrigger line_trig

        if ($NEWS_Yest)
        	getWordPos CURRENTANSILINE $Pos "[1;34m-="
			if ($Pos <> 0)
				send "*  *   *  ** Q|"
			else
				goto :end_of_lines_spoof
			end
        else
	       	getWordPos CURRENTANSILINE $Pos "[1;33mTL"
			if ($Pos <> 0)
				send " Q|"
			else
				goto :end_of_lines_spoof
			end
		end
		:Done_Reading_News
		setVar $NEWS_READ TRUE
		waitOn "<Computer deactivated>"
	return

#INCLUDES:
include "source\module_includes\bot"
include "source\bot_includes\player\quikstats\player"
include "source\bot_includes\switchboard"
