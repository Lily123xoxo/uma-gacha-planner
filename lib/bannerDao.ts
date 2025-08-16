// /lib/bannerDao.ts
import { sql } from "./db";
import { Redis } from "@upstash/redis";

// ---- Redis client (server-only) ----
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ---- Types (unchanged) ----
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

// ---- Utils ----
function safeLimit(n: unknown, fallback = 90, max = 200) {
  const parsed = Number.parseInt(String(n ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

// Generic cache helper (cache-aside)
async function cacheJSON<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached !== null) return cached;
  const data = await loader();
  await redis.set(key, data, { ex: ttlSeconds });
  return data;
}

// ---- DAO with monthly TTL ----
const MONTH_TTL = 60 * 60 * 24 * 30; // ~30 days
const VERSION = "v1"; // bump to invalidate all keys immediately

export async function getCharacterBanners(limit: unknown = 90): Promise<CharacterRow[]> {
  const lim = safeLimit(limit);
  const key = `dao:${VERSION}:character_banners:lim=${lim}`;

  return cacheJSON(key, MONTH_TTL, async () => {
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
  });
}

export async function getSupportBanners(limit: unknown = 90): Promise<SupportRow[]> {
  const lim = safeLimit(limit);
  const key = `dao:${VERSION}:support_banners:lim=${lim}`;

  return cacheJSON(key, MONTH_TTL, async () => {
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
  });
}

// ---- Optional: simple invalidation helpers ----
// Call after writing to Postgres if you want a fresh read before TTL expiry.
export async function invalidateCharacterBannerCache(limits: number[] = [30, 60, 90, 120, 200]) {
  const keys = limits.map((l) => `dao:${VERSION}:character_banners:lim=${l}`);
  if (keys.length) await redis.del(...keys);
}

export async function invalidateSupportBannerCache(limits: number[] = [30, 60, 90, 120, 200]) {
  const keys = limits.map((l) => `dao:${VERSION}:support_banners:lim=${l}`);
  if (keys.length) await redis.del(...keys);
}
