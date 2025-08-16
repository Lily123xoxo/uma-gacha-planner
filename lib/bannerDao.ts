// /lib/bannerDao.ts
import { sql } from "./db";
import { Redis } from "@upstash/redis";

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

export function safeLimit(n: unknown, fallback = 90, max = 200): number {
  const parsed = Number.parseInt(String(n ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

/** Normalize sql() results: supports Neon (array) and pg Pool ({ rows }) */
function normalizeRows<T = any>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object" && "rows" in (res as any)) {
    return (res as any).rows as T[];
  }
  return [];
}

// --- coercion helpers ---
function toNullableString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v);
  return s.trim() === "" ? null : s;
}
function toNullableNumber(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function toRequiredNumber(v: unknown, field: string): number {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`[bannerDao] Expected number for ${field}, got ${v}`);
  return n;
}

// --- validators / normalizers ---
function ensureCharacterRows(rows: any[]): CharacterRow[] {
  return rows.map((r, i) => {
    try {
      return {
        id: toRequiredNumber(r.id, "character_banner.id"),
        uma_name: String(r.uma_name ?? ""),
        jp_release_date: toNullableString(r.jp_release_date),
        global_actual_date: toNullableString(r.global_actual_date),
        global_actual_end_date: toNullableString(r.global_actual_end_date),
        global_est_date: toNullableString(r.global_est_date),
        global_est_end_date: toNullableString(r.global_est_end_date),
        jp_days_until_next: toNullableNumber(r.jp_days_until_next),
        global_days_until_next: toNullableNumber(r.global_days_until_next),
        image_path: toNullableString(r.image_path),
      };
    } catch (e) {
      throw new Error(`[bannerDao] Row ${i} invalid (character): ${(e as Error).message}`);
    }
  });
}
function ensureSupportRows(rows: any[]): SupportRow[] {
  return rows.map((r, i) => {
    try {
      return {
        id: toRequiredNumber(r.id, "support_banner.id"),
        support_name: String(r.support_name ?? ""),
        jp_release_date: toNullableString(r.jp_release_date),
        global_actual_date: toNullableString(r.global_actual_date),
        global_actual_end_date: toNullableString(r.global_actual_end_date),
        global_est_date: toNullableString(r.global_est_date),
        global_est_end_date: toNullableString(r.global_est_end_date),
        jp_days_until_next: toNullableNumber(r.jp_days_until_next),
        global_days_until_next: toNullableNumber(r.global_days_until_next),
        image_path: toNullableString(r.image_path),
      };
    } catch (e) {
      throw new Error(`[bannerDao] Row ${i} invalid (support): ${(e as Error).message}`);
    }
  });
}

// Redis first, Neon fallback
const hasRedis =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

async function cacheJSON<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  if (!redis) {
    console.log(`[bannerDao] cache disabled → DB for ${key}`);
    return loader();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached) return cached;
  } catch {
    // ignore and fall through
  }

  console.log(`[bannerDao] cache MISS → DB for ${key}`);
  const fresh = await loader();

  try {
    // never overwrite an existing key
    await redis.set(key, fresh as any, { ex: ttlSeconds, nx: true });
  } catch {
    // ignore set failures
  }

  return fresh;
}

const MONTH_TTL_SECONDS = 30 * 24 * 60 * 60;
const CACHE_PREFIX = process.env.CACHE_PREFIX ?? "dev";
const CACHE_VERSION = process.env.CACHE_VERSION ?? "v1";

export async function getCharacterBanners(
  limit: number = 90
): Promise<CharacterRow[]> {
  const lim = safeLimit(limit);
  const key = `${CACHE_PREFIX}:dao:${CACHE_VERSION}:character_banners:lim=${lim}`;

  return cacheJSON(key, MONTH_TTL_SECONDS, async () => {
    const res = await sql/* sql */`
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
        (
          COALESCE(global_actual_end_date, global_est_end_date) IS NOT NULL
          AND COALESCE(global_actual_end_date, global_est_end_date) >= CURRENT_DATE
        )
        OR (
          COALESCE(global_actual_end_date, global_est_end_date) IS NULL
          AND COALESCE(global_actual_date, global_est_date) >= CURRENT_DATE
        )
      ORDER BY
        COALESCE(global_actual_date, global_est_date),
        id
      LIMIT ${lim} OFFSET 0
    `;
    return ensureCharacterRows(normalizeRows(res));
  });
}

export async function getSupportBanners(
  limit: number = 90
): Promise<SupportRow[]> {
  const lim = safeLimit(limit);
  const key = `${CACHE_PREFIX}:dao:${CACHE_VERSION}:support_banners:lim=${lim}`;

  return cacheJSON(key, MONTH_TTL_SECONDS, async () => {
    const res = await sql/* sql */`
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
        (
          COALESCE(global_actual_end_date, global_est_end_date) IS NOT NULL
          AND COALESCE(global_actual_end_date, global_est_end_date) >= CURRENT_DATE
        )
        OR (
          COALESCE(global_actual_end_date, global_est_end_date) IS NULL
          AND COALESCE(global_actual_date, global_est_date) >= CURRENT_DATE
        )
      ORDER BY
        COALESCE(global_actual_date, global_est_date),
        id
      LIMIT ${lim} OFFSET 0
    `;
    return ensureSupportRows(normalizeRows(res));
  });
}

/* -----------------------------
   Combined banners (one key)
------------------------------*/

export type BannersPayload = {
  characters: CharacterRow[];
  supports: SupportRow[];
};

export async function getBannersCombined(
  limit: number = 90
): Promise<BannersPayload> {
  const lim = safeLimit(limit);
  const key = `${CACHE_PREFIX}:dao:${CACHE_VERSION}:banners_combined:lim=${lim}`;

  return cacheJSON(key, MONTH_TTL_SECONDS, async () => {
    const [charRes, supRes] = await Promise.all([
      sql/* sql */`
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
          (
            COALESCE(global_actual_end_date, global_est_end_date) IS NOT NULL
            AND COALESCE(global_actual_end_date, global_est_end_date) >= CURRENT_DATE
          )
          OR (
            COALESCE(global_actual_end_date, global_est_end_date) IS NULL
            AND COALESCE(global_actual_date, global_est_date) >= CURRENT_DATE
          )
        ORDER BY COALESCE(global_actual_date, global_est_date), id
        LIMIT ${lim} OFFSET 0
      `,
      sql/* sql */`
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
          (
            COALESCE(global_actual_end_date, global_est_end_date) IS NOT NULL
            AND COALESCE(global_actual_end_date, global_est_end_date) >= CURRENT_DATE
          )
          OR (
            COALESCE(global_actual_end_date, global_est_end_date) IS NULL
            AND COALESCE(global_actual_date, global_est_date) >= CURRENT_DATE
          )
        ORDER BY COALESCE(global_actual_date, global_est_date), id
        LIMIT ${lim} OFFSET 0
      `,
    ]);

    const characters = ensureCharacterRows(normalizeRows(charRes));
    const supports = ensureSupportRows(normalizeRows(supRes));

    return { characters, supports };
  });
}
