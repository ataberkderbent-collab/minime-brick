// Katalog ve ölçü ayarları. "TASLAK" yazan sayılar gerçek verilerle değiştirilecek.
// Birim: santimetre (3B sahnede 1 birim = 1 cm).
//
// Ürün: IKEA tipi derin bir çerçevenin içinde, paspartunun açıklığında BASKILI bir kart;
// figürler kartın üstüne yapıştırılır, isimler ve yazılar kartın üzerine basılır.

import { PARCA_VERISI, type ParcaGorsel, type ParcaKategori } from './parca-verisi';

export type { ParcaKategori };

// ───────────────────────── Çerçeve ─────────────────────────

export type CerceveId = 'kucuk' | 'orta' | 'buyuk';

export interface Cerceve {
  id: CerceveId;
  ad: string;
  /** Çerçevenin dış ölçüsü (cm) */
  disEn: number;
  disBoy: number;
  /** Kenar kalınlığı (cm); iç ölçü = dış ölçü − 2 × kenar */
  kenar: number;
  /** İç derinlik (cm): kartla cam arasındaki boşluk, figürler burada durur */
  derinlik: number;
  /** Baskılı kartın ölçüsü (cm); paspartu açıklığı. İç ölçüden küçükse fark paspartudur */
  baskiEn: number;
  baskiBoy: number;
  /** Baskı için en düşük / önerilen çözünürlük (inç başına nokta) */
  enDusukDpi: number;
  onerilenDpi: number;
}

// TASLAK: IKEA RIBBA benzeri tahmin; gerçek model ve ölçüler gelince değişir.
export const CERCEVELER: Cerceve[] = [
  { id: 'kucuk', ad: 'Küçük', disEn: 23, disBoy: 23, kenar: 2, derinlik: 4.5, baskiEn: 13, baskiBoy: 13, enDusukDpi: 150, onerilenDpi: 300 },
  { id: 'orta', ad: 'Orta', disEn: 30, disBoy: 40, kenar: 2, derinlik: 4.5, baskiEn: 21, baskiBoy: 30, enDusukDpi: 150, onerilenDpi: 300 },
  { id: 'buyuk', ad: 'Büyük', disEn: 50, disBoy: 70, kenar: 2.5, derinlik: 4.5, baskiEn: 30, baskiBoy: 40, enDusukDpi: 120, onerilenDpi: 200 },
];

export function cerceveBul(id: CerceveId): Cerceve {
  return CERCEVELER.find((c) => c.id === id) ?? CERCEVELER[0];
}

export function icOlcu(c: Cerceve) {
  return { en: c.disEn - 2 * c.kenar, boy: c.disBoy - 2 * c.kenar };
}

export function baskiOlcu(c: Cerceve) {
  return { en: c.baskiEn, boy: c.baskiBoy };
}

export type CerceveRengiId = 'beyaz' | 'siyah' | 'ahsap';

export const CERCEVE_RENKLERI: { id: CerceveRengiId; ad: string; renk: string }[] = [
  { id: 'beyaz', ad: 'Beyaz', renk: '#f3f0e8' },
  { id: 'siyah', ad: 'Siyah', renk: '#26262a' },
  { id: 'ahsap', ad: 'Ahşap', renk: '#d9b98a' },
];

/** Bir figürün (kollarıyla) kartta kaplayacağı yaklaşık genişlik (cm). Çerçeveye sığan sayıyı belirler. */
export const FIGUR_YER = 3.5;

export function enFazlaFigur(c: Cerceve): number {
  return Math.max(1, Math.floor(c.baskiEn / FIGUR_YER));
}

/** Figürlerin kartta duracağı yerler (cm; kartın merkezi 0,0). Sahne ve baskı yazıları aynı yeri kullanır. */
export function yerlesim(c: Cerceve, adet: number) {
  const aralik = Math.min(c.baskiEn / adet, 5.4);
  const xler = Array.from({ length: adet }, (_, i) => (i - (adet - 1) / 2) * aralik);
  const ayakY = -1.4; // figürün alt kenarı
  return { xler, aralik, ayakY, isimY: ayakY - 1.0, basYuksekligi: 4 };
}

