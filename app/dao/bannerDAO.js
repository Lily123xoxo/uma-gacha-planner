const db = require('../config/db');
const mysql = require('mysql2');

async function getCharacterBanners(limit = 90) {
  const safeLimit = parseInt(limit, 10) || 100;
  const query = mysql.format(
    `
    SELECT id, uma_name, jp_release_date, global_actual_date, global_est_date,
           jp_days_until_next, global_days_until_next, image_path
    FROM character_banner
    WHERE global_actual_date >= CURDATE() OR global_est_date >= CURDATE()
    ORDER BY COALESCE(global_actual_date, global_est_date)
    LIMIT ?
    `,
    [safeLimit]
  );

  const [rows] = await db.query(query);
  return rows;
}


async function getSupportBanners(limit = 90) {
  const safeLimit = parseInt(limit, 10) || 100;
  const query = mysql.format(
    `
    SELECT id, support_name, jp_release_date, global_actual_date, global_est_date,
           jp_days_until_next, global_days_until_next, image_path
    FROM support_banner
    WHERE global_actual_date >= CURDATE() OR global_est_date >= CURDATE()
    ORDER BY COALESCE(global_actual_date, global_est_date)
    LIMIT ?
    `,
    [safeLimit]
  );
  const [rows] = await db.query(query);
  return rows;
}

module.exports = {
  getCharacterBanners,
  getSupportBanners
};
