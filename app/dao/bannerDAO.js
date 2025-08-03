const db = require('../config/db');

// Get all character banners
async function getCharacterBanners() {
  const [rows] = await db.execute('SELECT * FROM character_banner');
  return rows;
}

async function getSupportBanners() {
  const [rows] = await db.execute('SELECT * FROM support_banner');
  return rows;
}

module.exports = {
  getCharacterBanners,
  getSupportBanners
};