/** Baskı için gereken piksel */
export function gerekenPiksel(c: Cerceve, dpi: number) {
  return { en: Math.round((c.baskiEn / 2.54) * dpi), boy: Math.round((c.baskiBoy / 2.54) * dpi) };
}

// ───────────────────────── Parçalar ─────────────────────────
// Kaynak: Shopier ürün sayfasındaki parça listeleri (araclar/parca-kes.py ile kesildi).
// K = kadın, E = erkek, C = çocuk; Y = yüz, S = saç, T = üst, L = alt, A = aksesuar.

export type ParcaGrubu = 'kadin' | 'erkek' | 'cocuk' | 'ortak';

export interface Parca extends ParcaGorsel {
  grup: ParcaGrubu;
  /** Eldeki adet (TASLAK: sayfada yalnız "tükendi" işareti var; yönetici ekranı gelince gerçek adet) */
  stok: number;
  /** Küçük resim adresi */
  gorsel: string;
}

/** Sayfada üstü çarpı (X) ile işaretli = stokta yok */
const TUKENDI = new Set(['K-Y16', 'E-Y13', 'E-Y14', 'K-S22', 'K-S35', 'K-S48', 'K-S49', 'T3', 'T4', 'T17', 'T23', 'T65', 'L16', 'A26', 'A41']);
/** TASLAK: gerçek adetler girilene kadar her stoklu parçadan bu kadar var sayılır */
const ORNEK_STOK = 5;

function grupBul(kod: string): ParcaGrubu {
  if (kod.startsWith('K-')) return 'kadin';
  if (kod.startsWith('E-')) return 'erkek';
  if (kod.startsWith('C-')) return 'cocuk';
  return 'ortak';
}

export const PARCALAR: Parca[] = PARCA_VERISI.map((p) => ({
  ...p,
  grup: grupBul(p.kod),
  stok: TUKENDI.has(p.kod) ? 0 : ORNEK_STOK,
  gorsel: `${process.env.NEXT_PUBLIC_TABAN ?? ''}/parcalar/${p.kategori}/${p.kod}.png`,
}));

const PARCA_HARITASI = new Map(PARCALAR.map((p) => [p.kod, p]));

export function parcaBul(kod: string | null | undefined): Parca | undefined {
  return kod ? PARCA_HARITASI.get(kod) : undefined;
}

export type Cinsiyet = 'kadin' | 'erkek' | 'cocuk';

/** Seçili cinsiyet için listelenecek parçalar */
export function parcaListesi(kategori: ParcaKategori, cinsiyet: Cinsiyet): Parca[] {
  return PARCALAR.filter((p) => {
    if (p.kategori !== kategori) return false;
    if (kategori === 'yuz') return p.grup === cinsiyet;
    if (kategori === 'sac') return cinsiyet === 'cocuk' ? true : p.grup === cinsiyet;
    return true;
  });
}

export const KATEGORI_ADLARI: Record<ParcaKategori, string> = {
  yuz: 'Yüz',
  sac: 'Saç',
  ust: 'Üst',
  alt: 'Alt',
  aksesuar: 'Aksesuar',
};

export type SacStili = 'kisa' | 'uzun' | 'topuz' | 'sapka';

/**
 * 3B modelde saçın biçimi. Yer tutucu sınıflandırma (gerçek 3B parça modelleri gelince
 * her kod kendi modeliyle çizilir); renk görselden otomatik gelir.
 */
export function sacStili(kod: string): SacStili {
  if (['E-S46', 'E-S47', 'E-S48'].includes(kod)) return 'sapka';
  if (['K-S4', 'K-S13', 'K-S15', 'K-S17', 'K-S18', 'K-S21'].includes(kod)) return 'topuz';
  if (kod.startsWith('K-')) return ['K-S1', 'K-S2', 'K-S3', 'K-S9'].includes(kod) ? 'kisa' : 'uzun';
  return 'kisa';
}

// ───────────────────────── Hayvanlar ─────────────────────────

