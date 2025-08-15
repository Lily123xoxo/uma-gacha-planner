import { NextResponse } from 'next/server';
import { resolveImagePath } from '@/lib/paths';
// Import your real DAO once ready. For now you can stub it below or in /lib/bannerDao.
// import { getCharacterBanners } from '@/lib/bannerDao';

type CharacterRow = {
  id: number;
  uma_name: string;
  jp_release_date: string | null;
  global_actual_date: string | null;
  global_est_date: string | null;
  jp_days_until_next: number | null;
  global_days_until_next: number | null;
  image_path: string | null;
};

// TEMP: stub until your DAO is wired
async function getCharacterBanners(): Promise<CharacterRow[]> {
  // Replace with DB/JSON call. Must return the same fields as above.
  return [];
}

export async function GET() {
  try {
    const rows = await getCharacterBanners();

    const withResolved = await Promise.all(
      rows.map(async (row) => ({
        ...row,
        image_path: await resolveImagePath(row.image_path ?? undefined),
      }))
    );

    // Edge/CDN caching (tune as you like)
    const res = NextResponse.json(withResolved);
    res.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=1200');
    return res;
  } catch (err) {
    console.error('Error fetching character banners:', err);
    return NextResponse.json({ error: 'Failed to fetch character banners' }, { status: 500 });
  }
}
