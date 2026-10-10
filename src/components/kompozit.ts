import { type FigurSecimi, type KartId, hayvanBul, parcaBul, yerlesim, type Cerceve } from '@/lib/katalog';
import { kartTuvali } from './arkaplan';

// 2B kompozit: kart tuvalinin üstüne parça görsellerini (alt → üst → yüz → saç) yığarak
// bitmiş çerçevenin küçük önizlemesini çizer. Şablon galerisi ve paylaşım görseli için;
// 3B sahne kadar doğru değil ama WebGL istemez.

const gorselOnbellek = new Map<string, Promise<HTMLImageElement>>();

function gorselYukle(src: string): Promise<HTMLImageElement> {
  let p = gorselOnbellek.get(src);
  if (!p) {
    p = new Promise((cozul, reddet) => {
      const img = new Image();
      img.onload = () => cozul(img);
      img.onerror = reddet;
      img.src = src;
    });
    gorselOnbellek.set(src, p);
  }
  return p;
}

/** Parçanın görselini `genislik` piksele oranla çizer; alt-orta noktası (x, taban) */
async function parcaCiz(g: CanvasRenderingContext2D, kod: string | null | undefined, x: number, taban: number, genislik: number) {
  const p = parcaBul(kod);
  if (!p) return 0;
  const img = await gorselYukle(p.gorsel);
  const h = (genislik * img.height) / img.width;
  g.drawImage(img, x - genislik / 2, taban - h, genislik, h);
  return h;
}

async function hayvanCiz(g: CanvasRenderingContext2D, id: string | null, x: number, taban: number, boy: number) {
  const h = hayvanBul(id);
  if (!h) return;
  // Basit siluet: gövde + baş + kulaklar (gerçek hayvan parçası gelince görseli çizilir)
  g.fillStyle = h.renk.govde;
  const gw = boy * 1.2;
  g.beginPath();
  g.roundRect(x - gw / 2, taban - boy * 0.55, gw, boy * 0.4, boy * 0.12);
  g.fill();
  g.beginPath();
  g.roundRect(x + gw * 0.2, taban - boy * 0.95, boy * 0.45, boy * 0.45, boy * 0.1);
  g.fill();
  g.fillStyle = h.renk.alt;
  for (const dx of [-gw * 0.35, -gw * 0.15, gw * 0.1, gw * 0.3]) g.fillRect(x + dx, taban - boy * 0.2, boy * 0.12, boy * 0.2);
  g.fillStyle = h.renk.sac;
  g.fillRect(x + gw * 0.22, taban - boy * 1.1, boy * 0.1, boy * 0.18);
  g.fillRect(x + gw * 0.5, taban - boy * 1.1, boy * 0.1, boy * 0.18);
}

export interface KompozitGirdi {
  cerceve: Cerceve;
  kart: KartId;
  baslik: string;
  altYazi: string;
  figurler: FigurSecimi[];
}

/** Baskı alanı oranında tuval; kart + figürler. Genişlik 1024 px. */
export async function kompozitCiz({ cerceve, kart, baslik, altYazi, figurler }: KompozitGirdi): Promise<HTMLCanvasElement> {
  const yer = yerlesim(cerceve, figurler.length);
  const tuval = kartTuvali(kart, {
    baslik,
    altYazi,
    baskiEn: cerceve.baskiEn,
    baskiBoy: cerceve.baskiBoy,
    isimler: figurler.map((f, i) => ({ x: yer.xler[i], y: yer.isimY, metin: f.isim })),
  });
  const g = tuval.getContext('2d');
  if (!g) return tuval;
  const cm = tuval.width / cerceve.baskiEn;
  const taban = tuval.height / 2 - yer.ayakY * cm;
  const boy = yer.basYuksekligi * cm;
  g.shadowColor = 'rgba(0,0,0,0.35)';
  g.shadowBlur = cm * 0.6;
  g.shadowOffsetY = cm * 0.3;
  for (let i = 0; i < figurler.length; i++) {
    const f = figurler[i];
    const x = tuval.width / 2 + yer.xler[i] * cm;
    if (f.tur === 'hayvan') {
      await hayvanCiz(g, f.hayvan, x, taban, boy * 0.6);
      continue;
    }
    const olcek = f.cinsiyet === 'cocuk' ? 0.82 : 1;
    const torsoW = boy * 0.62 * olcek;
    const altH = await parcaCiz(g, f.alt, x, taban, torsoW * 0.62);
    const ustH = await parcaCiz(g, f.ust, x, taban - altH + torsoW * 0.04, torsoW);
    const basTaban = taban - altH - ustH + torsoW * 0.1;
    const basH = await parcaCiz(g, f.yuz, x, basTaban, torsoW * 0.5);
    await parcaCiz(g, f.sac, x, basTaban - basH + torsoW * 0.26, torsoW * 0.6);
    if (f.aksesuar) await parcaCiz(g, f.aksesuar, x + torsoW * 0.72, taban - altH * 0.2, torsoW * 0.42);
  }
  g.shadowColor = 'transparent';
  return tuval;
}
