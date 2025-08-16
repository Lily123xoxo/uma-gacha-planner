import { NextResponse } from 'next/server';
import { resolveImagePath } from '@/lib/paths';
import { getSupportBanners, type SupportRow } from '@/lib/bannerDao';

export async function GET() {
  try {
    const rows: SupportRow[] = await getSupportBanners();

    const withResolved = await Promise.all(
      rows.map(async (row) => ({
        ...row,
        image_path: await resolveImagePath(row.image_path ?? undefined),
      }))
    );

    const res = NextResponse.json(withResolved);
    res.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=1200');
    return res;
  } catch (err) {
    console.error('Error fetching support banners:', err);
    return NextResponse.json({ error: 'Failed to fetch support banners' }, { status: 500 });
  }
}
