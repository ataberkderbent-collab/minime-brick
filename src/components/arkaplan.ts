import type { ArkaPlanId } from '@/lib/katalog';

// Hazır arka tasarımların yer tutucuları: tuvale kodla çizilir. Gerçek tasarım
// görselleri gelince bu dosya yerine görsel adresi kullanılır.

type Cizici = (g: CanvasRenderingContext2D, w: number, h: number) => void;

function dikey(g: CanvasRenderingContext2D, h: number, renkler: [number, string][]) {
  const d = g.createLinearGradient(0, 0, 0, h);
  renkler.forEach(([k, r]) => d.addColorStop(k, r));
  return d;
}

const CIZICILER: Record<ArkaPlanId, Cizici> = {
  gunbatimi(g, w, h) {
    g.fillStyle = dikey(g, h, [[0, '#2b2d6e'], [0.45, '#e2568a'], [0.75, '#ffb457'], [1, '#ffe29a']]);
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff3c4';
    g.beginPath();
    g.arc(w * 0.68, h * 0.62, w * 0.11, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#3a2a59';
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(0, h * 0.78);
    g.quadraticCurveTo(w * 0.25, h * 0.62, w * 0.5, h * 0.8);
    g.quadraticCurveTo(w * 0.78, h * 0.68, w, h * 0.78);
    g.lineTo(w, h);
    g.fill();
  },
  'gece-sehir'(g, w, h) {
    g.fillStyle = dikey(g, h, [[0, '#070b24'], [1, '#27316b']]);
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff';
    for (let i = 0; i < 60; i++) g.fillRect(((i * 97) % 100) / 100 * w, ((i * 53) % 55) / 100 * h, 3, 3);
    const bina = [0.1, 0.16, 0.12, 0.2, 0.14, 0.18, 0.1, 0.15];
    let x = 0;
    bina.forEach((bw, i) => {
      const bh = h * (0.28 + ((i * 37) % 30) / 100);
      g.fillStyle = '#10163a';
      g.fillRect(x * w, h - bh, bw * w + 2, bh);
      g.fillStyle = '#ffd86b';
      for (let yy = h - bh + 14; yy < h - 20; yy += 26)
        for (let xx = x * w + 10; xx < (x + bw) * w - 10; xx += 22) if ((xx + yy) % 3 > 0.9) g.fillRect(xx, yy, 8, 12);
      x += bw;
    });
  },
  orman(g, w, h) {
    g.fillStyle = dikey(g, h, [[0, '#a8e0ff'], [0.7, '#dff6d4']]);
    g.fillRect(0, 0, w, h);
    const agac = (cx: number, taban: number, boy: number, renk: string) => {
      g.fillStyle = '#6a4a2c';
      g.fillRect(cx - boy * 0.04, taban - boy * 0.15, boy * 0.08, boy * 0.15);
      g.fillStyle = renk;
      for (let k = 0; k < 3; k++) {
        const y0 = taban - boy * (0.15 + k * 0.27);
        g.beginPath();
        g.moveTo(cx, y0 - boy * 0.4);
        g.lineTo(cx - boy * 0.28 + k * boy * 0.04, y0);
        g.lineTo(cx + boy * 0.28 - k * boy * 0.04, y0);
        g.fill();
      }
    };
    [0.1, 0.32, 0.55, 0.78, 0.95].forEach((p, i) => agac(p * w, h * (0.78 + (i % 2) * 0.05), h * (0.5 + (i % 3) * 0.08), i % 2 ? '#2f8f4e' : '#237a3f'));
    g.fillStyle = '#6cbf5a';
    g.fillRect(0, h * 0.86, w, h * 0.14);
  },
  uzay(g, w, h) {
    g.fillStyle = dikey(g, h, [[0, '#04030f'], [1, '#1c0f3d']]);
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff';
    for (let i = 0; i < 140; i++) g.fillRect(((i * 61) % 100) / 100 * w, ((i * 29) % 100) / 100 * h, 1 + (i % 3), 1 + (i % 3));
    g.fillStyle = '#e9854d';
    g.beginPath();
    g.arc(w * 0.72, h * 0.3, w * 0.13, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#f7d6a0';
    g.lineWidth = 6;
    g.beginPath();
    g.ellipse(w * 0.72, h * 0.3, w * 0.2, w * 0.04, -0.3, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = '#4b3f8c';
    g.beginPath();
    g.arc(w * 0.2, h * 0.85, w * 0.28, Math.PI, 0);
    g.fill();
  },
  plaj(g, w, h) {
    g.fillStyle = dikey(g, h, [[0, '#7fd0ff'], [0.5, '#c8f0ff']]);
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffe36b';
    g.beginPath();
    g.arc(w * 0.82, h * 0.15, w * 0.08, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#2aa6c8';
    g.fillRect(0, h * 0.5, w, h * 0.22);
    g.fillStyle = '#f2d9a0';
    g.fillRect(0, h * 0.7, w, h * 0.3);
    g.strokeStyle = '#ffffff';
    g.lineWidth = 5;
    g.beginPath();
    for (let x = 0; x <= w; x += 20) g.lineTo(x, h * 0.7 + Math.sin(x / 26) * 5);
    g.stroke();
  },
};

/** Çerçevenin iç oranında (en/boy) bir tuval çizer. */
export function arkaPlanTuvali(id: ArkaPlanId, oran: number): HTMLCanvasElement {
  const tuval = document.createElement('canvas');
  tuval.width = 1024;
  tuval.height = Math.round(1024 / oran);
  const g = tuval.getContext('2d');
  if (g) CIZICILER[id](g, tuval.width, tuval.height);
  return tuval;
}

/** Seçim düğmesindeki küçük önizleme için aynı çizim, CSS'e uygun adres olarak. */
export function arkaPlanOnizleme(id: ArkaPlanId): string {
  return arkaPlanTuvali(id, 1).toDataURL('image/jpeg', 0.6);
}
