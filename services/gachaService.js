/**
 * Maps club ranks to their respective carat values.
 * Used to calculate carats earned based on the player's club rank.
**/
const clubRankMap = {
  SS: 3000,
  Splus: 2400,
  S: 2100,
  Aplus: 1800,
  A: 1500,
  Bplus: 1200,
  B: 900,
  Cplus: 600,
  C: 300,
  Dplus: 150
};

/**
 * Maps team trials ranks to their respective carat values.
 * Used to calculate carats earned based on the player's team trials class.
**/
const teamTrialsRankMap = {
  Class6: 250,
  Class5: 150,
  Class4: 100,
  Class3: 50,
  Class2: 25,
  Class1: 0
};

const CARATS_PER_ROLL = 150;
const WEEKLY_LOGIN_CARATS = 110; // 110 carats a week for logging in every day
const MONTHLY_PASS_DAILY_CARATS = 50;
const MONTHLY_PASS_IMMEDIATE_CARATS = 500;
const DAILY_MISSION_CARATS = 30;
const LEGEND_RACE_MONTHLY_CARATS = 1000;

/**
 * Calculates additional carats from monthly rewards.
 */
function calculateMonthlyCarats(options, months) {
  let carats = 0;
  let supportTicketsGain = 0;
  let characterTicketsGain = 0;

  for (let i = 0; i < months; i++) {
    carats += clubRankMap[options.clubRank] || 0;
    carats += options.champMeeting || 0;         
    if (options.monthlyPass) carats += MONTHLY_PASS_IMMEDIATE_CARATS;
    if (options.legendRace) carats += LEGEND_RACE_MONTHLY_CARATS;

    if (options.rainbowCleat) {
      supportTicketsGain += 2;
      characterTicketsGain += 2;
    }
    if (options.goldCleat) {
      supportTicketsGain += 2;
      characterTicketsGain += 2;
    }
    if (options.silverCleat) {
      supportTicketsGain += 2;
      characterTicketsGain += 2;
    }
  }

  return { carats, supportTickets: supportTicketsGain, characterTickets: characterTicketsGain };
}

/**
 * Calculates additional carats from weekly rewards.
 */
function calculateWeeklyCarats(options, weeks) {
  let carats = 0;

  if (options.dailyLogin){
    carats += (WEEKLY_LOGIN_CARATS * weeks)
  }
  
  carats += (teamTrialsRankMap[options.teamTrialsRank] || 0) * weeks;

  return carats;
}

/**
 * Calculates additional carats from daily rewards.
 */
function calculateDailyCarats(options, days) {
  let carats = 0;
  for (let i = 0; i < days; i++) {
    if (options.monthlyPass) carats += MONTHLY_PASS_DAILY_CARATS;
    if (options.dailyMission) carats += DAILY_MISSION_CARATS;
  }
  return carats;
}

/**
 * Main function to calculate rolls and carats available.
 */
function calculateRolls(options) {
  const bannerStartDate = options.bannerStartDate;
  let totalCarats = options.carats || 0;
  let supportTickets = options.supportTickets || 0;
  let characterTickets = options.characterTickets || 0;

  if (!bannerStartDate) {
    return { rolls: 0, carats: totalCarats, supportTickets, characterTickets };
  }

  const now = new Date();
  const start = new Date(bannerStartDate);

  // Difference in days
  const diffTime = start - now; // milliseconds
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  const weeks = Math.floor(diffDays / 7);

  // If banner already started
  if (diffDays <= 0) {
    return {
      rolls: Math.floor(totalCarats / CARATS_PER_ROLL),
      carats: totalCarats,
      supportTickets,
      characterTickets
    };
  }

  // Monthly accumulation
  const monthly = calculateMonthlyCarats(options, months);
  totalCarats += monthly.carats;
  supportTickets += monthly.supportTickets;
  characterTickets += monthly.characterTickets;

  // Weekly accumulation
  totalCarats += calculateWeeklyCarats(options, weeks);

  // Daily accumulation
  totalCarats += calculateDailyCarats(options, diffDays);

  return {
    rolls: Math.floor(totalCarats / CARATS_PER_ROLL),
    carats: totalCarats,
    supportTickets,
    characterTickets
  };
}

module.exports = { calculateRolls };
