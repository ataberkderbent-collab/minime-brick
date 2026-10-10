import type { NextConfig } from 'next';

// STATIK=1: göreli yollu statik dışa aktarma (önizleme sayfası olarak yayınlamak için)
const statik = process.env.STATIK === '1';

const config: NextConfig = {
  reactStrictMode: true,
  ...(statik ? { output: 'export', assetPrefix: './', images: { unoptimized: true }, trailingSlash: false } : {}),
  // three / drei paketleri ESM; Next'in derlemesine bırak
  transpilePackages: ['three'],
};

export default config;
