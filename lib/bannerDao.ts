// lib/bannerDao.prod.ts
import { sql } from "./db";
import { Redis } from "@upstash/redis";

/* ---------- types ---------- */
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

export type BannersPayload = {
  characters: CharacterRow[];
  supports: SupportRow[];
};

/* ---------- config ---------- */
const MONTH_TTL_SECONDS = 30 * 24 * 60 * 60;
const CACHE_PREFIX = process.env.CACHE_PREFIX ?? "prod";
const CACHE_VERSION = process.env.CACHE_VERSION ?? "v2";

/** Single source of truth for DB read limit */
export function safeLimit(): number {
  const fallback = 96;
  const max = 200;
  const raw = process.env.BANNERS_LIMIT;
  const parsed = Number.parseInt(String(raw ?? ""), 10);
  const n = Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  return Math.min(n, max);
}

/* ---------- helpers ---------- */
/** Normalize sql() results: supports Neon (array) and pg Pool ({ rows }) */
function normalizeRows<T = any>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object" && "rows" in (res as any)) {
    return (res as any).rows as T[];
  }
  return [];
}

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
  if (!Number.isFinite(n)) throw new Error(`[bannerDao.prod] Expected number for ${field}, got ${v}`);
  return n;
}

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
      throw new Error(`[bannerDao.prod] Row ${i} invalid (character): ${(e as Error).message}`);
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
      throw new Error(`[bannerDao.prod] Row ${i} invalid (support): ${(e as Error).message}`);
    }
  });
}

/* ---------- cache (Upstash optional) ---------- */
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
  if (!redis) return loader();

  try {
    const cached = await redis.get<T>(key);
    if (cached) return cached;
  } catch {
    // ignore get failures
  }

  const fresh = await loader();

  try {
    // write/refresh the cache (no NX so content can update under same key)
    await redis.set(key, fresh as any, { ex: ttlSeconds });
  } catch {
    // ignore set failures
  }

  return fresh;
}

/* ---------- main (prod only) ---------- */
export async function getBannersCombined(): Promise<BannersPayload> {
  const lim = safeLimit();
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
