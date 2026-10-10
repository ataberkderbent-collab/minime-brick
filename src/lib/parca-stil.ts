// Yüz ve saç kodlarının 3B çizim için sınıflandırması (Shopier görsellerine bakılarak elle girildi).
// Yüz: yüksek çözünürlüklü doku kodla çizilir (yuz-ciz.ts); saç: geometri sınıfı (Figur.tsx), renk görselden.

export type Goz = 'normal' | 'kirpik' | 'kirp' | 'kapali' | 'gozluk' | 'yuvarlak-gozluk' | 'gunes' | 'endise';
export type Agiz = 'gulumse' | 'sirit' | 'duz' | 'acik' | 'yan' | 'uzgun' | 'dalgali';
export type Sakal = 'yok' | 'biyik' | 'kecisakal' | 'tam' | 'kirli' | 'tam-biyik';

export interface YuzStili {
  goz: Goz;
  agiz: Agiz;
  sakal?: Sakal;
  sakalRenk?: string;
  gozlukRenk?: string;
  ruj?: string;
  /** Kaş kalınlığı: 1 ince, 2 normal, 3 kalın */
  kas?: 1 | 2 | 3;
  cil?: boolean;
  yanak?: boolean;
  kel?: boolean;
  /** Ten rengi (varsayılan Lego sarısı) */
  ten?: string;
}

const g = (goz: Goz, agiz: Agiz, ek: Partial<YuzStili> = {}): YuzStili => ({ goz, agiz, ...ek });
const K = '#1c1c1c';

export const YUZLER: Record<string, YuzStili> = {
  'C-Y1': g('normal', 'gulumse', { cil: true }),
  'C-Y2': g('normal', 'gulumse', { cil: true }),
  'C-Y3': g('normal', 'sirit', { cil: true }),
  'C-Y4': g('normal', 'sirit', { cil: true }),
  'C-Y5': g('normal', 'sirit'),
  'C-Y6': g('yuvarlak-gozluk', 'gulumse', { gozlukRenk: '#c0392b' }),
  'C-Y7': g('endise', 'dalgali', { cil: true }),
  'C-Y8': g('endise', 'uzgun', { cil: true }),
  'E-Y1': g('normal', 'gulumse', { kas: 3 }),
  'E-Y2': g('normal', 'yan', { kas: 2 }),
  'E-Y3': g('normal', 'gulumse'),
  'E-Y4': g('endise', 'duz', { yanak: true }),
  'E-Y5': g('normal', 'gulumse', { sakal: 'biyik', sakalRenk: '#5a3b1e' }),
  'E-Y6': g('normal', 'sirit', { kas: 3 }),
  'E-Y7': g('normal', 'sirit'),
  'E-Y8': g('normal', 'gulumse', { kas: 3 }),
  'E-Y9': g('normal', 'yan', { kas: 3 }),
  'E-Y10': g('normal', 'gulumse'),
  'E-Y11': g('normal', 'yan'),
  'E-Y12': g('kirp', 'yan'),
  'E-Y13': g('normal', 'gulumse'),
  'E-Y14': g('normal', 'gulumse'),
  'E-Y15': g('normal', 'sirit', { kas: 3 }),
  'E-Y16': g('normal', 'duz', { sakal: 'kecisakal', sakalRenk: '#3d2a16', kas: 3 }),
  'E-Y17': g('normal', 'acik', { sakal: 'tam-biyik', sakalRenk: '#7a3b1e' }),
  'E-Y18': g('normal', 'sirit', { sakal: 'tam', sakalRenk: '#d2691e' }),
  'E-Y19': g('normal', 'sirit', { sakal: 'tam-biyik', sakalRenk: '#2a2420' }),
  'E-Y20': g('gozluk', 'gulumse', { sakal: 'tam', sakalRenk: '#8a8a8a', gozlukRenk: K }),
  'E-Y21': g('gozluk', 'gulumse', { sakal: 'tam-biyik', sakalRenk: '#b5451b', gozlukRenk: '#7a3b1e' }),
  'E-Y22': g('yuvarlak-gozluk', 'gulumse', { gozlukRenk: K }),
  'E-Y23': g('gozluk', 'gulumse', { gozlukRenk: K }),
  'E-Y24': g('gunes', 'gulumse'),
  'E-Y25': g('gunes', 'sirit'),
  'E-Y26': g('normal', 'duz', { kel: true }),
  'E-Y27': g('gozluk', 'duz', { sakal: 'kirli', sakalRenk: '#3a3a3a', gozlukRenk: K }),
  'K-Y1': g('kirpik', 'gulumse'),
  'K-Y2': g('kirpik', 'gulumse', { ruj: '#e0457b' }),
  'K-Y3': g('kirpik', 'gulumse', { ruj: '#e86aa6' }),
  'K-Y4': g('kirpik', 'gulumse', { ruj: '#d8262c' }),
  'K-Y5': g('kirpik', 'sirit', { ruj: '#d8262c', kas: 2 }),
  'K-Y6': g('kirpik', 'sirit', { ruj: '#e86aa6' }),
  'K-Y7': g('kirpik', 'yan', { ruj: '#c0392b', ten: '#e8a24c' }),
  'K-Y8': g('kirpik', 'gulumse', { ruj: '#d8262c' }),
  'K-Y9': g('kirpik', 'gulumse', { ruj: '#c0392b' }),
  'K-Y10': g('kapali', 'gulumse'),
  'K-Y11': g('kirpik', 'gulumse', { ruj: '#d8262c', kas: 2 }),
  'K-Y12': g('kapali', 'acik', { ruj: '#d8262c' }),
  'K-Y13': g('kirpik', 'yan', { kas: 3 }),
  'K-Y14': g('gozluk', 'gulumse', { gozlukRenk: K }),
  'K-Y15': g('gunes', 'sirit', { gozlukRenk: '#e86aa6', ruj: '#e0457b' }),
  'K-Y16': g('kirpik', 'gulumse'),
  'K-Y17': g('kirpik', 'sirit', { ruj: '#d8262c', kas: 3 }),
  'K-Y18': g('kirpik', 'gulumse', { ruj: '#c0392b' }),
};

