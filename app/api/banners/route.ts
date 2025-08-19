export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getBannersGroupedByDate, BANNER_BACKEND } from "@/lib/bannerDao.dispatcher";
import { resolveImagePath } from "@/lib/paths";

export async function GET() {
  try {
    
    const days = await getBannersGroupedByDate();

    const daysResolved = await Promise.all(
      days.map(async (d) => ({
        date: d.date,
        characters: await Promise.all(
          (d.characters || []).map(async (b) => ({
            ...b,
            image_path: await resolveImagePath(b.image_path ?? undefined),
          }))
        ),
        supports: await Promise.all(
          (d.supports || []).map(async (b) => ({
            ...b,
            image_path: await resolveImagePath(b.image_path ?? undefined),
          }))
        ),
      }))
    );

    const res = NextResponse.json({ ok: true, backend: BANNER_BACKEND, data: daysResolved });

    const ONE_MONTH = 60 * 60 * 24 * 30;
    res.headers.set(
      "Cache-Control",
      `public, s-maxage=${ONE_MONTH}, stale-while-revalidate=${ONE_MONTH}`
    );
    return res;
  } catch (err) {
    console.error("Error fetching grouped banners:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch banners" }, { status: 500 });
  }
}
