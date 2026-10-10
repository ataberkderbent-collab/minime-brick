import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // three / drei paketleri ESM; Next'in derlemesine bırak
  transpilePackages: ['three'],
};

export default config;
