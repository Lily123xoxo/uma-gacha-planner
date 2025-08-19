// app/api/planner/route.ts
import { NextResponse } from 'next/server';
import gachaService from '@/services/gachaService';

// (Optional but recommended) ensure Node runtime, avoid edge quirks
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type BannerLike = {
  global_actual_end_date?: string | Date | null;
  global_est_end_date?: string | Date | null;
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

/**
 * Normalize DB/driver date to "YYYY-MM-DD".
 * Accepts Date objects, ISO strings, or "YYYY-MM-DD HH:mm:ss".
 */
function normalizeYMD(s?: unknown): string | null {
  if (!s) return null;

  // DB driver may return a Date instance in prod
  if (s instanceof Date && !isNaN(s.getTime())) {
    const y = s.getUTCFullYear();
    const m = String(s.getUTCMonth() + 1).padStart(2, '0');
    const d = String(s.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  if (typeof s === 'string') {
    const t = s.trim();
    if (t.length >= 10) {
      const ymd = t.slice(0, 10);
      return /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? ymd : null;
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PlannerRequest;

    // Prefer characterBanner dates; fall back to supportBanner if needed
    const rawEnd =
      body?.characterBanner?.global_actual_end_date ??
      body?.characterBanner?.global_est_end_date ??
      body?.supportBanner?.global_actual_end_date ??
      body?.supportBanner?.global_est_end_date ??
      null;

    const bannerEndDate = normalizeYMD(rawEnd);

    // Light input normalization (keeps service strict but avoids common pitfalls)
    const clubRank = String(body.clubRank ?? '').trim();          // e.g., "A"
    const teamTrialsRank = String(body.teamTrialsRank ?? '').trim(); // e.g., "Class6"

    const data = {
      carats: Number(body.carats ?? 0),
      clubRank,                // keep case as provided; tests cover behavior
      teamTrialsRank,          // keep case as provided
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
