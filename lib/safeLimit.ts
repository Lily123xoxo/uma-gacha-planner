export function safeLimit(): number {
  const fallback = 96;
  const max = 200;
  const raw = process.env.BANNERS_LIMIT;
  const parsed = Number.parseInt(String(raw ?? ""), 10);
  const n = Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  return Math.min(n, max);
}