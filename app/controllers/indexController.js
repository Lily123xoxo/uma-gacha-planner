const path = require('path');
const gachaService = require('../services/gachaService');
const { body, validationResult } = require('express-validator');

// Render the main page
const getIndexPage = (req, res) => {
  res.render('pages/index');
};

// Handle calculation requests with validation
const calculatePlanner = [
  // --- Validation rules ---
  body('carats').isInt({ min: 0, max: 9999999999999 }),
  body('clubRank').isIn(['SS', 'Splus', 'S', 'Aplus', 'A', 'Bplus', 'B', 'Cplus', 'C', 'Dplus']),
  body('champMeeting').isIn([1000, 1200, 1800, 2500]), // allow only these four values
  body('monthlyPass').toBoolean(),
  body('dailyLogin').toBoolean(),
  body('legendRace').toBoolean(),
  body('dailyMission').toBoolean(),
  body('rainbowCleat').toBoolean(),
  body('goldCleat').toBoolean(),
  body('silverCleat').toBoolean(),

  // --- Controller logic ---
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
      silverCleat,
      characterBanner,
      supportBanner
    } = req.body;

    // Existing calculation logic
    const result = gachaService.calculateRolls({
      carats,
      clubRank,
      champMeeting,
      monthlyPass,
      dailyLogin,
      legendRace,
      dailyMission,
      rainbowCleat,
      goldCleat,
      silverCleat,
      bannerStartDate: characterBanner?.global_actual_date || characterBanner?.global_est_date
    });

    res.json({
      rolls: result.rolls,
      carats: result.carats,
      supportTickets: result.supportTickets,
      characterTickets: result.characterTickets,
    });
  }
];

module.exports = {
  getIndexPage,
  calculatePlanner
};
