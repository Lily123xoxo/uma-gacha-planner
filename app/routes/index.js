const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

// Main page
router.get('/', indexController.getIndexPage);

module.exports = router;
