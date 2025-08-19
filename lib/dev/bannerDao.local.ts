// lib/dev/bannerDao.local.ts
import { query } from "./db.dev";
import { safeLimit } from "../safeLimit";
import { GroupedBannerDay, GroupedBanner } from "../bannerBean";

function parseJsonArray<T = any>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v == null) return [];
  if (typeof v === "string") { try { return JSON.parse(v) as T[]; } catch {} }
  return [];
}

export async function getBannersGroupedByDate(): Promise<GroupedBannerDay[]> {
  const L = Math.max(1, Math.min(safeLimit(), 200)); // inline numeric literal

  const sql = `
WITH base AS (
  SELECT
    cb.id,
    'character' AS banner_type,
    cb.uma_name AS name,
    cb.image_path,
    COALESCE(cb.global_actual_date, cb.global_est_date) AS day,
    cb.global_actual_date AS actual_start,
    cb.global_actual_end_date AS actual_end,
    cb.global_est_date AS est_start,
    cb.global_est_end_date AS est_end,
    cb.jp_release_date,
    cb.jp_days_until_next,
    cb.global_days_until_next
  FROM character_banner cb
  UNION ALL
  SELECT
    sb.id,
    'support' AS banner_type,
    sb.support_name AS name,
    sb.image_path,
    COALESCE(sb.global_actual_date, sb.global_est_date) AS day,
    sb.global_actual_date AS actual_start,
    sb.global_actual_end_date AS actual_end,
    sb.global_est_date AS est_start,
    sb.global_est_end_date AS est_end,
    sb.jp_release_date,
    sb.jp_days_until_next,
    sb.global_days_until_next
  FROM support_banner sb
),
days AS (
  SELECT DATE(day) AS day
  FROM base
  WHERE day IS NOT NULL
  GROUP BY DATE(day)
  ORDER BY DATE(day)
  LIMIT ${L}
)
SELECT
  d.day AS date,

  COALESCE((
    SELECT JSON_ARRAYAGG(t.obj) FROM (
      SELECT JSON_OBJECT(
        'id', b1.id,
        'type', b1.banner_type,
        'name', b1.name,
        'image_path', b1.image_path,
        'start_date', DATE_FORMAT(b1.day, '%Y-%m-%d'),
        'start_kind', IF(b1.actual_start IS NOT NULL, 'actual', 'est'),
        'end_date', IFNULL(DATE_FORMAT(b1.actual_end, '%Y-%m-%d'), NULL),
        'est_end_date', IFNULL(DATE_FORMAT(b1.est_end, '%Y-%m-%d'), NULL),
        'jp_release_date', IFNULL(DATE_FORMAT(b1.jp_release_date, '%Y-%m-%d'), NULL),
        'jp_days_until_next', b1.jp_days_until_next,
        'global_days_until_next', b1.global_days_until_next
      ) AS obj
      FROM base b1
      WHERE DATE(b1.day) = d.day AND b1.banner_type = 'character'
      ORDER BY b1.id
    ) AS t
  ), JSON_ARRAY()) AS characters,

  COALESCE((
    SELECT JSON_ARRAYAGG(t.obj) FROM (
      SELECT JSON_OBJECT(
        'id', b2.id,
        'type', b2.banner_type,
        'name', b2.name,
        'image_path', b2.image_path,
        'start_date', DATE_FORMAT(b2.day, '%Y-%m-%d'),
        'start_kind', IF(b2.actual_start IS NOT NULL, 'actual', 'est'),
        'end_date', IFNULL(DATE_FORMAT(b2.actual_end, '%Y-%m-%d'), NULL),
        'est_end_date', IFNULL(DATE_FORMAT(b2.est_end, '%Y-%m-%d'), NULL),
        'jp_release_date', IFNULL(DATE_FORMAT(b2.jp_release_date, '%Y-%m-%d'), NULL),
        'jp_days_until_next', b2.jp_days_until_next,
        'global_days_until_next', b2.global_days_until_next
      ) AS obj
      FROM base b2
      WHERE DATE(b2.day) = d.day AND b2.banner_type = 'support'
      ORDER BY b2.id
    ) AS t
  ), JSON_ARRAY()) AS supports

FROM days d
ORDER BY d.day
`;

  // IMPORTANT: no params -> uses pool.query(), not prepared execute()
  const rows = await query<any>(sql);

  return rows.map((r) => ({
    date: String(r.date),
    characters: parseJsonArray<GroupedBanner>(r.characters),
    supports: parseJsonArray<GroupedBanner>(r.supports),
  }));
}
