// app/cache/bannerCache.js
const bannerDAO = require('../dao/bannerDao');

let characterBanners = [];
let supportBanners = [];

async function loadCache() {
  // Pull data from DB
  characterBanners = await bannerDAO.getCharacterBanners();
  supportBanners = await bannerDAO.getSupportBanners();
  console.log('Banner cache loaded:', characterBanners.length, 'character banners');
  console.log('Banner cache loaded:', supportBanners.length, 'support banners');
}

// Provide functions to access cached data
function getCharacterBanners() {
  return characterBanners;
}

function getSupportBanners() {
  return supportBanners;
}

module.exports = {
  loadCache,
  getCharacterBanners,
  getSupportBanners
};
