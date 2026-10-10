import type { KartId } from '@/lib/katalog';

// Hazır baskılı kart tasarımlarının yer tutucuları: tuvale kodla çizilir; başlık, alt yazı ve
// figür isimleri "basılır". Gerçek kart tasarımları gelince bu dosya yerine görsel kullanılır.

export interface KartIcerik {
  baslik: string;
  altYazi: string;
  /** Baskı alanının merkezine göre cm cinsinden isim konumları */
  isimler: { x: number; y: number; metin: string }[];
  baskiEn: number;
  baskiBoy: number;
}

interface Tema {
  yazi: string;
  vurgu: string;
  isim: string;
  boyaz: (g: CanvasRenderingContext2D, w: number, h: number) => void;
}

function kalp(g: CanvasRenderingContext2D, x: number, y: number, r: number, renk: string) {
  g.fillStyle = renk;
  g.beginPath();
  g.moveTo(x, y + r * 0.35);
  g.bezierCurveTo(x - r * 1.2, y - r * 0.5, x - r * 0.5, y - r * 1.2, x, y - r * 0.45);
  g.bezierCurveTo(x + r * 0.5, y - r * 1.2, x + r * 1.2, y - r * 0.5, x, y + r * 0.35);
  g.fill();
}

const TEMALAR: Record<KartId, Tema> = {
  'sade-beyaz': {
    yazi: '#2a2320',
    vurgu: '#d6402b',
    isim: '#3a312c',
    boyaz(g, w, h) {
      g.fillStyle = '#fffdf8';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = '#e6dccb';
      g.lineWidth = w * 0.006;
      g.strokeRect(w * 0.04, w * 0.04, w * 0.92, h - w * 0.08);
    },
  },
  'pembe-damali': {
    yazi: '#b3224f',
    vurgu: '#9c1c3d',
    isim: '#5a2a3a',
    boyaz(g, w, h) {
      const kare = w * 0.075;
      for (let y = 0; y * kare < h + kare; y++)
        for (let x = 0; x * kare < w + kare; x++) {
          const pembe = (x + y) % 2 === 0;
          g.fillStyle = pembe ? '#f3b6c3' : '#fff7f8';
          g.fillRect(x * kare, y * kare, kare + 1, kare + 1);
          if (pembe && (x + y) % 4 === 0) kalp(g, x * kare + kare / 2, y * kare + kare / 2, kare * 0.22, '#a3173f');
        }
      const kenar = kare * 1.25;
      g.fillStyle = '#fffdfb';
      g.beginPath();
      g.roundRect(kenar, kenar, w - 2 * kenar, h - 2 * kenar, w * 0.05);
      g.fill();
    },
  },
  gokyuzu: {
    yazi: '#1f4f8f',
    vurgu: '#e0457b',
    isim: '#1f3f6e',
    boyaz(g, w, h) {
      const d = g.createLinearGradient(0, 0, 0, h);
      d.addColorStop(0, '#9fd2ff');
      d.addColorStop(1, '#f4faff');
      g.fillStyle = d;
      g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,0.95)';
      [[0.15, 0.86, 0.1], [0.3, 0.9, 0.12], [0.5, 0.87, 0.09], [0.72, 0.9, 0.12], [0.88, 0.86, 0.1], [0.2, 0.22, 0.06], [0.82, 0.3, 0.07]].forEach(([x, y, r]) => {
        g.beginPath();
        g.arc(x * w, y * h, r * w, 0, Math.PI * 2);
        g.fill();
      });
    },
  },
  'siyah-sik': {
    yazi: '#f3e6bf',
    vurgu: '#c9a74a',
    isim: '#f3e6bf',
    boyaz(g, w, h) {
      g.fillStyle = '#141416';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = '#c9a74a';
      g.lineWidth = w * 0.005;
      g.strokeRect(w * 0.035, w * 0.035, w * 0.93, h - w * 0.07);
      g.strokeRect(w * 0.05, w * 0.05, w * 0.9, h - w * 0.1);
    },
  },
};

function sigdir(g: CanvasRenderingContext2D, metin: string, font: (px: number) => string, px: number, enGenis: number) {
  let boyut = px;
  g.font = font(boyut);
  while (g.measureText(metin).width > enGenis && boyut > 6) {
    boyut -= 1;
    g.font = font(boyut);
  }
  return boyut;
}

/** Kartın baskı alanı oranında (en/boy) tuval çizer; yazılar `icerik`ten gelir. */
export function kartTuvali(id: KartId, icerik: KartIcerik): HTMLCanvasElement {
  const oran = icerik.baskiEn / icerik.baskiBoy;
  const tuval = document.createElement('canvas');
  tuval.width = 1024;
  tuval.height = Math.round(1024 / oran);
  const g = tuval.getContext('2d');
  if (!g) return tuval;
  const { width: w, height: h } = tuval;
  const t = TEMALAR[id];
  t.boyaz(g, w, h);
  const cm = w / icerik.baskiEn; // 1 cm kaç piksel
  g.textAlign = 'center';
  g.textBaseline = 'middle';

  if (icerik.baslik.trim()) {
    g.fillStyle = t.yazi;
    sigdir(g, icerik.baslik, (px) => `italic 700 ${px}px Georgia, 'Times New Roman', serif`, icerik.baskiEn * 0.075 * cm, w * 0.78);
    g.fillText(icerik.baslik, w / 2, h * 0.17);
    kalp(g, w / 2, h * 0.17 + icerik.baskiEn * 0.055 * cm, icerik.baskiEn * 0.016 * cm, t.vurgu);
  }
  if (icerik.altYazi.trim()) {
    g.fillStyle = t.yazi;
    sigdir(g, icerik.altYazi, (px) => `500 ${px}px system-ui, sans-serif`, icerik.baskiEn * 0.034 * cm, w * 0.76);
    g.fillText(icerik.altYazi, w / 2, h * 0.9);
  }
  g.fillStyle = t.isim;
  for (const i of icerik.isimler) {
    if (!i.metin.trim()) continue;
    sigdir(g, i.metin, (px) => `600 ${px}px system-ui, sans-serif`, 0.62 * cm, 3.6 * cm);
    g.fillText(i.metin, w / 2 + i.x * cm, h / 2 - i.y * cm);
  }
  return tuval;
}

/** Seçim düğmesindeki küçük önizleme: yazısız kart */
export function kartOnizleme(id: KartId): string {
  return kartTuvali(id, { baslik: '', altYazi: '', isimler: [], baskiEn: 21, baskiBoy: 21 }).toDataURL('image/jpeg', 0.6);
}
