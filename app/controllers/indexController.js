// app/controllers/indexController.js
const path = require('path');
const gachaService = require('../services/gachaService');
const { body, validationResult } = require('express-validator');

// Render the main page
const getIndexPage = (req, res) => {
  res.render('pages/index'); // first load
};

// Handle calculation requests with validation
const calculatePlanner = [
  // --- Validation rules ---
  body('carats').isInt({ min: 0 }).toInt(),
  body('clubRank').isIn(['SS', 'Splus', 'S', 'Aplus', 'A', 'Bplus', 'B', 'Cplus', 'C', 'Dplus']),
  body('champMeeting').isInt({ min: 0 }).toInt(),
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
      silverCleat
    } = req.body;

    const rollsAccumulated = gachaService.calculateRolls({
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
    });

    res.json({
      rolls: rollsAccumulated,
      carats: rollsAccumulated * 150
    });
  }
];

module.exports = {
  getIndexPage,
  calculatePlanner
};
