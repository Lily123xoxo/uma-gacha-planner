// lib/cache.ts
import { redis } from "./redis";

export async function cacheJSON<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const data = await loader();
  await redis.set(key, data, { ex: ttlSeconds });
  return data;
}
