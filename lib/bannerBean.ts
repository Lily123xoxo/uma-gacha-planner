// lib/bannerTypes.ts
export type GroupedBanner = {
  id: number;
  type: "character" | "support";
  name: string | null;
  image_path: string | null;

  start_date: string | null;      // actual if present, else est
  start_kind: "actual" | "est";
  end_date: string | null;        // actual end if present
  est_end_date: string | null;    // estimated end if present
  jp_release_date: string | null;

  jp_days_until_next: number | null;
  global_days_until_next: number | null;
};

export type GroupedBannerDay = {
  date: string;               // YYYY-MM-DD (start-day key)
  characters: GroupedBanner[];
  supports: GroupedBanner[];
};
