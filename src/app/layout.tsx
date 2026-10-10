import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Minime Brick · Kendi çerçeveni tasarla',
  description: 'Çerçeve boyutunu, figürlerini ve arka tasarımını seç; 3B olarak gör.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#d6402b' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
