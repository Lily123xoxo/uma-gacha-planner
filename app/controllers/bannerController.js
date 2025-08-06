const bannerDAO = require('../dao/bannerDao');
const path = require('path');
const fs = require('fs/promises');

async function resolveImagePath(relativePath) {
  if (!relativePath) return '/images/default.png';

  const fullPath = path.join(__dirname, '../../public/images', relativePath);

  try {
    await fs.access(fullPath);
    return `/images/${relativePath}`;
  } catch {

    return '/images/default.png';
  }
}

async function getCharacterBanners(req, res) {
  try {
    let characters = await bannerDAO.getCharacterBanners();

    characters = await Promise.all(
      characters.map(async (char) => {
        const resolvedPath = await resolveImagePath(char.image_path);

        return { ...char, image_path: resolvedPath };
      })
    );

    res.json(characters);
  } catch (err) {
    console.error('Error fetching character banners:', err);
    res.status(500).json({ error: 'Failed to fetch character banners' });
  }
}

async function getSupportBanners(req, res) {
  try {
    let supports = await bannerDAO.getSupportBanners();

    supports = await Promise.all(
      supports.map(async (support) => {
        const resolvedPath = await resolveImagePath(support.image_path);
        
        return { ...support, image_path: resolvedPath };
      })
    );

    res.json(supports);
  } catch (err) {
    console.error('Error fetching support banners:', err);
    res.status(500).json({ error: 'Failed to fetch support banners' });
  }
}

module.exports = {
  getCharacterBanners,
  getSupportBanners,
};