export function yuzStili(kod: string): YuzStili {
  return YUZLER[kod] ?? (kod.startsWith('K-') ? g('kirpik', 'gulumse') : g('normal', 'gulumse'));
}

export type SacSinifi =
  | 'kisa' // kısa, düzgün kapak
  | 'kisa-dalgali' // kısa, dalgalı / dağınık
  | 'dik' // dik, tarak
  | 'orta' // kulakları örten orta boy
  | 'orta-dalgali'
  | 'bob' // çene hizası küt
  | 'bob-kakul' // küt + düz kâkül
  | 'uzun' // omuzları geçen düz
  | 'uzun-dalgali'
  | 'kuyruk' // at kuyruğu
  | 'yan-kuyruk'
  | 'topuz'
  | 'ikili-topuz'
  | 'afro'
  | 'orgu'
  | 'sapka';

const E: Record<number, SacSinifi> = {
  1: 'kisa', 2: 'kisa', 3: 'kisa-dalgali', 4: 'dik', 5: 'kisa', 6: 'kisa-dalgali', 7: 'kisa', 8: 'kisa', 9: 'kisa', 10: 'orta', 11: 'orta', 12: 'topuz',
  13: 'orta-dalgali', 14: 'kisa', 15: 'kisa', 16: 'kisa', 17: 'kisa', 18: 'dik', 19: 'dik', 20: 'kisa', 21: 'orta-dalgali', 22: 'orta', 23: 'kuyruk', 24: 'kisa',
  25: 'kisa', 26: 'kisa', 27: 'dik', 28: 'kisa', 29: 'kisa-dalgali', 30: 'kisa', 31: 'kisa', 32: 'orta-dalgali', 33: 'dik', 34: 'kisa', 35: 'kisa', 36: 'kisa',
  37: 'orta-dalgali', 38: 'orta', 39: 'kisa-dalgali', 40: 'dik', 41: 'kisa', 42: 'kisa', 43: 'kisa', 44: 'kisa', 45: 'kisa', 46: 'sapka', 47: 'sapka', 48: 'sapka',
};
const Kd: Record<number, SacSinifi> = {
  1: 'bob-kakul', 2: 'bob', 3: 'bob-kakul', 4: 'topuz', 5: 'kuyruk', 6: 'uzun', 7: 'uzun', 8: 'uzun-dalgali', 9: 'uzun-dalgali', 10: 'uzun', 11: 'orgu', 12: 'kuyruk',
  13: 'afro', 14: 'bob', 15: 'ikili-topuz', 16: 'orta-dalgali', 17: 'topuz', 18: 'ikili-topuz', 19: 'orta-dalgali', 20: 'bob-kakul', 21: 'ikili-topuz', 22: 'uzun',
  23: 'uzun-dalgali', 24: 'uzun-dalgali', 25: 'uzun-dalgali', 26: 'orgu', 27: 'orta-dalgali', 28: 'yan-kuyruk', 29: 'orta-dalgali', 30: 'uzun-dalgali', 31: 'orta-dalgali',
  32: 'uzun-dalgali', 33: 'uzun-dalgali', 34: 'uzun', 35: 'uzun', 36: 'kuyruk', 37: 'bob', 38: 'orta-dalgali', 39: 'uzun', 40: 'uzun', 41: 'uzun-dalgali', 42: 'orta-dalgali',
  43: 'bob', 44: 'bob', 45: 'orta-dalgali', 46: 'uzun-dalgali', 47: 'uzun-dalgali', 48: 'uzun', 49: 'uzun', 50: 'uzun', 51: 'uzun', 52: 'uzun-dalgali', 53: 'orta-dalgali',
  54: 'kuyruk', 55: 'uzun-dalgali', 56: 'bob-kakul', 57: 'uzun', 58: 'uzun-dalgali', 59: 'kuyruk', 60: 'uzun-dalgali', 61: 'uzun-dalgali', 62: 'orta-dalgali', 63: 'uzun',
};

export function sacSinifi(kod: string): SacSinifi {
  const n = parseInt(kod.replace(/\D+/g, ''), 10);
  if (kod.startsWith('E-')) return E[n] ?? 'kisa';
  return Kd[n] ?? 'uzun';
}
