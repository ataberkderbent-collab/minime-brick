// Katalog ve ölçü ayarları. TÜM sayılar TASLAK: gerçek IKEA çerçeve ölçüleri,
// stoklar ve figür listesi netleşince yalnız bu dosya değişir.
// Birim: santimetre (3B sahnede 1 birim = 1 cm).

export type CerceveId = 'kucuk' | 'orta' | 'buyuk';

export interface Cerceve {
  id: CerceveId;
  ad: string;
  /** Çerçevenin dış ölçüsü (cm) */
  disEn: number;
  disBoy: number;
  /** Kenar kalınlığı (cm); iç ölçü = dış ölçü − 2 × kenar */
  kenar: number;
  /** Figürlerin durduğu iç derinlik (cm) */
  derinlik: number;
  /** Arka tasarım baskısı için en düşük çözünürlük (inç başına nokta) */
  enDusukDpi: number;
  /** Önerilen çözünürlük */
  onerilenDpi: number;
}

export const CERCEVELER: Cerceve[] = [
  { id: 'kucuk', ad: 'Küçük', disEn: 23, disBoy: 23, kenar: 2, derinlik: 4.5, enDusukDpi: 150, onerilenDpi: 300 },
  { id: 'orta', ad: 'Orta', disEn: 30, disBoy: 40, kenar: 2, derinlik: 4.5, enDusukDpi: 150, onerilenDpi: 300 },
  { id: 'buyuk', ad: 'Büyük', disEn: 50, disBoy: 70, kenar: 2.5, derinlik: 4.5, enDusukDpi: 120, onerilenDpi: 200 },
];

export function cerceveBul(id: CerceveId): Cerceve {
  return CERCEVELER.find((c) => c.id === id) ?? CERCEVELER[0];
}

export function icOlcu(c: Cerceve) {
  return { en: c.disEn - 2 * c.kenar, boy: c.disBoy - 2 * c.kenar };
}

/** Bir figürün yer kaplayacağı en az genişlik (cm); çerçeveye sığan figür sayısını belirler */
export const FIGUR_YER = 3.6;

export function enFazlaFigur(c: Cerceve): number {
  return Math.max(1, Math.floor(icOlcu(c).en / FIGUR_YER));
}

/** Arka tasarım için gereken piksel (enDusukDpi ve onerilenDpi'ye göre) */
export function gerekenPiksel(c: Cerceve, dpi: number) {
  const { en, boy } = icOlcu(c);
  return { en: Math.round((en / 2.54) * dpi), boy: Math.round((boy / 2.54) * dpi) };
}

export type FigurTuru = 'erkek' | 'kadin' | 'cocuk' | 'kopek' | 'kedi';

export interface Figur {
  id: string;
  ad: string;
  tur: FigurTuru;
  renk: { govde: string; alt: string; sac: string };
  /** Eldeki adet. Yönetici ekranı gelince veritabanından okunur. */
  stok: number;
}

export const FIGURLER: Figur[] = [
  { id: 'erkek-mavi', ad: 'Erkek · Mavi', tur: 'erkek', renk: { govde: '#2d6cdf', alt: '#27324a', sac: '#4a2f1d' }, stok: 12 },
  { id: 'erkek-kirmizi', ad: 'Erkek · Kırmızı', tur: 'erkek', renk: { govde: '#d6402b', alt: '#2b2b2b', sac: '#1d1d1d' }, stok: 8 },
  { id: 'kadin-pembe', ad: 'Kadın · Pembe', tur: 'kadin', renk: { govde: '#e86aa6', alt: '#7a3a8f', sac: '#6b3a1f' }, stok: 10 },
  { id: 'kadin-sari', ad: 'Kadın · Sarı', tur: 'kadin', renk: { govde: '#ffc93c', alt: '#3b5a3a', sac: '#d9a441' }, stok: 6 },
  { id: 'cocuk', ad: 'Çocuk', tur: 'cocuk', renk: { govde: '#35b36b', alt: '#2d6cdf', sac: '#4a2f1d' }, stok: 9 },
  { id: 'kopek', ad: 'Köpek', tur: 'kopek', renk: { govde: '#b97a45', alt: '#8a5a30', sac: '#3a2414' }, stok: 7 },
  { id: 'kedi', ad: 'Kedi', tur: 'kedi', renk: { govde: '#8f9aa6', alt: '#6c7782', sac: '#2b2b2b' }, stok: 5 },
];

export function figurBul(id: string): Figur | undefined {
  return FIGURLER.find((f) => f.id === id);
}

export type ArkaPlanId = 'gunbatimi' | 'gece-sehir' | 'orman' | 'uzay' | 'plaj';

export interface HazirArkaPlan {
  id: ArkaPlanId;
  ad: string;
}

/** Şimdilik kodla çizilen yer tutucular; gerçek tasarımlar gelince görsel dosyası olur. */
export const ARKA_PLANLAR: HazirArkaPlan[] = [
  { id: 'gunbatimi', ad: 'Gün Batımı' },
  { id: 'gece-sehir', ad: 'Gece Şehir' },
  { id: 'orman', ad: 'Orman' },
  { id: 'uzay', ad: 'Uzay' },
  { id: 'plaj', ad: 'Plaj' },
];

export interface Sablon {
  id: string;
  ad: string;
  aciklama: string;
  cerceve: CerceveId;
  figurler: string[];
  arkaPlan: ArkaPlanId;
}

/** Eski siparişlerden derlenecek hazır tasarımlar (şimdilik örnek). */
export const SABLONLAR: Sablon[] = [
  { id: 'aile', ad: 'Aile Portresi', aciklama: 'Anne, baba, çocuk ve köpek', cerceve: 'orta', figurler: ['erkek-mavi', 'kadin-pembe', 'cocuk', 'kopek'], arkaPlan: 'gunbatimi' },
  { id: 'gece', ad: 'Gece Yürüyüşü', aciklama: 'Bir kişi ve köpeği', cerceve: 'kucuk', figurler: ['erkek-kirmizi', 'kopek'], arkaPlan: 'gece-sehir' },
  { id: 'orman', ad: 'Orman Macerası', aciklama: 'Çocuk, kedi ve köpek dostları', cerceve: 'buyuk', figurler: ['kadin-sari', 'cocuk', 'kedi', 'kopek'], arkaPlan: 'orman' },
];
