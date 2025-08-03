const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');

// Routes just point to controller functions
router.get('/api/character-banners', bannerController.getCharacterBanners);
router.get('/api/support-banners', bannerController.getSupportBanners);

module.exports = router;