export type HayvanTuru = 'kopek' | 'kedi';

export interface Hayvan {
  id: string;
  ad: string;
  tur: HayvanTuru;
  renk: { govde: string; alt: string; sac: string };
  /** TASLAK: yer tutucu hayvanlar; Shopier'daki gerçek hayvan parçaları gelince değişir */
  stok: number;
}

export const HAYVANLAR: Hayvan[] = [
  { id: 'kopek-kahve', ad: 'Köpek · Kahverengi', tur: 'kopek', renk: { govde: '#b97a45', alt: '#8a5a30', sac: '#3a2414' }, stok: 5 },
  { id: 'kopek-siyah', ad: 'Köpek · Siyah', tur: 'kopek', renk: { govde: '#2b2b2f', alt: '#1b1b1e', sac: '#101012' }, stok: 5 },
  { id: 'kopek-beyaz', ad: 'Köpek · Beyaz', tur: 'kopek', renk: { govde: '#f1eee8', alt: '#d8d3c8', sac: '#8a8478' }, stok: 5 },
  { id: 'kedi-gri', ad: 'Kedi · Gri', tur: 'kedi', renk: { govde: '#8f9aa6', alt: '#6c7782', sac: '#2b2b2b' }, stok: 5 },
  { id: 'kedi-siyah', ad: 'Kedi · Siyah', tur: 'kedi', renk: { govde: '#2b2b2f', alt: '#1b1b1e', sac: '#101012' }, stok: 5 },
  { id: 'kedi-turuncu', ad: 'Kedi · Turuncu', tur: 'kedi', renk: { govde: '#e8913d', alt: '#c9722a', sac: '#7a4a1c' }, stok: 5 },
];

export function hayvanBul(id: string | null | undefined): Hayvan | undefined {
  return HAYVANLAR.find((h) => h.id === id);
}

// ───────────────────────── Figür seçimi ─────────────────────────

export interface KisiSecimi {
  tur: 'kisi';
  cinsiyet: Cinsiyet;
  yuz: string | null;
  sac: string | null;
  ust: string | null;
  alt: string | null;
  aksesuar: string | null;
  /** Figürün altına basılacak isim (isteğe bağlı) */
  isim: string;
}

export interface HayvanSecimi {
  tur: 'hayvan';
  hayvan: string | null;
  isim: string;
}

export type FigurSecimi = KisiSecimi | HayvanSecimi;

export function bosKisi(cinsiyet: Cinsiyet): KisiSecimi {
  return { tur: 'kisi', cinsiyet, yuz: null, sac: null, ust: null, alt: null, aksesuar: null, isim: '' };
}

/** Bir kişi figürü tamam mı: yüz, üst ve alt zorunlu; saç ve aksesuar isteğe bağlı. */
export function eksikler(f: FigurSecimi): string[] {
  if (f.tur === 'hayvan') return f.hayvan ? [] : ['hayvan'];
  const e: string[] = [];
  if (!f.yuz) e.push('yüz');
  if (!f.ust) e.push('üst');
  if (!f.alt) e.push('alt');
  return e;
}

/** Figürlerin kullandığı parça kodları (hayvanlar dahil): kod → kaç figürde */
export function kullanimSayilari(figurler: FigurSecimi[]): Record<string, number> {
  const s: Record<string, number> = {};
  const say = (k: string | null) => {
    if (k) s[k] = (s[k] ?? 0) + 1;
  };
  for (const f of figurler) {
    if (f.tur === 'hayvan') say(f.hayvan);
    else [f.yuz, f.sac, f.ust, f.alt, f.aksesuar].forEach(say);
  }
  return s;
}

export function stokBul(kod: string): number {
  return parcaBul(kod)?.stok ?? hayvanBul(kod)?.stok ?? 0;
}

/** Kodları sipariş için tek satır olarak yazar: "K-Y3 · K-S12 · T5 · L2 · A4" */
export function kodSatiri(f: FigurSecimi): string {
  if (f.tur === 'hayvan') return f.hayvan ?? '—';
  return [f.yuz, f.sac, f.ust, f.alt, f.aksesuar].filter(Boolean).join(' · ') || '—';
}

