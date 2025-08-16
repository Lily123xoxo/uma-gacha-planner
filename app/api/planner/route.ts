// app/api/planner/route.ts
import { NextResponse } from 'next/server';
// Adjust import based on your actual export:
// If it's a default export object with calculateRolls(), keep as below.
// If it's a named export, use: import { calculateRolls } from '@/services/gachaService';
import gachaService from '@/services/gachaService';

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
  characterBanner?: {
    global_actual_end_date?: string | null;
    global_est_end_date?: string | null;
  } | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PlannerRequest;

    const data = {
      carats: Number(body.carats ?? 0),
      clubRank: String(body.clubRank ?? ''),
      teamTrialsRank: String(body.teamTrialsRank ?? ''),
      champMeeting: Number(body.champMeeting ?? 0),
      characterTickets: Number(body.characterTickets ?? 0),
      supportTickets: Number(body.supportTickets ?? 0),
      monthlyPass: body.monthlyPass === true || body.monthlyPass === 'true',
      dailyLogin: body.dailyLogin === true || body.dailyLogin === 'true',
      legendRace: body.legendRace === true || body.legendRace === 'true',
      dailyMission: body.dailyMission === true || body.dailyMission === 'true',
      rainbowCleat: body.rainbowCleat === true || body.rainbowCleat === 'true',
      goldCleat: body.goldCleat === true || body.goldCleat === 'true',
      silverCleat: body.silverCleat === true || body.silverCleat === 'true',
      bannerStartDate:
        body.characterBanner?.global_actual_end_date ??
        body.characterBanner?.global_est_end_date ??
        null,
    };

    // If your service exports a named function, do:
    // const result = calculateRolls(data);
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
