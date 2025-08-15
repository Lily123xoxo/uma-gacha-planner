/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

module.exports = nextConfig;