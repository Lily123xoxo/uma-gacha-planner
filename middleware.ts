// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const APP_ENV = process.env.APP_ENV ?? 'prod';
const isDevApp = APP_ENV === 'dev';

const hasRedis =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

// Only construct clients when we actually need them (prod with creds)
const redis = !isDevApp && hasRedis ? Redis.fromEnv() : null;

const apiLimiter =
  !isDevApp && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '1 m'),
        analytics: true,
        prefix: '@rl:api',
      })
    : null;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only rate-limit API routes
  if (!pathname.startsWith('/api/')) return NextResponse.next();

  // In dev or if no Redis creds → skip rate limiting entirely (no Redis calls)
  if (isDevApp || !apiLimiter) return NextResponse.next();

  // Best-effort IP (works on Vercel)
  const ip =
    req.ip ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '127.0.0.1';

  // Per-path key (e.g., /api/banners and /api/planner have separate buckets)
  const key = `${ip}:${pathname}`;

  const { success, limit, remaining, reset } = await apiLimiter.limit(key);

  if (!success) {
    const res = NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    res.headers.set('Retry-After', `${Math.max(1, Math.ceil((reset - Date.now()) / 1000))}`);
    res.headers.set('X-RateLimit-Limit', `${limit}`);
    res.headers.set('X-RateLimit-Remaining', '0');
    res.headers.set('X-RateLimit-Reset', `${Math.floor(reset / 1000)}`);
    return res;
  }

  const res = NextResponse.next();
  res.headers.set('X-RateLimit-Limit', `${limit}`);
  res.headers.set('X-RateLimit-Remaining', `${remaining}`);
  res.headers.set('X-RateLimit-Reset', `${Math.floor(reset / 1000)}`);
  return res;
}

// Apply only to API routes (don’t rate limit static assets/pages)
export const config = {
  matcher: ['/api/:path*'],
};
