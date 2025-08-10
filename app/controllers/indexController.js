const path = require('path');
const gachaService = require('../services/gachaService');
const { body, validationResult } = require('express-validator');

const getIndexPage = (req, res) => {
  res.render('pages/index');
};

const validationRules = [
  body('carats').toInt().isInt({ min: 0, max: 9999999999999 }),
  body('clubRank').isIn(['SS', 'Splus', 'S', 'Aplus', 'A', 'Bplus', 'B', 'Cplus', 'C', 'Dplus']),
  body('teamTrialsRank').isIn(['Class6', 'Class5', 'Class4', 'Class3', 'Class2', 'Class1']),
  body('champMeeting').isIn([1000, 1200, 1800, 2500]),
  body('characterTickets').toInt().isInt({ min: 0, max: 9999}),
  body('supportTickets').toInt().isInt({ min: 0, max: 9999}),
  body('monthlyPass').toBoolean(),
  body('dailyLogin').toBoolean(),
  body('legendRace').toBoolean(),
  body('dailyMission').toBoolean(),
  body('rainbowCleat').toBoolean(),
  body('goldCleat').toBoolean(),
  body('silverCleat').toBoolean(),
];

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

const extractRequestData = (req) => {
  const {
    carats, clubRank, teamTrialsRank, champMeeting, characterTickets,
    supportTickets, monthlyPass, dailyLogin, legendRace, dailyMission,
    rainbowCleat, goldCleat, silverCleat, characterBanner, supportBanner
  } = req.body;

  return {
    carats, clubRank, teamTrialsRank, champMeeting, characterTickets,
    supportTickets, monthlyPass, dailyLogin, legendRace, dailyMission,
    rainbowCleat, goldCleat, silverCleat,
    bannerStartDate: characterBanner?.global_actual_date || characterBanner?.global_est_date
  };
};

const formatResponse = (result) => ({
  rolls: result.rolls,
  carats: result.carats,
  supportTickets: result.supportTickets,
  characterTickets: result.characterTickets,
});


const calculatePlanner = [
  ...validationRules,
  (req, res) => {
    if (handleValidationErrors(req, res)) return;

    const requestData = extractRequestData(req);
    const result = gachaService.calculateRolls(requestData);
    
    res.json(formatResponse(result));
  }
];

module.exports = {
  getIndexPage,
  calculatePlanner
};
