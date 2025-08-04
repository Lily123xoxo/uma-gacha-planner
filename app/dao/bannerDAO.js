const db = require('../config/db');
const mysql = require('mysql2');

async function getCharacterBanners(limit = 90) {
  const safeLimit = parseInt(limit, 10) || 90;
  const query = mysql.format(
    `
    SELECT *
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
  const safeLimit = parseInt(limit, 10) || 90;
  const query = mysql.format(
    `
    SELECT *
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
