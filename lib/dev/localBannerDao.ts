// lib/localBannerDao.ts
import mysql from "mysql2";
import { query } from "./db.dev";
import { safeLimit } from "../bannerDao";

export type LocalRow = {
  id: number;
  name: string;
  jp_release_date: string | null;
  global_actual_date: string | null;
  global_actual_end_date: string | null;
  global_est_date: string | null;
  global_est_end_date: string | null;
  jp_days_until_next: number | null;
  global_days_until_next: number | null;
  image_path: string | null;
  banner_type: "character" | "support";
};

export type BannersPayload = {
  characters: LocalRow[];
  supports: LocalRow[];
};

export async function getBannersCombinedLocal(): Promise<BannersPayload> {
  const lim = safeLimit();

  // Ensure session is UTC (optional, but nice to keep consistent)
  await query("SET time_zone = '+00:00'");

  const charSQL = mysql.format(
    `
    SELECT
      id,
      uma_name AS name,
      DATE_FORMAT(jp_release_date, '%Y-%m-%d')          AS jp_release_date,
      DATE_FORMAT(global_actual_date, '%Y-%m-%d')       AS global_actual_date,
      DATE_FORMAT(global_actual_end_date, '%Y-%m-%d')   AS global_actual_end_date,
      DATE_FORMAT(global_est_date, '%Y-%m-%d')          AS global_est_date,
      DATE_FORMAT(global_est_end_date, '%Y-%m-%d')      AS global_est_end_date,
      jp_days_until_next,
      global_days_until_next,
      image_path,
      'character' AS banner_type
    FROM character_banner
    WHERE global_actual_end_date >= CURDATE() OR global_est_end_date >= CURDATE()
    ORDER BY COALESCE(global_actual_date, global_est_date)
    LIMIT ?
    `,
    [lim]
  );

  const supSQL = mysql.format(
    `
    SELECT
      id,
      support_name AS name,
      DATE_FORMAT(jp_release_date, '%Y-%m-%d')          AS jp_release_date,
      DATE_FORMAT(global_actual_date, '%Y-%m-%d')       AS global_actual_date,
      DATE_FORMAT(global_actual_end_date, '%Y-%m-%d')   AS global_actual_end_date,
      DATE_FORMAT(global_est_date, '%Y-%m-%d')          AS global_est_date,
      DATE_FORMAT(global_est_end_date, '%Y-%m-%d')      AS global_est_end_date,
      jp_days_until_next,
      global_days_until_next,
      image_path,
      'support' AS banner_type
    FROM support_banner
    WHERE global_actual_end_date >= CURDATE() OR global_est_end_date >= CURDATE()
    ORDER BY COALESCE(global_actual_date, global_est_date)
    LIMIT ?
    `,
    [lim]
  );

  const [characters, supports] = await Promise.all([
    query<LocalRow>(charSQL),
    query<LocalRow>(supSQL),
  ]);

  return { characters, supports };
}
