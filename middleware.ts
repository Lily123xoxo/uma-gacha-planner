// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

/**
 * API limiter: 60 requests per IP per minute, per route path.
 * Tweak numbers if you want stricter/looser.
 */
const apiLimiter = new Ratelimit({
  redis,
  // Sliding window smooths bursts better than fixed window
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  analytics: true,
  prefix: '@rl:api',
});

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only rate-limit API routes
  if (!pathname.startsWith('/api/')) return NextResponse.next();

  // Best-effort IP (works on Vercel)
  const ip =
    req.ip ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '127.0.0.1';

  // Key includes path so /api/banners/character & /api/banners/support have separate buckets
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
  // Nice-to-have: expose remaining counts
  res.headers.set('X-RateLimit-Limit', `${limit}`);
  res.headers.set('X-RateLimit-Remaining', `${remaining}`);
  res.headers.set('X-RateLimit-Reset', `${Math.floor(reset / 1000)}`);
  return res;
}

// Apply only to API routes (don’t rate limit static assets/pages)
export const config = {
  matcher: ['/api/:path*'],
};
