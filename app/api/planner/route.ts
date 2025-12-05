import { NextResponse } from 'next/server';
import gachaService from '@/services/gachaService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PlannerRequest = Record<string, unknown>; // service owns the schema

export async function POST(req: Request) {
  try {
    // Body must be JSON; no extra logic here.
    const body = (await req.json()) as PlannerRequest;

    // Delegate ALL manipulation/validation/normalization to the service.
    const result = await gachaService.calculateRolls(body);

    // Keep the same response shape used by your UI.
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
