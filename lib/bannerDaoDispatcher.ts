// lib/bannerDaoDispatcher.ts
import { isDevApp } from "./env";
import type { BannersPayload, CharacterRow, SupportRow } from "./bannerDao";

export async function getBannerDispatcher(): Promise<BannersPayload> {
  if (isDevApp) {
    console.log(`
///////////////////////////////////////////////////////
###  [DEVELOPMENT MODE: No External APIs In Use]   ###
///////////////////////////////////////////////////////
`);

    const { getBannersCombinedLocal } = await import("./dev/localBannerDao");
    const { characters: lchars, supports: lsupp } = await getBannersCombinedLocal();

    // Map LocalRow -> CharacterRow
    const characters: CharacterRow[] = lchars.map((r: any) => ({
      id: Number(r.id),
      uma_name: r.name ?? "", // map name -> uma_name
      jp_release_date: r.jp_release_date ?? null,
      global_actual_date: r.global_actual_date ?? null,
      global_actual_end_date: r.global_actual_end_date ?? null,
      global_est_date: r.global_est_date ?? null,
      global_est_end_date: r.global_est_end_date ?? null,
      jp_days_until_next: r.jp_days_until_next ?? null,
      global_days_until_next: r.global_days_until_next ?? null,
      image_path: r.image_path ?? null,
    }));

    // Map LocalRow -> SupportRow
    const supports: SupportRow[] = lsupp.map((r: any) => ({
      id: Number(r.id),
      support_name: r.name ?? "", // map name -> support_name
      jp_release_date: r.jp_release_date ?? null,
      global_actual_date: r.global_actual_date ?? null,
      global_actual_end_date: r.global_actual_end_date ?? null,
      global_est_date: r.global_est_date ?? null,
      global_est_end_date: r.global_est_end_date ?? null,
      jp_days_until_next: r.jp_days_until_next ?? null,
      global_days_until_next: r.global_days_until_next ?? null,
      image_path: r.image_path ?? null,
    }));

    return { characters, supports };
  }

  // prod path: return the canonical shapes directly
  const { getBannersCombined } = await import("./bannerDao");
  return getBannersCombined();
}
