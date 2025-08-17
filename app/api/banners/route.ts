export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getBannerDispatcher } from '@/lib/bannerDaoDispatcher';
import { resolveImagePath } from '@/lib/paths';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { characters, supports } = await getBannerDispatcher();

    // Resolve image paths for both lists
    const [charactersResolved, supportsResolved] = await Promise.all([
      Promise.all(
        characters.map(async (row) => ({
          ...row,
          image_path: await resolveImagePath(row.image_path ?? undefined),
        }))
      ),
      Promise.all(
        supports.map(async (row) => ({
          ...row,
          image_path: await resolveImagePath(row.image_path ?? undefined),
        }))
      ),
    ]);

    const res = NextResponse.json({
      characters: charactersResolved,
      supports: supportsResolved,
    });

    // Long edge cache, manual invalidation strategy
    const ONE_MONTH = 60 * 60 * 24 * 24;
    res.headers.set(
      'Cache-Control',
      `public, s-maxage=${ONE_MONTH}, stale-while-revalidate=${ONE_MONTH}`
    );
    return res;
  } catch (err) {
    console.error('Error fetching combined banners:', err);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}
