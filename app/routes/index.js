const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

// Main page
router.get('/', indexController.getIndexPage);

// Handle planner calculation POST
router.post('/calculate', indexController.calculatePlanner);

module.exports = router;
