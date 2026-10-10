import type { Metadata, Viewport } from 'next';
import '@fontsource/rubik/500.css';
import '@fontsource/rubik/700.css';
import '@fontsource/nunito-sans/400.css';
import '@fontsource/nunito-sans/600.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Minime Brick · Kendi çerçeveni tasarla',
  description: 'Yüzünü, saçını, kıyafetini seç; baskılı kartını tasarla ve çerçeveni 3B olarak gör.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#d6402b' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
