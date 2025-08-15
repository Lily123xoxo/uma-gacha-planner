// /lib/bannerDao.ts
import { sql } from './db';

export type CharacterRow = {
  id: number;
  uma_name: string;
  jp_release_date: string | null;
  global_actual_date: string | null;
  global_actual_end_date: string | null;
  global_est_date: string | null;
  global_est_end_date: string | null;
  jp_days_until_next: number | null;
  global_days_until_next: number | null;
  image_path: string | null;
};

export type SupportRow = {
  id: number;
  support_name: string;
  jp_release_date: string | null;
  global_actual_date: string | null;
  global_actual_end_date: string | null;
  global_est_date: string | null;
  global_est_end_date: string | null;
  jp_days_until_next: number | null;
  global_days_until_next: number | null;
  image_path: string | null;
};

function safeLimit(n: unknown, fallback = 90, max = 200) {
  const parsed = Number.parseInt(String(n ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

export async function getCharacterBanners(limit: unknown = 90): Promise<CharacterRow[]> {
  const lim = safeLimit(limit);

  const rows = await sql/* sql */`
    SELECT
      id,
      uma_name,
      jp_release_date,
      global_actual_date,
      global_actual_end_date,
      global_est_date,
      global_est_end_date,
      jp_days_until_next,
      global_days_until_next,
      image_path
    FROM character_banner
    WHERE
      (global_actual_end_date IS NOT NULL AND global_actual_end_date >= CURRENT_DATE)
      OR
      (global_est_end_date IS NOT NULL AND global_est_end_date >= CURRENT_DATE)
    ORDER BY COALESCE(global_actual_date, global_est_date)
    LIMIT ${lim}
  `;

  return rows as CharacterRow[];
}

export async function getSupportBanners(limit: unknown = 90): Promise<SupportRow[]> {
  const lim = safeLimit(limit);

  const rows = await sql/* sql */`
    SELECT
      id,
      support_name,
      jp_release_date,
      global_actual_date,
      global_actual_end_date,
      global_est_date,
      global_est_end_date,
      jp_days_until_next,
      global_days_until_next,
      image_path
    FROM support_banner
    WHERE
      (global_actual_end_date IS NOT NULL AND global_actual_end_date >= CURRENT_DATE)
      OR
      (global_est_end_date IS NOT NULL AND global_est_end_date >= CURRENT_DATE)
    ORDER BY COALESCE(global_actual_date, global_est_date)
    LIMIT ${lim}
  `;

  return rows as SupportRow[];
}
