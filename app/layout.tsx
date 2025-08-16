import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'umaplanner',
  description: 'Gacha planner & banner timeline for Uma Musume.',
  viewport: { width: 'device-width', initialScale: 1 },
  // icons: { icon: '/favicon.ico' }, // uncomment when favicon added
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cfBeacon = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN
    ? JSON.stringify({ token: process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN, spa: true })
    : undefined;

  return (
    <html lang="en" data-bs-theme="dark" /* suppressHydrationWarning */>
      <body>
        {children}

        {/* Vercel Analytics */}
        <Analytics />

        {/* Bootstrap JS */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-Gsz0p6U5m7cJqk3tCgy8o5o9k2bX8l3tqM0n5vYk1k3q2qfD0v2mX8b9tR0Uu3QF"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Index Page JS */}
        <Script src="/js/index.js" strategy="afterInteractive" />

        {/* Cloudflare Web Analytics */}
        {cfBeacon && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            {...({ 'data-cf-beacon': cfBeacon } as any)}
          />
        )}
      </body>
    </html>
  );
}
