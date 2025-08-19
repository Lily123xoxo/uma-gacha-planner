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
      // Belt & suspenders: force revalidation of timeline.js (cache-busting query still works)
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
