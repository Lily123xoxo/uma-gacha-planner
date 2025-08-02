const path = require('path');
const gachaService = require('../services/gachaService');

// Render the main page
const getIndexPage = (req, res) => {
  res.render('pages/index', { timeline: timelineData}); // first load
};

// Handle calculation requests
const calculatePlanner = (req, res) => {
  const {
    carats,
    clubRank,
    champMeeting,
    monthlyPass,
    dailyLogin,
    legendRace,
    dailyMission,
    rainbowCleat,
    goldCleat,
    silverCleat
  } = req.body;

  const rollsAccumulated = gachaService.calculateRolls({
    carats: Number(carats),
    clubRank: clubRank,
    champMeeting: Number(champMeeting),
    monthlyPass,
    dailyLogin,
    legendRace,
    dailyMission,
    rainbowCleat,
    goldCleat,
    silverCleat
  });

  // Return JSON for frontend
  res.json({
    rolls: rollsAccumulated, // number of rolls
    carats: rollsAccumulated * 150 // carat value
  });

};

// use either Json or DB for timeline data, example below
const timelineData = [ 
  { name: 'Maruzensky (Summer)', start: '2025-08-01', end: '2025-08-10' },
  { name: 'Kitasan Black (SSR)', start: '2025-08-11', end: '2025-08-20' }
];

module.exports = {
  getIndexPage,
  calculatePlanner,
  timelineData
};
