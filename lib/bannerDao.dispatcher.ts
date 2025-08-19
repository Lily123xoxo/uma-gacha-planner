// lib/dispatcher/bannerDao.dispatcher.ts

export * from "./bannerBean";
import type { GroupedBannerDay } from "./bannerBean";

const env = String(process.env.APP_ENV ?? "").toLowerCase();
const useLocal = env === "dev" || env === "true";

export const BANNER_BACKEND = useLocal ? "local" : "neon";

export async function getBannersGroupedByDate(): Promise<GroupedBannerDay[]> {
  if (useLocal) {
    const mod = await import("./dev/bannerDao.local");
    return mod.getBannersGroupedByDate();
  } else {
    const mod = await import("./bannerDao.neon");
    return mod.getBannersGroupedByDate();
  }
}
