const express = require('express');
const indexController = require('../controllers/indexController');
const router = express.Router();

router.get('/', indexController.getIndexPage);

// (AJAX POST)
router.post('/calculate', indexController.calculatePlanner);

module.exports = router;