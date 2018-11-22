# ======================     START BUYING SUBROUTINES     =================

# ----- SUB :buyhaggle
:buyhaggle
    setVar $empty $TOTAL_HOLDS
    setVar $overhagglemultiple 	147
    setVar $cyclebuffer 		1
    setVar $cyclebufferlimit 	20
    
    send "*"
    setTextLineTrigger buyfirstoffer :buyfirstoffer "We'll sell them for"
    pause

    :buyfirstoffer
        getWord CURRENTLINE $offer 5
        striptext $offer ","

        gosub :swathdisable~swathoff
        if ($swathdisable~swathoff = 0)
            send "L " & $PLANET & "* "
		if ($startingLocation = "Citadel")
			send "C "
		end
            setVar $exit_message $swathdisable~swathOffMessage
            goto :buydownExit
        end


        setVar $counter $offer
        if ($buydown_mode = "Best Price")
            multiply $counter 92
            divide $counter 100
        elseif ($buydown_mode = "Worst Price")
            multiply $counter $overhagglemultiple
            divide $counter 100
        end
        send $counter & "*"
    :buyofferloop
        setTextLineTrigger buyprice :buyprice "We'll sell them for"
        setTextLineTrigger buyfinaloffer :buyfinaloffer "Our final offer"
        setTextLineTrigger buynotinterested :buynotinterested "We're not interested."
        setTextLineTrigger buyexperience :buyexperience "experience point(s)"
        setTextLineTrigger buyempty :buyempty "empty cargo holds"
        setTextLineTrigger buyscrewup1 :buyscrewup "Get real ion-brain, make me a real offer."
        setTextLineTrigger buyscrewup2 :buyscrewup "This is the big leagues Jr.  Make a real offer."
        setTextLineTrigger buyscrewup3 :buyscrewup "My patience grows short with you."
        setTextLineTrigger buyscrewup4 :buyscrewup "I have much better things to do than waste my time.  Try again."
        setTextLineTrigger buyscrewup5 :buyscrewup "HA! HA, ha hahahhah hehehe hhhohhohohohh!  You choke me up!"
        setTextLineTrigger buyscrewup6 :buyscrewup "Quit playing around, you're wasting my time!"
        setTextLineTrigger buyscrewup7 :buyscrewup "Make a real offer or get the "
        setTextLineTrigger buyscrewup8 :buyscrewup "WHAT?!@!? you must be crazy!"
        setTextLineTrigger buyscrewup9 :buyscrewup "So, you think I'm as stupid as you look? Make a real offer."
        setTextLineTrigger buyscrewup10 :buyscrewup "What do you take me for, a fool?  Make a real offer!"
        pause
        pause
    :buyscrewup
        killtrigger buyscrewup1
        killtrigger buyscrewup2
        killtrigger buyscrewup3
        killtrigger buyscrewup4
        killtrigger buyscrewup5
        killtrigger buyscrewup6
        killtrigger buyscrewup7
        killtrigger buyscrewup8
        killtrigger buyscrewup9
        killtrigger buyscrewup10
        killtrigger buyprice
        killtrigger buyfinaloffer
        killtrigger buynotinterested
        killtrigger buyexperience
        killtrigger buyempty
        if ($buydown_mode = "Best Price")
            multiply $counter 102
            divide $counter 100
        elseif ($buydown_mode = "Worst Price")
            subtract $overhagglemultiple 1
            setVar $counter $offer
            multiply $counter $overhagglemultiple
            divide $counter 100
        end
        send $counter & "*"
        goto :buyofferloop
    :buyprice
        killtrigger buyscrewup1
        killtrigger buyscrewup2
        killtrigger buyscrewup3
        killtrigger buyscrewup4
        killtrigger buyscrewup5
        killtrigger buyscrewup6
        killtrigger buyscrewup7
        killtrigger buyscrewup8
        killtrigger buyscrewup9
        killtrigger buyscrewup10
        killtrigger buyprice
        killtrigger buyfinaloffer
        killtrigger buynotinterested
        killtrigger buyexperience
        killtrigger buyempty
        setVar $old_offer $offer
        setVar $old_counter $counter
        getWord CURRENTLINE $offer 5
        striptext $offer ","
        setVar $offer_pct $offer
        multiply $offer_pct 1000
        divide $offer_pct $old_offer
        if ($offer_pct > 990)
            setVar $offer_pct 990
        end
        multiply $counter 1000
        divide $counter $offer_pct
        if ($counter <= $old_counter)
            add $counter 1
        end
        send $counter & "*"
        goto :buyofferloop
    :buyfinaloffer
        killtrigger buyscrewup1
        killtrigger buyscrewup2
        killtrigger buyscrewup3
        killtrigger buyscrewup4
        killtrigger buyscrewup5
        killtrigger buyscrewup6
        killtrigger buyscrewup7
        killtrigger buyscrewup8
        killtrigger buyscrewup9
        killtrigger buyscrewup10
        killtrigger buyprice
        killtrigger buyfinaloffer
        killtrigger buynotinterested
        killtrigger buyexperience
        killtrigger buyempty
        setVar $old_offer $offer
        setVar $old_counter $counter
        getWord CURRENTLINE $offer 5
        striptext $offer ","
        setVar $offer_change $offer
        subtract $offer_change $old_offer
        subtract $offer_change 1
        multiply $offer_change 25
        divide $offer_change 10
        subtract $counter $offer_change
        if ($counter = $old_counter)
            add $counter 1
        end
        add $counter 1
        send $counter & "*"
        goto :buyofferloop
    :buynotinterested
        killtrigger buyscrewup1
        killtrigger buyscrewup2
        killtrigger buyscrewup3
        killtrigger buyscrewup4
        killtrigger buyscrewup5
        killtrigger buyscrewup6
        killtrigger buyscrewup7
        killtrigger buyscrewup8
        killtrigger buyscrewup9
        killtrigger buyscrewup10
        killtrigger buyprice
        killtrigger buyfinaloffer
        killtrigger buynotinterested
        killtrigger buyexperience
        killtrigger buyempty
        send "0* "
        send "0* "
        goto :buyhagglefailed
    :buyexperience
        killtrigger buyscrewup1
        killtrigger buyscrewup2
        killtrigger buyscrewup3
        killtrigger buyscrewup4
        killtrigger buyscrewup5
        killtrigger buyscrewup6
        killtrigger buyscrewup7
        killtrigger buyscrewup8
        killtrigger buyscrewup9
        killtrigger buyscrewup10
        killtrigger buyprice
        killtrigger buyfinaloffer
        killtrigger buynotinterested
        killtrigger buyexperience
        killtrigger buyempty
        getWord CURRENTLINE $exp_bonus 7
        add $exp $exp_bonus
        add $jetbonus $exp_bonus
        goto :buyofferloop
    :buyempty
        killtrigger buyscrewup1
        killtrigger buyscrewup2
        killtrigger buyscrewup3
        killtrigger buyscrewup4
        killtrigger buyscrewup5
        killtrigger buyscrewup6
        killtrigger buyscrewup7
        killtrigger buyscrewup8
        killtrigger buyscrewup9
        killtrigger buyscrewup10
        killtrigger buyprice
        killtrigger buyfinaloffer
        killtrigger buynotinterested
        killtrigger buyexperience
        killtrigger buyempty
        getWord CURRENTLINE $CREDITS 3
        stripText $CREDITS ","
        setVar $oldempty $empty
        getWord CURRENTLINE $empty 6
        if ($oldempty = $empty)
            goto :buyhagglefailed
        else
            goto :buyhagglesucceeded
        end
    :buyhagglefailed
        setVar $buyhaggle 0
        return
    :buyhagglesucceeded
        setVar $buyhaggle 1
        return


# ----- SUB :buynohaggle
:buynohaggle
    setVar $overhagglemultiple 	147
    setVar $cyclebuffer 		1
    setVar $cyclebufferlimit 	20
   
    if ($swathdisable~swathoff = 0)

        waitfor "How many holds of"
        send "*"
        gosub :swathdisable~swathoff
        send "*"
    else
        send "**"
    end
    add $cyclebuffer 1
    if ($cyclebuffer = $cyclebufferlimit)
        setVar $cyclebuffer 1
        send "/"
        waitfor " Sect "
    end
    return

# includes:
include "C:\Documents and Settings\Owner.CRC-Software\Desktop\TWXProxy204b\scripts\MOMBot\botIncludes\swathdisable"