export function figurAdi(f: FigurSecimi): string {
  if (f.tur === 'hayvan') return hayvanBul(f.hayvan)?.ad ?? 'Hayvan';
  return { kadin: 'Kadın', erkek: 'Erkek', cocuk: 'Çocuk' }[f.cinsiyet];
}

// ───────────────────────── Baskılı kart tasarımları ─────────────────────────

export type KartId = 'sade-beyaz' | 'pembe-damali' | 'gokyuzu' | 'siyah-sik';

export interface HazirKart {
  id: KartId;
  ad: string;
}

/** Şimdilik kodla çizilen yer tutucular; gerçek kart tasarımları gelince görsel dosyası olur. */
export const KARTLAR: HazirKart[] = [
  { id: 'sade-beyaz', ad: 'Sade Beyaz' },
  { id: 'pembe-damali', ad: 'Pembe Damalı' },
  { id: 'gokyuzu', ad: 'Gökyüzü' },
  { id: 'siyah-sik', ad: 'Siyah Şık' },
];

// ───────────────────────── Hazır şablonlar ─────────────────────────

export interface Sablon {
  id: string;
  ad: string;
  aciklama: string;
  cerceve: CerceveId;
  cerceveRengi: CerceveRengiId;
  kart: KartId;
  baslik: string;
  altYazi: string;
  figurler: FigurSecimi[];
}

const kisi = (cinsiyet: Cinsiyet, yuz: string, sac: string | null, ust: string, alt: string, isim: string, aksesuar: string | null = null): KisiSecimi => ({
  tur: 'kisi',
  cinsiyet,
  yuz,
  sac,
  ust,
  alt,
  aksesuar,
  isim,
});

/** Eski siparişlerden derlenecek hazır tasarımlar (şimdilik örnek). */
export const SABLONLAR: Sablon[] = [
  {
    id: 'mr-mrs',
    ad: 'Mr. & Mrs.',
    aciklama: 'Çift ve patili dostları',
    cerceve: 'orta',
    cerceveRengi: 'beyaz',
    kart: 'sade-beyaz',
    baslik: 'Mr. & Mrs.',
    altYazi: 'Just us — with extra tail wagging',
    figurler: [kisi('erkek', 'E-Y6', 'E-S21', 'T29', 'L2', 'Arda'), { tur: 'hayvan', hayvan: 'kopek-siyah', isim: 'Duru' }, kisi('kadin', 'K-Y5', 'K-S44', 'T36', 'L17', 'Büşra')],
  },
  {
    id: 'bff',
    ad: 'Best Friend',
    aciklama: 'İki arkadaş',
    cerceve: 'orta',
    cerceveRengi: 'ahsap',
    kart: 'pembe-damali',
    baslik: 'Best Friend Forever',
    altYazi: 'Side by side or miles apart',
    figurler: [kisi('kadin', 'K-Y3', 'K-S25', 'T28', 'L3', 'Defne', 'A3'), kisi('kadin', 'K-Y9', 'K-S28', 'T28', 'L3', 'Gökçe', 'A3')],
  },
  {
    id: 'kiz-grubu',
    ad: 'Kız Grubu',
    aciklama: 'Beş arkadaş',
    cerceve: 'buyuk',
    cerceveRengi: 'siyah',
    kart: 'gokyuzu',
    baslik: 'Çok parti çok iş',
    altYazi: '17 years and counting',
    figurler: [
      kisi('kadin', 'K-Y1', 'K-S44', 'T36', 'L18', 'Ebru'),
      kisi('kadin', 'K-Y4', 'K-S10', 'T52', 'L1', 'Bino'),
      kisi('kadin', 'K-Y6', 'K-S21', 'T44', 'L17', 'İpek'),
      kisi('kadin', 'K-Y8', 'K-S55', 'T61', 'L1', 'Defin'),
      kisi('kadin', 'K-Y13', 'K-S28', 'T66', 'L5', 'Begüm'),
    ],
  },
];
