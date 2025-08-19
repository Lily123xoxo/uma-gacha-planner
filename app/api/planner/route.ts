// app/api/planner/route.ts
import { NextResponse } from 'next/server';
import gachaService from '@/services/gachaService';

type BannerLike = {
  global_actual_end_date?: string | null;
  global_est_end_date?: string | null;
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

// Normalize any DB/ISO string to "YYYY-MM-DD" (or null)
function normalizeYMD(s?: string | null): string | null {
  if (typeof s !== 'string') return null;
  const t = s.trim();
  if (t.length < 10) return null;
  // Accept "YYYY-MM-DD", ISO, or "YYYY-MM-DD HH:mm:ss" by slicing first 10 chars.
  const ymd = t.slice(0, 10);
  // Light validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  return ymd;
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

    const data = {
      carats: Number(body.carats ?? 0),
      clubRank: String(body.clubRank ?? ''),
      teamTrialsRank: String(body.teamTrialsRank ?? ''),
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
