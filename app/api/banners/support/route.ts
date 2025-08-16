export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSupportBanners, safeLimit } from '@/lib/bannerDao';
import { resolveImagePath } from '@/lib/paths';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get('limit');
    const limit = safeLimit(raw); // defaults to 90 if missing/invalid

    const rows = await getSupportBanners(limit);

    const withResolved = await Promise.all(
      rows.map(async (row) => ({
        ...row,
        image_path: await resolveImagePath(row.image_path ?? undefined),
      }))
    );

    const res = NextResponse.json(withResolved);
    const ONE_YEAR = 60 * 60 * 24 * 365;
    const TWO_WEEKS = 60 * 60 * 24 * 14;
    res.headers.set(
      'Cache-Control',
      `public, s-maxage=${ONE_YEAR}, stale-while-revalidate=${ONE_YEAR}`
    );
    return res;
  } catch (err) {
    console.error('Error fetching support banners:', err);
    return NextResponse.json({ error: 'Failed to fetch support banners' }, { status: 500 });
  }
}
