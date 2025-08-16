/** @type {import('next').NextConfig} */
const nextConfig = {
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

  // Add global security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          // Adjust this if you need any of these features client-side
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
