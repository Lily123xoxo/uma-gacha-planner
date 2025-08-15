import { NextResponse } from 'next/server';
import { resolveImagePath } from '@/lib/paths';
// import { getSupportBanners } from '@/lib/bannerDao';

type SupportRow = {
  id: number;
  support_name: string;
  jp_release_date: string | null;
  global_actual_date: string | null;
  global_est_date: string | null;
  jp_days_until_next: number | null;
  global_days_until_next: number | null;
  image_path: string | null;
};

// TEMP: stub until your DAO is wired
async function getSupportBanners(): Promise<SupportRow[]> {
  // Replace with DB/JSON call. Must return the same fields as above.
  return [];
}

export async function GET() {
  try {
    const rows = await getSupportBanners();

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
