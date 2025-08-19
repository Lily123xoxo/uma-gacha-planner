import { sql } from "./db";
import { safeLimit } from "./safeLimit";
import { GroupedBannerDay, GroupedBanner } from "./bannerBean";

function normalizeRows<T = any>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object" && "rows" in (res as any)) {
    return (res as any).rows as T[];
  }
  return [];
}

function asJsonArray<T = any>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val == null) return [];
  if (typeof val === "string") { try { return JSON.parse(val) as T[]; } catch {} }
  if (typeof val === "object") return (val as any) ?? [];
  return [];
}

export async function getBannersGroupedByDate(): Promise<GroupedBannerDay[]> {
  const lim = safeLimit();

  const res = await sql/* sql */`
WITH all_banners AS (
  SELECT
    c.id,
    'character'::text AS banner_type,
    c.uma_name AS name,
    c.image_path,
    COALESCE(c.global_actual_date, c.global_est_date)::date AS day,
    c.global_actual_date AS actual_start,
    c.global_actual_end_date AS actual_end,
    c.global_est_date AS est_start,
    c.global_est_end_date AS est_end,
    c.jp_release_date,
    c.jp_days_until_next,
    c.global_days_until_next
  FROM public.character_banner c
  UNION ALL
  SELECT
    s.id,
    'support'::text AS banner_type,
    s.support_name AS name,
    s.image_path,
    COALESCE(s.global_actual_date, s.global_est_date)::date AS day,
    s.global_actual_date AS actual_start,
    s.global_actual_end_date AS actual_end,
    s.global_est_date AS est_start,
    s.global_est_end_date AS est_end,
    s.jp_release_date,
    s.jp_days_until_next,
    s.global_days_until_next
  FROM public.support_banner s
),
dedup AS (
  SELECT DISTINCT ON (banner_type, id, day)
    id, banner_type, name, image_path, day,
    actual_start, actual_end, est_start, est_end,
    jp_release_date, jp_days_until_next, global_days_until_next
  FROM all_banners
  WHERE day IS NOT NULL
  ORDER BY banner_type, id, day, (actual_start IS NULL), (actual_end IS NULL)
),
days AS (
  SELECT day
  FROM dedup
  GROUP BY day
  ORDER BY day
  LIMIT ${lim}
)
SELECT
  d.day AS date,
  COALESCE(
    json_agg(DISTINCT jsonb_build_object(
      'id', b.id,
      'type', b.banner_type,
      'name', b.name,
      'image_path', b.image_path,
      'start_date', b.day,
      'start_kind', CASE WHEN b.actual_start IS NOT NULL THEN 'actual' ELSE 'est' END,
      'end_date', b.actual_end,
      'est_end_date', b.est_end,
      'jp_release_date', b.jp_release_date,
      'jp_days_until_next', b.jp_days_until_next,
      'global_days_until_next', b.global_days_until_next
    ) ORDER BY b.id)::json,
    '[]'::json
  ) FILTER (WHERE b.banner_type = 'character') AS characters,
  COALESCE(
    json_agg(DISTINCT jsonb_build_object(
      'id', b.id,
      'type', b.banner_type,
      'name', b.name,
      'image_path', b.image_path,
      'start_date', b.day,
      'start_kind', CASE WHEN b.actual_start IS NOT NULL THEN 'actual' ELSE 'est' END,
      'end_date', b.actual_end,
      'est_end_date', b.est_end,
      'jp_release_date', b.jp_release_date,
      'jp_days_until_next', b.jp_days_until_next,
      'global_days_until_next', b.global_days_until_next
    ) ORDER BY b.id)::json,
    '[]'::json
  ) FILTER (WHERE b.banner_type = 'support') AS supports
FROM days d
LEFT JOIN dedup b ON b.day = d.day
GROUP BY d.day
ORDER BY d.day;
`;

  const rows = normalizeRows<any>(res);
  return rows.map((r) => ({
    date: String(r.date),
    characters: asJsonArray<GroupedBanner>(r.characters),
    supports: asJsonArray<GroupedBanner>(r.supports),
  }));
}