// app/api/planner/route.ts
import { NextResponse } from 'next/server';
import gachaService from '@/services/gachaService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type BannerLike = {
  global_actual_end_date?: string | Date | null;
  global_est_end_date?: string | Date | null;
  // some feeds may use alternate keys; we coalesce them at runtime
  actual_end_date?: string | Date | null;
  est_end_date?: string | Date | null;
  end_date?: string | Date | null;
} | null;

type PlannerRequest = {
  carats?: number | string;
  clubRank?: string;
  teamTrialsRank?: string;
  champMeeting?: number | string;
  characterTickets?: number | string;
  supportTickets?: number | string;
  monthlyPass?: boolean | string;
  dailyLogin?: boolean | string;
  legendRace?: boolean | string;
  dailyMission?: boolean | string;
  rainbowCleat?: boolean | string;
  goldCleat?: boolean | string;
  silverCleat?: boolean | string;
  characterBanner?: BannerLike;
  supportBanner?: BannerLike;
};

function toBool(v: unknown): boolean {
  return v === true || v === 'true';
}

/** Normalize to "YYYY-MM-DD" (UTC). Accepts Date, ISO, YYYY-MM-DD..., or locale strings (e.g., AEST). */
function normalizeYMD(s?: unknown): string | null {
  if (!s) return null;

  // Date instance
  if (s instanceof Date && !isNaN(s.getTime())) {
    const y = s.getUTCFullYear();
    const m = String(s.getUTCMonth() + 1).padStart(2, '0');
    const d = String(s.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  if (typeof s === 'string') {
    const t = s.trim();

    // Fast path: leading YYYY-MM-DD
    const mYMD = /^(\d{4})-(\d{2})-(\d{2})/.exec(t);
    if (mYMD) return `${mYMD[1]}-${mYMD[2]}-${mYMD[3]}`;

    // Fallback: let Date parse locale/ISO-ish strings
    const d = new Date(t);
    if (!isNaN(d.getTime())) {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  }

  return null;
}

/** Coalesce likely end-date fields from a banner-like object. */
function pickEndDateLike(b: any): unknown {
  if (!b) return null;
  return (
    b.global_actual_end_date ??
    b.global_est_end_date ??
    b.actual_end_date ??
    b.est_end_date ??
    b.end_date ??
    null
  );
}

/** Build end instant as 21:59 UTC on that day — debug only. */
function endInstantFromLastDayUTC(lastDayStr: string | null) {
  if (!lastDayStr) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(lastDayStr);
  if (!m) return null;
  const y = +m[1], mm = +m[2], dd = +m[3];
  const d = new Date(Date.UTC(y, mm - 1, dd, 21, 59, 0, 0));
  return isNaN(d.getTime()) ? null : d;
}

/* ===== extra debug tick helpers (no impact on prod calc) ===== */
const RESET_UTC_HOUR = 15;
const RESET_UTC_MIN = 0;
const MS_PER_DAY = 86_400_000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

function nextDailyReset(afterUtc: Date) {
  const base = new Date(Date.UTC(
    afterUtc.getUTCFullYear(), afterUtc.getUTCMonth(), afterUtc.getUTCDate(),
    RESET_UTC_HOUR, RESET_UTC_MIN, 0, 0
  ));
  if (base <= afterUtc) base.setUTCDate(base.getUTCDate() + 1);
  return base;
}

function countDailyTicks(fromUtc: Date, toUtc: Date) {
  if (!toUtc || toUtc <= fromUtc) return 0;
  let tick = nextDailyReset(fromUtc);
  if (tick > toUtc) return 0;
  return 1 + Math.floor((toUtc.getTime() - tick.getTime()) / MS_PER_DAY);
}

function countWeeklyTicks(fromUtc: Date, toUtc: Date) {
  if (!toUtc || toUtc <= fromUtc) return 0;
  let tick = nextDailyReset(fromUtc);
  if (tick > toUtc) return 0;
  // Monday = 1 (UTC)
  const deltaDays = (1 - tick.getUTCDay() + 7) % 7;
  if (deltaDays > 0) tick = new Date(tick.getTime() + deltaDays * MS_PER_DAY);
  if (tick > toUtc) return 0;
  return 1 + Math.floor((toUtc.getTime() - tick.getTime()) / MS_PER_WEEK);
}

function countMonthlyTicksUTC(fromUtc: Date, toUtc: Date) {
  if (!toUtc || toUtc <= fromUtc) return 0;
  let tick = nextDailyReset(fromUtc);
  if (tick > toUtc) return 0;
  let count = 0;
  while (tick <= toUtc) {
    if (tick.getUTCDate() === 1) count++;
    tick = new Date(tick.getTime() + MS_PER_DAY);
  }
  return count;
}
/* ===== end debug tick helpers ===== */

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const debug = url.searchParams.get('debug') === '1';

    // Read body
    let body: PlannerRequest;
    const raw = await req.text();
    if (!raw) {
      return NextResponse.json({ error: 'Empty body. Send application/json.' }, { status: 400 });
    }
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON', raw: raw.slice(0, 200) }, { status: 400 });
    }

    // Prefer characterBanner; fall back to supportBanner
    const rawEnd =
      pickEndDateLike(body?.characterBanner) ??
      pickEndDateLike(body?.supportBanner) ??
      null;

    const bannerEndDate = normalizeYMD(rawEnd);

    const data = {
      carats: Number(body.carats ?? 0),
      clubRank: String(body.clubRank ?? '').trim(),
      teamTrialsRank: String(body.teamTrialsRank ?? '').trim(),
      champMeeting: Number(body.champMeeting ?? 0),
      characterTickets: Number(body.characterTickets ?? 0),
      supportTickets: Number(body.supportTickets ?? 0),
      monthlyPass: toBool(body.monthlyPass),
      dailyLogin: toBool(body.dailyLogin),
      legendRace: toBool(body.legendRace),
      dailyMission: toBool(body.dailyMission),
      rainbowCleat: toBool(body.rainbowCleat),
      goldCleat: toBool(body.goldCleat),
      silverCleat: toBool(body.silverCleat),
      bannerEndDate, // "YYYY-MM-DD" or null
    };

    const result = gachaService.calculateRolls(data);

    if (debug) {
      const now = new Date();
      const nowUtcISO = new Date(Date.UTC(
        now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
        now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds()
      )).toISOString();

      const endUtc = endInstantFromLastDayUTC(bannerEndDate);

      // compute tick counts for comparison across envs
      const fromUtc = new Date(nowUtcISO);
      const dailyTicks   = endUtc ? countDailyTicks(fromUtc, endUtc) : null;
      const weeklyTicks  = endUtc ? countWeeklyTicks(fromUtc, endUtc) : null;
      const monthlyTicks = endUtc ? countMonthlyTicksUTC(fromUtc, endUtc) : null;

      return NextResponse.json({
        _debug: {
          rawEndType: rawEnd === null ? 'null' : Array.isArray(rawEnd) ? 'array' : typeof rawEnd,
          rawEndIsDate: rawEnd instanceof Date,
          rawEndString: typeof rawEnd === 'string' ? rawEnd : null,
          bannerEndDate,
          nowUtcISO,
          endUtcISO: endUtc ? endUtc.toISOString() : null,
          endBeforeOrEqualNow: endUtc ? endUtc <= new Date(nowUtcISO) : null,
          clubRank: data.clubRank,
          teamTrialsRank: data.teamTrialsRank,
          dailyTicks,     // <= NEW
          weeklyTicks,    // <= NEW
          monthlyTicks    // <= NEW
        },
        rolls: result.rolls,
        carats: result.carats,
        supportTickets: result.supportTickets,
        characterTickets: result.characterTickets,
      });
    }

    return NextResponse.json({
      rolls: result.rolls,
      carats: result.carats,
      supportTickets: result.supportTickets,
      characterTickets: result.characterTickets,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('planner POST error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
