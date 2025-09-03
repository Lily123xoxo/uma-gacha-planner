import './globals.css';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Uma Planner - Gacha banner timeline & planner | umaplanner',
  description: 'Plan your pulls with Uma Planner - a free gacha planning tool and timeline for Uma Musume fans.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cfBeacon = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN
    ? JSON.stringify({ token: process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN, spa: true })
    : undefined;

  return (
    <html lang="en" data-bs-theme="dark">
      <body>
        <div className="bg-layer" aria-hidden="true"></div>
        {children}

        {/* Vercel Analytics and Speed Insights */}
        <Analytics />

        {/* Bootstrap JS */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
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
