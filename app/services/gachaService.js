
// map club ranks to numeric values
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

function calculateRolls(options) {
  
  const clubCarats = clubRankMap[options.clubRank] || 0; // default to 0 if not found
  const champCarats = options.champMeeting || 0;
  const currentCarats = options.carats || 0;

  let totalCarats = currentCarats + clubCarats + champCarats;

  if (options.monthlyPass) totalCarats += 2000 // per month
  if (options.dailyLogin) totalCarats += 110 // per week
  if (options.legendRace) totalCarats += 250 // per month?
  if (options.dailyMission) totalCarats += 30 // per day
  if (options.rainbowCleat) totalCarats += 600 // per month
  if (options.goldCleat) totalCarats += 600 // per month
  if (options.silverCleat) totalCarats += 600 // per month

  return Math.floor(totalCarats / 150); // assuming 150 carats per roll
}

module.exports = { calculateRolls };
