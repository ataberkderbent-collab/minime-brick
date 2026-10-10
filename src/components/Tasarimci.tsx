'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import {
  CERCEVELER,
  CERCEVE_RENKLERI,
  HAYVANLAR,
  KARTLAR,
  KATEGORI_ADLARI,
  SABLONLAR,
  type Cinsiyet,
  type CerceveId,
  type CerceveRengiId,
  type FigurSecimi,
  type KartId,
  type KisiSecimi,
  type ParcaKategori,
  type Sablon,
  baskiOlcu,
  bosKisi,
  cerceveBul,
  eksikler,
  enFazlaFigur,
  figurAdi,
  gerekenPiksel,
  hayvanBul,
  kodSatiri,
  kullanimSayilari,
  parcaBul,
  parcaListesi,
  stokBul,
} from '@/lib/katalog';
import { fotografDegerlendir, type YuklemeSonucu } from '@/lib/yukleme';
import { kartOnizleme } from './arkaplan';
import type { Kart } from './Sahne';

// 3B kısım yalnız tarayıcıda çalışır (WebGL)
const Sahne = dynamic(() => import('./Sahne'), { ssr: false, loading: () => <div className="sahne-yukleniyor">3B sahne hazırlanıyor…</div> });
const Inceleme = dynamic(() => import('./Inceleme'), { ssr: false });

interface Yuklenen {
  ad: string;
  tip: string;
  boyut: number;
  genislik: number;
  yukseklik: number;
  url: string;
}

const KATEGORILER: ParcaKategori[] = ['yuz', 'sac', 'ust', 'alt', 'aksesuar'];
const CINSIYETLER: { id: Cinsiyet | 'kopek' | 'kedi'; ad: string }[] = [
  { id: 'kadin', ad: 'Kadın' },
  { id: 'erkek', ad: 'Erkek' },
  { id: 'cocuk', ad: 'Çocuk' },
  { id: 'kopek', ad: 'Köpek' },
  { id: 'kedi', ad: 'Kedi' },
];

const kopyala = (f: FigurSecimi): FigurSecimi => ({ ...f });

function rastgeleSec<T>(liste: T[]): T | null {
  return liste.length ? liste[Math.floor(Math.random() * liste.length)] : null;
}

