import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/fraunces/opsz-italic.css';
import '@fontsource-variable/manrope/wght.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Minime Brick · Kendi çerçeveni tasarla',
  description: 'Yüzünü, saçını, kıyafetini seç; baskılı kartını tasarla ve çerçeveni 3B olarak gör.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0e0c0a' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
