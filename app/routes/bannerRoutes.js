// app/routes/bannerRoutes.js
const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');

router.get('/characters', bannerController.getCharacterBanners);
router.get('/supports', bannerController.getSupportBanners);

module.exports = router;