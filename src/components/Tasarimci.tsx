'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ARKA_PLANLAR,
  CERCEVELER,
  FIGURLER,
  SABLONLAR,
  type ArkaPlanId,
  type CerceveId,
  type Sablon,
  cerceveBul,
  enFazlaFigur,
  figurBul,
  gerekenPiksel,
  icOlcu,
} from '@/lib/katalog';
import { fotografDegerlendir, type YuklemeSonucu } from '@/lib/yukleme';
import { arkaPlanOnizleme } from './arkaplan';
import type { ArkaPlan } from './Sahne';

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

function slotlariAyarla(slotlar: (string | null)[], adet: number): (string | null)[] {
  return Array.from({ length: adet }, (_, i) => slotlar[i] ?? null);
}

export default function Tasarimci() {
  const [cerceveId, setCerceveId] = useState<CerceveId>('orta');
  const [slotlar, setSlotlar] = useState<(string | null)[]>(['erkek-mavi', 'kadin-pembe', 'kopek']);
  const [seciliSlot, setSeciliSlot] = useState<number | null>(0);
  const [hazirArkaPlan, setHazirArkaPlan] = useState<ArkaPlanId>('gunbatimi');
  const [yuklenen, setYuklenen] = useState<Yuklenen | null>(null);
  const [yuklenenKullan, setYuklenenKullan] = useState(false);
  const [yuklemeHatasi, setYuklemeHatasi] = useState<string | null>(null);
  const [cam, setCam] = useState(true);
  const [incele, setIncele] = useState<string | null>(null);
  const [onizlemeler, setOnizlemeler] = useState<Partial<Record<ArkaPlanId, string>>>({});
  const dosyaGirdisi = useRef<HTMLInputElement>(null);

  const cerceve = cerceveBul(cerceveId);
  const enFazla = enFazlaFigur(cerceve);
  const ic = icOlcu(cerceve);
  const adet = slotlar.length;

  useEffect(() => {
    const o: Partial<Record<ArkaPlanId, string>> = {};
    ARKA_PLANLAR.forEach((a) => (o[a.id] = arkaPlanOnizleme(a.id)));
    setOnizlemeler(o);
  }, []);

  // Yüklenen fotoğraf seçili çerçeveye göre her seferinde yeniden değerlendirilir
  const yuklemeSonucu: YuklemeSonucu | null = useMemo(
    () => (yuklenen ? fotografDegerlendir(cerceve, { type: yuklenen.tip, size: yuklenen.boyut }, yuklenen.genislik, yuklenen.yukseklik) : null),
    [yuklenen, cerceve],
  );

  const yuklenenGecerli = !!(yuklenen && yuklemeSonucu?.uygun && yuklenenKullan);
  const arkaPlan: ArkaPlan = yuklenenGecerli && yuklenen ? { tur: 'yukle', url: yuklenen.url, ad: yuklenen.ad } : { tur: 'hazir', id: hazirArkaPlan };

  const kullanilan = useMemo(() => {
    const s: Record<string, number> = {};
    slotlar.forEach((id) => id && (s[id] = (s[id] ?? 0) + 1));
    return s;
  }, [slotlar]);

  const cerceveSec = (id: CerceveId) => {
    const yeni = cerceveBul(id);
    setCerceveId(id);
    setSlotlar((s) => slotlariAyarla(s, Math.min(s.length, enFazlaFigur(yeni))));
    setSeciliSlot((i) => (i !== null ? Math.min(i, enFazlaFigur(yeni) - 1) : i));
  };

  const adetDegistir = (yeni: number) => {
    const sinirli = Math.max(1, Math.min(enFazla, yeni));
    setSlotlar((s) => slotlariAyarla(s, sinirli));
    setSeciliSlot((i) => (i === null ? null : Math.min(i, sinirli - 1)));
  };

  const figurSec = (id: string) => {
    if (seciliSlot === null) return;
    setSlotlar((s) => s.map((v, i) => (i === seciliSlot ? (v === id ? null : id) : v)));
  };

  const sablonUygula = (s: Sablon) => {
    setCerceveId(s.cerceve);
    setSlotlar(s.figurler.slice(0, enFazlaFigur(cerceveBul(s.cerceve))));
    setSeciliSlot(0);
    setHazirArkaPlan(s.arkaPlan);
    setYuklenenKullan(false);
  };

  const dosyaSecildi = useCallback(
    (dosya: File | undefined) => {
      if (!dosya) return;
      setYuklemeHatasi(null);
      const url = URL.createObjectURL(dosya);
      const img = new Image();
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
    },
    [],
  );

  const yuklenenKaldir = () => {
    if (yuklenen) URL.revokeObjectURL(yuklenen.url);
    setYuklenen(null);
    setYuklenenKullan(false);
    setYuklemeHatasi(null);
    if (dosyaGirdisi.current) dosyaGirdisi.current.value = '';
  };

  const incelenenFigur = incele ? figurBul(incele) : undefined;
  const gerekenEnDusuk = gerekenPiksel(cerceve, cerceve.enDusukDpi);
  const gerekenOnerilen = gerekenPiksel(cerceve, cerceve.onerilenDpi);
  const bosSlot = slotlar.filter((s) => !s).length;

  return (
    <div className="uygulama">
      <header className="ust">
        <div className="marka">
          <span className="marka-tugla" aria-hidden />
          <span>
            Minime<b>Brick</b>
          </span>
        </div>
        <p>Çerçeveni, figürlerini ve arka tasarımını seç; 3B olarak gör.</p>
      </header>

      <main className="ana">
        <section className="sahne-alani" aria-label="3B önizleme">
          <Sahne
            className="sahne"
            cerceve={cerceve}
            arkaPlan={arkaPlan}
            slotlar={slotlar}
            seciliSlot={seciliSlot}
            cam={cam}
            onSlot={setSeciliSlot}
            onFigur={setIncele}
          />
          <div className="sahne-ipucu">
            <span>Sürükle: çerçeveyi çevir</span>
            <span>Figüre dokun: 360° incele</span>
            <span>Halkaya dokun: yer seç</span>
          </div>
          <label className="cam-anahtar">
            <input type="checkbox" checked={cam} onChange={(e) => setCam(e.target.checked)} /> Ön cam
          </label>
        </section>

        <aside className="panel">
          <section className="adim">
            <h2>
              <span className="no">0</span>Hazır şablonla başla <small>(isteğe bağlı)</small>
            </h2>
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
          </section>

          <section className="adim">
            <h2>
              <span className="no">1</span>Çerçeve boyutu
            </h2>
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
          </section>

          <section className="adim">
            <h2>
              <span className="no">2</span>Figür sayısı
            </h2>
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
          </section>

          <section className="adim">
            <h2>
              <span className="no">3</span>Figürler
            </h2>
            <div className="slotlar" role="tablist" aria-label="Figür yerleri">
              {slotlar.map((id, i) => (
                <button key={i} type="button" role="tab" aria-selected={seciliSlot === i} className={`slot${seciliSlot === i ? ' secili' : ''}${id ? '' : ' bos'}`} onClick={() => setSeciliSlot(i)}>
                  <b>{i + 1}</b>
                  {id ? figurBul(id)?.ad : 'Boş'}
                </button>
              ))}
            </div>
            <p className="not">{seciliSlot === null ? 'Önce bir yer seçin.' : `${seciliSlot + 1}. yer için bir figür seçin; aynı figüre yeniden basınca çıkar.`}</p>
            <div className="figur-izgara">
              {FIGURLER.map((f) => {
                const buYerde = seciliSlot !== null && slotlar[seciliSlot] === f.id;
                const kalan = f.stok - (kullanilan[f.id] ?? 0);
                const tukendi = kalan <= 0 && !buYerde;
                return (
                  <button key={f.id} type="button" className={`figur${buYerde ? ' secili' : ''}`} disabled={tukendi || seciliSlot === null} onClick={() => figurSec(f.id)}>
                    <i className="renk" style={{ background: f.renk.govde }} aria-hidden />
                    <strong>{f.ad}</strong>
                    <span>{tukendi ? 'Tükendi' : kalan <= 3 ? `Son ${kalan} adet` : 'Stokta'}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="adim">
            <h2>
              <span className="no">4</span>Arka tasarım
            </h2>
            <div className="arka-izgara">
              {ARKA_PLANLAR.map((a) => {
                const secili = !yuklenenGecerli && hazirArkaPlan === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    className={`arka${secili ? ' secili' : ''}`}
                    onClick={() => {
                      setHazirArkaPlan(a.id);
                      setYuklenenKullan(false);
                    }}
                  >
                    <span className="onizleme" style={onizlemeler[a.id] ? { backgroundImage: `url(${onizlemeler[a.id]})` } : undefined} />
                    {a.ad}
                  </button>
                );
              })}
            </div>

            <div className="yukle">
              <strong>Kendi fotoğrafını yükle</strong>
              <p className="not">
                {cerceve.ad} çerçeve için baskı alanı {ic.en}×{ic.boy} cm. En az <b>{gerekenEnDusuk.en}×{gerekenEnDusuk.boy} px</b> gerekir; <b>{gerekenOnerilen.en}×{gerekenOnerilen.boy} px</b> önerilir. JPG, PNG ya da WebP.
              </p>
              <input ref={dosyaGirdisi} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => dosyaSecildi(e.target.files?.[0])} />
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
                  Yüklediğim fotoğrafı kullan
                </button>
              )}
            </div>
          </section>

          <section className="ozet">
            <h2>Özet</h2>
            <dl>
              <dt>Çerçeve</dt>
              <dd>
                {cerceve.ad} · {cerceve.disEn}×{cerceve.disBoy} cm
              </dd>
              <dt>Figürler</dt>
              <dd>{slotlar.filter(Boolean).map((id) => figurBul(id!)?.ad).join(', ') || 'Henüz seçilmedi'}</dd>
              <dt>Arka tasarım</dt>
              <dd>{arkaPlan.tur === 'yukle' ? `Fotoğrafım (${arkaPlan.ad})` : ARKA_PLANLAR.find((a) => a.id === arkaPlan.id)?.ad}</dd>
            </dl>
            {bosSlot > 0 && <p className="durum uyari">{bosSlot} yer boş; boş yerler çerçevede figürsüz kalır.</p>}
          </section>
        </aside>
      </main>

      {incelenenFigur && <Inceleme figur={incelenenFigur} onKapat={() => setIncele(null)} />}
    </div>
  );
}
