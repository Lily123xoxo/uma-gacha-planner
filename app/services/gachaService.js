
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
  
  const bannerStartDate = options.bannerStartDate;
  const clubCarats = clubRankMap[options.clubRank] || 0; // default to 0 if not found
  const champCarats = options.champMeeting || 0;
  const currentCarats = options.carats || 0;
  let  supportTickets = 0;
  let characterTickets = 0;

  let totalCarats = currentCarats;

  if (bannerStartDate) {
      const now = new Date();
      const start = new Date(bannerStartDate);

      // Difference in days
      const diffTime = start - now; // milliseconds
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.floor(diffDays / 30);
      const weeks = Math.floor(diffDays / 7);

      // If the banner has already started, calculate from today
      if (diffDays <= 0) {
        return {
          rolls: Math.floor(totalCarats / 150),
          carats: totalCarats,
          supportTickets,
          characterTickets
        };
      }

      // Monthly accumulation
      for (let i = 0; i < months; i++) {
        totalCarats += clubCarats; // add club rank carats
        totalCarats += champCarats; // add champion meeting carats
        if (options.monthlyPass) totalCarats += 500; // 500 carats per month when pass is purchased
        if (options.legendRace) totalCarats += 1000 // 250 per race, assumes 4 new races per month
        if (options.rainbowCleat) {supportTickets +=2; characterTickets +=2;} // 2 tickets per month
        if (options.goldCleat) {supportTickets +=2; characterTickets +=2;} // 2 tickets per month
        if (options.silverCleat) {supportTickets +=2; characterTickets +=2;} // 2 tickets per month
      }

      // Weekly accumulation
      for (let i = 0; i < weeks; i++) {
        totalCarats += 110; // 110 carats per week from login bonuses
      }

      // Daily accumulation
      for (let i = 0; i < diffDays; i++) {
          if (options.monthlyPass) totalCarats += 50 // per day
          if (options.dailyMission) totalCarats += 30 // per day
      }

    return {
        rolls: Math.floor(totalCarats / 150),
        carats: totalCarats,
        supportTickets,
        characterTickets
    };
  }
}

module.exports = { calculateRolls };
