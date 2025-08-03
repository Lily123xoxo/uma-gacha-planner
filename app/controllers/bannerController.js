const bannerDAO = require('../dao/bannerDAO');

async function getCharacterBanners(req, res) {
  try {
    const characters = await bannerDAO.getCharacterBanners();
    res.json(characters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch character banners' });
  }
}

async function getSupportBanners(req, res) {
  try {
    const supports = await bannerDAO.getSupportBanners();
    res.json(supports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch support banners' });
  }
}

module.exports = {
  getCharacterBanners,
  getSupportBanners
};