export default function Tasarimci({ disSablon }: { disSablon?: { s: Sablon; n: number } | null }) {
  const baslangic = SABLONLAR[0];
  const [cerceveId, setCerceveId] = useState<CerceveId>(baslangic.cerceve);
  const [cerceveRengi, setCerceveRengi] = useState<CerceveRengiId>(baslangic.cerceveRengi);
  const [figurler, setFigurler] = useState<FigurSecimi[]>(baslangic.figurler.map(kopyala));
  const [seciliSlot, setSeciliSlot] = useState<number>(0);
  const [kategori, setKategori] = useState<ParcaKategori>('yuz');
  const [kartId, setKartId] = useState<KartId>(baslangic.kart);
  const [baslik, setBaslik] = useState(baslangic.baslik);
  const [altYazi, setAltYazi] = useState(baslangic.altYazi);
  const [yuklenen, setYuklenen] = useState<Yuklenen | null>(null);
  const [yuklenenKullan, setYuklenenKullan] = useState(false);
  const [yuklemeHatasi, setYuklemeHatasi] = useState<string | null>(null);
  const [cam, setCam] = useState(true);
  const [incele, setIncele] = useState<number | null>(null);
  const [kopyalandi, setKopyalandi] = useState(false);
  const [kartOnizlemeleri, setKartOnizlemeleri] = useState<Partial<Record<KartId, string>>>({});
  const dosyaGirdisi = useRef<HTMLInputElement>(null);

  const cerceve = cerceveBul(cerceveId);
  const enFazla = enFazlaFigur(cerceve);
  const baski = baskiOlcu(cerceve);
  const adet = figurler.length;
  const secili: FigurSecimi | undefined = figurler[seciliSlot];

  useEffect(() => {
    const o: Partial<Record<KartId, string>> = {};
    KARTLAR.forEach((k) => (o[k.id] = kartOnizleme(k.id)));
    setKartOnizlemeleri(o);
  }, []);

  const yuklemeSonucu: YuklemeSonucu | null = useMemo(
    () => (yuklenen ? fotografDegerlendir(cerceve, { type: yuklenen.tip, size: yuklenen.boyut }, yuklenen.genislik, yuklenen.yukseklik) : null),
    [yuklenen, cerceve],
  );
  const yuklenenGecerli = !!(yuklenen && yuklemeSonucu?.uygun && yuklenenKullan);
  const kart: Kart = yuklenenGecerli && yuklenen ? { tur: 'yukle', url: yuklenen.url, ad: yuklenen.ad } : { tur: 'hazir', id: kartId, baslik, altYazi };

  const kullanim = useMemo(() => kullanimSayilari(figurler), [figurler]);

  /** Bir parçadan, seçili figür dışında kaç adet kaldı */
  const kalan = (kod: string, mevcutKullanim: number) => stokBul(kod) - ((kullanim[kod] ?? 0) - mevcutKullanim);

  const guncelle = (i: number, yeni: FigurSecimi) => setFigurler((l) => l.map((f, k) => (k === i ? yeni : f)));

  const rastgeleKisi = useCallback(
    (cinsiyet: Cinsiyet, onceki?: KisiSecimi): KisiSecimi => {
      const bos = onceki ? { ...bosKisi(cinsiyet), isim: onceki.isim } : bosKisi(cinsiyet);
      const sec = (kat: ParcaKategori) => rastgeleSec(parcaListesi(kat, cinsiyet).filter((p) => p.stok > 0))?.kod ?? null;
      return { ...bos, yuz: sec('yuz'), sac: sec('sac'), ust: sec('ust'), alt: sec('alt') };
    },
    [],
  );

  const cerceveSec = (id: CerceveId) => {
    const sinir = enFazlaFigur(cerceveBul(id));
    setCerceveId(id);
    setFigurler((l) => l.slice(0, sinir));
    setSeciliSlot((i) => Math.min(i, sinir - 1));
    setYuklenenKullan((k) => k);
  };

  const adetDegistir = (yeni: number) => {
    const sinirli = Math.max(1, Math.min(enFazla, yeni));
    setFigurler((l) => (sinirli <= l.length ? l.slice(0, sinirli) : [...l, ...Array.from({ length: sinirli - l.length }, () => rastgeleKisi('kadin'))]));
    setSeciliSlot((i) => (yeni > adet ? sinirli - 1 : Math.min(i, sinirli - 1)));
  };

  const turDegistir = (id: Cinsiyet | 'kopek' | 'kedi') => {
    if (!secili) return;
    if (id === 'kopek' || id === 'kedi') {
      const ilk = HAYVANLAR.find((h) => h.tur === id && h.stok > 0)?.id ?? null;
      guncelle(seciliSlot, { tur: 'hayvan', hayvan: ilk, isim: secili.isim });
      return;
    }
    if (secili.tur === 'kisi' && secili.cinsiyet === id) return;
    const onceki = secili.tur === 'kisi' ? secili : undefined;
    const yeni = rastgeleKisi(id, onceki);
    if (onceki) {
      // ayakkabı gibi cinsiyetten bağımsız parçalar korunur
      yeni.ust = onceki.ust ?? yeni.ust;
      yeni.alt = onceki.alt ?? yeni.alt;
      yeni.aksesuar = onceki.aksesuar;
    }
    guncelle(seciliSlot, yeni);
  };

  const parcaSec = (kod: string) => {
    if (!secili || secili.tur !== 'kisi') return;
    const alan = kategori;
    const yeniDeger = secili[alan] === kod && (alan === 'sac' || alan === 'aksesuar') ? null : kod;
    guncelle(seciliSlot, { ...secili, [alan]: yeniDeger });
  };

  const sablonUygula = (s: Sablon) => {
    setCerceveId(s.cerceve);
    setCerceveRengi(s.cerceveRengi);
    setFigurler(s.figurler.map(kopyala));
    setSeciliSlot(0);
    setKartId(s.kart);
    setBaslik(s.baslik);
    setAltYazi(s.altYazi);
    setYuklenenKullan(false);
  };

  const dosyaSecildi = useCallback((dosya: File | undefined) => {
    if (!dosya) return;
    setYuklemeHatasi(null);
    const url = URL.createObjectURL(dosya);
    const img = new window.Image();
    img.onload = () => {
      setYuklenen((onceki) => {
        if (onceki) URL.revokeObjectURL(onceki.url);
        return { ad: dosya.name, tip: dosya.type, boyut: dosya.size, genislik: img.naturalWidth, yukseklik: img.naturalHeight, url };
      });
      setYuklenenKullan(true);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setYuklemeHatasi('Bu dosya fotoğraf olarak açılamadı.');
    };
    img.src = url;
  }, []);

  const yuklenenKaldir = () => {
    if (yuklenen) URL.revokeObjectURL(yuklenen.url);
    setYuklenen(null);
    setYuklenenKullan(false);
    setYuklemeHatasi(null);
    if (dosyaGirdisi.current) dosyaGirdisi.current.value = '';
  };

  useEffect(() => {
    if (disSablon) {
      sablonUygula(disSablon.s);
      document.getElementById('tasarla')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disSablon?.n]);

  const siparisMetni = () =>
    [
      `Çerçeve: ${cerceve.ad} (${cerceve.disEn}×${cerceve.disBoy} cm) · ${CERCEVE_RENKLERI.find((r) => r.id === cerceveRengi)?.ad}`,
      `Baskı: ${kart.tur === 'yukle' ? `Yüklenen tasarım (${kart.ad})` : KARTLAR.find((k) => k.id === kart.id)?.ad}${kart.tur === 'hazir' && baslik ? ` · "${baslik}"` : ''}`,
      ...figurler.map((f, i) => `${i + 1}. ${figurAdi(f)}${f.isim ? ` (${f.isim})` : ''}: ${kodSatiri(f)}`),
    ].join('\n');

  const kopyalaSiparis = async () => {
    try {
      await navigator.clipboard.writeText(siparisMetni());
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2200);
    } catch {
      setKopyalandi(false);
    }
  };

  const gerekenEnDusuk = gerekenPiksel(cerceve, cerceve.enDusukDpi);
  const gerekenOnerilen = gerekenPiksel(cerceve, cerceve.onerilenDpi);
  const eksikFigurSayisi = figurler.filter((f) => eksikler(f).length > 0).length;
  const aktifTur: Cinsiyet | 'kopek' | 'kedi' | null = !secili ? null : secili.tur === 'kisi' ? secili.cinsiyet : (hayvanBul(secili.hayvan)?.tur ?? 'kopek');
  const incelenen = incele !== null ? figurler[incele] : undefined;

  return (
    <section className="tasarimci" id="tasarla" aria-label="Çerçeve tasarım aracı">
      <div className="tasarimci-bas">
        <div>
          <p className="goz">Tasarım aracı</p>
          <h2>
            Kendi çerçeveni <em>kur.</em>
          </h2>
        </div>
        <p>Soldaki sahnede gördüğün, sipariş edeceğin şey. Sürükle, çevir, figüre dokun.</p>
      </div>
      <div className="ana">
        <div className="sahne-alani" aria-label="3B önizleme">
          <Sahne
            className="sahne"
            cerceve={cerceve}
            cerceveRengi={cerceveRengi}
            kart={kart}
            figurler={figurler}
            seciliSlot={seciliSlot}
            cam={cam}
            onSlot={setSeciliSlot}
            onFigur={setIncele}
          />
          <div className="sahne-ipucu" aria-hidden>
            <span>Sürükle: çerçeveyi çevir</span>
            <span>Figüre dokun: 360° incele</span>
          </div>
          <label className="cam-anahtar">
            <input type="checkbox" checked={cam} onChange={(e) => setCam(e.target.checked)} /> Ön cam
          </label>
        </div>

        <div className="panel">
          <motion.section className="adim" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}>
            <h3>
              <span className="no">0</span>Hazır şablonla başla <small>(isteğe bağlı)</small>
            </h3>
            <div className="sablonlar">
              {SABLONLAR.map((s) => (
                <button key={s.id} type="button" className="sablon" onClick={() => sablonUygula(s)}>
                  <strong>{s.ad}</strong>
                  <span>{s.aciklama}</span>
                  <em>
                    {cerceveBul(s.cerceve).ad} çerçeve · {s.figurler.length} figür
                  </em>
                </button>
              ))}
            </div>
          </motion.section>

          <section className="adim">
            <h3>
              <span className="no">1</span>Çerçeve
            </h3>
            <div className="secenekler uc" role="radiogroup" aria-label="Çerçeve boyutu">
              {CERCEVELER.map((c) => (
                <button key={c.id} type="button" role="radio" aria-checked={c.id === cerceveId} className={`secenek${c.id === cerceveId ? ' secili' : ''}`} onClick={() => cerceveSec(c.id)}>
                  <strong>{c.ad}</strong>
                  <span>
                    {c.disEn}×{c.disBoy} cm
                  </span>
                  <em>en çok {enFazlaFigur(c)} figür</em>
                </button>
              ))}
            </div>
            <div className="renkler" role="radiogroup" aria-label="Çerçeve rengi">
              {CERCEVE_RENKLERI.map((r) => (
                <button key={r.id} type="button" role="radio" aria-checked={r.id === cerceveRengi} className={`renk-secim${r.id === cerceveRengi ? ' secili' : ''}`} onClick={() => setCerceveRengi(r.id)}>
                  <i style={{ background: r.renk }} aria-hidden />
                  {r.ad}
                </button>
              ))}
            </div>
          </section>

          <section className="adim">
            <h3>
              <span className="no">2</span>Figürler
            </h3>
            <div className="sayac">
              <button type="button" onClick={() => adetDegistir(adet - 1)} disabled={adet <= 1} aria-label="Bir figür azalt">
                −
              </button>
              <output aria-live="polite">{adet}</output>
              <button type="button" onClick={() => adetDegistir(adet + 1)} disabled={adet >= enFazla} aria-label="Bir figür artır">
                +
              </button>
              <span className="not">Bu çerçevede en çok {enFazla} figür durur.</span>
            </div>

            <LayoutGroup id="slotlar">
              <div className="slotlar" role="tablist" aria-label="Figürler">
                {figurler.map((f, i) => (
                  <button key={i} type="button" role="tab" aria-selected={seciliSlot === i} className={`slot${seciliSlot === i ? ' secili' : ''}${eksikler(f).length ? ' eksik' : ''}`} onClick={() => setSeciliSlot(i)}>
                    {seciliSlot === i && <motion.span layoutId="slot-secim" className="slot-zemin" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
                    <b>{i + 1}</b>
                    <span>{f.isim.trim() || figurAdi(f)}</span>
                  </button>
                ))}
              </div>
            </LayoutGroup>

            {secili && (
              <div className="figur-duzenle">
                <div className="turler" role="radiogroup" aria-label="Figür türü">
                  {CINSIYETLER.map((c) => (
                    <button key={c.id} type="button" role="radio" aria-checked={aktifTur === c.id} className={`tur${aktifTur === c.id ? ' secili' : ''}`} onClick={() => turDegistir(c.id)}>
                      {c.ad}
                    </button>
                  ))}
                </div>

                <label className="isim-kutu">
                  <span>Figürün altına yazılacak isim</span>
                  <input type="text" maxLength={16} value={secili.isim} placeholder="İsteğe bağlı" onChange={(e) => guncelle(seciliSlot, { ...secili, isim: e.target.value })} />
                </label>

                {secili.tur === 'kisi' ? (
                  <>
                    <div className="kategoriler" role="tablist" aria-label="Parça türü">
                      {KATEGORILER.map((k) => (
                        <button key={k} type="button" role="tab" aria-selected={kategori === k} className={`kategori${kategori === k ? ' secili' : ''}`} onClick={() => setKategori(k)}>
                          {kategori === k && <motion.span layoutId="kategori-secim" className="kategori-zemin" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
                          <span>{KATEGORI_ADLARI[k]}</span>
                          {!secili[k] && (k === 'yuz' || k === 'ust' || k === 'alt') && <i className="eksik-nokta" aria-label="seçilmedi" />}
                        </button>
                      ))}
                    </div>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div key={`${seciliSlot}-${kategori}-${secili.cinsiyet}`} className="parca-izgara" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
                        {parcaListesi(kategori, secili.cinsiyet).map((p) => {
                          const buSecili = secili[kategori] === p.kod;
                          const kalanAdet = kalan(p.kod, buSecili ? 1 : 0);
                          const tukendi = kalanAdet <= 0 && !buSecili;
                          return (
                            <button key={p.kod} type="button" className={`parca${buSecili ? ' secili' : ''}${tukendi ? ' tukendi' : ''}`} disabled={tukendi} onClick={() => parcaSec(p.kod)} aria-pressed={buSecili} title={tukendi ? `${p.kod} · stokta yok` : p.kod}>
                              <Image src={p.gorsel} alt="" width={p.en} height={p.boy} unoptimized loading="lazy" />
                              <span>{p.kod}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    </AnimatePresence>
                    <p className="not">
                      {kategori === 'sac' || kategori === 'aksesuar' ? 'Aynı parçaya yeniden basınca çıkar. ' : ''}
                      Üstü çizili parçalar stokta yok.
                    </p>
                    <button type="button" className="ikincil" onClick={() => guncelle(seciliSlot, rastgeleKisi(secili.cinsiyet, secili))}>
                      Rastgele figür oluştur
                    </button>
                  </>
                ) : (
                  <div className="hayvan-izgara">
                    {HAYVANLAR.filter((h) => h.tur === aktifTur).map((h) => {
                      const buSecili = secili.hayvan === h.id;
                      const tukendi = kalan(h.id, buSecili ? 1 : 0) <= 0 && !buSecili;
                      return (
                        <button key={h.id} type="button" className={`hayvan${buSecili ? ' secili' : ''}`} disabled={tukendi} onClick={() => guncelle(seciliSlot, { ...secili, hayvan: h.id })}>
                          <i style={{ background: h.renk.govde }} aria-hidden />
                          {h.ad.split(' · ')[1]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="adim">
            <h3>
              <span className="no">3</span>Baskılı kart
            </h3>
            <div className="kart-izgara">
              {KARTLAR.map((k) => {
                const sec = !yuklenenGecerli && kartId === k.id;
                return (
                  <button
                    key={k.id}
                    type="button"
                    className={`kart-secim${sec ? ' secili' : ''}`}
                    onClick={() => {
                      setKartId(k.id);
                      setYuklenenKullan(false);
                    }}
                  >
                    <span className="onizleme" style={kartOnizlemeleri[k.id] ? { backgroundImage: `url(${kartOnizlemeleri[k.id]})` } : undefined} />
                    {k.ad}
                  </button>
                );
              })}
            </div>

            {!yuklenenGecerli && (
              <div className="yazilar">
                <label className="isim-kutu">
                  <span>Başlık</span>
                  <input type="text" maxLength={40} value={baslik} placeholder="Ör. Mr. & Mrs." onChange={(e) => setBaslik(e.target.value)} />
                </label>
                <label className="isim-kutu">
                  <span>Alt yazı</span>
                  <input type="text" maxLength={70} value={altYazi} placeholder="Ör. 17 years and counting" onChange={(e) => setAltYazi(e.target.value)} />
                </label>
              </div>
            )}

            <div className="yukle">
              <strong>Ya da kendi tasarımını yükle</strong>
              <p className="not">
                {cerceve.ad} çerçevede baskı alanı {baski.en}×{baski.boy} cm. En az <b>{gerekenEnDusuk.en}×{gerekenEnDusuk.boy} px</b> gerekir; <b>{gerekenOnerilen.en}×{gerekenOnerilen.boy} px</b> önerilir. JPG, PNG ya da WebP. Yüklenen tasarıma başlık ve isim yazılmaz; hazır olmalı.
              </p>
              <input ref={dosyaGirdisi} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => dosyaSecildi(e.target.files?.[0])} aria-label="Tasarım dosyası" />
              {yuklemeHatasi && <p className="durum hata">{yuklemeHatasi}</p>}
              {yuklenen && yuklemeSonucu && (
                <div className={`durum ${yuklemeSonucu.uygun ? 'tamam' : 'hata'}`}>
                  <b>{yuklenen.ad}</b>
                  <span>{yuklemeSonucu.mesaj}</span>
                  <button type="button" onClick={yuklenenKaldir}>
                    Kaldır
                  </button>
                </div>
              )}
              {yuklenen && yuklemeSonucu?.uygun && !yuklenenKullan && (
                <button type="button" className="ikincil" onClick={() => setYuklenenKullan(true)}>
                  Yüklediğim tasarımı kullan
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="alt-cubuk" role="region" aria-label="Sipariş özeti">
        <div className="alt-icerik">
          <div className="ozet-metin">
            <strong>
              {cerceve.ad} çerçeve · {CERCEVE_RENKLERI.find((r) => r.id === cerceveRengi)?.ad} · {adet} figür
            </strong>
            <span>{eksikFigurSayisi ? `${eksikFigurSayisi} figürün yüz, üst ya da alt parçası seçilmedi.` : figurler.map((f, i) => `${i + 1}: ${kodSatiri(f)}`).join('   ')}</span>
          </div>
          <div className="alt-dugmeler">
            <button type="button" className="ikincil" onClick={kopyalaSiparis}>
              {kopyalandi ? 'Kopyalandı ✓' : 'Parça listesini kopyala'}
            </button>
            <button type="button" className="birincil" disabled title="Sipariş adımı yakında">
              Siparişe devam et · yakında
            </button>
          </div>
        </div>
      </div>

      {incelenen && <Inceleme figur={incelenen} onKapat={() => setIncele(null)} />}
    </section>
  );
}
