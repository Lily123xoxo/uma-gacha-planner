export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const one = await sql`select 1 as ok`;
    const [{ ccount }] = await sql`select count(*)::int as ccount from public.character_banner`;
    const [{ scount }] = await sql`select count(*)::int as scount from public.support_banner`;
    return NextResponse.json({ ok: one[0]?.ok === 1, character_banner_count: ccount, support_banner_count: scount });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}