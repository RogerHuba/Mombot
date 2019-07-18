#Author: Mind Dagger
#Gets player stats from the hitting the / key.  Also grabs the current prompt that you are at.
#The only prompt this will stall on is in the middle of chatting
#gotStats routine by Dynarri/Singularity
#added getinfo and current_prompt subs as well since they share the same variables they are updating

:init
# ============================ START SECTOR DATA VARIABLES ==========================
	setArray $TRADERS   50
	setArray $FAKETRADERS   50
	setArray $EMPTYSHIPS   100
	setVar $ranksLength     46
	setArray $ranks     $ranksLength
	setVar $ranks[1]    "36mCivilian"
	setVar $ranks[2]    "36mPrivate 1st Class"
	setVar $ranks[3]    "36mPrivate"
	setVar $ranks[4]    "36mLance Corporal"
	setVar $ranks[5]    "36mCorporal"
	setVar $ranks[6]    "36mStaff Sergeant"
	setVar $ranks[7]    "36mGunnery Sergeant"
	setVar $ranks[8]    "36m1st Sergeant"
	setVar $ranks[9]    "36mSergeant Major"
	setVar $ranks[10]   "36mSergeant"
	setVar $ranks[11]   "31mAnnoyance"
	setVar $ranks[12]   "31mNuisance 3rd Class"
	setVar $ranks[13]   "31mNuisance 2nd Class"
	setVar $ranks[14]   "31mNuisance 1st Class"
	setVar $ranks[15]   "31mMenace 3rd Class"
	setVar $ranks[16]   "31mMenace 2nd Class"
	setVar $ranks[17]   "31mMenace 1st Class"
	setVar $ranks[18]   "31mSmuggler 3rd Class"
	setVar $ranks[19]   "31mSmuggler 2nd Class"
	setVar $ranks[20]   "31mSmuggler 1st Class"
	setVar $ranks[21]   "31mSmuggler Savant"
	setVar $ranks[22]   "31mRobber"
	setVar $ranks[23]   "31mTerrorist"
	setVar $ranks[24]   "31mInfamous Pirate"
	setVar $ranks[25]   "31mNotorious Pirate"
	setVar $ranks[26]   "31mDread Pirate"
	setVar $ranks[27]   "31mPirate"
	setVar $ranks[28]   "31mGalactic Scourge"
	setVar $ranks[29]   "31mEnemy of the State"
	setVar $ranks[30]   "31mEnemy of the People"
	setVar $ranks[31]   "31mEnemy of Humankind"
	setVar $ranks[32]   "31mHeinous Overlord"
	setVar $ranks[33]   "31mPrime Evil"
	setVar $ranks[34]   "36mChief Warrant Officer"
	setVar $ranks[35]   "36mWarrant Officer"
	setVar $ranks[36]   "36mEnsign"
	setVar $ranks[37]   "36mLieutenant J.G."
	setVar $ranks[38]   "36mLieutenant Commander"
	setVar $ranks[39]   "36mLieutenant"
	setVar $ranks[40]   "36mCommander"
	setVar $ranks[41]   "36mCaptain"
	setVar $ranks[42]   "36mCommodore"
	setVar $ranks[43]   "36mRear Admiral"
	setVar $ranks[44]   "36mVice Admiral"
	setVar $ranks[45]   "36mFleet Admiral"
	setVar $ranks[46]   "36mAdmiral"
	setVar $lastTarget  ""

return

