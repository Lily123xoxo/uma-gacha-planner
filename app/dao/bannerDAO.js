const db = require('../config/db');

async function getCharacterBanners() {
  const [rows] = await db.execute(`
    SELECT * FROM character_banner
    WHERE global_actual_date >= CURDATE() OR global_est_date >= CURDATE()
    ORDER BY COALESCE(global_actual_date, global_est_date)
    LIMIT 50
  `);
  return rows;
}

async function getSupportBanners() {
  const [rows] = await db.execute(`
    SELECT * FROM support_banner
    WHERE global_actual_date >= CURDATE() OR global_est_date >= CURDATE()
    ORDER BY COALESCE(global_actual_date, global_est_date)
    LIMIT 50
  `);
  return rows;
}

module.exports = {
  getCharacterBanners,
  getSupportBanners
};
