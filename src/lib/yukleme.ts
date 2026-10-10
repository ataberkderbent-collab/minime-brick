import { type Cerceve, baskiOlcu, gerekenPiksel } from './katalog';

export const IZINLI_TURLER = ['image/jpeg', 'image/png', 'image/webp'];
export const EN_BUYUK_DOSYA_MB = 25;
/** Fotoğrafın en/boy oranı çerçeveninkinden en fazla bu kadar sapabilir (kırpma payı). */
export const ORAN_SAPMASI = 0.25;

export interface YuklemeSonucu {
  uygun: boolean;
  /** Kullanıcıya gösterilecek açıklama */
  mesaj: string;
  genislik: number;
  yukseklik: number;
  /** Çerçeveye oturtulunca (kırpıldıktan sonra) baskı çözünürlüğü, dpi */
  dpi: number;
}

/**
 * Yüklenen baskı tasarımı, seçili çerçevenin baskı alanı için yeterli mi?
 * Fotoğraf baskı alanını dolduracak biçimde ortadan kırpılır; kırpılmış bölgenin
 * çözünürlüğü en az `enDusukDpi` olmalı. Tarayıcıda kullanıcıya hızlı geri bildirim
 * içindir; sunucuya yükleme eklenince aynı kural sunucuda da uygulanır.
 */
export function fotografDegerlendir(
  c: Cerceve,
  dosya: { type: string; size: number },
  genislik: number,
  yukseklik: number,
): YuklemeSonucu {
  const bos = { genislik, yukseklik, dpi: 0 };
  if (!IZINLI_TURLER.includes(dosya.type)) {
    return { ...bos, uygun: false, mesaj: 'Yalnız JPG, PNG veya WebP fotoğraf yüklenebilir.' };
  }
  if (dosya.size > EN_BUYUK_DOSYA_MB * 1024 * 1024) {
    return { ...bos, uygun: false, mesaj: `Dosya en çok ${EN_BUYUK_DOSYA_MB} MB olabilir.` };
  }
  const ic = baskiOlcu(c);
  const cerceveOran = ic.en / ic.boy;
  const fotoOran = genislik / yukseklik;
  const sapma = Math.abs(fotoOran - cerceveOran) / cerceveOran;
  if (sapma > ORAN_SAPMASI) {
    const yon = fotoOran > cerceveOran ? 'yatay' : 'dikey';
    return {
      ...bos,
      uygun: false,
      mesaj: `Tasarım bu çerçeve için çok ${yon}. Baskı alanı ${ic.en}×${ic.boy} cm; benzer oranda bir tasarım seçin.`,
    };
  }
  // Çerçeveyi dolduran (kırpılmış) bölgenin piksel boyu
  const kesGenislik = fotoOran > cerceveOran ? yukseklik * cerceveOran : genislik;
  const kesYukseklik = fotoOran > cerceveOran ? yukseklik : genislik / cerceveOran;
  const dpi = Math.round(kesGenislik / (ic.en / 2.54));
  const gerek = gerekenPiksel(c, c.enDusukDpi);
  if (kesGenislik < gerek.en || kesYukseklik < gerek.boy) {
    const onerilen = gerekenPiksel(c, c.onerilenDpi);
    return {
      ...bos,
      dpi,
      uygun: false,
      mesaj: `Çözünürlük düşük (${Math.round(kesGenislik)}×${Math.round(kesYukseklik)} px). En az ${gerek.en}×${gerek.boy} px gerekir; ${onerilen.en}×${onerilen.boy} px önerilir.`,
    };
  }
  return { ...bos, dpi, uygun: true, mesaj: `Uygun · ${genislik}×${yukseklik} px · yaklaşık ${dpi} dpi` };
}
