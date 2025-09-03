/** @type {import('next').NextConfig} */

// Build/version string available to the browser
const pkg = require('./package.json');
const buildVersion =
  (process.env.VERCEL_GIT_COMMIT_SHA && process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)) ||
  pkg.version ||
  Date.now().toString();

const nextConfig = {
  env: {
    // Use this in your components: process.env.NEXT_PUBLIC_APP_VERSION
    NEXT_PUBLIC_APP_VERSION: buildVersion,
  },

  // Keep your custom dev watcher tweaks
  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          'C:/pagefile.sys',
          'C:/swapfile.sys',
          'C:/hiberfil.sys',
          'C:/DumpStack.log.tmp',
        ],
      };
    }
    return config;
  },

  // Global + targeted headers
  async headers() {
    return [
      // Global security headers
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },

      // 1) Next build assets: long-lived + immutable (no revalidation -> no 304s)
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },

      // 2) Optimized images (/_next/image?url=...) — cache at browser and CDN
      // Note: Next already sets decent defaults, but this makes it explicit.
      {
        source: '/_next/image',
        headers: [
          // s-maxage for CDN, max-age for browser
          { key: 'Cache-Control', value: 'public, s-maxage=31536000, max-age=31536000, immutable' },
        ],
      },

      // 3) Public/static assets by extension (images, css/js, fonts, svg, etc.)
      // Use hashed filenames for anything that can change over time.
      {
        source: '/:all*(?<ext>\\.avif|\\.webp|\\.png|\\.jpe?g|\\.gif|\\.svg|\\.ico|\\.css|\\.js|\\.map|\\.woff2?|\\.ttf|\\.otf|\\.mp4|\\.webm|\\.mp3)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },

      // 4) Keep HTML non-sticky (so your pages update when you deploy)
      // Applies to root and any path without a file extension (i.e., likely HTML routes).
      {
        source: '/((?!_next/|api/|.*\\.[a-zA-Z0-9]+).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },

      // 5) API routes should not be cached by the browser
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },

      // 6) Belt & suspenders: force revalidation of timeline.js (you asked to keep this)
      {
        source: '/js/timeline.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;